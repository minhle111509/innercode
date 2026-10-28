import { el, svgEl, setChildren, showError } from '../shared/dom.js';
import { formatDate } from '../shared/date.js';
import { calculateMatrixReport } from './matrix.js';
import { ARCANA, ARCANA_DETAILS, POSITIONS, PURPOSES } from './meanings.js';

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
  );
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const fullName = form.elements.fullName.value.trim();
  try {
    render(calculateMatrixReport({ birthDate: birthInput.value }), fullName);
  } catch (error) {
    showError(result, error.message);
  }
});
