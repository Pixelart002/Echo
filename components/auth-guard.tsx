"use client"

import type React from "react"

import { useAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, signIn } = useAuth()
  const [userId, setUserId] = useState("")
  const [name, setName] = useState("")
  const [isSigningIn, setIsSigningIn] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to TrustedP2P</CardTitle>
            <CardDescription>Enter your Telegram user ID and name to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">Telegram User ID</Label>
              <Input
                id="userId"
                type="number"
                placeholder="123456789"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <Button
              className="w-full"
              onClick={async () => {
                if (!userId || !name) return
                setIsSigningIn(true)
                try {
                  await signIn(Number.parseInt(userId), name)
                } catch (error) {
                  console.error("Sign in failed:", error)
                } finally {
                  setIsSigningIn(false)
                }
              }}
              disabled={!userId || !name || isSigningIn}
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (user.role === "banned") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Account Banned</CardTitle>
            <CardDescription>Your account has been banned. Please contact support for assistance.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
