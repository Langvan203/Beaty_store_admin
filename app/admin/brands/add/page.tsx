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
import { useBrand } from "@/hooks/BrandContext"

export default function AddBrandPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [brand, setBrand] = useState({
    name: "",
    description: "",
    thumbnail: null as File | null,
  })
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const { token } = useAuth()
  const { refeshBrand } = useBrand()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setBrand({ ...brand, [name]: value })
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setBrand({ ...brand, thumbnail: file })
      setThumbnailPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!brand.name.trim()) {
      toast.warning('Brand name is required');
      return;
    }
    
    setIsSubmitting(true)

    try {
      const formData = new FormData();
      formData.append('name', brand.name);
      formData.append('description', brand.description || '');
      if (brand.thumbnail) {
        formData.append('thumbNail', brand.thumbnail);
      }

      // Add validation for token
      if (!token) {
        toast.error('You need to be logged in');
        router.push('/admin/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/Brand/CreateNewBrand', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type as the browser will set it with boundary for multipart/form-data
        },
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok && result.status === 1) {
        toast.success('Brand added successfully', {
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
            refeshBrand();
            router.push("/admin/brands")
          }
        });
      } else {
        toast.error(result.des || 'Failed to add brand');
      }
    } catch (error) {
      console.error("Error adding brand:", error);
      toast.error('Error adding brand. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Add New Brand</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Brand Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Brand Name *</Label>
              <Input id="name" name="name" value={brand.name} onChange={handleInputChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                value={brand.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">Brand Thumbnail</Label>
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
                  {brand.thumbnail ? brand.thumbnail.name : "No file selected"}
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
            <Button type="button" variant="outline" onClick={() => router.push("/admin/brands")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Brand
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}