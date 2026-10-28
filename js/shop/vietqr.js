/**
 * VietQR (NAPAS EMVCo) payload builder – pure, no DOM.
 * Produces the same string a banking app reads; amount and transfer content are optional.
 */

/** CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF), as required by EMVCo tag 63. */
export function crc16(text) {
  let crc = 0xffff;
  for (let i = 0; i < text.length; i += 1) {
    crc ^= text.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

const field = (id, value) => `${id}${String(value.length).padStart(2, '0')}${value}`;

export function buildVietQR({ bin, account, amount = null, info = '' }) {
  if (!/^\d{6}$/.test(bin)) throw new Error('Mã ngân hàng (BIN) phải gồm 6 chữ số.');
  if (!/^[A-Za-z0-9]{1,19}$/.test(account)) throw new Error('Số tài khoản không hợp lệ.');
  if (amount !== null && (!Number.isInteger(amount) || amount <= 0 || amount > 999999999)) {
    throw new Error('Số tiền không hợp lệ.');
  }
  if (info && !/^[A-Za-z0-9 ]{1,25}$/.test(info)) throw new Error('Nội dung chuyển khoản chỉ gồm chữ không dấu và số, tối đa 25 ký tự.');

  const merchant = field('00', 'A000000727') + field('01', field('00', bin) + field('01', account)) + field('02', 'QRIBFTTA');
  let payload = field('00', '01') + field('01', amount ? '12' : '11') + field('38', merchant) + field('53', '704');
  if (amount) payload += field('54', String(amount));
  payload += field('58', 'VN');
  if (info) payload += field('62', field('08', info));
  payload += '6304';
  return payload + crc16(payload);
}

/** Split an EMVCo payload into { id: value } (top level only). */
export function parseTLV(payload) {
  const out = {};
  let i = 0;
  while (i + 4 <= payload.length) {
    const id = payload.slice(i, i + 2);
    const len = Number(payload.slice(i + 2, i + 4));
    out[id] = payload.slice(i + 4, i + 4 + len);
    i += 4 + len;
  }
  return out;
}

export function transferContent(phone) {
  return `NAP ${phone}`;
}
