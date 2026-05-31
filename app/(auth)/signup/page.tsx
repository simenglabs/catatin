import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Daftar Gratis",
  description:
    "Buat akun Catatin gratis dan mulai kelola penjualan, stok, dan invoice usaha Anda dalam hitungan detik.",
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
