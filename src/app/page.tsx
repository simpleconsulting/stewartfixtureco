"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, MapPin, Phone, Mail, Star, Award, Users, Shield, Fan, Lightbulb, Settings } from "lucide-react";
import { pricingMatrix, calculateTotal, getAllCategories, getServicesByCategory } from "@/data/pricing";

const topServices = [
  {
    title: "Ceiling Fan Installation",
    headline: "Need a Ceiling Fan Installed? We'll Have it Spinning Today.",
    price: "$200",
    description: "Professional installation at any height. No risk, no hassle, just cool comfort.",
    icon: Fan,
    iconColor: "from-[#BC6C25] to-[#DDA15E]"
  },
  {
    title: "Light Fixture & Pendant Swaps", 
    headline: "Refresh Any Room with a Fast, Professional Light Fixture Swap.",
    price: "Starting at $150",
    description: "Transform your space instantly. From vanity lights to chandeliers, we do it all.",
    icon: Lightbulb,
    iconColor: "from-[#DDA15E] to-[#BC6C25]"
  },
  {
    title: "Switches & Outlet Upgrades",
    headline: "Modernize Your Home with New Switches, Dimmers & Outlets.",
    price: "Starting at $125", 
    description: "GFCI outlets, USB ports, smart switches, and dimmer installations for safety and convenience.",
    icon: Settings,
    iconColor: "from-[#606C38] to-[#283618]"
  }
];

const serviceAreas = ["Spring Hill", "Thompson's Station", "Columbia"];

const allServices = pricingMatrix;

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceQuantities: {} as Record<string, number>,
    address: "",
    message: ""
  });
  
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
  
  const getSelectedServices = () => {
    return Object.keys(formData.serviceQuantities);
  };
  
  const getTotalServiceCount = () => {
    return Object.values(formData.serviceQuantities).reduce((sum, qty) => sum + qty, 0);
  };
  
  const getCurrentTotal = () => {
    return calculateTotal(formData.serviceQuantities);
  };
  
  const getCurrentTotalWithDiscount = () => {
    const total = getCurrentTotal();
    const serviceCount = getTotalServiceCount();
    return serviceCount >= 3 ? Math.round(total * 0.9) : total;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quote = calculateTotal(formData.serviceQuantities);
    setCalculatedQuote(quote);
    setShowQuote(true);
    console.log("Form submitted:", formData, "Quote:", quote);
  };

  return (
    <div className="min-h-screen bg-[#FEFAE0]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#283618] via-[#606C38] to-[#283618] py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left relative z-10">
              <div className="mb-8">
                <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight tracking-wider mb-4">
                  STEWART FIXTURE CO.
                </h1>
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <div className="flex text-[#DDA15E]">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                  </div>
                  <span className="text-white/90 text-lg font-medium">5-Star Local Service</span>
                </div>
              </div>
              
              <p className="text-2xl lg:text-3xl text-[#DDA15E] font-semibold mb-6 tracking-wide">
                &ldquo;Fixtures. Fans. Finishes. Installed Right.&rdquo;
              </p>
              
              <p className="text-lg lg:text-xl text-white/90 mb-10 max-w-2xl leading-relaxed">
                Professional, on-time installation of light fixtures, ceiling fans, switches, outlets, and home hardware — delivering clean, trusted, local service without the hassle or price tag of a licensed contractor.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-[#BC6C25] hover:bg-[#DDA15E] text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
                      <Phone className="mr-2 h-5 w-5" />
                      Get Free Quote
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl bg-gradient-to-br from-[#FEFAE0] to-white border-0 rounded-2xl shadow-2xl">
                    <DialogHeader className="text-center pb-4">
                      <DialogTitle className="text-2xl font-bold text-[#283618] mb-2">Get Your Free Quote</DialogTitle>
                      <p className="text-[#606C38] text-base">Professional installation with transparent flat-rate pricing</p>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                      <div>
                        <Label htmlFor="name" className="text-[#283618] font-semibold">Full Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          className="border-[#DDA15E]/30 focus:border-[#BC6C25] focus:ring-[#BC6C25]/20 mt-1"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-[#283618] font-semibold">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="border-[#DDA15E]/30 focus:border-[#BC6C25] focus:ring-[#BC6C25]/20 mt-1"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-[#283618] font-semibold">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="border-[#DDA15E]/30 focus:border-[#BC6C25] focus:ring-[#BC6C25]/20 mt-1"
                          placeholder="(815) 555-0123"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-[#283618] font-semibold">Services Needed</Label>
                        <div className="mt-2 max-h-64 overflow-y-auto border border-[#DDA15E]/30 rounded-md p-4 bg-white">
                          {getAllCategories().map(category => (
                            <div key={category} className="mb-6">
                              <h4 className="font-semibold text-[#606C38] text-sm mb-3">{category}</h4>
                              {getServicesByCategory(category).map(service => (
                                <div key={service.id} className="py-2 px-3 rounded-lg hover:bg-[#DDA15E]/10 mb-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 flex-1">
                                      <Checkbox
                                        id={service.id}
                                        checked={service.id in formData.serviceQuantities}
                                        onCheckedChange={(checked) => handleServiceToggle(service.id, checked as boolean)}
                                        className="border-[#DDA15E]/30"
                                      />
                                      <Label 
                                        htmlFor={service.id}
                                        className="text-sm text-[#606C38] font-medium cursor-pointer"
                                      >
                                        {service.name}
                                      </Label>
                                    </div>
                                    {service.id in formData.serviceQuantities && (
                                      <div className="flex items-center space-x-2">
                                        <Label className="text-xs text-[#606C38]">Qty:</Label>
                                        <Input
                                          type="number"
                                          min="1"
                                          max="10"
                                          value={formData.serviceQuantities[service.id] || 1}
                                          onChange={(e) => handleServiceQuantityChange(service.id, parseInt(e.target.value) || 1)}
                                          className="w-16 h-8 text-center border-[#DDA15E]/30 focus:border-[#BC6C25]"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                        {getSelectedServices().length > 0 && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-[#BC6C25]/10 to-[#DDA15E]/10 rounded-xl border border-[#DDA15E]/30">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm font-semibold text-[#283618]">Current Total:</p>
                                <p className="text-xs text-[#606C38]">
                                  {getTotalServiceCount()} service{getTotalServiceCount() !== 1 ? 's' : ''}
                                  {getTotalServiceCount() >= 3 && " • Bundle discount applied!"}
                                </p>
                              </div>
                              <div className="text-right">
                                {getTotalServiceCount() >= 3 && getCurrentTotal() !== getCurrentTotalWithDiscount() ? (
                                  <div>
                                    <p className="text-sm text-[#606C38] line-through">${getCurrentTotal()}</p>
                                    <p className="text-2xl font-bold text-[#BC6C25]">${getCurrentTotalWithDiscount()}</p>
                                  </div>
                                ) : (
                                  <p className="text-2xl font-bold text-[#BC6C25]">${getCurrentTotal()}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="address" className="text-[#283618] font-semibold">Service Address</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          className="border-[#DDA15E]/30 focus:border-[#BC6C25] focus:ring-[#BC6C25]/20 mt-1"
                          placeholder="Street address in Spring Hill, Thompson's Station, or Columbia TN"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="message" className="text-[#283618] font-semibold">Additional Details</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => handleInputChange("message", e.target.value)}
                          className="border-[#DDA15E]/30 focus:border-[#BC6C25] focus:ring-[#BC6C25]/20 mt-1 resize-none"
                          placeholder="Tell us more about your project..."
                          rows={3}
                        />
                      </div>
                      {showQuote && calculatedQuote !== null ? (
                        <div className="bg-gradient-to-r from-[#BC6C25] to-[#DDA15E] rounded-xl p-6 text-center text-white mb-4">
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
                            className="mt-3 bg-white/20 hover:bg-white/30 text-white border border-white/30"
                          >
                            Edit Services
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          type="submit" 
                          disabled={getSelectedServices().length === 0}
                          className="w-full bg-[#BC6C25] hover:bg-[#DDA15E] text-white py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Calculate My Quote
                        </Button>
                      )}
                      <p className="text-center text-sm text-[#606C38] mt-3">
                        {getSelectedServices().length === 0 ? "Please select at least one service" : "No obligation • Same-day response • Serving Middle TN"}
                      </p>
                    </form>
                  </DialogContent>
                </Dialog>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="lg" className="px-10 py-4 text-lg font-semibold rounded-xl border-2 border-[#DDA15E]/50 text-[#DDA15E] hover:bg-[#DDA15E]/10 backdrop-blur-sm">
                      View Services
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl bg-gradient-to-br from-[#FEFAE0] to-white border-0 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="text-center pb-4">
                      <DialogTitle className="text-3xl font-bold text-[#283618] mb-2">Our Complete Service List</DialogTitle>
                      <p className="text-[#606C38] text-lg">Professional installation with transparent flat-rate pricing</p>
                    </DialogHeader>
                    <div className="grid gap-8 pt-4">
                      {Object.entries(
                        allServices.reduce((acc, service) => {
                          if (!acc[service.category]) {
                            acc[service.category] = [];
                          }
                          acc[service.category].push(service);
                          return acc;
                        }, {} as Record<string, typeof allServices>)
                      ).map(([category, services]) => (
                        <div key={category} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-[#DDA15E]/20">
                          <h3 className="text-xl font-bold text-[#283618] mb-4 border-b border-[#DDA15E]/30 pb-2">
                            {category}
                          </h3>
                          <div className="grid gap-3">
                            {services.map((service, index) => (
                              <div key={index} className="py-2 px-3 rounded-lg hover:bg-[#DDA15E]/10 transition-colors">
                                <div className="text-[#606C38] font-medium">{service.name}</div>
                                {service.description && (
                                  <div className="text-sm text-[#606C38]/70 mt-1">{service.description}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-[#DDA15E]/30 text-center">
                      <p className="text-[#606C38] mb-4">Ready to get started?</p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-[#BC6C25] hover:bg-[#DDA15E] text-white px-8 py-3 rounded-xl font-semibold">
                            <Phone className="mr-2 h-5 w-5" />
                            Get Free Quote
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl bg-gradient-to-br from-[#FEFAE0] to-white border-0 rounded-2xl shadow-2xl">
                          <DialogHeader className="text-center pb-4">
                            <DialogTitle className="text-2xl font-bold text-[#283618] mb-2">Get Your Free Quote</DialogTitle>
                            <p className="text-[#606C38] text-base">Professional installation with transparent flat-rate pricing</p>
                          </DialogHeader>
                          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="services-name" className="text-[#283618] font-semibold">Full Name</Label>
                                <Input
                                  id="services-name"
                                  value={formData.name}
                                  onChange={(e) => handleInputChange("name", e.target.value)}
                                  className="border-[#DDA15E]/30 focus:border-[#BC6C25] focus:ring-[#BC6C25]/20 mt-1"
                                  placeholder="Enter your full name"
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="services-email" className="text-[#283618] font-semibold">Email Address</Label>
                                <Input
                                  id="services-email"
                                  type="email"
                                  value={formData.email}
                                  onChange={(e) => handleInputChange("email", e.target.value)}
                                  className="border-[#DDA15E]/30 focus:border-[#BC6C25] focus:ring-[#BC6C25]/20 mt-1"
                                  placeholder="your@email.com"
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="services-phone" className="text-[#283618] font-semibold">Phone Number</Label>
                                <Input
                                  id="services-phone"
                                  type="tel"
                                  value={formData.phone}
                                  onChange={(e) => handleInputChange("phone", e.target.value)}
                                  className="border-[#DDA15E]/30 focus:border-[#BC6C25] focus:ring-[#BC6C25]/20 mt-1"
                                  placeholder="(815) 555-0123"
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="services-address" className="text-[#283618] font-semibold">Service Address</Label>
                                <Input
                                  id="services-address"
                                  value={formData.address}
                                  onChange={(e) => handleInputChange("address", e.target.value)}
                                  className="border-[#DDA15E]/30 focus:border-[#BC6C25] focus:ring-[#BC6C25]/20 mt-1"
                                  placeholder="Street address in Spring Hill, Thompson's Station, or Columbia TN"
                                  required
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-[#283618] font-semibold">Services Needed</Label>
                              <div className="mt-2 max-h-48 overflow-y-auto border border-[#DDA15E]/30 rounded-md p-4 bg-white">
                                {getAllCategories().map(category => (
                                  <div key={category} className="mb-4">
                                    <h4 className="font-semibold text-[#606C38] text-sm mb-2">{category}</h4>
                                    {getServicesByCategory(category).map(service => (
                                      <div key={service.id} className="py-2 px-3 rounded-lg hover:bg-[#DDA15E]/10 mb-1">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-3 flex-1">
                                            <Checkbox
                                              id={`services-${service.id}`}
                                              checked={service.id in formData.serviceQuantities}
                                              onCheckedChange={(checked) => handleServiceToggle(service.id, checked as boolean)}
                                              className="border-[#DDA15E]/30"
                                            />
                                            <Label 
                                              htmlFor={`services-${service.id}`}
                                              className="text-sm text-[#606C38] font-medium cursor-pointer"
                                            >
                                              {service.name}
                                            </Label>
                                          </div>
                                          {service.id in formData.serviceQuantities && (
                                            <div className="flex items-center space-x-2">
                                              <Label className="text-xs text-[#606C38]">Qty:</Label>
                                              <Input
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={formData.serviceQuantities[service.id] || 1}
                                                onChange={(e) => handleServiceQuantityChange(service.id, parseInt(e.target.value) || 1)}
                                                className="w-16 h-8 text-center border-[#DDA15E]/30 focus:border-[#BC6C25]"
                                              />
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                              {getSelectedServices().length > 0 && (
                                <div className="mt-4 p-4 bg-gradient-to-r from-[#BC6C25]/10 to-[#DDA15E]/10 rounded-xl border border-[#DDA15E]/30">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="text-sm font-semibold text-[#283618]">Current Total:</p>
                                      <p className="text-xs text-[#606C38]">
                                        {getTotalServiceCount()} service{getTotalServiceCount() !== 1 ? 's' : ''}
                                        {getTotalServiceCount() >= 3 && " • Bundle discount applied!"}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      {getTotalServiceCount() >= 3 && getCurrentTotal() !== getCurrentTotalWithDiscount() ? (
                                        <div>
                                          <p className="text-sm text-[#606C38] line-through">${getCurrentTotal()}</p>
                                          <p className="text-2xl font-bold text-[#BC6C25]">${getCurrentTotalWithDiscount()}</p>
                                        </div>
                                      ) : (
                                        <p className="text-2xl font-bold text-[#BC6C25]">${getCurrentTotal()}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="services-message" className="text-[#283618] font-semibold">Additional Details</Label>
                              <Textarea
                                id="services-message"
                                value={formData.message}
                                onChange={(e) => handleInputChange("message", e.target.value)}
                                className="border-[#DDA15E]/30 focus:border-[#BC6C25] focus:ring-[#BC6C25]/20 mt-1 resize-none"
                                placeholder="Tell us more about your project..."
                                rows={3}
                              />
                            </div>
                            <Button type="submit" className="w-full bg-[#BC6C25] hover:bg-[#DDA15E] text-white py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 mt-6">
                              Get My Free Quote
                            </Button>
                            <p className="text-center text-sm text-[#606C38] mt-3">
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
      <section className="py-16 bg-gradient-to-b from-[#FEFAE0] to-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-[#283618] mb-4">Serving Tennessee Communities</h2>
            <div className="flex items-center justify-center gap-2 text-[#606C38]">
              <MapPin className="h-5 w-5" />
              <span>Proudly serving</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {serviceAreas.map((area, index) => (
              <Badge key={index} variant="secondary" className="text-lg py-3 px-6 bg-[#606C38] text-white hover:bg-[#283618] border-0 rounded-xl font-semibold">
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
            <h2 className="text-4xl lg:text-5xl font-bold text-[#283618] mb-6">
              Our Most Popular Services
            </h2>
            <p className="text-xl text-[#606C38] max-w-3xl mx-auto leading-relaxed">
              Professional installation, transparent pricing, same-day service.
            </p>
          </div>
          
          {/* Desktop Grid */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-3 gap-8 max-w-7xl mx-auto">
              {topServices.map((service, index) => {
                const IconComponent = service.icon;
                return (
                  <Card key={index} className="bg-white border-0 shadow-2xl rounded-3xl overflow-hidden h-[600px]">
                    <CardContent className="p-8 h-full flex flex-col justify-center text-center">
                      <div className={`inline-flex p-5 rounded-3xl bg-gradient-to-br ${service.iconColor} mb-6 shadow-xl mx-auto`}>
                        <IconComponent className="h-12 w-12 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-[#BC6C25] mb-4 uppercase tracking-wide">
                        {service.title}
                      </h2>
                      <h3 className="text-2xl font-bold text-[#283618] mb-4 leading-tight">
                        {service.headline}
                      </h3>
                      <p className="text-base text-[#606C38] mb-6 leading-relaxed">
                        {service.description}
                      </p>
                      <div className="flex flex-col items-center gap-4 mt-auto">
                        <div className="text-4xl font-bold text-[#BC6C25]">{service.price}</div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="bg-[#BC6C25] hover:bg-[#DDA15E] text-white px-8 py-3 rounded-xl font-semibold w-full">
                              Get Quote
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Schedule Your {service.title}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                              <div>
                                <Label htmlFor={`desktop-name-${index}`}>Full Name</Label>
                                <Input
                                  id={`desktop-name-${index}`}
                                  value={formData.name}
                                  onChange={(e) => handleInputChange("name", e.target.value)}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor={`desktop-email-${index}`}>Email</Label>
                                <Input
                                  id={`desktop-email-${index}`}
                                  type="email"
                                  value={formData.email}
                                  onChange={(e) => handleInputChange("email", e.target.value)}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor={`desktop-phone-${index}`}>Phone Number</Label>
                                <Input
                                  id={`desktop-phone-${index}`}
                                  type="tel"
                                  value={formData.phone}
                                  onChange={(e) => handleInputChange("phone", e.target.value)}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor={`desktop-address-${index}`}>Service Address</Label>
                                <Input
                                  id={`desktop-address-${index}`}
                                  value={formData.address}
                                  onChange={(e) => handleInputChange("address", e.target.value)}
                                  placeholder="Street address in Spring Hill, Thompson's Station, or Columbia TN"
                                  required
                                />
                              </div>
                              <div>
                                <Label className="text-[#283618] font-semibold">Services Needed</Label>
                                <div className="mt-2 max-h-32 overflow-y-auto border border-[#DDA15E]/30 rounded-md p-3 bg-white">
                                  {getAllCategories().map(category => (
                                    <div key={category} className="mb-3">
                                      <h4 className="font-semibold text-[#606C38] text-xs mb-1">{category}</h4>
                                      {getServicesByCategory(category).map(svc => (
                                        <div key={svc.id} className="mb-1">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2 flex-1">
                                              <Checkbox
                                                id={`desktop-${index}-${svc.id}`}
                                                checked={svc.id in formData.serviceQuantities}
                                                onCheckedChange={(checked) => handleServiceToggle(svc.id, checked as boolean)}
                                                className="border-[#DDA15E]/30"
                                              />
                                              <Label 
                                                htmlFor={`desktop-${index}-${svc.id}`}
                                                className="text-xs text-[#606C38] font-medium cursor-pointer"
                                              >
                                                {svc.name}
                                              </Label>
                                            </div>
                                            {svc.id in formData.serviceQuantities && (
                                              <div className="flex items-center space-x-1">
                                                <Label className="text-xs text-[#606C38]">Qty:</Label>
                                                <Input
                                                  type="number"
                                                  min="1"
                                                  max="10"
                                                  value={formData.serviceQuantities[svc.id] || 1}
                                                  onChange={(e) => handleServiceQuantityChange(svc.id, parseInt(e.target.value) || 1)}
                                                  className="w-12 h-6 text-xs text-center border-[#DDA15E]/30 focus:border-[#BC6C25]"
                                                />
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                                {getSelectedServices().length > 0 && (
                                  <div className="mt-3 p-3 bg-gradient-to-r from-[#BC6C25]/10 to-[#DDA15E]/10 rounded-lg border border-[#DDA15E]/30">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <p className="text-xs font-semibold text-[#283618]">Total:</p>
                                        <p className="text-xs text-[#606C38]">
                                          {getTotalServiceCount()} service{getTotalServiceCount() !== 1 ? 's' : ''}
                                        </p>
                                      </div>
                                      <p className="text-lg font-bold text-[#BC6C25]">${getCurrentTotal()}</p>
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
                                <div className="bg-gradient-to-r from-[#BC6C25] to-[#DDA15E] rounded-xl p-4 text-center text-white">
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
                                    className="mt-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs py-1"
                                  >
                                    Edit Services
                                  </Button>
                                </div>
                              ) : (
                                <Button 
                                  type="submit" 
                                  disabled={getSelectedServices().length === 0}
                                  className="w-full bg-[#BC6C25] hover:bg-[#DDA15E] disabled:opacity-50"
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
              const IconComponent = service.icon;
              return (
                <Card key={index} className="bg-white border-0 shadow-xl rounded-2xl overflow-hidden">
                  <CardContent className="p-8 text-center">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${service.iconColor} mb-6 shadow-lg`}>
                      <IconComponent className="h-12 w-12 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-[#BC6C25] mb-4 uppercase tracking-wide">
                      {service.title}
                    </h2>
                    <h3 className="text-2xl font-bold text-[#283618] mb-4 leading-tight">
                      {service.headline}
                    </h3>
                    <p className="text-base text-[#606C38] mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    <div className="flex flex-col items-center gap-4">
                      <div className="text-3xl font-bold text-[#BC6C25]">{service.price}</div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-[#BC6C25] hover:bg-[#DDA15E] text-white px-8 py-3 rounded-xl font-semibold w-full">
                            Get Quote
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Schedule Your {service.title}</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleSubmit} className="space-y-4">
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
                              <Input
                                id={`mobile-address-${index}`}
                                value={formData.address}
                                onChange={(e) => handleInputChange("address", e.target.value)}
                                placeholder="Street address in Spring Hill, Thompson's Station, or Columbia TN"
                                required
                              />
                            </div>
                            <div>
                              <Label className="text-[#283618] font-semibold">Services Needed</Label>
                              <div className="mt-2 max-h-32 overflow-y-auto border border-[#DDA15E]/30 rounded-md p-3 bg-white">
                                {getAllCategories().map(category => (
                                  <div key={category} className="mb-3">
                                    <h4 className="font-semibold text-[#606C38] text-xs mb-1">{category}</h4>
                                    {getServicesByCategory(category).map(svc => (
                                      <div key={svc.id} className="mb-1">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-2 flex-1">
                                            <Checkbox
                                              id={`mobile-${index}-${svc.id}`}
                                              checked={svc.id in formData.serviceQuantities}
                                              onCheckedChange={(checked) => handleServiceToggle(svc.id, checked as boolean)}
                                              className="border-[#DDA15E]/30"
                                            />
                                            <Label 
                                              htmlFor={`mobile-${index}-${svc.id}`}
                                              className="text-xs text-[#606C38] font-medium cursor-pointer"
                                            >
                                              {svc.name}
                                            </Label>
                                          </div>
                                          {svc.id in formData.serviceQuantities && (
                                            <div className="flex items-center space-x-1">
                                              <Label className="text-xs text-[#606C38]">Qty:</Label>
                                              <Input
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={formData.serviceQuantities[svc.id] || 1}
                                                onChange={(e) => handleServiceQuantityChange(svc.id, parseInt(e.target.value) || 1)}
                                                className="w-12 h-6 text-xs text-center border-[#DDA15E]/30 focus:border-[#BC6C25]"
                                              />
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                              {getSelectedServices().length > 0 && (
                                <div className="mt-3 p-3 bg-gradient-to-r from-[#BC6C25]/10 to-[#DDA15E]/10 rounded-lg border border-[#DDA15E]/30">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="text-xs font-semibold text-[#283618]">Total:</p>
                                      <p className="text-xs text-[#606C38]">
                                        {getTotalServiceCount()} service{getTotalServiceCount() !== 1 ? 's' : ''}
                                      </p>
                                    </div>
                                    <p className="text-lg font-bold text-[#BC6C25]">${getCurrentTotal()}</p>
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
                              <div className="bg-gradient-to-r from-[#BC6C25] to-[#DDA15E] rounded-xl p-4 text-center text-white">
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
                                  className="mt-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs py-1"
                                >
                                  Edit Services
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                type="submit" 
                                disabled={getSelectedServices().length === 0}
                                className="w-full bg-[#BC6C25] hover:bg-[#DDA15E] disabled:opacity-50"
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
      <section className="py-16 bg-gradient-to-r from-[#BC6C25] to-[#DDA15E]">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Bundle & Save 10%
            </h2>
            <p className="text-xl text-white/90 mb-6">
              Book 3+ services and save money while upgrading your entire home.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-white text-[#BC6C25] hover:bg-white/90 px-10 py-4 text-lg font-semibold rounded-xl">
                  Get Bundle Quote
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Bundle Services & Save 10%</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <Input
                      id="bundle-address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Street address in Spring Hill, Thompson's Station, or Columbia TN"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-[#283618] font-semibold">Services to Bundle (Need 3+ total services for 10% discount)</Label>
                    <div className="mt-2 max-h-48 overflow-y-auto border border-[#DDA15E]/30 rounded-md p-4 bg-white">
                      {getAllCategories().map(category => (
                        <div key={category} className="mb-4">
                          <h4 className="font-semibold text-[#606C38] text-sm mb-2">{category}</h4>
                          {getServicesByCategory(category).map(service => (
                            <div key={service.id} className="py-2 px-3 rounded-lg hover:bg-[#DDA15E]/10 mb-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1">
                                  <Checkbox
                                    id={`bundle-${service.id}`}
                                    checked={service.id in formData.serviceQuantities}
                                    onCheckedChange={(checked) => handleServiceToggle(service.id, checked as boolean)}
                                    className="border-[#DDA15E]/30"
                                  />
                                  <Label 
                                    htmlFor={`bundle-${service.id}`}
                                    className="text-sm text-[#606C38] font-medium cursor-pointer"
                                  >
                                    {service.name}
                                  </Label>
                                </div>
                                {service.id in formData.serviceQuantities && (
                                  <div className="flex items-center space-x-2">
                                    <Label className="text-xs text-[#606C38]">Qty:</Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      max="10"
                                      value={formData.serviceQuantities[service.id] || 1}
                                      onChange={(e) => handleServiceQuantityChange(service.id, parseInt(e.target.value) || 1)}
                                      className="w-16 h-8 text-center border-[#DDA15E]/30 focus:border-[#BC6C25]"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    {getSelectedServices().length > 0 && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-[#BC6C25]/10 to-[#DDA15E]/10 rounded-xl border border-[#DDA15E]/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-semibold text-[#283618]">Bundle Total:</p>
                            <p className="text-xs text-[#606C38]">
                              {getTotalServiceCount()} service{getTotalServiceCount() !== 1 ? 's' : ''}
                              {getTotalServiceCount() >= 3 ? " • 10% Bundle Discount Applied!" : " • Need 3+ for 10% off"}
                            </p>
                          </div>
                          <div className="text-right">
                            {getTotalServiceCount() >= 3 && getCurrentTotal() !== getCurrentTotalWithDiscount() ? (
                              <div>
                                <p className="text-sm text-[#606C38] line-through">${getCurrentTotal()}</p>
                                <p className="text-2xl font-bold text-[#BC6C25]">${getCurrentTotalWithDiscount()}</p>
                              </div>
                            ) : (
                              <p className="text-2xl font-bold text-[#BC6C25]">${getCurrentTotal()}</p>
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
                    <div className="bg-gradient-to-r from-[#BC6C25] to-[#DDA15E] rounded-xl p-6 text-center text-white mb-4">
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
                        className="mt-3 bg-white/20 hover:bg-white/30 text-white border border-white/30"
                      >
                        Edit Services
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={getSelectedServices().length === 0}
                      className="w-full bg-[#BC6C25] hover:bg-[#DDA15E] disabled:opacity-50 disabled:cursor-not-allowed"
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
      <section className="py-16 bg-[#FEFAE0]">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#283618] mb-6">
            We Also Handle
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[#606C38] font-medium">
            <div>Smart Home Devices</div>
            <div>TV Mounting</div>
            <div>Cabinet Hardware</div>
            <div>Safety Updates</div>
            <div>Under-Cabinet Lighting</div>
            <div>Exhaust Fans</div>
            <div>Smoke Detectors</div>
            <div>Motion Sensors</div>
          </div>
          <p className="text-lg text-[#606C38] mt-8 max-w-2xl mx-auto">
            From quick 30-minute fixes to full home upgrades — if it involves fixtures, switches, or hardware, we&apos;ve got you covered.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[#FEFAE0]">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#283618] mb-8">
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
      <section className="py-20 bg-gradient-to-br from-[#283618] via-[#606C38] to-[#283618] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto max-w-4xl px-4 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-10 text-blue-100 leading-relaxed">
            Join hundreds of satisfied customers across Middle Tennessee
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" variant="secondary" className="px-10 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 bg-[#BC6C25] hover:bg-[#DDA15E] text-white border-0">
                  <Phone className="mr-2 h-5 w-5" />
                  Schedule Service Now
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
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
                    <Label className="text-[#283618] font-semibold">Services Needed (Select All That Apply)</Label>
                    <div className="mt-2 max-h-48 overflow-y-auto border border-[#DDA15E]/30 rounded-md p-4 bg-white">
                      {getAllCategories().map(category => (
                        <div key={category} className="mb-4">
                          <h4 className="font-semibold text-[#606C38] text-sm mb-2">{category}</h4>
                          {getServicesByCategory(category).map(service => (
                            <div key={service.id} className="py-2 px-3 rounded-lg hover:bg-[#DDA15E]/10 mb-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1">
                                  <Checkbox
                                    id={`footer-${service.id}`}
                                    checked={service.id in formData.serviceQuantities}
                                    onCheckedChange={(checked) => handleServiceToggle(service.id, checked as boolean)}
                                    className="border-[#DDA15E]/30"
                                  />
                                  <Label 
                                    htmlFor={`footer-${service.id}`}
                                    className="text-sm text-[#606C38] font-medium cursor-pointer"
                                  >
                                    {service.name}
                                  </Label>
                                </div>
                                {service.id in formData.serviceQuantities && (
                                  <div className="flex items-center space-x-2">
                                    <Label className="text-xs text-[#606C38]">Qty:</Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      max="10"
                                      value={formData.serviceQuantities[service.id] || 1}
                                      onChange={(e) => handleServiceQuantityChange(service.id, parseInt(e.target.value) || 1)}
                                      className="w-16 h-8 text-center border-[#DDA15E]/30 focus:border-[#BC6C25]"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    {getSelectedServices().length > 0 && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-[#BC6C25]/10 to-[#DDA15E]/10 rounded-xl border border-[#DDA15E]/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-semibold text-[#283618]">Current Total:</p>
                            <p className="text-xs text-[#606C38]">
                              {getTotalServiceCount()} service{getTotalServiceCount() !== 1 ? 's' : ''}
                              {getTotalServiceCount() >= 3 && " • Bundle discount applied!"}
                            </p>
                          </div>
                          <div className="text-right">
                            {getTotalServiceCount() >= 3 && getCurrentTotal() !== getCurrentTotalWithDiscount() ? (
                              <div>
                                <p className="text-sm text-[#606C38] line-through">${getCurrentTotal()}</p>
                                <p className="text-2xl font-bold text-[#BC6C25]">${getCurrentTotalWithDiscount()}</p>
                              </div>
                            ) : (
                              <p className="text-2xl font-bold text-[#BC6C25]">${getCurrentTotal()}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="address2">Service Address</Label>
                    <Input
                      id="address2"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
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
                    <div className="bg-gradient-to-r from-[#BC6C25] to-[#DDA15E] rounded-xl p-6 text-center text-white mb-4">
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
                        className="mt-3 bg-white/20 hover:bg-white/30 text-white border border-white/30"
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
            
            <Button size="lg" variant="outline" className="px-10 py-4 text-lg font-semibold rounded-xl border-2 border-[#DDA15E]/50 text-[#DDA15E] hover:bg-[#DDA15E]/10 backdrop-blur-sm">
              <Mail className="mr-2 h-5 w-5" />
              Email Us
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#283618] text-white py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/icon.svg"
                  alt="Stewart Fixture Co. Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10 filter brightness-0 invert"
                />
                <h3 className="text-2xl font-bold tracking-wider">STEWART FIXTURE CO.</h3>
              </div>
              <p className="text-[#FEFAE0]/70 leading-relaxed">
                Professional fixture installation services across Middle Tennessee.
              </p>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-4">Service Areas</h4>
              <ul className="text-[#FEFAE0]/70 space-y-2">
                {serviceAreas.map((area, index) => (
                  <li key={index}>{area}, TN</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-4">Contact</h4>
              <div className="text-[#FEFAE0]/70 space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>(815) 577-6393</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>info@stewartfixtureco.com</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-[#606C38] mt-12 pt-8 text-center text-[#FEFAE0]/70">
            <p>&copy; 2024 STEWART FIXTURE CO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}