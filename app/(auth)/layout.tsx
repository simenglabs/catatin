import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/brand";

const POINTS = [
  "Catat penjualan & stok otomatis",
  "Status DP, Belum Lunas, Lunas terhitung sendiri",
  "Invoice custom dengan unduhan PDF",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel (desktop) */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary to-violet-600 p-10 text-primary-foreground lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-16 size-80 rounded-full bg-white/10 blur-3xl"
        />
        <Link href="/">
          <Logo tone="light" />
        </Link>
        <div className="relative">
          <h2 className="max-w-sm text-3xl font-bold leading-tight">
            Kelola penjualan & invoice usaha Anda dalam satu tempat.
          </h2>
          <ul className="mt-8 space-y-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-primary-foreground/90">
                <CheckCircle2 className="size-5 shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-primary-foreground/70">
          © {new Date().getFullYear()} Catatin — gratis untuk UMKM - Dibuat dari hati oleh <Link href="https://www.menglabs.id" className="underline">MengLabs</Link>
        </p>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center lg:hidden">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
