import { el, setChildren, showError } from '../shared/dom.js';
import { calculateBazi, parseBirthDateTime, ELEMENT_ORDER } from './bazi.js';

const form = document.getElementById('bazi-form');
const result = document.getElementById('bazi-result');
const birthInput = document.getElementById('birth-date');
const timeInput = document.getElementById('birth-time');

birthInput.max = new Date().toISOString().slice(0, 10);

const elementTag = (element) => el('span', { class: `el-tag el-${ELEMENT_ORDER.indexOf(element)}`, text: element });

function pillarColumn(label, p) {
  if (!p) {
    return el('div', { class: 'pillar unknown' }, [
      el('p', { class: 'position', text: label }),
      el('p', { class: 'pillar-char muted', text: '—' }),
      el('p', { class: 'muted', text: 'Chưa có giờ sinh' }),
    ]);
  }
  return el('div', { class: 'pillar' }, [
    el('p', { class: 'position', text: label }),
    el('p', { class: 'pillar-char', text: p.stem.name }),
    el('p', {}, [elementTag(p.stem.element), ` ${p.stem.yang ? 'Dương' : 'Âm'}`]),
    el('p', { class: 'pillar-char', text: p.branch.name }),
    el('p', {}, [elementTag(p.branch.element), ` ${p.branch.animal}`]),
  ]);
}

function balanceBars(balance) {
  const max = Math.max(...Object.values(balance.counts), 1);
  return el('div', { class: 'bars' }, ELEMENT_ORDER.map((element, i) => {
    const count = balance.counts[element];
    return el('div', { class: 'bar-row' }, [
      el('span', { class: 'bar-label', text: element }),
      el('span', { class: 'bar-track' }, el('span', {
        class: `bar-fill el-bg-${i}`,
        style: `width:${(count / max) * 100}%`,
      })),
      el('span', { class: 'bar-value', text: `${count}/${balance.total}` }),
    ]);
  }));
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

function render(report) {
  const { input, lunar, pillars, zodiac, napAm, balance, strength, dayMaster, elements } = report;
  const pad = (n) => String(n).padStart(2, '0');
  const timeText = input.hour === null ? 'không rõ giờ' : `${pad(input.hour)}:${pad(input.minute)}`;

  setChildren(result,
    el('h2', { text: 'Lá số Bát Tự của bạn' }),
    el('p', { class: 'muted', text: `Dương lịch ${pad(input.day)}/${pad(input.month)}/${input.year}, ${timeText} · Âm lịch ${lunar.day}/${lunar.month}${lunar.leap ? ' (nhuận)' : ''}/${lunar.year}` }),
    el('section', { class: 'pillars', 'aria-label': 'Tứ trụ' }, [
      pillarColumn('Trụ năm', pillars.year),
      pillarColumn('Trụ tháng', pillars.month),
      pillarColumn('Trụ ngày', pillars.day),
      pillarColumn('Trụ giờ', pillars.hour),
    ]),
    el('article', { class: 'reading-card highlight' }, [
      el('div', { class: 'number-badge small', text: dayMaster.name }),
      el('div', {}, [
        el('h3', { text: `Nhật chủ ${dayMaster.name} ${dayMaster.element}: ${dayMaster.image}` }),
        el('p', { class: 'muted', text: 'Thiên can của trụ ngày, đại diện cho bản thân bạn.' }),
        el('p', { text: dayMaster.text }),
        el('p', {}, [
          el('strong', { text: strength.strong ? 'Thân vượng. ' : 'Thân nhược. ' }),
          `Hành ${strength.element} và hành sinh ra nó chiếm ${strength.support}/${strength.total} chữ. `,
          strength.strong
            ? 'Năng lượng bản thân dồi dào, nên tiết chế và hướng ra hành động, tạo giá trị.'
            : 'Năng lượng bản thân cần được bồi đắp, nên tìm môi trường và người hỗ trợ.',
        ]),
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
      el('h3', { text: 'Cân bằng Ngũ Hành' }),
      el('p', { class: 'muted', text: `Đếm hành của ${balance.total} chữ can chi trong lá số.` }),
      balanceBars(balance),
      balance.strongest.length >= 3
        ? el('p', {}, [el('strong', { text: 'Phân bố khá đều: ' }), `${balance.strongest.join(', ')} ngang nhau, không hành nào lấn át.`])
        : el('p', {}, [
          el('strong', { text: 'Vượng nhất: ' }), balance.strongest.join(', '), '. ',
          balance.strongest.map((e) => elements[e].excess).join(' '),
        ]),
      balance.missing.length
        ? el('p', {}, [el('strong', { text: 'Còn thiếu: ' }), `${balance.missing.join(', ')}. Có thể bổ sung qua màu sắc, môi trường và thói quen bên dưới.`])
        : el('p', { text: 'Lá số có đủ cả năm hành.' }),
    ]),
    el('section', { class: 'reading-card column' }, [
      el('h3', { text: 'Hành nên bồi đắp' }),
      el('p', { class: 'muted', text: 'Gợi ý theo cách tính giản lược (thân vượng/nhược), dùng để tham khảo.' }),
      el('div', { class: 'purpose-grid' }, [
        ...strength.favorable.map((name) => elementAdvice(name, elements[name], 'hỗ trợ bạn')),
        ...balance.missing.filter((m) => !strength.favorable.includes(m)).map((name) => elementAdvice(name, elements[name], 'đang thiếu')),
      ]),
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
    render(calculateBazi(input));
  } catch (error) {
    showError(result, error.message);
  }
});
