"use client"
import type React from "react"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { BarChart3, Package, ShoppingBag, Tag, Users, Layers, FileBox, Menu, LogOut, User, Palette } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/AuthContext"

interface AdminUser {
  name: string
  email: string
  avatar: string
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth();


  // Check if the current path is the login page
  const isLoginPage = pathname === "/admin/login"

  const handleLogout = () => {
    // Clear authentication cookie
    document.cookie = "adminAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

    // Clear user data from localStorage
    localStorage.removeItem("adminUser")

    // Redirect to login page
    router.push("/admin/login")
  }
  useEffect(() => {
    // Nếu người dùng có role = 2 (Staff) và đang truy cập trang cấm
    if (user && user.role === 2) {
      const restrictedPaths = ['/admin', '/admin/users', '/admin/brands', '/admin/categories'];
      const isRestrictedPath = restrictedPaths.some(path =>
        pathname === path || pathname.startsWith(`${path}/`)
      );


    }
  }, [pathname, user, router]);
  const canAccessDashboard = !user || user.role !== 2;
  const canAccessUsers = !user || user.role !== 2;
  const canAccessBrands = !user || user.role !== 2;
  const canAccessCategories = !user || user.role !== 2;
  // If it's the login page, just render the children without the admin layout
  if (isLoginPage) {
    return <>{children}</>
  }

  // Otherwise, render the admin layout with navigation
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">

            <Link href="/admin" className="flex items-center gap-2 font-semibold">
              <Package className="h-6 w-6" />
              <span>Admin Dashboard</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium">
              {canAccessDashboard && (
                <Link
                  href="/admin"
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${pathname === "/admin" ? "bg-accent text-accent-foreground" : "hover:bg-accent"
                    }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </Link>
              )}
              <Link
                href="/admin/products"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${pathname.startsWith("/admin/products") ? "bg-accent text-accent-foreground" : "hover:bg-accent"
                  }`}
              >
                <ShoppingBag className="h-4 w-4" />
                Sản phẩm
              </Link>
              {canAccessBrands && (
                <Link
                  href="/admin/brands"
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${pathname.startsWith("/admin/brands") ? "bg-accent text-accent-foreground" : "hover:bg-accent"
                    }`}
                >
                  <Tag className="h-4 w-4" />
                  Nhãn hàng
                </Link>
              )}
              {canAccessCategories && (
                <Link
                  href="/admin/categories"
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${pathname.startsWith("/admin/categories") ? "bg-accent text-accent-foreground" : "hover:bg-accent"
                    }`}
                >
                  <Layers className="h-4 w-4" />
                  Danh mục
                </Link>
              )}
              <Link
                href="/admin/variants"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${pathname.startsWith("/admin/variants") ? "bg-accent text-accent-foreground" : "hover:bg-accent"
                  }`}
              >
                <FileBox className="h-4 w-4" />
                Kích thước
              </Link>
              <Link
                href="/admin/colors"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${pathname.startsWith("/admin/colors") ? "bg-accent text-accent-foreground" : "hover:bg-accent"
                  }`}
              >
                <Palette className="h-4 w-4" />
                Màu sắc
              </Link>
              {canAccessUsers && (
                <Link
                  href="/admin/users"
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${pathname.startsWith("/admin/users") ? "bg-accent text-accent-foreground" : "hover:bg-accent"
                    }`}
                >
                  <Users className="h-4 w-4" />
                  Người dùng
                </Link>
              )}
              <Link
                href="/admin/orders"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${pathname.startsWith("/admin/orders") ? "bg-accent text-accent-foreground" : "hover:bg-accent"
                  }`}
              >
                <Package className="h-4 w-4" />
                Đơn hàng
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[280px]">
              <nav className="grid gap-2 text-lg font-medium">
                {canAccessDashboard && (
                  <Link
                    href="/admin"
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all ${pathname === "/admin" ? "bg-accent text-accent-foreground" : "hover:bg-accent"
                      }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Dashboard
                  </Link>
                )}
                <Link
                  href="/admin/products"
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all ${pathname.startsWith("/admin/products") ? "bg-accent text-accent-foreground" : "hover:bg-accent"
                    }`}
                >
                  <ShoppingBag className="h-4 w-4" />
                  Sản phẩm
                </Link>
                {canAccessBrands && (
                  <Link
                    href="/admin/brands"
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all ${pathname.startsWith("/admin/brands") ? "bg-accent text-accent-foreground" : "hover:bg-accent"
                      }`}
                  >
                    <Tag className="h-4 w-4" />
                    Nhãn hàng
                  </Link>
                )}
                {canAccessCategories && (
                  <Link
                    href="/admin/categories"
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all ${pathname.startsWith("/admin/categories") ? "bg-accent text-accent-foreground" : "hover:bg-accent"
                      }`}
                  >
                    <Layers className="h-4 w-4" />
                    Danh mục
                  </Link>
                )}
                <Link
                  href="/admin/variants"
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all ${pathname.startsWith("/admin/variants") ? "bg-accent text-accent-foreground" : "hover:bg-accent"
                    }`}
                >
                  <FileBox className="h-4 w-4" />
                  Kích thước
                </Link>
                <Link
                  href="/admin/colors"
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${pathname.startsWith("/admin/colors") ? "bg-accent text-accent-foreground" : "hover:bg-accent"
                    }`}
                >
                  <Palette className="h-4 w-4" />
                  Màu sắc
                </Link>
                {canAccessUsers && (
                  <Link
                    href="/admin/users"
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all ${pathname.startsWith("/admin/users") ? "bg-accent text-accent-foreground" : "hover:bg-accent"
                      }`}
                  >
                    <Users className="h-4 w-4" />
                    Người dùng
                  </Link>
                )}
                <Link
                  href="/admin/orders"
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all ${pathname.startsWith("/admin/orders") ? "bg-accent text-accent-foreground" : "hover:bg-accent"
                    }`}
                >
                  <Package className="h-4 w-4" />
                  Đơn hàng
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex-1 flex items-center justify-between">
            <h1 className="text-lg font-semibold">Admin Panel</h1>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 flex items-center gap-2 px-2">
                    {/* <Avatar className="h-8 w-8">
                      <AvatarImage src={`http://localhost:5000/${user.avatar.replace("/\\/g","/")}`} alt={user.userName} />
                      <AvatarFallback>
                        {user.userName
                          .split(" ")
                          .map((n:any) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar> */}
                    <span className="hidden md:inline-block">{user.userName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Menu</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center gap-2 text-red-600" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

