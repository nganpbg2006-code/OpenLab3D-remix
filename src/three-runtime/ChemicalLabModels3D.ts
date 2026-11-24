import * as THREE from 'three';
import { SceneInstance } from '../domain/types';

/**
 * OPENLAB 3D — CHEMICAL REAGENT BOTTLES & SPECIMENS 3D GENERATOR
 * Chuyển đổi nguyên bản 100% hình học, vật liệu PBR, nhãn CanvasTexture 2048x1024,
 * vạch chia 50ml–400ml (chuẩn 300ml) và hiệu ứng phản ứng hóa học 3D từ 3 file dữ liệu:
 * 1. Lọ thủy tinh trong suốt Schott Duran 400ml đựng dung dịch NaOH 0,1M (chứa 300ml) + 6 tính chất hóa học
 * 2. Mẫu Vòng dây đồng nguyên chất (Cu — 3,00g, 0,0469 mol) + mối xoắn gài + phản ứng O2, Cl2, HCl+O2, HNO3, AgNO3
 * 3. Lọ thủy tinh nâu hổ phách Schott Duran 400ml đựng dung dịch AgNO3 0,1M (chứa 300ml) + X-Ray + 6 phản ứng
 */

export const BOTTLE_WORLD_SCALE = 0.0265; // 6.78 units -> ~0.180m (180mm), đường kính ~86mm
export const CU_RING_WORLD_SCALE = 0.009; // Đường kính vòng dây đồng ~44mm (bằng 1/2 kích thước cũ) trên bàn thí nghiệm

const LIQUID_BASE_Y = 0.35;
const HEIGHT_PER_100ML = 1.0;
const OVERLAY_MIN_Y = 0.35;
const OVERLAY_MAX_Y = 4.65;

function volumeToWorldY(volMl: number): number {
  return LIQUID_BASE_Y + (volMl / 100) * HEIGHT_PER_100ML;
}

// Bộ nhớ đệm Cubemap phòng thí nghiệm cho lọ thủy tinh trong, lọ nâu và đồng kim loại
let cachedClearGlassEnvMap: THREE.CubeTexture | null = null;
let cachedAmberGlassEnvMap: THREE.CubeTexture | null = null;
let cachedCopperStudioEnvMap: THREE.CubeTexture | null = null;
let cachedCopperBumpTex: THREE.CanvasTexture | null = null;

function getClearGlassEnvironmentMap(): THREE.CubeTexture {
  if (cachedClearGlassEnvMap) return cachedClearGlassEnvMap;
  const faces: HTMLCanvasElement[] = [];
  for (let i = 0; i < 6; i++) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.5, '#e0f2fe');
    grad.addColorStop(0.85, '#bae6fd');
    grad.addColorStop(1, '#64748b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    if (i === 0 || i === 1 || i === 4 || i === 5) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
      ctx.fillRect(38, 14, 44, 228);
      ctx.fillStyle = 'rgba(224, 242, 254, 0.78)';
      ctx.fillRect(172, 24, 30, 208);
    }
    faces.push(c);
  }
  const cubeTexture = new THREE.CubeTexture(faces);
  cubeTexture.needsUpdate = true;
  cachedClearGlassEnvMap = cubeTexture;
  return cubeTexture;
}

function getAmberGlassEnvironmentMap(): THREE.CubeTexture {
  if (cachedAmberGlassEnvMap) return cachedAmberGlassEnvMap;
  const faces: HTMLCanvasElement[] = [];
  for (let i = 0; i < 6; i++) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#f8fafc');
    grad.addColorStop(0.5, '#cbd5e1');
    grad.addColorStop(1, '#475569');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    if (i === 0 || i === 1 || i === 4 || i === 5) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.fillRect(42, 18, 38, 220);
      ctx.fillStyle = 'rgba(255, 250, 240, 0.65)';
      ctx.fillRect(175, 28, 26, 200);
    }
    faces.push(c);
  }
  const cubeTexture = new THREE.CubeTexture(faces);
  cubeTexture.needsUpdate = true;
  cachedAmberGlassEnvMap = cubeTexture;
  return cubeTexture;
}

function getCopperStudioEnvMap(): THREE.CubeTexture {
  if (cachedCopperStudioEnvMap) return cachedCopperStudioEnvMap;
  const faces: HTMLCanvasElement[] = [];
  for (let i = 0; i < 6; i++) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.48, '#f1f5f9');
    grad.addColorStop(0.85, '#cbd5e1');
    grad.addColorStop(1, '#64748b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    if (i === 0 || i === 1 || i === 2 || i === 4) {
      ctx.fillStyle = 'rgba(255, 250, 245, 0.95)';
      ctx.fillRect(28, 24, 90, 200);
      ctx.fillStyle = 'rgba(255, 228, 205, 0.75)';
      ctx.fillRect(150, 40, 60, 170);
    }
    faces.push(c);
  }
  const cubeTex = new THREE.CubeTexture(faces);
  cubeTex.needsUpdate = true;
  cachedCopperStudioEnvMap = cubeTex;
  return cubeTex;
}

function getCopperMicroBumpTexture(): THREE.CanvasTexture {
  if (cachedCopperBumpTex) return cachedCopperBumpTex;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 1800; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const w = 8 + Math.random() * 45;
    const h = 1 + Math.random() * 2.5;
    const v = Math.floor(110 + Math.random() * 36);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(x, y, w, h);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 2);
  cachedCopperBumpTex = tex;
  return tex;
}

// ============================================================================
// 1. LỌ THỦY TINH TRONG SUỐT SCHOTT DURAN 400ML — DUNG DỊCH NaOH 0,1M (300ML)
// ============================================================================

function drawNaOHLabelAndScaleCanvas(
  canvas: HTMLCanvasElement,
  currentVolMl: number,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  function volToCanvasY(vMl: number): number {
    const worldY = volumeToWorldY(vMl);
    const norm = (worldY - OVERLAY_MIN_Y) / (OVERLAY_MAX_Y - OVERLAY_MIN_Y);
    return H * (1 - norm);
  }

  const frontCenterX = 960;

  // 1. Logo SCHOTT DURAN khắc axit/men xám bạc
  const logoY = 235;
  const logoSize = 116;
  ctx.save();
  ctx.strokeStyle = 'rgba(71, 85, 105, 0.88)';
  ctx.fillStyle = 'rgba(71, 85, 105, 0.90)';
  ctx.lineWidth = 4.5;

  ctx.strokeRect(
    frontCenterX - logoSize / 2,
    logoY - logoSize / 2,
    logoSize,
    logoSize,
  );
  ctx.beginPath();
  ctx.arc(frontCenterX, logoY, logoSize * 0.46, 0, Math.PI * 2);
  ctx.stroke();

  ctx.font = '800 22px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SCHOTT', frontCenterX, logoY);

  ctx.font = '800 26px Inter, sans-serif';
  ctx.fillText('DURAN', frontCenterX, logoY + logoSize / 2 + 28);

  ctx.font = '700 48px Inter, sans-serif';
  ctx.fillText('400 ml', frontCenterX, logoY + logoSize / 2 + 86);
  ctx.restore();

  // 2. Nhãn trắng ngà bo góc in rõ "NaOH 0,1M"
  const patchW = 390;
  const patchH = 265;
  const patchX = frontCenterX - patchW / 2;
  const patchY = 470;
  const radius = 28;

  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.22)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;

  ctx.beginPath();
  ctx.moveTo(patchX + radius, patchY);
  ctx.lineTo(patchX + patchW - radius, patchY);
  ctx.quadraticCurveTo(patchX + patchW, patchY, patchX + patchW, patchY + radius);
  ctx.lineTo(patchX + patchW, patchY + patchH - radius);
  ctx.quadraticCurveTo(
    patchX + patchW,
    patchY + patchH,
    patchX + patchW - radius,
    patchY + patchH,
  );
  ctx.lineTo(patchX + radius, patchY + patchH);
  ctx.quadraticCurveTo(patchX, patchY + patchH, patchX, patchY + patchH - radius);
  ctx.lineTo(patchX, patchY + radius);
  ctx.quadraticCurveTo(patchX, patchY, patchX + radius, patchY);
  ctx.closePath();

  const labelGrad = ctx.createLinearGradient(
    patchX,
    patchY,
    patchX + patchW,
    patchY + patchH,
  );
  labelGrad.addColorStop(0, '#f8f5eb');
  labelGrad.addColorStop(0.65, '#ede7d5');
  labelGrad.addColorStop(1, '#dfd7c2');
  ctx.fillStyle = labelGrad;
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = '#334155';
  ctx.stroke();

  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(patchX + 14, patchY + 14, patchW - 28, 34);
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 17px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DUNG DỊCH KIỀM CHUẨN (BAZƠ MẠNH)', frontCenterX, patchY + 32);

  ctx.fillStyle = '#0f172a';
  ctx.font = '800 58px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('NaOH', frontCenterX - 42, patchY + 95);

  ctx.fillStyle = '#0284c7';
  ctx.fillRect(frontCenterX + 62, patchY + 60, 108, 42);
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 24px "JetBrains Mono", monospace';
  ctx.fillText('0,1 M', frontCenterX + 116, patchY + 83);

  ctx.fillStyle = '#1e293b';
  ctx.font = '700 20px Inter, sans-serif';
  ctx.fillText('Natri Hiđroxit (Sodium Hydroxide)', frontCenterX, patchY + 132);

  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(patchX + 20, patchY + 148);
  ctx.lineTo(patchX + patchW - 20, patchY + 148);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.font = '600 18px Inter, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(
    `• Thể tích thực: ${Math.round(currentVolMl)} ml / 400 ml`,
    patchX + 24,
    patchY + 176,
  );
  ctx.fillText('• Nồng độ: 0,1 mol/L (pH = 13,0)', patchX + 24, patchY + 203);
  ctx.fillStyle = '#334155';
  ctx.font = '600 16px Inter, sans-serif';
  ctx.fillText('• Tính chất: Không màu, không mùi', patchX + 24, patchY + 229);
  ctx.fillStyle = '#b91c1c';
  ctx.font = '700 14px Inter, sans-serif';
  ctx.fillText('⚠ Chất ăn mòn da — Đậy kín tránh CO₂', patchX + 24, patchY + 251);
  ctx.restore();

  // Made in Germany & Retrace Code
  ctx.save();
  ctx.fillStyle = 'rgba(51, 65, 85, 0.85)';
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.80)';
  ctx.textAlign = 'center';
  ctx.font = '600 19px Inter, sans-serif';
  ctx.fillText('Made in Germany', frontCenterX, 775);

  const rcW = 220;
  const rcH = 54;
  const rcX = frontCenterX - rcW / 2;
  const rcY = 800;
  ctx.lineWidth = 3;
  ctx.strokeRect(rcX, rcY, rcW, rcH);
  ctx.font = '600 16px "JetBrains Mono", monospace';
  ctx.fillText('Retrace Code', frontCenterX, rcY + 21);
  ctx.fillText('00914208', frontCenterX, rcY + 42);
  ctx.restore();

  // Cột vạch chia thể tích (50ml -> 400ml)
  const scaleLeftX = 1235;
  ctx.save();

  ctx.save();
  ctx.translate(scaleLeftX - 28, volToCanvasY(225));
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = 'rgba(51, 65, 85, 0.85)';
  ctx.font = '700 20px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('APPROX. VOL.', 0, 0);
  ctx.restore();

  for (let v = 50; v <= 400; v += 25) {
    const yPos = volToCanvasY(v);
    const isMajor100 = v % 100 === 0;
    const isMajor50 = v % 50 === 0;
    const isTarget300 = v === 300;

    ctx.beginPath();
    if (isMajor50) {
      const tickLen = isMajor100 ? 92 : 66;
      ctx.lineWidth = isTarget300 ? 7.5 : isMajor100 ? 5.5 : 4.5;
      ctx.strokeStyle = isTarget300 ? '#0284c7' : 'rgba(30, 41, 59, 0.90)';
      ctx.moveTo(scaleLeftX, yPos);
      ctx.lineTo(scaleLeftX + tickLen, yPos);
      ctx.stroke();

      ctx.fillStyle = isTarget300 ? '#0284c7' : 'rgba(30, 41, 59, 0.92)';
      ctx.font = isTarget300
        ? '800 30px "JetBrains Mono", monospace'
        : isMajor100
          ? '700 27px "JetBrains Mono", monospace'
          : '600 22px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const labelText = isTarget300 ? '300 ml ◀' : v === 400 ? '400 ml' : `${v}`;
      ctx.fillText(labelText, scaleLeftX + tickLen + 14, yPos);
    } else {
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.65)';
      ctx.moveTo(scaleLeftX, yPos);
      ctx.lineTo(scaleLeftX + 36, yPos);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function buildGL45BlueScrewCap(): THREE.Group {
  const capGroup = new THREE.Group();
  capGroup.name = 'handle';
  capGroup.position.y = 5.66;

  const capBlueMat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    roughness: 0.3,
    metalness: 0.05,
  });
  const capDarkBlueMat = new THREE.MeshStandardMaterial({
    color: 0x1e40af,
    roughness: 0.38,
    metalness: 0.05,
  });

  const collarGeo = new THREE.CylinderGeometry(1.17, 1.17, 0.14, 64);
  const collarMesh = new THREE.Mesh(collarGeo, capDarkBlueMat);
  collarMesh.position.y = 0.07;
  capGroup.add(collarMesh);

  const capHeight = 0.92;
  const capMainGeo = new THREE.CylinderGeometry(1.16, 1.18, capHeight, 64);
  const capMainMesh = new THREE.Mesh(capMainGeo, capBlueMat);
  capMainMesh.position.y = 0.16 + capHeight / 2;
  capGroup.add(capMainMesh);

  const capTopGeo = new THREE.CylinderGeometry(1.1, 1.16, 0.08, 64);
  const capTopMesh = new THREE.Mesh(capTopGeo, capBlueMat);
  capTopMesh.position.y = 0.16 + capHeight + 0.04;
  capGroup.add(capTopMesh);

  const numRibs = 44;
  const ribRadius = 1.175;
  const ribGeo = new THREE.BoxGeometry(0.045, capHeight - 0.04, 0.065);
  for (let i = 0; i < numRibs; i++) {
    const angle = (i / numRibs) * Math.PI * 2;
    const rib = new THREE.Mesh(ribGeo, capBlueMat);
    rib.position.set(
      Math.cos(angle) * ribRadius,
      0.16 + capHeight / 2,
      Math.sin(angle) * ribRadius,
    );
    rib.rotation.y = -angle;
    capGroup.add(rib);
  }

  return capGroup;
}

function buildCompanionReactionBeaker3D(envMap: THREE.CubeTexture): THREE.Group {
  const testBeakerGroup = new THREE.Group();
  testBeakerGroup.name = 'reaction_beaker_group';
  testBeakerGroup.position.set(3.05, 0, 0.25);
  testBeakerGroup.visible = false; // Hiện tự động khi chọn tính chất hóa học

  const bRadius = 1.05;
  const bHeight = 2.45;

  const beakerGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0.28,
    roughness: 0.05,
    clearcoat: 1.0,
    envMap,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const wallGeo = new THREE.CylinderGeometry(bRadius, bRadius, bHeight, 56, 1, true);
  const wallMesh = new THREE.Mesh(wallGeo, beakerGlassMat);
  wallMesh.position.y = bHeight / 2;
  testBeakerGroup.add(wallMesh);

  const rimGeo = new THREE.TorusGeometry(bRadius, 0.035, 14, 56);
  rimGeo.rotateX(Math.PI / 2);
  const rimMesh = new THREE.Mesh(rimGeo, beakerGlassMat);
  rimMesh.position.y = bHeight;
  testBeakerGroup.add(rimMesh);

  const baseGeo = new THREE.CylinderGeometry(bRadius, bRadius, 0.08, 56);
  const baseMesh = new THREE.Mesh(baseGeo, beakerGlassMat);
  baseMesh.position.y = 0.04;
  testBeakerGroup.add(baseMesh);

  const liqH = 1.55;
  const liqGeo = new THREE.CylinderGeometry(bRadius - 0.04, bRadius - 0.04, liqH, 56);
  const liqMat = new THREE.MeshPhysicalMaterial({
    color: 0xf8fafc,
    transparent: true,
    opacity: 0.42,
    roughness: 0.06,
    envMap,
    depthWrite: false,
  });
  const beakerLiquidMesh = new THREE.Mesh(liqGeo, liqMat);
  beakerLiquidMesh.name = 'beaker_liquid_mesh';
  beakerLiquidMesh.position.y = liqH / 2 + 0.05;
  testBeakerGroup.add(beakerLiquidMesh);

  const topGeo = new THREE.CircleGeometry(bRadius - 0.04, 56);
  topGeo.rotateX(-Math.PI / 2);
  const topMat = new THREE.MeshPhysicalMaterial({
    color: 0xf8fafc,
    transparent: true,
    opacity: 0.58,
    roughness: 0.05,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const beakerTopMesh = new THREE.Mesh(topGeo, topMat);
  beakerTopMesh.name = 'beaker_top_mesh';
  beakerTopMesh.position.y = liqH + 0.05;
  testBeakerGroup.add(beakerTopMesh);

  // Giấy quỳ tím nhúng vào cốc
  const stripGeo = new THREE.BoxGeometry(0.28, 1.85, 0.025);
  const stripCanvas = document.createElement('canvas');
  stripCanvas.width = 64;
  stripCanvas.height = 256;
  const sCtx = stripCanvas.getContext('2d')!;
  sCtx.fillStyle = '#a855f7';
  sCtx.fillRect(0, 0, 64, 115);
  sCtx.fillStyle = '#2563eb';
  sCtx.fillRect(0, 115, 64, 141);
  const stripTex = new THREE.CanvasTexture(stripCanvas);
  const stripMat = new THREE.MeshBasicMaterial({ map: stripTex });
  const litmusStripMesh = new THREE.Mesh(stripGeo, stripMat);
  litmusStripMesh.name = 'litmus_strip_mesh';
  litmusStripMesh.position.set(0, 1.65, 0);
  litmusStripMesh.rotation.z = 0.12;
  litmusStripMesh.visible = false;
  testBeakerGroup.add(litmusStripMesh);

  // Thanh kim loại Nhôm (Al) hoặc dây Đồng (Cu) dưới đáy cốc
  const alGeo = new THREE.BoxGeometry(0.65, 0.16, 0.35);
  const alMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.88,
    roughness: 0.22,
  });
  const alMetalPieceMesh = new THREE.Mesh(alGeo, alMat);
  alMetalPieceMesh.name = 'metal_piece_mesh';
  alMetalPieceMesh.position.set(0, 0.15, 0);
  alMetalPieceMesh.visible = false;
  testBeakerGroup.add(alMetalPieceMesh);

  // Hạt kết tủa keo Cu(OH)2 / Al(OH)3 / AgCl / AgBr / AgI / Ag2O
  const precipGroup = new THREE.Group();
  precipGroup.name = 'precip_group';
  precipGroup.visible = false;
  testBeakerGroup.add(precipGroup);

  const pGeo = new THREE.DodecahedronGeometry(0.085, 1);
  for (let i = 0; i < 65; i++) {
    const pMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.4,
      transparent: true,
      opacity: 0.85,
    });
    const m = new THREE.Mesh(pGeo, pMat);
    const ang = (i * 2.39996) % (Math.PI * 2);
    const r = ((i * 17) % 100) / 100 * 0.78;
    const y = 0.15 + (((i * 31) % 100) / 100) * 1.15;
    m.position.set(Math.cos(ang) * r, y, Math.sin(ang) * r);
    m.userData = { baseY: y, phase: i * 0.45 };
    precipGroup.add(m);
  }

  // Hệ bọt khí (CO2, SO2, Cl2, H2, NO2)
  const bubbleGroup = new THREE.Group();
  bubbleGroup.name = 'bubble_group';
  bubbleGroup.visible = false;
  testBeakerGroup.add(bubbleGroup);

  const bGeo = new THREE.SphereGeometry(0.045, 10, 10);
  for (let i = 0; i < 60; i++) {
    const bMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.75,
    });
    const m = new THREE.Mesh(bGeo, bMat);
    const ang = (i * 1.85) % (Math.PI * 2);
    const r = (((i * 23) % 100) / 100) * 0.72;
    const y = 0.15 + (((i * 41) % 100) / 100) * 1.45;
    m.position.set(Math.cos(ang) * r, y, Math.sin(ang) * r);
    m.userData = {
      speed: 0.012 + (i % 7) * 0.003,
      wobble: i * 0.5,
      baseX: Math.cos(ang) * r,
    };
    bubbleGroup.add(m);
  }

  return testBeakerGroup;
}

export function buildNaOHBottle400Model(): THREE.Group {
  const scaledRoot = new THREE.Group();
  scaledRoot.name = 'naoh_bottle_root';
  scaledRoot.scale.setScalar(BOTTLE_WORLD_SCALE);

  const bottleGroup = new THREE.Group();
  bottleGroup.name = 'body';
  scaledRoot.add(bottleGroup);

  const envMap = getClearGlassEnvironmentMap();

  const outerPoints = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(1.42, 0.0),
    new THREE.Vector2(1.56, 0.08),
    new THREE.Vector2(1.62, 0.25),
    new THREE.Vector2(1.62, 4.45),
    new THREE.Vector2(1.58, 4.78),
    new THREE.Vector2(1.42, 5.1),
    new THREE.Vector2(1.16, 5.38),
    new THREE.Vector2(1.02, 5.55),
    new THREE.Vector2(1.08, 5.64),
    new THREE.Vector2(1.02, 5.72),
    new THREE.Vector2(1.02, 6.22),
    new THREE.Vector2(0.88, 6.22),
  ];

  const outerGeo = new THREE.LatheGeometry(outerPoints, 96);

  const outerGlassMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xdcfce7).lerp(new THREE.Color(0xbae6fd), 0.78),
    roughness: 0.05,
    metalness: 0.0,
    transparent: true,
    opacity: 0.34,
    reflectivity: 1.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    envMap,
    envMapIntensity: 1.55,
    side: THREE.FrontSide,
    depthWrite: false,
  });

  const innerGlassMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x93c5fd),
    roughness: 0.08,
    transparent: true,
    opacity: 0.2,
    envMap,
    envMapIntensity: 0.9,
    side: THREE.BackSide,
    depthWrite: false,
  });

  const outerBottleMesh = new THREE.Mesh(outerGeo, outerGlassMaterial);
  outerBottleMesh.name = 'outer_glass_mesh';
  outerBottleMesh.renderOrder = 3;
  bottleGroup.add(outerBottleMesh);

  const innerBottleMesh = new THREE.Mesh(outerGeo, innerGlassMaterial);
  innerBottleMesh.scale.set(0.955, 0.99, 0.955);
  innerBottleMesh.position.y = 0.05;
  innerBottleMesh.renderOrder = 1;
  bottleGroup.add(innerBottleMesh);

  const bottomDiskGeo = new THREE.CylinderGeometry(1.52, 1.44, 0.16, 64);
  const bottomDiskMat = new THREE.MeshPhysicalMaterial({
    color: 0x94a3b8,
    roughness: 0.15,
    transparent: true,
    opacity: 0.55,
    envMap,
  });
  const bottomDisk = new THREE.Mesh(bottomDiskGeo, bottomDiskMat);
  bottomDisk.position.y = 0.09;
  bottleGroup.add(bottomDisk);

  // Nhãn NaOH & Vạch chia thể tích 50ml -> 400ml
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 2048;
  labelCanvas.height = 1024;
  drawNaOHLabelAndScaleCanvas(labelCanvas, 300);

  const labelAndScaleTexture = new THREE.CanvasTexture(labelCanvas);
  labelAndScaleTexture.anisotropy = 16;
  labelAndScaleTexture.colorSpace = THREE.SRGBColorSpace;

  const overlayHeight = OVERLAY_MAX_Y - OVERLAY_MIN_Y;
  const overlayGeo = new THREE.CylinderGeometry(
    1.626,
    1.626,
    overlayHeight,
    96,
    1,
    true,
  );
  const overlayMat = new THREE.MeshStandardMaterial({
    map: labelAndScaleTexture,
    transparent: true,
    roughness: 0.3,
    metalness: 0.0,
    depthWrite: false,
  });
  const overlayMesh = new THREE.Mesh(overlayGeo, overlayMat);
  overlayMesh.name = 'scale_marks';
  overlayMesh.position.y = (OVERLAY_MIN_Y + OVERLAY_MAX_Y) / 2;
  overlayMesh.rotation.y = -Math.PI * 0.44;
  overlayMesh.renderOrder = 4;
  overlayMesh.userData = {
    canvas: labelCanvas,
    texture: labelAndScaleTexture,
    lastVolMl: 300,
  };
  bottleGroup.add(overlayMesh);

  // Dung dịch NaOH 0,1M (không màu, trong suốt, mặt khum tại vạch 300ml)
  const liquidGroup = new THREE.Group();
  liquidGroup.name = 'liquid_surface';
  bottleGroup.add(liquidGroup);

  const liquidRadius = 1.53;
  const bodyGeo = new THREE.CylinderGeometry(liquidRadius, liquidRadius, 1, 72);
  bodyGeo.translate(0, 0.5, 0);

  const liquidMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xf8fafc),
    emissive: new THREE.Color(0xe0f2fe),
    emissiveIntensity: 0.12,
    roughness: 0.04,
    transparent: true,
    opacity: 0.36,
    envMap,
    envMapIntensity: 1.25,
    depthWrite: false,
  });

  const liquidCylinder = new THREE.Mesh(bodyGeo, liquidMat);
  liquidCylinder.name = 'bottle_liquid_cylinder';
  liquidCylinder.position.y = LIQUID_BASE_Y;
  liquidCylinder.scale.set(1, 3.0, 1);
  liquidCylinder.renderOrder = 2;
  liquidGroup.add(liquidCylinder);

  const meniscusGeo = new THREE.CircleGeometry(liquidRadius, 72);
  meniscusGeo.rotateX(-Math.PI / 2);
  const meniscusMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xffffff),
    emissive: new THREE.Color(0xbae6fd),
    emissiveIntensity: 0.25,
    roughness: 0.04,
    transparent: true,
    opacity: 0.65,
    envMap,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const liquidMeniscus = new THREE.Mesh(meniscusGeo, meniscusMat);
  liquidMeniscus.name = 'bottle_liquid_meniscus';
  liquidMeniscus.position.y = volumeToWorldY(300);
  liquidMeniscus.renderOrder = 2;
  liquidGroup.add(liquidMeniscus);

  const ringGeo = new THREE.TorusGeometry(liquidRadius - 0.01, 0.022, 16, 96);
  ringGeo.rotateX(Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x0284c7,
    transparent: true,
    opacity: 0.82,
  });
  const levelRingMesh = new THREE.Mesh(ringGeo, ringMat);
  levelRingMesh.name = 'bottle_level_ring';
  levelRingMesh.position.y = volumeToWorldY(300);
  levelRingMesh.renderOrder = 3;
  liquidGroup.add(levelRingMesh);

  // Điểm neo miệng rót (pouring_lip) trên miệng lọ GL45
  const pouringLipNode = new THREE.Object3D();
  pouringLipNode.name = 'pouring_lip';
  pouringLipNode.position.set(1.02, 6.22, 0);
  bottleGroup.add(pouringLipNode);

  // Nắp nhựa xanh GL45
  bottleGroup.add(buildGL45BlueScrewCap());

  // Cốc thử phản ứng 3D đi kèm
  scaledRoot.add(buildCompanionReactionBeaker3D(envMap));

  return scaledRoot;
}

// ============================================================================
// 2. LỌ THỦY TINH NÂU SCHOTT DURAN 400ML — DUNG DỊCH AgNO3 0,1M (300ML)
// ============================================================================

function drawAgNO3LabelAndScaleCanvas(
  canvas: HTMLCanvasElement,
  currentVolMl: number,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  function volToCanvasY(vMl: number): number {
    const worldY = volumeToWorldY(vMl);
    const norm = (worldY - OVERLAY_MIN_Y) / (OVERLAY_MAX_Y - OVERLAY_MIN_Y);
    return H * (1 - norm);
  }

  const frontCenterX = 960;

  // 1. Logo vuông SCHOTT DURAN màu trắng in men sứ
  const logoY = 235;
  const logoSize = 116;
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.lineWidth = 4.5;

  ctx.strokeRect(
    frontCenterX - logoSize / 2,
    logoY - logoSize / 2,
    logoSize,
    logoSize,
  );
  ctx.beginPath();
  ctx.arc(frontCenterX, logoY, logoSize * 0.46, 0, Math.PI * 2);
  ctx.stroke();

  ctx.font = '800 22px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SCHOTT', frontCenterX, logoY);

  ctx.font = '800 26px Inter, sans-serif';
  ctx.fillText('DURAN', frontCenterX, logoY + logoSize / 2 + 28);

  ctx.font = '700 48px Inter, sans-serif';
  ctx.fillText('400 ml', frontCenterX, logoY + logoSize / 2 + 86);
  ctx.restore();

  // 2. Nhãn trắng bo góc AgNO3 0,1M
  const patchW = 390;
  const patchH = 265;
  const patchX = frontCenterX - patchW / 2;
  const patchY = 470;
  const radius = 28;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;

  ctx.beginPath();
  ctx.moveTo(patchX + radius, patchY);
  ctx.lineTo(patchX + patchW - radius, patchY);
  ctx.quadraticCurveTo(patchX + patchW, patchY, patchX + patchW, patchY + radius);
  ctx.lineTo(patchX + patchW, patchY + patchH - radius);
  ctx.quadraticCurveTo(
    patchX + patchW,
    patchY + patchH,
    patchX + patchW - radius,
    patchY + patchH,
  );
  ctx.lineTo(patchX + radius, patchY + patchH);
  ctx.quadraticCurveTo(patchX, patchY + patchH, patchX, patchY + patchH - radius);
  ctx.lineTo(patchX, patchY + radius);
  ctx.quadraticCurveTo(patchX, patchY, patchX + radius, patchY);
  ctx.closePath();

  const labelGrad = ctx.createLinearGradient(
    patchX,
    patchY,
    patchX + patchW,
    patchY + patchH,
  );
  labelGrad.addColorStop(0, '#ffffff');
  labelGrad.addColorStop(0.7, '#f8fafc');
  labelGrad.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = labelGrad;
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#1e293b';
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(patchX + 14, patchY + 14, patchW - 28, 34);
  ctx.fillStyle = '#f8fafc';
  ctx.font = '700 17px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HÓA CHẤT PHÒNG THÍ NGHIỆM', frontCenterX, patchY + 32);

  ctx.fillStyle = '#0f172a';
  ctx.font = '800 56px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('AgNO₃', frontCenterX - 35, patchY + 95);

  ctx.fillStyle = '#b45309';
  ctx.fillRect(frontCenterX + 68, patchY + 60, 102, 42);
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 24px "JetBrains Mono", monospace';
  ctx.fillText('0,1 M', frontCenterX + 119, patchY + 83);

  ctx.fillStyle = '#334155';
  ctx.font = '700 20px Inter, sans-serif';
  ctx.fillText('Dung dịch Bạc Nitrat (Silver Nitrate)', frontCenterX, patchY + 132);

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(patchX + 20, patchY + 148);
  ctx.lineTo(patchX + patchW - 20, patchY + 148);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.font = '600 18px Inter, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(
    `• Thể tích thực: ${Math.round(currentVolMl)} ml / 400 ml`,
    patchX + 24,
    patchY + 176,
  );
  ctx.fillText('• Nồng độ: C = 0,1 mol/L (0,1 M)', patchX + 24, patchY + 203);
  ctx.fillStyle = '#475569';
  ctx.font = '600 16px Inter, sans-serif';
  ctx.fillText('• Tính chất: Không màu, không mùi', patchX + 24, patchY + 229);
  ctx.fillStyle = '#b45309';
  ctx.font = '700 14px Inter, sans-serif';
  ctx.fillText('⚠ Bảo quản lọ tối màu, tránh ánh sáng', patchX + 24, patchY + 251);
  ctx.restore();

  // Made in Germany & Retrace Code
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.82)';
  ctx.textAlign = 'center';
  ctx.font = '600 19px Inter, sans-serif';
  ctx.fillText('Made in Germany', frontCenterX, 775);

  const rcW = 220;
  const rcH = 54;
  const rcX = frontCenterX - rcW / 2;
  const rcY = 800;
  ctx.lineWidth = 3;
  ctx.strokeRect(rcX, rcY, rcW, rcH);
  ctx.font = '600 16px "JetBrains Mono", monospace';
  ctx.fillText('Retrace Code', frontCenterX, rcY + 21);
  ctx.fillText('00798854', frontCenterX, rcY + 42);
  ctx.restore();

  // Vạch chia thể tích màu trắng men sứ & 300ml màu vàng sáng
  const scaleLeftX = 1235;
  ctx.save();

  ctx.save();
  ctx.translate(scaleLeftX - 28, volToCanvasY(225));
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = '700 20px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('APPROX. VOL.', 0, 0);
  ctx.restore();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(scaleLeftX, volToCanvasY(400));
  ctx.lineTo(scaleLeftX, volToCanvasY(50));
  ctx.stroke();

  for (let v = 50; v <= 400; v += 25) {
    const yPos = volToCanvasY(v);
    const isMajor100 = v % 100 === 0;
    const isMajor50 = v % 50 === 0;
    const isTarget300 = v === 300;

    ctx.beginPath();
    if (isMajor50) {
      const tickLen = isMajor100 ? 88 : 62;
      ctx.lineWidth = isTarget300 ? 7 : isMajor100 ? 5.5 : 4.5;
      ctx.strokeStyle = isTarget300 ? '#fde047' : 'rgba(255, 255, 255, 0.96)';
      ctx.moveTo(scaleLeftX, yPos);
      ctx.lineTo(scaleLeftX + tickLen, yPos);
      ctx.stroke();

      ctx.fillStyle = isTarget300 ? '#fde047' : 'rgba(255, 255, 255, 0.96)';
      ctx.font = isTarget300
        ? '800 30px "JetBrains Mono", monospace'
        : isMajor100
          ? '700 27px "JetBrains Mono", monospace'
          : '600 22px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const labelText = isTarget300 ? '300 ml ◀' : v === 400 ? '400 ml' : `${v}`;
      ctx.fillText(labelText, scaleLeftX + tickLen + 14, yPos);
    } else {
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.moveTo(scaleLeftX, yPos);
      ctx.lineTo(scaleLeftX + 35, yPos);
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function buildAgNO3Bottle400Model(): THREE.Group {
  const scaledRoot = new THREE.Group();
  scaledRoot.name = 'agno3_bottle_root';
  scaledRoot.scale.setScalar(BOTTLE_WORLD_SCALE);

  const bottleGroup = new THREE.Group();
  bottleGroup.name = 'body';
  scaledRoot.add(bottleGroup);

  const envMap = getAmberGlassEnvironmentMap();

  const outerPoints = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(1.42, 0.0),
    new THREE.Vector2(1.56, 0.08),
    new THREE.Vector2(1.62, 0.25),
    new THREE.Vector2(1.62, 4.45),
    new THREE.Vector2(1.58, 4.78),
    new THREE.Vector2(1.42, 5.1),
    new THREE.Vector2(1.16, 5.38),
    new THREE.Vector2(1.02, 5.55),
    new THREE.Vector2(1.08, 5.64),
    new THREE.Vector2(1.02, 5.72),
    new THREE.Vector2(1.02, 6.22),
    new THREE.Vector2(0.88, 6.22),
  ];

  const outerGeo = new THREE.LatheGeometry(outerPoints, 96);
  const outerGlassMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x8c3b08),
    emissive: new THREE.Color(0x280d00),
    emissiveIntensity: 0.25,
    roughness: 0.08,
    metalness: 0.0,
    transparent: true,
    opacity: 0.58,
    reflectivity: 1.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMap,
    envMapIntensity: 1.45,
    side: THREE.FrontSide,
    depthWrite: false,
  });

  const innerGlassMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x6e2c04),
    roughness: 0.12,
    transparent: true,
    opacity: 0.28,
    envMap,
    envMapIntensity: 0.7,
    side: THREE.BackSide,
    depthWrite: false,
  });

  const outerBottleMesh = new THREE.Mesh(outerGeo, outerGlassMaterial);
  outerBottleMesh.name = 'outer_glass_mesh';
  outerBottleMesh.renderOrder = 3;
  bottleGroup.add(outerBottleMesh);

  const innerBottleMesh = new THREE.Mesh(outerGeo, innerGlassMaterial);
  innerBottleMesh.scale.set(0.955, 0.99, 0.955);
  innerBottleMesh.position.y = 0.05;
  innerBottleMesh.renderOrder = 1;
  bottleGroup.add(innerBottleMesh);

  const bottomDiskGeo = new THREE.CylinderGeometry(1.52, 1.44, 0.18, 64);
  const bottomDiskMat = new THREE.MeshStandardMaterial({
    color: 0x3b1502,
    roughness: 0.2,
    metalness: 0.1,
    transparent: true,
    opacity: 0.85,
  });
  const bottomDisk = new THREE.Mesh(bottomDiskGeo, bottomDiskMat);
  bottomDisk.position.y = 0.1;
  bottleGroup.add(bottomDisk);

  // Vòng bóng hổ phách dưới đáy lọ
  const shadowGeo = new THREE.RingGeometry(0.1, 1.68, 64);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x3b1704,
    transparent: true,
    opacity: 0.36,
    side: THREE.DoubleSide,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.position.y = 0.008;
  scaledRoot.add(shadowMesh);

  // Nhãn AgNO3 & Vạch chia thể tích
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 2048;
  labelCanvas.height = 1024;
  drawAgNO3LabelAndScaleCanvas(labelCanvas, 300);

  const labelAndScaleTexture = new THREE.CanvasTexture(labelCanvas);
  labelAndScaleTexture.anisotropy = 16;
  labelAndScaleTexture.colorSpace = THREE.SRGBColorSpace;

  const overlayHeight = OVERLAY_MAX_Y - OVERLAY_MIN_Y;
  const overlayGeo = new THREE.CylinderGeometry(
    1.626,
    1.626,
    overlayHeight,
    96,
    1,
    true,
  );
  const overlayMat = new THREE.MeshStandardMaterial({
    map: labelAndScaleTexture,
    transparent: true,
    roughness: 0.25,
    metalness: 0.0,
    depthWrite: false,
  });
  const overlayMesh = new THREE.Mesh(overlayGeo, overlayMat);
  overlayMesh.name = 'scale_marks';
  overlayMesh.position.y = (OVERLAY_MIN_Y + OVERLAY_MAX_Y) / 2;
  overlayMesh.rotation.y = -Math.PI * 0.44;
  overlayMesh.renderOrder = 4;
  overlayMesh.userData = {
    canvas: labelCanvas,
    texture: labelAndScaleTexture,
    lastVolMl: 300,
  };
  bottleGroup.add(overlayMesh);

  // Dung dịch AgNO3 0,1M (không màu, trong suốt, vành meniscus sáng rõ tại 300ml)
  const liquidGroup = new THREE.Group();
  liquidGroup.name = 'liquid_surface';
  bottleGroup.add(liquidGroup);

  const liquidRadius = 1.53;
  const bodyGeo = new THREE.CylinderGeometry(liquidRadius, liquidRadius, 1, 72);
  bodyGeo.translate(0, 0.5, 0);

  const liquidMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xf8fafc),
    emissive: new THREE.Color(0xdbeafe),
    emissiveIntensity: 0.14,
    roughness: 0.05,
    metalness: 0.0,
    transparent: true,
    opacity: 0.42,
    envMap,
    envMapIntensity: 1.2,
    depthWrite: false,
  });

  const liquidCylinder = new THREE.Mesh(bodyGeo, liquidMat);
  liquidCylinder.name = 'bottle_liquid_cylinder';
  liquidCylinder.position.y = LIQUID_BASE_Y;
  liquidCylinder.scale.set(1, 3.0, 1);
  liquidCylinder.renderOrder = 2;
  liquidGroup.add(liquidCylinder);

  const meniscusGeo = new THREE.CircleGeometry(liquidRadius, 72);
  meniscusGeo.rotateX(-Math.PI / 2);
  const meniscusMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xffffff),
    emissive: new THREE.Color(0xe0f2fe),
    emissiveIntensity: 0.32,
    roughness: 0.06,
    transparent: true,
    opacity: 0.72,
    envMap,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const liquidMeniscus = new THREE.Mesh(meniscusGeo, meniscusMat);
  liquidMeniscus.name = 'bottle_liquid_meniscus';
  liquidMeniscus.position.y = volumeToWorldY(300);
  liquidMeniscus.renderOrder = 2;
  liquidGroup.add(liquidMeniscus);

  const ringGeo = new THREE.TorusGeometry(liquidRadius - 0.01, 0.022, 16, 96);
  ringGeo.rotateX(Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.88,
  });
  const levelRingMesh = new THREE.Mesh(ringGeo, ringMat);
  levelRingMesh.name = 'bottle_level_ring';
  levelRingMesh.position.y = volumeToWorldY(300);
  levelRingMesh.renderOrder = 3;
  liquidGroup.add(levelRingMesh);

  // Điểm neo miệng rót (pouring_lip) trên miệng lọ GL45
  const pouringLipNode = new THREE.Object3D();
  pouringLipNode.name = 'pouring_lip';
  pouringLipNode.position.set(1.02, 6.22, 0);
  bottleGroup.add(pouringLipNode);

  // Nắp nhựa xanh GL45
  bottleGroup.add(buildGL45BlueScrewCap());

  // Cốc thử phản ứng 3D đi kèm
  scaledRoot.add(buildCompanionReactionBeaker3D(envMap));

  return scaledRoot;
}

// ============================================================================
// 3. MẪU VÒNG DÂY ĐỒNG (Cu — 3,00 GAM, 0,0469 MOL) & TÍNH CHẤT HÓA HỌC
// ============================================================================

function drawCopperScaleLCD(
  canvas: HTMLCanvasElement,
  weightText: string,
  subText: string,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = '#064e3b';
  ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 6;
  ctx.strokeRect(4, 4, 504, 120);

  ctx.fillStyle = '#6ee7b7';
  ctx.font = '700 22px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('LAB BALANCE', 22, 38);
  ctx.fillText(subText, 22, 102);

  ctx.fillStyle = '#ecfdf5';
  ctx.font = '800 56px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(weightText, 490, 88);
}

export function buildCopperWireRing3gModel(): THREE.Group {
  const scaledRoot = new THREE.Group();
  scaledRoot.name = 'copper_wire_ring_root';
  scaledRoot.scale.setScalar(CU_RING_WORLD_SCALE);

  const copperRingGroup = new THREE.Group();
  copperRingGroup.name = 'body';
  copperRingGroup.position.set(0, 0.21, 0);
  scaledRoot.add(copperRingGroup);

  const envMap = getCopperStudioEnvMap();
  const bumpTex = getCopperMicroBumpTexture();

  const copperMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xd98a6c),
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0.0,
    metalness: 0.92,
    roughness: 0.24,
    clearcoat: 0.25,
    clearcoatRoughness: 0.2,
    bumpMap: bumpTex,
    bumpScale: 0.012,
    envMap,
    envMapIntensity: 1.55,
  });

  const wireRadius = 0.21;
  const ringRadius = 2.25;
  const curvePoints: THREE.Vector3[] = [];
  const totalSamples = 80;
  const knotAngle = Math.PI * 1.18;

  curvePoints.push(
    new THREE.Vector3(
      Math.cos(knotAngle - 0.14) * (ringRadius - 0.18),
      0.38,
      Math.sin(knotAngle - 0.14) * (ringRadius - 0.18),
    ),
  );
  curvePoints.push(
    new THREE.Vector3(
      Math.cos(knotAngle - 0.03) * (ringRadius - 0.12),
      0.22,
      Math.sin(knotAngle - 0.03) * (ringRadius - 0.12),
    ),
  );
  curvePoints.push(
    new THREE.Vector3(
      Math.cos(knotAngle + 0.08) * (ringRadius - 0.22),
      0.06,
      Math.sin(knotAngle + 0.08) * (ringRadius - 0.22),
    ),
  );
  curvePoints.push(
    new THREE.Vector3(
      Math.cos(knotAngle + 0.22) * (ringRadius - 0.18),
      0.02,
      Math.sin(knotAngle + 0.22) * (ringRadius - 0.18),
    ),
  );

  for (let i = 6; i <= totalSamples - 6; i++) {
    const t = i / totalSamples;
    const ang = knotAngle + t * Math.PI * 2;
    const radialVar = Math.sin(t * Math.PI * 3) * 0.05;
    const heightVar = Math.sin(t * Math.PI) * 0.03;
    curvePoints.push(
      new THREE.Vector3(
        Math.cos(ang) * (ringRadius + radialVar),
        heightVar,
        Math.sin(ang) * (ringRadius + radialVar),
      ),
    );
  }

  curvePoints.push(
    new THREE.Vector3(
      Math.cos(knotAngle - 0.22) * (ringRadius + 0.02),
      0.14,
      Math.sin(knotAngle - 0.22) * (ringRadius + 0.02),
    ),
  );
  curvePoints.push(
    new THREE.Vector3(
      Math.cos(knotAngle - 0.06) * (ringRadius - 0.04),
      0.36,
      Math.sin(knotAngle - 0.06) * (ringRadius - 0.04),
    ),
  );
  curvePoints.push(
    new THREE.Vector3(
      Math.cos(knotAngle + 0.06) * (ringRadius - 0.1),
      0.52,
      Math.sin(knotAngle + 0.06) * (ringRadius - 0.1),
    ),
  );
  curvePoints.push(
    new THREE.Vector3(
      Math.cos(knotAngle + 0.13) * (ringRadius - 0.24),
      0.34,
      Math.sin(knotAngle + 0.13) * (ringRadius - 0.24),
    ),
  );

  const wireCurve = new THREE.CatmullRomCurve3(
    curvePoints,
    false,
    'centripetal',
    0.5,
  );
  const tubeGeo = new THREE.TubeGeometry(wireCurve, 260, wireRadius, 36, false);
  const mainLoopMesh = new THREE.Mesh(tubeGeo, copperMaterial);
  mainLoopMesh.name = 'copper_main_loop';
  mainLoopMesh.castShadow = true;
  mainLoopMesh.receiveShadow = true;
  copperRingGroup.add(mainLoopMesh);

  const capGeo = new THREE.SphereGeometry(wireRadius * 0.98, 24, 16);
  const hookEndAMesh = new THREE.Mesh(capGeo, copperMaterial);
  hookEndAMesh.position.copy(curvePoints[0]);
  hookEndAMesh.scale.set(1, 0.75, 1);
  copperRingGroup.add(hookEndAMesh);

  const hookEndBMesh = new THREE.Mesh(capGeo, copperMaterial);
  hookEndBMesh.position.copy(curvePoints[curvePoints.length - 1]);
  hookEndBMesh.scale.set(1, 0.75, 1);
  copperRingGroup.add(hookEndBMesh);

  // Lớp tinh thể Bạc (Ag↓) kết tủa bám trên vòng đồng
  const silverCoatGroup = new THREE.Group();
  silverCoatGroup.name = 'silver_coat_group';
  silverCoatGroup.visible = false;
  copperRingGroup.add(silverCoatGroup);

  const silverMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    metalness: 0.92,
    roughness: 0.18,
    envMap,
    envMapIntensity: 1.7,
  });

  const crystalGeo = new THREE.OctahedronGeometry(0.11, 1);
  for (let i = 0; i < 220; i++) {
    const u = 0.03 + (i / 220) * 0.94;
    const pt = wireCurve.getPointAt(u);
    const angleAround = i * 2.39996;
    const offsetR = wireRadius * 0.88;

    const crystal = new THREE.Mesh(crystalGeo, silverMat);
    crystal.position.set(
      pt.x + Math.cos(angleAround) * offsetR,
      pt.y + Math.sin(angleAround) * offsetR * 0.85,
      pt.z + Math.sin(angleAround * 1.7) * offsetR,
    );
    crystal.rotation.set(
      (i * 1.3) % 3,
      (i * 2.1) % 3,
      (i * 0.7) % 3,
    );
    const baseScale = 0.55 + ((i * 29) % 100) / 100 * 0.95;
    crystal.userData = { baseScale };
    silverCoatGroup.add(crystal);
  }

  // Cốc thủy tinh bao quanh vòng đồng khi thử phản ứng với dung dịch Axit / Muối
  const vesselGroup = new THREE.Group();
  vesselGroup.name = 'copper_vessel_group';
  vesselGroup.visible = false;
  scaledRoot.add(vesselGroup);

  const beakerRadius = 3.25;
  const beakerHeight = 3.4;

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.24,
    roughness: 0.06,
    reflectivity: 0.9,
    clearcoat: 1.0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const beakerWallGeo = new THREE.CylinderGeometry(
    beakerRadius,
    beakerRadius,
    beakerHeight,
    64,
    1,
    true,
  );
  const beakerWall = new THREE.Mesh(beakerWallGeo, glassMat);
  beakerWall.position.y = beakerHeight / 2;
  vesselGroup.add(beakerWall);

  const rimGeo = new THREE.TorusGeometry(beakerRadius, 0.05, 16, 64);
  rimGeo.rotateX(Math.PI / 2);
  const rimMesh = new THREE.Mesh(rimGeo, glassMat);
  rimMesh.position.y = beakerHeight;
  vesselGroup.add(rimMesh);

  const liqHeight = 2.35;
  const liqGeo = new THREE.CylinderGeometry(
    beakerRadius - 0.06,
    beakerRadius - 0.06,
    liqHeight,
    64,
  );
  const liqMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0.45,
    roughness: 0.08,
    depthWrite: false,
  });
  const liquidMesh = new THREE.Mesh(liqGeo, liqMat);
  liquidMesh.name = 'vessel_liquid_mesh';
  liquidMesh.position.y = liqHeight / 2 + 0.03;
  vesselGroup.add(liquidMesh);

  const liqTopGeo = new THREE.CircleGeometry(beakerRadius - 0.06, 64);
  liqTopGeo.rotateX(-Math.PI / 2);
  const liqTopMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0.58,
    roughness: 0.05,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const liquidTopMesh = new THREE.Mesh(liqTopGeo, liqTopMat);
  liquidTopMesh.name = 'vessel_liquid_top_mesh';
  liquidTopMesh.position.y = liqHeight + 0.03;
  vesselGroup.add(liquidTopMesh);

  // Hệ hạt bọt khí (NO2 nâu đỏ, NO hóa nâu, Cl2 vàng lục, O2)
  const particleSystem = new THREE.Group();
  particleSystem.name = 'copper_particle_system';
  particleSystem.visible = false;
  scaledRoot.add(particleSystem);

  const pGeo = new THREE.SphereGeometry(0.075, 10, 10);
  for (let i = 0; i < 120; i++) {
    const pMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.75,
    });
    const m = new THREE.Mesh(pGeo, pMat);
    const angle = (i / 120) * Math.PI * 2;
    const r = 1.95 + (((i * 19) % 100) / 100 - 0.5) * 0.55;
    const y = 0.2 + (((i * 37) % 100) / 100) * 3.5;
    m.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
    m.userData = {
      angle,
      radius: r,
      speed: 0.015 + (i % 8) * 0.003,
      wobble: i * 0.4,
    };
    particleSystem.add(m);
  }

  // Cân điện tử tích hợp dưới vòng dây đồng (bật/tắt từ bảng điều khiển)
  const scaleGroup = new THREE.Group();
  scaleGroup.name = 'integrated_scale_group';
  scaleGroup.position.set(0, 0, 0);
  scaleGroup.visible = false;
  scaledRoot.add(scaleGroup);

  const bodyGeo = new THREE.BoxGeometry(6.8, 0.75, 7.4);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.35,
    metalness: 0.2,
  });
  const scaleBody = new THREE.Mesh(bodyGeo, bodyMat);
  scaleBody.position.y = -0.45;
  scaleGroup.add(scaleBody);

  const panGeo = new THREE.CylinderGeometry(2.95, 2.85, 0.14, 64);
  const panMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.2,
    metalness: 0.85,
  });
  const scalePan = new THREE.Mesh(panGeo, panMat);
  scalePan.position.y = -0.05;
  scaleGroup.add(scalePan);

  const scaleDisplayCanvas = document.createElement('canvas');
  scaleDisplayCanvas.width = 512;
  scaleDisplayCanvas.height = 128;
  drawCopperScaleLCD(scaleDisplayCanvas, '3.00 g', 'Cu (0.0469 mol)');
  const scaleDisplayTexture = new THREE.CanvasTexture(scaleDisplayCanvas);
  scaleDisplayTexture.colorSpace = THREE.SRGBColorSpace;

  const lcdGeo = new THREE.PlaneGeometry(3.2, 0.68);
  const lcdMat = new THREE.MeshBasicMaterial({ map: scaleDisplayTexture });
  const lcdMesh = new THREE.Mesh(lcdGeo, lcdMat);
  lcdMesh.name = 'scale_display';
  lcdMesh.position.set(0, -0.32, 3.71);
  lcdMesh.userData = {
    canvas: scaleDisplayCanvas,
    texture: scaleDisplayTexture,
    lastKey: '3.00 g|Cu (0.0469 mol)',
  };
  scaleGroup.add(lcdMesh);

  return scaledRoot;
}

// ============================================================================
// 4. ĐỒNG BỘ TRẠNG THÁI & HOẠT HỌA 60FPS CHO 3 THIẾT BỊ HÓA HỌC MỚI
// ============================================================================

export function computeCopperReactionInfo(mode: string, progress: number): {
  currentMassG: number;
  badgeText: string;
  equationText: string;
  detailText: string;
} {
  const p = THREE.MathUtils.clamp(progress, 0, 1);
  switch (mode) {
    case 'o2': {
      const m = 3.0 + 0.75 * p;
      return {
        currentMassG: m,
        badgeText: 'Oxi hóa nhiệt: Phủ CuO đen',
        equationText: '2Cu + O₂ —(t°)→ 2CuO (đen)',
        detailText: `Đun nóng với O₂: Bề mặt đồng chuyển thành Đồng(II) oxit (CuO) màu đen. Khối lượng chất rắn tăng từ 3,00g lên ${m.toFixed(2).replace('.', ',')} g.`,
      };
    }
    case 'cl2': {
      const m = 3.0 + 1.5 * p;
      return {
        currentMassG: m,
        badgeText: 'Tác dụng với Cl₂ / S (t°)',
        equationText: 'Cu + Cl₂ —(t°)→ CuCl₂ • Cu + S —(t°)→ CuS',
        detailText: `Đun nóng trong khí Clo tạo khói nâu vàng CuCl₂ hoặc với Lưu huỳnh tạo lớp CuS đen (m = ${m.toFixed(2).replace('.', ',')} g).`,
      };
    }
    case 'hcl_o2': {
      const m = 3.0 - 0.85 * p;
      return {
        currentMassG: m,
        badgeText: 'HCl / H₂SO₄ loãng + O₂',
        equationText: '2Cu + 4H⁺ + O₂ → 2Cu²⁺ (xanh) + 2H₂O',
        detailText: `Đồng không phản ứng với HCl/H₂SO₄ loãng khi thiếu O₂, nhưng tan dần khi có mặt O₂ tạo dung dịch muối Cu²⁺ màu xanh lam.`,
      };
    }
    case 'hno3_conc': {
      const m = 3.0 * (1 - p * 0.8);
      return {
        currentMassG: m,
        badgeText: 'HNO₃ đặc: Khí NO₂ nâu đỏ',
        equationText: 'Cu + 4HNO₃(đặc) → Cu(NO₃)₂ + 2NO₂↑ + 2H₂O',
        detailText: `Vòng đồng tan mạnh trong HNO₃ đặc, sủi khí NO₂ màu nâu đỏ và tạo dung dịch Cu(NO₃)₂ xanh lam (m còn lại = ${m.toFixed(2).replace('.', ',')} g).`,
      };
    }
    case 'hno3_dil': {
      const m = 3.0 * (1 - p * 0.65);
      return {
        currentMassG: m,
        badgeText: 'HNO₃ loãng: Khí NO hóa nâu',
        equationText: '3Cu + 8HNO₃(loãng) → 3Cu(NO₃)₂ + 2NO↑ + 4H₂O',
        detailText: `Bọt khí NO không màu thoát lên mặt thoáng gặp O₂ không khí hóa nâu đỏ NO₂.`,
      };
    }
    case 'agno3': {
      const m = 3.0 + (3.24 - 0.96) * p; // 3.00g -> 5.28g
      return {
        currentMassG: m,
        badgeText: 'Phủ tinh thể Bạc (Ag↓)',
        equationText: 'Cu + 2AgNO₃ → Cu(NO₃)₂ (xanh) + 2Ag↓ (trắng bạc)',
        detailText: `Nhúng vào 300ml dd AgNO₃ 0,1M (0,03 mol): 0,96g Cu tan ra và 3,24g tinh thể Bạc (Ag↓) bám lấp lánh quanh vòng đồng → m rắn = ${m.toFixed(2).replace('.', ',')} g.`,
      };
    }
    default:
      return {
        currentMassG: 3.0,
        badgeText: 'Đồng nguyên chất (Cu · M=64)',
        equationText: 'Cu (M = 64 g/mol, rắn, đỏ hồng ánh kim) — Bền ở t° thường',
        detailText:
          'Vòng dây đồng nguyên chất (M = 64) nặng 3,00g (n = 0,0469 mol) được uốn tròn và xoắn gài hai đầu.',
      };
  }
}

export function applyChemicalEquipmentStateToObject3D(
  instanceRoot: THREE.Object3D,
  instance: SceneInstance,
  archetype: string,
): void {
  if (
    archetype === 'reagent-bottle-naoh-400' ||
    archetype === 'reagent-bottle-agno3-400'
  ) {
    const isNaOH = archetype === 'reagent-bottle-naoh-400';
    const volMl = THREE.MathUtils.clamp(
      instance.instanceState.liquidLevelMl ?? 300,
      0,
      400,
    );
    const liquidGroup = instanceRoot.getObjectByName('liquid_surface');
    const liquidCylinder = instanceRoot.getObjectByName('bottle_liquid_cylinder');
    const liquidMeniscus = instanceRoot.getObjectByName('bottle_liquid_meniscus');
    const levelRingMesh = instanceRoot.getObjectByName('bottle_level_ring');

    if (liquidGroup && liquidCylinder && liquidMeniscus && levelRingMesh) {
      if (volMl <= 0.1) {
        liquidGroup.visible = false;
      } else {
        liquidGroup.visible = true;
        const liquidHeight = (volMl / 100) * HEIGHT_PER_100ML;
        const surfaceY = volumeToWorldY(volMl);
        liquidCylinder.scale.set(1, Math.max(0.01, liquidHeight), 1);
        liquidMeniscus.position.y = surfaceY;
        levelRingMesh.position.y = surfaceY;
      }
    }

    // Cập nhật nhãn CanvasTexture khi thể tích thay đổi
    const scaleMarks = instanceRoot.getObjectByName('scale_marks') as
      | THREE.Mesh
      | undefined;
    if (scaleMarks && scaleMarks.userData?.canvas && scaleMarks.userData?.texture) {
      const roundedVol = Math.round(volMl);
      if (scaleMarks.userData.lastVolMl !== roundedVol) {
        scaleMarks.userData.lastVolMl = roundedVol;
        if (isNaOH) {
          drawNaOHLabelAndScaleCanvas(scaleMarks.userData.canvas, roundedVol);
        } else {
          drawAgNO3LabelAndScaleCanvas(scaleMarks.userData.canvas, roundedVol);
        }
        scaleMarks.userData.texture.needsUpdate = true;
      }
    }

    // Độ trong suốt thành lọ nâu AgNO3 (X-Ray / Opacity)
    if (!isNaOH) {
      const outerGlass = instanceRoot.getObjectByName('outer_glass_mesh') as
        | THREE.Mesh
        | undefined;
      if (
        outerGlass &&
        outerGlass.material instanceof THREE.MeshPhysicalMaterial
      ) {
        const targetOpacity = THREE.MathUtils.clamp(
          instance.instanceState.glassOpacity ?? 0.58,
          0.15,
          0.9,
        );
        outerGlass.material.opacity = targetOpacity;
      }
    }

    // Cập nhật cốc thử phản ứng 3D đi kèm
    const rxnMode = instance.instanceState.chemicalReactionMode || 'none';
    const beakerGroup = instanceRoot.getObjectByName('reaction_beaker_group');
    if (beakerGroup) {
      beakerGroup.visible = rxnMode !== 'none';
      const beakerLiq = beakerGroup.getObjectByName('beaker_liquid_mesh') as
        | THREE.Mesh
        | undefined;
      const beakerTop = beakerGroup.getObjectByName('beaker_top_mesh') as
        | THREE.Mesh
        | undefined;
      const litmus = beakerGroup.getObjectByName('litmus_strip_mesh');
      const metalPiece = beakerGroup.getObjectByName('metal_piece_mesh') as
        | THREE.Mesh
        | undefined;
      const precipGrp = beakerGroup.getObjectByName('precip_group');
      const bubbleGrp = beakerGroup.getObjectByName('bubble_group');

      if (litmus) litmus.visible = false;
      if (metalPiece) metalPiece.visible = false;
      if (precipGrp) precipGrp.visible = false;
      if (bubbleGrp) bubbleGrp.visible = false;

      if (
        beakerLiq &&
        beakerTop &&
        beakerLiq.material instanceof THREE.MeshPhysicalMaterial &&
        beakerTop.material instanceof THREE.MeshPhysicalMaterial
      ) {
        if (isNaOH) {
          if (rxnMode === 'phenol') {
            beakerLiq.material.color.setHex(0xec4899);
            beakerTop.material.color.setHex(0xf472b6);
            beakerLiq.material.opacity = 0.68;
          } else if (rxnMode === 'litmus') {
            beakerLiq.material.color.setHex(0xdbeafe);
            beakerTop.material.color.setHex(0xbfdbfe);
            beakerLiq.material.opacity = 0.45;
            if (litmus) litmus.visible = true;
          } else if (rxnMode === 'acid') {
            beakerLiq.material.color.setHex(0xf8fafc);
            beakerTop.material.color.setHex(0xffffff);
            beakerLiq.material.opacity = 0.38;
          } else if (rxnMode === 'acid_oxide') {
            beakerLiq.material.color.setHex(0xe0f2fe);
            beakerTop.material.color.setHex(0xbae6fd);
            beakerLiq.material.opacity = 0.46;
            if (bubbleGrp) {
              bubbleGrp.visible = true;
              bubbleGrp.children.forEach((c) => {
                if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshBasicMaterial) {
                  c.material.color.setHex(0xffffff);
                }
              });
            }
          } else if (rxnMode === 'salt_cu') {
            beakerLiq.material.color.setHex(0x38bdf8);
            beakerTop.material.color.setHex(0x0284c7);
            beakerLiq.material.opacity = 0.55;
            if (precipGrp) {
              precipGrp.visible = true;
              precipGrp.children.forEach((c) => {
                if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshStandardMaterial) {
                  c.material.color.setHex(0x0284c7);
                  c.scale.setScalar(1);
                }
              });
            }
          } else if (rxnMode === 'nonmetal_cl2') {
            beakerLiq.material.color.setHex(0xd9f99d);
            beakerTop.material.color.setHex(0xbef264);
            beakerLiq.material.opacity = 0.58;
            if (bubbleGrp) {
              bubbleGrp.visible = true;
              bubbleGrp.children.forEach((c) => {
                if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshBasicMaterial) {
                  c.material.color.setHex(0xa3e635);
                }
              });
            }
          } else if (rxnMode === 'ampho_al') {
            beakerLiq.material.color.setHex(0xf1f5f9);
            beakerTop.material.color.setHex(0xe2e8f0);
            beakerLiq.material.opacity = 0.45;
            if (metalPiece) {
              metalPiece.visible = true;
              if (metalPiece.material instanceof THREE.MeshStandardMaterial) {
                metalPiece.material.color.setHex(0xe2e8f0);
              }
            }
            if (bubbleGrp) {
              bubbleGrp.visible = true;
              bubbleGrp.children.forEach((c) => {
                if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshBasicMaterial) {
                  c.material.color.setHex(0xffffff);
                }
              });
            }
          } else if (rxnMode === 'ampho_aloh3') {
            beakerLiq.material.color.setHex(0xf8fafc);
            beakerTop.material.color.setHex(0xffffff);
            beakerLiq.material.opacity = 0.4;
            if (precipGrp) {
              precipGrp.visible = true;
              precipGrp.children.forEach((c) => {
                if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshStandardMaterial) {
                  c.material.color.setHex(0xffffff);
                  c.scale.setScalar(0.45);
                }
              });
            }
          }
        } else {
          // 6 phản ứng đặc trưng của AgNO3
          if (rxnMode === 'nacl') {
            beakerLiq.material.color.setHex(0xf8fafc);
            beakerTop.material.color.setHex(0xe2e8f0);
            beakerLiq.material.opacity = 0.52;
            if (precipGrp) {
              precipGrp.visible = true;
              precipGrp.children.forEach((c) => {
                if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshStandardMaterial) {
                  c.material.color.setHex(0xffffff);
                  c.scale.setScalar(1.0);
                }
              });
            }
          } else if (rxnMode === 'nabr') {
            beakerLiq.material.color.setHex(0xfef9c3);
            beakerTop.material.color.setHex(0xfde047);
            beakerLiq.material.opacity = 0.54;
            if (precipGrp) {
              precipGrp.visible = true;
              precipGrp.children.forEach((c) => {
                if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshStandardMaterial) {
                  c.material.color.setHex(0xfef08a);
                  c.scale.setScalar(1.0);
                }
              });
            }
          } else if (rxnMode === 'nai') {
            beakerLiq.material.color.setHex(0xfde047);
            beakerTop.material.color.setHex(0xeab308);
            beakerLiq.material.opacity = 0.58;
            if (precipGrp) {
              precipGrp.visible = true;
              precipGrp.children.forEach((c) => {
                if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshStandardMaterial) {
                  c.material.color.setHex(0xfacc15);
                  c.scale.setScalar(1.05);
                }
              });
            }
          } else if (rxnMode === 'cu') {
            beakerLiq.material.color.setHex(0x38bdf8);
            beakerTop.material.color.setHex(0x0284c7);
            beakerLiq.material.opacity = 0.55;
            if (metalPiece) {
              metalPiece.visible = true;
              if (metalPiece.material instanceof THREE.MeshStandardMaterial) {
                metalPiece.material.color.setHex(0xd98a6c);
              }
            }
            if (precipGrp) {
              precipGrp.visible = true;
              precipGrp.children.forEach((c) => {
                if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshStandardMaterial) {
                  c.material.color.setHex(0xe2e8f0);
                  c.scale.setScalar(0.85);
                }
              });
            }
          } else if (rxnMode === 'naoh') {
            beakerLiq.material.color.setHex(0x78716c);
            beakerTop.material.color.setHex(0x44403c);
            beakerLiq.material.opacity = 0.56;
            if (precipGrp) {
              precipGrp.visible = true;
              precipGrp.children.forEach((c) => {
                if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshStandardMaterial) {
                  c.material.color.setHex(0x292524);
                  c.scale.setScalar(1.0);
                }
              });
            }
          } else if (rxnMode === 'light') {
            beakerLiq.material.color.setHex(0x475569);
            beakerTop.material.color.setHex(0x1e293b);
            beakerLiq.material.opacity = 0.62;
            if (precipGrp) {
              precipGrp.visible = true;
              precipGrp.children.forEach((c) => {
                if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshStandardMaterial) {
                  c.material.color.setHex(0x0f172a);
                  c.scale.setScalar(0.8);
                }
              });
            }
            if (bubbleGrp) {
              bubbleGrp.visible = true;
              bubbleGrp.children.forEach((c) => {
                if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshBasicMaterial) {
                  c.material.color.setHex(0x9a3412);
                }
              });
            }
          }
        }
      }
    }
  } else if (archetype === 'copper-wire-ring-3g') {
    const mode = instance.instanceState.chemicalReactionMode || 'pure';
    const progress = THREE.MathUtils.clamp(
      instance.instanceState.reactionProgress ?? 1.0,
      0,
      1,
    );

    const mainLoopMesh = instanceRoot.getObjectByName('copper_main_loop') as
      | THREE.Mesh
      | undefined;
    const silverCoatGroup = instanceRoot.getObjectByName('silver_coat_group');
    const vesselGroup = instanceRoot.getObjectByName('copper_vessel_group');
    const particleSystem = instanceRoot.getObjectByName('copper_particle_system');
    const scaleGroup = instanceRoot.getObjectByName('integrated_scale_group');
    const copperRingGroup = instanceRoot.getObjectByName('body');

    const showScale = Boolean(instance.instanceState.showIntegratedBalance);
    if (scaleGroup) {
      scaleGroup.visible = showScale;
    }
    if (copperRingGroup) {
      copperRingGroup.position.y = showScale ? 0.23 : 0.21;
    }

    if (silverCoatGroup) silverCoatGroup.visible = false;
    if (vesselGroup) vesselGroup.visible = false;
    if (particleSystem) particleSystem.visible = false;

    const pureColor = new THREE.Color(0xd98a6c);
    if (
      mainLoopMesh &&
      mainLoopMesh.material instanceof THREE.MeshPhysicalMaterial
    ) {
      const copperMaterial = mainLoopMesh.material;
      mainLoopMesh.scale.set(1, 1, 1);
      copperMaterial.emissive.setHex(0x000000);
      copperMaterial.emissiveIntensity = 0;

      const liquidMesh = vesselGroup?.getObjectByName('vessel_liquid_mesh') as
        | THREE.Mesh
        | undefined;
      const liquidTopMesh = vesselGroup?.getObjectByName(
        'vessel_liquid_top_mesh',
      ) as THREE.Mesh | undefined;

      if (mode === 'pure') {
        copperMaterial.color.copy(pureColor);
        copperMaterial.metalness = 0.92;
        copperMaterial.roughness = 0.24;
      } else if (mode === 'o2') {
        const cuoColor = new THREE.Color(0x1e1e22);
        copperMaterial.color.lerpColors(pureColor, cuoColor, progress);
        copperMaterial.metalness = 0.92 - progress * 0.72;
        copperMaterial.roughness = 0.24 + progress * 0.62;
        const heatGlow = Math.sin(progress * Math.PI);
        copperMaterial.emissive.setHex(0xff3b00);
        copperMaterial.emissiveIntensity = heatGlow * 0.65;
      } else if (mode === 'cl2') {
        const halideColor = new THREE.Color(0x3f4d28);
        copperMaterial.color.lerpColors(pureColor, halideColor, progress);
        copperMaterial.metalness = 0.92 - progress * 0.65;
        copperMaterial.roughness = 0.24 + progress * 0.55;
        if (particleSystem) particleSystem.visible = true;
      } else if (mode === 'hcl_o2') {
        copperMaterial.color.copy(pureColor);
        if (vesselGroup) vesselGroup.visible = true;
        if (particleSystem) particleSystem.visible = true;
        if (
          liquidMesh &&
          liquidTopMesh &&
          liquidMesh.material instanceof THREE.MeshPhysicalMaterial &&
          liquidTopMesh.material instanceof THREE.MeshPhysicalMaterial
        ) {
          const clearAcid = new THREE.Color(0xe0f2fe);
          const blueCu2 = new THREE.Color(0x0284c7);
          liquidMesh.material.color.lerpColors(clearAcid, blueCu2, progress * 0.75);
          liquidTopMesh.material.color.lerpColors(
            clearAcid,
            blueCu2,
            progress * 0.75,
          );
          liquidMesh.material.opacity = 0.35 + progress * 0.22;
        }
      } else if (mode === 'hno3_conc') {
        copperMaterial.color.copy(pureColor);
        if (vesselGroup) vesselGroup.visible = true;
        if (particleSystem) particleSystem.visible = true;
        if (
          liquidMesh &&
          liquidTopMesh &&
          liquidMesh.material instanceof THREE.MeshPhysicalMaterial &&
          liquidTopMesh.material instanceof THREE.MeshPhysicalMaterial
        ) {
          const clearAcid = new THREE.Color(0xfef3c7);
          const deepBlueGreen = new THREE.Color(0x0369a1);
          liquidMesh.material.color.lerpColors(clearAcid, deepBlueGreen, progress);
          liquidTopMesh.material.color.lerpColors(
            clearAcid,
            deepBlueGreen,
            progress,
          );
          liquidMesh.material.opacity = 0.42 + progress * 0.28;
        }
        const shrink = 1 - progress * 0.45;
        mainLoopMesh.scale.set(1, shrink, 1);
      } else if (mode === 'hno3_dil') {
        copperMaterial.color.copy(pureColor);
        if (vesselGroup) vesselGroup.visible = true;
        if (particleSystem) particleSystem.visible = true;
        if (
          liquidMesh &&
          liquidTopMesh &&
          liquidMesh.material instanceof THREE.MeshPhysicalMaterial &&
          liquidTopMesh.material instanceof THREE.MeshPhysicalMaterial
        ) {
          const clearAcid = new THREE.Color(0xf0f9ff);
          const blueCu = new THREE.Color(0x0ea5e9);
          liquidMesh.material.color.lerpColors(clearAcid, blueCu, progress);
          liquidTopMesh.material.color.lerpColors(clearAcid, blueCu, progress);
          liquidMesh.material.opacity = 0.38 + progress * 0.24;
        }
      } else if (mode === 'agno3') {
        copperMaterial.color.copy(pureColor);
        if (vesselGroup) vesselGroup.visible = true;
        if (silverCoatGroup) {
          silverCoatGroup.visible = progress > 0.02;
          silverCoatGroup.children.forEach((c) => {
            const s = (c.userData?.baseScale ?? 0.75) * progress;
            c.scale.set(s, s, s);
          });
        }
        if (
          liquidMesh &&
          liquidTopMesh &&
          liquidMesh.material instanceof THREE.MeshPhysicalMaterial &&
          liquidTopMesh.material instanceof THREE.MeshPhysicalMaterial
        ) {
          const colorlessAgNO3 = new THREE.Color(0xf8fafc);
          const blueCuNO3 = new THREE.Color(0x0284c7);
          liquidMesh.material.color.lerpColors(
            colorlessAgNO3,
            blueCuNO3,
            progress,
          );
          liquidTopMesh.material.color.lerpColors(
            colorlessAgNO3,
            blueCuNO3,
            progress,
          );
          liquidMesh.material.opacity = 0.32 + progress * 0.26;
        }
      }
    }

    // Cập nhật màn hình LCD trên cân điện tử đi kèm
    const info = computeCopperReactionInfo(mode, progress);
    const lcdMesh = instanceRoot.getObjectByName('scale_display') as
      | THREE.Mesh
      | undefined;
    if (lcdMesh && lcdMesh.userData?.canvas && lcdMesh.userData?.texture) {
      const weightText = `${info.currentMassG.toFixed(2)} g`;
      const subText =
        mode === 'pure' ? 'Cu (0.0469 mol)' : info.badgeText.slice(0, 16);
      const key = `${weightText}|${subText}`;
      if (lcdMesh.userData.lastKey !== key) {
        lcdMesh.userData.lastKey = key;
        drawCopperScaleLCD(lcdMesh.userData.canvas, weightText, subText);
        lcdMesh.userData.texture.needsUpdate = true;
      }
    }
  }
}

export function stepChemicalEquipmentAnimation(
  instanceRoot: THREE.Object3D,
  instance: SceneInstance,
  archetype: string,
  dt: number,
  timeSec: number,
): boolean {
  let active = false;

  if (
    archetype === 'reagent-bottle-naoh-400' ||
    archetype === 'reagent-bottle-agno3-400'
  ) {
    // 1. Đóng / mở nắp xanh GL45 mượt mà
    const capGroup = instanceRoot.getObjectByName('handle');
    const targetCap = instance.instanceState.capOpen ? 1 : 0;
    const curCap = Number(instanceRoot.userData.capAnimProgress ?? 0);
    const nextCap = THREE.MathUtils.damp(curCap, targetCap, 10, dt);
    instanceRoot.userData.capAnimProgress = nextCap;
    if (Math.abs(nextCap - targetCap) > 0.002) active = true;

    if (capGroup) {
      capGroup.position.y = 5.66 + nextCap * 1.15;
      capGroup.rotation.y = nextCap * Math.PI * 2.5;
    }

    // 2. Nghiêng lọ & giữ mặt chất lỏng cân bằng tương đối
    const bottleGroup = instanceRoot.getObjectByName('body');
    const meniscus = instanceRoot.getObjectByName('bottle_liquid_meniscus');
    const levelRing = instanceRoot.getObjectByName('bottle_level_ring');
    const targetTilt = instance.instanceState.bottleTilted ? 1 : 0;
    const curTilt = Number(instanceRoot.userData.tiltAnimProgress ?? 0);
    const nextTilt = THREE.MathUtils.damp(curTilt, targetTilt, 10, dt);
    instanceRoot.userData.tiltAnimProgress = nextTilt;
    if (Math.abs(nextTilt - targetTilt) > 0.002) active = true;

    if (bottleGroup) {
      bottleGroup.rotation.z = nextTilt * 0.23;
    }
    if (meniscus && levelRing) {
      meniscus.rotation.z = -nextTilt * 0.17;
      levelRing.rotation.z = -nextTilt * 0.17;
    }

    // 3. Hoạt họa bọt khí và kết tủa trong cốc thử 3D
    const beakerGroup = instanceRoot.getObjectByName('reaction_beaker_group');
    if (beakerGroup && beakerGroup.visible) {
      const bubbleGrp = beakerGroup.getObjectByName('bubble_group');
      if (bubbleGrp && bubbleGrp.visible) {
        active = true;
        bubbleGrp.children.forEach((b) => {
          const speed = Number(b.userData?.speed ?? 0.016);
          const wobble = Number(b.userData?.wobble ?? 0);
          const baseX = Number(b.userData?.baseX ?? 0);
          b.position.y += speed;
          b.position.x = baseX + Math.sin(timeSec * 4 + wobble) * 0.04;
          if (b.position.y > 1.55) {
            b.position.y = 0.18;
          }
        });
      }

      const precipGrp = beakerGroup.getObjectByName('precip_group');
      if (precipGrp && precipGrp.visible) {
        active = true;
        precipGrp.children.forEach((p) => {
          const baseY = Number(p.userData?.baseY ?? 0.5);
          const phase = Number(p.userData?.phase ?? 0);
          p.position.y = baseY + Math.sin(timeSec * 2 + phase) * 0.04;
          p.rotation.y += 0.01;
        });
      }
    }
  } else if (archetype === 'copper-wire-ring-3g') {
    const mode = instance.instanceState.chemicalReactionMode || 'pure';
    const particleSystem = instanceRoot.getObjectByName('copper_particle_system');
    if (particleSystem && particleSystem.visible) {
      active = true;
      particleSystem.children.forEach((m) => {
        if (!(m instanceof THREE.Mesh)) return;
        const speed = Number(m.userData?.speed ?? 0.02);
        const angle = Number(m.userData?.angle ?? 0);
        const radius = Number(m.userData?.radius ?? 1.95);
        const wobble = Number(m.userData?.wobble ?? 0);

        m.position.y += speed;
        m.position.x =
          Math.cos(angle) * radius + Math.sin(timeSec * 3 + wobble) * 0.06;
        if (m.position.y > 3.7) {
          m.position.y = 0.22;
        }

        if (m.material instanceof THREE.MeshBasicMaterial) {
          if (mode === 'hno3_conc') {
            m.material.color.setHex(0x9a3412);
          } else if (mode === 'hno3_dil') {
            m.material.color.setHex(m.position.y < 2.35 ? 0xf8fafc : 0xb45309);
          } else if (mode === 'cl2') {
            m.material.color.setHex(m.position.y > 1.8 ? 0x854d0e : 0xa3e635);
          } else if (mode === 'hcl_o2') {
            m.material.color.setHex(0xbae6fd);
          }
        }
      });
    }
  }

  return active;
}

// ============================================================================
// 4. CỐC ĐONG THÍ NGHIỆM THỦY TINH 100ML (100ML LOW-FORM GLASS BEAKER — BOMEX)
// ============================================================================
// Thông số chuẩn:
// - Hình dáng: Hình trụ đứng (Griffin low-form), đáy phẳng, thành dày 1.8mm (Ø50mm × cao 70mm).
// - Miệng cốc: Vành miệng uốn cong ra ngoài (rolled rim) kèm mỏ rót nhỏ hình chữ V (V-shaped pouring spout).
// - Vật liệu PBR: Thủy tinh Borosilicate 3.3 trong suốt (Transmission 1.0, IOR 1.48, Roughness 0.03, Base Color #ffffff).
// - Chi tiết in màu trắng đục (nổi nhẹ với Bump map & Roughness cao hơn thủy tinh):
//   + Bên trái: Logo tròn có 2 hình giọt nước cách điệu bên trong -> chữ "BOMEX" -> chữ "100 ml" in đậm -> Ô viết nhãn hình chữ nhật trắng đục nhám mờ (Frosted Patch) ngay dưới "100 ml".
//   + Bên phải: Cột vạch chia ngang từ dưới lên 20, 40, 60 và vạch trên cùng "80 ml" kèm chữ "APPROX." ngay bên dưới "80 ml".

let cachedBomex100ColorTex: THREE.CanvasTexture | null = null;
let cachedBomex100BumpTex: THREE.CanvasTexture | null = null;
let cachedBomex100RoughnessTex: THREE.CanvasTexture | null = null;

function getBomex100DecalTextures(): {
  colorMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  if (
    cachedBomex100ColorTex &&
    cachedBomex100BumpTex &&
    cachedBomex100RoughnessTex
  ) {
    return {
      colorMap: cachedBomex100ColorTex,
      bumpMap: cachedBomex100BumpTex,
      roughnessMap: cachedBomex100RoughnessTex,
    };
  }

  const W = 1024;
  const H = 1024;

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = W;
  colorCanvas.height = H;
  const cCtx = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = W;
  bumpCanvas.height = H;
  const bCtx = bumpCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = W;
  roughCanvas.height = H;
  const rCtx = roughCanvas.getContext('2d')!;

  // Khởi tạo nền cho 3 map
  cCtx.clearRect(0, 0, W, H);
  bCtx.fillStyle = '#000000';
  bCtx.fillRect(0, 0, W, H);
  rCtx.fillStyle = '#080808';
  rCtx.fillRect(0, 0, W, H);

  // Hàm vẽ đồng bộ lên cả Color (trắng đục), Bump (nổi nhẹ) và Roughness (nhám sơn in)
  const drawMarkings = (
    ctx: CanvasRenderingContext2D,
    mode: 'color' | 'bump' | 'rough',
  ) => {
    const inkColor =
      mode === 'color'
        ? '#ffffff'
        : mode === 'bump'
          ? '#d8d8d8'
          : '#b8b8b8';
    const frostedColor =
      mode === 'color'
        ? '#f8fafc'
        : mode === 'bump'
          ? '#efefef'
          : '#ededed';

    ctx.save();
    ctx.strokeStyle = inkColor;
    ctx.fillStyle = inkColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // ------------------------------------------------------------------------
    // CỘT TRÁI (X = 310): LOGO TRÒN 2 GIỌT NƯỚC -> "BOMEX" -> "100 ml" -> Ô NHÁM MỜ
    // ------------------------------------------------------------------------
    const leftCenterX = 310;

    // 1. Logo hình tròn, bên trong có 2 hình giọt nước cách điệu
    const logoCenterY = 205;
    const logoRadius = 64;
    ctx.lineWidth = 8.5;
    ctx.beginPath();
    ctx.arc(leftCenterX, logoCenterY, logoRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Vành mảnh bên trong logo tròn
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(leftCenterX, logoCenterY, logoRadius - 10, 0, Math.PI * 2);
    ctx.stroke();

    // Vẽ 2 hình giọt nước cách điệu bên trong hình tròn (giọt lớn bên trái, giọt nhỏ bên phải)
    const drawStylizedDroplet = (
      cx: number,
      cy: number,
      scale: number,
      tiltRad: number,
    ) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(tiltRad);
      ctx.scale(scale, scale);
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.bezierCurveTo(14, -8, 20, 6, 20, 15);
      ctx.arc(0, 15, 20, 0, Math.PI, false);
      ctx.bezierCurveTo(-20, 6, -14, -8, 0, -28);
      ctx.closePath();
      ctx.fill();

      // Khoét tia sáng cong mảnh bên trong giọt nước để tạo nét cách điệu chuẩn phòng thí nghiệm
      if (mode === 'color') {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 4.2;
        ctx.beginPath();
        ctx.arc(-3, 14, 11, Math.PI * 0.65, Math.PI * 1.25, false);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    };

    drawStylizedDroplet(leftCenterX - 15, logoCenterY + 2, 0.92, -0.08);
    drawStylizedDroplet(leftCenterX + 19, logoCenterY - 6, 0.68, 0.12);

    // 2. Dưới Logo: Chữ "BOMEX" (viết hoa, sắc nét)
    ctx.font = '900 46px "Inter", "Arial Black", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BOMEX', leftCenterX, 318);

    // 3. Dưới BOMEX: Chữ "100 ml" (in đậm, to và rõ ràng)
    ctx.font = '900 68px "Inter", "Arial Black", Arial, sans-serif';
    ctx.fillText('100 ml', leftCenterX, 405);

    // 4. Ô ghi chú (Frosted Patch): Hình chữ nhật trắng đục nằm ngay dưới số "100 ml"
    const patchW = 248;
    const patchH = 315;
    const patchX = leftCenterX - patchW / 2;
    const patchY = 468;
    const cornerR = 8;

    ctx.fillStyle = frostedColor;
    ctx.beginPath();
    ctx.roundRect(patchX, patchY, patchW, patchH, cornerR);
    ctx.fill();

    // Tạo hạt nhám mờ (frosted micro-grain) cho ô viết nhãn
    if (mode !== 'color') {
      for (let i = 0; i < 900; i++) {
        const gx = patchX + 4 + ((i * 73) % (patchW - 8));
        const gy = patchY + 4 + ((i * 137) % (patchH - 8));
        ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#c2c2c2';
        ctx.fillRect(gx, gy, 2.5, 2.5);
      }
    } else {
      // Viền men trắng mảnh quanh ô nhám mờ
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.98)';
      ctx.stroke();
    }

    // ------------------------------------------------------------------------
    // CỘT PHẢI (X = 560..840): THANG ĐO 20, 40, 60, 80 ml + APPROX.
    // ------------------------------------------------------------------------
    // Ánh xạ thể tích thực tế (10 ml -> 80 ml) lên tọa độ Y trên decal (Y từ 840 lên 210)
    // Decal trải từ y_world = 0.006m (đáy) tới y_world = 0.064m (gần miệng 70mm).
    // Trong cốc 100ml:
    //   20 ml -> Y = 750
    //   40 ml -> Y = 570
    //   60 ml -> Y = 390
    //   80 ml -> Y = 210
    const volToCanvasY = (volMl: number): number => {
      return 930 - (volMl / 80) * 720;
    };

    const tickLeftX = 548;
    const majorTickLen = 112;
    const minorTickLen = 64;

    ctx.fillStyle = inkColor;
    ctx.strokeStyle = inkColor;

    // Đường kẻ dọc nối đầu trái các vạch chia tạo khung thang đo chuẩn BOMEX
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.moveTo(tickLeftX, volToCanvasY(10));
    ctx.lineTo(tickLeftX, volToCanvasY(80));
    ctx.stroke();

    const volumes = [10, 20, 30, 40, 50, 60, 70, 80];
    for (const v of volumes) {
      const y = volToCanvasY(v);
      const isMajor = v % 20 === 0;
      ctx.lineWidth = isMajor ? 8.5 : 5.5;
      ctx.beginPath();
      ctx.moveTo(tickLeftX, y);
      ctx.lineTo(tickLeftX + (isMajor ? majorTickLen : minorTickLen), y);
      ctx.stroke();

      if (isMajor) {
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        if (v === 80) {
          // Vạch trên cùng ghi số "80 ml" và ngay bên dưới chữ "80 ml" là chữ "APPROX." (chữ nhỏ)
          ctx.font = '900 52px "Inter", Arial, sans-serif';
          ctx.fillText('80 ml', tickLeftX + majorTickLen + 18, y - 4);

          ctx.font = '800 28px "Inter", Arial, sans-serif';
          ctx.fillText('APPROX.', tickLeftX + majorTickLen + 20, y + 40);
        } else {
          // Các con số từ dưới lên trên: 20, 40, 60
          ctx.font = '900 54px "Inter", Arial, sans-serif';
          ctx.fillText(String(v), tickLeftX + majorTickLen + 20, y);
        }
      }
    }

    ctx.restore();
  };

  drawMarkings(cCtx, 'color');
  drawMarkings(bCtx, 'bump');
  drawMarkings(rCtx, 'rough');

  const colorMap = new THREE.CanvasTexture(colorCanvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.anisotropy = 16;
  colorMap.needsUpdate = true;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.anisotropy = 8;
  bumpMap.needsUpdate = true;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.anisotropy = 8;
  roughnessMap.needsUpdate = true;

  cachedBomex100ColorTex = colorMap;
  cachedBomex100BumpTex = bumpMap;
  cachedBomex100RoughnessTex = roughnessMap;

  return { colorMap, bumpMap, roughnessMap };
}

/**
 * Tạo lưới hình học Quad-grid Smooth-Shaded có độ dày thành thực tế (1.8mm),
 * đáy phẳng, vành miệng uốn cong (rolled rim) và mỏ rót hình chữ V (V-shaped pouring spout)
 * dành riêng cho Cốc đong thủy tinh 100ml BOMEX.
 */
function createBomexBeaker100GlassGeometry(
  outerRadius = 0.025, // Ø 50 mm
  wallThickness = 0.0018, // Thành kính dày 1.8 mm (nằm trong khoảng 1.5 - 2.0 mm)
  bottomThickness = 0.0024, // Đáy phẳng dày 2.4 mm
  totalHeight = 0.070, // Cao 70 mm
  radialSegments = 72,
): THREE.BufferGeometry {
  const innerRadius = outerRadius - wallThickness;

  // Mặt cắt dọc (r, y) đi từ tâm đáy ngoài -> thành ngoài -> vành miệng uốn cong -> thành trong -> tâm đáy trong
  const profile: Array<[number, number]> = [
    [0.0, 0.0],
    [outerRadius * 0.72, 0.0],
    [outerRadius - 0.0022, 0.0],
    [outerRadius - 0.0008, 0.0007],
    [outerRadius, 0.0022],
    [outerRadius, totalHeight * 0.25],
    [outerRadius, totalHeight * 0.50],
    [outerRadius, totalHeight * 0.75],
    [outerRadius, totalHeight * 0.86],
    [outerRadius + 0.0003, totalHeight * 0.93],
    // Vành miệng hơi uốn cong ra ngoài (rolled rim)
    [outerRadius + 0.0011, totalHeight * 0.972],
    [outerRadius + 0.0018, totalHeight * 0.992],
    [outerRadius + 0.0014, totalHeight],
    [outerRadius + 0.0002, totalHeight + 0.0003],
    [innerRadius + 0.0004, totalHeight],
    [innerRadius, totalHeight * 0.972],
    // Thành trong đi xuống đáy phẳng bên trong
    [innerRadius, totalHeight * 0.86],
    [innerRadius, totalHeight * 0.75],
    [innerRadius, totalHeight * 0.50],
    [innerRadius, totalHeight * 0.25],
    [innerRadius, bottomThickness + 0.0018],
    [innerRadius - 0.0008, bottomThickness + 0.0005],
    [innerRadius - 0.0022, bottomThickness],
    [innerRadius * 0.65, bottomThickness],
    [0.0, bottomThickness],
  ];

  const ringCount = profile.length;
  const cols = radialSegments + 1;
  const positions = new Float32Array(ringCount * cols * 3);
  const uvs = new Float32Array(ringCount * cols * 2);
  const indices: number[] = [];

  // Đặt mỏ rót hình chữ V (V-shaped pouring spout) tại góc +X (theta = 0)
  // để vừa thấy rõ biên dạng chữ V từ góc nhìn chính diện (+Z), vừa khớp hướng nghiêng rót chất lỏng
  const spoutCenterTheta = 0.0;
  const spoutHalfWidthRad = 0.34; // ~19.5° mỗi bên

  for (let i = 0; i < ringCount; i++) {
    const [baseR, baseY] = profile[i];
    const vCoord = i / (ringCount - 1);

    // Hệ số ảnh hưởng của mỏ rót chữ V ở vùng cổ và vành miệng (y > 76% chiều cao cốc)
    const rimHeightFactor = THREE.MathUtils.smoothstep(
      baseY,
      totalHeight * 0.76,
      totalHeight * 0.995,
    );

    for (let j = 0; j <= radialSegments; j++) {
      const uCoord = j / radialSegments;
      const theta = uCoord * Math.PI * 2;

      // Khoảng cách góc ngắn nhất tới tâm mỏ rót
      let dTheta = Math.abs(theta - spoutCenterTheta);
      if (dTheta > Math.PI) dTheta = Math.PI * 2 - dTheta;

      let r = baseR;
      let y = baseY;

      if (rimHeightFactor > 0 && dTheta < spoutHalfWidthRad && baseR > 0.005) {
        // Biên dạng chữ V sắc nét nhưng mượt ở đỉnh mỏ rót (V-shaped channel)
        const normAng = 1.0 - dTheta / spoutHalfWidthRad;
        const vShapeProfile = Math.pow(normAng, 1.45);
        const spoutOutward = 0.0046 * vShapeProfile * rimHeightFactor;
        const spoutLipDip = -0.0014 * Math.pow(normAng, 1.8) * rimHeightFactor;
        r += spoutOutward;
        y += spoutLipDip;
      }

      const idx = i * cols + j;
      positions[idx * 3] = Math.cos(theta) * r;
      positions[idx * 3 + 1] = y;
      positions[idx * 3 + 2] = Math.sin(theta) * r;

      uvs[idx * 2] = uCoord;
      uvs[idx * 2 + 1] = vCoord;
    }
  }

  for (let i = 0; i < ringCount - 1; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * cols + j;
      const b = (i + 1) * cols + j;
      const c = (i + 1) * cols + (j + 1);
      const d = i * cols + (j + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export function buildBomexBeaker100Model(isSoftwareGl = false): THREE.Group {
  const root = new THREE.Group();
  root.name = 'bomex_beaker_100ml_root';

  const outerRadius = 0.025; // Bán kính ngoài 25 mm (Đường kính 50 mm)
  const innerRadius = 0.0232; // Bán kính trong 23.2 mm (Thành dày 1.8 mm)
  const totalHeight = 0.070; // Chiều cao 70 mm

  // 1. Thân cốc thủy tinh Borosilicate 3.3 trong suốt (`body`)
  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'body';

  const glassEnvMap = getClearGlassEnvironmentMap();
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xffffff), // Trắng tinh khiết (Pure white)
    metalness: 0.0,
    roughness: 0.03, // Gần bằng 0 — rất bóng bẩy, phản chiếu tốt
    transmission: isSoftwareGl ? 0 : 1.0, // Độ truyền sáng tối đa (1.0)
    transparent: true,
    opacity: isSoftwareGl ? 0.34 : 1.0,
    ior: 1.48, // Chuẩn của thủy tinh Borosilicate (1.45 - 1.50)
    thickness: 0.0036, // Độ dày thành khúc xạ thực tế
    attenuationColor: new THREE.Color(0xffffff),
    attenuationDistance: 1.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.025,
    specularIntensity: 1.0,
    specularColor: new THREE.Color(0xffffff),
    envMap: glassEnvMap,
    envMapIntensity: 1.45,
    depthWrite: false,
  });

  const vesselGeo = createBomexBeaker100GlassGeometry(
    outerRadius,
    0.0018,
    0.0024,
    totalHeight,
    72,
  );
  const vesselMesh = new THREE.Mesh(vesselGeo, glassMat);
  vesselMesh.name = 'bomex_glass_vessel';
  vesselMesh.castShadow = true;
  vesselMesh.receiveShadow = true;
  vesselMesh.renderOrder = 4;
  bodyGroup.add(vesselMesh);

  // Vòng khúc xạ ánh sáng đáy kính Borosilicate dày để nhấn mạnh hiệu ứng studio lighting
  const baseRefractionRing = new THREE.Mesh(
    new THREE.TorusGeometry(innerRadius * 0.94, 0.0009, 12, 64),
    new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      roughness: 0.06,
      metalness: 0.05,
      transparent: true,
      opacity: 0.42,
      envMap: glassEnvMap,
      envMapIntensity: 1.6,
      depthWrite: false,
    }),
  );
  baseRefractionRing.rotation.x = Math.PI / 2;
  baseRefractionRing.position.y = 0.0022;
  baseRefractionRing.renderOrder = 3;
  bodyGroup.add(baseRefractionRing);

  // Điểm neo mỏ rót hình chữ V (`pouring_lip`) tại góc +X của miệng cốc
  const pouringLipNode = new THREE.Object3D();
  pouringLipNode.name = 'pouring_lip';
  pouringLipNode.position.set(outerRadius + 0.0046, totalHeight - 0.0012, 0);
  bodyGroup.add(pouringLipNode);

  root.add(bodyGroup);

  // 2. Chi tiết in màu trắng đục & Ô viết nhãn nhám mờ (`scale_marks`)
  // Đặt ôm sát mặt trước (+Z) của thành ngoài cốc từ cao độ y = 0.006m đến y = 0.064m
  const scaleGroup = new THREE.Group();
  scaleGroup.name = 'scale_marks';

  const { colorMap, bumpMap, roughnessMap } = getBomex100DecalTextures();
  const decalArcAngle = Math.PI * 0.62; // ~111.6° mặt trước (+Z nằm ở góc Math.PI / 2 hoặc 0 tùy CylinderGeometry)
  // Lưu ý: Trong Three.js CylinderGeometry, theta = 0 nằm ở +Z!
  // Do đó để mặt in hướng thẳng về phía người dùng (+Z), ta đặt thetaStart = -decalArcAngle / 2
  const decalHeight = 0.058;
  const decalCenterY = 0.035;
  const decalGeo = new THREE.CylinderGeometry(
    outerRadius + 0.00022,
    outerRadius + 0.00022,
    decalHeight,
    56,
    1,
    true,
    -decalArcAngle / 2,
    decalArcAngle,
  );

  const decalMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: colorMap,
    bumpMap,
    bumpScale: 0.0006, // Mực in trắng đục hơi nổi nhẹ lên khỏi bề mặt kính
    roughnessMap,
    roughness: 0.68, // Roughness của phần mực in và ô viết nhãn cao hơn thủy tinh
    metalness: 0.02,
    transparent: true,
    alphaTest: 0.06,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });

  const decalMesh = new THREE.Mesh(decalGeo, decalMat);
  decalMesh.name = 'bomex_printed_markings';
  decalMesh.position.y = decalCenterY;
  decalMesh.renderOrder = 5;
  scaleGroup.add(decalMesh);

  root.add(scaleGroup);

  // 3. Lớp chất lỏng bên trong (`liquid_surface`) khớp với thang đo 20 - 40 - 60 - 80 - 100 ml
  // Mặc định ban đầu cốc đong 100ml rỗng (0 ml, visible = false), chỉ hiện khi được rót dung dịch vào!
  const liquidGroup = new THREE.Group();
  liquidGroup.name = 'liquid_surface';
  liquidGroup.visible = false;
  const defaultLiquidHeight = 0.0285;
  const liquidRadius = innerRadius - 0.0003;

  const liquidGeo = new THREE.CylinderGeometry(
    liquidRadius,
    liquidRadius,
    defaultLiquidHeight,
    48,
  );
  liquidGeo.translate(0, defaultLiquidHeight / 2, 0);

  const liquidMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x38bdf8),
    roughness: 0.06,
    metalness: 0.0,
    transmission: isSoftwareGl ? 0 : 0.72,
    transparent: true,
    opacity: isSoftwareGl ? 0.58 : 0.82,
    ior: 1.333,
    envMap: glassEnvMap,
    envMapIntensity: 1.2,
    depthWrite: false,
  });
  const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
  liquidMesh.name = 'liquid_body';
  liquidMesh.renderOrder = 2;
  liquidGroup.add(liquidMesh);

  // Mặt thoáng chất lỏng và viền khum lõm (concave meniscus)
  const capGeo = new THREE.CircleGeometry(liquidRadius, 48);
  capGeo.rotateX(-Math.PI / 2);
  const capMesh = new THREE.Mesh(
    capGeo,
    new THREE.MeshPhysicalMaterial({
      color: 0x7dd3fc,
      roughness: 0.04,
      metalness: 0.05,
      transparent: true,
      opacity: 0.86,
      envMap: glassEnvMap,
      depthWrite: false,
    }),
  );
  capMesh.name = 'surface_cap';
  capMesh.position.y = defaultLiquidHeight;
  capMesh.renderOrder = 3;
  liquidGroup.add(capMesh);

  const meniscusWallGeo = new THREE.CylinderGeometry(
    liquidRadius,
    liquidRadius * 0.96,
    0.0022,
    48,
    1,
    true,
  );
  const meniscusWall = new THREE.Mesh(
    meniscusWallGeo,
    new THREE.MeshBasicMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  meniscusWall.name = 'meniscus_wall';
  meniscusWall.position.y = defaultLiquidHeight + 0.001;
  meniscusWall.renderOrder = 3;
  liquidGroup.add(meniscusWall);

  liquidGroup.position.y = 0.0026;
  root.add(liquidGroup);

  return root;
}

