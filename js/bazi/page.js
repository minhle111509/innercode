import { el, setChildren, showError } from '../shared/dom.js';
import { calculateBazi, parseBirthDateTime, ELEMENT_ORDER } from './bazi.js';
import { analyzeAdvanced } from './advanced.js';

const form = document.getElementById('bazi-form');
const result = document.getElementById('bazi-result');
const birthInput = document.getElementById('birth-date');
const timeInput = document.getElementById('birth-time');
const genderInput = document.getElementById('gender');

birthInput.max = new Date().toISOString().slice(0, 10);

const elementTag = (element) => el('span', { class: `el-tag el-${ELEMENT_ORDER.indexOf(element)}`, text: element });
const ratingClass = (r) => (r === 'Rất thuận' ? 'good' : r === 'Thử thách' ? 'bad' : 'neutral');
const pad = (n) => String(n).padStart(2, '0');

function pillarColumn(label, p, gods) {
  if (!p) {
    return el('div', { class: 'pillar unknown' }, [
      el('p', { class: 'position', text: label }),
      el('p', { class: 'pillar-char muted', text: '—' }),
      el('p', { class: 'muted', text: 'Chưa có giờ sinh' }),
    ]);
  }
  return el('div', { class: 'pillar' }, [
    el('p', { class: 'position', text: label }),
    el('p', { class: 'pillar-god', text: gods.stem }),
    el('p', { class: 'pillar-char', text: p.stem.name }),
    el('p', {}, [elementTag(p.stem.element), ` ${p.stem.yang ? 'Dương' : 'Âm'}`]),
    el('p', { class: 'pillar-char', text: p.branch.name }),
    el('p', {}, [elementTag(p.branch.element), ` ${p.branch.animal}`]),
    el('div', { class: 'hidden-stems', title: 'Tàng can' }, gods.hidden.map((h) => el('span', {}, [
      el('strong', { text: h.stem.name }), ` ${h.god}`,
    ]))),
  ]);
}

function balanceBars(scores) {
  const max = Math.max(...Object.values(scores), 1);
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  return el('div', { class: 'bars' }, ELEMENT_ORDER.map((element, i) => el('div', { class: 'bar-row' }, [
    el('span', { class: 'bar-label', text: element }),
    el('span', { class: 'bar-track' }, el('span', { class: `bar-fill el-bg-${i}`, style: `width:${(scores[element] / max) * 100}%` })),
    el('span', { class: 'bar-value', text: `${Math.round((scores[element] / total) * 100)}%` }),
  ])));
}

function elementAdvice(name, info, role) {
  return el('div', { class: 'purpose' }, [
    el('span', { class: 'purpose-name' }, [elementTag(name), ` ${role}`]),
    el('span', {}, [el('strong', { text: 'Màu: ' }), info.color]),
    el('span', {}, [el('strong', { text: 'Hướng: ' }), info.direction]),
    el('span', {}, [el('strong', { text: 'Nghề hợp: ' }), info.careers]),
    el('span', { class: 'muted', text: info.boost }),
  ]);
}

function tenGodSummary(tenGods, info) {
  const counts = new Map();
  for (const key of ['year', 'month', 'hour']) {
    if (tenGods[key]) counts.set(tenGods[key].stem, (counts.get(tenGods[key].stem) ?? 0) + 1);
  }
  for (const key of Object.keys(tenGods)) {
    const main = tenGods[key].hidden[0];
    counts.set(main.god, (counts.get(main.god) ?? 0) + 1);
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return el('section', { class: 'reading-card column' }, [
    el('h3', { text: 'Thập Thần nổi bật' }),
    el('p', { class: 'muted', text: 'Quan hệ của các can (lộ và chính khí tàng can) với nhật chủ, cho thấy những vai trò và chủ đề nổi bật trong đời.' }),
    el('ul', { class: 'arrow-list' }, ranked.map(([name, n]) => el('li', {}, [
      el('span', { class: 'verdict neutral', text: `×${n}` }),
      el('strong', { text: ` ${name} (${info[name].group}). ` }),
      info[name].text,
    ]))),
  ]);
}

function luckTable(luck, favorable) {
  if (!luck) {
    return el('section', { class: 'reading-card column' }, [
      el('h3', { text: 'Đại vận 10 năm' }),
      el('p', { class: 'muted', text: 'Chọn giới tính để tính chiều đại vận (thuận hay nghịch) và tuổi khởi vận.' }),
    ]);
  }
  return el('section', { class: 'reading-card column' }, [
    el('h3', { text: 'Đại vận 10 năm' }),
    el('p', { class: 'muted', text: `${luck.forward ? 'Thuận hành' : 'Nghịch hành'}, khởi vận khoảng ${luck.startYears} tuổi ${luck.startMonths} tháng (cách tiết khí ${luck.days} ngày). Hành có lợi: ${favorable.join(', ')}.` }),
    el('div', { class: 'luck-grid' }, luck.pillars.map((p, i) => el('div', { class: `luck${i === luck.currentIndex ? ' current' : ''}` }, [
      el('span', { class: 'luck-age', text: `${p.startAge}–${p.startAge + 9} tuổi` }),
      el('span', { class: 'muted', text: `${p.startYear}–${p.startYear + 9}` }),
      el('strong', { class: 'luck-name', text: p.name }),
      el('span', {}, [elementTag(p.stem.element), ' ', elementTag(p.branch.element)]),
      el('span', { class: 'muted', text: `${p.god} · ${p.branchGod}` }),
      el('span', { class: `verdict ${ratingClass(p.rating)}`, text: p.rating }),
      i === luck.currentIndex ? el('span', { class: 'tag-now', text: 'Đang ở vận này' }) : null,
    ]))),
  ]);
}

function annualList(years, info) {
  return el('section', { class: 'reading-card column' }, [
    el('h3', { text: 'Lưu niên 5 năm tới' }),
    el('div', { class: 'purpose-grid' }, years.map((y, i) => el('div', { class: `purpose${i === 0 ? ' current' : ''}` }, [
      el('strong', { text: `Năm ${y.year} · ${y.name}` }),
      el('span', {}, [elementTag(y.stem.element), ' ', elementTag(y.branch.element), ' ', el('span', { class: `verdict ${ratingClass(y.rating)}`, text: y.rating })]),
      el('span', { class: 'purpose-name', text: y.god }),
      el('span', { class: 'muted', text: info[y.god].text }),
    ]))),
  ]);
}

function render(report, adv) {
  const { input, lunar, pillars, zodiac, napAm, dayMaster, elements } = report;
  const { strength } = adv;
  const timeText = input.hour === null ? 'không rõ giờ' : `${pad(input.hour)}:${pad(input.minute)}`;
  const missing = ELEMENT_ORDER.filter((e) => adv.weighted[e] === 0);

  setChildren(result,
    el('h2', { text: 'Lá số Bát Tự của bạn' }),
    el('p', { class: 'muted', text: `Dương lịch ${pad(input.day)}/${pad(input.month)}/${input.year}, ${timeText} · Âm lịch ${lunar.day}/${lunar.month}${lunar.leap ? ' (nhuận)' : ''}/${lunar.year}` }),
    el('section', { class: 'pillars', 'aria-label': 'Tứ trụ' }, [
      pillarColumn('Trụ năm', pillars.year, adv.tenGods.year),
      pillarColumn('Trụ tháng', pillars.month, adv.tenGods.month),
      pillarColumn('Trụ ngày', pillars.day, adv.tenGods.day),
      pillarColumn('Trụ giờ', pillars.hour, adv.tenGods.hour),
    ]),
    el('p', { class: 'hint', text: 'Dòng nhỏ trên mỗi can là Thập Thần; ô dưới cùng là tàng can (can ẩn trong địa chi) và Thập Thần của chúng.' }),

    el('article', { class: 'reading-card highlight' }, [
      el('div', { class: 'number-badge small', text: dayMaster.name }),
      el('div', {}, [
        el('h3', { text: `Nhật chủ ${dayMaster.name} ${dayMaster.element}: ${dayMaster.image}` }),
        el('p', { text: dayMaster.text }),
        el('p', {}, [
          el('strong', { text: `${strength.level} (${strength.score}/100). ` }),
          `Lệnh tháng ${pillars.month.branch.name}: nhật chủ ở trạng thái ${strength.state}, ${strength.stateText}. `,
          `Lực hỗ trợ (cùng hành và hành sinh) chiếm ${strength.support}/${strength.total} điểm.`,
        ]),
        el('p', {}, [el('strong', { text: 'Dụng thần (hành có lợi): ' }), strength.favorable.join(', ')]),
      ]),
    ]),

    el('article', { class: 'reading-card' }, [
      el('div', { class: 'number-badge small', text: zodiac.branch.name }),
      el('div', {}, [
        el('h3', { text: `Tuổi ${zodiac.name} (${zodiac.animal}) · Mệnh ${napAm.name}` }),
        el('p', { class: 'muted', text: `${napAm.image}. Tính theo năm âm lịch như cách gọi tuổi thông thường.` }),
        el('p', { class: 'keywords', text: elements[napAm.element].nature }),
      ]),
    ]),

    el('section', { class: 'reading-card column' }, [
      el('h3', { text: 'Cân bằng Ngũ Hành (có tính tàng can)' }),
      el('p', { class: 'muted', text: 'Mỗi thiên can tính 1 điểm; mỗi địa chi 1 điểm chia cho các can ẩn bên trong.' }),
      balanceBars(adv.weighted),
      missing.length
        ? el('p', {}, [el('strong', { text: 'Hoàn toàn vắng: ' }), missing.join(', ')])
        : el('p', { class: 'muted', text: 'Lá số có mặt đủ cả năm hành.' }),
    ]),

    tenGodSummary(adv.tenGods, adv.tenGodInfo),

    el('section', { class: 'reading-card column' }, [
      el('h3', { text: 'Hợp, xung, hại & thần sát' }),
      adv.interactions.length
        ? el('ul', { class: 'arrow-list' }, adv.interactions.map((x) => el('li', {}, [
          el('span', { class: `verdict ${x.good ? 'good' : 'bad'}`, text: x.type }), ` ${x.text}`,
        ])))
        : el('p', { class: 'muted', text: 'Không có hợp, xung, hại đáng kể giữa các trụ.' }),
      adv.shenSha.length
        ? el('ul', { class: 'arrow-list' }, adv.shenSha.map((s) => el('li', {}, [
          el('span', { class: 'verdict neutral', text: s.name }), ` Ở trụ ${s.places.join(', ')}. ${s.text}`,
        ])))
        : null,
    ]),

    luckTable(adv.luck, strength.favorable),
    annualList(adv.years, adv.tenGodInfo),

    el('section', { class: 'reading-card column' }, [
      el('h3', { text: 'Bồi đắp hành có lợi' }),
      el('p', { class: 'muted', text: 'Theo phương pháp phù – ức (nâng đỡ khi nhược, tiết chế khi vượng). Các trường phái có thể chọn dụng thần khác nhau.' }),
      el('div', { class: 'purpose-grid' }, strength.favorable.map((name) => elementAdvice(name, elements[name], 'có lợi cho bạn'))),
    ]),
  );
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  try {
    const input = parseBirthDateTime(birthInput.value, timeInput.value);
    const today = new Date();
    if (Date.UTC(input.year, input.month - 1, input.day) > Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) {
      throw new Error('Ngày sinh không được ở tương lai.');
    }
    const report = calculateBazi(input);
    render(report, analyzeAdvanced(input, genderInput.value, report.pillars, today));
  } catch (error) {
    showError(result, error.message);
  }
});
