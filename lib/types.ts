export type SaleStatus = "DP" | "Belum Lunas" | "Lunas";

export type PaymentMethod = "Tunai" | "Transfer" | "QRIS" | "Lainnya";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

export type InvoiceTemplateId = "modern" | "classic" | "minimal";

export const INVOICE_TEMPLATES: { id: InvoiceTemplateId; label: string }[] = [
  { id: "modern", label: "Modern" },
  { id: "classic", label: "Klasik" },
  { id: "minimal", label: "Minimalis" },
];

export const DEFAULT_INVOICE_ACCENT = "#4f46e5";

export interface Workspace {
  id: string;
  owner_id: string;
  company_name: string;
  logo_url: string | null;
  created_at: string;
  /** Invoice customization (see migration 0006). */
  invoice_template: InvoiceTemplateId;
  invoice_accent: string;
  business_address: string | null;
  business_phone: string | null;
  business_email: string | null;
  business_tax_id: string | null;
  invoice_footer: string | null;
  payment_instructions: string | null;
}

export interface Customer {
  id: string;
  workspace_id: string;
  name: string;
  phone: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  workspace_id: string;
  name: string;
  price: number;
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  workspace_id: string;
  invoice_number: string;
  customer_id: string | null;
  customer_name: string;
  total_amount: number;
  status: SaleStatus;
  is_delivered: boolean;
  due_date: string | null;
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string | null;
  quantity: number;
  price_at_sale: number;
}

export interface PaymentHistory {
  id: string;
  sale_id: string;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
}

/** Sale row joined with its items and payments (used in detail/invoice views). */
export interface SaleWithRelations extends Sale {
  sales_items: (SaleItem & { products: Pick<Product, "name"> | null })[];
  payment_history: PaymentHistory[];
}

/** Payload sent to the create_sale RPC. */
export interface CreateSaleItemInput {
  product_id: string;
  quantity: number;
}

/** Customer form fields. */
export interface CustomerInput {
  name: string;
  phone: string;
  description: string;
}
