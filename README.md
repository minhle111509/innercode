# ✦ Huyền Bí – Thần Số Học, Tarot & Matrix Destiny

Website tĩnh (HTML/CSS/JavaScript thuần, không cần build) với **3 tính năng độc lập**, giao diện phong cách trang sản phẩm: nền tối, tiêu đề lớn, minh họa dạng đồng hồ thông minh vẽ bằng CSS, thanh điều hướng con dính trên cùng.

| Tính năng | Trang | Mã nguồn |
|---|---|---|
| 🔢 Đọc bài Thần số học | `numerology.html` | `js/numerology/` |
| 🃏 Đọc bài Tarot | `tarot.html` | `js/tarot/` |
| ✴️ Matrix Destiny | `matrix.html` | `js/matrix/` |

Các tính năng không phụ thuộc nhau; chỉ dùng chung `css/style.css` và các helper nhỏ trong `js/shared/` (dựng DOM, đọc ngày sinh, cộng chữ số).

## Thần số học
- **Số chủ đạo** theo cách tính phổ biến ở Việt Nam: cộng tất cả chữ số của ngày sinh, rút gọn đến khi nằm trong 2–11 hoặc là 22/33 (vì vậy có số chủ đạo 10).
- **Số ngày sinh**, **Năm cá nhân** (của năm hiện tại).
- Từ họ tên (không bắt buộc, tự bỏ dấu tiếng Việt): **Số sứ mệnh**, **Số linh hồn** (nguyên âm A E I O U Y), **Số nhân cách** (phụ âm) theo bảng Pythagoras.
- **Biểu đồ ngày sinh** 3×3 và các số còn thiếu.

## Tarot
- Bộ 78 lá Rider–Waite (22 Ẩn Chính + 56 Ẩn Phụ) với nghĩa xuôi/ngược tiếng Việt.
- 4 kiểu trải bài: 1 lá, Quá khứ–Hiện tại–Tương lai, Tình yêu, Ra quyết định.
- Xáo bài Fisher–Yates dùng `crypto.getRandomValues` (không thiên lệch modulo).
- Lật bài có hiệu ứng, tổng quan trải bài hiện ra khi đã lật hết.

## Matrix Destiny (Ma trận vận mệnh)
- Hệ 22 năng lượng Arcana: số > 22 được rút gọn bằng cách cộng các chữ số.
- A = ngày, B = tháng, C = tổng chữ số năm, D = A+B+C, E (trung tâm) = A+B+C+D; F/G/H/I = các góc dòng tộc.
- Điểm phụ trên từng trục (X1 = X+E, X2 = X+X1), kênh tài chính & tình yêu, đuôi nghiệp (D · D2 · D1), tài năng (B · B2 · B1).
- Mục đích sống: cá nhân, xã hội, tâm linh, toàn cầu.
- Sơ đồ ma trận vẽ bằng SVG.

> Lưu ý: có nhiều trường phái Matrix Destiny với khác biệt nhỏ về công thức điểm phụ; dự án dùng một cách tính phổ biến, có test kiểm chứng bằng ví dụ tính tay.

## Chạy thử
Trang dùng ES modules nên **cần chạy qua web server** (mở trực tiếp file `index.html` bằng `file://` sẽ không chạy JavaScript):

```bash
python3 -m http.server 8080
# hoặc: npx serve .
```

Mở http://localhost:8080

## Kiểm thử
Yêu cầu Node.js ≥ 20, không cần cài thư viện:

```bash
npm test
```

## Triển khai GitHub Pages
Repo → **Settings → Pages** → Source: *Deploy from a branch* → chọn nhánh `main`, thư mục `/ (root)` → Save.

## Lưu ý
Nội dung mang tính tham khảo, giải trí và chiêm nghiệm bản thân.
