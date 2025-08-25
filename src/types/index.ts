import { z } from 'zod'
import type {
  Client,
  Job,
  JobItem,
  ServiceOffering,
  Payment,
  JobStatus,
  PaymentStatus,
  PaymentMethod,
  JobFinancials,
} from './database'

// Enhanced types with computed properties
export interface ClientWithDetails extends Client {
  full_address: string
  total_jobs: number
  total_spent_cents: number
}

export interface JobWithDetails extends Job {
  client: Client
  items: JobItemWithService[]
  payments: Payment[]
  financials: JobFinancials
  total_paid_cents: number
  balance_due_cents: number
}

export interface JobItemWithService extends JobItem {
  service_offering: ServiceOffering | null
}

export interface ServiceOfferingWithStats extends ServiceOffering {
  times_used: number
  total_revenue_cents: number
}

// Form validation schemas
export const clientFormSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  phone: z.string().nullable(),
  email: z.string().email().nullable().or(z.literal('')),
  address_line1: z.string().nullable(),
  address_line2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  postal_code: z.string().nullable(),
  country: z.string().nullable(),
  notes: z.string().nullable(),
  is_active: z.boolean().default(true),
})

export const serviceOfferingFormSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().nullable(),
  base_price_cents: z.number().int().min(0, 'Price must be positive'),
  unit: z.string().default('flat'),
  default_duration_minutes: z.number().int().min(1).nullable(),
  is_active: z.boolean().default(true),
})

export const jobFormSchema = z.object({
  client_id: z.string().uuid('Must select a client'),
  status: z.enum(['draft', 'quoted', 'scheduled', 'in_progress', 'completed', 'canceled']),
  scheduled_start: z.string().datetime().nullable(),
  scheduled_end: z.string().datetime().nullable(),
  address_line1: z.string().nullable(),
  address_line2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  postal_code: z.string().nullable(),
  country: z.string().nullable(),
  notes: z.string().nullable(),
  discount_cents: z.number().int().min(0).default(0),
  tax_rate_percent: z.number().min(0).max(100).default(0),
  payment_status: z.enum(['unpaid', 'partial', 'paid', 'refunded']).default('unpaid'),
})

export const jobItemFormSchema = z.object({
  service_offering_id: z.string().uuid().nullable(),
  description: z.string().nullable(),
  quantity: z.number().min(0.01, 'Quantity must be positive'),
  unit: z.string().nullable(),
  unit_price_cents: z.number().int().min(0, 'Price must be positive'),
  sort_order: z.number().int().default(0),
})

export const paymentFormSchema = z.object({
  amount_cents: z.number().int().min(1, 'Payment amount must be positive'),
  method: z.enum(['cash', 'card', 'check', 'ach', 'other']),
  received_at: z.string().datetime().optional(),
  reference: z.string().nullable(),
})

// Utility types
export type ClientFormData = z.infer<typeof clientFormSchema>
export type ServiceOfferingFormData = z.infer<typeof serviceOfferingFormSchema>
export type JobFormData = z.infer<typeof jobFormSchema>
export type JobItemFormData = z.infer<typeof jobItemFormSchema>
export type PaymentFormData = z.infer<typeof paymentFormSchema>

// Status display configurations
export const jobStatusConfig = {
  draft: {
    label: 'Draft',
    color: 'gray',
    description: 'Job is being prepared',
  },
  quoted: {
    label: 'Quoted',
    color: 'blue', 
    description: 'Quote has been sent to client',
  },
  scheduled: {
    label: 'Scheduled',
    color: 'orange',
    description: 'Job is scheduled and confirmed',
  },
  in_progress: {
    label: 'In Progress',
    color: 'yellow',
    description: 'Work is currently being performed',
  },
  completed: {
    label: 'Completed',
    color: 'green',
    description: 'Job has been completed successfully',
  },
  canceled: {
    label: 'Canceled',
    color: 'red',
    description: 'Job was canceled',
  },
} as const satisfies Record<JobStatus, { label: string; color: string; description: string }>

export const paymentStatusConfig = {
  unpaid: {
    label: 'Unpaid',
    color: 'red',
    description: 'No payment received',
  },
  partial: {
    label: 'Partial',
    color: 'yellow',
    description: 'Partial payment received',
  },
  paid: {
    label: 'Paid',
    color: 'green',
    description: 'Fully paid',
  },
  refunded: {
    label: 'Refunded',
    color: 'gray',
    description: 'Payment has been refunded',
  },
} as const satisfies Record<PaymentStatus, { label: string; color: string; description: string }>

export const paymentMethodConfig = {
  cash: {
    label: 'Cash',
    icon: 'DollarSign',
  },
  card: {
    label: 'Card',
    icon: 'CreditCard',
  },
  check: {
    label: 'Check',
    icon: 'FileText',
  },
  ach: {
    label: 'ACH/Bank Transfer',
    icon: 'Building2',
  },
  other: {
    label: 'Other',
    icon: 'HelpCircle',
  },
} as const satisfies Record<PaymentMethod, { label: string; icon: string }>

// Search and filtering types
export interface ClientFilters {
  search?: string
  is_active?: boolean
  has_jobs?: boolean
}

export interface JobFilters {
  search?: string
  status?: JobStatus | JobStatus[]
  payment_status?: PaymentStatus | PaymentStatus[]
  client_id?: string
  date_range?: {
    start: Date
    end: Date
  }
  scheduled_date_range?: {
    start: Date
    end: Date
  }
}

export interface ServiceOfferingFilters {
  search?: string
  is_active?: boolean
  category?: string
}

// API response types
export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  per_page: number
  total_pages: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Dashboard/reporting types
export interface BusinessMetrics {
  total_clients: number
  active_jobs: number
  completed_jobs_this_month: number
  revenue_this_month_cents: number
  outstanding_balance_cents: number
  avg_job_value_cents: number
}

export interface RevenueByMonth {
  month: string
  revenue_cents: number
  jobs_completed: number
}

export interface TopServices {
  service_offering_id: string
  service_name: string
  times_used: number
  total_revenue_cents: number
}

// Export database types for convenience
export type {
  Client,
  ClientInsert,
  Job,
  JobInsert,
  JobItem,
  JobItemInsert,
  ServiceOffering,
  ServiceOfferingInsert,
  Payment,
  PaymentInsert,
  JobStatus,
  PaymentStatus,
  PaymentMethod,
  JobFinancials,
} from './database'