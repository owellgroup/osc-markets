import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError, api, assetUrl } from '../api/client'
import { demoProduct } from '../api/demo'
import type { Product } from '../api/types'
import Icon from '../components/Icon'
import { DemoNotice, Empty, PageSpinner, Stepper, typeLabel } from '../components/ui'
import { useBasket } from '../context/BasketContext'
import { useToast } from '../context/ToastContext'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { add, lines } = useBasket()
  const toast = useToast()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [demo, setDemo] = useState(false)
  const [image, setImage] = useState(0)
  const [options, setOptions] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [showMissing, setShowMissing] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    setDemo(false)
    const numeric = Number(id)
    api<Product>(`/api/catalog/products/${id}`)
      .then((p) => { setProduct(p); setImage(0); setOptions({}); setQuantity(1); setShowMissing(false) })
      .catch((e) => {
        const sample = Number.isFinite(numeric) ? demoProduct(numeric) : undefined
        if (sample && (e instanceof ApiError) && (e.status === 0 || e.status === 404)) {
          setProduct(sample)
          setDemo(true)
          setImage(0)
          setOptions({})
          setQuantity(1)
          setShowMissing(false)
          return
        }
        setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="container page"><PageSpinner /></div>
  if (notFound || !product) {
    return (
      <div className="container page">
        <Empty icon="box" title="We couldn't find that item" text="It may have been removed from the catalogue."
          action={<Link className="btn btn-sm" to="/products">Browse products</Link>} />
      </div>
    )
  }

  const missing = product.options.filter((o) => !options[o.name])
  const inBasket = lines.filter((l) => l.productId === product.id).reduce((s, l) => s + l.quantity, 0)

  const addToBasket = (goToBasket: boolean) => {
    if (missing.length > 0) {
      setShowMissing(true)
      return
    }
    add(product, options, quantity)
    if (goToBasket) navigate('/basket')
    else toast(`${product.name} added to your quote basket`)
  }

  return (
    <div className="container page">
      {demo && <DemoNotice />}
      <button className="breadcrumb btn-plain btn" onClick={() => navigate(-1)} style={{ border: 0 }}>
        <Icon name="back" size={18} stroke={2.2} /> Back
      </button>

      <div className="detail">
        <div>
          <div className="gallery-main">
            {product.images.length > 0 ? (
              <img key={image} src={assetUrl(product.images[image])} alt={product.name} />
            ) : (
              <span className="media-empty"><Icon name="image" size={64} stroke={1.1} /></span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="thumbs">
              {product.images.map((img, i) => (
                <button key={img} className={`thumb${i === image ? ' on' : ''}`} onClick={() => setImage(i)} aria-label={`Image ${i + 1}`}>
                  <img src={assetUrl(img)} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail-info">
          <div className="flex gap-8 wrap items-center">
            <span className={`badge ${product.type === 'SOLUTION' ? 'red' : ''}`}>{typeLabel(product.type)}</span>
            {product.brandName && <span className="badge">{product.brandName}</span>}
            {product.categoryName && <span className="badge">{product.categoryName}</span>}
          </div>
          <h1 className="large-title mt-12">{product.name}</h1>
          {product.sku && <p className="caption mt-8">SKU {product.sku}</p>}
          {product.summary && <p className="subtitle" style={{ fontSize: 18 }}>{product.summary}</p>}

          {product.options.map((o) => (
            <div className="opt-group" key={o.id}>
              <h4>
                {o.name}
                {showMissing && !options[o.name] && <span className="req"> · please choose</span>}
              </h4>
              <div className="opt-values">
                {o.values.map((v) => (
                  <button key={v} type="button" className={`opt-pill${options[o.name] === v ? ' on' : ''}`}
                    onClick={() => setOptions((prev) => ({ ...prev, [o.name]: v }))}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="buy-bar">
            <Stepper value={quantity} onChange={setQuantity} large />
            <button className="btn grow" onClick={() => addToBasket(false)}>
              <Icon name="plus" size={18} stroke={2.4} /> Add to Quote Basket
            </button>
          </div>
          <div className="flex items-center gap-12 mt-12">
            <button className="btn btn-plain" onClick={() => addToBasket(true)}>Add and view basket</button>
            {inBasket > 0 && <span className="caption">{inBasket} of this item in your basket</span>}
          </div>

          <div className="notice mt-24">
            <Icon name="info" size={18} />
            <span>Prices aren't listed. Add what you need and request a quote. Our team will confirm pricing, availability and delivery.</span>
          </div>
        </div>
      </div>

      {(product.description || product.specifications.length > 0) && (
        <div style={{ maxWidth: 760, marginTop: 40 }}>
          {product.description && (
            <>
              <h2 className="title-2" style={{ marginBottom: 10 }}>Overview</h2>
              <p className="desc">{product.description}</p>
            </>
          )}
          {product.specifications.length > 0 && (
            <>
              <div className="group-label" style={{ marginLeft: 4, marginTop: 32 }}>Specifications</div>
              <div className="grouped">
                {product.specifications.map((s, i) => (
                  <div className="row" key={i}>
                    <span className="row-label" style={{ minWidth: 150 }}>{s.label}</span>
                    <span className="row-value">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
