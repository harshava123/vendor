"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import LoaderOverlay from "@/components/ui/Loader";
import { Poppins } from "next/font/google";
import { KeyRound } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import Cookies from "js-cookie";

const poppins = Poppins({ weight: ["400", "600", "700"], subsets: ["latin"] });

const CountdownTimer = ({ onResend }: { onResend: () => void }) => {
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <p className="text-sm text-gray-500 mt-2">
      {countdown > 0 ? (
        `Resend OTP in ${countdown}s`
      ) : (
        <button onClick={onResend} className="text-[#4361EE]">
          Resend OTP
        </button>
      )}
    </p>
  );
};

export default function OTPVerification() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const mobileNumber = Cookies.get("mobileNumber");
      
      // Use real backend API for OTP verification
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: mobileNumber,
          otp: otp
        })
      });

      const data = await response.json();
      
      if (data.success) {
        if (data.requiresRegistration) {
          // User needs to register - redirect to registration
          toast({
            title: "OTP Verified",
            description: "Please complete your registration to continue.",
            variant: "default",
            className: "bg-blue-500 text-white",
          });
          router.push("/register");
        } else if (data.token) {
          // User exists - login successful
          Cookies.set("token", data.token, { expires: 7, path: "/" });
          localStorage.setItem('authToken', data.token);
          
          toast({
            title: "Success",
            description: "OTP verified successfully! Welcome to Vendor Admin Bazaar.",
            variant: "default",
            className: "bg-green-500 text-white",
          });
          router.push("/livestream");
        }
      } else {
        throw new Error(data.message || "Invalid OTP");
      }
    } catch (err) {
      console.log(err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Invalid OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      // Dummy resend: generate a new fake orderId to simulate resend
      const newOrderId = `ORD-${Math.floor(Math.random() * 1000000)}`;
      Cookies.set("orderId", newOrderId, { path: "/" });
      toast({
        title: "Success",
        description: "OTP resent successfully",
        variant: "default",
        className: "bg-green-500 text-white",
      });
    } catch (err) {
      console.log(err);
      toast({
        title: "Error",
        description: "Failed to resend OTP",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`${poppins.className} flex h-screen w-screen`}>
      <div className="w-1/2 bg-black"></div>
      <div className="w-1/2 flex justify-center items-center bg-white">
        <Card className="w-full mx-8">
          <CardHeader className="text-2xl font-poppins font-bold text-left text-[#262626] px-6">
            Verify OTP
          </CardHeader>
          <CardContent className="space-y-4 px-6">
            <div>
              <label className={otp ? "text-sm font-medium text-[#4361EE]" : "text-sm font-medium text-[#262626]"}>
                Enter OTP
              </label>
              <div className="flex items-center border border-[#D8D8D8] rounded-md p-2 mt-1">
                <KeyRound className={otp ? "mr-2 text-[#4361EE]" : "mr-2 text-[#D8D8D8]"} />
                <Input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="border-none focus:text-[#4361EE] focus:outline-none placeholder:text-[#D8D8D8] w-full"
                  maxLength={6}
                />
              </div>
              <CountdownTimer onResend={handleResendOtp} />
            </div>
            <Button 
              onClick={handleVerifyOtp} 
              className="w-full text-white bg-[#2BA33E] cursor-pointer hover:bg-green-700 mt-4" 
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          </CardContent>
        </Card>
      </div>
      {loading && <LoaderOverlay />}
    </div>
  );
}