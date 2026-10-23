import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ErrorNote, Spinner } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { admin, login } = useAuth()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/admin'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (admin) return <Navigate to={from} replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="login-logo"><img src="/logo.png" alt="OSC Store" /></div>
        <h1 className="large-title" style={{ fontSize: 28 }}>Admin sign in</h1>
        <p className="subtitle" style={{ fontSize: 15, marginBottom: 24 }}>OSC Markets quotation management</p>
        <div className="grouped" style={{ textAlign: 'left' }}>
          <label className="row row-input">
            <span className="row-label" style={{ minWidth: 86 }}>Email</span>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" autoFocus required />
          </label>
          <label className="row row-input">
            <span className="row-label" style={{ minWidth: 86 }}>Password</span>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </label>
        </div>
        <div style={{ marginTop: 14 }}><ErrorNote message={error} /></div>
        <button className="btn btn-block" style={{ marginTop: 16 }} disabled={busy || !email || !password}>
          {busy ? <Spinner /> : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
