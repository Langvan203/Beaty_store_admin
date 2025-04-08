"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
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


export default function AddCategoryPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [category, setCategory] = useState({
    name: "",
    description: "",
    thumbnail: null as File | null,
  })
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const { token } = useAuth()
  const { refeshCategories } = useCategory()

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
    
    if (!category.name.trim()) {
      toast.warning('Category name is required');
      return;
    }
    
    setIsSubmitting(true)

    try {
      const formData = new FormData();
      formData.append('name', category.name);
      formData.append('description', category.description || '');
      
      if (category.thumbnail) {
        formData.append('thumbNail', category.thumbnail);
      }
      
      // Check if token exists
      if (!token) {
        toast.error('You need to be logged in');
        router.push('/admin/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/Category/Create-new-category', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type as browser will set it with boundary for multipart/form-data
        },
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok && result.status === 1) {
        toast.success('Category added successfully', {
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
            router.push("/admin/categories");
          }
        });
      } else {
        toast.error(result.des || 'Failed to add category');
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error('Error adding category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Add New Category</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Category Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input id="name" name="name" value={category.name} onChange={handleInputChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                value={category.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">Category Thumbnail</Label>
              <div className="flex items-center gap-4">
                <Button type="button" variant="outline" onClick={() => document.getElementById("thumbnail")?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
                </Button>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleThumbnailChange}
                />
                <span className="text-sm text-muted-foreground">
                  {category.thumbnail ? category.thumbnail.name : "No file selected"}
                </span>
              </div>
              {thumbnailPreview && (
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
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/categories")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Category
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}