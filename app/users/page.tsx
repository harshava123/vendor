"use client"
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from '@/hooks/use-toast';
import { Poppins } from 'next/font/google';
import { useRouter } from 'next/navigation';
const poppins = Poppins({ weight: ["400", "600", "700"], subsets: ["latin"] });

interface OrderItem {
  productName: string;
  price: number;
  quantity: number;
}

interface Order {
  orderID: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
}

interface User {
  user: {
    userID: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  orders: Order[];
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  limit: number;
}

export default function Users() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [sortBy, setSortBy] = useState('All');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    limit: 10
  });
  const router = useRouter();

  const fetchUsers = async (page: number = 1) => {
    try {
      // Dummy users data
      const dummyUsers: User[] = Array.from({ length: 10 }, (_, i) => ({
        user: {
          userID: `U-${(page - 1) * 10 + i + 1}`,
          name: `User ${(page - 1) * 10 + i + 1}`,
          email: `user${(page - 1) * 10 + i + 1}@example.com`,
          phoneNumber: `+91-90000${String(i).padStart(4, '0')}`,
        },
        orders: [
          {
            orderID: `O-${(page - 1) * 10 + i + 1}`,
            totalAmount: Math.floor(Math.random() * 5000) + 500,
            status: ['PENDING','COMPLETED','IN_PROGRESS','CANCELLED'][i % 4],
            paymentStatus: ['PENDING','COMPLETED','IN_PROGRESS','CANCELLED'][i % 4],
            createdAt: new Date().toISOString(),
            items: [
              { productName: 'Item A', price: 199, quantity: 1 },
              { productName: 'Item B', price: 299, quantity: 2 },
            ],
          },
        ],
      }));

      setUsers(dummyUsers);
      setPagination({ currentPage: page, totalPages: 5, totalOrders: 50, limit: 10 });
    } catch (error) {
      console.error('Error building dummy users:', error);
      toast({
        title: "Error",
        description: "Failed to load dummy users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`${poppins.className} p-6`}>
      <h1 className="text-3xl font-bold mb-6">Users</h1>
      
      {/* Filters */}
      <div className="flex justify-end gap-2 items-center mb-6">
        <div className="flex items-center gap-4">
          <span>Select date</span>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40 h-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <span>Sort by</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-md w-16 p-2 h-10"
          >
            <option>All</option>
            <option>Name</option>
            <option>Orders</option>
          </select>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name or phone"
            className="pl-10 w-[300px] h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white p-2 rounded-lg shadow overflow-x-auto relative">
        <Table>
          <TableHeader className="border-b border-neutral-200">
            <TableRow className="py-6 text-sm font-medium">
              <TableHead>User ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Total Orders</TableHead>
              <TableHead>Last Order Date</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((userData) => (
              <TableRow key={userData.user.userID} className="border-b border-neutral-200 py-6">
                <TableCell className="text-sm text-gray-700">{userData.user.userID}</TableCell>
                <TableCell className="text-sm text-gray-700">{userData.user.name}</TableCell>
                <TableCell className="text-sm text-gray-700">{userData.user.email}</TableCell>
                <TableCell className="text-sm text-gray-700">{userData.user.phoneNumber}</TableCell>
                <TableCell className="text-sm text-gray-700">{userData.orders.length}</TableCell>
                <TableCell className="text-sm text-gray-700">
                  {userData.orders.length > 0 ? formatDate(userData.orders[0].createdAt) : '-'}
                </TableCell>
                <TableCell className="text-sm text-gray-700">
                  <Button
                    variant="link"
                    className="p-0 text-blue-600 hover:text-blue-800 cursor-pointer"
                    onClick={() => router.push(`/users/${userData.user.userID}`)}
                  >
                    View 
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-center gap-2">
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={page === pagination.currentPage ? "default" : "outline"}
            onClick={() => fetchUsers(page)}
          >
            {page}
          </Button>
        ))}
      </div>

      {loading && <div className="text-center mt-4">Loading...</div>}
    </div>
  );
}