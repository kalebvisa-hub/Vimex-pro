'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Package, TrendingUp, Clock, DollarSign, ArrowRight, Plus } from 'lucide-react'
import Link from 'next/link'

const ESTADO_MAP: Record<string, { label: string; color: string }> = {
  registrado:   { label: 'Registrado',   color: 'bg-gray-100 text-gray-700' },
  en_transito:  { label: 'En Tránsito',  color: 'bg-blue-100 text-blue-700' },
  en_aduana:    { label: 'En Aduana',    color: 'bg-yellow-100 text-yellow-700' },
  liberado:     { label: 'Liberado',     color: 'bg-green-100 text-green-700' },
  entregado:    { label: 'Entregado',    color: 'bg-emerald-100 text-emerald-700' },
}

interface Envio { id: number; tracking_code?: string; descripcion?: string; estado?: string; valor_fob_usd?: number; created_at: string }
interface Cotizacion { id: number; categoria?: string; fob_usd?: number; total_usd?: number; created_at: string }
interface Profile { nombre?: string; apellido?: string; plan?: string }

export default function DashboardPage() {
  const supabase = createClient()
  const [profile,     setProfile]     = useState<Profile>({})
  const [envios,      setEnvios]      = useState<Envio[]>([])
  const [cotizaciones,setCotizaciones]= useState<Cotizacion[]>([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: p }, { data: e }, { data: c }] = await Promise.all([
        supabase.from('perfiles').select('nombre,apellido,plan').eq('id', user.id).single(),
        supabase.from('envios').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('cotizaciones').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      ])
      if (p) setProfile(p)
      setEnvios(e || [])
      setCotizaciones(c || [])
      setLoading(false)
    }
    load()
  }, [])

  const nombre = profile.nombre || 'Usuario'
  const totalEnvios     = envios.length
  const enviosActivos   = envios.filter(e => ['en_transito','registrado','en_aduana'].includes(e.estado||'')).length
  const totalCotizado   = cotizaciones.reduce((s, c) => s + (c.total_usd || 0), 0)

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-[#2E7D56] border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-7">
        <h1 className="font-[family-name:var(--font-outfit)] font-black text-2xl text-[#0f1f17]">
          Buenos días, {nombre} 👋
        </h1>
        <p className="text-sm text-[#6b7c72] mt-1">Plan {profile.plan || 'Gratuito'} · Aquí tienes el resumen de tu actividad</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {[
          { icon: Package,     label: 'Envíos totales',  value: totalEnvios,                  color: 'text-blue-600',   bg: 'bg-blue-50' },
          { icon: TrendingUp,  label: 'Envíos activos',  value: enviosActivos,                color: 'text-green-600',  bg: 'bg-green-50' },
          { icon: Clock,       label: 'Cotizaciones',    value: cotizaciones.length,          color: 'text-purple-600', bg: 'bg-purple-50' },
          { icon: DollarSign,  label: 'Total cotizado',  value: `$${totalCotizado.toFixed(0)}`, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-[#e2e8e4] p-4">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-xs text-[#6b7c72] font-medium">{label}</p>
            <p className="font-[family-name:var(--font-outfit)] font-black text-xl text-[#0f1f17] mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Envíos recientes */}
        <div className="bg-white rounded-xl border border-[#e2e8e4] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Envíos recientes</h2>
            <Link href="/plataforma/envios" className="text-xs text-[#2E7D56] font-medium flex items-center gap-1 hover:underline">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          {envios.length === 0 ? (
            <div className="text-center py-8">
              <Package size={32} className="mx-auto text-[#e2e8e4] mb-3" />
              <p className="text-sm text-[#6b7c72]">No tienes envíos aún</p>
              <Link href="/plataforma/calculadora" className="mt-3 inline-flex items-center gap-1.5 text-xs bg-[#2E7D56] text-white px-3 py-1.5 rounded-lg font-medium">
                <Plus size={13} /> Nueva cotización
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {envios.map(e => {
                const st = ESTADO_MAP[e.estado || ''] || { label: e.estado || '—', color: 'bg-gray-100 text-gray-600' }
                return (
                  <div key={e.id} className="flex items-center gap-3 py-2 border-b border-[#f0f7f3] last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#0f1f17] truncate">{e.descripcion || 'Sin descripción'}</p>
                      <p className="text-[0.68rem] text-[#9ab0a2] font-mono">{e.tracking_code || '—'}</p>
                    </div>
                    <span className={`text-[0.68rem] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${st.color}`}>{st.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Cotizaciones recientes */}
        <div className="bg-white rounded-xl border border-[#e2e8e4] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Cotizaciones recientes</h2>
            <Link href="/plataforma/calculadora" className="text-xs text-[#2E7D56] font-medium flex items-center gap-1 hover:underline">
              Nueva <ArrowRight size={12} />
            </Link>
          </div>
          {cotizaciones.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp size={32} className="mx-auto text-[#e2e8e4] mb-3" />
              <p className="text-sm text-[#6b7c72]">No hay cotizaciones aún</p>
              <Link href="/plataforma/calculadora" className="mt-3 inline-flex items-center gap-1.5 text-xs bg-[#2E7D56] text-white px-3 py-1.5 rounded-lg font-medium">
                <Plus size={13} /> Calcular ahora
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {cotizaciones.map(c => (
                <div key={c.id} className="flex items-center gap-3 py-2 border-b border-[#f0f7f3] last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#0f1f17] capitalize">{c.categoria || 'Producto'}</p>
                    <p className="text-[0.68rem] text-[#9ab0a2]">FOB: ${(c.fob_usd || 0).toFixed(2)}</p>
                  </div>
                  <span className="text-xs font-bold text-[#2E7D56]">${(c.total_usd || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
