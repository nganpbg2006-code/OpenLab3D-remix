import React, { useState, useRef } from 'react';
import {
  AssetDefinition,
  EquipmentKit,
  ExperimentDefinition,
  SceneInstance,
} from '../../domain/types';
import { exportProjectToPptx } from '../../services/projectPptxExporter';
import equipmentStandardMdRaw from '../../../EQUIPMENT_MODULE_STANDARD.md?raw';
import { SAMPLE_PH_METER_HTML_MODULE } from '../../three-runtime/HtmlEquipmentModuleRegistry';
import {
  FlaskConical,
  ArrowRight,
  Play,
  Compass,
  Package,
  Plus,
  Upload,
  Trash2,
  Clock,
  FileSpreadsheet,
  Check,
  Home,
  Box,
  Wrench,
  FolderKanban,
  Download,
  FileText,
  FileCode2,
  Copy,
  ChevronDown,
  ChevronUp,
  Cpu,
} from 'lucide-react';

export interface PersonalLabProject {
  projectId: string;
  title: string;
  imageUrl: string;
  experimentId?: string;
  createdAt: string;
  savedInstancesJson?: string;
}

export function formatExactSaveDateTime(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${hours}:${minutes}:${seconds} · ${day}/${month}/${year}`;
}

export const DEFAULT_PERSONAL_LAB_PROJECTS: PersonalLabProject[] = [];

/* ============================================================================
   1. MÀN HÌNH TRANG CHỦ BAN ĐẦU (HOME DASHBOARD)
   - Hiển thị tiêu đề "OPEN LAB 3D"
   - Có đúng 2 khối (card) chức năng lớn được bố trí trực quan:
     + Khối 1: "Quản lý dự án thí nghiệm 3D"
     + Khối 2: "Dụng cụ thí nghiệm"
   ============================================================================ */
interface StudentHomeDashboardViewProps {
  projectsCount: number;
  equipmentCount: number;
  experimentsCount: number;
  isDarkMode?: boolean;
  onSelectProjectManager: () => void;
  onSelectEquipmentManager: () => void;
  onOpenHtmlModuleImporter?: (initialHtml?: string, initialFileName?: string) => void;
  onNotify?: (msg: string, tone?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const StudentHomeDashboardView: React.FC<
  StudentHomeDashboardViewProps
> = ({
  projectsCount,
  equipmentCount,
  experimentsCount,
  isDarkMode = false,
  onSelectProjectManager,
  onSelectEquipmentManager,
  onOpenHtmlModuleImporter,
  onNotify,
}) => {
  const [downloadedMd, setDownloadedMd] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [downloadedSampleHtml, setDownloadedSampleHtml] = useState(false);
  const [showMdPreview, setShowMdPreview] = useState(false);
  const [isDragOverHtml, setIsDragOverHtml] = useState(false);
  const quickHtmlInputRef = useRef<HTMLInputElement | null>(null);

  const triggerBrowserFileDownload = (
    content: string,
    fileName: string,
    mimeType: string,
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownloadStandardMd = () => {
    triggerBrowserFileDownload(
      equipmentStandardMdRaw,
      'OPENLAB_3D_EQUIPMENT_STANDARD.md',
      'text/markdown;charset=utf-8',
    );
    setDownloadedMd(true);
    onNotify?.(
      'Đã tải xuống tài liệu chuẩn kỹ thuật OPENLAB_3D_EQUIPMENT_STANDARD.md!',
      'success',
    );
    setTimeout(() => setDownloadedMd(false), 2600);
  };

  const handleCopyStandardMd = async () => {
    try {
      await navigator.clipboard.writeText(equipmentStandardMdRaw);
      setCopiedMd(true);
      onNotify?.(
        'Đã sao chép toàn bộ nội dung chuẩn kỹ thuật .md vào bộ nhớ tạm.',
        'success',
      );
      setTimeout(() => setCopiedMd(false), 2400);
    } catch {
      onNotify?.(
        'Không thể sao chép tự động — hãy bấm "Tải file chuẩn (.md)" để lưu trực tiếp về máy.',
        'warning',
      );
    }
  };

  const handleDownloadSampleHtml = () => {
    triggerBrowserFileDownload(
      SAMPLE_PH_METER_HTML_MODULE,
      'OpenLab3D_Sample_pH_Meter.html',
      'text/html;charset=utf-8',
    );
    setDownloadedSampleHtml(true);
    onNotify?.(
      'Đã tải file mẫu OpenLab3D_Sample_pH_Meter.html để tham khảo cấu trúc xuất HTML.',
      'info',
    );
    setTimeout(() => setDownloadedSampleHtml(false), 2600);
  };

  const handleReadUploadedHtmlFile = (file: File | undefined | null) => {
    if (!file) return;
    if (
      !file.name.toLowerCase().endsWith('.html') &&
      !file.name.toLowerCase().endsWith('.htm')
    ) {
      onNotify?.(
        'Vui lòng chọn tệp có định dạng .html hoặc .htm được xây dựng theo chuẩn OpenLab 3D.',
        'warning',
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      if (!text.trim()) {
        onNotify?.('Tệp .html vừa chọn đang trống.', 'error');
        return;
      }
      onOpenHtmlModuleImporter?.(text, file.name);
    };
    reader.onerror = () => {
      onNotify?.('Không thể đọc tệp .html từ máy tính.', 'error');
    };
    reader.readAsText(file, 'utf-8');
  };

  return (
    <div
      id="home-dashboard-view"
      className={`flex-1 w-full overflow-y-auto px-4 py-8 sm:px-8 lg:px-12 flex flex-col items-center justify-start transition-colors ${
        isDarkMode
          ? 'bg-[#081222] text-slate-100'
          : 'bg-[#EEF5FF] text-[#0D2750]'
      }`}
    >
      <input
        ref={quickHtmlInputRef}
        type="file"
        accept=".html,.htm"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          handleReadUploadedHtmlFile(f);
        }}
      />
      <div className="w-full max-w-6xl mx-auto my-auto space-y-7 pb-6">
        {/* Tiêu đề trang chủ OPEN LAB */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-[16px] bg-[#1E6BFF] border-2 border-[#38BDF8] text-white flex items-center justify-center shadow-md">
              <FlaskConical className="w-8 h-8" />
            </div>
            <h1
              className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight ${
                isDarkMode ? 'text-white' : 'text-[#09234C]'
              }`}
            >
              OPEN LAB <span className="text-[#1E6BFF]">3D</span>
            </h1>
          </div>
          <p
            className={`max-w-2xl mx-auto text-base sm:text-lg font-semibold ${
              isDarkMode ? 'text-slate-300' : 'text-[#425B80]'
            }`}
          >
            Không gian thực hành thí nghiệm khoa học ảo 3D trực quan · Chọn phân hệ bên dưới để bắt đầu làm việc
          </p>
        </header>

        {/* Đúng 2 khối (card) chức năng lớn trên màn hình Trang chủ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* KHỐI 1: QUẢN LÝ DỰ ÁN THÍ NGHIỆM 3D */}
          <div
            role="button"
            tabIndex={0}
            onClick={onSelectProjectManager}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectProjectManager();
              }
            }}
            className={`group rounded-[22px] border-2 p-7 sm:p-9 flex flex-col justify-between gap-6 text-left transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1E6BFF]/40 ${
              isDarkMode
                ? 'bg-[#0F1E36] border-[#264B82] hover:border-[#38BDF8] hover:bg-[#132644] shadow-lg'
                : 'bg-white border-[#C5DCFA] hover:border-[#1E6BFF] shadow-sm hover:shadow-xl'
            }`}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="w-16 h-16 rounded-[16px] bg-[#1E6BFF] group-hover:bg-[#1557D6] text-white flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-105">
                  <FolderKanban className="w-8 h-8" />
                </div>
                <span
                  className={`text-sm font-bold ${
                    isDarkMode ? 'text-[#7DD3FC]' : 'text-[#1E6BFF]'
                  }`}
                >
                  {projectsCount} dự án đã lưu · {experimentsCount} bài mẫu SGK
                </span>
              </div>

              <div className="space-y-2.5">
                <h2
                  className={`text-2xl sm:text-3xl font-black tracking-tight group-hover:text-[#1E6BFF] transition-colors ${
                    isDarkMode ? 'text-white' : 'text-[#09234C]'
                  }`}
                >
                  Quản lý dự án thí nghiệm 3D
                </h2>
                <p
                  className={`text-[15px] leading-relaxed font-medium ${
                    isDarkMode ? 'text-slate-300' : 'text-[#425B80]'
                  }`}
                >
                  Khởi tạo dự án mới với bàn thí nghiệm trống, mở lại các dự án đã lưu, tải ảnh minh họa và xuất bản hồ sơ báo cáo ra file PowerPoint (.pptx) độc lập.
                </p>
              </div>

              <div
                className={`pt-2 space-y-2 text-[13.5px] font-semibold ${
                  isDarkMode ? 'text-slate-300' : 'text-[#334E73]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#1E6BFF] shrink-0 stroke-[2.8]" />
                  <span>Tạo & lưu trữ không giới hạn dự án thí nghiệm 3D cá nhân</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#1E6BFF] shrink-0 stroke-[2.8]" />
                  <span>Thực hành tương tác trực tiếp với bộ bài học chuẩn SGK</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#1E6BFF] shrink-0 stroke-[2.8]" />
                  <span>Xuất bản báo cáo PowerPoint (.pptx) kèm sơ đồ 2D & công thức Unicode</span>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectProjectManager();
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-[12px] bg-[#1E6BFF] group-hover:bg-[#1557D6] text-white text-[14.5px] font-extrabold shadow-xs transition-colors cursor-pointer"
              >
                <span>Mở Quản lý dự án 3D</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* KHỐI 2: DỤNG CỤ THÍ NGHIỆM */}
          <div
            role="button"
            tabIndex={0}
            onClick={onSelectEquipmentManager}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectEquipmentManager();
              }
            }}
            className={`group rounded-[22px] border-2 p-7 sm:p-9 flex flex-col justify-between gap-6 text-left transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#059669]/40 ${
              isDarkMode
                ? 'bg-[#0F1E36] border-[#264B82] hover:border-[#34D399] hover:bg-[#132644] shadow-lg'
                : 'bg-white border-[#C5DCFA] hover:border-[#059669] shadow-sm hover:shadow-xl'
            }`}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="w-16 h-16 rounded-[16px] bg-[#059669] group-hover:bg-[#047857] text-white flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-105">
                  <Wrench className="w-8 h-8" />
                </div>
                <span
                  className={`text-sm font-bold ${
                    isDarkMode ? 'text-[#6EE7B7]' : 'text-[#059669]'
                  }`}
                >
                  {equipmentCount} thiết bị 3D · Vật lý · Hóa học · Sinh học
                </span>
              </div>

              <div className="space-y-2.5">
                <h2
                  className={`text-2xl sm:text-3xl font-black tracking-tight group-hover:text-[#059669] transition-colors ${
                    isDarkMode ? 'text-white' : 'text-[#09234C]'
                  }`}
                >
                  Dụng cụ thí nghiệm
                </h2>
                <p
                  className={`text-[15px] leading-relaxed font-medium ${
                    isDarkMode ? 'text-slate-300' : 'text-[#425B80]'
                  }`}
                >
                  Không gian tự thiết kế dụng cụ thí nghiệm mới tích hợp AI ngay trên web: tải ảnh thực tế hoặc bản vẽ phác thảo, nhập thông số vật lý, nhờ AI phân tích chế tạo 3D/HTML, xem trước trực quan 360° và xác nhận đưa thẳng lên bàn thí nghiệm.
                </p>
              </div>

              <div
                className={`pt-2 space-y-2 text-[13.5px] font-semibold ${
                  isDarkMode ? 'text-slate-300' : 'text-[#334E73]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#059669] shrink-0 stroke-[2.8]" />
                  <span>Bước 1 &amp; 2: Tải ảnh thực tế / phác thảo &amp; nhờ AI phân tích chế tạo 3D</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#059669] shrink-0 stroke-[2.8]" />
                  <span>Bước 3: Xem trước (Live Preview) khối 3D/HTML xoay 360° trực tiếp</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#059669] shrink-0 stroke-[2.8]" />
                  <span>Bước 4: Xác nhận lưu vào kho &amp; đặt lên bàn 3D hoặc yêu cầu AI sửa thêm</span>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectEquipmentManager();
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-[12px] bg-[#059669] group-hover:bg-[#047857] text-white text-[14.5px] font-extrabold shadow-xs transition-colors cursor-pointer"
              >
                <Box className="w-4 h-4" />
                <span>Mở Tự thiết kế Dụng cụ AI</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* MỤC 3: ỨNG DỤNG KỸ THUẬT VÀO THỰC TẾ (.md -> tự làm ứng dụng riêng -> xuất .html -> tải lên OpenLab 3D) */}
        <section
          aria-labelledby="home-engineering-practice-heading"
          className={`rounded-[22px] border-2 overflow-hidden transition-colors ${
            isDarkMode
              ? 'bg-[#0F1E36] border-[#264B82] shadow-lg'
              : 'bg-white border-[#C5DCFA] shadow-sm'
          }`}
        >
          {/* Phần đầu mục */}
          <div
            className={`px-7 py-6 sm:px-9 sm:py-7 border-b flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
              isDarkMode ? 'border-[#1F3A66]' : 'border-[#DCEBFE]'
            }`}
          >
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-[15px] bg-[#D97706] text-white flex items-center justify-center shrink-0 shadow-md">
                <Cpu className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h2
                  id="home-engineering-practice-heading"
                  className={`text-2xl sm:text-[26px] font-black tracking-tight ${
                    isDarkMode ? 'text-white' : 'text-[#09234C]'
                  }`}
                >
                  Ứng dụng kỹ thuật vào thực tế
                </h2>
                <p
                  className={`text-[14.5px] font-medium leading-relaxed max-w-2xl ${
                    isDarkMode ? 'text-slate-300' : 'text-[#425B80]'
                  }`}
                >
                  Tải tài liệu đặc tả kỹ thuật (.md) để tự lập trình ứng dụng hoặc thiết bị 3D riêng, đóng gói xuất ra tệp .html độc lập và tải trực tiếp lên phòng thí nghiệm OpenLab 3D.
                </p>
              </div>
            </div>

            <div
              className={`text-[12.5px] font-semibold shrink-0 ${
                isDarkMode ? 'text-amber-300/90' : 'text-[#92400E]'
              }`}
            >
              <span>Chuẩn kỹ thuật v2.4</span>
              <span className="mx-2 opacity-50" aria-hidden="true">·</span>
              <span>Xuất .html độc lập</span>
              <span className="mx-2 opacity-50" aria-hidden="true">·</span>
              <span>Kiểm định 7 cổng</span>
            </div>
          </div>

          {/* Quy trình 3 bước khép kín: Tải .md -> Xây dựng & Xuất .html -> Tải .html lên */}
          <div
            className={`grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x ${
              isDarkMode ? 'divide-[#1F3A66]' : 'divide-[#DCEBFE]'
            }`}
          >
            {/* BƯỚC 01: TẢI FILE .MD CHUẨN */}
            <div className="p-6 sm:p-7 flex flex-col justify-between gap-5">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[13px] font-mono font-bold tabular-nums ${
                      isDarkMode ? 'text-amber-300' : 'text-[#B45309]'
                    }`}
                  >
                    01. Tài liệu chuẩn kỹ thuật (.md)
                  </span>
                  <FileText
                    className={`w-4 h-4 shrink-0 ${
                      isDarkMode ? 'text-amber-300/80' : 'text-[#D97706]'
                    }`}
                  />
                </div>
                <h3
                  className={`text-lg font-extrabold tracking-tight ${
                    isDarkMode ? 'text-white' : 'text-[#09234C]'
                  }`}
                >
                  Tải file đặc tả chuẩn .md
                </h3>
                <p
                  className={`text-[13.5px] leading-relaxed font-medium ${
                    isDarkMode ? 'text-slate-300' : 'text-[#425B80]'
                  }`}
                >
                  File <span className="font-mono text-[12.5px]">OPENLAB_3D_EQUIPMENT_STANDARD.md</span> quy định đầy đủ 4 khối DOM, hệ trục SI (mét), vật liệu PBR Three.js, thanh điều khiển và tiêu chuẩn 7 cổng kiểm định.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadStandardMd}
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[11px] text-[13.5px] font-extrabold transition-colors cursor-pointer shadow-xs ${
                    downloadedMd
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#D97706] hover:bg-[#B45309] text-white'
                  }`}
                >
                  {downloadedMd ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2.8]" />
                      <span>Đã tải file chuẩn (.md)</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Tải file chuẩn (.md)</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={handleCopyStandardMd}
                    className={`inline-flex items-center gap-1.5 text-[12.5px] font-bold transition-colors cursor-pointer ${
                      isDarkMode
                        ? 'text-slate-300 hover:text-amber-300'
                        : 'text-[#334E73] hover:text-[#B45309]'
                    }`}
                  >
                    {copiedMd ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedMd ? 'Đã sao chép .md' : 'Sao chép nội dung .md'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowMdPreview((prev) => !prev)}
                    className={`inline-flex items-center gap-1 text-[12.5px] font-bold transition-colors cursor-pointer ${
                      isDarkMode
                        ? 'text-sky-300 hover:text-sky-200'
                        : 'text-[#1E6BFF] hover:text-[#1557D6]'
                    }`}
                  >
                    <span>{showMdPreview ? 'Thu gọn' : 'Xem nhanh'}</span>
                    {showMdPreview ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* BƯỚC 02: TỰ LÀM ỨNG DỤNG RIÊNG & XUẤT FILE .HTML */}
            <div className="p-6 sm:p-7 flex flex-col justify-between gap-5">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[13px] font-mono font-bold tabular-nums ${
                      isDarkMode ? 'text-sky-300' : 'text-[#1E6BFF]'
                    }`}
                  >
                    02. Tự phát triển &amp; đóng gói (.html)
                  </span>
                  <FileCode2
                    className={`w-4 h-4 shrink-0 ${
                      isDarkMode ? 'text-sky-300/80' : 'text-[#1E6BFF]'
                    }`}
                  />
                </div>
                <h3
                  className={`text-lg font-extrabold tracking-tight ${
                    isDarkMode ? 'text-white' : 'text-[#09234C]'
                  }`}
                >
                  Tự làm ứng dụng riêng &amp; xuất file .html
                </h3>
                <p
                  className={`text-[13.5px] leading-relaxed font-medium ${
                    isDarkMode ? 'text-slate-300' : 'text-[#425B80]'
                  }`}
                >
                  Sử dụng file <span className="font-mono text-[12.5px]">.md</span> để tự lập trình bằng VS Code / Three.js hoặc gửi kèm cho công cụ AI bất kỳ, sau đó xuất ra đúng 1 tệp <span className="font-mono text-[12.5px]">.html</span> hoàn chỉnh.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadSampleHtml}
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[11px] border text-[13.5px] font-extrabold transition-colors cursor-pointer ${
                    downloadedSampleHtml
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : isDarkMode
                        ? 'bg-[#13284A] hover:bg-[#1A3561] border-[#2C528C] text-sky-200'
                        : 'bg-[#F2F7FF] hover:bg-[#E1EDFF] border-[#9EC5F8] text-[#12346B]'
                  }`}
                >
                  {downloadedSampleHtml ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2.8]" />
                      <span>Đã tải file .HTML mẫu</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Tải file .HTML mẫu tham khảo</span>
                    </>
                  )}
                </button>

                <p
                  className={`text-[12px] font-medium leading-snug ${
                    isDarkMode ? 'text-slate-400' : 'text-[#5A7294]'
                  }`}
                >
                  Tệp mẫu chạy được độc lập trên trình duyệt để bạn kiểm tra 3D 360° trước khi tải lên.
                </p>
              </div>
            </div>

            {/* BƯỚC 03: TẢI FILE .HTML LÊN OPENLAB 3D */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOverHtml(true);
              }}
              onDragLeave={() => setIsDragOverHtml(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOverHtml(false);
                const dropped = e.dataTransfer.files?.[0];
                handleReadUploadedHtmlFile(dropped);
              }}
              className={`p-6 sm:p-7 flex flex-col justify-between gap-5 transition-colors ${
                isDragOverHtml
                  ? isDarkMode
                    ? 'bg-[#16315B]'
                    : 'bg-[#E5F0FF]'
                  : ''
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[13px] font-mono font-bold tabular-nums ${
                      isDarkMode ? 'text-emerald-300' : 'text-[#059669]'
                    }`}
                  >
                    03. Nạp lên phòng thí nghiệm 3D
                  </span>
                  <Upload
                    className={`w-4 h-4 shrink-0 ${
                      isDarkMode ? 'text-emerald-300/80' : 'text-[#059669]'
                    }`}
                  />
                </div>
                <h3
                  className={`text-lg font-extrabold tracking-tight ${
                    isDarkMode ? 'text-white' : 'text-[#09234C]'
                  }`}
                >
                  Tải file .html lên để chạy trực tiếp
                </h3>
                <p
                  className={`text-[13.5px] leading-relaxed font-medium ${
                    isDarkMode ? 'text-slate-300' : 'text-[#425B80]'
                  }`}
                >
                  Chọn hoặc kéo thả file <span className="font-mono text-[12.5px]">.html</span> vừa xuất vào đây. Hệ thống tự động kiểm tra 7 cổng kỹ thuật, dựng hình 3D và đặt ngay lên bàn thí nghiệm.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => quickHtmlInputRef.current?.click()}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[11px] bg-[#1E6BFF] hover:bg-[#1557D6] text-white text-[13.5px] font-extrabold transition-colors cursor-pointer shadow-xs"
                >
                  <Upload className="w-4 h-4" />
                  <span>Chọn file .HTML để tải lên</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => onOpenHtmlModuleImporter?.()}
                    className={`inline-flex items-center gap-1.5 text-[12.5px] font-bold transition-colors cursor-pointer ${
                      isDarkMode
                        ? 'text-slate-300 hover:text-sky-300'
                        : 'text-[#334E73] hover:text-[#1E6BFF]'
                    }`}
                  >
                    <FileCode2 className="w-3.5 h-3.5" />
                    <span>Mở trình dán mã &amp; kiểm định .HTML</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Khung xem nhanh nội dung tài liệu chuẩn .md (mở khi bấm "Xem nhanh") */}
          {showMdPreview && (
            <div
              className={`border-t px-6 py-5 sm:px-9 ${
                isDarkMode
                  ? 'bg-[#091528] border-[#1F3A66]'
                  : 'bg-[#F8FBFF] border-[#DCEBFE]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <span
                  className={`text-[13px] font-mono font-bold ${
                    isDarkMode ? 'text-amber-300' : 'text-[#92400E]'
                  }`}
                >
                  OPENLAB_3D_EQUIPMENT_STANDARD.md ({Math.round(equipmentStandardMdRaw.length / 1024)} KB)
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCopyStandardMd}
                    className={`inline-flex items-center gap-1.5 text-[12.5px] font-bold cursor-pointer ${
                      isDarkMode
                        ? 'text-slate-200 hover:text-amber-300'
                        : 'text-[#12346B] hover:text-[#B45309]'
                    }`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedMd ? 'Đã sao chép' : 'Sao chép toàn bộ'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadStandardMd}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#D97706] hover:bg-[#B45309] text-white text-[12.5px] font-extrabold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải về máy (.md)</span>
                  </button>
                </div>
              </div>
              <pre
                className={`max-h-72 overflow-y-auto rounded-[12px] border p-4 text-[12px] leading-relaxed font-mono whitespace-pre-wrap ${
                  isDarkMode
                    ? 'bg-[#050D1A] border-[#1E3458] text-slate-200'
                    : 'bg-white border-[#CBDDF7] text-[#1E3A5F]'
                }`}
              >
                {equipmentStandardMdRaw}
              </pre>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

/* ============================================================================
   2. GIAO DIỆN QUẢN LÝ DỰ ÁN THÍ NGHIỆM 3D TOÀN CHIỀU RỘNG
   ============================================================================ */
interface StudentPersonalProjectsViewProps {
  projects: PersonalLabProject[];
  experiments: ExperimentDefinition[];
  kits?: EquipmentKit[];
  assetsMap?: Map<string, AssetDefinition>;
  isDarkMode?: boolean;
  onBackToHomeDashboard?: () => void;
  onCreateProject: (project: PersonalLabProject, openImmediately: boolean) => void;
  onUpdateProjectImage: (projectId: string, newImageUrl: string) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenProjectIn3DWorkbench: (project: PersonalLabProject) => void;
  onEnterFree3DWorkbench: () => void;
  onStartExperiment?: (experimentId: string) => void;
  onOpenExploreEquipment?: () => void;
  onOpenMyKits?: () => void;
  onOpenHelp?: () => void;
  onExportProjectPptxSuccess?: (fileName: string, projectTitle: string) => void;
}

export const StudentPersonalProjectsView: React.FC<
  StudentPersonalProjectsViewProps
> = ({
  projects,
  experiments,
  kits = [],
  assetsMap = new Map(),
  isDarkMode = false,
  onBackToHomeDashboard,
  onUpdateProjectImage,
  onDeleteProject,
  onOpenProjectIn3DWorkbench,
  onEnterFree3DWorkbench,
  onStartExperiment,
  onOpenExploreEquipment,
  onOpenMyKits,
  onOpenHelp,
  onExportProjectPptxSuccess,
}) => {
  const [uploadingProjectId, setUploadingProjectId] = useState<string | null>(
    null,
  );
  const [exportingProjectId, setExportingProjectId] = useState<string | null>(
    null,
  );
  const [exportedProjectId, setExportedProjectId] = useState<string | null>(
    null,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [brokenImageIds, setBrokenImageIds] = useState<Set<string>>(
    () => new Set(),
  );
  const cardImageInputRef = useRef<HTMLInputElement | null>(null);

  const handleExportCardToPptx = async (
    e: React.MouseEvent,
    project: PersonalLabProject,
  ) => {
    e.stopPropagation();
    if (exportingProjectId) return;
    setExportingProjectId(project.projectId);
    try {
      let parsedInstances: SceneInstance[] = [];
      if (project.savedInstancesJson) {
        try {
          const raw = JSON.parse(project.savedInstancesJson);
          if (Array.isArray(raw)) {
            parsedInstances = raw;
          }
        } catch {
          parsedInstances = [];
        }
      }
      const matchedExp =
        experiments.find((ex) => ex.experimentId === project.experimentId) ||
        experiments[0] ||
        null;

      const fileName = await exportProjectToPptx({
        project,
        instances: parsedInstances,
        assetsMap,
        experiment: matchedExp,
      });

      setExportedProjectId(project.projectId);
      setTimeout(() => {
        setExportedProjectId((prev) =>
          prev === project.projectId ? null : prev,
        );
      }, 2800);

      if (onExportProjectPptxSuccess) {
        onExportProjectPptxSuccess(fileName, project.title);
      }
    } catch {
      setUploadError('Không thể xuất bản file PowerPoint (.pptx). Vui lòng thử lại.');
    } finally {
      setExportingProjectId(null);
    }
  };

  const handleTriggerCardImageUpload = (
    e: React.MouseEvent,
    projectId: string,
  ) => {
    e.stopPropagation();
    setUploadError(null);
    setUploadingProjectId(projectId);
    if (cardImageInputRef.current) {
      cardImageInputRef.current.value = '';
      cardImageInputRef.current.click();
    }
  };

  const handleCardImageFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    const targetId = uploadingProjectId;
    if (!file || !targetId) return;

    if (!file.type.startsWith('image/')) {
      setUploadError(
        'Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WEBP, SVG) từ máy tính.',
      );
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = reader.result;
      if (typeof rawDataUrl !== 'string') return;

      // Nén nhẹ nếu ảnh độ phân giải lớn để lưu bền vững vào localStorage
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 960;
          let w = img.naturalWidth || img.width;
          let h = img.naturalHeight || img.height;
          if (w > maxDim || h > maxDim) {
            const ratio = Math.min(maxDim / w, maxDim / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const optimizedUrl = canvas.toDataURL('image/webp', 0.88);
            setBrokenImageIds((prev) => {
              const next = new Set(prev);
              next.delete(targetId);
              return next;
            });
            onUpdateProjectImage(targetId, optimizedUrl);
            return;
          }
        } catch {
          // Fallback về dataUrl gốc
        }
        setBrokenImageIds((prev) => {
          const next = new Set(prev);
          next.delete(targetId);
          return next;
        });
        onUpdateProjectImage(targetId, rawDataUrl);
      };
      img.onerror = () => {
        onUpdateProjectImage(targetId, rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.onerror = () => {
      setUploadError('Không thể đọc tệp hình ảnh vừa chọn.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      id="project-manager-view"
      className={`flex-1 w-full overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 transition-colors ${
        isDarkMode
          ? 'bg-[#081222] text-slate-100'
          : 'bg-[#EEF5FF] text-[#0D2750]'
      }`}
    >
      {/* Input ẩn dùng chung để tải ảnh minh họa từ máy tính cho từng thẻ dự án */}
      <input
        ref={cardImageInputRef}
        type="file"
        accept="image/*"
        onChange={handleCardImageFileChange}
        className="hidden"
      />

      <div className="w-full max-w-none space-y-5">
        {/* Header Quản lý dự án cá nhân — Toàn chiều rộng trang */}
        <div
          className={`w-full rounded-[16px] p-4 sm:p-5 border flex flex-col xl:flex-row xl:items-center justify-between gap-4 ${
            isDarkMode
              ? 'bg-[#0F1E36] border-[#264B82]'
              : 'bg-white border-[#C5DCFA] shadow-xs'
          }`}
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-[12px] bg-[#1E6BFF] text-white flex items-center justify-center shrink-0 shadow-sm">
              <FlaskConical className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1
                  className={`text-2xl sm:text-3xl font-black tracking-tight ${
                    isDarkMode ? 'text-white' : 'text-[#09234C]'
                  }`}
                >
                  Quản lý dự án thí nghiệm 3D
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[12px] font-extrabold border ${
                    isDarkMode
                      ? 'bg-[#132644] border-[#38BDF8]/50 text-[#7DD3FC]'
                      : 'bg-[#EAF3FF] border-[#9EC5F8] text-[#1E6BFF]'
                  }`}
                >
                  {projects.length} dự án đã lưu
                </span>
              </div>
              <p
                className={`text-[13.5px] font-medium mt-0.5 ${
                  isDarkMode ? 'text-slate-300' : 'text-[#425B80]'
                }`}
              >
                Bấm &ldquo;+ Thêm dự án&rdquo; để vào bàn thí nghiệm trống, nhập tên &amp; bấm Lưu · Click vào khung hình để tải ảnh minh họa
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onBackToHomeDashboard && (
              <button
                type="button"
                onClick={onBackToHomeDashboard}
                className={`px-3.5 py-2 rounded-[10px] border text-[13px] font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  isDarkMode
                    ? 'bg-[#152A4A] hover:bg-[#1E3B68] border-[#2C528C] text-slate-100'
                    : 'bg-[#F2F7FF] hover:bg-[#E1EDFF] border-[#C5DCFA] text-[#12346B]'
                }`}
                title="Quay lại màn hình Trang chủ OPEN LAB 3D"
              >
                <Home className="w-4 h-4 text-[#1E6BFF]" />
                <span>Trang chủ</span>
              </button>
            )}

            {onOpenExploreEquipment && (
              <button
                type="button"
                onClick={onOpenExploreEquipment}
                className={`px-3.5 py-2 rounded-[10px] border text-[13px] font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  isDarkMode
                    ? 'bg-[#152A4A] hover:bg-[#1E3B68] border-[#2C528C] text-slate-100'
                    : 'bg-[#F2F7FF] hover:bg-[#E1EDFF] border-[#C5DCFA] text-[#12346B]'
                }`}
              >
                <Compass className="w-4 h-4 text-[#059669]" />
                <span>Dụng cụ thí nghiệm</span>
              </button>
            )}

            {onOpenMyKits && kits.length > 0 && (
              <button
                type="button"
                onClick={onOpenMyKits}
                className={`px-3.5 py-2 rounded-[10px] border text-[13px] font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  isDarkMode
                    ? 'bg-[#152A4A] hover:bg-[#1E3B68] border-[#2C528C] text-slate-100'
                    : 'bg-[#F2F7FF] hover:bg-[#E1EDFF] border-[#C5DCFA] text-[#12346B]'
                }`}
              >
                <Package className="w-4 h-4 text-[#D97706]" />
                <span>Bộ dụng cụ mẫu ({kits.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={onEnterFree3DWorkbench}
              className="px-4 py-2.5 rounded-[10px] bg-[#1E6BFF] hover:bg-[#1557D6] text-white font-extrabold text-[13.5px] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
            >
              <Plus className="w-4 h-4 stroke-[2.8]" />
              <span>+ Thêm dự án (Bàn thí nghiệm trống)</span>
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="rounded-[12px] border border-rose-400 bg-rose-500/10 px-4 py-2.5 text-[13.5px] font-bold text-rose-600 dark:text-rose-300">
            {uploadError}
          </div>
        )}

        {/* ===================================================================
            DANH SÁCH CÁC DỰ ÁN CÁ NHÂN MỞ RỘNG TOÀN CHIỀU RỘNG TRANG
            - Ô đầu tiên: Dấu cộng (+) to ở giữa kèm chữ "Thêm dự án" -> Mở bàn thí nghiệm trống
            - Các ô dự án đã lưu:
              + Khung hình minh họa (click để tải ảnh từ máy tính)
              + Tên dự án & thời gian lưu
           =================================================================== */}
        <section aria-label="Danh sách dự án cá nhân" className="w-full">
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 lg:gap-6 items-stretch">
            {/* 1. Ô ĐẦU TIÊN: DẤU CỘNG TO Ở GIỮA KÈM CHỮ "THÊM DỰ ÁN" -> MỞ BÀN THÍ NGHIỆM TRỐNG */}
            <button
              type="button"
              onClick={onEnterFree3DWorkbench}
              className={`group min-h-[320px] rounded-[18px] border-2 border-dashed p-6 flex flex-col items-center justify-center gap-4 transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1E6BFF]/40 ${
                isDarkMode
                  ? 'bg-[#0F1E36]/70 hover:bg-[#132644] border-[#38BDF8]/60 hover:border-[#38BDF8] text-white'
                  : 'bg-white/85 hover:bg-white border-[#1E6BFF]/60 hover:border-[#1E6BFF] text-[#09234C] shadow-xs hover:shadow-md'
              }`}
            >
              <div className="w-20 h-20 rounded-full bg-[#1E6BFF] group-hover:bg-[#1557D6] text-white flex items-center justify-center shadow-md transition-transform duration-150 group-hover:scale-110">
                <Plus className="w-11 h-11 stroke-[2.8]" />
              </div>
              <div className="text-center space-y-1.5">
                <span className="block text-xl font-black tracking-tight group-hover:text-[#1E6BFF] transition-colors">
                  + Thêm dự án
                </span>
                <span
                  className={`block text-[13px] font-medium leading-relaxed ${
                    isDarkMode ? 'text-slate-300' : 'text-[#506789]'
                  }`}
                >
                  Vào bàn thí nghiệm trống, nhập tên dự án và bấm Lưu
                </span>
              </div>
            </button>

            {/* 2. CÁC Ô DỰ ÁN ĐÃ LƯU */}
            {projects.map((project) => {
              const hasValidImage =
                Boolean(project.imageUrl && project.imageUrl.trim()) &&
                !brokenImageIds.has(project.projectId);

              return (
                <article
                  key={project.projectId}
                  onClick={() => onOpenProjectIn3DWorkbench(project)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOpenProjectIn3DWorkbench(project);
                    }
                  }}
                  title={`Click để mở dự án "${project.title}" trong Phòng thí nghiệm 3D`}
                  className={`group min-h-[320px] rounded-[18px] border-2 overflow-hidden flex flex-col justify-between transition-all duration-150 cursor-pointer ${
                    isDarkMode
                      ? 'bg-[#0F1E36] border-[#264B82] hover:border-[#38BDF8] shadow-sm'
                      : 'bg-white border-[#C5DCFA] hover:border-[#1E6BFF] shadow-xs hover:shadow-md'
                  }`}
                >
                  {/* KHUNG HÌNH MINH HỌA CỦA DỰ ÁN — Click mở phòng thí nghiệm, nút riêng để tải/đổi ảnh */}
                  <div
                    className={`h-48 w-full relative overflow-hidden border-b flex items-center justify-center transition-colors ${
                      isDarkMode
                        ? 'bg-[#091528] group-hover:bg-[#0D1E38] border-[#1E3458]'
                        : 'bg-[#F3F8FF] group-hover:bg-[#E7F1FF] border-[#D4E6FF]'
                    }`}
                  >
                    {hasValidImage ? (
                      <>
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          referrerPolicy="no-referrer"
                          onError={() => {
                            setBrokenImageIds((prev) => {
                              const next = new Set(prev);
                              next.add(project.projectId);
                              return next;
                            });
                          }}
                          className="w-full h-full object-contain p-3 transition-transform duration-200 group-hover:scale-105"
                        />
                        <button
                          type="button"
                          onClick={(e) =>
                            handleTriggerCardImageUpload(e, project.projectId)
                          }
                          className="absolute bottom-2.5 left-2.5 rounded-[8px] bg-slate-900/80 hover:bg-[#1E6BFF] text-white text-[11.5px] font-bold py-1.5 px-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer shadow-sm"
                          title="Đổi ảnh minh họa từ máy tính"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#38BDF8]" />
                          <span>Đổi ảnh</span>
                        </button>
                      </>
                    ) : (
                      /* Trạng thái hình ảnh ban đầu: Click vào thẻ để mở phòng thí nghiệm, hoặc bấm nút Tải ảnh */
                      <div
                        className={`m-3 w-[calc(100%-24px)] h-[calc(100%-24px)] rounded-[12px] border-2 border-dashed flex flex-col items-center justify-center gap-2.5 p-4 text-center transition-colors ${
                          isDarkMode
                            ? 'border-[#2C528C] group-hover:border-[#38BDF8] bg-[#0B182E]/60'
                            : 'border-[#9EC5F8] group-hover:border-[#1E6BFF] bg-white/75'
                        }`}
                      >
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center ${
                            isDarkMode
                              ? 'bg-[#1E6BFF]/20 text-[#38BDF8]'
                              : 'bg-[#1E6BFF]/12 text-[#1E6BFF]'
                          }`}
                        >
                          <FlaskConical className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <span
                            className={`block text-[13.5px] font-extrabold ${
                              isDarkMode ? 'text-slate-200' : 'text-[#09234C]'
                            }`}
                          >
                            Bấm để mở Phòng thí nghiệm 3D
                          </span>
                          <button
                            type="button"
                            onClick={(e) =>
                              handleTriggerCardImageUpload(e, project.projectId)
                            }
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[7px] border text-[11.5px] font-bold transition-colors cursor-pointer ${
                              isDarkMode
                                ? 'bg-[#132644] hover:bg-[#1E6BFF] border-[#2C528C] text-[#7DD3FC] hover:text-white'
                                : 'bg-[#EAF3FF] hover:bg-[#1E6BFF] border-[#9EC5F8] text-[#1E6BFF] hover:text-white'
                            }`}
                          >
                            <Upload className="w-3 h-3" />
                            <span>Tải ảnh minh họa</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Nút xóa dự án ở góc trên bên phải */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(project.projectId);
                      }}
                      title={`Xóa dự án "${project.title}"`}
                      aria-label={`Xóa dự án ${project.title}`}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-[8px] bg-slate-900/70 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* KHUNG TÊN DỰ ÁN, NGÀY GIỜ LƯU & NÚT XUẤT BẢN FILE PPT */}
                  <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                    <div className="space-y-2.5">
                      <h2
                        className={`text-[17.5px] font-black leading-snug group-hover:text-[#1E6BFF] transition-colors line-clamp-2 ${
                          isDarkMode ? 'text-white' : 'text-[#09234C]'
                        }`}
                      >
                        {project.title}
                      </h2>

                      <div
                        className={`text-[11.5px] font-mono font-bold flex items-center gap-1 shrink-0 ${
                          isDarkMode ? 'text-[#7DD3FC]' : 'text-[#425B80]'
                        }`}
                        title={`Lưu lúc: ${project.createdAt}`}
                      >
                        <Clock className="w-3.5 h-3.5 shrink-0 text-[#1E6BFF]" />
                        <span>{project.createdAt}</span>
                      </div>

                      {/* NÚT [📊 Xuất bản file PPT] TRÊN THẺ DỰ ÁN */}
                      <button
                        type="button"
                        onClick={(e) => handleExportCardToPptx(e, project)}
                        disabled={exportingProjectId === project.projectId}
                        title="Tải xuống báo cáo PowerPoint (.pptx) độc lập gồm Sơ đồ 2D, Thông số thiết bị và Công thức chuẩn SGK"
                        className={`w-full py-2 px-3 rounded-[9px] border text-[12.5px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          exportedProjectId === project.projectId
                            ? 'bg-emerald-600 border-emerald-400 text-white shadow-xs'
                            : isDarkMode
                              ? 'bg-[#13284A] hover:bg-[#1E6BFF] border-[#2C528C] hover:border-[#38BDF8] text-[#7DD3FC] hover:text-white'
                              : 'bg-[#F0F7FF] hover:bg-[#1E6BFF] border-[#9EC5F8] hover:border-[#1E6BFF] text-[#09234C] hover:text-white'
                        }`}
                      >
                        {exportedProjectId === project.projectId ? (
                          <>
                            <Check className="w-4 h-4 stroke-[2.8]" />
                            <span>Đã tải xuống file PPT (.pptx)</span>
                          </>
                        ) : exportingProjectId === project.projectId ? (
                          <>
                            <FileSpreadsheet className="w-4 h-4 animate-pulse" />
                            <span>Đang đóng gói file PPT...</span>
                          </>
                        ) : (
                          <>
                            <span role="img" aria-hidden="true">
                              📊
                            </span>
                            <span>Xuất bản file PPT (.pptx)</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="pt-2.5 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-[13.5px] font-extrabold text-[#1E6BFF] dark:text-[#7DD3FC]">
                      <span className="flex items-center gap-1.5">
                        <Play className="w-4 h-4 fill-current" />
                        <span>Mở bàn thí nghiệm 3D</span>
                      </span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Thanh bài thực hành nhanh SGK ở chân trang */}
        {experiments.length > 0 && onStartExperiment && (
          <footer
            className={`w-full rounded-[14px] p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isDarkMode
                ? 'bg-[#0D1A2F] border-[#1E3458]'
                : 'bg-white border-[#D4E6FF]'
            }`}
          >
            <div className="text-[13.5px] font-bold">
              <span className={isDarkMode ? 'text-slate-300' : 'text-[#425B80]'}>
                Thực hành mẫu theo bài học SGK:{' '}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {experiments.map((exp) => (
                <button
                  key={exp.experimentId}
                  type="button"
                  onClick={() => onStartExperiment(exp.experimentId)}
                  className={`px-3 py-1.5 rounded-[8px] border text-[13px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isDarkMode
                      ? 'bg-[#132644] hover:bg-[#1E6BFF] border-[#2A4E85] text-white'
                      : 'bg-[#F2F7FF] hover:bg-[#1E6BFF] hover:text-white border-[#C5DCFA] text-[#09234C]'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{exp.title}</span>
                </button>
              ))}
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};
