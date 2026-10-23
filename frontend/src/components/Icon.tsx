import type { ReactElement } from 'react'

const paths: Record<string, ReactElement> = {
  bag: (<><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></>),
  search: (<><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  trash: (<><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 12.5h10L18 7M9 7V4.5h6V7" /></>),
  chevron: <path d="m9 6 6 6-6 6" />,
  back: <path d="m15 6-6 6 6 6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  upload: (<><path d="M12 15V4m0 0L8 8m4-4 4 4" /><path d="M5 14v4.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V14" /></>),
  doc: (<><path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></>),
  box: (<><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></>),
  layers: (<><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></>),
  tag: (<><path d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8-9 9-8-8Z" /><circle cx="8.5" cy="8.5" r="1.3" /></>),
  slider: (<><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></>),
  image: (<><rect x="3.5" y="5" width="17" height="14" rx="2.5" /><circle cx="9" cy="10" r="1.6" /><path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5" /></>),
  users: (<><circle cx="9" cy="8.5" r="3.2" /><path d="M3 19c.5-3.2 3-5 6-5s5.5 1.8 6 5" /><path d="M16 5.5a3 3 0 0 1 0 6M18 14.3c1.8.6 2.8 2.2 3 4.7" /></>),
  inbox: (<><path d="M4 13.5 6.5 5h11l2.5 8.5V18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4.5Z" /><path d="M4 13.5h4.5a3.5 3.5 0 0 0 7 0H20" /></>),
  logout: (<><path d="M14 4h4a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 18 20h-4" /><path d="M10 8l-4 4 4 4M6 12h10" /></>),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  info: (<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8v.01" /></>),
  mail: (<><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="m4 8 8 5.5L20 8" /></>),
  pdf: (<><path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v4h4M9 17v-4h1.5a1.2 1.2 0 0 1 0 2.4H9" /></>),
  lock: (<><rect x="5" y="10.5" width="14" height="9.5" rx="2.5" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></>),
  edit: (<><path d="M4 20h4L19 9l-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></>),
  external: <path d="M14 5h5v5M19 5l-8 8M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4" />,
}

export default function Icon({ name, size = 20, stroke = 1.8 }: { name: keyof typeof paths | string; size?: number; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}
