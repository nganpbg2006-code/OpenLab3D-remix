import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Box,
  Plus,
  GraduationCap,
  HelpCircle,
  Home,
  RotateCcw,
  Check,
  FlaskConical,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  FileCode,
  SlidersHorizontal,
  Download,
  Clock,
  X,
  Trash2,
  AlertTriangle,
  ChevronDown,
  FolderOpen,
} from 'lucide-react';
import equipmentStandardMdRaw from '../../../EQUIPMENT_MODULE_STANDARD.md?raw';

const downloadEquipmentStandardMd = () => {
  const blob = new Blob([equipmentStandardMdRaw], {
    type: 'text/markdown;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'EQUIPMENT_MODULE_STANDARD.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export type UserRoleMode = 'student' | 'teacher';

export type StudentScreenId =
  | 'home'
  | 'lab-projects'
  | 'explore-equipment'
  | 'lab-room'
  | 'my-kits';

export type NavSectionId =
  | 'overview'
  | 'library-3d'
  | 'lab-workspace'
  | 'kits'
  | 'environments'
  | 'governance';

export type HeaderProgressStep = 1 | 2 | 3 | 4;

interface TopNavBarProps {
  userRole: UserRoleMode;
  studentScreen: StudentScreenId;
  activeSection: NavSectionId;
  globalSearch: string;
  recentSearches?: string[];
  headerProgressStep?: HeaderProgressStep;
  isDarkMode?: boolean;
  isLibraryOpen?: boolean;
  isGuideOpen?: boolean;
  isFullscreen?: boolean;
  isNeuralGuideEnabled?: boolean;
  onToggleNeuralGuide?: () => void;
  onOpenNeuralModal?: () => void;
  onToggleDarkMode?: () => void;
  onToggleLibraryPanel?: () => void;
  onToggleGuidePanel?: () => void;
  onToggleFullscreen?: () => void;
  onChangeHeaderProgressStep?: (step: HeaderProgressStep) => void;
  onResetLab?: () => void;
  onChangeUserRole: (role: UserRoleMode) => void;
  onSelectStudentScreen: (screen: StudentScreenId) => void;
  onOpenStudentHelp: () => void;
  onOpenHtmlModuleImporter?: () => void;
  onSelectSection: (section: NavSectionId) => void;
  onGlobalSearchChange: (value: string) => void;
  onCommitSearch?: (term: string) => void;
  onSelectRecentSearch?: (term: string) => void;
  onRemoveRecentSearch?: (term: string) => void;
  onClearRecentSearches?: () => void;
  onQuickAddSelectedAsset: () => void;
  notificationCount: number;
  recentLogs: Array<{ id: string; text: string; time: string }>;
}

const TEACHER_NAV_ITEMS: Array<{ id: NavSectionId; label: string }> = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'library-3d', label: 'Thư viện' },
  { id: 'lab-workspace', label: 'Phòng 3D' },
  { id: 'kits', label: 'Bộ dụng cụ' },
  { id: 'environments', label: 'Môi trường' },
  { id: 'governance', label: 'Kiểm định' },
];

const HEADER_FOUR_STEPS: Array<{ step: HeaderProgressStep; label: string }> = [
  { step: 1, label: 'Chọn' },
  { step: 2, label: 'Đặt bàn' },
  { step: 3, label: 'Thực hành' },
  { step: 4, label: 'Kết quả' },
];

const SUGGESTED_EQUIPMENT_TERMS = [
  'Cân điện tử',
  'Ống đong 100 ml',
  'Bình cấp nước',
  'Kính hiển vi',
  'Đèn Laser',
];

export const TopNavBar: React.FC<TopNavBarProps> = ({
  userRole,
  studentScreen,
  activeSection,
  globalSearch,
  recentSearches = [],
  headerProgressStep = 1,
  isDarkMode = false,
  isLibraryOpen = true,
  isGuideOpen = true,
  isFullscreen = false,
  isNeuralGuideEnabled = true,
  onToggleNeuralGuide,
  onOpenNeuralModal,
  onToggleDarkMode,
  onToggleLibraryPanel,
  onToggleGuidePanel,
  onToggleFullscreen,
  onChangeHeaderProgressStep,
  onResetLab,
  onChangeUserRole,
  onSelectStudentScreen,
  onOpenStudentHelp,
  onOpenHtmlModuleImporter,
  onSelectSection,
  onGlobalSearchChange,
  onCommitSearch,
  onSelectRecentSearch,
  onRemoveRecentSearch,
  onClearRecentSearches,
  onQuickAddSelectedAsset,
  notificationCount,
  recentLogs,
}) => {
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [showMobileMenuPopover, setShowMobileMenuPopover] = useState(false);
  const [showWorkspaceMenuPopover, setShowWorkspaceMenuPopover] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const workspaceMenuRef = useRef<HTMLDivElement | null>(null);
  const notifMenuRef = useRef<HTMLDivElement | null>(null);

  const displayedRecentSearches = recentSearches.slice(0, 5);

  useEffect(() => {
    if (!showWorkspaceMenuPopover && !showNotifPopover) return;
    const handleOutsideClick = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (
        showWorkspaceMenuPopover &&
        workspaceMenuRef.current &&
        !workspaceMenuRef.current.contains(target)
      ) {
        setShowWorkspaceMenuPopover(false);
      }
      if (
        showNotifPopover &&
        notifMenuRef.current &&
        !notifMenuRef.current.contains(target)
      ) {
        setShowNotifPopover(false);
      }
    };
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowWorkspaceMenuPopover(false);
        setShowNotifPopover(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick, true);
    window.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick, true);
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showWorkspaceMenuPopover, showNotifPopover]);

  useEffect(() => {
    if (!showResetConfirmModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowResetConfirmModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showResetConfirmModal]);

  const renderResetConfirmationModal = () => {
    if (!showResetConfirmModal) return null;
    return (
      <div
        className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={() => setShowResetConfirmModal(false)}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-workbench-dialog-title"
          aria-describedby="reset-workbench-dialog-desc"
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-[430px] rounded-[16px] border-[1.5px] backdrop-blur-2xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.65)] transition-all ${
            isDarkMode
              ? 'bg-[#081528]/82 border-[#38BDF8]/80 text-white'
              : 'bg-white/88 border-white ring-1 ring-[#1D63E8]/45 text-[#051630]'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-[12px] border flex items-center justify-center shrink-0 ${
                  isDarkMode
                    ? 'bg-amber-500/25 border-amber-400/80 text-amber-300'
                    : 'bg-amber-100 border-amber-500/70 text-amber-700'
                }`}
              >
                <AlertTriangle className="w-6 h-6 stroke-[2.4]" />
              </div>
              <div>
                <span
                  className={`inline-block text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border mb-1 ${
                    isDarkMode
                      ? 'bg-amber-500/20 border-amber-400/60 text-amber-200'
                      : 'bg-amber-100/90 border-amber-500/60 text-amber-900'
                  }`}
                >
                  Xác nhận thao tác
                </span>
                <h2
                  id="reset-workbench-dialog-title"
                  className={`text-[17px] font-extrabold leading-snug ${
                    isDarkMode
                      ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]'
                      : 'text-[#051630]'
                  }`}
                >
                  Đặt lại toàn bộ bàn thí nghiệm?
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowResetConfirmModal(false)}
              className={`w-8 h-8 rounded-[8px] border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                isDarkMode
                  ? 'bg-white/10 hover:bg-rose-600 border-white/25 text-white'
                  : 'bg-slate-100 hover:bg-rose-600 hover:text-white border-slate-300 text-[#051630]'
              }`}
              title="Đóng hộp thoại"
              aria-label="Đóng"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <p
            id="reset-workbench-dialog-desc"
            className={`mt-3.5 text-[13.5px] font-bold leading-relaxed ${
              isDarkMode ? 'text-slate-100' : 'text-[#1E3A5F]'
            }`}
          >
            Bạn có chắc chắn muốn xóa và đặt lại toàn bộ bàn thí nghiệm không? Tất cả dụng cụ vừa thêm, vị trí sắp xếp, lượng nước và kết quả đo hiện tại sẽ trở về trạng thái ban đầu.
          </p>

          <div
            className={`mt-4 pt-3.5 border-t flex items-center justify-end gap-2.5 ${
              isDarkMode ? 'border-white/20' : 'border-slate-300/80'
            }`}
          >
            <button
              type="button"
              onClick={() => setShowResetConfirmModal(false)}
              className={`px-4 py-2 rounded-[10px] border text-[13.5px] font-extrabold cursor-pointer transition-colors ${
                isDarkMode
                  ? 'bg-white/10 hover:bg-white/20 border-white/30 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-[#051630]'
              }`}
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={() => {
                setShowResetConfirmModal(false);
                onResetLab?.();
              }}
              className="px-4 py-2 rounded-[10px] bg-rose-600 hover:bg-rose-700 border border-rose-300/80 text-white text-[13.5px] font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
              <span>Đồng ý đặt lại</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (!isSearchDropdownOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchDropdownOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [isSearchDropdownOpen]);

  const handleApplyTerm = (term: string) => {
    const cleaned = term.trim();
    if (!cleaned) return;
    if (onSelectRecentSearch) {
      onSelectRecentSearch(cleaned);
    } else {
      onGlobalSearchChange(cleaned);
      onCommitSearch?.(cleaned);
    }
    setIsSearchDropdownOpen(false);
  };

  const renderTopSearchBarWithRecent = (compactMode: boolean) => (
    <div
      ref={searchContainerRef}
      className={`relative ${
        compactMode
          ? 'w-[148px] sm:w-[196px] xl:w-[236px] shrink-0'
          : 'w-full max-w-xs'
      }`}
    >
      <Search className="w-4 h-4 text-[#7DD3FC] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={globalSearch}
        onFocus={() => setIsSearchDropdownOpen(true)}
        onClick={() => setIsSearchDropdownOpen(true)}
        onChange={(e) => {
          onGlobalSearchChange(e.target.value);
          if (!isSearchDropdownOpen) setIsSearchDropdownOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            if (globalSearch.trim()) {
              onCommitSearch?.(globalSearch.trim());
            }
            setIsSearchDropdownOpen(false);
          } else if (e.key === 'Escape') {
            setIsSearchDropdownOpen(false);
          }
        }}
        onBlur={() => {
          if (globalSearch.trim().length >= 2) {
            onCommitSearch?.(globalSearch.trim());
          }
        }}
        placeholder={compactMode ? 'Tìm dụng cụ...' : 'Tìm dụng cụ, thiết bị...'}
        aria-label="Tìm kiếm thiết bị thí nghiệm"
        className={`w-full bg-[#103870] border-[1.5px] border-[#38BDF8]/70 focus:border-[#00BCEB] rounded-[9px] pl-8 pr-7 text-white font-bold placeholder:text-[#B8D4FF] placeholder:font-semibold focus:outline-none transition-colors shadow-inner ${
          compactMode ? 'h-9 text-[13.5px]' : 'py-1.5 text-[14px]'
        }`}
      />
      {globalSearch ? (
        <button
          type="button"
          onClick={() => {
            onGlobalSearchChange('');
            setIsSearchDropdownOpen(true);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/15 hover:bg-rose-500 text-white flex items-center justify-center cursor-pointer transition-colors"
          title="Xóa từ khóa đang nhập"
          aria-label="Xóa từ khóa"
        >
          <X className="w-3 h-3 stroke-[2.8]" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsSearchDropdownOpen((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full hover:bg-white/15 text-[#7DD3FC] flex items-center justify-center cursor-pointer transition-colors"
          title="Xem 5 tìm kiếm gần đây (Recent Searches)"
          aria-label="Lịch sử tìm kiếm gần đây"
        >
          <Clock className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Cửa sổ Pop-up 'Tìm kiếm gần đây' (5 từ khóa gần nhất) — Glassmorphism nhìn xuyên thấu + Chữ đậm rõ */}
      {isSearchDropdownOpen && (
        <div
          role="listbox"
          aria-label="Tìm kiếm gần đây (Recent Searches)"
          className={`absolute left-0 right-0 sm:w-[300px] mt-1.5 rounded-[13px] border-[1.5px] backdrop-blur-2xl p-2.5 z-50 select-none ${
            isDarkMode
              ? 'bg-[#081528]/65 border-[#38BDF8]/85 text-white shadow-[0_16px_42px_rgba(0,0,0,0.68)]'
              : 'bg-white/68 border-white/90 ring-1 ring-[#1D63E8]/45 text-[#051630] shadow-[0_16px_42px_rgba(9,30,58,0.32)]'
          }`}
        >
          <div
            className={`flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b ${
              isDarkMode ? 'border-white/25' : 'border-[#7DA4D9]'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Clock
                className={`w-3.5 h-3.5 shrink-0 ${
                  isDarkMode ? 'text-[#38BDF8]' : 'text-[#1557D6]'
                }`}
              />
              <span
                className={`text-[11.5px] font-extrabold uppercase tracking-wider ${
                  isDarkMode
                    ? 'text-[#7DD3FC] drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]'
                    : 'text-[#07224D]'
                }`}
              >
                Tìm kiếm gần đây ({displayedRecentSearches.length}/5)
              </span>
            </div>

            {displayedRecentSearches.length > 0 && onClearRecentSearches && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onClearRecentSearches()}
                className={`px-2 py-0.5 rounded-[6px] text-[11px] font-extrabold flex items-center gap-1 cursor-pointer transition-colors border ${
                  isDarkMode
                    ? 'bg-rose-500/25 hover:bg-rose-500/45 border-rose-400/70 text-rose-100'
                    : 'bg-rose-100/85 hover:bg-rose-200 border-rose-600/60 text-[#881337]'
                }`}
                title="Xóa toàn bộ lịch sử tìm kiếm gần đây"
              >
                <Trash2 className="w-3 h-3" />
                <span>Xóa hết</span>
              </button>
            )}
          </div>

          {displayedRecentSearches.length > 0 ? (
            <div className="space-y-1">
              {displayedRecentSearches.map((term, idx) => (
                <div
                  key={`${term}-${idx}`}
                  className={`group flex items-center justify-between gap-1.5 rounded-[8px] px-2.5 py-1.5 border transition-colors ${
                    isDarkMode
                      ? 'bg-slate-950/45 hover:bg-[#1E6BFF]/55 border-white/20 hover:border-[#38BDF8]'
                      : 'bg-white/60 hover:bg-[#DCE8F8]/90 border-[#9BB8DC] hover:border-[#1D63E8]'
                  }`}
                >
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleApplyTerm(term)}
                    className="flex-1 flex items-center gap-2 text-left min-w-0 cursor-pointer"
                  >
                    <Clock
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isDarkMode ? 'text-[#38BDF8]' : 'text-[#1557D6]'
                      }`}
                    />
                    <span
                      className={`text-[13.5px] font-extrabold truncate ${
                        isDarkMode
                          ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]'
                          : 'text-[#051630]'
                      }`}
                    >
                      {term}
                    </span>
                  </button>

                  {onRemoveRecentSearch && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveRecentSearch(term);
                      }}
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                        isDarkMode
                          ? 'text-slate-200 hover:bg-rose-600 hover:text-white'
                          : 'text-[#1E3A5F] hover:bg-rose-600 hover:text-white'
                      }`}
                      title={`Xóa "${term}" khỏi lịch sử`}
                      aria-label={`Xóa ${term}`}
                    >
                      <X className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-1.5 space-y-2">
              <p
                className={`text-[12px] font-bold ${
                  isDarkMode ? 'text-slate-200' : 'text-[#1E3A5F]'
                }`}
              >
                Chưa có từ khóa gần đây. Chọn nhanh thiết bị mẫu:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_EQUIPMENT_TERMS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleApplyTerm(item)}
                    className={`px-2 py-1 rounded-[7px] text-[12px] font-extrabold border cursor-pointer transition-colors ${
                      isDarkMode
                        ? 'bg-slate-900/60 hover:bg-[#1E6BFF] border-white/30 text-white'
                        : 'bg-white/75 hover:bg-[#1D63E8] hover:text-white border-[#7DA4D9] text-[#051630]'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // STUDENT MODE HEADER — Contextual UI: Minimalist on Home, full tools only inside Lab Room / Explore Equipment
  if (userRole === 'student') {
    const isHomeScreen = studentScreen === 'home';
    const isDetailedWorkspace =
      studentScreen === 'lab-room' || studentScreen === 'explore-equipment';

    return (
      <header
        className={`h-[50px] md:h-[54px] px-2.5 sm:px-4 border-b flex items-center justify-between gap-2 shrink-0 z-30 shadow-xs select-none transition-colors min-w-0 ${
          isDarkMode
            ? 'bg-[#081224] border-[#1E3252]'
            : 'bg-[#092B5E] border-[#164384]'
        }`}
      >
        {/* Left: Minimalist Brand Logo + [🏠 Trang chủ] Button (Workspace switcher hidden on Home screen) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink-0">
          <button
            type="button"
            onClick={() => {
              setShowWorkspaceMenuPopover(false);
              onSelectStudentScreen('home');
            }}
            className="flex items-center gap-2 text-left whitespace-nowrap shrink-0 focus:outline-none cursor-pointer min-w-0 group"
            title="OPEN LAB 3D — Quay về màn hình tổng quan"
          >
            <div className="w-8 h-8 md:w-8.5 md:h-8.5 rounded-[8px] bg-[#1E6BFF] group-hover:bg-[#1557D6] border border-[#00BCEB] text-white flex items-center justify-center shadow-xs shrink-0 transition-colors">
              <FlaskConical className="w-4 h-4 md:w-4.5 md:h-4.5" />
            </div>
            <div className="flex items-baseline gap-1 min-w-0">
              <span className="text-[16px] sm:text-[18px] leading-none font-extrabold tracking-tight text-white truncate">
                OPEN LAB <span className="text-[#00BCEB]">3D</span>
              </span>
            </div>
          </button>

          {/* Điểm nhấn chính góc trái: Nút [🏠 Trang chủ] điều hướng trực tiếp về màn hình tổng quan */}
          <button
            type="button"
            onClick={() => {
              setShowWorkspaceMenuPopover(false);
              onSelectStudentScreen('home');
            }}
            className={`h-8.5 px-2.5 sm:px-3 rounded-[9px] text-[12.5px] sm:text-[13px] font-extrabold transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 border ${
              isHomeScreen
                ? 'bg-gradient-to-r from-[#1E6BFF] to-[#0095FF] text-white border-[#00BCEB] shadow-[0_0_14px_rgba(0,188,235,0.4)]'
                : 'bg-[#10366E] hover:bg-[#1E6BFF] text-white border-[#2E64B8] hover:border-[#00BCEB] shadow-2xs'
            }`}
            title="Quay về màn hình Trang chủ tổng quan của hệ thống OPEN LAB 3D"
            aria-label="Trang chủ"
          >
            <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00BCEB] shrink-0" />
            <span>Trang chủ</span>
          </button>

          {/* Cụm chuyển nhanh phân khu: Ẩn hoàn toàn khi đang ở Trang chủ (Home Screen) */}
          {!isHomeScreen && (
            <div
              ref={workspaceMenuRef}
              className="hidden md:flex items-center gap-0.5 p-0.5 rounded-[9px] bg-[#061A3A]/90 border border-[#24508F] relative"
            >
              <button
                type="button"
                onClick={() => {
                  setShowWorkspaceMenuPopover(false);
                  onSelectStudentScreen('lab-projects');
                }}
                className={`w-7.5 h-7.5 rounded-[7px] flex items-center justify-center transition-colors cursor-pointer ${
                  studentScreen === 'lab-projects'
                    ? 'bg-[#1E6BFF] text-white shadow-2xs border border-[#00BCEB]/70'
                    : 'text-[#B8D4FF] hover:text-white hover:bg-white/10'
                }`}
                title="Quản lý dự án 3D"
                aria-label="Quản lý dự án 3D"
              >
                <FolderOpen className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowWorkspaceMenuPopover(false);
                  onSelectStudentScreen('explore-equipment');
                }}
                className={`w-7.5 h-7.5 rounded-[7px] flex items-center justify-center transition-colors cursor-pointer ${
                  studentScreen === 'explore-equipment'
                    ? 'bg-[#1E6BFF] text-white shadow-2xs border border-[#00BCEB]/70'
                    : 'text-[#B8D4FF] hover:text-white hover:bg-white/10'
                }`}
                title="Dụng cụ thí nghiệm (Tự thiết kế AI & Soi 360°)"
                aria-label="Dụng cụ thí nghiệm"
              >
                <Box className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowWorkspaceMenuPopover(false);
                  onSelectStudentScreen('lab-room');
                }}
                className={`w-7.5 h-7.5 rounded-[7px] flex items-center justify-center transition-colors cursor-pointer ${
                  studentScreen === 'lab-room'
                    ? 'bg-[#1E6BFF] text-white shadow-2xs border border-[#00BCEB]/70'
                    : 'text-[#B8D4FF] hover:text-white hover:bg-white/10'
                }`}
                title="Phòng thí nghiệm 3D"
                aria-label="Phòng thí nghiệm 3D"
              >
                <FlaskConical className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-[#24508F] mx-0.5" aria-hidden="true" />

              <button
                type="button"
                onClick={() => setShowWorkspaceMenuPopover((v) => !v)}
                className="h-7.5 px-2.5 rounded-[7px] text-[12px] font-extrabold transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 bg-[#133F7E] text-white border border-[#00BCEB]/60"
                title="Mở menu chọn nhanh không gian làm việc 3D"
                aria-expanded={showWorkspaceMenuPopover}
              >
                <span className="max-w-[140px] truncate">
                  {studentScreen === 'lab-projects'
                    ? 'Quản lý dự án 3D'
                    : studentScreen === 'explore-equipment'
                      ? 'Dụng cụ thí nghiệm'
                      : studentScreen === 'lab-room'
                        ? 'Phòng thí nghiệm 3D'
                        : 'Không gian 3D'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#00BCEB] transition-transform duration-150 ${
                    showWorkspaceMenuPopover ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showWorkspaceMenuPopover && (
                <div
                  role="menu"
                  aria-label="Chọn không gian làm việc OpenLab 3D"
                  className={`absolute left-0 top-[calc(100%+6px)] z-50 w-[290px] rounded-[13px] border-[1.5px] p-2 shadow-[0_18px_48px_rgba(0,0,0,0.65)] space-y-1 ${
                    isDarkMode
                      ? 'bg-[#081528]/95 border-[#38BDF8]/80 text-white'
                      : 'bg-[#09234C]/95 border-[#00BCEB]/85 text-white'
                  }`}
                >
                  <div className="px-2.5 py-1 border-b border-white/15 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-[#7DD3FC]">
                    <span>Chuyển nhanh phân khu 3D</span>
                    <span>3 phân khu</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowWorkspaceMenuPopover(false);
                      onSelectStudentScreen('lab-room');
                    }}
                    className={`w-full px-2.5 py-2 rounded-[9px] text-left flex items-start gap-2.5 transition-colors cursor-pointer border ${
                      studentScreen === 'lab-room'
                        ? 'bg-[#1E6BFF] border-[#00BCEB] text-white'
                        : 'bg-white/5 hover:bg-white/15 border-transparent text-slate-100'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-[8px] bg-[#00BCEB]/20 border border-[#00BCEB]/60 flex items-center justify-center shrink-0 mt-0.5">
                      <FlaskConical className="w-4 h-4 text-[#00BCEB]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[13px] font-extrabold truncate">
                          Phòng thí nghiệm 3D
                        </span>
                        {studentScreen === 'lab-room' && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white/20 text-white">
                            Đang mở
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#B8D4FF] leading-snug mt-0.5">
                        Bàn thực hành đo khối lượng, thể tích & tương tác vật lý 3D
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowWorkspaceMenuPopover(false);
                      onSelectStudentScreen('explore-equipment');
                    }}
                    className={`w-full px-2.5 py-2 rounded-[9px] text-left flex items-start gap-2.5 transition-colors cursor-pointer border ${
                      studentScreen === 'explore-equipment'
                        ? 'bg-[#1E6BFF] border-[#00BCEB] text-white'
                        : 'bg-white/5 hover:bg-white/15 border-transparent text-slate-100'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-[8px] bg-[#38BDF8]/20 border border-[#38BDF8]/60 flex items-center justify-center shrink-0 mt-0.5">
                      <Box className="w-4 h-4 text-[#38BDF8]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[13px] font-extrabold truncate">
                          Dụng cụ thí nghiệm
                        </span>
                        {studentScreen === 'explore-equipment' && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white/20 text-white">
                            Đang mở
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#B8D4FF] leading-snug mt-0.5">
                        Thiết kế dụng cụ AI, phác thảo 2D & Live Preview 3D
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowWorkspaceMenuPopover(false);
                      onSelectStudentScreen('lab-projects');
                    }}
                    className={`w-full px-2.5 py-2 rounded-[9px] text-left flex items-start gap-2.5 transition-colors cursor-pointer border ${
                      studentScreen === 'lab-projects'
                        ? 'bg-[#1E6BFF] border-[#00BCEB] text-white'
                        : 'bg-white/5 hover:bg-white/15 border-transparent text-slate-100'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-[8px] bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center shrink-0 mt-0.5">
                      <FolderOpen className="w-4 h-4 text-emerald-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[13px] font-extrabold truncate">
                          Quản lý dự án 3D
                        </span>
                        {studentScreen === 'lab-projects' && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white/20 text-white">
                            Đang mở
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#B8D4FF] leading-snug mt-0.5">
                        Danh sách bài thí nghiệm cá nhân đã lưu & xuất báo cáo
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center Contextual Progress / Mode Banner: Chỉ hiển thị khi đang ở trong Phòng thí nghiệm 3D hoặc Dụng cụ thí nghiệm */}
        {!isHomeScreen && studentScreen === 'lab-room' && (
          <div
            className="hidden lg:flex items-center justify-center flex-1 max-w-xl px-1"
            aria-label="Tiến trình 4 bước"
          >
            <div className="flex items-center justify-center gap-1.5">
              {HEADER_FOUR_STEPS.map((item, idx) => {
                const isActive = headerProgressStep === item.step;
                const isCompleted = headerProgressStep > item.step;
                return (
                  <React.Fragment key={item.step}>
                    <button
                      type="button"
                      onClick={() => {
                        onChangeHeaderProgressStep?.(item.step);
                      }}
                      className={`px-2.5 py-1 rounded-[8px] flex items-center gap-1.5 text-[13.5px] font-extrabold transition-all whitespace-nowrap shrink-0 border cursor-pointer ${
                        isActive
                          ? 'bg-[#1E6BFF] text-white border-[#00BCEB] shadow-xs'
                          : isCompleted
                            ? 'bg-[#123E7C] text-white border-[#22C55E]/80 hover:bg-[#1952A3]'
                            : 'bg-[#10366E] text-[#D8E8FF] border-[#2C62B0] hover:bg-[#17488F] hover:text-white'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[12px] font-extrabold shrink-0 ${
                          isActive
                            ? 'bg-white text-[#1E6BFF]'
                            : isCompleted
                              ? 'bg-[#22C55E] text-white'
                              : 'bg-[#092B5E] text-[#D8E8FF]'
                        }`}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : item.step}
                      </span>
                      <span>{item.label}</span>
                    </button>

                    {idx < HEADER_FOUR_STEPS.length - 1 && (
                      <div
                        className={`w-2.5 xl:w-4 h-[2px] shrink-0 transition-colors ${
                          headerProgressStep > item.step
                            ? 'bg-[#22C55E]'
                            : 'bg-[#255499]'
                        }`}
                        aria-hidden="true"
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* MOBILE ACTION BAR (< 768px): Ẩn hoàn toàn trên Trang chủ */}
        {!isHomeScreen && isDetailedWorkspace && (
          <div className="flex md:hidden items-center gap-1 shrink-0 relative">
            <button
              type="button"
              onClick={() => {
                if (onToggleLibraryPanel) {
                  onToggleLibraryPanel();
                } else {
                  onOpenHtmlModuleImporter?.();
                }
              }}
              className="px-2.5 h-8 rounded-[7px] bg-[#DC2626] hover:bg-[#B91C1C] border border-[#F87171] text-white text-[12px] font-extrabold flex items-center gap-1 shadow-xs transition-colors cursor-pointer whitespace-nowrap"
              title={isLibraryOpen ? 'Ẩn danh mục thiết bị' : 'Mở danh mục thiết bị'}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.8]" />
              <span>{isLibraryOpen ? 'Ẩn' : 'Thêm thiết bị'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowMobileMenuPopover((v) => !v)}
              className="w-8 h-8 rounded-[7px] bg-[#DC2626] hover:bg-[#B91C1C] border border-[#F87171] text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              title={showMobileMenuPopover ? 'Ẩn Menu công cụ' : 'Mở Menu công cụ'}
              aria-label="Menu công cụ"
            >
              <SlidersHorizontal className="w-4 h-4 text-white" />
            </button>

            {showMobileMenuPopover && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMobileMenuPopover(false)}
                />
                <div
                  className={`fixed right-2 top-[54px] z-50 w-[268px] rounded-[13px] border-[1.5px] backdrop-blur-2xl p-2.5 shadow-[0_16px_42px_rgba(0,0,0,0.58)] space-y-1 ${
                    isDarkMode
                      ? 'bg-[#081528]/68 border-[#38BDF8]/80 text-white'
                      : 'bg-white/68 border-white/90 ring-1 ring-[#1D63E8]/40 text-[#051630]'
                  }`}
                >
                  <div
                    className={`px-2.5 py-1.5 border-b text-[12px] font-extrabold uppercase tracking-wider flex items-center justify-between ${
                      isDarkMode
                        ? 'border-white/25 text-[#7DD3FC]'
                        : 'border-[#7DA4D9] text-[#0B3A7D]'
                    }`}
                  >
                    <span>Menu Công Cụ &amp; Hệ Thống</span>
                    <button
                      type="button"
                      onClick={() => setShowMobileMenuPopover(false)}
                      className="h-6 px-2 rounded-[5px] bg-[#DC2626] hover:bg-[#B91C1C] border border-[#F87171] text-white text-[11px] font-extrabold flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Ẩn</span>
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  {onOpenHtmlModuleImporter && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMobileMenuPopover(false);
                        onOpenHtmlModuleImporter();
                      }}
                      className="w-full min-h-[44px] px-3 py-2 rounded-[9px] bg-[#059669] hover:bg-[#047857] text-white text-[14px] font-extrabold flex items-center gap-2.5 cursor-pointer"
                    >
                      <FileCode className="w-4 h-4 shrink-0" />
                      <span>Nạp Module Thiết Bị (.HTML)</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowMobileMenuPopover(false);
                      downloadEquipmentStandardMd();
                    }}
                    className="w-full min-h-[44px] px-3 py-2 rounded-[9px] bg-[#D97706] hover:bg-[#B45309] text-white text-[14px] font-extrabold flex items-center gap-2.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    <span>.MD</span>
                  </button>

                  {onToggleNeuralGuide && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMobileMenuPopover(false);
                        onToggleNeuralGuide();
                      }}
                      className={`w-full min-h-[44px] px-3 py-2 rounded-[9px] text-left text-[14px] font-extrabold flex items-center gap-2.5 cursor-pointer border ${
                        isNeuralGuideEnabled
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400 text-white'
                          : isDarkMode
                            ? 'bg-slate-800/80 border-slate-600 text-slate-200 hover:bg-white/15'
                            : 'bg-slate-100 border-slate-300 text-[#051630] hover:bg-white/80'
                      }`}
                    >
                      <span className="text-base shrink-0">🧠</span>
                      <span>
                        {isNeuralGuideEnabled
                          ? 'Trợ lý Nơ-ron: ĐANG BẬT (Nhấn để Tắt)'
                          : 'Trợ lý Nơ-ron: ĐANG TẮT (Nhấn để Bật)'}
                      </span>
                    </button>
                  )}

                  {onOpenNeuralModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMobileMenuPopover(false);
                        onOpenNeuralModal();
                      }}
                      className="w-full min-h-[44px] px-3 py-2 rounded-[9px] bg-indigo-600 hover:bg-indigo-700 border border-indigo-400 text-white text-[14px] font-extrabold flex items-center gap-2.5 cursor-pointer"
                    >
                      <span className="text-base shrink-0">🌐</span>
                      <span>Mở Sơ đồ Mạng Nơ-ron</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowMobileMenuPopover(false);
                      setShowResetConfirmModal(true);
                    }}
                    className={`w-full min-h-[44px] px-3 py-2 rounded-[9px] text-left text-[14px] font-extrabold flex items-center gap-2.5 cursor-pointer ${
                      isDarkMode ? 'hover:bg-white/15 text-white' : 'hover:bg-white/80 text-[#051630]'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4 text-[#F59E0B] shrink-0" />
                    <span>Đặt lại bàn thí nghiệm</span>
                  </button>

                  {onToggleDarkMode && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMobileMenuPopover(false);
                        onToggleDarkMode();
                      }}
                      className={`w-full min-h-[44px] px-3 py-2 rounded-[9px] text-left text-[14px] font-extrabold flex items-center gap-2.5 cursor-pointer ${
                        isDarkMode ? 'hover:bg-white/15 text-white' : 'hover:bg-white/80 text-[#051630]'
                      }`}
                    >
                      {isDarkMode ? (
                        <Sun className="w-4 h-4 text-[#F59E0B] shrink-0" />
                      ) : (
                        <Moon className="w-4 h-4 text-[#1557D6] shrink-0" />
                      )}
                      <span>{isDarkMode ? 'Chuyển Giao diện Sáng' : 'Chuyển Giao diện Tối'}</span>
                    </button>
                  )}

                  {onToggleFullscreen && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMobileMenuPopover(false);
                        onToggleFullscreen();
                      }}
                      className={`w-full min-h-[44px] px-3 py-2 rounded-[9px] text-left text-[14px] font-extrabold flex items-center gap-2.5 cursor-pointer ${
                        isDarkMode ? 'hover:bg-white/15 text-white' : 'hover:bg-white/80 text-[#051630]'
                      }`}
                    >
                      {isFullscreen ? (
                        <Minimize2 className="w-4 h-4 text-[#1557D6] shrink-0" />
                      ) : (
                        <Maximize2 className="w-4 h-4 text-[#1557D6] shrink-0" />
                      )}
                      <span>{isFullscreen ? 'Thu nhỏ màn hình' : 'Phóng to toàn màn hình'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowMobileMenuPopover(false);
                      onOpenStudentHelp();
                    }}
                    className={`w-full min-h-[44px] px-3 py-2 rounded-[9px] text-left text-[14px] font-extrabold flex items-center gap-2.5 cursor-pointer ${
                      isDarkMode ? 'hover:bg-white/15 text-white' : 'hover:bg-white/80 text-[#051630]'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 text-[#1557D6] shrink-0" />
                    <span>Trợ giúp thao tác</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowMobileMenuPopover(false);
                      onSelectStudentScreen('home');
                    }}
                    className={`w-full min-h-[44px] px-3 py-2 rounded-[9px] text-left text-[14px] font-extrabold flex items-center gap-2.5 cursor-pointer ${
                      isDarkMode ? 'hover:bg-white/15 text-white' : 'hover:bg-white/80 text-[#051630]'
                    }`}
                  >
                    <Home className="w-4 h-4 text-[#1E6BFF] shrink-0" />
                    <span>Trang chủ OPEN LAB</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowMobileMenuPopover(false);
                      onSelectStudentScreen('lab-projects');
                    }}
                    className={`w-full min-h-[44px] px-3 py-2 rounded-[9px] text-left text-[14px] font-extrabold flex items-center gap-2.5 cursor-pointer ${
                      isDarkMode ? 'hover:bg-white/15 text-white' : 'hover:bg-white/80 text-[#051630]'
                    }`}
                  >
                    <FlaskConical className="w-4 h-4 text-[#1E6BFF] shrink-0" />
                    <span>Quản lý dự án thí nghiệm 3D</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowMobileMenuPopover(false);
                      onSelectStudentScreen('explore-equipment');
                    }}
                    className={`w-full min-h-[44px] px-3 py-2 rounded-[9px] text-left text-[14px] font-extrabold flex items-center gap-2.5 cursor-pointer ${
                      isDarkMode ? 'hover:bg-white/15 text-white' : 'hover:bg-white/80 text-[#051630]'
                    }`}
                  >
                    <Box className="w-4 h-4 text-[#38BDF8] shrink-0" />
                    <span>Dụng cụ thí nghiệm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowMobileMenuPopover(false);
                      onSelectStudentScreen('lab-room');
                    }}
                    className={`w-full min-h-[44px] px-3 py-2 rounded-[9px] text-left text-[14px] font-extrabold flex items-center gap-2.5 cursor-pointer ${
                      isDarkMode ? 'hover:bg-white/15 text-white' : 'hover:bg-white/80 text-[#051630]'
                    }`}
                  >
                    <FlaskConical className="w-4 h-4 text-[#00BCEB] shrink-0" />
                    <span>Phòng thí nghiệm 3D</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowMobileMenuPopover(false);
                      onChangeUserRole('teacher');
                    }}
                    className={`w-full min-h-[44px] px-3 py-2 rounded-[9px] text-left text-[14px] font-extrabold flex items-center gap-2.5 border-t pt-2.5 cursor-pointer ${
                      isDarkMode
                        ? 'border-white/25 text-[#7DD3FC] hover:bg-white/15'
                        : 'border-[#7DA4D9] text-[#0B3A7D] hover:bg-white/80'
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4 text-[#1557D6] shrink-0" />
                    <span>Chế độ Kỹ thuật &amp; Quản trị</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* DESKTOP ACTION BAR (md+ >= 768px): Ẩn hoàn toàn trên Trang chủ, chỉ hiển thị theo ngữ cảnh khi vào Phòng thí nghiệm 3D hoặc Dụng cụ thí nghiệm */}
        {!isHomeScreen && isDetailedWorkspace && (
          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            {/* Nút Tải ngay file chuẩn EQUIPMENT_MODULE_STANDARD.md (v2.4) — Chỉ hiển thị '.MD' */}
            <button
              type="button"
              onClick={downloadEquipmentStandardMd}
              className="px-2.5 h-8 rounded-[7px] bg-[#D97706] hover:bg-[#B45309] border border-[#FBBF24] text-white text-[13px] font-extrabold flex items-center justify-center shadow-xs transition-colors cursor-pointer whitespace-nowrap"
              title="Tải file chuẩn EQUIPMENT_MODULE_STANDARD.md (v2.4) về máy tính"
            >
              <span>.MD</span>
            </button>

            {/* Nút Bật/Tắt Trợ lý Nơ-ron Thần kinh (Alt + N) */}
            {onToggleNeuralGuide && (
              <button
                type="button"
                onClick={onToggleNeuralGuide}
                className={`h-9 px-2.5 rounded-[8px] border flex items-center gap-1.5 transition-all cursor-pointer font-bold text-xs whitespace-nowrap ${
                  isNeuralGuideEnabled
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                    : 'bg-[#133F7E]/70 hover:bg-[#1952A3] border-[#275AA3] text-slate-300'
                }`}
                title="Trợ lý Nơ-ron Thần kinh (Bật/Tắt tia liên kết 3D & chỉ dẫn thao tác - Phím tắt Alt + N)"
                aria-label="Trợ lý Nơ-ron"
              >
                <span className="text-sm">🧠</span>
                <span className="hidden lg:inline">
                  {isNeuralGuideEnabled ? 'Nơ-ron: BẬT' : 'Nơ-ron: TẮT'}
                </span>
              </button>
            )}

            {/* Nút Mở Sơ đồ Nơ-ron Toàn cảnh */}
            {onOpenNeuralModal && (
              <button
                type="button"
                onClick={onOpenNeuralModal}
                className="h-9 px-2.5 rounded-[8px] bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/50 text-indigo-100 flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-semibold whitespace-nowrap"
                title="Mở Sơ đồ Mạng Nơ-ron Toàn cảnh KHTN THCS"
                aria-label="Sơ đồ Nơ-ron"
              >
                <span className="text-sm">🌐</span>
                <span className="hidden xl:inline">Sơ đồ Nơ-ron</span>
              </button>
            )}

            {/* Icon phóng to toàn màn hình vùng thí nghiệm */}
            {onToggleFullscreen && (
              <button
                type="button"
                onClick={onToggleFullscreen}
                className={`w-9 h-9 rounded-[8px] border flex items-center justify-center transition-colors cursor-pointer ${
                  isFullscreen
                    ? 'bg-[#00BCEB] text-[#081224] border-white font-bold'
                    : 'bg-[#133F7E] hover:bg-[#1952A3] border-[#275AA3] text-white'
                }`}
                title={isFullscreen ? 'Thu nhỏ (Esc)' : 'Toàn màn hình'}
                aria-label={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4 text-[#00BCEB]" />
                )}
              </button>
            )}

            {/* Icon chuyển đổi Giao diện Tối / Sáng */}
            {onToggleDarkMode && (
              <button
                type="button"
                onClick={onToggleDarkMode}
                className={`w-9 h-9 rounded-[8px] border flex items-center justify-center transition-colors cursor-pointer ${
                  isDarkMode
                    ? 'bg-[#1E293B] hover:bg-[#334155] border-[#00BCEB] text-[#FFC83D]'
                    : 'bg-[#133F7E] hover:bg-[#1952A3] border-[#275AA3] text-white'
                }`}
                title={isDarkMode ? 'Giao diện Sáng' : 'Giao diện Tối'}
                aria-label="Sáng / Tối"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-[#FFC83D]" />
                ) : (
                  <Moon className="w-4 h-4 text-[#00BCEB]" />
                )}
              </button>
            )}

            {/* Icon Trợ giúp nhanh */}
            <button
              type="button"
              onClick={onOpenStudentHelp}
              className="w-9 h-9 rounded-[8px] bg-[#133F7E] hover:bg-[#1952A3] border border-[#275AA3] text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Trợ giúp"
              aria-label="Trợ giúp"
            >
              <HelpCircle className="w-4 h-4 text-[#00BCEB]" />
            </button>

            {/* Icon Làm lại bàn thí nghiệm (Chỉ hiện trong Phòng thí nghiệm 3D) */}
            {studentScreen === 'lab-room' && (
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(true)}
                className="w-9 h-9 rounded-[8px] bg-[#133F7E] hover:bg-[#1952A3] border border-[#275AA3] text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Đặt lại bàn thí nghiệm"
                aria-label="Đặt lại bàn thí nghiệm"
              >
                <RotateCcw className="w-4 h-4 text-[#FFC83D]" />
              </button>
            )}

            {/* Chuyển sang Chế độ Giáo viên / Kỹ thuật */}
            <button
              type="button"
              onClick={() => onChangeUserRole('teacher')}
              className="hidden sm:flex px-2.5 h-9 rounded-[8px] bg-[#10366E] hover:bg-[#1952A3] border border-[#275AA3] text-[#B8D4FF] hover:text-white text-[13.5px] font-bold items-center gap-1.5 transition-colors cursor-pointer"
              title="Chế độ Kỹ thuật & Quản trị"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#00BCEB]" />
              <span className="hidden md:inline">Kỹ thuật</span>
            </button>
          </div>
        )}
        {renderResetConfirmationModal()}
      </header>
    );
  }

  // TEACHER / ADMIN MODE HEADER
  return (
    <header className="h-[60px] px-5 bg-[#092B5E] border-b border-[#164384] flex items-center justify-between gap-5 shrink-0 z-30">
      <button
        type="button"
        onClick={() => onSelectSection('lab-workspace')}
        className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 focus:outline-none"
      >
        <div className="w-9 h-9 rounded-lg bg-[#1E6BFF] border border-[#00BCEB] flex items-center justify-center text-white">
          <Box className="w-5 h-5" />
        </div>
        <span className="text-[20px] font-extrabold tracking-tight text-white">
          OpenLab 3D <span className="text-[13px] font-semibold text-[#B8D4FF]">Quản trị</span>
        </span>
      </button>

      <div className="flex items-center gap-5 flex-1 justify-center min-w-0">
        <nav className="hidden xl:flex items-center gap-5 text-[15px] font-bold">
          {TEACHER_NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  isActive
                    ? 'text-[#00BCEB] border-[#00BCEB] font-extrabold'
                    : 'text-[#C8DFFF] border-transparent hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={downloadEquipmentStandardMd}
          className="px-3 py-2 rounded-lg bg-[#D97706] hover:bg-[#B45309] border border-[#FBBF24] text-[14px] font-extrabold text-white flex items-center justify-center transition-colors whitespace-nowrap cursor-pointer"
          title="Tải file chuẩn EQUIPMENT_MODULE_STANDARD.md (v2.4) về máy tính"
        >
          <span>.MD</span>
        </button>

        {onToggleNeuralGuide && (
          <button
            type="button"
            onClick={onToggleNeuralGuide}
            className={`px-3 py-2 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer font-extrabold text-[13.5px] whitespace-nowrap ${
              isNeuralGuideEnabled
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'bg-[#133F7E]/70 hover:bg-[#1952A3] border-[#275AA3] text-slate-300'
            }`}
            title="Trợ lý Nơ-ron Thần kinh (Bật/Tắt tia liên kết 3D & chỉ dẫn thao tác - Phím tắt Alt + N)"
            aria-label="Trợ lý Nơ-ron"
          >
            <span>🧠</span>
            <span>{isNeuralGuideEnabled ? 'Nơ-ron: BẬT' : 'Nơ-ron: TẮT'}</span>
          </button>
        )}

        {onOpenNeuralModal && (
          <button
            type="button"
            onClick={onOpenNeuralModal}
            className="px-3 py-2 rounded-lg bg-indigo-600/35 hover:bg-indigo-600/55 border border-indigo-400/60 text-indigo-100 flex items-center gap-1.5 transition-colors cursor-pointer text-[13.5px] font-extrabold whitespace-nowrap"
            title="Mở Sơ đồ Mạng Nơ-ron Toàn cảnh KHTN THCS"
            aria-label="Sơ đồ Nơ-ron"
          >
            <span>🌐</span>
            <span>Sơ đồ Nơ-ron</span>
          </button>
        )}

        {onOpenHtmlModuleImporter && (
          <button
            type="button"
            onClick={onOpenHtmlModuleImporter}
            className="px-3.5 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] border border-[#34D399] text-[14px] font-extrabold text-white flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
            title="Thêm thiết bị mới hoặc nạp file .HTML"
          >
            <Plus className="w-4 h-4 stroke-[2.8]" />
            <span>Thêm thiết bị (.HTML)</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onChangeUserRole('student')}
          className="px-3.5 py-2 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-[14px] font-extrabold text-white flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
        >
          <GraduationCap className="w-4 h-4" />
          <span>Học sinh</span>
        </button>

        <div ref={notifMenuRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setShowWorkspaceMenuPopover(false);
              setIsSearchDropdownOpen(false);
              setShowNotifPopover((v) => !v);
            }}
            className="px-3 py-2 rounded-lg bg-[#133F7E] hover:bg-[#1952A3] border border-[#275AA3] text-[14px] text-white font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Bell className="w-4 h-4 text-[#00BCEB]" />
            <span className="font-mono tabular-nums">{notificationCount}</span>
          </button>

          {showNotifPopover && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 mt-2 w-84 max-w-[calc(100vw-24px)] bg-white/92 backdrop-blur-2xl border-[1.5px] border-white/95 ring-1 ring-[#1D63E8]/55 rounded-[13px] shadow-[0_20px_48px_rgba(9,30,58,0.45)] p-3.5 z-[85] text-[#051630]"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#7DA4D9]">
                <span className="text-[15px] font-extrabold text-[#051630]">
                  Nhật ký hoạt động ({recentLogs.length})
                </span>
                <button
                  type="button"
                  onClick={() => setShowNotifPopover(false)}
                  className="px-2 py-0.5 rounded bg-white/80 hover:bg-rose-600 hover:text-white border border-[#7DA4D9] text-[12.5px] font-extrabold text-[#051630] cursor-pointer transition-colors"
                >
                  Đóng
                </button>
              </div>
              <div className="mt-2 max-h-60 overflow-y-auto space-y-2">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="text-[13px] font-bold text-[#051630] bg-white/60 rounded-[8px] border border-[#9BB8DC] p-2"
                  >
                    <p>{log.text}</p>
                    <p className="text-[11.5px] font-mono font-extrabold text-[#1557D6] mt-0.5">
                      {log.time}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowResetConfirmModal(true)}
          className="px-3 py-2 rounded-lg bg-[#133F7E] hover:bg-[#1952A3] border border-[#275AA3] text-[14px] font-extrabold text-white flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
          title="Đặt lại bàn thí nghiệm"
          aria-label="Đặt lại bàn thí nghiệm"
        >
          <RotateCcw className="w-4 h-4 text-[#FFC83D]" />
          <span className="hidden 2xl:inline">Đặt lại</span>
        </button>

        <button
          type="button"
          onClick={onQuickAddSelectedAsset}
          className="px-3.5 py-2 text-[14px] font-extrabold text-white bg-[#1E6BFF] hover:bg-[#1557D6] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Đặt lên bàn</span>
        </button>
      </div>
      {renderResetConfirmationModal()}
    </header>
  );
};
