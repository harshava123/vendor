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

  return (
    <div className="p-6 min-h-screen flex items-center">
      <div className="mx-auto max-w-6xl w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-center md:text-left">Ongoing Livestream</h1>
          <Button onClick={handleStop} className="bg-red-500 cursor-pointer hover:bg-red-600 text-white">
            Stop
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start h-full ">
          <div className="rounded-lg h-full flex items-center overflow-hidden  relative">
          <video ref={videoRef} className="max-w-full rounded-lg max-h-full object-cover bg-black" playsInline muted autoPlay />
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded">LIVE</div>
          {permissionError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-sm p-4">
              {permissionError}
            </div>
          )}
          </div>

          <div className="flex flex-col h-[40rem]  rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">K</div>
              <div className="font-medium">Karatage Traders</div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((m) => (
                <div key={m.id} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full border border-green-500 text-green-600 flex items-center justify-center text-xs font-semibold">
                    {m.author.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-sm leading-5">
                    <span className="font-semibold mr-1">{m.author}</span>
                    <span className="text-neutral-700">: {m.text}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-neutral-200 flex gap-2">
              <Input
                placeholder="Type your comment"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
                className="rounded-xl border-red-300 focus-visible:ring-0 focus:border-red-400"
              />
              <Button onClick={handleSend} className="rounded-xl">Send</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


