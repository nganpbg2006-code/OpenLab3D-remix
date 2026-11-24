import * as THREE from 'three';
import { SceneInstance } from '../domain/types';

/**
 * OPENLAB 3D — BỘ THÍ NGHIỆM THÀNH PHẦN THỂ TÍCH OXYGEN TRONG KHÔNG KHÍ 3D
 * Chuẩn SGK KHTN 6 (Kết nối tri thức / Chân trời sáng tạo / Cánh diều):
 * - Chậu thủy tinh Borosilicate chứa nước chỉ thị màu (Xanh lam / Đỏ cánh sen)
 * - Nến Parafin gắn trên đế sứ trung tâm (hoặc chế độ Phốt pho đỏ: 4P + 5O₂ → 2P₂O₅)
 * - Ống thủy tinh chia 5 phần thể tích bằng nhau (vạch 0, 1, 2, 3, 4, 5 — mỗi vạch = 20% V)
 * - Trụ giá dẫn hướng thép phay trượt mượt khi nhấc lên / úp xuống chậu nước
 * - Động học 60FPS: Ngọn lửa bập bùng & yếu dần khi O₂ cạn, khói trắng / P₂O₅,
 *   áp suất trong ống giảm đẩy cột nước kèm mặt khum lõm (meniscus) & bọt khí dâng lên vạch 1 (~21% O₂)
 * - Chế độ X-Ray phân tử khí 3D (O₂ đỏ 21% bị tiêu thụ dần, N₂ xanh 78% & khí khác 1% giữ nguyên)
 * - Màn hình LCD kỹ thuật số gắn đế hiển thị %O₂, %N₂, mực nước và pha thí nghiệm theo thời gian thực
 */

export type OxygenFuelType = 'candle' | 'phosphorus';
export type OxygenWaterTint = 'blue' | 'red';
export type OxygenExperimentPhase =
  | 'ready'
  | 'lit-open'
  | 'covering'
  | 'burning'
  | 'extinguishing'
  | 'rising-water'
  | 'completed';

export interface OxygenLiveTelemetry {
  progress: number; // 0..1
  o2Percent: number; // 21.0 -> ~0.2
  n2Percent: number; // ~78.0
  otherGasPercent: number; // ~1.0
  waterLevelDivisions: number; // 0.00 -> ~1.05 (on 0..5 scale, 1 division = 20%)
  waterRisePercent: number; // 0.0 -> ~21.0%
  flameIntensity: number; // 0..1
  phase: OxygenExperimentPhase;
  phaseLabelVi: string;
}

const liveTelemetryRegistry = new Map<string, OxygenLiveTelemetry>();

export function getOxygenLiveTelemetry(
  instanceId: string,
): OxygenLiveTelemetry | undefined {
  return liveTelemetryRegistry.get(instanceId);
}

// Reusable scratch objects to keep render loop allocation-free
const _tempColor = new THREE.Color();

function createCanvasTex(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  transparent = false,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    if (!transparent) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
    }
    draw(ctx, width, height);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function createSoftSmokeTexture(): THREE.CanvasTexture {
  return createCanvasTex(
    128,
    128,
    (ctx, w, h) => {
      const grad = ctx.createRadialGradient(
        w * 0.5,
        h * 0.5,
        w * 0.05,
        w * 0.5,
        h * 0.5,
        w * 0.48,
      );
      grad.addColorStop(0, 'rgba(248, 250, 252, 0.92)');
      grad.addColorStop(0.42, 'rgba(226, 232, 240, 0.52)');
      grad.addColorStop(0.75, 'rgba(203, 213, 225, 0.16)');
      grad.addColorStop(1, 'rgba(203, 213, 225, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    },
    true,
  );
}

/**
 * High-contrast 360° graduation scale texture for the bell tube (marks 0 → 5).
 * Mark 0 sits near the bottom water seal; Mark 5 sits at the top of the cylindrical air column.
 */
function createGraduationScaleTexture(): THREE.CanvasTexture {
  return createCanvasTex(
    1024,
    512,
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);

      // Vertical margins inside cylinder UV space:
      // yBottom (mark 0) at 86% of canvas height, yTop (mark 5) at 12% of canvas height
      const yMark0 = h * 0.86;
      const yMark5 = h * 0.12;
      const span = yMark0 - yMark5;

      // Subtle frosted graduation strip on front & back faces (x = 0.25 & 0.75 in cylinder UV)
      const stripCenters = [w * 0.25, w * 0.75];

      // Full-circumference thin horizontal rings at marks 0..5 so reading is crisp from any 360° angle
      for (let div = 0; div <= 5; div++) {
        const y = yMark0 - (div / 5) * span;
        const isTargetMark1 = div === 1;

        ctx.strokeStyle = isTargetMark1
          ? 'rgba(251, 191, 36, 0.95)'
          : div === 0
            ? 'rgba(56, 189, 248, 0.9)'
            : 'rgba(248, 250, 252, 0.82)';
        ctx.lineWidth = isTargetMark1 ? 5.5 : div === 0 ? 4.5 : 3.2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();

        // Dark hairline shadow below white tick for legibility against bright backgrounds
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(0, y + 3.2);
        ctx.lineTo(w, y + 3.2);
        ctx.stroke();
      }

      // Draw detailed rulers & labels on both front & rear sides
      for (const cx of stripCenters) {
        // Vertical backbone line
        ctx.strokeStyle = 'rgba(248, 250, 252, 0.75)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx - 48, yMark5);
        ctx.lineTo(cx - 48, yMark0);
        ctx.stroke();

        // Sub-ticks (5 sub-divisions per major mark => 4% volume each)
        for (let step = 0; step <= 25; step++) {
          const y = yMark0 - (step / 25) * span;
          const isMajor = step % 5 === 0;
          const tickLen = isMajor ? 42 : 20;
          ctx.strokeStyle =
            step === 5
              ? '#fbbf24'
              : isMajor
                ? '#ffffff'
                : 'rgba(226, 232, 240, 0.72)';
          ctx.lineWidth = isMajor ? 4 : 2;
          ctx.beginPath();
          ctx.moveTo(cx - 48, y);
          ctx.lineTo(cx - 48 + tickLen, y);
          ctx.stroke();
        }

        // Major numeral badges (0, 1, 2, 3, 4, 5)
        for (let div = 0; div <= 5; div++) {
          const y = yMark0 - (div / 5) * span;
          const labelX = cx + 10;

          // Pill backdrop for maximum contrast
          ctx.fillStyle =
            div === 1
              ? 'rgba(180, 83, 9, 0.88)'
              : 'rgba(15, 23, 42, 0.72)';
          ctx.beginPath();
          ctx.roundRect(labelX - 10, y - 16, div === 1 ? 128 : 54, 32, 8);
          ctx.fill();

          ctx.strokeStyle =
            div === 1 ? 'rgba(251, 191, 36, 0.95)' : 'rgba(148, 163, 184, 0.5)';
          ctx.lineWidth = 1.8;
          ctx.stroke();

          ctx.font = 'bold 22px ui-monospace, SFMono-Regular, monospace';
          ctx.fillStyle = div === 1 ? '#fef08a' : '#f8fafc';
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'left';
          ctx.fillText(div === 1 ? '1 (≈20%)' : String(div), labelX, y + 1);
        }

        // Top engraved glass stamp
        ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = 'rgba(241, 245, 249, 0.92)';
        ctx.textAlign = 'center';
        ctx.fillText('ỐNG CHIA 5 PHẦN · V(O₂)', cx + 12, h * 0.055);
      }
    },
    true,
  );
}

interface MoleculeParticle {
  group: THREE.Group;
  kind: 'o2' | 'n2' | 'ar';
  baseAngle: number;
  baseRadius: number;
  baseHeightFrac: number; // 0..1 within air column
  phase: number;
  speed: number;
  consumeThreshold: number; // progress threshold at which this O2 molecule gets consumed
}

interface SmokePuff {
  sprite: THREE.Sprite;
  age: number;
  maxAge: number;
  vx: number;
  vy: number;
  vz: number;
  baseScale: number;
}

interface BubbleParticle {
  mesh: THREE.Mesh;
  angle: number;
  radius: number;
  phase: number;
  speed: number;
}

interface OxygenAirRig {
  // Movable sub-assemblies
  tubeAssembly: THREE.Group;
  tubeRestY: number;
  tubeLoweredY: number;
  tubeCurrentY: number;
  tubeCurrentX: number;

  // Fuel assemblies
  candleGroup: THREE.Group;
  phosphorusGroup: THREE.Group;
  candleWaxMesh: THREE.Mesh;
  phosphorusMoundMat: THREE.MeshStandardMaterial;

  // Flame rig
  flameGroup: THREE.Group;
  flameOuter: THREE.Mesh;
  flameMid: THREE.Mesh;
  flameCore: THREE.Mesh;
  flameGlowSprite: THREE.Sprite;

  // Water meshes
  troughWaterMesh: THREE.Mesh;
  troughWaterSurface: THREE.Mesh;
  troughWaterMat: THREE.MeshPhysicalMaterial;
  tubeWaterMesh: THREE.Mesh;
  tubeMeniscusRing: THREE.Mesh;
  tubeWaterMat: THREE.MeshPhysicalMaterial;
  tubeMeniscusMat: THREE.MeshStandardMaterial;

  // Dynamic particles
  smokePuffs: SmokePuff[];
  bubbles: BubbleParticle[];
  moleculesGroup: THREE.Group;
  molecules: MoleculeParticle[];

  // Live digital LCD console
  lcdCanvas: HTMLCanvasElement;
  lcdCtx: CanvasRenderingContext2D | null;
  lcdTex: THREE.CanvasTexture;
  lastLcdKey: string;
  lastLcdRedrawAt: number;

  // Simulation runtime state
  simProgress: number; // 0..1
  smoothProgress: number; // 0..1 damped
  smoothFlame: number; // 0..1 damped
  lastRunToken: number;
  currentFuel: OxygenFuelType;
  currentTint: OxygenWaterTint;
}

// Geometry layout constants (1 unit = 1 meter, grounded at y = 0)
const BASE_HEIGHT = 0.016;
const TROUGH_BOTTOM_Y = BASE_HEIGHT;
const TROUGH_OUTER_R = 0.088;
const TROUGH_INNER_R = 0.083;
const TROUGH_HEIGHT = 0.064;
const WATER_INITIAL_LEVEL_Y = TROUGH_BOTTOM_Y + 0.036; // 3.6 cm water depth in trough

// Center pedestal & candle top
const PEDESTAL_TOP_Y = TROUGH_BOTTOM_Y + 0.044;
const CANDLE_HEIGHT = 0.036;
const FLAME_ORIGIN_Y_CANDLE = PEDESTAL_TOP_Y + CANDLE_HEIGHT + 0.008;
const FLAME_ORIGIN_Y_PHOSPHORUS = PEDESTAL_TOP_Y + 0.024;

// Graduated Glass Bell Tube (5 equal air divisions from mark 0 to mark 5)
const TUBE_OUTER_R = 0.043;
const TUBE_INNER_R = 0.0402;
const TUBE_HEIGHT = 0.215;
// When lowered, tube mouth sits at TROUGH_BOTTOM_Y + 0.009 (well submerged under water seal!)
const TUBE_LOWERED_Y = TROUGH_BOTTOM_Y + 0.009;
// When raised, tube slides smoothly up along the stainless steel guide post
const TUBE_RAISED_Y = TROUGH_BOTTOM_Y + 0.145;

// Graduation marks local Y inside tubeAssembly (measured from tube mouth y=0):
// Mark 0 aligns exactly with WATER_INITIAL_LEVEL_Y when lowered:
const MARK_0_LOCAL_Y = WATER_INITIAL_LEVEL_Y - TUBE_LOWERED_Y; // ~0.027 m above mouth
const MARK_5_LOCAL_Y = TUBE_HEIGHT - 0.024; // ~0.191 m above mouth
const AIR_COLUMN_SPAN_M = MARK_5_LOCAL_Y - MARK_0_LOCAL_Y; // ~0.164 m = 5 divisions

function computeTelemetryFromState(
  progress: number,
  flameLit: boolean,
  tubeLowered: boolean,
  fuel: OxygenFuelType,
): OxygenLiveTelemetry {
  const p = THREE.MathUtils.clamp(progress, 0, 1);

  // Target final oxygen consumption:
  // Red phosphorus consumes virtually all O₂ (~21.0% -> 1.05 divisions)
  // Candle consumes ~20.4% -> ~1.02 divisions (classic KHTN 6: ~1/5 thể tích không khí)
  const maxConsumedPct = fuel === 'phosphorus' ? 21.0 : 20.5;

  if (!tubeLowered) {
    return {
      progress: 0,
      o2Percent: 21.0,
      n2Percent: 78.0,
      otherGasPercent: 1.0,
      waterLevelDivisions: 0,
      waterRisePercent: 0,
      flameIntensity: flameLit ? 1 : 0,
      phase: flameLit ? 'lit-open' : 'ready',
      phaseLabelVi: flameLit
        ? 'Đang cháy ngoài không khí · Sẵn sàng úp ống'
        : 'Sẵn sàng · Bước 1: Đốt nến / P đỏ',
    };
  }

  // Tube is lowered!
  if (!flameLit && p < 0.01) {
    return {
      progress: 0,
      o2Percent: 21.0,
      n2Percent: 78.0,
      otherGasPercent: 1.0,
      waterLevelDivisions: 0,
      waterRisePercent: 0,
      flameIntensity: 0,
      phase: 'ready',
      phaseLabelVi: 'Ống đã úp (chưa châm lửa) · Mực nước ở vạch 0',
    };
  }

  // Curve 1: Oxygen depletion occurs mostly during combustion phase (p: 0.08 -> 0.68)
  const burnT = THREE.MathUtils.smoothstep(p, 0.06, 0.68);
  const consumedPct = maxConsumedPct * burnT;
  const o2Left = Math.max(0.0, 21.0 - consumedPct);

  // Curve 2: Flame intensity stays strong up to p=0.42, weakens 0.42->0.66, extinguishes at 0.66
  let flameIntensity = 0;
  if (p < 0.66) {
    flameIntensity = 1.0 - THREE.MathUtils.smoothstep(p, 0.36, 0.66);
  }

  // Curve 3: Water rise lags slightly behind initial thermal expansion, then rises smoothly
  // from p=0.22 -> 0.96 as O₂ is consumed & gas cools (p_inside < p_atm)
  const riseT = THREE.MathUtils.smoothstep(p, 0.2, 0.96);
  const waterRisePercent = maxConsumedPct * riseT;
  const waterLevelDivisions = waterRisePercent / 20.0; // 5 divisions = 100%, 1 division = 20%

  let phase: OxygenExperimentPhase = 'burning';
  let phaseLabelVi = 'Đang cháy trong ống kín · Tiêu thụ O₂';

  if (p < 0.1) {
    phase = 'covering';
    phaseLabelVi = 'Đang úp ống chia vạch · Bịt kín cột khí';
  } else if (p < 0.48) {
    phase = 'burning';
    phaseLabelVi =
      fuel === 'phosphorus'
        ? 'Phốt pho đỏ cháy sáng tạo khói trắng P₂O₅'
        : 'Nến cháy trong ống kín · Lượng O₂ đang giảm dần';
  } else if (p < 0.68) {
    phase = 'extinguishing';
    phaseLabelVi = 'O₂ sắp hết · Ngọn lửa yếu dần rồi tắt hẳn';
  } else if (p < 0.96) {
    phase = 'rising-water';
    phaseLabelVi = 'Khí nguội & giảm áp suất · Nước dâng lên vạch 1';
  } else {
    phase = 'completed';
    phaseLabelVi = `Hoàn tất: Nước dâng ≈ 1/5 cột khí (~${waterRisePercent.toFixed(1)}% O₂)`;
  }

  return {
    progress: p,
    o2Percent: o2Left,
    n2Percent: 78.0,
    otherGasPercent: 1.0,
    waterLevelDivisions,
    waterRisePercent,
    flameIntensity,
    phase,
    phaseLabelVi,
  };
}

function redrawLcdConsole(
  rig: OxygenAirRig,
  telemetry: OxygenLiveTelemetry,
  fuel: OxygenFuelType,
): void {
  const ctx = rig.lcdCtx;
  if (!ctx) return;
  const w = rig.lcdCanvas.width;
  const h = rig.lcdCanvas.height;

  // Deep instrument background
  ctx.fillStyle = '#07111f';
  ctx.fillRect(0, 0, w, h);

  // Subtle top accent stripe
  const headerGrad = ctx.createLinearGradient(0, 0, w, 0);
  headerGrad.addColorStop(0, '#0284c7');
  headerGrad.addColorStop(0.5, '#0ea5e9');
  headerGrad.addColorStop(1, '#10b981');
  ctx.fillStyle = headerGrad;
  ctx.fillRect(0, 0, w, 8);

  // Header title
  ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#bae6fd';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(
    fuel === 'phosphorus'
      ? 'ĐO THÀNH PHẦN O₂ (P ĐỎ)'
      : 'ĐO THÀNH PHẦN O₂ (NẾN KHTN 6)',
    16,
    18,
  );

  // Status badge on top right
  const isDone = telemetry.phase === 'completed';
  ctx.fillStyle = isDone ? 'rgba(16,185,129,0.25)' : 'rgba(56,189,248,0.22)';
  ctx.beginPath();
  ctx.roundRect(w - 140, 14, 126, 28, 6);
  ctx.fill();
  ctx.font = 'bold 14px ui-monospace, monospace';
  ctx.fillStyle = isDone ? '#6ee7b7' : '#7dd3fc';
  ctx.textAlign = 'center';
  ctx.fillText(
    isDone ? 'HOÀN TẤT ≈1/5' : `${Math.round(telemetry.progress * 100)}% TIẾN ĐỘ`,
    w - 77,
    21,
  );

  // 3 big KPI boxes
  const boxY = 56;
  const boxH = 88;
  const gap = 12;
  const boxW = (w - 32 - gap * 2) / 3;

  const drawKpi = (
    idx: number,
    title: string,
    val: string,
    sub: string,
    accent: string,
  ) => {
    const x = 16 + idx * (boxW + gap);
    ctx.fillStyle = '#0f1e33';
    ctx.beginPath();
    ctx.roundRect(x, boxY, boxW, boxH, 10);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText(title, x + 10, boxY + 10);

    ctx.font = 'bold 28px ui-monospace, SFMono-Regular, monospace';
    ctx.fillStyle = accent;
    ctx.fillText(val, x + 10, boxY + 32);

    ctx.font = '12px system-ui, sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(sub, x + 10, boxY + 66);
  };

  drawKpi(
    0,
    'O₂ CÒN TRONG ỐNG',
    `${telemetry.o2Percent.toFixed(1)}%`,
    'Ban đầu: 21,0%',
    '#f87171',
  );
  drawKpi(
    1,
    'MỰC NƯỚC DÂNG',
    `${telemetry.waterLevelDivisions.toFixed(2)}/5`,
    `≈ ${telemetry.waterRisePercent.toFixed(1)}% V khí`,
    '#38bdf8',
  );
  drawKpi(
    2,
    'N₂ & KHÍ KHÁC',
    '79,0%',
    '78% N₂ · 1% khác',
    '#34d399',
  );

  // Stacked composition bar (Visualizing 1/5 O2 + 4/5 N2)
  const barX = 16;
  const barY = 160;
  const barW = w - 32;
  const barH = 22;
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 6);
  ctx.fill();

  const waterFrac = THREE.MathUtils.clamp(telemetry.waterRisePercent / 100, 0, 0.25);
  const o2Frac = THREE.MathUtils.clamp(telemetry.o2Percent / 100, 0, 0.25);

  // Water displaced section (Blue = consumed O2)
  if (waterFrac > 0.002) {
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(barX, barY, barW * waterFrac, barH);
  }
  // Remaining O2 section (Red)
  if (o2Frac > 0.002) {
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(barX + barW * waterFrac, barY, barW * o2Frac, barH);
  }
  // N2 + other gases (Emerald/Teal)
  const gasStart = Math.min(1, waterFrac + o2Frac);
  ctx.fillStyle = '#10b981';
  ctx.fillRect(barX + barW * gasStart, barY, barW * (1 - gasStart), barH);

  // 1/5 marker tick on bar
  const oneFifthX = barX + barW * 0.21;
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(oneFifthX, barY - 4);
  ctx.lineTo(oneFifthX, barY + barH + 4);
  ctx.stroke();

  // Bottom phase strip
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillStyle = isDone ? '#fde047' : '#e2e8f0';
  ctx.textAlign = 'left';
  ctx.fillText(telemetry.phaseLabelVi, 16, 198);

  rig.lcdTex.needsUpdate = true;
}

function getWaterColors(tint: OxygenWaterTint): {
  color: number;
  attenuation: number;
  meniscus: number;
} {
  if (tint === 'red') {
    return {
      color: 0xe11d48,
      attenuation: 0xbe123c,
      meniscus: 0xfda4af,
    };
  }
  return {
    color: 0x0ea5e9,
    attenuation: 0x0369a1,
    meniscus: 0x7dd3fc,
  };
}

/**
 * Build the complete 3D PBR procedural apparatus for:
 * "Thành phần thể tích Oxygen trong không khí"
 * Pivot: base-center (y = 0)
 */
export function buildOxygenAirVolumeModel(isSoftwareGl = false): THREE.Group {
  const root = new THREE.Group();
  root.name = 'oxygen_air_volume_apparatus';

  // Shared PBR Materials (clear roughness/metalness contrast across adjacent parts)
  const basePlateMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.42,
    metalness: 0.55,
  });
  const baseTrimMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.24,
    metalness: 0.86,
  });
  const rubberMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.9,
    metalness: 0.05,
  });
  const brushedSteelMat = new THREE.MeshStandardMaterial({
    color: 0xdbe4ee,
    roughness: 0.22,
    metalness: 0.9,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd4a017,
    roughness: 0.25,
    metalness: 0.88,
  });
  const ceramicMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.28,
    metalness: 0.04,
  });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xeef8ff,
    roughness: 0.06,
    metalness: 0.0,
    transmission: isSoftwareGl ? 0 : 0.88,
    transparent: true,
    opacity: isSoftwareGl ? 0.32 : 0.96,
    ior: 1.48,
    thickness: 0.008,
    reflectivity: 0.9,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  // ------------------------------------------------------------------
  // 1. ANODIZED LAB PLATFORM + 4 RUBBER FEET + ANGLED DIGITAL LCD CONSOLE
  // ------------------------------------------------------------------
  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'body';
  root.add(bodyGroup);

  const baseW = 0.275;
  const baseD = 0.215;
  const basePlate = new THREE.Mesh(
    new THREE.BoxGeometry(baseW, BASE_HEIGHT, baseD),
    basePlateMat,
  );
  basePlate.position.set(0.015, BASE_HEIGHT * 0.5, 0);
  basePlate.castShadow = true;
  basePlate.receiveShadow = true;
  bodyGroup.add(basePlate);

  // Top metallic trim bevel frame
  const trimFrame = new THREE.Mesh(
    new THREE.BoxGeometry(baseW + 0.004, 0.003, baseD + 0.004),
    baseTrimMat,
  );
  trimFrame.position.set(0.015, BASE_HEIGHT - 0.001, 0);
  bodyGroup.add(trimFrame);

  // 4 rubber leveling feet
  const footGeo = new THREE.CylinderGeometry(0.008, 0.009, 0.004, 16);
  const footCoords: Array<[number, number]> = [
    [-baseW * 0.44 + 0.015, -baseD * 0.42],
    [baseW * 0.44 + 0.015, -baseD * 0.42],
    [-baseW * 0.44 + 0.015, baseD * 0.42],
    [baseW * 0.44 + 0.015, baseD * 0.42],
  ];
  for (const [fx, fz] of footCoords) {
    const foot = new THREE.Mesh(footGeo, rubberMat);
    foot.position.set(fx, 0.002, fz);
    bodyGroup.add(foot);
  }

  // Angled LCD Telemetry Console on the right side of the base
  const consoleGroup = new THREE.Group();
  consoleGroup.name = 'scale_display';
  consoleGroup.position.set(0.118, BASE_HEIGHT + 0.025, 0.048);
  consoleGroup.rotation.y = -0.34;
  root.add(consoleGroup);

  const consoleHousing = new THREE.Mesh(
    new THREE.BoxGeometry(0.098, 0.056, 0.032),
    basePlateMat,
  );
  consoleHousing.rotation.x = -0.36;
  consoleHousing.castShadow = true;
  consoleGroup.add(consoleHousing);

  const consoleBezel = new THREE.Mesh(
    new THREE.BoxGeometry(0.092, 0.049, 0.004),
    baseTrimMat,
  );
  consoleBezel.position.set(0, 0.001, 0.0155);
  consoleBezel.rotation.x = -0.36;
  consoleGroup.add(consoleBezel);

  const lcdCanvas = document.createElement('canvas');
  lcdCanvas.width = 512;
  lcdCanvas.height = 240;
  const lcdCtx = lcdCanvas.getContext('2d');
  const lcdTex = new THREE.CanvasTexture(lcdCanvas);
  lcdTex.colorSpace = THREE.SRGBColorSpace;
  lcdTex.anisotropy = 8;

  const lcdMat = new THREE.MeshBasicMaterial({
    map: lcdTex,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  lcdMat.userData = { ownsTexture: true };
  const lcdScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.086, 0.042), lcdMat);
  lcdScreen.position.set(0, 0.0018, 0.0182);
  lcdScreen.rotation.x = -0.36;
  consoleGroup.add(lcdScreen);

  // ------------------------------------------------------------------
  // 2. GLASS WATER TROUGH (CHẬU THỦY TINH ĐỰNG NƯỚC CHỈ THỊ)
  // ------------------------------------------------------------------
  const troughX = -0.022;
  const troughGroup = new THREE.Group();
  troughGroup.position.set(troughX, 0, 0);
  root.add(troughGroup);

  // Rubber mat cushion under the glass trough
  const matPad = new THREE.Mesh(
    new THREE.CylinderGeometry(TROUGH_OUTER_R + 0.004, TROUGH_OUTER_R + 0.006, 0.003, 40),
    rubberMat,
  );
  matPad.position.y = BASE_HEIGHT + 0.0015;
  troughGroup.add(matPad);

  // Glass trough wall via LatheGeometry (bottom disc + outer/inner flared lip)
  const troughProfile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(TROUGH_OUTER_R - 0.004, 0.0),
    new THREE.Vector2(TROUGH_OUTER_R, 0.005),
    new THREE.Vector2(TROUGH_OUTER_R, TROUGH_HEIGHT - 0.004),
    new THREE.Vector2(TROUGH_OUTER_R + 0.0035, TROUGH_HEIGHT),
    new THREE.Vector2(TROUGH_INNER_R, TROUGH_HEIGHT),
    new THREE.Vector2(TROUGH_INNER_R, 0.0045),
    new THREE.Vector2(0.0, 0.0045),
  ];
  const troughMesh = new THREE.Mesh(
    new THREE.LatheGeometry(troughProfile, 48),
    glassMat,
  );
  troughMesh.position.y = TROUGH_BOTTOM_Y;
  troughMesh.renderOrder = 10;
  troughGroup.add(troughMesh);

  // Specular rim highlight ring on trough mouth
  const troughRim = new THREE.Mesh(
    new THREE.TorusGeometry(TROUGH_OUTER_R + 0.001, 0.0015, 10, 48),
    new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.65,
    }),
  );
  troughRim.rotation.x = Math.PI / 2;
  troughRim.position.y = TROUGH_BOTTOM_Y + TROUGH_HEIGHT;
  troughRim.renderOrder = 11;
  troughGroup.add(troughRim);

  // Trough water volume
  const initWaterCols = getWaterColors('blue');
  const troughWaterMat = new THREE.MeshPhysicalMaterial({
    color: initWaterCols.color,
    roughness: 0.08,
    metalness: 0.0,
    transmission: isSoftwareGl ? 0 : 0.55,
    transparent: true,
    opacity: isSoftwareGl ? 0.52 : 0.72,
    ior: 1.333,
    attenuationColor: new THREE.Color(initWaterCols.attenuation),
    attenuationDistance: 0.14,
    depthWrite: false,
  });

  const waterBaseH = WATER_INITIAL_LEVEL_Y - (TROUGH_BOTTOM_Y + 0.005);
  const troughWaterGeo = new THREE.CylinderGeometry(
    TROUGH_INNER_R - 0.0015,
    TROUGH_INNER_R - 0.0015,
    1.0,
    40,
  );
  troughWaterGeo.translate(0, 0.5, 0);
  const troughWaterMesh = new THREE.Mesh(troughWaterGeo, troughWaterMat);
  troughWaterMesh.position.y = TROUGH_BOTTOM_Y + 0.005;
  troughWaterMesh.scale.y = waterBaseH;
  troughWaterMesh.renderOrder = 4;
  troughGroup.add(troughWaterMesh);

  const troughWaterSurface = new THREE.Mesh(
    new THREE.CircleGeometry(TROUGH_INNER_R - 0.0016, 40),
    new THREE.MeshStandardMaterial({
      color: initWaterCols.meniscus,
      roughness: 0.12,
      metalness: 0.15,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    }),
  );
  troughWaterSurface.rotation.x = -Math.PI / 2;
  troughWaterSurface.position.y = WATER_INITIAL_LEVEL_Y + 0.0004;
  troughWaterSurface.renderOrder = 5;
  troughGroup.add(troughWaterSurface);

  // ------------------------------------------------------------------
  // 3. CENTRAL CERAMIC PEDESTAL + CANDLE / RED PHOSPHORUS COMBUSTION STAGE
  // ------------------------------------------------------------------
  const pedestalProfile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.024, 0.0),
    new THREE.Vector2(0.022, 0.008),
    new THREE.Vector2(0.011, 0.014),
    new THREE.Vector2(0.011, 0.032),
    new THREE.Vector2(0.021, 0.038),
    new THREE.Vector2(0.021, 0.044),
    new THREE.Vector2(0.0, 0.044),
  ];
  const pedestal = new THREE.Mesh(
    new THREE.LatheGeometry(pedestalProfile, 32),
    ceramicMat,
  );
  pedestal.position.y = TROUGH_BOTTOM_Y + 0.0045;
  pedestal.castShadow = true;
  pedestal.receiveShadow = true;
  troughGroup.add(pedestal);

  // Mode A: Paraffin Candle (SGK KHTN 6 default)
  const candleGroup = new THREE.Group();
  candleGroup.position.y = PEDESTAL_TOP_Y;
  troughGroup.add(candleGroup);

  const brassHolder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0135, 0.015, 0.006, 24),
    brassMat,
  );
  brassHolder.position.y = 0.003;
  candleGroup.add(brassHolder);

  const candleWaxMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    roughness: 0.58,
    metalness: 0.02,
    emissive: 0x451a03,
    emissiveIntensity: 0.1,
  });
  const candleWaxGeo = new THREE.CylinderGeometry(0.0092, 0.0098, CANDLE_HEIGHT, 24);
  candleWaxGeo.translate(0, CANDLE_HEIGHT * 0.5, 0);
  const candleWaxMesh = new THREE.Mesh(candleWaxGeo, candleWaxMat);
  candleWaxMesh.position.y = 0.004;
  candleWaxMesh.castShadow = true;
  candleGroup.add(candleWaxMesh);

  // Melted wax rim cup on top of candle
  const waxRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.0078, 0.0018, 10, 24),
    candleWaxMat,
  );
  waxRim.rotation.x = Math.PI / 2;
  waxRim.position.y = CANDLE_HEIGHT + 0.0035;
  candleGroup.add(waxRim);

  // Charred cotton wick
  const wick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0009, 0.0011, 0.0085, 8),
    new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.95 }),
  );
  wick.position.y = CANDLE_HEIGHT + 0.006;
  candleGroup.add(wick);

  // Mode B: Red Phosphorus Porcelain Combustion Dish (4P + 5O₂ -> 2P₂O₅)
  const phosphorusGroup = new THREE.Group();
  phosphorusGroup.position.y = PEDESTAL_TOP_Y;
  phosphorusGroup.visible = false;
  troughGroup.add(phosphorusGroup);

  const dishProfile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.015, 0.002),
    new THREE.Vector2(0.022, 0.014),
    new THREE.Vector2(0.02, 0.015),
    new THREE.Vector2(0.013, 0.005),
    new THREE.Vector2(0.0, 0.004),
  ];
  const porcelainDish = new THREE.Mesh(
    new THREE.LatheGeometry(dishProfile, 28),
    ceramicMat,
  );
  phosphorusGroup.add(porcelainDish);

  const phosphorusMoundMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b,
    roughness: 0.85,
    metalness: 0.05,
    emissive: 0xff4500,
    emissiveIntensity: 0.0,
  });
  const phosphorusMound = new THREE.Mesh(
    new THREE.SphereGeometry(0.0105, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.58),
    phosphorusMoundMat,
  );
  phosphorusMound.scale.set(1.15, 0.72, 1.15);
  phosphorusMound.position.y = 0.004;
  phosphorusGroup.add(phosphorusMound);

  // ------------------------------------------------------------------
  // 4. MULTI-LAYER VOLUMETRIC FLAME + HALO GLOW
  // ------------------------------------------------------------------
  const flameGroup = new THREE.Group();
  flameGroup.position.set(0, FLAME_ORIGIN_Y_CANDLE, 0);
  troughGroup.add(flameGroup);

  // Teardrop lathe profile for realistic candle flame
  const flameProfile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.0042, 0.003),
    new THREE.Vector2(0.0056, 0.0085),
    new THREE.Vector2(0.0042, 0.016),
    new THREE.Vector2(0.0018, 0.023),
    new THREE.Vector2(0.0, 0.0285),
  ];
  const flameOuterGeo = new THREE.LatheGeometry(flameProfile, 18);

  const flameOuter = new THREE.Mesh(
    flameOuterGeo,
    new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.76,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  flameOuter.renderOrder = 14;
  flameGroup.add(flameOuter);

  const flameMid = new THREE.Mesh(
    flameOuterGeo,
    new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  flameMid.scale.set(0.66, 0.76, 0.66);
  flameMid.position.y = 0.001;
  flameMid.renderOrder = 15;
  flameGroup.add(flameMid);

  const flameCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.0032, 14, 12),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  flameCore.scale.set(0.95, 1.45, 0.95);
  flameCore.position.y = 0.0032;
  flameCore.renderOrder = 16;
  flameGroup.add(flameCore);

  const flameGlowTex = createCanvasTex(
    128,
    128,
    (ctx, w, h) => {
      const grad = ctx.createRadialGradient(
        w * 0.5,
        h * 0.5,
        2,
        w * 0.5,
        h * 0.5,
        w * 0.5,
      );
      grad.addColorStop(0, 'rgba(255, 237, 160, 0.9)');
      grad.addColorStop(0.35, 'rgba(251, 146, 60, 0.42)');
      grad.addColorStop(1, 'rgba(249, 115, 22, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    },
    true,
  );
  const flameGlowMat = new THREE.SpriteMaterial({
    map: flameGlowTex,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  flameGlowMat.userData = { ownsTexture: true };
  const flameGlowSprite = new THREE.Sprite(flameGlowMat);
  flameGlowSprite.scale.set(0.048, 0.058, 1);
  flameGlowSprite.position.y = 0.013;
  flameGlowSprite.renderOrder = 13;
  flameGroup.add(flameGlowSprite);
  flameGroup.userData.nonPickable = true;
  flameGroup.traverse((child) => {
    child.userData.nonPickable = true;
    child.raycast = () => {};
  });

  // ------------------------------------------------------------------
  // 5. VERTICAL GUIDE STAND (GIÁ ĐỠ TRƯỢT ỐNG THỦY TINH)
  // ------------------------------------------------------------------
  const standX = -0.118;
  const standFoot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.021, 0.012, 24),
    brassMat,
  );
  standFoot.position.set(standX, BASE_HEIGHT + 0.006, 0);
  bodyGroup.add(standFoot);

  const guideRod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0045, 0.0045, 0.365, 20),
    brushedSteelMat,
  );
  guideRod.position.set(standX, BASE_HEIGHT + 0.188, 0);
  guideRod.castShadow = true;
  bodyGroup.add(guideRod);

  const rodCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.0062, 16, 12),
    brassMat,
  );
  rodCap.position.set(standX, BASE_HEIGHT + 0.371, 0);
  bodyGroup.add(rodCap);

  // ------------------------------------------------------------------
  // 6. GRADUATED BELL TUBE ASSEMBLY (ỐNG THỦY TINH CHIA 5 VẠCH 0–5)
  // ------------------------------------------------------------------
  const tubeAssembly = new THREE.Group();
  tubeAssembly.name = 'graduated_bell_tube';
  tubeAssembly.position.set(troughX, TUBE_RAISED_Y, 0);
  root.add(tubeAssembly);

  // Sliding clamp collar connecting tube top to the vertical steel guide rod
  const clampCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0095, 0.0095, 0.022, 20),
    basePlateMat,
  );
  clampCollar.position.set(standX - troughX, TUBE_HEIGHT - 0.02, 0);
  tubeAssembly.add(clampCollar);

  const clampKnob = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.006, 0.014, 16),
    brassMat,
  );
  clampKnob.rotation.z = Math.PI / 2;
  clampKnob.position.set(standX - troughX - 0.014, TUBE_HEIGHT - 0.02, 0);
  tubeAssembly.add(clampKnob);

  const clampArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0032, 0.0032, Math.abs(standX - troughX) - TUBE_OUTER_R + 0.006, 14),
    brushedSteelMat,
  );
  clampArm.rotation.z = Math.PI / 2;
  clampArm.position.set(
    (standX - troughX - TUBE_OUTER_R) * 0.5,
    TUBE_HEIGHT - 0.02,
    0,
  );
  tubeAssembly.add(clampArm);

  const tubeClampRing = new THREE.Mesh(
    new THREE.TorusGeometry(TUBE_OUTER_R + 0.0025, 0.0032, 12, 40),
    baseTrimMat,
  );
  tubeClampRing.rotation.x = Math.PI / 2;
  tubeClampRing.position.y = TUBE_HEIGHT - 0.02;
  tubeAssembly.add(tubeClampRing);

  // Glass Bell Tube body (open bottom, sealed flat/domed top + glass knob stopper)
  const tubeProfile = [
    new THREE.Vector2(TUBE_INNER_R, 0.0),
    new THREE.Vector2(TUBE_OUTER_R + 0.0022, 0.0),
    new THREE.Vector2(TUBE_OUTER_R, 0.005),
    new THREE.Vector2(TUBE_OUTER_R, TUBE_HEIGHT - 0.012),
    new THREE.Vector2(TUBE_OUTER_R - 0.007, TUBE_HEIGHT),
    new THREE.Vector2(0.014, TUBE_HEIGHT),
    new THREE.Vector2(0.014, TUBE_HEIGHT + 0.014),
    new THREE.Vector2(0.0, TUBE_HEIGHT + 0.014),
  ];
  const bellTubeMesh = new THREE.Mesh(
    new THREE.LatheGeometry(tubeProfile, 48),
    glassMat,
  );
  bellTubeMesh.renderOrder = 11;
  tubeAssembly.add(bellTubeMesh);

  // Rubber stopper on top neck of bell jar (authentic lab glassware look)
  const topStopper = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0145, 0.0122, 0.022, 24),
    new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.78,
      metalness: 0.05,
    }),
  );
  topStopper.position.y = TUBE_HEIGHT + 0.016;
  tubeAssembly.add(topStopper);

  // Graduation Scale Sleeve (0 → 5 marks wrapped outside glass tube)
  const scaleTex = createGraduationScaleTexture();
  const scaleMat = new THREE.MeshBasicMaterial({
    map: scaleTex,
    transparent: true,
    opacity: 0.98,
    side: THREE.DoubleSide,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  scaleMat.userData = { ownsTexture: true };

  // Cylinder height & Y offset aligned so UV yMark0 (0.86 from top => 0.14 from bottom) = MARK_0_LOCAL_Y
  // and UV yMark5 (0.12 from top => 0.88 from bottom) = MARK_5_LOCAL_Y
  // span in UV = 0.74 => full sleeve height = AIR_COLUMN_SPAN_M / 0.74
  const sleeveH = AIR_COLUMN_SPAN_M / 0.74;
  const sleeveBottomY = MARK_0_LOCAL_Y - sleeveH * 0.14;
  const scaleSleeve = new THREE.Mesh(
    new THREE.CylinderGeometry(
      TUBE_OUTER_R + 0.0008,
      TUBE_OUTER_R + 0.0008,
      sleeveH,
      48,
      1,
      true,
    ),
    scaleMat,
  );
  scaleSleeve.name = 'scale_marks';
  scaleSleeve.position.y = sleeveBottomY + sleeveH * 0.5;
  scaleSleeve.renderOrder = 12;
  tubeAssembly.add(scaleSleeve);

  // ------------------------------------------------------------------
  // 7. RISING WATER COLUMN + MENISCUS INSIDE THE BELL TUBE
  // ------------------------------------------------------------------
  const tubeWaterMat = new THREE.MeshPhysicalMaterial({
    color: initWaterCols.color,
    roughness: 0.08,
    metalness: 0.0,
    transmission: isSoftwareGl ? 0 : 0.45,
    transparent: true,
    opacity: isSoftwareGl ? 0.62 : 0.82,
    ior: 1.333,
    attenuationColor: new THREE.Color(initWaterCols.attenuation),
    attenuationDistance: 0.1,
    depthWrite: false,
  });

  const tubeWaterGeo = new THREE.CylinderGeometry(
    TUBE_INNER_R - 0.0012,
    TUBE_INNER_R - 0.0012,
    1.0,
    36,
  );
  tubeWaterGeo.translate(0, 0.5, 0);
  const tubeWaterMesh = new THREE.Mesh(tubeWaterGeo, tubeWaterMat);
  tubeWaterMesh.name = 'liquid_surface';
  tubeWaterMesh.position.y = 0.001;
  tubeWaterMesh.scale.y = 0.001;
  tubeWaterMesh.visible = false;
  tubeWaterMesh.renderOrder = 6;
  tubeAssembly.add(tubeWaterMesh);

  // Crisp glowing meniscus rim ring at top of the rising water column
  const tubeMeniscusMat = new THREE.MeshStandardMaterial({
    color: initWaterCols.meniscus,
    emissive: initWaterCols.color,
    emissiveIntensity: 0.35,
    roughness: 0.14,
    metalness: 0.15,
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
  });
  const tubeMeniscusRing = new THREE.Mesh(
    new THREE.TorusGeometry(TUBE_INNER_R - 0.0022, 0.0016, 10, 36),
    tubeMeniscusMat,
  );
  tubeMeniscusRing.rotation.x = Math.PI / 2;
  tubeMeniscusRing.visible = false;
  tubeMeniscusRing.renderOrder = 8;
  tubeAssembly.add(tubeMeniscusRing);

  // ------------------------------------------------------------------
  // 8. SMOKE / P₂O₅ VAPOR PUFFS & MICRO-BUBBLES
  // ------------------------------------------------------------------
  const smokeTex = createSoftSmokeTexture();
  const smokePuffs: SmokePuff[] = [];
  for (let i = 0; i < 14; i++) {
    const sMat = new THREE.SpriteMaterial({
      map: smokeTex,
      color: 0xf8fafc,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    if (i === 0) sMat.userData = { ownsTexture: true };
    const sprite = new THREE.Sprite(sMat);
    sprite.renderOrder = 9;
    sprite.userData.nonPickable = true;
    sprite.raycast = () => {};
    troughGroup.add(sprite);
    smokePuffs.push({
      sprite,
      age: (i / 14) * 2.2,
      maxAge: 1.8 + (i % 4) * 0.35,
      vx: ((i % 5) - 2) * 0.003,
      vy: 0.032 + (i % 3) * 0.008,
      vz: (((i + 2) % 5) - 2) * 0.003,
      baseScale: 0.018 + (i % 4) * 0.005,
    });
  }

  const bubbles: BubbleParticle[] = [];
  const bubbleGeo = new THREE.SphereGeometry(0.0018, 10, 8);
  const bubbleMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    roughness: 0.08,
    metalness: 0.1,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
  });
  for (let i = 0; i < 12; i++) {
    const bMesh = new THREE.Mesh(bubbleGeo, bubbleMat);
    bMesh.visible = false;
    bMesh.renderOrder = 7;
    bMesh.userData.nonPickable = true;
    bMesh.raycast = () => {};
    tubeAssembly.add(bMesh);
    bubbles.push({
      mesh: bMesh,
      angle: (i / 12) * Math.PI * 2,
      radius: TUBE_INNER_R * (0.45 + (i % 4) * 0.12),
      phase: i * 0.73,
      speed: 0.9 + (i % 3) * 0.35,
    });
  }

  // ------------------------------------------------------------------
  // 9. 3D GAS MOLECULES OVERLAY (O₂ RED ~21% · N₂ BLUE ~78% · Ar AMBER ~1%)
  // ------------------------------------------------------------------
  const moleculesGroup = new THREE.Group();
  moleculesGroup.visible = false;
  moleculesGroup.userData.nonPickable = true;
  tubeAssembly.add(moleculesGroup);

  const atomGeo = new THREE.SphereGeometry(0.003, 10, 8);
  const o2Mat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0x991b1b,
    emissiveIntensity: 0.45,
    roughness: 0.25,
  });
  const n2Mat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x075985,
    emissiveIntensity: 0.35,
    roughness: 0.28,
    transparent: true,
    opacity: 0.82,
  });
  const arMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0x854d0e,
    emissiveIntensity: 0.4,
    roughness: 0.3,
  });

  const molecules: MoleculeParticle[] = [];
  // 6 O₂ (21%) + 21 N₂ (75%) + 1 Ar/CO₂ (4%) = 28 crisp diatomic / monoatomic molecules
  const totalSpecs: Array<{ kind: 'o2' | 'n2' | 'ar'; consumeAt: number }> = [
    ...Array.from({ length: 6 }, (_, idx) => ({
      kind: 'o2' as const,
      consumeAt: 0.14 + idx * 0.095,
    })),
    ...Array.from({ length: 21 }, () => ({
      kind: 'n2' as const,
      consumeAt: 2.0,
    })),
    { kind: 'ar' as const, consumeAt: 2.0 },
  ];

  totalSpecs.forEach((spec, idx) => {
    const mGroup = new THREE.Group();
    if (spec.kind === 'ar') {
      const a = new THREE.Mesh(atomGeo, arMat);
      a.scale.setScalar(1.15);
      mGroup.add(a);
    } else {
      const mat = spec.kind === 'o2' ? o2Mat : n2Mat;
      const a1 = new THREE.Mesh(atomGeo, mat);
      const a2 = new THREE.Mesh(atomGeo, mat);
      a1.position.x = -0.0021;
      a2.position.x = 0.0021;
      mGroup.add(a1, a2);
    }
    moleculesGroup.add(mGroup);

    const golden = idx * 2.39996;
    molecules.push({
      group: mGroup,
      kind: spec.kind,
      baseAngle: golden,
      baseRadius: 0.008 + ((idx * 17) % 100) / 100 * (TUBE_INNER_R - 0.015),
      baseHeightFrac: 0.08 + ((idx * 31) % 88) / 100,
      phase: idx * 1.17,
      speed: 1.15 + (idx % 5) * 0.28,
      consumeThreshold: spec.consumeAt,
    });
  });

  // ------------------------------------------------------------------
  // 10. INITIALIZE RIG & DEFAULT VISUAL STATE
  // ------------------------------------------------------------------
  const rig: OxygenAirRig = {
    tubeAssembly,
    tubeRestY: TUBE_RAISED_Y,
    tubeLoweredY: TUBE_LOWERED_Y,
    tubeCurrentY: TUBE_RAISED_Y,
    tubeCurrentX: troughX,

    candleGroup,
    phosphorusGroup,
    candleWaxMesh,
    phosphorusMoundMat,

    flameGroup,
    flameOuter,
    flameMid,
    flameCore,
    flameGlowSprite,

    troughWaterMesh,
    troughWaterSurface,
    troughWaterMat,
    tubeWaterMesh,
    tubeMeniscusRing,
    tubeWaterMat,
    tubeMeniscusMat,

    smokePuffs,
    bubbles,
    moleculesGroup,
    molecules,

    lcdCanvas,
    lcdCtx,
    lcdTex,
    lastLcdKey: '',
    lastLcdRedrawAt: 0,

    simProgress: 0,
    smoothProgress: 0,
    smoothFlame: 1,
    lastRunToken: 0,
    currentFuel: 'candle',
    currentTint: 'blue',
  };

  root.userData.__oxygenAirRig = rig;

  // Draw crisp initial LCD screen right away so preview thumbnails look razor-sharp
  const initTelemetry = computeTelemetryFromState(0, true, false, 'candle');
  redrawLcdConsole(rig, initTelemetry, 'candle');

  return root;
}

function findRig(root: THREE.Object3D): OxygenAirRig | undefined {
  if (root.userData?.__oxygenAirRig) {
    return root.userData.__oxygenAirRig as OxygenAirRig;
  }
  for (const child of root.children) {
    if (child.userData?.__oxygenAirRig) {
      return child.userData.__oxygenAirRig as OxygenAirRig;
    }
  }
  return undefined;
}

/**
 * Apply discrete state switches immediately (fuel mode, water tint, molecules visibility, reset/seek).
 */
export function applyOxygenAirVolumeState(
  instanceRoot: THREE.Object3D,
  instance: SceneInstance,
): void {
  const rig = findRig(instanceRoot);
  if (!rig) return;

  const st = instance.instanceState;
  const fuel: OxygenFuelType = st.oxygenFuelType ?? 'candle';
  const tint: OxygenWaterTint = st.oxygenWaterTint ?? 'blue';
  const flameLit = st.oxygenFlameLit !== false;
  const tubeLowered = Boolean(st.oxygenTubeLowered);
  const showMolecules = Boolean(st.oxygenShowMolecules);
  const runToken = st.oxygenRunToken ?? 0;

  // Fuel type switch
  if (rig.currentFuel !== fuel) {
    rig.currentFuel = fuel;
    rig.candleGroup.visible = fuel === 'candle';
    rig.phosphorusGroup.visible = fuel === 'phosphorus';
    rig.flameGroup.position.y =
      fuel === 'phosphorus' ? FLAME_ORIGIN_Y_PHOSPHORUS : FLAME_ORIGIN_Y_CANDLE;
  }

  // Water tint switch
  if (rig.currentTint !== tint) {
    rig.currentTint = tint;
    const cols = getWaterColors(tint);
    rig.troughWaterMat.color.setHex(cols.color);
    rig.troughWaterMat.attenuationColor.setHex(cols.attenuation);
    rig.tubeWaterMat.color.setHex(cols.color);
    rig.tubeWaterMat.attenuationColor.setHex(cols.attenuation);
    rig.tubeMeniscusMat.color.setHex(cols.meniscus);
    rig.tubeMeniscusMat.emissive.setHex(cols.color);
    (rig.troughWaterSurface.material as THREE.MeshStandardMaterial).color.setHex(
      cols.meniscus,
    );
  }

  rig.moleculesGroup.visible = showMolecules;

  // Reset progress when tube is lifted back up or runToken is explicitly bumped
  if (!tubeLowered) {
    rig.simProgress = 0;
  } else if (runToken !== rig.lastRunToken) {
    rig.lastRunToken = runToken;
    rig.simProgress = 0;
  }

  // If user manually scrubbed the progress slider, honor exact value
  if (typeof st.oxygenManualProgress === 'number') {
    rig.simProgress = THREE.MathUtils.clamp(st.oxygenManualProgress, 0, 1);
  }

  const telemetry = computeTelemetryFromState(
    rig.simProgress,
    flameLit,
    tubeLowered,
    fuel,
  );
  liveTelemetryRegistry.set(instance.instanceId, telemetry);
  redrawLcdConsole(rig, telemetry, fuel);
}

/**
 * Smooth 60FPS kinematic + physics stepper called from LabViewport3D animation loop.
 * Returns true whenever continuous frames are needed (flame burning, tube gliding, water rising, particles active).
 */
export function stepOxygenAirVolumeAnimation(
  instanceRoot: THREE.Object3D,
  instance: SceneInstance,
  dt: number,
  elapsedSec: number,
): boolean {
  const rig = findRig(instanceRoot);
  if (!rig) return false;

  const safeDt = Math.min(Math.max(dt, 0.001), 0.05);
  const st = instance.instanceState;
  const fuel: OxygenFuelType = st.oxygenFuelType ?? 'candle';
  const flameLit = st.oxygenFlameLit !== false;
  const tubeLowered = Boolean(st.oxygenTubeLowered);
  const showMolecules = Boolean(st.oxygenShowMolecules);
  const isManualScrub = typeof st.oxygenManualProgress === 'number';
  const autoPlay = st.oxygenAutoPlay !== false;

  // 1. Advance real-time combustion & water-rise progression (~11.5 seconds total)
  let needsMoreFrames = false;

  if (!tubeLowered) {
    rig.simProgress = 0;
  } else if (isManualScrub) {
    rig.simProgress = THREE.MathUtils.clamp(st.oxygenManualProgress!, 0, 1);
  } else if (flameLit && autoPlay && rig.simProgress < 1) {
    // Wait briefly until tube has mostly lowered before burning through O₂
    const tubeDescendFrac = THREE.MathUtils.clamp(
      (rig.tubeRestY - rig.tubeCurrentY) / (rig.tubeRestY - rig.tubeLoweredY),
      0,
      1,
    );
    if (tubeDescendFrac > 0.72) {
      rig.simProgress = Math.min(1, rig.simProgress + safeDt / 11.5);
    }
    needsMoreFrames = true;
  }

  // Smooth exponential damping for visual progression & tube glide
  rig.smoothProgress = THREE.MathUtils.damp(
    rig.smoothProgress,
    rig.simProgress,
    7.5,
    safeDt,
  );
  if (Math.abs(rig.smoothProgress - rig.simProgress) > 0.0008) {
    needsMoreFrames = true;
  }

  const targetTubeY = tubeLowered ? rig.tubeLoweredY : rig.tubeRestY;
  rig.tubeCurrentY = THREE.MathUtils.damp(
    rig.tubeCurrentY,
    targetTubeY,
    6.5,
    safeDt,
  );
  rig.tubeAssembly.position.y = rig.tubeCurrentY;
  if (Math.abs(rig.tubeCurrentY - targetTubeY) > 0.0004) {
    needsMoreFrames = true;
  }

  // 2. Compute live scientific telemetry
  const telemetry = computeTelemetryFromState(
    rig.smoothProgress,
    flameLit,
    tubeLowered,
    fuel,
  );
  liveTelemetryRegistry.set(instance.instanceId, telemetry);

  // 3. Animate Flame (organic multi-sine flicker + shrinks & extinguishes as O₂ runs out)
  rig.smoothFlame = THREE.MathUtils.damp(
    rig.smoothFlame,
    telemetry.flameIntensity,
    9.0,
    safeDt,
  );
  const fInt = rig.smoothFlame;
  rig.flameGroup.visible = fInt > 0.02;

  if (fInt > 0.02) {
    needsMoreFrames = true;
    const flick1 = Math.sin(elapsedSec * 16.5) * 0.07;
    const flick2 = Math.sin(elapsedSec * 29.3 + 1.4) * 0.05;
    const swayX = Math.sin(elapsedSec * 11.2) * 0.06 * fInt;
    const swayZ = Math.cos(elapsedSec * 9.7) * 0.05 * fInt;

    const fuelBoost = fuel === 'phosphorus' ? 1.28 : 1.0;
    const sXZ = (0.45 + 0.55 * fInt) * fuelBoost * (1 + flick1 * 0.6);
    const sY = (0.35 + 0.65 * fInt) * fuelBoost * (1 + flick1 + flick2);

    rig.flameGroup.scale.set(sXZ, sY, sXZ);
    rig.flameGroup.rotation.set(swayZ, 0, swayX);

    // Phosphorus burns bright incandescent yellow-white; candle burns warm amber-orange
    if (fuel === 'phosphorus') {
      _tempColor.setHex(0xfef08a);
      (rig.flameOuter.material as THREE.MeshBasicMaterial).color.copy(_tempColor);
      rig.phosphorusMoundMat.emissiveIntensity = 0.9 * fInt;
    } else {
      _tempColor.setHex(0xf97316);
      (rig.flameOuter.material as THREE.MeshBasicMaterial).color.copy(_tempColor);
      rig.phosphorusMoundMat.emissiveIntensity = 0;
    }

    (rig.flameGlowSprite.material as THREE.SpriteMaterial).opacity =
      0.85 * fInt * (0.9 + flick2);
  } else {
    rig.phosphorusMoundMat.emissiveIntensity = 0;
  }

  // Slight candle wax melting realism during combustion
  if (fuel === 'candle') {
    const meltScale = 1 - rig.smoothProgress * 0.06;
    rig.candleWaxMesh.scale.y = meltScale;
    rig.flameGroup.position.y =
      PEDESTAL_TOP_Y + CANDLE_HEIGHT * meltScale + 0.008;
  } else {
    rig.flameGroup.position.y = FLAME_ORIGIN_Y_PHOSPHORUS;
  }

  // 4. Animate Rising Water Column inside Tube + Conservation Drop in Outer Trough
  const tubeDescendFrac = THREE.MathUtils.clamp(
    (rig.tubeRestY - rig.tubeCurrentY) / (rig.tubeRestY - rig.tubeLoweredY),
    0,
    1,
  );

  // Water rise height above Mark 0 (1/5 of AIR_COLUMN_SPAN_M ≈ 3.45 cm)
  const waterRiseM = (telemetry.waterRisePercent / 100) * AIR_COLUMN_SPAN_M;

  // Conservation of liquid volume: Δh_trough = Δh_tube * (r_tube² / (r_trough² - r_tube²))
  const areaRatio =
    (TUBE_INNER_R * TUBE_INNER_R) /
    (TROUGH_INNER_R * TROUGH_INNER_R - TUBE_INNER_R * TUBE_INNER_R);
  const troughDropM = waterRiseM * areaRatio * tubeDescendFrac;
  const curTroughWaterY = WATER_INITIAL_LEVEL_Y - troughDropM;
  const curTroughWaterH = Math.max(
    0.008,
    curTroughWaterY - (TROUGH_BOTTOM_Y + 0.005),
  );
  rig.troughWaterMesh.scale.y = curTroughWaterH;
  rig.troughWaterSurface.position.y = curTroughWaterY + 0.0004;

  // Water inside bell tube is visible once its mouth dips below trough water surface
  const tubeMouthWorldY = rig.tubeCurrentY;
  const submergedDepthM = curTroughWaterY - tubeMouthWorldY;
  const totalTubeWaterH = submergedDepthM + waterRiseM * tubeDescendFrac;

  if (totalTubeWaterH > 0.002) {
    rig.tubeWaterMesh.visible = true;
    rig.tubeWaterMesh.scale.y = totalTubeWaterH;
    rig.tubeMeniscusRing.visible = true;
    rig.tubeMeniscusRing.position.y = totalTubeWaterH + 0.0012;
  } else {
    rig.tubeWaterMesh.visible = false;
    rig.tubeMeniscusRing.visible = false;
  }

  // 5. Animate Smoke / P₂O₅ White Vapor Cloud
  const isExtinguishPlume =
    tubeLowered && flameLit && rig.smoothProgress > 0.56 && rig.smoothProgress < 0.94;
  const isPhosphorusCloud =
    fuel === 'phosphorus' && tubeLowered && flameLit && rig.smoothProgress > 0.08 && rig.smoothProgress < 0.92;
  const smokeStrength = isPhosphorusCloud
    ? 0.78 * (1 - THREE.MathUtils.smoothstep(rig.smoothProgress, 0.74, 0.92))
    : isExtinguishPlume
      ? 0.45 * (1 - THREE.MathUtils.smoothstep(rig.smoothProgress, 0.76, 0.94))
      : 0;

  if (smokeStrength > 0.01) {
    needsMoreFrames = true;
  }

  const smokeOriginY = rig.flameGroup.position.y + 0.012;
  const maxSmokeY = rig.tubeCurrentY + TUBE_HEIGHT - 0.022;

  for (let i = 0; i < rig.smokePuffs.length; i++) {
    const puff = rig.smokePuffs[i];
    const mat = puff.sprite.material as THREE.SpriteMaterial;
    if (smokeStrength <= 0.01) {
      mat.opacity = 0;
      puff.sprite.visible = false;
      continue;
    }

    puff.age += safeDt;
    if (puff.age >= puff.maxAge) {
      puff.age -= puff.maxAge;
    }
    const t = puff.age / puff.maxAge;
    const py = Math.min(maxSmokeY, smokeOriginY + t * 0.11);
    const swirlR = (0.004 + t * 0.019) * (fuel === 'phosphorus' ? 1.25 : 0.75);
    const ang = elapsedSec * 1.4 + i * 1.1;

    puff.sprite.visible = true;
    puff.sprite.position.set(
      Math.cos(ang) * swirlR,
      py,
      Math.sin(ang) * swirlR,
    );
    const scale =
      puff.baseScale * (0.7 + t * 1.55) * (fuel === 'phosphorus' ? 1.35 : 0.85);
    puff.sprite.scale.set(scale, scale, 1);
    mat.opacity = Math.sin(t * Math.PI) * smokeStrength * 0.62;
  }

  // 6. Animate Rising Micro-Bubbles while Water Column Climbs
  const bubblesActive =
    tubeLowered &&
    flameLit &&
    rig.smoothProgress > 0.18 &&
    rig.smoothProgress < 0.96 &&
    totalTubeWaterH > 0.012;

  for (let i = 0; i < rig.bubbles.length; i++) {
    const b = rig.bubbles[i];
    if (!bubblesActive) {
      b.mesh.visible = false;
      continue;
    }
    needsMoreFrames = true;
    const cycle = (elapsedSec * b.speed + b.phase) % 1;
    const by = 0.004 + cycle * Math.max(0.006, totalTubeWaterH - 0.006);
    const wobble = Math.sin(elapsedSec * 6 + b.phase) * 0.0018;
    b.mesh.visible = true;
    b.mesh.position.set(
      Math.cos(b.angle) * b.radius + wobble,
      by,
      Math.sin(b.angle) * b.radius - wobble,
    );
    const bs = 0.55 + 0.55 * Math.sin(cycle * Math.PI);
    b.mesh.scale.setScalar(bs);
  }

  // 7. Animate 3D Gas Molecules (O₂ Red consumed one-by-one; N₂ Blue remains trapped in upper 4/5!)
  rig.moleculesGroup.visible = showMolecules;
  if (showMolecules) {
    needsMoreFrames = true;
    const gasBottomY = Math.max(MARK_0_LOCAL_Y, totalTubeWaterH + 0.008);
    const gasTopY = MARK_5_LOCAL_Y - 0.006;
    const gasSpanY = Math.max(0.03, gasTopY - gasBottomY);

    for (let i = 0; i < rig.molecules.length; i++) {
      const m = rig.molecules[i];
      if (m.kind === 'o2' && tubeLowered && flameLit) {
        const consumedFade =
          1 -
          THREE.MathUtils.smoothstep(
            rig.smoothProgress,
            m.consumeThreshold - 0.06,
            m.consumeThreshold + 0.04,
          );
        if (consumedFade <= 0.02) {
          m.group.visible = false;
          continue;
        }
        m.group.visible = true;
        m.group.scale.setScalar(consumedFade);
      } else {
        m.group.visible = true;
        m.group.scale.setScalar(1);
      }

      const ang = m.baseAngle + elapsedSec * 0.65 * m.speed;
      const rad = m.baseRadius * (0.85 + 0.15 * Math.sin(elapsedSec * 1.8 + m.phase));
      const yFrac =
        (m.baseHeightFrac + 0.06 * Math.sin(elapsedSec * 1.3 * m.speed + m.phase)) % 1;
      const my = gasBottomY + THREE.MathUtils.clamp(yFrac, 0.04, 0.96) * gasSpanY;

      m.group.position.set(Math.cos(ang) * rad, my, Math.sin(ang) * rad);
      m.group.rotation.set(
        elapsedSec * 1.4 + m.phase,
        elapsedSec * 1.9 + m.baseAngle,
        0,
      );
    }
  }

  // 8. Throttled LCD Console Redraw (~8 Hz max for silky performance)
  const lcdKey = `${fuel}|${telemetry.phase}|${telemetry.o2Percent.toFixed(1)}|${telemetry.waterLevelDivisions.toFixed(2)}`;
  if (
    lcdKey !== rig.lastLcdKey &&
    elapsedSec - rig.lastLcdRedrawAt > 0.11
  ) {
    rig.lastLcdKey = lcdKey;
    rig.lastLcdRedrawAt = elapsedSec;
    redrawLcdConsole(rig, telemetry, fuel);
  }

  return needsMoreFrames;
}

/**
 * Projected 3D label badge & hint for LabViewport3D
 */
export function getOxygenAirVolumeLabelInfo(inst: SceneInstance): {
  readoutBadge: string;
  isDigitalScale: boolean;
  interactionHint: string;
} {
  const st = inst.instanceState;
  const fuel: OxygenFuelType = st.oxygenFuelType ?? 'candle';
  const flameLit = st.oxygenFlameLit !== false;
  const tubeLowered = Boolean(st.oxygenTubeLowered);

  const live =
    liveTelemetryRegistry.get(inst.instanceId) ??
    computeTelemetryFromState(
      st.oxygenManualProgress ?? 0,
      flameLit,
      tubeLowered,
      fuel,
    );

  const fuelTag = fuel === 'phosphorus' ? 'P đỏ' : 'Nến';
  return {
    readoutBadge: `${fuelTag} · O₂: ${live.o2Percent.toFixed(1)}% · Nước: ${live.waterLevelDivisions.toFixed(2)}/5 vạch (~${live.waterRisePercent.toFixed(0)}%)`,
    isDigitalScale: true,
    interactionHint:
      'Thí nghiệm KHTN 6: Bật lửa đốt nến (hoặc Phốt pho đỏ), bấm Úp ống thủy tinh chia 5 vạch và quan sát ngọn lửa tắt dần, nước dâng lên vạch 1 (≈ 1/5 thể tích không khí ≈ 21% O₂).',
  };
}
