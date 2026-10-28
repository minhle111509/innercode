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

Mỗi tính năng có module logic thuần (không đụng DOM, có unit test) và một file `page.js` cho giao diện. Phần dùng chung nằm trong `js/shared/` (DOM an toàn XSS, đọc ngày sinh, cộng chữ số, lịch âm).

## Chi tiết từng hệ thống
**Thần số học.** Số chủ đạo (cách tính Việt Nam: giữ 2–11, 22, 33), số ngày sinh, thái độ, sứ mệnh, linh hồn, nhân cách, trưởng thành; 4 đỉnh cao kèm độ tuổi (đỉnh 1 = 36 − số chủ đạo) và 4 thử thách; chu kỳ năm cá nhân; biểu đồ ngày sinh với 8 mũi tên (trọn/trống); luận giải sự nghiệp và tình yêu.

**Matrix Destiny.** A = ngày, B = tháng, C = tổng chữ số năm, D = A+B+C, E = A+B+C+D, rút gọn về 1–22; góc dòng tộc, điểm phụ, kênh tài chính và tình yêu, đuôi nghiệp, 4 mục đích sống; nghề nghiệp và lời khuyên cho từng năng lượng.

**Bát Tự.** Trụ năm và tháng đổi theo tiết khí (Lập Xuân, Kinh Trập…) tính từ kinh độ mặt trời; trụ ngày từ số ngày Julius; trụ giờ theo Ngũ Thử Độn, từ 23h tính sang ngày hôm sau. Tuổi và mệnh nạp âm theo năm âm lịch. Cân bằng ngũ hành, thân vượng/nhược (cách tính giản lược) và hành nên bồi đắp.

**Kinh Dịch Mai Hoa.** Lập quẻ theo thời điểm (tự đổi âm lịch) hoặc theo số; quẻ chủ, hỗ, biến; ý nghĩa vị trí hào động; Thể – Dụng theo ngũ hành; thuộc tính 8 quẻ đơn; lời khuyên cho 64 quẻ.

**Tarot.** 78 lá Rider–Waite, xáo bằng `crypto.getRandomValues`; 5 kiểu trải bài gồm Celtic Cross 10 lá; lời khuyên cho 22 lá Ẩn Chính.

**Khám phá bản thân.** Trắc nghiệm 36 câu dựa trên 9 nhóm Enneagram (nhóm chính, cánh, hướng phát triển/căng thẳng); bánh xe cuộc sống 8 lĩnh vực với biểu đồ radar; 3 bài thở có hẹn giờ; câu hỏi nhật ký theo chủ đề (nháp lưu trên trình duyệt của người dùng).

**Hồ sơ nội tâm.** Mỗi kết quả chính được gắn vào 8 chủ đề sống; chủ đề được nhiều hệ thống cùng nhắc đến xếp cao hơn, có ghi nguồn. Bảng đối chiếu 6 khía cạnh; ảnh hưởng của năm hiện tại tới nhật chủ (Thập Thần rút gọn). Toàn bộ chạy theo quy tắc trên trình duyệt, không dùng AI.

> Các trường phái huyền học có nhiều biến thể công thức; dự án chọn cách tính phổ biến và có test với ví dụ tính tay, lịch vạn niên. Nội dung luận giải mang tính tham khảo.

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

## Hướng phát triển (giai đoạn 2)
Tài khoản thành viên, lưu hồ sơ, báo cáo AI và thanh toán cần thêm máy chủ (backend) để giữ khóa API và dữ liệu người dùng an toàn; không thể làm an toàn trên web tĩnh.
