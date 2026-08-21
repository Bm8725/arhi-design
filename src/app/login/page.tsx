'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])

  // METODA DE AUTENTIFICARE CU GOOGLE
  async function handleGoogleLogin() {
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError('Eroare la conectarea cu contul Google.')
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email sau parolă incorectă.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', data.user.id)
      .single()

    if (profile?.rol === 'superadmin' || profile?.rol === 'angajat') {
      router.push('/dashboard/admin')
    } else {
      router.push('/dashboard/client')
    }
    router.refresh()
  }

// FUNCTIA PENTRU LOGARE RAPIDĂ CU FACE ID / PASSKEY
async function handlePasskeyLogin() {
  setError('')
  setLoading(true)
  
  try {

    const passkeyOptions: any = {
      expectedSignIn: email ? { email } : undefined
    }


    const { data, error } = await supabase.auth.signInWithPasskey(passkeyOptions)

    if (error) throw error

    // DE AICI ÎN JOS ESTE CODUL TĂU CARE ERA DEJA BUN:
    const { data: userResponse } = await supabase.auth.getUser()
    if (userResponse?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', userResponse.user.id)
        .single()

      if (profile?.rol === 'superadmin' || profile?.rol === 'angajat') {
        router.push('/dashboard/admin')
      } else {
        router.push('/dashboard/client')
      }
      router.refresh()
    }
  } catch (err: unknown) {
    setError('Autentificarea biometrică a eșuat sau a fost anulată.')
    setLoading(false)
  }
}



  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@300;400;500&display=swap');
        .a-root*,.a-root *::before,.a-root *::after{box-sizing:border-box}
        .a-root{min-height:100vh;background:#0c0c0c;font-family:'DM Mono',monospace;color:#e0e0e0;position:relative;overflow-x:hidden}
        .a-ambient{position:fixed;inset:0;pointer-events:none;z-index:0;background:radial-gradient(ellipse 80% 50% at 15% 20%,rgba(226,179,110,0.06) 0%,transparent 60%),radial-gradient(ellipse 60% 60% at 85% 80%,rgba(140,120,90,0.04) 0%,transparent 60%)}
        .a-grid{position:fixed;inset:0;pointer-events:none;z-index:0;background-image:linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px);background-size:80px 80px}
        .a-wrap{position:relative;z-index:1;max-width:520px;margin:0 auto;padding:80px 40px 60px;min-height:100vh;display:flex;flex-direction:column;justify-content:center;opacity:0;transform:translateY(20px);transition:opacity 0.7s ease,transform 0.7s ease}
        .a-wrap.ready{opacity:1;transform:translateY(0)}
        .a-eyebrow{font-size:10px;letter-spacing:0.35em;text-transform:uppercase;color:#e2b36e;margin-bottom:18px;display:flex;align-items:center;gap:12px}
        .a-eyebrow::before{content:'';width:28px;height:1px;background:linear-gradient(to right,rgba(226,179,110,0.6),transparent)}
        .a-title{font-family:'Playfair Display',serif;font-size:clamp(28px,4vw,42px);font-weight:400;line-height:1.2;color:#ffffff;letter-spacing:-0.01em;margin-bottom:48px}
        .a-title em{font-style:italic;color:#e2b36e;font-weight:400}
        .a-form{display:flex;flex-direction:column}
        .a-field{position:relative;border-bottom:1px solid rgba(255,255,255,0.2);transition:border-color 0.25s}
        .a-field:focus-within{border-bottom-color:#e2b36e}
        .a-label{position:absolute;top:18px;left:0;font-size:9.5px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.5);pointer-events:none;transition:top 0.2s,font-size 0.2s,color 0.2s}
        .a-input:focus~.a-label,.a-input:not(:placeholder-shown)~.a-label{top:6px;font-size:8.5px;color:#e2b36e}
        .a-input{width:100%;background:none;border:none;outline:none;font-family:'DM Mono',monospace;font-size:15px;color:#ffffff;padding:28px 0 11px}
        .a-input::placeholder{color:transparent}
        .a-input:-webkit-autofill{-webkit-box-shadow:0 0 0 1000px #0c0c0c inset;-webkit-text-fill-color:#ffffff}
        .a-error{font-size:11px;letter-spacing:0.1em;color:#ff6b6b;margin-top:20px;padding:12px 16px;border:1px solid rgba(255,107,107,0.35);background:rgba(255,107,107,0.06)}
        .a-cta-row{display:flex;align-items:center;justify-content:space-between;gap:24px;margin-top:44px}
        .a-btn-submit{display:inline-flex;align-items:center;gap:18px;background:none;border:1px solid rgba(226,179,110,0.5);color:#e2b36e;cursor:pointer;padding:15px 30px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;transition:all 0.25s;position:relative;overflow:hidden}
        .a-btn-submit::before{content:'';position:absolute;inset:0;background:rgba(226,179,110,0.1);transform:translateX(-101%);transition:transform 0.35s ease}
        .a-btn-submit:hover{border-color:#e2b36e;color:#ffffff}
        .a-btn-submit:hover::before{transform:translateX(0)}
        .a-btn-submit:disabled{opacity:0.4;cursor:not-allowed}
        .a-btn-arrow{width:22px;height:1px;background:#e2b36e;position:relative;transition:width 0.25s}
        .a-btn-arrow::after{content:'';position:absolute;right:-1px;top:-3px;width:7px;height:7px;border-top:1px solid #e2b36e;border-right:1px solid #e2b36e;transform:rotate(45deg)}
        .a-btn-submit:hover .a-btn-arrow{width:32px;background:#ffffff}
        .a-btn-submit:hover .a-btn-arrow::after{border-color:#ffffff}
        
        /* BUTON GOOGLE MINIMALIST IMPREUNĂ CU EFECTELE LUI */
        .a-btn-google {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          background: none;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
          cursor: pointer;
          padding: 15px 30px;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          transition: all 0.25s;
          margin-top: 16px;
          width: 100%;
        }
        .a-btn-google:hover {
          border-color: rgba(255, 255, 255, 0.4);
          background: rgba(255, 255, 255, 0.03);
        }
        
        .a-links{display:flex;justify-content:space-between;margin-top:36px;padding-top:22px;border-top:1px solid rgba(255,255,255,0.15)}
        .a-link{font-size:9.5px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.5);text-decoration:none;transition:color 0.2s}
        .a-link:hover{color:#ffffff}

        .a-btn-google:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.a-btn-google-spinner {
  animation: a-spin 0.8s linear infinite;
}

@keyframes a-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
      `}</style>


      <div className="a-root">
        <div className="a-ambient" />
        <div className="a-grid" />
        <Navbar />

        <div className={`a-wrap${mounted ? ' ready' : ''}`}>
          <div className="a-eyebrow">Acces platformă</div>
          <h1 className="a-title">Bine ai <em>revenit.</em></h1>

          <form onSubmit={handleLogin} className="a-form">
            <div className="a-field">
              <input id="l-email" className="a-input" type="email" placeholder="x"
                value={email} onChange={e => setEmail(e.target.value)} required />
              <label htmlFor="l-email" className="a-label">Adresă email/username</label>
            </div>
            <div className="a-field">
              <input id="l-pass" className="a-input" type="password" placeholder="x"
                value={password} onChange={e => setPassword(e.target.value)} required />
              <label htmlFor="l-pass" className="a-label">Parolă</label>
            </div>

            {error && <div className="a-error">{error}</div>}

            <div className="a-cta-row">
              <button type="submit" className="a-btn-submit" disabled={loading}>
                <span>{loading ? 'Se verifică...' : 'Intră în cont'}</span>
                <div className="a-btn-arrow" />
              </button>
            </div>
          </form>

          {/* INTEGRAT BUTONUL NOU DE GOOGLE OAUTH SUB FORMULAR */}
          <button type="button" onClick={handleGoogleLogin} className="a-btn-google">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Connect with Google</span>
          </button>

                      {/* BUTON SCHIMBAT PENTRU INTRARE CU BIOMETRIE 
            <button type="button" onClick={handlePasskeyLogin} className="a-btn-google" style={{ marginTop: '12px' }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2M9 9h.01M15 9h.01M9 15c.5 1.5 2 2.5 3 2.5s2.5-1 3-2.5" />
              </svg>
              <span>Enter with face ID</span>
            </button>
                       */}

          <div className="a-links">
            <Link href="/forgot-password" className="a-link">Ai uitat parola?</Link>
            <Link href="/signup" className="a-link">Creează cont →</Link>
          </div>
        </div>

        
        <Footer />
      </div>
    </>
  )
}
