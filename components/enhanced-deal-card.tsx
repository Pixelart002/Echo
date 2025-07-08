"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { Deal } from "@/lib/supabase"
import { ArrowUpDown, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, TrendingDown } from "lucide-react"
import { useState, useEffect } from "react"
import { getCryptoPrice } from "@/lib/crypto-api"

interface EnhancedDealCardProps {
  deal: Deal
  onAction?: (dealId: number, action: string) => void
  showActions?: boolean
  userRole?: string
  showPriceComparison?: boolean
}

export function EnhancedDealCard({
  deal,
  onAction,
  showActions = false,
  userRole,
  showPriceComparison = true,
}: EnhancedDealCardProps) {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [priceChange, setPriceChange] = useState<number>(0)

  useEffect(() => {
    if (showPriceComparison) {
      fetchCurrentPrice()
    }
  }, [deal.crypto, showPriceComparison])

  const fetchCurrentPrice = async () => {
    try {
      const price = await getCryptoPrice(deal.crypto)
      setCurrentPrice(price)

      if (price && deal.rate) {
        const change = ((price - deal.rate) / deal.rate) * 100
        setPriceChange(change)
      }
    } catch (error) {
      console.error("Error fetching current price:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-blue-100 text-blue-800"
      case "escrow_pending":
        return "bg-purple-100 text-purple-800"
      case "payment_pending":
        return "bg-orange-100 text-orange-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "disputed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      case "disputed":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <ArrowUpDown className="h-4 w-4" />
    }
  }

  const getProgressValue = (status: string) => {
    switch (status) {
      case "pending":
        return 20
      case "approved":
        return 40
      case "escrow_pending":
        return 60
      case "payment_pending":
        return 80
      case "completed":
        return 100
      case "cancelled":
        return 0
      case "disputed":
        return 50
      default:
        return 0
    }
  }

  const cryptoAmount = (deal.amount / deal.rate).toFixed(4)

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">{deal.type === "buy" ? "🟢" : "🔴"}</span>
            Deal #{deal.id}
          </CardTitle>
          <Badge className={getStatusColor(deal.status)}>
            {getStatusIcon(deal.status)}
            <span className="ml-1 capitalize">{deal.status.replace("_", " ")}</span>
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mt-2">
          <Progress value={getProgressValue(deal.status)} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Deal Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Type & Crypto:</span>
              <div className="font-bold text-lg">
                {deal.type.toUpperCase()} {deal.crypto}
              </div>
            </div>

            <div>
              <span className="text-sm text-gray-500">Amount:</span>
              <div className="font-bold text-xl text-green-600">₹{deal.amount.toLocaleString()}</div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Crypto Amount:</span>
              <div className="font-bold text-lg">
                {cryptoAmount} {deal.crypto}
              </div>
            </div>

            <div>
              <span className="text-sm text-gray-500">Your Rate:</span>
              <div className="font-bold">₹{deal.rate.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Price Comparison */}
        {showPriceComparison && currentPrice && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-500">Current Market Price:</span>
                <div className="font-medium">₹{currentPrice.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className={`flex items-center gap-1 ${priceChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {priceChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span className="font-medium">
                    {priceChange >= 0 ? "+" : ""}
                    {priceChange.toFixed(2)}%
                  </span>
                </div>
                <div className="text-xs text-gray-500">vs your rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Payment Method:</span>
            <div className="font-medium">{deal.payment_method}</div>
          </div>
          <div>
            <span className="text-gray-500">Platform Fee:</span>
            <div className="font-medium">₹{deal.fee}</div>
          </div>
        </div>

        {/* User Info */}
        {deal.user && (
          <div className="pt-2 border-t">
            <span className="text-gray-500 text-sm">Trader:</span>
            <div className="font-medium">
              {deal.user.name}
              <Badge variant="outline" className="ml-2">
                ID: {deal.user.id}
              </Badge>
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-gray-500">Created: {new Date(deal.created_at).toLocaleString()}</div>

        {/* Action Buttons */}
        {showActions && onAction && (userRole === "admin" || userRole === "owner") && (
          <div className="flex gap-2 pt-3 border-t">
            {deal.status === "pending" && (
              <>
                <Button
                  size="sm"
                  onClick={() => onAction(deal.id, "approve")}
                  className="bg-green-600 hover:bg-green-700 flex-1"
                >
                  ✅ Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onAction(deal.id, "reject")} className="flex-1">
                  ❌ Reject
                </Button>
              </>
            )}

            {deal.status === "approved" && (
              <Button
                size="sm"
                onClick={() => onAction(deal.id, "escrow")}
                className="bg-purple-600 hover:bg-purple-700 w-full"
              >
                🔒 Confirm Escrow
              </Button>
            )}

            {deal.status === "payment_pending" && (
              <Button
                size="sm"
                onClick={() => onAction(deal.id, "release")}
                className="bg-blue-600 hover:bg-blue-700 w-full"
              >
                💰 Release Funds
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
