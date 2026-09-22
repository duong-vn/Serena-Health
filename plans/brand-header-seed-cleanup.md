# Kế hoạch Cập nhật Favicon, Header Thương hiệu, Dữ liệu Đặt lịch & Bỏ Phí Khám

## 1. Yêu cầu chi tiết từ người dùng
1. **Thay đổi Favicon**: Thay thế favicon tím/cũ bằng biểu tượng Serene Health chuẩn phong cách Wellness (xanh rừng sâu `#2F4838`, sage `#6C8270`).
2. **Nâng cấp phần Header/Sidebar Brand [Image #4]**:
   - Thay thế biểu tượng 3 viên kim cương màu xanh dương lạc tông bằng logo Serene Health cao cấp (mầm lá thảo mộc / hoa chữ thập y tế mềm mại tông xanh rừng).
   - Thiết kế container logo dạng badge tinh tế (`.patient-brand-link`), typography sang trọng và cân đối.
   - Nút thu gọn `<` (`.btn-toggle-sidebar`) được bo tròn mềm mại dạng pill/circle, viền thanh mảnh, hover mượt mà.
3. **Seed dữ liệu dồi dào phục vụ đặt lịch**:
   - Bổ sung nhiều chuyên khoa mới: Da liễu, Thần kinh, Cơ Xương Khớp, Đa khoa tổng quát.
   - Thêm 6-7 bác sĩ đầy đủ thông tin, avatar, học vị trải đều trên cả 3 cơ sở (Chi nhánh A, Chi nhánh B, Chi nhánh C).
   - Thiết lập lịch trực (Schedules) cho cả ca Sáng (08:00–12:00) và ca Chiều (13:30–17:30) trên các ngày trong tuần và cuối tuần để người dùng luôn có khung giờ trống khi chọn bất kỳ ngày nào.
4. **Bỏ phần Phí tư vấn khám ở Bác sĩ**:
   - Gỡ bỏ hoàn toàn badge/pill "Phí tư vấn khám" trong thẻ thông tin Bác sĩ (`doctor-spotlight-card`).
   - Gỡ bỏ mục "Phí dịch vụ dự kiến" trong phiếu tóm tắt lịch hẹn (`booking-summary-voucher`).
   - Tinh chỉnh CSS để layout thẻ bác sĩ và phiếu tóm tắt hiển thị cân đối, thoáng đãng.

---

## 2. Kế hoạch triển khai kỹ thuật
1. **Cập nhật Favicon**: Tạo `apps/web/public/favicon.svg` mang nhận diện Serene Health.
2. **Cập nhật `SystemLogo.tsx` & CSS Header**:
   - Render SVG logo organic wellness với 2 cánh lá đan xen / hoa Serene trong bảng màu `#2F4838` và `#6C8270`.
   - Cập nhật `.patient-sidebar-brand`, `.patient-brand-link`, `.patient-brand-logo`, `.btn-toggle-sidebar` trong `PatientPage.css`.
3. **Cập nhật `BookingForm.tsx` & `PatientPage.css`**:
   - Loại bỏ hiển thị phí khám trong `doctor-spotlight-card` và `booking-summary-voucher`.
   - Tối ưu khoảng cách và cấu trúc thẻ bác sĩ.
4. **Cập nhật & Chạy Seed Script**:
   - Sửa file `apps/api/prisma/seed.ts` để thêm 7 bác sĩ, 7 chuyên khoa, và lịch trực dồi dào.
   - Chạy `npm run db:seed` để cập nhật cơ sở dữ liệu.
5. **Kiểm thử trực quan với Playwright**:
   - Chụp ảnh header mới để đối chiếu trực tiếp với Image #4.
   - Mở form đặt lịch kiểm tra danh sách bác sĩ mới, cơ sở mới và các khung giờ trống dồi dào không còn hiển thị phí khám.
