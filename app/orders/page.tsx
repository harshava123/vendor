"use client"
import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
const poppins = Poppins({ weight: ["400", "600", "700"], subsets: ["latin"] });

interface OrderItem {
  productName: string;
  quantity: number;
  priceAtOrder: number;
  mrp: number;
  sellingPrice: number;
  discountPercentage: number;
}

interface Order {
  orderID: string;
  user: {
    userID: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  totalAmount: number;
  status: string;
  paymentStatus: string;
  shippingAddress: string;
  paymentMethod: string;
  trackingNumber: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  limit: number;
}

// Add new interface for selected order

const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-black/5 flex items-center justify-center backdrop-blur-[2px]">
    <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-2">
      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      <span className="text-gray-700 font-medium">Loading orders...</span>
    </div>
  </div>
);

export default function Orders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [sortBy, setSortBy] = useState('All');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    limit: 10
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchOrders = async (page: number = 1, filterStatus: string = 'All') => {
    setLoading(true);
    try {
      const statuses = ['COMPLETED', 'PENDING', 'IN_PROGRESS', 'CANCELLED'];
      const dummyOrders: Order[] = Array.from({ length: 10 }, (_, i) => {
        const status = statuses[i % statuses.length];
        const order: Order = {
          orderID: `ORD-${(page - 1) * 10 + i + 1}`,
          user: {
            userID: `U-${i + 1}`,
            name: `Customer ${(page - 1) * 10 + i + 1}`,
            email: `customer${(page - 1) * 10 + i + 1}@example.com`,
            phoneNumber: `+91-98${String(100000 + i).slice(-6)}`,
          },
          totalAmount: Math.floor(Math.random() * 9000) + 1000,
          status,
          paymentStatus: status,
          shippingAddress: '123, Demo Street, City',
          paymentMethod: ['COD', 'CARD', 'UPI'][i % 3],
          trackingNumber: i % 2 === 0 ? `TRK-${100000 + i}` : null,
          createdAt: new Date(Date.now() - i * 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
          items: [
            { productName: 'T-shirt', quantity: 1, priceAtOrder: 499, mrp: 799, sellingPrice: 499, discountPercentage: 38 },
            { productName: 'Jeans', quantity: 1, priceAtOrder: 1299, mrp: 1599, sellingPrice: 1299, discountPercentage: 19 },
          ],
        };
        return order;
      });

      const filtered = filterStatus === 'All' 
        ? dummyOrders 
        : dummyOrders.filter(o => o.status === filterStatus.toUpperCase());

      setOrders(filtered);
      setPagination({ currentPage: page, totalPages: 5, totalOrders: 50, limit: 10 });
    } catch (error) {
      console.error('Error generating dummy orders:', error);
      toast({
        title: "Error",
        description: "Failed to load dummy orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(pagination.currentPage, sortBy);
  }, [pagination.currentPage, sortBy]);

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
    return new Date(dateString).toLocaleTimeString();
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  return (
    <div className={`${poppins.className} p-4 sm:p-6 relative`}>
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">ORDER DETAILS</h1>
      
      {/* Order Summary */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4 sm:mb-6">
        <div className="bg-black text-white px-4 py-2 rounded-lg">
          {pagination.totalOrders} Total Orders
        </div>
        {/* You can add more summary stats here based on your needs */}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:items-center mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <span className="text-sm sm:text-base">Select date</span>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40 h-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <span>Filter by Status</span>
          <select 
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              fetchOrders(1, e.target.value); // Reset to page 1 when filtering
            }}
            className="border rounded-md p-2 w-40 h-10"
          >
            <option value="All">All Orders</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search"
            className="pl-10 h-10 w-full sm:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white p-2 rounded-lg shadow overflow-x-auto relative">
        <div className="min-w-full">
        <Table>
          <TableHeader className="border-b border-neutral-200">
            <TableRow className="py-6 text-sm font-medium">
              <TableHead>S.No.</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer Name</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Phone number</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              {/* <TableHead>Payment</TableHead> */}
              <TableHead>View Order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-sm text-gray-500">
                  No orders found for the selected status
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order, index) => (
                <TableRow key={index} className="border-b border-neutral-200 py-6">
                  <TableCell className="text-sm text-gray-700">{index + 1}</TableCell>
                  <TableCell className="text-sm text-gray-700">{order.orderID}</TableCell>
                  <TableCell className="text-sm text-gray-700">{order.user.name}</TableCell>
                  <TableCell className="text-sm text-gray-700">{formatDate(order.createdAt)}</TableCell>
                  <TableCell className="text-sm text-gray-700">{order.user.phoneNumber}</TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {order.items.map(item => item.productName).join(', ')}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </TableCell>
                  {/* <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </TableCell> */}
                  <TableCell className="text-sm text-gray-700">
                    <Button
                      variant="link"
                      className="text-blue-600"
                      onClick={() => handleViewDetails(order)}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Pagination */}
      {orders.length > 0 && (
        <div className="mt-4 flex justify-center gap-1 sm:gap-2 overflow-x-auto">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === pagination.currentPage ? "default" : "outline"}
              onClick={() => fetchOrders(page, sortBy)}
              disabled={loading}
            >
              {page}
            </Button>
          ))}
        </div>
      )}

      {loading && <LoadingSpinner />}

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="grid grid-cols-2 gap-4">
              {/* Order Information */}
              <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Order Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  {/* <p>Order ID: <span className="text-gray-600">{selectedOrder.orderID}</span></p> */}
                  <p>Status: <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span></p>
                  <p>Payment Status: <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedOrder.paymentStatus)}`}>
                    {selectedOrder.paymentStatus}
                  </span></p>
                  <p>Payment Method: <span className="text-gray-600">{selectedOrder.paymentMethod}</span></p>
                  <p>Created: <span className="text-gray-600">{formatDate(selectedOrder.createdAt)}</span></p>
                  <p>Updated: <span className="text-gray-600">{formatDate(selectedOrder.updatedAt)}</span></p>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <p>Name: <span className="text-gray-600">{selectedOrder.user.name}</span></p>
                <p>Email: <span className="text-gray-600">{selectedOrder.user.email}</span></p>
                <p>Phone: <span className="text-gray-600">{selectedOrder.user.phoneNumber}</span></p>
              </div>

              {/* Shipping Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Shipping Information</h3>
                <p>Address: <span className="text-gray-600">{selectedOrder.shippingAddress}</span></p>
                <p>Tracking Number: <span className="text-gray-600">{selectedOrder.trackingNumber || 'Not available'}</span></p>
              </div>

              {/* Order Items */}
              <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="border-b pb-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{item.priceAtOrder}</p>
                          <p className="text-sm text-gray-600">
                            <span className="line-through">₹{item.mrp}</span>
                            {' '}({item.discountPercentage}% off)
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-right">
                  <p className="font-semibold">Total Amount: ₹{selectedOrder.totalAmount}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}