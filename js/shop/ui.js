/**
 * Site-wide wallet, payment, order and consultation UI.
 * Loaded on every page; other pages import purchase()/orderProduct()/openConsult().
 */

import { el, setChildren } from '../shared/dom.js';
import { CONFIG } from './config.js';
import { isConfigured, callBackend } from './api.js';
import { buildVietQR, transferContent } from './vietqr.js';
import {
  PACKAGES, ITEM_PRICES, PRODUCTS, normalizePhone, validatePin, packageFor, formatVnd,
} from './catalog.js';

const STORE_KEY = 'innercode-wallet';

/* ---------- per-viewer cache (display only; the Sheet is the source of truth) ---------- */
function loadCache() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) ?? {}; } catch { return {}; }
}
function saveCache(data) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify({ ...loadCache(), ...data })); } catch { /* storage unavailable */ }
}

/* ---------- dialog helper ---------- */
let dialog;
function ensureDialog() {
  if (dialog) return dialog;
  dialog = el('dialog', { class: 'modal', 'aria-labelledby': 'modal-title' });
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  document.body.append(dialog);
  return dialog;
}

function openModal(title, ...content) {
  const d = ensureDialog();
  setChildren(d,
    el('div', { class: 'modal-head' }, [
      el('h2', { id: 'modal-title', text: title }),
      el('button', { type: 'button', class: 'modal-close', 'aria-label': 'Đóng' }, '×'),
    ]),
    el('div', { class: 'modal-body' }, content),
  );
  d.querySelector('.modal-close').addEventListener('click', () => d.close());
  if (!d.open) d.showModal();
  return d;
}

const statusLine = () => el('p', { class: 'form-status', role: 'status', 'aria-live': 'polite' });
function setStatus(node, text, kind = '') {
  node.textContent = text;
  node.className = `form-status${kind ? ` ${kind}` : ''}`;
}

function field(label, input, hint) {
  return el('label', { class: 'field' }, [el('span', { text: label }), input, hint ? el('small', { class: 'hint', text: hint }) : null]);
}

function phoneInput(id) {
  return el('input', { id, name: 'phone', type: 'tel', inputmode: 'numeric', autocomplete: 'tel', maxlength: 15, placeholder: 'Ví dụ: 0987654321', value: loadCache().phone ?? '' });
}
function pinInput(id) {
  return el('input', { id, name: 'pin', type: 'password', inputmode: 'numeric', autocomplete: 'off', maxlength: 6, placeholder: '4–6 chữ số' });
}

async function copyText(text, statusNode) {
  try {
    await navigator.clipboard.writeText(text);
    setStatus(statusNode, `Đã sao chép: ${text}`, 'good');
  } catch {
    setStatus(statusNode, `Hãy chép tay: ${text}`);
  }
}

/* ---------- wallet chip ---------- */
let chip;
function renderChip() {
  const { balance } = loadCache();
  chip.querySelector('.wallet-amount').textContent = `${Number.isFinite(balance) ? balance : 0} Xu`;
}

function mountChrome() {
  chip = el('button', { type: 'button', class: 'wallet-chip', 'aria-label': 'Ví xu của bạn' }, [
    el('span', { class: 'wallet-dot', 'aria-hidden': 'true' }),
    el('span', { class: 'wallet-amount', text: '0 Xu' }),
  ]);
  chip.addEventListener('click', () => openWallet());
  const cta = el('button', { type: 'button', class: 'expert-cta' }, [
    el('span', { class: 'expert-cta-dot', 'aria-hidden': 'true' }),
    el('span', { text: 'Kết nối chuyên gia' }),
  ]);
  cta.addEventListener('click', () => openConsult());
  document.body.append(chip, cta);
  renderChip();

  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-open-wallet], [data-open-consult], [data-order]');
    if (!target) return;
    event.preventDefault();
    if (target.matches('[data-open-wallet]')) openWallet();
    else if (target.matches('[data-open-consult]')) openConsult(target.dataset.openConsult);
    else orderProduct(target.dataset.order);
  });
}

/* ---------- wallet & top-up ---------- */
let qrLib;
function loadQrLib() {
  qrLib ??= new Promise((resolve, reject) => {
    const script = el('script', { src: new URL('../vendor/qrcode.js', import.meta.url).href });
    script.onload = () => resolve(window.qrcode);
    script.onerror = () => reject(new Error('Không tải được bộ tạo mã QR.'));
    document.head.append(script);
  });
  return qrLib;
}

async function bankQrImage(amount, info) {
  const qrcode = await loadQrLib();
  const qr = qrcode(0, 'M');
  qr.addData(buildVietQR({ bin: CONFIG.BANK.bin, account: CONFIG.BANK.account, amount, info }));
  qr.make();
  return el('img', { class: 'pay-qr', src: qr.createDataURL(6, 2), alt: `Mã VietQR chuyển ${formatVnd(amount)} tới ${CONFIG.BANK.name}`, width: 240, height: 240 });
}

function paymentPanel(method, pack, phone) {
  const content = transferContent(phone);
  const copyStatus = statusLine();
  const copyBtn = (label, text) => {
    const b = el('button', { type: 'button', class: 'btn secondary small', text: label });
    b.addEventListener('click', () => copyText(text, copyStatus));
    return b;
  };
  const qrSlot = el('div', { class: 'pay-qr-slot' });
  const rows = [
    ['Số tiền', formatVnd(pack.vnd)],
    ['Nội dung chuyển khoản', content],
  ];
  if (method === 'bank') {
    rows.unshift(['Ngân hàng', CONFIG.BANK.name], ['Chủ tài khoản', CONFIG.BANK.holder], ['Số tài khoản', CONFIG.BANK.account]);
    bankQrImage(pack.vnd, content)
      .then((img) => qrSlot.replaceChildren(img))
      .catch((error) => qrSlot.replaceChildren(el('p', { class: 'form-status bad', text: error.message })));
  } else {
    qrSlot.append(el('img', { class: 'pay-qr', src: CONFIG.MOMO.qrImage, alt: 'Mã QR MoMo của INNER CODE', width: 240, height: 255 }));
  }
  return el('div', { class: 'pay-panel' }, [
    qrSlot,
    el('div', { class: 'pay-info' }, [
      el('dl', { class: 'bank' }, rows.map(([k, v]) => el('div', {}, [el('dt', { text: k }), el('dd', { text: v })]))),
      el('div', { class: 'row-actions' }, [
        copyBtn('Sao chép nội dung', content),
        copyBtn('Sao chép số tiền', String(pack.vnd)),
        method === 'bank' ? copyBtn('Sao chép số TK', CONFIG.BANK.account) : null,
      ]),
      copyStatus,
      el('p', { class: 'hint', text: method === 'bank'
        ? 'Mở app ngân hàng → Quét mã. Số tiền và nội dung đã điền sẵn; kiểm tra tên người nhận NGUYEN THI KIM NGAN trước khi xác nhận.'
        : `Mở MoMo → Quét mã → nhập số tiền ${formatVnd(pack.vnd)} và lời nhắn "${content}".` }),
    ]),
  ]);
}

export function openWallet() {
  const cache = loadCache();
  const phone = phoneInput('wallet-phone');
  const pin = pinInput('wallet-pin');
  const status = statusLine();
  const balanceBox = el('p', { class: 'wallet-balance' }, [
    el('span', { class: 'core-label', text: 'Số dư' }),
    el('strong', { text: `${cache.balance ?? 0} Xu` }),
    cache.pending ? el('span', { class: 'muted', text: ` · ${cache.pending} xu đang chờ duyệt` }) : null,
  ]);

  let pack = PACKAGES[1];
  let method = 'bank';
  const packButtons = PACKAGES.map((p) => {
    const b = el('button', { type: 'button', class: `pack${p === pack ? ' active' : ''}`, 'aria-pressed': String(p === pack) }, [
      el('strong', { text: `${p.coins} Xu` }), el('span', { text: formatVnd(p.vnd) }),
    ]);
    b.addEventListener('click', () => {
      pack = p;
      packButtons.forEach((x, i) => { x.classList.toggle('active', PACKAGES[i] === p); x.setAttribute('aria-pressed', String(PACKAGES[i] === p)); });
    });
    return b;
  });
  const methodButtons = [['bank', 'Ngân hàng (VietQR)'], ['momo', 'Ví MoMo']].map(([key, label]) => {
    const b = el('button', { type: 'button', class: `seg${key === method ? ' active' : ''}`, 'aria-pressed': String(key === method), text: label });
    b.addEventListener('click', () => {
      method = key;
      methodButtons.forEach((x) => { const on = x === b; x.classList.toggle('active', on); x.setAttribute('aria-pressed', String(on)); });
    });
    return b;
  });
  const payArea = el('div');

  const checkBtn = el('button', { type: 'button', class: 'btn secondary', text: 'Xem số dư' });
  checkBtn.addEventListener('click', async () => {
    try {
      const p = normalizePhone(phone.value);
      const data = await callBackend('balance', { phone: p, pin: validatePin(pin.value) });
      saveCache({ phone: p, balance: data.balance, pending: data.pending });
      renderChip();
      setChildren(balanceBox, el('span', { class: 'core-label', text: 'Số dư' }), el('strong', { text: `${data.balance} Xu` }),
        data.pending ? el('span', { class: 'muted', text: ` · ${data.pending} xu đang chờ duyệt` }) : null);
      setStatus(status, 'Đã cập nhật số dư.', 'good');
    } catch (error) { setStatus(status, error.message, 'bad'); }
  });

  const payBtn = el('button', { type: 'button', class: 'btn', text: 'Tạo mã chuyển khoản' });
  payBtn.addEventListener('click', async () => {
    let p;
    try {
      p = normalizePhone(phone.value);
      validatePin(pin.value);
    } catch (error) { setStatus(status, error.message, 'bad'); return; }
    payBtn.disabled = true;
    setStatus(status, 'Đang tạo yêu cầu nạp…');
    try {
      if (isConfigured()) {
        const data = await callBackend('topup', { phone: p, pin: pin.value.trim(), amount: pack.vnd, method });
        saveCache({ phone: p, balance: data.balance, pending: data.pending });
        renderChip();
        setStatus(status, `Đã ghi nhận yêu cầu ${data.code}. Xu được cộng sau khi INNER CODE xác nhận giao dịch (thường trong vài giờ, giờ hành chính).`, 'good');
      } else {
        setStatus(status, 'Hệ thống ví đang được thiết lập: sau khi chuyển khoản, hãy nhắn Zalo kèm ảnh giao dịch để được cộng xu.', '');
      }
      payArea.replaceChildren(paymentPanel(method, pack, p));
    } catch (error) {
      setStatus(status, error.message, 'bad');
    } finally {
      payBtn.disabled = false;
    }
  });

  openModal('Ví xu INNER CODE',
    balanceBox,
    el('p', { class: 'muted', text: 'Không cần tạo tài khoản: số điện thoại là định danh ví, mã PIN bảo vệ để người khác không dùng được xu của bạn. Lần nạp đầu tiên sẽ tạo ví với PIN bạn chọn.' }),
    el('div', { class: 'field-row' }, [field('Số điện thoại', phone), field('Mã PIN', pin, 'Ghi nhớ PIN, bạn cần nó mỗi lần dùng xu.')]),
    el('div', { class: 'row-actions' }, [checkBtn]),
    el('h3', { class: 'modal-sub', text: 'Nạp xu · 1 Xu = 1.000đ' }),
    el('div', { class: 'pack-grid' }, packButtons),
    el('div', { class: 'segmented-buttons' }, methodButtons),
    el('div', { class: 'row-actions' }, [payBtn]),
    status,
    payArea,
  );
}

/* ---------- spend coins ---------- */

/**
 * Ask for phone + PIN and spend coins for `item` (a reading identified by `input`).
 * Resolves true when the server confirmed the spend, or found that this reading was already paid for.
 */
export function purchase(item, { title, description, input } = {}) {
  const price = ITEM_PRICES[item];
  return new Promise((resolve) => {
    if (!isConfigured()) {
      openModal(title ?? 'Mở khóa nội dung',
        el('p', { text: 'Hệ thống ví xu đang được thiết lập. Bạn vẫn có thể đặt qua Zalo, INNER CODE sẽ gửi file cho bạn.' }),
        el('div', { class: 'row-actions' }, [
          el('a', { class: 'btn', href: CONFIG.ZALO_URL, target: '_blank', rel: 'noopener', text: 'Nhắn Zalo đặt mua' }),
        ]));
      resolve(false);
      return;
    }
    const phone = phoneInput('spend-phone');
    const pin = pinInput('spend-pin');
    const status = statusLine();
    const confirm = el('button', { type: 'button', class: 'btn', text: `Xác nhận trừ ${price} Xu` });
    let done = false;
    const d = openModal(title ?? 'Mở khóa nội dung',
      description ? el('p', { class: 'muted', text: description }) : null,
      el('p', { class: 'price-line' }, [el('strong', { text: `${price} Xu` }), el('span', { class: 'muted', text: ` ≈ ${formatVnd(price * 1000)}` })]),
      el('div', { class: 'field-row' }, [field('Số điện thoại (ví)', phone), field('Mã PIN', pin)]),
      el('p', { class: 'hint', text: 'Đã mở khóa hồ sơ này trước đây bằng số điện thoại này? Hệ thống nhận ra và không trừ thêm xu.' }),
      el('div', { class: 'row-actions' }, [confirm, el('button', { type: 'button', class: 'btn secondary', 'data-open-wallet': '', text: 'Nạp thêm xu' })]),
      status,
    );
    d.addEventListener('close', () => { if (!done) resolve(false); }, { once: true });
    confirm.addEventListener('click', async () => {
      confirm.disabled = true;
      setStatus(status, 'Đang xác nhận…');
      try {
        const p = normalizePhone(phone.value);
        const data = await callBackend('spend', { phone: p, pin: validatePin(pin.value), item, input });
        saveCache({ phone: p, balance: data.balance });
        renderChip();
        done = true;
        setStatus(status, data.already
          ? `Hồ sơ này đã được mở khóa trước đó, không trừ xu. Số dư ${data.balance} xu.`
          : `Đã trừ ${data.price} xu. Số dư còn ${data.balance} xu.`, 'good');
        // Only close if this purchase is still on screen; another modal may have replaced it.
        setTimeout(() => { if (d.contains(status)) d.close(); resolve(true); }, 700);
      } catch (error) {
        setStatus(status, error.message, 'bad');
        confirm.disabled = false;
      }
    });
  });
}

/* ---------- physical orders ---------- */

/** `input` (optional) is the reading the printed book is for; paying for the book also opens it online. */
export function orderProduct(key, { prefillNote = '', input = null, onPaid = null } = {}) {
  const product = PRODUCTS.find((p) => p.key === key);
  if (!product) return;
  const paid = Number.isFinite(product.coins);
  const name = el('input', { name: 'name', type: 'text', maxlength: 80, autocomplete: 'name', placeholder: 'Họ và tên người nhận' });
  const phone = phoneInput('order-phone');
  const pin = pinInput('order-pin');
  const address = el('textarea', { name: 'address', maxlength: 250, rows: 3, placeholder: 'Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành' });
  const note = el('textarea', { name: 'note', maxlength: 300, rows: 2, placeholder: product.personalize ? 'Ngày giờ sinh để chọn đá theo hành, cỡ cổ tay…' : 'Ghi chú (không bắt buộc)' });
  note.value = prefillNote;
  const status = statusLine();
  const submit = el('button', { type: 'button', class: 'btn', text: paid ? `Trừ ${product.coins} Xu & đặt in` : 'Gửi yêu cầu báo giá' });

  openModal(product.name,
    product.photos?.length ? el('img', { class: 'modal-photo', src: product.photos[0].src, alt: product.photos[0].alt }) : null,
    el('p', { class: 'muted', text: product.text }),
    paid
      ? el('p', { class: 'price-line' }, [el('strong', { text: `${product.coins} Xu` }), el('span', { class: 'muted', text: ' · trừ trong ví, phí giao hàng INNER CODE báo khi xác nhận' })])
      : el('p', { class: 'price-line' }, [el('strong', { text: 'Giá: liên hệ' }), el('span', { class: 'muted', text: ' · Sarah Nguyen sẽ gọi báo giá và tư vấn' })]),
    el('div', { class: 'field-row' }, [field('Họ tên', name), field('Số điện thoại', phone)]),
    paid ? field('Mã PIN ví', pin) : null,
    field('Địa chỉ nhận hàng', address),
    field('Ghi chú', note),
    el('div', { class: 'row-actions' }, [submit]),
    status,
  );

  submit.addEventListener('click', async () => {
    if (!isConfigured()) {
      setStatus(status, 'Hệ thống đặt hàng đang được thiết lập, vui lòng nhắn Zalo để đặt.', 'bad');
      return;
    }
    submit.disabled = true;
    setStatus(status, 'Đang gửi đơn…');
    try {
      const p = normalizePhone(phone.value);
      const payload = { item: key, phone: p, name: name.value, address: address.value, note: note.value };
      if (paid) payload.pin = validatePin(pin.value);
      if (paid && input) payload.input = input;
      const data = await callBackend('order', payload);
      if (paid) { saveCache({ phone: p, balance: data.balance }); renderChip(); onPaid?.(); }
      setStatus(status, paid
        ? `Đặt in thành công, mã đơn ${data.code}. Số dư còn ${data.balance} xu. INNER CODE sẽ gọi xác nhận trước khi in.`
        : `Đã gửi yêu cầu ${data.code}. Sarah Nguyen sẽ liên hệ báo giá sớm.`, 'good');
    } catch (error) {
      setStatus(status, error.message, 'bad');
      submit.disabled = false;
    }
  });
}

/* ---------- 1-1 consultation ---------- */

export function openConsult(topic = '') {
  const name = el('input', { name: 'name', type: 'text', maxlength: 80, autocomplete: 'name', placeholder: 'Họ và tên' });
  const phone = phoneInput('consult-phone');
  const issue = el('textarea', { name: 'issue', maxlength: 600, rows: 4, placeholder: 'Bạn đang cần hỗ trợ điều gì? (công việc, tình cảm, sức khỏe tinh thần, định hướng…)' });
  issue.value = topic;
  const status = statusLine();
  const submit = el('button', { type: 'button', class: 'btn', text: 'Gửi yêu cầu, chuyên gia gọi lại' });

  openModal('Đặt lịch tư vấn & chữa lành 1-1',
    el('p', { class: 'muted', text: `${CONFIG.EXPERT} trực tiếp đọc hồ sơ, tư vấn và đồng hành cùng bạn. Liên hệ ngay hoặc để lại thông tin để được gọi lại.` }),
    el('div', { class: 'row-actions' }, [
      el('a', { class: 'btn', href: `tel:+84${CONFIG.PHONE.slice(1)}`, text: `Gọi ${CONFIG.PHONE_DISPLAY}` }),
      el('a', { class: 'btn secondary', href: CONFIG.ZALO_URL, target: '_blank', rel: 'noopener', text: 'Nhắn Zalo' }),
    ]),
    el('h3', { class: 'modal-sub', text: 'Hoặc để lại thông tin' }),
    el('div', { class: 'field-row' }, [field('Họ tên', name), field('Số điện thoại', phone)]),
    field('Vấn đề cần hỗ trợ', issue),
    el('div', { class: 'row-actions' }, [submit]),
    status,
  );

  submit.addEventListener('click', async () => {
    try {
      const p = normalizePhone(phone.value);
      if (name.value.trim().length < 2) throw new Error('Vui lòng nhập họ tên.');
      if (!isConfigured()) {
        setStatus(status, 'Biểu mẫu đang được thiết lập. Vui lòng gọi hoặc nhắn Zalo ở trên, chuyên gia sẽ phản hồi ngay.', 'bad');
        return;
      }
      submit.disabled = true;
      setStatus(status, 'Đang gửi…');
      await callBackend('consult', { name: name.value, phone: p, issue: issue.value });
      saveCache({ phone: p });
      setStatus(status, 'Đã gửi. Sarah Nguyen sẽ gọi lại cho bạn sớm.', 'good');
    } catch (error) {
      setStatus(status, error.message, 'bad');
      submit.disabled = false;
    }
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountChrome, { once: true });
  else mountChrome();
}
