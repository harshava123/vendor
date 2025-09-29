# Manual Database Fix Required

## Issue
The `categories.image` column is currently `VARCHAR(500)` but base64 image data is much larger (470,000+ characters).

## Solution
You need to manually run this SQL in your Supabase dashboard:

### Step 1: Go to Supabase Dashboard
1. Open https://app.supabase.com
2. Select your project
3. Go to SQL Editor

### Step 2: Run this SQL
```sql
-- Fix image column size in categories table
ALTER TABLE categories ALTER COLUMN image TYPE TEXT;

-- Verify the change
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'categories' AND column_name = 'image';
```

### Step 3: Test
After running the SQL, try updating a category with an image again.

## Alternative: Temporary Workaround
If you can't access the database right now, I've implemented a workaround that will:
1. Show file size warnings
2. Still attempt the update (it might work with smaller images)
3. Provide better error messages

