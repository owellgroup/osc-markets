import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { assetUrl } from '../api/client'
import type { Banner } from '../api/types'
import { bannerBackground, isLightBanner } from '../bannerStyle'
import Icon from './Icon'

const INTERVAL = 5200
const HOLD_MS = 8000

function BannerLink({ href, className, children }: { href?: string | null; className: string; children: ReactNode }) {
  if (!href) return null
  return /^https?:\/\//i.test(href) ? (
    <a className={className} href={href} target="_blank" rel="noreferrer">{children}</a>
  ) : (
    <Link className={className} to={href}>{children}</Link>
  )
}

function Slide({ banner }: { banner: Banner }) {
  const light = isLightBanner(banner.backgroundColor, banner.backgroundColor2)
  return (
    <div className={`banner-slide${light ? ' light' : ''}`} style={{ background: bannerBackground(banner) }}>
      <div className="banner-copy">
        {banner.title && <h2>{banner.title}</h2>}
        {banner.description && <p>{banner.description}</p>}
        {(banner.ctaText || banner.ctaText2) && (
          <div className="banner-actions">
            {banner.ctaText && (
              <BannerLink href={banner.linkUrl || undefined} className="banner-cta banner-cta-primary">
                {banner.ctaText}
                <Icon name="chevron" size={16} stroke={2.2} />
              </BannerLink>
            )}
            {banner.ctaText2 && (
              <BannerLink href={banner.linkUrl2 || undefined} className="banner-cta banner-cta-secondary">
                {banner.ctaText2}
              </BannerLink>
            )}
          </div>
        )}
      </div>
      {banner.imagePath && (
        <div className="banner-art">
          <img src={assetUrl(banner.imagePath)} alt="" draggable={false} />
        </div>
      )}
    </div>
  )
}

/** Full-width 21:6 slider. Auto-advances; colour/gradient fill + picture on the right. */
export default function BannerSlider({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0)
  const holdUntil = useRef(0)
  const touchStart = useRef<number | null>(null)
  const startedAt = useRef(performance.now())
  const count = banners.length

  useEffect(() => {
    if (index >= count) setIndex(0)
  }, [count, index])

  useEffect(() => {
    if (count < 2) return
    startedAt.current = performance.now()
    let frame = 0
    const tick = (now: number) => {
      if (now - startedAt.current >= INTERVAL && Date.now() >= holdUntil.current) {
        setIndex((i) => (i + 1) % count)
        startedAt.current = now
      }
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [count])

  if (count === 0) return null

  const hold = () => {
    holdUntil.current = Date.now() + HOLD_MS
    startedAt.current = performance.now()
  }
  const go = (delta: number) => {
    hold()
    setIndex((i) => (i + delta + count) % count)
  }
  const goTo = (i: number) => {
    hold()
    setIndex(i)
  }

  return (
    <div
      className="banner-bleed"
      onTouchStart={(e) => { touchStart.current = e.touches[0].clientX }}
      onTouchEnd={(e) => {
        if (touchStart.current !== null) {
          const dx = e.changedTouches[0].clientX - touchStart.current
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
        }
        touchStart.current = null
      }}
    >
      <div className="banner">
        <div className="banner-track" data-banner-index={index} style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}>
          {banners.map((b, i) => (
            <div className="banner-slide-wrap" key={b.id} aria-hidden={i !== index}>
              <Slide banner={b} />
            </div>
          ))}
        </div>
        {count > 1 && (
          <div className="banner-dots">
            {banners.map((b, i) => (
              <button
                key={b.id}
                className={`banner-dot${i === index ? ' on' : ''}`}
                aria-label={`Show banner ${i + 1}`}
                onClick={() => goTo(i)}
              >
                {i === index && <span className="banner-dot-fill" key={index} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
