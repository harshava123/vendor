# 🚀 AWS Backend + Vercel Frontend Deployment Guide

This guide covers deploying the Vendor Admin Bazaar application with **AWS for backend** and **Vercel for frontend**.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   AWS Backend   │    │   Supabase      │
│   Frontend      │◄──►│   (EC2/EB)      │◄──►│   Database      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Pre-Deployment Checklist

### ✅ Database Setup (CRITICAL - Run First)
1. **Run SQL Migration in Supabase Dashboard**:
   ```sql
   -- Add product_id column to livestreams table
   DO $$ 
   BEGIN
       IF NOT EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'livestreams' AND column_name = 'product_id'
       ) THEN
           ALTER TABLE livestreams 
           ADD COLUMN product_id UUID REFERENCES products(id) ON DELETE SET NULL;
           
           CREATE INDEX idx_livestreams_product_id ON livestreams(product_id);
           
           RAISE NOTICE 'Migration completed successfully';
       END IF;
   END $$;
   ```

### ✅ Environment Variables Preparation
- [ ] Supabase production credentials
- [ ] AWS deployment credentials
- [ ] Vercel deployment credentials
- [ ] Custom domain certificates (if using custom domains)

## 🚀 AWS Backend Deployment

### Option 1: AWS Elastic Beanstalk (Recommended)

#### 1. Prepare Backend for AWS
```bash
cd backend
npm install
```

#### 2. Create .ebextensions directory and config
```bash
mkdir .ebextensions
```

Create `backend/.ebextensions/nodecommand.config`:
```yaml
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm start"
    NodeVersion: "18.x"
```

#### 3. Initialize EB Application
```bash
# Install EB CLI
pip install awsebcli

# Initialize EB
eb init vendor-admin-backend --region us-east-1 --platform node.js

# Create environment
eb create production --instance-type t3.small
```

#### 4. Set Environment Variables
```bash
eb setenv \
  NODE_ENV=production \
  PORT=5000 \
  SUPABASE_URL=your_production_supabase_url \
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key \
  JWT_SECRET=your_secure_jwt_secret \
  CORS_ORIGIN=https://your-vercel-app.vercel.app
```

#### 5. Deploy
```bash
eb deploy
```

### Option 2: AWS EC2 with Docker

#### 1. Build and Push Docker Image
```bash
# Build image
docker build -t vendor-admin-backend .

# Tag for ECR
docker tag vendor-admin-backend:latest your-account.dkr.ecr.region.amazonaws.com/vendor-admin-backend:latest

# Push to ECR
docker push your-account.dkr.ecr.region.amazonaws.com/vendor-admin-backend:latest
```

#### 2. Deploy to EC2
```bash
# Pull and run on EC2
docker pull your-account.dkr.ecr.region.amazonaws.com/vendor-admin-backend:latest
docker run -d -p 5000:5000 \
  -e NODE_ENV=production \
  -e SUPABASE_URL=your_production_supabase_url \
  -e SUPABASE_SERVICE_ROLE_KEY=your_service_role_key \
  -e JWT_SECRET=your_secure_jwt_secret \
  -e CORS_ORIGIN=https://your-vercel-app.vercel.app \
  --name vendor-admin-backend \
  your-account.dkr.ecr.region.amazonaws.com/vendor-admin-backend:latest
```

### ✅ AWS Backend Health Check
```bash
# Test health endpoint
curl https://your-aws-backend-url/api/health

# Test categories endpoint
curl https://your-aws-backend-url/api/categories
```

## 🌐 Vercel Frontend Deployment

### 1. Prepare Frontend for Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login
```

### 2. Environment Variables Setup
Create `.env.production`:
```bash
NEXT_PUBLIC_API_URL=https://your-aws-backend-url/api
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

### 3. Deploy to Vercel
```bash
# Deploy
vercel --prod

# Or deploy with environment variables
vercel --prod --env NEXT_PUBLIC_API_URL=https://your-aws-backend-url/api
```

### 4. Set Environment Variables in Vercel Dashboard
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_API_URL`: `https://your-aws-backend-url/api`
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key

### 5. Update CORS in AWS Backend
After getting your Vercel URL, update the CORS settings:
```bash
eb setenv CORS_ORIGIN=https://your-vercel-app.vercel.app
eb deploy
```

## 🔧 Configuration Updates

### Update API Client for Production
The API client should automatically use the production URL from environment variables:

```javascript
// lib/api.js - Already configured
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
```

### Update Image Domains
Update `next.config.ts` with your actual AWS backend domain:
```typescript
images: {
  domains: [
    'your-actual-aws-backend-domain.com',
    'your-aws-backend-domain.elasticbeanstalk.com'
  ]
}
```

## 🧪 Post-Deployment Testing

### 1. Backend Health Checks
```bash
# Health endpoint
curl https://your-aws-backend.com/api/health

# Categories endpoint
curl https://your-aws-backend.com/api/categories

# Test with CORS
curl -H "Origin: https://your-vercel-app.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: authorization" \
     -X OPTIONS \
     https://your-aws-backend.com/api/categories
```

### 2. Frontend Testing
1. **Visit Vercel URL**: `https://your-vercel-app.vercel.app`
2. **Test Admin Login**: Verify admin authentication works
3. **Test Vendor Login**: Verify vendor authentication works
4. **Test Livestream Flow**: 
   - Navigate to Categories → Products → Streams
   - Create a new stream
   - Verify product isolation works

### 3. End-to-End Testing
1. **Admin Flow**: Login → Create Categories → Manage System
2. **Vendor Flow**: Login → Navigate Products → Create Streams
3. **Product Isolation**: Create streams for different products, verify isolation

## 🔒 Security Configuration

### AWS Security Groups
Ensure your AWS security group allows:
- **Port 5000**: For backend API
- **Port 443**: For HTTPS (if using ALB)
- **Port 80**: For HTTP (if using ALB)

### Vercel Security Headers
The `vercel.json` includes security headers for API routes.

## 📊 Monitoring and Logs

### AWS Monitoring
- **CloudWatch**: Monitor backend logs and metrics
- **Health Checks**: Set up ALB health checks on `/api/health`

### Vercel Monitoring
- **Vercel Analytics**: Monitor frontend performance
- **Function Logs**: Check serverless function logs

## 🔄 Deployment Automation

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to AWS and Vercel

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to AWS EB
        run: |
          eb deploy production

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: |
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

## 🐛 Troubleshooting

### Common Issues

#### CORS Errors
- **Problem**: Frontend can't connect to backend
- **Solution**: Update CORS_ORIGIN in AWS backend with Vercel URL

#### Database Connection Issues
- **Problem**: Backend can't connect to Supabase
- **Solution**: Verify SUPABASE_SERVICE_ROLE_KEY is correct

#### Image Loading Issues
- **Problem**: Images not loading in frontend
- **Solution**: Update image domains in next.config.ts

### Debug Commands
```bash
# Check backend logs
eb logs

# Check Vercel deployment logs
vercel logs

# Test API connectivity
curl -v https://your-aws-backend.com/api/health
```

## 🎯 Success Criteria

Deployment is successful when:
- ✅ AWS backend responds to health checks
- ✅ Vercel frontend loads without errors
- ✅ Admin and vendor login work
- ✅ Product-specific livestream flow works
- ✅ No CORS errors in browser console
- ✅ Database migrations applied successfully

## 📞 Support

### AWS Issues
- Check CloudWatch logs
- Verify security groups
- Test backend endpoints directly

### Vercel Issues
- Check Vercel function logs
- Verify environment variables
- Test frontend build locally

### Database Issues
- Verify Supabase connection
- Check migration status
- Test database queries directly

---

## 🚀 Quick Start Commands

```bash
# 1. Deploy Backend to AWS
cd backend
eb deploy production

# 2. Deploy Frontend to Vercel
cd ..
vercel --prod

# 3. Update CORS with Vercel URL
eb setenv CORS_ORIGIN=https://your-vercel-app.vercel.app
eb deploy

# 4. Test deployment
curl https://your-aws-backend.com/api/health
```

**Your AWS + Vercel deployment is now ready! 🎉**
