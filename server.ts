import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import {
  ServerDataStore,
  RequestActor,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from './src/services/serverDataStore';
import { EcosystemStore, verifySessionToken } from './src/services/ecosystemStore';
import { UserRole } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '.data');
const UPLOAD_VIDEOS_DIR = path.resolve(__dirname, 'public', 'uploads', 'videos');
const UPLOAD_POSTERS_DIR = path.resolve(__dirname, 'public', 'uploads', 'posters');
const UPLOAD_IMAGES_DIR = path.resolve(__dirname, 'public', 'uploads', 'images');

for (const dir of [DATA_DIR, UPLOAD_VIDEOS_DIR, UPLOAD_POSTERS_DIR, UPLOAD_IMAGES_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const store = new ServerDataStore(DATA_DIR);
const ecosystem = new EcosystemStore(DATA_DIR);

class UnauthorizedError extends Error {
  status = 401;
}

function getInitials(name: string): string {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'NV'
  );
}

function extractActor(req: express.Request): RequestActor {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const verified = verifySessionToken(token);
    if (!verified) {
      throw new UnauthorizedError('Phiên đăng nhập không hợp lệ hoặc đã hết hạn.');
    }
    return {
      id: verified.id,
      name: verified.name,
      avatar: getInitials(verified.name),
      role: verified.role,
    };
  }

  // Fallback for non-authenticated or legacy client headers: NEVER accept unsigned admin/moderator roles
  const idHeader = (req.headers['x-user-id'] as string) || 'usr-1';
  const rawName = (req.headers['x-user-name'] as string) || 'Khánh Băng';
  let name = rawName;
  try {
    name = decodeURIComponent(rawName);
  } catch {
    name = rawName;
  }
  const role: UserRole = 'user';
  return {
    id: idHeader,
    name,
    avatar: getInitials(name),
    role,
  };
}

function handleApiError(res: express.Response, err: any) {
  if (err instanceof UnauthorizedError) {
    return res.status(401).json({ error: err.message });
  }
  if (err instanceof ForbiddenError) {
    return res.status(403).json({ error: err.message });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }
  console.error('[API Error]', err?.message || 'Internal Server Error');
  return res.status(500).json({ error: err?.message || 'Lỗi máy chủ nội bộ.' });
}

// Multer storage configs
const videoUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_VIDEOS_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
      cb(null, `nova-video-${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.mp4', '.webm', '.mov'];
    if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new ValidationError('Định dạng video không hợp lệ. Chỉ hỗ trợ MP4, WebM hoặc MOV.'));
    }
  },
});

const posterUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_POSTERS_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `nova-poster-${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
    if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new ValidationError('Định dạng ảnh không hợp lệ. Chỉ hỗ trợ JPG, PNG hoặc WebP.'));
    }
  },
});

const generalImageUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_IMAGES_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `nova-img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
    if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new ValidationError('Định dạng ảnh không hợp lệ. Chỉ hỗ trợ JPG, PNG hoặc WebP.'));
    }
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use('/uploads', express.static(path.resolve(__dirname, 'public', 'uploads')));

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

  // =========================================================================
  // POST /api/nova-chat: Server-side Gemini AI endpoint (Preserved)
  // =========================================================================
  app.post('/api/nova-chat', async (req, res) => {
    try {
      const { prompt, userContext, history, knowledgeContext, memoriesContext } = req.body;
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

      let systemInstruction = `# SYSTEM PROMPT — NOVA AI, TRỢ LÝ ĐỒNG HÀNH CÙNG MẸ BẦU

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
F. Sử dụng ứng dụng Nova Việt Mẫu: Giải thích cách dùng các chức năng theo dõi thai kỳ, ghi lượng nước, nhật ký và lịch khám.

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

      if (knowledgeContext && typeof knowledgeContext === 'string') {
        systemInstruction += `\n\n## 6. TÀI LIỆU Y KHOA ĐÃ ĐỐI CHIẾU (Trích xuất từ Bộ Y tế & WHO):\n${knowledgeContext}\n(Hãy dựa trên tài liệu trên để trả lời chuẩn xác và trích dẫn trung thực nguồn tài liệu này khi đưa ra hướng dẫn).`;
      }

      if (memoriesContext && typeof memoriesContext === 'string') {
        systemInstruction += `\n\n## 7. GHI NHỚ RIÊNG TƯ MẸ ĐÃ CHO PHÉP NOVA LƯU:\n${memoriesContext}`;
      }

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

  // =========================================================================
  // 1. REMINDERS API (Per-account isolation)
  // =========================================================================
  app.get('/api/reminders', (req, res) => {
    try {
      const actor = extractActor(req);
      const reminders = store.getReminders(actor.id);
      return res.json({ reminders });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.put('/api/reminders', (req, res) => {
    try {
      const actor = extractActor(req);
      const { reminders } = req.body || {};
      if (!Array.isArray(reminders)) {
        throw new ValidationError('Danh sách nhắc nhở không hợp lệ.');
      }
      const saved = store.saveReminders(actor.id, reminders);
      return res.json({ reminders: saved });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  // =========================================================================
  // 2. FILE UPLOAD & VIDEOS API
  // =========================================================================
  app.post('/api/upload/video', (req, res) => {
    videoUpload.single('file')(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'Dung lượng video vượt quá giới hạn tối đa 50MB.' });
        }
        return handleApiError(res, err);
      }
      if (!req.file) {
        return res.status(400).json({ error: 'Chưa chọn tệp video để tải lên.' });
      }
      return res.json({
        url: `/uploads/videos/${req.file.filename}`,
        size: req.file.size,
        mimeType: req.file.mimetype,
        originalName: req.file.originalname,
      });
    });
  });

  app.post('/api/upload/poster', (req, res) => {
    posterUpload.single('file')(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'Dung lượng ảnh bìa vượt quá giới hạn tối đa 5MB.' });
        }
        return handleApiError(res, err);
      }
      if (!req.file) {
        return res.status(400).json({ error: 'Chưa chọn tệp ảnh bìa để tải lên.' });
      }
      return res.json({
        url: `/uploads/posters/${req.file.filename}`,
        size: req.file.size,
        mimeType: req.file.mimetype,
      });
    });
  });

  app.post('/api/upload/image', (req, res) => {
    generalImageUpload.single('file')(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'Dung lượng ảnh vượt quá giới hạn tối đa 5MB.' });
        }
        return handleApiError(res, err);
      }
      if (!req.file) {
        return res.status(400).json({ error: 'Chưa chọn tệp ảnh để tải lên.' });
      }
      return res.json({
        url: `/uploads/images/${req.file.filename}`,
        size: req.file.size,
        mimeType: req.file.mimetype,
      });
    });
  });

  app.get('/api/videos', (req, res) => {
    try {
      const actor = extractActor(req);
      const scope = (req.query.scope as 'feed' | 'mine' | 'moderation') || 'feed';
      const videos = store.getVideos(actor.id, actor.role, scope);
      return res.json({ videos });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/videos', (req, res) => {
    try {
      const actor = extractActor(req);
      const video = store.createVideo(req.body || {}, actor);
      return res.status(201).json({ video });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.patch('/api/videos/:id', (req, res) => {
    try {
      const actor = extractActor(req);
      const video = store.updateVideo(req.params.id, req.body || {}, actor);
      return res.json({ video });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.patch('/api/videos/:id/moderate', (req, res) => {
    try {
      const actor = extractActor(req);
      const { status, rejectionReason } = req.body || {};
      const video = store.moderateVideo(req.params.id, status, rejectionReason, actor);
      ecosystem.appendAuditLog(actor, `moderate_video_${status}`, 'video', req.params.id, video.title);
      return res.json({ video });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.delete('/api/videos/:id', (req, res) => {
    try {
      const actor = extractActor(req);
      const result = store.deleteVideo(req.params.id, actor);
      if (result.videoUrl && result.videoUrl.startsWith('/uploads/videos/')) {
        const localFile = path.join(UPLOAD_VIDEOS_DIR, path.basename(result.videoUrl));
        if (fs.existsSync(localFile)) {
          try {
            fs.unlinkSync(localFile);
          } catch {}
        }
      }
      return res.json(result);
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/videos/:id/like', (req, res) => {
    try {
      const actor = extractActor(req);
      const video = store.toggleVideoLike(req.params.id, actor.id);
      return res.json({ video });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/videos/:id/comments', (req, res) => {
    try {
      const actor = extractActor(req);
      const { content } = req.body || {};
      const video = store.addVideoComment(req.params.id, actor, content);
      return res.status(201).json({ video });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  // =========================================================================
  // 3. COMMUNITY POSTS, REPLIES & NOTIFICATIONS API
  // =========================================================================
  app.get('/api/community/posts', (req, res) => {
    try {
      const actor = extractActor(req);
      const profile = ecosystem.getUserById(actor.id);
      const posts = store.getPosts(actor.id, profile?.blockedUserIds || []);
      return res.json({ posts });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/community/posts', (req, res) => {
    try {
      const actor = extractActor(req);
      const post = store.createPost(req.body || {}, actor);
      return res.status(201).json({ post });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/community/posts/:id/like', (req, res) => {
    try {
      const actor = extractActor(req);
      const post = store.togglePostLike(req.params.id, actor);
      return res.json({ post });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/community/posts/:id/comments', (req, res) => {
    try {
      const actor = extractActor(req);
      const { content, parentId } = req.body || {};
      const result = store.addPostComment(req.params.id, actor, content, parentId);
      return res.status(201).json(result);
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  // =========================================================================
  // 4. NOTIFICATIONS & PREFERENCES API
  // =========================================================================
  app.get('/api/notifications', (req, res) => {
    try {
      const actor = extractActor(req);
      const category = (req.query.category as string) || undefined;
      const notifications = store.getNotifications(actor.id, category);
      return res.json({ notifications });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.patch('/api/notifications/:id/read', (req, res) => {
    try {
      const actor = extractActor(req);
      const notifications = store.markNotificationRead(actor.id, req.params.id);
      return res.json({ notifications });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/notifications/read-all', (req, res) => {
    try {
      const actor = extractActor(req);
      const { category } = req.body || {};
      const notifications = store.markAllNotificationsRead(actor.id, category);
      return res.json({ notifications });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.delete('/api/notifications/:id', (req, res) => {
    try {
      const actor = extractActor(req);
      const notifications = store.deleteNotification(actor.id, req.params.id);
      return res.json({ notifications });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.get('/api/notifications/preferences', (req, res) => {
    try {
      const actor = extractActor(req);
      const preferences = store.getPreferences(actor.id);
      return res.json({ preferences });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.put('/api/notifications/preferences', (req, res) => {
    try {
      const actor = extractActor(req);
      const preferences = store.updatePreferences(actor.id, req.body || {});
      return res.json({ preferences });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  // =========================================================================
  // 5. SHOP PRODUCT REVIEWS API (Real User Reviews Only)
  // =========================================================================
  app.get('/api/shop/reviews', (req, res) => {
    try {
      const productId = req.query.productId as string | undefined;
      if (productId) {
        return res.json(store.getProductReviews(productId));
      }
      const all = store.getAllReviews();
      const summary: Record<string, { rating?: number; reviewsCount: number }> = {};
      for (const [pid, list] of Object.entries(all)) {
        if (Array.isArray(list) && list.length > 0) {
          const avg = list.reduce((s, r) => s + r.rating, 0) / list.length;
          summary[pid] = {
            rating: Math.round(avg * 10) / 10,
            reviewsCount: list.length,
          };
        }
      }
      return res.json({ reviewsMap: all, summary });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/shop/reviews', (req, res) => {
    try {
      const actor = extractActor(req);
      const { productId, rating, comment } = req.body || {};
      if (!productId) throw new ValidationError('Thiếu mã sản phẩm.');
      const result = store.addProductReview(productId, actor, Number(rating), comment);
      return res.status(201).json(result);
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  // =========================================================================
  // 6. AUTH SESSIONS & PRIVACY (Modules 17 & 18)
  // =========================================================================
  app.post('/api/auth/session', (req, res) => {
    try {
      const profile = req.body?.profile;
      if (!profile?.id) throw new ValidationError('Thiếu thông tin tài khoản.');
      const result = ecosystem.upsertUserSessionProfile(profile);
      return res.json(result);
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.patch('/api/privacy/settings', (req, res) => {
    try {
      const actor = extractActor(req);
      const updated = ecosystem.updatePrivacyAndPrefs(actor.id, req.body || {});
      return res.json({ user: updated });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.get('/api/privacy/export', (req, res) => {
    try {
      const actor = extractActor(req);
      const bundle = ecosystem.exportUserEcosystemData(actor.id);
      return res.json({ exportData: bundle });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.delete('/api/privacy/account', (req, res) => {
    try {
      const actor = extractActor(req);
      const result = ecosystem.deleteAccountData(actor.id, actor);
      return res.json(result);
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  // =========================================================================
  // 7. JOURNEY, MEMORIES, CHECKLIST, DIARY & REMINDER HISTORY (Modules 1-4)
  // =========================================================================
  app.get('/api/journey', (req, res) => {
    try {
      const actor = extractActor(req);
      return res.json({ journey: ecosystem.getJourneyState(actor.id) });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/journey/milestone', (req, res) => {
    try {
      const actor = extractActor(req);
      const journey = ecosystem.toggleMilestoneWeek(actor.id, Number(req.body?.week));
      ecosystem.evaluateAndUnlockRewards(actor.id);
      return res.json({ journey });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/journey/due-date', (req, res) => {
    try {
      const actor = extractActor(req);
      const journey = ecosystem.recordDueDateAdjustment(actor.id, req.body || {});
      ecosystem.evaluateAndUnlockRewards(actor.id);
      return res.json({ journey });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.get('/api/memories', (req, res) => {
    try {
      const actor = extractActor(req);
      return res.json({ memories: ecosystem.getMemories(actor.id) });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/memories', (req, res) => {
    try {
      const actor = extractActor(req);
      const memory = ecosystem.createMemory(actor.id, req.body || {});
      ecosystem.evaluateAndUnlockRewards(actor.id);
      return res.status(201).json({ memory });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.patch('/api/memories/:id', (req, res) => {
    try {
      const actor = extractActor(req);
      const memory = ecosystem.updateMemory(actor.id, req.params.id, req.body || {}, actor);
      return res.json({ memory });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.delete('/api/memories/:id', (req, res) => {
    try {
      const actor = extractActor(req);
      return res.json(ecosystem.deleteMemory(actor.id, req.params.id, actor));
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.get('/api/checklists', (req, res) => {
    try {
      const actor = extractActor(req);
      return res.json({ items: ecosystem.getChecklists(actor.id) });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/checklists', (req, res) => {
    try {
      const actor = extractActor(req);
      const item = ecosystem.createChecklistItem(actor.id, req.body || {});
      return res.status(201).json({ item });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.patch('/api/checklists/:id', (req, res) => {
    try {
      const actor = extractActor(req);
      const item = ecosystem.updateChecklistItem(actor.id, req.params.id, req.body || {}, actor);
      ecosystem.evaluateAndUnlockRewards(actor.id);
      return res.json({ item });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.delete('/api/checklists/:id', (req, res) => {
    try {
      const actor = extractActor(req);
      return res.json(ecosystem.deleteChecklistItem(actor.id, req.params.id, actor));
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.get('/api/diary', (req, res) => {
    try {
      const actor = extractActor(req);
      return res.json({
        entries: ecosystem.getDiaryEntries(actor.id),
        reminderHistory: ecosystem.getReminderHistory(actor.id),
      });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.put('/api/diary/:date', (req, res) => {
    try {
      const actor = extractActor(req);
      const entry = ecosystem.upsertDiaryEntry(actor.id, req.params.date, req.body?.entry);
      ecosystem.evaluateAndUnlockRewards(actor.id);
      return res.json({ entry });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.delete('/api/diary/:date', (req, res) => {
    try {
      const actor = extractActor(req);
      return res.json(ecosystem.deleteDiaryDate(actor.id, req.params.date));
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/reminders/history', (req, res) => {
    try {
      const actor = extractActor(req);
      const history = ecosystem.appendReminderHistory(actor.id, req.body || {});
      return res.status(201).json({ history });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  // =========================================================================
  // 8. WEEKLY, LIBRARY, VIDEO PLAYLISTS & COMMUNITY SOCIAL (Modules 5, 6, 7, 11)
  // =========================================================================
  app.get('/api/library', (req, res) => {
    try {
      const actor = extractActor(req);
      const includeAll = req.query.includeAll === 'true';
      const articles = ecosystem.getKnowledgeArticles(actor.role, includeAll);
      const state = ecosystem.getUserKnowledgeState(actor.id);
      return res.json({ articles, state });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/library', (req, res) => {
    try {
      const actor = extractActor(req);
      const article = ecosystem.createKnowledgeArticle(req.body || {}, actor);
      return res.status(201).json({ article });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.patch('/api/library/:id/moderate', (req, res) => {
    try {
      const actor = extractActor(req);
      const article = ecosystem.moderateKnowledgeArticle(req.params.id, req.body?.status, actor);
      return res.json({ article });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/library/state', (req, res) => {
    try {
      const actor = extractActor(req);
      const state = ecosystem.updateUserKnowledgeState(actor.id, req.body || {});
      return res.json({ state });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.get('/api/videos/library', (req, res) => {
    try {
      const actor = extractActor(req);
      return res.json(ecosystem.getVideoLibraryState(actor.id));
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/videos/:id/favorite', (req, res) => {
    try {
      const actor = extractActor(req);
      return res.json({ favoriteVideoIds: ecosystem.toggleVideoFavorite(actor.id, req.params.id) });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/videos/:id/progress', (req, res) => {
    try {
      const actor = extractActor(req);
      const { progressSec, durationSec } = req.body || {};
      return res.json({
        watchHistory: ecosystem.recordVideoProgress(
          actor.id,
          req.params.id,
          Number(progressSec || 0),
          Number(durationSec || 0)
        ),
      });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/videos/playlists', (req, res) => {
    try {
      const actor = extractActor(req);
      const { name, videoId } = req.body || {};
      return res.status(201).json({
        playlists: ecosystem.createVideoPlaylist(actor.id, name || '', videoId),
      });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/videos/playlists/:id/toggle', (req, res) => {
    try {
      const actor = extractActor(req);
      return res.json({
        playlists: ecosystem.toggleVideoInPlaylist(actor.id, req.params.id, req.body?.videoId),
      });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/community/posts/:id/bookmark', (req, res) => {
    try {
      const actor = extractActor(req);
      return res.json({ post: ecosystem.togglePostBookmark(req.params.id, actor.id) });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/community/posts/:id/hide', (req, res) => {
    try {
      const actor = extractActor(req);
      return res.json(ecosystem.hidePostForUser(req.params.id, actor.id));
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.patch('/api/community/posts/:id/moderate', (req, res) => {
    try {
      const actor = extractActor(req);
      const { status, isFeatured } = req.body || {};
      return res.json({ post: ecosystem.moderatePost(req.params.id, status, isFeatured, actor) });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/reports', (req, res) => {
    try {
      const actor = extractActor(req);
      const report = ecosystem.createContentReport(req.body || {}, actor);
      return res.status(201).json({ report });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  // =========================================================================
  // 9. FAMILY SHARING, BIRTH PLAN & POSTPARTUM/BABY (Modules 8, 9, 10)
  // =========================================================================
  app.get('/api/family', (req, res) => {
    try {
      const actor = extractActor(req);
      return res.json({ connections: ecosystem.getFamilyConnections(actor.id) });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/family/invite', (req, res) => {
    try {
      const actor = extractActor(req);
      const conn = ecosystem.createFamilyInvite(actor, req.body || {});
      return res.status(201).json({ connection: conn });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/family/join', (req, res) => {
    try {
      const actor = extractActor(req);
      const conn = ecosystem.joinFamilyByCode(req.body?.inviteCode || '', actor);
      store.sendExternalNotification({
        recipientId: conn.ownerId,
        title: `${actor.name} đã tham gia Nova Family`,
        description: `${actor.name} vừa kết nối theo mã mời chia sẻ hành trình thai kỳ.`,
        category: 'family',
        subType: 'family_invite',
        actorId: actor.id,
        actorName: actor.name,
        targetId: conn.id,
        isRead: false,
        actionScreen: 'family',
      });
      return res.json({ connection: conn });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.patch('/api/family/:id/permissions', (req, res) => {
    try {
      const actor = extractActor(req);
      const conn = ecosystem.updateFamilyPermissions(req.params.id, req.body?.permissions || {}, actor);
      if (conn.memberId && conn.status === 'active') {
        store.sendExternalNotification({
          recipientId: conn.memberId,
          title: `${actor.name} đã cập nhật chia sẻ gia đình`,
          description: 'Quyền xem lịch khám, checklist hoặc cột mốc thai kỳ đã được điều chỉnh.',
          category: 'family',
          subType: 'family_update',
          actorId: actor.id,
          actorName: actor.name,
          targetId: conn.id,
          dedupeKey: `family_update_${conn.id}`,
          isRead: false,
          actionScreen: 'family',
        });
      }
      return res.json({ connection: conn });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.delete('/api/family/:id', (req, res) => {
    try {
      const actor = extractActor(req);
      return res.json({ connection: ecosystem.revokeFamilyConnection(req.params.id, actor) });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.get('/api/family/:id/snapshot', (req, res) => {
    try {
      const actor = extractActor(req);
      return res.json({ snapshot: ecosystem.getSharedFamilySnapshot(req.params.id, actor) });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.get('/api/birth-plan', (req, res) => {
    try {
      const actor = extractActor(req);
      return res.json({ plan: ecosystem.getBirthPlan(actor.id) });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.put('/api/birth-plan', (req, res) => {
    try {
      const actor = extractActor(req);
      return res.json({ plan: ecosystem.saveBirthPlan(actor.id, req.body?.plan, actor) });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.get('/api/postpartum', (req, res) => {
    try {
      const actor = extractActor(req);
      return res.json({ state: ecosystem.getPostpartumState(actor.id) });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.put('/api/postpartum', (req, res) => {
    try {
      const actor = extractActor(req);
      const next = ecosystem.updatePostpartumState(actor.id, (curr) => ({
        ...curr,
        ...(req.body?.state || {}),
      }));
      return res.json({ state: next });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/postpartum/diary', (req, res) => {
    try {
      const actor = extractActor(req);
      return res.status(201).json({ state: ecosystem.addPostpartumDiary(actor.id, req.body || {}) });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/postpartum/care-log', (req, res) => {
    try {
      const actor = extractActor(req);
      return res.status(201).json({ state: ecosystem.addBabyCareLog(actor.id, req.body || {}) });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/postpartum/album', (req, res) => {
    try {
      const actor = extractActor(req);
      return res.status(201).json({ state: ecosystem.addBabyAlbumPhoto(actor.id, req.body || {}) });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  // =========================================================================
  // 10. SHOP CATALOG, WISHLIST, COUPONS, ORDERS & REWARDS (Modules 12 & 15)
  // =========================================================================
  app.get('/api/shop/products', (_req, res) => {
    try {
      return res.json({ products: ecosystem.getProducts() });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/shop/products', (req, res) => {
    try {
      const actor = extractActor(req);
      const product = ecosystem.upsertProduct(req.body || {}, actor);
      return res.status(201).json({ product });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.get('/api/shop/wishlist', (req, res) => {
    try {
      const actor = extractActor(req);
      return res.json({ wishlist: ecosystem.getWishlist(actor.id) });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/shop/wishlist/:productId', (req, res) => {
    try {
      const actor = extractActor(req);
      return res.json({ wishlist: ecosystem.toggleWishlist(actor.id, req.params.productId) });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/shop/coupon', (req, res) => {
    try {
      const { code, subtotal } = req.body || {};
      return res.json(ecosystem.validateCoupon(String(code || ''), Number(subtotal || 0)));
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.get('/api/shop/orders', (req, res) => {
    try {
      const actor = extractActor(req);
      const allFlag = req.query.all === 'true' && actor.role === 'admin' ? '*' : actor.id;
      return res.json({ orders: ecosystem.getOrders(allFlag, actor.role) });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/shop/orders', (req, res) => {
    try {
      const actor = extractActor(req);
      const order = ecosystem.createOrder(actor.id, req.body || {});
      store.sendExternalNotification({
        recipientId: actor.id,
        title: `Đơn hàng ${order.orderId} đã được ghi nhận`,
        description:
          order.paymentMethod === 'vietqr'
            ? 'Đơn hàng đang chờ xác minh chuyển khoản VietQR từ bộ phận quản trị.'
            : 'Đơn hàng COD đang chờ xác nhận đóng gói.',
        category: 'shop',
        subType: 'order_created',
        targetId: order.orderId,
        isRead: false,
        actionScreen: 'shop',
      });
      return res.status(201).json({ order });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.patch('/api/shop/orders/:orderId', (req, res) => {
    try {
      const actor = extractActor(req);
      const { status, paymentStatus } = req.body || {};
      const order = ecosystem.updateOrderStatus(req.params.orderId, status, paymentStatus, actor);
      if (order.userId) {
        store.sendExternalNotification({
          recipientId: order.userId,
          title: `Cập nhật đơn hàng ${order.orderId}`,
          description: `Trạng thái hiện tại: ${order.trackingHistory?.slice(-1)[0]?.label || status}`,
          category: 'shop',
          subType: 'order_updated',
          actorId: actor.id,
          actorName: actor.name,
          targetId: order.orderId,
          dedupeKey: `order_${order.orderId}_${status}`,
          isRead: false,
          actionScreen: 'shop',
        });
      }
      return res.json({ order });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.get('/api/rewards', (req, res) => {
    try {
      const actor = extractActor(req);
      return res.json({ badges: ecosystem.evaluateAndUnlockRewards(actor.id) });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  // =========================================================================
  // 11. ADMIN & MODERATOR DASHBOARD (Module 18)
  // =========================================================================
  app.get('/api/admin/overview', (req, res) => {
    try {
      const actor = extractActor(req);
      return res.json(ecosystem.getAdminOverview(actor));
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.patch('/api/admin/users/:id/role', (req, res) => {
    try {
      const actor = extractActor(req);
      const user = ecosystem.updateUserRole(req.params.id, req.body?.role, actor);
      return res.json({ user });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.patch('/api/admin/reports/:id', (req, res) => {
    try {
      const actor = extractActor(req);
      const { status, resolutionNote } = req.body || {};
      return res.json({
        report: ecosystem.resolveContentReport(req.params.id, status, resolutionNote, actor),
      });
    } catch (err) {
      return handleApiError(res, err);
    }
  });

  app.post('/api/admin/broadcast', (req, res) => {
    try {
      const actor = extractActor(req);
      if (actor.role !== 'admin') {
        throw new ForbiddenError('Chỉ Quản trị viên mới được gửi thông báo hệ thống.');
      }
      const { title, description } = req.body || {};
      if (!title?.trim() || !description?.trim()) {
        throw new ValidationError('Vui lòng nhập tiêu đề và nội dung thông báo.');
      }
      const users = ecosystem.getUsersDirectory();
      let sentCount = 0;
      for (const u of users) {
        if (u.id === actor.id) continue;
        store.sendExternalNotification({
          recipientId: u.id,
          title: title.trim(),
          description: description.trim(),
          category: 'system',
          subType: 'admin_broadcast',
          actorId: actor.id,
          actorName: actor.name,
          isRead: false,
          actionScreen: 'home',
        });
        sentCount++;
      }
      ecosystem.appendAuditLog(actor, 'admin_broadcast', 'system', 'all', `${title.trim()} (${sentCount} người nhận)`);
      return res.json({ sentCount });
    } catch (err) {
      return handleApiError(res, err);
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
