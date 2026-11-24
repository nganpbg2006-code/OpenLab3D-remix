import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Lightbulb,
  Calculator,
  Table2,
  X,
  Plus,
  Trash2,
  Play,
  ClipboardList,
  BookOpen,
  ArrowRight,
  Scale,
  Beaker,
  Info,
} from 'lucide-react';
import { AssetDefinition, ExperimentDefinition } from '../../domain/types';

interface StudentBottomPanelsRowProps {
  measuredMassG: number | null;
  initialVolumeCm3: number;
  finalVolumeCm3: number | null;
  objectVolumeCm3: number | null;
  densityGCm3: number | null;
  isDarkMode?: boolean;
  isFullscreen?: boolean;
  showDetailedGuides?: boolean;
  onToggleDetailedGuides?: () => void;
  guidedStep?: 1 | 2 | 3 | 4 | 5;
  onChangeGuidedStep?: (step: 1 | 2 | 3 | 4 | 5) => void;
  onQuickWeighSpecimen?: () => void;
  onQuickSubmergeSpecimen?: () => void;
  selectedAsset?: AssetDefinition | null;
  experiments?: ExperimentDefinition[];
  activeExperiment?: ExperimentDefinition | null;
  onSelectExperiment?: (expId: string) => void;
  onAddAssetToTable?: (assetId: string) => void;
}

type UtilityPanelId = 'suggestions' | 'calculator' | 'data-table';

interface RecordedTrialRow {
  id: string;
  trialNumber: number;
  specimenName: string;
  massG: number;
  v1Ml: number;
  v2Ml: number;
  volumeCm3: number;
  resultValue: number;
  uncertainty: string;
  note: string;
  timestamp: string;
}

interface CalcHistoryItem {
  id: string;
  expression: string;
  result: string;
}

interface ExperimentSuggestionItem {
  id: string;
  title: string;
  category: string;
  difficulty: 'Cơ bản' | 'Thực hành chuẩn' | 'Nâng cao';
  summary: string;
  steps: string[];
  requiredAssetIds: string[];
  actionStep?: 1 | 2 | 3 | 4 | 5;
  actionType?: 'weigh' | 'submerge' | 'place-assets';
}

const EQUIPMENT_CALIBRATION_LOOKUP = [
  {
    code: 'BAL-500G',
    name: 'Cân điện tử hiện số 500g',
    range: '0 – 500 g',
    leastCount: '0,01 g',
    errorLimit: '± 0,01 g',
    note: 'Nhấn TARE về 0,00 trước khi đặt mẫu vật lên đĩa cân',
  },
  {
    code: 'CYL-100ML',
    name: 'Ống đong thủy tinh 100mL',
    range: '0 – 100 mL',
    leastCount: '1,0 mL',
    errorLimit: '± 0,5 mL',
    note: 'Đặt mắt ngang đáy mặt khum lõm của cột chất lỏng',
  },
  {
    code: 'OVF-250ML',
    name: 'Bình tràn thủy tinh 250mL',
    range: '0 – 250 mL',
    leastCount: '1,0 mL (qua cốc hứng)',
    errorLimit: '± 1,0 mL',
    note: 'Đổ nước chạm đúng miệng vòi tràn trước khi thả vật',
  },
  {
    code: 'DYN-5N',
    name: 'Lực kế lò xo 5N',
    range: '0 – 5,0 N',
    leastCount: '0,1 N',
    errorLimit: '± 0,05 N',
    note: 'Chỉnh vạch 0 theo phương thẳng đứng trước khi móc vật',
  },
  {
    code: 'CAL-150MM',
    name: 'Thước cặp du xích 150mm',
    range: '0 – 150 mm',
    leastCount: '0,02 mm',
    errorLimit: '± 0,02 mm',
    note: 'Kẹp nhẹ hàm đo vừa chạm bề mặt mẫu vật, đọc vạch trùng',
  },
  {
    code: 'THM-100C',
    name: 'Nhiệt kế phòng thí nghiệm',
    range: '-10 °C – 110 °C',
    leastCount: '1,0 °C',
    errorLimit: '± 0,5 °C',
    note: 'Bầu nhiệt kế ngập hoàn toàn trong chất lỏng, không chạm đáy cốc',
  },
];

const REFERENCE_MATERIAL_LOOKUP = [
  { name: 'Khối sắt / Thép chuẩn', standardValue: '7,80', tolerance: '± 0,08' },
  { name: 'Khối đồng đỏ nguyên chất', standardValue: '8,96', tolerance: '± 0,05' },
  { name: 'Khối nhôm hợp kim', standardValue: '2,70', tolerance: '± 0,04' },
  { name: 'Đá cuội tự nhiên (Silicat)', standardValue: '2,65', tolerance: '± 0,10' },
  { name: 'Nước cất chuẩn (20 °C)', standardValue: '1,00', tolerance: '± 0,01' },
];

function getSelectedAssetDisplayName(asset?: AssetDefinition | null): string {
  if (!asset) return '';
  if (typeof asset.name === 'string') return asset.name;
  return asset.name?.vi || asset.name?.en || asset.assetId || '';
}

export const StudentBottomPanelsRow: React.FC<StudentBottomPanelsRowProps> = ({
  measuredMassG,
  initialVolumeCm3,
  finalVolumeCm3,
  objectVolumeCm3,
  densityGCm3,
  isDarkMode = true,
  isFullscreen = false,
  onChangeGuidedStep,
  onQuickWeighSpecimen,
  onQuickSubmergeSpecimen,
  selectedAsset,
  onAddAssetToTable,
}) => {
  const [activePanel, setActivePanel] = useState<UtilityPanelId | null>(null);

  const selectedAssetName = getSelectedAssetDisplayName(selectedAsset);
  const safeInitialV = typeof initialVolumeCm3 === 'number' ? initialVolumeCm3 : 50.0;
  const safeFinalV =
    typeof finalVolumeCm3 === 'number' ? finalVolumeCm3 : safeInitialV;

  // Scientific Calculator state
  const [calcExpression, setCalcExpression] = useState<string>('');
  const [calcResult, setCalcResult] = useState<string>('0');
  const [calcNumericResult, setCalcNumericResult] = useState<number>(0);
  const [ansValue, setAnsValue] = useState<number>(0);
  const [angleUnit, setAngleUnit] = useState<'DEG' | 'RAD'>('DEG');
  const [isFractionDisplay, setIsFractionDisplay] = useState<boolean>(false);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [calcHistory, setCalcHistory] = useState<CalcHistoryItem[]>([]);

  // Data Table state
  const [dataTableTab, setDataTableTab] = useState<
    'recorded-trials' | 'equipment-lookup'
  >('recorded-trials');
  const [trialNoteInput, setTrialNoteInput] = useState<string>('');
  const [recordedTrials, setRecordedTrials] = useState<RecordedTrialRow[]>([
    {
      id: 'trial-seed-1',
      trialNumber: 1,
      specimenName: 'Mẫu thử chuẩn #1',
      massG: 156.0,
      v1Ml: 50.0,
      v2Ml: 70.0,
      volumeCm3: 20.0,
      resultValue: 7.8,
      uncertainty: '± 0,05',
      note: 'Đo đối chứng ban đầu',
      timestamp: '08:30',
    },
  ]);

  const sectionRef = useRef<HTMLElement | null>(null);

  const togglePanel = (panel: UtilityPanelId) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  // Đóng popup tiện ích (Gợi ý / Máy tính / Bảng số liệu) khi click ra ngoài hoặc nhấn phím Escape
  useEffect(() => {
    if (!activePanel) return;
    const handlePointerDownOutside = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (target && sectionRef.current && !sectionRef.current.contains(target)) {
        setActivePanel(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePanel(null);
      }
    };
    document.addEventListener('pointerdown', handlePointerDownOutside, true);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePanel]);

  // Curated smart experiment suggestions based on currently selected equipment
  const experimentSuggestions = useMemo<ExperimentSuggestionItem[]>(() => {
    const assetId = selectedAsset?.assetId || '';
    const slug = selectedAsset?.slug || '';
    const lowerName = `${assetId} ${slug} ${selectedAssetName}`.toLowerCase();

    const list: ExperimentSuggestionItem[] = [];

    if (
      lowerName.includes('can') ||
      lowerName.includes('bal') ||
      lowerName.includes('khoi') ||
      lowerName.includes('spc')
    ) {
      list.push({
        id: 'sug-weigh-precision',
        title: 'Cân khối lượng vật rắn & kiểm tra độ lệch Tare',
        category: 'Đo lường cơ học',
        difficulty: 'Cơ bản',
        summary:
          'Sử dụng cân điện tử hiện số để xác định chính xác khối lượng mẫu vật rắn và kiểm chứng chức năng trừ bì (Tare).',
        steps: [
          'Đặt cân điện tử lên mặt bàn phẳng và bấm nút TARE về 0,00.',
          'Gắp mẫu vật đặt nhẹ vào chính giữa đĩa cân.',
          'Đọc số chỉ ổn định và bấm "Ghi lần đo" vào Bảng số liệu.',
        ],
        requiredAssetIds: ['OL3D-EQP-BAL-0001', 'OL3D-EQP-SPC-0001'],
        actionStep: 2,
        actionType: 'weigh',
      });
    }

    if (
      lowerName.includes('ong-dong') ||
      lowerName.includes('cyl') ||
      lowerName.includes('binh-tran') ||
      lowerName.includes('ovf') ||
      lowerName.includes('coc') ||
      lowerName.includes('bkr')
    ) {
      list.push({
        id: 'sug-volume-displacement',
        title: 'Đo thể tích vật rắn không thấm nước bằng phương pháp dâng nước',
        category: 'Thực hành KHTN',
        difficulty: 'Thực hành chuẩn',
        summary:
          'Xác định thể tích mẫu vật có hình dạng bất kỳ thông qua độ chênh lệch mực nước trong ống đong hoặc bình tràn.',
        steps: [
          'Rót nước vào ống đong đến vạch chuẩn ban đầu V₁.',
          'Buộc chỉ thả chìm hoàn toàn mẫu vật vào ống đong để nước dâng lên V₂.',
          'Mở Hỗ trợ máy tính bấm nhanh V₂ - V₁ để tìm thể tích vật.',
        ],
        requiredAssetIds: [
          'OL3D-EQP-CYL-0001',
          'OL3D-EQP-BKR-0001',
          'OL3D-EQP-SPC-0001',
        ],
        actionStep: 3,
        actionType: 'submerge',
      });
    }

    if (lowerName.includes('luc-ke') || lowerName.includes('dyn')) {
      list.push({
        id: 'sug-archimedes-buoyancy',
        title: 'Kiểm chứng lực đẩy Archimedes khi nhúng vật vào chất lỏng',
        category: 'Vật lý · Cơ học chất lưu',
        difficulty: 'Nâng cao',
        summary:
          'Đo trọng lượng P của vật ngoài không khí bằng lực kế 5N, sau đó nhúng chìm vào cốc nước để đo hợp lực F và tính FA = P - F.',
        steps: [
          'Treo mẫu vật vào móc lực kế lò xo 5N để đọc trọng lượng P ngoài không khí.',
          'Hạ từ từ vật ngập vào cốc thủy tinh chứa nước và đọc giá trị F mới.',
          'Ghi cả 2 giá trị vào Bảng số liệu để đối chiếu với trọng lượng phần nước dâng.',
        ],
        requiredAssetIds: [
          'OL3D-EQP-DYN-0001',
          'OL3D-EQP-BKR-0001',
          'OL3D-EQP-SPC-0001',
        ],
        actionType: 'place-assets',
      });
    }

    if (lowerName.includes('slb') || lowerName.includes('ban-tru')) {
      list.push({
        id: 'sug-optics-refraction',
        title: 'Khảo sát khúc xạ ánh sáng & phản xạ toàn phần qua bản bán trụ',
        category: 'Quang học hình học',
        difficulty: 'Thực hành chuẩn',
        summary:
          'Quan sát đường truyền tia sáng qua tâm bản bán trụ thủy tinh trên bảng chia độ 360° để đo góc tới i, góc khúc xạ r và tìm góc giới hạn.',
        steps: [
          'Đặt bản bán trụ thủy tinh kèm thước đo góc 360° lên bàn.',
          'Điều chỉnh góc tới i từ 0° đến 60° (mỗi lần tăng 15°).',
          'Ghi cặp góc (i, r) và dùng Hỗ trợ máy tính kiểm tra tỉ số sin(i)/sin(r).',
        ],
        requiredAssetIds: ['OL3D-EQP-SLB-0001'],
        actionType: 'place-assets',
      });
    }

    if (
      lowerName.includes('nhiet-ke') ||
      lowerName.includes('thm') ||
      lowerName.includes('den-con') ||
      lowerName.includes('htr')
    ) {
      list.push({
        id: 'sug-thermal-heating',
        title: 'Theo dõi đường biểu diễn nhiệt độ khi đun nóng chất lỏng',
        category: 'Nhiệt học & Hóa lý',
        difficulty: 'Thực hành chuẩn',
        summary:
          'Đun nóng nước trong cốc thủy tinh 250mL bằng đèn cồn và ghi nhận sự tăng nhiệt độ theo thời gian qua nhiệt kế phòng thí nghiệm.',
        steps: [
          'Đặt đèn cồn, cốc thủy tinh 250mL và nhiệt kế lên bàn thí nghiệm.',
          'Ghi nhiệt độ ban đầu T₀ của nước ở trạng thái phòng.',
          'Theo dõi mức tăng nhiệt độ sau mỗi phút và lưu vào Bảng số liệu.',
        ],
        requiredAssetIds: [
          'OL3D-EQP-HTR-0001',
          'OL3D-EQP-BKR-0001',
          'OL3D-EQP-THM-0001',
        ],
        actionType: 'place-assets',
      });
    }

    // Universal flagship experiments
    list.push(
      {
        id: 'sug-density-identification',
        title: 'Xác định bản chất kim loại của mẫu vật chưa biết nhãn',
        category: 'Thực hành trọng tâm',
        difficulty: 'Thực hành chuẩn',
        summary:
          'Kết hợp cân khối lượng m và đo thể tích dâng nước V để tính tỉ số m/V, sau đó tra bảng hằng số để nhận diện Sắt, Đồng hay Nhôm.',
        steps: [
          'Bước 1: Đưa mẫu vật lên cân điện tử để lấy giá trị m.',
          'Bước 2: Thả mẫu vật vào ống đong để xác định độ dâng V₂ - V₁.',
          'Bước 3: Mở Bảng số liệu để đối chiếu với bảng chuẩn kim loại.',
        ],
        requiredAssetIds: [
          'OL3D-EQP-BAL-0001',
          'OL3D-EQP-CYL-0001',
          'OL3D-EQP-SPC-0001',
        ],
        actionStep: 2,
        actionType: 'weigh',
      },
      {
        id: 'sug-error-analysis',
        title: 'Đo lặp lại 3 lần để đánh giá sai số ngẫu nhiên của phép đo',
        category: 'Phương pháp thực nghiệm',
        difficulty: 'Nâng cao',
        summary:
          'Thực hiện phép đo tối thiểu 3 lần liên tiếp và ghi vào Bảng số liệu để hệ thống tự động tính giá trị trung bình cộng và độ lệch tuyệt đối.',
        steps: [
          'Thực hiện cân và đo thể tích mẫu vật ở Lần đo 1, bấm "Ghi lần đo vào bảng".',
          'Lặp lại thao tác cho Lần đo 2 và Lần đo 3 với các mẫu hoặc mức nước khác nhau.',
          'Quan sát hàng Tổng hợp Trung bình & Sai số tự động ở cuối Bảng số liệu.',
        ],
        requiredAssetIds: ['OL3D-EQP-BAL-0001', 'OL3D-EQP-OVF-0001'],
        actionStep: 4,
        actionType: 'submerge',
      }
    );

    return list.slice(0, 4);
  }, [selectedAsset, selectedAssetName]);

  // Format decimal number cleanly for scientific lab display
  const formatScientificNumber = (val: number): string => {
    if (!Number.isFinite(val) || Number.isNaN(val)) return '0';
    if (Math.abs(val) < 1e-12) return '0';
    if (
      (Math.abs(val) >= 1e9 || (Math.abs(val) > 0 && Math.abs(val) < 1e-5)) &&
      !Number.isInteger(val)
    ) {
      return val.toExponential(4).replace(/\.?0+e/, 'e');
    }
    const rounded = Number(val.toPrecision(10));
    if (Number.isInteger(rounded)) return String(rounded);
    return rounded.toFixed(6).replace(/\.?0+$/, '');
  };

  // Convert decimal to simplified fraction p/q for S⇔D button (Continued Fractions algorithm)
  const decimalToSimplifiedFraction = (val: number): string | null => {
    if (!Number.isFinite(val) || Number.isNaN(val)) return null;
    if (Number.isInteger(val)) return `${val}/1`;
    const sign = val < 0 ? '-' : '';
    const absVal = Math.abs(val);
    const maxDenominator = 10000;
    const tolerance = 1e-7;

    let h1 = 1;
    let h2 = 0;
    let k1 = 0;
    let k2 = 1;
    let b = absVal;

    for (let i = 0; i < 25; i++) {
      const a = Math.floor(b);
      const h = a * h1 + h2;
      const k = a * k1 + k2;
      if (k > maxDenominator) break;
      h2 = h1;
      h1 = h;
      k2 = k1;
      k1 = k;
      const diff = Math.abs(absVal - h1 / k1);
      if (diff <= tolerance) {
        return `${sign}${h1} / ${k1}`;
      }
      const rem = b - a;
      if (rem < 1e-10) break;
      b = 1 / rem;
    }

    if (k1 > 1 && Math.abs(absVal - h1 / k1) < 1e-4) {
      return `${sign}${h1} / ${k1}`;
    }
    return null;
  };

  // Safe scientific expression compiler & evaluator (supports sin, cos, tan, log, ln, √, π, ^, ×10^, Ans)
  const evaluateExpression = (
    rawExpr: string,
    customAngleUnit: 'DEG' | 'RAD' = angleUnit
  ) => {
    const trimmed = rawExpr.trim();
    if (!trimmed) {
      setCalcResult('0');
      setCalcNumericResult(0);
      setIsFractionDisplay(false);
      setCalcError(null);
      return;
    }

    try {
      let expr = trimmed
        .replace(/×10ˣ/g, '*10**')
        .replace(/×10\^/g, '*10**')
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/,/g, '.')
        .replace(/\bAns\b/gi, `(${ansValue})`);

      // Auto-balance missing closing parentheses at the end of the expression
      const openParens = (expr.match(/\(/g) || []).length;
      const closeParens = (expr.match(/\)/g) || []).length;
      if (closeParens > openParens) {
        setCalcError('Lỗi cú pháp');
        return;
      }
      if (openParens > closeParens) {
        expr += ')'.repeat(openParens - closeParens);
      }

      // Normalize square root symbol: √(x) -> __sqrt(x) and √number -> __sqrt(number)
      expr = expr.replace(/√\s*\(/g, '__sqrt(');
      expr = expr.replace(/√\s*([0-9.]+|\([0-9.+\-*/^]+\)|π)/g, '__sqrt($1)');

      // Insert implicit multiplication before functions, π, or parentheses: e.g. 2π, 2sin(30), 3(4+5), )(
      expr = expr
        .replace(/(\d|\)|π)\s*(?=(sin|cos|tan|log|ln|__sqrt|π|\())/g, '$1*')
        .replace(/π\s*(?=\d)/g, 'π*')
        .replace(/\)\s*(?=\d)/g, ')*');

      // Replace π and scientific functions with safe internal tokens
      expr = expr
        .replace(/π/g, '(Math.PI)')
        .replace(/\bsin\s*\(/g, '__sin(')
        .replace(/\bcos\s*\(/g, '__cos(')
        .replace(/\btan\s*\(/g, '__tan(')
        .replace(/\blog\s*\(/g, '__log(')
        .replace(/\bln\s*\(/g, '__ln(')
        .replace(/\^/g, '**');

      // Validate safe syntax tokens
      const strippedCheck = expr
        .replace(/Math\.PI/g, '')
        .replace(/__(sin|cos|tan|log|ln|sqrt)/g, '');
      if (!/^[0-9+\-*/().\s]+$/.test(strippedCheck)) {
        setCalcError('Lỗi cú pháp');
        return;
      }

      const toRad = (angle: number) =>
        customAngleUnit === 'DEG' ? (angle * Math.PI) / 180 : angle;

      const safeSin = (x: number) => {
        const v = Math.sin(toRad(x));
        return Math.abs(v) < 1e-12 ? 0 : Number(v.toPrecision(12));
      };
      const safeCos = (x: number) => {
        const v = Math.cos(toRad(x));
        return Math.abs(v) < 1e-12 ? 0 : Number(v.toPrecision(12));
      };
      const safeTan = (x: number) => {
        if (customAngleUnit === 'DEG') {
          const mod180 = ((x % 180) + 180) % 180;
          if (Math.abs(mod180 - 90) < 1e-9) {
            throw new Error('Undefined tan(90)');
          }
        }
        const v = Math.tan(toRad(x));
        if (!Number.isFinite(v) || Math.abs(v) > 1e14) {
          throw new Error('Undefined tan');
        }
        return Math.abs(v) < 1e-12 ? 0 : Number(v.toPrecision(12));
      };
      const safeLog10 = (x: number) => {
        if (x <= 0) throw new Error('Invalid log domain');
        return Math.log10(x);
      };
      const safeLn = (x: number) => {
        if (x <= 0) throw new Error('Invalid ln domain');
        return Math.log(x);
      };
      const safeSqrt = (x: number) => {
        if (x < 0) throw new Error('Invalid sqrt domain');
        return Math.sqrt(x);
      };

      // eslint-disable-next-line no-new-func
      const computed = Function(
        '__sin',
        '__cos',
        '__tan',
        '__log',
        '__ln',
        '__sqrt',
        `"use strict"; return (${expr});`
      )(safeSin, safeCos, safeTan, safeLog10, safeLn, safeSqrt);

      if (
        typeof computed !== 'number' ||
        !Number.isFinite(computed) ||
        Number.isNaN(computed)
      ) {
        setCalcError('Lỗi cú pháp');
        return;
      }

      const formatted = formatScientificNumber(computed);

      setCalcNumericResult(computed);
      setAnsValue(computed);
      setCalcResult(formatted);
      setIsFractionDisplay(false);
      setCalcError(null);
      setCalcHistory((prev) => [
        {
          id: `calc-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          expression: trimmed,
          result: formatted,
        },
        ...prev.slice(0, 9),
      ]);
    } catch {
      setCalcError('Lỗi cú pháp');
    }
  };

  const appendToCalc = (token: string) => {
    setCalcError(null);
    setIsFractionDisplay(false);
    setCalcExpression((prev) => `${prev}${token}`);
  };

  // Delete 1 character or trailing function token (DEL)
  const handleDeleteLastCalcToken = () => {
    setCalcError(null);
    setIsFractionDisplay(false);
    setCalcExpression((prev) => {
      if (!prev) return '';
      const compoundTokens = [
        'sin(',
        'cos(',
        'tan(',
        'log(',
        'ln(',
        '√(',
        '×10^',
        'Ans',
        ' ÷ ',
        ' × ',
        ' - ',
        ' + ',
      ];
      for (const tok of compoundTokens) {
        if (prev.endsWith(tok)) {
          return prev.slice(0, -tok.length);
        }
      }
      return prev.slice(0, -1);
    });
  };

  // Toggle sign (±) of current number or expression
  const handleToggleSign = () => {
    setCalcError(null);
    setIsFractionDisplay(false);
    setCalcExpression((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) {
        if (calcNumericResult !== 0) {
          const flipped = -calcNumericResult;
          setCalcNumericResult(flipped);
          setCalcResult(formatScientificNumber(flipped));
          return formatScientificNumber(flipped);
        }
        return '-';
      }
      if (/^-\d+(\.\d+)?$/.test(trimmed)) {
        return trimmed.slice(1);
      }
      if (/^\d+(\.\d+)?$/.test(trimmed)) {
        return `-${trimmed}`;
      }
      if (trimmed.startsWith('-(') && trimmed.endsWith(')')) {
        return trimmed.slice(2, -1);
      }
      return `-(${trimmed})`;
    });
  };

  // Reciprocal 1/x
  const handleReciprocal = () => {
    setCalcError(null);
    setIsFractionDisplay(false);
    setCalcExpression((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) {
        const base = calcNumericResult !== 0 ? formatScientificNumber(calcNumericResult) : 'Ans';
        return `1 ÷ ${base}`;
      }
      if (/^[0-9.]+$|^Ans$|^π$/.test(trimmed)) {
        return `1 ÷ ${trimmed}`;
      }
      return `1 ÷ (${trimmed})`;
    });
  };

  // Toggle standard fraction ⇔ decimal (S⇔D)
  const handleToggleFractionDecimal = () => {
    if (calcError) return;
    if (!isFractionDisplay) {
      const frac = decimalToSimplifiedFraction(calcNumericResult);
      if (frac) {
        setCalcResult(frac);
        setIsFractionDisplay(true);
      }
    } else {
      setCalcResult(formatScientificNumber(calcNumericResult));
      setIsFractionDisplay(false);
    }
  };

  const handleRunQuickFormula = (
    formulaType: 'm_div_v' | 'v2_sub_v1' | 'weight_n'
  ) => {
    const m = measuredMassG ?? 156;
    const v1 = safeInitialV;
    const v2 = safeFinalV > safeInitialV ? safeFinalV : safeInitialV + 20;
    const v =
      objectVolumeCm3 && objectVolumeCm3 > 0 ? objectVolumeCm3 : v2 - v1;

    let expr = '';
    if (formulaType === 'm_div_v') {
      expr = `${m.toFixed(2)} ÷ ${v.toFixed(1)}`;
    } else if (formulaType === 'v2_sub_v1') {
      expr = `${v2.toFixed(1)} - ${v1.toFixed(1)}`;
    } else {
      expr = `(${m.toFixed(2)} ÷ 1000) × 9.8`;
    }
    setCalcExpression(expr);
    evaluateExpression(expr);
  };

  // Record current live measurement into Data Table
  const handleRecordCurrentMeasurement = () => {
    const m = measuredMassG ?? 156.0;
    const v1 = safeInitialV;
    const v2 = safeFinalV > safeInitialV ? safeFinalV : safeInitialV + 20.0;
    const v =
      objectVolumeCm3 && objectVolumeCm3 > 0
        ? objectVolumeCm3
        : Math.max(1, v2 - v1);
    const res =
      activePanel === 'calculator' && calcNumericResult > 0
        ? calcNumericResult
        : densityGCm3 ?? m / v;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const newRow: RecordedTrialRow = {
      id: `trial-${Date.now()}`,
      trialNumber: recordedTrials.length + 1,
      specimenName:
        selectedAssetName || `Mẫu đo lần #${recordedTrials.length + 1}`,
      massG: Number(m.toFixed(2)),
      v1Ml: Number(v1.toFixed(1)),
      v2Ml: Number(v2.toFixed(1)),
      volumeCm3: Number(v.toFixed(1)),
      resultValue: Number(res.toFixed(2)),
      uncertainty: '± 0,04',
      note:
        trialNoteInput.trim() ||
        (activePanel === 'calculator' && calcExpression.trim()
          ? `Máy tính: ${calcExpression.trim()} = ${formatScientificNumber(res)}`
          : 'Đo trực tiếp trên bàn 3D'),
      timestamp: timeStr,
    };

    setRecordedTrials((prev) => [...prev, newRow]);
    setTrialNoteInput('');
  };

  const handleDeleteTrialRow = (id: string) => {
    setRecordedTrials((prev) =>
      prev
        .filter((row) => row.id !== id)
        .map((row, idx) => ({ ...row, trialNumber: idx + 1 }))
    );
  };

  const tableStats = useMemo(() => {
    if (recordedTrials.length === 0) {
      return { avgMass: 0, avgVolume: 0, avgResult: 0, absError: 0 };
    }
    const n = recordedTrials.length;
    const avgMass = recordedTrials.reduce((acc, r) => acc + r.massG, 0) / n;
    const avgVolume =
      recordedTrials.reduce((acc, r) => acc + r.volumeCm3, 0) / n;
    const avgResult =
      recordedTrials.reduce((acc, r) => acc + r.resultValue, 0) / n;
    const absError =
      n > 1
        ? recordedTrials.reduce(
            (acc, r) => acc + Math.abs(r.resultValue - avgResult),
            0
          ) / n
        : 0.04;
    return { avgMass, avgVolume, avgResult, absError };
  }, [recordedTrials]);

  return (
    <section
      ref={sectionRef}
      className={
        isFullscreen
          ? `
            absolute right-3 bottom-2.5 z-50 rounded-xl border px-2 py-1
            shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-md
            transition-all duration-200 select-none
            ${
              isDarkMode
                ? 'border-white/25 bg-[#081528]/78 text-[#F1F5F9]'
                : 'border-slate-300/80 bg-white/85 text-slate-800'
            }
          `
          : `
            relative z-40 shrink-0 border-t transition-colors duration-200
            select-none
            ${
              isDarkMode
                ? 'border-[#1E2D45] bg-[#0B1220]/95 text-[#F1F5F9]'
                : 'border-slate-200 bg-white/95 text-slate-800'
            }
          `
      }
    >
      {/* =====================================================================
          1. COMPACT BOTTOM QUICK-UTILITY TOOLBAR (CLEAN, UNOBTRUSIVE, COMPACT)
         ===================================================================== */}
      <div
        className={
          isFullscreen
            ? 'flex items-center gap-1.5'
            : `
              mx-auto flex h-[36px] max-w-[1600px] items-center
              justify-between gap-2 px-3
            `
        }
      >
        {/* Left: Subtle context label (hidden in fullscreen so dock stays ultra-compact) */}
        <div
          className={
            isFullscreen ? 'hidden' : 'hidden items-center gap-2 sm:flex'
          }
        >
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span
            className={`text-[11px] font-semibold ${
              isDarkMode ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            Tiện ích thực hành
          </span>
          {selectedAssetName && (
            <span
              className={`hidden max-w-[220px] truncate rounded border px-1.5 py-0.5 text-[10.5px] md:inline-block ${
                isDarkMode
                  ? 'border-slate-700/80 bg-slate-800/70 text-slate-300'
                  : 'border-slate-200 bg-slate-100 text-slate-700'
              }`}
            >
              Đang chọn:{' '}
              <strong className={isDarkMode ? 'text-sky-300' : 'text-sky-700'}>
                {selectedAssetName}
              </strong>
            </span>
          )}
        </div>

        {/* Center / Main: The 3 Smart Utility Buttons (button:nth-of-type(1..3)) */}
        <div className="flex flex-1 items-center justify-center gap-1.5 sm:flex-initial">
          {/* 1. 💡 Gợi ý thí nghiệm */}
          <button
            type="button"
            onClick={() => togglePanel('suggestions')}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-all duration-150 ${
              activePanel === 'suggestions'
                ? 'border-amber-400 bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                : isDarkMode
                  ? 'border-slate-700/90 bg-[#131F36]/90 text-slate-100 hover:border-amber-400/50 hover:bg-[#192846] hover:text-amber-300'
                  : 'border-slate-200 bg-slate-100 text-slate-800 hover:border-amber-400 hover:bg-amber-50'
            }`}
          >
            <span className="text-xs leading-none" aria-hidden="true">
              💡
            </span>
            <span>Gợi ý thí nghiệm</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[9.5px] font-extrabold ${
                activePanel === 'suggestions'
                  ? 'bg-slate-950/20 text-slate-950'
                  : isDarkMode
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-amber-200/80 text-amber-900'
              }`}
            >
              {experimentSuggestions.length}
            </span>
          </button>

          {/* 2. 🧮 Hỗ trợ máy tính (Calculator) */}
          <button
            type="button"
            onClick={() => togglePanel('calculator')}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-all duration-150 ${
              activePanel === 'calculator'
                ? 'border-sky-400 bg-sky-500 text-slate-950 shadow-[0_0_12px_rgba(14,165,233,0.35)]'
                : isDarkMode
                  ? 'border-slate-700/90 bg-[#131F36]/90 text-slate-100 hover:border-sky-400/50 hover:bg-[#192846] hover:text-sky-300'
                  : 'border-slate-200 bg-slate-100 text-slate-800 hover:border-sky-400 hover:bg-sky-50'
            }`}
          >
            <span className="text-xs leading-none" aria-hidden="true">
              🧮
            </span>
            <span>Hỗ trợ máy tính</span>
            {calcResult !== '0' && (
              <span
                className={`rounded px-1 py-0.2 font-mono text-[9.5px] font-bold ${
                  activePanel === 'calculator'
                    ? 'bg-slate-950/20 text-slate-950'
                    : isDarkMode
                      ? 'bg-sky-500/20 text-sky-300'
                      : 'bg-sky-200/80 text-sky-900'
                }`}
              >
                = {calcResult}
              </span>
            )}
          </button>

          {/* 3. 📊 Bảng số liệu (Data Table) */}
          <button
            type="button"
            onClick={() => togglePanel('data-table')}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-all duration-150 ${
              activePanel === 'data-table'
                ? 'border-emerald-400 bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                : isDarkMode
                  ? 'border-slate-700/90 bg-[#131F36]/90 text-slate-100 hover:border-emerald-400/50 hover:bg-[#192846] hover:text-emerald-300'
                  : 'border-slate-200 bg-slate-100 text-slate-800 hover:border-emerald-400 hover:bg-emerald-50'
            }`}
          >
            <span className="text-xs leading-none" aria-hidden="true">
              📊
            </span>
            <span>Bảng số liệu</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[9.5px] font-extrabold ${
                activePanel === 'data-table'
                  ? 'bg-slate-950/20 text-slate-950'
                  : isDarkMode
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-emerald-200/80 text-emerald-900'
              }`}
            >
              {recordedTrials.length}
            </span>
          </button>
        </div>

        {/* Right: Quick status or collapse button */}
        <div
          className={
            isFullscreen
              ? activePanel
                ? 'flex items-center'
                : 'hidden'
              : 'hidden items-center gap-2 lg:flex'
          }
        >
          {activePanel ? (
            <button
              type="button"
              onClick={() => setActivePanel(null)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[10.5px] font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              <X size={11} />
              <span>Đóng</span>
            </button>
          ) : (
            <span className="text-[10.5px] text-slate-400">
              Chọn công cụ để mở nhanh bảng hỗ trợ
            </span>
          )}
        </div>
      </div>

      {/* =====================================================================
          2. FLOATING COMPACT POPOVER PANEL (EXPANDED WIDTH FOR SCIENTIFIC CALCULATOR)
         ===================================================================== */}
      {activePanel && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`
            absolute bottom-full z-[65] mb-1.5 overflow-y-auto rounded-2xl border
            shadow-2xl backdrop-blur-xl transition-all duration-200
            ${
              activePanel === 'calculator'
                ? isFullscreen
                  ? 'right-0 w-[min(calc(100vw-24px),980px)] max-h-[min(68vh,480px)]'
                  : 'left-1/2 -translate-x-1/2 w-[min(calc(100%-16px),1020px)] max-w-[calc(100vw-24px)] max-h-[min(68vh,480px)]'
                : isFullscreen
                  ? 'right-0 w-[min(calc(100vw-24px),680px)] max-h-[min(52vh,380px)]'
                  : 'left-1/2 -translate-x-1/2 w-[min(calc(100%-16px),760px)] max-w-[calc(100vw-24px)] max-h-[min(52vh,380px)]'
            }
            ${
              isDarkMode
                ? 'border-sky-500/35 bg-[#0f172a]/98 text-slate-100'
                : 'border-slate-300 bg-white/95 text-slate-800'
            }
          `}
        >
          {/* 1. 💡 GỢI Ý THÍ NGHIỆM (EXPERIMENT SUGGESTIONS) */}
          {activePanel === 'suggestions' && (
            <div className="px-3.5 py-3">
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/50 pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 ring-1 ring-amber-400/30">
                    <Lightbulb size={14} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[11.5px] font-extrabold uppercase tracking-wider text-amber-300">
                        Gợi ý kịch bản thực hành & Ý tưởng thí nghiệm
                      </h3>
                      {selectedAssetName && (
                        <span className="rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-sky-300 ring-1 ring-sky-400/30">
                          {selectedAssetName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActivePanel(null)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/90 px-2 py-0.5 text-[11px] font-bold text-slate-300 transition hover:border-rose-500/50 hover:bg-rose-950/60 hover:text-rose-200"
                >
                  <X size={12} />
                  <span>Đóng</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {experimentSuggestions.map((item) => (
                  <div
                    key={item.id}
                    className={`flex flex-col justify-between rounded-xl border p-2.5 transition ${
                      isDarkMode
                        ? 'border-slate-800 bg-[#111C30]/90 hover:border-amber-400/40'
                        : 'border-slate-200 bg-white hover:border-amber-500/50'
                    }`}
                  >
                    <div>
                      <div className="mb-1 flex items-center justify-between gap-1.5">
                        <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[9.5px] font-bold text-amber-300">
                          {item.category}
                        </span>
                        <span className="text-[9.5px] font-semibold text-slate-400">
                          {item.difficulty}
                        </span>
                      </div>
                      <h4
                        className={`mb-1 text-[11.5px] font-bold leading-snug ${
                          isDarkMode ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {item.title}
                      </h4>
                      <p className="mb-2 text-[10.5px] leading-relaxed text-slate-400">
                        {item.summary}
                      </p>

                      <ul className="mb-2.5 space-y-1 border-t border-slate-800/80 pt-1.5">
                        {item.steps.map((st, idx) => (
                          <li
                            key={idx}
                            className={`flex items-start gap-1.5 text-[10.5px] ${
                              isDarkMode ? 'text-slate-300' : 'text-slate-600'
                            }`}
                          >
                            <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-[9px] font-bold text-sky-400">
                              {idx + 1}
                            </span>
                            <span className="leading-tight">{st}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (item.actionType === 'weigh') {
                            onQuickWeighSpecimen?.();
                          } else if (item.actionType === 'submerge') {
                            onQuickSubmergeSpecimen?.();
                          } else if (
                            onAddAssetToTable &&
                            item.requiredAssetIds.length > 0
                          ) {
                            item.requiredAssetIds.forEach((id) =>
                              onAddAssetToTable(id)
                            );
                          } else if (item.actionStep && onChangeGuidedStep) {
                            onChangeGuidedStep(item.actionStep);
                          }
                        }}
                        className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-1 text-[10.5px] font-bold text-slate-950 shadow-sm transition hover:brightness-110"
                      >
                        <Play size={11} className="fill-current" />
                        <span>Áp dụng kịch bản</span>
                      </button>

                      {onAddAssetToTable && item.requiredAssetIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            item.requiredAssetIds.forEach((id) =>
                              onAddAssetToTable(id)
                            );
                          }}
                          title="Đặt bộ dụng cụ gợi ý lên bàn 3D"
                          className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-700 bg-slate-800/90 px-2 py-1 text-[10.5px] font-semibold text-slate-200 transition hover:border-sky-400/50 hover:text-sky-300"
                        >
                          + Dụng cụ
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. 🧮 MÁY TÍNH KHOA HỌC THÍ NGHIỆM CHUẨN (SCIENTIFIC CALCULATOR) */}
          {activePanel === 'calculator' && (
            <div className="bg-[#0f172a] px-4 py-3.5 text-slate-100">
              {/* Header */}
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#334155] pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563eb]/20 text-sky-400 ring-1 ring-sky-400/40">
                    <Calculator size={15} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-sky-300">
                      Máy tính khoa học thí nghiệm chuẩn (Scientific Calculator)
                    </h3>
                    <span className="rounded-md border border-[#334155] bg-[#1e293b] px-2 py-0.5 font-mono text-[10px] font-bold text-slate-300">
                      fx-OPENLAB 3D
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Chuyển đổi hệ đơn vị góc DEG / RAD */}
                  <div className="inline-flex items-center rounded-lg border border-[#334155] bg-[#1e293b] p-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setAngleUnit('DEG');
                        if (calcExpression.trim()) {
                          evaluateExpression(calcExpression, 'DEG');
                        }
                      }}
                      className={`cursor-pointer rounded-md px-2 py-0.5 font-mono text-[10px] font-extrabold transition ${
                        angleUnit === 'DEG'
                          ? 'bg-[#2563eb] text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="Đơn vị góc: Độ (Degree)"
                    >
                      DEG
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAngleUnit('RAD');
                        if (calcExpression.trim()) {
                          evaluateExpression(calcExpression, 'RAD');
                        }
                      }}
                      className={`cursor-pointer rounded-md px-2 py-0.5 font-mono text-[10px] font-extrabold transition ${
                        angleUnit === 'RAD'
                          ? 'bg-[#2563eb] text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="Đơn vị góc: Radian"
                    >
                      RAD
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActivePanel(null)}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#334155] bg-[#1e293b] px-2.5 py-1 text-[11px] font-bold text-slate-300 transition hover:border-[#ef4444]/60 hover:bg-[#ef4444]/20 hover:text-rose-200"
                  >
                    <X size={12} />
                    <span>Đóng</span>
                  </button>
                </div>
              </div>

              {/* 3-Column Scientific Calculator Body */}
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
                {/* CỘT TRÁI (4/12): MÀN HÌNH + CHÈN NHANH SỐ LIỆU ĐANG ĐO TRÊN BÀN 3D */}
                <div className="flex flex-col justify-between rounded-xl border border-[#334155] bg-[#1e293b]/90 p-3 lg:col-span-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Màn hình tính toán
                        </span>
                        <span className="rounded bg-[#0f172a] px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-sky-400 border border-[#334155]">
                          {angleUnit}
                        </span>
                        {isFractionDisplay && (
                          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-amber-300 border border-amber-400/40">
                            a/b
                          </span>
                        )}
                      </div>

                      {calcError ? (
                        <span className="rounded bg-[#ef4444]/20 px-1.5 py-0.5 text-[10.5px] font-bold text-rose-400 border border-[#ef4444]/40">
                          {calcError}
                        </span>
                      ) : (
                        <span className="text-[10.5px] font-mono font-semibold text-emerald-400">
                          Ans = {formatScientificNumber(ansValue)}
                        </span>
                      )}
                    </div>

                    {/* Natural Textbook Display Screen */}
                    <div className="mb-3 rounded-xl border border-[#334155] bg-[#0f172a] p-2.5 shadow-inner">
                      <input
                        type="text"
                        value={calcExpression}
                        onChange={(e) => {
                          setCalcError(null);
                          setIsFractionDisplay(false);
                          setCalcExpression(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            evaluateExpression(calcExpression);
                          }
                        }}
                        placeholder="Nhập biểu thức (VD: sin(30) + √(25) hoặc 156 ÷ 20)..."
                        className="w-full bg-transparent font-mono text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                      />
                      <div className="mt-2 flex items-baseline justify-between border-t border-[#1e293b] pt-1.5">
                        <span className="text-[11px] font-semibold text-slate-400">
                          Kết quả =
                        </span>
                        <span
                          className={`font-mono text-xl font-extrabold tracking-tight ${
                            calcError ? 'text-rose-400' : 'text-sky-300'
                          }`}
                        >
                          {calcError ? 'Lỗi cú pháp' : calcResult}
                        </span>
                      </div>
                    </div>

                    {/* CHÈN NHANH SỐ LIỆU ĐANG ĐO TRÊN BÀN 3D */}
                    <div className="mb-2.5">
                      <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                        Chèn nhanh số liệu đang đo trên bàn 3D:
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            appendToCalc(
                              measuredMassG !== null
                                ? measuredMassG.toFixed(2)
                                : '156'
                            )
                          }
                          className="inline-flex cursor-pointer items-center justify-between gap-1 rounded-lg border border-sky-500/35 bg-[#0f172a] px-2.5 py-1.5 text-[11px] font-semibold text-sky-300 transition hover:border-sky-400 hover:bg-sky-500/15"
                        >
                          <span className="inline-flex items-center gap-1">
                            <Scale size={11} />
                            <span>m</span>
                          </span>
                          <span className="font-mono font-bold">
                            {measuredMassG !== null
                              ? measuredMassG.toFixed(2)
                              : '156.00'}{' '}
                            g
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => appendToCalc(safeInitialV.toFixed(1))}
                          className="inline-flex cursor-pointer items-center justify-between gap-1 rounded-lg border border-indigo-500/35 bg-[#0f172a] px-2.5 py-1.5 text-[11px] font-semibold text-indigo-300 transition hover:border-indigo-400 hover:bg-indigo-500/15"
                        >
                          <span className="inline-flex items-center gap-1">
                            <Beaker size={11} />
                            <span>V₁</span>
                          </span>
                          <span className="font-mono font-bold">
                            {safeInitialV.toFixed(1)}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => appendToCalc(safeFinalV.toFixed(1))}
                          className="inline-flex cursor-pointer items-center justify-between gap-1 rounded-lg border border-violet-500/35 bg-[#0f172a] px-2.5 py-1.5 text-[11px] font-semibold text-violet-300 transition hover:border-violet-400 hover:bg-violet-500/15"
                        >
                          <span className="inline-flex items-center gap-1">
                            <Beaker size={11} />
                            <span>V₂</span>
                          </span>
                          <span className="font-mono font-bold">
                            {safeFinalV.toFixed(1)}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            appendToCalc(
                              objectVolumeCm3 !== null
                                ? objectVolumeCm3.toFixed(1)
                                : '20.0'
                            )
                          }
                          className="inline-flex cursor-pointer items-center justify-between gap-1 rounded-lg border border-emerald-500/35 bg-[#0f172a] px-2.5 py-1.5 text-[11px] font-semibold text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-500/15"
                        >
                          <span>ΔV</span>
                          <span className="font-mono font-bold">
                            {objectVolumeCm3 !== null
                              ? objectVolumeCm3.toFixed(1)
                              : '20.0'}{' '}
                            cm³
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Nút tính nhanh 1 chạm */}
                  <div className="space-y-1.5 border-t border-[#334155] pt-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Công thức thực nghiệm tính nhanh:
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleRunQuickFormula('v2_sub_v1')}
                        className="cursor-pointer rounded-lg border border-[#334155] bg-[#0f172a] px-2.5 py-1.5 text-[11px] font-bold text-slate-200 transition hover:border-sky-400 hover:bg-[#2563eb]/20 hover:text-sky-200"
                      >
                        Tính độ dâng (V2 - V1)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRunQuickFormula('m_div_v')}
                        className="cursor-pointer rounded-lg border border-[#334155] bg-[#0f172a] px-2.5 py-1.5 text-[11px] font-bold text-slate-200 transition hover:border-sky-400 hover:bg-[#2563eb]/20 hover:text-sky-200"
                      >
                        Tính tỉ số (m ÷ V)
                      </button>
                    </div>
                  </div>
                </div>

                {/* CỘT GIỮA (5/12): BÀN PHÍM KHOA HỌC 6 CỘT × 6 HÀNG CHUẨN */}
                <div className="grid grid-cols-6 gap-1.5 rounded-xl border border-[#334155] bg-[#1e293b] p-3 lg:col-span-5">
                  {/* Hàng 1 (Hàm & Lệnh): sin | cos | tan | π | AC (đỏ) | DEL */}
                  <button
                    type="button"
                    onClick={() => appendToCalc('sin(')}
                    className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-[#334155] bg-[#0f172a] font-mono text-xs font-bold text-sky-300 transition hover:border-sky-400/60 hover:bg-[#334155]"
                  >
                    sin
                  </button>
                  <button
                    type="button"
                    onClick={() => appendToCalc('cos(')}
                    className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-[#334155] bg-[#0f172a] font-mono text-xs font-bold text-sky-300 transition hover:border-sky-400/60 hover:bg-[#334155]"
                  >
                    cos
                  </button>
                  <button
                    type="button"
                    onClick={() => appendToCalc('tan(')}
                    className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-[#334155] bg-[#0f172a] font-mono text-xs font-bold text-sky-300 transition hover:border-sky-400/60 hover:bg-[#334155]"
                  >
                    tan
                  </button>
                  <button
                    type="button"
                    onClick={() => appendToCalc('π')}
                    className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-[#334155] bg-[#0f172a] font-mono text-xs font-bold text-amber-300 transition hover:border-amber-400/60 hover:bg-[#334155]"
                  >
                    π
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCalcExpression('');
                      setCalcResult('0');
                      setCalcNumericResult(0);
                      setIsFractionDisplay(false);
                      setCalcError(null);
                    }}
                    title="Xóa toàn bộ màn hình (All Clear)"
                    className="flex h-9 cursor-pointer items-center justify-center rounded-lg bg-[#ef4444] font-mono text-xs font-extrabold text-white shadow-xs transition hover:bg-red-600"
                  >
                    AC
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteLastCalcToken}
                    title="Xóa 1 ký tự cuối (Delete)"
                    className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-rose-500/40 bg-rose-500/15 font-mono text-xs font-extrabold text-rose-300 transition hover:bg-rose-500/30"
                  >
                    DEL
                  </button>

                  {/* Hàng 2 (Lũy thừa & Căn): √ | x² | xʸ | log | ln | ÷ */}
                  <button
                    type="button"
                    onClick={() => appendToCalc('√(')}
                    className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-[#334155] bg-[#0f172a] font-mono text-xs font-bold text-sky-300 transition hover:border-sky-400/60 hover:bg-[#334155]"
                  >
                    √
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      appendToCalc(calcExpression.trim() ? '^2' : 'Ans^2')
                    }
                    className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-[#334155] bg-[#0f172a] font-mono text-xs font-bold text-sky-300 transition hover:border-sky-400/60 hover:bg-[#334155]"
                  >
                    x²
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      appendToCalc(calcExpression.trim() ? '^' : 'Ans^')
                    }
                    className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-[#334155] bg-[#0f172a] font-mono text-xs font-bold text-sky-300 transition hover:border-sky-400/60 hover:bg-[#334155]"
                  >
                    xʸ
                  </button>
                  <button
                    type="button"
                    onClick={() => appendToCalc('log(')}
                    className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-[#334155] bg-[#0f172a] font-mono text-xs font-bold text-sky-300 transition hover:border-sky-400/60 hover:bg-[#334155]"
                  >
                    log
                  </button>
                  <button
                    type="button"
                    onClick={() => appendToCalc('ln(')}
                    className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-[#334155] bg-[#0f172a] font-mono text-xs font-bold text-sky-300 transition hover:border-sky-400/60 hover:bg-[#334155]"
                  >
                    ln
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      appendToCalc(calcExpression.trim() ? ' ÷ ' : 'Ans ÷ ')
                    }
                    className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-sky-500/40 bg-[#2563eb]/20 font-mono text-sm font-extrabold text-sky-300 transition hover:bg-[#2563eb]/35"
                  >
                    ÷
                  </button>

                  {/* Hàng 3 (Số & Ngoặc): 7 | 8 | 9 | ( | ) | × */}
                  {['7', '8', '9'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => appendToCalc(num)}
                      className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-[#334155] bg-[#334155]/80 font-mono text-xs font-extrabold text-white transition hover:bg-[#475569]"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => appendToCalc('(')}
                    className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-[#334155] bg-[#0f172a] font-mono text-xs font-bold text-slate-200 transition hover:bg-[#334155]"
                  >
                    (
                  </button>
                  <button
                    type="button"
                    onClick={() => appendToCalc(')')}
                    className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-[#334155] bg-[#0f172a] font-mono text-xs font-bold text-slate-200 transition hover:bg-[#334155]"
                  >
                    )
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      appendToCalc(calcExpression.trim() ? ' × ' : 'Ans × ')
                    }
                    className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-sky-500/40 bg-[#2563eb]/20 font-mono text-sm font-extrabold text-sky-300 transition hover:bg-[#2563eb]/35"
                  >
                    ×
                  </button>

                  {/* Hàng 4 (Số & Biến): 4 | 5 | 6 | 1/x | Ans | - */}
                  {['4', '5', '6'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => appendToCalc(num)}
                      className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-[#334155] bg-[#334155]/80 font-mono text-xs font-extrabold text-white transition hover:bg-[#475569]"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleReciprocal}
                    title="Nghịch đảo (1/x)"
                    className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-[#334155] bg-[#0f172a] font-mono text-xs font-bold text-sky-300 transition hover:border-sky-400/60 hover:bg-[#334155]"
                  >
                    1/x
                  </button>
                  <button
                    type="button"
                    onClick={() => appendToCalc('Ans')}
                    title={`Gọi lại kết quả vừa tính (Ans = ${formatScientificNumber(ansValue)})`}
                    className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/15 font-mono text-xs font-extrabold text-emerald-300 transition hover:bg-emerald-500/25"
                  >
                    Ans
                  </button>
                  <button
                    type="button"
                    onClick={() => appendToCalc(' - ')}
                    className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-sky-500/40 bg-[#2563eb]/20 font-mono text-sm font-extrabold text-sky-300 transition hover:bg-[#2563eb]/35"
                  >
                    -
                  </button>

                  {/* Hàng 5 (Số & Hệ số mũ): 1 | 2 | 3 | ×10ˣ | 0 | + */}
                  {['1', '2', '3'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => appendToCalc(num)}
                      className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-[#334155] bg-[#334155]/80 font-mono text-xs font-extrabold text-white transition hover:bg-[#475569]"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      appendToCalc(calcExpression.trim() ? '×10^' : '1×10^')
                    }
                    title="Nhân lũy thừa cơ số 10 (EXP)"
                    className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-[#334155] bg-[#0f172a] font-mono text-[11px] font-bold text-amber-300 transition hover:border-amber-400/60 hover:bg-[#334155]"
                  >
                    ×10ˣ
                  </button>
                  <button
                    type="button"
                    onClick={() => appendToCalc('0')}
                    className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-[#334155] bg-[#334155]/80 font-mono text-xs font-extrabold text-white transition hover:bg-[#475569]"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      appendToCalc(calcExpression.trim() ? ' + ' : 'Ans + ')
                    }
                    className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-sky-500/40 bg-[#2563eb]/20 font-mono text-sm font-extrabold text-sky-300 transition hover:bg-[#2563eb]/35"
                  >
                    +
                  </button>

                  {/* Hàng 6 (Thập phân & Thực thi): . | ± | S⇔D | = (chiếm 3 cột) */}
                  <button
                    type="button"
                    onClick={() => appendToCalc('.')}
                    className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-[#334155] bg-[#334155]/80 font-mono text-sm font-extrabold text-white transition hover:bg-[#475569]"
                  >
                    .
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleSign}
                    title="Đổi dấu âm / dương (±)"
                    className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-[#334155] bg-[#0f172a] font-mono text-xs font-bold text-slate-200 transition hover:bg-[#334155]"
                  >
                    ±
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleFractionDecimal}
                    title="Chuyển đổi qua lại giữa Phân số và Số thập phân (S⇔D)"
                    className={`flex h-9 cursor-pointer items-center justify-center rounded-lg border font-mono text-[11px] font-extrabold transition ${
                      isFractionDisplay
                        ? 'border-amber-400 bg-amber-500/25 text-amber-200'
                        : 'border-[#334155] bg-[#0f172a] text-amber-300 hover:border-amber-400/60 hover:bg-[#334155]'
                    }`}
                  >
                    S⇔D
                  </button>
                  <button
                    type="button"
                    onClick={() => evaluateExpression(calcExpression)}
                    title="Thực thi phép tính (=)"
                    className="col-span-3 flex h-9 cursor-pointer items-center justify-center rounded-lg bg-[#2563eb] font-mono text-sm font-extrabold text-white shadow-md transition hover:bg-blue-500 active:scale-[0.99]"
                  >
                    =
                  </button>
                </div>

                {/* CỘT PHẢI (3/12): LỊCH SỬ PHÉP TÍNH GẦN ĐÂY */}
                <div className="flex flex-col justify-between rounded-xl border border-[#334155] bg-[#1e293b]/90 p-3 lg:col-span-3">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                        Lịch sử phép tính gần đây
                      </span>
                      {calcHistory.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setCalcHistory([])}
                          className="cursor-pointer text-[10px] font-semibold text-slate-400 hover:text-rose-300"
                        >
                          Xóa lịch sử
                        </button>
                      )}
                    </div>

                    {calcHistory.length === 0 ? (
                      <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-[#334155] bg-[#0f172a]/60 px-3 text-center text-[11px] text-slate-400">
                        Chưa có phép tính nào. Bấm &ldquo;=&rdquo; hoặc chọn nút tính nhanh để lưu kết quả.
                      </div>
                    ) : (
                      <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
                        {calcHistory.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setCalcError(null);
                              setIsFractionDisplay(false);
                              setCalcExpression(item.expression);
                              setCalcResult(item.result);
                              const num = Number(item.result);
                              if (Number.isFinite(num)) {
                                setCalcNumericResult(num);
                              }
                            }}
                            className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-[#334155] bg-[#0f172a] px-2.5 py-1.5 text-left font-mono text-[11px] transition hover:border-sky-400/60"
                          >
                            <span className="truncate text-slate-300">
                              {item.expression}
                            </span>
                            <span className="ml-2 shrink-0 font-bold text-sky-300">
                              = {item.result}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between border-t border-[#334155] pt-2.5 text-[11px] text-slate-300">
                    <span>Chuyển kết quả vào bảng?</span>
                    <button
                      type="button"
                      onClick={() => {
                        handleRecordCurrentMeasurement();
                        setActivePanel('data-table');
                      }}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-emerald-500/15 border border-emerald-500/40 px-2 py-1 font-bold text-emerald-300 transition hover:bg-emerald-500/25"
                    >
                      <span>Ghi vào bảng</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. 📊 BẢNG SỐ LIỆU (DATA TABLE & ERROR LOOKUP) */}
          {activePanel === 'data-table' && (
            <div className="px-3.5 py-3">
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/50 pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-400/30">
                    <Table2 size={14} />
                  </div>
                  <div>
                    <h3 className="text-[11.5px] font-extrabold uppercase tracking-wider text-emerald-300">
                      Bảng số liệu thực nghiệm & Tra cứu sai số
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="inline-flex rounded-lg border border-slate-700 bg-slate-900/90 p-0.5">
                    <button
                      type="button"
                      onClick={() => setDataTableTab('recorded-trials')}
                      className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-bold transition ${
                        dataTableTab === 'recorded-trials'
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <ClipboardList size={11} />
                      <span>Kết quả đo ({recordedTrials.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDataTableTab('equipment-lookup')}
                      className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-bold transition ${
                        dataTableTab === 'equipment-lookup'
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <BookOpen size={11} />
                      <span>Sai số chuẩn</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActivePanel(null)}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/90 px-2 py-0.5 text-[11px] font-bold text-slate-300 transition hover:border-rose-500/50 hover:bg-rose-950/60 hover:text-rose-200"
                  >
                    <X size={12} />
                    <span>Đóng</span>
                  </button>
                </div>
              </div>

              {dataTableTab === 'recorded-trials' ? (
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-[#111C30]/80 px-3 py-2">
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="font-bold text-slate-300">
                        Số liệu trực tiếp trên bàn:
                      </span>
                      <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-sky-300">
                        Khối lượng:{' '}
                        {measuredMassG !== null ? measuredMassG.toFixed(2) : '0.00'}
                      </span>
                      <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-indigo-300">
                        Mực nước đầu: {safeInitialV.toFixed(1)}
                      </span>
                      <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-violet-300">
                        Mực nước sau: {safeFinalV.toFixed(1)}
                      </span>
                      <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-emerald-300">
                        Độ lệch thể tích:{' '}
                        {objectVolumeCm3 !== null
                          ? objectVolumeCm3.toFixed(1)
                          : '0.0'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={trialNoteInput}
                        onChange={(e) => setTrialNoteInput(e.target.value)}
                        placeholder="Ghi chú lần đo (tùy chọn)..."
                        className="w-44 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleRecordCurrentMeasurement}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-sm transition hover:bg-emerald-400"
                      >
                        <Plus size={13} />
                        <span>Ghi lần đo vào bảng</span>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#091120]">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          <th className="px-3 py-2">Lần đo</th>
                          <th className="px-3 py-2">Đối tượng / Mẫu thử</th>
                          <th className="px-3 py-2 text-right">Khối lượng đo</th>
                          <th className="px-3 py-2 text-right">V ban đầu</th>
                          <th className="px-3 py-2 text-right">V lúc sau</th>
                          <th className="px-3 py-2 text-right">Thể tích vật</th>
                          <th className="px-3 py-2 text-right">Tỉ số thực nghiệm</th>
                          <th className="px-3 py-2 text-center">Sai số ước lượng</th>
                          <th className="px-3 py-2">Ghi chú & Thời gian</th>
                          <th className="px-3 py-2 text-center">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70">
                        {recordedTrials.map((row) => (
                          <tr
                            key={row.id}
                            className="transition hover:bg-slate-800/40"
                          >
                            <td className="px-3 py-2 font-mono font-bold text-emerald-400">
                              #{row.trialNumber}
                            </td>
                            <td className="px-3 py-2 font-semibold text-slate-200">
                              {row.specimenName}
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-sky-300">
                              {row.massG.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-400">
                              {row.v1Ml.toFixed(1)}
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-400">
                              {row.v2Ml.toFixed(1)}
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-bold text-indigo-300">
                              {row.volumeCm3.toFixed(1)}
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-extrabold text-amber-300">
                              {row.resultValue.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-center font-mono text-slate-300">
                              {row.uncertainty}
                            </td>
                            <td className="px-3 py-2 text-slate-400">
                              <span>{row.note}</span>
                              <span className="ml-2 text-[10px] text-slate-500">
                                ({row.timestamp})
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteTrialRow(row.id)}
                                className="inline-flex rounded p-1 text-slate-500 hover:bg-rose-500/15 hover:text-rose-400"
                                title="Xóa dòng số liệu này"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      {recordedTrials.length > 0 && (
                        <tfoot>
                          <tr className="border-t border-emerald-500/30 bg-emerald-950/20 font-mono text-xs font-bold">
                            <td colSpan={2} className="px-3 py-2 text-emerald-300">
                              Trung bình cộng ({recordedTrials.length} lần đo)
                            </td>
                            <td className="px-3 py-2 text-right text-sky-300">
                              {tableStats.avgMass.toFixed(2)}
                            </td>
                            <td
                              colSpan={2}
                              className="px-3 py-2 text-right text-slate-500"
                            >
                              —
                            </td>
                            <td className="px-3 py-2 text-right text-indigo-300">
                              {tableStats.avgVolume.toFixed(1)}
                            </td>
                            <td className="px-3 py-2 text-right text-amber-300">
                              {tableStats.avgResult.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-center text-emerald-300">
                              ± {tableStats.absError.toFixed(2)}
                            </td>
                            <td
                              colSpan={2}
                              className="px-3 py-2 text-right font-sans text-[11px] text-slate-400"
                            >
                              Sai số ngẫu nhiên trung bình
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#091120] lg:col-span-8">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          <th className="px-3 py-2">Thiết bị đo</th>
                          <th className="px-3 py-2">Giới hạn đo (GHĐ)</th>
                          <th className="px-3 py-2">Độ chia nhỏ nhất</th>
                          <th className="px-3 py-2">Sai số dụng cụ</th>
                          <th className="px-3 py-2">Quy tắc đọc chuẩn</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70">
                        {EQUIPMENT_CALIBRATION_LOOKUP.map((eq) => (
                          <tr key={eq.code} className="hover:bg-slate-800/40">
                            <td className="px-3 py-2 font-semibold text-slate-200">
                              {eq.name}
                            </td>
                            <td className="px-3 py-2 font-mono text-sky-300">
                              {eq.range}
                            </td>
                            <td className="px-3 py-2 font-mono text-indigo-300">
                              {eq.leastCount}
                            </td>
                            <td className="px-3 py-2 font-mono font-bold text-amber-300">
                              {eq.errorLimit}
                            </td>
                            <td className="px-3 py-2 text-[11px] text-slate-400">
                              {eq.note}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-[#111C30]/80 p-3 lg:col-span-4">
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                      <Info size={14} />
                      <span>Bảng hằng số mẫu vật đối chiếu</span>
                    </div>
                    <div className="space-y-1.5">
                      {REFERENCE_MATERIAL_LOOKUP.map((mat) => (
                        <div
                          key={mat.name}
                          className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/70 px-2.5 py-1.5 text-xs"
                        >
                          <span className="font-medium text-slate-200">
                            {mat.name}
                          </span>
                          <div className="text-right font-mono">
                            <span className="font-bold text-amber-300">
                              {mat.standardValue}
                            </span>
                            <span className="ml-1.5 text-[10px] text-slate-400">
                              ({mat.tolerance})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
