"use client"

import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut, User, Shield, Crown } from "lucide-react"
import Link from "next/link"

export function Navbar() {
  const { user, signOut } = useAuth()

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4" />
      case "admin":
        return <Shield className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-yellow-100 text-yellow-800"
      case "admin":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">TrustedP2P</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/commands">
              <Button variant="ghost" size="sm">
                📚 Commands
              </Button>
            </Link>

            {(user?.role === "admin" || user?.role === "owner") && (
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  🛡️ Admin Panel
                </Button>
              </Link>
            )}

            <div className="flex items-center space-x-2">
              <Badge className={getRoleColor(user?.role || "user")}>
                {getRoleIcon(user?.role || "user")}
                <span className="ml-1 capitalize">{user?.role}</span>
              </Badge>
              <span className="text-sm text-gray-700">{user?.name}</span>
            </div>

            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
