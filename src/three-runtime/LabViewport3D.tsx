import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  AssetDefinition,
  LabEnvironment,
  ProceduralArchetype,
  SceneInstance,
} from '../domain/types';
import { openLabAssetLoader, OpenLabAssetLoader } from './AssetLoader';
import {
  applyInstanceStateToObject3D,
  computePascalSimulationMetrics,
  stepPascalHydraulicPressAnimation,
  PascalActiveWeightDragPreview,
  PAS_X1,
  PAS_X2,
  PAS_CYL_BOTTOM_Y,
  PAS_EQUILIBRIUM_LIQUID_H,
  PAS_PISTON_HEAD_THICKNESS,
  PAS_ROD_LENGTH,
  PAS_PAN_THICKNESS,
  PASCAL_WORLD_SCALE,
} from './ProceduralLabModels';
import {
  computeCopperReactionInfo,
  stepChemicalEquipmentAnimation,
} from './ChemicalLabModels3D';
import {
  getColorFilterDispersionLabelInfo,
  stepColorFilterDispersionAnimation,
} from './ColorFilterDispersion3D';
import { ColorFilterDispersionControls } from '../components/viewport/ColorFilterDispersionControls';
import {
  getOxygenAirVolumeLabelInfo,
  stepOxygenAirVolumeAnimation,
} from './OxygenAirVolume3D';
import { OxygenAirVolumeControls } from '../components/viewport/OxygenAirVolumeControls';
import { htmlEquipmentModuleRegistry } from './HtmlEquipmentModuleRegistry';
import { equipmentImagePreviewController } from './EquipmentImagePreviewController';
import { EquipmentThumbnailSvg } from '../components/common/EquipmentThumbnailSvg';
import { labSoundEngine } from './LabSoundEngine';
import { neuralConnectionEngine } from '../domain/neuralConnectionEngine';
import {
  CIRCUIT_TERMINAL_DEFINITIONS,
  CircuitTerminalId,
  CircuitWireConnection,
  DcCircuitSolverResult,
  solveDcCircuitGraph,
} from '../domain/dcCircuitSolverEngine';
import { build3DBananaWireBetweenPoints } from './DcCircuitModels3D';
import {
  BENCH_SURFACE_Y,
  DEFAULT_LAB_ROOM_CONFIG,
  DEFAULT_COORDINATE_DISPLAY_SETTINGS,
  INITIAL_ENVIRONMENT_VARIABLES,
  DEFAULT_LAB_GRAPHICS_SETTINGS,
  CoordinateDisplaySettings,
  EnvironmentVariableDefinition,
  EnvironmentVariableId,
  LabClockState,
  LabEventLog,
  LabGraphicsSettings,
  buildStandardLabRoomV2,
  buildWorldCoordinatesAndGridHelper,
  formatVietnamDateTime,
  formatSimulationDuration,
  formatLengthByUnit,
  worldToBenchCornerCoords,
} from './LabEnvironmentEngine';
import { LabEnvironmentSpecModal } from '../components/modals/LabEnvironmentSpecModal';
import { LabVideoRecorderModal } from '../components/modals/LabVideoRecorderModal';
import {
  LabRecordingSession,
  RecordedStepMilestone,
  LabLiveMeasurementChip,
  getSupportedVideoMimeType,
  formatRecTime,
  drawCompositeRecordingFrame,
  captureMilestoneThumbnail,
} from './LabVideoRecorderEngine';
import {
  Move,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Eye,
  Grid,
  Tag,
  Ruler,
  RotateCcw,
  Camera,
  Layers,
  AlertTriangle,
  RefreshCw,
  Maximize2,
  Minimize2,
  Compass,
  Volume2,
  VolumeX,
  Clock,
  Play,
  Pause,
  Sliders,
  Video,
  Square,
  BookmarkPlus,
  Sparkles,
  Trash2,
  Archive,
  ChevronDown,
  ChevronUp,
  X,
  Info,
  HelpCircle,
  Sun,
  Lightbulb,
  Moon,
  FolderOpen,
  PanelLeftOpen,
  PanelLeftClose,
  Box,
  BookOpen,
  Wrench,
  Plus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Save,
  Code,
  Copy,
  Download,
  EyeOff,
} from 'lucide-react';

// Bàn gỗ thí nghiệm chính chuẩn openlan3dmixxx: dài 2.00 m (X ∈ [-1.00, 1.00]) × rộng 1.00 m (Z ∈ [-0.50, 0.50]).
// Giới hạn trên mặt bàn chính: X ∈ [-0.94, 0.94], Z ∈ [-0.46, 0.46]
// (Ngoài ra hỗ trợ đặt trực tiếp lên 2 Kệ gỗ 2 tầng Trái/Phải X ∈ [-1.94, -1.10] & [1.10, 1.94] và Tủ kính 2 tầng Z = -0.68)
const BENCH_LIMIT_X = 0.94;
const BENCH_LIMIT_Z = 0.46;

// Tủ kính 2 tầng đối diện bàn thí nghiệm chuẩn openlan3dmixxx (rộng 1.65 m × sâu 0.30 m × cao 0.44 m)
const CABINET_POS_X = 0.0;
const CABINET_POS_Z = -0.68;
const CABINET_WIDTH_M = 1.65;
const CABINET_DEPTH_M = 0.3;
const CABINET_HEIGHT_M = 0.56;

const CABINET_SHELF_SLOTS: ReadonlyArray<{ x: number; y: number; z: number }> = [
  // Tầng 1 (Kệ kính mờ dưới: localY = 0.024 m)
  { x: -0.58, y: 0.024, z: 0.01 },
  { x: -0.2, y: 0.024, z: 0.01 },
  { x: 0.2, y: 0.024, z: 0.01 },
  { x: 0.58, y: 0.024, z: 0.01 },
  // Tầng 2 (Kệ kính mờ trên: localY = 0.268 m)
  { x: -0.58, y: 0.268, z: 0.01 },
  { x: -0.2, y: 0.268, z: 0.01 },
  { x: 0.2, y: 0.268, z: 0.01 },
  { x: 0.58, y: 0.268, z: 0.01 },
];

// 12 vị trí đặt vật phẩm trên 2 Kệ Gỗ 2 Tầng hai bên Trái / Phải chuẩn openlan3dmixxx.vercel.app
const SIDE_SHELF_SLOTS: ReadonlyArray<{
  x: number;
  y: number;
  z: number;
  side: 'left' | 'right';
  tier: 'lower' | 'upper';
}> = [
  { x: -1.78, y: 0, z: 0.04, side: 'left', tier: 'lower' },
  { x: -1.52, y: 0, z: 0.04, side: 'left', tier: 'lower' },
  { x: -1.26, y: 0, z: 0.04, side: 'left', tier: 'lower' },
  { x: -1.78, y: 0.26, z: -0.35, side: 'left', tier: 'upper' },
  { x: -1.52, y: 0.26, z: -0.35, side: 'left', tier: 'upper' },
  { x: -1.26, y: 0.26, z: -0.35, side: 'left', tier: 'upper' },
  { x: 1.26, y: 0, z: 0.04, side: 'right', tier: 'lower' },
  { x: 1.52, y: 0, z: 0.04, side: 'right', tier: 'lower' },
  { x: 1.78, y: 0, z: 0.04, side: 'right', tier: 'lower' },
  { x: 1.26, y: 0.26, z: -0.35, side: 'right', tier: 'upper' },
  { x: 1.52, y: 0.26, z: -0.35, side: 'right', tier: 'upper' },
  { x: 1.78, y: 0.26, z: -0.35, side: 'right', tier: 'upper' },
];

export interface StoredCabinetItemRecord {
  storedId: string;
  instanceId: string;
  assetId: string;
  title: string;
  symbol: string;
  storedAtMs: number;
  cabinetZone?: 'glass' | 'left' | 'right';
}

export type TransformToolMode = 'select' | 'translate' | 'rotate';
export type ViewportDisplayMode = 'lab-scene' | 'single-asset';

export type PhysicalDockTargetSlot =
  | 'bench'
  | 'balance-pan'
  | 'inside-vessel'
  | 'pour-liquid'
  | 'dispenser-outlet'
  | 'dynamometer-hook'
  | 'caliper-jaws'
  | 'storage-cabinet'
  | 'side-shelf'
  | 'under-shelf-cabinet-left'
  | 'under-shelf-cabinet-right'
  | 'tripod-top'
  | 'under-tripod'
  | 'pascal-piston-1'
  | 'pascal-piston-2';

export type QuickLabActionType =
  | 'tare-balance'
  | 'clear-balance-pan'
  | 'weigh-selected'
  | 'submerge-cylinder'
  | 'submerge-overflow'
  | 'pour-to-cylinder'
  | 'pour-to-beaker'
  | 'pour-to-overflow'
  | 'dock-to-dispenser'
  | 'refill-water'
  | 'toggle-laser'
  | 'refraction-angle-20'
  | 'refraction-angle-40'
  | 'refraction-angle-60'
  | 'induce-current-pos'
  | 'induce-current-neg'
  | 'induce-current-zero'
  | 'multimeter-mode-v'
  | 'multimeter-mode-a'
  | 'multimeter-mode-ohm'
  | 'toggle-burner-flame'
  | 'pour-ice-to-vessel'
  | 'refill-ice-tray'
  | 'microscope-10x'
  | 'microscope-40x'
  | 'microscope-100x'
  | 'temp-room-25'
  | 'temp-warm-78'
  | 'temp-boil-100'
  | 'dynamometer-weigh'
  | 'dynamometer-zero'
  | 'caliper-measure'
  | 'caliper-zero'
  | 'funnel-extract'
  | 'rotate-90'
  | 'open-sgk-profile'
  | 'edit-product-info'
  | 'open-html-updater'
  | 'delete-instance'
  | 'permanently-delete-asset';

function getEquipmentSymbol(asset: AssetDefinition): string {
  const arch = asset.geometry.proceduralArchetype;
  switch (arch) {
    case 'electronic-balance':
      return '⚖️';
    case 'graduated-cylinder':
      return '🧪';
    case 'beaker-250':
    case 'beaker-bomex-100':
    case 'erlenmeyer-flask':
    case 'distillation-flask':
    case 'thermal-heating-vessel':
      return '🫙';
    case 'ice-cubes-tray':
      return '🧊';
    case 'tripod-wire-gauze':
      return '支架';
    case 'overflow-can':
    case 'separatory-funnel':
      return '🫗';
    case 'water-dispenser':
      return '🚰';
    case 'spring-dynamometer':
      return '🪝';
    case 'vernier-caliper':
      return '📏';
    case 'thermometer':
      return '🌡️';
    case 'alcohol-burner':
    case 'porcelain-dish':
      return '🔥';
    case 'optical-microscope':
    case 'magnifying-glass':
      return '🔬';
    case 'laser-source':
    case 'optical-prism':
    case 'semicircular-slab':
    case 'optical-lens':
      return '🔦';
    case 'galvanometer':
    case 'digital-multimeter':
    case 'induction-coil-led':
    case 'dc-ammeter':
    case 'dc-voltmeter':
      return '⚡';
    case 'dc-battery-holder':
    case 'dc-con-o-battery':
      return '🔋';
    case 'dc-knife-switch':
      return '🕹️';
    case 'dc-light-bulb-126':
      return '💡';
    case 'dc-rheostat-20':
      return '🎚️';
    case 'dna-double-helix':
      return '🧬';
    case 'retort-stand':
      return '🏗️';
    case 'pascal-hydraulic-press':
      return '⚖️';
    case 'pascal-weight-100g':
      return '🏋️';
    case 'reagent-bottle-naoh-400':
      return '🧪';
    case 'copper-wire-ring-3g':
      return '🟠';
    case 'reagent-bottle-agno3-400':
      return '🏺';
    case 'color-filter-dispersion':
      return '🌈';
    case 'oxygen-air-volume':
      return '🫧';
    default:
      return '🧱';
  }
}

interface ProjectedLabel {
  instanceId: string;
  assetId: string;
  symbol: string;
  title: string;
  readoutBadge?: string;
  isDigitalScale?: boolean;
  interactionHint: string;
  archetype: string;
  subtitle: string;
  x: number;
  y: number;
  isSelected: boolean;
  isLocked: boolean;
}

interface HoveredEquipmentTooltip {
  instanceId: string;
  assetId: string;
  title: string;
  englishName: string;
  readoutBadge?: string;
  isDigitalScale?: boolean;
  sgkFigure?: string;
  interactionHint: string;
  dimensionsMm: string;
  x: number;
  y: number;
}

function computeLiveEquipmentReadout(
  inst: SceneInstance,
  asset: AssetDefinition,
): {
  readoutBadge: string;
  isDigitalScale: boolean;
  interactionHint: string;
} {
  const customHtmlMod = htmlEquipmentModuleRegistry.getModule(asset.assetId);
  if (customHtmlMod && customHtmlMod.buildEquipmentGroup) {
    const ctrl = customHtmlMod.moduleControls;
    const rawVal = inst.instanceState[ctrl.stateKey];
    const numVal = typeof rawVal === 'number' ? rawVal : ctrl.defaultValue;
    const decimals = ctrl.step < 0.1 ? 2 : ctrl.step < 1 ? 1 : 0;
    const massVal = asset.scientificProperties.referenceMass?.value ?? 100;
    const isBurnerCtrl =
      ctrl.stateKey === 'temperatureC' &&
      (ctrl.max >= 200 ||
        asset.name.vi.toLowerCase().includes('đèn cồn') ||
        asset.name.vi.toLowerCase().includes('den con'));
    const isFlameOff =
      isBurnerCtrl &&
      (inst.instanceState.isHeating === false || numVal <= ctrl.min + 0.5);
    return {
      readoutBadge: isBurnerCtrl
        ? isFlameOff
          ? '0 °C (ĐÃ TẮT LỬA)'
          : `${numVal.toFixed(decimals)} ${ctrl.unit} (🔥 ĐANG CHÁY)`
        : `${numVal.toFixed(decimals)} ${ctrl.unit}`,
      isDigitalScale: true,
      interactionHint: `${ctrl.label} (${ctrl.min}..${ctrl.max} ${ctrl.unit}) · Điều khiển trực tiếp bằng Thanh trượt & Nút bấm dưới bàn (${massVal} g)`,
    };
  }

  const arch = asset.geometry.proceduralArchetype;
  if (arch === 'electronic-balance') {
    const tare = inst.instanceState.tareOffsetG ?? 0;
    const mass = Math.max(0, (inst.instanceState.measuredMassG ?? 0) - tare);
    return {
      readoutBadge: `${mass.toFixed(2)} g`,
      isDigitalScale: true,
      interactionHint: 'Kéo vật mẫu/cốc đặt lên đĩa cân hoặc bấm Nút trừ bì (TARE) · Hiển thị LCD 360°',
    };
  }
  if (arch === 'water-dispenser') {
    const ml = inst.instanceState.liquidLevelMl ?? 850;
    return {
      readoutBadge: `${ml.toFixed(0)} / 1000 ml`,
      isDigitalScale: true,
      interactionHint:
        'Kéo Ống đong / Cốc / Bình tràn đặt vào khay hứng màu xanh dưới vòi để lấy nước tự động, hoặc nhấn để mở bảng chỉnh ml',
    };
  }
  if (arch === 'thermal-heating-vessel') {
    const ml = inst.instanceState.liquidLevelMl ?? 0;
    const iceG = inst.instanceState.iceMassG ?? 0;
    const tempC = inst.instanceState.temperatureC ?? 25.0;
    const isEmpty = iceG <= 0.2 && ml <= 0.5;
    const phaseLabel = isEmpty
      ? 'Bình rỗng — Chờ cho Nước đá viên hoặc nước vào bình'
      : iceG > 0.2
        ? tempC < 0
          ? `Đá đang ấm dần lên 0°C (Còn ${iceG.toFixed(0)}g đá)`
          : `Đá đang tan từ từ ở 0°C (Còn ${iceG.toFixed(0)}g đá → Nước ${ml.toFixed(0)}ml)`
        : tempC >= 99.5
          ? 'Nước đang sôi 100.0°C (Bọt khí & Hơi nước)'
          : `Đã thành nước bình thường — Đang nóng dần lên (${tempC.toFixed(1)}°C / 100°C)`;
    return {
      readoutBadge: isEmpty
        ? `Bình rỗng (${tempC.toFixed(1)} °C · 🧊 0g · 💧 0ml)`
        : `${tempC.toFixed(1)} °C · 🧊 ${iceG.toFixed(0)}g · 💧 ${ml.toFixed(0)}ml`,
      isDigitalScale: !isEmpty,
      interactionHint: isEmpty
        ? `${phaseLabel} · Kéo Nước đá viên thí nghiệm thả vào bình để bỏ đá, sau đó đặt lên Đèn cồn đang cháy (100 °C)!`
        : `${phaseLabel} · Kéo đặt trực tiếp lên trên Đèn cồn đang cháy (100 °C) để đun!`,
    };
  }
  if (arch === 'alcohol-burner') {
    const isLit = Boolean(inst.instanceState.isHeating);
    return {
      readoutBadge: isLit ? '🔥 ĐANG CHÁY (100.0 °C)' : '🧯 ĐÃ TẮT LỬA (0 °C)',
      isDigitalScale: isLit,
      interactionHint:
        'Click vào Đèn cồn để Châm lửa (100 °C) / Đậy nắp tắt lửa · Kéo Bình thủy tinh chịu nhiệt đặt trực tiếp lên trên đèn cồn đang cháy để đun!',
    };
  }
  if (arch === 'ice-cubes-tray') {
    const iceG = inst.instanceState.iceMassG ?? 100;
    const tempC = inst.instanceState.temperatureC ?? -5.0;
    return {
      readoutBadge:
        iceG > 0.5
          ? `🧊 ${iceG.toFixed(0)} g (${tempC.toFixed(1)} °C)`
          : 'Khay trống (0 g)',
      isDigitalScale: iceG > 0.5,
      interactionHint:
        iceG > 0.5
          ? 'Kéo Khay nước đá viên thả trực tiếp vào Bình thủy tinh chịu nhiệt (kể cả khi đang trên Đèn cồn) để cho đá vào bình!'
          : 'Khay đá đã đổ hết vào bình — Bấm "❄️ Lấy đầy 100g đá viên" ở thanh công cụ nếu muốn lấy thêm đá!',
    };
  }
  if (arch === 'tripod-wire-gauze') {
    return {
      readoutBadge: 'Cao 128 mm · Lưới Amiăng',
      isDigitalScale: false,
      interactionHint:
        'Kéo Đèn cồn đặt vào gầm dưới kiềng sắt và kéo Bình đựng nước đá đặt lên mặt lưới tản nhiệt phía trên',
    };
  }
  if (arch === 'pascal-hydraulic-press') {
    const m = computePascalSimulationMetrics(
      inst.instanceState.weightsPiston1 ?? 0,
      inst.instanceState.weightsPiston2 ?? 0,
    );
    return {
      readoutBadge: `n₁=${m.n1} (${m.p1NCm2.toFixed(2)} N/cm²) | n₂=${m.n2} (${m.p2NCm2.toFixed(2)} N/cm²) · ${
        m.isBalanced
          ? '✓ CÂN BẰNG (p₁=p₂)'
          : `Δh₁=${m.deltaH1Cm > 0 ? '+' : ''}${m.deltaH1Cm.toFixed(1)}cm, Δh₂=${m.deltaH2Cm > 0 ? '+' : ''}${m.deltaH2Cm.toFixed(1)}cm`
      }`,
      isDigitalScale: true,
      interactionHint:
        'Click trực tiếp lên Đĩa Pit-tông (1) S₁=20cm² hoặc Đĩa Pit-tông (2) S₂=10cm² để đặt/tháo quả nặng 100g (1.0N), hoặc kéo thả Quả nặng chuẩn Pascal 100g lên 2 đĩa pit-tông!',
    };
  }
  if (arch === 'pascal-weight-100g') {
    return {
      readoutBadge: '100 g · P₀ = 1.0 N',
      isDigitalScale: true,
      interactionHint:
        'Kéo thả trực tiếp lên Đĩa Pit-tông (1) nhánh lớn S₁ hoặc Đĩa Pit-tông (2) nhánh nhỏ S₂ của Bình thông nhau thủy lực Pascal (Hình 16.3), hoặc đặt lên Cân điện tử!',
    };
  }
  if (arch === 'reagent-bottle-naoh-400') {
    const volMl = inst.instanceState.liquidLevelMl ?? 300;
    const moles = ((volMl / 1000) * 0.1).toFixed(3);
    const massG = ((volMl / 1000) * 0.1 * 40).toFixed(2);
    const rxn = inst.instanceState.chemicalReactionMode || 'none';
    return {
      readoutBadge: `NaOH 0,1M · ${volMl.toFixed(0)}/400 ml · pH=13,0 (n=${moles} mol, m=${massG}g)${
        rxn !== 'none' ? ` · 🧪 Đang thử: ${rxn.toUpperCase()}` : ''
      }`,
      isDigitalScale: true,
      interactionHint:
        'Điều chỉnh mức dung dịch (0–400 ml, chuẩn 300 ml), Mở/Đóng nắp nhựa xanh GL45, Nghiêng lọ và bấm thử 6 tính chất hóa học của bazơ mạnh NaOH trong cốc thử 3D!',
    };
  }
  if (arch === 'copper-wire-ring-3g') {
    const mode = inst.instanceState.chemicalReactionMode || 'pure';
    const progress = inst.instanceState.reactionProgress ?? 1.0;
    const info = computeCopperReactionInfo(mode, progress);
    return {
      readoutBadge: `M=64 · m=${info.currentMassG.toFixed(2)} g · ${info.badgeText}`,
      isDigitalScale: true,
      interactionHint: `${info.equationText} — ${info.detailText}`,
    };
  }
  if (arch === 'reagent-bottle-agno3-400') {
    const volMl = inst.instanceState.liquidLevelMl ?? 300;
    const moles = ((volMl / 1000) * 0.1).toFixed(3);
    const massG = ((volMl / 1000) * 0.1 * 169.87).toFixed(2);
    const rxn = inst.instanceState.chemicalReactionMode || 'none';
    return {
      readoutBadge: `AgNO₃ 0,1M · ${volMl.toFixed(0)}/400 ml (n=${moles} mol, m≈${massG}g)${
        rxn !== 'none' ? ` · 🧪 Đang thử: ${rxn.toUpperCase()}` : ''
      }`,
      isDigitalScale: true,
      interactionHint:
        'Lọ thủy tinh nâu chắn sáng ISO 4796 · Điều chỉnh mức AgNO₃ (chuẩn 300 ml), bật X-Ray nhìn xuyên thành lọ nâu, mở nắp xanh GL45 và thử 6 phản ứng nhận biết Halide / kim loại Cu!',
    };
  }
  if (arch === 'color-filter-dispersion') {
    return getColorFilterDispersionLabelInfo(inst);
  }
  if (arch === 'oxygen-air-volume') {
    return getOxygenAirVolumeLabelInfo(inst);
  }
  if (
    arch === 'graduated-cylinder' ||
    arch === 'beaker-250' ||
    arch === 'beaker-bomex-100' ||
    arch === 'overflow-can' ||
    arch === 'erlenmeyer-flask' ||
    arch === 'separatory-funnel'
  ) {
    const cap =
      arch === 'overflow-can'
        ? 210
        : asset.scientificProperties.capacity?.value ?? 100;
    const ml =
      inst.instanceState.liquidLevelMl ??
      (arch === 'overflow-can' ? 210 : cap * 0.5);
    const overflowMl = inst.instanceState.overflowingVolumeMl ?? 0;
    const iceG = inst.instanceState.iceMassG ?? 0;
    const tempC = inst.instanceState.temperatureC;
    const thermalSuffix =
      iceG > 0.5
        ? ` · 🧊 ${iceG.toFixed(0)}g (${(tempC ?? 0).toFixed(1)}°C)`
        : typeof tempC === 'number' && (tempC <= 15 || tempC >= 35)
          ? ` · ${tempC.toFixed(1)}°C`
          : '';
    return {
      readoutBadge:
        arch === 'overflow-can'
          ? overflowMl > 0.05
            ? `210.0 ml (Tràn +${overflowMl.toFixed(1)} ml)`
            : `${Math.min(210, ml).toFixed(1)} / 210 ml`
          : `${ml.toFixed(1)} ml${thermalSuffix}`,
      isDigitalScale: arch === 'overflow-can' && overflowMl > 0.05,
      interactionHint:
        arch === 'separatory-funnel'
          ? 'Mở khóa chiết tách riêng lớp chất lỏng phân cực và không phân cực'
          : arch === 'overflow-can'
            ? 'Đặt dưới vòi Bình cấp nước để châm đầy 210.0 ml ngang vòi tràn, sau đó thả vật rắn vào đo ΔV tràn sang cốc hứng'
            : 'Kéo đặt dưới vòi nước, thả Nước đá viên vào bình, đặt lên Kiềng sắt 3 chân để đun, hoặc nghiêng rót sang bình khác',
    };
  }
  if (arch === 'spring-dynamometer') {
    const forceN = inst.instanceState.springExtensionN ?? 0;
    return {
      readoutBadge: `${forceN.toFixed(2)} N`,
      isDigitalScale: true,
      interactionHint: 'Kéo vật mẫu móc vào lực kế để đo trọng lượng P = m·g (Thang 360°)',
    };
  }
  if (arch === 'vernier-caliper') {
    const mm = inst.instanceState.jawOpeningMm ?? 0;
    return {
      readoutBadge: `${mm.toFixed(1)} mm`,
      isDigitalScale: true,
      interactionHint: 'Đưa vật mẫu vào hàm kẹp để đo đường kính ngoài d (ĐCNN 0.05 mm)',
    };
  }
  if (arch === 'thermometer') {
    const tempC = inst.instanceState.temperatureC ?? 25.0;
    return {
      readoutBadge: `${tempC.toFixed(1)} °C`,
      isDigitalScale: true,
      interactionHint: 'Đặt gần cốc nước hoặc bình đang đun để đo nhiệt độ thực tế (-10..110 °C)',
    };
  }
  if (arch === 'laser-source' || arch === 'optical-prism') {
    const isOn = inst.instanceState.isPoweredOn !== false;
    return {
      readoutBadge: isOn ? 'CHÙM TIA: BẬT' : 'CHÙM TIA: TẮT',
      isDigitalScale: false,
      interactionHint:
        arch === 'optical-prism'
          ? 'Tán sắc chùm sáng trắng qua lăng kính A = 60° thành dải 7 màu quang phổ'
          : 'Phát 3 chùm tia laser đỏ (650 nm) khảo sát khúc xạ và thấu kính',
    };
  }
  if (arch === 'semicircular-slab') {
    const inc = inst.instanceState.incidentAngleDeg ?? 30;
    return {
      readoutBadge: inc >= 42 ? `i = ${inc}° (PXTP!)` : `i = ${inc}° (Khúc xạ)`,
      isDigitalScale: true,
      interactionHint: 'Đổi góc tới i (20° / 40° / 60°) quan sát định luật khúc xạ & phản xạ toàn phần',
    };
  }
  if (arch === 'optical-lens') {
    return {
      readoutBadge: 'f = +100 mm',
      isDigitalScale: false,
      interactionHint: 'Hội tụ 3 chùm tia sáng song song tại tiêu điểm F (D = +10 dp)',
    };
  }
  if (arch === 'magnifying-glass') {
    const mag = inst.instanceState.magnification ?? 5;
    return {
      readoutBadge: `G = ${mag}x (f = 50 mm)`,
      isDigitalScale: false,
      interactionHint: 'Quan sát ảnh ảo cùng chiều, lớn hơn vật khi đặt vật trong khoảng tiêu cự',
    };
  }
  if (arch === 'galvanometer') {
    const defl = inst.instanceState.galvanometerDeflection ?? 0;
    const badge =
      defl > 0.05
        ? `+${(defl * 0.8).toFixed(2)} mA (Phải)`
        : defl < -0.05
          ? `${(defl * 0.8).toFixed(2)} mA (Trái)`
          : '0.00 mA';
    return {
      readoutBadge: badge,
      isDigitalScale: true,
      interactionHint: 'Kim điện kế vạch 0 giữa (2 mặt trước/sau) phát hiện dòng điện cảm ứng',
    };
  }
  if (arch === 'digital-multimeter') {
    const mode = inst.instanceState.multimeterMode ?? 'V';
    const val = inst.instanceState.multimeterValue ?? 0;
    return {
      readoutBadge: `${val.toFixed(2)} ${mode}`,
      isDigitalScale: true,
      interactionHint: 'Chuyển thang đo U (V), I (A), R (Ω) trên màn hình LCD kép trước/sau',
    };
  }
  if (arch === 'induction-coil-led') {
    const defl = inst.instanceState.galvanometerDeflection ?? 0.6;
    const badge =
      defl > 0.05
        ? 'LED 1 ĐỎ SÁNG'
        : defl < -0.05
          ? 'LED 2 XANH SÁNG'
          : '2 LED TẮT';
    return {
      readoutBadge: badge,
      isDigitalScale: false,
      interactionHint: 'Đưa nam châm lại gần hoặc ra xa cuộn dây để tạo dòng điện cảm ứng xoay chiều',
    };
  }
  if (arch === 'porcelain-dish' || arch === 'distillation-flask') {
    const heating = inst.instanceState.isHeating !== false;
    return {
      readoutBadge: heating ? 'ĐANG ĐUN (78.5 °C)' : 'ĐÃ TẮT LỬA (25 °C)',
      isDigitalScale: false,
      interactionHint: 'Bật/tắt ngọn lửa đèn cồn để đốt cháy ethylic alcohol hoặc chưng cất',
    };
  }
  if (arch === 'optical-microscope') {
    const mag = inst.instanceState.magnification ?? 40;
    return {
      readoutBadge: `Vật kính ${mag}x`,
      isDigitalScale: true,
      interactionHint: 'Xoay mâm vật kính 10x / 40x / 100x soi tiêu bản nhiễm sắc thể cố định',
    };
  }
  if (arch === 'dna-double-helix') {
    return {
      readoutBadge: 'Chu kì 34 Å · A-T / G-C',
      isDigitalScale: false,
      interactionHint: 'Xoay 360° quan sát chuỗi xoắn kép, nguyên tắc bổ sung A-T (2 LK) và G-C (3 LK)',
    };
  }
  if (arch === 'retort-stand') {
    return {
      readoutBadge: 'Trụ 500 mm · Kẹp đa năng',
      isDigitalScale: false,
      interactionHint: 'Giá đỡ lực kế lò xo, phễu chiết, bình cầu chưng cất và ống nghiệm',
    };
  }
  if (arch === 'dc-battery-holder') {
    const s1 = inst.instanceState.slot1Inserted !== false;
    const s2 = inst.instanceState.slot2Inserted !== false;
    const r1 = Boolean(inst.instanceState.slot1Reversed);
    const r2 = Boolean(inst.instanceState.slot2Reversed);
    const count = (s1 ? 1 : 0) + (s2 ? 1 : 0);
    return {
      readoutBadge:
        count === 2
          ? r1 || r2
            ? '2 Pin (Đảo cực!)'
            : '2 × 1.5V (Cần cầu nối tiếp -> 3.0V)'
          : count === 1
            ? '1 × 1.5V'
            : 'Chưa lắp pin (0V)',
      isDigitalScale: true,
      interactionHint:
        'Click vào Khay 1/Khay 2 để lắp/đảo/tháo pin · Muốn có 3.0V phải nối dây BAT1_NEG -> BAT2_POS và lấy nguồn ở BAT1_POS (+) & BAT2_NEG (-)',
    };
  }
  if (arch === 'dc-con-o-battery') {
    return {
      readoutBadge: '1.5V · R_pin = 0.25Ω',
      isDigitalScale: true,
      interactionHint: 'Kéo thả vào Giá đỡ 2 Pin đại (SLOT_1 hoặc SLOT_2) để cấp nguồn một chiều 1.5V',
    };
  }
  if (arch === 'dc-knife-switch') {
    const closed = Boolean(inst.instanceState.switchClosed);
    return {
      readoutBadge: closed ? 'K: ĐÓNG (Dẫn điện)' : 'K: NGẮT (Mạch hở)',
      isDigitalScale: closed,
      interactionHint:
        'Click trực tiếp vào tay cầm Cầu dao K để Đóng/Ngắt mạch giữa 2 cọc SW_RED (Đỏ) và SW_GREEN (Xanh lá)',
    };
  }
  if (arch === 'dc-light-bulb-126') {
    const pW = inst.instanceState.bulbPowerW ?? 0;
    const iA = inst.instanceState.bulbCurrentA ?? 0;
    const uV = inst.instanceState.bulbVoltageV ?? 0;
    return {
      readoutBadge:
        pW > 0.008
          ? `💡 SÁNG (${uV.toFixed(2)}V · ${iA.toFixed(2)}A · ${pW.toFixed(2)}W)`
          : 'ĐÈN TẮT (0.00W · R=8.5Ω)',
      isDigitalScale: pW > 0.008,
      interactionHint:
        'Gồm 2 cọc BULB_NEG (Đen, trái) & BULB_POS (Đỏ, phải), R_bulb = 8.5Ω. Chỉ sáng khi dòng điện đi vào 1 cọc và đi ra ở cọc kia',
    };
  }
  if (arch === 'dc-rheostat-20') {
    const ratio = inst.instanceState.sliderRatio ?? 0.5;
    const rOhm = inst.instanceState.rheostatOhm ?? Number((ratio * 20).toFixed(2));
    return {
      readoutBadge: `R = ${rOhm.toFixed(1)} / 20.0 Ω`,
      isDigitalScale: true,
      interactionHint:
        'Kéo con chạy 3D để đổi R_rheo = sliderRatio × 20Ω (khi nối RHEO_IN & RHEO_WIPER). Nếu nối RHEO_IN & RHEO_COIL_END thì R cố định 20Ω',
    };
  }
  if (arch === 'dc-ammeter') {
    const iA = inst.instanceState.ammeterReadingA ?? 0;
    const maxA = inst.instanceState.ammeterRangeMaxA ?? 0.6;
    return {
      readoutBadge: `I = ${iA.toFixed(3)} A (Thang ${maxA}A)`,
      isDigitalScale: true,
      interactionHint:
        '3 cọc trên dải xanh lá: AM_NEG (-), AM_06A (0.6A), AM_3A (3A), R_A = 0.05Ω. Mắc NỐI TIẾP vào mạch chính!',
    };
  }
  if (arch === 'dc-voltmeter') {
    const uV = inst.instanceState.voltmeterReadingV ?? 0;
    const maxV = inst.instanceState.voltmeterRangeMaxV ?? 6.0;
    return {
      readoutBadge: `U = ${uV.toFixed(2)} V (Thang ${maxV}V)`,
      isDigitalScale: true,
      interactionHint:
        '3 cọc trên dải xanh dương: VM_NEG (-), VM_6V (6V), VM_12V (12V), R_V = 10000Ω. Mắc SONG SONG với bóng đèn!',
    };
  }

  // Specimens & Calibration Weight
  const massG = asset.scientificProperties.referenceMass?.value ?? 66.25;
  const volCm3 = asset.scientificProperties.referenceVolume?.value ?? 24.5;
  return {
    readoutBadge: `${massG.toFixed(1)} g · ${volCm3.toFixed(1)} cm³`,
    isDigitalScale: false,
    interactionHint: 'Kéo thả lên đĩa Cân điện tử, nhúng vào Ống đong/Bình tràn, hoặc móc vào Lực kế',
  };
}

interface LabViewport3DProps {
  instances: SceneInstance[];
  assetsMap: Map<string, AssetDefinition>;
  allAssets?: AssetDefinition[];
  selectedInstanceId: string | null;
  selectedCatalogAsset: AssetDefinition | null;
  onSelectCatalogAsset?: (assetId: string) => void;
  environment: LabEnvironment;
  environments?: LabEnvironment[];
  isStudentMode?: boolean;
  isNeuralGuideEnabled?: boolean;
  studentCurrentHint?: string;
  relevantAssetIds?: Set<string>;
  toolMode: TransformToolMode;
  viewMode: ViewportDisplayMode;
  showGrid: boolean;
  showAxes: boolean;
  showLabels: boolean;
  showDimensions: boolean;
  isFullscreen: boolean;
  isDarkMode?: boolean;
  isGuideOpen?: boolean;
  onToggleGuide?: () => void;
  isLibraryOpen?: boolean;
  onToggleLibrary?: () => void;
  equipmentCount?: number;
  onSelectInstance: (instanceId: string | null) => void;
  onUpdateInstanceTransform: (
    instanceId: string,
    positionM: [number, number, number],
    rotationRad: [number, number, number],
  ) => void;
  onPhysicalDockInteraction?: (
    draggedInstanceId: string,
    targetInstanceId: string | null,
    slot: PhysicalDockTargetSlot,
    finalPositionM: [number, number, number],
  ) => void;
  onQuickLabAction?: (action: QuickLabActionType, instanceId: string) => void;
  onUpdateInstanceState?: (
    instanceId: string,
    statePatch: Partial<SceneInstance['instanceState']>,
    notificationMsg?: string,
  ) => void;
  onDispenseWaterVolume?: (
    targetInstanceId: string,
    volumeMl: number,
    mode: 'add' | 'set' | 'refill-dispenser',
  ) => void;
  onRealtimeTiltPour?: (
    sourceInstanceId: string,
    targetInstanceId: string | null,
    deltaVolumeMl: number,
    currentTiltDeg: number,
    isFinalSummary?: boolean,
    totalSessionPouredMl?: number,
  ) => void;
  onDropAssetIntoScene: (assetId: string, positionM: [number, number, number]) => void;
  onToolModeChange: (mode: TransformToolMode) => void;
  onViewModeChange: (mode: ViewportDisplayMode) => void;
  onToggleGrid: () => void;
  onToggleAxes: () => void;
  onToggleLabels: () => void;
  onToggleDimensions: () => void;
  onToggleFullscreen: () => void;
  onResetScene: () => void;
  onSelectEnvironment?: (envId: string) => void;
  onNotify: (message: string, tone?: 'info' | 'success' | 'warning' | 'error') => void;
  showDetailedGuides?: boolean;
  onToggleDetailedGuides?: () => void;
  onOpenAssetDetailModal?: (asset: AssetDefinition, editMode?: boolean) => void;
  onAddAssetToTable?: (assetId: string) => void;
  onOpenGlobalEquipmentLibrary?: () => void;
}

export interface Equipment360PartCallout {
  id: string;
  pinNum: number;
  partTitle: string;
  functionDetail: string;
  side: 'left' | 'right';
  topPercent: number;
  pinXPercent: number;
  pinYPercent: number;
}

export interface Equipment360UsageGuide {
  standardFunction: string;
  steps: string[];
  readingRule: string;
  safetyNote: string;
}

function getRecommended360ScaleAndFraming(asset: AssetDefinition): {
  defaultScale: number;
  cameraPos: [number, number, number];
  cameraTargetYOffset: number;
} {
  const arch = asset.geometry.proceduralArchetype;
  const h = asset.geometry.boundingBoxM.height || 0.16;

  if (
    arch === 'calibration-weight' ||
    arch === 'solid-cylinder' ||
    arch === 'solid-sphere' ||
    arch === 'solid-block' ||
    arch === 'hollow-cylinder'
  ) {
    return {
      defaultScale: 2.15,
      cameraPos: [0.24, BENCH_SURFACE_Y + 0.19, 0.36],
      cameraTargetYOffset: 0.06,
    };
  }
  if (
    arch === 'vernier-caliper' ||
    arch === 'porcelain-dish' ||
    arch === 'optical-prism' ||
    arch === 'semicircular-slab' ||
    arch === 'laser-source'
  ) {
    return {
      defaultScale: 1.75,
      cameraPos: [0.28, BENCH_SURFACE_Y + 0.24, 0.44],
      cameraTargetYOffset: 0.07,
    };
  }
  if (
    arch === 'retort-stand' ||
    arch === 'water-dispenser' ||
    arch === 'separatory-funnel' ||
    arch === 'distillation-flask'
  ) {
    return {
      defaultScale: 1.22,
      cameraPos: [0.42, BENCH_SURFACE_Y + 0.36, 0.68],
      cameraTargetYOffset: Math.min(0.24, h * 0.52),
    };
  }
  return {
    defaultScale: 1.45,
    cameraPos: [0.34, BENCH_SURFACE_Y + 0.28, 0.54],
    cameraTargetYOffset: Math.max(0.08, Math.min(0.18, h * 0.5)),
  };
}

function get360EquipmentPartCallouts(
  asset: AssetDefinition,
): Equipment360PartCallout[] {
  const arch = asset.geometry.proceduralArchetype;
  switch (arch) {
    case 'electronic-balance':
      return [
        {
          id: 'part-1',
          pinNum: 1,
          partTitle: 'Đĩa cân thép không gỉ Inox 304',
          functionDetail:
            'Bề mặt chịu tải chống ăn mòn hóa chất, đặt vật mẫu hoặc cốc chứa vào đúng tâm đĩa để phân bố lực cân bằng.',
          side: 'left',
          topPercent: 24,
          pinXPercent: 48,
          pinYPercent: 36,
        },
        {
          id: 'part-2',
          pinNum: 2,
          partTitle: 'Màn hình LCD 7-Segment độ nét cao',
          functionDetail:
            'Hiển thị trực tiếp khối lượng thời gian thực (đơn vị g) với độ phân giải 0.01 g kèm đèn nền chống lóa.',
          side: 'right',
          topPercent: 26,
          pinXPercent: 53,
          pinYPercent: 52,
        },
        {
          id: 'part-3',
          pinNum: 3,
          partTitle: 'Cụm phím điều khiển TARE / ZERO / UNIT',
          functionDetail:
            'Phím TARE dùng để trừ bì khối lượng cốc chứa về 0.00 g; phím ZERO hiệu chuẩn điểm không trước khi cân.',
          side: 'right',
          topPercent: 58,
          pinXPercent: 56,
          pinYPercent: 62,
        },
        {
          id: 'part-4',
          pinNum: 4,
          partTitle: 'Cảm biến Loadcell & Chân đế cân bằng',
          functionDetail:
            'Biến đổi lực nén trọng trường thành tín hiệu số chính xác; 4 chân cao su chống trượt giữ cân ổn định trên bàn.',
          side: 'left',
          topPercent: 60,
          pinXPercent: 44,
          pinYPercent: 68,
        },
      ];

    case 'graduated-cylinder':
      return [
        {
          id: 'part-1',
          pinNum: 1,
          partTitle: 'Miệng ống đong & Mỏ rót định hướng',
          functionDetail:
            'Thiết kế mỏ vát nghiêng giúp rót chất lỏng sang dụng cụ khác gọn gàng, không chảy lem dọc thành ngoài.',
          side: 'left',
          topPercent: 20,
          pinXPercent: 49,
          pinYPercent: 25,
        },
        {
          id: 'part-2',
          pinNum: 2,
          partTitle: 'Thang chia độ khắc men trắng (10–100 ml)',
          functionDetail:
            'Vạch chia chuẩn In 20°C với Độ chia nhỏ nhất (ĐCNN) 1 ml, dùng để đọc thể tích V₁ và V₂ theo đáy mặt khum lõm.',
          side: 'right',
          topPercent: 36,
          pinXPercent: 52,
          pinYPercent: 48,
        },
        {
          id: 'part-3',
          pinNum: 3,
          partTitle: 'Thân trụ thủy tinh Borosilicate 3.3',
          functionDetail:
            'Độ trong suốt quang học cao giúp quan sát rõ mặt thoáng chất lỏng và vật rắn chìm hoàn toàn bên trong.',
          side: 'left',
          topPercent: 56,
          pinXPercent: 48,
          pinYPercent: 60,
        },
        {
          id: 'part-4',
          pinNum: 4,
          partTitle: 'Chân đế lục giác rộng chống lật',
          functionDetail:
            'Giữ ống đong luôn đứng thẳng vuông góc với mặt bàn ngang để tránh sai số góc nghiêng khi đọc vạch chia.',
          side: 'right',
          topPercent: 68,
          pinXPercent: 50,
          pinYPercent: 78,
        },
      ];

    case 'overflow-can':
      return [
        {
          id: 'part-1',
          pinNum: 1,
          partTitle: 'Miệng bình rộng & Vạch ngưỡng tràn 210 ml',
          functionDetail:
            'Cho phép thả dễ dàng các mẫu vật rắn kích thước lớn không bỏ lọt ống đong thông thường.',
          side: 'left',
          topPercent: 22,
          pinXPercent: 48,
          pinYPercent: 32,
        },
        {
          id: 'part-2',
          pinNum: 2,
          partTitle: 'Vòi xả tràn nghiêng 28° định hướng',
          functionDetail:
            'Dẫn toàn bộ thể tích nước bị vật rắn chiếm chỗ (ΔV) chảy sang cốc thuỷ tinh hoặc ống đong hứng bên dưới.',
          side: 'right',
          topPercent: 30,
          pinXPercent: 58,
          pinYPercent: 46,
        },
        {
          id: 'part-3',
          pinNum: 3,
          partTitle: 'Thân bình trụ thủy tinh chịu nhiệt',
          functionDetail:
            'Chứa cột nước chuẩn ngang cổ vòi tràn; quan sát trực quan quá trình vật rắn chìm và đẩy nước dâng.',
          side: 'left',
          topPercent: 58,
          pinXPercent: 47,
          pinYPercent: 62,
        },
        {
          id: 'part-4',
          pinNum: 4,
          partTitle: 'Đế thủy tinh phẳng chống trượt',
          functionDetail:
            'Đặt cố định trên mặt bàn ngang để giữ mực nước ngưỡng tràn không bị dao động trước khi thả vật.',
          side: 'right',
          topPercent: 66,
          pinXPercent: 50,
          pinYPercent: 76,
        },
      ];

    case 'beaker-250':
    case 'beaker-bomex-100':
    case 'erlenmeyer-flask':
      return [
        {
          id: 'part-1',
          pinNum: 1,
          partTitle:
            arch === 'erlenmeyer-flask'
              ? 'Cổ bình trụ hẹp & Miệng viền chịu lực'
              : 'Miệng cốc loe & Mỏ rót chất lỏng (Spout)',
          functionDetail:
            arch === 'erlenmeyer-flask'
              ? 'Giúp lắc trộn dung dịch chuẩn độ mạnh mà không bị sánh văng hóa chất ra ngoài; dễ đậy nút cao su.'
              : 'Định hướng tia chất lỏng khi nghiêng rót sang ống đong hoặc phễu mà không bị chảy dọc thành ngoài.',
          side: 'left',
          topPercent: 22,
          pinXPercent: 48,
          pinYPercent: 28,
        },
        {
          id: 'part-2',
          pinNum: 2,
          partTitle: 'Thang chia vạch dung tích & Nhãn men trắng',
          functionDetail:
            'Hiển thị ước lượng thể tích chất lỏng chứa trong bình (ml) và vùng nhãn nhám để ghi tên dung dịch.',
          side: 'right',
          topPercent: 34,
          pinXPercent: 53,
          pinYPercent: 48,
        },
        {
          id: 'part-3',
          pinNum: 3,
          partTitle: 'Thành thủy tinh Borosilicate 3.3 chịu nhiệt',
          functionDetail:
            'Chịu sốc nhiệt tới ΔT = 160°C và kháng axit/kiềm, cho phép đun nóng trực tiếp trên lưới amiăng.',
          side: 'left',
          topPercent: 56,
          pinXPercent: 46,
          pinYPercent: 58,
        },
        {
          id: 'part-4',
          pinNum: 4,
          partTitle: 'Đáy phẳng truyền nhiệt & Đặt cân điện tử',
          functionDetail:
            'Tiếp xúc phẳng hoàn toàn với đĩa cân điện tử khi cân khối lượng nước tràn hoặc đun cách thủy.',
          side: 'right',
          topPercent: 66,
          pinXPercent: 50,
          pinYPercent: 74,
        },
      ];

    case 'water-dispenser':
      return [
        {
          id: 'part-1',
          pinNum: 1,
          partTitle: 'Nắp vặn chuẩn GL45 nhựa PP xanh',
          functionDetail:
            'Đậy kín miệng bình tránh bụi bẩn và có van cân bằng áp suất khí quyển khi xả nước qua vòi.',
          side: 'left',
          topPercent: 20,
          pinXPercent: 48,
          pinYPercent: 26,
        },
        {
          id: 'part-2',
          pinNum: 2,
          partTitle: 'Thân bình chứa 1000 ml có vạch chia',
          functionDetail:
            'Chứa nước cất dự trữ cho toàn bộ bàn thí nghiệm với thang đo từ 100 ml đến 1000 ml.',
          side: 'left',
          topPercent: 52,
          pinXPercent: 47,
          pinYPercent: 50,
        },
        {
          id: 'part-3',
          pinNum: 3,
          partTitle: 'Van khóa PTFE & Đồng hồ lưu lượng LCD',
          functionDetail:
            'Cho phép nhập chính xác thể tích nước (ml) cần lấy và xả tự động vào ống đong hoặc cốc hứng.',
          side: 'right',
          topPercent: 42,
          pinXPercent: 56,
          pinYPercent: 58,
        },
        {
          id: 'part-4',
          pinNum: 4,
          partTitle: 'Chân đế cao tầng tạo thế năng thủy tĩnh',
          functionDetail:
            'Nâng cao vị trí vòi xả giúp đặt vừa ống đong 100 ml và bình tràn ngay phía dưới vòi cấp nước.',
          side: 'right',
          topPercent: 68,
          pinXPercent: 50,
          pinYPercent: 76,
        },
      ];

    case 'spring-dynamometer':
      return [
        {
          id: 'part-1',
          pinNum: 1,
          partTitle: 'Khuyên treo cố định & Đai ốc chỉnh 0 N',
          functionDetail:
            'Dùng để cầm tay hoặc móc lên giá thí nghiệm; xoay đai ốc đỉnh để đưa vạch chỉ thị về đúng 0.0 N khi chưa treo tải.',
          side: 'left',
          topPercent: 20,
          pinXPercent: 50,
          pinYPercent: 24,
        },
        {
          id: 'part-2',
          pinNum: 2,
          partTitle: 'Lò xo thép đàn hồi & Đĩa chỉ thị đỏ',
          functionDetail:
            'Giãn tỉ lệ thuận với lực kéo theo định luật Hooke; đĩa chỉ thị trượt dọc thang đo Newton (GHĐ 5 N, ĐCNN 0.1 N).',
          side: 'right',
          topPercent: 38,
          pinXPercent: 51,
          pinYPercent: 46,
        },
        {
          id: 'part-3',
          pinNum: 3,
          partTitle: 'Thân vỏ bảo vệ khắc thang đo kép (N / g)',
          functionDetail:
            'Bảo vệ lò xo không bị biến dạng lệch trục và hiển thị rõ các vạch chia lực từ 0.0 N đến 5.0 N.',
          side: 'left',
          topPercent: 54,
          pinXPercent: 48,
          pinYPercent: 56,
        },
        {
          id: 'part-4',
          pinNum: 4,
          partTitle: 'Móc treo tải trọng bằng thép mạ crom',
          functionDetail:
            'Móc trực tiếp vào vật mẫu hoặc quả cân chuẩn để đo trọng lượng P = m·g hoặc lực đẩy Ác-si-mét.',
          side: 'right',
          topPercent: 68,
          pinXPercent: 50,
          pinYPercent: 76,
        },
      ];

    case 'vernier-caliper':
      return [
        {
          id: 'part-1',
          pinNum: 1,
          partTitle: 'Hàm kẹp đo kích thước ngoài & trong',
          functionDetail:
            'Hàm lớn phía dưới kẹp đo đường kính ngoài/chiều dày; hàm nhỏ phía trên đo đường kính lỗ trong.',
          side: 'left',
          topPercent: 24,
          pinXPercent: 43,
          pinYPercent: 46,
        },
        {
          id: 'part-2',
          pinNum: 2,
          partTitle: 'Thước du xích (Vernier 0.02 mm) & Màn hình số',
          functionDetail:
            'Khung trượt mang vạch chia du xích đọc phần lẻ chính xác tới 0.02 mm; vít hãm cố định vị trí khi đọc số.',
          side: 'right',
          topPercent: 28,
          pinXPercent: 51,
          pinYPercent: 46,
        },
        {
          id: 'part-3',
          pinNum: 3,
          partTitle: 'Thân thước chính bằng thép Inox (0–150 mm)',
          functionDetail:
            'Thân thép không gỉ khắc laser vạch milimét chuẩn, mài phẳng chính xác chống cong vênh.',
          side: 'left',
          topPercent: 58,
          pinXPercent: 54,
          pinYPercent: 52,
        },
        {
          id: 'part-4',
          pinNum: 4,
          partTitle: 'Thanh đo chiều sâu & Con lăn đẩy ngón cái',
          functionDetail:
            'Thanh mảnh phía đuôi thò ra đồng bộ với độ mở hàm kẹp để đo chiều sâu lòng ống trụ rỗng.',
          side: 'right',
          topPercent: 62,
          pinXPercent: 60,
          pinYPercent: 54,
        },
      ];

    case 'thermometer':
      return [
        {
          id: 'part-1',
          pinNum: 1,
          partTitle: 'Khuyên treo đỉnh & Đầu hàn kín an toàn',
          functionDetail:
            'Giúp treo nhiệt kế lên kẹp giá đỡ để bầu nhiệt kế lơ lửng trong chất lỏng, không chạm đáy cốc đang đun.',
          side: 'left',
          topPercent: 20,
          pinXPercent: 50,
          pinYPercent: 22,
        },
        {
          id: 'part-2',
          pinNum: 2,
          partTitle: 'Ống mao dẫn & Cột chất lỏng chỉ thị đỏ',
          functionDetail:
            'Cột cồn hữu cơ nhuộm đỏ giãn nở vì nhiệt dọc ống mao dẫn chân không khi nhiệt độ tăng từ -10°C đến 110°C.',
          side: 'right',
          topPercent: 36,
          pinXPercent: 51,
          pinYPercent: 45,
        },
        {
          id: 'part-3',
          pinNum: 3,
          partTitle: 'Thang chia độ Celsius (°C) ĐCNN 1°C',
          functionDetail:
            'Vạch chia khắc rõ trên nền men trắng chống mờ giúp đọc chính xác nhiệt độ sôi và nhiệt độ cân bằng.',
          side: 'left',
          topPercent: 54,
          pinXPercent: 49,
          pinYPercent: 58,
        },
        {
          id: 'part-4',
          pinNum: 4,
          partTitle: 'Bầu cảm biến nhiệt thành mỏng nhạy nhiệt',
          functionDetail:
            'Nơi tiếp xúc trực tiếp với môi trường cần đo nhiệt độ; thành thủy tinh mỏng giúp truyền nhiệt tức thời.',
          side: 'right',
          topPercent: 68,
          pinXPercent: 50,
          pinYPercent: 78,
        },
      ];

    case 'laser-source':
      return [
        {
          id: 'part-1',
          pinNum: 1,
          partTitle: 'Thấu kính chuẩn trực & Cửa phát tia Laser 650 nm',
          functionDetail:
            'Tạo chùm tia sáng đỏ đơn sắc song song, mảnh và rõ nét đi là là trên mặt bảng chia độ quang học.',
          side: 'left',
          topPercent: 24,
          pinXPercent: 55,
          pinYPercent: 45,
        },
        {
          id: 'part-2',
          pinNum: 2,
          partTitle: 'Công tắc nguồn & Chuyển chế độ 1 tia / 3 tia',
          functionDetail:
            'Bật/tắt nguồn diode bán dẫn và chọn phát 1 tia đơn khảo sát khúc xạ hoặc 3 tia khảo sát thấu kính.',
          side: 'right',
          topPercent: 30,
          pinXPercent: 48,
          pinYPercent: 42,
        },
        {
          id: 'part-3',
          pinNum: 3,
          partTitle: 'Vỏ nhôm tản nhiệt Anodized & Đèn báo nguồn',
          functionDetail:
            'Bảo vệ mạch ổn áp diode laser hoạt động liên tục và tản nhiệt an toàn trong suốt tiết học.',
          side: 'left',
          topPercent: 58,
          pinXPercent: 46,
          pinYPercent: 54,
        },
        {
          id: 'part-4',
          pinNum: 4,
          partTitle: 'Đế từ tính & Chân căn chỉnh độ cao tia',
          functionDetail:
            'Giữ đèn laser cố định trên bàn quang học và chỉnh góc nghiêng chùm sáng đi qua đúng tâm bản bán trụ.',
          side: 'right',
          topPercent: 64,
          pinXPercent: 50,
          pinYPercent: 62,
        },
      ];

    case 'semicircular-slab':
      return [
        {
          id: 'part-1',
          pinNum: 1,
          partTitle: 'Mặt phẳng phân cách tâm O (Đường kính bản)',
          functionDetail:
            'Nơi tia sáng tới đi vào hoặc đi ra để khảo sát định luật khúc xạ ánh sáng n₁·sin(i) = n₂·sin(r).',
          side: 'left',
          topPercent: 22,
          pinXPercent: 48,
          pinYPercent: 44,
        },
        {
          id: 'part-2',
          pinNum: 2,
          partTitle: 'Mặt cong bán trụ thủy tinh quang học BK7 (n = 1.50)',
          functionDetail:
            'Mọi tia sáng đi qua tâm O đều vuông góc với mặt cong nên truyền thẳng không bị khúc xạ tại mặt cong.',
          side: 'right',
          topPercent: 30,
          pinXPercent: 54,
          pinYPercent: 46,
        },
        {
          id: 'part-3',
          pinNum: 3,
          partTitle: 'Đĩa tròn chia độ 360° (4 góc phần tư 0°–90°)',
          functionDetail:
            'Đọc trực tiếp góc tới i, góc khúc xạ r và góc tới hạn phản xạ toàn phần i_th ≈ 41.8°.',
          side: 'left',
          topPercent: 58,
          pinXPercent: 45,
          pinYPercent: 56,
        },
        {
          id: 'part-4',
          pinNum: 4,
          partTitle: 'Tia Laser mô phỏng Khúc xạ & Phản xạ toàn phần',
          functionDetail:
            'Hiển thị trực quan tia tới, tia phản xạ mờ và tia khúc xạ đổi góc theo thời gian thực khi xoay góc tới i.',
          side: 'right',
          topPercent: 64,
          pinXPercent: 56,
          pinYPercent: 56,
        },
      ];

    case 'optical-prism':
      return [
        {
          id: 'part-1',
          pinNum: 1,
          partTitle: 'Góc chiết quang A = 60° (Đỉnh lăng kính)',
          functionDetail:
            'Góc hợp bởi hai mặt bên quang học của lăng kính tam giác đều, quyết định góc lệch cực tiểu D_min.',
          side: 'left',
          topPercent: 22,
          pinXPercent: 50,
          pinYPercent: 34,
        },
        {
          id: 'part-2',
          pinNum: 2,
          partTitle: 'Hai mặt bên đánh bóng quang học λ/4',
          functionDetail:
            'Nơi chùm sáng trắng hoặc laser khúc xạ hai lần và tách thành dải phổ 7 màu (Đỏ - Cam - Vàng - Lục - Lam - Chàm - Tím).',
          side: 'right',
          topPercent: 34,
          pinXPercent: 53,
          pinYPercent: 48,
        },
        {
          id: 'part-3',
          pinNum: 3,
          partTitle: 'Khối thủy tinh Flint tán sắc cao (n = 1.52–1.62)',
          functionDetail:
            'Chiết suất thay đổi theo bước sóng ánh sáng (n_tím > n_đỏ) tạo nên hiện tượng tán sắc ánh sáng chuẩn SGK KHTN 9.',
          side: 'left',
          topPercent: 56,
          pinXPercent: 47,
          pinYPercent: 54,
        },
        {
          id: 'part-4',
          pinNum: 4,
          partTitle: 'Bệ đỡ xoay 360° kèm cọc định tâm',
          functionDetail:
            'Giúp xoay lăng kính quanh trục thẳng đứng để thay đổi góc tới i₁ mà không cần chạm tay vào mặt kính.',
          side: 'right',
          topPercent: 66,
          pinXPercent: 50,
          pinYPercent: 68,
        },
      ];

    case 'optical-lens':
    case 'magnifying-glass':
      return [
        {
          id: 'part-1',
          pinNum: 1,
          partTitle: 'Thấu kính hai mặt lồi (Tiêu cự f = +100 mm)',
          functionDetail:
            'Phần rìa mỏng hơn phần giữa; hội tụ chùm tia sáng song song tại tiêu điểm chính F’ hoặc tạo ảnh phóng đại.',
          side: 'left',
          topPercent: 22,
          pinXPercent: 50,
          pinYPercent: 34,
        },
        {
          id: 'part-2',
          pinNum: 2,
          partTitle: 'Vành khung kim loại bảo vệ quang tâm O',
          functionDetail:
            'Cố định thấu kính chắc chắn, chống sứt mẻ rìa kính và đánh dấu trục chính quang học.',
          side: 'right',
          topPercent: 34,
          pinXPercent: 54,
          pinYPercent: 38,
        },
        {
          id: 'part-3',
          pinNum: 3,
          partTitle:
            arch === 'magnifying-glass'
              ? 'Tay cầm bọc nhám chống trượt'
              : 'Trụ đỡ điều chỉnh độ cao đồng trục',
          functionDetail:
            arch === 'magnifying-glass'
              ? 'Cầm tay đưa kính lúp lại gần vật mẫu (d < f) để quan sát ảnh ảo cùng chiều, lớn hơn vật.'
              : 'Giữ tâm quang học O của thấu kính ngang bằng với độ cao đèn phát tia Laser.',
          side: 'left',
          topPercent: 58,
          pinXPercent: 49,
          pinYPercent: 58,
        },
        {
          id: 'part-4',
          pinNum: 4,
          partTitle: 'Đế đặt bàn / Chốt gắn băng quang học',
          functionDetail:
            'Giúp di chuyển thấu kính dọc theo thước thẳng để đo khoảng cách vật d và khoảng cách ảnh d’.',
          side: 'right',
          topPercent: 68,
          pinXPercent: 50,
          pinYPercent: 74,
        },
      ];

    case 'optical-microscope':
      return [
        {
          id: 'part-1',
          pinNum: 1,
          partTitle: 'Thị kính quang học WF10× nghiêng 45°',
          functionDetail:
            'Nơi đặt mắt quan sát ảnh phóng đại cuối cùng của tiêu bản tế bào/nhiễm sắc thể.',
          side: 'left',
          topPercent: 20,
          pinXPercent: 48,
          pinYPercent: 26,
        },
        {
          id: 'part-2',
          pinNum: 2,
          partTitle: 'Mâm xoay 3 vật kính (10×, 40×, 100×)',
          functionDetail:
            'Xoay để chọn độ phóng đại phù hợp: vật kính 10× tìm vùng mẫu, 40× và 100× soi chi tiết cấu trúc hiển vi.',
          side: 'right',
          topPercent: 34,
          pinXPercent: 52,
          pinYPercent: 44,
        },
        {
          id: 'part-3',
          pinNum: 3,
          partTitle: 'Bàn kính kẹp tiêu bản & Núm chỉnh tinh/thô',
          functionDetail:
            'Giữ cố định lam kính tiêu bản; vặn ốc sơ cấp/vi cấp để nâng hạ bàn kính lấy nét ảnh rõ nhất.',
          side: 'left',
          topPercent: 56,
          pinXPercent: 47,
          pinYPercent: 56,
        },
        {
          id: 'part-4',
          pinNum: 4,
          partTitle: 'Đèn chiếu LED tụ quang & Chân đế gang',
          functionDetail:
            'Cung cấp chùm sáng xuyên qua tiêu bản lên vật kính; chân đế nặng chống rung lắc khi soi độ phóng đại lớn.',
          side: 'right',
          topPercent: 66,
          pinXPercent: 50,
          pinYPercent: 74,
        },
      ];

    case 'digital-multimeter':
    case 'galvanometer':
      return [
        {
          id: 'part-1',
          pinNum: 1,
          partTitle:
            arch === 'galvanometer'
              ? 'Mặt chia độ vạch 0 giữa (-50..0..+50 μA) & Kim chỉ'
              : 'Màn hình LCD kỹ thuật số 3½ Digits',
          functionDetail:
            arch === 'galvanometer'
              ? 'Kim lệch phải hoặc trái tùy theo chiều dòng điện cảm ứng chạy qua cuộn dây dẫn kín.'
              : 'Hiển thị trực tiếp giá trị Điện áp (V), Cường độ dòng điện (A/mA) hoặc Điện trở (Ω) với độ chính xác cao.',
          side: 'left',
          topPercent: 22,
          pinXPercent: 49,
          pinYPercent: 34,
        },
        {
          id: 'part-2',
          pinNum: 2,
          partTitle:
            arch === 'galvanometer'
              ? 'Vít hiệu chỉnh điểm 0 cơ học (Zero Adjust)'
              : 'Núm xoay chọn đại lượng & Giới hạn đo',
          functionDetail:
            arch === 'galvanometer'
              ? 'Xoay nhẹ để đưa kim chỉ về đúng vạch 0 chính giữa trước khi tiến hành thí nghiệm cảm ứng điện từ.'
              : 'Chọn đúng chế độ DCV, ACV, DCA hoặc Ω trước khi chạm que đo vào mạch điện.',
          side: 'right',
          topPercent: 38,
          pinXPercent: 52,
          pinYPercent: 50,
        },
        {
          id: 'part-3',
          pinNum: 3,
          partTitle: 'Cọc đấu dây / Giắc cắm cực Âm (-) Đen & Dương (+) Đỏ',
          functionDetail:
            'Kết nối dây dẫn hoặc que đo vào hai đầu đoạn mạch; phân biệt rõ cực tính của dòng điện.',
          side: 'left',
          topPercent: 58,
          pinXPercent: 47,
          pinYPercent: 64,
        },
        {
          id: 'part-4',
          pinNum: 4,
          partTitle: 'Vỏ cách điện ABS & Chân chống nghiêng 45°',
          functionDetail:
            'Cách điện an toàn và giữ mặt đồng hồ nghiêng góc thuận lợi nhất cho tầm mắt học sinh đọc số.',
          side: 'right',
          topPercent: 66,
          pinXPercent: 52,
          pinYPercent: 72,
        },
      ];

    case 'induction-coil-led':
      return [
        {
          id: 'part-1',
          pinNum: 1,
          partTitle: 'Cuộn dây đồng tráng men 1200 vòng',
          functionDetail:
            'Khung dây dẫn kín sinh ra dòng điện cảm ứng khi số đường sức từ xuyên qua tiết diện S biến thiên.',
          side: 'left',
          topPercent: 22,
          pinXPercent: 47,
          pinYPercent: 42,
        },
        {
          id: 'part-2',
          pinNum: 2,
          partTitle: 'Hai đèn LED(1) Đỏ & LED(2) Xanh mắc song song ngược chiều',
          functionDetail:
            'LED 1 sáng khi từ thông tăng (đưa nam châm lại gần); LED 2 sáng khi từ thông giảm (kéo nam châm ra xa).',
          side: 'right',
          topPercent: 32,
          pinXPercent: 54,
          pinYPercent: 34,
        },
        {
          id: 'part-3',
          pinNum: 3,
          partTitle: 'Thanh nam châm vĩnh cửu hai cực Bắc (N) – Nam (S)',
          functionDetail:
            'Tạo ra từ trường mạnh dịch chuyển dọc trục lòng ống dây để khảo sát hiện tượng cảm ứng điện từ.',
          side: 'left',
          topPercent: 56,
          pinXPercent: 44,
          pinYPercent: 48,
        },
        {
          id: 'part-4',
          pinNum: 4,
          partTitle: 'Đế thực hành tích hợp cọc nối Điện kế G',
          functionDetail:
            'Giữ cố định hệ cuộn dây trên mặt bàn và cho phép nối thêm ra điện kế nhạy bên ngoài.',
          side: 'right',
          topPercent: 66,
          pinXPercent: 52,
          pinYPercent: 68,
        },
      ];

    case 'porcelain-dish':
      return [
        {
          id: 'part-1',
          pinNum: 1,
          partTitle: 'Lòng bát sứ tráng men chịu nhiệt 1100°C',
          functionDetail:
            'Chứa dung dịch muối cần cô cạn hoặc chứa cồn (ethylic alcohol) để thực hiện phản ứng đốt cháy.',
          side: 'left',
          topPercent: 22,
          pinXPercent: 50,
          pinYPercent: 38,
        },
        {
          id: 'part-2',
          pinNum: 2,
          partTitle: 'Mỏ rót gờ sứ & Thành bát dày giữ nhiệt',
          functionDetail:
            'Giúp gạn chất lỏng dễ dàng và phân bố nhiệt đều khắp lòng bát khi đun nóng, tránh nứt vỡ.',
          side: 'right',
          topPercent: 34,
          pinXPercent: 55,
          pinYPercent: 42,
        },
        {
          id: 'part-3',
          pinNum: 3,
          partTitle: 'Ngọn lửa phản ứng / Đèn cồn gia nhiệt dưới đáy',
          functionDetail:
            'Mô phỏng trực quan ngọn lửa xanh nhạt – vàng cam khi đốt cháy ethylic alcohol C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O.',
          side: 'left',
          topPercent: 58,
          pinXPercent: 48,
          pinYPercent: 52,
        },
        {
          id: 'part-4',
          pinNum: 4,
          partTitle: 'Kiềng sắt 3 chân & Lưới tản nhiệt',
          functionDetail:
            'Đỡ bát sứ ở độ cao chuẩn phía trên ngọn lửa đèn cồn và bảo vệ mặt bàn thí nghiệm.',
          side: 'right',
          topPercent: 68,
          pinXPercent: 52,
          pinYPercent: 68,
        },
      ];

    case 'separatory-funnel':
      return [
        {
          id: 'part-1',
          pinNum: 1,
          partTitle: 'Nút nhám đỉnh chuẩn 24/29 có rãnh thông khí',
          functionDetail:
            'Đậy kín khi lắc chiết chất lỏng; mở nút hoặc xoay rãnh thông khí trước khi xả lớp chất lỏng bên dưới.',
          side: 'left',
          topPercent: 18,
          pinXPercent: 50,
          pinYPercent: 22,
        },
        {
          id: 'part-2',
          pinNum: 2,
          partTitle: 'Bầu phễu hình quả lê & Mặt phân cách 2 pha lỏng',
          functionDetail:
            'Giúp hai chất lỏng không hòa tan (ví dụ dầu ăn nhẹ ở trên, nước nặng ở dưới) tách lớp rõ rệt.',
          side: 'right',
          topPercent: 34,
          pinXPercent: 52,
          pinYPercent: 42,
        },
        {
          id: 'part-3',
          pinNum: 3,
          partTitle: 'Khóa vặn PTFE (Stopcock) điều tiết dòng chảy',
          functionDetail:
            'Xoay ngang để khóa kín hoàn toàn; xoay dọc từ từ để xả riêng lớp chất lỏng nặng ở tầng dưới ra cốc hứng.',
          side: 'left',
          topPercent: 56,
          pinXPercent: 50,
          pinYPercent: 60,
        },
        {
          id: 'part-4',
          pinNum: 4,
          partTitle: 'Cuống phễu vát nghiêng dẫn dòng chính xác',
          functionDetail:
            'Đưa chất lỏng chảy thành dòng êm dọc theo thành bình hứng mà không bắn giọt.',
          side: 'right',
          topPercent: 68,
          pinXPercent: 50,
          pinYPercent: 74,
        },
      ];

    case 'distillation-flask':
      return [
        {
          id: 'part-1',
          pinNum: 1,
          partTitle: 'Cổ đứng lắp Nhiệt kế đo nhiệt độ hơi sôi',
          functionDetail:
            'Bầu nhiệt kế đặt đúng ngang vị trí nhánh dẫn hơi để xác định chính xác nhiệt độ sôi của cấu tử bay hơi.',
          side: 'left',
          topPercent: 20,
          pinXPercent: 47,
          pinYPercent: 24,
        },
        {
          id: 'part-2',
          pinNum: 2,
          partTitle: 'Nhánh nghiêng 75° & Ống sinh hàn ngưng tụ',
          functionDetail:
            'Dẫn hơi chất lỏng có nhiệt độ sôi thấp hơn sang ống làm lạnh để ngưng tụ thành chất lỏng tinh khiết.',
          side: 'right',
          topPercent: 32,
          pinXPercent: 57,
          pinYPercent: 42,
        },
        {
          id: 'part-3',
          pinNum: 3,
          partTitle: 'Bầu cầu thủy tinh Borosilicate 250 ml chứa hỗn hợp',
          functionDetail:
            'Hình cầu giúp chịu áp suất hơi và phân bố nhiệt đồng đều khi đun sôi hỗn hợp chất lỏng (như rượu – nước).',
          side: 'left',
          topPercent: 56,
          pinXPercent: 46,
          pinYPercent: 54,
        },
        {
          id: 'part-4',
          pinNum: 4,
          partTitle: 'Bếp đun / Đèn cồn gia nhiệt & Giá đỡ',
          functionDetail:
            'Cung cấp nhiệt lượng ổn định để duy trì quá trình bay hơi – ngưng tụ liên tục.',
          side: 'right',
          topPercent: 68,
          pinXPercent: 48,
          pinYPercent: 72,
        },
      ];

    case 'dna-double-helix':
      return [
        {
          id: 'part-1',
          pinNum: 1,
          partTitle: 'Hai mạch polynucleotide xoắn kép song song ngược chiều',
          functionDetail:
            'Khung xương đường deoxyribose – phosphate (3’→5’ và 5’→3’) tạo thành vòng xoắn chu kì 34 Å (10 cặp base).',
          side: 'left',
          topPercent: 22,
          pinXPercent: 48,
          pinYPercent: 30,
        },
        {
          id: 'part-2',
          pinNum: 2,
          partTitle: 'Các cặp nitrogenous base theo Nguyên tắc bổ sung',
          functionDetail:
            'Adenine (A) liên kết với Thymine (T) bằng 2 liên kết hydrogen; Guanine (G) liên kết với Cytosine (C) bằng 3 liên kết hydrogen.',
          side: 'right',
          topPercent: 36,
          pinXPercent: 52,
          pinYPercent: 46,
        },
        {
          id: 'part-3',
          pinNum: 3,
          partTitle: 'Trục trung tâm & Đường kính vòng xoắn 20 Å',
          functionDetail:
            'Giữ cấu trúc không gian 3 chiều ổn định với khoảng cách giữa 2 bậc thang kế tiếp là 3.4 Å.',
          side: 'left',
          topPercent: 56,
          pinXPercent: 49,
          pinYPercent: 60,
        },
        {
          id: 'part-4',
          pinNum: 4,
          partTitle: 'Chân đế trưng bày xoay 360° kèm bảng chú giải màu',
          functionDetail:
            'Phân biệt màu sắc đặc trưng của 4 loại nucleotide A – T – G – C theo chuẩn SGK KHTN 9.',
          side: 'right',
          topPercent: 68,
          pinXPercent: 50,
          pinYPercent: 76,
        },
      ];

    case 'retort-stand':
      return [
        {
          id: 'part-1',
          pinNum: 1,
          partTitle: 'Thanh trụ đứng Inox Ø10 mm cao 500 mm',
          functionDetail:
            'Trục chuẩn thẳng đứng để trượt và cố định các khớp nối chữ thập ở mọi độ cao mong muốn.',
          side: 'left',
          topPercent: 20,
          pinXPercent: 47,
          pinYPercent: 28,
        },
        {
          id: 'part-2',
          pinNum: 2,
          partTitle: 'Khớp nối chữ thập (Bosshead) & Vít hãm cánh chuồn',
          functionDetail:
            'Liên kết chắc chắn tay kẹp hoặc vòng đỡ vào thanh trụ đứng, điều chỉnh nhanh độ cao và góc xoay.',
          side: 'right',
          topPercent: 34,
          pinXPercent: 50,
          pinYPercent: 44,
        },
        {
          id: 'part-3',
          pinNum: 3,
          partTitle: 'Tay kẹp đa năng bọc nút bần / Cao su chịu nhiệt',
          functionDetail:
            'Kẹp giữ ống nghiệm, cổ bình cầu chưng cất, nhiệt kế hoặc treo lực kế lò xo mà không làm nứt thủy tinh.',
          side: 'left',
          topPercent: 54,
          pinXPercent: 55,
          pinYPercent: 48,
        },
        {
          id: 'part-4',
          pinNum: 4,
          partTitle: 'Đế gang đúc chữ nhật nặng 1.85 kg chống lật',
          functionDetail:
            'Hạ thấp trọng tâm toàn hệ giá đỡ, giữ vững các thiết bị thủy tinh và tải trọng treo trên cao.',
          side: 'right',
          topPercent: 68,
          pinXPercent: 50,
          pinYPercent: 78,
        },
      ];

    case 'calibration-weight':
    case 'solid-cylinder':
    case 'solid-sphere':
    case 'solid-block':
    case 'hollow-cylinder': {
      const dims = asset.geometry.boundingBoxM;
      const dimsMm = `${Math.round(dims.width * 1000)} × ${Math.round(
        dims.height * 1000,
      )} × ${Math.round(dims.depth * 1000)} mm`;
      const massG = asset.scientificProperties.referenceMass?.value ?? 66.25;
      const volCm3 = asset.scientificProperties.referenceVolume?.value ?? 24.5;
      const density = (massG / Math.max(0.01, volCm3)).toFixed(2);
      return [
        {
          id: 'part-1',
          pinNum: 1,
          partTitle:
            arch === 'hollow-cylinder'
              ? 'Lòng rỗng xuyên tâm chuẩn kích thước'
              : 'Núm cầm / Khuyên móc treo sợi chỉ & Lực kế',
          functionDetail:
            arch === 'hollow-cylinder'
              ? 'Dùng hàm đo trong và thanh đo sâu của thước cặp du xích để đo đường kính trong d và chiều cao h.'
              : 'Cho phép kẹp nhíp gắp lên đĩa cân điện tử hoặc buộc chỉ thả từ từ vào ống đong/bình tràn.',
          side: 'left',
          topPercent: 22,
          pinXPercent: 50,
          pinYPercent: 34,
        },
        {
          id: 'part-2',
          pinNum: 2,
          partTitle: `Khối vật liệu đặc chuẩn (${asset.scientificProperties.material.value})`,
          functionDetail: `Khối lượng chuẩn m = ${massG} g, thể tích V = ${volCm3} cm³, khối lượng riêng lý thuyết D = ${density} g/cm³.`,
          side: 'right',
          topPercent: 36,
          pinXPercent: 53,
          pinYPercent: 50,
        },
        {
          id: 'part-3',
          pinNum: 3,
          partTitle: `Bề mặt gia công CNC kích thước ${dimsMm}`,
          functionDetail:
            'Bề mặt nhẵn bóng không thấm nước, dùng thước cặp đo kích thước hình học đối chiếu với phương pháp dâng nước.',
          side: 'left',
          topPercent: 58,
          pinXPercent: 47,
          pinYPercent: 56,
        },
        {
          id: 'part-4',
          pinNum: 4,
          partTitle: 'Đáy phẳng đặt tâm đĩa cân & Chìm hoàn toàn trong nước',
          functionDetail:
            'Tiếp xúc ổn định trên đĩa cân điện tử (0.01 g) và chìm ngập hoàn toàn trong ống đong 100 ml / bình tràn.',
          side: 'right',
          topPercent: 68,
          pinXPercent: 50,
          pinYPercent: 68,
        },
      ];
    }

    default: {
      const dims = asset.geometry.boundingBoxM;
      const dimsMm = `${Math.round(dims.width * 1000)} × ${Math.round(
        dims.height * 1000,
      )} × ${Math.round(dims.depth * 1000)} mm`;
      return [
        {
          id: 'part-1',
          pinNum: 1,
          partTitle: `Phần đỉnh / Đầu thao tác (${asset.name.vi})`,
          functionDetail:
            asset.textbookRef?.standardFunction ||
            'Bộ phận tiếp nhận thao tác, kẹp giữ hoặc định hướng dòng chảy/tia sáng trong thí nghiệm.',
          side: 'left',
          topPercent: 24,
          pinXPercent: 48,
          pinYPercent: 34,
        },
        {
          id: 'part-2',
          pinNum: 2,
          partTitle: asset.measurementMetadata.isMeasuringInstrument
            ? `Cơ cấu đo lường (${
                asset.measurementMetadata.rangeMax?.value ?? ''
              } ${asset.measurementMetadata.rangeMax?.unit ?? ''})`
            : `Thân chính bằng ${asset.scientificProperties.material.value}`,
          functionDetail: asset.measurementMetadata.isMeasuringInstrument
            ? `Độ chia nhỏ nhất (ĐCNN): ${
                asset.measurementMetadata.leastCount?.value ?? 1
              } ${
                asset.measurementMetadata.leastCount?.unit ?? ''
              }. Quan sát trực diện để đọc chính xác số đo.`
            : `Cấu trúc vật liệu ${asset.scientificProperties.material.value} kích thước chuẩn ${dimsMm}, hoàn thiện vật lý PBR.`,
          side: 'right',
          topPercent: 42,
          pinXPercent: 53,
          pinYPercent: 50,
        },
        {
          id: 'part-3',
          pinNum: 3,
          partTitle: 'Đế tiếp xúc chuẩn mặt bàn phẳng (Anchor Base)',
          functionDetail: `Điểm neo chuẩn y = 0 trên mặt bàn thí nghiệm, khối lượng chuẩn m = ${
            asset.scientificProperties.referenceMass?.value ?? 66.25
          } ${asset.scientificProperties.referenceMass?.unit ?? 'g'}.`,
          side: 'left',
          topPercent: 64,
          pinXPercent: 49,
          pinYPercent: 72,
        },
      ];
    }
  }
}

function get360EquipmentUsageGuide(
  asset: AssetDefinition,
): Equipment360UsageGuide {
  const arch = asset.geometry.proceduralArchetype;
  const ghdText =
    asset.scientificProperties.capacity || asset.measurementMetadata?.rangeMax
      ? `${
          (
            asset.scientificProperties.capacity ||
            asset.measurementMetadata?.rangeMax
          )?.value
        } ${
          (
            asset.scientificProperties.capacity ||
            asset.measurementMetadata?.rangeMax
          )?.unit
        }`
      : 'Theo chuẩn phòng thí nghiệm';
  const dcnnText = asset.measurementMetadata?.leastCount
    ? `${asset.measurementMetadata.leastCount.value} ${asset.measurementMetadata.leastCount.unit}`
    : 'Đọc trực tiếp trên vạch/màn hình';

  switch (arch) {
    case 'electronic-balance':
      return {
        standardFunction:
          'Đo chính xác khối lượng (m) của vật mẫu rắn, quả cân chuẩn, cốc chứa chất lỏng hoặc hóa chất rắn với độ phân giải 0.01 g.',
        steps: [
          'Bước 1: Đặt cân điện tử trên mặt bàn phẳng ổn định, bật nguồn và chờ màn hình LCD hiển thị 0.00 g.',
          'Bước 2: Nhấn phím TARE (Trừ bì) để đưa chỉ số màn hình về đúng 0.00 g (nếu cân chất lỏng thì đặt cốc rỗng lên rồi bấm TARE).',
          'Bước 3: Đặt nhẹ vật mẫu vào chính giữa đĩa cân Inox, chờ ký hiệu ổn định rồi đọc giá trị khối lượng m (g).',
        ],
        readingRule: `GHĐ: ${ghdText} · ĐCNN: ${dcnnText}. Đọc trực tiếp số thập phân trên màn hình LCD 7-segment.`,
        safetyNote:
          'Không đặt vật vượt quá giới hạn đo 500 g, không ấn mạnh tay lên đĩa cân và không đổ trực tiếp hóa chất ăn mòn lên mặt đĩa.',
      };

    case 'graduated-cylinder':
      return {
        standardFunction:
          'Đo thể tích chất lỏng (V₁) và xác định thể tích vật rắn không thấm nước (ΔV = V₂ - V₁) bằng phương pháp dâng mực nước.',
        steps: [
          'Bước 1: Đặt ống đong thẳng đứng trên mặt bàn ngang, rót nước vào ống đến mức ban đầu V₁ (ví dụ 50.0 ml).',
          'Bước 2: Đặt mắt ngang đúng tầm với đáy mặt khum lõm (meniscus) của cột nước để đọc chính xác V₁.',
          'Bước 3: Thả nhẹ vật rắn chìm hoàn toàn trong nước, đọc mức nước dâng mới V₂ và tính thể tích vật V = V₂ - V₁.',
        ],
        readingRule: `GHĐ: ${ghdText} · ĐCNN: ${dcnnText}. Đặt mắt ngang đáy mặt khum lõm của nước (1 ml = 1 cm³).`,
        safetyNote:
          'Khi thả vật kim loại nặng vào ống đong thủy tinh, cần nghiêng nhẹ thành ống hoặc buộc dây thả từ từ để tránh vỡ đáy ống.',
      };

    case 'overflow-can':
      return {
        standardFunction:
          'Xác định thể tích của vật rắn có kích thước lớn (không bỏ lọt ống đong) thông qua lượng nước tràn ra từ vòi.',
        steps: [
          'Bước 1: Đổ nước vào bình tràn cho đến khi mực nước chạm đúng ngưỡng vòi xả (210.0 ml).',
          'Bước 2: Đặt cốc thủy tinh hoặc ống đong khô ráo ngay dưới đầu vòi tràn để hứng nước.',
          'Bước 3: Thả ngập hoàn toàn vật rắn vào bình tràn; toàn bộ thể tích nước chảy sang bình hứng chính là thể tích V của vật.',
        ],
        readingRule:
          'Đọc thể tích nước tràn ΔV thu được bên trong ống đong hoặc cốc hứng đặt dưới vòi.',
        safetyNote:
          'Đảm bảo mặt nước ban đầu ngang đúng cổ vòi tràn và không làm rung bàn trước khi thả vật.',
      };

    case 'beaker-250':
    case 'erlenmeyer-flask':
      return {
        standardFunction:
          arch === 'erlenmeyer-flask'
            ? 'Chứa dung dịch phản ứng, lắc trộn chuẩn độ hóa học hoặc hứng chất lỏng chưng cất mà không lo bắn tóe.'
            : 'Chứa chất lỏng, pha chế dung dịch, hứng nước từ bình tràn hoặc đun nóng chất lỏng trên lưới tản nhiệt.',
        steps: [
          `Bước 1: Kiểm tra ${asset.name.vi} sạch, khô ráo và đặt ngay ngắn trên mặt bàn phẳng (hoặc dưới vòi bình tràn).`,
          'Bước 2: Khi rót chất lỏng, nghiêng bình từ từ để dòng chảy đi qua mỏ rót/cổ bình êm ái vào dụng cụ nhận.',
          'Bước 3: Nếu cần xác định khối lượng chất lỏng bên trong, đặt bình rỗng lên cân điện tử bấm TARE về 0.00 g trước khi hứng nước.',
        ],
        readingRule: `Dung tích định danh: ${ghdText}. Vạch chia trên thành cốc dùng để ước lượng thể tích; muốn đo chính xác cao hãy chuyển sang Ống đong.`,
        safetyNote:
          'Khi đun nóng thủy tinh Borosilicate cần đặt qua lưới tản nhiệt và dùng kẹp gỗ/găng chịu nhiệt khi nhấc bình nóng.',
      };

    case 'water-dispenser':
      return {
        standardFunction:
          'Dự trữ 1000 ml nước cất tinh khiết và cấp chính xác một lượng nước định sẵn vào ống đong, cốc thủy tinh hoặc bình tràn.',
        steps: [
          'Bước 1: Đặt ống đong 100 ml, cốc thủy tinh 250 ml hoặc bình tràn ngay phía dưới đầu vòi xả của bình cấp nước.',
          'Bước 2: Mở khóa van PTFE hoặc chọn thể tích nước cần lấy (ví dụ 50 ml cho ống đong, 210 ml cho bình tràn).',
          'Bước 3: Quan sát dòng nước chảy vào dụng cụ hứng và khóa van lại ngay khi đạt đúng vạch chuẩn.',
        ],
        readingRule: `Dung tích chứa: 1000 ml · Lưu lượng xả điều chỉnh linh hoạt từ 1 ml đến 250 ml mỗi lần.`,
        safetyNote:
          'Luôn mở nhẹ nắp thông khí đỉnh bình khi xả lượng nước lớn để áp suất khí quyển đẩy nước chảy đều.',
      };

    case 'spring-dynamometer':
      return {
        standardFunction:
          'Đo trọng lượng P của vật (P = 10·m), lực kéo cơ học F và xác định lực đẩy Ác-si-mét F_A = P - F_nước.',
        steps: [
          'Bước 1: Treo lực kế thẳng đứng trên giá đỡ, điều chỉnh đai ốc đỉnh sao cho vạch chỉ thị đỏ nằm đúng vạch 0.0 N khi chưa treo vật.',
          'Bước 2: Móc vật mẫu vào móc treo dưới cùng, giữ lực kế dọc theo phương lực kéo để lò xo không cọ sát vào vỏ.',
          'Bước 3: Đặt mắt vuông góc với vạch chỉ thị đỏ khi lò xo đứng yên ổn định để đọc giá trị lực F (N).',
        ],
        readingRule: `GHĐ: 5.0 N · ĐCNN: 0.1 N (Mỗi vạch nhỏ ứng với 0.1 N ≈ 10 g trọng lượng).`,
        safetyNote:
          'Tuyệt đối không treo vật nặng quá giới hạn đo 5.0 N (~500 g) làm hỏng giới hạn đàn hồi của lò xo.',
      };

    case 'vernier-caliper':
      return {
        standardFunction:
          'Đo chính xác đường kính ngoài (D), đường kính trong (d), chiều dài (L) và chiều sâu (h) của các mẫu vật hình học với độ chính xác 0.02 mm.',
        steps: [
          'Bước 1: Khép kín hai mỏ kẹp để kiểm tra vạch 0 của thước du xích trùng khít với vạch 0 của thước chính (0.00 mm).',
          'Bước 2: Kéo khung trượt mở hàm kẹp, đặt vật mẫu vuông góc giữa hai mỏ đo ngoài rồi đẩy nhẹ hàm kẹp ôm sát bề mặt vật.',
          'Bước 3: Xiết nhẹ vít hãm, đọc phần nguyên (mm) trên thước chính trước vạch 0 du xích và phần lẻ trên vạch du xích trùng khít.',
        ],
        readingRule: `GHĐ: 150 mm · ĐCNN: 0.02 mm. Công thức đọc: L = a + k × 0.02 (mm).`,
        safetyNote:
          'Không ép mỏ kẹp quá mạnh vào vật mẫu gây biến dạng vật hoặc làm lệch chuẩn hàm đo.',
      };

    case 'thermometer':
      return {
        standardFunction:
          'Đo nhiệt độ của nước, dung dịch hóa học và hơi chưng cất trong dải từ -10°C đến 110°C.',
        steps: [
          'Bước 1: Kiểm tra cột chất lỏng màu đỏ trong ống mao dẫn liên tục, không bị đứt quãng và đọc nhiệt độ phòng ban đầu.',
          'Bước 2: Nhúng ngập bầu cảm biến của nhiệt kế vào giữa lòng chất lỏng cần đo (không để bầu chạm đáy hoặc thành bình đang đun).',
          'Bước 3: Chờ cột chất lỏng đỏ dâng lên và dừng lại ổn định, đặt mắt ngang vạch đỉnh cột chất lỏng để đọc nhiệt độ (°C).',
        ],
        readingRule: `GHĐ: 110 °C · ĐCNN: 1 °C (Đọc khi bầu nhiệt kế vẫn còn ngâm trong chất lỏng).`,
        safetyNote:
          'Không dùng nhiệt kế thay đũa thủy tinh để khuấy dung dịch và không nhúng đột ngột từ nước sôi sang nước đá.',
      };

    case 'laser-source':
    case 'semicircular-slab':
    case 'optical-prism':
    case 'optical-lens':
    case 'magnifying-glass':
      return {
        standardFunction:
          arch === 'semicircular-slab'
            ? 'Khảo sát định luật khúc xạ ánh sáng và hiện tượng phản xạ toàn phần khi tia sáng truyền qua mặt phân cách hai môi trường.'
            : arch === 'optical-prism'
              ? 'Khảo sát sự khúc xạ qua lăng kính và hiện tượng tán sắc ánh sáng trắng thành dải màu cầu vồng (SGK KHTN 9).'
              : arch === 'laser-source'
                ? 'Tạo chùm tia sáng hẹp, song song (λ = 650 nm) làm tia sáng chuẩn để vẽ đường truyền ánh sáng trong các thí nghiệm Quang học.'
                : 'Khảo sát sự hội tụ chùm tia sáng qua thấu kính lồi (f = 100 mm) và quan sát ảnh phóng đại của vật.',
        steps: [
          'Bước 1: Đặt thiết bị quang học lên mặt phẳng bàn ngang (có thể giảm độ sáng phòng xuống 20–30% để tia sáng rực rỡ nhất).',
          'Bước 2: Bật nguồn đèn Laser và chiếu tia sáng đi là là trên mặt bảng chia độ qua tâm O của bản bán trụ / lăng kính / thấu kính.',
          'Bước 3: Thay đổi góc tới i từ 0° đến 80° trong bảng Hiệu chỉnh thông số để quan sát góc khúc xạ r, góc lệch D và phản xạ toàn phần.',
        ],
        readingRule:
          arch === 'semicircular-slab'
            ? 'Định luật khúc xạ: sin(i) / sin(r) = n ≈ 1.50 · Góc tới hạn phản xạ toàn phần i_th ≈ 41.8°.'
            : 'Đọc góc tới i, góc khúc xạ r trên vòng tròn chia độ 360° (ĐCNN 1°) hoặc tiêu cự f (mm).',
        safetyNote:
          'Tuyệt đối không chiếu trực tiếp tia Laser vào mắt người đối diện; cầm vào phần đế hoặc vành khung để tránh in dấu vân tay lên mặt kính.',
      };

    case 'optical-microscope':
      return {
        standardFunction:
          'Phóng đại ảnh của tiêu bản sinh học (tế bào, bộ nhiễm sắc thể cố định) từ 40× đến 1000× để quan sát cấu trúc hiển vi.',
        steps: [
          'Bước 1: Đặt lam kính tiêu bản lên bàn kính, dùng kẹp giữ cố định và bật đèn chiếu sáng LED dưới tụ quang.',
          'Bước 2: Xoay mâm vật kính về vật kính nhỏ nhất (10×), vặn ốc sơ cấp đưa vật kính lại gần tiêu bản rồi nhìn vào thị kính tìm vùng mẫu.',
          'Bước 3: Chuyển mâm xoay sang vật kính 40× hoặc 100× và chỉ vặn nhẹ ốc vi cấp (chỉnh tinh) để lấy nét rõ từng nhiễm sắc thể.',
        ],
        readingRule:
          'Độ phóng đại tổng cộng G = G_thị_kính (10×) × G_vật_kính (10× / 40× / 100×) = 100× đến 1000×.',
        safetyNote:
          'Khi đang ở vật kính 40× và 100×, tuyệt đối không vặn ốc sơ cấp (ốc to) để tránh làm đầu vật kính ép vỡ tiêu bản thủy tinh.',
      };

    case 'digital-multimeter':
    case 'galvanometer':
    case 'induction-coil-led':
      return {
        standardFunction:
          arch === 'digital-multimeter'
            ? 'Đo hiệu điện thế một chiều/xoay chiều (U), cường độ dòng điện (I) và điện trở (R) của các phần tử trong mạch điện.'
            : 'Phát hiện dòng điện cảm ứng nhỏ (μA/mA) và xác định chiều dòng điện cảm ứng khi từ thông qua cuộn dây biến thiên (Bài Cảm ứng điện từ KHTN 9).',
        steps: [
          arch === 'digital-multimeter'
            ? 'Bước 1: Xoay núm chọn thang đo về đúng đại lượng cần đo (V, A hoặc Ω) và kiểm tra màn hình hiển thị 0.00 khi chưa đo.'
            : 'Bước 1: Kiểm tra kim điện kế chỉ đúng vạch 0 ở chính giữa thang đo (hoặc cả 2 đèn LED đều tắt khi nam châm đứng yên).',
          arch === 'digital-multimeter'
            ? 'Bước 2: Cắm dây đen vào giắc COM (-), dây đỏ vào giắc V/Ω/A (+) rồi mắc vào mạch điện (mắc song song khi đo V, nối tiếp khi đo A).'
            : 'Bước 2: Đưa cực Bắc (N) của thanh nam châm tiến nhanh lại gần hoặc rút ra xa lòng cuộn dây dẫn kín 1200 vòng.',
          'Bước 3: Quan sát chiều lệch của kim điện kế (Trái / Phải) hoặc đèn LED 1 / LED 2 phát sáng luân phiên và ghi nhận kết quả.',
        ],
        readingRule:
          arch === 'digital-multimeter'
            ? 'Đọc trực tiếp giá trị số và đơn vị (V, mA, A, Ω) trên màn hình LCD.'
            : 'Thang đo đối xứng -50..0..+50 μA: Kim lệch phải (+I) khi từ thông tăng, lệch trái (-I) khi từ thông giảm, về 0 khi nam châm dừng lại.',
        safetyNote:
          'Không mắc đồng hồ ở thang đo dòng điện (A) trực tiếp vào hai cực nguồn điện mà không qua tải tiêu thụ.',
      };

    case 'porcelain-dish':
    case 'distillation-flask':
    case 'separatory-funnel':
      return {
        standardFunction:
          arch === 'separatory-funnel'
            ? 'Tách riêng hai chất lỏng không hòa tan vào nhau và phân lớp theo khối lượng riêng (Phương pháp chiết lỏng – lỏng).'
            : arch === 'distillation-flask'
              ? 'Tách và tinh chế hỗn hợp các chất lỏng hòa tan có nhiệt độ sôi khác nhau (Phương pháp chưng cất thường).'
              : 'Cô cạn dung dịch muối hoặc thực hiện phản ứng đốt cháy hợp chất hữu cơ (như ethylic alcohol C₂H₅OH) an toàn.',
        steps: [
          arch === 'separatory-funnel'
            ? 'Bước 1: Khóa van PTFE, rót hỗn hợp 2 chất lỏng (ví dụ dầu ăn và nước) vào phễu chiết rồi treo lên giá đỡ chờ tách thành 2 lớp rõ rệt.'
            : 'Bước 1: Đặt dụng cụ lên kiềng sắt/giá đỡ chắc chắn và cho lượng hóa chất vừa phải (không quá 2/3 dung tích bình).',
          arch === 'separatory-funnel'
            ? 'Bước 2: Mở nút nhám phía trên đỉnh phễu, đặt cốc thủy tinh dưới cuống phễu và vặn mở từ từ khóa PTFE.'
            : 'Bước 2: Châm lửa đèn cồn gia nhiệt đều dưới đáy và quan sát hiện tượng sôi / cháy / ngưng tụ hơi.',
          arch === 'separatory-funnel'
            ? 'Bước 3: Đóng khóa PTFE ngay khi mặt phân cách giữa hai lớp chất lỏng vừa chạm tới lỗ khóa.'
            : 'Bước 3: Tắt đèn cồn bằng nắp chụp chuyên dụng và chờ dụng cụ nguội hẳn trước khi tháo dỡ.',
        ],
        readingRule: `Dung tích chuẩn: ${ghdText}. Quan sát màu sắc ngọn lửa, nhiệt độ sôi hoặc ranh giới phân lớp chất lỏng.`,
        safetyNote:
          'Không thổi tắt đèn cồn bằng miệng; luôn mở thông khí khi chiết và dùng kẹp cách nhiệt khi thao tác với sứ/thủy tinh nóng.',
      };

    case 'dna-double-helix':
    case 'retort-stand':
      return {
        standardFunction:
          arch === 'dna-double-helix'
            ? 'Mô hình hóa cấu trúc không gian xoắn kép của phân tử DNA và quy tắc liên kết bổ sung giữa các cặp nucleotide A-T, G-C.'
            : 'Giá đỡ cơ học đa năng dùng để kẹp giữ bình cầu, phễu chiết, ống nghiệm, nhiệt kế và treo lực kế lò xo trên bàn thí nghiệm.',
        steps: [
          arch === 'dna-double-helix'
            ? 'Bước 1: Bật chế độ Tự động xoay 360° hoặc kéo chuột quan sát hai mạch polynucleotide xoắn đều quanh trục.'
            : 'Bước 1: Đặt đế gang chữ nhật trên mặt bàn phẳng sao cho thanh trụ đứng hướng về phía sau, vật treo nằm phía trên mặt đế.',
          arch === 'dna-double-helix'
            ? 'Bước 2: Đối chiếu màu sắc từng cặp base: Adenine (Đỏ) – Thymine (Vàng) và Guanine (Xanh lá) – Cytosine (Xanh dương).'
            : 'Bước 2: Nới vít khớp nối chữ thập (Bosshead), trượt tay kẹp đến độ cao phù hợp rồi xiết chặt vít hãm.',
          arch === 'dna-double-helix'
            ? 'Bước 3: Đếm số cặp nucleotide trong một chu kì xoắn (10 cặp = 34 Å, mỗi cặp cách nhau 3.4 Å).'
            : 'Bước 3: Đặt thiết bị cần giữ vào má kẹp bọc cao su và vặn vừa đủ chặt để giữ êm thiết bị.',
        ],
        readingRule:
          arch === 'dna-double-helix'
            ? 'Đường kính vòng xoắn: 20 Å · Chiều cao 1 chu kì xoắn: 34 Å (10 cặp nucleotide).'
            : 'Chiều cao trụ đứng: 500 mm · Tải trọng kẹp giữ tối đa: 2.5 kg.',
        safetyNote:
          'Luôn quay hướng tay kẹp nằm ngay phía trên diện tích mặt đế gang để trọng tâm không bị lệch gây lật giá đỡ.',
      };

    default:
      return {
        standardFunction:
          asset.summary ||
          `Vật mẫu chuẩn / Dụng cụ thực hành Khoa học tự nhiên (${asset.name.vi}) dùng để đo khối lượng m, thể tích V và xác định khối lượng riêng D = m / V.`,
        steps: [
          `Bước 1: Đặt ${asset.name.vi} lên đĩa Cân điện tử (đã bấm TARE về 0.00 g) để đo chính xác khối lượng m (g).`,
          `Bước 2: Thả nhẹ ${asset.name.vi} chìm hoàn toàn vào Ống đong 100 ml (chứa sẵn nước V₁) hoặc Bình tràn 210 ml để đo thể tích nước dâng/tràn V (cm³).`,
          `Bước 3: Dùng Thước cặp du xích kẹp đo kích thước hình học và áp dụng công thức D = m / V (g/cm³) để đối chiếu với bảng khối lượng riêng vật liệu (${asset.scientificProperties.material.value}).`,
        ],
        readingRule: `Khối lượng chuẩn: m = ${
          asset.scientificProperties.referenceMass?.value ?? 66.25
        } g · Thể tích chuẩn: V = ${
          asset.scientificProperties.referenceVolume?.value ?? 24.5
        } cm³ · Vật liệu: ${asset.scientificProperties.material.value}.`,
        safetyNote:
          'Lau khô bề mặt vật mẫu trước khi đặt lên cân điện tử và thả nhẹ nhàng dọc theo thành bình thủy tinh.',
      };
  }
}

// Ngưỡng góc nghiêng kích hoạt trạng thái "Đang rót" (Tilt Threshold = 45°)
const TILT_POUR_THRESHOLD_DEG = 45;
const TILT_POUR_THRESHOLD_RAD = (TILT_POUR_THRESHOLD_DEG * Math.PI) / 180;

// Pre-allocated math helpers at module scope to prevent GC in render loop
const _projVec = new THREE.Vector3();
// Mặt phẳng raycast trên mặt bàn thực hành ở đúng y = BENCH_SURFACE_Y = 0.82 m (Mục 3.2 & 5)
const _rayPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -BENCH_SURFACE_Y);
const _elevatedRayPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -BENCH_SURFACE_Y);
const _elevatedIntersect = new THREE.Vector3();
const _dropPoint = new THREE.Vector3();
const _dragIntersect = new THREE.Vector3();
const _lipWorldPos = new THREE.Vector3();
const _surfaceWorldPos = new THREE.Vector3();

/**
 * Tính toán chính xác toạ độ (pourX, pourY) khi nghiêng bình nguồn (góc -0.95 rad)
 * để đầu vòi rót (`pouring_lip`) luôn nằm ngay phía trên miệng bình nhận (không bao giờ rót lệch ra ngoài!).
 */
function computeExactPourPosition(
  srcAssetOrObj: AssetDefinition | THREE.Object3D | undefined,
  dstAssetOrX: AssetDefinition | number | undefined,
  targetXOrZ: number,
  targetZOrHeight: number,
): { pourX: number; pourY: number; pourZ: number; targetRimY: number } {
  const isLegacyCall = typeof dstAssetOrX === 'number';
  const targetX = isLegacyCall ? dstAssetOrX : targetXOrZ;
  const targetZ = isLegacyCall ? targetXOrZ : targetZOrHeight;

  const srcAsset =
    srcAssetOrObj && 'geometry' in srcAssetOrObj ? srcAssetOrObj : undefined;
  const dstAsset =
    dstAssetOrX && typeof dstAssetOrX === 'object' && 'geometry' in dstAssetOrX
      ? dstAssetOrX
      : undefined;

  const srcArch = srcAsset?.geometry.proceduralArchetype;
  const dstArch = dstAsset?.geometry.proceduralArchetype;
  const dstHeight = isLegacyCall
    ? targetZOrHeight
    : dstArch === 'graduated-cylinder'
      ? 0.242
      : dstArch === 'overflow-can'
        ? 0.194
        : dstArch === 'erlenmeyer-flask'
          ? 0.137
          : dstArch === 'beaker-250'
            ? 0.097
            : dstArch === 'beaker-bomex-100'
              ? 0.070
              : dstAsset?.geometry.boundingBoxM.height ?? 0.12;

  let lipLocalX = 0.036;
  let lipLocalY = 0.096;
  if (srcArch === 'graduated-cylinder') {
    lipLocalX = 0.0185;
    lipLocalY = 0.241;
  } else if (srcArch === 'beaker-250') {
    lipLocalX = 0.038;
    lipLocalY = 0.096;
  } else if (srcArch === 'beaker-bomex-100') {
    lipLocalX = 0.029;
    lipLocalY = 0.069;
  } else if (srcArch === 'erlenmeyer-flask') {
    lipLocalX = 0.018;
    lipLocalY = 0.137;
  } else if (
    srcArch === 'reagent-bottle-naoh-400' ||
    srcArch === 'reagent-bottle-agno3-400'
  ) {
    lipLocalX = 0.031;
    lipLocalY = 0.186;
  } else if (srcAsset) {
    lipLocalX = srcAsset.geometry.boundingBoxM.width * 0.42;
    lipLocalY = srcAsset.geometry.boundingBoxM.height * 0.94;
  } else if (srcAssetOrObj && 'getObjectByName' in srcAssetOrObj) {
    const isReagentBottleRoot = Boolean(
      srcAssetOrObj.getObjectByName('naoh_bottle_root') ||
        srcAssetOrObj.getObjectByName('agno3_bottle_root'),
    );
    const lipNode = srcAssetOrObj.getObjectByName('pouring_lip');
    if (isReagentBottleRoot) {
      lipLocalX = 0.031;
      lipLocalY = 0.186;
    } else if (lipNode) {
      lipLocalX = Math.abs(lipNode.position.x) || 0.036;
      lipLocalY = lipNode.position.y || 0.096;
    }
  }

  // Khi xoay nghiêng quanh trục Z một góc theta = -0.95 rad (~54.4° sang phải +X):
  const theta = -0.95;
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const dxLip = lipLocalX * cosT - lipLocalY * sinT;
  const dyLip = lipLocalX * sinT + lipLocalY * cosT;

  // Đặt đầu mỏ rót nằm ngay trên miệng bình nhận (+3.4 cm phía trên vành miệng, lệch tâm -0.6 cm)
  const desiredLipWorldX = targetX - 0.006;
  const desiredLipLocalYAboveBench = dstHeight + 0.034;

  const pourX = THREE.MathUtils.clamp(
    desiredLipWorldX - dxLip,
    -BENCH_LIMIT_X,
    BENCH_LIMIT_X,
  );
  const pourY = Math.max(0.055, desiredLipLocalYAboveBench - dyLip);

  return {
    pourX,
    pourY,
    pourZ: targetZ,
    targetRimY: dstHeight,
  };
}

/**
 * Tạo vân gỗ tự nhiên ấm áp cho mặt bàn thí nghiệm (Oak / Walnut Teak)
 * Giúp nổi bật các dụng cụ thủy tinh trong suốt, cột nước và kim loại mà không gây chói mắt.
 */
/**
 * Tạo vân gỗ tự nhiên ấm áp cho mặt bàn thí nghiệm chuẩn openlan3dmixxx (#865432)
 */
function createWoodBenchTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#865432';
    ctx.fillRect(0, 0, 1024, 512);
    for (let i = 0; i < 160; i++) {
      ctx.fillStyle =
        i % 2 === 0 ? 'rgba(110, 66, 36, 0.16)' : 'rgba(156, 102, 62, 0.12)';
      const y = ((i * 3.2) % 512);
      ctx.fillRect(0, y, 1024, 2 + (i % 3));
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

/**
 * Vẽ nội dung lên Bảng Đen Tương Tác 3D (Interactive Chalkboard) chuẩn openlan3dmixxx
 */
function renderBlackboardCanvas(
  canvas: HTMLCanvasElement,
  title: string,
  notes: string,
  chalkColor: string,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = '#0f392b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 4;
  ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    title || 'PHÒNG THÍ NGHIỆM KHOA HỌC TỰ NHIÊN 3D',
    canvas.width / 2,
    68,
  );

  ctx.strokeStyle = 'rgba(253, 224, 71, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(140, 86);
  ctx.lineTo(canvas.width - 140, 86);
  ctx.stroke();

  ctx.fillStyle = chalkColor || '#fde047';
  ctx.font = '26px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'left';

  const lines = (notes || '').split('\n').slice(0, 6);
  lines.forEach((line, idx) => {
    ctx.fillText(line, 56, 138 + idx * 42, canvas.width - 112);
  });

  ctx.fillStyle = 'rgba(148, 163, 184, 0.75)';
  ctx.font = 'italic 18px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(
    'Click vào bảng để tự nhập nội dung',
    canvas.width - 32,
    canvas.height - 28,
  );
}

/**
 * Xây dựng không gian phòng thí nghiệm 3D chuẩn openlan3dmixxx.vercel.app:
 * - Bàn gỗ thực hành trung tâm
 * - Tủ kính 2 tầng đối diện bàn (glass_cabinet_2_tiers)
 * - Bảng đen tương tác trên tường sau (interactive_blackboard_group)
 * - Kệ gỗ 2 tầng Trái / Phải (interactive_side_shelves_group)
 * - Tủ vật phẩm dưới kệ Trái / Phải (interactive_under_shelf_cabinets_group)
 */
function buildDaylightScienceClassroom(
  benchTopMat: THREE.MeshStandardMaterial,
  graphics: LabGraphicsSettings = DEFAULT_LAB_GRAPHICS_SETTINGS,
): THREE.Group {
  const roomGroup = buildStandardLabRoomV2(
    DEFAULT_LAB_ROOM_CONFIG,
    benchTopMat,
    graphics,
  );

  // 1. Bảng đen tương tác treo trên tường sau (interactive_blackboard_group)
  const blackboardGroup = new THREE.Group();
  blackboardGroup.name = 'interactive_blackboard_group';

  const boardFrame = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 1.05, 0.04),
    new THREE.MeshStandardMaterial({
      color: 0x784928,
      roughness: 0.6,
    }),
  );
  boardFrame.position.set(0, BENCH_SURFACE_Y + 0.98, -3.74);
  blackboardGroup.add(boardFrame);

  const boardCanvas = document.createElement('canvas');
  boardCanvas.width = 1024;
  boardCanvas.height = 384;
  renderBlackboardCanvas(
    boardCanvas,
    'PHÒNG THÍ NGHIỆM KHOA HỌC TỰ NHIÊN 3D',
    '• Công thức Khối lượng riêng: D = m / V (g/cm³)\n• Lực đẩy Archimedes: FA = d . V\n• Nhấp vào bảng đen này để viết ghi chú bài học...',
    '#fde047',
  );
  const boardTex = new THREE.CanvasTexture(boardCanvas);
  boardTex.colorSpace = THREE.SRGBColorSpace;
  boardTex.needsUpdate = true;

  const boardMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.48, 0.93),
    new THREE.MeshStandardMaterial({
      map: boardTex,
      roughness: 0.72,
      metalness: 0.02,
    }),
  );
  boardMesh.name = 'interactive_blackboard_mesh';
  boardMesh.position.set(0, BENCH_SURFACE_Y + 0.98, -3.715);
  boardMesh.userData = {
    isBlackboard: true,
    boardCanvas,
    boardTex,
  };
  blackboardGroup.add(boardMesh);
  roomGroup.add(blackboardGroup);

  // 2. Kệ gỗ 2 tầng hai bên bàn (interactive_side_shelves_group) & Tủ vật phẩm dưới kệ (interactive_under_shelf_cabinets_group)
  const sideShelvesGroup = new THREE.Group();
  sideShelvesGroup.name = 'interactive_side_shelves_group';
  const underCabinetsGroup = new THREE.Group();
  underCabinetsGroup.name = 'interactive_under_shelf_cabinets_group';

  const shelfWoodMat = new THREE.MeshStandardMaterial({
    color: 0x7c4d2b,
    roughness: 0.56,
    metalness: 0.06,
  });
  const shelfDarkWoodMat = new THREE.MeshStandardMaterial({
    color: 0x5c371e,
    roughness: 0.62,
    metalness: 0.08,
  });
  const shelfPostMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.32,
    metalness: 0.78,
  });

  const sideOffsetX = DEFAULT_LAB_ROOM_CONFIG.bench.widthM / 2 + 0.52;
  const sideConfigs: Array<{ side: 'left' | 'right'; x: number; z: number }> = [
    { side: 'left', x: -sideOffsetX, z: -0.1 },
    { side: 'right', x: sideOffsetX, z: -0.1 },
  ];

  sideConfigs.forEach(({ side, x, z }) => {
    const shelfGroup = new THREE.Group();
    shelfGroup.name = `side_shelf_${side}`;
    shelfGroup.position.set(x, BENCH_SURFACE_Y, z);
    shelfGroup.userData = { isSideShelf: true, shelfSide: side };

    // Mặt kệ tầng 1 (ngang cao độ mặt bàn BENCH_SURFACE_Y)
    const lowerShelf = new THREE.Mesh(
      new THREE.BoxGeometry(0.92, 0.042, 0.68),
      shelfWoodMat,
    );
    lowerShelf.position.set(0, -0.021, 0);
    lowerShelf.castShadow = true;
    lowerShelf.receiveShadow = true;
    lowerShelf.userData = { isSideShelfSurface: true, shelfSide: side, tier: 1 };
    shelfGroup.add(lowerShelf);

    const backLip = new THREE.Mesh(
      new THREE.BoxGeometry(0.92, 0.026, 0.014),
      shelfDarkWoodMat,
    );
    backLip.position.set(0, 0.013, -0.333);
    shelfGroup.add(backLip);

    // Kệ gỗ tầng 2 (cao hơn mặt bàn 0.26 m, mở rộng mặt kệ sâu 0.34m để đặt đồ bất kỳ vị trí nào)
    const upperShelf = new THREE.Mesh(
      new THREE.BoxGeometry(0.88, 0.022, 0.34),
      shelfWoodMat,
    );
    upperShelf.position.set(0, 0.249, -0.16);
    upperShelf.castShadow = true;
    upperShelf.receiveShadow = true;
    upperShelf.userData = { isSideShelfSurface: true, shelfSide: side, tier: 2 };
    shelfGroup.add(upperShelf);

    const postGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.26, 12);
    [
      [-0.41, 0.13, -0.31],
      [0.41, 0.13, -0.31],
      [-0.41, 0.13, -0.02],
      [0.41, 0.13, -0.02],
    ].forEach(([px, py, pz]) => {
      const post = new THREE.Mesh(postGeo, shelfPostMat);
      post.position.set(px, py, pz);
      post.castShadow = true;
      shelfGroup.add(post);
    });

    sideShelvesGroup.add(shelfGroup);

    // Tủ vật phẩm dưới kệ (under_shelf_cabinet_left / right)
    const underCab = new THREE.Group();
    underCab.name = `under_shelf_cabinet_${side}`;
    underCab.position.set(x, BENCH_SURFACE_Y, z);
    underCab.userData = {
      isUnderShelfCabinet: true,
      cabinetSide: side,
      underShelfCabinetSide: side,
    };

    const cabBodyMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.65,
      metalness: 0.18,
    });
    const cabDoorMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.5,
      metalness: 0.25,
    });
    const cabHandleMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.28,
      metalness: 0.85,
    });

    const cabHeight = BENCH_SURFACE_Y - 0.042;
    const cabBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.88, cabHeight, 0.64),
      cabBodyMat,
    );
    cabBody.position.set(0, -0.042 - cabHeight / 2, 0);
    cabBody.castShadow = true;
    cabBody.receiveShadow = true;
    cabBody.userData = {
      isUnderShelfCabinet: true,
      isUnderShelfCabinetDoor: false,
      cabinetSide: side,
      underShelfCabinetSide: side,
    };
    underCab.add(cabBody);

    [-0.215, 0.215].forEach((dx, idx) => {
      const door = new THREE.Mesh(
        new THREE.BoxGeometry(0.41, cabHeight - 0.08, 0.016),
        cabDoorMat,
      );
      door.position.set(dx, -0.042 - cabHeight / 2, 0.326);
      door.userData = {
        isUnderShelfCabinet: true,
        isUnderShelfCabinetDoor: true,
        cabinetSide: side,
        underShelfCabinetSide: side,
      };
      underCab.add(door);

      const handle = new THREE.Mesh(
        new THREE.BoxGeometry(0.014, 0.12, 0.024),
        cabHandleMat,
      );
      handle.position.set(
        idx === 0 ? -0.035 : 0.035,
        -0.042 - cabHeight / 2 + 0.04,
        0.342,
      );
      handle.userData = {
        isUnderShelfCabinet: true,
        isUnderShelfCabinetDoor: true,
        cabinetSide: side,
        underShelfCabinetSide: side,
      };
      underCab.add(handle);
    });

    // Biển tên mặt trước TỦ VẬT PHẨM TRÁI / PHẢI (gắn trên cánh cửa tủ)
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 512;
    labelCanvas.height = 96;
    const lctx = labelCanvas.getContext('2d');
    if (lctx) {
      lctx.fillStyle = '#0f172a';
      lctx.fillRect(0, 0, 512, 96);
      lctx.strokeStyle = '#f59e0b';
      lctx.lineWidth = 4;
      lctx.strokeRect(4, 4, 504, 88);
      lctx.fillStyle = '#fde047';
      lctx.font = 'bold 26px system-ui, sans-serif';
      lctx.textAlign = 'center';
      lctx.fillText(
        side === 'left' ? 'TỦ VẬT PHẨM TRÁI' : 'TỦ VẬT PHẨM PHẢI',
        256,
        42,
      );
      lctx.fillStyle = '#94a3b8';
      lctx.font = '18px system-ui, sans-serif';
      lctx.fillText('Nhấp để mở • Kéo thả ngay cánh cửa tủ để cất', 256, 72);
    }
    const labelTex = new THREE.CanvasTexture(labelCanvas);
    labelTex.colorSpace = THREE.SRGBColorSpace;
    const labelPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.54, 0.1),
      new THREE.MeshBasicMaterial({ map: labelTex }),
    );
    labelPlane.position.set(0, -0.15, 0.336);
    labelPlane.userData = {
      isUnderShelfCabinet: true,
      isUnderShelfCabinetDoor: true,
      cabinetSide: side,
      underShelfCabinetSide: side,
    };
    underCab.add(labelPlane);

    const highlightBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.86, cabHeight - 0.06, 0.04),
      new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.35,
        wireframe: true,
      }),
    );
    highlightBox.name = `under_cabinet_highlight_${side}`;
    highlightBox.position.set(0, -0.042 - cabHeight / 2, 0.33);
    highlightBox.visible = false;
    highlightBox.raycast = () => {};
    highlightBox.userData = {
      isUnderShelfCabinet: true,
      isUnderShelfCabinetDoor: false,
      cabinetSide: side,
      underShelfCabinetSide: side,
    };
    underCab.add(highlightBox);

    underCabinetsGroup.add(underCab);
  });

  roomGroup.add(sideShelvesGroup);
  roomGroup.add(underCabinetsGroup);

  // 3. Tủ kính 2 tầng đối diện bàn thí nghiệm (bench_storage_cabinet_group / glass_cabinet_2_tiers)
  const benchStorageCabinet = buildBenchStorageCabinet3D();
  roomGroup.add(benchStorageCabinet);

  return roomGroup;
}

/**
 * Xây dựng Tủ Kính 2 Tầng Đối Diện Bàn Thí Nghiệm (glass_cabinet_2_tiers chuẩn openlan3dmixxx.vercel.app)
 * kết hợp hoàn hảo với cơ chế kéo/quăng cất đồ và lấy đồ ra bàn (`bench_storage_cabinet_group`).
 */
function buildBenchStorageCabinet3D(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'bench_storage_cabinet_group';
  root.position.set(CABINET_POS_X, BENCH_SURFACE_Y, CABINET_POS_Z);

  const glassWallMat = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd,
    transparent: true,
    opacity: 0.28,
    roughness: 0.08,
    metalness: 0.05,
    ior: 1.5,
    reflectivity: 0.85,
  });
  const frostedShelfMat = new THREE.MeshPhysicalMaterial({
    color: 0x93c5fd,
    transparent: true,
    opacity: 0.42,
    roughness: 0.1,
    metalness: 0.05,
    ior: 1.5,
    clearcoat: 0.9,
  });
  const frameMetalMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.3,
    metalness: 0.8,
  });
  const lowerCabinetMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.7,
    metalness: 0.1,
  });

  // 1. Chân đế tủ dưới từ sàn lên mặt bàn
  const lowerBase = new THREE.Mesh(
    new THREE.BoxGeometry(CABINET_WIDTH_M, BENCH_SURFACE_Y, CABINET_DEPTH_M),
    lowerCabinetMat,
  );
  lowerBase.position.set(0, -BENCH_SURFACE_Y / 2, 0);
  lowerBase.receiveShadow = true;
  lowerBase.castShadow = true;
  root.add(lowerBase);

  // 2. Kệ kính mờ tầng 1 (localY = 0.016 m)
  const tier1Shelf = new THREE.Mesh(
    new THREE.BoxGeometry(CABINET_WIDTH_M, 0.016, CABINET_DEPTH_M),
    frostedShelfMat,
  );
  tier1Shelf.position.set(0, 0.016, 0);
  tier1Shelf.userData = { tier: 1 };
  tier1Shelf.receiveShadow = true;
  root.add(tier1Shelf);

  // 3. Kệ kính mờ tầng 2 (localY = 0.26 m)
  const tier2Shelf = new THREE.Mesh(
    new THREE.BoxGeometry(CABINET_WIDTH_M - 0.02, 0.014, CABINET_DEPTH_M - 0.01),
    frostedShelfMat,
  );
  tier2Shelf.position.set(0, 0.26, 0);
  tier2Shelf.userData = { tier: 2 };
  tier2Shelf.receiveShadow = true;
  tier2Shelf.castShadow = true;
  root.add(tier2Shelf);

  // 4. Mái kính trên cùng (localY = 0.44 m)
  const topGlassRoof = new THREE.Mesh(
    new THREE.BoxGeometry(CABINET_WIDTH_M, 0.014, CABINET_DEPTH_M),
    glassWallMat,
  );
  topGlassRoof.position.set(0, CABINET_HEIGHT_M, 0);
  root.add(topGlassRoof);

  // 5. Vách kính sau & 2 vách kính bên
  const backGlass = new THREE.Mesh(
    new THREE.BoxGeometry(CABINET_WIDTH_M, CABINET_HEIGHT_M, 0.01),
    glassWallMat,
  );
  backGlass.position.set(0, CABINET_HEIGHT_M / 2, -CABINET_DEPTH_M / 2 + 0.005);
  root.add(backGlass);

  const sideGlassGeo = new THREE.BoxGeometry(
    0.01,
    CABINET_HEIGHT_M,
    CABINET_DEPTH_M,
  );
  const leftGlass = new THREE.Mesh(sideGlassGeo, glassWallMat);
  leftGlass.position.set(-CABINET_WIDTH_M / 2 + 0.005, CABINET_HEIGHT_M / 2, 0);
  root.add(leftGlass);

  const rightGlass = new THREE.Mesh(sideGlassGeo, glassWallMat);
  rightGlass.position.set(CABINET_WIDTH_M / 2 - 0.005, CABINET_HEIGHT_M / 2, 0);
  root.add(rightGlass);

  // 6. 4 trụ kim loại ở 4 góc tủ kính
  const pillarGeo = new THREE.CylinderGeometry(0.008, 0.008, CABINET_HEIGHT_M, 12);
  const px = CABINET_WIDTH_M / 2 - 0.015;
  const pz = CABINET_DEPTH_M / 2 - 0.015;
  [
    [-px, -pz],
    [px, -pz],
    [-px, pz],
    [px, pz],
  ].forEach(([cx, cz]) => {
    const pillar = new THREE.Mesh(pillarGeo, frameMetalMat);
    pillar.position.set(cx, CABINET_HEIGHT_M / 2, cz);
    root.add(pillar);
  });

  // 7. Viền phát sáng khi người dùng kéo/quăng dụng cụ lại gần tủ (`cabinet_drop_glow`)
  const glowGroup = new THREE.Group();
  glowGroup.name = 'cabinet_drop_glow';
  glowGroup.visible = false;

  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const glowPad = new THREE.Mesh(
    new THREE.PlaneGeometry(CABINET_WIDTH_M + 0.04, CABINET_DEPTH_M + 0.06),
    glowMat,
  );
  glowPad.rotation.x = -Math.PI / 2;
  glowPad.position.set(0, 0.025, 0.02);
  glowGroup.add(glowPad);
  root.add(glowGroup);

  // 8. Nhóm chứa các mô hình 3D của dụng cụ đã nhảy vào nằm trên kệ tủ (`cabinet_stored_items_group`)
  const storedItemsGroup = new THREE.Group();
  storedItemsGroup.name = 'cabinet_stored_items_group';
  root.add(storedItemsGroup);

  return root;
}

export const LabViewport3D: React.FC<LabViewport3DProps> = ({
  instances,
  assetsMap,
  allAssets,
  selectedInstanceId,
  selectedCatalogAsset,
  onSelectCatalogAsset,
  environment,
  isStudentMode = false,
  isNeuralGuideEnabled,
  studentCurrentHint,
  relevantAssetIds,
  toolMode,
  viewMode,
  showGrid,
  showAxes,
  showLabels,
  showDimensions,
  isFullscreen,
  isDarkMode = false,
  isGuideOpen = true,
  onToggleGuide,
  isLibraryOpen = true,
  onToggleLibrary,
  equipmentCount = 28,
  onSelectInstance,
  onUpdateInstanceTransform,
  onPhysicalDockInteraction,
  onQuickLabAction,
  onUpdateInstanceState,
  onDispenseWaterVolume,
  onRealtimeTiltPour,
  onDropAssetIntoScene,
  onToolModeChange,
  onViewModeChange,
  onToggleGrid,
  onToggleAxes,
  onToggleLabels,
  onToggleDimensions,
  onToggleFullscreen,
  onResetScene,
  onNotify,
  showDetailedGuides,
  onToggleDetailedGuides,
  onOpenAssetDetailModal,
  onAddAssetToTable,
  onOpenGlobalEquipmentLibrary,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const orbitRef = useRef<OrbitControls | null>(null);
  const transformRef = useRef<TransformControls | null>(null);
  const instanceObjectsRef = useRef<Map<string, THREE.Group>>(new Map());
  const singleAssetGroupRef = useRef<THREE.Group | null>(null);
  const benchGroupRef = useRef<THREE.Group | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const axesHelperRef = useRef<THREE.AxesHelper | null>(null);
  const selectionBoxHelperRef = useRef<THREE.BoxHelper | null>(null);
  const selectionRingRef = useRef<THREE.Mesh | null>(null);
  const snapTargetRingRef = useRef<THREE.Mesh | null>(null);
  const neuralSynapseBeamGroupRef = useRef<THREE.Group | null>(null);
  const pouringStreamRef = useRef<THREE.Group | null>(null);
  const activePourAnimRef = useRef<{
    sourceId: string;
    targetId: string;
    startTimeMs: number;
    durationMs: number;
    pourX: number;
    pourY: number;
    pourZ: number;
    targetX: number;
    targetRimY: number;
    targetZ: number;
    settleX: number;
    settleZ: number;
    srcStartScaleY: number;
    srcEndScaleY: number;
    dstStartScaleY: number;
    dstEndScaleY: number;
  } | null>(null);
  const activeDispenseAnimRef = useRef<{
    dispenserId: string;
    targetId: string;
    startTimeMs: number;
    durationMs: number;
    dstStartScaleY: number;
    dstEndScaleY: number;
    dispStartScaleY: number;
    dispEndScaleY: number;
  } | null>(null);
  const activeCabinetJumpAnimsRef = useRef<
    Array<{
      storedId: string;
      instanceId: string;
      assetId: string;
      title: string;
      symbol: string;
      mesh: THREE.Group;
      startTimeMs: number;
      durationMs: number;
      startX: number;
      startY: number;
      startZ: number;
      targetLocalX: number;
      targetLocalY: number;
      targetLocalZ: number;
      targetWorldX: number;
      targetWorldY: number;
      targetWorldZ: number;
      startScale: number;
      targetScale: number;
    }>
  >([]);
  const cabinetStoredMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const cabinetSlotCounterRef = useRef<number>(0);
  const [cabinetStoredItems, setCabinetStoredItems] = useState<
    StoredCabinetItemRecord[]
  >([]);
  const [isCabinetDrawerOpen, setIsCabinetDrawerOpen] = useState<boolean>(false);
  const [cabinetProjectedBadge, setCabinetProjectedBadge] = useState<{
    x: number;
    y: number;
  } | null>(null);
  // Trạng thái Bảng Đen Tương Tác 3D (Interactive Chalkboard) chuẩn openlan3dmixxx
  const [isBlackboardModalOpen, setIsBlackboardModalOpen] =
    useState<boolean>(false);
  const [blackboardTitle, setBlackboardTitle] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('ol3d_saved_experiment_state_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (typeof parsed.boardTitle === 'string') return parsed.boardTitle;
        }
      } catch {
        // Ignore
      }
    }
    return 'PHÒNG THÍ NGHIỆM KHOA HỌC TỰ NHIÊN 3D';
  });
  const [blackboardNotes, setBlackboardNotes] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('ol3d_saved_experiment_state_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (typeof parsed.boardContent === 'string') return parsed.boardContent;
        }
      } catch {
        // Ignore
      }
    }
    return '• Công thức Khối lượng riêng: D = m / V (g/cm³)\n• Lực đẩy Archimedes: FA = d . V\n• Nhấp vào bảng đen này để viết ghi chú bài học...';
  });
  const [blackboardColor, setBlackboardColor] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('ol3d_saved_experiment_state_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (typeof parsed.boardChalkColor === 'string') {
            return parsed.boardChalkColor;
          }
        }
      } catch {
        // Ignore
      }
    }
    return '#fde047';
  });
  const requestRenderRef = useRef<() => void>(() => {});

  // Hệ 2 trục Chuột phải (Right-Click Dual-Axis Gizmo: Trục đứng xanh lá nâng cao & Vành xoay tròn vàng cam) + Trọng lực rơi tự do
  const dualAxisGizmoRef = useRef<THREE.Group | null>(null);
  const [dualAxisGizmoInstanceId, setDualAxisGizmoInstanceId] = useState<
    string | null
  >(null);
  const dualAxisGizmoIdRef = useRef<string | null>(null);
  dualAxisGizmoIdRef.current = dualAxisGizmoInstanceId;
  const gravityPhysicsRef = useRef<
    Map<string, { vy: number; falling: boolean; restingY: number }>
  >(new Map());

  // Tủ Vật Phẩm Trái & Tủ Vật Phẩm Phải dưới kệ 2 bên (`under_shelf_cabinet_left` / `under_shelf_cabinet_right`)
  const [openUnderCabinetModalSide, setOpenUnderCabinetModalSide] = useState<
    'left' | 'right' | null
  >(null);
  const [underCabinetTab, setUnderCabinetTab] = useState<'stored' | 'catalog'>(
    'stored',
  );
  const pendingCabinetZoneRef = useRef<'glass' | 'left' | 'right'>('glass');
  const sideShelfSlotCounterRef = useRef<number>(0);

  // Trạng thái Ẩn/Hiện Thanh Công Cụ, Lưu Thí Nghiệm & Cửa sổ Code Thiết Bị (.HTML) — Mặc định ẩn, chỉ hiện khi người dùng bấm "Hiện"
  const [isSpatialHeaderVisible, setIsSpatialHeaderVisible] =
    useState<boolean>(false);
  const [lastSpatialSavedAt, setLastSpatialSavedAt] = useState<number | null>(
    () => {
      if (typeof window !== 'undefined') {
        try {
          const raw = window.localStorage.getItem(
            'ol3d_saved_experiment_state_v1',
          );
          if (raw) {
            const parsed = JSON.parse(raw);
            if (typeof parsed.savedAt === 'number') return parsed.savedAt;
          }
        } catch {
          // Ignore
        }
      }
      return null;
    },
  );
  const [spatialSaveToast, setSpatialSaveToast] = useState<string | null>(null);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [selectedCodeAssetId, setSelectedCodeAssetId] = useState<string>('');
  const [codeModalTab, setCodeModalTab] = useState<
    'full' | 'manifest' | 'script3d'
  >('full');
  const [copiedCodeSuccess, setCopiedCodeSuccess] = useState<boolean>(false);

  // Đồng bộ hiển thị 2 trục Chuột phải khi chọn / bỏ chọn
  useEffect(() => {
    const gizmo = dualAxisGizmoRef.current;
    if (!gizmo) return;
    if (!dualAxisGizmoInstanceId) {
      gizmo.visible = false;
      requestRenderRef.current();
      return;
    }
    const obj = instanceObjectsRef.current.get(dualAxisGizmoInstanceId);
    if (obj && obj.visible) {
      gizmo.position.copy(obj.position);
      gizmo.visible = true;
    } else {
      gizmo.visible = false;
    }
    requestRenderRef.current();
  }, [dualAxisGizmoInstanceId]);

  // Kích hoạt rơi tự do theo trọng lực nếu vật đang ở trên cao (y > BENCH_SURFACE_Y + restingY) khi đóng 2 trục
  const triggerFreeFallIfElevated = useCallback((instId: string | null) => {
    if (!instId) return;
    const obj = instanceObjectsRef.current.get(instId);
    if (!obj) return;
    const curState = gravityPhysicsRef.current.get(instId) ?? {
      vy: 0,
      falling: false,
      restingY: 0,
    };
    const localY = obj.position.y - BENCH_SURFACE_Y;
    if (localY > curState.restingY + 0.003) {
      gravityPhysicsRef.current.set(instId, {
        vy: 0,
        falling: true,
        restingY: curState.restingY,
      });
      requestRenderRef.current();
    }
  }, []);

  // Lưu trạng thái thí nghiệm không gian 3D vào localStorage chuẩn openlan3dmixxx.vercel.app
  const handleSaveSpatialExperiment = useCallback(() => {
    try {
      const nowMs = Date.now();
      const itemTransforms: Record<
        string,
        { pos: [number, number, number]; rotY: number }
      > = {};
      instancesRef.current.forEach((inst) => {
        const obj = instanceObjectsRef.current.get(inst.instanceId);
        if (obj) {
          itemTransforms[inst.instanceId] = {
            pos: [
              Number(obj.position.x.toFixed(4)),
              Number((obj.position.y - BENCH_SURFACE_Y).toFixed(4)),
              Number(obj.position.z.toFixed(4)),
            ],
            rotY: Number(obj.rotation.y.toFixed(4)),
          };
        }
      });
      const cam = cameraRef.current;
      const orb = orbitRef.current;
      const payload = {
        version: 1,
        savedAt: nowMs,
        boardTitle: blackboardTitle,
        boardContent: blackboardNotes,
        boardChalkColor: blackboardColor,
        itemTransforms,
        cameraPos: cam
          ? [
              Number(cam.position.x.toFixed(4)),
              Number(cam.position.y.toFixed(4)),
              Number(cam.position.z.toFixed(4)),
            ]
          : undefined,
        controlsTarget: orb
          ? [
              Number(orb.target.x.toFixed(4)),
              Number(orb.target.y.toFixed(4)),
              Number(orb.target.z.toFixed(4)),
            ]
          : undefined,
      };
      window.localStorage.setItem(
        'ol3d_saved_experiment_state_v1',
        JSON.stringify(payload),
      );
      setLastSpatialSavedAt(nowMs);
      labSoundEngine.play('ui-toggle', 0.85);
      setSpatialSaveToast(
        'Đã lưu thí nghiệm! Khi truy cập lại sẽ giữ nguyên trạng thái hiện tại.',
      );
      window.setTimeout(() => {
        setSpatialSaveToast((prev) =>
          prev ===
          'Đã lưu thí nghiệm! Khi truy cập lại sẽ giữ nguyên trạng thái hiện tại.'
            ? null
            : prev,
        );
      }, 3200);
    } catch {
      onNotify('Không thể lưu thí nghiệm vào bộ nhớ trình duyệt.', 'warning');
    }
  }, [blackboardTitle, blackboardNotes, blackboardColor, onNotify]);

  // Đưa nhanh toàn bộ vật phẩm trên bàn lên Kệ 2 bên / Kệ Tủ Kính hoặc Đặt lại về bàn
  const handleArrangeItemsToShelvesOrReset = useCallback(() => {
    const visibleInsts = instancesRef.current.filter((i) => i.visible);
    const anyOnShelfOrCabinet = visibleInsts.some(
      (i) =>
        Math.abs(i.transform.positionM[0]) > 1.02 ||
        i.transform.positionM[2] < -0.52,
    );
    if (anyOnShelfOrCabinet) {
      // Nếu đã có vật trên kệ -> Đặt lại toàn bộ về bàn chính
      onResetScene();
      setDualAxisGizmoInstanceId(null);
      labSoundEngine.play('wood-place', 0.85);
      onNotify(
        'Đã đặt lại toàn bộ thiết bị về vị trí chuẩn trên mặt bàn gỗ chính.',
        'info',
      );
      return;
    }
    // Đưa các vật phẩm trên bàn lên Kệ gỗ 2 tầng hai bên và Tủ kính 2 tầng
    visibleInsts.forEach((inst, idx) => {
      const slot = SIDE_SHELF_SLOTS[idx % SIDE_SHELF_SLOTS.length];
      const nextPos: [number, number, number] = [slot.x, slot.y, slot.z];
      const obj = instanceObjectsRef.current.get(inst.instanceId);
      if (obj) {
        obj.position.set(slot.x, BENCH_SURFACE_Y + slot.y, slot.z);
        obj.rotation.set(0, 0, 0);
      }
      gravityPhysicsRef.current.set(inst.instanceId, {
        vy: 0,
        falling: false,
        restingY: slot.y,
      });
      onUpdateTransformRef.current(inst.instanceId, nextPos, [0, 0, 0]);
    });
    setDualAxisGizmoInstanceId(null);
    labSoundEngine.play('wood-place', 0.85);
    onNotify(
      'Đã sắp xếp các vật phẩm lên Kệ gỗ 2 tầng hai bên. Bấm lần nữa để đặt lại về bàn chính!',
      'info',
    );
    requestRenderRef.current();
  }, [onResetScene, onNotify]);

  // Đồng bộ nội dung chữ phấn lên kết cấu Canvas 3D của Bảng Đen
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const boardMesh = scene.getObjectByName(
      'interactive_blackboard_mesh',
    ) as THREE.Mesh | null;
    if (!boardMesh) return;
    const { boardCanvas, boardTex } = boardMesh.userData as {
      boardCanvas?: HTMLCanvasElement;
      boardTex?: THREE.CanvasTexture;
    };
    if (boardCanvas && boardTex) {
      renderBlackboardCanvas(
        boardCanvas,
        blackboardTitle,
        blackboardNotes,
        blackboardColor,
      );
      boardTex.needsUpdate = true;
      requestRenderRef.current();
    }
  }, [blackboardTitle, blackboardNotes, blackboardColor]);

  const clearCabinetStoredMeshes = useCallback(() => {
    cabinetStoredMeshesRef.current.forEach((mesh) => {
      if (mesh.parent) mesh.parent.remove(mesh);
      OpenLabAssetLoader.disposeObject3D(mesh);
    });
    cabinetStoredMeshesRef.current.clear();
    activeCabinetJumpAnimsRef.current.forEach((anim) => {
      if (anim.mesh.parent) anim.mesh.parent.remove(anim.mesh);
      OpenLabAssetLoader.disposeObject3D(anim.mesh);
    });
    activeCabinetJumpAnimsRef.current = [];
    cabinetSlotCounterRef.current = 0;
    setCabinetStoredItems([]);
    requestRenderRef.current();
  }, []);

  const animateObjectJumpIntoCabinet = useCallback(
    (instId: string, obj: THREE.Group) => {
      const assetId = (obj.userData.assetId as string) || '';
      const asset = assetsMapRef.current.get(assetId);
      const title =
        (obj.userData.customLabel as string) ||
        asset?.name.vi ||
        assetId ||
        'Dụng cụ thí nghiệm';
      const symbol = asset ? getEquipmentSymbol(asset) : '🧪';
      const bboxH =
        (obj.userData.bboxHeight as number) ||
        asset?.geometry.boundingBoxM.height ||
        0.12;
      const zone = pendingCabinetZoneRef.current || 'glass';
      pendingCabinetZoneRef.current = 'glass';

      // Ngắt mọi tia nước và trạng thái chọn trên bàn trước khi nhảy vào tủ
      const spoutStream = obj.getObjectByName('spout_stream');
      if (spoutStream) spoutStream.visible = false;
      delete obj.userData.instanceId;
      obj.userData.storedInCabinet = true;

      const storedId = `cab-${instId}-${Date.now().toString(36).slice(-4)}`;

      // Nếu cất vào TỦ VẬT PHẨM TRÁI hoặc PHẢI dưới kệ: ẩn mô hình 3D vào trong hộc tủ và lưu vào danh sách tủ đó
      if (zone === 'left' || zone === 'right') {
        if (obj.parent) obj.parent.remove(obj);
        OpenLabAssetLoader.disposeObject3D(obj);
        setCabinetStoredItems((prev) => [
          {
            storedId,
            instanceId: instId,
            assetId,
            title,
            symbol,
            storedAtMs: Date.now(),
            cabinetZone: zone,
          },
          ...prev.slice(0, 29),
        ]);
        requestRenderRef.current();
        return;
      }

      const slotIdx =
        cabinetSlotCounterRef.current % CABINET_SHELF_SLOTS.length;
      cabinetSlotCounterRef.current += 1;
      const slot = CABINET_SHELF_SLOTS[slotIdx];

      // Nếu vị trí kệ này đã có đồ cũ vượt quá 8 món, dọn mesh cũ ở đúng ô đó để nhường chỗ
      if (cabinetStoredMeshesRef.current.size >= CABINET_SHELF_SLOTS.length) {
        const oldestKey = cabinetStoredMeshesRef.current.keys().next().value;
        if (oldestKey) {
          const oldMesh = cabinetStoredMeshesRef.current.get(oldestKey);
          if (oldMesh) {
            if (oldMesh.parent) oldMesh.parent.remove(oldMesh);
            OpenLabAssetLoader.disposeObject3D(oldMesh);
          }
          cabinetStoredMeshesRef.current.delete(oldestKey);
        }
      }

      // Giữ nguyên kích thước 1:1 (không bị thu nhỏ lại) khi cất vào kệ/tủ
      const targetScale = obj.scale.x || 1;

      activeCabinetJumpAnimsRef.current.push({
        storedId,
        instanceId: instId,
        assetId,
        title,
        symbol,
        mesh: obj,
        startTimeMs: performance.now(),
        durationMs: 540,
        startX: obj.position.x,
        startY: obj.position.y,
        startZ: obj.position.z,
        targetLocalX: slot.x,
        targetLocalY: slot.y,
        targetLocalZ: slot.z,
        targetWorldX: CABINET_POS_X + slot.x,
        targetWorldY: BENCH_SURFACE_Y + slot.y,
        targetWorldZ: CABINET_POS_Z + slot.z,
        startScale: obj.scale.x || 1,
        targetScale,
      });

      setCabinetStoredItems((prev) => [
        {
          storedId,
          instanceId: instId,
          assetId,
          title,
          symbol,
          storedAtMs: Date.now(),
          cabinetZone: 'glass',
        },
        ...prev.slice(0, 29),
      ]);

      requestRenderRef.current();
    },
    [],
  );

  const handleRestoreItemFromCabinet = useCallback(
    (
      storedId: string,
      destination: 'main-table' | 'side-shelf' = 'main-table',
      preferredSide: 'left' | 'right' = 'left',
    ) => {
      const mesh = cabinetStoredMeshesRef.current.get(storedId);
      if (mesh) {
        if (mesh.parent) mesh.parent.remove(mesh);
        OpenLabAssetLoader.disposeObject3D(mesh);
        cabinetStoredMeshesRef.current.delete(storedId);
      }
      setCabinetStoredItems((prev) => {
        const target = prev.find((item) => item.storedId === storedId);
        if (target && target.assetId) {
          if (destination === 'side-shelf') {
            const sideSlots = SIDE_SHELF_SLOTS.filter(
              (s) => s.side === preferredSide,
            );
            const chosen =
              sideSlots[sideShelfSlotCounterRef.current % sideSlots.length];
            sideShelfSlotCounterRef.current += 1;
            onDropAssetIntoScene(target.assetId, [
              chosen.x,
              chosen.y,
              chosen.z,
            ]);
          } else {
            const offsetX = Number(((Math.random() - 0.5) * 0.28).toFixed(3));
            onDropAssetIntoScene(target.assetId, [offsetX, 0, 0.14]);
          }
        }
        return prev.filter((item) => item.storedId !== storedId);
      });
      requestRenderRef.current();
    },
    [onDropAssetIntoScene],
  );

  // Smooth camera transition targets
  const cameraGoalPosRef = useRef<THREE.Vector3 | null>(null);
  const cameraGoalTargetRef = useRef<THREE.Vector3 | null>(null);

  // Direct physical drag state
  const dragStateRef = useRef<{
    isDragging: boolean;
    instanceId: string | null;
    grabOffsetX: number;
    grabOffsetZ: number;
    targetPos: THREE.Vector3;
    lastX: number;
    lastZ: number;
    velX: number;
    velZ: number;
    hoverTargetInstanceId: string | null;
    hoverSlot: PhysicalDockTargetSlot;
    hoverHint: string | null;
    manualTiltRad: number;
    hoverPourDwellSec: number;
  }>({
    isDragging: false,
    instanceId: null,
    grabOffsetX: 0,
    grabOffsetZ: 0,
    targetPos: new THREE.Vector3(),
    lastX: 0,
    lastZ: 0,
    velX: 0,
    velZ: 0,
    hoverTargetInstanceId: null,
    hoverSlot: 'bench',
    hoverHint: null,
    manualTiltRad: 0,
    hoverPourDwellSec: 0,
  });

  // Trạng thái theo dõi Rót chất lỏng theo góc nghiêng (Tilt-Based Pouring Simulation >= 45°)
  const tiltPourStateRef = useRef<{
    isPouring: boolean;
    sourceId: string | null;
    targetId: string | null;
    currentTiltDeg: number;
    flowRateMlPerSec: number;
    sessionPouredMl: number;
    pendingDeltaMl: number;
    lastSyncMs: number;
    liveVolumesMl: Map<string, number>;
  }>({
    isPouring: false,
    sourceId: null,
    targetId: null,
    currentTiltDeg: 0,
    flowRateMlPerSec: 0,
    sessionPouredMl: 0,
    pendingDeltaMl: 0,
    lastSyncMs: 0,
    liveVolumesMl: new Map(),
  });
  const [activeTiltPourHud, setActiveTiltPourHud] = useState<{
    sourceTitle: string;
    targetTitle: string;
    tiltDeg: number;
    flowRateMlPerSec: number;
    sourceRemainMl: number;
    targetCurrentMl: number | null;
    sessionPouredMl: number;
  } | null>(null);
  const [vesselTiltDegMap, setVesselTiltDegMap] = useState<Record<string, number>>({});

  // Mutable refs for event handlers inside WebGL lifecycle
  const instancesRef = useRef(instances);
  instancesRef.current = instances;
  const assetsMapRef = useRef(assetsMap);
  assetsMapRef.current = assetsMap;
  const selectedInstanceIdRef = useRef(selectedInstanceId);
  selectedInstanceIdRef.current = selectedInstanceId;
  const viewModeRef = useRef(viewMode);
  viewModeRef.current = viewMode;
  const toolModeRef = useRef(toolMode);
  toolModeRef.current = toolMode;
  const isStudentModeRef = useRef(isStudentMode);
  isStudentModeRef.current = isStudentMode;
  const onSelectInstanceRef = useRef(onSelectInstance);
  onSelectInstanceRef.current = onSelectInstance;
  const onUpdateTransformRef = useRef(onUpdateInstanceTransform);
  onUpdateTransformRef.current = onUpdateInstanceTransform;
  const onPhysicalDockRef = useRef(onPhysicalDockInteraction);
  onPhysicalDockRef.current = onPhysicalDockInteraction;
  const onQuickLabActionRef = useRef(onQuickLabAction);
  onQuickLabActionRef.current = onQuickLabAction;
  const onUpdateInstanceStateRef = useRef(onUpdateInstanceState);
  onUpdateInstanceStateRef.current = onUpdateInstanceState;
  const onRealtimeTiltPourRef = useRef(onRealtimeTiltPour);
  onRealtimeTiltPourRef.current = onRealtimeTiltPour;

  const onNotifyRef = useRef(onNotify);
  onNotifyRef.current = onNotify;

  // ===========================================================================
  // BỘ GIẢI MẠCH ĐIỆN 1 CHIỀU (DC CIRCUIT SOLVER ENGINE) & DÂY ĐIỆN 3D BẮP CHUỐI
  // ===========================================================================
  const circuitWiresGroupRef = useRef<THREE.Group | null>(null);
  const [circuitWires, setCircuitWires] = useState<CircuitWireConnection[]>([]);
  const circuitWiresRef = useRef<CircuitWireConnection[]>(circuitWires);
  circuitWiresRef.current = circuitWires;

  const [activeWireColorHex, setActiveWireColorHex] = useState<number>(0xef4444);
  const activeWireColorRef = useRef<number>(activeWireColorHex);
  activeWireColorRef.current = activeWireColorHex;

  const [pendingTerminalPick, setPendingTerminalPick] = useState<{
    instanceId: string;
    terminalId: CircuitTerminalId;
  } | null>(null);
  const pendingTerminalPickRef = useRef<{
    instanceId: string;
    terminalId: CircuitTerminalId;
  } | null>(pendingTerminalPick);
  pendingTerminalPickRef.current = pendingTerminalPick;

  const [circuitSolverResult, setCircuitSolverResult] =
    useState<DcCircuitSolverResult | null>(null);
  const [isEquipmentPickerOpen, setIsEquipmentPickerOpen] =
    useState<boolean>(false);
  const [equipmentPickerCategory, setEquipmentPickerCategory] = useState<
    'all' | 'dc-circuit' | 'mechanics' | 'optics-chem-bio'
  >('all');

  // Dựng lại các sợi dây điện bắp chuối 3D nối giữa các cọc cắm thực tế trên bàn
  const rebuild3DBananaWiresInScene = useCallback(() => {
    const wireGrp = circuitWiresGroupRef.current;
    if (!wireGrp) return;
    while (wireGrp.children.length > 0) {
      const ch = wireGrp.children[0];
      wireGrp.remove(ch);
      OpenLabAssetLoader.disposeObject3D(ch);
    }

    // Cập nhật vòng sáng vàng cho cọc đang chờ nối dây (pendingTerminalPick)
    const activePick = pendingTerminalPickRef.current;
    instanceObjectsRef.current.forEach((group, instId) => {
      group.traverse((node) => {
        if (node.name === 'terminal_highlight_ring') {
          const parentTermId = node.parent?.userData?.terminalId;
          node.visible = Boolean(
            activePick &&
              activePick.instanceId === instId &&
              activePick.terminalId === parentTermId,
          );
        }
      });
    });

    if (viewModeRef.current === 'single-asset') return;

    const pFrom = new THREE.Vector3();
    const pTo = new THREE.Vector3();

    for (const w of circuitWiresRef.current) {
      const fromObj = instanceObjectsRef.current.get(w.fromInstanceId);
      const toObj = instanceObjectsRef.current.get(w.toInstanceId);
      if (!fromObj || !toObj || !fromObj.visible || !toObj.visible) continue;

      fromObj.updateMatrixWorld(true);
      toObj.updateMatrixWorld(true);

      const fromTermNode = fromObj.getObjectByName(
        `terminal_${w.fromTerminalId}`,
      );
      const toTermNode = toObj.getObjectByName(`terminal_${w.toTerminalId}`);
      if (!fromTermNode || !toTermNode) continue;

      fromTermNode.getWorldPosition(pFrom);
      toTermNode.getWorldPosition(pTo);

      const wire3D = build3DBananaWireBetweenPoints(
        w.id,
        pFrom.clone(),
        pTo.clone(),
        w.colorHex,
      );
      wireGrp.add(wire3D);
    }
  }, []);

  // Xử lý khi người dùng Click vào 1 cọc cắm 3D (Terminal Socket) trên thiết bị
  const handleTerminalSocketPick = useCallback(
    (instanceId: string, terminalId: CircuitTerminalId) => {
      const termMeta = CIRCUIT_TERMINAL_DEFINITIONS[terminalId];
      const currentPick = pendingTerminalPickRef.current;

      if (!currentPick) {
        setPendingTerminalPick({ instanceId, terminalId });
        labSoundEngine.play('ui-toggle', 0.8);
        onNotify(
          `🔌 Đã chọn cọc [${terminalId}] (${termMeta?.labelVi || terminalId}) — Hãy click vào cọc cắm thứ 2 để nối dây điện!`,
          'info',
        );
        return;
      }

      // Nếu click lại đúng cọc vừa chọn -> hủy chọn
      if (
        currentPick.instanceId === instanceId &&
        currentPick.terminalId === terminalId
      ) {
        setPendingTerminalPick(null);
        labSoundEngine.play('ui-toggle', 0.65);
        return;
      }

      // Kiểm tra xem 2 cọc này đã có dây nối chưa -> Nếu đã có thì rút dây đó ra
      const existingWire = circuitWiresRef.current.find(
        (w) =>
          (w.fromInstanceId === currentPick.instanceId &&
            w.fromTerminalId === currentPick.terminalId &&
            w.toInstanceId === instanceId &&
            w.toTerminalId === terminalId) ||
          (w.fromInstanceId === instanceId &&
            w.fromTerminalId === terminalId &&
            w.toInstanceId === currentPick.instanceId &&
            w.toTerminalId === currentPick.terminalId),
      );

      if (existingWire) {
        setCircuitWires((prev) => prev.filter((w) => w.id !== existingWire.id));
        setPendingTerminalPick(null);
        labSoundEngine.play('ui-toggle', 0.85);
        onNotify(
          `✂️ Đã rút dây điện nối giữa [${currentPick.terminalId}] và [${terminalId}].`,
          'info',
        );
        return;
      }

      // Tạo dây điện bắp chuối 3D mới nối giữa 2 cọc
      const newWire: CircuitWireConnection = {
        id: `wire-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
        fromInstanceId: currentPick.instanceId,
        fromTerminalId: currentPick.terminalId,
        toInstanceId: instanceId,
        toTerminalId: terminalId,
        colorHex: activeWireColorRef.current,
      };
      setCircuitWires((prev) => [...prev, newWire]);
      setPendingTerminalPick(null);
      labSoundEngine.play('dock-hover-snap', 0.9);
      onNotify(
        `⚡ Đã cắm dây nối [${currentPick.terminalId}] ↔ [${terminalId}]!`,
        'success',
      );
    },
    [onNotify],
  );

  const handleTerminalSocketPickRef = useRef(handleTerminalSocketPick);
  handleTerminalSocketPickRef.current = handleTerminalSocketPick;
  const rebuild3DBananaWiresInSceneRef = useRef(rebuild3DBananaWiresInScene);
  rebuild3DBananaWiresInSceneRef.current = rebuild3DBananaWiresInScene;

  // Tự động chạy Bộ Giải Mạch Điện (Nodal Analysis + Graph Traversal) mỗi khi dây nối hoặc trạng thái thiết bị thay đổi
  useEffect(() => {
    // Lọc bỏ các dây nối vào thiết bị đã bị xóa hoặc cất khỏi bàn
    const activeIds = new Set(
      instances.filter((i) => i.visible).map((i) => i.instanceId),
    );
    const validWires = circuitWires.filter(
      (w) => activeIds.has(w.fromInstanceId) && activeIds.has(w.toInstanceId),
    );
    if (validWires.length !== circuitWires.length) {
      setCircuitWires(validWires);
      return;
    }

    const hasCircuitDevice = instances.some((i) => {
      if (!i.visible) return false;
      const arch = assetsMap.get(i.assetId)?.geometry.proceduralArchetype;
      return (
        arch === 'dc-battery-holder' ||
        arch === 'dc-knife-switch' ||
        arch === 'dc-light-bulb-126' ||
        arch === 'dc-rheostat-20' ||
        arch === 'dc-ammeter' ||
        arch === 'dc-voltmeter'
      );
    });

    if (!hasCircuitDevice) {
      setCircuitSolverResult(null);
      rebuild3DBananaWiresInScene();
      requestRenderRef.current();
      return;
    }

    const result = solveDcCircuitGraph(
      instances,
      validWires,
      (inst) => assetsMap.get(inst.assetId)?.geometry.proceduralArchetype,
    );
    setCircuitSolverResult(result);

    // Đồng bộ tức thời thông số kim Ampe kế, kim Vôn kế, độ sáng bóng đèn 126 lên mô hình 3D
    Object.entries(result.deviceStates).forEach(([instId, patch]) => {
      const inst = instances.find((i) => i.instanceId === instId);
      const asset = inst ? assetsMap.get(inst.assetId) : undefined;
      const obj = instanceObjectsRef.current.get(instId);
      if (inst && asset) {
        Object.assign(inst.instanceState, patch);
        if (obj) {
          applyInstanceStateToObject3D(obj, inst, asset);
        }
      }
    });

    rebuild3DBananaWiresInScene();
    requestRenderRef.current();
  }, [
    instances,
    assetsMap,
    circuitWires,
    pendingTerminalPick,
    rebuild3DBananaWiresInScene,
  ]);

  // Đặt trọn bộ dụng cụ mạch điện 1 chiều ra bàn thí nghiệm 3D
  const handleSpawnDcCircuitKit = useCallback(
    (autoWirePreset?: 'correct' | 'unwired') => {
      const kitLayout: Array<{
        assetId: string;
        arch: string;
        pos: [number, number, number];
      }> = [
        {
          assetId: 'OL3D-EQP-DC-HOLDER-0001',
          arch: 'dc-battery-holder',
          pos: [-0.46, 0, -0.15],
        },
        {
          assetId: 'OL3D-EQP-DC-SWITCH-0001',
          arch: 'dc-knife-switch',
          pos: [-0.14, 0, -0.16],
        },
        {
          assetId: 'OL3D-EQP-DC-RHEO-0001',
          arch: 'dc-rheostat-20',
          pos: [0.24, 0, -0.16],
        },
        {
          assetId: 'OL3D-EQP-DC-AMM-0001',
          arch: 'dc-ammeter',
          pos: [0.54, 0, 0.04],
        },
        {
          assetId: 'OL3D-EQP-DC-BULB-0001',
          arch: 'dc-light-bulb-126',
          pos: [0.14, 0, 0.18],
        },
        {
          assetId: 'OL3D-EQP-DC-VOLT-0001',
          arch: 'dc-voltmeter',
          pos: [-0.28, 0, 0.18],
        },
        {
          assetId: 'OL3D-EQP-DC-BAT-0001',
          arch: 'dc-con-o-battery',
          pos: [-0.66, 0, 0.16],
        },
      ];

      kitLayout.forEach((item) => {
        const alreadyExists = instancesRef.current.some(
          (i) =>
            i.visible &&
            assetsMapRef.current.get(i.assetId)?.geometry.proceduralArchetype ===
              item.arch,
        );
        if (!alreadyExists) {
          onDropAssetIntoScene(item.assetId, item.pos);
        }
      });

      labSoundEngine.play('wood-place', 0.9);
      if (autoWirePreset === 'correct') {
        window.setTimeout(() => {
          handleApplyCircuitPresetInternal('case6-correct');
        }, 120);
      } else {
        onNotify(
          '⚡ Đã đặt Bộ Dụng Cụ Mạch Điện Một Chiều 3D ra bàn! Hãy click vào từng cọc cắm để nối dây hoặc bấm "🔌 Lắp Chuẩn 3.0V".',
          'success',
        );
      }
    },
    [onDropAssetIntoScene, onNotify],
  );

  // Đặt từng dụng cụ rời của Bộ Thí Nghiệm Nhiệt Học: Sự Nóng Chảy Của Nước Đá & Sự Sôi (Đèn cồn, Kiềng 3 chân, Bình đựng, Khay nước đá, Nhiệt kế, Đồng hồ bấm giây)
  const handleSpawnThermalIceKit = useCallback(() => {
    const thermalItems: Array<{
      assetId: string;
      arch: string;
      pos: [number, number, number];
    }> = [
      {
        assetId: 'OL3D-EQP-TRP-0001',
        arch: 'tripod-wire-gauze',
        pos: [-0.08, 0, 0.02],
      },
      {
        assetId: 'OL3D-EQP-ALC-0001',
        arch: 'alcohol-burner',
        pos: [-0.34, 0, 0.08],
      },
      {
        assetId: 'OL3D-EQP-THV-0001',
        arch: 'thermal-heating-vessel',
        pos: [0.18, 0, 0.04],
      },
      {
        assetId: 'OL3D-EQP-ICE-0001',
        arch: 'ice-cubes-tray',
        pos: [0.42, 0, 0.08],
      },
      {
        assetId: 'OL3D-EQP-THM-0001',
        arch: 'thermometer',
        pos: [0.18, 0, -0.18],
      },
      {
        assetId: 'OL3D-EQP-STW-0001',
        arch: 'stopwatch',
        pos: [-0.36, 0, -0.16],
      },
    ];

    thermalItems.forEach((item) => {
      const alreadyOnBench = instancesRef.current.some(
        (i) =>
          i.visible &&
          assetsMapRef.current.get(i.assetId)?.geometry.proceduralArchetype ===
            item.arch,
      );
      if (!alreadyOnBench) {
        onDropAssetIntoScene(item.assetId, item.pos);
      }
    });

    labSoundEngine.play('wood-place', 0.9);
    onNotify(
      '🧊🔥 Đã lấy từng dụng cụ rời ra bàn: Đèn cồn, Kiềng 3 chân, Bình chịu nhiệt, Khay nước đá viên, Nhiệt kế & Đồng hồ! Hãy kéo lắp ghép hoặc đun thử.',
      'success',
    );
  }, [onDropAssetIntoScene, onNotify]);

  // Đặt Bộ Thí Nghiệm Sự Truyền Áp Suất Chất Lỏng & Máy Nén Thủy Lực Pascal (Hình 16.3 SGK KHTN — S₁ = 2·S₂ và các Quả nặng chuẩn 100g = 1.0N)
  const handleSpawnPascalHydraulicKit = useCallback(() => {
    const pascalPressAlreadyOnBench = instancesRef.current.some(
      (i) =>
        i.visible &&
        assetsMapRef.current.get(i.assetId)?.geometry.proceduralArchetype ===
          'pascal-hydraulic-press',
    );
    if (!pascalPressAlreadyOnBench) {
      onDropAssetIntoScene('OL3D-EQP-PAS-0001', [0.0, 0, 0.02]);
    }

    const existingWeights = instancesRef.current.filter(
      (i) =>
        i.visible &&
        assetsMapRef.current.get(i.assetId)?.geometry.proceduralArchetype ===
          'pascal-weight-100g',
    ).length;
    const weightPositions: [number, number, number][] = [
      [-0.26, 0, 0.12],
      [-0.26, 0, 0.02],
      [0.26, 0, 0.12],
      [0.26, 0, 0.02],
    ];
    for (let w = existingWeights; w < 4; w++) {
      onDropAssetIntoScene('OL3D-EQP-PWT-0001', weightPositions[w]);
    }

    labSoundEngine.play('wood-place', 0.9);
    onNotify(
      '💧⚖️ Đã đặt Bình thông nhau & Pit-tông thủy lực Pascal (S₁ = 2·S₂ — Hình 16.3 SGK KHTN) kèm 4 Quả nặng chuẩn 100g (1.0 N) ra bàn! Hãy kéo quả nặng đặt lên Pit-tông (1) hoặc (2), hoặc click trực tiếp vào 2 nhánh pit-tông.',
      'success',
    );
  }, [onDropAssetIntoScene, onNotify]);

  // Bộ Giải Vật Lý Nhiệt Học Thời Gian Thực (Real-time Thermal & Ice Phase-Change Solver):
  // Đèn cồn đang cháy có nhiệt độ ngọn lửa 100°C. Khi đặt Bình thủy tinh chịu nhiệt lên trên Đèn cồn đang cháy:
  // 1) Nếu có nước đá trong bình -> Nước đá tan từ từ (iceMassG giảm dần về 0g, mực nước dâng dần lên).
  // 2) Khi đá đã tan hết thành nước bình thường -> Nước nóng dần lên từ từ cho đến khi sôi ở 100.0°C (sủi bọt khí & bốc hơi).
  useEffect(() => {
    const timer = window.setInterval(() => {
      const allVis = instancesRef.current.filter((i) => i.visible);
      if (allVis.length === 0) return;

      // Tìm tất cả đèn cồn đang châm lửa (isHeating === true, nhiệt độ ngọn lửa 100°C)
      const litBurners = allVis.filter((i) => {
        const arch = assetsMapRef.current.get(i.assetId)?.geometry.proceduralArchetype;
        return arch === 'alcohol-burner' && Boolean(i.instanceState.isHeating);
      });

      allVis.forEach((vessel) => {
        const vArch = assetsMapRef.current.get(vessel.assetId)?.geometry.proceduralArchetype;
        const isThermalVessel =
          vArch === 'thermal-heating-vessel' ||
          vArch === 'beaker-250' ||
          vArch === 'erlenmeyer-flask' ||
          vArch === 'distillation-flask';
        if (!isThermalVessel) return;

        const vx = vessel.transform.positionM[0];
        const vz = vessel.transform.positionM[2];

        // Kiểm tra xem Bình có đang đặt trên Đèn cồn đang cháy (hoặc đặt gần/trên kiềng có Đèn cồn đang cháy) không
        const heatedByBurner = litBurners.some(
          (b) =>
            vessel.instanceState.attachedToInstanceId === b.instanceId ||
            Math.hypot(
              b.transform.positionM[0] - vx,
              b.transform.positionM[2] - vz,
            ) <= 0.165,
        );

        const curTemp = vessel.instanceState.temperatureC ?? 25.0;
        const curIceG = vessel.instanceState.iceMassG ?? 0;
        const curLiquidMl =
          vessel.instanceState.liquidLevelMl ??
          (vArch === 'thermal-heating-vessel' ? 0 : 100);

        let nextTemp = curTemp;
        let nextIceG = curIceG;
        let nextLiquidMl = curLiquidMl;
        let nextPhase = vessel.instanceState.thermalPhase ?? 'liquid-heating';
        let changed = false;

        if (heatedByBurner) {
          if (curIceG > 0.2) {
            // Đang đun trên đèn cồn: Nếu nhiệt độ âm thì ấm dần lên trên 0°C; nước đá tan chậm ở bất kỳ nhiệt độ nào khác 0°C
            if (curTemp <= 0.0) {
              nextTemp = Number(Math.min(1.5, curTemp + 0.5).toFixed(1));
              if (Math.abs(nextTemp) < 0.05) nextTemp = 0.5;
              nextPhase = nextTemp < 0 ? 'subzero-ice' : 'melting-0c';
              changed = true;
            }
            if (Math.abs(nextTemp) >= 0.05) {
              const meltStepG = Math.min(curIceG, 0.75);
              nextIceG = Number(Math.max(0, curIceG - meltStepG).toFixed(2));
              nextLiquidMl = Number(
                Math.min(250, curLiquidMl + meltStepG * 0.92).toFixed(2),
              );
              nextPhase = nextIceG > 0.2 ? 'melting-0c' : 'liquid-heating';
              changed = true;
            }
          } else if (curLiquidMl > 0.5) {
            // Đá đã tan hết thành nước bình thường (iceMassG === 0): Nước nóng dần lên từ từ cho tới khi sôi ở 100.0°C!
            nextIceG = 0;
            if (curTemp < 100.0) {
              nextTemp = Number(Math.min(100.0, curTemp + 1.0).toFixed(1));
              nextPhase = nextTemp >= 100.0 ? 'boiling-100c' : 'liquid-heating';
              changed = true;
            } else {
              // Giai đoạn 4: Nước sôi ở 100.0°C (bọt khí sủi lên & bốc hơi)
              nextTemp = 100.0;
              nextPhase = 'boiling-100c';
              if (curLiquidMl > 20) {
                nextLiquidMl = Number(Math.max(20, curLiquidMl - 0.06).toFixed(2));
                changed = true;
              }
            }
          } else if (curTemp < 100.0) {
            // Bình thủy tinh rỗng đặt trên đèn cồn đang cháy: thân bình ấm dần (không giả lập sôi nước)
            nextTemp = Number(Math.min(100.0, curTemp + 1.2).toFixed(1));
            nextPhase = 'liquid-heating';
            changed = true;
          }
        } else {
          // Không đặt trên đèn cồn đang cháy (Để ở nhiệt độ phòng bình thường 25.0°C):
          if (curIceG > 0.2) {
            // Nước đá để ở nhiệt độ phòng bình thường sẽ tan từ từ thành nước lỏng
            const meltStepG = Math.min(curIceG, 0.55);
            nextIceG = Number(Math.max(0, curIceG - meltStepG).toFixed(2));
            nextLiquidMl = Number(
              Math.min(250, curLiquidMl + meltStepG * 0.92).toFixed(2),
            );
            if (curTemp < 0.0) {
              // Đá âm độ ấm dần lên 0°C rồi tiếp tục tan ở nhiệt độ phòng
              nextTemp = Number(Math.min(0.5, curTemp + 0.5).toFixed(1));
            } else if (curTemp > 4.0) {
              // Nếu thả đá vào nước đang ấm, nước hạ nhiệt dần về vùng nước đá đang tan
              nextTemp = Number(Math.max(1.0, curTemp - 0.5).toFixed(1));
            } else {
              // Khi đá gần tan hết ở nhiệt độ phòng, nhiệt độ nước nhích dần lên
              const meltedFraction = Math.max(0, Math.min(1, 1 - nextIceG / 100));
              nextTemp = Number(Math.max(curTemp, meltedFraction * 6.0).toFixed(1));
            }
            if (nextIceG <= 0.2) {
              nextIceG = 0;
              nextPhase = 'liquid-heating';
            } else {
              nextPhase = nextTemp < 0 ? 'subzero-ice' : 'melting-0c';
            }
            changed = true;
          } else {
            nextIceG = 0;
            // Khi đá đã tan hết thành nước (hoặc khi lấy nước sôi ra khỏi đèn cồn), nhiệt độ nước tiến dần về nhiệt độ phòng 25.0°C!
            if (curTemp > 25.0) {
              nextTemp = Number(Math.max(25.0, curTemp - 0.8).toFixed(1));
              nextPhase = 'liquid-heating';
              changed = true;
            } else if (curTemp < 25.0 && (curLiquidMl > 0.5 || curTemp < 0)) {
              nextTemp = Number(Math.min(25.0, curTemp + 0.6).toFixed(1));
              nextPhase = 'liquid-heating';
              changed = true;
            }
          }
        }

        if (changed) {
          onUpdateInstanceStateRef.current?.(vessel.instanceId, {
            temperatureC: nextTemp,
            iceMassG: nextIceG,
            liquidLevelMl: nextLiquidMl,
            baseLiquidLevelMl: nextLiquidMl,
            thermalPhase: nextPhase,
            isHeating: heatedByBurner,
          });
        }

        // Đồng bộ Nhiệt kế (`thermometer`) đang cắm trong bình, gắn trên Giá đỡ thí nghiệm (`retort-stand`) hoặc đặt sát bình
        allVis.forEach((th) => {
          const thArch = assetsMapRef.current.get(th.assetId)?.geometry.proceduralArchetype;
          if (thArch !== 'thermometer') return;
          const isAttached =
            th.instanceState.attachedToInstanceId === vessel.instanceId ||
            (Boolean(th.instanceState.attachedToInstanceId) &&
              th.instanceState.attachedToInstanceId ===
                vessel.instanceState.attachedToInstanceId);
          const distToVessel = Math.hypot(
            th.transform.positionM[0] - vx,
            th.transform.positionM[2] - vz,
          );
          if (isAttached || distToVessel <= 0.15) {
            const targetReadout = Number(nextTemp.toFixed(1));
            if (
              Math.abs((th.instanceState.temperatureC ?? 25) - targetReadout) >=
              0.1
            ) {
              onUpdateInstanceStateRef.current?.(th.instanceId, {
                temperatureC: targetReadout,
              });
            }
          }
        });
      });
    }, 250);

    return () => window.clearInterval(timer);
  }, []);

  // Áp dụng nhanh các kịch bản nối dây (TH1 -> TH6) để kiểm chứng Bộ Giải Mạch Điện
  const handleApplyCircuitPresetInternal = useCallback(
    (
      preset:
        | 'case6-correct'
        | 'case2-voltmeter-series'
        | 'case3-ammeter-parallel-short'
        | 'case4-reverse-polarity'
        | 'case5-over-range-06a'
        | 'clear-wires',
    ) => {
      if (preset === 'clear-wires') {
        setCircuitWires([]);
        setPendingTerminalPick(null);
        labSoundEngine.play('ui-toggle', 0.8);
        onNotify(
          '✂️ Đã tháo toàn bộ dây dẫn! Hãy click vào các cọc cắm 3D trên thiết bị để tự tay lắp mạch.',
          'info',
        );
        return;
      }

      const findByArch = (arch: string) =>
        instancesRef.current.find(
          (i) =>
            i.visible &&
            assetsMapRef.current.get(i.assetId)?.geometry.proceduralArchetype ===
              arch,
        );

      const holder = findByArch('dc-battery-holder');
      const sw = findByArch('dc-knife-switch');
      const rheo = findByArch('dc-rheostat-20');
      const amm = findByArch('dc-ammeter');
      const bulb = findByArch('dc-light-bulb-126');
      const volt = findByArch('dc-voltmeter');

      if (!holder || !sw || !rheo || !amm || !bulb || !volt) {
        handleSpawnDcCircuitKit('unwired');
        window.setTimeout(() => {
          handleApplyCircuitPresetInternal(preset);
        }, 180);
        return;
      }

      // Đảm bảo 2 pin đã lắp đúng chiều và đóng cầu dao K để thấy ngay hiện tượng
      onUpdateInstanceStateRef.current?.(holder.instanceId, {
        slot1Inserted: true,
        slot1Reversed: false,
        slot2Inserted: true,
        slot2Reversed: false,
      });
      onUpdateInstanceStateRef.current?.(sw.instanceId, {
        switchClosed: true,
      });

      const mkWire = (
        fromInst: string,
        fromTerm: CircuitTerminalId,
        toInst: string,
        toTerm: CircuitTerminalId,
        colorHex: number,
      ): CircuitWireConnection => ({
        id: `preset-${fromTerm}-${toTerm}-${Math.random().toString(36).slice(2, 6)}`,
        fromInstanceId: fromInst,
        fromTerminalId: fromTerm,
        toInstanceId: toInst,
        toTerminalId: toTerm,
        colorHex,
      });

      if (preset === 'case6-correct') {
        onUpdateInstanceStateRef.current?.(rheo.instanceId, {
          sliderRatio: 0.35,
          rheostatOhm: 7.0,
        });
        setCircuitWires([
          // Cầu nối tiếp 2 pin: BAT1_NEG -> BAT2_POS
          mkWire(holder.instanceId, 'BAT1_NEG', holder.instanceId, 'BAT2_POS', 0xef4444),
          // Vòng nối tiếp chính: BAT1_POS -> SW_RED, SW_GREEN -> RHEO_IN, RHEO_WIPER -> AM_06A, AM_NEG -> BULB_POS, BULB_NEG -> BAT2_NEG
          mkWire(holder.instanceId, 'BAT1_POS', sw.instanceId, 'SW_RED', 0xef4444),
          mkWire(sw.instanceId, 'SW_GREEN', rheo.instanceId, 'RHEO_IN', 0xef4444),
          mkWire(rheo.instanceId, 'RHEO_WIPER', amm.instanceId, 'AM_06A', 0xef4444),
          mkWire(amm.instanceId, 'AM_NEG', bulb.instanceId, 'BULB_POS', 0xef4444),
          mkWire(bulb.instanceId, 'BULB_NEG', holder.instanceId, 'BAT2_NEG', 0x2563eb),
          // Vôn kế mắc SONG SONG với bóng đèn
          mkWire(bulb.instanceId, 'BULB_POS', volt.instanceId, 'VM_6V', 0xef4444),
          mkWire(bulb.instanceId, 'BULB_NEG', volt.instanceId, 'VM_NEG', 0x2563eb),
        ]);
        onNotify(
          '✅ Đã lắp Mạch Điện Chuẩn 3.0V (Trường hợp 6): Cầu nối BAT1_NEG -> BAT2_POS, Ampe kế nối tiếp, Vôn kế song song bóng đèn!',
          'success',
        );
      } else if (preset === 'case2-voltmeter-series') {
        setCircuitWires([
          mkWire(holder.instanceId, 'BAT1_NEG', holder.instanceId, 'BAT2_POS', 0xef4444),
          mkWire(holder.instanceId, 'BAT1_POS', sw.instanceId, 'SW_RED', 0xef4444),
          mkWire(sw.instanceId, 'SW_GREEN', volt.instanceId, 'VM_6V', 0xef4444),
          mkWire(volt.instanceId, 'VM_NEG', amm.instanceId, 'AM_06A', 0xef4444),
          mkWire(amm.instanceId, 'AM_NEG', bulb.instanceId, 'BULB_POS', 0xef4444),
          mkWire(bulb.instanceId, 'BULB_NEG', holder.instanceId, 'BAT2_NEG', 0x2563eb),
        ]);
        onNotify(
          '⚠️ Đã tái hiện Trường hợp 2: Mắc Vôn kế NỐI TIẾP vào mạch chính (R_V = 10000Ω cản trở dòng điện)!',
          'warning',
        );
      } else if (preset === 'case3-ammeter-parallel-short') {
        onUpdateInstanceStateRef.current?.(rheo.instanceId, {
          sliderRatio: 0.0,
          rheostatOhm: 0.0,
        });
        setCircuitWires([
          mkWire(holder.instanceId, 'BAT1_NEG', holder.instanceId, 'BAT2_POS', 0xef4444),
          mkWire(holder.instanceId, 'BAT1_POS', sw.instanceId, 'SW_RED', 0xef4444),
          mkWire(sw.instanceId, 'SW_GREEN', bulb.instanceId, 'BULB_POS', 0xef4444),
          mkWire(bulb.instanceId, 'BULB_NEG', holder.instanceId, 'BAT2_NEG', 0x2563eb),
          // Mắc Ampe kế SONG SONG trực tiếp với nguồn / bóng đèn gây đoản mạch!
          mkWire(sw.instanceId, 'SW_GREEN', amm.instanceId, 'AM_06A', 0xef4444),
          mkWire(amm.instanceId, 'AM_NEG', holder.instanceId, 'BAT2_NEG', 0x2563eb),
        ]);
        onNotify(
          '🔥 Đã tái hiện Trường hợp 3: Mắc Ampe kế SONG SONG với nguồn/bóng đèn gây ĐOẢN MẠCH (I > 5A)!',
          'warning',
        );
      } else if (preset === 'case4-reverse-polarity') {
        onUpdateInstanceStateRef.current?.(rheo.instanceId, {
          sliderRatio: 0.35,
          rheostatOhm: 7.0,
        });
        setCircuitWires([
          mkWire(holder.instanceId, 'BAT1_NEG', holder.instanceId, 'BAT2_POS', 0xef4444),
          mkWire(holder.instanceId, 'BAT1_POS', sw.instanceId, 'SW_RED', 0xef4444),
          mkWire(sw.instanceId, 'SW_GREEN', rheo.instanceId, 'RHEO_IN', 0xef4444),
          // Cắm ngược cực Ampe kế: dòng từ nguồn dương đi vào AM_NEG (-) và ra ở AM_06A (+)
          mkWire(rheo.instanceId, 'RHEO_WIPER', amm.instanceId, 'AM_NEG', 0xef4444),
          mkWire(amm.instanceId, 'AM_06A', bulb.instanceId, 'BULB_POS', 0xef4444),
          mkWire(bulb.instanceId, 'BULB_NEG', holder.instanceId, 'BAT2_NEG', 0x2563eb),
          // Cắm ngược cực Vôn kế: cực dương bóng đèn cắm vào VM_NEG (-)
          mkWire(bulb.instanceId, 'BULB_POS', volt.instanceId, 'VM_NEG', 0xef4444),
          mkWire(bulb.instanceId, 'BULB_NEG', volt.instanceId, 'VM_6V', 0x2563eb),
        ]);
        onNotify(
          '🔄 Đã tái hiện Trường hợp 4: Cắm ngược cực (+) và (-) của đồng hồ đo (Kim lệch âm về bên trái vạch 0)!',
          'warning',
        );
      } else if (preset === 'case5-over-range-06a') {
        setCircuitWires([
          mkWire(holder.instanceId, 'BAT1_NEG', holder.instanceId, 'BAT2_POS', 0xef4444),
          mkWire(holder.instanceId, 'BAT1_POS', sw.instanceId, 'SW_RED', 0xef4444),
          mkWire(sw.instanceId, 'SW_GREEN', rheo.instanceId, 'RHEO_IN', 0xef4444),
          // Cắm cả 2 dây vào 2 cọc dương (AM_06A và AM_3A), bỏ trống cọc âm AM_NEG (-)
          mkWire(rheo.instanceId, 'RHEO_WIPER', amm.instanceId, 'AM_06A', 0xef4444),
          mkWire(amm.instanceId, 'AM_3A', bulb.instanceId, 'BULB_POS', 0xef4444),
          mkWire(bulb.instanceId, 'BULB_NEG', holder.instanceId, 'BAT2_NEG', 0x2563eb),
        ]);
        onNotify(
          '⚠️ Đã tái hiện Trường hợp 5: Cắm sai vào cả 2 cọc dương (0.6A và 3A), bỏ trống cọc âm (-)!',
          'warning',
        );
      }
      setPendingTerminalPick(null);
      labSoundEngine.play('dock-hover-snap', 0.85);
    },
    [handleSpawnDcCircuitKit, onNotify],
  );

  // Hàm điều chỉnh góc nghiêng (0° -> 85°) cho dụng cụ chứa chất lỏng và tự động canh miệng bình trên dụng cụ nhận gần nhất
  const handleSetVesselTiltAngle = useCallback(
    (instanceId: string, rawTiltDeg: number, autoAlignOverTarget = true) => {
      const clampedDeg = Math.max(0, Math.min(85, Math.round(rawTiltDeg)));
      setVesselTiltDegMap((prev) => ({ ...prev, [instanceId]: clampedDeg }));

      const srcInst = instancesRef.current.find((i) => i.instanceId === instanceId);
      if (!srcInst) return;
      const srcAsset = assetsMapRef.current.get(srcInst.assetId);
      const srcObj = instanceObjectsRef.current.get(instanceId);
      const tiltRad = -(clampedDeg * Math.PI) / 180;

      let nextPos: [number, number, number] = [...srcInst.transform.positionM];
      if (clampedDeg <= 2) {
        // Khi đặt thẳng lại về 0°, hạ bình xuống mặt bàn gỗ (localY = 0)
        nextPos = [
          srcInst.transform.positionM[0],
          0,
          srcInst.transform.positionM[2],
        ];
      } else if (autoAlignOverTarget && clampedDeg >= 20) {
        // Tìm bình nhận gần nhất trên bàn để đưa miệng bình nguồn lại gần phía trên miệng bình nhận
        let nearestTarget: SceneInstance | null = null;
        let bestDist = Infinity;
        for (const other of instancesRef.current) {
          if (!other.visible || other.instanceId === instanceId) continue;
          const otherArch = assetsMapRef.current.get(other.assetId)?.geometry.proceduralArchetype;
          if (
            otherArch === 'graduated-cylinder' ||
            otherArch === 'beaker-250' ||
            otherArch === 'erlenmeyer-flask' ||
            otherArch === 'overflow-can' ||
            otherArch === 'porcelain-dish'
          ) {
            const d = Math.hypot(
              other.transform.positionM[0] - srcInst.transform.positionM[0],
              other.transform.positionM[2] - srcInst.transform.positionM[2],
            );
            if (d < bestDist) {
              bestDist = d;
              nearestTarget = other;
            }
          }
        }
        if (nearestTarget && bestDist < 0.42) {
          const dstAsset = assetsMapRef.current.get(nearestTarget.assetId);
          const kin = computeExactPourPosition(
            srcAsset,
            dstAsset,
            nearestTarget.transform.positionM[0],
            nearestTarget.transform.positionM[2],
          );
          nextPos = [
            Number(kin.pourX.toFixed(3)),
            Number(kin.pourY.toFixed(3)),
            Number(kin.pourZ.toFixed(3)),
          ];
        } else if (srcInst.transform.positionM[1] < 0.055) {
          nextPos = [
            srcInst.transform.positionM[0],
            0.078,
            srcInst.transform.positionM[2],
          ];
        }
      }

      if (srcObj) {
        srcObj.rotation.z = tiltRad;
        srcObj.position.set(
          nextPos[0],
          BENCH_SURFACE_Y + nextPos[1],
          nextPos[2],
        );
        const liqSurf = srcObj.getObjectByName('liquid_surface');
        if (liqSurf) {
          liqSurf.rotation.z = -tiltRad * 0.78;
        }
      }

      onUpdateTransformRef.current(
        instanceId,
        nextPos,
        [
          srcInst.transform.rotationRad[0],
          srcInst.transform.rotationRad[1],
          Number(tiltRad.toFixed(4)),
        ],
      );
      requestRenderRef.current();
    },
    [],
  );

  const triggerDispenseVisualAnimation = useCallback(
    (targetInstanceId: string, volumeMl: number, mode: 'add' | 'set') => {
      const dispenserInst = instancesRef.current.find(
        (i) =>
          i.visible &&
          assetsMapRef.current.get(i.assetId)?.geometry.proceduralArchetype ===
            'water-dispenser',
      );
      const targetInst = instancesRef.current.find(
        (i) => i.instanceId === targetInstanceId,
      );
      if (!dispenserInst || !targetInst) return;
      const targetAsset = assetsMapRef.current.get(targetInst.assetId);
      const targetArch = targetAsset?.geometry.proceduralArchetype;
      const maxCap =
        targetArch === 'overflow-can'
          ? 210
          : targetAsset?.scientificProperties.capacity?.value ?? 100;
      const curMl =
        targetInst.instanceState.baseLiquidLevelMl ??
        targetInst.instanceState.liquidLevelMl ??
        maxCap * 0.5;
      const dispCurMl = dispenserInst.instanceState.liquidLevelMl ?? 850;
      const desiredMl =
        mode === 'set'
          ? Math.max(0, Math.min(maxCap, volumeMl))
          : Math.max(0, Math.min(maxCap, curMl + Math.min(volumeMl, dispCurMl)));
      const deltaAdded = Math.max(0, desiredMl - curMl);
      const dispEndMl = Math.max(0, dispCurMl - (mode === 'add' ? deltaAdded : 0));

      activeDispenseAnimRef.current = {
        dispenserId: dispenserInst.instanceId,
        targetId: targetInst.instanceId,
        startTimeMs: performance.now(),
        durationMs: 1050,
        dstStartScaleY: THREE.MathUtils.clamp((curMl / maxCap) / 0.5, 0.06, 2.08),
        dstEndScaleY: THREE.MathUtils.clamp((desiredMl / maxCap) / 0.5, 0.06, 2.08),
        dispStartScaleY: THREE.MathUtils.clamp((dispCurMl / 1000) / 0.5, 0.06, 2.0),
        dispEndScaleY: THREE.MathUtils.clamp((dispEndMl / 1000) / 0.5, 0.06, 2.0),
      };
      requestRenderRef.current();
    },
    [],
  );

  const triggerPourVisualAnimation = useCallback(
    (
      sourceId: string,
      targetArchetype: 'graduated-cylinder' | 'beaker-250' | 'overflow-can',
    ) => {
      const srcInst = instancesRef.current.find((i) => i.instanceId === sourceId);
      const dstInst = instancesRef.current.find(
        (i) =>
          i.visible &&
          i.instanceId !== sourceId &&
          assetsMapRef.current.get(i.assetId)?.geometry.proceduralArchetype ===
            targetArchetype,
      );
      if (!srcInst || !dstInst) return;
      const srcAsset = assetsMapRef.current.get(srcInst.assetId);
      const dstAsset = assetsMapRef.current.get(dstInst.assetId);
      const srcCap =
        srcAsset?.geometry.proceduralArchetype === 'overflow-can'
          ? 210
          : srcAsset?.scientificProperties.capacity?.value ?? 100;
      const dstCap =
        dstAsset?.geometry.proceduralArchetype === 'overflow-can'
          ? 210
          : dstAsset?.scientificProperties.capacity?.value ?? 100;
      const srcCurMl =
        srcInst.instanceState.baseLiquidLevelMl ??
        srcInst.instanceState.liquidLevelMl ??
        40;
      const dstCurMl =
        dstInst.instanceState.baseLiquidLevelMl ??
        dstInst.instanceState.liquidLevelMl ??
        dstCap * 0.5;
      const maxBatch = targetArchetype === 'overflow-can' ? 50 : 20;
      const pourAmt = Math.max(0, Math.min(maxBatch, srcCurMl, dstCap - dstCurMl));
      // Nếu bình nguồn hết nước hoặc bình nhận đã đầy thì không nghiêng rót nước
      if (pourAmt <= 0.2) return;

      const ox = dstInst.transform.positionM[0];
      const oz = dstInst.transform.positionM[2];
      const kin = computeExactPourPosition(srcAsset, dstAsset, ox, oz);
      activePourAnimRef.current = {
        sourceId,
        targetId: dstInst.instanceId,
        startTimeMs: performance.now(),
        durationMs: 1120,
        pourX: kin.pourX,
        pourY: kin.pourY,
        pourZ: kin.pourZ,
        targetX: ox,
        targetRimY: kin.targetRimY,
        targetZ: oz,
        settleX: THREE.MathUtils.clamp(ox - 0.105, -BENCH_LIMIT_X, BENCH_LIMIT_X),
        settleZ: THREE.MathUtils.clamp(oz + 0.022, -BENCH_LIMIT_Z, BENCH_LIMIT_Z),
        srcStartScaleY: THREE.MathUtils.clamp((srcCurMl / srcCap) / 0.5, 0.08, 2.0),
        srcEndScaleY: THREE.MathUtils.clamp(((srcCurMl - pourAmt) / srcCap) / 0.5, 0.0, 2.0),
        dstStartScaleY: THREE.MathUtils.clamp((dstCurMl / dstCap) / 0.5, 0.08, 2.0),
        dstEndScaleY: THREE.MathUtils.clamp(((dstCurMl + pourAmt) / dstCap) / 0.5, 0.08, 2.0),
      };
      requestRenderRef.current();
    },
    [],
  );

  // Phím tắt Delete / Backspace để xóa nhanh thiết bị đang chọn trên bàn mô phỏng 3D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        (e.target as HTMLElement | null)?.isContentEditable
      ) {
        return;
      }
      const selId = selectedInstanceIdRef.current;
      if (selId && onQuickLabActionRef.current && viewModeRef.current === 'lab-scene') {
        e.preventDefault();
        setViewportContextMenu(null);
        onQuickLabActionRef.current('delete-instance', selId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [projectedLabels, setProjectedLabels] = useState<ProjectedLabel[]>([]);
  const [hoveredEquipment, setHoveredEquipment] =
    useState<HoveredEquipmentTooltip | null>(null);
  const [cameraReadout, setCameraReadout] = useState<{
    azimuthDeg: number;
    elevationDeg: number;
    distanceM: number;
  }>({ azimuthDeg: 0, elevationDeg: 28, distanceM: 0.92 });
  const [loadingCount, setLoadingCount] = useState<number>(0);
  const [simulatedError, setSimulatedError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [activeDockHint, setActiveDockHint] = useState<string | null>(null);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() =>
    labSoundEngine.isMuted(),
  );
  const [viewportContextMenu, setViewportContextMenu] = useState<{
    instanceId: string;
    asset: AssetDefinition;
    customLabel?: string;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (!viewportContextMenu) return;
    const closeMenu = () => setViewportContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [viewportContextMenu]);

  useEffect(() => {
    return labSoundEngine.subscribe((muted) => {
      setIsSoundMuted(muted);
    });
  }, []);

  // ===========================================================================
  // OL3D-LAB-ENVIRONMENT-SPEC v2.0 STATE: Coordinate Settings, 13 Physical Env Vars,
  // Separate Graphics Settings, Dual Clocks (Vietnam realClock + simulationClock) & Event Logs
  // ===========================================================================
  const [showEnvSpecModal, setShowEnvSpecModal] = useState<boolean>(false);
  const [coordSettings, setCoordSettings] = useState<CoordinateDisplaySettings>(
    () => DEFAULT_COORDINATE_DISPLAY_SETTINGS,
  );
  const [envVars, setEnvVars] = useState<
    Record<EnvironmentVariableId, EnvironmentVariableDefinition>
  >(() => INITIAL_ENVIRONMENT_VARIABLES);
  const [graphicsSettings, setGraphicsSettings] = useState<LabGraphicsSettings>(
    () => DEFAULT_LAB_GRAPHICS_SETTINGS,
  );
  const [clockState, setClockState] = useState<LabClockState>(() => ({
    realClock: {
      ...formatVietnamDateTime(new Date()),
      timeZone: 'Asia/Ho_Chi_Minh',
    },
    simulationClock: {
      elapsedSeconds: 0,
      status: 'running',
      speedMultiplier: 1,
      lastTickEpochMs: Date.now(),
    },
  }));
  const [eventLogs, setEventLogs] = useState<LabEventLog[]>(() => {
    const initTime = formatVietnamDateTime(new Date());
    return [
      {
        eventId: 'evt-init-v2',
        eventType: 'SESSION_INIT',
        realTimestampUtc: initTime.isoUtc,
        localTimestamp: initTime.localDateTime,
        simulationElapsedSeconds: 0,
        summaryVi:
          'Khởi tạo Môi trường Phòng thí nghiệm 3D (12×8×3.6 m, Sàn y=0, Bàn thực hành y=0.82 m, Gốc O(0,0,0)).',
      },
    ];
  });
  const [customCalibrationPoint, setCustomCalibrationPoint] = useState<{
    label: string;
    worldM: [number, number, number];
  } | null>(null);
  const [distancePointA, setDistancePointA] = useState<{
    label: string;
    worldM: [number, number, number];
  }>({
    label: 'Gốc O (0, 0, 0)',
    worldM: [0, 0, 0],
  });
  const [distancePointB, setDistancePointB] = useState<{
    label: string;
    worldM: [number, number, number];
  }>({
    label: `Tâm mặt bàn (0, ${BENCH_SURFACE_Y}, 0)`,
    worldM: [0, BENCH_SURFACE_Y, 0],
  });

  const worldCoordHelperRef = useRef<THREE.Group | null>(null);

  // ===========================================================================
  // 3D VIDEO RECORDING & AUTOMATIC EXPERIMENT STEP MILESTONE ENGINE
  // ===========================================================================
  const [isRecordingVideo, setIsRecordingVideo] = useState<boolean>(false);
  const [isRecordingPaused, setIsRecordingPaused] = useState<boolean>(false);
  const [recordingElapsedSec, setRecordingElapsedSec] = useState<number>(0);
  const [recordedMilestonesCount, setRecordedMilestonesCount] =
    useState<number>(0);
  const [completedRecordingSession, setCompletedRecordingSession] =
    useState<LabRecordingSession | null>(null);
  const [showVideoRecorderModal, setShowVideoRecorderModal] =
    useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const compositeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const compositeStreamRef = useRef<MediaStream | null>(null);
  const recordingTimerRef = useRef<number | null>(null);
  const recordingElapsedRef = useRef<number>(0);
  const recordingStartedAtVnRef = useRef<string>('');
  const activeMilestonesRef = useRef<RecordedStepMilestone[]>([]);
  const recentMilestoneBannerRef = useRef<{
    stepNumber: number;
    title: string;
    triggeredAtElapsedSec: number;
  } | null>(null);
  const lastAutoSignatureRef = useRef<string>('');
  const clockStateRef = useRef(clockState);
  clockStateRef.current = clockState;
  const environmentRef = useRef(environment);
  environmentRef.current = environment;
  const studentHintRef = useRef(studentCurrentHint);
  studentHintRef.current = studentCurrentHint;

  const collectLiveMeasurementChips = useCallback((): {
    chips: LabLiveMeasurementChip[];
    summaryText: string;
  } => {
    const chips: LabLiveMeasurementChip[] = [];
    for (const inst of instancesRef.current) {
      if (!inst.visible) continue;
      const asset = assetsMapRef.current.get(inst.assetId);
      if (!asset) continue;
      const arch = asset.geometry.proceduralArchetype;
      const isMeasurementDevice =
        arch === 'electronic-balance' ||
        arch === 'graduated-cylinder' ||
        arch === 'overflow-can' ||
        arch === 'beaker-250' ||
        arch === 'water-dispenser' ||
        arch === 'thermometer' ||
        arch === 'spring-dynamometer' ||
        arch === 'vernier-caliper' ||
        arch === 'digital-multimeter' ||
        arch === 'galvanometer' ||
        arch === 'semicircular-slab' ||
        arch === 'optical-microscope' ||
        Boolean(htmlEquipmentModuleRegistry.getModule(asset.assetId));

      if (!isMeasurementDevice) continue;
      const { readoutBadge, isDigitalScale } = computeLiveEquipmentReadout(
        inst,
        asset,
      );
      if (readoutBadge) {
        chips.push({
          label: inst.customLabel || asset.name.vi,
          valueText: readoutBadge,
          isHighlight:
            isDigitalScale || inst.instanceId === selectedInstanceIdRef.current,
        });
      }
    }
    const summaryText =
      chips.length > 0
        ? chips.map((c) => `${c.label}: ${c.valueText}`).join(' · ')
        : 'Đang quan sát bố cục bàn thí nghiệm';
    return { chips, summaryText };
  }, []);

  const recordStepMilestoneInternal = useCallback(
    (stepTitle: string, silent = false) => {
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      if (!renderer || !scene || !camera) return;

      const { summaryText } = collectLiveMeasurementChips();
      const nextStepNum = activeMilestonesRef.current.length + 1;
      const elapsed = recordingElapsedRef.current;
      const vnNow = formatVietnamDateTime(new Date()).localDateTime;

      const thumbUrl = captureMilestoneThumbnail({
        webglCanvas: renderer.domElement,
        renderer,
        scene,
        camera,
        experimentTitle: environmentRef.current.name.vi,
        stepNumber: nextStepNum,
        stepTitle,
        measurementsSummary: summaryText,
        elapsedSec: elapsed,
      });

      const milestone: RecordedStepMilestone = {
        id: `ms-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        stepNumber: nextStepNum,
        elapsedSec: Number(elapsed.toFixed(1)),
        realTimeVn: vnNow,
        title: stepTitle,
        measurementsSummary: summaryText,
        thumbnailDataUrl: thumbUrl,
      };

      activeMilestonesRef.current = [...activeMilestonesRef.current, milestone];
      setRecordedMilestonesCount(activeMilestonesRef.current.length);
      recentMilestoneBannerRef.current = {
        stepNumber: nextStepNum,
        title: stepTitle,
        triggeredAtElapsedSec: elapsed,
      };

      if (!silent) {
        labSoundEngine.play('camera-shutter', 0.85);
        onNotify(
          `Đã lưu Bước ${nextStepNum} (${formatRecTime(elapsed)}): ${stepTitle}`,
          'info',
        );
      }
    },
    [collectLiveMeasurementChips, onNotify],
  );

  const handleStartVideoRecording = useCallback(() => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!renderer || !scene || !camera) {
      onNotify('Khung nhìn 3D chưa sẵn sàng để ghi hình.', 'warning');
      return;
    }

    try {
      if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      const compCanvas = document.createElement('canvas');
      compCanvas.width = 1280;
      compCanvas.height = 720;
      compositeCanvasRef.current = compCanvas;
      const compCtx = compCanvas.getContext('2d');

      recordedChunksRef.current = [];
      activeMilestonesRef.current = [];
      recordingElapsedRef.current = 0;
      setRecordingElapsedSec(0);
      setRecordedMilestonesCount(0);
      const vnStart = formatVietnamDateTime(new Date()).localDateTime;
      recordingStartedAtVnRef.current = vnStart;

      // Vẽ khung hình đầu tiên trước khi khởi động MediaRecorder
      renderer.render(scene, camera);
      if (compCtx) {
        const { chips } = collectLiveMeasurementChips();
        drawCompositeRecordingFrame({
          ctx: compCtx,
          width: 1280,
          height: 720,
          webglCanvas: renderer.domElement,
          experimentTitle: environmentRef.current.name.vi,
          realTimeVn: vnStart,
          simTimeText: formatSimulationDuration(
            clockStateRef.current.simulationClock.elapsedSeconds,
          ),
          recordingElapsedSec: 0,
          currentStepHint: studentHintRef.current,
          liveChips: chips,
          recentMilestone: null,
          includeHudOverlay: true,
        });
      }

      // Chụp tự động Bước 1 (Bố trí ban đầu)
      recordStepMilestoneInternal(
        studentHintRef.current
          ? `Khởi đầu: ${studentHintRef.current}`
          : 'Bước khởi đầu — Bố trí dụng cụ thí nghiệm trên bàn',
        true,
      );

      const { chips: initChips, summaryText: initSummary } =
        collectLiveMeasurementChips();
      lastAutoSignatureRef.current = `${studentHintRef.current || ''}|${initSummary}|${initChips.length}`;

      const stream = compCanvas.captureStream(30);
      try {
        const audioTracks = labSoundEngine.getRecordingAudioTracks();
        audioTracks.forEach((track) => stream.addTrack(track));
      } catch {
        // Ignore if audio track attachment is not supported
      }
      compositeStreamRef.current = stream;
      labSoundEngine.play('record-start', 0.9);

      const { mimeType } = getSupportedVideoMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond: 4_500_000,
          })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          recordedChunksRef.current.push(ev.data);
        }
      };

      recorder.onstop = () => {
        const { mimeType: defaultMime, fileExtension } =
          getSupportedVideoMimeType();
        const finalMime = recorder.mimeType || defaultMime || 'video/webm';
        const blob =
          recordedChunksRef.current.length > 0
            ? new Blob(recordedChunksRef.current, { type: finalMime })
            : null;
        const url = blob ? URL.createObjectURL(blob) : null;

        const finalSession: LabRecordingSession = {
          sessionId: `rec-${Date.now()}`,
          experimentTitle: environmentRef.current.name.vi,
          startedAtVn: recordingStartedAtVnRef.current,
          durationSec: Math.max(1, Math.round(recordingElapsedRef.current)),
          videoBlob: blob,
          videoUrl: url,
          mimeType: finalMime,
          fileExtension,
          milestones: [...activeMilestonesRef.current],
        };

        setCompletedRecordingSession(finalSession);
        setShowVideoRecorderModal(true);
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecordingVideo(true);
      setIsRecordingPaused(false);

      // Vòng lặp 30 FPS cập nhật khung hình tổng hợp (3D + Băng thông số dụng cụ)
      let lastTickMs = performance.now();
      recordingTimerRef.current = window.setInterval(() => {
        const nowMs = performance.now();
        const dtSec = Math.min(0.2, Math.max(0, (nowMs - lastTickMs) / 1000));
        lastTickMs = nowMs;

        const rec = mediaRecorderRef.current;
        if (!rec || rec.state !== 'recording') return;

        recordingElapsedRef.current += dtSec;
        setRecordingElapsedSec(Math.floor(recordingElapsedRef.current));

        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
          const ctx2d = compositeCanvasRef.current?.getContext('2d');
          if (ctx2d) {
            const { chips } = collectLiveMeasurementChips();
            drawCompositeRecordingFrame({
              ctx: ctx2d,
              width: 1280,
              height: 720,
              webglCanvas: rendererRef.current.domElement,
              experimentTitle: environmentRef.current.name.vi,
              realTimeVn: clockStateRef.current.realClock.localDateTime,
              simTimeText: formatSimulationDuration(
                clockStateRef.current.simulationClock.elapsedSeconds,
              ),
              recordingElapsedSec: recordingElapsedRef.current,
              currentStepHint: studentHintRef.current,
              liveChips: chips,
              recentMilestone: recentMilestoneBannerRef.current,
              includeHudOverlay: true,
            });
          }
        }
      }, 33);

      onNotify(
        'Đang ghi hình thực hành 3D! Các bước thao tác dụng cụ sẽ được tự động đánh dấu để xuất Video Tóm Tắt.',
        'success',
      );
    } catch (err) {
      onNotify(
        `Không thể khởi động trình ghi hình: ${err instanceof Error ? err.message : 'Trình duyệt không hỗ trợ'}`,
        'error',
      );
    }
  }, [collectLiveMeasurementChips, onNotify, recordStepMilestoneInternal]);

  const handlePauseResumeVideoRecording = useCallback(() => {
    const rec = mediaRecorderRef.current;
    if (!rec) return;
    if (rec.state === 'recording') {
      rec.pause();
      setIsRecordingPaused(true);
      onNotify('Đã tạm dừng ghi hình thực hành.', 'info');
    } else if (rec.state === 'paused') {
      rec.resume();
      setIsRecordingPaused(false);
      onNotify('Tiếp tục ghi hình thực hành.', 'info');
    }
  }, [onNotify]);

  const handleStopVideoRecording = useCallback(() => {
    if (recordingTimerRef.current) {
      window.clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    // Chụp bước tổng kết cuối cùng trước khi dừng nếu thời lượng > 2 giây
    if (recordingElapsedRef.current > 2.0) {
      recordStepMilestoneInternal(
        'Hoàn tất thao tác — Ghi nhận trạng thái & số liệu cuối cùng trên bàn',
        true,
      );
    }

    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== 'inactive') {
      rec.stop();
    }
    if (compositeStreamRef.current) {
      compositeStreamRef.current.getTracks().forEach((t) => t.stop());
      compositeStreamRef.current = null;
    }

    setIsRecordingVideo(false);
    setIsRecordingPaused(false);
    labSoundEngine.play('record-stop', 0.9);
    onNotify(
      'Đã dừng ghi hình! Mở Studio Xem Lại & Xuất Video Tóm Tắt Quá Trình.',
      'success',
    );
  }, [onNotify, recordStepMilestoneInternal]);

  // Tự động phát hiện khi số liệu dụng cụ đo trên bàn thay đổi hoặc học sinh chuyển bước hướng dẫn trong lúc đang ghi hình
  useEffect(() => {
    if (!isRecordingVideo || isRecordingPaused) return;
    const { chips, summaryText } = collectLiveMeasurementChips();
    const nextSignature = `${studentCurrentHint || ''}|${summaryText}|${chips.length}`;
    if (nextSignature === lastAutoSignatureRef.current) return;

    const prevSig = lastAutoSignatureRef.current;
    lastAutoSignatureRef.current = nextSignature;

    const timer = window.setTimeout(() => {
      if (!isRecordingVideo || isRecordingPaused) return;
      const prevParts = prevSig.split('|');
      const hintChanged = prevParts[0] !== (studentCurrentHint || '');
      const activeInst = instancesRef.current.find(
        (i) => i.instanceId === selectedInstanceIdRef.current,
      );
      const activeAsset = activeInst
        ? assetsMapRef.current.get(activeInst.assetId)
        : undefined;

      const autoTitle =
        hintChanged && studentCurrentHint
          ? `Bước hướng dẫn: ${studentCurrentHint}`
          : activeAsset
            ? `Thao tác với ${activeInst?.customLabel || activeAsset.name.vi}`
            : 'Cập nhật phép đo trên bàn thí nghiệm';

      recordStepMilestoneInternal(autoTitle, false);
    }, 380);

    return () => window.clearTimeout(timer);
  }, [
    instances,
    studentCurrentHint,
    isRecordingVideo,
    isRecordingPaused,
    collectLiveMeasurementChips,
    recordStepMilestoneInternal,
  ]);

  // Dọn dẹp bộ hẹn giờ ghi hình khi unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current);
      }
      if (compositeStreamRef.current) {
        compositeStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const appendLabEventLog = useCallback(
    (
      eventType: string,
      summaryVi: string,
      payload?: Record<string, unknown>,
    ) => {
      const nowInfo = formatVietnamDateTime(new Date());
      setEventLogs((prev) => [
        {
          eventId: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          eventType,
          realTimestampUtc: nowInfo.isoUtc,
          localTimestamp: nowInfo.localDateTime,
          simulationElapsedSeconds: clockState.simulationClock.elapsedSeconds,
          summaryVi,
          payload,
        },
        ...prev.slice(0, 49),
      ]);
    },
    [clockState.simulationClock.elapsedSeconds],
  );

  // Dual Clocks Timer: Updates realClock (Vietnam Asia/Ho_Chi_Minh) & simulationClock independently without re-rendering Three.js
  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = new Date();
      const vn = formatVietnamDateTime(now);
      setClockState((prev) => {
        let nextElapsed = prev.simulationClock.elapsedSeconds;
        let nextLastTick = prev.simulationClock.lastTickEpochMs;
        if (prev.simulationClock.status === 'running') {
          const prevTick = prev.simulationClock.lastTickEpochMs ?? now.getTime();
          // Controlled delta-time clamped to 1.0s max per tick so tab sleep doesn't jump hours
          const rawDeltaSec = Math.min(
            1.0,
            Math.max(0, (now.getTime() - prevTick) / 1000),
          );
          nextElapsed =
            prev.simulationClock.elapsedSeconds +
            rawDeltaSec * prev.simulationClock.speedMultiplier;
          nextLastTick = now.getTime();
        }
        return {
          realClock: {
            ...vn,
            timeZone: 'Asia/Ho_Chi_Minh',
          },
          simulationClock: {
            ...prev.simulationClock,
            elapsedSeconds: nextElapsed,
            lastTickEpochMs: nextLastTick,
          },
        };
      });
    }, 250);
    return () => window.clearInterval(timer);
  }, []);

  const handleSimClockAction = useCallback(
    (action: 'start' | 'pause' | 'resume' | 'reset') => {
      setClockState((prev) => {
        const nowMs = Date.now();
        if (action === 'start' || action === 'resume') {
          return {
            ...prev,
            simulationClock: {
              ...prev.simulationClock,
              status: 'running',
              lastTickEpochMs: nowMs,
            },
          };
        }
        if (action === 'pause') {
          return {
            ...prev,
            simulationClock: {
              ...prev.simulationClock,
              status: 'paused',
              lastTickEpochMs: null,
            },
          };
        }
        return {
          ...prev,
          simulationClock: {
            ...prev.simulationClock,
            elapsedSeconds: 0,
            lastTickEpochMs:
              prev.simulationClock.status === 'running' ? nowMs : null,
          },
        };
      });
      appendLabEventLog(
        `SIM_CLOCK_${action.toUpperCase()}`,
        `Đồng hồ mô phỏng: Thực hiện lệnh "${action.toUpperCase()}" (Giờ thực Việt Nam không bị ảnh hưởng).`,
      );
    },
    [appendLabEventLog],
  );

  const handleSimClockSpeed = useCallback(
    (speed: number) => {
      setClockState((prev) => ({
        ...prev,
        simulationClock: {
          ...prev.simulationClock,
          speedMultiplier: speed,
          lastTickEpochMs: Date.now(),
        },
      }));
      appendLabEventLog(
        'SIM_CLOCK_SPEED',
        `Đổi hệ số tốc độ đồng hồ mô phỏng sang ${speed}×.`,
        { speedMultiplier: speed },
      );
    },
    [appendLabEventLog],
  );

  const handleUpdateCoordSettings = useCallback(
    (patch: Partial<CoordinateDisplaySettings>) => {
      setCoordSettings((prev) => {
        const next = { ...prev, ...patch };
        const helper = worldCoordHelperRef.current;
        if (helper) {
          const flGrid = helper.getObjectByName('coord_floor_grid');
          if (flGrid) flGrid.visible = next.showFloorGrid;
          const spGrid = helper.getObjectByName('coord_space_grid');
          if (spGrid) spGrid.visible = next.showSpaceGrid;
          const minGrid = helper.getObjectByName('coord_minor_grid');
          if (minGrid) minGrid.visible = next.showMinorGrid;
          const ax = helper.getObjectByName('coord_world_axes');
          if (ax) ax.visible = next.showWorldAxes;
          const orig = helper.getObjectByName('coord_origin_marker');
          if (orig) orig.visible = next.showOriginMarker;
          const lbl = helper.getObjectByName('coord_axis_labels');
          if (lbl) lbl.visible = next.showAxisLabels;
          const tks = helper.getObjectByName('coord_numeric_ticks');
          if (tks) tks.visible = next.showNumericTicks;
          requestRenderRef.current();
        }
        return next;
      });
    },
    [],
  );

  // Độ sáng môi trường 3D (0% = Tối hẳn để làm nổi bật tia sáng quang học / ngọn lửa / LED, 100% = Sáng chuẩn, 150% = Rất sáng)
  const [ambientBrightnessPct, setAmbientBrightnessPct] = useState<number>(100);

  const handleChangeAmbientBrightness = useCallback((rawPct: number) => {
    const pct = Math.max(0, Math.min(150, Math.round(rawPct)));
    setAmbientBrightnessPct(pct);

    const factor = pct / 100; // 0.0 -> 1.5
    const scene = sceneRef.current;
    const renderer = rendererRef.current;

    if (scene) {
      const hemi = scene.getObjectByName(
        'env_hemi_light',
      ) as THREE.HemisphereLight | null;
      if (hemi) {
        hemi.intensity = Math.max(0.015, 0.95 * factor);
      }

      const keyL = scene.getObjectByName(
        'env_key_light',
      ) as THREE.DirectionalLight | null;
      if (keyL) {
        keyL.intensity = Math.max(0.02, 2.0 * factor);
      }

      const rimL = scene.getObjectByName(
        'env_rim_light',
      ) as THREE.DirectionalLight | null;
      if (rimL) {
        rimL.intensity = Math.max(0.01, 0.78 * factor);
      }

      // Điều chỉnh phản xạ môi trường PBR để khi kéo tối, mặt bàn & tường tối lại tự nhiên, làm nổi bật tia laser & ngọn lửa
      if ('environmentIntensity' in scene) {
        (scene as THREE.Scene & { environmentIntensity: number }).environmentIntensity =
          Math.max(0.02, factor);
      }

      // Nội suy màu nền không gian 3D và sương mù (Fog) theo độ sáng chuẩn #131c2e
      const darkColor = new THREE.Color('#02050B');
      const normalColor = new THREE.Color('#131c2e');
      const brightColor = new THREE.Color('#1e293b');
      const targetBg =
        factor <= 1
          ? darkColor.clone().lerp(normalColor, factor)
          : normalColor.clone().lerp(brightColor, factor - 1);

      scene.background = targetBg;
      if (scene.fog && scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.copy(targetBg);
      }

      // Làm tối kính cửa sổ hậu cảnh khi giảm độ sáng phòng
      const skyGlass = scene.getObjectByName('window_sky_glass') as THREE.Mesh | null;
      if (skyGlass && skyGlass.material instanceof THREE.MeshBasicMaterial) {
        const darkSky = new THREE.Color('#040914');
        const normalSky = new THREE.Color('#365375');
        skyGlass.material.color.copy(
          darkSky.lerp(normalSky, Math.min(1.2, factor)),
        );
      }
    }

    if (renderer) {
      renderer.toneMappingExposure =
        factor <= 1
          ? THREE.MathUtils.lerp(0.26, 1.08, factor)
          : THREE.MathUtils.lerp(1.08, 1.38, factor - 1);
    }

    setGraphicsSettings((prev) => ({
      ...prev,
      ambientLightStrength: Number((0.95 * factor).toFixed(2)),
      keyLightStrength: Number((2.0 * factor).toFixed(2)),
    }));

    requestRenderRef.current();
  }, []);

  const handleUpdateGraphicsSettings = useCallback(
    (patch: Partial<LabGraphicsSettings>) => {
      setGraphicsSettings((prev) => {
        const next = { ...prev, ...patch };
        const scene = sceneRef.current;
        if (scene) {
          const hemi = scene.getObjectByName(
            'env_hemi_light',
          ) as THREE.HemisphereLight | null;
          if (hemi) hemi.intensity = next.ambientLightStrength;
          const keyL = scene.getObjectByName(
            'env_key_light',
          ) as THREE.DirectionalLight | null;
          if (keyL) keyL.intensity = next.keyLightStrength;
          const walls = scene.getObjectByName('room_walls_group');
          if (walls) {
            walls.traverse((obj) => {
              if ((obj as THREE.Mesh).isMesh) {
                const m = (obj as THREE.Mesh)
                  .material as THREE.MeshStandardMaterial;
                m.transparent = next.wallsTransparent;
                m.opacity = next.wallsTransparent ? 0.42 : 1.0;
                m.needsUpdate = true;
              }
            });
          }
          const ceil = scene.getObjectByName('room_ceiling_mesh');
          if (ceil) ceil.visible = next.ceilingVisible;
          requestRenderRef.current();
        }
        return next;
      });
    },
    [],
  );

  const handleUpdateEnvVar = useCallback(
    (id: EnvironmentVariableId, rawVal: number) => {
      const def = envVars[id];
      if (!def) return;
      const clampedVal = Math.max(def.min, Math.min(def.max, rawVal));
      setEnvVars((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          value: clampedVal,
          verificationSource: 'user-adjusted',
        },
      }));

      // Mục 7: Chỉ cập nhật các thiết bị có đăng ký environmentDependencies
      if (id === 'gravityMps2' && onUpdateInstanceState) {
        const dynInst = instances.find(
          (i) =>
            assetsMap.get(i.assetId)?.geometry.proceduralArchetype ===
            'spring-dynamometer',
        );
        if (dynInst) {
          const hookedItems = instances.filter(
            (item) =>
              item.visible &&
              item.instanceState.attachedToInstanceId === dynInst.instanceId &&
              item.instanceState.attachmentSlot === 'dynamometer-hook',
          );
          let totalMassG = 0;
          hookedItems.forEach((h) => {
            totalMassG +=
              assetsMap.get(h.assetId)?.scientificProperties.referenceMass
                ?.value ?? 66.25;
          });
          if (totalMassG > 0) {
            const nextForceN = Number(
              ((totalMassG / 1000) * clampedVal).toFixed(2),
            );
            onUpdateInstanceState(
              dynInst.instanceId,
              { springExtensionN: nextForceN },
              `Biến môi trường gravityMps2 = ${clampedVal} m/s² → Trọng lượng trên Lực kế P = m·g = ${nextForceN} N`,
            );
          }
        }
      } else if (id === 'airTemperatureC' && onUpdateInstanceState) {
        const thermInst = instances.find(
          (i) =>
            assetsMap.get(i.assetId)?.geometry.proceduralArchetype ===
              'thermometer' && !i.instanceState.attachedToInstanceId,
        );
        if (thermInst) {
          onUpdateInstanceState(
            thermInst.instanceId,
            { temperatureC: clampedVal },
            `Biến môi trường airTemperatureC = ${clampedVal} °C → Nhiệt kế ngoài không khí cập nhật ${clampedVal.toFixed(1)} °C`,
          );
        }
      } else if (id === 'oxygenPct' && onUpdateInstanceState) {
        const burnerInst = instances.find(
          (i) =>
            assetsMap.get(i.assetId)?.geometry.proceduralArchetype ===
            'alcohol-burner',
        );
        if (burnerInst && clampedVal < 14 && burnerInst.instanceState.isHeating) {
          onUpdateInstanceState(
            burnerInst.instanceId,
            { isHeating: false },
            `Nồng độ O₂ giảm xuống ${clampedVal}% (< 14%) → Ngọn lửa đèn cồn tự động tắt!`,
          );
        }
      }

      appendLabEventLog(
        'ENV_VAR_CHANGE',
        `Cập nhật biến vật lý ${def.nameVi} (${id}) = ${clampedVal} ${def.unit}.`,
        { variableId: id, value: clampedVal, unit: def.unit },
      );
    },
    [envVars, instances, assetsMap, onUpdateInstanceState, appendLabEventLog],
  );

  const handleResetEnvVars = useCallback(() => {
    setEnvVars(INITIAL_ENVIRONMENT_VARIABLES);
    appendLabEventLog(
      'ENV_VAR_RESET',
      'Khôi phục toàn bộ 13 biến môi trường vật lý về giá trị cấu hình mặc định.',
    );
    onNotify('Đã khôi phục 13 biến môi trường vật lý về mặc định.', 'info');
  }, [appendLabEventLog, onNotify]);

  const [isTopViewActive, setIsTopViewActive] = useState<boolean>(false);
  const [isWaterValveOpenUI, setIsWaterValveOpenUI] = useState<boolean>(false);
  const [valveTargetInstanceId, setValveTargetInstanceId] = useState<string>('');
  const [valveInputMl, setValveInputMl] = useState<string>('25');

  // State cho Chốt bắt dính rót dung dịch & Khung nhập Khối lượng (g) hoặc Thể tích (ml) muốn rót
  const [pourLatchModal, setPourLatchModal] = useState<{
    sourceInstanceId: string;
    targetInstanceId: string;
    sourceTitle: string;
    targetTitle: string;
    sourceArchetype: string;
    targetArchetype: string;
    sourceAssetId: string;
    targetAssetId: string;
    sourceAvailableMl: number;
    sourceCapacityMl: number;
    targetCurrentMl: number;
    targetCapacityMl: number;
    maxTransferMl: number;
    densityGPerMl: number;
  } | null>(null);
  const [pourInputVolumeMl, setPourInputVolumeMl] = useState<string>('20');
  const [pourInputMassG, setPourInputMassG] = useState<string>('20');
  const [pourInputFocusField, setPourInputFocusField] = useState<
    'volume' | 'mass'
  >('volume');
  const pourLatchModalRef = useRef<HTMLDivElement | null>(null);

  const executeConfirmedLatchPour = useCallback(
    (sourceId: string, targetId: string, requestedVolumeMl: number) => {
      const srcInst = instancesRef.current.find((i) => i.instanceId === sourceId);
      const dstInst = instancesRef.current.find((i) => i.instanceId === targetId);
      if (!srcInst || !dstInst) {
        setPourLatchModal(null);
        return;
      }
      const srcAsset = assetsMapRef.current.get(srcInst.assetId);
      const dstAsset = assetsMapRef.current.get(dstInst.assetId);
      const srcArch = srcAsset?.geometry.proceduralArchetype;
      const dstArch = dstAsset?.geometry.proceduralArchetype;
      const srcCap =
        srcArch === 'overflow-can'
          ? 210
          : srcArch === 'water-dispenser'
            ? 1000
            : srcArch === 'reagent-bottle-naoh-400' ||
                srcArch === 'reagent-bottle-agno3-400'
              ? 400
              : srcAsset?.scientificProperties.capacity?.value ?? 100;
      const dstCap =
        dstArch === 'overflow-can'
          ? 210
          : dstAsset?.scientificProperties.capacity?.value ?? 100;
      const srcCurMl =
        srcInst.instanceState.baseLiquidLevelMl ??
        srcInst.instanceState.liquidLevelMl ??
        (srcArch === 'beaker-bomex-100' || srcArch === 'thermal-heating-vessel'
          ? 0
          : srcArch === 'water-dispenser'
            ? 850
            : srcArch === 'reagent-bottle-naoh-400' ||
                srcArch === 'reagent-bottle-agno3-400'
              ? 300
              : srcCap * 0.5);
      const dstCurMl =
        dstInst.instanceState.baseLiquidLevelMl ??
        dstInst.instanceState.liquidLevelMl ??
        (dstArch === 'beaker-bomex-100' || dstArch === 'thermal-heating-vessel'
          ? 0
          : dstCap * 0.5);

      const pourAmt = Number(
        Math.max(
          0,
          Math.min(requestedVolumeMl, srcCurMl, dstCap - dstCurMl),
        ).toFixed(1),
      );
      if (pourAmt <= 0.05) {
        setPourLatchModal(null);
        return;
      }

      const tx = dstInst.transform.positionM[0];
      const tz = dstInst.transform.positionM[2];
      const settleX = THREE.MathUtils.clamp(
        tx - 0.105,
        -BENCH_LIMIT_X,
        BENCH_LIMIT_X,
      );
      const settleZ = THREE.MathUtils.clamp(
        tz + 0.025,
        -BENCH_LIMIT_Z,
        BENCH_LIMIT_Z,
      );
      const kin = computeExactPourPosition(srcAsset, dstAsset, tx, tz);
      activePourAnimRef.current = {
        sourceId,
        targetId,
        startTimeMs: performance.now(),
        durationMs: 1180,
        pourX: kin.pourX,
        pourY: kin.pourY,
        pourZ: kin.pourZ,
        targetX: tx,
        targetRimY: kin.targetRimY,
        targetZ: tz,
        settleX,
        settleZ,
        srcStartScaleY: THREE.MathUtils.clamp(
          srcCurMl / srcCap / 0.5,
          0.08,
          2.0,
        ),
        srcEndScaleY: THREE.MathUtils.clamp(
          (srcCurMl - pourAmt) / srcCap / 0.5,
          0.0,
          2.0,
        ),
        dstStartScaleY: THREE.MathUtils.clamp(
          dstCurMl / dstCap / 0.5,
          0.02,
          2.0,
        ),
        dstEndScaleY: THREE.MathUtils.clamp(
          (dstCurMl + pourAmt) / dstCap / 0.5,
          0.08,
          2.0,
        ),
      };

      if (onRealtimeTiltPourRef.current) {
        onRealtimeTiltPourRef.current(
          sourceId,
          targetId,
          pourAmt,
          55,
          true,
          pourAmt,
        );
      }
      labSoundEngine.play('water-pour', {
        fillRatio: Math.min(1, (dstCurMl + pourAmt) / Math.max(10, dstCap)),
        intensity: 1,
      });
      setPourLatchModal(null);
      requestRenderRef.current();
    },
    [],
  );

  // Mobile & Desktop UX states: Collapsible Floating Tools, Optional Coord HUD, Compass toggle, and 3-State Device Bottom Sheet
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState<boolean>(false);
  const [showMobileGestureGuide, setShowMobileGestureGuide] = useState<boolean>(false);
  const [, setMobileGizmoTick] = useState<number>(0);
  const [showMobileCoordHud, setShowMobileCoordHud] = useState<boolean>(false);
  const [isCompassHudExpanded, setIsCompassHudExpanded] = useState<boolean>(false);
  const [isTopRightToolbarCollapsed, setIsTopRightToolbarCollapsed] =
    useState<boolean>(true);
  const [isRightToolbarCollapsed, setIsRightToolbarCollapsed] =
    useState<boolean>(true);
  const [deviceSheetMode, setDeviceSheetMode] = useState<
    'collapsed' | 'compact' | 'detail'
  >('collapsed');
  const [active360Panel, setActive360Panel] = useState<
    'none' | 'usage-guide' | 'calibration'
  >('none');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [localDetailedGuides, setLocalDetailedGuides] = useState<boolean>(false);
  const isDetailedGuideOn =
    showDetailedGuides !== undefined ? showDetailedGuides : localDetailedGuides;
  const handleToggleDetailedGuides = useCallback(() => {
    if (onToggleDetailedGuides) {
      onToggleDetailedGuides();
    } else {
      setLocalDetailedGuides((v) => !v);
    }
  }, [onToggleDetailedGuides]);
  const deviceSheetModeRef = useRef(deviceSheetMode);
  deviceSheetModeRef.current = deviceSheetMode;

  // Refs cho các Popup / Dropdown để tự động đóng khi click ra ngoài (Click-Outside)
  const waterValvePopupRef = useRef<HTMLDivElement | null>(null);
  const cabinetDrawerRef = useRef<HTMLDivElement | null>(null);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const deviceSheetRef = useRef<HTMLDivElement | null>(null);
  const mobileToolsRef = useRef<HTMLDivElement | null>(null);
  const compassHudRef = useRef<HTMLDivElement | null>(null);
  const toolbar360Ref = useRef<HTMLDivElement | null>(null);
  const panel360Ref = useRef<HTMLDivElement | null>(null);

  // Khi người dùng chọn một thiết bị mới trên bàn 3D bằng chuột đơn, KHÔNG tự mở thanh thông tin dưới đáy (chỉ mở khi nhấp đúp)
  useEffect(() => {
    setConfirmDeleteId(null);
    setViewportContextMenu(null);
    if (selectedInstanceId) {
      const selInst = instances.find((i) => i.instanceId === selectedInstanceId);
      const selArch = selInst
        ? assetsMap.get(selInst.assetId)?.geometry.proceduralArchetype
        : undefined;
      if (selArch === 'water-dispenser') {
        setIsWaterValveOpenUI(true);
      } else {
        setIsWaterValveOpenUI(false);
      }
    } else {
      setIsWaterValveOpenUI(false);
      setDeviceSheetMode('collapsed');
    }
  }, [selectedInstanceId]);

  // Xử lý sự kiện Click Outside & phím Escape để tự động đóng các Popup / Menu đang mở
  useEffect(() => {
    const hasAnyOpenPopup =
      isWaterValveOpenUI ||
      isCabinetDrawerOpen ||
      Boolean(viewportContextMenu) ||
      isMobileToolsOpen ||
      isCompassHudExpanded ||
      active360Panel !== 'none' ||
      deviceSheetMode === 'detail';

    if (!hasAnyOpenPopup) return;

    const handleGlobalPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;

      if (
        viewportContextMenu &&
        contextMenuRef.current &&
        !contextMenuRef.current.contains(target)
      ) {
        setViewportContextMenu(null);
      }

      if (
        isWaterValveOpenUI &&
        waterValvePopupRef.current &&
        !waterValvePopupRef.current.contains(target) &&
        (!deviceSheetRef.current || !deviceSheetRef.current.contains(target))
      ) {
        setIsWaterValveOpenUI(false);
      }

      if (
        isCabinetDrawerOpen &&
        cabinetDrawerRef.current &&
        !cabinetDrawerRef.current.contains(target)
      ) {
        setIsCabinetDrawerOpen(false);
      }

      if (
        isMobileToolsOpen &&
        mobileToolsRef.current &&
        !mobileToolsRef.current.contains(target)
      ) {
        setIsMobileToolsOpen(false);
      }

      if (
        isCompassHudExpanded &&
        compassHudRef.current &&
        !compassHudRef.current.contains(target)
      ) {
        setIsCompassHudExpanded(false);
      }

      if (
        active360Panel !== 'none' &&
        panel360Ref.current &&
        !panel360Ref.current.contains(target) &&
        (!toolbar360Ref.current || !toolbar360Ref.current.contains(target))
      ) {
        setActive360Panel('none');
      }

      if (
        (deviceSheetMode === 'detail' || deviceSheetMode === 'compact') &&
        deviceSheetRef.current &&
        !deviceSheetRef.current.contains(target)
      ) {
        setDeviceSheetMode('collapsed');
      }
    };

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (viewportContextMenu) setViewportContextMenu(null);
      if (isWaterValveOpenUI) setIsWaterValveOpenUI(false);
      if (isCabinetDrawerOpen) setIsCabinetDrawerOpen(false);
      if (isMobileToolsOpen) setIsMobileToolsOpen(false);
      if (isCompassHudExpanded) setIsCompassHudExpanded(false);
      if (active360Panel !== 'none') setActive360Panel('none');
      if (deviceSheetMode !== 'collapsed') setDeviceSheetMode('collapsed');
    };

    document.addEventListener('pointerdown', handleGlobalPointerDown, true);
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleGlobalPointerDown, true);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [
    isWaterValveOpenUI,
    isCabinetDrawerOpen,
    viewportContextMenu,
    isMobileToolsOpen,
    isCompassHudExpanded,
    active360Panel,
    deviceSheetMode,
  ]);

  const updateProjectedOverlays = useCallback(() => {
    // Không cập nhật state React liên tục trong khi đang kéo vật thể để tránh re-render DOM gây chớp màn hình
    if (dragStateRef.current.isDragging) return;

    const camera = cameraRef.current;
    const mount = mountRef.current;
    const orbit = orbitRef.current;
    if (!camera || !mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;
    if (width === 0 || height === 0) return;

    const isMobileViewport = width < 768;

    if (orbit && !isStudentModeRef.current) {
      const dx = camera.position.x - orbit.target.x;
      const dy = camera.position.y - orbit.target.y;
      const dz = camera.position.z - orbit.target.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const az = Math.round(THREE.MathUtils.radToDeg(Math.atan2(dx, dz)));
      const el = Math.round(
        THREE.MathUtils.radToDeg(
          Math.asin(THREE.MathUtils.clamp(dy / Math.max(0.001, dist), -1, 1)),
        ),
      );
      setCameraReadout((prev) =>
        prev.azimuthDeg === az &&
        prev.elevationDeg === el &&
        Math.abs(prev.distanceM - dist) < 0.02
          ? prev
          : {
              azimuthDeg: az,
              elevationDeg: el,
              distanceM: Number(dist.toFixed(2)),
            },
      );
    }

    if (viewModeRef.current === 'single-asset') {
      setProjectedLabels((prev) => (prev.length === 0 ? prev : []));
      return;
    }

    const nextLabels: ProjectedLabel[] = [];
    for (const inst of instancesRef.current) {
      if (!inst.visible || !inst.labelVisible) continue;
      const obj = instanceObjectsRef.current.get(inst.instanceId);
      const asset = assetsMapRef.current.get(inst.assetId);
      if (!obj || !asset) continue;

      const isSelected = inst.instanceId === selectedInstanceIdRef.current;
      // Nếu vật mẫu đang nằm trên đĩa cân hoặc thả chìm trong ống đong/bình tràn và không được chọn trực tiếp,
      // ẩn nhãn tĩnh của vật mẫu để không bao giờ đè che mất màn hình số gam/ml của dụng cụ đo (rê chuột vẫn hiện đầy đủ Tooltip!).
      const isAttachedChild =
        Boolean(inst.instanceState.attachedToInstanceId) &&
        inst.instanceState.attachmentSlot &&
        inst.instanceState.attachmentSlot !== 'bench' &&
        inst.instanceState.attachmentSlot !== 'dispenser-outlet';
      if (isAttachedChild && !isSelected) continue;

      const { readoutBadge, isDigitalScale, interactionHint } =
        computeLiveEquipmentReadout(inst, asset);

      // Trên màn hình điện thoại (< 768px), chỉ hiển thị nhãn của thiết bị đang chọn và dụng cụ đo có số liệu trực tiếp để tránh rối mắt
      if (isMobileViewport && !isSelected && !isDigitalScale) {
        continue;
      }

      const bboxH = asset.geometry.boundingBoxM.height;
      _projVec.set(
        obj.position.x,
        obj.position.y + bboxH + 0.032,
        obj.position.z,
      );
      _projVec.project(camera);

      // Kiểm tra thiết bị nằm trong frustum phía trước camera (-1 <= z <= 1)
      if (_projVec.z < -1 || _projVec.z > 1) continue;
      const sx = ((_projVec.x + 1) / 2) * width;
      const sy = ((-_projVec.y + 1) / 2) * height;

      if (sx < 8 || sx > width - 8 || sy < 8 || sy > height - 8) continue;

      // Khi đang mở bảng Chi tiết thiết bị trên điện thoại, ẩn các nhãn không được chọn ở nửa dưới màn hình
      if (
        isMobileViewport &&
        deviceSheetModeRef.current === 'detail' &&
        !isSelected &&
        sy > height * 0.48
      ) {
        continue;
      }

      nextLabels.push({
        instanceId: inst.instanceId,
        assetId: inst.assetId,
        symbol: getEquipmentSymbol(asset),
        title: inst.customLabel || asset.name.vi,
        readoutBadge,
        isDigitalScale,
        interactionHint,
        archetype: asset.geometry.proceduralArchetype,
        subtitle: `${asset.assetId} · v${inst.assetVersion}`,
        x: Math.round(sx),
        y: Math.round(sy),
        isSelected,
        isLocked: inst.locked,
      });
    }

    // Chống đè nhãn 2D: ưu tiên dụng cụ đang chọn và dụng cụ có màn hình số giữ nguyên toạ độ, đẩy nhẹ nhãn bị trùng
    for (let i = 0; i < nextLabels.length; i++) {
      for (let j = i + 1; j < nextLabels.length; j++) {
        const a = nextLabels[i];
        const b = nextLabels[j];
        if (Math.abs(a.x - b.x) < 118 && Math.abs(a.y - b.y) < 30) {
          if (b.isSelected || (b.isDigitalScale && !a.isDigitalScale)) {
            a.y = Math.max(24, b.y - 32);
          } else {
            b.y = Math.max(24, a.y - 32);
          }
        }
      }
    }

    // Chỉ gọi setProjectedLabels khi vị trí hoặc trạng thái nhãn thực sự thay đổi >= 2px
    setProjectedLabels((prev) => {
      if (prev.length !== nextLabels.length) return nextLabels;
      for (let i = 0; i < prev.length; i++) {
        const a = prev[i];
        const b = nextLabels[i];
        if (
          a.instanceId !== b.instanceId ||
          a.isSelected !== b.isSelected ||
          a.title !== b.title ||
          a.readoutBadge !== b.readoutBadge ||
          Math.abs(a.x - b.x) >= 2 ||
          Math.abs(a.y - b.y) >= 2
        ) {
          return nextLabels;
        }
      }
      return prev;
    });

    // Chiếu tọa độ 2D của nhãn Tủ đựng đồ trên bàn (sát trục X)
    _projVec.set(
      CABINET_POS_X,
      BENCH_SURFACE_Y + CABINET_HEIGHT_M + 0.032,
      CABINET_POS_Z,
    );
    _projVec.project(camera);
    if (_projVec.z >= -1 && _projVec.z <= 1) {
      const cx = Math.round(((_projVec.x + 1) / 2) * width);
      const cy = Math.round(((-_projVec.y + 1) / 2) * height);
      if (cx >= 12 && cx <= width - 12 && cy >= 12 && cy <= height - 12) {
        setCabinetProjectedBadge((prev) =>
          prev && Math.abs(prev.x - cx) < 2 && Math.abs(prev.y - cy) < 2
            ? prev
            : { x: cx, y: cy },
        );
      } else {
        setCabinetProjectedBadge((prev) => (prev === null ? null : null));
      }
    } else {
      setCabinetProjectedBadge((prev) => (prev === null ? null : null));
    }
  }, []);

  // 1. Initialize Three.js WebGLRenderer, Daylight Lab Scene, OrbitControls & Direct Physical Manipulation
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    openLabAssetLoader.setSoftwareGlMode(isSoftwareGl);

    const width = mount.clientWidth || 880;
    const height = mount.clientHeight || 590;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x131c2e);
    scene.fog = new THREE.FogExp2(0x131c2e, 0.075);
    sceneRef.current = scene;

    // Studio PBR Environment reflections via RoomEnvironment + PMREMGenerator
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const isInitialPortraitMobile = width < 768 && width < height;
    const camera = new THREE.PerspectiveCamera(
      isInitialPortraitMobile ? 50 : 42,
      width / height,
      0.02,
      40,
    );
    // Góc nhìn chuẩn bao quát mặt bàn gỗ, tủ kính 2 tầng, kệ gỗ 2 bên & bảng đen (tự điều chỉnh khoảng cách rõ nét cho màn hình dọc điện thoại)
    if (isInitialPortraitMobile) {
      camera.position.set(0.0, BENCH_SURFACE_Y + 0.88, 1.62);
    } else {
      camera.position.set(0.0, BENCH_SURFACE_Y + 0.72, 1.08);
    }
    cameraRef.current = camera;

    // Studio Lighting Rig chuẩn openlan3dmixxx.vercel.app
    const hemiLight = new THREE.HemisphereLight(0xfff8f0, 0x334155, 0.68);
    hemiLight.name = 'env_hemi_light';
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.55);
    keyLight.name = 'env_key_light';
    keyLight.position.set(1.2, BENCH_SURFACE_Y + 2.3, 1.4);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.2;
    keyLight.shadow.camera.far = 7.5;
    const d = 1.95;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.45);
    fillLight.name = 'env_rim_light';
    fillLight.position.set(-1.6, BENCH_SURFACE_Y + 1.3, -1.0);
    scene.add(fillLight);

    // Build Standard Lab Room & Warm Wood Bench (#865432)
    const woodTex = createWoodBenchTexture();
    const benchTopMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.56,
      metalness: 0.05,
    });
    benchTopMat.name = 'bench_top_mat';
    const benchGroup = buildDaylightScienceClassroom(benchTopMat);
    scene.add(benchGroup);
    benchGroupRef.current = benchGroup;

    // Duy nhất 1 Hệ Trục Góc Bàn Cố Định O(0,0,0) (X, Y thuộc cạnh bàn, Z đứng) + Lưới Bàn & Lưới Không Gian
    const worldCoordHelper = buildWorldCoordinatesAndGridHelper(
      DEFAULT_LAB_ROOM_CONFIG,
      DEFAULT_COORDINATE_DISPLAY_SETTINGS,
    );
    scene.add(worldCoordHelper);
    worldCoordHelperRef.current = worldCoordHelper;

    // Selection Highlight Box & Cyan Bench Ring (at y = BENCH_SURFACE_Y + 0.002 m)
    const dummyBox = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1));
    const boxHelper = new THREE.BoxHelper(dummyBox, 0x00bceb);
    boxHelper.visible = false;
    scene.add(boxHelper);
    selectionBoxHelperRef.current = boxHelper;

    const ringGeo = new THREE.RingGeometry(0.048, 0.062, 36);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00bceb,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    const selectionRing = new THREE.Mesh(ringGeo, ringMat);
    selectionRing.position.y = BENCH_SURFACE_Y + 0.002;
    selectionRing.visible = false;
    scene.add(selectionRing);
    selectionRingRef.current = selectionRing;

    // Live 3D Contextual Neural Synapse Beams Group (AR Neural Guide)
    const neuralSynapseBeamGroup = new THREE.Group();
    neuralSynapseBeamGroup.name = 'neural_synapse_beam_group';
    scene.add(neuralSynapseBeamGroup);
    neuralSynapseBeamGroupRef.current = neuralSynapseBeamGroup;

    // Magnetic Snap Target Ring (Glowing Green #22C55E when hovering a valid lab station)
    const snapRingGeo = new THREE.RingGeometry(0.052, 0.072, 36);
    snapRingGeo.rotateX(-Math.PI / 2);
    const snapRingMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
      polygonOffset: true,
      polygonOffsetFactor: -3,
      polygonOffsetUnits: -3,
    });
    const snapTargetRing = new THREE.Mesh(snapRingGeo, snapRingMat);
    snapTargetRing.position.y = BENCH_SURFACE_Y + 0.003;
    snapTargetRing.visible = false;
    scene.add(snapTargetRing);
    snapTargetRingRef.current = snapTargetRing;

    // 3D High-Graphics Flowing Liquid Stream Group (strictly hidden unless actively pouring!)
    const pouringStreamGroup = new THREE.Group();
    pouringStreamGroup.name = 'active_pouring_stream_group';
    pouringStreamGroup.visible = false;

    const pourOuterMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.24,
      roughness: 0.04,
      metalness: 0.05,
      ior: 1.333,
      reflectivity: 0.96,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
    });
    const pourOuterMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0024, 0.0038, 0.14, 18),
      pourOuterMat,
    );
    pourOuterMesh.name = 'pour_outer';
    pourOuterMesh.renderOrder = 6;
    pouringStreamGroup.add(pourOuterMesh);

    const pourCoreMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0012, 0.0018, 0.14, 12),
      new THREE.MeshBasicMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.94,
        depthWrite: false,
      }),
    );
    pourCoreMesh.name = 'pour_core';
    pourCoreMesh.renderOrder = 7;
    pouringStreamGroup.add(pourCoreMesh);

    const pourDropGeo = new THREE.SphereGeometry(0.0026, 12, 12);
    for (let d = 0; d < 6; d++) {
      const drop = new THREE.Mesh(pourDropGeo, pourOuterMat);
      drop.name = `pour_drop_${d}`;
      drop.scale.set(0.85, 1.4, 0.85);
      drop.renderOrder = 7;
      pouringStreamGroup.add(drop);
    }

    for (let r = 0; r < 2; r++) {
      const splash = new THREE.Mesh(
        new THREE.RingGeometry(0.004 + r * 0.005, 0.009 + r * 0.007, 24).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial({
          color: r === 0 ? 0xe0f2fe : 0x7dd3fc,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.88 - r * 0.25,
          depthWrite: false,
        }),
      );
      splash.name = `pour_splash_${r}`;
      splash.renderOrder = 7;
      pouringStreamGroup.add(splash);
    }

    scene.add(pouringStreamGroup);
    pouringStreamRef.current = pouringStreamGroup;

    // Right-Click Dual-Axis 3D Gizmo (Vertical Lift Axis + Horizontal Rotation Ring chuẩn openlan3dmixxx.vercel.app)
    const dualAxisGizmo = new THREE.Group();
    dualAxisGizmo.name = 'right_click_dual_axis_gizmo';
    dualAxisGizmo.visible = false;

    const verticalAxisGroup = new THREE.Group();
    verticalAxisGroup.name = 'gizmo_vertical_axis';
    const vShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0055, 0.0055, 0.25, 16),
      new THREE.MeshBasicMaterial({ color: 0x22c55e, depthTest: false, transparent: true, opacity: 0.95 }),
    );
    vShaft.position.y = 0.145;
    vShaft.renderOrder = 999;
    vShaft.userData = { gizmoPart: 'vertical' };
    verticalAxisGroup.add(vShaft);

    const vCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.017, 0.044, 20),
      new THREE.MeshBasicMaterial({ color: 0x4ade80, depthTest: false, transparent: true, opacity: 0.98 }),
    );
    vCone.position.y = 0.285;
    vCone.renderOrder = 999;
    vCone.userData = { gizmoPart: 'vertical' };
    verticalAxisGroup.add(vCone);

    const vHit = new THREE.Mesh(
      new THREE.CylinderGeometry(0.044, 0.044, 0.33, 12),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.01, depthWrite: false, depthTest: false }),
    );
    vHit.position.y = 0.16;
    vHit.userData = { gizmoPart: 'vertical' };
    verticalAxisGroup.add(vHit);
    dualAxisGizmo.add(verticalAxisGroup);

    const rotateRingGroup = new THREE.Group();
    rotateRingGroup.name = 'gizmo_rotation_ring';
    const rTorus = new THREE.Mesh(
      new THREE.TorusGeometry(0.118, 0.005, 16, 64),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, depthTest: false, transparent: true, opacity: 0.92 }),
    );
    rTorus.rotation.x = Math.PI / 2;
    rTorus.position.y = 0.025;
    rTorus.renderOrder = 998;
    rTorus.userData = { gizmoPart: 'rotate' };
    rotateRingGroup.add(rTorus);

    for (let k = 0; k < 4; k++) {
      const ang = (k * Math.PI) / 2;
      const rKnob = new THREE.Mesh(
        new THREE.SphereGeometry(0.011, 14, 14),
        new THREE.MeshBasicMaterial({ color: 0xfbbf24, depthTest: false }),
      );
      rKnob.position.set(Math.cos(ang) * 0.118, 0.025, Math.sin(ang) * 0.118);
      rKnob.renderOrder = 999;
      rKnob.userData = { gizmoPart: 'rotate' };
      rotateRingGroup.add(rKnob);
    }

    const rHit = new THREE.Mesh(
      new THREE.TorusGeometry(0.118, 0.036, 12, 36),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.01, depthWrite: false, depthTest: false }),
    );
    rHit.rotation.x = Math.PI / 2;
    rHit.position.y = 0.025;
    rHit.userData = { gizmoPart: 'rotate' };
    rotateRingGroup.add(rHit);

    dualAxisGizmo.add(rotateRingGroup);
    scene.add(dualAxisGizmo);
    dualAxisGizmoRef.current = dualAxisGizmo;

    // OrbitControls — Không gian phòng rộng rãi (14.0 × 10.0 × 4.2 m), thu phóng thoải mái hơn
    // Tắt enableZoom mặc định trên OrbitControls để sự kiện lăn chuột (handleCanvasWheel)
    // thực hiện thu phóng chính xác 100% ngay tại điểm dưới con trỏ chuột mà không bị OrbitControls kéo về tâm màn hình.
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.enableZoom = false;
    orbit.enableDamping = !isSoftwareGl;
    orbit.dampingFactor = 0.08;
    orbit.minDistance = 0.08;
    orbit.maxDistance = 8.5;
    orbit.minPolarAngle = 0.05;
    orbit.maxPolarAngle = Math.PI / 2 - 0.02;
    orbit.target.set(0, BENCH_SURFACE_Y + 0.06, -0.08);
    orbit.update();
    orbitRef.current = orbit;

    // Cancel scripted camera preset transition if user manually orbits
    orbit.addEventListener('start', () => {
      cameraGoalPosRef.current = null;
      cameraGoalTargetRef.current = null;
    });

    // TransformControls (Used only when explicitly in 'rotate' mode or Teacher gizmo mode)
    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.setSize(0.65);
    transformControls.showY = false;
    const tcHelper = (transformControls as unknown as { getHelper?: () => THREE.Object3D })
      .getHelper
      ? (transformControls as unknown as { getHelper: () => THREE.Object3D }).getHelper()
      : (transformControls as unknown as THREE.Object3D);
    scene.add(tcHelper);
    transformRef.current = transformControls;

    let activePascalWeightDrag: {
      instanceId: string;
      weightIndex: number;
      sourceZone: 'pool' | 'piston-1' | 'piston-2';
      startN1: number;
      startN2: number;
      previewN1: number;
      previewN2: number;
      hoverZone: 'pool' | 'piston-1' | 'piston-2';
      localPos: [number, number, number];
    } | null = null;
    const _pascalInvMat = new THREE.Matrix4();
    const _pascalLocalRay = new THREE.Ray();
    const _pascalDragPlane = new THREE.Plane();
    const _pascalDragAnchor = new THREE.Vector3(0, 2.8, 1.0);
    const _pascalPlaneNorm = new THREE.Vector3();
    const _pascalLocalHit = new THREE.Vector3();
    const _pascalSegA = new THREE.Vector3();
    const _pascalSegB = new THREE.Vector3();

    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let lastTime = performance.now();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      if (gl.flush) gl.flush();
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const poll = () => {
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function requestRender() {
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame((now) => {
        renderDirty = false;
        const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
        lastTime = now;

        let needsMoreFrames = false;

        // A. Smooth Camera Preset Interpolation
        if (cameraGoalPosRef.current && cameraGoalTargetRef.current) {
          camera.position.x = THREE.MathUtils.damp(
            camera.position.x,
            cameraGoalPosRef.current.x,
            10,
            dt,
          );
          camera.position.y = THREE.MathUtils.damp(
            camera.position.y,
            cameraGoalPosRef.current.y,
            10,
            dt,
          );
          camera.position.z = THREE.MathUtils.damp(
            camera.position.z,
            cameraGoalPosRef.current.z,
            10,
            dt,
          );
          orbit.target.x = THREE.MathUtils.damp(
            orbit.target.x,
            cameraGoalTargetRef.current.x,
            10,
            dt,
          );
          orbit.target.y = THREE.MathUtils.damp(
            orbit.target.y,
            cameraGoalTargetRef.current.y,
            10,
            dt,
          );
          orbit.target.z = THREE.MathUtils.damp(
            orbit.target.z,
            cameraGoalTargetRef.current.z,
            10,
            dt,
          );

          if (
            camera.position.distanceTo(cameraGoalPosRef.current) < 0.003 &&
            orbit.target.distanceTo(cameraGoalTargetRef.current) < 0.003
          ) {
            cameraGoalPosRef.current = null;
            cameraGoalTargetRef.current = null;
          } else {
            needsMoreFrames = true;
          }
        }

        // B. Smooth Direct Object Dragging & Momentum Tilt Kinematics
        const ds = dragStateRef.current;
        if (ds.isDragging && ds.instanceId) {
          const draggedObj = instanceObjectsRef.current.get(ds.instanceId);
          if (draggedObj) {
            const nextX = THREE.MathUtils.damp(
              draggedObj.position.x,
              ds.targetPos.x,
              22,
              dt,
            );
            const nextY = THREE.MathUtils.damp(
              draggedObj.position.y,
              ds.targetPos.y,
              18,
              dt,
            );
            const nextZ = THREE.MathUtils.damp(
              draggedObj.position.z,
              ds.targetPos.z,
              22,
              dt,
            );

            const vx = (nextX - draggedObj.position.x) / dt;
            const vz = (nextZ - draggedObj.position.z) / dt;
            draggedObj.position.set(nextX, nextY, nextZ);

            // Theo dõi thời gian giữ bình trên miệng bình nhận (dwell) hoặc lăn chuột nghiêng tay (`ds.manualTiltRad`)
            if (ds.hoverSlot === 'pour-liquid') {
              ds.hoverPourDwellSec = Math.min(2.5, ds.hoverPourDwellSec + dt);
            } else {
              ds.hoverPourDwellSec = Math.max(0, ds.hoverPourDwellSec - dt * 3);
            }

            // Khi kéo giữ trên miệng bình khác > 0.25s hoặc người dùng chủ động lăn chuột nghiêng bình:
            // Góc nghiêng tự động vượt ngưỡng 45° (lên ~56° = -0.98 rad) để kích hoạt trạng thái "Đang rót" thời gian thực!
            const draggedInstRender = instancesRef.current.find(
              (i) => i.instanceId === ds.instanceId,
            );
            const draggedArchRender = draggedInstRender
              ? assetsMapRef.current.get(draggedInstRender.assetId)?.geometry
                  .proceduralArchetype
              : undefined;
            // Khi bắt dính vào chốt rót chất lỏng ('pour-liquid'), nghiêng nhẹ 20° (-0.35 rad < 45°)
            // để báo hiệu đã khớp chốt bắt dính mà không tự ý đổ nước trước khi người dùng nhả chuột và nhập số ml/g!
            const autoHoverTiltZ =
              ds.hoverSlot === 'pour-liquid'
                ? -0.35
                : ds.hoverSlot === 'inside-vessel' &&
                    draggedArchRender === 'ice-cubes-tray'
                  ? -0.56
                  : THREE.MathUtils.clamp(-vx * 0.14, -0.16, 0.16);
            const targetTiltZ =
              Math.abs(ds.manualTiltRad) > 0.04
                ? ds.manualTiltRad
                : autoHoverTiltZ;
            const targetTiltX =
              ds.hoverSlot === 'pour-liquid'
                ? 0
                : THREE.MathUtils.clamp(vz * 0.14, -0.16, 0.16);
            draggedObj.rotation.z = THREE.MathUtils.damp(
              draggedObj.rotation.z,
              targetTiltZ,
              14,
              dt,
            );
            draggedObj.rotation.x = THREE.MathUtils.damp(
              draggedObj.rotation.x,
              targetTiltX,
              14,
              dt,
            );

            // Counter-tilt internal liquid surface so liquid stays horizontal inside tilted vessel
            const liqSurf = draggedObj.getObjectByName('liquid_surface');
            if (liqSurf) {
              liqSurf.rotation.z = -draggedObj.rotation.z * 0.78;
            }

            if (selectionRingRef.current) {
              selectionRingRef.current.position.set(
                nextX,
                BENCH_SURFACE_Y + 0.002,
                nextZ,
              );
            }

            if (
              draggedObj.position.distanceTo(ds.targetPos) > 0.001 ||
              Math.abs(draggedObj.rotation.z - targetTiltZ) > 0.004 ||
              ds.hoverSlot === 'pour-liquid'
            ) {
              needsMoreFrames = true;
            }
          }
        } else {
          // Check if an animated pouring sequence is active (from drag release or quick pour button)
          const pourAnim = activePourAnimRef.current;
          if (pourAnim) {
            const elapsed = performance.now() - pourAnim.startTimeMs;
            const progress = Math.min(1, elapsed / pourAnim.durationMs);
            const srcObj = instanceObjectsRef.current.get(pourAnim.sourceId);
            const dstObj = instanceObjectsRef.current.get(pourAnim.targetId);

            if (srcObj && progress < 1) {
              // Phase 1 (0..0.20): Lift & tilt to pour angle; Phase 2 (0.20..0.82): Hold tilt & stream water down; Phase 3 (0.82..1.0): Return upright
              const tiltEnvelope =
                progress < 0.2
                  ? progress / 0.2
                  : progress < 0.82
                    ? 1
                    : 1 - (progress - 0.82) / 0.18;
              const goalX =
                progress < 0.82
                  ? pourAnim.pourX
                  : THREE.MathUtils.lerp(pourAnim.pourX, pourAnim.settleX, (progress - 0.82) / 0.18);
              const goalY =
                BENCH_SURFACE_Y +
                (progress < 0.82
                  ? pourAnim.pourY
                  : THREE.MathUtils.lerp(pourAnim.pourY, 0, (progress - 0.82) / 0.18));
              const goalZ =
                progress < 0.82
                  ? pourAnim.pourZ
                  : THREE.MathUtils.lerp(pourAnim.pourZ, pourAnim.settleZ, (progress - 0.82) / 0.18);

              srcObj.position.x = THREE.MathUtils.damp(srcObj.position.x, goalX, 22, dt);
              srcObj.position.y = THREE.MathUtils.damp(srcObj.position.y, goalY, 22, dt);
              srcObj.position.z = THREE.MathUtils.damp(srcObj.position.z, goalZ, 22, dt);
              srcObj.rotation.y = THREE.MathUtils.damp(srcObj.rotation.y, 0, 18, dt);
              srcObj.rotation.z = THREE.MathUtils.damp(
                srcObj.rotation.z,
                -0.95 * tiltEnvelope,
                18,
                dt,
              );

              // Smoothly drain source liquid_surface and fill target liquid_surface during the stream phase
              const pourFlowFrac = THREE.MathUtils.clamp((progress - 0.16) / 0.66, 0, 1);
              const srcBottleCyl = srcObj.getObjectByName('bottle_liquid_cylinder');
              const srcCapHandle = srcObj.getObjectByName('handle');
              if (srcBottleCyl && srcCapHandle) {
                srcCapHandle.position.y = 5.66 + 1.15 * tiltEnvelope;
              }
              const srcLiqSurf = srcObj.getObjectByName('liquid_surface');
              if (srcLiqSurf && !srcBottleCyl) {
                srcLiqSurf.rotation.z = -srcObj.rotation.z * 0.76;
                const curSrcScaleY = THREE.MathUtils.lerp(
                  pourAnim.srcStartScaleY,
                  pourAnim.srcEndScaleY,
                  pourFlowFrac,
                );
                if (curSrcScaleY <= 0.02) {
                  srcLiqSurf.visible = false;
                } else {
                  srcLiqSurf.visible = true;
                  srcLiqSurf.scale.set(1, curSrcScaleY, 1);
                }
              }

              let dstSurfaceWorldY =
                BENCH_SURFACE_Y + Math.max(0.028, pourAnim.targetRimY * 0.45);
              if (dstObj) {
                const dstLiqSurf = dstObj.getObjectByName('liquid_surface');
                if (dstLiqSurf) {
                  dstLiqSurf.visible = true;
                  const curDstScaleY = THREE.MathUtils.lerp(
                    pourAnim.dstStartScaleY,
                    pourAnim.dstEndScaleY,
                    pourFlowFrac,
                  );
                  dstLiqSurf.scale.set(1, curDstScaleY, 1);
                  const meniscusWall = dstLiqSurf.getObjectByName('meniscus_wall');
                  if (meniscusWall) {
                    meniscusWall.scale.set(1, 1 / Math.max(0.18, curDstScaleY), 1);
                  }
                  dstObj.updateMatrixWorld(true);
                  const surfCap = dstLiqSurf.getObjectByName('surface_cap');
                  if (surfCap) {
                    surfCap.getWorldPosition(_surfaceWorldPos);
                    dstSurfaceWorldY = _surfaceWorldPos.y;
                  }
                }
              }

              if (pouringStreamRef.current) {
                if (progress >= 0.16 && progress <= 0.84) {
                  srcObj.updateMatrixWorld(true);
                  const lipNode =
                    srcObj.getObjectByName('pouring_lip') ??
                    srcObj.getObjectByName('measurement_anchor');
                  if (lipNode) {
                    lipNode.getWorldPosition(_lipWorldPos);
                  } else {
                    _lipWorldPos.set(
                      srcObj.position.x + 0.044,
                      srcObj.position.y - 0.008,
                      srcObj.position.z,
                    );
                  }

                  const spoutX = _lipWorldPos.x;
                  const spoutY = _lipWorldPos.y;
                  const spoutZ = _lipWorldPos.z;
                  const len = Math.max(0.045, spoutY - dstSurfaceWorldY);
                  const midX = (spoutX + pourAnim.targetX) * 0.5;
                  const midY = dstSurfaceWorldY + len * 0.5;
                  const midZ = (spoutZ + pourAnim.targetZ) * 0.5;
                  const dx = pourAnim.targetX - spoutX;
                  const tiltAng = Math.atan2(dx, len);

                  const streamGrp = pouringStreamRef.current;
                  streamGrp.visible = true;
                  streamGrp.position.set(0, 0, 0);

                  const pulse = 0.88 + 0.18 * Math.sin(now * 0.032);
                  const outerM = streamGrp.getObjectByName('pour_outer');
                  const coreM = streamGrp.getObjectByName('pour_core');
                  if (outerM) {
                    outerM.position.set(midX, midY, midZ);
                    outerM.rotation.z = -tiltAng;
                    outerM.scale.set(pulse, len / 0.14, pulse);
                  }
                  if (coreM) {
                    coreM.position.set(midX, midY, midZ);
                    coreM.rotation.z = -tiltAng;
                    coreM.scale.set(pulse * 0.9, len / 0.14, pulse * 0.9);
                  }

                  for (let d = 0; d < 6; d++) {
                    const drop = streamGrp.getObjectByName(`pour_drop_${d}`);
                    if (drop) {
                      const tDrop = ((now * 0.0042 + d / 6) % 1);
                      drop.position.set(
                        THREE.MathUtils.lerp(spoutX, pourAnim.targetX, tDrop),
                        spoutY - tDrop * tDrop * len,
                        THREE.MathUtils.lerp(spoutZ, pourAnim.targetZ, tDrop),
                      );
                    }
                  }

                  for (let r = 0; r < 2; r++) {
                    const splash = streamGrp.getObjectByName(`pour_splash_${r}`) as THREE.Mesh | undefined;
                    if (splash) {
                      const rPhase = ((now * 0.0035 + r * 0.5) % 1);
                      const sScale = 0.65 + rPhase * 1.15;
                      splash.position.set(
                        pourAnim.targetX,
                        dstSurfaceWorldY + 0.0015 + r * 0.001,
                        pourAnim.targetZ,
                      );
                      splash.scale.set(sScale, sScale, 1);
                      if (splash.material instanceof THREE.MeshBasicMaterial) {
                        splash.material.opacity = (1 - rPhase) * 0.88;
                      }
                    }
                  }
                } else {
                  pouringStreamRef.current.visible = false;
                }
              }
              needsMoreFrames = true;
            } else {
              if (srcObj) {
                srcObj.rotation.z = 0;
                const liqSurf = srcObj.getObjectByName('liquid_surface');
                if (liqSurf) liqSurf.rotation.z = 0;
              }
              if (pouringStreamRef.current) {
                pouringStreamRef.current.visible = false;
              }
              const finishedPour = activePourAnimRef.current;
              activePourAnimRef.current = null;
              if (finishedPour) {
                for (const id of [finishedPour.sourceId, finishedPour.targetId]) {
                  const inst = instancesRef.current.find((i) => i.instanceId === id);
                  const obj = instanceObjectsRef.current.get(id);
                  const asset = inst ? assetsMapRef.current.get(inst.assetId) : undefined;
                  if (inst && obj && asset) {
                    applyInstanceStateToObject3D(obj, inst, asset);
                  }
                }
              }
              needsMoreFrames = true;
            }
          }

          // B2. Smooth Water Dispenser Valve Filling Animation (`activeDispenseAnimRef`)
          const dispAnim = activeDispenseAnimRef.current;
          if (dispAnim) {
            const elapsed = performance.now() - dispAnim.startTimeMs;
            const progress = Math.min(1, elapsed / dispAnim.durationMs);
            const dispObj = instanceObjectsRef.current.get(dispAnim.dispenserId);
            const dstObj = instanceObjectsRef.current.get(dispAnim.targetId);
            if (progress < 1) {
              const flowFrac = THREE.MathUtils.smoothstep(progress, 0.05, 0.92);
              if (dstObj) {
                const dstLiq = dstObj.getObjectByName('liquid_surface');
                if (dstLiq) {
                  dstLiq.visible = true;
                  const curScaleY = THREE.MathUtils.lerp(
                    dispAnim.dstStartScaleY,
                    dispAnim.dstEndScaleY,
                    flowFrac,
                  );
                  dstLiq.scale.set(1, curScaleY, 1);
                  const meniscusWall = dstLiq.getObjectByName('meniscus_wall');
                  if (meniscusWall) {
                    meniscusWall.scale.set(1, 1 / Math.max(0.18, curScaleY), 1);
                  }
                }
              }
              if (dispObj) {
                const dispLiq = dispObj.getObjectByName('liquid_surface');
                if (dispLiq) {
                  const curDispY = THREE.MathUtils.lerp(
                    dispAnim.dispStartScaleY,
                    dispAnim.dispEndScaleY,
                    flowFrac,
                  );
                  dispLiq.scale.set(1, curDispY, 1);
                }
              }
              needsMoreFrames = true;
            } else {
              const finishedDisp = activeDispenseAnimRef.current;
              activeDispenseAnimRef.current = null;
              if (finishedDisp) {
                for (const id of [finishedDisp.dispenserId, finishedDisp.targetId]) {
                  const inst = instancesRef.current.find((i) => i.instanceId === id);
                  const obj = instanceObjectsRef.current.get(id);
                  const asset = inst ? assetsMapRef.current.get(inst.assetId) : undefined;
                  if (inst && obj && asset) {
                    applyInstanceStateToObject3D(obj, inst, asset);
                  }
                }
              }
              needsMoreFrames = true;
            }
          }

          // C. Animate Active Spout Streams (Overflow Can, Water Dispenser, Separatory Funnel) at 60fps ONLY when isValveOpen === true
          for (const inst of instancesRef.current) {
            if (!inst.visible || !inst.instanceState.isValveOpen) continue;
            const obj = instanceObjectsRef.current.get(inst.instanceId);
            if (!obj) continue;
            const spoutStream = obj.getObjectByName('spout_stream');
            if (spoutStream && spoutStream.visible) {
              needsMoreFrames = true;
              const pulse = 0.9 + 0.16 * Math.sin(now * 0.028);
              const outer = spoutStream.getObjectByName('stream_outer');
              const core = spoutStream.getObjectByName('stream_core');
              const arch = assetsMapRef.current.get(inst.assetId)?.geometry.proceduralArchetype;

              let dynamicSplashLocalY = 0.038;
              let dynamicStreamLen = 0.212;
              if (arch === 'water-dispenser') {
                // Find any receiving vessel positioned under the dispenser nozzle and match its exact rising water surface!
                const rotY = inst.transform.rotationRad[1] ?? 0;
                const spoutWorldX = inst.transform.positionM[0] + Math.cos(rotY) * 0.095;
                const spoutWorldZ = inst.transform.positionM[2] - Math.sin(rotY) * 0.095;
                const dockedVessel = instancesRef.current.find(
                  (v) =>
                    v.visible &&
                    v.instanceId !== inst.instanceId &&
                    Math.hypot(
                      v.transform.positionM[0] - spoutWorldX,
                      v.transform.positionM[2] - spoutWorldZ,
                    ) < 0.065,
                );
                if (dockedVessel) {
                  const vObj = instanceObjectsRef.current.get(dockedVessel.instanceId);
                  const vSurfCap = vObj
                    ?.getObjectByName('liquid_surface')
                    ?.getObjectByName('surface_cap');
                  if (vObj && vSurfCap) {
                    vObj.updateMatrixWorld(true);
                    vSurfCap.getWorldPosition(_surfaceWorldPos);
                    dynamicSplashLocalY = Math.max(
                      0.018,
                      Math.min(0.235, _surfaceWorldPos.y - BENCH_SURFACE_Y),
                    );
                    dynamicStreamLen = Math.max(0.025, 0.250 - dynamicSplashLocalY);
                  }
                }
                if (outer) {
                  outer.position.set(
                    0.095,
                    0.250 - dynamicStreamLen * 0.5,
                    0,
                  );
                  outer.scale.set(pulse, dynamicStreamLen / 0.212, pulse);
                }
                if (core) {
                  core.position.set(
                    0.095,
                    0.250 - dynamicStreamLen * 0.5,
                    0,
                  );
                  core.scale.set(pulse * 0.9, dynamicStreamLen / 0.212, pulse * 0.9);
                }
              } else if (outer) {
                outer.scale.set(1, 1, pulse);
              }

              for (let d = 0; d < 6; d++) {
                const drop = spoutStream.getObjectByName(`droplet_${d}`);
                if (!drop) continue;
                const t = ((now * 0.0040 + d / 6) % 1);
                if (arch === 'overflow-can') {
                  // Parabolic trajectory from spout tip (0.085, 0.125, 0) to catch beaker (0.122, 0.024, 0)
                  drop.position.set(
                    0.085 + t * 0.037,
                    0.125 - t * t * 0.101,
                    0,
                  );
                } else if (arch === 'water-dispenser') {
                  drop.position.set(0.095, 0.248 - t * dynamicStreamLen, 0);
                } else if (arch === 'separatory-funnel') {
                  drop.position.set(0, 0.086 - t * 0.066, 0);
                }
              }
              for (let r = 0; r < 2; r++) {
                const splash = spoutStream.getObjectByName(`splash_ring_${r}`) as THREE.Mesh | undefined;
                if (splash) {
                  const rPhase = ((now * 0.0036 + r * 0.5) % 1);
                  const sScale = 0.65 + rPhase * 1.15;
                  if (arch === 'water-dispenser') {
                    splash.position.set(0.095, dynamicSplashLocalY + 0.001 + r * 0.001, 0);
                  }
                  splash.scale.set(sScale, sScale, 1);
                  if (splash.material instanceof THREE.MeshBasicMaterial) {
                    splash.material.opacity = (1 - rPhase) * 0.88;
                  }
                }
              }
            }
          }

          // C1B. Gravity Free-Fall & Bounce Physics when an elevated item is released from the Dual-Axis Gizmo
          gravityPhysicsRef.current.forEach((phys, instId) => {
            if (!phys.falling) return;
            const obj = instanceObjectsRef.current.get(instId);
            if (!obj) {
              phys.falling = false;
              return;
            }
            const restWorldY = BENCH_SURFACE_Y + phys.restingY;
            phys.vy -= 9.8 * dt;
            obj.position.y += phys.vy * dt;
            if (obj.position.y <= restWorldY) {
              obj.position.y = restWorldY;
              if (Math.abs(phys.vy) > 0.45) {
                phys.vy = -phys.vy * 0.24;
                labSoundEngine.play('wood-place', Math.min(0.95, Math.abs(phys.vy) * 0.35));
              } else {
                phys.vy = 0;
                phys.falling = false;
                labSoundEngine.play('wood-place', 0.65);
                const inst = instancesRef.current.find((i) => i.instanceId === instId);
                if (inst) {
                  onUpdateTransformRef.current(
                    instId,
                    [
                      Number(obj.position.x.toFixed(3)),
                      Number(phys.restingY.toFixed(3)),
                      Number(obj.position.z.toFixed(3)),
                    ],
                    [
                      inst.transform.rotationRad[0],
                      Number(obj.rotation.y.toFixed(3)),
                      inst.transform.rotationRad[2],
                    ],
                  );
                }
              }
            }
            if (dualAxisGizmoRef.current && dualAxisGizmoIdRef.current === instId) {
              dualAxisGizmoRef.current.position.copy(obj.position);
            }
            needsMoreFrames = true;
          });

          if (dualAxisGizmoRef.current) {
            const gId = dualAxisGizmoIdRef.current;
            const gObj = gId ? instanceObjectsRef.current.get(gId) : null;
            if (gObj && gObj.visible && viewModeRef.current === 'lab-scene') {
              dualAxisGizmoRef.current.visible = true;
              dualAxisGizmoRef.current.position.copy(gObj.position);
            } else {
              dualAxisGizmoRef.current.visible = false;
            }
          }

          // Smoothly settle any non-dragged objects toward their World Space transform (worldY = BENCH_SURFACE_Y + localY)
          const activeTransformObj = transformControls.dragging
            ? transformControls.object
            : null;
          for (const inst of instancesRef.current) {
            if (activePourAnimRef.current?.sourceId === inst.instanceId) continue;
            const obj = instanceObjectsRef.current.get(inst.instanceId);
            if (!obj || !inst.visible) continue;
            if (activeTransformObj === obj) continue;
            const phys = gravityPhysicsRef.current.get(inst.instanceId);
            if (phys?.falling) continue;
            const isGizmoActiveOnThis = dualAxisGizmoIdRef.current === inst.instanceId;
            const tx = inst.transform.positionM[0];
            const ty = isGizmoActiveOnThis
              ? obj.position.y
              : BENCH_SURFACE_Y + inst.transform.positionM[1];
            const tz = inst.transform.positionM[2];
            const distSq =
              (obj.position.x - tx) ** 2 +
              (obj.position.y - ty) ** 2 +
              (obj.position.z - tz) ** 2 +
              (obj.rotation.x - inst.transform.rotationRad[0]) ** 2 +
              (obj.rotation.z - inst.transform.rotationRad[2]) ** 2;
            if (distSq > 0.000004) {
              obj.position.x = THREE.MathUtils.damp(obj.position.x, tx, 14, dt);
              if (!isGizmoActiveOnThis) {
                obj.position.y = THREE.MathUtils.damp(obj.position.y, ty, 14, dt);
              }
              obj.position.z = THREE.MathUtils.damp(obj.position.z, tz, 14, dt);
              obj.rotation.x = THREE.MathUtils.damp(
                obj.rotation.x,
                inst.transform.rotationRad[0],
                14,
                dt,
              );
              obj.rotation.z = THREE.MathUtils.damp(
                obj.rotation.z,
                inst.transform.rotationRad[2],
                14,
                dt,
              );
              const liqSurf = obj.getObjectByName('liquid_surface');
              if (liqSurf) {
                liqSurf.rotation.z = -obj.rotation.z * 0.78;
              }
              if (
                inst.instanceId === selectedInstanceIdRef.current &&
                selectionRingRef.current
              ) {
                selectionRingRef.current.position.set(
                  obj.position.x,
                  BENCH_SURFACE_Y + 0.002,
                  obj.position.z,
                );
              }
              needsMoreFrames = true;
            }
          }

          // Smooth hydrostatic water-level & weight animation for Pascal Communicating Vessels (`pascal-hydraulic-press`)
          for (const inst of instancesRef.current) {
            if (!inst.visible) continue;
            const asset = assetsMapRef.current.get(inst.assetId);
            if (asset?.geometry.proceduralArchetype !== 'pascal-hydraulic-press') {
              continue;
            }
            const obj = instanceObjectsRef.current.get(inst.instanceId);
            if (!obj) continue;

            let dragPreview: PascalActiveWeightDragPreview | null = null;
            if (
              activePascalWeightDrag &&
              activePascalWeightDrag.instanceId === inst.instanceId
            ) {
              dragPreview = {
                weightIndex:
                  activePascalWeightDrag.hoverZone === 'pool'
                    ? activePascalWeightDrag.weightIndex
                    : -1,
                localPos: activePascalWeightDrag.localPos,
                previewN1: activePascalWeightDrag.previewN1,
                previewN2: activePascalWeightDrag.previewN2,
              };
            } else if (
              ds.isDragging &&
              ds.hoverTargetInstanceId === inst.instanceId &&
              (ds.hoverSlot === 'pascal-piston-1' || ds.hoverSlot === 'pascal-piston-2')
            ) {
              const curN1 = inst.instanceState.weightsPiston1 ?? 0;
              const curN2 = inst.instanceState.weightsPiston2 ?? 0;
              if (curN1 + curN2 < 8) {
                dragPreview = {
                  weightIndex: -1,
                  localPos: [0, 0, 0],
                  previewN1: ds.hoverSlot === 'pascal-piston-1' ? curN1 + 1 : curN1,
                  previewN2: ds.hoverSlot === 'pascal-piston-2' ? curN2 + 1 : curN2,
                };
              }
            }

            if (stepPascalHydraulicPressAnimation(obj, inst, dt, dragPreview)) {
              needsMoreFrames = true;
            }
          }

          // Smooth 60FPS animation for Chemical Reagent Bottles (NaOH 0.1M, AgNO3 0.1M) & Copper Wire Ring (Cu 3g)
          const nowChemSec = performance.now() * 0.001;
          for (const inst of instancesRef.current) {
            if (!inst.visible) continue;
            if (activePourAnimRef.current?.sourceId === inst.instanceId) continue;
            const asset = assetsMapRef.current.get(inst.assetId);
            const arch = asset?.geometry.proceduralArchetype;
            if (
              arch !== 'reagent-bottle-naoh-400' &&
              arch !== 'copper-wire-ring-3g' &&
              arch !== 'reagent-bottle-agno3-400'
            ) {
              continue;
            }
            const obj = instanceObjectsRef.current.get(inst.instanceId);
            if (!obj) continue;
            if (stepChemicalEquipmentAnimation(obj, inst, arch, dt, nowChemSec)) {
              needsMoreFrames = true;
            }
          }

          // Smooth 60FPS kinematics for Lọc Màu & Tán Sắc Ánh Sáng (`color-filter-dispersion`)
          for (const inst of instancesRef.current) {
            if (!inst.visible) continue;
            const asset = assetsMapRef.current.get(inst.assetId);
            if (asset?.geometry.proceduralArchetype !== 'color-filter-dispersion') {
              continue;
            }
            const obj = instanceObjectsRef.current.get(inst.instanceId);
            if (!obj) continue;
            if (stepColorFilterDispersionAnimation(obj, inst, dt, nowChemSec)) {
              needsMoreFrames = true;
            }
          }

          // Smooth 60FPS kinematics for Thành Phần Thể Tích Oxygen Trong Không Khí (`oxygen-air-volume`)
          for (const inst of instancesRef.current) {
            if (!inst.visible) continue;
            const asset = assetsMapRef.current.get(inst.assetId);
            if (asset?.geometry.proceduralArchetype !== 'oxygen-air-volume') {
              continue;
            }
            const obj = instanceObjectsRef.current.get(inst.instanceId);
            if (!obj) continue;
            if (stepOxygenAirVolumeAnimation(obj, inst, dt, nowChemSec)) {
              needsMoreFrames = true;
            }
          }
        }

        // C2. REAL-TIME TILT-BASED POURING SIMULATION (Rót chất lỏng theo góc nghiêng >= 45°)
        // Hoạt động liên tục ở 60 FPS khi người dùng nghiêng bình bằng:
        // 1) Thanh trượt Góc nghiêng / Nút nghiêng rót, 2) Kéo giữ / Lăn chuột trên tay, hoặc 3) Vòng xoay 3D (Rotate Gizmo)
        if (!activePourAnimRef.current) {
          const tp = tiltPourStateRef.current;
          let foundPouringSource: {
            inst: SceneInstance;
            asset: AssetDefinition;
            obj: THREE.Group;
            tiltRad: number;
            tiltDeg: number;
            curMl: number;
            capMl: number;
          } | null = null;

          for (const inst of instancesRef.current) {
            if (!inst.visible) continue;
            const asset = assetsMapRef.current.get(inst.assetId);
            if (!asset) continue;
            const arch = asset.geometry.proceduralArchetype;
            const customMod = htmlEquipmentModuleRegistry.getModule(asset.assetId);
            const isPourableVessel =
              arch === 'beaker-250' ||
              arch === 'graduated-cylinder' ||
              arch === 'erlenmeyer-flask' ||
              arch === 'overflow-can' ||
              arch === 'porcelain-dish' ||
              Boolean(customMod?.moduleControls.canHoldLiquid);
            if (!isPourableVessel) continue;

            const obj = instanceObjectsRef.current.get(inst.instanceId);
            if (!obj) continue;

            // Tính góc nghiêng thực tế quanh trục xoay ngang (X, Z)
            const tiltRad = Math.hypot(obj.rotation.x, obj.rotation.z);
            const tiltDeg = (tiltRad * 180) / Math.PI;
            if (tiltRad < TILT_POUR_THRESHOLD_RAD) continue;

            const capMl =
              arch === 'overflow-can'
                ? 210
                : asset.scientificProperties.capacity?.value ?? 100;
            const fallbackMl =
              inst.instanceState.baseLiquidLevelMl ??
              inst.instanceState.liquidLevelMl ??
              capMl * 0.5;
            const liveMl = tp.liveVolumesMl.get(inst.instanceId) ?? fallbackMl;

            if (liveMl > 0.2) {
              foundPouringSource = {
                inst,
                asset,
                obj,
                tiltRad,
                tiltDeg,
                curMl: liveMl,
                capMl,
              };
              break;
            } else {
              // Bình đã cạn nước: ẩn mặt nước bên trong
              const emptySurf = obj.getObjectByName('liquid_surface');
              if (emptySurf) emptySurf.visible = false;
            }
          }

          if (foundPouringSource) {
            const { inst: srcInst, asset: srcAsset, obj: srcObj, tiltDeg, curMl: srcCurMl, capMl: srcCapMl } =
              foundPouringSource;
            srcObj.updateMatrixWorld(true);

            // Xác định vị trí thế giới của miệng bình (`pouring_lip`)
            const lipNode =
              srcObj.getObjectByName('pouring_lip') ??
              srcObj.getObjectByName('measurement_anchor');
            if (lipNode) {
              lipNode.getWorldPosition(_lipWorldPos);
            } else {
              _lipWorldPos.set(
                srcObj.position.x + Math.sin(-srcObj.rotation.z) * 0.08,
                srcObj.position.y + Math.cos(srcObj.rotation.z) * 0.05,
                srcObj.position.z,
              );
            }

            const spoutX = _lipWorldPos.x;
            const spoutY = Math.max(BENCH_SURFACE_Y + 0.035, _lipWorldPos.y);
            const spoutZ = _lipWorldPos.z;

            // Tìm dụng cụ hứng chất lỏng đặt ngay bên dưới miệng bình (hoặc đang hover trong lúc kéo)
            let receivingTarget: {
              inst: SceneInstance;
              asset: AssetDefinition;
              obj: THREE.Group;
              curMl: number;
              capMl: number;
            } | null = null;
            let bestHorizDist = 0.125;

            for (const other of instancesRef.current) {
              if (!other.visible || other.instanceId === srcInst.instanceId) continue;
              const otherAsset = assetsMapRef.current.get(other.assetId);
              if (!otherAsset) continue;
              const otherArch = otherAsset.geometry.proceduralArchetype;
              const otherCustom = htmlEquipmentModuleRegistry.getModule(otherAsset.assetId);
              const canReceive =
                otherArch === 'graduated-cylinder' ||
                otherArch === 'beaker-250' ||
                otherArch === 'erlenmeyer-flask' ||
                otherArch === 'overflow-can' ||
                otherArch === 'porcelain-dish' ||
                otherArch === 'distillation-flask' ||
                Boolean(otherCustom?.moduleControls.canHoldLiquid);
              if (!canReceive) continue;

              const otherObj = instanceObjectsRef.current.get(other.instanceId);
              if (!otherObj) continue;

              const horizDist = Math.hypot(
                otherObj.position.x - spoutX,
                otherObj.position.z - spoutZ,
              );
              const isHoveredTarget =
                ds.isDragging &&
                ds.instanceId === srcInst.instanceId &&
                ds.hoverTargetInstanceId === other.instanceId &&
                ds.hoverSlot === 'pour-liquid';

              if (horizDist < bestHorizDist || isHoveredTarget) {
                if (horizDist < bestHorizDist) bestHorizDist = horizDist;
                const dstCap =
                  otherArch === 'overflow-can'
                    ? 210
                    : otherAsset.scientificProperties.capacity?.value ?? 100;
                const dstFallback =
                  other.instanceState.baseLiquidLevelMl ??
                  other.instanceState.liquidLevelMl ??
                  dstCap * 0.5;
                const dstLiveMl = tp.liveVolumesMl.get(other.instanceId) ?? dstFallback;
                receivingTarget = {
                  inst: other,
                  asset: otherAsset,
                  obj: otherObj,
                  curMl: dstLiveMl,
                  capMl: dstCap,
                };
                if (isHoveredTarget) break;
              }
            }

            // Lưu lượng dòng chảy tỉ lệ thuận với độ nghiêng vượt ngưỡng 45° (từ 14 ml/s ở 45° lên ~40 ml/s ở 85°)
            const flowRateMlPerSec =
              14 + Math.max(0, tiltDeg - TILT_POUR_THRESHOLD_DEG) * 0.65;
            const rawDeltaMl = Math.min(srcCurMl, flowRateMlPerSec * dt);
            const dstRoomMl = receivingTarget
              ? receivingTarget.asset.geometry.proceduralArchetype === 'overflow-can'
                ? 260 - receivingTarget.curMl
                : Math.max(0, receivingTarget.capMl - receivingTarget.curMl)
              : rawDeltaMl;
            const actualDeltaMl = Math.max(0, Math.min(rawDeltaMl, dstRoomMl));

            if (actualDeltaMl > 0.0005) {
              const nextSrcMl = Math.max(0, srcCurMl - actualDeltaMl);
              tp.liveVolumesMl.set(srcInst.instanceId, nextSrcMl);

              // Cập nhật mặt chất lỏng 3D của bình đang nghiêng thời gian thực
              const srcLiqSurf = srcObj.getObjectByName('liquid_surface');
              if (srcLiqSurf) {
                srcLiqSurf.rotation.z = -srcObj.rotation.z * 0.78;
                if (nextSrcMl <= 0.25) {
                  srcLiqSurf.visible = false;
                } else {
                  srcLiqSurf.visible = true;
                  const srcScaleY = THREE.MathUtils.clamp(
                    (nextSrcMl / srcCapMl) / 0.5,
                    0.06,
                    2.0,
                  );
                  srcLiqSurf.scale.set(1, srcScaleY, 1);
                  const srcMeniscus = srcLiqSurf.getObjectByName('meniscus_wall');
                  if (srcMeniscus) {
                    srcMeniscus.scale.set(1, 1 / Math.max(0.18, srcScaleY), 1);
                  }
                }
              }

              // Cập nhật mặt chất lỏng 3D của bình nhận bên dưới thời gian thực
              let streamEndX = spoutX + (srcObj.rotation.z < 0 ? 0.012 : -0.012);
              let streamEndZ = spoutZ;
              let dstSurfaceWorldY = BENCH_SURFACE_Y + 0.002;
              let nextDstMl: number | null = null;

              if (receivingTarget) {
                nextDstMl = Math.min(
                  receivingTarget.asset.geometry.proceduralArchetype === 'overflow-can'
                    ? 260
                    : receivingTarget.capMl,
                  receivingTarget.curMl + actualDeltaMl,
                );
                tp.liveVolumesMl.set(receivingTarget.inst.instanceId, nextDstMl);
                streamEndX = receivingTarget.obj.position.x;
                streamEndZ = receivingTarget.obj.position.z;

                const dstLiqSurf = receivingTarget.obj.getObjectByName('liquid_surface');
                if (dstLiqSurf) {
                  dstLiqSurf.visible = true;
                  const cappedDstMl = Math.min(receivingTarget.capMl, nextDstMl);
                  const dstScaleY = THREE.MathUtils.clamp(
                    (cappedDstMl / receivingTarget.capMl) / 0.5,
                    0.08,
                    2.05,
                  );
                  dstLiqSurf.scale.set(1, dstScaleY, 1);
                  const dstMeniscus = dstLiqSurf.getObjectByName('meniscus_wall');
                  if (dstMeniscus) {
                    dstMeniscus.scale.set(1, 1 / Math.max(0.18, dstScaleY), 1);
                  }
                  receivingTarget.obj.updateMatrixWorld(true);
                  const surfCap = dstLiqSurf.getObjectByName('surface_cap');
                  if (surfCap) {
                    surfCap.getWorldPosition(_surfaceWorldPos);
                    dstSurfaceWorldY = _surfaceWorldPos.y;
                  } else {
                    dstSurfaceWorldY =
                      BENCH_SURFACE_Y +
                      Math.max(
                        0.025,
                        (receivingTarget.asset.geometry.boundingBoxM.height ?? 0.12) * 0.45,
                      );
                  }
                }
              }

              // Vẽ hiệu ứng dòng chảy 3D trực quan + các hạt nước nhỏ phun từ miệng bình xuống bình dưới (hoặc mặt bàn)
              if (pouringStreamRef.current) {
                const streamGrp = pouringStreamRef.current;
                streamGrp.visible = true;
                streamGrp.position.set(0, 0, 0);

                const len = Math.max(0.038, spoutY - dstSurfaceWorldY);
                const midX = (spoutX + streamEndX) * 0.5;
                const midY = dstSurfaceWorldY + len * 0.5;
                const midZ = (spoutZ + streamEndZ) * 0.5;
                const dx = streamEndX - spoutX;
                const tiltAng = Math.atan2(dx, len);

                const pulse = 0.9 + 0.18 * Math.sin(now * 0.034);
                const outerM = streamGrp.getObjectByName('pour_outer');
                const coreM = streamGrp.getObjectByName('pour_core');
                if (outerM) {
                  outerM.position.set(midX, midY, midZ);
                  outerM.rotation.z = -tiltAng;
                  outerM.scale.set(pulse, len / 0.14, pulse);
                }
                if (coreM) {
                  coreM.position.set(midX, midY, midZ);
                  coreM.rotation.z = -tiltAng;
                  coreM.scale.set(pulse * 0.9, len / 0.14, pulse * 0.9);
                }

                for (let d = 0; d < 6; d++) {
                  const drop = streamGrp.getObjectByName(`pour_drop_${d}`);
                  if (drop) {
                    const tDrop = (now * 0.0045 + d / 6) % 1;
                    drop.position.set(
                      THREE.MathUtils.lerp(spoutX, streamEndX, tDrop),
                      spoutY - tDrop * tDrop * len,
                      THREE.MathUtils.lerp(spoutZ, streamEndZ, tDrop),
                    );
                  }
                }

                for (let r = 0; r < 2; r++) {
                  const splash = streamGrp.getObjectByName(`pour_splash_${r}`) as
                    | THREE.Mesh
                    | undefined;
                  if (splash) {
                    const rPhase = (now * 0.0038 + r * 0.5) % 1;
                    const sScale = 0.65 + rPhase * 1.2;
                    splash.position.set(
                      streamEndX,
                      dstSurfaceWorldY + 0.0015 + r * 0.001,
                      streamEndZ,
                    );
                    splash.scale.set(sScale, sScale, 1);
                    if (splash.material instanceof THREE.MeshBasicMaterial) {
                      splash.material.opacity = (1 - rPhase) * 0.9;
                    }
                  }
                }
              }

              // Tích lũy thể tích đã rót trong phiên nghiêng và đồng bộ sang React state mỗi ~85ms
              if (!tp.isPouring || tp.sourceId !== srcInst.instanceId) {
                tp.isPouring = true;
                tp.sourceId = srcInst.instanceId;
                tp.targetId = receivingTarget?.inst.instanceId ?? null;
                tp.sessionPouredMl = 0;
                tp.pendingDeltaMl = 0;
                labSoundEngine.play('liquid-pour', 0.85);
              }
              tp.targetId = receivingTarget?.inst.instanceId ?? tp.targetId;
              tp.currentTiltDeg = tiltDeg;
              tp.flowRateMlPerSec = flowRateMlPerSec;
              tp.sessionPouredMl += actualDeltaMl;
              tp.pendingDeltaMl += actualDeltaMl;

              if (now - tp.lastSyncMs >= 85) {
                const flushDelta = tp.pendingDeltaMl;
                tp.pendingDeltaMl = 0;
                tp.lastSyncMs = now;
                if (onRealtimeTiltPourRef.current && flushDelta > 0.01) {
                  onRealtimeTiltPourRef.current(
                    srcInst.instanceId,
                    receivingTarget?.inst.instanceId ?? null,
                    flushDelta,
                    tiltDeg,
                    false,
                    tp.sessionPouredMl,
                  );
                }
                setActiveTiltPourHud({
                  sourceTitle: srcInst.customLabel || srcAsset.name.vi,
                  targetTitle: receivingTarget
                    ? receivingTarget.inst.customLabel || receivingTarget.asset.name.vi
                    : 'Mặt bàn thí nghiệm',
                  tiltDeg: Math.round(tiltDeg),
                  flowRateMlPerSec: Math.round(flowRateMlPerSec),
                  sourceRemainMl: Number(nextSrcMl.toFixed(1)),
                  targetCurrentMl:
                    nextDstMl !== null ? Number(nextDstMl.toFixed(1)) : null,
                  sessionPouredMl: Number(tp.sessionPouredMl.toFixed(1)),
                });
              }

              needsMoreFrames = true;
            } else {
              if (pouringStreamRef.current) {
                pouringStreamRef.current.visible = false;
              }
            }
          } else {
            // Không còn bình nào nghiêng vượt ngưỡng 45° có nước chảy: kết thúc phiên rót và phát tổng kết
            if (pouringStreamRef.current) {
              pouringStreamRef.current.visible = false;
            }
            if (tp.isPouring && tp.sourceId) {
              const finalSourceId = tp.sourceId;
              const finalTargetId = tp.targetId;
              const remainingDelta = tp.pendingDeltaMl;
              const totalPoured = tp.sessionPouredMl;
              const lastTilt = tp.currentTiltDeg;
              tp.isPouring = false;
              tp.sourceId = null;
              tp.targetId = null;
              tp.pendingDeltaMl = 0;
              tp.liveVolumesMl.clear();
              setActiveTiltPourHud(null);
              if (onRealtimeTiltPourRef.current && totalPoured > 0.2) {
                onRealtimeTiltPourRef.current(
                  finalSourceId,
                  finalTargetId,
                  remainingDelta,
                  lastTilt,
                  true,
                  totalPoured,
                );
              }
            }
          }
        }

        // C3. REAL-TIME 60 FPS ALCOHOL BURNER FLAME, HEAT WAVES & BOILING BUBBLES ANIMATION ON 3D BENCH
        const flameTime = now * 0.0045;
        for (const inst of instancesRef.current) {
          if (!inst.visible) continue;
          const obj = instanceObjectsRef.current.get(inst.instanceId);
          if (!obj) continue;
          const flameObj = obj.getObjectByName('alcohol_flame_group');
          if (flameObj && flameObj.visible) {
            flameObj.rotation.y = Math.sin(flameTime * 0.9) * 0.14;
            flameObj.position.x = Math.sin(flameTime * 1.8) * 0.0008;
            const heatWaves = flameObj.getObjectByName('thermal_heat_waves');
            if (heatWaves) {
              heatWaves.position.y = ((flameTime * 0.16) % 0.25) * 0.065;
              heatWaves.rotation.y = flameTime * 0.6;
            }
            const bubbles = obj.getObjectByName('boiling_bubbles_group');
            if (bubbles && bubbles.visible) {
              bubbles.position.y = Math.sin(flameTime * 2.2) * 0.004;
              bubbles.rotation.y = flameTime * 0.8;
            }
            needsMoreFrames = true;
          }
        }

        // D. Animate equipment jumping along a parabolic arc into the Bench Storage Cabinet (`activeCabinetJumpAnimsRef`)
        if (activeCabinetJumpAnimsRef.current.length > 0) {
          const remainingAnims: typeof activeCabinetJumpAnimsRef.current = [];
          const cabinetStoredGroup = scene.getObjectByName(
            'cabinet_stored_items_group',
          ) as THREE.Group | undefined;

          for (const anim of activeCabinetJumpAnimsRef.current) {
            const elapsed = now - anim.startTimeMs;
            const p = Math.min(1, Math.max(0, elapsed / anim.durationMs));
            const ease = 1 - (1 - p) ** 3;
            const arcHeight = Math.sin(p * Math.PI) * 0.19;

            if (p < 1) {
              anim.mesh.position.set(
                THREE.MathUtils.lerp(anim.startX, anim.targetWorldX, ease),
                THREE.MathUtils.lerp(anim.startY, anim.targetWorldY, ease) +
                  arcHeight,
                THREE.MathUtils.lerp(anim.startZ, anim.targetWorldZ, ease),
              );
              const curScale = THREE.MathUtils.lerp(
                anim.startScale,
                anim.targetScale,
                ease,
              );
              anim.mesh.scale.set(curScale, curScale, curScale);
              anim.mesh.rotation.x = THREE.MathUtils.lerp(
                anim.mesh.rotation.x,
                0,
                ease,
              );
              anim.mesh.rotation.z = THREE.MathUtils.lerp(
                anim.mesh.rotation.z,
                0,
                ease,
              );
              remainingAnims.push(anim);
              needsMoreFrames = true;
            } else {
              if (cabinetStoredGroup) {
                cabinetStoredGroup.add(anim.mesh);
                anim.mesh.position.set(
                  anim.targetLocalX,
                  anim.targetLocalY,
                  anim.targetLocalZ,
                );
              } else {
                anim.mesh.position.set(
                  anim.targetWorldX,
                  anim.targetWorldY,
                  anim.targetWorldZ,
                );
              }
              anim.mesh.scale.set(
                anim.targetScale,
                anim.targetScale,
                anim.targetScale,
              );
              anim.mesh.rotation.set(0, 0, 0);
              cabinetStoredMeshesRef.current.set(anim.storedId, anim.mesh);
              needsMoreFrames = true;
            }
          }
          activeCabinetJumpAnimsRef.current = remainingAnims;
        }

        // Animate 3D Live Contextual Neural Synapse Photon Particles at 60fps
        const neuralGrp = neuralSynapseBeamGroupRef.current;
        if (neuralGrp && neuralGrp.children.length > 0) {
          const nowSec = performance.now() * 0.001;
          let hasParticles = false;
          for (const ch of neuralGrp.children) {
            if (ch.name === 'neural_photon_particle' && ch.userData && ch.userData.curve) {
              hasParticles = true;
              const uData = ch.userData as {
                curve: THREE.QuadraticBezierCurve3;
                direction: 'input' | 'output' | 'bidirectional';
                offset: number;
                speed: number;
              };
              let t = 0;
              if (uData.direction === 'output') {
                // Dòng chảy ra: Xanh dương neon chảy từ Selected ra Target
                t = ((nowSec * uData.speed + uData.offset) % 1 + 1) % 1;
              } else if (uData.direction === 'input') {
                // Dòng chảy vào: Tím neon chảy từ Target vào Selected
                t = 1 - (((nowSec * uData.speed + uData.offset) % 1 + 1) % 1);
              } else {
                // Cùng cấp / Gợi ý: Lam tím neon chảy qua lại dao động hai chiều
                t = 0.5 + 0.48 * Math.sin(nowSec * uData.speed * 2.8 + uData.offset * 6.28);
              }
              const pt = uData.curve.getPointAt(Math.max(0, Math.min(1, t)));
              ch.position.copy(pt);
            }
          }
          if (hasParticles && !isSoftwareGl) {
            needsMoreFrames = true;
          }
        }

        orbit.update();
        if (viewModeRef.current !== 'single-asset') {
          orbit.target.x = THREE.MathUtils.clamp(orbit.target.x, -4.2, 4.2);
          orbit.target.y = THREE.MathUtils.clamp(orbit.target.y, 0.15, 3.0);
          orbit.target.z = THREE.MathUtils.clamp(orbit.target.z, -2.6, 3.2);
          camera.position.x = THREE.MathUtils.clamp(camera.position.x, -6.6, 6.6);
          camera.position.y = THREE.MathUtils.clamp(camera.position.y, 0.15, 3.95);
          camera.position.z = THREE.MathUtils.clamp(camera.position.z, -3.5, 5.8);
        }
        if (selectionBoxHelperRef.current && selectionBoxHelperRef.current.visible) {
          selectionBoxHelperRef.current.update();
        }
        renderer.render(scene, camera);
        if (!ds.isDragging) {
          updateProjectedOverlays();
        }

        if (needsMoreFrames) {
          renderDirty = true;
        }

        const done = () => {
          renderBusy = false;
          if (renderDirty) requestRender();
        };
        if (isSoftwareGl && !ds.isDragging) afterDraw(done);
        else done();
      });
    }
    requestRenderRef.current = requestRender;

    orbit.addEventListener('change', () => {
      requestRender();
    });

    transformControls.addEventListener('change', () => {
      if (transformControls.object && selectionRingRef.current) {
        selectionRingRef.current.position.x = transformControls.object.position.x;
        selectionRingRef.current.position.z = transformControls.object.position.z;
      }
      requestRender();
    });

    transformControls.addEventListener('dragging-changed', (event) => {
      const isDragging = Boolean((event as unknown as { value: boolean }).value);
      orbit.enabled = !isDragging;
      if (!isDragging && transformControls.object) {
        const obj = transformControls.object;
        const instId = obj.userData.instanceId as string | undefined;
        if (instId) {
          obj.position.x = THREE.MathUtils.clamp(obj.position.x, -1.14, 1.14);
          obj.position.z = THREE.MathUtils.clamp(obj.position.z, -0.34, 0.34);
          onUpdateTransformRef.current(
            instId,
            [
              Number(obj.position.x.toFixed(3)),
              Number((obj.position.y - BENCH_SURFACE_Y).toFixed(3)),
              Number(obj.position.z.toFixed(3)),
            ],
            [
              Number(obj.rotation.x.toFixed(3)),
              Number(obj.rotation.y.toFixed(3)),
              Number(obj.rotation.z.toFixed(3)),
            ],
          );
          requestRender();
        }
      }
    });

    // =========================================================================
    // DIRECT PHYSICAL GRAB, GLIDE & LAB EQUIPMENT DOCKING
    // =========================================================================
    const raycaster = new THREE.Raycaster();
    raycaster.params.Line.threshold = 0.005;
    raycaster.params.Points.threshold = 0.005;
    const mouseNdc = new THREE.Vector2();

    // Chỉ chấp nhận giao điểm trúng trực tiếp lên phần thân vật lý ĐANG HIỂN THỊ của thiết bị:
    // loại bỏ hoàn toàn bóng đổ nền (`contact_shadow`), mesh ẩn (`visible === false`),
    // chùm tia sáng / quầng lửa (`AdditiveBlending`), Sprite / Line / Points và hitbox vô hình.
    const isPreciselyPickableHit = (hit: THREE.Intersection): boolean => {
      const obj = hit.object;
      if (!(obj instanceof THREE.Mesh)) return false;

      let ancestor: THREE.Object3D | null = obj;
      while (ancestor) {
        if (!ancestor.visible) return false;
        if (
          ancestor.name === 'contact_shadow' ||
          ancestor.userData?.nonPickable === true ||
          ancestor.userData?.isVisualEffect === true
        ) {
          return false;
        }
        ancestor = ancestor.parent;
      }

      // Cho phép nhấp trực tiếp vào cọc cắm điện 4mm để cắm dây (không kéo vật thể)
      if (obj.userData?.isTerminal === true) {
        return true;
      }

      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      const hasSolidOrVisibleGlassMat = mats.some((mat) => {
        if (!mat || mat.visible === false) return false;
        if (mat.blending === THREE.AdditiveBlending) return false;
        if (mat.transparent && mat.opacity <= 0.04) return false;
        return true;
      });
      return hasSolidOrVisibleGlassMat;
    };

    const intersectEquipmentPrecisely = (
      objects: THREE.Object3D[],
    ): THREE.Intersection[] => {
      if (objects.length === 0) return [];
      const rawHits = raycaster.intersectObjects(objects, true);
      if (rawHits.length === 0) return rawHits;
      return rawHits.filter(isPreciselyPickableHit);
    };

    function evaluateLabDockingTarget(
      draggedInst: SceneInstance,
      draggedAsset: AssetDefinition,
      worldX: number,
      worldZ: number,
      pointerRay?: THREE.Ray,
    ): {
      pos: [number, number, number];
      targetInstanceId: string | null;
      slot: PhysicalDockTargetSlot;
      hint: string | null;
      snapRingPos: [number, number, number] | null;
    } {
      const draggedArch = draggedAsset.geometry.proceduralArchetype;
      const customDraggedMod = htmlEquipmentModuleRegistry.getModule(
        draggedAsset.assetId,
      );
      const isSpecimenOrWeight =
        draggedAsset.kind === 'specimen' ||
        draggedArch === 'calibration-weight' ||
        draggedArch === 'pascal-weight-100g' ||
        draggedArch === 'copper-wire-ring-3g' ||
        draggedArch === 'solid-cylinder' ||
        draggedArch === 'solid-sphere' ||
        draggedArch === 'solid-block' ||
        draggedArch === 'hollow-cylinder' ||
        Boolean(customDraggedMod?.moduleControls.canSubmergeInVessel);

      const getVesselDefaultLiquidMl = (
        vArch: string | undefined,
        vCap: number,
      ): number => {
        if (vArch === 'beaker-bomex-100' || vArch === 'thermal-heating-vessel') {
          return 0;
        }
        if (
          vArch === 'reagent-bottle-naoh-400' ||
          vArch === 'reagent-bottle-agno3-400'
        ) {
          return 300;
        }
        if (vArch === 'overflow-can') return 210;
        if (vArch === 'water-dispenser') return 850;
        if (vArch === 'graduated-cylinder') return 50;
        if (vArch === 'beaker-250') return 40;
        return vCap * 0.5;
      };

      const draggedCapMl =
        draggedArch === 'overflow-can'
          ? 210
          : draggedArch === 'water-dispenser'
            ? 1000
            : draggedArch === 'reagent-bottle-naoh-400' ||
                draggedArch === 'reagent-bottle-agno3-400'
              ? 400
              : draggedAsset.scientificProperties.capacity?.value ?? 100;
      const draggedCurLiquidMl =
        draggedInst.instanceState.baseLiquidLevelMl ??
        draggedInst.instanceState.liquidLevelMl ??
        getVesselDefaultLiquidMl(draggedArch, draggedCapMl);

      const isPourableSourceVessel =
        (draggedArch === 'beaker-250' ||
          draggedArch === 'beaker-bomex-100' ||
          draggedArch === 'thermal-heating-vessel' ||
          draggedArch === 'graduated-cylinder' ||
          draggedArch === 'erlenmeyer-flask' ||
          draggedArch === 'overflow-can' ||
          draggedArch === 'water-dispenser' ||
          draggedArch === 'reagent-bottle-naoh-400' ||
          draggedArch === 'reagent-bottle-agno3-400' ||
          draggedArch === 'separatory-funnel' ||
          draggedArch === 'distillation-flask' ||
          draggedArch === 'porcelain-dish' ||
          Boolean(customDraggedMod?.moduleControls.canHoldLiquid)) &&
        draggedCurLiquidMl > 0.5;

      const isWaterReceivingVessel =
        draggedArch === 'graduated-cylinder' ||
        draggedArch === 'beaker-250' ||
        draggedArch === 'beaker-bomex-100' ||
        draggedArch === 'thermal-heating-vessel' ||
        draggedArch === 'overflow-can' ||
        draggedArch === 'erlenmeyer-flask' ||
        draggedArch === 'porcelain-dish' ||
        draggedArch === 'distillation-flask' ||
        Boolean(customDraggedMod?.moduleControls.canHoldLiquid);

      const isWeighableOnScale =
        isSpecimenOrWeight ||
        draggedArch === 'beaker-250' ||
        draggedArch === 'beaker-bomex-100' ||
        draggedArch === 'thermal-heating-vessel' ||
        draggedArch === 'graduated-cylinder' ||
        draggedArch === 'erlenmeyer-flask' ||
        draggedArch === 'porcelain-dish' ||
        Boolean(customDraggedMod?.moduleControls.canBeWeighedOnBalance) ||
        (draggedArch !== 'electronic-balance' &&
          draggedArch !== 'water-dispenser' &&
          draggedArch !== 'retort-stand' &&
          (draggedAsset.scientificProperties.referenceMass?.value ?? 0) > 0);

      // Compute optional pointer ray intersection at beaker rim level so dragging tall bottles over the 100ml beaker snaps accurately under the cursor
      let pointerRimX: number | null = null;
      let pointerRimZ: number | null = null;
      if (pointerRay && Math.abs(pointerRay.direction.y) > 1e-4) {
        const rimPlaneY = BENCH_SURFACE_Y + 0.055;
        const tRim = (rimPlaneY - pointerRay.origin.y) / pointerRay.direction.y;
        if (tRim > 0) {
          pointerRimX = pointerRay.origin.x + pointerRay.direction.x * tRim;
          pointerRimZ = pointerRay.origin.z + pointerRay.direction.z * tRim;
        }
      }

      for (const other of instancesRef.current) {
        if (other.instanceId === draggedInst.instanceId || !other.visible) continue;
        const otherAsset = assetsMapRef.current.get(other.assetId);
        if (!otherAsset) continue;
        const arch = otherAsset.geometry.proceduralArchetype;
        const ox = other.transform.positionM[0];
        const oz = other.transform.positionM[2];
        const rotY = other.transform.rotationRad[1] ?? 0;

        // 0A. Water Dispenser Outlet Proximity Docking — Kéo dụng cụ chứa lại gần vòi Bình cấp nước để tự động hứng và lấy nước!
        // Riêng Cốc đong 100ml (beaker-bomex-100) ưu tiên dùng Chốt bắt dính (pour-liquid) để hiện khung nhập Khối lượng (g) hoặc Thể tích (ml) theo yêu cầu.
        if (
          arch === 'water-dispenser' &&
          isWaterReceivingVessel &&
          draggedArch !== 'beaker-bomex-100'
        ) {
          const spoutX = Number((ox + Math.cos(rotY) * 0.095).toFixed(3));
          const spoutZ = Number((oz - Math.sin(rotY) * 0.095).toFixed(3));
          const distToSpout = Math.hypot(worldX - spoutX, worldZ - spoutZ);
          const distToBody = Math.hypot(worldX - ox, worldZ - oz);
          if (distToSpout < 0.145 || distToBody < 0.155) {
            const vesselCap =
              draggedArch === 'overflow-can'
                ? 210
                : draggedAsset.scientificProperties.capacity?.value ?? 100;
            const curMl =
              draggedInst.instanceState.baseLiquidLevelMl ??
              draggedInst.instanceState.liquidLevelMl ??
              vesselCap * 0.5;
            const addPreviewMl =
              draggedArch === 'overflow-can' && curMl < 210
                ? Math.max(0, 210 - curMl)
                : Math.max(0, Math.min(25, vesselCap - curMl));
            return {
              pos: [spoutX, 0.005, spoutZ],
              targetInstanceId: other.instanceId,
              slot: 'dispenser-outlet',
              hint:
                addPreviewMl > 0.1
                  ? `Đặt vào khay hứng vòi Bình cấp nước (Mở van lấy +${addPreviewMl.toFixed(0)} ml → ${(curMl + addPreviewMl).toFixed(0)} / ${vesselCap} ml)`
                  : `Đặt dưới vòi Bình cấp nước (${draggedAsset.name.vi} đã đầy ${vesselCap} ml)`,
              snapRingPos: [spoutX, 0.004, spoutZ],
            };
          }
        }

        // 0B. Reverse Water Dispenser Docking — Kéo Bình cấp nước lại gần dụng cụ chứa để đặt vòi ngay trên miệng bình!
        if (
          draggedArch === 'water-dispenser' &&
          arch !== 'beaker-bomex-100' &&
          (arch === 'graduated-cylinder' ||
            arch === 'beaker-250' ||
            arch === 'thermal-heating-vessel' ||
            arch === 'overflow-can' ||
            arch === 'erlenmeyer-flask' ||
            arch === 'porcelain-dish')
        ) {
          const dispRotY = draggedInst.transform.rotationRad[1] ?? 0;
          const desiredDispX = Number((ox - Math.cos(dispRotY) * 0.095).toFixed(3));
          const desiredDispZ = Number((oz + Math.sin(dispRotY) * 0.095).toFixed(3));
          const dist = Math.hypot(worldX - desiredDispX, worldZ - desiredDispZ);
          const distDirect = Math.hypot(worldX - ox, worldZ - oz);
          if (dist < 0.145 || distDirect < 0.155) {
            return {
              pos: [desiredDispX, 0.004, desiredDispZ],
              targetInstanceId: other.instanceId,
              slot: 'dispenser-outlet',
              hint: `Đặt vòi Bình cấp nước ngay trên ${otherAsset.name.vi} để xả nước`,
              snapRingPos: [ox, 0.004, oz],
            };
          }
        }

        // 1. Electronic Balance Pan Docking — Tính tâm đĩa cân theo góc xoay 360° & CỘNG DỒN khối lượng nhiều vật!
        if (arch === 'electronic-balance' && isWeighableOnScale) {
          const panX = ox - Math.sin(rotY) * 0.02;
          const panZ = oz - Math.cos(rotY) * 0.02;
          const dist = Math.hypot(worldX - panX, worldZ - panZ);
          if (dist < 0.125) {
            const dryMass =
              draggedAsset.scientificProperties.referenceMass?.value ?? 66.25;
            const waterMass =
              isPourableSourceVessel || draggedArch === 'porcelain-dish'
                ? draggedInst.instanceState.liquidLevelMl ?? 0
                : 0;
            const itemMass = dryMass + waterMass;

            // Find all OTHER items already resting on this balance pan to compute cumulative mass
            const existingOnPan = instancesRef.current.filter(
              (item) =>
                item.visible &&
                item.instanceId !== draggedInst.instanceId &&
                item.instanceState.attachedToInstanceId === other.instanceId &&
                item.instanceState.attachmentSlot === 'balance-pan',
            );
            let existingMassG = 0;
            for (const pItem of existingOnPan) {
              const pAsset = assetsMapRef.current.get(pItem.assetId);
              const pArch = pAsset?.geometry.proceduralArchetype;
              const pDry =
                pAsset?.scientificProperties.referenceMass?.value ?? 66.25;
              const pWater =
                pArch === 'beaker-250' ||
                pArch === 'beaker-bomex-100' ||
                pArch === 'graduated-cylinder' ||
                pArch === 'erlenmeyer-flask' ||
                pArch === 'porcelain-dish'
                  ? pItem.instanceState.liquidLevelMl ?? 0
                  : 0;
              existingMassG += pDry + pWater;
            }

            const cumulativeMassG = existingMassG + itemMass;
            // Arrange multiple items neatly on the Ø130mm pan so they don't overlap
            const slotIdx = existingOnPan.length;
            const offsetRadius = slotIdx === 0 ? 0 : 0.025;
            const offsetAng = slotIdx * 2.1;
            const dockX = Number(
              (panX + Math.cos(offsetAng) * offsetRadius).toFixed(3),
            );
            const dockZ = Number(
              (panZ + Math.sin(offsetAng) * offsetRadius).toFixed(3),
            );

            return {
              pos: [dockX, 0.068, dockZ],
              targetInstanceId: other.instanceId,
              slot: 'balance-pan',
              hint:
                existingOnPan.length > 0
                  ? `Cộng thêm vào Cân điện tử (+${itemMass.toFixed(2)} g → Tổng ${existingOnPan.length + 1} vật: ${cumulativeMassG.toFixed(2)} g)`
                  : `Đặt lên đĩa Cân điện tử (m = ${itemMass.toFixed(2)} g)`,
              snapRingPos: [panX, 0.069, panZ],
            };
          }
        }

        // 2. Liquid Pouring Magnetic Snap Latch ("Chốt bắt dính rót dung dịch")
        // Hỗ trợ cả 2 chiều:
        // (A) Kéo thiết bị chứa chất lỏng (lọ hóa chất, bình cấp nước, cốc, ống đong, bình...) lại gần Cốc đong 100ml / bình nhận -> Bắt dính ngay vào miệng cốc!
        // (B) Kéo Cốc đong 100ml (hoặc bình nhận đang rỗng/còn chỗ) lại gần thiết bị chứa chất lỏng -> Bắt dính cạnh bình nguồn để mở khung nhập ml / g!
        const otherCustomMod = htmlEquipmentModuleRegistry.getModule(
          otherAsset.assetId,
        );
        const otherCapMl =
          arch === 'overflow-can'
            ? 210
            : arch === 'water-dispenser'
              ? 1000
              : arch === 'reagent-bottle-naoh-400' ||
                  arch === 'reagent-bottle-agno3-400'
                ? 400
                : otherAsset.scientificProperties.capacity?.value ?? 100;
        const otherCurMl =
          other.instanceState.baseLiquidLevelMl ??
          other.instanceState.liquidLevelMl ??
          getVesselDefaultLiquidMl(arch, otherCapMl);
        const otherIsReceivingVessel =
          arch === 'graduated-cylinder' ||
          arch === 'beaker-250' ||
          arch === 'beaker-bomex-100' ||
          arch === 'thermal-heating-vessel' ||
          arch === 'overflow-can' ||
          arch === 'erlenmeyer-flask' ||
          arch === 'porcelain-dish' ||
          arch === 'distillation-flask' ||
          Boolean(otherCustomMod?.moduleControls.canHoldLiquid);
        const otherIsPourableSource =
          (arch === 'beaker-250' ||
            arch === 'beaker-bomex-100' ||
            arch === 'thermal-heating-vessel' ||
            arch === 'graduated-cylinder' ||
            arch === 'erlenmeyer-flask' ||
            arch === 'overflow-can' ||
            arch === 'water-dispenser' ||
            arch === 'reagent-bottle-naoh-400' ||
            arch === 'reagent-bottle-agno3-400' ||
            arch === 'separatory-funnel' ||
            arch === 'distillation-flask' ||
            arch === 'porcelain-dish' ||
            Boolean(otherCustomMod?.moduleControls.canHoldLiquid)) &&
          otherCurMl > 0.5;

        const baseDist = Math.hypot(worldX - ox, worldZ - oz);
        const rimRayDist =
          pointerRimX !== null && pointerRimZ !== null
            ? Math.hypot(pointerRimX - ox, pointerRimZ - oz)
            : Infinity;
        const effectivePourDist = Math.min(baseDist, rimRayDist);

        if (isPourableSourceVessel && otherIsReceivingVessel) {
          if (effectivePourDist < 0.185) {
            const dstCap = otherCapMl;
            const dstCurMl = otherCurMl;
            const srcCurMl = draggedCurLiquidMl;
            const availMl = Math.max(
              0,
              Math.min(srcCurMl, dstCap - dstCurMl),
            );
            const dstHeight = otherAsset.geometry.boundingBoxM.height ?? 0.082;
            const latchHoverX = Number(
              THREE.MathUtils.clamp(
                ox - 0.068,
                -BENCH_LIMIT_X,
                BENCH_LIMIT_X,
              ).toFixed(3),
            );
            const latchHoverY = Number((dstHeight + 0.028).toFixed(3));
            const latchHoverZ = Number(
              THREE.MathUtils.clamp(
                oz,
                -BENCH_LIMIT_Z,
                BENCH_LIMIT_Z,
              ).toFixed(3),
            );
            return {
              pos: [latchHoverX, latchHoverY, latchHoverZ],
              targetInstanceId: other.instanceId,
              slot: 'pour-liquid',
              hint:
                availMl > 0.1
                  ? `🧲 CHỐT BẮT DÍNH ĐÃ KHỚP — Thả chuột để nhập Khối lượng (g) hoặc Thể tích (ml) muốn rót vào ${otherAsset.name.vi} (${dstCurMl.toFixed(0)} / ${dstCap} ml)`
                  : `${otherAsset.name.vi} đã đầy (${dstCap} ml)`,
              snapRingPos: [ox, 0.004, oz],
            };
          }
        } else if (
          isWaterReceivingVessel &&
          otherIsPourableSource &&
          draggedCurLiquidMl < draggedCapMl - 0.1
        ) {
          if (effectivePourDist < 0.185) {
            const snapReceiveX = Number(
              THREE.MathUtils.clamp(
                ox + 0.105,
                -BENCH_LIMIT_X,
                BENCH_LIMIT_X,
              ).toFixed(3),
            );
            const snapReceiveZ = Number(
              THREE.MathUtils.clamp(
                oz - 0.02,
                -BENCH_LIMIT_Z,
                BENCH_LIMIT_Z,
              ).toFixed(3),
            );
            return {
              pos: [snapReceiveX, 0.004, snapReceiveZ],
              targetInstanceId: other.instanceId,
              slot: 'pour-liquid',
              hint: `🧲 CHỐT BẮT DÍNH ĐÃ KHỚP — Thả chuột để nhập Khối lượng (g) hoặc Thể tích (ml) muốn rót từ ${otherAsset.name.vi} (${otherCurMl.toFixed(0)} ml) vào ${draggedAsset.name.vi} (${draggedCurLiquidMl.toFixed(0)} / ${draggedCapMl} ml)`,
              snapRingPos: [snapReceiveX, 0.004, snapReceiveZ],
            };
          }
        }

        // 2b. Direct Alcohol Burner & Tripod Wire Gauze Docking (Cho phép đặt trực tiếp Bình thủy tinh chịu nhiệt lên trên Đèn cồn đang cháy hoặc lên Kiềng 3 chân!)
        if (
          arch === 'alcohol-burner' &&
          (draggedArch === 'thermal-heating-vessel' ||
            draggedArch === 'beaker-250' ||
            draggedArch === 'beaker-bomex-100' ||
            draggedArch === 'erlenmeyer-flask' ||
            draggedArch === 'distillation-flask' ||
            draggedArch === 'porcelain-dish')
        ) {
          const dist = Math.hypot(worldX - ox, worldZ - oz);
          if (dist < 0.145) {
            return {
              pos: [ox, 0.118, oz],
              targetInstanceId: other.instanceId,
              slot: 'tripod-top',
              hint: `🔥 Đặt ${draggedAsset.name.vi} trực tiếp lên trên Đèn cồn (${other.instanceState.isHeating ? 'Đang cháy 100 °C' : '0 °C'}) để đun tan đá & đun sôi nước`,
              snapRingPos: [ox, 0.116, oz],
            };
          }
        }

        if (
          draggedArch === 'alcohol-burner' &&
          (arch === 'thermal-heating-vessel' ||
            arch === 'beaker-250' ||
            arch === 'beaker-bomex-100' ||
            arch === 'erlenmeyer-flask' ||
            arch === 'distillation-flask' ||
            arch === 'porcelain-dish')
        ) {
          const dist = Math.hypot(worldX - ox, worldZ - oz);
          if (dist < 0.145) {
            return {
              pos: [ox, 0, oz],
              targetInstanceId: other.instanceId,
              slot: 'under-tripod',
              hint: `🔥 Đặt Đèn cồn (${draggedInst.instanceState.isHeating ? '100 °C' : '0 °C'}) vào ngay dưới đáy ${otherAsset.name.vi} để đun nóng`,
              snapRingPos: [ox, 0.004, oz],
            };
          }
        }

        if (
          (arch === 'tripod-wire-gauze' || arch === 'retort-stand') &&
          (draggedArch === 'thermal-heating-vessel' ||
            draggedArch === 'beaker-250' ||
            draggedArch === 'beaker-bomex-100' ||
            draggedArch === 'erlenmeyer-flask' ||
            draggedArch === 'distillation-flask' ||
            draggedArch === 'porcelain-dish')
        ) {
          const dist = Math.hypot(worldX - ox, worldZ - oz);
          if (dist < 0.135) {
            return {
              pos: [ox, 0.128, oz],
              targetInstanceId: other.instanceId,
              slot: 'tripod-top',
              hint: `Đặt ${draggedAsset.name.vi} lên Giá đỡ thí nghiệm (y = 128 mm)`,
              snapRingPos: [ox, 0.128, oz],
            };
          }
        }

        if (
          (arch === 'tripod-wire-gauze' || arch === 'retort-stand') &&
          draggedArch === 'alcohol-burner'
        ) {
          const dist = Math.hypot(worldX - ox, worldZ - oz);
          if (dist < 0.145) {
            return {
              pos: [ox, 0, oz],
              targetInstanceId: other.instanceId,
              slot: 'under-tripod',
              hint: 'Đặt Đèn cồn chính giữa dưới Giá đỡ thí nghiệm để đun nóng bình phía trên',
              snapRingPos: [ox, 0.004, oz],
            };
          }
        }

        // Cho phép đặt Kiềng sắt 3 chân (`tripod-wire-gauze`) khớp vào Giá đỡ thí nghiệm (`retort-stand`) hoặc ngược lại
        if (
          (arch === 'retort-stand' && draggedArch === 'tripod-wire-gauze') ||
          (arch === 'tripod-wire-gauze' && draggedArch === 'retort-stand')
        ) {
          const dist = Math.hypot(worldX - ox, worldZ - oz);
          if (dist < 0.145) {
            return {
              pos: [ox, 0, oz],
              targetInstanceId: other.instanceId,
              slot: 'under-tripod',
              hint: `Đặt ${draggedAsset.name.vi} khớp đồng tâm với ${otherAsset.name.vi}`,
              snapRingPos: [ox, 0.004, oz],
            };
          }
        }

        // Cho phép treo / gắn Nhiệt kế trực tiếp lên kẹp của Giá đỡ thí nghiệm (`retort-stand`)!
        if (arch === 'retort-stand' && draggedArch === 'thermometer') {
          let dist = Math.hypot(worldX - ox, worldZ - oz);
          if (pointerRay) {
            _elevatedRayPlane.constant = -(BENCH_SURFACE_Y + 0.22);
            if (pointerRay.intersectPlane(_elevatedRayPlane, _elevatedIntersect)) {
              const elevDist = Math.hypot(
                _elevatedIntersect.x - ox,
                _elevatedIntersect.z - oz,
              );
              dist = Math.min(dist, elevDist);
            }
          }
          if (dist < 0.15) {
            return {
              pos: [ox, 0.146, oz],
              targetInstanceId: other.instanceId,
              slot: 'inside-vessel',
              hint: `🌡️ Đặt Nhiệt kế lên thanh kẹp của ${otherAsset.name.vi}`,
              snapRingPos: [ox, 0.312, oz],
            };
          }
        }

        if (
          draggedArch === 'ice-cubes-tray' &&
          (arch === 'thermal-heating-vessel' ||
            arch === 'beaker-250' ||
            arch === 'erlenmeyer-flask' ||
            arch === 'distillation-flask' ||
            arch === 'porcelain-dish')
        ) {
          const vesselBaseY = other.transform.positionM[1] ?? 0;
          let dist = Math.hypot(worldX - ox, worldZ - oz);
          if (pointerRay && vesselBaseY > 0.02) {
            _elevatedRayPlane.constant = -(BENCH_SURFACE_Y + vesselBaseY + 0.065);
            if (pointerRay.intersectPlane(_elevatedRayPlane, _elevatedIntersect)) {
              const elevDist = Math.hypot(
                _elevatedIntersect.x - ox,
                _elevatedIntersect.z - oz,
              );
              dist = Math.min(dist, elevDist);
            }
          }
          if (dist < 0.15) {
            const trayIceG = draggedInst.instanceState.iceMassG ?? 100;
            const hoverX = THREE.MathUtils.clamp(ox - 0.072, -BENCH_LIMIT_X, BENCH_LIMIT_X);
            return {
              pos: [hoverX, Number((vesselBaseY + 0.145).toFixed(3)), oz],
              targetInstanceId: other.instanceId,
              slot: 'inside-vessel',
              hint:
                trayIceG > 0.5
                  ? `🧊 Thả để cho ${trayIceG.toFixed(0)}g Nước đá viên (-4.0 °C) vào ${otherAsset.name.vi}`
                  : `Khay nước đá đã hết (0g) — Bấm "❄️ Lấy đầy 100g đá viên" để thêm đá mới!`,
              snapRingPos: [ox, vesselBaseY + 0.106, oz],
            };
          }
        }

        // 2c. Pascal Hydraulic Press Docking — Kéo thả Quả nặng chuẩn Pascal 100g (hoặc quả cân/vật mẫu) lên Đĩa Pit-tông (1) nhánh lớn S₁ hoặc Đĩa Pit-tông (2) nhánh nhỏ S₂!
        if (
          arch === 'pascal-hydraulic-press' &&
          (draggedArch === 'pascal-weight-100g' ||
            draggedArch === 'calibration-weight' ||
            isSpecimenOrWeight)
        ) {
          // Tọa độ tâm 2 nhánh Pit-tông (1) và (2) theo góc xoay rotY của bộ bình thông nhau Pascal (offset X = ±2.35 * 0.036 = ±0.0846 m)
          const cosR = Math.cos(rotY);
          const sinR = Math.sin(rotY);
          const p1X = ox - cosR * 0.0846;
          const p1Z = oz + sinR * 0.0846;
          const p2X = ox + cosR * 0.0846;
          const p2Z = oz - sinR * 0.0846;

          const curN1 = other.instanceState.weightsPiston1 ?? 0;
          const curN2 = other.instanceState.weightsPiston2 ?? 0;
          const simMetrics = computePascalSimulationMetrics(curN1, curN2);
          const pressBaseY = other.transform.positionM[1] ?? 0;
          const pan1LocalY =
            pressBaseY +
            (PAS_CYL_BOTTOM_Y +
              simMetrics.liquidHeight1Units +
              PAS_PISTON_HEAD_THICKNESS +
              PAS_ROD_LENGTH +
              PAS_PAN_THICKNESS) *
              PASCAL_WORLD_SCALE;
          const pan2LocalY =
            pressBaseY +
            (PAS_CYL_BOTTOM_Y +
              simMetrics.liquidHeight2Units +
              PAS_PISTON_HEAD_THICKNESS +
              PAS_ROD_LENGTH +
              PAS_PAN_THICKNESS) *
              PASCAL_WORLD_SCALE;

          let dist1 = Math.hypot(worldX - p1X, worldZ - p1Z);
          let dist2 = Math.hypot(worldX - p2X, worldZ - p2Z);
          if (pointerRay) {
            _elevatedRayPlane.constant = -(BENCH_SURFACE_Y + pan1LocalY);
            if (pointerRay.intersectPlane(_elevatedRayPlane, _elevatedIntersect)) {
              dist1 = Math.min(
                dist1,
                Math.hypot(_elevatedIntersect.x - p1X, _elevatedIntersect.z - p1Z),
              );
            }
            _elevatedRayPlane.constant = -(BENCH_SURFACE_Y + pan2LocalY);
            if (pointerRay.intersectPlane(_elevatedRayPlane, _elevatedIntersect)) {
              dist2 = Math.min(
                dist2,
                Math.hypot(_elevatedIntersect.x - p2X, _elevatedIntersect.z - p2Z),
              );
            }
          }

          if (dist1 <= dist2 && dist1 < 0.125) {
            const nextMetrics = computePascalSimulationMetrics(
              Math.min(8 - curN2, curN1 + 1),
              curN2,
            );
            return {
              pos: [
                Number(p1X.toFixed(3)),
                Number((pan1LocalY + 0.008).toFixed(3)),
                Number(p1Z.toFixed(3)),
              ],
              targetInstanceId: other.instanceId,
              slot: 'pascal-piston-1',
              hint:
                curN1 + curN2 < 8
                  ? `⚖️ Thả lên Đĩa Pit-tông (1) nhánh lớn S₁ = 20 cm² (n₁: ${curN1} → ${curN1 + 1} quả · Δh₁ = ${nextMetrics.deltaH1Cm > 0 ? '+' : ''}${nextMetrics.deltaH1Cm.toFixed(1)} cm, Δh₂ = ${nextMetrics.deltaH2Cm > 0 ? '+' : ''}${nextMetrics.deltaH2Cm.toFixed(1)} cm)`
                  : 'Đã sử dụng tối đa 8 quả nặng trên bộ thí nghiệm Pascal!',
              snapRingPos: [
                Number(p1X.toFixed(3)),
                Number(pan1LocalY.toFixed(3)),
                Number(p1Z.toFixed(3)),
              ],
            };
          }
          if (dist2 < 0.125) {
            const nextMetrics = computePascalSimulationMetrics(
              curN1,
              Math.min(8 - curN1, curN2 + 1),
            );
            return {
              pos: [
                Number(p2X.toFixed(3)),
                Number((pan2LocalY + 0.008).toFixed(3)),
                Number(p2Z.toFixed(3)),
              ],
              targetInstanceId: other.instanceId,
              slot: 'pascal-piston-2',
              hint:
                curN1 + curN2 < 8
                  ? `⚖️ Thả lên Đĩa Pit-tông (2) nhánh nhỏ S₂ = 10 cm² (n₂: ${curN2} → ${curN2 + 1} quả · Δh₁ = ${nextMetrics.deltaH1Cm > 0 ? '+' : ''}${nextMetrics.deltaH1Cm.toFixed(1)} cm, Δh₂ = ${nextMetrics.deltaH2Cm > 0 ? '+' : ''}${nextMetrics.deltaH2Cm.toFixed(1)} cm)`
                  : 'Đã sử dụng tối đa 8 quả nặng trên bộ thí nghiệm Pascal!',
              snapRingPos: [
                Number(p2X.toFixed(3)),
                Number(pan2LocalY.toFixed(3)),
                Number(p2Z.toFixed(3)),
              ],
            };
          }
        }

        // 3. Graduated Cylinder / Beaker / Overflow Can / Thermal Heating Vessel Submersion Docking (or Thermometer immersion!)
        if (
          (isSpecimenOrWeight || draggedArch === 'thermometer') &&
          (arch === 'graduated-cylinder' ||
            arch === 'overflow-can' ||
            arch === 'beaker-250' ||
            arch === 'beaker-bomex-100' ||
            arch === 'thermal-heating-vessel' ||
            arch === 'erlenmeyer-flask' ||
            arch === 'porcelain-dish' ||
            arch === 'distillation-flask')
        ) {
          const vesselBaseY = other.transform.positionM[1] ?? 0;
          let dist = Math.hypot(worldX - ox, worldZ - oz);
          if (pointerRay && vesselBaseY > 0.02) {
            _elevatedRayPlane.constant = -(BENCH_SURFACE_Y + vesselBaseY + 0.08);
            if (pointerRay.intersectPlane(_elevatedRayPlane, _elevatedIntersect)) {
              const elevDist = Math.hypot(
                _elevatedIntersect.x - ox,
                _elevatedIntersect.z - oz,
              );
              dist = Math.min(dist, elevDist);
            }
          }
          if (dist < 0.13) {
            if (draggedArch === 'thermometer') {
              const targetTemp =
                typeof other.instanceState.temperatureC === 'number'
                  ? other.instanceState.temperatureC
                  : (arch === 'porcelain-dish' || arch === 'distillation-flask') &&
                      other.instanceState.isHeating !== false
                    ? 78.5
                    : 25.0;
              return {
                pos: [ox, Number((vesselBaseY + 0.018).toFixed(3)), oz],
                targetInstanceId: other.instanceId,
                slot: 'inside-vessel',
                hint: `🌡️ Cắm Nhiệt kế vào giá đỡ & nhúng bầu đo vào ${otherAsset.name.vi} (T = ${targetTemp.toFixed(1)} °C)`,
                snapRingPos: [ox, vesselBaseY + 0.106, oz],
              };
            }
            const volVal =
              draggedAsset.scientificProperties.referenceVolume?.value ?? 24.5;
            const existingInVessel = instancesRef.current.filter(
              (item) =>
                item.visible &&
                item.instanceId !== draggedInst.instanceId &&
                item.instanceState.attachedToInstanceId === other.instanceId &&
                item.instanceState.attachmentSlot === 'inside-vessel',
            );
            let existingVol = 0;
            for (const sItem of existingInVessel) {
              const sAsset = assetsMapRef.current.get(sItem.assetId);
              if (sAsset?.geometry.proceduralArchetype !== 'thermometer') {
                existingVol +=
                  sAsset?.scientificProperties.referenceVolume?.value ?? 24.5;
              }
            }
            const totalDeltaV = existingVol + volVal;
            return {
              pos: [ox, 0.016, oz],
              targetInstanceId: other.instanceId,
              slot: 'inside-vessel',
              hint:
                existingInVessel.length > 0
                  ? `Thả thêm vào ${otherAsset.name.vi} (+${volVal.toFixed(1)} cm³ → Tổng ΔV = +${totalDeltaV.toFixed(1)} cm³)`
                  : `Thả chìm vào ${otherAsset.name.vi} (ΔV = +${volVal.toFixed(1)} cm³)`,
              snapRingPos: [ox, 0.004, oz],
            };
          }
        }

        // 4. Spring Dynamometer Hook Docking (Measure cumulative Force P = sum(m) * g)
        if (isSpecimenOrWeight && arch === 'spring-dynamometer') {
          const dist = Math.hypot(worldX - ox, worldZ - oz);
          if (dist < 0.105) {
            const massG =
              draggedAsset.scientificProperties.referenceMass?.value ?? 66.25;
            const existingOnHook = instancesRef.current.filter(
              (item) =>
                item.visible &&
                item.instanceId !== draggedInst.instanceId &&
                item.instanceState.attachedToInstanceId === other.instanceId &&
                item.instanceState.attachmentSlot === 'dynamometer-hook',
            );
            let existingMass = 0;
            for (const hItem of existingOnHook) {
              const hAsset = assetsMapRef.current.get(hItem.assetId);
              existingMass +=
                hAsset?.scientificProperties.referenceMass?.value ?? 66.25;
            }
            const totalForceN = ((existingMass + massG) * 0.00981).toFixed(2);
            return {
              pos: [ox, 0.025, oz + 0.018],
              targetInstanceId: other.instanceId,
              slot: 'dynamometer-hook',
              hint:
                existingOnHook.length > 0
                  ? `Móc thêm vào Lực kế lò xo (Tổng trọng lượng P = ${totalForceN} N)`
                  : `Móc vào Lực kế lò xo (Trọng lượng P = ${totalForceN} N)`,
              snapRingPos: [ox, 0.004, oz],
            };
          }
        }

        // 5. Vernier Caliper Jaws Docking (Measure Diameter / Width in mm)
        if (isSpecimenOrWeight && arch === 'vernier-caliper') {
          const dist = Math.hypot(worldX - ox, worldZ - oz);
          if (dist < 0.118) {
            const widthMm = (
              draggedAsset.geometry.boundingBoxM.width * 1000
            ).toFixed(1);
            return {
              pos: [ox - 0.045, 0.008, oz + 0.024],
              targetInstanceId: other.instanceId,
              slot: 'caliper-jaws',
              hint: `Kẹp đo kích thước bằng Thước cặp (d = ${widthMm} mm)`,
              snapRingPos: [ox - 0.045, 0.004, oz + 0.024],
            };
          }
        }
      }

      // 5B. Back 2-Tier Glass Shelf Docking — Đặt dụng cụ lên Kệ kính 2 tầng đối diện bàn (Z = -0.68), giữ nguyên kích thước 1:1 và có thể kéo lấy ra bất cứ lúc nào!
      if (
        Math.abs(worldX - CABINET_POS_X) < 0.80 &&
        worldZ < -0.46
      ) {
        const snapX = Number(
          THREE.MathUtils.clamp(
            worldX,
            CABINET_POS_X - 0.72,
            CABINET_POS_X + 0.72,
          ).toFixed(3),
        );
        const curObj = instanceObjectsRef.current.get(draggedInst.instanceId);
        const isUpperTier =
          (curObj ? curObj.position.y - BENCH_SURFACE_Y : draggedInst.transform.positionM[1]) > 0.14;
        const tierY = isUpperTier ? 0.268 : 0.024;
        const tierLabel = isUpperTier ? 'Tầng 2' : 'Tầng 1';
        return {
          pos: [snapX, tierY, CABINET_POS_Z + 0.02],
          targetInstanceId: null,
          slot: 'side-shelf',
          hint: `📚 Đặt "${draggedInst.customLabel || draggedAsset.name.vi}" lên Kệ Kính 2 Tầng (${tierLabel}) — Giữ nguyên kích thước 1:1 & kéo lấy ra tự do`,
          snapRingPos: [snapX, tierY + 0.004, CABINET_POS_Z + 0.02],
        };
      }

      // 5C. Left / Right 2-Tier Wooden Side Shelves Docking (Hai kệ bên có thể để đồ bất kỳ chỗ nào trên mặt kệ)
      if (Math.abs(worldX) > 1.06 && worldZ >= -0.46 && worldZ <= 0.28) {
        const isLeftShelf = worldX < 0;
        const clampedShelfX = Number(
          (isLeftShelf
            ? THREE.MathUtils.clamp(worldX, -1.92, -1.12)
            : THREE.MathUtils.clamp(worldX, 1.12, 1.92)
          ).toFixed(3),
        );
        const clampedShelfZ = Number(
          THREE.MathUtils.clamp(worldZ, -0.41, 0.21).toFixed(3),
        );
        const curObj = instanceObjectsRef.current.get(draggedInst.instanceId);
        const isUpperTier =
          (curObj ? curObj.position.y - BENCH_SURFACE_Y : draggedInst.transform.positionM[1]) > 0.14;
        const tierY = isUpperTier ? 0.26 : 0.0;
        const sideLabel = isLeftShelf ? 'Kệ Gỗ Bên Trái' : 'Kệ Gỗ Bên Phải';
        const tierLabel = isUpperTier ? 'Tầng 2 (+26cm)' : 'Tầng 1';
        return {
          pos: [clampedShelfX, tierY, clampedShelfZ],
          targetInstanceId: null,
          slot: 'side-shelf',
          hint: `📚 Đặt "${draggedInst.customLabel || draggedAsset.name.vi}" lên ${sideLabel} — ${tierLabel} (vị trí tự do)`,
          snapRingPos: [clampedShelfX, tierY + 0.004, clampedShelfZ],
        };
      }

      // 6. Real Physical Bench Collision Resolution (Di chuyển toàn bộ mặt bàn 2.00×1.00m)
      let resolvedX = THREE.MathUtils.clamp(worldX, -BENCH_LIMIT_X, BENCH_LIMIT_X);
      let resolvedZ = THREE.MathUtils.clamp(worldZ, -BENCH_LIMIT_Z, BENCH_LIMIT_Z);
      const draggedRadius =
        Math.max(
          draggedAsset.geometry.boundingBoxM.width,
          draggedAsset.geometry.boundingBoxM.depth,
        ) * 0.46;

      for (let pass = 0; pass < 2; pass++) {
        for (const other of instancesRef.current) {
          if (
            other.instanceId === draggedInst.instanceId ||
            !other.visible ||
            other.instanceState.attachedToInstanceId
          ) {
            continue;
          }
          const otherAsset = assetsMapRef.current.get(other.assetId);
          if (!otherAsset) continue;
          const otherRadius =
            Math.max(
              otherAsset.geometry.boundingBoxM.width,
              otherAsset.geometry.boundingBoxM.depth,
            ) * 0.46;
          const minSep = draggedRadius + otherRadius + 0.008;
          const dx = resolvedX - other.transform.positionM[0];
          const dz = resolvedZ - other.transform.positionM[2];
          const dist = Math.hypot(dx, dz);
          if (dist < minSep) {
            const nx = dist > 0.0001 ? dx / dist : 1;
            const nz = dist > 0.0001 ? dz / dist : 0;
            resolvedX = other.transform.positionM[0] + nx * minSep;
            resolvedZ = other.transform.positionM[2] + nz * minSep;
            resolvedX = THREE.MathUtils.clamp(resolvedX, -BENCH_LIMIT_X, BENCH_LIMIT_X);
            resolvedZ = THREE.MathUtils.clamp(resolvedZ, -BENCH_LIMIT_Z, BENCH_LIMIT_Z);
          }
        }
      }

      return {
        pos: [resolvedX, 0.022, resolvedZ], // Lifted +2.2cm while in hand
        targetInstanceId: null,
        slot: 'bench',
        hint: null,
        snapRingPos: null,
      };
    }

    // Track active touch/mouse pointers for tap-vs-drag disambiguation, native 2-finger pinch zoom (iOS/Android), and touch double-tap Lift/Rotate
    const activePointerIds = new Set<number>();
    const activeTouchPoints = new Map<number, { x: number; y: number }>();
    let pinchState: {
      prevDist: number;
      prevMidX: number;
      prevMidY: number;
    } | null = null;
    let suppressTouchUntilAllUp = false;
    let lastTouchTap: {
      time: number;
      clientX: number;
      clientY: number;
      instanceId: string | null;
    } | null = null;
    let lastTouchDoubleTapTime = 0;
    let lastPointerWasTouch = false;
    const _pinchOffset = new THREE.Vector3();
    const _pinchPanRight = new THREE.Vector3();
    const _pinchPanUp = new THREE.Vector3();
    const _pinchCamDir = new THREE.Vector3();

    const toggleMobileDualAxisGizmo = (targetInstId: string) => {
      const targetInst = instancesRef.current.find(
        (i) => i.instanceId === targetInstId,
      );
      if (!targetInst) return;
      selectedInstanceIdRef.current = targetInstId;
      onSelectInstanceRef.current(targetInstId);
      setViewportContextMenu(null);
      setDeviceSheetMode('collapsed');
      labSoundEngine.play('ui-toggle', 0.85);

      if (dualAxisGizmoIdRef.current === targetInstId) {
        triggerFreeFallIfElevated(targetInstId);
        setDualAxisGizmoInstanceId(null);
      } else {
        if (dualAxisGizmoIdRef.current) {
          triggerFreeFallIfElevated(dualAxisGizmoIdRef.current);
        }
        const gObj = instanceObjectsRef.current.get(targetInstId);
        const curLocalY = Math.max(
          0,
          gObj
            ? gObj.position.y - BENCH_SURFACE_Y
            : targetInst.transform.positionM[1],
        );
        const restingY =
          Math.abs(targetInst.transform.positionM[0]) > 1.15 && curLocalY >= 0.2
            ? 0.26
            : 0;
        gravityPhysicsRef.current.set(targetInstId, {
          vy: 0,
          falling: false,
          restingY,
        });
        setDualAxisGizmoInstanceId(targetInstId);
        setMobileGizmoTick((t) => t + 1);
      }
      requestRender();
    };

    let pendingGrab: {
      instanceId: string;
      pointerId: number;
      startClientX: number;
      startClientY: number;
      grabOffsetX: number;
      grabOffsetZ: number;
      hitSubAction?:
        | 'knife-switch'
        | 'alcohol-burner'
        | 'SLOT_1'
        | 'SLOT_2'
        | 'pascal-piston-1'
        | 'pascal-piston-2'
        | 'pascal-weight-pool';
      hitPascalWeightIdx?: number;
      hitPascalWeightZone?: 'pool' | 'piston-1' | 'piston-2';
    } | null = null;
    let emptyTapStart: {
      pointerId: number;
      startClientX: number;
      startClientY: number;
    } | null = null;
    let activeGizmoDrag: {
      mode: 'vertical' | 'rotate';
      instanceId: string;
      startClientX: number;
      startClientY: number;
      startWorldY: number;
      startRotY: number;
    } | null = null;
    let activeRheostatDrag: {
      instanceId: string;
      startClientX: number;
      startRatio: number;
    } | null = null;

    const hideUnderCabinetHighlights = () => {
      const hlLeft = scene.getObjectByName('under_cabinet_highlight_left');
      const hlRight = scene.getObjectByName('under_cabinet_highlight_right');
      if (hlLeft) hlLeft.visible = false;
      if (hlRight) hlRight.visible = false;
    };

    const cancelActiveOrPendingDrag = () => {
      pendingGrab = null;
      activeGizmoDrag = null;
      activeRheostatDrag = null;
      if (activePascalWeightDrag) {
        activePascalWeightDrag = null;
        orbit.enabled = true;
        renderer.domElement.style.cursor = 'default';
        setActiveDockHint(null);
        if (snapTargetRingRef.current) snapTargetRingRef.current.visible = false;
        requestRender();
      }
      const ds = dragStateRef.current;
      if (ds.isDragging) {
        ds.isDragging = false;
        ds.instanceId = null;
        orbit.enabled = true;
        renderer.domElement.style.cursor = 'default';
        setActiveDockHint(null);
        if (snapTargetRingRef.current) snapTargetRingRef.current.visible = false;
        if (pouringStreamRef.current) pouringStreamRef.current.visible = false;
        const cabGlow = scene.getObjectByName('cabinet_drop_glow');
        if (cabGlow) cabGlow.visible = false;
        hideUnderCabinetHighlights();
        requestRender();
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (viewModeRef.current === 'single-asset') return;
      if (e.target !== renderer.domElement) return;
      lastPointerWasTouch = e.pointerType === 'touch';
      activePointerIds.add(e.pointerId);

      if (e.pointerType === 'touch') {
        activeTouchPoints.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      // Nếu có từ 2 ngón tay chạm trở lên (pinch-zoom / 2-finger pan trên iOS & Android):
      // hủy kéo vật thể và thực hiện phóng to / thu nhỏ 2 ngón mượt mà trực tiếp
      if (activeTouchPoints.size >= 2 || activePointerIds.size > 1) {
        emptyTapStart = null;
        lastTouchTap = null;
        suppressTouchUntilAllUp = true;
        cancelActiveOrPendingDrag();
        cameraGoalPosRef.current = null;
        cameraGoalTargetRef.current = null;
        if (activeTouchPoints.size >= 2) {
          const pts = Array.from(activeTouchPoints.values());
          const p0 = pts[0];
          const p1 = pts[1];
          pinchState = {
            prevDist: Math.hypot(p1.x - p0.x, p1.y - p0.y),
            prevMidX: (p0.x + p1.x) * 0.5,
            prevMidY: (p0.y + p1.y) * 0.5,
          };
          orbit.enabled = false;
        }
        return;
      }

      if (e.pointerType === 'touch' && suppressTouchUntilAllUp) {
        return;
      }

      if (e.button !== 0) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouseNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseNdc, camera);

      // 0. Kiểm tra kéo Trục Đứng (Xanh) hoặc Vành Xoay (Vàng) của Dual-Axis Gizmo chuột phải
      if (
        dualAxisGizmoRef.current &&
        dualAxisGizmoRef.current.visible &&
        dualAxisGizmoIdRef.current
      ) {
        const gizmoHits = raycaster.intersectObjects(
          dualAxisGizmoRef.current.children,
          true,
        );
        if (gizmoHits.length > 0) {
          const gizmoPart = gizmoHits[0].object.userData?.gizmoPart as
            | 'vertical'
            | 'rotate'
            | undefined;
          const gObj = instanceObjectsRef.current.get(dualAxisGizmoIdRef.current);
          if (gizmoPart && gObj) {
            orbit.enabled = false;
            const phys = gravityPhysicsRef.current.get(dualAxisGizmoIdRef.current);
            if (phys) {
              phys.falling = false;
              phys.vy = 0;
            }
            activeGizmoDrag = {
              mode: gizmoPart,
              instanceId: dualAxisGizmoIdRef.current,
              startClientX: e.clientX,
              startClientY: e.clientY,
              startWorldY: gObj.position.y,
              startRotY: gObj.rotation.y,
            };
            renderer.domElement.style.cursor = 'grabbing';
            labSoundEngine.play('grab-pickup', 0.7);
            requestRender();
            return;
          }
        }
      }

      // Đưa toàn bộ thiết bị đang hiển thị (kể cả đã khóa) vào danh sách kiểm tra tia
      // để vật đang khóa ở phía trước chặn tia, không kéo nhầm vật bị che khuất phía sau.
      const pickables: THREE.Object3D[] = [];
      instanceObjectsRef.current.forEach((group, instId) => {
        const inst = instancesRef.current.find((i) => i.instanceId === instId);
        if (inst && inst.visible) {
          pickables.push(group);
        }
      });

      const hits = intersectEquipmentPrecisely(pickables);

      // 0.5. Kiểm tra xem người dùng có nhấp trực tiếp vào Dây Điện Bắp Chuối 3D để rút dây không
      if (
        circuitWiresGroupRef.current &&
        circuitWiresGroupRef.current.children.length > 0
      ) {
        const wireHits = raycaster.intersectObjects(
          circuitWiresGroupRef.current.children,
          true,
        );
        if (
          wireHits.length > 0 &&
          (hits.length === 0 || wireHits[0].distance <= hits[0].distance + 0.012)
        ) {
          let wNode: THREE.Object3D | null = wireHits[0].object;
          while (wNode && !wNode.userData?.wireId) {
            wNode = wNode.parent;
          }
          const hitWireId = wNode?.userData?.wireId as string | undefined;
          let isHittingTerminalDirectly = false;
          if (hits.length > 0) {
            let tNode: THREE.Object3D | null = hits[0].object;
            while (tNode && !tNode.userData?.instanceId) {
              if (tNode.userData?.isTerminal) {
                isHittingTerminalDirectly = true;
                break;
              }
              tNode = tNode.parent;
            }
          }
          if (hitWireId && !isHittingTerminalDirectly) {
            const removedWire = circuitWiresRef.current.find(
              (w) => w.id === hitWireId,
            );
            setCircuitWires((prev) => prev.filter((w) => w.id !== hitWireId));
            labSoundEngine.play('ui-toggle', 0.85);
            if (removedWire) {
              onNotifyRef.current(
                `✂️ Đã rút dây điện nối giữa [${removedWire.fromTerminalId}] và [${removedWire.toTerminalId}].`,
                'info',
              );
            }
            requestRender();
            return;
          }
        }
      }

      if (hits.length > 0) {
        emptyTapStart = null;
        let curr: THREE.Object3D | null = hits[0].object;
        let detectedTerminalId: CircuitTerminalId | null = null;
        let detectedRheostatWiper = false;
        let detectedSubAction:
          | 'knife-switch'
          | 'alcohol-burner'
          | 'SLOT_1'
          | 'SLOT_2'
          | 'pascal-piston-1'
          | 'pascal-piston-2'
          | 'pascal-weight-pool'
          | undefined;
        let detectedPascalWeightIdx: number | undefined;
        let detectedPascalWeightZone: 'pool' | 'piston-1' | 'piston-2' | undefined;

        while (curr && !curr.userData?.instanceId) {
          if (curr.userData?.isTerminal && curr.userData?.terminalId) {
            detectedTerminalId = curr.userData.terminalId as CircuitTerminalId;
          }
          if (curr.userData?.isRheostatWiper) {
            detectedRheostatWiper = true;
          }
          if (curr.userData?.isKnifeSwitchToggle) {
            detectedSubAction = 'knife-switch';
          }
          if (curr.userData?.isAlcoholBurnerToggle) {
            detectedSubAction = 'alcohol-burner';
          }
          if (
            curr.userData?.isPascalWeightItem &&
            typeof curr.userData?.weightIndex === 'number' &&
            detectedPascalWeightIdx === undefined
          ) {
            detectedPascalWeightIdx = curr.userData.weightIndex as number;
            detectedPascalWeightZone =
              (curr.userData.pascalZone as 'pool' | 'piston-1' | 'piston-2') ||
              'pool';
          }
          if (curr.userData?.isPascalPiston1) {
            detectedSubAction = 'pascal-piston-1';
          } else if (curr.userData?.isPascalPiston2) {
            detectedSubAction = 'pascal-piston-2';
          } else if (curr.userData?.isPascalWeightPool) {
            detectedSubAction = 'pascal-weight-pool';
          }
          if (
            curr.userData?.isBatterySlot &&
            (curr.userData?.slotId === 'SLOT_1' || curr.userData?.slotId === 'SLOT_2')
          ) {
            detectedSubAction = curr.userData.slotId;
          }
          curr = curr.parent;
        }
        const hitInstId = curr?.userData?.instanceId as string | undefined;

        // Nếu tia ray xuyên qua thành ống thủy tinh trong suốt của Bình thông nhau Pascal,
        // kiểm tra các hit phía sau thành kính (cùng instanceId) để bắt chính xác Quả nặng hoặc Pit-tông bên trong ống!
        if (hitInstId && detectedPascalWeightIdx === undefined) {
          for (let hIdx = 1; hIdx < hits.length; hIdx++) {
            if (hits[hIdx].distance > hits[0].distance + 0.14) break;
            let node: THREE.Object3D | null = hits[hIdx].object;
            let subWIdx: number | undefined;
            let subWZone: 'pool' | 'piston-1' | 'piston-2' | undefined;
            let subAct:
              | 'pascal-piston-1'
              | 'pascal-piston-2'
              | 'pascal-weight-pool'
              | undefined;
            while (node && !node.userData?.instanceId) {
              if (
                node.userData?.isPascalWeightItem &&
                typeof node.userData?.weightIndex === 'number' &&
                subWIdx === undefined
              ) {
                subWIdx = node.userData.weightIndex as number;
                subWZone =
                  (node.userData.pascalZone as 'pool' | 'piston-1' | 'piston-2') ||
                  'pool';
              }
              if (node.userData?.isPascalPiston1 && !subAct) {
                subAct = 'pascal-piston-1';
              } else if (node.userData?.isPascalPiston2 && !subAct) {
                subAct = 'pascal-piston-2';
              } else if (node.userData?.isPascalWeightPool && !subAct) {
                subAct = 'pascal-weight-pool';
              }
              node = node.parent;
            }
            if (node?.userData?.instanceId === hitInstId) {
              if (subWIdx !== undefined) {
                detectedPascalWeightIdx = subWIdx;
                detectedPascalWeightZone = subWZone;
                if (subAct) detectedSubAction = subAct;
                break;
              }
              if (subAct && !detectedSubAction) {
                detectedSubAction = subAct;
              }
            }
          }
        }

        if (hitInstId) {
          // Nếu người dùng chạm vào Đĩa Pit-tông (1), (2) hoặc Khay quả nặng mà không trúng trực tiếp mesh quả nặng:
          // Tự động ánh xạ tới quả nặng trên cùng của Pit-tông đó (hoặc quả nặng đầu tiên trong khay) để có thể kéo đi ngay!
          const hitInst = instancesRef.current.find((i) => i.instanceId === hitInstId);
          const hitAsset = hitInst ? assetsMapRef.current.get(hitInst.assetId) : undefined;
          if (
            hitInst &&
            hitAsset?.geometry.proceduralArchetype === 'pascal-hydraulic-press' &&
            detectedPascalWeightIdx === undefined
          ) {
            const n1 = hitInst.instanceState.weightsPiston1 ?? 0;
            const n2 = hitInst.instanceState.weightsPiston2 ?? 0;
            if (detectedSubAction === 'pascal-piston-1' && n1 > 0) {
              detectedPascalWeightIdx = n1 - 1;
              detectedPascalWeightZone = 'piston-1';
            } else if (detectedSubAction === 'pascal-piston-2' && n2 > 0) {
              detectedPascalWeightIdx = n1 + n2 - 1;
              detectedPascalWeightZone = 'piston-2';
            } else if (detectedSubAction === 'pascal-weight-pool' && n1 + n2 < 8) {
              detectedPascalWeightIdx = n1 + n2;
              detectedPascalWeightZone = 'pool';
            }
          }

          // Nếu người dùng nhấp trực tiếp vào CỌC CẮM ĐIỆN 3D (TERMINAL) -> Chọn cọc / Nối dây điện bắp chuối!
          if (detectedTerminalId) {
            handleTerminalSocketPickRef.current(hitInstId, detectedTerminalId);
            return;
          }

          // Nếu người dùng nắm kéo CON CHẠY BIẾN TRỞ 20Ω (RHEOSTAT WIPER) -> Trượt thay đổi R_rheo trực tiếp!
          if (detectedRheostatWiper) {
            const rInst = instancesRef.current.find((i) => i.instanceId === hitInstId);
            orbit.enabled = false;
            activeRheostatDrag = {
              instanceId: hitInstId,
              startClientX: e.clientX,
              startClientY: e.clientY,
              startRatio: rInst?.instanceState.sliderRatio ?? 0.5,
            } as typeof activeRheostatDrag;
            renderer.domElement.style.cursor = 'ew-resize';
            labSoundEngine.play('grab-pickup', 0.7);
            requestRender();
            return;
          }

          // Nếu đang mở gizmo 2 trục trên vật phẩm khác thì đóng gizmo và cho vật đó rơi tự do xuống!
          if (
            dualAxisGizmoIdRef.current &&
            dualAxisGizmoIdRef.current !== hitInstId
          ) {
            triggerFreeFallIfElevated(dualAxisGizmoIdRef.current);
            setDualAxisGizmoInstanceId(null);
          }

          if (selectedInstanceIdRef.current !== hitInstId) {
            selectedInstanceIdRef.current = hitInstId;
            onSelectInstanceRef.current(hitInstId);
          }

          // Chuẩn bị kéo vật thể (hoặc kéo từng quả nặng trên Bình thông nhau Pascal) khi con trỏ đặt chính xác lên vật không bị khóa
          // Trên cảm ứng (iOS/Android), 1 ngón chạm & kéo vật thể LUÔN di chuyển vật một cách tự nhiên
          if (
            (e.pointerType === 'touch' || toolModeRef.current !== 'rotate') &&
            hitInst &&
            !hitInst.locked
          ) {
            const obj = instanceObjectsRef.current.get(hitInstId);
            if (obj && raycaster.ray.intersectPlane(_rayPlane, _dragIntersect)) {
              orbit.enabled = false;
              pendingGrab = {
                instanceId: hitInstId,
                pointerId: e.pointerId,
                startClientX: e.clientX,
                startClientY: e.clientY,
                grabOffsetX: obj.position.x - _dragIntersect.x,
                grabOffsetZ: obj.position.z - _dragIntersect.z,
                hitSubAction: detectedSubAction,
                hitPascalWeightIdx: detectedPascalWeightIdx,
                hitPascalWeightZone: detectedPascalWeightZone,
              };
            }
          }
        }
      } else {
        // Nếu click ra ngoài khi đang mở gizmo 2 trục -> đóng gizmo và kích hoạt rơi tự do có trọng lực!
        if (dualAxisGizmoIdRef.current) {
          triggerFreeFallIfElevated(dualAxisGizmoIdRef.current);
          setDualAxisGizmoInstanceId(null);
        }
        pendingGrab = null;
        emptyTapStart = {
          pointerId: e.pointerId,
          startClientX: e.clientX,
          startClientY: e.clientY,
        };
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (viewModeRef.current === 'single-asset') return;
      // Trên điện thoại cảm ứng (iOS / Android): không bật menu chuột phải dài che phòng thí nghiệm
      if (lastPointerWasTouch || window.innerWidth < 768) {
        e.preventDefault();
        return;
      }
      const rect = renderer.domElement.getBoundingClientRect();
      mouseNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseNdc, camera);
      const pickables: THREE.Object3D[] = [];
      instanceObjectsRef.current.forEach((group, instId) => {
        const inst = instancesRef.current.find((i) => i.instanceId === instId);
        if (inst && inst.visible) {
          pickables.push(group);
        }
      });

      const hits = intersectEquipmentPrecisely(pickables);
      if (hits.length > 0) {
        let curr: THREE.Object3D | null = hits[0].object;
        while (curr && !curr.userData?.instanceId) {
          curr = curr.parent;
        }
        const hitInstId = curr?.userData?.instanceId as string | undefined;
        const hitInst = hitInstId
          ? instancesRef.current.find((i) => i.instanceId === hitInstId)
          : undefined;
        const hitAsset = hitInst
          ? assetsMapRef.current.get(hitInst.assetId)
          : undefined;

        if (hitInst && hitAsset) {
          e.preventDefault();
          e.stopPropagation();
          selectedInstanceIdRef.current = hitInst.instanceId;
          onSelectInstanceRef.current(hitInst.instanceId);
          labSoundEngine.play('ui-toggle', 0.85);

          // Chuẩn openlan3dmixxx.vercel.app: Chuột phải bật/tắt 2 Trục Điều Khiển 3D (Trục đứng nâng lên cao + Vành xoay ngang)
          if (dualAxisGizmoIdRef.current === hitInst.instanceId) {
            triggerFreeFallIfElevated(hitInst.instanceId);
            setDualAxisGizmoInstanceId(null);
            setViewportContextMenu(null);
          } else {
            if (dualAxisGizmoIdRef.current) {
              triggerFreeFallIfElevated(dualAxisGizmoIdRef.current);
            }
            const gObj = instanceObjectsRef.current.get(hitInst.instanceId);
            const curLocalY = Math.max(
              0,
              (gObj ? gObj.position.y - BENCH_SURFACE_Y : hitInst.transform.positionM[1]),
            );
            const restingY =
              Math.abs(hitInst.transform.positionM[0]) > 1.15 && curLocalY >= 0.2
                ? 0.26
                : 0;
            gravityPhysicsRef.current.set(hitInst.instanceId, {
              vy: 0,
              falling: false,
              restingY,
            });
            setDualAxisGizmoInstanceId(hitInst.instanceId);
            setViewportContextMenu({
              instanceId: hitInst.instanceId,
              asset: hitAsset,
              customLabel: hitInst.customLabel,
              x: Math.min(e.clientX, window.innerWidth - 265),
              y: Math.min(e.clientY, window.innerHeight - 230),
            });
          }
          requestRender();
        }
      } else if (dualAxisGizmoIdRef.current) {
        e.preventDefault();
        triggerFreeFallIfElevated(dualAxisGizmoIdRef.current);
        setDualAxisGizmoInstanceId(null);
        setViewportContextMenu(null);
        requestRender();
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (viewModeRef.current === 'single-asset') return;

      if (e.pointerType === 'touch' && activeTouchPoints.has(e.pointerId)) {
        activeTouchPoints.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      // Phóng to / thu nhỏ bằng 2 ngón tay (Pinch-to-Zoom mượt mà cho cả iOS Safari & Android Chrome)
      if (activeTouchPoints.size >= 2) {
        const pts = Array.from(activeTouchPoints.values());
        const p0 = pts[0];
        const p1 = pts[1];
        const currDist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
        const currMidX = (p0.x + p1.x) * 0.5;
        const currMidY = (p0.y + p1.y) * 0.5;

        if (pinchState && pinchState.prevDist > 8 && currDist > 8) {
          const zoomRatio = THREE.MathUtils.clamp(
            pinchState.prevDist / currDist,
            0.72,
            1.38,
          );
          _pinchOffset.subVectors(camera.position, orbit.target);
          const curLen = _pinchOffset.length();
          const nextLen = THREE.MathUtils.clamp(
            curLen * zoomRatio,
            orbit.minDistance + 0.04,
            orbit.maxDistance - 0.1,
          );
          if (curLen > 1e-4) {
            _pinchOffset.multiplyScalar(nextLen / curLen);
          }

          // Dịch chuyển nhẹ góc nhìn khi 2 ngón tay trượt song song
          const dxMid = currMidX - pinchState.prevMidX;
          const dyMid = currMidY - pinchState.prevMidY;
          if (Math.hypot(dxMid, dyMid) > 0.5) {
            camera.getWorldDirection(_pinchCamDir);
            _pinchPanRight.crossVectors(_pinchCamDir, camera.up).normalize();
            _pinchPanUp.crossVectors(_pinchPanRight, _pinchCamDir).normalize();
            const panScale = nextLen * 0.0012;
            orbit.target.addScaledVector(_pinchPanRight, -dxMid * panScale);
            orbit.target.addScaledVector(_pinchPanUp, dyMid * panScale);
            orbit.target.x = THREE.MathUtils.clamp(orbit.target.x, -3.2, 3.2);
            orbit.target.y = THREE.MathUtils.clamp(
              orbit.target.y,
              BENCH_SURFACE_Y - 0.15,
              BENCH_SURFACE_Y + 1.5,
            );
            orbit.target.z = THREE.MathUtils.clamp(orbit.target.z, -2.0, 2.2);
          }

          camera.position.copy(orbit.target).add(_pinchOffset);
          camera.position.x = THREE.MathUtils.clamp(camera.position.x, -6.5, 6.5);
          camera.position.y = THREE.MathUtils.clamp(camera.position.y, 0.18, 3.9);
          camera.position.z = THREE.MathUtils.clamp(camera.position.z, -3.4, 5.7);

          const prevDamping = orbit.enableDamping;
          orbit.enableDamping = false;
          orbit.update();
          orbit.enableDamping = prevDamping;

          updateProjectedOverlays();
          requestRender();
        }

        pinchState = {
          prevDist: currDist,
          prevMidX: currMidX,
          prevMidY: currMidY,
        };
        return;
      }

      if (activePointerIds.size > 1 || (e.pointerType === 'touch' && suppressTouchUntilAllUp)) {
        return;
      }

      // Bảo vệ tuyệt đối: nếu chuột trái không còn được giữ nhấn, hủy ngay mọi trạng thái kéo đang chờ/đang chạy
      if (
        e.pointerType === 'mouse' &&
        (e.buttons & 1) === 0 &&
        (pendingGrab ||
          dragStateRef.current.isDragging ||
          activeGizmoDrag ||
          activeRheostatDrag ||
          activePascalWeightDrag)
      ) {
        cancelActiveOrPendingDrag();
      }

      const rect = renderer.domElement.getBoundingClientRect();
      mouseNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // 0. Xử lý đang kéo Con Chạy Biến Trở 20Ω (Rheostat Slider)
      if (activeRheostatDrag) {
        const dxPx = e.clientX - activeRheostatDrag.startClientX;
        const nextRatio = Number(
          THREE.MathUtils.clamp(activeRheostatDrag.startRatio + dxPx * 0.0055, 0, 1).toFixed(3),
        );
        const nextOhm = Number((nextRatio * 20).toFixed(2));
        onUpdateInstanceStateRef.current?.(activeRheostatDrag.instanceId, {
          sliderRatio: nextRatio,
          rheostatOhm: nextOhm,
        });
        requestRender();
        return;
      }

      // 0.1. Xử lý đang kéo Trục Đứng (Nâng lên cao) hoặc Vành Tròn (Xoay ngang) của Dual-Axis Gizmo
      if (activeGizmoDrag) {
        const gObj = instanceObjectsRef.current.get(activeGizmoDrag.instanceId);
        if (gObj) {
          if (activeGizmoDrag.mode === 'vertical') {
            const dyPx = activeGizmoDrag.startClientY - e.clientY;
            const newWorldY = THREE.MathUtils.clamp(
              activeGizmoDrag.startWorldY + dyPx * 0.0032,
              BENCH_SURFACE_Y,
              BENCH_SURFACE_Y + 1.15,
            );
            gObj.position.y = newWorldY;
            if (dualAxisGizmoRef.current) {
              dualAxisGizmoRef.current.position.copy(gObj.position);
            }
          } else if (activeGizmoDrag.mode === 'rotate') {
            const dxPx = e.clientX - activeGizmoDrag.startClientX;
            gObj.rotation.y = activeGizmoDrag.startRotY + dxPx * 0.014;
          }
          setMobileGizmoTick((t) => (t + 1) % 10000);
          updateProjectedOverlays();
          requestRender();
        }
        return;
      }

      const ds = dragStateRef.current;

      // 0.2. Kích hoạt kéo TỪNG QUẢ NẶNG trên Bộ Bình Thông Nhau Pascal (khi người dùng nắm kéo quả nặng từ khay hoặc từ đĩa pit-tông >= 5px)
      if (
        !activePascalWeightDrag &&
        !ds.isDragging &&
        pendingGrab &&
        pendingGrab.pointerId === e.pointerId &&
        pendingGrab.hitPascalWeightIdx !== undefined
      ) {
        const moveDist = Math.hypot(
          e.clientX - pendingGrab.startClientX,
          e.clientY - pendingGrab.startClientY,
        );
        if (moveDist >= 5) {
          const pInst = instancesRef.current.find(
            (i) => i.instanceId === pendingGrab!.instanceId,
          );
          if (pInst) {
            const startN1 = pInst.instanceState.weightsPiston1 ?? 0;
            const startN2 = pInst.instanceState.weightsPiston2 ?? 0;
            const sourceZone = pendingGrab.hitPascalWeightZone || 'pool';
            activePascalWeightDrag = {
              instanceId: pInst.instanceId,
              weightIndex: pendingGrab.hitPascalWeightIdx,
              sourceZone,
              startN1,
              startN2,
              previewN1: startN1,
              previewN2: startN2,
              hoverZone: sourceZone,
              localPos: [
                sourceZone === 'piston-1'
                  ? PAS_X1
                  : sourceZone === 'piston-2'
                    ? PAS_X2
                    : 0,
                3.2,
                sourceZone === 'pool' ? 2.5 : 0.4,
              ],
            };
            renderer.domElement.style.cursor = 'grabbing';
            setHoveredEquipment(null);
            setViewportContextMenu(null);
            equipmentImagePreviewController.hide('close');
            setDeviceSheetMode('collapsed');
            labSoundEngine.play('grab-pickup', 0.85);
            pendingGrab = null;
          }
        }
      }

      // 0.3. Đang kéo trực tiếp một Quả nặng 100g (1.0N) trên Bộ Bình Thông Nhau Pascal
      if (activePascalWeightDrag) {
        const pressObj = instanceObjectsRef.current.get(
          activePascalWeightDrag.instanceId,
        );
        const pressInst = instancesRef.current.find(
          (i) => i.instanceId === activePascalWeightDrag!.instanceId,
        );
        const scaledWorld = pressObj?.getObjectByName('pascal_scaled_world');
        if (pressObj && pressInst && scaledWorld) {
          raycaster.setFromCamera(mouseNdc, camera);
          scaledWorld.updateMatrixWorld(true);
          _pascalInvMat.copy(scaledWorld.matrixWorld).invert();
          _pascalLocalRay.copy(raycaster.ray).applyMatrix4(_pascalInvMat);

          // Giao điểm của tia chuột với mặt phẳng vuông góc hướng nhìn đi qua tâm vùng thao tác (0, 2.8, 1.0)
          _pascalPlaneNorm
            .subVectors(_pascalDragAnchor, _pascalLocalRay.origin)
            .normalize();
          _pascalDragPlane.setFromNormalAndCoplanarPoint(
            _pascalPlaneNorm,
            _pascalDragAnchor,
          );
          if (_pascalLocalRay.intersectPlane(_pascalDragPlane, _pascalLocalHit)) {
            activePascalWeightDrag.localPos = [
              THREE.MathUtils.clamp(_pascalLocalHit.x, -4.2, 4.2),
              THREE.MathUtils.clamp(_pascalLocalHit.y, 0.45, 8.2),
              THREE.MathUtils.clamp(_pascalLocalHit.z, -0.8, 3.6),
            ];
          }

          // Tính khoảng cách từ tia chuột tới trục Đĩa Pit-tông (1) nhánh lớn S₁ và Đĩa Pit-tông (2) nhánh nhỏ S₂
          const pan1Y =
            Number(scaledWorld.userData?.animPan1TopY) ||
            PAS_CYL_BOTTOM_Y +
              PAS_EQUILIBRIUM_LIQUID_H +
              PAS_PISTON_HEAD_THICKNESS +
              PAS_ROD_LENGTH +
              PAS_PAN_THICKNESS;
          const pan2Y =
            Number(scaledWorld.userData?.animPan2TopY) ||
            PAS_CYL_BOTTOM_Y +
              PAS_EQUILIBRIUM_LIQUID_H +
              PAS_PISTON_HEAD_THICKNESS +
              PAS_ROD_LENGTH +
              PAS_PAN_THICKNESS;

          _pascalSegA.set(PAS_X1, 1.8, 0);
          _pascalSegB.set(PAS_X1, pan1Y + 2.4, 0);
          const distSq1 = _pascalLocalRay.distanceSqToSegment(
            _pascalSegA,
            _pascalSegB,
          );

          _pascalSegA.set(PAS_X2, 1.8, 0);
          _pascalSegB.set(PAS_X2, pan2Y + 2.4, 0);
          const distSq2 = _pascalLocalRay.distanceSqToSegment(
            _pascalSegA,
            _pascalSegB,
          );

          const baseN1 =
            activePascalWeightDrag.sourceZone === 'piston-1'
              ? Math.max(0, activePascalWeightDrag.startN1 - 1)
              : activePascalWeightDrag.startN1;
          const baseN2 =
            activePascalWeightDrag.sourceZone === 'piston-2'
              ? Math.max(0, activePascalWeightDrag.startN2 - 1)
              : activePascalWeightDrag.startN2;

          const isNearTray =
            activePascalWeightDrag.localPos[1] < 1.35 &&
            activePascalWeightDrag.localPos[2] > 1.35;

          let nextHoverZone: 'pool' | 'piston-1' | 'piston-2' = 'pool';
          if (!isNearTray) {
            if (distSq1 <= distSq2 && distSq1 < 1.85 * 1.85) {
              nextHoverZone = 'piston-1';
            } else if (distSq2 < 1.65 * 1.65) {
              nextHoverZone = 'piston-2';
            }
          }

          if (nextHoverZone !== activePascalWeightDrag.hoverZone) {
            activePascalWeightDrag.hoverZone = nextHoverZone;
            labSoundEngine.play('dock-hover-snap', 0.65);
          }

          if (nextHoverZone === 'piston-1' && baseN1 + baseN2 < 8) {
            activePascalWeightDrag.previewN1 = baseN1 + 1;
            activePascalWeightDrag.previewN2 = baseN2;
          } else if (nextHoverZone === 'piston-2' && baseN1 + baseN2 < 8) {
            activePascalWeightDrag.previewN1 = baseN1;
            activePascalWeightDrag.previewN2 = baseN2 + 1;
          } else {
            activePascalWeightDrag.previewN1 = baseN1;
            activePascalWeightDrag.previewN2 = baseN2;
          }

          const previewMetrics = computePascalSimulationMetrics(
            activePascalWeightDrag.previewN1,
            activePascalWeightDrag.previewN2,
          );

          // Hiển thị vòng sáng neo (Snap Ring) trên đĩa Pit-tông đang được nhắm tới
          if (snapTargetRingRef.current) {
            if (nextHoverZone === 'piston-1' || nextHoverZone === 'piston-2') {
              const rotY = pressInst.transform.rotationRad[1] ?? 0;
              const branchSign = nextHoverZone === 'piston-1' ? -1 : 1;
              const ringWorldX =
                pressObj.position.x + Math.cos(rotY) * (branchSign * 0.0846);
              const ringWorldZ =
                pressObj.position.z - Math.sin(rotY) * (branchSign * 0.0846);
              const ringLocalY =
                nextHoverZone === 'piston-1'
                  ? (PAS_CYL_BOTTOM_Y +
                      previewMetrics.liquidHeight1Units +
                      PAS_PISTON_HEAD_THICKNESS +
                      PAS_ROD_LENGTH +
                      PAS_PAN_THICKNESS) *
                    PASCAL_WORLD_SCALE
                  : (PAS_CYL_BOTTOM_Y +
                      previewMetrics.liquidHeight2Units +
                      PAS_PISTON_HEAD_THICKNESS +
                      PAS_ROD_LENGTH +
                      PAS_PAN_THICKNESS) *
                    PASCAL_WORLD_SCALE;
              snapTargetRingRef.current.visible = true;
              snapTargetRingRef.current.position.set(
                ringWorldX,
                pressObj.position.y + ringLocalY,
                ringWorldZ,
              );
            } else {
              snapTargetRingRef.current.visible = false;
            }
          }

          if (nextHoverZone === 'piston-1') {
            setActiveDockHint(
              `⚖️ Đặt lên Nhánh lớn (1) S₁ = 20 cm² → n₁ = ${previewMetrics.n1} quả (${previewMetrics.f1N.toFixed(1)} N) · Δh₁ = ${previewMetrics.deltaH1Cm > 0 ? '+' : ''}${previewMetrics.deltaH1Cm.toFixed(1)} cm, Δh₂ = ${previewMetrics.deltaH2Cm > 0 ? '+' : ''}${previewMetrics.deltaH2Cm.toFixed(1)} cm`,
            );
          } else if (nextHoverZone === 'piston-2') {
            setActiveDockHint(
              `⚖️ Đặt lên Nhánh nhỏ (2) S₂ = 10 cm² → n₂ = ${previewMetrics.n2} quả (${previewMetrics.f2N.toFixed(1)} N) · Δh₁ = ${previewMetrics.deltaH1Cm > 0 ? '+' : ''}${previewMetrics.deltaH1Cm.toFixed(1)} cm, Δh₂ = ${previewMetrics.deltaH2Cm > 0 ? '+' : ''}${previewMetrics.deltaH2Cm.toFixed(1)} cm`,
            );
          } else {
            setActiveDockHint(
              `⚖️ Kéo thả quả nặng 100g (1.0N) lên Đĩa Pit-tông (1) S₁ hoặc Đĩa Pit-tông (2) S₂ (hoặc thả về Khay chứa) · Δh₁ = ${previewMetrics.deltaH1Cm > 0 ? '+' : ''}${previewMetrics.deltaH1Cm.toFixed(1)} cm, Δh₂ = ${previewMetrics.deltaH2Cm > 0 ? '+' : ''}${previewMetrics.deltaH2Cm.toFixed(1)} cm`,
            );
          }
          requestRender();
        }
        return;
      }

      // Kích hoạt kéo thực sự khi người dùng di chuyển tay >= 6px
      if (
        !ds.isDragging &&
        pendingGrab &&
        pendingGrab.pointerId === e.pointerId
      ) {
        const moveDist = Math.hypot(
          e.clientX - pendingGrab.startClientX,
          e.clientY - pendingGrab.startClientY,
        );
        if (moveDist >= 6) {
          const obj = instanceObjectsRef.current.get(pendingGrab.instanceId);
          if (obj) {
            if (dualAxisGizmoIdRef.current === pendingGrab.instanceId) {
              setDualAxisGizmoInstanceId(null);
            }
            const phys = gravityPhysicsRef.current.get(pendingGrab.instanceId);
            if (phys) {
              phys.falling = false;
              phys.vy = 0;
            }
            ds.isDragging = true;
            ds.instanceId = pendingGrab.instanceId;
            ds.grabOffsetX = pendingGrab.grabOffsetX;
            ds.grabOffsetZ = pendingGrab.grabOffsetZ;
            ds.lastX = obj.position.x;
            ds.lastZ = obj.position.z;
            ds.velX = 0;
            ds.velZ = 0;
            ds.targetPos.set(
              obj.position.x,
              obj.position.y + 0.018,
              obj.position.z,
            );
            ds.hoverTargetInstanceId = null;
            ds.hoverSlot = 'bench';
            ds.hoverHint = null;
            ds.manualTiltRad = 0;
            ds.hoverPourDwellSec = 0;
            renderer.domElement.style.cursor = 'grabbing';
            setHoveredEquipment(null);
            setViewportContextMenu(null);
            equipmentImagePreviewController.hide('close');
            setDeviceSheetMode('collapsed');
            labSoundEngine.play('grab-pickup', 0.85);
          }
          pendingGrab = null;
        }
      }

      if (ds.isDragging && ds.instanceId) {
        raycaster.setFromCamera(mouseNdc, camera);
        if (raycaster.ray.intersectPlane(_rayPlane, _dragIntersect)) {
          const rawX = _dragIntersect.x + ds.grabOffsetX;
          const rawZ = _dragIntersect.z + ds.grabOffsetZ;
          ds.velX = ds.velX * 0.45 + (rawX - ds.lastX) * 0.55;
          ds.velZ = ds.velZ * 0.45 + (rawZ - ds.lastZ) * 0.55;
          ds.lastX = rawX;
          ds.lastZ = rawZ;

          const draggedInst = instancesRef.current.find(
            (i) => i.instanceId === ds.instanceId,
          );
          const draggedAsset = draggedInst
            ? assetsMapRef.current.get(draggedInst.assetId)
            : undefined;

          if (draggedInst && draggedAsset) {
            let dock = evaluateLabDockingTarget(
              draggedInst,
              draggedAsset,
              rawX,
              rawZ,
              raycaster.ray,
            );

            // Kiểm tra xem tia chuột có đang trỏ trực tiếp vào Cánh Cửa Tủ (Trái/Phải), Kệ Gỗ 2 tầng (Trái/Phải) hoặc Kệ Kính 2 tầng phía sau không.
            // Lưu ý: Phải kéo thả NGAY CÁNH CỬA TỦ (`isUnderShelfCabinetDoor === true`) thì mới cất vào tủ trái hoặc phải!
            hideUnderCabinetHighlights();
            const canCheckFurnitureRay =
              dock.slot === 'bench' || dock.slot === 'side-shelf';
            const sideShelvesGrp = scene.getObjectByName('interactive_side_shelves_group');
            const shelfHits =
              canCheckFurnitureRay && sideShelvesGrp
                ? raycaster.intersectObject(sideShelvesGrp, true)
                : [];

            const backGlassShelfGrp = scene.getObjectByName('bench_storage_cabinet_group');
            const backShelfHits =
              canCheckFurnitureRay && backGlassShelfGrp
                ? raycaster.intersectObject(backGlassShelfGrp, true)
                : [];

            const underCabsGrp = scene.getObjectByName(
              'interactive_under_shelf_cabinets_group',
            );
            const doorHits =
              canCheckFurnitureRay && underCabsGrp
                ? raycaster
                    .intersectObject(underCabsGrp, true)
                    .filter((h) => Boolean(h.object.userData?.isUnderShelfCabinetDoor))
                : [];

            if (
              doorHits.length > 0 &&
              (shelfHits.length === 0 || doorHits[0].distance <= shelfHits[0].distance)
            ) {
              const doorObj = doorHits[0].object;
              const side: 'left' | 'right' | null =
                doorObj.userData?.underShelfCabinetSide === 'left' ||
                doorObj.userData?.cabinetSide === 'left'
                  ? 'left'
                  : doorObj.userData?.underShelfCabinetSide === 'right' ||
                      doorObj.userData?.cabinetSide === 'right'
                    ? 'right'
                    : null;
              if (side) {
                const hl = scene.getObjectByName(`under_cabinet_highlight_${side}`);
                if (hl) hl.visible = true;
                const cabX = side === 'left' ? -1.52 : 1.52;
                dock = {
                  pos: [cabX, -0.35, 0.23],
                  targetInstanceId: null,
                  slot:
                    side === 'left'
                      ? 'under-shelf-cabinet-left'
                      : 'under-shelf-cabinet-right',
                  hint: `🗄️ Thả ngay tại Cánh Cửa Tủ để cất "${draggedInst.customLabel || draggedAsset.name.vi}" vào Tủ Vật Phẩm ${side === 'left' ? 'Trái' : 'Phải'}`,
                  snapRingPos: null,
                };
              }
            } else if (shelfHits.length > 0) {
              // Cho phép đặt vật ở BẤT KỲ vị trí nào trên mặt Kệ Gỗ Trái hoặc Kệ Gỗ Phải (Tầng 1 hoặc Tầng 2) — giữ nguyên kích thước 1:1 và có thể kéo lấy ra!
              const hitPt = shelfHits[0].point;
              const isLeft = hitPt.x < 0;
              const hitLocalY = hitPt.y - BENCH_SURFACE_Y;
              const isUpperTier =
                shelfHits[0].object.userData?.tier === 2 || hitLocalY > 0.14;
              const tierY = isUpperTier ? 0.26 : 0.0;
              const freeX = Number(
                (isLeft
                  ? THREE.MathUtils.clamp(hitPt.x, -1.92, -1.12)
                  : THREE.MathUtils.clamp(hitPt.x, 1.12, 1.92)
                ).toFixed(3),
              );
              const freeZ = Number(
                THREE.MathUtils.clamp(
                  hitPt.z,
                  isUpperTier ? -0.31 : -0.41,
                  isUpperTier ? -0.01 : 0.21,
                ).toFixed(3),
              );
              const sideLabel = isLeft ? 'Kệ Gỗ Bên Trái' : 'Kệ Gỗ Bên Phải';
              const tierLabel = isUpperTier ? 'Tầng 2 (+26cm)' : 'Tầng 1';
              dock = {
                pos: [freeX, tierY, freeZ],
                targetInstanceId: null,
                slot: 'side-shelf',
                hint: `📚 Đặt "${draggedInst.customLabel || draggedAsset.name.vi}" lên ${sideLabel} — ${tierLabel} (giữ nguyên kích thước 1:1 & kéo lấy ra tự do)`,
                snapRingPos: [freeX, tierY + 0.004, freeZ],
              };
            } else if (backShelfHits.length > 0 && backShelfHits[0].point.y >= BENCH_SURFACE_Y - 0.05) {
              // Cho phép đặt vật trực tiếp lên Tầng 1 hoặc Tầng 2 của Kệ Kính 2 Tầng phía sau — giữ nguyên kích thước 1:1 và có thể kéo lấy ra!
              const hitPt = backShelfHits[0].point;
              const hitLocalY = hitPt.y - BENCH_SURFACE_Y;
              const isUpperTier =
                backShelfHits[0].object.userData?.tier === 2 || hitLocalY > 0.14;
              const tierY = isUpperTier ? 0.268 : 0.024;
              const freeX = Number(
                THREE.MathUtils.clamp(
                  hitPt.x,
                  CABINET_POS_X - 0.72,
                  CABINET_POS_X + 0.72,
                ).toFixed(3),
              );
              const freeZ = Number((CABINET_POS_Z + 0.02).toFixed(3));
              const tierLabel = isUpperTier ? 'Tầng 2 (+26.8cm)' : 'Tầng 1';
              dock = {
                pos: [freeX, tierY, freeZ],
                targetInstanceId: null,
                slot: 'side-shelf',
                hint: `📚 Đặt "${draggedInst.customLabel || draggedAsset.name.vi}" lên Kệ Kính 2 Tầng — ${tierLabel} (giữ nguyên kích thước 1:1 & kéo lấy ra tự do)`,
                snapRingPos: [freeX, tierY + 0.004, freeZ],
              };
            } else if (dock.slot === 'side-shelf') {
              // Nếu tia chuột không trỏ vào mặt kệ và cũng không trỏ vào cánh cửa tủ (ví dụ trỏ vào hông tủ hoặc sàn nhà), giữ vật ở mặt bàn thay vì tự nhảy lên kệ
              const clampedBenchX = THREE.MathUtils.clamp(
                rawX,
                -BENCH_LIMIT_X,
                BENCH_LIMIT_X,
              );
              const clampedBenchZ = THREE.MathUtils.clamp(
                rawZ,
                -BENCH_LIMIT_Z,
                BENCH_LIMIT_Z,
              );
              dock = {
                pos: [clampedBenchX, 0.022, clampedBenchZ],
                targetInstanceId: null,
                slot: 'bench',
                hint: null,
                snapRingPos: null,
              };
            }

            let carryY = dock.pos[1];
            if (dock.slot === 'inside-vessel' && dock.targetInstanceId) {
              carryY = Math.max(0.21, dock.pos[1]);
            } else if (dock.slot === 'balance-pan') {
              carryY = 0.082;
            } else if (dock.slot === 'pour-liquid') {
              carryY = dock.pos[1];
            } else if (dock.slot === 'dispenser-outlet') {
              carryY = 0.008;
            } else if (dock.slot === 'storage-cabinet') {
              carryY = 0.095;
            } else if (dock.slot === 'side-shelf') {
              carryY = dock.pos[1] + 0.018;
            } else if (
              dock.slot === 'under-shelf-cabinet-left' ||
              dock.slot === 'under-shelf-cabinet-right'
            ) {
              carryY = -0.22;
            }
            ds.targetPos.set(
              dock.pos[0],
              BENCH_SURFACE_Y + carryY,
              dock.pos[2],
            );
            const prevHoverSlot = ds.hoverSlot;
            const prevHoverTarget = ds.hoverTargetInstanceId;
            ds.hoverTargetInstanceId = dock.targetInstanceId;
            ds.hoverSlot = dock.slot;
            if (
              dock.slot !== 'bench' &&
              (dock.slot !== prevHoverSlot ||
                dock.targetInstanceId !== prevHoverTarget)
            ) {
              labSoundEngine.play('dock-hover-snap', 0.75);
            }
            if (ds.hoverHint !== dock.hint) {
              ds.hoverHint = dock.hint;
              setActiveDockHint(dock.hint);
            }

            const cabGlow = scene.getObjectByName('cabinet_drop_glow');
            if (cabGlow) {
              cabGlow.visible = dock.slot === 'storage-cabinet';
            }

            if (snapTargetRingRef.current) {
              if (dock.snapRingPos) {
                snapTargetRingRef.current.position.set(
                  dock.snapRingPos[0],
                  BENCH_SURFACE_Y + dock.snapRingPos[1],
                  dock.snapRingPos[2],
                );
                snapTargetRingRef.current.visible = true;
              } else {
                snapTargetRingRef.current.visible = false;
              }
            }
          }
          requestRender();
        }
        return;
      }

      // Trên thiết bị cảm ứng (touch), không hiển thị hover tooltip trôi theo ngón tay để tránh che mặt bàn 3D
      if (e.pointerType === 'touch') {
        return;
      }

      // Hover cursor affordance & dynamic non-intrusive hover tooltip when not dragging
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        setHoveredEquipment((prev) => (prev === null ? null : null));
        return;
      }

      raycaster.setFromCamera(mouseNdc, camera);

      // Hover trên gizmo 2 trục
      if (dualAxisGizmoRef.current && dualAxisGizmoRef.current.visible) {
        const gHits = raycaster.intersectObjects(dualAxisGizmoRef.current.children, true);
        if (gHits.length > 0) {
          renderer.domElement.style.cursor = 'grab';
          return;
        }
      }

      const pickables: THREE.Object3D[] = [];
      instanceObjectsRef.current.forEach((group, instId) => {
        const inst = instancesRef.current.find((i) => i.instanceId === instId);
        if (inst && inst.visible) {
          pickables.push(group);
        }
      });
      const hits = intersectEquipmentPrecisely(pickables);
      if (hits.length > 0) {
        let curr: THREE.Object3D | null = hits[0].object;
        let hoveredTerminalId: CircuitTerminalId | null = null;
        let hoveredRheostatWiper = false;
        let hoveredSwitchBlade = false;
        while (curr && !curr.userData?.instanceId) {
          if (curr.userData?.isTerminal && curr.userData?.terminalId) {
            hoveredTerminalId = curr.userData.terminalId as CircuitTerminalId;
          }
          if (curr.userData?.isRheostatWiper) {
            hoveredRheostatWiper = true;
          }
          if (curr.userData?.isKnifeSwitchToggle) {
            hoveredSwitchBlade = true;
          }
          curr = curr.parent;
        }
        const hitInstId = curr?.userData?.instanceId as string | undefined;
        const hitInst = hitInstId
          ? instancesRef.current.find((i) => i.instanceId === hitInstId)
          : undefined;
        const hitAsset = hitInst
          ? assetsMapRef.current.get(hitInst.assetId)
          : undefined;

        renderer.domElement.style.cursor = hoveredTerminalId
          ? 'crosshair'
          : hoveredRheostatWiper
            ? 'ew-resize'
            : hoveredSwitchBlade
              ? 'pointer'
              : hitInst && !hitInst.locked
                ? 'grab'
                : 'pointer';

        if (hitInst && hitAsset) {
          const baseReadout = computeLiveEquipmentReadout(hitInst, hitAsset);
          const termInfo = hoveredTerminalId
            ? CIRCUIT_TERMINAL_DEFINITIONS[hoveredTerminalId]
            : null;
          const readoutBadge = termInfo
            ? `🔌 CỌc [${hoveredTerminalId}] — ${termInfo.labelVi}`
            : baseReadout.readoutBadge;
          const interactionHint = termInfo
            ? pendingTerminalPickRef.current
              ? `Nhấp để cắm dây nối từ [${pendingTerminalPickRef.current.terminalId}] sang [${hoveredTerminalId}]`
              : `Nhấp vào cọc [${hoveredTerminalId}] để bắt đầu kéo dây điện bắp chuối`
            : baseReadout.interactionHint;
          const { isDigitalScale } = baseReadout;
          const localX = Math.round(e.clientX - rect.left);
          const localY = Math.round(e.clientY - rect.top);
          const dims = hitAsset.geometry.boundingBoxM;
          const dimensionsMm = `${Math.round(dims.width * 1000)} × ${Math.round(
            dims.height * 1000,
          )} × ${Math.round(dims.depth * 1000)} mm`;

          setHoveredEquipment((prev) => {
            if (
              prev &&
              prev.instanceId === hitInst.instanceId &&
              prev.readoutBadge === readoutBadge &&
              Math.abs(prev.x - localX) < 3 &&
              Math.abs(prev.y - localY) < 3
            ) {
              return prev;
            }
            return {
              instanceId: hitInst.instanceId,
              assetId: hitAsset.assetId,
              title: hitInst.customLabel || hitAsset.name.vi,
              englishName: hitAsset.name.en,
              readoutBadge,
              isDigitalScale,
              sgkFigure: hitAsset.textbookRef?.figureLabel,
              interactionHint,
              dimensionsMm,
              x: localX,
              y: localY,
            };
          });
          return;
        }
      }

      // Kiểm tra hover lên Bảng đen hoặc Tủ vật phẩm
      const boardObj = scene.getObjectByName('interactive_blackboard_group');
      const underCabsObj = scene.getObjectByName('interactive_under_shelf_cabinets_group');
      const cabObj = scene.getObjectByName('bench_storage_cabinet_group');
      const interactiveFurniture = [boardObj, underCabsObj, cabObj].filter(
        Boolean,
      ) as THREE.Object3D[];
      if (
        interactiveFurniture.length > 0 &&
        raycaster.intersectObjects(interactiveFurniture, true).length > 0
      ) {
        renderer.domElement.style.cursor = 'pointer';
        setHoveredEquipment((prev) => (prev === null ? null : null));
        return;
      }

      renderer.domElement.style.cursor = 'default';
      setHoveredEquipment((prev) => (prev === null ? null : null));
    };

    const handlePointerUp = (e: PointerEvent) => {
      activePointerIds.delete(e.pointerId);
      if (e.pointerType === 'touch') {
        activeTouchPoints.delete(e.pointerId);
      }

      if (pinchState && activeTouchPoints.size < 2) {
        pinchState = null;
        if (activeTouchPoints.size === 0) {
          suppressTouchUntilAllUp = false;
          orbit.enabled = true;
        }
        updateProjectedOverlays();
        requestRender();
        return;
      }

      if (e.pointerType === 'touch' && suppressTouchUntilAllUp) {
        if (activeTouchPoints.size === 0) {
          suppressTouchUntilAllUp = false;
          orbit.enabled = true;
        }
        return;
      }

      if (activePointerIds.size < 2) {
        orbit.enableZoom = false;
      }

      // 0. Kết thúc kéo Con Chạy Biến Trở 20Ω
      if (activeRheostatDrag) {
        activeRheostatDrag = null;
        orbit.enabled = true;
        renderer.domElement.style.cursor = 'grab';
        updateProjectedOverlays();
        requestRender();
        return;
      }

      // 0.1. Kết thúc kéo Trục Đứng hoặc Vành Xoay của Dual-Axis Gizmo
      if (activeGizmoDrag) {
        const finishedGizmo = activeGizmoDrag;
        activeGizmoDrag = null;
        orbit.enabled = true;
        renderer.domElement.style.cursor = 'grab';
        const gObj = instanceObjectsRef.current.get(finishedGizmo.instanceId);
        const gInst = instancesRef.current.find(
          (i) => i.instanceId === finishedGizmo.instanceId,
        );
        if (gObj && gInst && finishedGizmo.mode === 'rotate') {
          onUpdateTransformRef.current(
            finishedGizmo.instanceId,
            gInst.transform.positionM,
            [
              gInst.transform.rotationRad[0],
              Number(gObj.rotation.y.toFixed(3)),
              gInst.transform.rotationRad[2],
            ],
          );
        }
        updateProjectedOverlays();
        requestRender();
        return;
      }

      // 0.2. Kết thúc kéo thả từng Quả nặng 100g (1.0N) trên Bộ Bình Thông Nhau Pascal
      if (activePascalWeightDrag) {
        const finishedPascal = activePascalWeightDrag;
        activePascalWeightDrag = null;
        orbit.enabled = true;
        renderer.domElement.style.cursor = 'grab';
        setActiveDockHint(null);
        if (snapTargetRingRef.current) {
          snapTargetRingRef.current.visible = false;
        }

        onUpdateInstanceStateRef.current?.(finishedPascal.instanceId, {
          weightsPiston1: finishedPascal.previewN1,
          weightsPiston2: finishedPascal.previewN2,
        });
        const m = computePascalSimulationMetrics(
          finishedPascal.previewN1,
          finishedPascal.previewN2,
        );
        labSoundEngine.play('dock-hover-snap', 0.9);
        const actionDesc =
          finishedPascal.hoverZone === 'piston-1'
            ? `Đã đặt quả nặng 100g (1.0N) lên Nhánh (1) S₁ = 20 cm²`
            : finishedPascal.hoverZone === 'piston-2'
              ? `Đã đặt quả nặng 100g (1.0N) lên Nhánh (2) S₂ = 10 cm²`
              : `Đã trả quả nặng 100g về Khay chứa`;
        onNotifyRef.current(
          `⚖️ ${actionDesc} · n₁=${m.n1} (${m.f1N.toFixed(1)}N, p₁=${m.p1NCm2.toFixed(2)} N/cm²) | n₂=${m.n2} (${m.f2N.toFixed(1)}N, p₂=${m.p2NCm2.toFixed(2)} N/cm²) · ${
            m.isBalanced
              ? '✓ CÂN BẰNG THỦY TĨNH (p₁ = p₂, Δh₁ = Δh₂ = 0 cm)'
              : `Mực nước: Δh₁ = ${m.deltaH1Cm > 0 ? '+' : ''}${m.deltaH1Cm.toFixed(1)} cm, Δh₂ = ${m.deltaH2Cm > 0 ? '+' : ''}${m.deltaH2Cm.toFixed(1)} cm`
          }`,
          m.isBalanced ? 'success' : 'info',
        );
        updateProjectedOverlays();
        requestRender();
        return;
      }

      // Nếu đây chỉ là một cú chạm (Tap < 6px) vào thiết bị 3D mà chưa kéo đi:
      // - Trên cảm ứng (iOS / Android): phát hiện Nhấp đúp (Double-tap) vào thiết bị -> Bật/Tắt chế độ Nâng cao & Xoay thiết bị (KHÔNG mở bảng thông tin)
      // - Chạm đơn: xử lý đóng/ngắt Cầu dao K, Đèn cồn, Pin đại, Pit-tông Pascal như bình thường
      if (pendingGrab && pendingGrab.pointerId === e.pointerId) {
        const tappedGrab = pendingGrab;
        pendingGrab = null;
        orbit.enabled = true;

        if (e.pointerType === 'touch') {
          const now = performance.now();
          if (
            lastTouchTap &&
            lastTouchTap.instanceId === tappedGrab.instanceId &&
            now - lastTouchTap.time <= 380 &&
            Math.hypot(
              e.clientX - lastTouchTap.clientX,
              e.clientY - lastTouchTap.clientY,
            ) <= 44
          ) {
            lastTouchTap = null;
            lastTouchDoubleTapTime = now;
            toggleMobileDualAxisGizmo(tappedGrab.instanceId);
            updateProjectedOverlays();
            requestRender();
            return;
          }
          lastTouchTap = {
            time: now,
            clientX: e.clientX,
            clientY: e.clientY,
            instanceId: tappedGrab.instanceId,
          };
        }

        const tappedInst = instancesRef.current.find(
          (i) => i.instanceId === tappedGrab.instanceId,
        );
        if (tappedInst && tappedGrab.hitSubAction === 'knife-switch') {
          const nextClosed = !tappedInst.instanceState.switchClosed;
          onUpdateInstanceStateRef.current?.(tappedInst.instanceId, {
            switchClosed: nextClosed,
          });
          labSoundEngine.play('ui-toggle', 0.9);
          onNotifyRef.current(
            nextClosed
              ? '⚡ Đã ĐÓNG Cầu dao K (SW_RED ↔ SW_GREEN dẫn điện).'
              : '🔌 Đã MỞ Cầu dao K (Mạch hở).',
            nextClosed ? 'success' : 'info',
          );
        } else if (
          tappedInst &&
          (tappedGrab.hitSubAction === 'SLOT_1' || tappedGrab.hitSubAction === 'SLOT_2')
        ) {
          const isSlot1 = tappedGrab.hitSubAction === 'SLOT_1';
          const curInserted = isSlot1
            ? tappedInst.instanceState.slot1Inserted !== false
            : tappedInst.instanceState.slot2Inserted !== false;
          const curReversed = isSlot1
            ? Boolean(tappedInst.instanceState.slot1Reversed)
            : Boolean(tappedInst.instanceState.slot2Reversed);

          let nextInserted = true;
          let nextReversed = false;
          let statusMsg = '';
          if (curInserted && !curReversed) {
            nextInserted = true;
            nextReversed = true;
            statusMsg = `🔄 Đã đảo ngược chiều Pin ở ${isSlot1 ? 'Khay 1 (SLOT_1)' : 'Khay 2 (SLOT_2)'} (-1.5V).`;
          } else if (curInserted && curReversed) {
            nextInserted = false;
            nextReversed = false;
            statusMsg = `🔋 Đã tháo Pin khỏi ${isSlot1 ? 'Khay 1 (SLOT_1)' : 'Khay 2 (SLOT_2)'} (Khay trống = 0V).`;
          } else {
            nextInserted = true;
            nextReversed = false;
            statusMsg = `🔋 Đã lắp Pin đại Con Ó 1.5V đúng chiều vào ${isSlot1 ? 'Khay 1 (SLOT_1)' : 'Khay 2 (SLOT_2)'}.`;
          }
          onUpdateInstanceStateRef.current?.(
            tappedInst.instanceId,
            isSlot1
              ? { slot1Inserted: nextInserted, slot1Reversed: nextReversed }
              : { slot2Inserted: nextInserted, slot2Reversed: nextReversed },
          );
          labSoundEngine.play('dock-hover-snap', 0.85);
          onNotifyRef.current(statusMsg, 'info');
        } else if (tappedInst && tappedGrab.hitSubAction === 'alcohol-burner') {
          const nextLit = !tappedInst.instanceState.isHeating;
          onUpdateInstanceStateRef.current?.(tappedInst.instanceId, {
            isHeating: nextLit,
            temperatureC: nextLit ? 100.0 : 0.0,
          });
          labSoundEngine.play(
            nextLit ? 'burner-ignite' : 'burner-extinguish',
            0.9,
          );
          onNotifyRef.current(
            nextLit
              ? '🔥 Đã mở nắp chụp và châm lửa Đèn cồn (Nhiệt độ ngọn lửa: 100.0 °C)! Hãy đặt Bình thủy tinh chịu nhiệt lên trên đèn cồn để đun.'
              : '🧯 Đã đậy nắp chụp dập tắt ngọn lửa Đèn cồn (0 °C).',
            nextLit ? 'warning' : 'info',
          );
        } else if (
          tappedInst &&
          (tappedGrab.hitPascalWeightIdx !== undefined ||
            tappedGrab.hitSubAction === 'pascal-piston-1' ||
            tappedGrab.hitSubAction === 'pascal-piston-2' ||
            tappedGrab.hitSubAction === 'pascal-weight-pool')
        ) {
          const curN1 = tappedInst.instanceState.weightsPiston1 ?? 0;
          const curN2 = tappedInst.instanceState.weightsPiston2 ?? 0;
          let nextN1 = curN1;
          let nextN2 = curN2;
          if (tappedGrab.hitPascalWeightZone === 'piston-1') {
            nextN1 = Math.max(0, curN1 - 1);
          } else if (tappedGrab.hitPascalWeightZone === 'piston-2') {
            nextN2 = Math.max(0, curN2 - 1);
          } else if (tappedGrab.hitPascalWeightZone === 'pool') {
            if (curN1 + curN2 < 8) {
              if (curN1 < 4) {
                nextN1 = curN1 + 1;
              } else {
                nextN2 = curN2 + 1;
              }
            }
          } else if (tappedGrab.hitSubAction === 'pascal-piston-1') {
            nextN1 = curN1 + curN2 < 8 ? curN1 + 1 : 0;
          } else if (tappedGrab.hitSubAction === 'pascal-piston-2') {
            nextN2 = curN1 + curN2 < 8 ? curN2 + 1 : 0;
          } else {
            if (curN1 > 0 || curN2 > 0) {
              nextN1 = 0;
              nextN2 = 0;
            } else {
              nextN1 = 1;
              nextN2 = 0;
            }
          }
          onUpdateInstanceStateRef.current?.(tappedInst.instanceId, {
            weightsPiston1: nextN1,
            weightsPiston2: nextN2,
          });
          const m = computePascalSimulationMetrics(nextN1, nextN2);
          labSoundEngine.play('dock-hover-snap', 0.85);
          onNotifyRef.current(
            `⚖️ Bình thông nhau Pascal: n₁=${m.n1} (${m.f1N.toFixed(1)}N → p₁=${m.p1NCm2.toFixed(2)} N/cm²) | n₂=${m.n2} (${m.f2N.toFixed(1)}N → p₂=${m.p2NCm2.toFixed(2)} N/cm²) · ${
              m.isBalanced
                ? '✓ CÂN BẰNG THỦY TĨNH (p₁ = p₂, Δh₁ = Δh₂ = 0 cm)'
                : `Mực nước: Δh₁ = ${m.deltaH1Cm > 0 ? '+' : ''}${m.deltaH1Cm.toFixed(1)} cm, Δh₂ = ${m.deltaH2Cm > 0 ? '+' : ''}${m.deltaH2Cm.toFixed(1)} cm`
            }`,
            m.isBalanced ? 'success' : 'info',
          );
        }

        updateProjectedOverlays();
        requestRender();
        return;
      }

      // Nếu chạm nhẹ (< 6px) vào khoảng trống ngoài thiết bị: kiểm tra xem có bấm vào Bảng Đen, Tủ Kính hoặc Tủ Vật Phẩm Trái / Phải hay không
      if (emptyTapStart && emptyTapStart.pointerId === e.pointerId) {
        const tapDist = Math.hypot(
          e.clientX - emptyTapStart.startClientX,
          e.clientY - emptyTapStart.startClientY,
        );
        emptyTapStart = null;
        if (tapDist < 6) {
          const rect = renderer.domElement.getBoundingClientRect();
          mouseNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouseNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(mouseNdc, camera);

          // 1. Nhấp vào Bảng đen 3D trên tường sau -> Mở modal viết nội dung lên bảng đen
          const boardObj = scene.getObjectByName('interactive_blackboard_group');
          if (boardObj && raycaster.intersectObject(boardObj, true).length > 0) {
            labSoundEngine.play('ui-toggle', 0.75);
            setIsBlackboardModalOpen(true);
            requestRender();
            return;
          }

          // 2. Nhấp vào Tủ Vật Phẩm Trái / Phải dưới kệ -> Mở danh sách thiết bị đang cất riêng của Tủ Trái hoặc Tủ Phải
          const underCabsObj = scene.getObjectByName(
            'interactive_under_shelf_cabinets_group',
          );
          if (underCabsObj) {
            const uHits = raycaster.intersectObject(underCabsObj, true);
            if (uHits.length > 0) {
              let cNode: THREE.Object3D | null = uHits[0].object;
              let side: 'left' | 'right' | null = null;
              while (cNode) {
                const candidateSide =
                  cNode.userData?.underShelfCabinetSide ||
                  cNode.userData?.cabinetSide;
                if (candidateSide === 'left' || candidateSide === 'right') {
                  side = candidateSide;
                  break;
                }
                cNode = cNode.parent;
              }
              if (side) {
                labSoundEngine.play('ui-toggle', 0.8);
                setUnderCabinetTab('stored');
                setOpenUnderCabinetModalSide(side);
                requestRender();
                return;
              }
            }
          }

          // 3. Nhấp vào Tủ kính 2 tầng đối diện bàn -> Mở ngăn kéo tủ kính
          const cabObj = scene.getObjectByName('bench_storage_cabinet_group');
          if (cabObj && raycaster.intersectObject(cabObj, true).length > 0) {
            labSoundEngine.play('ui-toggle', 0.75);
            setIsCabinetDrawerOpen((v) => !v);
            requestRender();
            return;
          }

          if (selectedInstanceIdRef.current) {
            selectedInstanceIdRef.current = null;
            onSelectInstanceRef.current(null);
          }
          setViewportContextMenu(null);
          setIsWaterValveOpenUI(false);
          setIsCompassHudExpanded(false);
          setDeviceSheetMode('collapsed');
          if (window.innerWidth < 768) {
            setIsMobileToolsOpen(false);
            setShowMobileGestureGuide(false);
          }
          if (e.pointerType === 'touch') {
            const now = performance.now();
            if (
              lastTouchTap &&
              lastTouchTap.instanceId === null &&
              now - lastTouchTap.time <= 360 &&
              Math.hypot(
                e.clientX - lastTouchTap.clientX,
                e.clientY - lastTouchTap.clientY,
              ) <= 44
            ) {
              lastTouchTap = null;
              lastTouchDoubleTapTime = now;
              handleFocusCameraPreset('bench-close');
            } else {
              lastTouchTap = {
                time: now,
                clientX: e.clientX,
                clientY: e.clientY,
                instanceId: null,
              };
            }
          }
          updateProjectedOverlays();
          requestRender();
        }
      }

      const ds = dragStateRef.current;
      if (!ds.isDragging || !ds.instanceId) {
        orbit.enabled = true;
        return;
      }

      const draggedId = ds.instanceId;
      const obj = instanceObjectsRef.current.get(draggedId);
      const draggedInst = instancesRef.current.find((i) => i.instanceId === draggedId);
      const draggedAsset = draggedInst
        ? assetsMapRef.current.get(draggedInst.assetId)
        : undefined;

      const lastHoverSlot = ds.hoverSlot;
      const lastHoverTargetId = ds.hoverTargetInstanceId;
      ds.isDragging = false;
      ds.instanceId = null;
      orbit.enabled = true;
      renderer.domElement.style.cursor = 'grab';
      setActiveDockHint(null);
      if (snapTargetRingRef.current) {
        snapTargetRingRef.current.visible = false;
      }
      if (pouringStreamRef.current) {
        pouringStreamRef.current.visible = false;
      }
      const cabGlow = scene.getObjectByName('cabinet_drop_glow');
      if (cabGlow) {
        cabGlow.visible = false;
      }
      hideUnderCabinetHighlights();

      if (obj && draggedInst && draggedAsset) {
        // Nếu người dùng kéo Viên Pin Đại Con Ó 1.5V thả vào Giá Đỡ Pin -> Lắp pin vào SLOT_1 hoặc SLOT_2!
        if (draggedAsset.geometry.proceduralArchetype === 'dc-con-o-battery') {
          const holderInst = instancesRef.current.find((other) => {
            if (!other.visible || other.instanceId === draggedId) return false;
            const oAsset = assetsMapRef.current.get(other.assetId);
            if (oAsset?.geometry.proceduralArchetype !== 'dc-battery-holder') {
              return false;
            }
            const dist = Math.hypot(
              ds.targetPos.x - other.transform.positionM[0],
              ds.targetPos.z - other.transform.positionM[2],
            );
            return dist < 0.22;
          });
          if (holderInst) {
            const slot1Empty = holderInst.instanceState.slot1Inserted === false;
            const targetSlot = slot1Empty ? 'SLOT_1' : 'SLOT_2';
            onUpdateInstanceStateRef.current?.(
              holderInst.instanceId,
              targetSlot === 'SLOT_1'
                ? { slot1Inserted: true, slot1Reversed: false }
                : { slot2Inserted: true, slot2Reversed: false },
            );
            labSoundEngine.play('dock-hover-snap', 0.9);
            onNotifyRef.current(
              `🔋 Đã lắp Viên Pin Đại Con Ó 1.5V vào ${targetSlot === 'SLOT_1' ? 'Khay 1 (SLOT_1)' : 'Khay 2 (SLOT_2)'} của Giá đỡ pin!`,
              'success',
            );
          }
        }

        const releaseRect = renderer.domElement.getBoundingClientRect();
        mouseNdc.x = ((e.clientX - releaseRect.left) / releaseRect.width) * 2 - 1;
        mouseNdc.y = -((e.clientY - releaseRect.top) / releaseRect.height) * 2 + 1;
        raycaster.setFromCamera(mouseNdc, camera);
        let dock = evaluateLabDockingTarget(
          draggedInst,
          draggedAsset,
          ds.lastX,
          ds.lastZ,
          raycaster.ray,
        );
        if (
          dock.slot === 'bench' &&
          lastHoverSlot === 'pour-liquid' &&
          lastHoverTargetId
        ) {
          dock = {
            ...dock,
            slot: 'pour-liquid',
            targetInstanceId: lastHoverTargetId,
          };
        }

        // Kiểm tra tại thời điểm nhả chuột: bắt buộc con trỏ phải đang đặt NGAY CÁNH CỬA TỦ Trái / Phải thì mới cho phép cất vào tủ
        const releaseUnderCabsGrp = scene.getObjectByName(
          'interactive_under_shelf_cabinets_group',
        );
        const releaseSideShelvesGrp = scene.getObjectByName(
          'interactive_side_shelves_group',
        );
        const releaseShelfHits = releaseSideShelvesGrp
          ? raycaster.intersectObject(releaseSideShelvesGrp, true)
          : [];
        const releaseDoorHits = releaseUnderCabsGrp
          ? raycaster
              .intersectObject(releaseUnderCabsGrp, true)
              .filter((h) => Boolean(h.object.userData?.isUnderShelfCabinetDoor))
          : [];
        const releaseDoorSide: 'left' | 'right' | null =
          releaseDoorHits.length > 0 &&
          (releaseShelfHits.length === 0 ||
            releaseDoorHits[0].distance <= releaseShelfHits[0].distance)
            ? releaseDoorHits[0].object.userData?.underShelfCabinetSide === 'left' ||
              releaseDoorHits[0].object.userData?.cabinetSide === 'left'
              ? 'left'
              : releaseDoorHits[0].object.userData?.underShelfCabinetSide ===
                    'right' ||
                  releaseDoorHits[0].object.userData?.cabinetSide === 'right'
                ? 'right'
                : null
            : null;

        if (
          releaseDoorSide &&
          (lastHoverSlot === 'under-shelf-cabinet-left' ||
            lastHoverSlot === 'under-shelf-cabinet-right')
        ) {
          pendingCabinetZoneRef.current = releaseDoorSide;
          dock = {
            pos: [releaseDoorSide === 'left' ? -1.52 : 1.52, -0.35, 0.23],
            targetInstanceId: null,
            slot:
              releaseDoorSide === 'left'
                ? 'under-shelf-cabinet-left'
                : 'under-shelf-cabinet-right',
            hint: null,
            snapRingPos: null,
          };
        } else if (lastHoverSlot === 'side-shelf') {
          const isBackGlassShelf =
            Math.abs(ds.targetPos.x - CABINET_POS_X) < 0.85 &&
            ds.targetPos.z < -0.46;
          if (isBackGlassShelf) {
            const tierY =
              ds.targetPos.y - BENCH_SURFACE_Y > 0.14 ? 0.268 : 0.024;
            const freeX = Number(
              THREE.MathUtils.clamp(
                ds.targetPos.x,
                CABINET_POS_X - 0.72,
                CABINET_POS_X + 0.72,
              ).toFixed(3),
            );
            const freeZ = Number((CABINET_POS_Z + 0.02).toFixed(3));
            gravityPhysicsRef.current.set(draggedId, {
              vy: 0,
              falling: false,
              restingY: tierY,
            });
            dock = {
              pos: [freeX, tierY, freeZ],
              targetInstanceId: null,
              slot: 'side-shelf',
              hint: null,
              snapRingPos: null,
            };
          } else {
            const tierY =
              ds.targetPos.y - BENCH_SURFACE_Y > 0.14 ? 0.26 : 0.0;
            const isLeft = ds.targetPos.x < 0;
            const freeX = Number(
              (isLeft
                ? THREE.MathUtils.clamp(ds.targetPos.x, -1.92, -1.12)
                : THREE.MathUtils.clamp(ds.targetPos.x, 1.12, 1.92)
              ).toFixed(3),
            );
            const freeZ = Number(
              THREE.MathUtils.clamp(ds.targetPos.z, -0.41, 0.21).toFixed(3),
            );
            gravityPhysicsRef.current.set(draggedId, {
              vy: 0,
              falling: false,
              restingY: tierY,
            });
            dock = {
              pos: [freeX, tierY, freeZ],
              targetInstanceId: null,
              slot: 'side-shelf',
              hint: null,
              snapRingPos: null,
            };
          }
        } else if (dock.slot === 'side-shelf') {
          const clampedBenchX = THREE.MathUtils.clamp(
            ds.targetPos.x,
            -BENCH_LIMIT_X,
            BENCH_LIMIT_X,
          );
          const clampedBenchZ = THREE.MathUtils.clamp(
            ds.targetPos.z,
            -BENCH_LIMIT_Z,
            BENCH_LIMIT_Z,
          );
          dock = {
            pos: [clampedBenchX, 0.0, clampedBenchZ],
            targetInstanceId: null,
            slot: 'bench',
            hint: null,
            snapRingPos: null,
          };
        }

        // Hỗ trợ thao tác "Quăng đồ" (flick/toss): đặt lên Kệ kính 2 tầng phía sau với nguyên kích thước 1:1 và có thể kéo lấy ra!
        if (dock.slot === 'bench' && ds.velZ < -0.008) {
          const projectedThrowX = ds.targetPos.x + ds.velX * 14;
          const projectedThrowZ = ds.targetPos.z + ds.velZ * 14;
          if (
            Math.abs(projectedThrowX - CABINET_POS_X) < 0.75 &&
            projectedThrowZ < -0.25
          ) {
            const snapX = Number(
              THREE.MathUtils.clamp(
                projectedThrowX,
                CABINET_POS_X - 0.68,
                CABINET_POS_X + 0.68,
              ).toFixed(3),
            );
            gravityPhysicsRef.current.set(draggedId, {
              vy: 0,
              falling: false,
              restingY: 0.024,
            });
            dock = {
              pos: [
                snapX,
                0.024,
                CABINET_POS_Z + 0.02,
              ],
              targetInstanceId: null,
              slot: 'side-shelf',
              hint: null,
              snapRingPos: null,
            };
          }
        }

        if (dock.slot === 'storage-cabinet') {
          pendingCabinetZoneRef.current = 'glass';
        }

        // If pouring liquid, check if real-time tilt pouring already transferred water while holding/tilting
        const alreadyPouredRealtimeMl =
          tiltPourStateRef.current.sourceId === draggedId
            ? tiltPourStateRef.current.sessionPouredMl
            : 0;
        let settleX = dock.pos[0];
        let settleZ = dock.pos[2];
        if (dock.slot === 'pour-liquid' && dock.targetInstanceId) {
          const partnerInst = instancesRef.current.find(
            (i) => i.instanceId === dock.targetInstanceId,
          );
          const partnerAsset = partnerInst
            ? assetsMapRef.current.get(partnerInst.assetId)
            : undefined;
          const draggedArch = draggedAsset.geometry.proceduralArchetype;
          const partnerArch = partnerAsset?.geometry.proceduralArchetype;

          const getDefaultMl = (vArch: string | undefined, vCap: number) => {
            if (
              vArch === 'beaker-bomex-100' ||
              vArch === 'thermal-heating-vessel'
            ) {
              return 0;
            }
            if (
              vArch === 'reagent-bottle-naoh-400' ||
              vArch === 'reagent-bottle-agno3-400'
            ) {
              return 300;
            }
            if (vArch === 'overflow-can') return 210;
            if (vArch === 'water-dispenser') return 850;
            if (vArch === 'graduated-cylinder') return 50;
            if (vArch === 'beaker-250') return 40;
            return vCap * 0.5;
          };

          const draggedCap =
            draggedArch === 'overflow-can'
              ? 210
              : draggedArch === 'water-dispenser'
                ? 1000
                : draggedArch === 'reagent-bottle-naoh-400' ||
                    draggedArch === 'reagent-bottle-agno3-400'
                  ? 400
                  : draggedAsset.scientificProperties.capacity?.value ?? 100;
          const partnerCap =
            partnerArch === 'overflow-can'
              ? 210
              : partnerArch === 'water-dispenser'
                ? 1000
                : partnerArch === 'reagent-bottle-naoh-400' ||
                    partnerArch === 'reagent-bottle-agno3-400'
                  ? 400
                  : partnerAsset?.scientificProperties.capacity?.value ?? 100;

          const draggedCurMl =
            draggedInst.instanceState.baseLiquidLevelMl ??
            draggedInst.instanceState.liquidLevelMl ??
            getDefaultMl(draggedArch, draggedCap);
          const partnerCurMl =
            partnerInst?.instanceState.baseLiquidLevelMl ??
            partnerInst?.instanceState.liquidLevelMl ??
            getDefaultMl(partnerArch, partnerCap);

          // Xác định thiết bị Nguồn (chứa dung dịch) và thiết bị Nhận (nhận dung dịch):
          // Ưu tiên nếu thiết bị đang kéo có dung dịch (> 0.5 ml) và bình kia là bình nhận;
          // Ngược lại nếu người dùng kéo Cốc đong 100ml (đang rỗng) tới gần bình chứa dung dịch thì bình kia là Nguồn và Cốc đong 100ml là Nhận!
          const isDraggedSource =
            draggedCurMl > 0.5 &&
            partnerArch !== 'reagent-bottle-naoh-400' &&
            partnerArch !== 'reagent-bottle-agno3-400' &&
            partnerArch !== 'water-dispenser' &&
            partnerCurMl < partnerCap - 0.1;

          const resolvedSrcInst = isDraggedSource ? draggedInst : partnerInst;
          const resolvedDstInst = isDraggedSource ? partnerInst : draggedInst;
          const resolvedSrcAsset = isDraggedSource ? draggedAsset : partnerAsset;
          const resolvedDstAsset = isDraggedSource ? partnerAsset : draggedAsset;
          const resolvedSrcCap = isDraggedSource ? draggedCap : partnerCap;
          const resolvedDstCap = isDraggedSource ? partnerCap : draggedCap;
          const resolvedSrcCurMl = isDraggedSource ? draggedCurMl : partnerCurMl;
          const resolvedDstCurMl = isDraggedSource ? partnerCurMl : draggedCurMl;

          const px = partnerInst?.transform.positionM[0] ?? dock.pos[0];
          const pz = partnerInst?.transform.positionM[2] ?? dock.pos[2];
          settleX = THREE.MathUtils.clamp(
            isDraggedSource ? px - 0.105 : px + 0.105,
            -BENCH_LIMIT_X,
            BENCH_LIMIT_X,
          );
          settleZ = THREE.MathUtils.clamp(
            isDraggedSource ? pz + 0.025 : pz - 0.02,
            -BENCH_LIMIT_Z,
            BENCH_LIMIT_Z,
          );

          // Đặt bình vào chốt bắt dính trên mặt bàn (slot: 'bench') và mở Khung nhập Khối lượng (g) / Thể tích (ml) muốn rót!
          dock = {
            ...dock,
            slot: 'bench',
            targetInstanceId: null,
            pos: [settleX, 0, settleZ],
          };

          if (
            alreadyPouredRealtimeMl <= 0.5 &&
            resolvedSrcInst &&
            resolvedDstInst &&
            resolvedSrcAsset &&
            resolvedDstAsset
          ) {
            const maxTransferMl = Number(
              Math.max(
                0,
                Math.min(resolvedSrcCurMl, resolvedDstCap - resolvedDstCurMl),
              ).toFixed(1),
            );
            const defaultPourVal = Number(
              Math.min(20, maxTransferMl > 0 ? maxTransferMl : 20).toFixed(1),
            );
            setPourInputVolumeMl(String(defaultPourVal));
            setPourInputMassG(String(defaultPourVal));
            setPourInputFocusField('volume');
            setPourLatchModal({
              sourceInstanceId: resolvedSrcInst.instanceId,
              targetInstanceId: resolvedDstInst.instanceId,
              sourceTitle:
                resolvedSrcInst.customLabel || resolvedSrcAsset.name.vi,
              targetTitle:
                resolvedDstInst.customLabel || resolvedDstAsset.name.vi,
              sourceArchetype:
                resolvedSrcAsset.geometry.proceduralArchetype || 'beaker-250',
              targetArchetype:
                resolvedDstAsset.geometry.proceduralArchetype ||
                'beaker-bomex-100',
              sourceAssetId: resolvedSrcAsset.assetId,
              targetAssetId: resolvedDstAsset.assetId,
              sourceAvailableMl: Number(resolvedSrcCurMl.toFixed(1)),
              sourceCapacityMl: resolvedSrcCap,
              targetCurrentMl: Number(resolvedDstCurMl.toFixed(1)),
              targetCapacityMl: resolvedDstCap,
              maxTransferMl,
              densityGPerMl: 1.0,
            });
            labSoundEngine.play('dock-hover-snap', 0.95);
          }
        } else if (dock.slot === 'dispenser-outlet' && dock.targetInstanceId) {
          const isDraggingDispenser =
            draggedAsset.geometry.proceduralArchetype === 'water-dispenser';
          const vesselId = isDraggingDispenser
            ? dock.targetInstanceId
            : draggedId;
          const vesselInst = instancesRef.current.find(
            (i) => i.instanceId === vesselId,
          );
          const vesselAsset = vesselInst
            ? assetsMapRef.current.get(vesselInst.assetId)
            : undefined;
          const vesselArch = vesselAsset?.geometry.proceduralArchetype;
          const vesselCap =
            vesselArch === 'overflow-can'
              ? 210
              : vesselAsset?.scientificProperties.capacity?.value ?? 100;
          const vesselCurMl =
            vesselInst?.instanceState.baseLiquidLevelMl ??
            vesselInst?.instanceState.liquidLevelMl ??
            vesselCap * 0.5;
          const autoDispenseMl =
            vesselArch === 'overflow-can' && vesselCurMl < 210
              ? Math.max(0, 210 - vesselCurMl)
              : Math.max(0, Math.min(25, vesselCap - vesselCurMl));
          setValveTargetInstanceId(vesselId);
          setIsWaterValveOpenUI(true);
          if (autoDispenseMl > 0.2) {
            triggerDispenseVisualAnimation(vesselId, autoDispenseMl, 'add');
          }
        }

        // Nếu người dùng kéo Khay Nước Đá Viên (`ice-cubes-tray`) thả vào Bình thủy tinh chịu nhiệt / Cốc đựng -> Chuyển đá viên vào bình và đặt khay gọn cạnh bình!
        if (
          draggedAsset.geometry.proceduralArchetype === 'ice-cubes-tray' &&
          dock.slot === 'inside-vessel' &&
          dock.targetInstanceId
        ) {
          const targetVessel = instancesRef.current.find(
            (i) => i.instanceId === dock.targetInstanceId,
          );
          if (targetVessel) {
            settleX = Number(
              THREE.MathUtils.clamp(
                targetVessel.transform.positionM[0] + 0.145,
                -BENCH_LIMIT_X,
                BENCH_LIMIT_X,
              ).toFixed(3),
            );
            settleZ = Number(
              THREE.MathUtils.clamp(
                targetVessel.transform.positionM[2] + 0.03,
                -BENCH_LIMIT_Z,
                BENCH_LIMIT_Z,
              ).toFixed(3),
            );
          }
        }

        const isIceTrayDropIntoVessel =
          draggedAsset.geometry.proceduralArchetype === 'ice-cubes-tray' &&
          dock.slot === 'inside-vessel';
        const isPascalWeightDrop =
          dock.slot === 'pascal-piston-1' || dock.slot === 'pascal-piston-2';
        if (isPascalWeightDrop && dock.targetInstanceId) {
          const targetPress = instancesRef.current.find(
            (i) => i.instanceId === dock.targetInstanceId,
          );
          if (targetPress) {
            const sideSign = dock.slot === 'pascal-piston-1' ? -1 : 1;
            settleX = Number(
              THREE.MathUtils.clamp(
                targetPress.transform.positionM[0] + sideSign * 0.19,
                -BENCH_LIMIT_X,
                BENCH_LIMIT_X,
              ).toFixed(3),
            );
            settleZ = Number(
              THREE.MathUtils.clamp(
                targetPress.transform.positionM[2] + 0.08,
                -BENCH_LIMIT_Z,
                BENCH_LIMIT_Z,
              ).toFixed(3),
            );
          }
        }
        const finalY =
          dock.slot === 'balance-pan'
            ? 0.068
            : dock.slot === 'tripod-top'
              ? dock.pos[1] || 0.118
              : dock.slot === 'under-tripod' || isPascalWeightDrop
                ? 0
                : isIceTrayDropIntoVessel
                  ? 0
                  : dock.slot === 'inside-vessel'
                    ? draggedAsset.geometry.proceduralArchetype === 'thermometer'
                      ? dock.pos[1]
                      : 0.016
                    : dock.slot === 'dynamometer-hook'
                      ? 0.025
                      : dock.slot === 'caliper-jaws'
                        ? 0.008
                        : dock.slot === 'side-shelf'
                          ? dock.pos[1]
                          : 0;
        const finalPos: [number, number, number] = [
          Number(settleX.toFixed(3)),
          Number(finalY.toFixed(3)),
          Number(settleZ.toFixed(3)),
        ];

        // Giữ độ cao cố định khi đặt Bình thủy tinh chịu nhiệt lên trên Đèn cồn hoặc Kiềng 3 chân
        gravityPhysicsRef.current.set(draggedId, {
          vy: 0,
          falling: false,
          restingY: finalY,
        });

        // Nếu người dùng kéo Đèn cồn đặt vào dưới Bình thủy tinh chịu nhiệt -> Nâng ngay mô hình 3D của Bình lên trên Đèn cồn (y = 0.118 m)
        if (
          draggedAsset.geometry.proceduralArchetype === 'alcohol-burner' &&
          dock.slot === 'under-tripod' &&
          dock.targetInstanceId
        ) {
          const targetInst = instancesRef.current.find(
            (i) => i.instanceId === dock.targetInstanceId,
          );
          const targetAsset = targetInst
            ? assetsMapRef.current.get(targetInst.assetId)
            : undefined;
          const targetArch = targetAsset?.geometry.proceduralArchetype;
          if (
            targetInst &&
            (targetArch === 'thermal-heating-vessel' ||
              targetArch === 'beaker-250' ||
              targetArch === 'erlenmeyer-flask' ||
              targetArch === 'distillation-flask' ||
              targetArch === 'porcelain-dish')
          ) {
            const targetObj = instanceObjectsRef.current.get(targetInst.instanceId);
            if (targetObj) {
              targetObj.position.set(
                finalPos[0],
                BENCH_SURFACE_Y + 0.118,
                finalPos[2],
              );
            }
            gravityPhysicsRef.current.set(targetInst.instanceId, {
              vy: 0,
              falling: false,
              restingY: 0.118,
            });
          }
        }

        // Đặt trên mặt bàn/kệ theo đúng chuẩn anchor 'base-center' tại worldY = BENCH_SURFACE_Y (0.82 m) + finalY
        if (
          dock.slot !== 'pour-liquid' &&
          dock.slot !== 'storage-cabinet' &&
          dock.slot !== 'under-shelf-cabinet-left' &&
          dock.slot !== 'under-shelf-cabinet-right'
        ) {
          obj.position.set(
            finalPos[0],
            BENCH_SURFACE_Y + finalPos[1],
            finalPos[2],
          );
          obj.rotation.x = 0;
          obj.rotation.z = 0;
          const liqSurf = obj.getObjectByName('liquid_surface');
          if (liqSurf) liqSurf.rotation.z = 0;
        }

        if (onPhysicalDockRef.current) {
          onPhysicalDockRef.current(
            draggedId,
            dock.targetInstanceId,
            dock.slot,
            finalPos,
          );
        } else {
          onUpdateTransformRef.current(draggedId, finalPos, [
            0,
            Number(obj.rotation.y.toFixed(3)),
            0,
          ]);
        }
        updateProjectedOverlays();
        requestRender();
      }
    };

    const handlePointerCancel = (e: PointerEvent) => {
      activePointerIds.delete(e.pointerId);
      if (e.pointerType === 'touch') {
        activeTouchPoints.delete(e.pointerId);
      }
      if (activeTouchPoints.size < 2) {
        pinchState = null;
      }
      if (activeTouchPoints.size === 0) {
        suppressTouchUntilAllUp = false;
        orbit.enabled = true;
      }
      if (activePointerIds.size < 2) {
        orbit.enableZoom = false;
      }
      emptyTapStart = null;
      cancelActiveOrPendingDrag();
    };

    // Lăn con lăn chuột (Mouse Wheel):
    // 1) Nếu đang kéo bình chất lỏng -> Nghiêng rót chủ động (0° -> 80°)
    // 2) Nếu không kéo -> Zoom In / Zoom Out chính xác 100% ngay tại điểm dưới con trỏ chuột (Cursor-Locked Homothety Raycast Zoom)
    const _zoomCamDir = new THREE.Vector3();
    const _zoomViewDir = new THREE.Vector3();
    const _zoomCursorPlane = new THREE.Plane();
    const handleCanvasWheel = (e: WheelEvent) => {
      const ds = dragStateRef.current;
      if (ds.isDragging && ds.instanceId) {
        const draggedInst = instancesRef.current.find(
          (i) => i.instanceId === ds.instanceId,
        );
        const draggedAsset = draggedInst
          ? assetsMapRef.current.get(draggedInst.assetId)
          : undefined;
        const arch = draggedAsset?.geometry.proceduralArchetype;
        if (
          arch === 'beaker-250' ||
          arch === 'beaker-bomex-100' ||
          arch === 'graduated-cylinder' ||
          arch === 'erlenmeyer-flask' ||
          arch === 'overflow-can' ||
          arch === 'porcelain-dish'
        ) {
          e.preventDefault();
          e.stopPropagation();
          const deltaRad = e.deltaY > 0 ? -0.12 : 0.12;
          ds.manualTiltRad = THREE.MathUtils.clamp(
            ds.manualTiltRad + deltaRad,
            -1.42,
            0,
          );
          requestRender();
          return;
        }
      }

      e.preventDefault();
      e.stopPropagation();
      cameraGoalPosRef.current = null;
      cameraGoalTargetRef.current = null;

      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      mouseNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseNdc, camera);

      const zoomCandidates: THREE.Object3D[] = [];
      if (viewModeRef.current === 'single-asset') {
        if (singleAssetGroupRef.current && singleAssetGroupRef.current.visible) {
          zoomCandidates.push(singleAssetGroupRef.current);
        }
      } else {
        instanceObjectsRef.current.forEach((grp) => {
          if (grp.visible) zoomCandidates.push(grp);
        });
        if (benchGroupRef.current && benchGroupRef.current.visible) {
          zoomCandidates.push(benchGroupRef.current);
        }
      }

      // Lọc chỉ lấy giao điểm trên các Mesh thực tế (bỏ qua Line / LineSegments có threshold 1m làm lệch tia chuột)
      const meshHits = raycaster
        .intersectObjects(zoomCandidates, true)
        .filter(
          (h) =>
            Boolean((h.object as THREE.Mesh).isMesh) &&
            h.object.visible &&
            h.distance > 0.015,
        );

      const focusPoint = new THREE.Vector3();
      if (meshHits.length > 0) {
        focusPoint.copy(meshHits[0].point);
      } else {
        camera.getWorldDirection(_zoomCamDir);
        _zoomCursorPlane.setFromNormalAndCoplanarPoint(_zoomCamDir, orbit.target);
        if (!raycaster.ray.intersectPlane(_zoomCursorPlane, focusPoint)) {
          if (!raycaster.ray.intersectPlane(_rayPlane, focusPoint)) {
            focusPoint.copy(orbit.target);
          }
        }
      }

      const zoomIn = e.deltaY < 0;
      const wheelStep = THREE.MathUtils.clamp(Math.abs(e.deltaY) / 100, 0.45, 1.35);
      let s = zoomIn ? Math.pow(0.84, wheelStep) : Math.pow(1.18, wheelStep);

      const currentDist = camera.position.distanceTo(focusPoint);
      if ((zoomIn && currentDist < 0.08) || (!zoomIn && currentDist > 8.2)) {
        return;
      }

      // Giữ camera trong giới hạn phòng bằng cách giới hạn hệ số tỉa đồng dạng s (không kẹp độc lập từng trục làm lệch điểm dưới trỏ chuột)
      if (viewModeRef.current === 'lab-scene') {
        const clampAxisScale = (
          camCoord: number,
          focusCoord: number,
          minB: number,
          maxB: number,
          curS: number,
        ): number => {
          const d = camCoord - focusCoord;
          if (Math.abs(d) < 1e-5) return curS;
          const nextC = focusCoord + d * curS;
          if (nextC < minB) {
            const boundS = (minB - focusCoord) / d;
            return zoomIn
              ? Math.min(1.0, Math.max(curS, boundS))
              : Math.max(1.0, Math.min(curS, boundS));
          }
          if (nextC > maxB) {
            const boundS = (maxB - focusCoord) / d;
            return zoomIn
              ? Math.min(1.0, Math.max(curS, boundS))
              : Math.max(1.0, Math.min(curS, boundS));
          }
          return curS;
        };
        s = clampAxisScale(camera.position.x, focusPoint.x, -6.6, 6.6, s);
        s = clampAxisScale(camera.position.y, focusPoint.y, 0.14, 3.95, s);
        s = clampAxisScale(camera.position.z, focusPoint.z, -3.5, 5.8, s);
      }

      if (Math.abs(s - 1.0) < 1e-4) {
        return;
      }

      _zoomViewDir.subVectors(orbit.target, camera.position).normalize();

      // Phép vị tự tâm focusPoint tỉ số s cho cả camera.position và orbit.target
      // giữ nguyên 100% hướng nhìn và giữ điểm 3D focusPoint cố định tuyệt đối ngay dưới con trỏ chuột
      camera.position.lerpVectors(focusPoint, camera.position, s);
      orbit.target.lerpVectors(focusPoint, orbit.target, s);

      const newTargetDist = THREE.MathUtils.clamp(
        camera.position.distanceTo(orbit.target),
        orbit.minDistance + 0.01,
        orbit.maxDistance - 0.01,
      );
      orbit.target
        .copy(camera.position)
        .addScaledVector(_zoomViewDir, newTargetDist);

      const prevDamping = orbit.enableDamping;
      orbit.enableDamping = false;
      orbit.update();
      orbit.enableDamping = prevDamping;

      updateProjectedOverlays();
      requestRender();
    };

    // Nhấp đúp (Double Click):
    // - Trên MÁY TÍNH (Mouse, >= 768px): Nhấp đúp vào thiết bị 3D -> Mở thanh thông tin của thiết bị đó (giữ nguyên 100%)
    // - Trên ĐIỆN THOẠI (Touch / < 768px): Nhấp đúp vào thiết bị 3D -> Bật/Tắt chế độ Nâng cao & Xoay thiết bị (KHÔNG mở thông tin; xem thông tin ở Danh mục thiết bị)
    // - Nhấp đúp vào Bảng Đen -> Mở trình viết bảng đen
    // - Nhấp đúp vào mặt bàn / không gian -> Đưa camera về Góc Nhìn Chuẩn
    const handleDoubleClick = (e: MouseEvent) => {
      if (viewModeRef.current === 'single-asset') return;
      const isTouchOrMobile = lastPointerWasTouch || window.innerWidth < 768;
      if (isTouchOrMobile && performance.now() - lastTouchDoubleTapTime < 500) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      const rect = renderer.domElement.getBoundingClientRect();
      mouseNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseNdc, camera);

      const pickables: THREE.Object3D[] = [];
      instanceObjectsRef.current.forEach((group, instId) => {
        const inst = instancesRef.current.find((i) => i.instanceId === instId);
        if (inst && inst.visible) pickables.push(group);
      });
      const hits = intersectEquipmentPrecisely(pickables);
      if (hits.length > 0) {
        let curr: THREE.Object3D | null = hits[0].object;
        while (curr && !curr.userData?.instanceId) {
          curr = curr.parent;
        }
        const hitInstId = curr?.userData?.instanceId as string | undefined;
        const hitInst = hitInstId
          ? instancesRef.current.find((i) => i.instanceId === hitInstId)
          : undefined;
        const hitAsset = hitInst
          ? assetsMapRef.current.get(hitInst.assetId)
          : undefined;
        if (hitInst && hitAsset) {
          e.stopPropagation();
          if (isTouchOrMobile) {
            toggleMobileDualAxisGizmo(hitInst.instanceId);
            return;
          }
          selectedInstanceIdRef.current = hitInst.instanceId;
          onSelectInstanceRef.current(hitInst.instanceId);
          labSoundEngine.play('ui-toggle', 0.85);
          setDeviceSheetMode('detail');
          return;
        }
      }

      const boardObj = scene.getObjectByName('interactive_blackboard_group');
      if (boardObj && raycaster.intersectObject(boardObj, true).length > 0) {
        e.stopPropagation();
        setIsBlackboardModalOpen(true);
        return;
      }

      handleFocusCameraPreset('bench-close');
    };

    // Ngăn iOS Safari tự phóng to trang web khi dùng 2 ngón tay zoom trên canvas 3D
    const handlePreventBrowserPinch = (ev: Event) => {
      ev.preventDefault();
    };
    const handleCanvasTouchMoveGuard = (ev: TouchEvent) => {
      if (ev.touches.length >= 2) {
        ev.preventDefault();
      }
    };

    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('contextmenu', handleContextMenu);
    renderer.domElement.addEventListener('dblclick', handleDoubleClick);
    renderer.domElement.addEventListener('wheel', handleCanvasWheel, {
      passive: false,
    });
    renderer.domElement.addEventListener('gesturestart', handlePreventBrowserPinch, {
      passive: false,
    } as AddEventListenerOptions);
    renderer.domElement.addEventListener('gesturechange', handlePreventBrowserPinch, {
      passive: false,
    } as AddEventListenerOptions);
    renderer.domElement.addEventListener('touchmove', handleCanvasTouchMoveGuard, {
      passive: false,
    });
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);
    window.addEventListener('blur', cancelActiveOrPendingDrag);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.fov = w < 768 && w < h ? 50 : 42;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
          requestRender();
        }
      }
    });
    resizeObserver.observe(mount);

    requestRender();

    return () => {
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('contextmenu', handleContextMenu);
      renderer.domElement.removeEventListener('dblclick', handleDoubleClick);
      renderer.domElement.removeEventListener('wheel', handleCanvasWheel);
      renderer.domElement.removeEventListener('gesturestart', handlePreventBrowserPinch);
      renderer.domElement.removeEventListener('gesturechange', handlePreventBrowserPinch);
      renderer.domElement.removeEventListener('touchmove', handleCanvasTouchMoveGuard);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
      window.removeEventListener('blur', cancelActiveOrPendingDrag);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      transformControls.dispose();
      orbit.dispose();
      instanceObjectsRef.current.clear();
      OpenLabAssetLoader.disposeObject3D(scene);
      renderer.dispose();
    };
  }, []);

  // 2. Sync Layer Visibility from parent toolbar buttons into the single unified coordinate helper
  useEffect(() => {
    if (showGrid || showAxes) {
      handleUpdateCoordSettings({
        ...(showGrid ? { showFloorGrid: true } : {}),
        ...(showAxes
          ? {
              showWorldAxes: true,
              showOriginMarker: true,
              showAxisLabels: true,
              showNumericTicks: true,
            }
          : {}),
      });
    }
  }, [showGrid, showAxes, handleUpdateCoordSettings]);

  // 3. Sync Scene Instances & Single-Asset Inspection Mode
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    let isCancelled = false;

    async function syncSceneObjects() {
      if (!scene) return;

      if (benchGroupRef.current) {
        benchGroupRef.current.visible = viewMode === 'lab-scene';
      }

      if (singleAssetGroupRef.current) {
        scene.remove(singleAssetGroupRef.current);
        OpenLabAssetLoader.disposeObject3D(singleAssetGroupRef.current);
        singleAssetGroupRef.current = null;
      }

      if (viewMode === 'single-asset') {
        instanceObjectsRef.current.forEach((obj) => {
          obj.visible = false;
        });
        if (transformRef.current) {
          transformRef.current.detach();
        }

        const activeInst = instances.find((i) => i.instanceId === selectedInstanceId);
        const targetAsset =
          selectedCatalogAsset ??
          (activeInst ? assetsMap.get(activeInst.assetId) : null) ??
          Array.from(assetsMap.values())[0];

        if (targetAsset) {
          setLoadingCount((c) => c + 1);
          const loaded = await openLabAssetLoader.loadInstanceMesh(targetAsset);
          setLoadingCount((c) => Math.max(0, c - 1));
          if (isCancelled) return;

          const framing = getRecommended360ScaleAndFraming(targetAsset);
          const arch = targetAsset.geometry.proceduralArchetype;
          const cap =
            arch === 'overflow-can'
              ? 210
              : targetAsset.scientificProperties.capacity?.value ?? 100;
          const previewGroup = loaded.root;
          previewGroup.position.set(0, BENCH_SURFACE_Y, 0);
          previewGroup.scale.set(
            framing.defaultScale,
            framing.defaultScale,
            framing.defaultScale,
          );
          applyInstanceStateToObject3D(
            previewGroup,
            {
              instanceId: 'single-asset-360-preview',
              assetId: targetAsset.assetId,
              assetVersion: targetAsset.assetVersion,
              parentZone: 'bench-main',
              visible: true,
              locked: false,
              labelVisible: false,
              transform: {
                positionM: [0, 0, 0],
                rotationRad: [0, 0, 0],
                displayScale: [
                  framing.defaultScale,
                  framing.defaultScale,
                  framing.defaultScale,
                ],
              },
              instanceState: {
                isPoweredOn: true,
                isHeating: true,
                isValveOpen: false,
                liquidLevelMl:
                  arch === 'beaker-bomex-100' ||
                  arch === 'thermal-heating-vessel'
                    ? 0
                    : Number((cap * 0.5).toFixed(1)),
                baseLiquidLevelMl:
                  arch === 'beaker-bomex-100' ||
                  arch === 'thermal-heating-vessel'
                    ? 0
                    : Number((cap * 0.5).toFixed(1)),
                measuredMassG: 0,
                springExtensionN: 0,
                jawOpeningMm: 0,
                multimeterMode: 'DCV',
                multimeterValue: 0,
                galvanometerDeflection: 0,
                incidentAngleDeg: 40,
                temperatureC: 25,
                magnification: 40,
              },
            },
            targetAsset,
          );
          scene.add(previewGroup);
          singleAssetGroupRef.current = previewGroup;
        }
        requestRenderRef.current();
        return;
      }

      const currentIds = new Set(instances.map((i) => i.instanceId));
      const removedEntries: Array<[string, THREE.Group]> = [];
      for (const [instId, obj] of instanceObjectsRef.current.entries()) {
        if (!currentIds.has(instId)) {
          removedEntries.push([instId, obj]);
        }
      }
      if (removedEntries.length === 1) {
        const [instId, obj] = removedEntries[0];
        if (transformRef.current?.object === obj) {
          transformRef.current.detach();
        }
        instanceObjectsRef.current.delete(instId);
        animateObjectJumpIntoCabinet(instId, obj);
      } else if (removedEntries.length > 1) {
        for (const [instId, obj] of removedEntries) {
          if (transformRef.current?.object === obj) {
            transformRef.current.detach();
          }
          scene.remove(obj);
          OpenLabAssetLoader.disposeObject3D(obj);
          instanceObjectsRef.current.delete(instId);
        }
        clearCabinetStoredMeshes();
      }

      for (const inst of instances) {
        const asset = assetsMap.get(inst.assetId);
        if (!asset) continue;

        let group = instanceObjectsRef.current.get(inst.instanceId);
        // Nếu sản phẩm vừa được cập nhật thông số hoặc nạp đè bằng file .HTML (assetVersion mới), hủy mesh cũ và dựng lại tại chỗ!
        if (group && group.userData.assetVersion !== asset.assetVersion) {
          if (transformRef.current?.object === group) {
            transformRef.current.detach();
          }
          scene.remove(group);
          OpenLabAssetLoader.disposeObject3D(group);
          instanceObjectsRef.current.delete(inst.instanceId);
          group = undefined;
        }
        if (!group) {
          setLoadingCount((c) => c + 1);
          const loaded = await openLabAssetLoader.loadInstanceMesh(asset);
          setLoadingCount((c) => Math.max(0, c - 1));
          if (isCancelled) return;

          group = loaded.root;
          group.userData.instanceId = inst.instanceId;
          group.userData.assetId = inst.assetId;
          group.userData.assetVersion = asset.assetVersion;
          group.userData.customLabel = inst.customLabel || asset.name.vi;
          group.userData.bboxHeight = asset.geometry.boundingBoxM.height;
          // Đặt thiết bị chuẩn anchor 'base-center' lên mặt bàn tại worldY = BENCH_SURFACE_Y + localOffsetY
          group.position.set(
            inst.transform.positionM[0],
            BENCH_SURFACE_Y + inst.transform.positionM[1],
            inst.transform.positionM[2],
          );
          scene.add(group);
          instanceObjectsRef.current.set(inst.instanceId, group);
        } else if (group.parent !== scene) {
          scene.add(group);
        }
        group.userData.customLabel = inst.customLabel || asset.name.vi;
        group.userData.bboxHeight = asset.geometry.boundingBoxM.height;

        group.visible = inst.visible;
        const isPourAnimating =
          activePourAnimRef.current &&
          (activePourAnimRef.current.sourceId === inst.instanceId ||
            activePourAnimRef.current.targetId === inst.instanceId);
        const isDispenseAnimating =
          activeDispenseAnimRef.current &&
          (activeDispenseAnimRef.current.targetId === inst.instanceId ||
            activeDispenseAnimRef.current.dispenserId === inst.instanceId);
        const isTiltPouringActive =
          tiltPourStateRef.current.isPouring &&
          (tiltPourStateRef.current.sourceId === inst.instanceId ||
            tiltPourStateRef.current.targetId === inst.instanceId);

        if (!isPourAnimating) {
          group.rotation.y = inst.transform.rotationRad[1];
        }
        group.scale.set(
          inst.transform.displayScale[0],
          inst.transform.displayScale[1],
          inst.transform.displayScale[2],
        );

        const liqNodeBefore = group.getObjectByName('liquid_surface');
        const prevLiqScaleY = liqNodeBefore?.scale.y;
        const prevLiqRotZ = liqNodeBefore?.rotation.z;
        const prevLiqVis = liqNodeBefore?.visible;
        applyInstanceStateToObject3D(group, inst, asset);
        if (
          (isPourAnimating || isDispenseAnimating || isTiltPouringActive) &&
          prevLiqScaleY !== undefined
        ) {
          const liqSurf = group.getObjectByName('liquid_surface');
          if (liqSurf) {
            liqSurf.scale.y = prevLiqScaleY;
            if (prevLiqRotZ !== undefined) liqSurf.rotation.z = prevLiqRotZ;
            if (prevLiqVis !== undefined) liqSurf.visible = prevLiqVis;
          }
        }
      }

      rebuild3DBananaWiresInSceneRef.current();
      requestRenderRef.current();
    }

    syncSceneObjects();

    return () => {
      isCancelled = true;
    };
  }, [
    instances,
    assetsMap,
    viewMode,
    selectedInstanceId,
    selectedCatalogAsset?.assetId,
    selectedCatalogAsset?.assetVersion,
  ]);

  // 4. Sync Selection Box, Ground Target Ring & Rotate Gizmo (Đã loại bỏ đường nối tự động 2 dây thừa)
  useEffect(() => {
    const transformControls = transformRef.current;
    const boxHelper = selectionBoxHelperRef.current;
    const ring = selectionRingRef.current;
    const neuralGroup = neuralSynapseBeamGroupRef.current;
    if (neuralGroup) {
      while (neuralGroup.children.length > 0) {
        const ch = neuralGroup.children[0];
        neuralGroup.remove(ch);
        OpenLabAssetLoader.disposeObject3D(ch);
      }
    }
    if (!transformControls || !boxHelper || !ring) return;

    if (viewMode === 'single-asset') {
      transformControls.detach();
      return;
    }

    const selectedInst = instances.find((i) => i.instanceId === selectedInstanceId);
    const selectedObj = selectedInstanceId
      ? instanceObjectsRef.current.get(selectedInstanceId)
      : undefined;

    if (selectedInst && selectedObj && selectedInst.visible) {
      boxHelper.setFromObject(selectedObj);
      boxHelper.visible = !isStudentMode;

      ring.position.set(
        selectedObj.position.x,
        BENCH_SURFACE_Y + 0.002,
        selectedObj.position.z,
      );
      ring.visible = true;

      if (!selectedInst.locked && toolMode === 'rotate') {
        const selAsset = assetsMap.get(selectedInst.assetId);
        const selArch = selAsset?.geometry.proceduralArchetype;
        const canTiltPour =
          selArch === 'beaker-250' ||
          selArch === 'graduated-cylinder' ||
          selArch === 'erlenmeyer-flask' ||
          selArch === 'overflow-can' ||
          selArch === 'porcelain-dish';
        transformControls.setMode('rotate');
        transformControls.showX = canTiltPour;
        transformControls.showY = true;
        transformControls.showZ = canTiltPour;
        transformControls.attach(selectedObj);
      } else {
        transformControls.detach();
      }
    } else {
      boxHelper.visible = false;
      ring.visible = false;
      transformControls.detach();
    }

    updateProjectedOverlays();
    requestRenderRef.current();
  }, [
    selectedInstanceId,
    instances,
    assetsMap,
    toolMode,
    viewMode,
    showDimensions,
    isStudentMode,
    isNeuralGuideEnabled,
    updateProjectedOverlays,
  ]);

  // Smooth Camera Actions for the Vertical Right Toolbar (Section 4.D)
  const handleSmoothZoom = (factor: number) => {
    const camera = cameraRef.current;
    const orbit = orbitRef.current;
    if (!camera || !orbit) return;

    labSoundEngine.play('camera-zoom', 0.75);
    const dir = new THREE.Vector3().subVectors(camera.position, orbit.target);
    const nextDist = THREE.MathUtils.clamp(dir.length() * factor, 0.28, 3.1);
    dir.normalize().multiplyScalar(nextDist);
    cameraGoalPosRef.current = new THREE.Vector3().addVectors(orbit.target, dir);
    cameraGoalTargetRef.current = orbit.target.clone();
    requestRenderRef.current();
  };

  const handleToggleTopView = () => {
    labSoundEngine.play('camera-zoom', 0.8);
    const nextTop = !isTopViewActive;
    setIsTopViewActive(nextTop);
    if (nextTop) {
      cameraGoalPosRef.current = new THREE.Vector3(
        0.0,
        BENCH_SURFACE_Y + 1.42,
        0.18,
      );
      cameraGoalTargetRef.current = new THREE.Vector3(
        0.0,
        BENCH_SURFACE_Y + 0.02,
        0.0,
      );
    } else {
      cameraGoalPosRef.current = new THREE.Vector3(
        0.0,
        BENCH_SURFACE_Y + 0.72,
        1.08,
      );
      cameraGoalTargetRef.current = new THREE.Vector3(
        0.0,
        BENCH_SURFACE_Y + 0.06,
        -0.08,
      );
    }
    requestRenderRef.current();
  };

  const handleFocusCameraPreset = useCallback(
    (preset: 'bench-close' | 'room-overview') => {
      labSoundEngine.play('camera-zoom', 0.85);
      const viewportW = mountRef.current?.clientWidth ?? window.innerWidth;
      const viewportH = mountRef.current?.clientHeight ?? window.innerHeight;
      const isPortraitMobile = viewportW < 768 && viewportW < viewportH;
      if (preset === 'room-overview') {
        cameraGoalPosRef.current = new THREE.Vector3(
          0.0,
          isPortraitMobile ? 2.35 : 2.15,
          isPortraitMobile ? 3.35 : 2.85,
        );
        cameraGoalTargetRef.current = new THREE.Vector3(0.0, 0.88, -0.1);
        onNotify(
          'Chế độ Xem Toàn Phòng Kín: Góc nhìn giới hạn bên trong phòng thí nghiệm 3D.',
          'info',
        );
      } else {
        cameraGoalPosRef.current = new THREE.Vector3(
          0.0,
          BENCH_SURFACE_Y + (isPortraitMobile ? 0.88 : 0.72),
          isPortraitMobile ? 1.62 : 1.08,
        );
        cameraGoalTargetRef.current = new THREE.Vector3(
          0.0,
          BENCH_SURFACE_Y + 0.06,
          -0.08,
        );
        onNotify(
          'Đã đưa camera về Góc Nhìn Chuẩn bao quát bàn gỗ & tủ kính 2 tầng.',
          'info',
        );
      }
      requestRenderRef.current();
    },
    [onNotify],
  );

  const handleCaptureSnapshot = () => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!renderer || !scene || !camera) return;

    labSoundEngine.play('camera-shutter', 0.95);
    renderer.render(scene, camera);
    const dataUrl = renderer.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `openlab3d-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    onNotify('Đã chụp và lưu ảnh bàn thí nghiệm 3D (.png).', 'success');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const assetId = e.dataTransfer.getData('application/openlab-asset-id');
    if (!assetId) return;

    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    if (!camera || !renderer) {
      onDropAssetIntoScene(assetId, [0, 0, 0.08]);
      return;
    }

    const rect = renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.ray.intersectPlane(_rayPlane, _dropPoint);
    if (hit) {
      const clampedX = Number(
        THREE.MathUtils.clamp(_dropPoint.x, -BENCH_LIMIT_X, BENCH_LIMIT_X).toFixed(3),
      );
      const clampedZ = Number(
        THREE.MathUtils.clamp(_dropPoint.z, -BENCH_LIMIT_Z, BENCH_LIMIT_Z).toFixed(3),
      );
      onDropAssetIntoScene(assetId, [clampedX, 0, clampedZ]);
    } else {
      onDropAssetIntoScene(assetId, [0, 0, 0.08]);
    }
  };

  const visibleBenchInstances = instances.filter((i) => i.visible);
  const activeInstance =
    instances.find((i) => i.instanceId === selectedInstanceId) ??
    (visibleBenchInstances.length > 0
      ? visibleBenchInstances[visibleBenchInstances.length - 1]
      : null);
  const activeAsset =
    viewMode === 'single-asset'
      ? selectedCatalogAsset ||
        (activeInstance
          ? assetsMap.get(activeInstance.assetId) ??
            htmlEquipmentModuleRegistry.getModule(activeInstance.assetId)?.asset ??
            null
          : null) ||
        Array.from(assetsMap.values())[0] ||
        null
      : activeInstance
        ? assetsMap.get(activeInstance.assetId) ??
          htmlEquipmentModuleRegistry.getModule(activeInstance.assetId)?.asset ??
          null
        : null;

  // ===========================================================================
  // CHẾ ĐỘ "SOI 360° THIẾT BỊ" (viewMode === 'single-asset')
  // - Nút Icon 1: Bật/tắt ẩn hiện chú thích chi tiết từng chức năng/bộ phận
  // - Nút Icon 2: Xem hướng dẫn sử dụng thiết bị
  // - Nút Icon 3: Mở bảng hiệu chỉnh thông số thiết bị (đồng bộ trực tiếp lên vật 3D)
  // ===========================================================================
  const [show360PartAnnotations, setShow360PartAnnotations] =
    useState<boolean>(true);
  const [selected360PartPinId, setSelected360PartPinId] = useState<
    string | null
  >(null);
  const [singleAssetScale, setSingleAssetScale] = useState<number>(1.45);
  const [singleAssetRotYDeg, setSingleAssetRotYDeg] = useState<number>(0);
  const [singleAssetTiltZDeg, setSingleAssetTiltZDeg] = useState<number>(0);
  const [is360AutoRotate, setIs360AutoRotate] = useState<boolean>(false);
  const [singleAssetSimState, setSingleAssetSimState] = useState<
    SceneInstance['instanceState']
  >({
    isPoweredOn: true,
    isHeating: true,
    liquidLevelMl: 50,
    measuredMassG: 0,
    incidentAngleDeg: 40,
    temperatureC: 25,
    springExtensionN: 0,
    jawOpeningMm: 0,
    multimeterMode: 'V',
    multimeterValue: 0,
    galvanometerDeflection: 0,
    magnification: 40,
  });

  // Reset default calibration values when switching inspected equipment in 360° mode
  useEffect(() => {
    if (viewMode !== 'single-asset' || !activeAsset) return;
    const arch = activeAsset.geometry.proceduralArchetype;
    const cap =
      arch === 'overflow-can'
        ? 210
        : activeAsset.scientificProperties.capacity?.value ?? 100;
    const framing = getRecommended360ScaleAndFraming(activeAsset);
    const customMod = htmlEquipmentModuleRegistry.getModule(activeAsset.assetId);

    setSingleAssetScale(framing.defaultScale);
    setSingleAssetRotYDeg(0);
    setSingleAssetTiltZDeg(0);
    setSelected360PartPinId(null);
    setSingleAssetSimState({
      isPoweredOn: true,
      isHeating: true,
      isValveOpen: false,
      liquidLevelMl: Number((cap * 0.5).toFixed(1)),
      baseLiquidLevelMl: Number((cap * 0.5).toFixed(1)),
      measuredMassG: 0,
      incidentAngleDeg: 40,
      temperatureC: 25,
      springExtensionN: 0,
      jawOpeningMm: 0,
      multimeterMode: 'DCV',
      multimeterValue: 0,
      galvanometerDeflection: 0,
      magnification: 40,
      ...(customMod
        ? { [customMod.moduleControls.stateKey]: customMod.moduleControls.defaultValue }
        : {}),
    });

    // Focus camera cleanly on the centered 360° equipment according to its physical size
    cameraGoalPosRef.current = new THREE.Vector3(
      framing.cameraPos[0],
      framing.cameraPos[1],
      framing.cameraPos[2],
    );
    cameraGoalTargetRef.current = new THREE.Vector3(
      0.0,
      BENCH_SURFACE_Y + framing.cameraTargetYOffset,
      0.0,
    );
    requestRenderRef.current();
  }, [viewMode, activeAsset?.assetId]);

  // Apply live 360° calibration parameters directly to the 3D mesh in single-asset mode
  useEffect(() => {
    if (viewMode !== 'single-asset' || !activeAsset) return;
    const previewObj = singleAssetGroupRef.current;
    if (!previewObj) return;

    previewObj.scale.set(
      singleAssetScale,
      singleAssetScale,
      singleAssetScale,
    );
    previewObj.rotation.set(
      0,
      (singleAssetRotYDeg * Math.PI) / 180,
      -(singleAssetTiltZDeg * Math.PI) / 180,
    );

    const virtualInst: SceneInstance = {
      instanceId: 'single-asset-360-preview',
      assetId: activeAsset.assetId,
      assetVersion: activeAsset.assetVersion,
      visible: true,
      locked: false,
      parentZone: 'bench-main',
      labelVisible: false,
      transform: {
        positionM: [0, 0, 0],
        rotationRad: [
          0,
          (singleAssetRotYDeg * Math.PI) / 180,
          -(singleAssetTiltZDeg * Math.PI) / 180,
        ],
        displayScale: [singleAssetScale, singleAssetScale, singleAssetScale],
      },
      instanceState: singleAssetSimState,
    };

    applyInstanceStateToObject3D(previewObj, virtualInst, activeAsset);
    const liqSurf = previewObj.getObjectByName('liquid_surface');
    if (liqSurf) {
      liqSurf.rotation.z = -previewObj.rotation.z * 0.78;
    }
    requestRenderRef.current();
  }, [
    viewMode,
    activeAsset,
    singleAssetScale,
    singleAssetRotYDeg,
    singleAssetTiltZDeg,
    singleAssetSimState,
    loadingCount,
  ]);

  // Auto-rotate 360° camera orbit loop when enabled in single-asset mode
  useEffect(() => {
    const orbit = orbitRef.current;
    if (!orbit) return;
    const activeAuto = viewMode === 'single-asset' && is360AutoRotate;
    orbit.autoRotate = activeAuto;
    orbit.autoRotateSpeed = 2.4;
    if (!activeAuto) return;

    const timer = window.setInterval(() => {
      requestRenderRef.current();
    }, 30);
    return () => {
      window.clearInterval(timer);
      if (orbitRef.current) {
        orbitRef.current.autoRotate = false;
      }
    };
  }, [viewMode, is360AutoRotate]);

  return (
    <div
      className="relative flex-1 w-full h-full min-h-[520px] lg:min-h-[620px] bg-[#131C2E] rounded-[14px] border border-slate-800 overflow-hidden select-none flex flex-col transition-all shadow-[0_14px_40px_rgba(0,0,0,0.45)]"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Thanh Header Không Gian Thí Nghiệm 3D chuẩn openlan3dmixxx.vercel.app */}
      {isSpatialHeaderVisible && (
        <div className="px-3.5 py-1.5 border-b border-slate-800 bg-[#0F172A] flex flex-wrap items-center justify-between gap-2 z-20 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold tracking-tight text-slate-100 leading-tight truncate">
                Bàn Thí Nghiệm Khoa Học Tự Nhiên 3D — {environment.name.vi}
              </h2>
              <p className="hidden xl:block text-[10px] text-slate-400 truncate">
                Nhấp đúp vào vật phẩm để xem chi tiết • Nhấp đúp vào mặt bàn để về góc nhìn chuẩn • Chuột phải bật 2 trục nâng &amp; xoay
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleFocusCameraPreset('bench-close')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              title="Đưa góc nhìn về chính diện bàn thí nghiệm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Góc Nhìn Chuẩn</span>
            </button>

            <button
              type="button"
              onClick={handleArrangeItemsToShelvesOrReset}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              title="Đưa gọn vật phẩm trên bàn lên kệ gỗ 2 bên hoặc đặt lại"
            >
              <Archive className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Đưa Vật Phẩm Lên Kệ / Đặt Lại</span>
              <span className="sm:hidden">Lên Kệ</span>
            </button>

            <button
              type="button"
              onClick={onToggleLabels}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                showLabels
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title="Bật/tắt nhãn tên và thông số đo trên đầu thiết bị"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Nhãn Thiết Bị: {showLabels ? 'BẬT' : 'TẮT'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setUnderCabinetTab('stored');
                setOpenUnderCabinetModalSide('left');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-950/70 hover:bg-amber-900/80 border border-amber-600/50 text-amber-300 transition-colors cursor-pointer"
              title="Mở Trang Vật Phẩm — Tủ Vật Phẩm Trái & Phải"
            >
              <Archive className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Tủ Vật Phẩm 2 Bên</span>
              <span className="md:hidden">Tủ Đồ</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBlackboardModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 transition-colors cursor-pointer"
              title="Viết ghi chú hoặc công thức lên Bảng Đen 3D trên tường"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Viết Bảng Đen</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (activeAsset) {
                  setSelectedCodeAssetId(activeAsset.assetId);
                } else {
                  const firstAsset = Array.from(assetsMap.values())[0];
                  if (firstAsset) setSelectedCodeAssetId(firstAsset.assetId);
                }
                setIsCodeModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/60 text-indigo-300 transition-colors cursor-pointer"
              title="Xem, sao chép hoặc tải xuống mã nguồn .HTML độc lập của từng thiết bị"
            >
              <Code className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Code Thiết Bị (.HTML)</span>
              <span className="sm:hidden">Code</span>
            </button>

            {!isStudentMode && (
              <div className="flex items-center p-0.5 rounded-md bg-slate-900 border border-slate-700">
                <button
                  type="button"
                  onClick={() => onViewModeChange('lab-scene')}
                  className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-colors cursor-pointer ${
                    viewMode === 'lab-scene'
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Phòng Lab
                </button>
                <button
                  type="button"
                  onClick={() => onViewModeChange('single-asset')}
                  className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-colors cursor-pointer ${
                    viewMode === 'single-asset'
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Soi 360°
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onToggleFullscreen}
              className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsSpatialHeaderVisible(false)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-slate-800/80 hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-700/60 transition-colors cursor-pointer"
              title="Ẩn thanh công cụ trên để mở rộng tối đa không gian thí nghiệm"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Ẩn Công Cụ</span>
            </button>
          </div>
        </div>
      )}

      {/* Main WebGL Canvas Stage */}
      <div
        className="ol3d-webgl-stage relative flex-1 w-full h-full overflow-hidden touch-none"
      >
        <div
          ref={mountRef}
          className="w-full h-full touch-none"
          aria-label="OpenLab 3D Interactive WebGL Viewport"
        />

        {/* ========================================================================
            BẢNG CHẨN ĐOÁN MẠCH ĐIỆN 1 CHIỀU (6 TRƯỜNG HỢP VẬT LÝ) & CHỈ SỐ ĐO 3D
           ======================================================================== */}
        {viewMode === 'lab-scene' && circuitSolverResult && (
          <div className="absolute top-3 left-3 z-25 max-w-[390px] rounded-xl bg-slate-950/92 border border-slate-700/80 shadow-2xl backdrop-blur-md p-2.5 text-slate-100 pointer-events-auto">
            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${
                    circuitSolverResult.statusSeverity === 'danger'
                      ? 'bg-red-500 animate-ping'
                      : circuitSolverResult.statusSeverity === 'warning'
                        ? 'bg-amber-400 animate-pulse'
                        : circuitSolverResult.statusSeverity === 'normal'
                          ? 'bg-emerald-400'
                          : 'bg-slate-400'
                  }`}
                />
                <span className="text-[11px] font-extrabold tracking-wide uppercase text-amber-300">
                  ⚡ Bộ Giải Mạch Điện (TH{circuitSolverResult.caseId}/6)
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveWireColorHex(0xef4444)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border cursor-pointer ${
                    activeWireColorHex === 0xef4444
                      ? 'bg-red-600 text-white border-red-300'
                      : 'bg-slate-900 text-red-300 border-red-500/40'
                  }`}
                  title="Chọn dây bắp chuối màu Đỏ (+)"
                >
                  🔴 Dây Đỏ
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWireColorHex(0x2563eb)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border cursor-pointer ${
                    activeWireColorHex === 0x2563eb
                      ? 'bg-blue-600 text-white border-blue-300'
                      : 'bg-slate-900 text-blue-300 border-blue-500/40'
                  }`}
                  title="Chọn dây bắp chuối màu Xanh (-)"
                >
                  🔵 Dây Xanh
                </button>
                {circuitWires.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleApplyCircuitPresetInternal('clear-wires')}
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 hover:bg-red-900/70 text-slate-200 border border-slate-600 cursor-pointer"
                    title="Tháo tất cả dây điện đang cắm"
                  >
                    ✂️ Rút hết ({circuitWires.length})
                  </button>
                )}
              </div>
            </div>

            {pendingTerminalPick && (
              <div className="mt-1.5 px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-400/60 text-[11px] text-amber-200 font-semibold">
                🔌 Đang cầm đầu dây từ cọc{' '}
                <span className="font-mono font-bold text-white">
                  [{pendingTerminalPick.terminalId}]
                </span>{' '}
                — Hãy click vào cọc thứ 2 trên thiết bị 3D để cắm dây!
              </div>
            )}

            <div
              className={`mt-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold leading-snug border ${
                circuitSolverResult.statusSeverity === 'danger'
                  ? 'bg-red-950/90 border-red-500 text-red-200'
                  : circuitSolverResult.statusSeverity === 'warning'
                    ? 'bg-amber-950/85 border-amber-500/80 text-amber-200'
                    : circuitSolverResult.statusSeverity === 'normal'
                      ? 'bg-emerald-950/85 border-emerald-500/80 text-emerald-200'
                      : 'bg-slate-900/90 border-slate-700 text-slate-300'
              }`}
            >
              <div className="font-bold mb-0.5">
                {circuitSolverResult.warningTitleVi}
              </div>
              <div className="opacity-95">
                {circuitSolverResult.warningMessageVi}
              </div>
            </div>

            <div className="mt-2 grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
              <div className="rounded bg-slate-900/90 border border-slate-800 px-1.5 py-1">
                <div className="text-slate-400">U nguồn</div>
                <div className="text-amber-300 font-bold text-xs">
                  {circuitSolverResult.sourceVoltageV.toFixed(2)}V
                </div>
              </div>
              <div className="rounded bg-slate-900/90 border border-slate-800 px-1.5 py-1">
                <div className="text-slate-400">Ampe kế</div>
                <div className="text-emerald-300 font-bold text-xs">
                  {circuitSolverResult.ammeterReadingA.toFixed(3)}A
                </div>
              </div>
              <div className="rounded bg-slate-900/90 border border-slate-800 px-1.5 py-1">
                <div className="text-slate-400">Vôn kế</div>
                <div className="text-sky-300 font-bold text-xs">
                  {circuitSolverResult.voltmeterReadingV.toFixed(2)}V
                </div>
              </div>
              <div className="rounded bg-slate-900/90 border border-slate-800 px-1.5 py-1">
                <div className="text-slate-400">R biến trở</div>
                <div className="text-purple-300 font-bold text-xs">
                  {circuitSolverResult.rheostatEffectiveOhm.toFixed(1)}Ω
                </div>
              </div>
            </div>

            <div className="mt-2 pt-1.5 border-t border-slate-800/90 flex flex-wrap items-center gap-1">
              <span className="text-[10px] text-slate-400 mr-0.5">
                Thử nhanh 6 TH:
              </span>
              <button
                type="button"
                onClick={() => handleApplyCircuitPresetInternal('case6-correct')}
                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600/85 hover:bg-emerald-500 text-white cursor-pointer"
                title="Trường hợp 6: Mạch chuẩn 3.0V (Ampe kế nối tiếp, Vôn kế song song bóng đèn)"
              >
                ✅ TH6: Mạch Chuẩn
              </button>
              <button
                type="button"
                onClick={() =>
                  handleApplyCircuitPresetInternal('case2-voltmeter-series')
                }
                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-600/80 hover:bg-amber-500 text-white cursor-pointer"
                title="Trường hợp 2: Mắc Vôn kế nối tiếp làm cản trở dòng điện"
              >
                ⚠️ TH2: Vôn kế nối tiếp
              </button>
              <button
                type="button"
                onClick={() =>
                  handleApplyCircuitPresetInternal('case3-ammeter-parallel-short')
                }
                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600/85 hover:bg-red-500 text-white cursor-pointer"
                title="Trường hợp 3: Mắc Ampe kế song song gây Đoản mạch (Chập mạch)"
              >
                🔥 TH3: Đoản mạch
              </button>
              <button
                type="button"
                onClick={() =>
                  handleApplyCircuitPresetInternal('case4-reverse-polarity')
                }
                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-600/80 hover:bg-purple-500 text-white cursor-pointer"
                title="Trường hợp 4: Cắm ngược cực (+) và (-) của đồng hồ đo"
              >
                🔄 TH4: Ngược cực
              </button>
              <button
                type="button"
                onClick={() =>
                  handleApplyCircuitPresetInternal('case5-over-range-06a')
                }
                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-600/80 hover:bg-orange-500 text-white cursor-pointer"
                title="Trường hợp 5: Cắm sai vào cả 2 cọc dương bỏ trống cọc âm (-)"
              >
                ⚠️ TH5: Sai cọc đo
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================
            NGĂN KÉO "KHO ĐỒ DÙNG & DÂY ĐIỆN 3D" — KÉO HOẶC CLICK ĐỂ LẤY ĐỒ RA BÀN
           ======================================================================== */}
        {viewMode === 'lab-scene' && isEquipmentPickerOpen && (
          <div className="absolute top-12 right-3 z-30 w-[360px] max-w-[94vw] max-h-[78vh] flex flex-col rounded-2xl bg-slate-950/95 border border-amber-400/50 shadow-2xl backdrop-blur-xl text-slate-100 overflow-hidden pointer-events-auto">
            <div className="px-3.5 py-2.5 bg-gradient-to-r from-amber-600/30 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <span>🧰 Kho Đồ Dùng & Dây Điện 3D</span>
                </h3>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  Chọn dụng cụ đã có để đặt ra bàn hoặc bấm vào cọc 3D để nối dây
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEquipmentPickerOpen(false)}
                className="p-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cụm công cụ Dây Điện Cắm Bắp Chuối 3D */}
            <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-200">
                  🔌 Dây Điện Bắp Chuối (Click vào 2 cọc 3D để nối):
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Đang cắm: {circuitWires.length} dây
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveWireColorHex(0xef4444)}
                  className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                    activeWireColorHex === 0xef4444
                      ? 'bg-red-600 text-white border-red-300 shadow'
                      : 'bg-slate-950 text-red-300 border-red-500/40'
                  }`}
                >
                  🔴 Dây Đỏ (+)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWireColorHex(0x2563eb)}
                  className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                    activeWireColorHex === 0x2563eb
                      ? 'bg-blue-600 text-white border-blue-300 shadow'
                      : 'bg-slate-950 text-blue-300 border-blue-500/40'
                  }`}
                >
                  🔵 Dây Xanh (-)
                </button>
                <button
                  type="button"
                  onClick={() => handleSpawnDcCircuitKit('correct')}
                  className="py-1 px-2 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-300/60 cursor-pointer"
                  title="Lấy trọn bộ mạch điện 1 chiều và tự động nối dây chuẩn 3.0V"
                >
                  ⚡ Mạch 3V
                </button>
                <button
                  type="button"
                  onClick={() => handleSpawnThermalIceKit()}
                  className="py-1 px-2 rounded-lg text-[11px] font-bold bg-sky-600 hover:bg-sky-500 text-white border border-sky-300/60 cursor-pointer"
                  title="Lấy từng dụng cụ rời của thí nghiệm Đun Nước Đá & Sự Sôi (Đèn cồn, Kiềng 3 chân, Bình chịu nhiệt, Nước đá viên, Nhiệt kế, Đồng hồ)"
                >
                  🧊🔥 Đun Đá
                </button>
                <button
                  type="button"
                  onClick={() => handleSpawnPascalHydraulicKit()}
                  className="py-1 px-2 rounded-lg text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-200/80 cursor-pointer"
                  title="Lấy Bộ Bình thông nhau & Pit-tông thủy lực Pascal (Hình 16.3 SGK KHTN: S₁ = 2·S₂) kèm Quả nặng chuẩn 100g (1.0N)"
                >
                  💧⚖️ Áp Suất Pascal
                </button>
              </div>
            </div>

            {/* Bộ lọc danh mục thiết bị */}
            <div className="px-3 py-1.5 bg-slate-950 border-b border-slate-800 flex items-center gap-1 overflow-x-auto">
              {[
                { id: 'all', label: 'Tất cả đồ dùng' },
                { id: 'dc-circuit', label: '⚡ Điện 1 Chiều' },
                { id: 'mechanics', label: '⚙️ Cơ - Nhiệt' },
                { id: 'optics-chem-bio', label: '🔬 Quang - Hóa - Sinh' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setEquipmentPickerCategory(
                      tab.id as
                        | 'all'
                        | 'dc-circuit'
                        | 'mechanics'
                        | 'optics-chem-bio',
                    )
                  }
                  className={`px-2 py-1 rounded-md text-[10px] font-bold whitespace-nowrap cursor-pointer ${
                    equipmentPickerCategory === tab.id
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Danh sách thiết bị có sẵn để kéo/lấy ra bàn */}
            <div className="p-2.5 overflow-y-auto space-y-1.5 flex-1">
              {Array.from(assetsMap.values())
                .filter((asset) => {
                  const arch = asset.geometry.proceduralArchetype || '';
                  const isDc = arch.startsWith('dc-');
                  if (equipmentPickerCategory === 'dc-circuit') return isDc;
                  if (equipmentPickerCategory === 'mechanics') {
                    return (
                      !isDc &&
                      (arch === 'pascal-hydraulic-press' ||
                        arch === 'pascal-weight-100g' ||
                        asset.category === 'force-measurement' ||
                        asset.category === 'mass-measurement' ||
                        asset.category === 'thermal-equipment' ||
                        asset.category === 'solid-specimens' ||
                        asset.category.includes('Cơ') ||
                        asset.category.includes(' Đo') ||
                        asset.category.includes('Điện'))
                    );
                  }
                  if (equipmentPickerCategory === 'optics-chem-bio') {
                    return (
                      !isDc &&
                      !asset.category.includes('Cơ') &&
                      !asset.category.includes(' Đo')
                    );
                  }
                  return true;
                })
                .map((asset) => {
                  const onTableInstances = instances.filter(
                    (i) => i.assetId === asset.assetId && i.visible,
                  );
                  const storedInstances = instances.filter(
                    (i) => i.assetId === asset.assetId && !i.visible,
                  );
                  return (
                    <div
                      key={asset.assetId}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(
                          'application/openlab-asset-id',
                          asset.assetId,
                        );
                      }}
                      className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-400/50 flex items-center justify-between gap-2 transition-all"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">
                          {asset.name.vi}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{asset.category}</span>
                          {onTableInstances.length > 0 && (
                            <span className="text-emerald-400 font-semibold">
                              • Đang ở trên bàn ({onTableInstances.length})
                            </span>
                          )}
                          {storedInstances.length > 0 && (
                            <span className="text-amber-300 font-semibold">
                              • Trong tủ ({storedInstances.length})
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const jitterX = (Math.random() - 0.5) * 0.36;
                          const jitterZ = (Math.random() - 0.5) * 0.24;
                          onDropAssetIntoScene(asset.assetId, [
                            Number(jitterX.toFixed(2)),
                            0,
                            Number(jitterZ.toFixed(2)),
                          ]);
                          labSoundEngine.play('wood-place', 0.85);
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow cursor-pointer shrink-0"
                      >
                        + Lấy ra bàn
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Đã ẩn thanh công cụ nổi góc trên phải theo yêu cầu */}

        {/* Thông báo Toast khi Lưu Thí Nghiệm */}
        {spatialSaveToast && (
          <div className="absolute top-13 right-14 z-30 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/95 border border-emerald-500/60 text-emerald-200 text-xs font-medium shadow-xl backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{spatialSaveToast}</span>
          </div>
        )}

        {/* Banner trạng thái khi đang mở 2 Trục Điều Khiển 3D (Desktop >= 768px giữ nguyên; Mobile < 768px dùng thanh Nâng/Xoay chuyên biệt ở đáy) */}
        {dualAxisGizmoInstanceId &&
          viewMode === 'lab-scene' &&
          (() => {
            const gInst = instances.find(
              (i) => i.instanceId === dualAxisGizmoInstanceId,
            );
            const gAsset = gInst ? assetsMap.get(gInst.assetId) : undefined;
            const gTitle =
              gInst?.customLabel || gAsset?.name.vi || 'Thiết bị 3D';
            const gObj = instanceObjectsRef.current.get(dualAxisGizmoInstanceId);
            const currentHeightCm = Math.max(
              0,
              Math.round(
                ((gObj
                  ? gObj.position.y - BENCH_SURFACE_Y
                  : gInst?.transform.positionM[1] ?? 0) *
                  100),
              ),
            );
            const rawAngleDeg = Math.round(
              THREE.MathUtils.radToDeg(
                gObj ? gObj.rotation.y : gInst?.transform.rotationRad[1] ?? 0,
              ),
            );
            const currentAngleDeg = ((rawAngleDeg % 360) + 360) % 360;

            const applyMobileLiftCm = (cmVal: number) => {
              const obj = instanceObjectsRef.current.get(dualAxisGizmoInstanceId);
              if (!obj) return;
              const phys = gravityPhysicsRef.current.get(dualAxisGizmoInstanceId);
              if (phys) {
                phys.falling = false;
                phys.vy = 0;
              }
              const clampedM = THREE.MathUtils.clamp(cmVal / 100, 0, 1.15);
              obj.position.y = BENCH_SURFACE_Y + clampedM;
              if (dualAxisGizmoRef.current) {
                dualAxisGizmoRef.current.position.copy(obj.position);
              }
              setMobileGizmoTick((t) => (t + 1) % 10000);
              updateProjectedOverlays();
              requestRenderRef.current();
            };

            const applyMobileRotateDeg = (degVal: number) => {
              const obj = instanceObjectsRef.current.get(dualAxisGizmoInstanceId);
              if (!obj || !gInst) return;
              const rad = Number(THREE.MathUtils.degToRad(degVal).toFixed(3));
              obj.rotation.y = rad;
              onUpdateTransformRef.current(
                dualAxisGizmoInstanceId,
                gInst.transform.positionM,
                [
                  gInst.transform.rotationRad[0],
                  rad,
                  gInst.transform.rotationRad[2],
                ],
              );
              setMobileGizmoTick((t) => (t + 1) % 10000);
              updateProjectedOverlays();
              requestRenderRef.current();
            };

            return (
              <>
                {/* Desktop Banner (>= 768px) — giữ nguyên giao diện máy tính */}
                <div className="hidden md:flex absolute top-12 left-1/2 -translate-x-1/2 z-25 items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/95 border border-emerald-500/60 text-xs text-slate-200 shadow-xl backdrop-blur-md max-w-[92vw]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="truncate">
                    Đang mở 2 trục trên:{' '}
                    <strong className="text-amber-300">{gTitle}</strong> — Kéo trục
                    đứng (<span className="text-emerald-400 font-semibold">Xanh</span>
                    ) để nâng lên cao, kéo vành tròn (
                    <span className="text-amber-400 font-semibold">Vàng</span>) để
                    xoay. Click ra ngoài để vật tự rơi xuống!
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      triggerFreeFallIfElevated(dualAxisGizmoInstanceId);
                      setDualAxisGizmoInstanceId(null);
                      setViewportContextMenu(null);
                    }}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer shrink-0"
                  >
                    Đóng &amp; Thả rơi
                  </button>
                </div>

                {/* Mobile Bottom Lift & Rotate Dock (< 768px) — bật bằng Nhấp đúp thiết bị, tối ưu cảm ứng iOS/Android */}
                <div
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className="md:hidden absolute inset-x-2 bottom-2 safe-bottom z-[58] rounded-[16px] bg-[#0B192F]/95 border border-emerald-400/70 p-3 shadow-[0_14px_34px_rgba(0,0,0,0.65)] text-white space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-emerald-300 leading-tight">
                        Nâng cao &amp; Xoay thiết bị (Nhấp đúp)
                      </div>
                      <div className="text-[13.5px] font-extrabold text-white truncate">
                        {gTitle}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          applyMobileRotateDeg((currentAngleDeg + 90) % 360)
                        }
                        className="h-9 px-2.5 rounded-[9px] bg-amber-500/25 border border-amber-400/70 text-amber-200 text-[12px] font-extrabold flex items-center gap-1 cursor-pointer active:scale-95"
                        title="Xoay nhanh 90°"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>+90°</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          triggerFreeFallIfElevated(dualAxisGizmoInstanceId);
                          setDualAxisGizmoInstanceId(null);
                          setViewportContextMenu(null);
                        }}
                        className="h-9 px-3 rounded-[9px] bg-emerald-600 hover:bg-emerald-500 border border-emerald-300/70 text-white text-[12px] font-extrabold cursor-pointer active:scale-95"
                      >
                        Thả xuống
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11.5px] font-bold text-emerald-300 w-[72px] shrink-0">
                        Nâng cao
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={115}
                        step={1}
                        value={currentHeightCm}
                        onChange={(e) => applyMobileLiftCm(Number(e.target.value))}
                        className="flex-1 h-2 accent-emerald-400 cursor-pointer"
                        aria-label="Nâng cao thiết bị"
                      />
                      <span className="font-mono text-[12px] font-extrabold text-emerald-200 w-12 text-right tabular-nums shrink-0">
                        {currentHeightCm} cm
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="text-[11.5px] font-bold text-amber-300 w-[72px] shrink-0">
                        Xoay góc
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={360}
                        step={5}
                        value={currentAngleDeg}
                        onChange={(e) =>
                          applyMobileRotateDeg(Number(e.target.value))
                        }
                        className="flex-1 h-2 accent-amber-400 cursor-pointer"
                        aria-label="Xoay thiết bị"
                      />
                      <span className="font-mono text-[12px] font-extrabold text-amber-200 w-12 text-right tabular-nums shrink-0">
                        {currentAngleDeg}°
                      </span>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}

        {/* Top-Left Compact Bench-Corner O-XYZ Coordinates & Quick Grid Toggles + Nút Mở Thư Viện Dụng Cụ ngay dưới nút màu đỏ */}
        <div
          className={`absolute top-1.5 left-2 ${
            showMobileCoordHud ? 'flex' : 'hidden md:flex'
          } flex-col items-start gap-1.5 z-20 max-w-[68%]`}
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <div
              ref={compassHudRef}
              className="px-1.5 py-1 rounded-full bg-[#081528]/18 backdrop-blur-md border border-white/35 text-white text-[11px] font-mono flex items-center gap-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.28)] transition-all"
            >
              <button
                type="button"
                onClick={() => {
                  labSoundEngine.play('ui-toggle', 0.65);
                  setIsCompassHudExpanded((prev) => !prev);
                }}
                className="h-6 px-2 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] border border-[#F87171] text-white text-[10.5px] font-sans font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-all shadow-xs"
                title={
                  isCompassHudExpanded
                    ? 'Ẩn thanh công cụ hệ trục XYZ và khung lưới 3D'
                    : 'Mở thanh công cụ hệ trục XYZ và khung lưới 3D'
                }
                aria-label="La bàn 3D XYZ"
              >
                <Compass className="w-3.5 h-3.5 text-white shrink-0" />
                {isCompassHudExpanded && <span>Ẩn</span>}
              </button>

              {isCompassHudExpanded && (
                <>
                  {activeInstance &&
                    (() => {
                      const [bx, by, bz] = worldToBenchCornerCoords([
                        activeInstance.transform.positionM[0],
                        BENCH_SURFACE_Y + activeInstance.transform.positionM[1],
                        activeInstance.transform.positionM[2],
                      ]);
                      return (
                        <span className="font-extrabold drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] pl-0.5">
                          <span className="text-red-400 font-extrabold">X=</span>
                          {formatLengthByUnit(bx, coordSettings.displayUnit)}{' '}
                          <span className="text-emerald-400 font-extrabold">Y=</span>
                          {formatLengthByUnit(by, coordSettings.displayUnit)}{' '}
                          <span className="text-sky-300 font-extrabold">Z=</span>
                          {formatLengthByUnit(bz, coordSettings.displayUnit)}
                        </span>
                      );
                    })()}

                  <div className="flex items-center gap-1 pr-1">
                    <button
                      type="button"
                      onClick={() => {
                        const next = !coordSettings.showWorldAxes;
                        handleUpdateCoordSettings({
                          showWorldAxes: next,
                          showOriginMarker: next,
                          showAxisLabels: next,
                          showNumericTicks: next,
                        });
                      }}
                      className={`px-1.5 py-0.5 rounded-[5px] text-[10px] font-sans font-extrabold cursor-pointer transition-colors border ${
                        coordSettings.showWorldAxes
                          ? 'bg-[#1E6BFF]/55 border-[#38BDF8] text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]'
                          : 'bg-white/10 hover:bg-white/20 border-white/25 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]'
                      }`}
                      title="Bật/Tắt Hệ trục tọa độ O-XYZ tại góc bàn"
                    >
                      XYZ
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateCoordSettings({
                          showFloorGrid: !coordSettings.showFloorGrid,
                        })
                      }
                      className={`px-1.5 py-0.5 rounded-[5px] text-[10px] font-sans font-extrabold cursor-pointer transition-colors border ${
                        coordSettings.showFloorGrid
                          ? 'bg-[#00BCEB]/55 border-[#7DD3FC] text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]'
                          : 'bg-white/10 hover:bg-white/20 border-white/25 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]'
                      }`}
                      title="Bật/Tắt Lưới ô bàn (1 ô = 5 cm)"
                    >
                      Lưới
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateCoordSettings({
                          showSpaceGrid: !coordSettings.showSpaceGrid,
                        })
                      }
                      className={`px-1.5 py-0.5 rounded-[5px] text-[10px] font-sans font-extrabold cursor-pointer transition-colors border ${
                        coordSettings.showSpaceGrid
                          ? 'bg-emerald-500/55 border-emerald-300 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]'
                          : 'bg-white/10 hover:bg-white/20 border-white/25 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]'
                      }`}
                      title="Bật/Tắt Lưới không gian 3D (XZ & YZ)"
                    >
                      3D
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="px-2.5 py-1 rounded-[9px] bg-[#081528]/18 backdrop-blur-md border border-white/35 text-white text-[11px] font-mono flex items-center gap-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.28)]">
              <Clock className="w-3.5 h-3.5 text-emerald-300 shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]" />
              <span className="text-[#FDE047] font-extrabold drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                {formatSimulationDuration(
                  clockState.simulationClock.elapsedSeconds,
                )}
              </span>
              <button
                type="button"
                onClick={() =>
                  handleSimClockAction(
                    clockState.simulationClock.status === 'running'
                      ? 'pause'
                      : 'resume',
                  )
                }
                className="p-0.5 rounded-[5px] bg-white/15 hover:bg-[#1E6BFF]/70 border border-white/25 text-white cursor-pointer transition-colors"
                title={
                  clockState.simulationClock.status === 'running'
                    ? 'Tạm dừng đồng hồ mô phỏng'
                    : 'Tiếp tục đồng hồ mô phỏng'
                }
              >
                {clockState.simulationClock.status === 'running' ? (
                  <Pause className="w-3 h-3" />
                ) : (
                  <Play className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>

          {/* Nút Mở / Ẩn Thư viện dụng cụ & Nút Bật / Tắt Nhãn thông tin trên đầu thiết bị */}
          <div className="flex flex-wrap items-center gap-1.5 pl-0.5">
            {onToggleLibrary && (
              <button
                type="button"
                onClick={() => {
                  labSoundEngine.play('ui-toggle', 0.65);
                  onToggleLibrary();
                }}
                className={`h-7 px-2.5 rounded-full backdrop-blur-md border text-[11px] font-sans font-extrabold flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_4px_14px_rgba(0,0,0,0.32)] ${
                  isLibraryOpen
                    ? 'bg-[#081528]/55 hover:bg-[#081528]/80 border-white/40 text-white'
                    : 'bg-[#1E6BFF]/90 hover:bg-[#1557DB] border-[#7DD3FC] text-white'
                }`}
                title={
                  isLibraryOpen
                    ? 'Ẩn danh sách thiết bị bên trái'
                    : `Mở thư viện dụng cụ (${equipmentCount} thiết bị)`
                }
                aria-label="Ẩn/Hiện thư viện dụng cụ"
              >
                {isLibraryOpen ? (
                  <>
                    <PanelLeftClose className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                    <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      Ẩn danh sách ({equipmentCount})
                    </span>
                  </>
                ) : (
                  <>
                    <FolderOpen className="w-3.5 h-3.5 text-white shrink-0" />
                    <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      Mở thư viện dụng cụ ({equipmentCount})
                    </span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                labSoundEngine.play('ui-toggle', 0.65);
                onToggleLabels();
              }}
              className={`h-7 px-2.5 rounded-full backdrop-blur-md border text-[11px] font-sans font-extrabold flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_4px_14px_rgba(0,0,0,0.32)] ${
                showLabels
                  ? 'bg-emerald-600/85 hover:bg-emerald-500 border-emerald-300 text-white'
                  : 'bg-[#081528]/65 hover:bg-[#081528]/85 border-white/35 text-slate-200'
              }`}
              title="Bật hoặc tắt Nhãn thông tin hiển thị trên đầu các thiết bị 3D"
              aria-pressed={showLabels}
              aria-label="Bật hoặc tắt Nhãn thông tin"
            >
              <Tag className="w-3.5 h-3.5 text-amber-200 shrink-0" />
              <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                Nhãn thông tin: {showLabels ? 'BẬT' : 'TẮT'}
              </span>
            </button>
          </div>
        </div>

        {/* MOBILE TOP-LEFT COMPACT BAR (< 768px): Mở nhanh Danh mục thiết bị (thêm dụng cụ & xem thông tin) + bật/tắt nhãn */}
        <div className="absolute top-2 left-2 flex md:hidden items-center gap-1.5 z-[54]">
          {onToggleLibrary && (
            <button
              type="button"
              onClick={() => {
                labSoundEngine.play('ui-toggle', 0.65);
                onToggleLibrary();
              }}
              className={`h-10 px-3 rounded-[11px] border text-[12.5px] font-extrabold flex items-center gap-1.5 shadow-[0_6px_18px_rgba(0,0,0,0.38)] transition-colors cursor-pointer active:scale-95 ${
                isLibraryOpen
                  ? 'bg-[#DC2626] border-[#F87171] text-white'
                  : 'bg-[#0B192F]/92 border-[#38BDF8]/80 text-white'
              }`}
              title="Mở Danh mục thiết bị để thêm dụng cụ và xem thông tin chi tiết"
              aria-label="Danh mục thiết bị"
            >
              <FolderOpen className="w-4 h-4 text-[#38BDF8] shrink-0" />
              <span className="whitespace-nowrap">
                {isLibraryOpen ? 'Đóng' : `Danh mục (${equipmentCount})`}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              labSoundEngine.play('ui-toggle', 0.65);
              onToggleLabels();
            }}
            className={`h-10 w-10 rounded-[11px] border flex items-center justify-center shadow-[0_6px_18px_rgba(0,0,0,0.38)] transition-colors cursor-pointer active:scale-95 ${
              showLabels
                ? 'bg-emerald-600/95 border-emerald-300 text-white'
                : 'bg-[#0B192F]/90 border-white/30 text-slate-200'
            }`}
            title={showLabels ? 'Tắt nhãn thông số trên đầu thiết bị' : 'Bật nhãn thông số trên đầu thiết bị'}
            aria-pressed={showLabels}
            aria-label="Bật hoặc tắt nhãn thông số"
          >
            <Tag className="w-4 h-4 shrink-0" />
          </button>
        </div>

        {/* MOBILE FLOATING TOOLS (< 768px): Kích thước nút chạm chuẩn iOS/Android (40-44px), nền sắc nét không làm mờ WebGL */}
        <div
          ref={mobileToolsRef}
          className="absolute top-2 right-2 flex md:hidden flex-col items-end gap-1.5 z-[55]"
        >
          <div className="flex items-center gap-1.5">
            {isRecordingVideo && (
              <button
                type="button"
                onClick={handleStopVideoRecording}
                className="h-10 px-3 rounded-[11px] bg-red-900/95 border border-red-400/80 text-white font-mono text-[12px] font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer"
                title="Dừng ghi hình"
              >
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                <span>{formatRecTime(recordingElapsedSec)}</span>
                <Square className="w-3 h-3 fill-current" />
              </button>
            )}

            {/* Góc nhìn chuẩn */}
            <button
              type="button"
              onClick={() => handleFocusCameraPreset('bench-close')}
              className="w-10 h-10 rounded-[11px] bg-[#0B192F]/90 active:bg-[#13294B] border border-white/30 text-white flex items-center justify-center shadow-[0_6px_18px_rgba(0,0,0,0.38)] cursor-pointer transition-colors"
              title="Đặt lại góc nhìn chuẩn bàn thí nghiệm"
              aria-label="Góc nhìn chuẩn"
            >
              <RotateCcw className="w-4.5 h-4.5 text-[#38BDF8]" />
            </button>

            {/* Hướng dẫn thao tác điện thoại (?) */}
            <button
              type="button"
              onClick={() => {
                setShowMobileGestureGuide((v) => !v);
                setIsMobileToolsOpen(false);
              }}
              className={`w-10 h-10 rounded-[11px] border flex items-center justify-center shadow-[0_6px_18px_rgba(0,0,0,0.38)] transition-colors cursor-pointer ${
                showMobileGestureGuide
                  ? 'bg-amber-500 border-amber-200 text-slate-950'
                  : 'bg-[#0B192F]/90 border-white/30 text-amber-300'
              }`}
              title="Xem hướng dẫn thao tác cảm ứng trên điện thoại"
              aria-pressed={showMobileGestureGuide}
              aria-label="Hướng dẫn thao tác cảm ứng"
            >
              <HelpCircle className="w-4.5 h-4.5" />
            </button>

            {/* Nút Mở/Ẩn Công cụ 3D trên Mobile */}
            <button
              type="button"
              onClick={() => {
                setIsMobileToolsOpen((v) => !v);
                setShowMobileGestureGuide(false);
              }}
              className={`h-10 px-3 rounded-[11px] border text-white text-[12.5px] font-extrabold flex items-center gap-1.5 shadow-[0_6px_18px_rgba(0,0,0,0.38)] transition-colors cursor-pointer ${
                isMobileToolsOpen
                  ? 'bg-[#DC2626] border-[#F87171]'
                  : 'bg-[#1E6BFF] border-[#60A5FA]'
              }`}
              aria-expanded={isMobileToolsOpen}
              aria-label={isMobileToolsOpen ? 'Ẩn Công cụ 3D' : 'Mở Công cụ 3D'}
              title={isMobileToolsOpen ? 'Ẩn thanh công cụ 3D' : 'Mở thanh công cụ 3D'}
            >
              <Sliders className="w-4 h-4 text-white" />
              <span>{isMobileToolsOpen ? 'Đóng' : 'Công cụ'}</span>
              {isMobileToolsOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-white" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-white" />
              )}
            </button>
          </div>

          {showMobileGestureGuide && (
            <div
              onPointerDown={(e) => e.stopPropagation()}
              className="w-[272px] max-w-[calc(100vw-16px)] rounded-[14px] bg-[#0B192F]/96 border border-[#38BDF8]/70 p-3 shadow-[0_12px_32px_rgba(0,0,0,0.58)] text-white space-y-2"
            >
              <div className="flex items-center justify-between border-b border-white/15 pb-1.5">
                <span className="text-[12.5px] font-extrabold text-amber-300">
                  Thao tác cảm ứng trên điện thoại
                </span>
                <button
                  type="button"
                  onClick={() => setShowMobileGestureGuide(false)}
                  className="w-7 h-7 rounded-lg bg-white/10 text-slate-200 flex items-center justify-center cursor-pointer"
                  aria-label="Đóng hướng dẫn"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ul className="space-y-1.5 text-[12px] text-slate-200 leading-snug">
                <li>
                  <strong className="text-[#38BDF8]">2 ngón tay:</strong> Phóng to / Thu nhỏ phòng thí nghiệm
                </li>
                <li>
                  <strong className="text-[#38BDF8]">Chạm &amp; kéo thiết bị:</strong> Di chuyển đến vị trí mong muốn
                </li>
                <li>
                  <strong className="text-emerald-300">Nhấp đúp thiết bị:</strong> Bật chế độ Nâng cao &amp; Xoay thiết bị
                </li>
                <li>
                  <strong className="text-amber-300">Xem thông tin thiết bị:</strong> Mở <em>Danh mục</em> → chọn <em>Xem thông tin</em>
                </li>
              </ul>
            </div>
          )}

          {isMobileToolsOpen && (
            <div
              onPointerDown={(e) => e.stopPropagation()}
              className="w-[276px] max-w-[calc(100vw-16px)] rounded-[14px] bg-[#0B192F]/96 border border-[#38BDF8]/70 p-3 shadow-[0_14px_36px_rgba(0,0,0,0.62)] text-white space-y-2.5"
            >
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleToggleTopView}
                  className={`min-h-[48px] py-2 px-1.5 rounded-[10px] border text-[11.5px] font-bold flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                    isTopViewActive
                      ? 'bg-[#1E6BFF] border-[#7DD3FC] text-white'
                      : 'bg-slate-900/90 border-white/20 text-slate-100'
                  }`}
                >
                  <Eye className="w-4 h-4 text-[#38BDF8]" />
                  <span>Nhìn trên</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSmoothZoom(0.8)}
                  className="min-h-[48px] py-2 px-1.5 rounded-[10px] bg-slate-900/90 border border-white/20 text-slate-100 text-[11.5px] font-bold flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  <ZoomIn className="w-4 h-4 text-[#38BDF8]" />
                  <span>Phóng to</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSmoothZoom(1.25)}
                  className="min-h-[48px] py-2 px-1.5 rounded-[10px] bg-slate-900/90 border border-white/20 text-slate-100 text-[11.5px] font-bold flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  <ZoomOut className="w-4 h-4 text-[#38BDF8]" />
                  <span>Thu nhỏ</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const nextHud = !showMobileCoordHud;
                    setShowMobileCoordHud(nextHud);
                    handleUpdateCoordSettings({
                      showFloorGrid: nextHud,
                      showWorldAxes: nextHud,
                    });
                  }}
                  className={`min-h-[48px] py-2 px-1.5 rounded-[10px] border text-[11.5px] font-bold flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                    showMobileCoordHud
                      ? 'bg-[#1E6BFF] border-[#7DD3FC] text-white'
                      : 'bg-slate-900/90 border-white/20 text-slate-100'
                  }`}
                >
                  <Grid className="w-4 h-4 text-[#38BDF8]" />
                  <span>Lưới XYZ</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const nextMuted = labSoundEngine.toggleMute();
                    onNotify(
                      !nextMuted
                        ? 'Đã BẬT âm thanh hiện tượng thực tế.'
                        : 'Đã TẮT âm thanh hiện tượng.',
                      'info',
                    );
                  }}
                  className={`min-h-[48px] py-2 px-1.5 rounded-[10px] border text-[11.5px] font-bold flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                    !isSoundMuted
                      ? 'bg-emerald-900/80 border-emerald-400/80 text-emerald-200'
                      : 'bg-slate-900/90 border-white/20 text-slate-200'
                  }`}
                >
                  {!isSoundMuted ? (
                    <Volume2 className="w-4 h-4 text-emerald-300" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  )}
                  <span>{!isSoundMuted ? 'Âm: Bật' : 'Âm: Tắt'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileToolsOpen(false);
                    if (!isRecordingVideo) handleStartVideoRecording();
                    else handleStopVideoRecording();
                  }}
                  className="min-h-[48px] py-2 px-1.5 rounded-[10px] bg-rose-950/90 border border-rose-400/75 text-rose-100 text-[11.5px] font-bold flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  <Video className="w-4 h-4 text-rose-300" />
                  <span>Ghi hình</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-white/15">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileToolsOpen(false);
                    setShowEnvSpecModal(true);
                  }}
                  className="min-h-[42px] px-2.5 rounded-[10px] bg-slate-900/90 border border-white/20 text-white text-[12px] font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Compass className="w-4 h-4 text-[#38BDF8] shrink-0" />
                  <span>Môi trường</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileToolsOpen(false);
                    handleFocusCameraPreset('room-overview');
                  }}
                  className="min-h-[42px] px-2.5 rounded-[10px] bg-slate-900/90 border border-white/20 text-white text-[12px] font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Maximize2 className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Toàn phòng</span>
                </button>
              </div>

              {/* Thanh trượt độ sáng môi trường 3D trên Mobile */}
              <div className="pt-2 border-t border-white/15 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleChangeAmbientBrightness(
                      ambientBrightnessPct > 25 ? 12 : 100,
                    )
                  }
                  className="w-9 h-9 rounded-[9px] bg-amber-500/20 border border-amber-300/60 text-amber-300 flex items-center justify-center cursor-pointer shrink-0"
                  title="Chuyển nhanh phòng tối (12%) / phòng sáng chuẩn (100%)"
                >
                  {ambientBrightnessPct <= 35 ? (
                    <Lightbulb className="w-4 h-4 text-amber-300" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-300" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={140}
                  step={5}
                  value={ambientBrightnessPct}
                  onChange={(e) =>
                    handleChangeAmbientBrightness(Number(e.target.value))
                  }
                  className="flex-1 h-2 accent-amber-400 cursor-pointer"
                  aria-label="Thanh trượt điều chỉnh độ sáng môi trường 3D"
                />
                <span className="font-mono text-[12px] font-extrabold text-amber-200 w-10 text-right tabular-nums">
                  {ambientBrightnessPct}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Top-Right Compact Translucent Icon Toolbar on Desktop/Tablet (>= 768px) */}
        <div className="absolute top-1.5 right-1.5 hidden md:flex items-center justify-end gap-1.5 z-20">
          {!isTopRightToolbarCollapsed && (
            <>
              {/* THANH TÙY CHỈNH ĐỘ SÁNG MÔI TRƯỜNG 3D (BRIGHTNESS / AMBIENT LIGHT SLIDER)
                  - Icon Mặt trời / Bóng đèn + Thanh trượt nhỏ gọn
                  - Kéo giảm độ sáng: Không gian 3D tối lại, làm nổi bật tia sáng quang học, ngọn lửa đốt cháy hoặc LED
                  - Kéo tăng độ sáng: Phòng thí nghiệm sáng rõ trở lại như bình thường */}
              <div
                className="h-7 px-2 rounded-[7px] bg-[#081528]/35 hover:bg-[#081528]/55 backdrop-blur-md border border-amber-300/65 text-white flex items-center gap-1.5 shadow-[0_4px_14px_rgba(0,0,0,0.28)] transition-colors"
                title="Thanh chỉnh độ sáng môi trường 3D (Kéo giảm để làm tối phòng, nổi bật tia sáng quang học & ngọn lửa đèn cồn)"
              >
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = ambientBrightnessPct > 30 ? 12 : 100;
                    handleChangeAmbientBrightness(nextVal);
                    onNotify(
                      nextVal <= 30
                        ? 'Đã chuyển sang Chế độ Phòng tối (12%) giúp làm nổi bật tia sáng quang học, ngọn lửa và hiệu ứng phát sáng!'
                        : 'Đã khôi phục độ sáng phòng thí nghiệm 3D chuẩn (100%).',
                      'info',
                    );
                  }}
                  className="flex items-center justify-center text-amber-300 hover:text-amber-200 cursor-pointer shrink-0"
                  title={
                    ambientBrightnessPct > 30
                      ? 'Bấm để làm tối nhanh phòng thí nghiệm (12% — Quan sát tia laser / ngọn lửa)'
                      : 'Bấm để bật sáng lại phòng thí nghiệm (100%)'
                  }
                  aria-label="Chuyển đổi nhanh độ sáng phòng thí nghiệm"
                >
                  {ambientBrightnessPct <= 35 ? (
                    <Lightbulb className="w-3.5 h-3.5 text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]" />
                  )}
                </button>

                <input
                  type="range"
                  min={0}
                  max={140}
                  step={2}
                  value={ambientBrightnessPct}
                  onChange={(e) =>
                    handleChangeAmbientBrightness(Number(e.target.value))
                  }
                  aria-label="Độ sáng môi trường 3D"
                  className="w-20 lg:w-24 h-1.5 accent-amber-400 cursor-pointer"
                />

                <span className="font-mono text-[11px] font-extrabold text-amber-200 tabular-nums min-w-[32px] text-right select-none">
                  {ambientBrightnessPct}%
                </span>
              </div>

              {/* 0. Bật / Tắt Nhãn thông tin trên đầu thiết bị & Chú thích hướng dẫn (?) */}
              <button
                type="button"
                onClick={() => {
                  labSoundEngine.play('ui-toggle', 0.65);
                  onToggleLabels();
                }}
                className={`h-7 px-2.5 rounded-[7px] backdrop-blur-md border text-[11px] font-extrabold flex items-center gap-1.5 shadow-[0_4px_14px_rgba(0,0,0,0.28)] transition-colors cursor-pointer ${
                  showLabels
                    ? 'bg-emerald-600/80 hover:bg-emerald-500 border-emerald-300 text-white'
                    : 'bg-[#081528]/35 hover:bg-[#081528]/55 border-white/35 text-slate-200'
                }`}
                title={
                  showLabels
                    ? 'Nhãn thông tin trên đầu thiết bị đang BẬT (Nhấn để TẮT)'
                    : 'Nhãn thông tin trên đầu thiết bị đang TẮT (Nhấn để BẬT)'
                }
                aria-pressed={showLabels}
              >
                <Tag className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                <span>Nhãn thông tin: {showLabels ? 'BẬT' : 'TẮT'}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleDetailedGuides}
                className={`w-7 h-7 rounded-[7px] backdrop-blur-md border flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.28)] transition-colors cursor-pointer ${
                  isDetailedGuideOn
                    ? 'bg-amber-500/25 hover:bg-amber-500/40 border-amber-300/85 text-white'
                    : 'bg-[#081528]/18 hover:bg-[#081528]/35 border-white/35 text-amber-300'
                }`}
                title={
                  isDetailedGuideOn
                    ? 'Đang BẬT hướng dẫn thao tác chi tiết trên nhãn (Nhấn để thu gọn)'
                    : 'Bật hướng dẫn thao tác chi tiết trên đầu từng dụng cụ'
                }
                aria-pressed={isDetailedGuideOn}
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]" />
              </button>

              {/* 1. Ghi hình thực hành / Điều khiển REC */}
              {!isRecordingVideo ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleStartVideoRecording}
                    className="w-7 h-7 rounded-[7px] bg-[#081528]/18 hover:bg-red-600/45 backdrop-blur-md border border-red-400/75 text-white flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.28)] transition-colors cursor-pointer"
                    title="Ghi hình thực hành 3D & tự động lưu các bước đo"
                    aria-label="Ghi hình thực hành 3D"
                  >
                    <Video className="w-3.5 h-3.5 text-red-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]" />
                  </button>

                  {completedRecordingSession && (
                    <button
                      type="button"
                      onClick={() => setShowVideoRecorderModal(true)}
                      className="w-7 h-7 rounded-[7px] bg-[#081528]/18 hover:bg-[#1E6BFF]/45 backdrop-blur-md border border-[#FACC15]/80 text-[#FACC15] hover:text-white flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.28)] transition-colors cursor-pointer"
                      title={`Xuất Video tóm tắt quá trình (${completedRecordingSession.milestones.length} bước)`}
                      aria-label="Xuất Video tóm tắt"
                    >
                      <Sparkles className="w-3.5 h-3.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-[7px] bg-[#081528]/25 backdrop-blur-md border border-red-400/80 text-white shadow-[0_4px_14px_rgba(0,0,0,0.32)]">
                  <span className="flex items-center gap-1 font-mono text-[11px] font-extrabold text-red-200 pr-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isRecordingPaused
                          ? 'bg-amber-400'
                          : 'bg-red-500 animate-ping'
                      }`}
                    />
                    <span>{formatRecTime(recordingElapsedSec)}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      const activeInst = instances.find(
                        (i) => i.instanceId === selectedInstanceId,
                      );
                      const activeAst = activeInst
                        ? assetsMap.get(activeInst.assetId)
                        : undefined;
                      const manualLabel = activeAst
                        ? `Đánh dấu bước: ${activeInst?.customLabel || activeAst.name.vi}`
                        : studentCurrentHint
                          ? `Đánh dấu: ${studentCurrentHint}`
                          : `Đánh dấu bước thực hành #${recordedMilestonesCount + 1}`;
                      recordStepMilestoneInternal(manualLabel, false);
                    }}
                    className="w-6.5 h-6.5 rounded-[6px] bg-[#1E6BFF]/55 hover:bg-[#1E6BFF]/80 border border-white/30 text-white flex items-center justify-center cursor-pointer"
                    title="Đánh dấu & chụp bước thực hành hiện tại"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={handlePauseResumeVideoRecording}
                    className="w-6.5 h-6.5 rounded-[6px] bg-white/15 hover:bg-white/25 border border-white/25 text-white flex items-center justify-center cursor-pointer"
                    title={isRecordingPaused ? 'Tiếp tục ghi hình' : 'Tạm dừng ghi hình'}
                  >
                    {isRecordingPaused ? (
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Pause className="w-3.5 h-3.5 text-amber-300" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleStopVideoRecording}
                    className="w-6.5 h-6.5 rounded-[6px] bg-emerald-500/75 hover:bg-emerald-500 text-white flex items-center justify-center cursor-pointer"
                    title="Dừng ghi hình & Xuất Video"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              )}

              {/* 2. Cài đặt Môi trường XYZ & Đồng hồ (Icon) */}
              <button
                type="button"
                onClick={() => setShowEnvSpecModal(true)}
                className="w-7 h-7 rounded-[7px] bg-[#081528]/18 hover:bg-[#081528]/35 backdrop-blur-md border border-white/35 text-white flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.28)] transition-colors cursor-pointer"
                title="Cài đặt Môi trường 3D: Hệ tọa độ XYZ, Đo khoảng cách & 13 Biến vật lý"
                aria-label="Cài đặt Môi trường 3D"
              >
                <Sliders className="w-3.5 h-3.5 text-[#38BDF8] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]" />
              </button>

              {/* 3. Bật / Tắt Âm thanh hiện tượng (Icon) */}
              <button
                type="button"
                onClick={() => {
                  const nextMuted = labSoundEngine.toggleMute();
                  if (!nextMuted) {
                    labSoundEngine.play('probe-measure', { value: 7.0 });
                    onNotify(
                      'Đã BẬT âm thanh hiện tượng thực tế (rót nước, thả vật, cân điện tử, tia laser, cảm ứng điện từ...).',
                      'success',
                    );
                  } else {
                    onNotify('Đã TẮT âm thanh hiện tượng phòng thí nghiệm.', 'info');
                  }
                }}
                className={`w-7 h-7 rounded-[7px] backdrop-blur-md border flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.28)] transition-colors cursor-pointer ${
                  !isSoundMuted
                    ? 'bg-[#081528]/18 hover:bg-emerald-900/35 border-emerald-400/75 text-[#4ADE80]'
                    : 'bg-[#081528]/18 hover:bg-[#081528]/35 border-white/35 text-slate-200'
                }`}
                title={
                  !isSoundMuted
                    ? 'Âm thanh hiện tượng đang BẬT (Nhấn để tắt)'
                    : 'Âm thanh hiện tượng đang TẮT (Nhấn để bật)'
                }
                aria-label="Bật hoặc tắt âm thanh"
              >
                {!isSoundMuted ? (
                  <Volume2 className="w-3.5 h-3.5 text-[#4ADE80] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]" />
                )}
              </button>

              {/* 4. Toàn màn hình / Thu nhỏ (Icon) */}
              {isStudentMode && (
                <button
                  type="button"
                  onClick={onToggleFullscreen}
                  className="w-7 h-7 rounded-[7px] bg-[#081528]/18 hover:bg-[#081528]/35 backdrop-blur-md border border-white/35 text-slate-100 flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.28)] transition-colors cursor-pointer"
                  title={
                    isFullscreen
                      ? 'Thu nhỏ về bố cục chuẩn'
                      : 'Phóng to toàn màn hình vùng mô phỏng 3D'
                  }
                  aria-label="Toàn màn hình"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-3.5 h-3.5 text-[#38BDF8] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5 text-[#38BDF8] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]" />
                  )}
                </button>
              )}
            </>
          )}

          {/* Nút Ẩn / Mở thanh công cụ góc phải trên (Nền màu đỏ thu gọn) */}
          <button
            type="button"
            onClick={() => setIsTopRightToolbarCollapsed((v) => !v)}
            className="h-7 px-2 rounded-[7px] bg-[#DC2626] hover:bg-[#B91C1C] border border-[#F87171] text-white text-[11px] font-extrabold flex items-center justify-center gap-0.5 shadow-sm transition-colors cursor-pointer"
            title={
              isTopRightToolbarCollapsed
                ? 'Mở thanh công cụ góc phải trên'
                : 'Ẩn thanh công cụ góc phải trên'
            }
            aria-label={
              isTopRightToolbarCollapsed
                ? 'Mở thanh công cụ góc phải trên'
                : 'Ẩn thanh công cụ góc phải trên'
            }
          >
            {isTopRightToolbarCollapsed ? (
              <>
                <Sliders className="w-3.5 h-3.5 text-white" />
                <span>Mở</span>
              </>
            ) : (
              <span>Ẩn</span>
            )}
          </button>
        </div>

        {/* Drag & Drop Target Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-[#1E6BFF]/15 border-2 border-dashed border-[#00BCEB] flex items-center justify-center z-30 pointer-events-none">
            <div className="bg-slate-900/60 backdrop-blur-md border border-[#00BCEB] px-6 py-3.5 rounded-[12px] shadow-lg text-center">
              <p className="text-[16px] font-bold text-white">
                Thả thiết bị vào đây để đặt lên bàn gỗ thí nghiệm
              </p>
            </div>
          </div>
        )}

        {/* Active Physical Docking Feedback Pill */}
        {activeDockHint && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/55 backdrop-blur-md border border-[#00BCEB] text-white px-4 py-1.5 rounded-full text-[13.5px] font-bold shadow-md z-30 pointer-events-none whitespace-nowrap">
            {activeDockHint}
          </div>
        )}

        {/* Real-Time Tilt Pouring Status HUD (Hiển thị khi góc nghiêng >= 45° và đang rót chất lỏng) */}
        {activeTiltPourHud && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#06182C]/85 backdrop-blur-xl border-[1.5px] border-[#38BDF8] text-white shadow-[0_10px_28px_rgba(0,188,235,0.38)] whitespace-nowrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/30 border border-sky-300/70 text-[11px] font-mono font-extrabold text-[#7DD3FC]">
              <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping" />
              ĐANG RÓT · {activeTiltPourHud.tiltDeg}° (≥ 45°)
            </span>
            <span className="text-[12px] font-extrabold text-white">
              {activeTiltPourHud.sourceTitle}:{' '}
              <span className="font-mono text-amber-300">
                {activeTiltPourHud.sourceRemainMl.toFixed(1)} ml
              </span>
            </span>
            <span className="text-sky-300 font-bold">→</span>
            <span className="text-[12px] font-extrabold text-[#5EEAD4]">
              {activeTiltPourHud.targetTitle}
              {activeTiltPourHud.targetCurrentMl !== null
                ? `: ${activeTiltPourHud.targetCurrentMl.toFixed(1)} ml`
                : ''}{' '}
              <span className="font-mono text-[11px] text-sky-200">
                (+{activeTiltPourHud.sessionPouredMl.toFixed(1)} ml ·{' '}
                {activeTiltPourHud.flowRateMlPerSec} ml/s)
              </span>
            </span>
          </div>
        )}

        {/* Loading Progress Indicator */}
        {loadingCount > 0 && (
          <div className="absolute top-3 left-3 bg-slate-900/45 backdrop-blur-md border border-white/25 px-3 py-1.5 rounded-[9px] text-[13px] text-slate-100 font-semibold flex items-center gap-2 z-20 shadow-xs">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00BCEB]" />
            <span>3D...</span>
          </div>
        )}

        {/* Simulated Loader Error & Retry Banner */}
        {simulatedError && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md border-2 border-[#FF647C] px-4 py-2.5 rounded-[10px] text-xs text-white flex items-center gap-3 z-30 max-w-md shadow-lg">
            <AlertTriangle className="w-4 h-4 text-[#FF647C] shrink-0" />
            <div className="flex-1">
              <p className="font-bold">Lỗi tải tệp GLB ngoại vi</p>
              <p className="text-slate-300 mt-0.5">{simulatedError}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSimulatedError(null);
                requestRenderRef.current();
                onNotify('Đã khôi phục kết nối bộ nạp GLTFLoader.', 'success');
              }}
              className="px-2.5 py-1 bg-[#1E6BFF] text-white font-semibold rounded whitespace-nowrap"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Dynamic, Non-Intrusive Cursor Hover Tooltip for 3D Equipment (Only shown when Detailed Guide is ON or on Desktop hover) */}
        {hoveredEquipment &&
          isDetailedGuideOn &&
          !dragStateRef.current.isDragging &&
          viewMode === 'lab-scene' && (
            <div
              style={{
                left: `${Math.min(
                  Math.max(12, hoveredEquipment.x + 16),
                  (mountRef.current?.clientWidth ?? 880) - 270,
                )}px`,
                top: `${Math.min(
                  Math.max(12, hoveredEquipment.y + 14),
                  (mountRef.current?.clientHeight ?? 590) - 108,
                )}px`,
              }}
              className="absolute z-30 pointer-events-none rounded-[11px] border-[1.5px] border-white/40 bg-[#081528]/58 backdrop-blur-xl text-white px-3 py-2 shadow-[0_10px_28px_rgba(0,0,0,0.55)] max-w-[268px] transition-opacity duration-75"
              role="tooltip"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-extrabold leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  {hoveredEquipment.title}
                </span>
                {hoveredEquipment.readoutBadge && (
                  <span className="px-1.5 py-0.5 rounded-[5px] font-mono text-[11.5px] font-extrabold tabular-nums shrink-0 bg-emerald-950/75 text-[#5EEAD4] border border-[#2DD4BF]/85 shadow-2xs">
                    {hoveredEquipment.readoutBadge}
                  </span>
                )}
              </div>

              <div className="mt-1 pt-1 border-t border-white/25 text-[11.5px] font-bold leading-snug text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
                <span>{hoveredEquipment.interactionHint}</span>
              </div>
            </div>
          )}

        {/* Menu Chuột Phải (Right-Click Context Menu) trực tiếp trên Dụng Cụ 3D — Glassmorphism trong suốt mờ + Chữ đậm */}
        {viewportContextMenu && (
          <div
            ref={contextMenuRef}
            style={{
              left: `${Math.max(8, Math.min(viewportContextMenu.x, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 280))}px`,
              top: `${Math.max(8, Math.min(viewportContextMenu.y, (typeof window !== 'undefined' ? window.innerHeight : 800) - 290))}px`,
            }}
            onClick={(e) => e.stopPropagation()}
            className="fixed z-[75] w-[268px] max-w-[calc(100vw-16px)] rounded-[13px] bg-[#081528]/90 backdrop-blur-2xl border-[1.5px] border-[#38BDF8]/85 shadow-[0_20px_48px_rgba(0,0,0,0.72)] text-white p-2 space-y-1"
          >
            <div className="px-2.5 py-1.5 border-b border-white/25 flex items-center gap-2.5">
              {/* Khung ảnh nhỏ sắc nét KHÔNG làm mờ */}
              <div className="w-10 h-10 rounded-[8px] bg-white border border-slate-300 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                <EquipmentThumbnailSvg
                  archetype={viewportContextMenu.asset.geometry.proceduralArchetype}
                  assetId={viewportContextMenu.asset.assetId}
                  className="w-8 h-8"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10.5px] font-extrabold text-[#7DD3FC] uppercase tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
                  Dụng cụ trên bàn 3D
                </div>
                <div className="text-[13px] font-extrabold text-white truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  {viewportContextMenu.customLabel || viewportContextMenu.asset.name.vi}
                </div>
                <div className="text-[11px] font-mono font-bold text-amber-200 truncate">
                  {viewportContextMenu.asset.assetId}
                </div>
              </div>
            </div>

            {onQuickLabAction && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const instId = viewportContextMenu.instanceId;
                    setViewportContextMenu(null);
                    onQuickLabAction('open-sgk-profile', instId);
                  }}
                  className="w-full px-2.5 py-2 rounded-[8px] hover:bg-[#1E6BFF]/80 text-left text-[12.5px] font-extrabold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Camera className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Thông tin sản phẩm & Ảnh thật</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const instId = viewportContextMenu.instanceId;
                    setViewportContextMenu(null);
                    onQuickLabAction('edit-product-info', instId);
                  }}
                  className="w-full px-2.5 py-2 rounded-[8px] hover:bg-[#1E6BFF]/75 text-left text-[12.5px] font-bold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Sliders className="w-4 h-4 text-[#38BDF8] shrink-0" />
                  <span>Sửa thông số sản phẩm này</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const instId = viewportContextMenu.instanceId;
                    setViewportContextMenu(null);
                    onQuickLabAction('open-html-updater', instId);
                  }}
                  className="w-full px-2.5 py-2 rounded-[8px] bg-emerald-950/60 hover:bg-emerald-900/75 border border-[#14B8A6]/60 text-left text-[12.5px] font-extrabold text-[#5EEAD4] flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-[#2DD4BF] shrink-0" />
                  <span>Cập nhật sản phẩm bằng .HTML</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const instId = viewportContextMenu.instanceId;
                    setViewportContextMenu(null);
                    onQuickLabAction('rotate-90', instId);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-[8px] hover:bg-white/10 text-left text-[12px] font-semibold text-slate-200 flex items-center gap-2 cursor-pointer transition-colors border-t border-white/15 pt-2"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                  <span>Xoay dụng cụ 90°</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const instId = viewportContextMenu.instanceId;
                    setViewportContextMenu(null);
                    onQuickLabAction('delete-instance', instId);
                  }}
                  className="w-full px-2.5 py-2 rounded-[8px] bg-amber-950/75 hover:bg-amber-600/85 border border-amber-400/60 text-left text-[12.5px] font-extrabold text-amber-200 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Archive className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Cất vào Tủ đựng đồ (Sát trục X)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const instId = viewportContextMenu.instanceId;
                    setViewportContextMenu(null);
                    onQuickLabAction('permanently-delete-asset', instId);
                  }}
                  className="w-full px-2.5 py-2 rounded-[8px] bg-rose-950/80 hover:bg-rose-600 border border-rose-500/65 text-left text-[12.5px] font-extrabold text-rose-200 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-rose-300 shrink-0" />
                  <span>Xóa vĩnh viễn khỏi hệ thống</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Projected 3D Storage Cabinet Badge & Interactive Drawer Popover */}
        {viewMode === 'lab-scene' && cabinetProjectedBadge && (
          <div
            ref={cabinetDrawerRef}
            style={{
              transform: `translate3d(${Math.max(140, Math.min(cabinetProjectedBadge.x, (mountRef.current?.clientWidth || 900) - 140))}px, ${Math.max(36, cabinetProjectedBadge.y)}px, 0) translate(-50%, -100%)`,
            }}
            className={`absolute top-0 left-0 ${
              isCabinetDrawerOpen ? 'z-[55]' : 'z-10'
            } pointer-events-auto flex flex-col items-center`}
          >
            <button
              type="button"
              onClick={() => {
                labSoundEngine.play('ui-toggle', 0.7);
                setIsCabinetDrawerOpen((v) => !v);
              }}
              title="Bấm để xem hoặc lấy dụng cụ trong Tủ đựng đồ (Hoặc kéo/quăng trực tiếp dụng cụ trên bàn vào tủ này để cất)"
              className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md border transition-all cursor-pointer shadow-md ${
                isCabinetDrawerOpen || cabinetStoredItems.length > 0
                  ? 'bg-[#081528]/80 hover:bg-[#081528]/95 border-[#14B8A6] text-[#5EEAD4]'
                  : 'bg-[#081528]/55 hover:bg-[#081528]/80 border-amber-300/60 text-amber-200'
              }`}
            >
              <Archive className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0" />
              <span className="text-[11.5px] font-extrabold tracking-tight">
                Tủ đựng đồ
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#14B8A6]/30 border border-[#2DD4BF]/60 text-[10.5px] font-mono font-extrabold text-white">
                {cabinetStoredItems.length}
              </span>
            </button>

            {isCabinetDrawerOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="mt-1.5 w-[265px] max-w-[calc(100vw-24px)] rounded-[11px] bg-[#0B1528]/95 backdrop-blur-xl border border-[#14B8A6]/80 shadow-2xl p-2.5 text-white"
              >
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/15">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Archive className="w-4 h-4 text-[#2DD4BF] shrink-0" />
                    <span className="text-[12px] font-extrabold text-[#5EEAD4] truncate">
                      Tủ đựng đồ (Sát trục X)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCabinetDrawerOpen(false)}
                    className="p-0.5 rounded hover:bg-white/15 text-slate-300 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[10.5px] text-slate-300 mt-1.5 leading-snug">
                  Quăng hoặc kéo bất kỳ dụng cụ nào trên bàn vào tủ này để cất gọn (thay cho nút xóa).
                </p>

                {cabinetStoredItems.length === 0 ? (
                  <div className="my-2.5 py-3 px-2 rounded-[8px] bg-slate-900/70 border border-white/10 text-center text-[11px] text-slate-400">
                    Tủ đang trống. Hãy kéo hoặc quăng dụng cụ từ bàn vào tủ!
                  </div>
                ) : (
                  <div className="mt-2 max-h-[155px] overflow-y-auto space-y-1 pr-0.5">
                    {cabinetStoredItems.map((item) => (
                      <div
                        key={item.storedId}
                        className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-[7px] bg-slate-900/85 border border-white/10 hover:border-[#38BDF8]/60"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[13px] shrink-0">
                            {item.symbol}
                          </span>
                          <span className="text-[11.5px] font-bold text-slate-100 truncate">
                            {item.title}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRestoreItemFromCabinet(item.storedId)}
                          className="px-2 py-0.5 rounded-[5px] bg-[#1E6BFF] hover:bg-blue-500 text-white text-[10.5px] font-extrabold shrink-0 cursor-pointer transition-colors"
                        >
                          Lấy ra bàn
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {cabinetStoredItems.length > 0 && (
                  <div className="mt-2 pt-1.5 border-t border-white/15 flex justify-end">
                    <button
                      type="button"
                      onClick={clearCabinetStoredMeshes}
                      className="px-2 py-1 rounded-[6px] bg-rose-950/70 hover:bg-rose-800/80 border border-rose-500/40 text-rose-200 text-[10.5px] font-bold cursor-pointer transition-colors"
                    >
                      Dọn trống tủ ({cabinetStoredItems.length})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Projected 3D Equipment Badges:
            - Mặc định (isDetailedGuideOn = false): Chỉ hiển thị Ký hiệu + Thông số đo (ví dụ: ⚖️ 0.00 g, 🧪 70.0 ml) trên nền trong suốt mờ, KHÔNG để chữ "Cân điện tử".
            - Khi bật Chế độ Hướng dẫn trên đầu dụng cụ (isDetailedGuideOn = true): Hiển thị Tên + Thông số + Hướng dẫn thao tác ngay trên đầu dụng cụ đó. */}
        {showLabels &&
          viewMode === 'lab-scene' &&
          projectedLabels.map((lbl) => (
            <button
              key={lbl.instanceId}
              type="button"
              onClick={() => {
                labSoundEngine.play('ui-toggle', 0.65);
                onSelectInstance(lbl.instanceId);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectInstance(lbl.instanceId);
                const hitAsset = assetsMap.get(lbl.assetId);
                if (hitAsset) {
                  labSoundEngine.play('ui-toggle', 0.85);
                  setViewportContextMenu({
                    instanceId: lbl.instanceId,
                    asset: hitAsset,
                    customLabel: lbl.title,
                    x: Math.min(e.clientX, window.innerWidth - 265),
                    y: Math.min(e.clientY, window.innerHeight - 230),
                  });
                }
              }}
              style={{
                transform: `translate3d(${lbl.x}px, ${lbl.y}px, 0) translate(-50%, -100%)`,
              }}
              title={`${lbl.title}${lbl.readoutBadge ? ` · ${lbl.readoutBadge}` : ''}`}
              className={`absolute top-0 left-0 z-10 transition-all pointer-events-auto cursor-pointer backdrop-blur-md border ${
                isDetailedGuideOn
                  ? 'px-2.5 py-1.5 rounded-[10px] max-w-[260px] text-left flex flex-col gap-0.5 bg-[#081528]/78 border-amber-300/85 text-white shadow-md'
                  : lbl.isSelected
                    ? 'px-2.5 py-1 rounded-[10px] flex flex-col gap-0.5 bg-[#081528]/82 border-[#38BDF8] text-white shadow-md max-w-[250px]'
                    : 'px-2.5 py-1 rounded-[10px] flex flex-col gap-0.5 bg-[#081528]/68 hover:bg-[#081528]/85 border-white/35 text-white shadow-sm max-w-[240px]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[12.5px] leading-none shrink-0" aria-hidden="true">
                  {lbl.symbol}
                </span>
                <span className="text-[11.5px] font-extrabold text-amber-200 truncate max-w-[180px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                  {lbl.title}
                </span>
              </div>
              {lbl.readoutBadge && (
                <div
                  className={`font-mono text-[11px] font-extrabold tabular-nums truncate max-w-[225px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] ${
                    lbl.isDigitalScale
                      ? 'text-[#5EEAD4]'
                      : 'text-[#7DD3FC]'
                  }`}
                >
                  {lbl.readoutBadge}
                </div>
              )}

              {isDetailedGuideOn && (
                <div className="text-[10.5px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] leading-tight line-clamp-2 border-t border-white/20 pt-0.5">
                  {lbl.interactionHint}
                </div>
              )}
            </button>
          ))}

        {/* KHUNG NHẬP KHỐI LƯỢNG (g) HOẶC THỂ TÍCH (ml) KHI BẮT DÍNH CHỐT RÓT DUNG DỊCH */}
        {viewMode === 'lab-scene' &&
          pourLatchModal &&
          (() => {
            const parsedVolMl = Math.max(
              0,
              Math.min(
                pourLatchModal.maxTransferMl,
                Number(pourInputVolumeMl) || 0,
              ),
            );
            const parsedMassG = Number(
              (parsedVolMl * pourLatchModal.densityGPerMl).toFixed(1),
            );
            const afterSrcMl = Math.max(
              0,
              Number(
                (pourLatchModal.sourceAvailableMl - parsedVolMl).toFixed(1),
              ),
            );
            const afterDstMl = Number(
              (pourLatchModal.targetCurrentMl + parsedVolMl).toFixed(1),
            );
            const presetVolumes = [10, 20, 40, 50, 60, 80].filter(
              (v) => v <= Math.max(10, pourLatchModal.targetCapacityMl),
            );

            return (
              <div
                onClick={() => setPourLatchModal(null)}
                className="fixed inset-0 z-[85] bg-slate-950/55 backdrop-blur-xs flex items-center justify-center p-3 pointer-events-auto"
              >
                <div
                  ref={pourLatchModalRef}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-[430px] rounded-[16px] border-2 border-[#38BDF8] bg-[#071426]/95 backdrop-blur-2xl text-white p-4 shadow-[0_24px_64px_rgba(0,0,0,0.85)]"
                >
                  {/* Header Chốt bắt dính */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/20">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-8 h-8 rounded-[9px] bg-sky-500/25 border border-sky-400/70 flex items-center justify-center text-[16px] shrink-0">
                        🧲
                      </span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#38BDF8]">
                          Chốt Bắt Dính Đã Khớp · Định Lượng Rót
                        </div>
                        <div className="text-[14px] font-extrabold text-white truncate">
                          Nhập Khối Lượng hoặc Thể Tích Muốn Rót
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPourLatchModal(null)}
                      className="p-1.5 rounded-[8px] bg-white/10 hover:bg-rose-600/80 text-slate-200 hover:text-white cursor-pointer transition-colors"
                      aria-label="Đóng khung nhập"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sơ đồ Bình Nguồn -> Bình Nhận */}
                  <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 p-2.5 rounded-[12px] bg-slate-900/80 border border-white/15">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-9 h-9 rounded-[8px] bg-white border border-sky-300 flex items-center justify-center shrink-0 overflow-hidden">
                        <EquipmentThumbnailSvg
                          archetype={
                            pourLatchModal.sourceArchetype as ProceduralArchetype
                          }
                          assetId={pourLatchModal.sourceAssetId}
                          className="w-7 h-7"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">
                          Nguồn rót
                        </div>
                        <div className="text-[12px] font-extrabold text-white truncate">
                          {pourLatchModal.sourceTitle}
                        </div>
                        <div className="font-mono text-[11px] font-extrabold text-amber-300">
                          Có: {pourLatchModal.sourceAvailableMl.toFixed(1)} ml
                        </div>
                      </div>
                    </div>

                    <div className="px-1.5 py-1 rounded-full bg-sky-500/20 border border-sky-400/50 text-sky-300 font-extrabold text-[12px]">
                      ➔
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-9 h-9 rounded-[8px] bg-white border border-emerald-300 flex items-center justify-center shrink-0 overflow-hidden">
                        <EquipmentThumbnailSvg
                          archetype={
                            pourLatchModal.targetArchetype as ProceduralArchetype
                          }
                          assetId={pourLatchModal.targetAssetId}
                          className="w-7 h-7"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">
                          Bình nhận
                        </div>
                        <div className="text-[12px] font-extrabold text-[#5EEAD4] truncate">
                          {pourLatchModal.targetTitle}
                        </div>
                        <div className="font-mono text-[11px] font-extrabold text-sky-300">
                          {pourLatchModal.targetCurrentMl.toFixed(1)} /{' '}
                          {pourLatchModal.targetCapacityMl} ml
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hai ô nhập đồng bộ: Thể tích (ml) hoặc Khối lượng (g) */}
                  <div className="mt-3.5 grid grid-cols-2 gap-3">
                    <div
                      className={`p-2.5 rounded-[11px] border transition-colors ${
                        pourInputFocusField === 'volume'
                          ? 'bg-sky-950/55 border-[#38BDF8]'
                          : 'bg-slate-900/60 border-white/20'
                      }`}
                    >
                      <label className="block text-[11.5px] font-extrabold text-sky-200 mb-1">
                        🧪 Thể tích muốn rót (ml):
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0.5}
                          max={pourLatchModal.maxTransferMl}
                          step={0.5}
                          autoFocus
                          value={pourInputVolumeMl}
                          onFocus={() => setPourInputFocusField('volume')}
                          onChange={(e) => {
                            const raw = e.target.value;
                            setPourInputVolumeMl(raw);
                            const num = Number(raw);
                            if (Number.isFinite(num) && raw !== '') {
                              setPourInputMassG(
                                String(
                                  Number(
                                    (
                                      num * pourLatchModal.densityGPerMl
                                    ).toFixed(2),
                                  ),
                                ),
                              );
                            } else {
                              setPourInputMassG('');
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && parsedVolMl > 0.05) {
                              e.preventDefault();
                              executeConfirmedLatchPour(
                                pourLatchModal.sourceInstanceId,
                                pourLatchModal.targetInstanceId,
                                parsedVolMl,
                              );
                            }
                          }}
                          className="w-full rounded-[8px] bg-slate-950/80 border border-sky-400/70 focus:border-white px-2.5 py-1.5 font-mono text-[16px] font-extrabold text-[#67E8F9] tabular-nums outline-none"
                          placeholder="Nhập ml..."
                        />
                        <span className="font-mono text-[13px] font-extrabold text-sky-300 shrink-0">
                          ml
                        </span>
                      </div>
                    </div>

                    <div
                      className={`p-2.5 rounded-[11px] border transition-colors ${
                        pourInputFocusField === 'mass'
                          ? 'bg-emerald-950/55 border-[#2DD4BF]'
                          : 'bg-slate-900/60 border-white/20'
                      }`}
                    >
                      <label className="block text-[11.5px] font-extrabold text-emerald-200 mb-1">
                        ⚖️ Khối lượng muốn rót (g):
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0.5}
                          max={ Number(
                            (
                              pourLatchModal.maxTransferMl *
                              pourLatchModal.densityGPerMl
                            ).toFixed(1),
                          )}
                          step={0.5}
                          value={pourInputMassG}
                          onFocus={() => setPourInputFocusField('mass')}
                          onChange={(e) => {
                            const raw = e.target.value;
                            setPourInputMassG(raw);
                            const num = Number(raw);
                            if (Number.isFinite(num) && raw !== '') {
                              setPourInputVolumeMl(
                                String(
                                  Number(
                                    (
                                      num / pourLatchModal.densityGPerMl
                                    ).toFixed(2),
                                  ),
                                ),
                              );
                            } else {
                              setPourInputVolumeMl('');
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && parsedVolMl > 0.05) {
                              e.preventDefault();
                              executeConfirmedLatchPour(
                                pourLatchModal.sourceInstanceId,
                                pourLatchModal.targetInstanceId,
                                parsedVolMl,
                              );
                            }
                          }}
                          className="w-full rounded-[8px] bg-slate-950/80 border border-emerald-400/70 focus:border-white px-2.5 py-1.5 font-mono text-[16px] font-extrabold text-[#5EEAD4] tabular-nums outline-none"
                          placeholder="Nhập g..."
                        />
                        <span className="font-mono text-[13px] font-extrabold text-emerald-300 shrink-0">
                          g
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mức chọn nhanh */}
                  <div className="mt-2.5">
                    <div className="text-[11px] font-bold text-slate-300 mb-1.5">
                      Chọn nhanh lượng dung dịch cần rót (D ≈ 1,00 g/ml):
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {presetVolumes.map((preset) => {
                        const disabled = preset > pourLatchModal.maxTransferMl + 0.05;
                        const active = Math.abs(Number(pourInputVolumeMl) - preset) < 0.1;
                        return (
                          <button
                            key={preset}
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                              setPourInputVolumeMl(String(preset));
                              setPourInputMassG(String(preset));
                            }}
                            className={`px-2.5 py-1 rounded-[7px] font-mono text-[11.5px] font-extrabold tabular-nums cursor-pointer border transition-colors disabled:opacity-35 disabled:cursor-not-allowed ${
                              active
                                ? 'bg-[#1E6BFF] text-white border-white shadow-xs'
                                : 'bg-slate-900/80 text-sky-100 border-white/25 hover:border-[#38BDF8] hover:bg-slate-800'
                            }`}
                          >
                            {preset} ml ({preset} g)
                          </button>
                        );
                      })}
                      {pourLatchModal.maxTransferMl > 0.1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const maxV = Number(
                              pourLatchModal.maxTransferMl.toFixed(1),
                            );
                            setPourInputVolumeMl(String(maxV));
                            setPourInputMassG(String(maxV));
                          }}
                          className="px-2.5 py-1 rounded-[7px] font-mono text-[11.5px] font-extrabold tabular-nums cursor-pointer border bg-amber-500/25 text-amber-200 border-amber-400/70 hover:bg-amber-500/40 transition-colors"
                        >
                          Tối đa ({pourLatchModal.maxTransferMl.toFixed(0)} ml)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Thông tin dự kiến sau khi rót */}
                  <div className="mt-3 px-3 py-2 rounded-[9px] bg-slate-900/90 border border-white/15 flex items-center justify-between text-[11.5px]">
                    <span className="text-slate-300 font-semibold">
                      Sau khi rót{' '}
                      <strong className="text-sky-300 font-mono">
                        +{parsedVolMl.toFixed(1)} ml
                      </strong>{' '}
                      (
                      <strong className="text-emerald-300 font-mono">
                        +{parsedMassG.toFixed(1)} g
                      </strong>
                      ):
                    </span>
                    <span className="font-mono font-extrabold text-[#5EEAD4]">
                      Bình nhận: {afterDstMl.toFixed(1)} /{' '}
                      {pourLatchModal.targetCapacityMl} ml (Còn ở nguồn:{' '}
                      {afterSrcMl.toFixed(1)} ml)
                    </span>
                  </div>

                  {/* Nút Hủy và OK */}
                  <div className="mt-3.5 pt-2.5 border-t border-white/20 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setPourLatchModal(null)}
                      className="px-4 py-2 rounded-[9px] bg-slate-800 hover:bg-slate-700 border border-white/25 text-slate-200 text-[13px] font-extrabold cursor-pointer transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      disabled={parsedVolMl <= 0.05}
                      onClick={() =>
                        executeConfirmedLatchPour(
                          pourLatchModal.sourceInstanceId,
                          pourLatchModal.targetInstanceId,
                          parsedVolMl,
                        )
                      }
                      className="px-5 py-2 rounded-[9px] bg-gradient-to-r from-[#1E6BFF] to-[#00BCEB] hover:from-[#1552C7] hover:to-[#0284C7] disabled:opacity-40 border border-white/40 text-white text-[13.5px] font-extrabold cursor-pointer transition-all shadow-[0_6px_20px_rgba(30,107,255,0.45)] flex items-center gap-1.5"
                    >
                      <span>OK · Rót +{parsedVolMl.toFixed(1)} ml ({parsedMassG.toFixed(1)} g)</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

        {/* Bảng điều khiển Mở van lấy nước theo thể tích cần (Nhập số ml trực tiếp) — Nền kính trong suốt mờ */}
        {viewMode === 'lab-scene' &&
          onDispenseWaterVolume &&
          isWaterValveOpenUI && (() => {
            const dispenserInst = instances.find(
              (i) =>
                i.visible &&
                assetsMap.get(i.assetId)?.geometry.proceduralArchetype ===
                  'water-dispenser',
            );
            const dispenserRemainMl =
              dispenserInst?.instanceState.liquidLevelMl ?? 850;
            const receivingVessels = instances.filter((i) => {
              if (!i.visible) return false;
              const arch = assetsMap.get(i.assetId)?.geometry.proceduralArchetype;
              return (
                arch === 'graduated-cylinder' ||
                arch === 'beaker-250' ||
                arch === 'beaker-bomex-100' ||
                arch === 'thermal-heating-vessel' ||
                arch === 'overflow-can' ||
                arch === 'erlenmeyer-flask' ||
                arch === 'porcelain-dish'
              );
            });
            const resolvedTargetId =
              receivingVessels.some((v) => v.instanceId === valveTargetInstanceId)
                ? valveTargetInstanceId
                : activeInstance &&
                    receivingVessels.some(
                      (v) => v.instanceId === activeInstance.instanceId,
                    )
                  ? activeInstance.instanceId
                  : receivingVessels[0]?.instanceId ?? '';
            const targetVessel = receivingVessels.find(
              (v) => v.instanceId === resolvedTargetId,
            );
            const targetAsset = targetVessel
              ? assetsMap.get(targetVessel.assetId)
              : undefined;
            const targetArch = targetAsset?.geometry.proceduralArchetype;
            const targetMaxCap =
              targetArch === 'overflow-can'
                ? 210
                : targetAsset?.scientificProperties.capacity?.value ?? 100;
            const targetCurMl =
              targetVessel?.instanceState.liquidLevelMl ?? targetMaxCap * 0.5;
            const parsedMl = Math.max(
              0.5,
              Math.min(500, Number(valveInputMl) || 0),
            );

            return (
              <div
                ref={waterValvePopupRef}
                onClick={(e) => e.stopPropagation()}
                className="absolute inset-x-2 bottom-2 sm:left-3 sm:right-auto sm:bottom-3 z-[60] sm:w-[368px] max-w-[calc(100%-16px)] max-h-[min(74dvh,460px)] overflow-y-auto overscroll-contain safe-bottom rounded-[14px] border-[1.5px] border-[#38BDF8]/85 bg-[#081528]/88 backdrop-blur-xl text-white p-3.5 shadow-[0_20px_48px_rgba(0,0,0,0.68)]"
              >
                {/* Header Bình cấp nước: Hình ảnh thiết bị sắc nét (KHÔNG làm mờ) + Thông số trên nền kính mờ xuyên thấu */}
                <div className="flex items-center justify-between gap-2.5 pb-2.5 border-b border-white/25">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-11 h-11 rounded-[9px] bg-white border-[1.5px] border-sky-300 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                      <EquipmentThumbnailSvg
                        archetype="water-dispenser"
                        assetId={dispenserInst?.assetId || 'OL3D-EQP-WDP-1000'}
                        className="w-9 h-9"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-extrabold text-white truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                        Bình cấp nước thí nghiệm
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[13px] font-extrabold text-[#5EEAD4] tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                          {dispenserRemainMl.toFixed(0)} / 1000 ml
                        </span>
                        <span className="text-[10.5px] font-bold text-amber-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                          (ĐCNN: 10 ml)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {dispenserInst && (
                      <button
                        type="button"
                        onClick={() =>
                          onDispenseWaterVolume(
                            dispenserInst.instanceId,
                            1000,
                            'refill-dispenser',
                          )
                        }
                        className="px-2 py-1 rounded-[7px] bg-sky-500/25 hover:bg-sky-500/45 border border-sky-300/80 text-[11px] font-mono font-extrabold text-white cursor-pointer shadow-2xs"
                        title="Châm đầy 1000 ml nước cất vào bình chứa"
                      >
                        +1000 ml
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setIsWaterValveOpenUI(false);
                        if (
                          activeAsset?.geometry.proceduralArchetype ===
                          'water-dispenser'
                        ) {
                          onSelectInstance(resolvedTargetId || null);
                        }
                      }}
                      className="h-6.5 px-2 rounded-[6px] bg-[#DC2626] hover:bg-[#B91C1C] border border-[#F87171] text-white text-[11px] font-extrabold flex items-center gap-0.5 cursor-pointer shadow-xs"
                      aria-label="Ẩn bảng van nước"
                    >
                      <span>Ẩn</span>
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Chọn dụng cụ hứng nước */}
                <div className="mt-2.5">
                  <label className="block text-[11.5px] font-extrabold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] mb-1">
                    1. Chọn dụng cụ hứng nước ({targetCurMl.toFixed(1)} / {targetMaxCap} ml):
                  </label>
                  <select
                    value={resolvedTargetId}
                    onChange={(e) => setValveTargetInstanceId(e.target.value)}
                    className="w-full rounded-[8px] bg-slate-950/28 backdrop-blur-sm border-[1.5px] border-white/40 focus:border-[#00BCEB] px-2.5 py-1.5 text-[12.5px] font-extrabold text-white outline-none"
                  >
                    {receivingVessels.map((v) => {
                      const vAsset = assetsMap.get(v.assetId);
                      const vArch = vAsset?.geometry.proceduralArchetype;
                      const vCap =
                        vArch === 'overflow-can'
                          ? 210
                          : vAsset?.scientificProperties.capacity?.value ?? 100;
                      const vCur = v.instanceState.liquidLevelMl ?? vCap * 0.5;
                      const vSym = vAsset ? getEquipmentSymbol(vAsset) : '🧪';
                      return (
                        <option
                          key={v.instanceId}
                          value={v.instanceId}
                          className="bg-[#0B172A] text-white font-bold"
                        >
                          {vSym} {vCur.toFixed(1)} / {vCap} ml ({v.customLabel || vAsset?.name.vi})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Nhập số ml nước cần lấy */}
                <div className="mt-2.5">
                  <label className="block text-[11.5px] font-extrabold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] mb-1">
                    2. Nhập lượng nước cần lấy (ml):
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0.5}
                      max={250}
                      step={0.5}
                      value={valveInputMl}
                      onChange={(e) => setValveInputMl(e.target.value)}
                      className="flex-1 rounded-[8px] bg-slate-950/28 backdrop-blur-sm border-[1.5px] border-[#2DD4BF] px-2.5 py-1.5 font-mono text-[15px] font-extrabold text-[#67E8F9] tabular-nums outline-none"
                      placeholder="ml..."
                    />
                    <span className="font-mono text-[13.5px] font-extrabold text-[#5EEAD4] px-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                      ml
                    </span>
                  </div>

                  {/* Các mức chọn nhanh */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {[10, 20, 25, 50, 100, 210].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setValveInputMl(String(preset))}
                        className={`px-2.5 py-1 rounded-[6px] font-mono text-[11.5px] font-extrabold tabular-nums cursor-pointer border transition-colors ${
                          Number(valveInputMl) === preset
                            ? 'bg-[#1E6BFF] text-white border-white shadow-xs'
                            : 'bg-slate-950/25 text-white border-white/35 hover:border-[#00BCEB] hover:bg-slate-900/50'
                        }`}
                      >
                        {preset} ml
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nút Mở van xả nước */}
                <div className="mt-3 pt-2.5 border-t border-white/25 flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={!resolvedTargetId}
                    onClick={() => {
                      if (!resolvedTargetId) return;
                      triggerDispenseVisualAnimation(
                        resolvedTargetId,
                        parsedMl,
                        'add',
                      );
                      onDispenseWaterVolume(resolvedTargetId, parsedMl, 'add');
                    }}
                    className="flex-1 py-2 px-2.5 rounded-[8px] bg-[#1E6BFF] hover:bg-[#1552C7] border border-white/30 disabled:opacity-40 text-white font-mono text-[12.5px] font-extrabold cursor-pointer transition-colors tabular-nums shadow-sm"
                  >
                    🚰 +{parsedMl.toFixed(1)} ml
                  </button>
                  <button
                    type="button"
                    disabled={!resolvedTargetId}
                    onClick={() => {
                      if (!resolvedTargetId) return;
                      triggerDispenseVisualAnimation(
                        resolvedTargetId,
                        parsedMl,
                        'set',
                      );
                      onDispenseWaterVolume(resolvedTargetId, parsedMl, 'set');
                    }}
                    className="py-2 px-2.5 rounded-[8px] bg-emerald-600/80 hover:bg-emerald-600 disabled:opacity-40 border border-emerald-300/80 text-white font-mono text-[12.5px] font-extrabold cursor-pointer transition-colors tabular-nums shadow-sm"
                    title={`Đặt mực nước chuẩn bằng ${parsedMl.toFixed(1)} ml`}
                  >
                    = {parsedMl.toFixed(1)} ml
                  </button>
                </div>
              </div>
            );
          })()}

        {/* DEVICE BOTTOM SHEET (3 States: Translucent Glass Pill / Translucent Compact Symbol Bar / Detail Sheet) */}
        {viewMode === 'lab-scene' &&
          !isWaterValveOpenUI &&
          activeInstance &&
          activeAsset &&
          onQuickLabAction &&
          (() => {
            const liveReadout = computeLiveEquipmentReadout(
              activeInstance,
              activeAsset,
            );
            const eqSymbol = getEquipmentSymbol(activeAsset);
            const dims = activeAsset.geometry.boundingBoxM;
            const dimsMmText = `${Math.round(dims.width * 1000)} × ${Math.round(
              dims.height * 1000,
            )} × ${Math.round(dims.depth * 1000)} mm`;
            const previewEntry = equipmentImagePreviewController.getEntry(
              activeAsset.assetId,
            );
            const realPhotoSrc =
              previewEntry?.realPhotoMeta.available &&
              previewEntry?.realPhotoMeta.sourceKind === 'real-photo'
                ? previewEntry.realPhotoMeta.src
                : null;

            // STATE A: COLLAPSED — Desktop ẩn hoàn toàn khi chưa nhấp đúp; Mobile hiện thanh gọn ở đáy để mở nút điều khiển thiết bị (vẫn giữ 3D rõ ràng)
            if (deviceSheetMode === 'collapsed') {
              if (dualAxisGizmoInstanceId) {
                return null;
              }
              return (
                <div
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className="md:hidden absolute inset-x-2 bottom-2 safe-bottom z-[45] flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-[14px] bg-[#0B192F]/95 border border-sky-400/55 shadow-[0_10px_28px_rgba(0,0,0,0.55)] text-white"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[15px] leading-none shrink-0">
                      {eqSymbol}
                    </span>
                    <span className="text-[12.5px] font-extrabold text-white truncate">
                      {activeInstance.customLabel || activeAsset.name.vi}
                    </span>
                    {liveReadout.readoutBadge && (
                      <span className="px-1.5 py-0.5 rounded-[5px] bg-[#1E6BFF]/85 font-mono text-[11px] font-extrabold tabular-nums shrink-0">
                        {liveReadout.readoutBadge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        labSoundEngine.play('ui-toggle', 0.7);
                        setDeviceSheetMode('compact');
                      }}
                      className="h-9 px-2.5 rounded-[9px] bg-[#1E6BFF] active:bg-[#1552C7] border border-sky-300/70 text-white text-[12px] font-extrabold flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <Sliders className="w-3.5 h-3.5 shrink-0" />
                      <span>Điều khiển</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectInstance(null)}
                      className="w-9 h-9 rounded-[9px] bg-slate-800 border border-white/20 text-slate-200 flex items-center justify-center cursor-pointer active:scale-95"
                      aria-label="Bỏ chọn thiết bị"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            }

            // STATE C / D (COMPACT) & STATE E (DETAIL) — Nền kính mờ trong suốt cao (Glassmorphism) nhìn xuyên thấu bàn 3D + Chữ cực đậm rõ
            return (
              <div
                ref={deviceSheetRef}
                onClick={(e) => e.stopPropagation()}
                className={`absolute inset-x-2 bottom-2 md:left-3 md:right-auto md:bottom-3 md:max-w-[84%] rounded-[14px] bg-[#081528]/24 backdrop-blur-md border-[1.5px] border-white/45 shadow-[0_14px_38px_rgba(0,0,0,0.45)] text-white flex flex-col safe-bottom ${
                  deviceSheetMode === 'detail'
                    ? 'z-[50] max-h-[min(70dvh,500px)] md:w-[580px] bg-[#081528]/85 border-[#38BDF8]/85'
                    : 'z-30 md:min-w-[460px]'
                }`}
              >
                {/* Thanh chuyển nhanh giữa các dụng cụ đang có trên bàn 3D */}
                {visibleBenchInstances.length > 1 && (
                  <div className="px-2.5 py-1 border-b border-white/20 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 bg-slate-950/35 rounded-t-[13px]">
                    <span className="text-[10.5px] font-extrabold text-sky-300 uppercase tracking-wider shrink-0 mr-1">
                      Bàn 3D ({visibleBenchInstances.length}):
                    </span>
                    {visibleBenchInstances.map((instItem) => {
                      const itemAsset =
                        assetsMap.get(instItem.assetId) ??
                        htmlEquipmentModuleRegistry.getModule(instItem.assetId)?.asset;
                      const isSel = instItem.instanceId === activeInstance.instanceId;
                      return (
                        <button
                          key={instItem.instanceId}
                          type="button"
                          onClick={() => onSelectInstance(instItem.instanceId)}
                          className={`px-2 py-0.5 rounded-[6px] text-[11px] font-extrabold whitespace-nowrap border transition-colors cursor-pointer shrink-0 ${
                            isSel
                              ? 'bg-[#1E6BFF] border-sky-300 text-white shadow-2xs'
                              : 'bg-slate-900/65 hover:bg-slate-800/80 border-white/25 text-slate-200'
                          }`}
                        >
                          {instItem.customLabel || itemAsset?.name.vi || instItem.assetId}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Thanh tiêu đề Device Sheet: Hình thu nhỏ sắc nét + Tên thiết bị & Thông số đo đậm rõ trên nền kính mờ */}
                <div className="px-3 py-2 border-b border-white/25 flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Khung hình ảnh/icon nhỏ sắc nét KHÔNG làm mờ */}
                    <button
                      type="button"
                      onClick={() => {
                        if (window.innerWidth < 768) return;
                        equipmentImagePreviewController.preview(
                          activeAsset.assetId,
                          'pinned',
                        );
                      }}
                      className="w-8 h-8 rounded-[7px] bg-white border border-sky-300 flex items-center justify-center shrink-0 shadow-xs overflow-hidden cursor-pointer"
                      title="Nhấn để mở cửa sổ xem ảnh thực tế 240×240 & thông số"
                    >
                      {realPhotoSrc ? (
                        <img
                          src={realPhotoSrc}
                          alt={activeAsset.name.vi}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <EquipmentThumbnailSvg
                          archetype={activeAsset.geometry.proceduralArchetype}
                          assetId={activeAsset.assetId}
                          className="w-7 h-7"
                        />
                      )}
                    </button>

                    <span className="text-[13.5px] font-extrabold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] truncate">
                      {activeInstance.customLabel || activeAsset.name.vi}
                    </span>

                    {liveReadout.readoutBadge && (
                      <span
                        className={`px-2 py-0.5 rounded-[6px] font-mono text-[12.5px] font-extrabold tabular-nums shrink-0 shadow-2xs ${
                          liveReadout.isDigitalScale
                            ? 'bg-slate-950/75 text-[#5EEAD4] border border-emerald-400/80'
                            : 'bg-[#1E6BFF]/85 text-white border border-white/35'
                        }`}
                      >
                        {liveReadout.readoutBadge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Nút Bật/Tắt chú thích trên đầu dụng cụ (?) */}
                    <button
                      type="button"
                      onClick={handleToggleDetailedGuides}
                      className={`w-6.5 h-6.5 rounded-[6px] border flex items-center justify-center cursor-pointer transition-colors ${
                        isDetailedGuideOn
                          ? 'bg-amber-500/55 border-amber-300 text-white'
                          : 'bg-slate-950/55 hover:bg-slate-900/80 border-white/30 text-amber-300'
                      }`}
                      title={
                        isDetailedGuideOn
                          ? 'Ẩn chữ chú thích trên từng dụng cụ'
                          : 'Hiện chữ chú thích trên từng dụng cụ'
                      }
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setConfirmDeleteId(null);
                        const curPreview = equipmentImagePreviewController.getState();
                        const nextIsDetail = deviceSheetMode !== 'detail';
                        setDeviceSheetMode(nextIsDetail ? 'detail' : 'compact');
                        if (nextIsDetail) {
                          equipmentImagePreviewController.preview(
                            activeAsset.assetId,
                            'pinned',
                          );
                        } else if (curPreview.visible) {
                          equipmentImagePreviewController.hide('close');
                        }
                      }}
                      className={`hidden md:flex h-6.5 px-2.5 rounded-[6px] border text-[11px] font-extrabold items-center gap-1 cursor-pointer transition-colors ${
                        deviceSheetMode === 'detail'
                          ? 'bg-[#DC2626] hover:bg-[#B91C1C] border-[#F87171] text-white'
                          : 'bg-slate-950/55 hover:bg-slate-900/80 border-white/30 text-amber-200'
                      }`}
                      title="Mở bảng trượt thông tin chi tiết thiết bị (ảnh thực tế, dung tích, kích thước, khối lượng chuẩn)"
                    >
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {deviceSheetMode === 'detail' ? 'Đóng chi tiết' : 'Chi tiết'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeviceSheetMode('collapsed')}
                      className="h-6.5 px-2 rounded-[6px] bg-[#DC2626] hover:bg-[#B91C1C] border border-[#F87171] text-white text-[11px] font-extrabold flex items-center gap-0.5 cursor-pointer shadow-xs"
                      title="Ẩn thanh công cụ điều khiển thiết bị"
                      aria-label="Ẩn thanh công cụ điều khiển thiết bị"
                    >
                      <span>Ẩn</span>
                      <ChevronDown className="w-3.5 h-3.5 text-white" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectInstance(null)}
                      className="w-6.5 h-6.5 rounded-[6px] bg-[#DC2626] hover:bg-[#B91C1C] border border-[#F87171] text-white flex items-center justify-center cursor-pointer shadow-xs"
                      title="Đóng và bỏ chọn thiết bị"
                      aria-label="Đóng và bỏ chọn thiết bị"
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Hàng nút Thao tác Thí nghiệm bằng Ký hiệu & Thông số (Nền kính trong suốt mờ) */}
                <div className="px-2.5 py-1.5 flex flex-wrap items-center gap-1.5 shrink-0">
                  {activeAsset.geometry.proceduralArchetype ===
                    'water-dispenser' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsWaterValveOpenUI(true)}
                        className="px-2.5 py-1 rounded-[7px] bg-[#1E6BFF]/70 hover:bg-[#1E6BFF]/90 border border-white/25 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                        title="Mở bảng nhập số ml lấy nước"
                      >
                        {isDetailedGuideOn ? '🚰 Nhập số ml lấy nước' : '🚰 +ml'}
                      </button>
                      {onDispenseWaterVolume && (
                        <button
                          type="button"
                          onClick={() =>
                            onDispenseWaterVolume(
                              activeInstance.instanceId,
                              1000,
                              'refill-dispenser',
                            )
                          }
                          className="px-2.5 py-1 rounded-[7px] bg-slate-900/45 hover:bg-slate-900/70 border border-emerald-400/60 text-[#5EEAD4] font-mono text-[12px] font-bold cursor-pointer transition-colors"
                          title="Châm đầy bình 1000 ml"
                        >
                          {isDetailedGuideOn ? 'Châm đầy (1000 ml)' : '🔄 1000 ml'}
                        </button>
                      )}
                    </>
                  )}

                  {activeAsset.geometry.proceduralArchetype ===
                    'electronic-balance' && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          onQuickLabAction(
                            'tare-balance',
                            activeInstance.instanceId,
                          )
                        }
                        className="px-2.5 py-1 rounded-[7px] bg-slate-900/45 hover:bg-emerald-900/60 border border-emerald-400/60 text-[#5EEAD4] font-mono text-[12px] font-extrabold cursor-pointer transition-colors"
                        title="Trừ bì (TARE) về 0.00 g"
                      >
                        {isDetailedGuideOn
                          ? 'Trừ bì (TARE) · 0.00 g'
                          : '⌖ 0.00 g (TARE)'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onQuickLabAction(
                            'weigh-selected',
                            activeInstance.instanceId,
                          )
                        }
                        className="px-2.5 py-1 rounded-[7px] bg-[#1E6BFF]/70 hover:bg-[#1E6BFF]/90 border border-white/25 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                        title="Đặt vật mẫu lên đĩa cân"
                      >
                        {isDetailedGuideOn
                          ? (activeInstance.instanceState.measuredMassG ?? 0) > 0
                            ? 'Đặt thêm vật mẫu (+m)'
                            : 'Đặt vật mẫu lên cân'
                          : '🧱→⚖️ +m (g)'}
                      </button>
                      {(activeInstance.instanceState.measuredMassG ?? 0) > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            onQuickLabAction(
                              'clear-balance-pan',
                              activeInstance.instanceId,
                            )
                          }
                          className="px-2.5 py-1 rounded-[7px] bg-slate-900/45 hover:bg-red-900/60 border border-rose-400/60 text-rose-300 font-mono text-[12px] font-bold cursor-pointer transition-colors"
                          title="Lấy vật ra khỏi đĩa cân"
                        >
                          {isDetailedGuideOn ? 'Dọn đĩa cân' : '✕ 0.00 g'}
                        </button>
                      )}
                    </>
                  )}

                  {(activeAsset.geometry.proceduralArchetype === 'beaker-250' ||
                    activeAsset.geometry.proceduralArchetype ===
                      'erlenmeyer-flask') && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setValveTargetInstanceId(activeInstance.instanceId);
                          setIsWaterValveOpenUI(true);
                          triggerDispenseVisualAnimation(
                            activeInstance.instanceId,
                            25,
                            'add',
                          );
                          onQuickLabAction(
                            'dock-to-dispenser',
                            activeInstance.instanceId,
                          );
                        }}
                        className="px-2.5 py-1 rounded-[7px] bg-sky-600/70 hover:bg-sky-600/90 border border-white/25 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                        title="Đặt lại gần vòi Bình cấp nước & lấy +25 ml"
                      >
                        {isDetailedGuideOn
                          ? '🚰 Đặt dưới vòi lấy nước (+25 ml)'
                          : '🚰 +25 ml'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          triggerPourVisualAnimation(
                            activeInstance.instanceId,
                            'graduated-cylinder',
                          );
                          onQuickLabAction(
                            'pour-to-cylinder',
                            activeInstance.instanceId,
                          );
                        }}
                        className="px-2.5 py-1 rounded-[7px] bg-[#1E6BFF]/70 hover:bg-[#1E6BFF]/90 border border-white/25 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                        title="Nghiêng rót 20 ml sang Ống đong"
                      >
                        {isDetailedGuideOn
                          ? 'Rót 20 ml sang Ống đong'
                          : '🫙→🧪 +20 ml'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          triggerPourVisualAnimation(
                            activeInstance.instanceId,
                            'overflow-can',
                          );
                          onQuickLabAction(
                            'pour-to-overflow',
                            activeInstance.instanceId,
                          );
                        }}
                        className="px-2.5 py-1 rounded-[7px] bg-cyan-600/70 hover:bg-cyan-600/90 border border-white/25 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                        title="Rót nước từ Cốc sang Bình tràn"
                      >
                        {isDetailedGuideOn
                          ? 'Rót sang Bình tràn'
                          : '🫙→🫗 +ml'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onQuickLabAction(
                            'weigh-selected',
                            activeInstance.instanceId,
                          )
                        }
                        className="px-2.5 py-1 rounded-[7px] bg-slate-900/45 hover:bg-slate-900/70 border border-emerald-400/60 text-[#5EEAD4] font-mono text-[12px] font-semibold cursor-pointer transition-colors"
                        title="Đặt lên Cân điện tử"
                      >
                        {isDetailedGuideOn ? 'Đặt lên Cân' : '→⚖️ (g)'}
                      </button>
                    </>
                  )}

                  {activeAsset.geometry.proceduralArchetype ===
                    'graduated-cylinder' && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setValveTargetInstanceId(activeInstance.instanceId);
                          setIsWaterValveOpenUI(true);
                          triggerDispenseVisualAnimation(
                            activeInstance.instanceId,
                            20,
                            'add',
                          );
                          onQuickLabAction(
                            'dock-to-dispenser',
                            activeInstance.instanceId,
                          );
                        }}
                        className="px-2.5 py-1 rounded-[7px] bg-sky-600/70 hover:bg-sky-600/90 border border-white/25 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                        title="Đặt dưới vòi Bình cấp nước & lấy +20 ml"
                      >
                        {isDetailedGuideOn
                          ? '🚰 Đặt dưới vòi lấy nước (+20 ml)'
                          : '🚰 +20 ml'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onQuickLabAction(
                            'submerge-cylinder',
                            activeInstance.instanceId,
                          )
                        }
                        className="px-2.5 py-1 rounded-[7px] bg-[#1E6BFF]/70 hover:bg-[#1E6BFF]/90 border border-white/25 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                        title="Thả ngập vật rắn vào ống đong để đo V₂"
                      >
                        {isDetailedGuideOn
                          ? 'Nhúng vật rắn vào ống'
                          : '🧱→🧪 ΔV (cm³)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          triggerPourVisualAnimation(
                            activeInstance.instanceId,
                            'beaker-250',
                          );
                          onQuickLabAction(
                            'pour-to-beaker',
                            activeInstance.instanceId,
                          );
                        }}
                        className="px-2.5 py-1 rounded-[7px] bg-slate-900/45 hover:bg-slate-900/70 border border-white/25 text-slate-100 font-mono text-[12px] font-semibold cursor-pointer transition-colors"
                        title="Nghiêng rót 15 ml sang Cốc thủy tinh"
                      >
                        {isDetailedGuideOn
                          ? 'Rót 15 ml sang Cốc'
                          : '🧪→🫙 -15 ml'}
                      </button>
                    </>
                  )}

                  {/* Thanh điều khiển Góc nghiêng rót chất lỏng thời gian thực (Tilt-Based Pouring Simulation >= 45°) */}
                  {(activeAsset.geometry.proceduralArchetype === 'beaker-250' ||
                    activeAsset.geometry.proceduralArchetype ===
                      'graduated-cylinder' ||
                    activeAsset.geometry.proceduralArchetype ===
                      'erlenmeyer-flask' ||
                    activeAsset.geometry.proceduralArchetype ===
                      'overflow-can') && (() => {
                    const curTiltDeg =
                      vesselTiltDegMap[activeInstance.instanceId] ??
                      Math.round(
                        (Math.hypot(
                          activeInstance.transform.rotationRad[0],
                          activeInstance.transform.rotationRad[2],
                        ) *
                          180) /
                          Math.PI,
                      );
                    const isPouringActive =
                      curTiltDeg >= TILT_POUR_THRESHOLD_DEG &&
                      (activeInstance.instanceState.liquidLevelMl ?? 0) > 0.2;

                    return (
                      <div className="flex flex-wrap items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-slate-950/65 border border-sky-400/55">
                        <span
                          className={`text-[11px] font-extrabold ${
                            isPouringActive ? 'text-[#38BDF8]' : 'text-sky-200'
                          }`}
                          title="Khi góc nghiêng đạt ngưỡng ≥ 45°, bình tự động kích hoạt trạng thái Đang rót với dòng chảy 3D thời gian thực"
                        >
                          {isPouringActive
                            ? `🫧 Đang rót (${curTiltDeg}° ≥ 45°):`
                            : `📐 Góc nghiêng (${curTiltDeg}° / ngưỡng 45°):`}
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={85}
                          step={1}
                          value={curTiltDeg}
                          onChange={(e) =>
                            handleSetVesselTiltAngle(
                              activeInstance.instanceId,
                              Number(e.target.value),
                              true,
                            )
                          }
                          className="w-24 sm:w-28 accent-[#38BDF8] cursor-pointer"
                          title="Kéo thanh trượt vượt 45° để nghiêng bình và rót chất lỏng theo thời gian thực"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleSetVesselTiltAngle(
                              activeInstance.instanceId,
                              56,
                              true,
                            )
                          }
                          className={`px-2 py-0.5 rounded-[5px] font-mono text-[11px] font-extrabold border cursor-pointer transition-colors ${
                            curTiltDeg >= 45
                              ? 'bg-[#0284C7] border-sky-300 text-white'
                              : 'bg-sky-950/70 hover:bg-sky-800/80 border-sky-400/50 text-sky-200'
                          }`}
                          title="Nghiêng 56° (vượt ngưỡng 45°) để rót chất lỏng sang bình bên dưới"
                        >
                          Nghiêng rót 56°
                        </button>
                        {curTiltDeg > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              handleSetVesselTiltAngle(
                                activeInstance.instanceId,
                                0,
                                false,
                              )
                            }
                            className="px-2 py-0.5 rounded-[5px] bg-slate-800/80 hover:bg-slate-700 border border-white/25 font-mono text-[11px] font-bold text-amber-200 cursor-pointer transition-colors"
                            title="Đặt bình đứng thẳng trở lại (0°)"
                          >
                            Đặt thẳng 0°
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  {activeAsset.geometry.proceduralArchetype ===
                    'overflow-can' && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          onQuickLabAction(
                            'submerge-overflow',
                            activeInstance.instanceId,
                          )
                        }
                        className="px-2.5 py-1 rounded-[7px] bg-[#1E6BFF]/70 hover:bg-[#1E6BFF]/90 border border-white/25 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                        title="Thả vật vào Bình tràn"
                      >
                        {isDetailedGuideOn
                          ? 'Thả vật vào Bình tràn'
                          : '🧱→🫗 ΔV (ml)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setValveTargetInstanceId(activeInstance.instanceId);
                          setValveInputMl('210');
                          setIsWaterValveOpenUI(true);
                          triggerDispenseVisualAnimation(
                            activeInstance.instanceId,
                            210,
                            'set',
                          );
                          onQuickLabAction(
                            'dock-to-dispenser',
                            activeInstance.instanceId,
                          );
                        }}
                        className="px-2.5 py-1 rounded-[7px] bg-sky-600/70 hover:bg-sky-600/90 border border-white/25 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                        title="Đặt Bình tràn dưới vòi Bình cấp nước & đổ đầy ngang vòi (210 ml)"
                      >
                        {isDetailedGuideOn
                          ? '🚰 Đặt dưới vòi lấy đầy 210 ml'
                          : '🚰 = 210 ml'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          triggerDispenseVisualAnimation(
                            activeInstance.instanceId,
                            210,
                            'set',
                          );
                          onQuickLabAction(
                            'refill-water',
                            activeInstance.instanceId,
                          );
                        }}
                        className="px-2.5 py-1 rounded-[7px] bg-slate-900/45 hover:bg-slate-900/70 border border-white/25 text-slate-100 font-mono text-[12px] font-semibold cursor-pointer transition-colors"
                        title="Châm nhanh ngang vòi tràn (210 ml)"
                      >
                        {isDetailedGuideOn
                          ? 'Đổ đầy ngang vòi (210 ml)'
                          : '= 210 ml'}
                      </button>
                    </>
                  )}

                  {(activeAsset.kind === 'specimen' ||
                    activeAsset.geometry.proceduralArchetype ===
                      'calibration-weight' ||
                    activeAsset.geometry.proceduralArchetype ===
                      'solid-cylinder' ||
                    activeAsset.geometry.proceduralArchetype === 'solid-block' ||
                    activeAsset.geometry.proceduralArchetype ===
                      'solid-sphere' ||
                    activeAsset.geometry.proceduralArchetype ===
                      'hollow-cylinder') && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          onQuickLabAction(
                            'weigh-selected',
                            activeInstance.instanceId,
                          )
                        }
                        className="px-2.5 py-1 rounded-[7px] bg-[#1E6BFF]/70 hover:bg-[#1E6BFF]/90 border border-white/25 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                        title="Đặt lên Cân điện tử để đo m (g)"
                      >
                        {isDetailedGuideOn ? 'Đặt lên Cân điện tử' : '→⚖️ m (g)'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onQuickLabAction(
                            'submerge-cylinder',
                            activeInstance.instanceId,
                          )
                        }
                        className="px-2.5 py-1 rounded-[7px] bg-sky-600/70 hover:bg-sky-600/90 border border-white/25 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                        title="Thả ngập vào Ống đong để đo V (cm³)"
                      >
                        {isDetailedGuideOn ? 'Thả vào Ống đong' : '→🧪 V (cm³)'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onQuickLabAction(
                            'submerge-overflow',
                            activeInstance.instanceId,
                          )
                        }
                        className="px-2.5 py-1 rounded-[7px] bg-slate-900/45 hover:bg-slate-900/70 border border-white/25 text-slate-100 font-mono text-[12px] font-semibold cursor-pointer transition-colors"
                        title="Thả vào Bình tràn"
                      >
                        {isDetailedGuideOn ? 'Thả vào Bình tràn' : '→🫗 V (ml)'}
                      </button>
                    </>
                  )}

                  {(activeAsset.geometry.proceduralArchetype ===
                    'laser-source' ||
                    activeAsset.geometry.proceduralArchetype ===
                      'optical-prism') && (
                    <button
                      type="button"
                      onClick={() =>
                        onQuickLabAction(
                          'toggle-laser',
                          activeInstance.instanceId,
                        )
                      }
                      className="px-2.5 py-1 rounded-[7px] bg-red-600/75 hover:bg-red-600 border border-white/25 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                    >
                      {isDetailedGuideOn
                        ? activeInstance.instanceState.isPoweredOn === false
                          ? 'Bật chùm tia Laser'
                          : 'Tắt chùm tia Laser'
                        : activeInstance.instanceState.isPoweredOn === false
                          ? '🔦 ON (650 nm)'
                          : '🔦 OFF'}
                    </button>
                  )}

                  {activeAsset.geometry.proceduralArchetype ===
                    'semicircular-slab' && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          onQuickLabAction(
                            'refraction-angle-20',
                            activeInstance.instanceId,
                          )
                        }
                        className="px-2.5 py-1 rounded-[7px] bg-slate-900/45 hover:bg-slate-900/70 border border-white/25 text-slate-100 font-mono text-[12px] font-semibold cursor-pointer transition-colors"
                      >
                        i = 20°
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onQuickLabAction(
                            'refraction-angle-40',
                            activeInstance.instanceId,
                          )
                        }
                        className="px-2.5 py-1 rounded-[7px] bg-[#1E6BFF]/70 hover:bg-[#1E6BFF]/90 border border-white/25 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                      >
                        i = 40° (i_th)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onQuickLabAction(
                            'refraction-angle-60',
                            activeInstance.instanceId,
                          )
                        }
                        className="px-2.5 py-1 rounded-[7px] bg-red-600/75 hover:bg-red-600 border border-white/25 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                      >
                        i = 60° (PXTP)
                      </button>
                    </>
                  )}

                  {(activeAsset.geometry.proceduralArchetype ===
                    'galvanometer' ||
                    activeAsset.geometry.proceduralArchetype ===
                      'induction-coil-led') && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          onQuickLabAction(
                            'induce-current-pos',
                            activeInstance.instanceId,
                          )
                        }
                        className="px-2.5 py-1 rounded-[7px] bg-red-600/75 hover:bg-red-600 border border-white/25 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                      >
                        {isDetailedGuideOn ? 'Đưa nam châm lại gần (+I)' : '🧲→ +I (mA)'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onQuickLabAction(
                            'induce-current-neg',
                            activeInstance.instanceId,
                          )
                        }
                        className="px-2.5 py-1 rounded-[7px] bg-emerald-600/75 hover:bg-emerald-600 border border-white/25 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                      >
                        {isDetailedGuideOn ? 'Kéo nam châm ra xa (-I)' : '←🧲 -I (mA)'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onQuickLabAction(
                            'induce-current-zero',
                            activeInstance.instanceId,
                          )
                        }
                        className="px-2.5 py-1 rounded-[7px] bg-slate-900/45 hover:bg-slate-900/70 border border-white/25 text-slate-100 font-mono text-[12px] font-semibold cursor-pointer transition-colors"
                      >
                        I = 0 mA
                      </button>
                    </>
                  )}

                  {/* ĐIỀU KHIỂN CỌc CẮM & TRẠNG THÁI CHO BỘ DỤNG CỤ MẠCH ĐIỆN 1 CHIỀU */}
                  {activeAsset.geometry.proceduralArchetype === 'dc-knife-switch' && (
                    <button
                      type="button"
                      onClick={() => {
                        const nextClosed = !activeInstance.instanceState.switchClosed;
                        onUpdateInstanceState?.(activeInstance.instanceId, {
                          switchClosed: nextClosed,
                        });
                        labSoundEngine.play('ui-toggle', 0.9);
                      }}
                      className={`px-3 py-1 rounded-[7px] font-mono text-[12px] font-bold border cursor-pointer transition-colors ${
                        activeInstance.instanceState.switchClosed
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-300'
                          : 'bg-rose-600/80 hover:bg-rose-600 text-white border-rose-300'
                      }`}
                    >
                      {activeInstance.instanceState.switchClosed
                        ? '⚡ Cầu dao K: ĐANG ĐÓNG (Nhấp để MỞ)'
                        : '🔌 Cầu dao K: ĐANG MỞ (Nhấp để ĐÓNG)'}
                    </button>
                  )}

                  {activeAsset.geometry.proceduralArchetype === 'dc-battery-holder' && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const cur = activeInstance.instanceState.slot1Inserted !== false;
                          onUpdateInstanceState?.(activeInstance.instanceId, {
                            slot1Inserted: !cur,
                            slot1Reversed: false,
                          });
                        }}
                        className="px-2.5 py-1 rounded-[7px] bg-amber-600/80 hover:bg-amber-600 border border-white/25 text-white font-mono text-[11px] font-bold cursor-pointer"
                      >
                        {activeInstance.instanceState.slot1Inserted !== false
                          ? '🔋 Khay 1 (SLOT_1): Có Pin 1.5V'
                          : '⚪ Khay 1 (SLOT_1): Trống'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const cur = activeInstance.instanceState.slot2Inserted !== false;
                          onUpdateInstanceState?.(activeInstance.instanceId, {
                            slot2Inserted: !cur,
                            slot2Reversed: false,
                          });
                        }}
                        className="px-2.5 py-1 rounded-[7px] bg-amber-600/80 hover:bg-amber-600 border border-white/25 text-white font-mono text-[11px] font-bold cursor-pointer"
                      >
                        {activeInstance.instanceState.slot2Inserted !== false
                          ? '🔋 Khay 2 (SLOT_2): Có Pin 1.5V'
                          : '⚪ Khay 2 (SLOT_2): Trống'}
                      </button>
                    </>
                  )}

                  {activeAsset.geometry.proceduralArchetype === 'dc-rheostat-20' && (
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-[7px] bg-slate-900/75 border border-emerald-400/40">
                      <span className="font-mono text-[11px] font-bold text-emerald-300">
                        Con chạy R = {(activeInstance.instanceState.rheostatOhm ?? 10).toFixed(1)} Ω
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.02}
                        value={activeInstance.instanceState.sliderRatio ?? 0.5}
                        onChange={(e) => {
                          const ratio = parseFloat(e.target.value);
                          onUpdateInstanceState?.(activeInstance.instanceId, {
                            sliderRatio: ratio,
                            rheostatOhm: Number((ratio * 20).toFixed(2)),
                          });
                        }}
                        className="w-28 accent-emerald-400 cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Danh sách các CỌC CẮM (TERMINALS) của thiết bị đang chọn để người dùng có thể nhấp nối dây ngay cả trên màn hình nhỏ */}
                  {(() => {
                    const arch = activeAsset.geometry.proceduralArchetype;
                    const deviceTerminals = Object.values(
                      CIRCUIT_TERMINAL_DEFINITIONS,
                    ).filter((t) => t.deviceArchetype === arch);
                    if (deviceTerminals.length === 0) return null;
                    return (
                      <div className="w-full pt-1.5 border-t border-white/15 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-mono font-bold text-amber-300">
                          🔌 Chọn cọc cắm dây:
                        </span>
                        {deviceTerminals.map((term) => {
                          const isPicked =
                            pendingTerminalPick?.instanceId ===
                              activeInstance.instanceId &&
                            pendingTerminalPick?.terminalId === term.id;
                          return (
                            <button
                              key={term.id}
                              type="button"
                              onClick={() =>
                                handleTerminalSocketPick(
                                  activeInstance.instanceId,
                                  term.id,
                                )
                              }
                              className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold border transition-all cursor-pointer ${
                                isPicked
                                  ? 'bg-amber-400 text-slate-950 border-white ring-2 ring-amber-300'
                                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-100 border-white/25'
                              }`}
                              title={term.labelVi}
                            >
                              {term.id}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* BẢNG ĐIỀU KHIỂN TƯƠNG TÁC TRỰC TIẾP TRỌN GÓI (FULL-BUNDLE LIVE 3D CONTROL PANEL) */}
                  {(() => {
                    const customMod = htmlEquipmentModuleRegistry.getModule(
                      activeAsset.assetId,
                    );
                    const arch = activeAsset.geometry.proceduralArchetype;
                    const capVal = activeAsset.scientificProperties.capacity?.value;

                    // Chuẩn hóa thông số điều khiển trực tiếp cho cả dụng cụ AI/HTML lẫn dụng cụ chuẩn trong kho
                    const ctrl: {
                      stateKey:
                        | 'multimeterValue'
                        | 'liquidLevelMl'
                        | 'temperatureC'
                        | 'incidentAngleDeg'
                        | 'springExtensionN'
                        | 'jawOpeningMm'
                        | 'magnification'
                        | 'measuredMassG'
                        | 'galvanometerDeflection';
                      label: string;
                      unit: string;
                      min: number;
                      max: number;
                      step: number;
                      defaultValue: number;
                      canBeWeighedOnBalance?: boolean;
                      presets: Array<{
                        label: string;
                        statePatch: Partial<SceneInstance['instanceState']>;
                      }>;
                    } | null = (() => {
                      if (customMod) {
                        return customMod.moduleControls;
                      }
                      if (
                        arch === 'beaker-250' ||
                        arch === 'graduated-cylinder' ||
                        arch === 'erlenmeyer-flask' ||
                        arch === 'overflow-can' ||
                        arch === 'water-dispenser' ||
                        arch === 'separatory-funnel'
                      ) {
                        const maxMl =
                          arch === 'overflow-can'
                            ? 210
                            : capVal ??
                              (arch === 'water-dispenser'
                                ? 1000
                                : arch === 'graduated-cylinder'
                                  ? 100
                                  : 250);
                        const defMl =
                          arch === 'overflow-can'
                            ? 210
                            : arch === 'water-dispenser'
                              ? 850
                              : Number((maxMl * 0.5).toFixed(1));
                        return {
                          stateKey: 'liquidLevelMl',
                          label: 'Thể tích chất lỏng V',
                          unit: 'ml',
                          min: 0,
                          max: maxMl,
                          step: maxMl <= 100 ? 1 : 5,
                          defaultValue: defMl,
                          canBeWeighedOnBalance: arch !== 'water-dispenser',
                          presets: [],
                        };
                      }
                      if (
                        arch === 'thermometer' ||
                        arch === 'thermal-heating-vessel' ||
                        arch === 'alcohol-burner' ||
                        arch === 'porcelain-dish' ||
                        arch === 'distillation-flask'
                      ) {
                        const isThermOrVessel =
                          arch === 'thermometer' ||
                          arch === 'thermal-heating-vessel';
                        return {
                          stateKey: 'temperatureC',
                          label:
                            arch === 'thermometer'
                              ? 'Nhiệt độ đo T'
                              : arch === 'thermal-heating-vessel'
                                ? 'Nhiệt độ nước / đá trong bình T'
                                : 'Nhiệt độ ngọn lửa đèn cồn T',
                          unit: '°C',
                          min: isThermOrVessel ? -10 : 0,
                          max: arch === 'thermometer' ? 110 : 100,
                          step: 1,
                          defaultValue:
                            arch === 'thermal-heating-vessel'
                              ? 0
                              : arch === 'thermometer'
                                ? 25
                                : 100,
                          canBeWeighedOnBalance: true,
                          presets: [],
                        };
                      }
                      if (arch === 'spring-dynamometer') {
                        return {
                          stateKey: 'springExtensionN',
                          label: 'Lực kéo lò xo F',
                          unit: 'N',
                          min: 0,
                          max: 5,
                          step: 0.1,
                          defaultValue: 1.5,
                          canBeWeighedOnBalance: true,
                          presets: [],
                        };
                      }
                      if (arch === 'vernier-caliper') {
                        return {
                          stateKey: 'jawOpeningMm',
                          label: 'Độ mở hàm kẹp d',
                          unit: 'mm',
                          min: 0,
                          max: 150,
                          step: 0.5,
                          defaultValue: 25,
                          canBeWeighedOnBalance: true,
                          presets: [],
                        };
                      }
                      if (arch === 'electronic-balance') {
                        return {
                          stateKey: 'measuredMassG',
                          label: 'Khối lượng đặt trên đĩa cân m',
                          unit: 'g',
                          min: 0,
                          max: 500,
                          step: 0.5,
                          defaultValue: 0,
                          canBeWeighedOnBalance: false,
                          presets: [],
                        };
                      }
                      if (arch === 'digital-multimeter') {
                        const mMode = activeInstance.instanceState.multimeterMode ?? 'V';
                        return {
                          stateKey: 'multimeterValue',
                          label: `Giá trị đồng hồ đo (${mMode})`,
                          unit: mMode,
                          min: 0,
                          max: 20,
                          step: 0.1,
                          defaultValue: 12,
                          canBeWeighedOnBalance: true,
                          presets: [],
                        };
                      }
                      if (arch === 'galvanometer' || arch === 'induction-coil-led') {
                        return {
                          stateKey: 'galvanometerDeflection',
                          label: 'Độ lệch dòng điện cảm ứng I',
                          unit: 'mA',
                          min: -1,
                          max: 1,
                          step: 0.05,
                          defaultValue: 0,
                          canBeWeighedOnBalance: true,
                          presets: [],
                        };
                      }
                      if (arch === 'semicircular-slab') {
                        return {
                          stateKey: 'incidentAngleDeg',
                          label: 'Góc tới tia sáng i',
                          unit: '°',
                          min: 0,
                          max: 80,
                          step: 1,
                          defaultValue: 30,
                          canBeWeighedOnBalance: true,
                          presets: [],
                        };
                      }
                      return null;
                    })();

                    if (!ctrl) return null;

                    const curValRaw =
                      activeInstance.instanceState[ctrl.stateKey];
                    const curVal =
                      typeof curValRaw === 'number' && Number.isFinite(curValRaw)
                        ? curValRaw
                        : ctrl.defaultValue;
                    const decimals =
                      ctrl.step < 0.1 ? 2 : ctrl.step < 1 ? 1 : 0;

                    const liveSceneObj = instanceObjectsRef.current.get(
                      activeInstance.instanceId,
                    );
                    const hasFlameGroupNode = Boolean(
                      liveSceneObj?.getObjectByName('alcohol_flame_group') ||
                        liveSceneObj?.getObjectByName('flame_group') ||
                        arch === 'porcelain-dish' ||
                        arch === 'distillation-flask' ||
                        (ctrl.stateKey === 'temperatureC' && ctrl.max >= 200) ||
                        activeAsset.name.vi.toLowerCase().includes('đèn cồn') ||
                        activeAsset.name.vi.toLowerCase().includes('den con'),
                    );
                    const heatedTubeNode = liveSceneObj?.getObjectByName(
                      'heated_test_tube_group',
                    );
                    const hasHeatedTubeNode = Boolean(heatedTubeNode);
                    const isHeatedTubeVisible =
                      activeInstance.instanceState.showHeatedTestTube ??
                      Boolean(heatedTubeNode?.visible);

                    const isCurrentlyActive = hasFlameGroupNode
                      ? activeInstance.instanceState.isHeating !== false &&
                        Math.abs(curVal - ctrl.min) > 0.02
                      : Math.abs(curVal - ctrl.min) > 0.02;

                    const milestoneRatios = [0, 0.25, 0.5, 0.75, 1];

                    return (
                      <div className="w-full rounded-[10px] bg-slate-950/75 border border-[#38BDF8]/65 p-2.5 space-y-2 shadow-inner">
                        {/* Hàng 1: Nhãn điều khiển + Nút Bật/Tắt ngọn lửa đèn cồn / Đặt ống nghiệm + Màn hình số Digital */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12px] font-extrabold text-[#7DD3FC]">
                              🎛️ Điều khiển 3D ({ctrl.label}):
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            {hasHeatedTubeNode && (
                              <button
                                type="button"
                                onClick={() => {
                                  const nextTubeVis = !isHeatedTubeVisible;
                                  if (heatedTubeNode) {
                                    heatedTubeNode.visible = nextTubeVis;
                                    requestRenderRef.current();
                                  }
                                  onUpdateInstanceState?.(
                                    activeInstance.instanceId,
                                    {
                                      showHeatedTestTube: nextTubeVis,
                                    },
                                    nextTubeVis
                                      ? `${activeAsset.name.vi}: Đã đặt ống nghiệm lên trên ngọn lửa để đun nóng`
                                      : `${activeAsset.name.vi}: Đã lấy ống nghiệm ra khỏi ngọn lửa`,
                                  );
                                }}
                                className={`px-2.5 py-1 rounded-[7px] text-[11.5px] font-extrabold border transition-colors cursor-pointer ${
                                  isHeatedTubeVisible
                                    ? 'bg-[#0284C7] border-[#38BDF8] text-white'
                                    : 'bg-slate-800 hover:bg-slate-700 border-slate-500 text-slate-200'
                                }`}
                              >
                                {isHeatedTubeVisible
                                  ? '🧪 Đang đặt ống nghiệm (Bấm để bỏ ra)'
                                  : '🧪 Đặt ống nghiệm lên ngọn lửa'}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                const targetDefault =
                                  Math.abs(ctrl.defaultValue - ctrl.min) > 0.02
                                    ? ctrl.defaultValue
                                    : ctrl.max;
                                const nextVal = isCurrentlyActive
                                  ? ctrl.min
                                  : targetDefault;
                                const nextHeating = !isCurrentlyActive;
                                onUpdateInstanceState?.(
                                  activeInstance.instanceId,
                                  {
                                    [ctrl.stateKey]: nextVal,
                                    ...(ctrl.stateKey === 'liquidLevelMl'
                                      ? { baseLiquidLevelMl: nextVal }
                                      : {}),
                                    ...(hasFlameGroupNode
                                      ? { isHeating: nextHeating }
                                      : { isPoweredOn: nextHeating }),
                                  },
                                  hasFlameGroupNode
                                    ? nextHeating
                                      ? `${activeAsset.name.vi}: Đã mở nắp chụp & châm lửa đốt (${nextVal} ${ctrl.unit})`
                                      : `${activeAsset.name.vi}: Đã đậy nắp chụp & tắt ngọn lửa`
                                    : `${activeAsset.name.vi}: ${nextVal} ${ctrl.unit}`,
                                );
                              }}
                              className={`px-2.5 py-1 rounded-[7px] text-[11.5px] font-extrabold border transition-colors cursor-pointer ${
                                isCurrentlyActive
                                  ? 'bg-[#EA580C] hover:bg-[#C2410C] border-[#FB923C] text-white'
                                  : 'bg-slate-800 hover:bg-slate-700 border-slate-500 text-slate-200'
                              }`}
                            >
                              {hasFlameGroupNode
                                ? isCurrentlyActive
                                  ? '🔥 Đang cháy (Bấm để Đậy nắp / Tắt lửa)'
                                  : '🔥 Đang tắt (Bấm để Châm lửa đốt)'
                                : isCurrentlyActive
                                  ? '⚡ Đang kích hoạt (Bấm đưa về 0)'
                                  : '⚡ Kích hoạt trạng thái mẫu'}
                            </button>

                            <span
                              className="px-2.5 py-1 rounded-[7px] bg-[#06281E] border border-[#10B981] font-mono text-[13px] font-black text-[#34D399] tabular-nums shadow-xs"
                              title="Màn hình số hiển thị kết quả đo trực tiếp"
                            >
                              {curVal.toFixed(decimals)} {ctrl.unit}
                            </span>
                          </div>
                        </div>

                        {/* Hàng 2: Thanh trượt thay đổi thông số trực tiếp + Các nút mốc đo nhanh (0% - 25% - 50% - 75% - 100%) */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <input
                            type="range"
                            min={ctrl.min}
                            max={ctrl.max}
                            step={ctrl.step}
                            value={curVal}
                            onChange={(e) => {
                              const nextVal = parseFloat(e.target.value);
                              onUpdateInstanceState?.(
                                activeInstance.instanceId,
                                {
                                  [ctrl.stateKey]: nextVal,
                                  ...(ctrl.stateKey === 'liquidLevelMl'
                                    ? { baseLiquidLevelMl: nextVal }
                                    : {}),
                                  ...(hasFlameGroupNode
                                    ? { isHeating: nextVal > ctrl.min + 0.5 }
                                    : {}),
                                },
                              );
                            }}
                            className="flex-1 min-w-[140px] accent-[#00BCEB] cursor-pointer"
                            title={`Kéo thanh trượt để thay đổi ${ctrl.label} trực tiếp trên mô hình 3D`}
                          />

                          <div className="flex flex-wrap items-center gap-1 shrink-0">
                            {milestoneRatios.map((ratio) => {
                              const val = Number(
                                (
                                  ctrl.min +
                                  ratio * (ctrl.max - ctrl.min)
                                ).toFixed(decimals),
                              );
                              const isSelectedMilestone =
                                Math.abs(curVal - val) <=
                                Math.max(0.02, ctrl.step * 0.45);
                              return (
                                <button
                                  key={ratio}
                                  type="button"
                                  onClick={() =>
                                    onUpdateInstanceState?.(
                                      activeInstance.instanceId,
                                      {
                                        [ctrl.stateKey]: val,
                                        ...(ctrl.stateKey === 'liquidLevelMl'
                                          ? { baseLiquidLevelMl: val }
                                          : {}),
                                        ...(hasFlameGroupNode
                                          ? { isHeating: val > ctrl.min + 0.5 }
                                          : {}),
                                      },
                                    )
                                  }
                                  className={`px-2 py-0.5 rounded-[6px] border font-mono text-[11px] font-extrabold cursor-pointer transition-colors ${
                                    isSelectedMilestone
                                      ? 'bg-[#1E6BFF] border-sky-300 text-white'
                                      : 'bg-slate-900/80 hover:bg-slate-800 border-white/25 text-slate-200'
                                  }`}
                                >
                                  {val} {ctrl.unit}
                                </button>
                              );
                            })}

                            {ctrl.canBeWeighedOnBalance !== false &&
                              arch !== 'electronic-balance' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onQuickLabAction(
                                      'weigh-selected',
                                      activeInstance.instanceId,
                                    )
                                  }
                                  className="px-2 py-0.5 rounded-[6px] bg-slate-900/75 hover:bg-emerald-950/80 border border-emerald-400/60 text-[#5EEAD4] font-mono text-[11px] font-bold cursor-pointer transition-colors"
                                  title="Đặt dụng cụ lên Cân điện tử"
                                >
                                  →⚖️{' '}
                                  {activeAsset.scientificProperties.referenceMass
                                    ?.value ?? 100}{' '}
                                  g
                                </button>
                              )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {!htmlEquipmentModuleRegistry.getModule(
                    activeAsset.assetId,
                  ) &&
                    activeAsset.geometry.proceduralArchetype ===
                      'digital-multimeter' && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            onQuickLabAction(
                              'multimeter-mode-v',
                              activeInstance.instanceId,
                            )
                          }
                          className="px-2.5 py-1 rounded-[7px] bg-[#1E6BFF]/70 hover:bg-[#1E6BFF]/90 border border-white/25 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                        >
                          U = 12.00 V
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onQuickLabAction(
                              'multimeter-mode-a',
                              activeInstance.instanceId,
                            )
                          }
                          className="px-2.5 py-1 rounded-[7px] bg-sky-600/70 hover:bg-sky-600/90 border border-white/25 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                        >
                          I = 0.75 A
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onQuickLabAction(
                              'multimeter-mode-ohm',
                              activeInstance.instanceId,
                            )
                          }
                          className="px-2.5 py-1 rounded-[7px] bg-slate-900/45 hover:bg-slate-900/70 border border-emerald-400/60 text-[#5EEAD4] font-mono text-[12px] font-bold cursor-pointer transition-colors"
                        >
                          R = 16.0 Ω
                        </button>
                      </>
                    )}

                  {(activeAsset.geometry.proceduralArchetype ===
                    'porcelain-dish' ||
                    activeAsset.geometry.proceduralArchetype ===
                      'distillation-flask' ||
                    activeAsset.geometry.proceduralArchetype ===
                      'alcohol-burner') && (
                    <button
                      type="button"
                      onClick={() =>
                        onQuickLabAction(
                          'toggle-burner-flame',
                          activeInstance.instanceId,
                        )
                      }
                      className="px-2.5 py-1 rounded-[7px] bg-orange-600/75 hover:bg-orange-600 border border-white/25 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                    >
                      {isDetailedGuideOn
                        ? activeInstance.instanceState.isHeating === false
                          ? '🔥 Châm lửa Đèn cồn'
                          : '🧯 Đậy nắp dập tắt lửa'
                        : activeInstance.instanceState.isHeating === false
                          ? '🔥 ON (°C)'
                          : '🔥 OFF'}
                    </button>
                  )}

                  {activeAsset.geometry.proceduralArchetype ===
                    'ice-cubes-tray' && (
                    <>
                      {(activeInstance.instanceState.iceMassG ?? 100) > 0.5 && (
                        <button
                          type="button"
                          onClick={() =>
                            onQuickLabAction?.(
                              'pour-ice-to-vessel',
                              activeInstance.instanceId,
                            )
                          }
                          className="px-2.5 py-1 rounded-[7px] bg-sky-600/85 hover:bg-sky-500 border border-sky-300/50 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                        >
                          🧊 Cho đá vào Bình chịu nhiệt
                        </button>
                      )}
                      {(activeInstance.instanceState.iceMassG ?? 100) < 99 && (
                        <button
                          type="button"
                          onClick={() =>
                            onQuickLabAction?.(
                              'refill-ice-tray',
                              activeInstance.instanceId,
                            )
                          }
                          className="px-2.5 py-1 rounded-[7px] bg-cyan-700/85 hover:bg-cyan-600 border border-cyan-300/50 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                        >
                          ❄️ Lấy đầy 100g đá viên
                        </button>
                      )}
                    </>
                  )}

                  {(activeAsset.geometry.proceduralArchetype ===
                    'thermal-heating-vessel' ||
                    activeAsset.geometry.proceduralArchetype ===
                      'beaker-250') && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateInstanceStateRef.current?.(
                            activeInstance.instanceId,
                            {
                              iceMassG:
                                (activeInstance.instanceState.iceMassG ?? 0) +
                                100,
                              temperatureC: -4.0,
                              thermalPhase: 'subzero-ice',
                            },
                          );
                          labSoundEngine.play('dock-hover-snap', 0.85);
                          onNotify(
                            `🧊 Đã bỏ +100g Nước đá viên (-4.0 °C) vào ${activeAsset.name.vi}!`,
                            'info',
                          );
                        }}
                        className="px-2.5 py-1 rounded-[7px] bg-sky-600/80 hover:bg-sky-500 border border-sky-300/40 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                      >
                        🧊 +100g Nước đá (-4°C)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateInstanceStateRef.current?.(
                            activeInstance.instanceId,
                            {
                              iceMassG: 0,
                              temperatureC: 100.0,
                              thermalPhase: 'boiling-100c',
                              liquidLevelMl: 120,
                            },
                          );
                          labSoundEngine.play('burner-ignite', 0.85);
                          onNotify(
                            `💨 Đã chuyển ${activeAsset.name.vi} sang trạng thái Nước sôi 100.0 °C!`,
                            'warning',
                          );
                        }}
                        className="px-2.5 py-1 rounded-[7px] bg-rose-600/80 hover:bg-rose-500 border border-rose-300/40 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                      >
                        💨 Sôi 100°C
                      </button>
                    </>
                  )}

                  {activeAsset.geometry.proceduralArchetype ===
                    'pascal-hydraulic-press' &&
                    (() => {
                      const curN1 =
                        activeInstance.instanceState.weightsPiston1 ?? 0;
                      const curN2 =
                        activeInstance.instanceState.weightsPiston2 ?? 0;
                      const m = computePascalSimulationMetrics(curN1, curN2);
                      const setWeights = (
                        nextN1: number,
                        nextN2: number,
                        note?: string,
                      ) => {
                        const c1 = Math.max(0, Math.min(8, nextN1));
                        const c2 = Math.max(0, Math.min(8 - c1, nextN2));
                        onUpdateInstanceStateRef.current?.(
                          activeInstance.instanceId,
                          {
                            weightsPiston1: c1,
                            weightsPiston2: c2,
                          },
                        );
                        labSoundEngine.play('dock-hover-snap', 0.85);
                        if (note) {
                          onNotify(note, 'info');
                        }
                      };
                      return (
                        <div className="flex flex-wrap items-center gap-1.5 w-full mt-1 pt-1.5 border-t border-white/15">
                          {/* Bộ nút tăng/giảm số quả nặng n₁ trên Nhánh (1) S₁ = 20 cm² */}
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-[7px] bg-amber-500/20 border border-amber-400/50">
                            <span className="text-[11px] font-bold text-amber-300">
                              Pit-tông (1) S₁=2·S₂:
                            </span>
                            <button
                              type="button"
                              onClick={() => setWeights(curN1 - 1, curN2)}
                              disabled={curN1 <= 0}
                              className="w-5 h-5 rounded bg-slate-900/80 hover:bg-slate-800 disabled:opacity-40 text-amber-200 font-mono text-xs font-extrabold cursor-pointer"
                            >
                              -
                            </button>
                            <span className="font-mono text-xs font-extrabold text-white px-1">
                              n₁={m.n1} ({m.f1N.toFixed(0)}N)
                            </span>
                            <button
                              type="button"
                              onClick={() => setWeights(curN1 + 1, curN2)}
                              disabled={curN1 + curN2 >= 8}
                              className="w-5 h-5 rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-mono text-xs font-extrabold cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          {/* Bộ nút tăng/giảm số quả nặng n₂ trên Nhánh (2) S₂ = 10 cm² */}
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-[7px] bg-emerald-500/20 border border-emerald-400/50">
                            <span className="text-[11px] font-bold text-emerald-300">
                              Pit-tông (2) S₂:
                            </span>
                            <button
                              type="button"
                              onClick={() => setWeights(curN1, curN2 - 1)}
                              disabled={curN2 <= 0}
                              className="w-5 h-5 rounded bg-slate-900/80 hover:bg-slate-800 disabled:opacity-40 text-emerald-200 font-mono text-xs font-extrabold cursor-pointer"
                            >
                              -
                            </button>
                            <span className="font-mono text-xs font-extrabold text-white px-1">
                              n₂={m.n2} ({m.f2N.toFixed(0)}N)
                            </span>
                            <button
                              type="button"
                              onClick={() => setWeights(curN1, curN2 + 1)}
                              disabled={curN1 + curN2 >= 8}
                              className="w-5 h-5 rounded bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-mono text-xs font-extrabold cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          {/* Các kịch bản chuẩn SGK Hình 16.3 */}
                          <button
                            type="button"
                            onClick={() =>
                              setWeights(
                                4,
                                0,
                                'TH1 · Bước 1 (SGK Hình 16.3): Đặt 4 quả nặng bên nhánh lớn (1) S₁ → Pit-tông (1) dịch xuống Δh₁ = -1.6 cm, Pit-tông (2) dâng lên Δh₂ = +3.2 cm!',
                              )
                            }
                            className="px-2 py-1 rounded-[7px] bg-slate-900/65 hover:bg-slate-800 border border-amber-400/50 text-amber-200 font-mono text-[11px] font-bold cursor-pointer"
                          >
                            TH1·B1 (4 - 0)
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setWeights(
                                4,
                                2,
                                'TH1 · Bước 2 (Cân bằng SGK Hình 16.3): n₁ = 4 (4N), n₂ = 2 (2N) → p₁ = p₂ = 0.20 N/cm² → Hai pit-tông trở về cùng vạch chuẩn h₀ (F₂/F₁ = S₂/S₁ = 1/2)!',
                              )
                            }
                            className="px-2 py-1 rounded-[7px] bg-emerald-600/80 hover:bg-emerald-500 border border-emerald-300/60 text-white font-mono text-[11px] font-bold cursor-pointer"
                          >
                            ✓ TH1·B2 Cân bằng (4 - 2)
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setWeights(
                                2,
                                1,
                                'TH2 · Bước 2 (Cân bằng SGK Hình 16.3): n₁ = 2 (2N), n₂ = 1 (1N) → p₁ = p₂ = 0.10 N/cm² → Cân bằng tại vạch chuẩn h₀!',
                              )
                            }
                            className="px-2 py-1 rounded-[7px] bg-sky-600/80 hover:bg-sky-500 border border-sky-300/60 text-white font-mono text-[11px] font-bold cursor-pointer"
                          >
                            ✓ TH2·B2 Cân bằng (2 - 1)
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setWeights(
                                0,
                                0,
                                'Đã tháo toàn bộ quả nặng về khay (n₁ = 0, n₂ = 0 — Trạng thái cân bằng ban đầu h₀).',
                              )
                            }
                            className="px-2 py-1 rounded-[7px] bg-slate-800 hover:bg-slate-700 border border-white/20 text-slate-200 font-mono text-[11px] font-bold cursor-pointer"
                          >
                            Về h₀ (0 - 0)
                          </button>
                        </div>
                      );
                    })()}

                  {activeAsset.geometry.proceduralArchetype ===
                    'color-filter-dispersion' && (
                    <ColorFilterDispersionControls
                      instance={activeInstance}
                      onUpdateState={(id, patch) =>
                        onUpdateInstanceStateRef.current?.(id, patch)
                      }
                      onNotify={onNotify}
                    />
                  )}

                  {activeAsset.geometry.proceduralArchetype ===
                    'oxygen-air-volume' && (
                    <OxygenAirVolumeControls
                      instance={activeInstance}
                      onUpdateState={(id, patch) =>
                        onUpdateInstanceStateRef.current?.(id, patch)
                      }
                      onNotify={onNotify}
                    />
                  )}

                  {activeAsset.geometry.proceduralArchetype ===
                    'reagent-bottle-naoh-400' &&
                    (() => {
                      const volMl =
                        activeInstance.instanceState.liquidLevelMl ?? 300;
                      const capOpen = Boolean(
                        activeInstance.instanceState.capOpen,
                      );
                      const tilted = Boolean(
                        activeInstance.instanceState.bottleTilted,
                      );
                      const rxnMode =
                        activeInstance.instanceState.chemicalReactionMode ||
                        'none';
                      const updateNaOH = (
                        patch: Partial<SceneInstance['instanceState']>,
                        msg?: string,
                      ) => {
                        onUpdateInstanceStateRef.current?.(
                          activeInstance.instanceId,
                          patch,
                        );
                        if (msg) onNotify(msg, 'info');
                      };
                      const naohReactions: Array<{
                        id: string;
                        label: string;
                        note: string;
                      }> = [
                        {
                          id: 'phenol',
                          label: '🌸 +Phenolphtalein',
                          note: '1. Chất chỉ thị Phenolphtalein: Dung dịch NaOH 0,1M (pH = 13,0) làm phenolphtalein từ không màu chuyển sang màu hồng cánh sen!',
                        },
                        {
                          id: 'litmus',
                          label: '📘 +Quỳ tím',
                          note: '1. Chất chỉ thị Quỳ tím: NaOH → Na⁺ + OH⁻ làm giấy quỳ tím chuyển sang màu xanh dương!',
                        },
                        {
                          id: 'acid',
                          label: '🧪 +HCl / H₂SO₄',
                          note: '2. Phản ứng trung hòa Axit: NaOH + HCl → NaCl + H₂O • 2NaOH + H₂SO₄ → Na₂SO₄ + 2H₂O (pH về 7,0).',
                        },
                        {
                          id: 'acid_oxide',
                          label: '🫧 +CO₂ / SO₂',
                          note: '3. Tác dụng với Oxit Axit: 2NaOH + CO₂ → Na₂CO₃ + H₂O (hoặc NaHCO₃ tùy tỉ lệ mol T = nNaOH/nCO₂).',
                        },
                        {
                          id: 'salt_cu',
                          label: '💧 +Cu(NO₃)₂',
                          note: '4. Tác dụng với dung dịch muối: 2NaOH + Cu(NO₃)₂ → Cu(OH)₂↓ (kết tủa keo xanh lam) + 2NaNO₃!',
                        },
                        {
                          id: 'nonmetal_cl2',
                          label: '🟢 +Khí Cl₂ (Gia-ven)',
                          note: '5. Tác dụng với Phi kim Cl₂: Cl₂ + 2NaOH → NaCl + NaClO + H₂O (Nước Gia-ven màu vàng lục nhạt).',
                        },
                        {
                          id: 'ampho_al',
                          label: '✨ +Nhôm Al (H₂↑)',
                          note: '6. Hòa tan kim loại lưỡng tính Al: 2Al + 2NaOH + 2H₂O → 2NaAlO₂ + 3H₂↑ (sủi bọt khí Hiđro).',
                        },
                        {
                          id: 'ampho_aloh3',
                          label: '⚪ +Kết tủa Al(OH)₃',
                          note: '6. Hòa tan hiđroxit lưỡng tính: Al(OH)₃ + NaOH → NaAlO₂ + 2H₂O (kết tủa keo trắng tan dần).',
                        },
                      ];
                      return (
                        <div className="flex flex-wrap items-center gap-1.5 w-full mt-1 pt-1.5 border-t border-white/15">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[7px] bg-sky-500/20 border border-sky-400/50">
                            <span className="text-[11px] font-bold text-sky-200">
                              Mức NaOH: {volMl.toFixed(0)} ml
                            </span>
                            <input
                              type="range"
                              min={0}
                              max={400}
                              step={5}
                              value={volMl}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                updateNaOH({
                                  liquidLevelMl: v,
                                  baseLiquidLevelMl: v,
                                });
                              }}
                              className="w-20 accent-sky-400 cursor-pointer"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateNaOH(
                                  {
                                    liquidLevelMl: 300,
                                    baseLiquidLevelMl: 300,
                                  },
                                  'Đã đặt mức dung dịch NaOH 0,1M chuẩn 300 ml (n = 0,030 mol • m = 1,20 g).',
                                )
                              }
                              className="px-1.5 py-0.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-[10px] font-extrabold cursor-pointer"
                            >
                              300ml
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              updateNaOH(
                                { capOpen: !capOpen },
                                !capOpen
                                  ? 'Đã vặn mở nắp nhựa xanh PP GL45 của lọ NaOH 0,1M.'
                                  : 'Đã đậy kín nắp nhựa xanh PP GL45 tránh hấp thụ CO₂ không khí.',
                              )
                            }
                            className={`px-2 py-1 rounded-[7px] border font-mono text-[11px] font-bold cursor-pointer ${
                              capOpen
                                ? 'bg-blue-500 text-white border-blue-300'
                                : 'bg-slate-900/70 hover:bg-slate-800 text-blue-200 border-blue-400/40'
                            }`}
                          >
                            {capOpen ? '🔵 Đóng nắp xanh' : '🔵 Mở nắp xanh'}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              updateNaOH({ bottleTilted: !tilted })
                            }
                            className={`px-2 py-1 rounded-[7px] border font-mono text-[11px] font-bold cursor-pointer ${
                              tilted
                                ? 'bg-amber-500 text-slate-950 border-amber-300'
                                : 'bg-slate-900/70 hover:bg-slate-800 text-slate-200 border-white/20'
                            }`}
                          >
                            {tilted ? '↺ Đặt thẳng lọ' : '↗ Nghiêng lọ'}
                          </button>

                          {naohReactions.map((r) => (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() =>
                                updateNaOH(
                                  {
                                    chemicalReactionMode:
                                      rxnMode === r.id ? 'none' : r.id,
                                  },
                                  r.note,
                                )
                              }
                              className={`px-2 py-1 rounded-[7px] border font-mono text-[11px] font-bold cursor-pointer transition-colors ${
                                rxnMode === r.id
                                  ? 'bg-sky-500 text-slate-950 border-white shadow-sm'
                                  : 'bg-slate-900/65 hover:bg-slate-800 text-sky-200 border-sky-400/40'
                              }`}
                            >
                              {r.label}
                            </button>
                          ))}
                        </div>
                      );
                    })()}

                  {activeAsset.geometry.proceduralArchetype ===
                    'copper-wire-ring-3g' &&
                    (() => {
                      const mode =
                        activeInstance.instanceState.chemicalReactionMode ||
                        'pure';
                      const progress =
                        activeInstance.instanceState.reactionProgress ?? 1.0;
                      const showScale = Boolean(
                        activeInstance.instanceState.showIntegratedBalance,
                      );
                      const info = computeCopperReactionInfo(mode, progress);
                      const updateCu = (
                        patch: Partial<SceneInstance['instanceState']>,
                        msg?: string,
                      ) => {
                        onUpdateInstanceStateRef.current?.(
                          activeInstance.instanceId,
                          patch,
                        );
                        if (msg) onNotify(msg, 'info');
                      };
                      const cuModes: Array<{
                        id: string;
                        label: string;
                      }> = [
                        { id: 'pure', label: '↺ Đồng sạch (3,00g)' },
                        { id: 'o2', label: '🔥 +O₂ (CuO đen 3,75g)' },
                        { id: 'cl2', label: '🧪 +Cl₂ / S (t°)' },
                        { id: 'hcl_o2', label: '💧 +HCl loãng + O₂' },
                        { id: 'hno3_conc', label: '♨️ +HNO₃ đặc (NO₂↑)' },
                        { id: 'hno3_dil', label: '🫧 +HNO₃ loãng (NO→NO₂)' },
                        {
                          id: 'agno3',
                          label: '✨ +300ml AgNO₃ 0,1M (Ag↓ 5,28g)',
                        },
                      ];
                      return (
                        <div className="flex flex-wrap items-center gap-1.5 w-full mt-1 pt-1.5 border-t border-white/15">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[7px] bg-orange-500/20 border border-orange-400/50">
                            <span className="text-[11px] font-bold text-orange-200">
                              Tiến trình: {Math.round(progress * 100)}% (m=
                              {info.currentMassG.toFixed(2)}g)
                            </span>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={1}
                              value={Math.round(progress * 100)}
                              onChange={(e) =>
                                updateCu({
                                  reactionProgress:
                                    Number(e.target.value) / 100,
                                })
                              }
                              className="w-20 accent-orange-400 cursor-pointer"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              updateCu(
                                { showIntegratedBalance: !showScale },
                                !showScale
                                  ? `Đã bật Cân điện tử dưới vòng đồng: m = ${info.currentMassG.toFixed(2)} g.`
                                  : 'Đã ẩn cân điện tử tích hợp dưới vòng dây đồng.',
                              )
                            }
                            className={`px-2 py-1 rounded-[7px] border font-mono text-[11px] font-bold cursor-pointer ${
                              showScale
                                ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                                : 'bg-slate-900/70 hover:bg-slate-800 text-emerald-300 border-emerald-400/40'
                            }`}
                          >
                            ⚖️ Cân ({info.currentMassG.toFixed(2)}g)
                          </button>

                          {cuModes.map((mItem) => (
                            <button
                              key={mItem.id}
                              type="button"
                              onClick={() => {
                                const nextInfo = computeCopperReactionInfo(
                                  mItem.id,
                                  1.0,
                                );
                                updateCu(
                                  {
                                    chemicalReactionMode: mItem.id,
                                    reactionProgress: 1.0,
                                  },
                                  `${nextInfo.equationText} — ${nextInfo.detailText}`,
                                );
                              }}
                              className={`px-2 py-1 rounded-[7px] border font-mono text-[11px] font-bold cursor-pointer transition-colors ${
                                mode === mItem.id
                                  ? 'bg-orange-500 text-slate-950 border-white shadow-sm'
                                  : 'bg-slate-900/65 hover:bg-slate-800 text-orange-200 border-orange-400/40'
                              }`}
                            >
                              {mItem.label}
                            </button>
                          ))}
                        </div>
                      );
                    })()}

                  {activeAsset.geometry.proceduralArchetype ===
                    'reagent-bottle-agno3-400' &&
                    (() => {
                      const volMl =
                        activeInstance.instanceState.liquidLevelMl ?? 300;
                      const capOpen = Boolean(
                        activeInstance.instanceState.capOpen,
                      );
                      const tilted = Boolean(
                        activeInstance.instanceState.bottleTilted,
                      );
                      const glassOp =
                        activeInstance.instanceState.glassOpacity ?? 0.58;
                      const isXray = glassOp < 0.35;
                      const rxnMode =
                        activeInstance.instanceState.chemicalReactionMode ||
                        'none';
                      const updateAgNO3 = (
                        patch: Partial<SceneInstance['instanceState']>,
                        msg?: string,
                      ) => {
                        onUpdateInstanceStateRef.current?.(
                          activeInstance.instanceId,
                          patch,
                        );
                        if (msg) onNotify(msg, 'info');
                      };
                      const agReactions: Array<{
                        id: string;
                        label: string;
                        note: string;
                      }> = [
                        {
                          id: 'nacl',
                          label: '⚪ +dd NaCl (AgCl↓)',
                          note: 'AgNO₃ + NaCl → AgCl↓ (kết tủa trắng vón cục) + NaNO₃. Không tan trong HNO₃ nhưng tan trong NH₃.',
                        },
                        {
                          id: 'nabr',
                          label: '🟡 +dd NaBr (AgBr↓)',
                          note: 'AgNO₃ + NaBr → AgBr↓ (kết tủa vàng nhạt) + NaNO₃.',
                        },
                        {
                          id: 'nai',
                          label: '🟠 +dd NaI (AgI↓)',
                          note: 'AgNO₃ + NaI → AgI↓ (kết tủa vàng đậm) + NaNO₃.',
                        },
                        {
                          id: 'cu',
                          label: '✨ +Dây đồng Cu (Ag↓)',
                          note: 'Cu + 2AgNO₃ → Cu(NO₃)₂ (dd xanh lam) + 2Ag↓ (tinh thể bạc xám trắng bám quanh dây đồng).',
                        },
                        {
                          id: 'naoh',
                          label: '⚫ +dd NaOH (Ag₂O↓)',
                          note: '2AgNO₃ + 2NaOH → Ag₂O↓ (nâu đen) + H₂O + 2NaNO₃ (do AgOH không bền tự phân hủy).',
                        },
                        {
                          id: 'light',
                          label: '☀️ +Chiếu tia UV',
                          note: '2AgNO₃ —(ánh sáng)→ 2Ag↓ (đen) + 2NO₂↑ + O₂↑. Đây là lý do phải bảo quản AgNO₃ trong lọ thủy tinh nâu!',
                        },
                      ];
                      return (
                        <div className="flex flex-wrap items-center gap-1.5 w-full mt-1 pt-1.5 border-t border-white/15">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[7px] bg-amber-500/20 border border-amber-400/50">
                            <span className="text-[11px] font-bold text-amber-200">
                              Mức AgNO₃: {volMl.toFixed(0)} ml
                            </span>
                            <input
                              type="range"
                              min={0}
                              max={400}
                              step={5}
                              value={volMl}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                updateAgNO3({
                                  liquidLevelMl: v,
                                  baseLiquidLevelMl: v,
                                });
                              }}
                              className="w-20 accent-amber-400 cursor-pointer"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateAgNO3(
                                  {
                                    liquidLevelMl: 300,
                                    baseLiquidLevelMl: 300,
                                  },
                                  'Đã đặt mức dung dịch AgNO₃ 0,1M chuẩn 300 ml (n = 0,030 mol • m ≈ 5,10 g).',
                                )
                              }
                              className="px-1.5 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-[10px] font-extrabold cursor-pointer"
                            >
                              300ml
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              updateAgNO3(
                                { capOpen: !capOpen },
                                !capOpen
                                  ? 'Đã mở nắp nhựa xanh GL45 của lọ thủy tinh nâu AgNO₃ 0,1M.'
                                  : 'Đã đóng kín nắp nhựa xanh GL45.',
                              )
                            }
                            className={`px-2 py-1 rounded-[7px] border font-mono text-[11px] font-bold cursor-pointer ${
                              capOpen
                                ? 'bg-blue-500 text-white border-blue-300'
                                : 'bg-slate-900/70 hover:bg-slate-800 text-blue-200 border-blue-400/40'
                            }`}
                          >
                            {capOpen ? '🔵 Đóng nắp xanh' : '🔵 Mở nắp xanh'}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              updateAgNO3(
                                { glassOpacity: isXray ? 0.58 : 0.22 },
                                !isXray
                                  ? 'Đã bật chế độ Nhìn xuyên (X-Ray) qua thành lọ thủy tinh nâu.'
                                  : 'Đã trở về độ trong suốt thành lọ thủy tinh nâu chuẩn phòng thí nghiệm.',
                              )
                            }
                            className={`px-2 py-1 rounded-[7px] border font-mono text-[11px] font-bold cursor-pointer ${
                              isXray
                                ? 'bg-cyan-500 text-slate-950 border-cyan-300'
                                : 'bg-slate-900/70 hover:bg-slate-800 text-cyan-200 border-cyan-400/40'
                            }`}
                          >
                            {isXray ? '🔍 Tắt X-Ray' : '🔍 Nhìn xuyên (X-Ray)'}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              updateAgNO3({ bottleTilted: !tilted })
                            }
                            className={`px-2 py-1 rounded-[7px] border font-mono text-[11px] font-bold cursor-pointer ${
                              tilted
                                ? 'bg-amber-500 text-slate-950 border-amber-300'
                                : 'bg-slate-900/70 hover:bg-slate-800 text-slate-200 border-white/20'
                            }`}
                          >
                            {tilted ? '↺ Đặt thẳng lọ' : '↗ Nghiêng lọ'}
                          </button>

                          {agReactions.map((r) => (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() =>
                                updateAgNO3(
                                  {
                                    chemicalReactionMode:
                                      rxnMode === r.id ? 'none' : r.id,
                                  },
                                  r.note,
                                )
                              }
                              className={`px-2 py-1 rounded-[7px] border font-mono text-[11px] font-bold cursor-pointer transition-colors ${
                                rxnMode === r.id
                                  ? 'bg-amber-500 text-slate-950 border-white shadow-sm'
                                  : 'bg-slate-900/65 hover:bg-slate-800 text-amber-200 border-amber-400/40'
                              }`}
                            >
                              {r.label}
                            </button>
                          ))}
                        </div>
                      );
                    })()}

                  {activeAsset.geometry.proceduralArchetype ===
                    'optical-microscope' && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          onQuickLabAction(
                            'microscope-10x',
                            activeInstance.instanceId,
                          )
                        }
                        className="px-2.5 py-1 rounded-[7px] bg-slate-900/45 hover:bg-slate-900/70 border border-white/25 text-slate-100 font-mono text-[12px] font-semibold cursor-pointer transition-colors"
                      >
                        🔬 10×
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onQuickLabAction(
                            'microscope-40x',
                            activeInstance.instanceId,
                          )
                        }
                        className="px-2.5 py-1 rounded-[7px] bg-[#1E6BFF]/70 hover:bg-[#1E6BFF]/90 border border-white/25 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                      >
                        🔬 40×
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onQuickLabAction(
                            'microscope-100x',
                            activeInstance.instanceId,
                          )
                        }
                        className="px-2.5 py-1 rounded-[7px] bg-sky-600/70 hover:bg-sky-600/90 border border-white/25 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                      >
                        🔬 100×
                      </button>
                    </>
                  )}

                  {activeAsset.geometry.proceduralArchetype ===
                    'thermometer' && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          onQuickLabAction(
                            'temp-room-25',
                            activeInstance.instanceId,
                          )
                        }
                        className="px-2.5 py-1 rounded-[7px] bg-slate-900/45 hover:bg-slate-900/70 border border-white/25 text-slate-100 font-mono text-[12px] font-semibold cursor-pointer transition-colors"
                      >
                        25.0 °C
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onQuickLabAction(
                            'temp-warm-78',
                            activeInstance.instanceId,
                          )
                        }
                        className="px-2.5 py-1 rounded-[7px] bg-orange-600/75 hover:bg-orange-600 border border-white/25 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                      >
                        78.5 °C
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onQuickLabAction(
                            'temp-boil-100',
                            activeInstance.instanceId,
                          )
                        }
                        className="px-2.5 py-1 rounded-[7px] bg-red-600/75 hover:bg-red-600 border border-white/25 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                      >
                        100.0 °C
                      </button>
                    </>
                  )}

                  {activeAsset.geometry.proceduralArchetype ===
                    'spring-dynamometer' && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          onQuickLabAction(
                            'dynamometer-weigh',
                            activeInstance.instanceId,
                          )
                        }
                        className="px-2.5 py-1 rounded-[7px] bg-[#1E6BFF]/70 hover:bg-[#1E6BFF]/90 border border-white/25 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                      >
                        {isDetailedGuideOn ? 'Móc vật đo trọng lượng P' : '🪝 +P (N)'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onQuickLabAction(
                            'dynamometer-zero',
                            activeInstance.instanceId,
                          )
                        }
                        className="px-2.5 py-1 rounded-[7px] bg-slate-900/45 hover:bg-slate-900/70 border border-emerald-400/60 text-[#5EEAD4] font-mono text-[12px] font-bold cursor-pointer transition-colors"
                      >
                        0.00 N
                      </button>
                    </>
                  )}

                  {activeAsset.geometry.proceduralArchetype ===
                    'vernier-caliper' && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          onQuickLabAction(
                            'caliper-measure',
                            activeInstance.instanceId,
                          )
                        }
                        className="px-2.5 py-1 rounded-[7px] bg-[#1E6BFF]/70 hover:bg-[#1E6BFF]/90 border border-white/25 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                      >
                        {isDetailedGuideOn ? 'Kẹp đo đường kính mẫu vật' : '📏 d (mm)'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onQuickLabAction(
                            'caliper-zero',
                            activeInstance.instanceId,
                          )
                        }
                        className="px-2.5 py-1 rounded-[7px] bg-slate-900/45 hover:bg-slate-900/70 border border-emerald-400/60 text-[#5EEAD4] font-mono text-[12px] font-bold cursor-pointer transition-colors"
                      >
                        0.0 mm
                      </button>
                    </>
                  )}

                  {activeAsset.geometry.proceduralArchetype ===
                    'separatory-funnel' && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          onQuickLabAction(
                            'funnel-extract',
                            activeInstance.instanceId,
                          )
                        }
                        className="px-2.5 py-1 rounded-[7px] bg-[#1E6BFF]/70 hover:bg-[#1E6BFF]/90 border border-white/25 text-white font-mono text-[12px] font-bold cursor-pointer transition-colors"
                      >
                        {isDetailedGuideOn
                          ? 'Mở khóa chiết lớp dưới (-30 ml)'
                          : '🫗 -30 ml'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onQuickLabAction(
                            'refill-water',
                            activeInstance.instanceId,
                          )
                        }
                        className="px-2.5 py-1 rounded-[7px] bg-slate-900/45 hover:bg-slate-900/70 border border-white/25 text-slate-100 font-mono text-[12px] font-semibold cursor-pointer transition-colors"
                      >
                        {isDetailedGuideOn ? 'Thêm hỗn hợp nước - dầu' : '+H₂O / Oil'}
                      </button>
                    </>
                  )}

                  {/* Hành động phụ chuẩn: Xoay 90° bằng ký hiệu */}
                  <button
                    type="button"
                    onClick={() =>
                      onQuickLabAction('rotate-90', activeInstance.instanceId)
                    }
                    className="px-2.5 py-1 rounded-[7px] bg-slate-900/45 hover:bg-slate-900/70 border border-white/25 text-slate-100 font-mono text-[12px] font-bold cursor-pointer transition-colors flex items-center gap-1"
                    title="Xoay dụng cụ 90° trên mặt bàn"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>{isDetailedGuideOn ? 'Xoay 90°' : '90°'}</span>
                  </button>
                </div>

                {/* STATE E: BẢNG CHI TIẾT THIẾT BỊ, HÌNH ẢNH SẮC NÉT + THÔNG SỐ ĐO LƯỜNG NỀN KÍNH MỜ XUYÊN THẤU */}
                {deviceSheetMode === 'detail' && (
                  <div className="px-3 pb-3 pt-2 border-t border-white/25 overflow-y-auto overscroll-contain space-y-2.5 text-[12px]">
                    {/* 1. Khung Hình ảnh sắc nét (KHÔNG làm mờ) + Thông số kỹ thuật trên nền kính mờ trong suốt cao */}
                    <div className="rounded-[10px] bg-slate-950/18 backdrop-blur-sm border border-white/30 p-2.5 space-y-2">
                      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/20">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#7DD3FC]">
                          Thông tin chi tiết thiết bị
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setDeviceSheetMode('compact');
                            equipmentImagePreviewController.hide('close');
                          }}
                          className="h-6 px-2 rounded-[6px] bg-[#DC2626] hover:bg-[#B91C1C] border border-[#F87171] text-white text-[11px] font-extrabold flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                          title="Đóng bảng thông tin chi tiết thiết bị"
                        >
                          <span>Đóng</span>
                          <X className="w-3.5 h-3.5 text-white stroke-[2.6]" />
                        </button>
                      </div>
                      <div className="flex items-start gap-3">
                        {/* Hình ảnh thiết bị sắc nét, không bị mờ */}
                        <div className="w-[76px] h-[76px] rounded-[9px] bg-white border-2 border-[#38BDF8] flex items-center justify-center shrink-0 shadow-md overflow-hidden">
                          {realPhotoSrc ? (
                            <img
                              src={realPhotoSrc}
                              alt={activeAsset.name.vi}
                              className="w-[74px] h-[74px] object-contain"
                            />
                          ) : (
                            <EquipmentThumbnailSvg
                              archetype={activeAsset.geometry.proceduralArchetype}
                              assetId={activeAsset.assetId}
                              className="w-[62px] h-[62px]"
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-[11px] font-mono font-extrabold text-[#7DD3FC] drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                              {activeAsset.assetId} · v{activeInstance.assetVersion}
                            </span>
                            <span className="text-[11px] font-mono font-bold text-amber-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                              {dimsMmText}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-0.5">
                            {activeAsset.scientificProperties.referenceMass && (
                              <div className="px-2 py-1 rounded-[7px] bg-slate-950/22 backdrop-blur-xs border border-white/25">
                                <div className="text-[10.5px] font-bold text-slate-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                                  Khối lượng chuẩn
                                </div>
                                <div className="font-mono font-extrabold text-[#5EEAD4] drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                                  {
                                    activeAsset.scientificProperties.referenceMass
                                      .value
                                  }{' '}
                                  {
                                    activeAsset.scientificProperties.referenceMass
                                      .unit
                                  }
                                </div>
                              </div>
                            )}
                            {(activeAsset.scientificProperties.capacity ||
                              activeAsset.measurementMetadata?.rangeMax) && (
                              <div className="px-2 py-1 rounded-[7px] bg-slate-950/22 backdrop-blur-xs border border-white/25">
                                <div className="text-[10.5px] font-bold text-slate-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                                  Giới hạn đo (GHĐ)
                                </div>
                                <div className="font-mono font-extrabold text-[#7DD3FC] drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                                  {
                                    (
                                      activeAsset.scientificProperties.capacity ||
                                      activeAsset.measurementMetadata?.rangeMax
                                    )?.value
                                  }{' '}
                                  {
                                    (
                                      activeAsset.scientificProperties.capacity ||
                                      activeAsset.measurementMetadata?.rangeMax
                                    )?.unit
                                  }
                                </div>
                              </div>
                            )}
                            {activeAsset.measurementMetadata?.leastCount && (
                              <div className="px-2 py-1 rounded-[7px] bg-slate-950/22 backdrop-blur-xs border border-white/25">
                                <div className="text-[10.5px] font-bold text-slate-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                                  Độ chia nhỏ nhất
                                </div>
                                <div className="font-mono font-extrabold text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                                  {activeAsset.measurementMetadata.leastCount.value}{' '}
                                  {activeAsset.measurementMetadata.leastCount.unit}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-[12px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] leading-snug pt-0.5">
                        {liveReadout.interactionHint}
                      </p>

                      <div className="pt-1 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            equipmentImagePreviewController.preview(
                              activeAsset.assetId,
                              'pinned',
                            )
                          }
                          className="flex-1 py-1.5 px-2.5 rounded-[7px] bg-amber-500/25 hover:bg-amber-500/45 border border-amber-300 text-white text-[12px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-200" />
                          <span>Ảnh thực tế 240×240</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onQuickLabAction(
                              'open-sgk-profile',
                              activeInstance.instanceId,
                            )
                          }
                          className="flex-1 py-1.5 px-2.5 rounded-[7px] bg-[#1E6BFF]/60 hover:bg-[#1E6BFF] border border-white/35 text-white text-[12px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Camera className="w-3.5 h-3.5 text-amber-200" />
                          <span>Hồ sơ SGK & 3D</span>
                        </button>
                      </div>
                    </div>

                    {/* 2. Khu vực Kỹ thuật / Quản trị Module (Nền kính mờ trong suốt cao) */}
                    <div className="rounded-[10px] bg-slate-950/18 backdrop-blur-sm border border-white/30 p-2.5 space-y-2">
                      <div className="text-[10.5px] font-extrabold uppercase tracking-wider text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                        Công cụ Kỹ thuật & Quản trị Thiết bị
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            onQuickLabAction(
                              'open-html-updater',
                              activeInstance.instanceId,
                            )
                          }
                          className="flex-1 py-1.5 px-2.5 rounded-[7px] bg-emerald-950/35 hover:bg-emerald-900/65 border border-[#14B8A6] text-[#5EEAD4] text-[11.5px] font-extrabold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0" />
                          <span>Cập nhật .HTML</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onQuickLabAction(
                              'edit-product-info',
                              activeInstance.instanceId,
                            )
                          }
                          className="flex-1 py-1.5 px-2.5 rounded-[7px] bg-slate-900/65 hover:bg-slate-800 border border-[#38BDF8]/60 text-[#7DD3FC] text-[11.5px] font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Sliders className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                          <span>Sửa thông số</span>
                        </button>
                      </div>

                      {/* 3. Cất thiết bị vào Tủ đựng đồ trên bàn (thay cho xóa thiết bị khỏi bàn) */}
                      <div className="pt-1 border-t border-white/15">
                        <button
                          type="button"
                          onClick={() => {
                            const delId = activeInstance.instanceId;
                            setConfirmDeleteId(null);
                            onQuickLabAction('delete-instance', delId);
                          }}
                          className="w-full py-1.5 px-2.5 rounded-[7px] bg-amber-950/65 hover:bg-amber-800/80 border border-amber-400/60 text-amber-200 hover:text-white text-[11.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Archive className="w-3.5 h-3.5 text-amber-300" />
                          <span>Cất thiết bị này vào Tủ đựng đồ (Sát trục X)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

        {/* D. Thanh công cụ Icon dọc sát mép phải màn hình trên Desktop/Tablet (>= 768px) — Có nút Ẩn / Mở màu đỏ thu gọn */}
        {isRightToolbarCollapsed ? (
          <button
            type="button"
            onClick={() => setIsRightToolbarCollapsed(false)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-[7px] bg-[#DC2626] hover:bg-[#B91C1C] border border-[#F87171] text-white text-[11px] font-extrabold z-20 shadow-md cursor-pointer transition-colors"
            title="Mở thanh công cụ điều khiển 3D"
            aria-label="Mở thanh công cụ điều khiển 3D"
          >
            <Sliders className="w-3.5 h-3.5 text-white" />
            <span>Mở</span>
          </button>
        ) : (
          <div
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 rounded-[10px] p-1 hidden md:flex flex-col items-center gap-1 z-20 border backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.25)] ${
              isDarkMode
                ? 'bg-[#081528]/18 border-white/30'
                : 'bg-white/20 border-white/55'
            }`}
            aria-label="Thanh công cụ điều khiển 3D"
          >
            {/* Nút Ẩn thanh công cụ 3D màu đỏ thu gọn */}
            <button
              type="button"
              onClick={() => setIsRightToolbarCollapsed(true)}
              className="w-8 h-6 rounded-[6px] bg-[#DC2626] hover:bg-[#B91C1C] border border-[#F87171] text-white text-[10.5px] font-extrabold flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              title="Ẩn thanh công cụ điều khiển 3D"
              aria-label="Ẩn thanh công cụ điều khiển 3D"
            >
              <span>Ẩn</span>
            </button>

            {/* 1. Di chuyển trên mặt bàn */}
            <button
              type="button"
              onClick={() =>
                onToolModeChange(toolMode === 'translate' ? 'select' : 'translate')
              }
              className={`w-8 h-8 rounded-[7px] flex items-center justify-center transition-colors cursor-pointer ${
                toolMode === 'translate'
                  ? 'bg-[#1E6BFF]/75 text-white shadow-xs'
                  : isDarkMode
                    ? 'text-slate-100 hover:bg-white/15'
                    : 'text-[#051630] hover:bg-white/35'
              }`}
              title="Di chuyển thiết bị trên toàn bộ mặt bàn (Cách mép 1 ô)"
              aria-label="Di chuyển thiết bị"
            >
              <Move
                className={`w-4 h-4 ${
                  toolMode === 'translate'
                    ? 'text-white'
                    : isDarkMode
                      ? 'text-[#38BDF8] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]'
                      : 'text-[#1D63E8] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]'
                }`}
              />
            </button>

            {/* 2. Xoay góc nhìn / vật thể */}
            <button
              type="button"
              onClick={() =>
                onToolModeChange(toolMode === 'rotate' ? 'select' : 'rotate')
              }
              className={`w-8 h-8 rounded-[7px] flex items-center justify-center transition-colors cursor-pointer ${
                toolMode === 'rotate'
                  ? 'bg-[#1E6BFF]/75 text-white shadow-xs'
                  : isDarkMode
                    ? 'text-slate-100 hover:bg-white/15'
                    : 'text-[#051630] hover:bg-white/35'
              }`}
              title="Xoay góc nhìn hoặc xoay vật thể"
              aria-label="Xoay"
            >
              <RotateCw
                className={`w-4 h-4 ${
                  toolMode === 'rotate'
                    ? 'text-white'
                    : isDarkMode
                      ? 'text-[#38BDF8] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]'
                      : 'text-[#1D63E8] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]'
                }`}
              />
            </button>

            {/* 3. Phóng to */}
            <button
              type="button"
              onClick={() => handleSmoothZoom(0.8)}
              className={`w-8 h-8 rounded-[7px] flex items-center justify-center transition-colors cursor-pointer ${
                isDarkMode
                  ? 'text-slate-100 hover:bg-white/15'
                  : 'text-[#051630] hover:bg-white/35'
              }`}
              title="Phóng to góc nhìn"
              aria-label="Phóng to"
            >
              <ZoomIn
                className={`w-4 h-4 ${
                  isDarkMode
                    ? 'text-[#38BDF8] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]'
                    : 'text-[#1D63E8] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]'
                }`}
              />
            </button>

            {/* 4. Thu nhỏ */}
            <button
              type="button"
              onClick={() => handleSmoothZoom(1.25)}
              className={`w-8 h-8 rounded-[7px] flex items-center justify-center transition-colors cursor-pointer ${
                isDarkMode
                  ? 'text-slate-100 hover:bg-white/15'
                  : 'text-[#051630] hover:bg-white/35'
              }`}
              title="Thu nhỏ góc nhìn"
              aria-label="Thu nhỏ"
            >
              <ZoomOut
                className={`w-4 h-4 ${
                  isDarkMode
                    ? 'text-[#38BDF8] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]'
                    : 'text-[#1D63E8] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]'
                }`}
              />
            </button>

            {/* 5. Nhìn từ trên xuống */}
            <button
              type="button"
              onClick={handleToggleTopView}
              className={`w-8 h-8 rounded-[7px] flex items-center justify-center transition-colors cursor-pointer ${
                isTopViewActive
                  ? 'bg-[#1E6BFF]/75 text-white shadow-xs'
                  : isDarkMode
                    ? 'text-slate-100 hover:bg-white/15'
                    : 'text-[#051630] hover:bg-white/35'
              }`}
              title="Chuyển góc nhìn từ trên xuống hoặc góc chuẩn"
              aria-label="Nhìn từ trên xuống"
            >
              <Eye
                className={`w-4 h-4 ${
                  isTopViewActive
                    ? 'text-white'
                    : isDarkMode
                      ? 'text-[#38BDF8] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]'
                      : 'text-[#1D63E8] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]'
                }`}
              />
            </button>

            {/* 6. Đặt lại góc nhìn chuẩn bàn thí nghiệm */}
            <button
              type="button"
              onClick={() => handleFocusCameraPreset('bench-close')}
              className={`w-8 h-8 rounded-[7px] flex items-center justify-center transition-colors cursor-pointer ${
                isDarkMode
                  ? 'text-slate-100 hover:bg-white/15'
                  : 'text-[#051630] hover:bg-white/35'
              }`}
              title="Đặt lại góc nhìn chuẩn bàn thí nghiệm"
              aria-label="Đặt lại góc nhìn chuẩn"
            >
              <RotateCcw
                className={`w-4 h-4 ${
                  isDarkMode
                    ? 'text-[#38BDF8] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]'
                    : 'text-[#1D63E8] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]'
                }`}
              />
            </button>
          </div>
        )}

        {/* =====================================================================
            CHẾ ĐỘ SOI 360° THIẾT BỊ (viewMode === 'single-asset'):
            - Hoàn toàn KHÔNG có thanh công cụ/thông số phía dưới màn hình
            - Bổ sung thanh nút chức năng tương tác dạng Icon gọn gàng:
              1. Bật/tắt ẩn hiện chú thích chi tiết từng chức năng/bộ phận của thiết bị
              2. Xem hướng dẫn sử dụng thiết bị
              3. Mở bảng hiệu chỉnh thông số thiết bị
            ===================================================================== */}
        {viewMode === 'single-asset' && activeAsset && (() => {
          const partCallouts = get360EquipmentPartCallouts(activeAsset);
          const usageGuide = get360EquipmentUsageGuide(activeAsset);
          const arch = activeAsset.geometry.proceduralArchetype;
          const virtualInstForReadout: SceneInstance = {
            instanceId: 'single-asset-360-preview',
            assetId: activeAsset.assetId,
            assetVersion: activeAsset.assetVersion,
            visible: true,
            locked: false,
            parentZone: 'bench-main',
            labelVisible: false,
            transform: {
              positionM: [0, 0, 0],
              rotationRad: [
                0,
                (singleAssetRotYDeg * Math.PI) / 180,
                -(singleAssetTiltZDeg * Math.PI) / 180,
              ],
              displayScale: [
                singleAssetScale,
                singleAssetScale,
                singleAssetScale,
              ],
            },
            instanceState: singleAssetSimState,
          };
          const liveReadout360 = computeLiveEquipmentReadout(
            virtualInstForReadout,
            activeAsset,
          );
          const previewEntry = equipmentImagePreviewController.getEntry(
            activeAsset.assetId,
          );
          const realPhotoSrc =
            previewEntry?.realPhotoMeta.available &&
            previewEntry?.realPhotoMeta.sourceKind === 'real-photo'
              ? previewEntry.realPhotoMeta.src
              : null;
          const dims = activeAsset.geometry.boundingBoxM;
          const dimsMmText = `${Math.round(dims.width * 1000)} × ${Math.round(
            dims.height * 1000,
          )} × ${Math.round(dims.depth * 1000)} mm`;
          const maxCapMl =
            arch === 'overflow-can'
              ? 210
              : activeAsset.scientificProperties.capacity?.value ?? 100;
          const isLiquidVessel =
            arch === 'graduated-cylinder' ||
            arch === 'beaker-250' ||
            arch === 'erlenmeyer-flask' ||
            arch === 'overflow-can' ||
            arch === 'water-dispenser' ||
            arch === 'separatory-funnel' ||
            arch === 'porcelain-dish';

          const catalogList =
            allAssets && allAssets.length > 0
              ? allAssets
              : Array.from(assetsMap.values());
          const currentCatalogIdx = Math.max(
            0,
            catalogList.findIndex((a) => a.assetId === activeAsset.assetId),
          );
          const customMod360 = htmlEquipmentModuleRegistry.getModule(
            activeAsset.assetId,
          );
          const handleStepCatalogAsset = (delta: number) => {
            if (!onSelectCatalogAsset || catalogList.length === 0) return;
            labSoundEngine.play('ui-toggle', 0.7);
            const nextIdx =
              (currentCatalogIdx + delta + catalogList.length) %
              catalogList.length;
            const nextAsset = catalogList[nextIdx];
            if (nextAsset) {
              onSelectCatalogAsset(nextAsset.assetId);
            }
          };

          return (
            <>
              {/* 1. THANH NÚT ICON TƯƠNG TÁC GỌN GÀNG CHO CHẾ ĐỘ SOI 360° (Đặt nổi ở góc trên giữa) */}
              <div
                ref={toolbar360Ref}
                className="absolute top-2.5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#071428]/82 backdrop-blur-xl border-[1.5px] border-[#38BDF8]/75 shadow-[0_10px_32px_rgba(0,0,0,0.55)] max-w-[96vw]"
              >
                {/* Bộ chuyển nhanh Trước / Chọn trực tiếp mọi dụng cụ / Tiếp theo ngay trong chế độ 360° */}
                <div className="flex items-center gap-1.5 pl-1 pr-2 border-r border-white/20">
                  {onSelectCatalogAsset && catalogList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleStepCatalogAsset(-1)}
                      title="Soi dụng cụ trước đó"
                      aria-label="Soi dụng cụ trước đó"
                      className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#1E6BFF] border border-white/25 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}

                  <div className="w-7 h-7 rounded-full bg-white border border-[#38BDF8] flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                    {realPhotoSrc ? (
                      <img
                        src={realPhotoSrc}
                        alt={activeAsset.name.vi}
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      <EquipmentThumbnailSvg
                        archetype={arch}
                        assetId={activeAsset.assetId}
                        className="w-5.5 h-5.5"
                      />
                    )}
                  </div>

                  {onSelectCatalogAsset && catalogList.length > 1 ? (
                    <select
                      value={activeAsset.assetId}
                      onChange={(e) => {
                        labSoundEngine.play('ui-toggle', 0.7);
                        onSelectCatalogAsset(e.target.value);
                      }}
                      title="Chọn nhanh bất kỳ dụng cụ nào trong danh mục để soi 360°"
                      aria-label="Chọn dụng cụ để soi 360°"
                      className="bg-[#0B1E38] hover:bg-[#102A4C] text-white font-extrabold text-[12px] px-2 py-1 rounded-[8px] border border-[#38BDF8]/60 outline-none cursor-pointer max-w-[145px] sm:max-w-[205px] lg:max-w-[250px] truncate"
                    >
                      {catalogList.map((item, idx) => (
                        <option
                          key={item.assetId}
                          value={item.assetId}
                          className="bg-[#071428] text-white font-bold"
                        >
                          {idx + 1}. {item.name.vi}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-[12.5px] font-extrabold text-white truncate max-w-[170px] lg:max-w-[240px]">
                      {activeAsset.name.vi}
                    </span>
                  )}

                  {onSelectCatalogAsset && catalogList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleStepCatalogAsset(1)}
                      title="Soi dụng cụ tiếp theo"
                      aria-label="Soi dụng cụ tiếp theo"
                      className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#1E6BFF] border border-white/25 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}

                  {liveReadout360.readoutBadge && (
                    <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-emerald-950/85 border border-emerald-400/80 text-[#5EEAD4] font-mono text-[11.5px] font-extrabold tabular-nums shrink-0">
                      {liveReadout360.readoutBadge}
                    </span>
                  )}
                </div>

                {/* NÚT ICON 1: Bật/tắt ẩn hiện chú thích chi tiết từng chức năng/bộ phận của thiết bị */}
                <button
                  type="button"
                  onClick={() => {
                    labSoundEngine.play('ui-toggle', 0.7);
                    setShow360PartAnnotations((v) => !v);
                  }}
                  title={
                    show360PartAnnotations
                      ? 'Đang HIỆN chú thích chi tiết từng chức năng/bộ phận (Bấm để ẩn)'
                      : 'Bật hiển thị chú thích chi tiết từng chức năng/bộ phận của thiết bị'
                  }
                  aria-label="Bật/tắt chú thích chi tiết từng chức năng/bộ phận"
                  aria-pressed={show360PartAnnotations}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer relative ${
                    show360PartAnnotations
                      ? 'bg-[#1E6BFF] border-[#7DD3FC] text-white shadow-[0_0_14px_rgba(30,107,255,0.65)]'
                      : 'bg-white/10 hover:bg-white/20 border-white/30 text-slate-200'
                  }`}
                >
                  <Tag className="w-4 h-4" />
                  <span
                    className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[#071428] ${
                      show360PartAnnotations ? 'bg-[#34D399]' : 'bg-slate-500'
                    }`}
                  />
                </button>

                {/* NÚT ICON 2: Xem hướng dẫn sử dụng thiết bị */}
                <button
                  type="button"
                  onClick={() => {
                    labSoundEngine.play('ui-toggle', 0.7);
                    setActive360Panel((prev) =>
                      prev === 'usage-guide' ? 'none' : 'usage-guide',
                    );
                  }}
                  title="Xem hướng dẫn sử dụng thiết bị"
                  aria-label="Xem hướng dẫn sử dụng thiết bị"
                  aria-expanded={active360Panel === 'usage-guide'}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                    active360Panel === 'usage-guide'
                      ? 'bg-[#059669] border-[#6EE7B7] text-white shadow-[0_0_14px_rgba(5,150,105,0.65)]'
                      : 'bg-white/10 hover:bg-white/20 border-white/30 text-emerald-300'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                </button>

                {/* NÚT ICON 3: Mở bảng hiệu chỉnh thông số thiết bị */}
                <button
                  type="button"
                  onClick={() => {
                    labSoundEngine.play('ui-toggle', 0.7);
                    setActive360Panel((prev) =>
                      prev === 'calibration' ? 'none' : 'calibration',
                    );
                  }}
                  title="Mở bảng hiệu chỉnh thông số thiết bị"
                  aria-label="Mở bảng hiệu chỉnh thông số thiết bị"
                  aria-expanded={active360Panel === 'calibration'}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                    active360Panel === 'calibration'
                      ? 'bg-[#D97706] border-[#FDE047] text-white shadow-[0_0_14px_rgba(217,119,6,0.65)]'
                      : 'bg-white/10 hover:bg-white/20 border-white/30 text-amber-300'
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                </button>

                {/* NÚT ICON 4: Tự động xoay 360° */}
                <button
                  type="button"
                  onClick={() => {
                    labSoundEngine.play('ui-toggle', 0.65);
                    setIs360AutoRotate((v) => !v);
                  }}
                  title={
                    is360AutoRotate
                      ? 'Dừng tự động xoay 360°'
                      : 'Tự động xoay tròn 360° quanh thiết bị'
                  }
                  aria-label="Tự động xoay 360°"
                  aria-pressed={is360AutoRotate}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                    is360AutoRotate
                      ? 'bg-[#0284C7] border-[#7DD3FC] text-white'
                      : 'bg-white/10 hover:bg-white/20 border-white/30 text-[#38BDF8]'
                  }`}
                >
                  <RotateCw
                    className={`w-4 h-4 ${is360AutoRotate ? 'animate-spin' : ''}`}
                  />
                </button>

                {/* NÚT ICON 5: Đặt thiết bị đang soi ra bàn thí nghiệm 3D */}
                {onAddAssetToTable && (
                  <button
                    type="button"
                    onClick={() => {
                      labSoundEngine.play('step-complete', 0.85);
                      onAddAssetToTable(activeAsset.assetId);
                    }}
                    title="Đặt thiết bị này ra bàn thí nghiệm 3D"
                    aria-label="Đặt thiết bị ra bàn thí nghiệm 3D"
                    className="w-9 h-9 rounded-full bg-emerald-600/85 hover:bg-emerald-500 border border-emerald-300 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4 stroke-[2.8]" />
                  </button>
                )}
              </div>

              {/* 2. HỆ THỐNG CHÚ THÍCH CHI TIẾT TỪNG CHỨC NĂNG / BỘ PHẬN CỦA THIẾT BỊ (Khi bật Nút Icon 1) */}
              {show360PartAnnotations && (
                <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                  {/* Các điểm chốt đánh số ① ② ③ ④ ngay trên các bộ phận của mô hình 3D */}
                  {partCallouts.map((callout) => {
                    const isPinSelected =
                      selected360PartPinId === null ||
                      selected360PartPinId === callout.id;
                    return (
                      <React.Fragment key={callout.id}>
                        {/* Điểm chốt tròn đánh số trên thân thiết bị */}
                        <button
                          type="button"
                          onClick={() => {
                            labSoundEngine.play('ui-toggle', 0.65);
                            setSelected360PartPinId((prev) =>
                              prev === callout.id ? null : callout.id,
                            );
                          }}
                          style={{
                            left: `${callout.pinXPercent}%`,
                            top: `${callout.pinYPercent}%`,
                          }}
                          title={`Bộ phận ${callout.pinNum}: ${callout.partTitle}`}
                          className={`pointer-events-auto -translate-x-1/2 -translate-y-1/2 absolute w-7 h-7 rounded-full font-mono text-[12px] font-extrabold flex items-center justify-center border-2 transition-all cursor-pointer shadow-[0_4px_14px_rgba(0,0,0,0.65)] ${
                            selected360PartPinId === callout.id
                              ? 'bg-amber-500 border-white text-slate-950 scale-115'
                              : 'bg-[#1E6BFF]/90 hover:bg-[#00BCEB] border-white text-white'
                          }`}
                        >
                          {callout.pinNum}
                        </button>

                        {/* Thẻ mô tả chi tiết chức năng bộ phận đặt gọn ở 2 bên mô hình 3D */}
                        {isPinSelected && (
                          <div
                            onClick={() =>
                              setSelected360PartPinId((prev) =>
                                prev === callout.id ? null : callout.id,
                              )
                            }
                            style={{
                              top: `${callout.topPercent}%`,
                            }}
                            className={`pointer-events-auto absolute hidden md:flex items-start gap-2.5 max-w-[270px] lg:max-w-[305px] p-2.5 rounded-[12px] bg-[#071529]/72 hover:bg-[#071529]/90 backdrop-blur-xl border transition-all cursor-pointer shadow-[0_10px_28px_rgba(0,0,0,0.48)] ${
                              callout.side === 'left'
                                ? 'left-3 border-[#38BDF8]/75'
                                : 'right-12 border-emerald-400/75'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-full font-mono text-[11.5px] font-extrabold flex items-center justify-center shrink-0 border ${
                                callout.side === 'left'
                                  ? 'bg-[#1E6BFF] border-sky-200 text-white'
                                  : 'bg-emerald-600 border-emerald-200 text-white'
                              }`}
                            >
                              {callout.pinNum}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-[12.5px] font-extrabold text-white leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                                {callout.partTitle}
                              </div>
                              <p className="text-[11.5px] font-semibold text-slate-200 leading-relaxed mt-0.5">
                                {callout.functionDetail}
                              </p>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}

              {/* 3. BẢNG XEM HƯỚNG DẪN SỬ DỤNG THIẾT BỊ (Mở khi bấm Nút Icon 2 - BookOpen) */}
              {active360Panel === 'usage-guide' && (
                <div
                  ref={panel360Ref}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-14 right-3 md:right-12 z-[60] w-[min(92vw,390px)] max-h-[calc(100%-72px)] overflow-y-auto overscroll-contain rounded-[15px] bg-[#071529]/94 backdrop-blur-2xl border-[1.5px] border-emerald-400/85 text-white p-4 shadow-[0_20px_50px_rgba(0,0,0,0.72)] space-y-3"
                >
                  <div className="flex items-start justify-between gap-2.5 pb-2.5 border-b border-white/20">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-[10px] bg-emerald-500/25 border border-emerald-400/80 flex items-center justify-center shrink-0 text-emerald-300">
                        <BookOpen className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300">
                          Hướng dẫn sử dụng thiết bị
                        </div>
                        <h3 className="text-[14.5px] font-extrabold text-white truncate">
                          {activeAsset.name.vi}
                        </h3>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActive360Panel('none')}
                      className="w-7 h-7 rounded-[8px] bg-white/10 hover:bg-rose-600 border border-white/25 text-white flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                      title="Đóng bảng hướng dẫn sử dụng"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Công dụng chuẩn SGK */}
                  <div className="p-2.5 rounded-[10px] bg-slate-950/55 border border-white/20 space-y-1">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#7DD3FC]">
                      1. Công dụng chuẩn trong phòng thí nghiệm
                    </div>
                    <p className="text-[12.5px] font-semibold text-slate-100 leading-relaxed">
                      {usageGuide.standardFunction}
                    </p>
                  </div>

                  {/* Các bước thao tác chuẩn */}
                  <div className="p-2.5 rounded-[10px] bg-slate-950/55 border border-white/20 space-y-2">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300">
                      2. Quy trình thao tác chuẩn (Từng bước)
                    </div>
                    <div className="space-y-1.5">
                      {usageGuide.steps.map((stepText, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-[12px] font-semibold text-slate-100 leading-snug"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{stepText}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cách đọc số đo & ĐCNN */}
                  <div className="p-2.5 rounded-[10px] bg-slate-950/55 border border-amber-400/40 space-y-1">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                      3. Giới hạn đo (GHĐ) & Cách đọc số đo
                    </div>
                    <p className="text-[12px] font-bold text-amber-100 leading-relaxed">
                      {usageGuide.readingRule}
                    </p>
                  </div>

                  {/* Lưu ý an toàn */}
                  <div className="p-2.5 rounded-[10px] bg-rose-950/45 border border-rose-400/50 space-y-1">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-rose-300">
                      4. Lưu ý an toàn & Bảo quản
                    </div>
                    <p className="text-[12px] font-semibold text-rose-100 leading-relaxed">
                      {usageGuide.safetyNote}
                    </p>
                  </div>

                  {/* Nút xem hồ sơ SGK & ảnh thật đầy đủ */}
                  {onOpenAssetDetailModal && (
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenAssetDetailModal(activeAsset, false)
                        }
                        className="flex-1 py-2 px-3 rounded-[9px] bg-[#1E6BFF] hover:bg-[#1557D6] border border-[#7DD3FC]/70 text-white text-[12.5px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5 text-amber-200" />
                        <span>Xem Hồ sơ SGK & Ảnh thực tế</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 4. BẢNG HIỆU CHỈNH THÔNG SỐ THIẾT BỊ (Mở khi bấm Nút Icon 3 - Wrench) */}
              {active360Panel === 'calibration' && (
                <div
                  ref={panel360Ref}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-14 right-3 md:right-12 z-[60] w-[min(92vw,400px)] max-h-[calc(100%-72px)] overflow-y-auto overscroll-contain rounded-[15px] bg-[#071529]/94 backdrop-blur-2xl border-[1.5px] border-amber-400/85 text-white p-4 shadow-[0_20px_50px_rgba(0,0,0,0.72)] space-y-3"
                >
                  <div className="flex items-start justify-between gap-2.5 pb-2.5 border-b border-white/20">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-[10px] bg-amber-500/25 border border-amber-400/80 flex items-center justify-center shrink-0 text-amber-300">
                        <Wrench className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                          Bảng hiệu chỉnh thông số 360°
                        </div>
                        <h3 className="text-[14.5px] font-extrabold text-white truncate">
                          {activeAsset.name.vi}
                        </h3>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActive360Panel('none')}
                      className="w-7 h-7 rounded-[8px] bg-white/10 hover:bg-rose-600 border border-white/25 text-white flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                      title="Đóng bảng hiệu chỉnh thông số"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* A. HIỆU CHỈNH TRẠNG THÁI HOẠT ĐỘNG TRỰC TIẾP TRÊN MÔ HÌNH 3D */}
                  <div className="p-3 rounded-[11px] bg-slate-950/60 border border-[#38BDF8]/55 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#7DD3FC]">
                        Hiệu chỉnh trực tiếp trên 3D
                      </span>
                      {liveReadout360.readoutBadge && (
                        <span className="px-2 py-0.5 rounded-[6px] bg-emerald-950/90 border border-emerald-400/80 font-mono text-[12px] font-extrabold text-[#5EEAD4] tabular-nums">
                          {liveReadout360.readoutBadge}
                        </span>
                      )}
                    </div>

                    {/* 1. Chỉnh mực nước (ml) cho các bình chứa chất lỏng */}
                    {isLiquidVessel && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[12px] font-bold">
                          <span className="text-sky-200">
                            Mực chất lỏng trong bình:
                          </span>
                          <span className="font-mono font-extrabold text-[#38BDF8]">
                            {(singleAssetSimState.liquidLevelMl ?? 50).toFixed(
                              1,
                            )}{' '}
                            / {maxCapMl} ml
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={maxCapMl}
                          step={0.5}
                          value={singleAssetSimState.liquidLevelMl ?? 50}
                          onChange={(e) =>
                            setSingleAssetSimState((prev) => ({
                              ...prev,
                              liquidLevelMl: Number(e.target.value),
                              baseLiquidLevelMl: Number(e.target.value),
                            }))
                          }
                          className="w-full accent-[#00BCEB] cursor-pointer"
                        />
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {[
                            0,
                            Math.round(maxCapMl * 0.25),
                            Math.round(maxCapMl * 0.5),
                            Math.round(maxCapMl * 0.75),
                            maxCapMl,
                          ].map((v) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() =>
                                setSingleAssetSimState((prev) => ({
                                  ...prev,
                                  liquidLevelMl: v,
                                  baseLiquidLevelMl: v,
                                }))
                              }
                              className="px-2 py-0.5 rounded-[6px] bg-white/10 hover:bg-[#1E6BFF] border border-white/25 font-mono text-[11px] font-extrabold text-white cursor-pointer"
                            >
                              {v} ml
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 2. Chỉnh khối lượng hiển thị trên Cân điện tử */}
                    {arch === 'electronic-balance' && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[12px] font-bold">
                          <span className="text-emerald-200">
                            Khối lượng hiển thị LCD:
                          </span>
                          <span className="font-mono font-extrabold text-[#5EEAD4]">
                            {(
                              singleAssetSimState.measuredMassG ?? 0
                            ).toFixed(2)}{' '}
                            g
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={500}
                          step={0.25}
                          value={singleAssetSimState.measuredMassG ?? 0}
                          onChange={(e) =>
                            setSingleAssetSimState((prev) => ({
                              ...prev,
                              measuredMassG: Number(e.target.value),
                            }))
                          }
                          className="w-full accent-emerald-400 cursor-pointer"
                        />
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {[0, 50, 66.25, 100, 250].map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() =>
                                setSingleAssetSimState((prev) => ({
                                  ...prev,
                                  measuredMassG: m,
                                }))
                              }
                              className="px-2 py-0.5 rounded-[6px] bg-white/10 hover:bg-emerald-600 border border-white/25 font-mono text-[11px] font-extrabold text-white cursor-pointer"
                            >
                              {m === 0 ? 'TARE 0.00 g' : `${m} g`}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 3. Chỉnh Lực kéo trên Lực kế lò xo */}
                    {arch === 'spring-dynamometer' && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[12px] font-bold">
                          <span className="text-amber-200">
                            Lực kéo lò xo F:
                          </span>
                          <span className="font-mono font-extrabold text-amber-300">
                            {(
                              singleAssetSimState.springExtensionN ?? 0
                            ).toFixed(2)}{' '}
                            N
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={5}
                          step={0.1}
                          value={singleAssetSimState.springExtensionN ?? 0}
                          onChange={(e) =>
                            setSingleAssetSimState((prev) => ({
                              ...prev,
                              springExtensionN: Number(e.target.value),
                            }))
                          }
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                      </div>
                    )}

                    {/* 4. Chỉnh Độ mở hàm kẹp Thước cặp Du xích */}
                    {arch === 'vernier-caliper' && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[12px] font-bold">
                          <span className="text-sky-200">
                            Độ mở hàm kẹp d:
                          </span>
                          <span className="font-mono font-extrabold text-[#38BDF8]">
                            {(
                              singleAssetSimState.jawOpeningMm ?? 0
                            ).toFixed(2)}{' '}
                            mm
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={120}
                          step={0.5}
                          value={singleAssetSimState.jawOpeningMm ?? 0}
                          onChange={(e) =>
                            setSingleAssetSimState((prev) => ({
                              ...prev,
                              jawOpeningMm: Number(e.target.value),
                            }))
                          }
                          className="w-full accent-[#38BDF8] cursor-pointer"
                        />
                      </div>
                    )}

                    {/* 5. Chỉnh Nhiệt độ trên Nhiệt kế */}
                    {arch === 'thermometer' && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[12px] font-bold">
                          <span className="text-rose-200">
                            Nhiệt độ cột chất lỏng:
                          </span>
                          <span className="font-mono font-extrabold text-rose-300">
                            {(singleAssetSimState.temperatureC ?? 25).toFixed(
                              1,
                            )}{' '}
                            °C
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={105}
                          step={0.5}
                          value={singleAssetSimState.temperatureC ?? 25}
                          onChange={(e) =>
                            setSingleAssetSimState((prev) => ({
                              ...prev,
                              temperatureC: Number(e.target.value),
                            }))
                          }
                          className="w-full accent-rose-500 cursor-pointer"
                        />
                      </div>
                    )}

                    {/* 6. Chỉnh Tia Laser / Khúc xạ quang học / Thấu kính */}
                    {(arch === 'laser-source' ||
                      arch === 'optical-prism' ||
                      arch === 'semicircular-slab' ||
                      arch === 'optical-lens' ||
                      arch === 'magnifying-glass') && (
                      <div className="space-y-2">
                        {(arch === 'laser-source' ||
                          arch === 'optical-prism' ||
                          arch === 'semicircular-slab') && (
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-slate-200">
                              Nguồn phát tia Laser 650 nm:
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setSingleAssetSimState((prev) => ({
                                  ...prev,
                                  isPoweredOn: !(prev.isPoweredOn ?? true),
                                }))
                              }
                              className={`px-2.5 py-1 rounded-[7px] font-mono text-[11.5px] font-extrabold border cursor-pointer ${
                                singleAssetSimState.isPoweredOn !== false
                                  ? 'bg-red-600 border-red-300 text-white'
                                  : 'bg-slate-800 border-white/25 text-slate-300'
                              }`}
                            >
                              {singleAssetSimState.isPoweredOn !== false
                                ? '🔦 ĐANG BẬT (ON)'
                                : '🔦 ĐANG TẮT (OFF)'}
                            </button>
                          </div>
                        )}
                        {(arch === 'semicircular-slab' ||
                          arch === 'optical-prism') && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[12px] font-bold">
                              <span>Góc tới tia sáng i:</span>
                              <span className="font-mono text-amber-300">
                                {singleAssetSimState.incidentAngleDeg ?? 40}°
                              </span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={80}
                              step={1}
                              value={
                                singleAssetSimState.incidentAngleDeg ?? 40
                              }
                              onChange={(e) =>
                                setSingleAssetSimState((prev) => ({
                                  ...prev,
                                  incidentAngleDeg: Number(e.target.value),
                                }))
                              }
                              className="w-full accent-amber-400 cursor-pointer"
                            />
                            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                              {[20, 30, 40, 42, 60].map((deg) => (
                                <button
                                  key={deg}
                                  type="button"
                                  onClick={() =>
                                    setSingleAssetSimState((prev) => ({
                                      ...prev,
                                      incidentAngleDeg: deg,
                                    }))
                                  }
                                  className="px-2 py-0.5 rounded-[6px] bg-white/10 hover:bg-amber-600 border border-white/25 font-mono text-[11px] font-extrabold text-white cursor-pointer"
                                >
                                  i = {deg}°
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 6B. Van xả dòng chảy cho Bình cấp nước / Phễu chiết / Bình tràn */}
                    {(arch === 'water-dispenser' ||
                      arch === 'separatory-funnel' ||
                      arch === 'overflow-can') && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[12px] font-bold text-sky-200">
                          Van khóa / Tia dòng chảy:
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setSingleAssetSimState((prev) => ({
                              ...prev,
                              isValveOpen: !prev.isValveOpen,
                            }))
                          }
                          className={`px-2.5 py-1 rounded-[7px] font-mono text-[11.5px] font-extrabold border cursor-pointer ${
                            singleAssetSimState.isValveOpen
                              ? 'bg-[#0284C7] border-[#7DD3FC] text-white'
                              : 'bg-slate-800 border-white/25 text-slate-300'
                          }`}
                        >
                          {singleAssetSimState.isValveOpen
                            ? '💧 ĐANG MỞ VAN XẢ'
                            : '🔒 ĐANG KHÓA VAN'}
                        </button>
                      </div>
                    )}

                    {/* 6C. Đồng hồ vạn năng hiện số (Digital Multimeter) */}
                    {arch === 'digital-multimeter' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[12px] font-bold">
                          <span className="text-amber-200">Thang đo:</span>
                          <div className="flex items-center gap-1">
                            {(['DCV', 'DCA', 'Ω'] as const).map((m) => (
                              <button
                                key={m}
                                type="button"
                                onClick={() =>
                                  setSingleAssetSimState((prev) => ({
                                    ...prev,
                                    multimeterMode: m,
                                  }))
                                }
                                className={`px-2 py-0.5 rounded-[6px] font-mono text-[11px] font-extrabold border cursor-pointer ${
                                  (singleAssetSimState.multimeterMode ??
                                    'DCV') === m
                                    ? 'bg-amber-500 border-white text-slate-950'
                                    : 'bg-white/10 border-white/25 text-white'
                                }`}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[12px] font-bold">
                            <span className="text-emerald-200">
                              Giá trị hiển thị LCD:
                            </span>
                            <span className="font-mono font-extrabold text-[#5EEAD4]">
                              {(
                                singleAssetSimState.multimeterValue ?? 0
                              ).toFixed(2)}{' '}
                              {singleAssetSimState.multimeterMode ?? 'DCV'}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={50}
                            step={0.25}
                            value={singleAssetSimState.multimeterValue ?? 0}
                            onChange={(e) =>
                              setSingleAssetSimState((prev) => ({
                                ...prev,
                                multimeterValue: Number(e.target.value),
                              }))
                            }
                            className="w-full accent-emerald-400 cursor-pointer"
                          />
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {[0, 3, 6, 12, 24].map((val) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() =>
                                  setSingleAssetSimState((prev) => ({
                                    ...prev,
                                    multimeterValue: val,
                                  }))
                                }
                                className="px-2 py-0.5 rounded-[6px] bg-white/10 hover:bg-emerald-600 border border-white/25 font-mono text-[11px] font-extrabold text-white cursor-pointer"
                              >
                                {val === 0
                                  ? '0.00 (Chưa đo)'
                                  : `${val.toFixed(1)} ${
                                      singleAssetSimState.multimeterMode ??
                                      'DCV'
                                    }`}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 6D. Điện kế nhạy G & Cuộn dây cảm ứng LED */}
                    {(arch === 'galvanometer' ||
                      arch === 'induction-coil-led') && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[12px] font-bold">
                          <span className="text-sky-200">
                            {arch === 'galvanometer'
                              ? 'Độ lệch kim điện kế G:'
                              : 'Cảm ứng từ trường (Nam châm N-S):'}
                          </span>
                          <span className="font-mono font-extrabold text-[#38BDF8]">
                            {((singleAssetSimState.galvanometerDeflection ?? 0) *
                              50
                            ).toFixed(0)}{' '}
                            μA
                          </span>
                        </div>
                        <input
                          type="range"
                          min={-1}
                          max={1}
                          step={0.05}
                          value={
                            singleAssetSimState.galvanometerDeflection ?? 0
                          }
                          onChange={(e) =>
                            setSingleAssetSimState((prev) => ({
                              ...prev,
                              galvanometerDeflection: Number(e.target.value),
                            }))
                          }
                          className="w-full accent-[#38BDF8] cursor-pointer"
                        />
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {[
                            { label: 'Lệch trái (-40 μA)', val: -0.8 },
                            { label: 'Vạch 0 (Đứng yên)', val: 0 },
                            { label: 'Lệch phải (+40 μA)', val: 0.8 },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() =>
                                setSingleAssetSimState((prev) => ({
                                  ...prev,
                                  galvanometerDeflection: preset.val,
                                }))
                              }
                              className="px-2 py-0.5 rounded-[6px] bg-white/10 hover:bg-[#1E6BFF] border border-white/25 font-mono text-[11px] font-extrabold text-white cursor-pointer"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 6E. Kính hiển vi quang học (Chọn vật kính 10× / 40× / 100×) */}
                    {arch === 'optical-microscope' && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[12px] font-bold">
                          <span className="text-emerald-200">
                            Mâm xoay vật kính:
                          </span>
                          <span className="font-mono font-extrabold text-[#5EEAD4]">
                            {singleAssetSimState.magnification ?? 40}× (Tổng{' '}
                            {(singleAssetSimState.magnification ?? 40) * 10}×)
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {([10, 40, 100] as const).map((mag) => (
                            <button
                              key={mag}
                              type="button"
                              onClick={() =>
                                setSingleAssetSimState((prev) => ({
                                  ...prev,
                                  magnification: mag,
                                }))
                              }
                              className={`flex-1 py-1 rounded-[7px] font-mono text-[11.5px] font-extrabold border cursor-pointer ${
                                (singleAssetSimState.magnification ?? 40) ===
                                mag
                                  ? 'bg-emerald-600 border-emerald-300 text-white'
                                  : 'bg-white/10 border-white/25 text-slate-200'
                              }`}
                            >
                              Vật kính {mag}×
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 6F. Bát sứ & Bộ chưng cất (Bật/tắt ngọn lửa gia nhiệt) */}
                    {(arch === 'porcelain-dish' ||
                      arch === 'distillation-flask') && (
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-amber-200">
                          Ngọn lửa đèn cồn gia nhiệt:
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setSingleAssetSimState((prev) => ({
                              ...prev,
                              isHeating: !(prev.isHeating ?? true),
                            }))
                          }
                          className={`px-2.5 py-1 rounded-[7px] font-mono text-[11.5px] font-extrabold border cursor-pointer ${
                            singleAssetSimState.isHeating !== false
                              ? 'bg-amber-600 border-amber-300 text-white'
                              : 'bg-slate-800 border-white/25 text-slate-300'
                          }`}
                        >
                          {singleAssetSimState.isHeating !== false
                            ? '🔥 ĐANG ĐUN NÓNG'
                            : '❄️ ĐÃ TẮT LỬA'}
                        </button>
                      </div>
                    )}

                    {/* 6G. Điều khiển tùy chỉnh cho các thiết bị nạp từ file .HTML */}
                    {customMod360 && (
                      <div className="space-y-1.5 pt-1 border-t border-white/15">
                        <div className="flex items-center justify-between text-[12px] font-bold">
                          <span className="text-sky-200">
                            {customMod360.moduleControls.label}:
                          </span>
                          <span className="font-mono font-extrabold text-[#5EEAD4]">
                            {Number(
                              (
                                singleAssetSimState as Record<string, unknown>
                              )[customMod360.moduleControls.stateKey] ??
                                customMod360.moduleControls.defaultValue,
                            ).toFixed(1)}{' '}
                            {customMod360.moduleControls.unit}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={customMod360.moduleControls.min}
                          max={customMod360.moduleControls.max}
                          step={customMod360.moduleControls.step}
                          value={Number(
                            (singleAssetSimState as Record<string, unknown>)[
                              customMod360.moduleControls.stateKey
                            ] ?? customMod360.moduleControls.defaultValue,
                          )}
                          onChange={(e) =>
                            setSingleAssetSimState((prev) => ({
                              ...prev,
                              [customMod360.moduleControls.stateKey]: Number(
                                e.target.value,
                              ),
                            }))
                          }
                          className="w-full accent-[#00BCEB] cursor-pointer"
                        />
                      </div>
                    )}

                    {/* 7. Chỉnh Tỷ lệ phóng đại & Góc xoay/nghiêng 360° */}
                    <div className="pt-2 border-t border-white/15 space-y-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[12px] font-bold">
                          <span className="text-slate-200">
                            Độ phóng đại mô hình 3D:
                          </span>
                          <span className="font-mono font-extrabold text-amber-300">
                            {singleAssetScale.toFixed(2)}×
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0.85}
                          max={2.25}
                          step={0.05}
                          value={singleAssetScale}
                          onChange={(e) =>
                            setSingleAssetScale(Number(e.target.value))
                          }
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[12px] font-bold">
                          <span className="text-slate-200">
                            Góc xoay ngang 360°:
                          </span>
                          <span className="font-mono font-extrabold text-[#38BDF8]">
                            {singleAssetRotYDeg}°
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={360}
                          step={1}
                          value={singleAssetRotYDeg}
                          onChange={(e) =>
                            setSingleAssetRotYDeg(Number(e.target.value))
                          }
                          className="w-full accent-[#38BDF8] cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[12px] font-bold">
                          <span className="text-slate-200">
                            Góc nghiêng thiết bị:
                          </span>
                          <span className="font-mono font-extrabold text-[#5EEAD4]">
                            {singleAssetTiltZDeg}°
                          </span>
                        </div>
                        <input
                          type="range"
                          min={-60}
                          max={60}
                          step={1}
                          value={singleAssetTiltZDeg}
                          onChange={(e) =>
                            setSingleAssetTiltZDeg(Number(e.target.value))
                          }
                          className="w-full accent-[#14B8A6] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* B. BẢNG THÔNG SỐ KỸ THUẬT CHUẨN & NÚT CHỈNH SỬA HỒ SƠ GỐC */}
                  <div className="p-3 rounded-[11px] bg-slate-950/55 border border-white/20 space-y-2.5">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                      Thông số kỹ thuật định danh ({activeAsset.assetId})
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[11.5px]">
                      <div className="px-2.5 py-1.5 rounded-[8px] bg-white/5 border border-white/15">
                        <div className="text-[10.5px] text-slate-300 font-semibold">
                          Khối lượng chuẩn
                        </div>
                        <div className="font-mono font-extrabold text-[#5EEAD4]">
                          {activeAsset.scientificProperties.referenceMass
                            ?.value ?? 66.25}{' '}
                          {activeAsset.scientificProperties.referenceMass
                            ?.unit ?? 'g'}
                        </div>
                      </div>
                      <div className="px-2.5 py-1.5 rounded-[8px] bg-white/5 border border-white/15">
                        <div className="text-[10.5px] text-slate-300 font-semibold">
                          Kích thước bao
                        </div>
                        <div className="font-mono font-extrabold text-amber-200">
                          {dimsMmText}
                        </div>
                      </div>
                      {(activeAsset.scientificProperties.capacity ||
                        activeAsset.measurementMetadata?.rangeMax) && (
                        <div className="px-2.5 py-1.5 rounded-[8px] bg-white/5 border border-white/15">
                          <div className="text-[10.5px] text-slate-300 font-semibold">
                            Giới hạn đo (GHĐ)
                          </div>
                          <div className="font-mono font-extrabold text-[#7DD3FC]">
                            {
                              (
                                activeAsset.scientificProperties.capacity ||
                                activeAsset.measurementMetadata?.rangeMax
                              )?.value
                            }{' '}
                            {
                              (
                                activeAsset.scientificProperties.capacity ||
                                activeAsset.measurementMetadata?.rangeMax
                              )?.unit
                            }
                          </div>
                        </div>
                      )}
                      {activeAsset.measurementMetadata?.leastCount && (
                        <div className="px-2.5 py-1.5 rounded-[8px] bg-white/5 border border-white/15">
                          <div className="text-[10.5px] text-slate-300 font-semibold">
                            Độ chia nhỏ nhất
                          </div>
                          <div className="font-mono font-extrabold text-amber-300">
                            {activeAsset.measurementMetadata.leastCount.value}{' '}
                            {activeAsset.measurementMetadata.leastCount.unit}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-1 flex items-center gap-2">
                      {onOpenAssetDetailModal && (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenAssetDetailModal(activeAsset, true)
                          }
                          className="flex-1 py-2 px-3 rounded-[9px] bg-amber-500 hover:bg-amber-600 text-slate-950 text-[12px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Sửa thông số kỹ thuật gốc</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSingleAssetScale(1.45);
                          setSingleAssetRotYDeg(0);
                          setSingleAssetTiltZDeg(0);
                          setSingleAssetSimState((prev) => ({
                            ...prev,
                            measuredMassG: 0,
                            springExtensionN: 0,
                            jawOpeningMm: 0,
                            multimeterValue: 0,
                            galvanometerDeflection: 0,
                          }));
                        }}
                        className="py-2 px-2.5 rounded-[9px] bg-white/10 hover:bg-white/20 border border-white/25 text-white text-[12px] font-bold cursor-pointer"
                        title="Đặt lại tỷ lệ, góc xoay và số đo về 0"
                      >
                        Mặc định
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          );
        })()}

        {/* Teacher Mode Telemetry & Extra Layer Toggles — Chỉ hiển thị khi bấm Hiện Thanh Công Cụ */}
        {!isStudentMode && viewMode !== 'single-asset' && isSpatialHeaderVisible && (
          <>
            <div className="absolute top-14 left-3 bg-white/60 backdrop-blur-xl border-[1.5px] border-white/80 rounded-xl px-3 py-2 text-[11.5px] font-mono font-bold text-[#051630] pointer-events-none z-10 space-y-1 shadow-md">
              <div className="flex items-center gap-2 text-[#0B3A7D] font-extrabold">
                <Compass className="w-3.5 h-3.5 text-[#1D63E8]" />
                <span>HỆ QUY CHIẾU: Y-UP · ĐƠN VỊ: MÉT (m)</span>
              </div>
              <div className="flex items-center gap-3 tabular-nums text-[#051630] font-extrabold">
                <span>Góc: {cameraReadout.azimuthDeg}°</span>
                <span>·</span>
                <span>Cao: {cameraReadout.elevationDeg}°</span>
                <span>·</span>
                <span>Cự ly: {cameraReadout.distanceM} m</span>
              </div>
            </div>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/62 backdrop-blur-xl border-[1.5px] border-white/85 rounded-xl px-3 py-1.5 flex items-center gap-1.5 z-20 shadow-lg">
              <button
                type="button"
                onClick={onToggleGrid}
                className={`px-2.5 py-1 text-xs font-extrabold rounded flex items-center gap-1 ${
                  showGrid ? 'bg-[#1D63E8] text-white' : 'text-[#051630] hover:bg-white/60'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Lưới</span>
              </button>
              <button
                type="button"
                onClick={onToggleAxes}
                className={`px-2.5 py-1 text-xs font-extrabold rounded flex items-center gap-1 ${
                  showAxes ? 'bg-[#1D63E8] text-white' : 'text-[#051630] hover:bg-white/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Trục XYZ</span>
              </button>
              <button
                type="button"
                onClick={onToggleLabels}
                className={`px-2.5 py-1 text-xs font-extrabold rounded flex items-center gap-1 ${
                  showLabels ? 'bg-[#1D63E8] text-white' : 'text-[#051630] hover:bg-white/60'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Nhãn</span>
              </button>
              <button
                type="button"
                onClick={onToggleDimensions}
                className={`px-2.5 py-1 text-xs font-extrabold rounded flex items-center gap-1 ${
                  showDimensions ? 'bg-[#1D63E8] text-white' : 'text-[#051630] hover:bg-white/60'
                }`}
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Kích thước</span>
              </button>
              <button
                type="button"
                onClick={handleCaptureSnapshot}
                className="px-2.5 py-1 text-xs font-extrabold text-[#051630] hover:bg-white/60 rounded flex items-center gap-1"
              >
                <Camera className="w-3.5 h-3.5 text-[#1D63E8]" />
                <span>Chụp ảnh</span>
              </button>
            </div>
          </>
        )}

        {/* Selected Object 3D Dimensions Callout HUD — Hidden in single-asset 360° mode so bottom area is 100% clear */}
        {showDimensions && activeAsset && viewMode !== 'single-asset' && isSpatialHeaderVisible && (
          <div className="absolute bottom-3 left-3 bg-white/62 backdrop-blur-xl border-[1.5px] border-[#00BCEB] rounded-[11px] px-3 py-2 text-xs z-10 pointer-events-none text-[#051630] shadow-md">
            <div className="font-extrabold text-[#0B3A7D]">{activeAsset.name.vi}</div>
            <div className="font-mono font-extrabold mt-0.5 tabular-nums text-[#051630]">
              {(activeAsset.geometry.boundingBoxM.width * 1000).toFixed(0)} ×{' '}
              {(activeAsset.geometry.boundingBoxM.height * 1000).toFixed(0)} ×{' '}
              {(activeAsset.geometry.boundingBoxM.depth * 1000).toFixed(0)} mm
            </div>
          </div>
        )}
        {/* Thanh hướng dẫn thao tác nhanh dưới đáy không gian 3D — chỉ hiện khi bấm Hiện Thanh Công Cụ */}
        {viewMode === 'lab-scene' && isSpatialHeaderVisible && (
          <div className="hidden lg:flex absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 pointer-events-none items-center gap-3 px-4 py-1.5 rounded-full bg-[#0F172A]/95 border border-slate-800 text-[11px] text-slate-300 shadow-lg whitespace-nowrap">
            <span>
              <strong className="text-amber-400">Lăn chuột:</strong> Zoom đúng vị trí trỏ chuột
            </span>
            <span className="text-slate-600">•</span>
            <span>
              <strong className="text-sky-400">Kéo vật:</strong> Đặt lên bàn / Kệ gỗ 2 bên / Tủ Trái &amp; Phải
            </span>
            <span className="text-slate-600">•</span>
            <span>
              <strong className="text-emerald-400">Chuột phải:</strong> Bật 2 trục (Nâng cao &amp; Xoay)
            </span>
            <span className="text-slate-600">•</span>
            <span>
              <strong className="text-purple-400">Nhấp đúp vào vật:</strong> Hiện thanh thông tin thiết bị
            </span>
          </div>
        )}
      </div>

      {/* Modal TRANG VẬT PHẨM — TỦ VẬT PHẨM TRÁI / PHẢI (Tủ Trái và Tủ Phải lưu danh sách thiết bị riêng biệt) */}
      {openUnderCabinetModalSide &&
        (() => {
          const sideStoredItems = cabinetStoredItems.filter(
            (item) => item.cabinetZone === openUnderCabinetModalSide,
          );
          const otherSideCount = cabinetStoredItems.filter(
            (item) =>
              item.cabinetZone ===
              (openUnderCabinetModalSide === 'left' ? 'right' : 'left'),
          ).length;
          return (
            <div
              className="fixed inset-0 z-[96] flex items-center justify-center bg-black/75 p-4"
              onClick={() => setOpenUnderCabinetModalSide(null)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-3xl max-h-[85vh] rounded-2xl bg-[#0F172A] border border-amber-500/40 shadow-2xl overflow-hidden flex flex-col text-slate-100"
              >
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <Archive className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {openUnderCabinetModalSide === 'left'
                            ? 'NGĂN TỦ BÊN TRÁI'
                            : 'NGĂN TỦ BÊN PHẢI'}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenUnderCabinetModalSide((s) =>
                              s === 'left' ? 'right' : 'left',
                            )
                          }
                          className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 cursor-pointer"
                        >
                          Xem Tủ {openUnderCabinetModalSide === 'left' ? 'Phải' : 'Trái'} ({otherSideCount} đồ)
                        </button>
                      </div>
                      <h3 className="text-base font-bold text-slate-100 mt-0.5">
                        {openUnderCabinetModalSide === 'left'
                          ? 'TỦ VẬT PHẨM TRÁI'
                          : 'TỦ VẬT PHẨM PHẢI'}{' '}
                        ({sideStoredItems.length} thiết bị đang cất trong tủ này)
                      </h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenUnderCabinetModalSide(null)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="px-5 py-2.5 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUnderCabinetTab('stored')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        underCabinetTab === 'stored'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Đang cất trong Tủ {openUnderCabinetModalSide === 'left' ? 'Trái' : 'Phải'} ({sideStoredItems.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnderCabinetTab('catalog')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        underCabinetTab === 'catalog'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Kho dụng cụ KHTN ({assetsMap.size})
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    Mẹo: Kéo vật thả vào Tủ {openUnderCabinetModalSide === 'left' ? 'Trái' : 'Phải'} trên không gian 3D để cất riêng vào tủ này!
                  </span>
                </div>

                <div className="p-5 overflow-y-auto flex-1">
                  {underCabinetTab === 'stored' ? (
                    sideStoredItems.length === 0 ? (
                      <div className="py-10 text-center space-y-3">
                        <Archive className="w-10 h-10 text-slate-600 mx-auto" />
                        <div className="text-sm font-semibold text-slate-300">
                          Hiện chưa có thiết bị nào được cất trong{' '}
                          {openUnderCabinetModalSide === 'left'
                            ? 'Tủ Vật Phẩm Trái'
                            : 'Tủ Vật Phẩm Phải'}
                        </div>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                          Hãy nhấp và kéo thiết bị trên bàn thả vào{' '}
                          <strong className="text-amber-300">
                            {openUnderCabinetModalSide === 'left'
                              ? 'TỦ VẬT PHẨM TRÁI'
                              : 'TỦ VẬT PHẨM PHẢI'}
                          </strong>{' '}
                          dưới kệ {openUnderCabinetModalSide === 'left' ? 'bên trái' : 'bên phải'} (Tủ Trái và Tủ Phải cất đồ hoàn toàn độc lập)!
                        </p>
                        <button
                          type="button"
                          onClick={() => setUnderCabinetTab('catalog')}
                          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                        >
                          Mở Kho dụng cụ KHTN ({assetsMap.size} thiết bị)
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {sideStoredItems.map((record) => {
                          const asset = assetsMap.get(record.assetId);
                          return (
                            <div
                              key={record.storedId}
                              className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 flex flex-col justify-between gap-3 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                                    {asset && (
                                      <EquipmentThumbnailSvg
                                        archetype={asset.geometry.proceduralArchetype}
                                        assetId={asset.assetId}
                                        className="w-8 h-8"
                                      />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-slate-100 truncate">
                                      {record.title}
                                    </div>
                                    <div className="text-[11px] text-slate-400 truncate">
                                      {asset?.category || 'Thiết bị KHTN'} • Ngăn:{' '}
                                      {record.cabinetZone === 'left'
                                        ? 'Tủ Bên Trái'
                                        : 'Tủ Bên Phải'}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleRestoreItemFromCabinet(
                                      record.storedId,
                                      'main-table',
                                    );
                                    setOpenUnderCabinetModalSide(null);
                                  }}
                                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer transition-colors"
                                >
                                  Đưa Ra Bàn Chính
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleRestoreItemFromCabinet(
                                      record.storedId,
                                      'side-shelf',
                                      openUnderCabinetModalSide,
                                    );
                                    setOpenUnderCabinetModalSide(null);
                                  }}
                                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold cursor-pointer transition-colors"
                                >
                                  Đặt Lên Kệ {openUnderCabinetModalSide === 'left' ? 'Trái' : 'Phải'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from(assetsMap.values()).map((asset) => (
                    <div
                      key={asset.assetId}
                      className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 flex flex-col justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                          <EquipmentThumbnailSvg
                            archetype={asset.geometry.proceduralArchetype}
                            assetId={asset.assetId}
                            className="w-8 h-8"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-100 truncate">
                            {asset.name.vi}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {asset.name.en}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const jitterX = Number(
                              ((Math.random() - 0.5) * 0.48).toFixed(3),
                            );
                            const jitterZ = Number(
                              ((Math.random() - 0.5) * 0.28).toFixed(3),
                            );
                            onDropAssetIntoScene(asset.assetId, [
                              jitterX,
                              0,
                              jitterZ,
                            ]);
                            setOpenUnderCabinetModalSide(null);
                          }}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer transition-colors"
                        >
                          Đưa Ra Bàn Chính
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const sideX =
                              openUnderCabinetModalSide === 'left'
                                ? -1.52
                                : 1.52;
                            const slotZ = Number(
                              ((Math.random() - 0.5) * 0.68).toFixed(3),
                            );
                            onDropAssetIntoScene(asset.assetId, [
                              sideX,
                              0,
                              slotZ,
                            ]);
                            setOpenUnderCabinetModalSide(null);
                          }}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Đặt Lên Kệ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-400">
                Chọn <strong className="text-amber-300">Đưa Ra Bàn Chính</strong> hoặc{' '}
                <strong className="text-amber-300">Đặt Lên Kệ</strong> để bố trí dụng cụ
              </span>
              <button
                type="button"
                onClick={() => setOpenUnderCabinetModalSide(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
          );
        })()}

      {/* Modal Code Thiết Bị (.HTML) — Xem, Copy và Tải xuống mã nguồn mô-đun 3D chuẩn openlan3dmixxx.vercel.app */}
      {isCodeModalOpen &&
        (() => {
          const allAssets = Array.from(assetsMap.values());
          const currentCodeAsset =
            assetsMap.get(selectedCodeAssetId) ??
            activeAsset ??
            allAssets[0] ??
            null;
          const customMod = currentCodeAsset
            ? htmlEquipmentModuleRegistry.getModule(currentCodeAsset.assetId)
            : undefined;
          const standaloneHtmlCode = currentCodeAsset
            ? customMod?.rawHtmlSource ||
              `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>${currentCodeAsset.name.vi} — OpenLab 3D Standalone Equipment Module</title>
</head>
<body>
  <!-- KHỐI 1: MANIFEST ĐỊNH DANH THIẾT BỊ -->
  <script id="ol3d-module-manifest" type="application/json">
${JSON.stringify(
  {
    schemaVersion: '2.3.0',
    moduleId: currentCodeAsset.assetId,
    asset: currentCodeAsset,
  },
  null,
  2,
)}
  </script>

  <!-- KHỐI 4: MÃ NGUỒN DỰNG HÌNH 3D THREE.JS (PROCEDURAL ARCHETYPE: ${currentCodeAsset.geometry.proceduralArchetype}) -->
  <script id="ol3d-module-3d-script" type="text/plain">
// Thiết bị: ${currentCodeAsset.name.vi} (${currentCodeAsset.name.en})
// Kích thước bao (m): ${currentCodeAsset.geometry.boundingBoxM.width} x ${currentCodeAsset.geometry.boundingBoxM.height} x ${currentCodeAsset.geometry.boundingBoxM.depth}
// Điểm neo chuẩn: base-center (y = 0 tại mặt phẳng đặt vật)
function buildEquipmentMesh(THREE, ctx) {
  const root = new THREE.Group();
  root.name = "${currentCodeAsset.assetId}";
  return root;
}
  </script>
</body>
</html>`
            : '';

          return (
            <div
              className="fixed inset-0 z-[96] flex items-center justify-center bg-black/75 p-4"
              onClick={() => setIsCodeModalOpen(false)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-4xl max-h-[86vh] rounded-2xl bg-[#0F172A] border border-indigo-500/40 shadow-2xl overflow-hidden flex flex-col text-slate-100"
              >
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <Code className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">
                        Code Thiết Bị (.HTML) — Mã Nguồn Mô-Đun 3D Độc Lập
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Xem cấu trúc 4 khối chuẩn OpenLab 3D, sao chép hoặc tải file .HTML độc lập của từng vật phẩm
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCodeModalOpen(false)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-300">
                      Chọn thiết bị:
                    </span>
                    <select
                      value={currentCodeAsset?.assetId || ''}
                      onChange={(e) => setSelectedCodeAssetId(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-400"
                    >
                      {allAssets.map((a) => (
                        <option key={a.assetId} value={a.assetId}>
                          {a.name.vi} ({a.assetId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(standaloneHtmlCode);
                        onNotify(
                          `Đã sao chép mã nguồn .HTML của "${currentCodeAsset?.name.vi}".`,
                          'success',
                        );
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Sao Chép Code</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!currentCodeAsset) return;
                        const blob = new Blob([standaloneHtmlCode], {
                          type: 'text/html;charset=utf-8',
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${currentCodeAsset.slug || currentCodeAsset.assetId}.html`;
                        a.click();
                        URL.revokeObjectURL(url);
                        onNotify(
                          `Đã tải xuống file ${currentCodeAsset.slug || currentCodeAsset.assetId}.html`,
                          'success',
                        );
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải File .HTML</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 overflow-y-auto flex-1 bg-slate-950 font-mono text-xs text-emerald-300 leading-relaxed">
                  <pre className="whitespace-pre-wrap break-words">
                    {standaloneHtmlCode}
                  </pre>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Modal Viết Nội Dung Lên Bảng Đen Phòng Thí Nghiệm chuẩn openlan3dmixxx.vercel.app */}
      {isBlackboardModalOpen && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/75 p-4"
          onClick={() => setIsBlackboardModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-[#0F172A] border border-emerald-500/40 shadow-2xl overflow-hidden text-slate-100"
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  Viết Nội Dung Lên Bảng Đen Phòng Thí Nghiệm
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBlackboardModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tiêu đề bài học trên bảng đen:
                </label>
                <input
                  type="text"
                  value={blackboardTitle}
                  onChange={(e) => setBlackboardTitle(e.target.value)}
                  placeholder="Nhập tiêu đề bài thí nghiệm..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nội dung ghi chú / Công thức (tối đa 6 dòng):
                </label>
                <textarea
                  rows={5}
                  value={blackboardNotes}
                  onChange={(e) => setBlackboardNotes(e.target.value)}
                  placeholder="Gõ công thức vật lý, hóa học hoặc các bước tiến hành thí nghiệm..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0f392b] border border-emerald-700/60 text-xs text-amber-200 font-medium leading-relaxed focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Màu phấn viết bảng:</span>
                <div className="flex items-center gap-2">
                  {[
                    { label: 'Phấn Trắng', color: '#f8fafc' },
                    { label: 'Phấn Vàng', color: '#fde047' },
                    { label: 'Phấn Xanh Lam', color: '#7dd3fc' },
                    { label: 'Phấn Xanh Lá', color: '#86efac' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setBlackboardColor(c.color)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold border cursor-pointer ${
                        blackboardColor === c.color
                          ? 'border-white scale-105 shadow-sm'
                          : 'border-slate-700 opacity-75'
                      }`}
                      style={{ backgroundColor: '#1e293b', color: c.color }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-900/60">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setBlackboardTitle('');
                    setBlackboardNotes('');
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                >
                  Xóa trắng bảng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBlackboardTitle('PHÒNG THÍ NGHIỆM KHOA HỌC TỰ NHIÊN 3D');
                    setBlackboardNotes(
                      '• Công thức Khối lượng riêng: D = m / V (g/cm³)\n• Lực đẩy Archimedes: FA = d . V\n• Nhấp vào bảng đen này để viết ghi chú bài học...',
                    );
                    setBlackboardColor('#fde047');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Khôi phục mặc định
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsBlackboardModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white cursor-pointer"
              >
                Lưu Lên Bảng Đen 3D
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Quản Trị Môi Trường Phòng Thí Nghiệm 3D (OL3D-LAB-ENVIRONMENT-SPEC v2.0) */}
      {showEnvSpecModal && (
        <LabEnvironmentSpecModal
          onClose={() => setShowEnvSpecModal(false)}
          roomConfig={DEFAULT_LAB_ROOM_CONFIG}
          coordSettings={coordSettings}
          onUpdateCoordSettings={handleUpdateCoordSettings}
          envVars={envVars}
          onUpdateEnvVar={handleUpdateEnvVar}
          onResetEnvVars={handleResetEnvVars}
          graphicsSettings={graphicsSettings}
          onUpdateGraphicsSettings={handleUpdateGraphicsSettings}
          clockState={clockState}
          onSimClockAction={handleSimClockAction}
          onSimClockSpeed={handleSimClockSpeed}
          eventLogs={eventLogs}
          selectedInstance={activeInstance}
          selectedAsset={activeAsset ?? null}
          instances={instances}
          assetsMap={assetsMap}
          inspectedWorldPoint={
            customCalibrationPoint
              ? {
                  label: customCalibrationPoint.label,
                  worldM: customCalibrationPoint.worldM,
                  localBenchM: [
                    customCalibrationPoint.worldM[0],
                    Number(
                      (
                        customCalibrationPoint.worldM[1] - BENCH_SURFACE_Y
                      ).toFixed(3),
                    ),
                    customCalibrationPoint.worldM[2],
                  ],
                }
              : activeInstance
                ? {
                    label:
                      activeInstance.customLabel ||
                      activeAsset?.name.vi ||
                      activeInstance.assetId,
                    worldM: [
                      Number(activeInstance.transform.positionM[0].toFixed(3)),
                      Number(
                        (
                          BENCH_SURFACE_Y + activeInstance.transform.positionM[1]
                        ).toFixed(3),
                      ),
                      Number(activeInstance.transform.positionM[2].toFixed(3)),
                    ],
                    localBenchM: [
                      Number(activeInstance.transform.positionM[0].toFixed(3)),
                      Number(activeInstance.transform.positionM[1].toFixed(3)),
                      Number(activeInstance.transform.positionM[2].toFixed(3)),
                    ],
                  }
                : {
                    label: 'Gốc O (0, 0, 0) — Tâm sàn phòng',
                    worldM: [0, 0, 0],
                    localBenchM: [0, -BENCH_SURFACE_Y, 0],
                  }
          }
          onSelectCalibrationPoint={(label, worldM) => {
            setCustomCalibrationPoint({ label, worldM });
            appendLabEventLog(
              'COORD_INSPECT',
              `Kiểm tra tọa độ chuẩn "${label}": World (${worldM.join(', ')}) m.`,
              { label, worldM },
            );
          }}
          distancePointA={distancePointA}
          distancePointB={distancePointB}
          onSetDistancePointA={setDistancePointA}
          onSetDistancePointB={setDistancePointB}
          onFocusCameraPreset={handleFocusCameraPreset}
        />
      )}

      {/* Modal Xem Lại & Xuất Video Tóm Tắt Quá Trình Thực Hành 3D */}
      {showVideoRecorderModal && completedRecordingSession && (
        <LabVideoRecorderModal
          session={completedRecordingSession}
          onClose={() => setShowVideoRecorderModal(false)}
          onUpdateMilestoneTitle={(milestoneId, newTitle) => {
            setCompletedRecordingSession((prev) =>
              prev
                ? {
                    ...prev,
                    milestones: prev.milestones.map((m) =>
                      m.id === milestoneId ? { ...m, title: newTitle } : m,
                    ),
                  }
                : null,
            );
          }}
          onDeleteMilestone={(milestoneId) => {
            setCompletedRecordingSession((prev) =>
              prev
                ? {
                    ...prev,
                    milestones: prev.milestones
                      .filter((m) => m.id !== milestoneId)
                      .map((m, idx) => ({ ...m, stepNumber: idx + 1 })),
                  }
                : null,
            );
          }}
          onSaveSummaryVideoToSession={(blob, url) => {
            setCompletedRecordingSession((prev) =>
              prev
                ? {
                    ...prev,
                    summaryVideoBlob: blob,
                    summaryVideoUrl: url,
                  }
                : null,
            );
          }}
          onStartNewRecording={handleStartVideoRecording}
          onNotify={onNotify}
        />
      )}
    </div>
  );
};
