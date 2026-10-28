/** Heavenly stems, earthly branches, Nạp Âm and five-element reference data (Vietnamese). */

export const STEMS = [
  { name: 'Giáp', element: 'Mộc', yang: true },
  { name: 'Ất', element: 'Mộc', yang: false },
  { name: 'Bính', element: 'Hỏa', yang: true },
  { name: 'Đinh', element: 'Hỏa', yang: false },
  { name: 'Mậu', element: 'Thổ', yang: true },
  { name: 'Kỷ', element: 'Thổ', yang: false },
  { name: 'Canh', element: 'Kim', yang: true },
  { name: 'Tân', element: 'Kim', yang: false },
  { name: 'Nhâm', element: 'Thủy', yang: true },
  { name: 'Quý', element: 'Thủy', yang: false },
];

export const BRANCHES = [
  { name: 'Tý', element: 'Thủy', animal: 'Chuột' },
  { name: 'Sửu', element: 'Thổ', animal: 'Trâu' },
  { name: 'Dần', element: 'Mộc', animal: 'Hổ' },
  { name: 'Mão', element: 'Mộc', animal: 'Mèo' },
  { name: 'Thìn', element: 'Thổ', animal: 'Rồng' },
  { name: 'Tỵ', element: 'Hỏa', animal: 'Rắn' },
  { name: 'Ngọ', element: 'Hỏa', animal: 'Ngựa' },
  { name: 'Mùi', element: 'Thổ', animal: 'Dê' },
  { name: 'Thân', element: 'Kim', animal: 'Khỉ' },
  { name: 'Dậu', element: 'Kim', animal: 'Gà' },
  { name: 'Tuất', element: 'Thổ', animal: 'Chó' },
  { name: 'Hợi', element: 'Thủy', animal: 'Lợn' },
];

/** One entry per pair of the 60-cycle (Giáp Tý & Ất Sửu share index 0, …). */
export const NAP_AM = [
  ['Hải Trung Kim', 'Vàng trong biển'], ['Lư Trung Hỏa', 'Lửa trong lò'], ['Đại Lâm Mộc', 'Gỗ rừng già'],
  ['Lộ Bàng Thổ', 'Đất ven đường'], ['Kiếm Phong Kim', 'Vàng mũi kiếm'], ['Sơn Đầu Hỏa', 'Lửa trên núi'],
  ['Giản Hạ Thủy', 'Nước khe suối'], ['Thành Đầu Thổ', 'Đất trên thành'], ['Bạch Lạp Kim', 'Vàng chân đèn'],
  ['Dương Liễu Mộc', 'Gỗ cây dương liễu'], ['Tuyền Trung Thủy', 'Nước giữa dòng suối'], ['Ốc Thượng Thổ', 'Đất trên mái nhà'],
  ['Tích Lịch Hỏa', 'Lửa sấm sét'], ['Tùng Bách Mộc', 'Gỗ tùng bách'], ['Trường Lưu Thủy', 'Nước chảy dài'],
  ['Sa Trung Kim', 'Vàng trong cát'], ['Sơn Hạ Hỏa', 'Lửa dưới chân núi'], ['Bình Địa Mộc', 'Gỗ đồng bằng'],
  ['Bích Thượng Thổ', 'Đất trên vách'], ['Kim Bạch Kim', 'Vàng pha bạch kim'], ['Phú Đăng Hỏa', 'Lửa ngọn đèn'],
  ['Thiên Hà Thủy', 'Nước trên trời'], ['Đại Trạch Thổ', 'Đất nền nhà lớn'], ['Thoa Xuyến Kim', 'Vàng trang sức'],
  ['Tang Đố Mộc', 'Gỗ cây dâu'], ['Đại Khê Thủy', 'Nước khe lớn'], ['Sa Trung Thổ', 'Đất pha cát'],
  ['Thiên Thượng Hỏa', 'Lửa trên trời'], ['Thạch Lựu Mộc', 'Gỗ cây lựu'], ['Đại Hải Thủy', 'Nước biển lớn'],
];

export const ELEMENTS = {
  Mộc: {
    nature: 'Sinh trưởng, vươn lên, nhân ái',
    color: 'Xanh lá, xanh ngọc',
    direction: 'Đông',
    season: 'Mùa xuân',
    organ: 'Gan, mật',
    careers: 'Giáo dục, xuất bản, thiết kế, nông nghiệp, y dược thảo mộc, phát triển con người',
    boost: 'Đi bộ trong thiên nhiên, trồng cây, đọc sách, học một kỹ năng mới.',
    excess: 'Dễ cố chấp, nóng vội mở rộng; cần học cách cắt tỉa và tập trung.',
  },
  Hỏa: {
    nature: 'Nhiệt huyết, lan tỏa, lễ nghĩa',
    color: 'Đỏ, cam, hồng, tím',
    direction: 'Nam',
    season: 'Mùa hạ',
    organ: 'Tim, ruột non',
    careers: 'Truyền thông, nghệ thuật biểu diễn, marketing, ẩm thực, năng lượng, công nghệ',
    boost: 'Vận động mạnh, phơi nắng sớm, gặp gỡ bạn bè, thể hiện bản thân.',
    excess: 'Dễ nóng nảy, kiệt sức vì cháy hết mình; cần nghỉ ngơi và làm mát cảm xúc.',
  },
  Thổ: {
    nature: 'Ổn định, bao dung, chữ tín',
    color: 'Vàng, nâu, be',
    direction: 'Trung tâm, Đông Bắc, Tây Nam',
    season: 'Giao mùa',
    organ: 'Dạ dày, lá lách',
    careers: 'Bất động sản, xây dựng, quản trị, tư vấn, nhân sự, nông sản',
    boost: 'Ăn uống điều độ, sắp xếp nhà cửa, làm vườn, giữ nề nếp sinh hoạt.',
    excess: 'Dễ trì trệ, lo nghĩ nhiều; cần thêm vận động và thay đổi.',
  },
  Kim: {
    nature: 'Quyết đoán, nguyên tắc, chính nghĩa',
    color: 'Trắng, bạc, ánh kim',
    direction: 'Tây',
    season: 'Mùa thu',
    organ: 'Phổi, ruột già',
    careers: 'Tài chính, ngân hàng, luật, kỹ thuật, cơ khí, quản lý chất lượng',
    boost: 'Hít thở sâu, dọn dẹp tối giản, đặt nguyên tắc rõ ràng, tập trung chuyên môn.',
    excess: 'Dễ cứng nhắc, khắt khe; cần mềm mỏng và cởi mở hơn.',
  },
  Thủy: {
    nature: 'Linh hoạt, trí tuệ, thấu hiểu',
    color: 'Đen, xanh dương, xanh navy',
    direction: 'Bắc',
    season: 'Mùa đông',
    organ: 'Thận, bàng quang',
    careers: 'Nghiên cứu, du lịch, logistics, tâm lý, thương mại, công nghệ thông tin',
    boost: 'Uống đủ nước, ngủ sâu, thiền, bơi lội, dành thời gian lắng nghe.',
    excess: 'Dễ thiếu định hướng, lo âu; cần mục tiêu rõ và nền nếp.',
  },
};

/** Personality of the Day Master (Nhật chủ), keyed by stem name. */
export const DAY_MASTERS = {
  Giáp: { image: 'Cây đại thụ', text: 'Ngay thẳng, có chí hướng, thích dẫn dắt và che chở người khác. Cần học cách linh hoạt, tránh cứng đầu.' },
  Ất: { image: 'Hoa cỏ, dây leo', text: 'Mềm mỏng, khéo léo, thích nghi tốt và giỏi kết nối. Cần tự tin hơn, bớt phụ thuộc vào người khác.' },
  Bính: { image: 'Mặt trời', text: 'Rộng lượng, nhiệt tình, lạc quan và tỏa sáng giữa đám đông. Cần kiên nhẫn và giữ năng lượng bền bỉ.' },
  Đinh: { image: 'Ngọn nến', text: 'Ấm áp, tinh tế, sâu sắc, soi sáng cho người gần mình. Cần bảo vệ năng lượng, tránh suy nghĩ quá nhiều.' },
  Mậu: { image: 'Núi lớn', text: 'Vững vàng, đáng tin, bao dung và giữ chữ tín. Cần cởi mở với thay đổi, tránh bảo thủ.' },
  Kỷ: { image: 'Đất ruộng', text: 'Chu đáo, thực tế, giỏi nuôi dưỡng và chăm sóc. Cần đặt ranh giới, tránh ôm việc của người khác.' },
  Canh: { image: 'Kim loại thô, lưỡi rìu', text: 'Mạnh mẽ, quyết đoán, trọng nghĩa khí, dám làm. Cần tiết chế sự thẳng thắn để không làm tổn thương người khác.' },
  Tân: { image: 'Trang sức, ngọc quý', text: 'Tinh tế, có gu, cầu toàn và giàu lòng tự trọng. Cần chấp nhận sự không hoàn hảo.' },
  Nhâm: { image: 'Biển lớn, sông dài', text: 'Thông minh, phóng khoáng, nhiều ý tưởng, thích tự do. Cần tập trung và kỷ luật để biến ý tưởng thành thực.' },
  Quý: { image: 'Mưa, sương', text: 'Nhạy cảm, trực giác tốt, kín đáo và giàu trí tưởng tượng. Cần tin vào bản thân, tránh lo âu.' },
};

/** Tàng can: hidden stems of each branch (stem indices), main qi first. */
export const HIDDEN_STEMS = [
  [9], // Tý: Quý
  [5, 9, 7], // Sửu: Kỷ Quý Tân
  [0, 2, 4], // Dần: Giáp Bính Mậu
  [1], // Mão: Ất
  [4, 1, 9], // Thìn: Mậu Ất Quý
  [2, 6, 4], // Tỵ: Bính Canh Mậu
  [3, 5], // Ngọ: Đinh Kỷ
  [5, 3, 1], // Mùi: Kỷ Đinh Ất
  [6, 8, 4], // Thân: Canh Nhâm Mậu
  [7], // Dậu: Tân
  [4, 7, 3], // Tuất: Mậu Tân Đinh
  [8, 0], // Hợi: Nhâm Giáp
];

/** Share of a branch's weight carried by each hidden stem, by number of hidden stems. */
export const HIDDEN_WEIGHTS = { 1: [1], 2: [0.7, 0.3], 3: [0.6, 0.3, 0.1] };

export const TEN_GODS = {
  'Tỷ Kiên': { short: 'Tỷ', group: 'Tỷ Kiếp', text: 'Bạn bè, anh em, sự tự lập và tinh thần ngang hàng.' },
  'Kiếp Tài': { short: 'Kiếp', group: 'Tỷ Kiếp', text: 'Cạnh tranh, liều lĩnh, dám tranh giành cơ hội; dễ hao tài vì người khác.' },
  'Thực Thần': { short: 'Thực', group: 'Thực Thương', text: 'Hưởng thụ, sáng tạo ôn hòa, tài ăn nói, phúc lộc tự nhiên.' },
  'Thương Quan': { short: 'Thương', group: 'Thực Thương', text: 'Tài năng nổi bật, phá cách, thích thể hiện; dễ va chạm với quy tắc.' },
  'Thiên Tài': { short: 'T.Tài', group: 'Tài Tinh', text: 'Tiền bất ngờ, kinh doanh, đầu tư, giao thiệp rộng.' },
  'Chính Tài': { short: 'C.Tài', group: 'Tài Tinh', text: 'Thu nhập ổn định, quản lý tiền, chăm chỉ, thực tế.' },
  'Thất Sát': { short: 'Sát', group: 'Quan Sát', text: 'Áp lực, thử thách, quyền uy, dám đối đầu; cần kỷ luật để biến thành sức mạnh.' },
  'Chính Quan': { short: 'Quan', group: 'Quan Sát', text: 'Danh dự, trách nhiệm, công việc chính quy, tuân thủ nguyên tắc.' },
  'Thiên Ấn': { short: 'Kiêu', group: 'Ấn Tinh', text: 'Trực giác, học thuật độc đáo, tôn giáo, huyền học; dễ cô độc.' },
  'Chính Ấn': { short: 'Ấn', group: 'Ấn Tinh', text: 'Học vấn, sự che chở, quý nhân, lòng nhân hậu.' },
};

/** Seasonal state of an element in the month (nguyệt lệnh). */
export const SEASON_STATES = {
  'Vượng': { bonus: 15, text: 'sinh vào mùa của chính mình, được thời rất mạnh' },
  'Tướng': { bonus: 8, text: 'sinh vào mùa được nâng đỡ, khá mạnh' },
  'Hưu': { bonus: -5, text: 'sinh vào mùa phải tiết khí, hơi yếu' },
  'Tù': { bonus: -8, text: 'sinh vào mùa bị hao lực, yếu' },
  'Tử': { bonus: -12, text: 'sinh vào mùa bị khắc, rất yếu' },
};

export const BRANCH_RELATIONS = {
  sixHarmony: [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]],
  clash: [[0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]],
  harm: [[0, 7], [1, 6], [2, 5], [3, 4], [8, 11], [9, 10]],
  threeHarmony: [
    { branches: [8, 0, 4], element: 'Thủy' },
    { branches: [11, 3, 7], element: 'Mộc' },
    { branches: [2, 6, 10], element: 'Hỏa' },
    { branches: [5, 9, 1], element: 'Kim' },
  ],
};

export const STEM_COMBINATIONS = [[0, 5, 'Thổ'], [1, 6, 'Kim'], [2, 7, 'Thủy'], [3, 8, 'Mộc'], [4, 9, 'Hỏa']];

export const SHEN_SHA = {
  nobleman: { name: 'Thiên Ất Quý Nhân', text: 'Hay gặp người giúp đỡ đúng lúc, dễ được nâng đỡ khi khó khăn.' },
  peach: { name: 'Đào Hoa', text: 'Duyên dáng, có sức hút, đường tình cảm và giao tế phong phú.' },
  horse: { name: 'Dịch Mã', text: 'Hay di chuyển, đổi chỗ ở hoặc công việc; hợp nghề đi lại, xuất ngoại.' },
  scholar: { name: 'Văn Xương', text: 'Thông minh, học giỏi, có khiếu viết lách và thi cử.' },
};
