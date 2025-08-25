'use client'

import { useEffect } from 'react'

// UTM parameter types
export interface UTMParams {
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_term?: string | null
  utm_content?: string | null
}

// Storage key for UTM params
const UTM_STORAGE_KEY = 'stewart_utm_params'

/**
 * Parse UTM parameters from URL search params
 */
export function parseUTMParams(searchParams: URLSearchParams): UTMParams {
  const params: UTMParams = {}
  
  // Only extract recognized UTM parameters
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const
  
  utmKeys.forEach(key => {
    const value = searchParams.get(key)
    if (value) {
      params[key] = value
    }
  })
  
  return params
}

/**
 * Store UTM parameters in sessionStorage
 * First-touch attribution: only stores if not already present
 */
export function storeUTMParams(params: UTMParams): void {
  if (typeof window === 'undefined') return
  
  // Check if we already have stored UTM params (first-touch attribution)
  const existing = sessionStorage.getItem(UTM_STORAGE_KEY)
  if (existing) return
  
  // Only store if we have at least one UTM parameter
  if (Object.keys(params).length > 0) {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(params))
  }
}

/**
 * Retrieve stored UTM parameters from sessionStorage
 */
export function getStoredUTMParams(): UTMParams {
  if (typeof window === 'undefined') return {}
  
  try {
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as UTMParams
    }
  } catch (error) {
    console.error('Error parsing stored UTM params:', error)
  }
  
  return {}
}

/**
 * Clear stored UTM parameters (useful for testing)
 */
export function clearStoredUTMParams(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(UTM_STORAGE_KEY)
}

/**
 * React hook to handle UTM tracking on page load
 */
export function useUTMTracking(): UTMParams {
  useEffect(() => {
    // Parse UTM params from current URL
    const searchParams = new URLSearchParams(window.location.search)
    const utmParams = parseUTMParams(searchParams)
    
    // Store them (first-touch attribution)
    if (Object.keys(utmParams).length > 0) {
      storeUTMParams(utmParams)
    }
  }, [])
  
  // Return stored params (either from current visit or previous in session)
  return getStoredUTMParams()
}

/**
 * Get UTM source attribution label for display
 */
export function getUTMSourceLabel(source?: string | null): string {
  if (!source) return 'Direct'
  
  const sourceLabels: Record<string, string> = {
    'google': 'Google',
    'facebook': 'Facebook',
    'instagram': 'Instagram',
    'email': 'Email Campaign',
    'newsletter': 'Newsletter',
    'bing': 'Bing',
    'linkedin': 'LinkedIn',
    'twitter': 'Twitter',
    'youtube': 'YouTube',
    'pinterest': 'Pinterest',
    'reddit': 'Reddit',
    'direct': 'Direct',
    'organic': 'Organic Search',
    'referral': 'Referral'
  }
  
  return sourceLabels[source.toLowerCase()] || source
}