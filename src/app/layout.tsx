import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#059669",
};

export const metadata: Metadata = {
  title: "StoreOS — Multi-Niche POS Platform | ₹99/mo",
  description: "India's first multi-niche POS platform. Run your restaurant, retail, salon, or any business with a custom POS system — for just ₹99/month. 14-day free trial.",
  keywords: ["StoreOS", "POS", "Point of Sale", "Restaurant POS", "Retail POS", "Billing Software", "GST Billing", "India", "SaaS"],
  authors: [{ name: "StoreOS Team" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "StoreOS",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="storeos-theme"
        >
          {children}
          <Toaster />
          <SonnerToaster position="top-right" richColors />
          <ServiceWorkerRegistration />
        </ThemeProvider>
      </body>
    </html>
  );
}
