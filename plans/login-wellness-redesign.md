# Redesign trang đăng nhập — Wellness hiện đại

## Context
Người dùng muốn trang đăng nhập Serene Health hiện đại và đẹp hơn, đã chọn hướng Wellness hiện đại: nền kem, xanh sage, typography nổi bật, nhiều khoảng thở. Đây là thay đổi giao diện của luồng hiện có, không phải thay đổi kiến trúc xác thực.

## Hướng thiết kế đã chọn
- Desktop chia hai vùng: phần thương hiệu có điểm nhấn thị giác nhẹ nhàng và phần biểu mẫu rõ ràng.
- Mobile ưu tiên biểu mẫu một cột, rút gọn phần trang trí để không đẩy thao tác đăng nhập xuống quá xa.
- Dùng màu kem, sage và xanh đậm cho văn bản/nút để giữ độ tương phản; không dùng chữ xanh nhạt cho nội dung quan trọng.
- Giữ nguyên xác thực, điều hướng và chức năng hiện có; không thêm dependency, API hoặc chức năng đăng nhập mới.

## Phạm vi và cách thực hiện
1. Khi được duyệt và rời plan mode, lưu bản kế hoạch vào `plans/login-wellness-redesign.md` trước khi sửa mã. Working tree có nhiều thay đổi chưa commit; chỉ sửa phần giao diện auth, không ghi đè các thay đổi hiện có.
2. Sửa `apps/web/src/pages/auth/AuthPage.tsx`:
   - Tổ chức lại `BrandIllustration`, `AuthHeader` và shell. Bên trái có logo, thông điệp “Một khởi đầu nhẹ nhàng cho sức khỏe của bạn” và minh họa thực vật/hình khối mềm bằng CSS, không phụ thuộc ảnh tải ngoài. Bên phải là form với tiêu đề “Chào mừng trở lại”, mô tả ngắn và CTA rõ ràng.
   - Tái sử dụng `SystemLogo` hiện có, chỉ tùy chỉnh màu trong phạm vi trang; không sửa component dùng chung. Giữ Inter hiện có, kết hợp serif hệ thống cho tiêu đề thương hiệu để tạo cảm giác ấm áp.
   - Bỏ state `layoutScale`, effect resize và inline CSS scale. Dùng bố cục CSS tự thích nghi; không thu nhỏ cả form bằng transform.
   - Giữ `TextField`, `FieldError`, `showMode`, `submitLogin`, `submitSignup`, `apiMessage` và `useAuth` theo hành vi hiện tại. Không sửa API, payload, quy tắc mật khẩu hoặc chuyển hướng theo vai trò.
   - Đồng bộ giao diện đăng ký và quên mật khẩu vì nằm chung shell; tiêu đề phù hợp từng chế độ. Giữ đầy đủ trường đăng ký, thông báo khôi phục mật khẩu chưa hỗ trợ, nút quay lại và lỗi/loading hiện có.
3. Thay phần CSS auth trong `apps/web/src/pages/auth/AuthPage.css` bằng stylesheet ngắn, có phạm vi `.auth-page`:
   - Nền kem `#FBF9F5`, mảng sage nhạt `#E8EFE9`, nút xanh đậm `#365743`, chữ `#1C2822`.
   - Desktop hai cột, khoảng đệm linh hoạt, form đăng nhập rộng tối đa khoảng 420px; không lồng nhiều card hoặc dùng gradient/glassmorphism dày đặc.
   - Dưới 900px chuyển một cột, rút gọn phần thương hiệu. Đăng ký có thể cuộn tự nhiên; không khóa chiều cao khiến mất trường hoặc nút.
   - Loại bỏ selector global `body`, `html`, `#root`, `*` khỏi stylesheet auth; không thay đổi cách bố trí dashboard.
   - Input/nút tối thiểu 44px, label rõ, focus-visible đủ tương phản, lỗi không chỉ phân biệt bằng màu. Giữ `aria-invalid`, `aria-describedby`, `role="alert"`, autocomplete và thao tác bàn phím.
   - Chuyển trạng thái hover/focus nhẹ; tôn trọng `prefers-reduced-motion` nếu thêm animation.

## Tái sử dụng và giới hạn
- `apps/web/src/auth/AuthContext.tsx`: giữ nguyên `login`/`register` và session.
- `apps/web/src/App.tsx`: giữ nguyên GuestRoute và điều hướng theo vai trò.
- `apps/web/src/components/brand/SystemLogo.tsx`: tái sử dụng, không sửa toàn cục.
- Không thêm dependency, social login, remember-me, API reset mật khẩu, số liệu/nhận xét giả hoặc thay đổi các trang dashboard.

## Kiểm chứng
- Chạy `npm --prefix apps/web run typecheck` và `npm --prefix apps/web run build`; không chạy lint thủ công.
- Kiểm tra `/login` bằng Playwright ở desktop 1440×900, tablet 768×1024, mobile 390×844 và chiều ngang 320px: không tràn ngang, không cắt form, đăng ký cuộn tới nút submit, focus bàn phím hiển thị rõ; thử zoom 200% và viewport thấp. Vite mặc định port 5173; kiểm tra server sẵn có trước khi khởi chạy thêm.
- Kiểm tra cả ba chế độ; submit rỗng/email sai; thông báo lỗi API và trạng thái đang gửi qua API mock trong trình duyệt. Không tạo tài khoản thật hay dùng thông tin đăng nhập thật để kiểm tra giao diện.
- Nếu thêm logic UI mới, để lại một smoke check chạy lại được bằng công cụ hiện có, không thêm test framework. Không thay đổi logic nghiệp vụ chỉ để tạo bài test.
- Chụp ảnh giao diện sau sửa; kiểm tra diff chỉ chạm phạm vi đã duyệt và không có request/console error mới.
- Nếu cần khởi chạy server, báo ngay port/PID/lệnh dừng; kết thúc kiểm tra hỏi người dùng giữ hay tắt. Không đọc file môi trường hoặc xuất thông tin đăng nhập trong log/ảnh.

## Tiêu chí hoàn tất
Trang đăng nhập thể hiện rõ phong cách Wellness đã chọn, dễ dùng trên desktop/mobile, đăng ký và quên mật khẩu không bị hỏng, xác thực giữ nguyên và kết quả kiểm tra được báo đúng thực tế.
