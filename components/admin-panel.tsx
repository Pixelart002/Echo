"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth"
import { getDeals, updateDealStatus } from "@/lib/deals"
import { supabase, type Deal, type User, type Config } from "@/lib/supabase"
import { DealCard } from "./deal-card"
import { useToast } from "@/hooks/use-toast"
import { Shield, Crown, Users, Settings, TrendingUp } from "lucide-react"
import { AdminActions } from "./admin-actions"
import { CryptoPrices } from "./crypto-prices"
import { MakeAdmin } from "./make-admin"

export function AdminPanel() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [deals, setDeals] = useState<Deal[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [configs, setConfigs] = useState<Config[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState("deals")

  // Fee configuration state
  const [feeConfig, setFeeConfig] = useState({
    fee_type: "percentage",
    fee_value: "1.5",
    fee_payer: "seller",
    min_fee: "50",
    max_fee: "500",
  })

  // User management state
  const [newAdminId, setNewAdminId] = useState("")
  const [banUserId, setBanUserId] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [dealsData, usersData, configsData] = await Promise.all([
        getDeals(),
        supabase.from("users").select("*").order("id"),
        supabase.from("config").select("*"),
      ])

      setDeals(dealsData)
      setUsers(usersData.data || [])
      setConfigs(configsData.data || [])

      // Set fee config from database
      const configMap = (configsData.data || []).reduce(
        (acc, config) => {
          acc[config.key] = config.value
          return acc
        },
        {} as Record<string, string>,
      )

      setFeeConfig({
        fee_type: configMap.fee_type || "percentage",
        fee_value: configMap.fee_value || "1.5",
        fee_payer: configMap.fee_payer || "seller",
        min_fee: configMap.min_fee || "50",
        max_fee: configMap.max_fee || "500",
      })
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDealAction = async (dealId: number, action: string) => {
    if (!user) return

    try {
      let newStatus = ""
      let actionText = ""

      switch (action) {
        case "approve":
          newStatus = "approved"
          actionText = "Deal approved"
          break
        case "reject":
          newStatus = "cancelled"
          actionText = "Deal rejected"
          break
        case "escrow":
          newStatus = "payment_pending"
          actionText = "Escrow confirmed"
          break
        case "release":
          newStatus = "completed"
          actionText = "Funds released"
          break
        case "cancel":
          newStatus = "cancelled"
          actionText = "Deal cancelled"
          break
      }

      await updateDealStatus(dealId, newStatus, user.id, user.role)

      toast({
        title: "Success",
        description: actionText,
      })

      loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Action failed",
        variant: "destructive",
      })
    }
  }

  const updateFeeConfig = async () => {
    if (user?.role !== "owner") return

    try {
      const updates = Object.entries(feeConfig).map(([key, value]) => ({
        key,
        value: value.toString(),
      }))

      for (const update of updates) {
        await supabase.from("config").upsert(update, { onConflict: "key" })
      }

      toast({
        title: "Success",
        description: "Fee configuration updated",
      })

      loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update configuration",
        variant: "destructive",
      })
    }
  }

  const updateUserRole = async (userId: number, newRole: string) => {
    if (user?.role !== "owner") return

    try {
      await supabase.from("users").update({ role: newRole }).eq("id", userId)

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      })

      loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      })
    }
  }

  if (!user || (user.role !== "admin" && user.role !== "owner")) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Access denied. Admin privileges required.</div>
        </CardContent>
      </Card>
    )
  }

  const pendingDeals = deals.filter((deal) => deal.status === "pending")
  const activeDeals = deals.filter((deal) => ["approved", "escrow_pending", "payment_pending"].includes(deal.status))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{deals.length}</div>
                <div className="text-sm text-gray-500">Total Deals</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{pendingDeals.length}</div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{activeDeals.length}</div>
                <div className="text-sm text-gray-500">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{users.length}</div>
                <div className="text-sm text-gray-500">Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
          {user.role === "owner" && <TabsTrigger value="config">Config</TabsTrigger>}
          <TabsTrigger value="admin-setup">Admin</TabsTrigger>
        </TabsList>

        <TabsContent value="deals" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Pending Deals ({pendingDeals.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingDeals.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">No pending deals</div>
                ) : (
                  <div className="grid gap-6">
                    {pendingDeals.map((deal) => (
                      <div key={deal.id} className="grid md:grid-cols-2 gap-4">
                        <DealCard deal={deal} showActions={false} userRole={user.role} />
                        <AdminActions deal={deal} onActionComplete={loadData} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Deals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {deals.map((deal) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      onAction={handleDealAction}
                      showActions={true}
                      userRole={user.role}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user roles and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-sm text-gray-500">ID: {u.id}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          u.role === "owner"
                            ? "bg-yellow-100 text-yellow-800"
                            : u.role === "admin"
                              ? "bg-blue-100 text-blue-800"
                              : u.role === "banned"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }
                      >
                        {u.role}
                      </Badge>
                      {user.role === "owner" && u.id !== user.id && (
                        <div className="flex gap-1">
                          {u.role !== "admin" && (
                            <Button size="sm" variant="outline" onClick={() => updateUserRole(u.id, "admin")}>
                              Make Admin
                            </Button>
                          )}
                          {u.role !== "banned" && (
                            <Button size="sm" variant="destructive" onClick={() => updateUserRole(u.id, "banned")}>
                              Ban
                            </Button>
                          )}
                          {u.role === "banned" && (
                            <Button size="sm" variant="outline" onClick={() => updateUserRole(u.id, "user")}>
                              Unban
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crypto" className="space-y-4">
          <CryptoPrices />
        </TabsContent>

        {user.role === "owner" && (
          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Fee Configuration
                </CardTitle>
                <CardDescription>Configure platform fees and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fee Type</Label>
                    <Select
                      value={feeConfig.fee_type}
                      onValueChange={(value) => setFeeConfig((prev) => ({ ...prev, fee_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Fee Value</Label>
                    <Input
                      type="number"
                      value={feeConfig.fee_value}
                      onChange={(e) => setFeeConfig((prev) => ({ ...prev, fee_value: e.target.value }))}
                      placeholder={feeConfig.fee_type === "fixed" ? "50" : "1.5"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Fee Payer</Label>
                    <Select
                      value={feeConfig.fee_payer}
                      onValueChange={(value) => setFeeConfig((prev) => ({ ...prev, fee_payer: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seller">Seller</SelectItem>
                        <SelectItem value="buyer">Buyer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Minimum Fee (₹)</Label>
                    <Input
                      type="number"
                      value={feeConfig.min_fee}
                      onChange={(e) => setFeeConfig((prev) => ({ ...prev, min_fee: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Maximum Fee (₹)</Label>
                    <Input
                      type="number"
                      value={feeConfig.max_fee}
                      onChange={(e) => setFeeConfig((prev) => ({ ...prev, max_fee: e.target.value }))}
                    />
                  </div>
                </div>

                <Button onClick={updateFeeConfig} className="w-full">
                  Update Fee Configuration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="admin-setup" className="space-y-4">
          <MakeAdmin />
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>Recent platform activity and deal logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">Activity logs feature coming soon...</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
