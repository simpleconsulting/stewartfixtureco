'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Plus, Search, Edit, DollarSign, Trash2, Clock } from 'lucide-react'
import { createService, updateService, deleteService, fetchAllServices } from '@/lib/database'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { ServiceOffering } from '@/types/database'

// Service category mapping
const SERVICE_CATEGORIES = {
  'Lighting & Fixtures': [
    'Ceiling Fan Installation',
    'Standard Light Fixture Replacement',
    'Pendant/Chandelier Install (<10ft ceiling)',
    'Vanity Light Replacement',
    'Install Motion Sensor Light (Interior/Exterior)',
  ],
  'Switches & Outlets': [
    'Dimmer Switch Install',
    'Light Switch Replacement (Standard)',
    'Standard Outlet Replacement',
    'Install USB Outlet',
    'Install GFCI Outlet',
    '3-Way Switch Install',
  ],
  'Safety & Ventilation': [
    'Replace/Install Smoke or CO2 Detector (Battery or Hardwired)',
  ],
  'Hardware & Other': [
    'Basic Cabinet Handle/Knob Swap (Up to 20)',
    'Quick Visit (1 small task, <30 mins)',
    'TV Mounting',
  ],
} as const

function getCategoryForService(serviceName: string): string {
  for (const [category, services] of Object.entries(SERVICE_CATEGORIES)) {
    if ((services as readonly string[]).some(s => serviceName.includes(s) || s.includes(serviceName))) {
      return category
    }
  }
  return 'Hardware & Other'
}

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [allServices, setAllServices] = useState<ServiceOffering[]>([])
  const [loading, setLoading] = useState(true)
  const [editingService, setEditingService] = useState<ServiceOffering | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    isActive: true
  })

  // Load services (including inactive)
  const loadAllServices = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await fetchAllServices(supabase)

      if (error) {
        toast.error('Failed to load services', { description: error })
      } else {
        setAllServices(data || [])
      }
    } catch (err) {
      toast.error('Error loading services', {
        description: err instanceof Error ? err.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  // Load on mount
  useEffect(() => {
    loadAllServices()
  }, [])

  const filteredServices = useMemo(() => {
    return allServices.filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [allServices, searchTerm])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    allServices.forEach(service => {
      const category = getCategoryForService(service.name)
      counts[category] = (counts[category] || 0) + 1
    })
    return counts
  }, [allServices])

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A'
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes === 0 ? `${hours}h` : `${hours}h ${remainingMinutes}m`
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      isActive: true
    })
    setEditingService(null)
  }

  const openAddDialog = () => {
    resetForm()
    setIsAddDialogOpen(true)
  }

  const openEditDialog = (service: ServiceOffering) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description || '',
      price: (service.base_price_cents / 100).toFixed(2),
      duration: service.default_duration_minutes?.toString() || '',
      isActive: service.is_active
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveService = async () => {
    if (!formData.name || !formData.price) {
      toast.error('Please fill in required fields', {
        description: 'Name and price are required'
      })
      return
    }

    try {
      const supabase = createClient()
      const serviceData = {
        name: formData.name,
        description: formData.description || undefined,
        base_price_cents: Math.round(parseFloat(formData.price) * 100),
        default_duration_minutes: formData.duration ? parseInt(formData.duration) : null,
        is_active: formData.isActive
      }

      if (editingService) {
        // Update existing service
        const { data, error } = await updateService(supabase, editingService.id, serviceData)

        if (error) {
          toast.error('Failed to update service', { description: error })
        } else if (data) {
          toast.success('Service updated successfully')
          setIsEditDialogOpen(false)
          loadAllServices()
          resetForm()
        }
      } else {
        // Create new service
        const { data, error } = await createService(supabase, serviceData)

        if (error) {
          toast.error('Failed to create service', { description: error })
        } else if (data) {
          toast.success('Service created successfully')
          setIsAddDialogOpen(false)
          loadAllServices()
          resetForm()
        }
      }
    } catch (err) {
      toast.error('Error saving service', {
        description: err instanceof Error ? err.message : 'Unknown error'
      })
    }
  }

  const handleDeleteService = async (service: ServiceOffering) => {
    if (!confirm(`Are you sure you want to deactivate "${service.name}"? This will hide it from customers.`)) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await deleteService(supabase, service.id, false) // Soft delete

      if (error) {
        toast.error('Failed to deactivate service', { description: error })
      } else {
        toast.success('Service deactivated successfully')
        loadAllServices()
      }
    } catch (err) {
      toast.error('Error deactivating service', {
        description: err instanceof Error ? err.message : 'Unknown error'
      })
    }
  }

  const ServiceDialog = ({ open, onOpenChange, title }: { open: boolean; onOpenChange: (open: boolean) => void; title: string }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Service Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Ceiling Fan Installation"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the service"
              className="mt-1 resize-none"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="price">Price (in dollars) *</Label>
            <div className="relative mt-1">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="150.00"
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="duration">Duration (minutes, optional)</Label>
            <div className="relative mt-1">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="duration"
                type="number"
                min="0"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="60"
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Active (visible to customers)</Label>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                resetForm()
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveService}
              className="flex-1 bg-[#FCA311] hover:bg-[#FCA311]/90 text-[#14213D]"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Services</h1>
            <p className="text-sm text-gray-600">Manage your service offerings</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FCA311] mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Loading services...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-600">Manage your service offerings</p>
        </div>
        <Button
          size="sm"
          className="bg-[#FCA311] hover:bg-[#FCA311]/90 text-[#14213D]"
          onClick={openAddDialog}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Services List */}
      <div className="space-y-3">
        {filteredServices.map((service) => (
          <Card key={service.id} className={!service.is_active ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{service.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryForService(service.name)}
                    </Badge>
                    {!service.is_active && (
                      <Badge variant="destructive" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  {service.description && (
                    <p className="text-xs text-gray-600 mb-2">{service.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {formatPrice(service.base_price_cents)}
                    </div>
                    <div>
                      Duration: {formatDuration(service.default_duration_minutes)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(service)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {service.is_active && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteService(service)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-2">
              <Search className="w-8 h-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-600">No services found</p>
            <p className="text-xs text-gray-500">Try adjusting your search terms</p>
          </CardContent>
        </Card>
      )}

      {/* Service Categories Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Categories</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(SERVICE_CATEGORIES).map(([name]) => (
              <div key={name} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-sm">{name}</p>
                <p className="text-xs text-gray-600">{categoryCounts[name] || 0} services</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ServiceDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        title="Add New Service"
      />
      <ServiceDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Service"
      />
    </div>
  )
}
