export interface ClinicalKnowledgeDoc {
  id: string;
  topic: string;
  keywords: string[];
  title: string;
  medicalSource: string;
  updatedDate: string;
  summary: string;
  evidenceBasedAdvice: string;
  dangerFlags?: string[];
  safeSelfCare?: string[];
}

export const CLINICAL_KNOWLEDGE_BASE: ClinicalKnowledgeDoc[] = [
  {
    id: 'kb-nutrition-iron-calcium',
    topic: 'Bổ sung vi chất (Sắt, Canxi, Axit Folic, DHA)',
    keywords: ['sắt', 'canxi', 'vi chất', 'dha', 'folic', 'vitamin', 'uống lúc nào', 'thuốc bổ', 'axit folic'],
    title: 'Hướng dẫn sử dụng vi chất dinh dưỡng cho phụ nữ mang thai',
    medicalSource: 'Viện Dinh dưỡng Quốc gia & Hướng dẫn Quốc gia Bộ Y tế Việt Nam',
    updatedDate: '01/2024',
    summary: 'Phác đồ bổ sung sắt, canxi, axit folic và DHA đúng thời điểm, tránh tương tác ức chế hấp thu giữa sắt và canxi.',
    evidenceBasedAdvice: 'Sắt và Axit Folic nên uống buổi sáng khi đói hoặc sau ăn sáng 1-2 tiếng với nước cam hoặc nước lọc giàu Vitamin C. Canxi nên uống sau ăn sáng hoặc ăn trưa 1 tiếng với nhiều nước (tránh uống sau 15h chiều). Khoảng cách giữa cữ uống Sắt và Canxi tối thiểu 2 tiếng để không cản trở hấp thu lẫn nhau.',
    safeSelfCare: [
      'Không uống viên sắt cùng lúc với sữa, trà hoặc cà phê.',
      'Bổ sung canxi hữu cơ từ sữa chua, hạt chia, mè đen và rau xanh thẫm.',
      'Uống đủ 2 - 2.5 lít nước ấm mỗi ngày để phòng tránh táo bón khi bổ sung sắt.',
    ],
  },
  {
    id: 'kb-back-pain-musculoskeletal',
    topic: 'Đau mỏi lưng và giãn khớp chậu thai kỳ',
    keywords: ['đau lưng', 'mỏi lưng', 'thắt lưng', 'khớp háng', 'xương chậu', 'cột sống', 'hông'],
    title: 'Quản lý đau lưng và thay đổi cơ xương khớp trong thai kỳ',
    medicalSource: 'Hướng dẫn Thực hành Sản Phụ khoa Lâm sàng - ĐHY Dược & WHO',
    updatedDate: '03/2024',
    summary: 'Tử cung lớn dần làm thay đổi trọng tâm cơ thể cùng sự gia tăng hormone Relaxin gây giãn nở các dây chằng khung chậu.',
    evidenceBasedAdvice: 'Hầu hết đau thắt lưng là sinh lý do trọng tâm dồn ra trước và cơ lưng phải tăng hoạt động nâng đỡ. Khuyến cáo nằm nghiêng bên trái, đặt gối ôm giữa hai gối và sau lưng để giảm tải cột sống.',
    dangerFlags: [
      'Đau lưng dữ dội lan xuống mặt sau đùi kèm tê bì, mất cảm giác hoặc yếu ngón chân.',
      'Đau lưng quặn từng cơn kèm gò cứng bụng hoặc ra máu âm đạo.',
      'Đau vùng thắt lưng mạn sườn một bên kèm sốt cao, tiểu buốt, tiểu rắt (nghi ngờ nhiễm trùng đường tiết niệu - thận).',
    ],
    safeSelfCare: [
      'Tránh ngồi hoặc đứng yên một chỗ quá 30 - 45 phút.',
      'Tập bài tập Cat-Cow (con mèo - con bò) và nghiêng vùng chậu nhẹ nhàng 10 phút mỗi ngày.',
      'Chườm ấm nhẹ nhàng vùng thắt lưng, không tắm nước quá nóng.',
    ],
  },
  {
    id: 'kb-nausea-morning-sickness',
    topic: 'Ốm nghén và trào ngược dạ dày thực quản',
    keywords: ['nghén', 'buồn nôn', 'nôn', 'ợ nóng', 'ợ chua', 'trào ngược', 'khó tiêu', 'cồn cào'],
    title: 'Xử trí nôn nghén thai kỳ và trào ngược theo phác đồ sản phụ khoa',
    medicalSource: 'ACOG (Hiệp hội Sản phụ khoa Hoa Kỳ) & Bộ Y tế Việt Nam',
    updatedDate: '11/2023',
    summary: 'Sự gia tăng hormone hCG và Progesterone làm giãn cơ thắt thực quản dưới và chậm rỗng dạ dày.',
    evidenceBasedAdvice: 'Chia nhỏ bữa ăn (5-6 bữa/ngày) giúp dạ dày không bị rỗng hoàn toàn hoặc quá căng chướng. Ưu tiên đồ ăn mềm, thanh đạm, ít mùi gia vị nồng.',
    dangerFlags: [
      'Nôn liên tục không thể giữ được thức ăn hoặc nước uống trong 24 giờ.',
      'Sút cân > 5% trọng lượng cơ thể trước mang thai, tiểu ít, sẫm màu, chóng mặt ngất xỉu (Nghén nặng Hyperemesis Gravidarum cần truyền dịch tĩnh mạch).',
      'Nôn ra máu hoặc dịch nâu đen.',
    ],
    safeSelfCare: [
      'Ăn 1-2 chiếc bánh quy khô hoặc nhấm nháp lát gừng ngâm mật ong ngay tại giường trước khi ngồi dậy.',
      'Uống nước từng ngụm nhỏ giữa các bữa ăn, không uống nhiều nước trong khi ăn.',
      'Kê cao đầu giường 15 độ và không nằm ngay sau khi ăn ít nhất 1 giờ.',
    ],
  },
  {
    id: 'kb-gestational-diabetes-ogtt',
    topic: 'Tiểu đường thai kỳ & Nghiệm pháp dung nạp đường (OGTT)',
    keywords: ['tiểu đường', 'đường huyết', 'ogtt', 'nghiệm pháp đường', 'đái tháo đường', 'nước đường'],
    title: 'Hướng dẫn quốc gia chẩn đoán và điều trị đái tháo đường thai kỳ',
    medicalSource: 'Bộ Y tế Việt Nam - Quyết định số 3952/QĐ-BYT',
    updatedDate: '2023',
    summary: 'Tầm soát đái tháo đường thai kỳ thực hiện ở tuần 24-28 bằng nghiệm pháp dung nạp 75g glucose đường uống (3 mẫu máu).',
    evidenceBasedAdvice: 'Thực hiện nghiệm pháp dung nạp glucose đường uống (OGTT 75g) ở mốc 24 - 28 tuần thai. Nhau thai tiết ra các hormone kháng Insulin, làm tăng nguy cơ rối loạn chuyển hóa glucose. Chế độ ăn kiểm soát carbohydrate tinh chế, tăng cường chất xơ và đạm sạch là nền tảng quản lý ban đầu.',
    dangerFlags: [
      'Khát nước dữ dội, tiểu rất nhiều lần, sụt cân nhanh dù ăn nhiều.',
      'Chỉ số đường huyết lúc đói ≥ 5.1 mmol/L (92 mg/dL) hoặc sau 1 giờ ≥ 10.0 mmol/L, sau 2 giờ ≥ 8.5 mmol/L cần bác sĩ nội tiết theo dõi phác đồ chuyên biệt.',
    ],
    safeSelfCare: [
      'Ưu tiên tinh bột hấp thu chậm: gạo lứt, yến mạch, khoai lang thay vì bánh ngọt, nước ngọt có ga.',
      'Chia nhỏ khẩu phần, ăn rau xanh trước bữa ăn để làm chậm tăng đường huyết.',
      'Đi bộ nhẹ nhàng 15-20 phút sau các bữa ăn chính.',
    ],
  },
  {
    id: 'kb-fetal-movement-kick-counts',
    topic: 'Đếm cử động thai (Thai máy) và theo dõi sức khỏe thai',
    keywords: ['thai máy', 'đạp', 'cử động', 'máy', 'con đạp', 'đếm thai máy', 'máy ít'],
    title: 'Phương pháp theo dõi cử động thai nhi tại nhà chuẩn lâm sàng',
    medicalSource: 'Bệnh viện Phụ Sản Trung Ương & WHO Antenatal Care',
    updatedDate: '02/2024',
    summary: 'Cử động thai là chỉ số sinh tồn trực quan đánh giá lượng oxy và tuần hoàn nuôi dưỡng của thai nhi từ tuần 28 trở đi.',
    evidenceBasedAdvice: 'Mẹ bầu nên đếm thai máy sau ăn ở tư thế nằm nghiêng trái yên tĩnh. Tiêu chuẩn bình thường: có tối thiểu 4 - 10 lần cử động rõ ràng trong vòng 2 giờ.',
    dangerFlags: [
      'Thai nhi giảm cử động rõ rệt so với thường ngày hoặc không cử động suốt 2 giờ sau khi mẹ đã uống nước mát, ăn nhẹ và đánh thức bé.',
      'Bé quẫy đạp dữ dội bất thường rồi đột ngột im bặt.',
      'Cần đến ngay bệnh viện để đo Non-Stress Test (NST) và siêu âm Doppler mạch máu thai.',
    ],
    safeSelfCare: [
      'Ghi nhận số lần cử động vào cùng khung giờ mỗi ngày (ví dụ sau bữa tối).',
      'Nếu bé ngủ, mẹ thử uống một cốc sữa ấm hoặc nước mát, nghe bản nhạc quen thuộc và trò chuyện để kích thích bé.',
    ],
  },
  {
    id: 'kb-emergency-red-flags',
    topic: 'Các dấu hiệu cấp cứu sản khoa nguy hiểm cần đến viện ngay',
    keywords: ['ra máu', 'chảy máu', 'vỡ ối', 'rỉ ối', 'co giật', 'hoa mắt', 'tiền sản giật', 'đau bụng dữ dội', 'gò cứng', 'sốt cao'],
    title: 'Quy trình nhận diện và xử trí cấp cứu các biến chứng sản khoa',
    medicalSource: 'Hướng dẫn Xử trí Cấp cứu Sản khoa - Bộ Y tế & Bệnh viện Từ Dũ',
    updatedDate: '2024',
    summary: 'Danh mục các triệu chứng báo động đỏ nguy kịch đe dọa tính mạng người mẹ và thai nhi cần xử trí khẩn cấp.',
    evidenceBasedAdvice: 'Khi xuất hiện các dấu hiệu cấp cứu, người bệnh cần được chuyển ngay tới cơ sở y tế có khoa sản gần nhất hoặc gọi tổng đài cấp cứu 115.',
    dangerFlags: [
      'Chảy máu âm đạo đỏ tươi hoặc kèm cục máu đông (báo hiệu nhau tiền đạo, nhau bong non hoặc dọa sinh non).',
      'Đau bụng dưới dữ dội, cơn gò tử cung co cứng liên tục không giãn.',
      'Ra nước âm đạo ào ạt hoặc rỉ nước liên tục (vỡ màng ối sớm).',
      'Đau đầu dữ dội vùng trán/chẩm không giảm, hoa mắt nhìn mờ, đau tức thượng vị sườn phải, phù mặt tay đột ngột (Dấu hiệu tiền sản giật nặng / dọa sản giật).',
      'Sốt cao > 38.5°C kèm rét run, khó thở hoặc co giật.',
    ],
  },
];
