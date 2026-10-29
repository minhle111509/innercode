# ✦ INNER CODE – Mật mã nội tâm

Website tĩnh (HTML/CSS/JavaScript thuần, không cần build, không cần máy chủ) kết hợp **huyền học chuyên sâu** và **khám phá bản thân**. Giao diện kiểu trang sản phẩm: nền tối, tiêu đề lớn, mỗi công cụ là một "mặt đồng hồ" vẽ bằng CSS.

| Trang | Nội dung | Mã nguồn |
|---|---|---|
| `profile.html` | **Hồ sơ nội tâm**: đối chiếu Thần số học, Matrix Destiny, Bát Tự; điểm hội tụ; gợi ý thực hành | `js/profile/` |
| `numerology.html` | **Thần số học** Pythagoras | `js/numerology/` |
| `matrix.html` | **Matrix Destiny** 22 năng lượng | `js/matrix/` |
| `bazi.html` | **Bát Tự – Ngũ Hành** (tứ trụ Can Chi) | `js/bazi/` |
| `meihua.html` | **Kinh Dịch Mai Hoa** | `js/meihua/` |
| `tarot.html` | **Tarot** 78 lá | `js/tarot/` |
| `self.html` | **Khám phá bản thân**: trắc nghiệm tính cách, bánh xe cuộc sống, bài thở, nhật ký | `js/self/` |
| `healing.html` | **Góc chữa lành**: chọn tần số đồng hành (miễn phí: cảm xúc + màu sắc + giữ 3 giây) và trình phát chuông xoay/âm thuần 174–963Hz | `js/healing/` |
| `shop.html` | **Cửa hàng**: combo sách in, chuông xoay, con lắc, vòng tay cá nhân hóa; bảng gói nạp xu | `js/shop/` |

Mỗi tính năng có module logic thuần (không đụng DOM, có unit test) và một file `page.js` cho giao diện. Phần dùng chung nằm trong `js/shared/` (DOM an toàn XSS, đọc ngày sinh, cộng chữ số, lịch âm).

## Chi tiết từng hệ thống
**Thần số học.** Số chủ đạo (cách tính Việt Nam: giữ 2–11, 22, 33), số ngày sinh, thái độ, sứ mệnh, linh hồn, nhân cách, trưởng thành, cân bằng, đam mê ẩn; số nợ nghiệp 13/14/16/19 (dò cả chuỗi rút gọn); bài học nghiệp (số thiếu trong tên); 3 chu kỳ đường đời; 4 đỉnh cao kèm độ tuổi (đỉnh 1 = 36 − số chủ đạo) và 4 thử thách; năm, tháng, ngày cá nhân; biểu đồ ngày sinh với 8 mũi tên; luận giải riêng theo từng vị trí, sự nghiệp và tình yêu.

**Matrix Destiny.** A = ngày, B = tháng, C = tổng chữ số năm, D = A+B+C, E = A+B+C+D, rút gọn về 1–22; góc dòng tộc, điểm phụ, kênh tài chính và tình yêu, 4 mục đích sống; giải mã đuôi nghiệp 3 bước; bảng sức khỏe 7 luân xa (thể chất, năng lượng, cảm xúc); vòng dự báo theo tuổi 0–80 (64 giai đoạn, mỗi giai đoạn 1 năm 3 tháng); dòng nghiệp bên nội và bên ngoại; nghề nghiệp và lời khuyên cho từng năng lượng.

**Bát Tự.** Trụ năm và tháng đổi theo tiết khí (Lập Xuân, Kinh Trập…) tính từ kinh độ mặt trời; trụ ngày từ số ngày Julius; trụ giờ theo Ngũ Thử Độn, từ 23h tính sang ngày hôm sau. Tuổi và mệnh nạp âm theo năm âm lịch. Tàng can và Thập Thần cho từng trụ; ngũ hành có trọng số tàng can; vượng/nhược theo phương pháp phù – ức có xét lệnh tháng (Vượng, Tướng, Hưu, Tù, Tử); dụng thần; lục hợp, lục xung, lục hại, tam hợp, thiên can hợp; thần sát (Thiên Ất Quý Nhân, Văn Xương, Đào Hoa, Dịch Mã); đại vận 10 năm (thuận/nghịch theo giới tính và âm dương năm, khởi vận tính từ số ngày tới tiết khí) và lưu niên 5 năm.

**Kinh Dịch Mai Hoa.** Lập quẻ theo thời điểm (tự đổi âm lịch) hoặc theo số; quẻ chủ, hỗ, biến; 384 lời hào (diễn giải tiếng Việt, đánh dấu hào động); ý nghĩa vị trí hào; Thể – Dụng theo ngũ hành, diễn biến qua quẻ hỗ và kết cục qua quẻ biến; thuộc tính 8 quẻ đơn; lời khuyên cho 64 quẻ.

**Tarot.** 78 lá Rider–Waite, xáo bằng `crypto.getRandomValues`; 5 kiểu trải bài gồm Celtic Cross 10 lá; lời khuyên cho 22 lá Ẩn Chính.

**Khám phá bản thân.** Trắc nghiệm 36 câu dựa trên 9 nhóm Enneagram (nhóm chính, cánh, hướng phát triển/căng thẳng); bánh xe cuộc sống 8 lĩnh vực với biểu đồ radar; 3 bài thở có hẹn giờ; câu hỏi nhật ký theo chủ đề (nháp lưu trên trình duyệt của người dùng).

**Hồ sơ nội tâm.** Mỗi kết quả chính được gắn vào 8 chủ đề sống; chủ đề được nhiều hệ thống cùng nhắc đến xếp cao hơn, có ghi nguồn. Bảng đối chiếu 6 khía cạnh; ảnh hưởng của năm hiện tại tới nhật chủ (Thập Thần rút gọn). Toàn bộ chạy theo quy tắc trên trình duyệt, không dùng AI.

> Lời hào, luận giải và lời khuyên là bản diễn giải ngắn gọn, nên được người am hiểu duyệt lại trước khi dùng cho mục đích thương mại. Các trường phái huyền học có nhiều biến thể công thức; dự án chọn cách tính phổ biến và có test với ví dụ tính tay, lịch vạn niên. Nội dung luận giải mang tính tham khảo.

## Thương hiệu & liên hệ
- Logo và ảnh thương hiệu nằm trong `assets/`: biểu tượng IC (`emblem-*.webp`, `favicon-*.png`, `apple-touch-icon.png`), poster (`poster-innercode.webp`), tranh nền đầu trang chủ (`hero-art.webp`) và ảnh chia sẻ mạng xã hội (`og-image.jpg`).
- Mục **Liên hệ & thanh toán** ở cuối trang chủ (`index.html#lien-he`): điện thoại/Zalo 0909 799 695, chuyển khoản Vietcombank 0071001151943 kèm mã VietQR (`assets/vietqr-vietcombank.jpg`). Muốn đổi thông tin, sửa trong `index.html` và chân trang của từng file `*.html`.

## Ví xu, báo cáo PDF, đơn hàng, đặt lịch 1-1
- **Ví xu** (chip "N Xu" góc phải mọi trang): số điện thoại là định danh, mã PIN 4–6 số bảo vệ ví. Gói 50/100/200 Xu (1 Xu = 1.000đ). Chuyển khoản Vietcombank bằng **mã VietQR tạo động** (đã điền sẵn số tiền và nội dung `NAP <SĐT>`) hoặc mã MoMo tĩnh.
- **Xem thử miễn phí, mở khóa phần chuyên sâu**: Thần số học (số chủ đạo), Matrix (ma trận + năng lượng cốt lõi), Bát Tự (tứ trụ + nhật chủ) và Hồ sơ nội tâm (chỉ số cốt lõi + thông điệp tổng hợp) cho xem miễn phí; phần còn lại chỉ được dựng ra sau khi mở khóa (`js/report/paywall.js`). Bài lẻ 25 Xu, **trọn bộ Hồ sơ nội tâm 99 Xu** (mở luôn 3 bài lẻ của cùng hồ sơ), combo sách in 249 Xu. Đã mở khóa thì xem lại và tải PDF (dàn trang A4, "Lưu thành PDF" trong hộp thoại in) không mất thêm xu: máy chủ ghi trang `MoKhoa` theo số điện thoại + hồ sơ (quy tắc trong `unlockKey` của `js/shop/catalog.js`, bản sao `unlockKey_` trong `Code.gs`).
- **Đặt hàng vật phẩm** và **"Kết nối chuyên gia"** (nút nổi góc phải dưới): gọi/Zalo trực tiếp hoặc để lại form, chuyên gia gọi lại.
- **Máy chủ = Google Sheets + Apps Script** (`apps-script/Code.gs`): lưu ví, yêu cầu nạp, giao dịch, đơn hàng, lịch tư vấn. Giá xu nằm ở máy chủ; xu chỉ được cộng khi chủ shop đổi trạng thái dòng nạp thành "Đã nhận". Cài đặt: **[docs/HUONG-DAN-GOOGLE-SHEETS.md](docs/HUONG-DAN-GOOGLE-SHEETS.md)**.
- Cấu hình công khai nằm ở `js/shop/config.js` (URL Apps Script, ngân hàng, Zalo). Khi `APPS_SCRIPT_URL` còn trống, các nút trả phí hướng khách liên hệ Zalo.

**Bảo mật khóa API:** dự án hiện **không dùng AI và không có khóa API nào**. `config.js` là file công khai, tuyệt đối không đặt khóa Gemini/Claude vào đó. Nếu thêm AI, gọi qua hàm máy chủ (ví dụ Vercel `api/*.js` đọc `process.env.GEMINI_API_KEY`, hoặc Apps Script `PropertiesService`).

**Giới hạn đã biết:** luận giải được tính và tạo PDF ngay trên trình duyệt, nên người rành kỹ thuật vẫn có thể đọc mã nguồn để xem phần bị khóa; mã MoMo là mã tĩnh nên khách tự nhập số tiền và nội dung; số trang PDF phụ thuộc nội dung (trọn bộ khoảng 12 trang, bài lẻ khoảng 5 trang); giá chuông, con lắc, vòng tay đang để "Liên hệ báo giá".

## Chạy thử
Trang dùng ES modules nên **cần chạy qua web server** (mở trực tiếp file bằng `file://` sẽ không chạy JavaScript):

```bash
python3 -m http.server 8080
```

Mở http://localhost:8080

## Kiểm thử
Yêu cầu Node.js ≥ 20, không cần cài thư viện:

```bash
npm test
```

## Triển khai GitHub Pages
Repo → **Settings → Pages** → Source: *Deploy from a branch* → nhánh `main`, thư mục `/ (root)` → Save.

## Hướng phát triển
Đối soát chuyển khoản tự động (webhook ngân hàng/cổng thanh toán), tạo PDF phía máy chủ để chống sao chép, và luận giải AI đều cần một hàm máy chủ giữ khóa bí mật trong biến môi trường; không làm an toàn được trên web tĩnh.
