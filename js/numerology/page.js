import { el, setChildren, showError } from '../shared/dom.js';
import { formatDate } from '../shared/date.js';
import { calculateReport } from './numerology.js';
import {
  NUMBER_MEANINGS, NUMBER_DETAILS, PERSONAL_YEAR_MEANINGS, CHART_DIGIT_MEANINGS,
  CHALLENGE_MEANINGS, ARROW_MEANINGS,
} from './meanings.js';

const form = document.getElementById('numerology-form');
const result = document.getElementById('numerology-result');
const birthInput = document.getElementById('birth-date');

birthInput.max = new Date().toISOString().slice(0, 10);

function meaningCard(label, number, { highlight = false, hint = null, details = false } = {}) {
  const meaning = NUMBER_MEANINGS[number];
  const extra = details ? NUMBER_DETAILS[number] : null;
  return el('article', { class: `reading-card${highlight ? ' highlight' : ''}` }, [
    el('div', { class: 'number-badge', text: number }),
    el('div', {}, [
      el('h3', { text: `${label}: ${meaning.title}` }),
      hint ? el('p', { class: 'muted', text: hint }) : null,
      el('p', { class: 'keywords', text: meaning.keywords }),
      el('p', {}, [el('strong', { text: 'Điểm mạnh: ' }), meaning.strengths]),
      el('p', {}, [el('strong', { text: 'Thử thách: ' }), meaning.challenges]),
      extra ? el('p', {}, [el('strong', { text: 'Sự nghiệp: ' }), extra.career]) : null,
      extra ? el('p', {}, [el('strong', { text: 'Tình yêu: ' }), extra.love]) : null,
      el('p', {}, [el('strong', { text: 'Lời khuyên: ' }), meaning.advice]),
    ]),
  ]);
}

function birthChartView(chart, arrows) {
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
    el('h3', { text: 'Biểu đồ ngày sinh & mũi tên' }),
    grid,
    missing.length
      ? el('p', {}, [
          el('strong', { text: 'Số còn thiếu: ' }),
          missing.map((d) => `${d} (${CHART_DIGIT_MEANINGS[d].toLowerCase()})`).join('; '),
          '. Đây là những năng lượng bạn cần chủ động rèn luyện thêm.',
        ])
      : el('p', { text: 'Biểu đồ của bạn có đủ các con số từ 1 đến 9, một sự cân bằng hiếm có.' }),
    arrows.length
      ? el('ul', { class: 'arrow-list' }, arrows.map(({ line, type }) => {
          const [name, text] = ARROW_MEANINGS[line][type];
          return el('li', {}, [
            el('span', { class: `verdict ${type === 'full' ? 'good' : 'bad'}`, text: line.split('').join('-') }),
            el('strong', { text: ` ${name}. ` }),
            text,
          ]);
        }))
      : el('p', { class: 'muted', text: 'Biểu đồ không có mũi tên nào trọn vẹn hay trống hoàn toàn.' }),
  ]);
}

function pinnacleView(pinnacles, challenges, age) {
  const current = pinnacles.findLastIndex((p) => age >= p.age);
  return el('section', { class: 'reading-card column' }, [
    el('h3', { text: 'Bốn đỉnh cao & thử thách cuộc đời' }),
    el('p', { class: 'muted', text: 'Mỗi đỉnh cao là một giai đoạn với chủ đề riêng, bắt đầu từ độ tuổi ghi bên dưới.' }),
    el('div', { class: 'purpose-grid' }, pinnacles.map((p, i) => el('div', { class: `purpose${i === current ? ' current' : ''}` }, [
      el('span', { class: 'purpose-number', text: p.value }),
      el('strong', { text: `Đỉnh ${i + 1} · ${i === 0 ? 'đến' : 'từ'} ${p.age} tuổi` }),
      el('span', { class: 'purpose-name', text: NUMBER_MEANINGS[p.value].title }),
      el('span', { class: 'keywords', text: NUMBER_MEANINGS[p.value].keywords }),
      el('span', { class: 'muted', text: `Thử thách ${challenges[i]}: ${CHALLENGE_MEANINGS[challenges[i]]}` }),
      i === current ? el('span', { class: 'tag-now', text: 'Giai đoạn hiện tại' }) : null,
    ]))),
  ]);
}

function yearCycleView(cycle) {
  return el('section', { class: 'reading-card column' }, [
    el('h3', { text: 'Chu kỳ năm cá nhân' }),
    el('div', { class: 'purpose-grid' }, cycle.map(({ year, number }, i) => el('div', { class: `purpose${i === 0 ? ' current' : ''}` }, [
      el('span', { class: 'purpose-number', text: number }),
      el('strong', { text: `Năm ${year}` }),
      el('span', { class: 'muted', text: PERSONAL_YEAR_MEANINGS[number] }),
    ]))),
  ]);
}

function render(report, fullName) {
  const nodes = [
    el('h2', { text: fullName ? `Kết quả của ${fullName}` : 'Kết quả của bạn' }),
    el('p', { class: 'muted', text: `Ngày sinh: ${formatDate(report.date)}` }),
    meaningCard('Số chủ đạo', report.lifePath, {
      highlight: true, details: true, hint: 'Con số quan trọng nhất, cho biết bài học và con đường chính của cuộc đời.',
    }),
    meaningCard('Số ngày sinh', report.birthDay, { hint: 'Năng khiếu tự nhiên bạn mang theo từ khi sinh ra.' }),
    meaningCard('Số thái độ', report.attitude, { hint: 'Ấn tượng đầu tiên và cách bạn phản ứng với hoàn cảnh.' }),
  ];

  if (report.name) {
    nodes.push(meaningCard('Số sứ mệnh', report.name.expression, { hint: 'Từ toàn bộ họ tên: tài năng và hướng bạn được sinh ra để phát triển.', details: true }));
    if (report.name.soulUrge) nodes.push(meaningCard('Số linh hồn', report.name.soulUrge, { hint: 'Từ các nguyên âm: khao khát sâu thẳm bên trong.' }));
    if (report.name.personality) nodes.push(meaningCard('Số nhân cách', report.name.personality, { hint: 'Từ các phụ âm: hình ảnh bạn thể hiện ra bên ngoài.' }));
    nodes.push(meaningCard('Số trưởng thành', report.maturity, { hint: 'Năng lượng phát huy mạnh từ khoảng tuổi 35–40 trở đi.' }));
  } else {
    nodes.push(el('p', { class: 'muted', text: 'Nhập họ tên để xem thêm số sứ mệnh, linh hồn, nhân cách và trưởng thành.' }));
  }

  nodes.push(
    pinnacleView(report.pinnacles, report.challenges, report.age),
    yearCycleView(report.yearCycle),
    birthChartView(report.chart, report.arrows),
  );
  setChildren(result, ...nodes);
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const fullName = form.elements.fullName.value.trim();
  try {
    render(calculateReport({ fullName, birthDate: birthInput.value }), fullName);
  } catch (error) {
    showError(result, error.message);
  }
});
