# Coffee Shop Management System - AI Coding Instructions

## Project Overview

React 18 + TypeScript + Vite frontend for a Vietnamese coffee shop POS and management system. Uses shadcn/ui components, Radix UI primitives, Tailwind CSS, and a mock authentication system with role-based permissions.

## Architecture & Key Patterns

### State Management
- **No Redux/Zustand** - Uses React Context API for global state
- **AuthContext** ([src/contexts/AuthContext.tsx](../src/contexts/AuthContext.tsx)) - Central auth state with `useAuth()` hook
- **Component-local state** - Complex features (POS, Kitchen Display) use `useState` with large state objects
- **Mock data** - All data stored in `src/data/*.ts` files (no backend yet)

### Permission System
Granular CRUD permissions defined in [src/types/account.ts](../src/types/account.ts):
```typescript
type Permission = 'goods_inventory:view' | 'goods_inventory:create' | ...
```
- Use `hasPermission(permission)` from `useAuth()` to gate features
- Page access controlled in [App.tsx](../src/App.tsx) `pagePermissions` mapping
- Roles (manager, barista, cashier, server) have preset permissions in [src/data/roleData.ts](../src/data/roleData.ts)
- Custom per-user permissions override role defaults

### Component Organization
```
src/components/
  ui/           - shadcn/ui primitives (button, dialog, input, etc.)
  pages/        - Full page components (Dashboard, POSOrdering, Inventory, etc.)
  *.tsx         - Shared components (modals, forms, widgets)
  figma/        - Auto-generated Figma imports (rarely edited)
```

**shadcn/ui Usage:**
- Import from `@/components/ui/*` (alias configured in [vite.config.ts](../vite.config.ts))
- Extend with Tailwind classes, never modify ui files directly
- Common pattern: wrap ui components in feature-specific components

### Page Routing
Single-page app with string-based routing in [App.tsx](../src/App.tsx):
```tsx
type PageType = "dashboard" | "pos" | "kitchen" | ...
const [currentPage, setCurrentPage] = useState<PageType>("dashboard");
```
Navigate via `setCurrentPage()` passed to Sidebar/TopNavbar. No React Router.

### Fullscreen Pages
POS and Kitchen Display use fullscreen mode pattern:
- Check `currentPage === "pos"` or `"kitchen"` 
- Render without Sidebar, show "Back to Home" button
- Uses emerald color scheme (vs blue for main app)

## Critical Development Patterns

### Toast Notifications
Use `sonner` library (imported as `import { toast } from "sonner"`):
```tsx
toast.success("Lưu thành công!");
toast.error("Có lỗi xảy ra");
```
Must have `<Toaster />` in [App.tsx](../src/App.tsx) (already present).

### Form Handling
- **React Hook Form** for complex forms (registration, customer creation)
- **Controlled inputs** with `useState` for simpler forms
- Validation typically inline with conditional error messages

### Data Patterns
Mock data files export constants:
```tsx
export const combos: Combo[] = [...]; // src/data/combos.ts
export const staffMembers: StaffMember[] = [...]; // src/data/staffData.ts
```
Modify these directly for demo/testing. No persistence layer yet.

### Modal/Dialog Pattern
Use Radix Dialog via shadcn wrapper:
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader><DialogTitle>Title</DialogTitle></DialogHeader>
    {/* form content */}
    <DialogFooter>
      <Button onClick={handleSave}>Lưu</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## POS System Specifics

[POSOrdering.tsx](../src/components/pages/POSOrdering.tsx) (4655 lines) - Critical module:

### Cart Architecture
```tsx
interface CartItem {
  id: string;
  quantity: number;
  // Combo support
  isCombo?: boolean;
  comboItems?: CartItem[];
  comboExpanded?: boolean;
  // Topping/customization
  attachedToppings?: CartItem[];
  customization?: ItemCustomization;
  // Status tracking
  status?: "pending" | "preparing" | "completed" | ...
}
```

### Key POS Features
- **Combo detection** - Auto-suggests combos when cart items match combo requirements ([src/data/combos.ts](../src/data/combos.ts))
- **Table management** - Track orders per table with `TableOrders` state
- **Multi-payment** - Cash, card, bank transfer splits
- **Receipt printing** - Uses [PrintReceiptModal.tsx](../src/components/PrintReceiptModal.tsx) with `window.print()` + `@media print` CSS
- **Out-of-stock handling** - Items can be marked OOS with ingredient tracking

### Receipt Printing System
Documented in [RECEIPT_PRINTING_SYSTEM.md](../src/RECEIPT_PRINTING_SYSTEM.md):
1. Transaction saved BEFORE opening print modal
2. Modal shows preview using [ReceiptPrintContent.tsx](../src/components/ReceiptPrintContent.tsx)
3. "Print" button calls `window.print()` (system dialog)
4. Can reprint without modal close
5. CSS `@media print` hides UI, formats for 80mm thermal printers

## Vietnamese Language & UI

- All UI text in Vietnamese (buttons, labels, toasts)
- Date format: `dd/MM/yyyy` (use `date-fns` with Vietnamese locale)
- Currency: VND (no decimals, format with `.toLocaleString('vi-VN')`)
- Color scheme: Blue primary (`blue-600`, `blue-700`), emerald for POS/Kitchen

## Development Workflow

### Running the App
```bash
npm run dev     # Vite dev server on localhost:3000
npm run build   # Production build to build/
```

### Login Credentials (Mock)
- Manager: `admin` / `admin123`
- Barista: `phache` / `phache123`
- Cashier: `thungan` / `thungan123`
- Server: `phucvu` / `phucvu123`

### Adding Features
1. Check permission requirements in [src/types/account.ts](../src/types/account.ts)
2. Add page to `PageType` union in [App.tsx](../src/App.tsx)
3. Map permission in `pagePermissions` object
4. Add route case in `renderPage()`
5. Create page component in `src/components/pages/`
6. Add navigation item to [Sidebar.tsx](../src/components/Sidebar.tsx) or [TopNavbar.tsx](../src/components/TopNavbar.tsx)

## Common Pitfalls

- **Don't modify** `src/components/ui/*` directly - these are shadcn primitives
- **Permission checks** - Always gate features with `hasPermission()` or `canView()`/`canCreate()`/etc.
- **Import paths** - Use `@/components/ui/...` not relative paths for ui components
- **State updates** - Large state objects in POS need careful mutation (spread operators)
- **Combo logic** - Complex nested cart structure, refer to existing combo handlers in POSOrdering
- **Toast import** - Use `import { toast } from "sonner"` NOT `import { toast } from "sonner@2.0.3"`

## Key Documentation Files

- [SYSTEM_OVERVIEW.md](../src/SYSTEM_OVERVIEW.md) - Full module descriptions (Vietnamese)
- [README.md](../src/README.md) - UI/UX design principles, color schemes, navigation structure
- [RECEIPT_PRINTING_SYSTEM.md](../src/RECEIPT_PRINTING_SYSTEM.md) - Receipt architecture details

## Type Safety Notes

- Strict TypeScript enabled
- Most data structures have interfaces (check `src/types/` and inline interfaces)
- Permission types are string literals (auto-complete friendly)
- Use explicit return types for complex functions to catch errors early
