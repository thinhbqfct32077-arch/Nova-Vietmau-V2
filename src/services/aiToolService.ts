import { ChatToolAction, ToolActionType } from '../types';
import { storageService, getTodayDateString } from './storageService';

/**
 * Detects if user prompt intends to trigger a concrete tool action in Nova Care
 */
export function detectToolIntent(prompt: string): ChatToolAction | null {
  const p = prompt.toLowerCase();

  // 1. Log water intake: "ghi 250ml nước", "uống 300ml nước", "vừa uống 1 cốc nước"
  if (
    (p.includes('nước') && (p.includes('ghi') || p.includes('uống') || p.includes('thêm') || p.includes('lưu'))) ||
    p.includes('ml nước')
  ) {
    let amount = 250;
    const match = prompt.match(/(\d+)\s*(ml|lít|lit|l)/i);
    if (match) {
      const val = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      if (unit.startsWith('l')) {
        amount = Math.round(val * 1000);
      } else {
        amount = Math.round(val);
      }
    } else if (p.includes('cốc') || p.includes('ly')) {
      amount = 250;
    } else if (p.includes('bình') || p.includes('chai')) {
      amount = 500;
    }

    if (amount > 0 && amount <= 3000) {
      return {
        id: `tool-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        tool: 'log_water',
        title: 'Ghi nhận lượng nước uống',
        description: `Bổ sung ${amount}ml nước vào sổ theo dõi hôm nay`,
        data: { amountMl: amount, note: 'Ghi nhanh qua Trợ lý Nova AI' },
        status: 'pending_confirmation',
      };
    }
  }

  // 2. Add Symptom to Today's Health Diary: "lưu triệu chứng", "ghi triệu chứng đau lưng"
  if (
    (p.includes('triệu chứng') && (p.includes('lưu') || p.includes('ghi') || p.includes('nhật ký'))) ||
    p.includes('ghi vào nhật ký') ||
    p.includes('lưu vào nhật ký')
  ) {
    let symptomName = 'Mệt mỏi thai kỳ';
    let severity: 'mild' | 'moderate' | 'severe' = 'mild';

    if (p.includes('nặng') || p.includes('dữ dội') || p.includes('nhiều')) {
      severity = 'severe';
    } else if (p.includes('vừa') || p.includes('khá')) {
      severity = 'moderate';
    }

    const commonSymptoms = [
      'đau lưng',
      'đau thắt lưng',
      'buồn nôn',
      'ốm nghén',
      'ợ nóng',
      'trào ngược',
      'chuột rút',
      'phù chân',
      'khó ngủ',
      'mất ngủ',
      'táo bón',
      'chóng mặt',
    ];

    for (const sym of commonSymptoms) {
      if (p.includes(sym)) {
        symptomName = sym.charAt(0).toUpperCase() + sym.slice(1);
        break;
      }
    }

    return {
      id: `tool-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      tool: 'add_symptom',
      title: 'Ghi nhận triệu chứng vào nhật ký',
      description: `Lưu triệu chứng: "${symptomName}" (Mức độ: ${severity === 'mild' ? 'Nhẹ' : severity === 'moderate' ? 'Vừa' : 'Nặng'}) vào Sổ nhật ký hôm nay`,
      data: { name: symptomName, severity, notes: 'Ghi nhận qua trợ lý Nova AI' },
      status: 'pending_confirmation',
    };
  }

  // 3. Create Prenatal Appointment: "tạo lịch khám", "đặt lịch khám", "nhắc lịch khám thai"
  if (
    (p.includes('lịch khám') || p.includes('khám thai') || p.includes('đi khám')) &&
    (p.includes('tạo') || p.includes('đặt') || p.includes('lên lịch') || p.includes('nhắc'))
  ) {
    // Extract date if mentioned or default to upcoming Saturday
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const dateStr = getTodayDateString(nextWeek);

    let aptTitle = 'Khám thai định kỳ theo dõi sức khỏe';
    if (p.includes('4d') || p.includes('hình thái')) aptTitle = 'Siêu âm 4D hình thái học thai nhi';
    else if (p.includes('độ mờ da gáy') || p.includes('12')) aptTitle = 'Siêu âm đo độ mờ da gáy & Double Test';
    else if (p.includes('tiểu đường') || p.includes('ogtt')) aptTitle = 'Nghiệm pháp dung nạp đường huyết (OGTT)';
    else if (p.includes('doppler') || p.includes('32')) aptTitle = 'Siêu âm màu Doppler & Tim thai';

    let hospital = 'Bệnh viện Phụ Sản';
    if (p.includes('từ dũ')) hospital = 'Bệnh viện Phụ Sản Từ Dũ';
    else if (p.includes('phụ sản trung ương') || p.includes('sản tw')) hospital = 'Bệnh viện Phụ Sản Trung Ương';
    else if (p.includes('hùng vương')) hospital = 'Bệnh viện Hùng Vương';

    return {
      id: `tool-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      tool: 'create_appointment',
      title: 'Đặt lịch khám thai mới',
      description: `${aptTitle} tại ${hospital} vào ngày ${dateStr} (09:00)`,
      data: {
        title: aptTitle,
        date: dateStr,
        time: '09:00',
        hospitalOrClinic: hospital,
        notes: 'Được hỗ trợ tạo lịch bởi Nova AI',
      },
      status: 'pending_confirmation',
    };
  }

  // 4. Create Health Reminder: "nhắc uống sắt", "nhắc tập yoga", "nhắc uống nước"
  if (p.includes('nhắc') && (p.includes('uống') || p.includes('tập') || p.includes('lúc'))) {
    let time = '08:00';
    const timeMatch = prompt.match(/(\d{1,2})[:h](\d{2})?/i);
    if (timeMatch) {
      const h = parseInt(timeMatch[1], 10).toString().padStart(2, '0');
      const m = timeMatch[2] ? timeMatch[2] : '00';
      time = `${h}:${m}`;
    }

    let title = 'Nhắc nhở sức khỏe thai kỳ';
    let cat: 'water' | 'pill' | 'yoga' | 'custom' = 'custom';
    if (p.includes('sắt') || p.includes('canxi') || p.includes('thuốc')) {
      title = 'Uống viên vi chất dinh dưỡng';
      cat = 'pill';
    } else if (p.includes('yoga') || p.includes('thể dục') || p.includes('đi bộ')) {
      title = 'Vận động & Yoga thư giãn cho mẹ';
      cat = 'yoga';
    } else if (p.includes('nước')) {
      title = 'Uống cốc nước ấm thanh lọc';
      cat = 'water';
    }

    return {
      id: `tool-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      tool: 'create_reminder',
      title: 'Tạo lời nhắc nhở hàng ngày',
      description: `Nhắc "${title}" mỗi ngày lúc ${time}`,
      data: {
        title,
        time,
        category: cat,
        frequency: 'daily',
        notes: 'Thiết lập tự động qua Nova AI',
      },
      status: 'pending_confirmation',
    };
  }

  return null;
}

/**
 * Executes confirmed tool actions on local storage and triggers notifications
 */
export function executeToolAction(
  action: ChatToolAction
): { success: boolean; message: string; recordId?: string } {
  try {
    switch (action.tool) {
      case 'log_water': {
        const amountMl = Number(action.data.amountMl) || 250;
        const note = action.data.note || 'Ghi nhận qua Nova AI';
        const updated = storageService.addWaterLog(amountMl, note);
        return {
          success: true,
          message: `Đã ghi nhận thành công ${amountMl}ml nước! Tổng lượng nước hôm nay của mẹ: ${updated.currentMl}/${updated.targetMl} ml.`,
          recordId: updated.logs[0]?.id,
        };
      }

      case 'create_appointment': {
        const apt = storageService.addPrenatalAppointment({
          title: action.data.title || 'Khám thai định kỳ',
          date: action.data.date || getTodayDateString(),
          time: action.data.time || '09:00',
          hospitalOrClinic: action.data.hospitalOrClinic || 'Bệnh viện Sản Phụ Khoa',
          doctorName: action.data.doctorName,
          notes: action.data.notes,
          status: 'upcoming',
          questions: [
            { id: `q-${Date.now()}-1`, question: 'Chỉ số cân nặng và chiều dài bé có đúng chuẩn tuần thai?', isAnswered: false },
            { id: `q-${Date.now()}-2`, question: 'Mẹ cần lưu ý thêm về chế độ ăn hoặc thuốc bổ không?', isAnswered: false },
          ],
          reminderEnabled: true,
        });

        return {
          success: true,
          message: `Đã lưu lịch khám thai "${apt.title}" vào ngày ${apt.date} lúc ${apt.time} tại ${apt.hospitalOrClinic}.`,
          recordId: apt.id,
        };
      }

      case 'add_symptom': {
        const dateStr = getTodayDateString();
        const updated = storageService.addSymptomToDiary(dateStr, {
          name: action.data.name || 'Triệu chứng thai kỳ',
          severity: action.data.severity || 'mild',
          notes: action.data.notes,
        });

        return {
          success: true,
          message: `Đã lưu triệu chứng "${action.data.name}" vào Sổ nhật ký thai kỳ ngày hôm nay (${dateStr}).`,
          recordId: updated.symptoms[0]?.id,
        };
      }

      case 'create_reminder': {
        const rem = storageService.addHealthReminder({
          title: action.data.title || 'Nhắc nhở thai kỳ',
          category: action.data.category || 'custom',
          time: action.data.time || '08:00',
          frequency: action.data.frequency || 'daily',
          isEnabled: true,
          notes: action.data.notes,
        });

        return {
          success: true,
          message: `Đã kích hoạt lời nhắc "${rem.title}" lúc ${rem.time} mỗi ngày.`,
          recordId: rem.id,
        };
      }

      default:
        return {
          success: false,
          message: 'Công cụ không được hỗ trợ hoặc không tìm thấy hành động hợp lệ.',
        };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Không thể thực hiện hành động: ${err?.message || 'Lỗi không xác định'}`,
    };
  }
}
