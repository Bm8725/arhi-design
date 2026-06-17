'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'
import CookieBanner from '@/components/Cookiebanner'

export default function SignupPage() {
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // ADAUGĂ ACESTE DOUĂ LINII PENTRU TELEFON ȘI GDPR:
  const [phone, setPhone] = useState('')
  const [gdprConsent, setGdprConsent] = useState(false)

  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // 1. Validare locală pentru GDPR
    if (!gdprConsent) {
      setError('Trebuie să accepți politica GDPR pentru a continua.')
      return
    }

    setLoading(true)

    // 2. Trimiterea datelor către Supabase (cu tot cu phone)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { 
          full_name: fullName, 
          phone: phone,       // <-- ACEASTĂ LINIE LIPSEA! Trimite starea din React în DB
          rol: 'client' 
        } 
      },
    })

    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(true)
    setLoading(false)
  }


  return (
    <>
<style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@300;400;500&display=swap');
        .s-root*,.s-root *::before,.s-root *::after{box-sizing:border-box}
        .s-root{min-height:100vh;background:#121212;font-family:'DM Mono',monospace;color:#e5e5e5;position:relative;overflow-x:hidden}
        .s-ambient{position:fixed;inset:0;pointer-events:none;z-index:0;background:radial-gradient(ellipse 80% 50% at 15% 20%,rgba(180,140,80,0.05) 0%,transparent 60%),radial-gradient(ellipse 60% 60% at 85% 80%,rgba(140,120,90,0.04) 0%,transparent 60%)}
        .s-grid{position:fixed;inset:0;pointer-events:none;z-index:0;background-image:linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px);background-size:80px 80px}
        .s-wrap{position:relative;z-index:1;max-width:520px;margin:0 auto;padding:80px 40px 60px;min-height:100vh;display:flex;flex-direction:column;justify-content:center;opacity:0;transform:translateY(20px);transition:opacity 0.7s ease,transform 0.7s ease}
        .s-wrap.ready{opacity:1;transform:translateY(0)}
        .s-eyebrow{font-size:10px;letter-spacing:0.35em;text-transform:uppercase;color:rgba(212,163,89,0.8);margin-bottom:18px;display:flex;align-items:center;gap:12px}
        .s-eyebrow::before{content:'';width:28px;height:1px;background:linear-gradient(to right,rgba(212,163,89,0.6),transparent)}
        .s-title{font-family:'Playfair Display',serif;font-size:clamp(28px,4vw,42px);font-weight:400;line-height:1.2;color:#ffffff;letter-spacing:-0.01em;margin-bottom:48px}
        .s-title em{font-style:italic;color:#d4a359}
        .s-form{display:flex;flex-direction:column}
        .s-field{position:relative;border-bottom:1px solid rgba(255,255,255,0.2);transition:border-color 0.25s}
        .s-field:focus-within{border-bottom-color:#d4a359}
        .s-field-row{display:grid;grid-template-columns:1fr 1fr;gap:0 40px}
        .s-label{position:absolute;top:18px;left:0;font-size:9.5px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.5);pointer-events:none;transition:top 0.2s,font-size 0.2s,color 0.2s}
        .s-input:focus~.s-label,.s-input:not(:placeholder-shown)~.s-label{top:6px;font-size:8.5px;color:#d4a359}
        .s-input{width:100%;background:none;border:none;outline:none;font-family:'DM Mono',monospace;font-size:15px;color:#ffffff;padding:28px 0 11px}
        .s-input::placeholder{color:transparent}
        .s-input:-webkit-autofill{-webkit-box-shadow:0 0 0 1000px #121212 inset;-webkit-text-fill-color:#ffffff}
        .s-error{font-size:11px;letter-spacing:0.1em;color:#ff6b6b;margin-top:20px;padding:12px 16px;border:1px solid rgba(255,107,107,0.3);background:rgba(255,107,107,0.05)}
        .s-cta-row{display:flex;align-items:center;justify-content:space-between;gap:24px;margin-top:44px}
        .s-btn-submit{display:inline-flex;align-items:center;gap:18px;background:none;border:1px solid rgba(212,163,89,0.5);color:#d4a359;cursor:pointer;padding:15px 30px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;transition:all 0.25s;position:relative;overflow:hidden}
        .s-btn-submit::before{content:'';position:absolute;inset:0;background:rgba(212,163,89,0.1);transform:translateX(-101%);transition:transform 0.35s ease}
        .s-btn-submit:hover{border-color:#d4a359;color:#ffffff}
        .s-btn-submit:hover::before{transform:translateX(0)}
        .s-btn-submit:disabled{opacity:0.4;cursor:not-allowed}
        .s-btn-arrow{width:22px;height:1px;background:#d4a359;position:relative;transition:width 0.25s}
        .s-btn-arrow::after{content:'';position:absolute;right:-1px;top:-3px;width:7px;height:7px;border-top:1px solid #d4a359;border-right:1px solid #d4a359;transform:rotate(45deg)}
        .s-btn-submit:hover .s-btn-arrow{width:32px;background:#ffffff}
        .s-btn-submit:hover .s-btn-arrow::after{border-color:#ffffff}
        .s-links{display:flex;justify-content:flex-end;margin-top:36px;padding-top:22px;border-top:1px solid rgba(255,255,255,0.1)}
        .s-link{font-size:9.5px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.5);text-decoration:none;transition:color 0.2s}
        .s-link:hover{color:#ffffff}
        .s-success{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:28px;animation:sIn 0.6s cubic-bezier(0.22,1,0.36,1) forwards}
        @keyframes sIn{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        .s-success-ring{width:70px;height:70px;border-radius:50%;border:1px solid rgba(212,163,89,0.5);display:flex;align-items:center;justify-content:center;color:#d4a359}
        .s-success-title{font-family:'Playfair Display',serif;font-size:42px;font-weight:400;color:#ffffff}
        .s-success-sub{font-size:11.5px;line-height:1.85;color:rgba(255,255,255,0.6);max-width:340px;letter-spacing:0.05em}
      `}</style>

      <div className="s-root">
        <div className="s-ambient" />
        <div className="s-grid" />
        <Navbar />

        <div className={`s-wrap${mounted ? ' ready' : ''}`}>
          {success ? (
            <div className="s-success">
              <div className="s-success-ring">
                <CheckCircle2 size={26} strokeWidth={1} />
              </div>
              <div className="s-success-title">Cont creat.</div>

              <Link href="/login" className="s-link" style={{ marginTop: 8 }}>
                Mergi la login →
              </Link>
            </div>
          ) : (
            <>
              <div className="s-eyebrow">Înregistrare</div>
              <h1 className="s-title">Creează-ți <em>contul.</em></h1>

              <form onSubmit={handleSignup} className="s-form">
                <div className="s-field">
                  <input id="s-name" className="s-input" type="text" placeholder="x"
                    value={fullName} onChange={e => setFullName(e.target.value)} required />
                  <label htmlFor="s-name" className="s-label">Nume complet</label>
                </div>
                <div className="s-field">
                  <input id="s-email" className="s-input" type="email" placeholder="x"
                    value={email} onChange={e => setEmail(e.target.value)} required />
                  <label htmlFor="s-email" className="s-label">Adresă email/username</label>
                </div>
                
                {/* Câmp adăugat pentru Telefon */}
                <div className="s-field">
                  <input id="s-phone" className="s-input" type="tel" placeholder="x"
                    value={phone} onChange={e => setPhone(e.target.value)} required />
                  <label htmlFor="s-phone" className="s-label">Număr de telefon</label>
                </div>

                <div className="s-field">
                  <input id="s-pass" className="s-input" type="password" placeholder="x"
                    value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                  <label htmlFor="s-pass" className="s-label">Parolă (minim 6 caractere)</label>
                </div>

                {/* Casetă adăugată pentru GDPR */}
                <label className="s-gdpr-container">
                  <input type="checkbox" className="s-gdpr-checkbox" checked={gdprConsent} 
                    onChange={e => setGdprConsent(e.target.checked)} />
                  <div className="s-gdpr-custom-box"></div>
                  <span className="s-gdpr-text">
                    Sunt de acord cu <Link href="/termeni">Termenii și Condițiile</Link> și prelucrarea datelor conform <Link href="/politica-confidentialitate">Politicilor noastre.</Link>.
                  </span>
                </label>

                {error && <div className="s-error">{error}</div>}

                <div className="s-cta-row">
                  <button type="submit" className="s-btn-submit" disabled={loading}>
                    <span>{loading ? 'Se creează...' : 'Creează cont'}</span>
                    <div className="s-btn-arrow" />
                  </button>
                </div>
              </form>

              <div className="s-links">
                <Link href="/login" className="s-link">Ai deja cont? Loghează-te →</Link>
              </div>
            </>
          )}
        </div>
          <CookieBanner />
        <WhatsAppWidget />
        <Footer />
      </div>

    </>
  )
}