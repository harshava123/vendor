"use client"
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function OngoingLivestreamPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const startedRef = useRef<boolean>(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [messages, setMessages] = useState<{ id: string; author: string; text: string; at: number }[]>([
    { id: 'm1', author: 'Rahul', text: 'Impressed with the diverse products available', at: Date.now() - 60000 },
    { id: 'm2', author: 'Nithin', text: 'Interested', at: Date.now() - 45000 },
  ])
  const [draft, setDraft] = useState("")

  useEffect(() => {
    const start = async () => {
      if (startedRef.current) return
      startedRef.current = true
      try {
        const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        streamRef.current = media
        if (videoRef.current) {
          const video = videoRef.current
          video.srcObject = media
          video.onloadedmetadata = () => {
            video.play().catch(() => {})
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unable to access camera'
        setPermissionError(message)
      }
    }
    start()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
      startedRef.current = false
    }
  }, [])

  // Prevent layout glitching by ensuring proper viewport handling
  useEffect(() => {
    const handleResize = () => {
      // Force reflow to prevent layout issues
      document.body.style.overflow = 'hidden'
    }

    const handleBeforeUnload = () => {
      document.body.style.overflow = 'auto'
    }

    // Set initial styles
    document.body.style.overflow = 'hidden'
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.body.style.overflow = 'auto'
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  const handleSend = () => {
    const text = draft.trim()
    if (!text) return
    setMessages((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2), author: 'You', text, at: Date.now() },
    ])
    setDraft("")
  }

  const handleStop = () => {
    // Stop the camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
    // Navigate back to livestream page
    router.push('/livestream')
  }

  // Format time ago
  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'now';
    if (minutes === 1) return '1m ago';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1h ago';
    return `${hours}h ago`;
  };

  return (
    <>
      <style jsx>{`
        .vendor-livestream-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: black;
          z-index: 50;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .vendor-chat-panel {
          width: 320px;
          min-width: 320px;
          max-width: 320px;
          flex-shrink: 0;
          background: #111827;
          border-left: 1px solid #374151;
          display: flex;
          flex-direction: column;
        }
        .vendor-video-container {
          flex: 1;
          min-width: 0;
          background: black;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
      <div className="vendor-livestream-container">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
            K
          </div>
          <div>
            <h3 className="text-white font-semibold">Your Live Stream</h3>
            <p className="text-gray-400 text-sm">You are live</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-red-500">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">LIVE</span>
          </div>
          <Button 
            onClick={handleStop} 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            End Stream
          </Button>
        </div>
      </div>

      {/* Main Content - Fixed height container */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Side - Video Player */}
        <div className="vendor-video-container">
          <div className="w-full h-full relative max-w-full max-h-full">
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover max-w-full max-h-full" 
              playsInline 
              muted 
              autoPlay 
            />
            
            {/* Stream Info Overlay */}
            <div className="absolute bottom-4 left-4 bg-black/70 rounded-lg p-3">
              <div className="flex items-center gap-2 text-white">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">You are live</span>
              </div>
            </div>

            {permissionError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-sm p-4">
                {permissionError}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Live Chat - Fixed width to prevent glitching */}
        <div className="vendor-chat-panel">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-700 flex-shrink-0">
            <h3 className="text-white font-semibold">Live Chat</h3>
            <p className="text-gray-400 text-sm">Viewers can chat here</p>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0" id="vendor-chat-messages">
            {messages.map((m) => {
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-pink-500'];
              const colorIndex = m.author.charCodeAt(0) % colors.length;
              
              return (
                <div key={m.id} className="flex items-start gap-2">
                  <div className={`w-6 h-6 ${colors[colorIndex]} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {m.author.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white text-sm font-medium">{m.author}</span>
                      <span className="text-gray-400 text-xs">{formatTimeAgo(m.at)}</span>
                    </div>
                    <p className="text-gray-300 text-sm break-words">{m.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input - Vendor can respond */}
          <div className="p-4 border-t border-gray-700 flex-shrink-0">
            <div className="flex gap-2">
              <Input
                placeholder="Respond to viewers..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
                className="flex-1 bg-gray-800 text-white border-gray-600 focus:border-green-500 focus:outline-none text-sm min-w-0"
              />
              <Button 
                onClick={handleSend} 
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex-shrink-0"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}


