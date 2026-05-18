'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Search, Loader2, BookmarkPlus, X } from 'lucide-react'

// ── Constantes aduaneras (se sobreescriben desde Supabase) ──
let IVA_TASA       = 0.1494
let SEGURO_TASA    = 0.015
let FLETE_KG       = 4.80
let LIMITE_SIMPLIF = 1000

const TASAS_PAIS: Record<string, { tiempo: string }> = {
  CN: { tiempo: '20–35 días' }, US: { tiempo: '15–25 días' },
  DE: { tiempo: '20–30 días' }, JP: { tiempo: '18–28 días' },
  BR: { tiempo: '15–20 días' }, default: { tiempo: '20–35 días' },
}

const ARANCELES_BASE: Record<string, { ga: number; ice: number }> = {
  electronica: { ga: 0.10, ice: 0 }, ropa: { ga: 0.30, ice: 0 },
  calzado: { ga: 0.30, ice: 0 }, alimentos: { ga: 0.10, ice: 0 },
  bebidas_alc: { ga: 0.10, ice: 0.20 }, tabaco: { ga: 0.20, ice: 0.50 },
  cosmeticos: { ga: 0.20, ice: 0.10 }, maquinaria: { ga: 0.05, ice: 0 },
  herramientas: { ga: 0.10, ice: 0 }, juguetes: { ga: 0.20, ice: 0 },
  automotriz: { ga: 0.10, ice: 0 }, hogar: { ga: 0.20, ice: 0 },
  deportes: { ga: 0.20, ice: 0 }, otros: { ga: 0.15, ice: 0 },
}

interface Resultado {
  fob: number; flete: number; seguro: number; cif: number
  ga: number; ga_tasa: number; iva: number; ice: number
  totalFinal: number; regimen: string; pais: string; categoria: string
  peso: number; cantidad: number
}

interface Partida { partida: string; descripcion_corta: string; ga_pct: number; ice_pct: number }

export default function CalculadoraPage() {
  const supabase = createClient()

  // Form state
  const [url,       setUrl]       = useState('')
  const [pais,      setPais]      = useState('CN')
  const [categoria, setCategoria] = useState('electronica')
  const [valor,     setValor]     = useState('')
  const [cantidad,  setCantidad]  = useState('1')
  const [peso,      setPeso]      = useState('')

  // UI state
  const [scraping,    setScraping]    = useState(false)
  const [scrapeData,  setScrapeData]  = useState<{ titulo: string; imagen: string; precio: number | null; tienda: string } | null>(null)
  const [resultado,   setResultado]   = useState<Resultado | null>(null)
  const [saving,      setSaving]      = useState(false)
  const [savedMsg,    setSavedMsg]    = useState('')
  const [error,       setError]       = useState('')

  // Partida NANDINA
  const [partidaQuery, setPartidaQuery] = useState('')
  const [partidas,     setPartidas]     = useState<Partida[]>([])
  const [showPartidas, setShowPartidas] = useState(false)
  const [selectedPartida, setSelectedPartida] = useState<Partida | null>(null)
  const [aranceles,    setAranceles]    = useState<Partida[]>([])

  useEffect(() => {
    // Cargar parámetros y aranceles
    const load = async () => {
      const [{ data: params }, { data: aranc }] = await Promise.all([
        supabase.from('parametros_aduaneros').select('clave,valor'),
        supabase.from('aranceles_nandina').select('partida,descripcion_corta,ga_pct,ice_pct').limit(2000),
      ])
      params?.forEach(({ clave, valor }: { clave: string; valor: string }) => {
        const v = parseFloat(valor)
        if (isNaN(v)) return
        if (clave === 'iva_pct')        IVA_TASA       = v / 100
        if (clave === 'seguro_pct')     SEGURO_TASA    = v / 100
        if (clave === 'flete_kg_usd')   FLETE_KG       = v
        if (clave === 'limite_simplif') LIMITE_SIMPLIF = v
      })
      if (aranc) setAranceles(aranc)
    }
    load()
  }, [])

  // Búsqueda partida
  const buscarPartida = useCallback((q: string) => {
    setPartidaQuery(q)
    if (q.length < 2) { setPartidas([]); setShowPartidas(false); return }
    const ql = q.toLowerCase()
    const results = aranceles.filter(a =>
      a.descripcion_corta?.toLowerCase().includes(ql) || a.partida?.includes(q)
    ).slice(0, 12)
    setPartidas(results)
    setShowPartidas(results.length > 0)
  }, [aranceles])

  const scrapeURL = async () => {
    if (!url.trim()) return
    setScraping(true); setScrapeData(null)
    try {
      const res  = await fetch('/api/scrape', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) })
      const data = await res.json()
      setScrapeData(data)
      if (data.pais) setPais(data.pais)
      if (data.precio) { setValor(parseFloat(data.precio).toFixed(2)); calcular(data.precio) }
    } catch { setScrapeData({ titulo: 'Producto', imagen: '', precio: null, tienda: 'Tienda' }) }
    setScraping(false)
  }

  const calcular = (precioOverride?: number) => {
    const v = precioOverride ? parseFloat(String(precioOverride)) : parseFloat(valor)
    if (!v || v <= 0) { setError('Ingresa el valor del producto en USD.'); return }
    setError('')
    const qty = parseInt(cantidad) || 1
    const kg  = parseFloat(peso) || 1
    const tasas = selectedPartida
      ? { ga: selectedPartida.ga_pct / 100, ice: selectedPartida.ice_pct / 100 }
      : (ARANCELES_BASE[categoria] || ARANCELES_BASE.otros)

    const fob    = v * qty
    const seguro = fob * SEGURO_TASA
    const flete  = kg * qty * FLETE_KG
    const cif    = fob + seguro + flete
    const ga     = cif * tasas.ga
    const iva    = (cif + ga) * IVA_TASA
    const ice    = cif * tasas.ice
    const total  = fob + ga + iva + ice + flete + seguro

    setResultado({ fob, flete, seguro, cif, ga, ga_tasa: tasas.ga, iva, ice, totalFinal: total, regimen: fob <= LIMITE_SIMPLIF ? 'simplificado' : 'formal', pais, categoria, peso: kg, cantidad: qty })
  }

  const guardar = async () => {
    if (!resultado) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const c = resultado
    const { error: err } = await supabase.from('cotizaciones').insert({
      user_id: user.id, pais_origen: c.pais, categoria: c.categoria,
      fob_usd: +c.fob.toFixed(2), valor_fob_usd: +c.fob.toFixed(2),
      envio_usd: +c.flete.toFixed(2), seguro_usd: +c.seguro.toFixed(2),
      cif_usd: +c.cif.toFixed(2), peso_kg: c.peso * c.cantidad,
      ga_porcentaje: +(c.ga_tasa * 100).toFixed(2), ga_monto_usd: +c.ga.toFixed(2),
      arancel_usd: +c.ga.toFixed(2), iva_monto_usd: +c.iva.toFixed(2),
      iva_usd: +c.iva.toFixed(2), ice_usd: +c.ice.toFixed(2),
      flete_usd: +c.flete.toFixed(2), honorarios_usd: 0,
      total_usd: +c.totalFinal.toFixed(2), tributos_bs: +(c.totalFinal * 6.96).toFixed(2), estado: 'borrador',
    })
    setSaving(false)
    setSavedMsg(err ? 'Error al guardar' : '✅ Cotización guardada')
    setTimeout(() => setSavedMsg(''), 3000)
  }

  const fmt  = (n: number) => '$' + n.toFixed(2)
  const fmtP = (n: number) => (n * 100).toFixed(1) + '%'

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-outfit)] font-black text-2xl text-[#0f1f17]">Calculadora de Costos</h1>
        <p className="text-sm text-[#6b7c72] mt-1">Calcula aranceles (GA), IVA e ICE según normativa boliviana 2026</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-5">
        {/* Formulario */}
        <div className="space-y-4">
          {/* URL scraper */}
          <div className="bg-white rounded-xl border border-[#e2e8e4] p-5">
            <h2 className="text-sm font-semibold mb-1">🔗 ¿Tienes un link del producto?</h2>
            <p className="text-xs text-[#9ab0a2] mb-3">Pega la URL de AliExpress, Amazon, Alibaba, Temu, etc.</p>
            <div className="flex gap-2">
              <input value={url} onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && scrapeURL()}
                placeholder="https://www.aliexpress.com/item/..."
                className="flex-1 px-3 py-2.5 border border-[#e2e8e4] rounded-lg text-sm focus:outline-none focus:border-[#2E7D56]" />
              <button onClick={scrapeURL} disabled={scraping}
                className="px-4 py-2.5 bg-[#2E7D56] text-white text-sm font-semibold rounded-lg flex items-center gap-2 disabled:opacity-60 hover:bg-[#1A4D35] transition-colors">
                {scraping ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                Obtener
              </button>
            </div>
            {scrapeData && (
              <div className="mt-3 flex gap-3 p-3 bg-[#f8faf9] rounded-lg border border-[#e2e8e4]">
                {scrapeData.imagen && <img src={scrapeData.imagen} alt="" className="w-14 h-14 object-cover rounded-lg flex-shrink-0 bg-gray-100" onError={e => (e.currentTarget.style.display='none')} />}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#0f1f17] line-clamp-2">{scrapeData.titulo}</p>
                  <p className="text-[0.68rem] text-[#9ab0a2] mt-0.5">🌍 {scrapeData.tienda}</p>
                  {scrapeData.precio
                    ? <p className="text-sm font-black text-[#2E7D56] mt-1">${scrapeData.precio.toFixed(2)} USD</p>
                    : <p className="text-xs text-orange-500 mt-1">⚠️ Precio no detectado — ingrésalo abajo</p>
                  }
                </div>
                <button onClick={() => setScrapeData(null)} className="text-[#9ab0a2] hover:text-red-500 flex-shrink-0"><X size={14} /></button>
              </div>
            )}
          </div>

          {/* Datos producto */}
          <div className="bg-white rounded-xl border border-[#e2e8e4] p-5">
            <h2 className="text-sm font-semibold mb-4">🌍 Datos del Producto</h2>

            {/* Buscador NANDINA */}
            <div className="relative mb-4">
              <label className="block text-xs font-semibold mb-1.5">Buscar partida arancelaria NANDINA <span className="font-normal text-[#9ab0a2]">(opcional)</span></label>
              <input value={partidaQuery} onChange={e => buscarPartida(e.target.value)}
                placeholder="Ej: celular, zapatos, cerveza..."
                className="w-full px-3 py-2.5 border border-[#e2e8e4] rounded-lg text-sm focus:outline-none focus:border-[#2E7D56]" />
              {selectedPartida && (
                <div className="mt-1.5 flex items-center gap-2 bg-[#E8F5EE] px-3 py-1.5 rounded-lg">
                  <span className="text-xs text-[#2E7D56] font-semibold">{selectedPartida.partida} — {selectedPartida.descripcion_corta}</span>
                  <button onClick={() => { setSelectedPartida(null); setPartidaQuery('') }} className="ml-auto text-[#2E7D56]"><X size={12} /></button>
                </div>
              )}
              {showPartidas && (
                <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-[#e2e8e4] rounded-xl shadow-lg max-h-56 overflow-y-auto">
                  {partidas.map(p => (
                    <button key={p.partida} onClick={() => { setSelectedPartida(p); setShowPartidas(false); setPartidaQuery('') }}
                      className="w-full text-left px-4 py-2.5 text-xs hover:bg-[#f0f7f3] border-b border-[#f8faf9] last:border-0">
                      <span className="font-mono text-[#2E7D56] font-semibold">{p.partida}</span> — {p.descripcion_corta}
                      <span className="ml-2 text-[#9ab0a2]">GA {p.ga_pct}%</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5">País de Origen</label>
                <select value={pais} onChange={e => setPais(e.target.value)} className="w-full px-3 py-2.5 border border-[#e2e8e4] rounded-lg text-sm focus:outline-none focus:border-[#2E7D56] bg-white">
                  <option value="CN">🇨🇳 China</option>
                  <option value="US">🇺🇸 EE.UU.</option>
                  <option value="BR">🇧🇷 Brasil</option>
                  <option value="DE">🇩🇪 Alemania</option>
                  <option value="JP">🇯🇵 Japón</option>
                  <option value="MX">🇲🇽 México</option>
                  <option value="KR">🇰🇷 Corea del Sur</option>
                  <option value="IT">🇮🇹 Italia</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Categoría</label>
                <select value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full px-3 py-2.5 border border-[#e2e8e4] rounded-lg text-sm focus:outline-none focus:border-[#2E7D56] bg-white">
                  <option value="electronica">📱 Electrónica</option>
                  <option value="ropa">👕 Ropa y Textiles</option>
                  <option value="calzado">👟 Calzado</option>
                  <option value="alimentos">🍎 Alimentos</option>
                  <option value="bebidas_alc">🍺 Bebidas Alcohólicas</option>
                  <option value="tabaco">🚬 Tabaco</option>
                  <option value="cosmeticos">💄 Cosméticos</option>
                  <option value="maquinaria">⚙️ Maquinaria</option>
                  <option value="herramientas">🔧 Herramientas</option>
                  <option value="juguetes">🧸 Juguetes</option>
                  <option value="automotriz">🚗 Automotriz</option>
                  <option value="hogar">🏠 Hogar</option>
                  <option value="deportes">⚽ Deportes</option>
                  <option value="otros">📦 Otros</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Valor por Unidad (USD)</label>
                <input type="number" value={valor} onChange={e => setValor(e.target.value)} placeholder="50.00" min="0.01" step="0.01"
                  className="w-full px-3 py-2.5 border border-[#e2e8e4] rounded-lg text-sm focus:outline-none focus:border-[#2E7D56]" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Cantidad</label>
                <input type="number" value={cantidad} onChange={e => setCantidad(e.target.value)} min="1"
                  className="w-full px-3 py-2.5 border border-[#e2e8e4] rounded-lg text-sm focus:outline-none focus:border-[#2E7D56]" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Peso Total (kg)</label>
                <input type="number" value={peso} onChange={e => setPeso(e.target.value)} placeholder="5.5" min="0.1" step="0.1"
                  className="w-full px-3 py-2.5 border border-[#e2e8e4] rounded-lg text-sm focus:outline-none focus:border-[#2E7D56]" />
              </div>
            </div>

            {error && <p className="mt-3 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <div className="flex gap-3 mt-5">
              <button onClick={() => calcular()} className="flex-1 py-3 bg-gradient-to-r from-[#2E7D56] to-[#4CAF7D] text-white font-bold rounded-xl text-sm hover:opacity-90 transition-opacity">
                🧮 Calcular Ahora
              </button>
              {resultado && (
                <button onClick={guardar} disabled={saving}
                  className="px-4 py-3 border border-[#2E7D56] text-[#2E7D56] font-semibold rounded-xl text-sm flex items-center gap-2 hover:bg-[#E8F5EE] transition-colors disabled:opacity-60">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <BookmarkPlus size={14} />}
                  Guardar
                </button>
              )}
            </div>
            {savedMsg && <p className="text-xs text-green-600 mt-2 text-center">{savedMsg}</p>}
          </div>

          {/* Info tasas */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: '🏛️', label: 'IVA importación', value: '14.94%' },
              { icon: '✈️', label: 'Flete aéreo', value: '$4.80/kg' },
              { icon: '🔒', label: 'Seguro', value: '1.5% FOB' },
              { icon: '🏦', label: 'GA promedio', value: '5–30%' },
              { icon: '💱', label: 'Tipo de cambio', value: 'Bs 6.96' },
              { icon: '⚠️', label: 'ICE bebidas/tabaco', value: '10–50%' },
            ].map(({ icon, label, value }) => (
              <div key={label} className="bg-white rounded-xl border border-[#e2e8e4] p-3 text-center">
                <div className="text-lg mb-1">{icon}</div>
                <p className="text-[0.65rem] text-[#9ab0a2] font-medium leading-tight">{label}</p>
                <p className="text-xs font-black text-[#0f1f17] mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Resultado */}
        <div>
          {!resultado ? (
            <div className="bg-white rounded-xl border border-[#e2e8e4] p-10 text-center h-full flex flex-col items-center justify-center">
              <div className="text-4xl mb-3">🧮</div>
              <p className="text-sm font-semibold text-[#0f1f17]">Sin resultados aún</p>
              <p className="text-xs text-[#9ab0a2] mt-1">Ingresa los datos del producto y haz clic en Calcular</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#e2e8e4] p-5 space-y-3 sticky top-6">
              {/* Régimen */}
              <div className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${resultado.regimen === 'simplificado' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                {resultado.regimen === 'simplificado' ? '✅ Régimen Simplificado (≤$1,000)' : '📋 Régimen Formal / DUI (>$1,000)'}
              </div>

              {/* Tiempo */}
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-[#6b7c72]">Tiempo estimado</span>
                <span className="font-semibold">{TASAS_PAIS[resultado.pais]?.tiempo || TASAS_PAIS.default.tiempo}</span>
              </div>

              <div className="border-t border-[#f0f7f3] pt-3 space-y-2">
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[#9ab0a2]">1 · Logística</p>
                {[
                  ['FOB (precio × cantidad)', fmt(resultado.fob)],
                  ['Flete internacional', fmt(resultado.flete)],
                  ['Seguro de carga', fmt(resultado.seguro)],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-xs"><span className="text-[#6b7c72]">{l}</span><span className="font-semibold">{v}</span></div>
                ))}
                <div className="flex justify-between text-xs font-bold bg-[#f8faf9] px-2 py-1.5 rounded-lg">
                  <span>= Valor CIF</span><span>{fmt(resultado.cif)}</span>
                </div>
              </div>

              <div className="border-t border-[#f0f7f3] pt-3 space-y-2">
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[#9ab0a2]">2 · Tributos</p>
                {[
                  [`GA — Gravamen (${fmtP(resultado.ga_tasa)})`, fmt(resultado.ga)],
                  ['IVA (14.94% sobre CIF+GA)', fmt(resultado.iva)],
                  ...(resultado.ice > 0 ? [[`ICE`, fmt(resultado.ice)]] : []),
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-xs"><span className="text-[#6b7c72]">{l}</span><span className="font-semibold text-blue-600">{v}</span></div>
                ))}
                <div className="flex justify-between text-xs font-bold bg-blue-50 px-2 py-1.5 rounded-lg text-blue-700">
                  <span>= Total tributos</span><span>{fmt(resultado.ga + resultado.iva + resultado.ice)}</span>
                </div>
              </div>

              {/* TOTAL */}
              <div className="border-t border-[#f0f7f3] pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-[#0f1f17]">TOTAL ESTIMADO</span>
                  <span className="font-[family-name:var(--font-outfit)] font-black text-xl text-[#2E7D56]">{fmt(resultado.totalFinal)}</span>
                </div>
                <p className="text-right text-xs text-[#9ab0a2] mt-0.5">≈ Bs {(resultado.totalFinal * 6.96).toFixed(0)}</p>
              </div>

              {/* Barras */}
              <div className="border-t border-[#f0f7f3] pt-3 space-y-2.5">
                <p className="text-xs font-semibold text-[#0f1f17]">¿En qué va tu dinero?</p>
                {[
                  { label: '🛍️ Producto', val: resultado.fob, color: 'bg-[#2E7D56]' },
                  { label: '🏛️ Tributos', val: resultado.ga + resultado.iva + resultado.ice, color: 'bg-blue-500' },
                  { label: '✈️ Logística', val: resultado.flete + resultado.seguro, color: 'bg-orange-400' },
                ].map(({ label, val, color }) => {
                  const pct = ((val / resultado.totalFinal) * 100).toFixed(1)
                  return (
                    <div key={label}>
                      <div className="flex justify-between text-[0.68rem] mb-1">
                        <span className="text-[#6b7c72]">{label}</span>
                        <span className="font-semibold">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-[#f0f7f3] rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <p className="text-[0.65rem] text-[#9ab0a2] bg-[#f8faf9] p-2.5 rounded-lg leading-relaxed">
                ⚠️ Estimación referencial. Los valores reales pueden variar según canal de aforo y partida arancelaria exacta.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
