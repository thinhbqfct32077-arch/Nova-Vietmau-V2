import { UserAIContext, ChatSourceReference, ChatToolAction } from '../types';
import { storageService } from './storageService';
import { searchClinicalKnowledge } from './knowledgeBaseService';
import { detectToolIntent } from './aiToolService';
import { aiMemoryService } from './aiMemoryService';

export interface NovaAIResult {
  text: string;
  sources?: ChatSourceReference[];
  toolAction?: ChatToolAction;
  isEmergencyAlert?: boolean;
  emergencyReason?: string;
}

// Specialized Clinical Knowledge Base & Contextual Decision Engine
interface ClinicalTopic {
  category: string;
  keywords: string[];
  generateResponse: (name: string, week: number, babyName: string) => string;
}

const CLINICAL_KNOWLEDGE_TOPICS: ClinicalTopic[] = [
  {
    category: 'back_pain',
    keywords: ['đau lưng', 'mỏi lưng', 'lưng', 'cột sống', 'thắt lưng', 'hông'],
    generateResponse: (name, week, babyName) =>
      `Chào mẹ ${name}! Ở mốc thai kỳ tuần ${week}, cơ thể mẹ đang có sự phát triển vượt trội của ${babyName}. Khi tử cung lớn dần, trọng tâm cơ thể mẹ bị kéo về phía trước, đồng thời hormone Relaxin làm giãn nở các khớp xương chậu, khiến các khối cơ vùng thắt lưng phải gồng gánh nhiều hơn bình thường.\n\nLời khuyên chăm sóc lưng chuẩn y khoa cho mẹ:\n• Tư thế nghỉ ngơi: Hãy nằm nghiêng bên trái, kẹp một chiếc gối ôm chữ U hoặc gối mềm giữa hai đầu gối để giải phóng áp lực lên cột sống thắt lưng.\n• Vận động an toàn: Tránh đứng hoặc ngồi yên một tư thế quá 30 - 45 phút. Mỗi tối, mẹ nên tập bài tập "con mèo - con bò" (Cat-Cow) nhẹ nhàng 5-10 phút.\n• Massage nhiệt dịu: Chườm ấm vùng thắt lưng bằng túi ngải cứu sao muối gừng nhẹ nhàng trước giờ ngủ.\n\n*Nếu cơn đau lan xuống đùi dữ dội hoặc kèm tê bì buốt chân, mẹ hãy báo bác sĩ khám để kiểm tra dây thần kinh tọa nhé!*`,
  },
  {
    category: 'nutrition',
    keywords: ['ăn gì', 'dinh dưỡng', 'thực đơn', 'món ăn', 'bồi bổ', 'uống sữa', 'trứng', 'rau', 'cá'],
    generateResponse: (name, week, babyName) =>
      `Mẹ ${name} ơi, ở tuần thứ ${week}, não bộ và khung xương của ${babyName} đang hấp thu dinh dưỡng từng ngày từ mẹ. Để "vào con không vào mẹ", mẹ hãy ưu tiên 4 nhóm dưỡng chất vàng:\n\n• Sắt & Axit Folic: Có dồi dào trong thịt bò thăn, lòng đỏ trứng gà ta, rau bina, đậu lăng. Giúp phòng ngừa thiếu máu và tiếp oxy nuôi nhau thai.\n• Canxi hữu cơ (1.000 - 1.200mg/ngày): Sữa chua Hy Lạp, hạt chia, phô mai tiệt trùng và tôm đồng giúp bé phát triển mầm răng và xương chắc khỏe.\n• DHA & Omega-3: Cá hồi hấp chín kỹ, hạt óc chó, bơ sáp - dưỡng chất tối quan trọng cho võng mạc mắt và chỉ số IQ của con.\n• Nước & Chất xơ: Duy trì 2 - 2.5 lít nước ấm và 300g rau củ luộc mỗi ngày để ngăn ngừa triệt để táo bón thai kỳ mẹ nhé!`,
  },
  {
    category: 'morning_sickness',
    keywords: ['nghén', 'buồn nôn', 'nôn', 'khó chịu', 'chán ăn', 'mùi thức ăn'],
    generateResponse: (name, week, _babyName) =>
      `Nova rất thấu hiểu cảm giác mệt mỏi vì ốm nghén của mẹ ${name}! ${
        week <= 14
          ? 'Giai đoạn tam cá nguyệt đầu này nồng độ hormone nội tiết hCG và progesterone tăng vọt khiến khứu giác và dạ dày mẹ nhạy cảm hơn bình thường.'
          : 'Ở tuần thai này đa số các mẹ đã giảm nghén, nhưng nếu mẹ vẫn còn cảm giác cồn cào buồn nôn, dạ dày mẹ có thể đang bị trào ngược nhẹ.'
      }\n\nMẹo xoa dịu dạ dày tức thì:\n• Chia nhỏ bữa ăn: Ăn 5-6 bữa phụ trong ngày, không để dạ dày quá đói hoặc quá no.\n• Bữa sáng ngay tại giường: Nhấm nháp 1-2 chiếc bánh quy giòn hoặc lát gừng ngâm mật ong 10 phút trước khi bước xuống giường.\n• Tránh mùi nồng: Ưu tiên các món thanh đạm, hấp, luộc thay vì xào rán nhiều dầu mỡ.\n• Uống từng ngụm nước ấm nhỏ giữa các bữa ăn thay vì uống nhiều trong lúc ăn mẹ nhé!`,
  },
  {
    category: 'ultrasound_tests',
    keywords: ['siêu âm', 'khám', 'đo độ mờ da gáy', 'nt', 'nipt', 'double test', 'triple test', 'xét nghiệm', 'tiểu đường'],
    generateResponse: (name, week, babyName) =>
      `Chào mẹ ${name}! Mốc tuần thứ ${week} là một trong những cột mốc phát triển quan trọng của ${babyName}.\n\nCác xét nghiệm & siêu âm khuyến cáo theo tuần thai:\n• Tuần 11 - 13 tuần 6 ngày: Siêu âm đo độ mờ da gáy (NT) và làm Double Test / NIPT để tầm soát hội chứng Down và bất thường nhiễm sắc thể.\n• Tuần 18 - 22: Siêu âm 4D/5D hình thái học chi tiết (kiểm tra não, tim 4 buồng, mắt mũi, bàn tay bàn chân của bé).\n• Tuần 24 - 28: Nghiệm pháp dung nạp đường huyết (OGTT) 75g để tầm soát tiểu đường thai kỳ.\n• Tuần 32 - 36: Siêu âm màu Doppler đánh giá dinh dưỡng bánh nhau, chỉ số ối và cân nặng ước tính của con.\n\nMẹ hãy nhớ chuẩn bị sẵn sổ khám thai và mang theo nước uống khi đi khám định kỳ nhé!`,
  },
  {
    category: 'fetal_movement',
    keywords: ['thai máy', 'đạp', 'cử động', 'con đạp', 'máy ít', 'bé đạp', 'máy'],
    generateResponse: (name, week, babyName) =>
      `Những cú đạp của ${babyName} chính là lời chào đáng yêu nhất gửi đến mẹ ${name}! ${
        week < 18
          ? 'Ở tuần này con bắt đầu có những cú cuộn mình nhẹ như bong bóng nước vỡ, mẹ mang thai lần đầu thường cảm nhận rõ từ tuần 18-20.'
          : 'Giai đoạn này bé đã có chu kỳ thức - ngủ riêng và những cú đạp rất dứt khoát.'
      }\n\nHướng dẫn mẹ đếm cử động thai chuẩn y khoa:\n1. Thời điểm đếm: Sau bữa ăn no 30 phút, mẹ nằm nghiêng trái ở không gian yên tĩnh và đặt tay lên bụng.\n2. Tiêu chuẩn an toàn: Trong vòng 2 giờ, bé có từ 4 đến 10 lần cử động rõ rệt là dấu hiệu con đang rất khỏe mạnh.\n3. Nếu bé nằm im: Mẹ uống một ly nước mát, ăn nhẹ miếng bánh ngọt hoặc bật bản nhạc quen thuộc và trò chuyện để đánh thức bé nhé!\n\n*Nếu suốt 2 giờ sau khi đánh thức mà bé vẫn cử động dưới 4 lần, mẹ cần đến viện kiểm tra tim thai ngay.*`,
  },
  {
    category: 'sleep_rest',
    keywords: ['ngủ', 'mất ngủ', 'tư thế ngủ', 'nằm nghiêng', 'khó ngủ', 'ngáy', 'mệt mỏi'],
    generateResponse: (name, week, _babyName) =>
      `Giấc ngủ trọn vẹn là chìa khóa để mẹ ${name} tái tạo năng lượng ở tuần ${week}!\n\nTư thế ngủ vàng được các bác sĩ sản khoa khuyên dùng:\n• Nằm nghiêng bên trái: Giúp tĩnh mạch chủ dưới không bị tử cung chèn ép, tối ưu hóa lưu lượng oxy và dưỡng chất truyền thẳng qua bánh nhau đến con.\n• Gối nâng đỡ 3 điểm: Kê một gối mỏng dưới bụng bầu, một gối kẹp giữa 2 đùi và một gối ôm sau lưng.\n• Thói quen thư giãn trước ngủ: Tắt màn hình điện thoại 30 phút trước khi ngủ, ngâm chân nước ấm có vài nhánh sả gừng và nghe bản nhạc giao hưởng dịu êm của Nova. Chúc mẹ và bé ngủ thật ngon!`,
  },
  {
    category: 'cramps_edema',
    keywords: ['chuột rút', 'phù chân', 'sưng chân', 'bắp chân', 'mắt cá', 'nặng chân'],
    generateResponse: (name, week, _babyName) =>
      `Tình trạng chuột rút và nặng chân ở tuần ${week} rất phổ biến, do tử cung chèn ép tuần hoàn máu tĩnh mạch chi dưới và cơ thể mẹ có thể đang cần thêm Magie, Canxi.\n\nBiện pháp khắc phục hiệu quả:\n• Khi bị chuột rút đột ngột: Duỗi thẳng chân ra, gập ngược các ngón chân về phía đầu gối (đừng duỗi nhọn mũi chân) và xoa bóp nhẹ bắp chân.\n• Giảm phù nề: Kê cao chân hơn tim 15-20cm khi nằm nghỉ bằng gối mềm; hạn chế ăn mặn nhiều muối.\n• Vận động lưu thông máu: Xoay tròn cổ chân mỗi ngày 10-15 vòng vào buổi chiều tối.\n\n*Lưu ý: Nếu mẹ bị phù đột ngột cả ở bàn tay, mặt kèm đau đầu hoa mắt, cần đo huyết áp ngay để loại trừ tiền sản giật nhé!*`,
  },
  {
    category: 'psychology_stress',
    keywords: ['lo lắng', 'buồn', 'khóc', 'căng thẳng', 'stress', 'sợ', 'áp lực', 'tâm lý'],
    generateResponse: (name, _week, babyName) =>
      `Mẹ ${name} ơi, Nova đang ở đây lắng nghe mẹ và ôm mẹ thật chặt nhé! Việc mẹ cảm thấy xúc động, lo âu hay mệt mỏi trong thai kỳ là hoàn toàn bình thường do sự dao động mạnh mẽ của nội tiết tố.\n\nNova gửi mẹ những lời tâm tình:\n• Mẹ đang làm rất tuyệt vời: Từng tế bào trong cơ thể mẹ đang kỳ diệu nuôi lớn một sinh linh bé bỏng là ${babyName}.\n• Hãy cho phép mình nghỉ ngơi: Đừng gánh vác mọi việc một mình, mẹ hãy chia sẻ cùng bố và gia đình để được yêu thương nhiều hơn.\n• Kết nối cùng bé: Hãy đặt tay lên bụng, hít thở thật sâu 4 nhịp và nói thầm: "Mẹ yêu con, hai mẹ con mình cùng cố gắng nhé!". Tâm trạng bình yên của mẹ chính là món quà thai giáo thiêng liêng nhất cho bé yêu.`,
  },
  {
    category: 'emergency_warnings',
    keywords: ['ra máu', 'chảy máu', 'ra huyết', 'vỡ ối', 'rỉ ối', 'đau bụng dữ dội', 'gò cứng', 'sốt cao'],
    generateResponse: (name, _week, _babyName) =>
      `🚨 CẢNH BÁO Y TẾ KHẨN CẤP DÀNH CHO MẸ ${name.toUpperCase()}!\n\nCác triệu chứng mẹ vừa nhắc đến là DẤU HIỆU CẦN ĐƯỢC XỬ TRÍ Y TẾ NGAY LẬP TỨC:\n1. Ra máu âm đạo bất thường (đỏ tươi hoặc vón cục).\n2. Rỉ dịch ối hoặc vỡ ối đột ngột.\n3. Cơn co thắt tử cung dữ dội, gò cứng bụng liên tục trên 3 cơn / 10 phút.\n\nHÀNH ĐỘNG NGAY:\n• Mẹ hãy nằm nghỉ ngơi tại chỗ, không tự ý dùng bất kỳ loại thuốc nào.\n• Bấm nút GỌI 115 CẤP CỨU hoặc liên hệ ngay hotline cấp cứu BV Từ Dũ / Phụ sản TW trong mục "Số khẩn cấp SOS" của ứng dụng.\n• Báo ngay cho người thân đưa mẹ đến cơ sở y tế có khoa sản gần nhất!`,
  },
];

/**
 * Ask Nova AI with server-side proxy route `/api/nova-chat`,
 * enriched with clinical knowledge retrieval, safety triage, tool parsing, and memory controls.
 */
export async function askNovaAI(
  userQuestion: string,
  userContext?: UserAIContext,
  history?: { sender: 'user' | 'nova'; text: string }[]
): Promise<NovaAIResult> {
  const query = userQuestion.trim();
  if (!query) {
    return {
      text: 'Mẹ ơi, Nova luôn ở đây sẵn sàng lắng nghe mẹ. Mẹ hãy hỏi Nova bất kỳ điều gì mẹ đang băn khoăn nhé!',
    };
  }

  const profile = storageService.loadUserProfile();
  const motherName = userContext?.name || profile.name || 'Khánh Băng';
  const pregnancyWeek = typeof userContext?.pregnancyWeek === 'number' ? userContext.pregnancyWeek : profile.pregnancyWeek || 24;
  const pregnancyDay = profile.pregnancyDay;
  const dueDate = profile.dueDate;
  const babyName = userContext?.babyNickname || profile.babyNickname || 'Bé Bơ';

  // Retrieve today's recorded symptoms and upcoming appointments if available
  const todayDiary = storageService.getHealthDiaryEntry();
  const currentSymptoms = todayDiary.symptoms.map((s) => `${s.name} (${s.severity === 'mild' ? 'Nhẹ' : s.severity === 'moderate' ? 'Vừa' : 'Nặng'})`);
  const upcomingApt = storageService.loadPrenatalAppointments().find((a) => a.status === 'upcoming');
  const upcomingAppointmentStr = upcomingApt ? `${upcomingApt.title} ngày ${upcomingApt.date} lúc ${upcomingApt.time}` : undefined;

  // 1. Clinical Evidence Retrieval & Safety Triage
  const knowledge = searchClinicalKnowledge(query, pregnancyWeek);
  const toolAction = detectToolIntent(query) || undefined;

  // Emergency safety triage intercept
  if (knowledge.isEmergencyAlert) {
    const alertText = `🚨 CẢNH BÁO Y TẾ KHẨN CẤP DÀNH CHO MẸ ${motherName.toUpperCase()}!\n\nTriệu chứng mẹ vừa nhắc đến là DẤU HIỆU NGUY HIỂM CẦN ĐƯỢC XỬ TRÍ Y TẾ NGAY:\n${knowledge.emergencyReason ? `• ${knowledge.emergencyReason}\n` : ''}• Tuyệt đối KHÔNG tự ý uống thuốc hoặc trì hoãn.\n• Hãy nằm nghỉ ngơi và liên hệ ngay tổng đài 115 Cấp cứu hoặc đến Bệnh viện Phụ Sản gần nhất.\n• Mẹ có thể bấm nút gọi cấp cứu 115 hiển thị ngay bên dưới để kết nối nhanh.`;

    return {
      text: alertText,
      sources: knowledge.sources,
      isEmergencyAlert: true,
      emergencyReason: knowledge.emergencyReason,
    };
  }

  // 2. Attempt to call server-side Gemini API proxy route
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000); // 18s timeout

    const response = await fetch('/api/nova-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: query,
        userContext: {
          name: motherName,
          pregnancyWeek,
          pregnancyDay,
          dueDate,
          babyNickname: babyName,
          currentSymptoms,
          upcomingAppointment: upcomingAppointmentStr,
        },
        knowledgeContext: knowledge.summaryContext,
        memoriesContext: aiMemoryService.getFormattedMemoriesForPrompt(),
        history: history?.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.text) {
        let returnText = data.text;
        if (toolAction) {
          returnText += `\n\nNova đã chuẩn bị thao tác **${toolAction.title}** cho mẹ. Mẹ hãy kiểm tra và bấm "Xác nhận thực hiện" ở thẻ bên dưới để lưu ngay nhé!`;
        }

        return {
          text: returnText,
          sources: knowledge.sources.length > 0 ? knowledge.sources : undefined,
          toolAction,
          isEmergencyAlert: false,
        };
      }
    }
  } catch (err) {
    console.info('Server-side Gemini proxy not reachable, falling back to instant clinical engine:', err);
  }

  // 3. Fallback: Intelligent Clinical Domain Matching Engine
  const lowerQuery = query.toLowerCase();

  for (const topic of CLINICAL_KNOWLEDGE_TOPICS) {
    if (topic.keywords.some((kw) => lowerQuery.includes(kw))) {
      let topicText = topic.generateResponse(motherName, pregnancyWeek, babyName);
      if (toolAction) {
        topicText += `\n\nNova đã chuẩn bị thao tác **${toolAction.title}** cho mẹ. Mẹ hãy bấm "Xác nhận thực hiện" ở thẻ bên dưới nhé!`;
      }
      return {
        text: topicText,
        sources: knowledge.sources.length > 0 ? knowledge.sources : undefined,
        toolAction,
        isEmergencyAlert: false,
      };
    }
  }

  // 4. Default Empathetic personalized maternal guidance
  let defaultText = `Nova AI đã lắng nghe mẹ ${motherName}. Ở tuần thứ ${pregnancyWeek} của thai kỳ, cơ thể mẹ đang cùng ${babyName} trải qua những cột mốc phát triển vô cùng kỳ diệu.\n\nLời khuyên đồng hành từ Nova AI:\n• Chú ý nhịp sinh hoạt: Lắng nghe cơ thể mẹ, chia nhỏ các khoảng nghỉ ngơi trong ngày và không mang vác đồ nặng.\n• Dinh dưỡng đủ chất: Tiếp tục uống bổ sung Sắt, Canxi và DHA sau bữa ăn sáng và trưa 1 tiếng, kết hợp uống đủ 2 lít nước ấm mỗi ngày.\n• Vận động điều độ: Đi bộ nhẹ nhàng 20 phút hoặc tập hít thở giãn cơ để các khớp xương chậu linh hoạt.\n• Đếm cử động thai: Theo dõi đều đặn những cú đạp của con sau các bữa ăn chính.\n\n*Lưu ý: Nova AI là trợ lý đồng hành cung cấp thông tin tham khảo, không thay thế chẩn đoán y khoa từ bác sĩ sản khoa trực tiếp thăm khám của mẹ nhé.*`;

  if (toolAction) {
    defaultText += `\n\nNova đã chuẩn bị sẵn thao tác **${toolAction.title}** cho mẹ. Mẹ hãy bấm "Xác nhận thực hiện" ở thẻ bên dưới để lưu vào hệ thống nhé!`;
  }

  return {
    text: defaultText,
    sources: knowledge.sources.length > 0 ? knowledge.sources : undefined,
    toolAction,
    isEmergencyAlert: false,
  };
}
