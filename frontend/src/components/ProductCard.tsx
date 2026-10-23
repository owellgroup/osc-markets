import { Link } from 'react-router-dom'
import type { Product } from '../api/types'
import Icon from './Icon'
import { Media, typeLabel } from './ui'

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/product/${product.id}`} className="card">
      <div style={{ position: 'relative' }}>
        <Media src={product.images[0]} alt={product.name} />
        {product.type === 'SOLUTION' && <span className="badge red media-tag">{typeLabel(product.type)}</span>}
      </div>
      <div className="card-body">
        <span className="card-eyebrow">{[product.brandName, product.categoryName].filter(Boolean).join(' · ') || typeLabel(product.type)}</span>
        <h3 className="card-title">{product.name}</h3>
        {product.summary && <p className="card-sub">{product.summary}</p>}
        <div className="card-foot">
          <span className="link">View details <Icon name="chevron" size={15} stroke={2.2} /></span>
        </div>
      </div>
    </Link>
  )
}
