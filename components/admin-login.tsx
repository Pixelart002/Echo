"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Shield, Crown, Key, UserCheck } from "lucide-react"

export function AdminLogin() {
  const { user, signIn } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [adminId, setAdminId] = useState("")
  const [adminName, setAdminName] = useState("")

  const loginAsAdmin = async () => {
    if (!adminId || !adminName) {
      toast({
        title: "Missing Information",
        description: "Please enter both Admin ID and Name",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const userId = Number.parseInt(adminId)

      // Check if user exists and has admin/owner role
      const { data: adminUser } = await supabase.from("users").select("*").eq("id", userId).single()

      if (!adminUser) {
        toast({
          title: "User Not Found",
          description: "No user found with that ID",
          variant: "destructive",
        })
        return
      }

      if (adminUser.role !== "admin" && adminUser.role !== "owner") {
        toast({
          title: "Access Denied",
          description: "User does not have admin privileges",
          variant: "destructive",
        })
        return
      }

      // Sign in as admin
      await signIn(userId, adminName)

      toast({
        title: "Admin Login Successful! 🛡️",
        description: `Welcome ${adminUser.role}, ${adminName}!`,
      })
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Failed to login as admin",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const makeOwner = async (userId: number) => {
    setLoading(true)
    try {
      // Check if there are any owners
      const { data: owners } = await supabase.from("users").select("id").eq("role", "owner")

      if (owners && owners.length > 0) {
        toast({
          title: "Owner Exists",
          description: "Platform already has an owner",
          variant: "destructive",
        })
        return
      }

      // Check if user exists
      const { data: existingUser } = await supabase.from("users").select("*").eq("id", userId).single()

      if (!existingUser) {
        // Create user if doesn't exist
        await supabase.from("users").insert([{ id: userId, name: `User_${userId}`, role: "owner" }])
      } else {
        // Update existing user to owner
        await supabase.from("users").update({ role: "owner" }).eq("id", userId)
      }

      toast({
        title: "Success! 👑",
        description: `User ${userId} is now the platform owner!`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to make user owner",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        {/* Quick Fix for User 6926658281 */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Crown className="h-5 w-5" />
              Quick Fix - Make Owner
            </CardTitle>
            <CardDescription className="text-red-700">Emergency fix for user 6926658281</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => makeOwner(6926658281)}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <Crown className="h-4 w-4 mr-2" />
              Make 6926658281 Owner
            </Button>
          </CardContent>
        </Card>

        {/* Admin Login */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Login
            </CardTitle>
            <CardDescription>Login with your admin credentials to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminId">Admin User ID</Label>
              <Input
                id="adminId"
                type="number"
                placeholder="123456789"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminName">Admin Name</Label>
              <Input
                id="adminName"
                placeholder="Admin Name"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
              />
            </div>

            <Button onClick={loginAsAdmin} disabled={loading || !adminId || !adminName} className="w-full">
              <Key className="h-4 w-4 mr-2" />
              {loading ? "Logging in..." : "Login as Admin"}
            </Button>
          </CardContent>
        </Card>

        {/* Regular User Login */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Regular User Access
            </CardTitle>
            <CardDescription>Continue as regular user to create and manage deals</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = "/")} variant="outline" className="w-full">
              Continue as User
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
