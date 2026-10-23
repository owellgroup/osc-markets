import { useState, type ReactNode } from 'react'
import { assetUrl } from '../api/client'
import Icon from './Icon'
import Sheet from './Sheet'

/** Image that always fits its box, whatever the picture's size or shape. */
export function ImageBox({ src, alt, ratio = '4 / 3', className = '' }: { src?: string | null; alt: string; ratio?: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  const url = assetUrl(src)
  return (
    <div className={`image-box ${className}`} style={{ aspectRatio: ratio }}>
      {url && !failed ? (
        <>
          <img className="image-box-bg" src={url} alt="" aria-hidden="true" />
          <img className="image-box-img" src={url} alt={alt} loading="lazy" onError={() => setFailed(true)} />
        </>
      ) : (
        <div className="image-box-empty">
          <Icon name="photo" size={30} />
        </div>
      )}
    </div>
  )
}

export function Stepper({ value, onChange, min = 1, max = 9999, size = 'md' }: { value: number; onChange: (v: number) => void; min?: number; max?: number; size?: 'sm' | 'md' }) {
  return (
    <div className={`stepper stepper-${size}`}>
      <button type="button" aria-label="Decrease quantity" onClick={() => onChange(value - 1)} disabled={value <= min && min > 0 ? false : value <= 0}>
        <Icon name={value <= min && min === 1 && size === 'sm' ? 'trash' : 'minus'} size={size === 'sm' ? 15 : 17} />
      </button>
      <input
        inputMode="numeric"
        aria-label="Quantity"
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value.replace(/\D/g, ''), 10)
          onChange(Number.isNaN(n) ? min : Math.min(n, max))
        }}
      />
      <button type="button" aria-label="Increase quantity" onClick={() => onChange(Math.min(value + 1, max))}>
        <Icon name="plus" size={size === 'sm' ? 15 : 17} />
      </button>
    </div>
  )
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  const index = Math.max(0, options.findIndex((o) => o.value === value))
  return (
    <div className="segmented" role="tablist" style={{ ['--count' as string]: options.length, ['--index' as string]: index }}>
      <span className="segmented-thumb" />
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" aria-selected={o.value === value} className={o.value === value ? 'active' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`switch ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)}>
      <span />
    </button>
  )
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      {label && <span>{label}</span>}
    </div>
  )
}

export function EmptyState({ icon, title, children }: { icon: Parameters<typeof Icon>[0]['name']; title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon name={icon} size={30} />
      </div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  )
}

export function ConfirmSheet({ open, title, message, confirmLabel = 'Delete', busy, onConfirm, onCancel }: { open: boolean; title: string; message: string; confirmLabel?: string; busy?: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Sheet open={open} onClose={onCancel} title={title}>
      <p className="confirm-text">{message}</p>
      <div className="confirm-actions">
        <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>
          {busy ? 'Working…' : confirmLabel}
        </button>
        <button className="btn btn-plain" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </div>
    </Sheet>
  )
}
