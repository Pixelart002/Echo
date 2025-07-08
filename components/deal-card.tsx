"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Deal } from "@/lib/supabase"
import { ArrowUpDown, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface DealCardProps {
  deal: Deal
  onAction?: (dealId: number, action: string) => void
  showActions?: boolean
  userRole?: string
}

export function DealCard({ deal, onAction, showActions = false, userRole }: DealCardProps) {
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

  const cryptoAmount = (deal.amount / deal.rate).toFixed(2)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Deal #{deal.id}</CardTitle>
          <Badge className={getStatusColor(deal.status)}>
            {getStatusIcon(deal.status)}
            <span className="ml-1 capitalize">{deal.status.replace("_", " ")}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Type:</span>
            <div className="font-medium capitalize flex items-center">
              {deal.type === "buy" ? "🟢" : "🔴"} {deal.type} {deal.crypto}
            </div>
          </div>

          <div>
            <span className="text-gray-500">Amount:</span>
            <div className="font-medium">₹{deal.amount.toLocaleString()}</div>
          </div>

          <div>
            <span className="text-gray-500">Crypto:</span>
            <div className="font-medium">
              {cryptoAmount} {deal.crypto}
            </div>
          </div>

          <div>
            <span className="text-gray-500">Rate:</span>
            <div className="font-medium">₹{deal.rate}</div>
          </div>

          <div>
            <span className="text-gray-500">Payment:</span>
            <div className="font-medium">{deal.payment_method}</div>
          </div>

          <div>
            <span className="text-gray-500">Fee:</span>
            <div className="font-medium">₹{deal.fee}</div>
          </div>
        </div>

        {deal.user && (
          <div className="pt-2 border-t">
            <span className="text-gray-500 text-sm">User:</span>
            <div className="font-medium">
              {deal.user.name} (ID: {deal.user.id})
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500">Created: {new Date(deal.created_at).toLocaleString()}</div>

        {showActions && onAction && (userRole === "admin" || userRole === "owner") && (
          <div className="flex gap-2 pt-3 border-t">
            {deal.status === "pending" && (
              <>
                <Button
                  size="sm"
                  onClick={() => onAction(deal.id, "approve")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onAction(deal.id, "reject")}>
                  Reject
                </Button>
              </>
            )}

            {deal.status === "approved" && (
              <Button
                size="sm"
                onClick={() => onAction(deal.id, "escrow")}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Confirm Escrow
              </Button>
            )}

            {deal.status === "payment_pending" && (
              <Button size="sm" onClick={() => onAction(deal.id, "release")} className="bg-blue-600 hover:bg-blue-700">
                Release Funds
              </Button>
            )}

            {["pending", "approved", "escrow_pending"].includes(deal.status) && (
              <Button size="sm" variant="outline" onClick={() => onAction(deal.id, "cancel")}>
                Cancel
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
