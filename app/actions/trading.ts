"use server"
import { createServerClient } from "@/lib/supabase"

export interface TradeData {
  stock_symbol: string
  stock_name: string
  type: "buy" | "sell"
  quantity: number
  price: number
  total_amount: number
  order_id: string
  executed_at: string
}

export async function saveTradeToDatabase(userId: string, tradeData: TradeData) {
  try {
    const serverSupabase = createServerClient()

    // Insert the trade data into the transactions table
    const { data, error } = await serverSupabase
      .from("transactions")
      .insert([
        {
          user_id: userId,
          stock_symbol: tradeData.stock_symbol,
          stock_name: tradeData.stock_name,
          type: tradeData.type,
          quantity: tradeData.quantity,
          price: tradeData.price,
          total_amount: tradeData.total_amount,
          order_id: tradeData.order_id,
          executed_at: tradeData.executed_at,
          transaction_type: tradeData.type, // For compatibility with existing schema
          amount: tradeData.total_amount, // For compatibility with existing schema
          transaction_date: new Date().toISOString().split("T")[0], // For compatibility
        },
      ])
      .select()

    if (error) {
      console.error("Database error:", error)
      return {
        success: false,
        error: `Database error: ${error.message}`,
        data: null,
      }
    }

    console.log("Trade saved successfully:", data)
    return {
      success: true,
      error: null,
      data: data,
    }
  } catch (error) {
    console.error("Server action error:", error)
    return {
      success: false,
      error: `Server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      data: null,
    }
  }
}

export async function getUserTrades(userId: string) {
  try {
    const serverSupabase = createServerClient()

    const { data, error } = await serverSupabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .not("stock_symbol", "is", null)
      .order("executed_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return {
        success: false,
        error: error.message,
        data: [],
      }
    }

    return {
      success: true,
      error: null,
      data: data || [],
    }
  } catch (error) {
    console.error("Server action error:", error)
    return {
      success: false,
      error: "Failed to fetch trades",
      data: [],
    }
  }
}
