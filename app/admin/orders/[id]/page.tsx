"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Bounce, toast } from 'react-toastify'
import { useAuth } from "@/hooks/AuthContext"


// Định nghĩa interfaces cho dữ liệu từ API
interface OrderItem {
  id: number
  name: string
  price: number
  discount: number
  finalPrice: number
  quantity: number
  image: string
  variant: string
}

interface TimelineEntry {
  status: string
  date: string
  description: string
}

interface OrderDetail {
  id: number
  date: string
  status: string
  statusCode: number
  shippingMethod: string | null
  paymentMethod: string | null
  shippingAdress: string
  phoneNumber: string
  receiverName: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  timeLine: TimelineEntry[]
}

export default function OrderDetailPage() {
  const router = useRouter()
  const { token } = useAuth()
  const params = useParams()
    const { id } = params
  const [isLoading, setIsLoading] = useState(true)
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [status, setStatus] = useState("")
  const [historyNote, setHistoryNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Format ngày giờ từ API
  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Lấy dữ liệu đơn hàng từ API
  useEffect(() => {
    if (!token) {
      router.push('/admin/login')
      return
    }

    const fetchOrder = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`http://localhost:5000/api/Order/Get-Order-history?orderId=${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch order')
        }
        
        const result = await response.json()
        
        if (result.status === 1 && result.data) {
          setOrder(result.data)
          setStatus(result.data.statusCode.toString())
        } else {
          toast.error('Failed to load order details')
          router.push('/admin/orders')
        }
      } catch (error) {
        console.error("Error fetching order:", error)
        toast.error('Error loading order details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [id, token, router])

  const getStatusBadge = (statusCode: number) => {
    switch (statusCode) {
      case 1:
        return <Badge variant="outline">Đang chờ xử lý</Badge>
      case 2:
        return <Badge variant="secondary">Đặt hàng thành công</Badge>
      case 3:
        return (
          <Badge variant="default" className="bg-blue-500">
            Đang giao hàng
          </Badge>
        )
      case 4:
        return (
          <Badge variant="default" className="bg-green-500">
            Đã giao hàng thành công
          </Badge>
        )
      case 5:
        return (
          <Badge variant="default" className="bg-emerald-500">
            Đã nhận
          </Badge>
        )
      case 6:
        return <Badge variant="destructive">Đã hủy</Badge>
      default:
        return <Badge variant="outline">Không xác định</Badge>
    }
  }

  const getStatusText = (statusCode: number) => {
    switch (statusCode) {
      case 1: return "Đang chờ xử lý"
      case 2: return "Đặt hàng thành công"
      case 3: return "Đang giao hàng"
      case 4: return "Đã giao hàng thành công"
      case 5: return "Đã nhận"
      case 6: return "Đã hủy"
      default: return "Không xác định"
    }
  }

  const handleUpdateStatus = async () => {
    if (!order || !status || status === order.statusCode.toString()) return
  
    setIsSubmitting(true)
  
    try {
      // Sửa endpoint để sử dụng query parameters thay vì JSON body
      const response = await fetch(
        `http://localhost:5000/api/Order/Update-order-status-admin?orderId=${order.id}&status=${status}`, 
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
            // Không cần Content-Type khi không gửi body
          }
          // Không cần body khi dùng query parameters
        }
      );
  
      if (!response.ok) throw new Error('Failed to update order status');
      
      const result = await response.json();
      
      if (result.status === 1) {
        toast.success('Cập nhật trạng thái thành công', {
            position: "top-right",
            autoClose: 300,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            transition: Bounce,
            onClose: () => router.push("/admin/orders")
        });
        
        // Refresh the order data
        const refreshResponse = await fetch(`http://localhost:5000/api/Order/Get-Order-history?orderId=${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (refreshData.status === 1 && refreshData.data) {
            setOrder(refreshData.data);
          }
        }
        
        // Reset history note
        setHistoryNote("");
      } else {
        toast.error(result.des || 'Không thể cập nhật trạng thái');
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error('Lỗi khi cập nhật trạng thái đơn hàng');
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <h2 className="text-xl">Không tìm thấy thông tin đơn hàng</h2>
        <Button onClick={() => router.push("/admin/orders")}>Quay lại danh sách đơn hàng</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.push("/admin/orders")}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Quay lại</span>
        </Button>
        <h1 className="text-2xl font-bold">Đơn hàng #{order.id}</h1>
        <div className="ml-auto">{getStatusBadge(order.statusCode)}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Sản phẩm trong đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Hình ảnh</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Dung tích</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>SL</TableHead>
                  <TableHead className="text-right">Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="h-12 w-12 rounded-md overflow-hidden">
                        <Image
                          src={`http://localhost:5000/${item.image}`}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.variant} ml</TableCell>
                    <TableCell>{item.finalPrice.toLocaleString()} ₫</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell className="text-right">{(item.finalPrice * item.quantity).toLocaleString()} ₫</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex flex-col items-end gap-2">
            <div className="text-right flex justify-between w-56">
              <span className="text-muted-foreground">Tạm tính:</span>
              <span>{order.subtotal.toLocaleString()} ₫</span>
            </div>
            <div className="text-right flex justify-between w-56">
              <span className="text-muted-foreground">Phí vận chuyển:</span>
              <span>{order.shipping.toLocaleString()} ₫</span>
            </div>
            <div className="text-right flex justify-between w-56 font-bold">
              <span>Tổng cộng:</span>
              <span>{order.total.toLocaleString()} ₫</span>
            </div>
          </CardFooter>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Họ tên</div>
                <div>{order.receiverName}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Điện thoại</div>
                <div>{order.phoneNumber || "Không cung cấp"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Địa chỉ giao hàng</div>
                <div>{order.shippingAdress || "Không cung cấp"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Phương thức thanh toán</div>
                <div>{order.paymentMethod || "Thanh toán khi nhận hàng"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Phương thức vận chuyển</div>
                <div>{order.shippingMethod || "Giao hàng tiêu chuẩn"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Thời gian đặt hàng</div>
                <div>{formatDateTime(order.date)}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cập nhật trạng thái đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Đang chờ xử lý</SelectItem>
                    <SelectItem value="2">Đặt hàng thành công</SelectItem>
                    <SelectItem value="3">Đang giao hàng</SelectItem>
                    <SelectItem value="4">Đã giao hàng thành công</SelectItem>
                    <SelectItem value="5">Đã nhận</SelectItem>
                    <SelectItem value="6">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="historyNote">Ghi chú (Tùy chọn)</Label>
                <Textarea
                  id="historyNote"
                  placeholder="Thêm mô tả cho việc cập nhật trạng thái này"
                  value={historyNote}
                  onChange={(e) => setHistoryNote(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleUpdateStatus}
                disabled={isSubmitting || status === order.statusCode.toString()}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cập nhật trạng thái
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lịch sử đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.timeLine.map((entry, index) => (
                  <div key={index} className="relative pl-6">
                    {index !== order.timeLine.length - 1 && (
                      <div className="absolute top-2 left-2 bottom-0 w-px bg-muted-foreground/20" />
                    )}
                    <div className="absolute top-2 left-0 w-4 h-4 rounded-full border-2 border-primary bg-background" />
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{entry.description}</div>
                      <div className="text-xs text-muted-foreground">{formatDateTime(entry.date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}