// Form validation utilities and helpers

import { z } from 'zod'

// Common validation patterns
export const phoneNumberRegex = /^(\+?1[-.\s]?)?(\([0-9]{3}\)|[0-9]{3})[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const postalCodeRegex = /^[0-9]{5}(-[0-9]{4})?$/

// Reusable validation schemas
export const phoneSchema = z.string()
  .refine(
    (val) => !val || phoneNumberRegex.test(val),
    { message: 'Please enter a valid phone number' }
  )

export const emailSchema = z.string()
  .refine(
    (val) => !val || emailRegex.test(val),
    { message: 'Please enter a valid email address' }
  )

export const postalCodeSchema = z.string()
  .refine(
    (val) => !val || postalCodeRegex.test(val),
    { message: 'Please enter a valid ZIP code' }
  )

export const currencySchema = z.number()
  .int('Amount must be a whole number of cents')
  .min(0, 'Amount cannot be negative')

export const percentageSchema = z.number()
  .min(0, 'Percentage cannot be negative')
  .max(100, 'Percentage cannot exceed 100%')

// Address validation
export const addressSchema = z.object({
  address_line1: z.string().nullable(),
  address_line2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  postal_code: postalCodeSchema.nullable(),
  country: z.string().nullable(),
})

// Date validation helpers
export const dateStringSchema = z.string().datetime()

export const scheduleDateSchema = z.object({
  scheduled_start: dateStringSchema.nullable(),
  scheduled_end: dateStringSchema.nullable(),
}).refine(
  (data) => {
    if (!data.scheduled_start || !data.scheduled_end) return true
    return new Date(data.scheduled_start) < new Date(data.scheduled_end)
  },
  {
    message: 'End time must be after start time',
    path: ['scheduled_end']
  }
)

// Business logic validations
export const jobItemValidation = z.object({
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unit_price_cents: currencySchema,
}).refine(
  (data) => data.quantity * data.unit_price_cents >= 0,
  {
    message: 'Line total must be positive',
    path: ['unit_price_cents']
  }
)

export const discountValidation = z.object({
  subtotal_cents: currencySchema,
  discount_cents: currencySchema,
}).refine(
  (data) => data.discount_cents <= data.subtotal_cents,
  {
    message: 'Discount cannot exceed subtotal',
    path: ['discount_cents']
  }
)

// Form field validation helpers
export function validateRequired<T>(value: T, fieldName: string): T {
  if (value === null || value === undefined || value === '') {
    throw new Error(`${fieldName} is required`)
  }
  return value
}

export function validateOptional<T>(value: T | null | undefined): T | null {
  return value ?? null
}

export function validatePositiveNumber(value: number, fieldName: string): number {
  if (value < 0) {
    throw new Error(`${fieldName} must be positive`)
  }
  return value
}

export function validatePercentage(value: number, fieldName: string): number {
  if (value < 0 || value > 100) {
    throw new Error(`${fieldName} must be between 0 and 100`)
  }
  return value
}

// Input sanitization
export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' ')
}

export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '')
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

// Custom validation error handling
export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: unknown
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function createValidationError(field: string, message: string, value: unknown): ValidationError {
  return new ValidationError(message, field, value)
}

// Validation result helpers
export type ValidationResult<T> = {
  success: true
  data: T
} | {
  success: false
  error: string
  field?: string
}

export function validateWithResult<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      return {
        success: false,
        error: firstError.message,
        field: firstError.path.join('.')
      }
    }
    return {
      success: false,
      error: 'Validation failed'
    }
  }
}