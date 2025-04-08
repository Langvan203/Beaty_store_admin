"use client"

import { useState, useEffect } from "react"
import { Search, Trash2, Loader2, Shield, MoreVertical } from "lucide-react"
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
  
  const { token } = useAuth()

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [token])

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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Customer":
        return <Badge variant="outline">Customer</Badge>
      case "Admin":
        return <Badge variant="default">Admin</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getGenderText = (gender: number) => {
    switch (gender) {
      case 1:
        return "Male"
      case 2:
        return "Female"
      default:
        return "Other"
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
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
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden lg:table-cell">Gender</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                      No users found
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
                                  Set as Admin
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(user.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account and remove
              their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
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
                  Deleting...
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
            <AlertDialogTitle>Grant Admin Rights</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to make {selectedUserForAdmin?.username} an admin? 
              Admins have full access to the dashboard and all management features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSettingAdmin}>Cancel</AlertDialogCancel>
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
                  Processing...
                </>
              ) : (
                'Grant Admin Rights'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}