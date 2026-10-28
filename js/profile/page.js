import { el, setChildren, showError } from '../shared/dom.js';
import { formatDate } from '../shared/date.js';
import { buildProfile } from './profile.js';
import { NUMBER_MEANINGS } from '../numerology/meanings.js';
import { ARCANA } from '../matrix/meanings.js';

const form = document.getElementById('profile-form');
const result = document.getElementById('profile-result');
const birthInput = document.getElementById('birth-date');

birthInput.max = new Date().toISOString().slice(0, 10);

function coreTile(label, value, caption, href) {
  return el('a', { class: 'core-tile', href }, [
    el('span', { class: 'core-label', text: label }),
    el('span', { class: 'core-value', text: value }),
    el('span', { class: 'core-caption', text: caption }),
  ]);
}

function render(p, fullName) {
  const { numerology, matrix, bazi, themes, rows, summary, practices } = p;
  const maxScore = themes[0].score;

  setChildren(result,
    el('h2', { text: fullName ? `Hồ sơ nội tâm của ${fullName}` : 'Hồ sơ nội tâm của bạn' }),
    el('p', { class: 'muted', text: `Ngày sinh ${formatDate(numerology.date)}${p.input.hour === null ? '' : `, ${String(p.input.hour).padStart(2, '0')}:${String(p.input.minute).padStart(2, '0')}`}` }),

    el('div', { class: 'core-strip' }, [
      coreTile('Số chủ đạo', numerology.lifePath, NUMBER_MEANINGS[numerology.lifePath].title, 'numerology.html'),
      coreTile('Matrix trung tâm', matrix.points.E, ARCANA[matrix.points.E].name, 'matrix.html'),
      coreTile('Nhật chủ', bazi.dayMaster.name, `${bazi.dayMaster.element} · ${bazi.dayMaster.image}`, 'bazi.html'),
      coreTile('Mệnh', bazi.napAm.element, bazi.napAm.name, 'bazi.html'),
      coreTile('Tuổi', bazi.zodiac.branch.name, `${bazi.zodiac.name} · ${bazi.zodiac.animal}`, 'bazi.html'),
    ]),

    el('article', { class: 'reading-card column highlight' }, [
      el('h3', { text: 'Thông điệp tổng hợp' }),
      el('p', { text: summary }),
    ]),

    el('section', { class: 'reading-card column' }, [
      el('h3', { text: 'Điểm hội tụ giữa các hệ thống' }),
      el('p', { class: 'muted', text: 'Chủ đề càng được nhiều hệ thống cùng nhắc đến, điểm càng cao.' }),
      el('div', { class: 'theme-list' }, themes.slice(0, 4).map((t, i) => el('div', { class: 'theme' }, [
        el('div', { class: 'bar-row' }, [
          el('span', { class: 'bar-label', text: t.name }),
          el('span', { class: 'bar-track' }, el('span', { class: `bar-fill${i === 0 ? ' main' : ''}`, style: `width:${(t.score / maxScore) * 100}%` })),
          el('span', { class: 'bar-value', text: t.score }),
        ]),
        el('p', { class: 'chips' }, t.sources.map((s) => el('span', { class: 'chip', text: s }))),
      ]))),
    ]),

    el('section', { class: 'compare' }, [
      el('h3', { text: 'Đối chiếu ba trường phái' }),
      el('div', { class: 'compare-head', 'aria-hidden': 'true' }, [
        el('span'), el('span', { text: 'Thần số học' }), el('span', { text: 'Matrix Destiny' }), el('span', { text: 'Bát Tự' }),
      ]),
      ...rows.map((row) => el('div', { class: 'compare-row' }, [
        el('h4', { text: row.topic }),
        el('p', {}, [el('span', { class: 'compare-src', text: 'Thần số học' }), row.numerology]),
        el('p', {}, [el('span', { class: 'compare-src', text: 'Matrix Destiny' }), row.matrix]),
        el('p', {}, [el('span', { class: 'compare-src', text: 'Bát Tự' }), row.bazi]),
      ])),
    ]),

    el('section', { class: 'reading-card column' }, [
      el('h3', { text: 'Thực hành cho bạn' }),
      el('p', { class: 'muted', text: 'Gợi ý từ những chủ đề nổi bật và hành cần bồi đắp. Xem thêm bài thở, nhật ký ở trang Khám phá bản thân.' }),
      el('div', { class: 'purpose-grid' }, practices.map((x) => el('div', { class: 'purpose' }, [
        el('strong', { text: x.title }),
        el('span', { text: x.practice }),
        el('span', { class: 'muted', text: x.meditation }),
      ]))),
      el('a', { class: 'btn secondary', href: 'self.html', text: 'Mở trang Khám phá bản thân' }),
    ]),
  );
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const fullName = form.elements.fullName.value.trim();
  try {
    render(buildProfile({
      fullName,
      birthDate: birthInput.value,
      birthTime: form.elements.birthTime.value,
    }), fullName);
  } catch (error) {
    showError(result, error.message);
  }
});
