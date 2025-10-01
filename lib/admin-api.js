// Admin API configuration and utility functions
const API_BASE_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api')
  : 'http://localhost:5000/api';

if (typeof window !== 'undefined') {
  console.log('🔧 Admin API_BASE_URL configured as:', API_BASE_URL);
  console.log('🌍 Environment:', process.env.NODE_ENV);
}

class AdminApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get admin token from localStorage
  getAdminToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminToken');
    }
    return null;
  }

  // Set admin token in localStorage
  setAdminToken(token) {
    if (typeof window !== 'undefined') {
      console.log('🔐 Storing admin token:', token);
      localStorage.setItem('adminToken', token);
      console.log('🔐 Admin token stored successfully');
    } else {
      console.log('🔐 Cannot store token - window not available');
    }
  }

  // Remove admin token from localStorage
  removeAdminToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
    }
  }

  // Get headers for API requests
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAdminToken();
      console.log('🔐 Getting admin token:', token);
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        console.log('🔐 Authorization header set:', `Bearer ${token}`);
      } else {
        console.warn('⚠️ No admin token found in localStorage');
      }
    }

    return headers;
  }

  // Make API request
  async request(endpoint, options = {}) {
    console.log('🚀 ADMIN API REQUEST STARTED - This should always show!');
    
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.includeAuth !== false),
      ...options,
    };

    console.log('🌐 Admin API Request:', {
      url,
      method: options.method || 'GET',
      headers: config.headers,
      body: options.body
    });

    try {
      const response = await fetch(url, config);
      
      console.log('📡 Admin API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        let errorData;
        try {
          const responseText = await response.text();
          console.error('❌ Raw error response text:', responseText);
          
          if (responseText.trim()) {
            errorData = JSON.parse(responseText);
          } else {
            errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
          }
        } catch (jsonError) {
          console.error('❌ Failed to parse error response as JSON:', jsonError);
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error('❌ Admin API Error Response:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('❌ Failed to parse success response as JSON:', jsonError);
        throw new Error('Invalid JSON response from server');
      }
      
      console.log('✅ Admin API Success Response:', result);
      return result;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('❌ Network error - Backend might be down:', error);
        throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
      }
      console.error('❌ Admin API request failed:', error);
      throw error;
    }
  }

  // Admin Authentication APIs
  async login(email, password) {
    console.log('🔐 Admin login attempt for:', email);
    console.log('🔐 Using admin API baseURL:', this.baseURL);
    
    const response = await this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      includeAuth: false,
    });

    console.log('🔐 Admin login response:', response);

    if (response.success && response.data.token) {
      console.log('🔐 Admin token received, storing...');
      this.setAdminToken(response.data.token);
    }

    return response;
  }

  async getProfile() {
    return this.request('/admin/profile');
  }

  async logout() {
    const response = await this.request('/admin/logout', {
      method: 'POST',
    });
    this.removeAdminToken();
    return response;
  }

  // Admin Category APIs
  async getCategories() {
    return this.request('/admin/categories');
  }

  async createCategory(categoryData) {
    return this.request('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id, categoryData) {
    return this.request(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id) {
    return this.request(`/admin/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Upload category image
  async uploadCategoryImage(file) {
    const formData = new FormData();
    formData.append('category_image', file);

    const token = this.getAdminToken();
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}/upload/admin/category`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Upload failed');
    }

    // Return the base64 data for immediate use
    return {
      ...result,
      data: {
        ...result.data,
        // Use base64 data as the primary image source
        imageData: result.data.base64
      }
    };
  }
}

// Create and export admin API client instance
export const adminApiClient = new AdminApiClient();

// Export individual API functions with proper binding
export const adminLogin = adminApiClient.login.bind(adminApiClient);
export const adminGetProfile = adminApiClient.getProfile.bind(adminApiClient);
export const adminLogout = adminApiClient.logout.bind(adminApiClient);
export const adminGetCategories = adminApiClient.getCategories.bind(adminApiClient);
export const adminCreateCategory = adminApiClient.createCategory.bind(adminApiClient);
export const adminUpdateCategory = adminApiClient.updateCategory.bind(adminApiClient);
export const adminDeleteCategory = adminApiClient.deleteCategory.bind(adminApiClient);

// Debug function - can be called from browser console
export const debugAdminToken = () => {
  console.log('🔍 Debug Admin Token Info:');
  console.log('Admin Token:', localStorage.getItem('adminToken'));
  console.log('Admin Email:', localStorage.getItem('adminEmail'));
  console.log('API Base URL:', adminApiClient.baseURL);
  return {
    token: localStorage.getItem('adminToken'),
    email: localStorage.getItem('adminEmail'),
    baseURL: adminApiClient.baseURL
  };
};

// Make debug function available globally for testing
if (typeof window !== 'undefined') {
  window.debugAdminToken = debugAdminToken;
}
