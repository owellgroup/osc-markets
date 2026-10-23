import type { ReactElement } from 'react'
import { SOCIAL_LINKS } from '../social'

const glyphs: Record<string, ReactElement> = {
  Facebook: (
    <path fill="currentColor" d="M14 8h3V4h-3c-2.8 0-5 2.2-5 5v3H6v4h3v8h4v-8h3.2l.8-4H13V9c0-.6.4-1 1-1Z" />
  ),
  LinkedIn: (
    <path fill="currentColor" d="M6.5 9.5H3.6V20h2.9V9.5ZM5.05 4A1.7 1.7 0 1 0 5.06 7.4 1.7 1.7 0 0 0 5.05 4ZM20.4 20h-2.9v-5.6c0-1.6-.6-2.6-2-2.6-1.1 0-1.7.7-2 1.4-.1.2-.1.6-.1.9V20h-2.9s.04-9.4 0-10.4h2.9v1.5c.4-.7 1.5-1.8 3.6-1.8 2.6 0 4.4 1.7 4.4 5.3V20Z" />
  ),
  Instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </>
  ),
  TikTok: (
    <path fill="currentColor" d="M14.6 3c.4 2.4 1.8 4 4.2 4.2v2.6c-1.5 0-2.9-.5-4.2-1.3v5.7c0 3.5-2.6 6.1-6.1 6.1S2.4 17.7 2.4 14.2 5 8.1 8.5 8.1c.4 0 .8 0 1.1.1v2.7a3.4 3.4 0 0 0-1.1-.2c-1.9 0-3.4 1.5-3.4 3.5s1.5 3.4 3.4 3.4 3.5-1.5 3.5-3.4V3h2.6Z" />
  ),
}

export default function SocialIcons({ className = '' }: { className?: string }) {
  return (
    <div className={`socials ${className}`.trim()} aria-label="Social media">
      {SOCIAL_LINKS.map((s) => (
        <a key={s.name} className="social-btn" href={s.href} target="_blank" rel="noreferrer" aria-label={s.name} title={s.name}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">{glyphs[s.name]}</svg>
        </a>
      ))}
    </div>
  )
}
