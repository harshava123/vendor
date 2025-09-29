"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Eye, Play, Plus, Video, Users, Camera, Mic } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import WebRTCStreamer from '@/lib/webrtc-streamer';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://umsznqdichlqsozobqsr.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtc3pucWRpY2hscXNvem9icXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNTMyODAsImV4cCI6MjA3NDYyOTI4MH0.gWD6zibO7L9t7KSfZZj0vDOh9iGeEz0Y9EauEESUeMg'
);

interface WebRTCStream {
  id: string;
  title: string;
  description?: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  stream_key: string;
  current_viewers?: number;
  created_at: string;
  updated_at: string;
  is_webrtc: boolean;
  is_active_webrtc: boolean;
}

export default function Livestream() {
  const router = useRouter();
  const [streams, setStreams] = useState<WebRTCStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStream, setNewStream] = useState({
    title: '',
    description: ''
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [webrtcStreamer, setWebrtcStreamer] = useState<WebRTCStreamer | null>(null);
  const [isWebRTCStreaming, setIsWebRTCStreaming] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(null);
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [currentStream, setCurrentStream] = useState<WebRTCStream | null>(null);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        localStorage.setItem('authToken', session.access_token);
        setIsAuthenticated(true);
        fetchLivestreams();
      } else {
        // Check localStorage for token as fallback
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
          setIsAuthenticated(true);
          fetchLivestreams();
        } else {
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchLivestreams = async () => {
    try {
      const result = await apiClient.getVendorLivestreams();
      if (result.success) {
        setStreams(result.data || []);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch streams",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Fetch streams error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch streams",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createStream = async () => {
    if (!newStream.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a stream title",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await apiClient.createLivestream(newStream.title, newStream.description);
      if (result.success) {
        toast({
          title: "Success",
          description: "WebRTC stream created successfully",
          className: "bg-green-500 text-white",
        });
        setShowCreateModal(false);
        setNewStream({ title: '', description: '' });
        fetchLivestreams();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create stream",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Create stream error:', error);
      toast({
        title: "Error",
        description: "Failed to create stream",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startWebRTCStream = async (stream: WebRTCStream) => {
    if (stream.status === 'live' && stream.is_active_webrtc) {
      toast({
        title: "Stream Already Live",
        description: "This WebRTC stream is already active",
        variant: "default",
      });
      return;
    }

    setLoading(true);
    try {
      // Initialize WebRTC streamer
      const streamer = new WebRTCStreamer();
      await streamer.initialize();

      // Set up event handlers
      streamer.setOnViewerCountChange((count) => {
        setViewerCount(count);
      });

      streamer.setOnStreamStart((data) => {
        setIsWebRTCStreaming(true);
        setCurrentStream(stream);
        setWebrtcStreamer(streamer);
        
        // Get local video stream for preview
        const mediaStream = streamer.getMediaStream();
        if (mediaStream) {
          setLocalVideoStream(mediaStream);
          setShowVideoPreview(true);
        }

        toast({
          title: "🎥 WebRTC Stream Started!",
          description: "Your webcam is now live! Viewers can watch in Bazar Story.",
          variant: "default",
          className: "bg-green-500 text-white",
        });
      });

      streamer.setOnStreamEnd(() => {
        setIsWebRTCStreaming(false);
        setViewerCount(0);
        setCurrentStream(null);
        setWebrtcStreamer(null);
        
        if (localVideoStream) {
          localVideoStream.getTracks().forEach(track => track.stop());
          setLocalVideoStream(null);
          setShowVideoPreview(false);
        }

        toast({
          title: "Stream Ended",
          description: "WebRTC stream has been stopped",
          className: "bg-orange-500 text-white",
        });
      });

      streamer.setOnError((error) => {
        console.error('WebRTC Stream error:', error);
        toast({
          title: "WebRTC Stream Error",
          description: error.includes('namespace') 
            ? "Connection error. Please check if the backend server is running on port 5000."
            : error,
          variant: "destructive",
        });
      });

      // Start the WebRTC stream
      const streamResult = await streamer.startStream(
        stream.id,
        stream.stream_key,
        stream.title,
        stream.description
      );

      if (!streamResult.success) {
        throw new Error(streamResult.error);
      }

      // Refresh streams list
      fetchLivestreams();

    } catch (error) {
      console.error('Start WebRTC stream error:', error);
      toast({
        title: "WebRTC Stream Error",
        description: "Failed to start WebRTC stream. Please ensure your browser supports WebRTC and you have granted camera/microphone permissions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const endWebRTCStream = async () => {
    if (webrtcStreamer && currentStream) {
      try {
        await webrtcStreamer.stopStream();
        
        // Update backend status
        const result = await apiClient.endLivestream(currentStream.stream_key);
        if (result.success) {
          toast({
            title: "Success",
            description: "WebRTC livestream ended successfully",
            className: "bg-orange-500 text-white",
          });
        }
        
        fetchLivestreams();
      } catch (error) {
        console.error('Failed to end livestream:', error);
        toast({
          title: "Error",
          description: "Failed to end livestream",
          variant: "destructive",
        });
      }
    }
  };

  const filteredStreams = streams.filter(stream =>
    stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stream.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {authLoading ? "Checking authentication..." : "Redirecting to login..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">WebRTC Livestreams</h1>
          <p className="text-gray-600">Start live video streams using your webcam and microphone</p>
        </div>

        {/* Search and Create */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search streams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create WebRTC Stream
          </Button>
        </div>

        {/* WebRTC Status Banner */}
        {isWebRTCStreaming && (
          <div className="mb-6 p-4 bg-green-100 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
                <span className="text-green-800 font-medium">
                  WebRTC Stream Active: {currentStream?.title}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="text-green-700">{viewerCount} viewers</span>
                </div>
                <Button
                  onClick={endWebRTCStream}
                  variant="outline"
                  size="sm"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  End Stream
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Streams Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStreams.map((stream) => (
              <div key={stream.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{stream.title}</h3>
                    <div className="flex items-center gap-2">
                      {stream.is_active_webrtc ? (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-600 font-medium">WebRTC Live</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 capitalize">{stream.status}</span>
                      )}
                    </div>
                  </div>
                  
                  {stream.description && (
                    <p className="text-gray-600 text-sm mb-4">{stream.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{stream.current_viewers || 0} viewers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Video className="w-4 h-4" />
                        <span>WebRTC</span>
                      </div>
                    </div>
                    <span>{new Date(stream.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    {stream.is_active_webrtc ? (
                      <Button
                        onClick={() => endWebRTCStream()}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                      >
                        End Stream
                      </Button>
                    ) : (
                      <Button
                        onClick={() => startWebRTCStream(stream)}
                        disabled={loading}
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Start WebRTC Stream
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredStreams.length === 0 && !loading && (
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No WebRTC streams found</h3>
            <p className="text-gray-600 mb-4">Create your first WebRTC stream to start broadcasting</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create WebRTC Stream
            </Button>
          </div>
        )}

        {/* WebRTC Video Preview */}
        {showVideoPreview && localVideoStream && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">Live Stream Preview</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600">{viewerCount} viewers</span>
                  </div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <video
                autoPlay
                muted
                playsInline
                className="w-full h-48 bg-black rounded"
                ref={(video) => {
                  if (video && localVideoStream) {
                    video.srcObject = localVideoStream;
                  }
                }}
              />
              <p className="text-xs text-gray-600 mt-2 text-center">
                Your webcam is live! Viewers can watch in Bazar Story.
              </p>
            </div>
          </div>
        )}

        {/* Create Stream Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create WebRTC Stream</DialogTitle>
              <DialogDescription>
                Create a new WebRTC livestream using your webcam and microphone
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Stream Title *</label>
                <Input
                  placeholder="Enter stream title"
                  value={newStream.title}
                  onChange={(e) => setNewStream({ ...newStream, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Input
                  placeholder="Enter stream description (optional)"
                  value={newStream.description}
                  onChange={(e) => setNewStream({ ...newStream, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={createStream}
                disabled={loading || !newStream.title.trim()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? "Creating..." : "Create Stream"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}