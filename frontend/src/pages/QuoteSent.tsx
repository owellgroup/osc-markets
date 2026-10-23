import { Link, Navigate, useLocation } from 'react-router-dom'
import Icon from '../components/Icon'

export default function QuoteSent() {
  const state = useLocation().state as { reference: string; email: string } | null
  if (!state) return <Navigate to="/" replace />

  return (
    <div className="container page">
    <div className="success">
      <div className="success-mark"><Icon name="check" size={40} stroke={2.4} /></div>
      <h1 className="large-title">Request received</h1>
      <p className="subtitle">
        Thank you. Your quote request <b style={{ color: 'var(--label)' }}>{state.reference}</b> is with our team and will be processed shortly.
      </p>
      <div className="grouped mt-24" style={{ textAlign: 'left' }}>
        <div className="row"><span className="row-label">Reference</span><span className="row-value">{state.reference}</span></div>
        <div className="row"><span className="row-label">Confirmation sent to</span><span className="row-value">{state.email}</span></div>
      </div>
      <p className="caption mt-16">Your formal quotation, with a PDF copy, will be emailed to the same address.</p>
      <Link to="/" className="btn mt-24">Continue browsing</Link>
    </div>
    </div>
  )
}
