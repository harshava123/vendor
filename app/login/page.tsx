"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import LoaderOverlay from "@/components/ui/Loader";
import { Poppins } from "next/font/google";
import { Mail, Lock } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { createClient } from '@supabase/supabase-js';
import { adminLogin } from '@/lib/admin-api';
const poppins = Poppins({ weight: ["400", "600", "700"], subsets: ["latin"] });

// Initialize Supabase client with error handling
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://umsznqdichlqsozobqsr.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtc3pucWRpY2hscXNvem9icXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNTMyODAsImV4cCI6MjA3NDYyOTI4MH0.gWD6zibO7L9t7KSfZZj0vDOh9iGeEz0Y9EauEESUeMg',
  {
    auth: {
      autoRefreshToken: false, // Disable auto refresh to prevent token errors
      persistSession: false,   // Don't persist session to avoid stale tokens
      detectSessionInUrl: false // Don't detect session in URL
    }
  }
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Initialize authentication state only once
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if admin is already logged in
        const adminEmail = localStorage.getItem('adminEmail');
        const adminToken = localStorage.getItem('adminToken');
        
        if (adminEmail === 'Admin@gmail.com' && adminToken) {
          console.log('🔐 Admin session found, redirecting to admin dashboard...');
          router.push("/admin/dashboard");
          return;
        }
        
        // Check if vendor is already logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.access_token) {
          // Vendor is already logged in, redirect to dashboard
          localStorage.setItem('authToken', session.access_token);
          router.push("/livestream");
          return;
        }
        
        // Clear any stale tokens
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('sb-umsznqdichlqsozobqsr-auth-token');
        
        // Sign out any existing session
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [router]);


  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      // Check if it's admin credentials first
      if (email === 'Admin@gmail.com' && password === 'Admin@12') {
        console.log('🔐 Admin login detected, using admin authentication...');
        
        // Use admin authentication
        const adminResponse = await adminLogin(email, password);
        
        if (adminResponse.success) {
          // Store admin session info
          localStorage.setItem('adminEmail', email);
          console.log('🔐 Admin login successful, token stored:', adminResponse.data.token);
          console.log('🔐 Admin token in localStorage:', localStorage.getItem('adminToken'));
          
          toast({
            title: "Admin Login Successful",
            description: "Welcome to Admin Dashboard!",
            variant: "default",
            className: "bg-blue-500 text-white",
          });
          
          router.push("/admin/dashboard");
          return;
        } else {
          setError(adminResponse.message || 'Admin login failed');
          toast({
            title: "Admin Login Failed",
            description: adminResponse.message || 'Invalid admin credentials',
            variant: "destructive",
          });
          return;
        }
      }
      
      // Regular vendor login using Supabase authentication
      console.log('👤 Vendor login detected, using Supabase authentication...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setError(error.message);
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (data.user) {
        // Store the session token
        if (data.session?.access_token) {
          localStorage.setItem('authToken', data.session.access_token);
        }
        
        toast({
          title: "Login Successful",
          description: "Welcome to Vendor Admin Bazaar!",
          variant: "default",
          className: "bg-green-500 text-white",
        });
        
        router.push("/livestream");
      }
    } catch (err) {
      console.log(err);
      setError("Login failed");
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${poppins.className} flex h-screen w-screen`}>
      {!isInitialized ? (
        <div className="w-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#4361EE] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Left Dark Section */}
          <div className="w-1/2">
            <img src="/images/leftPageBackground.png" className="opacity-90 filter grayscale brightness-10" alt="leftPageBackground"  />
          </div>
          {/* Right Login Section */}
          <div className="w-1/2  flex justify-center items-center bg-white">
            <Card className="w-full">
              <CardHeader className="text-2xl font-poppins font-bold text-left text-[#262626]">Login</CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className={email ? "text-sm font-medium text-[#4361EE]" : "text-sm font-medium text-[#262626]"}>Email Address</label>
                  <div className="flex items-center border border-[#D8D8D8] rounded-md p-2">
                    <Mail className={email ? "mr-2 text-[#4361EE]" : "mr-2 text-[#D8D8D8]"} />
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-none focus:text-[#4361EE] focus:outline-none placeholder:text-[#D8D8D8]"
                    />
                  </div>
                </div>
                
                <div>
                  <label className={password ? "text-sm font-medium text-[#4361EE]" : "text-sm font-medium text-[#262626]"}>Password</label>
                  <div className="flex items-center border border-[#D8D8D8] rounded-md p-2">
                    <Lock className={password ? "mr-2 text-[#4361EE]" : "mr-2 text-[#D8D8D8]"} />
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-none focus:text-[#4361EE] focus:outline-none placeholder:text-[#D8D8D8]"
                    />
                  </div>
                </div>
               
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button onClick={handleLogin} className="w-full text-white bg-[#2BA33E] cursor-pointer hover:bg-green-700" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account? 
                    <button 
                      onClick={() => router.push('/register')}
                      className="text-[#4361EE] hover:underline ml-1"
                    >
                      Register here
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          {loading && <LoaderOverlay />}
        </>
      )}
    </div>
  );
}
