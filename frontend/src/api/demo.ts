import type { Banner, Named, OptionDef, Page, Product, ProductType, Spec } from './types'

/**
 * Sample catalogue shown when the API is unreachable or has nothing to display.
 * IDs match the backend seeder so a later live submit still maps to the same items.
 */
const img = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

export const DEMO_CATEGORIES: Named[] = [
  { id: 1, name: 'Networking', description: 'Switches, routers, wireless and structured cabling' },
  { id: 2, name: 'Computing', description: 'Servers, workstations, laptops and storage' },
  { id: 3, name: 'Security & Surveillance', description: 'CCTV, access control and alarm systems' },
  { id: 4, name: 'Power & Backup', description: 'UPS systems, inverters and batteries' },
]

export const DEMO_BRANDS: Named[] = [
  { id: 1, name: 'Cisco' },
  { id: 2, name: 'Ubiquiti' },
  { id: 3, name: 'Dell' },
  { id: 4, name: 'Hikvision' },
  { id: 5, name: 'APC' },
]

const opt = (id: number, name: string, values: string[]): OptionDef => ({ id, name, values })
const spec = (label: string, value: string): Spec => ({ label, value })

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 1, name: 'Catalyst 9200 Managed Switch', sku: 'SW-C9200', type: 'PRODUCT',
    summary: 'Enterprise-grade managed access switch with PoE+ and stacking support.',
    description: 'A flexible, secure access switch for campus and branch networks. Includes full Layer 3 features, PoE+ on every port and built-in security controls.',
    categoryId: 1, categoryName: 'Networking', brandId: 1, brandName: 'Cisco',
    images: [img('1550751827-4bd374c3f58b')],
    specifications: [spec('Switching capacity', '176 Gbps'), spec('PoE budget', '740 W'), spec('Uplinks', '4 x 1G SFP'), spec('Form factor', '1U rack mount')],
    options: [opt(2, 'Port count', ['24 ports', '48 ports']), opt(3, 'Warranty term', ['1 year', '3 years', '5 years'])],
    featured: true, active: true,
  },
  {
    id: 2, name: 'UniFi Dream Machine Pro', sku: 'UBQ-UDMP', type: 'PRODUCT',
    summary: 'All-in-one gateway, controller and 8-port switch for small to mid-size sites.',
    description: 'Combines routing, switching, network application hosting and security gateway features in a single rack unit.',
    categoryId: 1, categoryName: 'Networking', brandId: 2, brandName: 'Ubiquiti',
    images: [img('1563986768609-322da13575f3')],
    specifications: [spec('Throughput', '3.5 Gbps IPS'), spec('Ports', '8 x GbE, 2 x SFP+'), spec('Form factor', '1U rack mount')],
    options: [opt(3, 'Warranty term', ['1 year', '3 years', '5 years'])],
    featured: true, active: true,
  },
  {
    id: 3, name: 'PowerEdge R450 Rack Server', sku: 'DL-R450', type: 'PRODUCT',
    summary: 'Dual-socket 1U rack server built for virtualisation and business workloads.',
    description: 'Intel Xeon Scalable processors, up to 8 x 2.5" drive bays and iDRAC remote management.',
    categoryId: 2, categoryName: 'Computing', brandId: 3, brandName: 'Dell',
    images: [img('1558494949-ef010cbdcc31')],
    specifications: [spec('Processor', 'Intel Xeon Silver'), spec('Drive bays', '8 x 2.5"'), spec('Management', 'iDRAC9 Enterprise')],
    options: [opt(1, 'Memory', ['8GB', '16GB', '32GB', '64GB']), opt(3, 'Warranty term', ['1 year', '3 years', '5 years'])],
    featured: true, active: true,
  },
  {
    id: 4, name: 'ColorVu 4MP Bullet Camera', sku: 'HK-CV4B', type: 'PRODUCT',
    summary: 'Full-colour night vision IP camera with weatherproof housing.',
    description: '24/7 colour imaging with a fast aperture lens and built-in white light for clear footage in the dark.',
    categoryId: 3, categoryName: 'Security & Surveillance', brandId: 4, brandName: 'Hikvision',
    images: [img('1557597774-9d273605dfa9')],
    specifications: [spec('Sensor', '1/1.8" progressive scan CMOS'), spec('Protection', 'IP67'), spec('Night range', 'Up to 40 m')],
    options: [opt(4, 'Resolution', ['4MP', '8MP']), opt(3, 'Warranty term', ['1 year', '3 years', '5 years'])],
    featured: false, active: true,
  },
  {
    id: 5, name: 'Smart-UPS 3000VA Rack/Tower', sku: 'APC-SMT3000', type: 'PRODUCT',
    summary: 'Line-interactive UPS with network management card and hot-swappable batteries.',
    description: 'Dependable power protection for servers, storage and network equipment.',
    categoryId: 4, categoryName: 'Power & Backup', brandId: 5, brandName: 'APC',
    images: [img('1518770660439-4636190af475')],
    specifications: [spec('Capacity', '3000 VA / 2700 W'), spec('Runtime', 'Up to 18 min at half load'), spec('Outlets', '8 x C13, 1 x C19')],
    options: [opt(3, 'Warranty term', ['1 year', '3 years', '5 years'])],
    featured: false, active: true,
  },
  {
    id: 6, name: 'Office Network Rollout', sku: 'SOL-NET', type: 'SOLUTION',
    summary: 'Design, supply and installation of a complete office network.',
    description: 'Site survey, structured cabling, switching, Wi-Fi coverage and documentation, delivered by certified engineers.',
    categoryId: 1, categoryName: 'Networking', brandId: null, brandName: null,
    images: [img('1558494949-ef010cbdcc31')],
    specifications: [spec('Includes', 'Survey, design, supply, installation, commissioning'), spec('Support', '30 days post-install support')],
    options: [], featured: true, active: true,
  },
  {
    id: 7, name: 'Managed CCTV Solution', sku: 'SOL-CCTV', type: 'SOLUTION',
    summary: 'End-to-end surveillance with cameras, recording and remote monitoring.',
    description: 'We assess your premises, supply the cameras and recorders, install and configure remote viewing.',
    categoryId: 3, categoryName: 'Security & Surveillance', brandId: null, brandName: null,
    images: [img('1557597774-9d273605dfa9')],
    specifications: [spec('Includes', 'Cameras, NVR, cabling, installation, mobile app setup')],
    options: [], featured: true, active: true,
  },
  {
    id: 8, name: 'Backup Power Package', sku: 'SOL-PWR', type: 'SOLUTION',
    summary: 'Sized UPS and battery backup to keep critical systems running during outages.',
    description: 'Load assessment, equipment supply, installation and testing for server rooms and small offices.',
    categoryId: 4, categoryName: 'Power & Backup', brandId: null, brandName: null,
    images: [img('1518770660439-4636190af475')],
    specifications: [spec('Includes', 'Load assessment, UPS, batteries, installation, testing')],
    options: [], featured: false, active: true,
  },
]

export const DEMO_BANNERS: Banner[] = [
  {
    id: 1, title: 'Enterprise networking, quoted to your brief',
    description: 'Switches, wireless and structured cabling designed, supplied and installed for offices and industrial sites.',
    backgroundColor: '#D71920', backgroundColor2: '#8B1016', backgroundStyle: 'glow',
    imagePath: img('1550751827-4bd374c3f58b', 900),
    ctaText: 'Shop now', linkUrl: '/product/1',
    ctaText2: 'Learn more', linkUrl2: '/products',
    position: 0, active: true,
  },
  {
    id: 2, title: 'Servers and compute for the office',
    description: 'Rack servers and storage sized for virtualisation and everyday business workloads, with formal pricing on request.',
    backgroundColor: '#1C1C1E', backgroundColor2: '#58595B', backgroundStyle: 'linear-right',
    imagePath: img('1558494949-ef010cbdcc31', 900),
    ctaText: 'See the PowerEdge', linkUrl: '/product/3',
    ctaText2: 'Browse computing', linkUrl2: '/products?categoryId=2',
    position: 1, active: true,
  },
  {
    id: 3, title: 'Complete CCTV, designed and installed',
    description: 'Cameras, recording and remote viewing, assessed on site and delivered as a finished solution.',
    backgroundColor: '#0B2545', backgroundColor2: '#041525', backgroundStyle: 'diagonal',
    imagePath: img('1557597774-9d273605dfa9', 900),
    ctaText: 'View the solution', linkUrl: '/product/7',
    ctaText2: 'Learn more', linkUrl2: '/solutions',
    position: 2, active: true,
  },
]

export function demoProduct(id: number): Product | undefined {
  return DEMO_PRODUCTS.find((p) => p.id === id)
}

export function demoPage(type?: ProductType, q = '', categoryId = '', brandId = '', page = 0, size = 24): Page<Product> {
  const needle = q.trim().toLowerCase()
  const filtered = DEMO_PRODUCTS.filter((p) => {
    if (type && p.type !== type) return false
    if (categoryId && String(p.categoryId) !== categoryId) return false
    if (brandId && String(p.brandId) !== brandId) return false
    if (needle && ![p.name, p.sku, p.summary, p.brandName, p.categoryName].some((v) => v?.toLowerCase().includes(needle))) return false
    return true
  })
  const start = page * size
  const items = filtered.slice(start, start + size)
  return { items, total: filtered.length, page, size, totalPages: Math.max(1, Math.ceil(filtered.length / size)) }
}

/** Live value if it has rows, otherwise the demo fallback. */
export function orDemo<T>(live: T | undefined, empty: (v: T) => boolean, fallback: T): { data: T; demo: boolean } {
  if (live !== undefined && !empty(live)) return { data: live, demo: false }
  return { data: fallback, demo: true }
}
