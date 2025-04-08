"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'react-toastify'
import { useAuth } from "@/hooks/AuthContext"

// Interface khớp với cấu trúc dữ liệu API
interface Order {
  id: number;
  date: string;
  totalAmount: number;
  status: string;
  phone: string;
  userName: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { token } = useAuth()

  // Format ngày giờ từ API
  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // Fetch dữ liệu từ API khi component được mount
  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/Order/GetAllOrderAdmin", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const result = await response.json();
        
        if (result.status === 1 && Array.isArray(result.data)) {
          setOrders(result.data);
        } else {
          toast.error('Failed to load orders');
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error('Error loading orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  // Chuyển đổi từ mã filter sang text trạng thái
  const getStatusFromFilter = (filter: string) => {
    switch (filter) {
      case "1": return "Đang chờ xử lý";
      case "2": return "Đặt hàng thành công";
      case "3": return "Đang giao hàng";
      case "4": return "Đã giao hàng thành công";
      case "5": return "Đã nhận";
      case "6": return "Đã hủy";
      default: return "";
    }
  };

  // Lọc đơn hàng theo tìm kiếm và trạng thái
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone?.includes(searchTerm);

    const matchesStatus = statusFilter === "all" || order.status === getStatusFromFilter(statusFilter);

    return matchesSearch && matchesStatus;
  });

  // Badge cho các trạng thái khác nhau
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Đang chờ xử lý":
        return <Badge variant="outline">Đang chờ xử lý</Badge>;
      case "Đặt hàng thành công":
        return <Badge variant="secondary">Đặt hàng thành công</Badge>;
      case "Đang giao hàng":
        return (
          <Badge variant="default" className="bg-blue-500">
            Đang giao hàng
          </Badge>
        );
      case "Đã giao hàng thành công":
        return (
          <Badge variant="default" className="bg-green-500">
            Đã giao hàng thành công
          </Badge>
        );
      case "Đã nhận":
        return (
          <Badge variant="default" className="bg-emerald-500">
            Đã nhận
          </Badge>
        );
      case "Đã hủy":
        return <Badge variant="destructive">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Đơn hàng</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quản lý đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm theo tên khách hàng hoặc số điện thoại..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="1">Processing</SelectItem>
                  <SelectItem value="2">Order success</SelectItem>
                  <SelectItem value="3">Deliviring</SelectItem>
                  <SelectItem value="4">Delivired</SelectItem>
                  <SelectItem value="5">Success</SelectItem>
                  <SelectItem value="6">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Không tìm thấy đơn hàng
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell>{formatDateTime(order.date)}</TableCell>
                      <TableCell className="font-medium">{order.userName}</TableCell>
                      <TableCell className="hidden md:table-cell">{order.phone || "N/A"}</TableCell>
                      <TableCell>{order.totalAmount.toLocaleString()} đ</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/orders/${order.id}`}>Xem chi tiết</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}