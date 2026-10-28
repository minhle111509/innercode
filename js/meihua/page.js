import { el, setChildren, showError } from '../shared/dom.js';
import { castByTime, castByNumbers, parseDateTime } from './meihua.js';
import { LINE_POSITIONS, HEXAGRAM_ADVICE } from './data.js';
import { LINE_TEXTS } from './lines.js';

const form = document.getElementById('meihua-form');
const result = document.getElementById('meihua-result');
const timeInput = document.getElementById('cast-time');
const timeFields = document.getElementById('time-fields');
const numberFields = document.getElementById('number-fields');

function nowLocalValue() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

timeInput.value = nowLocalValue();
document.getElementById('use-now').addEventListener('click', () => { timeInput.value = nowLocalValue(); });

function syncMode() {
  const byTime = form.elements.mode.value === 'time';
  timeFields.hidden = !byTime;
  numberFields.hidden = byTime;
}
form.addEventListener('change', (event) => { if (event.target.name === 'mode') syncMode(); });
syncMode();

/** Lines are drawn top → bottom, so iterate from line 6 down to line 1. */
function hexagramFigure(hexagram, { label, movingLine = null }) {
  const bars = [];
  for (let i = 5; i >= 0; i -= 1) {
    const moving = movingLine === i + 1;
    bars.push(el('span', {
      class: `hex-line ${hexagram.lines[i] ? 'yang' : 'yin'}${moving ? ' moving' : ''}`,
      title: `Hào ${i + 1}${moving ? ' (động)' : ''}`,
    }));
  }
  const { upperTrigram: up, lowerTrigram: low } = hexagram;
  return el('article', { class: 'hex-card' }, [
    el('p', { class: 'position', text: label }),
    el('div', { class: 'hex', role: 'img', 'aria-label': `Quẻ ${hexagram.name}` }, bars),
    el('h3', { text: hexagram.name }),
    el('p', { class: 'muted', text: `Quẻ số ${hexagram.number} · ${up.symbol} ${up.name} trên, ${low.symbol} ${low.name} dưới` }),
    el('p', { text: hexagram.meaning }),
    el('p', { class: 'advice' }, [el('strong', { text: 'Lời khuyên: ' }), HEXAGRAM_ADVICE[hexagram.number]]),
    el('details', { class: 'lines-detail' }, [
      el('summary', { text: 'Xem lời 6 hào' }),
      el('ol', {}, LINE_TEXTS[hexagram.number].map((text, i) => el('li', { class: movingLine === i + 1 ? 'moving-text' : null }, [
        el('strong', { text: `Hào ${i + 1}: ` }), text,
      ]))),
    ]),
  ]);
}

function trigramChip(role, trigram) {
  return el('div', { class: 'trigram-chip' }, [
    el('span', { class: 'trigram-symbol', text: trigram.symbol }),
    el('span', {}, [
      el('strong', { text: `${role}: ${trigram.name}` }), el('br'),
      `${trigram.image} · hành ${trigram.element} · ${trigram.quality}`, el('br'),
      el('span', { class: 'muted', text: `${trigram.family} · ${trigram.body} · hướng ${trigram.direction}` }),
    ]),
  ]);
}

function castingNote(reading) {
  if (reading.method === 'time') {
    const { lunar, yearBranch: yb, hourBranch: hb } = reading;
    return `Âm lịch ${lunar.day}/${lunar.month}${lunar.leap ? ' (nhuận)' : ''}/${lunar.year} · năm ${yb.name} (${yb.number}) · giờ ${hb.name} (${hb.number}). `
      + `Quẻ trên: ${yb.number}+${lunar.month}+${lunar.day} = ${reading.upperSum}; `
      + `quẻ dưới và hào động: ${reading.upperSum}+${hb.number} = ${reading.total}.`;
  }
  const [n1, n2] = reading.numbers;
  const hourPart = reading.hourBranch ? ` + giờ ${reading.hourBranch.name} (${reading.hourBranch.number})` : '';
  return `Quẻ trên từ số ${n1}, quẻ dưới từ số ${n2}; hào động: ${n1} + ${n2}${hourPart} = ${reading.total}.`;
}

function render(reading, question) {
  const verdictClass = (v) => (v.includes('cát') || v === 'Cát' ? 'good' : 'bad');
  setChildren(result,
    question ? el('p', { class: 'question' }, [el('strong', { text: 'Câu hỏi: ' }), question]) : null,
    el('p', { class: 'muted', text: castingNote(reading) }),
    el('div', { class: 'hex-row' }, [
      hexagramFigure(reading.main, { label: 'Quẻ chủ · hiện tại', movingLine: reading.movingLine }),
      hexagramFigure(reading.mutual, { label: 'Quẻ hỗ · diễn biến' }),
      hexagramFigure(reading.changed, { label: 'Quẻ biến · kết quả' }),
    ]),
    el('section', { class: 'reading-card column' }, [
      el('h3', { text: `Hào ${reading.movingLine} động · Phân tích Thể – Dụng` }),
      el('p', { class: 'muted', text: LINE_POSITIONS[reading.movingLine] }),
      el('blockquote', { class: 'line-quote' }, [
        el('strong', { text: `Lời hào ${reading.movingLine} quẻ ${reading.main.name}: ` }),
        LINE_TEXTS[reading.main.number][reading.movingLine - 1],
      ]),
      el('div', { class: 'trigram-row' }, [
        trigramChip('Thể (bạn)', reading.ti),
        trigramChip('Dụng (sự việc)', reading.yong),
        trigramChip('Dụng sau biến', reading.changedYong),
      ]),
      el('p', {}, [
        el('span', { class: `verdict ${verdictClass(reading.relation.verdict)}`, text: reading.relation.verdict }),
        el('strong', { text: ` ${reading.relation.label}. ` }),
        reading.relation.text,
      ]),
      ...reading.development.map((d) => el('p', {}, [
        el('span', { class: `verdict ${verdictClass(d.verdict)}`, text: d.verdict }),
        el('strong', { text: ` Diễn biến (quẻ hỗ ${d.trigram.name}, ${d.label}). ` }),
        d.text,
      ])),
      el('p', {}, [
        el('span', { class: `verdict ${verdictClass(reading.outcome.verdict)}`, text: reading.outcome.verdict }),
        el('strong', { text: ` Kết cục (${reading.outcome.label}). ` }),
        reading.outcome.text,
      ]),
    ]),
  );
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const question = form.elements.question.value.trim();
  try {
    const reading = form.elements.mode.value === 'time'
      ? castByTime(parseDateTime(timeInput.value))
      : castByNumbers(form.elements.first.value, form.elements.second.value, {
        hour: form.elements.addHour.checked ? new Date().getHours() : null,
      });
    render(reading, question);
  } catch (error) {
    showError(result, error.message);
  }
});
