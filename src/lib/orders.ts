// src/lib/orders.ts
// SERVER ONLY. Acordă accesul la descărcări, fără duplicate (idempotent).
import type { SupabaseClient } from '@supabase/supabase-js'

export const MAX_DOWNLOADS = 3

export async function grantDownloads(
  admin: SupabaseClient,
  userId: string,
  orderId: string | number,
  productIds: (string | number)[]
): Promise<void> {
  if (productIds.length === 0) return

  const { data: existing, error: readError } = await admin
    .from('downloads')
    .select('product_id')
    .eq('user_id', userId)
    .in('product_id', productIds)
  if (readError) throw readError

  const have = new Set((existing ?? []).map((r) => String(r.product_id)))
  const rows = productIds
    .filter((id) => !have.has(String(id)))
    .map((id) => ({
      product_id: id,
      user_id: userId,
      order_id: orderId,
      nr_descarcari: 0,
      max_descarcari: MAX_DOWNLOADS,
    }))

  if (rows.length === 0) return
  const { error } = await admin.from('downloads').insert(rows)
  if (error) throw error
}