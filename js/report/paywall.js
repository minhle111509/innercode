/** Locked "deep reading" block shown under the free preview of a reading. */

import { el } from '../shared/dom.js';
import { ITEM_PRICES } from '../shop/catalog.js';
import { isUnlocked, requestUnlock } from './unlock.js';

/**
 * @param {object} o
 * @param {string} o.item     catalogue item that opens this block (single_numerology, full_report…)
 * @param {object} o.input    the reading's birth data, identifies what was paid for
 * @param {string} o.title    heading of the locked block
 * @param {string[]} o.includes what the visitor gets, listed while locked
 * @param {() => Node[]} o.build builds the deep content; only called once the reading is open,
 *                             so the locked text is not in the page before payment
 * @param {string} [o.upsellHref] link to the full profile (single readings only)
 * @param {() => void} [o.onUnlock] called after a successful unlock (e.g. to refresh the PDF offers)
 */
export function lockedSection({ item, input, title, includes, build, upsellHref = null, onUnlock }) {
  const box = el('div', { class: 'deep-reading' });
  const open = () => box.replaceChildren(...build().filter(Boolean));
  if (isUnlocked(item, input)) {
    open();
    return box;
  }

  const status = el('p', { class: 'form-status bad', role: 'status', 'aria-live': 'polite' });
  const unlock = el('button', { type: 'button', class: 'btn', text: `Mở khóa · ${ITEM_PRICES[item]} Xu` });
  unlock.addEventListener('click', async () => {
    status.textContent = '';
    try {
      const ok = await requestUnlock(item, input, {
        title: `Mở khóa: ${title}`,
        description: 'Mở toàn bộ phần chuyên sâu ngay trên trang. Sau đó bạn tải PDF hay xem lại hồ sơ này đều không mất thêm xu.',
      });
      if (ok) {
        open();
        onUnlock?.();
      }
    } catch (error) {
      status.textContent = error.message;
    }
  });

  box.append(el('section', { class: 'paywall', 'aria-labelledby': `paywall-${item}` }, [
    el('div', { class: 'paywall-ghost', 'aria-hidden': 'true' }, [el('span'), el('span'), el('span'), el('span')]),
    el('p', { class: 'core-label', text: 'Phần chuyên sâu đang khóa' }),
    el('h3', { id: `paywall-${item}`, text: title }),
    el('ul', { class: 'paywall-list' }, includes.map((text) => el('li', { text }))),
    el('div', { class: 'row-actions' }, [
      unlock,
      upsellHref ? el('a', { class: 'btn secondary', href: upsellHref, text: `Trọn bộ 3 hệ thống · ${ITEM_PRICES.full_report} Xu` }) : null,
    ]),
    el('p', { class: 'hint', text: '1 Xu = 1.000đ. Đã mở khóa thì xem lại và tải PDF hồ sơ này không mất thêm xu.' }),
    status,
  ]));
  return box;
}
