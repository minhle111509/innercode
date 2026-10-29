/**
 * Runs apps-script/Code.gs inside an in-memory imitation of the Apps Script services
 * (SpreadsheetApp, Utilities, LockService, ContentService) to exercise the real backend code.
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import vm from 'node:vm';
import { ITEM_PRICES, PACKAGES, unlockKey, coveredItems } from '../js/shop/catalog.js';

const SOURCE = readFileSync(new URL('../apps-script/Code.gs', import.meta.url), 'utf8');

function fakeSheet(name) {
  const grid = [];
  const sent = []; // rows exactly as the script sent them, before Sheets interprets them
  const sheet = {
    grid,
    sent,
    getName: () => name,
    getLastRow: () => grid.length,
    setFrozenRows() {},
    appendRow(values) {
      sent.push(values);
      // Real Sheets stores "'0987..." as the text 0987...; mimic that.
      grid.push(values.map((v) => (typeof v === 'string' && v.startsWith("'") ? v.slice(1) : v)));
    },
    getRange(row, col, numRows = 1, numCols = 1) {
      if (typeof row === 'string') return { setDataValidation() {} };
      const range = {
        getSheet: () => sheet,
        getRow: () => row,
        getColumn: () => col,
        getNumRows: () => numRows,
        getNumColumns: () => numCols,
        getValues: () => Array.from({ length: numRows }, (_, r) =>
          Array.from({ length: numCols }, (_, c) => grid[row - 1 + r]?.[col - 1 + c] ?? '')),
        getValue: () => grid[row - 1]?.[col - 1] ?? '',
        setValues(values) {
          values.forEach((line, r) => line.forEach((v, c) => {
            grid[row - 1 + r] ??= [];
            grid[row - 1 + r][col - 1 + c] = v;
          }));
          return range;
        },
        setValue(v) { return range.setValues([[v]]); },
        setFontWeight() { return range; },
        setDataValidation() { return range; },
      };
      return range;
    },
  };
  return sheet;
}

function makeContext() {
  const sheets = new Map();
  const book = {
    getSheetByName: (n) => sheets.get(n) ?? null,
    insertSheet: (n) => { const s = fakeSheet(n); sheets.set(n, s); return s; },
  };
  const builder = { requireValueInList() { return builder; }, build: () => ({}) };
  const context = {
    SpreadsheetApp: { getActiveSpreadsheet: () => book, newDataValidation: () => builder, getUi: () => ({}) },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'sha256' },
      Charset: { UTF_8: 'utf8' },
      computeDigest: (_alg, text) => [...createHash('sha256').update(text, 'utf8').digest()],
      base64Encode: (bytes) => Buffer.from(bytes).toString('base64'),
      getUuid: () => randomUUID(),
    },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (text) => ({ text, setMimeType() { return this; } }),
    },
  };
  vm.createContext(context);
  vm.runInContext(SOURCE, context);
  context.setup();
  return { context, sheets };
}

let ctx;
let sheets;
const call = (payload) => JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(payload) } }).text);
const approve = (row) => {
  const range = sheets.get('NapXu').getRange(row, 8);
  range.setValue('Đã nhận');
  ctx.onEdit({ range });
};

beforeEach(() => { ({ context: ctx, sheets } = makeContext()); });

const HOA = { fullName: 'Nguyễn Thị  Hoa', birthDate: '1990-08-15', birthTime: '07:30', gender: 'female' };

test('setup creates every sheet with headers', () => {
  for (const name of ['Vi', 'NapXu', 'GiaoDich', 'DonHang', 'TuVan', 'MoKhoa']) {
    assert.ok(sheets.get(name).grid[0].length >= 5, name);
  }
});

test('server prices and packages match the website catalogue', () => {
  assert.deepEqual({ ...ctx.ITEM_PRICES }, ITEM_PRICES);
  assert.deepEqual(Object.fromEntries(Object.entries(ctx.PACKAGES).map(([k, v]) => [Number(k), v])),
    Object.fromEntries(PACKAGES.map((p) => [p.vnd, p.coins])));
});

test('top-up creates a wallet with a hashed PIN and a pending request', () => {
  const r = call({ action: 'topup', phone: '0987 654 321', pin: '2468', amount: 100000, method: 'bank' });
  assert.equal(r.ok, true);
  assert.equal(r.content, 'NAP 0987654321');
  assert.equal(r.coins, 100);
  assert.equal(r.balance, 0);
  assert.equal(r.pending, 100);
  const wallet = sheets.get('Vi').grid[1];
  assert.equal(wallet[0], '0987654321');
  assert.notEqual(wallet[1], '2468');
  assert.equal(sheets.get('NapXu').grid[1][7], 'Chờ duyệt');
});

test('top-up rejects unknown packages and invalid phones', () => {
  assert.match(call({ action: 'topup', phone: '0987654321', pin: '2468', amount: 70000 }).error, /Gói/);
  assert.match(call({ action: 'topup', phone: '123', pin: '2468', amount: 50000 }).error, /điện thoại/);
  assert.match(call({ action: 'nope' }).error, /không hợp lệ/);
});

test('approving a top-up credits once, then spending uses server prices', () => {
  call({ action: 'topup', phone: '0987654321', pin: '2468', amount: 100000 });
  approve(2);
  approve(2); // a second edit must not credit twice
  let b = call({ action: 'balance', phone: '0987654321', pin: '2468' });
  assert.equal(b.balance, 100);
  assert.equal(b.pending, 0);

  const spend = call({ action: 'spend', phone: '0987654321', pin: '2468', item: 'full_report', coins: 1, input: HOA });
  assert.equal(spend.price, 99, 'price comes from the server, not the request');
  assert.equal(spend.balance, 1);
  assert.match(call({ action: 'spend', phone: '0987654321', pin: '2468', item: 'single_matrix', input: { birthDate: '2000-01-13' } }).error, /cần 25 xu/);
  assert.match(call({ action: 'spend', phone: '0987654321', pin: '2468', item: 'free_stuff', input: HOA }).error, /không hợp lệ/);
  assert.match(call({ action: 'spend', phone: '0987654321', pin: '2468', item: 'single_matrix', input: { fullName: 'Hoa' } }).error, /ngày sinh/);
  b = call({ action: 'balance', phone: '0987654321', pin: '2468' });
  assert.equal(b.balance, 1);
  const log = sheets.get('GiaoDich').grid.slice(1).map((r) => [r[2], r[3]]);
  assert.deepEqual(log, [['Nạp', 100], ['Trừ', -99]]);
});

test('a paid reading is never charged twice, and the full report opens the singles', () => {
  call({ action: 'topup', phone: '0987654321', pin: '2468', amount: 200000 });
  approve(2);
  const single = { fullName: 'Lan', birthDate: '2000-01-13' };
  assert.equal(call({ action: 'spend', phone: '0987654321', pin: '2468', item: 'single_numerology', input: single }).balance, 175);
  const again = call({ action: 'spend', phone: '0987654321', pin: '2468', item: 'single_numerology', input: { ...single, fullName: ' LAN ' } });
  assert.equal(again.already, true, 'same person (name normalised) reopens for free');
  assert.equal(again.balance, 175);
  assert.equal(call({ action: 'spend', phone: '0987654321', pin: '2468', item: 'single_numerology', input: { fullName: 'Lan', birthDate: '2000-01-14' } }).balance, 150, 'another birth date is a new reading');

  assert.equal(call({ action: 'spend', phone: '0987654321', pin: '2468', item: 'full_report', input: HOA }).balance, 51);
  for (const item of ['single_numerology', 'single_matrix', 'single_bazi', 'full_report']) {
    const r = call({ action: 'spend', phone: '0987654321', pin: '2468', item, input: HOA });
    assert.equal(r.already, true, item);
  }
  // Another phone does not inherit the unlock.
  call({ action: 'topup', phone: '0911222333', pin: '1111', amount: 50000 });
  approve(3);
  assert.equal(call({ action: 'spend', phone: '0911222333', pin: '1111', item: 'single_matrix', input: HOA }).price, 25);
  assert.equal(sheets.get('MoKhoa').grid[0][3], 'Hồ sơ', 'MoKhoa is created on demand with headers');
  assert.equal(sheets.get('GiaoDich').grid.filter((r) => r[2] === 'Trừ').length, 4);
});

test('unlock keys match between the website and the server', () => {
  const inputs = [HOA, { fullName: 'Lê  Văn A', birthDate: '1985-12-01' }, { birthDate: '2001-02-03', birthTime: '23:15', gender: 'male' }];
  for (const input of inputs) {
    for (const item of ['single_numerology', 'single_matrix', 'single_bazi', 'full_report', 'print_combo']) {
      assert.equal(ctx.unlockKey_(item, ctx.readingInput_(input)), unlockKey(item, input), `${item} ${JSON.stringify(input)}`);
      assert.deepEqual([...ctx.coveredItems_(item)], coveredItems(item));
    }
  }
});

test('wrong PIN is counted and locks the wallet after 5 tries', () => {
  call({ action: 'topup', phone: '0987654321', pin: '2468', amount: 50000 });
  for (let i = 1; i <= 4; i += 1) {
    assert.match(call({ action: 'balance', phone: '0987654321', pin: '0000' }).error, /không đúng/);
  }
  assert.match(call({ action: 'balance', phone: '0987654321', pin: '0000' }).error, /khóa/);
  assert.match(call({ action: 'balance', phone: '0987654321', pin: '2468' }).error, /tạm khóa/);
});

test('a correct PIN resets the failure counter', () => {
  call({ action: 'topup', phone: '0987654321', pin: '2468', amount: 50000 });
  call({ action: 'balance', phone: '0987654321', pin: '0000' });
  assert.equal(call({ action: 'balance', phone: '0987654321', pin: '2468' }).ok, true);
  assert.equal(sheets.get('Vi').grid[1][6], 0);
});

test('print combo order deducts 249 coins and records the address', () => {
  call({ action: 'topup', phone: '0912345678', pin: '1357', amount: 200000 });
  call({ action: 'topup', phone: '0912345678', pin: '1357', amount: 100000 });
  approve(2);
  approve(3);
  assert.match(call({ action: 'order', phone: '0912345678', pin: '1357', item: 'print_combo', name: 'Lan', address: 'ngắn' }).error, /địa chỉ/);
  const r = call({ action: 'order', phone: '0912345678', pin: '1357', item: 'print_combo', name: 'Trần Lan', address: '12 Lê Lợi, Quận 1, TP.HCM', input: HOA });
  assert.equal(r.ok, true);
  assert.equal(r.balance, 51);
  assert.equal(call({ action: 'spend', phone: '0912345678', pin: '1357', item: 'full_report', input: HOA }).already, true, 'the printed book also opens the reading');
  const order = sheets.get('DonHang').grid[1];
  assert.equal(order[5], 'Combo sách in Hồ sơ nội tâm');
  assert.equal(order[8], 'Đã thanh toán – chờ in');
  assert.match(call({ action: 'spend', phone: '0912345678', pin: '1357', item: 'print_combo' }).error, /Đặt in/);
});

test('quote requests need no wallet and never deduct coins', () => {
  const r = call({ action: 'order', phone: '0912345678', item: 'bracelet', name: 'Mai', address: '45 Nguyễn Huệ, Huế', note: 'Sinh 15/08/1990 10:00' });
  assert.equal(r.ok, true);
  assert.equal(sheets.get('DonHang').grid[1][8], 'Chờ báo giá');
  assert.equal(sheets.get('Vi').grid.length, 1);
});

test('consultation requests are stored safely (no formula injection)', () => {
  const r = call({ action: 'consult', name: '=HYPERLINK("x")', phone: '0909799695', issue: '+cmd' });
  assert.equal(r.ok, true);
  const sent = sheets.get('TuVan').sent[0];
  assert.ok(sent[1].startsWith("'="), 'a leading apostrophe makes Sheets keep it as plain text');
  assert.ok(sent[3].startsWith("'+"));
  assert.equal(sheets.get('TuVan').grid[1][2], '0909799695');
});

test('wallets are found even when Sheets drops the leading zero', () => {
  call({ action: 'topup', phone: '0987654321', pin: '2468', amount: 50000 });
  sheets.get('Vi').grid[1][0] = 987654321; // number, as Sheets may store it
  assert.equal(call({ action: 'balance', phone: '0987654321', pin: '2468' }).ok, true);
});

test('menu backup credits approved rows that onEdit missed', () => {
  call({ action: 'topup', phone: '0987654321', pin: '2468', amount: 50000 });
  sheets.get('NapXu').grid[1][7] = 'Đã nhận'; // e.g. pasted value, no onEdit event
  assert.equal(ctx.creditAllApproved(), 1);
  assert.equal(ctx.creditAllApproved(), 0);
  assert.equal(call({ action: 'balance', phone: '0987654321', pin: '2468' }).balance, 50);
});
