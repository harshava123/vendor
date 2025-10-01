"use client"
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, LogOut, Package, Users, BarChart3, Shield, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminApiClient, adminLogout } from '@/lib/admin-api';

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  is_active: boolean;
  created_at: string;
}

// Debug function for browser console
const debugAdminInfo = () => {
  console.log('🔍 Admin Debug Info:');
  console.log('Admin Token:', localStorage.getItem('adminToken'));
  console.log('Admin Email:', localStorage.getItem('adminEmail'));
  console.log('Auth Token:', localStorage.getItem('authToken'));
  console.log('All localStorage keys:', Object.keys(localStorage));
  return {
    adminToken: localStorage.getItem('adminToken'),
    adminEmail: localStorage.getItem('adminEmail'),
    authToken: localStorage.getItem('authToken')
  };
};

// Make debug function available globally
if (typeof window !== 'undefined') {
  (window as any).debugAdminInfo = debugAdminInfo;
}

export default function AdminDashboardPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    image: ''
  });
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAdminAuth();
    fetchCategories();
  }, []);

  const checkAdminAuth = () => {
    const adminToken = localStorage.getItem('adminToken');
    const adminEmail = localStorage.getItem('adminEmail');
    
    if (!adminToken || adminEmail !== 'Admin@gmail.com') {
      router.push('/login');
      return;
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await adminApiClient.getCategories();
      
      if (response.success && response.data) {
        console.log('📋 Fetched categories:', response.data);
        console.log('🆔 Category IDs:', response.data.map(cat => ({ id: cat.id, type: typeof cat.id })));
        setCategories(response.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch categories.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch categories.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const response = await adminApiClient.uploadCategoryImage(file);
      if (response.success) {
        // Store base64 data directly
        setNewCategory(prev => ({ ...prev, image: response.data.imageData }));
        setPreviewImage(response.data.imageData);
        toast({
          title: "Success",
          description: "Image uploaded successfully!",
          variant: "default",
          className: "bg-green-500 text-white",
        });
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size should be less than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      handleImageUpload(file);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required.",
        variant: "destructive",
      });
      return;
    }

    setCategoryLoading(true);
    try {
      const response = await adminApiClient.createCategory({
        name: newCategory.name,
        description: newCategory.description,
        image: newCategory.image || 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop&crop=center'
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Category created successfully!",
          variant: "default",
          className: "bg-green-500 text-white",
        });
        
        setNewCategory({ name: '', description: '', image: '' });
        setPreviewImage(null);
        setShowAddCategory(false);
        fetchCategories();
      } else {
        throw new Error(response.message || 'Failed to create category');
      }
    } catch (error: unknown) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create category",
        variant: "destructive",
      });
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    console.log('🔍 Editing category:', category);
    console.log('🆔 Category ID:', category.id, 'Type:', typeof category.id);
    
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description,
      image: category.image
    });
    setPreviewImage(category.image);
    setShowEditModal(true);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCategory || !newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required.",
        variant: "destructive",
      });
      return;
    }

    setCategoryLoading(true);
    try {
      const updateData = {
        name: newCategory.name,
        description: newCategory.description,
        image: newCategory.image || ''
      };
      
      console.log('🔍 Updating category with data:', updateData);
      console.log('🎯 Category ID:', editingCategory.id);
      console.log('🔐 Admin token in localStorage:', localStorage.getItem('adminToken'));
      console.log('🔐 Admin email in localStorage:', localStorage.getItem('adminEmail'));
      
      // Direct fetch test to bypass API client
      console.log('🧪 Testing direct fetch...');
      try {
        const directResponse = await fetch(`http://localhost:5000/api/admin/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify(updateData)
        });
        
        console.log('🧪 Direct fetch response status:', directResponse.status);
        console.log('🧪 Direct fetch response ok:', directResponse.ok);
        
        const directResult = await directResponse.text();
        console.log('🧪 Direct fetch response text:', directResult);
        
        if (directResponse.ok) {
          const parsedResult = JSON.parse(directResult);
          console.log('🧪 Direct fetch parsed result:', parsedResult);
          
          toast({
            title: "Success",
            description: "Category updated successfully!",
            variant: "default",
            className: "bg-green-500 text-white",
          });
          
          setNewCategory({ name: '', description: '', image: '' });
          setPreviewImage(null);
          setEditingCategory(null);
          setShowEditModal(false);
          fetchCategories();
          return;
        }
      } catch (directError) {
        console.error('🧪 Direct fetch error:', directError);
      }
      
      const response = await adminApiClient.updateCategory(editingCategory.id, updateData);

      if (response.success) {
        toast({
          title: "Success",
          description: "Category updated successfully!",
          variant: "default",
          className: "bg-green-500 text-white",
        });
        
        setNewCategory({ name: '', description: '', image: '' });
        setPreviewImage(null);
        setEditingCategory(null);
        setShowEditModal(false);
        fetchCategories();
      } else {
        throw new Error(response.message || 'Failed to update category');
      }
    } catch (error: unknown) {
      console.error('Error updating category:', error);
      
      let errorMessage = "Failed to update category.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Handle specific database column size errors
        if (error.message.includes('IMAGE_TOO_LARGE') || error.message.includes('COLUMN_SIZE_EXCEEDED')) {
          errorMessage = "Image is too large for the database. Please run the database fix or use a smaller image.";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category? This will affect all products in this category.')) {
      return;
    }

    try {
      const response = await adminApiClient.deleteCategory(categoryId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Category deleted successfully.",
          variant: "default",
          className: "bg-green-500 text-white",
        });
        fetchCategories();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete category.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await adminLogout();
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('adminToken');
      toast({
        title: "Success",
        description: "Logged out successfully.",
        variant: "default",
        className: "bg-blue-500 text-white",
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if logout API fails
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('adminToken');
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--light-gray)', color: 'var(--text-primary)' }}>
      {/* Welcome Heading */}
      <div className="py-4 sm:py-6">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold font-poppins italic" style={{ color: 'var(--text-primary)' }}>
          Hi Admin, Welcome to your Dashboard
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <Card className="rounded-xl p-2 font-inter shadow-none" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold mb-2">{categories.length}</h2>
                <p className="font-poppins" style={{ color: 'var(--text-secondary)' }}>Total Categories</p>
              </div>
              <Package className="h-8 w-8" style={{ color: 'var(--text-secondary)' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl p-2 font-inter shadow-none" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold mb-2">{categories.filter(c => c.is_active).length}</h2>
                <p className="font-poppins" style={{ color: 'var(--text-secondary)' }}>Active Categories</p>
              </div>
              <TrendingUp className="h-8 w-8" style={{ color: 'var(--text-secondary)' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl p-2 font-inter shadow-none" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold mb-2">156</h2>
                <p className="font-poppins" style={{ color: 'var(--text-secondary)' }}>Total Vendors</p>
              </div>
              <Users className="h-8 w-8" style={{ color: 'var(--text-secondary)' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl p-2 font-inter shadow-none" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold mb-2">Online</h2>
                <p className="font-poppins" style={{ color: 'var(--text-secondary)' }}>System Status</p>
              </div>
              <Shield className="h-8 w-8" style={{ color: 'var(--text-secondary)' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Management */}
      <div className="mt-6 p-4 rounded-xl mb-6" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Category Management</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Manage product categories that vendors can use</p>
          </div>
          <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
            <DialogTrigger asChild>
            <Button className="text-black" style={{ backgroundColor: '#00FF00' }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter category name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter category description"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="image">Category Image</Label>
                  <div className="space-y-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploadingImage}
                      className="cursor-pointer"
                    />
                    {uploadingImage && (
                      <p className="text-sm text-blue-600">Uploading image...</p>
                    )}
                    {previewImage && (
                      <div className="mt-2">
                        <img 
                          src={previewImage} 
                          alt="Preview" 
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                        <p className="text-xs text-gray-500 mt-1">Image uploaded successfully</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button 
                    type="submit" 
                    className="text-black"
                    style={{ backgroundColor: '#00FF00' }}
                    disabled={categoryLoading}
                  >
                    {categoryLoading ? 'Creating...' : 'Create Category'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Category Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Category Name *</Label>
                <Input
                  id="edit-name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter category name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter category description"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-image">Category Image</Label>
                <div className="space-y-2">
                  <Input
                    id="edit-image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploadingImage}
                    className="cursor-pointer"
                  />
                  {uploadingImage && (
                    <p className="text-sm text-blue-600">Uploading image...</p>
                  )}
                  {previewImage && (
                    <div className="mt-2">
                      <img 
                        src={previewImage} 
                        alt="Preview" 
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <p className="text-xs text-gray-500 mt-1">Image uploaded successfully</p>
                    </div>
                  )}
                  {!previewImage && newCategory.image && (
                    <div className="mt-2">
                      <img 
                        src={newCategory.image} 
                        alt="Current" 
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <p className="text-xs text-gray-500 mt-1">Current image</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  className="text-black"
                  style={{ backgroundColor: '#00FF00' }}
                  disabled={categoryLoading}
                >
                  {categoryLoading ? 'Updating...' : 'Update Category'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first category.</p>
            <Button onClick={() => setShowAddCategory(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Category
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((category) => (
              <div 
                key={category.id} 
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-teal-200"
              >
                {/* Category Image */}
                <div className="relative h-32 bg-gradient-to-br from-teal-50 to-blue-50 overflow-hidden">
                  {category.image ? (
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-6xl opacity-20">📁</div>
                    </div>
                  )}
                  
                  {/* Overlay Actions */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditCategory(category)}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white hover:scale-110 transition-all duration-200"
                        title="Edit Category"
                      >
                        <Edit className="h-4 w-4 text-teal-600" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white hover:scale-110 transition-all duration-200"
                        title="Delete Category"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-md backdrop-blur-sm ${
                      category.is_active 
                        ? 'bg-green-500/90 text-white' 
                        : 'bg-red-500/90 text-white'
                    }`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Category Content */}
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors duration-300">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>

                      {/* Footer Info */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                      <span>Created</span>
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {new Date(category.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                </div>

                {/* Hover Effect Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-teal-300 transition-all duration-300 pointer-events-none"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}