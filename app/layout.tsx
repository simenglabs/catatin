import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://catatin.id";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Catatin — Penjualan & Invoice",
    template: "%s | Catatin",
  },
  description:
    "Aplikasi pencatatan penjualan, stok, dan invoice untuk usaha Anda. Kelola DP, Belum Lunas, Lunas otomatis. Unduh PDF invoice langsung dari browser.",
  keywords: [
    "catatan penjualan",
    "aplikasi invoice",
    "stok usaha",
    "invoice PDF",
    "UMKM",
    "pencatatan usaha",
    "SaaS invoice Indonesia",
  ],
  authors: [{ name: "Catatin" }],
  creator: "Catatin",
  openGraph: {
    title: "Catatin — Penjualan & Invoice",
    description:
      "Aplikasi pencatatan penjualan, stok, dan invoice untuk usaha Anda.",
    url: APP_URL,
    siteName: "Catatin",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Catatin — Penjualan & Invoice",
    description:
      "Aplikasi pencatatan penjualan, stok, dan invoice untuk usaha Anda.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${sans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://qmvhzovewrfzwdzugfcn.supabase.co" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-center" />
        <Analytics />
      </body>
    </html>
  );
}
