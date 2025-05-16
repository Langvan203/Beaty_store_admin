"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Plus, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { toast, Bounce } from 'react-toastify'
import { useBrand } from "@/hooks/BrandContext"
import { useAuth } from "@/hooks/AuthContext"

export default function BrandsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const { brand, refeshBrand } = useBrand()
  const { token } = useAuth()
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const filteredBrands = brand?.filter((brand) => 
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openDeleteDialog = (id: number) => {
    setSelectedBrandId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedBrandId) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`http://localhost:5000/api/Brand/DeleteBrand?id=${selectedBrandId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      const result = await response.json()
      
      if (response.ok && result.status === 1) {
        toast.success('Brand deleted successfully', {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false, 
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
          onClose: () => {
            // Refresh brand list after deletion
            refeshBrand()
          }
        })
      } else {
        toast.error(result.des || 'Failed to delete brand')
      }
    } catch (error) {
      console.error("Error deleting brand:", error)
      toast.error('Error deleting brand')
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setSelectedBrandId(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Thương hiệu</h1>
        <Link href="/admin/brands/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm thương hiệu
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quản lý thương hiệu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search brands..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Ảnh</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead className="hidden md:table-cell">Mô tả</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBrands?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Không có thương hiệu nào được tìm thấy
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBrands?.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell>{brand.id}</TableCell>
                      <TableCell>
                        <div className="h-10 w-10 rounded-md overflow-hidden">
                          <Image
                            src={`http://localhost:5000/${brand.thumbnail?.replace(/\\/g, "/")}` || "/placeholder.svg"}
                            alt={brand.name}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{brand.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{brand.description}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Mở menu</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                              >
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="12" cy="5" r="1" />
                                <circle cx="12" cy="19" r="1" />
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/brands/edit/${brand.id}`}>Sửa</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => openDeleteDialog(brand.id)}
                            >
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể thay đổi. Thương hiệu sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}