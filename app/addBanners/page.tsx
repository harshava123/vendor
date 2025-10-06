'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import { useRouter } from "next/navigation"
 

interface Ad {
  bannerID: string;
  bannerImageUrl: string;
}

export default function AddBanners() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [bannerTitle, setBannerTitle] = useState('')
  const normalizeString = (value: unknown): string => {
    return typeof value === 'string' ? value.trim() : '';
  }
  const [isDragging, setIsDragging] = useState(false)
  const [ads, setAds] = useState<Ad[]>([])
  const { toast } = useToast()
  // const token = Cookies.get("token");

  useEffect(() => {
    const token = apiClient.getAuthToken() || localStorage.getItem('authToken') || localStorage.getItem('token')
    if (!token) {
      router.replace('/login')
      return
    }
    fetchAds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAds = async () => {
    try {
      // Dummy existing banners
      setAds([
        { bannerID: 'B-1', bannerImageUrl: '/images/sample1.jpg' },
        { bannerID: 'B-2', bannerImageUrl: '/images/sample2.jpg' },
      ]);
    } catch (error) {
      console.error('Error setting dummy ads:', error);
    }
  };

  // const handleDeleteAd = async (adId: string) => {
  //   try {
  //     const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/ad-banner?adsBannerID=${adId}`, {
  //       method: 'DELETE',
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     if (!response.ok) throw new Error('Failed to delete ad');
  //     setAds(ads.filter(ad => ad.bannerID !== adId));
  //     toast({
  //       title: "Success",
  //       description: "Ad deleted successfully",
  //       className: 'bg-[#C10001] text-white'
  //     });
  //   } catch (error) {
  //     console.error('Error deleting ad:', error);
  //     toast({
  //       variant: "destructive",
  //       title: "Error",
  //       description: "Failed to delete ad"
  //     });
  //   }
  // };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (validateFile(droppedFile)) {
      setFile(droppedFile)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile)
    }
  }

  const validateFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf']
    const maxSize = 50 * 1024 * 1024 // 50MB

    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or PDF file"
      })
      return false
    }

    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "File size should not exceed 50MB"
      })
      return false
    }

    return true
  }

  const handleUpload = async () => {
    if (!file || !normalizeString(bannerTitle)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Both banner image and title are required"
      })
      return
    }

    try {
      // Dummy upload: create a local URL and append to list
      const previewUrl = URL.createObjectURL(file)
      const newBanner: Ad = { bannerID: `B-${ads.length + 1}`, bannerImageUrl: previewUrl }
      setAds([newBanner, ...ads])
      toast({
        title: "Success",
        description: "Banner added (dummy)",
        className: 'bg-green-600 text-white'
      })
      setFile(null)
      setBannerTitle('')
    } catch (error) {
      console.error('Error adding dummy banner:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add dummy banner"
      })
    }
  }

  return (
    <div className="p-12 space-y-4 max-w-8xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#013DC0] mb-4">Upload Banner</h1>
      <p className="text-sm text-[#262626] mb-2">Upload the banner you want to display</p>
      
      <div className="mb-4">
        <label htmlFor="bannerTitle" className="block text-sm font-medium text-gray-700 mb-1">
          Banner Title
        </label>
        <input
          id="bannerTitle"
          type="text"
          value={bannerTitle}
          onChange={(e) => setBannerTitle(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter banner title"
        />
      </div>

      {!file && <p className="text-red-600 text-sm mb-6">No banner is uploaded</p>}

      <Card 
        className={`border-dashed border-2 ${isDragging ? 'border-[#C10001]' : 'border-[#4361EE]'} 
        rounded-lg p-8 text-center cursor-pointer bg-transparent`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-[#013DC0] rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </div>
          <p className="text-[#262626]">Drag & Drop files here</p>
          <Button 
            variant="destructive" 
            className="bg-[#4361EE] cursor-pointer w-40 text-white"
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            Browse Files
          </Button>
          <input
            id="fileInput"
            type="file"
            className="hidden"
            accept=".jpeg,.jpg,.png,.pdf"
            onChange={handleFileSelect}
          />
          <p className="text-sm text-[#262626]">or</p>
          <p className="text-sm text-[#262626]">File should be jpeg, png or pdf</p>
          <p className="text-sm text-[#262626]">Max size 50 MB</p>
        </div>
      </Card>

      {file && (
        <div className="mt-4">
          <p className="text-[#262626] mb-2">Selected file: {file.name}</p>
          <Button 
            variant="destructive" 
            className="bg-[#4361EE] hover:bg-[#3451DE] text-white w-40 "
            onClick={handleUpload}
            disabled={!normalizeString(bannerTitle)}
          >
            Upload Banner
          </Button>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ads.map(ad => (
          <div key={ad.bannerID} className="relative">
            <img src={ad.bannerImageUrl} alt="Ad" className="w-full h-auto object-cover" />
            {/* <button
              className="absolute top-2 right-2 bg-white rounded-full p-1"
              onClick={() => handleDeleteAd(ad.bannerID)}
            >
              <X className="h-4 w-4 text-[#013DC0]" />
            </button> */}
          </div>
        ))}
      </div>
    </div>
  )
}
