# Serene Health — Full-Stack Clinic Chatbot & Management Platform

Hệ thống hỗ trợ chuỗi phòng khám gia đình: Chatbot AI tư vấn triệu chứng ban đầu, phân luồng an toàn, chuyển ca sang bác sĩ (escalation), đặt lịch khám trực tuyến, cùng hệ thống dashboard chuyên sâu cho Bác sĩ, Quản lý và Chuyên gia y tế.

> **CẢNH BÁO AN TOÀN Y TẾ:**
> Chatbot Serene chỉ đóng vai trò trợ lý AI hỗ trợ định hướng sức khỏe ban đầu. Hệ thống **tuyệt đối không chẩn đoán bệnh**, **không kê đơn thuốc**, **không thay thế chỉ định của bác sĩ**. Trong trường hợp khẩn cấp (đau ngực dữ dội, khó thở, mất ý thức, co giật, chảy máu ồ ạt, dấu hiệu đột quỵ), người dùng được điều hướng gọi ngay **115** tại Việt Nam hoặc đến cơ sở cấp cứu gần nhất.

---

## 1. Kiến trúc Hệ thống (System Architecture)

Dự án sử dụng cấu trúc **Monorepo** với 2 workspace chính:

```txt
Serene-Health/
├── apps/
│   ├── web/               # Frontend: React 19 + Vite + React Router v7 + Recharts
│   └── api/               # Backend: NestJS 11 + TypeScript + Prisma 7 ORM + Socket.IO
├── docs/                  # Tài liệu hệ thống, audit, an toàn AI
├── docker-compose.yml     # PostgreSQL 17 database service
├── package.json           # Root scripts quản lý toàn bộ monorepo
└── README.md
```

### Stack Công Nghệ

| Thành phần | Công nghệ sử dụng | Ghi chú |
|---|---|---|
| **Frontend** | React 19, Vite, TypeScript, React Router v7, Recharts | Giao diện mobile-first cho bệnh nhân & desktop dashboard cho bác sĩ/quản lý |
| **Backend** | NestJS 11, Express, TypeScript, Passport JWT | Kiến trúc modular RESTful API (`/api/v1`) |
| **Database & ORM** | PostgreSQL 17, Prisma 7 ORM (`@prisma/client`, `@prisma/adapter-pg`) | Partial unique indexes chống double-booking |
| **AI Chatbot** | Vercel AI SDK 7 (`ai`), `@ai-sdk/google`, `@ai-sdk/react` | Streaming UI messages qua Server-Sent Events |
| **LLM Provider** | Google Gemini (mặc định `gemini-2.5-flash` qua biến môi trường) | Server-side only, client không bao giờ giữ API key |
| **Realtime Chat** | Socket.IO Gateway (`/human-chat`) | Trao đổi trực tiếp Bác sĩ ↔ Bệnh nhân sau khi chuyển ca |
| **Bảo mật & Auth** | Node.js native `crypto.scrypt`, JWT Bearer, NestJS Guards | Role-Based Access Control (4 roles: PATIENT, DOCTOR, EXPERT, MANAGER) |

---

## 2. QUYẾT ĐỊNH QUAN TRỌNG VỀ AI: KHÔNG SỬ DỤNG RAG

Hệ thống này **cố ý KHÔNG triển khai RAG (Retrieval-Augmented Generation)**:
- **Không** sử dụng vector database (Pinecone, Qdrant, Chroma, Weaviate).
- **Không** sử dụng `pgvector` hay vector embeddings.
- **Không** sử dụng pipeline nạp và trích xuất tài liệu (document chunking/retrieval).

### Lý do thiết kế:
1. **Kiến trúc tinh gọn, dễ hiểu và dễ bảo trì**: Phù hợp cho đồ án portfolio, phỏng vấn tuyển dụng kỹ sư phần mềm (Software Engineer / Full-stack Developer) với kiến trúc rõ ràng, thực tế, kiểm soát lỗi chặt chẽ.
2. **Dữ liệu thực tế qua AI Tool Calling**: Thay vì "nhồi" tài liệu vào vector DB, chatbot sử dụng **AI SDK Tool Calling** có schema Zod chặt chẽ để gọi trực tiếp các NestJS Service và truy vấn PostgreSQL theo thời gian thực (danh mục phòng khám, dịch vụ, danh sách bác sĩ, lịch trống, hồ sơ tự khai của bệnh nhân).
3. **Mở rộng tương lai**: Nếu sau này phòng khám cần tra cứu phác đồ điều trị chuyên sâu từ tài liệu y khoa nội bộ, RAG có thể được bổ sung như một module tri thức chuyên biệt mà không ảnh hưởng luồng nghiệp vụ hiện tại.

---

## 3. Các Phân Hệ & Vai Trò Người Dùng (RBAC)

Hệ thống phân quyền nghiêm ngặt với 4 vai trò:

### 1. Bệnh nhân (`PATIENT`) — Route `/patient`
- **Tư vấn AI ban đầu**: Trò chuyện với trợ lý Serene, nhận diện triệu chứng, phân luồng nguy cơ.
- **Yêu cầu bác sĩ tư vấn (Escalation)**: Xác nhận chuyển ca sang bác sĩ kèm tóm tắt triệu chứng do AI tổng hợp (có ghi chú rõ là thông tin do người bệnh tự khai).
- **Chat trực tiếp với bác sĩ**: Realtime qua Socket.IO sau khi bác sĩ tiếp nhận ca.
- **Đặt lịch khám trực tuyến**: Chọn chi nhánh, chuyên khoa, bác sĩ, xem slot trống 30 phút theo thời gian thực và xác nhận đặt lịch.
- **Hồ sơ sức khỏe tự khai**: Quản lý nhóm máu, dị ứng, tiền sử bệnh án.

### 2. Bác sĩ (`DOCTOR`) — Route `/doctor/dashboard`
- **Bàn làm việc lâm sàng**: Tổng quan ca khám trong ngày, cảnh báo nguy cơ.
- **Tư vấn trực tiếp (Live Consultation)**: Tiếp nhận ca chuyển từ chatbot, trò chuyện realtime với bệnh nhân, ghi chép bệnh án và đơn thuốc.
- **Hồ sơ bệnh nhân (EMR)**: Xem lịch sử khám, chỉ số sinh tồn (vitals: HA, nhịp tim, SpO2, BMI).
- **Lịch làm việc & ca trực**: Theo dõi lịch làm việc theo tháng, các ca sáng/chiều.
- **Lịch hẹn khám**: Quản lý danh sách bệnh nhân đã đặt lịch, cập nhật trạng thái lịch hẹn.

### 3. Quản lý phòng khám (`MANAGER`) — Route `/manager/*`
- **Dashboard điều hành**: Biểu đồ số lượng ca tư vấn theo giờ, tỷ lệ phân luồng chatbot, tỷ lệ chuyển viện, doanh thu.
- **Báo cáo & Phân tích**: Thống kê hiệu suất chi nhánh, chuyên khoa, chỉ số hài lòng CSAT.
- **Giám sát Chatbot (`/manager/chatbot-monitor`)**: Rà soát toàn bộ lịch sử tư vấn của chatbot, lọc ca nguy hiểm, xem đánh giá của người bệnh.
- **Quản lý danh sách bác sĩ (`/manager/doctors`)**: Thêm mới, chỉnh sửa thông tin, phân công chi nhánh, quản lý phí khám/tư vấn.

### 4. Chuyên gia y tế (`EXPERT`) — Route `/expert`
- **Rà soát chất lượng AI**: Đọc lại các hội thoại của chatbot với người bệnh.
- **Đánh dấu & Ghi chú lỗi**: Ghi nhận các câu trả lời chưa chuẩn xác, phân loại lý do gắn cờ (flagging).
- **Xử lý phản ánh**: Cập nhật trạng thái giải quyết (`PENDING` -> `RESOLVED`) kèm nội dung xử lý.

---

## 4. An Toàn AI & Cơ Chế Chống Ảo Giác (Safety & Guardrails)

1. **Bộ lọc từ khóa khẩn cấp ứng dụng (Application Safety Rules)**:
   - Được triển khai ở tầng ứng dụng bằng Regex đa ngôn ngữ (Tiếng Việt không dấu / có dấu & Tiếng Anh).
   - Khi phát hiện dấu hiệu cấp cứu (đau ngực dữ dội, khó thở, co giật, mất ý thức, đột quỵ, ý định tự hại), hệ thống **lập tức trả về hướng dẫn cấp cứu 115** mà **không chuyển câu hỏi đến Gemini**.
   - Hoạt động độc lập ngay cả khi Gemini API bị gián đoạn.

2. **System Prompt máy chủ nghiêm ngặt**:
   - Khẳng định danh tính Serene là trợ lý AI, không phải bác sĩ.
   - Cấm khẳng định chẩn đoán bệnh chắc chắn, cấm kê đơn thuốc hoặc liều lượng thuốc.
   - Luôn nhấn mạnh tính không chắc chắn và khuyến cáo khám trực tiếp.

3. **Khóa tạo sinh (Generation Lease)**:
   - Database áp dụng trường `generationExpiresAt` để khóa phiên chat 120s, ngăn chặn race condition khi người dùng click liên tục làm phân mảnh lịch sử hội thoại.

4. **Lịch sử hội thoại có thẩm quyền từ máy chủ**:
   - Server tải lịch sử tin nhắn từ PostgreSQL dựa trên `userId` và `conversationId`, không tin tưởng lịch sử do frontend gửi lên (chống Prompt Injection).

5. **AI Tool Calling với dữ liệu thật**:
   - `getServices`: Lấy danh mục dịch vụ khám từ database.
   - `findDoctors`: Tìm bác sĩ theo chuyên khoa, chi nhánh, tên.
   - `getDoctorDetails`: Xem bằng cấp, kinh nghiệm, biểu phí của bác sĩ.
   - `getDoctorAvailability`: Lấy ca trực của bác sĩ theo ngày.
   - `getAvailableAppointmentSlots`: Tính toán các slot 30 phút còn trống thực tế.
   - `getCurrentPatientProfile`: Đọc hồ sơ sức khỏe tự khai của chính bệnh nhân đang đăng nhập.
   - `requestDoctorEscalation`: Đề xuất tóm tắt ca để chuyển bác sĩ (chỉ tạo bản nháp đề xuất, người bệnh phải click xác nhận trên UI).

6. **Nguyên tắc hành động bất khả nghịch (Irreversible Actions)**:
   - AI **không bao giờ** tự ý đặt lịch hoặc hủy lịch trong cơ sở dữ liệu.
   - AI chỉ tìm kiếm thông tin và hiển thị form đề xuất. Thao tác đặt lịch cuối cùng phải do người dùng tự chọn giờ và ấn nút xác nhận qua API REST có transactional check.

---

## 5. Cơ Sở Dữ Liệu & Prisma Setup

Database sử dụng **PostgreSQL** và **Prisma ORM**.

### Các bảng dữ liệu chính:
- `users`: Tài khoản hệ thống (email, phone, fullName, passwordHash, role: `PATIENT`, `DOCTOR`, `EXPERT`, `MANAGER`).
- `patient_profiles`: Nhóm máu, dị ứng, tiền sử bệnh án.
- `doctor_profiles`: Bằng cấp, năm kinh nghiệm, chi nhánh, chuyên khoa, biểu phí.
- `clinics`: Chuỗi các chi nhánh phòng khám.
- `medical_services`: Danh mục chuyên khoa & dịch vụ y tế.
- `doctor_schedules`: Ca làm việc định kỳ của bác sĩ trong tuần.
- `appointments`: Lịch hẹn khám (có partial unique index `(doctor_id, start_at)` chống double-booking).
- `conversations`: Phiên hội thoại của bệnh nhân.
- `messages`: Từng tin nhắn riêng lẻ lưu role (`USER`, `ASSISTANT`, `DOCTOR`, `SYSTEM`), nội dung, metadata, model AI.
- `consultations`: Ca tư vấn lâm sàng gắn với hội thoại, bác sĩ phụ trách, trạng thái (`AI_CHAT`, `ESCALATION_REQUESTED`, `ASSIGNED_TO_DOCTOR`, `DOCTOR_CHAT`, `COMPLETED`).
- `expert_reviews`: Đánh giá của chuyên gia về chất lượng hội thoại AI.

### Phòng Chống Double-Booking Tại Tầng Cơ Sở Dữ Liệu:
Thay vì chỉ kiểm tra đơn thuần ở tầng ứng dụng, migration tạo partial unique index:
```sql
CREATE UNIQUE INDEX "appointments_doctor_active_slot_unique"
ON "appointments"("doctor_id", "start_at")
WHERE "status" IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS');
```

---

## 6. Hướng Dẫn Cài Đặt & Chạy Ứng Dụng (Quick Start)

### Yêu Cầu Môi Trường
- **Node.js**: phiên bản `>= 20.x` (đã kiểm thử trên Node v24 LTS).
- **npm**: phiên bản `>= 10.x`.
- **PostgreSQL**: bản 15+ (hoặc chạy qua Docker Compose đi kèm).

### Bước 1: Cài đặt Dependencies

Tại thư mục gốc của project:
```bash
npm install
```

### Bước 2: Cấu hình Biến Môi Trường

Tạo file `.env` tại thư mục `apps/api/`:
```bash
cp apps/api/.env.example apps/api/.env
```

Điền các thông tin:
```env
DATABASE_URL="postgresql://serene:serene_password_2026@localhost:5432/serene_health?schema=public"
JWT_SECRET="mot-chuoi-khoa-bi-mat-dai-hon-32-ky-tu-cho-he-thong-serene-health"
PORT=3000
FRONTEND_URL="http://localhost:5173"
CORS_ORIGINS="http://localhost:5173"

# Google Gemini API Key (lấy miễn phí tại https://aistudio.google.com/)
GEMINI_API_KEY="your-real-gemini-api-key"
GEMINI_MODEL="gemini-2.5-flash"
```

### Bước 3: Khởi chạy Cơ Sở Dữ Liệu & Seed Data

Nếu dùng Docker:
```bash
docker compose up -d
```

Chạy migration và nạp dữ liệu mẫu:
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

> **Tài khoản mẫu sau khi seed (mật khẩu chung: `ClinicAdmin@2026!`):**
> - **Quản lý**: `manager@clinic.vn`
> - **Bác sĩ**: `doctor@clinic.vn`
> - **Chuyên gia**: `expert@clinic.vn`
> - **Bệnh nhân**: `patient@clinic.vn` (hoặc có thể đăng ký tài khoản bệnh nhân mới tại màn hình đăng ký)

### Bước 4: Chạy Ứng Dụng

Chạy backend NestJS (port 3000):
```bash
npm run dev:api
```
- Swagger API Docs: `http://localhost:3000/api/docs`

Chạy frontend React (port 5173):
```bash
npm run dev:web
```
- Truy cập trình duyệt tại: `http://localhost:5173`

---

## 7. Các Lệnh Kiểm Thử & Xác Minh (Verification Commands)

| Lệnh | Chức năng |
|---|---|
| `npm run typecheck` | Kiểm tra TypeScript strict trên cả `apps/web` và `apps/api` |
| `npm test` | Chạy toàn bộ 32 unit/integration test (native `node:test`) |
| `npm run test:api` | Chạy 29 tests backend (auth, guards, booking matrix, AI tools, safety rules) |
| `npm run test:web` | Chạy 3 tests frontend API client (token storage, bearer auth, 401 expiry) |
| `npm run lint:web` | Kiểm tra ESLint frontend React |
| `npm run lint:api` | Kiểm tra ESLint backend NestJS |
| `npm run build:web` | Build production frontend (`dist/`) |
| `npm run build:api` | Build production backend (`dist/`) |
| `npm run db:validate` | Kiểm tra tính hợp lệ của Prisma schema |
| `npm run db:generate` | Tạo Prisma client mới nhất |

---

## 8. Hạn Chế Hiện Tại & Hướng Phát Triển Tương Lai

### Hạn chế hiện tại:
1. Bộ lọc khẩn cấp hoạt động theo từ khóa và mẫu câu định sẵn; không thể bao phủ 100% các cách diễn đạt phức tạp trong thực tế.
2. Xác thực JWT hiện tại lưu trữ tại `sessionStorage` (an toàn trước XSS kéo dài giữa các phiên nhưng sẽ yêu cầu đăng nhập lại khi mở tab mới).
3. Do Docker daemon trên một số máy host cục bộ có thể không chạy sẵn, việc chạy migration cần có PostgreSQL instance đang lắng nghe tại cổng cấu hình.

### Đề xuất phát triển tương lai:
1. **Curated Medical Knowledge Base (RAG)**: Sau khi hệ thống ổn định, có thể tích hợp pipeline RAG với vector database để tra cứu tài liệu chuyên sâu dành riêng cho chuyên gia hoặc bác sĩ tham khảo.
2. **Tích hợp thanh toán trực tuyến**: Hỗ trợ thanh toán phí khám qua VNPay/MoMo trước khi xác nhận lịch hẹn.
3. **Gọi video trực tiếp Bác sĩ ↔ Bệnh nhân**: Tích hợp WebRTC vào màn hình tư vấn trực tiếp.
