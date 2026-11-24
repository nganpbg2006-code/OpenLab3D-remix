import React, { useEffect, useState, useRef } from 'react';
import { AssetDefinition } from '../../domain/types';
import {
  equipmentImagePreviewController,
  EquipmentImagePreviewState,
  formatImageToSquare240DataUrl,
  PREINSTALLED_LIBRARY_REAL_PHOTOS,
  validateAndResolveImageSrc,
} from '../../three-runtime/EquipmentImagePreviewController';
import { htmlEquipmentModuleRegistry } from '../../three-runtime/HtmlEquipmentModuleRegistry';
import { getLibraryFolderName } from '../../three-runtime/LocalDiskLibraryEngine';
import {
  X,
  Camera,
  Upload,
  Wrench,
  FileCode,
  Plus,
  AlertCircle,
  ImageOff,
  CheckCircle2,
  RotateCcw,
  Link2,
  FolderCheck,
  Info,
  ChevronRight,
} from 'lucide-react';

interface EquipmentPreviewPanelProps {
  assetsMap: Map<string, AssetDefinition>;
  selectedAsset?: AssetDefinition | null;
  isSidebarCollapsed: boolean;
  isDarkMode?: boolean;
  onAddAssetToTable: (assetId: string) => void;
  onInspectAssetDetail?: (asset: AssetDefinition, initialEditMode?: boolean) => void;
  onOpenHtmlUpdaterForAsset?: (asset: AssetDefinition) => void;
  onOpenPhotoUpdaterForAsset?: (asset: AssetDefinition) => void;
}

export const EquipmentPreviewPanel: React.FC<EquipmentPreviewPanelProps> = ({
  assetsMap,
  selectedAsset = null,
  isSidebarCollapsed,
  isDarkMode = true,
  onAddAssetToTable,
  onInspectAssetDetail,
  onOpenHtmlUpdaterForAsset,
  onOpenPhotoUpdaterForAsset,
}) => {
  const [previewState, setPreviewState] = useState<EquipmentImagePreviewState>(() =>
    equipmentImagePreviewController.getState(),
  );
  const [lastEntry, setLastEntry] = useState<EquipmentImagePreviewState['entry']>(
    () => equipmentImagePreviewController.getState().entry,
  );

  useEffect(() => {
    const unsub = equipmentImagePreviewController.subscribe(() => {
      const next = equipmentImagePreviewController.getState();
      setPreviewState(next);
      if (next.entry) {
        setLastEntry(next.entry);
      }
    });
    return unsub;
  }, []);

  const isOpen = previewState.mode !== 'hidden' && Boolean(previewState.entry);
  const panelRef = useRef<HTMLElement | null>(null);

  // Đóng bảng trượt khi nhấn phím Escape hoặc khi click chuột ra vùng bên ngoài (Click Outside)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        equipmentImagePreviewController.hide('escape');
      }
    };
    const handlePointerDownOutside = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (panelRef.current && panelRef.current.contains(target)) {
        return;
      }
      if (
        target.closest('[aria-modal="true"]') ||
        target.closest('[data-preview-trigger="true"]')
      ) {
        return;
      }
      equipmentImagePreviewController.hide('close');
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDownOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDownOutside);
    };
  }, [isOpen]);

  const fallbackTargetId = selectedAsset?.assetId ?? 'OL3D-EQP-BAL-0001';
  const activeEntry =
    previewState.entry ??
    lastEntry ??
    equipmentImagePreviewController.getEntry(fallbackTargetId) ??
    null;

  if (!activeEntry) {
    return null;
  }

  const { realPhotoMeta } = activeEntry;
  const imageLoadError = isOpen ? previewState.imageLoadError : null;
  const asset = assetsMap.get(activeEntry.moduleId) ?? selectedAsset ?? undefined;
  const bgStyle = realPhotoMeta.display?.background || '#ffffff';

  const hasValidRealPhoto =
    realPhotoMeta.available &&
    Boolean(realPhotoMeta.src) &&
    realPhotoMeta.sourceKind === 'real-photo' &&
    !imageLoadError;

  const isLegacyIllustrationFallback =
    !hasValidRealPhoto &&
    !imageLoadError &&
    realPhotoMeta.sourceKind === 'illustration' &&
    Boolean(activeEntry.fallbackSvgMarkup);

  // Vị trí bảng trượt thông minh (Slide-over Drawer) từ cạnh trái:
  // - Khi thanh danh mục bên trái đang mở: trượt ra ngay sát cạnh phải của danh mục (không đè lên danh sách dụng cụ)
  // - Khi thanh danh mục đã thu gọn: trượt ra từ sát mép trái màn hình (dưới cụm nút điều khiển góc trái trên)
  const drawerOffsetClass = isSidebarCollapsed
    ? 'left-2.5 top-[72px]'
    : 'left-2.5 md:left-[286px] lg:left-[304px] top-[62px]';

  const dims = asset?.geometry.boundingBoxM;
  const dimsText = dims
    ? `${Math.round(dims.width * 1000)}×${Math.round(dims.height * 1000)}×${Math.round(dims.depth * 1000)} mm`
    : null;
  const capOrRange =
    asset?.scientificProperties.capacity || asset?.measurementMetadata?.rangeMax;
  const leastCount = asset?.measurementMetadata?.leastCount;
  const refMass = asset?.scientificProperties.referenceMass;

  return (
    <>
      {/* Nút thu gọn nhỏ gọn ở góc trái khi Bảng thông tin chi tiết đang đóng — bấm vào để trượt bảng thông tin ra */}
      {!isOpen && asset && (
        <button
          type="button"
          data-preview-trigger="true"
          onClick={() =>
            equipmentImagePreviewController.preview(asset.assetId, 'pinned')
          }
          className={`fixed sm:absolute ${drawerOffsetClass} z-30 h-8 px-2.5 rounded-r-[10px] rounded-l-[6px] border backdrop-blur-md flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_6px_20px_rgba(0,0,0,0.35)] ${
            isDarkMode
              ? 'bg-[#0A1628]/85 hover:bg-[#132847] border-[#38BDF8]/80 text-white'
              : 'bg-white/90 hover:bg-[#EBF3FF] border-[#1D63E8]/75 text-[#051630]'
          }`}
          title={`Xem bảng thông tin chi tiết: ${asset.name.vi} (Ảnh thực tế, dung tích, kích thước, khối lượng chuẩn)`}
          aria-label="Mở bảng thông tin chi tiết thiết bị"
        >
          <Info className="w-3.5 h-3.5 text-[#00BCEB] shrink-0" />
          <span className="text-[11.5px] font-extrabold whitespace-nowrap">
            Chi tiết
          </span>
          <ChevronRight className="w-3.5 h-3.5 opacity-80 shrink-0" />
        </button>
      )}

      {/* BẢNG TRƯỢT THÔNG MINH (SLIDE-OVER PANEL / DRAWER) Ở GÓC TRÁI MÀN HÌNH */}
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="false"
        aria-hidden={!isOpen}
        aria-label={`Thông tin chi tiết thiết bị: ${activeEntry.name}`}
        data-preview-module-id={activeEntry.moduleId}
        data-preview-mode={previewState.mode}
        onPointerEnter={() => equipmentImagePreviewController.onPanelPointerEnter()}
        onPointerLeave={() => equipmentImagePreviewController.onPanelPointerLeave()}
        onClick={(e) => e.stopPropagation()}
        className={`fixed sm:absolute ${drawerOffsetClass} z-[95] w-[284px] max-w-[calc(100vw-20px)] max-h-[calc(100dvh-88px)] overflow-y-auto overscroll-contain rounded-[14px] border-[1.5px] backdrop-blur-xl p-3 select-none transition-all duration-300 ease-out ${
          isOpen
            ? 'translate-x-0 opacity-100 pointer-events-auto'
            : '-translate-x-[120%] opacity-0 pointer-events-none'
        } ${
          isDarkMode
            ? 'bg-[#0A1628]/92 border-[#38BDF8]/90 text-white shadow-[0_18px_46px_rgba(0,0,0,0.72)]'
            : 'bg-white/95 border-[#1D63E8]/70 text-[#051630] shadow-[0_18px_46px_rgba(9,30,58,0.36)]'
        }`}
      >
        {/* 1. Header: Nhãn trạng thái, Tên thiết bị & Nút "Đóng (X)" rõ ràng để ẩn ngay khi không dùng đến */}
        <div className="flex items-start justify-between gap-2 mb-2.5 pb-2 border-b border-current/15">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] border text-[10.5px] font-extrabold ${
                  isDarkMode
                    ? 'bg-[#1E6BFF]/35 border-[#38BDF8]/80 text-[#7DD3FC]'
                    : 'bg-[#E6F0FF] border-[#1D63E8]/50 text-[#0B3A7D]'
                }`}
              >
                <Info className="w-3 h-3" />
                <span>Chi tiết thiết bị</span>
              </span>

              {hasValidRealPhoto && (
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[6px] border text-[10.5px] font-extrabold ${
                    isDarkMode
                      ? 'bg-emerald-500/30 border-emerald-300/75 text-emerald-100'
                      : 'bg-emerald-600 text-white border-emerald-700'
                  }`}
                >
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>Ảnh thật</span>
                </span>
              )}
            </div>

            <h3
              className={`text-[14.5px] font-extrabold leading-snug mt-1.5 line-clamp-2 ${
                isDarkMode ? 'text-white' : 'text-[#051630]'
              }`}
            >
              {activeEntry.name}
            </h3>
            <div
              className={`text-[11px] font-mono font-extrabold truncate ${
                isDarkMode ? 'text-[#7DD3FC]' : 'text-[#0B2D5C]'
              }`}
            >
              {activeEntry.moduleId}
            </div>
          </div>

          <button
            type="button"
            onClick={() => equipmentImagePreviewController.hide('close')}
            className="h-7 px-2.5 rounded-[8px] bg-[#DC2626] hover:bg-[#B91C1C] border border-[#F87171] text-white text-[11.5px] font-extrabold flex items-center justify-center gap-1 shrink-0 cursor-pointer transition-colors shadow-xs"
            title="Đóng bảng thông tin chi tiết thiết bị (Esc)"
            aria-label="Đóng bảng thông tin chi tiết thiết bị"
          >
            <span>Đóng</span>
            <X className="w-3.5 h-3.5 stroke-[2.8]" />
          </button>
        </div>

      {/* 2. Khung ảnh chuẩn 240 × 240 CSS px, tỷ lệ 1:1, object-fit: contain — KHÔNG LÀM MỜ HÌNH ẢNH */}
      <div
        style={{ backgroundColor: bgStyle }}
        className="w-[240px] h-[240px] mx-auto aspect-square rounded-[10px] border-[1.5px] border-slate-400/90 overflow-hidden flex items-center justify-center relative shadow-md"
      >
        {hasValidRealPhoto && realPhotoMeta.src ? (
          <img
            key={`${activeEntry.moduleId}-${realPhotoMeta.src}`}
            src={realPhotoMeta.src}
            alt={realPhotoMeta.alt || `Ảnh thực tế của ${activeEntry.name}`}
            width={240}
            height={240}
            onError={() => {
              equipmentImagePreviewController.reportImageLoadError(
                activeEntry.moduleId,
                realPhotoMeta.src || '',
                'Không thể tải tệp hình ảnh từ đường dẫn đã khai báo',
              );
            }}
            className="w-[240px] h-[240px] object-contain select-none"
          />
        ) : imageLoadError ? (
          <div className="w-full h-full bg-[#0B1528] text-white p-4 flex flex-col items-center justify-center text-center gap-2">
            <AlertCircle className="w-9 h-9 text-amber-400 stroke-[2.2]" />
            <div className="text-[13.5px] font-extrabold text-amber-300">
              Lỗi tải ảnh thực tế
            </div>
            <p className="text-[11.5px] text-slate-200 font-medium leading-snug line-clamp-3">
              {imageLoadError}
            </p>
            {asset && onOpenPhotoUpdaterForAsset && (
              <button
                type="button"
                onClick={() => onOpenPhotoUpdaterForAsset(asset)}
                className="mt-1 px-3 py-1.5 rounded-[7px] bg-[#1E6BFF] hover:bg-[#1552C7] text-white text-[11.5px] font-extrabold flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Cập nhật lại ảnh</span>
              </button>
            )}
          </div>
        ) : isLegacyIllustrationFallback && activeEntry.fallbackSvgMarkup ? (
          <div className="w-full h-full bg-[#0B1528] p-3 flex flex-col items-center justify-between text-center">
            <span className="px-2 py-0.5 rounded bg-amber-500/30 border border-amber-400/70 text-amber-200 text-[10.5px] font-extrabold">
              Minh họa cấu tạo (Fallback SVG)
            </span>
            <div
              className="w-[172px] h-[172px] flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
              dangerouslySetInnerHTML={{ __html: activeEntry.fallbackSvgMarkup }}
            />
            <span className="text-[11px] font-semibold text-slate-200">
              Chưa có ảnh chụp thật — nhấn Đổi ảnh để nạp
            </span>
          </div>
        ) : (
          /* Trạng thái "Chưa có ảnh thực tế" — chữ trắng đậm rõ trên nền tối của khung ảnh */
          <div className="w-full h-full bg-[#0A1324] text-white p-4 flex flex-col items-center justify-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-200">
              <ImageOff className="w-6 h-6" />
            </div>
            <div className="text-[14px] font-extrabold text-white">
              Chưa có ảnh thực tế
            </div>
            <p className="text-[11.5px] font-semibold text-slate-200 leading-snug">
              Thiết bị này đang ở chế độ mặc định. Nhấp chuột phải hoặc bấm nút bên dưới để cập nhật ảnh thực tế 240×240.
            </p>
            {asset && onOpenPhotoUpdaterForAsset && (
              <button
                type="button"
                onClick={() => onOpenPhotoUpdaterForAsset(asset)}
                className="mt-1 px-3.5 py-1.5 rounded-[8px] bg-[#1E6BFF] hover:bg-[#1552C7] border border-[#60A5FA] text-white text-[12px] font-extrabold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>+ Cập nhật ảnh thực tế</span>
              </button>
            )}
          </div>
        )}

        {/* Nhãn góc phải dưới hiển thị chuẩn kích thước khung 240×240 1:1 */}
        <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-slate-950/85 border border-white/20 text-white font-mono text-[10px] font-extrabold pointer-events-none">
          240×240 · 1:1
        </span>
      </div>

      {/* 3. Bảng Thông số kỹ thuật (Dung tích / GHĐ, Độ chia nhỏ nhất, Khối lượng chuẩn, Kích thước) */}
      {asset && (
        <div
          className={`mt-2.5 rounded-[10px] p-2 border backdrop-blur-sm grid grid-cols-2 gap-1.5 ${
            isDarkMode
              ? 'bg-slate-950/35 border-white/25 text-white'
              : 'bg-[#F0F6FF] border-[#9BB8DC] text-[#051630]'
          }`}
        >
          {capOrRange && (
            <div
              className={`px-2 py-1 rounded-[7px] border ${
                isDarkMode
                  ? 'bg-slate-900/45 border-white/20'
                  : 'bg-white border-[#B6CEEC]'
              }`}
            >
              <div
                className={`text-[10px] font-extrabold uppercase ${
                  isDarkMode ? 'text-slate-200' : 'text-[#0B2D5C]'
                }`}
              >
                GHĐ / Dung tích
              </div>
              <div
                className={`font-mono text-[12px] font-extrabold tabular-nums ${
                  isDarkMode ? 'text-[#38BDF8]' : 'text-[#073B6B]'
                }`}
              >
                {capOrRange.value} {capOrRange.unit}
              </div>
            </div>
          )}

          {leastCount && (
            <div
              className={`px-2 py-1 rounded-[7px] border ${
                isDarkMode
                  ? 'bg-slate-900/45 border-white/20'
                  : 'bg-white border-[#B6CEEC]'
              }`}
            >
              <div
                className={`text-[10px] font-extrabold uppercase ${
                  isDarkMode ? 'text-slate-200' : 'text-[#0B2D5C]'
                }`}
              >
                Độ chia nhỏ nhất
              </div>
              <div
                className={`font-mono text-[12px] font-extrabold tabular-nums ${
                  isDarkMode ? 'text-amber-300' : 'text-[#78350F]'
                }`}
              >
                {leastCount.value} {leastCount.unit}
              </div>
            </div>
          )}

          {refMass && (
            <div
              className={`px-2 py-1 rounded-[7px] border ${
                isDarkMode
                  ? 'bg-slate-900/45 border-white/20'
                  : 'bg-white border-[#B6CEEC]'
              }`}
            >
              <div
                className={`text-[10px] font-extrabold uppercase ${
                  isDarkMode ? 'text-slate-200' : 'text-[#0B2D5C]'
                }`}
              >
                Khối lượng chuẩn
              </div>
              <div
                className={`font-mono text-[12px] font-extrabold tabular-nums ${
                  isDarkMode ? 'text-[#5EEAD4]' : 'text-[#064E3B]'
                }`}
              >
                {refMass.value} {refMass.unit}
              </div>
            </div>
          )}

          {dimsText && (
            <div
              className={`px-2 py-1 rounded-[7px] border ${
                isDarkMode
                  ? 'bg-slate-900/45 border-white/20'
                  : 'bg-white border-[#B6CEEC]'
              }`}
            >
              <div
                className={`text-[10px] font-extrabold uppercase ${
                  isDarkMode ? 'text-slate-200' : 'text-[#0B2D5C]'
                }`}
              >
                Kích thước
              </div>
              <div
                className={`font-mono text-[11px] font-extrabold tabular-nums truncate ${
                  isDarkMode ? 'text-white' : 'text-[#051630]'
                }`}
              >
                {dimsText}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Chú thích & đường dẫn trong thư mục libraries3DLab */}
      {realPhotoMeta.caption && (
        <p
          className={`text-[11.5px] font-extrabold leading-snug mt-2 line-clamp-2 ${
            isDarkMode ? 'text-slate-100' : 'text-[#051630]'
          }`}
        >
          {realPhotoMeta.caption}
        </p>
      )}

      {activeEntry.isPreinstalledInLibraryDisk && (
        <div
          className={`mt-1.5 px-2 py-1 rounded-[6px] border flex items-center gap-1.5 text-[10.5px] font-mono font-bold truncate ${
            isDarkMode
              ? 'bg-emerald-500/18 border-emerald-400/50 text-emerald-100'
              : 'bg-emerald-500/15 border-emerald-700/40 text-[#064E3B]'
          }`}
        >
          <FolderCheck className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            libraries3DLab/{getLibraryFolderName(activeEntry.moduleId, activeEntry.slug)}
          </span>
        </div>
      )}

      {/* 5. Thanh thao tác nhanh: Đổi ảnh thật · Sửa thông số · Cập nhật HTML · Đặt lên bàn */}
      {asset && (
        <div
          className={`mt-2.5 pt-2 border-t space-y-1.5 ${
            isDarkMode ? 'border-white/20' : 'border-[#9BB8DC]'
          }`}
        >
          <div className="grid grid-cols-3 gap-1.5">
            {onOpenPhotoUpdaterForAsset && (
              <button
                type="button"
                onClick={() => onOpenPhotoUpdaterForAsset(asset)}
                className={`px-1.5 py-1.5 rounded-[8px] border-[1.5px] text-[11.5px] font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs ${
                  isDarkMode
                    ? 'bg-amber-500/22 hover:bg-amber-500/40 border-amber-300/85 text-amber-100'
                    : 'bg-amber-100 hover:bg-amber-200 border-amber-600/80 text-[#5C2804]'
                }`}
                title="Đổi hoặc cập nhật hình ảnh thực tế 240×240 cho thiết bị này"
              >
                <Camera className="w-3.5 h-3.5 shrink-0" />
                <span>Đổi ảnh</span>
              </button>
            )}

            {onInspectAssetDetail && (
              <button
                type="button"
                onClick={() => onInspectAssetDetail(asset, true)}
                className={`px-1.5 py-1.5 rounded-[8px] border-[1.5px] text-[11.5px] font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs ${
                  isDarkMode
                    ? 'bg-sky-500/22 hover:bg-sky-500/40 border-sky-300/85 text-sky-100'
                    : 'bg-sky-100 hover:bg-sky-200 border-sky-600/80 text-[#073B5E]'
                }`}
                title="Sửa thông số kỹ thuật & cài đặt thiết bị"
              >
                <Wrench className="w-3.5 h-3.5 shrink-0" />
                <span>Thông số</span>
              </button>
            )}

            {onOpenHtmlUpdaterForAsset && (
              <button
                type="button"
                onClick={() => onOpenHtmlUpdaterForAsset(asset)}
                className={`px-1.5 py-1.5 rounded-[8px] border-[1.5px] text-[11.5px] font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs ${
                  isDarkMode
                    ? 'bg-teal-500/22 hover:bg-teal-500/40 border-teal-300/85 text-teal-100'
                    : 'bg-emerald-100 hover:bg-emerald-200 border-emerald-600/80 text-[#043F2E]'
                }`}
                title="Cập nhật mã nguồn module .HTML cho thiết bị này"
              >
                <FileCode className="w-3.5 h-3.5 shrink-0" />
                <span>.HTML</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              onAddAssetToTable(asset.assetId);
              equipmentImagePreviewController.hide('close');
            }}
            className="w-full py-2 px-3 rounded-[9px] bg-[#1E6BFF] hover:bg-[#1552C7] border border-white/35 text-white text-[13px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.8]" />
            <span>Đặt lên bàn thí nghiệm</span>
          </button>
        </div>
      )}
      </aside>
    </>
  );
};

/**
 * MODAL CẬP NHẬT HÌNH ẢNH THỰC TẾ (240×240, 1:1, object-fit: contain) CHO TỪNG THIẾT BỊ
 * Sử dụng Glassmorphism xuyên thấu mô phỏng 3D phía sau; giữ nguyên độ nét 100% cho khung ảnh 240×240.
 */
interface EquipmentRealPhotoUpdaterModalProps {
  asset: AssetDefinition;
  onClose: () => void;
  onPhotoUpdated: (assetId: string, dataUrlOrPath: string, caption: string) => void;
  onSwitchToEditParams?: (asset: AssetDefinition) => void;
  onSwitchToHtmlUpdater?: (asset: AssetDefinition) => void;
}

export const EquipmentRealPhotoUpdaterModal: React.FC<
  EquipmentRealPhotoUpdaterModalProps
> = ({
  asset,
  onClose,
  onPhotoUpdated,
  onSwitchToEditParams,
  onSwitchToHtmlUpdater,
}) => {
  const existingEntry = equipmentImagePreviewController.getEntry(asset.assetId);
  const preinstalled = PREINSTALLED_LIBRARY_REAL_PHOTOS[asset.assetId];
  const folderName = getLibraryFolderName(asset.assetId, asset.slug);
  const defaultLibraryUrl = preinstalled
    ? `/libraries3DLab/${folderName}/assets/${preinstalled.slug}.${preinstalled.ext}`
    : '';

  const [previewSrc, setPreviewSrc] = useState<string>(
    () =>
      htmlEquipmentModuleRegistry.getUploadedRealPhoto(asset.assetId) ||
      existingEntry?.realPhotoMeta.src ||
      defaultLibraryUrl ||
      '',
  );
  const [urlInput, setUrlInput] = useState<string>('');
  const [caption, setCaption] = useState<string>(
    () =>
      existingEntry?.realPhotoMeta.caption ||
      `Ảnh thực tế của ${asset.name.vi} (${asset.assetId})`,
  );
  const [bgColor, setBgColor] = useState<string>(
    () => existingEntry?.realPhotoMeta.display?.background || '#ffffff',
  );
  const [isFormatting, setIsFormatting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);
    setIsFormatting(true);
    try {
      const formattedDataUrl = await formatImageToSquare240DataUrl(file, bgColor);
      setPreviewSrc(formattedDataUrl);
      setStatusMessage(
        `Đã tự động chuẩn hóa ảnh "${file.name}" về đúng khung vuông 240 × 240 px (tỷ lệ 1:1, giữ nguyên 100% chi tiết thiết bị, nền ${bgColor}).`,
      );
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Không thể xử lý tệp ảnh đã chọn.',
      );
    } finally {
      setIsFormatting(false);
      e.target.value = '';
    }
  };

  const handleApplyUrl = async () => {
    setErrorMessage(null);
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setErrorMessage('Vui lòng nhập đường dẫn URL ảnh hoặc đường dẫn tương đối ./assets/...');
      return;
    }
    const check = validateAndResolveImageSrc(trimmed, asset.assetId, asset.slug);
    if (!check.valid || !check.resolvedSrc) {
      setErrorMessage(check.rejectReason || 'Đường dẫn ảnh không hợp lệ.');
      return;
    }

    setIsFormatting(true);
    try {
      const formatted = await formatImageToSquare240DataUrl(
        check.resolvedSrc,
        bgColor,
      );
      setPreviewSrc(formatted);
      setStatusMessage(
        'Đã tải ảnh từ đường dẫn và tự động đóng khung chuẩn 240 × 240 px (1:1 contain).',
      );
    } catch {
      setPreviewSrc(check.resolvedSrc);
      setStatusMessage(
        'Đã áp dụng đường dẫn ảnh vào khung chuẩn 240 × 240 px (object-fit: contain).',
      );
    } finally {
      setIsFormatting(false);
    }
  };

  const handleRestoreLibraryDefault = () => {
    setErrorMessage(null);
    if (defaultLibraryUrl) {
      setPreviewSrc(defaultLibraryUrl);
      setStatusMessage(
        `Đã khôi phục về ảnh thực tế gốc trong thư mục libraries3DLab/${folderName}.`,
      );
    } else {
      setPreviewSrc('');
      setStatusMessage(
        'Đã đặt lại về trạng thái mặc định (Chưa có ảnh thực tế).',
      );
    }
  };

  const handleSave = () => {
    htmlEquipmentModuleRegistry.setUploadedRealPhoto(
      asset.assetId,
      previewSrc,
      caption.trim() || `Ảnh thực tế của ${asset.name.vi}`,
    );
    onPhotoUpdated(
      asset.assetId,
      previewSrc,
      caption.trim() || `Ảnh thực tế của ${asset.name.vi}`,
    );
    equipmentImagePreviewController.preview(asset.assetId, 'pinned');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-[16px] bg-[#0B172A]/68 backdrop-blur-2xl border-2 border-[#00BCEB]/85 text-white shadow-[0_20px_56px_rgba(0,0,0,0.68)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#081222]/65 border-b border-white/20 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-extrabold text-[#38BDF8] uppercase tracking-wider">
              CẬP NHẬT ẢNH THỰC TẾ 240×240 (CHUẨN HOST IMAGE BRIDGE v1.0)
            </div>
            <h2 className="text-[17px] font-extrabold text-white mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {asset.name.vi} ({asset.assetId})
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            {onSwitchToEditParams && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToEditParams(asset);
                }}
                className="px-2.5 py-1.5 rounded-[8px] bg-slate-900/65 hover:bg-slate-800 border border-amber-400/75 text-amber-200 text-[12px] font-extrabold flex items-center gap-1 cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Sửa thông số</span>
              </button>
            )}
            {onSwitchToHtmlUpdater && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToHtmlUpdater(asset);
                }}
                className="px-2.5 py-1.5 rounded-[8px] bg-teal-950/75 hover:bg-teal-900 border border-teal-400/80 text-teal-200 text-[12px] font-extrabold flex items-center gap-1 cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Cập nhật .HTML</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-[8px] bg-slate-900/75 hover:bg-rose-600 border border-white/25 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Cột trái: Khung xem trước đúng chuẩn 240 × 240 CSS px, tỷ lệ 1:1, object-fit: contain (Không làm mờ ảnh) */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="text-[12.5px] font-extrabold text-white mb-2">
              Khung hiển thị chuẩn (240 × 240 px · 1:1)
            </div>
            <div
              style={{ backgroundColor: bgColor }}
              className="w-[240px] h-[240px] aspect-square rounded-[12px] border-2 border-[#00BCEB] overflow-hidden flex items-center justify-center relative shadow-lg"
            >
              {previewSrc ? (
                <img
                  src={previewSrc}
                  alt={`Ảnh thực tế của ${asset.name.vi}`}
                  width={240}
                  height={240}
                  className="w-[240px] h-[240px] object-contain"
                />
              ) : (
                <div className="w-full h-full bg-slate-900 text-slate-200 p-4 flex flex-col items-center justify-center text-center gap-2">
                  <ImageOff className="w-8 h-8 text-slate-300" />
                  <span className="text-[13px] font-extrabold text-white">
                    Chưa có ảnh thực tế
                  </span>
                </div>
              )}
              <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-slate-950/85 text-white font-mono text-[10px] font-extrabold">
                240×240 contain
              </span>
            </div>

            <div className="mt-2.5 text-[11px] font-mono font-bold text-emerald-200 bg-emerald-950/60 border border-emerald-400/50 rounded px-2.5 py-1 text-center w-full truncate">
              libraries3DLab/{folderName}
            </div>
          </div>

          {/* Cột phải: Công cụ tải ảnh từ máy, nhập URL, tự động định dạng 240×240 (Nền kính mờ) */}
          <div className="md:col-span-7 space-y-3.5">
            {/* 1. Tải file từ máy tính */}
            <div className="p-3.5 rounded-[10px] bg-slate-950/45 backdrop-blur-md border border-white/25 space-y-2">
              <div className="text-[13px] font-extrabold text-white flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-[#38BDF8]" />
                <span>1. Tải ảnh từ máy tính / điện thoại (Tự động chuẩn hóa 240×240)</span>
              </div>
              <p className="text-[12px] font-medium text-slate-100 leading-snug">
                Ảnh dọc, ngang hay vuông đều được tự động đặt vừa khít vào canvas vuông 240 × 240 px với nền trung tính, giữ nguyên tỷ lệ và không cắt mất bộ phận thiết bị.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={isFormatting}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-[8px] bg-[#1E6BFF] hover:bg-[#1552C7] text-white text-[13px] font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isFormatting ? 'Đang định dạng 240×240...' : 'Chọn tệp ảnh từ máy...'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleRestoreLibraryDefault}
                  className="px-3 py-2 rounded-[8px] bg-slate-900/70 hover:bg-slate-800 border border-white/30 text-white text-[12px] font-extrabold flex items-center gap-1 cursor-pointer"
                  title="Khôi phục ảnh mặc định trong thư viện"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Mặc định</span>
                </button>
              </div>
            </div>

            {/* 2. Dán đường dẫn URL hoặc đường dẫn tương đối ./assets/... */}
            <div className="p-3.5 rounded-[10px] bg-slate-950/45 backdrop-blur-md border border-white/25 space-y-2">
              <div className="text-[13px] font-extrabold text-white flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-amber-300" />
                <span>2. Hoặc dùng URL ảnh / đường dẫn tương đối trong module</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="VD: ./assets/thiet-bi.webp hoặc https://..."
                  className="flex-1 px-3 py-1.5 rounded-[8px] bg-slate-950/70 border border-white/30 text-[12.5px] font-medium text-white placeholder:text-slate-300 focus:outline-none focus:border-[#00BCEB]"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-3 py-1.5 rounded-[8px] bg-amber-400 hover:bg-amber-300 text-slate-950 text-[12.5px] font-extrabold cursor-pointer shrink-0"
                >
                  Áp dụng
                </button>
              </div>
            </div>

            {/* 3. Chú thích & màu nền */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div className="sm:col-span-3">
                <label className="block text-[12px] font-extrabold text-white mb-1">
                  Chú thích hiển thị dưới ảnh (caption):
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-[8px] bg-slate-950/70 border border-white/30 text-[12.5px] font-semibold text-white"
                />
              </div>
              <div>
                <label className="block text-[12px] font-extrabold text-white mb-1">
                  Màu nền 1:1:
                </label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full h-[34px] rounded-[8px] bg-slate-950/70 border border-white/30 cursor-pointer p-0.5"
                />
              </div>
            </div>

            {statusMessage && (
              <div className="p-2.5 rounded-[8px] bg-emerald-950/75 border border-emerald-400/70 text-emerald-100 text-[12px] font-bold">
                {statusMessage}
              </div>
            )}

            {errorMessage && (
              <div className="p-2.5 rounded-[8px] bg-rose-950/75 border border-rose-400/70 text-rose-100 text-[12px] font-bold">
                {errorMessage}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#081222]/65 border-t border-white/20 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setPreviewSrc('');
              setStatusMessage('Đã xóa ảnh để chuyển về trạng thái "Chưa có ảnh thực tế".');
            }}
            className="px-3 py-1.5 rounded-[8px] bg-slate-900/75 hover:bg-rose-950 border border-rose-400/60 text-rose-200 text-[12px] font-extrabold cursor-pointer"
          >
            Để trạng thái "Chưa có ảnh"
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[8px] bg-slate-900/75 hover:bg-slate-800 border border-white/25 text-white text-[13px] font-extrabold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-[8px] bg-[#16A34A] hover:bg-[#15803D] border border-emerald-300/50 text-white text-[13.5px] font-extrabold cursor-pointer shadow-sm"
            >
              Lưu Ảnh Thực Tế Vào Thư Viện
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
