"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showCheckEmail, setShowCheckEmail] = useState(false);

  const isSignup = mode === "signup";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const supabase = createClient();
      try {
        if (isSignup) {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
          });
          if (error) throw error;
          setShowCheckEmail(true);
          return;
        } else {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
        }
        // The middleware decides where to go next (onboarding or dashboard).
        router.replace("/");
        router.refresh();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Terjadi kesalahan.";
        toast.error(
          message === "Invalid login credentials"
            ? "Email atau kata sandi salah."
            : message
        );
      }
    });
  }

  return (
    <>
      {/* Check-email dialog — shown after successful signup */}
      <Dialog open={showCheckEmail} onOpenChange={setShowCheckEmail}>
        <DialogContent className="max-w-sm text-center">
          <div className="mx-auto mb-2 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="size-8 text-primary" />
          </div>
          <DialogHeader className="items-center space-y-2">
            <DialogTitle className="text-xl">Cek email Anda</DialogTitle>
            <DialogDescription className="text-center text-sm leading-relaxed">
              Kami telah mengirim link konfirmasi ke{" "}
              <span className="font-semibold text-foreground">{email}</span>.
              Buka email tersebut dan klik link konfirmasi untuk mengaktifkan
              akun Anda.
            </DialogDescription>
          </DialogHeader>
          <p className="mt-2 text-xs text-muted-foreground">
            Tidak menemukan email? Cek folder <strong>Spam</strong> atau{" "}
            <strong>Junk</strong>.
          </p>
          <Button
            className="mt-2 w-full"
            onClick={() => router.push("/login")}
          >
            Ke halaman masuk
          </Button>
        </DialogContent>
      </Dialog>

      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {isSignup ? "Buat akun baru" : "Selamat datang kembali"}
          </CardTitle>
          <CardDescription>
            {isSignup
              ? "Mulai catat penjualan dan invoice usaha Anda."
              : "Masuk untuk mengelola penjualan Anda."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Budi Santoso"
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@usaha.com"
                autoComplete="email"
                required
              />
              {isSignup && (
                <p className="text-xs text-muted-foreground">
                  Email ini akan digunakan untuk mengirim link konfirmasi akun.
                  Pastikan email aktif dan dapat Anda akses.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                autoComplete={isSignup ? "new-password" : "current-password"}
                minLength={6}
                required
              />
            </div>
            {!isSignup && (
              <div className="text-center">
                <span className="text-sm text-muted-foreground">
                  <span>Akun Demo : demo@catatin.app / demodemo123</span>
                </span>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isSignup ? "Daftar" : "Masuk"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignup ? (
              <>
                Sudah punya akun?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Masuk
                </Link>
              </>
            ) : (
              <>
                Belum punya akun?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-primary hover:underline"
                >
                  Daftar
                </Link>
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </>
  );
}

