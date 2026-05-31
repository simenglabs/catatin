"use client";
/* eslint-disable @next/next/no-img-element */

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2 } from "lucide-react";

import { updateWorkspaceSettings, type SettingsState } from "./actions";
import { InvoiceTemplate } from "@/components/invoice/invoice-template";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  DEFAULT_INVOICE_ACCENT,
  INVOICE_TEMPLATES,
  type InvoiceTemplateId,
  type SaleWithRelations,
  type Workspace,
} from "@/lib/types";

const initialState: SettingsState = { error: null };

/** Static sale used only to render the live invoice preview. */
const SAMPLE_SALE: SaleWithRelations = {
  id: "preview",
  workspace_id: "preview",
  invoice_number: "INV-CONTOH-0001",
  customer_name: "Budi Santoso",
  total_amount: 750000,
  status: "Belum Lunas",
  is_delivered: true,
  created_at: new Date().toISOString(),
  sales_items: [
    {
      id: "i1",
      sale_id: "preview",
      product_id: "p1",
      quantity: 2,
      price_at_sale: 250000,
      products: { name: "Kopi Arabika 250g" },
    },
    {
      id: "i2",
      sale_id: "preview",
      product_id: "p2",
      quantity: 1,
      price_at_sale: 250000,
      products: { name: "Teh Hijau Premium 100g" },
    },
  ],
  payment_history: [
    {
      id: "pay1",
      sale_id: "preview",
      amount_paid: 300000,
      payment_date: new Date().toISOString(),
      payment_method: "Transfer",
    },
  ],
};

const MAX_LOGO_BYTES = 5 * 1024 * 1024; // 5MB

export function SettingsForm({ workspace }: { workspace: Workspace }) {
  const [state, formAction, isPending] = useActionState(
    updateWorkspaceSettings.bind(null, workspace.id),
    initialState
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Live-preview state (also drives the submitted values via name attributes).
  const [companyName, setCompanyName] = useState(workspace.company_name);
  const [template, setTemplate] = useState<InvoiceTemplateId>(
    workspace.invoice_template
  );
  const [accent, setAccent] = useState(
    workspace.invoice_accent || DEFAULT_INVOICE_ACCENT
  );
  const [address, setAddress] = useState(workspace.business_address ?? "");
  const [phone, setPhone] = useState(workspace.business_phone ?? "");
  const [email, setEmail] = useState(workspace.business_email ?? "");
  const [taxId, setTaxId] = useState(workspace.business_tax_id ?? "");
  const [footer, setFooter] = useState(workspace.invoice_footer ?? "");
  const [payInfo, setPayInfo] = useState(workspace.payment_instructions ?? "");
  const [logoPreview, setLogoPreview] = useState<string | null>(
    workspace.logo_url
  );

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.ok) toast.success("Pengaturan invoice disimpan.");
  }, [state]);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_LOGO_BYTES) {
      toast.error("Ukuran logo maksimal 5MB.");
      e.target.value = "";
      return;
    }
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.delete("logo"); // the file is uploaded directly, not via the action

    const file = fileRef.current?.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const body = new FormData();
        body.set("logo", file);
        const res = await fetch("/api/upload-logo", {
          method: "POST",
          body,
        });
        const json = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !json.url) {
          toast.error(json.error ?? "Gagal upload logo.");
          return;
        }
        fd.set("logo_url", json.url);
      } catch {
        toast.error("Gagal upload logo. Coba lagi.");
        return;
      } finally {
        setUploading(false);
      }
    }

    formAction(fd);
  }

  const previewWorkspace: Workspace = {
    ...workspace,
    company_name: companyName || "Nama Usaha",
    logo_url: logoPreview,
    invoice_template: template,
    invoice_accent: accent,
    business_address: address || null,
    business_phone: phone || null,
    business_email: email || null,
    business_tax_id: taxId || null,
    invoice_footer: footer || null,
    payment_instructions: payInfo || null,
  };

  const busy = uploading || isPending;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Identitas Usaha</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed bg-muted/40 text-muted-foreground transition hover:border-primary hover:text-primary"
                >
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Pratinjau logo"
                      className="size-20 object-cover"
                    />
                  ) : (
                    <ImagePlus className="size-6" />
                  )}
                </button>
                <p className="text-sm text-muted-foreground">
                  Klik untuk ganti logo. PNG/JPG, maks 5MB.
                </p>
              </div>
              <input
                ref={fileRef}
                type="file"
                name="logo"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={onPickFile}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_name">Nama Perusahaan</Label>
              <Input
                id="company_name"
                name="company_name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="business_phone">Telepon</Label>
                <Input
                  id="business_phone"
                  name="business_phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812-3456-7890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_email">Email</Label>
                <Input
                  id="business_email"
                  name="business_email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usaha@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_address">Alamat</Label>
              <Textarea
                id="business_address"
                name="business_address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. Merdeka No. 1, Jakarta"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_tax_id">NPWP / ID Usaha</Label>
              <Input
                id="business_tax_id"
                name="business_tax_id"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="00.000.000.0-000.000"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tampilan Invoice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Template</Label>
              <div className="grid grid-cols-3 gap-2">
                {INVOICE_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplate(t.id)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      template === t.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "hover:bg-accent"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <input type="hidden" name="invoice_template" value={template} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice_accent">Warna Aksen</Label>
              <div className="flex items-center gap-3">
                <input
                  id="invoice_accent"
                  name="invoice_accent"
                  type="color"
                  value={accent}
                  onChange={(e) => setAccent(e.target.value)}
                  className="h-9 w-14 cursor-pointer rounded-lg border bg-transparent p-1"
                />
                <span className="font-mono text-sm text-muted-foreground">
                  {accent}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_instructions">
                Instruksi Pembayaran
              </Label>
              <Textarea
                id="payment_instructions"
                name="payment_instructions"
                value={payInfo}
                onChange={(e) => setPayInfo(e.target.value)}
                placeholder="Transfer ke BCA 1234567890 a.n. Toko Anda"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice_footer">Catatan Kaki</Label>
              <Textarea
                id="invoice_footer"
                name="invoice_footer"
                value={footer}
                onChange={(e) => setFooter(e.target.value)}
                placeholder="Terima kasih atas kepercayaan Anda."
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={busy} className="w-full sm:w-auto">
          {busy && <Loader2 className="size-4 animate-spin" />}
          {uploading ? "Mengunggah logo…" : "Simpan Pengaturan"}
        </Button>
      </form>

      {/* Live preview */}
      <div className="space-y-2 lg:sticky lg:top-20 lg:self-start">
        <p className="text-sm font-medium text-muted-foreground">
          Pratinjau Invoice
        </p>
        <div className="origin-top scale-[0.85] sm:scale-100">
          <InvoiceTemplate workspace={previewWorkspace} sale={SAMPLE_SALE} />
        </div>
      </div>
    </div>
  );
}
