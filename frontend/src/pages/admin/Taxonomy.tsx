import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { Named, OptionDef } from '../../api/types'
import Icon from '../../components/Icon'
import { Empty, ErrorNote, PageSpinner, Sheet, Spinner } from '../../components/ui'
import { useToast } from '../../context/ToastContext'

/* ------------------------------------------------- categories & brands */
export function NamedManager({ kind }: { kind: 'categories' | 'brands' }) {
  const toast = useToast()
  const singular = kind === 'categories' ? 'category' : 'brand'
  const [items, setItems] = useState<Named[] | null>(null)
  const [editing, setEditing] = useState<Partial<Named> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    api<Named[]>(`/api/admin/${kind}`, { admin: true }).then(setItems).catch((e) => setError(e.message))
  }, [kind])
  useEffect(() => { setItems(null); load() }, [load])

  const save = async () => {
    if (!editing?.name?.trim()) { setError('Please enter a name'); return }
    setSaving(true); setError(null)
    try {
      const body = { name: editing.name, description: editing.description ?? '' }
      if (editing.id) await api(`/api/admin/${kind}/${editing.id}`, { method: 'PUT', body, admin: true })
      else await api(`/api/admin/${kind}`, { method: 'POST', body, admin: true })
      setEditing(null)
      toast('Saved')
      load()
    } catch (e) { setError((e as Error).message) } finally { setSaving(false) }
  }

  const remove = async (n: Named) => {
    if (!window.confirm(`Delete ${singular} "${n.name}"?`)) return
    try {
      await api(`/api/admin/${kind}/${n.id}`, { method: 'DELETE', admin: true })
      toast('Deleted'); load()
    } catch (e) { toast((e as Error).message, 'error') }
  }

  return (
    <>
      <div className="admin-head">
        <div>
          <h1 className="large-title" style={{ textTransform: 'capitalize' }}>{kind}</h1>
          <p className="subtitle">{kind === 'categories' ? 'Group products and solutions so customers can find them.' : 'The brands you supply.'}</p>
        </div>
        <button className="btn btn-sm" onClick={() => { setError(null); setEditing({ name: '', description: '' }) }}>
          <Icon name="plus" size={16} stroke={2.4} /> New {singular}
        </button>
      </div>
      {error && !editing && <div className="form-error">{error}</div>}
      {!items ? <PageSpinner /> : items.length === 0 ? (
        <div className="table-card"><Empty icon="tag" title={`No ${kind} yet`} /></div>
      ) : (
        <div className="grouped">
          {items.map((n) => (
            <div className="row" key={n.id}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{n.name}</div>
                {n.description && <div className="caption">{n.description}</div>}
              </div>
              <button className="icon-btn" aria-label={`Edit ${n.name}`} onClick={() => { setError(null); setEditing(n) }}><Icon name="edit" size={16} /></button>
              <button className="icon-btn" aria-label={`Delete ${n.name}`} onClick={() => remove(n)}><Icon name="trash" size={16} /></button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Sheet title={editing.id ? `Edit ${singular}` : `New ${singular}`} onClose={() => setEditing(null)}
          footer={<button className="btn btn-block" onClick={save} disabled={saving}>{saving ? <Spinner /> : 'Save'}</button>}>
          <div className="grouped" style={{ marginTop: 8 }}>
            <label className="row row-input"><span className="row-label" style={{ minWidth: 90 }}>Name</span><input className="input" autoFocus value={editing.name ?? ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></label>
            <label className="row row-input"><span className="row-label" style={{ minWidth: 90 }}>Description</span><input className="input" value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Optional" /></label>
          </div>
          <div className="mt-12"><ErrorNote message={error} /></div>
        </Sheet>
      )}
    </>
  )
}

/* ------------------------------------------------------------ options */
export function OptionsManager() {
  const toast = useToast()
  const [items, setItems] = useState<OptionDef[] | null>(null)
  const [editing, setEditing] = useState<{ id?: number; name: string; values: string[] } | null>(null)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    api<OptionDef[]>('/api/admin/options', { admin: true }).then(setItems).catch((e) => setError(e.message))
  }, [])
  useEffect(load, [load])

  const addValue = () => {
    const v = draft.trim()
    if (!v || !editing) return
    if (!editing.values.includes(v)) setEditing({ ...editing, values: [...editing.values, v] })
    setDraft('')
  }

  const save = async () => {
    if (!editing) return
    const values = draft.trim() && !editing.values.includes(draft.trim()) ? [...editing.values, draft.trim()] : editing.values
    if (!editing.name.trim()) { setError('Please enter a name'); return }
    if (values.length === 0) { setError('Add at least one value'); return }
    setSaving(true); setError(null)
    try {
      const body = { name: editing.name, values }
      if (editing.id) await api(`/api/admin/options/${editing.id}`, { method: 'PUT', body, admin: true })
      else await api('/api/admin/options', { method: 'POST', body, admin: true })
      setEditing(null); setDraft(''); toast('Saved'); load()
    } catch (e) { setError((e as Error).message) } finally { setSaving(false) }
  }

  const remove = async (o: OptionDef) => {
    if (!window.confirm(`Delete "${o.name}"? It will be removed from every product that uses it.`)) return
    try {
      await api(`/api/admin/options/${o.id}`, { method: 'DELETE', admin: true })
      toast('Deleted'); load()
    } catch (e) { toast((e as Error).message, 'error') }
  }

  return (
    <>
      <div className="admin-head">
        <div>
          <h1 className="large-title">Available options</h1>
          <p className="subtitle">Choices customers pick on a product, such as colour, memory or warranty term.</p>
        </div>
        <button className="btn btn-sm" onClick={() => { setError(null); setDraft(''); setEditing({ name: '', values: [] }) }}>
          <Icon name="plus" size={16} stroke={2.4} /> New option
        </button>
      </div>
      {error && !editing && <div className="form-error">{error}</div>}
      {!items ? <PageSpinner /> : items.length === 0 ? (
        <div className="table-card"><Empty icon="slider" title="No options yet" text="Create an option, then attach it to products." /></div>
      ) : (
        <div className="grouped">
          {items.map((o) => (
            <div className="row" key={o.id}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{o.name}</div>
                <div className="flex gap-8 wrap mt-8">{o.values.map((v) => <span className="badge" key={v}>{v}</span>)}</div>
              </div>
              <button className="icon-btn" aria-label={`Edit ${o.name}`} onClick={() => { setError(null); setDraft(''); setEditing({ id: o.id, name: o.name, values: o.values }) }}><Icon name="edit" size={16} /></button>
              <button className="icon-btn" aria-label={`Delete ${o.name}`} onClick={() => remove(o)}><Icon name="trash" size={16} /></button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Sheet title={editing.id ? 'Edit option' : 'New option'} onClose={() => setEditing(null)}
          footer={<button className="btn btn-block" onClick={save} disabled={saving}>{saving ? <Spinner /> : 'Save'}</button>}>
          <div className="grouped" style={{ marginTop: 8 }}>
            <label className="row row-input"><span className="row-label" style={{ minWidth: 90 }}>Name</span><input className="input" autoFocus value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Memory" /></label>
          </div>
          <div className="group-label">Values</div>
          <div className="tag-input">
            {editing.values.map((v) => (
              <span className="tag" key={v}>{v}
                <button aria-label={`Remove ${v}`} onClick={() => setEditing({ ...editing, values: editing.values.filter((x) => x !== v) })}><Icon name="close" size={11} stroke={2.6} /></button>
              </span>
            ))}
            <input value={draft} placeholder="Type a value, press Enter" onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addValue() } }} onBlur={addValue} />
          </div>
          <div className="mt-12"><ErrorNote message={error} /></div>
        </Sheet>
      )}
    </>
  )
}
