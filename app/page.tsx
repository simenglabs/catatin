import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Package,
  Send,
  ShieldCheck,
  ShoppingCart,
  UserPlus,
  Wallet,
} from "lucide-react";

import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://catatin.id";

export const metadata: Metadata = {
  alternates: { canonical: APP_URL },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Catatin",
  url: APP_URL,
  description:
    "Aplikasi pencatatan penjualan, stok, dan invoice untuk usaha Anda. Kelola DP, Belum Lunas, Lunas otomatis.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "IDR",
  },
  inLanguage: "id",
};

const FEATURES = [
  {
    icon: ShoppingCart,
    title: "Pencatatan Penjualan",
    desc: "Buat order, pilih produk, dan stok otomatis berkurang. Cepat dari HP maupun desktop.",
  },
  {
    icon: Wallet,
    title: "Status Bayar Otomatis",
    desc: "DP, Belum Lunas, dan Lunas dihitung sendiri dari riwayat pembayaran. Tidak ada salah hitung.",
  },
  {
    icon: FileText,
    title: "Invoice Custom + PDF",
    desc: "Logo, warna, dan 3 template invoice per usaha. Unduh PDF siap kirim ke pelanggan.",
  },
  {
    icon: ShieldCheck,
    title: "Data Aman & Terisolasi",
    desc: "Setiap workspace terpisah penuh. Data usaha Anda tidak tercampur dengan siapa pun.",
  },
];

const STEPS = [
  {
    icon: UserPlus,
    title: "Daftar gratis",
    desc: "Buat akun dan workspace usaha Anda dalam hitungan detik.",
  },
  {
    icon: Package,
    title: "Atur produk",
    desc: "Tambahkan produk beserta harga dan stok awal.",
  },
  {
    icon: Send,
    title: "Catat & kirim invoice",
    desc: "Rekam penjualan, lacak pembayaran, lalu unduh invoice PDF.",
  },
];

const TEMPLATES = [
  { name: "Modern", accent: "#4f46e5" },
  { name: "Klasik", accent: "#0f766e" },
  { name: "Minimalis", accent: "#b45309" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#fitur" className="transition-colors hover:text-foreground">
              Fitur
            </a>
            <a
              href="#cara-kerja"
              className="transition-colors hover:text-foreground"
            >
              Cara Kerja
            </a>
            <a href="#harga" className="transition-colors hover:text-foreground">
              Harga
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Masuk</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Coba Gratis</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
          />
          <div className="relative mx-auto w-full max-w-6xl px-4 pt-16 pb-12 text-center sm:px-6 sm:pt-24">
            <span className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Gratis · Tanpa kartu kredit
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Catat penjualan & buat invoice usaha dalam satu tempat
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-muted-foreground">
              Catatin membantu UMKM mengelola produk, melacak pembayaran
              DP hingga lunas, dan mengirim invoice profesional — semua dari
              ponsel.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/signup">
                  Mulai Gratis
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Link href="/login">Masuk ke Akun</Link>
              </Button>
            </div>

            {/* Product mock */}
            <div className="mx-auto mt-14 max-w-4xl">
              <DashboardMock />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="fitur" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Semua yang dibutuhkan usaha kecil
            </h2>
            <p className="mt-3 text-muted-foreground">
              Tanpa spreadsheet rumit. Fokus jualan, biar Catatin yang
              merapikan.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="size-5.5" />
                </span>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="cara-kerja" className="border-y bg-muted/30">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Mulai dalam 3 langkah
              </h2>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <div key={s.title} className="relative text-center">
                  <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                    <s.icon className="size-6" />
                  </span>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-primary">
                    Langkah {i + 1}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Invoice showcase */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Invoice yang mewakili brand Anda
            </h2>
            <p className="mt-3 text-muted-foreground">
              Pilih template, atur warna dan logo, lalu unduh sebagai PDF.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {TEMPLATES.map((t) => (
              <div key={t.name} className="rounded-2xl border bg-card p-5">
                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <div
                    className="h-1.5 w-full rounded-full"
                    style={{ backgroundColor: t.accent }}
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="h-2 w-16 rounded bg-zinc-200" />
                      <div className="h-1.5 w-10 rounded bg-zinc-100" />
                    </div>
                    <span
                      className="text-xs font-bold"
                      style={{ color: t.accent }}
                    >
                      INVOICE
                    </span>
                  </div>
                  <div className="mt-4 space-y-2">
                    {[0, 1, 2].map((r) => (
                      <div key={r} className="flex justify-between">
                        <div className="h-1.5 w-24 rounded bg-zinc-100" />
                        <div className="h-1.5 w-10 rounded bg-zinc-100" />
                      </div>
                    ))}
                  </div>
                  <div
                    className="mt-4 h-2 w-20 rounded"
                    style={{ backgroundColor: t.accent, opacity: 0.85 }}
                  />
                </div>
                <p className="mt-4 text-center text-sm font-medium">{t.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing / CTA */}
        <section id="harga" className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-violet-500 px-6 py-14 text-center text-primary-foreground">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full bg-white/10 blur-2xl"
            />
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-foreground/80">
              Harga
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Gratis untuk mulai
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/90">
              Semua fitur inti tanpa biaya. Cocok untuk UMKM yang baru merapikan
              pencatatan.
            </p>
            <ul className="mx-auto mt-6 flex max-w-md flex-col gap-2 text-left text-sm sm:flex-row sm:flex-wrap sm:justify-center">
              {[
                "Produk & stok tanpa batas",
                "Invoice PDF custom",
                "Pelacakan pembayaran",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="mt-8 bg-white text-primary hover:bg-white/90"
            >
              <Link href="/signup">
                Buat Akun Gratis
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/20">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Penjualan & invoice untuk UMKM Indonesia. Gratis untuk mulai.
            </p>
          </div>

          <div className="flex flex-col gap-3 text-sm sm:items-end">
            <div className="flex gap-4 text-muted-foreground">
              <a href="#fitur" className="hover:text-foreground">
                Fitur
              </a>
              <Link href="/login" className="hover:text-foreground">
                Masuk
              </Link>
              <Link href="/signup" className="hover:text-foreground">
                Daftar
              </Link>
              <Link href="/privacy" className="hover:text-foreground">
                Privasi
              </Link>
            </div>
            <p className="text-muted-foreground">
              Dibuat dengan <span className="text-rose-500">♡</span> oleh{" "}
              <a
                href="https://www.menglabs.id"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-foreground underline-offset-2 hover:underline"
              >
                MengLabs
              </a>{" "}
              — studio kreatif independen.
            </p>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Catatin · sebuah proyek MengLabs.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Lightweight static replica of the dashboard for the hero. */
function DashboardMock() {
  const bars = [40, 55, 35, 70, 50, 85, 60, 95];
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-primary/10">
      {/* browser chrome */}
      <div className="flex items-center gap-1.5 border-b bg-muted/40 px-4 py-3">
        <span className="size-2.5 rounded-full bg-red-400" />
        <span className="size-2.5 rounded-full bg-amber-400" />
        <span className="size-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 rounded-md bg-background px-3 py-1 text-xs text-muted-foreground">
          catatin.menglabs.id/dashboard
        </span>
      </div>
      <div className="p-5 text-left">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-xl bg-gradient-to-br from-primary to-violet-500 p-4 text-primary-foreground">
            <p className="text-xs text-primary-foreground/80">Pendapatan</p>
            <p className="mt-1 text-lg font-bold">Rp 12,5jt</p>
          </div>
          {[
            { l: "Piutang", v: "Rp 2,1jt", c: "text-amber-600" },
            { l: "DP Aktif", v: "3", c: "text-blue-600" },
            { l: "Bulan Ini", v: "Rp 4,8jt", c: "text-foreground" },
          ].map((m) => (
            <div key={m.l} className="rounded-xl border bg-background p-4">
              <p className="text-xs text-muted-foreground">{m.l}</p>
              <p className={`mt-1 text-lg font-bold ${m.c}`}>{m.v}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border bg-background p-4">
          <p className="text-sm font-medium">Performa Penjualan</p>
          <div className="mt-4 flex h-28 items-end gap-2">
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-primary/80"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
