import type { Banner } from './api/types'

export const DEFAULT_COLOR = '#D71920'
export const DEFAULT_COLOR2 = '#8B1016'

export const BG_STYLES = [
  { id: 'solid', label: 'Solid' },
  { id: 'linear-right', label: 'Fade right' },
  { id: 'linear-left', label: 'Fade left' },
  { id: 'linear-down', label: 'Fade down' },
  { id: 'linear-up', label: 'Fade up' },
  { id: 'diagonal', label: 'Diagonal' },
  { id: 'radial', label: 'Radial' },
  { id: 'glow', label: 'Spotlight' },
  { id: 'wash', label: 'Dark wash' },
] as const

export type BgStyle = (typeof BG_STYLES)[number]['id']

function hexRgb(hex?: string | null): [number, number, number] | null {
  const n = (hex ?? '').replace('#', '')
  if (n.length !== 6) return null
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)]
}

function toHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')).join('')}`.toUpperCase()
}

export function shade(hex: string, amount = -0.28) {
  const rgb = hexRgb(hex)
  if (!rgb) return DEFAULT_COLOR2
  return toHex(rgb[0] * (1 + amount), rgb[1] * (1 + amount), rgb[2] * (1 + amount))
}

export function bannerFill(color?: string | null, color2?: string | null, style?: string | null): string {
  const a = color || DEFAULT_COLOR
  const b = color2 || shade(a)
  switch (style) {
    case 'linear-right': return `linear-gradient(90deg, ${a} 0%, ${b} 100%)`
    case 'linear-left': return `linear-gradient(270deg, ${a} 0%, ${b} 100%)`
    case 'linear-down': return `linear-gradient(180deg, ${a} 0%, ${b} 100%)`
    case 'linear-up': return `linear-gradient(0deg, ${a} 0%, ${b} 100%)`
    case 'diagonal': return `linear-gradient(135deg, ${a} 0%, ${b} 100%)`
    case 'radial': return `radial-gradient(circle at 68% 50%, ${a} 0%, ${b} 72%)`
    case 'glow': return `radial-gradient(ellipse at 78% 42%, ${a} 0%, ${b} 64%)`
    case 'wash': return `linear-gradient(180deg, ${a} 0%, ${a} 52%, ${b} 100%)`
    default: return a
  }
}

export function bannerBackground(banner: Pick<Banner, 'backgroundColor' | 'backgroundColor2' | 'backgroundStyle'>) {
  return bannerFill(banner.backgroundColor, banner.backgroundColor2, banner.backgroundStyle)
}

export function isLightBanner(color?: string | null, color2?: string | null) {
  const samples = [hexRgb(color || DEFAULT_COLOR), hexRgb(color2 || '')].filter(Boolean) as [number, number, number][]
  if (samples.length === 0) return false
  const luma = samples.reduce((sum, [r, g, b]) => sum + (r * 299 + g * 587 + b * 114) / 1000, 0) / samples.length
  return luma > 168
}
