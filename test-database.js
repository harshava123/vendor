const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDatabase() {
  console.log('Testing database connection...');
  
  try {
    // Test categories
    console.log('\n1. Testing categories...');
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);
    
    if (catError) {
      console.error('Categories error:', catError);
    } else {
      console.log('Categories:', categories);
    }

    // Test products
    console.log('\n2. Testing products...');
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (prodError) {
      console.error('Products error:', prodError);
    } else {
      console.log('Products:', products);
    }

    // Test products with is_active filter
    console.log('\n3. Testing products with is_active filter...');
    const { data: activeProducts, error: activeError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .limit(5);
    
    if (activeError) {
      console.error('Active products error:', activeError);
    } else {
      console.log('Active products:', activeProducts);
    }

  } catch (error) {
    console.error('Database test error:', error);
  }
}

testDatabase();

