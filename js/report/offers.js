/** "Lưu báo cáo" panel: single PDF (25 Xu), full bundle (99 Xu, highlighted), printed combo (249 Xu). */

import { el, setChildren } from '../shared/dom.js';
import { ITEM_PRICES, SINGLE_REPORTS } from '../shop/catalog.js';
import { purchase, orderProduct } from '../shop/ui.js';
import { printReport, buildReport, REPORT_TITLES } from './report.js';

/**
 * @param {HTMLElement} container where the panel goes (usually right after the results)
 * @param {() => {fullName, birthDate, birthTime, gender}} getInput reads the page form
 * @param {{ single?: 'numerology'|'matrix'|'bazi' }} options single report offered on this page;
 *        omit to let the visitor choose (profile page)
 */
export function mountReportOffers(container, getInput, { single } = {}) {
  const status = el('p', { class: 'form-status', role: 'status', 'aria-live': 'polite' });
  const check = (kind) => {
    const input = getInput();
    buildReport(kind, input); // validates the input before taking any coins
    return input;
  };

  const run = async (kind, item) => {
    try {
      const input = check(kind);
      const ok = await purchase(item, { title: `Mở khóa PDF ${REPORT_TITLES[kind]}`, description: 'Sau khi trừ xu, hộp thoại in sẽ mở: chọn "Lưu thành PDF" để tải về máy.' });
      if (ok) {
        status.textContent = 'Đã mở khóa. Nếu hộp thoại in không hiện, bấm lại nút để in lần nữa trong phiên này.';
        printReport(kind, input);
      }
    } catch (error) {
      status.textContent = error.message;
    }
  };

  let singleKind = single ?? 'numerology';
  const singleSelect = single ? null : el('select', { 'aria-label': 'Chọn hệ thống' },
    Object.entries(SINGLE_REPORTS).map(([key, s]) => el('option', { value: key, text: s.name })));
  singleSelect?.addEventListener('change', () => { singleKind = singleSelect.value; });

  const singleBtn = el('button', { type: 'button', class: 'btn secondary', text: `Mở khóa · ${ITEM_PRICES.single_numerology} Xu` });
  singleBtn.addEventListener('click', () => run(singleKind, SINGLE_REPORTS[singleKind].item));
  const fullBtn = el('button', { type: 'button', class: 'btn', text: `Mở khóa trọn bộ · ${ITEM_PRICES.full_report} Xu` });
  fullBtn.addEventListener('click', () => run('full', 'full_report'));
  const printBtn = el('button', { type: 'button', class: 'btn secondary', text: `Đặt in · ${ITEM_PRICES.print_combo} Xu` });
  printBtn.addEventListener('click', () => {
    try {
      const input = check('full');
      const note = `Hồ sơ cho: ${input.fullName || '(chưa nhập tên)'}, sinh ${input.birthDate}${input.birthTime ? ` ${input.birthTime}` : ''}${input.gender ? `, ${input.gender === 'male' ? 'nam' : 'nữ'}` : ''}`;
      orderProduct('print_combo', { prefillNote: note });
    } catch (error) {
      status.textContent = error.message;
    }
  });

  const panel = el('section', { class: 'offers', 'aria-labelledby': 'offers-title' }, [
    el('h3', { id: 'offers-title', text: 'Lưu báo cáo của bạn' }),
    el('p', { class: 'muted', text: 'Tải bản PDF dàn trang đẹp để lưu, in hoặc gửi cho người thân. 1 Xu = 1.000đ.' }),
    el('div', { class: 'offer-grid' }, [
      el('article', { class: 'offer' }, [
        el('p', { class: 'core-label', text: 'Bài lẻ' }),
        el('h4', { text: single ? `PDF ${SINGLE_REPORTS[single].name}` : 'PDF một hệ thống' }),
        el('p', { class: 'offer-price', text: `${ITEM_PRICES.single_numerology} Xu` }),
        el('p', { class: 'muted', text: 'Toàn bộ luận giải của một hệ thống, dàn trang A4.' }),
        singleSelect,
        singleBtn,
      ]),
      el('article', { class: 'offer featured' }, [
        el('p', { class: 'core-label', text: 'Khuyên dùng · tiết kiệm nhất' }),
        el('h4', { text: 'PDF Hồ sơ nội tâm trọn bộ' }),
        el('p', { class: 'offer-price', text: `${ITEM_PRICES.full_report} Xu` }),
        el('p', { class: 'muted', text: 'Tổng hợp đối chiếu + Thần số học + Matrix Destiny + Bát Tự (đại vận, lưu niên) trong một file nhiều trang.' }),
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
