"use client"

import { AdminLogin } from "@/components/admin-login"
import { AdminPanel } from "@/components/admin-panel"
import { useAuth } from "@/lib/auth"
import { Loader2 } from "lucide-react"

export default function AdminPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Show admin login if not logged in or not admin/owner
  if (!user || (user.role !== "admin" && user.role !== "owner")) {
    return <AdminLogin />
  }

  // Show admin panel if user is admin/owner
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">TrustedP2P Admin Panel</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user.name}</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm capitalize">{user.role}</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminPanel />
      </main>
    </div>
  )
}
