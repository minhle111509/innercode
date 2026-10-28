import { el, svgEl, setChildren, showError } from '../shared/dom.js';
import { formatDate } from '../shared/date.js';
import { calculateMatrixReport } from './matrix.js';
import { ARCANA, ARCANA_DETAILS, POSITIONS, PURPOSES } from './meanings.js';
import { healthChart, ageForecast, currentPeriod, ancestralLines, karmicTail } from './advanced.js';
import { mountReportOffers } from '../report/offers.js';

const ageText = (n) => String(Math.round(n * 100) / 100).replace('.', ',');

function healthView(points) {
  const { rows, total } = healthChart(points);
  const cell = (n) => el('td', { title: ARCANA[n].name }, [el('strong', { text: n }), el('br'), el('span', { class: 'muted', text: ARCANA[n].name })]);
  return el('section', { class: 'reading-card column' }, [
    el('h3', { text: 'Bảng sức khỏe 7 luân xa' }),
    el('p', { class: 'muted', text: 'Cột Thể chất và Năng lượng lấy từ các điểm trên ma trận; Cảm xúc là tổng của hai cột. Năng lượng ở trạng thái tiêu cực kéo dài có thể phản ánh lên vùng cơ thể tương ứng. Đây là góc nhìn chiêm nghiệm, không thay thế khám chữa bệnh.' }),
    el('div', { class: 'table-wrap' }, el('table', { class: 'data-table' }, [
      el('thead', {}, el('tr', {}, ['Luân xa', 'Vùng cơ thể', 'Thể chất', 'Năng lượng', 'Cảm xúc'].map((h) => el('th', { text: h })))),
      el('tbody', {}, [
        ...rows.map((row) => el('tr', {}, [
          el('td', {}, [el('strong', { text: row.name }), el('br'), el('span', { class: 'muted', text: row.theme })]),
          el('td', { text: row.body }),
          cell(row.physical), cell(row.energy), cell(row.emotion),
        ])),
        el('tr', { class: 'total-row' }, [el('td', { text: 'Tổng' }), el('td'), cell(total.physical), cell(total.energy), cell(total.emotion)]),
      ]),
    ])),
  ]);
}

function forecastView(points, age) {
  const periods = ageForecast(points);
  const now = currentPeriod(periods, age);
  const arcana = ARCANA[now.value];
  const decades = Array.from({ length: 8 }, (_, d) => periods.slice(d * 8, d * 8 + 8));
  return el('section', { class: 'reading-card column' }, [
    el('h3', { text: 'Vòng dự báo theo tuổi (0–80)' }),
    el('p', { class: 'muted', text: 'Mỗi chặng 10 năm chia làm 8 giai đoạn khoảng 1 năm 3 tháng. Năng lượng của giai đoạn cho biết chủ đề nổi bật của quãng đời đó.' }),
    el('article', { class: 'now-card' }, [
      el('span', { class: 'core-label', text: `Bạn đang ở giai đoạn ${ageText(now.from)}–${ageText(now.to)} tuổi` }),
      el('strong', { class: 'core-value', text: `${now.value} · ${arcana.name}` }),
      el('span', { class: 'keywords', text: arcana.keywords }),
      el('span', {}, [el('strong', { text: 'Tận dụng: ' }), arcana.plus]),
      el('span', {}, [el('strong', { text: 'Cẩn trọng: ' }), arcana.minus]),
    ]),
    el('div', { class: 'decades' }, decades.map((list) => el('div', { class: 'decade' }, [
      el('span', { class: 'decade-label', text: `${list[0].from}–${list[0].from + 10} tuổi` }),
      el('div', { class: 'decade-chips' }, list.map((p) => el('span', {
        class: `age-chip${p === now ? ' current' : ''}${p.anchor ? ' anchor' : ''}`,
        title: `${ageText(p.from)}–${ageText(p.to)} tuổi: ${ARCANA[p.value].name}`,
      }, [el('small', { text: ageText(p.from) }), el('strong', { text: p.value })]))),
    ]))),
  ]);
}

function ancestryView(points) {
  const lines = ancestralLines(points);
  return el('section', { class: 'reading-card column' }, [
    el('h3', { text: 'Dòng nghiệp tổ tiên' }),
    el('p', { class: 'muted', text: 'Hai đường chéo của hình vuông: bên nội (góc trên trái – dưới phải) và bên ngoại (góc trên phải – dưới trái). Đây là những năng lượng, thói quen và bài học truyền qua gia đình.' }),
    el('div', { class: 'purpose-grid' }, [lines.paternal, lines.maternal].map((line) => el('div', { class: 'purpose' }, [
      el('strong', { text: line.label }),
      el('span', { class: 'purpose-number', text: line.points.join(' · ') }),
      el('span', { class: 'purpose-name', text: line.points.map((n) => ARCANA[n].name).join(' · ') }),
      el('span', {}, [el('strong', { text: 'Món quà: ' }), ARCANA[line.points[0]].plus]),
      el('span', { class: 'muted' }, [el('strong', { text: 'Bài học: ' }), ARCANA[line.points[1]].minus]),
      el('span', { class: 'muted', text: `Năng lượng tổng của dòng: ${line.line} – ${ARCANA[line.line].name}` }),
    ]))),
  ]);
}

function tailView(points) {
  const steps = karmicTail(points);
  return el('section', { class: 'reading-card column' }, [
    el('h3', { text: `Giải mã đuôi nghiệp ${steps.map((s) => s.value).join('-')}` }),
    el('p', { class: 'muted', text: 'Đọc theo ba bước từ ngoài vào trong: gốc bài học, cách nó hiện ra trong đời sống và chìa khóa để hóa giải.' }),
    el('ol', { class: 'steps' }, steps.map((step, i) => el('li', {}, [
      el('strong', { text: `${step.role}: ${step.value} – ${ARCANA[step.value].name}. ` }),
      i < 2 ? ARCANA[step.value].minus : `${ARCANA[step.value].plus} ${ARCANA_DETAILS[step.value].advice}`,
    ]))),
  ]);
}

const form = document.getElementById('matrix-form');
const result = document.getElementById('matrix-result');
const birthInput = document.getElementById('birth-date');

birthInput.max = new Date().toISOString().slice(0, 10);

const CENTER = [200, 200];
const OUTER = {
  A: [40, 200], B: [200, 40], C: [360, 200], D: [200, 360],
  F: [87, 87], G: [313, 87], H: [313, 313], I: [87, 313],
};

const lerp = ([x1, y1], [x2, y2], t) => [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];

function chartLayout() {
  const layout = { ...OUTER, E: CENTER };
  for (const key of ['A', 'B', 'C', 'D']) {
    layout[`${key}2`] = lerp(OUTER[key], CENTER, 0.24);
    layout[`${key}1`] = lerp(OUTER[key], CENTER, 0.46);
  }
  layout.X = lerp(layout.C1, layout.D1, 0.5);
  layout.money = lerp(layout.X, layout.C1, 0.5);
  layout.love = lerp(layout.X, layout.D1, 0.5);
  return layout;
}

function pointStyle(key) {
  if (key === 'E') return { r: 24, cls: 'pt-core' };
  if ('AB'.includes(key) && key.length === 1) return { r: 22, cls: 'pt-spirit' };
  if ('CD'.includes(key) && key.length === 1) return { r: 22, cls: 'pt-matter' };
  if ('FGHI'.includes(key)) return { r: 19, cls: 'pt-ancestor' };
  if (key === 'money' || key === 'love') return { r: 12, cls: 'pt-channel' };
  return { r: 14, cls: 'pt-inner' };
}

function matrixChart(points) {
  const layout = chartLayout();
  const line = (from, to) => svgEl('line', { x1: from[0], y1: from[1], x2: to[0], y2: to[1] });
  const polygon = (...keys) => svgEl('polygon', { points: keys.map((k) => layout[k].join(',')).join(' ') });

  const lines = svgEl('g', { class: 'chart-lines' }, [
    polygon('F', 'G', 'H', 'I'),
    polygon('A', 'B', 'C', 'D'),
    line(layout.A, layout.C),
    line(layout.B, layout.D),
    line(layout.F, layout.H),
    line(layout.G, layout.I),
    line(layout.C1, layout.D1),
  ]);

  const nodes = Object.entries(layout).map(([key, [cx, cy]]) => {
    const { r, cls } = pointStyle(key);
    return svgEl('g', { class: `chart-point ${cls}` }, [
      svgEl('title', { text: `${key}: ${points[key]} – ${ARCANA[points[key]].name}` }),
      svgEl('circle', { cx, cy, r }),
      svgEl('text', { x: cx, y: cy, 'font-size': Math.round(r * 0.95), text: points[key] }),
    ]);
  });

  // Labels sit on the outer side of the C1–D1 channel so they never cover a point.
  const labels = svgEl('g', { class: 'chart-labels' }, [
    svgEl('text', { x: layout.money[0] + 17, y: layout.money[1] + 17, text: '$' }),
    svgEl('text', { x: layout.love[0] + 17, y: layout.love[1] + 17, text: '♥' }),
  ]);

  return el('figure', { class: 'matrix-figure' }, [
    svgEl('svg', {
      class: 'matrix-chart',
      viewBox: '0 0 400 400',
      role: 'img',
      'aria-label': `Ma trận vận mệnh, năng lượng trung tâm ${points.E}`,
    }, [lines, ...nodes, labels]),
    el('figcaption', { class: 'chart-legend' }, [
      el('span', { class: 'dot pt-spirit' }), 'Tâm linh (ngày, tháng)',
      el('span', { class: 'dot pt-matter' }), 'Vật chất (năm, nghiệp)',
      el('span', { class: 'dot pt-core' }), 'Trung tâm',
      el('span', { class: 'dot pt-ancestor' }), 'Dòng tộc',
    ]),
  ]);
}

function arcanaCard(position, points) {
  const number = points[position.key];
  const arcana = ARCANA[number];
  return el('article', { class: `reading-card${position.highlight ? ' highlight' : ''}` }, [
    el('div', { class: 'number-badge', text: number }),
    el('div', {}, [
      el('h3', { text: `${position.title}: ${arcana.name}` }),
      el('p', { class: 'muted', text: position.hint }),
      position.trio ? el('p', { class: 'trio', text: position.trio.map((k) => points[k]).join(' · ') }) : null,
      el('p', { class: 'keywords', text: arcana.keywords }),
      el('p', {}, [el('strong', { text: 'Khi tích cực: ' }), arcana.plus]),
      el('p', {}, [el('strong', { text: 'Khi tiêu cực: ' }), arcana.minus]),
      position.career ? el('p', {}, [el('strong', { text: 'Nghề nghiệp phù hợp: ' }), ARCANA_DETAILS[number].career]) : null,
      el('p', {}, [el('strong', { text: 'Lời khuyên: ' }), ARCANA_DETAILS[number].advice]),
    ]),
  ]);
}

function purposeGrid(purposes) {
  return el('section', { class: 'reading-card column' }, [
    el('h3', { text: 'Mục đích sống' }),
    el('div', { class: 'purpose-grid' }, PURPOSES.map(({ key, title, hint }) => {
      const arcana = ARCANA[purposes[key]];
      return el('div', { class: 'purpose' }, [
        el('span', { class: 'purpose-number', text: purposes[key] }),
        el('strong', { text: title }),
        el('span', { class: 'purpose-name', text: arcana.name }),
        el('span', { class: 'muted', text: hint }),
        el('span', { class: 'keywords', text: arcana.keywords }),
      ]);
    })),
  ]);
}

function render(report, fullName) {
  setChildren(result,
    el('h2', { text: fullName ? `Ma trận của ${fullName}` : 'Ma trận của bạn' }),
    el('p', { class: 'muted', text: `Ngày sinh: ${formatDate(report.date)}` }),
    matrixChart(report.points),
    ...POSITIONS.map((position) => arcanaCard(position, report.points)),
    purposeGrid(report.purposes),
    tailView(report.points),
    healthView(report.points),
    forecastView(report.points, new Date().getFullYear() - report.date.year),
    ancestryView(report.points),
  );
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const fullName = form.elements.fullName.value.trim();
  try {
    render(calculateMatrixReport({ birthDate: birthInput.value }), fullName);
    mountReportOffers(document.getElementById('report-offers'), () => ({ fullName: form.elements.fullName.value.trim(), birthDate: birthInput.value }), { single: 'matrix' });
  } catch (error) {
    showError(result, error.message);
  }
});
