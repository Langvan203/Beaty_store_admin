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
import { Bounce, toast } from "react-toastify"
import { useAuth } from "@/hooks/AuthContext"
import { useBrand } from "@/hooks/BrandContext"

export default function EditBrandPage() {
  const router = useRouter()
  const params = useParams()
  const { id } = params
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading1, setIsLoading1] = useState(true)
  const [brand, setBrand] = useState({
    id: 0,
    name: "",
    description: "",
    thumbNail: null as File | null,
  })
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [existingThumbnail, setExistingThumbnail] = useState<string | null>(null)

  const { token, isLoading } = useAuth()
  const {refeshBrand} = useBrand();
  useEffect(() => {
    if (isLoading) return
    if (!token) {
      router.push('/admin/login')
      return
    }

    const fetchBrand = async () => {
      setIsLoading1(true)
      try {
        const response = await fetch(`http://localhost:5000/api/Brand/Get-brand-id?id=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch brand')
        }
        
        const data = await response.json()
        
        if (data.status === 1 && data.data) {
          setBrand({
            id: Number(id),
            name: data.data.name,
            description: data.data.description || "",
            thumbNail: data.data.thumbNail,
          })
          
          // Set existing thumbnail if available
          if (data.data.thumbNail) {
            setExistingThumbnail(`http://localhost:5000/${data.data.thumbNail.replace(/\\/g, "/")}`)
          }
        } else {
          toast.error('Failed to load brand data')
        }
      } catch (error) {
        console.error("Error fetching brand:", error)
        toast.error('Error loading brand data')
      } finally {
        setIsLoading1(false)
      }
    }

    fetchBrand()
  }, [id, token, isLoading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setBrand({ ...brand, [name]: value })
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setBrand({ ...brand, thumbNail: file })
      setThumbnailPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    if (!brand || brand.id === 0) {
      toast.error('Brand data not loaded properly')
      return
    }
    try {
      const formData = new FormData()
      formData.append('brandId', brand.id.toString())
      formData.append('name', brand.name)
      formData.append('description', brand.description || "")
      
      if (brand.thumbNail) {
        formData.append('thumbNail', brand.thumbNail)
      }

      const response = await fetch("http://localhost:5000/api/Brand/Update-brand", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type as browser will set it with boundary for multipart/form-data
        },
        body: formData,
      })
      
      const result = await response.json()
      
      if (response.ok && result.status === 1) {
        toast.success('Brand updated successfully', {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            transition: Bounce,
            onClose: () =>  {
              refeshBrand()
              router.push("/admin/brands") 
            }
        })
      } else {
        toast.error(result.des || 'Failed to update brand')
      }
    } catch (error) {
      console.error("Error updating brand:", error)
      toast.error('Error updating brand')
    } finally {
      setIsSubmitting(false)
    }
  }
  if (isLoading || isLoading1) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }


  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Brand</h1>
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
                  Upload New Image
                </Button>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleThumbnailChange}
                />
                <span className="text-sm text-muted-foreground">
                  {brand.thumbNail ? brand.thumbNail.name : "Keep existing image"}
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
            <Button type="button" variant="outline" onClick={() => router.push("/admin/brands")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Brand
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}