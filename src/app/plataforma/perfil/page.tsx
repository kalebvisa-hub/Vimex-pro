'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Loader2, Save, KeyRound, User } from 'lucide-react'

export default function PerfilPage() {
  const supabase = createClient()
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const [msg,        setMsg]        = useState('')
  const [msgPass,    setMsgPass]    = useState('')

  const [nombre,   setNombre]   = useState('')
  const [apellido, setApellido] = useState('')
  const [telefono, setTelefono] = useState('')
  const [empresa,  setEmpresa]  = useState('')
  const [email,    setEmail]    = useState('')
  const [plan,     setPlan]     = useState('')

  const [newPass,     setNewPass]     = useState('')
  const [confirmPass, setConfirmPass] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email || '')
      const { data: p } = await supabase.from('perfiles').select('*').eq('id', user.id).single()
      if (p) { setNombre(p.nombre||''); setApellido(p.apellido||''); setTelefono(p.telefono||''); setEmpresa(p.empresa||''); setPlan(p.plan||'gratuito') }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMsg('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('perfiles').upsert({ id: user.id, nombre, apellido, telefono, empresa })
    setMsg(error ? '❌ Error al guardar' : '✅ Perfil actualizado')
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  const handlePass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPass !== confirmPass) { setMsgPass('❌ Las contraseñas no coinciden'); return }
    if (newPass.length < 8) { setMsgPass('❌ Mínimo 8 caracteres'); return }
    setSavingPass(true); setMsgPass('')
    const { error } = await supabase.auth.updateUser({ password: newPass })
    setMsgPass(error ? '❌ ' + error.message : '✅ Contraseña actualizada')
    setSavingPass(false); setNewPass(''); setConfirmPass('')
    setTimeout(() => setMsgPass(''), 4000)
  }

  const initials = [nombre?.[0], apellido?.[0]].filter(Boolean).join('').toUpperCase() || '?'
  const planColors: Record<string, string> = { gratuito: 'bg-gray-100 text-gray-700', pro: 'bg-blue-100 text-blue-700', empresa: 'bg-purple-100 text-purple-700' }

  if (loading) return <div className="flex items-center justify-center h-full"><div className="w-7 h-7 border-2 border-[#2E7D56] border-t-transparent rounded-full animate-spin"></div></div>

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-7">
        <h1 className="font-[family-name:var(--font-outfit)] font-black text-2xl">Mi Perfil</h1>
        <p className="text-sm text-[#6b7c72] mt-1">Gestiona tu información personal y preferencias</p>
      </div>

      {/* Avatar + plan */}
      <div className="bg-white rounded-xl border border-[#e2e8e4] p-5 mb-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2E7D56] to-[#4CAF7D] flex items-center justify-center text-white text-xl font-black flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1">
          <p className="font-semibold">{[nombre, apellido].filter(Boolean).join(' ') || 'Sin nombre'}</p>
          <p className="text-xs text-[#9ab0a2] mt-0.5">{email}</p>
          <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1.5 capitalize ${planColors[plan] || planColors.gratuito}`}>Plan {plan}</span>
        </div>
      </div>

      {/* Datos personales */}
      <div className="bg-white rounded-xl border border-[#e2e8e4] p-6 mb-5">
        <div className="flex items-center gap-2 mb-5">
          <User size={16} className="text-[#2E7D56]" />
          <h2 className="font-semibold text-sm">Información Personal</h2>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5">Nombre</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#e2e8e4] rounded-lg text-sm focus:outline-none focus:border-[#2E7D56]" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Apellido</label>
              <input value={apellido} onChange={e => setApellido(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#e2e8e4] rounded-lg text-sm focus:outline-none focus:border-[#2E7D56]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">Correo electrónico</label>
            <input value={email} disabled
              className="w-full px-3 py-2.5 border border-[#e2e8e4] rounded-lg text-sm bg-[#f8faf9] text-[#9ab0a2] cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">Teléfono</label>
            <input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="+591 ..."
              className="w-full px-3 py-2.5 border border-[#e2e8e4] rounded-lg text-sm focus:outline-none focus:border-[#2E7D56]" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">Empresa (opcional)</label>
            <input value={empresa} onChange={e => setEmpresa(e.target.value)} placeholder="Mi Empresa S.R.L."
              className="w-full px-3 py-2.5 border border-[#e2e8e4] rounded-lg text-sm focus:outline-none focus:border-[#2E7D56]" />
          </div>
          {msg && <p className={`text-xs px-3 py-2 rounded-lg ${msg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg}</p>}
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2E7D56] text-white text-sm font-semibold rounded-lg hover:bg-[#1A4D35] transition-colors disabled:opacity-60">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Guardar cambios
          </button>
        </form>
      </div>

      {/* Cambiar contraseña */}
      <div className="bg-white rounded-xl border border-[#e2e8e4] p-6">
        <div className="flex items-center gap-2 mb-5">
          <KeyRound size={16} className="text-[#2E7D56]" />
          <h2 className="font-semibold text-sm">Cambiar Contraseña</h2>
        </div>
        <form onSubmit={handlePass} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5">Nueva contraseña</label>
            <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Mínimo 8 caracteres"
              className="w-full px-3 py-2.5 border border-[#e2e8e4] rounded-lg text-sm focus:outline-none focus:border-[#2E7D56]" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">Confirmar contraseña</label>
            <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Repite la contraseña"
              className="w-full px-3 py-2.5 border border-[#e2e8e4] rounded-lg text-sm focus:outline-none focus:border-[#2E7D56]" />
          </div>
          {msgPass && <p className={`text-xs px-3 py-2 rounded-lg ${msgPass.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msgPass}</p>}
          <button type="submit" disabled={savingPass}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2E7D56] text-white text-sm font-semibold rounded-lg hover:bg-[#1A4D35] transition-colors disabled:opacity-60">
            {savingPass ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
            Actualizar contraseña
          </button>
        </form>
      </div>
    </div>
  )
}
