/** Eight trigrams (Tiên Thiên numbering used by Mai Hoa Dịch Số) and the 64 hexagrams. */

// lines are listed bottom → top; 1 = yang (liền), 0 = yin (đứt)
export const TRIGRAMS = Object.freeze({
  1: { number: 1, name: 'Càn', symbol: '☰', image: 'Trời', hanViet: 'Thiên', element: 'Kim', lines: [1, 1, 1] },
  2: { number: 2, name: 'Đoài', symbol: '☱', image: 'Đầm', hanViet: 'Trạch', element: 'Kim', lines: [1, 1, 0] },
  3: { number: 3, name: 'Ly', symbol: '☲', image: 'Lửa', hanViet: 'Hỏa', element: 'Hỏa', lines: [1, 0, 1] },
  4: { number: 4, name: 'Chấn', symbol: '☳', image: 'Sấm', hanViet: 'Lôi', element: 'Mộc', lines: [1, 0, 0] },
  5: { number: 5, name: 'Tốn', symbol: '☴', image: 'Gió', hanViet: 'Phong', element: 'Mộc', lines: [0, 1, 1] },
  6: { number: 6, name: 'Khảm', symbol: '☵', image: 'Nước', hanViet: 'Thủy', element: 'Thủy', lines: [0, 1, 0] },
  7: { number: 7, name: 'Cấn', symbol: '☶', image: 'Núi', hanViet: 'Sơn', element: 'Thổ', lines: [0, 0, 1] },
  8: { number: 8, name: 'Khôn', symbol: '☷', image: 'Đất', hanViet: 'Địa', element: 'Thổ', lines: [0, 0, 0] },
});

const T = { Q: 1, D: 2, L: 3, C: 4, T: 5, K: 6, N: 7, O: 8 };

// [King Wen number, name, upper, lower, meaning]
const HEXAGRAM_ROWS = [
  [1, 'Thuần Càn', 'Q', 'Q', 'Sức mạnh sáng tạo, cương kiện; thời vận hanh thông nếu giữ chính đạo.'],
  [2, 'Thuần Khôn', 'O', 'O', 'Nhu thuận, bao dung; thành công nhờ kiên nhẫn và biết đi theo người dẫn dắt.'],
  [3, 'Thủy Lôi Truân', 'K', 'C', 'Khó khăn buổi đầu; cần kiên trì, tìm người giúp, chưa nên vội.'],
  [4, 'Sơn Thủy Mông', 'N', 'K', 'Non nớt, mờ mịt; cần học hỏi và tìm người chỉ dẫn.'],
  [5, 'Thủy Thiên Nhu', 'K', 'Q', 'Chờ đợi đúng thời; giữ niềm tin, chuẩn bị kỹ rồi sẽ thuận.'],
  [6, 'Thiên Thủy Tụng', 'Q', 'K', 'Tranh chấp, kiện cáo; nên hòa giải, tránh đi đến cùng.'],
  [7, 'Địa Thủy Sư', 'O', 'K', 'Tập hợp lực lượng, kỷ luật; cần người lãnh đạo chính trực.'],
  [8, 'Thủy Địa Tỷ', 'K', 'O', 'Thân cận, đoàn kết; hợp tác đúng người thì cát.'],
  [9, 'Phong Thiên Tiểu Súc', 'T', 'Q', 'Tích lũy nhỏ, bị kìm hãm tạm thời; nhẫn nại chờ thời.'],
  [10, 'Thiên Trạch Lý', 'Q', 'D', 'Bước đi thận trọng như dẫm đuôi hổ; giữ lễ thì yên.'],
  [11, 'Địa Thiên Thái', 'O', 'Q', 'Trời đất giao hòa, thông suốt; mọi việc thuận lợi.'],
  [12, 'Thiên Địa Bĩ', 'Q', 'O', 'Bế tắc, không thông; nên giữ mình, chờ vận chuyển.'],
  [13, 'Thiên Hỏa Đồng Nhân', 'Q', 'L', 'Hòa đồng, cùng chí hướng; hợp tác rộng rãi thì thành.'],
  [14, 'Hỏa Thiên Đại Hữu', 'L', 'Q', 'Sở hữu lớn, thịnh vượng; giữ khiêm nhường để bền lâu.'],
  [15, 'Địa Sơn Khiêm', 'O', 'N', 'Khiêm tốn; càng nhún nhường càng được tôn trọng.'],
  [16, 'Lôi Địa Dự', 'C', 'O', 'Vui vẻ, hứng khởi; chuẩn bị tốt thì hanh thông, tránh ham chơi.'],
  [17, 'Trạch Lôi Tùy', 'D', 'C', 'Theo thời, thuận theo người; linh hoạt thì được lợi.'],
  [18, 'Sơn Phong Cổ', 'N', 'T', 'Việc hư hỏng cần sửa chữa; dám đổi mới thì tốt.'],
  [19, 'Địa Trạch Lâm', 'O', 'D', 'Tiến tới, đến gần; thời cơ đang lên, nên hành động.'],
  [20, 'Phong Địa Quan', 'T', 'O', 'Quan sát, chiêm nghiệm; nhìn rộng trước khi quyết.'],
  [21, 'Hỏa Lôi Phệ Hạp', 'L', 'C', 'Cắn đứt trở ngại; cần quyết đoán, xử lý dứt khoát.'],
  [22, 'Sơn Hỏa Bí', 'N', 'L', 'Trang sức, vẻ đẹp bề ngoài; việc nhỏ thì lợi, đừng chuộng hình thức.'],
  [23, 'Sơn Địa Bác', 'N', 'O', 'Suy tàn, bị bào mòn; nên giữ yên, chưa nên tiến.'],
  [24, 'Địa Lôi Phục', 'O', 'C', 'Trở lại, hồi phục; khởi đầu chu kỳ mới, từ từ đi lên.'],
  [25, 'Thiên Lôi Vô Vọng', 'Q', 'C', 'Chân thật, không vọng động; làm đúng thì tốt, mưu toan thì hại.'],
  [26, 'Sơn Thiên Đại Súc', 'N', 'Q', 'Tích lũy lớn; tu dưỡng, dự trữ, thời đến sẽ phát.'],
  [27, 'Sơn Lôi Di', 'N', 'C', 'Nuôi dưỡng; chú ý lời nói, ăn uống và điều mình vun đắp.'],
  [28, 'Trạch Phong Đại Quá', 'D', 'T', 'Gánh nặng vượt sức; cần thay đổi cách làm.'],
  [29, 'Thuần Khảm', 'K', 'K', 'Hiểm trở chồng chất; giữ lòng tin, vững vàng thì vượt qua.'],
  [30, 'Thuần Ly', 'L', 'L', 'Sáng sủa, nương vào điều đúng; bám giữ chính đạo thì cát.'],
  [31, 'Trạch Sơn Hàm', 'D', 'N', 'Cảm ứng, rung động; tình cảm và kết nối thuận lợi.'],
  [32, 'Lôi Phong Hằng', 'C', 'T', 'Bền lâu, kiên định; giữ đường đi đã chọn thì tốt.'],
  [33, 'Thiên Sơn Độn', 'Q', 'N', 'Lui về, ẩn tránh; biết rút lui đúng lúc là khôn.'],
  [34, 'Lôi Thiên Đại Tráng', 'C', 'Q', 'Sức mạnh lớn; tránh cậy mạnh, giữ chính đạo.'],
  [35, 'Hỏa Địa Tấn', 'L', 'O', 'Tiến lên, thăng tiến; được trọng dụng, sáng sủa.'],
  [36, 'Địa Hỏa Minh Di', 'O', 'L', 'Ánh sáng bị che; giấu tài, giữ mình qua thời khó.'],
  [37, 'Phong Hỏa Gia Nhân', 'T', 'L', 'Gia đạo; mọi việc bắt đầu từ trong nhà, giữ nề nếp.'],
  [38, 'Hỏa Trạch Khuê', 'L', 'D', 'Chia lìa, bất đồng; việc nhỏ có thể thành, tìm điểm chung.'],
  [39, 'Thủy Sơn Kiển', 'K', 'N', 'Gian nan, trắc trở; quay về tự xét, tìm người giúp.'],
  [40, 'Lôi Thủy Giải', 'C', 'K', 'Cởi bỏ, giải thoát; khó khăn tan dần, nên hành động sớm.'],
  [41, 'Sơn Trạch Tổn', 'N', 'D', 'Bớt đi; chịu thiệt phần nhỏ để được lợi lâu dài.'],
  [42, 'Phong Lôi Ích', 'T', 'C', 'Tăng thêm, lợi ích; thời thuận để tiến và giúp người.'],
  [43, 'Trạch Thiên Quải', 'D', 'Q', 'Quyết đoán, dứt bỏ; loại bỏ điều xấu một cách công khai.'],
  [44, 'Thiên Phong Cấu', 'Q', 'T', 'Gặp gỡ bất ngờ; cẩn trọng với cám dỗ và người mới.'],
  [45, 'Trạch Địa Tụy', 'D', 'O', 'Tụ họp; đoàn kết quanh người lãnh đạo thì có lợi.'],
  [46, 'Địa Phong Thăng', 'O', 'T', 'Đi lên từng bước; nỗ lực bền bỉ sẽ thăng tiến.'],
  [47, 'Trạch Thủy Khốn', 'D', 'K', 'Khốn đốn, cùng quẫn; giữ chí, ít lời, chờ thời.'],
  [48, 'Thủy Phong Tỉnh', 'K', 'T', 'Giếng nước; nguồn lực bền vững, cần duy trì và khơi thông.'],
  [49, 'Trạch Hỏa Cách', 'D', 'L', 'Thay đổi, cải cách; đúng thời thì đổi mới thành công.'],
  [50, 'Hỏa Phong Đỉnh', 'L', 'T', 'Cái vạc, tạo dựng cái mới; nuôi dưỡng tài năng, cát.'],
  [51, 'Thuần Chấn', 'C', 'C', 'Sấm động; hoảng hốt ban đầu rồi bình yên, giữ vững tinh thần.'],
  [52, 'Thuần Cấn', 'N', 'N', 'Dừng lại, tĩnh lặng; biết dừng đúng chỗ thì không lỗi.'],
  [53, 'Phong Sơn Tiệm', 'T', 'N', 'Tiến dần dần; theo trình tự thì tốt, nhất là chuyện hôn nhân.'],
  [54, 'Lôi Trạch Quy Muội', 'C', 'D', 'Vội vàng, sai thứ tự; nên thận trọng trong cam kết.'],
  [55, 'Lôi Hỏa Phong', 'C', 'L', 'Thịnh lớn, đỉnh cao; tận hưởng nhưng nhớ thịnh rồi sẽ suy.'],
  [56, 'Hỏa Sơn Lữ', 'L', 'N', 'Lữ khách, xa nhà; khiêm cẩn thì việc nhỏ được hanh thông.'],
  [57, 'Thuần Tốn', 'T', 'T', 'Thuận nhập như gió; mềm mỏng, kiên trì thì thâm nhập được.'],
  [58, 'Thuần Đoài', 'D', 'D', 'Vui vẻ, đẹp lòng; giao tiếp cởi mở, giữ chân thành.'],
  [59, 'Phong Thủy Hoán', 'T', 'K', 'Phân tán; cần gắn kết lại, xóa bỏ hiềm khích.'],
  [60, 'Thủy Trạch Tiết', 'K', 'D', 'Tiết chế, có chừng mực; giới hạn hợp lý thì hanh thông.'],
  [61, 'Phong Trạch Trung Phu', 'T', 'D', 'Lòng thành tín; chân thành cảm hóa được người.'],
  [62, 'Lôi Sơn Tiểu Quá', 'C', 'N', 'Hơi quá một chút; việc nhỏ được, việc lớn không nên.'],
  [63, 'Thủy Hỏa Ký Tế', 'K', 'L', 'Đã thành; giữ gìn thành quả, đề phòng sơ suất.'],
  [64, 'Hỏa Thủy Vị Tế', 'L', 'K', 'Chưa xong; sắp đến đích, cần cẩn trọng đến bước cuối.'],
];

export const HEXAGRAMS = Object.freeze(HEXAGRAM_ROWS.map(([number, name, upper, lower, meaning]) =>
  Object.freeze({ number, name, upper: T[upper], lower: T[lower], meaning })));

const BY_TRIGRAMS = new Map(HEXAGRAMS.map((h) => [`${h.upper}-${h.lower}`, h]));

export function findHexagram(upper, lower) {
  const hexagram = BY_TRIGRAMS.get(`${upper}-${lower}`);
  if (!hexagram) throw new RangeError(`No hexagram for trigrams ${upper}/${lower}`);
  return hexagram;
}

export const EARTHLY_BRANCHES = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

export const RELATIONS = {
  same: { label: 'Thể Dụng tỷ hòa', verdict: 'Cát', text: 'Thể và Dụng cùng hành: mọi việc thuận hòa, dễ thành.' },
  yongGeneratesTi: { label: 'Dụng sinh Thể', verdict: 'Đại cát', text: 'Hoàn cảnh nâng đỡ bạn: việc có lợi, dễ được người giúp.' },
  tiControlsYong: { label: 'Thể khắc Dụng', verdict: 'Cát', text: 'Bạn làm chủ tình thế: việc thành, nhưng cần chủ động và bỏ công.' },
  tiGeneratesYong: { label: 'Thể sinh Dụng', verdict: 'Tiểu hung', text: 'Bạn phải bỏ nhiều công sức, tiền bạc: dễ hao tổn, nên cân nhắc.' },
  yongControlsTi: { label: 'Dụng khắc Thể', verdict: 'Hung', text: 'Hoàn cảnh gây bất lợi cho bạn: dễ gặp trở ngại, nên thận trọng.' },
};
