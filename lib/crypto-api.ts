// Live crypto price fetching
const COINGECKO_API = "https://api.coingecko.com/api/v3"

export interface CryptoPrice {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  volume: number
  last_updated: string
}

export async function fetchCryptoPrices(): Promise<CryptoPrice[]> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=inr&ids=bitcoin,ethereum,tether,binancecoin,cardano,polkadot,matic-network,solana,dogecoin,shiba-inu&order=market_cap_desc&per_page=10&page=1&sparkline=false`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error("Failed to fetch crypto prices")
    }

    const data = await response.json()
    return data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      current_price: coin.current_price,
      price_change_percentage_24h: coin.price_change_percentage_24h || 0,
      market_cap: coin.market_cap,
      volume: coin.total_volume,
      last_updated: coin.last_updated,
    }))
  } catch (error) {
    console.error("Error fetching crypto prices:", error)
    // Fallback prices if API fails
    return [
      {
        id: "bitcoin",
        symbol: "BTC",
        name: "Bitcoin",
        current_price: 3500000,
        price_change_percentage_24h: 2.5,
        market_cap: 0,
        volume: 0,
        last_updated: new Date().toISOString(),
      },
      {
        id: "ethereum",
        symbol: "ETH",
        name: "Ethereum",
        current_price: 280000,
        price_change_percentage_24h: 1.8,
        market_cap: 0,
        volume: 0,
        last_updated: new Date().toISOString(),
      },
      {
        id: "tether",
        symbol: "USDT",
        name: "Tether",
        current_price: 85,
        price_change_percentage_24h: 0.1,
        market_cap: 0,
        volume: 0,
        last_updated: new Date().toISOString(),
      },
    ]
  }
}

export async function getCryptoPrice(symbol: string): Promise<number> {
  const prices = await fetchCryptoPrices()
  const crypto = prices.find((p) => p.symbol === symbol.toUpperCase())
  return crypto?.current_price || 0
}
