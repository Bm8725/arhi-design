import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server' // Asigură-te că ai instanța de server configurată în lib

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    // Schimbă codul primit de la Google pe o sesiune activă Supabase
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      // Verifică rolul utilizatorului exact cum ai făcut pe pagina de Login standard
      const { data: profile } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', data.user.id)
        .single()

      // Redirecționează utilizatorul în funcție de rol
      if (profile?.rol === 'superadmin' || profile?.rol === 'angajat') {
        return NextResponse.redirect(`${origin}/dashboard/admin`)
      } else {
        return NextResponse.redirect(`${origin}/dashboard/client`)
      }
    }
  }

  // În caz de eroare la autentificare, îl trimitem înapoi pe login cu un parametru de eroare
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
}
