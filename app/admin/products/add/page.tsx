"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload } from "lucide-react"
import { useBrand } from "@/hooks/BrandContext"
import { useCategory } from "@/hooks/CategoryContext"
import { useVariant } from "@/hooks/VariantContext"
import { useAuth } from "@/hooks/AuthContext"
import { Bounce, ToastContainer, toast } from 'react-toastify';
import { useProduct } from "@/hooks/ProductContext"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// Mock data - replace with actual API calls
interface ProductVariant {
  variantId: number
  size: string
  price: number
  stock: number
}
interface Color {
  id: number
  hexaValue: string
  name: string
}

// Thêm interface cho ProductColor
interface ProductColor {
  colorId: number
  colorName: string
  colorCode: string
}

export default function AddProductPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [colors, setColors] = useState<Color[]>([])
  const [product, setProduct] = useState({
    name: "",
    productDescription: "",
    price: "",
    discount: "0",
    categoryId: "",
    brandId: "",
    ingredient: "",
    userManual: "",
    variants: [] as ProductVariant[],
    colors: [] as ProductColor[],
    images: [] as File[],
    mainImageIndex: -1, // -1 nghĩa là không có ảnh chính được chọn
  })

  const { brand } = useBrand();
  const { Category } = useCategory();
  const { Variant } = useVariant();
  const { token } = useAuth();
  const { refreshProduct } = useProduct();
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProduct({ ...product, [name]: value })
  }
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedVariants, setSelectedVariants] = useState<string[]>([])
  useEffect(() => {
    if (product.variants.length > 0) {
      setSelectedVariants(product.variants.map(v => v.variantId.toString()));
    }
  }, [product.variants]);
  useEffect(() => {
    if (product.colors.length > 0) {
      setSelectedColors(product.colors.map(c => c.colorId.toString()));
    }
  }, [product.colors]);
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

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("API response is not JSON");
        }

        const data = await response.json();
        if (data.status === 1) {
          setColors(data.data);
        }
      } catch (error) {
        console.error("Error fetching colors:", error);
      }
    };

    fetchColors();
  }, [token]);

  const handleColorChange = (color: string) => {
    let updatedSelectedColors = [...selectedColors];

    if (updatedSelectedColors.includes(color)) {
      // Nếu đã chọn, bỏ chọn màu
      updatedSelectedColors = updatedSelectedColors.filter((c) => c !== color);

      // Xóa màu khỏi danh sách colors
      const updatedColors = product.colors.filter((c) => c.colorId !== Number(color));
      setProduct({ ...product, colors: updatedColors });
    } else {
      // Nếu chưa chọn, thêm màu vào danh sách
      updatedSelectedColors.push(color);

      // Tìm thông tin màu từ danh sách
      const selectedColor = colors.find((c) => c.id.toString() === color);

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
    const updatedColors = product.colors.map((color) => {
      if (color.colorId === Number(colorId)) {
        return { ...color, stock: Number(value) };
      }
      return color;
    });

    setProduct({ ...product, colors: updatedColors });
  };
  const handleSelectChange = (name: string, value: string) => {
    setProduct({ ...product, [name]: value })
  }
  console.log(product);
  const handleVariantChange = (variant: string) => {
    let updatedSelectedVariants = [...selectedVariants];

    if (updatedSelectedVariants.includes(variant)) {
      // Nếu đã chọn, bỏ chọn biến thể
      updatedSelectedVariants = updatedSelectedVariants.filter((v) => v !== variant);

      // Xóa biến thể khỏi danh sách variants
      const updatedVariants = product.variants.filter((v) => v.variantId !== Number(variant));
      setProduct({ ...product, variants: updatedVariants });
    } else {
      // Nếu chưa chọn, thêm biến thể vào danh sách
      updatedSelectedVariants.push(variant);

      // Lấy thông tin kích thước từ Variant
      const variantSize = Variant?.find((v) => v.id.toString() === variant)?.name || "0";

      // Thêm biến thể mới với giá và tồn kho mặc định
      const newVariant: ProductVariant = {
        variantId: Number(variant),
        size: String(variantSize),
        price: 0, // Replace 0 with the desired default price or a valid expression
        stock: 0,
      };

      setProduct({
        ...product,
        variants: [...product.variants, newVariant],
      });
    }

    setSelectedVariants(updatedSelectedVariants);
  };

  const handleVariantDetailChange = (variantId: string, field: "price" | "stock", value: string) => {
    const updatedVariants = product.variants.map((variant) => {
      if (variant.variantId === Number(variantId)) {
        return { ...variant, [field]: Number(value) };
      }
      return variant;
    });

    setProduct({ ...product, variants: updatedVariants });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files)
      const newImages = [...product.images, ...fileArray]

      // Nếu đây là lần đầu tiên thêm ảnh, đặt ảnh đầu tiên làm ảnh chính
      const mainImageIndex = product.mainImageIndex === -1 && newImages.length > 0 ? 0 : product.mainImageIndex

      setProduct({
        ...product,
        images: newImages,
        mainImageIndex: mainImageIndex,
      })
    }
  }

  // Thêm hàm để xử lý việc đặt ảnh chính
  const setMainImage = (index: number) => {
    setProduct({
      ...product,
      mainImageIndex: index,
    })
    console.log(index);
  }

  const removeImage = (index: number) => {
    const updatedImages = [...product.images]
    updatedImages.splice(index, 1)

    // Cập nhật mainImageIndex nếu cần
    let newMainIndex = product.mainImageIndex

    // Nếu xóa ảnh chính
    if (index === product.mainImageIndex) {
      newMainIndex = updatedImages.length > 0 ? 0 : -1 // Đặt ảnh đầu tiên làm ảnh chính hoặc -1 nếu không còn ảnh nào
    }
    // Nếu xóa ảnh trước ảnh chính, cần giảm index của ảnh chính
    else if (index < product.mainImageIndex) {
      newMainIndex = product.mainImageIndex - 1
    }

    setProduct({
      ...product,
      images: updatedImages,
      mainImageIndex: newMainIndex,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formdata = new FormData()
      formdata.append("productName", product.name)
      formdata.append("productDescription", product.productDescription)
      formdata.append("productPrice", product.price)
      formdata.append("productDiscount", product.discount)
      formdata.append("categoryID", product.categoryId)
      formdata.append("brandID", product.brandId)
      formdata.append("productIngredient", product.ingredient)
      formdata.append("productUserManual", product.userManual)
      formdata.append("mainImageIndex", product.mainImageIndex.toString())


      product.images.forEach((file) => {
        formdata.append("files", file);
      });
      const variantsJson = JSON.stringify(
        product.variants.map((v) => ({
          VariantID: v.variantId,
          VariantPrice: v.price,
          VariantStock: v.stock,
        }))
      );
      formdata.append("variantTypesJson", variantsJson);
      const colorsJson = JSON.stringify(
        product.colors.map((c) => ({
          ColorID: c.colorId,
        }))
      );
      formdata.append("colorJson", colorsJson);
      if (token) {
        await fetch("http://localhost:5000/api/Product/Create-product-images", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formdata,
        }).then((res) => res.json()).then((res) => {
          if (res.status === 1) {
            toast.success('Thêm sản phẩm thành công', {
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
                refreshProduct();
                router.push("/admin/products")
              }
            });
          }
          else {
            toast.warning('Có lỗi khi thêm sản phẩm!', {
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
                router.push("/admin/products/add")
              }
            });
          }
        }
        )
      }
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // Redirect to products page after successful submission
      router.push("/admin/products")
    } catch (error) {
      console.error("Error adding product:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Thêm sản phẩm mới</h1>
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
                <Label htmlFor="discount">Tỷ lệ giảm giá (%)</Label>
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
              <Label htmlFor="productDescription">Mô tả</Label>
              <Textarea
                id="productDescription"
                name="productDescription"
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
              <Label htmlFor="userManual">Hướng dẫn sử dụng</Label>
              <Textarea
                id="userManual"
                name="userManual"
                rows={3}
                value={product.userManual}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Lựa chọn kích thước</Label>
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
                        <TableHead>Giá *</TableHead>
                        <TableHead>Số lượng *</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {product.variants.map((variant) => (
                        <TableRow key={variant.variantId}>
                          <TableCell>{variant.size}</TableCell>
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
              <Label>Chọn màu sắc</Label>
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
                <Label>Số lượng theo màu sắc</Label>
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
              <Label htmlFor="images">Hình ảnh sản phẩm</Label>
              <div className="flex items-center gap-4">
                <Button type="button" variant="outline" onClick={() => document.getElementById("images")?.click()}>
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
                  {product.images.length} {product.images.length === 1 ? "file" : "files"} Đã chọn
                </span>
              </div>
              {product.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {product.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div
                        className={`aspect-square rounded-md overflow-hidden border ${product.mainImageIndex === index ? "ring-2 ring-primary" : ""}`}
                      >
                        <img
                          src={URL.createObjectURL(image) || "/placeholder.svg"}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {product.mainImageIndex === index && (
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
                          onClick={() => removeImage(index)}
                        >
                          &times;
                        </Button>
                        {product.mainImageIndex !== index && (
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
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu sản phẩm
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

