import {
  ChecklistItem,
  LibraryArticle,
  ProductCombo,
  CouponRule,
  CommunityGroupType,
} from '../types';

export const ECOSYSTEM_BANNERS = {
  memoriesBanner: '/src/assets/images/memories_scrapbook_banner_1794815308143.jpg',
  babyBanner: '/src/assets/images/baby_postpartum_banner_1794815308148.jpg',
  familyBanner: '/src/assets/images/family_journey_banner_1794815313120.jpg',
};

export const INITIAL_LIBRARY_ARTICLES: LibraryArticle[] = [
  {
    id: 'lib-1',
    title: 'Các mốc khám thai quan trọng trong 40 tuần theo Bộ Y tế',
    summary: 'Tổng hợp 8 mốc thăm khám thai định kỳ giúp theo dõi sự phát triển của thai nhi và sức khỏe mẹ bầu an toàn.',
    content:
      'Theo Hướng dẫn Quốc gia về Chăm sóc Sức khỏe Sinh sản (Bộ Y tế Việt Nam), mẹ bầu nên khám thai tối thiểu 4–8 lần suốt thai kỳ. Các mốc vàng không nên bỏ lỡ gồm: 6–8 tuần (xác định thai vào tổ và tim thai), 11–13 tuần 6 ngày (đo độ mờ da gáy, sàng lọc Double Test/NIPT), 20–24 tuần (siêu âm hình thái 4D), 24–28 tuần (nghiệm pháp dung nạp glucose tầm soát đái tháo đường thai kỳ), 30–32 tuần (đánh giá tăng trưởng và vị trí rau thai), và hàng tuần từ tuần 36 trở đi.\n\nLưu ý: Thông tin mang tính tham khảo giáo dục sức khỏe, mẹ cần trao đổi trực tiếp với bác sĩ sản khoa theo tình trạng cá nhân.',
    category: 'pregnancy',
    weekMin: 1,
    weekMax: 40,
    medicalSource: 'Bộ Y tế Việt Nam · Hướng dẫn Quốc gia CSSKSS',
    updatedDate: '2026-10-15',
    status: 'approved',
    authorName: 'Ban Biên Tập Y Khoa Nova',
    readTimeMinutes: 4,
  },
  {
    id: 'lib-2',
    title: 'Cách bổ sung Sắt, Canxi và Axit Folic đúng thời điểm',
    summary: 'Nguyên tắc uống tách biệt sắt và canxi giúp tăng hấp thu tối đa và giảm táo bón, buồn nôn thai kỳ.',
    content:
      'Sắt và Canxi cạnh tranh hấp thu tại ruột non nếu uống cùng lúc. Mẹ bầu nên uống Sắt vào buổi sáng hoặc trưa trước/sau bữa ăn 1 giờ kèm vitamin C tự nhiên (nước cam/ổi); Canxi nên uống vào buổi sáng hoặc đầu giờ chiều sau ăn và cách liều Sắt tối thiểu 2 tiếng.\n\nAxit Folic (400–800 mcg/ngày) đặc biệt thiết yếu từ trước khi mang thai và trong 12 tuần đầu nhằm hỗ trợ hoàn thiện ống thần kinh thai nhi. Không tự ý tăng giảm liều thuốc kê toa khi chưa hỏi bác sĩ.',
    category: 'nutrition',
    weekMin: 1,
    weekMax: 36,
    medicalSource: 'WHO Antenatal Care Guidelines · Viện Dinh Dưỡng Quốc Gia',
    updatedDate: '2026-10-20',
    status: 'approved',
    authorName: 'ThS. Dinh dưỡng Minh Trang',
    readTimeMinutes: 3,
  },
  {
    id: 'lib-3',
    title: 'Giấc ngủ an toàn và giảm đau lưng cho mẹ bầu tam cá nguyệt 2–3',
    summary: 'Tư thế nằm nghiêng trái, kê gối chữ U và bài tập giãn cơ nhẹ giúp cải thiện tuần hoàn máu đến thai nhi.',
    content:
      'Từ tuần 20 trở đi, tử cung lớn dần có thể chèn ép tĩnh mạch chủ dưới nếu mẹ nằm ngửa lâu. Các chuyên gia sản khoa khuyến nghị tư thế nằm nghiêng trái với gối ôm nâng đỡ bụng và đầu gối để tối ưu lưu lượng máu qua nhau thai.\n\nNếu mẹ thường xuyên thức giấc ban đêm hoặc đau thắt lưng, có thể chườm ấm nhẹ 10–15 phút trước khi ngủ và tập thở bụng chậm. Tránh tự dùng thuốc giảm đau khi chưa có chỉ định.',
    category: 'maternal_care',
    weekMin: 14,
    weekMax: 40,
    medicalSource: 'ACOG · American College of Obstetricians and Gynecologists',
    updatedDate: '2026-11-01',
    status: 'approved',
    authorName: 'BS. Thu Hà (Cố vấn Sản khoa)',
    readTimeMinutes: 4,
  },
  {
    id: 'lib-4',
    title: 'Phân biệt cơn gò Braxton Hicks và dấu hiệu chuyển dạ thật',
    summary: 'Nhận diện cơn gò sinh lý chuẩn bị tử cung với các cơn co chuyển dạ đều đặn cần đến bệnh viện.',
    content:
      'Cơn gò Braxton Hicks (chuyển dạ giả) thường xuất hiện không đều, không tăng dần cường độ, tập trung vùng bụng dưới và dịu đi khi mẹ thay đổi tư thế hoặc uống nước ấm nghỉ ngơi.\n\nNgược lại, dấu hiệu chuyển dạ thật có cơn co đều đặn (cách nhau 5–7 phút và ngắn dần), đau lan từ lưng ra bụng, kèm ra nhớt hồng hoặc rỉ/vỡ ối. Khi có dấu hiệu chuyển dạ thật hoặc bất kỳ dấu hiệu cảnh báo nào (ra máu đỏ tươi, thai máy giảm rõ), mẹ cần đến ngay cơ sở y tế.',
    category: 'birth_prep',
    weekMin: 28,
    weekMax: 40,
    medicalSource: 'Bệnh viện Phụ sản Trung ương & WHO',
    updatedDate: '2026-10-28',
    status: 'approved',
    authorName: 'BS. Thu Hà (Cố vấn Sản khoa)',
    readTimeMinutes: 5,
  },
  {
    id: 'lib-5',
    title: 'Chăm sóc phục hồi thể chất và tinh thần cho mẹ 6 tuần đầu sau sinh',
    summary: 'Theo dõi sản dịch, chăm sóc vết mổ/tầng sinh môn và nhận diện sớm dấu hiệu Baby Blues hay trầm cảm sau sinh.',
    content:
      'Giai đoạn 6 tuần hậu sản là thời gian cơ thể mẹ hồi phục nội tiết và tử cung co hồi. Mẹ cần giữ vệ sinh vùng kín sạch sẽ bằng nước ấm sạch, theo dõi sản dịch giảm dần từ đỏ sẫm sang hồng nhạt rồi trắng trong, nghỉ ngơi xen kẽ theo giấc ngủ của bé.\n\nKhoảng 50–80% mẹ gặp hội chứng buồn bã thoáng qua (Baby Blues) vài ngày đầu sau sinh và tự cải thiện sau 2 tuần. Nếu cảm giác buồn bã kéo dài quá 2 tuần, mất ngủ triền miên hoặc lo âu nặng, hãy chia sẻ với gia đình và gặp chuyên gia tâm lý/y tế để được hỗ trợ kịp thời.',
    category: 'postpartum',
    weekMin: 36,
    weekMax: 40,
    medicalSource: 'WHO Postnatal Care Guidelines (2022) · Bộ Y tế VN',
    updatedDate: '2026-11-05',
    status: 'approved',
    authorName: 'Ban Biên Tập Y Khoa Nova',
    readTimeMinutes: 5,
  },
  {
    id: 'lib-6',
    title: 'Hướng dẫn thực hành da kề da và chăm sóc rốn trẻ sơ sinh an toàn',
    summary: 'Lợi ích của 90 phút da kề da đầu đời và nguyên tắc giữ rốn trẻ sạch, khô, thoáng.',
    content:
      'Thực hành da kề da giúp trẻ sơ sinh ổn định thân nhiệt, nhịp tim, đường huyết và khởi phát phản xạ bú mẹ sớm. Sau khi về nhà, mẹ chỉ cần giữ vùng cuống rốn của bé sạch sẽ, khô thoáng tự nhiên sau tắm bằng gạc vô trùng, mặc tã gập thấp dưới rốn và không đắp lá hoặc bột lạ lên rốn.\n\nNếu rốn bé tấy đỏ lan rộng, rỉ mủ có mùi hôi hoặc bé sốt/bỏ bú, hãy đưa bé đi khám bác sĩ nhi khoa ngay.',
    category: 'newborn_care',
    weekMin: 34,
    weekMax: 40,
    medicalSource: 'UNICEF & WHO Essential Newborn Care',
    updatedDate: '2026-11-08',
    status: 'approved',
    authorName: 'BS. Nhi khoa Lan Phương',
    readTimeMinutes: 4,
  },
  {
    id: 'lib-7',
    title: 'Hướng dẫn đếm cử động thai (thai máy) mỗi ngày từ tuần 28',
    summary: 'Cách theo dõi nhịp sinh hoạt của bé sau bữa ăn để phát hiện kịp thời những thay đổi bất thường.',
    content:
      'Từ tuần 28, mẹ có thể chọn một khung giờ cố định mỗi ngày sau bữa ăn khi bé thức, nằm nghiêng trái và đếm số lần bé đạp, xoay hoặc huých nhẹ. Thông thường bé cử động ít nhất 4–10 lần trong vòng 1–2 giờ.\n\nNếu thấy bé cử động ít hơn hẳn thường lệ hoặc không thấy cử động trong 2 giờ nghỉ ngơi, mẹ cần liên hệ cơ sở sản khoa để kiểm tra tim thai (NST/siêu âm) ngay, không chờ sang ngày hôm sau.',
    category: 'pregnancy',
    weekMin: 28,
    weekMax: 40,
    medicalSource: 'Bộ Y tế Việt Nam · Hướng dẫn theo dõi thai máy',
    updatedDate: '2026-11-10',
    status: 'approved',
    authorName: 'BS. Thu Hà (Cố vấn Sản khoa)',
    readTimeMinutes: 3,
  },
];

export const DEFAULT_CHECKLIST_TEMPLATES: Omit<ChecklistItem, 'id' | 'userId' | 'createdAt'>[] = [
  // 1. checkup_prep
  {
    category: 'checkup_prep',
    title: 'Mang theo sổ khám thai, kết quả xét nghiệm và siêu âm cũ',
    notes: 'Giúp bác sĩ đối chiếu chỉ số phát triển qua từng tuần.',
    completed: false,
  },
  {
    category: 'checkup_prep',
    title: 'Chuẩn bị danh sách 3–5 câu hỏi cần hỏi bác sĩ',
    notes: 'Ghi chú trước triệu chứng hoặc thuốc đang dùng.',
    completed: false,
  },
  // 2. birth_bag
  {
    category: 'birth_bag',
    title: 'Hồ sơ đi sinh: CCCD, BHYT, sổ khám thai và xét nghiệm máu tuần 36',
    trimester: 3,
    weekNumber: 35,
    completed: false,
  },
  {
    category: 'birth_bag',
    title: '3–4 bộ quần áo sau sinh cài nút trước, tất ấm và băng vệ sinh mẹ bầu',
    trimester: 3,
    weekNumber: 35,
    completed: false,
  },
  {
    category: 'birth_bag',
    title: 'Quần áo sơ sinh, mũ thóp, bao tay chân, tã Newborn và khăn xô mềm cho bé',
    trimester: 3,
    weekNumber: 36,
    completed: false,
  },
  // 3. nursery
  {
    category: 'nursery',
    title: 'Cũi / nôi nằm phẳng an toàn, đệm thoáng khí không đặt thú bông khi ngủ',
    trimester: 3,
    weekNumber: 32,
    completed: false,
  },
  {
    category: 'nursery',
    title: 'Đèn ngủ ánh sáng vàng dịu và nhiệt kế phòng / đo nước tắm',
    trimester: 3,
    weekNumber: 33,
    completed: false,
  },
  // 4. postpartum_care
  {
    category: 'postpartum_care',
    title: 'Bình xịt vệ sinh tầng sinh môn, quần lót giấy / cotton lưng cao',
    trimester: 3,
    completed: false,
  },
  {
    category: 'postpartum_care',
    title: 'Sắp xếp người hỗ trợ việc nhà & bữa ăn ấm cho mẹ 2 tuần đầu sau sinh',
    trimester: 3,
    completed: false,
  },
  // 5. newborn_essentials
  {
    category: 'newborn_essentials',
    title: 'Khăn quấn (swaddle) cotton thoáng, nước muối sinh lý 0.9% và gạc rơ lưỡi',
    trimester: 3,
    completed: false,
  },
  {
    category: 'newborn_essentials',
    title: 'Chậu tắm an toàn và sữa tắm gội dịu nhẹ không cay mắt cho trẻ sơ sinh',
    trimester: 3,
    completed: false,
  },
  // 6. weekly
  {
    category: 'weekly',
    title: 'Kiểm tra cân nặng & ghi nhận cảm nhận tuần thai mới',
    weekNumber: 24,
    completed: false,
  },
  {
    category: 'weekly',
    title: 'Thực hiện xét nghiệm tiểu đường thai kỳ (OGTT 75g)',
    weekNumber: 24,
    trimester: 2,
    completed: false,
  },
  {
    category: 'weekly',
    title: 'Đo độ mờ da gáy & xét nghiệm sàng lọc quý 1',
    weekNumber: 12,
    trimester: 1,
    completed: false,
  },
  // 7. stage
  {
    category: 'stage',
    title: 'Tam cá nguyệt 1: Duy trì Axit Folic đều đặn và khám mốc tim thai',
    trimester: 1,
    completed: false,
  },
  {
    category: 'stage',
    title: 'Tam cá nguyệt 2: Siêu âm hình thái 4D & giữ cân nặng tăng ổn định',
    trimester: 2,
    completed: false,
  },
  {
    category: 'stage',
    title: 'Tam cá nguyệt 3: Học cách đếm thai máy & hoàn thiện giỏ đồ đi sinh trước tuần 36',
    trimester: 3,
    completed: false,
  },
];

export const BABY_MILESTONES_BY_MONTH: {
  id: string;
  month: number;
  title: string;
  description: string;
  careFocus: string;
}[] = [
  {
    id: 'bm-0',
    month: 0,
    title: 'Tháng sơ sinh (0–1 tháng): Làm quen thế giới mới',
    description: 'Bé ngủ khoảng 16–18 giờ/ngày, phản xạ bú mút và nắm tay bản năng, nhận ra giọng nói quen thuộc của mẹ.',
    careFocus: 'Cho bú theo nhu cầu, đặt bé nằm ngửa trên bề mặt phẳng thoáng, theo dõi số tã ướt mỗi ngày.',
  },
  {
    id: 'bm-1',
    month: 1,
    title: 'Tháng thứ 1–2: Nụ cười xã hội đầu tiên',
    description: 'Bé bắt đầu giao tiếp bằng ánh mắt ở khoảng cách 20–30cm, mỉm cười đáp lại giọng nói ấm áp và ngóc đầu nhẹ khi nằm sấp.',
    careFocus: 'Thực hành Tummy Time (nằm sấp khi bé thức có người giám sát) 2–3 phút mỗi lần.',
  },
  {
    id: 'bm-3',
    month: 3,
    title: 'Tháng thứ 3–4: Lẫy và hóng chuyện',
    description: 'Cơ cổ vững hơn, bé thích phát ra tiếng gù gù ("a", "ơ"), với tay chạm đồ chơi treo màu tương phản.',
    careFocus: 'Trò chuyện, hát ru và cho bé cầm nắm lục lạc vải mềm an toàn.',
  },
  {
    id: 'bm-6',
    month: 6,
    title: 'Tháng thứ 6: Tập ngồi vững & khởi đầu ăn dặm',
    description: 'Bé có thể tự lật thuần thục, giữ đầu thẳng, ngồi có điểm tựa và biểu lộ hứng thú với thức ăn của người lớn.',
    careFocus: 'Tham khảo bác sĩ/dinh dưỡng về dấu hiệu sẵn sàng ăn dặm bổ sung bên cạnh sữa mẹ/sữa công thức.',
  },
  {
    id: 'bm-9',
    month: 9,
    title: 'Tháng thứ 9–12: Bò, vịn đứng & bước đi đầu đời',
    description: 'Bé di chuyển linh hoạt khắp phòng, nhặt đồ vật bằng ngón cái và ngón trỏ, bập bẹ gọi "ba", "mẹ" và vẫy tay chào.',
    careFocus: 'Che góc nhọn bàn ghế, khóa ổ điện và đọc sách tranh vải cùng bé mỗi tối.',
  },
];

export const POSTPARTUM_MOM_CHECKLIST_ITEMS = [
  { id: 'pm-1', title: 'Theo dõi sản dịch giảm dần & thân nhiệt bình thường mỗi ngày' },
  { id: 'pm-2', title: 'Uống đủ 2.5–3 lít nước ấm để hỗ trợ phục hồi và tiết sữa' },
  { id: 'pm-3', title: 'Chợp mắt 15–30 phút khi bé ngủ, nhờ người thân đỡ việc nhà' },
  { id: 'pm-4', title: 'Đặt lịch tái khám hậu sản 6 tuần sau sinh cùng bác sĩ' },
];

export const POSTPARTUM_BABY_CHECKLIST_ITEMS = [
  { id: 'pb-1', title: 'Theo dõi cữ bú và lượng tã ướt (tối thiểu 6 tã/ngày sau tuần đầu)' },
  { id: 'pb-2', title: 'Giữ rốn khô thoáng và kiểm tra vàng da sinh lý dưới ánh sáng tự nhiên' },
  { id: 'pb-3', title: 'Cập nhật lịch tiêm chủng mở rộng & khám định kỳ tháng đầu cho bé' },
  { id: 'pb-4', title: 'Thực hành Tummy Time ngắn mỗi ngày khi bé tỉnh táo và có mẹ bên cạnh' },
];

export const POSTPARTUM_KNOWLEDGE_GUIDES = [
  {
    id: 'ppg-1',
    title: 'Dinh dưỡng lợi sữa cân bằng cho mẹ sau sinh',
    summary: 'Ưu tiên đa dạng đạm sạch, rau xanh đậm, ngũ cốc nguyên cám và uống nước ấm đều thay vì ăn kiêng quá mức.',
    source: 'Viện Dinh Dưỡng Quốc Gia & WHO',
  },
  {
    id: 'ppg-2',
    title: 'Nguyên tắc ngủ an toàn cho trẻ sơ sinh (Safe Sleep)',
    summary: 'Đặt bé nằm ngửa trên nệm phẳng vừa vặn, không đặt gối mềm hay chăn dày quanh mặt bé để phòng ngừa ngạt thở.',
    source: 'AAP & UNICEF Newborn Safety',
  },
  {
    id: 'ppg-3',
    title: 'Chăm sóc sức khỏe tinh thần mẹ sau sinh',
    summary: 'Đừng ngại nhờ chồng và gia đình chia sẻ ca đêm; nếu mệt mỏi kéo dài trên 14 ngày hãy trao đổi với bác sĩ.',
    source: 'Bộ Y tế Việt Nam · Hướng dẫn CSSK Bà mẹ Sau sinh',
  },
];

export const COMMUNITY_GROUPS: { id: CommunityGroupType; label: string; description: string }[] = [
  { id: 'all', label: 'Tất cả nhóm', description: 'Toàn bộ cộng đồng mẹ bầu Nova' },
  { id: 'weekly_group', label: 'Nhóm theo tuần thai', description: 'Chia sẻ cùng mẹ đồng hành tuần thai gần nhau' },
  { id: 'first_time', label: 'Mang thai lần đầu', description: 'Hỏi đáp bỡ ngỡ cho các mẹ tập đầu' },
  { id: 'birth_prep_group', label: 'Nhóm chuẩn bị sinh', description: 'Kinh nghiệm chọn bệnh viện & giỏ đồ đi sinh' },
  { id: 'postpartum_group', label: 'Nhóm sau sinh & em bé', description: 'Kinh nghiệm ở cữ khoa học & chăm sóc bé' },
];

export const COMMUNITY_GUIDELINES = [
  'Tôn trọng trải nghiệm riêng của từng mẹ bầu — không phán xét cách sinh thường hay sinh mổ, nuôi sữa mẹ hay sữa công thức.',
  'Không tự ý kê đơn thuốc, không quảng cáo thực phẩm chức năng chưa kiểm chứng hoặc thuốc truyền miệng.',
  'Bảo mật thông tin cá nhân, không đăng ảnh nhạy cảm hoặc thông tin bệnh án của người khác khi chưa được đồng ý.',
  'Sử dụng nút "Báo cáo" nếu phát hiện nội dung quấy rối, lừa đảo hoặc tư vấn y tế nguy hiểm để Moderator kịp thời xử lý.',
];

export const REWARD_BADGE_DEFINITIONS = [
  {
    id: 'badge-journey-start',
    title: 'Khởi đầu ấm áp',
    description: 'Hoàn thành thiết lập hành trình thai kỳ hoặc cập nhật cột mốc đầu tiên.',
    category: 'journey' as const,
  },
  {
    id: 'badge-care-water',
    title: 'Nhịp sống dịu dàng',
    description: 'Ghi nhận nhật ký chăm sóc sức khỏe hoặc nhắc nhở giúp mẹ đều đặn hơn.',
    category: 'care' as const,
  },
  {
    id: 'badge-checklist-5',
    title: 'Mẹ bầu chu đáo',
    description: 'Hoàn thành từ 5 mục trở lên trong Checklist chuẩn bị cho mẹ và bé.',
    category: 'checklist' as const,
  },
  {
    id: 'badge-memory-keeper',
    title: 'Người giữ ký ức',
    description: 'Lưu giữ ít nhất 1 kỷ niệm siêu âm, ảnh thai kỳ hoặc thư gửi em bé.',
    category: 'memories' as const,
  },
  {
    id: 'badge-community-heart',
    title: 'Sẻ chia yêu thương',
    description: 'Đăng bài viết, thả tim hoặc gửi bình luận động viên các mẹ khác.',
    category: 'community' as const,
  },
];

export const SHOP_COMBOS: ProductCombo[] = [
  {
    id: 'combo-tam-ca-2',
    title: 'Combo An Tâm Tam Cá Nguyệt 2',
    subtitle: 'Viên uống tổng hợp + Dầu massage rạn da + Gối ôm chữ U',
    productIds: ['prod-1', 'prod-2', 'prod-3'],
    comboPrice: 1290000,
    savingsAmount: 190000,
    badgeText: 'Tiết kiệm 190.000đ',
  },
  {
    id: 'combo-di-sinh-me-be',
    title: 'Combo Giỏ Đồ Đi Sinh Gọn Nhẹ',
    subtitle: 'Combo túi đi sinh mẹ & bé + Quấn chũn sơ sinh + Dung dịch vệ sinh sau sinh',
    productIds: ['prod-4', 'prod-8', 'prod-15'],
    comboPrice: 1090000,
    savingsAmount: 150000,
    badgeText: 'Tiết kiệm 150.000đ',
  },
];

export const AVAILABLE_COUPONS: CouponRule[] = [
  { code: 'MEBAU2026', label: 'Giảm 50.000đ cho đơn từ 300.000đ', type: 'fixed', value: 50000, minOrder: 300000 },
  { code: 'NOVAVIP', label: 'Giảm 15% tối đa 150.000đ cho thành viên Nova', type: 'percent', value: 15, minOrder: 200000 },
  { code: 'BESOSINH', label: 'Giảm 30.000đ cho đồ sơ sinh', type: 'fixed', value: 30000, minOrder: 150000 },
];
