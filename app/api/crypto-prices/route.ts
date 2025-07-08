import { NextResponse } from "next/server"
import { fetchCryptoPrices } from "@/lib/crypto-api"

export async function GET() {
  try {
    const prices = await fetchCryptoPrices()

    return NextResponse.json({
      success: true,
      data: prices,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch crypto prices",
      },
      { status: 500 },
    )
  }
}

export const revalidate = 30 // Cache for 30 seconds
