import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Brewster | Cafe POS & Management System",
    template: "%s | Brewster",
  },
  description:
    "Manage orders, billing, tables, kitchen operations, payments, inventory, customers, and sales reports with Caffine.",
  keywords: [
    "Caffine",
    "cafe management system",
    "coffee shop POS",
    "restaurant POS",
    "order management",
    "table management",
    "kitchen display system",
    "billing software",
  ],
  authors: [{ name: "Caffine" }],
  creator: "Caffine",
  applicationName: "Caffine",
  category: "Business",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Caffine | Cafe POS & Management System",
    description:
      "A complete cafe management platform for orders, billing, tables, kitchen operations, payments, and reporting.",
    type: "website",
    siteName: "Caffine",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Caffine | Cafe POS & Management System",
    description:
      "Simplify your cafe operations—from order placement to payment and reporting.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased suppress-hydration-warning`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >    
        <TooltipProvider>{children}</TooltipProvider>
         </ThemeProvider>
      </body>
    </html>
  );
}
