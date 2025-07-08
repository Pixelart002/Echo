"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function CommandReference() {
  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Command copied to clipboard",
    })
  }

  const telegramCommands = [
    {
      command: "/start",
      description: "Welcome message and user registration",
      access: "All Users",
      example: "/start",
    },
    {
      command: "/deals",
      description: "View your recent deals",
      access: "All Users",
      example: "/deals",
    },
    {
      command: "/help",
      description: "Show help and available commands",
      access: "All Users",
      example: "/help",
    },
    {
      command: "/prices",
      description: "View live crypto prices",
      access: "All Users",
      example: "/prices",
    },
    {
      command: "/admin",
      description: "View pending deals for review",
      access: "Admin/Owner",
      example: "/admin",
    },
    {
      command: "/approve",
      description: "Approve a specific deal",
      access: "Admin/Owner",
      example: "/approve 123",
    },
    {
      command: "/reject",
      description: "Reject a specific deal",
      access: "Admin/Owner",
      example: "/reject 123",
    },
  ]

  const webCommands = [
    {
      command: "Create Deal",
      description: "Create new buy/sell crypto deal",
      access: "All Users",
      location: "Dashboard → Create Deal Tab",
    },
    {
      command: "View Deals",
      description: "View all your deals and their status",
      access: "All Users",
      location: "Dashboard → My Deals Tab",
    },
    {
      command: "Admin Panel",
      description: "Access full admin controls",
      access: "Admin/Owner",
      location: "/admin or Dashboard → Admin Tab",
    },
    {
      command: "Approve Deal",
      description: "Approve pending deals",
      access: "Admin/Owner",
      location: "Admin Panel → Deals → Approve Button",
    },
    {
      command: "Reject Deal",
      description: "Reject pending deals with reason",
      access: "Admin/Owner",
      location: "Admin Panel → Deals → Reject Button",
    },
    {
      command: "Confirm Escrow",
      description: "Confirm crypto is in escrow",
      access: "Admin/Owner",
      location: "Admin Panel → Deal Actions",
    },
    {
      command: "Release Funds",
      description: "Release crypto to buyer after payment",
      access: "Admin/Owner",
      location: "Admin Panel → Deal Actions",
    },
    {
      command: "Make Admin",
      description: "Grant admin privileges to users",
      access: "Owner Only",
      location: "Admin Panel → Users → Make Admin",
    },
    {
      command: "Ban User",
      description: "Ban users from platform",
      access: "Owner Only",
      location: "Admin Panel → Users → Ban",
    },
    {
      command: "Fee Config",
      description: "Configure platform fees",
      access: "Owner Only",
      location: "Admin Panel → Config Tab",
    },
  ]

  const apiEndpoints = [
    {
      endpoint: "POST /api/webhook",
      description: "Telegram bot webhook endpoint",
      access: "Telegram Bot",
      example: "Automatically called by Telegram",
    },
    {
      endpoint: "GET /api/crypto-prices",
      description: "Get live crypto prices",
      access: "Public",
      example: "GET https://your-domain.com/api/crypto-prices",
    },
    {
      endpoint: "POST /api/telegram/set-webhook",
      description: "Set Telegram webhook URL",
      access: "Admin",
      example: "POST https://your-domain.com/api/telegram/set-webhook",
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📚 Complete Command Reference</CardTitle>
          <CardDescription>All available commands and functions for TrustedP2P platform</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="telegram" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="telegram">🤖 Telegram Bot</TabsTrigger>
          <TabsTrigger value="web">🌐 Web Platform</TabsTrigger>
          <TabsTrigger value="api">⚡ API Endpoints</TabsTrigger>
        </TabsList>

        <TabsContent value="telegram" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Telegram Bot Commands</CardTitle>
              <CardDescription>Commands available in the Telegram bot</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {telegramCommands.map((cmd, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">{cmd.command}</code>
                        <Badge variant={cmd.access === "All Users" ? "default" : "secondary"}>{cmd.access}</Badge>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(cmd.example)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{cmd.description}</p>
                    <div className="text-xs text-gray-500">
                      Example: <code>{cmd.example}</code>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="web" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Web Platform Functions</CardTitle>
              <CardDescription>Available functions on the web platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webCommands.map((cmd, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{cmd.command}</span>
                        <Badge
                          variant={
                            cmd.access === "All Users"
                              ? "default"
                              : cmd.access === "Owner Only"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {cmd.access}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{cmd.description}</p>
                    <div className="text-xs text-gray-500">
                      Location: <code>{cmd.location}</code>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>Available API endpoints for integration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiEndpoints.map((api, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">{api.endpoint}</code>
                        <Badge variant="outline">{api.access}</Badge>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(api.example)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{api.description}</p>
                    <div className="text-xs text-gray-500">
                      Example: <code>{api.example}</code>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Access URLs */}
      <Card>
        <CardHeader>
          <CardTitle>🔗 Quick Access URLs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div className="flex items-center justify-between p-2 border rounded">
              <span>Main Platform:</span>
              <code className="text-sm">https://your-domain.com/</code>
            </div>
            <div className="flex items-center justify-between p-2 border rounded">
              <span>Admin Panel:</span>
              <code className="text-sm">https://your-domain.com/admin</code>
            </div>
            <div className="flex items-center justify-between p-2 border rounded">
              <span>Crypto Prices API:</span>
              <code className="text-sm">https://your-domain.com/api/crypto-prices</code>
            </div>
            <div className="flex items-center justify-between p-2 border rounded">
              <span>Telegram Webhook:</span>
              <code className="text-sm">https://your-domain.com/api/webhook</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
