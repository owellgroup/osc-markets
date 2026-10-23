import { useCallback, useEffect, useRef, useState } from 'react'
import { api, assetUrl, uploadImage } from '../../api/client'
import type { Banner, Page, Product } from '../../api/types'
import { BG_STYLES, bannerBackground, bannerFill, shade } from '../../bannerStyle'
import Icon from '../../components/Icon'
import { Empty, ErrorNote, PageSpinner, Sheet, Spinner, Switch } from '../../components/ui'
import { useToast } from '../../context/ToastContext'

const MAX = 4
const COLORS = [
  { name: 'OSC red', value: '#D71920' },
  { name: 'Black', value: '#1C1C1E' },
  { name: 'Charcoal', value: '#58595B' },
  { name: 'Navy', value: '#0B2545' },
  { name: 'Blue', value: '#0A84FF' },
  { name: 'Green', value: '#1F7A38' },
]

interface Draft {
  id?: number
  title: string
  description: string
  backgroundColor: string
  backgroundColor2: string
  backgroundStyle: string
  imagePath: string
  ctaText: string
  linkUrl: string
  ctaText2: string
  linkUrl2: string
  active: boolean
}

function productLink(url: string) {
  return url === '' || /^\/product\/\d+$/.test(url)
}

function fromBanner(b: Banner): Draft {
  const color = b.backgroundColor ?? '#D71920'
  return {
    id: b.id,
    title: b.title ?? '',
    description: b.description ?? '',
    backgroundColor: color,
    backgroundColor2: b.backgroundColor2 ?? shade(color),
    backgroundStyle: b.backgroundStyle ?? 'solid',
    imagePath: b.imagePath ?? '',
    ctaText: b.ctaText ?? '',
    linkUrl: b.linkUrl ?? '',
    ctaText2: b.ctaText2 ?? '',
    linkUrl2: b.linkUrl2 ?? '',
    active: b.active,
  }
}

const emptyDraft = (): Draft => ({
  title: '',
  description: '',
  backgroundColor: '#D71920',
  backgroundColor2: '#8B1016',
  backgroundStyle: 'glow',
  imagePath: '',
  ctaText: 'Shop now',
  linkUrl: '',
  ctaText2: 'Learn more',
  linkUrl2: '/products',
  active: true,
})

export default function Banners() {
  const toast = useToast()
  const fileInput = useRef<HTMLInputElement>(null)
  const [banners, setBanners] = useState<Banner[] | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [draft, setDraft] = useState<Draft | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    api<Banner[]>('/api/admin/banners', { admin: true }).then(setBanners).catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    load()
    api<Page<Product>>('/api/admin/products?size=100', { admin: true }).then((p) => setProducts(p.items)).catch(() => undefined)
  }, [load])

  const open = (b?: Banner) => {
    setError(null)
    setDraft(b ? fromBanner(b) : emptyDraft())
  }

  const upload = async (file?: File) => {
    if (!file || !draft) return
    setUploading(true); setError(null)
    try { setDraft({ ...draft, imagePath: await uploadImage(file) }) }
    catch (e) { setError((e as Error).message) }
    finally { setUploading(false); if (fileInput.current) fileInput.current.value = '' }
  }

  const bodyOf = (d: Draft) => ({
    title: d.title,
    description: d.description,
    backgroundColor: d.backgroundColor,
    backgroundColor2: d.backgroundColor2,
    backgroundStyle: d.backgroundStyle,
    imagePath: d.imagePath,
    ctaText: d.ctaText,
    linkUrl: d.linkUrl,
    ctaText2: d.ctaText2,
    linkUrl2: d.linkUrl2,
    active: d.active,
  })

  const save = async () => {
    if (!draft) return
    if (!draft.title.trim()) { setError('Enter a title'); return }
    if (draft.ctaText.trim() && !draft.linkUrl.trim()) { setError('Choose where the first button should link to'); return }
    if (draft.ctaText2.trim() && !draft.linkUrl2.trim()) { setError('Choose where the second button should link to'); return }
    setSaving(true); setError(null)
    try {
      if (draft.id) await api(`/api/admin/banners/${draft.id}`, { method: 'PUT', body: bodyOf(draft), admin: true })
      else await api('/api/admin/banners', { method: 'POST', body: bodyOf(draft), admin: true })
      setDraft(null); toast('Banner saved'); load()
    } catch (e) { setError((e as Error).message) } finally { setSaving(false) }
  }

  const remove = async (b: Banner) => {
    if (!window.confirm('Delete this banner?')) return
    try { await api(`/api/admin/banners/${b.id}`, { method: 'DELETE', admin: true }); toast('Deleted'); load() }
    catch (e) { toast((e as Error).message, 'error') }
  }

  const toggle = async (b: Banner, active: boolean) => {
    try {
      await api(`/api/admin/banners/${b.id}`, { method: 'PUT', admin: true, body: {
        title: b.title, description: b.description,
        backgroundColor: b.backgroundColor, backgroundColor2: b.backgroundColor2, backgroundStyle: b.backgroundStyle,
        imagePath: b.imagePath, ctaText: b.ctaText, linkUrl: b.linkUrl,
        ctaText2: b.ctaText2, linkUrl2: b.linkUrl2, position: b.position, active,
      } })
      load()
    } catch (e) { toast((e as Error).message, 'error') }
  }

  const pickColor = (value: string) => {
    if (!draft) return
    setDraft({ ...draft, backgroundColor: value, backgroundColor2: shade(value) })
  }

  const linkField = (value: string, onChange: (v: string) => void, label: string) => (
    <div className="field">
      <span className="field-label">{label}</span>
      {productLink(value) ? (
        <select className="field-input" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Choose an item…</option>
          {products.map((p) => <option key={p.id} value={`/product/${p.id}`}>{p.type === 'SOLUTION' ? 'Solution' : 'Product'}: {p.name}</option>)}
          <option value="__custom">Custom link…</option>
        </select>
      ) : (
        <input className="field-input" value={value === '__custom' ? '' : value}
          onChange={(e) => onChange(e.target.value)} placeholder="/products or https://example.com" />
      )}
    </div>
  )

  const preview = (b: Pick<Draft, 'title' | 'description' | 'backgroundColor' | 'backgroundColor2' | 'backgroundStyle' | 'imagePath' | 'ctaText' | 'ctaText2'>, large?: boolean) => (
    <div className={`banner-preview${large ? ' banner-preview-lg' : ''}`} style={{ background: bannerBackground(b) }}>
      <div className="banner-preview-copy">
        <strong>{b.title || 'Title'}</strong>
        <span>{b.description || (large ? 'Description appears here' : '')}</span>
        {(b.ctaText || b.ctaText2) && (
          <div className="banner-preview-actions">
            {b.ctaText && <em className="primary">{b.ctaText}</em>}
            {b.ctaText2 && <em>{b.ctaText2}</em>}
          </div>
        )}
      </div>
      {b.imagePath
        ? <img src={assetUrl(b.imagePath)} alt="" />
        : large ? <div className="banner-preview-empty">Picture sits here</div> : null}
    </div>
  )

  return (
    <>
      <div className="admin-head">
        <div>
          <h1 className="large-title">Banners</h1>
          <p className="subtitle">Up to {MAX} slides. Pick colours, a background style, title, two buttons, and a picture on the right.</p>
        </div>
        <button className="btn btn-sm" onClick={() => open()} disabled={(banners?.length ?? 0) >= MAX}>
          <Icon name="plus" size={16} stroke={2.4} /> New banner
        </button>
      </div>
      {error && !draft && <div className="form-error">{error}</div>}
      {!banners ? <PageSpinner /> : banners.length === 0 ? (
        <div className="table-card"><Empty icon="image" title="No banners yet" text="Add a title, colours, a background style and a picture." /></div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {banners.map((b) => (
            <div className="banner-admin" key={b.id}>
              {preview({
                title: b.title ?? 'Untitled',
                description: b.description ?? '',
                backgroundColor: b.backgroundColor ?? '#D71920',
                backgroundColor2: b.backgroundColor2 ?? '',
                backgroundStyle: b.backgroundStyle ?? 'solid',
                imagePath: b.imagePath ?? '',
                ctaText: b.ctaText ?? '',
                ctaText2: b.ctaText2 ?? '',
              })}
              <div style={{ padding: 14 }}>
                <div className="caption">{b.backgroundStyle || 'solid'}</div>
                <div className="flex items-center gap-8 mt-12">
                  <Switch checked={b.active} onChange={(v) => toggle(b, v)} label="Active" />
                  <span className="caption grow">{b.active ? 'Showing' : 'Hidden'}</span>
                  <button className="icon-btn" aria-label="Edit banner" onClick={() => open(b)}><Icon name="edit" size={16} /></button>
                  <button className="icon-btn" aria-label="Delete banner" onClick={() => remove(b)}><Icon name="trash" size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {draft && (
        <Sheet title={draft.id ? 'Edit banner' : 'New banner'} wide onClose={() => setDraft(null)}
          footer={<button className="btn btn-block" onClick={save} disabled={saving || uploading}>{saving ? <Spinner /> : 'Save banner'}</button>}>
          <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />

          {preview(draft, true)}

          <div className="group-label">Colours</div>
          <div className="color-swatches">
            {COLORS.map((c) => (
              <button key={c.value} type="button" className={`color-swatch${draft.backgroundColor.toUpperCase() === c.value ? ' on' : ''}`}
                style={{ background: c.value }} aria-label={c.name} onClick={() => pickColor(c.value)} />
            ))}
          </div>
          <div className="color-pair">
            <label className="color-custom">
              <input type="color" value={draft.backgroundColor} onChange={(e) => setDraft({ ...draft, backgroundColor: e.target.value.toUpperCase() })} />
              Colour 1
            </label>
            <label className="color-custom">
              <input type="color" value={draft.backgroundColor2} onChange={(e) => setDraft({ ...draft, backgroundColor2: e.target.value.toUpperCase() })} />
              Colour 2
            </label>
          </div>

          <div className="group-label">Background style</div>
          <div className="bg-styles">
            {BG_STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`bg-style${draft.backgroundStyle === s.id ? ' on' : ''}`}
                style={{ background: bannerFill(draft.backgroundColor, draft.backgroundColor2, s.id) }}
                onClick={() => setDraft({ ...draft, backgroundStyle: s.id })}
              >
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          <div className="group-label">Content</div>
          <div className="grouped">
            <label className="row row-input"><span className="row-label" style={{ minWidth: 110 }}>Title</span>
              <input className="input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Required" /></label>
            <div className="row row-stack">
              <span className="row-label">Description</span>
              <textarea className="textarea" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="A short paragraph under the title" />
            </div>
          </div>

          <div className="group-label">Picture on the right</div>
          {draft.imagePath ? (
            <div className="flex items-center gap-12 wrap">
              <img src={assetUrl(draft.imagePath)} alt="" style={{ height: 72, width: 'auto', objectFit: 'contain' }} />
              <button className="btn btn-gray btn-sm" type="button" onClick={() => fileInput.current?.click()} disabled={uploading}>{uploading ? <Spinner /> : 'Replace picture'}</button>
              <button className="btn btn-plain" type="button" onClick={() => setDraft({ ...draft, imagePath: '' })}>Remove</button>
            </div>
          ) : (
            <div className="dropzone" role="button" tabIndex={0} onClick={() => fileInput.current?.click()} onKeyDown={(e) => e.key === 'Enter' && fileInput.current?.click()}>
              <span className="dz-icon">{uploading ? <Spinner dark /> : <Icon name="upload" size={22} />}</span>
              <div>
                <div style={{ fontWeight: 600 }}>Upload a picture</div>
                <div className="caption">PNG or any size. It sits on top of the background, on the right.</div>
              </div>
            </div>
          )}

          <div className="group-label">First button</div>
          <div className="grouped" style={{ marginBottom: 12 }}>
            <label className="row row-input"><span className="row-label" style={{ minWidth: 110 }}>Label</span>
              <input className="input" value={draft.ctaText} onChange={(e) => setDraft({ ...draft, ctaText: e.target.value })} placeholder="e.g. Shop now" /></label>
          </div>
          {linkField(draft.linkUrl, (v) => setDraft({ ...draft, linkUrl: v === '__custom' ? 'https://' : v }), 'Links to')}

          <div className="group-label">Second button</div>
          <div className="grouped" style={{ marginBottom: 12 }}>
            <label className="row row-input"><span className="row-label" style={{ minWidth: 110 }}>Label</span>
              <input className="input" value={draft.ctaText2} onChange={(e) => setDraft({ ...draft, ctaText2: e.target.value })} placeholder="e.g. Learn more" /></label>
          </div>
          {linkField(draft.linkUrl2, (v) => setDraft({ ...draft, linkUrl2: v === '__custom' ? 'https://' : v }), 'Links to')}

          <div className="grouped mt-16">
            <div className="row"><span style={{ flex: 1 }}>Show on website</span><Switch checked={draft.active} onChange={(v) => setDraft({ ...draft, active: v })} label="Active" /></div>
          </div>
          <div className="mt-12"><ErrorNote message={error} /></div>
        </Sheet>
      )}
    </>
  )
}
