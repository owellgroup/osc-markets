import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { BasketLine, Product } from '../api/types'

const STORAGE_KEY = 'osc.basket.v1'

interface BasketApi {
  lines: BasketLine[]
  totalQuantity: number
  add: (product: Product, options: Record<string, string>, quantity: number) => void
  setQuantity: (key: string, quantity: number) => void
  remove: (key: string) => void
  clear: () => void
}

const BasketContext = createContext<BasketApi | null>(null)

function lineKey(productId: number, options: Record<string, string>) {
  const sorted = Object.keys(options).sort().map((k) => `${k}=${options[k]}`).join('&')
  return `${productId}|${sorted}`
}

function load(): BasketLine[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((l) => l && l.productId && l.quantity > 0) : []
  } catch {
    return []
  }
}

export function BasketProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<BasketLine[]>(load)

  // Persist on every change so a refresh or closed tab never loses the basket.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines])

  // Keep several open tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setLines(load())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const add = useCallback((product: Product, options: Record<string, string>, quantity: number) => {
    const key = lineKey(product.id, options)
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key)
      if (existing) {
        return prev.map((l) => (l.key === key ? { ...l, quantity: Math.min(l.quantity + quantity, 9999) } : l))
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          name: product.name,
          type: product.type,
          image: product.images[0] ?? null,
          brand: product.brandName ?? null,
          sku: product.sku ?? null,
          options,
          quantity,
        },
      ]
    })
  }, [])

  const setQuantity = useCallback((key: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.key !== key)
        : prev.map((l) => (l.key === key ? { ...l, quantity: Math.min(quantity, 9999) } : l)),
    )
  }, [])

  const remove = useCallback((key: string) => setLines((prev) => prev.filter((l) => l.key !== key)), [])
  const clear = useCallback(() => setLines([]), [])

  const value = useMemo<BasketApi>(
    () => ({ lines, totalQuantity: lines.reduce((s, l) => s + l.quantity, 0), add, setQuantity, remove, clear }),
    [lines, add, setQuantity, remove, clear],
  )
  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>
}

export function useBasket() {
  const ctx = useContext(BasketContext)
  if (!ctx) throw new Error('useBasket must be used inside BasketProvider')
  return ctx
}
