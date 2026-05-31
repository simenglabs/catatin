@AGENTS.md

Act as an expert Senior Fullstack Developer. Build a responsive, production-ready Minimum Viable Product (MVP) for a multi-tenant Sales and Invoicing SaaS application.

### TECH STACK
- Frontend/Backend: Next.js (Latest Stable App Router)
- Styling: Tailwind CSS (Mobile-first design)
- Component Library: Shadcn UI / Radix Primitives
- Database & Backend-as-a-Service: Supabase (PostgreSQL, Auth, and Storage)

### ARCHITECTURE & CORE LOGIC
1. Multi-Tenant Workspace:
   - Implement strict data isolation using a `workspace_id` (UUID) on every core table.
   - Users can create or belong to a Workspace. For this MVP, assume 1 User = 1 Workspace Owner (no team member roles yet).
   - All routing for authenticated views should ideally be structured under workspace context (e.g., `/dashboard/[workspace_id]/...`).

2. Database Schema (Logical Requirements):
   - `profiles`: id (FK to auth.users), email, full_name.
   - `workspaces`: id, owner_id (FK to profiles), company_name, logo_url (string from Supabase Storage).
   - `products`: id, workspace_id, name, price, stock (integer, no variants).
   - `sales`: id, workspace_id, invoice_number, customer_name, total_amount, status (enum: 'DP', 'Belum Lunas', 'Lunas'), is_delivered (boolean).
   - `sales_items`: id, sale_id, product_id, quantity, price_at_sale.
   - `payment_history`: id, sale_id, amount_paid, payment_date, payment_method.

3. Sales Status & Inventory Business Logic:
   - DP (Down Payment): Registered when a payment is made, but `is_delivered` is FALSE and total_amount is not fully paid. Product stock should be decremented/reserved at this stage.
   - Belum Lunas: Registered when `is_delivered` is TRUE, but total amount paid in `payment_history` is still less than `total_amount`.
   - Lunas: Registered automatically when the sum of `amount_paid` in `payment_history` equals `total_amount`.

### CORE PAGES & UI/UX REQUIREMENTS
Create a clean, minimalist UI that is 100% responsive between Desktop and Mobile view (use collapsible sidebars for mobile, stack data tables into card views on small screens).

1. Authentication Page: Simple Login / Sign Up using Supabase Auth (Email/Password).
2. Workspace Onboarding: Form to enter Company Name and upload a Company Logo (upload directly to Supabase Storage bucket).
3. Dashboard Overview: Mobile-friendly metric cards showing Total Revenue (Lunas), Total Outstanding Receivables (Belum Lunas), and Active DP transactions.
4. Product Management: A simple CRUD table/list to add, edit, and delete products (fields: Name, Price, Stock).
5. Sales & Order Entry:
   - A multi-step or responsive single-page form to create an order.
   - Select products, input quantities, input Customer Name.
   - Add initial payment amount to trigger the initial status (DP or Lunas).
   - Toggle switch for "Barang Sudah Diserahkan" to handle the 'DP' vs 'Belum Lunas' transition.
6. Payment Tracking View: A sub-section inside the Sales detail page to add subsequent payments (e.g., paying off a DP or Belum Lunas invoice).
7. Invoice Generator:
   - A clean, standardized, 1-page static invoice layout optimized for both screen viewing and window.print() / PDF download.
   - Dynamically display the Workspace Logo in the top header.
   - List customer details, invoice number, items bought, total amount, payment history breakdown, and the remaining balance.

### CODE QUALITY INSTRUCTIONS
- Write clean, modular React TypeScript components using Tailwind CSS.
- Ensure proper loading states and error handling for all Supabase database mutations.
- Do not use placeholder mock data for the core loops; hook them up to the database actions or API routes directly.
- Implement strict responsive utilities: Ensure tables don't overflow horizontally on mobile screens (use overflow-x-auto or block card structures).