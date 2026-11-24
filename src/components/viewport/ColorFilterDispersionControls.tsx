import React from 'react';
import { SceneInstance } from '../../domain/types';
import {
  OPTICAL_FILTER_META,
  OpticalFilterId,
  OpticalFilterPosition,
  SPECTRUM_BANDS,
} from '../../three-runtime/ColorFilterDispersion3D';
import { labSoundEngine } from '../../three-runtime/LabSoundEngine';

interface ColorFilterDispersionControlsProps {
  instance: SceneInstance;
  onUpdateState: (
    instanceId: string,
    patch: Partial<SceneInstance['instanceState']>,
  ) => void;
  onNotify: (msg: string, tone?: 'info' | 'success' | 'warning' | 'error') => void;
}

const FILTER_OPTIONS: OpticalFilterId[] = [
  'none',
  'red',
  'green',
  'blue',
  'yellow',
  'cyan',
  'magenta',
];

export const ColorFilterDispersionControls: React.FC<
  ColorFilterDispersionControlsProps
> = ({ instance, onUpdateState, onNotify }) => {
  const st = instance.instanceState;
  const filter: OpticalFilterId = st.filterColor ?? 'none';
  const filterPos: OpticalFilterPosition = st.filterPosition ?? 'after-prism';
  const prismOn = st.prismDispersionEnabled !== false;
  const lampOn = st.isLampLit !== false;
  const angleDeg = Math.round(st.incidentAngleDeg ?? 45);

  const update = (
    patch: Partial<SceneInstance['instanceState']>,
    msg?: string,
    sound: 'optics-angle' | 'laser-switch' | 'ui-toggle' = 'ui-toggle',
  ) => {
    onUpdateState(instance.instanceId, patch);
    labSoundEngine.play(sound, 0.8);
    if (msg) onNotify(msg, 'info');
  };

  const passedCount = SPECTRUM_BANDS.filter((b) =>
    b.passedBy.includes(filter),
  ).length;

  return (
    <div className="flex flex-col gap-1.5 w-full mt-1 pt-1.5 border-t border-white/15">
      {/* Row 1: Lamp, Prism, Filter Position & Prism Incidence Angle */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() =>
            update(
              { isLampLit: !lampOn },
              !lampOn
                ? 'Đã bật nguồn sáng trắng khe hẹp chiếu vào hệ quang học.'
                : 'Đã tắt nguồn sáng.',
              'laser-switch',
            )
          }
          className={`px-2 py-1 rounded-[7px] text-[11px] font-bold border cursor-pointer transition-colors ${
            lampOn
              ? 'bg-amber-500/25 border-amber-400/70 text-amber-200 hover:bg-amber-500/35'
              : 'bg-slate-800 border-white/20 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {lampOn ? '💡 Đèn trắng: BẬT' : '💡 Đèn trắng: TẮT'}
        </button>

        <button
          type="button"
          onClick={() =>
            update(
              { prismDispersionEnabled: !prismOn },
              !prismOn
                ? 'Đã lắp Lăng kính thủy tinh quang học (n ≈ 1,65) → Tán sắc ánh sáng thành dải quang phổ cầu vồng!'
                : 'Đã tháo Lăng kính → Quan sát trực tiếp tác dụng lọc màu của tấm lọc quang học.',
              'optics-angle',
            )
          }
          className={`px-2 py-1 rounded-[7px] text-[11px] font-bold border cursor-pointer transition-colors ${
            prismOn
              ? 'bg-sky-500/25 border-sky-400/70 text-sky-200 hover:bg-sky-500/35'
              : 'bg-slate-800 border-white/20 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {prismOn ? '🔺 Lăng kính: CÓ' : '🔺 Lăng kính: THÁO'}
        </button>

        {filter !== 'none' && prismOn && (
          <button
            type="button"
            onClick={() => {
              const nextPos: OpticalFilterPosition =
                filterPos === 'after-prism' ? 'before-prism' : 'after-prism';
              update(
                { filterPosition: nextPos },
                nextPos === 'before-prism'
                  ? `Đã trượt ${OPTICAL_FILTER_META[filter].labelVi} ra TRƯỚC lăng kính: kiểm chứng ánh sáng đơn sắc không bị tán sắc!`
                  : `Đã trượt ${OPTICAL_FILTER_META[filter].labelVi} ra SAU lăng kính: quan sát tấm lọc hấp thụ các dải màu nào trong quang phổ trắng!`,
                'optics-angle',
              );
            }}
            className="px-2 py-1 rounded-[7px] text-[11px] font-bold bg-indigo-500/25 border border-indigo-400/65 text-indigo-200 hover:bg-indigo-500/35 cursor-pointer"
          >
            {filterPos === 'before-prism'
              ? '⇄ Vị trí: TRƯỚC lăng kính'
              : '⇄ Vị trí: SAU lăng kính'}
          </button>
        )}

        {prismOn && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[7px] bg-slate-900/80 border border-white/15">
            <span className="text-[11px] font-bold text-sky-300 whitespace-nowrap">
              Góc tới i: {angleDeg}°
            </span>
            <input
              type="range"
              min={25}
              max={65}
              step={1}
              value={angleDeg}
              onChange={(e) =>
                onUpdateState(instance.instanceId, {
                  incidentAngleDeg: Number(e.target.value),
                })
              }
              className="w-20 accent-sky-400 cursor-pointer"
            />
          </div>
        )}

        <span className="ml-auto text-[11px] font-mono font-bold text-emerald-300 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-400/35">
          Truyền qua: {passedCount}/7 dải màu
        </span>
      </div>

      {/* Row 2: 7 Optical Color Filter Swatches */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-[11px] font-bold text-slate-300 mr-1">
          Tấm lọc màu:
        </span>
        {FILTER_OPTIONS.map((fid) => {
          const meta = OPTICAL_FILTER_META[fid];
          const active = filter === fid;
          return (
            <button
              key={fid}
              type="button"
              onClick={() =>
                update(
                  { filterColor: fid },
                  `${meta.labelVi}: ${meta.summaryVi}`,
                  'optics-angle',
                )
              }
              className={`flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[11px] font-bold border cursor-pointer transition-all ${
                active
                  ? 'bg-white text-slate-950 border-white shadow-sm'
                  : 'bg-slate-900/75 text-slate-200 border-white/20 hover:bg-slate-800'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-sm border border-black/30 inline-block shrink-0"
                style={{ backgroundColor: meta.hex }}
              />
              <span>{meta.shortVi}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
