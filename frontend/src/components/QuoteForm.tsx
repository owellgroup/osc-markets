import { useEffect, useRef, useState, type ReactNode } from 'react'
import { api } from '../api/client'
import { fileSize } from '../api/format'
import type { BasketLine, CustomerType } from '../api/types'
import Icon from './Icon'
import { ErrorNote, Segmented, Sheet, Spinner } from './ui'

const DRAFT_KEY = 'osc.quoteform.v1'
const MAX_FILES = 5
const MAX_SIZE = 15 * 1024 * 1024

interface FormState {
  customerType: CustomerType
  companyName: string
  registrationNumber: string
  vatNumber: string
  companyEmail: string
  companyPhone: string
  companyAddress: string
  companyLocation: string
  contactName: string
  contactJobTitle: string
  contactEmail: string
  contactPhone: string
  deliveryAddress: string
  deliveryLocation: string
  questions: string
}

const empty: FormState = {
  customerType: 'COMPANY', companyName: '', registrationNumber: '', vatNumber: '', companyEmail: '', companyPhone: '',
  companyAddress: '', companyLocation: '', contactName: '', contactJobTitle: '', contactEmail: '', contactPhone: '',
  deliveryAddress: '', deliveryLocation: '', questions: '',
}

function loadDraft(): FormState {
  try {
    return { ...empty, ...JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}') }
  } catch {
    return empty
  }
}

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())

function Row({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="row row-input">
      <span className="row-label">{label}{required && <span className="req"> *</span>}</span>
      {children}
    </label>
  )
}

export default function QuoteForm({ lines, onClose, onSubmitted }: {
  lines: BasketLine[]
  onClose: () => void
  onSubmitted: (result: { reference: string; email: string }) => void
}) {
  const [form, setForm] = useState<FormState>(loadDraft)
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const isCompany = form.customerType === 'COMPANY'

  // keep what the customer typed in case they close the sheet or refresh
  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
  }, [form])

  const set = (key: keyof FormState) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const addFiles = (list: FileList | null) => {
    if (!list) return
    const next = [...files]
    for (const f of Array.from(list)) {
      if (f.size > MAX_SIZE) { setError(`"${f.name}" is larger than 15 MB`); continue }
      if (next.length >= MAX_FILES) { setError(`You can attach up to ${MAX_FILES} documents`); break }
      next.push(f)
    }
    setFiles(next)
    if (fileInput.current) fileInput.current.value = ''
  }

  const validate = (): string | null => {
    if (isCompany) {
      if (!form.companyName.trim()) return 'Please enter your company name'
      if (!emailOk(form.companyEmail)) return 'Please enter a valid company email'
      if (!form.companyAddress.trim()) return 'Please enter your company address'
    }
    if (!form.contactName.trim()) return isCompany ? 'Please enter the name of the person submitting' : 'Please enter your name'
    if (!emailOk(form.contactEmail)) return 'Please enter a valid email address'
    if (!form.deliveryAddress.trim()) return 'Please enter a delivery address'
    return null
  }

  const submit = async () => {
    const problem = validate()
    if (problem) { setError(problem); return }
    setBusy(true)
    setError(null)
    try {
      const payload = {
        ...form,
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity, options: l.options })),
      }
      const body = new FormData()
      body.append('quote', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
      files.forEach((f) => body.append('files', f))
      const res = await api<{ reference: string; email: string }>('/api/quotes', { method: 'POST', form: body })
      localStorage.removeItem(DRAFT_KEY)
      onSubmitted(res)
    } catch (e) {
      setError((e as Error).message)
      setBusy(false)
    }
  }

  return (
    <Sheet title="Request a Quote" onClose={onClose}
      footer={
        <>
          <ErrorNote message={error} />
          <button className="btn btn-block" style={{ marginTop: error ? 10 : 0 }} onClick={submit} disabled={busy}>
            {busy ? <Spinner /> : 'Submit Quote Request'}
          </button>
        </>
      }>
      <div style={{ marginTop: 6 }}>
        <Segmented block value={form.customerType} onChange={(v) => setForm((f) => ({ ...f, customerType: v }))}
          options={[{ value: 'COMPANY', label: 'Company' }, { value: 'INDIVIDUAL', label: 'Individual' }]} />
      </div>

      {isCompany && (
        <>
          <div className="group-label">Company information</div>
          <div className="grouped">
            <Row label="Company name" required><input className="input" value={form.companyName} onChange={set('companyName')} placeholder="Acme (Pty) Ltd" autoComplete="organization" /></Row>
            <Row label="Registration no."><input className="input" value={form.registrationNumber} onChange={set('registrationNumber')} placeholder="Optional" /></Row>
            <Row label="VAT number"><input className="input" value={form.vatNumber} onChange={set('vatNumber')} placeholder="Optional" /></Row>
            <Row label="Company email" required><input className="input" type="email" value={form.companyEmail} onChange={set('companyEmail')} placeholder="accounts@company.com" autoComplete="email" /></Row>
            <Row label="Company phone"><input className="input" type="tel" value={form.companyPhone} onChange={set('companyPhone')} placeholder="Optional" autoComplete="tel" /></Row>
            <Row label="Address" required><input className="input" value={form.companyAddress} onChange={set('companyAddress')} placeholder="Street, suburb, postal code" autoComplete="street-address" /></Row>
            <Row label="Location"><input className="input" value={form.companyLocation} onChange={set('companyLocation')} placeholder="City, province, country" /></Row>
          </div>
          <p className="group-footer">Your quotation will be emailed to the company email address.</p>
        </>
      )}

      <div className="group-label">{isCompany ? 'Submitting on behalf of the company' : 'Your details'}</div>
      <div className="grouped">
        <Row label="Full name" required><input className="input" value={form.contactName} onChange={set('contactName')} placeholder="Jane Doe" autoComplete="name" /></Row>
        {isCompany && <Row label="Job title"><input className="input" value={form.contactJobTitle} onChange={set('contactJobTitle')} placeholder="Optional" /></Row>}
        <Row label="Email" required><input className="input" type="email" value={form.contactEmail} onChange={set('contactEmail')} placeholder="you@example.com" autoComplete="email" /></Row>
        <Row label="Phone"><input className="input" type="tel" value={form.contactPhone} onChange={set('contactPhone')} placeholder="Optional" autoComplete="tel" /></Row>
      </div>
      {!isCompany && <p className="group-footer">Your quotation will be emailed to this address.</p>}

      <div className="group-label">Delivery</div>
      <div className="grouped">
        <Row label="Address" required><input className="input" value={form.deliveryAddress} onChange={set('deliveryAddress')} placeholder="Where should we deliver?" autoComplete="shipping street-address" /></Row>
        <Row label="Location"><input className="input" value={form.deliveryLocation} onChange={set('deliveryLocation')} placeholder="City, province" autoComplete="shipping address-level2" /></Row>
      </div>

      <div className="group-label">Questions or requirements</div>
      <div className="grouped">
        <div className="row"><textarea className="textarea" value={form.questions} onChange={set('questions')} placeholder="Anything we should know? Installation, timelines, alternatives, budget..." /></div>
      </div>

      <div className="group-label">Supporting documents <span className="badge" style={{ marginLeft: 6, textTransform: 'none' }}>Optional</span></div>
      <input ref={fileInput} type="file" multiple hidden onChange={(e) => addFiles(e.target.files)}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.ppt,.pptx,.zip,.png,.jpg,.jpeg" />
      <div className="dropzone" role="button" tabIndex={0} onClick={() => fileInput.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInput.current?.click()}
        onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files) }}>
        <span className="dz-icon"><Icon name="upload" size={22} /></span>
        <div>
          <div style={{ fontWeight: 600 }}>Upload BOMs, RFQs or tender documents</div>
          <div className="caption">Not required. PDF, Word, Excel, CSV or ZIP. Up to {MAX_FILES} files, 15 MB each.</div>
        </div>
      </div>
      {files.length > 0 && (
        <div className="grouped mt-12">
          {files.map((f, i) => (
            <div className="file-item" key={f.name + i}>
              <Icon name="doc" size={20} />
              <span className="name">{f.name}</span>
              <span className="caption">{fileSize(f.size)}</span>
              <button className="icon-btn" style={{ width: 28, height: 28 }} aria-label={`Remove ${f.name}`}
                onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}>
                <Icon name="close" size={14} stroke={2.2} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="group-label">Your basket</div>
      <div className="grouped">
        {lines.map((l) => (
          <div className="row" key={l.key}>
            <span style={{ flex: 1 }}>{l.name}</span>
            <span className="muted">× {l.quantity}</span>
          </div>
        ))}
      </div>
    </Sheet>
  )
}
