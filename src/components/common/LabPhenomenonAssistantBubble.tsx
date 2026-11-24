import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Lightbulb,
  X,
  Send,
  Sparkles,
  FlaskConical,
  Scale,
  Compass,
  Zap,
  Flame,
  AlertTriangle,
  History,
  CheckCircle2,
  Trash2,
  GripHorizontal,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import {
  generateSmartLocalAnswer,
  OFFICIAL_KHTN_678_ASSET_URI,
  sanitizeScientificText,
} from '../../services/khtnChatEngine';

export type PhenomenonCategory =
  | 'density-result'
  | 'mass-measurement'
  | 'volume-displacement'
  | 'liquid-state'
  | 'optics-phenomenon'
  | 'electromagnetism'
  | 'thermal-chemistry'
  | 'mechanics-metrology'
  | 'microscopy-biology'
  | 'measurement-error';

export interface ScientificPhenomenonEvent {
  id: string;
  timestamp: string;
  title: string;
  category: PhenomenonCategory;
  categoryLabel: string;
  observation: string;
  scientificExplanation: string;
  formula?: string;
  metrologyNote?: string;
  suggestedQuestions: string[];
  isWarningOrError?: boolean;
}

export interface AssistantReferenceSource {
  title: string;
  uri: string;
  domain: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  textbookRef?: string;
  sources?: AssistantReferenceSource[];
}

/**
 * SMART FILTER (Bộ lọc thông minh):
 * - Loại bỏ hoàn toàn các thao tác cơ bản, hiển nhiên (đặt dụng cụ lên bàn, nhấc lên, xoay 90°,
 *   cất vào tủ đựng đồ, đổi màn hình, đặt lại bàn, ghi hình...).
 * - Chỉ trả về `ScientificPhenomenonEvent` khi thực sự có hiện tượng Vật lý / Hóa học / Sinh học
 *   hoặc khi học sinh gặp sai số / đạt giá trị cấu hình quan trọng.
 */
export function classifyScientificPhenomenon(
  rawMessage: string,
  tone: 'info' | 'success' | 'warning' | 'error' = 'info',
): ScientificPhenomenonEvent | null {
  const msg = rawMessage.trim();
  if (!msg) return null;

  // 1. LỌC BỎ THAO TÁC CƠ BẢN / HIỂN NHIÊN (Trivial UI & Bench Manipulation Filter)
  const trivialPatterns = [
    /đã đặt ".*" vào bàn gỗ thí nghiệm/i,
    /đã thêm \d+ thiết bị vào bàn/i,
    /bàn thí nghiệm đã có đầy đủ dụng cụ/i,
    /đã đặt bổ sung \d+ dụng cụ/i,
    /đã bày bộ dụng cụ/i,
    /đã quăng ".*" vào tủ đựng đồ/i,
    /đã cất ".*" vào tủ đựng đồ/i,
    /đã xoay ".*" 90°/i,
    /đã dọn các vật khỏi đĩa cân/i,
    /đã đặt lại bàn gỗ thí nghiệm/i,
    /đã đổi không gian sang/i,
    /đã chọn bài thực hành/i,
    /đang ghi hình thực hành/i,
    /đã tạm dừng ghi hình/i,
    /tiếp tục ghi hình thực hành/i,
    /đã dừng ghi hình/i,
    /đã lưu bước \d+/i,
    /khung nhìn 3d chưa sẵn sàng/i,
    /đã cập nhật ảnh thực tế/i,
    /đã cập nhật trực tiếp thông số sản phẩm/i,
    /đã khôi phục 13 biến môi trường/i,
    /màn hình cân điện tử đã được đặt chuẩn về 0\.00 g/i,
    /đã hiệu chỉnh vạch 0 cho lực kế/i,
    /đã đóng hàm kẹp thước cặp về vạch 0\.0 mm/i,
    /đã tắt nguồn sáng trên/i,
    /đã châm đầy 1000\.0 ml nước cất vào bình cấp nước/i,
    /đã đặt ".*" dưới vòi bình cấp nước \(hiện tại:/i,
  ];

  for (const pattern of trivialPatterns) {
    if (pattern.test(msg)) {
      return null;
    }
  }

  // Nếu chỉ lấy vật ra khỏi cân làm cân về 0.00 g -> thao tác cơ bản, bỏ qua
  if (/đã lấy ".*" .* khỏi đĩa cân/i.test(msg) && /0\.00 g/i.test(msg)) {
    return null;
  }

  const nowTime = new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const eventId = `phen-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  // 2. PHÂN LOẠI HIỆN TƯỢNG KHOA HỌC ĐÁNG CHÚ Ý

  // A. Hoàn thành xác định Khối lượng riêng (ρ = m / V)
  if (/khối lượng riêng|ρ\s*=\s*m\s*\/\s*v/i.test(msg)) {
    return {
      id: eventId,
      timestamp: nowTime,
      title: 'Xác định Khối lượng riêng của vật rắn',
      category: 'density-result',
      categoryLabel: 'Cơ học & Vật liệu',
      observation: msg,
      scientificExplanation:
        'Khối lượng riêng (ρ) đặc trưng cho mật độ khối lượng trên một đơn vị thể tích của chất cấu tạo nên vật. Với ρ ≈ 2.70 g/cm³ (2700 kg/m³) lớn hơn khối lượng riêng của nước (1.00 g/cm³), trọng lượng P thắng lực đẩy Archimedes F₍A₎ nên mẫu nhôm chìm hoàn toàn trong nước.',
      formula: 'ρ = m / V = m / (V₂ − V₁)  [g/cm³]',
      metrologyNote:
        'Sai số tỉ đối của phép đo gián tiếp: δ₍ρ₎ = δ₍m₎ + δ₍V₎. Để giảm sai số, cần cân vật khi còn khô ráo trước khi nhúng vào nước.',
      suggestedQuestions: [
        'Vì sao phải cân khối lượng vật trước khi nhúng vào ống đong?',
        'Nếu có bọt khí bám quanh vật khi nhúng thì kết quả ρ tăng hay giảm?',
        'Tại sao khối lượng riêng giúp nhận biết chất làm vật (Nhôm)?',
      ],
    };
  }

  // B. Nhúng ngập vật rắn / Dâng mực nước / Bình tràn Eureka (Định luật Archimedes)
  if (
    /đã nhúng ngập vật rắn/i.test(msg) ||
    /đã thả ngập vật vào bình tràn/i.test(msg) ||
    /ΔV\s*=/i.test(msg)
  ) {
    const isOverflow = /bình tràn/i.test(msg);
    return {
      id: eventId,
      timestamp: nowTime,
      title: isOverflow
        ? 'Hiện tượng dâng tràn chất lỏng (Bình tràn Eureka)'
        : 'Hiện tượng vật rắn chiếm chỗ chất lỏng trong Ống đong',
      category: 'volume-displacement',
      categoryLabel: 'Thủy tĩnh học · Archimedes',
      observation: msg,
      scientificExplanation: isOverflow
        ? 'Khi thả vật rắn không thấm nước chìm hoàn toàn vào Bình tràn đang chứa đầy nước ở ngang miệng vòi (210.0 ml), vật chiếm chỗ và đẩy một thể tích nước tràn qua vòi sang cốc hứng đúng bằng thể tích V của vật.'
        : 'Chất lỏng (nước) hầu như không chịu nén. Khi vật rắn đặc, không thấm nước chìm hoàn toàn dưới mặt thoáng, thể tích phần nước dâng lên thêm (ΔV = V₂ − V₁) bằng đúng thể tích không gian mà vật chiếm chỗ.',
      formula: isOverflow
        ? 'V₍vật₎ = V₍nước tràn₎   (1 ml = 1 cm³)'
        : 'V₍vật₎ = ΔV = V₂ − V₁   [cm³]',
      metrologyNote:
        'Do lực bám dính giữa phân tử nước và thành thủy tinh lớn hơn lực căng bề mặt nội phân tử, mặt nước tạo thành mặt khum lõm (meniscus). Phải đặt mắt ngang đáy mặt khum lõm để tránh sai số thị sai.',
      suggestedQuestions: [
        'Tại sao mặt nước trong ống đong thủy tinh lại cong lõm xuống?',
        'Khi nào cần dùng Bình tràn thay cho Ống đong trực tiếp?',
        'Nếu nhìn lệch từ trên xuống khi đọc vạch V₂ thì thể tích bị lệch thế nào?',
      ],
    };
  }

  // C. Đo khối lượng trên Cân điện tử hoặc Trừ bì (TARE)
  if (
    /lên cân điện tử/i.test(msg) ||
    /khối lượng còn lại trên cân/i.test(msg) ||
    /đã bấm tare/i.test(msg)
  ) {
    const isTare = /tare/i.test(msg);
    return {
      id: eventId,
      timestamp: nowTime,
      title: isTare
        ? 'Kỹ thuật Trừ bì (TARE) trên Cân điện tử'
        : 'Cân bằng lực đàn hồi & Đo khối lượng trên Cân điện tử',
      category: 'mass-measurement',
      categoryLabel: 'Đo lường Khối lượng',
      observation: msg,
      scientificExplanation: isTare
        ? 'Chức năng TARE ghi nhớ khối lượng của bình chứa (bì) làm mốc 0.00 g tạm thời trong bộ vi xử lý của cân. Nhờ đó, khi rót chất lỏng hoặc thêm hóa chất vào bình, màn hình chỉ hiển thị khối lượng tịnh (net mass) của chất thêm vào.'
        : 'Khi đặt vật lên đĩa cân, trọng lực P = m · g của vật tác dụng lên thanh cảm biến biến dạng (Strain Gauge Loadcell). Độ biến dạng đàn hồi làm thay đổi điện trở cầu Wheatstone và được chuyển đổi thành giá trị khối lượng m với độ chia nhỏ nhất 0.01 g.',
      formula: isTare
        ? 'm₍tịnh₎ = m₍tổng₎ − m₍bì₎   [g]'
        : 'P = m · g  ⇒  m = P / g   (ĐCNN = 0.01 g)',
      metrologyNote:
        'Đặt vật nhẹ nhàng ở chính tâm đĩa cân và đợi số hiển thị ổn định để tránh lực xung kích làm lệch cảm biến Loadcell.',
      suggestedQuestions: [
        'Cảm biến Loadcell bên trong cân điện tử hoạt động như thế nào?',
        'Tại sao cần bấm TARE khi cân chất lỏng đựng trong cốc thủy tinh?',
        'Nếu vật mẫu bị ướt trước khi đặt lên cân thì sai số ảnh hưởng ra sao?',
      ],
    };
  }

  // D. Sai số / Cảnh báo bình đầy hoặc hết nước
  if (
    /đã đầy hoặc bình nguồn đã hết nước/i.test(msg) ||
    /bình cấp nước đã cạn/i.test(msg) ||
    tone === 'error'
  ) {
    return {
      id: eventId,
      timestamp: nowTime,
      title: 'Cảnh báo Giới hạn Đo & Dung tích Bình chứa',
      category: 'measurement-error',
      categoryLabel: 'Giới hạn Đo (GHĐ) & Sai số',
      observation: msg,
      scientificExplanation:
        'Mỗi dụng cụ đo thể tích (Ống đong 100 ml, Cốc thủy tinh 250 ml, Bình tràn 210 ml) đều có Giới hạn đo (GHĐ) xác định. Việc rót vượt quá GHĐ sẽ làm chất lỏng tràn ra ngoài hoặc vượt vùng chia vạch chuẩn, gây sai số nghiêm trọng.',
      formula: '0 ≤ V₍chứa₎ ≤ GHĐ₍bình₎',
      metrologyNote:
        'Trước khi thực hành, luôn kiểm tra GHĐ (Giới hạn đo) và ĐCNN (Độ chia nhỏ nhất) in trên thành bình.',
      suggestedQuestions: [
        'Làm sao để chọn ống đong có GHĐ và ĐCNN phù hợp nhất?',
        'Nếu mực nước vượt quá vạch chia cao nhất thì xử lý thế nào?',
      ],
      isWarningOrError: true,
    };
  }

  // E. Thay đổi trạng thái/mực chất lỏng: Nghiêng rót, mở van định lượng, chiết tách Phễu chiết
  if (
    /đã nghiêng rót/i.test(msg) ||
    /đã mở van xả/i.test(msg) ||
    /đã điều chỉnh chuẩn lượng nước/i.test(msg) ||
    /vào khay hứng vòi bình cấp nước và xả/i.test(msg) ||
    /đã cập nhật lượng nước/i.test(msg) ||
    /phễu chiết/i.test(msg)
  ) {
    const isFunnel = /phễu chiết/i.test(msg);
    return {
      id: eventId,
      timestamp: nowTime,
      title: isFunnel
        ? 'Chiết tách hai chất lỏng không hòa tan (Phễu chiết)'
        : 'Bảo toàn Thể tích & Điều chỉnh Mức Chất lỏng',
      category: 'liquid-state',
      categoryLabel: isFunnel ? 'Tách chất Hóa học' : 'Cơ học Chất lưu',
      observation: msg,
      scientificExplanation: isFunnel
        ? 'Hai chất lỏng không hòa tan vào nhau (như dầu ăn và nước) sẽ phân lớp theo khối lượng riêng: chất có khối lượng riêng lớn hơn (nước) nằm ở lớp dưới, chất nhẹ hơn nằm ở lớp trên. Khi mở khóa phễu chiết, trọng lực đẩy lớp chất lỏng nặng hơn chảy xuống cốc hứng trước.'
        : 'Khi truyền chất lỏng giữa bình cấp và dụng cụ đo, thể tích chất lỏng được bảo toàn (V₍nguồn₎ giảm một lượng đúng bằng ΔV₍nhận₎). Áp suất thủy tĩnh p = d · h tại đáy bình tăng tuyến tính theo chiều cao cột nước h.',
      formula: isFunnel
        ? 'ρ₍dưới₎ > ρ₍trên₎  ⇒  Phân lớp theo trọng lực'
        : 'V₍sau₎ = V₍đầu₎ + ΔV₍rót₎   (p = ρ · g · h)',
      metrologyNote: isFunnel
        ? 'Cần đóng khóa phễu chiết ngay khi mặt phân cách giữa hai lớp chất lỏng vừa chạm tới lỗ khóa.'
        : 'Khi thiết lập mực nước ban đầu V₁ trong ống đong, nên chọn vạch chẵn (ví dụ 50.0 ml) để dễ tính ΔV = V₂ − V₁.',
      suggestedQuestions: isFunnel
        ? [
            'Vì sao hỗn hợp dầu và nước lại tách thành hai lớp rõ rệt?',
            'Làm sao để biết thời điểm đóng khóa phễu chiết chính xác?',
          ]
        : [
            'Tại sao nên lấy mực nước ban đầu V₁ ở vạch 50 ml?',
            'Áp suất tại đáy ống đong thay đổi thế nào khi mực nước dâng cao?',
          ],
    };
  }

  // F. Hiện tượng Quang học: Khúc xạ ánh sáng & Phản xạ toàn phần
  if (
    /góc tới i\s*=/i.test(msg) ||
    /phản xạ toàn phần/i.test(msg) ||
    /khúc xạ/i.test(msg) ||
    /đã bật chùm tia sáng/i.test(msg)
  ) {
    const isTotalInternalReflection = /phản xạ toàn phần/i.test(msg);
    return {
      id: eventId,
      timestamp: nowTime,
      title: isTotalInternalReflection
        ? 'Hiện tượng Phản xạ toàn phần (i > i₍gh₎)'
        : 'Hiện tượng Khúc xạ ánh sáng qua mặt phân cách',
      category: 'optics-phenomenon',
      categoryLabel: 'Quang hình học · KHTN 9',
      observation: msg,
      scientificExplanation: isTotalInternalReflection
        ? 'Khi tia sáng truyền từ môi trường chiết quang hơn (bản bán trụ thủy tinh n₁ ≈ 1.50) sang môi trường chiết quang kém hơn (không khí n₂ ≈ 1.00) với góc tới i vượt quá góc giới hạn i₍gh₎ ≈ 41.8°, tia khúc xạ biến mất hoàn toàn. Toàn bộ năng lượng chùm tia sáng bị phản xạ ngược lại tại mặt phân cách.'
        : 'Khi chùm tia sáng truyền xiên góc qua mặt phân cách giữa hai môi trường trong suốt có chiết suất khác nhau (n₁ ≠ n₂), tốc độ truyền ánh sáng thay đổi (v = c / n) làm tia sáng bị gãy khúc tại mặt phân cách theo Định luật khúc xạ Snell.',
      formula: isTotalInternalReflection
        ? 'sin(i₍gh₎) = n₂ / n₁ ≈ 1 / 1.50  ⇒  i₍gh₎ ≈ 41.8° (i ≥ i₍gh₎)'
        : 'n₁ · sin(i) = n₂ · sin(r)',
      metrologyNote:
        'Tâm của bản bán trụ thủy tinh phải đặt trùng khít với tâm bảng chia độ 360° để tia sáng đi qua mặt cong theo phương bán kính không bị khúc xạ lần thứ hai.',
      suggestedQuestions: [
        'Hai điều kiện bắt buộc để xảy ra phản xạ toàn phần là gì?',
        'Vì sao tia sáng truyền vuông góc với mặt cong bán trụ lại truyền thẳng?',
        'Ứng dụng của phản xạ toàn phần trong cáp quang như thế nào?',
      ],
      isWarningOrError: isTotalInternalReflection,
    };
  }

  // G. Hiện tượng Điện từ: Cảm ứng điện từ Faraday/Lenz & Đo điện đa năng
  if (
    /dòng điện cảm ứng/i.test(msg) ||
    /đưa nam châm/i.test(msg) ||
    /kéo nam châm/i.test(msg) ||
    /nam châm đứng yên/i.test(msg) ||
    /đồng hồ đo điện đa năng/i.test(msg)
  ) {
    const isMultimeter = /đồng hồ đo điện đa năng/i.test(msg);
    return {
      id: eventId,
      timestamp: nowTime,
      title: isMultimeter
        ? 'Đo đại lượng Điện học (U, I, R) theo Định luật Ohm'
        : 'Hiện tượng Cảm ứng Điện từ (Định luật Faraday & Lenz)',
      category: 'electromagnetism',
      categoryLabel: 'Điện từ học · KHTN 9',
      observation: msg,
      scientificExplanation: isMultimeter
        ? 'Đồng hồ vạn năng số đo hiệu điện thế một chiều (DCV), cường độ dòng điện (DCA) và điện trở (Ω). Theo định luật Ohm, cường độ dòng điện chạy qua đoạn mạch tỉ lệ thuận với hiệu điện thế U và tỉ lệ nghịch với điện trở R (I = 12.0 V / 16.0 Ω = 0.75 A).'
        : 'Theo định luật cảm ứng điện từ Faraday, dòng điện cảm ứng chỉ xuất hiện trong cuộn dây dẫn kín khi số đường sức từ (từ thông Φ) xuyên qua tiết diện cuộn dây biến thiên theo thời gian. Khi nam châm đảo chiều chuyển động, từ thông tăng/giảm ngược nhau nên dòng điện cảm ứng đổi chiều (Định luật Lenz).',
      formula: isMultimeter
        ? 'I = U / R   [A = V / Ω]'
        : 'e₍c₎ = − ΔΦ / Δt   (Khi ΔΦ = 0 ⇒ I₍c₎ = 0)',
      metrologyNote: isMultimeter
        ? 'Khi đo hiệu điện thế (V) mắc song song, khi đo cường độ dòng điện (A) phải mắc nối tiếp với tải tiêu thụ.'
        : 'Nếu dịch chuyển nam châm càng nhanh thì tốc độ biến thiên từ thông |ΔΦ / Δt| càng lớn, kim điện kế lệch càng mạnh.',
      suggestedQuestions: isMultimeter
        ? [
            'Tại sao không được mắc Ampe kế song song trực tiếp vào hai cực nguồn điện?',
            'Nếu tăng hiệu điện thế U lên gấp đôi thì điện trở R của dây có đổi không?',
          ]
        : [
            'Tại sao khi nam châm đứng yên trong lòng cuộn dây thì không có dòng điện?',
            'Làm thế nào để tăng độ lớn dòng điện cảm ứng trong cuộn dây?',
          ],
    };
  }

  // H. Hiện tượng Nhiệt học & Phản ứng cháy (Nhiệt kế, Đèn cồn, Nồng độ O₂)
  if (
    /nhiệt kế/i.test(msg) ||
    /ngọn lửa/i.test(msg) ||
    /nồng độ o₂/i.test(msg) ||
    /airTemperatureC/i.test(msg)
  ) {
    const isOxygenExtinguish = /o₂/i.test(msg);
    const isBurner = /ngọn lửa/i.test(msg);
    return {
      id: eventId,
      timestamp: nowTime,
      title: isOxygenExtinguish
        ? 'Tắt lửa do thiếu Oxy duy trì sự cháy (O₂ < 14%)'
        : isBurner
          ? 'Phản ứng Oxi hóa – Cháy tỏa nhiệt của Etanol (Đèn cồn)'
          : 'Cân bằng Nhiệt & Sự dãn nở vì nhiệt trong Nhiệt kế',
      category: 'thermal-chemistry',
      categoryLabel: 'Nhiệt học & Hóa học',
      observation: msg,
      scientificExplanation: isOxygenExtinguish
        ? 'Sự cháy của hơi cồn là phản ứng oxi hóa tỏa nhiệt cần nồng độ khí Oxy tối thiểu khoảng 14%. Khi nồng độ O₂ trong môi trường giảm xuống dưới ngưỡng này (hoặc khi đậy nắp chụp đèn cồn ngăn O₂), phản ứng cháy tự động tắt.'
        : isBurner
          ? 'Cồn etylic (C₂H₅OH) dẫn lên theo bấc đèn bay hơi và tác dụng với O₂ trong không khí tạo ra CO₂, H₂O và tỏa nhiệt lượng lớn (Q). Khi tắt đèn cồn, bắt buộc phải đậy nắp chụp để cắt nguồn Oxy, tuyệt đối không thổi bằng miệng.'
          : 'Nhiệt kế hoạt động dựa trên sự dãn nở vì nhiệt của chất lỏng (cồn màu hoặc thủy ngân) trong bầu kín. Khi tiếp xúc với môi trường có nhiệt độ T cao hơn, nhiệt năng truyền từ môi trường sang bầu nhiệt kế cho đến khi đạt trạng thái cân bằng nhiệt.',
      formula: isBurner || isOxygenExtinguish
        ? 'C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O + Q₍nhiệt₎'
        : 'ΔV₍lỏng₎ = V₀ · β · ΔT',
      metrologyNote:
        'Khi đọc nhiệt độ trên nhiệt kế, bầu nhiệt kế phải vẫn nằm ngập trong chất lỏng cần đo và không được chạm sát đáy cốc đang đun.',
      suggestedQuestions: [
        'Tại sao tuyệt đối không được dùng miệng thổi tắt đèn cồn?',
        'Vì sao nhiệt độ sôi của cồn (78.5 °C) thấp hơn nhiệt độ sôi của nước (100 °C)?',
        'Tại sao khi đọc nhiệt kế không được nhấc bầu nhiệt kế ra khỏi chất lỏng?',
      ],
      isWarningOrError: isOxygenExtinguish,
    };
  }

  // I. Cơ học (Lực kế lò xo, Gia tốc trọng trường g, Thước cặp Du xích, Kính hiển vi)
  if (
    /lực kế lò xo/i.test(msg) ||
    /gravityMps2/i.test(msg) ||
    /thước cặp/i.test(msg) ||
    /kính hiển vi/i.test(msg)
  ) {
    const isMicroscope = /kính hiển vi/i.test(msg);
    const isCaliper = /thước cặp/i.test(msg);
    return {
      id: eventId,
      timestamp: nowTime,
      title: isMicroscope
        ? 'Độ bội giác Quang học trên Kính hiển vi'
        : isCaliper
          ? 'Đo kích thước chính xác bằng Thước cặp Du xích (Vernier)'
          : 'Định luật Hooke & Trọng lượng vật rắn trên Lực kế lò xo',
      category: isMicroscope ? 'microscopy-biology' : 'mechanics-metrology',
      categoryLabel: isMicroscope ? 'Sinh học Tế bào · KHTN 9' : 'Cơ học & Đo lường',
      observation: msg,
      scientificExplanation: isMicroscope
        ? 'Độ phóng đại tổng hợp của kính hiển vi quang học bằng tích độ phóng đại của thị kính (G₍thị kính₎ = 10×) và vật kính (G₍vật kính₎ = 10×, 40×, 100×). Ở vật kính 40×–100×, cấu trúc kép của Nhiễm sắc thể ở kỳ giữa nguyên phân hiện rõ.'
        : isCaliper
          ? 'Thước cặp kết hợp thước chính (chia theo mm) và thước phụ Du xích (Vernier). Nhờ độ lệch vạch giữa thước chính và du xích, dụng cụ cho phép đọc chính xác kích thước đường kính ngoài d tới 0.1 mm hoặc 0.02 mm.'
          : 'Khi treo vật vào móc lực kế, vật chịu tác dụng của trọng lực P = m · g hướng xuống và lực đàn hồi của lò xo F₍đh₎ = k · Δl hướng lên. Khi vật đứng yên cân bằng, độ dãn lò xo Δl tỉ lệ thuận với trọng lượng P của vật (Định luật Hooke).',
      formula: isMicroscope
        ? 'G₍tổng₎ = G₍thị kính₎ × G₍vật kính₎'
        : isCaliper
          ? 'd = L₍thước chính₎ + k · ĐCNN₍du xích₎   [mm]'
          : 'F₍đh₎ = k · Δl = P = m · g   [N]',
      metrologyNote: isMicroscope
        ? 'Luôn bắt đầu tìm vùng mẫu vật ở vật kính nhỏ (10×) trước khi xoay sang vật kính lớn (40×, 100×).'
        : isCaliper
          ? 'Kẹp hàm động vừa chạm bề mặt mẫu vật theo phương vuông góc trục để tránh làm nghiêng thước.'
          : 'Khi gia tốc trọng trường g thay đổi (ví dụ trên Mặt Trăng g ≈ 1.62 m/s²), khối lượng m không đổi nhưng trọng lượng P = m · g trên lực kế sẽ thay đổi.',
      suggestedQuestions: isMicroscope
        ? [
            'Vì sao phải quan sát ở vật kính 10× trước rồi mới chuyển sang 40×?',
            'Nhiễm sắc thể quan sát rõ nhất ở kỳ nào của quá trình phân bào?',
          ]
        : isCaliper
          ? [
              'Cách đọc phần lẻ thập phân trên vạch thước phụ Du xích như thế nào?',
              'Từ đường kính d và chiều cao h, tính thể tích khối trụ bằng công thức nào?',
            ]
          : [
              'Sự khác nhau bản chất giữa Khối lượng (m) và Trọng lượng (P) là gì?',
              'Nếu đưa lực kế và vật lên Mặt Trăng thì số chỉ lực kế thay đổi thế nào?',
            ],
    };
  }

  // J. Các cập nhật thông số khoa học khác trên thiết bị mô phỏng
  if (tone === 'warning') {
    return {
      id: eventId,
      timestamp: nowTime,
      title: 'Lưu ý Hiện tượng & Điều kiện Thực nghiệm',
      category: 'measurement-error',
      categoryLabel: 'Cảnh báo Thí nghiệm',
      observation: msg,
      scientificExplanation:
        'Hệ thống ghi nhận một sự thay đổi trạng thái hoặc ngưỡng giới hạn vật lý đáng chú ý trên bàn thí nghiệm.',
      suggestedQuestions: [
        'Hiện tượng vừa xảy ra có ảnh hưởng thế nào đến kết quả đo?',
        'Làm thế nào để khắc phục sai số trong bước này?',
      ],
      isWarningOrError: true,
    };
  }

  // Mặc định: Nếu không phải hiện tượng khoa học rõ rệt thì lọc bỏ (return null)
  return null;
}

interface LabPhenomenonAssistantBubbleProps {
  phenomenon: ScientificPhenomenonEvent | null;
  phenomenonHistory: ScientificPhenomenonEvent[];
  sceneSummaryContext: string;
  isDarkMode?: boolean;
  onSelectHistoryPhenomenon: (item: ScientificPhenomenonEvent) => void;
  onDismissBubble: () => void;
}

const MD_KNOWLEDGE_FILE_URL = OFFICIAL_KHTN_678_ASSET_URI;

const DEFAULT_KHTN_ASSISTANT_EVENT: ScientificPhenomenonEvent = {
  id: 'default-khtn-6789-assistant',
  timestamp: 'KHTN 6, 7, 8',
  title: 'Trợ lý Khoa học Tự nhiên (Lớp 6, 7, 8)',
  category: 'density-result',
  categoryLabel: 'Đo lường · Hoá học · Vật lí · Sinh học (Lớp 6, 7, 8)',
  observation:
    'Chỉ sử dụng kiến thức chuẩn xác từ Tài liệu Tổng hợp Khoa học Tự nhiên (Lớp 6, 7, 8): Mở đầu & Đo lường, Hoá học, Vật lí và Sinh học.',
  scientificExplanation:
    'Trình bày thân thiện, sư phạm, dễ hiểu, mạch lạc với các gạch đầu dòng và từ khoá in đậm. Không tự bịa đặt thông tin ngoài tài liệu được cung cấp.',
  formula:
    'D = m / V | p = F / S | F₍A₎ = d · V | v = s / t | n = m / M | V = n × 24,79 | C% = (m₍ct₎ / m₍dd₎) × 100% | C₍M₎ = n / V',
  metrologyNote:
    'Quy trình đo 5 bước: (1) Ước lượng đại lượng → (2) Chọn dụng cụ có GHĐ và ĐCNN phù hợp → (3) Đặt/hiệu chỉnh dụng cụ → (4) Đặt mắt nhìn đúng quy cách → (5) Đọc và ghi kết quả.',
  suggestedQuestions: [
    'Trình bày 5 bước phương pháp tìm hiểu KHTN và 5 bước quy trình đo lường cơ bản?',
    'Cấu tạo nguyên tử theo mô hình Rutherford - Bohr và cấu trúc Bảng tuần hoàn?',
    'Khối lượng riêng D = m / V, áp suất p = F / S và lực đẩy Archimedes là gì?',
    'Phân biệt tế bào nhân sơ, tế bào nhân thực và hệ thống phân loại 5 giới sinh vật?',
  ],
};

const QUICK_GRADE_QUESTIONS: Array<{
  grade: string;
  label: string;
  question: string;
}> = [
  {
    grade: 'Phần I · Đo lường',
    label: 'Chiều dài, khối lượng, nhiệt độ & an toàn',
    question:
      'Trình bày các phép đo chiều dài, khối lượng, thời gian, nhiệt độ, quy trình đo 5 bước và quy tắc an toàn phòng thực hành?',
  },
  {
    grade: 'Phần II · Hoá học',
    label: 'Chất, tách chất, nguyên tử, mol, Acid-Base',
    question:
      'Trình bày các phương pháp tách chất, cấu tạo nguyên tử, liên kết hoá học, công thức tính mol, nồng độ và Acid - Base - thang pH?',
  },
  {
    grade: 'Phần III · Vật lí',
    label: 'Khối lượng riêng, áp suất, điện, âm, quang, từ',
    question:
      'Trình bày khối lượng riêng, áp suất, lực đẩy Archimedes, đòn bẩy, dòng điện, tốc độ chuyển động, âm thanh, ánh sáng và từ trường?',
  },
  {
    grade: 'Phần IV · Sinh học',
    label: 'Tế bào, 5 giới sinh vật, vi khuẩn & virus',
    question:
      'Trình bày cấu tạo tế bào, các cấp tổ chức cơ thể đa bào, hệ thống 5 giới sinh vật, vi khuẩn - virus và trao đổi chất?',
  },
];

const MD_FORMULA_AND_PHENOMENA_CHIPS: Array<{
  badge: string;
  title: string;
  question: string;
}> = [
  {
    badge: 'Đo nhiệt độ',
    title: 'Công thức đổi độ C sang độ F & điểm sôi của nước?',
    question:
      'Nêu định nghĩa nhiệt độ, điểm đóng băng và điểm sôi của nước, công thức quy đổi từ độ C sang độ F và tính xem 25°C bằng bao nhiêu °F?',
  },
  {
    badge: 'Hoá học',
    title: 'Phân biệt Dung dịch, Huyền phù, Nhũ tương & Tách chất?',
    question:
      'Phân biệt chất tinh khiết, dung dịch, huyền phù, nhũ tương và trình bày 4 phương pháp tách chất (lắng/gạn, lọc, cô cạn, chiết)?',
  },
  {
    badge: 'Hoá học 8',
    title: 'Acid, Base, Thang pH, Oxide, Muối & Phân bón hoá học?',
    question:
      'Trình bày đặc điểm của Acid, Base (kiềm), Thang pH, 4 loại Oxide, Muối và phân bón hoá học?',
  },
  {
    badge: 'Vật lí 8',
    title: 'Tính D = m / V (m = 2 kg, V = 0,001 m³) & Archimedes?',
    question:
      'Một vật có khối lượng m = 2 kg và thể tích V = 0,001 m³. Tính khối lượng riêng D = m / V và nêu điều kiện nổi, chìm theo lực đẩy Archimedes?',
  },
  {
    badge: 'Vật lí 7',
    title: 'Sóng âm, Phản xạ ánh sáng, Gương phẳng & Từ trường?',
    question:
      'Trình bày đặc trưng của sóng âm (tần số, biên độ, tiếng vang), định luật phản xạ ánh sáng, ảnh qua gương phẳng và đường sức từ?',
  },
  {
    badge: 'Sinh học',
    title: 'So sánh Vi khuẩn và Virus, cách điều trị & phòng bệnh?',
    question:
      'Phân biệt cấu tạo, hình dạng, vai trò, tác hại của Vi khuẩn và Virus cùng cách điều trị và phòng bệnh?',
  },
];

function renderTextbookSubscripts(segment: string, keyPrefix: string) {
  const tokens = segment.split(/(₍[^₍₎]+₎)/g);
  return tokens.map((tok, idx) => {
    if (tok.startsWith('₍') && tok.endsWith('₎')) {
      return (
        <sub
          key={`${keyPrefix}-sub-${idx}`}
          className="text-[0.75em] font-semibold leading-none align-baseline relative -bottom-[0.18em]"
        >
          {tok.slice(1, -1)}
        </sub>
      );
    }
    return <React.Fragment key={`${keyPrefix}-txt-${idx}`}>{tok}</React.Fragment>;
  });
}

function renderFormattedConciseText(rawText: string) {
  const cleanText = sanitizeScientificText(rawText);
  const lines = cleanText.split('\n').filter((line) => line.trim().length > 0);
  return (
    <div className="space-y-1.5">
      {lines.map((line, lineIdx) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <div key={lineIdx} className="leading-relaxed">
            {parts.map((part, partIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={partIdx} className="font-extrabold text-amber-400">
                    {renderTextbookSubscripts(
                      part.slice(2, -2),
                      `b-${lineIdx}-${partIdx}`,
                    )}
                  </strong>
                );
              }
              return (
                <React.Fragment key={partIdx}>
                  {renderTextbookSubscripts(part, `p-${lineIdx}-${partIdx}`)}
                </React.Fragment>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export const LabPhenomenonAssistantBubble: React.FC<
  LabPhenomenonAssistantBubbleProps
> = ({
  phenomenon,
  phenomenonHistory,
  sceneSummaryContext,
  isDarkMode = false,
  onSelectHistoryPhenomenon,
  onDismissBubble,
}) => {
  // Mặc định khung chat thu gọn thành bong bóng 💡 để không che khuất không gian 3D
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasUnread, setHasUnread] = useState<boolean>(false);
  const [showHistoryList, setShowHistoryList] = useState<boolean>(false);
  const [showMdCatalog, setShowMdCatalog] = useState<boolean>(false);
  const [isDismissedDefault, setIsDismissedDefault] = useState<boolean>(false);
  const [questionInput, setQuestionInput] = useState<string>('');
  const [isAskingAi, setIsAskingAi] = useState<boolean>(false);
  const [chatByPhenomenonId, setChatByPhenomenonId] = useState<
    Record<string, ChatMessage[]>
  >({});

  // Vị trí tùy chỉnh khi người dùng kéo di chuyển bong bóng / bảng giải thích (x, y tính từ góc trên trái viewport)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = window.localStorage.getItem('ol3d_phenomenon_bubble_pos_v1');
      if (saved) {
        const parsed = JSON.parse(saved) as { x?: number; y?: number };
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return {
            x: Math.max(8, Math.min(parsed.x, window.innerWidth - 64)),
            y: Math.max(8, Math.min(parsed.y, window.innerHeight - 64)),
          };
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
    return null;
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    width: number;
    height: number;
    hasMoved: boolean;
  } | null>(null);
  const suppressNextClickRef = useRef<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const lastPhenomenonIdRef = useRef<string | null>(null);

  const activeEvent =
    phenomenon ?? (isDismissedDefault ? null : DEFAULT_KHTN_ASSISTANT_EVENT);

  // Giữ vị trí luôn nằm trong khung nhìn khi đổi kích thước cửa sổ hoặc khi mở rộng / thu gọn khung chat
  const clampPositionToViewport = useCallback(() => {
    setPosition((prev) => {
      if (!prev || typeof window === 'undefined') return prev;
      const el = containerRef.current;
      const w = el ? el.offsetWidth : 56;
      const h = el ? el.offsetHeight : 56;
      const maxX = Math.max(8, window.innerWidth - w - 8);
      const maxY = Math.max(8, window.innerHeight - h - 8);
      const nextX = Math.max(8, Math.min(prev.x, maxX));
      const nextY = Math.max(8, Math.min(prev.y, maxY));
      if (nextX === prev.x && nextY === prev.y) return prev;
      return { x: nextX, y: nextY };
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener('resize', clampPositionToViewport);
    return () => window.removeEventListener('resize', clampPositionToViewport);
  }, [clampPositionToViewport]);

  useEffect(() => {
    clampPositionToViewport();
  }, [isOpen, showHistoryList, showMdCatalog, clampPositionToViewport]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (position) {
        window.localStorage.setItem(
          'ol3d_phenomenon_bubble_pos_v1',
          JSON.stringify(position),
        );
      } else {
        window.localStorage.removeItem('ol3d_phenomenon_bubble_pos_v1');
      }
    } catch {
      // Ignore storage error
    }
  }, [position]);

  const handleDragPointerDown = (
    e: React.PointerEvent<HTMLElement>,
    allowFromButton = false,
  ) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (!allowFromButton && (e.target as HTMLElement).closest('button, input, textarea, a')) {
      return;
    }
    const containerEl = containerRef.current;
    if (!containerEl) return;

    const rect = containerEl.getBoundingClientRect();
    dragStateRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: rect.left,
      originY: rect.top,
      width: rect.width,
      height: rect.height,
      hasMoved: false,
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore capture errors
    }
  };

  const handleDragPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const st = dragStateRef.current;
    if (!st || st.pointerId !== e.pointerId) return;

    const dx = e.clientX - st.startX;
    const dy = e.clientY - st.startY;

    if (!st.hasMoved && Math.hypot(dx, dy) > 5) {
      st.hasMoved = true;
      suppressNextClickRef.current = true;
      setIsDragging(true);
    }

    if (st.hasMoved) {
      e.preventDefault();
      const maxX = Math.max(8, window.innerWidth - st.width - 8);
      const maxY = Math.max(8, window.innerHeight - st.height - 8);
      const nextX = Math.max(8, Math.min(Math.round(st.originX + dx), maxX));
      const nextY = Math.max(8, Math.min(Math.round(st.originY + dy), maxY));
      setPosition({ x: nextX, y: nextY });
    }
  };

  const handleDragPointerEnd = (e: React.PointerEvent<HTMLElement>) => {
    const st = dragStateRef.current;
    if (!st || st.pointerId !== e.pointerId) return;

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore release errors
    }

    const moved = st.hasMoved;
    dragStateRef.current = null;
    setIsDragging(false);

    if (moved) {
      window.setTimeout(() => {
        suppressNextClickRef.current = false;
      }, 60);
    } else {
      suppressNextClickRef.current = false;
    }
  };

  // Khi có hiện tượng vật lý/hóa học mới xảy ra -> Bật chấm đỏ thông báo trên bong bóng (NHƯNG KHÔNG TỰ ĐỘNG MỞ POPUP CHAT)
  useEffect(() => {
    if (phenomenon && phenomenon.id !== lastPhenomenonIdRef.current) {
      lastPhenomenonIdRef.current = phenomenon.id;
      setIsDismissedDefault(false);
      if (!isOpen) {
        setHasUnread(true);
      }
    }
  }, [phenomenon, isOpen]);

  const currentMessages = activeEvent
    ? chatByPhenomenonId[activeEvent.id] ?? []
    : [];

  useEffect(() => {
    if (isOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, currentMessages.length, isAskingAi]);

  // Đóng thu gọn khung Trợ lý Khoa học khi người dùng click ra ngoài (Click Outside) hoặc nhấn phím Escape
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDownOutside = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (
        target &&
        containerRef.current &&
        !containerRef.current.contains(target)
      ) {
        setIsOpen(false);
        setShowHistoryList(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setShowHistoryList(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDownOutside, true);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!activeEvent) {
    return null;
  }

  const handleOpenBubble = () => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return;
    }
    setIsOpen(true);
    setHasUnread(false);
  };

  const handleCollapseBubble = () => {
    setIsOpen(false);
    setHasUnread(false);
    setShowHistoryList(false);
  };

  const handleSendQuestion = async (rawQuestionText?: string) => {
    const qText = (rawQuestionText ?? questionInput).trim();
    if (!qText || !activeEvent || isAskingAi) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: qText,
      timestamp: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const prevThread = chatByPhenomenonId[activeEvent.id] ?? [];
    setChatByPhenomenonId((prev) => ({
      ...prev,
      [activeEvent.id]: [...prevThread, userMsg],
    }));
    if (!rawQuestionText) {
      setQuestionInput('');
    }
    setIsAskingAi(true);

    const payload = {
      question: qText,
      phenomenon: {
        id: activeEvent.id,
        title: activeEvent.title,
        category: activeEvent.categoryLabel,
        observation: activeEvent.observation,
        scientificExplanation: activeEvent.scientificExplanation,
        formula: activeEvent.formula,
        metrologyNote: activeEvent.metrologyNote,
      },
      sceneContext: sceneSummaryContext,
      history: prevThread.map((m) => ({ role: m.role, text: m.text })),
    };

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const localFallback = generateSmartLocalAnswer(payload);
      let replyText = localFallback.answer;
      let textbookRef = localFallback.textbookRef;
      let sources: AssistantReferenceSource[] = localFallback.sources;

      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const data = (await response.json()) as {
          answer?: string;
          textbookRef?: string;
          sources?: AssistantReferenceSource[];
        };
        if (data.answer && data.answer.trim()) {
          replyText = data.answer.trim();
        }
        if (data.textbookRef) {
          textbookRef = data.textbookRef;
        }
        if (Array.isArray(data.sources) && data.sources.length > 0) {
          sources = data.sources;
        }
      }

      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        textbookRef,
        sources,
      };

      setChatByPhenomenonId((prev) => ({
        ...prev,
        [activeEvent.id]: [...(prev[activeEvent.id] ?? []), aiMsg],
      }));
    } catch {
      const localFallback = generateSmartLocalAnswer(payload);
      const fallbackMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: localFallback.answer,
        timestamp: new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        textbookRef: localFallback.textbookRef,
        sources: localFallback.sources,
      };
      setChatByPhenomenonId((prev) => ({
        ...prev,
        [activeEvent.id]: [...(prev[activeEvent.id] ?? []), fallbackMsg],
      }));
    } finally {
      setIsAskingAi(false);
    }
  };

  const renderCategoryIcon = (cat: PhenomenonCategory) => {
    switch (cat) {
      case 'mass-measurement':
      case 'density-result':
        return <Scale className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'volume-displacement':
      case 'liquid-state':
        return <FlaskConical className="w-4 h-4 text-sky-400 shrink-0" />;
      case 'optics-phenomenon':
        return <Compass className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'electromagnetism':
        return <Zap className="w-4 h-4 text-yellow-400 shrink-0" />;
      case 'thermal-chemistry':
        return <Flame className="w-4 h-4 text-orange-400 shrink-0" />;
      case 'measurement-error':
        return <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />;
      default:
        return <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />;
    }
  };

  const isOnLeftSide =
    position !== null &&
    typeof window !== 'undefined' &&
    position.x < window.innerWidth * 0.45;

  const floatingPositionStyle: React.CSSProperties | undefined = position
    ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
        right: 'auto',
        bottom: 'auto',
      }
    : undefined;

  // ===========================================================================
  // TRẠNG THÁI 1: BONG BÓNG TỐI GIẢN CÓ THỂ KÉO DI CHUYỂN TỰ DO (Draggable Minimalist Bubble)
  // ===========================================================================
  if (!isOpen) {
    return (
      <div
        ref={containerRef}
        style={floatingPositionStyle}
        className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 group select-none touch-none ${
          isOnLeftSide ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        <div
          onClick={handleOpenBubble}
          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-lg backdrop-blur-xl transition-all duration-200 cursor-pointer opacity-0 ${
            isOnLeftSide ? '-translate-x-2' : 'translate-x-2'
          } pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto max-w-[320px] ${
            isDarkMode
              ? 'bg-[#0B1528]/92 border-amber-400/50 text-slate-100'
              : 'bg-white/95 border-amber-500/60 text-[#0F2942]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <div className="truncate text-[12px] font-bold">
            {activeEvent.title}
          </div>
        </div>

        <button
          type="button"
          onPointerDown={(e) => handleDragPointerDown(e, true)}
          onPointerMove={handleDragPointerMove}
          onPointerUp={handleDragPointerEnd}
          onPointerCancel={handleDragPointerEnd}
          onClick={handleOpenBubble}
          aria-label="Mở Trợ lý Khoa học tự nhiên 6–9 liên hệ 10–11 (Giữ và kéo để di chuyển vị trí)"
          title={`${activeEvent.title} (Bấm để hỏi • Giữ kéo để di chuyển)`}
          className={`relative w-12 h-12 rounded-full flex items-center justify-center border-[2px] shadow-[0_10px_28px_rgba(0,0,0,0.38)] backdrop-blur-xl select-none touch-none ${
            isDragging
              ? 'cursor-grabbing scale-110 ring-2 ring-amber-300/80'
              : 'cursor-grab transition-transform duration-200 hover:scale-105 active:scale-95'
          } ${
            activeEvent.isWarningOrError
              ? 'bg-gradient-to-br from-rose-600 to-amber-600 border-amber-200 text-white'
              : isDarkMode
                ? 'bg-gradient-to-br from-[#0F2442] to-[#1E3A8A] border-amber-400/80 text-amber-300'
                : 'bg-gradient-to-br from-[#0F2942] to-[#1D4ED8] border-amber-300 text-amber-300'
          }`}
        >
          {hasUnread && (
            <span className="absolute -inset-1 rounded-full border-2 border-amber-400/75 animate-ping pointer-events-none" />
          )}

          <span className="text-[21px] leading-none select-none drop-shadow-xs">
            💡
          </span>

          <span
            className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[9.5px] font-extrabold text-white border-2 shadow-xs ${
              hasUnread
                ? 'bg-rose-600 border-white animate-bounce'
                : 'bg-emerald-600 border-white'
            }`}
          >
            {hasUnread
              ? '!'
              : phenomenonHistory.length > 0
                ? phenomenonHistory.length
                : 'AI'}
          </span>
        </button>
      </div>
    );
  }

  // ===========================================================================
  // TRẠNG THÁI 2: KHUNG CHAT TRỢ LÝ KHOA HỌC TỰ NHIÊN THÔNG MINH
  // ===========================================================================
  return (
    <div
      ref={containerRef}
      style={floatingPositionStyle}
      className={`fixed bottom-4 right-4 z-50 w-[calc(100vw-24px)] sm:w-[435px] max-h-[84vh] rounded-2xl border-[1.5px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden backdrop-blur-2xl ${
        isDragging ? 'ring-2 ring-amber-400/80 select-none' : 'transition-shadow'
      } ${
        isDarkMode
          ? 'bg-[#0B1426]/96 border-amber-400/50 text-slate-100'
          : 'bg-white/98 border-[#1D4ED8]/40 text-[#0F2540]'
      }`}
    >
      {/* Header: Tiêu đề Trợ lý Khoa học (Kéo để di chuyển) */}
      <div
        onPointerDown={(e) => handleDragPointerDown(e, false)}
        onPointerMove={handleDragPointerMove}
        onPointerUp={handleDragPointerEnd}
        onPointerCancel={handleDragPointerEnd}
        onDoubleClick={() => setPosition(null)}
        title="Giữ và kéo thanh tiêu đề này để di chuyển bảng • Nhấp đúp để đặt lại góc phải dưới"
        className={`px-3.5 py-2.5 border-b flex items-center justify-between gap-2 shrink-0 select-none touch-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } ${
          isDarkMode
            ? 'bg-gradient-to-r from-[#0F203C] to-[#172E54] border-slate-700/80 text-white'
            : 'bg-gradient-to-r from-[#0F2942] to-[#1E40AF] border-slate-200 text-white'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-300/50 flex items-center justify-center shrink-0">
            <Lightbulb className="w-4 h-4 text-amber-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-extrabold tracking-tight truncate">
                Trợ lý Khoa học Tự nhiên (Lớp 6, 7, 8)
              </span>
            </div>
            <div className="text-[11px] text-sky-200/90 truncate flex items-center gap-1">
              <GripHorizontal className="w-3.5 h-3.5 opacity-75 shrink-0" />
              <span className="truncate">{activeEvent.categoryLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {phenomenonHistory.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHistoryList((v) => !v)}
              title="Xem các hiện tượng khoa học vừa xảy ra"
              className={`h-7 px-2 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition-colors cursor-pointer ${
                showHistoryList
                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>{phenomenonHistory.length}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              if (phenomenon) {
                onDismissBubble();
              } else {
                setIsDismissedDefault(true);
              }
            }}
            title="Ẩn hoàn toàn bong bóng thông báo này"
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-rose-500/80 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleCollapseBubble}
            title="Thu gọn về bong bóng nhỏ (X)"
            className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Thanh thông tin gọn + nút mở tài liệu gốc */}
      <div
        className={`px-3 py-1.5 border-b flex items-center justify-between gap-1.5 text-[10.5px] shrink-0 ${
          isDarkMode
            ? 'bg-[#081020] border-slate-800 text-slate-300'
            : 'bg-slate-100 border-slate-200 text-slate-700'
        }`}
      >
        <div className="flex items-center gap-1 flex-wrap">
          <span className="px-1.5 py-0.5 rounded bg-sky-500/15 border border-sky-400/30 text-sky-300 font-bold">
            100% Tài liệu KHTN 6, 7, 8
          </span>
          <span className="px-1.5 py-0.5 rounded bg-purple-500/15 border border-purple-400/30 text-purple-300 font-bold">
            Không tự bịa đặt (No Hallucination)
          </span>
        </div>
        <a
          href={MD_KNOWLEDGE_FILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          title="Xem toàn văn tài liệu Tổng hợp Kiến thức Khoa học Tự nhiên (Lớp 6, 7, 8)"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 font-extrabold shrink-0 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          <span>Tài liệu KHTN 6, 7, 8</span>
        </a>
      </div>

      {/* Danh sách chuyển nhanh giữa các hiện tượng khoa học vừa xảy ra (nếu bật) */}
      {showHistoryList && phenomenonHistory.length > 0 && (
        <div
          className={`px-3 py-2 border-b max-h-36 overflow-y-auto space-y-1 text-[12px] shrink-0 ${
            isDarkMode
              ? 'bg-[#081020] border-slate-800'
              : 'bg-slate-100 border-slate-200'
          }`}
        >
          <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-70 mb-1">
            Nhật ký hiện tượng khoa học ({phenomenonHistory.length})
          </div>
          {phenomenonHistory.map((item) => {
            const isCurrent = item.id === activeEvent.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectHistoryPhenomenon(item);
                  setShowHistoryList(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                  isCurrent
                    ? isDarkMode
                      ? 'bg-blue-900/60 border border-sky-400/50 text-white font-bold'
                      : 'bg-blue-50 border border-blue-400 text-blue-950 font-bold'
                    : isDarkMode
                      ? 'hover:bg-slate-800/70 text-slate-300'
                      : 'hover:bg-white text-slate-700'
                }`}
              >
                <span className="truncate">{item.title}</span>
                <span className="text-[10px] font-mono opacity-75 shrink-0">
                  {item.timestamp}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Nội dung chính */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-[13px] leading-relaxed">
        {/* 1. Hộp Hiện tượng / Chủ đề đang chọn */}
        <div
          className={`p-3 rounded-xl border ${
            activeEvent.isWarningOrError
              ? isDarkMode
                ? 'bg-rose-950/40 border-rose-500/50 text-rose-100'
                : 'bg-rose-50 border-rose-300 text-rose-950'
              : isDarkMode
                ? 'bg-slate-900/90 border-slate-700/80 text-slate-100'
                : 'bg-slate-50 border-slate-200/90 text-slate-900'
          }`}
        >
          <div className="flex items-center gap-1.5 font-extrabold text-[13px] mb-1">
            {renderCategoryIcon(activeEvent.category)}
            <span>
              {renderTextbookSubscripts(
                sanitizeScientificText(activeEvent.title),
                'ev-title',
              )}
            </span>
          </div>
          <p className="text-[12px] font-medium opacity-95">
            {renderTextbookSubscripts(
              sanitizeScientificText(activeEvent.observation),
              'ev-obs',
            )}
          </p>
        </div>

        {/* 2. Tóm tắt kiến thức trọng tâm */}
        <div
          className={`p-3 rounded-xl border ${
            isDarkMode
              ? 'bg-[#0E1E38]/75 border-sky-500/30 text-slate-100'
              : 'bg-blue-50/70 border-blue-200 text-[#0F2942]'
          }`}
        >
          <div className="flex items-center justify-between gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-sky-400 mb-1">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Kiến thức trọng tâm & Công thức</span>
            </span>
          </div>
          <p className="text-[12px] leading-relaxed">
            {renderTextbookSubscripts(
              sanitizeScientificText(activeEvent.scientificExplanation),
              'ev-exp',
            )}
          </p>

          {activeEvent.formula && (
            <div
              className={`mt-2 px-2.5 py-1.5 rounded-lg border font-mono text-[11.5px] font-bold flex items-center justify-between ${
                isDarkMode
                  ? 'bg-[#07101F] border-amber-400/40 text-amber-300'
                  : 'bg-white border-blue-300 text-blue-900'
              }`}
            >
              <span className="truncate">
                {renderTextbookSubscripts(
                  sanitizeScientificText(activeEvent.formula),
                  'ev-form',
                )}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-1" />
            </div>
          )}

          {activeEvent.metrologyNote && (
            <div
              className={`mt-2 pt-2 border-t text-[11.5px] flex items-start gap-1.5 ${
                isDarkMode
                  ? 'border-slate-700/70 text-amber-200/90'
                  : 'border-blue-200/80 text-slate-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>Lưu ý thực hành:</strong>{' '}
                {renderTextbookSubscripts(
                  sanitizeScientificText(activeEvent.metrologyNote),
                  'ev-note',
                )}
              </span>
            </div>
          )}
        </div>

        {/* 3. Tra cứu nhanh theo khối lớp */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider opacity-80">
              Chủ đề trọng tâm theo lớp:
            </span>
            <button
              type="button"
              onClick={() => setShowMdCatalog((v) => !v)}
              className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
            >
              {showMdCatalog
                ? 'Thu gọn hiện tượng & bài tập ▲'
                : 'Xem thêm hiện tượng & bài tập ▼'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {QUICK_GRADE_QUESTIONS.map((item) => (
              <button
                key={item.grade}
                type="button"
                disabled={isAskingAi}
                onClick={() => handleSendQuestion(item.question)}
                className={`text-left px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-900/90 hover:bg-slate-800 border-slate-700/90 text-slate-200'
                    : 'bg-slate-100 hover:bg-blue-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="text-[11px] font-extrabold text-amber-400">
                  📘 {item.grade}
                </div>
                <div className="text-[11px] truncate opacity-90">
                  {item.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 3B. Danh mục Hiện tượng đời sống & Bài tập thực hành */}
        {showMdCatalog && (
          <div
            className={`p-2.5 rounded-xl border space-y-1.5 ${
              isDarkMode
                ? 'bg-slate-900/90 border-amber-400/30'
                : 'bg-amber-50/60 border-amber-200'
            }`}
          >
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
              Hiện tượng thực tế & Bài tập mẫu
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {MD_FORMULA_AND_PHENOMENA_CHIPS.map((chip) => (
                <button
                  key={chip.title}
                  type="button"
                  disabled={isAskingAi}
                  onClick={() => handleSendQuestion(chip.question)}
                  className={`text-left px-2.5 py-1.5 rounded-lg border flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    isDarkMode
                      ? 'bg-[#081020] hover:bg-slate-800 border-slate-700 text-slate-200'
                      : 'bg-white hover:bg-blue-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <span className="text-[11.5px] font-semibold truncate">
                    {chip.title}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold shrink-0">
                    {chip.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. Gợi ý câu hỏi thảo luận nhanh */}
        {activeEvent.suggestedQuestions.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-extrabold uppercase tracking-wider opacity-70">
              Gợi ý câu hỏi nhanh:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeEvent.suggestedQuestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={isAskingAi}
                  onClick={() => handleSendQuestion(q)}
                  className={`text-left text-[11.5px] px-2.5 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
                    isDarkMode
                      ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-sky-300'
                      : 'bg-slate-100 hover:bg-blue-50 border-slate-200 text-[#1D4ED8]'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 5. Luồng hội thoại hỏi đáp */}
        {currentMessages.length > 0 && (
          <div className="space-y-2.5 pt-2 border-t border-slate-500/20">
            <div className="text-[11px] font-extrabold uppercase tracking-wider opacity-75">
              Hội thoại trực tiếp
            </div>
            {currentMessages.map((m) => (
              <div
                key={m.id}
                className={`p-2.5 rounded-xl text-[12.5px] leading-relaxed ${
                  m.role === 'user'
                    ? isDarkMode
                      ? 'bg-blue-600/30 border border-blue-400/40 text-white ml-6'
                      : 'bg-[#1D4ED8] text-white ml-6'
                    : isDarkMode
                      ? 'bg-slate-900/95 border border-slate-700 text-slate-100 mr-1'
                      : 'bg-slate-100 border border-slate-200 text-slate-900 mr-1'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] opacity-75 mb-1 font-bold">
                  <span>
                    {m.role === 'user'
                      ? 'Bạn hỏi'
                      : '💡 Trợ lý Khoa học Tự nhiên'}
                  </span>
                  <span>{m.timestamp}</span>
                </div>

                {m.role === 'assistant' && m.textbookRef && (
                  <div
                    className={`mb-1.5 px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 ${
                      isDarkMode
                        ? 'bg-amber-500/15 border border-amber-400/30 text-amber-300'
                        : 'bg-amber-50 border border-amber-300 text-amber-900'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{m.textbookRef}</span>
                  </div>
                )}

                {m.role === 'assistant' ? (
                  renderFormattedConciseText(m.text)
                ) : (
                  <div className="whitespace-pre-line">{m.text}</div>
                )}

                {m.role === 'assistant' &&
                  m.sources &&
                  m.sources.length > 0 && (
                    <div
                      className={`mt-2 pt-2 border-t text-[11px] space-y-1 ${
                        isDarkMode ? 'border-slate-800' : 'border-slate-200'
                      }`}
                    >
                      <div className="font-bold opacity-75 flex items-center gap-1">
                        <span>Nguồn tham khảo:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {m.sources.map((src, idx) => (
                          <a
                            key={`${src.uri}-${idx}`}
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={src.title}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10.5px] font-semibold transition-colors max-w-full ${
                              isDarkMode
                                ? 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-sky-300'
                                : 'bg-white hover:bg-blue-50 border-slate-300 text-blue-700'
                            }`}
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[220px]">
                              {src.title}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}

        {isAskingAi && (
          <div
            className={`p-2.5 rounded-xl text-[12px] font-semibold flex items-center gap-2 ${
              isDarkMode
                ? 'bg-slate-900/80 text-amber-300'
                : 'bg-slate-100 text-blue-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Đang phân tích và giải đáp...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Ô nhập câu hỏi thảo luận thêm */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendQuestion();
        }}
        className={`p-2.5 border-t flex items-center gap-2 shrink-0 ${
          isDarkMode
            ? 'bg-[#081020] border-slate-800'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        <input
          type="text"
          value={questionInput}
          onChange={(e) => setQuestionInput(e.target.value)}
          placeholder="Nhập bất kỳ câu hỏi Vật lí, Hóa học, Sinh học hoặc bài tập..."
          disabled={isAskingAi}
          className={`flex-1 h-9 px-3 rounded-xl text-[12.5px] border outline-none transition-colors ${
            isDarkMode
              ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-400 focus:border-amber-400'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-600'
          }`}
        />
        <button
          type="submit"
          disabled={!questionInput.trim() || isAskingAi}
          title="Gửi câu hỏi"
          className="h-9 px-3 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-45 text-white font-bold text-[12px] flex items-center gap-1 cursor-pointer transition-colors shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Hỏi</span>
        </button>
      </form>
    </div>
  );
};



