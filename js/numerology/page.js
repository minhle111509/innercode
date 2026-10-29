import { el, setChildren, showError } from '../shared/dom.js';
import { formatDate } from '../shared/date.js';
import { calculateReport } from './numerology.js';
import {
  NUMBER_MEANINGS, NUMBER_DETAILS, PERSONAL_YEAR_MEANINGS, CHART_DIGIT_MEANINGS,
  CHALLENGE_MEANINGS, ARROW_MEANINGS, KARMIC_DEBT_MEANINGS, LESSON_MEANINGS, POSITION_TEXTS,
} from './meanings.js';
import { mountReportOffers, profileHref } from '../report/offers.js';
import { lockedSection } from '../report/paywall.js';

const form = document.getElementById('numerology-form');
const result = document.getElementById('numerology-result');
const birthInput = document.getElementById('birth-date');

birthInput.max = new Date().toISOString().slice(0, 10);

function meaningCard(label, number, { highlight = false, hint = null, details = false, position = null } = {}) {
  const meaning = NUMBER_MEANINGS[number];
  const extra = details ? NUMBER_DETAILS[number] : null;
  return el('article', { class: `reading-card${highlight ? ' highlight' : ''}` }, [
    el('div', { class: 'number-badge', text: number }),
    el('div', {}, [
      el('h3', { text: `${label}: ${meaning.title}` }),
      hint ? el('p', { class: 'muted', text: hint }) : null,
      position ? el('p', { class: 'advice', text: POSITION_TEXTS[position][number] }) : null,
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

function karmicView(debts) {
  return el('section', { class: 'reading-card column' }, [
    el('h3', { text: 'Số nợ nghiệp' }),
    debts.length
      ? el('ul', { class: 'arrow-list' }, debts.map((d) => el('li', {}, [
        el('span', { class: 'verdict bad', text: d.number }), el('strong', { text: ` ${d.source}. ` }), KARMIC_DEBT_MEANINGS[d.number],
      ])))
      : el('p', { class: 'muted', text: 'Không có số nợ nghiệp (13, 14, 16, 19) trong ngày sinh và các số cốt lõi.' }),
  ]);
}

function nameView(report) {
  const { karmicLessons: lessons, hiddenPassion: passion, balance } = report;
  return el('section', { class: 'reading-card column' }, [
    el('h3', { text: 'Phân tích họ tên' }),
    el('p', {}, [
      el('strong', { text: `Số cân bằng ${balance}: ` }),
      `Khi gặp khó khăn, hãy dùng năng lượng ${NUMBER_MEANINGS[balance].keywords.toLowerCase()} để lấy lại thăng bằng.`,
    ]),
    el('p', {}, [
      el('strong', { text: `Số đam mê ẩn ${passion.numbers.join(', ')}: ` }),
      `xuất hiện ${passion.count} lần trong tên; năng lượng ${passion.numbers.map((n) => NUMBER_MEANINGS[n].title.toLowerCase()).join(', ')} là động lực thầm kín thúc đẩy bạn.`,
    ]),
    lessons.length
      ? el('ul', { class: 'arrow-list' }, lessons.map((d) => el('li', {}, [el('span', { class: 'verdict neutral', text: d }), ` ${LESSON_MEANINGS[d]}`])))
      : el('p', { class: 'muted', text: 'Tên của bạn có đủ các con số từ 1 đến 9, không có bài học nghiệp nào bị thiếu.' }),
  ]);
}

function cyclesView(cycles, age) {
  return el('section', { class: 'reading-card column' }, [
    el('h3', { text: 'Ba chu kỳ đường đời' }),
    el('div', { class: 'purpose-grid' }, cycles.map((c) => {
      const current = age >= c.from && (c.to === null || age < c.to);
      return el('div', { class: `purpose${current ? ' current' : ''}` }, [
        el('span', { class: 'purpose-number', text: c.value }),
        el('strong', { text: `${c.label} · ${c.to === null ? `từ ${c.from} tuổi` : `${c.from}–${c.to} tuổi`}` }),
        el('span', { class: 'purpose-name', text: NUMBER_MEANINGS[c.value].title }),
        el('span', { class: 'keywords', text: NUMBER_MEANINGS[c.value].keywords }),
        current ? el('span', { class: 'tag-now', text: 'Hiện tại' }) : null,
      ]);
    })),
  ]);
}

function monthsView(months, day) {
  return el('section', { class: 'reading-card column' }, [
    el('h3', { text: 'Tháng & ngày cá nhân' }),
    el('p', {}, [el('strong', { text: `Hôm nay là ngày cá nhân số ${day}. ` }), PERSONAL_YEAR_MEANINGS[day].split(':')[1].trim()]),
    el('div', { class: 'purpose-grid' }, months.map((m, i) => el('div', { class: `purpose${i === 0 ? ' current' : ''}` }, [
      el('span', { class: 'purpose-number', text: m.number }),
      el('strong', { text: `Tháng ${m.month}/${m.year}` }),
      el('span', { class: 'muted', text: PERSONAL_YEAR_MEANINGS[m.number].replace('Năm', 'Tháng') }),
    ]))),
  ]);
}

/** Free preview: the life path number with a few lines; everything else is in the locked block. */
function previewCard(number) {
  const meaning = NUMBER_MEANINGS[number];
  return el('article', { class: 'reading-card highlight' }, [
    el('div', { class: 'number-badge', text: number }),
    el('div', {}, [
      el('h3', { text: `Số chủ đạo: ${meaning.title}` }),
      el('p', { class: 'muted', text: 'Con số quan trọng nhất, cho biết bài học và con đường chính của cuộc đời.' }),
      el('p', { class: 'keywords', text: meaning.keywords }),
      el('p', {}, [el('strong', { text: 'Điểm mạnh: ' }), meaning.strengths]),
    ]),
  ]);
}

function deepReading(report) {
  const nodes = [
    meaningCard('Số chủ đạo', report.lifePath, {
      highlight: true, details: true, hint: 'Luận giải đầy đủ: thử thách, sự nghiệp, tình yêu và lời khuyên.',
    }),
    meaningCard('Số ngày sinh', report.birthDay, { hint: 'Năng khiếu tự nhiên bạn mang theo từ khi sinh ra.', position: 'birthday' }),
    meaningCard('Số thái độ', report.attitude, { hint: 'Ấn tượng đầu tiên và cách bạn phản ứng với hoàn cảnh.' }),
  ];

  if (report.name) {
    nodes.push(meaningCard('Số sứ mệnh', report.name.expression, { hint: 'Từ toàn bộ họ tên: tài năng và hướng bạn được sinh ra để phát triển.', details: true, position: 'expression' }));
    if (report.name.soulUrge) nodes.push(meaningCard('Số linh hồn', report.name.soulUrge, { hint: 'Từ các nguyên âm: khao khát sâu thẳm bên trong.', position: 'soul' }));
    if (report.name.personality) nodes.push(meaningCard('Số nhân cách', report.name.personality, { hint: 'Từ các phụ âm: hình ảnh bạn thể hiện ra bên ngoài.', position: 'personality' }));
    nodes.push(meaningCard('Số trưởng thành', report.maturity, { hint: 'Năng lượng phát huy mạnh từ khoảng tuổi 35–40 trở đi.' }));
  } else {
    nodes.push(el('p', { class: 'muted', text: 'Nhập họ tên để xem thêm số sứ mệnh, linh hồn, nhân cách và trưởng thành.' }));
  }

  nodes.push(
    karmicView(report.karmicDebts),
    report.name ? nameView(report) : null,
    cyclesView(report.lifeCycles, report.age),
    pinnacleView(report.pinnacles, report.challenges, report.age),
    yearCycleView(report.yearCycle),
    monthsView(report.personalMonths, report.personalDay),
    birthChartView(report.chart, report.arrows),
  );
  return nodes;
}

function render(report, input, onUnlock) {
  const { fullName } = input;
  setChildren(result,
    el('h2', { text: fullName ? `Kết quả của ${fullName}` : 'Kết quả của bạn' }),
    el('p', { class: 'muted', text: `Ngày sinh: ${formatDate(report.date)}` }),
    previewCard(report.lifePath),
    lockedSection({
      item: 'single_numerology',
      input,
      title: 'Luận giải Thần số học chuyên sâu',
      includes: [
        'Luận giải đầy đủ số chủ đạo: thử thách, sự nghiệp, tình yêu, lời khuyên',
        report.name ? 'Số ngày sinh, thái độ, sứ mệnh, linh hồn, nhân cách, trưởng thành' : 'Số ngày sinh, thái độ (nhập họ tên để có thêm 4 chỉ số tên)',
        'Số nợ nghiệp và bài học nghiệp từ họ tên',
        '3 chu kỳ đường đời, 4 đỉnh cao và thử thách theo độ tuổi',
        'Năm, tháng, ngày cá nhân: điều nên làm lúc này',
        'Biểu đồ ngày sinh và 8 mũi tên tính cách',
      ],
      build: () => deepReading(report),
      upsellHref: profileHref(() => input),
      onUnlock,
    }),
  );
}

function show(input, scroll) {
  render(calculateReport(input), input, () => show(input, false));
  mountReportOffers(document.getElementById('report-offers'), () => input, { single: 'numerology', onUnlock: () => show(input, false) });
  if (scroll) result.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  try {
    show({ fullName: form.elements.fullName.value.trim(), birthDate: birthInput.value }, true);
  } catch (error) {
    showError(result, error.message);
  }
});
