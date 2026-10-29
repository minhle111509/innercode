# INNER CODE – Tài liệu bàn giao

Bản lưu ngày 29/10/2026, khớp với GitHub `minhle111509/innercode` nhánh `main`, commit `85b0795`.

## 1. Mọi thứ đang nằm ở đâu
| Thứ | Ở đâu |
|---|---|
| Mã nguồn website (bản chính) | GitHub: https://github.com/minhle111509/innercode |
| Website đang chạy | GitHub Pages của repo trên (Settings → Pages) |
| Dữ liệu ví xu, nạp xu, đơn hàng, lịch tư vấn, mở khóa | Google Sheet **INNER CODE – Dữ liệu** trong tài khoản Google của chị |
| Mã máy chủ (Apps Script) | Trong Sheet: Tiện ích mở rộng → Apps Script. Bản gốc: `apps-script/Code.gs` |
| Đường link máy chủ (`/exec`) | `js/shop/config.js`, dòng `APPS_SCRIPT_URL` |
| Gói zip này | Bản sao lưu. Bản chính vẫn là GitHub |

## 2. Cấu trúc thư mục
```
*.html                 10 trang: index, profile, numerology, tarot, matrix, meihua, bazi, self, healing, shop
css/style.css          toàn bộ giao diện
assets/                logo, poster, ảnh QR ngân hàng và MoMo
js/shared/             phần dùng chung (dựng giao diện an toàn, ngày tháng, lịch âm)
js/numerology|matrix|bazi|meihua|tarot|self|profile|healing/
                       mỗi tính năng: file tính toán + nội dung luận giải + page.js (giao diện)
js/shop/config.js      THÔNG TIN CÔNG KHAI: link Apps Script, SĐT, Zalo, ngân hàng
js/shop/catalog.js     giá xu, gói nạp, sản phẩm cửa hàng
js/shop/ui.js          ví xu, hộp thoại trừ xu, đặt hàng, đặt lịch
js/report/             khung khóa luận giải, báo cáo PDF, ô "Lưu báo cáo"
apps-script/Code.gs    mã máy chủ dán vào Apps Script
docs/HUONG-DAN-GOOGLE-SHEETS.md   cài đặt và vận hành Google Sheet
tests/                 kiểm thử tự động (chạy: npm test)
README.md              mô tả kỹ thuật
```

## 3. Sửa nhanh những thứ hay đổi
| Muốn đổi | Sửa file | Ghi chú |
|---|---|---|
| SĐT, Zalo, số tài khoản | `js/shop/config.js` | Đổi số TK thì đổi luôn ảnh `assets/vietqr-vietcombank.jpg` và phần Liên hệ trong `index.html` |
| Giá xu (25 / 99 / 249) | `js/shop/catalog.js` **và** `apps-script/Code.gs` (ITEM_PRICES) | Phải sửa **cả hai** chỗ, rồi dán Code.gs và **triển khai phiên bản mới** |
| Gói nạp (50k / 100k / 200k) | `js/shop/catalog.js` **và** `Code.gs` (PACKAGES) | Như trên |
| Sản phẩm cửa hàng | `js/shop/catalog.js` (PRODUCTS) | Đổi sản phẩm báo giá thành bán bằng xu thì sửa thêm `Code.gs` |
| Lời luận giải | Thần số học, Matrix: `meanings.js`; Bát Tự, Mai Hoa: `data.js` (lời hào Mai Hoa: `lines.js`); Tarot: `deck.js`; Khám phá bản thân: `enneagram.js`, `practices.js` | Chỉ sửa chữ trong dấu nháy, đừng xóa dấu nháy hay dấu phẩy |

Sửa trên GitHub: mở file → biểu tượng bút chì → sửa → **Commit changes**. Khoảng 1–2 phút sau web cập nhật; xem lại bằng tab ẩn danh.

## 4. Khi sửa `Code.gs`
1. Dán bản mới vào Apps Script → **Lưu**.
2. Nếu thay đổi liên quan tới web (giá, gói nạp, mở khóa, đơn hàng): **Triển khai → Quản lý các tùy chọn triển khai → bút chì → Phiên bản mới → Triển khai**. Link `/exec` giữ nguyên.
3. Nếu chỉ thay đổi menu trong Sheet: chỉ cần Lưu và tải lại Sheet.
4. Có thêm trang tính mới: chạy `setup` một lần (không mất dữ liệu).

## 5. Vận hành hằng ngày
- **Nạp xu**: thấy tiền về trong sao kê (đúng số tiền, nội dung `NAP <SĐT>`) → trang **NapXu** chọn **Đã nhận**. Không thấy tiền → **Từ chối**.
- **Mở khóa / tải PDF**: tự động, xem ở **GiaoDich** và **MoKhoa**. Không xóa dòng ở MoKhoa.
- **Sách in, báo giá**: trang **DonHang**. **Đặt lịch 1-1**: trang **TuVan**.
- **Tặng / hoàn xu**: menu **INNER CODE → Cộng / trừ xu cho khách (ghi lý do)**.
- **Khách quên PIN**: xem mục 4 trong `docs/HUONG-DAN-GOOGLE-SHEETS.md`.

## 6. Bảo mật
- Bật **xác minh 2 bước** cho tài khoản Google và GitHub.
- Sheet để chế độ **Bị hạn chế**, không chia sẻ quyền sửa.
- Không bao giờ đặt khóa API, mật khẩu vào bất kỳ file nào của web. Web hiện không dùng khóa API nào.
- Muốn dùng AI sau này: khóa đặt trong Apps Script → Cài đặt dự án → Thuộc tính tập lệnh.

## 7. Khôi phục nếu mất
- **Mất web / repo**: tạo repo mới trên GitHub → **Add file → Upload files** → kéo toàn bộ thư mục giải nén vào → Commit → bật **Settings → Pages** (nhánh `main`, thư mục `/ (root)`).
- **Mất Apps Script**: làm lại theo `docs/HUONG-DAN-GOOGLE-SHEETS.md` (mục 1–3). Nếu link `/exec` mới khác link cũ thì dán link mới vào `js/shop/config.js`.
- **Dữ liệu khách** chỉ nằm trong Google Sheet, không có trong gói zip này. Thỉnh thoảng chị nên tải bản sao: **Tệp → Tải xuống → Microsoft Excel (.xlsx)**.

## 8. Lần sau nhờ Claude cập nhật
Claude không nhớ các cuộc trò chuyện cũ. Mở cuộc trò chuyện mới, gửi:
> Đây là web INNER CODE của tôi, repo GitHub `minhle111509/innercode`. Đọc README.md và BAN-GIAO.md (nếu có) trước, rồi giúp tôi: …

Claude sẽ đọc lại mã và tài liệu để làm tiếp. Nhắc thêm: "làm xong cho tôi xem preview, tôi ok mới đẩy lên GitHub".
