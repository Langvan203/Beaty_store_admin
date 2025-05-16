"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Upload } from "lucide-react"
import { toast, Bounce } from 'react-toastify'
import { useAuth } from "@/hooks/AuthContext"
import { useCategory } from "@/hooks/CategoryContext"


export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const { id } = params
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [category, setCategory] = useState({
    id: 0,
    name: "",
    description: "",
    thumbnail: null as File | null,
  })
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [existingThumbnail, setExistingThumbnail] = useState<string | null>(null)

  const { token } = useAuth()
  const { refeshCategories } = useCategory()

  useEffect(() => {
    if (!token) {
      router.push('/admin/login')
      return
    }

    const fetchCategory = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`http://localhost:5000/api/Category/Get-category-id?id=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch category')
        }
        
        const data = await response.json()
        console.log("API response:", data); // Debug log
        
        if (data.status === 1 && data.data) {
          setCategory({
            id: data.data.categoryID || Number(id),
            name: data.data.name || "",
            description: data.data.description || "",
            thumbnail: null,
          })
          
          // Set existing thumbnail if available
          if (data.data.thumbNail) {
            setExistingThumbnail(`http://localhost:5000/${data.data.thumbNail.replace(/\\/g, "/")}`)
          }
        } else {
          toast.error('Failed to load category data')
        }
      } catch (error) {
        console.error("Error fetching category:", error)
        toast.error('Error loading category data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategory()
  }, [id, token, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCategory({ ...category, [name]: value })
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setCategory({ ...category, thumbnail: file })
      setThumbnailPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('categoryId', category.id.toString())
      formData.append('description', category.description || "")
      
      if (category.thumbnail) {
        formData.append('thumbNail', category.thumbnail)
      }

      const response = await fetch("http://localhost:5000/api/Category/Update-category", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type as browser will set it with boundary for multipart/form-data
        },
        body: formData,
      })
      
      const result = await response.json()
      
      if (response.ok && result.status === 1) {
        toast.success('Category updated successfully', {
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
              refeshCategories()
            router.push("/admin/categories")
          }
        })
      } else {
        toast.error(result.des || 'Failed to update category')
      }
    } catch (error) {
      console.error("Error updating category:", error)
      toast.error('Error updating category')
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sửa danh mục</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin danh mục</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Tên danh mục *</Label>
              <Input id="name" name="name" value={category.name} onChange={handleInputChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                value={category.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">Ảnh</Label>
              <div className="flex items-center gap-4">
                <Button type="button" variant="outline" onClick={() => document.getElementById("thumbnail")?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Tải lên ảnh mới
                </Button>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleThumbnailChange}
                />
                <span className="text-sm text-muted-foreground">
                  {category.thumbnail ? category.thumbnail.name : "Keep existing image"}
                </span>
              </div>
              {thumbnailPreview ? (
                <div className="mt-4">
                  <div className="w-40 h-40 rounded-md overflow-hidden border">
                    <Image
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      width={160}
                      height={160}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              ) : existingThumbnail ? (
                <div className="mt-4">
                  <div className="w-40 h-40 rounded-md overflow-hidden border">
                    <Image
                      src={existingThumbnail}
                      alt="Existing thumbnail"
                      width={160}
                      height={160}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/categories")}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}