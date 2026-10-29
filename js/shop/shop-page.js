import { el } from '../shared/dom.js';
import { PRODUCTS, PACKAGES, formatVnd } from './catalog.js';
import './ui.js';

const grid = document.getElementById('product-grid');
const packs = document.getElementById('pack-list');

/** Product photos with small thumbnails to switch between them; CSS art when there is no photo yet. */
function productMedia(product) {
  if (!product.photos?.length) return el('div', { class: `product-art art-${product.art}`, 'aria-hidden': 'true' }, el('span'));
  const main = el('img', { class: 'product-photo', src: product.photos[0].src, alt: product.photos[0].alt, loading: 'lazy', width: 600, height: 800 });
  const thumbs = product.photos.length > 1 ? el('div', { class: 'product-thumbs' }, product.photos.map((photo, i) => {
    const thumb = el('button', { type: 'button', class: `product-thumb${i === 0 ? ' active' : ''}`, 'aria-label': `Xem ảnh ${i + 1}` },
      el('img', { src: photo.src, alt: '', loading: 'lazy' }));
    thumb.addEventListener('click', () => {
      main.src = photo.src;
      main.alt = photo.alt;
      thumbs.querySelectorAll('.product-thumb').forEach((t) => t.classList.toggle('active', t === thumb));
    });
    return thumb;
  })) : null;
  return el('div', { class: 'product-media' }, [main, thumbs]);
}

grid.append(...PRODUCTS.map((product) => el('article', { class: 'product', id: product.key }, [
  productMedia(product),
  el('h3', { text: product.name }),
  el('p', { class: Number.isFinite(product.coins) ? 'offer-price' : 'offer-price quote', text: Number.isFinite(product.coins) ? `${product.coins} Xu` : 'Liên hệ báo giá' }),
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
