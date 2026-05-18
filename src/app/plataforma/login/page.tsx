'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

type Tab = 'login' | 'register'

export default function LoginPage() {
  const [tab, setTab]         = useState<Tab>('login')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [msg, setMsg]         = useState<{ text: string; type: 'error' | 'success' | 'info' } | null>(null)
  const supabase = createClient()
  const router   = useRouter()

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass,  setLoginPass]  = useState('')

  // Register fields
  const [regNombre,   setRegNombre]   = useState('')
  const [regApellido, setRegApellido] = useState('')
  const [regEmail,    setRegEmail]    = useState('')
  const [regPass,     setRegPass]     = useState('')
  const [regTipo,     setRegTipo]     = useState('personal')
  const [regTerms,    setRegTerms]    = useState(false)

  const showMsg = (text: string, type: 'error' | 'success' | 'info') => setMsg({ text, type })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setMsg(null)
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPass })
    if (error) {
      showMsg(error.message.includes('Invalid') ? 'Correo o contraseña incorrectos.' : error.message, 'error')
      setLoading(false)
    } else {
      router.push('/plataforma/dashboard')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (regPass.length < 8) { showMsg('La contraseña debe tener al menos 8 caracteres.', 'error'); return }
    if (!regTerms) { showMsg('Debes aceptar los Términos de Uso.', 'error'); return }
    setLoading(true); setMsg(null)
    const { error } = await supabase.auth.signUp({
      email: regEmail, password: regPass,
      options: { data: { nombre: regNombre, apellido: regApellido, tipo_cuenta: regTipo } }
    })
    if (error) {
      showMsg(error.message.includes('already') ? 'Este correo ya está registrado.' : error.message, 'error')
    } else {
      showMsg('¡Cuenta creada! Revisa tu correo para confirmar.', 'success')
      setTimeout(() => setTab('login'), 3000)
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setMsg(null)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/plataforma/callback` }
    })
  }

  const handleForgotPass = async () => {
    if (!loginEmail) { showMsg('Ingresa tu correo primero.', 'info'); return }
    const { error } = await supabase.auth.resetPasswordForEmail(loginEmail, {
      redirectTo: `${window.location.origin}/plataforma/login?modo=reset`
    })
    if (error) showMsg(error.message, 'error')
    else showMsg(`Email de recuperación enviado a ${loginEmail}.`, 'success')
  }

  const msgColors = { error: 'bg-red-50 text-red-700 border border-red-200', success: 'bg-green-50 text-green-700 border border-green-200', info: 'bg-blue-50 text-blue-700 border border-blue-200' }

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col items-center justify-center p-6">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2.5 mb-7">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2E7D56] to-[#4CAF7D] flex items-center justify-center text-white text-sm">📦</div>
        <span className="font-[family-name:var(--font-outfit)] font-black text-xl text-[#0f1f17]">VIMEX</span>
      </Link>

      <div className="w-full max-w-sm bg-white border border-[#e2e8e4] rounded-2xl p-8 shadow-sm">
        {/* Tabs */}
        <div className="flex bg-[#f8faf9] rounded-lg p-1 mb-6">
          {(['login','register'] as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); setMsg(null) }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${tab === t ? 'bg-white shadow-sm text-[#0f1f17]' : 'text-[#6b7c72] hover:text-[#0f1f17]'}`}>
              {t === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          ))}
        </div>

        {msg && (
          <div className={`text-xs px-3 py-2.5 rounded-lg mb-4 ${msgColors[msg.type]}`}>{msg.text}</div>
        )}

        {tab === 'login' ? (
          <>
            <h1 className="font-[family-name:var(--font-outfit)] font-black text-xl mb-1">Bienvenido de nuevo</h1>
            <p className="text-sm text-[#6b7c72] mb-5">Ingresa a tu cuenta VIMEX</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Correo electrónico</label>
                <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full px-3 py-2.5 border border-[#e2e8e4] rounded-lg text-sm focus:outline-none focus:border-[#2E7D56] transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Contraseña</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} required value={loginPass} onChange={e => setLoginPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 border border-[#e2e8e4] rounded-lg text-sm focus:outline-none focus:border-[#2E7D56] transition-colors pr-10" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ab0a2]">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <button type="button" onClick={handleForgotPass} className="text-xs text-[#2E7D56] font-medium mt-1.5 block ml-auto">¿Olvidaste tu contraseña?</button>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-[#2E7D56] to-[#4CAF7D] text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity hover:opacity-90">
                {loading ? <Loader2 size={15} className="animate-spin" /> : null}
                Iniciar sesión
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="font-[family-name:var(--font-outfit)] font-black text-xl mb-1">Crear cuenta</h1>
            <p className="text-sm text-[#6b7c72] mb-5">Comienza a importar gratis hoy</p>
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Nombre</label>
                  <input type="text" required value={regNombre} onChange={e => setRegNombre(e.target.value)} placeholder="Carlos"
                    className="w-full px-3 py-2.5 border border-[#e2e8e4] rounded-lg text-sm focus:outline-none focus:border-[#2E7D56]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Apellido</label>
                  <input type="text" required value={regApellido} onChange={e => setRegApellido(e.target.value)} placeholder="Mendoza"
                    className="w-full px-3 py-2.5 border border-[#e2e8e4] rounded-lg text-sm focus:outline-none focus:border-[#2E7D56]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Correo electrónico</label>
                <input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="tu@correo.com"
                  className="w-full px-3 py-2.5 border border-[#e2e8e4] rounded-lg text-sm focus:outline-none focus:border-[#2E7D56]" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Contraseña</label>
                <input type="password" required value={regPass} onChange={e => setRegPass(e.target.value)} placeholder="Mínimo 8 caracteres"
                  className="w-full px-3 py-2.5 border border-[#e2e8e4] rounded-lg text-sm focus:outline-none focus:border-[#2E7D56]" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Tipo de cuenta</label>
                <select value={regTipo} onChange={e => setRegTipo(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#e2e8e4] rounded-lg text-sm focus:outline-none focus:border-[#2E7D56] bg-white">
                  <option value="personal">Personal — Importo para uso propio</option>
                  <option value="emprendedor">Emprendedor — Pequeño negocio</option>
                  <option value="empresa">Empresa — Gran volumen</option>
                </select>
              </div>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={regTerms} onChange={e => setRegTerms(e.target.checked)} className="mt-0.5 accent-[#2E7D56]" />
                <span className="text-xs text-[#6b7c72] leading-relaxed">
                  Acepto los <a href="#" className="text-[#2E7D56] font-semibold">Términos de Uso</a> y la <a href="#" className="text-[#2E7D56] font-semibold">Política de Privacidad</a>
                </span>
              </label>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-[#2E7D56] to-[#4CAF7D] text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90 transition-opacity">
                {loading ? <Loader2 size={15} className="animate-spin" /> : null}
                Crear cuenta gratis
              </button>
            </form>
          </>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-[#e2e8e4]"></div>
          <span className="text-xs text-[#9ab0a2]">o</span>
          <div className="flex-1 h-px bg-[#e2e8e4]"></div>
        </div>

        {/* Google */}
        <button onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 border border-[#e2e8e4] rounded-lg text-sm font-semibold hover:bg-[#f8faf9] transition-colors">
          <svg width="16" height="16" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continuar con Google
        </button>
      </div>

      <Link href="/" className="mt-5 text-xs text-[#9ab0a2] hover:text-[#2E7D56] transition-colors">← Volver al inicio</Link>
    </div>
  )
}
