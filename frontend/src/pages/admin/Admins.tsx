import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api/client'
import { dateOnly } from '../../api/format'
import type { AdminUser } from '../../api/types'
import Icon from '../../components/Icon'
import { ErrorNote, PageSpinner, Sheet, Spinner } from '../../components/ui'
import { useToast } from '../../context/ToastContext'

interface Draft { id?: number; name: string; email: string; password: string }

export default function Admins() {
  const toast = useToast()
  const [admins, setAdmins] = useState<AdminUser[] | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    api<AdminUser[]>('/api/admin/admins', { admin: true }).then(setAdmins).catch((e) => setError(e.message))
  }, [])
  useEffect(load, [load])

  const save = async () => {
    if (!draft) return
    if (!draft.name.trim() || !draft.email.trim()) { setError('Name and email are required'); return }
    if (!draft.id && draft.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setSaving(true); setError(null)
    try {
      const body = { name: draft.name, email: draft.email, password: draft.password }
      if (draft.id) await api(`/api/admin/admins/${draft.id}`, { method: 'PUT', body, admin: true })
      else await api('/api/admin/admins', { method: 'POST', body, admin: true })
      setDraft(null); toast('Saved'); load()
    } catch (e) { setError((e as Error).message) } finally { setSaving(false) }
  }

  const remove = async (a: AdminUser) => {
    if (!window.confirm(`Remove ${a.name} as an admin? They will lose access immediately.`)) return
    try { await api(`/api/admin/admins/${a.id}`, { method: 'DELETE', admin: true }); toast('Admin removed'); load() }
    catch (e) { toast((e as Error).message, 'error') }
  }

  return (
    <>
      <div className="admin-head">
        <div>
          <h1 className="large-title">Admins</h1>
          <p className="subtitle">People who can manage the catalogue and process quotes.</p>
        </div>
        <button className="btn btn-sm" onClick={() => { setError(null); setDraft({ name: '', email: '', password: '' }) }}>
          <Icon name="plus" size={16} stroke={2.4} /> New admin
        </button>
      </div>
      {error && !draft && <div className="form-error">{error}</div>}
      {!admins ? <PageSpinner /> : (
        <div className="grouped">
          {admins.map((a) => (
            <div className="row" key={a.id}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex items-center gap-8 wrap">
                  <span style={{ fontWeight: 600 }}>{a.name}</span>
                  {a.protectedAccount && <span className="badge red"><Icon name="lock" size={12} stroke={2.2} /> Super admin</span>}
                </div>
                <div className="caption">{a.email} · added {dateOnly(a.createdAt)}</div>
              </div>
              {a.protectedAccount ? (
                <span className="caption">Protected</span>
              ) : (
                <>
                  <button className="icon-btn" aria-label={`Edit ${a.name}`} onClick={() => { setError(null); setDraft({ id: a.id, name: a.name, email: a.email, password: '' }) }}><Icon name="edit" size={16} /></button>
                  <button className="icon-btn" aria-label={`Delete ${a.name}`} onClick={() => remove(a)}><Icon name="trash" size={16} /></button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      <p className="group-footer">The super admin account is created automatically and cannot be edited or deleted.</p>

      {draft && (
        <Sheet title={draft.id ? 'Edit admin' : 'New admin'} onClose={() => setDraft(null)}
          footer={<button className="btn btn-block" onClick={save} disabled={saving}>{saving ? <Spinner /> : 'Save'}</button>}>
          <div className="grouped" style={{ marginTop: 8 }}>
            <label className="row row-input"><span className="row-label" style={{ minWidth: 90 }}>Name</span><input className="input" autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label>
            <label className="row row-input"><span className="row-label" style={{ minWidth: 90 }}>Email</span><input className="input" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></label>
            <label className="row row-input"><span className="row-label" style={{ minWidth: 90 }}>Password</span><input className="input" type="password" autoComplete="new-password" value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} placeholder={draft.id ? 'Leave blank to keep' : 'At least 8 characters'} /></label>
          </div>
          <div className="mt-12"><ErrorNote message={error} /></div>
        </Sheet>
      )}
    </>
  )
}
