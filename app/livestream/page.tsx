"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Eye, Plus, Video, Users, Camera, ArrowLeft, ArrowRight, Package, Trash2 } from 'lucide-react';
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

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  images: string[];
  category_id: string;
  vendor_id: string;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

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
  product_id?: string;
}

export default function Livestream() {
  const router = useRouter();
  
  // Navigation state
  const [currentStep, setCurrentStep] = useState<'categories' | 'products' | 'streams'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Data state
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [streams, setStreams] = useState<WebRTCStream[]>([]);
  
  // Loading states
  const [, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [streamsLoading, setStreamsLoading] = useState(false);
  const [creatingStream, setCreatingStream] = useState(false);
  
  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStream, setNewStream] = useState({
    title: '',
    description: ''
  });

  const normalizeString = (value: unknown): string => {
    return typeof value === 'string' ? value.trim() : '';
  };

  interface ApiResponse<T> { success: boolean; data?: T; message?: string }
  interface ApiClientForLivestream {
    createLivestream: (title: string, description: string, product_id?: string | null) => Promise<ApiResponse<unknown>>;
    getVendorLivestreams: (product_id?: string | null) => Promise<ApiResponse<WebRTCStream[]>>;
  }
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  // WebRTC streaming state
  const [webrtcStreamer, setWebrtcStreamer] = useState<WebRTCStreamer | null>(null);
  const [isWebRTCStreaming, setIsWebRTCStreaming] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(null);
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [currentStream, setCurrentStream] = useState<WebRTCStream | null>(null);

  useEffect(() => {
    checkAuthentication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthentication = async () => {
    try {
      console.log('🔐 Checking authentication...');
      // Prefer our app token
      const storedToken = apiClient.getAuthToken() || localStorage.getItem('authToken') || localStorage.getItem('token');
      if (storedToken) {
        setIsAuthenticated(true);
        fetchCategories();
        return;
      }
      // Fallback to Supabase session if present
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        localStorage.setItem('authToken', session.access_token);
        setIsAuthenticated(true);
        fetchCategories();
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
      router.push('/login');
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      console.log('🔄 Fetching categories for livestream...');
      
      const result = await apiClient.getCategories();
      console.log('📡 Categories API response:', result);
      
      if (result.success) {
        setCategories(result.data || []);
        console.log('✅ Categories loaded:', result.data?.length || 0);
      } else {
        console.error('❌ Failed to fetch categories:', result.message);
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Fetch categories error:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchProducts = async (categoryId: string) => {
    try {
      setProductsLoading(true);
      console.log('🔄 Fetching products for category:', categoryId);
      
      const result = await apiClient.getCategory(categoryId);
      console.log('📡 Category products API response:', result);
      
      if (result.success && result.data) {
        setProducts(result.data.products || []);
        console.log('✅ Products loaded:', result.data.products?.length || 0);
      } else {
        console.error('❌ Failed to fetch products:', result.message);
        toast({
          title: "Error",
          description: "Failed to load products for this category",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Fetch products error:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchLivestreams = async () => {
    try {
      setStreamsLoading(true);
      console.log('🔄 Fetching livestreams for product:', selectedProduct?.id, selectedProduct?.name);
      
      // Only fetch streams if we have a selected product
      if (!selectedProduct) {
        console.log('❌ No product selected, cannot fetch streams');
        setStreams([]);
        return;
      }
      
      const ac = apiClient as unknown as ApiClientForLivestream;
      const result = await ac.getVendorLivestreams(selectedProduct.id);
      console.log('📡 API Response:', result);
      console.log('📡 Raw data:', result.data);
      
      if (result.success) {
        const streams = (result.data || []) as WebRTCStream[];
        console.log('✅ Streams loaded for product:', streams.length);
        console.log('📋 Stream details:', streams.map((s: WebRTCStream) => ({ 
          id: s.id, 
          title: s.title, 
          product_id: s.product_id, 
          status: s.status,
          created_at: s.created_at 
        })));
        setStreams(streams);
      } else {
        console.error('❌ API Error:', result);
        toast({
          title: "Error",
          description: result.message || "Failed to fetch streams",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Fetch streams error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch streams. Please check your authentication.",
        variant: "destructive",
      });
    } finally {
      setStreamsLoading(false);
    }
  };

  // Navigation functions
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    fetchProducts(category.id);
    setCurrentStep('products');
  };


  const handleBackToCategories = () => {
    setCurrentStep('categories');
    setSelectedCategory(null);
    setSelectedProduct(null);
    setProducts([]);
    setStreams([]);
  };

  const handleBackToProducts = () => {
    setCurrentStep('products');
    setSelectedProduct(null);
    setStreams([]);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setCurrentStep('streams');
    // Clear existing streams and fetch new ones for this product
    setStreams([]);
    fetchLivestreams();
  };

  const createStream = async () => {
    if (!normalizeString(newStream.title)) {
      toast({
        title: "Validation Error",
        description: "Please enter a stream title",
        variant: "destructive",
      });
      return;
    }

    if (!selectedProduct) {
      toast({
        title: "Validation Error",
        description: "Please select a product first",
        variant: "destructive",
      });
      return;
    }

    setCreatingStream(true);
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to create a livestream",
          variant: "destructive",
        });
        setCreatingStream(false);
        return;
      }

      const streamTitle = `${normalizeString(newStream.title)} - ${selectedProduct.name}`;
      const streamDescription = normalizeString(`${newStream.description || ''}\n\nProduct: ${selectedProduct.name}\nPrice: ₹${selectedProduct.discount_price || selectedProduct.price}`);
      
      console.log('🎥 Creating livestream with:', { streamTitle, streamDescription, productId: selectedProduct.id });
      console.log('🔑 Auth token exists:', !!token);
      
      const ac = apiClient as unknown as ApiClientForLivestream;
      const result = await ac.createLivestream(streamTitle, streamDescription, selectedProduct.id);
      if (result.success) {
        toast({
          title: "Success",
          description: "Product livestream created successfully",
          className: "bg-green-500 text-white",
        });
        setShowCreateModal(false);
        setNewStream({ title: '', description: '' });
        // Add a small delay to ensure the database is updated
        setTimeout(() => {
          fetchLivestreams();
        }, 1000);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create stream",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Create stream error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create stream";
      
      // Check if it's an authentication error
      if (errorMessage.includes('Invalid token') || errorMessage.includes('401')) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        // Clear the invalid token
        localStorage.removeItem('authToken');
        // Redirect to login
        window.location.href = '/login';
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setCreatingStream(false);
    }
  };

  const deleteStream = async (streamId: string, streamTitle: string) => {
    if (!confirm(`Are you sure you want to delete the stream "${streamTitle}"?`)) {
      return;
    }

    setStreamsLoading(true);
    try {
      const result = await apiClient.deleteLivestream(streamId);
      if (result.success) {
        toast({
          title: "Success",
          description: `Stream "${streamTitle}" deleted successfully`,
          className: "bg-green-500 text-white",
        });
        fetchLivestreams();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete stream",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Delete stream error:', error);
      toast({
        title: "Error",
        description: "Failed to delete stream",
        variant: "destructive",
      });
    } finally {
      setStreamsLoading(false);
    }
  };

  const deleteAllStreams = async () => {
    setStreamsLoading(true);
    try {
      const deletePromises = streams.map(stream => apiClient.deleteLivestream(stream.id));
      await Promise.all(deletePromises);
      
      toast({
        title: "Success",
        description: `All ${streams.length} streams deleted successfully`,
        className: "bg-green-500 text-white",
      });
      fetchLivestreams();
    } catch (error) {
      console.error('Delete all streams error:', error);
      toast({
        title: "Error",
        description: "Failed to delete some streams",
        variant: "destructive",
      });
    } finally {
      setStreamsLoading(false);
    }
  };

  const startWebRTCStream = async (stream: WebRTCStream) => {
    if (stream.status === 'live' && stream.is_active_webrtc) {
      toast({
        title: "Stream Already Live",
        description: "This Live Shopping stream is already active",
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
      streamer.setOnViewerCountChange((count: number) => {
        setViewerCount(count);
      });

      streamer.setOnStreamStart(() => {
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
          title: "🎥 Live Shopping Stream Started!",
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
          description: " Live Shopping stream has been stopped",
          className: "bg-orange-500 text-white",
        });
      });

      streamer.setOnError((error: unknown) => {
        const message = typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error';
        console.error('WebRTC Stream error:', message);
        toast({
          title: "Live Shopping Stream Error",
          description: message.includes('namespace') 
            ? "Connection error. Please check if the backend server is running on port 5000."
            : message,
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
        title: "Live Shopping Stream Error",
        description: "Failed to start Live Shopping stream. Please ensure your browser supports Live Shopping and you have granted camera/microphone permissions.",
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
            description: "Live Shopping livestream ended successfully",
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

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter(product =>
    (product.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    (product.description || '').toLowerCase().includes((searchQuery || '').toLowerCase())
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
    <div className="min-h-screen p-4 sm:p-6" style={{ backgroundColor: 'var(--light-gray)', color: 'var(--text-primary)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header with Navigation */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
            {currentStep !== 'categories' && (
              <Button
                onClick={currentStep === 'products' ? handleBackToCategories : handleBackToProducts}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {currentStep === 'categories' && 'Select Category'}
                {currentStep === 'products' && `Products in ${selectedCategory?.name}`}
                {currentStep === 'streams' && `Livestreams for ${selectedProduct?.name}`}
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                {currentStep === 'categories' && 'Choose a category to view products for livestreaming'}
                {currentStep === 'products' && 'Select a product to create or manage livestreams'}
                {currentStep === 'streams' && 'Create and manage livestreams for this product'}
              </p>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            <span className={currentStep === 'categories' ? 'font-medium' : ''} style={{ color: currentStep === 'categories' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Categories</span>
            {currentStep !== 'categories' && (
              <>
                <ArrowRight className="w-4 h-4" />
                <span className={currentStep === 'products' ? 'font-medium' : ''} style={{ color: currentStep === 'products' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Products</span>
              </>
            )}
            {currentStep === 'streams' && (
              <>
                <ArrowRight className="w-4 h-4" />
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Livestreams</span>
              </>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={
                currentStep === 'categories' ? 'Search categories...' :
                currentStep === 'products' ? 'Search products...' :
                'Search streams...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#0f1115] border-gray-700 text-[var(--text-primary)] placeholder-gray-500"
            />
          </div>
          {currentStep === 'streams' && (
            <div className="flex gap-2">
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="text-black"
            style={{ backgroundColor: '#98FF98' }}
          >
            <Plus className="w-4 h-4 mr-2" />
                Create Stream for {selectedProduct?.name}
              </Button>
              {streams.length > 0 && (
                <Button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete ALL ${streams.length} streams for ${selectedProduct?.name}?`)) {
                      deleteAllStreams();
                    }
                  }}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                  disabled={streamsLoading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All
          </Button>
              )}
            </div>
          )}
        </div>

        {/* Live Shopping Stream Status Banner */}
        {isWebRTCStreaming && (
          <div className="mb-6 p-4 bg-green-100 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
                <span className="text-green-800 font-medium">
                  Live Shopping Stream Active: {currentStream?.title}
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

        {/* Step-based Content */}
        {currentStep === 'categories' && (
          <>
            {categoriesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-lg shadow-sm p-6 animate-pulse" style={{ backgroundColor: 'var(--card-bg)' }}>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredCategories.map((category) => (
                  <div key={category.id} className="rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCategorySelect(category)} style={{ backgroundColor: 'var(--card-bg)' }}>
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#151922' }}>
                          {category.image ? (
                            <Image
                              src={category.image}
                              alt={category.name}
                              width={64}
                              height={64}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{category.name}</h3>
                          {category.description && (
                            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{category.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <span>Click to view products</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredCategories.length === 0 && !categoriesLoading && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                <p className="text-gray-600 mb-4">No categories are available for livestreaming</p>
              </div>
            )}
          </>
        )}

        {currentStep === 'products' && (
          <>
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-lg shadow-sm p-6 animate-pulse" style={{ backgroundColor: 'var(--card-bg)' }}>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleProductSelect(product)} style={{ backgroundColor: 'var(--card-bg)' }}>
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#151922' }}>
                          {product.images && product.images.length > 0 && product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              width={64}
                              height={64}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{product.name}</h3>
                          <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{product.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-lg font-bold text-green-600">₹{product.discount_price || product.price}</span>
                            {product.discount_price && (
                              <span className="text-sm text-gray-500 line-through">₹{product.price}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <span>Stock: {product.stock_quantity}</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredProducts.length === 0 && !productsLoading && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">No products are available in this category for livestreaming</p>
                  </div>
                )}
          </>
        )}

        {currentStep === 'streams' && (
          <>
            {streamsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-lg shadow-sm p-6 animate-pulse" style={{ backgroundColor: 'var(--card-bg)' }}>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredStreams.map((stream) => (
                  <div key={stream.id} className="rounded-lg shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--card-bg)' }}>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{stream.title}</h3>
                        <div className="flex items-center gap-2">
                          {stream.is_active_webrtc ? (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-green-500 font-medium">  Live Shopping Stream</span>
                            </div>
                          ) : (
                            <span className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{stream.status}</span>
                          )}
                        </div>
              </div>

                      {stream.description && (
                        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{stream.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{stream.current_viewers || 0} viewers</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Video className="w-4 h-4" />
                            <span>Live Shopping Stream</span>
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
                            disabled={streamsLoading}
                            size="sm"
                            className="flex-1 text-black"
                            style={{ backgroundColor: '#98FF98' }}
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Start Live Shopping Stream
                    </Button>
                  )}
                    <Button
                          onClick={() => deleteStream(stream.id, stream.title)}
                          disabled={streamsLoading || stream.is_active_webrtc}
                      variant="outline"
                          size="sm"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                          <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
            )}

            {filteredStreams.length === 0 && !streamsLoading && (
          <div className="text-center py-12">
                <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No streams found for {selectedProduct?.name}</h3>
                <p className="text-gray-600 mb-4">Create your first livestream for this product</p>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="text-black"
              style={{ backgroundColor: '#98FF98' }}
            >
              <Plus className="w-4 h-4 mr-2" />
                  Create Stream for {selectedProduct?.name}
            </Button>
              </div>
            )}
          </>
        )}

        {/* Live Shopping Stream Video Preview */}
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
                ref={(video: HTMLVideoElement | null) => {
                  if (video && localVideoStream) {
                    video.srcObject = localVideoStream;
                  }
                }}
              />
              <p className="text-xs text-gray-600 mt-2 text-center">
                Your webcam is live! Viewers can watch in Bazar Story.
              </p>
              <Button
                onClick={() => router.push('/livestream/ongoing')}
                className="w-full mt-3 text-black text-sm"
                style={{ backgroundColor: '#98FF98' }}
                size="sm"
              >
                <Video className="w-4 h-4 mr-2" />
                Open Full View with Chat
              </Button>
            </div>
          </div>
        )}

        {/* Create Stream Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Product Livestream</DialogTitle>
              <DialogDescription>
                Create a live shopping stream for {selectedProduct?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Product Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {selectedProduct?.images && selectedProduct.images.length > 0 ? (
                      <Image
                        src={selectedProduct.images[0]}
                        alt={selectedProduct.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{selectedProduct?.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-bold text-green-600">₹{selectedProduct?.discount_price || selectedProduct?.price}</span>
                      {selectedProduct?.discount_price && (
                        <span className="text-sm text-gray-500 line-through">₹{selectedProduct.price}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Stream Title *</label>
                <Input
                  placeholder={`Enter stream title for ${selectedProduct?.name}`}
                  value={newStream.title}
                  onChange={(e) => setNewStream({ ...newStream, title: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be prefixed with &quot;{selectedProduct?.name} - &quot;
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Input
                  placeholder="Enter stream description (optional)"
                  value={newStream.description}
                  onChange={(e) => setNewStream({ ...newStream, description: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Product details will be automatically added
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                disabled={creatingStream}
              >
                Cancel
              </Button>
              <Button
                onClick={createStream}
                disabled={creatingStream || !normalizeString(newStream.title) || !selectedProduct}
                className="text-black"
                style={{ backgroundColor: '#98FF98' }}
              >
                {creatingStream ? "Creating..." : "Create Stream"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
