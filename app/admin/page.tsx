"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { DollarSign, Package, ShoppingCart, Users, Calendar, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useChart } from "@/hooks/ChartContext"
// import { useChart } from "@/hooks/ChartContext"

// Generate years from current year back to 2020


export default function AdminDashboard() {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 2019 }, (_, i) => (currentYear - i).toString())
  // Months for filtering

  // Mock data for different years and months

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
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]
  const router = useRouter();
  const { chartData, refreshChart, selectedYear, setSelectedYear } = useChart();
  console.log("dữ liệu chart");
  console.log(chartData);
  // Check if user is authenticated
  useEffect(() => {
    const isAuthenticated = document.cookie.includes("adminAuthenticated=true")
    if (!isAuthenticated) {
      router.push("/admin/login")
    }
  }, [router])


  const handleYearChange = (year: string) => {
    setSelectedYear(year)
    refreshChart(year);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Date Range</h4>
                  <p className="text-sm text-muted-foreground">Filter dashboard data by year and month</p>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="year">Year</Label>
                    <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                      <SelectTrigger id="year">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex items-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {selectedYear}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <h3 className="text-2xl font-bold">{chartData?.totalOrders}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <h3 className="text-2xl font-bold">{chartData?.totalProducts}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <h3 className="text-2xl font-bold">{chartData?.totalRevenue.toLocaleString('vi-VN')+ 'đ'} </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <h3 className="text-2xl font-bold">{chartData?.totalUsers}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="sales">Sales Overview</TabsTrigger>
          <TabsTrigger value="categories">Category Distribution</TabsTrigger>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>
                {`Monthly Sales (${selectedYear})`}
              </CardTitle>
              <CardDescription>
                Sales performance over the year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData?.monthlySales}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
              <CardDescription>Distribution of products by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData?.categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(2)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData?.categoryDistribution.map((entry: any, index: any) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <ScrollArea.Root className="h-[400px] w-full">
                  <ScrollArea.Viewport className="w-full h-full">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Order ID</th>
                          <th className="text-left p-2">Customer</th>
                          <th className="text-left p-2">Date</th>
                          <th className="text-left p-2">Total</th>
                          <th className="text-left p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>

                        {chartData?.recentOrders.map((order) => (
                          <tr key={order.id} className="border-b">
                            <td className="p-2">#{order.id}</td>
                            <td className="p-2">{order.name}</td>
                            <td className="p-2">{formatDateTime(order.orderDate)}</td>
                            <td className="p-2">{order.totalAmount.toLocaleString('vi-VN')+"đ"}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 text-xs bg-green-100 rounded-full
                                        ${order.status === "Đang chờ xử lý"
                                  ? "bg-orange-400"
                                  : order.status === "Đang giao hàng"
                                    ? "bg-cyan-600"
                                    : order.status === "Đã hoàn thành"
                                      ? "bg-green-400"
                                      : order.status === "Đã hủy"
                                        ? "bg-red-400"
                                        : "bg-slate-700"
                                }`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>

                        ))}

                      </tbody>

                    </table>
                  </ScrollArea.Viewport>
                  <ScrollArea.Scrollbar orientation="vertical" className="flex select-none touch-none transition-colors">
                    <ScrollArea.Thumb className="bg-gray-400 rounded" />
                  </ScrollArea.Scrollbar>
                  <ScrollArea.Corner className="bg-gray-200" />
                </ScrollArea.Root>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div >
  )
}

