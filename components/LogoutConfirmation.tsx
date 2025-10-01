"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, X } from "lucide-react";

interface LogoutConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userType?: 'admin' | 'vendor';
}

export function LogoutConfirmation({ isOpen, onClose, onConfirm, userType = 'vendor' }: LogoutConfirmationProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blur Background */}
      <div 
        className="absolute inset-0 backdrop-blur-md"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        onClick={onClose}
      />
      
      {/* Confirmation Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md mx-4 sm:mx-8 transform transition-all duration-300 scale-100 w-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-100 rounded-full">
            <LogOut className="h-8 w-8 text-red-600" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            Confirm Logout
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
            Are you sure you want to logout from your {userType === 'admin' ? 'admin' : 'vendor'} account? 
            You will need to login again to access your dashboard.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button
              onClick={onClose}
              variant="outline"
              className="px-6 sm:px-8 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="px-6 sm:px-8 py-2 bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
            >
              Yes, Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
