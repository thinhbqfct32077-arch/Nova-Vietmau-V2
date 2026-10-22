import { CLINICAL_KNOWLEDGE_BASE, ClinicalKnowledgeDoc } from '../data/clinicalKnowledge';
import { PREGNANCY_MILESTONES } from '../data/pregnancyMilestones';
import { ChatSourceReference } from '../types';

export interface KnowledgeSearchResult {
  hasMatches: boolean;
  matchedDocs: ClinicalKnowledgeDoc[];
  sources: ChatSourceReference[];
  summaryContext: string;
  isEmergencyAlert: boolean;
  emergencyReason?: string;
}

// Emergency red flag detector
export function detectEmergencyTriage(query: string): { isEmergency: boolean; reason?: string; immediateAction?: string } {
  const q = query.toLowerCase();

  const emergencyPatterns = [
    {
      keywords: ['ra máu', 'chảy máu', 'ra huyết', 'xuất huyết'],
      reason: 'Ra máu âm đạo bất thường trong thai kỳ có thể là dấu hiệu dọa sinh non, nhau tiền đạo hoặc nhau bong non.',
    },
    {
      keywords: ['vỡ ối', 'rỉ ối', 'chảy nước ối', 'bể ối', 'ra nước ồ ạt'],
      reason: 'Rỉ ối hoặc vỡ ối làm tăng nguy cơ nhiễm trùng tử cung và chuyển dạ sớm.',
    },
    {
      keywords: ['đau bụng dữ dội', 'gò cứng bụng liên tục', 'bụng cứng như gỗ', 'cơn gò dồn dập', 'đau quặn', 'quặn bụng', 'quặn dữ dội', 'đau quặn dữ dội'],
      reason: 'Cơn co thắt tử cung dữ dội hoặc bụng gò cứng liên tục có thể là dấu hiệu nhau bong non hoặc chuyển dạ cấp tính.',
    },
    {
      keywords: ['co giật', 'ngất', 'bất tỉnh', 'hôn mê'],
      reason: 'Co giật hoặc bất tỉnh là dấu hiệu sản giật cực kỳ nguy hiểm đe dọa tính mạng mẹ và bé.',
    },
    {
      keywords: ['nhìn mờ', 'hoa mắt', 'đau đầu dữ dội không giảm', 'phù mặt đột ngột', 'phù tay đột ngột'],
      reason: 'Đau đầu dữ dội kèm hoa mắt, nhìn mờ và phù mặt đột ngột là dấu hiệu cảnh báo tiền sản giật nặng.',
    },
    {
      keywords: ['không đạp', 'máy ít hẳn', 'con không cử động', 'bé không cử động', 'không cử động', 'không thấy bé đạp', 'không thấy đạp', 'mất cử động thai'],
      reason: 'Thai nhi giảm cử động rõ rệt hoặc không đạp sau khi đã kích thích là dấu hiệu cảnh báo suy tuần hoàn nhau thai.',
    },
    {
      keywords: ['sốt cao co giật', 'sốt trên 39 độ', 'rét run khó thở'],
      reason: 'Sốt cao co giật hoặc khó thở cấp tính cần được xử trí y tế khẩn cấp.',
    },
  ];

  for (const pattern of emergencyPatterns) {
    if (pattern.keywords.some((kw) => q.includes(kw))) {
      return {
        isEmergency: true,
        reason: pattern.reason,
        immediateAction: 'Liên hệ ngay tổng đài cấp cứu 115 hoặc di chuyển khẩn cấp tới cơ sở y tế có chuyên khoa sản gần nhất.',
      };
    }
  }

  return { isEmergency: false };
}

/**
 * Searches verified medical guidelines matching the user query
 */
export function searchClinicalKnowledge(query: string, currentWeek?: number): KnowledgeSearchResult {
  const triage = detectEmergencyTriage(query);
  const q = query.toLowerCase();

  // Keyword token matching
  const matchedDocs: ClinicalKnowledgeDoc[] = [];

  for (const doc of CLINICAL_KNOWLEDGE_BASE) {
    let matchScore = 0;
    for (const kw of doc.keywords) {
      if (q.includes(kw)) {
        matchScore += 2;
      }
    }
    if (q.includes(doc.topic.toLowerCase())) {
      matchScore += 3;
    }
    if (matchScore > 0) {
      matchedDocs.push(doc);
    }
  }

  // Include current week milestone if asked about gestational age or development
  const weekNumber = currentWeek && currentWeek >= 1 && currentWeek <= 40 ? currentWeek : undefined;
  const isAskingMilestone = q.includes('tuần') || q.includes('phát triển') || q.includes('kích thước') || q.includes('mốc');

  const sources: ChatSourceReference[] = matchedDocs.map((doc) => ({
    id: doc.id,
    title: doc.title,
    source: doc.medicalSource,
    updatedDate: doc.updatedDate,
    excerpt: doc.summary,
  }));

  if (weekNumber && isAskingMilestone) {
    const milestone = PREGNANCY_MILESTONES[weekNumber];
    if (milestone) {
      sources.push({
        id: `milestone-week-${weekNumber}`,
        title: `Phát triển thai nhi và lưu ý tuần thai thứ ${weekNumber}`,
        source: milestone.medicalSource,
        updatedDate: '2024',
        excerpt: milestone.babyDevelopment,
      });
    }
  }

  const summaryContext = matchedDocs
    .map(
      (d) =>
        `[Nguồn tài liệu y khoa: ${d.medicalSource} (Cập nhật: ${d.updatedDate})]\nChủ đề: ${d.title}\nTóm tắt lâm sàng: ${d.evidenceBasedAdvice}`
    )
    .join('\n\n');

  return {
    hasMatches: matchedDocs.length > 0 || Boolean(weekNumber && isAskingMilestone),
    matchedDocs,
    sources,
    summaryContext,
    isEmergencyAlert: triage.isEmergency,
    emergencyReason: triage.reason,
  };
}
