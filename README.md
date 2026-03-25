# gold-price

Bảng giá vàng dạng màn hình TV (React + Vite), quản trị `/admin` (`admin` / `123456`).

- **Không cấu hình gì thêm:** giá chỉ lưu trên trình duyệt (`localStorage`), mỗi máy một bản.
- **Muốn mọi người xem chung một bảng giá (miễn phí):** dùng [Supabase](https://supabase.com) (free tier) + API `api/prices.ts` trên Vercel — hướng dẫn bên dưới.

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

1. Tạo project **Supabase** → SQL Editor → chạy nội dung file [`supabase.sql`](supabase.sql).
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

## Biểu đồ Kitco

Ảnh từ [tygiausd.org/giavangonline/kitco.png](https://tygiausd.org/giavangonline/kitco.png) — cùng nguồn [trang giá vàng thế giới / Kitco](https://tygiausd.org/giavangthegioi/gia-vang-the-gioi-truc-tuyen-gia-vang-online).
