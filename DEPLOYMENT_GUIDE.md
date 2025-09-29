# 🚀 Production Deployment Guide

## ⚠️ Current Limitations
The current setup with localhost URLs will **NOT** work in production. Here's how to fix it:

## 🔧 Required Changes for Production

### 1. **Update Domain Configuration**

#### Vendor Admin Frontend (`next.config.ts`):
```typescript
// Replace 'your-production-domain.com' with your actual domain
process.env.NODE_ENV === 'production' ? 'your-production-domain.com' : 'localhost'
```

#### Bazar Story Frontend (`bazar_story-master/next.config.ts`):
```typescript
// Replace 'your-production-domain.com' with your actual domain
...(process.env.NODE_ENV === 'production' ? [{
  protocol: 'https' as const,
  hostname: 'your-production-domain.com',
  port: '',
  pathname: '/uploads/**',
}] : []),
```

### 2. **Environment Variables**

Create `.env.local` files with production URLs:

#### Vendor Admin `.env.local`:
```
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_WS_URL=https://your-api-domain.com
```

#### Bazar Story `.env.local`:
```
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_WS_URL=https://your-api-domain.com
```

### 3. **Backend Environment Variables**

#### Backend `.env`:
```
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NODE_ENV=production
```

## 🏗️ Deployment Options

### Option 1: **Single Server Deployment**
- Deploy everything on one server
- Use nginx to serve static files and proxy API
- Images stored locally in `/uploads` directory

### Option 2: **Cloud Storage (Recommended)**
- Use AWS S3, Google Cloud Storage, or similar
- Update upload routes to save to cloud storage
- Update image URLs to use CDN

### Option 3: **Containerized Deployment**
- Use Docker containers
- Deploy with Docker Compose or Kubernetes
- Use persistent volumes for uploads

## 🔄 Migration Steps

1. **Update domain configurations** in both frontends
2. **Set environment variables** for production
3. **Configure your deployment platform** (Vercel, Netlify, AWS, etc.)
4. **Test image uploads** in production environment
5. **Set up SSL certificates** for HTTPS

## 📁 File Storage Considerations

### Current Setup:
- Files stored in `backend/uploads/`
- URLs: `http://localhost:5000/uploads/filename`

### Production Setup:
- Files stored in cloud storage (S3, etc.)
- URLs: `https://cdn.yourdomain.com/uploads/filename`

## 🚨 Important Notes

- **Update all hardcoded localhost references**
- **Configure proper CORS settings**
- **Set up SSL certificates**
- **Configure proper file permissions**
- **Set up backup strategies for uploaded files**

## 🔧 Quick Fix for Testing

If you want to test with a staging environment:

1. Use a subdomain like `staging.yourdomain.com`
2. Update the configurations with the staging domain
3. Deploy to staging first before production

## 📞 Support

After deployment, test thoroughly:
- Image uploads work
- Images display correctly
- All API endpoints respond
- WebRTC streaming functions
- Authentication works across domains

