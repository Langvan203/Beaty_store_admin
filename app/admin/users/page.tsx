"use client"

import { useState, useEffect } from "react"
import { Search, Trash2, Loader2, Shield, MoreVertical, UserCog, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast, Bounce } from 'react-toastify'
import { useAuth } from "@/hooks/AuthContext"

interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  avatar: string | null;
  dateOfBirth: string | null;
  gender: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Delete dialog states
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Set admin dialog states
  const [isSetAdminDialogOpen, setIsSetAdminDialogOpen] = useState(false)
  const [isSettingAdmin, setIsSettingAdmin] = useState(false)
  const [selectedUserForAdmin, setSelectedUserForAdmin] = useState<User | null>(null)

  const [isSetStaffDialogOpen, setIsSetStaffDialogOpen] = useState(false)
  const [isSettingStaff, setIsSettingStaff] = useState(false)
  const [selectedUserForStaff, setSelectedUserForStaff] = useState<User | null>(null)

  const [isSetCustomerDialogOpen, setIsSetCustomerDialogOpen] = useState(false)
  const [isSettingCustomer, setIsSettingCustomer] = useState(false)
  const [selectedUserForCustomer, setSelectedUserForCustomer] = useState<User | null>(null)

  const { token } = useAuth()

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [token])

  const openSetStaffDialog = (user: User) => {
    setSelectedUserForStaff(user)
    setIsSetStaffDialogOpen(true)
  }
  const openSetCustomerDialog = (user: User) => {
    setSelectedUserForCustomer(user)
    setIsSetCustomerDialogOpen(true)
  }
  const fetchUsers = async () => {
    if (!token) return

    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/User/GetAllUserAdmin", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const result = await response.json()

      if (result.status === 1 && Array.isArray(result.data)) {
        setUsers(result.data)
      } else {
        toast.error('Failed to load users')
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error('Error loading users')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm)
  )

  const openDeleteDialog = (id: number) => {
    setSelectedUserId(id)
    setIsDeleteDialogOpen(true)
  }

  const openSetAdminDialog = (user: User) => {
    setSelectedUserForAdmin(user)
    setIsSetAdminDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedUserId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`http://localhost:5000/api/User/DeleteUser/?UserID=${selectedUserId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (response.ok && result.status === 1) {
        // Update local state to remove deleted user
        setUsers(users.filter(user => user.id !== selectedUserId))

        toast.success('User deleted successfully', {
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
      } else {
        toast.error(result.des || 'Failed to delete user')
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error('Error deleting user')
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setSelectedUserId(null)
    }
  }

  const handleSetAdminRole = async () => {
    if (!selectedUserForAdmin) return

    setIsSettingAdmin(true)
    try {
      const response = await fetch(`http://localhost:5000/api/User/SetAdminRole?UserID=${selectedUserForAdmin.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (response.ok && result.status === 1) {
        // Update local state to reflect the role change
        setUsers(users.map(user =>
          user.id === selectedUserForAdmin.id
            ? { ...user, role: "Admin" }
            : user
        ))

        toast.success('User has been granted admin privileges', {
          position: "top-right",
          autoClose: 500,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce
        })
      } else {
        toast.error(result.des || 'Failed to set admin role')
      }
    } catch (error) {
      console.error("Error setting admin role:", error)
      toast.error('Error setting admin role')
    } finally {
      setIsSettingAdmin(false)
      setIsSetAdminDialogOpen(false)
      setSelectedUserForAdmin(null)
    }
  }

  const handleSetStaffRole = async () => {
    if (!selectedUserForStaff) return

    setIsSettingStaff(true)
    try {
      const response = await fetch(`http://localhost:5000/api/User/SetStaffRole?UserID=${selectedUserForStaff.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (response.ok && result.status === 1) {
        // Update local state to reflect the role change
        setUsers(users.map(user =>
          user.id === selectedUserForStaff.id
            ? { ...user, role: "Staff" }
            : user
        ))

        toast.success('User has been granted staff privileges', {
          position: "top-right",
          autoClose: 500,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce
        })
      } else {
        toast.error(result.des || 'Failed to set staff role')
      }
    } catch (error) {
      console.error("Error setting staff role:", error)
      toast.error('Error setting staff role')
    } finally {
      setIsSettingStaff(false)
      setIsSetStaffDialogOpen(false)
      setSelectedUserForStaff(null)
    }
  }

  const handleSetCustomerRole = async () => {
    if (!selectedUserForCustomer) return

    setIsSettingCustomer(true)
    try {
      const response = await fetch(`http://localhost:5000/api/User/SetCustomerRole?UserID=${selectedUserForCustomer.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (response.ok && result.status === 1) {
        // Update local state to reflect the role change
        setUsers(users.map(user =>
          user.id === selectedUserForCustomer.id
            ? { ...user, role: "Customer" }
            : user
        ))

        toast.success('User has been set to customer role', {
          position: "top-right",
          autoClose: 500,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce
        })
      } else {
        toast.error(result.des || 'Failed to set customer role')
      }
    } catch (error) {
      console.error("Error setting customer role:", error)
      toast.error('Error setting customer role')
    } finally {
      setIsSettingCustomer(false)
      setIsSetCustomerDialogOpen(false)
      setSelectedUserForCustomer(null)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Customer":
        return <Badge variant="outline">Khách hàng</Badge>
      case "Admin":
        return <Badge variant="default">Admin</Badge>
      case "Staff":
        return <Badge variant="secondary">Nhân viên</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getGenderText = (gender: number) => {
    switch (gender) {
      case 1:
        return "FeMale"
      case 2:
        return "male"
      default:
        return "Other"
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quản lý người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users by name, email, or phone..."
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
                  <TableHead>Username</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">SDT</TableHead>
                  <TableHead className="hidden lg:table-cell">Giới tính</TableHead>
                  <TableHead>Quyền hạn</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Không tìm thấy người dùng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{user.phone}</TableCell>
                      <TableCell className="hidden lg:table-cell">{getGenderText(user.gender)}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {user.role !== "Admin" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => openSetAdminDialog(user)}
                                  className="text-blue-600"
                                >
                                  <Shield className="mr-2 h-4 w-4" />
                                  Thêm quyền Admin
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            {user.role !== "Staff" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => openSetStaffDialog(user)}
                                  className="text-green-600"
                                >
                                  <UserCog className="mr-2 h-4 w-4" />
                                  Thêm quyền Nhân viên
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            {user.role !== "Customer" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => openSetCustomerDialog(user)}
                                  className="text-orange-600"
                                >
                                  <User className="mr-2 h-4 w-4" />
                                  Đặt làm Khách hàng
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}

                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(user.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa người dùng
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
            <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
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

      {/* Set Admin Role Confirmation Dialog */}
      <AlertDialog open={isSetAdminDialogOpen} onOpenChange={setIsSetAdminDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Đặt làm admin</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có muốn {selectedUserForAdmin?.username} trở thành admin?
              Admin có quyền quản lý tất cả người dùng và sản phẩm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSettingAdmin}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleSetAdminRole()
              }}
              disabled={isSettingAdmin}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSettingAdmin ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Grant Admin Rights'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Set Customer Role Confirmation Dialog */}
      <AlertDialog open={isSetCustomerDialogOpen} onOpenChange={setIsSetCustomerDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Đặt làm khách hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có muốn đổi quyền của {selectedUserForCustomer?.username} thành khách hàng?
              Khách hàng chỉ có quyền mua hàng và không thể truy cập trang quản trị.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSettingCustomer}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleSetCustomerRole()
              }}
              disabled={isSettingCustomer}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSettingCustomer ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Set as Customer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={isSetStaffDialogOpen} onOpenChange={setIsSetStaffDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Đặt làm nhân viên</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có muốn {selectedUserForStaff?.username} trở thành nhân viên?
              Nhân viên có quyền quản lý đơn hàng và sản phẩm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSettingStaff}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleSetStaffRole()
              }}
              disabled={isSettingStaff}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSettingStaff ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Grant Staff Rights'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}