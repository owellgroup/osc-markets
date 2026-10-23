import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, assetUrl } from '../../api/client'
import type { Page, Product, ProductType } from '../../api/types'
import Icon from '../../components/Icon'
import { Empty, PageSpinner, Segmented, typeLabel } from '../../components/ui'
import { useToast } from '../../context/ToastContext'

export default function Products() {
  const navigate = useNavigate()
  const toast = useToast()
  const [type, setType] = useState<'ALL' | ProductType>('ALL')
  const [q, setQ] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [data, setData] = useState<Page<Product> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    const qs = new URLSearchParams({ page: String(page), size: '15' })
    if (type !== 'ALL') qs.set('type', type)
    if (search) qs.set('q', search)
    api<Page<Product>>(`/api/admin/products?${qs}`, { admin: true })
      .then((d) => { setData(d); setError(null) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [type, search, page])

  useEffect(load, [load])

  const remove = async (p: Product) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone. Existing quotes keep their own copy of the item.`)) return
    try {
      await api(`/api/admin/products/${p.id}`, { method: 'DELETE', admin: true })
      toast('Deleted')
      load()
    } catch (e) { toast((e as Error).message, 'error') }
  }

  return (
    <>
      <div className="admin-head">
        <div>
          <h1 className="large-title">Products & solutions</h1>
          <p className="subtitle">What customers can browse and add to their quote basket.</p>
        </div>
        <Link to="/admin/products/new" className="btn btn-sm"><Icon name="plus" size={16} stroke={2.4} /> New item</Link>
      </div>

      <div className="toolbar" style={{ marginTop: 0 }}>
        <Segmented value={type} onChange={(v) => { setType(v); setPage(0) }}
          options={[{ value: 'ALL', label: 'All' }, { value: 'PRODUCT', label: 'Products' }, { value: 'SOLUTION', label: 'Solutions' }]} />
        <form className="search" onSubmit={(e) => { e.preventDefault(); setSearch(q.trim()); setPage(0) }}>
          <Icon name="search" size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or SKU" aria-label="Search" />
        </form>
      </div>

      {error && <div className="form-error">{error}</div>}
      {loading && !data ? <PageSpinner /> : data && data.items.length === 0 ? (
        <div className="table-card"><Empty title="Nothing here yet" text="Create your first product or solution." /></div>
      ) : data && (
        <div className="table-card" style={{ opacity: loading ? 0.6 : 1, transition: 'opacity .2s' }}>
          <div className="table-scroll">
            <table className="table">
              <thead><tr><th>Item</th><th>Type</th><th>Category</th><th>Brand</th><th>Status</th><th /></tr></thead>
              <tbody>
                {data.items.map((p) => (
                  <tr key={p.id} className="clickable" onClick={() => navigate(`/admin/products/${p.id}`)}>
                    <td>
                      <div className="flex items-center gap-12">
                        <span className="thumb-sm">{p.images[0] ? <img src={assetUrl(p.images[0])} alt="" /> : <Icon name="image" size={20} stroke={1.4} />}</span>
                        <div><div className="cell-title">{p.name}</div><div className="cell-sub">{p.sku ?? 'No SKU'}</div></div>
                      </div>
                    </td>
                    <td><span className={`badge ${p.type === 'SOLUTION' ? 'red' : ''}`}>{typeLabel(p.type)}</span></td>
                    <td>{p.categoryName ?? '-'}</td>
                    <td>{p.brandName ?? '-'}</td>
                    <td><span className={`badge ${p.active ? 'green' : ''}`}>{p.active ? 'Visible' : 'Hidden'}</span></td>
                    <td className="num" onClick={(e) => e.stopPropagation()}>
                      <button className="icon-btn" aria-label={`Delete ${p.name}`} onClick={() => remove(p)}><Icon name="trash" size={17} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.totalPages > 1 && (
            <div className="pager">
              <button className="btn btn-gray btn-sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
              Page {data.page + 1} of {data.totalPages}
              <button className="btn btn-gray btn-sm" disabled={page + 1 >= data.totalPages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
