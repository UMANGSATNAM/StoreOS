import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StoreOS — Multi-Niche POS Platform | ₹99/mo",
  description: "India's first multi-niche POS platform. Run your restaurant, retail, salon, or any business with a custom POS system — for just ₹99/month. 14-day free trial.",
  keywords: ["StoreOS", "POS", "Point of Sale", "Restaurant POS", "Retail POS", "Billing Software", "GST Billing", "India", "SaaS"],
  authors: [{ name: "StoreOS Team" }],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏪</text></svg>",
  },
  openGraph: {
    title: "StoreOS — Run Your Store on Autopilot",
    description: "Multi-niche POS platform for every business. ₹99/month with 14-day free trial.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster position="top-right" richColors />
      </body>
    </html>
  );
}
