import { el } from '../shared/dom.js';
import { PRODUCTS, PACKAGES, formatVnd } from './catalog.js';
import './ui.js';

const grid = document.getElementById('product-grid');
const packs = document.getElementById('pack-list');

grid.append(...PRODUCTS.map((product) => el('article', { class: 'product', id: product.key }, [
  el('div', { class: `product-art art-${product.art}`, 'aria-hidden': 'true' }, el('span')),
  el('h3', { text: product.name }),
  el('p', { class: 'offer-price', text: Number.isFinite(product.coins) ? `${product.coins} Xu` : 'Liên hệ báo giá' }),
  el('p', { class: 'muted', text: product.text }),
  el('button', {
    type: 'button',
    class: Number.isFinite(product.coins) ? 'btn' : 'btn secondary',
    'data-order': product.key,
    text: Number.isFinite(product.coins) ? 'Đặt in bằng xu' : 'Yêu cầu báo giá',
  }),
])));

packs.append(...PACKAGES.map((p) => el('div', { class: 'purpose' }, [
  el('span', { class: 'purpose-number', text: `${p.coins} Xu` }),
  el('span', { class: 'muted', text: formatVnd(p.vnd) }),
])));

const target = location.hash ? document.getElementById(location.hash.slice(1)) : null;
if (target?.classList.contains('product')) target.classList.add('spotlight');
