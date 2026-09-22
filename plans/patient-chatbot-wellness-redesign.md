# Kế hoạch Redesign toàn bộ PatientPage (Chatbot trung tâm — Phong cách Wellness)

## Context
Người dùng yêu cầu thiết kế lại toàn bộ trang bệnh nhân (`PatientPage`):
- **Bỏ header to**: Loại bỏ thanh Header và dải Tab đồ sộ kiểu portal quản lý.
- **Lấy Chatbot làm trọng tâm**: Khung chat chiếm trọn không gian trải nghiệm (100dvh).
- **Thanh điều hướng**: Chọn phương án **Floating Dock / Tab bar đáy** nhỏ gọn, thanh thoát, nổi ở đáy màn hình để chuyển nhanh giữa các tính năng:
  1. Trò chuyện AI (Chat)
  2. Đặt lịch khám (Booking)
  3. Lịch hẹn (Appointments)
  4. Hồ sơ sức khỏe (Profile)
  5. Đăng xuất (Logout)
- **Match phong cách Wellness hiện đại với Login**:
  - Palette: Nền kem ấm `#FAF7F0`, mảng sage chuyển sắc `#F5EFE6` / `#E8EFEA`, viền mềm `#D8E2DC`, màu nhấn xanh lá rừng sâu `#2F4838`, phụ đề than thảo mộc `#1D2A24` & `#5B6B62`, cảnh báo cấp cứu `#BA3C3C` / `#FDF2F2`.
  - Typography: Sans-serif hệ thống sắc nét, kết hợp điểm xuyết serif nhẹ cho tiêu đề/lời chào.
  - Hình khối & bề mặt: Bo góc mềm mại (16px–24px, pill-shape), không viền thô, shadow tán nhẹ.

---

## Chi tiết thiết kế và giải pháp kỹ thuật

### 1. Cấu trúc Layout (Chatbot-Centric + Floating Dock)
- **Không gian chính**: Toàn màn hình (`min-height: 100dvh`, nền `#FAF7F0`), bố cục tập trung 100% vào nội dung:
  - Khi ở chế độ `chat`:
    - Layout 2 cột tinh tế (trên desktop):
      - Cột trái (Sidebar hội thoại mỏng, có thể ẩn/hiện hoặc thu gọn): Danh sách hội thoại trước đây (`/conversations`), nút "Tạo hội thoại mới" (`#2F4838`), thông tin bệnh nhân thu nhỏ và logo Serene Health nhỏ nhẹ.
      - Cột phải: Toàn bộ khung chat `PatientChat` với thanh trạng thái an toàn kín đáo (bao gồm nút gọi 115 dạng badge nhỏ), bong bóng tin nhắn tông màu kem/sage, và composer dạng floating card với nút gửi tròn.
  - Khi chuyển sang `booking`, `appointments`, `profile`:
    - Hiển thị dưới dạng modal trượt (sheet/overlay) hoặc view trung tâm gọn gàng nằm trên nền kem, có nút đóng/quay lại chat nhanh chóng.
- **Floating Dock / Tab bar đáy**:
  - Nằm cố định ở đáy màn hình (`position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%)`).
  - Thiết kế dạng pill nổi (`background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(16px); border: 1px solid #D8E2DC; border-radius: 999px; box-shadow: 0 10px 30px rgba(47, 72, 56, 0.08)`).
  - Gồm 5 nút biểu tượng thanh thoát:
    - 💬 Trò chuyện AI (Active mặc định)
    - 📅 Đặt lịch khám
    - 📋 Lịch hẹn
    - 👤 Hồ sơ sức khỏe
    - 🚪 Đăng xuất (có tooltip/icon nhã nhặn)

### 2. Các file sẽ chỉnh sửa
1. `apps/web/src/pages/mobile-user/PatientPage.tsx`:
   - Gỡ bỏ hoàn toàn `<header className="patient-header">` và `<nav className="patient-nav">`.
   - Chuyển `tab` điều khiển bằng Floating Dock thanh lịch ở đáy.
   - Thêm nút thu gọn/mở rộng sidebar danh sách hội thoại để tối đa hóa không gian chat.
   - Tích hợp banner lưu ý an toàn y tế và nút gọi 115 thành thanh công cụ nhỏ gọn trên đầu khung chat.
2. `apps/web/src/pages/mobile-user/PatientPage.css`:
   - Thay thế toàn bộ phong cách màu xanh than kỹ thuật số (`--sh-navy-...`, `--sh-blue-...`) bằng tokens Wellness (`--sh-cream-...`, `--sh-sage-...`, `--sh-forest-...`).
   - Xây dựng layout chat toàn màn hình, floating bottom dock, modal card đặt lịch và danh sách lịch hẹn mềm mại.
   - Đảm bảo responsive tối ưu trên cả desktop lẫn mobile (dưới 768px tự động tối ưu floating bar đáy và composer chạm).
3. `apps/web/src/pages/mobile-user/PatientChat.tsx`:
   - Tinh chỉnh header phòng chat: bỏ màu xanh kỹ thuật số, dùng tông xanh rừng `#2F4838` và sage `#6C8270`.
   - Bong bóng tin nhắn ChatBubble và ô nhập liệu textarea được tạo hình ấm cúng, focus ring xanh rừng.
4. `apps/web/src/pages/mobile-user/BookingForm.tsx` & Các view bổ trợ:
   - Cập nhật form đặt lịch theo màu sắc Wellness, input bo tròn, button xanh rừng sâu.

---

## Bảo toàn logic & Nghiệp vụ (Strict Invariance)
- **Chat Streaming**: Giữ nguyên 100% `useChat` từ `@ai-sdk/react`, `DefaultChatTransport`, gửi tin nhắn qua `${API_URL}/ai/chat`, khôi phục draft khi đứt mạng, nút stop stream.
- **Escalation**: Giữ nguyên logic kiểm tra `consultation.status !== 'AI_CHAT'` để hiển thị tin nhắn bác sĩ và trạng thái chuyển tiếp.
- **Đặt lịch**: Giữ nguyên gọi API `/catalog/clinics`, `/catalog/services`, `/catalog/doctors`, `/availability` và `POST /appointments`.
- **Lịch hẹn & Hồ sơ**: Giữ nguyên `PATCH /appointments/:id/cancel` và `PATCH /profile`.
- **Xác thực**: Giữ nguyên `logout()` và thông tin người dùng từ `useAuth()`.

---

## Kế hoạch kiểm chứng (Verification)
1. **Biên dịch & Kiểu**:
   - `npm --prefix apps/web run typecheck`
   - `npm --prefix apps/web run build`
2. **Kiểm tra trực quan bằng Playwright MCP**:
   - Chụp ảnh màn hình Desktop (1440x900): Kiểm tra layout chat toàn màn hình, danh sách hội thoại bên trái, floating dock ở đáy, tông màu kem/sage.
   - Chụp ảnh màn hình Mobile (390x844): Kiểm tra tính đáp ứng, dock đáy không che composer nhập tin nhắn.
   - Kiểm tra click chuyển tab sang Đặt lịch, Lịch hẹn, Hồ sơ trên dock đáy.
   - Kiểm tra gõ tin nhắn, focus ring và các trạng thái nút.
