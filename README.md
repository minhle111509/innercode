# ✦ Huyền Bí – Thần Số Học & Tarot

Website tĩnh (HTML/CSS/JavaScript thuần, không cần build) với **2 tính năng độc lập**:

| Tính năng | Trang | Mã nguồn |
|---|---|---|
| 🔢 Đọc bài Thần số học | `numerology.html` | `js/numerology/` |
| 🃏 Đọc bài Tarot | `tarot.html` | `js/tarot/` |

Hai tính năng không phụ thuộc nhau; chỉ dùng chung `css/style.css` và helper `js/shared/dom.js`.

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
