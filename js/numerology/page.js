import { el, showError } from '../shared/dom.js';
import { calculateReport } from './numerology.js';
import { NUMBER_MEANINGS, PERSONAL_YEAR_MEANINGS, CHART_DIGIT_MEANINGS } from './meanings.js';

const form = document.getElementById('numerology-form');
const result = document.getElementById('numerology-result');
const birthInput = document.getElementById('birth-date');

birthInput.max = new Date().toISOString().slice(0, 10);

function meaningCard(label, number, { highlight = false } = {}) {
  const meaning = NUMBER_MEANINGS[number];
  return el('article', { class: `reading-card${highlight ? ' highlight' : ''}` }, [
    el('div', { class: 'number-badge', text: number }),
    el('div', {}, [
      el('h3', { text: `${label}: ${meaning.title}` }),
      el('p', { class: 'keywords', text: meaning.keywords }),
      el('p', {}, [el('strong', { text: 'Điểm mạnh: ' }), meaning.strengths]),
      el('p', {}, [el('strong', { text: 'Thử thách: ' }), meaning.challenges]),
      el('p', {}, [el('strong', { text: 'Lời khuyên: ' }), meaning.advice]),
    ]),
  ]);
}

function birthChartView(chart) {
  // Traditional Pythagorean grid layout: 3-6-9 / 2-5-8 / 1-4-7
  const layout = [3, 6, 9, 2, 5, 8, 1, 4, 7];
  const grid = el(
    'div',
    { class: 'birth-grid', role: 'table', 'aria-label': 'Biểu đồ ngày sinh' },
    layout.map((digit) =>
      el('div', { class: `cell${chart[digit] ? '' : ' empty'}`, role: 'cell', title: CHART_DIGIT_MEANINGS[digit] },
        chart[digit] ? String(digit).repeat(chart[digit]) : '·'),
    ),
  );
  const missing = layout.filter((d) => !chart[d]).sort((a, b) => a - b);
  return el('section', { class: 'reading-card column' }, [
    el('h3', { text: 'Biểu đồ ngày sinh' }),
    grid,
    missing.length
      ? el('p', {}, [
          el('strong', { text: 'Số còn thiếu: ' }),
          missing.map((d) => `${d} (${CHART_DIGIT_MEANINGS[d].toLowerCase()})`).join('; '),
          '. Đây là những năng lượng bạn cần chủ động rèn luyện thêm.',
        ])
      : el('p', { text: 'Biểu đồ của bạn có đủ các con số từ 1 đến 9 — một sự cân bằng hiếm có.' }),
  ]);
}

function render(report, fullName) {
  const { day, month, year } = report.date;
  const dateText = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;

  const nodes = [
    el('h2', { text: fullName ? `Kết quả của ${fullName}` : 'Kết quả của bạn' }),
    el('p', { class: 'muted', text: `Ngày sinh: ${dateText}` }),
    meaningCard('Số chủ đạo', report.lifePath, { highlight: true }),
    meaningCard('Số ngày sinh', report.birthDay),
    el('article', { class: 'reading-card' }, [
      el('div', { class: 'number-badge', text: report.personalYear }),
      el('div', {}, [
        el('h3', { text: `Năm cá nhân ${report.currentYear}` }),
        el('p', { text: PERSONAL_YEAR_MEANINGS[report.personalYear] }),
      ]),
    ]),
  ];

  if (report.name) {
    nodes.push(meaningCard('Số sứ mệnh (tên)', report.name.expression));
    if (report.name.soulUrge) nodes.push(meaningCard('Số linh hồn', report.name.soulUrge));
    if (report.name.personality) nodes.push(meaningCard('Số nhân cách', report.name.personality));
  }

  nodes.push(birthChartView(report.chart));
  result.replaceChildren(...nodes);
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const fullName = form.elements.fullName.value.trim();
  try {
    const report = calculateReport({ fullName, birthDate: birthInput.value });
    render(report, fullName);
  } catch (error) {
    showError(result, error.message);
  }
});
