# Kiểm tra tích hợp frontend và backend — 22/09/2026

## Phạm vi và giới hạn

Kiểm tra working tree hiện tại, bao gồm các thay đổi chưa commit. Đối chiếu React, API client, xác thực, các màn hình theo vai trò và NestJS. Không sửa mã ứng dụng, không chạy migration/seed, không đọc file môi trường hoặc thông tin xác thực.

Kiểm tra trình duyệt dùng các server đã chạy sẵn tại `localhost:5173` và `localhost:3000`; không khởi chạy server mới. Chưa có phiên đăng nhập tài khoản thử nghiệm, nên chưa kiểm thử end-to-end các thao tác theo vai trò. Các phát hiện được phân biệt giữa tái hiện runtime và đối chiếu mã nguồn.

## Kết quả kiểm chứng

- `npm run typecheck`: frontend và backend đều thành công.
- `npm test`: 30/30 test API và 3/3 test frontend thành công.
- `npm run build:web`: thành công; cảnh báo bundle JavaScript 928.62 kB, lớn hơn ngưỡng 500 kB.
- GET trực tiếp `http://localhost:3000/api/v1/catalog/clinics`: HTTP 200, JSON array có 3 phần tử.
- GET `http://localhost:5173/api/v1/catalog/clinics`: HTTP 200 nhưng là HTML, không phải JSON.
- Trang đăng nhập tự gọi `/manager/doctors?page=1&pageSize=100` và nhận HTTP 401; chế độ development gọi hai lần.
- Thử phiên không hợp lệ trong sessionStorage: các request xác thực đã hoàn tất và phiên đã bị xóa, nhưng giao diện vẫn đứng ở “Đang xác thực phiên đăng nhập...”. Đã tải lại để trả trình duyệt về trang đăng nhập không có phiên.
- Gửi payload đăng ký không hợp lệ, bị chặn bởi validation trước khi ghi dữ liệu: backend trả HTTP 400, xác nhận quy tắc mật khẩu tối thiểu 10 ký tự và bắt buộc chữ hoa, chữ thường, chữ số.

## Các lỗi nền tảng

### 1. P1 — Kẹt màn hình xác thực khi phiên hết hạn hoặc request `/auth/me` thất bại

**Bằng chứng:** `apps/web/src/auth/AuthContext.tsx:87-110`.

Giá trị context được tạo bằng `useMemo`, chứa `loading`, nhưng dependency chỉ có `[logout, user]`. Khi xác thực thất bại, `user` vẫn là `null`, còn `loading` chuyển từ `true` sang `false`. Memo không chạy lại, nên ProtectedRoute/GuestRoute vẫn nhận `loading: true`.

**Tái hiện runtime:** đặt một giá trị phiên giả trong sessionStorage rồi tải lại. Tất cả request đã hoàn tất, phiên bị xóa, nhưng trang vẫn hiện loader. Đây không phải backend không phản hồi.

**Hướng sửa:** thêm `loading` vào dependency hoặc bỏ memo không cần thiết; thêm regression test cho `/auth/me` trả 401 và lỗi mạng.

### 2. P1 — Response 401 cũ có thể xóa phiên vừa đăng nhập

**Bằng chứng:** `apps/web/src/api/client.ts:41-72`; `apps/web/src/App.tsx:43`.

Mọi response 401 đều xóa phiên hiện tại, không kiểm tra request đó đã dùng phiên nào. DoctorsDataProvider nằm ngoài toàn bộ protected routes, nên phát sinh request manager ngay khi chưa đăng nhập.

**Tái hiện bằng Node assertion:** bắt đầu request không có phiên, thiết lập phiên mới, sau đó trả 401 cho request cũ. Phiên mới bị xóa. Trình duyệt cũng xác nhận request manager không xác thực xuất hiện ngay trang đăng nhập.

**Hướng sửa:** chỉ xử lý hết phiên nếu phiên hiện tại trùng phiên của request; chỉ mount/fetch dữ liệu manager khi đã xác thực đúng vai trò.

### 3. P1 — Chat bác sĩ dùng WebSocket thuần với backend Socket.IO

**Bằng chứng:** `apps/web/src/api/useChatSocket.ts:39-65`; `apps/api/src/consultations/human-chat.gateway.ts:20,38-46,57-70`.

Frontend mở `new WebSocket(.../human-chat?token=...)` và gửi JSON tự định nghĩa. Backend dùng namespace Socket.IO `/human-chat`, đọc thông tin xác thực từ `handshake.auth.token` và nhận sự kiện qua giao thức Socket.IO. Hai giao thức và cơ chế xác thực không tương thích. Dependency `socket.io-client` đã có trong `apps/web/package.json`, trái với comment trong hook.

**Ảnh hưởng:** chat realtime phía bác sĩ không kết nối/gửi tin đúng; việc REST tải được lịch sử không chứng minh socket hoạt động.

**Mức kiểm chứng:** xác nhận bằng đối chiếu giao thức trong mã; chưa thử hội thoại có tài khoản.

**Hướng sửa:** dùng `socket.io-client` với namespace và `auth` đúng; xử lý join acknowledgement, lỗi gửi và reconnect.

### 4. P2 — API URL mặc định không dùng được với Vite hiện tại

**Bằng chứng:** `apps/web/src/api/client.ts:3`; `apps/web/vite.config.js:10-13`.

Client mặc định dùng `/api/v1`, nhưng Vite không khai báo proxy. Khi thiếu `VITE_API_URL`, request đi vào frontend và nhận HTML thay vì API JSON; client báo “Phản hồi từ máy chủ không hợp lệ.”

**Tái hiện runtime:** cùng endpoint clinics, cổng 5173 trả HTML, cổng 3000 trả JSON. Phiên frontend đang chạy thực tế gọi URL backend tuyệt đối, nên đây là lỗi cấu hình dự phòng, không phải nguyên nhân của mọi request hiện tại.

**Hướng sửa:** thêm dev proxy hoặc bắt buộc cấu hình URL API rõ ràng; production cần reverse proxy tương ứng nếu dùng đường dẫn tương đối.

### 5. P2 — Form đăng ký và DTO backend không cùng quy tắc

**Bằng chứng:** `apps/web/src/pages/auth/AuthPage.tsx:183-190,274`; `apps/api/src/auth/dto/register.dto.ts:17-25`.

Frontend hướng dẫn mật khẩu tối thiểu 8 ký tự, trong khi backend yêu cầu 10–128 ký tự, có chữ hoa, chữ thường và chữ số. Frontend cho tên dài tới 255 ký tự, backend chỉ nhận 2–160 ký tự.

**Ảnh hưởng:** người dùng điền đúng hướng dẫn vẫn bị HTTP 400; lỗi backend hiển thị bằng tiếng Anh.

**Mức kiểm chứng:** đối chiếu mã và phản hồi validation HTTP 400 thực tế.

**Hướng sửa:** thống nhất validation tại form với DTO, giữ backend là lớp kiểm tra bắt buộc.

## Bổ sung sau đối chiếu các màn hình

### Các contract chính đã xác nhận

- **Khôi phục phiên:** `AuthContext.tsx:30,72` mong đợi `{ user }`, nhưng `apps/api/src/auth/auth.service.ts:63-67` trả trực tiếp user. Phản hồi thành công vẫn không khôi phục đúng người dùng. Cần thống nhất một kiểu phản hồi, không dùng `any` hoặc fallback che giấu sai contract.
- **Doctor dashboard:** `DashboardTab.tsx:67-69` đọc `.items.filter()` và `.items.length`, trong khi `doctor.controller.ts:18-53` trả mảng. Khi nhận mảng, dashboard có thể ném TypeError ngay trong render, không chỉ hiển thị số 0.
- **Doctor patients/schedule/consultations:** `PatientListTab.tsx:35-36`, `DoctorSchedulePage.tsx:35-36`, `LiveConsultationTab.tsx:31-32` mong đợi `{ items }`; controller trả mảng nên danh sách rỗng.
- **Doctor appointments:** `AppointmentListTab.tsx:32,52` và `DashboardTab.tsx:62` dùng `/doctor/appointments`; route thực tế là `/appointments` tại `appointments.controller.ts:14-20`, trả mảng.
- **Hồ sơ bệnh nhân:** `PatientListTab.tsx:72,82` đọc `medicalHistory` và `allergies` ở root; `doctor.controller.ts:30` đặt chúng trong `patientProfile`. Sau khi sửa lỗi envelope, mở hồ sơ vẫn có thể crash nếu chưa sửa mapping.
- **Danh sách bác sĩ:** `DoctorsDataContext.tsx:65-93` đọc `schedule` và thông tin user ở root; `manager.service.ts:41-48` trả `schedules` và `user`. Exception trong mapping được Promise.catch xử lý thành lỗi tải dữ liệu; không nên mô tả đây luôn là crash React không được bắt.
- **Danh mục quản lý:** `DoctorsDataContext.tsx:136-142` đọc `.items` từ hai endpoint catalog trả mảng. Lỗi mapping bác sĩ có thể xảy ra trước và che lỗi này; sau khi vượt qua mapping, state catalog thành undefined, thao tác lưu thất bại ở `.find()`.
- **Tạo bác sĩ:** `DoctorsDataContext.tsx:102` gửi `active`, nhưng `CreateDoctorDto` tại `manager.controller.ts:9-26` không cho phép trường này. Global validation từ chối payload. Ngoài ra `manager.service.ts:64-89` trả User với doctorProfile lồng, không phải hình dạng mà mapper frontend đang chờ.
- **Xóa bác sĩ:** `manager.controller.ts:45-47` không trả JSON; API client từ chối body rỗng dù HTTP thành công. Cần xử lý response rỗng theo contract cụ thể, không chấp nhận mọi HTTP 200 HTML là thành công.
- **Chứng chỉ hành nghề:** `DoctorsDataContext.tsx:91,113` dùng email làm username rồi gửi username thành licenseNumber. Sau khi sửa các blocker mapping, lưu chỉnh sửa có thể ghi sai chứng chỉ.
- **Ca tư vấn:** `LiveConsultationTab.tsx:10,90` dùng OPEN/CLAIMED, trong khi `consultations.service.ts:37-45,53` dùng ESCALATION_REQUESTED/ASSIGNED_TO_DOCTOR/DOCTOR_CHAT. Đồng thời `doctor.controller.ts:46` chỉ lấy ca đã gán, bỏ ca chưa có doctorId mà hành động claim cần nhận.
- **Giám sát chatbot:** `ChatbotMonitorPage.tsx:52-53` mong đợi `{ items }` từ danh sách mảng; sau khi sửa danh sách, endpoint messages vẫn chặn MANAGER tại `consultations.controller.ts:41`. UI nuốt lỗi tải tin tại dòng 99. Không tự mở rộng quyền trong assertParticipant dùng chung cho gửi tin; cần xác định chính sách truy cập và endpoint đọc riêng trước.
- **Dữ liệu không phải số liệu thật:** `DoctorDetailPage.tsx:93-109` có hai lịch hẹn hardcode; `DoctorsDataContext.tsx:68-90` gán chỉ số hiệu suất bằng 0; `DoctorFormSections.tsx:1` lấy dropdown từ mock thay vì catalog.

### Bổ sung phân hệ Patient

- **P2 — Cho gửi tin khi chưa có bác sĩ tiếp nhận:** `PatientChat.tsx:22` coi mọi trạng thái khác AI_CHAT là human chat; dòng 78–90 chỉ chặn gửi khi COMPLETED. Ngay sau escalation, trạng thái ESCALATION_REQUESTED vẫn cho gửi POST tin nhắn, nhưng `consultations.service.ts:70-71` chỉ cho phép ASSIGNED_TO_DOCTOR hoặc DOCTOR_CHAT và trả 409 cho trạng thái chờ. Cần hiển thị trạng thái chờ tiếp nhận, khóa gửi trong trạng thái này và cập nhật trạng thái khi bác sĩ nhận ca.
- **P2 — Không chờ tải trạng thái consultation:** `PatientChat.tsx:13-18` chỉ xử lý loading/error của lịch sử tin nhắn, bỏ qua loading/error của `/consultations`. Khi lịch sử tải xong trước hoặc request consultation lỗi, `consultation` là undefined và `ChatSession` hiển thị chế độ AI dù ca thực tế có thể đã chuyển bác sĩ. Cần phân biệt chưa xác định trạng thái với chưa có ca chuyển tiếp; không cho gửi theo chế độ suy đoán.

Các phát hiện này được đối chiếu mã nguồn; chưa tái hiện với tài khoản bệnh nhân.

### Bổ sung phân hệ Expert

- **P2 — Độ dài flagReason không khớp:** `ExpertPage.tsx:36` cho nhập tối đa 500 ký tự; `apps/api/src/expert/dto/review.dto.ts:8` giới hạn 255. Nội dung 256–500 ký tự hợp lệ theo form nhưng bị backend trả 400.
- **P2 — Không chỉnh sửa được ghi chú đánh giá đã tồn tại:** `ExpertPage.tsx:30-36` luôn POST đánh giá mới. `expert.service.ts:24-32` trả 409 khi trùng đánh giá; UI chỉ có thao tác đánh dấu RESOLVED, không có luồng PATCH ghi chú dù backend hỗ trợ. Người dùng mở lại hội thoại và muốn cập nhật đánh giá sẽ bị chặn.

### Đính chính mức xác nhận

Không kết luận Patient/Expert hoàn toàn không có lỗi chỉ vì một số endpoint dùng đúng mảng. Chưa kiểm thử end-to-end với tài khoản của từng vai trò. Request manager với token hợp lệ nhưng sai vai trò trả 403, không tự xóa phiên như 401; lỗi mất phiên do response 401 cũ là một race riêng. Các blocker phía trước có thể che lỗi phía sau, nên không mô tả mọi lỗi tiềm ẩn đều đã tái hiện qua UI.

Báo cáo này là bản tổng hợp các phát hiện đã đối chiếu, không phải xác nhận rằng toàn bộ 29 mục do agent đề xuất đều đã được kiểm chứng độc lập. Không coi menu cố ý vô hiệu hóa, file mock không sử dụng hoặc danh sách chứa tài khoản inactive là lỗi nghiệp vụ khi chưa có yêu cầu tương ứng.

## Lưu ý về độ bao phủ test

Ba test frontend hiện chỉ kiểm tra lưu phiên, header xác thực và xử lý 401 đơn giản. Chúng không render AuthProvider, không kiểm tra race giữa request cũ và phiên mới, không kiểm tra contract theo màn hình hay Socket.IO. Vì vậy typecheck, test và build thành công không chứng minh tích hợp hoạt động đúng.
