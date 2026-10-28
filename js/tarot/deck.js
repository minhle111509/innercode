/** Full 78-card Rider–Waite–Smith deck with Vietnamese meanings. */

const MAJOR_ARCANA = [
  ['The Fool', 'Chàng Khờ', 'Khởi đầu mới, tự do, tin vào hành trình', 'Liều lĩnh, thiếu suy nghĩ, sợ bước đi'],
  ['The Magician', 'Nhà Ảo Thuật', 'Ý chí, kỹ năng, biến ý tưởng thành hiện thực', 'Thao túng, tài năng bị lãng phí, thiếu tập trung'],
  ['The High Priestess', 'Nữ Tư Tế', 'Trực giác, bí ẩn, tri thức nội tâm', 'Bỏ qua trực giác, bí mật bị che giấu'],
  ['The Empress', 'Hoàng Hậu', 'Sinh sôi, nuôi dưỡng, sung túc', 'Phụ thuộc, trì trệ sáng tạo'],
  ['The Emperor', 'Hoàng Đế', 'Kỷ luật, cấu trúc, quyền lực', 'Độc đoán, cứng nhắc, mất kiểm soát'],
  ['The Hierophant', 'Giáo Hoàng', 'Truyền thống, niềm tin, người dẫn dắt', 'Phá vỡ khuôn mẫu, nổi loạn, nghi ngờ quy tắc'],
  ['The Lovers', 'Tình Nhân', 'Tình yêu, hòa hợp, lựa chọn từ trái tim', 'Mất cân bằng, lựa chọn sai, bất đồng giá trị'],
  ['The Chariot', 'Cỗ Xe', 'Quyết tâm, chiến thắng, làm chủ hướng đi', 'Mất phương hướng, thiếu kiểm soát'],
  ['Strength', 'Sức Mạnh', 'Can đảm, kiên nhẫn, sức mạnh nội tâm', 'Tự ti, mất kiểm soát cảm xúc'],
  ['The Hermit', 'Ẩn Sĩ', 'Tĩnh lặng, tự vấn, tìm kiếm chân lý', 'Cô lập, xa lánh, lạc lối'],
  ['Wheel of Fortune', 'Bánh Xe Số Phận', 'Thay đổi, vận may, chu kỳ mới', 'Vận xui tạm thời, chống lại thay đổi'],
  ['Justice', 'Công Lý', 'Công bằng, sự thật, luật nhân quả', 'Bất công, trốn tránh trách nhiệm'],
  ['The Hanged Man', 'Người Treo Ngược', 'Buông bỏ, góc nhìn mới, tạm dừng', 'Trì hoãn, hy sinh vô ích, kháng cự'],
  ['Death', 'Cái Chết', 'Kết thúc để bắt đầu, chuyển hóa', 'Sợ thay đổi, níu kéo cái cũ'],
  ['Temperance', 'Tiết Độ', 'Cân bằng, điều độ, kiên nhẫn', 'Mất cân bằng, thái quá'],
  ['The Devil', 'Ác Quỷ', 'Ràng buộc, cám dỗ, chủ nghĩa vật chất', 'Giải thoát, phá bỏ xiềng xích'],
  ['The Tower', 'Tòa Tháp', 'Biến động bất ngờ, sụp đổ để làm lại', 'Né tránh biến cố, sợ thay đổi'],
  ['The Star', 'Ngôi Sao', 'Hy vọng, chữa lành, cảm hứng', 'Mất niềm tin, chán nản'],
  ['The Moon', 'Mặt Trăng', 'Ảo ảnh, lo âu, tiềm thức', 'Sáng tỏ, vượt qua nỗi sợ'],
  ['The Sun', 'Mặt Trời', 'Niềm vui, thành công, năng lượng tích cực', 'Niềm vui bị che khuất, lạc quan quá mức'],
  ['Judgement', 'Phán Xét', 'Thức tỉnh, đánh giá lại, tiếng gọi bên trong', 'Tự nghi ngờ, bỏ qua bài học'],
  ['The World', 'Thế Giới', 'Hoàn thành, viên mãn, hội nhập', 'Chưa trọn vẹn, thiếu kết thúc'],
];

const SUITS = {
  wands: { en: 'Wands', vi: 'Gậy', symbol: '🔥', domain: 'hành động, đam mê, sự nghiệp' },
  cups: { en: 'Cups', vi: 'Cốc', symbol: '💧', domain: 'cảm xúc, tình yêu, các mối quan hệ' },
  swords: { en: 'Swords', vi: 'Kiếm', symbol: '⚔️', domain: 'tư duy, giao tiếp, xung đột' },
  pentacles: { en: 'Pentacles', vi: 'Tiền', symbol: '🪙', domain: 'tài chính, công việc, vật chất' },
};

const RANKS = [
  ['Ace', 'Át'], ['Two', '2'], ['Three', '3'], ['Four', '4'], ['Five', '5'],
  ['Six', '6'], ['Seven', '7'], ['Eight', '8'], ['Nine', '9'], ['Ten', '10'],
  ['Page', 'Tiểu Đồng'], ['Knight', 'Hiệp Sĩ'], ['Queen', 'Hoàng Hậu'], ['King', 'Vua'],
];

// [upright, reversed] per rank, in RANKS order.
const MINOR_MEANINGS = {
  wands: [
    ['Cảm hứng mới, khởi đầu đầy đam mê, cơ hội hành động', 'Trì hoãn, thiếu động lực, ý tưởng chưa thành hình'],
    ['Lập kế hoạch, cân nhắc mở rộng, tầm nhìn xa', 'Sợ thay đổi, kế hoạch thiếu rõ ràng, chần chừ'],
    ['Mở rộng, kết quả bước đầu, nhìn xa trông rộng', 'Trở ngại, chậm trễ, kỳ vọng chưa đạt'],
    ['Ăn mừng, ổn định, hòa hợp gia đình, cột mốc', 'Bất ổn trong nhà, thiếu gắn kết, giai đoạn chuyển tiếp'],
    ['Cạnh tranh, xung đột nhỏ, va chạm ý kiến', 'Tránh né xung đột, tìm được tiếng nói chung'],
    ['Chiến thắng, được công nhận, tự tin', 'Thiếu tự tin, sợ thất bại, chưa được ghi nhận'],
    ['Bảo vệ lập trường, kiên định, vượt thử thách', 'Kiệt sức, bị áp đảo, muốn bỏ cuộc'],
    ['Tiến triển nhanh, tin tức đến, chuyển động', 'Vội vàng, chậm trễ, mất phương hướng'],
    ['Kiên cường, bền bỉ, gần tới đích', 'Mệt mỏi, phòng thủ quá mức, nghi ngờ'],
    ['Gánh nặng, trách nhiệm lớn, làm việc quá sức', 'Buông bớt gánh nặng, học cách ủy thác'],
    ['Tò mò, khám phá, tin tức thú vị', 'Thiếu định hướng, nóng vội, ý tưởng dang dở'],
    ['Hành động táo bạo, phiêu lưu, nhiệt huyết', 'Liều lĩnh, bốc đồng, thiếu kiên nhẫn'],
    ['Tự tin, ấm áp, quyết đoán, có sức hút', 'Ghen tị, thiếu tự tin, đòi hỏi'],
    ['Lãnh đạo, tầm nhìn, dám nghĩ dám làm', 'Độc đoán, nóng nảy, kỳ vọng quá cao'],
  ],
  cups: [
    ['Tình cảm mới, yêu thương, trực giác rộng mở', 'Cảm xúc dồn nén, trống rỗng, khép lòng'],
    ['Kết nối, hòa hợp, mối quan hệ đôi bên', 'Mất cân bằng, bất đồng, rạn nứt'],
    ['Tình bạn, ăn mừng, cộng đồng', 'Tiệc tùng quá đà, bị tách biệt, chuyện thị phi'],
    ['Thờ ơ, trầm ngâm, bỏ lỡ cơ hội', 'Nhận ra cơ hội mới, thoát khỏi trì trệ'],
    ['Mất mát, tiếc nuối, buồn bã', 'Chấp nhận, chữa lành, bước tiếp'],
    ['Hoài niệm, ký ức đẹp, sự ngây thơ', 'Mắc kẹt trong quá khứ, cần trưởng thành'],
    ['Nhiều lựa chọn, mơ mộng, ảo tưởng', 'Rõ ràng hơn, đưa ra quyết định, tỉnh mộng'],
    ['Rời bỏ, tìm kiếm ý nghĩa sâu sắc hơn', 'Sợ thay đổi, níu giữ, lưỡng lự ra đi'],
    ['Mãn nguyện, ước mơ thành hiện thực', 'Tự mãn, hưởng thụ quá mức, chưa thỏa mãn'],
    ['Hạnh phúc gia đình, viên mãn', 'Bất hòa gia đình, kỳ vọng lệch nhau'],
    ['Thông điệp cảm xúc, sáng tạo, nhạy cảm', 'Cảm xúc chưa trưởng thành, thất vọng nhỏ'],
    ['Lãng mạn, lời mời, theo đuổi ước mơ', 'Thất thường, hứa hẹn suông, ảo tưởng'],
    ['Thấu cảm, trực giác, dịu dàng', 'Phụ thuộc cảm xúc, bỏ quên bản thân'],
    ['Cân bằng cảm xúc, bao dung, điềm tĩnh', 'Thao túng cảm xúc, thất thường, kìm nén'],
  ],
  swords: [
    ['Sáng suốt, sự thật, đột phá tư duy', 'Hoang mang, thông tin sai lệch, thiếu rõ ràng'],
    ['Bế tắc, khó lựa chọn, né tránh', 'Quá tải thông tin, buộc phải quyết định'],
    ['Tổn thương, đau lòng, chia ly', 'Hồi phục, tha thứ, vượt qua nỗi đau'],
    ['Nghỉ ngơi, hồi phục, tĩnh tâm', 'Bồn chồn, kiệt sức, cần quay lại hành động'],
    ['Xung đột, thắng bằng mọi giá, bất hòa', 'Hòa giải, buông bỏ, rút kinh nghiệm'],
    ['Chuyển tiếp, rời xa khó khăn', 'Mắc kẹt, mang theo hành trang cũ'],
    ['Mưu mẹo, lén lút, chiến lược riêng', 'Bị lộ, thú nhận, lương tâm cắn rứt'],
    ['Bị giới hạn, tự giam cầm, bất lực', 'Giải thoát, góc nhìn mới, tự do'],
    ['Lo âu, mất ngủ, sợ hãi', 'Hy vọng, vượt qua lo âu, tìm trợ giúp'],
    ['Kết thúc đau đớn, chạm đáy', 'Hồi sinh, điều tồi tệ nhất đã qua'],
    ['Tò mò, ham học, cảnh giác', 'Nói nhiều làm ít, thiếu suy nghĩ'],
    ['Quyết liệt, nhanh nhạy, hành động ngay', 'Hấp tấp, hung hăng, thiếu kế hoạch'],
    ['Độc lập, rõ ràng, thẳng thắn', 'Lạnh lùng, cay nghiệt, phán xét'],
    ['Lý trí, công bằng, trí tuệ sắc bén', 'Lạm quyền, thao túng, cứng nhắc'],
  ],
  pentacles: [
    ['Cơ hội tài chính, khởi đầu vững chắc', 'Lỡ cơ hội, kế hoạch tài chính kém'],
    ['Cân bằng, linh hoạt, khéo xoay xở', 'Quá tải, rối ren tài chính'],
    ['Hợp tác, tay nghề, làm việc nhóm', 'Thiếu phối hợp, chất lượng kém'],
    ['Tiết kiệm, giữ gìn, an toàn', 'Keo kiệt, sợ mất, hoặc chi tiêu hoang phí'],
    ['Khó khăn tài chính, cảm giác bị bỏ rơi', 'Phục hồi, nhận được giúp đỡ'],
    ['Cho và nhận, hào phóng, chia sẻ', 'Nợ nần, cho đi có điều kiện'],
    ['Kiên nhẫn, đầu tư dài hạn, đánh giá lại', 'Nóng vội, đầu tư kém hiệu quả'],
    ['Chăm chỉ, rèn luyện kỹ năng, tận tâm', 'Cầu toàn, làm qua loa, thiếu động lực'],
    ['Độc lập tài chính, sung túc, tự chủ', 'Phụ thuộc, sống quá khả năng'],
    ['Giàu có bền vững, gia sản, ổn định lâu dài', 'Tranh chấp tài sản, bất ổn tài chính'],
    ['Ham học, cơ hội mới, chăm chỉ', 'Trì hoãn, thiếu tập trung'],
    ['Kiên trì, đáng tin cậy, cần mẫn', 'Trì trệ, cứng nhắc, nhàm chán'],
    ['Chăm lo, thực tế, sung túc', 'Lo toan quá mức, mất cân bằng công việc – gia đình'],
    ['Thành đạt, vững vàng, quản lý giỏi', 'Tham lam, bảo thủ, coi trọng vật chất'],
  ],
};

const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII',
  'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];

function buildDeck() {
  const majors = MAJOR_ARCANA.map(([en, vi, upright, reversed], i) => ({
    id: `major-${i}`,
    arcana: 'major',
    suit: null,
    label: ROMAN[i],
    symbol: '✶',
    nameEn: en,
    nameVi: vi,
    upright,
    reversed,
  }));

  const minors = Object.entries(SUITS).flatMap(([suitKey, suit]) =>
    RANKS.map(([rankEn, rankVi], i) => {
      const [upright, reversed] = MINOR_MEANINGS[suitKey][i];
      return {
        id: `${suitKey}-${i + 1}`,
        arcana: 'minor',
        suit: suitKey,
        label: rankVi,
        symbol: suit.symbol,
        nameEn: `${rankEn} of ${suit.en}`,
        nameVi: `${rankVi} ${suit.vi}`,
        upright,
        reversed,
      };
    }),
  );

  return Object.freeze([...majors, ...minors].map(Object.freeze));
}

export const DECK = buildDeck();
export { SUITS };
