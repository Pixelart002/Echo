"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { CreateDealForm } from "@/components/create-deal-form"
import { DealCard } from "@/components/deal-card"
import { AdminPanel } from "@/components/admin-panel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { getDeals, type Deal } from "@/lib/deals"
import { PlusCircle, TrendingUp, Clock, CheckCircle, Shield } from "lucide-react"
import { CryptoPrices } from "@/components/crypto-prices"

export default function HomePage() {
  const { user } = useAuth()
  const [deals, setDeals] = useState<Deal[]>([])
  const [userDeals, setUserDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState("dashboard")

  useEffect(() => {
    loadDeals()
  }, [user])

  const loadDeals = async () => {
    if (!user) return

    try {
      const [allDeals, myDeals] = await Promise.all([getDeals(), getDeals({ user_id: user.id })])

      setDeals(allDeals)
      setUserDeals(myDeals)
    } catch (error) {
      console.error("Error loading deals:", error)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    totalDeals: userDeals.length,
    pendingDeals: userDeals.filter((d) => d.status === "pending").length,
    activeDeals: userDeals.filter((d) => ["approved", "escrow_pending", "payment_pending"].includes(d.status)).length,
    completedDeals: userDeals.filter((d) => d.status === "completed").length,
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
            <p className="text-gray-600 mt-2">Manage your crypto trades securely with escrow protection</p>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="create">Create Deal</TabsTrigger>
              <TabsTrigger value="deals">My Deals</TabsTrigger>
              {(user?.role === "admin" || user?.role === "owner") && (
                <TabsTrigger value="admin">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="text-2xl font-bold">{stats.totalDeals}</div>
                        <div className="text-sm text-gray-500">Total Deals</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <div>
                        <div className="text-2xl font-bold">{stats.pendingDeals}</div>
                        <div className="text-sm text-gray-500">Pending</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <PlusCircle className="h-5 w-5 text-orange-600" />
                      <div>
                        <div className="text-2xl font-bold">{stats.activeDeals}</div>
                        <div className="text-sm text-gray-500">Active</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="text-2xl font-bold">{stats.completedDeals}</div>
                        <div className="text-sm text-gray-500">Completed</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Live Crypto Prices */}
              <div className="grid md:grid-cols-2 gap-6">
                <CryptoPrices />

                {/* Recent Deals */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Market Activity</CardTitle>
                    <CardDescription>Latest deals from all users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {deals.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">No deals available</div>
                    ) : (
                      <div className="grid gap-4">
                        {deals.slice(0, 3).map((deal) => (
                          <DealCard key={deal.id} deal={deal} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Button onClick={() => setSelectedTab("create")} className="flex-1">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create New Deal
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedTab("deals")} className="flex-1">
                      View My Deals
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="create">
              <CreateDealForm onDealCreated={loadDeals} />
            </TabsContent>

            <TabsContent value="deals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Deals</CardTitle>
                  <CardDescription>All your trading activity</CardDescription>
                </CardHeader>
                <CardContent>
                  {userDeals.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <PlusCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <div className="text-lg font-medium mb-2">No deals yet</div>
                      <div className="text-sm mb-4">Create your first deal to get started</div>
                      <Button onClick={() => setSelectedTab("create")}>Create Deal</Button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {userDeals.map((deal) => (
                        <DealCard key={deal.id} deal={deal} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {(user?.role === "admin" || user?.role === "owner") && (
              <TabsContent value="admin">
                <AdminPanel />
              </TabsContent>
            )}
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  )
}
