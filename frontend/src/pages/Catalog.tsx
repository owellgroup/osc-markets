import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { DEMO_BRANDS, DEMO_CATEGORIES, demoPage, orDemo } from '../api/demo'
import type { Named, Page, Product, ProductType } from '../api/types'
import Icon from '../components/Icon'
import ProductCard from '../components/ProductCard'
import { DemoNotice, Empty, PageSpinner, Spinner } from '../components/ui'

const PAGE_SIZE = 24

export default function Catalog({ type }: { type: ProductType }) {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const categoryId = params.get('categoryId') ?? ''
  const brandId = params.get('brandId') ?? ''

  const [search, setSearch] = useState(q)
  const [categories, setCategories] = useState<Named[]>([])
  const [brands, setBrands] = useState<Named[]>([])
  const [items, setItems] = useState<Product[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [demo, setDemo] = useState(false)

  const isSolutions = type === 'SOLUTION'

  useEffect(() => {
    Promise.allSettled([api<Named[]>('/api/catalog/categories'), api<Named[]>('/api/catalog/brands')])
      .then(([c, b]) => {
        setCategories(orDemo(c.status === 'fulfilled' ? c.value : undefined, (v) => v.length === 0, DEMO_CATEGORIES).data)
        setBrands(orDemo(b.status === 'fulfilled' ? b.value : undefined, (v) => v.length === 0, DEMO_BRANDS).data)
      })
  }, [])

  useEffect(() => setSearch(q), [q])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const qs = new URLSearchParams({ type, size: String(PAGE_SIZE), page: '0' })
    if (q) qs.set('q', q)
    if (categoryId) qs.set('categoryId', categoryId)
    if (brandId) qs.set('brandId', brandId)
    const filtered = !!(q || categoryId || brandId)
    api<Page<Product>>(`/api/catalog/products?${qs}`)
      .then((res) => {
        if (cancelled) return
        if (res.items.length === 0 && !filtered) {
          const fallback = demoPage(type, q, categoryId, brandId, 0, PAGE_SIZE)
          setItems(fallback.items)
          setPage(0)
          setTotalPages(fallback.totalPages)
          setDemo(true)
          return
        }
        setItems(res.items)
        setPage(0)
        setTotalPages(res.totalPages)
        setDemo(false)
      })
      .catch(() => {
        if (cancelled) return
        const fallback = demoPage(type, q, categoryId, brandId, 0, PAGE_SIZE)
        setItems(fallback.items)
        setPage(0)
        setTotalPages(fallback.totalPages)
        setDemo(true)
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [type, q, categoryId, brandId])

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      if (demo) {
        const fallback = demoPage(type, q, categoryId, brandId, page + 1, PAGE_SIZE)
        setItems((prev) => [...prev, ...fallback.items])
        setPage(fallback.page)
        setTotalPages(fallback.totalPages)
        return
      }
      const qs = new URLSearchParams({ type, size: String(PAGE_SIZE), page: String(page + 1) })
      if (q) qs.set('q', q)
      if (categoryId) qs.set('categoryId', categoryId)
      if (brandId) qs.set('brandId', brandId)
      const res = await api<Page<Product>>(`/api/catalog/products?${qs}`)
      setItems((prev) => [...prev, ...res.items])
      setPage(res.page)
      setTotalPages(res.totalPages)
    } finally {
      setLoadingMore(false)
    }
  }

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  return (
    <div className="container page">
      <h1 className="large-title">{isSolutions ? 'Solutions' : 'Products'}</h1>
      <p className="subtitle">
        {isSolutions ? 'Complete, installed solutions delivered by our team.' : 'Browse the range and add what you need to your quote basket.'}
      </p>
      {demo && <DemoNotice />}

      <form className="toolbar" onSubmit={(e) => { e.preventDefault(); update('q', search.trim()) }}>
        <label className="search">
          <Icon name="search" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" aria-label="Search" />
        </label>
        {brands.length > 0 && (
          <select className="field-input sm brand-select" value={brandId}
            onChange={(e) => update('brandId', e.target.value)} aria-label="Brand">
            <option value="">All brands</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
      </form>

      {categories.length > 0 && (
        <div className="chips">
          <button className={`chip${!categoryId ? ' on' : ''}`} onClick={() => update('categoryId', '')}>All</button>
          {categories.map((c) => (
            <button key={c.id} className={`chip${String(c.id) === categoryId ? ' on' : ''}`} onClick={() => update('categoryId', String(c.id))}>{c.name}</button>
          ))}
        </div>
      )}

      <div className="catalog-results">
        {loading ? <PageSpinner /> : items.length === 0 ? (
          <Empty icon="search" title="Nothing found" text="Try a different search or clear the filters." />
        ) : (
          <>
            <div className="grid">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div>
            {page + 1 < totalPages && (
              <div className="load-more">
                <button className="btn btn-gray" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? <Spinner /> : 'Show more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
