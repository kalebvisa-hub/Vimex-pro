'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Search, Star, Globe, ExternalLink } from 'lucide-react'

interface Proveedor { id: number; nombre: string; pais?: string; categoria?: string; descripcion?: string; rating?: number; sitio_web?: string; logo_url?: string; es_verificado?: boolean }

const CATS = ['Todos','Electrónica','Ropa','Calzado','Maquinaria','Alimentos','Cosméticos','Hogar','Otros']
const PAISES: Record<string,string> = { CN:'🇨🇳 China', US:'🇺🇸 EE.UU.', DE:'🇩🇪 Alemania', JP:'🇯🇵 Japón', KR:'🇰🇷 Corea', IN:'🇮🇳 India', IT:'🇮🇹 Italia', BR:'🇧🇷 Brasil' }

export default function ProveedoresPage() {
  const supabase = createClient()
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading,     setLoading]     = useState(true)
  const [busqueda,    setBusqueda]    = useState('')
  const [catFilter,   setCatFilter]   = useState('Todos')

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('proveedores').select('*').order('nombre')
      if (data && data.length > 0) {
        setProveedores(data)
      } else {
        // Demo data
        setProveedores([
          { id:1, nombre:'Shenzhen Electronics Co.', pais:'CN', categoria:'Electrónica', descripcion:'Mayorista de gadgets y electrónica de consumo', rating:4.8, es_verificado:true },
          { id:2, nombre:'Shanghai Textile Group', pais:'CN', categoria:'Ropa', descripcion:'Fabricante de ropa y textiles para exportación', rating:4.6, es_verificado:true },
          { id:3, nombre:'Tokyo Parts Supply', pais:'JP', categoria:'Maquinaria', descripcion:'Repuestos industriales y maquinaria de precisión', rating:4.9, es_verificado:true },
          { id:4, nombre:'Berlin Cosmetics GmbH', pais:'DE', categoria:'Cosméticos', descripcion:'Cosméticos y cuidado personal certificados', rating:4.7, es_verificado:false },
          { id:5, nombre:'Mumbai Garments Ltd', pais:'IN', categoria:'Ropa', descripcion:'Prendas de vestir y accesorios de moda', rating:4.4, es_verificado:true },
          { id:6, nombre:'Seoul Tech Corp', pais:'KR', categoria:'Electrónica', descripcion:'Componentes electrónicos y semiconductores', rating:4.8, es_verificado:true },
        ])
      }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = proveedores.filter(p => {
    const matchSearch = !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    const matchCat    = catFilter === 'Todos' || p.categoria === catFilter
    return matchSearch && matchCat
  })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-outfit)] font-black text-2xl">Proveedores</h1>
        <p className="text-sm text-[#6b7c72] mt-1">Proveedores verificados para tus importaciones</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-[#e2e8e4] p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ab0a2]" />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar proveedor..."
            className="w-full pl-9 pr-3 py-2.5 border border-[#e2e8e4] rounded-lg text-sm focus:outline-none focus:border-[#2E7D56]" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="px-3 py-2.5 border border-[#e2e8e4] rounded-lg text-sm focus:outline-none focus:border-[#2E7D56] bg-white">
          {CATS.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-7 h-7 border-2 border-[#2E7D56] border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-[#e2e8e4] p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center text-lg flex-shrink-0">
                  {p.logo_url ? <img src={p.logo_url} alt="" className="w-full h-full object-cover rounded-xl" /> : '🏭'}
                </div>
                {p.es_verificado && (
                  <span className="text-[0.65rem] bg-[#E8F5EE] text-[#2E7D56] font-semibold px-2 py-0.5 rounded-full">✓ Verificado</span>
                )}
              </div>
              <h3 className="font-semibold text-sm text-[#0f1f17] mb-1">{p.nombre}</h3>
              <p className="text-xs text-[#6b7c72] mb-3 line-clamp-2">{p.descripcion}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-[#9ab0a2]">
                  <span className="flex items-center gap-1"><Globe size={11} />{PAISES[p.pais||''] || p.pais || '—'}</span>
                  {p.rating && <span className="flex items-center gap-0.5"><Star size={11} className="text-yellow-400 fill-yellow-400" />{p.rating}</span>}
                </div>
                {p.sitio_web && (
                  <a href={p.sitio_web} target="_blank" rel="noopener" className="p-1.5 rounded-lg hover:bg-[#f0f7f3] text-[#9ab0a2] hover:text-[#2E7D56]">
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-[#f0f7f3]">
                <span className="text-[0.68rem] bg-[#f0f7f3] text-[#6b7c72] px-2 py-0.5 rounded-full font-medium">{p.categoria || 'General'}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-12 text-[#9ab0a2] text-sm">
              No se encontraron proveedores con ese criterio
            </div>
          )}
        </div>
      )}
    </div>
  )
}
