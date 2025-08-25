import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Stewart Services | Professional Fixture Installation",
  description: "Professional installation of light fixtures, ceiling fans, switches, outlets, and home hardware across Spring Hill, Thompson's Station, and Columbia TN. Transparent flat-rate pricing.",
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
  themeColor: '#FCA311',
  openGraph: {
    title: 'Stewart Services | Professional Fixture Installation',
    description: 'Professional installation of light fixtures, ceiling fans, switches, outlets, and home hardware across Middle Tennessee. Transparent flat-rate pricing.',
    url: 'https://stewartservices.com',
    siteName: 'Stewart Services',
    images: [
      {
        url: '/FIRST20_Promo.png',
        width: 1200,
        height: 630,
        alt: 'Stewart Services - 20% Off Your First Service with Code FIRST20',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stewart Services | Professional Fixture Installation',
    description: 'Professional installation of light fixtures, ceiling fans, switches, outlets, and home hardware across Middle Tennessee.',
    images: ['/FIRST20_Promo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
