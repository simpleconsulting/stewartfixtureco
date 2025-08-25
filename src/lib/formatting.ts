// Currency and number formatting utilities

export function formatCurrency(cents: number, currency: string = 'USD'): string {
  const dollars = cents / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(dollars)
}

export function formatCentsToDisplay(cents: number): string {
  return formatCurrency(cents)
}

export function parseCurrencyToCents(currencyString: string): number {
  // Remove currency symbols and convert to number
  const cleanString = currencyString.replace(/[^0-9.-]/g, '')
  const dollars = parseFloat(cleanString) || 0
  return Math.round(dollars * 100)
}

// Address formatting utilities
export function formatAddress(
  addressLine1?: string | null,
  addressLine2?: string | null,
  city?: string | null,
  state?: string | null,
  postalCode?: string | null,
  country?: string | null
): string {
  const parts: string[] = []
  
  if (addressLine1) parts.push(addressLine1)
  if (addressLine2) parts.push(addressLine2)
  
  const cityStateZip: string[] = []
  if (city) cityStateZip.push(city)
  if (state) cityStateZip.push(state)
  if (postalCode) cityStateZip.push(postalCode)
  
  if (cityStateZip.length > 0) {
    parts.push(cityStateZip.join(', '))
  }
  
  if (country && country !== 'USA') {
    parts.push(country)
  }
  
  return parts.join(', ')
}

export function formatShortAddress(
  city?: string | null,
  state?: string | null,
  postalCode?: string | null
): string {
  const parts: string[] = []
  if (city) parts.push(city)
  if (state) parts.push(state)
  if (postalCode) parts.push(postalCode)
  return parts.join(', ')
}

// Date and time formatting utilities
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(date)
}

export function formatDateTime(dateString: string): string {
  return formatDate(dateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function formatDateForInput(dateString: string): string {
  const date = new Date(dateString)
  return date.toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm format for datetime-local input
}

export function formatDateRange(startDate: string, endDate: string): string {
  const start = formatDate(startDate)
  const end = formatDate(endDate)
  return `${start} - ${end}`
}

// Duration formatting
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${remainingMinutes}m`
}

// Phone number formatting
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Check if it's a US number (10 or 11 digits)
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4')
  }
  
  // Return original if not recognized format
  return phone
}

// Status badge utilities
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    // Job statuses
    draft: 'bg-gray-100 text-gray-800',
    quoted: 'bg-blue-100 text-blue-800',
    scheduled: 'bg-orange-100 text-orange-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    canceled: 'bg-red-100 text-red-800',
    
    // Payment statuses
    unpaid: 'bg-red-100 text-red-800',
    partial: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    refunded: 'bg-gray-100 text-gray-800',
    
    // Default
    default: 'bg-gray-100 text-gray-800',
  }
  
  return statusColors[status] || statusColors.default
}

// Percentage formatting
export function formatPercentage(decimal: number, decimals: number = 1): string {
  return `${(decimal * 100).toFixed(decimals)}%`
}

// Text utilities
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function toTitleCase(text: string): string {
  return text
    .split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ')
}