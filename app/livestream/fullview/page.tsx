"use client"
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FullViewLivestreamPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const startedRef = useRef<boolean>(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [messages, setMessages] = useState<{ id: string; author: string; text: string; at: number }[]>([
    { id: 'm1', author: 'Rahul', text: 'Impressed with the diverse products available', at: Date.now() - 60000 },
    { id: 'm2', author: 'Nithin', text: 'Interested', at: Date.now() - 45000 },
    { id: 'm3', author: 'Priya', text: 'Great products!', at: Date.now() - 30000 },
    { id: 'm4', author: 'Amit', text: 'How much is this?', at: Date.now() - 15000 },
  ])
  const [draft, setDraft] = useState("")

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

  const handleStop = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
    router.push('/livestream')
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
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: '280px', // Position to the right of sidebar
      width: 'calc(100vw - 280px)', 
      height: '100vh', 
      backgroundColor: 'black', 
      zIndex: 40,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        height: '60px',
        backgroundColor: '#1f2937',
        borderBottom: '1px solid #374151',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'black',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            K
          </div>
          <div>
            <h3 style={{ color: 'white', fontWeight: '600', margin: 0, fontSize: '16px' }}>Your Live Stream</h3>
            <p style={{ color: '#9CA3AF', fontSize: '14px', margin: 0 }}>You are live</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444' }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#EF4444',
              borderRadius: '50%'
            }}></div>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>LIVE</span>
          </div>
          <button 
            onClick={handleStop} 
            style={{
              padding: '8px 16px',
              backgroundColor: '#DC2626',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            End Stream
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ height: 'calc(100vh - 60px)' }}>
        {/* Video Container */}
        <div style={{
          float: 'left',
          width: 'calc(100% - 320px)',
          height: '100%',
          backgroundColor: 'black',
          position: 'relative'
        }}>
          <video 
            ref={videoRef} 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
            playsInline 
            muted 
            autoPlay 
          />
          
          {/* Stream Info Overlay */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#EF4444',
                borderRadius: '50%'
              }}></div>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>You are live</span>
            </div>
          </div>

          {permissionError && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              fontSize: '14px',
              padding: '16px'
            }}>
              {permissionError}
            </div>
          )}
        </div>

        {/* Chat Container */}
        <div style={{
          float: 'right',
          width: '320px',
          height: '100%',
          backgroundColor: '#111827',
          borderLeft: '1px solid #374151',
          position: 'relative'
        }}>
          {/* Chat Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #374151',
            backgroundColor: '#111827'
          }}>
            <h3 style={{ color: 'white', fontWeight: '600', margin: 0, fontSize: '16px' }}>Live Chat</h3>
            <p style={{ color: '#9CA3AF', fontSize: '14px', margin: 0 }}>Viewers can chat here</p>
          </div>

          {/* Chat Messages */}
          <div style={{
            height: 'calc(100% - 140px)',
            overflowY: 'auto',
            padding: '16px',
            backgroundColor: '#111827'
          }}>
            {messages.map((m) => {
              const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#F59E0B', '#EC4899'];
              const colorIndex = m.author.charCodeAt(0) % colors.length;
              
              return (
                <div key={m.id} style={{ 
                  marginBottom: '12px' 
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: colors[colorIndex],
                    borderRadius: '50%',
                    display: 'inline-block',
                    verticalAlign: 'top',
                    marginRight: '8px',
                    textAlign: 'center',
                    lineHeight: '24px',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {m.author.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ display: 'inline-block', width: 'calc(100% - 32px)', verticalAlign: 'top' }}>
                    <div style={{ marginBottom: '4px' }}>
                      <span style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginRight: '8px' }}>{m.author}</span>
                      <span style={{ color: '#9CA3AF', fontSize: '12px' }}>{formatTimeAgo(m.at)}</span>
                    </div>
                    <p style={{ color: '#D1D5DB', fontSize: '14px', margin: 0, wordBreak: 'break-word' }}>{m.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid #374151',
            backgroundColor: '#111827',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '80px'
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Respond to viewers..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
                style={{
                  flex: 1,
                  backgroundColor: '#1F2937',
                  color: 'white',
                  border: '1px solid #4B5563',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button 
                onClick={handleSend} 
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#059669',
                  color: 'white',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

