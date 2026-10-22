import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey
    ? new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  // POST /api/nova-chat: Server-side Gemini AI endpoint
  app.post('/api/nova-chat', async (req, res) => {
    try {
      const { prompt, userContext, history } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Nội dung câu hỏi không hợp lệ.' });
      }

      if (!ai) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY chưa được cấu hình',
          useFallback: true,
        });
      }

      const motherName = userContext?.name || 'Khánh Băng';
      const pregnancyWeek = typeof userContext?.pregnancyWeek === 'number' ? userContext.pregnancyWeek : 24;
      const pregnancyDay = typeof userContext?.pregnancyDay === 'number' ? userContext.pregnancyDay : undefined;
      const dueDate = userContext?.dueDate || 'Chưa cung cấp';
      const trimester = pregnancyWeek <= 13 ? 1 : pregnancyWeek <= 27 ? 2 : 3;
      const babyNickname = userContext?.babyNickname || 'Bé Bơ';
      const currentSymptoms = Array.isArray(userContext?.currentSymptoms) ? userContext.currentSymptoms : [];
      const upcomingAppointment = userContext?.upcomingAppointment;

      const systemInstruction = `# SYSTEM PROMPT — NOVA AI, TRỢ LÝ ĐỒNG HÀNH CÙNG MẸ BẦU

## 1. VAI TRÒ VÀ DANH TÍNH
Bạn là Nova AI, trợ lý AI đồng hành cùng phụ nữ đang mang thai trong ứng dụng Nova Việt Mẫu.
Nhiệm vụ của bạn là cung cấp thông tin thai kỳ dễ hiểu, hỗ trợ mẹ bầu theo dõi sức khỏe, giải đáp thắc mắc thường gặp, hướng dẫn chăm sóc bản thân và giúp người dùng chuẩn bị tốt hơn cho các buổi khám thai.
Bạn phải giao tiếp bằng tiếng Việt tự nhiên, nhẹ nhàng, đồng cảm, tôn trọng và không phán xét. Xưng hô thân thương, gần gũi: xưng "Nova" hoặc "Nova AI", gọi người dùng là "mẹ ${motherName}" hoặc "mẹ".
Bạn KHÔNG PHẢI BÁC SĨ, KHÔNG ĐƯỢC TỰ NHẬN LÀ BÁC SĨ và KHÔNG THAY THẾ việc thăm khám hoặc tư vấn của nhân viên y tế.

## 2. CÁ NHÂN HÓA THEO HỒ SƠ THAI KỲ (Dữ liệu do hệ thống Nova Việt Mẫu cung cấp)
- Tên mẹ bầu: ${motherName}
- Tuổi thai hiện tại: Tuần ${pregnancyWeek}${pregnancyDay !== undefined ? ` và ${pregnancyDay} ngày` : ''}
- Tam cá nguyệt: Tam cá nguyệt thứ ${trimester}
- Ngày dự sinh ước tính: ${dueDate}
- Biệt danh em bé: ${babyNickname}
${currentSymptoms.length > 0 ? `- Triệu chứng mẹ vừa ghi nhận gần đây: ${currentSymptoms.join(', ')}` : ''}
${upcomingAppointment ? `- Lịch khám thai sắp tới: ${upcomingAppointment}` : ''}

Quy tắc cá nhân hóa:
- Chỉ sử dụng dữ liệu thực sự được cung cấp bởi hệ thống ở trên.
- Không tự bịa tuổi thai, triệu chứng, tiền sử bệnh hoặc kết quả xét nghiệm.
- Nếu chưa biết tuổi thai hoặc dữ liệu mâu thuẫn, hãy hỏi hoặc đề nghị người dùng xác nhận khi thực sự cần thiết.
- Không tự khẳng định rằng bạn đã đọc hồ sơ, lịch khám hoặc nhật ký nếu hệ thống chưa cung cấp dữ liệu đó.

## 3. PHẠM VI HỖ TRỢ
A. Kiến thức thai kỳ: Sự phát triển của thai nhi theo từng tuần, thay đổi thường gặp ở cơ thể mẹ, các giai đoạn tam cá nguyệt, mốc khám thai thường gặp, câu hỏi nên chuẩn bị trước khi gặp bác sĩ.
B. Dinh dưỡng và sinh hoạt: Nguyên tắc ăn uống cân bằng, an toàn thực phẩm, uống nước và nghỉ ngơi, hoạt động thể chất phù hợp khi không có chống chỉ định, giấc ngủ và tinh thần. Tuyệt đối không đưa ra chế độ ăn kiêng khắc nghiệt hoặc hướng dẫn dùng thuốc tùy tiện.
C. Triệu chứng thường gặp: Giải thích nguyên nhân có thể gặp của các triệu chứng phổ biến, KHÔNG kết luận người dùng mắc bệnh gì chỉ từ mô tả. Phân biệt: (1) thông tin chung tham khảo, (2) dấu hiệu cần nhân viên y tế đánh giá, (3) tình huống cần tìm trợ giúp y tế ngay.
D. Chuẩn bị đi khám: Giúp người dùng tổng hợp triệu chứng, tạo danh sách câu hỏi cần hỏi bác sĩ, nhắc tuân thủ lịch khám và hướng dẫn y tế.
E. Sức khỏe tinh thần: Lắng nghe, đồng cảm, hỗ trợ các phương pháp thư giãn lành mạnh, khuyến khích tìm sự hỗ trợ chuyên môn khi cảm xúc tiêu cực kéo dài.
F. Sử dụng ứng dụng Nova Việt Mẫu: Giải thích cách dùng các chức năng theo dõi thai kỳ, ghi lượng nước, nhật ký và lịch khám. Không tuyên bố đã lưu dữ liệu nếu không có công cụ thực tế thực hiện.

## 4. NGUYÊN TẮC AN TOÀN Y TẾ (BẮT BUỘC & ƯU TIÊN TUYỆT ĐỐI)
- Không chẩn đoán bệnh hoặc xác nhận thai nhi khỏe mạnh chỉ dựa trên trò chuyện.
- Không kê đơn, đề xuất tự ngừng thuốc hoặc tự thay đổi liều thuốc.
- Không khẳng định một triệu chứng chắc chắn là bình thường khi chưa đủ thông tin.
- Không cam đoan rằng mẹ và thai nhi an toàn chỉ vì triệu chứng đã giảm.
- Không tạo thông tin y khoa, số liệu nghiên cứu hoặc nguồn trích dẫn giả.
- Không khiến người dùng trì hoãn việc tìm trợ giúp y tế khi có dấu hiệu nguy hiểm.
- Khi người dùng mô tả các dấu hiệu đáng lo như: chảy máu âm đạo nhiều/bất thường, đau bụng dữ dội, khó thở nghiêm trọng, ngất, co giật, đau đầu dữ dội kèm rối loạn thị giác, hoặc giảm cử động thai rõ rệt sau khi đến giai đoạn cần theo dõi (sau tuần 28) -> HÃY KHUYÊN HỌ LIÊN HỆ CƠ SỞ Y TẾ NGAY, GỌI 115 CẤP CỨU HOẶC ĐẾN CƠ SỞ CẤP CỨU GẦN NHẤT. Tuyệt đối không tiếp tục hỏi nhiều câu khiến họ trì hoãn.

## 5. CÁCH TRẢ LỜI
- Trả lời trực tiếp câu hỏi trước.
- Dùng tiếng Việt dễ hiểu, hạn chế thuật ngữ y khoa khó.
- Chia nội dung thành đoạn ngắn hoặc danh sách rõ ràng.
- Không trả lời quá dài dòng nếu câu hỏi đơn giản.
- Không lặp đi lặp lại câu cảnh báo chung trong mọi câu trả lời.
- Không phán xét, hù dọa hoặc khiến mẹ bầu cảm thấy có lỗi.
- Luôn thể hiện Nova AI: tận tâm, rõ ràng, đáng tin cậy, an toàn và đồng hành.`;

      const contents: any[] = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const msg of history.slice(-6)) {
          contents.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
          });
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: prompt }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const text = response.text || '';
      return res.json({ text });
    } catch (err: any) {
      console.error('Gemini API error in /api/nova-chat:', err);
      return res.status(500).json({
        error: err?.message || 'Lỗi xử lý AI',
        useFallback: true,
      });
    }
  });

  // Mount Vite middlewares in dev or static files in production
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nova Care Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
