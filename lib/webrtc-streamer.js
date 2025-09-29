import { io } from 'socket.io-client';
import Peer from 'simple-peer';

class WebRTCStreamer {
  constructor() {
    this.socket = null;
    this.peer = null;
    this.mediaStream = null;
    this.streamId = null;
    this.streamKey = null;
    this.isStreaming = false;
    this.viewerCount = 0;
    this.viewerPeers = new Map(); // viewerId -> Peer instance
    this.onViewerCountChange = null;
    this.onStreamStart = null;
    this.onStreamEnd = null;
    this.onError = null;
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      const serverUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';
      console.log(`🔌 Connecting to WebRTC server: ${serverUrl}`);
      
      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        withCredentials: true,
        timeout: 15000,
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 10,
        forceNew: true
      });

      const connectionTimeout = setTimeout(() => {
        if (!this.socket.connected) {
          console.error('❌ Connection timeout after 15 seconds');
          reject(new Error('Connection timeout'));
        }
      }, 15000);

      this.socket.on('connect', () => {
        clearTimeout(connectionTimeout);
        console.log('✅ WebRTC Streamer connected to server');
        console.log('Socket ID:', this.socket.id);
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        clearTimeout(connectionTimeout);
        console.error('❌ WebRTC Streamer connection error:', error);
        console.error('Make sure the backend server is running on port 5000');
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 WebRTC Streamer disconnected:', reason);
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 WebRTC Streamer reconnected after', attemptNumber, 'attempts');
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('❌ WebRTC Streamer reconnection error:', error);
      });

      this.socket.on('webrtc-stream-started', (data) => {
        console.log('✅ WebRTC stream started:', data);
        this.isStreaming = true;
        if (this.onStreamStart) {
          this.onStreamStart(data);
        }
      });

      this.socket.on('stream-start-error', (data) => {
        console.error('❌ Stream start error:', data);
        if (this.onError) {
          this.onError(data.message);
        }
      });

      this.socket.on('viewer-joined', async (data) => {
        console.log(`👁️ Viewer joined: ${data.viewerId}, Count: ${data.viewerCount}`);
        this.viewerCount = data.viewerCount;
        if (this.onViewerCountChange) {
          this.onViewerCountChange(this.viewerCount);
        }

        // Send WebRTC offer to the new viewer
        if (this.mediaStream && this.isStreaming) {
          console.log(`📡 Sending WebRTC offer to new viewer: ${data.viewerId}`);
          
          // Create peer connection for this viewer
          const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: this.mediaStream
          });

          this.viewerPeers.set(data.viewerId, peer);

          peer.on('signal', (offer) => {
            this.socket.emit('webrtc-offer', {
              streamId: this.streamId,
              offer: offer,
              targetId: data.viewerId
            });
          });

          peer.on('connect', () => {
            console.log(`✅ Peer connected to viewer: ${data.viewerId}`);
          });

          peer.on('close', () => {
            console.log(`🔌 Peer disconnected from viewer: ${data.viewerId}`);
            this.viewerPeers.delete(data.viewerId);
          });

          peer.on('error', (err) => {
            console.error(`❌ Peer error with viewer ${data.viewerId}:`, err);
            this.viewerPeers.delete(data.viewerId);
          });
        }
      });

      this.socket.on('viewer-left', (data) => {
        console.log(`👋 Viewer left: ${data.viewerId}, Count: ${data.viewerCount}`);
        this.viewerCount = data.viewerCount;
        if (this.onViewerCountChange) {
          this.onViewerCountChange(this.viewerCount);
        }
      });

      // Handle WebRTC answers from viewers
      this.socket.on('webrtc-answer', (data) => {
        const { answer, fromId } = data;
        const peer = this.viewerPeers.get(fromId);
        if (peer) {
          peer.signal(answer);
        }
      });

      this.socket.on('webrtc-ice-candidate', (data) => {
        const { candidate, fromId } = data;
        const peer = this.viewerPeers.get(fromId);
        if (peer) {
          peer.signal(candidate);
        }
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 WebRTC Streamer disconnected from server');
        this.stopStream();
      });
    });
  }

  async startStream(streamId, streamKey, title, description) {
    try {
      console.log(`🎥 Starting WebRTC stream: ${streamId}`);
      
      // Get user media (camera and microphone)
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });

      this.streamId = streamId;
      this.streamKey = streamKey;
      this.isStreaming = true;

      // Notify server that we're starting a stream
      this.socket.emit('start-webrtc-stream', {
        streamId: streamId,
        streamKey: streamKey,
        title: title,
        description: description
      });

      console.log(`🎥 WebRTC stream started: ${streamId}`);
      return { 
        success: true, 
        stream: this.mediaStream,
        streamId: streamId,
        streamKey: streamKey
      };

    } catch (error) {
      console.error('❌ Error starting WebRTC stream:', error);
      this.isStreaming = false;
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  async stopStream() {
    if (this.isStreaming) {
      console.log(`🛑 Stopping WebRTC stream: ${this.streamId}`);
      
      // Notify server that we're ending the stream
      this.socket.emit('end-webrtc-stream', {
        streamId: this.streamId,
        streamKey: this.streamKey
      });

      // Stop all media tracks
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.mediaStream = null;
      }

      // Destroy all peer connections
      this.viewerPeers.forEach(peer => peer.destroy());
      this.viewerPeers.clear();

      this.isStreaming = false;
      this.streamId = null;
      this.streamKey = null;
      this.viewerCount = 0;

      if (this.onStreamEnd) {
        this.onStreamEnd();
      }

      console.log('🛑 WebRTC stream stopped');
    }
  }

  getViewerCount() {
    return this.viewerCount;
  }

  getMediaStream() {
    return this.mediaStream;
  }

  isStreamActive() {
    return this.isStreaming;
  }

  // Event handlers
  setOnViewerCountChange(callback) {
    this.onViewerCountChange = callback;
  }

  setOnStreamStart(callback) {
    this.onStreamStart = callback;
  }

  setOnStreamEnd(callback) {
    this.onStreamEnd = callback;
  }

  setOnError(callback) {
    this.onError = callback;
  }

  disconnect() {
    this.stopStream();
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default WebRTCStreamer;