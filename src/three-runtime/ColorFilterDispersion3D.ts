import * as THREE from 'three';
import { SceneInstance } from '../domain/types';

/**
 * OPENLAB 3D — BỘ THÍ NGHIỆM LỌC MÀU & TÁN SẮC ÁNH SÁNG 3D
 * Mô phỏng trực quan quang học KHTN 9:
 * - Nguồn sáng trắng khe hẹp (Collimated White Light Slit Lamp)
 * - Lăng kính thủy tinh quang học (Flint Glass Prism, n ≈ 1.65) xoay được góc tới (25°–65°)
 * - Tấm lọc màu quang học (Không lọc, Đỏ, Lục, Lam, Vàng, Lơ, Hồng tím) trượt linh hoạt TRƯỚC hoặc SAU lăng kính
 * - Chùm tia sáng phẳng thể tích (Ribbon Beams) + 7 dải cầu vồng Đỏ–Cam–Vàng–Lục–Lam–Chàm–Tím
 * - Màn hứng quang phổ 360° hiển thị bước sóng (400–700 nm), vùng truyền qua & vùng bị hấp thụ
 */

export type OpticalFilterId =
  | 'none'
  | 'red'
  | 'green'
  | 'blue'
  | 'yellow'
  | 'cyan'
  | 'magenta';

export type OpticalFilterPosition = 'after-prism' | 'before-prism';

export interface SpectrumBandSpec {
  id: string;
  nameVi: string;
  nm: number;
  hex: string;
  colorNum: number;
  /** Base dispersion deviation relative to center ray (green), in radians */
  baseSpreadRad: number;
  passedBy: OpticalFilterId[];
}

export const SPECTRUM_BANDS: SpectrumBandSpec[] = [
  {
    id: 'red',
    nameVi: 'Đỏ',
    nm: 680,
    hex: '#ef4444',
    colorNum: 0xef4444,
    baseSpreadRad: -0.235,
    passedBy: ['none', 'red', 'yellow', 'magenta'],
  },
  {
    id: 'orange',
    nameVi: 'Cam',
    nm: 610,
    hex: '#f97316',
    colorNum: 0xf97316,
    baseSpreadRad: -0.155,
    passedBy: ['none', 'red', 'yellow'],
  },
  {
    id: 'yellow',
    nameVi: 'Vàng',
    nm: 580,
    hex: '#facc15',
    colorNum: 0xfacc15,
    baseSpreadRad: -0.078,
    passedBy: ['none', 'yellow', 'green'],
  },
  {
    id: 'green',
    nameVi: 'Lục',
    nm: 530,
    hex: '#22c55e',
    colorNum: 0x22c55e,
    baseSpreadRad: 0.0,
    passedBy: ['none', 'green', 'yellow', 'cyan'],
  },
  {
    id: 'cyan',
    nameVi: 'Lam',
    nm: 475,
    hex: '#06b6d4',
    colorNum: 0x06b6d4,
    baseSpreadRad: 0.078,
    passedBy: ['none', 'blue', 'cyan'],
  },
  {
    id: 'indigo',
    nameVi: 'Chàm',
    nm: 440,
    hex: '#3b82f6',
    colorNum: 0x3b82f6,
    baseSpreadRad: 0.156,
    passedBy: ['none', 'blue', 'cyan', 'magenta'],
  },
  {
    id: 'violet',
    nameVi: 'Tím',
    nm: 400,
    hex: '#a855f7',
    colorNum: 0xa855f7,
    baseSpreadRad: 0.235,
    passedBy: ['none', 'blue', 'magenta'],
  },
];

export const OPTICAL_FILTER_META: Record<
  OpticalFilterId,
  {
    labelVi: string;
    shortVi: string;
    hex: string;
    colorNum: number;
    beamHex: number;
    isMonochromatic: boolean;
    summaryVi: string;
  }
> = {
  none: {
    labelVi: 'Không lọc (Ánh sáng trắng)',
    shortVi: 'Trắng',
    hex: '#f8fafc',
    colorNum: 0xe2e8f0,
    beamHex: 0xfffbeb,
    isMonochromatic: false,
    summaryVi: 'Ánh sáng trắng gồm vô số ánh sáng đơn sắc từ Đỏ (680nm) đến Tím (400nm).',
  },
  red: {
    labelVi: 'Tấm lọc Đỏ (R)',
    shortVi: 'Đỏ',
    hex: '#ef4444',
    colorNum: 0xef4444,
    beamHex: 0xff3b3b,
    isMonochromatic: true,
    summaryVi: 'Chỉ cho dải Đỏ–Cam truyền qua; hấp thụ mạnh Lục, Lam, Chàm, Tím.',
  },
  green: {
    labelVi: 'Tấm lọc Lục (G)',
    shortVi: 'Lục',
    hex: '#22c55e',
    colorNum: 0x22c55e,
    beamHex: 0x22ff66,
    isMonochromatic: true,
    summaryVi: 'Chỉ cho dải Lục–Vàng hẹp truyền qua; hấp thụ Đỏ và Lam–Tím.',
  },
  blue: {
    labelVi: 'Tấm lọc Lam (B)',
    shortVi: 'Lam',
    hex: '#3b82f6',
    colorNum: 0x3b82f6,
    beamHex: 0x3b82ff,
    isMonochromatic: true,
    summaryVi: 'Chỉ cho dải Lam–Chàm–Tím truyền qua; hấp thụ Đỏ, Cam, Vàng, Lục.',
  },
  yellow: {
    labelVi: 'Tấm lọc Vàng (Y = R + G)',
    shortVi: 'Vàng',
    hex: '#facc15',
    colorNum: 0xfacc15,
    beamHex: 0xffe135,
    isMonochromatic: false,
    summaryVi: 'Cho dải Đỏ–Cam–Vàng–Lục đi qua, chặn hoàn toàn ánh sáng Lam–Chàm–Tím.',
  },
  cyan: {
    labelVi: 'Tấm lọc Xanh lơ (C = G + B)',
    shortVi: 'Lơ',
    hex: '#06b6d4',
    colorNum: 0x06b6d4,
    beamHex: 0x22e4ff,
    isMonochromatic: false,
    summaryVi: 'Cho dải Lục–Lam–Chàm đi qua, hấp thụ ánh sáng Đỏ–Cam.',
  },
  magenta: {
    labelVi: 'Tấm lọc Hồng tím (M = R + B)',
    shortVi: 'Hồng tím',
    hex: '#d946ef',
    colorNum: 0xd946ef,
    beamHex: 0xf052ff,
    isMonochromatic: false,
    summaryVi: 'Cho 2 đầu quang phổ (Đỏ & Chàm–Tím) đi qua, hấp thụ dải Lục ở giữa.',
  },
};

function createCanvasTex(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; tex: THREE.CanvasTexture } {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  draw(ctx, width, height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return { canvas, ctx, tex };
}

function drawOpticalRulerTexture(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.lineTo(w, 2);
  ctx.stroke();

  const totalCm = 36;
  const padX = 24;
  const usableW = w - padX * 2;
  for (let cm = 0; cm <= totalCm; cm++) {
    const x = padX + (cm / totalCm) * usableW;
    const isMajor = cm % 5 === 0;
    ctx.strokeStyle = isMajor ? '#f8fafc' : '#94a3b8';
    ctx.lineWidth = isMajor ? 2.5 : 1.2;
    ctx.beginPath();
    ctx.moveTo(x, 4);
    ctx.lineTo(x, isMajor ? 24 : 15);
    ctx.stroke();

    if (isMajor) {
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${cm}`, x, 42);
    }
  }
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px Inter, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('cm', w - 6, 42);
}

function drawGoniometerDialTexture(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const cx = w / 2;
  const cy = h / 2;
  const r = w * 0.46;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;
  ctx.stroke();

  for (let deg = 0; deg < 360; deg += 10) {
    const rad = (deg * Math.PI) / 180;
    const major = deg % 30 === 0;
    const inner = major ? r * 0.72 : r * 0.84;
    ctx.strokeStyle = major ? '#fde68a' : '#94a3b8';
    ctx.lineWidth = major ? 2.5 : 1.2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(rad) * inner, cy + Math.sin(rad) * inner);
    ctx.lineTo(cx + Math.cos(rad) * (r * 0.95), cy + Math.sin(rad) * (r * 0.95));
    ctx.stroke();
  }
}

function drawObservationScreenCanvas(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  filter: OpticalFilterId,
  filterPos: OpticalFilterPosition,
  prismOn: boolean,
  lampOn: boolean,
  angleDeg: number,
): void {
  // Deep optical chamber screen frame
  ctx.fillStyle = '#070d19';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, w - 8, h - 8);

  // Header bar
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(8, 8, w - 16, 40);
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 18px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MÀN HỨNG QUANG PHỔ & LỌC MÀU (380–760 nm)', w / 2, 34);

  const areaX = 24;
  const areaY = 58;
  const areaW = w - 48;
  const areaH = h - 134;

  // Matte dark-gray laboratory screen background
  ctx.fillStyle = '#020617';
  ctx.fillRect(areaX, areaY, areaW, areaH);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.strokeRect(areaX, areaY, areaW, areaH);

  const meta = OPTICAL_FILTER_META[filter];

  if (!lampOn) {
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillText('NGUỒN SÁNG ĐANG TẮT', w / 2, areaY + areaH / 2 + 6);
  } else if (!prismOn) {
    // Direct collimated slit beam without prism
    const slitW = 58;
    const cx = w / 2;
    const glow = ctx.createLinearGradient(cx - slitW, areaY, cx + slitW, areaY);
    glow.addColorStop(0, 'rgba(0,0,0,0)');
    glow.addColorStop(0.32, meta.hex);
    glow.addColorStop(0.5, '#ffffff');
    glow.addColorStop(0.68, meta.hex);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(cx - slitW, areaY + 14, slitW * 2, areaH - 42);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(
      filter === 'none'
        ? 'KHE ÁNH SÁNG TRẮNG (KHÔNG LĂNG KÍNH)'
        : `CHÙM SÁNG QUA ${meta.labelVi.toUpperCase()}`,
      w / 2,
      areaY + areaH - 10,
    );
  } else {
    // 7-band dispersed rainbow spectrum with realistic Gaussian glow
    const bandW = areaW / SPECTRUM_BANDS.length;
    SPECTRUM_BANDS.forEach((b, idx) => {
      const passed = b.passedBy.includes(filter);
      const bx = areaX + idx * bandW;
      if (passed) {
        // Horizontal + vertical soft spectral emission
        const vg = ctx.createLinearGradient(bx, areaY + 8, bx, areaY + areaH - 36);
        vg.addColorStop(0, 'rgba(0,0,0,0.25)');
        vg.addColorStop(0.22, b.hex);
        vg.addColorStop(0.5, '#ffffff');
        vg.addColorStop(0.78, b.hex);
        vg.addColorStop(1, 'rgba(0,0,0,0.25)');
        ctx.fillStyle = vg;
        ctx.fillRect(bx + 2, areaY + 8, bandW - 4, areaH - 44);

        // Outer color tint overlay for rich saturation
        ctx.fillStyle = b.hex;
        ctx.globalAlpha = 0.52;
        ctx.fillRect(bx + 2, areaY + 8, bandW - 4, areaH - 44);
        ctx.globalAlpha = 1.0;
      } else {
        // Absorbed band
        ctx.fillStyle = 'rgba(15,23,42,0.88)';
        ctx.fillRect(bx + 2, areaY + 8, bandW - 4, areaH - 44);
        ctx.strokeStyle = 'rgba(148,163,184,0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(bx + 8, areaY + 16);
        ctx.lineTo(bx + bandW - 8, areaY + areaH - 44);
        ctx.moveTo(bx + bandW - 8, areaY + 16);
        ctx.lineTo(bx + 8, areaY + areaH - 44);
        ctx.stroke();

        ctx.fillStyle = '#475569';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText('Hấp thụ', bx + bandW / 2, areaY + (areaH - 36) / 2 + 4);
      }

      // Color name & wavelength
      ctx.fillStyle = passed ? '#ffffff' : '#475569';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.fillText(b.nameVi, bx + bandW / 2, areaY + areaH - 20);
      ctx.fillStyle = passed ? '#cbd5e1' : '#334155';
      ctx.font = '600 11px monospace';
      ctx.fillText(`${b.nm}nm`, bx + bandW / 2, areaY + areaH - 5);
    });
  }

  // Footer info strip
  const passedNames = SPECTRUM_BANDS.filter((b) => b.passedBy.includes(filter))
    .map((b) => b.nameVi)
    .join(' · ');

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 14px Inter, sans-serif';
  const posText =
    filter === 'none'
      ? 'Không đặt tấm lọc'
      : filterPos === 'before-prism'
        ? 'Tấm lọc TRƯỚC lăng kính'
        : 'Tấm lọc SAU lăng kính';
  ctx.fillText(`${meta.labelVi}  |  ${posText}  |  Góc tới i = ${Math.round(angleDeg)}°`, w / 2, h - 42);

  ctx.fillStyle = '#a7f3d0';
  ctx.font = '600 13px Inter, sans-serif';
  ctx.fillText(
    prismOn
      ? `Dải truyền qua: ${passedNames}`
      : meta.summaryVi,
    w / 2,
    h - 18,
  );
}

// Module-scope scratch vectors to keep 60FPS loop GC-free
const _pA = new THREE.Vector3();
const _pB = new THREE.Vector3();
const _mid = new THREE.Vector3();
const _dir = new THREE.Vector3();

function orientRibbonBetween(
  mesh: THREE.Mesh,
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
): void {
  _pA.set(ax, ay, az);
  _pB.set(bx, by, bz);
  const len = _pA.distanceTo(_pB);
  if (len < 0.0005) {
    mesh.visible = false;
    return;
  }
  _mid.addVectors(_pA, _pB).multiplyScalar(0.5);
  _dir.subVectors(_pB, _pA).normalize();
  mesh.position.copy(_mid);
  mesh.scale.set(len, 1, 1);
  mesh.rotation.set(0, -Math.atan2(_dir.z, _dir.x), 0);
}

export function buildColorFilterDispersionModel(isSoftwareGl: boolean): THREE.Group {
  const g = new THREE.Group();
  g.name = 'color_filter_dispersion_root';

  const railMat = new THREE.MeshStandardMaterial({ color: 0x151e2e, roughness: 0.58, metalness: 0.35 });
  const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.42, metalness: 0.55 });
  const aluMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.22, metalness: 0.88 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4a017, roughness: 0.2, metalness: 0.9 });
  const rubberMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9, metalness: 0.05 });

  // 1. Optical Bench Base (0.38m x 0.016m x 0.165m) with 4 rubber leveling feet grounded at y = 0
  for (const fx of [-0.165, 0.165]) {
    for (const fz of [-0.065, 0.065]) {
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.013, 0.006, 16), rubberMat);
      foot.position.set(fx, 0.003, fz);
      g.add(foot);
    }
  }

  const baseDeck = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.016, 0.165), railMat);
  baseDeck.name = 'body';
  baseDeck.position.set(0, 0.014, 0);
  baseDeck.castShadow = true;
  baseDeck.receiveShadow = true;
  g.add(baseDeck);

  // Dual brushed-aluminum guide rods along the bench
  for (const rz of [-0.042, 0.042]) {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.0042, 0.0042, 0.355, 16), aluMat);
    rod.rotation.z = Math.PI / 2;
    rod.position.set(0, 0.025, rz);
    g.add(rod);
  }

  // Front engraved centimeter ruler along optical bench (+Z edge)
  const rulerTexObj = createCanvasTex(512, 64, drawOpticalRulerTexture);
  const rulerStrip = new THREE.Mesh(
    new THREE.PlaneGeometry(0.35, 0.024),
    new THREE.MeshStandardMaterial({
      map: rulerTexObj.tex,
      roughness: 0.45,
      metalness: 0.15,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
  );
  rulerStrip.rotation.x = -Math.PI / 2;
  rulerStrip.position.set(0, 0.0226, 0.066);
  g.add(rulerStrip);

  const BEAM_Y = 0.104;

  // 2. White-Light Slit Projector Lamp (Left, x = -0.148)
  const lampGroup = new THREE.Group();
  lampGroup.position.set(-0.148, 0.022, 0);

  const lampCarriage = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.014, 0.1), darkMetalMat);
  lampCarriage.position.y = 0.007;
  lampGroup.add(lampCarriage);

  const lampPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.066, 20), aluMat);
  lampPillar.position.y = 0.044;
  lampGroup.add(lampPillar);

  const lampBody = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.026, 0.064, 28), darkMetalMat);
  lampBody.rotation.z = Math.PI / 2;
  lampBody.position.set(-0.004, BEAM_Y - 0.022, 0);
  lampBody.castShadow = true;
  lampGroup.add(lampBody);

  // 5 radial brushed aluminum heatsink fins
  for (let i = 0; i < 5; i++) {
    const fin = new THREE.Mesh(new THREE.CylinderGeometry(0.0285, 0.0285, 0.0032, 28), aluMat);
    fin.rotation.z = Math.PI / 2;
    fin.position.set(-0.026 + i * 0.0095, BEAM_Y - 0.022, 0);
    lampGroup.add(fin);
  }

  // Brass collimating slit nozzle
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.018, 24), brassMat);
  nozzle.rotation.z = Math.PI / 2;
  nozzle.position.set(0.032, BEAM_Y - 0.022, 0);
  lampGroup.add(nozzle);

  // Glowing vertical collimated slit aperture
  const lampApertureMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xfff8dc,
    emissiveIntensity: 2.5,
    roughness: 0.1,
  });
  const slitGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.006, 0.026), lampApertureMat);
  slitGlow.rotation.y = Math.PI / 2;
  slitGlow.position.set(0.0415, BEAM_Y - 0.022, 0);
  lampGroup.add(slitGlow);

  // Power indicator LED on top of lamp housing
  const lampLedMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    emissive: 0x22c55e,
    emissiveIntensity: 1.8,
  });
  const lampLed = new THREE.Mesh(new THREE.SphereGeometry(0.0038, 12, 12), lampLedMat);
  lampLed.position.set(-0.01, BEAM_Y + 0.006, 0);
  lampGroup.add(lampLed);
  g.add(lampGroup);

  // 3. Rotating Flint-Glass Prism on Brass Goniometer Stage (Center-left, x = -0.022)
  const prismCarriage = new THREE.Group();
  prismCarriage.position.set(-0.022, 0.022, 0);

  const pBase = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.012, 0.1), darkMetalMat);
  pBase.position.y = 0.006;
  prismCarriage.add(pBase);

  const stageStem = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.015, 0.032, 24), brassMat);
  stageStem.position.y = 0.028;
  prismCarriage.add(stageStem);

  const gonioTexObj = createCanvasTex(256, 256, drawGoniometerDialTexture);
  const gonioDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.034, 0.036, 0.008, 36),
    brassMat,
  );
  gonioDisc.position.y = 0.046;
  prismCarriage.add(gonioDisc);

  const gonioDial = new THREE.Mesh(
    new THREE.CircleGeometry(0.032, 36),
    new THREE.MeshStandardMaterial({
      map: gonioTexObj.tex,
      roughness: 0.4,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
  );
  gonioDial.rotation.x = -Math.PI / 2;
  gonioDial.position.y = 0.0506;
  prismCarriage.add(gonioDial);

  // Rotary prism holder that rotates with incidentAngleDeg & retracts when prism is OFF
  const prismRotaryGroup = new THREE.Group();
  prismRotaryGroup.position.set(0, 0.051, 0);

  const prismShape = new THREE.Shape();
  const pr = 0.029;
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * Math.PI) / 3 - Math.PI / 2;
    const px = Math.cos(a) * pr;
    const py = Math.sin(a) * pr;
    if (i === 0) prismShape.moveTo(px, py);
    else prismShape.lineTo(px, py);
  }
  prismShape.closePath();

  const prismGeo = new THREE.ExtrudeGeometry(prismShape, {
    depth: 0.068,
    bevelEnabled: true,
    bevelThickness: 0.0018,
    bevelSize: 0.0014,
    bevelSegments: 2,
  });
  prismGeo.rotateX(-Math.PI / 2);

  const prismMat = new THREE.MeshPhysicalMaterial({
    color: 0xe6f7ff,
    roughness: 0.04,
    metalness: 0.0,
    transmission: isSoftwareGl ? 0 : 0.88,
    thickness: 0.026,
    ior: 1.65,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    transparent: true,
    opacity: isSoftwareGl ? 0.42 : 0.94,
    depthWrite: false,
  });
  const prismMesh = new THREE.Mesh(prismGeo, prismMat);
  prismMesh.name = 'lens_element';
  prismMesh.renderOrder = 3;
  prismRotaryGroup.add(prismMesh);

  const prismEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(prismGeo, 20),
    new THREE.LineBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.78 }),
  );
  prismEdges.userData.nonPickable = true;
  prismEdges.raycast = () => {};
  prismRotaryGroup.add(prismEdges);

  // Subtle internal dispersion glow core inside prism
  const prismCoreGlowMat = new THREE.MeshBasicMaterial({
    color: 0xfffbeb,
    transparent: true,
    opacity: 0.32,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const prismCoreGlow = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.028, 0.012), prismCoreGlowMat);
  prismCoreGlow.position.set(0, 0.031, 0);
  prismCoreGlow.userData.nonPickable = true;
  prismCoreGlow.raycast = () => {};
  prismRotaryGroup.add(prismCoreGlow);

  prismCarriage.add(prismRotaryGroup);
  g.add(prismCarriage);

  // 4. Sliding Optical Color Filter Holder (Glides between x = +0.062 after-prism and x = -0.088 before-prism!)
  const filterCarriage = new THREE.Group();
  filterCarriage.position.set(0.062, 0.022, 0);

  const fBase = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.012, 0.1), darkMetalMat);
  fBase.position.y = 0.006;
  filterCarriage.add(fBase);

  const thumbScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.012, 16), brassMat);
  thumbScrew.rotation.x = Math.PI / 2;
  thumbScrew.position.set(0, 0.008, 0.054);
  filterCarriage.add(thumbScrew);

  const filterStem = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.008, 0.028, 16), aluMat);
  filterStem.position.y = 0.024;
  filterCarriage.add(filterStem);

  // Movable Filter Cassette (slides down into optical path when filter !== 'none')
  const filterCassette = new THREE.Group();
  filterCassette.position.y = 0.082;

  const frameT = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.006, 0.106), darkMetalMat);
  frameT.position.y = 0.044;
  const frameB = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.006, 0.106), darkMetalMat);
  frameB.position.y = -0.044;
  const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.094, 0.006), darkMetalMat);
  frameL.position.z = -0.05;
  const frameR = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.094, 0.006), darkMetalMat);
  frameR.position.z = 0.05;
  const filterTab = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.012, 0.026), brassMat);
  filterTab.position.y = 0.052;
  filterCassette.add(frameT, frameB, frameL, frameR, filterTab);

  const filterGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xef4444,
    roughness: 0.05,
    metalness: 0.0,
    clearcoat: 1.0,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const filterGlassPane = new THREE.Mesh(new THREE.BoxGeometry(0.0036, 0.082, 0.094), filterGlassMat);
  filterGlassPane.renderOrder = 4;
  filterCassette.add(filterGlassPane);
  filterCarriage.add(filterCassette);
  g.add(filterCarriage);

  // 5. Dual-Sided Observation Screen (Right, x = +0.155)
  const screenGroup = new THREE.Group();
  screenGroup.position.set(0.155, 0.022, 0);

  const sBase = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.014, 0.145), darkMetalMat);
  sBase.position.y = 0.007;
  screenGroup.add(sBase);

  const screenFrame = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.144, 0.152), darkMetalMat);
  screenFrame.position.set(0.004, 0.082, 0);
  screenFrame.castShadow = true;
  screenGroup.add(screenFrame);

  const screenCanvasObj = createCanvasTex(512, 320, (ctx, w, h) =>
    drawObservationScreenCanvas(ctx, w, h, 'none', 'after-prism', true, true, 45),
  );
  const screenMat = new THREE.MeshStandardMaterial({
    map: screenCanvasObj.tex,
    roughness: 0.48,
    metalness: 0.04,
    emissive: 0xffffff,
    emissiveMap: screenCanvasObj.tex,
    emissiveIntensity: 0.42,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const screenFront = new THREE.Mesh(new THREE.PlaneGeometry(0.142, 0.132), screenMat);
  screenFront.name = 'scale_display';
  screenFront.rotation.y = -Math.PI / 2;
  screenFront.position.set(-0.0028, 0.082, 0);

  const screenBack = new THREE.Mesh(new THREE.PlaneGeometry(0.142, 0.132), screenMat);
  screenBack.name = 'scale_display_rear';
  screenBack.rotation.y = Math.PI / 2;
  screenBack.position.set(0.0108, 0.082, 0);
  screenGroup.add(screenFront, screenBack);
  g.add(screenGroup);

  // 6. Volumetric Flat Slit Light Ribbons (Lamp -> Pre-filter -> Prism -> Post-filter -> Screen)
  const unitRibbonGeo = new THREE.BoxGeometry(1, 0.024, 0.0036);
  const unitGlowGeo = new THREE.BoxGeometry(1, 0.032, 0.0085);

  const makeRibbonPair = (colorNum: number, coreOp: number, glowOp: number) => {
    const coreMat = new THREE.MeshBasicMaterial({
      color: colorNum,
      transparent: true,
      opacity: coreOp,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glowMat = new THREE.MeshBasicMaterial({
      color: colorNum,
      transparent: true,
      opacity: glowOp,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const core = new THREE.Mesh(unitRibbonGeo, coreMat);
    const glow = new THREE.Mesh(unitGlowGeo, glowMat);
    core.userData.nonPickable = true;
    core.raycast = () => {};
    glow.userData.nonPickable = true;
    glow.raycast = () => {};
    core.add(glow);
    g.add(core);
    return { core, coreMat, glowMat };
  };

  // Segment A: Lamp (-0.106) -> Before-prism filter (-0.088) or Prism (-0.036)
  const incidentSeg1 = makeRibbonPair(0xfffbeb, 0.85, 0.25);
  // Segment B: Before-prism filter (-0.088) -> Prism (-0.036) (tinted when filter is BEFORE prism!)
  const incidentSeg2 = makeRibbonPair(0xfffbeb, 0.85, 0.25);
  // Straight through beam when prism is OFF
  const straightSeg = makeRibbonPair(0xfffbeb, 0.82, 0.24);

  // 7 dispersed spectral ribbon pairs (pre-filter & post-filter segments)
  const preRayPairs: Array<{ core: THREE.Mesh; coreMat: THREE.MeshBasicMaterial; glowMat: THREE.MeshBasicMaterial }> = [];
  const postRayPairs: Array<{ core: THREE.Mesh; coreMat: THREE.MeshBasicMaterial; glowMat: THREE.MeshBasicMaterial }> = [];
  for (const band of SPECTRUM_BANDS) {
    preRayPairs.push(makeRibbonPair(band.colorNum, 0.78, 0.22));
    postRayPairs.push(makeRibbonPair(band.colorNum, 0.78, 0.22));
  }

  g.userData.cfdRig = {
    lampApertureMat,
    lampLedMat,
    prismRotaryGroup,
    prismCoreGlow,
    prismCoreGlowMat,
    filterCarriage,
    filterCassette,
    filterGlassMat,
    incidentSeg1,
    incidentSeg2,
    straightSeg,
    preRayPairs,
    postRayPairs,
    screenCanvasObj,
    // Animated kinematic state
    curFilterX: 0.062,
    curFilterDropY: 0.145,
    curPrismRotY: 0,
    curPrismScaleY: 1,
    lastSig: '',
  };

  // Orient beams immediately so 3D preview modals and initial spawns show full 7-color dispersion right away
  filterCassette.position.y = 0.145;
  filterCassette.visible = false;
  applyColorFilterDispersionState(g, {
    instanceId: 'preview',
    assetId: 'OL3D-EQP-CFD-0001',
    assetVersion: '1.0.0',
    parentZone: 'bench-main',
    transform: {
      positionM: [0, 0, 0],
      rotationRad: [0, 0, 0],
      displayScale: [1, 1, 1],
    },
    visible: true,
    locked: false,
    labelVisible: true,
    instanceState: {
      isLampLit: true,
      prismDispersionEnabled: true,
      filterColor: 'none',
      filterPosition: 'after-prism',
      incidentAngleDeg: 45,
    },
  });
  g.userData.cfdRig.lastSig = '';

  return g;
}

export function applyColorFilterDispersionState(
  instanceRoot: THREE.Object3D,
  instance: SceneInstance,
): void {
  const rig = instanceRoot.getObjectByName('color_filter_dispersion_root')?.userData?.cfdRig;
  if (!rig) return;

  const st = instance.instanceState;
  const filter: OpticalFilterId = st.filterColor ?? 'none';
  const filterPos: OpticalFilterPosition = st.filterPosition ?? 'after-prism';
  const prismOn = st.prismDispersionEnabled !== false;
  const lampOn = st.isLampLit !== false;
  const angleDeg = THREE.MathUtils.clamp(st.incidentAngleDeg ?? 45, 25, 65);

  const sig = `${filter}|${filterPos}|${prismOn}|${lampOn}|${angleDeg.toFixed(1)}`;
  if (rig.lastSig === sig) return;
  rig.lastSig = sig;

  const meta = OPTICAL_FILTER_META[filter];
  const BEAM_Y = 0.104;
  const LAMP_X = -0.106;
  const BEFORE_FILTER_X = -0.088;
  const PRISM_ENTRY_X = -0.036;
  const PRISM_EXIT_X = -0.008;
  const AFTER_FILTER_X = 0.062;
  const SCREEN_X = 0.151;

  // Lamp emission & indicator
  rig.lampApertureMat.emissiveIntensity = lampOn ? 2.5 : 0.0;
  rig.lampLedMat.emissiveIntensity = lampOn ? 1.8 : 0.05;
  rig.lampLedMat.color.setHex(lampOn ? 0x22c55e : 0x475569);

  // Filter glass tint
  rig.filterGlassMat.color.setHex(meta.colorNum);
  rig.filterGlassMat.opacity = filter === 'none' ? 0.08 : 0.48;

  // Dispersion spread factor varies smoothly with prism incidence angle (strongest around 55–65 deg)
  const spreadFactor = 0.72 + ((angleDeg - 25) / 40) * 0.56;

  // Prism core glow
  const beamColorBeforePrism =
    filter !== 'none' && filterPos === 'before-prism' ? meta.beamHex : 0xfffbeb;
  rig.prismCoreGlow.visible = lampOn && prismOn;
  rig.prismCoreGlowMat.color.setHex(beamColorBeforePrism);

  if (!lampOn) {
    rig.incidentSeg1.core.visible = false;
    rig.incidentSeg2.core.visible = false;
    rig.straightSeg.core.visible = false;
    rig.preRayPairs.forEach((p: { core: THREE.Mesh }) => (p.core.visible = false));
    rig.postRayPairs.forEach((p: { core: THREE.Mesh }) => (p.core.visible = false));
  } else if (!prismOn) {
    // No prism: straight beam from lamp -> filter -> screen
    const filterX = filterPos === 'before-prism' ? BEFORE_FILTER_X : AFTER_FILTER_X;
    rig.incidentSeg1.core.visible = true;
    rig.incidentSeg1.coreMat.color.setHex(0xfffbeb);
    rig.incidentSeg1.glowMat.color.setHex(0xfffbeb);
    orientRibbonBetween(rig.incidentSeg1.core, LAMP_X, BEAM_Y, 0, filterX, BEAM_Y, 0);

    rig.incidentSeg2.core.visible = false;

    rig.straightSeg.core.visible = true;
    rig.straightSeg.coreMat.color.setHex(meta.beamHex);
    rig.straightSeg.glowMat.color.setHex(meta.beamHex);
    orientRibbonBetween(rig.straightSeg.core, filterX, BEAM_Y, 0, SCREEN_X, BEAM_Y, 0);

    rig.preRayPairs.forEach((p: { core: THREE.Mesh }) => (p.core.visible = false));
    rig.postRayPairs.forEach((p: { core: THREE.Mesh }) => (p.core.visible = false));
  } else {
    // Prism ON: Full dispersion physics
    rig.straightSeg.core.visible = false;

    if (filter !== 'none' && filterPos === 'before-prism') {
      // Lamp -> Filter (white), Filter -> Prism (tinted by filter!)
      rig.incidentSeg1.core.visible = true;
      rig.incidentSeg1.coreMat.color.setHex(0xfffbeb);
      rig.incidentSeg1.glowMat.color.setHex(0xfffbeb);
      orientRibbonBetween(rig.incidentSeg1.core, LAMP_X, BEAM_Y, 0, BEFORE_FILTER_X, BEAM_Y, 0);

      rig.incidentSeg2.core.visible = true;
      rig.incidentSeg2.coreMat.color.setHex(meta.beamHex);
      rig.incidentSeg2.glowMat.color.setHex(meta.beamHex);
      orientRibbonBetween(rig.incidentSeg2.core, BEFORE_FILTER_X, BEAM_Y, 0, PRISM_ENTRY_X, BEAM_Y, 0);
    } else {
      // Full white light hits prism directly
      rig.incidentSeg1.core.visible = true;
      rig.incidentSeg1.coreMat.color.setHex(0xfffbeb);
      rig.incidentSeg1.glowMat.color.setHex(0xfffbeb);
      orientRibbonBetween(rig.incidentSeg1.core, LAMP_X, BEAM_Y, 0, PRISM_ENTRY_X, BEAM_Y, 0);
      rig.incidentSeg2.core.visible = false;
    }

    // 7 Spectral rays exiting prism
    const dxMid = AFTER_FILTER_X - PRISM_EXIT_X;
    const dxFull = SCREEN_X - PRISM_EXIT_X;

    SPECTRUM_BANDS.forEach((band, idx) => {
      const passed = band.passedBy.includes(filter);
      const angle = band.baseSpreadRad * spreadFactor;
      const zMid = Math.tan(angle) * dxMid;
      const zEnd = Math.tan(angle) * dxFull;

      const pre = rig.preRayPairs[idx];
      const post = rig.postRayPairs[idx];

      if (filterPos === 'before-prism' && filter !== 'none') {
        // Light was ALREADY filtered before reaching prism -> only transmitted bands emerge from prism!
        pre.core.visible = passed;
        post.core.visible = passed;
        if (passed) {
          orientRibbonBetween(pre.core, PRISM_EXIT_X, BEAM_Y, 0, AFTER_FILTER_X, BEAM_Y, zMid);
          orientRibbonBetween(post.core, AFTER_FILTER_X, BEAM_Y, zMid, SCREEN_X, BEAM_Y, zEnd);
        }
      } else {
        // All 7 rainbow bands travel from Prism to Filter; ONLY passed bands continue from Filter to Screen!
        pre.core.visible = true;
        orientRibbonBetween(pre.core, PRISM_EXIT_X, BEAM_Y, 0, AFTER_FILTER_X, BEAM_Y, zMid);
        post.core.visible = passed;
        if (passed) {
          orientRibbonBetween(post.core, AFTER_FILTER_X, BEAM_Y, zMid, SCREEN_X, BEAM_Y, zEnd);
        }
      }
    });
  }

  // Redraw crisp high-res observation screen CanvasTexture
  drawObservationScreenCanvas(
    rig.screenCanvasObj.ctx,
    rig.screenCanvasObj.canvas.width,
    rig.screenCanvasObj.canvas.height,
    filter,
    filterPos,
    prismOn,
    lampOn,
    angleDeg,
  );
  rig.screenCanvasObj.tex.needsUpdate = true;
}

/**
 * 60FPS smooth exponential damping animation for prism rotation, prism mount/unmount,
 * filter carriage slide (before/after prism), and filter cassette drop-in!
 */
export function stepColorFilterDispersionAnimation(
  instanceRoot: THREE.Object3D,
  instance: SceneInstance,
  dt: number,
  nowSec: number,
): boolean {
  const rig = instanceRoot.getObjectByName('color_filter_dispersion_root')?.userData?.cfdRig;
  if (!rig) return false;

  const safeDt = Math.min(dt, 0.05);
  const st = instance.instanceState;
  const filter: OpticalFilterId = st.filterColor ?? 'none';
  const filterPos: OpticalFilterPosition = st.filterPosition ?? 'after-prism';
  const prismOn = st.prismDispersionEnabled !== false;
  const lampOn = st.isLampLit !== false;
  const angleDeg = THREE.MathUtils.clamp(st.incidentAngleDeg ?? 45, 25, 65);

  const targetFilterX = filterPos === 'before-prism' ? -0.088 : 0.062;
  const targetDropY = filter === 'none' ? 0.145 : 0.082;
  const targetPrismRotY = THREE.MathUtils.degToRad((angleDeg - 45) * 0.75);
  const targetPrismScaleY = prismOn ? 1.0 : 0.01;

  rig.curFilterX = THREE.MathUtils.damp(rig.curFilterX, targetFilterX, 10, safeDt);
  rig.curFilterDropY = THREE.MathUtils.damp(rig.curFilterDropY, targetDropY, 11, safeDt);
  rig.curPrismRotY = THREE.MathUtils.damp(rig.curPrismRotY, targetPrismRotY, 10, safeDt);
  rig.curPrismScaleY = THREE.MathUtils.damp(rig.curPrismScaleY, targetPrismScaleY, 12, safeDt);

  rig.filterCarriage.position.x = rig.curFilterX;
  rig.filterCassette.position.y = rig.curFilterDropY;
  rig.filterCassette.visible = rig.curFilterDropY < 0.142;

  rig.prismRotaryGroup.rotation.y = rig.curPrismRotY;
  rig.prismRotaryGroup.scale.y = rig.curPrismScaleY;
  rig.prismRotaryGroup.visible = rig.curPrismScaleY > 0.03;

  // Subtle living shimmer on optical ribbons when lamp is ON
  if (lampOn) {
    const pulse = 0.74 + Math.sin(nowSec * 3.2) * 0.05;
    rig.incidentSeg1.coreMat.opacity = pulse + 0.08;
    rig.prismCoreGlowMat.opacity = 0.28 + Math.sin(nowSec * 2.6) * 0.05;
  }

  const stillMoving =
    Math.abs(rig.curFilterX - targetFilterX) > 0.0005 ||
    Math.abs(rig.curFilterDropY - targetDropY) > 0.0005 ||
    Math.abs(rig.curPrismRotY - targetPrismRotY) > 0.002 ||
    Math.abs(rig.curPrismScaleY - targetPrismScaleY) > 0.005;

  return stillMoving;
}

export function getColorFilterDispersionLabelInfo(inst: SceneInstance): {
  readoutBadge: string;
  isDigitalScale: boolean;
  interactionHint: string;
} {
  const st = inst.instanceState;
  const f: OpticalFilterId = st.filterColor ?? 'none';
  const pos: OpticalFilterPosition = st.filterPosition ?? 'after-prism';
  const prismOn = st.prismDispersionEnabled !== false;
  const lampOn = st.isLampLit !== false;
  const angleDeg = Math.round(st.incidentAngleDeg ?? 45);
  const meta = OPTICAL_FILTER_META[f];

  const passedCount = SPECTRUM_BANDS.filter((b) => b.passedBy.includes(f)).length;
  const badge = !lampOn
    ? '🔦 Đèn nguồn TẮT'
    : `${prismOn ? `🌈 Tán sắc (${passedCount}/7 màu · i=${angleDeg}°)` : 'Chùm đơn sắc'} · ${meta.shortVi}${
        f !== 'none' ? ` (${pos === 'before-prism' ? 'Trước LK' : 'Sau LK'})` : ''
      }`;

  return {
    readoutBadge: badge,
    isDigitalScale: true,
    interactionHint:
      'Chọn tấm lọc màu (Đỏ, Lục, Lam, Vàng, Lơ, Hồng tím), đổi vị trí Trước/Sau lăng kính, bật/tắt Lăng kính và xoay góc tới để quan sát hiện tượng tán sắc và hấp thụ màu!',
  };
}
