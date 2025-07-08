import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://tzhecveabfiolnvsjatk.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6aGVjdmVhYmZpb2xudnNqYXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzQ2OTEsImV4cCI6MjA2NzQ1MDY5MX0.uJeQw_vtxI3pYg4TwI-wvRzNNLXo2VMU77f4SYhb4yc"

export const supabase = createClient(supabaseUrl, supabaseKey)

export type User = {
  id: number
  name: string | null
  role: "user" | "admin" | "owner" | "banned"
  referred_by: number | null
}

export type Deal = {
  id: number
  user_id: number
  type: "buy" | "sell"
  crypto: string
  amount: number
  rate: number
  payment_method: string
  fee: number
  status: "pending" | "approved" | "escrow_pending" | "payment_pending" | "completed" | "cancelled" | "disputed"
  created_at: string
  user?: User
}

export type Proof = {
  id: number
  deal_id: number
  user_id: number
  file_url: string
  caption: string | null
  created_at: string
}

export type Config = {
  key: string
  value: string
}

export type DealLog = {
  id: number
  deal_id: number
  actor_id: number
  actor_role: string
  action: string
  timestamp: string
}

export type CryptoPrice = {
  symbol: string
  name: string
  price_usd: number
  price_inr: number
  change_24h: number
  last_updated: string
}

export type AdminAction = {
  id: number
  deal_id: number
  admin_id: number
  action: string
  reason?: string
  created_at: string
}
