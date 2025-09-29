"use client"
import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';
import Link from 'next/link';
import { Poppins } from 'next/font/google';
const poppins = Poppins({ weight: ["400", "600", "700"], subsets: ["latin"] });


interface SubCategory {
  subCategoryID: string;
  subCategoryName: string;
  status: boolean;
  mrp: number;
  sellingPrice: number;
  discountPercentage: number;
  bestSeller: boolean;
  categoryID: string;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  categoryID: string;
  categoryName: string;
  status: boolean;
  imageUrl: string[];
  vendorID: string;
  createdAt: string;
  updatedAt: string;
  productSubCategories: SubCategory[];
}

// interface SubCategoryInput {
//   subCategoryName: string;
//   mrp: string | number;
//   sellingPrice: string | number;
// }

export default function Products() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  // const [subCategories, setSubCategories] = useState<SubCategoryInput[]>([{
  //   subCategoryName: '',
  //   mrp: '' as unknown as number,
  //   sellingPrice: '' as unknown as number
  // }]);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        setIsAuthenticated(true);
        fetchCategories();
      } else {
        // Redirect to login if not authenticated
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Auth check error:', error);
      window.location.href = '/login';
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
      const result = await response.json();
      
      if (result.success) {
        // Transform backend categories to match frontend format
        const transformedCategories: Category[] = result.data.map((category: any) => ({
          categoryID: category.id,
          categoryName: category.name,
          status: category.is_active,
          imageUrl: category.image ? [category.image] : ['https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop&crop=center'],
          vendorID: 'current-vendor', // We'll get this from auth context
          createdAt: category.created_at,
          updatedAt: category.updated_at || category.created_at,
          productSubCategories: [] // Subcategories can be added later
        }));
        setCategories(transformedCategories);
      } else {
        console.error('Failed to fetch categories:', result.message);
        setCategories([]);
      }
    } catch (error) {
      console.error('Fetch categories error:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };



  // const handleAddSubCategory = async (categoryId: string) => {
  //   if (subCategories.some(sub => 
  //     !sub.subCategoryName || 
  //     !sub.mrp || 
  //     !sub.sellingPrice || 
  //     isNaN(Number(sub.mrp)) || 
  //     isNaN(Number(sub.sellingPrice))
  //   )) {
  //     toast({
  //       title: "Error",
  //       description: "Please fill all fields for subcategories with valid numbers",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   // Convert empty strings to numbers before sending to API
  //   const subcategoriesPayload = subCategories.map(sub => ({
  //     ...sub,
  //     mrp: Number(sub.mrp),
  //     sellingPrice: Number(sub.sellingPrice)
  //   }));

  //   setLoading(true);
  //   try {
  //     await axios.post(
  //       `${process.env.NEXT_PUBLIC_BASE_URL}/vendor/add-product-subcategory`,
  //       {
  //         categoryID: categoryId,
  //         subcategories: subcategoriesPayload
  //       },
  //       {
  //         headers: {
  //           'Authorization': `Bearer ${Cookies.get("token")}`,
  //         }
  //       }
  //     );

  //     toast({
  //       title: "Success",
  //       description: "Subcategories added successfully",
  //       variant: "default",
  //       className: "bg-green-500 text-white",
  //     });

  //     // Reset form and refresh categories
  //     setSubCategories([{ 
  //       subCategoryName: '', 
  //       mrp: '' as unknown as number, 
  //       sellingPrice: '' as unknown as number 
  //     }]);
  //     fetchCategories();
  //     window.location.reload();
  //   } catch (error) {
  //     console.error(error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to add subcategories",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className={`${poppins.className} p-6`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8 mt-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <h2 className="text-xl text-gray-600">Categories</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search"
              className="pl-10 w-[300px] rounded-md border-gray-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Link href="/add-product">
            <Button className="bg-green-600 hover:bg-green-700 text-white rounded-md">
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-3 gap-6">
        {categories.map((category) => (
          <div 
            key={category.categoryID}
            className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <Link href={`/products/${category.categoryID}`}>
              <div className="relative h-48 w-full mb-4 rounded-lg overflow-hidden">
                {category.imageUrl && category.imageUrl.length > 0 ? (
                  <Image
                    src={category.imageUrl[0]}
                    alt={category.categoryName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
              </div>
            </Link>
            
            <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl text-[#262626] font-medium mb-2">{category.categoryName}</h3>
            
            </div>

         
           
          </div>
        ))}
      </div>

      
    </div>
  );
}