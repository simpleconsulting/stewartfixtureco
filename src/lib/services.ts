'use client'

import { useState, useEffect, useMemo } from 'react'
import { fetchServices, fetchServiceById, fetchServicesByIds } from '@/lib/database'
import { createClient } from '@/lib/supabase/client'
import type { ServiceOffering } from '@/types/database'

// Cache for services data
const servicesCache = {
  data: null as ServiceOffering[] | null,
  timestamp: 0,
  ttl: 5 * 60 * 1000, // 5 minutes
}

// Service category mapping based on service names
const SERVICE_CATEGORIES = {
  'Lighting & Fixtures': [
    'Ceiling Fan Installation',
    'Standard Light Fixture Replacement',
    'Pendant/Chandelier Install (<10ft ceiling)',
    'Pendant/Chandelier Install (10–14ft ceiling)',
    'Vanity Light Replacement',
    'Install Motion Sensor Light (Interior/Exterior)',
  ],
  'Switches & Outlets': [
    'Dimmer Switch Install',
    '3-Way Switch Install/Troubleshoot',
    'Light Switch Replacement (Standard)',
    'Standard Outlet Replacement',
    'Install USB Outlet',
    'Install GFCI Outlet',
  ],
  'Safety & Ventilation': [
    'Replace/Install Smoke or CO2 Detector (Battery or Hardwired)',
  ],
  'Hardware & Other': [
    'Basic Cabinet Handle/Knob Swap (Up to 20)',
    'TV Mounting with Cord Concealment',
    'Quick Visit (1 small task, <30 mins)',
  ],
} as const

type ServiceCategory = keyof typeof SERVICE_CATEGORIES

// Helper function to determine category from service name
function getCategoryForService(serviceName: string): ServiceCategory {
  for (const [category, services] of Object.entries(SERVICE_CATEGORIES)) {
    if ((services as readonly string[]).includes(serviceName)) {
      return category as ServiceCategory
    }
  }
  return 'Hardware & Other' // Default category
}

// Hook to fetch all services
export function useServices() {
  const [services, setServices] = useState<ServiceOffering[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadServices() {
      try {
        // Check cache first
        const now = Date.now()
        if (servicesCache.data && (now - servicesCache.timestamp) < servicesCache.ttl) {
          setServices(servicesCache.data)
          setLoading(false)
          return
        }

        setLoading(true)
        const supabase = createClient()
        const { data, error: fetchError } = await fetchServices(supabase)

        if (fetchError) {
          setError(fetchError)
          setServices([])
        } else {
          const servicesData = data || []
          setServices(servicesData)
          setError(null)
          
          // Update cache
          servicesCache.data = servicesData
          servicesCache.timestamp = now
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load services')
        setServices([])
      } finally {
        setLoading(false)
      }
    }

    loadServices()
  }, [])

  return { services, loading, error, refetch: () => {
    servicesCache.timestamp = 0 // Invalidate cache
    setLoading(true)
    setError(null)
  }}
}

// Hook to get services grouped by category
export function useServicesByCategory() {
  const { services, loading, error } = useServices()

  const servicesByCategory = useMemo(() => {
    if (!services.length) return {}

    const grouped: Record<string, ServiceOffering[]> = {}
    
    services.forEach(service => {
      const category = getCategoryForService(service.name)
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(service)
    })

    // Sort services within each category by name
    Object.values(grouped).forEach(categoryServices => {
      categoryServices.sort((a, b) => a.name.localeCompare(b.name))
    })

    return grouped
  }, [services])

  const categories = useMemo(() => Object.keys(servicesByCategory), [servicesByCategory])

  return {
    servicesByCategory,
    categories,
    loading,
    error,
    getServicesByCategory: (category: string) => servicesByCategory[category] || []
  }
}

// Hook to get a single service by ID
export function useService(id: string | null) {
  const [service, setService] = useState<ServiceOffering | null>(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setService(null)
      setLoading(false)
      setError(null)
      return
    }

    async function loadService() {
      try {
        setLoading(true)
        const supabase = createClient()
        const { data, error: fetchError } = await fetchServiceById(supabase, id!)

        if (fetchError) {
          setError(fetchError)
          setService(null)
        } else {
          setService(data)
          setError(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load service')
        setService(null)
      } finally {
        setLoading(false)
      }
    }

    loadService()
  }, [id])

  return { service, loading, error }
}

// Hook to get multiple services by IDs
export function useServicesByIds(ids: string[]) {
  const [services, setServices] = useState<ServiceOffering[]>([])
  const [loading, setLoading] = useState(ids.length > 0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ids.length) {
      setServices([])
      setLoading(false)
      setError(null)
      return
    }

    async function loadServices() {
      try {
        setLoading(true)
        const supabase = createClient()
        const { data, error: fetchError } = await fetchServicesByIds(supabase, ids)

        if (fetchError) {
          setError(fetchError)
          setServices([])
        } else {
          setServices(data || [])
          setError(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load services')
        setServices([])
      } finally {
        setLoading(false)
      }
    }

    loadServices()
  }, [ids])

  return { services, loading, error }
}

// Utility function to convert cents to dollars
export function centsToDollars(cents: number): number {
  return Math.round(cents / 100)
}

// Utility function to convert dollars to cents
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100)
}

// Helper functions for pricing calculations (matching pricing.ts API)

// Get service by ID from services array
export function getServiceById(services: ServiceOffering[], id: string): ServiceOffering | undefined {
  return services.find(service => service.id === id)
}

// Get services by category
export function getServicesByCategory(services: ServiceOffering[], category: string): ServiceOffering[] {
  return services.filter(service => getCategoryForService(service.name) === category)
}

// Get all unique categories
export function getAllCategories(): string[] {
  return Object.keys(SERVICE_CATEGORIES)
}

// Calculate total price in dollars from service quantities
export function calculateTotal(services: ServiceOffering[], serviceQuantities: Record<string, number>): number {
  return Object.entries(serviceQuantities).reduce((total, [id, quantity]) => {
    const service = getServiceById(services, id)
    if (service) {
      const priceInDollars = centsToDollars(service.base_price_cents)
      return total + (priceInDollars * quantity)
    }
    return total
  }, 0)
}

// Get services formatted for display (minimal info)
export function getServicesForDisplay(services: ServiceOffering[]) {
  return services.map(service => ({
    id: service.id,
    category: getCategoryForService(service.name),
    name: service.name,
    description: service.description
  }))
}

// Find service by ID (for backwards compatibility)
export function findServiceById(services: ServiceOffering[], id: string): ServiceOffering | undefined {
  return getServiceById(services, id)
}

// Legacy interface for compatibility with existing pricing.ts structure
export interface ServiceItem {
  id: string;
  category: string;
  name: string;
  price: number; // in dollars
  description?: string;
  unit?: string;
  default_duration_minutes?: number;
}

// Convert database ServiceOffering to legacy ServiceItem format
export function convertToServiceItem(service: ServiceOffering): ServiceItem {
  return {
    id: service.id,
    category: getCategoryForService(service.name),
    name: service.name,
    price: centsToDollars(service.base_price_cents),
    description: service.description || undefined,
    unit: service.unit,
    default_duration_minutes: service.default_duration_minutes || undefined,
  }
}

// Convert multiple services to legacy format
export function convertServicesToItems(services: ServiceOffering[]): ServiceItem[] {
  return services.map(convertToServiceItem)
}