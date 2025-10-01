# 🚀 Quick Deployment Reference

## Order: Backend → Vendor Admin → Customer App

---

## 1. BACKEND (AWS) - Environment Variables

```env
SUPABASE_URL=<your_supabase_url>
SUPABASE_ANON_KEY=<your_supabase_anon_key>
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=<your_aws_access_key_id>
AWS_SECRET_ACCESS_KEY=<your_aws_secret_access_key>
S3_BUCKET_NAME=trullu-product-images
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-vendor-admin.vercel.app,https://your-customer-app.vercel.app
JWT_SECRET=generate-a-strong-secret-key-here
```

---

## 2. VENDOR ADMIN (Vercel)

### Environment Variables:
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
NEXT_PUBLIC_WS_URL=https://your-backend-url.com
```

### Vercel Settings:
- **Root Directory:** `./` (project root)
- **Framework:** Next.js
- **Build Command:** `npm run build`
- **Install Command:** `npm install`

---

## 3. CUSTOMER APP (Vercel)

### Environment Variables:
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
NEXT_PUBLIC_WS_URL=https://your-backend-url.com
```

### Vercel Settings:
- **Root Directory:** `bazar_story-master` ⚠️ IMPORTANT!
- **Framework:** Next.js
- **Build Command:** `npm run build`
- **Install Command:** `npm install`

---

## ⚡ Quick AWS EC2 Setup

```bash
# 1. Connect to EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2
sudo npm install -g pm2

# 4. Clone and setup
git clone <your-repo>
cd backend
npm install

# 5. Create .env (paste variables above)
nano .env

# 6. Start app
pm2 start src/app.js --name trullu-backend
pm2 startup
pm2 save

# 7. Install Nginx
sudo apt install nginx

# 8. Configure Nginx
sudo nano /etc/nginx/sites-available/trullu
```

**Nginx Config:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 9. Enable and restart
sudo ln -s /etc/nginx/sites-available/trullu /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 📝 Post-Deployment Steps

1. **Get Backend URL** → Update frontend env vars
2. **Get Vercel URLs** → Update backend CORS_ORIGIN
3. **Restart backend:** `pm2 restart trullu-backend`
4. **Test everything!**

---

## 🔗 Important URLs After Deployment

- Backend API: `https://your-backend-url.com/api`
- Vendor Admin: `https://your-vendor-admin.vercel.app`
- Customer App: `https://your-customer-app.vercel.app`
- S3 Images: `https://trullu-product-images.s3.ap-south-1.amazonaws.com/`

---

## ✅ Final Checklist

- [ ] Backend deployed and running
- [ ] Backend URL added to frontend env vars
- [ ] Vendor Admin deployed
- [ ] Customer App deployed
- [ ] Vercel URLs added to backend CORS
- [ ] S3 CORS updated with Vercel URLs
- [ ] Test login on vendor admin
- [ ] Test product upload
- [ ] Test customer app product display
- [ ] Test checkout flow

Done! 🎉



