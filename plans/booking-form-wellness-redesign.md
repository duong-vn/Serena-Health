# Kế hoạch Nâng cấp & Sửa lỗi Giao diện Form Đặt Lịch (BookingForm)

## 1. Nguyên nhân gốc rễ (Root Cause Analysis)
Người dùng phản ánh: *"chỉnh sửa giao diện phần form đặt lịch đi, thấy nó lỗi lỗi hay sao ý"*.
Qua kiểm tra mã nguồn `BookingForm.tsx` và `PatientPage.css`:
1. **Thiếu hoàn toàn CSS cho các component con trong Form**:
   - `BookingForm.tsx` sử dụng hơn 12 class CSS nhưng hoàn toàn không được định nghĩa trong `PatientPage.css`:
     - `.doctor-spotlight-card`, `.doctor-spotlight-info`, `.doctor-spotlight-avatar`, `.doctor-spotlight-name`, `.doctor-spotlight-bio`, `.doctor-fee-badge`
     - `.slot-chips-grid`, `.slot-chip`, `.slot-chip.is-selected`
     - `.booking-summary-voucher`, `.booking-confirm-checkbox`
     - `.portal-error`
   - Hậu quả: Thẻ thông tin bác sĩ hiển thị vỡ vụn (chữ raw, avatar không bo tròn, không viền, không nền).
2. **Khung giờ khám (Time Slots) bị "liệt" hiển thị tương tác**:
   - Nút slot render ra thẻ `<button>` mặc định của trình duyệt (xám xịt, viền nổi 3D thô).
   - Khi click chọn giờ, class `.is-selected` được gắn vào DOM nhưng **không có CSS**, người dùng không thấy phản hồi trực quan nào là mình đã chọn giờ thành công -> Tưởng form bị đơ/lỗi.
3. **Submit Button bị Disable ngầm (Anti-pattern UX)**:
   - Nút đặt lịch đặt thuộc tính `disabled={busy || !confirmed || !slot}`. Khi người dùng đã chọn giờ, nhập lý do nhưng chưa tích ô xác nhận, nút xám xịt và click vào không có bất kỳ thông báo hướng dẫn nào -> Người dùng tưởng trang bị lỗi hoặc nút bấm hỏng.
4. **Trải nghiệm chọn Bác sĩ & Giờ khám sơ sài**:
   - Dropdown chọn bác sĩ chỉ hiện mỗi tên (`item.user.fullName`), không hiển thị chuyên khoa hoặc cơ sở khám đi kèm.
   - Các khung giờ trống đổ ra dồn một đống không phân loại sáng/chiều, khó nhìn.
   - Ngày khám bắt buộc chọn bằng native date picker mà không có các nút chọn nhanh ("Hôm nay", "Ngày mai").

---

## 2. Giải pháp Cải tiến & Sửa đổi

### A. Cấu trúc lại `BookingForm.tsx` theo 3 Bước Trực quan (Step-by-step Flow)
- **Bước 1: Chọn Chuyên khoa & Bác sĩ**
  - Thanh chọn Chuyên khoa & Cơ sở phòng khám lọc mượt mà.
  - Dropdown bác sĩ hiển thị đầy đủ: `Bác sĩ [Tên] — [Chuyên khoa] ([Phòng khám])`.
  - **Doctor Spotlight Card**: Được thiết kế chuẩn Wellness với avatar tròn viền sage, badge chuyên khoa, địa chỉ phòng khám, và badge giá khám nổi bật minh bạch.
- **Bước 2: Lịch & Khung giờ khám**
  - Input ngày khám kèm 2 nút chọn nhanh: "Hôm nay", "Ngày mai".
  - Hiển thị thông báo trạng thái rõ ràng (đang tải, hết giờ, hoặc chưa chọn ngày).
  - Phân nhóm khung giờ khám thành **Buổi sáng (trước 12:00)** và **Buổi chiều (từ 12:00)**.
  - Mỗi chip giờ (`.slot-chip`) có icon đồng hồ, hiệu ứng hover mượt mà, và khi chọn (`.is-selected`) sẽ đổi sang màu xanh rừng `#2F4838`, chữ trắng, có icon checkmark `✓`.
- **Bước 3: Thông tin khám & Xác nhận**
  - Textarea lý do khám / triệu chứng có gợi ý rõ ràng và đếm ký tự.
  - **Phiếu tóm tắt lịch hẹn (Booking Voucher)**: Thiết kế dạng card mềm mại tông kem `#F5EFE6`, viền dash/solid nhã nhặn, liệt kê rõ: Bác sĩ, Thời gian khám, Địa chỉ phòng khám, Chi phí.
  - Checkbox xác nhận rõ ràng, click vào toàn bộ vùng label để check.
  - Nút bấm `Xác nhận đặt lịch`: Nếu chưa chọn giờ hoặc chưa check, khi hover/click sẽ có hướng dẫn cụ thể thay vì bị đơ.

### B. Bổ sung đầy đủ CSS Scoped trong `PatientPage.css`
- Định nghĩa toàn bộ hệ thống class cho `BookingForm`:
  - `.booking-form-wrapper`
  - `.booking-section-title`
  - `.doctor-spotlight-card`, `.doctor-spotlight-avatar`, `.doctor-fee-badge`
  - `.quick-date-group`, `.btn-quick-date`
  - `.slots-period-group`, `.slots-period-heading`, `.slot-chips-grid`, `.slot-chip`, `.slot-chip.is-selected`
  - `.booking-summary-voucher`, `.voucher-row`, `.booking-confirm-checkbox`
  - `.portal-error`
  - Responsive tối ưu cho màn hình di động (<640px).

---

## 3. Kế hoạch triển khai
1. Cập nhật `apps/web/src/pages/mobile-user/BookingForm.tsx` với cấu trúc UI/UX mới, phân loại giờ sáng/chiều, nút chọn nhanh ngày, và cải thiện validation.
2. Thêm toàn bộ CSS scoped cho `BookingForm` vào `apps/web/src/pages/mobile-user/PatientPage.css`.
3. Kiểm tra build `npm run build -w apps/web` đảm bảo không có lỗi type/lint/bundle.
4. Kiểm thử giao diện bằng Playwright để chụp ảnh xác thực form hoạt động hoàn hảo.
