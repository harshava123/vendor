"use client"
import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  images: string[];
  stock_quantity: number;
  min_order_quantity: number;
  is_featured: boolean;
  is_active: boolean;
  category_id: string;
  categories?: {
    id: string;
    name: string;
  };
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  is_active: boolean;
}

export default function CategoryProducts() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.categoryId as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    stock_quantity: '',
    min_order_quantity: '1',
    images: [''],
    sizes: [''],
    colors: [''],
    is_featured: false
  });

  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const fetchCategoryAndProducts = useCallback(async () => {
    try {
      setLoading(true);
      setProductsLoading(true);
      
      const response = await apiClient.getCategory(categoryId);
      
      if (response.success && response.data) {
        // Set category data
        setCategory(response.data.category);
        // Set products data
        setProducts(response.data.products || []);
      } else {
        toast({
          title: "Error",
          description: "Category not found",
          variant: "destructive",
        });
        router.push('/products');
      }
    } catch (error) {
      console.error('Error fetching category and products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch category and products",
        variant: "destructive",
      });
      router.push('/products');
    } finally {
      setLoading(false);
      setProductsLoading(false);
    }
  }, [categoryId, router]);

  useEffect(() => {
    if (categoryId) {
      fetchCategoryAndProducts();
    }
    
    // Simple token check without aggressive redirects
    const token = apiClient.getAuthToken();
    if (!token) {
      console.log('❌ No auth token found');
    } else {
      console.log('✅ Auth token found');
    }
    
  }, [categoryId, fetchCategoryAndProducts]);

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleInputChange = (field: keyof typeof newProduct, value: string | boolean) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: 'images' | 'sizes' | 'colors', index: number, value: string) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) => 
        i === index ? value : item
      )
    }));
  };

  const addArrayItem = (field: 'images' | 'sizes' | 'colors') => {
    setNewProduct(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'images' | 'sizes' | 'colors', index: number) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: prev[field].filter((_: string, i: number) => i !== index)
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(files);
      
      // Create preview URLs
      const urls = Array.from(files).map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const handleUploadImages = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select images to upload",
        variant: "destructive",
      });
      return;
    }

    setUploadingImages(true);
    try {
      const response = await apiClient.uploadProductImages(Array.from(selectedFiles));
      
      if (response.success && response.data) {
        // Extract URLs from uploaded files
        const uploadedUrls = response.data.map((file: { fullUrl: string }) => file.fullUrl);
        
        // Add uploaded image URLs to the images array
        setNewProduct(prev => ({
        ...prev,
          images: [...prev.images.filter(img => img.trim() !== ''), ...uploadedUrls]
        }));
        
        // Clear selected files and previews
        setSelectedFiles(null);
        setPreviewUrls([]);
        
        // Reset file input
        const fileInput = document.getElementById('image-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
      toast({
        title: "Success",
          description: "Images uploaded successfully",
          variant: "default",
        className: "bg-green-500 text-white",
      });
      } else {
        throw new Error(response.message || 'Failed to upload images');
      }
    } catch (error: unknown) {
      console.error('Error uploading images:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const removePreviewImage = (index: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles).filter((_, i) => i !== index);
      const dataTransfer = new DataTransfer();
      newFiles.forEach(file => dataTransfer.items.add(file));
      setSelectedFiles(dataTransfer.files);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check authentication before creating product
    const token = apiClient.getAuthToken();
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create products",
        variant: "destructive",
      });
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...newProduct,
        category_id: categoryId,
        price: parseFloat(newProduct.price),
        discount_price: newProduct.discount_price ? parseFloat(newProduct.discount_price) : null,
        stock_quantity: parseInt(newProduct.stock_quantity) || 0,
        min_order_quantity: parseInt(newProduct.min_order_quantity) || 1,
        images: newProduct.images.filter(img => img.trim() !== ''),
        sizes: newProduct.sizes.filter(size => size.trim() !== ''),
        colors: newProduct.colors.filter(color => color.trim() !== '')
      };

      const response = await apiClient.createProduct(payload);
      
      if (response.success) {
      toast({
        title: "Success",
          description: "Product created successfully",
          variant: "default",
        className: "bg-green-500 text-white",
      });
        
        // Reset form
        setNewProduct({
          name: '',
          description: '',
          price: '',
          discount_price: '',
          stock_quantity: '',
          min_order_quantity: '1',
          images: [''],
          sizes: [''],
          colors: [''],
          is_featured: false
        });
        
        // Clear upload states
        setSelectedFiles(null);
        setPreviewUrls([]);
        setUploadingImages(false);
        
        // Reset file input
        const fileInput = document.getElementById('image-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        setShowAddProduct(false);
        
        // Refresh products list
        fetchCategoryAndProducts();
      } else {
        throw new Error(response.message || 'Failed to create product');
      }
    } catch (error: unknown) {
      console.error('Error creating product:', error);
      
      let errorMessage = "Failed to create product";
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      } else {
        const err = error as { response?: { data?: { message?: string; error?: string } } };
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message as string;
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error as string;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await apiClient.deleteProduct(productId);
      
      if (response.success) {
      toast({
        title: "Success",
          description: "Product deleted successfully",
          variant: "default",
        className: "bg-green-500 text-white",
      });
        
        // Refresh products list
        fetchCategoryAndProducts();
      } else {
        throw new Error(response.message || 'Failed to delete product');
      }
    } catch (error: unknown) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--light-gray)', color: 'var(--text-primary)' }}>
        <div className="text-lg">Loading category...</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--light-gray)', color: 'var(--text-primary)' }}>
        <div className="text-lg text-red-600">Category not found</div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: 'var(--light-gray)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Link href="/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Categories
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{category.name}</h1>
            <p className="text-gray-600 text-sm sm:text-base">{category.description}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products..."
              className="pl-10 w-full sm:w-[300px] rounded-md border-gray-700 bg-[#0f1115] text-[var(--text-primary)] placeholder-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
            <DialogTrigger asChild>
              <Button className="rounded-md w-full sm:w-auto text-black" style={{ backgroundColor: '#00FF00' }}>
                <Plus className="h-4 w-4 mr-2" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0f1115] text-[var(--text-primary)]">
              <DialogHeader>
                <DialogTitle>Add New Product to {category.name}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Product Name *
                  </label>
                  <Input
                    value={newProduct.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter product description"
                    className="w-full p-3 border border-gray-700 rounded-md focus:ring-2 focus:ring-[#00FF00] focus:border-transparent bg-[#0f1115]"
                    rows={3}
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Price *
                  </label>
                <Input
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="Enter price"
                    required
                  />
                </div>

                {/* Discount Price */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Discount Price (optional)
                  </label>
                <Input
                  type="number"
                    step="0.01"
                    value={newProduct.discount_price}
                    onChange={(e) => handleInputChange('discount_price', e.target.value)}
                    placeholder="Enter discount price"
                  />
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Stock Quantity
                  </label>
                <Input
                  type="number"
                    value={newProduct.stock_quantity}
                    onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                    placeholder="Enter stock quantity"
                  />
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Product Images
                  </label>
                  
                  {/* File Upload Section */}
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 mb-4 bg-[#0f1115]">
                    <div className="text-center">
                      <input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-[var(--text-primary)] bg-[#151922] hover:bg-[#1a1f29]"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Select Images
                      </label>
                      <p className="text-xs text-gray-400 mt-2">
                        Select multiple images (JPG, PNG, GIF)
                      </p>
                    </div>
                    
                    {/* Preview Selected Images */}
                    {previewUrls.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium">Selected Images:</h4>
                          <Button
                            type="button"
                            onClick={handleUploadImages}
                            disabled={uploadingImages}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {uploadingImages ? 'Uploading...' : 'Upload Images'}
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {previewUrls.map((url, index) => (
                            <div key={index} className="relative">
                              <Image
                                src={url}
                                alt={`Preview ${index + 1}`}
                                width={100}
                                height={100}
                            className="w-full h-20 object-cover rounded border border-gray-700"
                              />
                              <button
                                type="button"
                                onClick={() => removePreviewImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Current Images Display */}
                  {newProduct.images.filter(img => img.trim() !== '').length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Current Images:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {newProduct.images.filter(img => img.trim() !== '').map((image, index) => (
                          <div key={index} className="relative">
                            <Image
                              src={image}
                              alt={`Product image ${index + 1}`}
                              width={100}
                              height={100}
                              className="w-full h-20 object-cover rounded border border-gray-700"
                            />
                            <button
                              type="button"
                              onClick={() => removeArrayItem('images', index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Manual URL Input (Optional) */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Or add image URLs manually:</h4>
                    {newProduct.images.map((image, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          value={image}
                          onChange={(e) => handleArrayChange('images', index, e.target.value)}
                          placeholder="Enter image URL"
                          className="flex-1 bg-[#0f1115] border-gray-700 text-[var(--text-primary)]"
                        />
                        {newProduct.images.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeArrayItem('images', index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addArrayItem('images')}
                      className="mt-2"
                    >
                      Add Image URL
                    </Button>
                  </div>
                </div>

                {/* Featured Product */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={newProduct.is_featured}
                    onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="is_featured" className="text-sm font-medium">
                    Mark as featured product
                  </label>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                <Button
                    onClick={handleAddProduct}
                  disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Creating Product...' : 'Create Product'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddProduct(false)}
                  >
                    Cancel
                </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Products Grid */}
      {productsLoading ? (
        <div className="text-center py-12">
          <div className="text-lg">Loading products...</div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-lg text-gray-400 mb-4">
            {searchQuery ? 'No products found matching your search.' : `No products found in ${category.name} category.`}
          </div>
          <Button 
            onClick={() => setShowAddProduct(true)}
            className=""
          >
            <Plus className="h-4 w-4 mr-2" /> Add Your First Product
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="rounded-lg shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--card-bg)' }}>
              <div className="relative h-48 w-full rounded-t-lg overflow-hidden">
                {product.images && product.images.length > 0 ? (
              <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#151922]">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
                {product.is_featured && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    Featured
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  Stock: {product.stock_quantity}
                </div>
            </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg line-clamp-2 mb-2" style={{ color: 'var(--text-primary)' }}>{product.name}</h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold" style={{ color: '#00FF00' }}>
                      ₹{product.discount_price || product.price}
                    </span>
                    {product.discount_price && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{product.price}
                      </span>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    product.is_active ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                  }`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      toast({
                        title: "Info",
                        description: "Edit product feature coming soon",
                      });
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Summary */}
      {!productsLoading && filteredProducts.length > 0 && (
        <div className="mt-8 rounded-lg p-4 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Showing {filteredProducts.length} of {products.length} products in {category.name}
            </div>
            <div className="text-sm text-gray-400">
              Total Value: ${filteredProducts.reduce((sum, product) => sum + (product.price * product.stock_quantity), 0).toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 