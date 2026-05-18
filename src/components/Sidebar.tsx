'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Package, Calculator, Search,
  User, Settings, LogOut, ShieldCheck, Menu, X
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { section: 'Principal', links: [
    { href: '/plataforma/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
    { href: '/plataforma/envios',    label: 'Mis Envíos',   icon: Package, badge: true },
    { href: '/plataforma/calculadora', label: 'Calculadora', icon: Calculator },
    { href: '/plataforma/proveedores', label: 'Proveedores', icon: Search },
  ]},
  { section: 'Cuenta', links: [
    { href: '/plataforma/perfil',    label: 'Mi Perfil',    icon: User },
    { href: '/plataforma/configuracion', label: 'Configuración', icon: Settings },
  ]},
]

interface Profile { nombre?: string; apellido?: string; plan?: string; email?: string; is_admin?: boolean }

export default function Sidebar() {
  const pathname  = usePathname()
  const router    = useRouter()
  const supabase  = createClient()
  const [profile, setProfile] = useState<Profile>({})
  const [open, setOpen]       = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: p } = await supabase.from('perfiles').select('*').eq('id', data.user.id).single()
      setProfile({ ...p, email: data.user.email })
    })
  }, [])

  const initials = [profile.nombre?.[0], profile.apellido?.[0]].filter(Boolean).join('').toUpperCase() || '?'
  const displayName = [profile.nombre, profile.apellido].filter(Boolean).join(' ') || profile.email || 'Usuario'

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/plataforma/login')
  }

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md border border-[#e2e8e4]">
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)}>
          <div className="w-64 h-full bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-end p-3"><button onClick={() => setOpen(false)}><X size={18} /></button></div>
            {/* SidebarContent inline */}
            <div className="flex flex-col h-full">
              <div className="px-5 py-4 border-b border-[#e2e8e4]">
                <Link href="/" className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2E7D56] to-[#4CAF7D] flex items-center justify-center text-white text-sm">📦</div>
                  <span className="font-[family-name:var(--font-outfit)] font-black text-lg text-[#0f1f17]">VIMEX</span>
                </Link>
              </div>
              <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
                {navItems.map(({ section, links }) => (
                  <div key={section}>
                    <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#9ab0a2] px-2 mb-1.5">{section}</p>
                    {links.map(({ href, label, icon: Icon }) => (
                      <Link key={href} href={href} onClick={() => setOpen(false)}
                        className={clsx(
                          'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                          pathname.startsWith(href)
                            ? 'bg-[#E8F5EE] text-[#2E7D56] font-semibold'
                            : 'text-[#4a6055] hover:bg-[#f0f7f3] hover:text-[#2E7D56]'
                        )}
                      >
                        <Icon size={16} strokeWidth={2} />
                        {label}
                      </Link>
                    ))}
                  </div>
                ))}
                {profile.is_admin && (
                  <div>
                    <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#9ab0a2] px-2 mb-1.5">Admin</p>
                    <Link href="/plataforma/admin" onClick={() => setOpen(false)}
                      className={clsx('flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                        pathname.startsWith('/plataforma/admin') ? 'bg-[#E8F5EE] text-[#2E7D56]' : 'text-[#4a6055] hover:bg-[#f0f7f3]'
                      )}>
                      <ShieldCheck size={16} /> Panel Admin
                    </Link>
                  </div>
                )}
              </nav>
              <div className="px-3 py-3 border-t border-[#e2e8e4]">
                <div className="flex items-center gap-2.5 px-2 py-1.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2E7D56] to-[#4CAF7D] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{initials}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#0f1f17] truncate">{displayName}</p>
                    <p className="text-[0.68rem] text-[#9ab0a2]">Plan {profile.plan || 'Gratuito'}</p>
                  </div>
                  <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-red-50 text-[#9ab0a2] hover:text-red-500 transition-colors"><LogOut size={15} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 border-r border-[#e2e8e4] bg-white h-screen sticky top-0">
        <div className="flex flex-col h-full">
          <div className="px-5 py-4 border-b border-[#e2e8e4]">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2E7D56] to-[#4CAF7D] flex items-center justify-center text-white text-sm">📦</div>
              <span className="font-[family-name:var(--font-outfit)] font-black text-lg text-[#0f1f17]">VIMEX</span>
            </Link>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
            {navItems.map(({ section, links }) => (
              <div key={section}>
                <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#9ab0a2] px-2 mb-1.5">{section}</p>
                {links.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href}
                    className={clsx(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      pathname.startsWith(href)
                        ? 'bg-[#E8F5EE] text-[#2E7D56] font-semibold'
                        : 'text-[#4a6055] hover:bg-[#f0f7f3] hover:text-[#2E7D56]'
                    )}
                  >
                    <Icon size={16} strokeWidth={2} />
                    {label}
                  </Link>
                ))}
              </div>
            ))}
            {profile.is_admin && (
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#9ab0a2] px-2 mb-1.5">Admin</p>
                <Link href="/plataforma/admin"
                  className={clsx('flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    pathname.startsWith('/plataforma/admin') ? 'bg-[#E8F5EE] text-[#2E7D56]' : 'text-[#4a6055] hover:bg-[#f0f7f3]'
                  )}>
                  <ShieldCheck size={16} /> Panel Admin
                </Link>
              </div>
            )}
          </nav>
          <div className="px-3 py-3 border-t border-[#e2e8e4]">
            <div className="flex items-center gap-2.5 px-2 py-1.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2E7D56] to-[#4CAF7D] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{initials}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#0f1f17] truncate">{displayName}</p>
                <p className="text-[0.68rem] text-[#9ab0a2]">Plan {profile.plan || 'Gratuito'}</p>
              </div>
              <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-red-50 text-[#9ab0a2] hover:text-red-500 transition-colors"><LogOut size={15} /></button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
