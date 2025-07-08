"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetchCryptoPrices, type CryptoPrice } from "@/lib/crypto-api"
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CryptoPrices() {
  const [prices, setPrices] = useState<CryptoPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadPrices = async () => {
    setLoading(true)
    try {
      const data = await fetchCryptoPrices()
      setPrices(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error loading prices:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPrices()
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadPrices, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">💰 Live Crypto Prices</CardTitle>
        <div className="flex items-center gap-2">
          {lastUpdated && <span className="text-xs text-gray-500">Updated: {lastUpdated.toLocaleTimeString()}</span>}
          <Button variant="outline" size="sm" onClick={loadPrices} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {prices.map((crypto) => (
            <div key={crypto.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="font-medium text-lg">{crypto.symbol}</div>
                <div className="text-sm text-gray-600">{crypto.name}</div>
              </div>

              <div className="text-right">
                <div className="font-bold text-lg">₹{crypto.current_price.toLocaleString()}</div>
                <Badge
                  className={
                    crypto.price_change_percentage_24h >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }
                >
                  {crypto.price_change_percentage_24h >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
