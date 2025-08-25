"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete-new";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, MapPin, Phone, Mail, Star, Award, Users, Shield, Plus, Minus } from "lucide-react";
import { 
  useServicesByCategory, 
  calculateTotal
} from "@/lib/services";
import { createLeadFromQuote } from "@/lib/database";
import { createClient } from "@/lib/supabase/client";
import type { PlaceDetails } from "@/lib/places-api";
import { useUTMTracking } from "@/lib/utm";

const topServices = [
  {
    title: "Ceiling Fan Installation",
    headline: "Need a Ceiling Fan Installed? We'll Have it Spinning Today.",
    price: "$200",
    description: "Professional installation at any height. No risk, no hassle, just cool comfort.",
    image: "/ceiling-fan-Installation.png",
    iconColor: "from-[#FCA311] to-[#000000]"
  },
  {
    title: "TV Mounting with Cord Concealment",
    headline: "Mount Your TV Like a Pro with Hidden Cords for a Clean Look.",
    price: "$225",
    description: "Professional TV installation with cord concealment for a sleek, finished appearance.",
    image: "/tv_mounthing.png",
    iconColor: "from-[#14213D] to-[#FCA311]"
  },
  {
    title: "Light Fixture & Pendant Swaps", 
    headline: "Refresh Any Room with a Fast, Professional Light Fixture Swap.",
    price: "Starting at $150",
    description: "Transform your space instantly. From vanity lights to chandeliers, we do it all.",
    image: "/pendant-light.png",
    iconColor: "from-[#000000] to-[#FCA311]"
  }
];

const serviceAreas = ["Spring Hill", "Franklin", "Thompson's Station", "Columbia"];

// This will be replaced by the hook in the component

export default function Home() {
  // Load services from database
  const { servicesByCategory, categories, loading, error } = useServicesByCategory();
  
  // Track UTM parameters
  const utmParams = useUTMTracking();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceQuantities: {} as Record<string, number>,
    address: "",
    message: "",
    discountCode: ""
  });
  
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [calculatedQuote, setCalculatedQuote] = useState<number | null>(null);
  const [showQuote, setShowQuote] = useState(false);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      serviceQuantities: checked 
        ? { ...prev.serviceQuantities, [serviceId]: 1 } // Default to 1 when checked
        : Object.fromEntries(Object.entries(prev.serviceQuantities).filter(([id]) => id !== serviceId))
    }));
  };

  const handleServiceQuantityChange = (serviceId: string, quantity: number) => {
    if (quantity > 0) {
      setFormData(prev => ({
        ...prev,
        serviceQuantities: { ...prev.serviceQuantities, [serviceId]: quantity }
      }));
    }
  };

  const incrementQuantity = (serviceId: string) => {
    const currentQty = formData.serviceQuantities[serviceId] || 1;
    if (currentQty < 10) {
      handleServiceQuantityChange(serviceId, currentQty + 1);
    }
  };

  const decrementQuantity = (serviceId: string) => {
    const currentQty = formData.serviceQuantities[serviceId] || 1;
    if (currentQty > 1) {
      handleServiceQuantityChange(serviceId, currentQty - 1);
    }
  };
  
  const getSelectedServices = () => {
    return Object.keys(formData.serviceQuantities);
  };
  
  const getTotalServiceCount = () => {
    return Object.values(formData.serviceQuantities).reduce((sum, qty) => sum + qty, 0);
  };
  
  const getCurrentTotal = () => {
    if (loading || error) return 0;
    return calculateTotal(Object.values(servicesByCategory).flat(), formData.serviceQuantities);
  };
  
  const getCurrentTotalWithDiscount = () => {
    const total = getCurrentTotal();
    const serviceCount = getTotalServiceCount();
    if (serviceCount >= 5) {
      return Math.round(total * 0.8); // 20% off for 5+ services
    } else if (serviceCount >= 3) {
      return Math.round(total * 0.9); // 10% off for 3+ services
    }
    return total;
  };

  const applyDiscountCode = (total: number, discountCode: string) => {
    const code = discountCode.toUpperCase().trim();
    if (code === 'FIRST20') {
      return Math.round(total * 0.8); // 20% off
    }
    return total;
  };

  const extractAddressComponents = (placeDetails: PlaceDetails | null) => {
    if (!placeDetails) return {};

    const components = placeDetails.addressComponents;
    const result: Record<string, string | number | undefined> = {};

    // Extract address components
    const streetNumber = components.find(c => c.types.includes('street_number'))?.longText;
    const route = components.find(c => c.types.includes('route'))?.longText;
    
    if (streetNumber && route) {
      result.address_line1 = `${streetNumber} ${route}`;
    } else if (route) {
      result.address_line1 = route;
    }

    result.city = components.find(c => c.types.includes('locality'))?.longText;
    result.state = components.find(c => c.types.includes('administrative_area_level_1'))?.shortText;
    result.postal_code = components.find(c => c.types.includes('postal_code'))?.longText;
    result.country = components.find(c => c.types.includes('country'))?.shortText || 'US';

    // Add coordinates
    if (placeDetails.location) {
      result.lat = placeDetails.location.latitude;
      result.lng = placeDetails.location.longitude;
    }

    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || error) return;
    
    let quote = calculateTotal(Object.values(servicesByCategory).flat(), formData.serviceQuantities);
    
    // Apply bundle discount first if applicable
    const serviceCount = getTotalServiceCount();
    if (serviceCount >= 5) {
      quote = Math.round(quote * 0.8); // 20% off for 5+ services
    } else if (serviceCount >= 3) {
      quote = Math.round(quote * 0.9); // 10% off for 3+ services
    }
    
    // Apply discount code if provided
    if (formData.discountCode) {
      quote = applyDiscountCode(quote, formData.discountCode);
    }
    
    // Create lead in parallel (don't block quote display)
    const createLead = async () => {
      try {
        const supabase = createClient();
        const addressComponents = extractAddressComponents(placeDetails);
        
        const leadInfo = {
          full_name: formData.name || undefined,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          service_notes: formData.message || undefined,
          ...addressComponents,
          ...utmParams  // Include UTM parameters
        };

        const { data: leadResult, error: leadError } = await createLeadFromQuote(
          supabase,
          leadInfo,
          formData.serviceQuantities  // Pass the full quantities object
        );

        if (leadError) {
          console.error("Error saving lead:", leadError);
        } else {
          const serviceCount = Object.keys(formData.serviceQuantities).length;
          console.log(`✅ Lead saved successfully with ${serviceCount} service${serviceCount !== 1 ? 's' : ''}`);
          if (leadResult?.leadId) {
            console.log(`Lead ID: ${leadResult.leadId}`);
          }
        }
      } catch (error) {
        console.error("Unexpected error creating lead:", error);
      }
    };

    // Create lead without blocking the UI
    createLead();
    
    setCalculatedQuote(quote);
    setShowQuote(true);
    console.log("Form submitted:", formData, "Quote:", quote);
  };

  return (
    <div className="min-h-screen bg-[#E5E5E5]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#000000] via-[#14213D] to-[#000000] py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left relative z-10">
              <div className="mb-8">
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                  <Image
                    src="/icon_w_name.svg"
                    alt="Stewart Services Logo"
                    width={300}
                    height={120}
                    className="w-auto h-24 lg:h-32 filter brightness-0 invert"
                  />
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <div className="flex text-[#FCA311]">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                  </div>
                  <span className="text-white/90 text-lg font-medium">5-Star Local Service</span>
                </div>
              </div>
              
              <p className="text-2xl lg:text-3xl text-[#FCA311] font-semibold mb-6 tracking-wide">
                &ldquo;Fixtures, fans, devices. Installed right.&rdquo;
              </p>
              
              <p className="text-lg lg:text-xl text-white/90 mb-10 max-w-2xl leading-relaxed">
                Professional, on-time installation of light fixtures, ceiling fans, switches, outlets, and home hardware — delivering clean, trusted, local service without the hassle or price tag of a licensed contractor.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-[#FCA311] hover:bg-[#FCA311]/80 text-[#14213D] px-10 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
                      Free Instant Quote
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl bg-gradient-to-br from-[#E5E5E5] to-white border-0 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="text-center pb-4">
                      <DialogTitle className="text-2xl font-bold text-[#14213D] mb-2">Get Your Free Quote</DialogTitle>
                      <p className="text-[#000000] text-base">Professional installation with transparent flat-rate pricing</p>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                      <div>
                        <Label htmlFor="name" className="text-[#14213D] font-semibold">Full Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          className="border-[#FCA311]/30 focus:border-[#FCA311] focus:ring-[#FCA311]/20 mt-1"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-[#14213D] font-semibold">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="border-[#FCA311]/30 focus:border-[#FCA311] focus:ring-[#FCA311]/20 mt-1"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-[#14213D] font-semibold">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="border-[#FCA311]/30 focus:border-[#FCA311] focus:ring-[#FCA311]/20 mt-1"
                          placeholder="(815) 555-0123"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-[#14213D] font-semibold">Services Needed</Label>
                        <div className="mt-2 max-h-64 overflow-y-auto border border-[#FCA311]/30 rounded-md p-4 bg-white">
                          {loading ? (
                            <div className="text-center py-4 text-[#14213D]">Loading services...</div>
                          ) : error ? (
                            <div className="text-center py-4 text-red-600">Error loading services: {error}</div>
                          ) : categories.map(category => (
                            <div key={category} className="mb-6">
                              <h4 className="font-semibold text-[#14213D] text-sm mb-3">{category}</h4>
                              {servicesByCategory[category]?.map(service => (
                                <div key={service.id} className="py-2 px-3 rounded-lg hover:bg-[#FCA311]/10 mb-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 flex-1">
                                      <Checkbox
                                        id={service.id}
                                        checked={service.id in formData.serviceQuantities}
                                        onCheckedChange={(checked) => handleServiceToggle(service.id, checked as boolean)}
                                        className="border-[#FCA311]/30"
                                      />
                                      <Label 
                                        htmlFor={service.id}
                                        className="text-sm text-[#000000] font-medium cursor-pointer"
                                      >
                                        {service.name}
                                      </Label>
                                    </div>
                                    {service.id in formData.serviceQuantities && (
                                      <div className="flex items-center space-x-2">
                                        <Label className="text-xs text-[#000000]">Qty:</Label>
                                        <div className="flex items-center border border-[#FCA311]/30 rounded-md">
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 hover:bg-[#FCA311]/10"
                                            onClick={() => decrementQuantity(service.id)}
                                            disabled={formData.serviceQuantities[service.id] <= 1}
                                          >
                                            <Minus className="h-3 w-3" />
                                          </Button>
                                          <Input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={formData.serviceQuantities[service.id] || 1}
                                            onChange={(e) => handleServiceQuantityChange(service.id, parseInt(e.target.value) || 1)}
                                            onFocus={(e) => e.target.select()}
                                            className="w-12 h-8 text-center border-0 focus:ring-0 focus:border-0"
                                          />
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 hover:bg-[#FCA311]/10"
                                            onClick={() => incrementQuantity(service.id)}
                                            disabled={formData.serviceQuantities[service.id] >= 10}
                                          >
                                            <Plus className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                        {getSelectedServices().length > 0 && !showQuote && (
                          <div className={`mt-4 p-4 rounded-xl border ${getTotalServiceCount() >= 5 ? 'bg-gradient-to-r from-purple-100 to-purple-200 border-purple-300' : getTotalServiceCount() === 4 ? 'bg-gradient-to-r from-red-100 to-red-200 border-red-400' : getTotalServiceCount() === 3 ? 'bg-gradient-to-r from-green-100 to-green-200 border-green-300' : getTotalServiceCount() === 2 ? 'bg-gradient-to-r from-amber-100 to-amber-200 border-amber-300' : 'bg-gradient-to-r from-[#FCA311]/10 to-[#FCA311]/20 border-[#FCA311]/30'}`}>
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm font-semibold text-[#14213D]">Services Selected:</p>
                                <p className="text-xs text-[#000000]">
                                  {getTotalServiceCount()} service{getTotalServiceCount() !== 1 ? 's' : ''}
                                  {getTotalServiceCount() >= 5 && " • 20% MEGA Bundle Discount Applied! 🚀"}
                                  {getTotalServiceCount() === 4 && " • Add 1 more service for 20% off everything! 🚀"}
                                  {getTotalServiceCount() === 3 && " • 10% Bundle Discount! Add 2 more for 20% off! 🎉"}
                                  {getTotalServiceCount() === 2 && " • Add 1 more service for 10% off everything! 💰"}
                                  {getTotalServiceCount() === 1 && " • Add 2 more services for 10% off everything!"}
                                </p>
                              </div>
                              <div className="text-right">
                                {getTotalServiceCount() >= 5 ? (
                                  <p className="text-lg font-semibold text-purple-700">MEGA Discount!</p>
                                ) : getTotalServiceCount() === 4 ? (
                                  <p className="text-lg font-semibold text-red-700 animate-pulse">Almost MEGA!</p>
                                ) : getTotalServiceCount() === 3 ? (
                                  <p className="text-lg font-semibold text-green-700">Bundle Discount!</p>
                                ) : getTotalServiceCount() === 2 ? (
                                  <p className="text-lg font-semibold text-amber-700">Almost There!</p>
                                ) : (
                                  <p className="text-lg font-semibold text-[#14213D]">Submit for Quote</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="address" className="text-[#14213D] font-semibold">Service Address</Label>
                        <AddressAutocomplete
                          id="address"
                          value={formData.address}
                          onChange={(value) => handleInputChange("address", value)}
                          onPlaceSelected={setPlaceDetails}
                          className="mt-1"
                          placeholder="Street address in Spring Hill, Thompson's Station, or Columbia TN"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="discountCode" className="text-[#14213D] font-semibold">Discount Code (Optional)</Label>
                        <Input
                          id="discountCode"
                          value={formData.discountCode}
                          onChange={(e) => handleInputChange("discountCode", e.target.value)}
                          className="border-[#FCA311]/30 focus:border-[#FCA311] focus:ring-[#FCA311]/20 mt-1"
                          placeholder="Enter discount code"
                        />
                      </div>
                      <div>
                        <Label htmlFor="message" className="text-[#14213D] font-semibold">Additional Details</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => handleInputChange("message", e.target.value)}
                          className="border-[#FCA311]/30 focus:border-[#FCA311] focus:ring-[#FCA311]/20 mt-1 resize-none"
                          placeholder="Tell us more about your project..."
                          rows={3}
                        />
                      </div>
                      {showQuote && calculatedQuote !== null ? (
                        <div className="bg-gradient-to-r from-[#FCA311] to-[#FCA311]/80 rounded-xl p-6 text-center text-[#14213D] mb-4">
                          <h3 className="text-2xl font-bold mb-2">Your Quote</h3>
                          <div className="text-4xl font-bold mb-2">${calculatedQuote}</div>
                          <p className="text-sm opacity-90">
                            {getTotalServiceCount()} total service{getTotalServiceCount() !== 1 ? 's' : ''} • {getSelectedServices().length} service type{getSelectedServices().length !== 1 ? 's' : ''} selected
                            {getTotalServiceCount() >= 5 && " • 20% MEGA Bundle discount applied!"}
                            {getTotalServiceCount() >= 3 && getTotalServiceCount() < 5 && " • 10% Bundle discount applied!"}
                            {formData.discountCode && formData.discountCode.toUpperCase().trim() === 'FIRST20' && " • Discount code applied!"}
                          </p>
                          <p className="text-sm opacity-90 mt-1">
                            No hidden fees • Flat-rate pricing • Same-day response
                          </p>
                          <Button 
                            type="button"
                            onClick={() => {
                              setShowQuote(false);
                              setCalculatedQuote(null);
                            }}
                            className="mt-3 bg-[#14213D]/20 hover:bg-[#14213D]/30 text-[#14213D] border border-[#14213D]/30"
                          >
                            Edit Services
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          type="submit" 
                          disabled={getSelectedServices().length === 0}
                          className="w-full bg-[#FCA311] hover:bg-[#FCA311]/80 text-[#14213D] py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Calculate My Quote
                        </Button>
                      )}
                      <p className="text-center text-sm text-[#000000] mt-3">
                        {getSelectedServices().length === 0 ? "Please select at least one service" : "No obligation • Same-day response • Serving Middle TN"}
                      </p>
                    </form>
                  </DialogContent>
                </Dialog>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="lg" className="px-10 py-4 text-lg font-semibold rounded-xl border-2 border-[#FCA311]/50 text-[#FCA311] hover:bg-[#FCA311]/10 backdrop-blur-sm">
                      View Services
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl bg-gradient-to-br from-[#E5E5E5] to-white border-0 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="text-center pb-4">
                      <DialogTitle className="text-3xl font-bold text-[#14213D] mb-2">Our Complete Service List</DialogTitle>
                      <p className="text-[#000000] text-lg">Professional installation with transparent flat-rate pricing</p>
                    </DialogHeader>
                    <div className="grid gap-8 pt-4">
                      {loading ? (
                        <div className="text-center py-8 text-[#14213D]">Loading services...</div>
                      ) : error ? (
                        <div className="text-center py-8 text-red-600">Error loading services: {error}</div>
                      ) : Object.entries(servicesByCategory).map(([category, services]) => (
                        <div key={category} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-[#FCA311]/20">
                          <h3 className="text-xl font-bold text-[#14213D] mb-4 border-b border-[#FCA311]/30 pb-2">
                            {category}
                          </h3>
                          <div className="grid gap-3">
                            {services.map((service, index) => (
                              <div key={index} className="py-2 px-3 rounded-lg hover:bg-[#FCA311]/10 transition-colors">
                                <div className="text-[#000000] font-medium">{service.name}</div>
                                {service.description && (
                                  <div className="text-sm text-[#000000]/70 mt-1">{service.description}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-[#FCA311]/30 text-center">
                      <p className="text-[#000000] mb-4">Ready to get started?</p>
                      {/* Avoid nested dialogs for better mobile UX. Consider closing this dialog before opening another. */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-[#FCA311] hover:bg-[#FCA311]/80 text-[#14213D] px-8 py-3 rounded-xl font-semibold">
                            <Phone className="mr-2 h-5 w-5" />
                            Book Service
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl bg-gradient-to-br from-[#E5E5E5] to-white border-0 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader className="text-center pb-4">
                            <DialogTitle className="text-2xl font-bold text-[#14213D] mb-2">Get Your Free Quote</DialogTitle>
                            <p className="text-[#000000] text-base">Professional installation with transparent flat-rate pricing</p>
                          </DialogHeader>
                          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="services-name" className="text-[#14213D] font-semibold">Full Name</Label>
                                <Input
                                  id="services-name"
                                  value={formData.name}
                                  onChange={(e) => handleInputChange("name", e.target.value)}
                                  className="border-[#FCA311]/30 focus:border-[#FCA311] focus:ring-[#FCA311]/20 mt-1"
                                  placeholder="Enter your full name"
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="services-email" className="text-[#14213D] font-semibold">Email Address</Label>
                                <Input
                                  id="services-email"
                                  type="email"
                                  value={formData.email}
                                  onChange={(e) => handleInputChange("email", e.target.value)}
                                  className="border-[#FCA311]/30 focus:border-[#FCA311] focus:ring-[#FCA311]/20 mt-1"
                                  placeholder="your@email.com"
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="services-phone" className="text-[#14213D] font-semibold">Phone Number</Label>
                                <Input
                                  id="services-phone"
                                  type="tel"
                                  value={formData.phone}
                                  onChange={(e) => handleInputChange("phone", e.target.value)}
                                  className="border-[#FCA311]/30 focus:border-[#FCA311] focus:ring-[#FCA311]/20 mt-1"
                                  placeholder="(815) 555-0123"
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="services-address" className="text-[#14213D] font-semibold">Service Address</Label>
                                <AddressAutocomplete
                                  id="services-address"
                                  value={formData.address}
                                  onChange={(value) => handleInputChange("address", value)}
                                  onPlaceSelected={setPlaceDetails}
                                  className="mt-1"
                                  placeholder="Street address in Spring Hill, Thompson's Station, or Columbia TN"
                                  required
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-[#14213D] font-semibold">Services Needed</Label>
                              <div className="mt-2 max-h-48 overflow-y-auto border border-[#FCA311]/30 rounded-md p-4 bg-white">
                                {loading ? (
                                  <div className="text-center py-4 text-[#14213D]">Loading services...</div>
                                ) : error ? (
                                  <div className="text-center py-4 text-red-600">Error loading services</div>
                                ) : categories.map(category => (
                                  <div key={category} className="mb-4">
                                    <h4 className="font-semibold text-[#14213D] text-sm mb-2">{category}</h4>
                                    {servicesByCategory[category]?.map(service => (
                                      <div key={service.id} className="py-2 px-3 rounded-lg hover:bg-[#FCA311]/10 mb-1">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-3 flex-1">
                                            <Checkbox
                                              id={`services-${service.id}`}
                                              checked={service.id in formData.serviceQuantities}
                                              onCheckedChange={(checked) => handleServiceToggle(service.id, checked as boolean)}
                                              className="border-[#FCA311]/30"
                                            />
                                            <Label 
                                              htmlFor={`services-${service.id}`}
                                              className="text-sm text-[#000000] font-medium cursor-pointer"
                                            >
                                              {service.name}
                                            </Label>
                                          </div>
                                          {service.id in formData.serviceQuantities && (
                                            <div className="flex items-center space-x-2">
                                              <Label className="text-xs text-[#000000]">Qty:</Label>
                                              <div className="flex items-center border border-[#FCA311]/30 rounded-md">
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-8 w-8 p-0 hover:bg-[#FCA311]/10"
                                                  onClick={() => decrementQuantity(service.id)}
                                                  disabled={formData.serviceQuantities[service.id] <= 1}
                                                >
                                                  <Minus className="h-3 w-3" />
                                                </Button>
                                                <Input
                                                  type="number"
                                                  min="1"
                                                  max="10"
                                                  value={formData.serviceQuantities[service.id] || 1}
                                                  onChange={(e) => handleServiceQuantityChange(service.id, parseInt(e.target.value) || 1)}
                                                  onFocus={(e) => e.target.select()}
                                                  className="w-12 h-8 text-center border-0 focus:ring-0 focus:border-0"
                                                />
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-8 w-8 p-0 hover:bg-[#FCA311]/10"
                                                  onClick={() => incrementQuantity(service.id)}
                                                  disabled={formData.serviceQuantities[service.id] >= 10}
                                                >
                                                  <Plus className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                              {getSelectedServices().length > 0 && (
                                <div className="mt-4 p-4 bg-gradient-to-r from-[#FCA311]/10 to-[#FCA311]/20 rounded-xl border border-[#FCA311]/30">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="text-sm font-semibold text-[#14213D]">Current Total:</p>
                                      <p className="text-xs text-[#000000]">
                                        {getTotalServiceCount()} service{getTotalServiceCount() !== 1 ? 's' : ''}
                                        {getTotalServiceCount() >= 3 && " • Bundle discount applied!"}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      {getTotalServiceCount() >= 3 && getCurrentTotal() !== getCurrentTotalWithDiscount() ? (
                                        <div>
                                          <p className="text-sm text-[#000000] line-through">${getCurrentTotal()}</p>
                                          <p className="text-2xl font-bold text-[#FCA311]">${getCurrentTotalWithDiscount()}</p>
                                        </div>
                                      ) : (
                                        <p className="text-2xl font-bold text-[#FCA311]">${getCurrentTotal()}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="services-message" className="text-[#14213D] font-semibold">Additional Details</Label>
                              <Textarea
                                id="services-message"
                                value={formData.message}
                                onChange={(e) => handleInputChange("message", e.target.value)}
                                className="border-[#FCA311]/30 focus:border-[#FCA311] focus:ring-[#FCA311]/20 mt-1 resize-none"
                                placeholder="Tell us more about your project..."
                                rows={3}
                              />
                            </div>
                            <Button type="submit" className="w-full bg-[#FCA311] hover:bg-[#FCA311]/80 text-[#14213D] py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 mt-6">
                              Book Service
                            </Button>
                            <p className="text-center text-sm text-[#000000] mt-3">
                              No obligation • Same-day response • Serving Middle TN
                            </p>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <div className="flex-1 lg:pl-8 relative z-10">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold mb-6 text-center text-white">Why Choose Us?</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                      <CheckCircle className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-white font-medium text-lg">Transparent flat-rate pricing</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                      <Award className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-white font-medium text-lg">Flexible scheduling — no weeks-long waits</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                      <Shield className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-white font-medium text-lg">Clean, safe, and fast installs</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                      <Users className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-white font-medium text-lg">No upsells, no hourly guessing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-16 bg-gradient-to-b from-[#E5E5E5] to-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-[#14213D] mb-4">Serving Tennessee Communities</h2>
            <div className="flex items-center justify-center gap-2 text-[#000000]">
              <MapPin className="h-5 w-5" />
              <span>Proudly serving</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {serviceAreas.map((area, index) => (
              <Badge key={index} variant="secondary" className="text-lg py-3 px-6 bg-[#14213D] text-white hover:bg-[#000000] border-0 rounded-xl font-semibold">
                {area}, TN
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Top Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#14213D] mb-6">
              Our Most Popular Services
            </h2>
            <p className="text-xl text-[#000000] max-w-3xl mx-auto leading-relaxed">
              Professional installation, transparent pricing, same-day service.
            </p>
          </div>
          
          {/* Desktop Grid */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-3 gap-8 max-w-7xl mx-auto">
              {topServices.map((service, index) => {
                return (
                  <Card key={index} className="bg-white border-0 shadow-2xl rounded-3xl overflow-hidden h-[650px]">
                    <CardContent className="p-6 h-full flex flex-col text-center">
                      <div className="bg-gray-50 rounded-3xl mb-6 shadow-inner mx-auto w-40 h-40 overflow-hidden flex-shrink-0">
                        <Image
                          src={service.image}
                          alt={service.title}
                          width={256}
                          height={256}
                          className="w-40 h-40 object-cover"
                          quality={100}
                          style={{objectPosition: 'center'}}
                        />
                      </div>
                      <h2 className="text-xl font-bold text-[#FCA311] mb-4 uppercase tracking-wide min-h-[28px] flex items-center justify-center">
                        {service.title}
                      </h2>
                      <h3 className="text-2xl font-bold text-[#14213D] mb-4 leading-tight min-h-[64px] flex items-center justify-center">
                        {service.headline}
                      </h3>
                      <p className="text-base text-[#000000] mb-6 leading-relaxed flex-1 flex items-center justify-center">
                        {service.description}
                      </p>
                      <div className="flex flex-col items-center gap-4">
                        <div className="text-4xl font-bold text-[#FCA311] min-h-[48px] flex items-center justify-center">{service.price}</div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="bg-[#FCA311] hover:bg-[#FCA311]/80 text-[#14213D] px-8 py-3 rounded-xl font-semibold w-full">
                              Book Service
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl bg-gradient-to-br from-[#E5E5E5] to-white border-0 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader className="text-center pb-4">
                              <DialogTitle className="text-2xl font-bold text-[#14213D] mb-2">Schedule Your {service.title}</DialogTitle>
                              <p className="text-[#000000] text-base">Professional installation with transparent flat-rate pricing</p>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                              <div>
                                <Label htmlFor={`desktop-name-${index}`} className="text-[#14213D] font-semibold">Full Name</Label>
                                <Input
                                  id={`desktop-name-${index}`}
                                  value={formData.name}
                                  onChange={(e) => handleInputChange("name", e.target.value)}
                                  className="border-[#FCA311]/30 focus:border-[#FCA311] focus:ring-[#FCA311]/20 mt-1"
                                  placeholder="Enter your full name"
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor={`desktop-email-${index}`} className="text-[#14213D] font-semibold">Email Address</Label>
                                <Input
                                  id={`desktop-email-${index}`}
                                  type="email"
                                  value={formData.email}
                                  onChange={(e) => handleInputChange("email", e.target.value)}
                                  className="border-[#FCA311]/30 focus:border-[#FCA311] focus:ring-[#FCA311]/20 mt-1"
                                  placeholder="your@email.com"
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor={`desktop-phone-${index}`} className="text-[#14213D] font-semibold">Phone Number</Label>
                                <Input
                                  id={`desktop-phone-${index}`}
                                  type="tel"
                                  value={formData.phone}
                                  onChange={(e) => handleInputChange("phone", e.target.value)}
                                  className="border-[#FCA311]/30 focus:border-[#FCA311] focus:ring-[#FCA311]/20 mt-1"
                                  placeholder="(815) 555-0123"
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor={`desktop-address-${index}`}>Service Address</Label>
                                <AddressAutocomplete
                                  id={`desktop-address-${index}`}
                                  value={formData.address}
                                  onChange={(value) => handleInputChange("address", value)}
                                  onPlaceSelected={setPlaceDetails}
                                  placeholder="Street address in Spring Hill, Thompson's Station, or Columbia TN"
                                  required
                                />
                              </div>
                              <div>
                                <Label className="text-[#14213D] font-semibold">Services Needed</Label>
                                <div className="mt-2 max-h-32 overflow-y-auto border border-[#FCA311]/30 rounded-md p-3 bg-white">
                                  {loading ? (
                                    <div className="text-center py-2 text-[#14213D] text-xs">Loading...</div>
                                  ) : error ? (
                                    <div className="text-center py-2 text-red-600 text-xs">Error</div>
                                  ) : categories.map(category => (
                                    <div key={category} className="mb-3">
                                      <h4 className="font-semibold text-[#14213D] text-xs mb-1">{category}</h4>
                                      {servicesByCategory[category]?.map(svc => (
                                        <div key={svc.id} className="mb-1">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2 flex-1">
                                              <Checkbox
                                                id={`desktop-${index}-${svc.id}`}
                                                checked={svc.id in formData.serviceQuantities}
                                                onCheckedChange={(checked) => handleServiceToggle(svc.id, checked as boolean)}
                                                className="border-[#FCA311]/30"
                                              />
                                              <Label 
                                                htmlFor={`desktop-${index}-${svc.id}`}
                                                className="text-xs text-[#000000] font-medium cursor-pointer"
                                              >
                                                {svc.name}
                                              </Label>
                                            </div>
                                            {svc.id in formData.serviceQuantities && (
                                              <div className="flex items-center space-x-1">
                                                <Label className="text-xs text-[#000000]">Qty:</Label>
                                                <div className="flex items-center border border-[#FCA311]/30 rounded-md">
                                                  <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 hover:bg-[#FCA311]/10"
                                                    onClick={() => decrementQuantity(svc.id)}
                                                    disabled={formData.serviceQuantities[svc.id] <= 1}
                                                  >
                                                    <Minus className="h-2 w-2" />
                                                  </Button>
                                                  <Input
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    value={formData.serviceQuantities[svc.id] || 1}
                                                    onChange={(e) => handleServiceQuantityChange(svc.id, parseInt(e.target.value) || 1)}
                                                    onFocus={(e) => e.target.select()}
                                                    className="w-8 h-6 text-xs text-center border-0 focus:ring-0 focus:border-0"
                                                  />
                                                  <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 hover:bg-[#FCA311]/10"
                                                    onClick={() => incrementQuantity(svc.id)}
                                                    disabled={formData.serviceQuantities[svc.id] >= 10}
                                                  >
                                                    <Plus className="h-2 w-2" />
                                                  </Button>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                                {getSelectedServices().length > 0 && (
                                  <div className="mt-3 p-3 bg-gradient-to-r from-[#FCA311]/10 to-[#FCA311]/20 rounded-lg border border-[#FCA311]/30">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <p className="text-xs font-semibold text-[#14213D]">Total:</p>
                                        <p className="text-xs text-[#000000]">
                                          {getTotalServiceCount()} service{getTotalServiceCount() !== 1 ? 's' : ''}
                                        </p>
                                      </div>
                                      <p className="text-lg font-bold text-[#FCA311]">${getCurrentTotal()}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div>
                                <Label htmlFor={`desktop-message-${index}`}>Additional Details</Label>
                                <Textarea
                                  id={`desktop-message-${index}`}
                                  value={formData.message}
                                  onChange={(e) => handleInputChange("message", e.target.value)}
                                  placeholder="Tell us about your project needs..."
                                  rows={3}
                                />
                              </div>
                              {showQuote && calculatedQuote !== null ? (
                                <div className="bg-gradient-to-r from-[#FCA311] to-[#FCA311]/80 rounded-xl p-4 text-center text-[#14213D]">
                                  <h3 className="text-lg font-bold mb-1">Your Quote</h3>
                                  <div className="text-2xl font-bold mb-1">${calculatedQuote}</div>
                                  <p className="text-xs opacity-90">
                                    {getTotalServiceCount()} total service{getTotalServiceCount() !== 1 ? 's' : ''} selected
                                  </p>
                                  <Button 
                                    type="button"
                                    onClick={() => {
                                      setShowQuote(false);
                                      setCalculatedQuote(null);
                                    }}
                                    className="mt-2 bg-[#14213D]/20 hover:bg-[#14213D]/30 text-[#14213D] border border-[#14213D]/30 text-xs py-1"
                                  >
                                    Edit Services
                                  </Button>
                                </div>
                              ) : (
                                <Button 
                                  type="submit" 
                                  disabled={getSelectedServices().length === 0}
                                  className="w-full bg-[#FCA311] hover:bg-[#FCA311]/80 disabled:opacity-50"
                                >
                                  Calculate Quote
                                </Button>
                              )}
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Mobile Stacked Cards */}
          <div className="lg:hidden space-y-8">
            {topServices.map((service, index) => {
              return (
                <Card key={index} className="bg-white border-0 shadow-xl rounded-2xl overflow-hidden">
                  <CardContent className="p-8 text-center">
                    <div className="bg-gray-50 rounded-2xl mb-6 shadow-inner mx-auto w-20 h-20 overflow-hidden">
                      <Image
                        src={service.image}
                        alt={service.title}
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                        quality={100}
                        style={{objectPosition: 'center'}}
                      />
                    </div>
                    <h2 className="text-xl font-bold text-[#FCA311] mb-4 uppercase tracking-wide">
                      {service.title}
                    </h2>
                    <h3 className="text-2xl font-bold text-[#14213D] mb-4 leading-tight">
                      {service.headline}
                    </h3>
                    <p className="text-base text-[#000000] mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    <div className="flex flex-col items-center gap-4">
                      <div className="text-3xl font-bold text-[#FCA311]">{service.price}</div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-[#FCA311] hover:bg-[#FCA311]/80 text-[#14213D] px-8 py-3 rounded-xl font-semibold w-full">
                            Book Service
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl bg-gradient-to-br from-[#E5E5E5] to-white border-0 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader className="text-center pb-4">
                            <DialogTitle className="text-2xl font-bold text-[#14213D] mb-2">Schedule Your {service.title}</DialogTitle>
                            <p className="text-[#000000] text-base">Professional installation with transparent flat-rate pricing</p>
                          </DialogHeader>
                          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                            <div>
                              <Label htmlFor={`mobile-name-${index}`}>Full Name</Label>
                              <Input
                                id={`mobile-name-${index}`}
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor={`mobile-email-${index}`}>Email</Label>
                              <Input
                                id={`mobile-email-${index}`}
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor={`mobile-phone-${index}`}>Phone Number</Label>
                              <Input
                                id={`mobile-phone-${index}`}
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor={`mobile-address-${index}`}>Service Address</Label>
                              <AddressAutocomplete
                                id={`mobile-address-${index}`}
                                value={formData.address}
                                onChange={(value) => handleInputChange("address", value)}
                                onPlaceSelected={setPlaceDetails}
                                placeholder="Street address in Spring Hill, Thompson's Station, or Columbia TN"
                                required
                              />
                            </div>
                            <div>
                              <Label className="text-[#14213D] font-semibold">Services Needed</Label>
                              <div className="mt-2 max-h-32 overflow-y-auto border border-[#FCA311]/30 rounded-md p-3 bg-white">
                                {loading ? (
                                  <div className="text-center py-2 text-[#14213D] text-xs">Loading...</div>
                                ) : error ? (
                                  <div className="text-center py-2 text-red-600 text-xs">Error</div>
                                ) : categories.map(category => (
                                  <div key={category} className="mb-3">
                                    <h4 className="font-semibold text-[#14213D] text-xs mb-1">{category}</h4>
                                    {servicesByCategory[category]?.map(svc => (
                                      <div key={svc.id} className="mb-1">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-2 flex-1">
                                            <Checkbox
                                              id={`mobile-${index}-${svc.id}`}
                                              checked={svc.id in formData.serviceQuantities}
                                              onCheckedChange={(checked) => handleServiceToggle(svc.id, checked as boolean)}
                                              className="border-[#FCA311]/30"
                                            />
                                            <Label 
                                              htmlFor={`mobile-${index}-${svc.id}`}
                                              className="text-xs text-[#000000] font-medium cursor-pointer"
                                            >
                                              {svc.name}
                                            </Label>
                                          </div>
                                          {svc.id in formData.serviceQuantities && (
                                            <div className="flex items-center space-x-1">
                                              <Label className="text-xs text-[#000000]">Qty:</Label>
                                              <div className="flex items-center border border-[#FCA311]/30 rounded-md">
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-6 w-6 p-0 hover:bg-[#FCA311]/10"
                                                  onClick={() => decrementQuantity(svc.id)}
                                                  disabled={formData.serviceQuantities[svc.id] <= 1}
                                                >
                                                  <Minus className="h-2 w-2" />
                                                </Button>
                                                <Input
                                                  type="number"
                                                  min="1"
                                                  max="10"
                                                  value={formData.serviceQuantities[svc.id] || 1}
                                                  onChange={(e) => handleServiceQuantityChange(svc.id, parseInt(e.target.value) || 1)}
                                                  onFocus={(e) => e.target.select()}
                                                  className="w-8 h-6 text-xs text-center border-0 focus:ring-0 focus:border-0"
                                                />
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-6 w-6 p-0 hover:bg-[#FCA311]/10"
                                                  onClick={() => incrementQuantity(svc.id)}
                                                  disabled={formData.serviceQuantities[svc.id] >= 10}
                                                >
                                                  <Plus className="h-2 w-2" />
                                                </Button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                              {getSelectedServices().length > 0 && (
                                <div className="mt-3 p-3 bg-gradient-to-r from-[#FCA311]/10 to-[#FCA311]/20 rounded-lg border border-[#FCA311]/30">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="text-xs font-semibold text-[#14213D]">Total:</p>
                                      <p className="text-xs text-[#000000]">
                                        {getTotalServiceCount()} service{getTotalServiceCount() !== 1 ? 's' : ''}
                                      </p>
                                    </div>
                                    <p className="text-lg font-bold text-[#FCA311]">${getCurrentTotal()}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div>
                              <Label htmlFor={`mobile-message-${index}`}>Additional Details</Label>
                              <Textarea
                                id={`mobile-message-${index}`}
                                value={formData.message}
                                onChange={(e) => handleInputChange("message", e.target.value)}
                                placeholder="Tell us about your project needs..."
                                rows={3}
                              />
                            </div>
                            {showQuote && calculatedQuote !== null ? (
                              <div className="bg-gradient-to-r from-[#FCA311] to-[#FCA311]/80 rounded-xl p-4 text-center text-[#14213D]">
                                <h3 className="text-lg font-bold mb-1">Your Quote</h3>
                                <div className="text-2xl font-bold mb-1">${calculatedQuote}</div>
                                <p className="text-xs opacity-90">
                                  {getTotalServiceCount()} total service{getTotalServiceCount() !== 1 ? 's' : ''} selected
                                </p>
                                <Button 
                                  type="button"
                                  onClick={() => {
                                    setShowQuote(false);
                                    setCalculatedQuote(null);
                                  }}
                                  className="mt-2 bg-[#14213D]/20 hover:bg-[#14213D]/30 text-[#14213D] border border-[#14213D]/30 text-xs py-1"
                                >
                                  Edit Services
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                type="submit" 
                                disabled={getSelectedServices().length === 0}
                                className="w-full bg-[#FCA311] hover:bg-[#FCA311]/80 disabled:opacity-50"
                              >
                                Calculate Quote
                              </Button>
                            )}
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bundle CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#FCA311] to-[#FCA311]/80">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Bundle & Save Up to 20%
            </h2>
            <p className="text-xl text-white/90 mb-6">
              Save 10% on 3+ services or 20% on 5+ services while upgrading your entire home.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-white text-[#FCA311] hover:bg-white/90 px-10 py-4 text-lg font-semibold rounded-xl">
                  Book Bundle Service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl bg-gradient-to-br from-[#E5E5E5] to-white border-0 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="text-center pb-4">
                  <DialogTitle className="text-2xl font-bold text-[#14213D] mb-2">Bundle Services & Save Up to 20%</DialogTitle>
                  <p className="text-[#000000] text-base">Professional installation with transparent flat-rate pricing</p>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                  <div>
                    <Label htmlFor="bundle-name">Full Name</Label>
                    <Input
                      id="bundle-name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="bundle-email">Email</Label>
                    <Input
                      id="bundle-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="bundle-phone">Phone Number</Label>
                    <Input
                      id="bundle-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="bundle-address">Service Address</Label>
                    <AddressAutocomplete
                      id="bundle-address"
                      value={formData.address}
                      onChange={(value) => handleInputChange("address", value)}
                      onPlaceSelected={setPlaceDetails}
                      placeholder="Street address in Spring Hill, Thompson's Station, or Columbia TN"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-[#14213D] font-semibold">Services to Bundle (Need 3+ total services for 10% discount)</Label>
                    <div className="mt-2 max-h-48 overflow-y-auto border border-[#FCA311]/30 rounded-md p-4 bg-white">
                      {loading ? (
                        <div className="text-center py-4 text-[#14213D]">Loading services...</div>
                      ) : error ? (
                        <div className="text-center py-4 text-red-600">Error loading services</div>
                      ) : categories.map(category => (
                        <div key={category} className="mb-4">
                          <h4 className="font-semibold text-[#14213D] text-sm mb-2">{category}</h4>
                          {servicesByCategory[category]?.map(service => (
                            <div key={service.id} className="py-2 px-3 rounded-lg hover:bg-[#FCA311]/10 mb-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1">
                                  <Checkbox
                                    id={`bundle-${service.id}`}
                                    checked={service.id in formData.serviceQuantities}
                                    onCheckedChange={(checked) => handleServiceToggle(service.id, checked as boolean)}
                                    className="border-[#FCA311]/30"
                                  />
                                  <Label 
                                    htmlFor={`bundle-${service.id}`}
                                    className="text-sm text-[#14213D] font-medium cursor-pointer"
                                  >
                                    {service.name}
                                  </Label>
                                </div>
                                {service.id in formData.serviceQuantities && (
                                  <div className="flex items-center space-x-2">
                                    <Label className="text-xs text-[#14213D]">Qty:</Label>
                                    <div className="flex items-center border border-[#FCA311]/30 rounded-md">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 hover:bg-[#FCA311]/10"
                                        onClick={() => decrementQuantity(service.id)}
                                        disabled={formData.serviceQuantities[service.id] <= 1}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <Input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={formData.serviceQuantities[service.id] || 1}
                                        onChange={(e) => handleServiceQuantityChange(service.id, parseInt(e.target.value) || 1)}
                                        onFocus={(e) => e.target.select()}
                                        className="w-12 h-8 text-center border-0 focus:ring-0 focus:border-0"
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 hover:bg-[#FCA311]/10"
                                        onClick={() => incrementQuantity(service.id)}
                                        disabled={formData.serviceQuantities[service.id] >= 10}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    {getSelectedServices().length > 0 && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-[#FCA311]/10 to-[#FCA311]/20 rounded-xl border border-[#FCA311]/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-semibold text-[#14213D]">Bundle Total:</p>
                            <p className="text-xs text-[#14213D]">
                              {getTotalServiceCount()} service{getTotalServiceCount() !== 1 ? 's' : ''}
                              {getTotalServiceCount() >= 3 ? " • 10% Bundle Discount Applied!" : " • Need 3+ for 10% off"}
                            </p>
                          </div>
                          <div className="text-right">
                            {getTotalServiceCount() >= 3 && getCurrentTotal() !== getCurrentTotalWithDiscount() ? (
                              <div>
                                <p className="text-sm text-[#14213D] line-through">${getCurrentTotal()}</p>
                                <p className="text-2xl font-bold text-[#FCA311]">${getCurrentTotalWithDiscount()}</p>
                              </div>
                            ) : (
                              <p className="text-2xl font-bold text-[#FCA311]">${getCurrentTotal()}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="bundle-message">Additional Details</Label>
                    <Textarea
                      id="bundle-message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Tell us more about your project..."
                      rows={3}
                    />
                  </div>
                  {showQuote && calculatedQuote !== null ? (
                    <div className="bg-gradient-to-r from-[#FCA311] to-[#FCA311]/80 rounded-xl p-6 text-center text-[#14213D] mb-4">
                      <h3 className="text-2xl font-bold mb-2">Your Bundle Quote</h3>
                      <div className="text-4xl font-bold mb-2">
                        ${getTotalServiceCount() >= 3 ? Math.round(calculatedQuote * 0.9) : calculatedQuote}
                      </div>
                      {getTotalServiceCount() >= 3 && (
                        <div className="text-sm opacity-90 mb-2">
                          <span className="line-through">${calculatedQuote}</span> • 10% Bundle Discount Applied!
                        </div>
                      )}
                      <p className="text-sm opacity-90">
                        {getTotalServiceCount()} total service{getTotalServiceCount() !== 1 ? 's' : ''} • {getSelectedServices().length} service type{getSelectedServices().length !== 1 ? 's' : ''} selected
                        {getTotalServiceCount() >= 3 ? ' • Bundle Discount Applied!' : ' • Need 3+ total services for 10% off'}
                      </p>
                      <p className="text-sm opacity-90 mt-1">
                        No hidden fees • Flat-rate pricing • Same-day response
                      </p>
                      <Button 
                        type="button"
                        onClick={() => {
                          setShowQuote(false);
                          setCalculatedQuote(null);
                        }}
                        className="mt-3 bg-[#14213D]/20 hover:bg-[#14213D]/30 text-[#14213D] border border-[#14213D]/30"
                      >
                        Edit Services
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={getSelectedServices().length === 0}
                      className="w-full bg-[#FCA311] hover:bg-[#FCA311]/80 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {getTotalServiceCount() >= 3 ? 'Calculate Bundle Quote (10% Off!)' : 'Calculate Quote'}
                    </Button>
                  )}
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 bg-[#E5E5E5] relative overflow-hidden">
        <div className="absolute top-4 right-4 opacity-5 pointer-events-none">
          <Image
            src="/ceiling-fan-Installation.png"
            alt=""
            width={200}
            height={200}
            className="w-48 h-48 object-contain"
          />
        </div>
        <div className="container mx-auto max-w-4xl px-4 text-center relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#14213D] mb-6">
            We Also Handle
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[#000000] font-medium">
            <div>Cabinet Hardware</div>
            <div>Safety Updates</div>
            <div>Smoke Detectors</div>
            <div>Motion Sensors</div>
            <div>Quick Fixes</div>
            <div>Smart Switches</div>
            <div>GFCI Outlets</div>
            <div>TV Mounting</div>
          </div>
          <p className="text-lg text-[#000000] mt-8 max-w-2xl mx-auto">
            From quick 30-minute fixes to full home upgrades — if it involves fixtures, switches, or hardware, we&apos;ve got you covered.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[#E5E5E5]">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#14213D] mb-8">
              Frequently Asked Questions
            </h2>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Are you licensed electricians?</AccordionTrigger>
              <AccordionContent>
                We specialize in fixture installations and hardware that don&apos;t require a licensed electrician. For complex electrical work, we work with licensed partners to ensure safety and code compliance.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>How do your flat rates work?</AccordionTrigger>
              <AccordionContent>
                Our flat-rate pricing means you know exactly what you&apos;ll pay before we start. No surprises, no hourly rates, and no upsells. The price we quote is the price you pay.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>How quickly can you schedule service?</AccordionTrigger>
              <AccordionContent>
                Unlike traditional contractors, we offer flexible scheduling with same-week appointments in most cases. No waiting weeks for a simple fixture installation.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger>Do you provide the fixtures and hardware?</AccordionTrigger>
              <AccordionContent>
                You provide the fixtures and hardware you want installed. We bring all the tools, expertise, and installation materials needed to get the job done right.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-[#14213D] via-[#000000] to-[#14213D] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto max-w-4xl px-4 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-10 text-white/90 leading-relaxed">
            Join hundreds of satisfied customers across Middle Tennessee
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" variant="secondary" className="px-10 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 bg-[#FCA311] hover:bg-[#FCA311]/80 text-white border-0">
                  <Phone className="mr-2 h-5 w-5" />
                  Schedule Service Now
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Schedule Your Service</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name2">Full Name</Label>
                    <Input
                      id="name2"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email2">Email</Label>
                    <Input
                      id="email2"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone2">Phone Number</Label>
                    <Input
                      id="phone2"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-[#14213D] font-semibold">Services Needed (Select All That Apply)</Label>
                    <div className="mt-2 max-h-48 overflow-y-auto border border-[#FCA311]/30 rounded-md p-4 bg-white">
                      {loading ? (
                        <div className="text-center py-4 text-[#14213D]">Loading services...</div>
                      ) : error ? (
                        <div className="text-center py-4 text-red-600">Error loading services</div>
                      ) : categories.map(category => (
                        <div key={category} className="mb-4">
                          <h4 className="font-semibold text-[#14213D] text-sm mb-2">{category}</h4>
                          {servicesByCategory[category]?.map(service => (
                            <div key={service.id} className="py-2 px-3 rounded-lg hover:bg-[#FCA311]/10 mb-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1">
                                  <Checkbox
                                    id={`footer-${service.id}`}
                                    checked={service.id in formData.serviceQuantities}
                                    onCheckedChange={(checked) => handleServiceToggle(service.id, checked as boolean)}
                                    className="border-[#FCA311]/30"
                                  />
                                  <Label 
                                    htmlFor={`footer-${service.id}`}
                                    className="text-sm text-[#14213D] font-medium cursor-pointer"
                                  >
                                    {service.name}
                                  </Label>
                                </div>
                                {service.id in formData.serviceQuantities && (
                                  <div className="flex items-center space-x-2">
                                    <Label className="text-xs text-[#14213D]">Qty:</Label>
                                    <div className="flex items-center border border-[#FCA311]/30 rounded-md">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 hover:bg-[#FCA311]/10"
                                        onClick={() => decrementQuantity(service.id)}
                                        disabled={formData.serviceQuantities[service.id] <= 1}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <Input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={formData.serviceQuantities[service.id] || 1}
                                        onChange={(e) => handleServiceQuantityChange(service.id, parseInt(e.target.value) || 1)}
                                        onFocus={(e) => e.target.select()}
                                        className="w-12 h-8 text-center border-0 focus:ring-0 focus:border-0"
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 hover:bg-[#FCA311]/10"
                                        onClick={() => incrementQuantity(service.id)}
                                        disabled={formData.serviceQuantities[service.id] >= 10}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    {getSelectedServices().length > 0 && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-[#FCA311]/10 to-[#FCA311]/20 rounded-xl border border-[#FCA311]/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-semibold text-[#14213D]">Current Total:</p>
                            <p className="text-xs text-[#14213D]">
                              {getTotalServiceCount()} service{getTotalServiceCount() !== 1 ? 's' : ''}
                              {getTotalServiceCount() >= 3 && " • Bundle discount applied!"}
                            </p>
                          </div>
                          <div className="text-right">
                            {getTotalServiceCount() >= 3 && getCurrentTotal() !== getCurrentTotalWithDiscount() ? (
                              <div>
                                <p className="text-sm text-[#14213D] line-through">${getCurrentTotal()}</p>
                                <p className="text-2xl font-bold text-[#FCA311]">${getCurrentTotalWithDiscount()}</p>
                              </div>
                            ) : (
                              <p className="text-2xl font-bold text-[#FCA311]">${getCurrentTotal()}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="address2">Service Address</Label>
                    <AddressAutocomplete
                      id="address2"
                      value={formData.address}
                      onChange={(value) => handleInputChange("address", value)}
                      onPlaceSelected={setPlaceDetails}
                      placeholder="Street address in Spring Hill, Thompson's Station, or Columbia TN"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="message2">Additional Details</Label>
                    <Textarea
                      id="message2"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Tell us more about your project..."
                      rows={3}
                    />
                  </div>
                  {showQuote && calculatedQuote !== null ? (
                    <div className="bg-gradient-to-r from-[#FCA311] to-[#FCA311]/80 rounded-xl p-6 text-center text-[#14213D] mb-4">
                      <h3 className="text-2xl font-bold mb-2">Your Quote</h3>
                      <div className="text-4xl font-bold mb-2">${calculatedQuote}</div>
                      <p className="text-sm opacity-90">
                        {getTotalServiceCount()} total service{getTotalServiceCount() !== 1 ? 's' : ''} • {getSelectedServices().length} service type{getSelectedServices().length !== 1 ? 's' : ''} selected
                      </p>
                      <p className="text-sm opacity-90 mt-1">
                        No hidden fees • Flat-rate pricing • Same-day response
                      </p>
                      <Button 
                        type="button"
                        onClick={() => {
                          setShowQuote(false);
                          setCalculatedQuote(null);
                        }}
                        className="mt-3 bg-[#14213D]/20 hover:bg-[#14213D]/30 text-[#14213D] border border-[#14213D]/30"
                      >
                        Edit Services
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={getSelectedServices().length === 0}
                      className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Calculate Quote
                    </Button>
                  )}
                </form>
              </DialogContent>
            </Dialog>
            
            <Button size="lg" variant="outline" className="px-10 py-4 text-lg font-semibold rounded-xl border-2 border-[#FCA311]/50 text-[#FCA311] hover:bg-[#FCA311]/10 backdrop-blur-sm" asChild>
              <a href="mailto:brent@stewartservicestn.com">
                <Mail className="mr-2 h-5 w-5" />
                Email Us
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#14213D] text-white py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="mb-4">
                <Image
                  src="/icon_w_name.svg"
                  alt="Stewart Services Logo"
                  width={200}
                  height={60}
                  className="w-auto h-12 filter brightness-0 invert"
                />
              </div>
              <p className="text-[#E5E5E5]/70 leading-relaxed">
                Professional fixture installation services across Middle Tennessee.
              </p>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-4">Service Areas</h4>
              <ul className="text-[#E5E5E5]/70 space-y-2">
                {serviceAreas.map((area, index) => (
                  <li key={index}>{area}, TN</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-4">Contact</h4>
              <div className="text-[#E5E5E5]/70 space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>(815) 577-6393</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>brent@stewartservicestn.com</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-[#14213D] mt-12 pt-8 text-center text-[#E5E5E5]/70">
            <p>&copy; 2024 STEWART SERVICES. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}