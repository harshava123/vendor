"use client"

import Image from 'next/image';

interface TrulluLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark' | 'teal';
  className?: string;
  showText?: boolean;
}

export function TrulluLogo({ size = 'md', variant = 'teal', className = '', showText = true }: TrulluLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const variantStyles = {
    light: {
      bg: 'rgba(255, 255, 255, 0.2)',
      text: 'text-white'
    },
    dark: {
      bg: 'rgba(30, 41, 59, 0.1)',
      text: 'text-slate-800'
    },
    teal: {
      bg: 'rgba(20, 184, 166, 0.1)',
      text: 'text-teal-600'
    }
  };

  const style = variantStyles[variant];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Actual Trullu Logo Image */}
      <div 
        className={`relative flex items-center justify-center rounded-md overflow-hidden ${sizeClasses[size]}`}
        style={{ backgroundColor: style.bg }}
      >
        <Image
          src="/images/logo.png"
          alt="Trullu Logo"
          width={size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 48 : 64}
          height={size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 48 : 64}
          className="object-contain"
          style={{ 
            filter: variant === 'light' ? 'brightness(0) invert(1)' : 'none'
          }}
        />
      </div>

      {/* "Trullu" text */}
      {showText && (
        <span 
          className={`font-bold ${textSizeClasses[size]} ${style.text}`}
          style={{ color: variant === 'light' ? '#ffffff' : '#14b8a6' }}
        >
          Trullu
        </span>
      )}
    </div>
  );
}
