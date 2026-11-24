import * as THREE from 'three';
import { CircuitTerminalId } from '../domain/dcCircuitSolverEngine';
import { SceneInstance } from '../domain/types';

function createConOBatteryTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, '#f59e0b');
  grad.addColorStop(0.25, '#fbbf24');
  grad.addColorStop(0.5, '#fde047');
  grad.addColorStop(0.75, '#fbbf24');
  grad.addColorStop(1, '#d97706');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  ctx.fillStyle = '#dc2626';
  ctx.fillRect(0, 0, 512, 76);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 444, 512, 68);

  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(256, 240, 108, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#fef08a';
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 48px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CON Ó', 256, 225);
  ctx.fillStyle = '#fef08a';
  ctx.font = '800 32px system-ui, sans-serif';
  ctx.fillText('PIN ĐẠI 1.5V', 256, 272);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 40px monospace';
  ctx.fillText('+ 1.5V', 256, 52);
  ctx.fillText('- R20 -', 256, 490);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function drawMeterDialCanvas(type: 'A' | 'V'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 340;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 512, 340);

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, 496, 324);

  const cx = 256;
  const cy = 285;
  const rOuter = 205;
  const rInner = 165;
  // Góc từ -130° (lệch âm bên trái 0) đến -50° (kịch phải)
  const zeroDeg = -130;
  const fullDeg = -50;
  const startAngle = (zeroDeg * Math.PI) / 180;
  const endAngle = (fullDeg * Math.PI) / 180;

  // Vùng cảnh báo phân cực ngược (< 0) bên trái vạch 0
  const negStartAngle = (-145 * Math.PI) / 180;
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, rOuter, negStartAngle, startAngle);
  ctx.stroke();

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, rOuter, startAngle, endAngle);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, rInner, startAngle, endAngle);
  ctx.stroke();

  const totalTicks = 30;
  for (let i = 0; i <= totalTicks; i++) {
    const t = i / totalTicks;
    const ang = startAngle + t * (endAngle - startAngle);
    const isMajor = i % 5 === 0;
    const tickLen = isMajor ? 18 : 9;

    const x1 = cx + Math.cos(ang) * rOuter;
    const y1 = cy + Math.sin(ang) * rOuter;
    const x2 = cx + Math.cos(ang) * (rOuter + tickLen);
    const y2 = cy + Math.sin(ang) * (rOuter + tickLen);

    ctx.strokeStyle = i >= 26 ? '#dc2626' : '#0f172a';
    ctx.lineWidth = isMajor ? 3.2 : 1.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    const x3 = cx + Math.cos(ang) * rInner;
    const y3 = cy + Math.sin(ang) * rInner;
    const x4 = cx + Math.cos(ang) * (rInner - (isMajor ? 14 : 7));
    const y4 = cy + Math.sin(ang) * (rInner - (isMajor ? 14 : 7));
    ctx.beginPath();
    ctx.moveTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.stroke();

    if (isMajor) {
      const idx = i / 5;
      const topLabels =
        type === 'A'
          ? ['0', '0.5', '1', '1.5', '2', '2.5', '3']
          : ['0', '2', '4', '6', '8', '10', '12'];
      const botLabels =
        type === 'A'
          ? ['0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6']
          : ['0', '1', '2', '3', '4', '5', '6'];

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const lxTop = cx + Math.cos(ang) * (rOuter + 34);
      const lyTop = cy + Math.sin(ang) * (rOuter + 34);
      ctx.fillText(topLabels[idx], lxTop, lyTop);

      ctx.font = 'bold 17px monospace';
      ctx.fillStyle = '#334155';
      const lxBot = cx + Math.cos(ang) * (rInner - 28);
      const lyBot = cy + Math.sin(ang) * (rInner - 28);
      ctx.fillText(botLabels[idx], lxBot, lyBot);
    }
  }

  ctx.fillStyle = '#0f172a';
  ctx.font = '900 54px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(type, cx, 198);

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 32, 224);
  ctx.lineTo(cx + 32, 224);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createTerminalLabelSprite(text: string, colorHex: number): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 72;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.86)';
  ctx.beginPath();
  ctx.roundRect(6, 6, 244, 60, 14);
  ctx.fill();

  const hexStr = '#' + colorHex.toString(16).padStart(6, '0');
  ctx.strokeStyle = hexStr === '#1e242b' ? '#94a3b8' : hexStr;
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 26px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 36);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.036, 0.01, 1);
  sprite.position.set(0, 0.025, 0);
  sprite.name = 'terminal_badge';
  return sprite;
}

export function createBananaTerminalSocket(
  terminalId: CircuitTerminalId,
  shortBadgeText: string,
  colorHex: number,
  x: number,
  y: number,
  z: number,
): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.name = `terminal_${terminalId}`;
  g.userData = {
    isTerminal: true,
    terminalId,
    shortBadgeText,
    baseColorHex: colorHex,
  };

  const brassNut = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0068, 0.0068, 0.004, 16),
    new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 0.85 }),
  );
  brassNut.position.y = 0.002;
  brassNut.userData = g.userData;
  g.add(brassNut);

  const insMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: 0.3,
    metalness: 0.1,
    emissive: 0x000000,
    emissiveIntensity: 0,
  });
  const insulator = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0056, 0.0064, 0.012, 24),
    insMat,
  );
  insulator.position.y = 0.008;
  insulator.name = 'terminal_insulator';
  insulator.castShadow = true;
  insulator.userData = g.userData;
  g.add(insulator);

  const bore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0026, 0.0026, 0.013, 16),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.25, metalness: 0.9 }),
  );
  bore.position.y = 0.0082;
  bore.userData = g.userData;
  g.add(bore);

  // Vòng sáng báo hiệu khi cọc đang được chọn để cắm dây
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.0082, 0.0014, 12, 24).rotateX(Math.PI / 2),
    new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.0,
    }),
  );
  ring.position.y = 0.013;
  ring.name = 'terminal_highlight_ring';
  ring.userData = g.userData;
  g.add(ring);

  // Hitbox hơi rộng hơn để dễ click chuột và cảm ứng
  const hitSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.013, 12, 12),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
    }),
  );
  hitSphere.position.y = 0.009;
  hitSphere.userData = g.userData;
  g.add(hitSphere);

  const badge = createTerminalLabelSprite(shortBadgeText, colorHex);
  g.add(badge);

  return g;
}

export function buildSingleConOBatteryUnit(name = 'dc_con_o_battery'): THREE.Group {
  const g = new THREE.Group();
  g.name = name;
  const r = 0.0155;
  const len = 0.056;

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r, len, 32).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({
      map: createConOBatteryTexture(),
      roughness: 0.26,
      metalness: 0.25,
    }),
  );
  body.position.y = r + 0.002;
  body.castShadow = true;
  g.add(body);

  const steelMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.2,
    metalness: 0.9,
  });

  // Cực dương (+) nhô cao ở đầu -Z
  const posCap = new THREE.Mesh(
    new THREE.CylinderGeometry(r * 0.96, r * 0.96, 0.002, 24).rotateX(Math.PI / 2),
    steelMat,
  );
  posCap.position.set(0, r + 0.002, -len / 2 - 0.001);
  g.add(posCap);

  const posNub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0048, 0.0052, 0.0045, 20).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.22, metalness: 0.85 }),
  );
  posNub.position.set(0, r + 0.002, -len / 2 - 0.0035);
  g.add(posNub);

  // Cực âm (-) phẳng ở đầu +Z
  const negCap = new THREE.Mesh(
    new THREE.CylinderGeometry(r * 0.96, r * 0.96, 0.002, 24).rotateX(Math.PI / 2),
    steelMat,
  );
  negCap.position.set(0, r + 0.002, len / 2 + 0.001);
  g.add(negCap);

  return g;
}

/**
 * Giá đỡ pin (Battery Holder):
 * Có 2 khay pin (SLOT_1 bên trái, SLOT_2 bên phải) và 4 cọc độc lập ở 4 góc:
 * - Khay 1: BAT1_POS (Đỏ, trái-trên) và BAT1_NEG (Đen, trái-dưới)
 * - Khay 2: BAT2_NEG (Đen, phải-trên) và BAT2_POS (Đỏ, phải-dưới)
 * Không nối cầu sẵn giữa 2 khay để người dùng bắt buộc nối dây từ BAT1_NEG sang BAT2_POS khi cần 3.0V!
 */
export function buildDcBatteryHolderModel(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'dc_battery_holder';

  const plasticMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.42,
    metalness: 0.08,
  });
  const slotFloorMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.55,
    metalness: 0.12,
  });
  const copperMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.28,
    metalness: 0.86,
  });

  // Đế hộp nhựa 2 ngăn
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.104, 0.012, 0.082), plasticMat);
  base.position.y = 0.006;
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);

  // Vách ngăn & thành hộp
  [-0.048, 0, 0.048].forEach((x) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.022, 0.082), plasticMat);
    wall.position.set(x, 0.018, 0);
    wall.castShadow = true;
    g.add(wall);
  });

  [-0.039, 0.039].forEach((z) => {
    const endWall = new THREE.Mesh(new THREE.BoxGeometry(0.104, 0.024, 0.004), plasticMat);
    endWall.position.set(0, 0.019, z);
    endWall.castShadow = true;
    g.add(endWall);
  });

  // Lò xo và bản cực đồng ở 2 đầu mỗi khay (độc lập, KHÔNG có thanh đồng nối sẵn giữa 2 khay!)
  [-0.024, 0.024].forEach((x) => {
    [-0.035, 0.035].forEach((z) => {
      const tab = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.02, 0.002), copperMat);
      tab.position.set(x, 0.021, z);
      g.add(tab);
    });
  });

  // Khay SLOT_1 (Trái: x = -0.024) và Khay SLOT_2 (Phải: x = +0.024)
  const slotConfigs: Array<{ slotId: 'SLOT_1' | 'SLOT_2'; x: number; reverseDefault: boolean }> = [
    { slotId: 'SLOT_1', x: -0.024, reverseDefault: false }, // BAT1_POS ở -Z (trên), BAT1_NEG ở +Z (dưới)
    { slotId: 'SLOT_2', x: 0.024, reverseDefault: true },   // BAT2_NEG ở -Z (trên), BAT2_POS ở +Z (dưới)
  ];

  slotConfigs.forEach(({ slotId, x, reverseDefault }) => {
    const slotPad = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.003, 0.068), slotFloorMat);
    slotPad.position.set(x, 0.0125, 0);
    slotPad.name = slotId;
    slotPad.userData = {
      isBatterySlot: true,
      slotId,
    };
    g.add(slotPad);

    const batMesh = buildSingleConOBatteryUnit(
      slotId === 'SLOT_1' ? 'battery_slot_1_mesh' : 'battery_slot_2_mesh',
    );
    batMesh.position.set(x, 0.011, 0);
    if (reverseDefault) {
      batMesh.rotation.y = Math.PI;
    }
    batMesh.traverse((child) => {
      child.userData = {
        ...child.userData,
        isBatterySlot: true,
        slotId,
      };
    });
    g.add(batMesh);
  });

  // 4 Cọc cắm độc lập ở 4 góc:
  // Khay 1: BAT1_POS (Đỏ, trái-trên) & BAT1_NEG (Đen, trái-dưới)
  // Khay 2: BAT2_NEG (Đen, phải-trên) & BAT2_POS (Đỏ, phải-dưới)
  g.add(createBananaTerminalSocket('BAT1_POS', 'BAT1+', 0xd92626, -0.042, 0.026, -0.031));
  g.add(createBananaTerminalSocket('BAT1_NEG', 'BAT1-', 0x1e242b, -0.042, 0.026, 0.031));
  g.add(createBananaTerminalSocket('BAT2_NEG', 'BAT2-', 0x1e242b, 0.042, 0.026, -0.031));
  g.add(createBananaTerminalSocket('BAT2_POS', 'BAT2+', 0xd92626, 0.042, 0.026, 0.031));

  return g;
}

/**
 * Cầu dao K (Switch): 2 cọc SW_RED (Đỏ) và SW_GREEN (Xanh lá)
 */
export function buildDcKnifeSwitchModel(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'dc_knife_switch';

  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.35,
    metalness: 0.1,
  });
  const copperMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.25,
    metalness: 0.88,
  });

  const base = new THREE.Mesh(new THREE.BoxGeometry(0.092, 0.014, 0.046), baseMat);
  base.position.y = 0.007;
  base.castShadow = true;
  base.receiveShadow = true;
  base.userData = { isKnifeSwitchToggle: true };
  g.add(base);

  // Ngàm chữ U bên trái (nối với SW_RED)
  const jawClip = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.015, 0.008), copperMat);
  jawClip.position.set(-0.018, 0.021, 0);
  jawClip.userData = { isKnifeSwitchToggle: true };
  g.add(jawClip);

  // Trụ bản lề bên phải (nối với SW_GREEN)
  const hingeStand = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.016, 0.008), copperMat);
  hingeStand.position.set(0.018, 0.021, 0);
  hingeStand.userData = { isKnifeSwitchToggle: true };
  g.add(hingeStand);

  // Lưỡi dao xoay quanh bản lề phải
  const bladePivot = new THREE.Group();
  bladePivot.position.set(0.018, 0.025, 0);
  bladePivot.name = 'switch_blade_pivot';

  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.004, 0.0045), copperMat);
  blade.position.set(-0.02, 0, 0);
  blade.castShadow = true;
  blade.userData = { isKnifeSwitchToggle: true };
  bladePivot.add(blade);

  const knob = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0042, 0.0032, 0.018, 16).rotateZ(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 }),
  );
  knob.position.set(-0.044, 0.002, 0);
  knob.userData = { isKnifeSwitchToggle: true };
  bladePivot.add(knob);

  // Mặc định mở (góc -0.68 rad)
  bladePivot.rotation.z = -0.68;
  g.add(bladePivot);

  // 2 cọc SW_RED (Đỏ) và SW_GREEN (Xanh lá)
  g.add(createBananaTerminalSocket('SW_RED', 'SW_RED', 0xd92626, -0.036, 0.014, 0));
  g.add(createBananaTerminalSocket('SW_GREEN', 'SW_GRN', 0x16a34a, 0.036, 0.014, 0));

  return g;
}

/**
 * Bóng đèn 126 (Bulb): 2 cọc BULB_NEG (Đen, trái) và BULB_POS (Đỏ, phải), R_bulb = 8.5Ω
 */
export function buildDcLightBulb126Model(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'dc_light_bulb_126';

  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 256;
  labelCanvas.height = 128;
  const ctx = labelCanvas.getContext('2d')!;
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 256, 128);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('126 (8.5Ω)', 128, 108);
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText('-', 42, 68);
  ctx.fillStyle = '#dc2626';
  ctx.fillText('+', 214, 68);
  const topTex = new THREE.CanvasTexture(labelCanvas);
  topTex.colorSpace = THREE.SRGBColorSpace;

  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
  const topMat = new THREE.MeshStandardMaterial({ map: topTex, roughness: 0.3 });

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(0.092, 0.014, 0.048),
    [whiteMat, whiteMat, topMat, whiteMat, whiteMat, whiteMat],
  );
  base.position.y = 0.007;
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);

  const socketRing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.014, 0.008, 24),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 }),
  );
  socketRing.position.y = 0.018;
  g.add(socketRing);

  const brassMount = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0085, 0.0085, 0.011, 24),
    new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 0.88 }),
  );
  brassMount.position.y = 0.025;
  g.add(brassMount);

  const bulbGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.38,
    roughness: 0.05,
    transmission: 0.82,
    emissive: 0xffaa00,
    emissiveIntensity: 0,
  });
  const bulbGlass = new THREE.Mesh(new THREE.SphereGeometry(0.0145, 24, 24), bulbGlassMat);
  bulbGlass.position.y = 0.041;
  bulbGlass.name = 'bulb_glass_globe';
  g.add(bulbGlass);

  const filamentMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    emissive: 0xffb703,
    emissiveIntensity: 0,
    roughness: 0.3,
  });
  const filament = new THREE.Mesh(
    new THREE.TorusGeometry(0.0045, 0.0009, 10, 20),
    filamentMat,
  );
  filament.position.y = 0.04;
  filament.name = 'bulb_filament';
  g.add(filament);

  const bulbLight = new THREE.PointLight(0xffb703, 0, 0.55);
  bulbLight.position.set(0, 0.048, 0);
  bulbLight.name = 'bulb_point_light';
  g.add(bulbLight);

  // 2 cọc BULB_NEG (Đen, trái) và BULB_POS (Đỏ, phải)
  g.add(createBananaTerminalSocket('BULB_NEG', 'BULB-', 0x1e242b, -0.036, 0.014, 0));
  g.add(createBananaTerminalSocket('BULB_POS', 'BULB+', 0xd92626, 0.036, 0.014, 0));

  return g;
}

/**
 * Biến trở con chạy 20Ω (Rheostat):
 * 3 cọc: RHEO_IN (Đỏ - đầu cuộn dây), RHEO_COIL_END (Xanh giữa - cuối cuộn dây), RHEO_WIPER (Xanh phải - thanh con chạy)
 */
export function buildDcRheostat20Model(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'dc_rheostat_20';

  const legMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.45,
    metalness: 0.35,
  });
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.22,
    metalness: 0.88,
  });

  // 2 chân đỡ hai đầu
  [-0.068, 0.068].forEach((x) => {
    const legFoot = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.014, 0.056), legMat);
    legFoot.position.set(x, 0.007, 0);
    legFoot.castShadow = true;
    g.add(legFoot);

    const legUpright = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.054, 0.036), legMat);
    legUpright.position.set(x, 0.034, 0);
    legUpright.castShadow = true;
    g.add(legUpright);
  });

  // Ống sứ quấn dây hợp kim Constantan 20Ω
  const coilCanvas = document.createElement('canvas');
  coilCanvas.width = 512;
  coilCanvas.height = 64;
  const ctx = coilCanvas.getContext('2d')!;
  for (let i = 0; i < 512; i += 4) {
    ctx.fillStyle = i % 8 === 0 ? '#1e293b' : '#64748b';
    ctx.fillRect(i, 0, 3, 64);
  }
  const coilTex = new THREE.CanvasTexture(coilCanvas);
  const coilBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0165, 0.0165, 0.122, 32).rotateZ(Math.PI / 2),
    new THREE.MeshStandardMaterial({ map: coilTex, roughness: 0.38, metalness: 0.65 }),
  );
  coilBody.position.set(0, 0.028, 0);
  coilBody.castShadow = true;
  coilBody.userData = { isRheostatTrack: true };
  g.add(coilBody);

  // Thanh trượt dẫn điện phía trên
  const guideRod = new THREE.Mesh(new THREE.BoxGeometry(0.144, 0.005, 0.006), steelMat);
  guideRod.position.set(0, 0.055, 0);
  guideRod.userData = { isRheostatTrack: true };
  g.add(guideRod);

  // Con chạy trượt (plunger)
  const wiperGroup = new THREE.Group();
  wiperGroup.position.set(-0.01, 0.055, 0);
  wiperGroup.name = 'plunger';
  wiperGroup.userData = { isRheostatWiper: true };

  const wiperFinger = new THREE.Mesh(
    new THREE.BoxGeometry(0.014, 0.016, 0.038),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.85 }),
  );
  wiperFinger.position.y = -0.008;
  wiperFinger.userData = { isRheostatWiper: true };
  wiperGroup.add(wiperFinger);

  const wiperKnob = new THREE.Mesh(
    new THREE.BoxGeometry(0.024, 0.018, 0.028),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.32 }),
  );
  wiperKnob.position.y = 0.009;
  wiperKnob.castShadow = true;
  wiperKnob.userData = { isRheostatWiper: true };
  wiperGroup.add(wiperKnob);

  g.add(wiperGroup);

  // Đế phụ ở giữa cho cọc RHEO_COIL_END (cuối cuộn dây)
  const midBracket = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.014, 0.036), legMat);
  midBracket.position.set(0, 0.007, 0.016);
  g.add(midBracket);

  // 3 Cọc cắm theo đúng nguyên lý:
  // 1) RHEO_IN (Đỏ - đầu cuộn dây, bên trái)
  g.add(createBananaTerminalSocket('RHEO_IN', 'RHEO_IN', 0xd92626, -0.068, 0.014, 0.024));
  // 2) RHEO_COIL_END (Xanh giữa - cuối cuộn dây)
  g.add(
    createBananaTerminalSocket('RHEO_COIL_END', 'COIL_END', 0x1d4ed8, 0.0, 0.014, 0.024),
  );
  // 3) RHEO_WIPER (Xanh phải - nối với thanh con chạy)
  g.add(createBananaTerminalSocket('RHEO_WIPER', 'WIPER', 0x1d4ed8, 0.068, 0.056, 0.0));

  return g;
}

/**
 * Đồng hồ Ampe kế DC ('A') hoặc Vôn kế DC ('V')
 */
export function buildDcAnalogMeterModel(type: 'A' | 'V'): THREE.Group {
  const g = new THREE.Group();
  g.name = type === 'A' ? 'dc_ammeter' : 'dc_voltmeter';

  const whitePlastic = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.26,
    metalness: 0.05,
  });

  // Đế trước chứa 3 cọc cắm
  const frontDeck = new THREE.Mesh(new THREE.BoxGeometry(0.112, 0.02, 0.048), whitePlastic);
  frontDeck.position.set(0, 0.01, 0.038);
  frontDeck.castShadow = true;
  frontDeck.receiveShadow = true;
  g.add(frontDeck);

  // Dải màu phân biệt: Xanh lá cho Ampe kế, Xanh dương cho Vôn kế
  const stripColor = type === 'A' ? 0x10b981 : 0x0284c7;
  const colorStrip = new THREE.Mesh(
    new THREE.BoxGeometry(0.104, 0.002, 0.024),
    new THREE.MeshStandardMaterial({ color: stripColor, roughness: 0.35 }),
  );
  colorStrip.position.set(0, 0.0205, 0.046);
  g.add(colorStrip);

  // Thân đồng hồ mặt nghiêng
  const rearHousing = new THREE.Mesh(new THREE.BoxGeometry(0.112, 0.088, 0.072), whitePlastic);
  rearHousing.position.set(0, 0.044, -0.016);
  rearHousing.rotation.x = -0.32;
  rearHousing.castShadow = true;
  g.add(rearHousing);

  // Mặt chia độ
  const dialFace = new THREE.Mesh(
    new THREE.PlaneGeometry(0.098, 0.066),
    new THREE.MeshBasicMaterial({ map: drawMeterDialCanvas(type) }),
  );
  dialFace.position.set(0, 0.056, 0.019);
  dialFace.rotation.x = -0.32;
  g.add(dialFace);

  // Kim đồng hồ (node 'plunger') xoay quanh tâm dưới mặt chia độ
  const needleGroup = new THREE.Group();
  needleGroup.position.set(0, 0.032, 0.028);
  needleGroup.rotation.x = -0.32;

  const needlePivot = new THREE.Group();
  needlePivot.name = 'plunger';
  // Mặc định chỉ vạch 0 (+0.70 rad)
  needlePivot.rotation.z = 0.70;

  const needlePointer = new THREE.Mesh(
    new THREE.ConeGeometry(0.0016, 0.046, 8),
    new THREE.MeshBasicMaterial({ color: 0xdc2626 }),
  );
  needlePointer.position.set(0, 0.022, 0.001);
  needlePivot.add(needlePointer);

  needleGroup.add(needlePivot);
  g.add(needleGroup);

  // Mặt kính bảo vệ trong suốt
  const glassCover = new THREE.Mesh(
    new THREE.PlaneGeometry(0.102, 0.07),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.18,
      roughness: 0.06,
    }),
  );
  glassCover.position.set(0, 0.057, 0.022);
  glassCover.rotation.x = -0.32;
  g.add(glassCover);

  // 3 cọc cắm trên dải màu
  if (type === 'A') {
    g.add(createBananaTerminalSocket('AM_NEG', 'AM -', 0x1e242b, -0.036, 0.02, 0.046));
    g.add(createBananaTerminalSocket('AM_06A', '0.6A', 0xd92626, 0.0, 0.02, 0.046));
    g.add(createBananaTerminalSocket('AM_3A', '3A', 0xd92626, 0.036, 0.02, 0.046));
  } else {
    g.add(createBananaTerminalSocket('VM_NEG', 'VM -', 0x1e242b, -0.036, 0.02, 0.046));
    g.add(createBananaTerminalSocket('VM_6V', '6V', 0xd92626, 0.0, 0.02, 0.046));
    g.add(createBananaTerminalSocket('VM_12V', '12V', 0xd92626, 0.036, 0.02, 0.046));
  }

  return g;
}

/**
 * Tạo dây cắm bắp chuối 3D nối giữa 2 điểm thế giới (pStart -> pEnd)
 */
export function build3DBananaWireBetweenPoints(
  wireId: string,
  pStart: THREE.Vector3,
  pEnd: THREE.Vector3,
  colorHex: number,
  arcLift = 0.055,
): THREE.Group {
  const g = new THREE.Group();
  g.name = `banana_wire_${wireId}`;
  g.userData = {
    isCircuitWire: true,
    wireId,
  };

  const bootMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: 0.32,
    metalness: 0.1,
  });
  const pinMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.2,
    metalness: 0.9,
  });

  [pStart, pEnd].forEach((pt) => {
    const plug = new THREE.Group();
    plug.position.copy(pt);
    plug.userData = g.userData;

    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.01, 12), pinMat);
    pin.position.y = 0.008;
    pin.userData = g.userData;
    plug.add(pin);

    const boot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0044, 0.0036, 0.018, 16),
      bootMat,
    );
    boot.position.y = 0.02;
    boot.castShadow = true;
    boot.userData = g.userData;
    plug.add(boot);

    g.add(plug);
  });

  const sTop = pStart.clone().add(new THREE.Vector3(0, 0.028, 0));
  const eTop = pEnd.clone().add(new THREE.Vector3(0, 0.028, 0));
  const dist = sTop.distanceTo(eTop);
  const mid = sTop.clone().lerp(eTop, 0.5);
  mid.y += Math.max(0.03, Math.min(0.12, dist * 0.25 + arcLift * 0.5));

  const ctrl1 = sTop.clone().lerp(mid, 0.45);
  ctrl1.y += 0.025;
  const ctrl2 = eTop.clone().lerp(mid, 0.45);
  ctrl2.y += 0.025;

  const curve = new THREE.CatmullRomCurve3([sTop, ctrl1, mid, ctrl2, eTop]);
  const cableGeo = new THREE.TubeGeometry(curve, 36, 0.0026, 10, false);
  const cableMesh = new THREE.Mesh(
    cableGeo,
    new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.36,
      metalness: 0.08,
    }),
  );
  cableMesh.castShadow = true;
  cableMesh.userData = g.userData;
  g.add(cableMesh);

  return g;
}

/**
 * Cập nhật trạng thái động 3D cho các thiết bị Mạch điện DC
 */
export function applyDcCircuitInstanceStateToObject3D(
  instanceRoot: THREE.Object3D,
  instance: SceneInstance,
  arch: string,
): void {
  if (arch === 'dc-battery-holder') {
    const slot1Mesh = instanceRoot.getObjectByName('battery_slot_1_mesh');
    const slot2Mesh = instanceRoot.getObjectByName('battery_slot_2_mesh');
    if (slot1Mesh) {
      slot1Mesh.visible = instance.instanceState.slot1Inserted !== false;
      slot1Mesh.rotation.y = instance.instanceState.slot1Reversed ? Math.PI : 0;
    }
    if (slot2Mesh) {
      slot2Mesh.visible = instance.instanceState.slot2Inserted !== false;
      // Mặc định khay 2 xoay Math.PI (BAT2_NEG trên, BAT2_POS dưới); nếu đảo cực thì xoay 0
      slot2Mesh.rotation.y = instance.instanceState.slot2Reversed ? 0 : Math.PI;
    }
  } else if (arch === 'dc-knife-switch') {
    const bladePivot = instanceRoot.getObjectByName('switch_blade_pivot');
    if (bladePivot) {
      const isClosed = Boolean(instance.instanceState.switchClosed);
      bladePivot.rotation.z = isClosed ? -0.03 : -0.68;
    }
  } else if (arch === 'dc-rheostat-20') {
    const wiper = instanceRoot.getObjectByName('plunger');
    if (wiper) {
      const ratio = THREE.MathUtils.clamp(
        typeof instance.instanceState.sliderRatio === 'number'
          ? instance.instanceState.sliderRatio
          : 0.4,
        0,
        1,
      );
      wiper.position.x = -0.052 + ratio * 0.104;
    }
  } else if (arch === 'dc-light-bulb-126') {
    const powerW = instance.instanceState.bulbPowerW ?? 0;
    const glowRatio = THREE.MathUtils.clamp(powerW / 0.85, 0, 2.2);

    const filament = instanceRoot.getObjectByName('bulb_filament') as THREE.Mesh | undefined;
    if (filament && filament.material instanceof THREE.MeshStandardMaterial) {
      filament.material.emissiveIntensity = glowRatio * 3.8;
    }

    const glassGlobe = instanceRoot.getObjectByName('bulb_glass_globe') as THREE.Mesh | undefined;
    if (glassGlobe && glassGlobe.material instanceof THREE.MeshPhysicalMaterial) {
      glassGlobe.material.emissiveIntensity = glowRatio * 0.95;
    }

    const pointLight = instanceRoot.getObjectByName('bulb_point_light') as
      | THREE.PointLight
      | undefined;
    if (pointLight) {
      pointLight.intensity = glowRatio * 2.4;
    }
  } else if (arch === 'dc-ammeter') {
    const needle = instanceRoot.getObjectByName('plunger');
    if (needle) {
      const angle =
        typeof instance.instanceState.ammeterNeedleAngleRad === 'number'
          ? instance.instanceState.ammeterNeedleAngleRad
          : 0.70;
      needle.rotation.z = angle;
    }
  } else if (arch === 'dc-voltmeter') {
    const needle = instanceRoot.getObjectByName('plunger');
    if (needle) {
      const angle =
        typeof instance.instanceState.voltmeterNeedleAngleRad === 'number'
          ? instance.instanceState.voltmeterNeedleAngleRad
          : 0.70;
      needle.rotation.z = angle;
    }
  }
}
