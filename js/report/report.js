/**
 * Printable A4 reports (saved as PDF with the browser's "Save as PDF").
 * kind: 'numerology' | 'matrix' | 'bazi' | 'full'
 */

import { el } from '../shared/dom.js';
import { formatDate } from '../shared/date.js';
import { calculateReport } from '../numerology/numerology.js';
import {
  NUMBER_MEANINGS, NUMBER_DETAILS, PERSONAL_YEAR_MEANINGS, UNIVERSAL_YEAR_MEANINGS, CHART_DIGIT_MEANINGS, CHALLENGE_MEANINGS,
  ARROW_MEANINGS, KARMIC_DEBT_MEANINGS, LESSON_MEANINGS, POSITION_TEXTS,
} from '../numerology/meanings.js';
import { calculateMatrixReport } from '../matrix/matrix.js';
import { ARCANA, ARCANA_DETAILS, POSITIONS, PURPOSES } from '../matrix/meanings.js';
import { healthChart, ageForecast, currentPeriod, ancestralLines, karmicTail } from '../matrix/advanced.js';
import { calculateBazi, parseBirthDateTime, ELEMENT_ORDER } from '../bazi/bazi.js';
import { analyzeAdvanced } from '../bazi/advanced.js';
import { buildProfile } from '../profile/profile.js';
import { CONFIG } from '../shop/config.js';

export const REPORT_TITLES = {
  numerology: 'Thần Số Học',
  matrix: 'Matrix Destiny',
  bazi: 'Bát Tự – Ngũ Hành',
  full: 'Hồ Sơ Nội Tâm Trọn Bộ',
};

const p = (text) => el('p', { text });
const kv = (label, text) => el('p', {}, [el('strong', { text: `${label}: ` }), text]);
const table = (head, rows) => el('table', { class: 'r-table' }, [
  el('thead', {}, el('tr', {}, head.map((h) => el('th', { text: h })))),
  el('tbody', {}, rows.map((r) => el('tr', {}, r.map((c) => el('td', { text: String(c) }))))),
]);
const section = (title, ...children) => el('section', { class: 'r-section' }, [el('h2', { text: title }), ...children]);
const block = (title, ...children) => el('div', { class: 'r-block' }, [el('h3', { text: title }), ...children]);

function numberBlock(label, n, position, withDetails = false) {
  const m = NUMBER_MEANINGS[n];
  return block(`${label}: ${n} – ${m.title}`,
    el('p', { class: 'r-keywords', text: m.keywords }),
    position ? p(POSITION_TEXTS[position][n]) : null,
    kv('Điểm mạnh', m.strengths),
    kv('Thử thách', m.challenges),
    withDetails ? kv('Sự nghiệp', NUMBER_DETAILS[n].career) : null,
    withDetails ? kv('Tình yêu', NUMBER_DETAILS[n].love) : null,
    kv('Lời khuyên', m.advice));
}

export function numerologySection(input) {
  const r = calculateReport({ fullName: input.fullName, birthDate: input.birthDate });
  const core = [
    ['Số chủ đạo', r.lifePath], ['Số ngày sinh', r.birthDay], ['Số thái độ', r.attitude],
    ...(r.name ? [['Số sứ mệnh', r.name.expression], ['Số linh hồn', r.name.soulUrge ?? '–'], ['Số nhân cách', r.name.personality ?? '–'], ['Số trưởng thành', r.maturity], ['Số cân bằng', r.balance]] : []),
  ];
  const layout = [3, 6, 9, 2, 5, 8, 1, 4, 7];
  return section('Thần Số Học Pythagoras',
    table(['Chỉ số', 'Giá trị', 'Ý nghĩa'], core.map(([k, v]) => [k, v, NUMBER_MEANINGS[v]?.title ?? ''])),
    numberBlock('Số chủ đạo', r.lifePath, null, true),
    numberBlock('Số ngày sinh', r.birthDay, 'birthday'),
    numberBlock('Số thái độ', r.attitude),
    r.name ? numberBlock('Số sứ mệnh', r.name.expression, 'expression', true) : null,
    r.name?.soulUrge ? numberBlock('Số linh hồn', r.name.soulUrge, 'soul') : null,
    r.name?.personality ? numberBlock('Số nhân cách', r.name.personality, 'personality') : null,
    r.name ? numberBlock('Số trưởng thành', r.maturity) : null,
    block('Số nợ nghiệp', ...(r.karmicDebts.length ? r.karmicDebts.map((d) => kv(d.source, KARMIC_DEBT_MEANINGS[d.number])) : [p('Không có số nợ nghiệp 13, 14, 16, 19.')])),
    r.name ? block('Phân tích họ tên',
      kv(`Số đam mê ẩn ${r.hiddenPassion.numbers.join(', ')}`, r.hiddenPassion.numbers.map((n) => NUMBER_MEANINGS[n].keywords).join('; ')),
      ...(r.karmicLessons.length ? r.karmicLessons.map((d) => p(LESSON_MEANINGS[d])) : [p('Tên có đủ các con số từ 1 đến 9.')])) : null,
    block('Ba chu kỳ đường đời', table(['Chu kỳ', 'Độ tuổi', 'Số', 'Chủ đề'],
      r.lifeCycles.map((c) => [c.label, c.to === null ? `từ ${c.from}` : `${c.from}–${c.to}`, c.value, NUMBER_MEANINGS[c.value].keywords]))),
    block('Bốn đỉnh cao & thử thách', table(['Giai đoạn', 'Bắt đầu', 'Đỉnh cao', 'Thử thách'],
      r.pinnacles.map((pk, i) => [`Đỉnh ${i + 1}`, `${pk.age} tuổi`, `${pk.value} – ${NUMBER_MEANINGS[pk.value].title}`, `${r.challenges[i]}: ${CHALLENGE_MEANINGS[r.challenges[i]]}`]))),
    block(`Năm thế giới ${r.currentYear}: số ${r.universalYear} – ${UNIVERSAL_YEAR_MEANINGS[r.universalYear].title}`,
      p(UNIVERSAL_YEAR_MEANINGS[r.universalYear].theme),
      kv('Nên làm', UNIVERSAL_YEAR_MEANINGS[r.universalYear].advice),
      table(['Năm', 'Năm thế giới', 'Chủ đề'], r.universalCycle.map((y) => [y.year, y.number, UNIVERSAL_YEAR_MEANINGS[y.number].title]))),
    block('Năm & tháng cá nhân',
      table(['Năm', 'Số', 'Chủ đề'], r.yearCycle.map((y) => [y.year, y.number, PERSONAL_YEAR_MEANINGS[y.number]])),
      table(['Tháng', 'Số'], r.personalMonths.map((m) => [`${m.month}/${m.year}`, m.number]))),
    block('Biểu đồ ngày sinh & mũi tên',
      el('table', { class: 'r-grid' }, el('tbody', {}, [0, 1, 2].map((row) => el('tr', {}, layout.slice(row * 3, row * 3 + 3)
        .map((d) => el('td', { text: r.chart[d] ? String(d).repeat(r.chart[d]) : '·' })))))),
      ...[1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => !r.chart[d]).map((d) => p(`Thiếu số ${d}: ${CHART_DIGIT_MEANINGS[d]}.`)),
      ...r.arrows.map(({ line, type }) => kv(ARROW_MEANINGS[line][type][0], ARROW_MEANINGS[line][type][1]))),
  );
}

export function matrixSection(input) {
  const report = calculateMatrixReport({ birthDate: input.birthDate });
  const pts = report.points;
  const age = new Date().getFullYear() - report.date.year;
  const health = healthChart(pts);
  const periods = ageForecast(pts);
  const now = currentPeriod(periods, age);
  const lines = ancestralLines(pts);
  const arcanaBlock = (title, n, hint) => block(`${title}: ${n} – ${ARCANA[n].name}`,
    hint ? p(hint) : null,
    el('p', { class: 'r-keywords', text: ARCANA[n].keywords }),
    kv('Khi tích cực', ARCANA[n].plus), kv('Khi tiêu cực', ARCANA[n].minus),
    kv('Nghề nghiệp', ARCANA_DETAILS[n].career), kv('Lời khuyên', ARCANA_DETAILS[n].advice));
  return section('Matrix Destiny – Ma Trận Vận Mệnh',
    table(['Điểm', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'], [['Giá trị', pts.A, pts.B, pts.C, pts.D, pts.E, pts.F, pts.G, pts.H, pts.I]]),
    ...POSITIONS.map((pos) => arcanaBlock(pos.title, pts[pos.key], pos.hint)),
    block('Mục đích sống', table(['Mục đích', 'Năng lượng', 'Gợi ý'], PURPOSES.map((pp) => [pp.title, `${report.purposes[pp.key]} – ${ARCANA[report.purposes[pp.key]].name}`, pp.hint]))),
    block(`Giải mã đuôi nghiệp ${karmicTail(pts).map((s) => s.value).join('-')}`,
      ...karmicTail(pts).map((s, i) => kv(`${s.role} (${s.value} – ${ARCANA[s.value].name})`, i < 2 ? ARCANA[s.value].minus : ARCANA[s.value].plus))),
    block('Bảng sức khỏe 7 luân xa', table(['Luân xa', 'Vùng cơ thể', 'Thể chất', 'Năng lượng', 'Cảm xúc'],
      [...health.rows.map((r) => [r.name, r.body, r.physical, r.energy, r.emotion]), ['Tổng', '', health.total.physical, health.total.energy, health.total.emotion]]),
    p('Góc nhìn chiêm nghiệm, không thay thế khám chữa bệnh.')),
    block('Dòng nghiệp tổ tiên', ...[lines.paternal, lines.maternal].map((l) => kv(l.label, `${l.points.join(' · ')} (${l.points.map((n) => ARCANA[n].name).join(', ')}), tổng ${l.line} – ${ARCANA[l.line].name}`))),
    block('Vòng dự báo theo tuổi',
      kv(`Giai đoạn hiện tại ${now.from}–${now.to} tuổi`, `${now.value} – ${ARCANA[now.value].name}: ${ARCANA[now.value].plus}`),
      table(['Chặng', ...Array.from({ length: 8 }, (_, i) => `+${(i * 1.25).toString().replace('.', ',')}`)],
        Array.from({ length: 8 }, (_, d) => [`${d * 10}–${d * 10 + 10}`, ...periods.slice(d * 8, d * 8 + 8).map((x) => x.value)]))),
  );
}

export function baziSection(input) {
  const parsed = parseBirthDateTime(input.birthDate, input.birthTime);
  const report = calculateBazi(parsed);
  const adv = analyzeAdvanced(parsed, input.gender, report.pillars);
  const { pillars, dayMaster, napAm, zodiac, elements } = report;
  const cols = ['year', 'month', 'day', 'hour'];
  const labels = { year: 'Năm', month: 'Tháng', day: 'Ngày', hour: 'Giờ' };
  const present = cols.filter((k) => pillars[k]);
  return section('Bát Tự – Ngũ Hành',
    table(['', ...present.map((k) => `Trụ ${labels[k]}`)], [
      ['Thiên can', ...present.map((k) => `${pillars[k].stem.name} (${pillars[k].stem.element})`)],
      ['Thập thần', ...present.map((k) => adv.tenGods[k].stem)],
      ['Địa chi', ...present.map((k) => `${pillars[k].branch.name} (${pillars[k].branch.element})`)],
      ['Tàng can', ...present.map((k) => adv.tenGods[k].hidden.map((h) => `${h.stem.name} ${h.god}`).join(', '))],
    ]),
    block(`Nhật chủ ${dayMaster.name} ${dayMaster.element} – ${dayMaster.image}`,
      p(dayMaster.text),
      kv(`${adv.strength.level} (${adv.strength.score}/100)`, `Lệnh tháng ${pillars.month.branch.name}, trạng thái ${adv.strength.state}: ${adv.strength.stateText}.`),
      kv('Dụng thần (hành có lợi)', adv.strength.favorable.join(', '))),
    block(`Tuổi ${zodiac.name} (${zodiac.animal}) · Mệnh ${napAm.name}`, p(`${napAm.image}. ${elements[napAm.element].nature}.`)),
    block('Cân bằng ngũ hành (có tàng can)', table(['Hành', 'Điểm'], ELEMENT_ORDER.map((e) => [e, adv.weighted[e]]))),
    block('Thập Thần', ...Object.entries(adv.tenGodInfo)
      .filter(([name]) => Object.values(adv.tenGods).some((g) => g.stem === name || g.hidden[0].god === name))
      .map(([name, info]) => kv(name, info.text))),
    block('Hợp, xung, hại & thần sát',
      ...(adv.interactions.length ? adv.interactions.map((x) => kv(x.type, x.text)) : [p('Không có hợp, xung, hại đáng kể.')]),
      ...adv.shenSha.map((s) => kv(s.name, `ở trụ ${s.places.join(', ')}. ${s.text}`))),
    adv.luck
      ? block('Đại vận 10 năm',
        p(`${adv.luck.forward ? 'Thuận hành' : 'Nghịch hành'}, khởi vận khoảng ${adv.luck.startYears} tuổi ${adv.luck.startMonths} tháng.`),
        table(['Tuổi', 'Năm', 'Đại vận', 'Thập thần', 'Đánh giá'], adv.luck.pillars.map((l) => [`${l.startAge}–${l.startAge + 9}`, `${l.startYear}–${l.startYear + 9}`, l.name, `${l.god} · ${l.branchGod}`, l.rating])))
      : block('Đại vận 10 năm', p('Chưa chọn giới tính nên chưa tính đại vận.')),
    block('Lưu niên 5 năm', table(['Năm', 'Can chi', 'Thập thần', 'Đánh giá'], adv.years.map((y) => [y.year, y.name, y.god, y.rating]))),
    block('Bồi đắp hành có lợi', ...adv.strength.favorable.map((e) => kv(e, `Màu ${elements[e].color}; hướng ${elements[e].direction}; nghề hợp: ${elements[e].careers}. ${elements[e].boost}`))),
  );
}

export function profileSection(input) {
  const pr = buildProfile({ fullName: input.fullName, birthDate: input.birthDate, birthTime: input.birthTime });
  return section('Tổng hợp Hồ Sơ Nội Tâm',
    p(pr.summary),
    block('Điểm hội tụ giữa các hệ thống', table(['Chủ đề', 'Điểm', 'Nguồn'], pr.themes.slice(0, 5).map((t) => [t.name, t.score, t.sources.join(', ')]))),
    block('Đối chiếu ba trường phái', table(['Khía cạnh', 'Thần số học', 'Matrix Destiny', 'Bát Tự'], pr.rows.map((r) => [r.topic, r.numerology, r.matrix, r.bazi]))),
    block('Thực hành cho bạn', ...pr.practices.map((x) => kv(x.title, `${x.practice} ${x.meditation}`))),
  );
}

/** Build the whole printable document. Throws a user-facing Error when the input is invalid. */
export function buildReport(kind, input) {
  if (!REPORT_TITLES[kind]) throw new Error('Loại báo cáo không hợp lệ.');
  const parts = {
    numerology: () => [numerologySection(input)],
    matrix: () => [matrixSection(input)],
    bazi: () => [baziSection(input)],
    full: () => [profileSection(input), numerologySection(input), matrixSection(input), baziSection(input)],
  }[kind]();
  const who = input.fullName?.trim() || 'Bạn';
  const birth = parseBirthDateTime(input.birthDate, input.birthTime);
  const birthText = `${formatDate(birth)}${birth.hour === null ? '' : `, ${String(birth.hour).padStart(2, '0')}:${String(birth.minute).padStart(2, '0')}`}`;
  return el('article', { class: 'r-doc' }, [
    el('header', { class: 'r-cover' }, [
      el('img', { src: new URL('../../assets/emblem-512.webp', import.meta.url).href, alt: '', width: 120, height: 120 }),
      el('p', { class: 'r-brand', text: CONFIG.BRAND }),
      el('h1', { text: REPORT_TITLES[kind] }),
      el('p', { class: 'r-who', text: who }),
      el('p', { text: `Ngày sinh ${birthText}` }),
      el('p', { class: 'r-muted', text: `Lập ngày ${formatDate({ day: new Date().getDate(), month: new Date().getMonth() + 1, year: new Date().getFullYear() })} · ${CONFIG.EXPERT}` }),
    ]),
    ...parts,
    el('footer', { class: 'r-end' }, [
      p(`Nội dung mang tính tham khảo và chiêm nghiệm. Tư vấn 1-1 cùng ${CONFIG.EXPERT}: ${CONFIG.PHONE_DISPLAY} (điện thoại / Zalo).`),
    ]),
  ]);
}

export function printReport(kind, input) {
  const doc = buildReport(kind, input);
  let area = document.getElementById('print-area');
  if (!area) {
    area = el('div', { id: 'print-area' });
    document.body.append(area);
  }
  area.replaceChildren(doc);
  const previousTitle = document.title;
  document.title = `${REPORT_TITLES[kind]} – ${input.fullName?.trim() || 'INNER CODE'}`; // default PDF file name
  window.addEventListener('afterprint', () => { document.title = previousTitle; }, { once: true });
  window.print();
}
