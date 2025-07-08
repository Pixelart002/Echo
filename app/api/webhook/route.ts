import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const BOT_TOKEN = "7885654189:AAG3cgpJsHdOAQSaPEbUZJ3Plb0LkvJ77cA"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify the request is from Telegram
    const telegramSignature = request.headers.get("x-telegram-bot-api-secret-token")

    if (!body.message) {
      return NextResponse.json({ ok: true })
    }

    const message = body.message
    const chatId = message.chat.id
    const userId = message.from.id
    const username = message.from.first_name || message.from.username
    const text = message.text

    // Handle different commands
    if (text === "/start") {
      await handleStartCommand(chatId, userId, username)
    } else if (text === "/deals") {
      await handleDealsCommand(chatId, userId)
    } else if (text === "/help") {
      await handleHelpCommand(chatId)
    } else if (text === "/admin") {
      await handleAdminCommand(chatId, userId)
    } else if (text.startsWith("/approve ")) {
      const dealId = text.split(" ")[1]
      await handleApproveCommand(chatId, userId, dealId)
    } else if (text.startsWith("/reject ")) {
      const dealId = text.split(" ")[1]
      await handleRejectCommand(chatId, userId, dealId)
    } else if (text === "/prices") {
      await handlePricesCommand(chatId)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function sendTelegramMessage(chatId: number, text: string, options?: any) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`

  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      ...options,
    }),
  })
}

async function handleStartCommand(chatId: number, userId: number, username: string) {
  // Check if user exists
  const { data: existingUser } = await supabase.from("users").select("*").eq("id", userId).single()

  if (!existingUser) {
    // Create new user
    await supabase.from("users").insert([{ id: userId, name: username, role: "user" }])
  }

  const welcomeMessage = `
🎉 <b>Welcome to TrustedP2P!</b>

Your secure P2P crypto trading platform with escrow protection.

🔗 <b>Access Web App:</b>
Visit our web platform to create and manage deals:
https://your-domain.com

📱 <b>Available Commands:</b>
/deals - View your deals
/help - Get help and support

💡 <b>How it works:</b>
1. Create buy/sell deals on our web platform
2. Admin approves your deals
3. Secure escrow protects both parties
4. Complete trades safely

Start trading now on our web platform! 🚀
  `

  await sendTelegramMessage(chatId, welcomeMessage)
}

async function handleDealsCommand(chatId: number, userId: number) {
  try {
    const { data: deals } = await supabase
      .from("deals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5)

    if (!deals || deals.length === 0) {
      await sendTelegramMessage(chatId, "📋 You have no deals yet. Create your first deal on our web platform!")
      return
    }

    let message = "📋 <b>Your Recent Deals:</b>\n\n"

    deals.forEach((deal, index) => {
      const statusEmoji =
        {
          pending: "⏳",
          approved: "✅",
          escrow_pending: "🔒",
          payment_pending: "💰",
          completed: "🎉",
          cancelled: "❌",
          disputed: "⚠️",
        }[deal.status] || "❓"

      message += `${index + 1}. Deal #${deal.id}\n`
      message += `   ${deal.type === "buy" ? "🟢 Buy" : "🔴 Sell"} ${deal.crypto}\n`
      message += `   Amount: ₹${deal.amount.toLocaleString()}\n`
      message += `   Status: ${statusEmoji} ${deal.status.replace("_", " ")}\n\n`
    })

    message += "🌐 Visit our web platform to manage your deals!"

    await sendTelegramMessage(chatId, message)
  } catch (error) {
    console.error("Error fetching deals:", error)
    await sendTelegramMessage(chatId, "❌ Error fetching your deals. Please try again later.")
  }
}

async function handleHelpCommand(chatId: number) {
  const helpMessage = `
🆘 <b>TrustedP2P Help</b>

<b>🌐 Web Platform:</b>
Access our full-featured web app at:
https://your-domain.com

<b>📱 Bot Commands:</b>
/start - Welcome message and setup
/deals - View your recent deals
/admin - Admin panel (admins only)
/approve <deal_id> - Approve deal (admins only)
/reject <deal_id> - Reject deal (admins only)
/prices - View live crypto prices
/help - This help message

<b>🔒 Security Features:</b>
• Manual escrow protection
• Admin approval system
• Secure payment verification
• Anti-fraud measures

<b>💰 How Trading Works:</b>
1. Create deals on web platform
2. Wait for admin approval
3. Follow escrow instructions
4. Complete secure trades

<b>🎯 Deal Types:</b>
• Buy Crypto (Pay INR, Get Crypto)
• Sell Crypto (Give Crypto, Get INR)

<b>💳 Payment Methods:</b>
UPI, Bank Transfer, PayTM, PhonePe, GPay, Cash

<b>📞 Support:</b>
Contact admin for assistance with trades or disputes.

Happy Trading! 🚀
  `

  await sendTelegramMessage(chatId, helpMessage)
}

async function handleAdminCommand(chatId: number, userId: number) {
  try {
    // Check if user is admin or owner
    const { data: user } = await supabase.from("users").select("*").eq("id", userId).single()

    if (!user || (user.role !== "admin" && user.role !== "owner")) {
      await sendTelegramMessage(chatId, "❌ Access denied. Admin privileges required.")
      return
    }

    // Get pending deals
    const { data: pendingDeals } = await supabase
      .from("deals")
      .select(`
        *,
        user:users(name)
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5)

    if (!pendingDeals || pendingDeals.length === 0) {
      await sendTelegramMessage(chatId, "✅ No pending deals to review!")
      return
    }

    let message = "🛡️ <b>Pending Deals for Review:</b>\n\n"

    pendingDeals.forEach((deal, index) => {
      message += `${index + 1}. Deal #${deal.id}\n`
      message += `   ${deal.type === "buy" ? "🟢 Buy" : "🔴 Sell"} ${deal.crypto}\n`
      message += `   Amount: ₹${deal.amount.toLocaleString()}\n`
      message += `   User: ${deal.user?.name || "Unknown"}\n`
      message += `   Commands: /approve ${deal.id} | /reject ${deal.id}\n\n`
    })

    message += "🌐 Use web platform for detailed review and actions."

    await sendTelegramMessage(chatId, message)
  } catch (error) {
    console.error("Error in admin command:", error)
    await sendTelegramMessage(chatId, "❌ Error fetching admin data.")
  }
}

async function handleApproveCommand(chatId: number, userId: number, dealId: string) {
  try {
    // Check admin privileges
    const { data: user } = await supabase.from("users").select("role").eq("id", userId).single()

    if (!user || (user.role !== "admin" && user.role !== "owner")) {
      await sendTelegramMessage(chatId, "❌ Access denied. Admin privileges required.")
      return
    }

    // Update deal status
    const { error } = await supabase
      .from("deals")
      .update({ status: "approved" })
      .eq("id", Number.parseInt(dealId))
      .eq("status", "pending")

    if (error) throw error

    // Log the action
    await supabase.from("deal_logs").insert([
      {
        deal_id: Number.parseInt(dealId),
        actor_id: userId,
        actor_role: user.role,
        action: "Deal approved via Telegram",
      },
    ])

    await sendTelegramMessage(chatId, `✅ Deal #${dealId} has been approved!`)
  } catch (error) {
    console.error("Error approving deal:", error)
    await sendTelegramMessage(chatId, `❌ Error approving deal #${dealId}`)
  }
}

async function handleRejectCommand(chatId: number, userId: number, dealId: string) {
  try {
    // Check admin privileges
    const { data: user } = await supabase.from("users").select("role").eq("id", userId).single()

    if (!user || (user.role !== "admin" && user.role !== "owner")) {
      await sendTelegramMessage(chatId, "❌ Access denied. Admin privileges required.")
      return
    }

    // Update deal status
    const { error } = await supabase
      .from("deals")
      .update({ status: "cancelled" })
      .eq("id", Number.parseInt(dealId))
      .eq("status", "pending")

    if (error) throw error

    // Log the action
    await supabase.from("deal_logs").insert([
      {
        deal_id: Number.parseInt(dealId),
        actor_id: userId,
        actor_role: user.role,
        action: "Deal rejected via Telegram",
      },
    ])

    await sendTelegramMessage(chatId, `❌ Deal #${dealId} has been rejected.`)
  } catch (error) {
    console.error("Error rejecting deal:", error)
    await sendTelegramMessage(chatId, `❌ Error rejecting deal #${dealId}`)
  }
}

async function handlePricesCommand(chatId: number) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/crypto-prices`)
    const data = await response.json()

    if (!data.success) {
      throw new Error("Failed to fetch prices")
    }

    let message = "💰 <b>Live Crypto Prices (INR):</b>\n\n"

    data.data.slice(0, 8).forEach((crypto: any) => {
      const changeEmoji = crypto.price_change_percentage_24h >= 0 ? "📈" : "📉"
      message += `${changeEmoji} <b>${crypto.symbol}</b> - ₹${crypto.current_price.toLocaleString()}\n`
      message += `   24h: ${crypto.price_change_percentage_24h.toFixed(2)}%\n\n`
    })

    message += "🌐 Visit our platform to create deals with live prices!"

    await sendTelegramMessage(chatId, message)
  } catch (error) {
    console.error("Error fetching prices:", error)
    await sendTelegramMessage(chatId, "❌ Error fetching crypto prices. Please try again later.")
  }
}
