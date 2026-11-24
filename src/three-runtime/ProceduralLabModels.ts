import * as THREE from 'three';
import { AssetDefinition, ProceduralArchetype, SceneInstance } from '../domain/types';
import { htmlEquipmentModuleRegistry } from './HtmlEquipmentModuleRegistry';
import {
  applyDcCircuitInstanceStateToObject3D,
  buildDcAnalogMeterModel,
  buildDcBatteryHolderModel,
  buildDcKnifeSwitchModel,
  buildDcLightBulb126Model,
  buildDcRheostat20Model,
  buildSingleConOBatteryUnit,
} from './DcCircuitModels3D';
import {
  applyChemicalEquipmentStateToObject3D,
  buildAgNO3Bottle400Model,
  buildBomexBeaker100Model,
  buildCopperWireRing3gModel,
  buildNaOHBottle400Model,
} from './ChemicalLabModels3D';
import {
  applyColorFilterDispersionState,
  buildColorFilterDispersionModel,
} from './ColorFilterDispersion3D';
import {
  applyOxygenAirVolumeState,
  buildOxygenAirVolumeModel,
} from './OxygenAirVolume3D';

/**
 * OPENLAB 3D — PROCEDURAL MULTI-PART PBR EQUIPMENT GENERATOR
 * Tạo mô hình 3D khoa học đa thành phần (3–12 bộ phận mỗi thiết bị) với:
 * - Gốc tọa độ (pivot) tại tâm mặt đáy (y = 0) đặt sát mặt bàn thí nghiệm.
 * - Các node con được đặt tên chuẩn hóa (`body`, `scale_display`, `scale_marks`, `liquid_surface`, `plunger`, `handle`, `measurement_anchor`).
 * - Vật liệu PBR (kim loại phay xước, thủy tinh Borosilicate có vạch chia CanvasTexture, màn hình LCD, đồng thau, nhôm, thép).
 * - Đĩa bóng tiếp xúc mềm (soft radial contact shadow) chống cảm giác vật thể lơ lửng.
 */

let cachedContactShadowTex: THREE.CanvasTexture | null = null;

function getContactShadowTexture(): THREE.CanvasTexture {
  if (cachedContactShadowTex) return cachedContactShadowTex;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 60);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
  grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.22)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  cachedContactShadowTex = tex;
  return tex;
}

function addContactShadow(group: THREE.Group, radiusX: number, radiusZ: number): void {
  const geo = new THREE.PlaneGeometry(radiusX * 2.3, radiusZ * 2.3);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    map: getContactShadowTexture(),
    transparent: true,
    depthWrite: false,
    opacity: 0.65,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const shadowMesh = new THREE.Mesh(geo, mat);
  shadowMesh.position.y = 0.0015;
  shadowMesh.name = 'contact_shadow';
  shadowMesh.userData.nonPickable = true;
  shadowMesh.raycast = () => {};
  group.add(shadowMesh);
}

export function createLcdDisplayTexture(textValue: string, unit = 'g'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 220;
  const ctx = canvas.getContext('2d')!;

  // Backlit LCD background with high-contrast metallic bezel
  ctx.fillStyle = '#031814';
  ctx.fillRect(0, 0, 640, 220);
  ctx.strokeStyle = '#2DD4BF';
  ctx.lineWidth = 8;
  ctx.strokeRect(5, 5, 630, 210);

  // Inner high-contrast dark emerald LCD screen
  ctx.fillStyle = '#052922';
  ctx.fillRect(14, 14, 612, 192);

  // Status indicator bar
  ctx.fillStyle = '#5EEAD4';
  ctx.font = 'bold 24px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('● STABLE   NET / TARE', 26, 48);

  // Faint 7-segment ghost background
  ctx.fillStyle = 'rgba(94, 234, 212, 0.08)';
  ctx.font = '900 116px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText('888.88', 518, 174);

  // Active glowing numeric readout (extra bright & crisp for all viewing angles)
  ctx.fillStyle = '#A5F3FC';
  ctx.font = '900 116px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(textValue, 518, 174);

  // Unit symbol (g / ml / V / A / Ω)
  ctx.fillStyle = '#34D399';
  ctx.font = '900 54px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(unit, 532, 170);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Tạo mặt bảng điều khiển & màn hình LCD chuẩn thiết kế cân điện tử OHAUS Scout
 * Đã nâng cấp màn hình LCD to hơn, độ phân giải 1280×700 siêu sắc nét để đọc trực tiếp số gram ngay trên thân cân 3D
 */
export function createOhausScoutPanelTexture(textValue: string, unit = 'g'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 700;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 1280, 700);

  // 1. Nền tấm ốp mặt điều khiển màu trắng sứ bo góc mềm
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.roundRect(16, 16, 1248, 668, 52);
  ctx.fill();
  ctx.stroke();

  // Viền chỉ mảnh bên trong
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(32, 32, 1216, 636, 40);
  ctx.stroke();

  // Giọt nước cân bằng (Spirit Level Bubble) bên phải màn hình LCD
  const bx = 1142;
  const by = 180;
  ctx.fillStyle = '#E2E8F0';
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.arc(bx, by, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#DBEAFE';
  ctx.beginPath();
  ctx.arc(bx, by, 27, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(bx, by, 14, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(56, 189, 248, 0.65)';
  ctx.beginPath();
  ctx.arc(bx - 2, by - 2, 10, 0, Math.PI * 2);
  ctx.fill();

  // 5. Khung màn hình LCD MỞ RỘNG TO & RÕ NÉT HƠN (Backlit High-Contrast White/Cyan LCD)
  const lcdX = 248;
  const lcdY = 88;
  const lcdW = 796;
  const lcdH = 292;

  const lcdGrad = ctx.createLinearGradient(lcdX, lcdY, lcdX, lcdY + lcdH);
  lcdGrad.addColorStop(0, '#E0F2FE');
  lcdGrad.addColorStop(0.5, '#F0F9FF');
  lcdGrad.addColorStop(1, '#DBEAFE');
  ctx.fillStyle = lcdGrad;
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.roundRect(lcdX, lcdY, lcdW, lcdH, 14);
  ctx.fill();
  ctx.stroke();

  // 2 đường kẻ ngang màu đỏ đặc trưng ở mép trên và mép dưới màn hình LCD
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 6.5;
  ctx.beginPath();
  ctx.moveTo(lcdX + 6, lcdY + 6);
  ctx.lineTo(lcdX + lcdW - 6, lcdY + 6);
  ctx.moveTo(lcdX + 6, lcdY + lcdH - 6);
  ctx.lineTo(lcdX + lcdW - 6, lcdY + lcdH - 6);
  ctx.stroke();

  // Ký hiệu ổn định (*) và tâm không (>0<) bên trái trong màn hình LCD
  ctx.fillStyle = '#0F172A';
  ctx.font = '900 44px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('*', lcdX + 26, lcdY + 114);
  ctx.font = '900 30px "JetBrains Mono", monospace';
  ctx.fillText('>0<', lcdX + 20, lcdY + 218);

  // Bóng mờ 7-đoạn phía sau
  ctx.fillStyle = 'rgba(15, 23, 42, 0.06)';
  ctx.font = '900 182px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText('888.88', lcdX + lcdW - 112, lcdY + 222);

  // Chữ số cân chính SIÊU ĐẬM, SẮC NÉT, CỠ LỚN (182px) kèm viền sáng chống lóa
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 6;
  ctx.font = '900 182px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.strokeText(textValue, lcdX + lcdW - 112, lcdY + 222);
  ctx.fillStyle = '#020617';
  ctx.fillText(textValue, lcdX + lcdW - 112, lcdY + 222);

  // Đơn vị (g) cỡ lớn rõ nét
  ctx.fillStyle = '#020617';
  ctx.font = '900 66px "Inter", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(unit, lcdX + lcdW - 92, lcdY + 222);

  // 6. Hàng 4 phím bấm chữ nhật viền đỏ phía dưới màn hình LCD
  const buttons = [
    { top: 'Zero', mid: '', sub: 'Yes', hasPowerIcon: true },
    { top: 'Print', mid: 'Units', sub: 'No', hasPowerIcon: false },
    { top: 'Function', mid: 'Mode', sub: 'Back', hasPowerIcon: false },
    { top: 'Tare', mid: 'Menu', sub: 'Exit', hasPowerIcon: false },
  ];

  const startBtnX = 204;
  const btnY = 434;
  const btnW = 198;
  const btnH = 132;
  const btnGap = 38;

  buttons.forEach((btn, idx) => {
    const x = startBtnX + idx * (btnW + btnGap);
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(x, btnY, btnW, btnH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#DC2626';
    ctx.textAlign = 'center';
    if (btn.mid) {
      ctx.font = 'bold 28px "Inter", sans-serif';
      ctx.fillText(btn.top, x + btnW / 2, btnY + 52);
      ctx.fillText(btn.mid, x + btnW / 2, btnY + 96);
    } else {
      ctx.font = 'bold 32px "Inter", sans-serif';
      ctx.fillText(btn.top, x + btnW / 2 - (btn.hasPowerIcon ? 14 : 0), btnY + 76);
    }

    if (btn.hasPowerIcon) {
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.arc(x + btnW - 36, btnY + 38, 15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + btnW - 36, btnY + 27);
      ctx.lineTo(x + btnW - 36, btnY + 49);
      ctx.stroke();
    }

    ctx.fillStyle = '#DC2626';
    ctx.font = 'bold 24px "Inter", sans-serif';
    ctx.fillText(btn.sub, x + btnW / 2, btnY + btnH + 34);
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

let cachedOhausSideLogoTex: THREE.CanvasTexture | null = null;
function getOhausSideLogoTexture(): THREE.CanvasTexture {
  if (cachedOhausSideLogoTex) return cachedOhausSideLogoTex;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 256, 96);
  ctx.fillStyle = '#DC2626';
  ctx.font = 'italic 900 44px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('OHAUS', 128, 62);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  cachedOhausSideLogoTex = tex;
  return tex;
}

const cachedBrushedMetalTexMap = new Map<string, THREE.CanvasTexture>();
function getBrushedMetalReflectionTexture(baseHex: string, highlightHex: string): THREE.CanvasTexture {
  const key = `${baseHex}_${highlightHex}`;
  const existing = cachedBrushedMetalTexMap.get(key);
  if (existing) return existing;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0.0, baseHex);
  grad.addColorStop(0.22, highlightHex);
  grad.addColorStop(0.48, baseHex);
  grad.addColorStop(0.76, highlightHex);
  grad.addColorStop(1.0, baseHex);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  for (let y = 0; y < 256; y += 2) {
    ctx.strokeStyle = y % 4 === 0 ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  cachedBrushedMetalTexMap.set(key, tex);
  return tex;
}

function createReflectiveMetalWeightMaterial(
  colorHex: number,
  baseCss: string,
  highlightCss: string,
  roughness = 0.14,
  metalness = 0.94,
): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: colorHex,
    map: getBrushedMetalReflectionTexture(baseCss, highlightCss),
    roughness,
    metalness,
    envMapIntensity: 1.65,
    clearcoat: 0.72,
    clearcoatRoughness: 0.08,
    reflectivity: 0.98,
  });
}

function createGraduationCanvasTexture(
  minVal: number,
  maxVal: number,
  stepVal: number,
  unitLabel: string,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 256, 512);

  ctx.font = 'bold 20px "Inter", "JetBrains Mono", sans-serif';

  const totalSteps = Math.max(1, Math.round((maxVal - minVal) / stepVal));
  const topY = 55;
  const bottomY = 455;
  const spanY = bottomY - topY;

  // Unit header
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 3;
  ctx.strokeText(unitLabel, 96, 34);
  ctx.fillStyle = '#0B3A7D';
  ctx.fillText(unitLabel, 96, 34);

  for (let i = 0; i <= totalSteps; i++) {
    const val = minVal + i * stepVal;
    const t = i / totalSteps;
    const y = bottomY - t * spanY;
    const isMajor = i % 2 === 0;

    // Subtle white halo for contrast over water and glass
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = isMajor ? 5 : 3.2;
    ctx.beginPath();
    ctx.moveTo(72, y);
    ctx.lineTo(isMajor ? 116 : 98, y);
    ctx.stroke();

    ctx.strokeStyle = '#0B3A7D';
    ctx.lineWidth = isMajor ? 3 : 1.8;
    ctx.beginPath();
    ctx.moveTo(72, y);
    ctx.lineTo(isMajor ? 116 : 98, y);
    ctx.stroke();

    if (isMajor) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 3.5;
      ctx.strokeText(String(val), 122, y + 6);
      ctx.fillStyle = '#0B3A7D';
      ctx.fillText(String(val), 122, y + 6);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function createRulerCanvasTexture(maxMm: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(0, 0, 512, 96);

  ctx.strokeStyle = '#0F172A';
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 16px "JetBrains Mono", monospace';

  const startX = 28;
  const endX = 484;
  const spanX = endX - startX;
  const totalCm = Math.floor(maxMm / 10);

  for (let mm = 0; mm <= maxMm; mm += 2) {
    const x = startX + (mm / maxMm) * spanX;
    const isCm = mm % 10 === 0;
    ctx.lineWidth = isCm ? 2.5 : 1.2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, isCm ? 36 : 20);
    ctx.stroke();

    if (isCm && mm <= totalCm * 10) {
      ctx.fillText(String(mm / 10), x - 6, 58);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createGlassMaterial(_isSoftwareGl: boolean): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    roughness: 0.06,
    metalness: 0.04,
    transmission: 0,
    transparent: true,
    opacity: 0.25,
    ior: 1.48,
    reflectivity: 0.92,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

function createWaterMaterial(colorHex = 0x0ea5e9, opacity = 0.78): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: colorHex,
    emissive: 0x0284c7,
    emissiveIntensity: 0.22,
    roughness: 0.04,
    metalness: 0.04,
    ior: 1.333,
    reflectivity: 0.96,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    transparent: true,
    opacity,
    depthWrite: false,
  });
}

function createStreamMaterial(colorHex = 0x38bdf8, opacity = 0.90): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: colorHex,
    emissive: 0x0284c7,
    emissiveIntensity: 0.28,
    roughness: 0.03,
    metalness: 0.05,
    ior: 1.333,
    reflectivity: 0.98,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    transparent: true,
    opacity,
    depthWrite: false,
  });
}

function addConcaveMeniscusAndRipples(
  liquidGroup: THREE.Group,
  radius: number,
  waterHeight: number,
): void {
  // 1. Glossy top water surface cap
  const surfaceCap = new THREE.Mesh(
    new THREE.CircleGeometry(radius * 0.992, 36).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.62,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  surfaceCap.name = 'surface_cap';
  surfaceCap.position.y = waterHeight + 0.0002;
  surfaceCap.renderOrder = 3;
  liquidGroup.add(surfaceCap);

  // 2. 3D Concave Capillary Meniscus Wall (visible from side view for reading bottom of meniscus!)
  const meniscusWallH = Math.min(0.0042, Math.max(0.0022, radius * 0.11));
  const meniscusWall = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 1.002, radius * 0.965, meniscusWallH, 36, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.68,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  meniscusWall.name = 'meniscus_wall';
  meniscusWall.position.y = waterHeight + meniscusWallH * 0.5;
  meniscusWall.renderOrder = 3;
  liquidGroup.add(meniscusWall);

  // 3. Crisp outer meniscus contact ring highlight
  const meniscusRing = new THREE.Mesh(
    new THREE.RingGeometry(radius * 0.72, radius * 1.004, 36).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({
      color: 0xe0f2fe,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    }),
  );
  meniscusRing.name = 'meniscus_ring';
  meniscusRing.position.y = waterHeight + 0.0006;
  meniscusRing.renderOrder = 3;
  liquidGroup.add(meniscusRing);

  // 4. Inner concentric surface ripple ring (shimmers during pouring/dispensing)
  const rippleRing = new THREE.Mesh(
    new THREE.RingGeometry(radius * 0.28, radius * 0.44, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({
      color: 0xbae6fd,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
    }),
  );
  rippleRing.name = 'surface_ripple';
  rippleRing.position.y = waterHeight + 0.0007;
  rippleRing.renderOrder = 3;
  liquidGroup.add(rippleRing);
}

/**
 * Adds 3D Ice Cubes (`ice_cubes_group`), Rising Boiling Vapor Bubbles (`boiling_bubbles_group`),
 * and Rising Steam Plumes (`steam_plume_group`) to any thermal heating vessel / beaker / flask.
 */
function addThermalIceAndBoilingEffectsToVessel(
  root: THREE.Group,
  innerRadius: number,
  rimHeight: number,
): void {
  // 1. 3D Translucent Ice Cubes (`ice_cubes_group`) inside the vessel
  const iceGroup = new THREE.Group();
  iceGroup.name = 'ice_cubes_group';
  const iceMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    roughness: 0.14,
    metalness: 0.02,
    transmission: 0.72,
    transparent: true,
    opacity: 0.86,
    ior: 1.31,
    clearcoat: 0.9,
  });

  const cubeOffsets: Array<[number, number, number, number, number, number]> = [
    [-innerRadius * 0.34, 0.011, -innerRadius * 0.24, 0.2, 0.4, 0.1],
    [innerRadius * 0.32, 0.012, -innerRadius * 0.22, -0.3, 0.2, 0.3],
    [0.0, 0.014, innerRadius * 0.34, 0.15, -0.35, 0.2],
    [-innerRadius * 0.22, 0.024, innerRadius * 0.12, 0.4, 0.1, -0.25],
    [innerRadius * 0.24, 0.025, innerRadius * 0.16, -0.2, 0.5, 0.15],
    [0.0, 0.031, -innerRadius * 0.08, 0.25, -0.15, 0.35],
  ];
  const cubeSize = Math.max(0.011, innerRadius * 0.42);
  const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize * 0.85, cubeSize);

  cubeOffsets.forEach(([cx, cy, cz, rx, ry, rz], idx) => {
    const iceMesh = new THREE.Mesh(cubeGeo, iceMat);
    iceMesh.name = `ice_cube_${idx}`;
    iceMesh.position.set(cx, cy, cz);
    iceMesh.rotation.set(rx, ry, rz);
    iceMesh.renderOrder = 3;
    iceGroup.add(iceMesh);
  });
  iceGroup.visible = false;
  root.add(iceGroup);

  // 2. 3D Boiling Bubbles (`boiling_bubbles_group`) when water reaches ~100°C
  const bubblesGroup = new THREE.Group();
  bubblesGroup.name = 'boiling_bubbles_group';
  const bubbleMat = new THREE.MeshBasicMaterial({
    color: 0xf0f9ff,
    transparent: true,
    opacity: 0.78,
  });
  const bubbleGeo = new THREE.SphereGeometry(0.0026, 10, 10);
  for (let i = 0; i < 14; i += 1) {
    const ang = (i / 14) * Math.PI * 2 + (i % 3) * 0.4;
    const rad = innerRadius * (0.2 + ((i * 7) % 10) * 0.065);
    const bMesh = new THREE.Mesh(bubbleGeo, bubbleMat);
    bMesh.position.set(
      Math.cos(ang) * rad,
      0.008 + (i / 14) * (rimHeight * 0.52),
      Math.sin(ang) * rad,
    );
    bMesh.scale.setScalar(0.75 + (i % 4) * 0.22);
    bubblesGroup.add(bMesh);
  }
  bubblesGroup.visible = false;
  root.add(bubblesGroup);

  // 3. 3D Rising Steam Plume (`steam_plume_group`) above the vessel mouth when hot/boiling
  const steamGroup = new THREE.Group();
  steamGroup.name = 'steam_plume_group';
  const steamMat = new THREE.MeshBasicMaterial({
    color: 0xf8fafc,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  for (let s = 0; s < 3; s += 1) {
    const puffRing = new THREE.Mesh(
      new THREE.RingGeometry(innerRadius * (0.22 + s * 0.16), innerRadius * (0.58 + s * 0.22), 24).rotateX(
        -Math.PI / 2,
      ),
      steamMat,
    );
    puffRing.position.set(
      (s - 1) * 0.004,
      rimHeight + 0.008 + s * 0.015,
      ((s * 2) % 3 - 1) * 0.003,
    );
    puffRing.renderOrder = 6;
    steamGroup.add(puffRing);
  }
  steamGroup.visible = false;
  root.add(steamGroup);
}

export function buildProceduralEquipmentGroup(
  asset: AssetDefinition,
  isSoftwareGl: boolean,
): THREE.Group {
  const root = new THREE.Group();
  root.name = 'root';
  root.userData = {
    assetId: asset.assetId,
    assetVersion: asset.assetVersion,
    archetype: asset.geometry.proceduralArchetype,
  };

  const customHtmlMod = htmlEquipmentModuleRegistry.getModule(asset.assetId);
  if (customHtmlMod && customHtmlMod.buildEquipmentGroup) {
    try {
      addContactShadow(
        root,
        Math.max(0.05, asset.geometry.boundingBoxM.width * 0.55),
        Math.max(0.05, asset.geometry.boundingBoxM.depth * 0.55),
      );
      const builtGroup = customHtmlMod.buildEquipmentGroup(THREE, asset);
      root.add(builtGroup);
      return root;
    } catch (err) {
      console.warn('Fallback to procedural archetype after HTML module 3D error:', err);
    }
  }

  const arch: ProceduralArchetype = asset.geometry.proceduralArchetype;

  switch (arch) {
    case 'electronic-balance': {
      addContactShadow(root, 0.115, 0.135);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';

      // Hàm tạo tiết diện 2D bo tròn 4 góc kèm eo lượn cong hai bên hông đúng chuẩn OHAUS Scout
      const createScoutContourShape = (
        halfW: number,
        halfD: number,
        cornerR: number,
        waistIndent: number,
      ): THREE.Shape => {
        const s = new THREE.Shape();
        s.moveTo(-halfW + cornerR, -halfD);
        s.lineTo(halfW - cornerR, -halfD);
        s.quadraticCurveTo(halfW, -halfD, halfW, -halfD + cornerR);
        s.bezierCurveTo(
          halfW - waistIndent,
          -halfD * 0.25,
          halfW - waistIndent,
          halfD * 0.25,
          halfW,
          halfD - cornerR,
        );
        s.quadraticCurveTo(halfW, halfD, halfW - cornerR, halfD);
        s.quadraticCurveTo(0, halfD + 0.008, -halfW + cornerR, halfD);
        s.quadraticCurveTo(-halfW, halfD, -halfW, halfD - cornerR);
        s.bezierCurveTo(
          -halfW + waistIndent,
          halfD * 0.25,
          -halfW + waistIndent,
          -halfD * 0.25,
          -halfW,
          -halfD + cornerR,
        );
        s.quadraticCurveTo(-halfW, -halfD, -halfW + cornerR, -halfD);
        return s;
      };

      // 1. 4 Chân đế xoay chỉnh thăng bằng màu đỏ hồng (OHAUS Red Leveling Feet) ở 4 góc
      const redFootMat = new THREE.MeshPhysicalMaterial({
        color: 0xe11d48,
        roughness: 0.28,
        metalness: 0.12,
        clearcoat: 0.35,
      });
      const footPositions: [number, number, number][] = [
        [-0.073, 0.0045, -0.078],
        [0.073, 0.0045, -0.078],
        [-0.073, 0.0045, 0.080],
        [0.073, 0.0045, 0.080],
      ];
      footPositions.forEach(([fx, fy, fz]) => {
        const fGroup = new THREE.Group();
        fGroup.position.set(fx, fy, fz);
        const fDisc = new THREE.Mesh(
          new THREE.CylinderGeometry(0.0175, 0.016, 0.009, 24),
          redFootMat,
        );
        fDisc.castShadow = true;
        fGroup.add(fDisc);
        const knurlRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.0168, 0.0018, 10, 18),
          redFootMat,
        );
        knurlRing.rotation.x = Math.PI / 2;
        fGroup.add(knurlRing);
        bodyGroup.add(fGroup);
      });

      // 2. Đế gầm màu xám bạc nhạt bo tròn cạnh (Lower Gray Trim Chassis)
      const lowerShape = createScoutContourShape(0.088, 0.094, 0.022, 0.010);
      const lowerExtrude = new THREE.ExtrudeGeometry(lowerShape, {
        depth: 0.012,
        bevelEnabled: true,
        bevelThickness: 0.003,
        bevelSize: 0.003,
        bevelSegments: 6,
        curveSegments: 24,
      });
      lowerExtrude.rotateX(Math.PI / 2);
      const lowerChassisMat = new THREE.MeshStandardMaterial({
        color: 0xcbd5e1,
        roughness: 0.36,
        metalness: 0.14,
      });
      const lowerChassisMesh = new THREE.Mesh(lowerExtrude, lowerChassisMat);
      lowerChassisMesh.position.set(0, 0.020, 0);
      lowerChassisMesh.castShadow = true;
      lowerChassisMesh.receiveShadow = true;
      bodyGroup.add(lowerChassisMesh);

      // 3. Thân vỏ chính màu trắng sứ bo tròn mềm mại các cạnh (Upper Sculpted White ABS Body)
      const upperMainShape = createScoutContourShape(0.086, 0.092, 0.022, 0.011);
      const upperExtrude = new THREE.ExtrudeGeometry(upperMainShape, {
        depth: 0.022,
        bevelEnabled: true,
        bevelThickness: 0.006,
        bevelSize: 0.005,
        bevelSegments: 8,
        curveSegments: 28,
      });
      upperExtrude.rotateX(Math.PI / 2);
      const whiteBodyMat = new THREE.MeshPhysicalMaterial({
        color: 0xf8fafc,
        roughness: 0.20,
        metalness: 0.04,
        clearcoat: 0.45,
        clearcoatRoughness: 0.14,
      });
      const upperBodyMesh = new THREE.Mesh(upperExtrude, whiteBodyMat);
      upperBodyMesh.position.set(0, 0.041, -0.002);
      upperBodyMesh.castShadow = true;
      upperBodyMesh.receiveShadow = true;
      bodyGroup.add(upperBodyMesh);

      // Phần bệ nâng phía sau nơi đặt đĩa cân (bo tròn mượt)
      const rearDeckShape = createScoutContourShape(0.078, 0.058, 0.020, 0.004);
      const rearDeckGeo = new THREE.ExtrudeGeometry(rearDeckShape, {
        depth: 0.011,
        bevelEnabled: true,
        bevelThickness: 0.0045,
        bevelSize: 0.0045,
        bevelSegments: 8,
        curveSegments: 24,
      });
      rearDeckGeo.rotateX(Math.PI / 2);
      const rearDeckMesh = new THREE.Mesh(rearDeckGeo, whiteBodyMat);
      rearDeckMesh.position.set(0, 0.054, -0.026);
      rearDeckMesh.castShadow = true;
      rearDeckMesh.receiveShadow = true;
      bodyGroup.add(rearDeckMesh);

      // 4. Bảng điều khiển mặt trước nghiêng nhẹ (LCD trắng xanh + 4 phím viền đỏ + giọt nước, không để nhãn hiệu)
      const scoutPanelTex = createOhausScoutPanelTexture('0.00', 'g');
      const scoutPanelMat = new THREE.MeshBasicMaterial({
        map: scoutPanelTex,
        transparent: true,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
      });

      const frontDeckGroup = new THREE.Group();
      frontDeckGroup.position.set(0, 0.048, 0.058);
      frontDeckGroup.rotation.x = -1.12;

      const wedgeSupport = new THREE.Mesh(
        new THREE.BoxGeometry(0.158, 0.084, 0.008),
        whiteBodyMat,
      );
      wedgeSupport.position.set(0, 0, -0.003);
      frontDeckGroup.add(wedgeSupport);

      const lcdMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.156, 0.086),
        scoutPanelMat,
      );
      lcdMesh.name = 'scale_display';
      lcdMesh.userData.lastText = '0.00';
      lcdMesh.position.set(0, 0, 0.002);
      lcdMesh.renderOrder = 3;
      frontDeckGroup.add(lcdMesh);
      root.add(frontDeckGroup);

      // 5. Đĩa cân Inox hình chữ nhật bo tròn 4 góc & vát mép bóng mượt (`weighing_pan`) đúng chuẩn ảnh OHAUS Scout
      const panGroup = new THREE.Group();
      panGroup.name = 'weighing_pan';

      const subPlatterMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.044, 0.048, 0.008, 32),
        lowerChassisMat,
      );
      subPlatterMesh.position.set(0, 0.058, -0.026);
      panGroup.add(subPlatterMesh);

      const createRoundedRectShape = (w: number, d: number, r: number): THREE.Shape => {
        const hw = w / 2;
        const hd = d / 2;
        const sh = new THREE.Shape();
        sh.moveTo(-hw + r, -hd);
        sh.lineTo(hw - r, -hd);
        sh.quadraticCurveTo(hw, -hd, hw, -hd + r);
        sh.lineTo(hw, hd - r);
        sh.quadraticCurveTo(hw, hd, hw - r, hd);
        sh.lineTo(-hw + r, hd);
        sh.quadraticCurveTo(-hw, hd, -hw, hd - r);
        sh.lineTo(-hw, -hd + r);
        sh.quadraticCurveTo(-hw, -hd, -hw + r, -hd);
        return sh;
      };

      const panShape = createRoundedRectShape(0.142, 0.122, 0.020);
      const panGeo = new THREE.ExtrudeGeometry(panShape, {
        depth: 0.0055,
        bevelEnabled: true,
        bevelThickness: 0.0024,
        bevelSize: 0.0024,
        bevelSegments: 6,
        curveSegments: 24,
      });
      panGeo.rotateX(Math.PI / 2);

      const stainlessPanMat = createReflectiveMetalWeightMaterial(
        0xe2e8f0,
        '#cbd5e1',
        '#f8fafc',
        0.15,
        0.90,
      );

      const panMesh = new THREE.Mesh(panGeo, stainlessPanMat);
      panMesh.name = 'pan_plate';
      panMesh.position.set(0, 0.0665, -0.026);
      panMesh.castShadow = true;
      panMesh.receiveShadow = true;
      panGroup.add(panMesh);
      root.add(panGroup);

      // 7. Measurement Anchor trên mặt đĩa cân
      const anchor = new THREE.Object3D();
      anchor.name = 'measurement_anchor';
      anchor.position.set(0, 0.068, -0.026);
      root.add(anchor);

      root.add(bodyGroup);
      break;
    }

    case 'graduated-cylinder': {
      addContactShadow(root, 0.042, 0.042);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';

      const glassMat = createGlassMaterial(isSoftwareGl);

      // 1. Hexagonal stable base
      const baseGeo = new THREE.CylinderGeometry(0.032, 0.036, 0.012, 6);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0xcbd5e1,
        roughness: 0.25,
        metalness: 0.1,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 0.006;
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      bodyGroup.add(baseMesh);

      // 2. Main cylinder glass wall
      const tubeGeo = new THREE.CylinderGeometry(0.017, 0.017, 0.23, 32, 1, true);
      const tubeMesh = new THREE.Mesh(tubeGeo, glassMat);
      tubeMesh.position.y = 0.127;
      tubeMesh.renderOrder = 4;
      bodyGroup.add(tubeMesh);

      // 3. Top pouring lip rim + sculpted V-spout on +X side (`pouring_lip`)
      const rimGeo = new THREE.TorusGeometry(0.017, 0.0022, 12, 32);
      rimGeo.rotateX(Math.PI / 2);
      const rimMesh = new THREE.Mesh(rimGeo, glassMat);
      rimMesh.position.y = 0.242;
      rimMesh.renderOrder = 4;
      bodyGroup.add(rimMesh);

      const lipMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0038, 0.0055, 0.012, 14, 1, true, -Math.PI * 0.5, Math.PI),
        glassMat,
      );
      lipMesh.name = 'pouring_lip';
      lipMesh.position.set(0.0185, 0.241, 0);
      lipMesh.rotation.z = -0.52;
      lipMesh.renderOrder = 4;
      bodyGroup.add(lipMesh);

      // 4. Graduation marks overlay cylinder (`scale_marks`)
      const scaleTex = createGraduationCanvasTexture(10, 100, 10, '100 ml : 1 ml');
      const scaleGeo = new THREE.CylinderGeometry(0.0173, 0.0173, 0.20, 32, 1, true);
      const scaleMat = new THREE.MeshBasicMaterial({
        map: scaleTex,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const scaleMesh = new THREE.Mesh(scaleGeo, scaleMat);
      scaleMesh.name = 'scale_marks';
      scaleMesh.position.y = 0.125;
      scaleMesh.renderOrder = 5;
      root.add(scaleMesh);

      // 5. Internal water column & 3D concave capillary meniscus (`liquid_surface`)
      const liquidGroup = new THREE.Group();
      liquidGroup.name = 'liquid_surface';
      const waterMat = createWaterMaterial(0x0ea5e9, 0.78);
      const waterHeight = 0.105; // ~50 ml default
      const waterGeo = new THREE.CylinderGeometry(0.0156, 0.0156, waterHeight, 32);
      waterGeo.translate(0, waterHeight / 2, 0);
      const waterMesh = new THREE.Mesh(waterGeo, waterMat);
      waterMesh.renderOrder = 2;
      liquidGroup.add(waterMesh);

      addConcaveMeniscusAndRipples(liquidGroup, 0.0156, waterHeight);

      liquidGroup.position.y = 0.015;
      root.add(liquidGroup);
      root.add(bodyGroup);
      break;
    }

    case 'beaker-250': {
      addContactShadow(root, 0.048, 0.048);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';
      const glassMat = createGlassMaterial(isSoftwareGl);

      // 1. Glass bottom disc
      const bottomGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.004, 32);
      const bottomMesh = new THREE.Mesh(bottomGeo, glassMat);
      bottomMesh.position.y = 0.002;
      bottomMesh.renderOrder = 3;
      bodyGroup.add(bottomMesh);

      // 2. Beaker wall
      const wallGeo = new THREE.CylinderGeometry(0.036, 0.035, 0.095, 32, 1, true);
      const wallMesh = new THREE.Mesh(wallGeo, glassMat);
      wallMesh.position.y = 0.0495;
      wallMesh.renderOrder = 4;
      bodyGroup.add(wallMesh);

      // 3. Rim torus + V-shaped pouring spout lip on +X side (`pouring_lip`)
      const rimGeo = new THREE.TorusGeometry(0.036, 0.002, 12, 32);
      rimGeo.rotateX(Math.PI / 2);
      const rimMesh = new THREE.Mesh(rimGeo, glassMat);
      rimMesh.position.y = 0.097;
      rimMesh.renderOrder = 4;
      bodyGroup.add(rimMesh);

      const beakerLip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0055, 0.0085, 0.015, 16, 1, true, -Math.PI * 0.5, Math.PI),
        glassMat,
      );
      beakerLip.name = 'pouring_lip';
      beakerLip.position.set(0.038, 0.096, 0);
      beakerLip.rotation.z = -0.58;
      beakerLip.renderOrder = 4;
      bodyGroup.add(beakerLip);

      // 4. Scale markings (`scale_marks`)
      const scaleTex = createGraduationCanvasTexture(50, 250, 50, '250 ml ±5%');
      const scaleGeo = new THREE.CylinderGeometry(0.0363, 0.0353, 0.08, 32, 1, true);
      const scaleMat = new THREE.MeshBasicMaterial({
        map: scaleTex,
        transparent: true,
        depthWrite: false,
      });
      const scaleMesh = new THREE.Mesh(scaleGeo, scaleMat);
      scaleMesh.name = 'scale_marks';
      scaleMesh.position.y = 0.048;
      scaleMesh.renderOrder = 5;
      root.add(scaleMesh);

      // 5. Liquid inside (`liquid_surface`) with glossy surface cap, 3D meniscus & ripple ring
      const liquidGroup = new THREE.Group();
      liquidGroup.name = 'liquid_surface';
      const liquidGeo = new THREE.CylinderGeometry(0.0338, 0.0335, 0.038, 32);
      liquidGeo.translate(0, 0.019, 0);
      const liquidMat = createWaterMaterial(0x0ea5e9, 0.78);
      const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
      liquidMesh.renderOrder = 2;
      liquidGroup.add(liquidMesh);

      addConcaveMeniscusAndRipples(liquidGroup, 0.0338, 0.038);

      liquidGroup.position.y = 0.004;

      root.add(liquidGroup);
      addThermalIceAndBoilingEffectsToVessel(root, 0.032, 0.097);
      root.add(bodyGroup);
      break;
    }

    case 'overflow-can': {
      addContactShadow(root, 0.058, 0.058);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';
      const glassMat = createGlassMaterial(isSoftwareGl);

      // 0. Integrated Laboratory Elevation Pedestal (h = 0.058 m) so the angled overflow spout tip (y = 0.125 m)
      // sits cleanly ABOVE the 0.098 m rim of the 250 ml catch beaker!
      const pedMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.36,
        metalness: 0.65,
      });
      const pedBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.046, 0.050, 0.010, 36),
        pedMat,
      );
      pedBase.position.y = 0.005;
      pedBase.castShadow = true;
      pedBase.receiveShadow = true;
      bodyGroup.add(pedBase);

      const pedTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.044, 0.044, 0.008, 36),
        pedMat,
      );
      pedTop.position.y = 0.054;
      pedTop.castShadow = true;
      pedTop.receiveShadow = true;
      bodyGroup.add(pedTop);

      [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].forEach((ang) => {
        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.0045, 0.0045, 0.044, 14),
          new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.25, metalness: 0.85 }),
        );
        pillar.position.set(Math.cos(ang) * 0.036, 0.031, Math.sin(ang) * 0.036);
        pillar.castShadow = true;
        bodyGroup.add(pillar);
      });

      const elevY = 0.058; // Elevation offset of the overflow can floor

      // 1. Heavy molded Borosilicate glass base disc with stability ring
      const baseRingGeo = new THREE.CylinderGeometry(0.041, 0.043, 0.006, 36);
      const baseRingMat = new THREE.MeshStandardMaterial({
        color: 0xcbd5e1,
        roughness: 0.22,
        metalness: 0.12,
      });
      const baseRingMesh = new THREE.Mesh(baseRingGeo, baseRingMat);
      baseRingMesh.position.y = elevY + 0.003;
      baseRingMesh.castShadow = true;
      baseRingMesh.receiveShadow = true;
      bodyGroup.add(baseRingMesh);

      // 2. Main cylindrical glass vessel wall (height 130 mm, Ø 80 mm)
      const canGeo = new THREE.CylinderGeometry(0.040, 0.040, 0.130, 36, 1, true);
      const canMesh = new THREE.Mesh(canGeo, glassMat);
      canMesh.position.y = elevY + 0.071;
      canMesh.renderOrder = 4;
      bodyGroup.add(canMesh);

      // 3. Top beaded glass rim torus (at y = 0.194 m)
      const rimGeo = new THREE.TorusGeometry(0.040, 0.0022, 12, 36);
      rimGeo.rotateX(Math.PI / 2);
      const rimMesh = new THREE.Mesh(rimGeo, glassMat);
      rimMesh.position.y = elevY + 0.136;
      rimMesh.renderOrder = 4;
      bodyGroup.add(rimMesh);

      // 4. Printed Graduation Scale (50 - 210 ml) & Cyan Overflow Threshold Line at y = elevY + 0.096 m (`scale_marks`)
      const scaleTex = createGraduationCanvasTexture(50, 210, 40, 'BÌNH TRÀN 210 ml');
      const scaleGeo = new THREE.CylinderGeometry(0.0404, 0.0404, 0.096, 36, 1, true);
      const scaleMat = new THREE.MeshBasicMaterial({
        map: scaleTex,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const scaleMesh = new THREE.Mesh(scaleGeo, scaleMat);
      scaleMesh.name = 'scale_marks';
      scaleMesh.position.y = elevY + 0.056;
      scaleMesh.renderOrder = 5;
      root.add(scaleMesh);

      // Overflow level indicator ring right at the spout mouth (210.0 ml -> y = 0.154 m)
      const overflowLevelRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.0405, 0.0009, 8, 36),
        new THREE.MeshBasicMaterial({ color: 0x00bceb }),
      );
      overflowLevelRing.rotation.x = Math.PI / 2;
      overflowLevelRing.position.y = elevY + 0.096;
      bodyGroup.add(overflowLevelRing);

      // 5. Flared glass spout collar + angled overflow spout tube on +X side
      // Inner mouth at (0.040, 0.154, 0), sloping down at -32 deg to tip at (0.086, 0.125, 0) — ABOVE the 0.098 m beaker rim!
      const collarGeo = new THREE.CylinderGeometry(0.0068, 0.0095, 0.010, 20, 1, true);
      const collarMesh = new THREE.Mesh(collarGeo, glassMat);
      collarMesh.position.set(0.042, elevY + 0.095, 0);
      collarMesh.rotation.z = -Math.PI / 2 - 0.56;
      collarMesh.renderOrder = 4;
      bodyGroup.add(collarMesh);

      const spoutGeo = new THREE.CylinderGeometry(0.0048, 0.0058, 0.056, 20, 1, true);
      const spoutMesh = new THREE.Mesh(spoutGeo, glassMat);
      spoutMesh.position.set(0.063, elevY + 0.0815, 0);
      spoutMesh.rotation.z = -Math.PI / 2 - 0.56;
      spoutMesh.renderOrder = 4;
      bodyGroup.add(spoutMesh);

      // Spout tip beaded lip at (0.086, 0.125, 0)
      const spoutRim = new THREE.Mesh(
        new THREE.TorusGeometry(0.0048, 0.0008, 8, 16),
        glassMat,
      );
      spoutRim.position.set(0.086, elevY + 0.067, 0);
      spoutRim.rotation.y = Math.PI / 2;
      spoutRim.rotation.x = 0.56;
      bodyGroup.add(spoutRim);

      // Water inside the angled spout tube (`spout_water` — strictly hidden when idle; ONLY visible during active overflow!)
      const spoutWaterGeo = new THREE.CylinderGeometry(0.0033, 0.0041, 0.054, 18);
      const spoutWaterMat = createStreamMaterial(0x0ea5e9, 0.88);
      const spoutWater = new THREE.Mesh(spoutWaterGeo, spoutWaterMat);
      spoutWater.name = 'spout_water';
      spoutWater.position.set(0.063, elevY + 0.0815, 0);
      spoutWater.rotation.z = -Math.PI / 2 - 0.56;
      spoutWater.visible = false;
      spoutWater.renderOrder = 3;
      root.add(spoutWater);

      // 6. Calibrated water column (`liquid_surface`)
      const liquidGroup = new THREE.Group();
      liquidGroup.name = 'liquid_surface';
      const waterHeight = 0.045;
      const waterGeo = new THREE.CylinderGeometry(0.0384, 0.0384, waterHeight, 36);
      waterGeo.translate(0, waterHeight / 2, 0);
      const waterMat = createWaterMaterial(0x0ea5e9, 0.78);
      const waterMesh = new THREE.Mesh(waterGeo, waterMat);
      waterMesh.renderOrder = 2;
      liquidGroup.add(waterMesh);

      addConcaveMeniscusAndRipples(liquidGroup, 0.0384, waterHeight);

      liquidGroup.position.y = elevY + 0.006;
      root.add(liquidGroup);

      // 7. Parabolic Gravity-Curved Water Jet (`spout_stream` arcing from spout tip (0.086, 0.125, 0) into catch beaker)
      // Strictly hidden (`visible = false`) unless actively overflowing!
      const streamGroup = new THREE.Group();
      streamGroup.name = 'spout_stream';
      const jetCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.085, elevY + 0.067, 0),
        new THREE.Vector3(0.100, elevY + 0.048, 0),
        new THREE.Vector3(0.112, elevY + 0.012, 0),
        new THREE.Vector3(0.122, 0.024, 0),
      ]);
      const streamOuter = new THREE.Mesh(
        new THREE.TubeGeometry(jetCurve, 28, 0.0028, 14, false),
        createStreamMaterial(0x38bdf8, 0.86),
      );
      streamOuter.name = 'stream_outer';
      streamOuter.renderOrder = 5;
      streamGroup.add(streamOuter);

      const streamCore = new THREE.Mesh(
        new THREE.TubeGeometry(jetCurve, 24, 0.0014, 10, false),
        new THREE.MeshBasicMaterial({
          color: 0xe0f2fe,
          transparent: true,
          opacity: 0.92,
          depthWrite: false,
        }),
      );
      streamCore.name = 'stream_core';
      streamCore.renderOrder = 6;
      streamGroup.add(streamCore);

      // 5 Cascading water droplets along the parabolic trajectory
      const dropMat = createStreamMaterial(0x7dd3fc, 0.92);
      const dropGeo = new THREE.SphereGeometry(0.0026, 12, 12);
      for (let d = 0; d < 5; d++) {
        const drop = new THREE.Mesh(dropGeo, dropMat);
        drop.name = `droplet_${d}`;
        const pt = jetCurve.getPoint(d / 5);
        drop.position.copy(pt);
        drop.scale.set(0.85, 1.35, 0.85);
        drop.renderOrder = 6;
        streamGroup.add(drop);
      }

      // 2 Concentric impact splash rings inside the catch beaker
      for (let r = 0; r < 2; r++) {
        const splashRing = new THREE.Mesh(
          new THREE.RingGeometry(0.004 + r * 0.005, 0.008 + r * 0.007, 24).rotateX(-Math.PI / 2),
          new THREE.MeshBasicMaterial({
            color: r === 0 ? 0xe0f2fe : 0x7dd3fc,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.88 - r * 0.25,
            depthWrite: false,
          }),
        );
        splashRing.name = `splash_ring_${r}`;
        splashRing.position.set(0.122, 0.026 + r * 0.001, 0);
        splashRing.renderOrder = 6;
        streamGroup.add(splashRing);
      }

      streamGroup.visible = false;
      root.add(streamGroup);

      // 8. Spout tip anchor
      const anchor = new THREE.Object3D();
      anchor.name = 'measurement_anchor';
      anchor.position.set(0.086, elevY + 0.067, 0);
      root.add(anchor);

      root.add(bodyGroup);
      break;
    }

    case 'spring-dynamometer': {
      addContactShadow(root, 0.035, 0.035);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';

      // 1. Small display stand base so it sits upright on bench when not hung
      const standBaseGeo = new THREE.CylinderGeometry(0.026, 0.03, 0.006, 24);
      const darkMetalMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.4,
        metalness: 0.7,
      });
      const chromeMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.15,
        metalness: 0.92,
      });
      const standBase = new THREE.Mesh(standBaseGeo, darkMetalMat);
      standBase.position.y = 0.003;
      bodyGroup.add(standBase);

      // 2. Outer Acrylic Tube
      const tubeGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.16, 24, 1, true);
      const glassMat = createGlassMaterial(isSoftwareGl);
      const tubeMesh = new THREE.Mesh(tubeGeo, glassMat);
      tubeMesh.position.y = 0.12;
      tubeMesh.renderOrder = 4;
      bodyGroup.add(tubeMesh);

      // 3. Scale plates inside (`scale_marks` at 0° and 90° so readable from 360° around tube)
      const scaleTex = createGraduationCanvasTexture(0, 5, 1, '5.0 N : 0.1 N');
      const plateGeo = new THREE.PlaneGeometry(0.022, 0.145);
      const plateMat = new THREE.MeshBasicMaterial({
        map: scaleTex,
        transparent: true,
        side: THREE.DoubleSide,
      });
      const plateMesh = new THREE.Mesh(plateGeo, plateMat);
      plateMesh.name = 'scale_marks';
      plateMesh.position.set(0, 0.12, 0.002);
      root.add(plateMesh);

      const plateMeshCross = new THREE.Mesh(plateGeo, plateMat);
      plateMeshCross.name = 'scale_marks_cross';
      plateMeshCross.position.set(0, 0.12, 0);
      plateMeshCross.rotation.y = Math.PI / 2;
      root.add(plateMeshCross);

      // 4. Top cap & suspension ring
      const capGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.014, 24);
      const capMesh = new THREE.Mesh(capGeo, darkMetalMat);
      capMesh.position.y = 0.205;
      bodyGroup.add(capMesh);

      const topRingGeo = new THREE.TorusGeometry(0.01, 0.0022, 12, 24);
      const topRing = new THREE.Mesh(topRingGeo, chromeMat);
      topRing.position.y = 0.222;
      bodyGroup.add(topRing);

      // 4b. Helical Steel Spring Coil inside the tube (`spring_coil`, anchored at top y = 0.196 m, stretches downward with load)
      const springGroup = new THREE.Group();
      springGroup.name = 'spring_coil';
      springGroup.position.set(0, 0.196, 0);
      const turns = 12;
      const coilPoints: THREE.Vector3[] = [];
      for (let i = 0; i <= turns * 12; i++) {
        const t = i / (turns * 12);
        const angle = t * turns * Math.PI * 2;
        coilPoints.push(
          new THREE.Vector3(
            Math.cos(angle) * 0.0062,
            -t * 0.044,
            Math.sin(angle) * 0.0062,
          ),
        );
      }
      const coilCurve = new THREE.CatmullRomCurve3(coilPoints);
      const coilGeo = new THREE.TubeGeometry(coilCurve, 96, 0.0011, 8, false);
      const coilMesh = new THREE.Mesh(coilGeo, chromeMat);
      springGroup.add(coilMesh);
      root.add(springGroup);

      // 5. Internal plunger, red indicator disc & bottom hook (`plunger`)
      const plungerGroup = new THREE.Group();
      plungerGroup.name = 'plunger';

      const rodGeo = new THREE.CylinderGeometry(0.0025, 0.0025, 0.16, 12);
      const rodMesh = new THREE.Mesh(rodGeo, chromeMat);
      rodMesh.position.y = 0.095;
      plungerGroup.add(rodMesh);

      const indicatorGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.005, 20);
      const indicatorMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
      const indicatorMesh = new THREE.Mesh(indicatorGeo, indicatorMat);
      indicatorMesh.position.y = 0.155;
      plungerGroup.add(indicatorMesh);

      const hookGeo = new THREE.TorusGeometry(0.008, 0.002, 10, 20, Math.PI * 1.35);
      const hookMesh = new THREE.Mesh(hookGeo, chromeMat);
      hookMesh.position.y = 0.015;
      plungerGroup.add(hookMesh);

      root.add(plungerGroup);
      root.add(bodyGroup);
      break;
    }

    case 'vernier-caliper': {
      addContactShadow(root, 0.12, 0.045);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';

      const satinSteelMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.22,
        metalness: 0.85,
      });
      const darkSteelMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.35,
        metalness: 0.75,
      });

      // 1. Main beam with millimeter scale (`scale_marks`)
      const beamGeo = new THREE.BoxGeometry(0.22, 0.006, 0.018);
      const beamMesh = new THREE.Mesh(beamGeo, satinSteelMat);
      beamMesh.position.set(0, 0.005, 0);
      beamMesh.castShadow = true;
      bodyGroup.add(beamMesh);

      const rulerTex = createRulerCanvasTexture(150);
      const scalePlaneGeo = new THREE.PlaneGeometry(0.21, 0.015);
      scalePlaneGeo.rotateX(-Math.PI / 2);
      const scalePlaneMat = new THREE.MeshBasicMaterial({
        map: rulerTex,
        side: THREE.DoubleSide,
      });
      const scalePlane = new THREE.Mesh(scalePlaneGeo, scalePlaneMat);
      scalePlane.name = 'scale_marks';
      scalePlane.position.set(0, 0.0082, 0);
      root.add(scalePlane);

      const scaleSideFront = new THREE.Mesh(
        new THREE.PlaneGeometry(0.21, 0.0055),
        scalePlaneMat,
      );
      scaleSideFront.position.set(0, 0.005, 0.0092);
      root.add(scaleSideFront);

      const scaleSideBack = new THREE.Mesh(
        new THREE.PlaneGeometry(0.21, 0.0055),
        scalePlaneMat,
      );
      scaleSideBack.position.set(0, 0.005, -0.0092);
      scaleSideBack.rotation.y = Math.PI;
      root.add(scaleSideBack);

      // 2. Fixed external jaw (left side)
      const fixedJawGeo = new THREE.BoxGeometry(0.014, 0.006, 0.046);
      const fixedJaw = new THREE.Mesh(fixedJawGeo, satinSteelMat);
      fixedJaw.position.set(-0.103, 0.005, 0.024);
      fixedJaw.castShadow = true;
      bodyGroup.add(fixedJaw);

      // 3. Sliding Vernier carriage + movable jaw (`plunger`)
      const sliderGroup = new THREE.Group();
      sliderGroup.name = 'plunger';

      const carriageGeo = new THREE.BoxGeometry(0.042, 0.008, 0.022);
      const carriage = new THREE.Mesh(carriageGeo, darkSteelMat);
      carriage.position.set(0, 0.0055, 0);
      sliderGroup.add(carriage);

      const movableJaw = new THREE.Mesh(fixedJawGeo, satinSteelMat);
      movableJaw.position.set(-0.014, 0.005, 0.024);
      sliderGroup.add(movableJaw);

      const lockScrewGeo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.006, 12);
      const lockScrew = new THREE.Mesh(lockScrewGeo, darkSteelMat);
      lockScrew.position.set(0.005, 0.012, -0.008);
      sliderGroup.add(lockScrew);

      // Default 25 mm opening
      sliderGroup.position.x = -0.052;
      root.add(sliderGroup);
      root.add(bodyGroup);
      break;
    }

    case 'calibration-weight': {
      addContactShadow(root, 0.02, 0.02);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';

      const brassMat = createReflectiveMetalWeightMaterial(
        0xfbbf24,
        '#d97706',
        '#fef08a',
        0.12,
        0.95,
      );
      const highlightRimMat = new THREE.MeshPhysicalMaterial({
        color: 0xfef08a,
        roughness: 0.06,
        metalness: 0.98,
        envMapIntensity: 1.9,
        clearcoat: 0.9,
      });

      const cylGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.024, 36);
      const cylMesh = new THREE.Mesh(cylGeo, brassMat);
      cylMesh.position.y = 0.012;
      cylMesh.castShadow = true;
      cylMesh.receiveShadow = true;
      bodyGroup.add(cylMesh);

      const topBevelRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.0118, 0.0008, 12, 36).rotateX(Math.PI / 2),
        highlightRimMat,
      );
      topBevelRing.position.y = 0.024;
      bodyGroup.add(topBevelRing);

      const bottomBevelRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.0118, 0.0007, 10, 36).rotateX(Math.PI / 2),
        highlightRimMat,
      );
      bottomBevelRing.position.y = 0.001;
      bodyGroup.add(bottomBevelRing);

      const neckGeo = new THREE.CylinderGeometry(0.005, 0.007, 0.005, 24);
      const neckMesh = new THREE.Mesh(neckGeo, brassMat);
      neckMesh.position.y = 0.0265;
      bodyGroup.add(neckMesh);

      const knobGeo = new THREE.CylinderGeometry(0.0085, 0.006, 0.005, 28);
      const knobMesh = new THREE.Mesh(knobGeo, highlightRimMat);
      knobMesh.name = 'handle';
      knobMesh.position.y = 0.0315;
      root.add(knobMesh);
      root.add(bodyGroup);
      break;
    }

    case 'solid-cylinder': {
      addContactShadow(root, 0.022, 0.022);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';

      const alumMat = createReflectiveMetalWeightMaterial(
        0xe2e8f0,
        '#94a3b8',
        '#ffffff',
        0.13,
        0.94,
      );
      const specularEdgeMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.06,
        metalness: 0.98,
        envMapIntensity: 1.85,
        clearcoat: 0.85,
      });

      const cylGeo = new THREE.CylinderGeometry(0.013, 0.013, 0.050, 40);
      const cylMesh = new THREE.Mesh(cylGeo, alumMat);
      cylMesh.position.y = 0.025;
      cylMesh.castShadow = true;
      cylMesh.receiveShadow = true;
      bodyGroup.add(cylMesh);

      const topChamfer = new THREE.Mesh(
        new THREE.TorusGeometry(0.0128, 0.0008, 12, 36).rotateX(Math.PI / 2),
        specularEdgeMat,
      );
      topChamfer.position.y = 0.0498;
      bodyGroup.add(topChamfer);

      const bottomChamfer = new THREE.Mesh(
        new THREE.TorusGeometry(0.0128, 0.0007, 10, 36).rotateX(Math.PI / 2),
        specularEdgeMat,
      );
      bottomChamfer.position.y = 0.0008;
      bodyGroup.add(bottomChamfer);

      const hookGeo = new THREE.TorusGeometry(0.0045, 0.0013, 12, 24);
      const hookMesh = new THREE.Mesh(hookGeo, specularEdgeMat);
      hookMesh.name = 'handle';
      hookMesh.position.y = 0.0535;
      root.add(hookMesh);
      root.add(bodyGroup);
      break;
    }

    case 'solid-sphere': {
      addContactShadow(root, 0.022, 0.022);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';

      const ringGeo = new THREE.TorusGeometry(0.009, 0.002, 12, 24);
      ringGeo.rotateX(Math.PI / 2);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.y = 0.002;
      bodyGroup.add(ringMesh);

      const sphereGeo = new THREE.SphereGeometry(0.015, 40, 32);
      const steelMat = createReflectiveMetalWeightMaterial(
        0xf1f5f9,
        '#cbd5e1',
        '#ffffff',
        0.08,
        0.97,
      );
      const sphereMesh = new THREE.Mesh(sphereGeo, steelMat);
      sphereMesh.position.y = 0.016;
      sphereMesh.castShadow = true;
      sphereMesh.receiveShadow = true;
      bodyGroup.add(sphereMesh);

      root.add(bodyGroup);
      break;
    }

    case 'solid-block': {
      addContactShadow(root, 0.028, 0.020);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';

      const brassMat = createReflectiveMetalWeightMaterial(
        0xf59e0b,
        '#b45309',
        '#fde68a',
        0.15,
        0.93,
      );

      const blockShape = new THREE.Shape();
      const bw = 0.040;
      const bd = 0.024;
      const br = 0.003;
      blockShape.moveTo(-bw / 2 + br, -bd / 2);
      blockShape.lineTo(bw / 2 - br, -bd / 2);
      blockShape.quadraticCurveTo(bw / 2, -bd / 2, bw / 2, -bd / 2 + br);
      blockShape.lineTo(bw / 2, bd / 2 - br);
      blockShape.quadraticCurveTo(bw / 2, bd / 2, bw / 2 - br, bd / 2);
      blockShape.lineTo(-bw / 2 + br, bd / 2);
      blockShape.quadraticCurveTo(-bw / 2, bd / 2, -bw / 2, bd / 2 - br);
      blockShape.lineTo(-bw / 2, -bd / 2 + br);
      blockShape.quadraticCurveTo(-bw / 2, -bd / 2, -bw / 2 + br, -bd / 2);

      const boxGeo = new THREE.ExtrudeGeometry(blockShape, {
        depth: 0.016,
        bevelEnabled: true,
        bevelThickness: 0.0012,
        bevelSize: 0.0012,
        bevelSegments: 4,
      });
      boxGeo.rotateX(Math.PI / 2);
      const boxMesh = new THREE.Mesh(boxGeo, brassMat);
      boxMesh.position.y = 0.0172;
      boxMesh.castShadow = true;
      boxMesh.receiveShadow = true;
      bodyGroup.add(boxMesh);

      const bossGeo = new THREE.BoxGeometry(0.034, 0.002, 0.018);
      const bossMesh = new THREE.Mesh(bossGeo, brassMat);
      bossMesh.position.y = 0.019;
      bodyGroup.add(bossMesh);

      root.add(bodyGroup);
      break;
    }

    case 'hollow-cylinder': {
      addContactShadow(root, 0.026, 0.026);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';

      const copperMat = new THREE.MeshStandardMaterial({
        color: 0xea580c,
        roughness: 0.28,
        metalness: 0.82,
      });
      const innerMat = new THREE.MeshStandardMaterial({
        color: 0x431407,
        roughness: 0.7,
        metalness: 0.4,
        side: THREE.DoubleSide,
      });

      const outerGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.055, 32, 1, true);
      const outerMesh = new THREE.Mesh(outerGeo, copperMat);
      outerMesh.position.y = 0.0275;
      outerMesh.castShadow = true;
      bodyGroup.add(outerMesh);

      const innerGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.055, 28, 1, true);
      const innerMesh = new THREE.Mesh(innerGeo, innerMat);
      innerMesh.position.y = 0.0275;
      bodyGroup.add(innerMesh);

      const capRingGeo = new THREE.RingGeometry(0.011, 0.018, 32);
      capRingGeo.rotateX(-Math.PI / 2);
      const topRing = new THREE.Mesh(capRingGeo, copperMat);
      topRing.position.y = 0.055;
      bodyGroup.add(topRing);

      root.add(bodyGroup);
      break;
    }

    case 'erlenmeyer-flask': {
      addContactShadow(root, 0.05, 0.05);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';
      const glassMat = createGlassMaterial(isSoftwareGl);

      // 1. Conical lower body
      const coneGeo = new THREE.CylinderGeometry(0.017, 0.042, 0.095, 32, 1, true);
      const coneMesh = new THREE.Mesh(coneGeo, glassMat);
      coneMesh.position.y = 0.048;
      coneMesh.renderOrder = 4;
      bodyGroup.add(coneMesh);

      // 2. Cylindrical neck
      const neckGeo = new THREE.CylinderGeometry(0.017, 0.017, 0.042, 28, 1, true);
      const neckMesh = new THREE.Mesh(neckGeo, glassMat);
      neckMesh.position.y = 0.116;
      neckMesh.renderOrder = 4;
      bodyGroup.add(neckMesh);

      // 3. Rim + Pouring Lip (`pouring_lip`)
      const rimGeo = new THREE.TorusGeometry(0.018, 0.0022, 12, 28);
      rimGeo.rotateX(Math.PI / 2);
      const rimMesh = new THREE.Mesh(rimGeo, glassMat);
      rimMesh.position.y = 0.137;
      rimMesh.renderOrder = 4;
      bodyGroup.add(rimMesh);

      const flaskLip = new THREE.Object3D();
      flaskLip.name = 'pouring_lip';
      flaskLip.position.set(0.018, 0.137, 0);
      bodyGroup.add(flaskLip);

      // 4. Liquid inside (`liquid_surface`)
      const liquidGroup = new THREE.Group();
      liquidGroup.name = 'liquid_surface';
      const solGeo = new THREE.CylinderGeometry(0.031, 0.040, 0.036, 28);
      solGeo.translate(0, 0.018, 0);
      const solMat = createWaterMaterial(0x0ea5e9, 0.76);
      const solMesh = new THREE.Mesh(solGeo, solMat);
      solMesh.renderOrder = 2;
      liquidGroup.add(solMesh);
      addConcaveMeniscusAndRipples(liquidGroup, 0.031, 0.036);
      liquidGroup.position.y = 0.003;

      root.add(liquidGroup);
      addThermalIceAndBoilingEffectsToVessel(root, 0.028, 0.137);
      root.add(bodyGroup);
      break;
    }

    case 'retort-stand': {
      addContactShadow(root, 0.09, 0.12);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';

      const castIronMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.65,
        metalness: 0.55,
      });
      const chromeRodMat = new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        roughness: 0.16,
        metalness: 0.92,
      });

      // 1. Heavy rectangular base (slim profile so tripod or burner can sit cleanly over it)
      const baseGeo = new THREE.BoxGeometry(0.14, 0.008, 0.21);
      const baseMesh = new THREE.Mesh(baseGeo, castIronMat);
      baseMesh.position.set(0, 0.004, -0.025);
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      bodyGroup.add(baseMesh);

      // 2. Vertical steel rod at rear (z = -0.088 m)
      const rodGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 0.44, 20);
      const rodMesh = new THREE.Mesh(rodGeo, chromeRodMat);
      rodMesh.position.set(0, 0.228, -0.088);
      rodMesh.castShadow = true;
      bodyGroup.add(rodMesh);

      // 3. Bosshead & Clamp arm (`handle`) for holding Thermometer at (0, 0.312, 0)
      const clampGroup = new THREE.Group();
      clampGroup.name = 'handle';

      const bossGeo = new THREE.BoxGeometry(0.024, 0.028, 0.032);
      const bossMesh = new THREE.Mesh(bossGeo, castIronMat);
      bossMesh.position.set(0, 0.312, -0.088);
      clampGroup.add(bossMesh);

      const armGeo = new THREE.CylinderGeometry(0.0038, 0.0038, 0.09, 16);
      armGeo.rotateX(Math.PI / 2);
      const armMesh = new THREE.Mesh(armGeo, chromeRodMat);
      armMesh.position.set(0, 0.312, -0.043);
      clampGroup.add(armMesh);

      const hookGeo = new THREE.TorusGeometry(0.0085, 0.0022, 10, 24).rotateX(Math.PI / 2);
      const hookMesh = new THREE.Mesh(hookGeo, chromeRodMat);
      hookMesh.position.set(0, 0.312, 0.0);
      clampGroup.add(hookMesh);

      const anchor = new THREE.Object3D();
      anchor.name = 'measurement_anchor';
      anchor.position.set(0, 0.312, 0.0);
      root.add(anchor);

      root.add(clampGroup);
      root.add(bodyGroup);
      break;
    }

    case 'optical-lens': {
      addContactShadow(root, 0.045, 0.045);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';

      const blackAnodizedMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.4,
        metalness: 0.65,
      });

      const baseGeo = new THREE.CylinderGeometry(0.034, 0.038, 0.01, 24);
      const baseMesh = new THREE.Mesh(baseGeo, blackAnodizedMat);
      baseMesh.position.y = 0.005;
      bodyGroup.add(baseMesh);

      const postGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.065, 16);
      const postMesh = new THREE.Mesh(postGeo, blackAnodizedMat);
      postMesh.position.y = 0.042;
      bodyGroup.add(postMesh);

      const ringGeo = new THREE.TorusGeometry(0.028, 0.004, 16, 32);
      const ringMesh = new THREE.Mesh(ringGeo, blackAnodizedMat);
      ringMesh.position.y = 0.098;
      bodyGroup.add(ringMesh);

      const lensGeo = new THREE.SphereGeometry(0.027, 28, 20);
      lensGeo.scale(1, 1, 0.26);
      const lensMat = createGlassMaterial(isSoftwareGl);
      const lensMesh = new THREE.Mesh(lensGeo, lensMat);
      lensMesh.name = 'lens_element';
      lensMesh.position.y = 0.098;
      lensMesh.renderOrder = 4;
      root.add(lensMesh);

      root.add(bodyGroup);
      break;
    }

    case 'laser-source': {
      addContactShadow(root, 0.065, 0.055);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';

      // 1. White/grey ABS housing (Hình 1.1b SGK KHTN 9 - Đèn laser 3 tia)
      const boxGeo = new THREE.BoxGeometry(0.11, 0.036, 0.082);
      const boxMat = new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        roughness: 0.35,
        metalness: 0.12,
      });
      const boxMesh = new THREE.Mesh(boxGeo, boxMat);
      boxMesh.position.y = 0.018;
      boxMesh.castShadow = true;
      boxMesh.receiveShadow = true;
      bodyGroup.add(boxMesh);

      // 2. 3 Red rocker switches on top (mỗi tia sáng điều khiển bằng 1 công tắc)
      const swGeo = new THREE.BoxGeometry(0.018, 0.006, 0.012);
      const swMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
      [-0.022, 0, 0.022].forEach((sz, idx) => {
        const sw = new THREE.Mesh(swGeo, swMat);
        sw.name = `switch_${idx + 1}`;
        sw.position.set(-0.01, 0.038, sz);
        bodyGroup.add(sw);
      });

      // 3. Front dark aperture bezel + 3 laser diodes
      const bezelGeo = new THREE.BoxGeometry(0.004, 0.026, 0.072);
      const bezelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
      const bezel = new THREE.Mesh(bezelGeo, bezelMat);
      bezel.position.set(0.055, 0.018, 0);
      bodyGroup.add(bezel);

      // 4. 3 Parallel Red Laser Beams (`laser_beams`)
      const beamsGroup = new THREE.Group();
      beamsGroup.name = 'laser_beams';
      const beamGeo = new THREE.CylinderGeometry(0.0018, 0.0018, 0.32, 12);
      beamGeo.rotateZ(-Math.PI / 2);
      beamGeo.translate(0.16, 0, 0);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0xff1e42,
        transparent: true,
        opacity: 0.9,
      });
      [-0.022, 0, 0.022].forEach((bz) => {
        const b = new THREE.Mesh(beamGeo, beamMat);
        b.position.set(0.056, 0.018, bz);
        beamsGroup.add(b);
      });
      root.add(beamsGroup);
      root.add(bodyGroup);
      break;
    }

    case 'semicircular-slab': {
      addContactShadow(root, 0.105, 0.105);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';

      // 1. Circular 360-degree Protractor Base (Hình 1.2 & Hình 5.1, 6.1 SGK KHTN 9)
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 512;
      pCanvas.height = 512;
      const pCtx = pCanvas.getContext('2d')!;
      pCtx.fillStyle = '#F8FAFC';
      pCtx.fillRect(0, 0, 512, 512);
      pCtx.strokeStyle = '#0B3A7D';
      pCtx.lineWidth = 4;
      pCtx.beginPath();
      pCtx.arc(256, 256, 240, 0, Math.PI * 2);
      pCtx.stroke();

      // Normal N-N' and interface line
      pCtx.strokeStyle = '#64748B';
      pCtx.lineWidth = 2;
      pCtx.beginPath();
      pCtx.moveTo(256, 16);
      pCtx.lineTo(256, 496);
      pCtx.moveTo(16, 256);
      pCtx.lineTo(496, 256);
      pCtx.stroke();

      // Degree ticks every 10 deg
      pCtx.fillStyle = '#0F172A';
      pCtx.font = 'bold 16px "JetBrains Mono", monospace';
      pCtx.textAlign = 'center';
      pCtx.textBaseline = 'middle';
      for (let deg = 0; deg < 360; deg += 10) {
        const rad = THREE.MathUtils.degToRad(deg);
        const x1 = 256 + Math.cos(rad) * 218;
        const y1 = 256 + Math.sin(rad) * 218;
        const x2 = 256 + Math.cos(rad) * 238;
        const y2 = 256 + Math.sin(rad) * 238;
        pCtx.beginPath();
        pCtx.moveTo(x1, y1);
        pCtx.lineTo(x2, y2);
        pCtx.stroke();
      }
      const pTex = new THREE.CanvasTexture(pCanvas);
      pTex.colorSpace = THREE.SRGBColorSpace;

      const discGeo = new THREE.CylinderGeometry(0.095, 0.095, 0.006, 48);
      const discMat = new THREE.MeshStandardMaterial({
        map: pTex,
        roughness: 0.35,
        metalness: 0.05,
      });
      const discMesh = new THREE.Mesh(discGeo, discMat);
      discMesh.position.y = 0.003;
      discMesh.receiveShadow = true;
      bodyGroup.add(discMesh);

      // 2. Semicircular Optical Glass Block (Bản bán trụ thuỷ tinh n = 1.50)
      const slabGeo = new THREE.CylinderGeometry(
        0.056,
        0.056,
        0.022,
        36,
        1,
        false,
        0,
        Math.PI,
      );
      const glassMat = createGlassMaterial(isSoftwareGl);
      const slabMesh = new THREE.Mesh(slabGeo, glassMat);
      slabMesh.position.y = 0.017;
      slabMesh.renderOrder = 4;
      bodyGroup.add(slabMesh);

      // 3. Interactive Refracted & Reflected Laser Rays (`ray_paths`)
      const rayGroup = new THREE.Group();
      rayGroup.name = 'ray_paths';
      rayGroup.position.y = 0.012;

      const rayGeo = new THREE.CylinderGeometry(0.0018, 0.0018, 0.09, 10);
      rayGeo.rotateX(Math.PI / 2);
      rayGeo.translate(0, 0, 0.045);

      const incRay = new THREE.Mesh(
        rayGeo,
        new THREE.MeshBasicMaterial({ color: 0xff1e42 }),
      );
      incRay.name = 'incident_ray';
      incRay.rotation.y = THREE.MathUtils.degToRad(-140);
      rayGroup.add(incRay);

      const refRay = new THREE.Mesh(
        rayGeo,
        new THREE.MeshBasicMaterial({ color: 0x22c55e }),
      );
      refRay.name = 'refracted_ray';
      refRay.rotation.y = THREE.MathUtils.degToRad(25);
      rayGroup.add(refRay);

      const rflRay = new THREE.Mesh(
        rayGeo,
        new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          transparent: true,
          opacity: 0.75,
        }),
      );
      rflRay.name = 'reflected_ray';
      rflRay.rotation.y = THREE.MathUtils.degToRad(140);
      rayGroup.add(rflRay);

      root.add(rayGroup);
      root.add(bodyGroup);
      break;
    }

    case 'optical-prism': {
      addContactShadow(root, 0.06, 0.06);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';

      // 1. Stand base & post (Hình 7.1 & 7.4 SGK KHTN 9 - Lăng kính gắn trên giá)
      const standMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.45,
        metalness: 0.6,
      });
      const baseMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.042, 0.046, 0.01, 28),
        standMat,
      );
      baseMesh.position.y = 0.005;
      bodyGroup.add(baseMesh);

      const postMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.006, 0.006, 0.055, 16),
        standMat,
      );
      postMesh.position.y = 0.035;
      bodyGroup.add(postMesh);

      const tableMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.038, 0.038, 0.006, 28),
        standMat,
      );
      tableMesh.position.y = 0.064;
      bodyGroup.add(tableMesh);

      // 2. Equilateral Triangular Glass Prism (Góc chiết quang A = 60°)
      const prismGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.068, 3);
      const glassMat = createGlassMaterial(isSoftwareGl);
      const prismMesh = new THREE.Mesh(prismGeo, glassMat);
      prismMesh.position.y = 0.101;
      prismMesh.renderOrder = 4;
      bodyGroup.add(prismMesh);

      // 3. White Incident Beam + 7-Color Dispersed Rainbow Spectrum (`dispersion_spectrum`)
      const specGroup = new THREE.Group();
      specGroup.name = 'dispersion_spectrum';
      specGroup.position.y = 0.101;

      const whiteBeamGeo = new THREE.CylinderGeometry(0.0022, 0.0022, 0.09, 10);
      whiteBeamGeo.rotateZ(Math.PI / 2);
      const whiteBeam = new THREE.Mesh(
        whiteBeamGeo,
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
      );
      whiteBeam.position.set(-0.058, -0.008, 0);
      whiteBeam.rotation.z = 0.18;
      specGroup.add(whiteBeam);

      const rainbowColors = [
        0xef4444, // Đỏ
        0xf97316, // Da cam
        0xeab308, // Vàng
        0x22c55e, // Lục
        0x06b6d4, // Lam
        0x3b82f6, // Chàm
        0x8b5cf6, // Tím
      ];
      rainbowColors.forEach((hex, idx) => {
        const cRayGeo = new THREE.CylinderGeometry(0.0014, 0.0022, 0.11, 8);
        cRayGeo.rotateZ(Math.PI / 2);
        const cRay = new THREE.Mesh(
          cRayGeo,
          new THREE.MeshBasicMaterial({ color: hex }),
        );
        cRay.position.set(0.062, -0.004 - idx * 0.0038, 0);
        cRay.rotation.z = -0.14 - idx * 0.035;
        specGroup.add(cRay);
      });

      root.add(specGroup);
      root.add(bodyGroup);
      break;
    }

    case 'magnifying-glass': {
      addContactShadow(root, 0.048, 0.048);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';

      // 1. Ergonomic handle & brass collar (Hình 10.1 SGK KHTN 9 - Kính lúp G = 5x)
      const handleMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.55,
        metalness: 0.2,
      });
      const brassMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.25,
        metalness: 0.85,
      });

      const standBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.032, 0.036, 0.008, 24),
        handleMat,
      );
      standBase.position.y = 0.004;
      bodyGroup.add(standBase);

      const handleMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.007, 0.0085, 0.075, 20),
        handleMat,
      );
      handleMesh.position.y = 0.042;
      bodyGroup.add(handleMesh);

      const collarMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.012, 20),
        brassMat,
      );
      collarMesh.position.y = 0.082;
      bodyGroup.add(collarMesh);

      // 2. Protective Lens Frame (Khung bảo vệ ghi 5x)
      const frameMesh = new THREE.Mesh(
        new THREE.TorusGeometry(0.038, 0.0045, 16, 36),
        handleMat,
      );
      frameMesh.position.y = 0.124;
      bodyGroup.add(frameMesh);

      // 3. Biconvex Converging Lens (Thấu kính hội tụ tiêu cự ngắn f = 5 cm)
      const lensGeo = new THREE.SphereGeometry(0.036, 28, 20);
      lensGeo.scale(1, 1, 0.28);
      const lensMesh = new THREE.Mesh(lensGeo, createGlassMaterial(isSoftwareGl));
      lensMesh.name = 'lens_element';
      lensMesh.position.y = 0.124;
      lensMesh.renderOrder = 4;
      root.add(lensMesh);

      root.add(bodyGroup);
      break;
    }

    case 'galvanometer': {
      addContactShadow(root, 0.065, 0.065);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';

      // 1. Meter housing (Hình 1.4 & Bài 14 SGK KHTN 9 - Điện kế vạch 0 ở giữa)
      const caseMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.42,
        metalness: 0.25,
      });
      const baseMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.11, 0.032, 0.095),
        caseMat,
      );
      baseMesh.position.y = 0.016;
      bodyGroup.add(baseMesh);

      const towerMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.104, 0.115, 0.052),
        new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35 }),
      );
      towerMesh.position.set(0, 0.086, -0.012);
      bodyGroup.add(towerMesh);

      // 2. Dial face with 0 at center (`scale_marks`)
      const dCanvas = document.createElement('canvas');
      dCanvas.width = 256;
      dCanvas.height = 192;
      const dCtx = dCanvas.getContext('2d')!;
      dCtx.fillStyle = '#FFFFFF';
      dCtx.fillRect(0, 0, 256, 192);
      dCtx.strokeStyle = '#0F172A';
      dCtx.lineWidth = 4;
      dCtx.strokeRect(4, 4, 248, 184);

      dCtx.beginPath();
      dCtx.arc(128, 152, 96, Math.PI * 1.18, Math.PI * 1.82);
      dCtx.stroke();

      dCtx.fillStyle = '#0B3A7D';
      dCtx.font = 'bold 28px "Inter", sans-serif';
      dCtx.textAlign = 'center';
      dCtx.fillText('G', 128, 118);
      dCtx.font = 'bold 18px "JetBrains Mono", monospace';
      dCtx.fillText('0', 128, 42);
      dCtx.fillStyle = '#EF4444';
      dCtx.fillText('-50', 54, 68);
      dCtx.fillStyle = '#16A34A';
      dCtx.fillText('+50', 202, 68);

      const dialTex = new THREE.CanvasTexture(dCanvas);
      dialTex.colorSpace = THREE.SRGBColorSpace;
      const dialMat = new THREE.MeshBasicMaterial({ map: dialTex });
      const dialMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.092, 0.072),
        dialMat,
      );
      dialMesh.name = 'scale_marks';
      dialMesh.position.set(0, 0.098, 0.015);
      root.add(dialMesh);

      // Rear dial face so rotating the Galvanometer 180° still shows the scale clearly
      const dialRearMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.092, 0.072),
        dialMat,
      );
      dialRearMesh.name = 'scale_marks_rear';
      dialRearMesh.position.set(0, 0.098, -0.039);
      dialRearMesh.rotation.y = Math.PI;
      root.add(dialRearMesh);

      // 3. Pivoting Pointer Needles (`plunger` front & `plunger_rear` back)
      const needleGroup = new THREE.Group();
      needleGroup.name = 'plunger';
      needleGroup.position.set(0, 0.068, 0.016);
      const needleGeo = new THREE.BoxGeometry(0.0028, 0.052, 0.002);
      needleGeo.translate(0, 0.026, 0);
      const needleMesh = new THREE.Mesh(
        needleGeo,
        new THREE.MeshBasicMaterial({ color: 0xef4444 }),
      );
      needleGroup.add(needleMesh);
      root.add(needleGroup);

      const needleRearGroup = new THREE.Group();
      needleRearGroup.name = 'plunger_rear';
      needleRearGroup.position.set(0, 0.068, -0.040);
      const needleRearMesh = new THREE.Mesh(
        needleGeo,
        new THREE.MeshBasicMaterial({ color: 0xef4444 }),
      );
      needleRearGroup.add(needleRearMesh);
      root.add(needleRearGroup);

      // 4. 3 Front Binding Posts: (-) Black, (G0) Red, (G1) Red
      const postGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 0.012, 16);
      const blkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
      const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
      [
        { x: -0.03, m: blkMat },
        { x: 0, m: redMat },
        { x: 0.03, m: redMat },
      ].forEach(({ x, m }) => {
        const p = new THREE.Mesh(postGeo, m);
        p.position.set(x, 0.036, 0.028);
        bodyGroup.add(p);
      });

      root.add(bodyGroup);
      break;
    }

    case 'digital-multimeter': {
      addContactShadow(root, 0.058, 0.075);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';

      // 1. Yellow protective rubber holster + dark face (Hình 1.5 SGK KHTN 9 - Đồng hồ đo điện đa năng)
      const holsterGeo = new THREE.BoxGeometry(0.092, 0.036, 0.155);
      const holsterMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        roughness: 0.55,
        metalness: 0.08,
      });
      const holsterMesh = new THREE.Mesh(holsterGeo, holsterMat);
      holsterMesh.position.set(0, 0.032, 0);
      holsterMesh.rotation.x = -0.22;
      holsterMesh.castShadow = true;
      bodyGroup.add(holsterMesh);

      const faceGeo = new THREE.BoxGeometry(0.082, 0.006, 0.142);
      const faceMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45 });
      const faceMesh = new THREE.Mesh(faceGeo, faceMat);
      faceMesh.position.set(0, 0.049, 0.002);
      faceMesh.rotation.x = -0.22;
      bodyGroup.add(faceMesh);

      // 2. Digital LCD Screen (`scale_display` on top/front + `scale_display_rear` on back)
      const mmTex = createLcdDisplayTexture('0.00', 'V');
      const mmLcdMat = new THREE.MeshBasicMaterial({
        map: mmTex,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      });
      const mmLcd = new THREE.Mesh(
        new THREE.PlaneGeometry(0.068, 0.028),
        mmLcdMat,
      );
      mmLcd.name = 'scale_display';
      mmLcd.userData.lastText = '0.00:V';
      mmLcd.position.set(0, 0.061, -0.038);
      mmLcd.rotation.x = -Math.PI / 2 - 0.22;
      root.add(mmLcd);

      const mmLcdRear = new THREE.Mesh(
        new THREE.PlaneGeometry(0.068, 0.028),
        mmLcdMat,
      );
      mmLcdRear.name = 'scale_display_rear';
      mmLcdRear.position.set(0, 0.038, -0.079);
      mmLcdRear.rotation.y = Math.PI;
      mmLcdRear.rotation.x = 0.22;
      root.add(mmLcdRear);

      // 3. Rotary Range Selector Dial (`handle`)
      const dialKnob = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.024, 0.01, 24),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35 }),
      );
      dialKnob.name = 'handle';
      dialKnob.position.set(0, 0.052, 0.008);
      dialKnob.rotation.x = -0.22;
      root.add(dialKnob);

      // 4. 3 Probe Banana Jacks (10A, VΩmA, COM)
      const jackGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.008, 16);
      const redJack = new THREE.MeshStandardMaterial({ color: 0xef4444 });
      const blkJack = new THREE.MeshStandardMaterial({ color: 0x0f172a });
      [-0.024, 0, 0.024].forEach((jx, idx) => {
        const j = new THREE.Mesh(jackGeo, idx === 2 ? blkJack : redJack);
        j.position.set(jx, 0.042, 0.052);
        j.rotation.x = -0.22;
        bodyGroup.add(j);
      });

      root.add(bodyGroup);
      break;
    }

    case 'induction-coil-led': {
      addContactShadow(root, 0.095, 0.065);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';

      // 1. Wooden base board (Hình 1.6 & Hình 14.4 SGK KHTN 9 - Cuộn dây dẫn có 2 đèn LED + Nam châm)
      const baseWood = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.014, 0.11),
        new THREE.MeshStandardMaterial({ color: 0x9a5b25, roughness: 0.55 }),
      );
      baseWood.position.y = 0.007;
      bodyGroup.add(baseWood);

      // 2. Copper Wire Induction Coil Bobbin
      const coilGeo = new THREE.CylinderGeometry(0.034, 0.034, 0.058, 32);
      coilGeo.rotateZ(Math.PI / 2);
      const copperWireMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.25,
        metalness: 0.85,
      });
      const coilMesh = new THREE.Mesh(coilGeo, copperWireMat);
      coilMesh.position.set(0.032, 0.048, 0);
      coilMesh.castShadow = true;
      bodyGroup.add(coilMesh);

      // 3. 2 Anti-parallel Indicator LEDs (`led_1` Red, `led_2` Yellow-Green) on top of coil
      const ledGeo = new THREE.SphereGeometry(0.0065, 16, 16);
      const led1Mat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xef4444,
        emissiveIntensity: 0.85,
      });
      const led2Mat = new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        emissive: 0x22c55e,
        emissiveIntensity: 0.85,
      });
      const led1 = new THREE.Mesh(ledGeo, led1Mat);
      led1.name = 'led_1';
      led1.position.set(0.02, 0.086, -0.014);
      root.add(led1);

      const led2 = new THREE.Mesh(ledGeo, led2Mat);
      led2.name = 'led_2';
      led2.position.set(0.044, 0.086, 0.014);
      root.add(led2);

      // 4. Permanent Bar Magnet (N Red / S Blue) on pivot (`plunger`)
      const magnetGroup = new THREE.Group();
      magnetGroup.name = 'plunger';
      magnetGroup.position.set(-0.042, 0.048, 0);

      const northHalf = new THREE.Mesh(
        new THREE.BoxGeometry(0.034, 0.016, 0.016),
        new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35 }),
      );
      northHalf.position.x = 0.017;
      magnetGroup.add(northHalf);

      const southHalf = new THREE.Mesh(
        new THREE.BoxGeometry(0.034, 0.016, 0.016),
        new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.35 }),
      );
      southHalf.position.x = -0.017;
      magnetGroup.add(southHalf);

      root.add(magnetGroup);
      root.add(bodyGroup);
      break;
    }

    case 'porcelain-dish': {
      addContactShadow(root, 0.052, 0.052);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';

      // 1. White glazed porcelain evaporating dish (Hình 1.7 & Bài 26 SGK KHTN 9 - Bát sứ)
      const porcelainMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.14,
        metalness: 0.04,
        side: THREE.DoubleSide,
      });
      const footRing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.024, 0.026, 0.006, 28),
        porcelainMat,
      );
      footRing.position.y = 0.003;
      bodyGroup.add(footRing);

      const bowlGeo = new THREE.SphereGeometry(
        0.046,
        32,
        18,
        0,
        Math.PI * 2,
        Math.PI * 0.52,
        Math.PI * 0.48,
      );
      const bowlMesh = new THREE.Mesh(bowlGeo, porcelainMat);
      bowlMesh.position.y = 0.048;
      bowlMesh.castShadow = true;
      bodyGroup.add(bowlMesh);

      const rimMesh = new THREE.Mesh(
        new THREE.TorusGeometry(0.045, 0.0025, 12, 32).rotateX(Math.PI / 2),
        porcelainMat,
      );
      rimMesh.position.y = 0.045;
      bodyGroup.add(rimMesh);

      // 2. Ethylic alcohol inside (`liquid_surface`)
      const ethGroup = new THREE.Group();
      ethGroup.name = 'liquid_surface';
      const ethMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.036, 0.022, 0.014, 24),
        new THREE.MeshStandardMaterial({
          color: 0xbae6fd,
          transparent: true,
          opacity: 0.55,
          roughness: 0.1,
        }),
      );
      ethMesh.position.y = 0.016;
      ethGroup.add(ethMesh);
      root.add(ethGroup);

      // 3. Alcohol Combustion Flame (`flame_group` for Bài 26: Đốt cháy ethylic alcohol trong bát sứ)
      const flameGroup = new THREE.Group();
      flameGroup.name = 'flame_group';
      flameGroup.visible = false;
      const outerFlame = new THREE.Mesh(
        new THREE.ConeGeometry(0.022, 0.055, 16),
        new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.72,
        }),
      );
      outerFlame.position.y = 0.052;
      flameGroup.add(outerFlame);

      const innerFlame = new THREE.Mesh(
        new THREE.ConeGeometry(0.012, 0.036, 16),
        new THREE.MeshBasicMaterial({
          color: 0xfbbf24,
          transparent: true,
          opacity: 0.85,
        }),
      );
      innerFlame.position.y = 0.045;
      flameGroup.add(innerFlame);
      root.add(flameGroup);

      root.add(bodyGroup);
      break;
    }

    case 'separatory-funnel': {
      addContactShadow(root, 0.065, 0.065);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';
      const glassMat = createGlassMaterial(isSoftwareGl);
      const standMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.45,
        metalness: 0.65,
      });

      // 1. Tall Support Stand & Ring Clamp (stem tip at y = 0.118 m — above 0.098 m rim of 250 ml catch beaker!)
      const baseMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.11, 0.012, 0.13),
        standMat,
      );
      baseMesh.position.y = 0.006;
      bodyGroup.add(baseMesh);

      const rodMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0045, 0.0045, 0.32, 16),
        standMat,
      );
      rodMesh.position.set(-0.042, 0.165, 0);
      bodyGroup.add(rodMesh);

      const ringClamp = new THREE.Mesh(
        new THREE.TorusGeometry(0.031, 0.003, 12, 28).rotateX(Math.PI / 2),
        standMat,
      );
      ringClamp.position.set(0, 0.215, 0);
      bodyGroup.add(ringClamp);

      // 2. Pear-shaped Separatory Funnel Body + Stem + Red Stopcock (`handle`)
      const upperCone = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.032, 0.055, 28, 1, true),
        glassMat,
      );
      upperCone.position.y = 0.245;
      upperCone.renderOrder = 4;
      bodyGroup.add(upperCone);

      const lowerCone = new THREE.Mesh(
        new THREE.CylinderGeometry(0.032, 0.006, 0.065, 28, 1, true),
        glassMat,
      );
      lowerCone.position.y = 0.185;
      lowerCone.renderOrder = 4;
      bodyGroup.add(lowerCone);

      const stemTube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0045, 0.0035, 0.065, 20, 1, true),
        glassMat,
      );
      stemTube.position.y = 0.120;
      stemTube.renderOrder = 4;
      bodyGroup.add(stemTube);

      const stopcock = new THREE.Mesh(
        new THREE.CylinderGeometry(0.005, 0.005, 0.028, 16).rotateX(Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 }),
      );
      stopcock.name = 'handle';
      stopcock.position.y = 0.142;
      root.add(stopcock);

      // 3. Two immiscible liquid layers inside (`liquid_surface`: aqueous bottom + ester/oil top)
      const liqGroup = new THREE.Group();
      liqGroup.name = 'liquid_surface';
      const aqLayer = new THREE.Mesh(
        new THREE.CylinderGeometry(0.026, 0.006, 0.042, 24),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.65,
        }),
      );
      aqLayer.name = 'aq_layer';
      aqLayer.position.y = 0.178;
      liqGroup.add(aqLayer);

      const orgLayer = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.026, 0.024, 24),
        new THREE.MeshStandardMaterial({
          color: 0xfbbf24,
          transparent: true,
          opacity: 0.72,
        }),
      );
      orgLayer.name = 'org_layer';
      orgLayer.position.y = 0.211;
      liqGroup.add(orgLayer);
      root.add(liqGroup);

      // 4. Extraction Liquid Stream from Bottom Stem (`spout_stream` — strictly hidden unless stopcock is opened!)
      const sepStreamGroup = new THREE.Group();
      sepStreamGroup.name = 'spout_stream';
      const sepStreamMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0020, 0.0028, 0.068, 14),
        createStreamMaterial(0x38bdf8, 0.88),
      );
      sepStreamMesh.name = 'stream_outer';
      sepStreamMesh.position.set(0, 0.054, 0);
      sepStreamMesh.renderOrder = 5;
      sepStreamGroup.add(sepStreamMesh);

      const sepDropGeo = new THREE.SphereGeometry(0.0022, 10, 10);
      const sepDropMat = createStreamMaterial(0x7dd3fc, 0.92);
      for (let d = 0; d < 4; d++) {
        const drop = new THREE.Mesh(sepDropGeo, sepDropMat);
        drop.name = `droplet_${d}`;
        drop.position.set(0, 0.084 - d * 0.016, 0);
        drop.scale.set(0.85, 1.35, 0.85);
        sepStreamGroup.add(drop);
      }

      const sepSplash = new THREE.Mesh(
        new THREE.RingGeometry(0.003, 0.010, 20).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial({
          color: 0xbae6fd,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        }),
      );
      sepSplash.name = 'splash_ring_0';
      sepSplash.position.set(0, 0.020, 0);
      sepStreamGroup.add(sepSplash);

      sepStreamGroup.visible = false;
      root.add(sepStreamGroup);

      root.add(bodyGroup);
      break;
    }

    case 'distillation-flask': {
      // BÌNH CẦU CÓ NHÁNH 250 mL ĐỘC LẬP (Tách rời hoàn toàn khỏi kiềng sắt và đèn cồn)
      addContactShadow(root, 0.052, 0.052);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';
      const glassMat = createGlassMaterial(isSoftwareGl);

      // 1. Vòng đệm cao su đỡ đáy bình cầu đứng vững trên mặt bàn hoặc trên lưới kiềng sắt
      const corkRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.024, 0.0045, 12, 28).rotateX(Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85, metalness: 0.05 }),
      );
      corkRing.position.y = 0.0045;
      bodyGroup.add(corkRing);

      // 2. Thân bình cầu đáy tròn 250 mL (tâm y = 0.042 m)
      const bulbMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.038, 28, 24),
        glassMat,
      );
      bulbMesh.position.y = 0.042;
      bulbMesh.renderOrder = 4;
      bodyGroup.add(bulbMesh);

      // 3. Cổ bình thẳng đứng
      const neckMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.068, 24, 1, true),
        glassMat,
      );
      neckMesh.position.y = 0.104;
      neckMesh.renderOrder = 4;
      bodyGroup.add(neckMesh);

      const rimMesh = new THREE.Mesh(
        new THREE.TorusGeometry(0.0128, 0.0018, 10, 24).rotateX(Math.PI / 2),
        glassMat,
      );
      rimMesh.position.y = 0.138;
      rimMesh.renderOrder = 4;
      bodyGroup.add(rimMesh);

      // 4. Nhánh nghiêng dẫn hơi (Side-arm)
      const sideArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.004, 0.004, 0.075, 16),
        glassMat,
      );
      sideArm.position.set(0.034, 0.097, 0);
      sideArm.rotation.z = -1.05;
      sideArm.renderOrder = 4;
      bodyGroup.add(sideArm);

      const pouringLip = new THREE.Object3D();
      pouringLip.name = 'pouring_lip';
      pouringLip.position.set(0.065, 0.078, 0);
      bodyGroup.add(pouringLip);

      // 5. Dung dịch bên trong (`liquid_surface`)
      const liqGroup = new THREE.Group();
      liqGroup.name = 'liquid_surface';
      const liqSphere = new THREE.Mesh(
        new THREE.SphereGeometry(
          0.035,
          24,
          16,
          0,
          Math.PI * 2,
          Math.PI * 0.45,
          Math.PI * 0.55,
        ),
        createWaterMaterial(0x0ea5e9, 0.76),
      );
      liqSphere.position.y = 0.042;
      liqGroup.add(liqSphere);
      root.add(liqGroup);

      addThermalIceAndBoilingEffectsToVessel(root, 0.028, 0.138);
      root.add(bodyGroup);
      break;
    }

    case 'alcohol-burner': {
      // ĐÈN CỒN THỦY TINH 150 mL ĐỘC LẬP (Có bấc cotton, cồn ethanol, cổ đồng, nắp chụp tắt lửa & ngọn lửa 3D)
      addContactShadow(root, 0.048, 0.048);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';
      const glassMat = createGlassMaterial(isSoftwareGl);
      const brassMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.28,
        metalness: 0.82,
      });

      // 1. Đế thủy tinh dày chống đổ
      const baseFoot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.036, 0.039, 0.008, 28),
        glassMat,
      );
      baseFoot.position.y = 0.004;
      baseFoot.renderOrder = 3;
      bodyGroup.add(baseFoot);

      // 2. Bầu đèn cồn thủy tinh đa diện/bầu tròn (cao ~5.6 cm)
      const lowerBelly = new THREE.Mesh(
        new THREE.CylinderGeometry(0.041, 0.035, 0.028, 28),
        glassMat,
      );
      lowerBelly.position.y = 0.022;
      lowerBelly.renderOrder = 4;
      bodyGroup.add(lowerBelly);

      const upperShoulder = new THREE.Mesh(
        new THREE.CylinderGeometry(0.017, 0.041, 0.024, 28),
        glassMat,
      );
      upperShoulder.position.y = 0.048;
      upperShoulder.renderOrder = 4;
      bodyGroup.add(upperShoulder);

      // 3. Cồn Ethanol màu xanh nhạt bên trong bầu đèn + sợi bấc cotton ngâm trong cồn
      const fuelMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.036, 0.032, 0.030, 24),
        new THREE.MeshPhysicalMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.55,
          roughness: 0.15,
        }),
      );
      fuelMesh.position.y = 0.023;
      fuelMesh.renderOrder = 2;
      bodyGroup.add(fuelMesh);

      const wickMat = new THREE.MeshStandardMaterial({
        color: 0xfef3c7,
        roughness: 0.92,
      });
      const innerWick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0028, 0.0032, 0.056, 12),
        wickMat,
      );
      innerWick.position.y = 0.038;
      bodyGroup.add(innerWick);

      // 4. Cổ đèn thủy tinh + Đầu giữ bấc bằng đồng/sứ (Wick holder)
      const glassNeck = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.017, 0.012, 24),
        glassMat,
      );
      glassNeck.position.y = 0.064;
      glassNeck.renderOrder = 4;
      bodyGroup.add(glassNeck);

      const brassCollar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0135, 0.0155, 0.009, 24),
        brassMat,
      );
      brassCollar.position.y = 0.072;
      brassCollar.userData = { isAlcoholBurnerToggle: true };
      bodyGroup.add(brassCollar);

      const wickTube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0045, 0.0055, 0.012, 16),
        brassMat,
      );
      wickTube.position.y = 0.080;
      wickTube.userData = { isAlcoholBurnerToggle: true };
      bodyGroup.add(wickTube);

      // Đầu bấc lộ ra phía trên cổ đồng (hơi sẫm màu ở đỉnh do cháy)
      const exposedWick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0032, 0.0035, 0.011, 12),
        new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.95 }),
      );
      exposedWick.position.y = 0.088;
      exposedWick.userData = { isAlcoholBurnerToggle: true };
      bodyGroup.add(exposedWick);

      // 5. Nắp chụp tắt đèn cồn (`alcohol_snuffer_cap`) - Khi đèn tắt thì úp lên bấc, khi đèn cháy thì đặt cạnh chân đèn
      const snufferCap = new THREE.Group();
      snufferCap.name = 'alcohol_snuffer_cap';
      const capCylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(0.013, 0.0155, 0.026, 20),
        glassMat,
      );
      capCylinder.position.y = 0.013;
      snufferCap.add(capCylinder);
      const capTopKnob = new THREE.Mesh(
        new THREE.SphereGeometry(0.006, 14, 14),
        glassMat,
      );
      capTopKnob.position.y = 0.028;
      snufferCap.add(capTopKnob);
      snufferCap.position.set(0, 0.070, 0);
      snufferCap.userData = { isAlcoholBurnerToggle: true };
      root.add(snufferCap);

      // 6. Ngọn lửa đèn cồn 3 lớp (`flame_group`) - Tâm xanh lam nóng + Áo lửa vàng cam rực rỡ
      const flameGroup = new THREE.Group();
      flameGroup.name = 'flame_group';

      const outerFlame = new THREE.Mesh(
        new THREE.ConeGeometry(0.0135, 0.042, 20),
        new THREE.MeshBasicMaterial({
          color: 0xf97316,
          transparent: true,
          opacity: 0.86,
          depthWrite: false,
        }),
      );
      outerFlame.position.y = 0.108;
      outerFlame.renderOrder = 6;
      flameGroup.add(outerFlame);

      const middleFlame = new THREE.Mesh(
        new THREE.ConeGeometry(0.0092, 0.032, 18),
        new THREE.MeshBasicMaterial({
          color: 0xfef08a,
          transparent: true,
          opacity: 0.92,
          depthWrite: false,
        }),
      );
      middleFlame.position.y = 0.104;
      middleFlame.renderOrder = 7;
      flameGroup.add(middleFlame);

      const innerBlueCore = new THREE.Mesh(
        new THREE.ConeGeometry(0.0052, 0.016, 16),
        new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.95,
          depthWrite: false,
        }),
      );
      innerBlueCore.position.y = 0.095;
      innerBlueCore.renderOrder = 8;
      flameGroup.add(innerBlueCore);

      flameGroup.visible = false;
      root.add(flameGroup);

      // Cho phép click vào thân đèn cồn để bật/tắt lửa nhanh
      bodyGroup.traverse((child) => {
        child.userData = { ...child.userData, isAlcoholBurnerToggle: true };
      });

      root.add(bodyGroup);
      break;
    }

    case 'tripod-wire-gauze': {
      // KIỀNG SẮT 3 CHÂN & LƯỚI TẢN NHIỆT AMIĂNG ĐỘC LẬP (Chiều cao mặt lưới y = 0.128 m để đặt đèn cồn ở dưới và đặt bình đựng ở trên)
      addContactShadow(root, 0.072, 0.072);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';

      const castSteelMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.42,
        metalness: 0.78,
      });

      const ringHeight = 0.124;
      const ringRadius = 0.054;

      // 1. Vòng gang tròn đỡ lưới tản nhiệt
      const topRing = new THREE.Mesh(
        new THREE.TorusGeometry(ringRadius, 0.0042, 14, 32).rotateX(Math.PI / 2),
        castSteelMat,
      );
      topRing.position.y = ringHeight;
      bodyGroup.add(topRing);

      // 2. 3 Chân sắt choãi nhẹ ra ngoài để đặt lọt đèn cồn ở chính giữa bên dưới
      [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].forEach((ang) => {
        const legGroup = new THREE.Group();
        legGroup.rotation.y = ang;
        const legRod = new THREE.Mesh(
          new THREE.CylinderGeometry(0.0038, 0.0038, 0.128, 12),
          castSteelMat,
        );
        legRod.position.set(ringRadius + 0.006, ringHeight * 0.5, 0);
        legRod.rotation.z = 0.11;
        legGroup.add(legRod);

        const rubberFoot = new THREE.Mesh(
          new THREE.CylinderGeometry(0.0052, 0.0058, 0.006, 12),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 }),
        );
        rubberFoot.position.set(ringRadius + 0.013, 0.003, 0);
        legGroup.add(rubberFoot);
        bodyGroup.add(legGroup);
      });

      // 3. Tấm lưới thép tản nhiệt hình vuông (Wire Gauze) kèm tâm sứ Amiăng trắng phân tán nhiệt đều
      const gauzePlate = new THREE.Mesh(
        new THREE.BoxGeometry(0.116, 0.0024, 0.116),
        new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          roughness: 0.55,
          metalness: 0.62,
        }),
      );
      gauzePlate.position.y = 0.127;
      bodyGroup.add(gauzePlate);

      const gauzeBorder = new THREE.Mesh(
        new THREE.BoxGeometry(0.118, 0.0032, 0.118),
        new THREE.MeshStandardMaterial({
          color: 0x64748b,
          roughness: 0.48,
          metalness: 0.7,
          wireframe: true,
        }),
      );
      gauzeBorder.position.y = 0.127;
      bodyGroup.add(gauzeBorder);

      const ceramicPad = new THREE.Mesh(
        new THREE.CylinderGeometry(0.038, 0.038, 0.0032, 28),
        new THREE.MeshStandardMaterial({
          color: 0xf8fafc,
          roughness: 0.88,
          metalness: 0.05,
        }),
      );
      ceramicPad.position.y = 0.1275;
      bodyGroup.add(ceramicPad);

      // Anchor đặt bình đun trên mặt lưới (y = 0.128 m)
      const topAnchor = new THREE.Object3D();
      topAnchor.name = 'tripod_top_anchor';
      topAnchor.position.set(0, 0.128, 0);
      root.add(topAnchor);

      root.add(bodyGroup);
      break;
    }

    case 'ice-cubes-tray': {
      // KHAY ĐỰNG NƯỚC ĐÁ VIÊN THÍ NGHIỆM (-10°C -> 0°C, 100g) ĐỘC LẬP (Kéo thả vào bình để cho đá vào bình)
      addContactShadow(root, 0.056, 0.056);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';
      const glassMat = createGlassMaterial(isSoftwareGl);

      // 1. Đĩa thủy tinh Petri thành thấp đựng đá viên
      const dishBottom = new THREE.Mesh(
        new THREE.CylinderGeometry(0.048, 0.046, 0.004, 32),
        glassMat,
      );
      dishBottom.position.y = 0.002;
      dishBottom.renderOrder = 3;
      bodyGroup.add(dishBottom);

      const dishWall = new THREE.Mesh(
        new THREE.CylinderGeometry(0.050, 0.048, 0.022, 32, 1, true),
        glassMat,
      );
      dishWall.position.y = 0.013;
      dishWall.renderOrder = 4;
      bodyGroup.add(dishWall);

      const dishRim = new THREE.Mesh(
        new THREE.TorusGeometry(0.050, 0.0018, 10, 32).rotateX(Math.PI / 2),
        glassMat,
      );
      dishRim.position.y = 0.024;
      dishRim.renderOrder = 4;
      bodyGroup.add(dishRim);

      // 2. Các viên nước đá 3D trong suốt ánh xanh băng giá (`ice_cubes_group`)
      const iceTrayGroup = new THREE.Group();
      iceTrayGroup.name = 'ice_cubes_group';
      const iceCrystalMat = new THREE.MeshPhysicalMaterial({
        color: 0xdbeafe,
        roughness: 0.12,
        metalness: 0.02,
        transmission: 0.76,
        transparent: true,
        opacity: 0.88,
        ior: 1.31,
        clearcoat: 0.95,
      });

      const trayCubes: Array<[number, number, number, number, number, number, number]> = [
        [-0.018, 0.012, -0.012, 0.18, 0.4, 0.1, 0.017],
        [0.018, 0.012, -0.014, -0.25, 0.3, -0.15, 0.016],
        [-0.016, 0.012, 0.016, 0.12, -0.35, 0.22, 0.017],
        [0.016, 0.012, 0.015, -0.18, 0.25, 0.3, 0.016],
        [0.0, 0.014, 0.0, 0.3, 0.15, -0.2, 0.018],
        [-0.008, 0.024, -0.004, -0.22, 0.5, 0.18, 0.015],
        [0.010, 0.024, 0.006, 0.28, -0.4, 0.12, 0.015],
        [0.0, 0.031, -0.002, 0.15, 0.2, -0.3, 0.014],
      ];

      trayCubes.forEach(([x, y, z, rx, ry, rz, sz], idx) => {
        const cube = new THREE.Mesh(
          new THREE.BoxGeometry(sz, sz * 0.86, sz),
          iceCrystalMat,
        );
        cube.name = `tray_ice_${idx}`;
        cube.position.set(x, y, z);
        cube.rotation.set(rx, ry, rz);
        cube.renderOrder = 3;
        iceTrayGroup.add(cube);
      });

      root.add(iceTrayGroup);
      root.add(bodyGroup);
      break;
    }

    case 'thermal-heating-vessel': {
      // BÌNH THỦY TINH CHỊU NHIỆT ĐỰNG NƯỚC ĐÁ & ĐUN SÔI 250 mL ĐỘC LẬP (Borosilicate Pyrex có vạch chia, miệng rót, chứa được nước đá viên + nước lỏng + bọt sôi + hơi nước)
      addContactShadow(root, 0.052, 0.052);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';
      const glassMat = createGlassMaterial(isSoftwareGl);

      // 1. Đáy bình chịu nhiệt Pyrex dày
      const bottomMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.038, 0.038, 0.0045, 32),
        glassMat,
      );
      bottomMesh.position.y = 0.0022;
      bottomMesh.renderOrder = 3;
      bodyGroup.add(bottomMesh);

      // 2. Thành bình trụ đứng rộng 250 mL kèm đai silicon cách nhiệt màu cam đỏ ở cổ trên để cầm không bỏng
      const wallMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.039, 0.038, 0.104, 32, 1, true),
        glassMat,
      );
      wallMesh.position.y = 0.054;
      wallMesh.renderOrder = 4;
      bodyGroup.add(wallMesh);

      const siliconeGripRing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0402, 0.040, 0.012, 32, 1, true),
        new THREE.MeshStandardMaterial({
          color: 0xea580c,
          roughness: 0.65,
          metalness: 0.08,
          side: THREE.DoubleSide,
        }),
      );
      siliconeGripRing.position.y = 0.092;
      bodyGroup.add(siliconeGripRing);

      // 3. Vành miệng bình + Mỏ rót (`pouring_lip`)
      const rimMesh = new THREE.Mesh(
        new THREE.TorusGeometry(0.039, 0.0022, 12, 32).rotateX(Math.PI / 2),
        glassMat,
      );
      rimMesh.position.y = 0.106;
      rimMesh.renderOrder = 4;
      bodyGroup.add(rimMesh);

      const vesselLip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0055, 0.0085, 0.015, 16, 1, true, -Math.PI * 0.5, Math.PI),
        glassMat,
      );
      vesselLip.name = 'pouring_lip';
      vesselLip.position.set(0.041, 0.105, 0);
      vesselLip.rotation.z = -0.58;
      vesselLip.renderOrder = 4;
      bodyGroup.add(vesselLip);

      // 4. Vạch chia thể tích Borosilicate (`scale_marks`)
      const scaleTex = createGraduationCanvasTexture(50, 250, 50, 'PYREX 250 ml');
      const scaleMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0394, 0.0384, 0.082, 32, 1, true),
        new THREE.MeshBasicMaterial({
          map: scaleTex,
          transparent: true,
          depthWrite: false,
        }),
      );
      scaleMesh.name = 'scale_marks';
      scaleMesh.position.y = 0.046;
      scaleMesh.renderOrder = 5;
      root.add(scaleMesh);

      // 5. Nước lỏng bên trong (`liquid_surface`)
      const liquidGroup = new THREE.Group();
      liquidGroup.name = 'liquid_surface';
      const liquidGeo = new THREE.CylinderGeometry(0.0368, 0.0365, 0.042, 32);
      liquidGeo.translate(0, 0.021, 0);
      const liquidMesh = new THREE.Mesh(liquidGeo, createWaterMaterial(0x0ea5e9, 0.78));
      liquidMesh.renderOrder = 2;
      liquidGroup.add(liquidMesh);
      addConcaveMeniscusAndRipples(liquidGroup, 0.0368, 0.042);
      liquidGroup.position.y = 0.0045;
      root.add(liquidGroup);

      // 6. Đá viên 3D + Bọt khí sôi + Hơi nước bốc lên
      addThermalIceAndBoilingEffectsToVessel(root, 0.035, 0.106);

      root.add(bodyGroup);
      break;
    }

    case 'optical-microscope': {
      addContactShadow(root, 0.075, 0.085);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';

      const enamelMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.28,
        metalness: 0.18,
      });
      const darkStageMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.4,
        metalness: 0.65,
      });

      // 1. Heavy Microscope Base & Illuminator (Hình 42.6 SGK KHTN 9 - Kính hiển vi 10x, 40x, 100x)
      const baseMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.11, 0.022, 0.145),
        enamelMat,
      );
      baseMesh.position.y = 0.011;
      baseMesh.castShadow = true;
      bodyGroup.add(baseMesh);

      // 2. Curved C-Arm Pillar + Coarse/Fine Focus Knobs (Ốc sơ cấp & Ốc thứ cấp)
      const pillarMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.028, 0.175, 0.032),
        enamelMat,
      );
      pillarMesh.position.set(0, 0.105, -0.048);
      bodyGroup.add(pillarMesh);

      const knobMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.014, 0.046, 20).rotateZ(Math.PI / 2),
        darkStageMat,
      );
      knobMesh.position.set(0, 0.068, -0.046);
      bodyGroup.add(knobMesh);

      // 3. Mechanical Stage + Fixed Chromosome Glass Slide (Hộp tiêu bản cố định NST - Hình 1.11)
      const stageMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.086, 0.008, 0.086),
        darkStageMat,
      );
      stageMesh.position.set(0, 0.098, 0.002);
      bodyGroup.add(stageMesh);

      const slideMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.056, 0.002, 0.022),
        createGlassMaterial(isSoftwareGl),
      );
      slideMesh.position.set(0, 0.103, 0.005);
      bodyGroup.add(slideMesh);

      const stainedSample = new THREE.Mesh(
        new THREE.CylinderGeometry(0.006, 0.006, 0.0025, 16),
        new THREE.MeshBasicMaterial({ color: 0xa855f7 }),
      );
      stainedSample.position.set(0, 0.1035, 0.005);
      bodyGroup.add(stainedSample);

      // 4. Revolving Turret Nosepiece (`plunger`) with 3 Objectives: 10x (Yellow), 40x (Blue), 100x (White Oil)
      const turretGroup = new THREE.Group();
      turretGroup.name = 'plunger';
      turretGroup.position.set(0, 0.152, 0.005);

      const turretDisc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.022, 0.01, 24),
        darkStageMat,
      );
      turretGroup.add(turretDisc);

      const objColors = [0xeab308, 0x3b82f6, 0xf8fafc];
      objColors.forEach((col, idx) => {
        const ang = (idx * Math.PI * 2) / 3;
        const objLens = new THREE.Mesh(
          new THREE.CylinderGeometry(0.005, 0.004, 0.028, 16),
          new THREE.MeshStandardMaterial({ color: col, metalness: 0.7, roughness: 0.25 }),
        );
        objLens.position.set(Math.sin(ang) * 0.012, -0.016, Math.cos(ang) * 0.012);
        turretGroup.add(objLens);
      });
      root.add(turretGroup);

      // 5. Upper Head & Inclined Eyepiece Tube (Thị kính)
      const headMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.036, 0.032, 0.072),
        enamelMat,
      );
      headMesh.position.set(0, 0.178, -0.018);
      bodyGroup.add(headMesh);

      const eyepieceTube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.011, 0.011, 0.068, 20),
        darkStageMat,
      );
      eyepieceTube.position.set(0, 0.215, 0.018);
      eyepieceTube.rotation.x = 0.55;
      bodyGroup.add(eyepieceTube);

      root.add(bodyGroup);
      break;
    }

    case 'dna-double-helix': {
      addContactShadow(root, 0.055, 0.055);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';

      // 1. Display Pedestal & Central Axis Rod (Hình 38.1 SGK KHTN 9 - Mô hình phân tử DNA)
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.4,
        metalness: 0.5,
      });
      const baseMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.048, 0.054, 0.014, 32),
        baseMat,
      );
      baseMesh.position.y = 0.007;
      bodyGroup.add(baseMesh);

      const rodMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0025, 0.0025, 0.24, 12),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 }),
      );
      rodMesh.position.y = 0.128;
      bodyGroup.add(rodMesh);

      // 2. Helical Sugar-Phosphate Backbones & Complementary Base Pairs (A-T, G-C)
      const helixGroup = new THREE.Group();
      helixGroup.name = 'handle';
      const rungCount = 12;
      const backboneMat1 = new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        roughness: 0.25,
      });
      const backboneMat2 = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.25,
      });
      const baseColors = [
        [0xef4444, 0x3b82f6], // A - T
        [0x22c55e, 0xeab308], // G - C
      ];

      for (let i = 0; i < rungCount; i++) {
        const y = 0.028 + i * 0.018;
        const theta = i * 0.58;
        const r = 0.032;
        const x1 = Math.cos(theta) * r;
        const z1 = Math.sin(theta) * r;
        const x2 = -x1;
        const z2 = -z1;

        const node1 = new THREE.Mesh(
          new THREE.SphereGeometry(0.0065, 14, 14),
          backboneMat1,
        );
        node1.position.set(x1, y, z1);
        helixGroup.add(node1);

        const node2 = new THREE.Mesh(
          new THREE.SphereGeometry(0.0065, 14, 14),
          backboneMat2,
        );
        node2.position.set(x2, y, z2);
        helixGroup.add(node2);

        const [c1, c2] = baseColors[i % 2];
        const halfRungGeo = new THREE.CylinderGeometry(0.0028, 0.0028, r, 10);
        halfRungGeo.rotateZ(Math.PI / 2);

        const rungA = new THREE.Mesh(
          halfRungGeo,
          new THREE.MeshStandardMaterial({ color: c1, roughness: 0.3 }),
        );
        rungA.position.set(x1 * 0.5, y, z1 * 0.5);
        rungA.rotation.y = -theta;
        helixGroup.add(rungA);

        const rungB = new THREE.Mesh(
          halfRungGeo,
          new THREE.MeshStandardMaterial({ color: c2, roughness: 0.3 }),
        );
        rungB.position.set(x2 * 0.5, y, z2 * 0.5);
        rungB.rotation.y = -theta;
        helixGroup.add(rungB);
      }

      root.add(helixGroup);
      root.add(bodyGroup);
      break;
    }

    case 'thermometer':
    default: {
      addContactShadow(root, 0.018, 0.018);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';

      // Red alcohol sensing bulb at bottom (dips directly into ice/water)
      const bulbGeo = new THREE.SphereGeometry(0.0062, 20, 16);
      const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2 });
      const bulbMesh = new THREE.Mesh(bulbGeo, redMat);
      bulbMesh.position.y = 0.012;
      bodyGroup.add(bulbMesh);

      // Neck transition between bulb and stem
      const neckMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0038, 0.0052, 0.012, 16),
        redMat,
      );
      neckMesh.position.y = 0.019;
      bodyGroup.add(neckMesh);

      // Red alcohol capillary column (`plunger` scales height dynamically with temperatureC)
      const colGroup = new THREE.Group();
      colGroup.name = 'plunger';
      colGroup.position.y = 0.018;
      const colGeo = new THREE.CylinderGeometry(0.0020, 0.0020, 0.14, 12);
      colGeo.translate(0, 0.07, 0);
      const colMesh = new THREE.Mesh(colGeo, redMat);
      colGroup.add(colMesh);
      root.add(colGroup);

      // 360° Dual-sided temperature graduation scale (-10°C to 110°C)
      const tempScaleTex = createGraduationCanvasTexture(0, 100, 20, '100 °C : 1 °C');
      const tempScaleMat = new THREE.MeshBasicMaterial({
        map: tempScaleTex,
        transparent: true,
        side: THREE.DoubleSide,
      });
      const tempPlate1 = new THREE.Mesh(
        new THREE.PlaneGeometry(0.016, 0.16),
        tempScaleMat,
      );
      tempPlate1.name = 'scale_marks';
      tempPlate1.position.set(0, 0.112, 0);
      root.add(tempPlate1);

      const tempPlate2 = new THREE.Mesh(
        new THREE.PlaneGeometry(0.016, 0.16),
        tempScaleMat,
      );
      tempPlate2.position.set(0, 0.112, 0);
      tempPlate2.rotation.y = Math.PI / 2;
      root.add(tempPlate2);

      // Outer glass stem
      const stemGeo = new THREE.CylinderGeometry(0.0052, 0.0052, 0.185, 20);
      const glassMat = createGlassMaterial(isSoftwareGl);
      const stemMesh = new THREE.Mesh(stemGeo, glassMat);
      stemMesh.position.y = 0.11;
      stemMesh.renderOrder = 4;
      bodyGroup.add(stemMesh);

      // Top metal cap & suspension eyelet ring (to hang / clip onto stand clamp)
      const capMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.3,
        metalness: 0.8,
      });
      const topCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0054, 0.0054, 0.008, 16),
        capMat,
      );
      topCap.position.y = 0.204;
      bodyGroup.add(topCap);

      const topHookRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.0048, 0.0012, 10, 20),
        capMat,
      );
      topHookRing.position.y = 0.212;
      bodyGroup.add(topHookRing);

      root.add(bodyGroup);
      break;
    }

    case 'water-dispenser': {
      // BÌNH CHỨA NƯỚC CẤT CÓ VAN XẢ ĐỊNH LƯỢNG 1000 ML ĐẶT TRÊN GIÁ ĐỠ CAO + KHAY HỨNG ĐỊNH VỊ DƯỚI VÒI
      // Chân giá đỡ nâng cao y = 0.264 m, đầu vòi xả ở (0.095, 0.252, 0) cao hơn cả miệng Ống đong 100 ml (0.242 m),
      // Bình tràn (0.194 m) và Cốc 250 ml (0.097 m)! Ngay dưới vòi tại (0.095, 0, 0) có Khay Hứng Từ Tính để đặt cốc/ống đong lấy nước!
      addContactShadow(root, 0.088, 0.076);
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'body';
      const glassMat = createGlassMaterial(isSoftwareGl);

      const standElevationY = 0.264; // Height of the upper tank platform (clears 0.242 m graduated cylinder!)

      // 1. Tall Stainless Steel 3-Legged Laboratory Stand (h = 0.264 m) + Integrated Drip Tray Docking Station at x = +0.095 m
      const standMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.30,
        metalness: 0.78,
      });
      const chromeLegMat = new THREE.MeshStandardMaterial({
        color: 0xcbd5e1,
        roughness: 0.22,
        metalness: 0.88,
      });

      const ringPlat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.057, 0.060, 0.012, 36),
        standMat,
      );
      ringPlat.position.y = standElevationY;
      ringPlat.castShadow = true;
      ringPlat.receiveShadow = true;
      bodyGroup.add(ringPlat);

      const midBraceRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.056, 0.0032, 12, 36),
        standMat,
      );
      midBraceRing.rotation.x = Math.PI / 2;
      midBraceRing.position.y = 0.132;
      bodyGroup.add(midBraceRing);

      const baseRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.060, 0.0042, 12, 36),
        standMat,
      );
      baseRing.rotation.x = Math.PI / 2;
      baseRing.position.y = 0.005;
      bodyGroup.add(baseRing);

      [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].forEach((ang) => {
        const leg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.0048, 0.0052, standElevationY - 0.004, 14),
          chromeLegMat,
        );
        leg.position.set(
          Math.cos(ang) * 0.055,
          standElevationY * 0.5,
          Math.sin(ang) * 0.055,
        );
        leg.castShadow = true;
        bodyGroup.add(leg);

        const foot = new THREE.Mesh(
          new THREE.CylinderGeometry(0.008, 0.009, 0.006, 14),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 }),
        );
        foot.position.set(Math.cos(ang) * 0.055, 0.003, Math.sin(ang) * 0.055);
        bodyGroup.add(foot);
      });

      // 1B. Integrated Stainless Steel Drip Tray & Glowing Cyan Docking Coaster (`dispenser_dock_tray`) at (0.095, 0, 0)
      const dockBridge = new THREE.Mesh(
        new THREE.BoxGeometry(0.058, 0.004, 0.036),
        standMat,
      );
      dockBridge.position.set(0.064, 0.002, 0);
      dockBridge.receiveShadow = true;
      bodyGroup.add(dockBridge);

      const dripTrayBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.047, 0.0045, 36),
        standMat,
      );
      dripTrayBase.name = 'dispenser_dock_tray';
      dripTrayBase.position.set(0.095, 0.0023, 0);
      dripTrayBase.receiveShadow = true;
      bodyGroup.add(dripTrayBase);

      const dripGrate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.038, 0.038, 0.0012, 32),
        chromeLegMat,
      );
      dripGrate.position.set(0.095, 0.0048, 0);
      dripGrate.receiveShadow = true;
      bodyGroup.add(dripGrate);

      const dockTargetRing = new THREE.Mesh(
        new THREE.RingGeometry(0.036, 0.043, 36).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial({
          color: 0x00bceb,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.88,
        }),
      );
      dockTargetRing.name = 'dispenser_dock_ring';
      dockTargetRing.position.set(0.095, 0.0056, 0);
      bodyGroup.add(dockTargetRing);

      // 2. Graduated Borosilicate Glass Reservoir Carboy (1000 ml, Ø 104 mm)
      const tankGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.142, 36, 1, true);
      const tankMesh = new THREE.Mesh(tankGeo, glassMat);
      tankMesh.position.y = standElevationY + 0.076;
      tankMesh.renderOrder = 4;
      bodyGroup.add(tankMesh);

      const shoulderGeo = new THREE.CylinderGeometry(0.026, 0.052, 0.020, 36);
      const shoulderMesh = new THREE.Mesh(shoulderGeo, glassMat);
      shoulderMesh.position.y = standElevationY + 0.157;
      shoulderMesh.renderOrder = 4;
      bodyGroup.add(shoulderMesh);

      // Blue GL45 Laboratory Screw Cap with air vent
      const capMat = new THREE.MeshStandardMaterial({
        color: 0x1e6bff,
        roughness: 0.28,
        metalness: 0.15,
      });
      const capMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.028, 0.028, 0.018, 28),
        capMat,
      );
      capMesh.position.y = standElevationY + 0.174;
      capMesh.castShadow = true;
      bodyGroup.add(capMesh);

      // 3. 360° Printed Graduation Scale (`scale_marks`: 100 - 1000 ml)
      const scaleTex = createGraduationCanvasTexture(100, 1000, 100, 'BÌNH CẤP NƯỚC 1000 ml');
      const scaleGeo = new THREE.CylinderGeometry(0.0524, 0.0524, 0.125, 36, 1, true);
      const scaleMat = new THREE.MeshBasicMaterial({
        map: scaleTex,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const scaleMesh = new THREE.Mesh(scaleGeo, scaleMat);
      scaleMesh.name = 'scale_marks';
      scaleMesh.position.y = standElevationY + 0.076;
      scaleMesh.renderOrder = 5;
      root.add(scaleMesh);

      // 4. Dual Front & Rear Digital Flow/Volume Readout LCDs (`scale_display`, `scale_display_rear`)
      const lcdTex = createLcdDisplayTexture('850.0', 'ml');
      const lcdMat = new THREE.MeshBasicMaterial({
        map: lcdTex,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
      });
      const lcdFront = new THREE.Mesh(new THREE.PlaneGeometry(0.070, 0.022), lcdMat);
      lcdFront.name = 'scale_display';
      lcdFront.userData.lastText = '850.0';
      lcdFront.position.set(0, standElevationY, 0.061);
      lcdFront.renderOrder = 2;
      root.add(lcdFront);

      const lcdRear = new THREE.Mesh(new THREE.PlaneGeometry(0.070, 0.022), lcdMat);
      lcdRear.name = 'scale_display_rear';
      lcdRear.position.set(0, standElevationY, -0.061);
      lcdRear.rotation.y = Math.PI;
      lcdRear.renderOrder = 2;
      root.add(lcdRear);

      // 5. Elevated Metering Stopcock Valve & Spout Assembly on +X side (nozzle tip at x = 0.095, y = 0.252 m!)
      const brassMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.22,
        metalness: 0.85,
      });
      const pipeHoriz = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0055, 0.0055, 0.047, 16),
        brassMat,
      );
      pipeHoriz.rotation.z = Math.PI / 2;
      pipeHoriz.position.set(0.0735, standElevationY + 0.016, 0);
      bodyGroup.add(pipeHoriz);

      const nozzleDown = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0050, 0.0036, 0.032, 16),
        brassMat,
      );
      nozzleDown.position.set(0.095, standElevationY + 0.002, 0);
      bodyGroup.add(nozzleDown);

      // Glowing nozzle tip collar
      const nozzleTipRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.0038, 0.0009, 10, 20).rotateX(Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: 0x00bceb }),
      );
      nozzleTipRing.position.set(0.095, standElevationY - 0.014, 0);
      bodyGroup.add(nozzleTipRing);

      // Rotating PTFE/Cyan Metering Valve Handle (`plunger`)
      const valveGroup = new THREE.Group();
      valveGroup.name = 'plunger';
      valveGroup.position.set(0.0735, standElevationY + 0.024, 0);
      const valveStem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.004, 0.004, 0.012, 12),
        brassMat,
      );
      valveGroup.add(valveStem);
      const valveLever = new THREE.Mesh(
        new THREE.BoxGeometry(0.030, 0.0055, 0.009),
        new THREE.MeshStandardMaterial({ color: 0x00bceb, roughness: 0.22, metalness: 0.25 }),
      );
      valveLever.position.y = 0.007;
      valveGroup.add(valveLever);
      root.add(valveGroup);

      // 6. Water Column inside 1000 ml Reservoir (`liquid_surface`, base height = 0.062 m at 500 ml)
      const liquidGroup = new THREE.Group();
      liquidGroup.name = 'liquid_surface';
      const waterHeight = 0.062;
      const waterGeo = new THREE.CylinderGeometry(0.050, 0.050, waterHeight, 36);
      waterGeo.translate(0, waterHeight / 2, 0);
      const waterMat = createWaterMaterial(0x0ea5e9, 0.78);
      const waterMesh = new THREE.Mesh(waterGeo, waterMat);
      waterMesh.renderOrder = 2;
      liquidGroup.add(waterMesh);

      addConcaveMeniscusAndRipples(liquidGroup, 0.050, waterHeight);

      liquidGroup.position.y = standElevationY + 0.006;
      root.add(liquidGroup);

      // 7. Multi-Layer Laminar Water Stream from Elevated Valve Nozzle (`spout_stream` from y = 0.250 m down into receiving vessel)
      // Strictly hidden (`visible = false`) unless valve is actively open!
      const streamGroup = new THREE.Group();
      streamGroup.name = 'spout_stream';
      const streamLen = 0.212;
      const streamMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0028, 0.0040, streamLen, 18),
        createStreamMaterial(0x38bdf8, 0.90),
      );
      streamMesh.name = 'stream_outer';
      streamMesh.position.set(0.095, standElevationY - 0.014 - streamLen * 0.5, 0);
      streamMesh.renderOrder = 5;
      streamGroup.add(streamMesh);

      const streamCore = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0014, 0.0020, streamLen, 12),
        new THREE.MeshBasicMaterial({
          color: 0xe0f2fe,
          transparent: true,
          opacity: 0.95,
          depthWrite: false,
        }),
      );
      streamCore.name = 'stream_core';
      streamCore.position.set(0.095, standElevationY - 0.014 - streamLen * 0.5, 0);
      streamCore.renderOrder = 6;
      streamGroup.add(streamCore);

      const dispDropGeo = new THREE.SphereGeometry(0.0028, 12, 12);
      const dispDropMat = createStreamMaterial(0x7dd3fc, 0.94);
      for (let d = 0; d < 6; d++) {
        const drop = new THREE.Mesh(dispDropGeo, dispDropMat);
        drop.name = `droplet_${d}`;
        drop.position.set(0.095, standElevationY - 0.024 - d * 0.034, 0);
        drop.scale.set(0.85, 1.45, 0.85);
        drop.renderOrder = 6;
        streamGroup.add(drop);
      }

      for (let r = 0; r < 2; r++) {
        const splashDisc = new THREE.Mesh(
          new THREE.RingGeometry(0.004 + r * 0.005, 0.009 + r * 0.007, 24).rotateX(-Math.PI / 2),
          new THREE.MeshBasicMaterial({
            color: r === 0 ? 0xe0f2fe : 0x7dd3fc,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.90 - r * 0.25,
            depthWrite: false,
          }),
        );
        splashDisc.name = `splash_ring_${r}`;
        splashDisc.position.set(0.095, 0.038 + r * 0.001, 0);
        splashDisc.renderOrder = 6;
        streamGroup.add(splashDisc);
      }

      streamGroup.visible = false;
      root.add(streamGroup);

      const anchor = new THREE.Object3D();
      anchor.name = 'measurement_anchor';
      anchor.position.set(0.095, standElevationY - 0.014, 0);
      root.add(anchor);

      root.add(bodyGroup);
      break;
    }

    case 'dc-battery-holder': {
      addContactShadow(root, 0.056, 0.044);
      root.add(buildDcBatteryHolderModel());
      break;
    }

    case 'dc-con-o-battery': {
      addContactShadow(root, 0.02, 0.032);
      root.add(buildSingleConOBatteryUnit());
      break;
    }

    case 'dc-knife-switch': {
      addContactShadow(root, 0.048, 0.026);
      root.add(buildDcKnifeSwitchModel());
      break;
    }

    case 'dc-light-bulb-126': {
      addContactShadow(root, 0.048, 0.026);
      root.add(buildDcLightBulb126Model());
      break;
    }

    case 'dc-rheostat-20': {
      addContactShadow(root, 0.084, 0.032);
      root.add(buildDcRheostat20Model());
      break;
    }

    case 'dc-ammeter': {
      addContactShadow(root, 0.058, 0.062);
      root.add(buildDcAnalogMeterModel('A'));
      break;
    }

    case 'dc-voltmeter': {
      addContactShadow(root, 0.058, 0.062);
      root.add(buildDcAnalogMeterModel('V'));
      break;
    }

    case 'pascal-hydraulic-press': {
      addContactShadow(root, 0.15, 0.105);
      root.add(buildPascalHydraulicPressModel());
      break;
    }

    case 'pascal-weight-100g': {
      addContactShadow(root, 0.022, 0.022);
      root.add(buildPascalWeight100gModel());
      break;
    }

    case 'reagent-bottle-naoh-400': {
      addContactShadow(root, 0.048, 0.048);
      root.add(buildNaOHBottle400Model());
      break;
    }

    case 'copper-wire-ring-3g': {
      addContactShadow(root, 0.044, 0.044);
      root.add(buildCopperWireRing3gModel());
      break;
    }

    case 'reagent-bottle-agno3-400': {
      addContactShadow(root, 0.048, 0.048);
      root.add(buildAgNO3Bottle400Model());
      break;
    }

    case 'beaker-bomex-100': {
      addContactShadow(root, 0.032, 0.032);
      root.add(buildBomexBeaker100Model(isSoftwareGl));
      addThermalIceAndBoilingEffectsToVessel(root, 0.021, 0.068);
      break;
    }

    case 'color-filter-dispersion': {
      addContactShadow(root, 0.21, 0.095);
      root.add(buildColorFilterDispersionModel(isSoftwareGl));
      break;
    }

    case 'oxygen-air-volume': {
      addContactShadow(root, 0.165, 0.125);
      root.add(buildOxygenAirVolumeModel(isSoftwareGl));
      break;
    }
  }

  return root;
}

/**
 * Cập nhật trạng thái hiển thị trực quan của một instance trong cảnh 3D
 * (ví dụ: số chỉ màn hình LCD cân điện tử, chiều cao cột nước ống đong, độ mở thước cặp,
 *  góc khúc xạ ánh sáng, kim điện kế cảm ứng, thang đo đồng hồ vạn năng, ngọn lửa đun nóng)
 * mà hoàn toàn không làm thay đổi mô hình gốc.
 */
export function applyInstanceStateToObject3D(
  instanceRoot: THREE.Object3D,
  instance: SceneInstance,
  asset: AssetDefinition,
): void {
  const customHtmlMod = htmlEquipmentModuleRegistry.getModule(asset.assetId);
  if (customHtmlMod) {
    if (customHtmlMod.applyEquipmentState) {
      try {
        customHtmlMod.applyEquipmentState(THREE, instanceRoot, instance, asset);
      } catch (err) {
        console.warn('Error in HTML module applyEquipmentState:', err);
      }
    }

    // Đồng bộ trực tiếp các node tương tác 3D của gói AI / HTML Module (đảm bảo 100% nhạy trên bàn 3D)
    const ctrl = customHtmlMod.moduleControls;
    const rawVal = (instance.instanceState as Record<string, unknown>)[ctrl.stateKey];
    const val = typeof rawVal === 'number' && Number.isFinite(rawVal) ? rawVal : ctrl.defaultValue;
    const span = Math.max(0.0001, ctrl.max - ctrl.min);
    const ratio = THREE.MathUtils.clamp((val - ctrl.min) / span, 0, 1);

    const needlePivot = instanceRoot.getObjectByName('needle_pivot');
    if (needlePivot) {
      needlePivot.rotation.z = Math.PI * 0.3 * (1 - 2 * ratio);
    }

    const rheostatSlider = instanceRoot.getObjectByName('rheostat_slider');
    if (rheostatSlider) {
      const travel = Number(rheostatSlider.userData?.travelWidth) || 0.12;
      rheostatSlider.position.x = (ratio - 0.5) * travel;
    }

    const liqCol = instanceRoot.getObjectByName('liquid_column');
    if (liqCol) {
      if (ratio <= 0.005) {
        liqCol.visible = false;
      } else {
        liqCol.visible = true;
        const safeRatio = Math.max(0.02, ratio);
        liqCol.scale.y = safeRatio;
        const baseY = Number(liqCol.userData?.baseY) || 0.014;
        const maxH =
          Number(liqCol.userData?.maxH) ||
          (asset.geometry.boundingBoxM.height || 0.18) * 0.65;
        liqCol.position.y = baseY + (maxH * safeRatio) / 2;
      }
    }

    const dynPlunger = instanceRoot.getObjectByName('dynamic_plunger');
    if (dynPlunger) {
      const baseY =
        Number(dynPlunger.userData?.baseY) ||
        (asset.geometry.boundingBoxM.height || 0.24) * 0.4;
      const ext = ratio * ((asset.geometry.boundingBoxM.height || 0.24) * 0.18);
      dynPlunger.position.y = baseY - ext;
    }

    const dynPivot = instanceRoot.getObjectByName('dynamic_pivot');
    if (dynPivot) {
      dynPivot.rotation.y = (val * Math.PI) / 180;
    }

    const heatedTube = instanceRoot.getObjectByName('heated_test_tube_group');
    if (heatedTube && typeof instance.instanceState.showHeatedTestTube === 'boolean') {
      heatedTube.visible = instance.instanceState.showHeatedTestTube;
    }

    const flameGrp = instanceRoot.getObjectByName('alcohol_flame_group');
    const snufferCap = instanceRoot.getObjectByName('alcohol_snuffer_cap');
    if (flameGrp) {
      const isBurning =
        instance.instanceState.isHeating === false ? false : ratio > 0.04;
      flameGrp.visible = isBurning;
      if (isBurning) {
        const flameScale = 0.45 + ratio * 0.75;
        flameGrp.scale.set(
          0.75 + ratio * 0.35,
          flameScale,
          0.75 + ratio * 0.35,
        );
      }
      if (snufferCap && snufferCap.userData) {
        const openPos = snufferCap.userData.openPos as number[] | undefined;
        const cappedPos = snufferCap.userData.cappedPos as number[] | undefined;
        if (isBurning && Array.isArray(openPos) && openPos.length === 3) {
          snufferCap.position.set(openPos[0], openPos[1], openPos[2]);
          snufferCap.rotation.z = Number(snufferCap.userData.openRotZ) || -0.68;
        } else if (!isBurning && Array.isArray(cappedPos) && cappedPos.length === 3) {
          snufferCap.position.set(cappedPos[0], cappedPos[1], cappedPos[2]);
          snufferCap.rotation.z = 0;
        }
      }
      const boilingBubbles = instanceRoot.getObjectByName('boiling_bubbles_group');
      if (boilingBubbles) {
        boilingBubbles.visible = isBurning;
      }
    }

    // Nếu module tự cung cấp hàm buildEquipmentGroup riêng thì kết thúc tại đây;
    // ngược lại (các thư viện chuẩn dùng ProceduralLabModels) tiếp tục chạy xuống dưới để cập nhật liquid_surface, scale_display...
    if (customHtmlMod.buildEquipmentGroup) {
      return;
    }
  }

  const arch = asset.geometry.proceduralArchetype;

  // 1. Electronic balance front LCD readout (OHAUS Scout front display only) & pan depression
  if (arch === 'electronic-balance') {
    const tare = instance.instanceState.tareOffsetG ?? 0;
    const rawMass = instance.instanceState.measuredMassG ?? 0;
    const displayed = Math.max(0, rawMass - tare).toFixed(2);

    const lcdNode = instanceRoot.getObjectByName('scale_display') as THREE.Mesh | undefined;
    if (lcdNode && lcdNode.material instanceof THREE.MeshBasicMaterial) {
      if (lcdNode.userData.lastText !== displayed) {
        lcdNode.userData.lastText = displayed;
        const newTex = createOhausScoutPanelTexture(displayed, 'g');
        if (
          lcdNode.material.map &&
          lcdNode.material.map !== newTex &&
          lcdNode.material.userData?.ownsTexture
        ) {
          lcdNode.material.map.dispose();
        }
        lcdNode.material.map = newTex;
        lcdNode.material.userData = {
          ...lcdNode.material.userData,
          ownsTexture: true,
        };
        lcdNode.material.needsUpdate = true;
      }
    }

    const panGroup = instanceRoot.getObjectByName('weighing_pan');
    if (panGroup) {
      panGroup.position.y = rawMass > 0.1 ? -0.0022 : 0;
    }
  }

  // 2. Graduated cylinder / beaker / overflow can / water dispenser / flask / porcelain dish / thermal-heating-vessel liquid level & ice/boiling update
  if (
    arch === 'graduated-cylinder' ||
    arch === 'beaker-250' ||
    arch === 'beaker-bomex-100' ||
    arch === 'thermal-heating-vessel' ||
    arch === 'overflow-can' ||
    arch === 'water-dispenser' ||
    arch === 'erlenmeyer-flask' ||
    arch === 'porcelain-dish' ||
    arch === 'distillation-flask' ||
    arch === 'separatory-funnel'
  ) {
    const liquidGroup = instanceRoot.getObjectByName('liquid_surface');
    if (liquidGroup) {
      // For overflow-can, the spout mouth is at 210.0 ml; water inside can never exceed the spout level!
      const maxCap =
        arch === 'overflow-can'
          ? 210
          : asset.scientificProperties.capacity?.value ?? 100;
      const defaultMl =
        arch === 'overflow-can'
          ? 210
          : arch === 'water-dispenser'
            ? 850
            : arch === 'thermal-heating-vessel' || arch === 'beaker-bomex-100'
              ? 0
              : maxCap * 0.5;
      const rawLevelMl = instance.instanceState.liquidLevelMl ?? defaultMl;
      const clampedLevelMl =
        arch === 'overflow-can' ? Math.min(210, rawLevelMl) : rawLevelMl;

      if (clampedLevelMl <= 0.2) {
        liquidGroup.visible = false;
      } else {
        liquidGroup.visible = true;
        const ratio = THREE.MathUtils.clamp(
          clampedLevelMl / maxCap,
          0.04,
          arch === 'overflow-can' ? 1.0 : 1.04,
        );
        if (arch === 'separatory-funnel') {
          const aqLayer = liquidGroup.getObjectByName('aq_layer');
          if (aqLayer) {
            aqLayer.scale.set(1, THREE.MathUtils.clamp(ratio * 1.2, 0.05, 1.1), 1);
          }
        } else {
          const scaleY = ratio / 0.5;
          liquidGroup.scale.set(1, scaleY, 1);
          const meniscusWall = liquidGroup.getObjectByName('meniscus_wall');
          if (meniscusWall) {
            meniscusWall.scale.set(1, 1 / Math.max(0.18, scaleY), 1);
          }
        }
      }
    }

    // Cập nhật hiển thị Đá viên 3D (`ice_cubes_group`), Bọt khí sôi (`boiling_bubbles_group`) và Hơi nước (`steam_plume_group`)
    const iceGroup = instanceRoot.getObjectByName('ice_cubes_group');
    if (iceGroup) {
      const iceMassG = instance.instanceState.iceMassG ?? 0;
      if (iceMassG <= 0.5) {
        iceGroup.visible = false;
      } else {
        iceGroup.visible = true;
        const iceScale = THREE.MathUtils.clamp(Math.cbrt(iceMassG / 100), 0.16, 1.15);
        iceGroup.scale.setScalar(iceScale);
        // Đá nổi một phần trong nước lỏng khi đá tan dần thành nước
        const waterLift = Math.min(
          0.034,
          ((instance.instanceState.liquidLevelMl ?? 0) / 250) * 0.04,
        );
        iceGroup.position.y = 0.003 + waterLift * 0.55;
      }
    }

    const tempC = instance.instanceState.temperatureC ?? 25;
    const hasWaterForBoil = (instance.instanceState.liquidLevelMl ?? 0) > 1;
    const nowSec = performance.now() * 0.001;
    const bubblesGroup = instanceRoot.getObjectByName('boiling_bubbles_group');
    if (bubblesGroup) {
      bubblesGroup.visible = hasWaterForBoil && tempC >= 92;
      if (bubblesGroup.visible) {
        bubblesGroup.position.y = ((nowSec * 0.018) % 0.016);
        bubblesGroup.rotation.y = nowSec * 0.9;
      }
    }
    const steamGroup = instanceRoot.getObjectByName('steam_plume_group');
    if (steamGroup) {
      steamGroup.visible = hasWaterForBoil && tempC >= 70;
      if (steamGroup.visible) {
        const steamRatio = THREE.MathUtils.clamp((tempC - 70) / 30, 0.35, 1.15);
        steamGroup.scale.set(steamRatio, steamRatio, steamRatio);
        steamGroup.position.y = Math.sin(nowSec * 3.2) * 0.004;
      }
    }

    if (arch === 'overflow-can') {
      // CHỈ hiển thị dòng chảy ở vòi tràn khi đang thực sự xảy ra hiện tượng tràn (isValveOpen === true)!
      // Khi chưa rót hoặc chưa thả vật làm tràn, tuyệt đối KHÔNG hiển thị spout_water hay spout_stream.
      const isActivelyOverflowing = Boolean(instance.instanceState.isValveOpen);
      const spoutStream = instanceRoot.getObjectByName('spout_stream');
      if (spoutStream) {
        spoutStream.visible = isActivelyOverflowing;
      }
      const spoutWater = instanceRoot.getObjectByName('spout_water');
      if (spoutWater) {
        spoutWater.visible = isActivelyOverflowing;
      }
    }

    if (arch === 'separatory-funnel') {
      const isExtracting = Boolean(instance.instanceState.isValveOpen);
      const stopcock = instanceRoot.getObjectByName('handle');
      if (stopcock) {
        stopcock.rotation.z = isExtracting ? Math.PI / 2 : 0;
      }
      const spoutStream = instanceRoot.getObjectByName('spout_stream');
      if (spoutStream) {
        spoutStream.visible = isExtracting;
      }
    }

    if (arch === 'water-dispenser') {
      const curVolMl = instance.instanceState.liquidLevelMl ?? 850;
      const displayed = curVolMl.toFixed(1);
      const lcdNode = instanceRoot.getObjectByName('scale_display') as THREE.Mesh | undefined;
      if (lcdNode && lcdNode.material instanceof THREE.MeshBasicMaterial) {
        if (lcdNode.userData.lastText !== displayed) {
          lcdNode.userData.lastText = displayed;
          const newTex = createLcdDisplayTexture(displayed, 'ml');
          instanceRoot.traverse((child) => {
            if (
              child instanceof THREE.Mesh &&
              child.name.startsWith('scale_display') &&
              child.material instanceof THREE.MeshBasicMaterial
            ) {
              if (child.material.map && child.material.map !== newTex) {
                child.material.map.dispose();
              }
              child.material.map = newTex;
              child.material.needsUpdate = true;
            }
          });
        }
      }
      const valvePlunger = instanceRoot.getObjectByName('plunger');
      if (valvePlunger) {
        valvePlunger.rotation.y = instance.instanceState.isValveOpen ? Math.PI / 2 : 0;
      }
      const spoutStream = instanceRoot.getObjectByName('spout_stream');
      if (spoutStream) {
        spoutStream.visible = Boolean(instance.instanceState.isValveOpen);
      }
    }

    if (arch === 'porcelain-dish') {
      const flameGroup = instanceRoot.getObjectByName('flame_group');
      if (flameGroup) {
        flameGroup.visible = Boolean(instance.instanceState.isHeating);
      }
    }
  }

  // 2b. Standalone Alcohol Burner (`alcohol-burner`) flame & snuffer cap state
  if (arch === 'alcohol-burner') {
    const isLit = Boolean(instance.instanceState.isHeating);
    const flameGroup = instanceRoot.getObjectByName('flame_group');
    if (flameGroup) {
      flameGroup.visible = isLit;
    }
    const snufferCap = instanceRoot.getObjectByName('alcohol_snuffer_cap');
    if (snufferCap) {
      if (isLit) {
        // Khi châm lửa: mở nắp chụp đặt sang bên cạnh chân đèn cồn
        snufferCap.position.set(0.054, 0.002, 0.018);
        snufferCap.rotation.z = 0.08;
      } else {
        // Khi tắt lửa: đậy nắp chụp úp lên bấc đèn
        snufferCap.position.set(0, 0.070, 0);
        snufferCap.rotation.z = 0;
      }
    }
  }

  // 2c. Standalone Ice Cubes Tray (`ice-cubes-tray`) remaining ice amount
  if (arch === 'ice-cubes-tray') {
    const iceTrayGroup = instanceRoot.getObjectByName('ice_cubes_group');
    if (iceTrayGroup) {
      const remIceG = instance.instanceState.iceMassG ?? 100;
      iceTrayGroup.visible = remIceG > 1;
      const trayScale = THREE.MathUtils.clamp(Math.cbrt(remIceG / 100), 0.35, 1.05);
      iceTrayGroup.scale.setScalar(trayScale);
    }
  }

  // 3. Vernier caliper jaw opening update
  if (arch === 'vernier-caliper') {
    const plunger = instanceRoot.getObjectByName('plunger');
    if (plunger) {
      const openingMm = instance.instanceState.jawOpeningMm ?? 0;
      const t = THREE.MathUtils.clamp(openingMm / 150, 0, 1);
      plunger.position.x = -0.088 + t * 0.165;
    }
  }

  // 4. Spring dynamometer plunger & helical steel spring coil extension update
  if (arch === 'spring-dynamometer') {
    const forceN = instance.instanceState.springExtensionN ?? 0;
    const ratio = THREE.MathUtils.clamp(forceN / 5.0, 0, 1);
    const extensionM = ratio * 0.045;
    const plunger = instanceRoot.getObjectByName('plunger');
    if (plunger) {
      plunger.position.y = -extensionM;
    }
    const springCoil = instanceRoot.getObjectByName('spring_coil');
    if (springCoil) {
      springCoil.scale.set(1, 1 + ratio * 1.02, 1);
    }
  }

  // 5. Laser source & Optical prism beam toggle
  if (arch === 'laser-source') {
    const beams = instanceRoot.getObjectByName('laser_beams');
    if (beams) {
      beams.visible = instance.instanceState.isPoweredOn !== false;
    }
  }
  if (arch === 'optical-prism') {
    const spec = instanceRoot.getObjectByName('dispersion_spectrum');
    if (spec) {
      spec.visible = instance.instanceState.isPoweredOn !== false;
    }
  }

  // 6. Semicircular glass slab Snell's Law refraction & Total Internal Reflection (Bài 5 & Bài 6)
  if (arch === 'semicircular-slab') {
    const incDeg = instance.instanceState.incidentAngleDeg ?? 40;
    const incRay = instanceRoot.getObjectByName('incident_ray');
    const refRay = instanceRoot.getObjectByName('refracted_ray');
    const rflRay = instanceRoot.getObjectByName('reflected_ray');
    const sinR = Math.sin(THREE.MathUtils.degToRad(incDeg)) * 1.5; // Glass n=1.5 -> Air n=1.0
    if (incRay) {
      incRay.rotation.y = THREE.MathUtils.degToRad(-180 + incDeg);
    }
    if (refRay) {
      if (sinR >= 1.0) {
        // Phản xạ toàn phần khi i >= 41.8°
        refRay.visible = false;
      } else {
        refRay.visible = true;
        const rDeg = THREE.MathUtils.radToDeg(Math.asin(sinR));
        refRay.rotation.y = THREE.MathUtils.degToRad(rDeg);
      }
    }
    if (rflRay) {
      rflRay.rotation.y = THREE.MathUtils.degToRad(180 - incDeg);
    }
  }

  // 7. Galvanometer center-zero needle deflection (both front & rear needles) & Electromagnetic induction coil
  if (arch === 'galvanometer') {
    const defl = THREE.MathUtils.clamp(
      instance.instanceState.galvanometerDeflection ?? 0,
      -1,
      1,
    );
    const needle = instanceRoot.getObjectByName('plunger');
    if (needle) {
      needle.rotation.z = -defl * 0.65;
    }
    const needleRear = instanceRoot.getObjectByName('plunger_rear');
    if (needleRear) {
      needleRear.rotation.z = defl * 0.65;
    }
  }

  if (arch === 'induction-coil-led') {
    const magnet = instanceRoot.getObjectByName('plunger');
    const led1 = instanceRoot.getObjectByName('led_1') as THREE.Mesh | undefined;
    const led2 = instanceRoot.getObjectByName('led_2') as THREE.Mesh | undefined;
    const defl = instance.instanceState.galvanometerDeflection ?? 0.6;
    if (magnet) {
      magnet.position.x = -0.042 + defl * 0.018;
    }
    if (led1 && led1.material instanceof THREE.MeshStandardMaterial) {
      led1.material.emissiveIntensity = defl >= 0 ? 1.2 : 0.1;
    }
    if (led2 && led2.material instanceof THREE.MeshStandardMaterial) {
      led2.material.emissiveIntensity = defl < 0 ? 1.2 : 0.1;
    }
  }

  // 8. Digital Multimeter LCD update (updates both front and rear LCDs)
  if (arch === 'digital-multimeter') {
    const mode = instance.instanceState.multimeterMode ?? 'DCV';
    const val = instance.instanceState.multimeterValue ?? 0;
    const unit =
      mode === 'DCV' || mode === 'V'
        ? 'V'
        : mode === 'DCA' || mode === 'A'
          ? 'A'
          : 'Ω';
    const text = val.toFixed(2);
    const key = `${text}:${unit}`;
    const lcdNode = instanceRoot.getObjectByName('scale_display') as THREE.Mesh | undefined;
    if (lcdNode && lcdNode.material instanceof THREE.MeshBasicMaterial) {
      if (lcdNode.userData.lastText !== key) {
        lcdNode.userData.lastText = key;
        const newTex = createLcdDisplayTexture(text, unit);
        instanceRoot.traverse((child) => {
          if (
            child instanceof THREE.Mesh &&
            child.name.startsWith('scale_display') &&
            child.material instanceof THREE.MeshBasicMaterial
          ) {
            if (child.material.map && child.material.map !== newTex) {
              child.material.map.dispose();
            }
            child.material.map = newTex;
            child.material.needsUpdate = true;
          }
        });
      }
    }
  }

  // 9. Optical Microscope objective turret rotation (10x, 40x, 100x)
  if (arch === 'optical-microscope') {
    const turret = instanceRoot.getObjectByName('plunger');
    if (turret) {
      const mag = instance.instanceState.magnification ?? 40;
      turret.rotation.y =
        mag === 10 ? 0 : mag === 40 ? (Math.PI * 2) / 3 : (Math.PI * 4) / 3;
    }
  }

  // 10. Alcohol Thermometer dynamic capillary height based on temperatureC
  if (arch === 'thermometer') {
    const colGroup = instanceRoot.getObjectByName('plunger');
    if (colGroup) {
      const tempC = instance.instanceState.temperatureC ?? 25.0;
      const ratio = THREE.MathUtils.clamp((tempC + 10) / 120, 0.08, 1.0);
      colGroup.scale.set(1, ratio, 1);
    }
  }

  // 11. DC Series Circuit devices (Battery Holder, Knife Switch K, Rheostat 20Ω, Bulb 126, Ammeter DC, Voltmeter DC)
  applyDcCircuitInstanceStateToObject3D(instanceRoot, instance, arch);

  // 12. Pascal Hydraulic Press & Communicating Cylinders (Hình 16.3 SGK KHTN — S₁ = 2·S₂)
  if (arch === 'pascal-hydraulic-press') {
    applyPascalHydraulicPressStateToObject3D(instanceRoot, instance);
  }

  // 13. Chemical Reagent Bottles (NaOH 0.1M, AgNO3 0.1M) & Copper Wire Ring (Cu 3.00g)
  if (
    arch === 'reagent-bottle-naoh-400' ||
    arch === 'copper-wire-ring-3g' ||
    arch === 'reagent-bottle-agno3-400'
  ) {
    applyChemicalEquipmentStateToObject3D(instanceRoot, instance, arch);
  }

  // 14. Lọc Màu & Tán Sắc Ánh Sáng (`color-filter-dispersion`)
  if (arch === 'color-filter-dispersion') {
    applyColorFilterDispersionState(instanceRoot, instance);
  }

  // 15. Thành Phần Thể Tích Oxygen Trong Không Khí (`oxygen-air-volume`)
  if (arch === 'oxygen-air-volume') {
    applyOxygenAirVolumeState(instanceRoot, instance);
  }
}

export const PASCAL_CONSTANTS = {
  S2_CM2: 10,
  S1_CM2: 20, // S1 = 2 * S2
  WEIGHT_FORCE_N: 1.0, // Each weight = 100g ≈ 1.0 N
  WEIGHT_MASS_G: 100,
  MAX_TOTAL_WEIGHTS: 8,
  CM_PER_UNIT_IMBALANCE: 1.0, // 1 quả trên S1 -> Δh1 = -0.5 cm, Δh2 = +1.0 cm; 4 quả trên S1 -> Δh1 = -2.0 cm, Δh2 = +4.0 cm
  MAX_DELTA_H1_CM: 2.5,
};

// Geometry constants matching PascalScene3D.tsx (scaled by PASCAL_WORLD_SCALE = 0.036 m/unit)
export const PASCAL_WORLD_SCALE = 0.036;
export const PAS_R2 = 0.72;
export const PAS_R1 = PAS_R2 * Math.SQRT2;
export const PAS_X1 = -2.35;
export const PAS_X2 = 2.35;
export const PAS_CYL_BOTTOM_Y = 0.65;
export const PAS_CYL_HEIGHT = 4.6;
export const PAS_EQUILIBRIUM_LIQUID_H = 2.25;
export const PAS_CM_TO_WORLD_Y = 0.38;
export const PAS_PISTON_HEAD_THICKNESS = 0.34;
export const PAS_ROD_LENGTH = 2.15;
export const PAS_PAN_THICKNESS = 0.12;
export const PAS_WEIGHT_HEIGHT = 0.28;
export const PAS_WEIGHT_RADIUS = 0.36;
export const PAS_POOL_Z = 2.55;
export const PAS_POOL_Y = 0.24;
export const PAS_POOL_SLOTS: [number, number, number][] = Array.from(
  { length: 8 },
  (_, i) => [-2.8 + i * 0.8, PAS_POOL_Y + PAS_WEIGHT_HEIGHT / 2, PAS_POOL_Z],
);

export function computePascalSimulationMetrics(n1: number, n2: number) {
  const {
    S1_CM2,
    S2_CM2,
    WEIGHT_FORCE_N,
    CM_PER_UNIT_IMBALANCE,
    MAX_DELTA_H1_CM,
  } = PASCAL_CONSTANTS;
  const clampedN1 = Math.max(0, Math.min(8, Math.round(n1)));
  const clampedN2 = Math.max(0, Math.min(8 - clampedN1, Math.round(n2)));

  const f1N = clampedN1 * WEIGHT_FORCE_N;
  const f2N = clampedN2 * WEIGHT_FORCE_N;

  const p1NCm2 = f1N / S1_CM2;
  const p2NCm2 = f2N / S2_CM2;
  const p1Pa = p1NCm2 * 10000;
  const p2Pa = p2NCm2 * 10000;

  const netImbalance = 0.5 * clampedN1 - clampedN2;
  const rawDeltaH1 = -netImbalance * CM_PER_UNIT_IMBALANCE;
  const deltaH1Cm = Math.max(
    -MAX_DELTA_H1_CM,
    Math.min(MAX_DELTA_H1_CM, rawDeltaH1),
  );
  const deltaH2Cm = -2 * deltaH1Cm;
  const displacedVolumeCm3 = Math.abs(S1_CM2 * deltaH1Cm);
  const isBalanced = Math.abs(netImbalance) < 1e-6;

  const liquidHeight1Units = THREE.MathUtils.clamp(
    PAS_EQUILIBRIUM_LIQUID_H + deltaH1Cm * PAS_CM_TO_WORLD_Y,
    0.45,
    PAS_CYL_HEIGHT - 0.35,
  );
  const liquidHeight2Units = THREE.MathUtils.clamp(
    PAS_EQUILIBRIUM_LIQUID_H + deltaH2Cm * PAS_CM_TO_WORLD_Y,
    0.45,
    PAS_CYL_HEIGHT - 0.35,
  );

  return {
    n1: clampedN1,
    n2: clampedN2,
    f1N,
    f2N,
    p1NCm2,
    p2NCm2,
    p1Pa,
    p2Pa,
    deltaH1Cm,
    deltaH2Cm,
    liquidHeight1Units,
    liquidHeight2Units,
    displacedVolumeCm3,
    isBalanced,
    equilibriumRatioTarget: 'n₁ = 2 · n₂  ⇔  F₂ / F₁ = S₂ / S₁ = 1 / 2',
  };
}

function createPascalRulerTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const centerY = canvas.height * (1 - PAS_EQUILIBRIUM_LIQUID_H / PAS_CYL_HEIGHT);
  const pxPerCm = (PAS_CM_TO_WORLD_Y / PAS_CYL_HEIGHT) * canvas.height;

  ctx.strokeStyle = 'rgba(0, 188, 235, 0.95)';
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 6]);
  ctx.beginPath();
  ctx.moveTo(15, centerY);
  ctx.lineTo(canvas.width - 15, centerY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.font = 'bold 24px monospace';
  ctx.textBaseline = 'middle';

  for (let cmHalf = -10; cmHalf <= 10; cmHalf++) {
    const cm = cmHalf * 0.5;
    const y = centerY - cm * pxPerCm;
    if (y < 20 || y > canvas.height - 20) continue;

    const isMajor = cmHalf % 2 === 0;
    const isZero = cmHalf === 0;

    ctx.strokeStyle = isZero
      ? '#00BCEB'
      : isMajor
        ? 'rgba(255, 255, 255, 0.92)'
        : 'rgba(148, 163, 184, 0.65)';
    ctx.lineWidth = isZero ? 4 : isMajor ? 3 : 2;

    const tickStart = isMajor ? 28 : 48;
    const tickEnd = isMajor ? 105 : 85;
    ctx.beginPath();
    ctx.moveTo(tickStart, y);
    ctx.lineTo(tickEnd, y);
    ctx.stroke();

    if (isMajor) {
      ctx.fillStyle = isZero ? '#00BCEB' : '#F8FAFC';
      const label = isZero ? 'h₀ (0)' : `${cm > 0 ? '+' : ''}${cm}cm`;
      ctx.fillText(label, 114, y);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

function createPascalWeightCapTexture(label: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#334155';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(128, 128, 112, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(128, 128, 94, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 34px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 128, 128);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

function createPascalBannerTexture(
  n1: number,
  n2: number,
): THREE.CanvasTexture {
  const m = computePascalSimulationMetrics(n1, n2);
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 160);
  ctx.strokeStyle = m.isBalanced ? '#10b981' : '#f59e0b';
  ctx.lineWidth = 6;
  ctx.strokeRect(4, 4, 504, 152);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 21px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('BÌNH THÔNG NHAU & PITTÔNG PASCAL: S₁ = 2·S₂', 256, 30);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 22px monospace';
  ctx.fillText(
    `Nhánh (1) S₁=20cm²: n₁=${m.n1} (${m.f1N.toFixed(1)}N) → h₁=${m.deltaH1Cm > 0 ? '+' : ''}${m.deltaH1Cm.toFixed(1)}cm`,
    256,
    66,
  );

  ctx.fillStyle = '#34d399';
  ctx.fillText(
    `Nhánh (2) S₂=10cm²: n₂=${m.n2} (${m.f2N.toFixed(1)}N) → h₂=${m.deltaH2Cm > 0 ? '+' : ''}${m.deltaH2Cm.toFixed(1)}cm`,
    256,
    100,
  );

  ctx.fillStyle = m.isBalanced ? '#4ade80' : '#f87171';
  ctx.font = 'bold 21px sans-serif';
  const diffCm = Math.abs(m.deltaH2Cm - m.deltaH1Cm);
  ctx.fillText(
    m.isBalanced
      ? `✓ CÂN BẰNG THỦY TĨNH (p₁ = p₂ = ${m.p1NCm2.toFixed(2)} N/cm²) · h₁ = h₂ = h₀`
      : `⚡ LỆCH MỰC NƯỚC Δh = ${diffCm.toFixed(1)}cm · p₁=${m.p1NCm2.toFixed(2)} vs p₂=${m.p2NCm2.toFixed(2)} N/cm²`,
    256,
    136,
  );

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function buildPascalPistonAssembly(
  radius: number,
  name: string,
  isPiston1: boolean,
): THREE.Group {
  const pistonGroup = new THREE.Group();
  pistonGroup.name = name;
  pistonGroup.userData = {
    isPascalPiston1: isPiston1,
    isPascalPiston2: !isPiston1,
  };

  const headMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.72,
    roughness: 0.28,
  });
  const sealMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    metalness: 0.15,
    roughness: 0.85,
  });
  const rodMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.88,
    roughness: 0.16,
  });
  const panMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.78,
    roughness: 0.24,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.75,
    roughness: 0.25,
  });

  // 1. Piston head block
  const headMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(
      radius * 0.96,
      radius * 0.96,
      PAS_PISTON_HEAD_THICKNESS,
      36,
    ),
    headMat,
  );
  headMesh.position.y = PAS_PISTON_HEAD_THICKNESS / 2;
  headMesh.castShadow = true;
  pistonGroup.add(headMesh);

  // 2. Twin dark nitrile O-ring seals
  const oRing1 = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 0.955, 0.032, 12, 36),
    sealMat,
  );
  oRing1.rotation.x = Math.PI / 2;
  oRing1.position.y = PAS_PISTON_HEAD_THICKNESS * 0.28;
  pistonGroup.add(oRing1);

  const oRing2 = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 0.955, 0.032, 12, 36),
    sealMat,
  );
  oRing2.rotation.x = Math.PI / 2;
  oRing2.position.y = PAS_PISTON_HEAD_THICKNESS * 0.72;
  pistonGroup.add(oRing2);

  // 3. Vertical machined steel rod
  const rodMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.105, 0.105, PAS_ROD_LENGTH, 20),
    rodMat,
  );
  rodMesh.position.y = PAS_PISTON_HEAD_THICKNESS + PAS_ROD_LENGTH / 2;
  rodMesh.castShadow = true;
  pistonGroup.add(rodMesh);

  // 4. Brass upper collar under pan
  const collarMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.16, 0.14, 24),
    brassMat,
  );
  collarMesh.position.y = PAS_PISTON_HEAD_THICKNESS + PAS_ROD_LENGTH - 0.05;
  pistonGroup.add(collarMesh);

  // 5. Top weight pan
  const panRadius = Math.max(radius * 0.92, 0.68);
  const panMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(
      panRadius,
      panRadius * 0.88,
      PAS_PAN_THICKNESS,
      36,
    ),
    panMat,
  );
  panMesh.position.y =
    PAS_PISTON_HEAD_THICKNESS + PAS_ROD_LENGTH + PAS_PAN_THICKNESS / 2;
  panMesh.castShadow = true;
  panMesh.receiveShadow = true;
  pistonGroup.add(panMesh);

  // 6. Pan outer safety rim
  const rimMesh = new THREE.Mesh(
    new THREE.TorusGeometry(panRadius * 0.95, 0.026, 12, 36),
    brassMat,
  );
  rimMesh.rotation.x = Math.PI / 2;
  rimMesh.position.y =
    PAS_PISTON_HEAD_THICKNESS + PAS_ROD_LENGTH + PAS_PAN_THICKNESS;
  pistonGroup.add(rimMesh);

  pistonGroup.traverse((child) => {
    child.userData = {
      ...child.userData,
      isPascalPiston1: isPiston1,
      isPascalPiston2: !isPiston1,
    };
  });

  return pistonGroup;
}

function setPascalWeightUserData(
  weightGroup: THREE.Object3D,
  index: number,
  zone: 'pool' | 'piston-1' | 'piston-2',
): void {
  const data = {
    isPascalWeightItem: true,
    weightIndex: index,
    pascalZone: zone,
    isPascalPiston1: zone === 'piston-1',
    isPascalPiston2: zone === 'piston-2',
    isPascalWeightPool: zone === 'pool',
  };
  weightGroup.userData = { ...weightGroup.userData, ...data };
  weightGroup.traverse((child) => {
    child.userData = { ...child.userData, ...data };
  });
}

function buildPascalCompositeWeight(index: number): THREE.Group {
  const weightGroup = new THREE.Group();
  weightGroup.name = `pascal_weight_${index + 1}`;

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.82,
    roughness: 0.24,
  });
  const capTex = createPascalWeightCapTexture('100g · 1.0N');
  const capMat = new THREE.MeshStandardMaterial({
    map: capTex,
    metalness: 0.55,
    roughness: 0.35,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.8,
    roughness: 0.22,
  });

  const bodyMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(
      PAS_WEIGHT_RADIUS,
      PAS_WEIGHT_RADIUS,
      PAS_WEIGHT_HEIGHT,
      28,
    ),
    bodyMat,
  );
  bodyMesh.name = 'weight_body_mesh';
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  weightGroup.add(bodyMesh);

  const capMesh = new THREE.Mesh(
    new THREE.CircleGeometry(PAS_WEIGHT_RADIUS * 0.96, 28),
    capMat,
  );
  capMesh.rotation.x = -Math.PI / 2;
  capMesh.position.y = PAS_WEIGHT_HEIGHT / 2 + 0.003;
  weightGroup.add(capMesh);

  const knobStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.08, 14),
    rimMat,
  );
  knobStem.position.y = PAS_WEIGHT_HEIGHT / 2 + 0.04;
  weightGroup.add(knobStem);

  const knobTop = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 14, 14),
    rimMat,
  );
  knobTop.position.y = PAS_WEIGHT_HEIGHT / 2 + 0.085;
  weightGroup.add(knobTop);

  // Keep invisible hit proxy strictly non-pickable so only clicking accurately on the visible weight body grabs it
  const hitProxy = new THREE.Mesh(
    new THREE.CylinderGeometry(
      PAS_WEIGHT_RADIUS * 1.0,
      PAS_WEIGHT_RADIUS * 1.0,
      PAS_WEIGHT_HEIGHT,
      16,
    ),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  );
  hitProxy.position.y = 0;
  hitProxy.userData.nonPickable = true;
  hitProxy.raycast = () => {};
  weightGroup.add(hitProxy);

  setPascalWeightUserData(weightGroup, index, 'pool');

  return weightGroup;
}

function buildPascalWeight100gModel(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'body';
  const S = 0.042;
  const w = buildPascalCompositeWeight(0);
  w.position.y = (PAS_WEIGHT_HEIGHT / 2) * S;
  w.scale.setScalar(S);
  root.add(w);
  return root;
}

function buildPascalHydraulicPressModel(): THREE.Group {
  const outerRoot = new THREE.Group();
  outerRoot.name = 'body';

  const scaledRoot = new THREE.Group();
  scaledRoot.name = 'pascal_scaled_world';
  scaledRoot.scale.setScalar(PASCAL_WORLD_SCALE);
  outerRoot.add(scaledRoot);

  // 1. Base Stand & Bench Plinth
  const standGroup = new THREE.Group();
  standGroup.name = 'LaboratoryBaseStand';

  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.45,
    roughness: 0.55,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.65,
    roughness: 0.35,
  });
  const footMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    roughness: 0.9,
  });

  const mainPlinth = new THREE.Mesh(
    new THREE.BoxGeometry(7.6, 0.26, 2.8),
    plinthMat,
  );
  mainPlinth.position.set(0, 0.16, 0);
  mainPlinth.receiveShadow = true;
  mainPlinth.castShadow = true;
  standGroup.add(mainPlinth);

  const footPositions: [number, number, number][] = [
    [-3.4, 0.04, -1.1],
    [3.4, 0.04, -1.1],
    [-3.4, 0.04, 1.1],
    [3.4, 0.04, 1.1],
  ];
  footPositions.forEach(([fx, fy, fz]) => {
    const foot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.28, 0.08, 20),
      footMat,
    );
    foot.position.set(fx, fy, fz);
    standGroup.add(foot);
  });

  const ped1 = new THREE.Mesh(
    new THREE.CylinderGeometry(PAS_R1 + 0.18, PAS_R1 + 0.26, 0.36, 36),
    trimMat,
  );
  ped1.position.set(PAS_X1, 0.47, 0);
  standGroup.add(ped1);

  const ped2 = new THREE.Mesh(
    new THREE.CylinderGeometry(PAS_R2 + 0.18, PAS_R2 + 0.26, 0.36, 36),
    trimMat,
  );
  ped2.position.set(PAS_X2, 0.47, 0);
  standGroup.add(ped2);

  // Front weight tray (WeightPool)
  const poolBase = new THREE.Mesh(
    new THREE.BoxGeometry(6.4, 0.14, 1.8),
    new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.35,
      roughness: 0.65,
    }),
  );
  poolBase.position.set(0, 0.09, PAS_POOL_Z);
  poolBase.receiveShadow = true;
  poolBase.userData = { isPascalWeightPool: true };
  standGroup.add(poolBase);

  PAS_POOL_SLOTS.forEach(([sx, , sz]) => {
    const pad = new THREE.Mesh(
      new THREE.RingGeometry(0.22, 0.38, 24),
      new THREE.MeshBasicMaterial({
        color: 0x64748b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
      }),
    );
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(sx, 0.165, sz);
    pad.userData = { isPascalWeightPool: true };
    standGroup.add(pad);
  });

  scaledRoot.add(standGroup);

  // 2. Optical Glass Communicating Cylinders (CylinderLarge S1, CylinderSmall S2, ConnectingTube)
  const glassWallMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0.34,
    roughness: 0.08,
    metalness: 0.05,
    transmission: 0.72,
    ior: 1.48,
    reflectivity: 0.6,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const collarMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.78,
    roughness: 0.25,
  });
  const brassFittingMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.82,
    roughness: 0.22,
  });
  const rulerTexture = createPascalRulerTexture();
  const rulerMat = new THREE.MeshBasicMaterial({
    map: rulerTexture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const buildBranchCylinder = (radius: number, xPos: number, name: string) => {
    const branch = new THREE.Group();
    branch.name = name;
    branch.position.set(xPos, PAS_CYL_BOTTOM_Y, 0);

    const glassCyl = new THREE.Mesh(
      new THREE.CylinderGeometry(
        radius + 0.04,
        radius + 0.04,
        PAS_CYL_HEIGHT,
        40,
        1,
        true,
      ),
      glassWallMat,
    );
    glassCyl.position.y = PAS_CYL_HEIGHT / 2;
    glassCyl.renderOrder = 3;
    branch.add(glassCyl);

    const bottomRing = new THREE.Mesh(
      new THREE.TorusGeometry(radius + 0.05, 0.07, 14, 36),
      collarMat,
    );
    bottomRing.rotation.x = Math.PI / 2;
    bottomRing.position.y = 0.04;
    branch.add(bottomRing);

    const topRing = new THREE.Mesh(
      new THREE.TorusGeometry(radius + 0.05, 0.055, 14, 36),
      collarMat,
    );
    topRing.rotation.x = Math.PI / 2;
    topRing.position.y = PAS_CYL_HEIGHT;
    branch.add(topRing);

    const eqRing = new THREE.Mesh(
      new THREE.TorusGeometry(radius + 0.055, 0.018, 12, 36),
      new THREE.MeshBasicMaterial({ color: 0x00bceb }),
    );
    eqRing.rotation.x = Math.PI / 2;
    eqRing.position.y = PAS_EQUILIBRIUM_LIQUID_H;
    branch.add(eqRing);

    const rulerStrip = new THREE.Mesh(
      new THREE.CylinderGeometry(
        radius + 0.052,
        radius + 0.052,
        PAS_CYL_HEIGHT,
        24,
        1,
        true,
        -Math.PI * 0.22,
        Math.PI * 0.44,
      ),
      rulerMat,
    );
    rulerStrip.name = `pascal_ruler_${name}`;
    rulerStrip.position.y = PAS_CYL_HEIGHT / 2;
    rulerStrip.renderOrder = 4;
    branch.add(rulerStrip);

    return branch;
  };

  scaledRoot.add(buildBranchCylinder(PAS_R1, PAS_X1, 'CylinderLarge'));
  scaledRoot.add(buildBranchCylinder(PAS_R2, PAS_X2, 'CylinderSmall'));

  // Horizontal equilibrium reference line connecting both cylinders at h0
  const eqBridgeLine = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.016, Math.abs(PAS_X2 - PAS_X1), 8),
    new THREE.MeshBasicMaterial({
      color: 0x00bceb,
      transparent: true,
      opacity: 0.45,
    }),
  );
  eqBridgeLine.rotation.z = Math.PI / 2;
  eqBridgeLine.position.set(0, PAS_CYL_BOTTOM_Y + PAS_EQUILIBRIUM_LIQUID_H, 0);
  scaledRoot.add(eqBridgeLine);

  // Horizontal connecting glass tube at bottom
  const connGroup = new THREE.Group();
  connGroup.name = 'ConnectingTube';
  const tubeLen = Math.abs(PAS_X2 - PAS_X1);
  const outerTube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.36, tubeLen, 28),
    glassWallMat,
  );
  outerTube.rotation.z = Math.PI / 2;
  outerTube.position.set(0, PAS_CYL_BOTTOM_Y + 0.38, 0);
  outerTube.renderOrder = 3;
  connGroup.add(outerTube);

  [-1.25, 0, 1.25].forEach((bx) => {
    const unionRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.39, 0.055, 12, 28),
      brassFittingMat,
    );
    unionRing.rotation.y = Math.PI / 2;
    unionRing.position.set(bx, PAS_CYL_BOTTOM_Y + 0.38, 0);
    connGroup.add(unionRing);
  });
  scaledRoot.add(connGroup);

  // 3. Hydraulic Liquid Columns, Meniscus & Dynamic Level Pointer Rings
  const liquidGroup = new THREE.Group();
  liquidGroup.name = 'liquid_surface';

  const liquidMat = new THREE.MeshPhysicalMaterial({
    color: 0x0284c7,
    emissive: 0x0369a1,
    emissiveIntensity: 0.32,
    transparent: true,
    opacity: 0.84,
    roughness: 0.1,
    metalness: 0.05,
    transmission: 0.25,
    depthWrite: false,
  });
  const meniscusMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.96,
  });

  const liq1Geo = new THREE.CylinderGeometry(PAS_R1 * 0.97, PAS_R1 * 0.97, 1, 36);
  liq1Geo.translate(0, 0.5, 0);
  const liquidCol1 = new THREE.Mesh(liq1Geo, liquidMat);
  liquidCol1.name = 'pascal_liquid_col1';
  liquidCol1.position.set(PAS_X1, PAS_CYL_BOTTOM_Y, 0);
  liquidCol1.scale.y = PAS_EQUILIBRIUM_LIQUID_H;
  liquidCol1.renderOrder = 2;
  liquidGroup.add(liquidCol1);

  const liq2Geo = new THREE.CylinderGeometry(PAS_R2 * 0.97, PAS_R2 * 0.97, 1, 36);
  liq2Geo.translate(0, 0.5, 0);
  const liquidCol2 = new THREE.Mesh(liq2Geo, liquidMat);
  liquidCol2.name = 'pascal_liquid_col2';
  liquidCol2.position.set(PAS_X2, PAS_CYL_BOTTOM_Y, 0);
  liquidCol2.scale.y = PAS_EQUILIBRIUM_LIQUID_H;
  liquidCol2.renderOrder = 2;
  liquidGroup.add(liquidCol2);

  const meniscus1 = new THREE.Mesh(
    new THREE.TorusGeometry(PAS_R1 * 0.96, 0.036, 14, 36),
    meniscusMat,
  );
  meniscus1.name = 'pascal_meniscus1';
  meniscus1.rotation.x = Math.PI / 2;
  meniscus1.position.set(
    PAS_X1,
    PAS_CYL_BOTTOM_Y + PAS_EQUILIBRIUM_LIQUID_H,
    0,
  );
  liquidGroup.add(meniscus1);

  const meniscus2 = new THREE.Mesh(
    new THREE.TorusGeometry(PAS_R2 * 0.96, 0.032, 14, 36),
    meniscusMat,
  );
  meniscus2.name = 'pascal_meniscus2';
  meniscus2.rotation.x = Math.PI / 2;
  meniscus2.position.set(
    PAS_X2,
    PAS_CYL_BOTTOM_Y + PAS_EQUILIBRIUM_LIQUID_H,
    0,
  );
  liquidGroup.add(meniscus2);

  // Outer glowing water-level indicator rings on the exterior of each cylinder so level changes stand out clearly
  const levelRing1 = new THREE.Mesh(
    new THREE.TorusGeometry(PAS_R1 + 0.075, 0.028, 12, 36),
    new THREE.MeshBasicMaterial({ color: 0xfbbf24 }),
  );
  levelRing1.name = 'pascal_level_ring1';
  levelRing1.rotation.x = Math.PI / 2;
  levelRing1.position.set(
    PAS_X1,
    PAS_CYL_BOTTOM_Y + PAS_EQUILIBRIUM_LIQUID_H,
    0,
  );
  liquidGroup.add(levelRing1);

  const levelRing2 = new THREE.Mesh(
    new THREE.TorusGeometry(PAS_R2 + 0.075, 0.028, 12, 36),
    new THREE.MeshBasicMaterial({ color: 0x34d399 }),
  );
  levelRing2.name = 'pascal_level_ring2';
  levelRing2.rotation.x = Math.PI / 2;
  levelRing2.position.set(
    PAS_X2,
    PAS_CYL_BOTTOM_Y + PAS_EQUILIBRIUM_LIQUID_H,
    0,
  );
  liquidGroup.add(levelRing2);

  const horizFluid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.31, 0.31, tubeLen, 24),
    liquidMat,
  );
  horizFluid.rotation.z = Math.PI / 2;
  horizFluid.position.set(0, PAS_CYL_BOTTOM_Y + 0.38, 0);
  horizFluid.renderOrder = 2;
  liquidGroup.add(horizFluid);

  scaledRoot.add(liquidGroup);

  // 4. Omnidirectional Pascal Pressure Transmission Arrows inside Fluid
  const pascalVectorsGroup = new THREE.Group();
  pascalVectorsGroup.name = 'PascalTransmissionArrows';

  const addInternalArrow = (
    origin: THREE.Vector3,
    dir: THREE.Vector3,
    len = 0.42,
    color = 0xfef08a,
  ) => {
    const arrow = new THREE.ArrowHelper(
      dir.clone().normalize(),
      origin,
      len,
      color,
      0.14,
      0.09,
    );
    pascalVectorsGroup.add(arrow);
  };

  const midY1 = PAS_CYL_BOTTOM_Y + 1.15;
  addInternalArrow(
    new THREE.Vector3(PAS_X1, midY1 + 0.35, 0),
    new THREE.Vector3(0, -1, 0),
    0.45,
    0xfde047,
  );
  addInternalArrow(
    new THREE.Vector3(PAS_X1 - 0.15, midY1, 0),
    new THREE.Vector3(-1, 0, 0),
    0.48,
    0x38bdf8,
  );
  addInternalArrow(
    new THREE.Vector3(PAS_X1 + 0.15, midY1, 0),
    new THREE.Vector3(1, 0, 0),
    0.48,
    0x38bdf8,
  );
  addInternalArrow(
    new THREE.Vector3(PAS_X1, midY1, 0.15),
    new THREE.Vector3(0, 0, 1),
    0.48,
    0x38bdf8,
  );
  addInternalArrow(
    new THREE.Vector3(PAS_X1, midY1, -0.15),
    new THREE.Vector3(0, 0, -1),
    0.48,
    0x38bdf8,
  );

  [-1.2, 0, 1.2].forEach((tx) => {
    addInternalArrow(
      new THREE.Vector3(tx - 0.22, PAS_CYL_BOTTOM_Y + 0.38, 0),
      new THREE.Vector3(1, 0, 0),
      0.48,
      0xfef08a,
    );
  });

  const midY2 = PAS_CYL_BOTTOM_Y + 1.15;
  addInternalArrow(
    new THREE.Vector3(PAS_X2, midY2 - 0.25, 0),
    new THREE.Vector3(0, 1, 0),
    0.5,
    0x4ade80,
  );
  addInternalArrow(
    new THREE.Vector3(PAS_X2 - 0.1, midY2, 0),
    new THREE.Vector3(-1, 0, 0),
    0.36,
    0x38bdf8,
  );
  addInternalArrow(
    new THREE.Vector3(PAS_X2 + 0.1, midY2, 0),
    new THREE.Vector3(1, 0, 0),
    0.36,
    0x38bdf8,
  );
  scaledRoot.add(pascalVectorsGroup);

  // 5. Pistons (Piston 1 on S1, Piston 2 on S2)
  const piston1 = buildPascalPistonAssembly(PAS_R1, 'Piston1', true);
  piston1.position.set(
    PAS_X1,
    PAS_CYL_BOTTOM_Y + PAS_EQUILIBRIUM_LIQUID_H,
    0,
  );
  scaledRoot.add(piston1);

  const piston2 = buildPascalPistonAssembly(PAS_R2, 'Piston2', false);
  piston2.position.set(
    PAS_X2,
    PAS_CYL_BOTTOM_Y + PAS_EQUILIBRIUM_LIQUID_H,
    0,
  );
  scaledRoot.add(piston2);

  // 6. External Force Vector Arrows F1 & F2 above pans
  const forceVectorsGroup = new THREE.Group();
  forceVectorsGroup.name = 'ForceVectorsGroup';

  const f1Arrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(PAS_X1, 6.2, 0),
    1.0,
    0xf59e0b,
    0.26,
    0.18,
  );
  f1Arrow.name = 'pascal_force_arrow1';
  f1Arrow.visible = false;
  forceVectorsGroup.add(f1Arrow);

  const f2Arrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(PAS_X2, 6.2, 0),
    1.0,
    0x10b981,
    0.26,
    0.18,
  );
  f2Arrow.name = 'pascal_force_arrow2';
  f2Arrow.visible = false;
  forceVectorsGroup.add(f2Arrow);

  scaledRoot.add(forceVectorsGroup);

  // 7. 8 Composite Weights in Pool / Pistons
  const weightsContainer = new THREE.Group();
  weightsContainer.name = 'PascalWeightsContainer';
  for (let i = 0; i < 8; i++) {
    const w = buildPascalCompositeWeight(i);
    const slot = PAS_POOL_SLOTS[i];
    w.position.set(slot[0], slot[1], slot[2]);
    setPascalWeightUserData(w, i, 'pool');
    weightsContainer.add(w);
  }
  scaledRoot.add(weightsContainer);

  // 8. Front Live Status Panel (`scale_display`) between the two cylinders
  const displayPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 1.06),
    new THREE.MeshBasicMaterial({
      map: createPascalBannerTexture(0, 0),
      side: THREE.DoubleSide,
    }),
  );
  displayPlane.name = 'scale_display';
  displayPlane.position.set(0, 0.58, 1.42);
  displayPlane.rotation.x = -0.28;
  scaledRoot.add(displayPlane);

  const anchor = new THREE.Object3D();
  anchor.name = 'measurement_anchor';
  anchor.position.set(0, 0.22, 0);
  outerRoot.add(anchor);

  return outerRoot;
}

export interface PascalActiveWeightDragPreview {
  weightIndex: number;
  localPos: [number, number, number] | THREE.Vector3;
  previewN1: number;
  previewN2: number;
}

export function stepPascalHydraulicPressAnimation(
  instanceRoot: THREE.Object3D,
  instance: SceneInstance,
  dt: number,
  dragPreview?: PascalActiveWeightDragPreview | null,
): boolean {
  const n1 = dragPreview
    ? dragPreview.previewN1
    : (instance.instanceState.weightsPiston1 ?? 0);
  const n2 = dragPreview
    ? dragPreview.previewN2
    : (instance.instanceState.weightsPiston2 ?? 0);
  const showPascalArrows = instance.instanceState.showPascalArrows !== false;
  const showForceVectors = instance.instanceState.showForceVectors !== false;
  const showRulerGrid = instance.instanceState.showRulerGrid !== false;

  const metrics = computePascalSimulationMetrics(n1, n2);

  const rawLiqH1 =
    PAS_EQUILIBRIUM_LIQUID_H + metrics.deltaH1Cm * PAS_CM_TO_WORLD_Y;
  const rawLiqH2 =
    PAS_EQUILIBRIUM_LIQUID_H + metrics.deltaH2Cm * PAS_CM_TO_WORLD_Y;
  const targetLiqH1 = THREE.MathUtils.clamp(rawLiqH1, 0.45, PAS_CYL_HEIGHT - 0.35);
  const targetLiqH2 = THREE.MathUtils.clamp(rawLiqH2, 0.45, PAS_CYL_HEIGHT - 0.35);

  const prevLiqH1 =
    typeof instanceRoot.userData.animLiqH1 === 'number'
      ? instanceRoot.userData.animLiqH1
      : targetLiqH1;
  const prevLiqH2 =
    typeof instanceRoot.userData.animLiqH2 === 'number'
      ? instanceRoot.userData.animLiqH2
      : targetLiqH2;

  const liqH1 =
    dt > 0
      ? THREE.MathUtils.damp(prevLiqH1, targetLiqH1, 8.5, dt)
      : targetLiqH1;
  const liqH2 =
    dt > 0
      ? THREE.MathUtils.damp(prevLiqH2, targetLiqH2, 8.5, dt)
      : targetLiqH2;

  instanceRoot.userData.animLiqH1 = liqH1;
  instanceRoot.userData.animLiqH2 = liqH2;

  let needsMoreFrames =
    Math.abs(liqH1 - targetLiqH1) > 0.0015 ||
    Math.abs(liqH2 - targetLiqH2) > 0.0015 ||
    Boolean(dragPreview);

  const liquidCol1 = instanceRoot.getObjectByName('pascal_liquid_col1');
  if (liquidCol1) {
    liquidCol1.scale.y = liqH1;
  }
  const liquidCol2 = instanceRoot.getObjectByName('pascal_liquid_col2');
  if (liquidCol2) {
    liquidCol2.scale.y = liqH2;
  }

  const meniscus1 = instanceRoot.getObjectByName('pascal_meniscus1');
  if (meniscus1) {
    meniscus1.position.y = PAS_CYL_BOTTOM_Y + liqH1;
  }
  const meniscus2 = instanceRoot.getObjectByName('pascal_meniscus2');
  if (meniscus2) {
    meniscus2.position.y = PAS_CYL_BOTTOM_Y + liqH2;
  }

  const levelRing1 = instanceRoot.getObjectByName('pascal_level_ring1');
  if (levelRing1) {
    levelRing1.position.y = PAS_CYL_BOTTOM_Y + liqH1;
  }
  const levelRing2 = instanceRoot.getObjectByName('pascal_level_ring2');
  if (levelRing2) {
    levelRing2.position.y = PAS_CYL_BOTTOM_Y + liqH2;
  }

  const piston1 = instanceRoot.getObjectByName('Piston1');
  if (piston1) {
    piston1.position.y = PAS_CYL_BOTTOM_Y + liqH1;
  }
  const piston2 = instanceRoot.getObjectByName('Piston2');
  if (piston2) {
    piston2.position.y = PAS_CYL_BOTTOM_Y + liqH2;
  }

  const pascalArrows = instanceRoot.getObjectByName('PascalTransmissionArrows');
  if (pascalArrows) {
    pascalArrows.visible = showPascalArrows && (metrics.n1 > 0 || metrics.n2 > 0);
  }

  const ruler1 = instanceRoot.getObjectByName('pascal_ruler_CylinderLarge');
  if (ruler1) ruler1.visible = showRulerGrid;
  const ruler2 = instanceRoot.getObjectByName('pascal_ruler_CylinderSmall');
  if (ruler2) ruler2.visible = showRulerGrid;

  const pan1TopY =
    PAS_CYL_BOTTOM_Y +
    liqH1 +
    PAS_PISTON_HEAD_THICKNESS +
    PAS_ROD_LENGTH +
    PAS_PAN_THICKNESS;
  const pan2TopY =
    PAS_CYL_BOTTOM_Y +
    liqH2 +
    PAS_PISTON_HEAD_THICKNESS +
    PAS_ROD_LENGTH +
    PAS_PAN_THICKNESS;

  const scaledWorld = instanceRoot.getObjectByName('pascal_scaled_world');
  if (scaledWorld) {
    scaledWorld.userData.animPan1TopY = pan1TopY;
    scaledWorld.userData.animPan2TopY = pan2TopY;
  }

  const f1Arrow = instanceRoot.getObjectByName(
    'pascal_force_arrow1',
  ) as THREE.ArrowHelper | undefined;
  if (f1Arrow) {
    if (showForceVectors && metrics.n1 > 0) {
      f1Arrow.visible = true;
      const len1 = 0.55 + metrics.n1 * 0.22;
      f1Arrow.position.set(
        PAS_X1,
        pan1TopY + metrics.n1 * PAS_WEIGHT_HEIGHT + len1 + 0.25,
        0,
      );
      f1Arrow.setLength(len1, 0.26, 0.18);
    } else {
      f1Arrow.visible = false;
    }
  }

  const f2Arrow = instanceRoot.getObjectByName(
    'pascal_force_arrow2',
  ) as THREE.ArrowHelper | undefined;
  if (f2Arrow) {
    if (showForceVectors && metrics.n2 > 0) {
      f2Arrow.visible = true;
      const len2 = 0.55 + metrics.n2 * 0.22;
      f2Arrow.position.set(
        PAS_X2,
        pan2TopY + metrics.n2 * PAS_WEIGHT_HEIGHT + len2 + 0.25,
        0,
      );
      f2Arrow.setLength(len2, 0.26, 0.18);
    } else {
      f2Arrow.visible = false;
    }
  }

  // Position the 8 composite weights onto Piston 1 (0..n1-1), Piston 2 (n1..n1+n2-1), or Pool
  const activeStackN1 = dragPreview
    ? dragPreview.previewN1
    : (instance.instanceState.weightsPiston1 ?? 0);
  const activeStackN2 = dragPreview
    ? dragPreview.previewN2
    : (instance.instanceState.weightsPiston2 ?? 0);

  let stack1Counter = 0;
  let stack2Counter = 0;

  for (let i = 0; i < 8; i++) {
    const w = instanceRoot.getObjectByName(`pascal_weight_${i + 1}`);
    if (!w) continue;

    const bodyMesh = w.getObjectByName('weight_body_mesh') as
      | THREE.Mesh
      | undefined;

    if (dragPreview && dragPreview.weightIndex === i) {
      if (Array.isArray(dragPreview.localPos)) {
        w.position.set(
          dragPreview.localPos[0],
          dragPreview.localPos[1],
          dragPreview.localPos[2],
        );
      } else {
        w.position.copy(dragPreview.localPos);
      }
      if (
        bodyMesh &&
        bodyMesh.material instanceof THREE.MeshStandardMaterial
      ) {
        bodyMesh.material.emissive.setHex(0xf59e0b);
        bodyMesh.material.emissiveIntensity = 0.35;
      }
      continue;
    }

    if (
      bodyMesh &&
      bodyMesh.material instanceof THREE.MeshStandardMaterial &&
      bodyMesh.material.emissiveIntensity > 0
    ) {
      bodyMesh.material.emissive.setHex(0x000000);
      bodyMesh.material.emissiveIntensity = 0;
    }

    let targetX = PAS_POOL_SLOTS[i][0];
    let targetY = PAS_POOL_SLOTS[i][1];
    let targetZ = PAS_POOL_SLOTS[i][2];
    let zone: 'pool' | 'piston-1' | 'piston-2' = 'pool';

    if (stack1Counter < activeStackN1) {
      targetX = PAS_X1;
      targetY =
        pan1TopY + PAS_WEIGHT_HEIGHT / 2 + stack1Counter * PAS_WEIGHT_HEIGHT;
      targetZ = 0;
      zone = 'piston-1';
      stack1Counter++;
    } else if (stack2Counter < activeStackN2) {
      targetX = PAS_X2;
      targetY =
        pan2TopY + PAS_WEIGHT_HEIGHT / 2 + stack2Counter * PAS_WEIGHT_HEIGHT;
      targetZ = 0;
      zone = 'piston-2';
      stack2Counter++;
    }

    if (dt > 0 && instanceRoot.userData.weightsInitialized) {
      const distSq =
        (w.position.x - targetX) ** 2 +
        (w.position.y - targetY) ** 2 +
        (w.position.z - targetZ) ** 2;
      if (distSq > 0.0001) {
        w.position.x = THREE.MathUtils.damp(w.position.x, targetX, 16, dt);
        w.position.y = THREE.MathUtils.damp(w.position.y, targetY, 16, dt);
        w.position.z = THREE.MathUtils.damp(w.position.z, targetZ, 16, dt);
        needsMoreFrames = true;
      } else {
        w.position.set(targetX, targetY, targetZ);
      }
    } else {
      w.position.set(targetX, targetY, targetZ);
    }

    setPascalWeightUserData(w, i, zone);
  }
  instanceRoot.userData.weightsInitialized = true;

  // Update front status display texture if n1 or n2 changed
  const lcdNode = instanceRoot.getObjectByName('scale_display') as
    | THREE.Mesh
    | undefined;
  const stateKey = `${metrics.n1}:${metrics.n2}`;
  if (
    lcdNode &&
    lcdNode.material instanceof THREE.MeshBasicMaterial &&
    lcdNode.userData.lastText !== stateKey
  ) {
    lcdNode.userData.lastText = stateKey;
    const newTex = createPascalBannerTexture(metrics.n1, metrics.n2);
    if (lcdNode.material.map && lcdNode.material.map !== newTex) {
      lcdNode.material.map.dispose();
    }
    lcdNode.material.map = newTex;
    lcdNode.material.needsUpdate = true;
  }

  return needsMoreFrames;
}

function applyPascalHydraulicPressStateToObject3D(
  instanceRoot: THREE.Object3D,
  instance: SceneInstance,
): void {
  const isFirstInit = !instanceRoot.userData.weightsInitialized;
  stepPascalHydraulicPressAnimation(
    instanceRoot,
    instance,
    isFirstInit ? 0 : 0.016,
    null,
  );
}

