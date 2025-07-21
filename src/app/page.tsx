"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, MapPin, Phone, Mail, Star, Award, Users, Shield, Fan, Lightbulb, Settings } from "lucide-react";

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
    headline: "Refresh Any Room with a Fast, Professional Fixture Swap.",
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

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    address: "",
    message: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle form submission here
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
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Schedule Your Service</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="service">Service Needed</Label>
                        <Select onValueChange={(value) => handleInputChange("service", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                          <SelectContent>
                            {topServices.map((service, index) => (
                              <SelectItem key={index} value={service.title}>
                                {service.title} - {service.price}
                              </SelectItem>
                            ))}
                            <SelectItem value="Other">Other Service</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="address">Service Address</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          placeholder="Street address in Spring Hill, Thompson's Station, or Columbia TN"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="message">Additional Details</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => handleInputChange("message", e.target.value)}
                          placeholder="Tell us more about your project..."
                          rows={3}
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Request Quote
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" size="lg" className="px-10 py-4 text-lg font-semibold rounded-xl border-2 border-[#DDA15E]/50 text-[#DDA15E] hover:bg-[#DDA15E]/10 backdrop-blur-sm">
                  View Services
                </Button>
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
          
          <div className="space-y-20">
            {topServices.map((service, index) => {
              const IconComponent = service.icon;
              return (
              <div key={index} className={`flex flex-col lg:flex-row items-center gap-16 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                <div className="flex-1 text-center lg:text-left">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${service.iconColor} mb-6 shadow-lg`}>
                    <IconComponent className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-[#283618] mb-4 leading-tight">
                    {service.headline}
                  </h3>
                  <p className="text-lg text-[#606C38] mb-8 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="text-4xl font-bold text-[#BC6C25]">{service.price}</div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-[#BC6C25] hover:bg-[#DDA15E] text-white px-8 py-3 rounded-xl font-semibold">
                          Get Quote
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Schedule Your {service.title}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div>
                            <Label htmlFor={`name-${index}`}>Full Name</Label>
                            <Input
                              id={`name-${index}`}
                              value={formData.name}
                              onChange={(e) => handleInputChange("name", e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor={`email-${index}`}>Email</Label>
                            <Input
                              id={`email-${index}`}
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange("email", e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor={`phone-${index}`}>Phone Number</Label>
                            <Input
                              id={`phone-${index}`}
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => handleInputChange("phone", e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor={`address-${index}`}>Service Address</Label>
                            <Input
                              id={`address-${index}`}
                              value={formData.address}
                              onChange={(e) => handleInputChange("address", e.target.value)}
                              placeholder="Street address in Spring Hill, Thompson's Station, or Columbia TN"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor={`message-${index}`}>Additional Details</Label>
                            <Textarea
                              id={`message-${index}`}
                              value={formData.message}
                              onChange={(e) => handleInputChange("message", e.target.value)}
                              placeholder={`Tell us about your ${service.title.toLowerCase()} needs...`}
                              rows={3}
                            />
                          </div>
                          <Button type="submit" className="w-full bg-[#BC6C25] hover:bg-[#DDA15E]">
                            Request Quote
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-gradient-to-br from-[#FEFAE0] to-white rounded-3xl p-12 h-80 flex items-center justify-center shadow-lg border border-[#DDA15E]/20">
                    <div className="text-center">
                      <div className={`inline-flex p-6 rounded-3xl bg-gradient-to-br ${service.iconColor} mb-6 shadow-xl`}>
                        <IconComponent className="h-16 w-16 text-white" />
                      </div>
                      <h4 className="text-2xl font-bold text-[#283618]">{service.title}</h4>
                    </div>
                  </div>
                </div>
              </div>
            );})}
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
              <DialogContent className="max-w-md">
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
                    <Label htmlFor="bundle-message">What services are you interested in?</Label>
                    <Textarea
                      id="bundle-message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="List the services you're interested in bundling..."
                      rows={4}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-[#BC6C25] hover:bg-[#DDA15E]">
                    Get Bundle Quote
                  </Button>
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
              <DialogContent className="max-w-md">
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
                    <Label htmlFor="service2">Service Needed</Label>
                    <Select onValueChange={(value) => handleInputChange("service", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {topServices.map((service, index) => (
                          <SelectItem key={index} value={service.title}>
                            {service.title} - {service.price}
                          </SelectItem>
                        ))}
                        <SelectItem value="Other">Other Service</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <Button type="submit" className="w-full">
                    Request Quote
                  </Button>
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
                  <span>(555) 123-4567</span>
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