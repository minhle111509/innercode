/**
 * "Lưu báo cáo" panel: single reading (25 Xu), full bundle (99 Xu, highlighted), printed combo (249 Xu).
 * Paying here or in the locked block of the page opens the same reading; the PDF of an opened reading is free.
 */

import { el, setChildren } from '../shared/dom.js';
import { ITEM_PRICES, SINGLE_REPORTS } from '../shop/catalog.js';
import { orderProduct } from '../shop/ui.js';
import { printReport, buildReport, REPORT_TITLES } from './report.js';
import { isUnlocked, markUnlocked, requestUnlock } from './unlock.js';

/**
 * @param {HTMLElement} container where the panel goes (usually right after the results)
 * @param {() => {fullName, birthDate, birthTime, gender}} getInput reads the page form
 * @param {{ single?: 'numerology'|'matrix'|'bazi' }} options single report offered on this page;
 *        omit to let the visitor choose (profile page)
 * @param {() => void} [options.onUnlock] called after a purchase opened a reading (pages re-render)
 */
/** Link to the profile page with the birth data already typed here (in the #hash, never sent to a server). */
export function profileHref(getInput) {
  let input = {};
  try { input = getInput(); } catch { /* empty form */ }
  const params = new URLSearchParams();
  for (const key of ['fullName', 'birthDate', 'birthTime', 'gender']) if (input[key]) params.set(key, input[key]);
  const hash = params.toString();
  return hash ? `profile.html#${hash}` : 'profile.html';
}

export function mountReportOffers(container, getInput, { single, onUnlock } = {}) {
  const status = el('p', { class: 'form-status', role: 'status', 'aria-live': 'polite' });
  const check = (kind) => {
    const input = getInput();
    buildReport(kind, input); // validates the input before taking any coins
    return input;
  };

  const run = async (kind, item) => {
    try {
      const input = check(kind);
      const wasOpen = isUnlocked(item, input);
      const ok = await requestUnlock(item, input, { title: `Mở khóa ${REPORT_TITLES[kind]}`, description: 'Mở toàn bộ luận giải trên trang, rồi hộp thoại in sẽ mở: chọn "Lưu thành PDF" để tải về máy.' });
      if (ok) {
        printReport(kind, input);
        if (!wasOpen) onUnlock?.();
        status.textContent = 'Đã mở khóa. Hộp thoại in không hiện thì bấm "Tải PDF" lần nữa, không mất thêm xu.';
      }
    } catch (error) {
      status.textContent = error.message;
    }
  };

  let singleKind = single ?? 'numerology';
  const singleSelect = single ? null : el('select', { 'aria-label': 'Chọn hệ thống' },
    Object.entries(SINGLE_REPORTS).map(([key, s]) => el('option', { value: key, text: s.name })));
  singleSelect?.addEventListener('change', () => { singleKind = singleSelect.value; });

  const opened = (item) => { try { return isUnlocked(item, getInput()); } catch { return false; } };
  const singleBtn = el('button', { type: 'button', class: 'btn secondary' });
  const labelSingle = () => {
    singleBtn.textContent = opened(SINGLE_REPORTS[singleKind].item) ? 'Tải PDF · đã mở khóa' : `Mở khóa · ${ITEM_PRICES.single_numerology} Xu`;
  };
  labelSingle();
  singleSelect?.addEventListener('change', labelSingle);
  singleBtn.addEventListener('click', () => run(singleKind, SINGLE_REPORTS[singleKind].item));
  // Single pages lack some birth data (name, hour, gender), so the full profile is bought on its own
  // page with everything filled in; otherwise the same person could be charged twice.
  const profileLink = (text) => el('a', { class: 'btn', href: profileHref(getInput), text });
  const fullBtn = single
    ? profileLink(`Lập Hồ sơ trọn bộ · ${ITEM_PRICES.full_report} Xu`)
    : el('button', { type: 'button', class: 'btn', text: opened('full_report') ? 'Tải PDF trọn bộ · đã mở khóa' : `Mở khóa trọn bộ · ${ITEM_PRICES.full_report} Xu` });
  if (!single) fullBtn.addEventListener('click', () => run('full', 'full_report'));
  const printBtn = single
    ? Object.assign(profileLink(`Đặt in · ${ITEM_PRICES.print_combo} Xu`), { className: 'btn secondary' })
    : el('button', { type: 'button', class: 'btn secondary', text: `Đặt in · ${ITEM_PRICES.print_combo} Xu` });
  if (!single) printBtn.addEventListener('click', () => {
    try {
      const input = check('full');
      const note = `Hồ sơ cho: ${input.fullName || '(chưa nhập tên)'}, sinh ${input.birthDate}${input.birthTime ? ` ${input.birthTime}` : ''}${input.gender ? `, ${input.gender === 'male' ? 'nam' : 'nữ'}` : ''}`;
      orderProduct('print_combo', { prefillNote: note, input, onPaid: () => { markUnlocked('print_combo', input); onUnlock?.(); } });
    } catch (error) {
      status.textContent = error.message;
    }
  });

  const panel = el('section', { class: 'offers', 'aria-labelledby': 'offers-title' }, [
    el('h3', { id: 'offers-title', text: 'Lưu báo cáo của bạn' }),
    el('p', { class: 'muted', text: 'Mở khóa một lần: xem trọn luận giải trên trang và tải PDF để lưu, in hoặc gửi người thân. 1 Xu = 1.000đ.' }),
    el('div', { class: 'offer-grid' }, [
      el('article', { class: 'offer' }, [
        el('p', { class: 'core-label', text: 'Bài lẻ' }),
        el('h4', { text: single ? `PDF ${SINGLE_REPORTS[single].name}` : 'PDF một hệ thống' }),
        el('p', { class: 'offer-price', text: `${ITEM_PRICES.single_numerology} Xu` }),
        el('p', { class: 'muted', text: 'Mở toàn bộ phần chuyên sâu của một hệ thống trên trang, kèm PDF dàn trang A4.' }),
        singleSelect,
        singleBtn,
      ]),
      el('article', { class: 'offer featured' }, [
        el('p', { class: 'core-label', text: 'Khuyên dùng · tiết kiệm nhất' }),
        el('h4', { text: 'PDF Hồ sơ nội tâm trọn bộ' }),
        el('p', { class: 'offer-price', text: `${ITEM_PRICES.full_report} Xu` }),
        el('p', { class: 'muted', text: 'Mở cả Thần số học, Matrix Destiny, Bát Tự và Hồ sơ nội tâm của bạn, kèm PDF trọn bộ nhiều trang.' }),
        fullBtn,
      ]),
      el('article', { class: 'offer' }, [
        el('p', { class: 'core-label', text: 'Bản in' }),
        el('h4', { text: 'Combo sách in trọn bộ' }),
        el('p', { class: 'offer-price', text: `${ITEM_PRICES.print_combo} Xu` }),
        el('p', { class: 'muted', text: 'In và đóng thành sách, giao tận nhà.' }),
        printBtn,
      ]),
    ]),
    status,
  ]);
  setChildren(container, panel);
  return panel;
}
