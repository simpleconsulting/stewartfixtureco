"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { createLeadFromQuote, updateLeadBookingRequest } from "@/lib/database";
import { createClient } from "@/lib/supabase/client";
import type { PlaceDetails } from "@/lib/places-api";
import { useUTMTracking } from "@/lib/utm";

const topServices = [
  {
    title: "Ceiling Fan Installation",
    headline: "Need a Ceiling Fan Installed? We'll Have it Spinning Today.",
    price: "$200",
    description: "Professional installation at any height for safety and comfort.",
    image: "/ceiling-fan-Installation.png",
    iconColor: "from-[#FCA311] to-[#000000]"
  },
  {
    title: "Device Installation",
    headline: "Upgrade Your Home with Modern, Safe Device Installation.",
    price: "$75",
    description: "Switches, outlets, dimmers, and USB ports installed professionally.",
    image: "/how-to-wire-and-install-single-pole-switches-1152330-03-6b86b53fbb3842d8873aa95868eb5093.png",
    iconColor: "from-[#14213D] to-[#FCA311]"
  },
  {
    title: "Light Fixture Swaps",
    headline: "Refresh Any Room with a Fast, Professional Light Fixture Swap.",
    price: "Starting at $150",
    description: "Transform your space with vanity lights, pendants, and chandeliers.",
    image: "/pendant-light.png",
    iconColor: "from-[#000000] to-[#FCA311]"
  }
];

const serviceAreas = ["Spring Hill", "Franklin", "Thompson's Station", "Columbia"];

// This will be replaced by the hook in the component

export default function Home() {
  const router = useRouter();
  
  // Check if user is authenticated and redirect to dashboard
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && user.email?.toLowerCase().endsWith('@stewartservicestn.com')) {
        router.push('/dashboard');
        return;
      }
    };
    
    checkAuthAndRedirect();
  }, [router]);
  
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
  const [serviceRequested, setServiceRequested] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [isUpdatingLead, setIsUpdatingLead] = useState(false);

  // Single modal state for all quote/booking buttons
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Get Your Free Quote");

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limitedDigits = digits.slice(0, 10);
    
    // Format as (XXX) XXX-XXXX
    if (limitedDigits.length >= 6) {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
    } else if (limitedDigits.length >= 3) {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
    } else if (limitedDigits.length > 0) {
      return `(${limitedDigits}`;
    }
    return '';
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    if (field === 'phone' && typeof value === 'string') {
      const formattedPhone = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, [field]: formattedPhone }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
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
            setLeadId(leadResult.leadId); // Store the lead ID for later use
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

  const handleRequestService = async () => {
    if (!leadId) {
      console.error("No lead ID available");
      return;
    }

    setIsUpdatingLead(true);
    try {
      const supabase = createClient();
      const { error } = await updateLeadBookingRequest(supabase, leadId, true);
      
      if (error) {
        console.error("Error updating lead:", error);
      } else {
        console.log("✅ Lead updated with service request");
        setServiceRequested(true);
      }
    } catch (error) {
      console.error("Unexpected error updating lead:", error);
    } finally {
      setIsUpdatingLead(false);
    }
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
                <Dialog open={quoteModalOpen} onOpenChange={setQuoteModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-[#FCA311] hover:bg-[#FCA311]/80 text-[#14213D] px-10 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
                      Free Instant Quote
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl bg-gradient-to-br from-[#E5E5E5] to-white border-0 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="text-center pb-4">
                      <DialogTitle className="text-2xl font-bold text-[#14213D] mb-2">{modalTitle}</DialogTitle>
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
                          pattern="\([0-9]{3}\) [0-9]{3}-[0-9]{4}"
                          title="Please enter a 10-digit phone number"
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
                        serviceRequested ? (
                          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-center text-white mb-4">
                            <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                            <p className="text-lg mb-2">Someone will reach out to you shortly</p>
                            <p className="text-sm opacity-90">
                              Your quote: ${calculatedQuote} • {getTotalServiceCount()} service{getTotalServiceCount() !== 1 ? 's' : ''}
                            </p>
                            <Button 
                              type="button"
                              onClick={() => {
                                setShowQuote(false);
                                setCalculatedQuote(null);
                                setServiceRequested(false);
                                setLeadId(null);
                                setFormData({
                                  name: "",
                                  email: "",
                                  phone: "",
                                  serviceQuantities: {},
                                  address: "",
                                  message: "",
                                  discountCode: ""
                                });
                              }}
                              className="mt-3 bg-white/20 hover:bg-white/30 text-white border border-white/30"
                            >
                              Start New Quote
                            </Button>
                          </div>
                        ) : (
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
                            <div className="flex gap-2 mt-3">
                              <Button 
                                type="button"
                                onClick={() => {
                                  setShowQuote(false);
                                  setCalculatedQuote(null);
                                }}
                                variant="outline"
                                className="flex-1 bg-[#14213D]/20 hover:bg-[#14213D]/30 text-[#14213D] border border-[#14213D]/30"
                              >
                                Edit Services
                              </Button>
                              <Button 
                                type="button"
                                onClick={handleRequestService}
                                disabled={isUpdatingLead || !leadId}
                                className="flex-1 bg-[#14213D] hover:bg-[#14213D]/80 text-white"
                              >
                                {isUpdatingLead ? "Requesting..." : "Request Service"}
                              </Button>
                            </div>
                          </div>
                        )
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
                        {getSelectedServices().length === 0 ? "Please select at least one service" : "Same-day response • Serving Middle TN"}
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
                      <Button
                        className="bg-[#FCA311] hover:bg-[#FCA311]/80 text-[#14213D] px-8 py-3 rounded-xl font-semibold"
                        onClick={() => {
                          setModalTitle("Get Your Free Quote");
                          setQuoteModalOpen(true);
                        }}
                      >
                        <Phone className="mr-2 h-5 w-5" />
                        Book Service
                      </Button>
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
                    <span className="text-white font-medium text-lg">Flexible scheduling</span>
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
                        <Button
                          className="bg-[#FCA311] hover:bg-[#FCA311]/80 text-[#14213D] px-8 py-3 rounded-xl font-semibold w-full"
                          onClick={() => {
                            setModalTitle(`Schedule Your ${service.title}`);
                            setQuoteModalOpen(true);
                          }}
                        >
                          Book Service
                        </Button>
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
                      <Button
                        className="bg-[#FCA311] hover:bg-[#FCA311]/80 text-[#14213D] px-8 py-3 rounded-xl font-semibold w-full"
                        onClick={() => {
                          setModalTitle(`Schedule Your ${service.title}`);
                          setQuoteModalOpen(true);
                        }}
                      >
                        Book Service
                      </Button>
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
            <Button
              size="lg"
              className="bg-white text-[#FCA311] hover:bg-white/90 px-10 py-4 text-lg font-semibold rounded-xl"
              onClick={() => {
                setModalTitle("Bundle Services & Save Up to 20%");
                setQuoteModalOpen(true);
              }}
            >
              Book Bundle Service
            </Button>
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20 bg-[#E5E5E5]">
        <div className="container mx-auto max-w-5xl px-4">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#14213D] mb-12 text-center">
            We Also Handle
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-[#FCA311]/20 hover:shadow-md transition-shadow">
              <p className="text-lg font-semibold text-[#14213D]">Cabinet Hardware</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-[#FCA311]/20 hover:shadow-md transition-shadow">
              <p className="text-lg font-semibold text-[#14213D]">Smoke Detectors</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-[#FCA311]/20 hover:shadow-md transition-shadow">
              <p className="text-lg font-semibold text-[#14213D]">Motion Sensors</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-[#FCA311]/20 hover:shadow-md transition-shadow">
              <p className="text-lg font-semibold text-[#14213D]">Quick Fixes</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-[#FCA311]/20 hover:shadow-md transition-shadow">
              <p className="text-lg font-semibold text-[#14213D]">Smart Switches</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-[#FCA311]/20 hover:shadow-md transition-shadow">
              <p className="text-lg font-semibold text-[#14213D]">GFCI Outlets</p>
            </div>
          </div>
          <p className="text-xl text-[#14213D] text-center max-w-3xl mx-auto leading-relaxed">
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
            <Button
              size="lg"
              variant="secondary"
              className="px-10 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 bg-[#FCA311] hover:bg-[#FCA311]/80 text-white border-0"
              onClick={() => {
                setModalTitle("Schedule Your Service");
                setQuoteModalOpen(true);
              }}
            >
              <Phone className="mr-2 h-5 w-5" />
              Schedule Service Now
            </Button>
            
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