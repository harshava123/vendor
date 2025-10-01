# Production Environment Variables Guide

This guide details all required environment variables for deploying the Vendor Admin Bazaar system to production.

---

## 🚀 Architecture Overview

- **Backend**: Node.js/Express API hosted on AWS (EC2, Elastic Beanstalk, or Lambda)
- **Vendor Admin Frontend**: Next.js app on Vercel (`vendorAdminBazaar`)
- **Customer Frontend**: Next.js app on Vercel (`bazar_story-master`)
- **Database**: Supabase (PostgreSQL)
- **File Storage**: AWS S3
- **Real-time**: Socket.IO + WebRTC

---

## 📦 Backend Environment Variables (AWS)

Create a `.env` file in the `backend/` folder with these variables:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000

# Supabase Database Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration (comma-separated URLs)
CORS_ORIGIN=https://vendor-admin-bazaar.vercel.app,https://bazar-story.vercel.app

# AWS S3 Configuration (for file uploads)
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_S3_BUCKET=trullu-product-images

# Optional: Email Configuration (if using Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Optional: Twilio Configuration (for OTP SMS)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### 🔑 How to Get Supabase Credentials

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **Settings** → **API**
3. Copy:
   - `SUPABASE_URL`: Project URL
   - `SUPABASE_ANON_KEY`: `anon` public key
   - `SUPABASE_SERVICE_ROLE_KEY`: `service_role` secret key (⚠️ NEVER expose this to frontend!)

### 📝 Generate JWT Secret

```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🎨 Vendor Admin Frontend (Vercel)

### Environment Variables in Vercel Dashboard

Go to Vercel Project → **Settings** → **Environment Variables** and add:

```bash
# Backend API URL (your AWS backend URL)
NEXT_PUBLIC_API_URL=https://your-aws-backend-url.com/api

# Supabase (for client-side auth)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# WebSocket URL (for real-time features)
NEXT_PUBLIC_WS_URL=https://your-aws-backend-url.com

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

### 📌 Important Notes

- `NEXT_PUBLIC_API_URL` must point to your AWS backend (e.g., `https://api.yourdomain.com/api` or `http://your-ec2-ip:5000/api`)
- Do NOT include trailing slashes
- All `NEXT_PUBLIC_*` variables are exposed to the browser
- Never put `SUPABASE_SERVICE_ROLE_KEY` in frontend env vars

---

## 🛒 Customer Frontend (bazar_story-master on Vercel)

### Environment Variables in Vercel Dashboard

```bash
# Backend API URL (same AWS backend)
NEXT_PUBLIC_API_URL=https://your-aws-backend-url.com/api

# Supabase (for customer auth if needed)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# WebSocket URL (for real-time livestream updates)
NEXT_PUBLIC_WS_URL=https://your-aws-backend-url.com

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

---

## 🗄️ AWS S3 Storage Setup

### Create S3 Bucket

1. Go to AWS Console → **S3**
2. Click **Create bucket**
3. Bucket name: `trullu-product-images` (must be globally unique)
4. Region: **Asia Pacific (Mumbai) ap-south-1**
5. **Uncheck** "Block all public access" (needed for public image URLs)
6. Acknowledge the warning
7. Keep other defaults (versioning: disabled, encryption: default)
8. Click **Create bucket**

### Create IAM User with S3 Permissions

1. Go to AWS Console → **IAM** → **Users**
2. Click **Create user**
3. Username: `trullu-s3-uploader`
4. Don't enable console access
5. Click **Next**
6. Attach policy: **AmazonS3FullAccess** (or create custom policy)
7. Create user, then create **Access Keys**
8. Save: **Access Key ID** and **Secret Access Key** to your `.env` file

### Folder Structure in Bucket

The backend automatically organizes uploads as:
- `products/` - Product images (multiple per product)
- `categories/` - Category images
- `profiles/` - User profile images
- `images/` - General images

### S3 Bucket Policy (Optional - for better security)

If you want finer control, add this bucket policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::trullu-product-images/*"
        }
    ]
}
```

---

## 🔧 Backend Deployment Checklist (AWS)

### Option 1: AWS Elastic Beanstalk

1. Install EB CLI: `pip install awsebcli`
2. Initialize: `cd backend && eb init`
3. Create environment: `eb create production`
4. Set environment variables:
   ```bash
   eb setenv NODE_ENV=production SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... JWT_SECRET=...
   ```
5. Deploy: `eb deploy`

### Option 2: AWS EC2

1. SSH into EC2 instance
2. Install Node.js 18+
3. Clone your repo
4. Create `.env` file with production variables
5. Install dependencies: `npm install --production`
6. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start src/app.js --name vendor-backend
   pm2 startup
   pm2 save
   ```
7. Configure nginx as reverse proxy:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Option 3: AWS Lambda (Serverless)

- Use AWS SAM or Serverless Framework
- Set environment variables in `serverless.yml` or SAM template
- Configure API Gateway for HTTP endpoints

---

## 🌐 Frontend Deployment Checklist (Vercel)

### Vendor Admin Bazaar

1. Connect GitHub repo to Vercel
2. Set Root Directory: `./`
3. Framework Preset: **Next.js**
4. Add environment variables (see above)
5. Deploy

### Bazar Story (Customer App)

1. Connect GitHub repo to Vercel
2. Set Root Directory: `./bazar_story-master`
3. Framework Preset: **Next.js**
4. Add environment variables (see above)
5. Deploy

---

## 🔒 Security Checklist

- [ ] Change admin credentials from `Admin@gmail.com/Admin@12` to secure values
- [ ] Use environment variables for all secrets (no hardcoded values)
- [ ] Enable HTTPS on AWS backend (use AWS Certificate Manager or Let's Encrypt)
- [ ] Set up CORS to only allow your Vercel domains
- [ ] Review and restrict Supabase RLS (Row Level Security) policies
- [ ] Enable rate limiting on API endpoints (already configured)
- [ ] Use httpOnly cookies for auth tokens (recommended upgrade)
- [ ] Set up monitoring and error tracking (Sentry, CloudWatch)

---

## 🧪 Testing Production Setup

### Test Backend Health

```bash
curl https://your-aws-backend-url.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Vendor Admin Backend is running",
  "timestamp": "2025-10-01T12:00:00.000Z"
}
```

### Test Frontend Connectivity

1. Open browser console on Vercel deployment
2. Check for: `🔧 API_BASE_URL configured as: https://your-aws-backend-url.com/api`
3. Test login and product creation

### Test File Upload

1. Upload a product image via vendor admin
2. Verify it appears in AWS S3 bucket `trullu-product-images` under `products/` folder
3. Check that the S3 URL is publicly accessible (e.g., `https://trullu-product-images.s3.ap-south-1.amazonaws.com/products/...`)
4. Test multiple image uploads for a single product

---

## 📊 Required Supabase Database Tables

Ensure these tables exist (use migrations):

- `users` - User accounts
- `vendor_profiles` - Vendor business info
- `categories` - Product categories
- `products` - Product listings
- `orders` - Customer orders
- `order_items` - Order line items
- `cart` - Shopping cart
- `livestreams` - Livestream sessions
- `otp_verifications` - OTP login codes

Run migrations:
```bash
cd backend
npm run migrate
```

---

## 🆘 Troubleshooting

### CORS Errors

- Ensure `CORS_ORIGIN` includes your Vercel URLs
- Add `*.vercel.app` for preview deployments

### 401 Unauthorized Errors

- Verify `SUPABASE_ANON_KEY` matches in both backend and frontend
- Check JWT_SECRET is set correctly
- Ensure tokens are being sent in `Authorization: Bearer <token>` header

### File Upload Fails

- Verify AWS S3 bucket `trullu-product-images` exists and allows public read
- Check `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are correct
- Verify IAM user has S3 write permissions
- Ensure file size is under 10MB limit
- Check S3 bucket region matches `AWS_REGION` env var

### WebRTC Livestream Not Working

- Verify WebSocket connection to `NEXT_PUBLIC_WS_URL`
- Check AWS Security Group allows inbound on port 5000
- Ensure backend server is running with Socket.IO initialized

---

## 📝 Post-Deployment Tasks

1. **Test all major flows:**
   - Admin login → Create category
   - Vendor login → Add product
   - Customer browsing → View products
   - Livestream creation → Start stream

2. **Monitor logs:**
   - AWS CloudWatch (backend)
   - Vercel logs (frontends)
   - Supabase logs (database)

3. **Set up backups:**
   - Supabase automatic backups (check your plan)
   - Regular database exports

4. **Domain setup:**
   - Point custom domain to Vercel (vendor-admin.yourdomain.com)
   - Point customer domain to Vercel (shop.yourdomain.com)
   - Point API domain to AWS (api.yourdomain.com)

---

## 🎯 Quick Reference

| Component | Platform | Primary URL Env Var |
|-----------|----------|-------------------|
| Backend API | AWS | - |
| Vendor Admin | Vercel | `NEXT_PUBLIC_API_URL` |
| Customer App | Vercel | `NEXT_PUBLIC_API_URL` |
| Database | Supabase | `SUPABASE_URL` |
| File Storage | AWS S3 | `AWS_S3_BUCKET` |

---

## 📞 Support

- Backend health: `https://your-backend/api/health`
- Supabase Dashboard: https://app.supabase.com
- Vercel Dashboard: https://vercel.com/dashboard
- AWS Console: https://console.aws.amazon.com

---

**Last Updated**: October 2025  
**Version**: 1.0

