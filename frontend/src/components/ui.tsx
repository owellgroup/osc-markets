import { useEffect, type ReactNode } from 'react'
import { assetUrl } from '../api/client'
import Icon from './Icon'

/* ------------------------------------------------------------------ Sheet */
export function Sheet({ title, onClose, children, footer, wide }: {
  title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div className="sheet-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`sheet${wide ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet-grabber" />
        <div className="sheet-head">
          <button className="btn-plain btn" type="button" onClick={onClose}>Cancel</button>
          <h3>{title}</h3>
          <span style={{ width: 52 }} />
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- Stepper */
export function Stepper({ value, onChange, min = 1, large }: { value: number; onChange: (v: number) => void; min?: number; large?: boolean }) {
  return (
    <div className={`stepper${large ? ' lg' : ''}`}>
      <button type="button" aria-label="Decrease quantity" onClick={() => onChange(value - 1)} disabled={value <= min && min > 0}>
        <Icon name="minus" size={16} stroke={2.2} />
      </button>
      <input type="number" inputMode="numeric" min={min} value={value} aria-label="Quantity"
        onWheel={(e) => e.currentTarget.blur()}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10)
          if (!Number.isNaN(n)) onChange(Math.max(min, Math.min(n, 9999)))
        }} />
      <button type="button" aria-label="Increase quantity" onClick={() => onChange(value + 1)}>
        <Icon name="plus" size={16} stroke={2.2} />
      </button>
    </div>
  )
}

/* -------------------------------------------------------------- Segmented */
export function Segmented<T extends string>({ value, options, onChange, block }: {
  value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; block?: boolean
}) {
  return (
    <div className={`segmented${block ? ' block' : ''}`} role="tablist">
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" aria-selected={o.value === value}
          className={o.value === value ? 'on' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* ----------------------------------------------------------------- Switch */
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="switch">
      <input type="checkbox" role="switch" aria-label={label} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span />
    </label>
  )
}

/* ------------------------------------------------------------------ Media */
/** Image that always fits its box (object-fit: contain), whatever its size or aspect ratio. */
export function Media({ src, alt, className = '' }: { src?: string | null; alt: string; className?: string }) {
  return (
    <div className={`media ${className}`}>
      {src ? <img src={assetUrl(src)} alt={alt} loading="lazy" /> : <span className="media-empty"><Icon name="image" size={40} stroke={1.3} /></span>}
    </div>
  )
}

export function Spinner({ dark }: { dark?: boolean }) {
  return <span className={`spinner${dark ? ' dark' : ''}`} />
}

export function PageSpinner() {
  return <div className="center-spin"><Spinner dark /></div>
}

export function Empty({ icon = 'box', title, text, action }: { icon?: string; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-icon"><Icon name={icon} size={34} stroke={1.4} /></div>
      <h2 className="title-2">{title}</h2>
      {text && <p className="muted mt-8">{text}</p>}
      {action && <div className="mt-16">{action}</div>}
    </div>
  )
}

export function ErrorNote({ message }: { message?: string | null }) {
  return message ? <div className="form-error" role="alert">{message}</div> : null
}

export function DemoNotice() {
  return (
    <div className="demo-notice" role="status">
      <Icon name="info" size={16} />
      <span>Sample catalogue — start the API to load live products and send quotes.</span>
    </div>
  )
}

export function typeLabel(type: string) {
  return type === 'SOLUTION' ? 'Solution' : 'Product'
}
