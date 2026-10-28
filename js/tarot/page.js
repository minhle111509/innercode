import { el, showError } from '../shared/dom.js';
import { DECK } from './deck.js';
import { SPREADS, readSpread, summarizeReading } from './tarot.js';

const form = document.getElementById('tarot-form');
const result = document.getElementById('tarot-result');
const spreadSelect = document.getElementById('spread');

for (const [key, spread] of Object.entries(SPREADS)) {
  spreadSelect.append(el('option', { value: key, text: spread.name }));
}
spreadSelect.value = 'pastPresentFuture';

function cardView({ card, reversed, position }, index) {
  const meaning = reversed ? card.reversed : card.upright;
  const front = el('div', { class: 'tarot-face tarot-front' }, [
    el('span', { class: 'tarot-label', text: card.label }),
    el('span', { class: 'tarot-symbol', text: card.symbol }),
    el('span', { class: 'tarot-name', text: card.nameVi }),
  ]);

  const flipCard = el('button', {
    type: 'button',
    class: 'tarot-card',
    'aria-label': `Lật lá bài vị trí ${position}`,
    style: `animation-delay:${index * 120}ms`,
  }, [
    el('div', { class: 'tarot-inner' }, [
      el('div', { class: 'tarot-face tarot-back', 'aria-hidden': 'true', text: '✦' }),
      el('div', { class: `tarot-face-wrap${reversed ? ' reversed' : ''}` }, front),
    ]),
  ]);

  const detail = el('div', { class: 'tarot-detail', hidden: true }, [
    el('h3', { text: `${card.nameVi} ${reversed ? '(Ngược)' : '(Xuôi)'}` }),
    el('p', { class: 'muted', text: card.nameEn }),
    el('p', { text: meaning }),
  ]);

  flipCard.addEventListener('click', () => {
    flipCard.classList.add('flipped');
    flipCard.setAttribute('aria-label', `${position}: ${card.nameVi}`);
    detail.hidden = false;
    revealSummaryIfDone();
  }, { once: true });

  return el('article', { class: 'tarot-slot' }, [
    el('p', { class: 'position', text: position }),
    flipCard,
    detail,
  ]);
}

let summaryNode = null;

function revealSummaryIfDone() {
  if (summaryNode && !result.querySelector('.tarot-card:not(.flipped)')) {
    summaryNode.hidden = false;
  }
}

function render(reading, question) {
  summaryNode = el('section', { class: 'reading-card column', hidden: true }, [
    el('h3', { text: 'Tổng quan trải bài' }),
    ...summarizeReading(reading).map((note) => el('p', { text: note })),
  ]);

  result.replaceChildren(
    question ? el('p', { class: 'question' }, [el('strong', { text: 'Câu hỏi: ' }), question]) : null,
    el('p', { class: 'muted', text: 'Hãy tập trung vào câu hỏi và chạm vào từng lá bài để lật.' }),
    el('div', { class: 'tarot-spread' }, reading.map(cardView)),
    summaryNode,
    el('button', { type: 'button', class: 'btn secondary', id: 'flip-all', text: 'Lật tất cả' }),
  );

  result.querySelector('#flip-all').addEventListener('click', () => {
    result.querySelectorAll('.tarot-card:not(.flipped)').forEach((card) => card.click());
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const question = form.elements.question.value.trim();
  try {
    const reading = readSpread(DECK, spreadSelect.value, {
      allowReversed: form.elements.allowReversed.checked,
    });
    render(reading, question);
  } catch (error) {
    console.error(error);
    showError(result, 'Không thể rút bài lúc này. Vui lòng thử lại.');
  }
});
