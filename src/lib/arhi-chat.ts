// src/lib/arhi-chat.ts
// Logică comună pentru conversația cu Arhi AI (folosită de widgetul WhatsApp și de pagina /arhi-chat).
// Presupune că /api/chat întoarce text simplu, în stream (ca în pagina ta actuală).

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export class ChatError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

const MAX_HISTORY = 20 // câte mesaje recente trimitem la API (limitează costul)

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Trimite istoricul la /api/chat și apelează onChunk cu textul complet acumulat, pe măsură ce vine.
 * Aruncă ChatError la răspuns HTTP nereușit sau stream gol.
 */
export async function streamChat(
  messages: ChatMessage[],
  signal: AbortSignal,
  onChunk: (fullText: string) => void
): Promise<string> {
  const payload = messages.slice(-MAX_HISTORY)

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: payload }),
    signal,
  })

  if (!res.ok) throw new ChatError(res.status, `HTTP ${res.status}`)

  const reader = res.body?.getReader()
  if (!reader) throw new ChatError(0, 'Răspuns gol')

  const decoder = new TextDecoder()
  let full = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    full += decoder.decode(value, { stream: true })
    onChunk(full)
  }
  full += decoder.decode()
  onChunk(full)

  if (full.trim() === '') throw new ChatError(0, 'Răspuns gol')
  return full
}

/** Mesaj prietenos pentru utilizator, în funcție de eroare. */
export function chatErrorText(e: unknown): string {
  if (e instanceof ChatError) {
    if (e.status === 401 || e.status === 403) return 'Sesiunea a expirat. Autentificați-vă din nou.'
    if (e.status === 429) return 'Prea multe cereri într-un timp scurt. Încercați din nou peste puțin.'
    if (e.status >= 500) return 'Serviciul este momentan indisponibil. Încercați din nou.'
    if (e.status === 0) return 'Nu am primit niciun răspuns. Încercați din nou.'
  }
  return 'Nu am putut trimite mesajul. Verificați conexiunea și încercați din nou.'
}