/**
 * INNER CODE – mini backend on Google Sheets (Google Apps Script).
 *
 * Sheets (created by setup()):
 *   Vi        – one row per wallet (phone, hashed PIN, balance)
 *   NapXu     – top-up requests; set "Trạng thái" to "Đã nhận" after checking your bank statement
 *               and the coins are credited automatically (onEdit)
 *   GiaoDich  – every credit and spend
 *   DonHang   – physical orders and quote requests
 *   TuVan     – 1-1 consultation requests
 *   MoKhoa    – paid readings (phone + reading), so a reading is never charged twice
 *
 * Deploy: Extensions → Apps Script → paste this file → run setup() once →
 * Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone.
 * Prices live here, so the browser cannot change what an item costs.
 */

var ITEM_PRICES = {
  single_numerology: 25,
  single_matrix: 25,
  single_bazi: 25,
  full_report: 99,
  print_combo: 249,
};

var ITEM_NAMES = {
  single_numerology: 'PDF Thần số học',
  single_matrix: 'PDF Matrix Destiny',
  single_bazi: 'PDF Bát Tự',
  full_report: 'PDF Hồ sơ nội tâm trọn bộ',
  print_combo: 'Combo sách in Hồ sơ nội tâm',
};

var PACKAGES = { 50000: 50, 100000: 100, 200000: 200 };
var QUOTE_PRODUCTS = {
  singing_bowl: 'Chuông xoay Himalaya',
  pendulum: 'Con lắc cảm xạ',
  bracelet: 'Vòng tay phong thủy cá nhân hóa',
};

var MAX_PIN_FAILS = 5;
var LOCK_MINUTES = 15;
var STATUS_PENDING = 'Chờ duyệt';
var STATUS_APPROVED = 'Đã nhận';
var STATUS_REJECTED = 'Từ chối';

var SHEETS = {
  Vi: ['Số điện thoại', 'PIN (mã hóa)', 'Muối', 'Số dư (xu)', 'Tạo lúc', 'Cập nhật', 'Sai PIN', 'Khóa đến'],
  NapXu: ['Mã', 'Thời gian', 'Số điện thoại', 'Số tiền (đ)', 'Xu', 'Phương thức', 'Nội dung CK', 'Trạng thái', 'Đã cộng lúc', 'Ghi chú'],
  GiaoDich: ['Thời gian', 'Số điện thoại', 'Loại', 'Xu', 'Mục', 'Số dư sau', 'Mã'],
  DonHang: ['Mã', 'Thời gian', 'Số điện thoại', 'Họ tên', 'Địa chỉ', 'Sản phẩm', 'Xu', 'Ghi chú', 'Trạng thái'],
  TuVan: ['Thời gian', 'Họ tên', 'Số điện thoại', 'Vấn đề', 'Trạng thái'],
  MoKhoa: ['Thời gian', 'Số điện thoại', 'Mục', 'Hồ sơ', 'Mã GD'],
};

/* ---------------------------------------------------------------- helpers */

function normalizePhone_(raw) {
  var digits = String(raw == null ? '' : raw).replace(/\D/g, '');
  if (digits.length === 9) digits = '0' + digits; // Sheets may drop the leading zero
  if (digits.indexOf('84') === 0 && digits.length === 11) digits = '0' + digits.slice(2);
  if (!/^0[35789]\d{8}$/.test(digits)) throw new Error('Số điện thoại không hợp lệ.');
  return digits;
}

function validatePin_(raw) {
  var pin = String(raw == null ? '' : raw).trim();
  if (!/^\d{4,6}$/.test(pin)) throw new Error('Mã PIN gồm 4 đến 6 chữ số.');
  return pin;
}

/** Plain text, length-limited, and never interpreted as a formula by Sheets. */
function cleanText_(raw, max) {
  var text = String(raw == null ? '' : raw).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
  if (/^[=+\-@]/.test(text)) text = "'" + text;
  return text;
}

function hashPin_(salt, pin) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + ':' + pin, Utilities.Charset.UTF_8);
  return Utilities.base64Encode(bytes);
}

function newId_(prefix) {
  return prefix + '-' + Utilities.getUuid().slice(0, 8).toUpperCase();
}

/** The named sheet; created with its header row if it is missing (e.g. added in a later version). */
function sheet_(name) {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(name);
  if (!sheet) {
    sheet = book.insertSheet(name);
    sheet.getRange(1, 1, 1, SHEETS[name].length).setValues([SHEETS[name]]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Phone stored in a sheet cell, with the leading zero restored if Sheets dropped it. */
function storedPhone_(cell) {
  var digits = String(cell).replace(/\D/g, '');
  return digits.length === 9 ? '0' + digits : digits;
}

function rows_(name) {
  var sheet = sheet_(name);
  var last = sheet.getLastRow();
  if (last < 2) return [];
  return sheet.getRange(2, 1, last - 1, SHEETS[name].length).getValues();
}

function findWallet_(phone) {
  var data = rows_('Vi');
  for (var i = 0; i < data.length; i += 1) {
    if (storedPhone_(data[i][0]) === phone) {
      return {
        row: i + 2,
        phone: phone,
        hash: String(data[i][1]),
        salt: String(data[i][2]),
        balance: Number(data[i][3]) || 0,
        fails: Number(data[i][6]) || 0,
        lockedUntil: data[i][7] ? new Date(data[i][7]) : null,
      };
    }
  }
  return null;
}

function createWallet_(phone, pin) {
  var salt = Utilities.getUuid();
  var now = new Date();
  sheet_('Vi').appendRow(["'" + phone, hashPin_(salt, pin), salt, 0, now, now, 0, '']);
  return findWallet_(phone);
}

/** Verify the PIN with a lockout after repeated failures. */
function checkPin_(wallet, pin) {
  var sheet = sheet_('Vi');
  var now = new Date();
  if (wallet.lockedUntil && wallet.lockedUntil > now) {
    throw new Error('Ví tạm khóa do nhập sai PIN nhiều lần. Vui lòng thử lại sau ' + LOCK_MINUTES + ' phút.');
  }
  if (hashPin_(wallet.salt, pin) !== wallet.hash) {
    var fails = wallet.fails + 1;
    sheet.getRange(wallet.row, 7).setValue(fails);
    if (fails >= MAX_PIN_FAILS) {
      sheet.getRange(wallet.row, 7, 1, 2).setValues([[0, new Date(now.getTime() + LOCK_MINUTES * 60000)]]);
      throw new Error('Sai PIN quá ' + MAX_PIN_FAILS + ' lần, ví bị khóa ' + LOCK_MINUTES + ' phút.');
    }
    throw new Error('Mã PIN không đúng (còn ' + (MAX_PIN_FAILS - fails) + ' lần thử).');
  }
  if (wallet.fails || wallet.lockedUntil) sheet.getRange(wallet.row, 7, 1, 2).setValues([[0, '']]);
}

function requireWallet_(phone, pin) {
  var wallet = findWallet_(phone);
  if (!wallet) throw new Error('Chưa có ví cho số điện thoại này. Hãy nạp xu lần đầu để tạo ví.');
  checkPin_(wallet, pin);
  return wallet;
}

function setBalance_(wallet, balance) {
  var sheet = sheet_('Vi');
  sheet.getRange(wallet.row, 4).setValue(balance);
  sheet.getRange(wallet.row, 6).setValue(new Date());
}

function logTransaction_(phone, type, coins, item, balanceAfter, ref) {
  sheet_('GiaoDich').appendRow([new Date(), "'" + phone, type, coins, item, balanceAfter, ref]);
}

function pendingCoins_(phone) {
  return rows_('NapXu').reduce(function (sum, r) {
    return storedPhone_(r[2]) === phone && r[7] === STATUS_PENDING ? sum + (Number(r[4]) || 0) : sum;
  }, 0);
}

function spendFrom_(wallet, item) {
  var price = ITEM_PRICES[item];
  if (!price) throw new Error('Sản phẩm không hợp lệ.');
  if (wallet.balance < price) {
    throw new Error('Số dư ' + wallet.balance + ' xu, cần ' + price + ' xu. Vui lòng nạp thêm.');
  }
  var balance = wallet.balance - price;
  setBalance_(wallet, balance);
  var ref = newId_('GD');
  logTransaction_(wallet.phone, 'Trừ', -price, ITEM_NAMES[item], balance, ref);
  return { ref: ref, price: price, balance: balance };
}

/* ------------------------------------------- unlocks (same rules as js/shop/catalog.js) */

function normalizeName_(name) {
  return String(name == null ? '' : name).normalize('NFC').toLowerCase().trim().replace(/\s+/g, ' ');
}

/** The birth data a reading was computed from, validated. */
function readingInput_(raw) {
  raw = raw || {};
  var birthDate = String(raw.birthDate || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) throw new Error('Thiếu ngày sinh của hồ sơ cần mở khóa.');
  var birthTime = String(raw.birthTime || '');
  if (birthTime && !/^\d{2}:\d{2}$/.test(birthTime)) throw new Error('Giờ sinh không hợp lệ.');
  return {
    fullName: String(raw.fullName || '').slice(0, 120),
    birthDate: birthDate,
    birthTime: birthTime,
    gender: raw.gender === 'male' || raw.gender === 'female' ? raw.gender : '',
  };
}

function unlockKey_(item, input) {
  var name = normalizeName_(input.fullName);
  switch (item) {
    case 'single_numerology': return name + '|' + input.birthDate;
    case 'single_matrix': return input.birthDate;
    case 'single_bazi': return input.birthDate + '|' + input.birthTime + '|' + input.gender;
    case 'full_report':
    case 'print_combo': return name + '|' + input.birthDate + '|' + input.birthTime + '|' + input.gender;
    default: throw new Error('Sản phẩm không hợp lệ.');
  }
}

function coveredItems_(item) {
  return item === 'full_report' || item === 'print_combo'
    ? ['full_report', 'single_numerology', 'single_matrix', 'single_bazi']
    : [item];
}

function hasUnlock_(phone, item, key) {
  return rows_('MoKhoa').some(function (r) {
    return storedPhone_(r[1]) === phone && r[2] === item && String(r[3]) === key;
  });
}

function recordUnlocks_(phone, item, input, ref) {
  var sheet = sheet_('MoKhoa');
  coveredItems_(item).forEach(function (covered) {
    // The leading apostrophe keeps keys such as 1990-08-15 as text instead of a date.
    sheet.appendRow([new Date(), "'" + phone, covered, "'" + unlockKey_(covered, input), ref]);
  });
}

/* ---------------------------------------------------------------- actions */

var ACTIONS = {
  topup: function (p) {
    var phone = normalizePhone_(p.phone);
    var pin = validatePin_(p.pin);
    var coins = PACKAGES[Number(p.amount)];
    if (!coins) throw new Error('Gói nạp không hợp lệ.');
    var method = p.method === 'momo' ? 'MoMo' : 'Ngân hàng';
    var wallet = findWallet_(phone);
    if (wallet) checkPin_(wallet, pin); else wallet = createWallet_(phone, pin);
    var code = newId_('NAP');
    var content = 'NAP ' + phone;
    sheet_('NapXu').appendRow([code, new Date(), "'" + phone, Number(p.amount), coins, method, content, STATUS_PENDING, '', '']);
    return { code: code, coins: coins, content: content, balance: wallet.balance, pending: pendingCoins_(phone) };
  },

  balance: function (p) {
    var phone = normalizePhone_(p.phone);
    var wallet = requireWallet_(phone, validatePin_(p.pin));
    return { balance: wallet.balance, pending: pendingCoins_(phone) };
  },

  spend: function (p) {
    if (p.item === 'print_combo') throw new Error('Combo sách in cần địa chỉ giao hàng, vui lòng đặt qua mục Đặt in.');
    if (!ITEM_PRICES[p.item]) throw new Error('Sản phẩm không hợp lệ.');
    var phone = normalizePhone_(p.phone);
    var wallet = requireWallet_(phone, validatePin_(p.pin));
    // Pages from before unlock tracking send no birth data: charge as before.
    if (!p.input) return spendFrom_(wallet, p.item);
    var input = readingInput_(p.input);
    // A reading this phone already paid for (directly or through the full report) is free to reopen.
    if (hasUnlock_(phone, p.item, unlockKey_(p.item, input))) return { already: true, price: 0, balance: wallet.balance };
    var spent = spendFrom_(wallet, p.item);
    recordUnlocks_(phone, p.item, input, spent.ref);
    return spent;
  },

  order: function (p) {
    var phone = normalizePhone_(p.phone);
    var name = cleanText_(p.name, 80);
    var address = cleanText_(p.address, 250);
    var note = cleanText_(p.note, 300);
    if (name.length < 2) throw new Error('Vui lòng nhập họ tên người nhận.');
    if (address.length < 10) throw new Error('Vui lòng nhập địa chỉ nhận hàng đầy đủ.');
    var code = newId_('DH');
    if (p.item === 'print_combo') {
      var wallet = requireWallet_(phone, validatePin_(p.pin));
      var input = p.input ? readingInput_(p.input) : null;
      var spent = spendFrom_(wallet, 'print_combo');
      if (input) recordUnlocks_(phone, 'print_combo', input, spent.ref);
      sheet_('DonHang').appendRow([code, new Date(), "'" + phone, name, address, ITEM_NAMES.print_combo, spent.price, note, 'Đã thanh toán – chờ in']);
      return { code: code, balance: spent.balance, price: spent.price };
    }
    var product = QUOTE_PRODUCTS[p.item];
    if (!product) throw new Error('Sản phẩm không hợp lệ.');
    sheet_('DonHang').appendRow([code, new Date(), "'" + phone, name, address, product, '', note, 'Chờ báo giá']);
    return { code: code };
  },

  consult: function (p) {
    var phone = normalizePhone_(p.phone);
    var name = cleanText_(p.name, 80);
    var issue = cleanText_(p.issue, 600);
    if (name.length < 2) throw new Error('Vui lòng nhập họ tên.');
    sheet_('TuVan').appendRow([new Date(), name, "'" + phone, issue, 'Mới']);
    return {};
  },
};

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var handler = ACTIONS[payload.action];
    if (!handler) throw new Error('Yêu cầu không hợp lệ.');
    // One request at a time, so two spends can never use the same coins.
    lock.waitLock(20000);
    var result = handler(payload);
    result.ok = true;
    return json_(result);
  } catch (error) {
    return json_({ ok: false, error: String(error && error.message ? error.message : error) });
  } finally {
    try { lock.releaseLock(); } catch (ignored) { /* lock was never taken */ }
  }
}

function doGet() {
  return json_({ ok: true, service: 'INNER CODE' });
}

/* ------------------------------------------------- admin: approve top-ups */

/** Credit a top-up row once (status "Đã nhận", "Đã cộng lúc" still empty). */
function creditTopupRow_(row) {
  var sheet = sheet_('NapXu');
  var values = sheet.getRange(row, 1, 1, SHEETS.NapXu.length).getValues()[0];
  if (values[7] !== STATUS_APPROVED || values[8]) return false;
  var phone = normalizePhone_(values[2]);
  var coins = Number(values[4]) || 0;
  var wallet = findWallet_(phone);
  if (!wallet || coins <= 0) {
    sheet.getRange(row, 10).setValue('Không tìm thấy ví hoặc số xu không hợp lệ');
    return false;
  }
  var balance = wallet.balance + coins;
  setBalance_(wallet, balance);
  sheet.getRange(row, 9).setValue(new Date());
  logTransaction_(phone, 'Nạp', coins, 'Nạp ' + values[3] + 'đ qua ' + values[5], balance, values[0]);
  return true;
}

/** Simple trigger: runs when you edit the sheet. */
function onEdit(e) {
  if (!e || !e.range) return;
  var sheet = e.range.getSheet();
  if (sheet.getName() !== 'NapXu' || e.range.getColumn() > 8 || e.range.getColumn() + e.range.getNumColumns() - 1 < 8) return;
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    for (var r = e.range.getRow(); r < e.range.getRow() + e.range.getNumRows(); r += 1) {
      if (r >= 2) creditTopupRow_(r);
    }
  } finally {
    lock.releaseLock();
  }
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('INNER CODE')
    .addItem('Cộng xu cho các dòng "Đã nhận"', 'creditAllApproved')
    .addItem('Cộng / trừ xu cho khách (ghi lý do)', 'adjustCoins')
    .addToUi();
}

/** Menu: change a wallet by hand (gift, refund, correction) and log it in GiaoDich. */
function adjustCoins() {
  var ui = SpreadsheetApp.getUi();
  var ask = function (text) {
    var res = ui.prompt('Cộng / trừ xu', text, ui.ButtonSet.OK_CANCEL);
    return res.getSelectedButton() === ui.Button.OK ? res.getResponseText() : null;
  };
  var phone = ask('Số điện thoại của khách:');
  if (phone === null) return;
  var amount = ask('Số xu: số dương để cộng (vd 50), số âm để trừ (vd -25):');
  if (amount === null) return;
  var reason = ask('Lý do (ghi vào trang GiaoDich), vd: Tặng khách quen, Hoàn xu do lỗi:');
  if (reason === null) return;
  try {
    var result = adjustCoins_(phone, amount, reason);
    ui.alert('Đã cập nhật ví ' + result.phone + '. Số dư mới: ' + result.balance + ' xu.');
  } catch (error) {
    ui.alert('Chưa cập nhật: ' + error.message);
  }
}

function adjustCoins_(rawPhone, rawAmount, rawReason) {
  var phone = normalizePhone_(rawPhone);
  var amount = Number(String(rawAmount).replace(/\s/g, ''));
  if (!Number.isInteger(amount) || amount === 0 || Math.abs(amount) > 100000) {
    throw new Error('Số xu phải là số nguyên khác 0, ví dụ 50 hoặc -25.');
  }
  var reason = cleanText_(rawReason, 200);
  if (reason.length < 2) throw new Error('Vui lòng ghi lý do để sau này đối soát.');
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var wallet = findWallet_(phone);
    if (!wallet) throw new Error('Số này chưa có ví. Khách cần tạo yêu cầu nạp xu lần đầu trên web để tạo ví.');
    var balance = wallet.balance + amount;
    if (balance < 0) throw new Error('Ví chỉ còn ' + wallet.balance + ' xu, không trừ được ' + (-amount) + ' xu.');
    setBalance_(wallet, balance);
    logTransaction_(phone, amount > 0 ? 'Cộng tay' : 'Trừ tay', amount, reason, balance, newId_('DC'));
    return { phone: phone, balance: balance };
  } finally {
    lock.releaseLock();
  }
}

/** Menu backup in case an edit did not trigger onEdit (e.g. pasted values). */
function creditAllApproved() {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var count = 0;
    var last = sheet_('NapXu').getLastRow();
    for (var r = 2; r <= last; r += 1) if (creditTopupRow_(r)) count += 1;
    return count;
  } finally {
    lock.releaseLock();
  }
}

/** Run once from the Apps Script editor to create the sheets. */
function setup() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SHEETS).forEach(function (name) {
    var sheet = book.getSheetByName(name) || book.insertSheet(name);
    sheet.getRange(1, 1, 1, SHEETS[name].length).setValues([SHEETS[name]]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  });
  var status = SpreadsheetApp.newDataValidation()
    .requireValueInList([STATUS_PENDING, STATUS_APPROVED, STATUS_REJECTED], true)
    .build();
  sheet_('NapXu').getRange('H2:H').setDataValidation(status);
}
