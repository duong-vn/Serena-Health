# Hoàn thiện MVP chatbot dành cho bệnh nhân

## Context

Người dùng ưu tiên hoàn thành luồng bệnh nhân dùng chatbot, không hoàn thiện toàn bộ hệ thống phòng khám. Đã có màn hình `/patient`: trò chuyện, danh sách hội thoại, đặt lịch, lịch hẹn, hồ sơ; có backend Gemini streaming và lưu lịch sử. Đây là hoàn thiện luồng có sẵn, không xây lại giao diện hoặc đổi nhà cung cấp AI.

Đã dừng cây tiến trình Vite và NestJS theo yêu cầu: server PID 12900 (5173), PID 21196 (3000), cùng npm/Nest watcher cha. Kiểm tra sau dừng không còn cổng 3000/5173/4173 lắng nghe. Không dừng các Node process không xác định thuộc dự án.

## Phạm vi đề xuất

Một người bệnh có thể đăng ký/đăng nhập, vào thẳng chat, tạo/chọn hội thoại, gửi câu hỏi, nhận phản hồi AI streaming, dừng phản hồi và mở lại lịch sử sau tải lại trang. Giao diện tiếng Việt hoạt động trên mobile và desktop; xử lý lỗi thật, không dùng câu trả lời giả làm AI thành công.

Giữ các tab đặt lịch/hồ sơ hiện có nhưng không mở rộng nghiệp vụ trong đợt này. Chuyển tiếp bác sĩ chưa sẵn sàng end-to-end: không cho chatbot MVP hứa đã liên hệ bác sĩ hoặc cung cấp nút chuyển tiếp dẫn vào luồng hỏng. Hội thoại cũ đã chuyển tiếp được hiển thị lịch sử và trạng thái rõ ràng, không tự gửi trở lại AI. Người bệnh có thể tạo hội thoại AI mới. Không xóa dữ liệu hay loại bỏ backend hiện có.

## Các bước thực hiện

1. **Lưu kế hoạch vào repository khi bắt đầu triển khai**
   - Sao chép kế hoạch đã duyệt sang `plans/patient-chatbot-mvp.md` trước khi sửa mã. Trong plan mode hiện tại chỉ được ghi file kế hoạch của phiên.
   - Giữ nguyên thay đổi có sẵn của người dùng; không commit, migration, seed hoặc thêm dependency nếu chưa cần.

2. **Sửa nền tảng phiên đăng nhập**
   - `apps/web/src/auth/AuthContext.tsx`: nhận trực tiếp AuthUser từ `/auth/me`; sửa dependency `loading`; phân biệt hết phiên với lỗi mạng/server, có thông báo/thử lại thay vì tự xóa phiên hợp lệ vì mạng lỗi.
   - `apps/web/src/api/client.ts`: response 401 cũ không được xóa phiên mới; chỉ xử lý hết phiên khi request thuộc phiên đang lưu.
   - `apps/web/src/App.tsx` và phạm vi provider: chỉ mount DoctorsDataProvider trong các route manager đã xác thực. Patient/login không gọi API manager.
   - `apps/web/src/pages/auth/AuthPage.tsx`: đồng bộ giới hạn tên/mật khẩu với RegisterDto và hướng dẫn tiếng Việt.
   - `apps/web/vite.config.js`: dev proxy `/api` về backend local, dùng relative URL mặc định; giữ hỗ trợ URL API tuyệt đối được cấu hình sẵn.

3. **Hoàn thiện trải nghiệm chat bệnh nhân**
   - Tái sử dụng `PatientPage.tsx`, `PatientChat.tsx`, `PatientPage.css`, `ChatBubble`, `useApi`, `useChat` và `DefaultChatTransport` hiện có.
   - Mở mặc định tab chat; trạng thái chưa có hội thoại, đang tải, lỗi tải và thử lại rõ ràng. Tạo/chọn hội thoại đúng, refresh danh sách sau trao đổi khi cần.
   - Chờ dữ liệu lịch sử và trạng thái consultation trước khi chọn chế độ; không coi lỗi tải là hội thoại AI mới.
   - Gửi/stream/dừng có trạng thái rõ, không gửi trùng; lỗi không làm mất bản nháp hoặc giả báo thành công. Đổi hội thoại/dừng stream không trộn tin giữa các ca.
   - Lịch sử khớp dữ liệu server sau tải lại; giữ nội dung nhiều dòng, cuộn chat hợp lý và composer dùng được trên màn hình nhỏ.
   - Tạm không cung cấp thao tác chuyển tiếp bác sĩ chưa vận hành; hiển thị cách liên hệ cơ sở y tế và cảnh báo cấp cứu. Không đổi quyền xem dữ liệu y tế.

4. **Rà soát backend streaming trong phạm vi MVP**
   - `apps/api/src/ai/chatbot.service.ts`, `ai-tools.service.ts`, `prompt.js/ts` thực tế và tests liên quan: giữ Gemini, ownership checks, rate limit, emergencyGuidance, giới hạn đầu vào và không tự đặt lịch/chẩn đoán.
   - Đảm bảo streaming, dừng, timeout, lỗi provider và lưu lịch sử giải phóng generation lease đúng; kiểm tra contract của phiên bản AI SDK đã cài thay vì đoán API.
   - Đồng bộ capability của prompt/tools với MVP: không đề nghị thao tác chuyển bác sĩ trong UI nếu nút đó không được cung cấp. Không thêm RAG, provider hoặc kiến trúc mới.
   - Không đọc `.env` hay in khóa. Nếu cấu hình AI thiếu/sai, báo rõ đây là blocker môi trường, không giả lập thành công.

## Kiểm chứng và tiêu chí hoàn thành

- Viết regression tests bằng node:test/assert đang dùng: contract `/auth/me`, hết phiên/401 cũ, trạng thái chat khi consultation đang tải/lỗi/đã chuyển tiếp; backend persistence/abort/error theo stub provider nếu cần.
- Chạy `npm run typecheck`, `npm test`, `npm run build:web`.
- Kiểm thử trình duyệt: đăng nhập, F5 giữ phiên, đăng xuất; tạo hai hội thoại, gửi câu hỏi và thấy stream, chuyển hội thoại không lẫn tin, reload giữ lịch sử, dừng phản hồi, lỗi mạng/provider có cách phục hồi; xem mobile và desktop.
- Kiểm thử hai tài khoản không đọc được lịch sử của nhau; đầu vào cấp cứu hiển thị chỉ dẫn tìm hỗ trợ khẩn cấp. Không gửi dữ liệu bệnh nhân thật tới provider để test.
- Kiểm thử provider thật bằng nội dung giả không nhạy cảm; báo riêng nếu chỉ hoàn tất tests/stub mà chưa gọi Gemini thực tế. Chỉ tạo tài khoản thử nghiệm/dữ liệu test khi được cho phép, không sửa tài khoản thật.
- Không chạy lại server ngầm ngoài kiểm thử. Nếu cần chạy, thông báo ngay port/PID/lệnh dừng; kết thúc kiểm thử hỏi giữ hay tắt, mặc định đề xuất tắt theo yêu cầu hiện tại.

## Ngoài phạm vi

Không sửa toàn bộ doctor/manager/expert; không hoàn thiện live chat bác sĩ, lịch trực, báo cáo, thanh toán hoặc kho tri thức. Chỉ chỉnh thành phần dùng chung khi cần cho MVP bệnh nhân.
