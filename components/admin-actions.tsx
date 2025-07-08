"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth"
import { updateDealStatus } from "@/lib/deals"
import { supabase, type Deal } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, AlertTriangle, Eye, MessageSquare } from "lucide-react"

interface AdminActionsProps {
  deal: Deal
  onActionComplete: () => void
}

export function AdminActions({ deal, onActionComplete }: AdminActionsProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState("")
  const [actionType, setActionType] = useState<string>("")
  const [showDialog, setShowDialog] = useState(false)

  if (!user || (user.role !== "admin" && user.role !== "owner")) {
    return null
  }

  const handleAction = async (action: string, requiresReason = false) => {
    if (requiresReason) {
      setActionType(action)
      setShowDialog(true)
      return
    }

    await executeAction(action, "")
  }

  const executeAction = async (action: string, actionReason: string) => {
    setLoading(true)
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
        case "escrow_confirm":
          newStatus = "payment_pending"
          actionText = "Escrow confirmed - waiting for payment"
          break
        case "payment_received":
          newStatus = "completed"
          actionText = "Payment confirmed - crypto released"
          break
        case "dispute":
          newStatus = "disputed"
          actionText = "Deal marked as disputed"
          break
        case "cancel":
          newStatus = "cancelled"
          actionText = "Deal cancelled"
          break
      }

      // Update deal status
      await updateDealStatus(deal.id, newStatus, user.id, user.role)

      // Log admin action with reason
      await supabase.from("deal_logs").insert([
        {
          deal_id: deal.id,
          actor_id: user.id,
          actor_role: user.role,
          action: `${actionText}${actionReason ? ` - Reason: ${actionReason}` : ""}`,
        },
      ])

      toast({
        title: "Action Completed",
        description: actionText,
      })

      setShowDialog(false)
      setReason("")
      onActionComplete()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Action failed",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getAvailableActions = () => {
    const actions = []

    switch (deal.status) {
      case "pending":
        actions.push(
          { key: "approve", label: "✅ Approve Deal", variant: "default", icon: CheckCircle },
          { key: "reject", label: "❌ Reject Deal", variant: "destructive", icon: XCircle, requiresReason: true },
        )
        break

      case "approved":
        actions.push(
          { key: "escrow_confirm", label: "🔒 Confirm Escrow", variant: "default", icon: CheckCircle },
          { key: "cancel", label: "❌ Cancel Deal", variant: "destructive", icon: XCircle, requiresReason: true },
        )
        break

      case "payment_pending":
        actions.push(
          { key: "payment_received", label: "💰 Confirm Payment & Release", variant: "default", icon: CheckCircle },
          {
            key: "dispute",
            label: "⚠️ Mark as Disputed",
            variant: "destructive",
            icon: AlertTriangle,
            requiresReason: true,
          },
        )
        break

      case "disputed":
        actions.push(
          { key: "payment_received", label: "✅ Resolve & Complete", variant: "default", icon: CheckCircle },
          { key: "cancel", label: "❌ Cancel Deal", variant: "destructive", icon: XCircle, requiresReason: true },
        )
        break
    }

    return actions
  }

  const actions = getAvailableActions()

  if (actions.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-gray-500">
            <Badge className="bg-green-100 text-green-800">
              {deal.status === "completed" ? "✅ Completed" : "ℹ️ No actions available"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Admin Actions - Deal #{deal.id}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2">
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.key}
                  variant={action.variant as any}
                  onClick={() => handleAction(action.key, action.requiresReason)}
                  disabled={loading}
                  className="justify-start"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {action.label}
                </Button>
              )
            })}
          </div>

          <div className="pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // View deal details logic
                toast({
                  title: "Deal Details",
                  description: `Deal #${deal.id} - ${deal.type} ${deal.crypto} for ₹${deal.amount.toLocaleString()}`,
                })
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Full Details
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Please provide a reason for this action. This will be logged for audit purposes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for this action..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => executeAction(actionType, reason)}
                disabled={!reason.trim() || loading}
                className="flex-1"
              >
                Confirm Action
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDialog(false)
                  setReason("")
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
