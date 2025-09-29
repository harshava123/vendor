"use client"
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { toast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

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

interface UserData {
  user: {
    userID: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  orders: Order[];
}

export default function UserOrders() {
  const params = useParams();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Build dummy user based on param
      const id = String(params.userId);
      const orders: Order[] = Array.from({ length: 5 }, (_, i) => ({
        orderID: `O-${id}-${i + 1}`,
        totalAmount: Math.floor(Math.random() * 5000) + 500,
        status: ['COMPLETED','PENDING','IN_PROGRESS','CANCELLED'][i % 4],
        paymentStatus: ['COMPLETED','PENDING','IN_PROGRESS','CANCELLED'][i % 4],
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        items: [
          { productName: 'Item A', price: 199, quantity: 1 },
          { productName: 'Item B', price: 299, quantity: 2 },
        ],
      }));
      const user: UserData = {
        user: {
          userID: id,
          name: `User ${id}`,
          email: `user${id}@example.com`,
          phoneNumber: '+91-9000000000',
        },
        orders,
      };
      setUserData(user);
    } catch (error) {
      console.error('Error building dummy user data:', error);
      toast({
        title: "Error",
        description: "Failed to load dummy user orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!userData) {
    return <div className="p-6">User not found</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">User Orders</h1>
          <p className="text-gray-600">
            {userData.user.name} ({userData.user.email})
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Order ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Items</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Total Amount</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Payment Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {userData.orders.map((order) => (
              <tr key={order.orderID} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-500">{order.orderID}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <div key={index}>
                        {item.productName} × {item.quantity}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">₹{order.totalAmount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 