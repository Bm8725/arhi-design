// src/lib/supabase/admin.ts
// 
import { createClient, type User } from '@supabase/supabase-js'

export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('Lipsește NEXT_PUBLIC_SUPABASE_URL sau SUPABASE_SERVICE_ROLE_KEY.')
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** Verifică tokenul de sesiune trimis de browser (Authorization: Bearer <access_token>). */
export async function getUserFromRequest(req: Request): Promise<User | null> {
  const header = req.headers.get('authorization') ?? ''
  const token = header.replace(/^Bearer\s+/i, '').trim()
  if (!token) return null
  const { data, error } = await supabaseAdmin().auth.getUser(token)
  if (error || !data.user) return null
  return data.user
}