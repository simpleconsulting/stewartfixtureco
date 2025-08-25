// Business calculation utilities

import type { JobItem, Job, Payment } from '@/types/database'

export interface JobCalculations {
  subtotal_cents: number
  discount_cents: number
  tax_cents: number
  total_cents: number
  amount_paid_cents: number
  balance_due_cents: number
}

// Calculate job totals from job items
export function calculateJobTotals(
  jobItems: JobItem[],
  discountCents: number = 0,
  taxRatePercent: number = 0,
  payments: Payment[] = []
): JobCalculations {
  // Calculate subtotal from line items
  const subtotal_cents = jobItems.reduce((sum, item) => {
    return sum + item.line_total_cents
  }, 0)
  
  // Apply discount
  const discount_cents = Math.min(discountCents, subtotal_cents)
  const discounted_subtotal = subtotal_cents - discount_cents
  
  // Calculate tax on discounted amount
  const tax_cents = Math.round(discounted_subtotal * (taxRatePercent / 100))
  
  // Final total
  const total_cents = discounted_subtotal + tax_cents
  
  // Calculate amount paid
  const amount_paid_cents = payments.reduce((sum, payment) => {
    return sum + payment.amount_cents
  }, 0)
  
  // Calculate balance due
  const balance_due_cents = Math.max(0, total_cents - amount_paid_cents)
  
  return {
    subtotal_cents,
    discount_cents,
    tax_cents,
    total_cents,
    amount_paid_cents,
    balance_due_cents,
  }
}

// Calculate line total for a job item
export function calculateLineTotal(
  quantity: number,
  unitPriceCents: number
): number {
  return Math.round(quantity * unitPriceCents)
}

// Calculate job item totals and update line_total_cents
export function updateJobItemLineTotal(
  jobItem: Partial<JobItem>
): Partial<JobItem> {
  if (jobItem.quantity !== undefined && jobItem.unit_price_cents !== undefined) {
    return {
      ...jobItem,
      line_total_cents: calculateLineTotal(jobItem.quantity, jobItem.unit_price_cents),
    }
  }
  return jobItem
}

// Discount calculations
export function calculateDiscountedPrice(
  originalPriceCents: number,
  discountPercent: number
): number {
  const discountAmount = Math.round(originalPriceCents * (discountPercent / 100))
  return originalPriceCents - discountAmount
}

export function calculateDiscountPercent(
  originalPriceCents: number,
  discountCents: number
): number {
  if (originalPriceCents === 0) return 0
  return (discountCents / originalPriceCents) * 100
}

// Payment calculations
export function calculatePaymentStatus(
  totalCents: number,
  amountPaidCents: number
): 'unpaid' | 'partial' | 'paid' | 'overpaid' {
  if (amountPaidCents === 0) return 'unpaid'
  if (amountPaidCents >= totalCents) {
    return amountPaidCents > totalCents ? 'overpaid' : 'paid'
  }
  return 'partial'
}

// Route optimization helpers (for future use)
export interface Location {
  lat: number
  lng: number
  address?: string
  name?: string
}

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  // Haversine formula to calculate distance between two points
  const R = 3959 // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return Math.round(distance * 100) / 100 // Round to 2 decimal places
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Business metrics calculations
export interface RevenueMetrics {
  total_revenue_cents: number
  average_job_value_cents: number
  jobs_count: number
  growth_rate_percent?: number
}

export function calculateRevenueMetrics(
  jobs: Job[],
  compareToJobs?: Job[]
): RevenueMetrics {
  const total_revenue_cents = jobs.reduce((sum, job) => {
    return sum + job.final_price_cents
  }, 0)
  
  const jobs_count = jobs.length
  const average_job_value_cents = jobs_count > 0 ? Math.round(total_revenue_cents / jobs_count) : 0
  
  let growth_rate_percent: number | undefined
  
  if (compareToJobs && compareToJobs.length > 0) {
    const compare_revenue = compareToJobs.reduce((sum, job) => sum + job.final_price_cents, 0)
    
    if (compare_revenue > 0) {
      growth_rate_percent = ((total_revenue_cents - compare_revenue) / compare_revenue) * 100
    }
  }
  
  return {
    total_revenue_cents,
    average_job_value_cents,
    jobs_count,
    growth_rate_percent,
  }
}

// Pricing tier calculations (for future discount features)
export interface PricingTier {
  min_amount_cents: number
  max_amount_cents?: number
  discount_percent: number
  name: string
}

export function calculateTierDiscount(
  subtotalCents: number,
  tiers: PricingTier[]
): { tier: PricingTier | null; discount_cents: number } {
  // Find applicable tier
  const applicableTier = tiers
    .sort((a, b) => a.min_amount_cents - b.min_amount_cents)
    .reverse()
    .find(tier => {
      const meetsMin = subtotalCents >= tier.min_amount_cents
      const meetsMax = !tier.max_amount_cents || subtotalCents <= tier.max_amount_cents
      return meetsMin && meetsMax
    })
  
  if (!applicableTier) {
    return { tier: null, discount_cents: 0 }
  }
  
  const discount_cents = Math.round(subtotalCents * (applicableTier.discount_percent / 100))
  
  return {
    tier: applicableTier,
    discount_cents,
  }
}