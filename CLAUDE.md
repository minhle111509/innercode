# Hướng dẫn cho Claude – INNER CODE (bản chính)

Repo `minhle111509/innercode` là web đang bán hàng tại https://innercode.pages.dev (Cloudflare Pages, tự cập nhật từ nhánh `main`). Đọc `BAN-GIAO.md` và `README.md` trước khi làm.

## Quy tắc bắt buộc với chủ web
- Trả lời bằng tiếng Việt, dễ hiểu với người không làm kỹ thuật.
- **Không bao giờ đẩy (push) lên GitHub khi chưa được chủ web đồng ý.** Sửa xong: gửi preview (ảnh chụp màn hình hoặc mô tả thay đổi), chờ chủ web nhắn "ok" rồi mới push.
- Mỗi repo phải hỏi riêng. Đồng ý cho repo này không có nghĩa là đồng ý cho `innercode-giai-doan-1`, và ngược lại.
- Chạy `npm test` trước khi gửi preview; báo thật nếu có bài kiểm tra không đạt.

## Lưu ý kỹ thuật
- Không đặt khóa API, mật khẩu hay bí mật vào bất kỳ file nào; `js/shop/config.js` là file công khai.
- Giá xu và gói nạp nằm ở **hai chỗ**: `js/shop/catalog.js` và `apps-script/Code.gs`. Sửa `Code.gs` thì nhắc chủ web dán lại vào Apps Script (và triển khai phiên bản mới nếu thay đổi ảnh hưởng tới web).
- Quy tắc mở khóa (`unlockKey`) phải giống nhau giữa `js/shop/catalog.js` và `Code.gs`; có bài kiểm tra đối chiếu.
- Thần số học: chữ Y chỉ là nguyên âm khi đứng riêng trong chữ (Vy, My); đứng sát A/E/I/O/U (Nguyen, Huy, Uyen) thì là phụ âm.
- Các file `.html` sửa trực tiếp; `og:url`/`og:image` dùng địa chỉ https://innercode.pages.dev.
