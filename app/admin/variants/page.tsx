"use client"

import { useState } from "react"
import { Plus, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { toast, Bounce } from 'react-toastify'
import { useVariant } from "@/hooks/VariantContext"
import { useAuth } from "@/hooks/AuthContext"



export default function VariantsPage() {
  const { Variant, refreshVariant } = useVariant()
  const { token } = useAuth()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [newVariant, setNewVariant] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Delete dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredVariants = Variant?.filter((variant) => 
    variant.name.toString().includes(searchTerm)
  )

  const openDeleteDialog = (id: number) => {
    setSelectedVariantId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedVariantId) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`http://localhost:5000/api/VariantType/DeleteVariant?variantId=${selectedVariantId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      const result = await response.json()
      
      if (response.ok && result.status === 1) {
        toast.success('Variant deleted successfully', {
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
            // Refresh variant list after deletion
            refreshVariant()
          }
        })
      } else {
        toast.error(result.des || 'Failed to delete variant')
      }
    } catch (error) {
      console.error("Error deleting variant:", error)
      toast.error('Error deleting variant')
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setSelectedVariantId(null)
    }
  }

  const handleAddVariant = async () => {
    if (!newVariant.trim()) {
      toast.warning('Please enter a variant size')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`http://localhost:5000/api/VariantType/AddNewVariant?variant=${newVariant}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      const result = await response.json()
      
      if (response.ok && result.status === 1) {
        toast.success('Variant added successfully', {
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
            // Refresh variant list after adding new one
            refreshVariant()
          }
        })
        
        // Reset form and close dialog
        setNewVariant("")
        setIsDialogOpen(false)
      } else {
        toast.error(result.des || 'Failed to add variant')
      }
    } catch (error) {
      console.error("Error adding variant:", error)
      toast.error('Error adding variant')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kích thước sản phẩm</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm kích thước
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm mới kích thước</DialogTitle>
              <DialogDescription>Thêm mới kích thước sản phẩm</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="variant">Kích thước *</Label>
                <Input
                  id="variant"
                  
                  min="1"
                  value={newVariant}
                  onChange={(e) => setNewVariant(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleAddVariant} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Thêm kích thước
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quản lý kích thước</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search variants..."
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
                  <TableHead>Kích thước</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVariants?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      Không có kích thước nào được tìm thấy
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVariants?.map((variant) => (
                    <TableRow key={variant.id}>
                      <TableCell>{variant.id}</TableCell>
                      <TableCell className="font-medium">{variant.name}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-100"
                          onClick={() => openDeleteDialog(variant.id)}
                        >
                          Xóa
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa kích thước này? Hành động này không thể hoàn tác.
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