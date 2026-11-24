import React, { useEffect, useState } from 'react';
import { SceneInstance } from '../../domain/types';
import {
  getOxygenLiveTelemetry,
  OxygenFuelType,
  OxygenLiveTelemetry,
  OxygenWaterTint,
} from '../../three-runtime/OxygenAirVolume3D';
import { labSoundEngine } from '../../three-runtime/LabSoundEngine';

interface OxygenAirVolumeControlsProps {
  instance: SceneInstance;
  onUpdateState: (
    instanceId: string,
    patch: Partial<SceneInstance['instanceState']>,
  ) => void;
  onNotify: (msg: string, tone?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const OxygenAirVolumeControls: React.FC<
  OxygenAirVolumeControlsProps
> = ({ instance, onUpdateState, onNotify }) => {
  const st = instance.instanceState;
  const fuel: OxygenFuelType = st.oxygenFuelType ?? 'candle';
  const flameLit = st.oxygenFlameLit !== false;
  const tubeLowered = Boolean(st.oxygenTubeLowered);
  const showMolecules = Boolean(st.oxygenShowMolecules);
  const waterTint: OxygenWaterTint = st.oxygenWaterTint ?? 'blue';
  const autoPlay = st.oxygenAutoPlay !== false;

  const [telemetry, setTelemetry] = useState<OxygenLiveTelemetry>(() => {
    return (
      getOxygenLiveTelemetry(instance.instanceId) ?? {
        progress: st.oxygenManualProgress ?? 0,
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
      }
    );
  });

  // Poll live 3D simulation telemetry at ~8Hz without causing parent React churn
  useEffect(() => {
    const sync = () => {
      const live = getOxygenLiveTelemetry(instance.instanceId);
      if (live) setTelemetry(live);
    };
    sync();
    const timer = window.setInterval(sync, 130);
    return () => window.clearInterval(timer);
  }, [instance.instanceId]);

  const update = (
    patch: Partial<SceneInstance['instanceState']>,
    msg?: string,
    tone: 'info' | 'success' | 'warning' = 'info',
    sound: 'ui-toggle' | 'laser-switch' | 'liquid-pour' | 'optics-angle' = 'ui-toggle',
  ) => {
    onUpdateState(instance.instanceId, patch);
    labSoundEngine.play(sound, 0.8);
    if (msg) onNotify(msg, tone);
  };

  const handleToggleFlame = () => {
    if (!flameLit) {
      update(
        {
          oxygenFlameLit: true,
          oxygenManualProgress: undefined,
          oxygenAutoPlay: true,
        },
        fuel === 'phosphorus'
          ? 'Đã châm lửa đốt Phốt pho đỏ trên bát sứ. Bấm "Úp ống chia vạch" để bắt đầu đo thể tích O₂!'
          : 'Đã thắp sáng cây nến trên đế sứ. Bấm "Úp ống chia vạch" để bịt kín không khí và quan sát!',
        'info',
        'laser-switch',
      );
    } else {
      update(
        {
          oxygenFlameLit: false,
          oxygenTubeLowered: false,
          oxygenManualProgress: undefined,
        },
        'Đã tắt ngọn lửa và nhấc ống thủy tinh lên vị trí ban đầu.',
        'info',
        'ui-toggle',
      );
    }
  };

  const handleToggleTube = () => {
    if (!tubeLowered) {
      update(
        {
          oxygenFlameLit: true,
          oxygenTubeLowered: true,
          oxygenAutoPlay: true,
          oxygenManualProgress: undefined,
          oxygenRunToken: Date.now(),
        },
        fuel === 'phosphorus'
          ? 'Đã úp ống thủy tinh chia 5 vạch! Phốt pho đỏ cháy phản ứng 4P + 5O₂ → 2P₂O₅, nước sẽ dâng lên vạch 1 (≈ 21% V).'
          : 'Đã úp ống thủy tinh chia 5 vạch! Quan sát ngọn lửa tiêu thụ O₂ rồi tắt hẳn và nước dâng lên gần vạch 1 (≈ 1/5 thể tích).',
        'success',
        'liquid-pour',
      );
    } else {
      update(
        {
          oxygenTubeLowered: false,
          oxygenManualProgress: undefined,
          oxygenAutoPlay: true,
        },
        'Đã nhấc ống thủy tinh lên · Mực nước trở về vạch 0 (Không khí 21% O₂).',
        'info',
        'optics-angle',
      );
    }
  };

  const handleReset = () => {
    update(
      {
        oxygenFlameLit: true,
        oxygenTubeLowered: false,
        oxygenAutoPlay: true,
        oxygenManualProgress: undefined,
        oxygenRunToken: Date.now(),
      },
      'Đã đặt lại thí nghiệm: Đèn nến sẵn sàng, mực nước vạch 0, O₂ = 21,0%.',
      'info',
      'optics-angle',
    );
  };

  const isCompleted = telemetry.phase === 'completed';

  return (
    <div className="flex flex-col gap-1.5 w-full mt-1 pt-1.5 border-t border-white/15">
      {/* Row 1: Primary Experiment Workflow Controls */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={handleToggleFlame}
          className={`px-2 py-1 rounded-[7px] text-[11px] font-bold border cursor-pointer transition-colors ${
            flameLit
              ? 'bg-orange-500/25 border-orange-400/75 text-orange-200 hover:bg-orange-500/35'
              : 'bg-slate-800 border-white/20 text-slate-200 hover:bg-slate-700'
          }`}
        >
          {flameLit
            ? fuel === 'phosphorus'
              ? '🔥 Đốt P đỏ: BẬT'
              : '🕯️ Nến: ĐANG CHÁY'
            : fuel === 'phosphorus'
              ? '🔥 Bước 1: Đốt P đỏ'
              : '🕯️ Bước 1: Thắp nến'}
        </button>

        <button
          type="button"
          onClick={handleToggleTube}
          className={`px-2.5 py-1 rounded-[7px] text-[11px] font-bold border cursor-pointer transition-colors ${
            tubeLowered
              ? 'bg-sky-500/30 border-sky-400/80 text-sky-100 hover:bg-sky-500/40'
              : 'bg-emerald-500/30 border-emerald-400/80 text-emerald-100 hover:bg-emerald-500/40'
          }`}
        >
          {tubeLowered
            ? '⬆ Nhấc ống chia vạch'
            : '⬇ Bước 2: Úp ống & Đo O₂'}
        </button>

        {tubeLowered && !isCompleted && (
          <button
            type="button"
            onClick={() =>
              update(
                {
                  oxygenAutoPlay: !autoPlay,
                  oxygenManualProgress: autoPlay ? telemetry.progress : undefined,
                },
                autoPlay
                  ? 'Đã tạm dừng mô phỏng tại thời điểm hiện tại.'
                  : 'Tiếp tục chạy mô phỏng phản ứng tiêu thụ O₂.',
              )
            }
            className="px-2 py-1 rounded-[7px] text-[11px] font-bold bg-slate-800 hover:bg-slate-700 border border-white/20 text-slate-200 cursor-pointer"
          >
            {autoPlay && typeof st.oxygenManualProgress !== 'number'
              ? '⏸ Tạm dừng'
              : '▶ Tiếp tục'}
          </button>
        )}

        <button
          type="button"
          onClick={handleReset}
          className="px-2 py-1 rounded-[7px] text-[11px] font-bold bg-slate-800 hover:bg-slate-700 border border-white/20 text-slate-200 cursor-pointer"
        >
          ↺ Làm lại
        </button>

        {/* Live Telemetry Readout Pill */}
        <span
          className={`ml-auto text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
            isCompleted
              ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-200'
              : 'bg-sky-500/15 border-sky-400/40 text-sky-200'
          }`}
        >
          O₂ còn: {telemetry.o2Percent.toFixed(1)}% · Mực nước:{' '}
          {telemetry.waterLevelDivisions.toFixed(2)}/5 (≈
          {telemetry.waterRisePercent.toFixed(1)}%)
        </span>
      </div>

      {/* Row 2: Fuel Switch, Gas Molecule X-Ray, Water Tint & Progress Scrubber */}
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Fuel mode */}
        <div className="flex items-center rounded-[7px] overflow-hidden border border-white/20 bg-slate-900/80">
          <button
            type="button"
            onClick={() =>
              update(
                {
                  oxygenFuelType: 'candle',
                  oxygenTubeLowered: false,
                  oxygenFlameLit: true,
                  oxygenManualProgress: undefined,
                },
                'Chế độ Nến Parafin (SGK KHTN 6): Đốt nến và úp ống chia 5 vạch.',
                'info',
                'ui-toggle',
              )
            }
            className={`px-2 py-0.5 text-[11px] font-bold cursor-pointer ${
              fuel === 'candle'
                ? 'bg-amber-500/35 text-amber-100'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            🕯️ Nến SGK
          </button>
          <button
            type="button"
            onClick={() =>
              update(
                {
                  oxygenFuelType: 'phosphorus',
                  oxygenTubeLowered: false,
                  oxygenFlameLit: true,
                  oxygenManualProgress: undefined,
                },
                'Chế độ Phốt pho đỏ (4P + 5O₂ → 2P₂O₅): Tạo khói trắng tan trong nước, đo chính xác ~21% O₂!',
                'info',
                'ui-toggle',
              )
            }
            className={`px-2 py-0.5 text-[11px] font-bold cursor-pointer border-l border-white/15 ${
              fuel === 'phosphorus'
                ? 'bg-rose-500/35 text-rose-100'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            🔴 Phốt pho đỏ
          </button>
        </div>

        {/* Toggle 3D O2/N2 Molecules */}
        <button
          type="button"
          onClick={() =>
            update(
              { oxygenShowMolecules: !showMolecules },
              !showMolecules
                ? 'Đã bật mô phỏng phân tử khí 3D: 🔴 O₂ (21%) bị tiêu thụ dần khi cháy, 🔵 N₂ (78%) giữ nguyên trong 4/5 cột khí!'
                : 'Đã ẩn lớp mô phỏng phân tử khí.',
              'info',
              'ui-toggle',
            )
          }
          className={`px-2 py-0.5 rounded-[7px] text-[11px] font-bold border cursor-pointer transition-colors ${
            showMolecules
              ? 'bg-violet-500/30 border-violet-400/75 text-violet-100'
              : 'bg-slate-900/80 border-white/20 text-slate-300 hover:bg-slate-800'
          }`}
        >
          {showMolecules ? '⚛️ Phân tử O₂/N₂: HIỆN' : '⚛️ Xem phân tử O₂/N₂'}
        </button>

        {/* Toggle Water Indicator Color */}
        <button
          type="button"
          onClick={() => {
            const nextTint: OxygenWaterTint = waterTint === 'blue' ? 'red' : 'blue';
            update(
              { oxygenWaterTint: nextTint },
              nextTint === 'red'
                ? 'Đã pha màu đỏ chỉ thị cho nước để dễ quan sát vạch dâng mực nước.'
                : 'Đã chuyển về nước chỉ thị xanh lam chuẩn phòng thí nghiệm.',
              'info',
              'liquid-pour',
            );
          }}
          className="px-2 py-0.5 rounded-[7px] text-[11px] font-bold bg-slate-900/80 hover:bg-slate-800 border border-white/20 text-slate-200 cursor-pointer"
        >
          {waterTint === 'blue' ? '💧 Nước: Xanh lam' : '🍷 Nước: Đỏ chỉ thị'}
        </button>

        {/* Interactive Progress Scrubber when tube is lowered */}
        {tubeLowered && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[7px] bg-slate-900/80 border border-white/15 ml-auto">
            <span className="text-[11px] font-bold text-amber-300 whitespace-nowrap">
              Tua tiến trình: {Math.round(telemetry.progress * 100)}%
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(telemetry.progress * 100)}
              onChange={(e) =>
                onUpdateState(instance.instanceId, {
                  oxygenTubeLowered: true,
                  oxygenFlameLit: true,
                  oxygenAutoPlay: false,
                  oxygenManualProgress: Number(e.target.value) / 100,
                })
              }
              className="w-24 accent-amber-400 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Concise scientific status bar */}
      <div className="flex items-center justify-between text-[11px] text-slate-300 px-1">
        <span className="truncate">{telemetry.phaseLabelVi}</span>
        {isCompleted && (
          <span className="font-bold text-amber-300 whitespace-nowrap ml-2">
            Kết luận: V(O₂) ≈ 1/5 V(KK) ≈ 21% · N₂ ≈ 78%
          </span>
        )}
      </div>
    </div>
  );
};
