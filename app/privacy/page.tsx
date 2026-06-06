import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — Catatin",
  description:
    "Kebijakan Privasi Catatin — bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda.",
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "6 Juni 2026";
const CONTACT_EMAIL = "hello@menglabs.id";
const APP_NAME = "Catatin";
const COMPANY = "MengLabs";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-dvh bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/">
            <Logo />
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Kembali ke beranda
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight">
          Kebijakan Privasi
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Terakhir diperbarui: {LAST_UPDATED}
        </p>

        <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none">
          <p>
            {APP_NAME} adalah layanan pencatatan penjualan dan invoice yang
            dikembangkan oleh <strong>{COMPANY}</strong>. Kebijakan Privasi ini
            menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan
            melindungi informasi Anda saat menggunakan layanan kami, baik
            melalui aplikasi web maupun aplikasi mobile.
          </p>

          {/* 1 */}
          <h2>1. Data yang Kami Kumpulkan</h2>
          <p>Kami mengumpulkan data berikut saat Anda menggunakan {APP_NAME}:</p>
          <h3>a. Data Akun</h3>
          <ul>
            <li>Nama lengkap</li>
            <li>Alamat email</li>
            <li>Kata sandi (disimpan dalam bentuk hash terenkripsi)</li>
          </ul>
          <h3>b. Data Bisnis</h3>
          <ul>
            <li>
              Nama perusahaan / toko, alamat, nomor telepon, email bisnis, dan
              NPWP (opsional)
            </li>
            <li>Logo perusahaan</li>
            <li>Data produk: nama, harga, stok</li>
            <li>Data pelanggan: nama, nomor telepon, catatan</li>
            <li>
              Data penjualan: invoice, item, jumlah, status pembayaran, tanggal
            </li>
          </ul>
          <h3>c. Data Teknis</h3>
          <ul>
            <li>
              Log akses dan aktivitas (untuk keamanan dan pemecahan masalah)
            </li>
            <li>
              Informasi perangkat dan browser secara anonim melalui Vercel
              Analytics
            </li>
          </ul>

          {/* 2 */}
          <h2>2. Cara Kami Menggunakan Data</h2>
          <p>Data yang dikumpulkan digunakan untuk:</p>
          <ul>
            <li>Menyediakan dan menjalankan layanan {APP_NAME}</li>
            <li>Memverifikasi identitas dan mengamankan akun Anda</li>
            <li>Menampilkan data bisnis Anda di dashboard dan invoice</li>
            <li>Memproses dan menyimpan transaksi penjualan</li>
            <li>Meningkatkan kualitas dan performa layanan</li>
            <li>
              Menghubungi Anda jika ada pembaruan penting terkait layanan
            </li>
          </ul>
          <p>
            Kami <strong>tidak menjual</strong>, menyewakan, atau
            memperdagangkan data pribadi Anda kepada pihak ketiga untuk tujuan
            pemasaran.
          </p>

          {/* 3 */}
          <h2>3. Penyimpanan Data</h2>
          <p>
            Data Anda disimpan di infrastruktur{" "}
            <strong>Supabase</strong> (PostgreSQL) yang di-host di server
            aman. Semua data dilindungi dengan Row Level Security (RLS) —
            setiap pengguna hanya dapat mengakses data workspace miliknya
            sendiri.
          </p>
          <p>
            Kata sandi tidak pernah disimpan dalam bentuk teks biasa — seluruh
            autentikasi ditangani oleh Supabase Auth.
          </p>
          <p>
            File yang diunggah (seperti logo) disimpan di Supabase Storage
            dengan akses publik terbatas hanya pada folder milik pengguna yang
            bersangkutan.
          </p>

          {/* 4 */}
          <h2>4. Berbagi Data dengan Pihak Ketiga</h2>
          <p>
            Kami menggunakan layanan pihak ketiga berikut dalam operasional{" "}
            {APP_NAME}:
          </p>
          <ul>
            <li>
              <strong>Supabase</strong> — database, autentikasi, dan
              penyimpanan file
            </li>
            <li>
              <strong>Vercel</strong> — hosting dan analitik anonim
            </li>
          </ul>
          <p>
            Masing-masing pihak ketiga terikat pada kebijakan privasi mereka
            sendiri. Kami hanya berbagi data yang diperlukan untuk menjalankan
            layanan.
          </p>

          {/* 5 */}
          <h2>5. Keamanan Data</h2>
          <p>
            Kami menerapkan langkah-langkah keamanan teknis yang wajar,
            termasuk:
          </p>
          <ul>
            <li>Enkripsi data saat transit (HTTPS/TLS)</li>
            <li>Row Level Security di level database</li>
            <li>API key server-only tidak pernah dikirim ke client/browser</li>
            <li>
              Token akses pengguna (JWT) digunakan untuk memvalidasi setiap
              permintaan API
            </li>
          </ul>
          <p>
            Namun, tidak ada sistem yang 100% aman. Kami mendorong Anda untuk
            menggunakan kata sandi yang kuat dan tidak membagikan kredensial
            akun kepada siapapun.
          </p>

          {/* 6 */}
          <h2>6. Hak Anda atas Data</h2>
          <p>Anda berhak untuk:</p>
          <ul>
            <li>
              <strong>Mengakses</strong> data yang kami simpan tentang Anda
            </li>
            <li>
              <strong>Mengoreksi</strong> data yang tidak akurat melalui
              pengaturan akun
            </li>
            <li>
              <strong>Menghapus</strong> akun dan seluruh data terkait — cukup
              hubungi kami di{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </li>
            <li>
              <strong>Ekspor</strong> data bisnis Anda (dalam bentuk PDF invoice
              yang tersedia di aplikasi)
            </li>
          </ul>

          {/* 7 */}
          <h2>7. Retensi Data</h2>
          <p>
            Data Anda disimpan selama akun aktif. Jika Anda menghapus akun,
            seluruh data (workspace, produk, pelanggan, penjualan, dan
            pembayaran) akan dihapus secara permanen dalam waktu 30 hari.
          </p>

          {/* 8 */}
          <h2>8. Anak di Bawah Umur</h2>
          <p>
            Layanan {APP_NAME} ditujukan untuk pengguna berusia 17 tahun ke
            atas. Kami tidak secara sadar mengumpulkan data dari anak-anak di
            bawah 17 tahun.
          </p>

          {/* 9 */}
          <h2>9. Perubahan Kebijakan</h2>
          <p>
            Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu.
            Perubahan signifikan akan diberitahukan melalui email atau
            notifikasi di aplikasi. Tanggal pembaruan terakhir selalu
            tercantum di bagian atas halaman ini.
          </p>

          {/* 10 */}
          <h2>10. Hubungi Kami</h2>
          <p>
            Jika Anda memiliki pertanyaan, permintaan penghapusan data, atau
            kekhawatiran terkait privasi, silakan hubungi kami:
          </p>
          <ul>
            <li>
              Email:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </li>
            <li>
              Website:{" "}
              <a
                href="https://www.menglabs.id"
                target="_blank"
                rel="noopener noreferrer"
              >
                menglabs.id
              </a>
            </li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-3xl px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {APP_NAME} · sebuah proyek {COMPANY}.
          </p>
          <div className="mt-2 flex justify-center gap-4 text-xs">
            <Link href="/" className="hover:text-foreground">
              Beranda
            </Link>
            <Link href="/privacy" className="hover:text-foreground font-medium text-foreground">
              Kebijakan Privasi
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
