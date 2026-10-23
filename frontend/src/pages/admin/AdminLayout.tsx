import { useEffect, useState } from 'react'
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { api } from '../../api/client'
import Icon from '../../components/Icon'
import { PageSpinner } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'

export default function AdminLayout() {
  const { admin, loading, logout } = useAuth()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [newCount, setNewCount] = useState(0)

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!admin) return
    const load = () => api<{ newCount: number }>('/api/admin/quotes/stats', { admin: true })
      .then((s) => setNewCount(s.newCount)).catch(() => undefined)
    load()
    const t = window.setInterval(load, 60_000)
    return () => window.clearInterval(t)
  }, [admin, pathname])

  if (loading) return <PageSpinner />
  if (!admin) return <Navigate to="/admin/login" replace state={{ from: pathname }} />

  const link = (to: string, icon: string, label: string, count?: number) => (
    <NavLink to={to} end={to === '/admin'} className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>
      <Icon name={icon} size={20} />
      {label}
      {count ? <span className="side-count">{count}</span> : null}
    </NavLink>
  )

  return (
    <div className="admin-shell">
      <div className="mobile-bar">
        <button className="icon-btn" onClick={() => setOpen((o) => !o)} aria-label="Menu"><Icon name="menu" size={18} /></button>
        OSC Admin
      </div>
      {open && <button className="sidebar-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}
      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-brand"><img src="/logo.png" alt="OSC Store" /></div>
        {link('/admin', 'inbox', 'Quote requests', newCount)}
        {link('/admin/products', 'box', 'Products & solutions')}
        {link('/admin/categories', 'layers', 'Categories')}
        {link('/admin/brands', 'tag', 'Brands')}
        {link('/admin/options', 'slider', 'Available options')}
        {link('/admin/banners', 'image', 'Banners')}
        {admin.role === 'SUPER_ADMIN' && link('/admin/admins', 'users', 'Admins')}
        <div className="sidebar-foot">
          <div style={{ fontWeight: 600, fontSize: 15 }}>{admin.name}</div>
          <div className="caption" style={{ marginBottom: 10 }}>{admin.email}</div>
          <button className="btn btn-gray btn-sm" onClick={logout}><Icon name="logout" size={16} /> Sign out</button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
