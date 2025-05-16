"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast, Bounce } from 'react-toastify'
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
import { HexColorPicker } from "react-colorful"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/AuthContext"

// Định nghĩa kiểu dữ liệu cho màu sắc
interface Color {
    id: number
    hexaValue: string
    name: string
}

// Định nghĩa kiểu dữ liệu cho response từ API
interface ColorResponse {
    status: number
    errorCode: number
    code: string
    data: Color[]
    des: string | null
}

export default function ColorsPage() {
    const [colors, setColors] = useState<Color[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const { token } = useAuth()
    const [newColor, setNewColor] = useState({ hexaValue: "#663399", name: "" })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    
    // Thêm state cho dialog xác nhận xóa
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedColorId, setSelectedColorId] = useState<number | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Lấy danh sách màu sắc từ API
    useEffect(() => {
        const fetchColors = async () => {
            // Kiểm tra token trước khi gọi API
            if (!token) {
                console.log("Token chưa có, không gọi API");
                return; // Thoát khỏi hàm nếu không có token
            }

            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch("http://localhost:5000/api/Color/Get-all-color-admin", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Kiểm tra trạng thái phản hồi
                if (!response.ok) {
                    throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
                }

                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("Phản hồi từ API không phải là JSON");
                }

                const data = await response.json();
                setColors(data.data);
            } catch (err) {
                console.error("Lỗi khi lấy dữ liệu colors:", err);
                setError(err instanceof Error ? err.message : "Không thể lấy dữ liệu colors");
                setColors([
                    { id: 1, hexaValue: "#FF0000", name: "Đỏ" },
                    { id: 3, hexaValue: "#0000FF", name: "Xanh" },
                    { id: 4, hexaValue: "#00FF00", name: "Xanh lục" },
                    { id: 5, hexaValue: "#800080", name: "Tím" },
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchColors();
    }, [token]); // Dependency array chứa token để useEffect chạy lại khi token thay đổi

    // Lọc màu sắc theo từ khóa tìm kiếm
    const filteredColors = colors.filter(
        (color) =>
            color.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            color.hexaValue.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Hàm mở dialog xác nhận xóa
    const openDeleteDialog = (id: number) => {
        setSelectedColorId(id);
        setIsDeleteDialogOpen(true);
    }

    // Xử lý xóa màu sắc
    const handleDelete = async () => {
        if (!selectedColorId) return;
        
        setIsDeleting(true);
        try {
            const response = await fetch(`http://localhost:5000/api/Color/DeleteColor?ColorId=${selectedColorId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const result = await response.json();

            if (result.status === 1) {
                // Xóa màu khỏi state local
                setColors(colors.filter((color) => color.id !== selectedColorId));
                toast.success('Xóa màu thành công', {
                    position: "top-right",
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    transition: Bounce,
                });
            } else {
                throw new Error(result.des || "Không thể xóa màu");
            }
        } catch (err) {
            console.error("Lỗi khi xóa màu:", err);
            toast.error('Lỗi khi xóa màu', {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
            });
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
            setSelectedColorId(null);
        }
    };

    // Xử lý thêm màu sắc mới
    const handleAddColor = async () => {
        if (!newColor.name.trim()) {
            toast.error('Vui lòng nhập tên màu', {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false, 
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Bounce
            })
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch("http://localhost:5000/api/Color/AddNewColor", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    colorHexaValue: newColor.hexaValue,
                    colorName: newColor.name,
                }),
            })

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`)
            }

            const result = await response.json()

            if (result.status === 1) {
                // Thêm màu mới vào danh sách với ID giả định (trong thực tế, ID sẽ được trả về từ API)
                const newId = Math.max(...colors.map((c) => c.id), 0) + 1
                const newColorItem: Color = {
                    id: newId,
                    hexaValue: newColor.hexaValue,
                    name: newColor.name,
                }

                setColors([...colors, newColorItem])

                // Reset form và đóng dialog
                setNewColor({ hexaValue: "#663399", name: "" })
                setIsDialogOpen(false)

                toast.success('Thêm màu thành công', {
                    position: "top-right",
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    transition: Bounce,
                })
            } else {
                throw new Error(result.des || "Failed to add color")
            }
        } catch (err) {
            console.error("Error adding color:", err)
            toast.error('Lỗi khi thêm màu', {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Quản lý màu sắc</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                           Thêm màu sắc
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Thêm màu sắc mới</DialogTitle>
                            <DialogDescription>Thêm màu sắc mới cho các sản phẩm</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="colorPicker">Chọn màu</Label>
                                <div className="flex justify-center py-2">
                                    <HexColorPicker
                                        color={newColor.hexaValue}
                                        onChange={(color) => setNewColor({ ...newColor, hexaValue: color })}
                                    />
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-10 h-10 rounded border" style={{ backgroundColor: newColor.hexaValue }}></div>
                                    <Input
                                        value={newColor.hexaValue}
                                        onChange={(e) => setNewColor({ ...newColor, hexaValue: e.target.value })}
                                        maxLength={7}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="colorName">Tên màu *</Label>
                                <Input
                                    id="colorName"
                                    value={newColor.name}
                                    onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Hủy
                            </Button>
                            <Button onClick={handleAddColor} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Thêm màu mới
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Màu sắc</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search colors..."
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
                                    <TableHead>Màu</TableHead>
                                    <TableHead>Tên màu</TableHead>
                                    <TableHead>Giá trị hexa</TableHead>
                                    <TableHead className="text-right">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            <div className="flex justify-center">
                                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                            </div>
                                            <p className="mt-2 text-sm text-muted-foreground">Đang tải danh sách màu sắc...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredColors.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">
                                            Không tìm thấy màu sắc nào
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredColors.map((color) => (
                                        <TableRow key={color.id}>
                                            <TableCell>{color.id}</TableCell>
                                            <TableCell>
                                                <div
                                                    className="w-8 h-8 rounded border"
                                                    style={{ backgroundColor: color.hexaValue }}
                                                    title={color.name}
                                                ></div>
                                            </TableCell>
                                            <TableCell className="font-medium">{color.name}</TableCell>
                                            <TableCell>{color.hexaValue}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                                    onClick={() => openDeleteDialog(color.id)}
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

            {/* Dialog xác nhận xóa màu */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa màu</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa màu này? Hành động này không thể hoàn tác.
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
                                'Xóa'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}