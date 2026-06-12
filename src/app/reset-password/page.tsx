'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => { 
    setTimeout(() => setMounted(true), 50) 
  }, [])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Parolele introduce nu coincid.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message === 'New password should be different from the old password' 
        ? 'Noua parolă trebuie să fie diferită de cea veche.' 
        : error.message
      )
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    
    setTimeout(() => {
      router.push('/dashboard')
      router.refresh()
    }, 2500)
  }

  return (
    <>
      <style>{`
        @import url('https://googleapis.com');
        .a-root*,.a-root *::before,.a-root *::after{box-sizing:border-box}
        .a-root{min-height:100vh;background:#0c0c0c;font-family:'DM Mono',monospace;color:#e0e0e0;position:relative;overflow-x:hidden;display:flex;flex-direction:column;justify-content:space-between}
        .a-ambient{position:fixed;inset:0;pointer-events:none;z-index:0;background:radial-gradient(ellipse 80% 50% at 15% 20%,rgba(226,179,110,0.06) 0%,transparent 60%),radial-gradient(ellipse 60% 60% at 85% 80%,rgba(140,120,90,0.04) 0%,transparent 60%)}
        .a-grid{position:fixed;inset:0;pointer-events:none;z-index:0;background-image:linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px);background-size:80px 80px}
        .a-wrap{position:relative;z-index:1;max-width:520px;width:100%;margin:0 auto;padding:120px 40px 100px;flex-grow:1;display:flex;flex-direction:column;justify-content:center;opacity:0;transform:translateY(20px);transition:opacity 0.7s ease,transform 0.7s ease}
        .a-wrap.ready{opacity:1;transform:translateY(0)}
        .a-eyebrow{font-size:10px;letter-spacing:0.35em;text-transform:uppercase;color:#e2b36e;margin-bottom:18px;display:flex;align-items:center;gap:12px}
        .a-eyebrow::before{content:'';width:28px;height:1px;background:linear-gradient(to right,rgba(226,179,110,0.6),transparent)}
        .a-title{font-family:'Playfair Display',serif;font-size:clamp(28px,4vw,42px);font-weight:400;line-height:1.2;color:#ffffff;letter-spacing:-0.01em;margin-bottom:48px}
        .a-title em{font-style:italic;color:#e2b36e;font-weight:400}
        .a-form{display:flex;flex-direction:column}
        .a-field{position:relative;border-bottom:1px solid rgba(255,255,255,0.2);transition:border-color 0.25s;margin-bottom:12px}
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
        .a-links{display:flex;justify-content:flex-start;margin-top:36px;padding-top:22px;border-top:1px solid rgba(255,255,255,0.15)}
        .a-link{font-size:9.5px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.5);text-decoration:none;transition:color 0.2s}
        .a-link:hover{color:#ffffff}
        .a-success{display:flex;flex-direction:column;gap:16px;margin-top:20px;padding:16px;border:1px solid rgba(226,179,110,0.3);background:rgba(226,179,110,0.04);animation:aIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards}
        @keyframes aIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .a-success-title{font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#e2b36e;font-weight:500}
        .a-success-sub{font-size:11px;line-height:1.6;color:rgba(255,255,255,0.7)}
      `}</style>

      <div className="a-root">
        <div className="a-ambient" />
        <div className="a-grid" />
        
        <Navbar />

        <div className={`a-wrap${mounted ? ' ready' : ''}`}>
          <div className="a-eyebrow">Securitate cont</div>
          <h1 className="a-title">Parolă <em>nouă.</em></h1>

          {!success ? (
            <form onSubmit={handleReset} className="a-form">
              <div className="a-field">
                <input 
                  id="r-pass" 
                  className="a-input" 
                  type="password" 
                  placeholder="x"
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  minLength={6} 
                />
                <label htmlFor="r-pass" className="a-label">Parolă nouă (minim 6 caractere)</label>
              </div>
              
              <div className="a-field">
                <input 
                  id="r-confirm" 
                  className="a-input" 
                  type="password" 
                  placeholder="x"
                  value={confirm} 
                  onChange={e => setConfirm(e.target.value)} 
                  required 
                />
                <label htmlFor="r-confirm" className="a-label">Confirmă parola</label>
              </div>

              {error && <div className="a-error">{error}</div>}

              <div className="a-cta-row">
                <button type="submit" className="a-btn-submit" disabled={loading}>
                  <span>{loading ? 'Se salvează...' : 'Actualizează parola'}</span>
                  <div className="a-btn-arrow" />
                </button>
              </div>
            </form>
          ) : (
            <div className="a-success">
              <div className="a-success-title">✓ Schimbare reușită</div>
              <div className="a-success-sub">Noua ta parolă a fost configurată cu succes. Se redirecționează către panoul de control...</div>
            </div>
          )}

          <div className="a-links">
            <Link href="/login" className="a-link">← Înapoi la autentificare</Link>
          </div>
        </div>

        <WhatsAppWidget />
        <Footer />
      </div>
    </>
  )
}
