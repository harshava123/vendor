"use client"
import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Radio, Send, Square } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

export default function OngoingLivestreamPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const startedRef = useRef<boolean>(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [messages, setMessages] = useState<{ id: string; author: string; text: string; at: number }[]>([
    { id: 'm1', author: 'Rahul', text: 'Impressed with the diverse products available', at: Date.now() - 60000 },
    { id: 'm2', author: 'Nithin', text: 'Interested', at: Date.now() - 45000 },
  ])
  const [draft, setDraft] = useState("")
  const [isEnding, setIsEnding] = useState(false)
  
  // Get stream key from URL
  const streamKey = searchParams.get('streamKey')

  useEffect(() => {
    const start = async () => {
      if (startedRef.current) return
      startedRef.current = true
      try {
        const media = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }, 
          audio: false 
        })
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

  const handleSend = () => {
    const text = draft.trim()
    if (!text) return
    setMessages((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2), author: 'You', text, at: Date.now() },
    ])
    setDraft("")
  }

  const handleStop = async () => {
    if (isEnding) return; // Prevent multiple calls
    
    setIsEnding(true);
    
    try {
      // Stop local media stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      
      // End stream on backend if we have a stream key
      if (streamKey) {
        console.log('🛑 Ending stream with key:', streamKey);
        const result = await apiClient.endLivestream(streamKey);
        
        if (result.success) {
          toast({
            title: "Stream Ended",
            description: "Your livestream has been ended successfully",
            className: "bg-green-500 text-white",
          });
        } else {
          console.error('❌ Failed to end stream on backend:', result);
          toast({
            title: "Warning",
            description: "Stream ended locally but may still be active on the server",
            variant: "destructive",
          });
        }
      } else {
        console.warn('⚠️ No stream key available, only stopping local stream');
        toast({
          title: "Stream Ended",
          description: "Local stream ended (no stream key found)",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('❌ Error ending stream:', error);
      toast({
        title: "Error",
        description: "Failed to end stream properly",
        variant: "destructive",
      });
    } finally {
      setIsEnding(false);
      // Navigate back to livestream page
      router.push('/livestream');
    }
  }

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
    <div className="h-full flex flex-col bg-gray-900">
      {/* Stream Header */}
      <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-sm font-semibold">
              K
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">Your Live Stream</h2>
              <p className="text-gray-400 text-sm">You are live</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-red-500">
              <Radio className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-medium">LIVE</span>
            </div>
            <Button 
              onClick={handleStop}
              variant="destructive"
              size="sm"
              className="bg-red-600 hover:bg-red-700"
              disabled={isEnding}
            >
              <Square className="w-4 h-4 mr-2" />
              {isEnding ? 'Ending...' : 'End Stream'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Section */}
        <div className="flex-1 bg-black relative">
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover"
            playsInline 
            muted 
            autoPlay 
          />
          
          {/* Stream Info Overlay */}
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 rounded-lg p-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">You are live</span>
            </div>
          </div>

          {permissionError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 text-white p-4">
              <p className="text-center">{permissionError}</p>
            </div>
          )}
        </div>

        {/* Chat Section */}
        <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
          {/* Chat Header */}
          <div className="flex-shrink-0 p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold text-lg">Live Chat</h3>
            <p className="text-gray-400 text-sm">Viewers can chat here</p>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => {
              const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#F59E0B', '#EC4899'];
              const colorIndex = m.author.charCodeAt(0) % colors.length;
              
              return (
                <div key={m.id} className="flex gap-2">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: colors[colorIndex] }}
                  >
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

          {/* Chat Input */}
          <div className="flex-shrink-0 p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Respond to viewers..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
                className="flex-1 bg-gray-800 text-white border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <Button 
                onClick={handleSend}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}