# Coffee Shop Management System
## Hệ thống Quản lý Quán Café

### 🎨 Thiết kế mới - Cập nhật 2025

Hệ thống đã được làm mới hoàn toàn với:

#### **Layout & Navigation**
- ✅ **Navbar trên cùng** với dropdown menu
- ✅ **Gom nhóm menu** logic:
  - 📋 Tổng quan
  - 👥 **Nhân viên** (dropdown): Nhân viên + Lịch làm việc
  - 📦 **Hàng hóa** (dropdown): Kho + Thực đơn + Nhập/Xuất
  - 🤝 **Đối tác** (dropdown): Khách hàng + Nhà cung cấp
  - 💰 Tài chính
  - 📊 Báo cáo
  - 🛒 **Bán hàng** (fullscreen)
  - 🍳 **Pha chế** (fullscreen)

#### **Fullscreen Mode**
- 🖥️ **Bán hàng & Pha chế** mở ở chế độ toàn màn hình
- 🏠 Nút "Về trang chủ" để quay lại dashboard
- ⚡ Tập trung 100% vào chức năng đang sử dụng

#### **Màu sắc**
- 🔵 **Xanh dương chủ đạo** (`blue-600`, `blue-700`, `blue-900`)
- ⚪ **Nền trắng sạch** (`white`, `slate-50`)
- 🟢 **Xanh lá cho Bán hàng & Pha chế** (emerald)
- 🎨 **Accent colors** - Emerald (thành công), Orange (cảnh báo), Red (nguy hiểm)

#### **Filter Panel**
- 📍 **Bên trái** - Cố định cho desktop
- ✅ **Checkbox filters** - Danh mục, trạng thái, thời gian
- 🔍 **Bộ lọc nhanh** - Một click để xem dữ liệu quan trọng
- 📱 Auto-hidden trên mobile

#### **Tables với Sorting**
- ⬆️ **Click vào header** để sắp xếp
- 🔄 **3 trạng thái**: Tăng dần → Giảm dần → Mặc định
- 🎯 **Icon trực quan**: Arrow up/down/both

---

## 🎯 Cấu trúc Menu

### **Main Navigation**

```
📋 Tổng quan                    → Dashboard với analytics

👥 Nhân viên ▼                 → Dropdown menu
   ├─ Nhân viên                → Quản lý nhân viên & phân quyền
   └─ Lịch làm việc            → Scheduling & timekeeping

📦 Hàng hóa ▼                  → Dropdown menu
   ├─ Kho                      → Inventory management
   ├─ Thực đơn                 → Menu & recipes
   └─ Nhập/Xuất hàng           → Import/Export/Return

🤝 Đối tác ▼                   → Dropdown menu
   ├─ Khách hàng               → Customer loyalty & promotions
   └─ Nhà cung cấp             → Supplier management

💰 Tài chính                    → Finance & multi-payment

📊 Báo cáo                      → Reporting & analytics

─────────────────────────────────────────

🛒 Bán hàng                    → Fullscreen POS mode
🍳 Pha chế                     → Fullscreen Kitchen display
```

---

## 🖥️ Fullscreen Mode

### **Bán hàng (POS)**
Khi click vào "Bán hàng", màn hình chuyển sang chế độ fullscreen:

```
┌─────────────────────────────────────────────┐
│ [🏠 Về trang chủ]  Bán hàng        [🔔] [👤]│
├─────────────────────────────────────────────┤
│                                             │
│  [Menu & Bàn]           │    [Đơn hàng]    │
│                         │                  │
│  ☕ Sản phẩm            │    Cart items    │
│  🪑 Sơ đồ bàn          │    [Thanh toán]  │
│                         │                  │
└─────────────────────────────────────────────┘
```

**Tính năng:**
- ✅ Menu sản phẩm với search & filter
- ✅ Sơ đồ bàn trực quan
- ✅ Giỏ hàng real-time
- ✅ Thanh toán đa phương thức
- 🏠 Nút quay về trang chủ

### **Pha chế (Kitchen Display)**
Khi click vào "Pha chế", màn hình chuyển sang chế độ fullscreen:

```
┌─────────────────────────────────────────────┐
│ [🏠 Về trang chủ]  Pha chế         [🔔] [👤]│
├─────────────────────────────────────────────┤
│  3 đơn mới • 2 đang làm • 1 hoàn thành     │
│  [Tất cả] [Quầy cà phê] [Quầy trà] ...     │
├─────────────────────────────────────────────┤
│                                             │
│  [ORD-045]    [ORD-046]    [ORD-047]       │
│  Bàn 3        Bàn 7        Bàn 12          │
│  [Gấp]        Đang làm     Đang làm        │
│  2x Cà phê    1x Trà       1x Cappuccino   │
│                                             │
│  [Bắt đầu]    [Hoàn thành] [Hoàn thành]    │
└─────────────────────────────────────────────┘
```

**Tính năng:**
- ✅ Hiển thị đơn theo trạng thái
- ✅ Đánh dấu độ ưu tiên (Gấp)
- ✅ Tracking thời gian
- ✅ Lọc theo quầy (Cà phê, Trà, Đồ ăn)
- 🏠 Nút quay về trang chủ

---

## 📊 Các trang đã cập nhật

### 1. **Dashboard (Tổng quan)**
- Filter panel bên trái với:
  - Khoảng thời gian (Hôm nay, Tuần, Tháng, Tùy chỉnh)
  - Danh mục sản phẩm (checkbox)
  - Trạng thái (Hoạt động, Cảnh báo, Quan trọng)
  - Bộ lọc nhanh (Tồn kho thấp, Sắp hết hạn, Bán chạy)
- Biểu đồ màu xanh dương
- Cards với gradient xanh dương/cyan/indigo

### 2. **Inventory (Kho)**
- Filter panel bên trái:
  - Danh mục (Tất cả, Cà phê, Sữa & Kem, Siro, Trà...)
  - Trạng thái (Đủ hàng, Sắp hết, Gần hết hạn, Thiếu hàng)
  - Bộ lọc nhanh với số lượng
- Table với sorting:
  - Tên nguyên liệu ⬆️⬇️
  - Tồn kho ⬆️⬇️
  - Hạn sử dụng ⬆️⬇️
  - Giá trị ⬆️⬇️
- Progress bar cho tồn kho

### 3. **Staff (Nhân viên)**
- Sorting theo:
  - Tên nhân viên ⬆️⬇️
  - Vai trò ⬆️⬇️
  - Ngày vào làm ⬆️⬇️
- Badge màu cho từng vai trò:
  - Quản lý (Purple)
  - Pha chế (Blue)
  - Thu ngân (Cyan)
  - Phục vụ (Emerald)

### 4. **Reports (Báo cáo)**
- Sorting trên tất cả tables:
  - Sản phẩm: Tên, Số lượng, Doanh thu, Lợi nhuận
  - Nhân viên: Tên, Đơn hàng, Doanh thu
- Biểu đồ cột màu xanh dương
- Pie chart với gradient xanh

### 5. **POS (Bán hàng)** - Fullscreen Mode
- Không có navbar chính
- Chỉ có nút "Về trang chủ"
- Tập trung vào bán hàng

### 6. **Kitchen (Pha chế)** - Fullscreen Mode
- Không có navbar chính
- Chỉ có nút "Về trang chủ"
- Tập trung vào pha chế

---

## 🎯 Tính năng Sorting

### Cách sử dụng:
1. **Click lần 1**: Sắp xếp tăng dần (A→Z, 0→9, cũ→mới)
2. **Click lần 2**: Sắp xếp giảm dần (Z→A, 9→0, mới→cũ)
3. **Click lần 3**: Bỏ sắp xếp (về mặc định)

### Icon:
- `⇅` - Chưa sắp xếp (màu xám nhạt)
- `↑` - Tăng dần (màu xanh)
- `↓` - Giảm dần (màu xanh)

---

## 🎨 Design System

### Colors
```css
Primary Blue:
- blue-50:  #eff6ff (Background nhạt)
- blue-100: #dbeafe (Hover states, Tabs)
- blue-200: #bfdbfe (Borders)
- blue-600: #2563eb (Buttons, Links, Active states)
- blue-700: #1d4ed8 (Hover buttons)
- blue-900: #1e3a8a (Text headings)

Emerald (POS/Kitchen):
- emerald-50:  #ecfdf5
- emerald-600: #059669 (Buttons)
- emerald-700: #047857 (Hover)

Slate (Neutral):
- slate-50:  #f8fafc (Page background)
- slate-200: #e2e8f0 (Borders)
- slate-400: #94a3b8 (Icons)
- slate-600: #475569 (Secondary text)
- slate-700: #334155 (Primary text)
- slate-900: #0f172a (Headings)
```

### Components
- **Navbar**: Fixed top, white background, blue accent
- **Dropdown**: Hover-based với ChevronDown icon
- **Cards**: White với colored borders (blue-200)
- **Buttons**: Blue-600 primary, Emerald-600 for POS/Kitchen
- **Badges**: Emerald (good), Amber (warning), Orange (expiring), Red (critical)
- **Tables**: Blue-50 header, sortable columns
- **Filters**: White panel, checkboxes, auto-apply

---

## 📱 Responsive Design

### Desktop (lg: ≥1024px)
- Full navbar với dropdown menu
- Filter panel visible (264px width)
- Tables full width
- Grid layouts (3-4 columns)

### Tablet (md: 768-1023px)
- Navbar với dropdown
- Filter panel hidden
- Tables scrollable
- Grid 2-3 columns

### Mobile (< 768px)
- Hamburger menu
- No filter panel
- Cards stack vertically
- Grid 1-2 columns
- Fullscreen mode remains fullscreen

---

## 🚀 Công nghệ

- **React 18** - UI Framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - Component library
- **Recharts** - Data visualization
- **Lucide React** - Icons

---

## 📂 Cấu trúc thư mục

```
/
├── App.tsx                      # Main app với navbar & fullscreen logic
├── components/
│   ├── TopNavbar.tsx           # Navbar với dropdown menu
│   ├── ui/                     # shadcn components
│   └── pages/
│       ├── Dashboard.tsx       # ✅ Filter + Charts
│       ├── Inventory.tsx       # ✅ Filter + Sorting
│       ├── Staff.tsx          # ✅ Sorting
│       ├── Reports.tsx        # ✅ Sorting
│       ├── POSOrdering.tsx    # 🖥️ Fullscreen POS
│       ├── KitchenDisplay.tsx # 🖥️ Fullscreen Kitchen
│       ├── MenuRecipe.tsx     # Menu management
│       ├── Scheduling.tsx     # Staff scheduling
│       ├── Customers.tsx      # Loyalty program
│       ├── Suppliers.tsx      # Vendor management
│       ├── Finance.tsx        # Financial tracking
│       └── ImportExport.tsx   # Inventory transactions
└── styles/
    └── globals.css            # Global styles
```

---

## ✨ Highlights

### Dropdown Navigation
```tsx
✅ Hover to reveal menu items
✅ Active state highlight
✅ ChevronDown indicator
✅ Mobile: Expandable sections
✅ Logical grouping
```

### Fullscreen Mode
```tsx
✅ No main navbar
✅ "Về trang chủ" button
✅ Dedicated workspace
✅ Full focus on task
✅ Clean interface
```

### Filter Panel (Bên trái)
```tsx
✅ Sticky positioning
✅ Overflow scroll
✅ Checkbox groups
✅ Quick filters with counts
✅ Auto-apply (no submit button)
✅ Hidden on mobile
```

### Sortable Tables
```tsx
✅ Click header to sort
✅ Visual feedback (arrows)
✅ 3-state sorting
✅ Multiple fields
✅ Maintains filters
```

---

## 🎯 User Flow

```
Login → Dashboard (Filter + Overview) 
     → Dropdown Navigation
     → Inventory (Filter + Sort + Search)
     → Fullscreen POS (Add to cart → Checkout)
     → Fullscreen Kitchen (Track orders)
     → Reports (Analyze + Sort)
     → Back Home (🏠)
```

---

## 📝 Notes

- **Mock Data**: Hệ thống sử dụng dữ liệu giả
- **Vietnamese**: Full tiếng Việt UI
- **Dropdown Menu**: Gom nhóm chức năng logic
- **Fullscreen**: Bán hàng & Pha chế tách biệt
- **Production Ready**: Cần backend API + authentication
- **Extensible**: Dễ thêm modules mới

---

**Version**: 3.0.0  
**Updated**: January 2025 - Dropdown Navigation + Fullscreen Mode  
**License**: MIT
