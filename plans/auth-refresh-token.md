# Auth Refresh Token Plan

## Vấn đề
- Access token 30m, hết hạn = login lại. Không refresh token.
- `login()` lộ raw user record (trừ passwordHash).
- `JwtPayload` thiếu `iat`/`exp`.

## Thiết kế
Access 15m (Bearer, sessionStorage — giữ nguyên) + Refresh 7d (httpOnly cookie, `Path=/api/v1/auth`, `SameSite=Lax`, `Secure` khi prod). Rotate-on-use: mỗi lần refresh revoke token cũ, cấp cặp mới. Revoke lưu DB để logout/logout-all được.

Không thêm dep: đọc cookie bằng parse thủ công (~5 dòng), ghi cookie bằng `res.cookie` của Express (có sẵn). Không dùng cookie-parser.

## Thay đổi
1. `apps/api/prisma/schema.prisma`: model `RefreshToken` (id, userId → User cascade, tokenHash unique sha256, expiresAt, revokedAt, createdAt) + relation `User.refreshTokens`.
2. Migration `prisma migrate dev --name add-refresh-tokens`.
3. `auth.types.ts`: `JwtPayload` thêm `iat?`, `exp?`.
4. `auth.service.ts`:
   - `login()` dùng `publicUserSelect` (whitelist) thay vì spread.
   - `issue()` ký access 15m + tạo refresh (random 48B, lưu sha256), trả `{ accessToken, refreshToken, user, refreshExpiresAt }`.
   - `refresh(refreshToken)`: hash, lookup, check expiry/revoke/active user, revoke cũ, issue mới.
   - `logout(refreshToken?)`: revoke 1 token; `logoutAll(userId)`: revoke hết.
5. `auth.controller.ts`: login/register set cookie + trả `{ accessToken, user }` (giữ shape cũ); thêm `POST /auth/refresh` (đọc cookie, set cookie mới), `POST /auth/logout` (revoke + clear cookie). Throttle refresh 10/phút.
6. `main.ts`: giữ `credentials: true` (đã có). Không đổi.
7. Frontend `api/client.ts`: `fetch` thêm `credentials: 'include'`; 401 → gọi `/auth/refresh` 1 lần (single-flight) rồi retry request gốc; refresh fail mới clear + dispatch `serene-auth-expired`.
8. `AuthContext.tsx`: `logout()` gọi `POST /auth/logout` (fire-and-forget) trước khi clear local.
9. Test: cập nhật `client.test.ts` (refresh retry) + thêm test service (rotate, revoke, whitelist login). Chạy `npm test` api + web.

## Không làm
- Không đổi scrypt, guard, roles, rate limit hiện tại.
- Không remember-me / sliding window — ponytail: 7d cố định, upgrade khi có yêu cầu.
