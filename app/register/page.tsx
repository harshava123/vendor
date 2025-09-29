"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

export default function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        storeName: "",
        address: "",
        language: "English",
        gstNumber: "",
        shopDocuments: [],
        idProof: ""
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.name || !formData.email || !formData.password || !formData.storeName || !formData.address) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Password Mismatch",
                description: "Passwords do not match",
                variant: "destructive",
            });
            return;
        }

        if (formData.password.length < 6) {
            toast({
                title: "Password Too Short",
                description: "Password must be at least 6 characters long",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        
        try {
            // Use backend API for registration
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    storeName: formData.storeName,
                    address: formData.address,
                    gstNumber: formData.gstNumber,
                    language: formData.language,
                    shopDocuments: formData.shopDocuments,
                    idProof: formData.idProof
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Registration failed');
            }

            toast({
                title: "Registration Successful!",
                description: result.message,
                variant: "default",
                className: "bg-green-500 text-white",
            });

            // Redirect to login
            router.push('/login');
            
        } catch (error) {
            toast({
                title: "Registration Failed",
                description: error.message || "An error occurred during registration",
                variant: "destructive",
            });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-6">
            <Card className="w-full max-w-[800px] bg-white rounded-2xl">
                <CardContent className="p-8">
                    <h1 className="text-3xl font-bold mb-8 text-center">Register as Vendor</h1>
                    
                    <div className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <Label className="text-gray-600 mb-1">Vendor Name *</Label>
                                <Input
                                    name="name"
                                    placeholder="Enter Vendor Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full p-2 border-b border-gray-200 focus:border-gray-400 outline-none rounded-none bg-transparent"
                                />
                            </div>

                            <div>
                                <Label className="text-gray-600 mb-1">Email Address *</Label>
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="Enter Email Address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full p-2 border-b border-gray-200 focus:border-gray-400 outline-none rounded-none bg-transparent"
                                />
                            </div>

                            <div>
                                <Label className="text-gray-600 mb-1">Password *</Label>
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="Enter Password (min 6 characters)"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full p-2 border-b border-gray-200 focus:border-gray-400 outline-none rounded-none bg-transparent"
                                />
                            </div>

                            <div>
                                <Label className="text-gray-600 mb-1">Confirm Password *</Label>
                                <Input
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full p-2 border-b border-gray-200 focus:border-gray-400 outline-none rounded-none bg-transparent"
                                />
                            </div>

                            <div>
                                <Label className="text-gray-600 mb-1">Store Name *</Label>
                                <Input
                                    name="storeName"
                                    placeholder="Enter Store Name"
                                    value={formData.storeName}
                                    onChange={handleChange}
                                    className="w-full p-2 border-b border-gray-200 focus:border-gray-400 outline-none rounded-none bg-transparent"
                                />
                            </div>

                            <div>
                                <Label className="text-gray-600 mb-1">Language</Label>
                                <select
                                    name="language"
                                    value={formData.language}
                                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                                    className="w-full p-2 border-b border-gray-200 focus:border-gray-400 outline-none rounded-none bg-transparent"
                                >
                                    <option value="English">English</option>
                                    <option value="Hindi">Hindi</option>
                                    <option value="Telugu">Telugu</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <Label className="text-gray-600 mb-1">Address *</Label>
                            <Input
                                name="address"
                                placeholder="Enter Complete Address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full p-2 border-b border-gray-200 focus:border-gray-400 outline-none rounded-none bg-transparent"
                            />
                        </div>

                        <div>
                            <Label className="text-gray-600 mb-1">GST Number (Optional)</Label>
                            <Input
                                name="gstNumber"
                                placeholder="Enter GST Number"
                                value={formData.gstNumber}
                                onChange={handleChange}
                                className="w-full p-2 border-b border-gray-200 focus:border-gray-400 outline-none rounded-none bg-transparent"
                            />
                        </div>

                        <div className="flex justify-between items-center pt-4">
                            <Button 
                                onClick={() => router.push('/login')}
                                variant="outline"
                                className="px-6"
                            >
                                Back to Login
                            </Button>
                            
                            <Button 
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-8 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                            >
                                {loading ? "Creating Account..." : "Register"}
                            </Button>
                        </div>

                        <div className="text-center text-sm text-gray-600">
                            <p>Already have an account? 
                                <button 
                                    onClick={() => router.push('/login')}
                                    className="text-blue-600 hover:underline ml-1"
                                >
                                    Login here
                                </button>
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
