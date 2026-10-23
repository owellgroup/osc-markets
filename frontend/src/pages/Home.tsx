import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { DEMO_BANNERS, DEMO_PRODUCTS, orDemo } from '../api/demo'
import type { Banner, Page, Product } from '../api/types'
import BannerSlider from '../components/BannerSlider'
import Icon from '../components/Icon'
import ProductCard from '../components/ProductCard'
import { DemoNotice, PageSpinner } from '../components/ui'

function settled<T>(r: PromiseSettledResult<T>): T | undefined {
  return r.status === 'fulfilled' ? r.value : undefined
}

export default function Home() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [solutions, setSolutions] = useState<Product[]>([])
  const [demo, setDemo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    Promise.allSettled([
      api<Banner[]>('/api/catalog/banners'),
      api<Page<Product>>('/api/catalog/products?type=PRODUCT&size=8'),
      api<Page<Product>>('/api/catalog/products?type=SOLUTION&size=4'),
    ]).then(([b, p, s]) => {
      const bannersRes = orDemo(settled(b), (v) => v.length === 0, DEMO_BANNERS)
      const prodRes = orDemo(settled(p), (v) => v.items.length === 0, {
        items: DEMO_PRODUCTS.filter((x) => x.type === 'PRODUCT').slice(0, 8),
        total: 5, page: 0, size: 8, totalPages: 1,
      })
      const solRes = orDemo(settled(s), (v) => v.items.length === 0, {
        items: DEMO_PRODUCTS.filter((x) => x.type === 'SOLUTION').slice(0, 4),
        total: 3, page: 0, size: 4, totalPages: 1,
      })
      setBanners(bannersRes.data)
      setProducts(prodRes.data.items)
      setSolutions(solRes.data.items)
      setDemo(bannersRes.demo || prodRes.demo || solRes.demo)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="container page"><PageSpinner /></div>

  return (
    <>
      {banners.length > 0 && <BannerSlider banners={banners} />}
      <div className="container page">
        {demo && <DemoNotice />}

        <section className="hero">
          <h1 className="large-title">What does your business need?</h1>
          <p className="subtitle">Add products and solutions to your quote basket. We'll come back with pricing, availability and delivery.</p>
          <form className="toolbar" onSubmit={(e) => { e.preventDefault(); navigate(`/products?q=${encodeURIComponent(q)}`) }}>
            <label className="search">
              <Icon name="search" size={18} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products and solutions" aria-label="Search" />
            </label>
          </form>
        </section>

        {products.length > 0 && (
          <>
            <div className="section-head">
              <h2 className="title-2">Products</h2>
              <Link to="/products">See all</Link>
            </div>
            <div className="grid">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          </>
        )}

        {solutions.length > 0 && (
          <>
            <div className="section-head">
              <h2 className="title-2">Solutions</h2>
              <Link to="/solutions">See all</Link>
            </div>
            <div className="grid">{solutions.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          </>
        )}
      </div>
    </>
  )
}
