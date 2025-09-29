"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApiClient } from '@/lib/admin-api';

export default function AdminDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);

  const runDebugTest = async () => {
    console.log('🔍 Starting comprehensive debug test...');
    
    const info = {
      adminToken: localStorage.getItem('adminToken'),
      adminEmail: localStorage.getItem('adminEmail'),
      authToken: localStorage.getItem('authToken'),
      allKeys: Object.keys(localStorage),
      timestamp: new Date().toISOString()
    };
    
    console.log('📋 Debug Info:', info);
    setDebugInfo(info);
    
    // Test 1: Direct admin login
    console.log('🧪 Test 1: Admin Login...');
    try {
      const loginResult = await adminApiClient.login('Admin@gmail.com', 'Admin@12');
      console.log('✅ Admin login result:', loginResult);
      
      // Test 2: Get categories
      console.log('🧪 Test 2: Get Categories...');
      const categoriesResult = await adminApiClient.getCategories();
      console.log('✅ Categories result:', categoriesResult);
      
      // Test 3: Direct fetch test
      console.log('🧪 Test 3: Direct Fetch Test...');
      const directFetchResult = await fetch('http://localhost:5000/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      const directFetchData = await directFetchResult.json();
      console.log('✅ Direct fetch result:', directFetchData);
      
      setTestResult({
        login: loginResult,
        categories: categoriesResult,
        directFetch: directFetchData,
        success: true
      });
      
    } catch (error) {
      console.error('❌ Debug test failed:', error);
      setTestResult({
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });
    }
  };

  const testCategoryUpdate = async () => {
    console.log('🧪 Testing category update...');
    
    try {
      const categoriesResult = await adminApiClient.getCategories();
      if (categoriesResult.success && categoriesResult.data.length > 0) {
        const firstCategory = categoriesResult.data[0];
        console.log('📝 Testing update on category:', firstCategory);
        
        const updateResult = await adminApiClient.updateCategory(firstCategory.id, {
          name: firstCategory.name + ' (Updated)',
          description: firstCategory.description,
          image: firstCategory.image
        });
        
        console.log('✅ Update result:', updateResult);
        setTestResult(prev => ({
          ...prev,
          updateTest: updateResult
        }));
      }
    } catch (error) {
      console.error('❌ Category update test failed:', error);
      setTestResult(prev => ({
        ...prev,
        updateTestError: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Debug Page</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
          <CardDescription>Check admin token and localStorage status</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runDebugTest} className="mb-4">
            Run Debug Test
          </Button>
          
          {debugInfo && (
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-semibold mb-2">Debug Info:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>Results from API tests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-x-2 mb-4">
            <Button onClick={testCategoryUpdate} disabled={!debugInfo}>
              Test Category Update
            </Button>
          </div>
          
          {testResult && (
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-semibold mb-2">Test Results:</h3>
              <pre className="text-sm overflow-auto max-h-96">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
          <CardDescription>How to use this debug page</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>Make sure you're logged in as admin</li>
            <li>Click "Run Debug Test" to check token status</li>
            <li>Check the console for detailed logs</li>
            <li>If login works, try "Test Category Update"</li>
            <li>Share the debug info and test results</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

