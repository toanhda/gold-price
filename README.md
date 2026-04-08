# gold-price

Bảng giá vàng dạng màn hình TV (React + Vite), quản trị `/admin` (`admin` / `123456`).

- **Chỉ deploy Vercel, không cấu hình Supabase:** vào `/admin` chỉnh giá **ngay được**. Giá lưu trên **từng trình duyệt** (`localStorage`), mỗi máy một bản — **không cần SQL hay bước nào khác**.
- **Muốn mọi người xem chung một bảng giá:** cần [Supabase](https://supabase.com) (free) + biến môi trường trên Vercel — xem mục dưới. **Database không tự tạo chỉ bằng deploy:** phải **một lần** tạo bảng trên Supabase (nhanh nhất: chạy [`supabase.sql`](supabase.sql) trong SQL Editor). **Không bắt buộc** chạy phần `INSERT` trong file đó: sau khi có bảng + env, lần đầu admin **Lưu giá** sẽ tự ghi dữ liệu (API dùng upsert).

## Chạy local

```bash
npm install
npm run dev
```

- Trang công khai: [http://localhost:5173/](http://localhost:5173/)
- Quản trị: [http://localhost:5173/admin](http://localhost:5173/admin)

`npm run dev` **không** chạy serverless `/api/*`. Lưu lên Supabase chỉ hoạt động sau khi deploy Vercel (hoặc dùng `npx vercel dev` thay cho `npm run dev`).

## Build

```bash
npm run build
npm run preview
```

Output: `dist/`.

## Đồng bộ giá cho mọi người (Supabase + Vercel, $0)

1. Tạo project **Supabase** → **SQL Editor** → chạy file [`supabase.sql`](supabase.sql) (tạo bảng + quyền đọc). Có thể **bỏ qua** phần `INSERT` ở cuối nếu không muốn dữ liệu mẫu — chỉ cần bảng `prices` và policy; **lần đầu** vào admin bấm **Lưu giá** sẽ tự tạo/ghi dòng `id = 1`.
2. Vào **Project Settings → API**: copy `URL` và `anon` `public`, `service_role` (secret).
3. Trên **Vercel** → Project → **Settings → Environment Variables** (Production + Preview):

   | Name | Value |
   |------|--------|
   | `VITE_SUPABASE_URL` | URL (giống `SUPABASE_URL`) |
   | `VITE_SUPABASE_ANON_KEY` | anon public key |
   | `SUPABASE_URL` | cùng URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role (chỉ server) |
   | `ADMIN_SECRET` | cùng mật khẩu admin (vd. `123456`) |

4. Redeploy. Mọi người mở site sẽ đọc giá từ Supabase; admin **Lưu giá** sẽ ghi qua `POST /api/prices` (không lộ service role ra trình duyệt).

Copy mẫu biến môi trường: [`.env.example`](.env.example).

### Đã có bảng từ trước — thêm field mới trong JSON (ví dụ `trend`)

- Cột `payload` kiểu **jsonb**: có thể chứa cấu trúc JSON thay đổi theo từng phiên bản app **không cần** chạy lại SQL hay `ALTER TABLE`.
- Dữ liệu cũ trong Supabase **chưa có** `trend` vẫn đọc được: app tự coi là **giảm** (`down`) cho tới khi bạn chỉnh trong admin.
- Việc cần làm: **deploy** bản code mới → vào **Admin** → chỉnh trạng thái từng dòng → **Lưu giá** — toàn bộ `payload` được ghi lại kèm `trend`. **Không** cần chạy SQL lần nữa.

## Deploy Vercel — hướng dẫn từng bước (không cần biết sẵn)

### Bước 1: Đưa code lên GitHub

- Tạo repo mới trên [github.com](https://github.com) (ví dụ `gold-price`).
- Trên máy (trong thư mục project):

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

(Nếu repo đã có sẵn thì chỉ cần `git push`.)

### Bước 2: Đăng ký Vercel và liên kết GitHub

1. Vào [vercel.com](https://vercel.com) → **Sign Up** (nên chọn **Continue with GitHub** để Vercel truy cập repo).
2. Cho phép Vercel cài app lên GitHub khi được hỏi.

### Bước 3: Tạo project từ repo

1. Trong Vercel dashboard → **Add New…** → **Project**.
2. Chọn **Import** repo `gold-price` (hoặc tên repo của bạn).
3. **Framework Preset:** để **Vite** (hoặc “Other” — Vercel thường tự nhận).
4. Các ô hay gặp (thường **không cần sửa**):
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Bấm **Deploy** và chờ 1–2 phút.

Xong là có **URL** dạng `https://ten-project.vercel.app` — mở link đó là xem được bảng giá và `/admin`.

### Bước 4: Cần chỉnh gì thêm không?

| Mục | Có bắt buộc không? |
|-----|-------------------|
| Build / output | Thường **không** — mặc định Vite đã đúng. |
| Biến môi trường | **Không** nếu chỉ cần site chạy (giá lưu trên từng máy qua trình duyệt). |
| Biến Supabase | **Chỉ khi** muốn mọi người xem **chung** một bảng giá — làm theo mục **Đồng bộ giá cho mọi người** ở đầu file. |

Sau khi thêm biến môi trường (nếu có): vào project → **Deployments** → chọn bản mới nhất → **⋯** → **Redeploy** (hoặc push commit mới để deploy lại).

### Bước 5 (tuỳ chọn): Tên miền riêng

Project → **Settings** → **Domains** → thêm domain và làm theo hướng dẫn DNS của Vercel.

---

File [`vercel.json`](vercel.json) trong repo đã cấu hình rewrite SPA; route `/api/prices` do Vercel chạy serverless, **không** cần bạn cấu hình thêm trong dashboard.

## Biểu đồ giá vàng thế giới (Spot gold)

Trang bảng giá dùng **widget TradingView** (cùng symbol `FOREXCOM:XAUUSD` và cấu hình như trên [GiaVang.Net — Spot gold](https://giavang.net/bieu-do-gia-vang-the-gioi-spot-gold/)), không nhúng cả trang web — chỉ khối biểu đồ.
