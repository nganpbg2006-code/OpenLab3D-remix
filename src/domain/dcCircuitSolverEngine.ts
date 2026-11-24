import { SceneInstance as SceneEquipmentInstance } from './types';

export type CircuitTerminalId =
  | 'BAT1_POS'
  | 'BAT1_NEG'
  | 'BAT2_NEG'
  | 'BAT2_POS'
  | 'SW_RED'
  | 'SW_GREEN'
  | 'BULB_NEG'
  | 'BULB_POS'
  | 'RHEO_IN'
  | 'RHEO_COIL_END'
  | 'RHEO_WIPER'
  | 'AM_NEG'
  | 'AM_06A'
  | 'AM_3A'
  | 'VM_NEG'
  | 'VM_6V'
  | 'VM_12V';

export interface CircuitTerminalDefinition {
  id: CircuitTerminalId;
  labelVi: string;
  shortLabel: string;
  colorHex: number;
  deviceArchetype:
    | 'dc-battery-holder'
    | 'dc-knife-switch'
    | 'dc-light-bulb-126'
    | 'dc-rheostat-20'
    | 'dc-ammeter'
    | 'dc-voltmeter';
  localPos: [number, number, number];
}

export interface CircuitWireConnection {
  id: string;
  fromInstanceId: string;
  fromTerminalId: CircuitTerminalId;
  toInstanceId: string;
  toTerminalId: CircuitTerminalId;
  colorHex: number;
}

export type CircuitDiagnosticCaseId = 1 | 2 | 3 | 4 | 5 | 6;

export interface DcCircuitDeviceCalculatedState {
  instanceId: string;
  archetype: string;
  ammeterReadingA?: number;
  ammeterRangeMaxA?: number;
  ammeterNeedleAngleRad?: number;
  voltmeterReadingV?: number;
  voltmeterRangeMaxV?: number;
  voltmeterNeedleAngleRad?: number;
  bulbCurrentA?: number;
  bulbVoltageV?: number;
  bulbPowerW?: number;
  rheostatEffectiveOhm?: number;
}

export interface DcCircuitSolverResult {
  caseId: CircuitDiagnosticCaseId;
  statusSeverity: 'open' | 'normal' | 'warning' | 'danger';
  isCircuitClosed: boolean;
  isShortCircuit: boolean;
  sourceVoltageV: number;
  totalCurrentA: number;
  equivalentResistanceOhm: number;
  bulbCurrentA: number;
  bulbVoltageV: number;
  bulbPowerW: number;
  rheostatEffectiveOhm: number;
  ammeterReadingA: number;
  ammeterRangeMaxA: number;
  ammeterNeedleAngleRad: number;
  voltmeterReadingV: number;
  voltmeterRangeMaxV: number;
  voltmeterNeedleAngleRad: number;
  warningTitleVi: string;
  warningMessageVi: string;
  deviceStates: Record<string, DcCircuitDeviceCalculatedState>;
}

export const CIRCUIT_TERMINAL_DEFINITIONS: Record<CircuitTerminalId, CircuitTerminalDefinition> = {
  // Giá đỡ pin (Battery Holder): 2 khay (SLOT_1, SLOT_2) & 4 cọc ở 4 góc
  BAT1_POS: {
    id: 'BAT1_POS',
    labelVi: 'Khay 1 Dương (+ Đỏ, Trái-Trên)',
    shortLabel: 'BAT1+ (Đỏ)',
    colorHex: 0xd92626,
    deviceArchetype: 'dc-battery-holder',
    localPos: [-0.04, 0.025, -0.028],
  },
  BAT1_NEG: {
    id: 'BAT1_NEG',
    labelVi: 'Khay 1 Âm (- Đen, Trái-Dưới)',
    shortLabel: 'BAT1- (Đen)',
    colorHex: 0x1e242b,
    deviceArchetype: 'dc-battery-holder',
    localPos: [-0.04, 0.025, 0.028],
  },
  BAT2_NEG: {
    id: 'BAT2_NEG',
    labelVi: 'Khay 2 Âm (- Đen, Phải-Trên)',
    shortLabel: 'BAT2- (Đen)',
    colorHex: 0x1e242b,
    deviceArchetype: 'dc-battery-holder',
    localPos: [0.04, 0.025, -0.028],
  },
  BAT2_POS: {
    id: 'BAT2_POS',
    labelVi: 'Khay 2 Dương (+ Đỏ, Phải-Dưới)',
    shortLabel: 'BAT2+ (Đỏ)',
    colorHex: 0xd92626,
    deviceArchetype: 'dc-battery-holder',
    localPos: [0.04, 0.025, 0.028],
  },

  // Cầu dao K (Switch): 2 cọc SW_RED (Đỏ) và SW_GREEN (Xanh lá)
  SW_RED: {
    id: 'SW_RED',
    labelVi: 'Cọc Cầu dao Đỏ (SW_RED)',
    shortLabel: 'SW_RED',
    colorHex: 0xd92626,
    deviceArchetype: 'dc-knife-switch',
    localPos: [-0.036, 0.014, 0],
  },
  SW_GREEN: {
    id: 'SW_GREEN',
    labelVi: 'Cọc Cầu dao Xanh lá (SW_GREEN)',
    shortLabel: 'SW_GREEN',
    colorHex: 0x16a34a,
    deviceArchetype: 'dc-knife-switch',
    localPos: [0.036, 0.014, 0],
  },

  // Bóng đèn 126 (Bulb): 2 cọc BULB_NEG (Đen, trái) và BULB_POS (Đỏ, phải), R_bulb = 8.5Ω
  BULB_NEG: {
    id: 'BULB_NEG',
    labelVi: 'Cọc Đèn Âm (- Đen, Trái)',
    shortLabel: 'BULB- (Đen)',
    colorHex: 0x1e242b,
    deviceArchetype: 'dc-light-bulb-126',
    localPos: [-0.036, 0.014, 0],
  },
  BULB_POS: {
    id: 'BULB_POS',
    labelVi: 'Cọc Đèn Dương (+ Đỏ, Phải)',
    shortLabel: 'BULB+ (Đỏ)',
    colorHex: 0xd92626,
    deviceArchetype: 'dc-light-bulb-126',
    localPos: [0.036, 0.014, 0],
  },

  // Biến trở con chạy 20Ω (Rheostat): 3 cọc RHEO_IN (Đỏ), RHEO_COIL_END (Xanh giữa), RHEO_WIPER (Xanh phải)
  RHEO_IN: {
    id: 'RHEO_IN',
    labelVi: 'Cọc Biến trở Đầu cuộn dây (RHEO_IN - Đỏ)',
    shortLabel: 'RHEO_IN (Đỏ)',
    colorHex: 0xd92626,
    deviceArchetype: 'dc-rheostat-20',
    localPos: [-0.068, 0.014, 0.024],
  },
  RHEO_COIL_END: {
    id: 'RHEO_COIL_END',
    labelVi: 'Cọc Biến trở Cuối cuộn dây (RHEO_COIL_END - Xanh giữa)',
    shortLabel: 'RHEO_END (Xanh)',
    colorHex: 0x1d4ed8,
    deviceArchetype: 'dc-rheostat-20',
    localPos: [0.0, 0.014, 0.024],
  },
  RHEO_WIPER: {
    id: 'RHEO_WIPER',
    labelVi: 'Cọc Biến trở Con chạy (RHEO_WIPER - Xanh phải)',
    shortLabel: 'RHEO_WIPER (C.Chạy)',
    colorHex: 0x1d4ed8,
    deviceArchetype: 'dc-rheostat-20',
    localPos: [0.068, 0.056, 0.0],
  },

  // Ampe kế DC (Ammeter): 3 cọc trên dải xanh lá: AM_NEG ('-'), AM_06A ('0.6A'), AM_3A ('3A'), R_A = 0.05Ω
  AM_NEG: {
    id: 'AM_NEG',
    labelVi: 'Ampe kế Cọc Âm (- Đen)',
    shortLabel: 'AM - (Đen)',
    colorHex: 0x1e242b,
    deviceArchetype: 'dc-ammeter',
    localPos: [-0.036, 0.02, 0.052],
  },
  AM_06A: {
    id: 'AM_06A',
    labelVi: 'Ampe kế Thang 0.6A (+ Đỏ)',
    shortLabel: 'AM 0.6A (Đỏ)',
    colorHex: 0xd92626,
    deviceArchetype: 'dc-ammeter',
    localPos: [0.0, 0.02, 0.052],
  },
  AM_3A: {
    id: 'AM_3A',
    labelVi: 'Ampe kế Thang 3A (+ Đỏ)',
    shortLabel: 'AM 3A (Đỏ)',
    colorHex: 0xd92626,
    deviceArchetype: 'dc-ammeter',
    localPos: [0.036, 0.02, 0.052],
  },

  // Vôn kế DC (Voltmeter): 3 cọc trên dải xanh dương: VM_NEG ('-'), VM_6V ('6V'), VM_12V ('12V'), R_V = 10000Ω
  VM_NEG: {
    id: 'VM_NEG',
    labelVi: 'Vôn kế Cọc Âm (- Đen)',
    shortLabel: 'VM - (Đen)',
    colorHex: 0x1e242b,
    deviceArchetype: 'dc-voltmeter',
    localPos: [-0.036, 0.02, 0.052],
  },
  VM_6V: {
    id: 'VM_6V',
    labelVi: 'Vôn kế Thang 6V (+ Đỏ)',
    shortLabel: 'VM 6V (Đỏ)',
    colorHex: 0xd92626,
    deviceArchetype: 'dc-voltmeter',
    localPos: [0.0, 0.02, 0.052],
  },
  VM_12V: {
    id: 'VM_12V',
    labelVi: 'Vôn kế Thang 12V (+ Đỏ)',
    shortLabel: 'VM 12V (Đỏ)',
    colorHex: 0xd92626,
    deviceArchetype: 'dc-voltmeter',
    localPos: [0.036, 0.02, 0.052],
  },
};

export function getDeviceTerminalsByArchetype(archetype?: string): CircuitTerminalDefinition[] {
  if (!archetype) return [];
  return Object.values(CIRCUIT_TERMINAL_DEFINITIONS).filter(
    (def) => def.deviceArchetype === archetype,
  );
}

const R_BULB_OHM = 8.5;
const R_AMMETER_OHM = 0.05;
const R_VOLTMETER_OHM = 10000.0;
const R_RHEOSTAT_MAX_OHM = 20.0;
const R_BATTERY_CELL_INTERNAL_OHM = 0.25;

// Góc quay kim đồng hồ:
// Vạch 0 nằm ở góc +0.70 rad (bên trái), kịch khung phải ở -0.70 rad.
// Nếu phân cực ngược, kim lệch sang trái vạch 0 tới +0.92 rad.
export function computeMeterNeedleAngle(readingAbs: number, maxRange: number, isReversed: boolean): number {
  const zeroAngle = 0.70;
  const fullScaleAngle = -0.70;
  if (isReversed && readingAbs > 0.005) {
    const revRatio = Math.min(1, readingAbs / (maxRange * 0.25));
    return zeroAngle + revRatio * 0.22; // Lệch trái vạch 0
  }
  const ratio = Math.max(0, Math.min(1.06, readingAbs / Math.max(0.001, maxRange)));
  return zeroAngle + ratio * (fullScaleAngle - zeroAngle);
}

interface DisjointSet {
  parent: Map<string, string>;
  find: (x: string) => string;
  union: (a: string, b: string) => void;
}

function createDisjointSet(): DisjointSet {
  const parent = new Map<string, string>();
  const find = (x: string): string => {
    if (!parent.has(x)) {
      parent.set(x, x);
      return x;
    }
    const p = parent.get(x)!;
    if (p !== x) {
      const root = find(p);
      parent.set(x, root);
      return root;
    }
    return x;
  };
  const union = (a: string, b: string) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) {
      parent.set(ra, rb);
    }
  };
  return { parent, find, union };
}

function solveLinearSystem(A: number[][], b: number[]): number[] | null {
  const n = b.length;
  if (n === 0) return [];
  const M = A.map((row, idx) => [...row, b[idx]]);

  for (let col = 0; col < n; col++) {
    let maxRow = col;
    let maxVal = Math.abs(M[col][col]);
    for (let row = col + 1; row < n; row++) {
      const val = Math.abs(M[row][col]);
      if (val > maxVal) {
        maxVal = val;
        maxRow = row;
      }
    }
    if (maxVal < 1e-12) {
      return null;
    }
    if (maxRow !== col) {
      const tmp = M[col];
      M[col] = M[maxRow];
      M[maxRow] = tmp;
    }
    const pivot = M[col][col];
    for (let j = col; j <= n; j++) {
      M[col][j] /= pivot;
    }
    for (let row = 0; row < n; row++) {
      if (row !== col) {
        const factor = M[row][col];
        if (Math.abs(factor) > 1e-15) {
          for (let j = col; j <= n; j++) {
            M[row][j] -= factor * M[col][j];
          }
        }
      }
    }
  }

  return M.map((row) => row[n]);
}

interface ResistiveElement {
  id: string;
  instanceId: string;
  kind: 'battery_tray_1' | 'battery_tray_2' | 'bulb' | 'rheostat' | 'ammeter' | 'voltmeter';
  nodePos: string; // Cực chuẩn Dương (+) hoặc đầu vào
  nodeNeg: string; // Cực chuẩn Âm (-) hoặc đầu ra
  resistanceOhm: number;
  emfVolts: number; // > 0 cho khay pin
  rangeMax?: number;
}

export function solveDcCircuitGraph(
  instances: SceneEquipmentInstance[],
  wires: CircuitWireConnection[],
  archetypeLookup: (instance: SceneEquipmentInstance) => string | undefined,
): DcCircuitSolverResult {
  const deviceStates: Record<string, DcCircuitDeviceCalculatedState> = {};

  // Khởi tạo trạng thái mặc định cho tất cả thiết bị điện trên bàn
  for (const inst of instances) {
    const arch = archetypeLookup(inst) ?? '';
    const sliderRatio =
      typeof inst.instanceState.sliderRatio === 'number' ? inst.instanceState.sliderRatio : 0.4;
    deviceStates[inst.instanceId] = {
      instanceId: inst.instanceId,
      archetype: arch,
      ammeterReadingA: 0,
      ammeterRangeMaxA: 0.6,
      ammeterNeedleAngleRad: computeMeterNeedleAngle(0, 0.6, false),
      voltmeterReadingV: 0,
      voltmeterRangeMaxV: 6.0,
      voltmeterNeedleAngleRad: computeMeterNeedleAngle(0, 6.0, false),
      bulbCurrentA: 0,
      bulbVoltageV: 0,
      bulbPowerW: 0,
      rheostatEffectiveOhm: Number((sliderRatio * R_RHEOSTAT_MAX_OHM).toFixed(2)),
    };
  }

  if (wires.length === 0) {
    return {
      caseId: 1,
      statusSeverity: 'open',
      isCircuitClosed: false,
      isShortCircuit: false,
      sourceVoltageV: 0,
      totalCurrentA: 0,
      equivalentResistanceOhm: Infinity,
      bulbCurrentA: 0,
      bulbVoltageV: 0,
      bulbPowerW: 0,
      rheostatEffectiveOhm: 8.0,
      ammeterReadingA: 0,
      ammeterRangeMaxA: 0.6,
      ammeterNeedleAngleRad: computeMeterNeedleAngle(0, 0.6, false),
      voltmeterReadingV: 0,
      voltmeterRangeMaxV: 6.0,
      voltmeterNeedleAngleRad: computeMeterNeedleAngle(0, 6.0, false),
      warningTitleVi: 'Trường hợp 1: Mạch hở (Chưa nối dây)',
      warningMessageVi:
        'Mạch điện đang hở (I = 0A). Hãy nhấp vào các cọc cắm trên thiết bị để nối dây bắp chuối tạo thành mạch kín.',
      deviceStates,
    };
  }

  // Đếm số dây cắm vào từng cọc (terminalKey = `${instanceId}:${terminalId}`)
  const terminalWireCount = new Map<string, number>();
  const dsu = createDisjointSet();

  const makeKey = (instanceId: string, terminalId: CircuitTerminalId) =>
    `${instanceId}:${terminalId}`;

  for (const w of wires) {
    const kA = makeKey(w.fromInstanceId, w.fromTerminalId);
    const kB = makeKey(w.toInstanceId, w.toTerminalId);
    terminalWireCount.set(kA, (terminalWireCount.get(kA) ?? 0) + 1);
    terminalWireCount.set(kB, (terminalWireCount.get(kB) ?? 0) + 1);
    dsu.union(kA, kB);
  }

  const hasWireAt = (instanceId: string, terminalId: CircuitTerminalId) =>
    (terminalWireCount.get(makeKey(instanceId, terminalId)) ?? 0) > 0;

  // Kiểm tra Cầu dao K: nếu đóng (switchClosed === true) thì nối liền SW_RED và SW_GREEN
  let anySwitchOpenInWiredCircuit = false;
  let anySwitchBypassed = false;

  for (const inst of instances) {
    const arch = archetypeLookup(inst);
    if (arch === 'dc-knife-switch') {
      const redCount = terminalWireCount.get(makeKey(inst.instanceId, 'SW_RED')) ?? 0;
      const greenCount = terminalWireCount.get(makeKey(inst.instanceId, 'SW_GREEN')) ?? 0;
      const isClosed = Boolean(inst.instanceState.switchClosed);
      if ((redCount >= 2 && greenCount === 0) || (greenCount >= 2 && redCount === 0)) {
        anySwitchBypassed = true;
      }
      if (isClosed) {
        dsu.union(makeKey(inst.instanceId, 'SW_RED'), makeKey(inst.instanceId, 'SW_GREEN'));
      } else if (redCount > 0 && greenCount > 0) {
        anySwitchOpenInWiredCircuit = true;
      }
    }
  }

  // Kiểm tra lỗi cắm sai cọc thang đo trên Ampe kế / Vôn kế (Trường hợp 5a: cắm vào cả 2 cọc dương đỏ mà bỏ trống cọc âm '-')
  let wrongDualPositiveMeterError: string | null = null;
  // Kiểm tra lỗi Bóng đèn cắm 2 dây vào cùng 1 cọc mà bỏ trống cọc kia
  let bulbSingleTerminalBypassWarning: string | null = null;

  const elements: ResistiveElement[] = [];
  let totalConfiguredBatteryEmf = 0;
  let anyBatteryTrayEmptyOrMissingBridge = false;
  let unbridgedDualTrayWarning = false;

  for (const inst of instances) {
    const arch = archetypeLookup(inst);
    if (!arch) continue;

    if (arch === 'dc-battery-holder') {
      const slot1Inserted = inst.instanceState.slot1Inserted !== false; // mặc định có pin nếu đặt sẵn, hoặc theo state
      const slot2Inserted = inst.instanceState.slot2Inserted !== false;
      const slot1Rev = Boolean(inst.instanceState.slot1Reversed);
      const slot2Rev = Boolean(inst.instanceState.slot2Reversed);

      const tray1Wired =
        hasWireAt(inst.instanceId, 'BAT1_POS') || hasWireAt(inst.instanceId, 'BAT1_NEG');
      const tray2Wired =
        hasWireAt(inst.instanceId, 'BAT2_POS') || hasWireAt(inst.instanceId, 'BAT2_NEG');

      // Kiểm tra cầu nối giữa 2 khay: BAT1_NEG có nối với BAT2_POS (hoặc kết nối giữa khay 1 và khay 2) không?
      const k1Pos = makeKey(inst.instanceId, 'BAT1_POS');
      const k1Neg = makeKey(inst.instanceId, 'BAT1_NEG');
      const k2Neg = makeKey(inst.instanceId, 'BAT2_NEG');
      const k2Pos = makeKey(inst.instanceId, 'BAT2_POS');

      if (slot1Inserted) {
        const emf1 = slot1Rev ? -1.5 : 1.5;
        totalConfiguredBatteryEmf += Math.abs(emf1);
        elements.push({
          id: `${inst.instanceId}_tray1`,
          instanceId: inst.instanceId,
          kind: 'battery_tray_1',
          nodePos: dsu.find(k1Pos),
          nodeNeg: dsu.find(k1Neg),
          resistanceOhm: R_BATTERY_CELL_INTERNAL_OHM,
          emfVolts: emf1,
        });
      } else if (tray1Wired) {
        anyBatteryTrayEmptyOrMissingBridge = true;
      }

      if (slot2Inserted) {
        const emf2 = slot2Rev ? -1.5 : 1.5;
        totalConfiguredBatteryEmf += Math.abs(emf2);
        elements.push({
          id: `${inst.instanceId}_tray2`,
          instanceId: inst.instanceId,
          kind: 'battery_tray_2',
          nodePos: dsu.find(k2Pos),
          nodeNeg: dsu.find(k2Neg),
          resistanceOhm: R_BATTERY_CELL_INTERNAL_OHM,
          emfVolts: emf2,
        });
      } else if (tray2Wired) {
        anyBatteryTrayEmptyOrMissingBridge = true;
      }

      // Kiểm tra nếu người dùng cắm dây mạch ngoài vào cả 2 khay nhưng chưa nối cầu giữa 2 khay (BAT1_NEG sang BAT2_POS)
      if (tray1Wired && tray2Wired) {
        const bridgeConnected =
          dsu.find(k1Neg) === dsu.find(k2Pos) || dsu.find(k1Pos) === dsu.find(k2Neg);
        if (!bridgeConnected) {
          unbridgedDualTrayWarning = true;
        }
      }
    } else if (arch === 'dc-light-bulb-126') {
      const negCount = terminalWireCount.get(makeKey(inst.instanceId, 'BULB_NEG')) ?? 0;
      const posCount = terminalWireCount.get(makeKey(inst.instanceId, 'BULB_POS')) ?? 0;
      if ((negCount >= 2 && posCount === 0) || (posCount >= 2 && negCount === 0)) {
        bulbSingleTerminalBypassWarning =
          'SAI: Cắm cả 2 dây vào cùng 1 cọc của bóng đèn làm dòng điện đi tắt, bóng đèn không sáng!';
      }
      if (negCount > 0 && posCount > 0) {
        elements.push({
          id: `${inst.instanceId}_bulb`,
          instanceId: inst.instanceId,
          kind: 'bulb',
          nodePos: dsu.find(makeKey(inst.instanceId, 'BULB_POS')),
          nodeNeg: dsu.find(makeKey(inst.instanceId, 'BULB_NEG')),
          resistanceOhm: R_BULB_OHM,
          emfVolts: 0,
        });
      }
    } else if (arch === 'dc-rheostat-20') {
      const hasIn = hasWireAt(inst.instanceId, 'RHEO_IN');
      const hasEnd = hasWireAt(inst.instanceId, 'RHEO_COIL_END');
      const hasWiper = hasWireAt(inst.instanceId, 'RHEO_WIPER');
      const sliderRatio = Math.max(
        0.02,
        Math.min(
          1,
          typeof inst.instanceState.sliderRatio === 'number' ? inst.instanceState.sliderRatio : 0.4,
        ),
      );

      if (hasIn && hasWiper) {
        const rEff = Math.max(0.4, sliderRatio * R_RHEOSTAT_MAX_OHM);
        deviceStates[inst.instanceId].rheostatEffectiveOhm = Number(rEff.toFixed(2));
        elements.push({
          id: `${inst.instanceId}_rheo`,
          instanceId: inst.instanceId,
          kind: 'rheostat',
          nodePos: dsu.find(makeKey(inst.instanceId, 'RHEO_IN')),
          nodeNeg: dsu.find(makeKey(inst.instanceId, 'RHEO_WIPER')),
          resistanceOhm: rEff,
          emfVolts: 0,
        });
      } else if (hasIn && hasEnd) {
        // Nối qua RHEO_IN và RHEO_COIL_END: Điện trở cố định 20Ω (kéo con chạy không tác dụng)
        deviceStates[inst.instanceId].rheostatEffectiveOhm = R_RHEOSTAT_MAX_OHM;
        elements.push({
          id: `${inst.instanceId}_rheo`,
          instanceId: inst.instanceId,
          kind: 'rheostat',
          nodePos: dsu.find(makeKey(inst.instanceId, 'RHEO_IN')),
          nodeNeg: dsu.find(makeKey(inst.instanceId, 'RHEO_COIL_END')),
          resistanceOhm: R_RHEOSTAT_MAX_OHM,
          emfVolts: 0,
        });
      } else if (hasEnd && hasWiper) {
        const rEff = Math.max(0.4, (1 - sliderRatio) * R_RHEOSTAT_MAX_OHM);
        deviceStates[inst.instanceId].rheostatEffectiveOhm = Number(rEff.toFixed(2));
        elements.push({
          id: `${inst.instanceId}_rheo`,
          instanceId: inst.instanceId,
          kind: 'rheostat',
          nodePos: dsu.find(makeKey(inst.instanceId, 'RHEO_COIL_END')),
          nodeNeg: dsu.find(makeKey(inst.instanceId, 'RHEO_WIPER')),
          resistanceOhm: rEff,
          emfVolts: 0,
        });
      }
    } else if (arch === 'dc-ammeter') {
      const hasNeg = hasWireAt(inst.instanceId, 'AM_NEG');
      const has06 = hasWireAt(inst.instanceId, 'AM_06A');
      const has3 = hasWireAt(inst.instanceId, 'AM_3A');

      if (!hasNeg && has06 && has3) {
        wrongDualPositiveMeterError =
          'SAI: Phải sử dụng 1 cọc âm (-) và 1 cọc dương (+)! Bạn đang cắm cả 2 dây vào 2 cọc dương (0.6A và 3A) của Ampe kế mà bỏ trống cọc âm (-).';
      } else if (hasNeg && (has06 || has3)) {
        const activePosTerm: CircuitTerminalId = has3 ? 'AM_3A' : 'AM_06A';
        const rangeMax = has3 ? 3.0 : 0.6;
        deviceStates[inst.instanceId].ammeterRangeMaxA = rangeMax;
        elements.push({
          id: `${inst.instanceId}_ammeter`,
          instanceId: inst.instanceId,
          kind: 'ammeter',
          nodePos: dsu.find(makeKey(inst.instanceId, activePosTerm)),
          nodeNeg: dsu.find(makeKey(inst.instanceId, 'AM_NEG')),
          resistanceOhm: R_AMMETER_OHM,
          emfVolts: 0,
          rangeMax,
        });
      }
    } else if (arch === 'dc-voltmeter') {
      const hasNeg = hasWireAt(inst.instanceId, 'VM_NEG');
      const has6 = hasWireAt(inst.instanceId, 'VM_6V');
      const has12 = hasWireAt(inst.instanceId, 'VM_12V');

      if (!hasNeg && has6 && has12) {
        wrongDualPositiveMeterError =
          'SAI: Phải sử dụng 1 cọc âm (-) và 1 cọc dương (+)! Bạn đang cắm cả 2 dây vào 2 cọc dương (6V và 12V) của Vôn kế mà bỏ trống cọc âm (-).';
      } else if (hasNeg && (has6 || has12)) {
        const activePosTerm: CircuitTerminalId = has12 ? 'VM_12V' : 'VM_6V';
        const rangeMax = has12 ? 12.0 : 6.0;
        deviceStates[inst.instanceId].voltmeterRangeMaxV = rangeMax;
        elements.push({
          id: `${inst.instanceId}_voltmeter`,
          instanceId: inst.instanceId,
          kind: 'voltmeter',
          nodePos: dsu.find(makeKey(inst.instanceId, activePosTerm)),
          nodeNeg: dsu.find(makeKey(inst.instanceId, 'VM_NEG')),
          resistanceOhm: R_VOLTMETER_OHM,
          emfVolts: 0,
          rangeMax,
        });
      }
    }
  }

  // Trường hợp 5a: Cắm vào 2 cọc đỏ bỏ trống cọc âm (-)
  if (wrongDualPositiveMeterError) {
    return {
      caseId: 5,
      statusSeverity: 'warning',
      isCircuitClosed: false,
      isShortCircuit: false,
      sourceVoltageV: totalConfiguredBatteryEmf,
      totalCurrentA: 0,
      equivalentResistanceOhm: Infinity,
      bulbCurrentA: 0,
      bulbVoltageV: 0,
      bulbPowerW: 0,
      rheostatEffectiveOhm: 8.0,
      ammeterReadingA: 0,
      ammeterRangeMaxA: 0.6,
      ammeterNeedleAngleRad: computeMeterNeedleAngle(0, 0.6, false),
      voltmeterReadingV: 0,
      voltmeterRangeMaxV: 6.0,
      voltmeterNeedleAngleRad: computeMeterNeedleAngle(0, 6.0, false),
      warningTitleVi: 'Trường hợp 5: Cắm sai cọc thang đo',
      warningMessageVi: 'SAI: Phải sử dụng 1 cọc âm (-) và 1 cọc dương (+)!',
      deviceStates,
    };
  }

  // Tìm các nguồn pin đang tham gia vào mạch
  const batteryElements = elements.filter(
    (e) => e.kind === 'battery_tray_1' || e.kind === 'battery_tray_2',
  );

  if (batteryElements.length === 0 || anyBatteryTrayEmptyOrMissingBridge) {
    return {
      caseId: 1,
      statusSeverity: 'open',
      isCircuitClosed: false,
      isShortCircuit: false,
      sourceVoltageV: 0,
      totalCurrentA: 0,
      equivalentResistanceOhm: Infinity,
      bulbCurrentA: 0,
      bulbVoltageV: 0,
      bulbPowerW: 0,
      rheostatEffectiveOhm: 8.0,
      ammeterReadingA: 0,
      ammeterRangeMaxA: 0.6,
      ammeterNeedleAngleRad: computeMeterNeedleAngle(0, 0.6, false),
      voltmeterReadingV: 0,
      voltmeterRangeMaxV: 6.0,
      voltmeterNeedleAngleRad: computeMeterNeedleAngle(0, 6.0, false),
      warningTitleVi: 'Trường hợp 1: Chưa lắp pin vào khay nguồn',
      warningMessageVi:
        'Khay pin đang trống hoặc chưa lắp đúng chiều. Hãy lắp Viên Pin đại 1.5V vào SLOT_1 / SLOT_2 trên Giá đỡ pin.',
      deviceStates,
    };
  }

  if (unbridgedDualTrayWarning) {
    return {
      caseId: 1,
      statusSeverity: 'warning',
      isCircuitClosed: false,
      isShortCircuit: false,
      sourceVoltageV: 0,
      totalCurrentA: 0,
      equivalentResistanceOhm: Infinity,
      bulbCurrentA: 0,
      bulbVoltageV: 0,
      bulbPowerW: 0,
      rheostatEffectiveOhm: 8.0,
      ammeterReadingA: 0,
      ammeterRangeMaxA: 0.6,
      ammeterNeedleAngleRad: computeMeterNeedleAngle(0, 0.6, false),
      voltmeterReadingV: 0,
      voltmeterRangeMaxV: 6.0,
      voltmeterNeedleAngleRad: computeMeterNeedleAngle(0, 6.0, false),
      warningTitleVi: 'Trường hợp 1: Mạch hở (Chưa nối cầu giữa 2 khay pin)',
      warningMessageVi:
        'Muốn lấy nguồn 3.0V từ 2 khay pin, bạn bắt buộc phải nối 1 dây cầu từ BAT1_NEG sang BAT2_POS và lấy nguồn ra ở BAT1_POS (+) và BAT2_NEG (-). Hiện tại mạch đang hở (U = 0V)!',
      deviceStates,
    };
  }

  // Kiểm tra trường hợp nối tắt trực tiếp 2 cực của cùng 1 khay pin bằng dây dẫn (nodePos === nodeNeg)
  for (const bat of batteryElements) {
    if (bat.nodePos === bat.nodeNeg) {
      // Đoản mạch trực tiếp hai cực nguồn!
      return {
        caseId: 3,
        statusSeverity: 'danger',
        isCircuitClosed: true,
        isShortCircuit: true,
        sourceVoltageV: Math.abs(bat.emfVolts),
        totalCurrentA: 6.0,
        equivalentResistanceOhm: 0.05,
        bulbCurrentA: 0,
        bulbVoltageV: 0,
        bulbPowerW: 0,
        rheostatEffectiveOhm: 8.0,
        ammeterReadingA: 6.0,
        ammeterRangeMaxA: 0.6,
        ammeterNeedleAngleRad: computeMeterNeedleAngle(6.0, 0.6, false),
        voltmeterReadingV: 0,
        voltmeterRangeMaxV: 6.0,
        voltmeterNeedleAngleRad: computeMeterNeedleAngle(0, 6.0, false),
        warningTitleVi: 'Trường hợp 3: ĐOẢN MẠCH (CHẬP MẠCH NGUỒN)',
        warningMessageVi:
          'NGUY HIỂM: Đoản mạch (Chập mạch) do mắc Ampe kế song song hoặc nối tắt hai cực nguồn!',
        deviceStates,
      };
    }
  }

  // Giải mạng điện bằng Phương pháp Thế nút (Nodal Analysis) trên từng thành phần liên thông có chứa nguồn pin
  // Xây dựng danh sách kề để tìm thành phần liên thông chứa pin
  const adj = new Map<string, Set<string>>();
  for (const el of elements) {
    if (el.nodePos === el.nodeNeg) continue;
    if (!adj.has(el.nodePos)) adj.set(el.nodePos, new Set());
    if (!adj.has(el.nodeNeg)) adj.set(el.nodeNeg, new Set());
    adj.get(el.nodePos)!.add(el.nodeNeg);
    adj.get(el.nodeNeg)!.add(el.nodePos);
  }

  const nodePotentials = new Map<string, number>();
  const visitedNodes = new Set<string>();

  for (const bat of batteryElements) {
    const groundNode = bat.nodeNeg;
    if (visitedNodes.has(groundNode)) continue;

    // BFS lấy tập các nút trong cùng thành phần liên thông
    const compNodes: string[] = [];
    const queue: string[] = [groundNode];
    visitedNodes.add(groundNode);
    while (queue.length > 0) {
      const curr = queue.shift()!;
      compNodes.push(curr);
      const neighbors = adj.get(curr);
      if (neighbors) {
        for (const nxt of neighbors) {
          if (!visitedNodes.has(nxt)) {
            visitedNodes.add(nxt);
            queue.push(nxt);
          }
        }
      }
    }

    nodePotentials.set(groundNode, 0);
    const unknownNodes = compNodes.filter((n) => n !== groundNode);
    if (unknownNodes.length === 0) continue;

    const nodeIndex = new Map<string, number>();
    unknownNodes.forEach((n, idx) => nodeIndex.set(n, idx));

    const N = unknownNodes.length;
    const G = Array.from({ length: N }, () => Array(N).fill(0));
    const Ivec = Array(N).fill(0);

    const compSet = new Set(compNodes);
    for (const el of elements) {
      if (el.nodePos === el.nodeNeg) continue;
      if (!compSet.has(el.nodePos) || !compSet.has(el.nodeNeg)) continue;

      const g = 1.0 / Math.max(1e-4, el.resistanceOhm);
      const iIdx = nodeIndex.get(el.nodePos);
      const jIdx = nodeIndex.get(el.nodeNeg);

      if (iIdx !== undefined) {
        G[iIdx][iIdx] += g;
        if (jIdx !== undefined) {
          G[iIdx][jIdx] -= g;
        }
      }
      if (jIdx !== undefined) {
        G[jIdx][jIdx] += g;
        if (iIdx !== undefined) {
          G[jIdx][iIdx] -= g;
        }
      }

      // Nguồn sức điện động Norton tương đương: dòng I_norton = E * g bơm vào nodePos và hút ra từ nodeNeg
      if (Math.abs(el.emfVolts) > 1e-6) {
        const iNorton = el.emfVolts * g;
        if (iIdx !== undefined) Ivec[iIdx] += iNorton;
        if (jIdx !== undefined) Ivec[jIdx] -= iNorton;
      }
    }

    const solvedV = solveLinearSystem(G, Ivec);
    if (solvedV) {
      unknownNodes.forEach((n, idx) => {
        nodePotentials.set(n, solvedV[idx]);
      });
    }
  }

  // Tính dòng điện và hiệu điện thế trên từng phần tử
  let totalSourceCurrentA = 0;
  let activeSourceVoltageV = 0;
  let bulbCurrentA = 0;
  let bulbVoltageV = 0;
  let bulbPowerW = 0;
  let rheostatEffectiveOhm = 8.0;

  let ammeterReadingA = 0;
  let ammeterRangeMaxA = 0.6;
  let ammeterNeedleAngleRad = computeMeterNeedleAngle(0, 0.6, false);
  let ammeterReversed = false;
  let ammeterOverRange = false;

  let voltmeterReadingV = 0;
  let voltmeterRangeMaxV = 6.0;
  let voltmeterNeedleAngleRad = computeMeterNeedleAngle(0, 6.0, false);
  let voltmeterReversed = false;
  let voltmeterCarryingMainCurrent = false;

  for (const el of elements) {
    const vPos = nodePotentials.get(el.nodePos) ?? 0;
    const vNeg = nodePotentials.get(el.nodeNeg) ?? 0;
    const vDiff = vPos - vNeg; // Điện thế tại cực Dương/Đỏ trừ cực Âm/Đen

    if (el.kind === 'battery_tray_1' || el.kind === 'battery_tray_2') {
      // Dòng phóng ra từ cực Dương của pin: I = (E - (V_pos - V_neg)) / r
      const iBat = (el.emfVolts - vDiff) / el.resistanceOhm;
      if (Math.abs(iBat) > 1e-5) {
        totalSourceCurrentA = Math.max(totalSourceCurrentA, Math.abs(iBat));
        activeSourceVoltageV += Math.abs(el.emfVolts);
      } else if (activeSourceVoltageV < Math.abs(el.emfVolts)) {
        activeSourceVoltageV = Math.abs(el.emfVolts);
      }
    } else if (el.kind === 'bulb') {
      const iBulb = Math.abs(vDiff) / el.resistanceOhm;
      const pBulb = iBulb * iBulb * el.resistanceOhm;
      bulbCurrentA = iBulb;
      bulbVoltageV = Math.abs(vDiff);
      bulbPowerW = pBulb;
      if (deviceStates[el.instanceId]) {
        deviceStates[el.instanceId].bulbCurrentA = iBulb;
        deviceStates[el.instanceId].bulbVoltageV = Math.abs(vDiff);
        deviceStates[el.instanceId].bulbPowerW = pBulb;
      }
    } else if (el.kind === 'rheostat') {
      rheostatEffectiveOhm = el.resistanceOhm;
    } else if (el.kind === 'ammeter') {
      // Dòng đi vào cọc Đỏ (+) và đi ra cọc Đen (-): I = (V_pos - V_neg) / R_A
      const iSigned = vDiff / el.resistanceOhm;
      const iAbs = Math.abs(iSigned);
      const rMax = el.rangeMax ?? 0.6;
      const isRev = iSigned < -0.005;
      if (isRev) ammeterReversed = true;
      if (iAbs > rMax + 0.005 && rMax === 0.6) {
        ammeterOverRange = true;
      }
      const angle = computeMeterNeedleAngle(iAbs, rMax, isRev);
      ammeterReadingA = iSigned;
      ammeterRangeMaxA = rMax;
      ammeterNeedleAngleRad = angle;
      if (deviceStates[el.instanceId]) {
        deviceStates[el.instanceId].ammeterReadingA = iSigned;
        deviceStates[el.instanceId].ammeterRangeMaxA = rMax;
        deviceStates[el.instanceId].ammeterNeedleAngleRad = angle;
      }
    } else if (el.kind === 'voltmeter') {
      // Hiệu điện thế giữa cọc Đỏ (+) và cọc Âm (-): U = V_pos - V_neg
      const uSigned = vDiff;
      const uAbs = Math.abs(uSigned);
      const rMax = el.rangeMax ?? 6.0;
      const isRev = uSigned < -0.02;
      if (isRev) voltmeterReversed = true;
      const angle = computeMeterNeedleAngle(uAbs, rMax, isRev);
      voltmeterReadingV = uSigned;
      voltmeterRangeMaxV = rMax;
      voltmeterNeedleAngleRad = angle;
      if (deviceStates[el.instanceId]) {
        deviceStates[el.instanceId].voltmeterReadingV = uSigned;
        deviceStates[el.instanceId].voltmeterRangeMaxV = rMax;
        deviceStates[el.instanceId].voltmeterNeedleAngleRad = angle;
      }

      // Kiểm tra Trường hợp 2: Vôn kế mắc nối tiếp vào mạch chính
      // Dòng qua Vôn kế xấp xỉ dòng tổng của nguồn (I ≈ 0.00015A - 0.00035A) và bóng đèn không sáng (I_bulb < 0.01A), trong khi U_voltmeter >= 1.0V
      const iVolt = uAbs / el.resistanceOhm;
      if (uAbs >= 1.0 && bulbCurrentA < 0.01 && Math.abs(totalSourceCurrentA - iVolt) < 0.002) {
        voltmeterCarryingMainCurrent = true;
      }
    }
  }

  // Nếu có 2 khay pin nối tiếp nhau cùng hoạt động, tính tổng nguồn khả dụng
  if (batteryElements.length === 2) {
    const b1 = batteryElements[0];
    const b2 = batteryElements[1];
    if (b1.nodeNeg === b2.nodePos || b1.nodePos === b2.nodeNeg) {
      activeSourceVoltageV = Math.abs(b1.emfVolts + b2.emfVolts);
    }
  }

  // Phân loại chính xác 6 Trường hợp Vật lý bắt buộc:

  // Trường hợp 3: Mắc Ampe kế SONG SONG với nguồn hoặc bóng đèn / Đoản mạch (I_short > 4.5A hoặc chập mạch khiến đèn tắt mà dòng qua nguồn/Ampe kế cực lớn)
  const isShortCircuit =
    totalSourceCurrentA > 4.2 ||
    Math.abs(ammeterReadingA) > 4.2 ||
    (totalSourceCurrentA > 2.5 && bulbCurrentA < 0.05);

  if (isShortCircuit) {
    // Kim Ampe kế đập kịch khung phải
    for (const inst of instances) {
      if (archetypeLookup(inst) === 'dc-ammeter') {
        const rMax = deviceStates[inst.instanceId]?.ammeterRangeMaxA ?? 0.6;
        const slamAngle = computeMeterNeedleAngle(rMax * 1.1, rMax, false);
        deviceStates[inst.instanceId].ammeterReadingA = 6.0;
        deviceStates[inst.instanceId].ammeterNeedleAngleRad = slamAngle;
        ammeterNeedleAngleRad = slamAngle;
        ammeterReadingA = 6.0;
      }
      if (archetypeLookup(inst) === 'dc-light-bulb-126') {
        deviceStates[inst.instanceId].bulbPowerW = 0;
        deviceStates[inst.instanceId].bulbCurrentA = 0;
      }
    }
    return {
      caseId: 3,
      statusSeverity: 'danger',
      isCircuitClosed: true,
      isShortCircuit: true,
      sourceVoltageV: activeSourceVoltageV,
      totalCurrentA: Math.max(totalSourceCurrentA, 5.5),
      equivalentResistanceOhm: 0.05,
      bulbCurrentA: 0,
      bulbVoltageV: 0,
      bulbPowerW: 0,
      rheostatEffectiveOhm,
      ammeterReadingA,
      ammeterRangeMaxA,
      ammeterNeedleAngleRad,
      voltmeterReadingV,
      voltmeterRangeMaxV,
      voltmeterNeedleAngleRad,
      warningTitleVi: 'Trường hợp 3: NGUY HIỂM - ĐOẢN MẠCH (CHẬP MẠCH)',
      warningMessageVi:
        'NGUY HIỂM: Đoản mạch (Chập mạch) do mắc Ampe kế song song hoặc nối tắt hai cực nguồn!',
      deviceStates,
    };
  }

  // Trường hợp 2: Mắc Vôn kế NỐI TIẾP vào mạch chính
  if (voltmeterCarryingMainCurrent) {
    return {
      caseId: 2,
      statusSeverity: 'warning',
      isCircuitClosed: true,
      isShortCircuit: false,
      sourceVoltageV: activeSourceVoltageV,
      totalCurrentA: totalSourceCurrentA,
      equivalentResistanceOhm: R_VOLTMETER_OHM,
      bulbCurrentA: 0,
      bulbVoltageV: 0,
      bulbPowerW: 0,
      rheostatEffectiveOhm,
      ammeterReadingA: 0,
      ammeterRangeMaxA,
      ammeterNeedleAngleRad: computeMeterNeedleAngle(0, ammeterRangeMaxA, false),
      voltmeterReadingV,
      voltmeterRangeMaxV,
      voltmeterNeedleAngleRad,
      warningTitleVi: 'Trường hợp 2: Mắc Vôn kế nối tiếp vào mạch chính',
      warningMessageVi:
        'SAI: Vôn kế đang mắc nối tiếp làm cản trở dòng điện! Hãy mắc Vôn kế song song với bóng đèn.',
      deviceStates,
    };
  }

  // Trường hợp 4: Cắm ngược cực '+' và '-' của Ampe kế hoặc Vôn kế
  if (ammeterReversed || voltmeterReversed) {
    return {
      caseId: 4,
      statusSeverity: 'warning',
      isCircuitClosed: totalSourceCurrentA > 0.005,
      isShortCircuit: false,
      sourceVoltageV: activeSourceVoltageV,
      totalCurrentA: totalSourceCurrentA,
      equivalentResistanceOhm:
        totalSourceCurrentA > 1e-4 ? activeSourceVoltageV / totalSourceCurrentA : Infinity,
      bulbCurrentA,
      bulbVoltageV,
      bulbPowerW,
      rheostatEffectiveOhm,
      ammeterReadingA,
      ammeterRangeMaxA,
      ammeterNeedleAngleRad,
      voltmeterReadingV,
      voltmeterRangeMaxV,
      voltmeterNeedleAngleRad,
      warningTitleVi: 'Trường hợp 4: Cắm ngược cực đồng hồ đo',
      warningMessageVi: 'SAI: Cắm ngược cực (+) và (-) của đồng hồ đo!',
      deviceStates,
    };
  }

  // Trường hợp 5b: Dòng điện thực tế I > 0.6A nhưng cắm ở cọc AM_06A
  if (ammeterOverRange) {
    return {
      caseId: 5,
      statusSeverity: 'warning',
      isCircuitClosed: true,
      isShortCircuit: false,
      sourceVoltageV: activeSourceVoltageV,
      totalCurrentA: totalSourceCurrentA,
      equivalentResistanceOhm:
        totalSourceCurrentA > 1e-4 ? activeSourceVoltageV / totalSourceCurrentA : Infinity,
      bulbCurrentA,
      bulbVoltageV,
      bulbPowerW,
      rheostatEffectiveOhm,
      ammeterReadingA,
      ammeterRangeMaxA,
      ammeterNeedleAngleRad,
      voltmeterReadingV,
      voltmeterRangeMaxV,
      voltmeterNeedleAngleRad,
      warningTitleVi: 'Trường hợp 5: Quá thang đo Ampe kế (0.6A)',
      warningMessageVi:
        'QUÁ THANG ĐO: Dòng điện vượt quá 0.6A, hãy rút dây chuyển sang cọc 3A!',
      deviceStates,
    };
  }

  if (bulbSingleTerminalBypassWarning) {
    return {
      caseId: 1,
      statusSeverity: 'warning',
      isCircuitClosed: false,
      isShortCircuit: false,
      sourceVoltageV: activeSourceVoltageV,
      totalCurrentA: totalSourceCurrentA,
      equivalentResistanceOhm: Infinity,
      bulbCurrentA: 0,
      bulbVoltageV: 0,
      bulbPowerW: 0,
      rheostatEffectiveOhm,
      ammeterReadingA,
      ammeterRangeMaxA,
      ammeterNeedleAngleRad,
      voltmeterReadingV,
      voltmeterRangeMaxV,
      voltmeterNeedleAngleRad,
      warningTitleVi: 'Trường hợp 1: Đèn tắt do cắm dây cùng 1 cọc',
      warningMessageVi: bulbSingleTerminalBypassWarning,
      deviceStates,
    };
  }

  // Trường hợp 1: Mạch hở / Mở cầu dao / Thiếu dây (I ≈ 0A)
  if (totalSourceCurrentA < 0.005) {
    const openReason = anySwitchOpenInWiredCircuit
      ? 'Cầu dao K đang mở (I = 0A). Hãy nhấp vào Cầu dao K trên bàn để đóng mạch điện.'
      : 'Mạch điện chưa khép kín từ cực Dương (+) về cực Âm (-) của nguồn (I = 0A). Hãy kiểm tra lại các đầu dây cắm.';
    return {
      caseId: 1,
      statusSeverity: 'open',
      isCircuitClosed: false,
      isShortCircuit: false,
      sourceVoltageV: activeSourceVoltageV,
      totalCurrentA: 0,
      equivalentResistanceOhm: Infinity,
      bulbCurrentA: 0,
      bulbVoltageV: 0,
      bulbPowerW: 0,
      rheostatEffectiveOhm,
      ammeterReadingA: 0,
      ammeterRangeMaxA,
      ammeterNeedleAngleRad: computeMeterNeedleAngle(0, ammeterRangeMaxA, false),
      voltmeterReadingV,
      voltmeterRangeMaxV,
      voltmeterNeedleAngleRad,
      warningTitleVi: anySwitchOpenInWiredCircuit
        ? 'Trường hợp 1: Cầu dao K đang NGẮT (Mạch hở)'
        : 'Trường hợp 1: Mạch hở / Thiếu dây',
      warningMessageVi: openReason,
      deviceStates,
    };
  }

  // Trường hợp 6: Mạch điện kín hoạt động chuẩn xác
  const bypassNote = anySwitchBypassed
    ? ' (Lưu ý: Bạn đang cắm cả 2 dây vào cùng 1 cọc của Cầu dao nên dòng điện đi tắt không qua cầu dao!)'
    : '';

  return {
    caseId: 6,
    statusSeverity: 'normal',
    isCircuitClosed: true,
    isShortCircuit: false,
    sourceVoltageV: activeSourceVoltageV,
    totalCurrentA: totalSourceCurrentA,
    equivalentResistanceOhm: activeSourceVoltageV / totalSourceCurrentA,
    bulbCurrentA,
    bulbVoltageV,
    bulbPowerW,
    rheostatEffectiveOhm,
    ammeterReadingA,
    ammeterRangeMaxA,
    ammeterNeedleAngleRad,
    voltmeterReadingV,
    voltmeterRangeMaxV,
    voltmeterNeedleAngleRad,
    warningTitleVi: 'Trường hợp 6: Mạch điện kín hoạt động đúng chuẩn vật lý',
    warningMessageVi: `I = ${totalSourceCurrentA.toFixed(2)} A | U_đèn = ${bulbVoltageV.toFixed(2)} V | P_đèn = ${bulbPowerW.toFixed(2)} W | R_biến_trở = ${rheostatEffectiveOhm.toFixed(1)} Ω${bypassNote}`,
    deviceStates,
  };
}
