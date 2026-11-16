// src/lib/stripe.ts
// SERVER ONLY – nu importa acest fișier în componente 'use client'.
import Stripe from 'stripe'

const key = process.env.STRIPE_SECRET_KEY
if (!key) {
  throw new Error('Lipsește STRIPE_SECRET_KEY din variabilele de mediu.')
}

export const stripe = new Stripe(key)

/** Valorile enum-ului order_status din baza ta. Verifică-le (vezi supabase/stripe.sql). */
export const ORDER_STATUS = {
  pending: 'pending',
  paid: 'paid',
} as const

export const CURRENCY = 'ron'

export const toCents = (value: unknown): number => Math.round(Number(value) * 100)