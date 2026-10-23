import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import { dateTime, money } from '../../api/format'
import type { Page, QuoteStatus, QuoteSummary } from '../../api/types'
import Icon from '../../components/Icon'
import { Empty, PageSpinner, Segmented } from '../../components/ui'

interface Stats { total: number; newCount: number; processedCount: number }

export default function Quotes() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'ALL' | QuoteStatus>('ALL')
  const [q, setQ] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [data, setData] = useState<Page<QuoteSummary> | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    const qs = new URLSearchParams({ page: String(page), size: '15' })
    if (status !== 'ALL') qs.set('status', status)
    if (search) qs.set('q', search)
    Promise.all([
      api<Page<QuoteSummary>>(`/api/admin/quotes?${qs}`, { admin: true }),
      api<Stats>('/api/admin/quotes/stats', { admin: true }),
    ])
      .then(([d, s]) => { setData(d); setStats(s); setError(null) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [status, search, page])

  useEffect(load, [load])

  return (
    <>
      <div className="admin-head">
        <div>
          <h1 className="large-title">Quote requests</h1>
          <p className="subtitle">Open a request to add pricing and send the formal quotation.</p>
        </div>
      </div>

      {stats && (
        <div className="stat-row">
          <div className="stat"><b>{stats.newCount}</b><span>Awaiting pricing</span></div>
          <div className="stat"><b>{stats.processedCount}</b><span>Processed</span></div>
          <div className="stat"><b>{stats.total}</b><span>All requests</span></div>
        </div>
      )}

      <div className="toolbar" style={{ marginTop: 0 }}>
        <Segmented value={status} onChange={(v) => { setStatus(v); setPage(0) }}
          options={[{ value: 'ALL', label: 'All' }, { value: 'NEW', label: 'New' }, { value: 'PROCESSED', label: 'Processed' }]} />
        <form className="search" onSubmit={(e) => { e.preventDefault(); setSearch(q.trim()); setPage(0) }}>
          <Icon name="search" size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search reference, company or name" aria-label="Search quotes" />
        </form>
      </div>

      {error && <div className="form-error">{error}</div>}
      {loading && !data ? <PageSpinner /> : data && data.items.length === 0 ? (
        <div className="table-card"><Empty icon="inbox" title="No requests yet" text="New quote requests from customers will appear here." /></div>
      ) : data && (
        <div className="table-card" style={{ opacity: loading ? 0.6 : 1, transition: 'opacity .2s' }}>
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Reference</th><th>Customer</th><th>Type</th>
                  <th className="center">Products</th><th className="center">Solutions</th>
                  <th>Received</th><th>Status</th><th className="num">Quoted total</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((r) => (
                  <tr key={r.id} className="clickable" onClick={() => navigate(`/admin/quotes/${r.id}`)}>
                    <td><span className="cell-title">{r.reference}</span></td>
                    <td><div className="cell-title">{r.customerName}</div><div className="cell-sub">{r.email}</div></td>
                    <td><span className="badge">{r.customerType === 'COMPANY' ? 'Company' : 'Individual'}</span></td>
                    <td className="center">{r.productCount}</td>
                    <td className="center">{r.solutionCount}</td>
                    <td>{dateTime(r.createdAt)}</td>
                    <td><span className={`badge ${r.status === 'NEW' ? 'orange' : 'green'}`}>{r.status === 'NEW' ? 'New' : 'Processed'}</span></td>
                    <td className="num">{r.total === null ? '-' : money(r.total)}</td>
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
