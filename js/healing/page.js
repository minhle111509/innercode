import { el, setChildren, showError } from '../shared/dom.js';
import { EMOTIONS, COLORS, HOLD_MS, chooseFrequency } from './frequency.js';
import { SoundPlayer } from './audio.js';
import { PRODUCTS } from '../shop/catalog.js';

const player = new SoundPlayer();

/* ---------- Chọn tần số đồng hành ---------- */
const emotionBox = document.getElementById('emotion-options');
const colorBox = document.getElementById('color-options');
const holdBtn = document.getElementById('hold-button');
const holdLabel = document.getElementById('hold-label');
const result = document.getElementById('frequency-result');

emotionBox.append(...EMOTIONS.map((e) => el('label', { class: 'chip-option' }, [
  el('input', { type: 'radio', name: 'emotion', value: e.key, id: `emotion-${e.key}` }),
  el('span', { text: e.label }),
])));
colorBox.append(...COLORS.map((c) => el('label', { class: 'swatch-option', title: `${c.label} · ${c.chakra}` }, [
  el('input', { type: 'radio', name: 'color', value: c.key, id: `color-${c.key}` }),
  el('span', { class: 'swatch', style: `--swatch:${c.hex}` }),
  el('span', { class: 'swatch-label', text: c.label }),
])));

const selected = (name) => document.querySelector(`input[name="${name}"]:checked`)?.value;

let holdStart = 0;
let holdTimer = null;
let frame = null;

function resetHold(message = 'Chạm và giữ 3 giây') {
  clearTimeout(holdTimer);
  cancelAnimationFrame(frame);
  holdBtn.style.setProperty('--progress', '0');
  holdBtn.classList.remove('holding');
  holdLabel.textContent = message;
}

function tick() {
  const progress = Math.min(1, (performance.now() - holdStart) / HOLD_MS);
  holdBtn.style.setProperty('--progress', String(progress));
  if (progress < 1) frame = requestAnimationFrame(tick);
}

function startHold(event) {
  if (event.type === 'keydown' && event.key !== ' ' && event.key !== 'Enter') return;
  if (event.repeat || holdBtn.classList.contains('holding')) return;
  event.preventDefault();
  try {
    chooseFrequency(selected('emotion'), selected('color'));
  } catch (error) {
    showError(result, error.message);
    return;
  }
  holdStart = performance.now();
  holdBtn.classList.add('holding');
  holdLabel.textContent = 'Thở chậm… giữ nguyên';
  frame = requestAnimationFrame(tick);
  holdTimer = setTimeout(finishHold, HOLD_MS);
}

function endHold(event) {
  if (event.type === 'keyup' && event.key !== ' ' && event.key !== 'Enter') return;
  if (holdBtn.classList.contains('holding') && performance.now() - holdStart < HOLD_MS) {
    resetHold('Giữ đủ 3 giây nhé, thử lại');
  }
}

function productLink(key) {
  const product = PRODUCTS.find((p) => p.key === key);
  return el('a', { class: 'chip', href: `shop.html#${key}`, text: product.name });
}

function finishHold() {
  const r = chooseFrequency(selected('emotion'), selected('color'));
  resetHold('Chạm và giữ để chọn lại');
  const listen = el('button', { type: 'button', class: 'btn', text: `Nghe ${r.primary.hz}Hz` });
  listen.addEventListener('click', () => startPlayer('bowl', r.primary.hz));
  setChildren(result,
    el('article', { class: 'reading-card highlight' }, [
      el('div', { class: 'number-badge small', text: `${r.primary.hz}` }),
      el('div', {}, [
        el('h3', { text: `${r.primary.hz}Hz · ${r.primary.name}` }),
        el('p', { class: 'muted', text: `Bạn chọn "${r.emotion.label}" và màu ${r.color.label.toLowerCase()} (${r.color.chakra}).` }),
        el('p', { text: r.primary.meaning }),
        el('p', {}, [el('strong', { text: 'Thực hành ngay: ' }), r.primary.practice]),
        el('p', {}, [el('strong', { text: `Tần số đồng hành ${r.companion.hz}Hz – ${r.companion.name}: ` }), r.companion.meaning]),
        el('div', { class: 'row-actions' }, [listen, el('button', { type: 'button', class: 'btn secondary', 'data-open-consult': `Tần số ${r.primary.hz}Hz – ${r.emotion.label}`, text: 'Chữa lành 1-1 cùng chuyên gia' })]),
      ]),
    ]),
    el('section', { class: 'reading-card column' }, [
      el('h3', { text: 'Vật phẩm đồng hành gợi ý' }),
      el('p', { class: 'chips' }, r.products.map(productLink)),
    ]),
    el('p', { class: 'hint', text: 'Đây là trải nghiệm chiêm nghiệm dựa trên lựa chọn của bạn, không phải thiết bị đo hay chẩn đoán y khoa.' }),
  );
  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

holdBtn.addEventListener('pointerdown', startHold);
holdBtn.addEventListener('keydown', startHold);
for (const type of ['pointerup', 'pointerleave', 'pointercancel', 'keyup']) holdBtn.addEventListener(type, endHold);
holdBtn.addEventListener('contextmenu', (event) => event.preventDefault());

/* ---------- Góc chữa lành âm thanh ---------- */
const modeSelect = document.getElementById('sound-mode');
const hzSelect = document.getElementById('sound-hz');
const minutesSelect = document.getElementById('sound-minutes');
const volume = document.getElementById('sound-volume');
const toggle = document.getElementById('sound-toggle');
const stage = document.getElementById('sound-stage');
const nowPlaying = document.getElementById('sound-now');

function setPlayingUi(on, text) {
  toggle.textContent = on ? 'Dừng' : 'Phát';
  stage.classList.toggle('playing', on);
  nowPlaying.textContent = text;
}

async function startPlayer(mode, hz) {
  modeSelect.value = mode;
  if (![...hzSelect.options].some((o) => Number(o.value) === hz)) hzSelect.append(el('option', { value: hz, text: `${hz}Hz` }));
  hzSelect.value = String(hz);
  try {
    await player.play({ mode, hz, minutes: Number(minutesSelect.value) });
    setPlayingUi(true, `Đang phát ${mode === 'bowl' ? 'chuông xoay' : 'âm thuần'} ${hz}Hz`);
    document.getElementById('sound').scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (error) {
    setPlayingUi(false, error.message);
  }
}

player.onstop = () => setPlayingUi(false, 'Đã dừng. Cảm nhận sự tĩnh lặng còn lại.');
volume.addEventListener('input', () => player.setVolume(Number(volume.value)));
toggle.addEventListener('click', () => {
  if (player.playing) player.stop();
  else startPlayer(modeSelect.value, Number(hzSelect.value));
});
