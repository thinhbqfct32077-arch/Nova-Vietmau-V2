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
      const pregnancyWeek = userContext?.pregnancyWeek || 24;
      const babyNickname = userContext?.babyNickname || 'Bé Bơ';

      const systemInstruction = `Bạn là Trợ lý Ảo Nova - Bác sĩ sản khoa và chuyên gia tâm lý thai kỳ ân cần, ấm áp, thấu cảm và chuẩn xác y khoa.
Bạn đang trò chuyện và tư vấn trực tiếp cho mẹ bầu ${motherName}, hiện đang mang thai ở tuần thứ ${pregnancyWeek} (Biệt danh con yêu: ${babyNickname}).
Nguyên tắc tư vấn:
1. Xưng hô ngọt ngào, kính trọng và gần gũi: gọi "mẹ ${motherName}" hoặc "mẹ" và xưng "Nova".
2. Chuẩn mực y khoa sản phụ khoa: giải thích rõ ràng nguyên nhân triệu chứng sinh lý theo tuần thai thứ ${pregnancyWeek}.
3. Lời khuyên thiết thực: chia thành các gạch đầu dòng rõ ràng về dinh dưỡng, tư thế nghỉ ngơi, bài tập nhẹ nhàng và lưu ý an toàn.
4. Xoa dịu tâm lý: luôn khích lệ, động viên tinh thần mẹ bầu, giúp mẹ an tâm.
5. Cảnh báo an toàn: nếu có dấu hiệu nguy hiểm (ra máu, gò cứng bụng, rỉ dịch ối, sốt cao), dặn mẹ liên hệ ngay hotline cấp cứu 115 hoặc bác sĩ sản khoa.`;

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
