/**
 * Hồ sơ nội tâm: rule-based cross-reading of Numerology, Matrix Destiny and Bát Tự.
 * Each system's key outputs are mapped onto shared life themes; themes named by
 * several systems rank higher. Pure logic, no DOM.
 */

import { calculateReport } from '../numerology/numerology.js';
import { NUMBER_MEANINGS, NUMBER_DETAILS, PERSONAL_YEAR_MEANINGS } from '../numerology/meanings.js';
import { calculateMatrix } from '../matrix/matrix.js';
import { ARCANA, ARCANA_DETAILS } from '../matrix/meanings.js';
import { calculateBazi, parseBirthDateTime, yearPillarOf } from '../bazi/bazi.js';

export const THEMES = {
  lead: { name: 'Lãnh đạo & tự chủ', practice: 'Mỗi sáng viết ra một quyết định bạn sẽ tự chịu trách nhiệm hôm nay.', meditation: 'Thiền đứng vững như núi 5 phút, cảm nhận trọng tâm cơ thể.' },
  care: { name: 'Yêu thương & phụng sự', practice: 'Mỗi tối ghi lại một việc tử tế bạn đã làm cho chính mình, không chỉ cho người khác.', meditation: 'Thiền từ bi (metta): gửi lời chúc bình an đến bản thân trước, rồi đến người thân.' },
  create: { name: 'Sáng tạo & thể hiện', practice: 'Dành 20 phút mỗi ngày tạo ra một thứ gì đó: viết, vẽ, quay video, nấu ăn.', meditation: 'Thiền âm thanh: lắng nghe mọi âm thanh xung quanh trong 5 phút mà không đánh giá.' },
  wisdom: { name: 'Trí tuệ & chiêm nghiệm', practice: 'Đọc chậm 10 trang sách mỗi ngày và ghi lại một ý bạn muốn áp dụng.', meditation: 'Thiền quan sát hơi thở, đếm từ 1 đến 10 rồi bắt đầu lại.' },
  build: { name: 'Xây dựng & ổn định', practice: 'Chọn một thói quen nền tảng (ngủ, tập, tiết kiệm) và đánh dấu mỗi ngày làm được.', meditation: 'Thiền quét cơ thể từ chân lên đầu trước khi ngủ.' },
  freedom: { name: 'Tự do & thay đổi', practice: 'Mỗi tuần thử một trải nghiệm mới nhỏ, rồi viết ba dòng về điều học được.', meditation: 'Thiền đi bộ: bước chậm, cảm nhận từng bước chân chạm đất.' },
  spirit: { name: 'Trực giác & tâm linh', practice: 'Ghi lại giấc mơ hoặc linh cảm ngay khi thức dậy.', meditation: 'Ngồi yên 10 phút trong im lặng, chỉ quan sát những gì khởi lên trong tâm.' },
  wealth: { name: 'Vật chất & tài chính', practice: 'Ghi chép thu chi hằng ngày và đặt một mục tiêu tiết kiệm cụ thể.', meditation: 'Thiền biết ơn: liệt kê trong đầu năm điều bạn đang có.' },
};

const NUMBER_THEMES = {
  1: ['lead'], 2: ['care', 'spirit'], 3: ['create'], 4: ['build'], 5: ['freedom'], 6: ['care'],
  7: ['wisdom', 'spirit'], 8: ['lead', 'wealth'], 9: ['care', 'wisdom'], 10: ['freedom', 'lead'],
  11: ['spirit', 'create'], 22: ['build', 'lead'], 33: ['care', 'spirit'],
};

const ARCANA_THEMES = {
  1: ['create', 'lead'], 2: ['wisdom', 'spirit'], 3: ['care', 'create'], 4: ['lead', 'build'], 5: ['wisdom', 'build'],
  6: ['care'], 7: ['lead', 'freedom'], 8: ['build'], 9: ['wisdom'], 10: ['freedom'], 11: ['lead'],
  12: ['spirit', 'care'], 13: ['freedom', 'spirit'], 14: ['care', 'spirit'], 15: ['wealth'], 16: ['freedom', 'build'],
  17: ['create'], 18: ['spirit', 'create'], 19: ['lead', 'create'], 20: ['care'], 21: ['freedom', 'wisdom'], 22: ['freedom', 'create'],
};

const ELEMENT_THEMES = {
  Mộc: ['wisdom', 'care'], Hỏa: ['create', 'lead'], Thổ: ['build', 'care'], Kim: ['wealth', 'lead'], Thủy: ['wisdom', 'freedom'],
};

const GENERATES = { Mộc: 'Hỏa', Hỏa: 'Thổ', Thổ: 'Kim', Kim: 'Thủy', Thủy: 'Mộc' };
const CONTROLS = { Mộc: 'Thổ', Thổ: 'Thủy', Thủy: 'Hỏa', Hỏa: 'Kim', Kim: 'Mộc' };

/** How the current year's stem element acts on the Day Master (Thập Thần, grouped). */
export function yearInfluence(dayElement, yearElement) {
  if (yearElement === dayElement) return { name: 'Tỷ Kiếp', text: 'Năm của bạn bè, đồng đội và cạnh tranh: hợp tác thì mạnh, tranh giành thì hao.' };
  if (GENERATES[yearElement] === dayElement) return { name: 'Ấn Tinh', text: 'Năm được nâng đỡ: thuận cho học tập, bằng cấp, có quý nhân hỗ trợ.' };
  if (GENERATES[dayElement] === yearElement) return { name: 'Thực Thương', text: 'Năm thể hiện bản thân: sáng tạo, nói ra, làm sản phẩm; cẩn thận hao sức và lời nói.' };
  if (CONTROLS[dayElement] === yearElement) return { name: 'Tài Tinh', text: 'Năm của tiền bạc và cơ hội: phải chủ động nắm bắt và quản lý tốt.' };
  return { name: 'Quan Sát', text: 'Năm của áp lực và trách nhiệm: dễ được giao việc lớn, thăng tiến nếu giữ kỷ luật.' };
}

/** Score themes from weighted sources; returns themes ranked with the sources that named them. */
export function rankThemes(sources) {
  const tally = new Map();
  for (const { label, themes, weight } of sources) {
    for (const key of themes) {
      const entry = tally.get(key) ?? { key, score: 0, sources: [] };
      entry.score += weight;
      entry.sources.push(label);
      tally.set(key, entry);
    }
  }
  return [...tally.values()]
    .sort((a, b) => b.score - a.score || b.sources.length - a.sources.length || a.key.localeCompare(b.key))
    .map((entry) => ({ ...entry, ...THEMES[entry.key] }));
}

export function buildProfile({ fullName = '', birthDate, birthTime = '', today = new Date() }) {
  const input = parseBirthDateTime(birthDate, birthTime);
  const numerology = calculateReport({ fullName, birthDate, today });
  const matrix = calculateMatrix(numerology.date);
  const bazi = calculateBazi(input);
  const dm = bazi.dayMaster;
  const { points } = matrix;

  const sources = [
    { label: `Số chủ đạo ${numerology.lifePath}`, themes: NUMBER_THEMES[numerology.lifePath], weight: 2 },
    { label: `Số ngày sinh ${numerology.birthDay}`, themes: NUMBER_THEMES[numerology.birthDay], weight: 1 },
    { label: `Matrix trung tâm ${points.E}`, themes: ARCANA_THEMES[points.E], weight: 2 },
    { label: `Matrix tài năng ${points.B}`, themes: ARCANA_THEMES[points.B], weight: 1 },
    { label: `Matrix chân dung ${points.A}`, themes: ARCANA_THEMES[points.A], weight: 1 },
    { label: `Nhật chủ ${dm.name} ${dm.element}`, themes: ELEMENT_THEMES[dm.element], weight: 2 },
  ];
  if (numerology.name) {
    sources.push({ label: `Số sứ mệnh ${numerology.name.expression}`, themes: NUMBER_THEMES[numerology.name.expression], weight: 1 });
  }
  const themes = rankThemes(sources);

  const lp = NUMBER_MEANINGS[numerology.lifePath];
  const core = ARCANA[points.E];
  const currentYearPillar = yearPillarOf(today.getFullYear());
  const influence = yearInfluence(dm.element, currentYearPillar.stem.element);

  const rows = [
    {
      topic: 'Bản chất cốt lõi',
      numerology: `${lp.title}: ${lp.keywords}`,
      matrix: `${core.name}: ${core.keywords}`,
      bazi: `${dm.name} ${dm.element} (${dm.image})`,
    },
    {
      topic: 'Tài năng',
      numerology: `Số ngày sinh ${numerology.birthDay}: ${NUMBER_MEANINGS[numerology.birthDay].strengths}`,
      matrix: `${ARCANA[points.B].name}: ${ARCANA[points.B].plus}`,
      bazi: `Hành vượng ${bazi.balance.strongest.join(', ')}: ${bazi.balance.strongest.map((e) => bazi.elements[e].nature).join('; ')}`,
    },
    {
      topic: 'Bài học cần vượt qua',
      numerology: lp.challenges,
      matrix: `Đuôi nghiệp ${points.D}·${points.D2}·${points.D1} – ${ARCANA[points.D].name}: ${ARCANA[points.D].minus}`,
      bazi: bazi.balance.missing.length
        ? `Thiếu hành ${bazi.balance.missing.join(', ')}`
        : bazi.balance.strongest.map((e) => bazi.elements[e].excess).join(' '),
    },
    {
      topic: 'Sự nghiệp',
      numerology: NUMBER_DETAILS[numerology.lifePath].career,
      matrix: ARCANA_DETAILS[points.money].career,
      bazi: bazi.strength.favorable.map((e) => `${e}: ${bazi.elements[e].careers}`).join(' | '),
    },
    {
      topic: 'Tình yêu',
      numerology: NUMBER_DETAILS[numerology.lifePath].love,
      matrix: `${ARCANA[points.love].name}: ${ARCANA[points.love].plus}`,
      bazi: `Nhật chủ ${dm.element}: ${dm.text.split('. ')[0]}.`,
    },
    {
      topic: `Năm ${today.getFullYear()}`,
      numerology: `Năm cá nhân ${numerology.personalYear}: ${PERSONAL_YEAR_MEANINGS[numerology.personalYear]}`,
      matrix: ARCANA_DETAILS[points.E].advice,
      bazi: `Năm ${currentYearPillar.name} là ${influence.name} với nhật chủ: ${influence.text}`,
    },
  ];

  const [first, second] = themes;
  const summary = `Thần số học cho bạn con đường của ${lp.title.toLowerCase()}, trung tâm ma trận là năng lượng ${core.name}, `
    + `còn Bát Tự cho thấy nhật chủ ${dm.name} ${dm.element} như ${dm.image.toLowerCase()}. `
    + `Các hệ thống cùng nhấn mạnh chủ đề ${first.name.toLowerCase()}${second ? ` và ${second.name.toLowerCase()}` : ''}: `
    + 'đây là nơi bạn mạnh nhất và cũng là nơi cuộc sống sẽ liên tục mời bạn trưởng thành.';

  const weakest = bazi.balance.missing[0] ?? Object.entries(bazi.balance.counts).sort((a, b) => a[1] - b[1])[0][0];
  const practices = [
    ...themes.slice(0, 2).map((t) => ({ title: t.name, practice: t.practice, meditation: t.meditation })),
    { title: `Bồi đắp hành ${weakest}`, practice: bazi.elements[weakest].boost, meditation: `Màu hỗ trợ: ${bazi.elements[weakest].color}.` },
  ];

  return { input, numerology, matrix, bazi, themes, rows, summary, practices, influence, currentYearPillar };
}
