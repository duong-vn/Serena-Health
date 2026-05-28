# Serene Health

Hệ thống chatbot hỗ trợ chuỗi phòng khám gia đình. Chatbot giúp người dùng khảo sát
tình trạng sức khỏe ban đầu, nhận định hướng xử lý, chuyển ca sang bác sĩ khi cần và
hỗ trợ đặt lịch khám.

> Chatbot chỉ hỗ trợ tư vấn ban đầu. Hệ thống không kê đơn thuốc và không thay thế chẩn đoán của bác sĩ.

## Kiến trúc project

Project dùng cấu trúc monorepo để tách rõ frontend và backend:

```txt
UIUX/
  apps/
    web/      # Frontend React + Vite
    api/      # Backend NestJS + TypeScript skeleton
  docs/
  package.json
  README.md
```

## Chạy frontend

```bash
cd apps/web
npm install
npm run dev
```

Frontend chạy mặc định tại:

```txt
http://localhost:5173
```

Hoặc chạy từ root:

```bash
npm run dev:web
```

Khi chạy từ root, frontend vẫn dùng cổng mặc định:

```txt
http://localhost:5173
```

## Kiểm tra frontend

```bash
npm run lint:web
npm run build:web
```

## Backend

Backend nằm trong `apps/api` và dùng NestJS + TypeScript theo định hướng triển khai.
Giai đoạn hiện tại mới có skeleton, chưa có API thật.

## Tài liệu

- [Kiến trúc hệ thống](docs/ARCHITECTURE.md)
- [Giới thiệu hệ thống](docs/SYSTEM_OVERVIEW.md)
- [Hướng dẫn chạy hệ thống](docs/RUN_GUIDE.md)
- [Quy ước đặt tên nhóm](docs/NAMING_CONVENTIONS.md)
