import Link from 'next/link'
import { Calculator, Package, Search, Shield, TrendingUp, Clock, CheckCircle, ArrowRight } from 'lucide-react'

const FEATURES = [
  { icon: Calculator, title: 'Calculadora de Tributos', desc: 'Aranceles GA, IVA e ICE calculados al instante según normativa boliviana 2026.' },
  { icon: Package, title: 'Tracking en Tiempo Real', desc: 'Seguimiento de tus envíos desde origen hasta tu puerta con notificaciones automáticas.' },
  { icon: Search, title: 'Proveedores Verificados', desc: 'Directorio de proveedores confiables de China, USA, Europa y más.' },
  { icon: Shield, title: 'Asesoría Experta', desc: 'Equipo especializado en comercio exterior y normativa aduanera boliviana.' },
  { icon: TrendingUp, title: 'Cotizaciones Guardadas', desc: 'Guarda y compara múltiples cotizaciones para optimizar tus importaciones.' },
  { icon: Clock, title: 'Tiempos Reales', desc: 'Estimaciones precisas de tránsito aéreo, marítimo y terrestre.' },
]

const PLANS = [
  { name: 'Gratuito', price: '0', desc: 'Para importadores ocasionales', features: ['3 cotizaciones/mes', 'Tracking básico', 'Calculadora de tributos', 'Soporte email'], cta: 'Crear cuenta gratis', popular: false },
  { name: 'Pro', price: '29', desc: 'Para emprendedores y PYMEs', features: ['Cotizaciones ilimitadas', 'Tracking avanzado', 'Historial completo', 'Proveedores premium', 'Soporte prioritario'], cta: 'Comenzar prueba Pro', popular: true },
  { name: 'Empresa', price: '99', desc: 'Para grandes importadores', features: ['Todo lo de Pro', 'Múltiples usuarios', 'API de integración', 'Asesoría dedicada', 'Reportes avanzados'], cta: 'Contactar ventas', popular: false },
]

const FAQS = [
  { q: '¿Cómo funciona la calculadora de tributos?', a: 'Nuestra calculadora utiliza las tasas oficiales de aranceles NANDINA, IVA (14.94%), seguro (1.5%) y fletes para darte un estimado preciso del costo total de importar tu producto a Bolivia.' },
  { q: '¿Cuánto tarda un envío desde China?', a: 'Los tiempos varían según el método: aéreo (15-25 días), marítimo (35-50 días), o ferroviario (20-35 días). La calculadora te da estimaciones específicas según el país de origen.' },
  { q: '¿VIMEX hace los envíos o solo es plataforma?', a: 'VIMEX es una plataforma de gestión y asesoría. Nos integramos con couriers y forwarders para darte visibilidad completa, pero no somos transportistas.' },
  { q: '¿Puedo guardar mis cotizaciones?', a: 'Sí, los planes Pro y Empresa permiten guardar cotizaciones ilimitadas. El plan gratuito incluye hasta 3 cotizaciones mensuales.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e2e8e4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2E7D56] to-[#4CAF7D] flex items-center justify-center text-white text-sm">📦</div>
            <span className="font-[family-name:var(--font-outfit)] font-black text-lg text-[#0f1f17]">VIMEX</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <a href="#features" className="px-3 py-2 text-sm text-[#6b7c72] hover:text-[#2E7D56] rounded-lg hover:bg-[#f8faf9] transition-colors">Funciones</a>
            <a href="#pricing" className="px-3 py-2 text-sm text-[#6b7c72] hover:text-[#2E7D56] rounded-lg hover:bg-[#f8faf9] transition-colors">Precios</a>
            <a href="#faq" className="px-3 py-2 text-sm text-[#6b7c72] hover:text-[#2E7D56] rounded-lg hover:bg-[#f8faf9] transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/plataforma/login" className="hidden sm:block px-4 py-2 text-sm font-semibold text-[#2E7D56] hover:bg-[#E8F5EE] rounded-lg transition-colors">Iniciar sesión</Link>
            <Link href="/plataforma/login" className="px-4 py-2 bg-[#2E7D56] text-white text-sm font-semibold rounded-lg hover:bg-[#1A4D35] transition-colors">Crear cuenta</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F3320] via-[#1A4D35] to-[#2E7D56]"></div>
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)', backgroundSize: '60px 60px'}}></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Ahora con scraping de precios
              </div>
              <h1 className="font-[family-name:var(--font-outfit)] font-black text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-6">
                Importa a Bolivia <span className="text-[#7DEDA8]">sin complicaciones</span>
              </h1>
              <p className="text-lg text-white/70 mb-8 max-w-lg">
                Calcula tributos exactos, rastrea envíos en tiempo real y conecta con proveedores verificados. Todo en una plataforma profesional.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/plataforma/calculadora" className="px-6 py-3 bg-white text-[#2E7D56] font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                  <Calculator size={18} />
                  Calcular ahora
                </Link>
                <a href="#features" className="px-6 py-3 bg-white/10 text-white border border-white/20 font-semibold rounded-xl hover:bg-white/20 transition-all">
                  Ver funciones
                </a>
              </div>
              <div className="flex gap-8 mt-10">
                <div><p className="font-[family-name:var(--font-outfit)] font-black text-3xl text-white">5,000+</p><p className="text-sm text-white/50">Proveedores</p></div>
                <div><p className="font-[family-name:var(--font-outfit)] font-black text-3xl text-white">50k+</p><p className="text-sm text-white/50">Cotizaciones</p></div>
                <div><p className="font-[family-name:var(--font-outfit)] font-black text-3xl text-white">98%</p><p className="text-sm text-white/50">Satisfacción</p></div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#4CAF7D]/30 flex items-center justify-center text-xl">🧮</div>
                  <div>
                    <p className="text-white font-semibold text-sm">Cotización reciente</p>
                    <p className="text-white/50 text-xs">iPhone 15 Pro — 256GB</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-white/60"><span>Valor FOB</span><span className="text-white">$1,199.00</span></div>
                  <div className="flex justify-between text-white/60"><span>Flete aéreo</span><span className="text-white">$48.00</span></div>
                  <div className="flex justify-between text-white/60"><span>Seguro (1.5%)</span><span className="text-white">$17.99</span></div>
                  <div className="flex justify-between text-white/60"><span>GA (10%)</span><span className="text-white">$126.40</span></div>
                  <div className="flex justify-between text-white/60"><span>IVA (14.94%)</span><span className="text-white">$208.70</span></div>
                  <div className="border-t border-white/20 pt-2 flex justify-between text-[#7DEDA8] font-bold"><span>TOTAL</span><span>$1,600.09</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-[#f8faf9]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-[#E8F5EE] text-[#2E7D56] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">Funciones</span>
            <h2 className="font-[family-name:var(--font-outfit)] font-black text-3xl sm:text-4xl text-[#0f1f17] mb-4">Todo lo que necesitas para importar</h2>
            <p className="text-[#6b7c72] max-w-xl mx-auto">Herramientas profesionales diseñadas específicamente para importadores bolivianos.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white border border-[#e2e8e4] rounded-xl p-6 hover:shadow-lg hover:border-[#4CAF7D] transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#E8F5EE] flex items-center justify-center text-[#2E7D56] mb-4 group-hover:bg-[#2E7D56] group-hover:text-white transition-colors">
                  <f.icon size={22} />
                </div>
                <h3 className="font-semibold text-[#0f1f17] mb-2">{f.title}</h3>
                <p className="text-sm text-[#6b7c72] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-[#E8F5EE] text-[#2E7D56] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">Precios</span>
            <h2 className="font-[family-name:var(--font-outfit)] font-black text-3xl sm:text-4xl text-[#0f1f17] mb-4">Planes para cada necesidad</h2>
            <p className="text-[#6b7c72]">Empieza gratis y escala según tu volumen de importaciones.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLANS.map((p, i) => (
              <div key={i} className={`relative rounded-2xl p-6 ${p.popular ? 'bg-[#0f1f17] text-white border-2 border-[#2E7D56]' : 'bg-white border border-[#e2e8e4]'}`}>
                {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2E7D56] text-white text-xs font-bold px-3 py-1 rounded-full">MÁS POPULAR</span>}
                <h3 className={`font-semibold text-lg ${p.popular ? 'text-white' : 'text-[#0f1f17]'}`}>{p.name}</h3>
                <p className={`text-sm mb-4 ${p.popular ? 'text-white/60' : 'text-[#6b7c72]'}`}>{p.desc}</p>
                <div className="mb-4">
                  <span className={`font-[family-name:var(--font-outfit)] font-black text-4xl ${p.popular ? 'text-white' : 'text-[#0f1f17]'}`}>${p.price}</span>
                  <span className={p.popular ? 'text-white/60' : 'text-[#6b7c72]'}>/mes</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircle size={14} className={p.popular ? 'text-[#4CAF7D]' : 'text-[#2E7D56]'} />
                      <span className={p.popular ? 'text-white/80' : 'text-[#6b7c72]'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/plataforma/login" className={`block text-center py-2.5 rounded-lg font-semibold text-sm transition-colors ${p.popular ? 'bg-[#2E7D56] hover:bg-[#4CAF7D] text-white' : 'bg-[#E8F5EE] hover:bg-[#d4ede0] text-[#2E7D56]'}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-[#f8faf9]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-[#E8F5EE] text-[#2E7D56] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">FAQ</span>
            <h2 className="font-[family-name:var(--font-outfit)] font-black text-3xl sm:text-4xl text-[#0f1f17]">Preguntas frecuentes</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={i} className="bg-white border border-[#e2e8e4] rounded-xl p-5">
                <h3 className="font-semibold text-[#0f1f17] mb-2">{f.q}</h3>
                <p className="text-sm text-[#6b7c72] leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-[#2E7D56] to-[#4CAF7D] rounded-2xl p-8 sm:p-12 text-center">
            <h2 className="font-[family-name:var(--font-outfit)] font-black text-2xl sm:text-3xl text-white mb-4">¿Listo para importar como un profesional?</h2>
            <p className="text-white/70 mb-6 max-w-lg mx-auto">Únete a miles de importadores bolivianos que ya usan VIMEX para optimizar sus compras internacionales.</p>
            <Link href="/plataforma/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#2E7D56] font-bold rounded-xl hover:shadow-lg transition-all">
              Crear cuenta gratis <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e2e8e4] py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2E7D56] to-[#4CAF7D] flex items-center justify-center text-white text-sm">📦</div>
              <span className="font-[family-name:var(--font-outfit)] font-black text-lg text-[#0f1f17]">VIMEX</span>
            </div>
            <p className="text-sm text-[#9ab0a2]"> 2026 VIMEX. Importaciones simplificadas para Bolivia.</p>
            <div className="flex gap-4">
              <Link href="/plataforma/login" className="text-sm text-[#6b7c72] hover:text-[#2E7D56]">Iniciar sesión</Link>
              <Link href="/plataforma/calculadora" className="text-sm text-[#6b7c72] hover:text-[#2E7D56]">Calculadora</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
