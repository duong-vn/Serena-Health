# Quy ước đặt tên nhóm

## Branch

Dùng dạng:

```txt
<type>/<short-description>
```

Ví dụ:

- `feature/set-up-environment`
- `feature/mobile-chatbot-flow`
- `fix/dashboard-chart-layout`
- `docs/update-run-guide`

Nhóm `type` khuyến nghị:

- `feature`: thêm chức năng hoặc màn hình mới.
- `fix`: sửa lỗi.
- `docs`: cập nhật tài liệu.
- `refactor`: chỉnh cấu trúc code nhưng không đổi hành vi.
- `style`: chỉnh giao diện hoặc format.

## Commit message

Dùng dạng:

```txt
<type>(<scope>): <message>
```

Ví dụ:

- `docs(setup): add project guide`
- `feature(chatbot): add mobile triage screen`
- `fix(manager): correct dashboard spacing`

## Folder và file

- Folder dùng `kebab-case`.
- File cấu hình và file tiện ích dùng `kebab-case`.
- File Markdown dùng `UPPER_SNAKE_CASE.md` khi là tài liệu chính trong `docs`.

Ví dụ:

- `mobile-user`
- `expert-review`
- `knowledge-base`
- `SYSTEM_OVERVIEW.md`
- `RUN_GUIDE.md`

## React component

Khi triển khai code ở các giai đoạn sau:

- Component dùng `PascalCase`.
- Hook dùng tiền tố `use`.
- Type và interface dùng `PascalCase`.

Ví dụ:

- `PatientChat.tsx`
- `DoctorDashboard.tsx`
- `useAppointmentFilters.ts`
- `PatientProfile`
- `AppointmentStatus`

## CSS class và token

- CSS class dùng `kebab-case`.
- Design token dùng tên có ý nghĩa theo vai trò sử dụng.

Ví dụ:

- `chat-message`
- `dashboard-sidebar`
- `color-primary`
- `spacing-section`

