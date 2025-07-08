import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle } from "lucide-react"

interface TimelineStep {
  title: string
  description: string
  status: "completed" | "current" | "pending" | "cancelled"
  timestamp?: string
}

interface DealTimelineProps {
  dealStatus: string
  createdAt: string
}

export function DealTimeline({ dealStatus, createdAt }: DealTimelineProps) {
  const getSteps = (status: string): TimelineStep[] => {
    const baseSteps: TimelineStep[] = [
      {
        title: "Deal Created",
        description: "Deal submitted for review",
        status: "completed",
        timestamp: createdAt,
      },
      {
        title: "Admin Review",
        description: "Waiting for admin approval",
        status:
          status === "pending" ? "current" : ["cancelled", "rejected"].includes(status) ? "cancelled" : "completed",
      },
      {
        title: "Deal Approved",
        description: "Deal approved by admin",
        status: ["pending"].includes(status)
          ? "pending"
          : ["cancelled", "rejected"].includes(status)
            ? "cancelled"
            : status === "approved"
              ? "current"
              : "completed",
      },
      {
        title: "Escrow Setup",
        description: "Seller transfers crypto to escrow",
        status: ["pending", "approved"].includes(status)
          ? "pending"
          : ["cancelled", "rejected"].includes(status)
            ? "cancelled"
            : status === "escrow_pending"
              ? "current"
              : "completed",
      },
      {
        title: "Payment",
        description: "Buyer makes payment to seller",
        status: ["pending", "approved", "escrow_pending"].includes(status)
          ? "pending"
          : ["cancelled", "rejected"].includes(status)
            ? "cancelled"
            : status === "payment_pending"
              ? "current"
              : "completed",
      },
      {
        title: "Completion",
        description: "Crypto released to buyer",
        status:
          status === "completed" ? "completed" : ["cancelled", "rejected"].includes(status) ? "cancelled" : "pending",
      },
    ]

    return baseSteps
  }

  const steps = getSteps(dealStatus)

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "current":
        return <Clock className="h-5 w-5 text-blue-600" />
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
    }
  }

  const getStepColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "current":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deal Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">{getStepIcon(step.status)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">{step.title}</h4>
                  <Badge className={getStepColor(step.status)}>{step.status}</Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                {step.timestamp && (
                  <p className="text-xs text-gray-400 mt-1">{new Date(step.timestamp).toLocaleString()}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
