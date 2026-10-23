import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, assetUrl, uploadImage } from '../../api/client'
import type { Named, OptionDef, Product, ProductType, Spec } from '../../api/types'
import Icon from '../../components/Icon'
import { ErrorNote, PageSpinner, Segmented, Spinner, Switch } from '../../components/ui'
import { useToast } from '../../context/ToastContext'

export default function ProductForm() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const toast = useToast()
  const fileInput = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [categories, setCategories] = useState<Named[]>([])
  const [brands, setBrands] = useState<Named[]>([])
  const [allOptions, setAllOptions] = useState<OptionDef[]>([])

  const [type, setType] = useState<ProductType>('PRODUCT')
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [summary, setSummary] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [brandId, setBrandId] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [specs, setSpecs] = useState<Spec[]>([])
  const [optionIds, setOptionIds] = useState<number[]>([])
  const [featured, setFeatured] = useState(false)
  const [active, setActive] = useState(true)

  useEffect(() => {
    Promise.all([
      api<Named[]>('/api/admin/categories', { admin: true }),
      api<Named[]>('/api/admin/brands', { admin: true }),
      api<OptionDef[]>('/api/admin/options', { admin: true }),
    ]).then(([c, b, o]) => { setCategories(c); setBrands(b); setAllOptions(o) }).catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    if (isNew) return
    api<Product>(`/api/admin/products/${id}`, { admin: true })
      .then((p) => {
        setType(p.type); setName(p.name); setSku(p.sku ?? ''); setSummary(p.summary ?? ''); setDescription(p.description ?? '')
        setCategoryId(p.categoryId ? String(p.categoryId) : ''); setBrandId(p.brandId ? String(p.brandId) : '')
        setImages(p.images); setSpecs(p.specifications); setOptionIds(p.options.map((o) => o.id))
        setFeatured(p.featured); setActive(p.active)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id, isNew])

  const upload = async (list: FileList | null) => {
    if (!list || list.length === 0) return
    setUploading(true); setError(null)
    try {
      const paths: string[] = []
      for (const f of Array.from(list)) paths.push(await uploadImage(f))
      setImages((prev) => [...prev, ...paths])
    } catch (e) { setError((e as Error).message) } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const save = async () => {
    if (!name.trim()) { setError('Please enter a name'); return }
    setSaving(true); setError(null)
    const body = {
      name, sku, type, summary, description,
      categoryId: categoryId ? Number(categoryId) : null,
      brandId: brandId ? Number(brandId) : null,
      images, specifications: specs, optionIds, featured, active,
    }
    try {
      await api(isNew ? '/api/admin/products' : `/api/admin/products/${id}`, { method: isNew ? 'POST' : 'PUT', body, admin: true })
      toast(isNew ? 'Created' : 'Saved')
      navigate('/admin/products')
    } catch (e) { setError((e as Error).message); setSaving(false) }
  }

  if (loading) return <PageSpinner />
  const noun = type === 'SOLUTION' ? 'solution' : 'product'

  return (
    <div style={{ maxWidth: 760 }}>
      <Link to="/admin/products" className="breadcrumb"><Icon name="back" size={18} stroke={2.2} /> Products & solutions</Link>
      <h1 className="large-title mt-12">{isNew ? `New ${noun}` : `Edit ${noun}`}</h1>

      <div className="mt-16"><Segmented value={type} onChange={setType} options={[{ value: 'PRODUCT', label: 'Product' }, { value: 'SOLUTION', label: 'Solution' }]} /></div>

      <div className="group-label">Details</div>
      <div className="grouped">
        <label className="row row-input"><span className="row-label">Name</span><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Required" /></label>
        <label className="row row-input"><span className="row-label">SKU</span><input className="input" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Optional, must be unique" /></label>
        <label className="row row-input"><span className="row-label">Category</span>
          <select className="select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">None</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select></label>
        <label className="row row-input"><span className="row-label">Brand</span>
          <select className="select" value={brandId} onChange={(e) => setBrandId(e.target.value)}>
            <option value="">None</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select></label>
        <label className="row row-input"><span className="row-label">Short summary</span><input className="input" value={summary} onChange={(e) => setSummary(e.target.value)} maxLength={500} placeholder="Shown on cards" /></label>
        <div className="row row-stack"><span className="row-label">Description</span>
          <textarea className="textarea" style={{ minHeight: 120 }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Full description shown on the detail page" /></div>
      </div>
      {categories.length === 0 && <p className="group-footer">No categories yet. Create them under Categories.</p>}

      <div className="group-label">Images</div>
      <div className="grouped" style={{ padding: 14 }}>
        <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
        <div className="img-uploader">
          {images.map((img, i) => (
            <div className="img-tile" key={img}>
              <img src={assetUrl(img)} alt="" />
              <button aria-label="Remove image" onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}><Icon name="close" size={12} stroke={2.6} /></button>
            </div>
          ))}
          <button type="button" className="img-add" onClick={() => fileInput.current?.click()} disabled={uploading}>
            {uploading ? <Spinner dark /> : <span><Icon name="plus" size={22} /><br />Add</span>}
          </button>
        </div>
        <p className="caption mt-12">Any size works. Images are fitted into the cards automatically. The first image is the cover.</p>
      </div>

      <div className="group-label">Available options</div>
      <div className="grouped" style={{ padding: 14 }}>
        {allOptions.length === 0 ? <span className="muted">No options created yet. Add them under Available options.</span> : (
          <div className="check-list">
            {allOptions.map((o) => {
              const on = optionIds.includes(o.id)
              return (
                <label key={o.id} className={`check-pill${on ? ' on' : ''}`}>
                  <input type="checkbox" checked={on} onChange={() => setOptionIds((prev) => on ? prev.filter((x) => x !== o.id) : [...prev, o.id])} />
                  {on && <Icon name="check" size={14} stroke={2.6} />}
                  {o.name} <span className="muted" style={{ fontWeight: 400 }}>({o.values.length})</span>
                </label>
              )
            })}
          </div>
        )}
      </div>
      <p className="group-footer">Customers choose one value for each selected option before adding to their basket.</p>

      <div className="group-label">Specifications</div>
      <div className="grouped" style={{ padding: 14 }}>
        {specs.map((s, i) => (
          <div className="spec-row" key={i}>
            <input className="field-input sm" placeholder="Label (e.g. Power)" value={s.label} onChange={(e) => setSpecs((p) => p.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))} />
            <input className="field-input sm" placeholder="Value (e.g. 740 W)" value={s.value} onChange={(e) => setSpecs((p) => p.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x))} />
            <button className="icon-btn" aria-label="Remove specification" onClick={() => setSpecs((p) => p.filter((_, idx) => idx !== i))}><Icon name="close" size={14} stroke={2.2} /></button>
          </div>
        ))}
        <button className="btn btn-tinted btn-sm" onClick={() => setSpecs((p) => [...p, { label: '', value: '' }])}><Icon name="plus" size={15} stroke={2.4} /> Add specification</button>
      </div>

      <div className="group-label">Visibility</div>
      <div className="grouped">
        <div className="row"><span style={{ flex: 1 }}>Visible on the website</span><Switch checked={active} onChange={setActive} label="Visible" /></div>
        <div className="row"><span style={{ flex: 1 }}>Show first in lists</span><Switch checked={featured} onChange={setFeatured} label="Featured" /></div>
      </div>

      <div className="mt-24"><ErrorNote message={error} /></div>
      <div className="flex gap-12 mt-16">
        <button className="btn" onClick={save} disabled={saving || uploading}>{saving ? <Spinner /> : isNew ? `Create ${noun}` : 'Save changes'}</button>
        <Link to="/admin/products" className="btn btn-gray">Cancel</Link>
      </div>
    </div>
  )
}
