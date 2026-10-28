/** Wheel of life, breathing patterns and journaling prompts – pure data and helpers. */

export const LIFE_AREAS = [
  { key: 'health', name: 'Sức khỏe', tip: 'Chọn một thói quen nhỏ: ngủ trước 23h hoặc đi bộ 20 phút mỗi ngày.' },
  { key: 'career', name: 'Sự nghiệp', tip: 'Viết ra một kỹ năng bạn muốn giỏi lên trong 90 ngày tới và bước đầu tiên.' },
  { key: 'money', name: 'Tài chính', tip: 'Ghi lại chi tiêu trong 2 tuần để thấy dòng tiền thật sự đi đâu.' },
  { key: 'family', name: 'Gia đình', tip: 'Dành một bữa ăn hoặc cuộc gọi không điện thoại mỗi tuần cho gia đình.' },
  { key: 'love', name: 'Tình yêu', tip: 'Hỏi người thương một câu thật lòng: điều gì làm họ thấy được yêu nhất?' },
  { key: 'friends', name: 'Bạn bè', tip: 'Chủ động nhắn cho một người bạn lâu không gặp.' },
  { key: 'growth', name: 'Phát triển bản thân', tip: 'Đọc 10 trang sách hoặc học 15 phút mỗi ngày.' },
  { key: 'joy', name: 'Niềm vui', tip: 'Lên lịch một việc bạn làm chỉ vì thích, không vì mục đích.' },
];

export function summarizeWheel(scores) {
  const values = LIFE_AREAS.map((area) => {
    const value = Number(scores[area.key]);
    if (!Number.isFinite(value) || value < 1 || value > 10) throw new RangeError(`Invalid score for ${area.key}`);
    return { ...area, value };
  });
  const average = values.reduce((sum, a) => sum + a.value, 0) / values.length;
  const sorted = [...values].sort((a, b) => a.value - b.value);
  return {
    average: Math.round(average * 10) / 10,
    lowest: sorted.slice(0, 2),
    highest: sorted[sorted.length - 1],
    spread: sorted[sorted.length - 1].value - sorted[0].value,
  };
}

export const BREATHING_PATTERNS = {
  box: { name: 'Thở hộp 4-4-4-4', purpose: 'Bình tĩnh, tập trung trước việc quan trọng.', steps: [4, 4, 4, 4] },
  relax: { name: 'Thở 4-7-8', purpose: 'Thư giãn sâu, dễ ngủ hơn.', steps: [4, 7, 8, 0] },
  balance: { name: 'Thở cân bằng 5-5', purpose: 'Ổn định nhịp tim, cân bằng cảm xúc.', steps: [5, 0, 5, 0] },
};

const PHASE_LABELS = ['Hít vào', 'Giữ hơi', 'Thở ra', 'Nghỉ'];

/** Expand a [in, hold, out, hold] pattern into phases, dropping zero-length ones. */
export function breathingPhases(steps) {
  return steps
    .map((seconds, i) => ({ label: PHASE_LABELS[i], seconds, kind: ['in', 'hold', 'out', 'rest'][i] }))
    .filter((phase) => phase.seconds > 0);
}

export function cyclesFor(steps, minutes) {
  const cycle = steps.reduce((a, b) => a + b, 0);
  return Math.max(1, Math.round((minutes * 60) / cycle));
}

export const JOURNAL_PROMPTS = {
  awareness: {
    name: 'Tự nhận thức',
    prompts: [
      'Hôm nay điều gì làm bạn mất năng lượng nhất, và vì sao?',
      'Bạn đang tránh né cảm xúc nào? Nếu cho phép nó lên tiếng, nó sẽ nói gì?',
      'Ba giá trị bạn không bao giờ muốn đánh đổi là gì?',
      'Khi nào gần đây bạn cảm thấy là chính mình nhất?',
      'Niềm tin nào về bản thân đang giới hạn bạn?',
    ],
  },
  gratitude: {
    name: 'Biết ơn',
    prompts: [
      'Ba điều nhỏ hôm nay bạn biết ơn là gì?',
      'Ai đã giúp bạn trở thành con người hôm nay? Bạn muốn nói gì với họ?',
      'Một khó khăn trong quá khứ đã dạy bạn điều gì quý giá?',
      'Điều gì trong cơ thể bạn đang làm tốt mà bạn ít để ý?',
      'Khoảnh khắc nào tuần này khiến bạn mỉm cười?',
    ],
  },
  goals: {
    name: 'Mục tiêu',
    prompts: [
      'Một năm nữa, bạn muốn cuộc sống của mình khác bây giờ ở điểm nào?',
      'Việc nhỏ nhất bạn có thể làm ngày mai để tiến gần mục tiêu là gì?',
      'Điều gì bạn cần nói "không" để có thời gian cho điều quan trọng?',
      'Nếu biết chắc mình không thất bại, bạn sẽ thử điều gì?',
      'Thành công với bạn trông như thế nào, theo định nghĩa của riêng bạn?',
    ],
  },
  healing: {
    name: 'Chữa lành',
    prompts: [
      'Hãy viết một lá thư ngắn cho chính bạn năm 10 tuổi.',
      'Điều gì bạn cần tha thứ cho bản thân?',
      'Nếu người bạn thân nhất đang ở hoàn cảnh của bạn, bạn sẽ khuyên họ điều gì?',
      'Ranh giới nào bạn cần đặt ra để bảo vệ năng lượng của mình?',
      'Điều gì giúp bạn cảm thấy an toàn khi mọi thứ bất ổn?',
    ],
  },
};
