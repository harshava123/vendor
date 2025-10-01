"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import Cookies from "js-cookie";
import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  ShoppingBag,
  Users,
  DollarSign,
  LineChart,
} from "lucide-react";
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const readToken = () => {
      // Prefer app auth token; fallback to cookie 'token' for legacy
      const local = typeof window !== "undefined" ? apiClient.getAuthToken() || localStorage.getItem("authToken") || localStorage.getItem("token") : undefined;
      return local || Cookies.get("token") || undefined;
    };
    const token = readToken();
    if (!token) {
      // Re-check shortly to avoid race condition after OTP set
      const t = setTimeout(() => {
        if (!cancelled) {
          const token2 = readToken();
          if (!token2) router.replace("/login");
        }
      }, 300);
      return () => {
        cancelled = true;
        clearTimeout(t);
      };
    }
    return () => {
      cancelled = true;
    };
  }, [router]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 12
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  };

  const salesComparisonData = {
    labels: ["Mon", "Tue", "Wed", "Thurs", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Sales",
        data: [20, 28, 10, 45, 30, 35, 18],
        backgroundColor: "#c7f2ce",
      },
    ],
  };

  const revenueTrackData = {
    labels: ["Mon", "Tue", "Wed", "Thur", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Revenue",
        data: [18, 38, 35, 45, 28, 38, 35],
        backgroundColor: "#ffeac2",
      },
    ],
  };

  // if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--light-gray)', color: 'var(--text-primary)' }}>
      {/* Welcome Heading */}
      <div className="py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-semibold font-poppins italic" style={{ color: 'var(--text-primary)' }}>
          Hi XYZ, Welcome to your Dashboard
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <Card className="rounded-xl p-2 font-inter shadow-none" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold mb-2">120</h2>
                <p className="font-poppins" style={{ color: 'var(--text-secondary)' }}>Total Orders Today</p>
              </div>
              <ShoppingBag className="h-8 w-8" style={{ color: 'var(--text-secondary)' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl p-2 font-inter shadow-none" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold mb-2">4120</h2>
                <p className="font-poppins" style={{ color: 'var(--text-secondary)' }}>Monthly Sales</p>
              </div>
              <LineChart className="h-8 w-8" style={{ color: 'var(--text-secondary)' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl p-2 font-inter shadow-none" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold mb-2">24</h2>
                <p className="font-poppins" style={{ color: 'var(--text-secondary)' }}>Total Customers Today</p>
              </div>
              <Users className="h-8 w-8" style={{ color: 'var(--text-secondary)' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl p-2 font-inter shadow-none" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold mb-2">32k</h2>
                <p className="font-poppins" style={{ color: 'var(--text-secondary)' }}>Daily Revenue</p>
              </div>
              <DollarSign className="h-8 w-8" style={{ color: 'var(--text-secondary)' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <Card className="rounded-lg shadow" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Sales Comparison Graph</CardTitle>
          </CardHeader>
          <CardContent className="h-64 sm:h-80">
            <Bar data={salesComparisonData} options={chartOptions} />
          </CardContent>
        </Card>

        <Card className="rounded-lg shadow" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Revenue Track</CardTitle>
          </CardHeader>
          <CardContent className="h-64 sm:h-80">
            <Bar data={revenueTrackData} options={chartOptions} />
          </CardContent>
        </Card>
      </div>

    <div className="mt-6 p-4 rounded-xl mb-6" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
      <Table>
            <TableHeader className="border-b" style={{ borderColor: 'var(--border-light)' }}>
              <TableRow className="py-6">
                <TableHead>SN</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date & time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                {
                  id: 1,
                  orderId: "0A123",
                  name: "Rathore",
                  product: "Dress",
                  status: "Delivered",
                  date: "10/11/2023, 14:23",
                },
                {
                  id: 2,
                  orderId: "0A123",
                  name: "Rathore",
                  product: "Dress",
                  status: "Delivered",
                  date: "10/11/2023, 14:23",
                },
                {
                  id: 3,
                  orderId: "0A123",
                  name: "Rathore",
                  product: "Bag",
                  status: "Pending",
                  date: "10/11/2023, 14:23",
                },
                {
                  id: 4,
                  orderId: "0A123",
                  name: "Rathore",
                  product: "Dress",
                  status: "Cancelled",
                  date: "10/11/2023, 14:23",
                },
                {
                  id: 5,
                  orderId: "0A123",
                  name: "Rathore",
                  product: "Bags",
                  status: "Delivered",
                  date: "10/11/2023, 14:23",
                },
              ].map((order) => (
                <TableRow key={order.id} className="border-b py-6" style={{ borderColor: 'var(--border-light)' }}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.orderId}</TableCell>
                  <TableCell>{order.name}</TableCell>
                  <TableCell>{order.product}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>{order.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
    </div>
  );
};

export default Home;
