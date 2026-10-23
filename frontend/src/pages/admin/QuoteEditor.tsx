import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, downloadFile } from '../../api/client'
import { dateTime, fileSize, money } from '../../api/format'
import type { ProcessResult, QuoteDetail, QuoteItem } from '../../api/types'
import Icon from '../../components/Icon'
import { ErrorNote, PageSpinner, Spinner } from '../../components/ui'
import { useToast } from '../../context/ToastContext'

interface ItemState {
  price: string
  availability: string
  warranty: string
  deliveryTimeline: string
  sourcing: string
  notes: string
}

const num = (s: string): number | null => {
  const n = parseFloat(s.replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : null
}
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

function Kv({ label, children }: { label: string; children: ReactNode }) {
  return <><dt>{label}</dt><dd>{children || '-'}</dd></>
}

export default function QuoteEditor() {
  const { id } = useParams()
  const toast = useToast()
  const [quote, setQuote] = useState<QuoteDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<'save' | 'process' | 'resend' | null>(null)

  const [items, setItems] = useState<Record<number, ItemState>>({})
  const [deliveryFee, setDeliveryFee] = useState('0')
  const [discount, setDiscount] = useState('0')
  const [vat, setVat] = useState('15')
  const [validUntil, setValidUntil] = useState('')
  const [terms, setTerms] = useState({ availability: '', warranty: '', deliveryTimeline: '', sourcing: '', paymentTerms: '', additionalNotes: '' })

  const hydrate = (q: QuoteDetail) => {
    setQuote(q)
    setItems(Object.fromEntries(q.items.map((i) => [i.id, {
      price: i.unitPrice === null ? '' : String(i.unitPrice),
      availability: i.availability ?? '', warranty: i.warranty ?? '', deliveryTimeline: i.deliveryTimeline ?? '',
      sourcing: i.sourcing ?? '', notes: i.notes ?? '',
    }])))
    setDeliveryFee(String(q.deliveryFee ?? 0))
    setDiscount(String(q.discount ?? 0))
    setVat(String(q.vatPercent ?? 15))
    setValidUntil(q.validUntil ?? '')
    setTerms({
      availability: q.availability ?? '', warranty: q.warranty ?? '', deliveryTimeline: q.deliveryTimeline ?? '',
      sourcing: q.sourcing ?? '', paymentTerms: q.paymentTerms ?? '', additionalNotes: q.additionalNotes ?? '',
    })
  }

  useEffect(() => {
    api<QuoteDetail>(`/api/admin/quotes/${id}`, { admin: true }).then(hydrate).catch((e) => setError(e.message))
  }, [id])

  const totals = useMemo(() => {
    if (!quote) return null
    let products = 0, solutions = 0
    for (const it of quote.items) {
      const p = num(items[it.id]?.price ?? '')
      if (p !== null) {
        const line = round2(p * it.quantity)
        if (it.type === 'SOLUTION') solutions += line
        else products += line
      }
    }
    const fee = num(deliveryFee) ?? 0
    const disc = num(discount) ?? 0
    const net = products + solutions + fee - disc
    const vatAmount = round2(net * ((num(vat) ?? 0) / 100))
    return { products: round2(products), solutions: round2(solutions), fee, disc, vatAmount, total: round2(net + vatAmount) }
  }, [quote, items, deliveryFee, discount, vat])

  if (error && !quote) return <div className="form-error">{error}</div>
  if (!quote || !totals) return <PageSpinner />

  const setItem = (itemId: number, patch: Partial<ItemState>) =>
    setItems((prev) => ({ ...prev, [itemId]: { ...prev[itemId], ...patch } }))

  const payload = () => ({
    deliveryFee: num(deliveryFee) ?? 0,
    discount: num(discount) ?? 0,
    vatPercent: num(vat) ?? 0,
    validUntil: validUntil || null,
    ...terms,
    items: quote.items.map((i) => ({
      id: i.id,
      unitPrice: num(items[i.id]?.price ?? ''),
      availability: items[i.id]?.availability,
      warranty: items[i.id]?.warranty,
      deliveryTimeline: items[i.id]?.deliveryTimeline,
      sourcing: items[i.id]?.sourcing,
      notes: items[i.id]?.notes,
    })),
  })

  const save = async () => {
    setBusy('save'); setError(null)
    try {
      hydrate(await api<QuoteDetail>(`/api/admin/quotes/${quote.id}`, { method: 'PUT', body: payload(), admin: true }))
      toast('Draft saved')
    } catch (e) { setError((e as Error).message) } finally { setBusy(null) }
  }

  const process = async () => {
    const unpriced = quote.items.filter((i) => num(items[i.id]?.price ?? '') === null)
    if (unpriced.length) { setError(`Enter a price for: ${unpriced.map((i) => i.name).join(', ')}`); return }
    const verb = quote.status === 'PROCESSED' ? 're-send' : 'send'
    if (!window.confirm(`Save and ${verb} the formal quotation to ${quote.customerType === 'COMPANY' ? quote.companyEmail : quote.contactEmail}?`)) return
    setBusy('process'); setError(null)
    try {
      const res = await api<ProcessResult>(`/api/admin/quotes/${quote.id}/process`, { method: 'POST', body: payload(), admin: true })
      hydrate(res.quote)
      if (res.emailSent) toast('Quote processed and emailed to the client')
      else setError(res.emailError ?? 'The quote was saved but the email could not be sent.')
    } catch (e) { setError((e as Error).message) } finally { setBusy(null) }
  }

  const resend = async () => {
    setBusy('resend'); setError(null)
    try {
      const res = await api<ProcessResult>(`/api/admin/quotes/${quote.id}/resend`, { method: 'POST', admin: true })
      hydrate(res.quote)
      if (res.emailSent) toast('Quotation re-sent')
      else setError(res.emailError ?? 'The email could not be sent.')
    } catch (e) { setError((e as Error).message) } finally { setBusy(null) }
  }

  const recipient = quote.customerType === 'COMPANY' ? quote.companyEmail : quote.contactEmail
  const processed = quote.status === 'PROCESSED'

  const itemTable = (title: string, list: QuoteItem[], subtotal: number) => list.length > 0 && (
    <div className="mt-24">
      <div className="group-label" style={{ marginTop: 0 }}>{title}</div>
      <div className="table-card">
        <div className="table-scroll">
          <table className="table">
            <thead><tr><th>Item</th><th className="center">Qty</th><th className="num">Unit price (excl. VAT)</th><th className="num">Line total</th></tr></thead>
            <tbody>
              {list.map((it) => {
                const st = items[it.id]
                const p = num(st?.price ?? '')
                return (
                  <FragmentRows key={it.id}
                    main={
                      <tr>
                        <td style={{ borderBottom: 0 }}>
                          <div className="cell-title">{it.name}</div>
                          <div className="cell-sub">{[it.brandName, it.sku && `SKU ${it.sku}`, it.selectedOptions].filter(Boolean).join(' · ')}</div>
                        </td>
                        <td className="center" style={{ borderBottom: 0 }}><b>{it.quantity}</b></td>
                        <td className="num" style={{ borderBottom: 0 }}>
                          <input className="price-input" inputMode="decimal" placeholder="0.00" value={st?.price ?? ''}
                            onChange={(e) => setItem(it.id, { price: e.target.value })} aria-label={`Unit price for ${it.name}`} />
                        </td>
                        <td className="num" style={{ borderBottom: 0, fontWeight: 600 }}>{p === null ? '-' : money(round2(p * it.quantity))}</td>
                      </tr>
                    }
                    detail={
                      <tr className="item-detail">
                        <td colSpan={4}>
                          <div className="mini-grid">
                            <div><label>Availability</label><input className="mini-input" value={st?.availability ?? ''} onChange={(e) => setItem(it.id, { availability: e.target.value })} placeholder="e.g. In stock" /></div>
                            <div><label>Warranty</label><input className="mini-input" value={st?.warranty ?? ''} onChange={(e) => setItem(it.id, { warranty: e.target.value })} placeholder="e.g. 3 years" /></div>
                            <div><label>Delivery timeline</label><input className="mini-input" value={st?.deliveryTimeline ?? ''} onChange={(e) => setItem(it.id, { deliveryTimeline: e.target.value })} placeholder="e.g. 2 weeks" /></div>
                            <div><label>Sourcing</label><input className="mini-input" value={st?.sourcing ?? ''} onChange={(e) => setItem(it.id, { sourcing: e.target.value })} placeholder="e.g. Local distributor" /></div>
                            <div style={{ gridColumn: '1 / -1' }}><label>Note for the client</label><input className="mini-input" value={st?.notes ?? ''} onChange={(e) => setItem(it.id, { notes: e.target.value })} placeholder="Optional" /></div>
                          </div>
                        </td>
                      </tr>
                    } />
                )
              })}
              <tr><td colSpan={3} className="num" style={{ color: 'var(--label-2)' }}>{title} total</td><td className="num"><b>{money(subtotal)}</b></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Link to="/admin" className="breadcrumb"><Icon name="back" size={18} stroke={2.2} /> Quote requests</Link>
      <div className="admin-head mt-12">
        <div>
          <div className="flex items-center gap-12 wrap">
            <h1 className="large-title">{quote.reference}</h1>
            <span className={`badge ${processed ? 'green' : 'orange'}`}>{processed ? 'Processed' : 'New'}</span>
          </div>
          <p className="subtitle">Received {dateTime(quote.createdAt)}{quote.processedAt && ` · processed ${dateTime(quote.processedAt)}${quote.processedBy ? ` by ${quote.processedBy}` : ''}`}</p>
        </div>
        <div className="flex gap-8 wrap">
          <button className="btn btn-gray btn-sm" onClick={() => downloadFile(`/api/admin/quotes/${quote.id}/pdf`, `Quotation-${quote.reference}.pdf`, true).catch((e) => setError(e.message))}>
            <Icon name="pdf" size={17} /> Preview PDF
          </button>
          {processed && (
            <button className="btn btn-gray btn-sm" onClick={resend} disabled={busy !== null}>
              {busy === 'resend' ? <Spinner /> : <><Icon name="mail" size={17} /> Re-send email</>}
            </button>
          )}
        </div>
      </div>

      {processed && (
        <div className={`notice ${quote.emailError ? '' : ''}`} style={{ marginBottom: 14, background: quote.emailError ? 'rgba(255,59,48,.09)' : 'rgba(48,161,78,.1)', color: quote.emailError ? '#a0101a' : '#1f6b35' }}>
          <Icon name={quote.emailError ? 'info' : 'check'} size={18} />
          <span>{quote.emailError ? quote.emailError : `Quotation emailed to ${recipient} on ${dateTime(quote.emailSentAt)}.`}</span>
        </div>
      )}
      <ErrorNote message={error} />

      <div className="quote-grid" style={{ marginTop: error ? 14 : 0 }}>
        <div>
          <div className="grouped">
            <dl className="kv" style={{ margin: 0 }}>
              <Kv label="Type">{quote.customerType === 'COMPANY' ? 'Company' : 'Individual'}</Kv>
              {quote.customerType === 'COMPANY' && (
                <>
                  <Kv label="Company">{quote.companyName}</Kv>
                  <Kv label="Registration">{quote.registrationNumber}</Kv>
                  <Kv label="VAT number">{quote.vatNumber}</Kv>
                  <Kv label="Company email">{quote.companyEmail}</Kv>
                  <Kv label="Company phone">{quote.companyPhone}</Kv>
                  <Kv label="Address">{[quote.companyAddress, quote.companyLocation].filter(Boolean).join(', ')}</Kv>
                </>
              )}
              <Kv label={quote.customerType === 'COMPANY' ? 'Submitted by' : 'Name'}>{quote.contactName}{quote.contactJobTitle && ` (${quote.contactJobTitle})`}</Kv>
              <Kv label="Email">{quote.contactEmail}</Kv>
              <Kv label="Phone">{quote.contactPhone}</Kv>
              <Kv label="Deliver to">{[quote.deliveryAddress, quote.deliveryLocation].filter(Boolean).join(', ')}</Kv>
              <Kv label="Quote goes to"><b>{recipient}</b></Kv>
            </dl>
          </div>

          {quote.questions && (
            <>
              <div className="group-label">Customer questions</div>
              <div className="grouped"><p className="desc" style={{ padding: '14px 16px', fontSize: 15 }}>{quote.questions}</p></div>
            </>
          )}

          {quote.attachments.length > 0 && (
            <>
              <div className="group-label">Uploaded documents</div>
              <div className="grouped">
                {quote.attachments.map((a) => (
                  <div className="file-item" key={a.id}>
                    <Icon name="doc" size={20} />
                    <span className="name">{a.name}</span>
                    <span className="caption">{fileSize(a.sizeBytes)}</span>
                    <button className="btn btn-tinted btn-sm" onClick={() => downloadFile(`/api/admin/quotes/${quote.id}/attachments/${a.id}`, a.name).catch((e) => setError(e.message))}>Download</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {itemTable('Products', quote.items.filter((i) => i.type === 'PRODUCT'), totals.products)}
          {itemTable('Solutions', quote.items.filter((i) => i.type === 'SOLUTION'), totals.solutions)}

          <div className="group-label">Terms shown on the quotation</div>
          <div className="grouped">
            <label className="row row-input"><span className="row-label">Valid until</span><input className="input" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} /></label>
            <label className="row row-input"><span className="row-label">Availability</span><input className="input" value={terms.availability} onChange={(e) => setTerms({ ...terms, availability: e.target.value })} placeholder="e.g. Ex-stock, 3 units on order" /></label>
            <label className="row row-input"><span className="row-label">Warranty</span><input className="input" value={terms.warranty} onChange={(e) => setTerms({ ...terms, warranty: e.target.value })} placeholder="e.g. 3 years return-to-base" /></label>
            <label className="row row-input"><span className="row-label">Delivery</span><input className="input" value={terms.deliveryTimeline} onChange={(e) => setTerms({ ...terms, deliveryTimeline: e.target.value })} placeholder="e.g. 2 to 3 weeks after payment" /></label>
            <label className="row row-input"><span className="row-label">Sourcing</span><input className="input" value={terms.sourcing} onChange={(e) => setTerms({ ...terms, sourcing: e.target.value })} placeholder="e.g. Sourced from local distributor" /></label>
            <label className="row row-input"><span className="row-label">Payment terms</span><input className="input" value={terms.paymentTerms} onChange={(e) => setTerms({ ...terms, paymentTerms: e.target.value })} placeholder="e.g. 100% upfront by EFT" /></label>
            <div className="row row-stack"><span className="row-label">Other details for the client</span>
              <textarea className="textarea" value={terms.additionalNotes} onChange={(e) => setTerms({ ...terms, additionalNotes: e.target.value })} placeholder="Anything else the client needs to see on the quote" /></div>
          </div>
        </div>

        <aside className="card totals">
          <h2 className="title-3">Quote totals</h2>
          <div className="mt-12">
            <div className="summary-row"><span className="muted">Products total</span><span>{money(totals.products)}</span></div>
            <div className="summary-row"><span className="muted">Solutions total</span><span>{money(totals.solutions)}</span></div>
            <div className="summary-row"><span className="muted">Delivery fee</span>
              <input className="price-input" style={{ width: 100 }} inputMode="decimal" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} aria-label="Delivery fee" /></div>
            <div className="summary-row"><span className="muted">Discount</span>
              <input className="price-input" style={{ width: 100 }} inputMode="decimal" value={discount} onChange={(e) => setDiscount(e.target.value)} aria-label="Discount" /></div>
            <div className="summary-row"><span className="muted">VAT %</span>
              <input className="price-input" style={{ width: 100 }} inputMode="decimal" value={vat} onChange={(e) => setVat(e.target.value)} aria-label="VAT percent" /></div>
            <div className="summary-row"><span className="muted">VAT amount</span><span>{money(totals.vatAmount)}</span></div>
            <div className="summary-row total"><span>Total</span><span>{money(totals.total)}</span></div>
          </div>
          <button className="btn btn-block mt-16" onClick={process} disabled={busy !== null}>
            {busy === 'process' ? <Spinner /> : processed ? 'Save & Re-send' : 'Process'}
          </button>
          <button className="btn btn-gray btn-block mt-8" onClick={save} disabled={busy !== null}>
            {busy === 'save' ? <Spinner /> : 'Save draft'}
          </button>
          <p className="caption mt-12">
            Processing saves this quote and emails the formal quotation, with a PDF attached, to <b>{recipient}</b>.
          </p>
        </aside>
      </div>
    </>
  )
}

function FragmentRows({ main, detail }: { main: ReactNode; detail: ReactNode }) {
  return <>{main}{detail}</>
}
