'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'

const ESTADO: Record<string, { label: string; color: string }> = {
  registrado:  { label: 'Registrado',  color: 'bg-gray-100 text-gray-700' },
  en_transito: { label: 'En Tránsito', color: 'bg-blue-100 text-blue-700' },
  en_aduana:   { label: 'En Aduana',   color: 'bg-yellow-100 text-yellow-700' },
  liberado:    { label: 'Liberado',    color: 'bg-green-100 text-green-700' },
  entregado:   { label: 'Entregado',   color: 'bg-emerald-100 text-emerald-700' },
}
type Filtro = 'todos' | 'activos' | 'aduana' | 'entregados'
interface Evento { id: number; estado_nuevo: string; descripcion?: string; ubicacion?: string; created_at: string }
interface Envio  { id: number; tracking_code?: string; codigo_tracking?: string; descripcion?: string; estado?: string; valor_fob_usd?: number; peso_kg?: number; origen?: string; destino?: string; fecha_llegada?: string; created_at: string; envio_eventos?: Evento[] }

export default function EnviosPage() {
  const supabase = createClient()
  const [envios,   setEnvios]   = useState<Envio[]>([])
  const [loading,  setLoading]  = useState(true)
  const [filtro,   setFiltro]   = useState<Filtro>('todos')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [now] = useState(() => Date.now())

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('envios').select('*, envio_eventos(*)').eq('user_id', user.id).order('created_at', { ascending: false })
      setEnvios(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const ACTIVOS = ['registrado','en_transito','liberado']
  const filtered = filtro === 'activos'    ? envios.filter(e => ACTIVOS.includes(e.estado||''))
                 : filtro === 'aduana'     ? envios.filter(e => e.estado === 'en_aduana')
                 : filtro === 'entregados' ? envios.filter(e => e.estado === 'entregado')
                 : envios

  const tabs: { key: Filtro; label: string; count: number }[] = [
    { key: 'todos',      label: 'Todos',      count: envios.length },
    { key: 'activos',    label: 'Activos',    count: envios.filter(e => ACTIVOS.includes(e.estado||'')).length },
    { key: 'aduana',     label: 'En Aduana',  count: envios.filter(e => e.estado==='en_aduana').length },
    { key: 'entregados', label: 'Entregados', count: envios.filter(e => e.estado==='entregado').length },
  ]

  const fmtFecha = (d: string) => new Date(d).toLocaleDateString('es-BO', { day:'2-digit', month:'short', year:'numeric' })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-outfit)] font-black text-2xl">Mis Envíos</h1>
        <p className="text-sm text-[#6b7c72] mt-1">Rastrea y gestiona todos tus envíos internacionales</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[#e2e8e4] mb-5">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFiltro(t.key)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${filtro === t.key ? 'border-[#2E7D56] text-[#2E7D56]' : 'border-transparent text-[#6b7c72] hover:text-[#0f1f17]'}`}>
            {t.label} <span className="ml-1 text-xs opacity-70">({t.count})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-7 h-7 border-2 border-[#2E7D56] border-t-transparent rounded-full animate-spin"></div></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-[#e2e8e4]">
          <Package size={40} className="mx-auto text-[#e2e8e4] mb-4" />
          <p className="text-sm font-semibold">No hay envíos en esta categoría</p>
          <p className="text-xs text-[#9ab0a2] mt-1">Crea una cotización para iniciar un envío</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(e => {
            const st  = ESTADO[e.estado||''] || { label: e.estado||'—', color: 'bg-gray-100 text-gray-600' }
            const tc  = e.tracking_code || e.codigo_tracking || '—'
            const eta = e.fecha_llegada ? Math.ceil((new Date(e.fecha_llegada).getTime() - now) / 86400000) : null
            const eventos = (e.envio_eventos || []).sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            const isOpen  = expanded === e.id

            return (
              <div key={e.id} className="bg-white rounded-xl border border-[#e2e8e4] overflow-hidden">
                {/* Row */}
                <div className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{e.descripcion || 'Sin descripción'}</p>
                    <p className="text-[0.68rem] font-mono text-[#9ab0a2] mt-0.5">{tc}</p>
                  </div>
                  <div className="hidden sm:block text-xs text-[#6b7c72]">{e.origen||e.valor_fob_usd ? `$${e.valor_fob_usd?.toFixed(2)}` : '—'}</div>
                  <span className={`text-[0.68rem] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${st.color}`}>{st.label}</span>
                  {eta !== null && eta > 0 && <span className="text-xs text-[#6b7c72] hidden md:block">{eta}d</span>}
                  <button onClick={() => setExpanded(isOpen ? null : e.id)} className="p-1.5 rounded-lg hover:bg-[#f8faf9] text-[#9ab0a2]">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {/* Expand */}
                {isOpen && (
                  <div className="border-t border-[#f0f7f3] p-5 bg-[#fafcfb] grid md:grid-cols-2 gap-5">
                    {/* Timeline */}
                    <div>
                      <p className="text-xs font-bold mb-3 text-[#0f1f17]">📍 Seguimiento</p>
                      {eventos.length === 0 ? (
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#2E7D56] flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-white text-[0.6rem]">✓</span></div>
                          <div>
                            <p className="text-xs font-semibold">Envío registrado</p>
                            <p className="text-[0.68rem] text-[#9ab0a2]">{fmtFecha(e.created_at)}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {eventos.map(ev => (
                            <div key={ev.id} className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-[#2E7D56] flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-white text-[0.6rem]">✓</span></div>
                              <div>
                                <p className="text-xs font-semibold">{ev.descripcion || ev.estado_nuevo}</p>
                                <p className="text-[0.68rem] text-[#9ab0a2]">{fmtFecha(ev.created_at)}{ev.ubicacion && ` · ${ev.ubicacion}`}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div>
                      <p className="text-xs font-bold mb-3 text-[#0f1f17]">📋 Información</p>
                      <div className="space-y-2">
                        {[
                          ['Código tracking', tc],
                          ['Origen', e.origen || '—'],
                          ['Destino', e.destino || '—'],
                          ['Valor FOB', e.valor_fob_usd ? `$${e.valor_fob_usd.toFixed(2)}` : '—'],
                          ['Peso', e.peso_kg ? `${e.peso_kg} kg` : '—'],
                          ['Creado', fmtFecha(e.created_at)],
                        ].map(([l, v]) => (
                          <div key={l} className="flex justify-between text-xs">
                            <span className="text-[#6b7c72]">{l}</span>
                            <span className="font-semibold text-right">{v}</span>
                          </div>
                        ))}
                      </div>
                      {e.estado === 'en_aduana' && (
                        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-700">
                          <strong>⚠️ Acción requerida:</strong> Tu envío está en aduana. Contacta a tu asesor VIMEX.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
