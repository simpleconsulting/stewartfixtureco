// Stewart Services Pricing Matrix
// Edit this file to update service pricing across the entire website

export interface ServiceItem {
  id: string;
  category: string;
  name: string;
  price: number;
  description?: string;
}

export const pricingMatrix: ServiceItem[] = [
  // Lighting & Fixtures
  {
    id: "ceiling-fan-install",
    category: "Lighting & Fixtures",
    name: "Ceiling Fan Installation",
    price: 200,
    description: "Professional installation at any height"
  },
  {
    id: "standard-light-fixture",
    category: "Lighting & Fixtures", 
    name: "Standard Light Fixture Replacement",
    price: 150,
    description: "Basic light fixture swap"
  },
  {
    id: "pendant-chandelier-low",
    category: "Lighting & Fixtures",
    name: "Pendant/Chandelier Install (<10ft ceiling)",
    price: 225,
    description: "Installation for standard height ceilings"
  },
  {
    id: "pendant-chandelier-high",
    category: "Lighting & Fixtures",
    name: "Pendant/Chandelier Install (10–14ft ceiling)",
    price: 300,
    description: "Installation for high ceilings"
  },
  {
    id: "vanity-light",
    category: "Lighting & Fixtures",
    name: "Vanity Light Replacement",
    price: 150,
    description: "Bathroom vanity lighting"
  },
  {
    id: "motion-sensor-light",
    category: "Lighting & Fixtures",
    name: "Install Motion Sensor Light (Interior/Exterior)",
    price: 175,
    description: "Automated lighting installation"
  },
  
  // Switches & Outlets
  {
    id: "dimmer-switch",
    category: "Switches & Outlets",
    name: "Dimmer Switch Install",
    price: 125,
    description: "Standard dimmer switch installation"
  },
  {
    id: "three-way-switch",
    category: "Switches & Outlets",
    name: "3-Way Switch Install/Troubleshoot",
    price: 165,
    description: "Multi-location switch setup"
  },
  {
    id: "standard-switch",
    category: "Switches & Outlets",
    name: "Light Switch Replacement (Standard)",
    price: 125,
    description: "Basic switch replacement"
  },
  {
    id: "standard-outlet",
    category: "Switches & Outlets",
    name: "Standard Outlet Replacement",
    price: 125,
    description: "Basic outlet replacement"
  },
  {
    id: "usb-outlet",
    category: "Switches & Outlets",
    name: "Install USB Outlet",
    price: 150,
    description: "USB charging outlet installation"
  },
  {
    id: "gfci-outlet",
    category: "Switches & Outlets",
    name: "Install GFCI Outlet",
    price: 150,
    description: "Ground fault protection outlet"
  },
  
  // Safety & Ventilation
  {
    id: "smoke-co2-detector",
    category: "Safety & Ventilation",
    name: "Replace/Install Smoke or CO2 Detector (Battery or Hardwired)",
    price: 100,
    description: "Safety device installation"
  },
  
  // Hardware & Other
  {
    id: "cabinet-hardware",
    category: "Hardware & Other",
    name: "Basic Cabinet Handle/Knob Swap (Up to 20)",
    price: 175,
    description: "Kitchen/bathroom hardware update"
  },
  {
    id: "quick-visit",
    category: "Hardware & Other",
    name: "Quick Visit (1 small task, <30 mins)",
    price: 95,
    description: "Minor repair or installation"
  },
  
  // Service Bundles
  {
    id: "bundle-3-fixtures",
    category: "Service Bundles",
    name: "Bundle: 3 Electrical Fixtures (Mix & Match)",
    price: 375,
    description: "Save on multiple fixture installations"
  },
  {
    id: "bundle-5-switches-outlets",
    category: "Service Bundles",
    name: "Bundle: 5 Switches or Outlets",
    price: 450,
    description: "Save on multiple switch/outlet upgrades"
  }
];

// Helper functions for pricing calculations
export const getServiceById = (id: string): ServiceItem | undefined => {
  return pricingMatrix.find(service => service.id === id);
};

export const getServicesByCategory = (category: string): ServiceItem[] => {
  return pricingMatrix.filter(service => service.category === category);
};

export const getAllCategories = (): string[] => {
  return [...new Set(pricingMatrix.map(service => service.category))];
};

export const calculateTotal = (serviceQuantities: Record<string, number>): number => {
  return Object.entries(serviceQuantities).reduce((total, [id, quantity]) => {
    const service = getServiceById(id);
    return total + (service?.price || 0) * quantity;
  }, 0);
};

export const getServicesForDisplay = () => {
  return pricingMatrix.map(service => ({
    id: service.id,
    category: service.category,
    name: service.name,
    description: service.description
  }));
};