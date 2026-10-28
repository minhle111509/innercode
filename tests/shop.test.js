import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crc16, buildVietQR, parseTLV, transferContent } from '../js/shop/vietqr.js';
import {
  PACKAGES, ITEM_PRICES, PRODUCTS, normalizePhone, validatePin, packageFor, formatVnd,
} from '../js/shop/catalog.js';
import { CONFIG } from '../js/shop/config.js';

// Payload decoded from the owner's printed Vietcombank VietQR.
const OWNER_STATIC_QR = '00020101021138570010A00000072701270006970436011300710011519430208QRIBFTTA53037045802VN63045309';

test('crc16 matches the owner QR checksum', () => {
  assert.equal(crc16(OWNER_STATIC_QR.slice(0, -4)), '5309');
});

test('static VietQR is byte-identical to the owner printed QR', () => {
  assert.equal(buildVietQR({ bin: CONFIG.BANK.bin, account: CONFIG.BANK.account }), OWNER_STATIC_QR);
});

test('dynamic VietQR carries amount, transfer content and a valid CRC', () => {
  const payload = buildVietQR({ bin: '970436', account: '0071001151943', amount: 100000, info: transferContent('0987654321') });
  const tlv = parseTLV(payload);
  assert.equal(tlv['01'], '12');
  assert.equal(tlv['54'], '100000');
  assert.equal(parseTLV(tlv['62'])['08'], 'NAP 0987654321');
  assert.equal(tlv['63'], crc16(payload.slice(0, -4)));
});

test('buildVietQR rejects bad input', () => {
  assert.throws(() => buildVietQR({ bin: '97043', account: '1' }), /BIN/);
  assert.throws(() => buildVietQR({ bin: '970436', account: '00-71' }), /tài khoản/);
  assert.throws(() => buildVietQR({ bin: '970436', account: '1', amount: -5 }), /Số tiền/);
  assert.throws(() => buildVietQR({ bin: '970436', account: '1', info: 'NẠP tiền' }), /không dấu/);
});

test('phone and PIN validation', () => {
  assert.equal(normalizePhone('0987 654 321'), '0987654321');
  assert.equal(normalizePhone('+84 909 799 695'), '0909799695');
  assert.throws(() => normalizePhone('12345'), /10 số/);
  assert.throws(() => normalizePhone('0187654321'), /10 số/);
  assert.equal(validatePin(' 1234 '), '1234');
  assert.throws(() => validatePin('12'), /PIN/);
  assert.throws(() => validatePin('abcd'), /PIN/);
});

test('packages, prices and products', () => {
  assert.deepEqual(PACKAGES.map((p) => [p.vnd, p.coins]), [[50000, 50], [100000, 100], [200000, 200]]);
  assert.equal(packageFor('100000').coins, 100);
  assert.throws(() => packageFor(70000), /Gói/);
  assert.equal(ITEM_PRICES.full_report, 99);
  assert.equal(ITEM_PRICES.single_matrix, 25);
  assert.equal(PRODUCTS.find((p) => p.key === 'print_combo').coins, 249);
  assert.equal(formatVnd(100000), '100.000đ');
  assert.equal(CONFIG.APPS_SCRIPT_URL, '', 'keep the shipped config empty; the owner fills it in');
  assert.ok(!/key|secret|password/i.test(JSON.stringify(CONFIG)), 'config.js must not contain secrets');
});
