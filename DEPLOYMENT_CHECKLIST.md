# 🚀 Deployment Checklist - Product-Specific Livestreams

## Pre-Deployment Database Setup

### ✅ Database Schema Migration
- [ ] **Run SQL Migration in Supabase Dashboard**
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

- [ ] **Verify Migration Success**
  ```sql
  -- Check if column exists
  SELECT column_name, data_type, is_nullable 
  FROM information_schema.columns 
  WHERE table_name = 'livestreams' 
  AND column_name = 'product_id';
  ```

### ✅ Environment Variables Setup

#### Backend (.env.production)
- [ ] `PORT=5000`
- [ ] `NODE_ENV=production`
- [ ] `SUPABASE_URL=your_production_supabase_url`
- [ ] `SUPABASE_SERVICE_ROLE_KEY=your_production_service_key`
- [ ] `JWT_SECRET=your_secure_jwt_secret`
- [ ] `CORS_ORIGIN=https://your-frontend-domain.com`

#### Frontend (.env.production)
- [ ] `NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api`
- [ ] `NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key`

## Backend Deployment

### ✅ Code Deployment
- [ ] **Upload latest backend code** with product-specific stream functionality
- [ ] **Install dependencies**: `npm install`
- [ ] **Run database migrations**: `npm run migrate` (optional)
- [ ] **Start backend server**: `npm start`

### ✅ Health Checks
- [ ] **Backend health endpoint**: `GET https://your-backend.com/api/health`
- [ ] **Categories endpoint**: `GET https://your-backend.com/api/categories`
- [ ] **Database connection**: Verify Supabase connection in logs

## Frontend Deployment

### ✅ Code Deployment
- [ ] **Upload latest frontend code** with updated livestream flow
- [ ] **Install dependencies**: `npm install`
- [ ] **Build application**: `npm run build`
- [ ] **Start frontend**: `npm start`

### ✅ Configuration
- [ ] **API URL configured** to point to production backend
- [ ] **Supabase configuration** updated for production
- [ ] **Image domains** configured in next.config.js for production

## Post-Deployment Testing

### ✅ Core Functionality
- [ ] **Admin login** works correctly
- [ ] **Vendor login** works correctly
- [ ] **Category management** works for admins
- [ ] **Product creation** works for vendors

### ✅ New Livestream Flow
- [ ] **Category selection** loads categories correctly
- [ ] **Product selection** shows products for selected category
- [ ] **Stream creation** works for specific products
- [ ] **Product isolation** - streams only show for correct product
- [ ] **Stream deletion** works for individual streams
- [ ] **Delete all streams** works for product-specific streams

### ✅ Backward Compatibility
- [ ] **Existing streams** still work (those without product_id)
- [ ] **Old stream management** continues to function
- [ ] **No data loss** during migration

## Production Verification

### ✅ User Flows
- [ ] **Admin**: Can create categories and manage system
- [ ] **Vendor**: Can navigate Category → Product → Stream flow
- [ ] **Vendor**: Can create product-specific streams
- [ ] **Vendor**: Can manage streams per product
- [ ] **End Users**: Can view streams in Bazar Story frontend

### ✅ Performance
- [ ] **API response times** are acceptable
- [ ] **Database queries** perform well with new indexes
- [ ] **Frontend loading** is fast with new navigation flow
- [ ] **Stream creation** is responsive

### ✅ Error Handling
- [ ] **Graceful degradation** if product_id column missing
- [ ] **Proper error messages** for failed operations
- [ ] **Logging** shows appropriate debug information
- [ ] **No console errors** in production

## Rollback Plan

### ✅ If Issues Occur
- [ ] **Database rollback script** ready:
  ```sql
  ALTER TABLE livestreams DROP COLUMN IF EXISTS product_id;
  DROP INDEX IF EXISTS idx_livestreams_product_id;
  ```
- [ ] **Previous code version** available for quick rollback
- [ ] **Backup strategy** for any data that needs recovery

## Monitoring

### ✅ Post-Deployment Monitoring
- [ ] **Error rates** monitored
- [ ] **API response times** tracked
- [ ] **Database performance** observed
- [ ] **User feedback** collected

## Documentation

### ✅ Updated Documentation
- [ ] **API documentation** updated with new endpoints
- [ ] **User guides** updated with new flow
- [ ] **Deployment guide** created and shared
- [ ] **Troubleshooting guide** available

---

## 🎯 Success Criteria

Deployment is successful when:
1. ✅ All health checks pass
2. ✅ New livestream flow works end-to-end
3. ✅ Product isolation functions correctly
4. ✅ No regression in existing functionality
5. ✅ Performance meets expectations
6. ✅ Error rates remain low

---

## 📞 Support Contacts

- **Backend Issues**: Check server logs and database connectivity
- **Frontend Issues**: Check browser console and API responses
- **Database Issues**: Verify schema and run diagnostic queries
- **Performance Issues**: Monitor API response times and database queries
