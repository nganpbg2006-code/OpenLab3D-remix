import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  AssetDefinition,
  EquipmentCategoryId,
  EquipmentKit,
  LabScene,
  SceneInstance,
  ScienceSubject,
  VerificationStatus,
} from './domain/types';
import {
  equipmentRepository,
  kitRepository,
  environmentRepository,
  experimentRepository,
  sceneRepository,
  PERMANENTLY_REMOVED_ASSET_IDS,
  registerPermanentlyRemovedAssetIds,
} from './repositories/CatalogRepository';
import {
  TopNavBar,
  NavSectionId,
  UserRoleMode,
  StudentScreenId,
  HeaderProgressStep,
} from './components/navigation/TopNavBar';
import {
  AssetExplorerPanel,
  ExplorerTabId,
} from './components/panels/AssetExplorerPanel';
import { SceneHierarchyPanel } from './components/panels/SceneHierarchyPanel';
import { InspectorPanel } from './components/panels/InspectorPanel';
import { BottomWorkspaceTray } from './components/panels/BottomWorkspaceTray';
import {
  LabViewport3D,
  PhysicalDockTargetSlot,
  QuickLabActionType,
  TransformToolMode,
  ViewportDisplayMode,
} from './three-runtime/LabViewport3D';
import { computePascalSimulationMetrics } from './three-runtime/ProceduralLabModels';
import { computeCopperReactionInfo } from './three-runtime/ChemicalLabModels3D';
import { GovernanceOverviewModal } from './components/modals/GovernanceOverviewModal';
import {
  StudentHomeDashboardView,
  StudentPersonalProjectsView,
  PersonalLabProject,
  DEFAULT_PERSONAL_LAB_PROJECTS,
  formatExactSaveDateTime,
} from './components/student/StudentHomeView';
import { StudentEquipmentSidebar } from './components/student/StudentEquipmentSidebar';
import { StudentGuidedStepNumber } from './components/student/StudentGuidedStepPanel';
import { StudentBottomPanelsRow } from './components/student/StudentBottomPanelsRow';
import {
  StudentKitsView,
  StudentHelpModal,
  StudentVideoGuideModal,
  StudentEquipmentDetailModal,
} from './components/student/StudentModalsAndSubViews';
import { StudentAiEquipmentDesignerView } from './components/student/StudentAiEquipmentDesignerView';
import { HtmlModuleImporterModal } from './components/modals/HtmlModuleImporterModal';
import {
  EquipmentPreviewPanel,
  EquipmentRealPhotoUpdaterModal,
} from './components/common/EquipmentPreviewPanel';
import { equipmentImagePreviewController } from './three-runtime/EquipmentImagePreviewController';
import { htmlEquipmentModuleRegistry } from './three-runtime/HtmlEquipmentModuleRegistry';
import { openLabAssetLoader } from './three-runtime/AssetLoader';
import { labSoundEngine } from './three-runtime/LabSoundEngine';
import {
  LabPhenomenonAssistantBubble,
  ScientificPhenomenonEvent,
  classifyScientificPhenomenon,
} from './components/common/LabPhenomenonAssistantBubble';
import { exportProjectToPptx } from './services/projectPptxExporter';
import { EquipmentThumbnailSvg } from './components/common/EquipmentThumbnailSvg';
import { NeuralDeviceNetworkModal } from './components/modals/NeuralDeviceNetworkModal';
import { neuralConnectionEngine } from './domain/neuralConnectionEngine';
import {
  ChevronRight,
  Save,
  Clock,
  FolderOpen,
  ArrowLeft,
  Eraser,
  Check,
  Home,
  Wrench,
  Plus,
  Search,
  X,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface ToastNotification {
  id: string;
  message: string;
  tone: 'info' | 'success' | 'warning' | 'error';
}

export default function App() {
  // 0. User Role, Theme, Guide Visibility & Student Screen State
  const [userRole, setUserRole] = useState<UserRoleMode>('student');
  const [studentScreen, setStudentScreen] =
    useState<StudentScreenId>('home');
  const [studentGuidedStep, setStudentGuidedStep] =
    useState<StudentGuidedStepNumber>(1);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isStudentGuideOpen, setIsStudentGuideOpen] = useState<boolean>(false);
  const [showStudentHelpModal, setShowStudentHelpModal] = useState<boolean>(false);
  const [showVideoGuideModal, setShowVideoGuideModal] = useState<boolean>(false);
  const [showHtmlModuleImporterModal, setShowHtmlModuleImporterModal] =
    useState<boolean>(false);
  const [htmlUpdaterTargetAsset, setHtmlUpdaterTargetAsset] =
    useState<AssetDefinition | null>(null);
  const [initialImportHtmlData, setInitialImportHtmlData] = useState<{
    content: string;
    fileName: string;
  } | null>(null);
  const [moduleRegistryRevision, setModuleRegistryRevision] = useState<number>(0);
  const [studentDetailModalAsset, setStudentDetailModalAsset] =
    useState<AssetDefinition | null>(null);
  const [detailModalEditMode, setDetailModalEditMode] = useState<boolean>(false);
  const [photoUpdaterTargetAsset, setPhotoUpdaterTargetAsset] =
    useState<AssetDefinition | null>(null);

  // Trạng thái Trợ lý Nơ-ron Thần kinh (Bật/Tắt hướng dẫn thao tác & tia liên kết 3D)
  const [isNeuralGuideEnabled, setIsNeuralGuideEnabled] = useState<boolean>(
    () => neuralConnectionEngine.isGuideEnabled,
  );
  const [showNeuralNetworkModal, setShowNeuralNetworkModal] =
    useState<boolean>(false);
  const [neuralModalTargetDeviceId, setNeuralModalTargetDeviceId] = useState<
    string | null
  >(null);

  useEffect(() => {
    const handleOpenNeural = (e?: Event) => {
      const customEv = e as CustomEvent<{ deviceId?: string }>;
      if (customEv?.detail?.deviceId) {
        setNeuralModalTargetDeviceId(customEv.detail.deviceId);
      } else {
        setNeuralModalTargetDeviceId(null);
      }
      setShowNeuralNetworkModal(true);
    };
    const handleSyncGuideToggle = (e?: Event) => {
      const customEv = e as CustomEvent<{ enabled?: boolean }>;
      if (typeof customEv?.detail?.enabled === 'boolean') {
        setIsNeuralGuideEnabled(customEv.detail.enabled);
      }
    };
    window.addEventListener('openlab:open-neural-modal', handleOpenNeural);
    window.addEventListener('openlab:neural-guide-toggle', handleSyncGuideToggle);
    return () => {
      window.removeEventListener('openlab:open-neural-modal', handleOpenNeural);
      window.removeEventListener('openlab:neural-guide-toggle', handleSyncGuideToggle);
    };
  }, []);

  // Danh sách dự án cá nhân bên trong mục "Phòng thí nghiệm 3D" (lưu vào localStorage)
  const [personalProjects, setPersonalProjects] = useState<
    PersonalLabProject[]
  >(() => {
    if (typeof window === 'undefined') return DEFAULT_PERSONAL_LAB_PROJECTS;
    try {
      const raw = window.localStorage.getItem('ol3d_personal_lab_projects_v2');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Ignore storage error
    }
    return DEFAULT_PERSONAL_LAB_PROJECTS;
  });
  const [activePersonalProject, setActivePersonalProject] =
    useState<PersonalLabProject | null>(null);
  const [draftProjectName, setDraftProjectName] = useState<string>('');
  const [isProjectNameConfirmed, setIsProjectNameConfirmed] =
    useState<boolean>(false);
  const [lastSavedProjectTime, setLastSavedProjectTime] = useState<string>('');
  const projectNameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        'ol3d_personal_lab_projects_v2',
        JSON.stringify(personalProjects),
      );
    } catch {
      // Ignore storage quota error
    }
  }, [personalProjects]);

  // Tự động đồng bộ khi các module từ thư viện ổ cứng C:\Users\ltlie\Documents\libraries3DLab được nạp/cập nhật
  useEffect(() => {
    const unsub = htmlEquipmentModuleRegistry.subscribe(() => {
      openLabAssetLoader.clearAllCache();
      setModuleRegistryRevision((r) => r + 1);
      setScene((prev) => ({
        ...prev,
        sceneRevision: prev.sceneRevision + 1,
      }));
    });
    return unsub;
  }, []);

  // Student Experiment Measurement Data for "Bảng kết quả"
  const [measuredMassG, setMeasuredMassG] = useState<number | null>(null);
  const [initialVolumeCm3, setInitialVolumeCm3] = useState<number>(50.0);
  const [finalVolumeCm3, setFinalVolumeCm3] = useState<number | null>(null);

  const objectVolumeCm3 = useMemo(() => {
    if (finalVolumeCm3 === null) return null;
    return Number((finalVolumeCm3 - initialVolumeCm3).toFixed(1));
  }, [finalVolumeCm3, initialVolumeCm3]);

  const densityGCm3 = useMemo(() => {
    if (
      measuredMassG !== null &&
      objectVolumeCm3 !== null &&
      objectVolumeCm3 > 0 &&
      studentGuidedStep >= 4
    ) {
      return Number((measuredMassG / objectVolumeCm3).toFixed(2));
    }
    if (measuredMassG !== null && objectVolumeCm3 !== null && objectVolumeCm3 > 0) {
      return Number((measuredMassG / objectVolumeCm3).toFixed(2));
    }
    return null;
  }, [measuredMassG, objectVolumeCm3, studentGuidedStep]);

  // Map 5 right-panel steps to the 4 header progress steps
  const headerProgressStep: HeaderProgressStep = useMemo(() => {
    if (studentGuidedStep === 1) return 1;
    if (studentGuidedStep === 2) return 2;
    if (studentGuidedStep === 3 || studentGuidedStep === 4) return 3;
    return 4;
  }, [studentGuidedStep]);

  // 1. Catalog Filter & Selection State + Recent Searches (5 most recent queries)
  const [activeNavSection, setActiveNavSection] =
    useState<NavSectionId>('lab-workspace');
  const [explorerTab, setExplorerTab] = useState<ExplorerTabId>('equipment');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const defaultRecent = [
      'Bình cấp nước',
      'Cân điện tử',
      'Ống đong 100 ml',
      'Kính hiển vi',
      'Lực kế 5 N',
    ];
    const removedSearchTerms = new Set([
      'đèn laser',
      'lăng kính',
      'thấu kính',
      'đồng hồ đa năng',
      'bát sứ',
      'bộ chưng cất',
    ]);
    if (typeof window === 'undefined') return defaultRecent;
    try {
      const saved = window.localStorage.getItem(
        'ol3d_recent_equipment_searches_v1',
      );
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed
            .filter(
              (item): item is string =>
                typeof item === 'string' &&
                item.trim().length > 0 &&
                !removedSearchTerms.has(item.trim().toLowerCase()),
            )
            .slice(0, 5);
          if (filtered.length > 0) return filtered;
        }
      }
    } catch {
      // Ignore storage errors
    }
    return defaultRecent;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        'ol3d_recent_equipment_searches_v1',
        JSON.stringify(recentSearches.slice(0, 5)),
      );
    } catch {
      // Ignore storage errors
    }
  }, [recentSearches]);

  const handleRecordRecentSearch = useCallback((rawTerm: string) => {
    const term = rawTerm.trim();
    if (!term) return;
    setRecentSearches((prev) => {
      const deduplicated = prev.filter(
        (existing) => existing.toLowerCase() !== term.toLowerCase(),
      );
      return [term, ...deduplicated].slice(0, 5);
    });
  }, []);

  const handleSelectRecentSearch = useCallback(
    (term: string) => {
      setSearchQuery(term);
      handleRecordRecentSearch(term);
      setExplorerTab('equipment');
      setIsExplorerCollapsed(false);
      // Nếu khớp chính xác với một thiết bị, ghim luôn thẻ preview để người dùng thấy ảnh & thông số ngay
      const q = term.trim().toLowerCase();
      const matched = equipmentRepository
        .list()
        .find(
          (a) =>
            a.name.vi.toLowerCase().includes(q) ||
            a.assetId.toLowerCase() === q,
        );
      if (matched) {
        setSelectedCatalogAssetId(matched.assetId);
        equipmentImagePreviewController.preview(matched.assetId, 'pinned');
      }
    },
    [handleRecordRecentSearch],
  );

  const handleRemoveRecentSearch = useCallback((termToRemove: string) => {
    setRecentSearches((prev) =>
      prev.filter(
        (item) => item.toLowerCase() !== termToRemove.trim().toLowerCase(),
      ),
    );
  }, []);

  const handleClearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);

  const [selectedSubject, setSelectedSubject] = useState<ScienceSubject | 'all'>(
    'all',
  );
  const [selectedCategory, setSelectedCategory] = useState<
    EquipmentCategoryId | 'all'
  >('all');
  const [selectedVerification, setSelectedVerification] = useState<
    VerificationStatus | 'all'
  >('all');
  const [selectedFormat, setSelectedFormat] = useState<
    'all' | 'GLB' | 'glTF' | 'PROCEDURAL_PBR'
  >('all');
  const [selectedCatalogAssetId, setSelectedCatalogAssetId] = useState<
    string | null
  >('OL3D-EQP-BAL-0001');

  // 2. Scene Workspace State
  const [scene, setScene] = useState<LabScene>(() =>
    sceneRepository.getInitialScene(),
  );
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(
    null,
  );
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // 3. 3D Viewport Tool & Layer State
  const [toolMode, setToolMode] = useState<TransformToolMode>('translate');
  const [viewMode, setViewMode] = useState<ViewportDisplayMode>('lab-scene');
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [showAxes, setShowAxes] = useState<boolean>(false);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(false);
  const [showDetailedGuides, setShowDetailedGuides] = useState<boolean>(false);
  const [isExplorerCollapsed, setIsExplorerCollapsed] = useState<boolean>(true);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] =
    useState<boolean>(true);
  const [isViewportFullscreen, setIsViewportFullscreen] =
    useState<boolean>(false);
  const [isLabInfoBarsVisible, setIsLabInfoBarsVisible] =
    useState<boolean>(false);

  // Mặc định thu gọn các thanh thông tin để ưu tiên không gian phòng thí nghiệm 3D; chỉ mở khi người dùng bấm Hiện
  useEffect(() => {
    const getBand = (w: number): 'phone' | 'narrow' | 'wide' => {
      if (w < 768) return 'phone';
      if (w < 1200) return 'narrow';
      return 'wide';
    };

    let lastBand = getBand(window.innerWidth);

    const applyResponsivePanels = (band: 'phone' | 'narrow' | 'wide') => {
      if (band === 'phone') {
        setIsStudentGuideOpen(false);
        setIsRightPanelCollapsed(true);
        setIsExplorerCollapsed(true);
      } else if (band === 'narrow') {
        setIsStudentGuideOpen(false);
        setIsRightPanelCollapsed(true);
      } else {
        setIsStudentGuideOpen(false);
      }
    };

    applyResponsivePanels(lastBand);

    const handleResize = () => {
      const nextBand = getBand(window.innerWidth);
      if (nextBand !== lastBand) {
        lastBand = nextBand;
        applyResponsivePanels(nextBand);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleLibrarySidebar = useCallback(() => {
    setIsExplorerCollapsed((prev) => {
      const nextCollapsed = !prev;
      if (
        !nextCollapsed &&
        typeof window !== 'undefined' &&
        window.innerWidth < 768
      ) {
        setIsStudentGuideOpen(false);
      }
      return nextCollapsed;
    });
  }, []);

  const handleToggleStudentGuide = useCallback(() => {
    setIsStudentGuideOpen((prev) => {
      const nextOpen = !prev;
      if (
        nextOpen &&
        typeof window !== 'undefined' &&
        window.innerWidth < 768
      ) {
        setIsExplorerCollapsed(true);
      }
      return nextOpen;
    });
  }, []);

  // 4. Governance / Overview Modal & Smart Scientific Phenomenon Assistant State
  const [governanceModalMode, setGovernanceModalMode] = useState<
    'overview' | 'governance' | null
  >(null);
  const [activePhenomenon, setActivePhenomenon] =
    useState<ScientificPhenomenonEvent | null>(null);
  const [phenomenonHistory, setPhenomenonHistory] = useState<
    ScientificPhenomenonEvent[]
  >([]);
  const [recentLogs, setRecentLogs] = useState<
    Array<{ id: string; text: string; time: string }>
  >([
    {
      id: 'log-init',
      text: 'Khởi tạo bàn gỗ thí nghiệm: Đo khối lượng riêng của vật rắn (5 thiết bị chuẩn).',
      time: 'Phiên hiện tại',
    },
  ]);

  const notify = useCallback(
    (message: string, tone: ToastNotification['tone'] = 'info') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setRecentLogs((prev) => [
        {
          id,
          text: message,
          time: new Date().toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        },
        ...prev.slice(0, 19),
      ]);

      // Smart Filter: Lọc bỏ các thao tác cơ bản/hiển nhiên (đặt dụng cụ, nhấc lên, xoay 90°, cất vào tủ...),
      // chỉ kích hoạt bong bóng 💡 khi có hiện tượng vật lý/hóa học đáng chú ý hoặc sai số thực nghiệm.
      const scientificEvent = classifyScientificPhenomenon(message, tone);
      if (scientificEvent) {
        setActivePhenomenon(scientificEvent);
        setPhenomenonHistory((prev) => [scientificEvent, ...prev.slice(0, 14)]);
      }
    },
    [],
  );

  // Phím tắt Alt + N toàn cục để Bật/Tắt Trợ lý Nơ-ron Thần kinh
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.altKey && (e.key === 'n' || e.key === 'N')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'n' || e.key === 'N'))
      ) {
        e.preventDefault();
        const next = neuralConnectionEngine.toggleGuideEnabled();
        setIsNeuralGuideEnabled(next);
        notify(
          next
            ? '🧠 Trợ lý Nơ-ron: ĐÃ BẬT (Hiện tia liên kết 3D & hướng dẫn thao tác)'
            : '🧠 Trợ lý Nơ-ron: ĐÃ TẮT (Chế độ tự do / Đánh giá thi)',
          next ? 'success' : 'info',
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [notify]);

  // Toggle Fullscreen for 3D Experiment Viewport (combines workspace expansion + browser fullscreen if permitted)
  const handleToggleViewportFullscreen = useCallback(() => {
    setIsViewportFullscreen((prev) => {
      const next = !prev;
      if (next) {
        setIsStudentGuideOpen(false);
        setIsExplorerCollapsed(true);
        try {
          if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
        } catch {
          // Ignore iframe fullscreen restrictions
        }
      } else {
        setIsExplorerCollapsed(false);
        try {
          if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
        } catch {
          // Ignore
        }
      }
      return next;
    });
  }, []);

  // Danh sách ID thiết bị đã bị người dùng xóa vĩnh viễn khỏi hệ thống (đồng bộ LocalStorage + File máy chủ)
  const [deletedCatalogAssetIds, setDeletedCatalogAssetIds] = useState<
    string[]
  >(() => {
    const merged = new Set<string>(PERMANENTLY_REMOVED_ASSET_IDS);
    if (typeof window !== 'undefined') {
      for (const key of [
        'ol3d_deleted_catalog_assets_v1',
        'ol3d_permanently_deleted_equipment_v1',
      ]) {
        try {
          const raw = window.localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              for (const id of parsed) {
                if (typeof id === 'string' && id.trim()) {
                  merged.add(id.trim());
                }
              }
            }
          }
        } catch {
          // Ignore storage error
        }
      }
    }
    const list = Array.from(merged);
    registerPermanentlyRemovedAssetIds(list);
    return list;
  });

  useEffect(() => {
    registerPermanentlyRemovedAssetIds(deletedCatalogAssetIds);
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        'ol3d_deleted_catalog_assets_v1',
        JSON.stringify(deletedCatalogAssetIds),
      );
      window.localStorage.setItem(
        'ol3d_permanently_deleted_equipment_v1',
        JSON.stringify(deletedCatalogAssetIds),
      );
    } catch {
      // Ignore storage error
    }
  }, [deletedCatalogAssetIds]);

  // Đồng bộ 2 chiều danh sách thiết bị đã xóa vĩnh viễn với máy chủ (lưu vào src/data/permanentlyDeletedAssets.json)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;
    fetch('/api/catalog/deleted-assets')
      .then((res) => {
        const ct = res.headers.get('content-type') || '';
        return res.ok && ct.includes('application/json') ? res.json() : null;
      })
      .then((data) => {
        if (cancelled || !data) return;
        const serverIds: string[] = Array.isArray(data.deletedAssetIds)
          ? data.deletedAssetIds.filter(
              (id: unknown): id is string =>
                typeof id === 'string' && id.trim() !== '',
            )
          : [];
        setDeletedCatalogAssetIds((prev) => {
          const combined = Array.from(new Set([...prev, ...serverIds]));
          registerPermanentlyRemovedAssetIds(combined);
          if (combined.length > serverIds.length) {
            void fetch('/api/catalog/deleted-assets', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ assetIds: combined }),
            }).catch(() => {});
          }
          if (combined.length === prev.length) return prev;
          return combined;
        });
        if (serverIds.length > 0) {
          const serverSet = new Set(serverIds);
          setModuleRegistryRevision((r) => r + 1);
          setScene((prevScene) => {
            const remaining = prevScene.instances.filter(
              (inst) => !serverSet.has(inst.assetId),
            );
            if (remaining.length === prevScene.instances.length) {
              return prevScene;
            }
            return {
              ...prevScene,
              sceneRevision: prevScene.sceneRevision + 1,
              instances: remaining,
            };
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const deletedCatalogAssetIdsSet = useMemo(
    () => new Set(deletedCatalogAssetIds),
    [deletedCatalogAssetIds],
  );

  // Repository queries (refreshes automatically when new .html modules are registered or assets are deleted)
  const allAssets = useMemo(
    () =>
      equipmentRepository
        .list()
        .filter((asset) => !deletedCatalogAssetIdsSet.has(asset.assetId)),
    [moduleRegistryRevision, deletedCatalogAssetIdsSet],
  );
  const assetsMap = useMemo(() => {
    const map = new Map<string, AssetDefinition>();
    equipmentRepository
      .list()
      .filter((a) => !deletedCatalogAssetIdsSet.has(a.assetId))
      .forEach((a) => map.set(a.assetId, a));
    return map;
  }, [moduleRegistryRevision, deletedCatalogAssetIdsSet]);

  // Hộp thoại xác nhận xóa vĩnh viễn dụng cụ
  const [pendingDeleteAsset, setPendingDeleteAsset] =
    useState<AssetDefinition | null>(null);

  // Cửa sổ Kho Thiết Bị Dùng Chung Toàn Cục (`openlab_global_equipment`) dùng chung cho mọi dự án
  const [showGlobalEquipmentModal, setShowGlobalEquipmentModal] =
    useState<boolean>(false);
  const [globalEquipmentSearch, setGlobalEquipmentSearch] =
    useState<string>('');
  const [globalEquipmentFilterTab, setGlobalEquipmentFilterTab] = useState<
    'custom-only' | 'all'
  >('custom-only');

  const executePermanentDeleteCatalogAsset = useCallback(
    (asset: AssetDefinition) => {
      // 1. Xóa khỏi mảng dữ liệu đang lưu trữ (equipmentRepository + htmlEquipmentModuleRegistry + server disk)
      equipmentRepository.deleteById(asset.assetId);
      openLabAssetLoader.invalidateAssetCache(asset.assetId);
      equipmentImagePreviewController.hide('close');

      // 2. Xóa vĩnh viễn khỏi LocalStorage & đồng bộ lên Server để sau mọi lần cải tiến không bao giờ xuất hiện lại
      setDeletedCatalogAssetIds((prev) => {
        const next = prev.includes(asset.assetId)
          ? prev
          : [...prev, asset.assetId];
        registerPermanentlyRemovedAssetIds(next);
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(
              'ol3d_deleted_catalog_assets_v1',
              JSON.stringify(next),
            );
            window.localStorage.setItem(
              'ol3d_permanently_deleted_equipment_v1',
              JSON.stringify(next),
            );
          } catch {
            // Ignore storage error
          }
          void fetch('/api/catalog/deleted-assets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assetId: asset.assetId, assetIds: next }),
          }).catch(() => {});
        }
        return next;
      });

      // 3. Cập nhật giao diện lập tức (DOM Update) và gỡ khỏi bàn thí nghiệm 3D nếu đang đặt trên bàn
      setModuleRegistryRevision((r) => r + 1);
      setScene((prev) => {
        const remaining = prev.instances.filter(
          (inst) => inst.assetId !== asset.assetId,
        );
        if (remaining.length === prev.instances.length) return prev;
        return {
          ...prev,
          sceneRevision: prev.sceneRevision + 1,
          instances: remaining,
        };
      });
      if (selectedCatalogAssetId === asset.assetId) {
        const nextRemaining = allAssets.find(
          (a) => a.assetId !== asset.assetId,
        );
        setSelectedCatalogAssetId(nextRemaining?.assetId ?? null);
      }
      setPendingDeleteAsset(null);
      notify(
        `Đã xóa vĩnh viễn dụng cụ "${asset.name.vi}" khỏi hệ thống (không xuất hiện lại sau các lần cập nhật)!`,
        'info',
      );
    },
    [allAssets, notify, selectedCatalogAssetId],
  );

  const handleDeleteCatalogAsset = useCallback(
    (asset: AssetDefinition) => {
      setPendingDeleteAsset(asset);
    },
    [],
  );

  // Đồng bộ metadata ảnh thực tế của toàn bộ thiết bị vào EquipmentImagePreviewController (Mục 5.1)
  useEffect(() => {
    equipmentImagePreviewController.syncLibraryEntries(allAssets, (asset) => {
      const mod = htmlEquipmentModuleRegistry.getModule(asset.assetId);
      const uploadedDataUrl = htmlEquipmentModuleRegistry.getUploadedRealPhoto(
        asset.assetId,
      );
      const customCaption = htmlEquipmentModuleRegistry.getCustomPhotoCaption(
        asset.assetId,
      );
      return {
        uploadedDataUrl,
        rawRealPhotoMeta: mod?.realPhotoMeta
          ? {
              ...mod.realPhotoMeta,
              caption: customCaption || mod.realPhotoMeta.caption,
            }
          : customCaption
            ? { caption: customCaption }
            : undefined,
        fallbackSvgMarkup: mod?.realPhotoMarkup,
      };
    });
  }, [allAssets, moduleRegistryRevision]);

  const filteredAssets = useMemo(
    () =>
      equipmentRepository
        .list({
          search: searchQuery,
          subject: selectedSubject,
          category: selectedCategory,
          verificationStatus: selectedVerification,
          format: selectedFormat,
        })
        .filter((asset) => !deletedCatalogAssetIdsSet.has(asset.assetId)),
    [
      searchQuery,
      selectedSubject,
      selectedCategory,
      selectedVerification,
      selectedFormat,
      moduleRegistryRevision,
      deletedCatalogAssetIdsSet,
    ],
  );

  const categories = useMemo(() => equipmentRepository.listCategories(), []);
  const kits = useMemo(() => kitRepository.list(), []);
  const environments = useMemo(() => environmentRepository.list(), []);
  const experiments = useMemo(() => experimentRepository.list(), []);

  const activeEnvironment = useMemo(
    () => environmentRepository.getById(scene.environmentId) ?? environments[0],
    [scene.environmentId, environments],
  );

  const activeExperiment = useMemo(
    () => experimentRepository.getById(scene.experimentId) ?? experiments[0],
    [scene.experimentId, experiments],
  );

  const selectedInstance = useMemo(
    () =>
      scene.instances.find((i) => i.instanceId === selectedInstanceId) ?? null,
    [scene.instances, selectedInstanceId],
  );

  const activeInspectedAsset = useMemo(() => {
    if (studentScreen === 'explore-equipment' || viewMode === 'single-asset') {
      if (selectedCatalogAssetId && assetsMap.has(selectedCatalogAssetId)) {
        return assetsMap.get(selectedCatalogAssetId) ?? null;
      }
      if (selectedInstance) {
        return assetsMap.get(selectedInstance.assetId) ?? null;
      }
      return allAssets[0] ?? null;
    }
    if (selectedInstance) {
      return assetsMap.get(selectedInstance.assetId) ?? null;
    }
    if (selectedCatalogAssetId) {
      return assetsMap.get(selectedCatalogAssetId) ?? null;
    }
    return allAssets[0] ?? null;
  }, [
    studentScreen,
    viewMode,
    selectedInstance,
    selectedCatalogAssetId,
    assetsMap,
    allAssets,
  ]);

  const presentAssetIdsSet = useMemo(
    () =>
      new Set(scene.instances.filter((i) => i.visible).map((i) => i.assetId)),
    [scene.instances],
  );

  const requiredExperimentAssetIdsSet = useMemo(
    () =>
      new Set(activeExperiment.steps.flatMap((s) => s.requiredAssetIds)),
    [activeExperiment],
  );

  // Synchronized Selection Handlers
  const handleSelectCatalogAsset = useCallback(
    (assetId: string) => {
      setSelectedCatalogAssetId(assetId);
      const matchingInst = scene.instances.find((i) => i.assetId === assetId);
      if (matchingInst) {
        setSelectedInstanceId(matchingInst.instanceId);
      } else {
        setSelectedInstanceId(null);
      }
    },
    [scene.instances],
  );

  const handleSelectSceneInstance = useCallback(
    (instanceId: string | null) => {
      setSelectedInstanceId(instanceId);
      if (instanceId) {
        const inst = scene.instances.find((i) => i.instanceId === instanceId);
        if (inst) {
          setSelectedCatalogAssetId(inst.assetId);
          if (equipmentImagePreviewController.getState().visible) {
            equipmentImagePreviewController.preview(inst.assetId, 'pinned');
          }
        }
      } else {
        equipmentImagePreviewController.hide('viewport-click');
      }
    },
    [scene.instances],
  );

  // Add Single Asset to 3D Scene (Full Bundle Spawn: 3D Model + Synchronized Control Panel State)
  const handleAddAssetToScene = useCallback(
    (
      assetId: string,
      customPosM?: [number, number, number],
      directAssetOverride?: AssetDefinition,
      initialStatePatch?: Partial<SceneInstance['instanceState']>,
    ) => {
      const asset =
        directAssetOverride ??
        assetsMap.get(assetId) ??
        htmlEquipmentModuleRegistry.getModule(assetId)?.asset;
      if (!asset) return;

      const newInstanceId = `inst-${asset.slug.slice(0, 10)}-${Date.now()
        .toString(36)
        .slice(-4)}-${Math.random().toString(36).slice(2, 5)}`;

      setScene((prev) => {
        const existingCount = prev.instances.filter(
          (i) => i.assetId === asset.assetId,
        ).length;
        const idx = prev.instances.length;
        const angle = (idx * 1.15) % (Math.PI * 2);
        const radius = 0.16 + (idx % 4) * 0.09;
        const rawPosX = customPosM
          ? customPosM[0]
          : Number((Math.cos(angle) * radius).toFixed(3));
        const rawPosZ = customPosM
          ? customPosM[2]
          : Number((Math.sin(angle) * radius * 0.65).toFixed(3));
        const posX = Math.max(-1.65, Math.min(1.65, rawPosX));
        const posZ = Math.max(-0.675, Math.min(0.675, rawPosZ));

        const defaultCap = asset.scientificProperties.capacity
          ? asset.scientificProperties.capacity.value * 0.5
          : undefined;

        const newInstance: SceneInstance = {
          instanceId: newInstanceId,
          assetId: asset.assetId,
          assetVersion: asset.assetVersion || '1.0.0',
          customLabel:
            existingCount === 0
              ? asset.name.vi
              : `${asset.name.vi} (#${existingCount + 1})`,
          parentZone: 'bench-main',
          transform: {
            positionM: [posX, 0, posZ],
            rotationRad: [0, 0, 0],
            displayScale: [1, 1, 1],
          },
          visible: true,
          locked: false,
          labelVisible: true,
          instanceState: (() => {
            const customMod = htmlEquipmentModuleRegistry.getModule(
              asset.assetId,
            );
            const arch = asset.geometry.proceduralArchetype;
            const initialLiquidMl =
              arch === 'thermal-heating-vessel' || arch === 'beaker-bomex-100'
                ? 0
                : arch === 'reagent-bottle-naoh-400' ||
                    arch === 'reagent-bottle-agno3-400'
                  ? 300
                  : defaultCap;
            const baseState: SceneInstance['instanceState'] = {
              liquidLevelMl: initialLiquidMl,
              baseLiquidLevelMl: initialLiquidMl,
              iceMassG: arch === 'ice-cubes-tray' ? 100 : 0,
              thermalPhase: 'liquid-heating',
              measuredMassG: 0,
              tareOffsetG: 0,
              jawOpeningMm: 25,
              springExtensionN: 1.5,
              isPoweredOn: true,
              incidentAngleDeg: 30,
              galvanometerDeflection: 0.6,
              multimeterMode: 'V',
              multimeterValue: 12.0,
              magnification: 40,
              temperatureC:
                arch === 'ice-cubes-tray'
                  ? -5.0
                  : arch === 'alcohol-burner'
                    ? 0.0
                    : arch === 'thermal-heating-vessel' ||
                        arch === 'thermometer' ||
                        arch === 'beaker-250' ||
                        arch === 'beaker-bomex-100' ||
                        arch === 'erlenmeyer-flask' ||
                        arch === 'reagent-bottle-naoh-400' ||
                        arch === 'reagent-bottle-agno3-400'
                      ? 25.0
                      : 78.5,
              isHeating:
                arch === 'alcohol-burner' || arch === 'thermal-heating-vessel'
                  ? false
                  : true,
              switchClosed: false,
              slot1Inserted: true,
              slot1Reversed: false,
              slot2Inserted: true,
              slot2Reversed: false,
              sliderRatio: 0.5,
              rheostatOhm: 10.0,
              ammeterReadingA: 0,
              ammeterRangeMaxA: 0.6,
              ammeterNeedleAngleRad: 0.52,
              voltmeterReadingV: 0,
              voltmeterRangeMaxV: 6.0,
              voltmeterNeedleAngleRad: 0.52,
              bulbPowerW: 0,
              bulbCurrentA: 0,
              bulbVoltageV: 0,
              weightsPiston1: 0,
              weightsPiston2: 0,
              showPascalArrows: true,
              showForceVectors: true,
              showRulerGrid: true,
              capOpen: false,
              bottleTilted: false,
              glassOpacity: 0.58,
              chemicalReactionMode:
                arch === 'copper-wire-ring-3g' ? 'pure' : 'none',
              reactionProgress: 1.0,
              showIntegratedBalance: false,
            };
            let mergedState: SceneInstance['instanceState'] = baseState;
            if (customMod) {
              const ctrl = customMod.moduleControls;
              const savedDefaultPatch =
                htmlEquipmentModuleRegistry.getDefaultStatePatch(asset.assetId);
              mergedState = {
                ...baseState,
                [ctrl.stateKey]: ctrl.defaultValue,
                ...(ctrl.stateKey === 'liquidLevelMl'
                  ? {
                      liquidLevelMl: ctrl.defaultValue,
                      baseLiquidLevelMl: ctrl.defaultValue,
                    }
                  : {}),
                ...(savedDefaultPatch ?? {}),
              };
            }
            if (initialStatePatch) {
              mergedState = {
                ...mergedState,
                ...initialStatePatch,
                ...(initialStatePatch.liquidLevelMl !== undefined &&
                initialStatePatch.baseLiquidLevelMl === undefined
                  ? { baseLiquidLevelMl: initialStatePatch.liquidLevelMl }
                  : {}),
              };
            }
            return mergedState;
          })(),
        };

        return {
          ...prev,
          sceneRevision: prev.sceneRevision + 1,
          updatedAt: new Date().toISOString(),
          instances: [...prev.instances, newInstance],
        };
      });

      setSelectedInstanceId(newInstanceId);
      setSelectedCatalogAssetId(asset.assetId);
      setViewMode('lab-scene');
      labSoundEngine.play(
        asset.materialCategory === 'borosilicate-glass' ? 'glass-clink' : 'wood-place',
        { intensity: 0.9 },
      );
      notify(
        `Đã đặt "${asset.name.vi}" kèm Bảng điều khiển tương tác vào bàn thí nghiệm 3D.`,
        'success',
      );
    },
    [assetsMap, notify],
  );

  // Batch Add Multiple Selected Assets
  const handleBatchAddAssetsToScene = useCallback(
    (assetIds: string[]) => {
      if (assetIds.length === 0) return;
      assetIds.forEach((id, i) => {
        const offsetX = Number((-0.35 + (i % 5) * 0.17).toFixed(3));
        const offsetZ = Number((0.12 + Math.floor(i / 5) * 0.12).toFixed(3));
        handleAddAssetToScene(id, [offsetX, 0, offsetZ]);
      });
      notify(`Đã thêm ${assetIds.length} thiết bị vào bàn thí nghiệm.`, 'success');
    },
    [handleAddAssetToScene, notify],
  );

  // Place all missing required equipment for the active experiment
  const handlePlaceAllRequiredForExperiment = useCallback(() => {
    const reqIds = Array.from(
      new Set(activeExperiment.steps.flatMap((s) => s.requiredAssetIds)),
    );
    const missing = reqIds.filter((id) => !presentAssetIdsSet.has(id));
    if (missing.length === 0) {
      notify('Bàn thí nghiệm đã có đầy đủ dụng cụ cho bài học này.', 'info');
      return;
    }
    missing.forEach((id, idx) => {
      const offsetX = Number((-0.32 + (idx % 4) * 0.22).toFixed(3));
      const offsetZ = Number((0.08 + Math.floor(idx / 4) * 0.14).toFixed(3));
      handleAddAssetToScene(id, [offsetX, 0, offsetZ]);
    });
    notify(`Đã đặt bổ sung ${missing.length} dụng cụ còn thiếu lên bàn.`, 'success');
  }, [activeExperiment, presentAssetIdsSet, handleAddAssetToScene, notify]);

  // Load an Entire Equipment Kit into Scene
  const handleLoadKitToScene = useCallback(
    (kit: EquipmentKit) => {
      const nextInstances: SceneInstance[] = [];
      kit.items.forEach((item, index) => {
        const asset = assetsMap.get(item.assetId);
        if (!asset) return;
        const isPascalPress =
          asset.geometry.proceduralArchetype === 'pascal-hydraulic-press';
        // Nếu bộ kit đã có Bình thông nhau Pascal (đã tích hợp sẵn 8 quả nặng kéo thả trực tiếp trên khay trước),
        // đặt Bình thông nhau ở chính giữa bàn để học sinh thao tác kéo thả từng quả nặng thuận tiện nhất
        if (
          kit.kitId === 'OL3D-KIT-PASCAL-0001' &&
          asset.geometry.proceduralArchetype === 'pascal-weight-100g'
        ) {
          return;
        }
        const col = index % 4;
        const row = Math.floor(index / 4);
        const posX = isPascalPress
          ? 0
          : Number((-0.38 + col * 0.25).toFixed(3));
        const posZ = isPascalPress
          ? 0.04
          : Number((-0.06 + row * 0.2).toFixed(3));
        const defaultCap =
          asset.geometry.proceduralArchetype === 'thermal-heating-vessel' ||
          asset.geometry.proceduralArchetype === 'beaker-bomex-100'
            ? 0
            : asset.geometry.proceduralArchetype === 'reagent-bottle-naoh-400' ||
                asset.geometry.proceduralArchetype === 'reagent-bottle-agno3-400'
              ? 300
              : asset.scientificProperties.capacity
                ? asset.scientificProperties.capacity.value * 0.5
                : undefined;

        nextInstances.push({
          instanceId: `inst-kit-${index + 1}-${Date.now().toString(36).slice(-3)}`,
          assetId: asset.assetId,
          assetVersion: item.assetVersion,
          customLabel: asset.name.vi,
          parentZone: 'bench-main',
          transform: {
            positionM: [posX, 0, posZ],
            rotationRad: [0, 0, 0],
            displayScale: [1, 1, 1],
          },
          visible: true,
          locked: false,
          labelVisible: true,
          instanceState: {
            liquidLevelMl: defaultCap,
            baseLiquidLevelMl: defaultCap,
            measuredMassG: 0,
            tareOffsetG: 0,
            jawOpeningMm: 25,
            isPoweredOn: true,
            incidentAngleDeg: 30,
            galvanometerDeflection: 0.6,
            multimeterMode: 'V',
            multimeterValue: 12.0,
            magnification: 40,
            isHeating: true,
            weightsPiston1: 0,
            weightsPiston2: 0,
            capOpen: false,
            bottleTilted: false,
            glassOpacity: 0.58,
            chemicalReactionMode:
              asset.geometry.proceduralArchetype === 'copper-wire-ring-3g'
                ? 'pure'
                : 'none',
            reactionProgress: 1.0,
            showIntegratedBalance: false,
          },
        });
      });

      if (nextInstances.length > 0) {
        const matchingExp = experiments.find(
          (e) => e.recommendedKitId === kit.kitId,
        );
        setScene((prev) => ({
          ...prev,
          sceneRevision: prev.sceneRevision + 1,
          name: `Cảnh theo bộ: ${kit.name.vi}`,
          experimentId: matchingExp ? matchingExp.experimentId : prev.experimentId,
          updatedAt: new Date().toISOString(),
          instances: nextInstances,
        }));
        setSelectedInstanceId(null);
        setViewMode('lab-scene');
        setStudentGuidedStep(2);
        notify(`Đã bày bộ dụng cụ "${kit.name.vi}" lên bàn thí nghiệm.`, 'success');
      }
    },
    [assetsMap, experiments, notify],
  );

  // Pure solver: Reconciles cumulative multi-object mass on Electronic Balance,
  // cumulative volume displacement in Graduated Cylinder / Beaker, and cumulative force on Spring Dynamometer
  const reconcileCumulativeLabMeasurements = useCallback(
    (rawInstances: SceneInstance[]): SceneInstance[] => {
      const computeItemTotalMassG = (item: SceneInstance): number => {
        const itemAsset = assetsMap.get(item.assetId);
        const itemArch = itemAsset?.geometry.proceduralArchetype;
        if (itemArch === 'copper-wire-ring-3g') {
          return computeCopperReactionInfo(
            item.instanceState.chemicalReactionMode || 'pure',
            item.instanceState.reactionProgress ?? 1.0,
          ).currentMassG;
        }
        const dryMass =
          itemAsset?.scientificProperties.referenceMass?.value ?? 66.25;
        const isVessel =
          itemArch === 'beaker-250' ||
          itemArch === 'beaker-bomex-100' ||
          itemArch === 'graduated-cylinder' ||
          itemArch === 'erlenmeyer-flask' ||
          itemArch === 'porcelain-dish' ||
          itemArch === 'overflow-can' ||
          itemArch === 'reagent-bottle-naoh-400' ||
          itemArch === 'reagent-bottle-agno3-400';
        const waterMass = isVessel
          ? item.instanceState.baseLiquidLevelMl ??
            item.instanceState.liquidLevelMl ??
            0
          : 0;
        // Also include any specimens submerged inside this vessel if the vessel itself is on the balance!
        let submergedMass = 0;
        if (isVessel) {
          for (const sub of rawInstances) {
            if (
              sub.visible &&
              sub.instanceState.attachedToInstanceId === item.instanceId &&
              sub.instanceState.attachmentSlot === 'inside-vessel'
            ) {
              const subAsset = assetsMap.get(sub.assetId);
              if (subAsset?.geometry.proceduralArchetype !== 'thermometer') {
                submergedMass +=
                  subAsset?.scientificProperties.referenceMass?.value ?? 66.25;
              }
            }
          }
        }
        return dryMass + waterMass + submergedMass;
      };

      // Map balanceId -> list of attached items on pan so we can arrange them without overlap
      const panItemsByBalance = new Map<string, SceneInstance[]>();
      for (const inst of rawInstances) {
        if (
          inst.visible &&
          inst.instanceState.attachedToInstanceId &&
          inst.instanceState.attachmentSlot === 'balance-pan'
        ) {
          const bId = inst.instanceState.attachedToInstanceId;
          const list = panItemsByBalance.get(bId) ?? [];
          list.push(inst);
          panItemsByBalance.set(bId, list);
        }
      }

      return rawInstances.map((inst) => {
        const instAsset = assetsMap.get(inst.assetId);
        const arch = instAsset?.geometry.proceduralArchetype;

        // If this item is sitting on a balance pan, keep its position synced to its radial slot on the rotated pan
        if (
          inst.instanceState.attachedToInstanceId &&
          inst.instanceState.attachmentSlot === 'balance-pan'
        ) {
          const parentBalance = rawInstances.find(
            (b) => b.instanceId === inst.instanceState.attachedToInstanceId,
          );
          if (parentBalance) {
            const rotY = parentBalance.transform.rotationRad[1] ?? 0;
            const panX =
              parentBalance.transform.positionM[0] - Math.sin(rotY) * 0.02;
            const panZ =
              parentBalance.transform.positionM[2] - Math.cos(rotY) * 0.02;
            const siblings =
              panItemsByBalance.get(parentBalance.instanceId) ?? [inst];
            const count = siblings.length;
            const idx = Math.max(
              0,
              siblings.findIndex((s) => s.instanceId === inst.instanceId),
            );
            const radius = count <= 1 ? 0 : 0.026;
            const angle = rotY + (idx * Math.PI * 2) / Math.max(1, count);
            const slotX = Number((panX + Math.cos(angle) * radius).toFixed(3));
            const slotZ = Number((panZ + Math.sin(angle) * radius).toFixed(3));
            inst = {
              ...inst,
              transform: {
                ...inst.transform,
                positionM: [slotX, 0.068, slotZ],
              },
            };
          }
        }

        // If this vessel is resting on top of an Alcohol Burner (`alcohol-burner`), Tripod (`tripod-wire-gauze`), or Retort Stand (`retort-stand`), keep it aligned above the flame/gauze/base
        if (
          inst.instanceState.attachedToInstanceId &&
          inst.instanceState.attachmentSlot === 'tripod-top'
        ) {
          const parentStand = rawInstances.find(
            (s) => s.instanceId === inst.instanceState.attachedToInstanceId,
          );
          if (parentStand && parentStand.visible) {
            const parentArch = assetsMap.get(parentStand.assetId)?.geometry
              .proceduralArchetype;
            const supportY =
              parentArch === 'alcohol-burner'
                ? 0.118
                : parentArch === 'retort-stand'
                  ? 0.016
                  : 0.128;
            inst = {
              ...inst,
              transform: {
                ...inst.transform,
                positionM: [
                  parentStand.transform.positionM[0],
                  supportY,
                  parentStand.transform.positionM[2],
                ] as [number, number, number],
              },
            };
          }
        }

        // If this is a Thermometer (`thermometer`) mounted on the Retort Stand (`retort-stand`) or inside a Vessel, keep it aligned with the clamp/vessel
        if (
          arch === 'thermometer' &&
          inst.instanceState.attachedToInstanceId &&
          inst.instanceState.attachmentSlot === 'inside-vessel'
        ) {
          const parentTarget = rawInstances.find(
            (s) => s.instanceId === inst.instanceState.attachedToInstanceId,
          );
          if (parentTarget && parentTarget.visible) {
            const pArch = assetsMap.get(parentTarget.assetId)?.geometry
              .proceduralArchetype;
            let parentX = parentTarget.transform.positionM[0];
            let parentZ = parentTarget.transform.positionM[2];
            let thermY = 0.146;
            if (pArch === 'retort-stand') {
              thermY = 0.146;
            } else {
              let vesselBaseY = parentTarget.transform.positionM[1] ?? 0;
              if (
                parentTarget.instanceState.attachedToInstanceId &&
                parentTarget.instanceState.attachmentSlot === 'tripod-top'
              ) {
                const grandParent = rawInstances.find(
                  (g) =>
                    g.instanceId ===
                    parentTarget.instanceState.attachedToInstanceId,
                );
                if (grandParent && grandParent.visible) {
                  const gpArch = assetsMap.get(grandParent.assetId)?.geometry
                    .proceduralArchetype;
                  parentX = grandParent.transform.positionM[0];
                  parentZ = grandParent.transform.positionM[2];
                  vesselBaseY =
                    gpArch === 'alcohol-burner'
                      ? 0.118
                      : gpArch === 'retort-stand'
                        ? 0.016
                        : 0.128;
                }
              }
              thermY = Number((vesselBaseY + 0.018).toFixed(3));
            }
            inst = {
              ...inst,
              transform: {
                ...inst.transform,
                positionM: [parentX, thermY, parentZ] as [number, number, number],
              },
            };
          }
        }

        // 1. Electronic Balance: sum the masses of ALL items on its pan
        if (arch === 'electronic-balance') {
          const itemsOnPan = panItemsByBalance.get(inst.instanceId) ?? [];
          const totalPanMassG = Number(
            itemsOnPan
              .reduce((acc, item) => acc + computeItemTotalMassG(item), 0)
              .toFixed(2),
          );
          return {
            ...inst,
            instanceState: {
              ...inst.instanceState,
              measuredMassG: totalPanMassG,
              tareOffsetG:
                totalPanMassG === 0
                  ? 0
                  : inst.instanceState.tareOffsetG ?? 0,
            },
          };
        }

        // 2. Graduated Cylinder / Beaker: base liquid volume + sum of ALL submerged specimens' volumes
        if (
          arch === 'graduated-cylinder' ||
          arch === 'beaker-250' ||
          arch === 'beaker-bomex-100'
        ) {
          const baseMl =
            inst.instanceState.baseLiquidLevelMl ??
            inst.instanceState.liquidLevelMl ??
            (arch === 'graduated-cylinder'
              ? 50
              : arch === 'beaker-bomex-100'
                ? 0
                : 40);
          let displacedVolCm3 = 0;
          for (const sub of rawInstances) {
            if (
              sub.visible &&
              sub.instanceState.attachedToInstanceId === inst.instanceId &&
              sub.instanceState.attachmentSlot === 'inside-vessel'
            ) {
              const subAsset = assetsMap.get(sub.assetId);
              if (subAsset?.geometry.proceduralArchetype !== 'thermometer') {
                displacedVolCm3 +=
                  subAsset?.scientificProperties.referenceVolume?.value ?? 24.5;
              }
            }
          }
          return {
            ...inst,
            instanceState: {
              ...inst.instanceState,
              baseLiquidLevelMl: baseMl,
              liquidLevelMl: Number((baseMl + displacedVolCm3).toFixed(1)),
            },
          };
        }

        // 3. Overflow Can (Bình tràn Eureka chuẩn 210.0 ml):
        // Mực nước + thể tích vật chìm vượt quá 210.0 ml sẽ chảy tràn qua vòi; nước trong bình không bao giờ dâng vượt 210.0 ml.
        if (arch === 'overflow-can') {
          const curWaterMl = inst.instanceState.baseLiquidLevelMl ?? 210;
          let submergedVolCm3 = 0;
          for (const sub of rawInstances) {
            if (
              sub.visible &&
              sub.instanceState.attachedToInstanceId === inst.instanceId &&
              sub.instanceState.attachmentSlot === 'inside-vessel' &&
              assetsMap.get(sub.assetId)?.geometry.proceduralArchetype !==
                'thermometer'
            ) {
              const subAsset = assetsMap.get(sub.assetId);
              submergedVolCm3 +=
                subAsset?.scientificProperties.referenceVolume?.value ?? 24.5;
            }
          }
          const combinedMl = curWaterMl + submergedVolCm3;
          const spilledMl = Math.max(0, Number((combinedMl - 210).toFixed(1)));
          const remainingWaterMl = Math.max(
            0,
            Number((curWaterMl - spilledMl).toFixed(1)),
          );
          const displayedLevelMl = Number(
            Math.min(210, remainingWaterMl + submergedVolCm3).toFixed(1),
          );
          return {
            ...inst,
            instanceState: {
              ...inst.instanceState,
              baseLiquidLevelMl: remainingWaterMl,
              liquidLevelMl: displayedLevelMl,
              overflowingVolumeMl:
                spilledMl > 0
                  ? spilledMl
                  : submergedVolCm3 > 0
                    ? inst.instanceState.overflowingVolumeMl ?? 0
                    : 0,
              isValveOpen: inst.instanceState.isValveOpen ?? false,
            },
          };
        }

        // 4. Spring Dynamometer: sum of forces P = m * g of ALL items hooked onto it
        if (arch === 'spring-dynamometer') {
          let totalHookedMassG = 0;
          for (const sub of rawInstances) {
            if (
              sub.visible &&
              sub.instanceState.attachedToInstanceId === inst.instanceId &&
              sub.instanceState.attachmentSlot === 'dynamometer-hook'
            ) {
              totalHookedMassG += computeItemTotalMassG(sub);
            }
          }
          const totalForceN = Number((totalHookedMassG * 0.00981).toFixed(2));
          return {
            ...inst,
            instanceState: {
              ...inst.instanceState,
              springExtensionN: totalForceN,
            },
          };
        }

        return inst;
      });
    },
    [assetsMap],
  );

  // Update Instance Transform (Preserves attached items on Electronic Balance pan when balance is rotated or moved)
  const handleUpdateInstanceTransform = useCallback(
    (
      instanceId: string,
      positionM: [number, number, number],
      rotationRad: [number, number, number],
      displayScale?: [number, number, number],
    ) => {
      setScene((prev) => {
        const updated = prev.instances.map((inst) =>
          inst.instanceId === instanceId
            ? {
                ...inst,
                transform: {
                  positionM,
                  rotationRad,
                  displayScale: displayScale ?? inst.transform.displayScale,
                },
              }
            : inst,
        );
        return {
          ...prev,
          sceneRevision: prev.sceneRevision + 1,
          updatedAt: new Date().toISOString(),
          instances: reconcileCumulativeLabMeasurements(updated),
        };
      });
    },
    [reconcileCumulativeLabMeasurements],
  );

  // Real-Life Physical Lab Docking Handler (Cumulative Multi-Object Balance Weighing, Liquid Pouring, Submersion, Dynamometer & Caliper)
  const handlePhysicalDockInteraction = useCallback(
    (
      draggedInstanceId: string,
      targetInstanceId: string | null,
      slot: PhysicalDockTargetSlot,
      finalPositionM: [number, number, number],
    ) => {
      const draggedInst = scene.instances.find(
        (i) => i.instanceId === draggedInstanceId,
      );
      if (!draggedInst) return;
      const draggedAsset = assetsMap.get(draggedInst.assetId);
      const dryMassG =
        draggedAsset?.scientificProperties.referenceMass?.value ?? 66.25;
      const draggedArch = draggedAsset?.geometry.proceduralArchetype;
      const isLiquidVessel =
        draggedArch === 'beaker-250' ||
        draggedArch === 'beaker-bomex-100' ||
        draggedArch === 'graduated-cylinder' ||
        draggedArch === 'erlenmeyer-flask' ||
        draggedArch === 'porcelain-dish';
      const waterMassG = isLiquidVessel
        ? draggedInst.instanceState.baseLiquidLevelMl ??
          draggedInst.instanceState.liquidLevelMl ??
          0
        : 0;
      const singleItemMassG = Number((dryMassG + waterMassG).toFixed(2));
      const specimenVolumeCm3 =
        draggedArch === 'thermometer'
          ? 0
          : draggedAsset?.scientificProperties.referenceVolume?.value ?? 24.5;
      const specimenWidthMm = Number(
        ((draggedAsset?.geometry.boundingBoxM.width ?? 0.025) * 1000).toFixed(1),
      );

      // Khi người dùng quăng hoặc kéo dụng cụ vào Tủ kính 2 tầng hoặc Tủ Vật Phẩm Trái / Phải:
      // Dụng cụ sẽ cất gọn vào trong tủ tương ứng.
      if (
        slot === 'storage-cabinet' ||
        slot === 'under-shelf-cabinet-left' ||
        slot === 'under-shelf-cabinet-right'
      ) {
        setScene((prev) => {
          const remaining = prev.instances
            .filter((i) => i.instanceId !== draggedInstanceId)
            .map((item) =>
              item.instanceState.attachedToInstanceId === draggedInstanceId
                ? {
                    ...item,
                    transform: {
                      ...item.transform,
                      positionM: [
                        item.transform.positionM[0],
                        0,
                        item.transform.positionM[2],
                      ] as [number, number, number],
                    },
                    instanceState: {
                      ...item.instanceState,
                      attachedToInstanceId: null,
                      attachmentSlot: 'bench' as const,
                    },
                  }
                : item,
            );
          return {
            ...prev,
            sceneRevision: prev.sceneRevision + 1,
            updatedAt: new Date().toISOString(),
            instances: reconcileCumulativeLabMeasurements(remaining),
          };
        });
        if (selectedInstanceId === draggedInstanceId) {
          setSelectedInstanceId(null);
        }
        labSoundEngine.play('wood-place', { intensity: 0.9 });
        const cabinetLabel =
          slot === 'under-shelf-cabinet-left'
            ? 'TỦ VẬT PHẨM TRÁI'
            : slot === 'under-shelf-cabinet-right'
              ? 'TỦ VẬT PHẨM PHẢI'
              : 'Tủ Kính 2 Tầng';
        notify(
          `Đã cất "${draggedInst.customLabel || draggedAsset?.name.vi || draggedInst.assetId}" vào ${cabinetLabel}.`,
          'info',
        );
        return;
      }

      const targetInst = targetInstanceId
        ? scene.instances.find((i) => i.instanceId === targetInstanceId)
        : null;
      const targetAsset = targetInst ? assetsMap.get(targetInst.assetId) : null;
      const targetArch = targetAsset?.geometry.proceduralArchetype;

      // Calculate liquid transfer amount if slot === 'pour-liquid'
      const sourceAvailMl =
        draggedInst.instanceState.baseLiquidLevelMl ??
        draggedInst.instanceState.liquidLevelMl ??
        40;
      const targetCapMl =
        targetArch === 'overflow-can'
          ? 210
          : targetAsset?.scientificProperties.capacity?.value ?? 100;
      const targetCurBaseMl =
        targetInst?.instanceState.baseLiquidLevelMl ??
        targetInst?.instanceState.liquidLevelMl ??
        (targetArch === 'beaker-bomex-100' ||
        targetArch === 'thermal-heating-vessel'
          ? 0
          : targetCapMl * 0.5);
      const defaultPourAmt =
        targetArch === 'overflow-can' && targetCurBaseMl < 210
          ? Math.min(50, 210 - targetCurBaseMl)
          : 20;
      const pourAmountMl =
        slot === 'pour-liquid'
          ? Math.max(
              0,
              Math.min(defaultPourAmt, sourceAvailMl, targetCapMl - targetCurBaseMl),
            )
          : 0;

      // Calculate automatic water dispensing when docking a vessel with the Water Dispenser ('dispenser-outlet')
      const isDraggingDispenser = draggedArch === 'water-dispenser';
      const dispenserPeer =
        slot === 'dispenser-outlet'
          ? isDraggingDispenser
            ? draggedInst
            : targetInst
          : null;
      const vesselPeer =
        slot === 'dispenser-outlet'
          ? isDraggingDispenser
            ? targetInst
            : draggedInst
          : null;
      const vesselPeerAsset = vesselPeer
        ? assetsMap.get(vesselPeer.assetId)
        : null;
      const vesselPeerArch = vesselPeerAsset?.geometry.proceduralArchetype;
      const vesselPeerCapMl =
        vesselPeerArch === 'overflow-can'
          ? 210
          : vesselPeerAsset?.scientificProperties.capacity?.value ?? 100;
      const vesselPeerCurBaseMl =
        vesselPeer?.instanceState.baseLiquidLevelMl ??
        vesselPeer?.instanceState.liquidLevelMl ??
        (vesselPeerArch === 'beaker-bomex-100' ||
        vesselPeerArch === 'thermal-heating-vessel'
          ? 0
          : vesselPeerCapMl * 0.5);
      const dispenserAvailMl =
        dispenserPeer?.instanceState.liquidLevelMl ?? 850;
      const desiredAutoDispenseMl =
        vesselPeerArch === 'overflow-can' && vesselPeerCurBaseMl < 210
          ? Math.max(0, 210 - vesselPeerCurBaseMl)
          : Math.max(0, Math.min(25, vesselPeerCapMl - vesselPeerCurBaseMl));
      const autoDispenseMl =
        slot === 'dispenser-outlet'
          ? Math.max(0, Math.min(desiredAutoDispenseMl, dispenserAvailMl))
          : 0;

      // Thermal reading if dragging thermometer into a vessel
      const measuredTempC =
        draggedArch === 'thermometer' && slot === 'inside-vessel'
          ? typeof targetInst?.instanceState.temperatureC === 'number'
            ? targetInst.instanceState.temperatureC
            : (targetArch === 'porcelain-dish' ||
                  targetArch === 'distillation-flask') &&
                targetInst?.instanceState.isHeating !== false
              ? 78.5
              : 25.0
          : draggedInst.instanceState.temperatureC;

      const isOverflowCan = targetArch === 'overflow-can';

      const draftInstances = scene.instances.map((inst) => {
        // Case A: Dispenser-Outlet Docking (either vessel dragged to dispenser OR dispenser dragged to vessel)
        if (slot === 'dispenser-outlet' && dispenserPeer && vesselPeer) {
          if (inst.instanceId === dispenserPeer.instanceId) {
            const nextDispMl = Math.max(
              0,
              Number((dispenserAvailMl - autoDispenseMl).toFixed(1)),
            );
            return {
              ...inst,
              transform:
                inst.instanceId === draggedInstanceId
                  ? { ...inst.transform, positionM: finalPositionM }
                  : inst.transform,
              instanceState: {
                ...inst.instanceState,
                baseLiquidLevelMl: nextDispMl,
                liquidLevelMl: nextDispMl,
                isValveOpen: autoDispenseMl > 0.1,
              },
            };
          }
          if (inst.instanceId === vesselPeer.instanceId) {
            const nextVesselMl = Number(
              (vesselPeerCurBaseMl + autoDispenseMl).toFixed(1),
            );
            const dispRotY =
              (isDraggingDispenser
                ? finalPositionM
                : dispenserPeer.transform.positionM) &&
              (dispenserPeer.transform.rotationRad[1] ?? 0);
            const dispPos = isDraggingDispenser
              ? finalPositionM
              : dispenserPeer.transform.positionM;
            const dockSpoutPos: [number, number, number] = [
              Number((dispPos[0] + Math.cos(dispRotY) * 0.095).toFixed(3)),
              0,
              Number((dispPos[2] - Math.sin(dispRotY) * 0.095).toFixed(3)),
            ];
            return {
              ...inst,
              transform: {
                ...inst.transform,
                positionM: isDraggingDispenser ? dockSpoutPos : finalPositionM,
              },
              instanceState: {
                ...inst.instanceState,
                baseLiquidLevelMl: nextVesselMl,
                liquidLevelMl: nextVesselMl,
                overflowingVolumeMl: 0,
                attachedToInstanceId: dispenserPeer.instanceId,
                attachmentSlot: 'dispenser-outlet' as const,
              },
            };
          }
        }

        const isIceTransferDock =
          draggedArch === 'ice-cubes-tray' &&
          slot === 'inside-vessel' &&
          Boolean(targetInstanceId);
        const trayAvailIceG = draggedInst.instanceState.iceMassG ?? 100;
        const iceTransferG =
          isIceTransferDock && trayAvailIceG > 0.5
            ? Math.min(trayAvailIceG, 100)
            : 0;

        const isPascalWeightDock =
          (slot === 'pascal-piston-1' || slot === 'pascal-piston-2') &&
          Boolean(targetInstanceId);

        if (inst.instanceId === draggedInstanceId) {
          const curBaseMl =
            inst.instanceState.baseLiquidLevelMl ??
            inst.instanceState.liquidLevelMl ??
            40;
          const nextLiquidMl =
            slot === 'pour-liquid'
              ? Math.max(0, curBaseMl - pourAmountMl)
              : inst.instanceState.liquidLevelMl;
          return {
            ...inst,
            transform: {
              ...inst.transform,
              positionM: finalPositionM,
              displayScale: [1, 1, 1] as [number, number, number],
            },
            instanceState: {
              ...inst.instanceState,
              temperatureC: measuredTempC,
              liquidLevelMl: nextLiquidMl,
              baseLiquidLevelMl:
                slot === 'pour-liquid'
                  ? nextLiquidMl
                  : inst.instanceState.baseLiquidLevelMl,
              ...(isIceTransferDock
                ? {
                    iceMassG: Number(
                      Math.max(0, trayAvailIceG - iceTransferG).toFixed(1),
                    ),
                  }
                : {}),
              // If pouring liquid, transferring ice, docking weight to Pascal press, or placing on side-shelf/bench, keep it unattached
              attachedToInstanceId:
                slot === 'pour-liquid' ||
                slot === 'bench' ||
                slot === 'side-shelf' ||
                isIceTransferDock ||
                isPascalWeightDock
                  ? null
                  : targetInstanceId,
              attachmentSlot:
                slot === 'pour-liquid' ||
                slot === 'side-shelf' ||
                isIceTransferDock ||
                isPascalWeightDock
                  ? 'bench'
                  : slot,
            },
          };
        }

        // Nếu người dùng kéo Quả nặng chuẩn Pascal 100g (hoặc quả cân/vật mẫu) thả lên Pit-tông (1) hoặc Pit-tông (2) của Bình thông nhau Pascal
        if (isPascalWeightDock && inst.instanceId === targetInstanceId) {
          const curN1 = inst.instanceState.weightsPiston1 ?? 0;
          const curN2 = inst.instanceState.weightsPiston2 ?? 0;
          if (curN1 + curN2 < 8) {
            return {
              ...inst,
              instanceState: {
                ...inst.instanceState,
                weightsPiston1:
                  slot === 'pascal-piston-1' ? curN1 + 1 : curN1,
                weightsPiston2:
                  slot === 'pascal-piston-2' ? curN2 + 1 : curN2,
              },
            };
          }
        }

        // Nếu người dùng kéo Khay Nước Đá Viên (`ice-cubes-tray`) thả vào Bình thủy tinh chịu nhiệt / Cốc đựng -> Đổ đá viên vào bình!
        if (
          isIceTransferDock &&
          inst.instanceId === targetInstanceId &&
          iceTransferG > 0
        ) {
          const prevIceG = inst.instanceState.iceMassG ?? 0;
          const prevLiquidMl = inst.instanceState.liquidLevelMl ?? 0;
          const prevTempC = inst.instanceState.temperatureC ?? 25.0;
          const nextIceG = Number((prevIceG + iceTransferG).toFixed(1));
          const nextTempC =
            prevLiquidMl > 1 && Math.abs(prevTempC) > 0.5
              ? Number(
                  (prevTempC > 0
                    ? Math.max(4.0, prevTempC - 3.0)
                    : prevTempC
                  ).toFixed(1),
                )
              : -4.0;
          return {
            ...inst,
            instanceState: {
              ...inst.instanceState,
              iceMassG: nextIceG,
              temperatureC: nextTempC,
              thermalPhase: (nextTempC < 0 ? 'subzero-ice' : 'melting-0c') as
                | 'subzero-ice'
                | 'melting-0c',
            },
          };
        }

        const instAsset = assetsMap.get(inst.assetId);
        const arch = instAsset?.geometry.proceduralArchetype;

        // Nếu người dùng kéo Đèn cồn (`alcohol-burner`) đặt vào dưới Bình thủy tinh chịu nhiệt / Cốc 250ml -> Tự động nâng Bình lên trên vòng đỡ của Đèn cồn (y = 0.118 m)!
        if (
          draggedArch === 'alcohol-burner' &&
          slot === 'under-tripod' &&
          inst.instanceId === targetInstanceId &&
          (arch === 'thermal-heating-vessel' ||
            arch === 'beaker-250' ||
            arch === 'beaker-bomex-100' ||
            arch === 'erlenmeyer-flask' ||
            arch === 'distillation-flask' ||
            arch === 'porcelain-dish')
        ) {
          return {
            ...inst,
            transform: {
              ...inst.transform,
              positionM: [
                finalPositionM[0],
                0.118,
                finalPositionM[2],
              ] as [number, number, number],
            },
            instanceState: {
              ...inst.instanceState,
              attachedToInstanceId: draggedInstanceId,
              attachmentSlot: 'tripod-top' as const,
            },
          };
        }

        // Pouring target vessel receives water (updates its baseLiquidLevelMl)
        if (slot === 'pour-liquid' && inst.instanceId === targetInstanceId) {
          const nextMl = Number((targetCurBaseMl + pourAmountMl).toFixed(1));
          return {
            ...inst,
            instanceState: {
              ...inst.instanceState,
              liquidLevelMl: nextMl,
              baseLiquidLevelMl: nextMl,
            },
          };
        }

        // Overflow Can activates transient spout stream ONLY while excess water (> 210.0 ml) is actively spilling
        if (
          arch === 'overflow-can' &&
          slot === 'inside-vessel' &&
          inst.instanceId === targetInstanceId &&
          draggedArch !== 'thermometer' &&
          draggedInst.instanceState.attachedToInstanceId !== targetInstanceId
        ) {
          const canCurLevelMl = inst.instanceState.liquidLevelMl ?? 210;
          const actualSpillMl = Math.max(
            0,
            Number((canCurLevelMl + specimenVolumeCm3 - 210).toFixed(1)),
          );
          if (actualSpillMl > 0.05) {
            return {
              ...inst,
              instanceState: {
                ...inst.instanceState,
                isValveOpen: true,
              },
            };
          }
        }

        // Beaker catches actual overflow water exceeding 210.0 ml when a specimen is newly dropped into Overflow Can
        if (
          arch === 'beaker-250' &&
          slot === 'inside-vessel' &&
          isOverflowCan &&
          targetInst &&
          draggedArch !== 'thermometer' &&
          draggedInst.instanceState.attachedToInstanceId !== targetInstanceId
        ) {
          const canCurLevelMl = targetInst.instanceState.liquidLevelMl ?? 210;
          const actualSpillMl = Math.max(
            0,
            Number((canCurLevelMl + specimenVolumeCm3 - 210).toFixed(1)),
          );
          const curBeakerBase =
            inst.instanceState.baseLiquidLevelMl ??
            inst.instanceState.liquidLevelMl ??
            40;
          const nextBeakerMl = Number(
            (curBeakerBase + actualSpillMl).toFixed(1),
          );
          // Automatically position beaker right under the overflow spout (+X side of overflow can) if it is on the bench
          const nextBeakerPos: [number, number, number] =
            inst.instanceState.attachmentSlot === 'balance-pan'
              ? inst.transform.positionM
              : [
                  Number(Math.min(1.15, targetInst.transform.positionM[0] + 0.122).toFixed(3)),
                  0,
                  Number(targetInst.transform.positionM[2].toFixed(3)),
                ];
          return {
            ...inst,
            transform: {
              ...inst.transform,
              positionM: nextBeakerPos,
            },
            instanceState: {
              ...inst.instanceState,
              baseLiquidLevelMl: nextBeakerMl,
              liquidLevelMl: nextBeakerMl,
            },
          };
        }

        // Vernier Caliper jaw measurement
        if (arch === 'vernier-caliper') {
          if (slot === 'caliper-jaws' && inst.instanceId === targetInstanceId) {
            return {
              ...inst,
              instanceState: {
                ...inst.instanceState,
                jawOpeningMm: specimenWidthMm,
              },
            };
          }
        }

        return inst;
      });

      const targetPascalPress =
        (slot === 'pascal-piston-1' || slot === 'pascal-piston-2') &&
        targetInstanceId
          ? scene.instances.find((i) => i.instanceId === targetInstanceId)
          : undefined;
      const canAbsorbIntoPascalPress =
        Boolean(targetPascalPress) &&
        ((targetPascalPress?.instanceState.weightsPiston1 ?? 0) +
          (targetPascalPress?.instanceState.weightsPiston2 ?? 0) <
          8) &&
        (draggedAsset?.geometry.proceduralArchetype === 'pascal-weight-100g' ||
          draggedAsset?.geometry.proceduralArchetype === 'calibration-weight');

      const filteredDraftInstances = canAbsorbIntoPascalPress
        ? draftInstances.filter((i) => i.instanceId !== draggedInstanceId)
        : draftInstances;

      const reconciledInstances =
        reconcileCumulativeLabMeasurements(filteredDraftInstances);

      if (canAbsorbIntoPascalPress && targetInstanceId) {
        setSelectedInstanceId(targetInstanceId);
      }

      setScene((prev) => ({
        ...prev,
        sceneRevision: prev.sceneRevision + 1,
        updatedAt: new Date().toISOString(),
        instances: reconciledInstances,
      }));

      // Sync student data table & toast notifications with the reconciled cumulative values
      const activeBalance = reconciledInstances.find(
        (i) =>
          assetsMap.get(i.assetId)?.geometry.proceduralArchetype ===
          'electronic-balance',
      );
      if (activeBalance) {
        const netMassG = Math.max(
          0,
          (activeBalance.instanceState.measuredMassG ?? 0) -
            (activeBalance.instanceState.tareOffsetG ?? 0),
        );
        if (netMassG > 0) {
          setMeasuredMassG(Number(netMassG.toFixed(2)));
        }
      }

      if (slot === 'balance-pan' && targetInstanceId) {
        const updatedBalance = reconciledInstances.find(
          (i) => i.instanceId === targetInstanceId,
        );
        const itemsOnPanCount = reconciledInstances.filter(
          (i) =>
            i.visible &&
            i.instanceState.attachedToInstanceId === targetInstanceId &&
            i.instanceState.attachmentSlot === 'balance-pan',
        ).length;
        const rawTotalG = updatedBalance?.instanceState.measuredMassG ?? singleItemMassG;
        const tareG = updatedBalance?.instanceState.tareOffsetG ?? 0;
        const netDisplayG = Math.max(0, rawTotalG - tareG);

        if (studentGuidedStep < 2) setStudentGuidedStep(2);
        labSoundEngine.play('scale-place', {
          value: netDisplayG,
          fillRatio: Math.min(1, netDisplayG / 500),
        });
        notify(
          itemsOnPanCount > 1
            ? `Đã đặt thêm "${draggedInst.customLabel || draggedAsset?.name.vi}" (+${singleItemMassG.toFixed(2)} g) lên Cân điện tử → Tổng ${itemsOnPanCount} vật: m = ${netDisplayG.toFixed(2)} g`
            : `Đã đặt "${draggedInst.customLabel || draggedAsset?.name.vi}" lên Cân điện tử: m = ${netDisplayG.toFixed(2)} g`,
          'success',
        );
      } else if (
        draggedInst.instanceState.attachmentSlot === 'balance-pan' &&
        slot !== 'balance-pan'
      ) {
        const prevBalanceId = draggedInst.instanceState.attachedToInstanceId;
        const updatedBalance = reconciledInstances.find(
          (i) => i.instanceId === prevBalanceId,
        );
        const remainingG = Math.max(
          0,
          (updatedBalance?.instanceState.measuredMassG ?? 0) -
            (updatedBalance?.instanceState.tareOffsetG ?? 0),
        );
        labSoundEngine.play('wood-place', { intensity: 0.85 });
        notify(
          `Đã lấy "${draggedInst.customLabel || draggedAsset?.name.vi}" (-${singleItemMassG.toFixed(2)} g) khỏi đĩa cân → Khối lượng còn lại trên cân: ${remainingG.toFixed(2)} g`,
          'info',
        );
      } else if (slot === 'dispenser-outlet' && dispenserPeer && vesselPeer) {
        const newVesselMl = Number(
          (vesselPeerCurBaseMl + autoDispenseMl).toFixed(1),
        );
        if (vesselPeerArch === 'graduated-cylinder') {
          setInitialVolumeCm3(newVesselMl);
        }
        if (autoDispenseMl > 0.1) {
          const dispId = dispenserPeer.instanceId;
          window.setTimeout(() => {
            setScene((prev) => ({
              ...prev,
              instances: prev.instances.map((item) =>
                item.instanceId === dispId
                  ? {
                      ...item,
                      instanceState: {
                        ...item.instanceState,
                        isValveOpen: false,
                      },
                    }
                  : item,
              ),
            }));
          }, 1150);
          labSoundEngine.play('water-pour', {
            fillRatio: Math.min(1, newVesselMl / Math.max(10, vesselPeerCapMl)),
            intensity: 1,
          });
          notify(
            `Đã đặt "${vesselPeer.customLabel || vesselPeerAsset?.name.vi}" vào khay hứng vòi Bình cấp nước và xả +${autoDispenseMl.toFixed(1)} ml (Mực nước: ${newVesselMl.toFixed(1)} / ${vesselPeerCapMl} ml).`,
            'success',
          );
        } else {
          labSoundEngine.play('glass-clink', { intensity: 0.7 });
          notify(
            `Đã đặt "${vesselPeer.customLabel || vesselPeerAsset?.name.vi}" dưới vòi Bình cấp nước (Hiện tại: ${newVesselMl.toFixed(1)} / ${vesselPeerCapMl} ml).`,
            'info',
          );
        }
      } else if (slot === 'pour-liquid') {
        if (pourAmountMl > 0) {
          const updatedTarget = reconciledInstances.find(
            (i) => i.instanceId === targetInstanceId,
          );
          const newTargetMl =
            updatedTarget?.instanceState.liquidLevelMl ??
            targetCurBaseMl + pourAmountMl;
          if (targetArch === 'graduated-cylinder') {
            setInitialVolumeCm3(Number(newTargetMl.toFixed(1)));
          }
          const capVal =
            targetArch === 'overflow-can'
              ? 210
              : targetAsset?.scientificProperties.capacity?.value ?? 100;
          labSoundEngine.play('water-pour', {
            fillRatio: Math.min(1, newTargetMl / Math.max(10, capVal)),
            intensity: 1,
          });
          notify(
            `Đã nghiêng rót +${pourAmountMl.toFixed(1)} ml nước từ ${draggedAsset?.name.vi} sang ${targetAsset?.name.vi} (Mực nước mới: ${newTargetMl.toFixed(1)} ml).`,
            'success',
          );
        } else {
          labSoundEngine.play('glass-clink', { intensity: 0.7 });
          notify(
            `${targetAsset?.name.vi} đã đầy hoặc bình nguồn đã hết nước.`,
            'warning',
          );
        }
      } else if (slot === 'inside-vessel') {
        if (draggedArch === 'ice-cubes-tray') {
          const trayHadIce = (draggedInst.instanceState.iceMassG ?? 100) > 0.5;
          if (trayHadIce) {
            const updatedVessel = reconciledInstances.find(
              (i) => i.instanceId === targetInstanceId,
            );
            const totalIceG = updatedVessel?.instanceState.iceMassG ?? 100;
            labSoundEngine.play('dock-hover-snap', 0.95);
            notify(
              `🧊 Đã cho Nước đá viên (-4.0 °C) vào ${targetAsset?.name.vi ?? 'Bình thủy tinh chịu nhiệt'} (Đá trong bình: ${totalIceG.toFixed(0)} g)! Đặt bình lên Đèn cồn đang cháy (100 °C) để quan sát đá tan từ từ và nước sôi lên.`,
              'success',
            );
          } else {
            labSoundEngine.play('glass-clink', { intensity: 0.7 });
            notify(
              'Khay nước đá đã hết (0g)! Chọn khay đá và bấm "❄️ Lấy đầy 100g đá" để tiếp tục cho đá vào bình.',
              'warning',
            );
          }
        } else if (draggedArch === 'thermometer') {
          labSoundEngine.play('probe-measure', {
            value: measuredTempC ?? 25,
          });
          notify(
            `Nhiệt kế rượu đo nhiệt độ tại ${targetAsset?.name.vi}: T = ${(measuredTempC ?? 25).toFixed(1)} °C`,
            'success',
          );
        } else {
          const updatedVessel = reconciledInstances.find(
            (i) => i.instanceId === targetInstanceId,
          );
          const nextV2 =
            updatedVessel?.instanceState.liquidLevelMl ??
            initialVolumeCm3 + specimenVolumeCm3;
          const baseV1 =
            updatedVessel?.instanceState.baseLiquidLevelMl ?? initialVolumeCm3;
          setFinalVolumeCm3(Number(nextV2.toFixed(1)));
          if (studentGuidedStep < 3) setStudentGuidedStep(3);
          const isOverflowCan =
            targetAsset?.geometry.proceduralArchetype === 'overflow-can';
          if (isOverflowCan && targetInstanceId) {
            window.setTimeout(() => {
              setScene((prev) => ({
                ...prev,
                instances: prev.instances.map((item) =>
                  item.instanceId === targetInstanceId
                    ? {
                        ...item,
                        instanceState: {
                          ...item.instanceState,
                          isValveOpen: false,
                        },
                      }
                    : item,
                ),
              }));
            }, 1350);
          }
          labSoundEngine.play(
            isOverflowCan ? 'water-overflow' : 'water-splash',
            {
              fillRatio: Math.min(1, nextV2 / 100),
              intensity: 1,
            },
          );
          notify(
            isOverflowCan
              ? `Đã thả ngập vật vào Bình tràn: ${specimenVolumeCm3.toFixed(1)} ml nước tràn qua vòi chảy sang Cốc thủy tinh!`
              : `Đã nhúng ngập vật rắn: Mực nước dâng lên V₂ = ${nextV2.toFixed(1)} cm³ (Tổng ΔV = +${(nextV2 - baseV1).toFixed(1)} cm³)`,
            'success',
          );
        }
      } else if (slot === 'dynamometer-hook') {
        const updatedDyn = reconciledInstances.find(
          (i) => i.instanceId === targetInstanceId,
        );
        const totalForceN = updatedDyn?.instanceState.springExtensionN ?? 0;
        labSoundEngine.play('spring-stretch', { value: totalForceN });
        notify(
          `Đã treo vật vào Lực kế lò xo: Tổng trọng lượng P = ${totalForceN.toFixed(2)} N`,
          'success',
        );
      } else if (slot === 'pascal-piston-1' || slot === 'pascal-piston-2') {
        const updatedPress = reconciledInstances.find(
          (i) => i.instanceId === targetInstanceId,
        );
        const m = computePascalSimulationMetrics(
          updatedPress?.instanceState.weightsPiston1 ?? 0,
          updatedPress?.instanceState.weightsPiston2 ?? 0,
        );
        labSoundEngine.play('dock-hover-snap', { intensity: 0.9 });
        notify(
          `⚖️ Đã đặt Quả nặng 100g (1.0N) lên ${
            slot === 'pascal-piston-1'
              ? 'Đĩa Pit-tông (1) nhánh lớn S₁ = 20 cm²'
              : 'Đĩa Pit-tông (2) nhánh nhỏ S₂ = 10 cm²'
          }: n₁=${m.n1} (${m.p1NCm2.toFixed(2)} N/cm²) | n₂=${m.n2} (${m.p2NCm2.toFixed(2)} N/cm²) · ${
            m.isBalanced
              ? '✓ CÂN BẰNG THỦY TĨNH (p₁ = p₂, Δh₁ = Δh₂ = 0 cm)'
              : `Δh₁ = ${m.deltaH1Cm > 0 ? '+' : ''}${m.deltaH1Cm.toFixed(1)} cm, Δh₂ = ${m.deltaH2Cm > 0 ? '+' : ''}${m.deltaH2Cm.toFixed(1)} cm`
          }`,
          m.isBalanced ? 'success' : 'info',
        );
      } else if (slot === 'caliper-jaws') {
        labSoundEngine.play('caliper-slide', { value: specimenWidthMm });
        notify(
          `Thước cặp đo kích thước ngoài của mẫu vật: d = ${specimenWidthMm.toFixed(1)} mm`,
          'success',
        );
      } else {
        labSoundEngine.play(
          draggedAsset?.materialCategory === 'borosilicate-glass'
            ? 'glass-clink'
            : 'wood-place',
          { intensity: 0.75 },
        );
      }
    },
    [
      scene.instances,
      assetsMap,
      selectedInstanceId,
      initialVolumeCm3,
      studentGuidedStep,
      reconcileCumulativeLabMeasurements,
      notify,
    ],
  );

  // Quick helper: automatically place specimen onto Electronic Balance pan (respects 360° balance rotation)
  const handleQuickWeighSpecimen = useCallback(() => {
    const specimen = scene.instances.find((i) => {
      const a = assetsMap.get(i.assetId);
      return (
        a?.geometry.proceduralArchetype === 'solid-cylinder' ||
        a?.geometry.proceduralArchetype === 'solid-block' ||
        a?.geometry.proceduralArchetype === 'solid-sphere'
      );
    });
    const balance = scene.instances.find(
      (i) =>
        assetsMap.get(i.assetId)?.geometry.proceduralArchetype ===
        'electronic-balance',
    );
    if (!specimen || !balance) return;

    const rotY = balance.transform.rotationRad[1] ?? 0;
    const targetPos: [number, number, number] = [
      Number((balance.transform.positionM[0] - Math.sin(rotY) * 0.02).toFixed(3)),
      0.068,
      Number((balance.transform.positionM[2] - Math.cos(rotY) * 0.02).toFixed(3)),
    ];
    setSelectedInstanceId(specimen.instanceId);
    handlePhysicalDockInteraction(
      specimen.instanceId,
      balance.instanceId,
      'balance-pan',
      targetPos,
    );
  }, [scene.instances, assetsMap, handlePhysicalDockInteraction]);

  // Quick helper: automatically submerge specimen into the 100 ml Graduated Cylinder
  const handleQuickSubmergeSpecimen = useCallback(() => {
    const specimen = scene.instances.find((i) => {
      const a = assetsMap.get(i.assetId);
      return (
        a?.geometry.proceduralArchetype === 'solid-cylinder' ||
        a?.geometry.proceduralArchetype === 'solid-block' ||
        a?.geometry.proceduralArchetype === 'solid-sphere'
      );
    });
    const cylinder = scene.instances.find(
      (i) =>
        assetsMap.get(i.assetId)?.geometry.proceduralArchetype ===
        'graduated-cylinder',
    );
    if (!specimen || !cylinder) return;

    const targetPos: [number, number, number] = [
      cylinder.transform.positionM[0],
      0.016,
      cylinder.transform.positionM[2],
    ];
    setSelectedInstanceId(specimen.instanceId);
    handlePhysicalDockInteraction(
      specimen.instanceId,
      cylinder.instanceId,
      'inside-vessel',
      targetPos,
    );
  }, [scene.instances, assetsMap, handlePhysicalDockInteraction]);

  // Guided Step Change Handler
  const handleChangeStudentGuidedStep = useCallback(
    (nextStep: StudentGuidedStepNumber) => {
      setStudentGuidedStep(nextStep);
      labSoundEngine.play('step-complete', 0.85);
      if (nextStep === 2) {
        handleQuickWeighSpecimen();
      } else if (nextStep === 3) {
        if (measuredMassG === null) {
          setMeasuredMassG(66.25);
        }
        handleQuickSubmergeSpecimen();
      } else if (nextStep === 4 || nextStep === 5) {
        if (measuredMassG === null) {
          setMeasuredMassG(66.25);
        }
        if (finalVolumeCm3 === null) {
          handleQuickSubmergeSpecimen();
        }
        notify(
          'Khối lượng riêng của vật rắn: ρ = m / V = 66.25 / 24.5 = 2.70 g/cm³ (Nhôm).',
          'success',
        );
      }
    },
    [
      handleQuickWeighSpecimen,
      handleQuickSubmergeSpecimen,
      measuredMassG,
      finalVolumeCm3,
      notify,
    ],
  );

  // Header 4-step bar click handler
  const handleChangeHeaderProgressStep = useCallback(
    (hStep: HeaderProgressStep) => {
      if (hStep === 1) handleChangeStudentGuidedStep(1);
      else if (hStep === 2) handleChangeStudentGuidedStep(2);
      else if (hStep === 3) handleChangeStudentGuidedStep(3);
      else handleChangeStudentGuidedStep(5);
    },
    [handleChangeStudentGuidedStep],
  );

  // Quick Physical Lab Action Handler (Triggered from the contextual 3D bottom bar)
  const handleQuickLabAction = useCallback(
    (action: QuickLabActionType, instanceId: string) => {
      const inst = scene.instances.find((i) => i.instanceId === instanceId);
      const asset = inst ? assetsMap.get(inst.assetId) : null;
      const balance = scene.instances.find(
        (i) =>
          assetsMap.get(i.assetId)?.geometry.proceduralArchetype ===
          'electronic-balance',
      );
      const cylinder = scene.instances.find(
        (i) =>
          assetsMap.get(i.assetId)?.geometry.proceduralArchetype ===
          'graduated-cylinder',
      );
      const overflowCan = scene.instances.find(
        (i) =>
          assetsMap.get(i.assetId)?.geometry.proceduralArchetype ===
          'overflow-can',
      );
      const beaker = scene.instances.find(
        (i) =>
          assetsMap.get(i.assetId)?.geometry.proceduralArchetype ===
          'beaker-250',
      );
      const specimen = scene.instances.find((i) => {
        const a = assetsMap.get(i.assetId);
        return (
          a?.geometry.proceduralArchetype === 'solid-cylinder' ||
          a?.geometry.proceduralArchetype === 'solid-block' ||
          a?.geometry.proceduralArchetype === 'solid-sphere' ||
          a?.geometry.proceduralArchetype === 'calibration-weight'
        );
      });

      if (action === 'tare-balance' && balance) {
        const currentRaw = balance.instanceState.measuredMassG ?? 0;
        setScene((prev) => ({
          ...prev,
          sceneRevision: prev.sceneRevision + 1,
          instances: prev.instances.map((item) =>
            item.instanceId === balance.instanceId
              ? {
                  ...item,
                  instanceState: {
                    ...item.instanceState,
                    tareOffsetG: currentRaw > 0 ? currentRaw : 0,
                  },
                }
              : item,
          ),
        }));
        labSoundEngine.play('scale-tare');
        notify(
          currentRaw > 0
            ? `Đã bấm TARE (Trừ bì ${currentRaw.toFixed(2)} g): Màn hình cân điện tử về 0.00 g.`
            : 'Màn hình cân điện tử đã được đặt chuẩn về 0.00 g.',
          'info',
        );
        return;
      }

      if (action === 'clear-balance-pan' && balance) {
        let clearedCount = 0;
        setScene((prev) => {
          const draft = prev.instances.map((item, idx) => {
            if (
              item.instanceState.attachedToInstanceId === balance.instanceId &&
              item.instanceState.attachmentSlot === 'balance-pan'
            ) {
              clearedCount++;
              const benchX = Number(
                Math.min(1.15, balance.transform.positionM[0] + 0.16 + (idx % 3) * 0.06).toFixed(3),
              );
              const benchZ = Number(
                Math.min(0.325, balance.transform.positionM[2] + 0.04 + (clearedCount - 1) * 0.06).toFixed(3),
              );
              return {
                ...item,
                transform: {
                  ...item.transform,
                  positionM: [benchX, 0, benchZ] as [number, number, number],
                },
                instanceState: {
                  ...item.instanceState,
                  attachedToInstanceId: null,
                  attachmentSlot: 'bench' as const,
                },
              };
            }
            return item;
          });
          return {
            ...prev,
            sceneRevision: prev.sceneRevision + 1,
            instances: reconcileCumulativeLabMeasurements(draft),
          };
        });
        labSoundEngine.play('wood-place', { intensity: 0.9 });
        notify(
          `Đã dọn các vật khỏi đĩa Cân điện tử về mặt bàn gỗ (Màn hình cân về 0.00 g).`,
          'info',
        );
        return;
      }

      if (action === 'weigh-selected') {
        // When clicking "Đặt thêm vật mẫu (+m)" from the balance, pick the next unweighed specimen/weight on the bench!
        const nextUnweighedSpecimen = scene.instances.find((i) => {
          if (
            !i.visible ||
            (balance &&
              i.instanceState.attachedToInstanceId === balance.instanceId &&
              i.instanceState.attachmentSlot === 'balance-pan')
          ) {
            return false;
          }
          const a = assetsMap.get(i.assetId);
          const arch = a?.geometry.proceduralArchetype;
          return (
            a?.kind === 'specimen' ||
            arch === 'solid-cylinder' ||
            arch === 'solid-block' ||
            arch === 'solid-sphere' ||
            arch === 'hollow-cylinder' ||
            arch === 'calibration-weight'
          );
        });

        const itemToWeigh =
          asset?.geometry.proceduralArchetype === 'electronic-balance'
            ? nextUnweighedSpecimen ?? specimen
            : inst ?? nextUnweighedSpecimen ?? specimen;
        if (!itemToWeigh || !balance) return;
        const rotY = balance.transform.rotationRad[1] ?? 0;
        const targetPos: [number, number, number] = [
          Number((balance.transform.positionM[0] - Math.sin(rotY) * 0.02).toFixed(3)),
          0.068,
          Number((balance.transform.positionM[2] - Math.cos(rotY) * 0.02).toFixed(3)),
        ];
        setSelectedInstanceId(itemToWeigh.instanceId);
        handlePhysicalDockInteraction(
          itemToWeigh.instanceId,
          balance.instanceId,
          'balance-pan',
          targetPos,
        );
        return;
      }

      if (action === 'submerge-cylinder') {
        const nextUnsubmergedSpecimen = scene.instances.find((i) => {
          if (
            !i.visible ||
            (cylinder &&
              i.instanceState.attachedToInstanceId === cylinder.instanceId &&
              i.instanceState.attachmentSlot === 'inside-vessel')
          ) {
            return false;
          }
          const a = assetsMap.get(i.assetId);
          const arch = a?.geometry.proceduralArchetype;
          return (
            a?.kind === 'specimen' ||
            arch === 'solid-cylinder' ||
            arch === 'solid-block' ||
            arch === 'solid-sphere' ||
            arch === 'hollow-cylinder' ||
            arch === 'calibration-weight'
          );
        });
        const itemToSubmerge =
          asset?.geometry.proceduralArchetype === 'graduated-cylinder'
            ? nextUnsubmergedSpecimen ?? specimen
            : inst ?? nextUnsubmergedSpecimen ?? specimen;
        if (!itemToSubmerge || !cylinder) return;
        const targetPos: [number, number, number] = [
          cylinder.transform.positionM[0],
          0.016,
          cylinder.transform.positionM[2],
        ];
        setSelectedInstanceId(itemToSubmerge.instanceId);
        handlePhysicalDockInteraction(
          itemToSubmerge.instanceId,
          cylinder.instanceId,
          'inside-vessel',
          targetPos,
        );
        return;
      }

      if (action === 'submerge-overflow') {
        const itemToSubmerge =
          asset?.geometry.proceduralArchetype === 'overflow-can'
            ? specimen
            : inst ?? specimen;
        if (!itemToSubmerge || !overflowCan) return;
        const targetPos: [number, number, number] = [
          overflowCan.transform.positionM[0],
          0.016,
          overflowCan.transform.positionM[2],
        ];
        setSelectedInstanceId(itemToSubmerge.instanceId);
        handlePhysicalDockInteraction(
          itemToSubmerge.instanceId,
          overflowCan.instanceId,
          'inside-vessel',
          targetPos,
        );
        return;
      }

      if (action === 'pour-to-cylinder' && inst && cylinder) {
        const settlePos: [number, number, number] = [
          Number(Math.max(-1.15, cylinder.transform.positionM[0] - 0.105).toFixed(3)),
          0,
          Number(Math.min(0.325, cylinder.transform.positionM[2] + 0.025).toFixed(3)),
        ];
        handlePhysicalDockInteraction(
          inst.instanceId,
          cylinder.instanceId,
          'pour-liquid',
          settlePos,
        );
        return;
      }

      if (action === 'pour-to-beaker' && inst && beaker) {
        const settlePos: [number, number, number] = [
          Number(Math.max(-1.15, beaker.transform.positionM[0] - 0.105).toFixed(3)),
          0,
          Number(Math.min(0.325, beaker.transform.positionM[2] + 0.025).toFixed(3)),
        ];
        handlePhysicalDockInteraction(
          inst.instanceId,
          beaker.instanceId,
          'pour-liquid',
          settlePos,
        );
        return;
      }

      if (action === 'pour-to-overflow' && inst && overflowCan) {
        const settlePos: [number, number, number] = [
          Number(Math.max(-1.15, overflowCan.transform.positionM[0] - 0.115).toFixed(3)),
          0,
          Number(Math.min(0.325, overflowCan.transform.positionM[2] + 0.025).toFixed(3)),
        ];
        handlePhysicalDockInteraction(
          inst.instanceId,
          overflowCan.instanceId,
          'pour-liquid',
          settlePos,
        );
        return;
      }

      if (action === 'dock-to-dispenser' && inst) {
        const dispenser = scene.instances.find(
          (i) =>
            i.visible &&
            assetsMap.get(i.assetId)?.geometry.proceduralArchetype ===
              'water-dispenser',
        );
        if (dispenser) {
          const dispRotY = dispenser.transform.rotationRad[1] ?? 0;
          const spoutPos: [number, number, number] = [
            Number(
              (
                dispenser.transform.positionM[0] +
                Math.cos(dispRotY) * 0.095
              ).toFixed(3),
            ),
            0,
            Number(
              (
                dispenser.transform.positionM[2] -
                Math.sin(dispRotY) * 0.095
              ).toFixed(3),
            ),
          ];
          handlePhysicalDockInteraction(
            inst.instanceId,
            dispenser.instanceId,
            'dispenser-outlet',
            spoutPos,
          );
        }
        return;
      }

      if (action === 'refill-water' && inst && asset) {
        const arch = asset.geometry.proceduralArchetype;
        const cap = asset.scientificProperties.capacity?.value ?? 100;
        const nextMl =
          arch === 'graduated-cylinder'
            ? 50
            : arch === 'overflow-can'
              ? 210
              : Math.min(cap, (inst.instanceState.liquidLevelMl ?? 40) + 25);
        setScene((prev) => {
          const draft = prev.instances.map((item) =>
            item.instanceId === inst.instanceId
              ? {
                  ...item,
                  instanceState: {
                    ...item.instanceState,
                    liquidLevelMl: nextMl,
                    baseLiquidLevelMl: nextMl,
                  },
                }
              : item,
          );
          return {
            ...prev,
            sceneRevision: prev.sceneRevision + 1,
            instances: reconcileCumulativeLabMeasurements(draft),
          };
        });
        labSoundEngine.play('water-pour', {
          fillRatio: Math.min(1, nextMl / Math.max(10, cap)),
        });
        notify(
          `Đã cập nhật lượng nước trong ${asset.name.vi}: ${nextMl.toFixed(1)} ml.`,
          'success',
        );
        return;
      }

      if (action === 'toggle-laser' && inst && asset) {
        const nextOn = inst.instanceState.isPoweredOn === false;
        setScene((prev) => ({
          ...prev,
          sceneRevision: prev.sceneRevision + 1,
          instances: prev.instances.map((item) =>
            item.instanceId === inst.instanceId
              ? {
                  ...item,
                  instanceState: {
                    ...item.instanceState,
                    isPoweredOn: nextOn,
                  },
                }
              : item,
          ),
        }));
        labSoundEngine.play('laser-switch', { value: nextOn ? 1 : 0 });
        notify(
          nextOn
            ? `Đã bật chùm tia sáng trên ${asset.name.vi} (Quan sát đường truyền tia sáng Chương II SGK KHTN 9).`
            : `Đã tắt nguồn sáng trên ${asset.name.vi}.`,
          'info',
        );
        return;
      }

      if (
        (action === 'refraction-angle-20' ||
          action === 'refraction-angle-40' ||
          action === 'refraction-angle-60') &&
        inst
      ) {
        const angle =
          action === 'refraction-angle-20'
            ? 20
            : action === 'refraction-angle-40'
              ? 40
              : 60;
        setScene((prev) => ({
          ...prev,
          sceneRevision: prev.sceneRevision + 1,
          instances: prev.instances.map((item) =>
            item.instanceId === inst.instanceId
              ? {
                  ...item,
                  instanceState: {
                    ...item.instanceState,
                    incidentAngleDeg: angle,
                  },
                }
              : item,
          ),
        }));
        labSoundEngine.play('optics-angle', { value: angle });
        notify(
          angle >= 42
            ? `Góc tới i = ${angle}° > i_th (41.8°): Xảy ra hiện tượng PHẢN XẠ TOÀN PHẦN (Bài 6 SGK KHTN 9)!`
            : `Góc tới i = ${angle}°: Tia sáng truyền từ bản bán trụ ra không khí bị KHÚC XẠ (Bài 5 SGK KHTN 9).`,
          angle >= 42 ? 'warning' : 'success',
        );
        return;
      }

      if (
        (action === 'induce-current-pos' ||
          action === 'induce-current-neg' ||
          action === 'induce-current-zero') &&
        inst
      ) {
        const defl =
          action === 'induce-current-pos'
            ? 0.75
            : action === 'induce-current-neg'
              ? -0.75
              : 0;
        setScene((prev) => ({
          ...prev,
          sceneRevision: prev.sceneRevision + 1,
          instances: prev.instances.map((item) => {
            const itemArch = assetsMap.get(item.assetId)?.geometry
              .proceduralArchetype;
            if (
              item.instanceId === inst.instanceId ||
              itemArch === 'galvanometer' ||
              itemArch === 'induction-coil-led'
            ) {
              return {
                ...item,
                instanceState: {
                  ...item.instanceState,
                  galvanometerDeflection: defl,
                },
              };
            }
            return item;
          }),
        }));
        labSoundEngine.play('electric-induction', { value: defl });
        notify(
          defl > 0
            ? 'Đưa nam châm lại gần cuộn dây: Số đường sức từ tăng → Xuất hiện dòng điện cảm ứng làm kim điện kế lệch phải / Đèn LED 1 đỏ sáng (Bài 14 SGK KHTN 9)!'
            : defl < 0
              ? 'Kéo nam châm ra xa cuộn dây: Dòng điện cảm ứng đổi chiều làm kim điện kế lệch trái / Đèn LED 2 xanh sáng (Bài 14 SGK KHTN 9)!'
              : 'Nam châm đứng yên: Số đường sức từ xuyên qua tiết diện cuộn dây không đổi → Không có dòng điện cảm ứng (I = 0).',
          defl === 0 ? 'info' : 'success',
        );
        return;
      }

      if (
        (action === 'multimeter-mode-v' ||
          action === 'multimeter-mode-a' ||
          action === 'multimeter-mode-ohm') &&
        inst
      ) {
        const mode =
          action === 'multimeter-mode-v'
            ? 'V'
            : action === 'multimeter-mode-a'
              ? 'A'
              : 'Ω';
        const val = mode === 'V' ? 12.0 : mode === 'A' ? 0.75 : 16.0;
        setScene((prev) => ({
          ...prev,
          sceneRevision: prev.sceneRevision + 1,
          instances: prev.instances.map((item) =>
            item.instanceId === inst.instanceId
              ? {
                  ...item,
                  instanceState: {
                    ...item.instanceState,
                    multimeterMode: mode,
                    multimeterValue: val,
                  },
                }
              : item,
          ),
        }));
        labSoundEngine.play('mechanical-click', { value: val });
        notify(
          mode === 'V'
            ? 'Đồng hồ đo điện đa năng (Thang DCV): Hiệu điện thế U = 12.00 V (Bài 11 SGK KHTN 9).'
            : mode === 'A'
              ? 'Đồng hồ đo điện đa năng (Thang DCA): Cường độ dòng điện I = 0.75 A (Bài 11 SGK KHTN 9).'
              : 'Đồng hồ đo điện đa năng (Thang Ω): Điện trở dây dẫn R = U / I = 16.0 Ω.',
          'success',
        );
        return;
      }

      if (action === 'toggle-burner-flame' && inst && asset) {
        const nextHeat = inst.instanceState.isHeating === false;
        const isAlcoholBurner =
          asset.geometry.proceduralArchetype === 'alcohol-burner';
        setScene((prev) => ({
          ...prev,
          sceneRevision: prev.sceneRevision + 1,
          instances: prev.instances.map((item) =>
            item.instanceId === inst.instanceId
              ? {
                  ...item,
                  instanceState: {
                    ...item.instanceState,
                    isHeating: nextHeat,
                    ...(isAlcoholBurner
                      ? { temperatureC: nextHeat ? 100.0 : 0.0 }
                      : {}),
                  },
                }
              : item,
          ),
        }));
        labSoundEngine.play(nextHeat ? 'burner-ignite' : 'burner-extinguish');
        notify(
          nextHeat
            ? isAlcoholBurner
              ? '🔥 Đã châm lửa Đèn cồn (Nhiệt độ ngọn lửa: 100.0 °C)! Đặt Bình thủy tinh chịu nhiệt lên trên để đun tan đá và đun sôi nước.'
              : `Đã châm ngọn lửa đun nóng trên ${asset.name.vi}.`
            : `Đã đậy nắp dập tắt ngọn lửa đèn cồn an toàn trên ${asset.name.vi}.`,
          nextHeat ? 'warning' : 'info',
        );
        return;
      }

      if (action === 'pour-ice-to-vessel' && inst) {
        const trayIceG = inst.instanceState.iceMassG ?? 100;
        if (trayIceG <= 0.5) {
          notify(
            'Khay nước đá đang trống (0g)! Bấm "❄️ Lấy đầy 100g đá" để lấy thêm đá viên.',
            'warning',
          );
          return;
        }
        const preferredVessel =
          scene.instances.find(
            (item) =>
              item.visible &&
              assetsMap.get(item.assetId)?.geometry.proceduralArchetype ===
                'thermal-heating-vessel',
          ) ??
          scene.instances.find((item) => {
            if (!item.visible) return false;
            const a = assetsMap.get(item.assetId)?.geometry.proceduralArchetype;
            return (
              a === 'beaker-250' ||
              a === 'beaker-bomex-100' ||
              a === 'erlenmeyer-flask' ||
              a === 'distillation-flask' ||
              a === 'porcelain-dish'
            );
          });
        if (!preferredVessel) {
          notify(
            'Chưa có Bình thủy tinh chịu nhiệt trên bàn! Hãy lấy Bình thủy tinh chịu nhiệt ra bàn trước để cho đá vào.',
            'warning',
          );
          return;
        }
        const targetAsset = assetsMap.get(preferredVessel.assetId);
        const transferG = Math.min(trayIceG, 100);
        setScene((prev) => ({
          ...prev,
          sceneRevision: prev.sceneRevision + 1,
          updatedAt: new Date().toISOString(),
          instances: prev.instances.map((item) => {
            if (item.instanceId === inst.instanceId) {
              return {
                ...item,
                instanceState: {
                  ...item.instanceState,
                  iceMassG: Number(Math.max(0, trayIceG - transferG).toFixed(1)),
                },
              };
            }
            if (item.instanceId === preferredVessel.instanceId) {
              const prevIceG = item.instanceState.iceMassG ?? 0;
              const prevLiqMl = item.instanceState.liquidLevelMl ?? 0;
              const prevTempC = item.instanceState.temperatureC ?? 25.0;
              const nextTempC =
                prevLiqMl > 5
                  ? Number(Math.max(4.0, prevTempC - 3.0).toFixed(1))
                  : -4.0;
              return {
                ...item,
                instanceState: {
                  ...item.instanceState,
                  iceMassG: Number((prevIceG + transferG).toFixed(1)),
                  temperatureC: nextTempC,
                  thermalPhase: (nextTempC < 0 ? 'subzero-ice' : 'melting-0c') as
                    | 'subzero-ice'
                    | 'melting-0c',
                },
              };
            }
            return item;
          }),
        }));
        setSelectedInstanceId(preferredVessel.instanceId);
        labSoundEngine.play('dock-hover-snap', 0.95);
        notify(
          `🧊 Đã cho ${transferG.toFixed(0)}g Nước đá viên (-4.0 °C) vào ${targetAsset?.name.vi ?? 'Bình thủy tinh chịu nhiệt'}!`,
          'success',
        );
        return;
      }

      if (action === 'refill-ice-tray' && inst) {
        setScene((prev) => ({
          ...prev,
          sceneRevision: prev.sceneRevision + 1,
          updatedAt: new Date().toISOString(),
          instances: prev.instances.map((item) =>
            item.instanceId === inst.instanceId
              ? {
                  ...item,
                  instanceState: {
                    ...item.instanceState,
                    iceMassG: 100,
                    temperatureC: -5.0,
                  },
                }
              : item,
          ),
        }));
        labSoundEngine.play('dock-hover-snap', 0.8);
        notify('❄️ Đã lấy đầy 100g Nước đá viên (-5.0 °C) vào khay!', 'info');
        return;
      }

      if (
        (action === 'microscope-10x' ||
          action === 'microscope-40x' ||
          action === 'microscope-100x') &&
        inst
      ) {
        const mag =
          action === 'microscope-10x'
            ? 10
            : action === 'microscope-40x'
              ? 40
              : 100;
        setScene((prev) => ({
          ...prev,
          sceneRevision: prev.sceneRevision + 1,
          instances: prev.instances.map((item) =>
            item.instanceId === inst.instanceId
              ? {
                  ...item,
                  instanceState: {
                    ...item.instanceState,
                    magnification: mag,
                  },
                }
              : item,
          ),
        }));
        labSoundEngine.play('mechanical-click', { value: mag });
        notify(
          `Đã xoay mâm vật kính kính hiển vi sang độ phóng đại ${mag}x để quan sát tiêu bản Nhiễm sắc thể (Bài 42 SGK KHTN 9).`,
          'success',
        );
        return;
      }

      if (
        (action === 'temp-room-25' ||
          action === 'temp-warm-78' ||
          action === 'temp-boil-100') &&
        inst
      ) {
        const tempC =
          action === 'temp-room-25'
            ? 25.0
            : action === 'temp-warm-78'
              ? 78.5
              : 100.0;
        setScene((prev) => ({
          ...prev,
          sceneRevision: prev.sceneRevision + 1,
          instances: prev.instances.map((item) =>
            item.instanceId === inst.instanceId
              ? {
                  ...item,
                  instanceState: {
                    ...item.instanceState,
                    temperatureC: tempC,
                  },
                }
              : item,
          ),
        }));
        labSoundEngine.play('probe-measure', { value: tempC });
        notify(
          `Nhiệt kế rượu hiển thị: T = ${tempC.toFixed(1)} °C (Cột chất lỏng dâng theo nhiệt độ thực tế).`,
          'success',
        );
        return;
      }

      if (action === 'dynamometer-weigh' && inst && specimen) {
        const targetPos: [number, number, number] = [
          inst.transform.positionM[0],
          0.025,
          inst.transform.positionM[2] + 0.018,
        ];
        handlePhysicalDockInteraction(
          specimen.instanceId,
          inst.instanceId,
          'dynamometer-hook',
          targetPos,
        );
        return;
      }

      if (action === 'dynamometer-zero' && inst) {
        setScene((prev) => ({
          ...prev,
          sceneRevision: prev.sceneRevision + 1,
          instances: prev.instances.map((item) =>
            item.instanceId === inst.instanceId
              ? {
                  ...item,
                  instanceState: {
                    ...item.instanceState,
                    springExtensionN: 0,
                  },
                }
              : item,
          ),
        }));
        labSoundEngine.play('spring-stretch', { value: 0 });
        notify('Đã hiệu chỉnh vạch 0 cho Lực kế lò xo (F = 0.00 N).', 'info');
        return;
      }

      if (action === 'caliper-measure' && inst && specimen) {
        const targetPos: [number, number, number] = [
          inst.transform.positionM[0] - 0.045,
          0.008,
          inst.transform.positionM[2] + 0.024,
        ];
        handlePhysicalDockInteraction(
          specimen.instanceId,
          inst.instanceId,
          'caliper-jaws',
          targetPos,
        );
        return;
      }

      if (action === 'caliper-zero' && inst) {
        setScene((prev) => ({
          ...prev,
          sceneRevision: prev.sceneRevision + 1,
          instances: prev.instances.map((item) =>
            item.instanceId === inst.instanceId
              ? {
                  ...item,
                  instanceState: {
                    ...item.instanceState,
                    jawOpeningMm: 0,
                  },
                }
              : item,
          ),
        }));
        labSoundEngine.play('caliper-slide', { value: 0 });
        notify('Đã đóng hàm kẹp Thước cặp về vạch 0.0 mm.', 'info');
        return;
      }

      if (action === 'funnel-extract' && inst) {
        const curMl = inst.instanceState.liquidLevelMl ?? 125;
        const extracted = Math.min(30, Math.max(0, curMl - 20));
        const nextMl = Number((curMl - extracted).toFixed(1));
        setScene((prev) => ({
          ...prev,
          sceneRevision: prev.sceneRevision + 1,
          instances: prev.instances.map((item) => {
            if (item.instanceId === inst.instanceId) {
              return {
                ...item,
                instanceState: {
                  ...item.instanceState,
                  liquidLevelMl: nextMl,
                  baseLiquidLevelMl: nextMl,
                  isValveOpen: extracted > 0,
                },
              };
            }
            if (beaker && item.instanceId === beaker.instanceId && extracted > 0) {
              const bMl = (item.instanceState.liquidLevelMl ?? 40) + extracted;
              const nextBeakerPos: [number, number, number] =
                item.instanceState.attachmentSlot === 'balance-pan'
                  ? item.transform.positionM
                  : [
                      Number(inst.transform.positionM[0].toFixed(3)),
                      0,
                      Number(inst.transform.positionM[2].toFixed(3)),
                    ];
              return {
                ...item,
                transform: {
                  ...item.transform,
                  positionM: nextBeakerPos,
                },
                instanceState: {
                  ...item.instanceState,
                  liquidLevelMl: bMl,
                  baseLiquidLevelMl: bMl,
                },
              };
            }
            return item;
          }),
        }));
        if (extracted > 0) {
          const funnelId = inst.instanceId;
          window.setTimeout(() => {
            setScene((prev) => ({
              ...prev,
              instances: prev.instances.map((item) =>
                item.instanceId === funnelId
                  ? {
                      ...item,
                      instanceState: {
                        ...item.instanceState,
                        isValveOpen: false,
                      },
                    }
                  : item,
              ),
            }));
          }, 1250);
        }
        labSoundEngine.play('funnel-valve', {
          fillRatio: Math.min(1, nextMl / 150),
        });
        notify(
          extracted > 0
            ? `Đã mở khóa Phễu chiết tách ${extracted.toFixed(0)} ml lớp chất lỏng dưới sang Cốc thủy tinh.`
            : 'Đã chiết hết lớp chất lỏng phía dưới trong Phễu chiết.',
          'success',
        );
        return;
      }

      if (action === 'rotate-90' && inst) {
        const nextRotY = Number(
          ((inst.transform.rotationRad[1] ?? 0) + Math.PI / 2).toFixed(3),
        );
        handleUpdateInstanceTransform(
          inst.instanceId,
          inst.transform.positionM,
          [inst.transform.rotationRad[0], nextRotY, inst.transform.rotationRad[2]],
        );
        labSoundEngine.play('rotate-object', { intensity: 0.85 });
        notify(
          `Đã xoay "${inst.customLabel || asset?.name.vi}" 90° — Màn hình/vạch chia hiển thị đa hướng 360°.`,
          'info',
        );
        return;
      }

      if (action === 'open-sgk-profile' && asset) {
        labSoundEngine.play('ui-toggle', 0.8);
        setDetailModalEditMode(false);
        setStudentDetailModalAsset(asset);
        return;
      }

      if (action === 'edit-product-info' && asset) {
        labSoundEngine.play('ui-toggle', 0.85);
        setDetailModalEditMode(true);
        setStudentDetailModalAsset(asset);
        return;
      }

      if (action === 'open-html-updater' && asset) {
        labSoundEngine.play('ui-toggle', 0.85);
        setHtmlUpdaterTargetAsset(asset);
        setShowHtmlModuleImporterModal(true);
        return;
      }

      if (action === 'delete-instance') {
        const target = scene.instances.find((i) => i.instanceId === instanceId);
        setScene((prev) => {
          const remaining = prev.instances
            .filter((i) => i.instanceId !== instanceId)
            .map((item) =>
              item.instanceState.attachedToInstanceId === instanceId
                ? {
                    ...item,
                    transform: {
                      ...item.transform,
                      positionM: [
                        item.transform.positionM[0],
                        0,
                        item.transform.positionM[2],
                      ] as [number, number, number],
                    },
                    instanceState: {
                      ...item.instanceState,
                      attachedToInstanceId: null,
                      attachmentSlot: 'bench' as const,
                    },
                  }
                : item,
            );
          return {
            ...prev,
            sceneRevision: prev.sceneRevision + 1,
            instances: reconcileCumulativeLabMeasurements(remaining),
          };
        });
        if (selectedInstanceId === instanceId) {
          setSelectedInstanceId(null);
        }
        labSoundEngine.play('wood-place', { intensity: 0.85 });
        if (target) {
          notify(
            `Đã cất "${target.customLabel || asset?.name.vi || target.assetId}" vào Tủ đựng đồ trên bàn (sát trục X).`,
            'info',
          );
        }
        return;
      }

      if (action === 'permanently-delete-asset' && asset) {
        labSoundEngine.play('ui-toggle', 0.85);
        setPendingDeleteAsset(asset);
        return;
      }
    },
    [
      scene.instances,
      assetsMap,
      selectedInstanceId,
      handlePhysicalDockInteraction,
      handleUpdateInstanceTransform,
      reconcileCumulativeLabMeasurements,
      notify,
    ],
  );

  // Volumetric Water Dispenser Valve Handler (Mở van lấy nước chính xác theo số ml nhập vào)
  const handleDispenseWaterVolume = useCallback(
    (
      targetInstanceId: string,
      volumeMl: number,
      mode: 'add' | 'set' | 'refill-dispenser',
    ) => {
      if (mode === 'refill-dispenser') {
        setScene((prev) => ({
          ...prev,
          sceneRevision: prev.sceneRevision + 1,
          instances: prev.instances.map((inst) =>
            inst.instanceId === targetInstanceId
              ? {
                  ...inst,
                  instanceState: {
                    ...inst.instanceState,
                    baseLiquidLevelMl: 1000,
                    liquidLevelMl: 1000,
                    isValveOpen: false,
                  },
                }
              : inst,
          ),
        }));
        notify(
          'Đã châm đầy 1000.0 ml nước cất vào Bình cấp nước định lượng.',
          'success',
        );
        return;
      }

      const targetInst = scene.instances.find(
        (i) => i.instanceId === targetInstanceId,
      );
      if (!targetInst) return;
      const targetAsset = assetsMap.get(targetInst.assetId);
      const targetArch = targetAsset?.geometry.proceduralArchetype;
      const maxCap =
        targetArch === 'overflow-can'
          ? 210
          : targetAsset?.scientificProperties.capacity?.value ?? 100;
      const curBaseMl =
        targetInst.instanceState.baseLiquidLevelMl ??
        targetInst.instanceState.liquidLevelMl ??
        (targetArch === 'beaker-bomex-100' ||
        targetArch === 'thermal-heating-vessel'
          ? 0
          : maxCap * 0.5);

      const dispenserInst = scene.instances.find(
        (i) =>
          i.visible &&
          assetsMap.get(i.assetId)?.geometry.proceduralArchetype ===
            'water-dispenser',
      );
      const availDispenserMl =
        dispenserInst?.instanceState.liquidLevelMl ?? 850;

      const desiredBaseMl =
        mode === 'set'
          ? Math.max(0, Math.min(maxCap, volumeMl))
          : Math.max(0, Math.min(maxCap, curBaseMl + volumeMl));
      const deltaAddedMl = Math.max(0, desiredBaseMl - curBaseMl);

      if (mode === 'add' && availDispenserMl <= 0.5) {
        notify(
          'Bình cấp nước đã cạn! Hãy nhấn "Đổ đầy 1L" để tiếp thêm nước cất.',
          'warning',
        );
        return;
      }

      const actualAddedMl =
        mode === 'add' ? Math.min(deltaAddedMl, availDispenserMl) : 0;
      const finalBaseMl =
        mode === 'add'
          ? Number((curBaseMl + actualAddedMl).toFixed(1))
          : Number(desiredBaseMl.toFixed(1));

      if (targetArch === 'graduated-cylinder') {
        setInitialVolumeCm3(finalBaseMl);
      }

      setScene((prev) => {
        const draft = prev.instances.map((inst) => {
          if (dispenserInst && inst.instanceId === dispenserInst.instanceId) {
            const nextDispMl = Math.max(
              0,
              Number((availDispenserMl - actualAddedMl).toFixed(1)),
            );
            return {
              ...inst,
              instanceState: {
                ...inst.instanceState,
                baseLiquidLevelMl: nextDispMl,
                liquidLevelMl: nextDispMl,
                isValveOpen: true,
              },
            };
          }
          if (inst.instanceId === targetInstanceId) {
            const dispRotY = dispenserInst?.transform.rotationRad[1] ?? 0;
            const nextPosM: [number, number, number] =
              dispenserInst &&
              inst.instanceState.attachmentSlot !== 'balance-pan'
                ? [
                    Number(
                      Math.min(
                        1.15,
                        Math.max(
                          -1.15,
                          dispenserInst.transform.positionM[0] +
                            Math.cos(dispRotY) * 0.095,
                        ),
                      ).toFixed(3),
                    ),
                    0,
                    Number(
                      Math.min(
                        0.325,
                        Math.max(
                          -0.325,
                          dispenserInst.transform.positionM[2] -
                            Math.sin(dispRotY) * 0.095,
                        ),
                      ).toFixed(3),
                    ),
                  ]
                : inst.transform.positionM;
            return {
              ...inst,
              transform: {
                ...inst.transform,
                positionM: nextPosM,
              },
              instanceState: {
                ...inst.instanceState,
                baseLiquidLevelMl: finalBaseMl,
                liquidLevelMl: finalBaseMl,
                overflowingVolumeMl: 0,
                attachedToInstanceId:
                  dispenserInst &&
                  inst.instanceState.attachmentSlot !== 'balance-pan'
                    ? dispenserInst.instanceId
                    : inst.instanceState.attachedToInstanceId,
                attachmentSlot:
                  dispenserInst &&
                  inst.instanceState.attachmentSlot !== 'balance-pan'
                    ? ('dispenser-outlet' as const)
                    : inst.instanceState.attachmentSlot,
              },
            };
          }
          return inst;
        });
        return {
          ...prev,
          sceneRevision: prev.sceneRevision + 1,
          instances: reconcileCumulativeLabMeasurements(draft),
        };
      });

      // Tự động đóng van 3D sau khi xả xong (1.1 giây)
      if (dispenserInst) {
        window.setTimeout(() => {
          setScene((prev) => ({
            ...prev,
            instances: prev.instances.map((inst) =>
              inst.instanceId === dispenserInst.instanceId
                ? {
                    ...inst,
                    instanceState: {
                      ...inst.instanceState,
                      isValveOpen: false,
                    },
                  }
                : inst,
            ),
          }));
        }, 1100);
      }

      labSoundEngine.play('water-pour', {
        fillRatio: Math.min(1, finalBaseMl / Math.max(10, maxCap)),
        intensity: 1,
      });

      notify(
        mode === 'add'
          ? `Đã mở van xả +${actualAddedMl.toFixed(1)} ml nước vào "${targetInst.customLabel || targetAsset?.name.vi}" → Mực nước hiện tại: ${finalBaseMl.toFixed(1)} ml.`
          : `Đã điều chỉnh chuẩn lượng nước trong "${targetInst.customLabel || targetAsset?.name.vi}" = ${finalBaseMl.toFixed(1)} ml.`,
        'success',
      );
    },
    [
      scene.instances,
      assetsMap,
      reconcileCumulativeLabMeasurements,
      notify,
    ],
  );

  // Real-time Tilt-Based Pouring Simulation Handler (Cập nhật thể tích thời gian thực khi nghiêng bình >= 45°)
  const handleRealtimeTiltPour = useCallback(
    (
      sourceInstanceId: string,
      targetInstanceId: string | null,
      deltaVolumeMl: number,
      currentTiltDeg: number,
      isFinalSummary = false,
      totalSessionPouredMl = 0,
    ) => {
      if (deltaVolumeMl <= 0.001 && !isFinalSummary) return;

      const srcInst = scene.instances.find(
        (i) => i.instanceId === sourceInstanceId,
      );
      if (!srcInst) return;
      const srcAsset = assetsMap.get(srcInst.assetId);
      const dstInst = targetInstanceId
        ? scene.instances.find((i) => i.instanceId === targetInstanceId)
        : null;
      const dstAsset = dstInst ? assetsMap.get(dstInst.assetId) : null;
      const dstArch = dstAsset?.geometry.proceduralArchetype;
      const dstCap =
        dstArch === 'overflow-can'
          ? 210
          : dstAsset?.scientificProperties.capacity?.value ?? 100;

      if (deltaVolumeMl > 0.001) {
        setScene((prev) => {
          const curSrc = prev.instances.find(
            (i) => i.instanceId === sourceInstanceId,
          );
          if (!curSrc) return prev;
          const curSrcAsset = assetsMap.get(curSrc.assetId);
          const curSrcArch = curSrcAsset?.geometry.proceduralArchetype;
          const curSrcCap =
            curSrcArch === 'overflow-can'
              ? 210
              : curSrcArch === 'reagent-bottle-naoh-400' ||
                  curSrcArch === 'reagent-bottle-agno3-400'
                ? 400
                : curSrcArch === 'water-dispenser'
                  ? 1000
                  : curSrcAsset?.scientificProperties.capacity?.value ?? 100;
          const defaultSrcAvail =
            curSrcArch === 'beaker-bomex-100' ||
            curSrcArch === 'thermal-heating-vessel'
              ? 0
              : curSrcArch === 'reagent-bottle-naoh-400' ||
                  curSrcArch === 'reagent-bottle-agno3-400'
                ? 300
                : curSrcArch === 'water-dispenser'
                  ? 850
                  : curSrcArch === 'overflow-can'
                    ? 210
                    : curSrcArch === 'graduated-cylinder'
                      ? 50
                      : curSrcArch === 'beaker-250'
                        ? 40
                        : curSrcCap * 0.5;
          const srcAvail =
            curSrc.instanceState.baseLiquidLevelMl ??
            curSrc.instanceState.liquidLevelMl ??
            defaultSrcAvail;
          const actualDrain = Math.max(0, Math.min(srcAvail, deltaVolumeMl));
          if (actualDrain <= 0.0005) return prev;

          const nextSrcMl = Number(Math.max(0, srcAvail - actualDrain).toFixed(2));

          const draft = prev.instances.map((inst) => {
            if (inst.instanceId === sourceInstanceId) {
              return {
                ...inst,
                instanceState: {
                  ...inst.instanceState,
                  baseLiquidLevelMl: nextSrcMl,
                  liquidLevelMl: nextSrcMl,
                },
              };
            }
            if (targetInstanceId && inst.instanceId === targetInstanceId) {
              const curDstBase =
                inst.instanceState.baseLiquidLevelMl ??
                inst.instanceState.liquidLevelMl ??
                (dstArch === 'beaker-bomex-100' ||
                dstArch === 'thermal-heating-vessel'
                  ? 0
                  : dstCap * 0.5);
              const nextDstBase = Number(
                Math.min(dstCap, curDstBase + actualDrain).toFixed(2),
              );
              if (dstArch === 'graduated-cylinder') {
                setInitialVolumeCm3(Number(nextDstBase.toFixed(1)));
              }
              return {
                ...inst,
                instanceState: {
                  ...inst.instanceState,
                  baseLiquidLevelMl: nextDstBase,
                  liquidLevelMl: nextDstBase,
                },
              };
            }
            return inst;
          });

          const reconciled = reconcileCumulativeLabMeasurements(draft);
          const activeBalance = reconciled.find(
            (i) =>
              assetsMap.get(i.assetId)?.geometry.proceduralArchetype ===
              'electronic-balance',
          );
          if (activeBalance) {
            const netG = Math.max(
              0,
              (activeBalance.instanceState.measuredMassG ?? 0) -
                (activeBalance.instanceState.tareOffsetG ?? 0),
            );
            if (netG > 0) {
              setMeasuredMassG(Number(netG.toFixed(2)));
            }
          }

          return {
            ...prev,
            sceneRevision: prev.sceneRevision + 1,
            instances: reconciled,
          };
        });
      }

      if (isFinalSummary && totalSessionPouredMl >= 0.4) {
        if (dstInst && dstAsset) {
          notify(
            `Đã rót chuẩn +${totalSessionPouredMl.toFixed(1)} ml (${totalSessionPouredMl.toFixed(1)} g) dung dịch từ "${srcInst.customLabel || srcAsset?.name.vi}" vào "${dstInst.customLabel || dstAsset.name.vi}".`,
            'success',
          );
        } else {
          notify(
            `Đã nghiêng rót (góc ${Math.round(currentTiltDeg)}°) ${totalSessionPouredMl.toFixed(1)} ml chất lỏng từ ${srcInst.customLabel || srcAsset?.name.vi} ra ngoài mặt bàn.`,
            'info',
          );
        }
      }
    },
    [scene.instances, assetsMap, reconcileCumulativeLabMeasurements, notify],
  );

  const handleUpdateInstanceState = useCallback(
    (
      instanceId: string,
      patch: Partial<SceneInstance['instanceState']>,
      notificationMsg?: string,
    ) => {
      const targetInst = scene.instances.find((i) => i.instanceId === instanceId);
      if (targetInst) {
        const customMod = htmlEquipmentModuleRegistry.getModule(targetInst.assetId);
        if (customMod) {
          const ctrl = customMod.moduleControls;
          const nextVal = Number(
            (patch as Record<string, unknown>)[ctrl.stateKey] ?? ctrl.defaultValue,
          );
          if (customMod.playEquipmentSound && !labSoundEngine.isMuted()) {
            try {
              customMod.playEquipmentSound('change-state', nextVal);
            } catch {
              labSoundEngine.play(ctrl.soundPhenomenon ?? 'probe-measure', {
                value: nextVal,
              });
            }
          } else {
            labSoundEngine.play(ctrl.soundPhenomenon ?? 'probe-measure', {
              value: nextVal,
            });
          }
        }
      }

      setScene((prev) => {
        const draft = prev.instances.map((inst) => {
          if (inst.instanceId !== instanceId) return inst;
          const nextState: SceneInstance['instanceState'] = {
            ...inst.instanceState,
            ...patch,
          };
          // Khi người dùng kéo thanh trượt Thể tích chất lỏng (liquidLevelMl), cập nhật đồng bộ cả baseLiquidLevelMl
          // để hàm reconcileCumulativeLabMeasurements không ghi đè ngược về mức nước cũ!
          if (
            patch.liquidLevelMl !== undefined &&
            patch.baseLiquidLevelMl === undefined
          ) {
            nextState.baseLiquidLevelMl = patch.liquidLevelMl;
          }
          // Khi điều chỉnh nhiệt độ ngọn lửa (temperatureC), đồng bộ trạng thái đang đun (isHeating)
          if (
            patch.temperatureC !== undefined &&
            patch.isHeating === undefined
          ) {
            const customMod = htmlEquipmentModuleRegistry.getModule(inst.assetId);
            const minTemp = customMod?.moduleControls.min ?? 0;
            if (minTemp >= 0) {
              nextState.isHeating = patch.temperatureC > minTemp + 0.5;
            }
          }
          return {
            ...inst,
            instanceState: nextState,
          };
        });
        return {
          ...prev,
          sceneRevision: prev.sceneRevision + 1,
          instances: reconcileCumulativeLabMeasurements(draft),
        };
      });
      if (notificationMsg) {
        notify(notificationMsg, 'info');
      }
    },
    [scene.instances, reconcileCumulativeLabMeasurements, notify],
  );

  const handleToggleInstanceVisibility = useCallback((instanceId: string) => {
    setScene((prev) => ({
      ...prev,
      instances: prev.instances.map((inst) =>
        inst.instanceId === instanceId ? { ...inst, visible: !inst.visible } : inst,
      ),
    }));
  }, []);

  const handleToggleInstanceLock = useCallback((instanceId: string) => {
    setScene((prev) => ({
      ...prev,
      instances: prev.instances.map((inst) =>
        inst.instanceId === instanceId ? { ...inst, locked: !inst.locked } : inst,
      ),
    }));
  }, []);

  const handleDuplicateInstance = useCallback(
    (instanceId: string) => {
      const source = scene.instances.find((i) => i.instanceId === instanceId);
      if (!source) return;
      handleAddAssetToScene(source.assetId, [
        Number(Math.min(1.15, source.transform.positionM[0] + 0.09).toFixed(3)),
        0,
        Number(Math.min(0.325, source.transform.positionM[2] + 0.06).toFixed(3)),
      ]);
    },
    [scene.instances, handleAddAssetToScene],
  );

  const handleDeleteInstance = useCallback(
    (instanceId: string) => {
      const target = scene.instances.find((i) => i.instanceId === instanceId);
      setScene((prev) => {
        const remaining = prev.instances
          .filter((i) => i.instanceId !== instanceId)
          .map((item) =>
            item.instanceState.attachedToInstanceId === instanceId
              ? {
                  ...item,
                  transform: {
                    ...item.transform,
                    positionM: [
                      item.transform.positionM[0],
                      0,
                      item.transform.positionM[2],
                    ] as [number, number, number],
                  },
                  instanceState: {
                    ...item.instanceState,
                    attachedToInstanceId: null,
                    attachmentSlot: 'bench' as const,
                  },
                }
              : item,
          );
        return {
          ...prev,
          sceneRevision: prev.sceneRevision + 1,
          instances: reconcileCumulativeLabMeasurements(remaining),
        };
      });
      if (selectedInstanceId === instanceId) {
        setSelectedInstanceId(null);
      }
      labSoundEngine.play('wood-place', { intensity: 0.85 });
      if (target) {
        notify(
          `Đã cất "${target.customLabel || target.assetId}" vào Tủ đựng đồ trên bàn (sát trục X).`,
          'info',
        );
      }
    },
    [
      scene.instances,
      selectedInstanceId,
      reconcileCumulativeLabMeasurements,
      notify,
    ],
  );

  // Reset Scene to Initial Layout
  const handleResetScene = useCallback(() => {
    const fresh = sceneRepository.cloneInitialScene();
    setScene(fresh);
    setSelectedInstanceId(null);
    setViewMode('lab-scene');
    setStudentGuidedStep(1);
    setMeasuredMassG(null);
    setFinalVolumeCm3(null);
    setActivePhenomenon(null);
    notify('Đã đặt lại bàn gỗ thí nghiệm và bảng kết quả về trạng thái ban đầu.', 'info');
  }, [notify]);

  // Switch Environment
  const handleSelectEnvironment = useCallback(
    (environmentId: string) => {
      const env = environmentRepository.getById(environmentId);
      if (!env) return;
      setScene((prev) => ({
        ...prev,
        sceneRevision: prev.sceneRevision + 1,
        environmentId,
      }));
      notify(`Đã đổi không gian sang "${env.name.vi}".`, 'success');
    },
    [notify],
  );

  // Switch Active Experiment
  const handleSelectExperiment = useCallback(
    (experimentId: string, preloadKit = false) => {
      const exp = experimentRepository.getById(experimentId);
      if (!exp) return;

      if (preloadKit) {
        const kit = kitRepository.getById(exp.recommendedKitId);
        if (kit) {
          handleLoadKitToScene(kit);
        }
      }

      setScene((prev) => ({
        ...prev,
        experimentId,
        environmentId: exp.recommendedEnvironmentId || prev.environmentId,
      }));
      setCurrentStepIndex(0);
      setStudentGuidedStep(1);
      notify(`Đã chọn bài thực hành: "${exp.title}".`, 'info');
    },
    [handleLoadKitToScene, notify],
  );

  // Student Screen Navigation Handler
  const handleSelectStudentScreen = useCallback(
    (screen: StudentScreenId) => {
      setStudentScreen(screen);
      if (screen === 'explore-equipment') {
        setViewMode('single-asset');
        setSelectedCatalogAssetId(
          (prev) =>
            prev ??
            selectedInstance?.assetId ??
            allAssets[0]?.assetId ??
            'OL3D-EQP-BAL-0001',
        );
      } else if (screen === 'lab-room') {
        setViewMode('lab-scene');
      }
    },
    [selectedInstance?.assetId, allAssets],
  );

  // Teacher Section Navigation Handler
  const handleSelectNavSection = (section: NavSectionId) => {
    setActiveNavSection(section);
    if (section === 'overview') {
      setGovernanceModalMode('overview');
    } else if (section === 'governance') {
      setGovernanceModalMode('governance');
    } else if (section === 'library-3d') {
      setExplorerTab('equipment');
      setIsExplorerCollapsed(false);
    } else if (section === 'kits') {
      setExplorerTab('kits');
      setIsExplorerCollapsed(false);
    } else if (section === 'environments') {
      setExplorerTab('environments');
      setIsExplorerCollapsed(false);
    } else if (section === 'lab-workspace') {
      setGovernanceModalMode(null);
    }
  };

  // Switch between Student and Teacher Roles
  const handleChangeUserRole = (nextRole: UserRoleMode) => {
    setUserRole(nextRole);
    if (nextRole === 'teacher') {
      setViewMode('lab-scene');
      setShowAxes(true);
    } else {
      setShowAxes(false);
      setShowDimensions(false);
      setGovernanceModalMode(null);
    }
  };

  return (
    <div
      className={`ol3d-app-shell w-full overflow-hidden flex flex-col transition-colors ${
        isDarkMode
          ? 'bg-[#0B121E] text-slate-100'
          : 'bg-[#D5E0ED] text-[#123059]'
      }`}
    >
      {/* A. Top Header Bar (~70px) with Library Toggle, Guide Toggle, Fullscreen Toggle & Dark Theme Toggle */}
      <TopNavBar
        userRole={userRole}
        studentScreen={studentScreen}
        activeSection={activeNavSection}
        globalSearch={searchQuery}
        headerProgressStep={headerProgressStep}
        isDarkMode={isDarkMode}
        isLibraryOpen={!isExplorerCollapsed}
        isGuideOpen={isStudentGuideOpen}
        isFullscreen={isViewportFullscreen}
        isNeuralGuideEnabled={isNeuralGuideEnabled}
        onToggleNeuralGuide={() => {
          const next = neuralConnectionEngine.toggleGuideEnabled();
          setIsNeuralGuideEnabled(next);
          notify(
            next
              ? '🧠 Trợ lý Nơ-ron: ĐÃ BẬT (Hiện tia liên kết 3D & chỉ dẫn thao tác)'
              : '🧠 Trợ lý Nơ-ron: ĐÃ TẮT (Chế độ tự do / Đánh giá thi)',
            next ? 'success' : 'info',
          );
        }}
        onOpenNeuralModal={() => {
          setNeuralModalTargetDeviceId(null);
          setShowNeuralNetworkModal(true);
        }}
        onToggleDarkMode={() => setIsDarkMode((v) => !v)}
        onToggleLibraryPanel={handleToggleLibrarySidebar}
        onToggleGuidePanel={handleToggleStudentGuide}
        onToggleFullscreen={handleToggleViewportFullscreen}
        onChangeHeaderProgressStep={handleChangeHeaderProgressStep}
        onResetLab={handleResetScene}
        onChangeUserRole={handleChangeUserRole}
        onSelectStudentScreen={handleSelectStudentScreen}
        onOpenStudentHelp={() => setShowStudentHelpModal(true)}
        onOpenHtmlModuleImporter={() => {
          setHtmlUpdaterTargetAsset(null);
          setShowHtmlModuleImporterModal(true);
        }}
        onSelectSection={handleSelectNavSection}
        onGlobalSearchChange={(val) => {
          setSearchQuery(val);
          if (explorerTab !== 'equipment') setExplorerTab('equipment');
          if (isExplorerCollapsed) setIsExplorerCollapsed(false);
        }}
        recentSearches={recentSearches}
        onCommitSearch={handleRecordRecentSearch}
        onSelectRecentSearch={handleSelectRecentSearch}
        onRemoveRecentSearch={handleRemoveRecentSearch}
        onClearRecentSearches={handleClearRecentSearches}
        onQuickAddSelectedAsset={() => {
          const targetId = activeInspectedAsset?.assetId ?? 'OL3D-EQP-BAL-0001';
          handleAddAssetToScene(targetId);
        }}
        notificationCount={recentLogs.length}
        recentLogs={recentLogs}
      />

      {/* =====================================================================
          MODE 1: STUDENT MODE — Official Reference 6-Region Desktop Layout
         ===================================================================== */}
      {userRole === 'student' ? (
        <div
          className={`flex-1 flex min-h-0 overflow-hidden relative transition-colors ${
            isDarkMode ? 'bg-[#0B121E]' : 'bg-[#D5E0ED]'
          }`}
        >
          {/* SCREEN 0: MÀN HÌNH TRANG CHỦ (HOME DASHBOARD BAN ĐẦU VỚI 2 KHỐI CHỨC NĂNG) */}
          {studentScreen === 'home' && (
            <StudentHomeDashboardView
              projectsCount={personalProjects.length}
              equipmentCount={allAssets.length}
              experimentsCount={experiments.length}
              isDarkMode={isDarkMode}
              onSelectProjectManager={() =>
                handleSelectStudentScreen('lab-projects')
              }
              onSelectEquipmentManager={() =>
                handleSelectStudentScreen('explore-equipment')
              }
              onOpenHtmlModuleImporter={(initialHtml, initialFileName) => {
                setHtmlUpdaterTargetAsset(null);
                if (initialHtml) {
                  setInitialImportHtmlData({
                    content: initialHtml,
                    fileName: initialFileName || 'custom_equipment.html',
                  });
                } else {
                  setInitialImportHtmlData(null);
                }
                setShowHtmlModuleImporterModal(true);
              }}
              onNotify={notify}
            />
          )}

          {/* SCREEN 1: QUẢN LÝ DỰ ÁN THÍ NGHIỆM 3D TOÀN CHIỀU RỘNG */}
          {studentScreen === 'lab-projects' && (
            <StudentPersonalProjectsView
              projects={personalProjects}
              experiments={experiments}
              kits={kits}
              assetsMap={assetsMap}
              isDarkMode={isDarkMode}
              onBackToHomeDashboard={() => handleSelectStudentScreen('home')}
              onCreateProject={(newProj, openImmediately) => {
                setPersonalProjects((prev) => [newProj, ...prev]);
                setActivePersonalProject(newProj);
                setDraftProjectName(newProj.title);
                notify(
                  `Đã lưu dự án "${newProj.title}" (${newProj.createdAt})!`,
                  'success',
                );
                if (openImmediately) {
                  handleSelectStudentScreen('lab-room');
                }
              }}
              onUpdateProjectImage={(projectId, newImageUrl) => {
                setPersonalProjects((prev) =>
                  prev.map((p) =>
                    p.projectId === projectId
                      ? { ...p, imageUrl: newImageUrl }
                      : p,
                  ),
                );
                setActivePersonalProject((prev) =>
                  prev && prev.projectId === projectId
                    ? { ...prev, imageUrl: newImageUrl }
                    : prev,
                );
                notify(
                  'Đã tải lên và cập nhật hình ảnh minh họa cho thẻ dự án!',
                  'success',
                );
              }}
              onDeleteProject={(projectId) => {
                setPersonalProjects((prev) =>
                  prev.filter((p) => p.projectId !== projectId),
                );
                if (activePersonalProject?.projectId === projectId) {
                  setActivePersonalProject(null);
                  setDraftProjectName('');
                }
              }}
              onOpenProjectIn3DWorkbench={(project) => {
                setActivePersonalProject(project);
                setDraftProjectName(project.title);
                setIsProjectNameConfirmed(true);
                setLastSavedProjectTime(project.createdAt);
                if (project.savedInstancesJson) {
                  try {
                    const parsedInstances = JSON.parse(
                      project.savedInstancesJson,
                    );
                    if (Array.isArray(parsedInstances)) {
                      setScene((prev) => ({
                        ...prev,
                        sceneRevision: prev.sceneRevision + 1,
                        instances: parsedInstances,
                      }));
                    }
                  } catch {
                    // Ignore invalid snapshot
                  }
                } else if (project.experimentId) {
                  handleSelectExperiment(project.experimentId, false);
                }
                handleSelectStudentScreen('lab-room');
                notify(
                  `Đang mở dự án "${project.title}" (Lưu lúc: ${project.createdAt}).`,
                  'info',
                );
              }}
              onEnterFree3DWorkbench={() => {
                // Mở Phòng thí nghiệm với bàn trống để tự do kéo thả dụng cụ 3D
                setScene((prev) => ({
                  ...prev,
                  sceneRevision: prev.sceneRevision + 1,
                  instances: [],
                }));
                setSelectedInstanceId(null);
                setMeasuredMassG(null);
                setFinalVolumeCm3(null);
                setActivePersonalProject(null);
                setDraftProjectName('');
                setIsProjectNameConfirmed(false);
                setLastSavedProjectTime('');
                handleSelectStudentScreen('lab-room');
                setTimeout(() => {
                  projectNameInputRef.current?.focus();
                }, 80);
                notify(
                  'Đã mở Phòng thí nghiệm với bàn trống. Nhập Tên dự án, bấm dấu tick xác nhận và Lưu!',
                  'info',
                );
              }}
              onStartExperiment={(expId) => {
                handleSelectExperiment(expId, true);
                handleSelectStudentScreen('lab-room');
              }}
              onOpenExploreEquipment={() =>
                handleSelectStudentScreen('explore-equipment')
              }
              onOpenMyKits={() => handleSelectStudentScreen('my-kits')}
              onOpenHelp={() => setShowStudentHelpModal(true)}
              onExportProjectPptxSuccess={(fileName, projectTitle) => {
                labSoundEngine.play('success', { intensity: 0.75 });
                notify(
                  `Đã xuất bản dự án "${projectTitle}" thành file PowerPoint (${fileName})!`,
                  'success',
                );
              }}
            />
          )}

          {/* SCREEN 2: STUDENT MY KITS SCREEN */}
          {studentScreen === 'my-kits' && (
            <StudentKitsView
              kits={kits}
              assetsMap={assetsMap}
              onBackHome={() => handleSelectStudentScreen('lab-projects')}
              onSelectKitAndStartLab={(kit) => {
                handleLoadKitToScene(kit);
                handleSelectStudentScreen('lab-room');
              }}
            />
          )}

          {/* SCREEN 3: PHÂN VÙNG "DỤNG CỤ THÍ NGHIỆM" — TỰ THIẾT KẾ DỤNG CỤ THÍ NGHIỆM TÍCH HỢP AI */}
          {studentScreen === 'explore-equipment' && (
            <StudentAiEquipmentDesignerView
              assets={allAssets}
              isDarkMode={isDarkMode}
              onBackToHomeDashboard={() => handleSelectStudentScreen('home')}
              onOpenProjectManager={() =>
                handleSelectStudentScreen('lab-projects')
              }
              onOpen3DWorkbench={() => handleSelectStudentScreen('lab-room')}
              onConfirmAndAddToProject={(pkg, initialStatePatch) => {
                openLabAssetLoader.invalidateAssetCache(pkg.asset.assetId);
                setModuleRegistryRevision((r) => r + 1);
                setSelectedCatalogAssetId(pkg.asset.assetId);
                handleAddAssetToScene(
                  pkg.asset.assetId,
                  undefined,
                  pkg.asset,
                  initialStatePatch,
                );
                handleSelectStudentScreen('lab-room');
                labSoundEngine.play('step-complete', 0.95);
                notify(
                  `Đã lưu dụng cụ "${pkg.asset.name.vi}" kèm Bảng điều khiển tương tác và đưa thẳng vào bàn thí nghiệm 3D!`,
                  'success',
                );
              }}
              onAddExistingAssetToLab={(assetId) => {
                handleAddAssetToScene(assetId);
                handleSelectStudentScreen('lab-room');
              }}
              onInspectExistingAsset={(asset) => {
                setDetailModalEditMode(true);
                setStudentDetailModalAsset(asset);
              }}
              onDeleteExistingAsset={handleDeleteCatalogAsset}
            />
          )}

          {/* SCREEN 4: REFERENCE 6-REGION LABORATORY WORKSPACE (PHÒNG THÍ NGHIỆM 3D) */}
          {studentScreen === 'lab-room' && (
            <div
              id="lab-3d-workspace"
              className="flex-1 flex gap-1.5 md:gap-2.5 p-1.5 md:p-2.5 min-w-0 min-h-0 overflow-hidden relative"
            >
              {/* B. Left Column: Thư viện (290 px, thu gọn tự động trên điện thoại, mở/ẩn linh hoạt cả trong chế độ Toàn màn hình) */}
              {(!isViewportFullscreen || !isExplorerCollapsed) && (
                <StudentEquipmentSidebar
                  assets={allAssets}
                  presentAssetIds={presentAssetIdsSet}
                  selectedAssetId={activeInspectedAsset?.assetId ?? null}
                  requiredAssetIds={requiredExperimentAssetIdsSet}
                  isExploreOnlyMode={false}
                  isDarkMode={isDarkMode}
                  isCollapsed={isExplorerCollapsed}
                  searchQuery={searchQuery}
                  recentSearches={recentSearches}
                  onSearchChange={setSearchQuery}
                  onCommitSearch={handleRecordRecentSearch}
                  onSelectRecentSearch={handleSelectRecentSearch}
                  onRemoveRecentSearch={handleRemoveRecentSearch}
                  onClearRecentSearches={handleClearRecentSearches}
                  onToggleCollapse={handleToggleLibrarySidebar}
                  onSelectAsset={handleSelectCatalogAsset}
                  onAddAssetToTable={(assetId) => handleAddAssetToScene(assetId)}
                  onInspectAssetDetail={(asset, editMode = false) => {
                    setDetailModalEditMode(editMode);
                    setStudentDetailModalAsset(asset);
                  }}
                  onOpenHtmlModuleImporter={() => {
                    setHtmlUpdaterTargetAsset(null);
                    setShowHtmlModuleImporterModal(true);
                  }}
                  onOpenHtmlUpdaterForAsset={(asset) => {
                    setHtmlUpdaterTargetAsset(asset);
                    setShowHtmlModuleImporterModal(true);
                  }}
                  onOpenPhotoUpdaterForAsset={(asset) => {
                    setPhotoUpdaterTargetAsset(asset);
                  }}
                  onDeleteAsset={handleDeleteCatalogAsset}
                  onOpenGlobalEquipmentLibrary={() =>
                    setShowGlobalEquipmentModal(true)
                  }
                />
              )}

              {/* Host Equipment Real Photo Slide-over Panel (240 × 240, 1:1 contain — Mục 4.3) */}
              <EquipmentPreviewPanel
                assetsMap={assetsMap}
                selectedAsset={activeInspectedAsset}
                isSidebarCollapsed={isExplorerCollapsed}
                isDarkMode={isDarkMode}
                onAddAssetToTable={(assetId) => handleAddAssetToScene(assetId)}
                onInspectAssetDetail={(asset, editMode = false) => {
                  setDetailModalEditMode(editMode);
                  setStudentDetailModalAsset(asset);
                }}
                onOpenHtmlUpdaterForAsset={(asset) => {
                  setHtmlUpdaterTargetAsset(asset);
                  setShowHtmlModuleImporterModal(true);
                }}
                onOpenPhotoUpdaterForAsset={(asset) => {
                  setPhotoUpdaterTargetAsset(asset);
                }}
              />

              {/* Right Main Workspace: Upper Row (3D Viewport) + Optional Top/Bottom Info Bars */}
              <div className="flex-1 flex flex-col gap-1.5 md:gap-2 min-w-0 min-h-0 overflow-hidden relative">
                {/* THANH QUẢN LÝ DỰ ÁN Ở PHÍA TRÊN GIAO DIỆN BÀN THÍ NGHIỆM 3D — Mặc định ẩn, chỉ hiện khi bấm Hiện */}
                {!isViewportFullscreen && !isLabInfoBarsVisible && (
                  <div className="flex items-center justify-between px-2.5 py-1 rounded-[10px] bg-[#0B1528]/90 border border-slate-800/80 text-xs text-slate-300 shrink-0">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectStudentScreen('home')}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Home className="w-3 h-3 text-sky-400" />
                        <span>Trang chủ</span>
                      </button>
                      <span className="text-[11px] text-slate-400 hidden sm:inline">
                        Các thanh thông tin đang thu gọn để mở rộng tối đa phòng thí nghiệm 3D
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLabInfoBarsVisible(true)}
                      className="px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[11.5px] cursor-pointer transition-colors"
                    >
                      Hiện Thanh Thông Tin &amp; Tiện Ích
                    </button>
                  </div>
                )}
                {!isViewportFullscreen && isLabInfoBarsVisible && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const cleanedTitle = draftProjectName.trim();
                      if (!cleanedTitle) {
                        projectNameInputRef.current?.focus();
                        notify(
                          'Vui lòng nhập Tên dự án trước khi bấm nút Lưu!',
                          'warning',
                        );
                        return;
                      }
                      const exactSavedAt = formatExactSaveDateTime(new Date());
                      const snapshotJson = JSON.stringify(scene.instances);
                      setIsProjectNameConfirmed(true);
                      setLastSavedProjectTime(exactSavedAt);

                      if (
                        activePersonalProject &&
                        activePersonalProject.title.toLowerCase() ===
                          cleanedTitle.toLowerCase()
                      ) {
                        const updatedProject: PersonalLabProject = {
                          ...activePersonalProject,
                          title: cleanedTitle,
                          createdAt: exactSavedAt,
                          savedInstancesJson: snapshotJson,
                        };
                        setPersonalProjects((prev) =>
                          prev.map((p) =>
                            p.projectId === updatedProject.projectId
                              ? updatedProject
                              : p,
                          ),
                        );
                        setActivePersonalProject(updatedProject);
                        labSoundEngine.play('success', { intensity: 0.8 });
                        notify(
                          `Đã lưu dự án "${cleanedTitle}" (${exactSavedAt})!`,
                          'success',
                        );
                      } else {
                        const newProject: PersonalLabProject = {
                          projectId: `my-prj-${Date.now()}`,
                          title: cleanedTitle,
                          imageUrl: '',
                          experimentId: scene.experimentId,
                          createdAt: exactSavedAt,
                          savedInstancesJson: snapshotJson,
                        };
                        setPersonalProjects((prev) => [newProject, ...prev]);
                        setActivePersonalProject(newProject);
                        labSoundEngine.play('success', { intensity: 0.8 });
                        notify(
                          `Đã lưu dự án "${cleanedTitle}" (${exactSavedAt})! Vào "Danh sách dự án" để tải ảnh minh họa.`,
                          'success',
                        );
                      }
                    }}
                    className={`rounded-[12px] px-3 py-2 border flex flex-wrap items-center justify-between gap-2 shrink-0 ${
                      isDarkMode
                        ? 'bg-[#0F1E36] border-[#264B82] text-white'
                        : 'bg-white border-[#C5DCFA] text-[#09234C] shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleSelectStudentScreen('home')}
                        className={`px-2.5 py-1.5 rounded-[8px] border text-[12.5px] font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isDarkMode
                            ? 'bg-[#152A4A] hover:bg-[#1E3B68] border-[#2C528C] text-white'
                            : 'bg-[#F2F7FF] hover:bg-[#E1EDFF] border-[#C5DCFA] text-[#09234C]'
                        }`}
                        title="Quay lại màn hình Trang chủ OPEN LAB 3D"
                      >
                        <Home className="w-3.5 h-3.5 text-[#1E6BFF]" />
                        <span>Trang chủ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectStudentScreen('lab-projects')}
                        className={`px-2.5 py-1.5 rounded-[8px] border text-[12.5px] font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isDarkMode
                            ? 'bg-[#152A4A] hover:bg-[#1E3B68] border-[#2C528C] text-white'
                            : 'bg-[#F2F7FF] hover:bg-[#E1EDFF] border-[#C5DCFA] text-[#09234C]'
                        }`}
                        title="Mở danh sách dự án cá nhân để xem thẻ và tải ảnh minh họa"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Danh sách dự án ({personalProjects.length})</span>
                      </button>

                      <span
                        className={`px-2.5 py-1 rounded-[7px] text-[12px] font-bold border ${
                          scene.instances.filter((i) => i.visible).length === 0
                            ? isDarkMode
                              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                              : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : isDarkMode
                              ? 'bg-[#132644] border-[#264B82] text-[#7DD3FC]'
                              : 'bg-[#F3F8FF] border-[#C5DCFA] text-[#1E6BFF]'
                        }`}
                      >
                        {scene.instances.filter((i) => i.visible).length === 0
                          ? 'Phòng thí nghiệm với bàn trống'
                          : `${scene.instances.filter((i) => i.visible).length} dụng cụ trên bàn`}
                      </span>

                      {lastSavedProjectTime && (
                        <span
                          className={`px-2.5 py-1 rounded-[7px] text-[11.5px] font-mono font-bold border flex items-center gap-1 ${
                            isDarkMode
                              ? 'bg-[#091528] border-[#2C528C] text-[#6EE7B7]'
                              : 'bg-[#F0FDF4] border-[#BBF7D0] text-[#047857]'
                          }`}
                        >
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>Đã lưu: {lastSavedProjectTime}</span>
                        </span>
                      )}

                      {scene.instances.filter((i) => i.visible).length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setScene((prev) => ({
                              ...prev,
                              sceneRevision: prev.sceneRevision + 1,
                              instances: [],
                            }));
                            setSelectedInstanceId(null);
                            setMeasuredMassG(null);
                            setFinalVolumeCm3(null);
                            setActivePersonalProject(null);
                            projectNameInputRef.current?.focus();
                            notify(
                              'Đã làm trống bàn thí nghiệm. Tự do kéo thả dụng cụ 3D mới!',
                              'info',
                            );
                          }}
                          className={`px-2.5 py-1 rounded-[7px] border text-[12px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                            isDarkMode
                              ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-600 text-slate-200'
                              : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                          }`}
                          title="Xóa hết dụng cụ để về Phòng thí nghiệm với bàn trống"
                        >
                          <Eraser className="w-3.5 h-3.5" />
                          <span>Làm trống bàn</span>
                        </button>
                      )}
                    </div>

                    {/* Cụm bên phải: Ô nhập "Tên dự án" + Nút xác nhận (dấu tick) + Nút "Lưu" */}
                    <div className="flex items-center gap-1.5 flex-1 min-w-[260px] max-w-xl justify-end flex-wrap sm:flex-nowrap">
                      <div className="relative flex-1 min-w-[170px] flex items-center">
                        <input
                          ref={projectNameInputRef}
                          type="text"
                          value={draftProjectName}
                          onChange={(e) => {
                            setDraftProjectName(e.target.value);
                            setIsProjectNameConfirmed(false);
                          }}
                          placeholder="Tên dự án (VD: Khúc xạ ánh sáng)..."
                          aria-label="Tên dự án"
                          className={`w-full px-3 py-1.5 rounded-[8px] border text-[13.5px] font-bold focus:outline-none transition-colors ${
                            isProjectNameConfirmed
                              ? isDarkMode
                                ? 'bg-[#091F1B] border-[#34D399] text-white'
                                : 'bg-[#F0FDF4] border-[#059669] text-[#09234C]'
                              : isDarkMode
                                ? 'bg-[#091528] border-[#2C528C] focus:border-[#38BDF8] text-white placeholder:text-slate-400'
                                : 'bg-[#F7FAFF] border-[#9EC5F8] focus:border-[#1E6BFF] text-[#09234C] placeholder:text-slate-400'
                          }`}
                        />
                      </div>

                      {/* NÚT XÁC NHẬN TÊN DỰ ÁN (DẤU TICK ✓) */}
                      <button
                        type="button"
                        onClick={() => {
                          const cleaned = draftProjectName.trim();
                          if (!cleaned) {
                            projectNameInputRef.current?.focus();
                            notify(
                              'Vui lòng nhập Tên dự án trước khi bấm dấu tick xác nhận!',
                              'warning',
                            );
                            return;
                          }
                          setDraftProjectName(cleaned);
                          setIsProjectNameConfirmed(true);
                          labSoundEngine.play('ui-click', { intensity: 0.65 });
                          notify(
                            `Đã xác nhận tên dự án: "${cleaned}". Bấm "Lưu" để ghi nhận thời gian lưu!`,
                            'info',
                          );
                        }}
                        title="Xác nhận Tên dự án (Dấu tick)"
                        aria-label="Xác nhận Tên dự án"
                        className={`p-2 rounded-[8px] border font-extrabold flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                          isProjectNameConfirmed
                            ? 'bg-[#059669] border-[#34D399] text-white shadow-2xs'
                            : isDarkMode
                              ? 'bg-[#152A4A] hover:bg-[#1E3B68] border-[#2C528C] text-emerald-300'
                              : 'bg-[#EAF3FF] hover:bg-[#D8E8FF] border-[#9EC5F8] text-[#059669]'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      {/* NÚT LƯU DỰ ÁN */}
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-[8px] bg-[#1E6BFF] hover:bg-[#1557D6] text-white text-[13px] font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
                        title="Lưu dự án kèm Tên dự án và Thời gian (ngày, giờ) lưu cụ thể"
                      >
                        <Save className="w-4 h-4" />
                        <span>Lưu</span>
                      </button>

                      {/* NÚT [📊 Xuất bản file PPT] NGAY TRÊN BÀN THÍ NGHIỆM 3D */}
                      <button
                        type="button"
                        onClick={async () => {
                          const cleanedTitle =
                            draftProjectName.trim() ||
                            activePersonalProject?.title ||
                            activeExperiment?.title ||
                            'Dự án Thí nghiệm Khoa học 3D';
                          const exactSavedAt =
                            lastSavedProjectTime ||
                            formatExactSaveDateTime(new Date());
                          const snapshotJson = JSON.stringify(scene.instances);

                          const projectToExport: PersonalLabProject =
                            activePersonalProject
                              ? {
                                  ...activePersonalProject,
                                  title: cleanedTitle,
                                  createdAt: exactSavedAt,
                                  savedInstancesJson: snapshotJson,
                                }
                              : {
                                  projectId: `my-prj-${Date.now()}`,
                                  title: cleanedTitle,
                                  imageUrl: '',
                                  experimentId: scene.experimentId,
                                  createdAt: exactSavedAt,
                                  savedInstancesJson: snapshotJson,
                                };

                          try {
                            const fileName = await exportProjectToPptx({
                              project: projectToExport,
                              instances: scene.instances,
                              assetsMap,
                              experiment: activeExperiment,
                              measuredMassG,
                              initialVolumeCm3,
                              finalVolumeCm3,
                              objectVolumeCm3,
                              densityGCm3,
                            });
                            labSoundEngine.play('success', { intensity: 0.8 });
                            notify(
                              `Đã xuất bản dự án "${cleanedTitle}" thành file PowerPoint (${fileName})!`,
                              'success',
                            );
                          } catch {
                            notify(
                              'Không thể xuất bản file PowerPoint (.pptx). Vui lòng thử lại.',
                              'error',
                            );
                          }
                        }}
                        className={`px-3 py-1.5 rounded-[8px] border text-[12.5px] font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs ${
                          isDarkMode
                            ? 'bg-[#13284A] hover:bg-[#1E6BFF] border-[#38BDF8]/70 text-[#7DD3FC] hover:text-white'
                            : 'bg-[#F0F7FF] hover:bg-[#1E6BFF] border-[#1E6BFF] text-[#09234C] hover:text-white'
                        }`}
                        title="Đóng gói cấu hình dự án hiện tại và tải xuống thành file PowerPoint (.pptx) độc lập"
                      >
                        <span role="img" aria-hidden="true">
                          📊
                        </span>
                        <span>Xuất bản file PPT</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsLabInfoBarsVisible(false)}
                        className="px-2.5 py-1.5 rounded-[8px] border border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[12px] font-bold cursor-pointer shrink-0"
                        title="Ẩn thanh thông tin dự án và thanh tiện ích bên dưới"
                      >
                        Ẩn thanh thông tin
                      </button>
                    </div>
                  </form>
                )}

                {/* Upper Row: Center 3D Viewport mở rộng toàn bộ chiều rộng (Full-Width, đã gỡ bỏ hoàn toàn Khung Hướng dẫn bên phải) */}
                <div className="flex-1 w-full flex gap-1.5 md:gap-2.5 min-w-0 min-h-0 overflow-hidden relative">
                  <main className="flex-1 w-full flex flex-col min-w-0 min-h-0 overflow-hidden">
                    <LabViewport3D
                      instances={scene.instances}
                      assetsMap={assetsMap}
                      allAssets={allAssets}
                      selectedInstanceId={selectedInstanceId}
                      selectedCatalogAsset={activeInspectedAsset}
                      onSelectCatalogAsset={handleSelectCatalogAsset}
                      environment={activeEnvironment}
                      environments={environments}
                      isStudentMode={true}
                      isNeuralGuideEnabled={isNeuralGuideEnabled}
                      toolMode={toolMode}
                      viewMode={viewMode}
                      showGrid={showGrid}
                      showAxes={showAxes}
                      showLabels={showLabels}
                      showDimensions={showDimensions}
                      showDetailedGuides={showDetailedGuides}
                      onToggleDetailedGuides={() =>
                        setShowDetailedGuides((v) => !v)
                      }
                      isFullscreen={isViewportFullscreen}
                      isDarkMode={isDarkMode}
                      isGuideOpen={false}
                      onToggleGuide={handleToggleStudentGuide}
                      isLibraryOpen={!isExplorerCollapsed}
                      onToggleLibrary={handleToggleLibrarySidebar}
                      equipmentCount={filteredAssets.length}
                      onSelectInstance={handleSelectSceneInstance}
                      onUpdateInstanceTransform={(id, pos, rot) =>
                        handleUpdateInstanceTransform(id, pos, rot)
                      }
                      onPhysicalDockInteraction={handlePhysicalDockInteraction}
                      onQuickLabAction={handleQuickLabAction}
                      onUpdateInstanceState={handleUpdateInstanceState}
                      onDispenseWaterVolume={handleDispenseWaterVolume}
                      onRealtimeTiltPour={handleRealtimeTiltPour}
                      onDropAssetIntoScene={(assetId, posM) =>
                        handleAddAssetToScene(assetId, posM)
                      }
                      onToolModeChange={setToolMode}
                      onViewModeChange={setViewMode}
                      onToggleGrid={() => setShowGrid((v) => !v)}
                      onToggleAxes={() => setShowAxes((v) => !v)}
                      onToggleLabels={() => setShowLabels((v) => !v)}
                      onToggleDimensions={() => setShowDimensions((v) => !v)}
                      onToggleFullscreen={handleToggleViewportFullscreen}
                      onResetScene={handleResetScene}
                      onSelectEnvironment={handleSelectEnvironment}
                      onNotify={notify}
                      onOpenAssetDetailModal={(asset, editMode = false) => {
                        setDetailModalEditMode(editMode);
                        setStudentDetailModalAsset(asset);
                      }}
                      onAddAssetToTable={(assetId) => {
                        handleAddAssetToScene(assetId);
                      }}
                      onOpenGlobalEquipmentLibrary={() =>
                        setShowGlobalEquipmentModal(true)
                      }
                    />
                  </main>
                </div>

                {/* F. Bottom Row: Smart Quick-Utility Toolbar — Chỉ hiển thị khi bấm Hiện Thanh Thông Tin */}
                {viewMode !== 'single-asset' && isLabInfoBarsVisible && (
                    <StudentBottomPanelsRow
                      measuredMassG={measuredMassG}
                      initialVolumeCm3={initialVolumeCm3}
                      finalVolumeCm3={finalVolumeCm3}
                      objectVolumeCm3={objectVolumeCm3}
                      densityGCm3={densityGCm3}
                      isDarkMode={isDarkMode}
                      isFullscreen={isViewportFullscreen}
                      showDetailedGuides={showDetailedGuides}
                      onToggleDetailedGuides={() =>
                        setShowDetailedGuides((v) => !v)
                      }
                      guidedStep={studentGuidedStep}
                      onChangeGuidedStep={handleChangeStudentGuidedStep}
                      onQuickWeighSpecimen={() => handleChangeStudentGuidedStep(2)}
                      onQuickSubmergeSpecimen={() =>
                        handleChangeStudentGuidedStep(3)
                      }
                      selectedAsset={activeInspectedAsset}
                      experiments={experiments}
                      activeExperiment={activeExperiment}
                      onSelectExperiment={(expId) =>
                        handleSelectExperiment(expId, false)
                      }
                      onAddAssetToTable={(assetId) =>
                        handleAddAssetToScene(assetId)
                      }
                    />
                  )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* =====================================================================
           MODE 2: TEACHER / ADMIN MODE
           ===================================================================== */
        <div className="flex-1 flex min-h-0 overflow-hidden relative bg-[#0B0F17] text-slate-100">
          {(!isViewportFullscreen || !isExplorerCollapsed) && (
            <AssetExplorerPanel
              activeTab={explorerTab}
              onTabChange={setExplorerTab}
              assets={filteredAssets}
              categories={categories}
              kits={kits}
              environments={environments}
              selectedCatalogAssetId={activeInspectedAsset?.assetId ?? null}
              activeEnvironmentId={scene.environmentId}
              searchQuery={searchQuery}
              recentSearches={recentSearches}
              selectedSubject={selectedSubject}
              selectedCategory={selectedCategory}
              selectedVerification={selectedVerification}
              selectedFormat={selectedFormat}
              isCollapsed={isExplorerCollapsed}
              onToggleCollapse={() => setIsExplorerCollapsed((v) => !v)}
              onSearchChange={setSearchQuery}
              onCommitSearch={handleRecordRecentSearch}
              onSelectRecentSearch={handleSelectRecentSearch}
              onRemoveRecentSearch={handleRemoveRecentSearch}
              onClearRecentSearches={handleClearRecentSearches}
              onSubjectChange={setSelectedSubject}
              onCategoryChange={setSelectedCategory}
              onVerificationChange={setSelectedVerification}
              onFormatChange={setSelectedFormat}
              onSelectCatalogAsset={handleSelectCatalogAsset}
              onAddAssetToScene={(assetId) => handleAddAssetToScene(assetId)}
              onBatchAddAssetsToScene={handleBatchAddAssetsToScene}
              onLoadKitToScene={handleLoadKitToScene}
              onSelectEnvironment={handleSelectEnvironment}
              onDeleteCatalogAsset={handleDeleteCatalogAsset}
            />
          )}

          <EquipmentPreviewPanel
            assetsMap={assetsMap}
            selectedAsset={activeInspectedAsset}
            isSidebarCollapsed={isExplorerCollapsed}
            isDarkMode={true}
            onAddAssetToTable={(assetId) => handleAddAssetToScene(assetId)}
            onInspectAssetDetail={(asset, editMode = false) => {
              setDetailModalEditMode(editMode);
              setStudentDetailModalAsset(asset);
            }}
            onOpenHtmlUpdaterForAsset={(asset) => {
              setHtmlUpdaterTargetAsset(asset);
              setShowHtmlModuleImporterModal(true);
            }}
            onOpenPhotoUpdaterForAsset={(asset) => {
              setPhotoUpdaterTargetAsset(asset);
            }}
          />

          <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
            <LabViewport3D
              instances={scene.instances}
              assetsMap={assetsMap}
              allAssets={allAssets}
              selectedInstanceId={selectedInstanceId}
              selectedCatalogAsset={activeInspectedAsset}
              onSelectCatalogAsset={handleSelectCatalogAsset}
              environment={activeEnvironment}
              environments={environments}
              isStudentMode={false}
              isNeuralGuideEnabled={isNeuralGuideEnabled}
              toolMode={toolMode}
              viewMode={viewMode}
              showGrid={showGrid}
              showAxes={showAxes}
              showLabels={showLabels}
              showDimensions={showDimensions}
              showDetailedGuides={showDetailedGuides}
              onToggleDetailedGuides={() => setShowDetailedGuides((v) => !v)}
              isFullscreen={isViewportFullscreen}
              isDarkMode={true}
              isLibraryOpen={!isExplorerCollapsed}
              onToggleLibrary={handleToggleLibrarySidebar}
              equipmentCount={filteredAssets.length}
              onSelectInstance={handleSelectSceneInstance}
              onUpdateInstanceTransform={(id, pos, rot) =>
                handleUpdateInstanceTransform(id, pos, rot)
              }
              onPhysicalDockInteraction={handlePhysicalDockInteraction}
              onQuickLabAction={handleQuickLabAction}
              onUpdateInstanceState={handleUpdateInstanceState}
              onDispenseWaterVolume={handleDispenseWaterVolume}
              onRealtimeTiltPour={handleRealtimeTiltPour}
              onDropAssetIntoScene={(assetId, posM) =>
                handleAddAssetToScene(assetId, posM)
              }
              onToolModeChange={setToolMode}
              onViewModeChange={setViewMode}
              onToggleGrid={() => setShowGrid((v) => !v)}
              onToggleAxes={() => setShowAxes((v) => !v)}
              onToggleLabels={() => setShowLabels((v) => !v)}
              onToggleDimensions={() => setShowDimensions((v) => !v)}
              onToggleFullscreen={handleToggleViewportFullscreen}
              onResetScene={handleResetScene}
              onSelectEnvironment={handleSelectEnvironment}
              onNotify={notify}
              onOpenAssetDetailModal={(asset, editMode = false) => {
                setDetailModalEditMode(editMode);
                setStudentDetailModalAsset(asset);
              }}
              onAddAssetToTable={(assetId) => handleAddAssetToScene(assetId)}
            />

            {!isViewportFullscreen && viewMode !== 'single-asset' && isLabInfoBarsVisible && (
              <BottomWorkspaceTray
                experiments={experiments}
                activeExperiment={activeExperiment}
                currentStepIndex={currentStepIndex}
                environments={environments}
                activeEnvironmentId={scene.environmentId}
                sceneInstances={scene.instances}
                assetsMap={assetsMap}
                onSelectExperiment={(expId) =>
                  handleSelectExperiment(expId, false)
                }
                onStepChange={setCurrentStepIndex}
                onSelectEnvironment={handleSelectEnvironment}
                onAddAssetToScene={(assetId) => handleAddAssetToScene(assetId)}
              />
            )}
          </main>

          {!isViewportFullscreen &&
            (isRightPanelCollapsed ? (
              <aside className="w-10 bg-[#0E1420] border-l border-slate-800/90 flex flex-col items-center py-2.5 gap-3 shrink-0 z-20">
                <button
                  type="button"
                  onClick={() => setIsRightPanelCollapsed(false)}
                  className="w-8 h-8 rounded-[6px] bg-[#DC2626] hover:bg-[#B91C1C] border border-[#F87171] text-white flex items-center justify-center cursor-pointer shadow-xs"
                  title="Mở rộng Scene Hierarchy & Inspector"
                >
                  <ChevronRight className="w-4 h-4 rotate-180 text-white" />
                </button>
              </aside>
            ) : (
              <aside className="w-84 xl:w-92 bg-[#0E1420] border-l border-slate-800/90 flex flex-col h-full shrink-0 z-20">
                <div className="h-8 px-3 bg-[#090D16] border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
                  <span className="font-mono">
                    Scene Rev #{scene.sceneRevision}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsRightPanelCollapsed(true)}
                    className="h-6 px-2 rounded-[6px] bg-[#DC2626] hover:bg-[#B91C1C] border border-[#F87171] text-white text-[11px] font-extrabold flex items-center gap-0.5 cursor-pointer shadow-xs"
                  >
                    <span>Ẩn</span>
                    <ChevronRight className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>

                <SceneHierarchyPanel
                  environment={activeEnvironment}
                  instances={scene.instances}
                  assetsMap={assetsMap}
                  selectedInstanceId={selectedInstanceId}
                  onSelectInstance={handleSelectSceneInstance}
                  onToggleInstanceVisibility={handleToggleInstanceVisibility}
                  onToggleInstanceLock={handleToggleInstanceLock}
                  onDuplicateInstance={handleDuplicateInstance}
                  onDeleteInstance={handleDeleteInstance}
                />

                <InspectorPanel
                  selectedInstance={selectedInstance}
                  selectedAsset={activeInspectedAsset}
                  onUpdateInstanceTransform={handleUpdateInstanceTransform}
                  onUpdateInstanceState={handleUpdateInstanceState}
                  onAddAssetToScene={(assetId) => handleAddAssetToScene(assetId)}
                  onDeleteInstance={handleDeleteInstance}
                />
              </aside>
            ))}
        </div>
      )}

      {/* Minimalist Notification Bubble 💡 & Click-to-Open Scientific Phenomenon AI Chat */}
      <LabPhenomenonAssistantBubble
        phenomenon={activePhenomenon}
        phenomenonHistory={phenomenonHistory}
        sceneSummaryContext={`Bài thực hành: ${activeExperiment.title}. Số liệu hiện tại: m = ${measuredMassG !== null ? `${measuredMassG} g` : 'chưa đo'}, V1 = ${initialVolumeCm3} cm³, V2 = ${finalVolumeCm3 !== null ? `${finalVolumeCm3} cm³` : 'chưa đo'}, ΔV = ${objectVolumeCm3 !== null ? `${objectVolumeCm3} cm³` : 'chưa đo'}, ρ = ${densityGCm3 !== null ? `${densityGCm3} g/cm³` : 'chưa tính'}. Số thiết bị trên bàn: ${scene.instances.filter((i) => i.visible).length}.`}
        isDarkMode={userRole === 'teacher' ? true : isDarkMode}
        onSelectHistoryPhenomenon={(item) => setActivePhenomenon(item)}
        onDismissBubble={() => setActivePhenomenon(null)}
      />

      {/* Student Help Modal */}
      {showStudentHelpModal && (
        <StudentHelpModal onClose={() => setShowStudentHelpModal(false)} />
      )}

      {/* Student Video Guide Modal */}
      {showVideoGuideModal && (
        <StudentVideoGuideModal
          onClose={() => setShowVideoGuideModal(false)}
          onRunAutoDemo={() => handleChangeStudentGuidedStep(3)}
        />
      )}

      {/* Student Equipment Detail Modal (Includes Real Photo, 3-Way Icon/3D/Photo View & Direct Product Parameter Editor) */}
      {studentDetailModalAsset && (
        <StudentEquipmentDetailModal
          asset={studentDetailModalAsset}
          initialEditMode={detailModalEditMode}
          onClose={() => {
            setStudentDetailModalAsset(null);
            setDetailModalEditMode(false);
          }}
          onAddToLab={(assetId) => {
            handleAddAssetToScene(assetId);
            if (studentScreen !== 'lab-room') {
              handleSelectStudentScreen('lab-room');
            }
          }}
          onSaveUpdatedAsset={(updatedAsset) => {
            const saved = htmlEquipmentModuleRegistry.updateAssetDefinition(
              updatedAsset.assetId,
              updatedAsset,
            );
            openLabAssetLoader.invalidateAssetCache(saved.assetId);
            setModuleRegistryRevision((r) => r + 1);
            setStudentDetailModalAsset(saved);
            setScene((prev) => {
              const draft = prev.instances.map((inst) =>
                inst.assetId === saved.assetId
                  ? {
                      ...inst,
                      assetVersion: saved.assetVersion,
                      customLabel: saved.name.vi,
                    }
                  : inst,
              );
              return {
                ...prev,
                sceneRevision: prev.sceneRevision + 1,
                updatedAt: new Date().toISOString(),
                instances: reconcileCumulativeLabMeasurements(draft),
              };
            });
            labSoundEngine.play('step-complete', 0.9);
            notify(
              `Đã cập nhật trực tiếp thông số sản phẩm "${saved.name.vi}" (${saved.assetId}) trên cả thư viện và bàn 3D!`,
              'success',
            );
          }}
          onOpenHtmlUpdaterForAsset={(targetAsset) => {
            setHtmlUpdaterTargetAsset(targetAsset);
            setShowHtmlModuleImporterModal(true);
          }}
          onOpenPhotoUpdaterForAsset={(targetAsset) => {
            setPhotoUpdaterTargetAsset(targetAsset);
          }}
          onDeleteAsset={handleDeleteCatalogAsset}
        />
      )}

      {/* Hộp thoại xác nhận trước khi xóa vĩnh viễn dụng cụ (Confirmation Dialog) */}
      {pendingDeleteAsset && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPendingDeleteAsset(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-equipment-title"
            className={`w-full max-w-md rounded-[16px] border-2 p-5 shadow-2xl space-y-4 ${
              isDarkMode
                ? 'bg-[#0F1E36] border-rose-500/70 text-white'
                : 'bg-white border-rose-400 text-[#09234C]'
            }`}
          >
            <div className="space-y-1.5">
              <h3
                id="confirm-delete-equipment-title"
                className="text-[16px] font-black text-rose-600 dark:text-rose-400"
              >
                Xác nhận xóa vĩnh viễn dụng cụ
              </h3>
              <p className="text-[14px] font-bold leading-relaxed">
                Bạn có chắc chắn muốn xóa vĩnh viễn dụng cụ này không?
              </p>
              <div
                className={`mt-2 px-3 py-2 rounded-[10px] border text-[12.5px] font-bold ${
                  isDarkMode
                    ? 'bg-[#091528] border-[#264B82] text-slate-200'
                    : 'bg-rose-50/70 border-rose-200 text-[#09234C]'
                }`}
              >
                <div>Tên dụng cụ: {pendingDeleteAsset.name.vi}</div>
                <div className="text-[11.5px] font-mono opacity-80">
                  Mã thiết bị: {pendingDeleteAsset.assetId}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPendingDeleteAsset(null)}
                className={`px-4 py-2 rounded-[10px] border text-[13px] font-extrabold cursor-pointer transition-colors ${
                  isDarkMode
                    ? 'bg-[#152A4A] hover:bg-[#1E3B68] border-[#2C528C] text-slate-200'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                }`}
              >
                Cancel (Hủy)
              </button>
              <button
                type="button"
                onClick={() =>
                  executePermanentDeleteCatalogAsset(pendingDeleteAsset)
                }
                className="px-4 py-2 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-extrabold cursor-pointer transition-colors shadow-sm"
              >
                OK (Đồng ý xóa vĩnh viễn)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cập nhật Hình ảnh Thực tế (240×240, 1:1 contain) cho từng Thiết bị */}
      {photoUpdaterTargetAsset && (
        <EquipmentRealPhotoUpdaterModal
          asset={photoUpdaterTargetAsset}
          onClose={() => setPhotoUpdaterTargetAsset(null)}
          onPhotoUpdated={(assetId, _dataUrlOrPath, caption) => {
            setModuleRegistryRevision((r) => r + 1);
            labSoundEngine.play('step-complete', 0.9);
            notify(
              `Đã cập nhật ảnh thực tế 240×240 cho "${caption}" (${assetId}) trong thư viện libraries3DLab!`,
              'success',
            );
          }}
          onSwitchToEditParams={(asset) => {
            setDetailModalEditMode(true);
            setStudentDetailModalAsset(asset);
          }}
          onSwitchToHtmlUpdater={(asset) => {
            setHtmlUpdaterTargetAsset(asset);
            setShowHtmlModuleImporterModal(true);
          }}
        />
      )}

      {/* HTML Equipment Module Importer Modal (.html child modules with Icon + 3D + Real Photo + In-Place Product Override) */}
      {showHtmlModuleImporterModal && (
        <HtmlModuleImporterModal
          targetAsset={htmlUpdaterTargetAsset}
          initialHtmlContent={initialImportHtmlData?.content ?? null}
          initialFileName={initialImportHtmlData?.fileName ?? null}
          onClose={() => {
            setShowHtmlModuleImporterModal(false);
            setHtmlUpdaterTargetAsset(null);
            setInitialImportHtmlData(null);
          }}
          onModuleImportedAndSpawn={(pkg, updatedExistingInPlace) => {
            openLabAssetLoader.invalidateAssetCache(pkg.asset.assetId);
            setModuleRegistryRevision((r) => r + 1);
            setSelectedCatalogAssetId(pkg.asset.assetId);

            if (updatedExistingInPlace) {
              const hasInstanceOnTable = scene.instances.some(
                (i) => i.assetId === pkg.asset.assetId && i.visible,
              );
              setScene((prev) => {
                const defaultCap = pkg.asset.scientificProperties.capacity
                  ? pkg.asset.scientificProperties.capacity.value * 0.5
                  : undefined;
                const ctrl = pkg.moduleControls;
                const draft = prev.instances.map((inst) =>
                  inst.assetId === pkg.asset.assetId
                    ? {
                        ...inst,
                        assetVersion: pkg.asset.assetVersion,
                        customLabel: pkg.asset.name.vi,
                        instanceState: {
                          ...inst.instanceState,
                          ...(defaultCap !== undefined
                            ? {
                                liquidLevelMl: defaultCap,
                                baseLiquidLevelMl: defaultCap,
                              }
                            : {}),
                          [ctrl.stateKey]: ctrl.defaultValue,
                        },
                      }
                    : inst,
                );
                return {
                  ...prev,
                  sceneRevision: prev.sceneRevision + 1,
                  updatedAt: new Date().toISOString(),
                  instances: reconcileCumulativeLabMeasurements(draft),
                };
              });

              if (!hasInstanceOnTable) {
                handleAddAssetToScene(pkg.asset.assetId, undefined, pkg.asset);
              }
              labSoundEngine.play('step-complete', 0.95);
              notify(
                `Đã cập nhật chính sản phẩm "${pkg.asset.name.vi}" (${pkg.asset.assetId}) bằng file .HTML thành công!`,
                'success',
              );
            } else {
              handleAddAssetToScene(pkg.asset.assetId, undefined, pkg.asset);
              labSoundEngine.play('step-complete', 0.95);
              notify(
                `Đã nạp thành công module .HTML "${pkg.asset.name.vi}" (Đầy đủ Icon + Vật 3D + Ảnh thật + Hồ sơ 5 nguồn) lên bàn thí nghiệm!`,
                'success',
              );
            }

            if (userRole === 'student' && studentScreen !== 'lab-room') {
              handleSelectStudentScreen('lab-room');
            }
            setInitialImportHtmlData(null);
          }}
        />
      )}

      {/* Cửa sổ Chọn Thiết Bị Từ Kho Thiết Bị Dùng Chung (`openlab_global_equipment`) cho mọi dự án */}
      {showGlobalEquipmentModal && (() => {
        const globalPackages =
          htmlEquipmentModuleRegistry.listGlobalEquipmentPackages();
        const customAiPackages = globalPackages.filter(
          (p) =>
            p.asset.assetId.startsWith('OL3D-AI-') ||
            (p.asset.provenance?.createdBy || '').toLowerCase().includes('ai'),
        );
        const q = globalEquipmentSearch.trim().toLowerCase();
        const displayedAssets: AssetDefinition[] = (
          globalEquipmentFilterTab === 'custom-only'
            ? globalPackages.map((p) => p.asset)
            : allAssets
        ).filter((a) => {
          if (!q) return true;
          return (
            a.name.vi.toLowerCase().includes(q) ||
            a.name.en.toLowerCase().includes(q) ||
            a.assetId.toLowerCase().includes(q) ||
            (a.summary || '').toLowerCase().includes(q)
          );
        });

        const currentProjectLabel =
          draftProjectName.trim() ||
          activePersonalProject?.title ||
          activeExperiment?.title ||
          'Dự án Phòng thí nghiệm 3D hiện tại';

        return (
          <div
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
            onClick={() => setShowGlobalEquipmentModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Kho Thiết Bị Dùng Chung Toàn Cục (openlab_global_equipment)"
              className={`w-full max-w-5xl max-h-[88vh] rounded-[18px] border-2 flex flex-col overflow-hidden shadow-2xl ${
                isDarkMode
                  ? 'bg-[#0B172A] border-[#38BDF8]/80 text-slate-100'
                  : 'bg-white border-[#1E6BFF] text-[#09234C]'
              }`}
            >
              {/* Header */}
              <div
                className={`px-5 py-4 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
                  isDarkMode
                    ? 'bg-[#0F223D] border-[#264B82]'
                    : 'bg-[#F0F7FF] border-[#C5DCFA]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#059669] text-white text-[11px] font-mono font-black uppercase tracking-wider">
                      GLOBAL STORAGE · openlab_global_equipment
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11.5px] font-extrabold border ${
                        isDarkMode
                          ? 'bg-[#152A4A] border-[#38BDF8]/60 text-[#7DD3FC]'
                          : 'bg-white border-[#9EC5F8] text-[#1E6BFF]'
                      }`}
                    >
                      Đích nhận: {currentProjectLabel}
                    </span>
                  </div>
                  <h2 className="text-[18px] sm:text-[20px] font-black tracking-tight">
                    Kho Thiết Bị Dùng Chung Toàn Cục (Tái sử dụng cho mọi dự án)
                  </h2>
                  <p
                    className={`text-[12.5px] font-semibold ${
                      isDarkMode ? 'text-slate-300' : 'text-[#3B5984]'
                    }`}
                  >
                    Mọi dụng cụ tự thiết kế đều được lưu độc lập trong{' '}
                    <code className="font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500">
                      openlab_global_equipment
                    </code>
                    . Bấm chọn bất kỳ dụng cụ nào để tự động spawn{' '}
                    <strong>Mô hình 3D + Trọn gói Bảng điều khiển</strong> (Thanh
                    trượt, Nút bật/tắt, Màn hình số) lên bàn thí nghiệm của dự án
                    hiện tại.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGlobalEquipmentModal(false);
                      handleSelectStudentScreen('explore-equipment');
                    }}
                    className="px-3 py-2 rounded-[10px] bg-[#1E6BFF] hover:bg-[#1557DB] text-white text-[12.5px] font-black flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>+ Thiết kế thêm dụng cụ mới</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGlobalEquipmentModal(false)}
                    className={`p-2 rounded-[10px] border cursor-pointer transition-colors ${
                      isDarkMode
                        ? 'bg-[#152A4A] hover:bg-rose-950/80 border-[#2C528C] text-slate-200'
                        : 'bg-white hover:bg-rose-50 border-[#C5DCFA] text-[#09234C]'
                    }`}
                    title="Đóng cửa sổ Kho thiết bị chung"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div
                className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
                  isDarkMode
                    ? 'bg-[#091528] border-[#1E3A63]'
                    : 'bg-[#F8FBFF] border-[#D8E8FF]'
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setGlobalEquipmentFilterTab('custom-only')}
                    className={`px-3 py-1.5 rounded-[9px] text-[12.5px] font-black border cursor-pointer transition-colors ${
                      globalEquipmentFilterTab === 'custom-only'
                        ? 'bg-[#059669] border-[#34D399] text-white shadow-2xs'
                        : isDarkMode
                          ? 'bg-[#132644] border-[#2C528C] text-slate-300 hover:text-white'
                          : 'bg-white border-[#C5DCFA] text-[#09234C] hover:bg-[#EAF3FF]'
                    }`}
                  >
                    📦 Kho Module &amp; Dụng cụ tự chế ({globalPackages.length}{' '}
                    thiết bị · {customAiPackages.length} AI tự tạo)
                  </button>

                  <button
                    type="button"
                    onClick={() => setGlobalEquipmentFilterTab('all')}
                    className={`px-3 py-1.5 rounded-[9px] text-[12.5px] font-black border cursor-pointer transition-colors ${
                      globalEquipmentFilterTab === 'all'
                        ? 'bg-[#1E6BFF] border-[#60A5FA] text-white shadow-2xs'
                        : isDarkMode
                          ? 'bg-[#132644] border-[#2C528C] text-slate-300 hover:text-white'
                          : 'bg-white border-[#C5DCFA] text-[#09234C] hover:bg-[#EAF3FF]'
                    }`}
                  >
                    🔬 Tất cả thiết bị trong Hệ thống ({allAssets.length})
                  </button>
                </div>

                <div className="relative flex-1 min-w-[220px] max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
                  <input
                    type="text"
                    value={globalEquipmentSearch}
                    onChange={(e) => setGlobalEquipmentSearch(e.target.value)}
                    placeholder="Tìm dụng cụ trong Kho chung (VD: đèn cồn, cốc, lực kế)..."
                    className={`w-full pl-9 pr-8 py-1.5 rounded-[9px] border text-[13px] font-bold focus:outline-none ${
                      isDarkMode
                        ? 'bg-[#0F1E36] border-[#2C528C] text-white placeholder:text-slate-400'
                        : 'bg-white border-[#9EC5F8] text-[#09234C] placeholder:text-slate-400'
                    }`}
                  />
                  {globalEquipmentSearch && (
                    <button
                      type="button"
                      onClick={() => setGlobalEquipmentSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Equipment Grid */}
              <div className="flex-1 overflow-y-auto p-5">
                {displayedAssets.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <p className="text-[15px] font-black">
                      Chưa tìm thấy dụng cụ phù hợp trong Kho Thiết Bị Chung.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowGlobalEquipmentModal(false);
                        handleSelectStudentScreen('explore-equipment');
                      }}
                      className="px-4 py-2.5 rounded-[10px] bg-[#059669] hover:bg-[#047857] text-white text-[13px] font-black inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Thiết kế dụng cụ 3D mới &amp; Lưu vào Kho chung</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {displayedAssets.map((asset) => {
                      const modPkg = htmlEquipmentModuleRegistry.getModule(
                        asset.assetId,
                      );
                      const customPhoto =
                        htmlEquipmentModuleRegistry.getUploadedRealPhoto(
                          asset.assetId,
                        );
                      const isAiCustom =
                        asset.assetId.startsWith('OL3D-AI-') ||
                        (asset.provenance?.createdBy || '')
                          .toLowerCase()
                          .includes('ai');
                      const countOnCurrentTable = scene.instances.filter(
                        (i) => i.assetId === asset.assetId && i.visible,
                      ).length;

                      return (
                        <article
                          key={asset.assetId}
                          className={`rounded-[14px] border-2 p-3.5 flex flex-col justify-between gap-3 transition-all ${
                            isAiCustom
                              ? isDarkMode
                                ? 'bg-[#0E243B] border-[#34D399]/80 hover:border-[#34D399]'
                                : 'bg-[#F0FDF4]/60 border-[#059669] hover:border-[#047857]'
                              : isDarkMode
                                ? 'bg-[#0F1E36] border-[#264B82] hover:border-[#38BDF8]'
                                : 'bg-white border-[#C5DCFA] hover:border-[#1E6BFF]'
                          }`}
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-16 h-16 rounded-[11px] border flex items-center justify-center shrink-0 overflow-hidden ${
                                  isDarkMode
                                    ? 'bg-[#081324] border-[#2C528C]'
                                    : 'bg-[#F3F8FF] border-[#C5DCFA]'
                                }`}
                              >
                                {customPhoto ? (
                                  <img
                                    src={customPhoto}
                                    alt={asset.name.vi}
                                    className="w-full h-full object-contain p-1"
                                  />
                                ) : (
                                  <EquipmentThumbnailSvg
                                    assetId={asset.assetId}
                                    archetype={
                                      asset.geometry.proceduralArchetype
                                    }
                                    className="w-12 h-12"
                                  />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
                                      isAiCustom
                                        ? 'bg-[#059669] text-white'
                                        : 'bg-[#1E6BFF]/20 text-[#38BDF8] border border-[#38BDF8]/40'
                                    }`}
                                  >
                                    {isAiCustom
                                      ? '✨ TỰ CHẾ / KHO CHUNG'
                                      : '📦 MODULE KHO CHUNG'}
                                  </span>
                                  {countOnCurrentTable > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-400 text-[10px] font-extrabold">
                                      Đang có {countOnCurrentTable} trên bàn
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-[14.5px] font-black leading-snug">
                                  {asset.name.vi}
                                </h3>
                                <p className="text-[11px] font-mono opacity-75 mt-0.5">
                                  Mã: {asset.assetId} · Cao{' '}
                                  {asset.geometry.dimensions.height.value}{' '}
                                  {asset.geometry.dimensions.height.unit}
                                </p>
                              </div>
                            </div>

                            {/* Thông tin trọn gói Bảng điều khiển (Control Panel Bundle) */}
                            {modPkg ? (
                              <div
                                className={`px-2.5 py-2 rounded-[9px] border text-[11.5px] font-bold flex items-start gap-2 ${
                                  isDarkMode
                                    ? 'bg-[#071526] border-[#00BCEB]/55 text-[#7DD3FC]'
                                    : 'bg-[#EFF6FF] border-[#93C5FD] text-[#0D3B8C]'
                                }`}
                              >
                                <Sliders className="w-3.5 h-3.5 text-[#00BCEB] shrink-0 mt-0.5" />
                                <div>
                                  <div className="font-extrabold">
                                    🎛️ Bảng điều khiển đi kèm:{' '}
                                    {modPkg.moduleControls.label}
                                  </div>
                                  <div className="font-mono text-[11px] opacity-90">
                                    Dải đo: {modPkg.moduleControls.min} →{' '}
                                    {modPkg.moduleControls.max}{' '}
                                    {modPkg.moduleControls.unit} (Mặc định:{' '}
                                    {modPkg.moduleControls.defaultValue}{' '}
                                    {modPkg.moduleControls.unit}) + Nút bật/tắt
                                    &amp; Màn hình số
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div
                                className={`px-2.5 py-1.5 rounded-[9px] border text-[11.5px] font-semibold ${
                                  isDarkMode
                                    ? 'bg-[#091528] border-[#264B82] text-slate-300'
                                    : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                🎛️ Kèm bộ nút điều khiển tương tác 3D chuẩn theo
                                SGK
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const savedPatch =
                                  htmlEquipmentModuleRegistry.getDefaultStatePatch(
                                    asset.assetId,
                                  );
                                handleAddAssetToScene(
                                  asset.assetId,
                                  undefined,
                                  asset,
                                  savedPatch,
                                );
                                setShowGlobalEquipmentModal(false);
                              }}
                              className="flex-1 py-2 px-3 rounded-[9px] bg-[#059669] hover:bg-[#047857] text-white text-[12px] font-black flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                              title="Đưa mô hình 3D kèm trọn gói Bảng điều khiển lên bàn thí nghiệm của dự án này và đóng cửa sổ"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3] shrink-0" />
                              <span>Chọn &amp; Đưa vào bàn 3D</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const savedPatch =
                                  htmlEquipmentModuleRegistry.getDefaultStatePatch(
                                    asset.assetId,
                                  );
                                handleAddAssetToScene(
                                  asset.assetId,
                                  undefined,
                                  asset,
                                  savedPatch,
                                );
                              }}
                              className={`py-2 px-2.5 rounded-[9px] border text-[12px] font-extrabold cursor-pointer transition-colors ${
                                isDarkMode
                                  ? 'bg-[#152A4A] hover:bg-[#1E3B68] border-[#38BDF8]/70 text-[#7DD3FC]'
                                  : 'bg-[#F0F7FF] hover:bg-[#DBEAFE] border-[#1E6BFF] text-[#09234C]'
                              }`}
                              title="Thêm tiếp 1 bản sao nữa của thiết bị này lên bàn thí nghiệm mà không đóng cửa sổ"
                            >
                              + Thêm nữa
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Teacher Overview & Governance Modal */}
      {governanceModalMode && (
        <GovernanceOverviewModal
          mode={governanceModalMode}
          assets={allAssets}
          kits={kits}
          environments={environments}
          onClose={() => {
            setGovernanceModalMode(null);
            setActiveNavSection('lab-workspace');
          }}
          onSelectAssetAndInspect={(assetId) => {
            handleSelectCatalogAsset(assetId);
            setIsRightPanelCollapsed(false);
          }}
        />
      )}

      {/* Sơ đồ Mạng Nơ-ron Thần kinh Thiết bị KHTN THCS & Causal Studio Modal */}
      <NeuralDeviceNetworkModal
        isOpen={showNeuralNetworkModal}
        initialDeviceId={neuralModalTargetDeviceId}
        onClose={() => {
          setShowNeuralNetworkModal(false);
          setNeuralModalTargetDeviceId(null);
        }}
        onSelectDevice={(deviceId) => {
          const node = neuralConnectionEngine.getNode(deviceId);
          const targetAssetId = node?.assetId || deviceId;
          if (userRole === 'student' && studentScreen !== 'lab-room') {
            setStudentScreen('lab-room');
          }
          handleAddAssetToScene(targetAssetId);
          setShowNeuralNetworkModal(false);
          notify(
            `Đã nạp "${node?.nameVi || targetAssetId}" vào bàn thí nghiệm 3D`,
            'success',
          );
        }}
        onTriggerMacroCluster={(cluster) => {
          if (userRole === 'student' && studentScreen !== 'lab-room') {
            setStudentScreen('lab-room');
          }
          cluster.deviceIds.forEach((devSlug) => {
            const node = neuralConnectionEngine.getNode(devSlug);
            if (node) {
              handleAddAssetToScene(node.assetId);
            }
          });
          setShowNeuralNetworkModal(false);
          notify(
            `Đã nạp trọn bộ bài thực hành "${cluster.title}" lên bàn 3D`,
            'success',
          );
        }}
        activeSceneDeviceIds={scene.instances.map((i) => i.assetId)}
      />
    </div>
  );
}
