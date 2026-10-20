import { PregnancyCalculationResult } from '../types';

/**
 * Bảng so sánh kích thước em bé theo tuần thai với các loại trái cây/hạt thân thuộc
 */
export const FRUIT_COMPARISONS: Record<
  number,
  {
    fruitName: string;
    fruitEmoji: string;
    sizeDescription: string;
    weightDescription: string;
    lengthDescription: string;
  }
> = {
  1: {
    fruitName: 'Tế bào thụ tinh',
    fruitEmoji: '✨',
    sizeDescription: 'Kính hiển vi',
    weightDescription: '< 0.1g',
    lengthDescription: '0.1 mm',
  },
  2: {
    fruitName: 'Phôi dâu nhỏ',
    fruitEmoji: '🔬',
    sizeDescription: 'Tập hợp tế bào',
    weightDescription: '< 0.1g',
    lengthDescription: '0.2 mm',
  },
  3: {
    fruitName: 'Hạt vani',
    fruitEmoji: '🌱',
    sizeDescription: 'Nhỏ như đầu kim',
    weightDescription: '< 0.1g',
    lengthDescription: '0.5 mm',
  },
  4: {
    fruitName: 'Hạt mè (vừng)',
    fruitEmoji: '🌰',
    sizeDescription: 'Hạt mè bé xíu',
    weightDescription: '< 1g',
    lengthDescription: '1 - 2 mm',
  },
  5: {
    fruitName: 'Hạt táo tây',
    fruitEmoji: '🍎',
    sizeDescription: 'Bằng hạt táo',
    weightDescription: '< 1g',
    lengthDescription: '3 - 5 mm',
  },
  6: {
    fruitName: 'Hạt đậu lăng',
    fruitEmoji: '🫘',
    sizeDescription: 'Như hạt đậu nhỏ',
    weightDescription: 'Khoảng 1g',
    lengthDescription: '5 - 8 mm',
  },
  7: {
    fruitName: 'Quả việt quất',
    fruitEmoji: '🫐',
    sizeDescription: 'Bằng quả việt quất',
    weightDescription: 'Khoảng 1g',
    lengthDescription: '10 - 13 mm',
  },
  8: {
    fruitName: 'Quả mâm xôi',
    fruitEmoji: '🍓',
    sizeDescription: 'Như quả mâm xôi mọng',
    weightDescription: 'Khoảng 1 - 2g',
    lengthDescription: '16 mm',
  },
  9: {
    fruitName: 'Quả ô liu xanh',
    fruitEmoji: '🫒',
    sizeDescription: 'Bằng quả ô liu',
    weightDescription: 'Khoảng 2 - 3g',
    lengthDescription: '23 mm',
  },
  10: {
    fruitName: 'Quả quất (tắc)',
    fruitEmoji: '🍊',
    sizeDescription: 'Bằng quả quất thơm',
    weightDescription: 'Khoảng 4g',
    lengthDescription: '31 mm',
  },
  11: {
    fruitName: 'Quả sung ngọt',
    fruitEmoji: '🍐',
    sizeDescription: 'Bằng quả sung nhỏ',
    weightDescription: 'Khoảng 7g',
    lengthDescription: '41 mm',
  },
  12: {
    fruitName: 'Quả chanh ta',
    fruitEmoji: '🍋',
    sizeDescription: 'Tròn đầy như quả chanh',
    weightDescription: 'Khoảng 14g',
    lengthDescription: '5.4 cm',
  },
  13: {
    fruitName: 'Quả đào tiên nhỏ',
    fruitEmoji: '🍑',
    sizeDescription: 'Bằng quả đào nhỏ',
    weightDescription: 'Khoảng 23g',
    lengthDescription: '7.4 cm',
  },
  14: {
    fruitName: 'Quả chanh vàng (Meyer)',
    fruitEmoji: '🍋',
    sizeDescription: 'Bằng chanh tây',
    weightDescription: 'Khoảng 43g',
    lengthDescription: '8.7 cm',
  },
  15: {
    fruitName: 'Quả táo ta',
    fruitEmoji: '🍏',
    sizeDescription: 'Bằng quả táo vừa',
    weightDescription: 'Khoảng 70g',
    lengthDescription: '10.1 cm',
  },
  16: {
    fruitName: 'Quả bơ sáp nhỏ',
    fruitEmoji: '🥑',
    sizeDescription: 'Vừa vặn trong lòng bàn tay',
    weightDescription: 'Khoảng 100g',
    lengthDescription: '11.6 cm',
  },
  17: {
    fruitName: 'Củ hành tây',
    fruitEmoji: '🧅',
    sizeDescription: 'Bằng củ hành tây tròn',
    weightDescription: 'Khoảng 140g',
    lengthDescription: '13 cm',
  },
  18: {
    fruitName: 'Quả ớt chuông đỏ',
    fruitEmoji: '🫑',
    sizeDescription: 'Bằng quả ớt chuông',
    weightDescription: 'Khoảng 190g',
    lengthDescription: '14.2 cm',
  },
  19: {
    fruitName: 'Quả cà chua to',
    fruitEmoji: '🍅',
    sizeDescription: 'Như quả cà chua căng mọng',
    weightDescription: 'Khoảng 240g',
    lengthDescription: '15.3 cm',
  },
  20: {
    fruitName: 'Quả chuối tiêu',
    fruitEmoji: '🍌',
    sizeDescription: 'Bằng một quả chuối chín',
    weightDescription: 'Khoảng 300g',
    lengthDescription: '16.4 cm',
  },
  21: {
    fruitName: 'Củ cà rốt lớn',
    fruitEmoji: '🥕',
    sizeDescription: 'Dài như củ cà rốt',
    weightDescription: 'Khoảng 360g',
    lengthDescription: '26.7 cm',
  },
  22: {
    fruitName: 'Quả đu đủ nhỏ',
    fruitEmoji: '🍈',
    sizeDescription: 'Bằng quả đu đủ non',
    weightDescription: 'Khoảng 430g',
    lengthDescription: '27.8 cm',
  },
  23: {
    fruitName: 'Quả xoài cát Hòa Lộc',
    fruitEmoji: '🥭',
    sizeDescription: 'Như quả xoài căng mọng',
    weightDescription: 'Khoảng 500g',
    lengthDescription: '28.9 cm',
  },
  24: {
    fruitName: 'Bắp ngô ngọt',
    fruitEmoji: '🌽',
    sizeDescription: 'Dài bằng bắp ngô thơm',
    weightDescription: 'Khoảng 600g',
    lengthDescription: '30 cm',
  },
  25: {
    fruitName: 'Củ cải ngọt',
    fruitEmoji: '🥔',
    sizeDescription: 'Bằng củ cải trắng',
    weightDescription: 'Khoảng 660g',
    lengthDescription: '34.6 cm',
  },
  26: {
    fruitName: 'Bó hành boa-rô',
    fruitEmoji: '🥬',
    sizeDescription: 'Thon dài khỏe khoắn',
    weightDescription: 'Khoảng 760g',
    lengthDescription: '35.6 cm',
  },
  27: {
    fruitName: 'Bông súp lơ xanh',
    fruitEmoji: '🥦',
    sizeDescription: 'Bằng một cây súp lơ',
    weightDescription: 'Khoảng 875g',
    lengthDescription: '36.6 cm',
  },
  28: {
    fruitName: 'Quả cà tím lớn',
    fruitEmoji: '🍆',
    sizeDescription: 'Bằng quả cà tím dài',
    weightDescription: 'Khoảng 1.0 kg',
    lengthDescription: '37.6 cm',
  },
  29: {
    fruitName: 'Quả bí hồ lô',
    fruitEmoji: '🎃',
    sizeDescription: 'Như quả bí ngô nhỏ',
    weightDescription: 'Khoảng 1.15 kg',
    lengthDescription: '38.6 cm',
  },
  30: {
    fruitName: 'Bắp cải thảo',
    fruitEmoji: '🥬',
    sizeDescription: 'Bằng bắp cải tròn',
    weightDescription: 'Khoảng 1.3 kg',
    lengthDescription: '39.9 cm',
  },
  31: {
    fruitName: 'Quả dừa xiêm',
    fruitEmoji: '🥥',
    sizeDescription: 'Bằng trái dừa xiêm',
    weightDescription: 'Khoảng 1.5 kg',
    lengthDescription: '41.1 cm',
  },
  32: {
    fruitName: 'Cây cần tây lớn',
    fruitEmoji: '🌿',
    sizeDescription: 'Dài và chắc chắn',
    weightDescription: 'Khoảng 1.7 kg',
    lengthDescription: '42.4 cm',
  },
  33: {
    fruitName: 'Quả dứa thơm chín',
    fruitEmoji: '🍍',
    sizeDescription: 'Bằng một quả dứa to',
    weightDescription: 'Khoảng 1.9 kg',
    lengthDescription: '43.7 cm',
  },
  34: {
    fruitName: 'Quả dưa lưới vàng',
    fruitEmoji: '🍈',
    sizeDescription: 'Bằng một trái dưa lưới',
    weightDescription: 'Khoảng 2.1 kg',
    lengthDescription: '45 cm',
  },
  35: {
    fruitName: 'Quả dưa lê tròn',
    fruitEmoji: '🍈',
    sizeDescription: 'Nặng và căng tròn',
    weightDescription: 'Khoảng 2.4 kg',
    lengthDescription: '46.2 cm',
  },
  36: {
    fruitName: 'Búp đu đủ chín',
    fruitEmoji: '🥭',
    sizeDescription: 'Gần chạm mốc đủ tháng',
    weightDescription: 'Khoảng 2.6 kg',
    lengthDescription: '47.4 cm',
  },
  37: {
    fruitName: 'Củ củ đậu lớn',
    fruitEmoji: '🥔',
    sizeDescription: 'Bé đã đủ tháng an toàn',
    weightDescription: 'Khoảng 2.9 kg',
    lengthDescription: '48.6 cm',
  },
  38: {
    fruitName: 'Cây bí đỏ tròn',
    fruitEmoji: '🎃',
    sizeDescription: 'Bé mũm mĩm đáng yêu',
    weightDescription: 'Khoảng 3.1 kg',
    lengthDescription: '49.8 cm',
  },
  39: {
    fruitName: 'Dưa hấu nhỏ',
    fruitEmoji: '🍉',
    sizeDescription: 'Sẵn sàng chào đời',
    weightDescription: 'Khoảng 3.3 kg',
    lengthDescription: '50.7 cm',
  },
  40: {
    fruitName: 'Quả dưa hấu căng tròn',
    fruitEmoji: '🍉',
    sizeDescription: 'Thiên thần nhỏ chào đời!',
    weightDescription: 'Khoảng 3.4 - 3.6 kg',
    lengthDescription: '51.2 cm',
  },
};

/**
 * Lấy so sánh quả theo tuần (mặc định lấy quả gần nhất nếu nằm ngoài dải)
 */
export function getFruitComparison(week: number) {
  const normalizedWeek = Math.max(1, Math.min(40, Math.floor(week || 12)));
  return (
    FRUIT_COMPARISONS[normalizedWeek] || {
      fruitName: 'Bé yêu đang lớn',
      fruitEmoji: '👶',
      sizeDescription: 'Đang phát triển từng ngày',
      weightDescription: '--',
      lengthDescription: '--',
    }
  );
}

/**
 * Định dạng ngày theo chuẩn Việt Nam DD/MM/YYYY
 */
export function formatDateVietnamese(dateInput: Date | string): string {
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '';
  }
}

/**
 * Chuyển đổi Date sang chuỗi ISO ngắn YYYY-MM-DD
 */
export function toISODateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Tính toán tuổi thai từ Ngày đầu kỳ kinh cuối (LMP)
 * Theo quy tắc Naegele:
 * - Chu kỳ trung bình 28 ngày
 * - Ngày dự sinh = LMP + 280 ngày
 * - Tuổi thai = Số ngày từ LMP đến hôm nay
 */
export function calculateFromLmp(
  lmpDateStr: string,
  asOfDate: Date = new Date()
): PregnancyCalculationResult {
  const lmpDate = new Date(lmpDateStr);
  if (isNaN(lmpDate.getTime())) {
    return getFallbackResult();
  }

  // Chuẩn hóa giờ về 0h để tính toán chính xác số ngày trọn vẹn
  const start = new Date(lmpDate.getFullYear(), lmpDate.getMonth(), lmpDate.getDate());
  const today = new Date(asOfDate.getFullYear(), asOfDate.getMonth(), asOfDate.getDate());

  const diffTime = today.getTime() - start.getTime();
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Dự sinh = LMP + 280 ngày
  const dueDateObj = new Date(start);
  dueDateObj.setDate(dueDateObj.getDate() + 280);

  const daysRemaining = Math.max(
    0,
    Math.floor((dueDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  );

  let isValid = true;
  let warningMessage: string | undefined = undefined;

  if (totalDays < 0) {
    isValid = false;
    warningMessage = 'Ngày kinh cuối không thể ở tương lai. Vui lòng kiểm tra lại.';
  } else if (totalDays > 300) {
    isValid = false;
    warningMessage = 'Tuổi thai tính được đã vượt quá 42 tuần. Vui lòng kiểm tra lại năm/tháng.';
  }

  const weeks = Math.max(1, Math.min(42, Math.floor(totalDays / 7)));
  const days = Math.max(0, totalDays % 7);
  const progressPercent = Math.min(100, Math.max(0, Math.round((totalDays / 280) * 100)));

  const trimester: 1 | 2 | 3 = weeks <= 13 ? 1 : weeks <= 27 ? 2 : 3;

  return {
    weeks,
    days,
    totalDays,
    dueDate: toISODateString(dueDateObj),
    daysRemaining,
    progressPercent,
    trimester,
    fruitComparison: getFruitComparison(weeks),
    isValid,
    warningMessage,
  };
}

/**
 * Tính toán tuổi thai từ Ngày dự sinh bác sĩ / siêu âm chỉ định (EDD)
 * - Tuổi thai = 280 ngày - (Ngày dự sinh - Hôm nay)
 */
export function calculateFromEdd(
  eddDateStr: string,
  asOfDate: Date = new Date()
): PregnancyCalculationResult {
  const eddDate = new Date(eddDateStr);
  if (isNaN(eddDate.getTime())) {
    return getFallbackResult();
  }

  const today = new Date(asOfDate.getFullYear(), asOfDate.getMonth(), asOfDate.getDate());
  const target = new Date(eddDate.getFullYear(), eddDate.getMonth(), eddDate.getDate());

  const daysRemaining = Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = 280 - daysRemaining;

  let isValid = true;
  let warningMessage: string | undefined = undefined;

  if (daysRemaining < -14) {
    isValid = false;
    warningMessage = 'Ngày dự sinh đã qua hơn 2 tuần. Vui lòng cập nhật thông tin mới nhất.';
  } else if (daysRemaining > 290) {
    isValid = false;
    warningMessage = 'Ngày dự sinh quá xa so với thời gian thai kỳ thông thường (280 ngày).';
  }

  const weeks = Math.max(1, Math.min(42, Math.floor(totalDays / 7)));
  const days = Math.max(0, totalDays % 7);
  const progressPercent = Math.min(100, Math.max(0, Math.round((totalDays / 280) * 100)));
  const trimester: 1 | 2 | 3 = weeks <= 13 ? 1 : weeks <= 27 ? 2 : 3;

  return {
    weeks,
    days,
    totalDays,
    dueDate: toISODateString(target),
    daysRemaining: Math.max(0, daysRemaining),
    progressPercent,
    trimester,
    fruitComparison: getFruitComparison(weeks),
    isValid,
    warningMessage,
  };
}

/**
 * Tính toán tuổi thai từ kết quả siêu âm:
 * - Tuổi thai hôm nay = (Tuổi thai ngày siêu âm) + (Số ngày từ ngày siêu âm đến hôm nay)
 */
export function calculateFromUltrasound(
  scanDateStr: string,
  weeksAtScan: number,
  daysAtScan: number = 0,
  asOfDate: Date = new Date()
): PregnancyCalculationResult {
  const scanDate = new Date(scanDateStr);
  if (isNaN(scanDate.getTime())) {
    return getFallbackResult();
  }

  const today = new Date(asOfDate.getFullYear(), asOfDate.getMonth(), asOfDate.getDate());
  const scan = new Date(scanDate.getFullYear(), scanDate.getMonth(), scanDate.getDate());

  const daysSinceScan = Math.floor((today.getTime() - scan.getTime()) / (1000 * 60 * 60 * 24));
  const scanDaysTotal = weeksAtScan * 7 + daysAtScan;
  const totalDays = scanDaysTotal + daysSinceScan;

  // Dự sinh = Ngày siêu âm + (280 - scanDaysTotal) ngày
  const remainingAtScan = 280 - scanDaysTotal;
  const dueDateObj = new Date(scan);
  dueDateObj.setDate(dueDateObj.getDate() + remainingAtScan);

  const daysRemaining = Math.max(
    0,
    Math.floor((dueDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  );

  let isValid = true;
  let warningMessage: string | undefined = undefined;

  if (daysSinceScan < 0) {
    isValid = false;
    warningMessage = 'Ngày siêu âm không thể ở tương lai.';
  }

  const weeks = Math.max(1, Math.min(42, Math.floor(totalDays / 7)));
  const days = Math.max(0, totalDays % 7);
  const progressPercent = Math.min(100, Math.max(0, Math.round((totalDays / 280) * 100)));
  const trimester: 1 | 2 | 3 = weeks <= 13 ? 1 : weeks <= 27 ? 2 : 3;

  return {
    weeks,
    days,
    totalDays,
    dueDate: toISODateString(dueDateObj),
    daysRemaining,
    progressPercent,
    trimester,
    fruitComparison: getFruitComparison(weeks),
    isValid,
    warningMessage,
  };
}

/**
 * Tính toán kết quả tổng hợp dựa trên hồ sơ người dùng
 * Thứ tự ưu tiên lâm sàng:
 * 1. Ngày dự sinh của bác sĩ (EDD) nếu được người dùng chọn
 * 2. Siêu âm nếu có ngày khám & tuần thai lúc khám
 * 3. Ngày đầu kỳ kinh cuối (LMP)
 * 4. Mặc định tuần thai đã lưu trong profile
 */
export function getPregnancySummary(
  profile: {
    calculationMethod?: string;
    lmpDate?: string;
    dueDate?: string;
    ultrasoundDate?: string;
    ultrasoundWeeks?: number;
    ultrasoundDays?: number;
    pregnancyWeek?: number;
    pregnancyDay?: number;
  },
  asOfDate: Date = new Date()
): PregnancyCalculationResult {
  const method = profile.calculationMethod;

  if (method === 'edd' && profile.dueDate) {
    return calculateFromEdd(profile.dueDate, asOfDate);
  }

  if (
    method === 'ultrasound' &&
    profile.ultrasoundDate &&
    profile.ultrasoundWeeks !== undefined &&
    profile.ultrasoundWeeks > 0
  ) {
    return calculateFromUltrasound(
      profile.ultrasoundDate,
      profile.ultrasoundWeeks,
      profile.ultrasoundDays || 0,
      asOfDate
    );
  }

  if (profile.lmpDate) {
    return calculateFromLmp(profile.lmpDate, asOfDate);
  }

  if (profile.dueDate) {
    return calculateFromEdd(profile.dueDate, asOfDate);
  }

  // Fallback nếu người dùng chỉ nhập số tuần thủ công
  const weeks = profile.pregnancyWeek || 12;
  const days = profile.pregnancyDay || 0;
  const totalDays = weeks * 7 + days;
  const progressPercent = Math.min(100, Math.max(0, Math.round((totalDays / 280) * 100)));
  const daysRemaining = Math.max(0, 280 - totalDays);

  const fallbackDueDate = new Date(asOfDate);
  fallbackDueDate.setDate(fallbackDueDate.getDate() + daysRemaining);

  return {
    weeks,
    days,
    totalDays,
    dueDate: toISODateString(fallbackDueDate),
    daysRemaining,
    progressPercent,
    trimester: weeks <= 13 ? 1 : weeks <= 27 ? 2 : 3,
    fruitComparison: getFruitComparison(weeks),
    isValid: true,
  };
}

function getFallbackResult(): PregnancyCalculationResult {
  return {
    weeks: 12,
    days: 0,
    totalDays: 84,
    dueDate: '2026-10-15',
    daysRemaining: 196,
    progressPercent: 30,
    trimester: 1,
    fruitComparison: getFruitComparison(12),
    isValid: false,
    warningMessage: 'Dữ liệu ngày chưa hợp lệ.',
  };
}
