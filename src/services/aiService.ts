import { GoogleGenAI } from '@google/genai';

// Intelligent medical and maternal care knowledge base for instant empathetic replies
const PREGNANCY_KNOWLEDGE: { keywords: string[]; response: string }[] = [
  {
    keywords: ['mỏi lưng', 'đau lưng', 'lưng'],
    response:
      'Mẹ Khánh Băng ơi, hiện tượng mỏi lưng ở tuần thứ 12 là rất bình thường! Khi tử cung phát triển và nâng lên khỏi khung chậu, trọng tâm cơ thể mẹ dịch chuyển về phía trước khiến cơ lưng dưới phải làm việc nhiều hơn. Ngoài ra, hormone Relaxin bắt đầu làm giãn các dây chằng xương chậu.\n\nLời khuyên cho mẹ:\n1. Kê một chiếc gối ôm chữ U hoặc gối mỏng giữa 2 đầu gối khi nằm nghiêng sang trái.\n2. Tránh đứng hoặc ngồi một tư thế quá 30 phút; hãy đi lại nhẹ nhàng.\n3. Thực hiện động tác "con mèo - con bò" (Cat-Cow Pose) 5-10 phút mỗi tối để giải tỏa áp lực cột sống mẹ nhé!',
  },
  {
    keywords: ['ăn gì', 'dinh dưỡng', 'thực đơn', 'món ăn', 'bồi bổ'],
    response:
      'Giai đoạn tuần 12 là thời điểm thai nhi hoàn thiện các cơ quan chính và não bộ phát triển vượt bậc. Mẹ nên chú trọng 4 nhóm chất vàng:\n\n• Axit Folic & Sắt: Có nhiều trong rau bina, bông cải xanh, thịt bò, lòng đỏ trứng để ngăn ngừa dị tật ống thần kinh và thiếu máu.\n• Canxi: 1.000mg/ngày từ sữa chua tiệt trùng, phô mai hoặc hạt mè để hình thành khung xương cho con.\n• DHA & Omega-3: Hạt óc chó, hạt chia, cá hồi nấu chín kỹ giúp bé thông minh sáng mắt.\n• Uống đủ 2 - 2.5 lít nước lọc hoặc nước ấm mỗi ngày mẹ nha!',
  },
  {
    keywords: ['nghén', 'buồn nôn', 'hết nghén', 'nôn'],
    response:
      'Hết nghén ở tuần 12 là dấu hiệu đáng mừng mẹ nhé! Lúc này nồng độ hormone hCG bắt đầu đạt đỉnh và dần ổn định, bánh rau đã tiếp quản việc nuôi dưỡng thai nhi nên cơ thể mẹ sẽ bớt mệt mỏi và cảm thấy dễ chịu hơn rất nhiều.\n\nNếu mẹ vẫn còn nghén nhẹ:\n- Chia nhỏ làm 5-6 bữa ăn trong ngày.\n- Nhấm nháp vài lát gừng tươi ngâm mật ong hoặc bánh quy giòn vào buổi sáng sớm trước khi rời giường.',
  },
  {
    keywords: ['siêu âm', 'đo độ mờ da gáy', 'khám', 'nt', 'nipt', 'double test'],
    response:
      'Mốc 11 tuần đến 13 tuần 6 ngày là "MỐC VÀNG" quan trọng nhất của tam cá nguyệt thứ nhất!\n\nBác sĩ sẽ tiến hành:\n1. Siêu âm đo độ mờ da gáy (NT): Giúp tầm soát sớm hội chứng Down và các bất thường nhiễm sắc thể.\n2. Kết hợp xét nghiệm sàng lọc Double Test hoặc NIPT để có kết quả chính xác lên đến 99%.\n3. Quan sát các ngón tay, ngón chân, vách tim và cột sống của bé.\n\nMẹ hãy nhớ giữ tinh thần thật thoải mái và đến đúng hẹn 15:00 ngày mai nhé!',
  },
  {
    keywords: ['uống nước', 'nước ối', 'khát'],
    response:
      'Nước ối ở tuần 12 đang tăng trưởng nhanh chóng để tạo không gian êm ái cho bé nhào lộn! Uống đủ 2 - 2.5 lít nước mỗi ngày giúp tăng thể tích máu lưu thông đến nhau thai, giảm táo bón thai kỳ và phòng ngừa nhiễm trùng đường tiết niệu. Mẹ hãy đặt chuông nhắc uống từng ngụm nhỏ cách mỗi 1 giờ nhé!',
  },
  {
    keywords: ['ngủ', 'tư thế ngủ', 'nằm nghiêng', 'mất ngủ'],
    response:
      'Tư thế ngủ lý tưởng nhất cho mẹ bầu từ tam cá nguyệt này là NẰM NGHIÊNG BÊN TRÁI. Tư thế này giúp tĩnh mạch chủ dưới không bị tử cung chèn ép, tối ưu hóa lưu lượng máu và oxy truyền đến thai nhi và thận của mẹ.\n\nMẹo ngủ ngon:\n- Đặt một chiếc gối dưới bụng và một gối kẹp giữa hai chân.\n- Nghe nhạc sóng não Alpha hoặc nhạc cổ điển êm dịu 15 phút trước khi ngủ.',
  },
];

export async function askNovaAI(userQuestion: string): Promise<string> {
  const query = userQuestion.trim();
  if (!query) return 'Mẹ ơi, Nova luôn ở đây lắng nghe mẹ. Mẹ hãy hỏi Nova bất cứ điều gì nhé!';

  // Check if Gemini API key exists
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `Bạn là Trợ lý ảo Nova - một người bạn đồng hành và cố vấn y khoa thai kỳ ân cần, ấm áp, khoa học, chuyên nghiệp dành cho mẹ bầu Khánh Băng (đang ở thai kỳ tuần thứ 12).
Hãy trả lời bằng tiếng Việt với giọng văn ngọt ngào, thấu cảm, đầy tình mẫu tử, chuẩn y khoa từ bác sĩ sản khoa.
Đưa ra lời khuyên thiết thực, ngắn gọn, dễ hiểu, có gạch đầu dòng rõ ràng, không làm mẹ hoang mang.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: query,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      if (response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to specialized clinical knowledge base:', err);
    }
  }

  // Intelligent clinical matching
  const lowerQuery = query.toLowerCase();
  for (const item of PREGNANCY_KNOWLEDGE) {
    if (item.keywords.some((kw) => lowerQuery.includes(kw))) {
      return item.response;
    }
  }

  // Default empathetic clinical reply
  return `Nova đã lắng nghe mẹ Khánh Băng. Ở tuần thứ 12 của thai kỳ, cơ thể mẹ đang có những bước chuyển mình kỳ diệu để tạo tổ ấm hoàn hảo nhất cho con yêu.\n\nLời khuyên cho mẹ:\n• Lắng nghe cơ thể: Hãy nghỉ ngơi ngay khi thấy mệt và không làm việc quá sức.\n• Bổ sung đủ vi chất: Tiếp tục uống viên sắt, canxi và axit folic theo hướng dẫn của bác sĩ.\n• Giữ tinh thần an nhiên: Trò chuyện và xoa bụng nhẹ nhàng để gắn kết tình mẫu tử với bé.\n\nNếu mẹ cảm thấy đau bụng quặn, ra huyết hoặc sốt, mẹ hãy liên hệ ngay với bác sĩ sản khoa nhé. Nova luôn đồng hành bên mẹ!`;
}
