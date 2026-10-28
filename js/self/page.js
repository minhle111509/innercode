import { el, svgEl, setChildren, showError } from '../shared/dom.js';
import { SCALE, STATEMENTS, TYPES, scoreQuiz } from './enneagram.js';
import {
  LIFE_AREAS, summarizeWheel, BREATHING_PATTERNS, breathingPhases, cyclesFor, JOURNAL_PROMPTS,
} from './practices.js';

/* ---------- Quiz ---------- */
const quizForm = document.getElementById('quiz-form');
const quizList = document.getElementById('quiz-list');
const quizProgress = document.getElementById('quiz-progress');
const quizResult = document.getElementById('quiz-result');

quizList.append(...STATEMENTS.map((s, i) => el('fieldset', { class: 'quiz-item' }, [
  el('legend', { text: `${i + 1}. ${s.text}` }),
  el('div', { class: 'scale' }, SCALE.map(({ value, label }) => el('label', { title: label }, [
    el('input', { type: 'radio', name: s.id, value, id: `${s.id}-${value}` }),
    el('span', { text: value }),
  ]))),
])));

function quizAnswers() {
  return Object.fromEntries(STATEMENTS.map((s) => [s.id, quizForm.elements[s.id].value]));
}

function updateProgress() {
  const done = Object.values(quizAnswers()).filter(Boolean).length;
  quizProgress.textContent = `Đã trả lời ${done}/${STATEMENTS.length} câu`;
}
quizForm.addEventListener('change', updateProgress);
updateProgress();

function scoreBars(scores, main) {
  return el('div', { class: 'bars' }, Object.entries(scores).map(([type, percent]) => el('div', { class: 'bar-row' }, [
    el('span', { class: 'bar-label', text: `Nhóm ${type}` }),
    el('span', { class: 'bar-track' }, el('span', {
      class: `bar-fill${Number(type) === main ? ' main' : ''}`,
      style: `width:${Math.max(percent, 2)}%`,
    })),
    el('span', { class: 'bar-value', text: `${percent}%` }),
  ])));
}

quizForm.addEventListener('submit', (event) => {
  event.preventDefault();
  try {
    const { main, wing, scores } = scoreQuiz(quizAnswers());
    const type = TYPES[main];
    setChildren(quizResult,
      el('article', { class: 'reading-card highlight' }, [
        el('div', { class: 'number-badge', text: main }),
        el('div', {}, [
          el('h3', { text: `Nhóm ${main}: ${type.name} (cánh ${wing})` }),
          el('p', { class: 'muted', text: `Cánh ${wing} – ${TYPES[wing].name} – là nhóm lân cận ảnh hưởng nhiều nhất đến bạn.` }),
          el('p', {}, [el('strong', { text: 'Khao khát cốt lõi: ' }), type.desire]),
          el('p', {}, [el('strong', { text: 'Nỗi sợ cốt lõi: ' }), type.fear]),
          el('p', {}, [el('strong', { text: 'Điểm mạnh: ' }), type.strengths]),
          el('p', {}, [el('strong', { text: 'Hướng phát triển: ' }), type.growth]),
          el('p', {}, [
            el('strong', { text: 'Khi phát triển ' }), `bạn mang nét tích cực của nhóm ${type.integration} (${TYPES[type.integration].name}); `,
            el('strong', { text: 'khi căng thẳng ' }), `dễ rơi vào mặt tiêu cực của nhóm ${type.stress} (${TYPES[type.stress].name}).`,
          ]),
        ]),
      ]),
      el('section', { class: 'reading-card column' }, [
        el('h3', { text: 'Điểm của 9 nhóm' }),
        scoreBars(scores, main),
        el('p', { class: 'muted', text: 'Bài trắc nghiệm ngắn để tự chiêm nghiệm, không phải công cụ chẩn đoán tâm lý.' }),
      ]),
    );
    quizResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    showError(quizResult, error.message);
  }
});

/* ---------- Wheel of life ---------- */
const wheelInputs = document.getElementById('wheel-inputs');
const wheelChart = document.getElementById('wheel-chart');
const wheelSummary = document.getElementById('wheel-summary');

wheelInputs.append(...LIFE_AREAS.map((area) => el('div', { class: 'slider-row' }, [
  el('label', { for: `wheel-${area.key}`, text: area.name }),
  el('input', { type: 'range', id: `wheel-${area.key}`, name: area.key, min: 1, max: 10, step: 1, value: 6 }),
  el('output', { for: `wheel-${area.key}`, id: `wheel-${area.key}-value`, text: '6' }),
])));

const C = 180;
const R = 118;
const point = (i, value) => {
  const angle = (Math.PI * 2 * i) / LIFE_AREAS.length - Math.PI / 2;
  return [C + Math.cos(angle) * R * (value / 10), C + Math.sin(angle) * R * (value / 10)];
};

function drawWheel(scores) {
  const rings = [2, 4, 6, 8, 10].map((v) => svgEl('polygon', {
    class: 'radar-ring',
    points: LIFE_AREAS.map((_, i) => point(i, v).join(',')).join(' '),
  }));
  const axes = LIFE_AREAS.map((_, i) => {
    const [x, y] = point(i, 10);
    return svgEl('line', { class: 'radar-axis', x1: C, y1: C, x2: x, y2: y });
  });
  const shape = svgEl('polygon', {
    class: 'radar-shape',
    points: LIFE_AREAS.map((a, i) => point(i, scores[a.key]).join(',')).join(' '),
  });
  const labels = LIFE_AREAS.map((a, i) => {
    const [x, y] = point(i, 12.2);
    const anchor = Math.abs(x - C) < 4 ? 'middle' : x > C ? 'start' : 'end';
    return svgEl('text', { class: 'radar-label', x, y, 'text-anchor': anchor, text: `${a.name} ${scores[a.key]}` });
  });
  wheelChart.replaceChildren(...rings, ...axes, shape, ...labels);
}

function updateWheel() {
  const scores = Object.fromEntries(LIFE_AREAS.map((a) => {
    const input = document.getElementById(`wheel-${a.key}`);
    document.getElementById(`wheel-${a.key}-value`).textContent = input.value;
    return [a.key, Number(input.value)];
  }));
  drawWheel(scores);
  const summary = summarizeWheel(scores);
  setChildren(wheelSummary,
    el('p', {}, [el('strong', { text: `Điểm trung bình: ${summary.average}/10. ` }),
      summary.spread >= 5 ? 'Bánh xe đang lệch khá nhiều, cuộc sống dễ cảm thấy chông chênh.' : 'Bánh xe khá cân đối.']),
    el('p', {}, [el('strong', { text: 'Lĩnh vực cần quan tâm: ' }), summary.lowest.map((a) => a.name).join(' và ')]),
    el('ul', { class: 'tip-list' }, summary.lowest.map((a) => el('li', {}, [el('strong', { text: `${a.name}: ` }), a.tip]))),
    el('p', { class: 'muted', text: `Điểm sáng nhất: ${summary.highest.name}. Hãy dùng thế mạnh này để kéo các lĩnh vực khác lên.` }),
  );
}
wheelInputs.addEventListener('input', updateWheel);
updateWheel();

/* ---------- Breathing ---------- */
const breathPattern = document.getElementById('breath-pattern');
const breathMinutes = document.getElementById('breath-minutes');
const breathToggle = document.getElementById('breath-toggle');
const breathCircle = document.getElementById('breath-circle');
const breathLabel = document.getElementById('breath-label');
const breathCount = document.getElementById('breath-count');
const breathInfo = document.getElementById('breath-info');

for (const [key, p] of Object.entries(BREATHING_PATTERNS)) {
  breathPattern.append(el('option', { value: key, text: p.name }));
}
const showPatternInfo = () => { breathInfo.textContent = BREATHING_PATTERNS[breathPattern.value].purpose; };
breathPattern.addEventListener('change', showPatternInfo);
showPatternInfo();

let phaseTimer = null;
let tickTimer = null;

function stopBreathing(message = 'Sẵn sàng') {
  clearTimeout(phaseTimer);
  clearInterval(tickTimer);
  phaseTimer = null;
  breathCircle.dataset.phase = 'rest';
  breathCircle.style.transitionDuration = '0.6s';
  breathLabel.textContent = message;
  breathCount.textContent = '';
  breathToggle.textContent = 'Bắt đầu';
}

function startBreathing() {
  const { steps } = BREATHING_PATTERNS[breathPattern.value];
  const phases = breathingPhases(steps);
  const totalCycles = cyclesFor(steps, Number(breathMinutes.value));
  breathToggle.textContent = 'Dừng';

  const run = (cycle, index) => {
    if (cycle >= totalCycles) { stopBreathing('Hoàn thành. Cảm nhận cơ thể bạn lúc này.'); return; }
    const phase = phases[index];
    breathCircle.style.transitionDuration = `${phase.seconds}s`;
    breathCircle.dataset.phase = phase.kind;
    breathLabel.textContent = phase.label;
    let left = phase.seconds;
    breathCount.textContent = `${left} · vòng ${cycle + 1}/${totalCycles}`;
    clearInterval(tickTimer);
    tickTimer = setInterval(() => {
      left -= 1;
      if (left > 0) breathCount.textContent = `${left} · vòng ${cycle + 1}/${totalCycles}`;
    }, 1000);
    const nextIndex = (index + 1) % phases.length;
    phaseTimer = setTimeout(() => run(nextIndex === 0 ? cycle + 1 : cycle, nextIndex), phase.seconds * 1000);
  };
  run(0, 0);
}

breathToggle.addEventListener('click', () => (phaseTimer ? stopBreathing() : startBreathing()));
stopBreathing();

/* ---------- Journal ---------- */
const journalTopic = document.getElementById('journal-topic');
const journalPrompt = document.getElementById('journal-prompt');
const journalText = document.getElementById('journal-text');
const journalStatus = document.getElementById('journal-status');
const DRAFT_KEY = 'innercode-journal-draft';

for (const [key, group] of Object.entries(JOURNAL_PROMPTS)) {
  journalTopic.append(el('option', { value: key, text: group.name }));
}

let promptIndex = 0;
function showPrompt(next = false) {
  const { prompts } = JOURNAL_PROMPTS[journalTopic.value];
  promptIndex = next ? (promptIndex + 1) % prompts.length : 0;
  journalPrompt.textContent = prompts[promptIndex];
}
journalTopic.addEventListener('change', () => showPrompt());
document.getElementById('journal-next').addEventListener('click', () => showPrompt(true));
showPrompt();

// Draft lives only in this viewer's browser; storage may be unavailable (private mode).
try { journalText.value = localStorage.getItem(DRAFT_KEY) ?? ''; } catch { /* storage unavailable */ }
journalText.addEventListener('input', () => {
  try {
    localStorage.setItem(DRAFT_KEY, journalText.value);
    journalStatus.textContent = 'Đã lưu nháp trên trình duyệt này.';
  } catch {
    journalStatus.textContent = 'Trình duyệt không cho lưu nháp; hãy sao chép nội dung trước khi rời trang.';
  }
});
document.getElementById('journal-clear').addEventListener('click', () => {
  journalText.value = '';
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* storage unavailable */ }
  journalStatus.textContent = 'Đã xóa nháp.';
});
