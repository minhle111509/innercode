/**
 * "Chọn tần số đồng hành": maps a chosen feeling and colour to sound frequencies.
 * The meanings follow popular sound-healing traditions (Solfeggio, 432Hz); this is a
 * reflective experience, not a measurement of the body. Pure logic, no DOM.
 */

export const FREQUENCIES = {
  174: { name: 'Nền tảng an toàn', meaning: 'Theo quan niệm phổ biến, 174Hz giúp thân thể thả lỏng và cảm thấy được che chở.', practice: 'Đặt hai tay lên bụng, thở chậm 10 nhịp và cảm nhận sức nặng cơ thể trên mặt ghế.' },
  285: { name: 'Phục hồi năng lượng', meaning: '285Hz gắn với sự nghỉ ngơi và tái tạo khi bạn đang cạn sức.', practice: 'Cho phép mình nghỉ 15 phút không màn hình, uống một ly nước ấm.' },
  396: { name: 'Buông bỏ sợ hãi', meaning: '396Hz được dùng để làm dịu lo âu và cảm giác bất an.', practice: 'Viết ra điều bạn đang lo, rồi viết một việc nhỏ bạn có thể làm ngay hôm nay.' },
  417: { name: 'Chuyển hóa, bắt đầu lại', meaning: '417Hz gắn với sự thay đổi và gỡ bỏ những khuôn mẫu cũ.', practice: 'Chọn một thói quen nhỏ muốn đổi và bắt đầu nó trong 3 ngày liên tiếp.' },
  432: { name: 'Hài hòa tự nhiên', meaning: '432Hz thường được chọn để thư giãn và cân bằng nhịp sống.', practice: 'Nghe 10 phút với nhịp thở 5 giây vào, 5 giây ra.' },
  528: { name: 'Yêu thương & chữa lành', meaning: '528Hz được gọi là tần số của tình yêu, nâng đỡ trái tim đang tổn thương.', practice: 'Đặt tay lên ngực, nói thầm ba lần: "Mình đang ổn dần lên".' },
  639: { name: 'Kết nối & hòa hợp', meaning: '639Hz gắn với các mối quan hệ, sự thấu hiểu và kết nối.', practice: 'Gửi một tin nhắn hỏi thăm chân thành tới một người bạn thương.' },
  741: { name: 'Thanh lọc & sáng suốt', meaning: '741Hz hỗ trợ đầu óc rõ ràng và diễn đạt điều mình muốn nói.', practice: 'Dọn gọn bàn làm việc, rồi viết ra ba ưu tiên quan trọng nhất.' },
  852: { name: 'Trực giác', meaning: '852Hz gắn với tiếng nói bên trong và sự tĩnh lặng của tâm.', practice: 'Ngồi yên 5 phút, chỉ quan sát những suy nghĩ đi qua mà không giữ lại.' },
  963: { name: 'Kết nối tâm linh', meaning: '963Hz được dùng trong thiền sâu, cảm giác hòa vào cái lớn hơn mình.', practice: 'Thiền im lặng 10 phút, tập trung vào khoảng lặng giữa hai hơi thở.' },
};

export const EMOTIONS = [
  { key: 'anxious', label: 'Lo âu, bất an', hz: 396 },
  { key: 'stressed', label: 'Căng thẳng, quá tải', hz: 432 },
  { key: 'hurt', label: 'Buồn, tổn thương', hz: 528 },
  { key: 'tired', label: 'Mệt mỏi, cạn năng lượng', hz: 285 },
  { key: 'lonely', label: 'Cô đơn, xa cách', hz: 639 },
  { key: 'confused', label: 'Rối trí, mất phương hướng', hz: 741 },
  { key: 'change', label: 'Muốn thay đổi, làm lại', hz: 417 },
  { key: 'calm', label: 'Bình an, muốn đi sâu hơn', hz: 852 },
];

export const COLORS = [
  { key: 'red', label: 'Đỏ', hex: '#c8463d', chakra: 'Luân xa gốc', hz: 396 },
  { key: 'orange', label: 'Cam', hex: '#d9843b', chakra: 'Luân xa xương cùng', hz: 417 },
  { key: 'yellow', label: 'Vàng', hex: '#d9b84a', chakra: 'Luân xa rốn', hz: 528 },
  { key: 'green', label: 'Xanh lá', hex: '#5f9e6e', chakra: 'Luân xa tim', hz: 639 },
  { key: 'blue', label: 'Xanh dương', hex: '#4f86c2', chakra: 'Luân xa cổ họng', hz: 741 },
  { key: 'indigo', label: 'Chàm', hex: '#4f4fa3', chakra: 'Con mắt thứ ba', hz: 852 },
  { key: 'violet', label: 'Tím', hex: '#8a5bb5', chakra: 'Luân xa đỉnh đầu', hz: 963 },
  { key: 'white', label: 'Trắng', hex: '#e9e4d8', chakra: 'Toàn thân', hz: 432 },
];

export const HOLD_MS = 3000;

/** Products that pair well with each frequency (keys of PRODUCTS in shop/catalog.js). */
function productsFor(hz) {
  const list = ['singing_bowl'];
  if (hz >= 741) list.push('pendulum');
  list.push('bracelet');
  return list;
}

export function chooseFrequency(emotionKey, colorKey) {
  const emotion = EMOTIONS.find((e) => e.key === emotionKey);
  const color = COLORS.find((c) => c.key === colorKey);
  if (!emotion) throw new Error('Hãy chọn cảm xúc của bạn lúc này.');
  if (!color) throw new Error('Hãy chọn màu sắc bạn thấy cuốn hút.');
  const primary = emotion.hz;
  // The colour adds a companion tone; if it repeats the primary, fall back to the 432Hz base.
  const companion = color.hz === primary ? (primary === 432 ? 528 : 432) : color.hz;
  return {
    emotion,
    color,
    primary: { hz: primary, ...FREQUENCIES[primary] },
    companion: { hz: companion, ...FREQUENCIES[companion] },
    products: productsFor(primary),
  };
}

/** Partials of a struck singing bowl: inharmonic ratios with faster decay on higher partials. */
export function bowlPartials(hz) {
  return [
    { ratio: 1, gain: 1, decay: 9 },
    { ratio: 2.76, gain: 0.45, decay: 6 },
    { ratio: 5.4, gain: 0.22, decay: 4 },
    { ratio: 8.93, gain: 0.1, decay: 2.5 },
  ].map((p) => ({ freq: Math.round(hz * p.ratio * 100) / 100, gain: p.gain, decay: p.decay }));
}
