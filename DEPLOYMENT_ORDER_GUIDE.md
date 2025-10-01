# 🚀 Production Deployment Guide

## 📋 Deployment Order

### **STEP 1: Deploy Backend to AWS (FIRST)** ⚙️
**Why first?** Because frontends need the backend API URL.

### **STEP 2: Deploy Vendor Admin Frontend to Vercel** 🖥️
**Why second?** To get the Vercel URL for CORS configuration.

### **STEP 3: Deploy Customer Frontend (bazar_story-master) to Vercel** 🛍️
**Why last?** Can reference both backend and admin URLs if needed.

---

## 1️⃣ BACKEND DEPLOYMENT (AWS)

### Option A: AWS EC2 (Recommended for control)

#### Prerequisites:
- AWS Account
- EC2 instance (Ubuntu 22.04 LTS recommended)
- Elastic IP (for stable URL)
- Security Group configured:
  - Port 80 (HTTP)
  - Port 443 (HTTPS)
  - Port 5000 (Node.js - temporary, use nginx proxy)
  - Port 22 (SSH)

#### Environment Variables Needed:
```bash
# Database
SUPABASE_URL=<your_supabase_url>
SUPABASE_ANON_KEY=<your_supabase_anon_key>

# AWS S3
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=<your_aws_access_key_id>
AWS_SECRET_ACCESS_KEY=<your_aws_secret_access_key>
S3_BUCKET_NAME=trullu-product-images

# Server
PORT=5000
NODE_ENV=production

# CORS - Update after getting Vercel URLs
CORS_ORIGIN=https://your-vendor-admin.vercel.app,https://your-customer-app.vercel.app

# JWT Secret (generate a strong one)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

#### Deployment Steps:

1. **Connect to EC2:**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

2. **Install Node.js & PM2:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

3. **Clone & Setup:**
```bash
git clone <your-repo-url>
cd backend
npm install
```

4. **Create .env file:**
```bash
nano .env
# Paste the environment variables above
```

5. **Start with PM2:**
```bash
pm2 start src/app.js --name trullu-backend
pm2 startup
pm2 save
```

6. **Setup Nginx Reverse Proxy:**
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/trullu
```

```nginx
server {
    listen 80;
    server_name your-domain.com;  # or EC2 IP

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/trullu /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

7. **Setup SSL (Optional but Recommended):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

**✅ Backend URL:** `http://your-ec2-ip` or `https://your-domain.com`

---

### Option B: AWS Elastic Beanstalk (Easier)

1. Install EB CLI:
```bash
pip install awsebcli
```

2. Initialize:
```bash
cd backend
eb init -p node.js trullu-backend --region ap-south-1
```

3. Create environment:
```bash
eb create trullu-production
```

4. Set environment variables:
```bash
eb setenv SUPABASE_URL=https://... \
  SUPABASE_ANON_KEY=... \
  AWS_ACCESS_KEY_ID=... \
  AWS_SECRET_ACCESS_KEY=... \
  S3_BUCKET_NAME=trullu-product-images \
  PORT=8080 \
  NODE_ENV=production
```

5. Deploy:
```bash
eb deploy
```

**✅ Backend URL:** Will be provided by Elastic Beanstalk

---

## 2️⃣ VENDOR ADMIN FRONTEND (Vercel)

### Environment Variables for Vercel:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api

# Supabase (for any client-side features)
NEXT_PUBLIC_SUPABASE_URL=https://umsznqdichlqsozobqsr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtc3pucWRpY2hscXNvem9icXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNTMyODAsImV4cCI6MjA3NDYyOTI4MH0.gWD6zibO7L9t7KSfZZj0vDOh9iGeEz0Y9EauEESUeMg

# WebSocket (if using livestream)
NEXT_PUBLIC_WS_URL=https://your-backend-url.com
```

### Deployment Steps:

1. **Push to GitHub:**
```bash
cd d:/Trullu/vendorAdminBazaar
git add .
git commit -m "Ready for production"
git push origin main
```

2. **Deploy on Vercel:**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Select **root directory** (not backend or bazar_story-master)
   - Configure:
     - **Framework Preset:** Next.js
     - **Root Directory:** `./` (vendorAdminBazaar root)
     - **Build Command:** `npm run build`
     - **Output Directory:** `.next`

3. **Add Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add all variables from above
   - Make sure to add for **Production**, **Preview**, and **Development**

4. **Deploy!**

**✅ Vendor Admin URL:** `https://your-vendor-admin.vercel.app`

---

## 3️⃣ CUSTOMER FRONTEND (bazar_story-master on Vercel)

### Environment Variables for Vercel:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api

# WebSocket (for livestream)
NEXT_PUBLIC_WS_URL=https://your-backend-url.com
```

### Deployment Steps:

1. **Create separate Vercel project:**
   - Go to Vercel Dashboard
   - Click "New Project"
   - Import same GitHub repository
   - Configure:
     - **Framework Preset:** Next.js
     - **Root Directory:** `bazar_story-master` ← IMPORTANT!
     - **Build Command:** `npm run build`
     - **Output Directory:** `.next`

2. **Add Environment Variables:**
   - Same as above
   - Add for all environments

3. **Deploy!**

**✅ Customer App URL:** `https://your-customer-app.vercel.app`

---

## 4️⃣ POST-DEPLOYMENT CONFIGURATION

### Update Backend CORS:

After getting Vercel URLs, update backend `.env`:
```bash
CORS_ORIGIN=https://your-vendor-admin.vercel.app,https://your-customer-app.vercel.app
```

Restart backend:
```bash
pm2 restart trullu-backend
```

### Update AWS S3 CORS Policy:

Add Vercel URLs to S3 bucket CORS:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "https://your-vendor-admin.vercel.app",
      "https://your-customer-app.vercel.app"
    ],
    "ExposeHeaders": []
  }
]
```

---

## 🔍 TESTING CHECKLIST

### Backend:
- [ ] API health check: `https://your-backend-url.com/api/health`
- [ ] Categories endpoint: `https://your-backend-url.com/api/categories`
- [ ] Products endpoint: `https://your-backend-url.com/api/products`
- [ ] Upload images test

### Vendor Admin:
- [ ] Login works
- [ ] Add product with image upload
- [ ] View categories
- [ ] Dashboard loads

### Customer App:
- [ ] Homepage loads
- [ ] Categories display
- [ ] Product detail pages work
- [ ] Add to cart works
- [ ] Checkout flow works

---

## 📊 COST ESTIMATE

### AWS:
- **EC2 t2.micro:** ~$8-10/month (or free tier for 1 year)
- **Elastic IP:** Free (if attached)
- **S3 Storage:** ~$0.023/GB/month
- **S3 Bandwidth:** First 100GB free/month

### Vercel:
- **Hobby Plan:** Free (for both frontends)
- **Pro Plan:** $20/month/project (if needed)

**Total Estimated Cost:** $10-15/month (with free tiers)

---

## 🆘 TROUBLESHOOTING

### "CORS Error":
- Check backend `CORS_ORIGIN` includes Vercel URLs
- Verify S3 CORS policy

### "Failed to fetch":
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend is running
- Test API directly in browser

### "Images not loading":
- Check S3 bucket is public
- Verify S3 bucket policy
- Check `next.config.ts` has S3 domain in `remotePatterns`

### "Environment variables not working":
- Rebuild and redeploy on Vercel
- Variables must start with `NEXT_PUBLIC_` for client-side access

---

## 🎉 SUCCESS!

Once deployed, you'll have:
- ✅ Backend API on AWS (scalable, reliable)
- ✅ Vendor Admin on Vercel (fast, global CDN)
- ✅ Customer App on Vercel (optimized, SEO-friendly)
- ✅ Images on AWS S3 (cost-effective storage)

Need help with any step? Let me know! 🚀


