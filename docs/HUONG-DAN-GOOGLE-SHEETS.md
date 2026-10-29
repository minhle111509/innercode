# Hướng dẫn bật Ví xu, đơn hàng và đặt lịch (Google Sheets)

Website là trang tĩnh. Phần ví xu, đơn hàng và yêu cầu tư vấn được lưu trong **một Google Sheet của bạn**, xử lý bằng **Google Apps Script** (miễn phí). Khi chưa làm các bước dưới đây, web vẫn chạy bình thường, chỉ có các nút trả phí sẽ hướng khách liên hệ qua Zalo.

## 1. Tạo Sheet và dán mã
1. Vào https://sheets.google.com, tạo bảng tính mới, đặt tên ví dụ **INNER CODE – Dữ liệu**.
2. Menu **Tiện ích mở rộng → Apps Script**.
3. Xóa nội dung mẫu trong `Code.gs`, dán toàn bộ nội dung file [`apps-script/Code.gs`](../apps-script/Code.gs) của repo vào, bấm **Lưu**.
4. Ở thanh chọn hàm phía trên, chọn **`setup`**, bấm **Chạy**. Google hỏi quyền truy cập: chọn tài khoản của bạn → *Nâng cao* → *Đi tới dự án (không an toàn)* → *Cho phép*. (Cảnh báo này xuất hiện vì đây là mã của chính bạn, chưa qua Google xét duyệt.)
5. Quay lại Sheet: sẽ có các trang tính **Vi, NapXu, GiaoDich, DonHang, TuVan, MoKhoa**. (Trang MoKhoa cũng tự được tạo ở lần mở khóa đầu tiên nếu chưa có.)

## 2. Triển khai thành Web app
1. Trong Apps Script: **Triển khai → Tùy chọn triển khai mới**.
2. Bánh răng *Chọn loại* → **Ứng dụng web**.
3. *Thực thi dưới dạng*: **Tôi**. *Người có quyền truy cập*: **Bất kỳ ai**.
4. Bấm **Triển khai**, sao chép **URL ứng dụng web** (dạng `https://script.google.com/macros/s/…/exec`).

## 3. Gắn URL vào website
Mở file `js/shop/config.js` trên GitHub (bấm biểu tượng bút chì để sửa), dán URL vào:

```js
APPS_SCRIPT_URL: 'https://script.google.com/macros/s/XXXX/exec',
```

Bấm **Commit changes**. Khoảng 1–2 phút sau GitHub Pages cập nhật, chip **"0 Xu"** ở góc phải bắt đầu hoạt động thật.

> URL này không phải mật khẩu; nó công khai trên web là bình thường. Mọi giá xu và số dư đều do Apps Script kiểm tra, người dùng không sửa được từ trình duyệt.

## 4. Quy trình hằng ngày
**Duyệt nạp xu**
1. Khách chọn gói, chuyển khoản với nội dung `NAP <số điện thoại>`. Một dòng mới xuất hiện ở trang **NapXu**, trạng thái **Chờ duyệt**.
2. Bạn kiểm tra sao kê ngân hàng/MoMo thấy tiền về đúng số tiền và nội dung.
3. Ở cột **Trạng thái**, chọn **Đã nhận**. Xu được cộng ngay vào ví khách (cột *Đã cộng lúc* được điền). Mỗi dòng chỉ cộng một lần, đổi qua lại trạng thái cũng không cộng trùng.
4. Không thấy tiền: chọn **Từ chối**.
5. Nếu bạn dán giá trị hàng loạt và xu chưa được cộng: menu **INNER CODE → Cộng xu cho các dòng "Đã nhận"**.

**Đơn hàng (DonHang)**
- *Combo sách in*: đã trừ 249 xu, trạng thái "Đã thanh toán – chờ in". In, gửi hàng, rồi đổi trạng thái tùy ý.
- *Chuông xoay, con lắc, vòng tay*: trạng thái "Chờ báo giá". Gọi khách để báo giá và chốt đơn.

**Mở khóa luận giải (MoKhoa)**: mỗi dòng là một hồ sơ khách đã trả xu (số điện thoại, mục, họ tên + ngày giờ sinh). Khách xem lại, tải lại PDF cùng hồ sơ thì hệ thống tra trang này và không trừ thêm xu. Mua trọn bộ 99 Xu sẽ ghi 4 dòng (trọn bộ + 3 bài lẻ). Đừng xóa dòng ở đây, nếu không khách sẽ bị trừ lại.

**Đặt lịch tư vấn (TuVan)**: tên, số điện thoại, vấn đề. Gọi lại khách và ghi chú trạng thái.

**Cộng / trừ xu bằng tay** (tặng xu, hoàn xu, sửa chỗ duyệt nhầm): menu **INNER CODE → Cộng / trừ xu cho khách (ghi lý do)**, nhập số điện thoại, số xu (số âm để trừ) và lý do. Số dư được cập nhật và trang **GiaoDich** ghi một dòng "Cộng tay" hoặc "Trừ tay" kèm lý do. Nên dùng menu này thay vì sửa trực tiếp cột *Số dư (xu)*.

**Khách quên PIN**: xác minh khách qua Zalo, rồi xóa dòng ví của khách ở trang **Vi** *chỉ khi số dư bằng 0*; nếu còn xu, ghi lại số dư, xóa dòng, và nhờ khách nạp lại với PIN mới rồi cộng bù trong cột *Số dư (xu)*. Sai PIN 5 lần, ví tự khóa 15 phút.

## 5. Khi sửa `Code.gs`
Sau khi dán bản mới: **Triển khai → Quản lý các lần triển khai → bút chì → Phiên bản: Phiên bản mới → Triển khai**. URL giữ nguyên, không cần sửa `config.js`.

## 6. Bảo mật – cần biết
- **Không bao giờ** đặt khóa API (Gemini, Claude, OpenAI…) vào `config.js` hay bất kỳ file nào của website: mọi file trên GitHub Pages ai cũng tải về được. `config.js` chỉ chứa thông tin công khai.
- Khi muốn thêm luận giải bằng AI: đặt khóa trong **biến môi trường** của một hàm máy chủ (ví dụ Vercel → *Settings → Environment Variables*, đọc bằng `process.env.GEMINI_API_KEY` trong `api/*.js`), hoặc trong **Apps Script → Cài đặt dự án → Thuộc tính tập lệnh** (đọc bằng `PropertiesService`). Trình duyệt chỉ gọi hàm máy chủ, không bao giờ thấy khóa.
- Mã PIN được băm SHA-256 kèm muối riêng từng ví; ngay cả bạn mở Sheet cũng không thấy PIN gốc.
- File PDF được tạo ngay trên máy khách sau khi trừ xu. Người rành kỹ thuật vẫn có thể tự in trang luận giải; đây là giới hạn của web tĩnh. Giá trị thật nằm ở bản in, tư vấn 1-1 và vật phẩm.
- Chia sẻ Sheet cho ai thì người đó thấy số điện thoại và địa chỉ khách: chỉ chia sẻ cho người cần.
