/**
 * Prices and products. 1 Xu = 1.000đ.
 * The Apps Script backend keeps its own copy of ITEM_PRICES and never trusts prices sent by the browser;
 * tests/shop.test.js checks both copies stay identical.
 */

export const COIN_VND = 1000;

export const PACKAGES = [
  { vnd: 50000, coins: 50 },
  { vnd: 100000, coins: 100 },
  { vnd: 200000, coins: 200 },
];

export const ITEM_PRICES = {
  single_numerology: 25,
  single_matrix: 25,
  single_bazi: 25,
  full_report: 99,
  print_combo: 249,
};

export const SINGLE_REPORTS = {
  numerology: { item: 'single_numerology', name: 'Thần số học' },
  matrix: { item: 'single_matrix', name: 'Matrix Destiny' },
  bazi: { item: 'single_bazi', name: 'Bát Tự – Ngũ Hành' },
};

export const PRODUCTS = [
  {
    key: 'print_combo',
    name: 'Combo Sách In Hồ Sơ Nội Tâm',
    coins: ITEM_PRICES.print_combo,
    art: 'book',
    text: 'Bản in trọn bộ Hồ sơ nội tâm của riêng bạn: Thần số học, Matrix Destiny và Bát Tự, đóng thành sách và giao tận nhà.',
  },
  {
    key: 'singing_bowl',
    name: 'Chuông Xoay Himalaya',
    coins: null,
    art: 'bowl',
    text: 'Chuông xoay thủ công dùng cho thiền và thư giãn. Sarah Nguyen tư vấn kích cỡ và âm phù hợp với bạn.',
  },
  {
    key: 'pendulum',
    name: 'Con Lắc Cảm Xạ',
    coins: null,
    art: 'pendulum',
    text: 'Con lắc đá tự nhiên dùng trong thực hành chiêm nghiệm, kèm hướng dẫn sử dụng.',
  },
  {
    key: 'bracelet',
    name: 'Vòng Tay Phong Thủy Cá Nhân Hóa',
    coins: null,
    art: 'bracelet',
    personalize: true,
    text: 'Vòng đá phối theo hành có lợi trong lá số Bát Tự của bạn. Gửi ngày giờ sinh để được chọn đá riêng.',
  },
];

export function normalizePhone(raw) {
  let digits = String(raw ?? '').replace(/\D/g, '');
  if (digits.startsWith('84') && digits.length === 11) digits = `0${digits.slice(2)}`;
  if (!/^0[35789]\d{8}$/.test(digits)) throw new Error('Số điện thoại cần đủ 10 số, bắt đầu bằng 03, 05, 07, 08 hoặc 09.');
  return digits;
}

export function validatePin(raw) {
  const pin = String(raw ?? '').trim();
  if (!/^\d{4,6}$/.test(pin)) throw new Error('Mã PIN gồm 4 đến 6 chữ số.');
  return pin;
}

export function packageFor(vnd) {
  const found = PACKAGES.find((p) => p.vnd === Number(vnd));
  if (!found) throw new Error('Gói nạp không hợp lệ.');
  return found;
}

export const formatVnd = (n) => `${n.toLocaleString('vi-VN')}đ`;
