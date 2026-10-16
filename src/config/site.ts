// Brand is a PLACEHOLDER until the final name is chosen — change it here only.
export const siteConfig = {
  name: "GuruBridge",
  tagline: "India's best teachers, live in your time zone",
  description:
    "Live 1-on-1 and group classes with teachers in India, scheduled for US evenings and weekends. Free to join.",
  supportWhatsApp: "", // e.g. "+91XXXXXXXXXX"
  // Offer code promoted on the home page and class pages (managed in Admin → Offer codes).
  promoCode: "FIRSTCLASS",
  // Business details shown on legal and contact pages. Fill these in before applying
  // to Razorpay — they must match the GST / bank / KYC documents.
  legal: {
    businessName: "[Registered business name]",
    operatorName: "[Proprietor / director name]",
    address: "[Registered business address], India",
    email: "[support@yourdomain.com]",
    phone: "[+91 support phone]",
    jurisdiction: "[City], India",
    effectiveDate: "16 October 2026",
  },
  nav: [
    { label: "Explore", href: "/explore" },
    { label: "1-on-1", href: "/explore?format=one-on-one" },
    { label: "Kids & Family", href: "/explore?for=kids" },
    { label: "Coaches", href: "/coaches" },
  ],
} as const;
