import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Login to access the admin dashboard",
}

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

