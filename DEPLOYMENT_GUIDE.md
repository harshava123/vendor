# Deployment Guide - Vendor Admin Bazaar

This guide covers deploying the Vendor Admin Bazaar application with the latest product-specific livestream functionality.

## 🗄️ Database Requirements

### Required Database Schema Updates

Before deploying, ensure your Supabase database has the following schema updates:

#### 1. Livestreams Table - Product Association

Run this SQL in your Supabase Dashboard → SQL Editor:

```sql
-- Add product_id column to livestreams table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'livestreams' 
        AND column_name = 'product_id'
    ) THEN
        ALTER TABLE livestreams 
        ADD COLUMN product_id UUID REFERENCES products(id) ON DELETE SET NULL;
        
        COMMENT ON COLUMN livestreams.product_id IS 'ID of the product this livestream is associated with. NULL means the livestream is not associated with any specific product.';
        
        RAISE NOTICE 'Added product_id column to livestreams table';
    ELSE
        RAISE NOTICE 'product_id column already exists in livestreams table';
    END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_livestreams_product_id ON livestreams(product_id);
```

#### 2. Verify Schema

After running the migration, verify with:

```sql
-- Check if column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'livestreams' 
AND column_name = 'product_id';

-- Check if index exists
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'livestreams' 
AND indexname = 'idx_livestreams_product_id';
```

## 🚀 Deployment Steps

### Backend Deployment

1. **Environment Variables**
   ```bash
   # Required environment variables
   PORT=5000
   NODE_ENV=production
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret
   ```

2. **Database Migration**
   ```bash
   # Run migrations (if using migration runner)
   node run-migrations.js
   
   # Or manually run the SQL in Supabase dashboard
   ```

3. **Start Backend**
   ```bash
   npm install
   npm start
   ```

### Frontend Deployment

1. **Environment Variables**
   ```bash
   # .env.production
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

2. **Build and Deploy**
   ```bash
   npm install
   npm run build
   npm start
   ```

## 🔧 New Features in This Version

### Product-Specific Livestreams

- **Category → Product → Stream Flow**: Users navigate through categories to select products, then create streams for specific products
- **Stream Isolation**: Each product only shows its own streams
- **Product Association**: New streams are automatically linked to the selected product
- **Backward Compatibility**: Existing streams without product association continue to work

### API Changes

#### New Endpoints
- `POST /api/livestreams/create` - Now accepts `product_id` parameter
- `GET /api/livestreams/vendor/my-streams?product_id=xxx` - Filter streams by product
- `DELETE /api/livestreams/:streamId` - Delete specific streams

#### Updated Request/Response Formats
```javascript
// Create stream with product association
POST /api/livestreams/create
{
  "title": "Stream Title",
  "description": "Stream Description", 
  "product_id": "uuid-of-product" // NEW: Optional product association
}

// Get streams filtered by product
GET /api/livestreams/vendor/my-streams?product_id=uuid-of-product
```

## 🧪 Testing After Deployment

### 1. Test Product-Specific Stream Creation
1. Navigate to Livestream page
2. Select a category
3. Select a product
4. Create a new stream
5. Verify stream appears only for that product

### 2. Test Stream Isolation
1. Create streams for different products
2. Switch between products
3. Verify each product only shows its own streams

### 3. Test Backward Compatibility
1. Verify existing streams still work
2. Check that streams without product_id display correctly

## 🐛 Troubleshooting

### Common Issues

#### "product_id column not found"
- **Cause**: Database migration not run
- **Solution**: Run the SQL migration in Supabase dashboard

#### "Streams showing for all products"
- **Cause**: Frontend not filtering by product_id
- **Solution**: Clear browser cache and refresh

#### "Failed to create stream"
- **Cause**: Backend not handling product_id parameter
- **Solution**: Ensure latest backend code is deployed

### Health Checks

```bash
# Backend health
curl https://your-backend-domain.com/api/health

# Test categories endpoint
curl https://your-backend-domain.com/api/categories

# Test livestreams endpoint (requires auth)
curl -H "Authorization: Bearer your-token" \
     https://your-backend-domain.com/api/livestreams/vendor/my-streams
```

## 📋 Pre-Deployment Checklist

- [ ] Database schema updated with `product_id` column
- [ ] Backend environment variables configured
- [ ] Frontend environment variables configured
- [ ] All dependencies installed
- [ ] Database migrations run
- [ ] Health checks passing
- [ ] Test stream creation
- [ ] Test product isolation
- [ ] Verify backward compatibility

## 🔄 Rollback Plan

If issues occur after deployment:

1. **Database Rollback**
   ```sql
   -- Remove product_id column (WARNING: This will lose product associations)
   ALTER TABLE livestreams DROP COLUMN IF EXISTS product_id;
   DROP INDEX IF EXISTS idx_livestreams_product_id;
   ```

2. **Code Rollback**
   - Deploy previous version of backend/frontend
   - Remove product_id handling from API calls

3. **Data Recovery**
   - Streams without product_id will continue to work
   - Product associations will be lost (not recoverable)

## 📞 Support

For deployment issues:
1. Check application logs
2. Verify database schema
3. Test API endpoints manually
4. Check environment variables
5. Review this deployment guide