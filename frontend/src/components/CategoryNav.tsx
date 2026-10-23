import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { DEMO_CATEGORIES, orDemo } from '../api/demo'
import type { Named } from '../api/types'

export default function CategoryNav() {
  const [categories, setCategories] = useState<Named[]>([])
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const catalog = pathname.startsWith('/solutions') ? '/solutions' : '/products'
  const onCatalog = pathname === '/products' || pathname === '/solutions'
  const selected = params.get('categoryId') ?? ''

  useEffect(() => {
    const load = () => {
      api<Named[]>('/api/catalog/categories')
        .then((live) => setCategories(orDemo(live, (v) => v.length === 0, DEMO_CATEGORIES).data))
        .catch(() => setCategories(DEMO_CATEGORIES))
    }
    load()
    window.addEventListener('focus', load)
    return () => window.removeEventListener('focus', load)
  }, [])

  if (categories.length === 0) return null

  return (
    <nav className="cat-nav" aria-label="Categories">
      <div className="cat-nav-track">
        <Link to={catalog} className={`cat-link${onCatalog && !selected ? ' active' : ''}`}>All</Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            to={`${catalog}?categoryId=${c.id}`}
            className={`cat-link${selected === String(c.id) ? ' active' : ''}`}
          >
            {c.name}
          </Link>
        ))}
      </div>
    </nav>
  )
}
