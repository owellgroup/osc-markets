import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assetUrl } from '../api/client'
import Icon from '../components/Icon'
import QuoteForm from '../components/QuoteForm'
import { Empty, Stepper, typeLabel } from '../components/ui'
import { useBasket } from '../context/BasketContext'

export default function Basket() {
  const { lines, setQuantity, remove, clear, totalQuantity } = useBasket()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  if (lines.length === 0) {
    return (
      <div className="container page">
      <Empty icon="bag" title="Your quote basket is empty"
        text="Browse our products and solutions and add what you need. Your basket is saved automatically."
        action={
          <div className="flex gap-12" style={{ justifyContent: 'center' }}>
            <Link className="btn btn-sm" to="/products">Browse products</Link>
            <Link className="btn btn-sm btn-gray" to="/solutions">Browse solutions</Link>
          </div>
        } />
      </div>
    )
  }

  const products = lines.filter((l) => l.type === 'PRODUCT')
  const solutions = lines.filter((l) => l.type === 'SOLUTION')

  const renderGroup = (title: string, group: typeof lines) =>
    group.length > 0 && (
      <>
        <div className="group-label">{title}</div>
        <div className="grouped">
          {group.map((l) => (
            <div className="line" key={l.key}>
              <Link to={`/product/${l.productId}`} className="line-img">
                {l.image ? <img src={assetUrl(l.image)} alt={l.name} /> : <span className="media-empty"><Icon name="image" size={26} stroke={1.4} /></span>}
              </Link>
              <div className="line-main">
                <Link to={`/product/${l.productId}`} className="line-name">{l.name}</Link>
                <div className="line-meta">
                  {[l.brand, l.sku && `SKU ${l.sku}`].filter(Boolean).join(' · ')}
                </div>
                {Object.keys(l.options).length > 0 && (
                  <div className="line-meta">{Object.entries(l.options).map(([k, v]) => `${k}: ${v}`).join(' · ')}</div>
                )}
              </div>
              <div className="line-actions">
                <Stepper value={l.quantity} onChange={(v) => setQuantity(l.key, v)} min={1} />
                <button className="line-remove" onClick={() => remove(l.key)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </>
    )

  return (
    <div className="container page">
      <div className="flex items-center" style={{ justifyContent: 'space-between' }}>
        <h1 className="large-title">Quote Basket</h1>
        <button className="btn btn-plain" onClick={() => { if (window.confirm('Remove everything from your basket?')) clear() }}>Clear all</button>
      </div>
      <p className="subtitle">Check your items and quantities, then request your formal quote.</p>

      <div className="basket-layout">
        <div>
          {renderGroup('Products', products)}
          {renderGroup('Solutions', solutions)}
          <button className="btn btn-plain mt-16" onClick={() => navigate('/products')}>
            <Icon name="plus" size={16} stroke={2.2} /> Add more items
          </button>
        </div>

        <aside className="card summary">
          <h2 className="title-3">Summary</h2>
          <div className="mt-12">
            {products.length > 0 && <div className="summary-row"><span className="muted">Products</span><span>{products.reduce((s, l) => s + l.quantity, 0)}</span></div>}
            {solutions.length > 0 && <div className="summary-row"><span className="muted">{typeLabel('SOLUTION')}s</span><span>{solutions.reduce((s, l) => s + l.quantity, 0)}</span></div>}
            <div className="summary-row" style={{ fontWeight: 600 }}><span>Total items</span><span>{totalQuantity}</span></div>
          </div>
          <div className="notice mt-16">
            <Icon name="info" size={18} />
            <span>No payment now. Our team will send a formal quote with pricing to your email.</span>
          </div>
          <button className="btn btn-block mt-16" onClick={() => setOpen(true)}>Get A Quote</button>
        </aside>
      </div>

      {open && (
        <QuoteForm lines={lines} onClose={() => setOpen(false)}
          onSubmitted={(res) => {
            clear()
            navigate('/quote-sent', { replace: true, state: res })
          }} />
      )}
    </div>
  )
}
