"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth"
import { createDeal, calculateFee } from "@/lib/deals"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getCryptoPrice } from "@/lib/crypto-api"

interface CreateDealFormProps {
  onDealCreated?: () => void
}

export function CreateDealForm({ onDealCreated }: CreateDealFormProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [estimatedFee, setEstimatedFee] = useState<number | null>(null)
  const [livePrice, setLivePrice] = useState<number | null>(null)
  const [priceLoading, setPriceLoading] = useState(false)

  const [formData, setFormData] = useState({
    type: "" as "buy" | "sell" | "",
    crypto: "",
    amount: "",
    rate: "",
    payment_method: "",
  })

  const cryptoOptions = ["USDT", "BTC", "ETH", "BNB", "ADA", "DOT", "MATIC"]
  const paymentMethods = ["UPI", "Bank Transfer", "PayTM", "PhonePe", "GPay", "Cash"]

  const handleAmountChange = async (amount: string) => {
    setFormData((prev) => ({ ...prev, amount }))

    if (amount && !isNaN(Number.parseFloat(amount))) {
      try {
        const fee = await calculateFee(Number.parseFloat(amount))
        setEstimatedFee(fee)
      } catch (error) {
        console.error("Fee calculation error:", error)
      }
    } else {
      setEstimatedFee(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      await createDeal({
        user_id: user.id,
        type: formData.type as "buy" | "sell",
        crypto: formData.crypto,
        amount: Number.parseFloat(formData.amount),
        rate: Number.parseFloat(formData.rate),
        payment_method: formData.payment_method,
      })

      toast({
        title: "Deal Created",
        description: "Your deal has been submitted for admin approval.",
      })

      // Reset form
      setFormData({
        type: "",
        crypto: "",
        amount: "",
        rate: "",
        payment_method: "",
      })
      setEstimatedFee(null)

      onDealCreated?.()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create deal",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const cryptoAmount =
    formData.amount && formData.rate
      ? (Number.parseFloat(formData.amount) / Number.parseFloat(formData.rate)).toFixed(2)
      : "0"

  const fetchLivePrice = async (crypto: string) => {
    if (!crypto) return
    setPriceLoading(true)
    try {
      const price = await getCryptoPrice(crypto)
      setLivePrice(price)
      // Auto-fill rate with live price
      setFormData((prev) => ({ ...prev, rate: price.toString() }))
    } catch (error) {
      console.error("Error fetching price:", error)
    } finally {
      setPriceLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Deal</CardTitle>
        <CardDescription>Create a buy or sell order for cryptocurrency</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Deal Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "buy" | "sell") => setFormData((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">🟢 Buy Crypto</SelectItem>
                  <SelectItem value="sell">🔴 Sell Crypto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="crypto">Cryptocurrency</Label>
              <Select
                value={formData.crypto}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, crypto: value }))
                  fetchLivePrice(value)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select crypto" />
                </SelectTrigger>
                <SelectContent>
                  {cryptoOptions.map((crypto) => (
                    <SelectItem key={crypto} value={crypto}>
                      {crypto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="10000"
                value={formData.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                min="1"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Rate (₹ per {formData.crypto || "crypto"})</Label>
              <Input
                id="rate"
                type="number"
                placeholder="85.50"
                value={formData.rate}
                onChange={(e) => setFormData((prev) => ({ ...prev, rate: e.target.value }))}
                min="0.01"
                step="0.01"
              />
              {livePrice && (
                <div className="text-sm text-blue-600 mt-1">
                  💰 Live Price: ₹{livePrice.toLocaleString()}
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="p-0 h-auto ml-2"
                    onClick={() => setFormData((prev) => ({ ...prev, rate: livePrice.toString() }))}
                  >
                    Use Live Price
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, payment_method: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.amount && formData.rate && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Crypto Amount:</span>
                <span className="font-medium">
                  {cryptoAmount} {formData.crypto}
                </span>
              </div>
              {estimatedFee && (
                <div className="flex justify-between text-sm">
                  <span>Estimated Fee:</span>
                  <span className="font-medium">₹{estimatedFee}</span>
                </div>
              )}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={
              loading ||
              !formData.type ||
              !formData.crypto ||
              !formData.amount ||
              !formData.rate ||
              !formData.payment_method
            }
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Deal...
              </>
            ) : (
              "Create Deal"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
