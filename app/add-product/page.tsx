"use client"
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  is_active: boolean;
}

export default function AddProduct() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    category_id: '',
    price: '',
    discount_price: '',
    stock_quantity: '',
    min_order_quantity: '1',
    images: [''],
    sizes: [''],
    colors: [''],
    is_featured: false
  });

  useEffect(() => {
    checkAuthentication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthentication = async () => {
    try {
      const token = apiClient.getAuthToken() || localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to add products",
          variant: "destructive",
        });
        router.push('/login');
        return;
      }
      
      console.log('🔐 User authenticated, fetching categories...');
      fetchCategories();
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await apiClient.getCategories();
      
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        throw new Error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof productData, value: string | boolean) => {
    setProductData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: 'images' | 'sizes' | 'colors', index: number, value: string) => {
    setProductData(prev => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) => 
        i === index ? value : item
      )
    }));
  };

  const addArrayItem = (field: 'images' | 'sizes' | 'colors') => {
    setProductData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'images' | 'sizes' | 'colors', index: number) => {
    setProductData(prev => ({
      ...prev,
      [field]: prev[field].filter((_: string, i: number) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productData.name || !productData.category_id || !productData.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...productData,
        price: parseFloat(productData.price),
        discount_price: productData.discount_price ? parseFloat(productData.discount_price) : null,
        stock_quantity: parseInt(productData.stock_quantity) || 0,
        min_order_quantity: parseInt(productData.min_order_quantity) || 1,
        images: productData.images.filter(img => img.trim() !== ''),
        sizes: productData.sizes.filter(size => size.trim() !== ''),
        colors: productData.colors.filter(color => color.trim() !== '')
      };

      console.log('🚀 Submitting product with payload:', payload);
      const token = localStorage.getItem('authToken');
      console.log('🔑 Auth token exists:', !!token);
      
      const response = await apiClient.createProduct(payload);
      console.log('📡 Product creation response:', response);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Product created successfully",
          variant: "default",
          className: "bg-green-500 text-white",
        });
        
        // Reset form
        setProductData({
          name: '',
          description: '',
          category_id: '',
          price: '',
          discount_price: '',
          stock_quantity: '',
          min_order_quantity: '1',
          images: [''],
          sizes: [''],
          colors: [''],
          is_featured: false
        });
        
        // Redirect to products page
        router.push('/products');
      } else {
        throw new Error(response.message || 'Failed to create product');
      }
    } catch (error: unknown) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Add New Product</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Product Name *
              </label>
              <Input
                value={productData.name}
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
                value={productData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter product description"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Category *
              </label>
              <select
                value={productData.category_id}
                onChange={(e) => handleInputChange('category_id', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Price *
              </label>
              <Input
                type="number"
                step="0.01"
                value={productData.price}
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
                value={productData.discount_price}
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
                value={productData.stock_quantity}
                onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                placeholder="Enter stock quantity"
              />
            </div>

            {/* Minimum Order Quantity */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Minimum Order Quantity
              </label>
              <Input
                type="number"
                value={productData.min_order_quantity}
                onChange={(e) => handleInputChange('min_order_quantity', e.target.value)}
                placeholder="Enter minimum order quantity"
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Product Images
              </label>
              {productData.images.map((image, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={image}
                    onChange={(e) => handleArrayChange('images', index, e.target.value)}
                    placeholder="Enter image URL"
                    className="flex-1"
                  />
                  {productData.images.length > 1 && (
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

            {/* Sizes */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Available Sizes
              </label>
              {productData.sizes.map((size, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={size}
                    onChange={(e) => handleArrayChange('sizes', index, e.target.value)}
                    placeholder="Enter size (e.g., S, M, L)"
                    className="flex-1"
                  />
                  {productData.sizes.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeArrayItem('sizes', index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem('sizes')}
                className="mt-2"
              >
                Add Size
              </Button>
            </div>

            {/* Colors */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Available Colors
              </label>
              {productData.colors.map((color, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={color}
                    onChange={(e) => handleArrayChange('colors', index, e.target.value)}
                    placeholder="Enter color (e.g., Red, Blue)"
                    className="flex-1"
                  />
                  {productData.colors.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeArrayItem('colors', index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem('colors')}
                className="mt-2"
              >
                Add Color
              </Button>
            </div>

            {/* Featured Product */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={productData.is_featured}
                onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="is_featured" className="text-sm font-medium">
                Mark as featured product
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Creating Product...' : 'Create Product'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/products')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
