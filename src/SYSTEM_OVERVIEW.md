# Coffee Shop Management System - Hệ thống Quản lý Quán Café

## Tổng quan hệ thống

Hệ thống quản lý quán café toàn diện được thiết kế dành cho chủ quán café Việt Nam, với giao diện thân thiện và dễ sử dụng.

## Các Module chính

### 1. **Tổng quan (Dashboard)** 
- Hiển thị các chỉ số KPI quan trọng: doanh thu, đơn hàng, khách hàng mới
- Biểu đồ doanh thu theo tuần
- Phân bổ danh mục sản phẩm
- Top sản phẩm bán chạy
- Cảnh báo tồn kho thấp và nguyên liệu sắp hết hạn
- Trạng thái hiện tại: nhân viên, đơn hàng, bàn

### 2. **Bán hàng & Sơ đồ bàn (POS)**
- Giao diện POS với menu sản phẩm
- Sơ đồ bàn trực quan với trạng thái (trống/có khách/đã đặt)
- Giỏ hàng với quản lý số lượng
- Thanh toán đa phương thức (tiền mặt, thẻ, chuyển khoản)
- Chọn khách hàng và áp dụng khuyến mãi

### 3. **Màn hình Pha chế (Kitchen Display)**
- Hiển thị đơn hàng theo trạng thái (mới, đang làm, hoàn thành)
- Đánh dấu độ ưu tiên (gấp/bình thường)
- Theo dõi thời gian xử lý
- Cập nhật trạng thái món ăn
- Bộ lọc theo quầy (cà phê, trà, đồ ăn)

### 4. **Kho & Nguyên liệu (Inventory)**
- Quản lý tồn kho theo thời gian thực
- Cảnh báo tồn kho thấp và sắp hết hạn
- Phân loại theo danh mục
- Tracking giá trị kho
- Quản lý tồn kho tối thiểu/tối đa
- Thông tin nhà cung cấp

### 5. **Nhập/Xuất/Trả hàng (Import/Export/Return)**
- Tạo phiếu nhập hàng từ nhà cung cấp
- Xuất hàng cho các bộ phận
- Xử lý trả hàng
- Theo dõi lịch sử giao dịch
- Báo cáo giá trị nhập/xuất

### 6. **Thực đơn & Công thức (Menu & Recipe)**
- Quản lý menu sản phẩm
- Định nghĩa công thức cho từng món
- Tính toán giá vốn và lợi nhuận
- Thời gian pha chế
- Phân loại danh mục

### 7. **Lịch làm việc (Scheduling)**
- Quản lý ca làm việc (sáng, chiều, tối)
- Lập lịch theo tuần cho nhân viên
- Phân ca linh hoạt
- Theo dõi giờ làm việc

### 8. **Nhân viên (Staff Management)**
- Thông tin nhân viên chi tiết
- Phân quyền theo vai trò (quản lý, pha chế, thu ngân, phục vụ)
- Theo dõi trạng thái làm việc
- Quản lý thông tin liên hệ

### 9. **Khách hàng & Khuyến mãi (Customers & Loyalty)**
- Chương trình tích điểm khách hàng
- Phân hạng thành viên (Vàng, Bạc, Đồng)
- Quản lý khuyến mãi và mã giảm giá
- Theo dõi lịch sử mua hàng
- Phân tích giá trị khách hàng

### 10. **Nhà cung cấp (Suppliers)**
- Danh sách nhà cung cấp
- Thông tin liên hệ chi tiết
- Theo dõi tổng giá trị mua hàng
- Phân loại theo danh mục nguyên liệu

### 11. **Tài chính (Finance)**
- Tổng quan doanh thu và chi phí
- Biểu đồ xu hướng tài chính
- Phân tích phương thức thanh toán
- Lịch sử giao dịch chi tiết
- Tính toán lợi nhuận

### 12. **Báo cáo (Reports)**
- Báo cáo doanh thu và lợi nhuận theo thời gian
- Top sản phẩm bán chạy
- Phân tích theo danh mục
- Hiệu suất nhân viên
- Xuất báo cáo PDF/Excel

## Thiết kế UI/UX

### Màu sắc chủ đạo
- **Nâu cà phê (Amber)**: Màu chính cho các nút và highlight
- **Beige/Kem**: Background nhẹ nhàng
- **Xanh lá/Xanh dương nhạt**: Các accent color
- **Trung tính**: Nền và text

### Typography
- Font system: Inter/Roboto (mặc định của trình duyệt)
- Hierarchy rõ ràng với h1, h2, h3
- Kích thước phù hợp cho màn hình desktop và mobile

### Components
- **Cards**: Thiết kế card-based cho dễ đọc
- **Badges**: Hiển thị trạng thái và phân loại
- **Charts**: Biểu đồ trực quan với Recharts
- **Tables**: Bảng dữ liệu responsive
- **Forms**: Form nhập liệu thân thiện

### Navigation
- Sidebar cố định với icon và label
- Responsive: thu gọn trên mobile
- Highlight trang hiện tại
- Phân nhóm logic các chức năng

## Tính năng nổi bật

1. **Responsive Design**: Hoạt động tốt trên desktop, tablet và mobile
2. **Dữ liệu giả lập**: Đầy đủ mock data để demo
3. **Biểu đồ trực quan**: Dễ hiểu, dễ phân tích
4. **Cảnh báo thông minh**: Tồn kho thấp, hết hạn, đơn gấp
5. **Workflow hoàn chỉnh**: Từ đặt hàng → pha chế → thanh toán → báo cáo

## Công nghệ sử dụng

- **React**: Framework chính
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **shadcn/ui**: Component library
- **Recharts**: Biểu đồ
- **Lucide React**: Icon set

## Hướng phát triển

1. **Backend Integration**: Kết nối API thực
2. **Authentication**: Đăng nhập và phân quyền
3. **Real-time Updates**: WebSocket cho kitchen display
4. **Print Integration**: In hóa đơn, phiếu
5. **Offline Mode**: Hoạt động khi mất kết nối
6. **Mobile App**: Ứng dụng di động native
7. **Analytics Dashboard**: Phân tích sâu hơn
8. **Multi-store**: Quản lý nhiều chi nhánh

## Phù hợp với

- Quán café nhỏ và vừa tại Việt Nam
- Chủ quán không chuyên về công nghệ
- Nhân viên có trình độ cơ bản
- Mô hình kinh doanh F&B truyền thống

---

**Lưu ý**: Đây là phiên bản demo với dữ liệu giả lập. Cần tích hợp backend và cơ sở dữ liệu thực tế để sử dụng trong môi trường production.
