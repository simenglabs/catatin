import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Catatin — Penjualan & Invoice";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "18px",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4.5 13.5 8.5 17.5 19.5 6.5" />
              <circle cx="19.5" cy="6.5" r="1.9" fill="white" stroke="none" />
            </svg>
          </div>
          <span
            style={{
              color: "white",
              fontSize: "42px",
              fontWeight: "700",
              letterSpacing: "-1px",
            }}
          >
            Catatin
          </span>
        </div>

        <h1
          style={{
            color: "white",
            fontSize: "72px",
            fontWeight: "800",
            lineHeight: 1.1,
            margin: 0,
            maxWidth: "900px",
            letterSpacing: "-2px",
          }}
        >
          Penjualan & Invoice untuk Usaha Anda
        </h1>

        <p
          style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: "30px",
            marginTop: "24px",
            maxWidth: "800px",
            lineHeight: 1.4,
          }}
        >
          Catat penjualan, lacak pembayaran, unduh PDF invoice. Gratis untuk
          mulai.
        </p>
      </div>
    ),
    { ...size },
  );
}
