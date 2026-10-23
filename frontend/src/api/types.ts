export type ProductType = 'PRODUCT' | 'SOLUTION'
export type CustomerType = 'COMPANY' | 'INDIVIDUAL'
export type QuoteStatus = 'NEW' | 'PROCESSED'

export interface Spec {
  label: string
  value: string
}

export interface OptionDef {
  id: number
  name: string
  values: string[]
}

export interface Named {
  id: number
  name: string
  description?: string | null
}

export interface Product {
  id: number
  name: string
  sku?: string | null
  type: ProductType
  summary?: string | null
  description?: string | null
  categoryId?: number | null
  categoryName?: string | null
  brandId?: number | null
  brandName?: string | null
  images: string[]
  specifications: Spec[]
  options: OptionDef[]
  featured: boolean
  active: boolean
}

export interface Page<T> {
  items: T[]
  total: number
  page: number
  size: number
  totalPages: number
}

export interface Banner {
  id: number
  title?: string | null
  description?: string | null
  backgroundColor?: string | null
  backgroundColor2?: string | null
  backgroundStyle?: string | null
  imagePath?: string | null
  ctaText?: string | null
  linkUrl?: string | null
  ctaText2?: string | null
  linkUrl2?: string | null
  position: number
  active: boolean
}

export interface AdminUser {
  id: number
  name: string
  email: string
  role: 'SUPER_ADMIN' | 'ADMIN'
  protectedAccount: boolean
  createdAt: string
}

export interface QuoteSummary {
  id: number
  reference: string
  customerType: CustomerType
  customerName: string
  email: string
  status: QuoteStatus
  productCount: number
  solutionCount: number
  totalQuantity: number
  total: number | null
  createdAt: string
  processedAt: string | null
}

export interface QuoteItem {
  id: number
  productId: number | null
  name: string
  sku?: string | null
  brandName?: string | null
  type: ProductType
  imagePath?: string | null
  selectedOptions?: string | null
  quantity: number
  unitPrice: number | null
  lineTotal: number | null
  availability?: string | null
  warranty?: string | null
  deliveryTimeline?: string | null
  sourcing?: string | null
  notes?: string | null
}

export interface QuoteDetail {
  id: number
  reference: string
  customerType: CustomerType
  status: QuoteStatus
  companyName?: string | null
  registrationNumber?: string | null
  vatNumber?: string | null
  companyEmail?: string | null
  companyPhone?: string | null
  companyAddress?: string | null
  companyLocation?: string | null
  contactName: string
  contactEmail: string
  contactPhone?: string | null
  contactJobTitle?: string | null
  deliveryAddress: string
  deliveryLocation?: string | null
  questions?: string | null
  currency: string
  productsSubtotal: number
  solutionsSubtotal: number
  deliveryFee: number
  discount: number
  vatPercent: number
  vatAmount: number
  total: number
  validUntil?: string | null
  warranty?: string | null
  deliveryTimeline?: string | null
  availability?: string | null
  sourcing?: string | null
  paymentTerms?: string | null
  additionalNotes?: string | null
  createdAt: string
  processedAt?: string | null
  processedBy?: string | null
  emailSentAt?: string | null
  emailError?: string | null
  items: QuoteItem[]
  attachments: { id: number; name: string; contentType?: string; sizeBytes: number }[]
}

export interface ProcessResult {
  quote: QuoteDetail
  emailSent: boolean
  emailError?: string | null
}

export interface BasketLine {
  key: string
  productId: number
  name: string
  type: ProductType
  image?: string | null
  brand?: string | null
  sku?: string | null
  options: Record<string, string>
  quantity: number
}
