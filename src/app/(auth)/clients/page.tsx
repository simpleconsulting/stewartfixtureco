'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Phone, Mail, MapPin, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { fetchClients, getClientStats } from '@/lib/database'
import type { Database } from '@/types/database'

type Client = Database['public']['Tables']['clients']['Row']

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    totalRevenue: 0,
    totalJobs: 0
  })
  
  const supabase = createClient()

  const loadClients = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await fetchClients(supabase, {
        limit: 50,
        search: searchTerm || undefined
      })

      if (fetchError) {
        setError(fetchError)
        setClients([])
      } else {
        setClients(data || [])
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clients')
      setClients([])
    } finally {
      setLoading(false)
    }
  }, [supabase, searchTerm])

  const loadStats = useCallback(async () => {
    try {
      const { data, error: statsError } = await getClientStats(supabase)
      if (!statsError && data) {
        setStats(data)
      }
    } catch (err) {
      console.error('Failed to load client stats:', err)
    }
  }, [supabase])

  useEffect(() => {
    loadClients()
    loadStats()
  }, [loadClients, loadStats])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
            <p className="text-sm text-gray-600">Manage your customer base</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FCA311] mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Loading clients...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-600">Manage your customer base</p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#FCA311]" />
          <span className="text-sm font-medium text-gray-600">
            {clients.length} total
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search clients by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">Error: {error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadClients}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Client Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-600">Total Clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
            <p className="text-xs text-gray-600">Total Jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              ${stats.totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600">Total Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      <div className="space-y-3">
        {clients.map((client) => (
          <Card key={client.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-sm">
                      {client.full_name || 'Unknown Client'}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="space-y-1 mb-3">
                    {client.email && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Mail className="w-3 h-3" />
                        {client.email}
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Phone className="w-3 h-3" />
                        {client.phone}
                      </div>
                    )}
                    {(client.address_line1 || client.city) && (
                      <div className="flex items-start gap-2 text-xs text-gray-600">
                        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>
                          {[client.address_line1, client.city, client.state].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Client Notes */}
                  {client.notes && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Notes:</p>
                      <p className="text-xs text-gray-700 italic">{client.notes}</p>
                    </div>
                  )}

                  {/* Date Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Client since: {formatDate(client.created_at)}</span>
                    {client.updated_at && client.updated_at !== client.created_at && (
                      <span>Updated: {formatDate(client.updated_at)}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                {client.email && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => window.open(`mailto:${client.email}`, '_blank')}
                  >
                    <Mail className="w-3 h-3 mr-1" />
                    Email
                  </Button>
                )}
                {client.phone && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => window.open(`tel:${client.phone}`, '_blank')}
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    Call
                  </Button>
                )}
                <Button variant="outline" size="sm" className="h-8">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {clients.length === 0 && !loading && !error && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-2">
              <Users className="w-8 h-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-600">No clients found</p>
            <p className="text-xs text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Clients will appear here when leads are converted'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}