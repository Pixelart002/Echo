"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Crown, Shield, UserPlus } from "lucide-react"

export function MakeAdmin() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [userId, setUserId] = useState("")
  const [loading, setLoading] = useState(false)

  // Auto-make current user admin if they're the first user
  const makeCurrentUserAdmin = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Check if there are any admins or owners
      const { data: admins } = await supabase.from("users").select("id").in("role", ["admin", "owner"])

      if (!admins || admins.length === 0) {
        // Make current user owner if no admins exist
        await supabase.from("users").update({ role: "owner" }).eq("id", user.id)

        toast({
          title: "Success! 👑",
          description: "You are now the platform owner with full access!",
        })

        // Refresh the page to update user role
        window.location.reload()
      } else {
        toast({
          title: "Access Denied",
          description: "Platform already has administrators.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const makeUserAdmin = async () => {
    if (!user || user.role !== "owner" || !userId) return

    setLoading(true)
    try {
      const targetUserId = Number.parseInt(userId)

      // Check if user exists
      const { data: targetUser } = await supabase.from("users").select("*").eq("id", targetUserId).single()

      if (!targetUser) {
        toast({
          title: "User Not Found",
          description: "No user found with that ID",
          variant: "destructive",
        })
        return
      }

      // Update user role to admin
      await supabase.from("users").update({ role: "admin" }).eq("id", targetUserId)

      toast({
        title: "Success! 🛡️",
        description: `${targetUser.name} is now an admin!`,
      })

      setUserId("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to make user admin",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Auto-admin for first user */}
      {user && user.role === "user" && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Crown className="h-5 w-5" />
              Become Platform Owner
            </CardTitle>
            <CardDescription className="text-yellow-700">
              If you're the first user, click below to become the platform owner with full administrative access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={makeCurrentUserAdmin} disabled={loading} className="bg-yellow-600 hover:bg-yellow-700">
              <Crown className="h-4 w-4 mr-2" />
              {loading ? "Checking..." : "Make Me Owner"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Make other users admin (owner only) */}
      {user && user.role === "owner" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Make User Admin
            </CardTitle>
            <CardDescription>Grant admin privileges to other users by entering their Telegram User ID.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminUserId">User ID</Label>
              <Input
                id="adminUserId"
                type="number"
                placeholder="123456789"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
            <Button onClick={makeUserAdmin} disabled={!userId || loading} className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              {loading ? "Processing..." : "Make Admin"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Current role display */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Your Current Role:</span>
            <div className="flex items-center gap-2">
              {user?.role === "owner" && <Crown className="h-4 w-4 text-yellow-600" />}
              {user?.role === "admin" && <Shield className="h-4 w-4 text-blue-600" />}
              <span className="font-medium capitalize">{user?.role}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
