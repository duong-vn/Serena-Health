# Kiến trúc hệ thống

Hệ thống được tổ chức theo hướng monorepo để tách rõ frontend và backend nhưng vẫn giữ
chung tài liệu, quy ước và cấu hình làm việc nhóm.

## Cấu trúc cấp cao

```txt
UIUX/
  apps/
    web/
    api/
  docs/
```

## Frontend

Frontend nằm trong `apps/web`.

- Công nghệ: React + Vite.
- Mục tiêu: triển khai giao diện mobile-first cho Người dùng và dashboard desktop cho
  Bác sĩ, Chuyên gia, Quản lý phòng khám.
- Giai đoạn hiện tại: chỉ có skeleton và app Vite nền tảng.

Không tách `web` và `mobile` thành hai app riêng ở giai đoạn này. Giao diện mobile của
Người dùng là một phần của web app, được tách theo route/layout.

## Backend

Backend nằm trong `apps/api`.

- Công nghệ đề xuất: NestJS + TypeScript.
- Database đề xuất ở giai đoạn sau: PostgreSQL.
- ORM đề xuất ở giai đoạn sau: Prisma.
- Realtime chat đề xuất ở giai đoạn sau: WebSocket hoặc Socket.IO qua NestJS gateway.
- Chatbot AI ở giai đoạn sau nên được đặt sau lớp guardrails, đảm bảo không kê đơn thuốc
  và có phân luồng khẩn cấp.

Giai đoạn hiện tại chỉ dựng skeleton và file cấu hình tối thiểu, chưa triển khai API thật.

