"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from '@supabase/supabase-js';
import { adminLogin } from '@/lib/admin-api';
// import { toast } from "@/hooks/use-toast";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://umsznqdichlqsozobqsr.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtc3pucWRpY2hscXNvem9icXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNTMyODAsImV4cCI6MjA3NDYyOTI4MH0.gWD6zibO7L9t7KSfZZj0vDOh9iGeEz0Y9EauEESUeMg'
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if this is a logout redirect (from URL parameters or recent logout)
        const urlParams = new URLSearchParams(window.location.search);
        const isLogout = urlParams.get('logout') === 'true' || 
                        sessionStorage.getItem('justLoggedOut') === 'true';
        
        // If user just logged out, clear everything and don't redirect
        if (isLogout) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminEmail');
          localStorage.removeItem('sb-umsznqdichlqsozobqsr-auth-token');
          localStorage.removeItem('userName');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('vendor_token');
          sessionStorage.removeItem('justLoggedOut');
          await supabase.auth.signOut();
          setIsInitialized(true);
          return;
        }
        
        // Check if admin is already logged in
        const adminEmail = localStorage.getItem('adminEmail');
        const adminToken = localStorage.getItem('adminToken');
        
        if (adminEmail === 'Admin@gmail.com' && adminToken) {
          router.push("/admin/dashboard");
          return;
        }
        
        // Check if vendor is already logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.access_token) {
          localStorage.setItem('authToken', session.access_token);
          router.push("/products");
          return;
        }
        
        // Clear any stale tokens
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('sb-umsznqdichlqsozobqsr-auth-token');
        
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      // Check if it's admin credentials first
      if (email === 'Admin@gmail.com' && password === 'Admin@12') {
        const adminResponse = await adminLogin(email, password);
        
        if (adminResponse.success) {
          // Store admin session immediately
          localStorage.setItem('adminEmail', email);
          localStorage.setItem('adminToken', adminResponse.data.token);
          
          // Redirect immediately without waiting for toast
          router.push("/admin/dashboard");
          return;
        } else {
          setError(adminResponse.message || 'Admin login failed');
          return;
        }
      }
      
      // Regular vendor login using Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        // Store token and user data immediately
        if (data.session?.access_token) {
          localStorage.setItem('authToken', data.session.access_token);
        }
        
        // Store user information
        if (data.user.email) {
          localStorage.setItem('userEmail', data.user.email);
        }
        if (data.user.user_metadata?.full_name) {
          localStorage.setItem('userName', data.user.user_metadata.full_name);
        } else if (data.user.email) {
          // Extract name from email if no full name is available
          const nameFromEmail = data.user.email.split('@')[0];
          localStorage.setItem('userName', nameFromEmail);
        }
        
        // Redirect immediately without waiting for toast
        router.push("/products");
      }
    } catch (err) {
      console.log(err);
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex overflow-hidden">
      {/* Left Section - Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-16">
        <div className="text-center text-white">
          {/* Logo */}
          <div className="mb-12">
            <img
              src="/images/logo.png"
              alt="Trullu Logo"
              width={120}
              height={120}
              className="mx-auto"
            />
          </div>

          {/* Welcome Text */}
          <h1 className="text-5xl font-bold mb-6">
            Welcome Back
          </h1>
          <p className="text-2xl font-semibold mb-4">
            Where Commerce Meets Innovation
          </p>
          <p className="text-lg text-gray-300 max-w-md mx-auto">
            Your gateway to seamless online selling and business growth
          </p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Sign In</h2>
            <p className="text-gray-600">
              Access your dashboard and start managing your business
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black placeholder-gray-500"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black placeholder-gray-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-black font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#98FF98' }}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            {/* Register Link */}
            <div className="text-center">
          <p className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <button 
                  type="button"
                  onClick={() => router.push('/register')}
                  className="font-medium hover:underline"
                  style={{ color: '#98FF98' }}
                >
                  Create Account
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}