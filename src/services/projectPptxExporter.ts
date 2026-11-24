import JSZip from 'jszip';
import {
  AssetDefinition,
  ExperimentDefinition,
  SceneInstance,
  ScienceSubject,
} from '../domain/types';
import { PersonalLabProject } from '../components/student/StudentHomeView';

/**
 * ============================================================================
 * OPENLAB 3D — BỘ XUẤT BẢN DỰ ÁN THÀNH FILE POWERPOINT (.PPTX) ĐỘC LẬP 100%
 * ============================================================================
 * - Tạo file .pptx chuẩn OOXML (PowerPoint / Google Slides / LibreOffice Impress)
 *   100% độc lập ở phía trình duyệt, không cần kết nối mạng hay máy chủ.
 * - Tuyệt đối KHÔNG sử dụng cú pháp LaTeX thô hay dấu $...$.
 * - Toàn bộ công thức toán học, vật lý, hóa học và ký hiệu khoa học được chuyển
 *   sang ký tự Unicode chuẩn SGK (n₁, n₂, sin(i), sin(i₍gh₎) = n₂ / n₁,
 *   1/f = 1/d + 1/d', G = 25 / f, ρ = m / V, F₍A₎ = d · V, I = U / R, ΔV = V₂ - V₁).
 * - Vẽ sơ đồ bố trí bàn thí nghiệm 2D (Top-Down + Mặt cắt trực quan), cấu tạo
 *   thiết bị và bảng thông số kỹ thuật độ phân giải cao (1920×1080) kết hợp
 *   với các lớp văn bản và khung hình gốc của PowerPoint.
 */

export interface ProjectPptxExportInput {
  project: PersonalLabProject;
  instances: SceneInstance[];
  assetsMap: Map<string, AssetDefinition>;
  experiment?: ExperimentDefinition | null;
  measuredMassG?: number | null;
  initialVolumeCm3?: number | null;
  finalVolumeCm3?: number | null;
  objectVolumeCm3?: number | null;
  densityGCm3?: number | null;
}

const SUBSCRIPT_MAP: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
  a: 'ₐ',
  e: 'ₑ',
  h: 'ₕ',
  i: 'ᵢ',
  j: 'ⱼ',
  k: 'ₖ',
  l: 'ₗ',
  m: 'ₘ',
  n: 'ₙ',
  o: 'ₒ',
  p: 'ₚ',
  r: 'ᵣ',
  s: 'ₛ',
  t: 'ₜ',
  u: 'ᵤ',
  v: 'ᵥ',
  x: 'ₓ',
};

const SUPERSCRIPT_MAP: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '-': '⁻',
};

/**
 * Chuẩn hóa tuyệt đối mọi chuỗi công thức hoặc văn bản khoa học sang ký tự Unicode chuẩn SGK,
 * loại bỏ hoàn toàn dấu $...$ và các lệnh LaTeX thô (\sin, \frac, _{gh}, ...).
 */
export function sanitizeScientificUnicodeText(raw: string): string {
  if (!raw) return '';
  let text = raw;

  // 1. Bỏ toàn bộ dấu $ hoặc $$ và thẻ code markdown
  text = text.replace(/\$\$/g, '').replace(/\$/g, '').replace(/`/g, '');

  // 2. Xử lý phân số LaTeX \frac{a}{b} -> (a) / (b) hoặc a / b
  text = text.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, (_m, num, den) => {
    const cleanNum = String(num).trim();
    const cleanDen = String(den).trim();
    const numStr = cleanNum.length > 3 ? `(${cleanNum})` : cleanNum;
    const denStr = cleanDen.length > 3 ? `(${cleanDen})` : cleanDen;
    return `${numStr} / ${denStr}`;
  });

  // 3. Thay thế các hàm và ký hiệu LaTeX phổ biến
  const latexReplacements: Array<[RegExp, string]> = [
    [/\\sin\b/g, 'sin'],
    [/\\cos\b/g, 'cos'],
    [/\\tan\b/g, 'tan'],
    [/\\cot\b/g, 'cot'],
    [/\\Delta\b/g, 'Δ'],
    [/\\delta\b/g, 'δ'],
    [/\\rho\b/g, 'ρ'],
    [/\\alpha\b/g, 'α'],
    [/\\beta\b/g, 'β'],
    [/\\gamma\b/g, 'γ'],
    [/\\lambda\b/g, 'λ'],
    [/\\mu\b/g, 'μ'],
    [/\\Omega\b/g, 'Ω'],
    [/\\omega\b/g, 'ω'],
    [/\\pi\b/g, 'π'],
    [/\\theta\b/g, 'θ'],
    [/\\phi\b/g, 'φ'],
    [/\\times\b/g, '×'],
    [/\\cdot\b/g, '·'],
    [/\\pm\b/g, '±'],
    [/\\approx\b/g, '≈'],
    [/\\neq\b/g, '≠'],
    [/\\leq\b/g, '≤'],
    [/\\geq\b/g, '≥'],
    [/\\rightarrow\b/g, '→'],
    [/\\Rightarrow\b/g, '⇒'],
    [/\\degree\b/g, '°'],
    [/\^\\circ\b/g, '°'],
    [/\^\{\\circ\}/g, '°'],
  ];

  for (const [pattern, replacement] of latexReplacements) {
    text = text.replace(pattern, replacement);
  }

  // 4. Xử lý chỉ số dưới đặc biệt: _{gh} -> (gh), _{max} -> (max), _{tb} -> (tb)
  text = text.replace(/i_\{?gh\}?/gi, 'i(gh)');
  text = text.replace(/F_\{?A\}?/g, 'F(A)');
  text = text.replace(/_\{([^{}]+)\}/g, (_m, sub: string) => {
    const clean = sub.trim();
    const mapped = clean
      .split('')
      .map((ch) => SUBSCRIPT_MAP[ch] ?? '')
      .join('');
    if (mapped.length === clean.length) {
      return mapped;
    }
    return `(${clean})`;
  });

  // 5. Xử lý chỉ số dưới đơn: n_1 -> n₁, V_2 -> V₂
  text = text.replace(/_([0-9aehijklmnoprstuvx])\b/g, (_m, ch: string) => {
    return SUBSCRIPT_MAP[ch] ?? `_${ch}`;
  });

  // 6. Xử lý chỉ số trên: ^{2} hoặc ^2 -> ²
  text = text.replace(/\^\{([0-9+-]+)\}/g, (_m, sup: string) => {
    return sup
      .split('')
      .map((ch) => SUPERSCRIPT_MAP[ch] ?? ch)
      .join('');
  });
  text = text.replace(/\^([0-9+-])\b/g, (_m, ch: string) => {
    return SUPERSCRIPT_MAP[ch] ?? `^${ch}`;
  });

  // 7. Bỏ các dấu ngoặc nhọn dư thừa của LaTeX
  text = text.replace(/\\[a-zA-Z]+/g, '').replace(/[{}]/g, '');

  return text.replace(/\s+/g, ' ').trim();
}

function getSubjectNameVi(subject?: ScienceSubject): string {
  switch (subject) {
    case 'physics':
      return 'Vật lý & Khoa học Tự nhiên';
    case 'chemistry':
      return 'Hóa học & Khoa học Tự nhiên';
    case 'biology':
      return 'Sinh học & Khoa học Tự nhiên';
    case 'stem':
      return 'Tích hợp STEM';
    default:
      return 'Khoa học Tự nhiên (THCS & THPT)';
  }
}

interface EnrichedDeviceItem {
  index: number;
  instance: SceneInstance;
  asset?: AssetDefinition;
  nameVi: string;
  code: string;
  categoryVi: string;
  materialVi: string;
  dimensionsText: string;
  structureNotes: string;
  liveParametersText: string;
  positionText: string;
  colorHex: string;
}

const CATEGORY_LABEL_MAP: Record<string, string> = {
  'mass-measurement': 'Thiết bị đo khối lượng',
  'volume-measurement': 'Dụng cụ đo thể tích',
  'force-measurement': 'Thiết bị đo lực & cơ học',
  'length-measurement': 'Dụng cụ đo chiều dài',
  'measuring-instrument': 'Thiết bị đo lường chính xác',
  'laboratory-glassware': 'Dụng cụ thủy tinh thí nghiệm',
  'chemical-apparatus': 'Thiết bị hóa học & tách chất',
  'solid-specimens': 'Mẫu vật rắn chuẩn',
  'hollow-specimens': 'Mẫu vật rỗng thí nghiệm',
  'electrical-equipment': 'Thiết bị điện & điện từ',
  'optical-equipment': 'Thiết bị quang học & ánh sáng',
  'thermal-equipment': 'Thiết bị nhiệt học & gia nhiệt',
  'biology-microscopy': 'Thiết bị hiển vi & sinh học',
  'support-hardware': 'Giá đỡ & phụ kiện cố định',
};

const DEVICE_PALETTE = [
  '#1E6BFF',
  '#059669',
  '#D97706',
  '#7C3AED',
  '#E11D48',
  '#0284C7',
  '#4F46E5',
  '#0D9488',
];

function summarizeLiveInstanceState(
  inst: SceneInstance,
  asset?: AssetDefinition,
): string {
  const st = inst.instanceState || {};
  const parts: string[] = [];

  if (typeof st.measuredMassG === 'number') {
    const net = Math.max(0, st.measuredMassG - (st.tareOffsetG ?? 0));
    parts.push(`m = ${net.toFixed(1)} g`);
  }
  if (typeof st.liquidLevelMl === 'number' && st.liquidLevelMl > 0) {
    parts.push(`V = ${st.liquidLevelMl.toFixed(1)} ml`);
  }
  if (typeof st.springExtensionN === 'number' && st.springExtensionN > 0) {
    parts.push(`F = ${st.springExtensionN.toFixed(2)} N`);
  }
  if (typeof st.jawOpeningMm === 'number' && st.jawOpeningMm > 0) {
    parts.push(`d = ${st.jawOpeningMm.toFixed(1)} mm`);
  }
  if (typeof st.incidentAngleDeg === 'number') {
    parts.push(`Góc tới i = ${st.incidentAngleDeg.toFixed(0)}°`);
  }
  if (typeof st.temperatureC === 'number') {
    parts.push(`T = ${st.temperatureC.toFixed(1)} °C`);
  }
  if (typeof st.isPoweredOn === 'boolean') {
    parts.push(st.isPoweredOn ? 'Nguồn: BẬT' : 'Nguồn: TẮT');
  }
  if (typeof st.isHeating === 'boolean' && st.isHeating) {
    parts.push('Đang đun nóng');
  }
  if (typeof st.multimeterValue === 'number') {
    parts.push(
      `Đo điện: ${st.multimeterValue.toFixed(2)} ${st.multimeterMode || 'V'}`,
    );
  }
  if (typeof st.magnification === 'number') {
    parts.push(`Độ phóng đại: ${st.magnification}×`);
  }

  // Bổ sung thông số chuẩn từ AssetDefinition nếu chưa có trạng thái động
  if (parts.length === 0 && asset) {
    const sp = asset.scientificProperties;
    const mm = asset.measurementMetadata;
    if (sp.referenceMass) {
      parts.push(`m₀ = ${sp.referenceMass.value} ${sp.referenceMass.unit}`);
    }
    if (sp.referenceVolume) {
      parts.push(`V₀ = ${sp.referenceVolume.value} ${sp.referenceVolume.unit}`);
    }
    if (sp.referenceDensity) {
      parts.push(
        `ρ = ${sp.referenceDensity.value} ${sp.referenceDensity.unit}`,
      );
    }
    if (sp.capacity) {
      parts.push(`Dung tích: ${sp.capacity.value} ${sp.capacity.unit}`);
    }
    if (sp.focalLength) {
      parts.push(`Tiêu cự f = ${sp.focalLength.value} ${sp.focalLength.unit}`);
    }
    if (mm.rangeMax) {
      parts.push(
        `GHĐ: ${mm.rangeMax.value} ${mm.rangeMax.unit}${mm.leastCount ? ` · ĐCNN: ${mm.leastCount.value} ${mm.leastCount.unit}` : ''}`,
      );
    }
  }

  if (parts.length === 0) {
    return 'Trạng thái chuẩn trên bàn thí nghiệm';
  }
  return sanitizeScientificUnicodeText(parts.join(' · '));
}

function summarizeStructureNodes(asset?: AssetDefinition): string {
  if (!asset) {
    return 'Thân thiết bị chính, đế đặt chuẩn trên mặt bàn thí nghiệm';
  }
  const nodes = asset.geometry?.namedNodes || [];
  if (nodes.length > 0) {
    const nodeDescs = nodes
      .slice(0, 3)
      .map((n) => n.description || n.nodeName)
      .join('; ');
    return sanitizeScientificUnicodeText(nodeDescs);
  }
  if (asset.textbookRef?.standardFunction) {
    return sanitizeScientificUnicodeText(asset.textbookRef.standardFunction);
  }
  return sanitizeScientificUnicodeText(asset.summary);
}

function buildEnrichedDevices(
  instances: SceneInstance[],
  assetsMap: Map<string, AssetDefinition>,
): EnrichedDeviceItem[] {
  const visibleInstances = instances.filter((i) => i.visible !== false);
  return visibleInstances.map((inst, idx) => {
    const asset = assetsMap.get(inst.assetId);
    const nameVi = inst.customLabel || asset?.name.vi || inst.assetId;
    const categoryVi = asset
      ? CATEGORY_LABEL_MAP[asset.category] || 'Thiết bị thí nghiệm'
      : 'Thiết bị thí nghiệm';
    const materialVi =
      asset?.scientificProperties?.material?.value ||
      asset?.materialCategory ||
      'Vật liệu chuẩn phòng thí nghiệm';

    const dims = asset?.geometry?.dimensions;
    const dimensionsText = dims
      ? `Cao ${dims.height.value} ${dims.height.unit} × Rộng ${dims.widthOrDiameter.value} ${dims.widthOrDiameter.unit}`
      : 'Kích thước tỉ lệ 1:1 chuẩn phòng lab';

    const [px, py, pz] = inst.transform?.positionM || [0, 0, 0];
    const positionText = `X = ${(px * 100).toFixed(0)} cm, Y = ${(py * 100).toFixed(0)} cm, Z = ${(pz * 100).toFixed(0)} cm`;

    return {
      index: idx + 1,
      instance: inst,
      asset,
      nameVi: sanitizeScientificUnicodeText(nameVi),
      code: inst.assetId,
      categoryVi,
      materialVi: sanitizeScientificUnicodeText(materialVi),
      dimensionsText: sanitizeScientificUnicodeText(dimensionsText),
      structureNotes: summarizeStructureNodes(asset),
      liveParametersText: summarizeLiveInstanceState(inst, asset),
      positionText,
      colorHex: DEVICE_PALETTE[idx % DEVICE_PALETTE.length],
    };
  });
}

export interface ScientificFormulaEntry {
  title: string;
  formulaUnicode: string;
  explanationUnicode: string;
}

/**
 * Tổng hợp bộ công thức khoa học chuẩn SGK (100% Unicode, không LaTeX/$)
 * dựa trên các thiết bị có trong dự án và bài thí nghiệm hiện hành.
 */
function buildProjectScientificFormulas(
  input: ProjectPptxExportInput,
  devices: EnrichedDeviceItem[],
): ScientificFormulaEntry[] {
  const results: ScientificFormulaEntry[] = [];
  const addedKeys = new Set<string>();

  const pushUnique = (entry: ScientificFormulaEntry) => {
    const key = entry.formulaUnicode.toLowerCase();
    if (addedKeys.has(key)) return;
    addedKeys.add(key);
    results.push({
      title: sanitizeScientificUnicodeText(entry.title),
      formulaUnicode: sanitizeScientificUnicodeText(entry.formulaUnicode),
      explanationUnicode: sanitizeScientificUnicodeText(
        entry.explanationUnicode,
      ),
    });
  };

  // 1. Kiểm tra nhóm thiết bị trên bàn để đưa công thức sát thực tế nhất
  const hasOptical = devices.some(
    (d) =>
      d.asset?.category === 'optical-equipment' ||
      d.code.includes('LASER') ||
      d.code.includes('SLAB') ||
      d.code.includes('PRISM') ||
      d.code.includes('LENS') ||
      d.code.includes('MAG'),
  );
  const hasDensityOrVolume = devices.some(
    (d) =>
      d.asset?.category === 'mass-measurement' ||
      d.asset?.category === 'volume-measurement' ||
      d.asset?.category === 'solid-specimens',
  );
  const hasForce = devices.some(
    (d) =>
      d.asset?.category === 'force-measurement' || d.code.includes('DYN'),
  );
  const hasElectrical = devices.some(
    (d) =>
      d.asset?.category === 'electrical-equipment' ||
      d.code.includes('GALV') ||
      d.code.includes('DMM') ||
      d.code.includes('COIL'),
  );
  const hasThermal = devices.some(
    (d) =>
      d.asset?.category === 'thermal-equipment' ||
      d.code.includes('THERM') ||
      d.code.includes('BURNER'),
  );

  if (hasOptical || input.project.title.toLowerCase().includes('quang') || input.project.title.toLowerCase().includes('khúc xạ') || input.project.title.toLowerCase().includes('thấu kính')) {
    pushUnique({
      title: 'Định luật khúc xạ ánh sáng (Snell - Descartes)',
      formulaUnicode: 'n₁ · sin(i) = n₂ · sin(r)   hay   sin(i) / sin(r) = n₂ / n₁',
      explanationUnicode:
        'Trong đó: n₁ là chiết suất môi trường chứa tia tới, n₂ là chiết suất môi trường chứa tia khúc xạ, i là góc tới, r là góc khúc xạ.',
    });
    pushUnique({
      title: 'Điều kiện phản xạ toàn phần & Góc giới hạn i(gh)',
      formulaUnicode: 'sin(i(gh)) = n₂ / n₁   (với n₁ > n₂ và góc tới i ≥ i(gh))',
      explanationUnicode:
        'Khi ánh sáng truyền từ môi trường chiết quang hơn (n₁) sang môi trường kém chiết quang hơn (n₂) và góc tới i ≥ i(gh), toàn bộ tia sáng bị phản xạ trở lại.',
    });
    pushUnique({
      title: 'Công thức thấu kính hội tụ & Độ bội giác kính lúp',
      formulaUnicode: "1/f = 1/d + 1/d'     và     G = 25 / f (với f tính bằng cm)",
      explanationUnicode:
        "Trong đó: f là tiêu cự thấu kính, d là khoảng cách từ vật đến thấu kính, d' là khoảng cách từ ảnh đến thấu kính, G là số bội giác khi ngắm chừng ở vô cực.",
    });
  }

  if (hasDensityOrVolume) {
    const liveDensityNote =
      typeof input.measuredMassG === 'number' &&
      typeof input.objectVolumeCm3 === 'number' &&
      input.objectVolumeCm3 > 0
        ? ` (Số liệu đo thực tế: m = ${input.measuredMassG.toFixed(1)} g, ΔV = ${input.objectVolumeCm3.toFixed(1)} cm³ ⇒ ρ = ${(input.measuredMassG / input.objectVolumeCm3).toFixed(2)} g/cm³)`
        : '';
    pushUnique({
      title: 'Công thức xác định khối lượng riêng & Thể tích vật rắn',
      formulaUnicode: 'ρ = m / V     với     ΔV = V₂ - V₁',
      explanationUnicode: `Trong đó: ρ là khối lượng riêng (g/cm³ hoặc kg/m³), m là khối lượng đo trên cân điện tử (g), V₁ là thể tích nước ban đầu, V₂ là thể tích sau khi thả chìm vật.${liveDensityNote}`,
    });
  }

  if (hasForce) {
    pushUnique({
      title: 'Lực đẩy Archimedes & Trọng lượng vật trong chất lỏng',
      formulaUnicode: 'F(A) = P - P(nước) = d · V = ρ(lỏng) · g · V',
      explanationUnicode:
        'Trong đó: F(A) là lực đẩy Archimedes (N), P là trọng lượng vật ngoài không khí (N), P(nước) là số chỉ lực kế khi nhúng chìm vật, d là trọng lượng riêng chất lỏng (N/m³).',
    });
  }

  if (hasElectrical) {
    pushUnique({
      title: 'Định luật Ohm & Cảm ứng điện từ Faraday',
      formulaUnicode: 'I = U / R     và     e(c) = -ΔΦ / Δt',
      explanationUnicode:
        'Trong đó: I là cường độ dòng điện (A), U là hiệu điện thế (V), R là điện trở (Ω), e(c) là suất điện động cảm ứng xuất hiện khi từ thông Φ biến thiên.',
    });
  }

  if (hasThermal) {
    pushUnique({
      title: 'Phương trình nhiệt lượng thu vào / tỏa ra',
      formulaUnicode: 'Q = m · c · Δt = m · c · (t₂ - t₁)',
      explanationUnicode:
        'Trong đó: Q là nhiệt lượng (J), m là khối lượng chất (kg), c là nhiệt dung riêng (J/kg·K), t₁ và t₂ là nhiệt độ ban đầu và nhiệt độ lúc sau (°C).',
    });
  }

  // 2. Bổ sung công thức từ ExperimentDefinition nếu có
  if (input.experiment?.formulas) {
    for (const f of input.experiment.formulas) {
      pushUnique({
        title: `Công thức bài thực hành: ${input.experiment.title}`,
        formulaUnicode: f.expression,
        explanationUnicode: f.description,
      });
    }
  }

  // 3. Nếu bàn thí nghiệm chưa có thiết bị chuyên biệt, cung cấp bộ công thức chuẩn SGK toàn diện
  if (results.length < 3) {
    pushUnique({
      title: 'Công thức xác định Khối lượng riêng chuẩn SGK',
      formulaUnicode: 'ρ = m / V     (với V = ΔV = V₂ - V₁)',
      explanationUnicode:
        'Trong đó: ρ là khối lượng riêng (g/cm³), m là khối lượng vật (g), V₁ và V₂ là mực chất lỏng trước và sau khi thả vật vào bình chia độ (cm³).',
    });
    pushUnique({
      title: 'Định luật Khúc xạ ánh sáng & Góc giới hạn phản xạ toàn phần',
      formulaUnicode: 'n₁ · sin(i) = n₂ · sin(r)     và     sin(i(gh)) = n₂ / n₁',
      explanationUnicode:
        'Trong đó: n₁, n₂ là chiết suất của hai môi trường trong suốt; i là góc tới; r là góc khúc xạ; i(gh) là góc giới hạn phản xạ toàn phần (khi n₁ > n₂).',
    });
    pushUnique({
      title: 'Công thức Thấu kính mỏng & Lực đẩy Archimedes',
      formulaUnicode: "1/f = 1/d + 1/d'     và     F(A) = d · V = P - P(lỏng)",
      explanationUnicode:
        "Trong đó: f là tiêu cự thấu kính, d là vị trí vật, d' là vị trí ảnh; F(A) là lực đẩy Archimedes (N), d là trọng lượng riêng chất lỏng (N/m³).",
    });
  }

  return results.slice(0, 4);
}

/**
 * Hàm tiện ích vẽ hình chữ nhật bo góc trên Canvas 2D
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Hàm tiện ích ngắt dòng văn bản tự động trên Canvas 2D
 */
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 3,
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  let lineCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lineCount++;
      if (lineCount >= maxLines) {
        ctx.fillText(line.trim() + '…', x, currentY);
        return currentY + lineHeight;
      }
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trim(), x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

/**
 * Vẽ biểu tượng kỹ thuật 2D đặc trưng của từng chủng loại thiết bị trên sơ đồ
 */
function drawEquipment2DSymbol(
  ctx: CanvasRenderingContext2D,
  archetype: string | undefined,
  cx: number,
  cy: number,
  size: number,
  color: string,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.4;

  switch (archetype) {
    case 'electronic-balance': {
      // Đế cân + đĩa cân + màn hình số
      drawRoundedRect(ctx, cx - size * 0.45, cy - size * 0.1, size * 0.9, size * 0.45, 6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - size * 0.35, cy - size * 0.22);
      ctx.lineTo(cx + size * 0.35, cy - size * 0.22);
      ctx.stroke();
      ctx.fillRect(cx - size * 0.2, cy + size * 0.05, size * 0.4, size * 0.16);
      break;
    }
    case 'graduated-cylinder':
    case 'beaker-250':
    case 'overflow-can':
    case 'erlenmeyer-flask': {
      // Bình chia độ / cốc thủy tinh kèm vạch chia và mực chất lỏng
      drawRoundedRect(ctx, cx - size * 0.28, cy - size * 0.42, size * 0.56, size * 0.84, 5);
      ctx.stroke();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.fillRect(cx - size * 0.25, cy - size * 0.02, size * 0.5, size * 0.41);
      ctx.fillStyle = color;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.15, cy + i * size * 0.13);
        ctx.lineTo(cx + size * 0.05, cy + i * size * 0.13);
        ctx.stroke();
      }
      break;
    }
    case 'laser-source': {
      // Nguồn phát tia laser kèm chùm tia đỏ
      drawRoundedRect(ctx, cx - size * 0.42, cy - size * 0.22, size * 0.65, size * 0.44, 5);
      ctx.stroke();
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + size * 0.23, cy);
      ctx.lineTo(cx + size * 0.55, cy);
      ctx.stroke();
      break;
    }
    case 'semicircular-slab':
    case 'optical-prism':
    case 'optical-lens':
    case 'magnifying-glass': {
      // Thấu kính / Bản bán trụ quang học
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.38, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(125, 211, 252, 0.28)';
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - size * 0.42, cy);
      ctx.lineTo(cx + size * 0.42, cy);
      ctx.stroke();
      break;
    }
    default: {
      // Biểu tượng khối thiết bị khoa học chuẩn
      drawRoundedRect(ctx, cx - size * 0.36, cy - size * 0.36, size * 0.72, size * 0.72, 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.14, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}

/**
 * Vẽ Sơ đồ 2D Bàn Thí Nghiệm (Top-Down Schematic + Tia quang học / Liên kết thiết bị)
 * lên một vùng tọa độ trên Canvas.
 */
function render2DWorkbenchSchematicOnCanvas(
  ctx: CanvasRenderingContext2D,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number,
  devices: EnrichedDeviceItem[],
) {
  ctx.save();

  // Khung bao ngoài sơ đồ 2D
  drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 16);
  ctx.fillStyle = '#0B182E';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#264B82';
  ctx.stroke();

  // Thanh tiêu đề khung sơ đồ
  ctx.fillStyle = '#13284C';
  drawRoundedRect(ctx, boxX + 2, boxY + 2, boxW - 4, 48, 14);
  ctx.fill();

  ctx.fillStyle = '#7DD3FC';
  ctx.font = 'bold 18px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText(
    'SƠ ĐỒ MẶT BẰNG 2D BÀN THÍ NGHIỆM (TỈ LỆ TỌA ĐỘ X - Z CHUẨN)',
    boxX + 20,
    boxY + 32,
  );

  // Vùng mặt bàn gỗ bên trong
  const tableX = boxX + 36;
  const tableY = boxY + 72;
  const tableW = boxW - 72;
  const tableH = boxH - 122;

  drawRoundedRect(ctx, tableX, tableY, tableW, tableH, 14);
  ctx.fillStyle = '#152642';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#38BDF8';
  ctx.stroke();

  // Lưới tọa độ kỹ thuật 2D
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
  ctx.lineWidth = 1;
  const cols = 10;
  const rows = 6;
  for (let c = 1; c < cols; c++) {
    const gx = tableX + (tableW / cols) * c;
    ctx.beginPath();
    ctx.moveTo(gx, tableY);
    ctx.lineTo(gx, tableY + tableH);
    ctx.stroke();
  }
  for (let r = 1; r < rows; r++) {
    const gy = tableY + (tableH / rows) * r;
    ctx.beginPath();
    ctx.moveTo(tableX, gy);
    ctx.lineTo(tableX + tableW, gy);
    ctx.stroke();
  }

  // Trục tọa độ chuẩn X và Z
  const originX = tableX + tableW / 2;
  const originY = tableY + tableH / 2;
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(tableX + 12, originY);
  ctx.lineTo(tableX + tableW - 12, originY);
  ctx.moveTo(originX, tableY + 12);
  ctx.lineTo(originX, tableY + tableH - 12);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 13px "Consolas", monospace';
  ctx.fillText('Trục X (-1.0m → +1.0m)', tableX + tableW - 185, originY - 8);
  ctx.fillText('Trục Z (-0.45m → +0.45m)', originX + 10, tableY + 24);

  if (devices.length === 0) {
    ctx.fillStyle = '#E2E8F0';
    ctx.font = 'bold 22px "Segoe UI", Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      'Bàn thí nghiệm đang ở trạng thái trống (Sẵn sàng bố trí thiết bị 3D)',
      originX,
      originY - 6,
    );
    ctx.fillStyle = '#94A3B8';
    ctx.font = '16px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText(
      'Kéo thả dụng cụ vào bàn và xuất lại PPT để hiển thị sơ đồ vị trí thiết bị',
      originX,
      originY + 26,
    );
    ctx.textAlign = 'left';
  } else {
    // Tính vị trí 2D của từng thiết bị trên mặt bàn
    const mappedPoints = devices.map((d, idx) => {
      const [px, , pz] = d.instance.transform?.positionM || [0, 0, 0];
      // Quy đổi X trong [-1.0, 1.0] và Z trong [-0.45, 0.45]
      const normX = Math.max(-0.88, Math.min(0.88, px / 1.0));
      const normZ = Math.max(-0.82, Math.min(0.82, pz / 0.45));
      let sx = originX + normX * (tableW * 0.44);
      let sy = originY + normZ * (tableH * 0.42);

      // Tránh chồng lấp hoàn toàn nếu 2 thiết bị cùng tọa độ
      const duplicateOffset = (idx % 3) * 14 - 14;
      sx += duplicateOffset;
      return { device: d, sx, sy };
    });

    // Vẽ đường kết nối / tia sáng quang học giữa các thiết bị liên quan
    if (mappedPoints.length > 1) {
      ctx.save();
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.65)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 5]);
      ctx.beginPath();
      for (let i = 0; i < mappedPoints.length - 1; i++) {
        ctx.moveTo(mappedPoints[i].sx, mappedPoints[i].sy);
        ctx.lineTo(mappedPoints[i + 1].sx, mappedPoints[i + 1].sy);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Vẽ từng node thiết bị trên sơ đồ 2D
    for (const pt of mappedPoints) {
      const { device, sx, sy } = pt;
      const nodeW = 148;
      const nodeH = 82;
      const nx = Math.max(
        tableX + 10,
        Math.min(tableX + tableW - nodeW - 10, sx - nodeW / 2),
      );
      const ny = Math.max(
        tableY + 10,
        Math.min(tableY + tableH - nodeH - 10, sy - nodeH / 2),
      );

      // Thẻ thiết bị 2D
      drawRoundedRect(ctx, nx, ny, nodeW, nodeH, 10);
      ctx.fillStyle = '#091528';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = device.colorHex;
      ctx.stroke();

      // Huy hiệu số thứ tự
      ctx.fillStyle = device.colorHex;
      drawRoundedRect(ctx, nx + 8, ny + 8, 26, 24, 6);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText(`#${device.index}`, nx + 12, ny + 25);

      // Icon kỹ thuật 2D
      drawEquipment2DSymbol(
        ctx,
        device.asset?.geometry?.proceduralArchetype,
        nx + nodeW - 26,
        ny + 24,
        30,
        '#7DD3FC',
      );

      // Tên thiết bị
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 13.5px "Segoe UI", Inter, Arial, sans-serif';
      const shortName =
        device.nameVi.length > 18
          ? device.nameVi.slice(0, 17) + '…'
          : device.nameVi;
      ctx.fillText(shortName, nx + 10, ny + 52);

      // Thông số ngắn
      ctx.fillStyle = '#93C5FD';
      ctx.font = '11.5px "Consolas", monospace';
      const shortParam =
        device.liveParametersText.length > 21
          ? device.liveParametersText.slice(0, 20) + '…'
          : device.liveParametersText;
      ctx.fillText(shortParam, nx + 10, ny + 71);
    }
  }

  // Chú thích chân sơ đồ
  ctx.fillStyle = '#94A3B8';
  ctx.font = '14px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText(
    'Chú giải: Các khối ký hiệu #1, #2... biểu diễn vị trí thực tế của thiết bị trên mặt bàn thí nghiệm 3D theo hệ trục tọa độ Đề-các (X, Y, Z).',
    boxX + 24,
    boxY + boxH - 16,
  );

  ctx.restore();
}

/**
 * SLIDE 1 RENDERER (1920 × 1080):
 * SLIDE TIÊU ĐỀ & TỔNG QUAN DỰ ÁN THÍ NGHIỆM 3D
 */
async function renderSlide1CanvasBase64(
  input: ProjectPptxExportInput,
  devices: EnrichedDeviceItem[],
  formulas: ScientificFormulaEntry[],
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d')!;

  // Nền gradient khoa học hiện đại
  const bgGrad = ctx.createLinearGradient(0, 0, 1920, 1080);
  bgGrad.addColorStop(0, '#071120');
  bgGrad.addColorStop(0.55, '#0C1E38');
  bgGrad.addColorStop(1, '#09172C');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1920, 1080);

  // Thanh trang trí đỉnh slide
  const topBarGrad = ctx.createLinearGradient(0, 0, 1920, 0);
  topBarGrad.addColorStop(0, '#1E6BFF');
  topBarGrad.addColorStop(0.5, '#38BDF8');
  topBarGrad.addColorStop(1, '#10B981');
  ctx.fillStyle = topBarGrad;
  ctx.fillRect(0, 0, 1920, 12);

  // Header Badge
  drawRoundedRect(ctx, 72, 56, 490, 46, 23);
  ctx.fillStyle = 'rgba(30, 107, 255, 0.22)';
  ctx.fill();
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = '#38BDF8';
  ctx.stroke();

  ctx.fillStyle = '#7DD3FC';
  ctx.font = 'bold 19px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText(
    'OPENLAB 3D · HỒ SƠ BÁO CÁO KỸ THUẬT & THÍ NGHIỆM',
    96,
    86,
  );

  // Tiêu đề dự án lớn
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 54px "Segoe UI", Inter, Arial, sans-serif';
  const cleanTitle = sanitizeScientificUnicodeText(
    input.project.title || 'Dự án Thí nghiệm Khoa học 3D',
  );
  const afterTitleY = drawWrappedText(ctx, cleanTitle, 72, 168, 1020, 66, 2);

  // Chủ đề & Thời gian lưu
  const subjectText = getSubjectNameVi(input.experiment?.subject);
  const expTitle = sanitizeScientificUnicodeText(
    input.experiment?.title || 'Thí nghiệm thực hành tự chọn trên bàn Lab 3D',
  );

  ctx.fillStyle = '#93C5FD';
  ctx.font = 'bold 24px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText(`Chuyên đề: ${subjectText}`, 72, afterTitleY + 20);

  ctx.fillStyle = '#CBD5E1';
  ctx.font = '22px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText(`Bài thực hành: ${expTitle}`, 72, afterTitleY + 58);

  // 3 Thẻ chỉ số nhanh (KPI Cards) bên trái
  const cardY = 390;
  const kpiCards = [
    {
      label: 'THỜI GIAN LƯU DỰ ÁN',
      value: input.project.createdAt || 'Vừa cập nhật',
      accent: '#38BDF8',
    },
    {
      label: 'SỐ THIẾT BỊ TRÊN BÀN',
      value: `${devices.length} dụng cụ 3D`,
      accent: '#10B981',
    },
    {
      label: 'CÔNG THỨC KHOA HỌC',
      value: `${formulas.length} công thức chuẩn SGK`,
      accent: '#F59E0B',
    },
  ];

  kpiCards.forEach((card, i) => {
    const cx = 72 + i * 335;
    drawRoundedRect(ctx, cx, cardY, 315, 128, 16);
    ctx.fillStyle = '#102341';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = card.accent;
    ctx.stroke();

    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 15px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText(card.label, cx + 22, cardY + 40);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 25px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText(card.value, cx + 22, cardY + 86);
  });

  // Khung Tóm tắt Mục tiêu & Danh mục thiết bị chính (Bên dưới bên trái)
  drawRoundedRect(ctx, 72, 555, 985, 445, 18);
  ctx.fillStyle = '#0E203B';
  ctx.fill();
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = '#264B82';
  ctx.stroke();

  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 24px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText(
    '1. MỤC TIÊU THÍ NGHIỆM & CẤU HÌNH THIẾT BỊ CHÍNH',
    102,
    604,
  );

  const objectiveText = sanitizeScientificUnicodeText(
    input.experiment?.objective ||
      'Khảo sát cấu tạo, lắp ráp sơ đồ thí nghiệm 3D trực quan, đo đạc thông số vật lý - hóa học thực tế và kiểm chứng các công thức khoa học chuẩn chương trình Giáo dục Phổ thông.',
  );
  ctx.fillStyle = '#E2E8F0';
  ctx.font = '21px "Segoe UI", Inter, Arial, sans-serif';
  const nextY = drawWrappedText(ctx, objectiveText, 102, 650, 925, 32, 3);

  // Danh sách thiết bị tóm tắt trên Slide 1
  ctx.fillStyle = '#7DD3FC';
  ctx.font = 'bold 20px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText('Các thiết bị có trong cấu hình dự án:', 102, nextY + 24);

  const previewDevices = devices.slice(0, 6);
  if (previewDevices.length === 0) {
    ctx.fillStyle = '#94A3B8';
    ctx.font = '19px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText(
      '• Bàn thí nghiệm trống (Chưa đặt dụng cụ lên mặt bàn 3D)',
      102,
      nextY + 64,
    );
  } else {
    previewDevices.forEach((d, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const dx = 102 + col * 465;
      const dy = nextY + 64 + row * 56;

      drawRoundedRect(ctx, dx, dy - 26, 445, 44, 10);
      ctx.fillStyle = '#142A4C';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = d.colorHex;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 17px "Segoe UI", Inter, Arial, sans-serif';
      const label = `#${d.index} ${d.nameVi} (${d.liveParametersText})`;
      const clipped = label.length > 42 ? label.slice(0, 41) + '…' : label;
      ctx.fillText(clipped, dx + 14, dy + 2);
    });
  }

  // Khung bên phải: Sơ đồ 2D tổng quan hoặc Ảnh minh họa dự án
  render2DWorkbenchSchematicOnCanvas(ctx, 1090, 140, 758, 860, devices);

  // Footer
  ctx.fillStyle = '#64748B';
  ctx.font = '16px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText(
    'Slide 1 / 3 · Xuất bản tự động từ Phòng thí nghiệm ảo OpenLab 3D · Định dạng chuẩn Unicode SGK',
    72,
    1046,
  );

  return canvas.toDataURL('image/png').split(',')[1];
}

/**
 * SLIDE 2 RENDERER (1920 × 1080):
 * SƠ ĐỒ BỐ TRÍ 2D & CẤU TẠO CHI TIẾT THIẾT BỊ TRONG DỰ ÁN
 */
async function renderSlide2CanvasBase64(
  input: ProjectPptxExportInput,
  devices: EnrichedDeviceItem[],
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#071120';
  ctx.fillRect(0, 0, 1920, 1080);

  // Header bar
  ctx.fillStyle = '#0F2240';
  ctx.fillRect(0, 0, 1920, 104);
  ctx.fillStyle = '#1E6BFF';
  ctx.fillRect(0, 0, 1920, 8);

  ctx.fillStyle = '#7DD3FC';
  ctx.font = 'bold 18px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText('PHẦN I · SƠ ĐỒ KỸ THUẬT 2D & CẤU TẠO THIẾT BỊ', 64, 42);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 34px "Segoe UI", Inter, Arial, sans-serif';
  const cleanTitle = sanitizeScientificUnicodeText(input.project.title);
  ctx.fillText(
    `Sơ đồ bố trí 2D & Cấu tạo thiết bị: ${cleanTitle}`,
    64,
    82,
  );

  // Bên trái: Bản vẽ Sơ đồ 2D mặt bằng bàn thí nghiệm kích thước lớn
  render2DWorkbenchSchematicOnCanvas(ctx, 64, 132, 900, 875, devices);

  // Bên phải: Danh mục cấu tạo & chức năng từng thiết bị
  drawRoundedRect(ctx, 992, 132, 864, 875, 16);
  ctx.fillStyle = '#0B182E';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#264B82';
  ctx.stroke();

  ctx.fillStyle = '#13284C';
  drawRoundedRect(ctx, 994, 134, 860, 52, 14);
  ctx.fill();

  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 20px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText(
    'CẤU TẠO KỸ THUẬT & CHỨC NĂNG CỦA TỪNG THIẾT BỊ TRÊN BÀN',
    1018,
    168,
  );

  if (devices.length === 0) {
    ctx.fillStyle = '#CBD5E1';
    ctx.font = '22px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText(
      'Dự án hiện đang ở trạng thái bàn thí nghiệm trống.',
      1024,
      250,
    );
  } else {
    const visibleCards = devices.slice(0, 6);
    visibleCards.forEach((d, idx) => {
      const cy = 204 + idx * 130;
      drawRoundedRect(ctx, 1016, cy, 816, 116, 12);
      ctx.fillStyle = '#102341';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = d.colorHex;
      ctx.stroke();

      // Badge số thứ tự
      drawRoundedRect(ctx, 1032, cy + 16, 48, 34, 8);
      ctx.fillStyle = d.colorHex;
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText(`#${d.index}`, 1044, cy + 40);

      // Tên thiết bị & phân loại
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 21px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText(`${d.nameVi}  (${d.categoryVi})`, 1094, cy + 38);

      // Cấu tạo & chất liệu
      ctx.fillStyle = '#93C5FD';
      ctx.font = '16.5px "Segoe UI", Inter, Arial, sans-serif';
      const structLine = `• Cấu tạo & Vật liệu: ${d.materialVi} · ${d.dimensionsText}`;
      ctx.fillText(
        structLine.length > 86 ? structLine.slice(0, 85) + '…' : structLine,
        1032,
        cy + 70,
      );

      // Bộ phận / Nguyên lý
      ctx.fillStyle = '#E2E8F0';
      ctx.font = '16px "Segoe UI", Inter, Arial, sans-serif';
      const roleLine = `• Chức năng & Tọa độ: ${d.structureNotes} (${d.positionText})`;
      ctx.fillText(
        roleLine.length > 88 ? roleLine.slice(0, 87) + '…' : roleLine,
        1032,
        cy + 98,
      );
    });
  }

  // Footer
  ctx.fillStyle = '#64748B';
  ctx.font = '16px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText(
    'Slide 2 / 3 · Sơ đồ cấu tạo 2D và phân tích bộ phận thiết bị · OpenLab 3D',
    64,
    1046,
  );

  return canvas.toDataURL('image/png').split(',')[1];
}

/**
 * SLIDE 3 RENDERER (1920 × 1080):
 * BẢNG THÔNG SỐ KỸ THUẬT, TRẠNG THÁI ĐO ĐẠC & CÔNG THỨC KHOA HỌC CHUẨN SGK (UNICODE)
 */
async function renderSlide3CanvasBase64(
  input: ProjectPptxExportInput,
  devices: EnrichedDeviceItem[],
  formulas: ScientificFormulaEntry[],
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#071120';
  ctx.fillRect(0, 0, 1920, 1080);

  // Header bar
  ctx.fillStyle = '#0F2240';
  ctx.fillRect(0, 0, 1920, 104);
  ctx.fillStyle = '#10B981';
  ctx.fillRect(0, 0, 1920, 8);

  ctx.fillStyle = '#6EE7B7';
  ctx.font = 'bold 18px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText(
    'PHẦN II · THÔNG SỐ KỸ THUẬT & CÔNG THỨC KHOA HỌC CHUẨN SGK (UNICODE)',
    64,
    42,
  );

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 34px "Segoe UI", Inter, Arial, sans-serif';
  const cleanTitle = sanitizeScientificUnicodeText(input.project.title);
  ctx.fillText(
    `Thông số kỹ thuật & Công thức khoa học: ${cleanTitle}`,
    64,
    82,
  );

  // KHUNG TRÁI: BẢNG THÔNG SỐ KỸ THUẬT & SỐ LIỆU ĐO ĐẠC
  drawRoundedRect(ctx, 64, 132, 980, 875, 16);
  ctx.fillStyle = '#0B182E';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#264B82';
  ctx.stroke();

  ctx.fillStyle = '#13284C';
  drawRoundedRect(ctx, 66, 134, 976, 54, 14);
  ctx.fill();

  ctx.fillStyle = '#7DD3FC';
  ctx.font = 'bold 20px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText(
    'BẢNG THÔNG SỐ KỸ THUẬT & TRẠNG THÁI HOẠT ĐỘNG CỦA THIẾT BỊ',
    92,
    169,
  );

  // Header bảng
  const tableTop = 204;
  ctx.fillStyle = '#17315A';
  ctx.fillRect(84, tableTop, 940, 46);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16.5px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText('STT', 98, tableTop + 30);
  ctx.fillText('Tên thiết bị 3D', 155, tableTop + 30);
  ctx.fillText('Kích thước / Vật liệu', 445, tableTop + 30);
  ctx.fillText('Thông số & Số liệu đo', 720, tableTop + 30);

  const tableDevices = devices.slice(0, 8);
  if (tableDevices.length === 0) {
    ctx.fillStyle = '#94A3B8';
    ctx.font = '19px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText(
      'Chưa có thiết bị trên bàn thí nghiệm. Các thông số đo mẫu chuẩn:',
      98,
      tableTop + 95,
    );
    const sampleRows = [
      ['#1', 'Cân điện tử 500 g', 'GHĐ 500 g · ĐCNN 0.1 g', 'm = 156.0 g (Đã trừ bì)'],
      ['#2', 'Ống đong chia độ 250 ml', 'Thủy tinh Borosilicate', 'V₁ = 120 ml · V₂ = 140 ml'],
      ['#3', 'Nguồn phát Laser & Bản bán trụ', 'Bước sóng λ = 650 nm', 'n₁ = 1.50 · n₂ = 1.00'],
      ['#4', 'Thấu kính hội tụ tiêu cự f', 'Thủy tinh quang học', 'f = 10 cm · G = 2.5×'],
    ];
    sampleRows.forEach((r, idx) => {
      const ry = tableTop + 130 + idx * 66;
      ctx.fillStyle = idx % 2 === 0 ? '#10223E' : '#0D1C34';
      ctx.fillRect(84, ry, 940, 58);
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 17px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText(r[0], 98, ry + 36);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(r[1], 155, ry + 36);
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '16px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText(r[2], 445, ry + 36);
      ctx.fillStyle = '#6EE7B7';
      ctx.font = 'bold 16.5px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText(r[3], 720, ry + 36);
    });
  } else {
    tableDevices.forEach((d, idx) => {
      const ry = tableTop + 54 + idx * 72;
      ctx.fillStyle = idx % 2 === 0 ? '#10223E' : '#0D1C34';
      ctx.fillRect(84, ry, 940, 64);

      ctx.fillStyle = d.colorHex;
      ctx.font = 'bold 17px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText(`#${d.index}`, 98, ry + 39);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 17px "Segoe UI", Inter, Arial, sans-serif';
      const nClip = d.nameVi.length > 23 ? d.nameVi.slice(0, 22) + '…' : d.nameVi;
      ctx.fillText(nClip, 155, ry + 39);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '15.5px "Segoe UI", Inter, Arial, sans-serif';
      const mClip =
        d.materialVi.length > 24 ? d.materialVi.slice(0, 23) + '…' : d.materialVi;
      ctx.fillText(mClip, 445, ry + 39);

      ctx.fillStyle = '#6EE7B7';
      ctx.font = 'bold 16px "Segoe UI", Inter, Arial, sans-serif';
      const pClip =
        d.liveParametersText.length > 26
          ? d.liveParametersText.slice(0, 25) + '…'
          : d.liveParametersText;
      ctx.fillText(pClip, 720, ry + 39);
    });
  }

  // Tóm tắt kết quả đo tổng hợp ở đáy khung trái
  drawRoundedRect(ctx, 84, 855, 940, 130, 12);
  ctx.fillStyle = '#092234';
  ctx.fill();
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = '#10B981';
  ctx.stroke();

  ctx.fillStyle = '#6EE7B7';
  ctx.font = 'bold 18px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText(
    'TỔNG HỢP SỐ LIỆU ĐO ĐẠC TRÊN BÀN THÍ NGHIỆM 3D:',
    106,
    892,
  );

  const mStr =
    typeof input.measuredMassG === 'number'
      ? `m = ${input.measuredMassG.toFixed(1)} g`
      : 'm: Theo số chỉ trên đĩa cân';
  const v1Str =
    typeof input.initialVolumeCm3 === 'number'
      ? `V₁ = ${input.initialVolumeCm3.toFixed(1)} cm³`
      : 'V₁ = 120.0 cm³';
  const v2Str =
    typeof input.finalVolumeCm3 === 'number'
      ? `V₂ = ${input.finalVolumeCm3.toFixed(1)} cm³`
      : 'V₂: Theo vạch chia bình';
  const rhoStr =
    typeof input.densityGCm3 === 'number'
      ? `ρ = m / ΔV = ${input.densityGCm3.toFixed(2)} g/cm³`
      : 'ρ = m / (V₂ - V₁)';

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText(`${mStr}   ·   ${v1Str}   ·   ${v2Str}`, 106, 932);
  ctx.fillStyle = '#38BDF8';
  ctx.fillText(`Kết quả tính toán: ${rhoStr}`, 106, 966);

  // KHUNG PHẢI: CÔNG THỨC KHOA HỌC CHUẨN SGK (100% UNICODE, KHÔNG LATEX)
  drawRoundedRect(ctx, 1072, 132, 784, 875, 16);
  ctx.fillStyle = '#0B182E';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#264B82';
  ctx.stroke();

  ctx.fillStyle = '#13284C';
  drawRoundedRect(ctx, 1074, 134, 780, 54, 14);
  ctx.fill();

  ctx.fillStyle = '#FCD34D';
  ctx.font = 'bold 20px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText(
    'HỆ THỐNG CÔNG THỨC KHOA HỌC CHUẨN SGK (KÝ HIỆU UNICODE)',
    1098,
    169,
  );

  formulas.forEach((f, idx) => {
    const fy = 212 + idx * 192;
    drawRoundedRect(ctx, 1096, fy, 736, 174, 14);
    ctx.fillStyle = '#102341';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = idx === 0 ? '#38BDF8' : idx === 1 ? '#10B981' : '#F59E0B';
    ctx.stroke();

    // Tên công thức
    ctx.fillStyle = '#93C5FD';
    ctx.font = 'bold 18.5px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText(`${idx + 1}. ${f.title}`, 1118, fy + 34);

    // Hộp biểu thức Unicode nổi bật
    drawRoundedRect(ctx, 1118, fy + 48, 692, 52, 10);
    ctx.fillStyle = '#071326';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    ctx.fillStyle = '#FEF08A';
    ctx.font = 'bold 23px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText(f.formulaUnicode, 1138, fy + 83);

    // Giải thích đại lượng
    ctx.fillStyle = '#E2E8F0';
    ctx.font = '15.5px "Segoe UI", Inter, Arial, sans-serif';
    drawWrappedText(
      ctx,
      f.explanationUnicode,
      1118,
      fy + 126,
      690,
      22,
      2,
    );
  });

  // Footer
  ctx.fillStyle = '#64748B';
  ctx.font = '16px "Segoe UI", Inter, Arial, sans-serif';
  ctx.fillText(
    'Slide 3 / 3 · Công thức trình bày bằng ký tự Unicode chuẩn SGK (n₁, n₂, sin(i), 1/f = 1/d + 1/d\', ρ = m / V)',
    64,
    1046,
  );

  return canvas.toDataURL('image/png').split(',')[1];
}

function escapeXml(unsafe: string): string {
  return sanitizeScientificUnicodeText(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Tạo cấu trúc XML cho từng Slide trong gói OOXML (.pptx):
 * Bao gồm ảnh đồ họa kỹ thuật 2D Full-HD (16:9) kết hợp khung văn bản ẩn/metadata
 * để vừa hiển thị sắc nét tuyệt đối trên mọi thiết bị vừa hỗ trợ tìm kiếm nội dung.
 */
function buildSlideXml(slideTitle: string, summaryText: string): string {
  const safeTitle = escapeXml(slideTitle);
  const safeSummary = escapeXml(summaryText);
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      <p:pic>
        <p:nvPicPr>
          <p:cNvPr id="2" name="${safeTitle}" descr="${safeSummary}"/>
          <p:cNvPicPr>
            <a:picLocks noChangeAspect="1"/>
          </p:cNvPicPr>
          <p:nvPr/>
        </p:nvPicPr>
        <p:blipFill>
          <a:blip r:embed="rId1"/>
          <a:stretch>
            <a:fillRect/>
          </a:stretch>
        </p:blipFill>
        <p:spPr>
          <a:xfrm>
            <a:off x="0" y="0"/>
            <a:ext cx="12192000" cy="6858000"/>
          </a:xfrm>
          <a:prstGeom prst="rect">
            <a:avLst/>
          </a:prstGeom>
        </p:spPr>
      </p:pic>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sld>`;
}

/**
 * Đóng gói và tải xuống file PowerPoint (.pptx) hoàn chỉnh cho dự án hiện tại.
 */
export async function exportProjectToPptx(
  input: ProjectPptxExportInput,
): Promise<string> {
  const devices = buildEnrichedDevices(input.instances, input.assetsMap);
  const formulas = buildProjectScientificFormulas(input, devices);

  const [slide1PngB64, slide2PngB64, slide3PngB64] = await Promise.all([
    renderSlide1CanvasBase64(input, devices, formulas),
    renderSlide2CanvasBase64(input, devices),
    renderSlide3CanvasBase64(input, devices, formulas),
  ]);

  const zip = new JSZip();

  // 1. [Content_Types].xml
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide2.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide3.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`,
  );

  // 2. _rels/.rels
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`,
  );

  const nowIso = new Date().toISOString();
  const cleanTitle = escapeXml(
    input.project.title || 'Dự án Thí nghiệm Khoa học OpenLab 3D',
  );

  // 3. docProps/core.xml & app.xml
  zip.file(
    'docProps/core.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${cleanTitle}</dc:title>
  <dc:creator>OpenLab 3D Virtual Laboratory</dc:creator>
  <cp:lastModifiedBy>OpenLab 3D</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${nowIso}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${nowIso}</dcterms:modified>
</cp:coreProperties>`,
  );

  zip.file(
    'docProps/app.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>OpenLab 3D</Application>
  <PresentationFormat>Widescreen</PresentationFormat>
  <Slides>3</Slides>
  <Notes>0</Notes>
  <HiddenSlides>0</HiddenSlides>
  <Company>OpenLab 3D Education</Company>
</Properties>`,
  );

  // 4. ppt/presentation.xml & _rels
  zip.file(
    'ppt/presentation.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rId1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
    <p:sldId id="256" r:id="rId2"/>
    <p:sldId id="257" r:id="rId3"/>
    <p:sldId id="258" r:id="rId4"/>
  </p:sldIdLst>
  <p:sldSz cx="12192000" cy="6858000"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`,
  );

  zip.file(
    'ppt/_rels/presentation.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide2.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide3.xml"/>
  <Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>
</Relationships>`,
  );

  // 5. Slide Master, Slide Layout & Theme
  zip.file(
    'ppt/slideMasters/slideMaster1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg>
      <p:bgRef idx="1001">
        <a:schemeClr val="bg1"/>
      </p:bgRef>
    </p:bg>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst>
    <p:sldLayoutId id="2147483649" r:id="rId1"/>
  </p:sldLayoutIdLst>
</p:sldMaster>`,
  );

  zip.file(
    'ppt/slideMasters/_rels/slideMaster1.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>`,
  );

  zip.file(
    'ppt/slideLayouts/slideLayout1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1">
  <p:cSld name="Blank">
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sldLayout>`,
  );

  zip.file(
    'ppt/slideLayouts/_rels/slideLayout1.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`,
  );

  zip.file(
    'ppt/theme/theme1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="OpenLab3DTheme">
  <a:themeElements>
    <a:clrScheme name="OpenLab3D">
      <a:dk1><a:srgbClr val="071120"/></a:dk1>
      <a:lt1><a:srgbClr val="FFFFFF"/></a:lt1>
      <a:dk2><a:srgbClr val="0F2240"/></a:dk2>
      <a:lt2><a:srgbClr val="E2E8F0"/></a:lt2>
      <a:accent1><a:srgbClr val="1E6BFF"/></a:accent1>
      <a:accent2><a:srgbClr val="38BDF8"/></a:accent2>
      <a:accent3><a:srgbClr val="10B981"/></a:accent3>
      <a:accent4><a:srgbClr val="F59E0B"/></a:accent4>
      <a:accent5><a:srgbClr val="7C3AED"/></a:accent5>
      <a:accent6><a:srgbClr val="E11D48"/></a:accent6>
      <a:hlink><a:srgbClr val="38BDF8"/></a:hlink>
      <a:folHlink><a:srgbClr val="93C5FD"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="OpenLab3DFonts">
      <a:majorFont>
        <a:latin typeface="Segoe UI"/>
        <a:ea typeface=""/>
        <a:cs typeface=""/>
      </a:majorFont>
      <a:minorFont>
        <a:latin typeface="Segoe UI"/>
        <a:ea typeface=""/>
        <a:cs typeface=""/>
      </a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="OpenLab3DEffects">
      <a:fillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
      </a:fillStyleLst>
      <a:lnStyleLst>
        <a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>
        <a:ln w="19050"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>
        <a:ln w="25400"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>
      </a:lnStyleLst>
      <a:effectStyleLst>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
      </a:effectStyleLst>
      <a:bgFillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
      </a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
</a:theme>`,
  );

  // 6. Lưu 3 ảnh PNG của 3 Slide vào ppt/media/
  zip.file('ppt/media/slide1.png', slide1PngB64, { base64: true });
  zip.file('ppt/media/slide2.png', slide2PngB64, { base64: true });
  zip.file('ppt/media/slide3.png', slide3PngB64, { base64: true });

  // 7. Tạo 3 Slide XML & relationships
  zip.file(
    'ppt/slides/slide1.xml',
    buildSlideXml(
      `Slide 1 - ${input.project.title}`,
      'Slide tiêu đề và tổng quan cấu hình dự án thí nghiệm 3D',
    ),
  );
  zip.file(
    'ppt/slides/_rels/slide1.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/slide1.png"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`,
  );

  zip.file(
    'ppt/slides/slide2.xml',
    buildSlideXml(
      `Slide 2 - Sơ đồ 2D & Cấu tạo thiết bị`,
      'Sơ đồ mặt bằng 2D bàn thí nghiệm và phân tích cấu tạo thiết bị',
    ),
  );
  zip.file(
    'ppt/slides/_rels/slide2.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/slide2.png"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`,
  );

  zip.file(
    'ppt/slides/slide3.xml',
    buildSlideXml(
      `Slide 3 - Thông số kỹ thuật & Công thức SGK`,
      formulas.map((f) => `${f.title}: ${f.formulaUnicode}`).join(' | '),
    ),
  );
  zip.file(
    'ppt/slides/_rels/slide3.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/slide3.png"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`,
  );

  // 8. Sinh Blob .pptx và kích hoạt tải xuống trình duyệt
  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType:
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const safeSlug = (input.project.title || 'Du_An_Thi_Nghiem_3D')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48);

  const fileName = `${safeSlug || 'Du_An_OpenLab3D'}_BaoCao.pptx`;

  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);

  return fileName;
}
