# gold-price

Bảng giá vàng dạng màn hình TV: React (Vite), giá lưu cục bộ (`localStorage`), trang quản trị `/admin` (tài khoản: `admin` / mật khẩu: `123456`).

## Chạy local

```bash
npm install
npm run dev
```

- Trang công khai: [http://localhost:5173/](http://localhost:5173/)
- Quản trị: [http://localhost:5173/admin](http://localhost:5173/admin)

## Build

```bash
npm run build
npm run preview
```

Thư mục output: `dist/`.

## Deploy Vercel

1. Đẩy repo lên GitHub.
2. Vào [Vercel](https://vercel.com) → **Add New Project** → import repository.
3. **Framework Preset:** Vite (hoặc để mặc định; lệnh build `npm run build`, thư mục output `dist`).
4. Deploy. File [`vercel.json`](vercel.json) đã cấu hình rewrite SPA để `/admin` không bị 404 khi refresh.

Biểu đồ **Giá vàng Kitco hôm nay** lấy ảnh cập nhật từ [tygiausd.org/giavangonline/kitco.png](https://tygiausd.org/giavangonline/kitco.png) (cùng nguồn với khối Kitco trên [trang giá vàng thế giới](https://tygiausd.org/giavangthegioi/gia-vang-the-gioi-truc-tuyen-gia-vang-online)).
