// API configuration and utility functions
const API_BASE_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api')
  : 'http://localhost:5000/api';

if (typeof window !== 'undefined') {
  console.log('🔧 API_BASE_URL configured as:', API_BASE_URL);
  console.log('🌍 Environment:', process.env.NODE_ENV);
}

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }


  // Set auth token in localStorage
  setAuthToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  // Remove auth token from localStorage
  removeAuthToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  // Get headers for API requests
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Make API request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.includeAuth !== false),
      ...options,
    };

    console.log('🌐 API Request:', {
      url,
      method: config.method || 'GET',
      headers: config.headers,
      baseURL: this.baseURL,
      endpoint
    });

    try {
      const response = await fetch(url, config);
      
      console.log('📡 API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ API request failed:', error);
      throw error;
    }
  }

  // Authentication APIs
  async sendOTP(phone) {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
      includeAuth: false,
    });
  }

  async verifyOTP(phone, otp) {
    const response = await this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
      includeAuth: false,
    });

    if (response.success && response.data.token) {
      this.setAuthToken(response.data.token);
    }

    return response;
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      includeAuth: false,
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });
    this.removeAuthToken();
    return response;
  }

  // Product APIs
  async getProducts(params = {}) {
    const queryParams = new URLSearchParams(params);
    const endpoint = queryParams.toString() 
      ? `/products?${queryParams.toString()}`
      : '/products';
    return this.request(endpoint, { includeAuth: false });
  }

  async getProduct(id) {
    return this.request(`/products/${id}`, { includeAuth: false });
  }

  async createProduct(productData) {
    console.log('🛍️ Creating product with data:', productData);
    console.log('🛍️ Using baseURL:', this.baseURL);
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async getVendorProducts() {
    return this.request('/products/vendor/my-products');
  }

  // Category APIs
  async getCategories() {
    return this.request('/categories', { includeAuth: false });
  }

  async getCategory(id) {
    return this.request(`/categories/${id}`, { includeAuth: true });
  }

  async createCategory(categoryData) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }


  // Order APIs
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(params = {}) {
    const queryParams = new URLSearchParams(params);
    const endpoint = queryParams.toString() 
      ? `/orders?${queryParams.toString()}`
      : '/orders';
    return this.request(endpoint);
  }

  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  async updateOrderStatus(id, status) {
    return this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Cart APIs
  async getCart() {
    return this.request('/cart');
  }

  async addToCart(itemData) {
    return this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async updateCartItem(id, quantity) {
    return this.request(`/cart/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(id) {
    return this.request(`/cart/${id}`, {
      method: 'DELETE',
    });
  }

  async clearCart() {
    return this.request('/cart', {
      method: 'DELETE',
    });
  }

  // Upload APIs
  async uploadSingle(file, type = 'image') {
    const formData = new FormData();
    formData.append(type, file);

    const token = this.getAuthToken();
    const response = await fetch(`${this.baseURL}/upload/single`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return await response.json();
  }

  async uploadMultiple(files, type = 'images') {
    const formData = new FormData();
    files.forEach(file => {
      formData.append(type, file);
    });

    const token = this.getAuthToken();
    const response = await fetch(`${this.baseURL}/upload/multiple`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return await response.json();
  }

  async uploadProductImages(files) {
    console.log('🔄 API Client: Starting image upload...');
    console.log('📁 Files to upload:', files.length);
    
    const formData = new FormData();
    files.forEach((file, index) => {
      console.log(`📄 File ${index + 1}:`, file.name, file.size, 'bytes');
      formData.append('product_images', file);
    });

    const token = this.getAuthToken();
    console.log('🔑 Auth token available:', !!token);
    console.log('🌐 Upload URL:', `${this.baseURL}/upload/product`);
    
    const response = await fetch(`${this.baseURL}/upload/product`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    console.log('📡 Upload response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Upload failed with response:', errorText);
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Upload successful, result:', result);
    return result;
  }

  // Livestream APIs (WebRTC)
  async getActiveLivestreams() {
    return this.request('/livestreams', { includeAuth: false });
  }

  async getLivestream(id) {
    return this.request(`/livestreams/${id}`, { includeAuth: false });
  }

  async createLivestream(title, description, product_id = null) {
    const body = { title, description };
    if (product_id) {
      body.product_id = product_id;
    }
    return this.request('/livestreams/create', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async endLivestream(streamKey) {
    return this.request(`/livestreams/${streamKey}/end`, {
      method: 'POST',
    });
  }

  async getLivestreamStats() {
    return this.request('/livestreams/stats/overview');
  }

  async getVendorLivestreams(product_id = null) {
    console.log('🎥 Calling getVendorLivestreams...', product_id ? `for product: ${product_id}` : '');
    const token = this.getAuthToken();
    console.log('🔑 Token for livestreams:', token ? 'exists' : 'missing');
    
    let url = '/livestreams/vendor/my-streams';
    if (product_id) {
      url += `?product_id=${product_id}`;
    }
    
    return this.request(url);
  }

  async startLivestream(streamKey) {
    return this.request(`/livestreams/${streamKey}/start`, {
      method: 'POST',
    });
  }

  async deleteLivestream(streamId) {
    return this.request(`/livestreams/${streamId}`, {
      method: 'DELETE',
      includeAuth: true
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health', { includeAuth: false });
  }
}

// Create and export API client instance
export const apiClient = new ApiClient();

// Export individual API functions for convenience
export const {
  sendOTP,
  verifyOTP,
  register,
  getProfile,
  logout,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getVendorProducts,
  getCategories,
  getCategory,
  createCategory,
  deleteCategory,
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  uploadSingle,
  uploadMultiple,
  uploadProductImages,
  getLivestreams: getActiveLivestreams,
  getLivestream,
  createLivestream,
  endLivestream,
  getLivestreamStats,
  getVendorLivestreams,
  startLivestream,
  deleteLivestream,
  healthCheck,
} = apiClient;
