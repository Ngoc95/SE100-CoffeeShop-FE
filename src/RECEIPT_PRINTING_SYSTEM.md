# Hệ Thống In Hóa Đơn - Kiến Trúc Kiotvet-Style

## Tổng Quan

Hệ thống in hóa đơn được xây dựng theo mô hình của KiotViet:

1. **Ghi nhận giao dịch** trước khi in
2. **Tách biệt logic thanh toán và in** - in là tùy chọn, không ảnh hưởng trạng thái đơn hàng
3. **Sử dụng window.print()** - gọi hộp thoại in hệ thống/trình duyệt
4. **CSS @media print** - kiểm soát nội dung và bố cục in
5. **Hỗ trợ in lại** - người dùng có thể in cùng một hóa đơn nhiều lần

## Kiến Trúc Component

### 1. ReceiptPrintContent.tsx

**Mục đích:** Render nội dung hóa đơn có thể được dùng cho cả xem trước lẫn in.

**Đặc điểm:**

- Sử dụng monospace font để phù hợp với máy in nhiệt
- Inject CSS @media print vào document trong useEffect
- CSS print styles:
  - Ẩn toàn bộ giao diện web (chỉ hiển thị `#receipt-print-container`)
  - Định dạng khổ 80mm cho máy in nhiệt
  - Dạng dòng monospace, căn chỉnh đơn giản
  - Hỗ trợ cả A4 qua @page

**Props:**

```typescript
{
  items: ReceiptItem[];           // Các mặt hàng trong hóa đơn
  totalAmount: number;             // Tổng tiền
  orderNumber: string;             // Số hóa đơn
  customerName: string;            // Tên khách hàng
  paymentMethod: string;           // Phương thức thanh toán
  receiptDate: Date;               // Thời gian tạo hóa đơn
  waiterName?: string;             // Tên nhân viên (tùy chọn)
  tableNumber?: string;            // Số bàn (tùy chọn)
}
```

### 2. PrintReceiptModal.tsx

**Mục đích:** Modal để xem trước hóa đơn và kích hoạt in qua window.print().

**Luồng hoạt động:**

1. Modal mở với preview hóa đơn
2. Người dùng xem trước
3. Nhấn "In" → gọi window.print() → hộp thoại in hệ thống mở
4. Người dùng chọn máy in, cài đặt, nhấn "In" hoặc "Hủy" trong hộp thoại
5. Có thể nhấn "In lại" để gọi window.print() lại (không đóng modal)
6. Nhấn "Đóng" để thoát modal mà không ảnh hưởng đơn hàng

**Buttons:**

- **Đóng**: Đóng modal, không in
- **In lại**: Gọi window.print() lại, modal vẫn mở
- **In**: Gọi window.print() lần đầu, modal vẫn mở

**Ưu điểm:**

- Hệ thống web không cần mô phỏng hộp thoại in
- Toàn quyền kiểm soát nội dung hóa đơn
- Người dùng quen với trình duyệt/OS print dialog
- Hỗ trợ tất cả máy in (thông qua OS)
- Có thể in lại mà không cần reload dữ liệu

## Luồng Thanh Toán → In Hóa Đơn

### Trong POSOrdering.tsx:

```
1. Người dùng nhấn "Thanh toán" (Thanh toán button)
   ↓
2. Ghi nhận giao dịch thành công:
   - Lưu order vào database/history
   - Cập nhật trạng thái đơn hàng
   - Gọi API nếu cần
   ↓
3. Mở PrintReceiptModal:
   - setPrintReceiptOpen(true)
   - Modal hiển thị preview hóa đơn
   ↓
4. Người dùng có 3 lựa chọn:
   a) Đóng modal → quay lại giao diện POS (đơn hàng đã saved)
   b) In → window.print() → chọn máy in/cài đặt (hộp thoại hệ thống)
   c) In lại → window.print() lại (modal vẫn mở)
```

## CSS @media print

### Đặc điểm:

1. **Hide web UI:** Ẩn toàn bộ giao diện web, chỉ in `#receipt-print-container`
2. **Paper size:** 80mm x auto (máy in nhiệt), fallback A4
3. **Fonts:** Monospace để căn chuỗi
4. **Layout:** Flexbox để căn chỉnh cột (Mô tả, SL, Thành tiền)
5. **Dashed lines:** Tách phần hóa đơn (monospace, dùng Unicode)

### In ở các định dạng:

- **Máy in nhiệt (80mm):** Khổ 80mm, chữ nhỏ, căn chỉnh cột
- **Máy in A4:** Khổ A4, căn chỉnh tương tự nhưng có thêm margin
- **PDF:** window.print() → "Print to PDF"

## Ưu Điểm So Với Mô Phỏng Hộp Thoại In

| Tiêu Chí               | Mô Phỏng (Cũ)               | window.print() (Mới)                            |
| ---------------------- | --------------------------- | ----------------------------------------------- |
| Hộp thoại in           | Tự thiết kế + Tailwind      | Hệ thống/Trình duyệt                            |
| Kiểm soát máy in       | Giới hạn (chỉ mock)         | Đầy đủ (OS quản lý)                             |
| Hỗ trợ cài đặt in      | Giới hạn (mock)             | Đầy đủ (In kích thước, trang, chiều, màu, etc.) |
| Trải nghiệm người dùng | Khác với trình duyệt thường | Quen thuộc, consistent                          |
| Kích thước modal       | Lớn (cần 2 panel)           | Nhỏ (chỉ preview)                               |
| Code phức tạp          | Cao (mock dialog)           | Thấp (dùng native)                              |
| In lại                 | Cần close + reopen          | Một cú click                                    |
| Biết người dùng đã in  | Không                       | Không (nhưng không cần biết)                    |

## Cách Sử Dụng Trong POSOrdering.tsx

```tsx
// 1. Import
import { PrintReceiptModal } from "../PrintReceiptModal";

// 2. State
const [printReceiptOpen, setPrintReceiptOpen] = useState(false);

// 3. Khi nhấn "Thanh toán"
const handleCheckout = async () => {
  // Ghi nhận giao dịch (gọi API, lưu database)
  const orderResult = await saveOrder({
    items: cart,
    totalAmount,
    paymentMethod: selectedPaymentMethod,
  });

  // Nếu thanh toán thành công, mở print modal
  if (orderResult.success) {
    setPrintReceiptOpen(true);
    // Reset cart, tables, etc.
  }
};

// 4. Render modal
<PrintReceiptModal
  open={printReceiptOpen}
  onClose={() => setPrintReceiptOpen(false)}
  items={cart.map((item) => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
  }))}
  totalAmount={totalAmount}
  orderNumber={orderNumber}
  customerName={selectedCustomer?.name}
  paymentMethod={selectedPaymentMethod}
  tableNumber={selectedTable?.number}
  waiterName={currentUser?.name}
/>;
```

## Mở Rộng & Tùy Chỉnh

### 1. Thay Đổi Nội Dung Hóa Đơn

Sửa `ReceiptPrintContent.tsx`:

- Thêm logo công ty
- Thêm thông tin khác (VAT, QR code, etc.)
- Thay đổi định dạng, màu sắc
- Thêm các dòng tính thuế

### 2. Hỗ Trợ Nhiều Loại Máy In

Thêm CSS @media print cho từng loại:

```css
@media print {
  /* Máy in nhiệt 80mm */
  @page {
    size: 80mm auto;
  }

  /* Hoặc A4 */
  @page {
    size: A4;
  }
}
```

### 3. Thêm Các Tính Năng

- **In lại hóa đơn cũ:** Lưu `orderNumber`, fetch hóa đơn, mở modal
- **Email hóa đơn:** Export HTML hóa đơn → gửi email
- **Lưu hóa đơn PDF:** Dùng thư viện như `html2pdf`
- **QR code:** Thêm `qrcode` library vào ReceiptPrintContent

## Giới Hạn Kỹ Thuật

1. **Không biết người dùng đã in hay chưa:** window.print() không có callback
   - Giải pháp: Không cần biết - đơn hàng đã saved trước
2. **Định dạng in tuỳ thuộc trình duyệt/OS:** Không kiểm soát 100%
   - Giải pháp: CSS @media print, test trên target browsers
3. **In trực tiếp không qua dialog:** Dùng API khác (ưu tiên window.print())
   - Giải pháp: Nếu cần, dùng backend để trigger in qua LAN

## Tổng Kết

Hệ thống in hóa đơn mới:
✅ Giống KiotViet (ghi nhận trước, in tùy chọn)
✅ Sử dụng window.print() (native, reliable)
✅ CSS @media print (toàn kiểm soát nội dung)
✅ Hỗ trợ in lại (không cần reload)
✅ Code đơn giản, dễ mở rộng
✅ Trải nghiệm người dùng tốt (familiar print dialog)
