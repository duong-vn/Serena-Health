# Kế hoạch Chuyển Floating Dock thành Profile Dropdown (PatientPage)

## Context
Người dùng yêu cầu:
- Bỏ phần thanh menu/dock đang nằm ở phía dưới ô chat (`.patient-floating-dock`).
- Tích hợp các lựa chọn điều hướng (Tư vấn AI, Đặt lịch khám, Lịch hẹn, Hồ sơ sức khỏe, Đăng xuất) thành menu **Dropdown** khi người dùng nhấn vào component **Profile**.

## Thiết kế chi tiết

### 1. Vị trí Component Profile & Trigger
- Đặt component Profile ở góc trên bên phải thanh `patient-top-strip` (cạnh nút Cấp cứu 115) và có thể trigger từ cả `patient-sidebar-user` ở chân sidebar:
  - Hiển thị: Avatar tròn chữ cái đầu (`userInitial`), họ tên người dùng (`user?.fullName`), icon mũi tên xoay nhẹ khi mở (`chevron-down`).
  - Có thể click để toggle mở/đóng Dropdown.
  - Tự động đóng khi click ra ngoài (`click outside`) hoặc nhấn phím `Escape`.

### 2. Nội dung Profile Dropdown
- **Header thông tin người dùng**:
  - Avatar, Họ và tên, Email tài khoản.
  - Badge trạng thái: "Bệnh nhân" / "Đang hoạt động".
- **Danh sách thao tác (Menu items)**:
  1. 💬 **Tư vấn AI**: Icon chat, kích hoạt quay về `tab === 'chat'`.
  2. 📅 **Đặt lịch khám**: Icon lịch, mở overlay Đặt lịch (`tab === 'booking'`).
  3. 📋 **Lịch hẹn của tôi**: Icon hồ sơ/đồng hồ, mở overlay Lịch hẹn (`tab === 'appointments'`), kèm badge số lượng lịch hẹn thực tế.
  4. 👤 **Hồ sơ sức khỏe**: Icon nhịp tim, mở overlay Hồ sơ cá nhân (`tab === 'profile'`).
- **Divider** phân tách nhẹ nhàng.
- 🚪 **Đăng xuất**: Nút đăng xuất tông màu nhấn nhẹ (`#BA3C3C` khi hover), gọi `logout()`.

### 3. Điều chỉnh giao diện & Bỏ phần thừa
- Xóa bỏ hoàn toàn phần `.patient-floating-dock` và các class dock ở dưới chân màn hình.
- Cập nhật `.patient-chat-canvas`: Giảm bottom padding từ `80px` xuống `20px`, mở rộng tối đa khung nhìn cho chat mà không bị cản trở.
- Cập nhật `.patient-overlay-view`: Giảm bottom padding từ `110px` xuống `40px`.
- Toàn bộ Dropdown được thiết kế đồng bộ ngôn ngữ **Wellness Sanctuary**:
  - Nền trắng ngà/surface `#FFFFFF` viền `#D8E2DC`.
  - Shadow nổi đa lớp cao cấp `0 12px 32px rgba(47, 72, 56, 0.12)`.
  - Item hover tông `#F5EFE6`, item đang active chuyển sang xanh rừng sâu `#2F4838`.

## Các file chỉnh sửa
1. `apps/web/src/pages/mobile-user/PatientPage.tsx`
2. `apps/web/src/pages/mobile-user/PatientPage.css`

## Kế hoạch kiểm chứng
1. `npm --prefix apps/web run build` để kiểm tra compile và typecheck TypeScript.
2. Kiểm tra tương tác mở/đóng dropdown, click chuyển tab, hiển thị badge số lịch hẹn, đóng khi click ra ngoài.
