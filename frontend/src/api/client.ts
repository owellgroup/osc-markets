const rawApi = import.meta.env.VITE_API_URL as string | undefined
export const API_URL = (rawApi && rawApi.length > 0
  ? rawApi
  : import.meta.env.DEV ? 'http://localhost:8286' : ''
).replace(/\/+$/, '')

const TOKEN_KEY = 'osc.admin.token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

/** Turns a stored image path (/api/files/images/..) into a full URL. */
export function assetUrl(path?: string | null): string {
  if (!path) return ''
  return /^https?:\/\//i.test(path) ? path : API_URL + path
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

type Options = {
  method?: string
  body?: unknown
  form?: FormData
  admin?: boolean
}

async function raw(path: string, opts: Options = {}): Promise<Response> {
  const headers: Record<string, string> = {}
  let body: BodyInit | undefined
  if (opts.form) {
    body = opts.form
  } else if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(opts.body)
  }
  const token = tokenStore.get()
  if (token && opts.admin) headers['Authorization'] = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(API_URL + path, { method: opts.method ?? 'GET', headers, body })
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.')
  }

  if (!res.ok) {
    let message = 'Something went wrong. Please try again.'
    try {
      const data = await res.json()
      if (data?.message) message = data.message
    } catch {
      /* non-JSON error body */
    }
    if (res.status === 401 && opts.admin) {
      tokenStore.clear()
      window.dispatchEvent(new Event('osc:unauthorized'))
      message = 'Your session has expired. Please sign in again.'
    }
    throw new ApiError(res.status, message)
  }
  return res
}

export async function api<T>(path: string, opts: Options = {}): Promise<T> {
  const res = await raw(path, opts)
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

/** Downloads a protected file and triggers a browser save/open. */
export async function downloadFile(path: string, fallbackName: string, openInTab = false) {
  const res = await raw(path, { admin: true })
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  if (openInTab) {
    window.open(url, '_blank')
  } else {
    const a = document.createElement('a')
    a.href = url
    a.download = fallbackName
    document.body.appendChild(a)
    a.click()
    a.remove()
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const res = await api<{ path: string }>('/api/admin/uploads/image', { method: 'POST', form, admin: true })
  return res.path
}
