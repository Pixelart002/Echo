import { NextResponse } from "next/server"

const BOT_TOKEN = "7885654189:AAG3cgpJsHdOAQSaPEbUZJ3Plb0LkvJ77cA"

export async function POST() {
  try {
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com"}/api/webhook`

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message", "callback_query"],
      }),
    })

    const data = await response.json()

    if (data.ok) {
      return NextResponse.json({
        success: true,
        message: "Webhook set successfully",
        webhook_url: webhookUrl,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: data.description,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to set webhook",
      },
      { status: 500 },
    )
  }
}
