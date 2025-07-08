import { supabase } from "./supabase"

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
  user?: {
    id: number
    name: string | null
    role: "user" | "admin" | "owner" | "banned"
    referred_by: number | null
  }
}

export async function createDeal(dealData: {
  user_id: number
  type: "buy" | "sell"
  crypto: string
  amount: number
  rate: number
  payment_method: string
}) {
  // Check if user has active deals
  const { data: activeDeal } = await supabase
    .from("deals")
    .select("id")
    .eq("user_id", dealData.user_id)
    .in("status", ["pending", "approved", "escrow_pending", "payment_pending"])
    .single()

  if (activeDeal) {
    throw new Error("You already have an active deal. Complete it before creating a new one.")
  }

  // Calculate fee
  const fee = await calculateFee(dealData.amount)

  const { data, error } = await supabase
    .from("deals")
    .insert([{ ...dealData, fee, status: "pending" }])
    .select()
    .single()

  if (error) throw error

  // Log deal creation
  await logDealAction(data.id, dealData.user_id, "user", "Deal created")

  return data
}

export async function calculateFee(amount: number): Promise<number> {
  const { data: configs } = await supabase
    .from("config")
    .select("*")
    .in("key", ["fee_type", "fee_value", "min_fee", "max_fee"])

  const configMap =
    configs?.reduce(
      (acc, config) => {
        acc[config.key] = config.value
        return acc
      },
      {} as Record<string, string>,
    ) || {}

  const feeType = configMap.fee_type || "percentage"
  const feeValue = Number.parseFloat(configMap.fee_value || "1.5")
  const minFee = Number.parseFloat(configMap.min_fee || "50")
  const maxFee = Number.parseFloat(configMap.max_fee || "500")

  let fee: number

  if (feeType === "fixed") {
    fee = feeValue
  } else {
    fee = (amount * feeValue) / 100
  }

  // Apply min/max constraints
  fee = Math.max(minFee, Math.min(maxFee, fee))

  return Math.round(fee * 100) / 100 // Round to 2 decimal places
}

export async function logDealAction(dealId: number, actorId: number, actorRole: string, action: string) {
  await supabase.from("deal_logs").insert([
    {
      deal_id: dealId,
      actor_id: actorId,
      actor_role: actorRole,
      action,
    },
  ])
}

export async function getDeals(filters?: {
  user_id?: number
  status?: string
  type?: "buy" | "sell"
}) {
  let query = supabase
    .from("deals")
    .select(`
      *,
      user:users(id, name, role)
    `)
    .order("created_at", { ascending: false })

  if (filters?.user_id) {
    query = query.eq("user_id", filters.user_id)
  }

  if (filters?.status) {
    query = query.eq("status", filters.status)
  }

  if (filters?.type) {
    query = query.eq("type", filters.type)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Deal[]
}

export async function updateDealStatus(dealId: number, status: string, actorId: number, actorRole: string) {
  const { error } = await supabase.from("deals").update({ status }).eq("id", dealId)

  if (error) throw error

  await logDealAction(dealId, actorId, actorRole, `Status changed to ${status}`)
}
