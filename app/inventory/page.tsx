"use client"
import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import Image from 'next/image';
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

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        setIsAuthenticated(true);
        fetchProducts();
      } else {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Auth check error:', error);
      window.location.href = '/login';
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getVendorProducts();
      
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        console.error('Failed to fetch products:', response.message);
        setProducts([]);
      }
    } catch (error) {
      console.error('Fetch products error:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
      setProducts([]);
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
        fetchProducts();
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
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.categories?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Inventory</h1>
          <p className="text-gray-600">Manage your products</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products..."
              className="pl-10 w-[300px] rounded-md border-gray-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Link href="/add-product">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md">
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </Link>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg">Loading products...</div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-lg text-gray-500 mb-4">
            {searchQuery ? 'No products found matching your search.' : 'No products found.'}
          </div>
          <Link href="/add-product">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" /> Add Your First Product
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="relative h-48 w-full rounded-t-lg overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
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
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {product.categories?.name || 'No Category'}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-green-600">
                      ${product.price}
                    </span>
                    {product.discount_price && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.discount_price}
                      </span>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
                      // TODO: Implement view product details
                      toast({
                        title: "Info",
                        description: "View product feature coming soon",
                      });
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      // TODO: Implement edit product
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
      {!loading && filteredProducts.length > 0 && (
        <div className="mt-8 bg-white rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </div>
            <div className="text-sm text-gray-600">
              Total Value: ${filteredProducts.reduce((sum, product) => sum + (product.price * product.stock_quantity), 0).toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

