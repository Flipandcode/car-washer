import type { Metadata, Viewport } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";

const display = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
});
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SoapRun — Car Wash Manager",
  description: "Manage customers, vehicles, subscriptions and payments for your car washing business.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F544E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
