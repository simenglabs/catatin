"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * Renders the invoice sheet (#targetId) to a PNG with html-to-image, then lays
 * it into an A4 jsPDF and triggers a download. Tall invoices are sliced across
 * pages by re-placing the full image at a negative offset each page.
 */
export function DownloadPdfButton({
  targetId,
  fileName,
}: {
  targetId: string;
  fileName: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    const node = document.getElementById(targetId);
    if (!node) {
      toast.error("Invoice belum siap.");
      return;
    }
    setLoading(true);
    try {
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#ffffff",
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("image load failed"));
      });

      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW;
      const imgH = (img.height / img.width) * imgW;

      if (imgH <= pageH) {
        pdf.addImage(dataUrl, "PNG", 0, 0, imgW, imgH);
      } else {
        let remaining = imgH;
        let position = 0;
        while (remaining > 0) {
          pdf.addImage(dataUrl, "PNG", 0, position, imgW, imgH);
          remaining -= pageH;
          if (remaining > 0) {
            pdf.addPage();
            position -= pageH;
          }
        }
      }

      pdf.save(fileName);
    } catch {
      toast.error(
        "Gagal membuat PDF. Jika ada logo, pastikan gambarnya dapat diakses."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleDownload} disabled={loading}>
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
      Download PDF
    </Button>
  );
}
