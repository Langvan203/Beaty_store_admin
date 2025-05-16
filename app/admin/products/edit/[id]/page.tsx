"use client"

import type React from "react"

import { useEffect, useState, ChangeEvent } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload } from "lucide-react"
import { useProduct } from "@/hooks/ProductContext"
import { get } from "http"
import { Product } from "@/app/types/product"
import { useVariant } from "@/hooks/VariantContext"
import { useCategory } from "@/hooks/CategoryContext"
import { useBrand } from "@/hooks/BrandContext"
import { useAuth } from "@/hooks/AuthContext"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bounce, ToastContainer, toast } from 'react-toastify';

interface ImageItem {
  type: string;
  data: File | {
    id: number;
    url: string;
    isMain: boolean;
  };
}
interface ProductVariant {
  variantId: number
  size: number
  price: number
  stock: number
}
interface Color {
  id: number;
  hexaValue: string;
  name: string;
}

interface ProductColor {
  colorId: number;
  colorName: string;
  colorCode: string;
}
export default function EditProductPage() {
  const { Variant } = useVariant();
  const { Category } = useCategory();
  const { brand } = useBrand();
  const { token, isLoading: authLoading } = useAuth();
  const router = useRouter()
  const params = useParams();
  const { id } = params;
  const { refreshProduct } = useProduct();
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [colors, setColors] = useState<Color[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [product, setProduct] = useState({
    id: 0,
    name: "",
    productDescription: "",
    price: "",
    discount: "",
    categoryId: "",
    brandId: "",
    ingredient: "",
    userManual: "",
    variants: [] as ProductVariant[], // Thay đổi từ string[] thành ProductVariant[]
    colors: [] as ProductColor[], // Thêm mảng colors
    existingImages: [] as { id: number, url: string, isMain: boolean }[],
  })

  // Thêm state để quản lý việc lựa chọn variants
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [allImages, setAllImages] = useState<ImageItem[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(-1) // Chỉ số ảnh chính trong allImages
  // In a real application, you would fetch the product data from your API
  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.push('/admin/login');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/Product/Get-product-update?productId=${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();

        if (data.data && data.status === 1) {
          // Map variants từ API response sang định dạng ProductVariant của chúng ta
          const mappedVariants: ProductVariant[] = data.data.variants.map((v: { id: number; variantName: string; variantPrice: number; variantStock: number }) => ({
            variantId: v.id,
            size: parseFloat(v.variantName),
            price: v.variantPrice,
            stock: v.variantStock
          }));

          // Lấy ra các ID của variant đã được chọn
          const variantIds = mappedVariants.map(v => v.variantId.toString());
          setSelectedVariants(variantIds);

          const mappedColors: ProductColor[] = (data.data.colors || []).map((c: {
            colorId: number;  // ✓ Sửa thành colorId
            colorName: string;
            colorCode: string;
            stock: number  // ✓ Sửa thành stock
          }) => ({
            colorId: c.colorId,  // ✓ Sửa thành c.colorId
            colorName: c.colorName,
            colorCode: c.colorCode,
            stock: c.stock  // ✓ Sửa thành c.stock
          }));
          const colorIds = mappedColors.map(c => c.colorId.toString());
          setSelectedColors(colorIds);
          const existingImages = data.data.existingImages.map((img: any) => ({
            type: 'existing',
            data: { id: img.id, url: img.url },
            isMain: img.isMain
          }))

          setAllImages(existingImages);
          const mainIdx = existingImages.findIndex((img: any) => img.isMain);
          setMainImageIndex(mainIdx !== -1 ? mainIdx : -1);

          setProduct({
            id: data.data.id,
            name: data.data.name,
            productDescription: data.data.productDescription || "",
            price: data.data.price.toString(),
            discount: (data.data.discount).toString(),
            categoryId: data.data.categoryId.toString(),
            brandId: data.data.brandId.toString(),
            ingredient: data.data.ingredient || "",
            userManual: data.data.userManual || "",
            variants: mappedVariants, // Sử dụng variants đã được map
            colors: mappedColors,
            existingImages: data.data.existingImages.map((img: any) => ({
              id: img.id,
              url: img.url,
              isMain: img.isMain,
            })),
          })
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, token, authLoading]);

  useEffect(() => {
    const fetchColors = async () => {
      if (!token) return;

      try {
        const response = await fetch("http://localhost:5000/api/Color/Get-all-color-admin", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        if (result.status === 1 && Array.isArray(result.data)) {
          setColors(result.data);
        }
      } catch (error) {
        console.error("Error fetching colors:", error);
      }
    };

    fetchColors();
  }, [token]);
  useEffect(() => {
    // Clean up object URLs when component unmounts or images change
    return () => {
      allImages.forEach(image => {
        if (image.type === 'new') {
          URL.revokeObjectURL(URL.createObjectURL(image.data as File));
        }
      });
    };
  }, [allImages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProduct({ ...product, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setProduct({ ...product, [name]: value })
  }

  const handleVariantChange = (variant: string) => {
    let updatedSelectedVariants = [...selectedVariants];

    if (updatedSelectedVariants.includes(variant)) {
      // Nếu đã chọn, bỏ chọn biến thể
      updatedSelectedVariants = updatedSelectedVariants.filter(v => v !== variant);

      // Xóa biến thể khỏi danh sách variants
      const updatedVariants = product.variants.filter(v => v.variantId !== Number(variant));
      setProduct({ ...product, variants: updatedVariants });
    } else {
      // Nếu chưa chọn, thêm biến thể vào danh sách
      updatedSelectedVariants.push(variant);

      // Lấy thông tin kích thước từ Variant
      const variantSize = Variant?.find(v => v.id.toString() === variant)?.name || "0";

      // Thêm biến thể mới với giá và tồn kho mặc định
      const newVariant: ProductVariant = {
        variantId: Number(variant),
        size: parseFloat(variantSize),
        price: 0,
        stock: 0
      };

      setProduct({
        ...product,
        variants: [...product.variants, newVariant]
      });
    }

    setSelectedVariants(updatedSelectedVariants);
  };

  const handleColorChange = (color: string) => {
    let updatedSelectedColors = [...selectedColors];

    if (updatedSelectedColors.includes(color)) {
      // Nếu đã chọn, bỏ chọn màu
      updatedSelectedColors = updatedSelectedColors.filter(c => c !== color);

      // Xóa màu khỏi danh sách colors
      const updatedColors = product.colors.filter(c => c.colorId !== Number(color));
      setProduct({ ...product, colors: updatedColors });
    } else {
      // Nếu chưa chọn, thêm màu vào danh sách
      updatedSelectedColors.push(color);

      // Tìm thông tin màu từ danh sách
      const selectedColor = colors.find(c => c.id.toString() === color);

      // Thêm màu mới với số lượng mặc định là 0
      if (selectedColor) {
        const newColor: ProductColor = {
          colorId: Number(color),
          colorName: selectedColor.name,
          colorCode: selectedColor.hexaValue,
        };

        setProduct({
          ...product,
          colors: [...product.colors, newColor],
        });
      }
    }

    setSelectedColors(updatedSelectedColors);
  };
  const handleColorStockChange = (colorId: string, value: string) => {
    const updatedColors = product.colors.map(color => {
      if (color.colorId === Number(colorId)) {
        return { ...color, stock: Number(value) };
      }
      return color;
    });

    setProduct({ ...product, colors: updatedColors });
  };

  const handleVariantDetailChange = (variantId: string, field: "price" | "stock", value: string) => {
    const updatedVariants = product.variants.map(variant => {
      if (variant.variantId === Number(variantId)) {
        return { ...variant, [field]: Number(value) };
      }
      return variant;
    });

    setProduct({ ...product, variants: updatedVariants });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files).map((file: File) => ({
        type: 'new',
        data: file
      }));
      setAllImages(prev => [...prev, ...fileArray]);
    }
  };
  // console.log(product);

  const removeImage = (imageToRemove: number | string) => {
    let indexToRemove: number;

    if (typeof imageToRemove === 'number') {
      // Find index of existing image by id
      indexToRemove = allImages.findIndex(img =>
        img.type === 'existing' && (img.data as { id: number }).id === imageToRemove
      );
    } else {
      // For new images, we already have the index
      indexToRemove = parseInt(imageToRemove);
    }

    if (indexToRemove === -1) return;

    const newAllImages = allImages.filter((_, index) => index !== indexToRemove);
    setAllImages(newAllImages);

    // Update mainImageIndex
    if (indexToRemove === mainImageIndex) {
      setMainImageIndex(newAllImages.length > 0 ? 0 : -1);
    } else if (indexToRemove < mainImageIndex) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };


  // Thêm hàm để xử lý việc đặt ảnh chính
  const setMainImage = (index: number) => {
    setMainImageIndex(index)
  }


  console.log(product);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()

      // Basic product information
      formData.append("ProductID", product.id.toString())
      formData.append("ProductName", product.name)
      formData.append("ProductDescription", product.productDescription)
      formData.append("ProductPrice", product.price)
      formData.append("ProductDiscount", (parseFloat(product.discount)).toString())
      formData.append("ProductIngredient", product.ingredient)
      formData.append("ProductUserManual", product.userManual)
      const variantsJson = JSON.stringify(
        product.variants.map((v) => ({
          VariantID: v.variantId,
          VariantPrice: v.price,
          VariantStock: v.stock,
        }))
      );
      formData.append("VariantID", variantsJson);
      const colorsJson = JSON.stringify(
        product.colors.map((c) => ({
          ColorID: c.colorId,
        }))
      );
      formData.append("colorID", colorsJson);
      // Existing images - only include IDs of existing images that weren't removed
      const existingImageIdsToKeep = allImages
        .filter(img => img.type === 'existing')
        .map(img => ('id' in img.data ? img.data.id : null))
        .filter(id => id !== null)
      formData.append("ExistingImageIdsToKeep", existingImageIdsToKeep.join(','))

      // New images - only include newly selected files
      const newImages = allImages
        .filter(img => img.type === 'new' && img.data instanceof File)

      // Log the new files being added
      console.log('New files to upload:', newImages.length)

      newImages.forEach(img => {
        const file = img.data as File
        console.log('Adding file:', file.name)
        formData.append('Files', file)
      })

      // Main image index
      formData.append("MainImageIndex", mainImageIndex.toString())

      // Debug log
      console.log('FormData contents:')
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name} (${value.size} bytes)`)
        } else {
          console.log(`${key}: ${value}`)
        }
      }

      const response = await fetch("http://localhost:5000/api/Product/Update-product", {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const result = await response.json()
      console.log('Response:', result)

      if (response.ok) {
        toast.success('Cập nhập sản phẩm thành công', {
          position: "top-right",
          autoClose: 500,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
          onClose: () => {
            router.push("/admin/products")
            refreshProduct();
          }
        });
      } else {
        toast.warning('Lỗi khi cập nhật sản phẩm', {
          position: "top-right",
          autoClose: 500,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
        });
      }
    } catch (error) {
      console.error("Error updating product:", error)
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
        <h1 className="text-2xl font-bold">Sửa sản phẩm</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin sản phẩm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Tên sản phẩm *</Label>
                <Input id="name" name="name" value={product.name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Giá *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={product.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discount">Giảm giá (%)</Label>
                <Input
                  id="discount"
                  name="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={product.discount}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Danh mục *</Label>
                <Select
                  value={product.categoryId}
                  onValueChange={(value) => handleSelectChange("categoryId", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Category?.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandId">Nhãn hiệu *</Label>
                <Select
                  value={product.brandId}
                  onValueChange={(value) => handleSelectChange("brandId", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brand?.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                value={product.productDescription}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ingredient">Chi tiết mô tả</Label>
              <Textarea
                id="ingredient"
                name="ingredient"
                rows={3}
                value={product.ingredient}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userManual">Hướng dẫn</Label>
              <Textarea
                id="userManual"
                name="userManual"
                rows={3}
                value={product.userManual}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Kích thước sản phẩm</Label>
              <div className="flex flex-wrap gap-2">
                {Variant?.map((variant) => (
                  <Button
                    key={variant.id}
                    type="button"
                    variant={selectedVariants.includes(variant.id.toString()) ? "default" : "outline"}
                    onClick={() => handleVariantChange(variant.id.toString())}
                    className="rounded-full"
                  >
                    {variant.name}
                  </Button>
                ))}
              </div>
            </div>

            {product.variants.length > 0 && (
              <div className="space-y-2">
                <Label>Chi tiết kích thước</Label>
                <div className="rounded-md border mt-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Size</TableHead>
                        <TableHead>Giá ($) *</TableHead>
                        <TableHead>Số lượng *</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {product.variants.map((variant) => (
                        <TableRow key={variant.variantId}>
                          <TableCell>{variant.size} ml</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={variant.price}
                              onChange={(e) => handleVariantDetailChange(variant.variantId.toString(), "price", e.target.value)}
                              required
                              placeholder="Enter price"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              value={variant.stock}
                              onChange={(e) => handleVariantDetailChange(variant.variantId.toString(), "stock", e.target.value)}
                              required
                              placeholder="Enter stock"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Màu sắc</Label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <Button
                    key={color.id}
                    type="button"
                    variant={selectedColors.includes(color.id.toString()) ? "default" : "outline"}
                    onClick={() => handleColorChange(color.id.toString())}
                    className="rounded-full flex items-center gap-2"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: color.hexaValue }}
                    ></div>
                    {color.name}
                  </Button>
                ))}
              </div>
            </div>

            {product.colors.length > 0 && (
              <div className="space-y-2">
                <Label>Color Stock</Label>
                <div className="rounded-md border mt-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Màu sắc</TableHead>
                        <TableHead>Tên màu</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {product.colors.map((color) => (
                        <TableRow key={color.colorId}>
                          <TableCell>
                            <div
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: color.colorCode }}
                            ></div>
                          </TableCell>
                          <TableCell>{color.colorName}</TableCell>
                          
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Ảnh hiện tại</Label>
              {allImages.filter(img => img.type === 'existing').length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {allImages
                    .filter(img => img.type === 'existing')
                    .map((image, index) => (
                      <div key={index} className="relative group">
                        <div className={`rounded-md overflow-hidden border ${mainImageIndex === index ? "ring-2 ring-primary" : ""
                          }`}>
                          <img
                            src={`http://localhost:5000/${(image.data as { url: string }).url.replace(/\\/g, "/")}`}
                            alt={`Current product image ${index + 1}`}
                            className="w-40 h-40 object-cover"
                          />
                          {mainImageIndex === index && (
                            <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-md">
                              Ảnh chính
                            </div>
                          )}
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage((image.data as { id: number }).id)}
                          >
                            &times;
                          </Button>
                          {mainImageIndex !== index && (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setMainImage(index)}
                            >
                              Đặt làm ảnh chính
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Không có ảnh nào</p>
              )}
            </div>

            {/* New Images Section */}
            <div className="space-y-2">
              <Label htmlFor="images">Thêm ảnh mới</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("images")?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Tải lên ảnh
                </Button>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                />
                <span className="text-sm text-muted-foreground">
                  {allImages.filter(img => img.type === 'new').length} new {
                    allImages.filter(img => img.type === 'new').length === 1 ? "image" : "images"
                  }
                </span>
              </div>

              {allImages.filter(img => img.type === 'new').length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {allImages
                    .filter(img => img.type === 'new')
                    .map((image, index) => {
                      const globalIndex = allImages.findIndex(img => img === image);
                      return (
                        <div key={index} className="relative group">
                          <div className={`rounded-md overflow-hidden border ${mainImageIndex === globalIndex ? "ring-2 ring-primary" : ""
                            }`}>
                            <img
                              src={URL.createObjectURL(image.data as File)}
                              alt={`New product image ${index + 1}`}
                              className="w-40 h-40 object-cover"
                            />
                            {mainImageIndex === globalIndex && (
                              <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-md">
                                Ảnh chính
                              </div>
                            )}
                          </div>
                          <div className="absolute top-2 right-2 flex gap-1">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(globalIndex.toString())}
                            >
                              &times;
                            </Button>
                            {mainImageIndex !== globalIndex && (
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => setMainImage(globalIndex)}
                              >
                                Đặt làm ảnh chính
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cập nhật sản phẩm
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

