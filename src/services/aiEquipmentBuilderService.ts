import {
  EquipmentCategoryId,
  ProceduralArchetype,
  ScienceSubject,
} from '../domain/types';

export type AiEquipmentShapeFamily =
  | 'custom-apparatus'
  | 'permanent-magnet'
  | 'magnetic-compass'
  | 'analog-ammeter-voltmeter'
  | 'digital-multimeter'
  | 'rheostat'
  | 'graduated-glassware'
  | 'test-tube'
  | 'conical-flask'
  | 'spring-dynamometer'
  | 'electronic-balance'
  | 'thermometer'
  | 'optical-lens'
  | 'optical-prism'
  | 'laser-source'
  | 'microscope-biology'
  | 'alcohol-burner';

export interface ParametricTemplateDefinition {
  templateId: AiEquipmentShapeFamily;
  nameVi: string;
  shortLabelVi: string;
  badgeIcon: string;
  defaultCategory: EquipmentCategoryId;
  geometryStructureSummaryVi: string;
  mappedParametersVi: string[];
  interactiveBehaviorSummaryVi: string;
}

export const PARAMETRIC_3D_TEMPLATES: ParametricTemplateDefinition[] = [
  {
    templateId: 'custom-apparatus',
    nameVi: 'Tổ hợp 3D Đa bộ phận theo Ảnh & Mô tả thực tế (AI Vision Multi-Part)',
    shortLabelVi: 'Dựng theo Ảnh & Mô tả thực tế',
    badgeIcon: '🛠️',
    defaultCategory: 'measuring-instrument',
    geometryStructureSummaryVi:
      'Phân tích trực tiếp hình ảnh thực tế và mô tả của người dùng để bóc tách thành các khối bộ phận hình học chuẩn xác theo đúng tỷ lệ, vị trí X–Y–Z và màu sắc gốc trên ảnh (không dùng khuôn mẫu cứng).',
    mappedParametersVi: [
      'Tỷ lệ kích thước 3 chiều Cao × Rộng × Bề dày (cm)',
      'Các bộ phận cấu thành trích xuất trực tiếp từ ảnh & mô tả',
      'Bảng màu PBR & Độ trong suốt theo đúng ảnh thực tế',
    ],
    interactiveBehaviorSummaryVi:
      'Cập nhật trạng thái hoạt động và thông số đo trực tiếp theo nguyên lý vận hành người dùng mô tả.',
  },
  {
    templateId: 'permanent-magnet',
    nameVi: 'Template Nam châm vĩnh cửu N–S (Thanh thẳng / Chữ U / Tròn)',
    shortLabelVi: 'Nam châm vĩnh cửu (N–S)',
    badgeIcon: '🧲',
    defaultCategory: 'electrical-equipment',
    geometryStructureSummaryVi:
      'Khối nam châm vĩnh cửu hợp kim Alnico / Ferrite từ tính cao (dạng Thanh hộp dài, Chữ U móng ngựa hoặc Vành khuyên tròn), phân định rõ 2 nửa Cực Bắc (North - sơn Đỏ, ký hiệu N) và Cực Nam (South - sơn Xanh, ký hiệu S) kèm đường sức từ trường N → S.',
    mappedParametersVi: [
      'Chiều dài / Chiều rộng × Chiều cao × Bề dày (cm)',
      'Kiểu dáng hình học: Thanh nam châm thẳng / Nam châm chữ U / Nam châm tròn',
      'Phân cực từ tính rõ ràng: Cực Bắc (N - Đỏ #DC2626) & Cực Nam (S - Xanh #1D4ED8)',
      'Cảm ứng từ trường B (0 → 500 mT)',
    ],
    interactiveBehaviorSummaryVi:
      'Hiển thị rõ phân cực N–S và các đường sức từ trường cong nối từ Cực Bắc (N) sang Cực Nam (S), thay đổi mật độ từ thông theo thanh trượt cảm ứng từ B (mT).',
  },
  {
    templateId: 'magnetic-compass',
    nameVi: 'Template La bàn / Kim nam châm thử từ trường (Magnetic Compass)',
    shortLabelVi: 'La bàn / Kim nam châm',
    badgeIcon: '🧭',
    defaultCategory: 'electrical-equipment',
    geometryStructureSummaryVi:
      'Đế trụ và mặt chia độ phương hướng 360° (Bắc N - Đông E - Nam S - Tây W), trụ kim nhọn đồng thau ở tâm và kim nam châm hình thoi dẹt phân cực Đỏ (N) – Xanh/Trắng (S) quay tự do.',
    mappedParametersVi: [
      'Đường kính mặt la bàn & Chiều cao trụ đỡ (cm)',
      'Góc định hướng kim nam châm α (-180° → +180°)',
      'Màu phân cực kim từ Cực Bắc (N - Đỏ) & Cực Nam (S - Xanh)',
    ],
    interactiveBehaviorSummaryVi:
      'Kim nam châm N–S xoay mượt trên mũi nhọn theo góc phương vị hoặc hướng từ trường ngoài.',
  },
  {
    templateId: 'analog-ammeter-voltmeter',
    nameVi: 'Template Ampe kế / Vôn kế kim chỉ (Analog Meter)',
    shortLabelVi: 'Ampe kế / Vôn kế',
    badgeIcon: '⚡',
    defaultCategory: 'electrical-equipment',
    geometryStructureSummaryVi:
      'Hộp vỏ máy kỹ thuật bo góc PBR, hốc mặt đồng hồ lõm sâu, mặt kính cong có vạch chia độ & gương chống thị sai, kim chỉ 3D và các chốt cắm điện cực âm (− đen) / dương (+ đỏ).',
    mappedParametersVi: [
      'Chiều cao × Rộng × Sâu vỏ hộp (cm)',
      'Đại lượng đo (A, V, mA, G) & Giới hạn đo',
      'Số lượng chốt cắm điện cực (2 hoặc 3 chốt)',
      'Màu sắc thân vỏ nhựa kỹ thuật ABS',
    ],
    interactiveBehaviorSummaryVi:
      'Kim đồng hồ 3D quay mượt trên cung chia độ theo thanh trượt dòng điện / hiệu điện thế, đồng bộ với bảng số đo trực tiếp.',
  },
  {
    templateId: 'rheostat',
    nameVi: 'Template Biến trở con chạy (Sliding Rheostat)',
    shortLabelVi: 'Biến trở con chạy',
    badgeIcon: '🎚️',
    defaultCategory: 'electrical-equipment',
    geometryStructureSummaryVi:
      'Hai chân giá đỡ hợp kim sơn tĩnh điện, ống sứ quấn sát các vòng dây hợp kim Nikelin, thanh dẫn hướng mạ crom, con chạy và 3 chốt cắm điện cực.',
    mappedParametersVi: [
      'Chiều dài × Rộng × Cao biến trở (cm)',
      'Điện trở tối đa R_max (Ω)',
      'Vị trí con chạy & Màu sắc chi tiết',
    ],
    interactiveBehaviorSummaryVi:
      'Con chạy 3D trượt dọc theo cuộn dây khi kéo thanh trượt điện trở R (Ω).',
  },
  {
    templateId: 'graduated-glassware',
    nameVi: 'Template Ống đong / Cốc đong chia độ (Graduated Glassware)',
    shortLabelVi: 'Ống đong / Cốc đong',
    badgeIcon: '🥛',
    defaultCategory: 'volume-measurement',
    geometryStructureSummaryVi:
      'Thân bình trụ thủy tinh Borosilicate trong suốt có vòi rót, đế lục giác chống lật, thang vạch chia thể tích ml và cột chất lỏng mặt khum lõm (meniscus) bên trong.',
    mappedParametersVi: [
      'Chiều cao bình (cm) & Đường kính thân (cm)',
      'Dung tích tối đa V (ml) trên vạch chia',
      'Độ trong suốt thủy tinh & Màu dung dịch',
    ],
    interactiveBehaviorSummaryVi:
      'Cột chất lỏng bên trong dâng cao / hạ thấp mượt mà theo thanh trượt thể tích V (ml).',
  },
  {
    templateId: 'test-tube',
    nameVi: 'Template Ống nghiệm & Giá đỡ (Test Tube & Rack)',
    shortLabelVi: 'Ống nghiệm & Giá đỡ',
    badgeIcon: '🧪',
    defaultCategory: 'chemical-apparatus',
    geometryStructureSummaryVi:
      'Ống nghiệm thủy tinh đáy tròn thành dày chịu nhiệt có vạch chia độ và cột dung dịch hóa học bên trong, đặt thẳng đứng trên giá đỡ 2 tầng.',
    mappedParametersVi: [
      'Chiều cao & Đường kính ống nghiệm (cm)',
      'Dung tích ống nghiệm V (ml)',
      'Màu sắc giá đỡ & Dung dịch hóa học',
    ],
    interactiveBehaviorSummaryVi:
      'Mực dung dịch trong ống nghiệm thay đổi trực tiếp theo thanh trượt thể tích V (ml).',
  },
  {
    templateId: 'conical-flask',
    nameVi: 'Template Bình tam giác Erlenmeyer / Bình cầu (Flask)',
    shortLabelVi: 'Bình tam giác / Bình cầu',
    badgeIcon: '⚗️',
    defaultCategory: 'chemical-apparatus',
    geometryStructureSummaryVi:
      'Thân bình thủy tinh đáy bầu / hình nón cụt phình rộng, cổ bình thu nhỏ có vành miệng bo tròn chịu nhiệt, vạch chia độ và khối chất lỏng bên trong.',
    mappedParametersVi: [
      'Chiều cao bình & Đường kính đáy bầu (cm)',
      'Dung tích định mức V (ml)',
      'Màu dung dịch phản ứng',
    ],
    interactiveBehaviorSummaryVi:
      'Mực dung dịch hóa học co giãn chuẩn theo biên dạng bầu của bình khi kéo thanh trượt.',
  },
  {
    templateId: 'spring-dynamometer',
    nameVi: 'Template Lực kế lò xo (Spring Dynamometer)',
    shortLabelVi: 'Lực kế lò xo',
    badgeIcon: '🪝',
    defaultCategory: 'force-measurement',
    geometryStructureSummaryVi:
      'Giá đỡ kim loại chữ L, thân lực kế có hốc chứa lò xo thép xoắn ốc 3D thật, bảng vạch chia lực (N), kim chỉ thị đỏ và móc treo quả nặng.',
    mappedParametersVi: [
      'Chiều cao & Kích thước thân lực kế (cm)',
      'Giới hạn đo lực tối đa F_max (N)',
      'Độ cứng & Độ dãn lò xo Δl',
    ],
    interactiveBehaviorSummaryVi:
      'Lò xo xoắn và kim chỉ thị dãn xuống chính xác theo lực kéo F (N).',
  },
  {
    templateId: 'electronic-balance',
    nameVi: 'Template Cân điện tử hiện số (Electronic Balance)',
    shortLabelVi: 'Cân điện tử',
    badgeIcon: '⚖️',
    defaultCategory: 'mass-measurement',
    geometryStructureSummaryVi:
      'Thân vỏ nhựa kỹ thuật ABS đúc bo góc, đĩa cân Inox 304 tròn phẳng, màn hình LCD kỹ thuật số có kính cong bảo vệ và cụm phím ON/OFF, MODE, TARE.',
    mappedParametersVi: [
      'Kích thước bàn cân & Đĩa cân (cm)',
      'Giới hạn cân tối đa m_max (g)',
      'Độ chia nhỏ nhất (0.01 g / 0.1 g)',
    ],
    interactiveBehaviorSummaryVi:
      'Đĩa cân lún nhẹ đàn hồi và màn hình LCD cập nhật trực tiếp khối lượng m (g).',
  },
  {
    templateId: 'thermometer',
    nameVi: 'Template Nhiệt kế phòng thí nghiệm (Thermometer)',
    shortLabelVi: 'Nhiệt kế',
    badgeIcon: '🌡️',
    defaultCategory: 'thermal-equipment',
    geometryStructureSummaryVi:
      'Bầu thủy ngân / rượu màu đỏ nhạy nhiệt ở đáy, ống mao dẫn thủy tinh trong suốt và bảng khắc vạch chia nhiệt độ từ 0 đến 100 °C.',
    mappedParametersVi: [
      'Chiều cao nhiệt kế (cm)',
      'Thang đo nhiệt độ (°C)',
      'Màu chất lỏng chỉ thị nhiệt',
    ],
    interactiveBehaviorSummaryVi:
      'Cột chất lỏng màu đỏ trong ống mao dẫn dâng cao / hạ thấp theo nhiệt độ t (°C).',
  },
  {
    templateId: 'optical-lens',
    nameVi: 'Template Thấu kính quang học (Optical Lens)',
    shortLabelVi: 'Thấu kính quang học',
    badgeIcon: '🔍',
    defaultCategory: 'optical-equipment',
    geometryStructureSummaryVi:
      'Đế quang học vững chắc, trụ đứng khắc vạch, vành giữ hợp kim nhôm và thấu kính 2 mặt cong quang học BK7 trong suốt.',
    mappedParametersVi: [
      'Chiều cao giá đỡ & Đường kính thấu kính (cm)',
      'Tiêu cự thấu kính f (cm)',
      'Góc xoay thấu kính (°)',
    ],
    interactiveBehaviorSummaryVi:
      'Vành thấu kính xoay trực tiếp theo góc tới trên thanh trượt.',
  },
  {
    templateId: 'microscope-biology',
    nameVi: 'Template Kính hiển vi quang học (Optical Microscope)',
    shortLabelVi: 'Kính hiển vi',
    badgeIcon: '🔬',
    defaultCategory: 'biology-microscopy',
    geometryStructureSummaryVi:
      'Chân đế hình móng ngựa đúc nguyên khối, thân giá đỡ cong, bàn để tiêu bản có kẹp giữ, đèn chiếu sáng, mâm xoay 3 vật kính và ống thị kính nghiêng 45°.',
    mappedParametersVi: [
      'Chiều cao × Rộng × Bề dày kính hiển vi (cm)',
      'Độ phóng đại thị kính / vật kính (40× → 400×)',
      'Màu sắc thân vỏ & Chi tiết kim loại',
    ],
    interactiveBehaviorSummaryVi:
      'Mâm xoay vật kính và bàn tiêu bản dịch chuyển theo độ phóng đại G (×).',
  },
  {
    templateId: 'digital-multimeter',
    nameVi: 'Template Đồng hồ vạn năng / Máy đo hiện số (Digital Meter)',
    shortLabelVi: 'Đồng hồ vạn năng số',
    badgeIcon: '📟',
    defaultCategory: 'electrical-equipment',
    geometryStructureSummaryVi:
      'Thân vỏ máy đo kỹ thuật số bọc viền chống sốc, màn hình LCD lớn, núm xoay chọn thang đo 3D ở giữa và 3 chốt cắm giắc đo.',
    mappedParametersVi: [
      'Chiều cao × Rộng × Bề dày thân máy (cm)',
      'Đại lượng đo & Giới hạn đo',
      'Màu sắc vỏ chống sốc & Thân máy',
    ],
    interactiveBehaviorSummaryVi:
      'Núm xoay thang đo và màn hình LCD cập nhật trực tiếp theo giá trị đo.',
  },
  {
    templateId: 'alcohol-burner',
    nameVi: 'Template Đèn cồn thí nghiệm (Alcohol Burner)',
    shortLabelVi: 'Đèn cồn thí nghiệm',
    badgeIcon: '🔥',
    defaultCategory: 'thermal-equipment',
    geometryStructureSummaryVi:
      'Bầu thủy tinh Borosilicate phình to ở đáy, cổ thắt nhỏ, vòi giữ bấc kim loại có khía, bấc vải cotton bện xoắn và nắp chụp dập lửa bằng đồng/inox.',
    mappedParametersVi: [
      'Chiều cao tổng thể (cm)',
      'Đường kính bầu thủy tinh (cm)',
      'Dung tích bầu chứa cồn (ml)',
      'Chất liệu & Màu cổ/nắp chụp (Đồng thau / Inox)',
      'Nhiệt độ ngọn lửa & Tương tác đun nóng ống nghiệm (0 → 780 °C)',
    ],
    interactiveBehaviorSummaryVi:
      'Bấm nút Bật/Tắt ngọn lửa để đóng/mở nắp chụp kim loại, hiệu ứng ngọn lửa 3 lớp bập bùng và tỏa nhiệt lượng đối lưu đun sôi ống nghiệm đặt phía trên.',
  },
];

/**
 * NGHIÊM CẤM DÙNG MẪU MẶC ĐỊNH ĐÈN CỒN:
 * Nếu id không khớp hoặc để trống, luôn trả về 'custom-apparatus' (Tổ hợp 3D đa bộ phận theo ảnh & mô tả thực tế).
 */
export function getParametricTemplateById(
  id: AiEquipmentShapeFamily | '',
): ParametricTemplateDefinition {
  const customDefault =
    PARAMETRIC_3D_TEMPLATES.find((t) => t.templateId === 'custom-apparatus') ||
    PARAMETRIC_3D_TEMPLATES[0];
  if (!id) return customDefault;
  return (
    PARAMETRIC_3D_TEMPLATES.find((t) => t.templateId === id) || customDefault
  );
}

export type DetectedBaseShapeType = 'Cylinder' | 'Box';

export interface ShapeClassificationResult {
  shapeType: DetectedBaseShapeType;
  matchedKeywords: string[];
  labelVi: string;
  hideDepthInput: boolean;
}

export interface ImageSliceProfile {
  sliceIndex: number;
  yCenterNorm: number; // 0 (bottom) -> 1 (top)
  heightNorm: number;
  widthNorm: number;
  xOffsetNorm: number; // -0.5 -> +0.5
  colorHex: string;
  isHollowCenter: boolean;
  isSplitLeftRight: boolean;
  leftColorHex?: string;
  rightColorHex?: string;
}

export interface AiImageVisionTelemetry {
  aspectRatioWH: number;
  isBipolarMagnetImage: boolean;
  detectedTopology:
    | 'bar-magnet'
    | 'u-magnet'
    | 'ring-magnet'
    | 'compass-dial'
    | 'horizontal-bar'
    | 'u-shape'
    | 'ring-torus'
    | 'multi-part-object';
  redPoleHex: string;
  bluePoleHex: string;
  primaryBodyHex: string;
  secondaryBodyHex: string;
  accentHex: string;
  redPoleSide: 'left' | 'right' | 'top' | 'bottom';
  sliceProfiles: ImageSliceProfile[];
  visionSummaryVi: string;
}

/**
 * BỘ PHÂN TÍCH HÌNH ẢNH THỰC TẾ TRÊN CANVAS (TRUE AI VISION MULTI-PART PIXEL & TOPOLOGY PARSER):
 * Trích xuất trực tiếp từ ảnh tải lên:
 * 1. Tỷ lệ khung hình thực của vật thể (aspectRatioWH) sau khi tách nền.
 * 2. Nhận diện phân cực Đỏ (Cực Bắc N) – Xanh (Cực Nam S) của Nam châm vĩnh cửu (Thanh / Chữ U / Tròn / La bàn).
 * 3. Nhận diện cấu trúc hình học đặc trưng: Khối chữ U (hở giữa, 2 nhánh trái/phải), Khối thanh ngang dài, Khối vành khuyên rỗng tâm, hoặc Lát cắt đa tầng (sliceProfiles) theo đúng biên dạng ảnh gốc.
 */
export function analyzeImagePixelsOnCanvas(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  fileName = '',
): AiImageVisionTelemetry {
  const toHex = (r: number, g: number, b: number) =>
    `#${[r, g, b]
      .map((x) =>
        Math.max(0, Math.min(255, Math.round(x)))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
      .toUpperCase()}`;

  const imgData = ctx.getImageData(0, 0, w, h).data;

  // Lấy màu nền trung bình từ 4 góc ảnh
  const cornerSamples: Array<[number, number, number]> = [];
  const sampleCoords = [
    [2, 2],
    [w - 3, 2],
    [2, h - 3],
    [w - 3, h - 3],
    [Math.floor(w * 0.5), 2],
    [2, Math.floor(h * 0.5)],
  ];
  for (const [cx, cy] of sampleCoords) {
    const sx = Math.max(0, Math.min(w - 1, cx));
    const sy = Math.max(0, Math.min(h - 1, cy));
    const idx = (sy * w + sx) * 4;
    if (imgData[idx + 3] > 120) {
      cornerSamples.push([imgData[idx], imgData[idx + 1], imgData[idx + 2]]);
    }
  }
  const bgR =
    cornerSamples.length > 0
      ? cornerSamples.reduce((s, c) => s + c[0], 0) / cornerSamples.length
      : 248;
  const bgG =
    cornerSamples.length > 0
      ? cornerSamples.reduce((s, c) => s + c[1], 0) / cornerSamples.length
      : 248;
  const bgB =
    cornerSamples.length > 0
      ? cornerSamples.reduce((s, c) => s + c[2], 0) / cornerSamples.length
      : 248;

  const isForegroundPixel = (r: number, g: number, b: number, a: number) => {
    if (a < 90) return false;
    const distBg = Math.sqrt(
      (r - bgR) * (r - bgR) + (g - bgG) * (g - bgG) + (b - bgB) * (b - bgB),
    );
    if (distBg < 26) return false;
    // Bỏ qua nền trắng sáng tiêu chuẩn
    if (r > 244 && g > 244 && b > 244) return false;
    return true;
  };

  let minX = w,
    maxX = 0,
    minY = h,
    maxY = 0;
  let fgCount = 0;
  let redCount = 0,
    blueCount = 0;
  let redSumX = 0,
    redSumY = 0;
  let blueSumX = 0,
    blueSumY = 0;
  let redR = 220,
    redG = 38,
    redB = 38;
  let blueR = 29,
    blueG = 78,
    blueB = 216;
  let rTotal = 0,
    gTotal = 0,
    bTotal = 0;
  let maxSat = -1;
  let accR = 220,
    accG = 38,
    accB = 38;

  const step = Math.max(1, Math.floor(Math.min(w, h) / 120));

  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const i = (y * w + x) * 4;
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];
      const a = imgData[i + 3];
      if (!isForegroundPixel(r, g, b, a)) continue;

      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      fgCount++;
      rTotal += r;
      gTotal += g;
      bTotal += b;

      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const sat = maxC > 0 ? (maxC - minC) / maxC : 0;
      if (sat > maxSat && maxC > 55 && minC < 225) {
        maxSat = sat;
        accR = r;
        accG = g;
        accB = b;
      }

      // Nhận diện vùng màu Đỏ (Cực Bắc N)
      if (r > 135 && r > g * 1.32 && r > b * 1.32 && r - Math.max(g, b) > 32) {
        redCount++;
        redSumX += x;
        redSumY += y;
        redR = Math.round(redR * 0.85 + r * 0.15);
        redG = Math.round(redG * 0.85 + g * 0.15);
        redB = Math.round(redB * 0.85 + b * 0.15);
      }
      // Nhận diện vùng màu Xanh dương / Xanh lam (Cực Nam S)
      else if (
        b > 115 &&
        b > r * 1.25 &&
        b - r > 28 &&
        g < b * 1.08
      ) {
        blueCount++;
        blueSumX += x;
        blueSumY += y;
        blueR = Math.round(blueR * 0.85 + r * 0.15);
        blueG = Math.round(blueG * 0.85 + g * 0.15);
        blueB = Math.round(blueB * 0.85 + b * 0.15);
      }
    }
  }

  if (fgCount < 12 || maxX <= minX || maxY <= minY) {
    minX = Math.floor(w * 0.12);
    maxX = Math.floor(w * 0.88);
    minY = Math.floor(h * 0.12);
    maxY = Math.floor(h * 0.88);
    fgCount = Math.max(1, fgCount);
  }

  const bboxW = Math.max(10, maxX - minX);
  const bboxH = Math.max(10, maxY - minY);
  const aspectRatioWH = Number((bboxW / bboxH).toFixed(2));

  const redRatio = redCount / Math.max(1, fgCount);
  const blueRatio = blueCount / Math.max(1, fgCount);

  const redCxNorm =
    redCount > 0 ? (redSumX / redCount - minX) / bboxW : 0.25;
  const redCyNorm =
    redCount > 0 ? (redSumY / redCount - minY) / bboxH : 0.5;
  const blueCxNorm =
    blueCount > 0 ? (blueSumX / blueCount - minX) / bboxW : 0.75;
  const blueCyNorm =
    blueCount > 0 ? (blueSumY / blueCount - minY) / bboxH : 0.5;

  const poleSeparation = Math.hypot(
    redCxNorm - blueCxNorm,
    redCyNorm - blueCyNorm,
  );

  const lowerFile = fileName.toLowerCase();
  const fileMentionsMagnet =
    lowerFile.includes('nam-cham') ||
    lowerFile.includes('nam_cham') ||
    lowerFile.includes('namcham') ||
    lowerFile.includes('magnet');

  // Ảnh có 2 miền màu Đỏ (N) và Xanh (S) tách biệt rõ ràng -> Nam châm vĩnh cửu phân cực N–S!
  const isBipolarMagnetImage =
    fileMentionsMagnet ||
    (redRatio >= 0.045 && blueRatio >= 0.045 && poleSeparation >= 0.14);

  let redPoleSide: 'left' | 'right' | 'top' | 'bottom' = 'left';
  if (Math.abs(redCxNorm - blueCxNorm) >= Math.abs(redCyNorm - blueCyNorm)) {
    redPoleSide = redCxNorm <= blueCxNorm ? 'left' : 'right';
  } else {
    redPoleSide = redCyNorm <= blueCyNorm ? 'top' : 'bottom';
  }

  // Quét 4 lát cắt ngang từ Đáy (slice 0) lên Đỉnh (slice 3) để lấy biên dạng thực tế của vật thể trong ảnh
  const numSlices = 4;
  const sliceProfiles: ImageSliceProfile[] = [];
  let hollowCenterSlices = 0;

  for (let s = 0; s < numSlices; s++) {
    // s = 0 là đáy (y gần maxY), s = numSlices - 1 là đỉnh (y gần minY)
    const yStart = Math.floor(maxY - ((s + 1) / numSlices) * bboxH);
    const yEnd = Math.floor(maxY - (s / numSlices) * bboxH);

    let sMinX = maxX,
      sMaxX = minX;
    let sFg = 0;
    let sR = 0,
      sG = 0,
      sB = 0;
    let leftFg = 0,
      midFg = 0,
      rightFg = 0;
    let leftR = 0,
      leftG = 0,
      leftB = 0;
    let rightR = 0,
      rightG = 0,
      rightB = 0;

    for (let y = Math.max(0, yStart); y < Math.min(h, yEnd); y += step) {
      for (let x = minX; x <= maxX; x += step) {
        const idx = (y * w + x) * 4;
        const r = imgData[idx];
        const g = imgData[idx + 1];
        const b = imgData[idx + 2];
        const a = imgData[idx + 3];
        if (!isForegroundPixel(r, g, b, a)) continue;

        if (x < sMinX) sMinX = x;
        if (x > sMaxX) sMaxX = x;
        sFg++;
        sR += r;
        sG += g;
        sB += b;

        const relX = (x - minX) / bboxW;
        if (relX < 0.36) {
          leftFg++;
          leftR += r;
          leftG += g;
          leftB += b;
        } else if (relX > 0.64) {
          rightFg++;
          rightR += r;
          rightG += g;
          rightB += b;
        } else {
          midFg++;
        }
      }
    }

    const sliceW = sFg > 3 && sMaxX > sMinX ? (sMaxX - sMinX) / bboxW : 0.65;
    const sliceCenterX =
      sFg > 3 && sMaxX > sMinX
        ? ((sMinX + sMaxX) / 2 - (minX + maxX) / 2) / bboxW
        : 0;

    // Kiểm tra xem lát cắt này có bị rỗng ở giữa (như 2 nhánh chữ U hoặc lòng vành khuyên) không
    const isHollowCenter =
      leftFg > 5 && rightFg > 5 && midFg < Math.min(leftFg, rightFg) * 0.35;
    if (isHollowCenter) hollowCenterSlices++;

    const avgHex =
      sFg > 0
        ? toHex(sR / sFg, sG / sFg, sB / sFg)
        : '#334155';
    const lHex =
      leftFg > 0
        ? toHex(leftR / leftFg, leftG / leftFg, leftB / leftFg)
        : avgHex;
    const rHex =
      rightFg > 0
        ? toHex(rightR / rightFg, rightG / rightFg, rightB / rightFg)
        : avgHex;

    sliceProfiles.push({
      sliceIndex: s,
      yCenterNorm: Number(((s + 0.5) / numSlices).toFixed(3)),
      heightNorm: Number((0.88 / numSlices).toFixed(3)),
      widthNorm: Number(Math.max(0.18, Math.min(1.0, sliceW)).toFixed(3)),
      xOffsetNorm: Number(
        Math.max(-0.35, Math.min(0.35, sliceCenterX)).toFixed(3),
      ),
      colorHex: avgHex,
      isHollowCenter,
      isSplitLeftRight: isHollowCenter || isBipolarMagnetImage,
      leftColorHex: lHex,
      rightColorHex: rHex,
    });
  }

  // Phân loại cấu trúc hình học (Topology) từ dữ liệu điểm ảnh
  const topHollowBottomSolid =
    (sliceProfiles[2]?.isHollowCenter || sliceProfiles[3]?.isHollowCenter) &&
    !sliceProfiles[0]?.isHollowCenter;
  const bottomHollowTopSolid =
    (sliceProfiles[0]?.isHollowCenter || sliceProfiles[1]?.isHollowCenter) &&
    !sliceProfiles[3]?.isHollowCenter;
  const isUShapeProfile =
    topHollowBottomSolid ||
    bottomHollowTopSolid ||
    lowerFile.includes('chu-u') ||
    lowerFile.includes('mong-ngua') ||
    lowerFile.includes('horseshoe');
  const isRingProfile =
    !isUShapeProfile &&
    sliceProfiles[1]?.isHollowCenter &&
    sliceProfiles[2]?.isHollowCenter &&
    !sliceProfiles[0]?.isHollowCenter &&
    !sliceProfiles[3]?.isHollowCenter;

  let detectedTopology: AiImageVisionTelemetry['detectedTopology'] =
    'multi-part-object';

  if (isBipolarMagnetImage) {
    if (isUShapeProfile) {
      detectedTopology = 'u-magnet';
    } else if (isRingProfile) {
      detectedTopology = 'ring-magnet';
    } else {
      detectedTopology = 'bar-magnet';
    }
  } else if (isUShapeProfile) {
    detectedTopology = 'u-shape';
  } else if (isRingProfile) {
    detectedTopology = 'ring-torus';
  } else if (aspectRatioWH >= 1.48) {
    detectedTopology = 'horizontal-bar';
  }

  const avgR = Math.round(rTotal / Math.max(1, fgCount));
  const avgG = Math.round(gTotal / Math.max(1, fgCount));
  const avgB = Math.round(bTotal / Math.max(1, fgCount));

  const redPoleHex = redCount > 4 ? toHex(redR, redG, redB) : '#DC2626';
  const bluePoleHex = blueCount > 4 ? toHex(blueR, blueG, blueB) : '#1D4ED8';
  const primaryBodyHex = isBipolarMagnetImage
    ? redPoleHex
    : toHex(avgR, avgG, avgB);
  const secondaryBodyHex = isBipolarMagnetImage
    ? bluePoleHex
    : toHex(avgR * 0.72, avgG * 0.72, avgB * 0.76);
  const accentHex =
    maxSat > 0.22 ? toHex(accR, accG, accB) : isBipolarMagnetImage ? '#DC2626' : '#0EA5E9';

  const visionSummaryVi = isBipolarMagnetImage
    ? detectedTopology === 'u-magnet'
      ? `AI Vision nhận diện từ ảnh: Nam châm chữ U (Móng ngựa) phân cực Bắc N (${redPoleHex}) – Nam S (${bluePoleHex})`
      : detectedTopology === 'ring-magnet'
        ? `AI Vision nhận diện từ ảnh: Nam châm tròn / vành khuyên phân cực N (${redPoleHex}) – S (${bluePoleHex})`
        : `AI Vision nhận diện từ ảnh: Thanh nam châm vĩnh cửu hình hộp phân cực Bắc N (${redPoleHex}) – Nam S (${bluePoleHex})`
    : `AI Vision đã trích xuất ${sliceProfiles.length} phân đoạn hình học thực tế (Tỷ lệ Rộng/Cao = ${aspectRatioWH}, Màu chính ${primaryBodyHex})`;

  return {
    aspectRatioWH,
    isBipolarMagnetImage,
    detectedTopology,
    redPoleHex,
    bluePoleHex,
    primaryBodyHex,
    secondaryBodyHex,
    accentHex,
    redPoleSide,
    sliceProfiles,
    visionSummaryVi,
  };
}

/**
 * BỘ TỪ KHÓA NHẬN DIỆN HÌNH HỌC TỰ ĐỘNG (SHAPE CLASSIFIER: CYLINDER VS. BOX)
 */
export function classifyEquipmentShapeByKeywords(
  nameVi: string,
  appearanceText: string,
  templateId?: string,
): ShapeClassificationResult {
  const cleanNegations = (raw: string) =>
    raw
      .toLowerCase()
      .replace(
        /(?:không\s+phải|khong\s+phai|tránh\s+nhầm|không\s+vẽ)\s+(?:là\s+)?(?:cốc\s*đong|cốc|ống\s*đong|ống\s*nghiệm|hộp|thấu\s*kính|lăng\s*kính|đèn\s*cồn)/g,
        ' ',
      );

  const cleanedName = cleanNegations(nameVi || '');
  const cleanedAppearance = cleanNegations(appearanceText || '');
  const combined = `${cleanedName} ${cleanedAppearance}`;

  // Nam châm tròn hoặc La bàn -> Cylinder (Hình trụ tròn)
  if (
    combined.includes('nam châm tròn') ||
    combined.includes('nam châm khuyên') ||
    combined.includes('vành khuyên') ||
    combined.includes('la bàn') ||
    combined.includes('la ban') ||
    templateId === 'magnetic-compass'
  ) {
    return {
      shapeType: 'Cylinder',
      matchedKeywords: ['tròn / la bàn'],
      labelVi: 'Cylinder (Hình trụ / Tròn đối xứng)',
      hideDepthInput: true,
    };
  }

  // Nam châm thẳng / Thanh nam châm / Nam châm chữ U / Nam châm vĩnh cửu -> Box (Khối hộp / Chữ U 3 chiều)
  if (
    combined.includes('nam châm') ||
    combined.includes('nam cham') ||
    combined.includes('móng ngựa') ||
    combined.includes('chữ u') ||
    templateId === 'permanent-magnet'
  ) {
    return {
      shapeType: 'Box',
      matchedKeywords: ['nam châm'],
      labelVi: 'Box (Hình khối 3 chiều Cao × Rộng × Dày)',
      hideDepthInput: false,
    };
  }

  const cylinderKeywords = [
    'cốc',
    'đèn cồn',
    'ống',
    'bình',
    'trụ',
    'thấu kính',
    'cuộn dây',
  ];
  const boxKeywords = [
    'ampe kế',
    'vôn kế',
    'hộp',
    'biến trở',
    'công tắc',
    'thanh',
    'cân điện tử',
  ];

  const matchedCylinderInName = cylinderKeywords.filter((kw) =>
    cleanedName.includes(kw),
  );
  const matchedBoxInName = boxKeywords.filter((kw) => cleanedName.includes(kw));

  const matchedCylinderAll = cylinderKeywords.filter((kw) =>
    combined.includes(kw),
  );
  const matchedBoxAll = boxKeywords.filter((kw) => combined.includes(kw));

  if (matchedBoxInName.length > 0 && matchedCylinderInName.length === 0) {
    return {
      shapeType: 'Box',
      matchedKeywords: matchedBoxAll,
      labelVi: 'Box (Hình hộp chữ nhật)',
      hideDepthInput: false,
    };
  }
  if (matchedCylinderInName.length > 0 && matchedBoxInName.length === 0) {
    return {
      shapeType: 'Cylinder',
      matchedKeywords: matchedCylinderAll,
      labelVi: 'Cylinder (Hình trụ tròn)',
      hideDepthInput: true,
    };
  }

  if (matchedBoxAll.length > 0 && matchedCylinderAll.length === 0) {
    return {
      shapeType: 'Box',
      matchedKeywords: matchedBoxAll,
      labelVi: 'Box (Hình hộp chữ nhật)',
      hideDepthInput: false,
    };
  }
  if (matchedCylinderAll.length > 0 && matchedBoxAll.length === 0) {
    return {
      shapeType: 'Cylinder',
      matchedKeywords: matchedCylinderAll,
      labelVi: 'Cylinder (Hình trụ tròn)',
      hideDepthInput: true,
    };
  }

  if (matchedCylinderAll.length > matchedBoxAll.length) {
    return {
      shapeType: 'Cylinder',
      matchedKeywords: matchedCylinderAll,
      labelVi: 'Cylinder (Hình trụ tròn)',
      hideDepthInput: true,
    };
  }
  if (matchedBoxAll.length > 0) {
    return {
      shapeType: 'Box',
      matchedKeywords: matchedBoxAll,
      labelVi: 'Box (Hình hộp chữ nhật)',
      hideDepthInput: false,
    };
  }

  const cylinderTemplates = [
    'alcohol-burner',
    'graduated-glassware',
    'test-tube',
    'conical-flask',
    'optical-lens',
    'thermometer',
    'magnetic-compass',
  ];
  if (templateId && cylinderTemplates.includes(templateId)) {
    return {
      shapeType: 'Cylinder',
      matchedKeywords: [templateId],
      labelVi: 'Cylinder (Hình trụ tròn)',
      hideDepthInput: true,
    };
  }

  return {
    shapeType: 'Box',
    matchedKeywords: [],
    labelVi: 'Box (Hình hộp chữ nhật)',
    hideDepthInput: false,
  };
}

export interface AiClarificationMemoryItem {
  question: string;
  answer: string;
  timestamp: string;
}

export interface AiClarificationCheckResult {
  needsClarification: boolean;
  missingDetails: string[];
  aiQuestionMessage: string;
  suggestedQuickReplies: string[];
}

export interface AiEquipmentInputSpec {
  templateId?: AiEquipmentShapeFamily | '';
  baseShapeType?: DetectedBaseShapeType;
  nameVi: string;
  category: EquipmentCategoryId;
  subject: ScienceSubject;
  heightCm: number;
  widthCm: number;
  depthCm: number;
  massG: number;
  focalLengthCm?: number | null;
  capacityMl?: number | null;
  rangeMax?: number | null;
  leastCount?: number | null;
  unitLabel: string;
  material: string;
  description: string;
  appearancePrompt?: string;
  operationPrompt?: string;
  referenceUrl?: string;
  imageDataUrl?: string | null;
  imageDataUrls?: string[];
  detectedImagePrimaryHex?: string | null;
  detectedImageSecondaryHex?: string | null;
  detectedImageAccentHex?: string | null;
  imageVisionTelemetry?: AiImageVisionTelemetry | null;
  refinementPrompt?: string;
  clarificationMemory?: AiClarificationMemoryItem[];
}

export interface AiGeneratedPartSpec {
  partName: string;
  shape:
    | 'beveled-box'
    | 'cylinder'
    | 'box'
    | 'sphere'
    | 'torus'
    | 'cone'
    | 'ring'
    | 'tube'
    | 'lathe-glass'
    | 'dial-face'
    | 'binding-post';
  colorHex: string;
  metalness: number;
  roughness: number;
  opacity: number;
  relativeScale: [number, number, number];
  relativePos: [number, number, number];
  poleLabel?: 'N' | 'S' | string;
}

export interface AiEquipmentBlueprint {
  assetId: string;
  slug: string;
  nameVi: string;
  nameEn: string;
  shapeFamily: AiEquipmentShapeFamily;
  templateNameVi?: string;
  proceduralArchetype: ProceduralArchetype;
  meterSymbol?: string;
  primaryColorHex: string;
  secondaryColorHex: string;
  accentColorHex: string;
  glassOpacity: number;
  metalness: number;
  roughness: number;
  hasScaleMarks: boolean;
  hasDigitalDisplay: boolean;
  hasOpticalElement: boolean;
  controlLabel: string;
  controlUnit: string;
  controlStateKey:
    | 'incidentAngleDeg'
    | 'liquidLevelMl'
    | 'springExtensionN'
    | 'temperatureC'
    | 'multimeterValue'
    | 'magnification'
    | 'jawOpeningMm';
  controlMin: number;
  controlMax: number;
  controlStep: number;
  controlDefault: number;
  aiAnalysisSummary: string;
  operationSummary?: string;
  referenceUrl?: string;
  extractedReferenceContent?: string;
  structuralComponents: string[];
  physicsFormulaUnicode: string;
  housingStyle?: 'stepped-benchtop' | 'sloped-console' | 'upright-classic';
  terminalCount?: number;
  bevelRadiusMm?: number;
  customParts?: AiGeneratedPartSpec[];
  baseShapeType?: DetectedBaseShapeType;
  matchedShapeKeywords?: string[];
  appliedParametersSummaryVi?: string[];
}

export interface AiEquipmentDesignResponse {
  blueprint: AiEquipmentBlueprint;
  rawHtmlModule: string;
  source: 'gemini-ai' | 'smart-synthesizer';
}

export function evaluateEquipmentClarificationNeed(input: {
  templateId?: string;
  nameVi: string;
  heightCmRaw: string;
  widthCmRaw: string;
  depthCmRaw: string;
  focalLengthRaw: string;
  capacityMlRaw: string;
  materialRaw: string;
  appearanceRaw: string;
  operationRaw: string;
  referenceUrlRaw: string;
  uploadedImagesCount: number;
  clarificationMemory: AiClarificationMemoryItem[];
}): AiClarificationCheckResult {
  const combinedClarificationAnswers = input.clarificationMemory
    .map((m) => m.answer.trim())
    .filter(Boolean)
    .join(' ');

  const hasTemplate = Boolean(input.templateId && input.templateId.trim());
  const hasName = input.nameVi.trim().length >= 2;
  const hasAppearance = input.appearanceRaw.trim().length >= 6;
  const hasImages = input.uploadedImagesCount > 0;
  const hasUrl = input.referenceUrlRaw.trim().length >= 5;

  // Nếu người dùng đã tải ảnh lên, hoặc đã nhập Tên dụng cụ, hoặc đã chọn Template, hoặc đã nhập mô tả ->
  // Tiến hành phân tích hình ảnh & tên dụng cụ để lập Bản phác thảo cấu trúc 2D ngay lập tức, không chặn hỏi đáp!
  if (
    combinedClarificationAnswers.length >= 2 ||
    hasImages ||
    hasName ||
    hasTemplate ||
    hasAppearance ||
    hasUrl
  ) {
    return {
      needsClarification: false,
      missingDetails: [],
      aiQuestionMessage: '',
      suggestedQuickReplies: [],
    };
  }

  // Chỉ hỏi làm rõ khi người dùng chưa nhập bất kỳ thông tin hay hình ảnh nào
  return {
    needsClarification: true,
    missingDetails: [
      'tên dụng cụ thí nghiệm hoặc hình ảnh thực tế của thiết bị bạn muốn chế tạo',
    ],
    aiQuestionMessage:
      'Bạn chưa nhập tên dụng cụ hoặc tải ảnh lên. Vui lòng cho AI biết tên hoặc đặc điểm hình dáng thiết bị bạn muốn thiết kế (Ví dụ: Thanh nam châm vĩnh cửu N-S, Nam châm chữ U, La bàn, Ampe kế...):',
    suggestedQuickReplies: [
      'Thanh nam châm vĩnh cửu hình hộp chữ nhật có 2 cực Bắc (N - màu đỏ) và Nam (S - màu xanh), dài 16 cm, cao 4 cm',
      'Nam châm chữ U (hình móng ngựa) có 2 nhánh phân cực Bắc (N - đỏ) và Nam (S - xanh), cao 14 cm, rộng 11 cm',
      'La bàn thí nghiệm có kim nam châm N-S quay trên mũi nhọn và mặt chia độ phương hướng, đường kính 10 cm',
      'Ampe kế vỏ hộp chữ nhật bo góc, mặt chia độ kim chỉ và 3 chốt cắm (+/-), cao 15 cm, rộng 12 cm',
    ],
  };
}

/**
 * BỘ NHẬN DIỆN LOẠI DỤNG CỤ (AI IMAGE & TEXT SHAPE FAMILY PARSER):
 * 1. NGHIÊM CẤM DÙNG MẪU MẶC ĐỊNH ĐÈN CỒN (`alcohol-burner`):
 *    Chỉ trả về `alcohol-burner` khi người dùng chọn trực tiếp `templateId === 'alcohol-burner'`
 *    HOẶC gõ rõ tên `"đèn cồn"` / `"alcohol burner"` / `"đèn bunsen"`.
 * 2. Nhận diện chính xác Nam châm vĩnh cửu (Thanh / Chữ U / Tròn), La bàn, Cuộn dây, và các thiết bị thực tế từ Ảnh tải lên & Văn bản.
 */
export function inferShapeFamilyFromSpec(
  spec: AiEquipmentInputSpec,
  extraContextText = '',
): AiEquipmentShapeFamily {
  // 1. Nếu người dùng chọn trực tiếp một Template trên giao diện -> Khóa cứng 100%!
  if (spec.templateId && spec.templateId.trim() !== '') {
    return spec.templateId as AiEquipmentShapeFamily;
  }

  let decodedUrlKeywords = '';
  if (spec.referenceUrl && spec.referenceUrl.trim()) {
    try {
      decodedUrlKeywords = decodeURIComponent(spec.referenceUrl)
        .replace(/[-_/+=&?.:]+/g, ' ')
        .toLowerCase();
    } catch {
      decodedUrlKeywords = spec.referenceUrl
        .replace(/[-_/+=&?.:]+/g, ' ')
        .toLowerCase();
    }
  }

  const clarificationAnswersText = Array.isArray(spec.clarificationMemory)
    ? spec.clarificationMemory.map((m) => m.answer).join(' ')
    : '';

  const text =
    `${spec.nameVi} ${spec.appearancePrompt || ''} ${spec.operationPrompt || ''} ${spec.description} ${spec.material} ${clarificationAnswersText} ${decodedUrlKeywords} ${extraContextText} ${spec.refinementPrompt || ''}`.toLowerCase();

  // 2. LA BÀN / KIM NAM CHÂM THỬ TỪ TRƯỜNG
  if (
    text.includes('la bàn') ||
    text.includes('la ban') ||
    text.includes('kim nam châm') ||
    text.includes('kim nam cham') ||
    text.includes('kim từ') ||
    text.includes('compass')
  ) {
    return 'magnetic-compass';
  }

  // 3. NAM CHÂM VĨNH CỬU (THANH NAM CHÂM / NAM CHÂM CHỮ U / NAM CHÂM TRÒN)
  // Kiểm tra cả từ khóa văn bản VÀ kết quả phân tích điểm ảnh phân cực Đỏ-Xanh (isBipolarMagnetImage)
  if (
    text.includes('nam châm') ||
    text.includes('nam cham') ||
    text.includes('vĩnh cửu') ||
    text.includes('vinh cuu') ||
    text.includes('thanh nam châm') ||
    text.includes('nam châm chữ u') ||
    text.includes('nam châm móng ngựa') ||
    text.includes('nam châm tròn') ||
    text.includes('cực bắc') ||
    text.includes('cực nam') ||
    text.includes('cực từ') ||
    text.includes('magnet') ||
    text.includes('horseshoe') ||
    text.includes('alnico') ||
    text.includes('ferrite') ||
    spec.imageVisionTelemetry?.isBipolarMagnetImage === true
  ) {
    return 'permanent-magnet';
  }

  // 4. Biến trở con chạy / biến trở dây quấn
  if (
    text.includes('biến trở') ||
    text.includes('bien tro') ||
    text.includes('con chạy') ||
    text.includes('con chay') ||
    text.includes('rheostat') ||
    text.includes('điện trở dây quấn')
  ) {
    return 'rheostat';
  }

  // 5. Ampe kế / Vôn kế / Điện kế kim chỉ (Analog Meter)
  if (
    text.includes('ampe') ||
    text.includes('vôn kế') ||
    text.includes('von ke') ||
    text.includes('điện kế') ||
    text.includes('dien ke') ||
    text.includes('miliampe') ||
    text.includes('ammeter') ||
    text.includes('voltmeter') ||
    text.includes('galvanometer')
  ) {
    return 'analog-ammeter-voltmeter';
  }

  // 6. Bình tam giác Erlenmeyer / Bình cầu đáy tròn / Bình định mức
  if (
    text.includes('bình tam giác') ||
    text.includes('erlenmeyer') ||
    text.includes('bình cầu') ||
    text.includes('bình định mức')
  ) {
    return 'conical-flask';
  }

  // 7. Ống nghiệm & Giá ống nghiệm
  if (
    text.includes('ống nghiệm') ||
    text.includes('ong nghiem') ||
    text.includes('test tube')
  ) {
    return 'test-tube';
  }

  // 8. Lực kế lò xo
  if (
    text.includes('lực kế') ||
    text.includes('luc ke') ||
    text.includes('lò xo xoắn') ||
    text.includes('dynamometer') ||
    (text.includes('lò xo') && text.includes('móc treo'))
  ) {
    return 'spring-dynamometer';
  }

  // 9. Cân điện tử / Cân kỹ thuật
  if (
    text.includes('cân điện tử') ||
    text.includes('can dien tu') ||
    text.includes('cân kỹ thuật') ||
    text.includes('đĩa cân') ||
    text.includes('bàn cân') ||
    text.includes('electronic balance')
  ) {
    return 'electronic-balance';
  }

  // 10. Nhiệt kế phòng thí nghiệm
  if (
    text.includes('nhiệt kế') ||
    text.includes('nhiet ke') ||
    text.includes('thermometer') ||
    text.includes('bầu thủy ngân') ||
    text.includes('ống mao dẫn')
  ) {
    return 'thermometer';
  }

  // 11. Kính hiển vi quang học / Sinh học
  if (
    text.includes('kính hiển vi') ||
    text.includes('kinh hien vi') ||
    text.includes('hiển vi') ||
    text.includes('microscope') ||
    text.includes('vật kính') ||
    text.includes('thị kính') ||
    text.includes('bàn tiêu bản')
  ) {
    return 'microscope-biology';
  }

  // 12. Đồng hồ vạn năng hiện số / Máy đo pH / Máy đo điện tử
  if (
    text.includes('vạn năng') ||
    text.includes('van nang') ||
    text.includes('multimeter') ||
    text.includes('máy đo ph') ||
    text.includes('đồng hồ số') ||
    text.includes('máy đo hiện số')
  ) {
    return 'digital-multimeter';
  }

  // 13. Ống đong / Cốc chia độ hình trụ
  if (
    text.includes('ống đong') ||
    text.includes('ong dong') ||
    text.includes('cốc chia độ') ||
    text.includes('cốc thủy tinh') ||
    text.includes('cốc đong') ||
    text.includes('cốc mỏ') ||
    text.includes('beaker') ||
    text.includes('graduated cylinder')
  ) {
    return 'graduated-glassware';
  }

  // 14. Thấu kính hội tụ / phân kỳ / kính lúp
  if (
    text.includes('thấu kính') ||
    text.includes('thau kinh') ||
    text.includes('kính lúp') ||
    text.includes('kinh lup') ||
    text.includes('optical lens')
  ) {
    return 'optical-lens';
  }

  // 15. Lăng kính / Bản bán trụ
  if (
    text.includes('lăng kính') ||
    text.includes('lang kinh') ||
    text.includes('bản bán trụ') ||
    text.includes('tán sắc ánh sáng') ||
    text.includes('prism')
  ) {
    return 'optical-prism';
  }

  // 16. Nguồn sáng Laser / Đèn chiếu Laser
  if (
    text.includes('đèn laser') ||
    text.includes('nguồn laser') ||
    text.includes('tia laser') ||
    text.includes('laser source')
  ) {
    return 'laser-source';
  }

  // 17. Đèn cồn thí nghiệm: CHỈ KHI người dùng ghi rõ "đèn cồn" / "alcohol burner" / "đèn bunsen"
  // TUYỆT ĐỐI KHÔNG tự động gán 'alcohol-burner' làm mẫu mặc định!
  if (
    text.includes('đèn cồn') ||
    text.includes('den con') ||
    text.includes('alcohol burner') ||
    text.includes('spirit lamp') ||
    text.includes('đèn bunsen') ||
    text.includes('bầu chứa cồn')
  ) {
    return 'alcohol-burner';
  }

  // 18. Mọi dụng cụ khác hoặc ảnh tải lên tự do -> Luôn phân tích đa thành phần theo hình dạng thực tế ('custom-apparatus')
  return 'custom-apparatus';
}

function mapFamilyToArchetype(
  family: AiEquipmentShapeFamily,
): ProceduralArchetype {
  switch (family) {
    case 'permanent-magnet':
    case 'magnetic-compass':
      return 'galvanometer';
    case 'alcohol-burner':
      return 'thermometer';
    case 'conical-flask':
      return 'graduated-cylinder';
    case 'analog-ammeter-voltmeter':
      return 'galvanometer';
    case 'digital-multimeter':
      return 'digital-multimeter';
    case 'rheostat':
      return 'digital-multimeter';
    case 'test-tube':
      return 'graduated-cylinder';
    case 'optical-lens':
      return 'optical-lens';
    case 'optical-prism':
      return 'optical-prism';
    case 'laser-source':
      return 'laser-source';
    case 'graduated-glassware':
      return 'graduated-cylinder';
    case 'spring-dynamometer':
      return 'spring-dynamometer';
    case 'electronic-balance':
      return 'electronic-balance';
    case 'thermometer':
      return 'thermometer';
    case 'microscope-biology':
      return 'optical-microscope';
    case 'custom-apparatus':
    default:
      return 'galvanometer';
  }
}

/**
 * CƠ CHẾ PHÂN TÍCH ĐA THÀNH PHẦN THEO ẢNH THỰC TẾ & MÔ TẢ (TRUE AI VISION MULTI-PART PARSER):
 * - Nếu là Nam châm vĩnh cửu (Thanh thẳng / Chữ U móng ngựa / Nam châm tròn):
 *   Phân định rõ 2 cực Bắc (North - màu đỏ #DC2626 / ký hiệu N) và Nam (South - màu xanh #1D4ED8 / ký hiệu S)
 *   theo đúng hình khối hộp ngang, khối chữ U hoặc vành khuyên tròn. Tuyệt đối không vẽ bầu tròn hay cổ đèn cồn!
 * - Nếu là La bàn / Kim nam châm:
 *   Bóc tách thành Mặt chia độ phương hướng, Trụ kim nhọn, Nửa kim cực Bắc (N - Đỏ) và Nửa kim cực Nam (S - Xanh).
 * - Nếu là thiết bị khác:
 *   Bóc tách thành các bộ phận tương ứng dựa trên biên dạng ảnh gốc (sliceProfiles) và mô tả thực tế.
 */
export function synthesizeCustomPartsFromDescription(
  spec: AiEquipmentInputSpec,
  primaryHex: string,
  secondaryHex: string,
  accentHex: string,
  existingParts?: AiGeneratedPartSpec[],
  family?: AiEquipmentShapeFamily,
): AiGeneratedPartSpec[] {
  const clarificationText = Array.isArray(spec.clarificationMemory)
    ? spec.clarificationMemory.map((m) => m.answer).join(' ')
    : '';
  const desc =
    `${spec.nameVi} ${spec.appearancePrompt || ''} ${spec.description || ''} ${spec.material || ''} ${clarificationText}`.toLowerCase();

  const resolvedFamily =
    family ||
    (spec.templateId && spec.templateId.trim() !== ''
      ? (spec.templateId as AiEquipmentShapeFamily)
      : inferShapeFamilyFromSpec(spec, ''));

  const vision = spec.imageVisionTelemetry;
  const redPoleColor = vision?.redPoleHex || '#DC2626';
  const bluePoleColor = vision?.bluePoleHex || '#1D4ED8';

  // Nếu đã có existingParts hợp lệ (và không phải các khối đèn cồn bị gán nhầm), giữ nguyên
  if (existingParts && existingParts.length >= 2) {
    const hasAccidentalBurnerParts =
      resolvedFamily !== 'alcohol-burner' &&
      existingParts.some(
        (p) =>
          p.partName.toLowerCase().includes('chứa cồn') ||
          p.partName.toLowerCase().includes('cổ thắt'),
      );
    const magnetNeedsPoleFix =
      resolvedFamily === 'permanent-magnet' &&
      !existingParts.some(
        (p) =>
          p.poleLabel === 'N' ||
          p.poleLabel === 'S' ||
          /cực\s*(?:từ\s*)?(?:bắc|nam)|\bn\b|\bs\b/i.test(p.partName),
      );
    if (!hasAccidentalBurnerParts && !magnetNeedsPoleFix) {
      return existingParts;
    }
  }

  // =========================================================================
  // 1. NAM CHÂM VĨNH CỬU (THANH THẲNG / CHỮ U MÓNG NGỰA / NAM CHÂM TRÒN)
  // =========================================================================
  if (
    resolvedFamily === 'permanent-magnet' ||
    desc.includes('nam châm') ||
    desc.includes('nam cham') ||
    vision?.isBipolarMagnetImage
  ) {
    const isUMagnet =
      desc.includes('chữ u') ||
      desc.includes('chu u') ||
      desc.includes('móng ngựa') ||
      desc.includes('mong ngua') ||
      desc.includes('hai nhánh') ||
      desc.includes('2 nhánh') ||
      desc.includes('horseshoe') ||
      vision?.detectedTopology === 'u-magnet' ||
      vision?.detectedTopology === 'u-shape';

    const isRingMagnet =
      !isUMagnet &&
      (desc.includes('nam châm tròn') ||
        desc.includes('nam châm khuyên') ||
        desc.includes('vành khuyên') ||
        desc.includes('nam châm đĩa') ||
        desc.includes('có lỗ') ||
        vision?.detectedTopology === 'ring-magnet' ||
        vision?.detectedTopology === 'ring-torus');

    if (isUMagnet) {
      // NAM CHÂM CHỮ U / HÌNH MÓNG NGỰA (U-SHAPED / HORSESHOE MAGNET)
      const redOnLeft = vision?.redPoleSide !== 'right';
      const leftPoleName = redOnLeft
        ? 'Nhánh trái — Cực từ Bắc (Ký hiệu N - Màu Đỏ)'
        : 'Nhánh trái — Cực từ Nam (Ký hiệu S - Màu Xanh)';
      const rightPoleName = redOnLeft
        ? 'Nhánh phải — Cực từ Nam (Ký hiệu S - Màu Xanh)'
        : 'Nhánh phải — Cực từ Bắc (Ký hiệu N - Màu Đỏ)';
      const leftColor = redOnLeft ? redPoleColor : bluePoleColor;
      const rightColor = redOnLeft ? bluePoleColor : redPoleColor;
      const leftLabel = redOnLeft ? 'N' : 'S';
      const rightLabel = redOnLeft ? 'S' : 'N';

      return [
        {
          partName: 'Vòm đáy nối từ chữ U (Khối thép từ Yoke)',
          shape: 'beveled-box',
          colorHex: '#334155',
          metalness: 0.65,
          roughness: 0.32,
          opacity: 1,
          relativeScale: [0.78, 0.20, 0.48],
          relativePos: [0, 0.14, 0],
        },
        {
          partName: leftPoleName,
          shape: 'beveled-box',
          colorHex: leftColor,
          metalness: 0.45,
          roughness: 0.34,
          opacity: 1,
          relativeScale: [0.24, 0.56, 0.48],
          relativePos: [-0.27, 0.52, 0],
          poleLabel: leftLabel,
        },
        {
          partName: rightPoleName,
          shape: 'beveled-box',
          colorHex: rightColor,
          metalness: 0.45,
          roughness: 0.34,
          opacity: 1,
          relativeScale: [0.24, 0.56, 0.48],
          relativePos: [0.27, 0.52, 0],
          poleLabel: rightLabel,
        },
        {
          partName: `Đầu cực từ ${leftLabel === 'N' ? 'Bắc (Cực N)' : 'Nam (Cực S)'} mạ Niken`,
          shape: 'box',
          colorHex: leftLabel === 'N' ? '#EF4444' : '#3B82F6',
          metalness: 0.78,
          roughness: 0.22,
          opacity: 1,
          relativeScale: [0.24, 0.10, 0.48],
          relativePos: [-0.27, 0.85, 0],
          poleLabel: leftLabel,
        },
        {
          partName: `Đầu cực từ ${rightLabel === 'S' ? 'Nam (Cực S)' : 'Bắc (Cực N)'} mạ Niken`,
          shape: 'box',
          colorHex: rightLabel === 'S' ? '#3B82F6' : '#EF4444',
          metalness: 0.78,
          roughness: 0.22,
          opacity: 1,
          relativeScale: [0.24, 0.10, 0.48],
          relativePos: [0.27, 0.85, 0],
          poleLabel: rightLabel,
        },
      ];
    }

    if (isRingMagnet) {
      // NAM CHÂM TRÒN / VÀNH KHUYÊN (RING / DISC PERMANENT MAGNET)
      return [
        {
          partName: 'Đế đệm cách từ đặt nam châm tròn',
          shape: 'cylinder',
          colorHex: '#1E293B',
          metalness: 0.35,
          roughness: 0.45,
          opacity: 1,
          relativeScale: [0.82, 0.10, 0.82],
          relativePos: [0, 0.06, 0],
        },
        {
          partName: 'Nửa vành dưới — Cực từ Nam (Ký hiệu S - Màu Xanh)',
          shape: 'torus',
          colorHex: bluePoleColor,
          metalness: 0.5,
          roughness: 0.32,
          opacity: 1,
          relativeScale: [0.84, 0.30, 0.84],
          relativePos: [0, 0.28, 0],
          poleLabel: 'S',
        },
        {
          partName: 'Nửa vành trên — Cực từ Bắc (Ký hiệu N - Màu Đỏ)',
          shape: 'torus',
          colorHex: redPoleColor,
          metalness: 0.5,
          roughness: 0.32,
          opacity: 1,
          relativeScale: [0.84, 0.30, 0.84],
          relativePos: [0, 0.58, 0],
          poleLabel: 'N',
        },
        {
          partName: 'Lõi rỗng xuyên tâm nam châm vành khuyên',
          shape: 'tube',
          colorHex: '#94A3B8',
          metalness: 0.7,
          roughness: 0.28,
          opacity: 0.55,
          relativeScale: [0.34, 0.58, 0.34],
          relativePos: [0, 0.43, 0],
        },
      ];
    }

    // THANH NAM CHÂM THẲNG / NAM CHÂM VĨNH CỬU HÌNH HỘP DÀI (BAR MAGNET N–S)
    const redOnLeft = vision?.redPoleSide !== 'right';
    const leftPolePart: AiGeneratedPartSpec = {
      partName: redOnLeft
        ? 'Nửa khối trái — Cực từ Bắc (Ký hiệu N - Màu Đỏ)'
        : 'Nửa khối trái — Cực từ Nam (Ký hiệu S - Màu Xanh)',
      shape: 'beveled-box',
      colorHex: redOnLeft ? redPoleColor : bluePoleColor,
      metalness: 0.48,
      roughness: 0.32,
      opacity: 1,
      relativeScale: [0.46, 0.44, 0.62],
      relativePos: [-0.23, 0.38, 0],
      poleLabel: redOnLeft ? 'N' : 'S',
    };
    const rightPolePart: AiGeneratedPartSpec = {
      partName: redOnLeft
        ? 'Nửa khối phải — Cực từ Nam (Ký hiệu S - Màu Xanh)'
        : 'Nửa khối phải — Cực từ Bắc (Ký hiệu N - Màu Đỏ)',
      shape: 'beveled-box',
      colorHex: redOnLeft ? bluePoleColor : redPoleColor,
      metalness: 0.48,
      roughness: 0.32,
      opacity: 1,
      relativeScale: [0.46, 0.44, 0.62],
      relativePos: [0.23, 0.38, 0],
      poleLabel: redOnLeft ? 'S' : 'N',
    };

    return [
      {
        partName: 'Đế đệm cách từ đỡ thanh nam châm',
        shape: 'beveled-box',
        colorHex: '#1E293B',
        metalness: 0.3,
        roughness: 0.48,
        opacity: 1,
        relativeScale: [0.94, 0.12, 0.68],
        relativePos: [0, 0.08, 0],
      },
      leftPolePart,
      rightPolePart,
      {
        partName: 'Vạch phân cực trung hòa (Mặt phân cách N – S)',
        shape: 'box',
        colorHex: '#E2E8F0',
        metalness: 0.85,
        roughness: 0.2,
        opacity: 1,
        relativeScale: [0.04, 0.45, 0.64],
        relativePos: [0, 0.38, 0],
      },
    ];
  }

  // =========================================================================
  // 2. LA BÀN / KIM NAM CHÂM THỬ TỪ TRƯỜNG (COMPASS / MAGNETIC NEEDLE)
  // =========================================================================
  if (
    resolvedFamily === 'magnetic-compass' ||
    desc.includes('la bàn') ||
    desc.includes('la ban') ||
    desc.includes('kim nam châm')
  ) {
    return [
      {
        partName: 'Đế trụ & Mặt chia độ phương hướng (Bắc N - Đông E - Nam S - Tây W)',
        shape: 'cylinder',
        colorHex: '#1E293B',
        metalness: 0.45,
        roughness: 0.38,
        opacity: 1,
        relativeScale: [0.88, 0.16, 0.88],
        relativePos: [0, 0.10, 0],
      },
      {
        partName: 'Trụ kim nhọn đồng thau đỡ kim nam châm',
        shape: 'cone',
        colorHex: '#D97706',
        metalness: 0.85,
        roughness: 0.22,
        opacity: 1,
        relativeScale: [0.14, 0.34, 0.14],
        relativePos: [0, 0.35, 0],
      },
      {
        partName: 'Nửa kim từ Cực Bắc (Ký hiệu N - Sơn Đỏ)',
        shape: 'cone',
        colorHex: '#DC2626',
        metalness: 0.55,
        roughness: 0.28,
        opacity: 1,
        relativeScale: [0.42, 0.12, 0.18],
        relativePos: [-0.21, 0.56, 0],
        poleLabel: 'N',
      },
      {
        partName: 'Nửa kim từ Cực Nam (Ký hiệu S - Sơn Xanh)',
        shape: 'cone',
        colorHex: '#1D4ED8',
        metalness: 0.55,
        roughness: 0.28,
        opacity: 1,
        relativeScale: [0.42, 0.12, 0.18],
        relativePos: [0.21, 0.56, 0],
        poleLabel: 'S',
      },
      {
        partName: 'Khớp mũ đồng tâm giữ thăng bằng kim từ',
        shape: 'sphere',
        colorHex: '#F59E0B',
        metalness: 0.88,
        roughness: 0.2,
        opacity: 1,
        relativeScale: [0.12, 0.12, 0.12],
        relativePos: [0, 0.56, 0],
      },
    ];
  }

  // =========================================================================
  // 3. CUỘN DÂY CẢM ỨNG / NAM CHÂM ĐIỆN / ỐNG DÂY DẪN
  // =========================================================================
  if (
    desc.includes('cuộn dây') ||
    desc.includes('cuon day') ||
    desc.includes('ống dây') ||
    desc.includes('nam châm điện') ||
    desc.includes('solenoid')
  ) {
    return [
      {
        partName: 'Đế nhựa kỹ thuật cách điện kèm 2 chốt cắm',
        shape: 'beveled-box',
        colorHex: '#1E293B',
        metalness: 0.25,
        roughness: 0.45,
        opacity: 1,
        relativeScale: [0.88, 0.14, 0.72],
        relativePos: [0, 0.08, 0],
      },
      {
        partName: 'Khung ống trụ nhựa chịu nhiệt quấn dây',
        shape: 'tube',
        colorHex: '#E2E8F0',
        metalness: 0.15,
        roughness: 0.35,
        opacity: 0.85,
        relativeScale: [0.64, 0.58, 0.64],
        relativePos: [0, 0.44, 0],
      },
      {
        partName: 'Các vòng dây đồng tráng men quấn sát (Cuộn cảm ứng)',
        shape: 'cylinder',
        colorHex: '#D97706',
        metalness: 0.82,
        roughness: 0.26,
        opacity: 1,
        relativeScale: [0.74, 0.50, 0.74],
        relativePos: [0, 0.44, 0],
      },
      {
        partName: 'Lõi sắt non từ tính đặt dọc trục ống dây',
        shape: 'cylinder',
        colorHex: '#64748B',
        metalness: 0.78,
        roughness: 0.28,
        opacity: 1,
        relativeScale: [0.28, 0.72, 0.28],
        relativePos: [0, 0.52, 0],
      },
      {
        partName: 'Cặp chốt cắm điện cực (+ Đỏ / − Đen)',
        shape: 'binding-post',
        colorHex: '#DC2626',
        metalness: 0.8,
        roughness: 0.22,
        opacity: 1,
        relativeScale: [0.56, 0.14, 0.24],
        relativePos: [0, 0.18, 0.34],
      },
    ];
  }

  // =========================================================================
  // 4. ĐÈN CỒN THÍ NGHIỆM (CHỈ KHI ĐƯỢC CHỌN HOẶC GÕ RÕ "ĐÈN CỒN")
  // =========================================================================
  if (resolvedFamily === 'alcohol-burner') {
    return [
      {
        partName: 'Chân đế thiết bị vững',
        shape: 'cylinder',
        colorHex: '#BAE6FD',
        metalness: 0.12,
        roughness: 0.1,
        opacity: 0.55,
        relativeScale: [0.66, 0.1, 0.66],
        relativePos: [0, 0.05, 0],
      },
      {
        partName: 'Bầu thân chính chứa cồn',
        shape: 'sphere',
        colorHex: secondaryHex || '#38BDF8',
        metalness: 0.05,
        roughness: 0.08,
        opacity: 0.38,
        relativeScale: [0.92, 0.48, 0.92],
        relativePos: [0, 0.34, 0],
      },
      {
        partName: 'Cổ thắt phía trên',
        shape: 'cylinder',
        colorHex: '#E0F2FE',
        metalness: 0.1,
        roughness: 0.08,
        opacity: 0.42,
        relativeScale: [0.31, 0.16, 0.31],
        relativePos: [0, 0.65, 0],
      },
      {
        partName: 'Nắp chụp / Đầu giữ bấc',
        shape: 'cone',
        colorHex: primaryHex || '#D97706',
        metalness: 0.85,
        roughness: 0.22,
        opacity: 1,
        relativeScale: [0.38, 0.22, 0.38],
        relativePos: [0, 0.84, 0],
      },
      {
        partName: 'Bảng mặt trước / Cụm điều khiển',
        shape: 'dial-face',
        colorHex: accentHex || '#F97316',
        metalness: 0.2,
        roughness: 0.3,
        opacity: 1,
        relativeScale: [0.58, 0.14, 0.12],
        relativePos: [0, 0.14, 0.46],
      },
    ];
  }

  // =========================================================================
  // 5. BÌNH TAM GIÁC ERLENMEYER / BÌNH CẦU ĐÁY BẦU
  // =========================================================================
  if (resolvedFamily === 'conical-flask') {
    return [
      {
        partName: 'Đế bình thủy tinh chịu nhiệt',
        shape: 'cylinder',
        colorHex: '#BAE6FD',
        metalness: 0.06,
        roughness: 0.08,
        opacity: 0.48,
        relativeScale: [0.78, 0.08, 0.78],
        relativePos: [0, 0.04, 0],
      },
      {
        partName: 'Bầu thân nón chứa dung dịch',
        shape: 'cone',
        colorHex: secondaryHex || '#38BDF8',
        metalness: 0.05,
        roughness: 0.08,
        opacity: 0.42,
        relativeScale: [0.92, 0.52, 0.92],
        relativePos: [0, 0.34, 0],
      },
      {
        partName: 'Cổ bình thu nhỏ có vạch chia',
        shape: 'cylinder',
        colorHex: '#E0F2FE',
        metalness: 0.05,
        roughness: 0.08,
        opacity: 0.36,
        relativeScale: [0.34, 0.24, 0.34],
        relativePos: [0, 0.72, 0],
      },
      {
        partName: 'Vành miệng loe chịu nhiệt',
        shape: 'torus',
        colorHex: '#E0F2FE',
        metalness: 0.1,
        roughness: 0.1,
        opacity: 0.55,
        relativeScale: [0.4, 0.08, 0.4],
        relativePos: [0, 0.9, 0],
      },
    ];
  }

  // =========================================================================
  // 6. AMPE KẾ / VÔN KẾ / ĐIỆN KẾ KIM CHỈ
  // =========================================================================
  if (resolvedFamily === 'analog-ammeter-voltmeter') {
    return [
      {
        partName: 'Đế máy & Thềm gắn chốt điện cực',
        shape: 'beveled-box',
        colorHex: primaryHex || '#1E293B',
        metalness: 0.2,
        roughness: 0.45,
        opacity: 1,
        relativeScale: [0.96, 0.24, 0.92],
        relativePos: [0, 0.12, 0],
      },
      {
        partName: 'Thân vỏ chính chứa cơ cấu đo từ điện',
        shape: 'beveled-box',
        colorHex: primaryHex || '#1E293B',
        metalness: 0.15,
        roughness: 0.42,
        opacity: 1,
        relativeScale: [0.92, 0.68, 0.64],
        relativePos: [0, 0.58, -0.12],
      },
      {
        partName: 'Mặt chia độ & Kim chỉ 3D',
        shape: 'dial-face',
        colorHex: '#F8FAFC',
        metalness: 0.1,
        roughness: 0.2,
        opacity: 1,
        relativeScale: [0.78, 0.52, 0.12],
        relativePos: [0, 0.6, 0.24],
      },
      {
        partName: 'Vít hiệu chỉnh vạch số 0',
        shape: 'cylinder',
        colorHex: accentHex || '#DC2626',
        metalness: 0.75,
        roughness: 0.25,
        opacity: 1,
        relativeScale: [0.16, 0.1, 0.16],
        relativePos: [0, 0.34, 0.28],
      },
      {
        partName: 'Cụm chốt cắm điện cực (− COM Đen / + Đỏ)',
        shape: 'binding-post',
        colorHex: accentHex || '#DC2626',
        metalness: 0.8,
        roughness: 0.22,
        opacity: 1,
        relativeScale: [0.68, 0.14, 0.24],
        relativePos: [0, 0.22, 0.36],
      },
    ];
  }

  // =========================================================================
  // 7. CỐC THỦY TINH / ỐNG ĐONG / ỐNG NGHIỆM
  // =========================================================================
  if (
    resolvedFamily === 'graduated-glassware' ||
    resolvedFamily === 'test-tube'
  ) {
    return [
      {
        partName: 'Đế thủy tinh chống lật',
        shape: 'cylinder',
        colorHex: '#BAE6FD',
        metalness: 0.08,
        roughness: 0.08,
        opacity: 0.55,
        relativeScale: [0.76, 0.08, 0.76],
        relativePos: [0, 0.04, 0],
      },
      {
        partName: 'Cột dung dịch bên trong ống',
        shape: 'cylinder',
        colorHex: secondaryHex || '#38BDF8',
        metalness: 0.05,
        roughness: 0.08,
        opacity: 0.62,
        relativeScale: [0.68, 0.48, 0.68],
        relativePos: [0, 0.32, 0],
      },
      {
        partName: 'Thành ống thủy tinh khắc vạch chia ml',
        shape: 'cylinder',
        colorHex: '#E0F2FE',
        metalness: 0.05,
        roughness: 0.06,
        opacity: 0.34,
        relativeScale: [0.74, 0.78, 0.74],
        relativePos: [0, 0.48, 0],
      },
      {
        partName: 'Vành miệng rót chất lỏng',
        shape: 'torus',
        colorHex: '#E0F2FE',
        metalness: 0.1,
        roughness: 0.1,
        opacity: 0.52,
        relativeScale: [0.78, 0.08, 0.78],
        relativePos: [0, 0.89, 0],
      },
    ];
  }

  // =========================================================================
  // 8. NẾU NGƯỜI DÙNG ĐÃ TẢI ẢNH LÊN (TRUE IMAGE SILHOUETTE & SLICE EXTRACTION):
  //    Dựng các khối bộ phận bám sát 100% biên dạng lát cắt và màu sắc từ ảnh thực tế!
  // =========================================================================
  if (vision && Array.isArray(vision.sliceProfiles) && vision.sliceProfiles.length >= 3) {
    if (vision.detectedTopology === 'u-shape') {
      return [
        {
          partName: 'Đáy vòm liên kết dưới (Cấu trúc chữ U từ ảnh)',
          shape: 'beveled-box',
          colorHex: vision.primaryBodyHex || primaryHex,
          metalness: 0.45,
          roughness: 0.35,
          opacity: 1,
          relativeScale: [0.78, 0.22, 0.48],
          relativePos: [0, 0.15, 0],
        },
        {
          partName: 'Nhánh đứng bên trái (Trích xuất từ ảnh)',
          shape: 'beveled-box',
          colorHex: vision.sliceProfiles[2]?.leftColorHex || vision.primaryBodyHex || primaryHex,
          metalness: 0.45,
          roughness: 0.35,
          opacity: 1,
          relativeScale: [0.24, 0.62, 0.48],
          relativePos: [-0.26, 0.56, 0],
        },
        {
          partName: 'Nhánh đứng bên phải (Trích xuất từ ảnh)',
          shape: 'beveled-box',
          colorHex: vision.sliceProfiles[2]?.rightColorHex || vision.secondaryBodyHex || secondaryHex,
          metalness: 0.45,
          roughness: 0.35,
          opacity: 1,
          relativeScale: [0.24, 0.62, 0.48],
          relativePos: [0.26, 0.56, 0],
        },
      ];
    }

    if (vision.detectedTopology === 'horizontal-bar') {
      return [
        {
          partName: 'Đế đỡ thiết bị nằm ngang',
          shape: 'beveled-box',
          colorHex: '#1E293B',
          metalness: 0.3,
          roughness: 0.45,
          opacity: 1,
          relativeScale: [0.92, 0.12, 0.64],
          relativePos: [0, 0.08, 0],
        },
        {
          partName: `Khối thân bên trái — ${spec.nameVi || 'Bộ phận 1'}`,
          shape: 'beveled-box',
          colorHex: vision.sliceProfiles[1]?.leftColorHex || vision.primaryBodyHex || primaryHex,
          metalness: 0.45,
          roughness: 0.35,
          opacity: 1,
          relativeScale: [0.46, 0.44, 0.58],
          relativePos: [-0.23, 0.38, 0],
        },
        {
          partName: `Khối thân bên phải — ${spec.nameVi || 'Bộ phận 2'}`,
          shape: 'beveled-box',
          colorHex: vision.sliceProfiles[1]?.rightColorHex || vision.secondaryBodyHex || secondaryHex,
          metalness: 0.45,
          roughness: 0.35,
          opacity: 1,
          relativeScale: [0.46, 0.44, 0.58],
          relativePos: [0.23, 0.38, 0],
        },
      ];
    }

    const sliceLabels = [
      'Phần chân đế / Đáy thiết bị (Từ ảnh)',
      'Khối thân dưới (Từ ảnh)',
      'Khối thân trên (Từ ảnh)',
      'Cụm chi tiết đỉnh thiết bị (Từ ảnh)',
    ];
    const baseShapeForSlices =
      spec.baseShapeType === 'Cylinder' ? 'cylinder' : 'beveled-box';

    return vision.sliceProfiles.map((sl, idx) => ({
      partName: sliceLabels[idx] || `Phân đoạn cấu trúc #${idx + 1}`,
      shape: sl.isHollowCenter ? 'tube' : baseShapeForSlices,
      colorHex: sl.colorHex || primaryHex,
      metalness: 0.38,
      roughness: 0.36,
      opacity: 1,
      relativeScale: [
        sl.widthNorm,
        sl.heightNorm,
        sl.widthNorm,
      ],
      relativePos: [sl.xOffsetNorm, sl.yCenterNorm, 0],
    }));
  }

  // =========================================================================
  // 9. PHÂN TÍCH ĐA THÀNH PHẦN TỪ TÊN & VĂN BẢN MÔ TẢ TỰ DO (KHÔNG DÙNG MẪU ĐÈN CỒN)
  // =========================================================================
  const shapeClassified = classifyEquipmentShapeByKeywords(
    spec.nameVi,
    `${spec.appearancePrompt || ''} ${spec.description || ''}`,
    spec.templateId,
  );
  const enforcedShapeType = spec.baseShapeType || shapeClassified.shapeType;
  const isCyl = enforcedShapeType === 'Cylinder';
  const hasGlass =
    desc.includes('thủy tinh') ||
    desc.includes('trong suốt') ||
    desc.includes('nhựa trong');

  const toolLabel = spec.nameVi.trim() || 'Thiết bị thí nghiệm';

  return [
    {
      partName: `Chân đế đỡ ${toolLabel}`,
      shape: isCyl ? 'cylinder' : 'beveled-box',
      colorHex: secondaryHex || '#1E293B',
      metalness: 0.4,
      roughness: 0.42,
      opacity: 1,
      relativeScale: [0.84, 0.14, 0.80],
      relativePos: [0, 0.08, 0],
    },
    {
      partName: `Khối thân chính — ${toolLabel}`,
      shape: isCyl ? 'cylinder' : 'beveled-box',
      colorHex: primaryHex || '#334155',
      metalness: hasGlass ? 0.05 : 0.35,
      roughness: hasGlass ? 0.08 : 0.38,
      opacity: hasGlass ? 0.42 : 1,
      relativeScale: [0.78, 0.54, 0.72],
      relativePos: [0, 0.43, 0],
    },
    {
      partName: `Cụm chi tiết làm việc / Đầu tương tác`,
      shape: isCyl ? 'cylinder' : 'beveled-box',
      colorHex: accentHex || '#0EA5E9',
      metalness: 0.65,
      roughness: 0.28,
      opacity: 1,
      relativeScale: [0.46, 0.18, 0.46],
      relativePos: [0, 0.80, 0],
    },
  ];
}

/**
 * Tạo Blueprint thiết kế 3D chuẩn xác từ thông số đầu vào, màu ảnh tải lên và yêu cầu tinh chỉnh
 */
export function synthesizeSmartBlueprint(
  spec: AiEquipmentInputSpec,
  aiOverrides?: Partial<AiEquipmentBlueprint>,
): AiEquipmentBlueprint {
  const extractedRefText = aiOverrides?.extractedReferenceContent || '';
  const inferredFamily = inferShapeFamilyFromSpec(spec, extractedRefText);
  const textAll =
    `${spec.nameVi} ${spec.appearancePrompt || ''} ${spec.operationPrompt || ''} ${spec.description} ${spec.material} ${spec.referenceUrl || ''} ${extractedRefText} ${spec.refinementPrompt || ''}`.toLowerCase();
  const refinement = (spec.refinementPrompt || '').toLowerCase();

  const hasExplicitOpticalText =
    textAll.includes('thấu kính') ||
    textAll.includes('kính lúp') ||
    textAll.includes('lăng kính') ||
    textAll.includes('bán trụ') ||
    textAll.includes('laser');

  const hasExplicitAlcoholBurnerText =
    textAll.includes('đèn cồn') ||
    textAll.includes('den con') ||
    textAll.includes('alcohol burner') ||
    textAll.includes('spirit lamp') ||
    textAll.includes('đèn bunsen');

  // CƠ CHẾ LÊN BẢN THẢO CHÍNH XÁC TỪ DỮ LIỆU + HÌNH ẢNH (NGHIÊM CẤM GÁN NHẦM ĐÈN CỒN):
  let family: AiEquipmentShapeFamily = inferredFamily;
  if (spec.templateId && spec.templateId.trim() !== '') {
    family = spec.templateId as AiEquipmentShapeFamily;
  } else if (inferredFamily !== 'custom-apparatus') {
    family = inferredFamily;
  } else if (
    aiOverrides?.shapeFamily &&
    (hasExplicitOpticalText ||
      (aiOverrides.shapeFamily !== 'optical-lens' &&
        aiOverrides.shapeFamily !== 'optical-prism' &&
        aiOverrides.shapeFamily !== 'laser-source')) &&
    (hasExplicitAlcoholBurnerText ||
      aiOverrides.shapeFamily !== 'alcohol-burner')
  ) {
    family = aiOverrides.shapeFamily;
  }

  const matchedTemplate = getParametricTemplateById(family);

  const slugBase = (spec.nameVi || 'dung-cu-ai')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);

  const uniqueSuffix = Date.now().toString(36).slice(-4).toUpperCase();
  const assetId = aiOverrides?.assetId || `OL3D-AI-${uniqueSuffix}`;

  // Màu sắc mặc định theo từng Template 3D
  let defaultPrimaryHex = spec.detectedImagePrimaryHex || '#1E293B';
  let defaultSecondaryHex = spec.detectedImageSecondaryHex || '#CBD5E1';
  let defaultAccentHex = spec.detectedImageAccentHex || '#DC2626';
  let defaultGlassOpacity = 0.28;

  if (family === 'permanent-magnet') {
    defaultPrimaryHex = spec.imageVisionTelemetry?.redPoleHex || '#DC2626';
    defaultSecondaryHex = spec.imageVisionTelemetry?.bluePoleHex || '#1D4ED8';
    defaultAccentHex = '#E2E8F0';
    defaultGlassOpacity = 0.95;
  } else if (family === 'magnetic-compass') {
    defaultPrimaryHex = '#1E293B';
    defaultSecondaryHex = '#1D4ED8';
    defaultAccentHex = '#DC2626';
    defaultGlassOpacity = 0.25;
  } else if (family === 'alcohol-burner') {
    const usesStainless =
      textAll.includes('inox') ||
      textAll.includes('thép') ||
      textAll.includes('bạc');
    defaultPrimaryHex = usesStainless ? '#CBD5E1' : '#D97706';
    defaultSecondaryHex = '#38BDF8';
    defaultAccentHex = '#F97316';
    defaultGlassOpacity = 0.28;
  } else if (family === 'conical-flask') {
    defaultPrimaryHex = '#334155';
    defaultSecondaryHex = '#0284C7';
    defaultAccentHex = '#0EA5E9';
    defaultGlassOpacity = 0.28;
  } else if (family === 'analog-ammeter-voltmeter') {
    defaultPrimaryHex = spec.detectedImagePrimaryHex || '#1E293B';
    defaultSecondaryHex = '#F8FAFC';
    defaultAccentHex = '#DC2626';
    defaultGlassOpacity = 0.22;
  } else if (family === 'rheostat') {
    defaultPrimaryHex = '#1E293B';
    defaultSecondaryHex = '#B45309';
    defaultAccentHex = '#DC2626';
    defaultGlassOpacity = 0.25;
  } else if (family === 'test-tube' || family === 'graduated-glassware') {
    defaultPrimaryHex = '#334155';
    defaultSecondaryHex = '#0284C7';
    defaultAccentHex = '#0EA5E9';
    defaultGlassOpacity = 0.28;
  } else if (family === 'optical-lens' || family === 'optical-prism') {
    defaultPrimaryHex = '#1E293B';
    defaultSecondaryHex = '#94A3B8';
    defaultAccentHex = '#DC2626';
    defaultGlassOpacity = 0.32;
  } else if (family === 'spring-dynamometer') {
    defaultPrimaryHex = '#1E293B';
    defaultSecondaryHex = '#E2E8F0';
    defaultAccentHex = '#DC2626';
  } else if (family === 'electronic-balance') {
    defaultPrimaryHex = '#F1F5F9';
    defaultSecondaryHex = '#94A3B8';
    defaultAccentHex = '#059669';
  }

  let primaryColorHex =
    family === 'permanent-magnet'
      ? defaultPrimaryHex
      : aiOverrides?.primaryColorHex || defaultPrimaryHex;
  let secondaryColorHex =
    family === 'permanent-magnet'
      ? defaultSecondaryHex
      : aiOverrides?.secondaryColorHex || defaultSecondaryHex;
  let accentColorHex = aiOverrides?.accentColorHex || defaultAccentHex;
  let glassOpacity = aiOverrides?.glassOpacity ?? defaultGlassOpacity;

  // Áp dụng toàn bộ yêu cầu chỉnh sửa (Refinement Prompt) lên màu sắc & độ trong suốt của Template
  if (refinement) {
    const isAccentTarget =
      refinement.includes('chi tiết nhấn') ||
      refinement.includes('chốt') ||
      refinement.includes('kim') ||
      refinement.includes('ngọn lửa');
    const isLiquidTarget =
      refinement.includes('dung dịch') ||
      refinement.includes('chất lỏng') ||
      refinement.includes('nước') ||
      refinement.includes('cồn');

    const parseColorFromText = (txt: string): string | null => {
      if (txt.includes('xanh biển') || txt.includes('xanh dương')) return '#1D4ED8';
      if (txt.includes('xanh lá') || txt.includes('lục')) return '#059669';
      if (txt.includes('đỏ')) return '#DC2626';
      if (txt.includes('cam')) return '#EA580C';
      if (txt.includes('vàng') || txt.includes('đồng')) return '#D97706';
      if (txt.includes('tím')) return '#7C3AED';
      if (txt.includes('hồng')) return '#DB2777';
      if (txt.includes('xám') || txt.includes('ghi')) return '#475569';
      if (txt.includes('đen')) return '#0F172A';
      if (
        txt.includes('trắng') ||
        txt.includes('sáng') ||
        txt.includes('bạc') ||
        txt.includes('inox')
      ) {
        return '#E2E8F0';
      }
      return null;
    };

    const clauses = refinement.split(/[,;.]+/);
    for (const rawClause of clauses) {
      const clause = rawClause.trim();
      if (!clause) continue;

      if (clause.includes('trong suốt hơn') || clause.includes('rõ hơn')) {
        glassOpacity = 0.12;
      } else if (clause.includes('đục hơn') || clause.includes('mờ hơn')) {
        glassOpacity = 0.56;
      }

      const detectedHex = parseColorFromText(clause);
      if (detectedHex) {
        if (
          clause.includes('chi tiết nhấn') ||
          clause.includes('chốt') ||
          clause.includes('kim') ||
          clause.includes('ngọn lửa') ||
          (isAccentTarget && clauses.length === 1)
        ) {
          accentColorHex = detectedHex;
        } else if (
          clause.includes('dung dịch') ||
          clause.includes('chất lỏng') ||
          clause.includes('nước') ||
          (isLiquidTarget && clauses.length === 1)
        ) {
          secondaryColorHex = detectedHex;
        } else {
          primaryColorHex = detectedHex;
        }
      }
    }
  }

  // Thiết lập thông số đo lường & điều khiển tương tác thực tế
  let controlStateKey: AiEquipmentBlueprint['controlStateKey'] =
    'multimeterValue';
  let controlLabel = 'Cường độ dòng điện I';
  let controlUnit = 'A';
  let controlMin = 0;
  let controlMax = 3;
  let controlStep = 0.05;
  let controlDefault = 1.2;
  let meterSymbol = 'A';
  let physicsFormulaUnicode = 'I = U / R   (Định luật Ohm)';
  let structuralComponents: string[] = [];

  if (family === 'permanent-magnet') {
    meterSymbol = 'mT';
    controlStateKey = 'multimeterValue';
    controlLabel = 'Cảm ứng từ trường B (mT)';
    controlUnit = 'mT';
    controlMin = 0;
    controlMax = 500;
    controlStep = 10;
    controlDefault = 250;
    physicsFormulaUnicode =
      'F = B · I · l · sin(α)   và   Φ = B · S · cos(α)   (Từ trường Nam châm N → S)';
    structuralComponents = [
      `Cực từ Bắc (North Pole — Sơn màu Đỏ ${primaryColorHex}, khắc ký hiệu chữ N rõ nét): Nơi các đường sức từ đi ra`,
      `Cực từ Nam (South Pole — Sơn màu Xanh ${secondaryColorHex}, khắc ký hiệu chữ S rõ nét): Nơi các đường sức từ đi vào`,
      'Vùng trung hòa từ tính ở chính giữa thân nam châm (mặt phân cách N – S) và các đường sức từ trường cong khép kín ngoài không gian',
    ];
  } else if (family === 'magnetic-compass') {
    meterSymbol = '°';
    controlStateKey = 'incidentAngleDeg';
    controlLabel = 'Góc định hướng kim nam châm α';
    controlUnit = '°';
    controlMin = -180;
    controlMax = 180;
    controlStep = 5;
    controlDefault = 0;
    physicsFormulaUnicode =
      'M = m · B · sin(α)   (Kim nam châm N–S định hướng theo đường sức từ)';
    structuralComponents = [
      'Đế trụ và mặt chia độ la bàn 360° đánh dấu 4 hướng chính: Bắc (N) – Đông (E) – Nam (S) – Tây (W)',
      'Trụ kim nhọn đồng thau đặt tại tâm giảm thiểu ma sát khi kim từ xoay',
      'Kim nam châm hình thoi dẹt phân cực rõ Cực Bắc (N - Sơn Đỏ) và Cực Nam (S - Sơn Xanh)',
    ];
  } else if (family === 'alcohol-burner') {
    meterSymbol = '°C';
    controlStateKey = 'temperatureC';
    controlLabel = 'Nhiệt độ ngọn lửa đèn cồn (0 °C = Đậy nắp tắt lửa)';
    controlUnit = '°C';
    controlMin = 0;
    controlMax = 780;
    controlStep = 10;
    controlDefault = 650;
    physicsFormulaUnicode =
      'Q = m · q   và   C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O + Q';
    structuralComponents = [
      `Bầu thủy tinh Borosilicate dày hình cầu bầu phình rộng ở đáy, cổ thắt nhỏ ở trên (${spec.heightCm} × ${spec.widthCm} cm, chứa cồn Ethanol)`,
      'Cổ giữ bấc và vòi bấc kim loại bằng đồng thau / inox có khía vặn chống trượt lắp khít trên cổ bình',
      'Dây bấc vải cotton bện xoắn cắm sâu xuống bầu cồn và nhô lên ở vòi đốt trung tâm',
      'Ngọn lửa đèn cồn 3D đa lớp (tâm xanh, ngọn cam vàng) kèm Nắp chụp dập lửa bằng đồng/inox đóng mở trực tiếp',
    ];
  } else if (family === 'conical-flask') {
    const cap = spec.capacityMl || spec.rangeMax || 250;
    meterSymbol = 'ml';
    controlStateKey = 'liquidLevelMl';
    controlLabel = 'Thể tích dung dịch trong bình V';
    controlUnit = 'ml';
    controlMin = 0;
    controlMax = cap;
    controlStep = 1;
    controlDefault = Number((cap * 0.45).toFixed(1));
    physicsFormulaUnicode = 'C₍M₎ = n / V   và   m₍dd₎ = D · V';
    structuralComponents = [
      `Thân bình thủy tinh Borosilicate đáy bầu/hình nón cụt phình rộng, cổ thu nhỏ (${cap} ml)`,
      'Vành miệng bình bo tròn chịu nhiệt và thang vạch chia thể tích sắc nét trên thân',
      'Khối dung dịch hóa học bên trong tự động co giãn theo biên dạng bầu của bình',
    ];
  } else if (family === 'analog-ammeter-voltmeter') {
    const isVoltmeter =
      textAll.includes('vôn') ||
      textAll.includes('von') ||
      textAll.includes('volt') ||
      textAll.includes('hiệu điện thế');
    const isGalvano =
      textAll.includes('điện kế') ||
      textAll.includes('dien ke') ||
      textAll.includes('galvano');
    const isMilli = textAll.includes('mili') || textAll.includes('ma');

    if (isVoltmeter) {
      meterSymbol = 'V';
      controlLabel = 'Hiệu điện thế U';
      controlUnit = 'V';
      controlMin = 0;
      controlMax = spec.rangeMax && spec.rangeMax !== 100 ? spec.rangeMax : 6;
      controlStep = Number((controlMax / 60).toFixed(2)) || 0.1;
      controlDefault = Number((controlMax * 0.4).toFixed(1));
      physicsFormulaUnicode = 'U = I · R   (Hiệu điện thế hai đầu đoạn mạch)';
    } else if (isGalvano) {
      meterSymbol = 'G';
      controlLabel = 'Dòng điện cảm ứng i';
      controlUnit = 'mA';
      controlMin = -5;
      controlMax = 5;
      controlStep = 0.1;
      controlDefault = 0;
      physicsFormulaUnicode = 'e₍c₎ = -ΔΦ / Δt   (Cảm ứng điện từ)';
    } else if (isMilli) {
      meterSymbol = 'mA';
      controlLabel = 'Cường độ dòng điện I';
      controlUnit = 'mA';
      controlMin = 0;
      controlMax =
        spec.rangeMax && spec.rangeMax !== 100 ? spec.rangeMax : 500;
      controlStep = 5;
      controlDefault = 150;
      physicsFormulaUnicode = 'I = U / R   (1 A = 1000 mA)';
    } else {
      meterSymbol = 'A';
      controlLabel = 'Cường độ dòng điện I';
      controlUnit = 'A';
      controlMin = 0;
      controlMax = spec.rangeMax && spec.rangeMax !== 100 ? spec.rangeMax : 3;
      controlStep = 0.05;
      controlDefault = 1.2;
      physicsFormulaUnicode = 'I = U / R   (Định luật Ohm: Cường độ dòng điện)';
    }

    structuralComponents = [
      `Hộp vỏ máy hình hộp chữ nhật vát nghiêng bằng nhựa ABS kỹ thuật (${spec.heightCm} × ${spec.widthCm} × ${spec.depthCm} cm)`,
      `Mặt đồng hồ hiển thị vạch chia độ chuẩn xác (0 → ${controlMax} ${controlUnit}), kim chỉ 3D xoay mượt và màn hình báo số trực tiếp`,
      'Mặt kính bảo vệ trong suốt phản xạ PBR và vít hiệu chỉnh vạch số 0 ở chính giữa',
      'Hệ thống chốt cắm điện cực ở mặt trước: Chốt âm màu đen (− COM) và các chốt dương màu đỏ (+ thang đo nhỏ / lớn)',
    ];
  } else if (family === 'rheostat') {
    meterSymbol = 'Ω';
    controlStateKey = 'multimeterValue';
    controlLabel = 'Giá trị điện trở biến trở R';
    controlUnit = 'Ω';
    controlMin = 0;
    controlMax = spec.rangeMax && spec.rangeMax !== 100 ? spec.rangeMax : 20;
    controlStep = 0.5;
    controlDefault = 8;
    physicsFormulaUnicode = 'R = ρ · l / S   và   I = U / (R + R₍b₎)';
    structuralComponents = [
      'Hai chân giá đỡ bằng hợp kim sơn tĩnh điện đen chịu lực ở hai đầu',
      `Ống sứ cách điện quấn sát các vòng dây hợp kim Nikelin/Constantan (0 → ${controlMax} Ω)`,
      'Thanh dẫn hướng kim loại mạ crom và Con chạy biến trở (trượt dọc cuộn dây khi kéo thanh trượt)',
      '3 chốt cắm điện cực (2 chốt đỏ +, 1 chốt đen −) và bảng hiển thị giá trị điện trở R trực tiếp',
    ];
  } else if (family === 'test-tube') {
    const cap = spec.capacityMl || 50;
    meterSymbol = 'ml';
    controlStateKey = 'liquidLevelMl';
    controlLabel = 'Thể tích dung dịch trong ống nghiệm V';
    controlUnit = 'ml';
    controlMin = 0;
    controlMax = cap;
    controlStep = 0.5;
    controlDefault = Number((cap * 0.45).toFixed(1));
    physicsFormulaUnicode = 'V = π · r² · h   và   C₍M₎ = n / V';
    structuralComponents = [
      `Ống nghiệm thủy tinh Borosilicate đáy tròn chịu nhiệt trong suốt (Dung tích ${cap} ml)`,
      'Vành miệng ống nghiệm bo tròn kèm vạch chia độ sắc nét dọc thân ống',
      'Giá đỡ ống nghiệm chuyên dụng giúp giữ ống thẳng đứng an toàn trên bàn thí nghiệm',
      'Cột dung dịch hóa học có mặt khum lõm (meniscus) dâng/hạ trực tiếp theo thể tích V',
    ];
  } else if (family === 'graduated-glassware') {
    const cap = spec.capacityMl || spec.rangeMax || 250;
    meterSymbol = 'ml';
    controlStateKey = 'liquidLevelMl';
    controlLabel = 'Thể tích chất lỏng V';
    controlUnit = 'ml';
    controlMin = 0;
    controlMax = cap;
    controlStep = 1;
    controlDefault = Number((cap * 0.5).toFixed(1));
    physicsFormulaUnicode = 'ΔV = V₂ - V₁   và   ρ = m / ΔV';
    structuralComponents = [
      `Thân bình / ống đong thủy tinh Borosilicate trong suốt tỉ lệ thực (${spec.heightCm} × ${spec.widthCm} cm, ${cap} ml)`,
      'Thang vạch chia thể tích chuẩn xác và bảng hiển thị số đo V (ml) trực tiếp trên thân bình',
      'Cột chất lỏng có mặt khum lõm (meniscus) dâng/hạ mượt mà theo thanh trượt thể tích',
      'Đế thủy tinh dày chống lật đặt khít trên mặt bàn thí nghiệm (Y = 0)',
    ];
  } else if (family === 'spring-dynamometer') {
    const maxN = spec.rangeMax && spec.rangeMax !== 100 ? spec.rangeMax : 5;
    meterSymbol = 'N';
    controlStateKey = 'springExtensionN';
    controlLabel = 'Lực kéo lò xo F';
    controlUnit = 'N';
    controlMin = 0;
    controlMax = maxN;
    controlStep = 0.1;
    controlDefault = Number((maxN * 0.4).toFixed(1));
    physicsFormulaUnicode = 'F = k · Δl   và   F₍A₎ = P - P₍lỏng₎ = d · V';
    structuralComponents = [
      'Giá đỡ kim loại chữ L vững chắc kèm móc treo lực kế ở đỉnh',
      `Thân lực kế khắc vạch chia lực từ 0 đến ${maxN} N kèm bảng báo số trực tiếp`,
      'Lò xo thép xoắn 3D và kim chỉ thị đỏ dịch chuyển chính xác theo độ dãn Δl',
      'Móc treo thép và quả nặng mẫu phía dưới',
    ];
  } else if (family === 'electronic-balance') {
    const maxG =
      spec.rangeMax && spec.rangeMax !== 100
        ? spec.rangeMax
        : Math.max(500, spec.massG * 2);
    meterSymbol = 'g';
    controlStateKey = 'multimeterValue';
    controlLabel = 'Khối lượng vật cân m';
    controlUnit = 'g';
    controlMin = 0;
    controlMax = maxG;
    controlStep = 0.5;
    controlDefault = 125.5;
    physicsFormulaUnicode = 'm = ρ · V   và   P = 10 · m';
    structuralComponents = [
      'Thân vỏ cân điện tử bằng nhựa kỹ thuật ABS đúc nguyên khối chống rung',
      'Đĩa cân Inox 304 tròn phẳng có độ bóng kim loại PBR chân thực',
      'Màn hình LCD kỹ thuật số hiển thị trực tiếp khối lượng m (g) với độ chính xác 0.01 g',
      'Cụm phím chức năng vật lý ON/OFF, MODE và TARE (Trừ bì về 0.00 g)',
    ];
  } else if (family === 'thermometer') {
    meterSymbol = '°C';
    controlStateKey = 'temperatureC';
    controlLabel = 'Nhiệt độ đo t';
    controlUnit = '°C';
    controlMin = 0;
    controlMax = 100;
    controlStep = 0.5;
    controlDefault = 28.5;
    physicsFormulaUnicode = 'Q = m · c · Δt = m · c · (t₂ - t₁)';
    structuralComponents = [
      'Bầu thủy ngân / rượu màu đỏ nhạy nhiệt ở đáy và ống mao dẫn thủy tinh trong suốt',
      'Bảng thang đo nhiệt độ (0 °C → 100 °C) khắc vạch rõ nét kèm màn hình báo số trực tiếp',
      'Cột chất lỏng chỉ thị màu đỏ dâng cao / hạ thấp tương ứng chính xác với nhiệt độ t (°C)',
    ];
  } else if (family === 'optical-lens') {
    const fVal = spec.focalLengthCm || 10;
    meterSymbol = 'f';
    controlStateKey = 'incidentAngleDeg';
    controlLabel = 'Khoảng cách vật / Góc tia sáng';
    controlUnit = '°';
    controlMin = -30;
    controlMax = 30;
    controlStep = 1;
    controlDefault = 0;
    physicsFormulaUnicode = `1/f = 1/d + 1/d'   và   k = -d'/d   (Tiêu cự f = ${fVal} cm)`;
    structuralComponents = [
      `Thấu kính quang học BK7 trong suốt (Tiêu cự f = ${fVal} cm, Đường kính ${spec.widthCm} cm)`,
      'Vành giữ thấu kính bằng hợp kim nhôm anod hóa đen gắn trên trụ đứng có vạch chia chiều cao',
      'Đế kim loại nặng đặt chuẩn trên mặt bàn quang học và chùm tia sáng Laser hội tụ qua tiêu điểm F',
    ];
  } else if (family === 'optical-prism' || family === 'laser-source') {
    meterSymbol = '°';
    controlStateKey = 'incidentAngleDeg';
    controlLabel = 'Góc tới tia sáng i';
    controlUnit = '°';
    controlMin = 0;
    controlMax = 80;
    controlStep = 1;
    controlDefault = 35;
    physicsFormulaUnicode =
      'n₁ · sin(i) = n₂ · sin(r)   và   sin(i₍gh₎) = n₂ / n₁';
    structuralComponents = [
      'Bàn chia độ tròn 360° khắc vạch từng độ trên nền kim loại phẳng',
      'Khối lăng kính / bản bán trụ thủy tinh quang học chiết suất n = 1.50',
      'Nguồn phát tia Laser đỏ (λ = 650 nm) chiếu tia tới, tia khúc xạ và tia phản xạ trực tiếp',
    ];
  } else if (family === 'digital-multimeter') {
    meterSymbol = 'V/A';
    controlStateKey = 'multimeterValue';
    controlLabel = 'Giá trị đo hiển thị';
    controlUnit = spec.unitLabel && spec.unitLabel !== 'đơn vị' ? spec.unitLabel : 'V';
    controlMin = 0;
    controlMax = spec.rangeMax && spec.rangeMax !== 100 ? spec.rangeMax : 20;
    controlStep = 0.1;
    controlDefault = 5.0;
    physicsFormulaUnicode = 'I = U / R   và   P = U · I';
    structuralComponents = [
      'Thân vỏ máy đo kỹ thuật số hình hộp chữ nhật bọc viền chống sốc',
      'Màn hình LCD lớn hiển thị trực tiếp giá trị số đo thực tế và đơn vị',
      'Núm xoay chọn thang đo 3D ở giữa thân máy và 3 lỗ cắm giắc đo (COM đen −, V/Ω/A đỏ +)',
    ];
  } else if (family === 'microscope-biology') {
    meterSymbol = '×';
    controlStateKey = 'magnification';
    controlLabel = 'Độ phóng đại thị kính / vật kính';
    controlUnit = '×';
    controlMin = 40;
    controlMax = 400;
    controlStep = 10;
    controlDefault = 100;
    physicsFormulaUnicode = 'G = G₍thị kính₎ × G₍vật kính₎';
    structuralComponents = [
      'Chân đế kính hiển vi hình móng ngựa và thân giá đỡ cong cứng cáp',
      'Bàn để tiêu bản có kẹp giữ, gương/đèn chiếu sáng và ốc chỉnh tinh/sơ cấp',
      'Mâm xoay 3 vật kính và ống thị kính nghiêng 45°',
    ];
  } else {
    // custom-apparatus: Dụng cụ chuyên biệt bóc tách trực tiếp từ hình ảnh thực tế + mô tả ngoại hình + hoạt động
    const opLower = `${spec.operationPrompt || ''} ${spec.appearancePrompt || ''} ${spec.nameVi || ''}`.toLowerCase();
    if (/nam châm|từ trường|cảm ứng từ|cực bắc|cực nam|cuộn dây|ống dây/.test(opLower)) {
      meterSymbol = 'mT';
      controlStateKey = 'multimeterValue';
      controlLabel = 'Cảm ứng từ trường B';
      controlUnit = 'mT';
      controlMin = 0;
      controlMax = 500;
      controlStep = 10;
      controlDefault = 200;
      physicsFormulaUnicode = 'F = B · I · l   và   Φ = B · S · cos(α)';
    } else if (/nhiệt|đun|nóng|lạnh|°c/.test(opLower)) {
      meterSymbol = '°C';
      controlStateKey = 'temperatureC';
      controlLabel = 'Nhiệt độ / Mức gia nhiệt';
      controlUnit = '°C';
      controlMin = 20;
      controlMax = 100;
      controlStep = 1;
      controlDefault = 25;
      physicsFormulaUnicode = 'Q = m · c · Δt';
    } else if (/áp suất|nén|khí|pittông|piston|bar|atm|pa/.test(opLower)) {
      meterSymbol = 'kPa';
      controlStateKey = 'multimeterValue';
      controlLabel = 'Áp suất khí trong bình';
      controlUnit = 'kPa';
      controlMin = 50;
      controlMax = 250;
      controlStep = 5;
      controlDefault = 101.3;
      physicsFormulaUnicode = 'p · V = n · R · T';
    } else if (/dung tích|thể tích|chất lỏng|dung dịch|nhỏ giọt|khóa|ml/.test(opLower) || (spec.capacityMl && spec.capacityMl > 0)) {
      const maxCap = spec.capacityMl && spec.capacityMl > 0 ? spec.capacityMl : 250;
      meterSymbol = 'ml';
      controlStateKey = 'liquidLevelMl';
      controlLabel = 'Thể tích dung dịch trong dụng cụ';
      controlUnit = 'ml';
      controlMin = 0;
      controlMax = maxCap;
      controlStep = Math.max(1, Math.round(maxCap / 50));
      controlDefault = Math.round(maxCap * 0.5);
      physicsFormulaUnicode = 'V = S · h   và   m = D · V';
    } else if (/điện|vôn|ampe|công tắc|mạch|dòng|tụ/.test(opLower)) {
      meterSymbol = 'V';
      controlStateKey = 'multimeterValue';
      controlLabel = 'Thông số điện áp / Tín hiệu hoạt động';
      controlUnit = 'V';
      controlMin = 0;
      controlMax = 12;
      controlStep = 0.5;
      controlDefault = 6;
      physicsFormulaUnicode = 'I = U / Z   và   P = U · I';
    } else if (/quay|góc|ròng rọc|con lắc|cơ|lực|nâng|la bàn/.test(opLower)) {
      meterSymbol = '°';
      controlStateKey = 'incidentAngleDeg';
      controlLabel = 'Góc vận hành / Vị trí cơ cấu';
      controlUnit = '°';
      controlMin = -45;
      controlMax = 45;
      controlStep = 1;
      controlDefault = 0;
      physicsFormulaUnicode = 'M = F · d   và   A = F · s';
    } else {
      meterSymbol = '%';
      controlStateKey = 'multimeterValue';
      controlLabel = 'Mức độ vận hành thiết bị';
      controlUnit = '%';
      controlMin = 0;
      controlMax = 100;
      controlStep = 5;
      controlDefault = 50;
      physicsFormulaUnicode = 'H = (A₍ích₎ / A₍toàn phần₎) × 100%';
    }
  }

  const resolvedCustomParts: AiGeneratedPartSpec[] =
    synthesizeCustomPartsFromDescription(
      spec,
      primaryColorHex,
      secondaryColorHex,
      accentColorHex,
      aiOverrides?.customParts,
      family,
    );

  if (
    (family === 'custom-apparatus' ||
      family === 'permanent-magnet' ||
      family === 'magnetic-compass') &&
    structuralComponents.length === 0
  ) {
    structuralComponents = resolvedCustomParts.map(
      (p) => `${p.partName} (${p.shape}, màu ${p.colorHex})`,
    );
  }

  const defaultOperationSummary =
    family === 'permanent-magnet'
      ? 'Tạo ra từ trường vĩnh cửu xung quanh 2 cực Bắc (N - Đỏ) và Nam (S - Xanh); kéo thanh trượt cảm ứng từ B (mT) để thay đổi cường độ từ thông và quan sát tương tác hút/đẩy từ tính.'
      : family === 'magnetic-compass'
        ? 'Kim nam châm phân cực Bắc (N - Đỏ) – Nam (S - Xanh) quay tự do trên trục mũi nhọn đồng thau để định hướng theo đường sức từ trường.'
        : family === 'alcohol-burner'
          ? 'Bấm nút [🔥 Bật / Tắt ngọn lửa] hoặc kéo thanh trượt nhiệt độ để thắp sáng ngọn lửa 3 lớp hoặc chụp nắp đồng/inox dập tắt lửa (0 °C); khi cháy tỏa luồng bức xạ nhiệt đối lưu làm nóng ống nghiệm/bình cầu đặt phía trên.'
          : family === 'analog-ammeter-voltmeter'
            ? 'Khi dòng điện chạy qua chốt dương (+) và chốt âm (− COM), khung dây từ điện quay làm kim chỉ 3D lệch góc tỉ lệ thuận với giá trị đo trên vạch chia.'
            : family === 'rheostat'
              ? 'Dịch chuyển con chạy dọc theo thanh dẫn hướng để thay đổi số vòng dây hợp kim tham gia vào mạch, từ đó điều chỉnh điện trở R và cường độ dòng điện I.'
              : 'Tương tác trực tiếp qua nút bấm trạng thái hoặc thanh trượt để thay đổi đại lượng vật lý và quan sát phản hồi tức thời trên mô hình 3D.';

  const shapeClassResult = classifyEquipmentShapeByKeywords(
    spec.nameVi,
    `${spec.appearancePrompt || ''} ${spec.description || ''}`,
    spec.templateId || family,
  );
  const resolvedBaseShapeType: DetectedBaseShapeType =
    spec.baseShapeType || shapeClassResult.shapeType;

  const appliedParametersSummaryVi: string[] =
    resolvedBaseShapeType === 'Cylinder'
      ? [
          `Chiều cao (H): ${spec.heightCm} cm`,
          `Đường kính trụ tròn (Ø): ${spec.widthCm} cm (Đối xứng trụ tròn Ø = ${spec.widthCm} cm)`,
          `Khối lượng (m): ${spec.massG} g`,
          ...(spec.capacityMl ? [`Dung tích định mức (V): ${spec.capacityMl} ml`] : []),
          ...(spec.focalLengthCm ? [`Tiêu cự quang học (f): ${spec.focalLengthCm} cm`] : []),
          `Chất liệu: ${spec.material}`,
        ]
      : [
          `Chiều cao (H): ${spec.heightCm} cm`,
          `Chiều rộng ngang (W): ${spec.widthCm} cm`,
          `Chiều sâu / Bề dày trước-sau (D): ${spec.depthCm} cm`,
          `Khối lượng (m): ${spec.massG} g`,
          `Chất liệu: ${spec.material}`,
        ];

  return {
    assetId,
    slug: `${slugBase}-${uniqueSuffix.toLowerCase()}`,
    nameVi: spec.nameVi.trim() || matchedTemplate.shortLabelVi,
    nameEn:
      aiOverrides?.nameEn || spec.nameVi.trim() || 'AI Custom Lab Equipment',
    shapeFamily: family,
    templateNameVi: matchedTemplate.nameVi,
    proceduralArchetype: mapFamilyToArchetype(family),
    meterSymbol,
    primaryColorHex,
    secondaryColorHex,
    accentColorHex,
    glassOpacity,
    metalness: aiOverrides?.metalness ?? 0.35,
    roughness: aiOverrides?.roughness ?? 0.42,
    hasScaleMarks: true,
    hasDigitalDisplay: true,
    hasOpticalElement:
      family === 'optical-lens' ||
      family === 'optical-prism' ||
      family === 'laser-source',
    controlLabel: aiOverrides?.controlLabel || controlLabel,
    controlUnit: aiOverrides?.controlUnit || controlUnit,
    controlStateKey,
    controlMin: aiOverrides?.controlMin ?? controlMin,
    controlMax: aiOverrides?.controlMax ?? controlMax,
    controlStep: aiOverrides?.controlStep ?? controlStep,
    controlDefault: aiOverrides?.controlDefault ?? controlDefault,
    aiAnalysisSummary:
      aiOverrides?.aiAnalysisSummary ||
      `${spec.imageVisionTelemetry?.visionSummaryVi ? `${spec.imageVisionTelemetry.visionSummaryVi}. ` : ''}Đã nhận diện loại hình học cơ sở [${resolvedBaseShapeType === 'Cylinder' ? 'Cylinder (Hình trụ tròn)' : 'Box (Hình khối 3 chiều)'}] theo "${matchedTemplate.nameVi}" (${appliedParametersSummaryVi.join(' · ')}).`,
    operationSummary:
      aiOverrides?.operationSummary ||
      (spec.operationPrompt && spec.operationPrompt.trim()
        ? `${spec.operationPrompt.trim()} — Đã ánh xạ trực tiếp vào cơ cấu chuyển động & tương tác của ${matchedTemplate.shortLabelVi} (${controlLabel}).`
        : defaultOperationSummary),
    referenceUrl: spec.referenceUrl?.trim() || aiOverrides?.referenceUrl || undefined,
    extractedReferenceContent:
      extractedRefText || aiOverrides?.extractedReferenceContent || undefined,
    structuralComponents:
      aiOverrides?.structuralComponents &&
      aiOverrides.structuralComponents.length > 0 &&
      (hasExplicitAlcoholBurnerText ||
        !aiOverrides.structuralComponents.some((s) =>
          s.toLowerCase().includes('đèn cồn'),
        ))
        ? aiOverrides.structuralComponents
        : structuralComponents,
    customParts: resolvedCustomParts,
    baseShapeType: resolvedBaseShapeType,
    matchedShapeKeywords: shapeClassResult.matchedKeywords,
    appliedParametersSummaryVi,
    physicsFormulaUnicode:
      aiOverrides?.physicsFormulaUnicode || physicsFormulaUnicode,
    housingStyle: aiOverrides?.housingStyle || 'stepped-benchtop',
    terminalCount: aiOverrides?.terminalCount || 3,
    bevelRadiusMm: aiOverrides?.bevelRadiusMm || 6,
  };
}

/**
 * Sinh mã nguồn .HTML hoàn chỉnh (chuẩn OL3D-HTML-MODULE) với đồ họa Three.js PBR chân thực
 * và cơ chế đo lường / kim quay / màn hình số cập nhật thời gian thực.
 */
export function buildHtmlModuleFromBlueprint(
  spec: AiEquipmentInputSpec,
  blueprint: AiEquipmentBlueprint,
): string {
  const heightM = Math.max(0.005, Number((spec.heightCm / 100).toFixed(4)));
  const widthM = Math.max(0.005, Number((spec.widthCm / 100).toFixed(4)));
  const depthM = Math.max(0.005, Number((spec.depthCm / 100).toFixed(4)));

  const manifestJson = {
    moduleSpecVersion: 'OL3D-HTML-MODULE-v2.4',
    canonicalContractVersion: 'v2.3',
    asset: {
      assetId: blueprint.assetId,
      slug: blueprint.slug,
      name: {
        vi: blueprint.nameVi,
        en: blueprint.nameEn,
      },
      kind: 'equipment',
      subject: spec.subject || 'physics',
      category: spec.category || 'measuring-instrument',
      categoryIds: [spec.category || 'measuring-instrument'],
      materialCategory:
        spec.material || 'Nhựa kỹ thuật ABS, Kim loại & Thủy tinh',
      tags: ['ai-designed', blueprint.shapeFamily, blueprint.slug],
      summary: blueprint.aiAnalysisSummary,
      textbookRef: {
        bookTitle: 'Khoa học Tự nhiên (THCS & THPT)',
        chapter: 'Thực hành & Đo lường Khoa học',
        lesson: blueprint.nameVi,
        standardFunction: blueprint.aiAnalysisSummary,
        usageGuidelines: `Công thức áp dụng: ${blueprint.physicsFormulaUnicode}`,
      },
      assetVersion: '2.0.0-ai',
      manifestSchemaVersion: '1.0.0',
      moduleApiVersion: '2.3.0',
      geometry: {
        modelFormat: 'PROCEDURAL_PBR',
        modelUri: `procedural://${blueprint.slug}`,
        modelFileVersion: '2.0.0',
        proceduralArchetype: blueprint.proceduralArchetype,
        upAxis: 'Y',
        anchor: 'base-center',
        boundingBoxM: {
          width: widthM,
          height: heightM,
          depth: depthM,
        },
        dimensions: {
          height: {
            value: spec.heightCm,
            unit: 'cm',
            status: 'verified',
          },
          widthOrDiameter: {
            value: spec.widthCm,
            unit: 'cm',
            status: 'verified',
          },
          depth: {
            value: spec.depthCm,
            unit: 'cm',
            status: 'verified',
          },
        },
        triangleCount: 2840,
        materialCount: 7,
        namedNodes: [
          {
            nodeName: 'housing_body',
            role: 'body',
            description: blueprint.structuralComponents[0] || 'Thân vỏ thiết bị',
          },
          {
            nodeName: 'measurement_dial_or_scale',
            role: 'scale_display',
            description:
              blueprint.structuralComponents[1] ||
              'Mặt đồng hồ chia độ & hiển thị số đo',
          },
          {
            nodeName: 'interactive_actuator',
            role: 'Zero_Tare_Button',
            description:
              blueprint.structuralComponents[2] ||
              'Kim chỉ / Con chạy / Chốt cắm điện cực',
          },
        ],
        scaleValidation: 'verified',
      },
      scientificProperties: {
        material: {
          value: spec.material || 'Nhựa kỹ thuật ABS, Đồng mạ niken & Thủy tinh',
          status: 'verified',
        },
        referenceMass: {
          value: spec.massG || 200,
          unit: 'g',
          status: 'verified',
        },
        ...(spec.focalLengthCm
          ? {
              focalLength: {
                value: spec.focalLengthCm,
                unit: 'cm',
                status: 'verified',
              },
            }
          : {}),
        ...(spec.capacityMl
          ? {
              capacity: {
                value: spec.capacityMl,
                unit: 'ml',
                status: 'verified',
              },
            }
          : {}),
      },
      measurementMetadata: {
        isMeasuringInstrument: true,
        measuredQuantity:
          blueprint.shapeFamily === 'analog-ammeter-voltmeter' ||
          blueprint.shapeFamily === 'digital-multimeter' ||
          blueprint.shapeFamily === 'rheostat'
            ? 'electric-current'
            : blueprint.shapeFamily === 'optical-lens'
              ? 'focal-length'
              : blueprint.shapeFamily === 'graduated-glassware' ||
                  blueprint.shapeFamily === 'test-tube'
                ? 'volume'
                : blueprint.shapeFamily === 'spring-dynamometer'
                  ? 'force'
                  : 'mass',
        rangeMin: {
          value: blueprint.controlMin,
          unit: blueprint.controlUnit,
          status: 'verified',
        },
        rangeMax: {
          value: blueprint.controlMax,
          unit: blueprint.controlUnit,
          status: 'verified',
        },
        leastCount: {
          value: blueprint.controlStep,
          unit: blueprint.controlUnit,
          status: 'verified',
        },
      },
      capabilities: [
        { id: 'selectable', state: 'validated' },
        { id: 'translatable', state: 'validated' },
        { id: 'rotatable', state: 'validated' },
        { id: 'showDimensions', state: 'validated' },
        { id: 'readScale', state: 'validated' },
      ],
      behaviorIds: ['BHV-AI-CUSTOM'],
      validation: {
        assetReviewStatus: 'published',
        geometryStatus: 'verified',
        metrologyStatus: 'verified',
        behaviorStatus: 'validated',
        safetyStatus: 'reviewed',
      },
      provenance: {
        createdBy: 'OpenLab 3D AI Equipment Studio',
        authorRole: 'AI-Assisted Designer',
        organization: 'OpenLab 3D',
        sourceType: 'student-studio-submission',
        createdAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
        license: 'CC-BY-4.0',
        redistributionAllowed: true,
      },
    },
    moduleControls: {
      stateKey: blueprint.controlStateKey,
      label: blueprint.controlLabel,
      unit: blueprint.controlUnit,
      min: blueprint.controlMin,
      max: blueprint.controlMax,
      step: blueprint.controlStep,
      defaultValue: blueprint.controlDefault,
      canBeWeighedOnBalance: true,
      canHoldLiquid:
        blueprint.shapeFamily === 'graduated-glassware' ||
        blueprint.shapeFamily === 'test-tube',
      canSubmergeInVessel: true,
      presets: [
        {
          label: `0 ${blueprint.controlUnit}`,
          statePatch: { [blueprint.controlStateKey]: blueprint.controlMin },
        },
        {
          label: `${blueprint.controlDefault} ${blueprint.controlUnit}`,
          statePatch: { [blueprint.controlStateKey]: blueprint.controlDefault },
        },
        {
          label: `${blueprint.controlMax} ${blueprint.controlUnit}`,
          statePatch: { [blueprint.controlStateKey]: blueprint.controlMax },
        },
      ],
    },
    realPhotoMeta: {
      available: true,
      sourceKind:
        (spec.imageDataUrls && spec.imageDataUrls.length > 0) || spec.imageDataUrl
          ? 'real-photo'
          : 'illustration',
      caption: `${blueprint.nameVi} — Thiết kế bởi AI OpenLab 3D`,
      manufacturerRef: `Kích thước: Cao ${spec.heightCm} cm × Rộng ${spec.widthCm} cm × Sâu ${spec.depthCm} cm · Khối lượng: ${spec.massG} g`,
      realWorldScaleNote: `Công thức chuẩn: ${blueprint.physicsFormulaUnicode}`,
      annotations: [
        {
          xPercent: 50,
          yPercent: 32,
          label: blueprint.structuralComponents[1] || 'Mặt chia độ & Kim chỉ',
        },
        {
          xPercent: 50,
          yPercent: 78,
          label:
            blueprint.structuralComponents[3] ||
            blueprint.structuralComponents[0] ||
            'Chốt cắm điện cực (+ / −)',
        },
      ],
    },
  };

  const iconSvg = `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="60" height="60" rx="10" fill="${blueprint.primaryColorHex}" stroke="#475569" stroke-width="2"/>
    <rect x="16" y="16" width="48" height="30" rx="5" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.5"/>
    <path d="M 22 40 A 20 20 0 0 1 58 40" stroke="#1E293B" stroke-width="2" fill="none"/>
    <line x1="40" y1="42" x2="48" y2="22" stroke="#DC2626" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="26" cy="58" r="5" fill="#0F172A" stroke="#CBD5E1" stroke-width="1.5"/>
    <circle cx="54" cy="58" r="5" fill="#DC2626" stroke="#FCA5A5" stroke-width="1.5"/>
  </svg>`;

  const blueprintConfigJson = JSON.stringify({
    shapeFamily: blueprint.shapeFamily,
    housingStyle: blueprint.housingStyle || 'stepped-benchtop',
    terminalCount: blueprint.terminalCount || 3,
    bevelRadiusMm: blueprint.bevelRadiusMm || 6,
    meterSymbol: blueprint.meterSymbol || 'A',
    heightM,
    widthM,
    depthM,
    primaryColorHex: blueprint.primaryColorHex,
    secondaryColorHex: blueprint.secondaryColorHex,
    accentColorHex: blueprint.accentColorHex,
    glassOpacity: blueprint.glassOpacity,
    focalLengthCm: spec.focalLengthCm || 10,
    capacityMl: spec.capacityMl || 250,
    controlStateKey: blueprint.controlStateKey,
    controlLabel: blueprint.controlLabel,
    controlUnit: blueprint.controlUnit,
    controlMin: blueprint.controlMin,
    controlDefault: blueprint.controlDefault,
    controlMax: blueprint.controlMax,
    controlStep: blueprint.controlStep,
    nameVi: blueprint.nameVi,
    appearancePrompt: spec.appearancePrompt || spec.description || '',
    operationPrompt: spec.operationPrompt || blueprint.operationSummary || '',
    materialText: spec.material || '',
    structuralComponents: blueprint.structuralComponents || [],
    customParts: blueprint.customParts || [],
  });

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>OL3D HTML Module — ${blueprint.nameVi} (${blueprint.assetId})</title>
</head>
<body>
  <script id="ol3d-module-manifest" type="application/json">
${JSON.stringify(manifestJson, null, 2)}
  </script>

  <template id="ol3d-module-icon">
    ${iconSvg}
  </template>

  <template id="ol3d-module-real-photo">
    ${iconSvg}
  </template>

  <script id="ol3d-module-3d-script">
  (function() {
    var CFG = ${blueprintConfigJson};

    function formatVal(v) {
      var num = Number(v);
      if (!isFinite(num)) return '0.0';
      if (Math.abs(CFG.controlStep) < 0.1) return num.toFixed(2);
      if (Math.abs(CFG.controlStep) < 1) return num.toFixed(1);
      return num.toFixed(1);
    }

    /**
     * HÌNH HỌC PHỨC TẠP 1: Tạo hình khối bo góc mềm mại (Beveled & Rounded ExtrudeGeometry)
     * Thay thế hoàn toàn BoxGeometry sắc cạnh kiểu 8-bit.
     */
    function createBeveledBlockGeometry(THREE, width, height, depth, cornerR, bevelAmt) {
      var w = Math.max(0.004, width);
      var h = Math.max(0.004, height);
      var d = Math.max(0.004, depth);
      var bv = Math.min(bevelAmt || Math.min(w, h, d) * 0.08, Math.min(w, h, d) * 0.22);
      var effW = Math.max(0.002, w - bv * 2);
      var effH = Math.max(0.002, h - bv * 2);
      var effD = Math.max(0.002, d - bv * 2);
      var r = Math.min(cornerR || Math.min(effW, effH) * 0.14, Math.min(effW, effH) * 0.45);

      var shape = new THREE.Shape();
      var x0 = -effW / 2;
      var y0 = -effH / 2;
      shape.moveTo(x0 + r, y0);
      shape.lineTo(x0 + effW - r, y0);
      shape.quadraticCurveTo(x0 + effW, y0, x0 + effW, y0 + r);
      shape.lineTo(x0 + effW, y0 + effH - r);
      shape.quadraticCurveTo(x0 + effW, y0 + effH, x0 + effW - r, y0 + effH);
      shape.lineTo(x0 + r, y0 + effH);
      shape.quadraticCurveTo(x0, y0 + effH, x0, y0 + effH - r);
      shape.lineTo(x0, y0 + r);
      shape.quadraticCurveTo(x0, y0, x0 + r, y0);

      var geo = new THREE.ExtrudeGeometry(shape, {
        depth: effD,
        steps: 1,
        bevelEnabled: true,
        bevelThickness: bv,
        bevelSize: bv,
        bevelSegments: 5,
        curveSegments: 14
      });
      geo.center();
      geo.computeVertexNormals();
      return geo;
    }

    /**
     * HÌNH HỌC PHỨC TẠP 2: Tạo khung viền hốc lõm 3D (Recessed Window Frame Geometry)
     * Có lỗ khoét thật ở giữa (Shape + Hole Path + Bevel) để mặt đồng hồ lõm sâu vào trong vỏ máy.
     */
    function createRecessedFrameGeometry(THREE, outerW, outerH, innerW, innerH, depth, cornerR, bevelAmt) {
      var ow = Math.max(0.01, outerW);
      var oh = Math.max(0.01, outerH);
      var iw = Math.min(ow * 0.88, Math.max(0.006, innerW));
      var ih = Math.min(oh * 0.88, Math.max(0.006, innerH));
      var rOut = Math.min(cornerR || Math.min(ow, oh) * 0.12, Math.min(ow, oh) * 0.42);
      var rIn = Math.min(rOut * 0.75, Math.min(iw, ih) * 0.35);
      var bv = Math.min(bevelAmt || 0.0025, depth * 0.35);

      var outerShape = new THREE.Shape();
      var ox = -ow / 2;
      var oy = -oh / 2;
      outerShape.moveTo(ox + rOut, oy);
      outerShape.lineTo(ox + ow - rOut, oy);
      outerShape.quadraticCurveTo(ox + ow, oy, ox + ow, oy + rOut);
      outerShape.lineTo(ox + ow, oy + oh - rOut);
      outerShape.quadraticCurveTo(ox + ow, oy + oh, ox + ow - rOut, oy + oh);
      outerShape.lineTo(ox + rOut, oy + oh);
      outerShape.quadraticCurveTo(ox, oy + oh, ox, oy + oh - rOut);
      outerShape.lineTo(ox, oy + rOut);
      outerShape.quadraticCurveTo(ox, oy, ox + rOut, oy);

      var holePath = new THREE.Path();
      var hx = -iw / 2;
      var hy = -ih / 2;
      holePath.moveTo(hx + rIn, hy);
      holePath.lineTo(hx + iw - rIn, hy);
      holePath.quadraticCurveTo(hx + iw, hy, hx + iw, hy + rIn);
      holePath.lineTo(hx + iw, hy + ih - rIn);
      holePath.quadraticCurveTo(hx + iw, hy + ih, hx + iw - rIn, hy + ih);
      holePath.lineTo(hx + rIn, hy + ih);
      holePath.quadraticCurveTo(hx, hy + ih, hx, hy + ih - rIn);
      holePath.lineTo(hx, hy + rIn);
      holePath.quadraticCurveTo(hx, hy, hx + rIn, hy);
      outerShape.holes.push(holePath);

      var geo = new THREE.ExtrudeGeometry(outerShape, {
        depth: Math.max(0.004, depth),
        steps: 1,
        bevelEnabled: true,
        bevelThickness: bv,
        bevelSize: bv,
        bevelSegments: 4,
        curveSegments: 14
      });
      geo.center();
      geo.computeVertexNormals();
      return geo;
    }

    /**
     * HÌNH HỌC PHỨC TẠP 3: Mặt kính đồng hồ uốn cong vòm (Curved Convex Gauge Glass)
     * Dịch chuyển đỉnh lưới mịn 32x24 theo phương +Z để tạo độ cong vòm quang học chân thực.
     */
    function createCurvedGaugeGlassGeometry(THREE, width, height, sagittaDepth) {
      var segX = 32;
      var segY = 24;
      var geo = new THREE.PlaneGeometry(width, height, segX, segY);
      var pos = geo.attributes.position;
      var halfW = Math.max(0.001, width * 0.5);
      var halfH = Math.max(0.001, height * 0.5);
      var domeZ = sagittaDepth || Math.min(width, height) * 0.085;

      for (var i = 0; i < pos.count; i++) {
        var vx = pos.getX(i);
        var vy = pos.getY(i);
        var nx = vx / halfW;
        var ny = vy / halfH;
        var profile = Math.max(0, (1 - nx * nx * 0.78) * (1 - ny * ny * 0.78));
        pos.setZ(i, domeZ * profile);
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
      return geo;
    }

    /**
     * HÌNH HỌC PHỨC TẠP 4: Tạo bình/ống thủy tinh thành dày có vành miệng loe bằng LatheGeometry
     */
    function createLatheGlassVesselGeometry(THREE, bottomR, topR, height, wallThick, flareLip) {
      var pts = [];
      var wt = wallThick || Math.max(0.0018, bottomR * 0.06);
      var lip = flareLip || wt * 1.85;
      // Điểm từ tâm đáy ngoài -> thành ngoài -> vành miệng loe -> thành trong -> tâm đáy trong
      pts.push(new THREE.Vector2(0.0001, 0));
      pts.push(new THREE.Vector2(bottomR * 0.88, 0));
      pts.push(new THREE.Vector2(bottomR, wt * 0.9));
      pts.push(new THREE.Vector2(topR, height - wt * 1.4));
      pts.push(new THREE.Vector2(topR + lip, height - wt * 0.35));
      pts.push(new THREE.Vector2(topR + lip * 0.85, height));
      pts.push(new THREE.Vector2(Math.max(0.002, topR - wt), height - wt * 0.4));
      pts.push(new THREE.Vector2(Math.max(0.002, bottomR - wt), wt * 1.35));
      pts.push(new THREE.Vector2(0.0001, wt * 1.1));

      var geo = new THREE.LatheGeometry(pts, 44);
      geo.computeVertexNormals();
      return geo;
    }

    /**
     * HÌNH HỌC PHỨC TẠP 5: Tạo lò xo xoắn ốc 3D thật (Helical Spring TubeGeometry)
     */
    function createHelicalSpringGeometry(THREE, coilR, length, turns, wireR) {
      var pts = [];
      var totalSteps = Math.max(48, turns * 16);
      for (var i = 0; i <= totalSteps; i++) {
        var t = i / totalSteps;
        var angle = t * turns * Math.PI * 2;
        var x = Math.cos(angle) * coilR;
        var z = Math.sin(angle) * coilR;
        var y = (t - 0.5) * length;
        pts.push(new THREE.Vector3(x, y, z));
      }
      var curve = new THREE.CatmullRomCurve3(pts);
      var geo = new THREE.TubeGeometry(curve, totalSteps, wireR, 10, false);
      geo.computeVertexNormals();
      return geo;
    }

    /**
     * Vẽ mặt đồng hồ kim chỉ Analog + Vòng cung chống thị sai + Màn hình số Digital sắc nét
     */
    function drawAnalogMeterFaceCanvas(canvas, currentVal) {
      var ctx = canvas.getContext('2d');
      if (!ctx) return;
      var W = canvas.width;
      var H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Nền mặt đồng hồ sơn tĩnh điện trắng ngà có hiệu ứng đổ bóng viền lõm nhẹ (ambient vignette)
      var bgGrad = ctx.createRadialGradient(W * 0.5, H * 0.52, W * 0.1, W * 0.5, H * 0.5, W * 0.65);
      bgGrad.addColorStop(0, '#FFFFFF');
      bgGrad.addColorStop(0.82, '#F8FAFC');
      bgGrad.addColorStop(1, '#CBD5E1');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Viền khung kỹ thuật đôi bên trong mặt đồng hồ
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 5;
      ctx.strokeRect(12, 12, W - 24, H - 24);

      var cx = W * 0.5;
      var cy = H * 0.84;
      var radius = Math.min(W * 0.41, H * 0.68);
      var startAngle = -Math.PI * 0.80; // -144 deg (bên trái)
      var endAngle = -Math.PI * 0.20;   // -36 deg (bên phải)

      // Rãnh gương phản quang chống sai số thị sai (parabolic mirror slot)
      var mirrorGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy);
      mirrorGrad.addColorStop(0, '#CBD5E1');
      mirrorGrad.addColorStop(0.48, '#FFFFFF');
      mirrorGrad.addColorStop(0.55, '#94A3B8');
      mirrorGrad.addColorStop(1, '#E2E8F0');
      ctx.strokeStyle = mirrorGrad;
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.84, startAngle, endAngle);
      ctx.stroke();

      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.84 - 8, startAngle, endAngle);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.84 + 8, startAngle, endAngle);
      ctx.stroke();

      // Vòng cung chia độ chính màu đen đậm
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.stroke();

      var minV = Number(CFG.controlMin) || 0;
      var maxV = Number(CFG.controlMax) || 3;
      if (maxV <= minV) maxV = minV + 1;
      var majorCount = 6;
      var minorPerMajor = 5;
      var totalTicks = majorCount * minorPerMajor;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (var i = 0; i <= totalTicks; i++) {
        var t = i / totalTicks;
        var ang = startAngle + t * (endAngle - startAngle);
        var isMajor = (i % minorPerMajor === 0);
        var isMid = (!isMajor && (i % 5 === 2 || i % 5 === 3));
        var innerR = isMajor ? radius - 28 : isMid ? radius - 19 : radius - 13;
        var outerR = radius + 2;

        ctx.strokeStyle = isMajor ? '#0F172A' : '#334155';
        ctx.lineWidth = isMajor ? 4.2 : 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * innerR, cy + Math.sin(ang) * innerR);
        ctx.lineTo(cx + Math.cos(ang) * outerR, cy + Math.sin(ang) * outerR);
        ctx.stroke();

        if (isMajor) {
          var tickVal = minV + t * (maxV - minV);
          var labelStr = Math.abs(tickVal - Math.round(tickVal)) < 0.01
            ? String(Math.round(tickVal))
            : tickVal.toFixed(1);
          var textR = radius + 30;
          ctx.fillStyle = '#0F172A';
          ctx.font = 'bold 26px sans-serif';
          ctx.fillText(labelStr, cx + Math.cos(ang) * textR, cy + Math.sin(ang) * textR);
        }
      }

      // Ký hiệu đại lượng lớn ở chính giữa mặt đồng hồ (A, mA, V, G)
      ctx.fillStyle = '#0F172A';
      ctx.font = '900 54px sans-serif';
      ctx.fillText(CFG.meterSymbol || CFG.controlUnit || 'A', cx, cy - radius * 0.44);

      // Ký hiệu cấp chính xác 1.5 & dòng điện một chiều (—)
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy - radius * 0.29);
      ctx.lineTo(cx + 30, cy - radius * 0.29);
      ctx.stroke();
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText('CLASS 1.5 · DC', cx - radius * 0.62, H - 36);

      // Ô hiển thị số đo Digital trực tiếp trên mặt thiết bị giúp học sinh đọc kết quả ngay trong 3D
      var boxW = 232;
      var boxH = 48;
      var boxX = cx - boxW / 2;
      var boxY = H - 72;
      ctx.fillStyle = '#06281E';
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      ctx.fillStyle = '#34D399';
      ctx.font = 'bold 26px monospace';
      ctx.fillText(
        formatVal(currentVal) + ' ' + (CFG.controlUnit || 'A'),
        cx,
        boxY + boxH / 2 + 2
      );
    }

    /**
     * Vẽ màn hình LCD kỹ thuật số hiển thị trực tiếp số đo
     */
    function drawDigitalReadoutCanvas(canvas, titleText, currentVal, unitText) {
      var ctx = canvas.getContext('2d');
      if (!ctx) return;
      var W = canvas.width;
      var H = canvas.height;
      ctx.fillStyle = '#051F18';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, W - 12, H - 12);

      ctx.fillStyle = '#6EE7B7';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText((titleText || 'ĐO LƯỜNG').slice(0, 26), 22, 42);

      ctx.fillStyle = '#ECFDF5';
      ctx.font = 'bold 68px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(formatVal(currentVal) + ' ' + (unitText || ''), W - 24, H - 36);
    }

    /**
     * Vẽ thang chia vạch dọc cho Ống đong / Ống nghiệm / Lực kế / Nhiệt kế
     */
    function createVerticalScaleTexture(THREE, minVal, maxVal, unitText) {
      var canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 512;
      var ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 256, 512);
        ctx.strokeStyle = '#0F172A';
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 22px sans-serif';
        var steps = 10;
        for (var i = 0; i <= steps; i++) {
          var y = 460 - (i / steps) * 400;
          var isMajor = (i % 2 === 0);
          ctx.lineWidth = isMajor ? 3.5 : 2;
          ctx.beginPath();
          ctx.moveTo(75, y);
          ctx.lineTo(isMajor ? 140 : 115, y);
          ctx.stroke();
          if (isMajor) {
            var v = minVal + (i / steps) * (maxVal - minVal);
            var txt = Math.abs(v - Math.round(v)) < 0.05 ? String(Math.round(v)) : v.toFixed(1);
            ctx.fillText(txt, 148, y + 7);
          }
        }
        ctx.font = '900 24px sans-serif';
        ctx.fillText(unitText || 'ml', 110, 34);
      }
      var tex = new THREE.CanvasTexture(canvas);
      if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      return tex;
    }

    /**
     * HÌNH HỌC PHỨC TẠP 6: Chốt cắm điện cực đa tầng (Multi-mesh Beveled & Knurled Binding Post)
     * Gồm: Vòng đệm cách điện đáy + Đai ốc lục giác đồng mạ crom + Trụ kim loại + Núm vặn bo tròn có 12 khía chống trượt + Lỗ cắm giắc bắp chuối 4mm trên đỉnh.
     */
    function createBindingPost(THREE, postColorHex, radius, height, labelChar) {
      var postGroup = new THREE.Group();
      postGroup.name = 'binding_post_' + (labelChar || 'term');

      var chromeMat = new THREE.MeshPhysicalMaterial({
        color: 0xE2E8F0,
        metalness: 0.90,
        roughness: 0.18,
        clearcoat: 0.35
      });
      var brassNutMat = new THREE.MeshPhysicalMaterial({
        color: 0xD97706,
        metalness: 0.85,
        roughness: 0.24
      });
      var insulatorBaseMat = new THREE.MeshPhysicalMaterial({
        color: 0x0F172A,
        metalness: 0.05,
        roughness: 0.55
      });
      var capPlasticMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(postColorHex),
        metalness: 0.08,
        roughness: 0.36,
        clearcoat: 0.28,
        clearcoatRoughness: 0.25
      });

      // 1. Vòng đệm cách điện có gờ vát ở chân đế
      var collarPts = [
        new THREE.Vector2(0.001, 0),
        new THREE.Vector2(radius * 1.42, 0),
        new THREE.Vector2(radius * 1.38, height * 0.11),
        new THREE.Vector2(radius * 1.18, height * 0.16),
        new THREE.Vector2(0.001, height * 0.16)
      ];
      var collarMesh = new THREE.Mesh(new THREE.LatheGeometry(collarPts, 28), insulatorBaseMat);
      collarMesh.castShadow = true;
      collarMesh.receiveShadow = true;
      postGroup.add(collarMesh);

      // 2. Đai ốc lục giác kim loại (6 cạnh) siết dưới chân chốt
      var hexNutGeo = new THREE.CylinderGeometry(radius * 1.24, radius * 1.24, height * 0.16, 6);
      var hexNut = new THREE.Mesh(hexNutGeo, brassNutMat);
      hexNut.position.y = height * 0.22;
      hexNut.castShadow = true;
      postGroup.add(hexNut);

      // 3. Trụ kim loại dẫn điện mạ niken có lỗ xuyên ngang ở cổ chốt
      var stemGeo = new THREE.CylinderGeometry(radius * 0.54, radius * 0.54, height * 0.84, 24);
      var stem = new THREE.Mesh(stemGeo, chromeMat);
      stem.position.y = height * 0.48;
      stem.castShadow = true;
      postGroup.add(stem);

      // 4. Núm vặn nhựa ABS cách điện được tiện bo tròn các cạnh bằng LatheGeometry
      var knobBottomY = height * 0.36;
      var knobTopY = height * 0.94;
      var knobH = knobTopY - knobBottomY;
      var knobPts = [
        new THREE.Vector2(radius * 0.52, 0),
        new THREE.Vector2(radius * 1.08, knobH * 0.06),
        new THREE.Vector2(radius * 1.14, knobH * 0.22),
        new THREE.Vector2(radius * 0.96, knobH * 0.42),
        new THREE.Vector2(radius * 1.10, knobH * 0.65),
        new THREE.Vector2(radius * 1.04, knobH * 0.88),
        new THREE.Vector2(radius * 0.78, knobH * 0.98),
        new THREE.Vector2(radius * 0.44, knobH),
        new THREE.Vector2(radius * 0.42, knobH * 0.75)
      ];
      var knobLatheGeo = new THREE.LatheGeometry(knobPts, 32);
      knobLatheGeo.computeVertexNormals();
      var knobMesh = new THREE.Mesh(knobLatheGeo, capPlasticMat);
      knobMesh.position.y = knobBottomY;
      knobMesh.castShadow = true;
      knobMesh.receiveShadow = true;
      postGroup.add(knobMesh);

      // 5. Các gờ khía chống trượt (12 Knurling Ribs) xung quanh núm vặn
      var ribCount = 12;
      var ribGeo = new THREE.CylinderGeometry(radius * 0.085, radius * 0.095, knobH * 0.66, 8);
      for (var ri = 0; ri < ribCount; ri++) {
        var rAng = (ri / ribCount) * Math.PI * 2;
        var rib = new THREE.Mesh(ribGeo, capPlasticMat);
        rib.position.set(
          Math.cos(rAng) * (radius * 1.05),
          knobBottomY + knobH * 0.50,
          Math.sin(rAng) * (radius * 1.05)
        );
        postGroup.add(rib);
      }

      // 6. Vòng kim loại & lỗ cắm giắc bắp chuối 4mm ở chính giữa đỉnh chốt
      var socketRing = new THREE.Mesh(
        new THREE.TorusGeometry(radius * 0.36, radius * 0.09, 12, 24),
        chromeMat
      );
      socketRing.rotation.x = Math.PI / 2;
      socketRing.position.y = knobTopY + 0.001;
      postGroup.add(socketRing);

      var socketHole = new THREE.Mesh(
        new THREE.CylinderGeometry(radius * 0.28, radius * 0.28, height * 0.08, 16),
        insulatorBaseMat
      );
      socketHole.position.y = knobTopY - height * 0.02;
      postGroup.add(socketHole);

      return postGroup;
    }

    function buildEquipmentGroup(THREE) {
      var group = new THREE.Group();
      group.name = CFG.nameVi || 'AI_Equipment_Group';

      var h = Math.max(0.04, CFG.heightM || 0.16);
      var w = Math.max(0.04, CFG.widthM || 0.12);
      var d = Math.max(0.04, CFG.depthM || 0.10);

      // VẬT LIỆU PBR CAO CẤP (Nhựa ABS mờ kỹ thuật, Kim loại mạ Crom/Đồng, Thủy tinh khúc xạ ánh sáng)
      var housingMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(CFG.primaryColorHex || '#1E293B'),
        metalness: 0.08,
        roughness: 0.44,
        clearcoat: 0.18,
        clearcoatRoughness: 0.42,
        reflectivity: 0.55
      });
      var darkTrimMat = new THREE.MeshPhysicalMaterial({
        color: 0x0F172A,
        metalness: 0.15,
        roughness: 0.48,
        clearcoat: 0.12,
        clearcoatRoughness: 0.5
      });
      var rubberFootMat = new THREE.MeshStandardMaterial({
        color: 0x090D16,
        metalness: 0.02,
        roughness: 0.88
      });
      var brushedMetalMat = new THREE.MeshPhysicalMaterial({
        color: 0xE2E8F0,
        metalness: 0.88,
        roughness: 0.20,
        clearcoat: 0.30,
        clearcoatRoughness: 0.18
      });
      var brassMat = new THREE.MeshPhysicalMaterial({
        color: 0xD97706,
        metalness: 0.85,
        roughness: 0.24,
        clearcoat: 0.22
      });
      var recessedInteriorMat = new THREE.MeshStandardMaterial({
        color: 0x1E293B,
        metalness: 0.12,
        roughness: 0.65
      });
      // Mặt kính đồng hồ uốn cong có hiệu ứng khúc xạ ánh sáng & phản chiếu môi trường (Curved Refractive Gauge Glass)
      var glassAlpha = typeof CFG.glassOpacity === 'number'
        ? Math.max(0.08, Math.min(0.85, CFG.glassOpacity))
        : 0.28;
      var accentHexStr = CFG.accentColorHex || '#DC2626';
      var secondaryHexStr = CFG.secondaryColorHex || '#0284C7';

      // Mặt kính đồng hồ uốn cong có hiệu ứng khúc xạ ánh sáng & phản chiếu môi trường (Curved Refractive Gauge Glass)
      var curvedGaugeGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: glassAlpha,
        roughness: 0.04,
        metalness: 0.02,
        transmission: Math.max(0.45, 0.96 - glassAlpha * 0.45),
        ior: 1.52,
        thickness: 0.012,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        specularIntensity: 1.0,
        depthWrite: false
      });
      var boroGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0xE0F2FE,
        transparent: true,
        opacity: glassAlpha,
        roughness: 0.04,
        metalness: 0.02,
        transmission: Math.max(0.45, 0.96 - glassAlpha * 0.45),
        ior: 1.49,
        thickness: 0.010,
        clearcoat: 1.0,
        clearcoatRoughness: 0.06,
        depthWrite: false
      });

      // Hàm nội suy thông số từng bộ phận từ Bản phác thảo 2D (CFG.customParts) sang mô hình 3D Three.js
      var cParts = Array.isArray(CFG.customParts) ? CFG.customParts : [];
      function getPartSpec(idx, defScale, defPos) {
        var p = cParts[idx];
        if (!p) {
          return {
            scale: defScale,
            pos: defPos,
            colorHex: null,
            shape: null,
            partName: ''
          };
        }
        var s = Array.isArray(p.relativeScale) && p.relativeScale.length >= 3 ? p.relativeScale : defScale;
        var pos = Array.isArray(p.relativePos) && p.relativePos.length >= 3 ? p.relativePos : defPos;
        return {
          scale: [
            Math.max(0.06, Math.min(2.4, Number(s[0]) || defScale[0])),
            Math.max(0.04, Math.min(2.4, Number(s[1]) || defScale[1])),
            Math.max(0.06, Math.min(2.4, Number(s[2]) || defScale[2]))
          ],
          pos: [
            Math.max(-1.2, Math.min(1.2, Number(pos[0]) || 0)),
            Math.max(0.01, Math.min(1.5, Number(pos[1]) || defPos[1])),
            Math.max(-1.2, Math.min(1.2, Number(pos[2]) || 0))
          ],
          colorHex: p.colorHex || null,
          shape: p.shape || null,
          partName: p.partName || ''
        };
      }

      // =======================================================================
      // 0. ĐÈN CỒN THỦY TINH PHÒNG THÍ NGHIỆM (ALCOHOL BURNER / SPIRIT LAMP)
      //    Đồng bộ 100% với 5 khối trên Bản phác thảo cấu trúc 2D:
      //    1. Chân đế thiết bị vững (pBase)
      //    2. Bầu thân chính chứa cồn (pBulb)
      //    3. Cổ thắt phía trên (pNeck)
      //    4. Nắp chụp / Đầu giữ kim (pCap)
      //    5. Bảng mặt trước / Cụm điều khiển (pPanel)
      // =======================================================================
      if (CFG.shapeFamily === 'alcohol-burner') {
        var pBase = getPartSpec(0, [0.66, 0.10, 0.66], [0, 0.05, 0]);
        var pBulb = getPartSpec(1, [0.92, 0.48, 0.92], [0, 0.34, 0]);
        var pNeck = getPartSpec(2, [0.31, 0.16, 0.31], [0, 0.65, 0]);
        var pCap = getPartSpec(3, [0.38, 0.22, 0.38], [0, 0.84, 0]);
        var pPanel = getPartSpec(4, [0.58, 0.14, 0.12], [0, 0.14, 0.46]);

        var baseFootR = Math.max(0.022, w * pBase.scale[0] * 0.5);
        var baseFootH = Math.max(0.005, h * pBase.scale[1]);
        var baseOffsetX = w * pBase.pos[0];

        var bulbMaxR = Math.max(0.026, Math.min(w, d) * (pBulb.scale[0] * 0.5));
        var bulbH = Math.max(0.045, h * (pBulb.scale[1] + pNeck.scale[1] * 0.72));
        var bulbOffsetX = w * pBulb.pos[0];
        var bulbBaseY = Math.max(0, h * (pBulb.pos[1] - pBulb.scale[1] * 0.5) - baseFootH * 0.35);

        var neckR = Math.max(0.009, Math.min(bulbMaxR * 0.78, w * pNeck.scale[0] * 0.5));
        var wallT = Math.max(0.0022, bulbMaxR * 0.065);

        var descLower = ((CFG.appearancePrompt || '') + ' ' + (CFG.materialText || '')).toLowerCase();
        var useStainlessCap = descLower.indexOf('inox') !== -1 || descLower.indexOf('thép') !== -1 || descLower.indexOf('bạc') !== -1;
        var burnerMetalMat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(pCap.colorHex || CFG.primaryColorHex || (useStainlessCap ? '#CBD5E1' : '#D97706')),
          metalness: 0.82,
          roughness: 0.24,
          clearcoat: 0.28
        });

        // 0. Chân đế thiết bị vững (đồng bộ trực tiếp với Khối 1 trên phác thảo 2D)
        var basePedestalGeo = new THREE.CylinderGeometry(
          baseFootR * 0.94,
          baseFootR * 1.02,
          baseFootH,
          40
        );
        var basePedestalMesh = new THREE.Mesh(basePedestalGeo, boroGlassMat);
        basePedestalMesh.position.set(baseOffsetX, baseFootH * 0.5, 0);
        basePedestalMesh.renderOrder = 7;
        group.add(basePedestalMesh);

        // 1. Bầu thủy tinh chứa cồn hình cầu bầu ở đáy + cổ thắt nhỏ ở trên (LatheGeometry thành dày)
        var glassBulbPts = [
          new THREE.Vector2(0.0001, 0),
          new THREE.Vector2(baseFootR * 0.92, 0),
          new THREE.Vector2(bulbMaxR * 0.74, bulbH * 0.05),
          new THREE.Vector2(bulbMaxR * 0.96, bulbH * 0.22),
          new THREE.Vector2(bulbMaxR * 1.00, bulbH * 0.38),
          new THREE.Vector2(bulbMaxR * 0.88, bulbH * 0.56),
          new THREE.Vector2(bulbMaxR * 0.58, bulbH * 0.72),
          new THREE.Vector2(neckR * 1.08, bulbH * 0.80),
          new THREE.Vector2(neckR * 1.08, bulbH * 0.96),
          new THREE.Vector2(neckR * 1.18, bulbH * 1.00),
          new THREE.Vector2(neckR * 0.82, bulbH * 1.00),
          new THREE.Vector2(neckR * 0.82, bulbH * 0.78),
          new THREE.Vector2(bulbMaxR * 0.88 - wallT, bulbH * 0.54),
          new THREE.Vector2(bulbMaxR * 1.00 - wallT, bulbH * 0.36),
          new THREE.Vector2(baseFootR * 0.88, wallT * 1.8),
          new THREE.Vector2(0.0001, wallT * 1.6)
        ];
        var glassBulbGeo = new THREE.LatheGeometry(glassBulbPts, 48);
        glassBulbGeo.computeVertexNormals();
        var glassBulbMesh = new THREE.Mesh(glassBulbGeo, boroGlassMat);
        glassBulbMesh.position.set(bulbOffsetX, bulbBaseY, 0);
        glassBulbMesh.renderOrder = 8;
        group.add(glassBulbMesh);

        // 2. Dung dịch cồn Ethanol bên trong bầu thủy tinh (ôm sát phần cầu bầu ở đáy)
        var alcoholLiqPts = [
          new THREE.Vector2(0.0001, wallT * 1.8),
          new THREE.Vector2(baseFootR * 0.84, wallT * 2.0),
          new THREE.Vector2(bulbMaxR * 0.91, bulbH * 0.22),
          new THREE.Vector2(bulbMaxR * 0.93, bulbH * 0.37),
          new THREE.Vector2(bulbMaxR * 0.80, bulbH * 0.52),
          new THREE.Vector2(0.0001, bulbH * 0.51)
        ];
        var alcoholLiqGeo = new THREE.LatheGeometry(alcoholLiqPts, 40);
        alcoholLiqGeo.computeVertexNormals();
        var alcoholLiqMat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(pBulb.colorHex || CFG.secondaryColorHex || '#38BDF8'),
          transparent: true,
          opacity: 0.58,
          roughness: 0.08,
          ior: 1.36,
          clearcoat: 0.9
        });
        var alcoholLiqMesh = new THREE.Mesh(alcoholLiqGeo, alcoholLiqMat);
        alcoholLiqMesh.position.set(bulbOffsetX, bulbBaseY, 0);
        alcoholLiqMesh.renderOrder = 5;
        group.add(alcoholLiqMesh);

        // 3. Cổ chụp giữ bấc & vòi bấc bằng Đồng thau / Inox lắp trên cổ thắt nhỏ
        var neckOffsetX = w * pNeck.pos[0];
        var holderBaseY = bulbBaseY + bulbH * 0.95;
        var holderH = Math.max(0.014, h * (pCap.scale[1] * 0.64));
        var holderPts = [
          new THREE.Vector2(neckR * 0.42, 0),
          new THREE.Vector2(neckR * 1.28, 0),
          new THREE.Vector2(neckR * 1.32, holderH * 0.28),
          new THREE.Vector2(neckR * 1.15, holderH * 0.36),
          new THREE.Vector2(neckR * 0.46, holderH * 0.42),
          new THREE.Vector2(neckR * 0.36, holderH * 0.46),
          new THREE.Vector2(neckR * 0.34, holderH * 1.00),
          new THREE.Vector2(neckR * 0.22, holderH * 1.00),
          new THREE.Vector2(neckR * 0.22, 0)
        ];
        var holderGeo = new THREE.LatheGeometry(holderPts, 36);
        holderGeo.computeVertexNormals();
        var holderMesh = new THREE.Mesh(holderGeo, burnerMetalMat);
        holderMesh.position.set(neckOffsetX, holderBaseY, 0);
        holderMesh.castShadow = true;
        holderMesh.receiveShadow = true;
        group.add(holderMesh);

        // Khía chống trượt xung quanh vành cổ đồng/inox
        for (var kri = 0; kri < 16; kri++) {
          var kAng = (kri / 16) * Math.PI * 2;
          var knurl = new THREE.Mesh(
            new THREE.CylinderGeometry(0.0012, 0.0012, holderH * 0.26, 6),
            burnerMetalMat
          );
          knurl.position.set(
            neckOffsetX + Math.cos(kAng) * (neckR * 1.30),
            holderBaseY + holderH * 0.14,
            Math.sin(kAng) * (neckR * 1.30)
          );
          group.add(knurl);
        }

        // 4. Dây bấc vải cotton bện (phần ngâm trong bầu cồn + phần đầu bấc nhô lên trên vòi đốt)
        var cottonWickMat = new THREE.MeshStandardMaterial({
          color: 0xF1F5F9,
          roughness: 0.92,
          metalness: 0.02
        });
        var charredTipMat = new THREE.MeshStandardMaterial({
          color: 0x1E293B,
          roughness: 0.95,
          metalness: 0.05
        });

        var innerWickCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(bulbOffsetX - bulbMaxR * 0.28, bulbBaseY + wallT * 3.2, 0.004),
          new THREE.Vector3(bulbOffsetX - bulbMaxR * 0.12, bulbBaseY + bulbH * 0.28, -0.003),
          new THREE.Vector3(neckOffsetX, bulbBaseY + bulbH * 0.62, 0),
          new THREE.Vector3(neckOffsetX, holderBaseY + holderH * 0.95, 0)
        ]);
        var innerWickGeo = new THREE.TubeGeometry(innerWickCurve, 32, neckR * 0.18, 12, false);
        var innerWickMesh = new THREE.Mesh(innerWickGeo, cottonWickMat);
        innerWickMesh.renderOrder = 6;
        group.add(innerWickMesh);

        // Đầu bấc vải nhô lên khỏi vòi đồng/inox ở chính giữa
        var wickTopY = holderBaseY + holderH;
        var exposedWickH = h * 0.075;
        var exposedWickMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(neckR * 0.19, neckR * 0.21, exposedWickH, 16),
          cottonWickMat
        );
        exposedWickMesh.position.set(neckOffsetX, wickTopY + exposedWickH * 0.45, 0);
        group.add(exposedWickMesh);

        var charredWickTop = new THREE.Mesh(
          new THREE.SphereGeometry(neckR * 0.20, 16, 12),
          charredTipMat
        );
        charredWickTop.scale.set(1, 1.3, 1);
        charredWickTop.position.set(neckOffsetX, wickTopY + exposedWickH * 0.88, 0);
        group.add(charredWickTop);

        // 5. Ngọn lửa đèn cồn 3D đa lớp (Outer Blue + Middle Orange + Inner Yellow Core)
        var flameGroup = new THREE.Group();
        flameGroup.name = 'alcohol_flame_group';
        flameGroup.position.set(neckOffsetX, wickTopY + exposedWickH * 0.75, 0);

        var flameBaseH = h * 0.28;
        var flameBaseR = neckR * 0.56;
        var flamePts = [
          new THREE.Vector2(0.0001, 0),
          new THREE.Vector2(flameBaseR * 0.85, flameBaseH * 0.18),
          new THREE.Vector2(flameBaseR * 1.00, flameBaseH * 0.36),
          new THREE.Vector2(flameBaseR * 0.68, flameBaseH * 0.64),
          new THREE.Vector2(flameBaseR * 0.28, flameBaseH * 0.86),
          new THREE.Vector2(0.0001, flameBaseH)
        ];
        var outerFlameGeo = new THREE.LatheGeometry(flamePts, 28);
        outerFlameGeo.computeVertexNormals();
        var outerFlameMat = new THREE.MeshPhysicalMaterial({
          color: 0x3B82F6,
          emissive: 0x2563EB,
          emissiveIntensity: 0.9,
          transparent: true,
          opacity: 0.46,
          roughness: 0.1,
          depthWrite: false
        });
        var outerFlameMesh = new THREE.Mesh(outerFlameGeo, outerFlameMat);
        outerFlameMesh.renderOrder = 14;
        flameGroup.add(outerFlameMesh);

        var midFlameMat = new THREE.MeshPhysicalMaterial({
          color: 0xF97316,
          emissive: 0xEA580C,
          emissiveIntensity: 1.35,
          transparent: true,
          opacity: 0.84,
          roughness: 0.1,
          depthWrite: false
        });
        var midFlameMesh = new THREE.Mesh(outerFlameGeo, midFlameMat);
        midFlameMesh.scale.set(0.72, 0.82, 0.72);
        midFlameMesh.position.y = flameBaseH * 0.05;
        midFlameMesh.renderOrder = 15;
        flameGroup.add(midFlameMesh);

        var coreFlameMat = new THREE.MeshBasicMaterial({
          color: 0xFEF08A,
          transparent: true,
          opacity: 0.95
        });
        var coreFlameMesh = new THREE.Mesh(outerFlameGeo, coreFlameMat);
        coreFlameMesh.scale.set(0.40, 0.52, 0.40);
        coreFlameMesh.position.y = flameBaseH * 0.06;
        coreFlameMesh.renderOrder = 16;
        flameGroup.add(coreFlameMesh);

        // Vòng sóng bức xạ nhiệt đối lưu (Thermal Heat Convection Rings) tỏa lên phía trên ngọn lửa để đun nóng ống nghiệm / bình cầu
        var heatWaveGroup = new THREE.Group();
        heatWaveGroup.name = 'thermal_heat_waves';
        for (var hwi = 0; hwi < 3; hwi++) {
          var waveR = flameBaseR * (1.15 + hwi * 0.42);
          var waveGeo = new THREE.TorusGeometry(waveR, 0.0012, 12, 36);
          waveGeo.rotateX(Math.PI / 2);
          var waveMat = new THREE.MeshBasicMaterial({
            color: hwi === 0 ? 0xFB923C : 0xFDBA74,
            transparent: true,
            opacity: Math.max(0.14, 0.42 - hwi * 0.11),
            depthWrite: false
          });
          var waveRing = new THREE.Mesh(waveGeo, waveMat);
          waveRing.position.y = flameBaseH * (0.98 + hwi * 0.28);
          waveRing.renderOrder = 17;
          heatWaveGroup.add(waveRing);
        }
        flameGroup.add(heatWaveGroup);

        group.add(flameGroup);

        // 5B. Ống nghiệm thủy tinh đặt nghiêng phía trên ngọn lửa (khi mô tả hoạt động có "ống nghiệm" / "đun nóng" hoặc khi bật chế độ đun thử)
        var opLower = ((CFG.operationPrompt || '') + ' ' + (CFG.appearancePrompt || '')).toLowerCase();
        var showHeatedTubeByDefault =
          opLower.indexOf('ống nghiệm') !== -1 ||
          opLower.indexOf('ong nghiem') !== -1 ||
          opLower.indexOf('làm nóng') !== -1 ||
          opLower.indexOf('đun') !== -1;

        var heatedTubeGroup = new THREE.Group();
        heatedTubeGroup.name = 'heated_test_tube_group';
        heatedTubeGroup.visible = showHeatedTubeByDefault;
        var flameTopY = wickTopY + exposedWickH * 0.75 + flameBaseH * 0.92;
        heatedTubeGroup.position.set(neckOffsetX + bulbMaxR * 0.18, flameTopY + h * 0.18, 0);
        heatedTubeGroup.rotation.z = -Math.PI * 0.18; // Nghiêng chuẩn quy tắc đun ống nghiệm KHTN

        var hTubeR = Math.max(0.011, neckR * 0.48);
        var hTubeLen = Math.max(0.085, h * 0.62);
        var hTubeGeo = createLatheGlassVesselGeometry(
          THREE,
          hTubeR,
          hTubeR,
          hTubeLen,
          hTubeR * 0.09,
          hTubeR * 0.15
        );
        var hTubeMesh = new THREE.Mesh(hTubeGeo, boroGlassMat);
        hTubeMesh.position.y = -hTubeLen * 0.32;
        hTubeMesh.renderOrder = 18;
        heatedTubeGroup.add(hTubeMesh);

        var hLiqH = hTubeLen * 0.46;
        var hLiqMat = new THREE.MeshPhysicalMaterial({
          color: 0x0EA5E9,
          emissive: 0x0284C7,
          emissiveIntensity: 0.2,
          transparent: true,
          opacity: 0.78,
          roughness: 0.08
        });
        var hLiqMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(hTubeR * 0.80, hTubeR * 0.78, hLiqH, 24),
          hLiqMat
        );
        hLiqMesh.name = 'heated_tube_liquid';
        hLiqMesh.position.y = -hTubeLen * 0.30 + hLiqH * 0.5;
        heatedTubeGroup.add(hLiqMesh);

        // Các bọt khí sôi lăn tăn bên trong ống nghiệm khi ngọn lửa đèn cồn đang cháy
        var bubblesGroup = new THREE.Group();
        bubblesGroup.name = 'boiling_bubbles_group';
        var bubbleMat = new THREE.MeshBasicMaterial({
          color: 0xE0F2FE,
          transparent: true,
          opacity: 0.88
        });
        for (var bbi = 0; bbi < 6; bbi++) {
          var bMesh = new THREE.Mesh(
            new THREE.SphereGeometry(hTubeR * (0.12 + (bbi % 3) * 0.04), 10, 10),
            bubbleMat
          );
          var bAngle = (bbi / 6) * Math.PI * 2;
          bMesh.position.set(
            Math.cos(bAngle) * hTubeR * 0.35,
            -hTubeLen * 0.24 + (bbi / 6) * hLiqH * 0.85,
            Math.sin(bAngle) * hTubeR * 0.35
          );
          bubblesGroup.add(bMesh);
        }
        heatedTubeGroup.add(bubblesGroup);

        // Kẹp gỗ / kim loại giữ cổ ống nghiệm phía trên
        var clampBar = new THREE.Mesh(
          createBeveledBlockGeometry(THREE, hTubeR * 5.2, hTubeR * 0.85, hTubeR * 1.4, 0.002, 0.001),
          brassMat
        );
        clampBar.position.set(hTubeR * 1.9, hTubeLen * 0.42, 0);
        heatedTubeGroup.add(clampBar);

        group.add(heatedTubeGroup);

        // 6. Nắp chụp dập lửa bằng đồng / inox có núm cầm trên đỉnh (Snuffer Cap — Khối 4 trên phác thảo 2D)
        var capGroup = new THREE.Group();
        capGroup.name = 'alcohol_snuffer_cap';
        var capH = Math.max(0.018, h * pCap.scale[1]);
        var capR = Math.max(neckR * 1.05, w * pCap.scale[0] * 0.45);
        var capOffsetX = w * pCap.pos[0];
        var capPts = [
          new THREE.Vector2(capR * 0.92, 0),
          new THREE.Vector2(capR * 1.06, 0),
          new THREE.Vector2(capR * 1.02, capH * 0.12),
          new THREE.Vector2(capR * 0.88, capH * 0.68),
          new THREE.Vector2(capR * 0.52, capH * 0.84),
          new THREE.Vector2(capR * 0.26, capH * 0.88),
          new THREE.Vector2(capR * 0.42, capH * 0.94),
          new THREE.Vector2(capR * 0.38, capH * 1.00),
          new THREE.Vector2(0.0001, capH * 1.00)
        ];
        var capLatheGeo = new THREE.LatheGeometry(capPts, 36);
        capLatheGeo.computeVertexNormals();
        var capMesh = new THREE.Mesh(capLatheGeo, burnerMetalMat);
        capMesh.castShadow = true;
        capMesh.receiveShadow = true;
        capGroup.add(capMesh);

        capGroup.userData.cappedPos = [neckOffsetX + capOffsetX, holderBaseY + holderH * 0.22, 0];
        capGroup.userData.openPos = [neckOffsetX + capOffsetX + bulbMaxR * 0.88, holderBaseY + holderH * 0.45, 0];
        capGroup.userData.openRotZ = -Math.PI * 0.22;
        capGroup.position.set(neckOffsetX + capOffsetX + bulbMaxR * 0.88, holderBaseY + holderH * 0.45, 0);
        capGroup.rotation.z = -Math.PI * 0.22;
        group.add(capGroup);

        // 7. Bảng mặt trước / Cụm điều khiển hiển thị nhiệt độ ngọn lửa (Khối 5 trên phác thảo 2D)
        var lcdCanvas = document.createElement('canvas');
        lcdCanvas.width = 512;
        lcdCanvas.height = 160;
        drawDigitalReadoutCanvas(lcdCanvas, 'ĐÈN CỒN THÍ NGHIỆM', CFG.controlDefault, '°C');
        var lcdTex = new THREE.CanvasTexture(lcdCanvas);
        if (THREE.SRGBColorSpace) lcdTex.colorSpace = THREE.SRGBColorSpace;
        var panelW = Math.max(0.032, w * pPanel.scale[0]);
        var panelH = Math.max(0.018, h * pPanel.scale[1] * 0.85);
        var lcdPlane = new THREE.Mesh(
          new THREE.PlaneGeometry(panelW, panelH),
          new THREE.MeshBasicMaterial({ map: lcdTex })
        );
        lcdPlane.name = 'digital_readout_mesh';
        lcdPlane.userData.canvas = lcdCanvas;
        lcdPlane.userData.texture = lcdTex;
        lcdPlane.userData.title = 'ĐÈN CỒN THÍ NGHIỆM';
        lcdPlane.position.set(
          w * pPanel.pos[0],
          Math.max(0.016, h * pPanel.pos[1]),
          bulbMaxR * 1.02
        );
        group.add(lcdPlane);
      }

      // =======================================================================
      // 0B. BÌNH TAM GIÁC ERLENMEYER / BÌNH CẦU ĐÁY BẦU CỔ THẮT (CONICAL / ROUND FLASK)
      // =======================================================================
      else if (CFG.shapeFamily === 'conical-flask') {
        var fBase = getPartSpec(0, [0.78, 0.08, 0.78], [0, 0.04, 0]);
        var fBulb = getPartSpec(1, [0.92, 0.52, 0.92], [0, 0.34, 0]);
        var fNeck = getPartSpec(2, [0.34, 0.24, 0.34], [0, 0.72, 0]);
        var fPanel = getPartSpec(4, [0.56, 0.14, 0.10], [0, 0.14, 0.46]);

        var flaskMaxR = Math.max(0.026, Math.min(w, d) * (fBulb.scale[0] * 0.5));
        var flaskNeckR = Math.max(0.010, Math.min(flaskMaxR * 0.75, w * fNeck.scale[0] * 0.5));
        var flaskWall = Math.max(0.002, flaskMaxR * 0.055);
        var flaskPts = [
          new THREE.Vector2(0.0001, 0),
          new THREE.Vector2(flaskMaxR * (fBase.scale[0] / Math.max(0.2, fBulb.scale[0])) * 0.85, 0),
          new THREE.Vector2(flaskMaxR * 1.00, h * 0.14),
          new THREE.Vector2(flaskMaxR * 0.72, h * (fBulb.scale[1] * 0.92)),
          new THREE.Vector2(flaskNeckR * 1.05, h * (fBulb.scale[1] + fNeck.scale[1] * 0.65)),
          new THREE.Vector2(flaskNeckR * 1.05, h * 0.95),
          new THREE.Vector2(flaskNeckR * 1.22, h * 1.00),
          new THREE.Vector2(flaskNeckR * 0.88, h * 1.00),
          new THREE.Vector2(flaskNeckR * 0.88, h * (fBulb.scale[1] + fNeck.scale[1] * 0.62)),
          new THREE.Vector2(flaskMaxR * 0.92, h * 0.14),
          new THREE.Vector2(flaskMaxR * 0.72, flaskWall * 1.6),
          new THREE.Vector2(0.0001, flaskWall * 1.5)
        ];
        var flaskGeo = new THREE.LatheGeometry(flaskPts, 44);
        flaskGeo.computeVertexNormals();
        var flaskMesh = new THREE.Mesh(flaskGeo, boroGlassMat);
        flaskMesh.position.x = w * fBulb.pos[0];
        flaskMesh.renderOrder = 8;
        group.add(flaskMesh);

        var maxLiqH = h * Math.max(0.25, fBulb.scale[1] * 1.15);
        var liqMat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(fBulb.colorHex || secondaryHexStr),
          transparent: true,
          opacity: 0.76,
          roughness: 0.08,
          ior: 1.33
        });
        var liqGeo = new THREE.CylinderGeometry(flaskNeckR * 0.92, flaskMaxR * 0.88, maxLiqH, 36);
        var liqMesh = new THREE.Mesh(liqGeo, liqMat);
        liqMesh.name = 'liquid_column';
        liqMesh.userData.baseY = flaskWall * 1.8;
        liqMesh.userData.maxH = maxLiqH;
        liqMesh.position.set(w * fBulb.pos[0], flaskWall * 1.8 + maxLiqH * 0.25, 0);
        liqMesh.scale.y = 0.5;
        group.add(liqMesh);

        var lcdCanvas = document.createElement('canvas');
        lcdCanvas.width = 512;
        lcdCanvas.height = 160;
        drawDigitalReadoutCanvas(lcdCanvas, 'DUNG TÍCH BÌNH', CFG.controlDefault, 'ml');
        var lcdTex = new THREE.CanvasTexture(lcdCanvas);
        if (THREE.SRGBColorSpace) lcdTex.colorSpace = THREE.SRGBColorSpace;
        var lcdPlane = new THREE.Mesh(
          new THREE.PlaneGeometry(Math.max(0.032, w * fPanel.scale[0]), Math.max(0.018, h * fPanel.scale[1] * 0.85)),
          new THREE.MeshBasicMaterial({ map: lcdTex })
        );
        lcdPlane.name = 'digital_readout_mesh';
        lcdPlane.userData.canvas = lcdCanvas;
        lcdPlane.userData.texture = lcdTex;
        lcdPlane.userData.title = 'DUNG TÍCH BÌNH';
        lcdPlane.position.set(w * fPanel.pos[0], Math.max(0.016, h * fPanel.pos[1]), flaskMaxR * 1.02);
        group.add(lcdPlane);
      }

      // =======================================================================
      // 1. AMPE KẾ / VÔN KẾ / ĐIỆN KẾ KIM CHỈ PHÒNG THÍ NGHIỆM (ANALOG METER)
      //    Phân tầng đa bộ phận: Chân đế cao su -> Thềm chốt cắm bo góc -> Thân vỏ ABS bo góc ->
      //    Hốc mặt đồng hồ lõm sâu (Recessed Cavity) -> Mặt chia độ + Gương chống thị sai ->
      //    Kim chỉ 3D có đối trọng + Vít chỉnh 0 -> Mặt kính bảo vệ uốn cong (Curved Gauge Glass) ->
      //    Các chốt cắm điện cực đa chi tiết (- COM, + Thang 1, + Thang 2)
      // =======================================================================
      else if (CFG.shapeFamily === 'analog-ammeter-voltmeter') {
        var footH = Math.max(0.005, h * 0.035);
        var footR = Math.min(w, d) * 0.065;
        var footGeo = new THREE.CylinderGeometry(footR * 0.9, footR, footH, 20);
        var footPositions = [
          [-w * 0.38, footH / 2, -d * 0.36],
          [w * 0.38, footH / 2, -d * 0.36],
          [-w * 0.38, footH / 2, d * 0.36],
          [w * 0.38, footH / 2, d * 0.36]
        ];
        for (var fi = 0; fi < footPositions.length; fi++) {
          var footMesh = new THREE.Mesh(footGeo, rubberFootMat);
          footMesh.position.set(footPositions[fi][0], footPositions[fi][1], footPositions[fi][2]);
          footMesh.castShadow = true;
          footMesh.receiveShadow = true;
          group.add(footMesh);
        }

        // Tầng 1: Đế thềm máy phía dưới được bo tròn mọi góc cạnh (Beveled Base Deck)
        var deckH = h * 0.25;
        var deckD = d;
        var cornerRad = Math.min(w, d) * 0.08;
        var bevelThick = Math.min(w, h, d) * 0.025;
        var deckGeo = createBeveledBlockGeometry(THREE, w, deckH, deckD, cornerRad, bevelThick);
        var deckMesh = new THREE.Mesh(deckGeo, housingMat);
        deckMesh.position.set(0, footH + deckH / 2, 0);
        deckMesh.castShadow = true;
        deckMesh.receiveShadow = true;
        group.add(deckMesh);

        // Tầng 2: Thân vỏ chính phía trên được bo góc mềm mại + Khe tản nhiệt 2 bên hông
        var upperH = h - deckH - footH;
        var upperW = w * 0.96;
        var upperD = d * 0.62;
        var upperZ = -d * 0.17;
        var upperCenterY = footH + deckH + upperH / 2 - 0.003;

        var upperRearD = upperD * 0.82;
        var upperBodyGeo = createBeveledBlockGeometry(
          THREE,
          upperW,
          upperH,
          upperRearD,
          cornerRad * 0.95,
          bevelThick
        );
        var upperBodyMesh = new THREE.Mesh(upperBodyGeo, housingMat);
        upperBodyMesh.position.set(0, upperCenterY, upperZ - upperD * 0.09);
        upperBodyMesh.castShadow = true;
        upperBodyMesh.receiveShadow = true;
        group.add(upperBodyMesh);

        // Hộp bảo vệ cuộn dây từ điện nhô nhẹ phía sau lưng máy + Khe tản nhiệt hai bên
        var rearCoverGeo = createBeveledBlockGeometry(
          THREE,
          upperW * 0.62,
          upperH * 0.58,
          upperD * 0.18,
          cornerRad * 0.6,
          bevelThick * 0.6
        );
        var rearCoverMesh = new THREE.Mesh(rearCoverGeo, darkTrimMat);
        rearCoverMesh.position.set(0, upperCenterY - upperH * 0.05, upperZ - upperD * 0.52);
        rearCoverMesh.castShadow = true;
        group.add(rearCoverMesh);

        for (var vi = 0; vi < 4; vi++) {
          var ventY = upperCenterY + (vi - 1.5) * (upperH * 0.11);
          var ventGeo = createBeveledBlockGeometry(THREE, 0.004, upperH * 0.035, upperRearD * 0.46, 0.001, 0.0008);
          var leftVent = new THREE.Mesh(ventGeo, darkTrimMat);
          leftVent.position.set(-upperW / 2 - 0.0005, ventY, upperZ - upperD * 0.09);
          group.add(leftVent);
          var rightVent = new THREE.Mesh(ventGeo, darkTrimMat);
          rightVent.position.set(upperW / 2 + 0.0005, ventY, upperZ - upperD * 0.09);
          group.add(rightVent);
        }

        // Tầng 3: Khung Bezel có HỐC LÕM THẬT (Recessed Dial Cavity)
        // Mặt đồng hồ nằm sâu bên trong hốc lõm một khoảng cavityDepth thay vì dán phẳng ngoài vỏ!
        var bezelOuterW = upperW * 0.92;
        var bezelOuterH = upperH * 0.88;
        var windowInnerW = bezelOuterW * 0.86;
        var windowInnerH = bezelOuterH * 0.84;
        var cavityDepth = Math.max(0.011, d * 0.11);
        var faceCenterY = upperCenterY + upperH * 0.02;
        var cavityFrontZ = upperZ + upperRearD / 2 + cavityDepth * 0.5;
        var cavityBackZ = cavityFrontZ - cavityDepth * 0.42;

        // Thành vách bên trong hốc đồng hồ tạo chiều sâu và đón bóng đổ
        var cavityBackPlate = new THREE.Mesh(
          new THREE.PlaneGeometry(windowInnerW * 1.04, windowInnerH * 1.04),
          recessedInteriorMat
        );
        cavityBackPlate.position.set(0, faceCenterY, cavityBackZ - 0.001);
        cavityBackPlate.receiveShadow = true;
        group.add(cavityBackPlate);

        // Khung viền Bezel 3D bo góc có lỗ khoét ở giữa (Recessed Frame)
        var recessedBezelGeo = createRecessedFrameGeometry(
          THREE,
          bezelOuterW,
          bezelOuterH,
          windowInnerW,
          windowInnerH,
          cavityDepth,
          cornerRad * 0.8,
          bevelThick * 0.75
        );
        var recessedBezelMesh = new THREE.Mesh(recessedBezelGeo, darkTrimMat);
        recessedBezelMesh.position.set(0, faceCenterY, cavityFrontZ - cavityDepth * 0.25);
        recessedBezelMesh.castShadow = true;
        recessedBezelMesh.receiveShadow = true;
        group.add(recessedBezelMesh);

        // Tầng 4: Mặt đồng hồ chia độ (Nằm LÕM SÂU bên trong hốc tại z = cavityBackZ)
        var dialCanvas = document.createElement('canvas');
        dialCanvas.width = 768;
        dialCanvas.height = 512;
        drawAnalogMeterFaceCanvas(dialCanvas, CFG.controlDefault);
        var dialTex = new THREE.CanvasTexture(dialCanvas);
        if (THREE.SRGBColorSpace) dialTex.colorSpace = THREE.SRGBColorSpace;
        dialTex.anisotropy = 16;
        dialTex.needsUpdate = true;

        var dialW = windowInnerW * 0.98;
        var dialH = windowInnerH * 0.98;
        var dialMat = new THREE.MeshStandardMaterial({
          map: dialTex,
          roughness: 0.32,
          metalness: 0.04
        });
        var dialMesh = new THREE.Mesh(new THREE.PlaneGeometry(dialW, dialH), dialMat);
        dialMesh.name = 'analog_dial_face';
        dialMesh.userData.canvas = dialCanvas;
        dialMesh.userData.texture = dialTex;
        dialMesh.position.set(0, faceCenterY, cavityBackZ + 0.001);
        dialMesh.receiveShadow = true;
        group.add(dialMesh);

        // Tầng 5: Cụm Kim chỉ thị 3D đa chi tiết (Needle Pivot) nằm trong hốc đồng hồ (giữa mặt số và mặt kính cong)
        var needlePivot = new THREE.Group();
        needlePivot.name = 'needle_pivot';
        var pivotY = faceCenterY - dialH * 0.34;
        var needleZ = cavityBackZ + cavityDepth * 0.28;
        needlePivot.position.set(0, pivotY, needleZ);

        var needleLen = dialH * 0.68;
        var needleMat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(accentHexStr),
          metalness: 0.28,
          roughness: 0.25,
          clearcoat: 0.5
        });
        // Thân kim vát nhọn kiểu kim đồng hồ đo chính xác
        var needleBladeGeo = new THREE.ConeGeometry(dialW * 0.014, needleLen * 0.72, 6);
        needleBladeGeo.scale(1, 1, 0.32);
        needleBladeGeo.translate(0, needleLen * 0.36, 0);
        var needleBlade = new THREE.Mesh(needleBladeGeo, needleMat);
        needleBlade.castShadow = true;
        needlePivot.add(needleBlade);

        // Đầu kim hình mũi giáo mảnh (Spade pointer tip) giúp đọc vạch chia chính xác
        var spadeTipGeo = new THREE.ConeGeometry(dialW * 0.024, needleLen * 0.28, 4);
        spadeTipGeo.scale(1, 1, 0.25);
        spadeTipGeo.translate(0, needleLen * 0.82, 0);
        var spadeTip = new THREE.Mesh(spadeTipGeo, needleMat);
        spadeTip.castShadow = true;
        needlePivot.add(spadeTip);

        // Đuôi đối trọng kim đồng hồ (Counterweight tail)
        var tailGeo = new THREE.CylinderGeometry(dialW * 0.012, dialW * 0.022, needleLen * 0.16, 12);
        tailGeo.translate(0, -needleLen * 0.08, 0);
        var tailMesh = new THREE.Mesh(tailGeo, darkTrimMat);
        needlePivot.add(tailMesh);

        // Ổ trục đồng & nắp chụp tâm kim
        var hubCapGeo = new THREE.CylinderGeometry(dialW * 0.042, dialW * 0.048, 0.005, 24);
        hubCapGeo.rotateX(Math.PI / 2);
        var hubCapMesh = new THREE.Mesh(hubCapGeo, darkTrimMat);
        hubCapMesh.castShadow = true;
        needlePivot.add(hubCapMesh);

        var jewelGeo = new THREE.CylinderGeometry(dialW * 0.016, dialW * 0.016, 0.0065, 16);
        jewelGeo.rotateX(Math.PI / 2);
        var jewelMesh = new THREE.Mesh(jewelGeo, brassMat);
        needlePivot.add(jewelMesh);

        group.add(needlePivot);

        // Vít chỉnh số 0 (Zero-adjust slotted screw) nằm nổi trên viền dưới mặt đồng hồ
        var zeroScrewGroup = new THREE.Group();
        zeroScrewGroup.name = 'zero_adjust_screw';
        zeroScrewGroup.position.set(0, faceCenterY - bezelOuterH * 0.44, cavityFrontZ + 0.002);
        var screwBody = new THREE.Mesh(
          new THREE.CylinderGeometry(dialW * 0.032, dialW * 0.036, 0.006, 20),
          brushedMetalMat
        );
        screwBody.rotation.x = Math.PI / 2;
        zeroScrewGroup.add(screwBody);
        var screwSlot = new THREE.Mesh(
          new THREE.BoxGeometry(dialW * 0.052, 0.0018, 0.003),
          darkTrimMat
        );
        screwSlot.position.z = 0.003;
        zeroScrewGroup.add(screwSlot);
        group.add(zeroScrewGroup);

        // Tầng 6: MẶT KÍNH BẢO VỆ UỐN CONG (Curved Convex Gauge Glass)
        // Kính được uốn cong vòm nhẹ, trong suốt có khúc xạ ánh sáng bao phủ phía trước hốc đồng hồ
        var sagitta = Math.max(0.0045, Math.min(windowInnerW, windowInnerH) * 0.09);
        var curvedGlassGeo = createCurvedGaugeGlassGeometry(
          THREE,
          windowInnerW * 1.01,
          windowInnerH * 1.01,
          sagitta
        );
        var glassCoverMesh = new THREE.Mesh(curvedGlassGeo, curvedGaugeGlassMat);
        glassCoverMesh.name = 'curved_gauge_glass';
        glassCoverMesh.position.set(0, faceCenterY, cavityFrontZ - 0.001);
        glassCoverMesh.renderOrder = 10;
        group.add(glassCoverMesh);

        // Tầng 7: Hệ thống chốt cắm điện cực đa chi tiết trên thềm máy phía trước
        var postY = footH + deckH - 0.001;
        var postZ = d * 0.27;
        var postR = Math.min(w, d) * 0.064;
        var postH = h * 0.145;
        var termCount = Number(CFG.terminalCount) || 3;

        if (termCount === 2) {
          var blackPost2 = createBindingPost(THREE, '#0F172A', postR, postH, '-');
          blackPost2.position.set(-w * 0.24, postY, postZ);
          group.add(blackPost2);

          var redPostSingle = createBindingPost(THREE, accentHexStr, postR, postH, '+');
          redPostSingle.position.set(w * 0.24, postY, postZ);
          group.add(redPostSingle);
        } else {
          var blackPost = createBindingPost(THREE, '#0F172A', postR, postH, '-');
          blackPost.position.set(-w * 0.30, postY, postZ);
          group.add(blackPost);

          var redPost1 = createBindingPost(THREE, accentHexStr, postR, postH, '+');
          redPost1.position.set(0.0, postY, postZ);
          group.add(redPost1);

          var redPost2 = createBindingPost(THREE, accentHexStr, postR, postH, '+');
          redPost2.position.set(w * 0.30, postY, postZ);
          group.add(redPost2);
        }

        // Bảng tên khắc nhãn cực (- COM, + Thang đo 1, + Thang đo 2) có gờ viền bo góc ở mặt trước thềm máy
        var termFrameGeo = createBeveledBlockGeometry(
          THREE,
          w * 0.88,
          deckH * 0.62,
          0.004,
          0.004,
          0.001
        );
        var termFrameMesh = new THREE.Mesh(termFrameGeo, darkTrimMat);
        termFrameMesh.position.set(0, footH + deckH * 0.50, d / 2 - 0.001);
        group.add(termFrameMesh);

        var termCanvas = document.createElement('canvas');
        termCanvas.width = 512;
        termCanvas.height = 96;
        var tCtx = termCanvas.getContext('2d');
        if (tCtx) {
          tCtx.fillStyle = '#0F172A';
          tCtx.fillRect(0, 0, 512, 96);
          tCtx.strokeStyle = '#475569';
          tCtx.lineWidth = 3;
          tCtx.strokeRect(4, 4, 504, 88);
          tCtx.font = '900 32px sans-serif';
          tCtx.textAlign = 'center';
          tCtx.fillStyle = '#F8FAFC';
          tCtx.fillText('− (COM)', 100, 58);
          tCtx.fillStyle = '#FCA5A5';
          tCtx.fillText('+ ' + formatVal((CFG.controlMax || 3) * 0.2) + (CFG.controlUnit || 'A'), 256, 58);
          tCtx.fillStyle = '#EF4444';
          tCtx.fillText('+ ' + formatVal(CFG.controlMax || 3) + (CFG.controlUnit || 'A'), 412, 58);
        }
        var termTex = new THREE.CanvasTexture(termCanvas);
        if (THREE.SRGBColorSpace) termTex.colorSpace = THREE.SRGBColorSpace;
        var termPlate = new THREE.Mesh(
          new THREE.PlaneGeometry(w * 0.84, deckH * 0.52),
          new THREE.MeshBasicMaterial({ map: termTex })
        );
        termPlate.position.set(0, footH + deckH * 0.50, d / 2 + 0.0015);
        group.add(termPlate);
      }

      // =======================================================================
      // 2. BIẾN TRỞ CON CHẠY (SLIDING RHEOSTAT) — CẤU TRÚC ĐA TẦNG BO GÓC
      // =======================================================================
      else if (CFG.shapeFamily === 'rheostat') {
        var coilLen = w * 0.78;
        var coilR = Math.min(h * 0.24, d * 0.32);
        var centerY = h * 0.44;

        // 2 chân giá đỡ kim loại đúc bo góc ở 2 đầu kèm chân cao su chống trượt
        var legW = w * 0.085;
        var legGeo = createBeveledBlockGeometry(THREE, legW, h * 0.82, d * 0.78, 0.006, 0.0025);
        var leftLeg = new THREE.Mesh(legGeo, darkTrimMat);
        leftLeg.position.set(-coilLen / 2 - legW / 2, h * 0.41, 0);
        leftLeg.castShadow = true;
        leftLeg.receiveShadow = true;
        group.add(leftLeg);

        var rightLeg = new THREE.Mesh(legGeo, darkTrimMat);
        rightLeg.position.set(coilLen / 2 + legW / 2, h * 0.41, 0);
        rightLeg.castShadow = true;
        rightLeg.receiveShadow = true;
        group.add(rightLeg);

        // Ống sứ cách điện bên trong
        var ceramicGeo = new THREE.CylinderGeometry(coilR * 0.95, coilR * 0.95, coilLen, 36);
        ceramicGeo.rotateZ(Math.PI / 2);
        var ceramicMesh = new THREE.Mesh(
          ceramicGeo,
          new THREE.MeshPhysicalMaterial({ color: 0xF1F5F9, roughness: 0.32, clearcoat: 0.2 })
        );
        ceramicMesh.position.set(0, centerY, 0);
        ceramicMesh.castShadow = true;
        group.add(ceramicMesh);

        // Cuộn dây hợp kim Nikelin/Constantan quấn sít nhau quanh ống sứ
        var wireCanvas = document.createElement('canvas');
        wireCanvas.width = 512;
        wireCanvas.height = 128;
        var wCtx = wireCanvas.getContext('2d');
        if (wCtx) {
          for (var wi = 0; wi < 64; wi++) {
            wCtx.fillStyle = (wi % 2 === 0) ? '#78350F' : '#B45309';
            wCtx.fillRect(wi * 8, 0, 8, 128);
          }
        }
        var wireTex = new THREE.CanvasTexture(wireCanvas);
        if (THREE.SRGBColorSpace) wireTex.colorSpace = THREE.SRGBColorSpace;
        var coilGeo = new THREE.CylinderGeometry(coilR, coilR, coilLen * 0.96, 44);
        coilGeo.rotateZ(Math.PI / 2);
        var coilMesh = new THREE.Mesh(
          coilGeo,
          new THREE.MeshPhysicalMaterial({
            map: wireTex,
            metalness: 0.76,
            roughness: 0.26,
            clearcoat: 0.25
          })
        );
        coilMesh.position.set(0, centerY, 0);
        coilMesh.castShadow = true;
        coilMesh.receiveShadow = true;
        group.add(coilMesh);

        // Thanh dẫn hướng kim loại mạ crom phía trên
        var barY = h * 0.78;
        var barGeo = new THREE.CylinderGeometry(coilR * 0.16, coilR * 0.16, coilLen + legW * 1.5, 24);
        barGeo.rotateZ(Math.PI / 2);
        var barMesh = new THREE.Mesh(barGeo, brushedMetalMat);
        barMesh.position.set(0, barY, 0);
        barMesh.castShadow = true;
        group.add(barMesh);

        // Cụm con chạy biến trở (Rheostat Slider) đa chi tiết: Lá đồng tiếp xúc + Khối trượt bo góc + Tay nắm cách điện tiện Lathe
        var sliderGroup = new THREE.Group();
        sliderGroup.name = 'rheostat_slider';
        sliderGroup.userData.travelWidth = coilLen * 0.86;
        sliderGroup.position.set(0, barY, 0);

        var wiperBlockGeo = createBeveledBlockGeometry(
          THREE,
          w * 0.11,
          (barY - centerY) * 0.88,
          coilR * 2.18,
          0.004,
          0.0018
        );
        var wiperMesh = new THREE.Mesh(wiperBlockGeo, brassMat);
        wiperMesh.position.y = -(barY - centerY) * 0.42;
        wiperMesh.castShadow = true;
        sliderGroup.add(wiperMesh);

        // Tay nắm nhựa cách điện tiện rãnh cầm nắm bằng LatheGeometry
        var handleH = h * 0.19;
        var hRadius = w * 0.068;
        var handlePts = [
          new THREE.Vector2(hRadius * 0.55, 0),
          new THREE.Vector2(hRadius * 1.05, handleH * 0.12),
          new THREE.Vector2(hRadius * 0.84, handleH * 0.48),
          new THREE.Vector2(hRadius * 1.12, handleH * 0.82),
          new THREE.Vector2(hRadius * 0.85, handleH * 0.96),
          new THREE.Vector2(0.001, handleH)
        ];
        var handleMesh = new THREE.Mesh(new THREE.LatheGeometry(handlePts, 28), darkTrimMat);
        handleMesh.position.y = 0.008;
        handleMesh.castShadow = true;
        sliderGroup.add(handleMesh);

        var pointerRing = new THREE.Mesh(
          new THREE.TorusGeometry(hRadius * 0.95, 0.0025, 12, 24),
          new THREE.MeshStandardMaterial({ color: 0xDC2626, roughness: 0.3 })
        );
        pointerRing.rotation.x = Math.PI / 2;
        pointerRing.position.y = handleH * 0.22;
        sliderGroup.add(pointerRing);

        group.add(sliderGroup);

        // 3 Chốt cắm điện cực Đỏ (+) và Đen (-) đa chi tiết
        var p1 = createBindingPost(THREE, '#0F172A', 0.0085, 0.024, '-');
        p1.position.set(-coilLen / 2 - legW / 2, 0.012, d * 0.28);
        group.add(p1);

        var p2 = createBindingPost(THREE, '#DC2626', 0.0085, 0.024, '+');
        p2.position.set(coilLen / 2 + legW / 2, 0.012, d * 0.28);
        group.add(p2);

        var p3 = createBindingPost(THREE, '#DC2626', 0.0085, 0.024, '+');
        p3.position.set(coilLen / 2 + legW / 2, barY, 0);
        group.add(p3);

        // Khung bảng báo số điện trở R (Ω) bo góc kèm mặt kính cong nhẹ phía trước
        var lcdW = coilLen * 0.56;
        var lcdH = h * 0.22;
        var lcdFrame = new THREE.Mesh(
          createBeveledBlockGeometry(THREE, lcdW * 1.06, lcdH * 1.12, 0.008, 0.004, 0.0015),
          darkTrimMat
        );
        lcdFrame.position.set(0, h * 0.16, coilR + 0.006);
        group.add(lcdFrame);

        var lcdCanvas = document.createElement('canvas');
        lcdCanvas.width = 512;
        lcdCanvas.height = 160;
        drawDigitalReadoutCanvas(lcdCanvas, 'BIẾN TRỞ R', CFG.controlDefault, CFG.controlUnit || 'Ω');
        var lcdTex = new THREE.CanvasTexture(lcdCanvas);
        if (THREE.SRGBColorSpace) lcdTex.colorSpace = THREE.SRGBColorSpace;
        var lcdPlane = new THREE.Mesh(
          new THREE.PlaneGeometry(lcdW, lcdH),
          new THREE.MeshBasicMaterial({ map: lcdTex })
        );
        lcdPlane.name = 'digital_readout_mesh';
        lcdPlane.userData.canvas = lcdCanvas;
        lcdPlane.userData.texture = lcdTex;
        lcdPlane.userData.title = 'BIẾN TRỞ R';
        lcdPlane.position.set(0, h * 0.16, coilR + 0.011);
        group.add(lcdPlane);
      }

      // =======================================================================
      // 3. ỐNG NGHIỆM THỦY TINH BOROSILICATE & GIÁ ĐỠ BO GÓC (TEST TUBE & RACK)
      // =======================================================================
      else if (CFG.shapeFamily === 'test-tube') {
        var rackW = w;
        var rackD = d * 0.72;
        var rackBaseH = Math.max(0.014, h * 0.075);

        // Đế giá đỡ ống nghiệm bo tròn góc cạnh
        var rBase = new THREE.Mesh(
          createBeveledBlockGeometry(THREE, rackW, rackBaseH, rackD, 0.008, 0.0025),
          housingMat
        );
        rBase.position.y = rackBaseH / 2;
        rBase.castShadow = true;
        rBase.receiveShadow = true;
        group.add(rBase);

        // 2 trụ kim loại tiện bậc của giá đỡ
        var pillarH = h * 0.56;
        var pGeo = new THREE.CylinderGeometry(0.006, 0.007, pillarH, 24);
        var pLeft = new THREE.Mesh(pGeo, brushedMetalMat);
        pLeft.position.set(-rackW * 0.41, rackBaseH + pillarH / 2, 0);
        pLeft.castShadow = true;
        group.add(pLeft);
        var pRight = new THREE.Mesh(pGeo, brushedMetalMat);
        pRight.position.set(rackW * 0.41, rackBaseH + pillarH / 2, 0);
        pRight.castShadow = true;
        group.add(pRight);

        // Tấm giữ ống nghiệm phía trên có khoét lỗ tròn giữ thân ống
        var shelf = new THREE.Mesh(
          createRecessedFrameGeometry(
            THREE,
            rackW,
            rackD * 0.76,
            Math.min(w * 0.34, d * 0.46),
            Math.min(w * 0.34, d * 0.46),
            0.010,
            0.008,
            0.002
          ),
          housingMat
        );
        shelf.rotation.x = Math.PI / 2;
        shelf.position.y = rackBaseH + pillarH;
        shelf.castShadow = true;
        group.add(shelf);

        // Ống nghiệm thủy tinh Borosilicate thành dày có vành miệng loe bằng LatheGeometry
        var tubeR = Math.min(w * 0.16, d * 0.22);
        var tubeTotalH = h * 0.84;
        var tubeBottomY = rackBaseH + 0.004;
        var tubeLatheGeo = createLatheGlassVesselGeometry(
          THREE,
          tubeR * 0.92,
          tubeR,
          tubeTotalH,
          tubeR * 0.08,
          tubeR * 0.14
        );
        var tubeGlassMesh = new THREE.Mesh(tubeLatheGeo, boroGlassMat);
        tubeGlassMesh.position.set(0, tubeBottomY, 0);
        tubeGlassMesh.renderOrder = 8;
        group.add(tubeGlassMesh);

        // Cột dung dịch hóa học bên trong ống nghiệm
        var liqMat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(secondaryHexStr),
          transparent: true,
          opacity: 0.78,
          roughness: 0.08,
          ior: 1.33,
          clearcoat: 0.9
        });
        var maxLiqH = tubeTotalH * 0.78;
        var liqMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(tubeR * 0.82, tubeR * 0.80, maxLiqH, 28),
          liqMat
        );
        liqMesh.name = 'liquid_column';
        liqMesh.userData.baseY = tubeBottomY + tubeR * 0.12;
        liqMesh.userData.maxH = maxLiqH;
        liqMesh.position.set(0, tubeBottomY + tubeR * 0.12 + maxLiqH * 0.25, 0);
        liqMesh.scale.y = 0.5;
        group.add(liqMesh);

        // Thang chia độ trên thân ống nghiệm
        var scaleTex = createVerticalScaleTexture(THREE, 0, CFG.controlMax || 50, 'ml');
        var scaleMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(tubeR * 1.015, tubeR * 0.94, maxLiqH, 28, 1, true, -0.5, 1.0),
          new THREE.MeshBasicMaterial({ map: scaleTex, transparent: true, side: THREE.DoubleSide, depthWrite: false })
        );
        scaleMesh.position.set(0, tubeBottomY + tubeTotalH * 0.46, 0);
        scaleMesh.renderOrder = 9;
        group.add(scaleMesh);

        // Màn hình số báo thể tích V (ml) đặt ở đế giá đỡ
        var lcdCanvas = document.createElement('canvas');
        lcdCanvas.width = 512;
        lcdCanvas.height = 160;
        drawDigitalReadoutCanvas(lcdCanvas, 'THỂ TÍCH V', CFG.controlDefault, 'ml');
        var lcdTex = new THREE.CanvasTexture(lcdCanvas);
        if (THREE.SRGBColorSpace) lcdTex.colorSpace = THREE.SRGBColorSpace;
        var lcdPlane = new THREE.Mesh(
          new THREE.PlaneGeometry(rackW * 0.65, Math.max(0.024, rackBaseH * 1.3)),
          new THREE.MeshBasicMaterial({ map: lcdTex })
        );
        lcdPlane.name = 'digital_readout_mesh';
        lcdPlane.userData.canvas = lcdCanvas;
        lcdPlane.userData.texture = lcdTex;
        lcdPlane.userData.title = 'THỂ TÍCH V';
        lcdPlane.position.set(0, rackBaseH + 0.014, rackD / 2 + 0.002);
        group.add(lcdPlane);
      }

      // =======================================================================
      // 4. ỐNG ĐONG / CỐC CHIA ĐỘ THỦY TINH LATHE THÀNH DÀY (GRADUATED GLASSWARE)
      // =======================================================================
      else if (CFG.shapeFamily === 'graduated-glassware') {
        var radius = w * 0.38;
        var baseFootH = Math.max(0.016, h * 0.065);
        // Đế lục giác bo vát cạnh vững chãi
        var footGeo = new THREE.CylinderGeometry(radius * 1.18, radius * 1.28, baseFootH, 6);
        var footMesh = new THREE.Mesh(footGeo, housingMat);
        footMesh.position.y = baseFootH / 2;
        footMesh.castShadow = true;
        footMesh.receiveShadow = true;
        group.add(footMesh);

        var bodyH = Math.max(0.06, h - baseFootH);
        var vesselLatheGeo = createLatheGlassVesselGeometry(
          THREE,
          radius * 0.96,
          radius,
          bodyH,
          radius * 0.065,
          radius * 0.12
        );
        var vesselMesh = new THREE.Mesh(vesselLatheGeo, boroGlassMat);
        vesselMesh.position.y = baseFootH;
        vesselMesh.renderOrder = 8;
        group.add(vesselMesh);

        var liqMat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(secondaryHexStr),
          transparent: true,
          opacity: 0.76,
          roughness: 0.08,
          ior: 1.33,
          clearcoat: 0.9
        });
        var maxLiqH = bodyH * 0.82;
        var liqGeo = new THREE.CylinderGeometry(radius * 0.88, radius * 0.86, maxLiqH, 32);
        var liqMesh = new THREE.Mesh(liqGeo, liqMat);
        liqMesh.name = 'liquid_column';
        liqMesh.userData.baseY = baseFootH + radius * 0.08;
        liqMesh.userData.maxH = maxLiqH;
        liqMesh.position.y = baseFootH + radius * 0.08 + maxLiqH * 0.25;
        liqMesh.scale.y = 0.5;
        group.add(liqMesh);

        var scaleTex = createVerticalScaleTexture(THREE, 0, CFG.capacityMl || CFG.controlMax || 250, 'ml');
        var scaleGeo = new THREE.CylinderGeometry(radius * 1.012, radius * 0.975, maxLiqH, 28, 1, true, -0.55, 1.1);
        var scaleMesh = new THREE.Mesh(
          scaleGeo,
          new THREE.MeshBasicMaterial({ map: scaleTex, transparent: true, side: THREE.DoubleSide, depthWrite: false })
        );
        scaleMesh.position.y = baseFootH + bodyH * 0.48;
        scaleMesh.renderOrder = 9;
        group.add(scaleMesh);

        var lcdCanvas = document.createElement('canvas');
        lcdCanvas.width = 512;
        lcdCanvas.height = 160;
        drawDigitalReadoutCanvas(lcdCanvas, 'MỰC CHẤT LỎNG', CFG.controlDefault, 'ml');
        var lcdTex = new THREE.CanvasTexture(lcdCanvas);
        if (THREE.SRGBColorSpace) lcdTex.colorSpace = THREE.SRGBColorSpace;
        var lcdPlane = new THREE.Mesh(
          new THREE.PlaneGeometry(radius * 1.8, Math.max(0.025, baseFootH * 1.5)),
          new THREE.MeshBasicMaterial({ map: lcdTex })
        );
        lcdPlane.name = 'digital_readout_mesh';
        lcdPlane.userData.canvas = lcdCanvas;
        lcdPlane.userData.texture = lcdTex;
        lcdPlane.userData.title = 'MỰC CHẤT LỎNG';
        lcdPlane.position.set(0, baseFootH * 0.85, radius * 1.26);
        group.add(lcdPlane);
      }

      // =======================================================================
      // 5. LỰC KẾ LÒ XO PHÒNG THÍ NGHIỆM (SPRING DYNAMOMETER) — LÒ XO XOẮN 3D THẬT
      // =======================================================================
      else if (CFG.shapeFamily === 'spring-dynamometer') {
        var standBase = new THREE.Mesh(
          createBeveledBlockGeometry(THREE, w, 0.020, d, 0.008, 0.003),
          darkTrimMat
        );
        standBase.position.y = 0.010;
        standBase.castShadow = true;
        standBase.receiveShadow = true;
        group.add(standBase);

        var postMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.007, 0.0085, h * 0.96, 24),
          brushedMetalMat
        );
        postMesh.position.set(-w * 0.34, h * 0.48, 0);
        postMesh.castShadow = true;
        group.add(postMesh);

        var armMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.005, 0.005, w * 0.44, 20),
          brushedMetalMat
        );
        armMesh.rotation.z = Math.PI / 2;
        armMesh.position.set(-w * 0.14, h * 0.94, 0);
        armMesh.castShadow = true;
        group.add(armMesh);

        // Thân vỏ lực kế có hốc lõm chứa lò xo 3D và mặt kính cong bảo vệ
        var bodyW = w * 0.36;
        var bodyH = h * 0.48;
        var bodyY = h * 0.64;
        var bodyFrameGeo = createRecessedFrameGeometry(
          THREE,
          bodyW,
          bodyH,
          bodyW * 0.78,
          bodyH * 0.86,
          0.020,
          0.006,
          0.002
        );
        var bodyBox = new THREE.Mesh(bodyFrameGeo, housingMat);
        bodyBox.position.set(0.03, bodyY, 0);
        bodyBox.castShadow = true;
        group.add(bodyBox);

        var scaleTex = createVerticalScaleTexture(THREE, CFG.controlMax || 5, 0, 'N');
        var scalePlate = new THREE.Mesh(
          new THREE.PlaneGeometry(bodyW * 0.76, bodyH * 0.84),
          new THREE.MeshBasicMaterial({ map: scaleTex })
        );
        scalePlate.position.set(0.03, bodyY, -0.004);
        group.add(scalePlate);

        // Lò xo xoắn ốc 3D thật bên trong hốc lực kế
        var springGeo = createHelicalSpringGeometry(THREE, bodyW * 0.11, bodyH * 0.56, 10, 0.0018);
        var springMesh = new THREE.Mesh(springGeo, brassMat);
        springMesh.name = 'helical_spring_mesh';
        springMesh.position.set(0.03, bodyY + bodyH * 0.10, 0.002);
        group.add(springMesh);

        // Mặt kính cong bảo vệ mặt lực kế
        var dynGlass = new THREE.Mesh(
          createCurvedGaugeGlassGeometry(THREE, bodyW * 0.82, bodyH * 0.88, 0.004),
          curvedGaugeGlassMat
        );
        dynGlass.position.set(0.03, bodyY, 0.010);
        dynGlass.renderOrder = 10;
        group.add(dynGlass);

        var plungerGroup = new THREE.Group();
        plungerGroup.name = 'dynamic_plunger';
        plungerGroup.userData.baseY = h * 0.40;
        plungerGroup.position.set(0.03, h * 0.40, 0);

        // Kim chỉ thị màu đỏ vát nhọn trên thang lực kế
        var pointer = new THREE.Mesh(
          createBeveledBlockGeometry(THREE, bodyW * 0.74, 0.005, 0.016, 0.001, 0.0008),
          new THREE.MeshStandardMaterial({ color: 0xDC2626, roughness: 0.3 })
        );
        pointer.position.y = bodyH * 0.32;
        plungerGroup.add(pointer);

        var rodInner = new THREE.Mesh(
          new THREE.CylinderGeometry(0.003, 0.003, h * 0.22, 16),
          brushedMetalMat
        );
        plungerGroup.add(rodInner);

        // Quả nặng chuẩn có khía tiện LatheGeometry treo dưới móc lực kế
        var weightSample = new THREE.Mesh(
          createBeveledBlockGeometry(THREE, w * 0.24, h * 0.13, w * 0.24, w * 0.08, 0.003),
          brassMat
        );
        weightSample.position.y = -h * 0.13;
        weightSample.castShadow = true;
        plungerGroup.add(weightSample);

        group.add(plungerGroup);

        var lcdCanvas = document.createElement('canvas');
        lcdCanvas.width = 512;
        lcdCanvas.height = 160;
        drawDigitalReadoutCanvas(lcdCanvas, 'LỰC KÉO F', CFG.controlDefault, 'N');
        var lcdTex = new THREE.CanvasTexture(lcdCanvas);
        if (THREE.SRGBColorSpace) lcdTex.colorSpace = THREE.SRGBColorSpace;
        var lcdPlane = new THREE.Mesh(
          new THREE.PlaneGeometry(w * 0.72, 0.032),
          new THREE.MeshBasicMaterial({ map: lcdTex })
        );
        lcdPlane.name = 'digital_readout_mesh';
        lcdPlane.userData.canvas = lcdCanvas;
        lcdPlane.userData.texture = lcdTex;
        lcdPlane.userData.title = 'LỰC KÉO F';
        lcdPlane.position.set(0, 0.026, d * 0.48);
        group.add(lcdPlane);
      }

      // =======================================================================
      // 6. CÂN ĐIỆN TỬ HIỆN SỐ / ĐỒNG HỒ VẠN NĂNG SỐ (ELECTRONIC BALANCE / DMM)
      // =======================================================================
      else if (
        CFG.shapeFamily === 'electronic-balance' ||
        CFG.shapeFamily === 'digital-multimeter'
      ) {
        var isBalance = (CFG.shapeFamily === 'electronic-balance');
        var bodyH = isBalance ? h * 0.55 : h * 0.92;
        var chassisGeo = createBeveledBlockGeometry(
          THREE,
          w,
          bodyH,
          d,
          Math.min(w, d) * 0.09,
          Math.min(w, bodyH, d) * 0.03
        );
        var chassis = new THREE.Mesh(chassisGeo, housingMat);
        chassis.position.y = bodyH / 2;
        chassis.castShadow = true;
        chassis.receiveShadow = true;
        group.add(chassis);

        // Khung hốc màn hình LCD lõm nhẹ kèm mặt kính cong bảo vệ
        var lcdW = w * 0.78;
        var lcdH = bodyH * 0.38;
        var lcdY = isBalance ? bodyH * 0.52 : bodyH * 0.68;
        var lcdBezel = new THREE.Mesh(
          createRecessedFrameGeometry(THREE, lcdW * 1.08, lcdH * 1.14, lcdW * 0.96, lcdH * 0.94, 0.008, 0.005, 0.0015),
          darkTrimMat
        );
        lcdBezel.position.set(0, lcdY, d / 2 + 0.001);
        group.add(lcdBezel);

        var lcdCanvas = document.createElement('canvas');
        lcdCanvas.width = 512;
        lcdCanvas.height = 180;
        drawDigitalReadoutCanvas(
          lcdCanvas,
          CFG.nameVi || 'ĐO LƯỜNG SỐ',
          CFG.controlDefault,
          CFG.controlUnit || (isBalance ? 'g' : 'V')
        );
        var lcdTex = new THREE.CanvasTexture(lcdCanvas);
        if (THREE.SRGBColorSpace) lcdTex.colorSpace = THREE.SRGBColorSpace;
        var lcdMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(lcdW, lcdH),
          new THREE.MeshBasicMaterial({ map: lcdTex })
        );
        lcdMesh.name = 'digital_readout_mesh';
        lcdMesh.userData.canvas = lcdCanvas;
        lcdMesh.userData.texture = lcdTex;
        lcdMesh.userData.title = CFG.nameVi || 'ĐO LƯỜNG SỐ';
        lcdMesh.position.set(0, lcdY, d / 2 - 0.001);
        group.add(lcdMesh);

        var lcdGlass = new THREE.Mesh(
          createCurvedGaugeGlassGeometry(THREE, lcdW, lcdH, 0.0035),
          curvedGaugeGlassMat
        );
        lcdGlass.position.set(0, lcdY, d / 2 + 0.004);
        lcdGlass.renderOrder = 10;
        group.add(lcdGlass);

        if (isBalance) {
          var panGroup = new THREE.Group();
          panGroup.name = 'balance_pan_group';
          panGroup.userData.baseY = bodyH;
          panGroup.position.y = bodyH;

          var stem = new THREE.Mesh(
            new THREE.CylinderGeometry(w * 0.12, w * 0.15, h * 0.14, 28),
            darkTrimMat
          );
          stem.position.y = h * 0.07;
          panGroup.add(stem);

          var pan = new THREE.Mesh(
            createBeveledBlockGeometry(THREE, w * 0.82, 0.014, d * 0.78, w * 0.18, 0.003),
            brushedMetalMat
          );
          pan.position.y = h * 0.14;
          pan.castShadow = true;
          pan.receiveShadow = true;
          panGroup.add(pan);

          var sample = new THREE.Mesh(
            createBeveledBlockGeometry(THREE, w * 0.24, h * 0.20, w * 0.24, w * 0.09, 0.003),
            brassMat
          );
          sample.position.y = h * 0.24;
          sample.castShadow = true;
          panGroup.add(sample);

          group.add(panGroup);
        } else {
          // Núm xoay chọn thang đo 3D có gờ nổi + 3 chốt cắm giắc đo đa chi tiết
          var dialKnob = new THREE.Mesh(
            new THREE.CylinderGeometry(w * 0.19, w * 0.21, 0.016, 32),
            darkTrimMat
          );
          dialKnob.rotation.x = Math.PI / 2;
          dialKnob.position.set(0, bodyH * 0.34, d / 2 + 0.008);
          dialKnob.castShadow = true;
          group.add(dialKnob);

          var knobBar = new THREE.Mesh(
            createBeveledBlockGeometry(THREE, w * 0.05, w * 0.34, 0.012, 0.002, 0.001),
            housingMat
          );
          knobBar.position.set(0, bodyH * 0.34, d / 2 + 0.015);
          group.add(knobBar);

          var jackY = bodyH * 0.12;
          var jBlack = createBindingPost(THREE, '#0F172A', w * 0.052, 0.020, '-');
          jBlack.rotation.x = Math.PI / 2;
          jBlack.position.set(-w * 0.26, jackY, d / 2);
          group.add(jBlack);

          var jRed1 = createBindingPost(THREE, '#DC2626', w * 0.052, 0.020, '+');
          jRed1.rotation.x = Math.PI / 2;
          jRed1.position.set(0, jackY, d / 2);
          group.add(jRed1);

          var jRed2 = createBindingPost(THREE, '#DC2626', w * 0.052, 0.020, '+');
          jRed2.rotation.x = Math.PI / 2;
          jRed2.position.set(w * 0.26, jackY, d / 2);
          group.add(jRed2);
        }
      }

      // =======================================================================
      // 7A. NHIỆT KẾ PHÒNG THÍ NGHIỆM (LABORATORY THERMOMETER)
      // =======================================================================
      else if (CFG.shapeFamily === 'thermometer') {
        var standBaseH = Math.max(0.014, h * 0.06);
        var standBase = new THREE.Mesh(
          createBeveledBlockGeometry(THREE, w * 0.85, standBaseH, d * 0.85, w * 0.14, 0.003),
          darkTrimMat
        );
        standBase.position.y = standBaseH / 2;
        group.add(standBase);

        var bulbR = Math.max(0.009, Math.min(w, d) * 0.18);
        var bulbY = standBaseH + bulbR + 0.006;
        var mercuryMat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#DC2626'),
          metalness: 0.35,
          roughness: 0.15,
          clearcoat: 1.0
        });
        var bulbMesh = new THREE.Mesh(
          new THREE.SphereGeometry(bulbR, 32, 24),
          mercuryMat
        );
        bulbMesh.position.y = bulbY;
        group.add(bulbMesh);

        var stemH = Math.max(0.08, h * 0.80);
        var stemR = bulbR * 0.52;
        var stemMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(stemR, stemR, stemH, 32),
          borosilicateGlassMat
        );
        stemMesh.position.y = bulbY + stemH / 2;
        stemMesh.renderOrder = 10;
        group.add(stemMesh);

        // Bảng vạch chia độ gắn dọc thân nhiệt kế
        var backPlateW = Math.max(stemR * 3.4, w * 0.42);
        var backPlate = new THREE.Mesh(
          createBeveledBlockGeometry(THREE, backPlateW, stemH * 0.92, 0.004, 0.003, 0.001),
          new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.35, metalness: 0.05 })
        );
        backPlate.position.set(0, bulbY + stemH * 0.5, -stemR * 0.65);
        group.add(backPlate);

        var scaleCanvas = document.createElement('canvas');
        scaleCanvas.width = 256;
        scaleCanvas.height = 512;
        drawGraduatedScaleCanvas(scaleCanvas, CFG.controlMax || 100, '°C');
        var scaleTex = new THREE.CanvasTexture(scaleCanvas);
        if (THREE.SRGBColorSpace) scaleTex.colorSpace = THREE.SRGBColorSpace;
        var scalePlane = new THREE.Mesh(
          new THREE.PlaneGeometry(backPlateW * 0.88, stemH * 0.86),
          new THREE.MeshBasicMaterial({ map: scaleTex, transparent: true })
        );
        scalePlane.position.set(0, bulbY + stemH * 0.5, -stemR * 0.65 + 0.0025);
        group.add(scalePlane);

        // Cột chất lỏng mao quản dâng theo nhiệt độ
        var maxCapillaryH = stemH * 0.82;
        var liqCol = new THREE.Mesh(
          new THREE.CylinderGeometry(stemR * 0.36, stemR * 0.36, maxCapillaryH, 20),
          mercuryMat
        );
        liqCol.name = 'liquid_column';
        liqCol.userData.baseY = bulbY + bulbR * 0.5;
        liqCol.userData.maxH = maxCapillaryH;
        liqCol.position.y = bulbY + bulbR * 0.5 + maxCapillaryH * 0.35;
        group.add(liqCol);

        // Khuyên treo đỉnh nhiệt kế
        var topRing = new THREE.Mesh(
          new THREE.TorusGeometry(stemR * 0.85, stemR * 0.22, 16, 32),
          borosilicateGlassMat
        );
        topRing.position.y = bulbY + stemH + stemR * 0.7;
        group.add(topRing);
      }

      // =======================================================================
      // 7B. KÍNH HIỂN VI QUANG HỌC SINH HỌC (OPTICAL MICROSCOPE)
      // =======================================================================
      else if (CFG.shapeFamily === 'microscope-biology') {
        var mBaseH = Math.max(0.022, h * 0.09);
        var mBase = new THREE.Mesh(
          createBeveledBlockGeometry(THREE, w * 0.86, mBaseH, d * 0.90, w * 0.14, 0.005),
          housingMat
        );
        mBase.position.y = mBaseH / 2;
        group.add(mBase);

        // Đèn chiếu sáng dưới mâm tiêu bản (Illuminator)
        var lampHousing = new THREE.Mesh(
          new THREE.CylinderGeometry(w * 0.16, w * 0.20, mBaseH * 0.75, 28),
          darkTrimMat
        );
        lampHousing.position.set(0, mBaseH + mBaseH * 0.35, d * 0.10);
        group.add(lampHousing);

        var lensLight = new THREE.Mesh(
          new THREE.SphereGeometry(w * 0.12, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
          new THREE.MeshBasicMaterial({ color: 0xFEF08A })
        );
        lensLight.position.set(0, mBaseH + mBaseH * 0.7, d * 0.10);
        group.add(lensLight);

        // Thân giá đỡ cong công thái học (C-Arm)
        var armH = h * 0.62;
        var armMesh = new THREE.Mesh(
          createBeveledBlockGeometry(THREE, w * 0.22, armH, d * 0.24, w * 0.06, 0.005),
          housingMat
        );
        armMesh.position.set(0, mBaseH + armH * 0.48, -d * 0.26);
        armMesh.rotation.x = 0.12;
        group.add(armMesh);

        // 2 ốc chỉnh tinh và chỉnh thô hai bên thân (Coarse & Fine Focus Knobs)
        [-1, 1].forEach(function(side) {
          var coarseKnob = new THREE.Mesh(
            new THREE.CylinderGeometry(w * 0.12, w * 0.12, w * 0.06, 28),
            darkTrimMat
          );
          coarseKnob.rotation.z = Math.PI / 2;
          coarseKnob.position.set(side * (w * 0.14), mBaseH + armH * 0.28, -d * 0.24);
          group.add(coarseKnob);

          var fineKnob = new THREE.Mesh(
            new THREE.CylinderGeometry(w * 0.075, w * 0.075, w * 0.05, 24),
            accentMat
          );
          fineKnob.rotation.z = Math.PI / 2;
          fineKnob.position.set(side * (w * 0.18), mBaseH + armH * 0.28, -d * 0.24);
          group.add(fineKnob);
        });

        // Bàn đặt tiêu bản (Mechanical Stage) + Lam kính mẫu vật
        var stageY = mBaseH + armH * 0.36;
        var stageMesh = new THREE.Mesh(
          createBeveledBlockGeometry(THREE, w * 0.68, 0.012, d * 0.62, 0.008, 0.002),
          darkTrimMat
        );
        stageMesh.position.set(0, stageY, d * 0.06);
        group.add(stageMesh);

        var glassSlide = new THREE.Mesh(
          new THREE.BoxGeometry(w * 0.38, 0.003, d * 0.16),
          borosilicateGlassMat
        );
        glassSlide.position.set(0, stageY + 0.008, d * 0.08);
        group.add(glassSlide);

        // Mâm xoay 3 vật kính (Revolving Nosepiece Turret)
        var turretGroup = new THREE.Group();
        turretGroup.name = 'dynamic_pivot';
        turretGroup.position.set(0, stageY + armH * 0.28, d * 0.06);

        var turretDisc = new THREE.Mesh(
          new THREE.CylinderGeometry(w * 0.18, w * 0.20, 0.018, 28),
          brushedMetalMat
        );
        turretGroup.add(turretDisc);

        var objColors = [0xDC2626, 0xEAB308, 0x2563EB];
        for (var oi = 0; oi < 3; oi++) {
          var ang = (oi * Math.PI * 2) / 3;
          var objLen = 0.032 + oi * 0.008;
          var objGroup = new THREE.Group();
          objGroup.position.set(Math.cos(ang) * w * 0.11, -objLen / 2 - 0.006, Math.sin(ang) * w * 0.11);
          objGroup.rotation.z = Math.cos(ang) * 0.15;
          objGroup.rotation.x = -Math.sin(ang) * 0.15;

          var barrel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.009, 0.007, objLen, 20),
            brushedMetalMat
          );
          objGroup.add(barrel);

          var band = new THREE.Mesh(
            new THREE.CylinderGeometry(0.0095, 0.0095, 0.005, 20),
            new THREE.MeshStandardMaterial({ color: objColors[oi], roughness: 0.3 })
          );
          band.position.y = -objLen * 0.2;
          objGroup.add(band);

          turretGroup.add(objGroup);
        }
        group.add(turretGroup);

        // Đầu kính & Ống thị kính nghiêng 45 độ (Monocular/Binocular Head)
        var headMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(w * 0.15, w * 0.18, h * 0.14, 28),
          housingMat
        );
        headMesh.position.set(0, mBaseH + armH * 0.88, -d * 0.04);
        group.add(headMesh);

        var eyepieceTube = new THREE.Mesh(
          new THREE.CylinderGeometry(w * 0.075, w * 0.085, h * 0.22, 24),
          darkTrimMat
        );
        eyepieceTube.position.set(0, mBaseH + armH * 0.98, d * 0.14);
        eyepieceTube.rotation.x = -Math.PI / 4;
        group.add(eyepieceTube);
      }

      // =======================================================================
      // 7C. LĂNG KÍNH QUANG HỌC TAM GIÁC (OPTICAL PRISM ON ROTATING STAGE)
      // =======================================================================
      else if (CFG.shapeFamily === 'optical-prism') {
        var pBaseH = Math.max(0.018, h * 0.09);
        var pBase = new THREE.Mesh(
          createBeveledBlockGeometry(THREE, w * 0.85, pBaseH, d * 0.85, w * 0.14, 0.003),
          darkTrimMat
        );
        pBase.position.y = pBaseH / 2;
        group.add(pBase);

        var pRodH = Math.max(0.035, h * 0.32);
        var pRod = new THREE.Mesh(
          new THREE.CylinderGeometry(w * 0.05, w * 0.06, pRodH, 28),
          brushedMetalMat
        );
        pRod.position.y = pBaseH + pRodH / 2;
        group.add(pRod);

        var prismPivot = new THREE.Group();
        prismPivot.name = 'dynamic_pivot';
        prismPivot.position.y = pBaseH + pRodH;

        var stageTable = new THREE.Mesh(
          new THREE.CylinderGeometry(w * 0.38, w * 0.38, 0.012, 36),
          darkTrimMat
        );
        stageTable.position.y = 0.006;
        prismPivot.add(stageTable);

        // Khối lăng kính thủy tinh tiết diện tam giác đều trong suốt (không có thanh đỏ)
        var prismH = Math.max(0.05, h * 0.48);
        var prismRadius = Math.max(0.025, w * 0.30);
        var prismGeo = new THREE.CylinderGeometry(prismRadius, prismRadius, prismH, 3);
        var prismMesh = new THREE.Mesh(prismGeo, curvedGaugeGlassMat);
        prismMesh.position.y = 0.012 + prismH / 2;
        prismMesh.renderOrder = 10;
        prismPivot.add(prismMesh);

        var topCap = new THREE.Mesh(
          new THREE.CylinderGeometry(prismRadius * 1.04, prismRadius * 1.04, 0.006, 3),
          darkTrimMat
        );
        topCap.position.y = 0.012 + prismH + 0.003;
        prismPivot.add(topCap);

        group.add(prismPivot);
      }

      // =======================================================================
      // 7D. NGUỒN PHÁT TIA LASER QUANG HỌC (OPTICAL LASER DIODE SOURCE)
      // =======================================================================
      else if (CFG.shapeFamily === 'laser-source') {
        var lBaseH = Math.max(0.018, h * 0.12);
        var lBase = new THREE.Mesh(
          createBeveledBlockGeometry(THREE, w * 0.78, lBaseH, d * 0.78, w * 0.10, 0.003),
          darkTrimMat
        );
        lBase.position.y = lBaseH / 2;
        group.add(lBase);

        var lStemH = Math.max(0.03, h * 0.35);
        var lStem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.009, 0.011, lStemH, 24),
          brushedMetalMat
        );
        lStem.position.y = lBaseH + lStemH / 2;
        group.add(lStem);

        var laserHead = new THREE.Group();
        laserHead.name = 'dynamic_pivot';
        laserHead.position.y = lBaseH + lStemH + Math.max(0.018, h * 0.16);

        var bodyBox = new THREE.Mesh(
          createBeveledBlockGeometry(THREE, w * 0.72, Math.max(0.028, h * 0.24), Math.max(0.032, d * 0.45), 0.006, 0.003),
          housingMat
        );
        laserHead.add(bodyBox);

        var apertureNozzle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.011, 0.013, w * 0.16, 28),
          brassMat
        );
        apertureNozzle.rotation.z = Math.PI / 2;
        apertureNozzle.position.x = w * 0.36 + w * 0.07;
        laserHead.add(apertureNozzle);

        group.add(laserHead);
      }

      // =======================================================================
      // 7E. THẤU KÍNH QUANG HỌC TRÊN GIÁ ĐỠ (OPTICAL LENS — KHÔNG CÓ THANH ĐỎ)
      // =======================================================================
      else if (CFG.shapeFamily === 'optical-lens') {
        var baseH = Math.max(0.020, h * 0.095);
        var baseMesh = new THREE.Mesh(
          createBeveledBlockGeometry(THREE, w * 0.88, baseH, d * 0.88, w * 0.16, 0.003),
          darkTrimMat
        );
        baseMesh.position.y = baseH / 2;
        group.add(baseMesh);

        var rodH = Math.max(0.04, h * 0.46);
        var rodMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(w * 0.045, w * 0.052, rodH, 28),
          brushedMetalMat
        );
        rodMesh.position.y = baseH + rodH / 2;
        group.add(rodMesh);

        var lensPivot = new THREE.Group();
        lensPivot.name = 'dynamic_pivot';
        lensPivot.position.y = baseH + rodH + w * 0.36;

        var ringMesh = new THREE.Mesh(
          new THREE.TorusGeometry(w * 0.36, w * 0.034, 24, 56),
          darkTrimMat
        );
        lensPivot.add(ringMesh);

        // Thấu kính hai mặt lồi/lõm uốn cong quang học thật (Biconvex Curved Optical Lens)
        var lensGeo = new THREE.SphereGeometry(w * 0.345, 44, 32);
        lensGeo.scale(1, 1, 0.28);
        var lensMesh = new THREE.Mesh(lensGeo, curvedGaugeGlassMat);
        lensMesh.renderOrder = 10;
        lensPivot.add(lensMesh);

        // Bảng hiển thị tiêu cự f dưới chân giá đỡ
        var lcdCanvas = document.createElement('canvas');
        lcdCanvas.width = 512;
        lcdCanvas.height = 160;
        drawDigitalReadoutCanvas(lcdCanvas, CFG.nameVi || 'THẤU KÍNH', CFG.controlDefault, CFG.controlUnit || 'cm');
        var lcdTex = new THREE.CanvasTexture(lcdCanvas);
        if (THREE.SRGBColorSpace) lcdTex.colorSpace = THREE.SRGBColorSpace;
        var lcdPlane = new THREE.Mesh(
          new THREE.PlaneGeometry(w * 0.72, 0.026),
          new THREE.MeshBasicMaterial({ map: lcdTex })
        );
        lcdPlane.name = 'digital_readout_mesh';
        lcdPlane.userData.canvas = lcdCanvas;
        lcdPlane.userData.texture = lcdTex;
        lcdPlane.userData.title = CFG.nameVi || 'THẤU KÍNH';
        lcdPlane.position.set(0, baseH + 0.015, d * 0.42);
        group.add(lcdPlane);

        group.add(lensPivot);
      }

      // =======================================================================
      // 8. TỔ HỢP 3D ĐA BỘ PHẬN THEO BẢN THẢO AI & MÔ TẢ NGOẠI HÌNH CHI TIẾT
      //    (CUSTOM MULTI-PART APPARATUS / PERMANENT MAGNET / COMPASS RECONSTRUCTION)
      // =======================================================================
      else {
        var partsList = Array.isArray(CFG.customParts) && CFG.customParts.length > 0
          ? CFG.customParts
          : [
              {
                partName: 'Đế thiết bị bo góc',
                shape: 'beveled-box',
                colorHex: CFG.secondaryColorHex || '#1E293B',
                metalness: 0.45,
                roughness: 0.4,
                opacity: 1.0,
                relativeScale: [0.92, 0.14, 0.90],
                relativePos: [0, 0.07, 0]
              },
              {
                partName: 'Thân chính thiết bị',
                shape: 'beveled-box',
                colorHex: CFG.primaryColorHex || '#334155',
                metalness: 0.25,
                roughness: 0.38,
                opacity: 1.0,
                relativeScale: [0.80, 0.62, 0.74],
                relativePos: [0, 0.45, 0]
              },
              {
                partName: 'Mặt hiển thị & Điều khiển',
                shape: 'dial-face',
                colorHex: '#F8FAFC',
                metalness: 0.1,
                roughness: 0.25,
                opacity: 1.0,
                relativeScale: [0.58, 0.30, 0.05],
                relativePos: [0, 0.52, 0.38]
              },
              {
                partName: 'Cụm chi tiết tương tác phía trên',
                shape: 'cylinder',
                colorHex: CFG.accentColorHex || '#D97706',
                metalness: 0.7,
                roughness: 0.25,
                opacity: 1.0,
                relativeScale: [0.28, 0.18, 0.28],
                relativePos: [0, 0.85, 0]
              }
            ];

        function createMagnetPoleBadgeMesh(poleChar, bgHex, badgeW, badgeH) {
          var pCanvas = document.createElement('canvas');
          pCanvas.width = 256;
          pCanvas.height = 256;
          var pCtx = pCanvas.getContext('2d');
          if (pCtx) {
            pCtx.clearRect(0, 0, 256, 256);
            pCtx.fillStyle = bgHex || (poleChar === 'N' ? '#DC2626' : '#1D4ED8');
            pCtx.beginPath();
            pCtx.roundRect(18, 18, 220, 220, 36);
            pCtx.fill();
            pCtx.lineWidth = 8;
            pCtx.strokeStyle = 'rgba(255,255,255,0.88)';
            pCtx.stroke();
            pCtx.fillStyle = '#FFFFFF';
            pCtx.font = '900 152px Inter, Arial, sans-serif';
            pCtx.textAlign = 'center';
            pCtx.textBaseline = 'middle';
            pCtx.fillText(poleChar, 128, 136);
          }
          var pTex = new THREE.CanvasTexture(pCanvas);
          if (THREE.SRGBColorSpace) pTex.colorSpace = THREE.SRGBColorSpace;
          var pMat = new THREE.MeshBasicMaterial({
            map: pTex,
            transparent: true,
            polygonOffset: true,
            polygonOffsetFactor: -2
          });
          return new THREE.Mesh(new THREE.PlaneGeometry(badgeW, badgeH), pMat);
        }

        var northPoleCenter = null;
        var southPoleCenter = null;

        for (var pi = 0; pi < partsList.length; pi++) {
          var part = partsList[pi];
          if (!part) continue;
          var relS = Array.isArray(part.relativeScale) && part.relativeScale.length === 3
            ? part.relativeScale
            : [0.5, 0.25, 0.5];
          var relP = Array.isArray(part.relativePos) && part.relativePos.length === 3
            ? part.relativePos
            : [0, 0.3 + pi * 0.18, 0];

          var pw = Math.max(0.008, w * Math.max(0.05, Math.min(1.5, Number(relS[0]) || 0.5)));
          var ph = Math.max(0.008, h * Math.max(0.04, Math.min(1.5, Number(relS[1]) || 0.25)));
          var pd = Math.max(0.008, d * Math.max(0.05, Math.min(1.5, Number(relS[2]) || 0.5)));

          var px = w * (Number(relP[0]) || 0);
          var py = h * Math.max(0.02, Number(relP[1]) || 0.2);
          var pz = d * (Number(relP[2]) || 0);

          var pOpacity = typeof part.opacity === 'number' ? Math.max(0.15, Math.min(1.0, part.opacity)) : 1.0;
          var isGlassPart = pOpacity < 0.88 || part.shape === 'lathe-glass';
          var partMat;
          if (isGlassPart) {
            partMat = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(part.colorHex || '#E0F2FE'),
              transparent: true,
              opacity: Math.min(0.75, pOpacity),
              transmission: 0.72,
              roughness: 0.08,
              metalness: 0.02,
              ior: 1.48,
              reflectivity: 0.9,
              side: THREE.DoubleSide
            });
          } else {
            partMat = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(part.colorHex || CFG.primaryColorHex || '#334155'),
              metalness: typeof part.metalness === 'number' ? part.metalness : 0.35,
              roughness: typeof part.roughness === 'number' ? part.roughness : 0.4,
              clearcoat: 0.28,
              clearcoatRoughness: 0.25
            });
          }

          var partMesh = null;
          var pShape = String(part.shape || 'beveled-box').toLowerCase();

          if (pShape === 'lathe-glass') {
            var rMax = Math.max(pw, pd) * 0.5;
            var lathePts = [
              new THREE.Vector2(0.001, 0),
              new THREE.Vector2(rMax * 0.65, ph * 0.04),
              new THREE.Vector2(rMax, ph * 0.28),
              new THREE.Vector2(rMax * 0.88, ph * 0.58),
              new THREE.Vector2(rMax * 0.36, ph * 0.78),
              new THREE.Vector2(rMax * 0.34, ph * 0.96),
              new THREE.Vector2(rMax * 0.42, ph)
            ];
            var latheGeo = new THREE.LatheGeometry(lathePts, 44);
            partMesh = new THREE.Mesh(latheGeo, partMat);
            partMesh.position.set(px, Math.max(0, py - ph * 0.5), pz);
            partMesh.renderOrder = 10;

            var innerLiqMat = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(CFG.accentColorHex || '#0284C7'),
              transparent: true,
              opacity: 0.72,
              roughness: 0.12
            });
            var innerLiqH = ph * 0.52;
            var innerLiq = new THREE.Mesh(
              new THREE.CylinderGeometry(rMax * 0.76, rMax * 0.58, innerLiqH, 32),
              innerLiqMat
            );
            innerLiq.name = 'liquid_column';
            innerLiq.userData.baseY = Math.max(0, py - ph * 0.45);
            innerLiq.userData.maxH = innerLiqH;
            innerLiq.position.set(px, Math.max(0, py - ph * 0.45) + innerLiqH * 0.45, pz);
            group.add(innerLiq);
          } else if (pShape === 'cylinder' || pShape === 'tube') {
            var cylR = Math.max(pw, pd) * 0.5;
            var cylGeo = new THREE.CylinderGeometry(
              pShape === 'tube' ? cylR * 0.85 : cylR,
              cylR,
              ph,
              36,
              1,
              pShape === 'tube'
            );
            partMesh = new THREE.Mesh(cylGeo, partMat);
            partMesh.position.set(px, py, pz);
          } else if (pShape === 'cone') {
            var coneR = Math.max(pw, pd) * 0.5;
            var coneGeo = new THREE.ConeGeometry(coneR, ph, 36);
            partMesh = new THREE.Mesh(coneGeo, partMat);
            partMesh.position.set(px, py, pz);
          } else if (pShape === 'sphere') {
            var sphR = Math.max(pw, ph, pd) * 0.5;
            var sphGeo = new THREE.SphereGeometry(sphR, 36, 28);
            partMesh = new THREE.Mesh(sphGeo, partMat);
            partMesh.position.set(px, py, pz);
          } else if (pShape === 'torus') {
            var torR = Math.max(pw, pd) * 0.45;
            var tubeR = Math.max(0.004, Math.min(pw, ph, pd) * 0.14);
            var torGeo = new THREE.TorusGeometry(torR, tubeR, 20, 48);
            torGeo.rotateX(Math.PI / 2);
            partMesh = new THREE.Mesh(torGeo, partMat);
            partMesh.position.set(px, py, pz);
          } else if (pShape === 'binding-post') {
            var postObj = createBindingPost(
              THREE,
              part.colorHex || '#DC2626',
              Math.max(0.007, Math.min(pw, pd) * 0.45),
              Math.max(0.015, ph),
              px >= 0 ? '+' : '-'
            );
            postObj.position.set(px, py, pz);
            group.add(postObj);
          } else if (pShape === 'dial-face') {
            var dialBacking = new THREE.Mesh(
              createBeveledBlockGeometry(THREE, pw, ph, Math.max(0.006, pd * 0.25), 0.005, 0.002),
              darkTrimMat
            );
            dialBacking.position.set(px, py, pz);
            group.add(dialBacking);

            var customLcdCanvas = document.createElement('canvas');
            customLcdCanvas.width = 512;
            customLcdCanvas.height = 160;
            drawDigitalReadoutCanvas(
              customLcdCanvas,
              CFG.nameVi || part.partName || 'THÔNG SỐ',
              CFG.controlDefault,
              CFG.controlUnit || ''
            );
            var customLcdTex = new THREE.CanvasTexture(customLcdCanvas);
            if (THREE.SRGBColorSpace) customLcdTex.colorSpace = THREE.SRGBColorSpace;
            var customLcdPlane = new THREE.Mesh(
              new THREE.PlaneGeometry(pw * 0.90, ph * 0.78),
              new THREE.MeshBasicMaterial({ map: customLcdTex })
            );
            customLcdPlane.name = 'digital_readout_mesh';
            customLcdPlane.userData.canvas = customLcdCanvas;
            customLcdPlane.userData.texture = customLcdTex;
            customLcdPlane.userData.title = CFG.nameVi || part.partName || 'THÔNG SỐ';
            customLcdPlane.position.set(px, py, pz + Math.max(0.004, pd * 0.14));
            group.add(customLcdPlane);
          } else {
            var bevR = Math.min(pw, pd) * 0.12;
            var bevGeo = createBeveledBlockGeometry(THREE, pw, ph, pd, bevR, Math.min(0.005, ph * 0.12));
            partMesh = new THREE.Mesh(bevGeo, partMat);
            partMesh.position.set(px, py, pz);
          }

          if (partMesh) {
            partMesh.name = 'custom_part_' + pi;
            if (isGlassPart) partMesh.renderOrder = 10;
            group.add(partMesh);

            // Nhận diện Cực Bắc (N) / Cực Nam (S) để in ký hiệu phân cực N-S rõ nét lên khối 3D
            var rawPoleLabel = part.poleLabel ? String(part.poleLabel).trim().toUpperCase() : '';
            var pNameLower = String(part.partName || '').toLowerCase();
            if (!rawPoleLabel) {
              if (
                pNameLower.indexOf('cực từ bắc') !== -1 ||
                pNameLower.indexOf('cực bắc') !== -1 ||
                pNameLower.indexOf('(n)') !== -1 ||
                pNameLower.indexOf('ký hiệu n') !== -1 ||
                pNameLower.indexOf('north') !== -1
              ) {
                rawPoleLabel = 'N';
              } else if (
                pNameLower.indexOf('cực từ nam') !== -1 ||
                pNameLower.indexOf('cực nam') !== -1 ||
                pNameLower.indexOf('(s)') !== -1 ||
                pNameLower.indexOf('ký hiệu s') !== -1 ||
                pNameLower.indexOf('south') !== -1
              ) {
                rawPoleLabel = 'S';
              }
            }

            if (rawPoleLabel === 'N' || rawPoleLabel === 'S') {
              if (rawPoleLabel === 'N' && !northPoleCenter) {
                northPoleCenter = new THREE.Vector3(px, py, pz);
              }
              if (rawPoleLabel === 'S' && !southPoleCenter) {
                southPoleCenter = new THREE.Vector3(px, py, pz);
              }

              var badgeSize = Math.max(0.014, Math.min(pw, ph) * 0.56);
              var frontBadge = createMagnetPoleBadgeMesh(
                rawPoleLabel,
                part.colorHex || (rawPoleLabel === 'N' ? '#DC2626' : '#1D4ED8'),
                badgeSize,
                badgeSize
              );
              frontBadge.position.set(px, py, pz + pd * 0.5 + 0.0018);
              group.add(frontBadge);

              var backBadge = createMagnetPoleBadgeMesh(
                rawPoleLabel,
                part.colorHex || (rawPoleLabel === 'N' ? '#DC2626' : '#1D4ED8'),
                badgeSize,
                badgeSize
              );
              backBadge.rotation.y = Math.PI;
              backBadge.position.set(px, py, pz - pd * 0.5 - 0.0018);
              group.add(backBadge);

              var topBadgeSize = Math.max(0.012, Math.min(pw, pd) * 0.54);
              var topBadge = createMagnetPoleBadgeMesh(
                rawPoleLabel,
                part.colorHex || (rawPoleLabel === 'N' ? '#DC2626' : '#1D4ED8'),
                topBadgeSize,
                topBadgeSize
              );
              topBadge.rotation.x = -Math.PI / 2;
              topBadge.position.set(px, py + ph * 0.5 + 0.0018, pz);
              group.add(topBadge);
            }
          }
        }

        // Nếu là Nam châm vĩnh cửu (hoặc có cặp cực N - S), vẽ thêm các đường sức từ 3D trực quan nối từ N sang S
        if (
          (CFG.shapeFamily === 'permanent-magnet' || (northPoleCenter && southPoleCenter)) &&
          northPoleCenter &&
          southPoleCenter
        ) {
          var fieldGroup = new THREE.Group();
          fieldGroup.name = 'magnetic_field_lines_group';
          var midPt = new THREE.Vector3().addVectors(northPoleCenter, southPoleCenter).multiplyScalar(0.5);
          var spanDist = Math.max(0.04, northPoleCenter.distanceTo(southPoleCenter));
          var fieldMat = new THREE.MeshBasicMaterial({
            color: 0x38BDF8,
            transparent: true,
            opacity: 0.42
          });

          var archFactors = [0.45, 0.78, -0.45];
          for (var afi = 0; afi < archFactors.length; afi++) {
            var archF = archFactors[afi];
            var ctrlPt = new THREE.Vector3(
              midPt.x,
              Math.max(0.012, midPt.y + spanDist * archF),
              midPt.z + (afi === 1 ? 0.012 : 0)
            );
            var curve = new THREE.QuadraticBezierCurve3(northPoleCenter, ctrlPt, southPoleCenter);
            var tubeGeo = new THREE.TubeGeometry(curve, 36, Math.max(0.0012, Math.min(w, h) * 0.012), 10, false);
            var fieldTube = new THREE.Mesh(tubeGeo, fieldMat);
            fieldGroup.add(fieldTube);
          }
          group.add(fieldGroup);
        }
      }

      // Nếu người dùng thêm khối phụ mới trên Bản phác thảo 2D (từ khối thứ 6 trở đi trên các Template chuẩn),
      // tự động dựng bổ sung các khối 3D đó vào mô hình để đảm bảo đồng bộ 100% giữa 2D và 3D!
      if (
        CFG.shapeFamily !== 'custom-apparatus' &&
        CFG.shapeFamily !== 'permanent-magnet' &&
        CFG.shapeFamily !== 'magnetic-compass' &&
        cParts.length > 5
      ) {
        for (var epi = 5; epi < cParts.length; epi++) {
          var ePart = cParts[epi];
          var eScale = Array.isArray(ePart.relativeScale) && ePart.relativeScale.length >= 3
            ? ePart.relativeScale
            : [0.3, 0.15, 0.3];
          var ePos = Array.isArray(ePart.relativePos) && ePart.relativePos.length >= 3
            ? ePart.relativePos
            : [0, 0.5, 0];
          var epw = Math.max(0.012, w * eScale[0]);
          var eph = Math.max(0.008, h * eScale[1]);
          var epd = Math.max(0.012, d * eScale[2]);
          var epx = w * ePos[0];
          var epy = Math.max(eph * 0.5, h * ePos[1]);
          var epz = d * ePos[2];
          var eOpacity = typeof ePart.opacity === 'number' ? Math.max(0.15, Math.min(1, ePart.opacity)) : 1;
          var eMat = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(ePart.colorHex || CFG.accentColorHex || '#38BDF8'),
            metalness: typeof ePart.metalness === 'number' ? ePart.metalness : 0.45,
            roughness: typeof ePart.roughness === 'number' ? ePart.roughness : 0.35,
            transparent: eOpacity < 0.95,
            opacity: eOpacity,
            clearcoat: 0.25
          });
          var eMesh = null;
          if (ePart.shape === 'sphere' || ePart.shape === 'lathe-glass') {
            eMesh = new THREE.Mesh(new THREE.SphereGeometry(Math.max(epw, eph) * 0.5, 32, 24), eMat);
          } else if (ePart.shape === 'cone') {
            eMesh = new THREE.Mesh(new THREE.ConeGeometry(Math.max(epw, epd) * 0.5, eph, 32), eMat);
          } else if (ePart.shape === 'cylinder' || ePart.shape === 'tube') {
            eMesh = new THREE.Mesh(new THREE.CylinderGeometry(epw * 0.5, epw * 0.5, eph, 32), eMat);
          } else {
            eMesh = new THREE.Mesh(createBeveledBlockGeometry(THREE, epw, eph, epd, Math.min(epw, epd) * 0.12, 0.002), eMat);
          }
          if (eMesh) {
            eMesh.name = 'extra_custom_part_' + epi;
            eMesh.position.set(epx, epy, epz);
            group.add(eMesh);
          }
        }
      }

      // Đảm bảo mọi chi tiết hình học đều đổ bóng và nhận bóng tự nhiên (PBR Shadows)
      group.traverse(function(child) {
        if (child && child.isMesh) {
          if (child.material && child.material.transparent && child.material.opacity < 0.5) {
            child.castShadow = false;
            child.receiveShadow = true;
          } else {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        }
      });

      // Đảm bảo chân thiết bị đặt khít trên mặt bàn Y = 0
      var box = new THREE.Box3().setFromObject(group);
      if (isFinite(box.min.y) && Math.abs(box.min.y) > 0.0005) {
        group.position.y -= box.min.y;
      }

      // Khởi chạy trạng thái đo mặc định ngay khi tạo mô hình
      var initState = {};
      initState[CFG.controlStateKey] = CFG.controlDefault;
      updateEquipmentState(group, initState);

      return group;
    }

    function updateEquipmentState(rootGroup, state) {
      if (!rootGroup || !state) return;
      var rawVal = state[CFG.controlStateKey];
      var val = Number(rawVal !== undefined ? rawVal : CFG.controlDefault);
      if (!isFinite(val)) val = Number(CFG.controlDefault) || 0;

      // Nếu state.isHeating === false trên đèn cồn, đưa nhiệt độ hiển thị về 0 °C (tắt lửa)
      if (CFG.shapeFamily === 'alcohol-burner' && state.isHeating === false && rawVal === undefined) {
        val = 0;
      }

      var minV = Number(CFG.controlMin) || 0;
      var maxV = Number(CFG.controlMax) || 100;
      if (maxV <= minV) maxV = minV + 1;
      var ratio = Math.max(0, Math.min(1, (val - minV) / (maxV - minV)));

      // 1. Quay kim đồng hồ Ampe kế / Vôn kế / Điện kế & Cập nhật số Digital trên mặt đồng hồ
      var needlePivot = rootGroup.getObjectByName('needle_pivot');
      if (needlePivot) {
        // Khi ratio = 0 (bên trái): góc quay Z = +0.30 * PI (+54 deg)
        // Khi ratio = 1 (bên phải): góc quay Z = -0.30 * PI (-54 deg)
        var maxSweepRad = Math.PI * 0.30;
        needlePivot.rotation.z = maxSweepRad * (1 - 2 * ratio);
      }

      var dialFace = rootGroup.getObjectByName('analog_dial_face');
      if (dialFace && dialFace.userData) {
        try {
          if (!dialFace.userData.canvas || typeof dialFace.userData.canvas.getContext !== 'function') {
            var recreatedDialCanvas = document.createElement('canvas');
            recreatedDialCanvas.width = 768;
            recreatedDialCanvas.height = 512;
            dialFace.userData.canvas = recreatedDialCanvas;
            var recreatedDialTex = new THREE.CanvasTexture(recreatedDialCanvas);
            if (THREE.SRGBColorSpace) recreatedDialTex.colorSpace = THREE.SRGBColorSpace;
            dialFace.userData.texture = recreatedDialTex;
            if (dialFace.material) {
              dialFace.material.map = recreatedDialTex;
              dialFace.material.needsUpdate = true;
            }
          }
          drawAnalogMeterFaceCanvas(dialFace.userData.canvas, val);
          if (dialFace.userData.texture) dialFace.userData.texture.needsUpdate = true;
        } catch (e) {}
      }

      // 2. Cập nhật màn hình báo số Digital trên thân thiết bị
      var digitalMesh = rootGroup.getObjectByName('digital_readout_mesh');
      if (digitalMesh && digitalMesh.userData) {
        try {
          if (!digitalMesh.userData.canvas || typeof digitalMesh.userData.canvas.getContext !== 'function') {
            var recreatedLcdCanvas = document.createElement('canvas');
            recreatedLcdCanvas.width = 512;
            recreatedLcdCanvas.height = 160;
            digitalMesh.userData.canvas = recreatedLcdCanvas;
            var recreatedLcdTex = new THREE.CanvasTexture(recreatedLcdCanvas);
            if (THREE.SRGBColorSpace) recreatedLcdTex.colorSpace = THREE.SRGBColorSpace;
            digitalMesh.userData.texture = recreatedLcdTex;
            if (digitalMesh.material) {
              digitalMesh.material.map = recreatedLcdTex;
              digitalMesh.material.needsUpdate = true;
            }
          }
          drawDigitalReadoutCanvas(
            digitalMesh.userData.canvas,
            digitalMesh.userData.title || CFG.nameVi,
            val,
            CFG.controlUnit || ''
          );
          if (digitalMesh.userData.texture) digitalMesh.userData.texture.needsUpdate = true;
        } catch (e) {}
      }

      // 3. Dịch chuyển con chạy Biến trở dọc theo cuộn dây khi thay đổi R (Ω)
      var rheostatSlider = rootGroup.getObjectByName('rheostat_slider');
      if (rheostatSlider) {
        var travel = (rheostatSlider.userData && rheostatSlider.userData.travelWidth) || 0.12;
        rheostatSlider.position.x = (ratio - 0.5) * travel;
      }

      // 4. Thay đổi mực chất lỏng trong Ống nghiệm / Ống đong / Cốc chia độ / Bình tam giác
      var liq = rootGroup.getObjectByName('liquid_column');
      if (liq) {
        if (ratio <= 0.005) {
          liq.visible = false;
        } else {
          liq.visible = true;
          var safeRatio = Math.max(0.02, ratio);
          liq.scale.y = safeRatio;
          var baseY = (liq.userData && liq.userData.baseY) || 0.014;
          var maxH = (liq.userData && liq.userData.maxH) || ((CFG.heightM || 0.20) * 0.65);
          liq.position.y = baseY + (maxH * safeRatio) / 2;
        }
      }

      // 5. Độ dãn lò xo và kim chỉ trên Lực kế
      var plunger = rootGroup.getObjectByName('dynamic_plunger');
      if (plunger) {
        var basePlungerY = (plunger.userData && plunger.userData.baseY) || ((CFG.heightM || 0.24) * 0.40);
        var ext = ratio * ((CFG.heightM || 0.24) * 0.18);
        plunger.position.y = basePlungerY - ext;
      }

      // 6. Xoay thấu kính / tia sáng quang học
      var pivot = rootGroup.getObjectByName('dynamic_pivot');
      if (pivot) {
        pivot.rotation.y = (val * Math.PI) / 180;
      }

      // 7. Điều khiển ngọn lửa Đèn cồn, Nắp chụp dập lửa & Ống nghiệm đun nóng phía trên
      var heatedTube = rootGroup.getObjectByName('heated_test_tube_group');
      if (heatedTube && typeof state.showHeatedTestTube === 'boolean') {
        heatedTube.visible = state.showHeatedTestTube;
      }

      var flameGrp = rootGroup.getObjectByName('alcohol_flame_group');
      var snufferCap = rootGroup.getObjectByName('alcohol_snuffer_cap');
      if (flameGrp) {
        var isBurning = state.isHeating === false ? false : ratio > 0.04;
        flameGrp.visible = isBurning;
        if (isBurning) {
          var flameScale = 0.45 + ratio * 0.75;
          flameGrp.scale.set(0.75 + ratio * 0.35, flameScale, 0.75 + ratio * 0.35);
        }
        if (snufferCap && snufferCap.userData) {
          if (isBurning && snufferCap.userData.openPos) {
            snufferCap.position.set(
              snufferCap.userData.openPos[0],
              snufferCap.userData.openPos[1],
              snufferCap.userData.openPos[2]
            );
            snufferCap.rotation.z = snufferCap.userData.openRotZ || -0.68;
          } else if (!isBurning && snufferCap.userData.cappedPos) {
            snufferCap.position.set(
              snufferCap.userData.cappedPos[0],
              snufferCap.userData.cappedPos[1],
              snufferCap.userData.cappedPos[2]
            );
            snufferCap.rotation.z = 0;
          }
        }
        var boilingBubbles = rootGroup.getObjectByName('boiling_bubbles_group');
        if (boilingBubbles) {
          boilingBubbles.visible = isBurning;
        }
      }
      rootGroup.userData.currentControlValue = val;
    }

    function toggleEquipmentActiveState(rootGroup) {
      if (!rootGroup) return CFG.controlDefault;
      var cur = Number(
        rootGroup.userData && rootGroup.userData.currentControlValue !== undefined
          ? rootGroup.userData.currentControlValue
          : CFG.controlDefault
      );
      var minV = Number(CFG.controlMin) || 0;
      var defV = Number(CFG.controlDefault) || Number(CFG.controlMax) || 100;
      var nextVal = Math.abs(cur - minV) < 0.01 ? defV : minV;
      var nextState = {};
      nextState[CFG.controlStateKey] = nextVal;
      updateEquipmentState(rootGroup, nextState);
      return nextVal;
    }

    window.OL3D_EQUIPMENT_MODULE = {
      buildEquipmentMesh: buildEquipmentGroup,
      buildEquipmentGroup: buildEquipmentGroup,
      updateEquipmentState: updateEquipmentState,
      toggleEquipmentActiveState: toggleEquipmentActiveState,
      applyEquipmentState: function(THREE_LIB, rootObj, instance) {
        updateEquipmentState(rootObj, instance && instance.instanceState ? instance.instanceState : {});
      }
    };
  })();
  </script>
</body>
</html>`;
}

/**
 * Gọi API AI trên Server (/api/equipment/ai-design) để phân tích hình ảnh + thông số
 * và sinh gói thiết kế dụng cụ 3D/HTML hoàn chỉnh.
 */
export async function generateAiEquipmentDesign(
  spec: AiEquipmentInputSpec,
  previousBlueprint?: AiEquipmentBlueprint | null,
): Promise<AiEquipmentDesignResponse> {
  try {
    const response = await fetch('/api/equipment/ai-design', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        spec,
        previousBlueprint: previousBlueprint || undefined,
      }),
    });

    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const data = (await response.json()) as {
        aiOverrides?: Partial<AiEquipmentBlueprint>;
        source?: 'gemini-ai' | 'smart-synthesizer';
      };
      const mergedBlueprint = synthesizeSmartBlueprint(spec, {
        ...(previousBlueprint || {}),
        ...(data.aiOverrides || {}),
        assetId: previousBlueprint?.assetId,
        slug: previousBlueprint?.slug,
      });
      const rawHtmlModule = buildHtmlModuleFromBlueprint(spec, mergedBlueprint);
      return {
        blueprint: mergedBlueprint,
        rawHtmlModule,
        source: data.source || 'gemini-ai',
      };
    }
  } catch {
    // Fallback sang bộ tổng hợp thông minh tại chỗ nếu mạng gián đoạn
  }

  const fallbackBlueprint = synthesizeSmartBlueprint(
    spec,
    previousBlueprint || undefined,
  );
  const rawHtmlModule = buildHtmlModuleFromBlueprint(spec, fallbackBlueprint);
  return {
    blueprint: fallbackBlueprint,
    rawHtmlModule,
    source: 'smart-synthesizer',
  };
}
