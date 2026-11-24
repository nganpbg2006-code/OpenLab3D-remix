import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  AssetDefinition,
  EquipmentCategoryId,
  SceneInstance,
  ScienceSubject,
} from '../../domain/types';
import {
  htmlEquipmentModuleRegistry,
  HtmlEquipmentModulePackage,
} from '../../three-runtime/HtmlEquipmentModuleRegistry';
import {
  AiClarificationCheckResult,
  AiClarificationMemoryItem,
  AiEquipmentBlueprint,
  AiEquipmentInputSpec,
  AiEquipmentShapeFamily,
  AiGeneratedPartSpec,
  AiImageVisionTelemetry,
  PARAMETRIC_3D_TEMPLATES,
  analyzeImagePixelsOnCanvas,
  buildHtmlModuleFromBlueprint,
  classifyEquipmentShapeByKeywords,
  evaluateEquipmentClarificationNeed,
  getParametricTemplateById,
  generateAiEquipmentDesign,
} from '../../services/aiEquipmentBuilderService';
import { EquipmentThumbnailSvg } from '../common/EquipmentThumbnailSvg';
import {
  Home,
  FolderOpen,
  Upload,
  Sparkles,
  Check,
  Pencil,
  RotateCcw,
  Eye,
  Code2,
  Box,
  Layers,
  Sliders,
  Trash2,
  Play,
  Send,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  MessageSquare,
  Compass,
} from 'lucide-react';

interface StudentAiEquipmentDesignerViewProps {
  assets: AssetDefinition[];
  isDarkMode?: boolean;
  onBackToHomeDashboard: () => void;
  onOpenProjectManager: () => void;
  onOpen3DWorkbench: () => void;
  onConfirmAndAddToProject: (
    pkg: HtmlEquipmentModulePackage,
    initialStatePatch?: Partial<SceneInstance['instanceState']>,
  ) => void;
  onAddExistingAssetToLab: (assetId: string) => void;
  onInspectExistingAsset: (asset: AssetDefinition) => void;
  onDeleteExistingAsset?: (asset: AssetDefinition) => void;
}

export const StudentAiEquipmentDesignerView: React.FC<
  StudentAiEquipmentDesignerViewProps
> = ({
  assets,
  isDarkMode = false,
  onBackToHomeDashboard,
  onOpenProjectManager,
  onOpen3DWorkbench,
  onConfirmAndAddToProject,
  onAddExistingAssetToLab,
  onInspectExistingAsset,
  onDeleteExistingAsset,
}) => {
  // Chuyển đổi giữa khu vực Tự thiết kế AI và Kho dụng cụ đã lưu
  const [activeSubTab, setActiveSubTab] = useState<'ai-studio' | 'saved-library'>(
    'ai-studio',
  );

  // Bước 1: State nhập thông tin & hình ảnh — ĐỂ TRỐNG HOÀN TOÀN (BLANK FIELDS) KHI MỞ LÊN
  const [selectedTemplateId, setSelectedTemplateId] = useState<
    AiEquipmentShapeFamily | ''
  >('');
  const [nameVi, setNameVi] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [subject, setSubject] = useState<ScienceSubject>('physics');
  const [showHeatedTubeDemo, setShowHeatedTubeDemo] = useState<boolean>(false);
  const [heightCm, setHeightCm] = useState<string>('');
  const [widthCm, setWidthCm] = useState<string>('');
  const [depthCm, setDepthCm] = useState<string>('');
  const [massG, setMassG] = useState<string>('');
  const [focalLengthCm, setFocalLengthCm] = useState<string>('');
  const [capacityMl, setCapacityMl] = useState<string>('');
  const [material, setMaterial] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [operationPrompt, setOperationPrompt] = useState<string>('');
  const [referenceUrl, setReferenceUrl] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<
    Array<{ id: string; name: string; dataUrl: string }>
  >([]);
  const [detectedImagePrimaryHex, setDetectedImagePrimaryHex] = useState<
    string | null
  >(null);
  const [detectedImageSecondaryHex, setDetectedImageSecondaryHex] = useState<
    string | null
  >(null);
  const [detectedImageAccentHex, setDetectedImageAccentHex] = useState<
    string | null
  >(null);
  const [detectedImageVisionTelemetry, setDetectedImageVisionTelemetry] =
    useState<AiImageVisionTelemetry | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const primaryUploadedImage = uploadedImages[0] ?? null;
  const uploadedImageDataUrl = primaryUploadedImage?.dataUrl ?? null;
  const uploadedImageName = primaryUploadedImage?.name ?? '';

  // Bộ nhận diện hình học tự động theo thời gian thực (Cylinder vs. Box) từ Tên dụng cụ & Mô tả ngoại hình
  const liveShapeClassification = classifyEquipmentShapeByKeywords(
    nameVi,
    description,
    selectedTemplateId,
  );

  // Bước 2 & 3: State Hỏi đáp làm rõ (Clarification) + Phác thảo cấu trúc 2D (2D Sketch) + Live Preview 3D
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [clarificationCheck, setClarificationCheck] =
    useState<AiClarificationCheckResult | null>(null);
  const [clarificationMemory, setClarificationMemory] = useState<
    AiClarificationMemoryItem[]
  >([]);
  const [clarificationInput, setClarificationInput] = useState<string>('');
  const [is2DSketchApproved, setIs2DSketchApproved] = useState<boolean>(false);
  const [generatedBlueprint, setGeneratedBlueprint] =
    useState<AiEquipmentBlueprint | null>(null);
  const [generatedHtmlSource, setGeneratedHtmlSource] = useState<string>('');
  const [generatedPackage, setGeneratedPackage] =
    useState<HtmlEquipmentModulePackage | null>(null);
  const [previewMode, setPreviewMode] = useState<
    'clarification' | 'sketch-2d' | '3d' | 'code' | 'specs'
  >('sketch-2d');
  const [liveControlValue, setLiveControlValue] = useState<number>(1.2);
  const [autoRotate3D, setAutoRotate3D] = useState<boolean>(false);

  // Bước 4: State Yêu cầu AI chỉnh sửa thêm & Xác nhận
  const [showRefinementBox, setShowRefinementBox] = useState<boolean>(true);
  const [refinementInput, setRefinementInput] = useState<string>('');
  const [isRefiningModel, setIsRefiningModel] = useState<boolean>(false);
  const [refinementHistory, setRefinementHistory] = useState<string[]>([]);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const refinementInputRef = useRef<HTMLInputElement | null>(null);
  const clarificationInputRef = useRef<HTMLInputElement | null>(null);

  // Refs cho Three.js Live Preview Canvas
  const previewMountRef = useRef<HTMLDivElement | null>(null);
  const liveEquipmentGroupRef = useRef<THREE.Group | null>(null);
  const livePkgRef = useRef<HtmlEquipmentModulePackage | null>(null);

  // State & Ref cho tính năng Chỉnh tay tương tác (Drag, Resize & Edit) trên Bản phác thảo 2D
  const svg2DRef = useRef<SVGSVGElement | null>(null);
  const [selected2DPartIndex, setSelected2DPartIndex] = useState<number>(0);
  const [drag2DState, setDrag2DState] = useState<{
    partIndex: number;
    mode:
      | 'move'
      | 'resize-top'
      | 'resize-bottom'
      | 'resize-left'
      | 'resize-right'
      | 'resize-corner';
    startClientX: number;
    startClientY: number;
    initialPart: AiGeneratedPartSpec;
    initialHeightCm: number;
    initialWidthCm: number;
    initialDepthCm: number;
  } | null>(null);

  // Gắn sự kiện cho các nút gợi ý (Chips): tự động điền hoặc cộng dồn vào ô input chỉnh sửa
  const handleSelectRefinementChip = (chipText: string) => {
    const cleanedChip = chipText.replace(/^\+\s*/, '').trim();
    setRefinementInput((prev) => {
      const current = prev.trim();
      if (!current) return cleanedChip;
      if (current.toLowerCase().includes(cleanedChip.toLowerCase())) {
        return current;
      }
      return `${current}, ${cleanedChip}`;
    });
    setTimeout(() => {
      refinementInputRef.current?.focus();
    }, 10);
  };

  // Xử lý tải nhiều ảnh thực tế / bản vẽ phác thảo của dụng cụ (lưu vào mảng + trích xuất màu vỏ thiết bị)
  const handleImageUploadChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const selectedFiles = Array.from(fileList);
    const validImageFiles = selectedFiles.filter((file) =>
      file.type.startsWith('image/'),
    );

    if (validImageFiles.length === 0) {
      setStatusBanner('Vui lòng chọn tệp hình ảnh (PNG, JPG, WEBP, SVG).');
      e.target.value = '';
      return;
    }

    const processSingleFile = (
      file: File,
      isFirstImage: boolean,
    ): Promise<{ id: string; name: string; dataUrl: string }> =>
      new Promise((resolve) => {
        const uniqueId = `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            const rawDataUrl = reader.result;
            const img = new Image();
            img.onload = () => {
              const maxDim = 800;
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
                if (isFirstImage) {
                  try {
                    const toHex = (r: number, g: number, b: number) =>
                      `#${[r, g, b]
                        .map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0'))
                        .join('')
                        .toUpperCase()}`;

                    // Lấy mẫu vùng trung tâm thân dụng cụ (Primary Body Color)
                    const bodyData = ctx.getImageData(
                      Math.floor(w * 0.25),
                      Math.floor(h * 0.30),
                      Math.max(1, Math.floor(w * 0.50)),
                      Math.max(1, Math.floor(h * 0.40)),
                    ).data;
                    let rSum = 0, gSum = 0, bSum = 0, count = 0;
                    let maxSat = -1;
                    let accR = 217, accG = 119, accB = 6;

                    for (let i = 0; i < bodyData.length; i += 16) {
                      const r = bodyData[i];
                      const g = bodyData[i + 1];
                      const b = bodyData[i + 2];
                      const a = bodyData[i + 3];
                      if (a < 128) continue;
                      // Bỏ qua nền trắng tinh hoặc đen tuyền ở rìa
                      if (r > 242 && g > 242 && b > 242) continue;
                      rSum += r;
                      gSum += g;
                      bSum += b;
                      count++;

                      const maxC = Math.max(r, g, b);
                      const minC = Math.min(r, g, b);
                      const sat = maxC > 0 ? (maxC - minC) / maxC : 0;
                      if (sat > maxSat && maxC > 60 && minC < 220) {
                        maxSat = sat;
                        accR = r;
                        accG = g;
                        accB = b;
                      }
                    }

                    if (count > 8) {
                      const rAvg = Math.round(rSum / count);
                      const gAvg = Math.round(gSum / count);
                      const bAvg = Math.round(bSum / count);
                      setDetectedImagePrimaryHex(toHex(rAvg, gAvg, bAvg));
                      setDetectedImageSecondaryHex(
                        toHex(rAvg * 0.65, gAvg * 0.65, bAvg * 0.68),
                      );
                      if (maxSat > 0.25) {
                        setDetectedImageAccentHex(toHex(accR, accG, accB));
                      }
                    } else {
                      setDetectedImagePrimaryHex('#334155');
                      setDetectedImageSecondaryHex('#1E293B');
                    }

                    // Phân tích đa thành phần từ ảnh thực tế (True AI Vision Multi-Part Telemetry: N-S poles, U-shape, Ring, Slice Profiles)
                    const visionTelemetry = analyzeImagePixelsOnCanvas(
                      ctx,
                      w,
                      h,
                      file.name,
                    );
                    setDetectedImageVisionTelemetry(visionTelemetry);
                    if (visionTelemetry.isBipolarMagnetImage) {
                      setDetectedImagePrimaryHex(visionTelemetry.redPoleHex);
                      setDetectedImageSecondaryHex(visionTelemetry.bluePoleHex);
                    }
                  } catch {
                    setDetectedImagePrimaryHex('#334155');
                    setDetectedImageSecondaryHex('#1E293B');
                  }
                }
                resolve({
                  id: uniqueId,
                  name: file.name,
                  dataUrl: canvas.toDataURL('image/jpeg', 0.86),
                });
                return;
              }
              resolve({ id: uniqueId, name: file.name, dataUrl: rawDataUrl });
            };
            img.onerror = () => {
              resolve({ id: uniqueId, name: file.name, dataUrl: rawDataUrl });
            };
            img.src = rawDataUrl;
          }
        };
        reader.readAsDataURL(file);
      });

    const processedImages = await Promise.all(
      validImageFiles.map((file, idx) =>
        processSingleFile(file, uploadedImages.length === 0 && idx === 0),
      ),
    );

    setUploadedImages((prev) => [...prev, ...processedImages]);
    e.target.value = '';
  };

  // Xóa từng ảnh khỏi danh sách đã chọn
  const handleRemoveSingleImage = (imageId: string) => {
    setUploadedImages((prev) => {
      const next = prev.filter((item) => item.id !== imageId);
      if (next.length === 0) {
        setDetectedImageVisionTelemetry(null);
      }
      return next;
    });
  };

  // Xóa toàn bộ danh sách ảnh đã chọn
  const handleClearAllImages = () => {
    setUploadedImages([]);
    setDetectedImagePrimaryHex(null);
    setDetectedImageSecondaryHex(null);
    setDetectedImageAccentHex(null);
    setDetectedImageVisionTelemetry(null);
  };

  const parseDecimalNumber = (raw: string, fallback: number): number => {
    const cleaned = raw.trim().replace(',', '.');
    if (!cleaned) return fallback;
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };

  const parseOptionalDecimal = (raw: string): number | null => {
    const cleaned = raw.trim().replace(',', '.');
    if (!cleaned) return null;
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  };

  /**
   * Xử lý khi người dùng trả lời câu hỏi làm rõ của AI:
   * Lưu câu trả lời vào bộ nhớ tạm (clarificationMemory), đồng bộ thông số nếu có,
   * rồi chuyển sang lập Bản phác thảo cấu trúc 2D.
   */
  const handleSubmitClarificationAnswer = async (overrideAnswer?: string) => {
    const answerText = (
      overrideAnswer !== undefined ? overrideAnswer : clarificationInput
    ).trim();
    if (!answerText) return;

    const currentQuestion =
      clarificationCheck?.aiQuestionMessage ||
      'AI chưa rõ chi tiết cấu tạo & thông số dụng cụ, bạn có thể bổ sung thêm giúp mình được không?';

    const newEntry: AiClarificationMemoryItem = {
      question: currentQuestion,
      answer: answerText,
      timestamp: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const nextMemory = [...clarificationMemory, newEntry];
    setClarificationMemory(nextMemory);
    setClarificationInput('');
    setClarificationCheck(null);

    // Tự động trích xuất kích thước nếu người dùng nhập trong câu trả lời làm rõ (VD: "Cao 16 cm, rộng 10 cm")
    const hFound = answerText.match(
      /(?:chiều\s*cao|cao)\s*(?:là|=|:)?\s*(\d+(?:[.,]\d+)?)\s*(?:cm)?/i,
    );
    if (hFound && !heightCm.trim()) {
      setHeightCm(hFound[1].replace(',', '.'));
    }
    const wFound = answerText.match(
      /(?:chiều\s*rộng|rộng|đường\s*kính|ngang)\s*(?:là|=|:)?\s*(\d+(?:[.,]\d+)?)\s*(?:cm)?/i,
    );
    if (wFound && !widthCm.trim()) {
      setWidthCm(wFound[1].replace(',', '.'));
    }
    const dFound = answerText.match(
      /(?:bề\s*dày|chiều\s*sâu|dày|sâu)\s*(?:là|=|:)?\s*(\d+(?:[.,]\d+)?)\s*(?:cm)?/i,
    );
    if (dFound && !depthCm.trim()) {
      setDepthCm(dFound[1].replace(',', '.'));
    }

    await handleRunAiBuild(false, undefined, nextMemory, true);
  };

  /**
   * Bước 2: Gọi AI kiểm tra độ rõ ràng (Clarification Step) -> Lập Bản phác thảo cấu trúc 2D
   * (Tuyệt đối chưa tự ý render 3D nếu người dùng chưa bấm nút xác nhận phác thảo 2D)
   */
  const handleRunAiBuild = async (
    isRefinement = false,
    customRefineText?: string,
    overrideMemory?: AiClarificationMemoryItem[],
    skipClarificationGate = false,
  ) => {
    const activeMemory = overrideMemory ?? clarificationMemory;

    // 1. KIỂM TRA ĐỘ RÕ RÀNG CỦA THÔNG TIN (CLARIFICATION STEP):
    // Nếu thông tin chưa đủ hoặc có điểm mơ hồ và chưa qua bước hỏi đáp làm rõ -> Dừng lại hỏi người dùng ngay!
    if (!isRefinement && !skipClarificationGate) {
      const checkResult = evaluateEquipmentClarificationNeed({
        templateId: selectedTemplateId,
        nameVi,
        heightCmRaw: heightCm,
        widthCmRaw: widthCm,
        depthCmRaw: depthCm,
        focalLengthRaw: focalLengthCm,
        capacityMlRaw: capacityMl,
        materialRaw: material,
        appearanceRaw: description,
        operationRaw: operationPrompt,
        referenceUrlRaw: referenceUrl,
        uploadedImagesCount: uploadedImages.length,
        clarificationMemory: activeMemory,
      });

      if (checkResult.needsClarification) {
        setClarificationCheck(checkResult);
        setIs2DSketchApproved(false);
        setPreviewMode('clarification');
        setStatusBanner(
          'AI phát hiện thông tin dụng cụ còn điểm chưa rõ ràng. Vui lòng trả lời câu hỏi làm rõ của AI ở khung bên phải trước khi lập phác thảo 2D!',
        );
        setTimeout(() => {
          clarificationInputRef.current?.focus();
        }, 40);
        return;
      }
    }

    const fallbackNameFromImage = uploadedImageName
      ? uploadedImageName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ')
      : '';
    const chosenTemplateDef = selectedTemplateId
      ? getParametricTemplateById(selectedTemplateId)
      : null;
    const decodedRefUrlHint = referenceUrl.trim()
      ? (() => {
          try {
            return decodeURIComponent(referenceUrl.trim())
              .replace(/[-_/+=&?.:]+/g, ' ')
              .toLowerCase();
          } catch {
            return referenceUrl
              .trim()
              .replace(/[-_/+=&?.:]+/g, ' ')
              .toLowerCase();
          }
        })()
      : '';
    const memoryAnswersJoined = activeMemory
      .map((m) => m.answer.trim())
      .filter(Boolean)
      .join('. ');
    const promptHintLower =
      `${description} ${operationPrompt} ${memoryAnswersJoined} ${decodedRefUrlHint}`.toLowerCase();
    const fallbackNameFromPrompts = chosenTemplateDef
      ? chosenTemplateDef.shortLabelVi
      : promptHintLower.includes('nam châm chữ u') ||
          promptHintLower.includes('nam cham chu u') ||
          promptHintLower.includes('móng ngựa')
        ? 'Nam châm vĩnh cửu chữ U (N - S)'
        : promptHintLower.includes('nam châm') ||
            promptHintLower.includes('nam cham') ||
            promptHintLower.includes('magnet') ||
            detectedImageVisionTelemetry?.isBipolarMagnetImage
          ? 'Thanh nam châm vĩnh cửu (Cực Bắc N - Cực Nam S)'
          : promptHintLower.includes('la bàn') ||
              promptHintLower.includes('la ban') ||
              promptHintLower.includes('kim nam châm')
            ? 'La bàn từ trường thí nghiệm'
            : promptHintLower.includes('cuộn dây') ||
                promptHintLower.includes('ống dây')
              ? 'Cuộn dây cảm ứng điện từ'
              : promptHintLower.includes('đèn cồn') ||
                  promptHintLower.includes('den con') ||
                  promptHintLower.includes('bunsen')
                ? 'Đèn cồn thí nghiệm'
                : promptHintLower.includes('biến trở') ||
                    promptHintLower.includes('bien tro')
                  ? 'Biến trở con chạy'
                  : promptHintLower.includes('vôn kế') ||
                      promptHintLower.includes('von ke')
                    ? 'Vôn kế phòng thí nghiệm'
                    : promptHintLower.includes('ampe')
                      ? 'Ampe kế phòng thí nghiệm'
                      : promptHintLower.includes('ống nghiệm') ||
                          promptHintLower.includes('ong nghiem')
                        ? 'Ống nghiệm thủy tinh'
                        : promptHintLower.includes('cốc') ||
                            promptHintLower.includes('ống đong') ||
                            promptHintLower.includes('ong dong')
                          ? 'Ống đong chia độ'
                          : 'Dụng cụ thí nghiệm 3D';
    const cleanedName =
      nameVi.trim() || fallbackNameFromImage.trim() || fallbackNameFromPrompts;
    setIsAiGenerating(true);
    if (isRefinement) {
      setIsRefiningModel(true);
    }
    setStatusBanner(null);

    const activeRefinePrompt =
      customRefineText !== undefined
        ? customRefineText.trim()
        : isRefinement
          ? refinementInput.trim()
          : '';

    // NẾU ĐÃ CÓ BẢN PHÁC THẢO 2D (generatedBlueprint) VÀ NGƯỜI DÙNG BẤM [CẬP NHẬT LẠI]:
    // Thực thi bộ bóc tách từ khóa (Keyword Parsing) & cập nhật dữ liệu thời gian thực (State Mutation)
    // trực tiếp trên mảng cấu trúc phác thảo 2D + thông số kích thước + màu sắc/vật liệu và re-render tức thì!
    if (isRefinement && generatedBlueprint && activeRefinePrompt) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 140));
        executeRefinementCommandOnBlueprint(activeRefinePrompt);
        setRefinementHistory((prev) => [
          activeRefinePrompt,
          ...prev.filter((item) => item !== activeRefinePrompt).slice(0, 4),
        ]);
        setRefinementInput('');
      } finally {
        setIsAiGenerating(false);
        setIsRefiningModel(false);
      }
      return;
    }

    const combinedHint =
      `${cleanedName} ${description} ${operationPrompt} ${memoryAnswersJoined} ${decodedRefUrlHint} ${material} ${activeRefinePrompt}`.toLowerCase();

    const isMagnetHint =
      selectedTemplateId === 'permanent-magnet' ||
      combinedHint.includes('nam châm') ||
      combinedHint.includes('nam cham') ||
      combinedHint.includes('magnet') ||
      combinedHint.includes('cực bắc') ||
      combinedHint.includes('cực nam') ||
      Boolean(detectedImageVisionTelemetry?.isBipolarMagnetImage);
    const isUMagnetHint =
      isMagnetHint &&
      (combinedHint.includes('chữ u') ||
        combinedHint.includes('chu u') ||
        combinedHint.includes('móng ngựa') ||
        combinedHint.includes('horseshoe') ||
        detectedImageVisionTelemetry?.detectedTopology === 'u-magnet' ||
        detectedImageVisionTelemetry?.detectedTopology === 'u-shape');
    const isCompassHint =
      selectedTemplateId === 'magnetic-compass' ||
      combinedHint.includes('la bàn') ||
      combinedHint.includes('la ban') ||
      combinedHint.includes('kim nam châm') ||
      combinedHint.includes('compass');

    const defaultH = isMagnetHint
      ? isUMagnetHint
        ? 14
        : 5
      : isCompassHint
        ? 4
        : 16;
    const defaultW = isMagnetHint
      ? isUMagnetHint
        ? 11
        : 18
      : isCompassHint
        ? 10
        : 12;
    const defaultD = isMagnetHint ? 4.5 : isCompassHint ? 10 : 10;

    const baseHeightFallback =
      generatedPackage?.asset.geometry.dimensions.height.value ?? defaultH;
    const baseWidthFallback =
      generatedPackage?.asset.geometry.dimensions.widthOrDiameter.value ??
      defaultW;
    const baseDepthFallback =
      generatedPackage?.asset.geometry.dimensions.depth?.value ?? defaultD;

    let nextHeight = parseDecimalNumber(heightCm, baseHeightFallback);
    let nextWidth = parseDecimalNumber(widthCm, baseWidthFallback);
    let nextDepth = parseDecimalNumber(depthCm, baseDepthFallback);
    const nextMass = parseDecimalNumber(massG, 200);

    const parsedFocal = parseOptionalDecimal(focalLengthCm);
    const parsedCap = parseOptionalDecimal(capacityMl);

    // NGHIÊM CẤM GÁN NHẦM ĐÈN CỒN: chỉ nhận diện khi người dùng chọn rõ 'alcohol-burner' hoặc gõ 'đèn cồn'/'bunsen'
    const isThermalBurnerHint =
      !isMagnetHint &&
      !isCompassHint &&
      (selectedTemplateId === 'alcohol-burner' ||
        combinedHint.includes('đèn cồn') ||
        combinedHint.includes('den con') ||
        combinedHint.includes('bunsen'));

    const isExplicitOpticalHint =
      selectedTemplateId === 'optical-lens' ||
      selectedTemplateId === 'optical-prism' ||
      selectedTemplateId === 'laser-source' ||
      combinedHint.includes('thấu kính') ||
      combinedHint.includes('lăng kính') ||
      combinedHint.includes('tia laser') ||
      combinedHint.includes('quang học');

    const resolvedCategory: EquipmentCategoryId =
      (category as EquipmentCategoryId) ||
      (chosenTemplateDef
        ? chosenTemplateDef.defaultCategory
        : isMagnetHint || isCompassHint
          ? 'electrical-circuit'
          : isThermalBurnerHint
            ? 'thermal-equipment'
            : isExplicitOpticalHint
              ? 'optical-equipment'
              : parsedCap !== null && parsedCap > 0
                ? 'volume-measurement'
                : 'measuring-instrument');

    const combinedAppearanceWithMemory = [
      description.trim(),
      memoryAnswersJoined ? `Thông tin làm rõ bổ sung: ${memoryAnswersJoined}` : '',
    ]
      .filter(Boolean)
      .join('. ');

    const activeShapeClass = classifyEquipmentShapeByKeywords(
      cleanedName,
      combinedAppearanceWithMemory,
      selectedTemplateId,
    );

    // Nếu nhận diện là Cylinder (Hình trụ tròn): ẩn chiều sâu/bề dày, chỉ dùng Chiều cao & Đường kính (depth = width)
    if (activeShapeClass.shapeType === 'Cylinder') {
      nextDepth = nextWidth;
    }

    const spec: AiEquipmentInputSpec = {
      templateId: selectedTemplateId || undefined,
      baseShapeType: activeShapeClass.shapeType,
      nameVi: cleanedName,
      category: resolvedCategory,
      subject,
      heightCm: nextHeight,
      widthCm: nextWidth,
      depthCm: nextDepth,
      massG: nextMass,
      focalLengthCm: isExplicitOpticalHint ? parsedFocal : null,
      capacityMl: parsedCap,
      rangeMax: parsedCap || 100,
      leastCount: 0.1,
      unitLabel: isMagnetHint
        ? 'mT'
        : isCompassHint
          ? '°'
          : isThermalBurnerHint
            ? '°C'
            : parsedCap
              ? 'ml'
              : isExplicitOpticalHint && parsedFocal
                ? 'cm'
                : 'đơn vị',
      material:
        material.trim() ||
        (isMagnetHint
          ? 'Hợp kim từ cứng AlNiCo / Neodymium (NdFeB) sơn tĩnh điện Đỏ (N) – Xanh (S)'
          : 'Hợp kim Kim loại, Thủy tinh Borosilicate & Nhựa kỹ thuật ABS'),
      description: combinedAppearanceWithMemory,
      appearancePrompt: combinedAppearanceWithMemory,
      operationPrompt: operationPrompt.trim(),
      referenceUrl: referenceUrl.trim() || undefined,
      imageDataUrl: uploadedImageDataUrl,
      imageDataUrls: uploadedImages.map((img) => img.dataUrl),
      detectedImagePrimaryHex,
      detectedImageSecondaryHex,
      detectedImageAccentHex,
      imageVisionTelemetry: detectedImageVisionTelemetry,
      refinementPrompt: activeRefinePrompt || undefined,
      clarificationMemory: activeMemory,
    };

    try {
      const result = await generateAiEquipmentDesign(
        spec,
        isRefinement ? generatedBlueprint : null,
      );

      const pkg = htmlEquipmentModuleRegistry.parseHtmlModule(
        result.rawHtmlModule,
      );

      setGeneratedBlueprint({ ...result.blueprint });
      setGeneratedHtmlSource(result.rawHtmlModule);
      setGeneratedPackage({ ...pkg });
      livePkgRef.current = pkg;
      setLiveControlValue(result.blueprint.controlDefault);
      setClarificationCheck(null);
      setShowRefinementBox(true);

      // BẮT BUỘC DỪNG Ở BƯỚC XÁC NHẬN BẢN PHÁC THẢO 2D TRƯỚC KHI RENDER 3D
      setIs2DSketchApproved(false);
      setPreviewMode('sketch-2d');
      setStatusBanner(
        `AI đã lập xong "Bản phác thảo cấu trúc 2D" cho "${cleanedName}". Vui lòng kiểm tra sơ đồ cấu tạo 2D và bấm [✔ Phác thảo đã OK, Tiến hành dựng 3D]!`,
      );
    } catch {
      setStatusBanner(
        'Đã xảy ra lỗi khi phân tích phác thảo. Vui lòng kiểm tra lại thông số và thử lại.',
      );
    } finally {
      setIsAiGenerating(false);
      setIsRefiningModel(false);
    }
  };

  /**
   * Lấy danh sách các khối bộ phận 2D hiện hành của Blueprint
   * (Giữ nguyên mảng rỗng nếu người dùng đã xóa hết các khối, chỉ dùng mẫu mặc định khi customParts chưa được khởi tạo)
   */
  /**
   * Lấy danh sách các khối bộ phận 2D hiện hành của Blueprint
   * (Tuyệt đối không dùng mẫu mặc định đèn cồn; lấy trực tiếp từ mảng customParts của Blueprint)
   */
  const getActive2DParts = (
    bp: AiEquipmentBlueprint | null,
  ): AiGeneratedPartSpec[] => {
    if (!bp) return [];
    if (Array.isArray(bp.customParts)) {
      return bp.customParts;
    }
    return [];
  };

  /**
   * Tự động căn chỉnh lại vị trí Y (relativePos[1]) của các khối bộ phận còn lại
   * sao cho các khối xếp chồng liền mạch từ mặt bàn (Y = 0) lên trên, đồng thời
   * GIỮ NGUYÊN các khối đặt song song ngang nhau (như 2 cực Bắc N - Nam S của Nam châm thanh / Nam châm chữ U).
   */
  const realignPartsYPositions = (
    parts: AiGeneratedPartSpec[],
  ): AiGeneratedPartSpec[] => {
    if (parts.length === 0) return [];

    const mainAxisIndices: number[] = [];
    const frontPanelIndices: number[] = [];

    parts.forEach((p, idx) => {
      const zPos = Math.abs(p.relativePos[2] || 0);
      if (zPos >= 0.25 && parts.length > 1) {
        frontPanelIndices.push(idx);
      } else {
        mainAxisIndices.push(idx);
      }
    });

    const stackIndices =
      mainAxisIndices.length > 0 ? mainAxisIndices : frontPanelIndices;

    // Sắp xếp từ dưới lên trên theo vị trí Y hiện tại
    const sortedByY = [...stackIndices].sort(
      (a, b) => (parts[a].relativePos[1] || 0) - (parts[b].relativePos[1] || 0),
    );

    // Gom các bộ phận nằm cùng một tầng ngang (VD: Cực Bắc N bên trái và Cực Nam S bên phải có cùng Y)
    const horizontalTiers: number[][] = [];
    for (const idx of sortedByY) {
      const partY = parts[idx].relativePos[1] || 0;
      const partX = parts[idx].relativePos[0] || 0;
      const lastTier = horizontalTiers[horizontalTiers.length - 1];
      if (lastTier && lastTier.length > 0) {
        const refIdx = lastTier[0];
        const refY = parts[refIdx].relativePos[1] || 0;
        const hasDistinctX = lastTier.every(
          (tIdx) => Math.abs((parts[tIdx].relativePos[0] || 0) - partX) >= 0.08,
        );
        if (Math.abs(partY - refY) <= 0.05 && hasDistinctX) {
          lastTier.push(idx);
          continue;
        }
      }
      horizontalTiers.push([idx]);
    }

    const nextParts = parts.map((p) => ({
      ...p,
      relativePos: [...p.relativePos] as [number, number, number],
      relativeScale: [...p.relativeScale] as [number, number, number],
    }));

    const tierHeights = horizontalTiers.map((tier) =>
      Math.max(
        ...tier.map((i) => Math.max(0.05, nextParts[i].relativeScale[1] || 0.15)),
      ),
    );
    const totalRawScaleY = tierHeights.reduce((sum, hVal) => sum + hVal, 0);
    const normFactor = totalRawScaleY > 0.92 ? 0.9 / totalRawScaleY : 1;

    let cursorY = 0.01;
    horizontalTiers.forEach((tier, tRank) => {
      const tierH = Math.max(
        0.05,
        Number((tierHeights[tRank] * normFactor).toFixed(3)),
      );
      const centerY = Math.max(
        0.04,
        Math.min(0.95, Number((cursorY + tierH / 2).toFixed(3))),
      );
      for (const idx of tier) {
        nextParts[idx].relativePos[1] = centerY;
      }
      cursorY += tierH;
    });

    if (mainAxisIndices.length > 0 && frontPanelIndices.length > 0) {
      frontPanelIndices.forEach((fIdx, rank) => {
        const fH = nextParts[fIdx].relativeScale[1] || 0.14;
        const targetY = Math.max(
          0.08,
          Math.min(
            0.85,
            Number(
              (Math.min(cursorY * 0.25, 0.16) + rank * (fH + 0.04)).toFixed(3),
            ),
          ),
        );
        nextParts[fIdx].relativePos[1] = targetY;
      });
    }

    return nextParts;
  };

  /**
   * Đồng bộ tức thời mọi thay đổi trên Bản phác thảo 2D (kéo thả vị trí, kéo giãn kích thước, sửa nhãn chú thích, xóa khối, lệnh AI)
   * sang bảng thông số kích thước (cm) ở Bước 1 và biên dịch lại khuôn mẫu Three.js 3D chính xác 100%.
   */
  const sync2DBlueprintAndRecompile3D = (
    nextParts: AiGeneratedPartSpec[],
    nextHCm?: number,
    nextWCm?: number,
    nextDCm?: number,
    blueprintOverrides?: Partial<AiEquipmentBlueprint> & {
      materialText?: string;
    },
  ) => {
    if (!generatedBlueprint) return;

    const currentH =
      nextHCm !== undefined
        ? Math.max(2, Number(nextHCm.toFixed(1)))
        : Math.max(
            2,
            Number(heightCm) ||
              generatedPackage?.asset.geometry.dimensions.height.value ||
              20,
          );
    const currentW =
      nextWCm !== undefined
        ? Math.max(1.5, Number(nextWCm.toFixed(1)))
        : Math.max(
            1.5,
            Number(widthCm) ||
              generatedPackage?.asset.geometry.dimensions.widthOrDiameter.value ||
              12,
          );
    const isCylinderShape = generatedBlueprint.baseShapeType === 'Cylinder';
    const currentD = isCylinderShape
      ? currentW
      : nextDCm !== undefined
        ? Math.max(1.5, Number(nextDCm.toFixed(1)))
        : Math.max(
            1.5,
            Number(depthCm) ||
              generatedPackage?.asset.geometry.dimensions.depth?.value ||
              10,
          );

    // 1. Đồng bộ ngược lên các ô thông số kích thước (cm) & chất liệu ở Bước 1
    setHeightCm(String(currentH));
    setWidthCm(String(currentW));
    setDepthCm(String(currentD));
    if (blueprintOverrides?.materialText) {
      setMaterial(blueprintOverrides.materialText);
    }

    // 2. Cập nhật danh sách [Các thông số áp dụng] và customParts trong Blueprint
    const parsedMass = Math.max(10, Number(massG) || 200);
    const parsedCap = capacityMl ? Number(capacityMl) : null;
    const parsedFocal = focalLengthCm ? Number(focalLengthCm) : null;
    const matText =
      blueprintOverrides?.materialText ||
      material.trim() ||
      'Thủy tinh Borosilicate chịu nhiệt, Đồng thau / Inox & Nhựa kỹ thuật ABS';

    const effectiveGlassOpacity =
      blueprintOverrides?.glassOpacity ?? generatedBlueprint.glassOpacity;
    const effectivePrimaryHex =
      blueprintOverrides?.primaryColorHex ?? generatedBlueprint.primaryColorHex;
    const effectiveSecondaryHex =
      blueprintOverrides?.secondaryColorHex ??
      generatedBlueprint.secondaryColorHex;
    const effectiveAccentHex =
      blueprintOverrides?.accentColorHex ?? generatedBlueprint.accentColorHex;

    const updatedAppliedParams: string[] = isCylinderShape
      ? [
          `Chiều cao (H): ${currentH} cm (Đã đồng bộ từ Phác thảo 2D)`,
          `Đường kính trụ tròn (Ø): ${currentW} cm (Đối xứng trụ tròn Ø = ${currentW} cm)`,
          `Số khối cấu tạo: ${nextParts.length} bộ phận · Độ mờ kính α = ${effectiveGlassOpacity}`,
          `Khối lượng (m): ${parsedMass} g`,
          ...(parsedCap ? [`Dung tích định mức (V): ${parsedCap} ml`] : []),
          ...(parsedFocal ? [`Tiêu cự quang học (f): ${parsedFocal} cm`] : []),
          `Chất liệu: ${matText}`,
        ]
      : [
          `Chiều cao (H): ${currentH} cm (Đã đồng bộ từ Phác thảo 2D)`,
          `Chiều rộng ngang (W): ${currentW} cm (Đã đồng bộ từ Phác thảo 2D)`,
          `Chiều sâu / Bề dày (D): ${currentD} cm`,
          `Số khối cấu tạo: ${nextParts.length} bộ phận · Độ mờ kính α = ${effectiveGlassOpacity}`,
          `Khối lượng (m): ${parsedMass} g`,
          `Chất liệu: ${matText}`,
        ];

    const { materialText: _unusedMat, ...cleanOverrides } =
      blueprintOverrides || {};

    const updatedBlueprint: AiEquipmentBlueprint = {
      ...generatedBlueprint,
      ...cleanOverrides,
      primaryColorHex: effectivePrimaryHex,
      secondaryColorHex: effectiveSecondaryHex,
      accentColorHex: effectiveAccentHex,
      glassOpacity: effectiveGlassOpacity,
      customParts: nextParts,
      appliedParametersSummaryVi: updatedAppliedParams,
      structuralComponents: nextParts.map(
        (p, idx) =>
          `${idx + 1}. ${p.partName} (Cao ${(p.relativeScale[1] * currentH).toFixed(1)} cm × ${isCylinderShape ? 'Ø' : 'Rộng'} ${(p.relativeScale[0] * currentW).toFixed(1)} cm · Vị trí Y ${Math.round((p.relativePos[1] || 0.3) * 100)}%)`,
      ),
    };

    const specForCompile: AiEquipmentInputSpec = {
      templateId: generatedBlueprint.shapeFamily,
      baseShapeType: generatedBlueprint.baseShapeType,
      nameVi: generatedBlueprint.nameVi,
      category:
        (category as EquipmentCategoryId) ||
        generatedPackage?.asset.category ||
        'measuring-instrument',
      subject,
      heightCm: currentH,
      widthCm: currentW,
      depthCm: currentD,
      massG: parsedMass,
      focalLengthCm: parsedFocal,
      capacityMl: parsedCap,
      rangeMax: generatedBlueprint.controlMax,
      leastCount: generatedBlueprint.controlStep,
      unitLabel: generatedBlueprint.controlUnit,
      material: matText,
      description: description.trim() || generatedBlueprint.aiAnalysisSummary,
      appearancePrompt: description.trim(),
      operationPrompt:
        operationPrompt.trim() || generatedBlueprint.operationSummary,
      referenceUrl: referenceUrl.trim() || undefined,
      imageDataUrl: uploadedImageDataUrl,
      imageDataUrls: uploadedImages.map((img) => img.dataUrl),
      detectedImagePrimaryHex,
      detectedImageSecondaryHex,
      detectedImageAccentHex,
      clarificationMemory,
    };

    const recompiledHtml = buildHtmlModuleFromBlueprint(
      specForCompile,
      updatedBlueprint,
    );
    const recompiledPkg =
      htmlEquipmentModuleRegistry.parseHtmlModule(recompiledHtml);

    setGeneratedBlueprint(updatedBlueprint);
    setGeneratedHtmlSource(recompiledHtml);
    setGeneratedPackage({ ...recompiledPkg });
    livePkgRef.current = recompiledPkg;
  };

  /**
   * Xóa ngay lập tức một khối bộ phận khỏi Bản phác thảo 2D,
   * tự động căn chỉnh lại vị trí Y của các khối còn lại và re-render giao diện tức thì.
   */
  const handleDelete2DPartBlock = (partIndex: number) => {
    if (!generatedBlueprint) return;
    const currentParts = [...getActive2DParts(generatedBlueprint)];
    const removedPart = currentParts[partIndex];
    if (!removedPart) return;

    const remainingParts = currentParts.filter((_, idx) => idx !== partIndex);
    const realignedParts = realignPartsYPositions(remainingParts);

    setSelected2DPartIndex((prev) =>
      realignedParts.length === 0
        ? 0
        : Math.max(
            0,
            Math.min(
              prev >= partIndex ? prev - 1 : prev,
              realignedParts.length - 1,
            ),
          ),
    );

    sync2DBlueprintAndRecompile3D(realignedParts);
    setStatusBanner(
      `🗑️ Đã xóa khối "${partIndex + 1}. ${removedPart.partName}" khỏi phác thảo 2D và tự động căn chỉnh lại vị trí Y cho ${realignedParts.length} khối còn lại.`,
    );
  };

  /**
   * Bộ xử lý lệnh ngôn ngữ tự nhiên cho khung "Nhập yêu cầu để AI chỉnh sửa":
   * 1. Bóc tách từ khóa (Keyword Parsing): tăng/giảm chiều cao, đường kính, chiều rộng, bề dày, đổi màu, làm trong suốt/mờ, xóa bộ phận Y, thêm bộ phận...
   * 2. Cập nhật dữ liệu thời gian thực (State Mutation): cộng/trừ Cao(cm), Đường kính, màu sắc, độ trong suốt của từng khối trong mảng phác thảo 2D.
   * 3. Re-render tự động: gọi sync2DBlueprintAndRecompile3D để vẽ lại khung 2D, bảng thông số và mô hình 3D ngay lập tức.
   */
  const executeRefinementCommandOnBlueprint = (rawCommand: string) => {
    if (!generatedBlueprint) return;

    const stripViAccents = (s: string) =>
      s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd');

    const baseHeightFallback =
      generatedPackage?.asset.geometry.dimensions.height.value ?? 20;
    const baseWidthFallback =
      generatedPackage?.asset.geometry.dimensions.widthOrDiameter.value ?? 12;
    const baseDepthFallback =
      generatedPackage?.asset.geometry.dimensions.depth?.value ?? 10;

    let nextHeight = parseDecimalNumber(heightCm, baseHeightFallback);
    let nextWidth = parseDecimalNumber(widthCm, baseWidthFallback);
    let nextDepth = parseDecimalNumber(depthCm, baseDepthFallback);
    let nextMaterial =
      material.trim() ||
      'Thủy tinh Borosilicate chịu nhiệt, Đồng thau / Inox & Nhựa kỹ thuật ABS';

    let nextPrimaryHex = generatedBlueprint.primaryColorHex;
    let nextSecondaryHex = generatedBlueprint.secondaryColorHex;
    let nextAccentHex = generatedBlueprint.accentColorHex;
    let nextGlassOpacity = generatedBlueprint.glassOpacity;

    let nextParts: AiGeneratedPartSpec[] = getActive2DParts(
      generatedBlueprint,
    ).map((p) => ({
      ...p,
      relativePos: [...p.relativePos] as [number, number, number],
      relativeScale: [...p.relativeScale] as [number, number, number],
    }));

    const appliedSummaryList: string[] = [];

    // Hàm nhận diện các khối bộ phận được nhắc tới trong câu lệnh (theo số thứ tự hoặc tên bộ phận)
    const findTargetPartIndices = (
      clauseText: string,
      partsList: AiGeneratedPartSpec[],
    ): number[] => {
      const matched = new Set<number>();
      const lower = clauseText.toLowerCase();
      const plain = stripViAccents(clauseText);

      // 1. Bắt theo số thứ tự: "bộ phận 2", "khối 3", "mục 1", "số 4", "thứ 2"
      const indexRegex =
        /(?:bộ\s*phận|bo\s*phan|khối|khoi|mục|muc|phần|phan|số|so|thứ|thu)\s*(?:số\s*|so\s*|thứ\s*|thu\s*)?(\d+)/gi;
      let idxMatch: RegExpExecArray | null;
      while ((idxMatch = indexRegex.exec(lower)) !== null) {
        const oneBased = parseInt(idxMatch[1], 10);
        if (oneBased >= 1 && oneBased <= partsList.length) {
          matched.add(oneBased - 1);
        }
      }

      // 2. Bắt theo vị trí tương đối: "trên cùng", "đỉnh", "dưới cùng", "đáy", "cuối"
      if (partsList.length > 0) {
        if (
          lower.includes('trên cùng') ||
          plain.includes('tren cung') ||
          lower.includes('ở đỉnh')
        ) {
          let maxYIdx = 0;
          partsList.forEach((p, i) => {
            if ((p.relativePos[1] || 0) > (partsList[maxYIdx].relativePos[1] || 0)) {
              maxYIdx = i;
            }
          });
          matched.add(maxYIdx);
        }
        if (
          lower.includes('dưới cùng') ||
          plain.includes('duoi cung') ||
          lower.includes('ở đáy')
        ) {
          let minYIdx = 0;
          partsList.forEach((p, i) => {
            if ((p.relativePos[1] || 0) < (partsList[minYIdx].relativePos[1] || 0)) {
              minYIdx = i;
            }
          });
          matched.add(minYIdx);
        }
        if (lower.includes('cuối cùng') || lower.includes('khối cuối') || lower.includes('bộ phận cuối')) {
          matched.add(partsList.length - 1);
        }
      }

      // 3. Bắt theo tên bộ phận hoặc từ khóa bộ phận cụ thể
      partsList.forEach((part, idx) => {
        const pLower = part.partName.toLowerCase();
        const pPlain = stripViAccents(part.partName);

        if (pLower.length >= 3 && (lower.includes(pLower) || plain.includes(pPlain))) {
          matched.add(idx);
          return;
        }

        // So khớp các cụm từ đặc trưng của từng bộ phận (loại trừ từ "thân dụng cụ" chung chung khi xét kích thước)
        const isGenericToolBodyPhrase =
          lower.includes('thân dụng cụ') ||
          lower.includes('thân thiết bị') ||
          plain.includes('than dung cu');

        if (
          (lower.includes('chân đế') || plain.includes('chan de') || /\bđế\b/.test(lower)) &&
          (pLower.includes('đế') || pPlain.includes('de'))
        ) {
          matched.add(idx);
        }
        if (
          !isGenericToolBodyPhrase &&
          (lower.includes('bầu thân') ||
            lower.includes('bầu chứa') ||
            lower.includes('bầu') ||
            lower.includes('thân chính') ||
            plain.includes('bau than') ||
            plain.includes('than chinh')) &&
          (pLower.includes('bầu') || pLower.includes('thân') || pPlain.includes('bau') || pPlain.includes('than'))
        ) {
          matched.add(idx);
        }
        if (
          (lower.includes('cổ thắt') ||
            lower.includes('cổ bình') ||
            /\bcổ\b/.test(lower) ||
            lower.includes('thành ống') ||
            plain.includes('co that')) &&
          (pLower.includes('cổ') || pLower.includes('thành ống') || pPlain.includes('co'))
        ) {
          matched.add(idx);
        }
        if (
          (lower.includes('nắp chụp') ||
            lower.includes('nắp đậy') ||
            /\bnắp\b/.test(lower) ||
            lower.includes('đầu giữ') ||
            lower.includes('vành miệng') ||
            plain.includes('nap chup') ||
            plain.includes('dau giu')) &&
          (pLower.includes('nắp') ||
            pLower.includes('đầu giữ') ||
            pLower.includes('vành') ||
            pPlain.includes('nap') ||
            pPlain.includes('vanh'))
        ) {
          matched.add(idx);
        }
        if (
          (lower.includes('bảng mặt') ||
            lower.includes('mặt trước') ||
            lower.includes('cụm điều khiển') ||
            lower.includes('điều khiển') ||
            lower.includes('mặt chia') ||
            plain.includes('bang mat') ||
            plain.includes('dieu khien')) &&
          (pLower.includes('bảng') ||
            pLower.includes('mặt') ||
            pLower.includes('điều khiển') ||
            pLower.includes('kim') ||
            pLower.includes('chốt') ||
            pPlain.includes('bang') ||
            pPlain.includes('dieu khien'))
        ) {
          matched.add(idx);
        }
        if (
          (lower.includes('bổ sung') || plain.includes('bo sung')) &&
          (pLower.includes('bổ sung') || pPlain.includes('bo sung'))
        ) {
          matched.add(idx);
        }
      });

      return Array.from(matched).sort((a, b) => a - b);
    };

    const parseColorInfoFromClause = (
      txt: string,
    ): { hex: string; labelVi: string } | null => {
      const lower = txt.toLowerCase();
      const plain = stripViAccents(txt);

      const hexMatch = txt.match(/#([0-9a-fA-F]{6})\b/);
      if (hexMatch) {
        return {
          hex: `#${hexMatch[1].toUpperCase()}`,
          labelVi: `#${hexMatch[1].toUpperCase()}`,
        };
      }
      if (
        lower.includes('xanh biển') ||
        lower.includes('xanh dương') ||
        lower.includes('xanh lam') ||
        plain.includes('xanh bien') ||
        plain.includes('xanh duong')
      ) {
        return { hex: '#1D4ED8', labelVi: 'xanh biển khoa học' };
      }
      if (
        lower.includes('xanh da trời') ||
        lower.includes('xanh ngọc') ||
        lower.includes('xanh nhạt') ||
        lower.includes('cyan')
      ) {
        return { hex: '#0EA5E9', labelVi: 'xanh da trời' };
      }
      if (
        lower.includes('xanh lá') ||
        lower.includes('xanh lục') ||
        plain.includes('xanh la')
      ) {
        return { hex: '#10B981', labelVi: 'xanh lá' };
      }
      if (lower.includes('đỏ') || /\bdo\b/.test(plain)) {
        return { hex: '#DC2626', labelVi: 'đỏ nổi bật' };
      }
      if (lower.includes('cam') || lower.includes('da cam')) {
        return { hex: '#EA580C', labelVi: 'cam' };
      }
      if (lower.includes('vàng đồng') || lower.includes('màu đồng')) {
        return { hex: '#D97706', labelVi: 'vàng đồng' };
      }
      if (lower.includes('vàng') || plain.includes('vang')) {
        return { hex: '#EAB308', labelVi: 'vàng' };
      }
      if (lower.includes('tím') || /\btim\b/.test(plain)) {
        return { hex: '#7C3AED', labelVi: 'tím' };
      }
      if (lower.includes('hồng') || plain.includes('hong')) {
        return { hex: '#EC4899', labelVi: 'hồng' };
      }
      if (lower.includes('trắng') || plain.includes('trang')) {
        return { hex: '#F8FAFC', labelVi: 'trắng sáng' };
      }
      if (lower.includes('bạc') || lower.includes('inox')) {
        return { hex: '#CBD5E1', labelVi: 'bạc Inox' };
      }
      if (lower.includes('xám') || lower.includes('ghi') || plain.includes('xam')) {
        return { hex: '#64748B', labelVi: 'xám ghi' };
      }
      if (lower.includes('đen') || /\bden\b/.test(plain)) {
        return { hex: '#1E293B', labelVi: 'đen kỹ thuật' };
      }
      if (lower.includes('nâu') || plain.includes('nau')) {
        return { hex: '#92400E', labelVi: 'nâu' };
      }
      return null;
    };

    // Tách câu lệnh thành các mệnh đề độc lập
    const clauses = rawCommand
      .split(
        /(?:[,;]+|\s+và\s+(?=(?:tăng|giảm|hạ|nâng|đổi|thay|làm|xóa|xoá|bỏ|gỡ|loại|thêm|chỉnh|sửa|thu|phóng)\b))/i,
      )
      .map((c) => c.trim())
      .filter(Boolean);

    for (const clause of clauses) {
      const lowerClause = clause.toLowerCase();
      const plainClause = stripViAccents(clause);

      // =====================================================================
      // 1. LỆNH XÓA BỘ PHẬN / KHỐI ("xóa bộ phận Y", "xóa khối 3", "bỏ nắp chụp"...)
      // =====================================================================
      if (
        /(?:^|\s)(?:xóa|xoá|bỏ|gỡ|loại\s*bỏ|xoa|bo|go)(?:\s|$)/i.test(
          lowerClause,
        )
      ) {
        let toDeleteIndices = findTargetPartIndices(clause, nextParts);

        // Nếu người dùng gõ tên tùy chỉnh sau từ "xóa bộ phận ..."
        if (toDeleteIndices.length === 0 && nextParts.length > 0) {
          const tailMatch = plainClause.match(
            /(?:xoa|bo|go|loai\s*bo)\s*(?:bo\s*phan|khoi|muc|phan|chu\s*thich)?\s*(.+)$/i,
          );
          const targetPhrase = tailMatch ? tailMatch[1].trim() : '';
          if (targetPhrase.length >= 2) {
            nextParts.forEach((p, idx) => {
              const pPlain = stripViAccents(p.partName);
              if (
                pPlain.includes(targetPhrase) ||
                targetPhrase.includes(pPlain)
              ) {
                toDeleteIndices.push(idx);
              }
            });
          }
        }

        if (toDeleteIndices.length > 0) {
          const removedNames = toDeleteIndices.map(
            (i) => `${i + 1}. ${nextParts[i]?.partName}`,
          );
          const deleteSet = new Set(toDeleteIndices);
          nextParts = realignPartsYPositions(
            nextParts.filter((_, idx) => !deleteSet.has(idx)),
          );
          setSelected2DPartIndex((prev) =>
            Math.max(0, Math.min(prev, Math.max(0, nextParts.length - 1))),
          );
          appliedSummaryList.push(
            `Đã xóa [${removedNames.join(', ')}] & tự động căn chỉnh lại vị trí Y`,
          );
          continue;
        }
      }

      // =====================================================================
      // 2. LỆNH THÊM BỘ PHẬN MỚI ("thêm bộ phận vòi rót", "thêm khối tay cầm"...)
      // =====================================================================
      const addPartMatch = clause.match(
        /^(?:\+\s*)?(?:thêm|bổ\s*sung|them|bo\s*sung)\s+(?:bộ\s*phận|khối|mục|chú\s*thích|bo\s*phan|khoi)\s*(.*)$/i,
      );
      if (addPartMatch) {
        const rawNewName = addPartMatch[1].trim();
        const newPartName =
          rawNewName.length >= 2
            ? rawNewName.charAt(0).toUpperCase() + rawNewName.slice(1)
            : `Bộ phận bổ sung ${nextParts.length + 1}`;
        const colorInfo = parseColorInfoFromClause(clause);
        const inferredShape: AiGeneratedPartSpec['shape'] =
          lowerClause.includes('cầu') || lowerClause.includes('bầu')
            ? 'sphere'
            : lowerClause.includes('nón') || lowerClause.includes('phễu')
              ? 'cone'
              : lowerClause.includes('hộp') || lowerClause.includes('bảng')
                ? 'beveled-box'
                : lowerClause.includes('vành')
                  ? 'torus'
                  : 'cylinder';

        nextParts = realignPartsYPositions([
          ...nextParts,
          {
            partName: newPartName,
            shape: inferredShape,
            colorHex: colorInfo?.hex || nextAccentHex || '#38BDF8',
            metalness: 0.45,
            roughness: 0.3,
            opacity: 1,
            relativeScale: [0.36, 0.15, 0.36],
            relativePos: [0, 0.88, 0],
          },
        ]);
        setSelected2DPartIndex(nextParts.length - 1);
        appliedSummaryList.push(`Đã thêm khối mới "${newPartName}"`);
        continue;
      }

      const targetIndices = findTargetPartIndices(clause, nextParts);
      const isDecrease =
        /(?:giảm|bớt|hạ|xuống|nhỏ\s*đi|ngắn\s*đi|thấp\s*đi|hẹp\s*đi|giam|bot|xuong|-)/i.test(
          lowerClause,
        );
      const isIncrease =
        /(?:tăng|thêm|cộng|lên|cao\s*thêm|rộng\s*thêm|to\s*thêm|dài\s*thêm|tang|them|len|\+)/i.test(
          lowerClause,
        );

      // =====================================================================
      // 3. LỆNH THAY ĐỔI CHIỀU CAO Cao(cm) (Của riêng 1 khối hoặc toàn bộ dụng cụ)
      // =====================================================================
      const hMatch =
        clause.match(
          /(?:chiều\s*cao|độ\s*cao|chieu\s*cao|cao)\s*(?:[^0-9,.;]*?)\s*(\d+(?:[.,]\d+)?)\s*(?:cm)?/i,
        ) ||
        clause.match(
          /(?:tăng|giảm|thêm|bớt|hạ|nâng)\s*(?:[^0-9,.;]*?(?:chiều\s*cao|độ\s*cao|cao)[^0-9,.;]*?)\s*(\d+(?:[.,]\d+)?)\s*(?:cm)?/i,
        );

      if (hMatch) {
        const num = parseFloat(hMatch[1].replace(',', '.'));
        if (Number.isFinite(num) && num > 0) {
          if (targetIndices.length > 0) {
            // Cộng/trừ trực tiếp Cao(cm) của khối bộ phận được chỉ định
            let totalDeltaCm = 0;
            const partHeightsCm = nextParts.map(
              (p) => (p.relativeScale[1] || 0.2) * nextHeight,
            );

            for (const tIdx of targetIndices) {
              const oldPartHCm = partHeightsCm[tIdx];
              const newPartHCm = isDecrease
                ? Math.max(0.5, Number((oldPartHCm - num).toFixed(1)))
                : isIncrease
                  ? Number((oldPartHCm + num).toFixed(1))
                  : Math.max(0.5, Number(num.toFixed(1)));
              totalDeltaCm += newPartHCm - oldPartHCm;
              partHeightsCm[tIdx] = newPartHCm;
              appliedSummaryList.push(
                `Cao(cm) của [${nextParts[tIdx].partName}]: ${oldPartHCm.toFixed(1)} → ${newPartHCm.toFixed(1)} cm`,
              );
            }

            nextHeight = Math.max(
              3,
              Number((nextHeight + totalDeltaCm).toFixed(1)),
            );
            nextParts = realignPartsYPositions(
              nextParts.map((p, idx) => ({
                ...p,
                relativeScale: [
                  p.relativeScale[0],
                  Math.max(
                    0.05,
                    Math.min(
                      0.95,
                      Number((partHeightsCm[idx] / nextHeight).toFixed(3)),
                    ),
                  ),
                  p.relativeScale[2],
                ],
              })),
            );
          } else {
            // Cộng/trừ Chiều cao tổng thể của dụng cụ -> tự động quy đổi Cao(cm) cho toàn bộ các khối
            const oldH = nextHeight;
            if (isDecrease) {
              nextHeight = Math.max(3, Number((nextHeight - num).toFixed(1)));
            } else if (isIncrease) {
              nextHeight = Number((nextHeight + num).toFixed(1));
            } else {
              nextHeight = Math.max(3, Number(num.toFixed(1)));
            }
            appliedSummaryList.push(
              `Chiều cao dụng cụ: ${oldH} cm → ${nextHeight} cm`,
            );
          }
        }
      }

      // =====================================================================
      // 4. LỆNH THAY ĐỔI ĐƯỜNG KÍNH / CHIỀU RỘNG Ø(cm)
      // =====================================================================
      const wMatch =
        clause.match(
          /(?:đường\s*kính|chiều\s*rộng|bề\s*rộng|bề\s*ngang|duong\s*kinh|chieu\s*rong|rộng|ngang|ø)\s*(?:[^0-9,.;]*?)\s*(\d+(?:[.,]\d+)?)\s*(?:cm)?/i,
        ) ||
        clause.match(
          /(?:tăng|giảm|thêm|bớt)\s*(?:[^0-9,.;]*?(?:đường\s*kính|chiều\s*rộng|rộng|ngang|ø)[^0-9,.;]*?)\s*(\d+(?:[.,]\d+)?)\s*(?:cm)?/i,
        );

      if (wMatch) {
        const num = parseFloat(wMatch[1].replace(',', '.'));
        if (Number.isFinite(num) && num > 0) {
          if (targetIndices.length > 0) {
            for (const tIdx of targetIndices) {
              const oldPartWCm =
                (nextParts[tIdx].relativeScale[0] || 0.5) * nextWidth;
              const newPartWCm = isDecrease
                ? Math.max(0.5, Number((oldPartWCm - num).toFixed(1)))
                : isIncrease
                  ? Number((oldPartWCm + num).toFixed(1))
                  : Math.max(0.5, Number(num.toFixed(1)));

              if (newPartWCm > nextWidth) {
                nextWidth = Number(newPartWCm.toFixed(1));
              }
              const nextRelW = Math.max(
                0.08,
                Math.min(1.35, Number((newPartWCm / nextWidth).toFixed(3))),
              );
              nextParts[tIdx] = {
                ...nextParts[tIdx],
                relativeScale: [
                  nextRelW,
                  nextParts[tIdx].relativeScale[1],
                  nextRelW,
                ],
              };
              appliedSummaryList.push(
                `Đường kính/Rộng [${nextParts[tIdx].partName}]: ${oldPartWCm.toFixed(1)} → ${newPartWCm.toFixed(1)} cm`,
              );
            }
          } else {
            const oldW = nextWidth;
            if (isDecrease) {
              nextWidth = Math.max(2, Number((nextWidth - num).toFixed(1)));
            } else if (isIncrease) {
              nextWidth = Number((nextWidth + num).toFixed(1));
            } else {
              nextWidth = Math.max(2, Number(num.toFixed(1)));
            }
            if (generatedBlueprint.baseShapeType === 'Cylinder') {
              nextDepth = nextWidth;
            }
            appliedSummaryList.push(
              `Đường kính / Chiều rộng: ${oldW} cm → ${nextWidth} cm`,
            );
          }
        }
      }

      // =====================================================================
      // 5. LỆNH THAY ĐỔI CHIỀU SÂU / BỀ DÀY (cm)
      // =====================================================================
      const dMatch = clause.match(
        /(?:chiều\s*sâu|bề\s*dày|độ\s*dày|chieu\s*sau|be\s*day|sâu|dày)\s*(?:[^0-9,.;]*?)\s*(\d+(?:[.,]\d+)?)\s*(?:cm)?/i,
      );
      if (dMatch) {
        const num = parseFloat(dMatch[1].replace(',', '.'));
        if (Number.isFinite(num) && num > 0) {
          const oldD = nextDepth;
          if (isDecrease) {
            nextDepth = Math.max(2, Number((nextDepth - num).toFixed(1)));
          } else if (isIncrease) {
            nextDepth = Number((nextDepth + num).toFixed(1));
          } else {
            nextDepth = Math.max(2, Number(num.toFixed(1)));
          }
          appliedSummaryList.push(`Chiều sâu / Bề dày: ${oldD} cm → ${nextDepth} cm`);
        }
      }

      // Lệnh phóng to / thu nhỏ tương đối khi không ghi số cm cụ thể
      if (!hMatch && !wMatch && !dMatch) {
        if (
          lowerClause.includes('to hơn') ||
          lowerClause.includes('lớn hơn') ||
          lowerClause.includes('phóng to')
        ) {
          nextHeight = Number((nextHeight * 1.2).toFixed(1));
          nextWidth = Number((nextWidth * 1.2).toFixed(1));
          nextDepth = Number((nextDepth * 1.2).toFixed(1));
          appliedSummaryList.push(
            `Phóng to kích thước (+20%): Cao ${nextHeight} cm × Rộng ${nextWidth} cm`,
          );
        } else if (
          lowerClause.includes('nhỏ hơn') ||
          lowerClause.includes('thu nhỏ') ||
          lowerClause.includes('gọn hơn')
        ) {
          nextHeight = Math.max(3, Number((nextHeight * 0.82).toFixed(1)));
          nextWidth = Math.max(2, Number((nextWidth * 0.82).toFixed(1)));
          nextDepth = Math.max(2, Number((nextDepth * 0.82).toFixed(1)));
          appliedSummaryList.push(
            `Thu nhỏ kích thước (-18%): Cao ${nextHeight} cm × Rộng ${nextWidth} cm`,
          );
        }
      }

      // =====================================================================
      // 6. LỆNH THAY ĐỔI VẬT LIỆU & ĐỘ TRONG SUỐT ("trong suốt hơn", "đục hơn", "inox", "đồng"...)
      // =====================================================================
      if (
        lowerClause.includes('trong suốt') ||
        plainClause.includes('trong suot') ||
        lowerClause.includes('rõ hơn')
      ) {
        nextGlassOpacity = Math.max(
          0.12,
          Number((nextGlassOpacity * 0.52).toFixed(2)),
        );
        const indicesToTransparent =
          targetIndices.length > 0
            ? targetIndices
            : nextParts
                .map((p, i) =>
                  p.shape !== 'dial-face' && p.shape !== 'binding-post' ? i : -1,
                )
                .filter((i) => i >= 0);

        for (const idx of indicesToTransparent) {
          const curOp = nextParts[idx].opacity ?? 0.65;
          nextParts[idx] = {
            ...nextParts[idx],
            opacity: Math.max(0.14, Math.min(0.28, Number((curOp * 0.45).toFixed(2)))),
            roughness: 0.05,
            metalness: 0.05,
          };
        }
        if (lowerClause.includes('thủy tinh') && !nextMaterial.toLowerCase().includes('thủy tinh')) {
          nextMaterial = `Thủy tinh Borosilicate siêu trong suốt, ${nextMaterial}`;
        }
        appliedSummaryList.push(
          `Làm vật liệu trong suốt hơn (Độ mờ α = ${nextGlassOpacity})`,
        );
      } else if (
        lowerClause.includes('đục hơn') ||
        lowerClause.includes('mờ hơn') ||
        lowerClause.includes('đặc hơn') ||
        plainClause.includes('duc hon')
      ) {
        nextGlassOpacity = Math.min(
          0.95,
          Number((nextGlassOpacity + 0.32).toFixed(2)),
        );
        const indicesToOpaque =
          targetIndices.length > 0
            ? targetIndices
            : nextParts.map((_, i) => i);
        for (const idx of indicesToOpaque) {
          nextParts[idx] = {
            ...nextParts[idx],
            opacity: Math.min(
              1,
              Number(((nextParts[idx].opacity ?? 0.4) + 0.42).toFixed(2)),
            ),
          };
        }
        appliedSummaryList.push(
          `Làm vật liệu đục/đặc hơn (Độ mờ α = ${nextGlassOpacity})`,
        );
      }

      // =====================================================================
      // 7. LỆNH ĐỔI MÀU SẮC ("đổi màu thân sang xanh biển", "đổi màu chi tiết nhấn sang đỏ"...)
      // =====================================================================
      const colorInfo = parseColorInfoFromClause(clause);
      if (colorInfo) {
        const isAccentTarget =
          lowerClause.includes('chi tiết nhấn') ||
          plainClause.includes('chi tiet nhan') ||
          lowerClause.includes('điểm nhấn') ||
          lowerClause.includes('kim') ||
          lowerClause.includes('chốt');

        if (isAccentTarget) {
          nextAccentHex = colorInfo.hex;
          let updatedAny = false;
          nextParts = nextParts.map((p, idx) => {
            const pLow = p.partName.toLowerCase();
            if (
              targetIndices.includes(idx) ||
              pLow.includes('nắp') ||
              pLow.includes('đầu giữ') ||
              pLow.includes('bảng') ||
              pLow.includes('điều khiển') ||
              pLow.includes('chốt') ||
              pLow.includes('kim')
            ) {
              updatedAny = true;
              return { ...p, colorHex: colorInfo.hex };
            }
            return p;
          });
          if (!updatedAny && nextParts.length > 0) {
            const lastIdx = nextParts.length - 1;
            nextParts[lastIdx] = {
              ...nextParts[lastIdx],
              colorHex: colorInfo.hex,
            };
          }
          appliedSummaryList.push(
            `Đổi màu chi tiết nhấn sang ${colorInfo.labelVi} (${colorInfo.hex})`,
          );
        } else if (targetIndices.length > 0) {
          for (const tIdx of targetIndices) {
            nextParts[tIdx] = {
              ...nextParts[tIdx],
              colorHex: colorInfo.hex,
            };
          }
          const tNames = targetIndices
            .map((i) => nextParts[i]?.partName)
            .join(', ');
          appliedSummaryList.push(
            `Đổi màu [${tNames}] sang ${colorInfo.labelVi} (${colorInfo.hex})`,
          );
        } else {
          // Đổi màu thân dụng cụ / toàn bộ thân chính
          nextPrimaryHex = colorInfo.hex;
          nextSecondaryHex = colorInfo.hex;
          let updatedBody = false;
          nextParts = nextParts.map((p, idx) => {
            const pLow = p.partName.toLowerCase();
            if (
              pLow.includes('bầu') ||
              pLow.includes('thân') ||
              pLow.includes('ống') ||
              pLow.includes('vỏ') ||
              idx === 1 ||
              idx === 0
            ) {
              updatedBody = true;
              return { ...p, colorHex: colorInfo.hex };
            }
            return p;
          });
          if (!updatedBody && nextParts.length > 0) {
            nextParts[0] = { ...nextParts[0], colorHex: colorInfo.hex };
          }
          appliedSummaryList.push(
            `Đổi màu thân dụng cụ sang ${colorInfo.labelVi} (${colorInfo.hex})`,
          );
        }
      }

      // =====================================================================
      // 8. LỆNH ĐỔI HÌNH DẠNG KHỐI ("đổi sang hình trụ / bầu cầu / hình nón / hình hộp")
      // =====================================================================
      if (
        lowerClause.includes('đổi hình') ||
        lowerClause.includes('sang hình') ||
        lowerClause.includes('thành hình')
      ) {
        const newShape: AiGeneratedPartSpec['shape'] | null =
          lowerClause.includes('hình cầu') || lowerClause.includes('bầu cầu')
            ? 'sphere'
            : lowerClause.includes('hình nón')
              ? 'cone'
              : lowerClause.includes('hình hộp')
                ? 'beveled-box'
                : lowerClause.includes('vành khuyên')
                  ? 'torus'
                  : lowerClause.includes('hình trụ')
                    ? 'cylinder'
                    : null;
        if (newShape) {
          const shapeTargets =
            targetIndices.length > 0 ? targetIndices : [selected2DPartIndex];
          for (const sIdx of shapeTargets) {
            if (nextParts[sIdx]) {
              nextParts[sIdx] = { ...nextParts[sIdx], shape: newShape };
              appliedSummaryList.push(
                `Đổi hình dạng [${nextParts[sIdx].partName}] → ${newShape}`,
              );
            }
          }
        }
      }
    }

    sync2DBlueprintAndRecompile3D(nextParts, nextHeight, nextWidth, nextDepth, {
      primaryColorHex: nextPrimaryHex,
      secondaryColorHex: nextSecondaryHex,
      accentColorHex: nextAccentHex,
      glassOpacity: nextGlassOpacity,
      materialText: nextMaterial,
    });

    const summaryDetail =
      appliedSummaryList.length > 0
        ? appliedSummaryList.join(' · ')
        : `Đã cập nhật theo lệnh "${rawCommand}" (Cao ${nextHeight} cm × Rộng/Ø ${nextWidth} cm)`;

    setStatusBanner(
      `✔ Đã thực thi lệnh AI & vẽ lại tức thì: ${summaryDetail}.`,
    );
  };

  // Xử lý kéo chuột trực tiếp trên SVG Bản phác thảo 2D (Move & Resize thời gian thực)
  useEffect(() => {
    if (!drag2DState || !generatedBlueprint) return;

    const handlePointerMove = (ev: PointerEvent) => {
      const svgEl = svg2DRef.current;
      if (!svgEl) return;
      const rect = svgEl.getBoundingClientRect();
      const scaleX = 600 / Math.max(1, rect.width);
      const scaleY = 350 / Math.max(1, rect.height);

      const dxSvg = (ev.clientX - drag2DState.startClientX) * scaleX;
      const dySvg = (ev.clientY - drag2DState.startClientY) * scaleY;

      const totalDrawH = 230;
      const totalDrawW = 170;

      const currentParts = [...getActive2DParts(generatedBlueprint)];
      const targetPart = currentParts[drag2DState.partIndex];
      if (!targetPart) return;

      const initPos = drag2DState.initialPart.relativePos;
      const initScale = drag2DState.initialPart.relativeScale;

      let nextPosX = initPos[0];
      let nextPosY = initPos[1];
      let nextScaleW = initScale[0];
      let nextScaleH = initScale[1];
      let nextScaleD = initScale[2];

      let nextOverallHCm = drag2DState.initialHeightCm;
      let nextOverallWCm = drag2DState.initialWidthCm;
      let nextOverallDCm = drag2DState.initialDepthCm;

      if (drag2DState.mode === 'move') {
        nextPosX = Math.max(
          -0.65,
          Math.min(0.65, Number((initPos[0] + dxSvg / 140).toFixed(3))),
        );
        nextPosY = Math.max(
          0.04,
          Math.min(0.95, Number((initPos[1] - dySvg / totalDrawH).toFixed(3))),
        );
      } else if (drag2DState.mode === 'resize-top') {
        const deltaHNorm = -dySvg / totalDrawH;
        nextScaleH = Math.max(
          0.05,
          Math.min(0.95, Number((initScale[1] + deltaHNorm).toFixed(3))),
        );
        const actualDeltaH = nextScaleH - initScale[1];
        nextPosY = Math.max(
          0.04,
          Math.min(0.96, Number((initPos[1] + actualDeltaH * 0.5).toFixed(3))),
        );
        nextOverallHCm = Math.max(
          3,
          Number(
            (
              drag2DState.initialHeightCm *
              (1 + actualDeltaH * 0.65)
            ).toFixed(1),
          ),
        );
      } else if (drag2DState.mode === 'resize-bottom') {
        const deltaHNorm = dySvg / totalDrawH;
        nextScaleH = Math.max(
          0.05,
          Math.min(0.95, Number((initScale[1] + deltaHNorm).toFixed(3))),
        );
        const actualDeltaH = nextScaleH - initScale[1];
        nextPosY = Math.max(
          0.04,
          Math.min(0.96, Number((initPos[1] - actualDeltaH * 0.5).toFixed(3))),
        );
        nextOverallHCm = Math.max(
          3,
          Number(
            (
              drag2DState.initialHeightCm *
              (1 + actualDeltaH * 0.65)
            ).toFixed(1),
          ),
        );
      } else if (
        drag2DState.mode === 'resize-right' ||
        drag2DState.mode === 'resize-left'
      ) {
        const sign = drag2DState.mode === 'resize-right' ? 1 : -1;
        const deltaWNorm = (sign * dxSvg * 2) / totalDrawW;
        nextScaleW = Math.max(
          0.08,
          Math.min(1.35, Number((initScale[0] + deltaWNorm).toFixed(3))),
        );
        nextScaleD = nextScaleW;
        const actualDeltaW = nextScaleW - initScale[0];
        nextOverallWCm = Math.max(
          2,
          Number(
            (
              drag2DState.initialWidthCm *
              (1 + actualDeltaW * 0.65)
            ).toFixed(1),
          ),
        );
        if (generatedBlueprint.baseShapeType === 'Cylinder') {
          nextOverallDCm = nextOverallWCm;
        }
      } else if (drag2DState.mode === 'resize-corner') {
        const deltaWNorm = (dxSvg * 2) / totalDrawW;
        const deltaHNorm = -dySvg / totalDrawH;
        nextScaleW = Math.max(
          0.08,
          Math.min(1.35, Number((initScale[0] + deltaWNorm).toFixed(3))),
        );
        nextScaleD = nextScaleW;
        nextScaleH = Math.max(
          0.05,
          Math.min(0.95, Number((initScale[1] + deltaHNorm).toFixed(3))),
        );
        const actualDeltaH = nextScaleH - initScale[1];
        const actualDeltaW = nextScaleW - initScale[0];
        nextPosY = Math.max(
          0.04,
          Math.min(0.96, Number((initPos[1] + actualDeltaH * 0.5).toFixed(3))),
        );
        nextOverallHCm = Math.max(
          3,
          Number(
            (
              drag2DState.initialHeightCm *
              (1 + actualDeltaH * 0.65)
            ).toFixed(1),
          ),
        );
        nextOverallWCm = Math.max(
          2,
          Number(
            (
              drag2DState.initialWidthCm *
              (1 + actualDeltaW * 0.65)
            ).toFixed(1),
          ),
        );
        if (generatedBlueprint.baseShapeType === 'Cylinder') {
          nextOverallDCm = nextOverallWCm;
        }
      }

      currentParts[drag2DState.partIndex] = {
        ...targetPart,
        relativePos: [nextPosX, nextPosY, initPos[2]],
        relativeScale: [nextScaleW, nextScaleH, nextScaleD],
      };

      sync2DBlueprintAndRecompile3D(
        currentParts,
        nextOverallHCm,
        nextOverallWCm,
        nextOverallDCm,
      );
    };

    const handlePointerUp = () => {
      setDrag2DState(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [drag2DState, generatedBlueprint]);

  /**
   * Khi người dùng bấm nút [✔ Phác thảo đã OK, Tiến hành dựng 3D]:
   * Đồng bộ toàn bộ dữ liệu cấu trúc 2D hiện tại sang Three.js và mở khóa render 3D hoàn chỉnh!
   */
  const handleApprove2DSketchAndRender3D = () => {
    if (!generatedPackage || !generatedBlueprint) return;
    if (
      generatedBlueprint.customParts &&
      generatedBlueprint.customParts.length > 0
    ) {
      sync2DBlueprintAndRecompile3D(generatedBlueprint.customParts);
    }
    setIs2DSketchApproved(true);
    setShowRefinementBox(false);
    setPreviewMode('3d');
    setStatusBanner(
      `Đã đồng bộ 100% Bản phác thảo 2D (Cao ${heightCm || generatedPackage.asset.geometry.dimensions.height.value} cm × Rộng/Ø ${widthCm || generatedPackage.asset.geometry.dimensions.widthOrDiameter.value} cm) sang Three.js để dựng mô hình 3D hoàn chỉnh cho "${generatedBlueprint.nameVi}".`,
    );
  };

  /**
   * Bước 3: Dựng khung [Xem trước (Live Preview)] bằng Three.js WebGLRenderer
   * CHỈ CHẠY KHI NGƯỜI DÙNG ĐÃ XÁC NHẬN PHÁC THẢO 2D (is2DSketchApproved === true)
   */
  useEffect(() => {
    const container = previewMountRef.current;
    if (
      !container ||
      !generatedPackage ||
      previewMode !== '3d' ||
      !is2DSketchApproved
    )
      return;

    const width = Math.max(300, container.clientWidth);
    const height = Math.max(320, container.clientHeight);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#071224');

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.01, 20);
    camera.position.set(0.34, 0.26, 0.42);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Môi trường phản xạ PBR
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04,
    ).texture;
    pmremGenerator.dispose();

    // Ánh sáng phòng Lab chuẩn PBR Studio (Key Light đổ bóng tự nhiên + Hemisphere Fill + Rim Light + Grazing Specular Light)
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x0f172a, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.65);
    keyLight.position.set(0.85, 1.45, 1.15);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 5.0;
    keyLight.shadow.camera.left = -0.36;
    keyLight.shadow.camera.right = 0.36;
    keyLight.shadow.camera.top = 0.36;
    keyLight.shadow.camera.bottom = -0.36;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xbae6fd, 0.65);
    fillLight.position.set(-1.1, 0.9, 0.9);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.75);
    rimLight.position.set(-0.9, 1.1, -1.2);
    scene.add(rimLight);

    // Mặt bàn xoay mẫu 3D có vát cạnh nhận bóng đổ tự nhiên
    const pedestalGeo = new THREE.CylinderGeometry(0.19, 0.21, 0.016, 64);
    const pedestalMat = new THREE.MeshPhysicalMaterial({
      color: 0x102342,
      metalness: 0.28,
      roughness: 0.42,
      clearcoat: 0.2,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.008;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Đĩa bóng tiếp xúc mềm (Contact Shadow Grounding) dưới chân thiết bị
    const contactCanvas = document.createElement('canvas');
    contactCanvas.width = 256;
    contactCanvas.height = 256;
    const cCtx = contactCanvas.getContext('2d');
    if (cCtx) {
      const grad = cCtx.createRadialGradient(128, 128, 16, 128, 128, 120);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
      grad.addColorStop(0.6, 'rgba(0, 0, 0, 0.22)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
      cCtx.fillStyle = grad;
      cCtx.fillRect(0, 0, 256, 256);
    }
    const contactTex = new THREE.CanvasTexture(contactCanvas);
    const contactPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.32, 0.32),
      new THREE.MeshBasicMaterial({
        map: contactTex,
        transparent: true,
        depthWrite: false,
      }),
    );
    contactPlane.rotation.x = -Math.PI / 2;
    contactPlane.position.y = 0.0008;
    scene.add(contactPlane);

    const grid = new THREE.GridHelper(0.6, 12, 0x38bdf8, 0x1e3a5f);
    grid.position.y = 0.0004;
    scene.add(grid);

    // Dựng vật thể 3D từ hàm buildEquipmentGroup của gói Template 3D vừa được điền tham số
    let equipmentGroup = new THREE.Group();
    try {
      if (generatedPackage.buildEquipmentGroup) {
        equipmentGroup = generatedPackage.buildEquipmentGroup(
          THREE,
          generatedPackage.asset,
        );
      }
    } catch (err) {
      console.error('Lỗi dựng 3D từ Template:', err);
    }

    const heatedTubeInit = equipmentGroup.getObjectByName(
      'heated_test_tube_group',
    );
    if (heatedTubeInit) {
      setShowHeatedTubeDemo(heatedTubeInit.visible);
    } else {
      setShowHeatedTubeDemo(false);
    }

    scene.add(equipmentGroup);
    liveEquipmentGroupRef.current = equipmentGroup;

    // Canh giữa camera nhìn trực diện mặt trước thiết bị với khoảng cách tham chiếu cố định
    // để khi người dùng tăng/giảm chiều cao hoặc chiều rộng (VD: +5 cm), mô hình 3D to/cao lên rõ rệt trên màn hình
    const bbox = new THREE.Box3().setFromObject(equipmentGroup);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    bbox.getSize(size);
    bbox.getCenter(center);
    const refCamScale = Math.max(0.24, Math.min(0.48, Math.max(size.x, size.y, size.z) * 0.45 + 0.14));

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, Math.max(0.06, center.y), 0);
    camera.position.set(
      refCamScale * 0.42,
      Math.max(0.13, center.y + refCamScale * 0.48),
      refCamScale * 1.85,
    );
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = autoRotate3D;
    controls.autoRotateSpeed = 1.4;
    controls.update();

    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = performance.now() * 0.0045;
      const flameObj = equipmentGroup.getObjectByName('alcohol_flame_group');
      if (flameObj && flameObj.visible) {
        flameObj.rotation.y = Math.sin(t * 0.9) * 0.14;
        flameObj.position.x = Math.sin(t * 1.8) * 0.0008;
        const heatWaves = flameObj.getObjectByName('thermal_heat_waves');
        if (heatWaves) {
          heatWaves.position.y = ((t * 0.16) % 0.25) * 0.065;
          heatWaves.rotation.y = t * 0.6;
        }
        const bubbles = equipmentGroup.getObjectByName('boiling_bubbles_group');
        if (bubbles && bubbles.visible) {
          bubbles.position.y = Math.sin(t * 2.2) * 0.004;
          bubbles.rotation.y = t * 0.8;
        }
      }
      controls.autoRotate = autoRotate3D;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const nw = Math.max(280, container.clientWidth);
      const nh = Math.max(300, container.clientHeight);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
    };
  }, [generatedPackage, previewMode, autoRotate3D, is2DSketchApproved]);

  // Cập nhật trạng thái động trên mô hình 3D khi kéo thanh trượt trong Live Preview
  useEffect(() => {
    const pkg = livePkgRef.current;
    const grp = liveEquipmentGroupRef.current;
    if (!pkg || !grp || !pkg.applyEquipmentState) return;

    const isBurnerActive =
      generatedBlueprint?.shapeFamily === 'alcohol-burner'
        ? Math.abs(liveControlValue - (generatedBlueprint.controlMin ?? 0)) > 0.02
        : true;

    const dummyInstance: SceneInstance = {
      instanceId: 'ai-live-preview-inst',
      assetId: pkg.asset.assetId,
      assetVersion: pkg.asset.assetVersion,
      customLabel: pkg.asset.name.vi,
      parentZone: 'bench-main',
      transform: {
        positionM: [0, 0, 0],
        rotationRad: [0, 0, 0],
        displayScale: [1, 1, 1],
      },
      visible: true,
      locked: false,
      labelVisible: true,
      instanceState: {
        [pkg.moduleControls.stateKey]: liveControlValue,
        ...(pkg.moduleControls.stateKey === 'liquidLevelMl'
          ? { baseLiquidLevelMl: liveControlValue }
          : {}),
        isHeating: isBurnerActive,
        showHeatedTestTube: showHeatedTubeDemo,
      },
    };

    try {
      pkg.applyEquipmentState(THREE, grp, dummyInstance, pkg.asset);
    } catch {
      // Ignore state update error in preview
    }
  }, [liveControlValue, showHeatedTubeDemo, generatedPackage, generatedBlueprint]);

  const [savedToGlobalNotice, setSavedToGlobalNotice] = useState<string | null>(
    null,
  );

  const persistCurrentEquipmentToGlobalLibrary = (): {
    registeredPkg: HtmlEquipmentModulePackage;
    initialStatePatch: Partial<SceneInstance['instanceState']>;
  } | null => {
    if (!generatedPackage) return null;
    const syncedPkg: HtmlEquipmentModulePackage = {
      ...generatedPackage,
      moduleControls: {
        ...generatedPackage.moduleControls,
        defaultValue: liveControlValue,
      },
    };
    const registeredPkg = htmlEquipmentModuleRegistry.registerModule(
      syncedPkg,
      null,
      { skipDiskSave: false },
    );
    if (uploadedImageDataUrl) {
      htmlEquipmentModuleRegistry.setUploadedRealPhoto(
        registeredPkg.asset.assetId,
        uploadedImageDataUrl,
        registeredPkg.asset.name.vi,
      );
    }
    const ctrlKey = registeredPkg.moduleControls.stateKey;
    const isBurnerActive =
      generatedBlueprint?.shapeFamily === 'alcohol-burner'
        ? Math.abs(liveControlValue - (generatedBlueprint.controlMin ?? 0)) > 0.02
        : liveControlValue > registeredPkg.moduleControls.min;
    const initialStatePatch: Partial<SceneInstance['instanceState']> = {
      [ctrlKey]: liveControlValue,
      ...(ctrlKey === 'liquidLevelMl'
        ? { baseLiquidLevelMl: liveControlValue }
        : {}),
      isHeating: isBurnerActive,
      isPoweredOn: liveControlValue > registeredPkg.moduleControls.min,
      showHeatedTestTube: showHeatedTubeDemo,
    };
    htmlEquipmentModuleRegistry.setDefaultStatePatch(
      registeredPkg.asset.assetId,
      initialStatePatch,
    );
    return { registeredPkg, initialStatePatch };
  };

  /**
   * Bước 4A: Nút [💾 Xác nhận lưu vào kho] -> Lưu trọn gói vào Kho Thiết Bị Dùng Chung (`openlab_global_equipment`) độc lập với từng dự án
   */
  const handleSaveOnlyToGlobalLibrary = () => {
    const saved = persistCurrentEquipmentToGlobalLibrary();
    if (!saved) return;
    setSavedToGlobalNotice(
      `Đã lưu "${saved.registeredPkg.asset.name.vi}" kèm Bảng điều khiển (${saved.registeredPkg.moduleControls.label}: ${liveControlValue} ${saved.registeredPkg.moduleControls.unit}) vào Kho Thiết Bị Dùng Chung (openlab_global_equipment)! Mọi dự án đều có thể gọi tới qua nút [+ Thêm thiết bị từ Kho chung].`,
    );
  };

  /**
   * Bước 4B: Nút [✔ Xác nhận (Lưu vào kho & Đưa vào bàn 3D)] -> Lưu vào `openlab_global_equipment` VÀ tự động spawn Mô hình 3D + Bảng điều khiển lên bàn thí nghiệm 3D hiện tại
   */
  const handleConfirmAndSaveEquipment = () => {
    const saved = persistCurrentEquipmentToGlobalLibrary();
    if (!saved) return;
    onConfirmAndAddToProject(saved.registeredPkg, saved.initialStatePatch);
  };

  return (
    <div
      id="ai-equipment-designer-view"
      className={`flex-1 w-full h-full min-h-0 overflow-y-auto px-4 py-4 sm:px-6 lg:px-8 transition-colors ${
        isDarkMode
          ? 'bg-[#081222] text-slate-100'
          : 'bg-[#EEF5FF] text-[#0D2750]'
      }`}
    >
      <input
        ref={fileInputRef}
        id="image-upload"
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageUploadChange}
        className="hidden"
      />

      <div className="w-full max-w-none space-y-4">
        {/* THANH HEADER ĐIỀU HƯỚNG CỦA PHÂN VÙNG "DỤNG CỤ THÍ NGHIỆM" */}
        <header
          className={`w-full rounded-[16px] p-4 border flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 ${
            isDarkMode
              ? 'bg-[#0F1E36] border-[#264B82]'
              : 'bg-white border-[#C5DCFA] shadow-xs'
          }`}
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <button
              type="button"
              onClick={onBackToHomeDashboard}
              className={`px-3.5 py-2.5 rounded-[10px] border text-[13px] font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                isDarkMode
                  ? 'bg-[#152A4A] hover:bg-[#1E3B68] border-[#2C528C] text-white'
                  : 'bg-[#F2F7FF] hover:bg-[#E1EDFF] border-[#C5DCFA] text-[#09234C]'
              }`}
              title="Quay về màn hình Trang chủ OPEN LAB 3D"
            >
              <Home className="w-4 h-4 text-[#1E6BFF]" />
              <span>Trang chủ</span>
            </button>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1
                  className={`text-xl sm:text-2xl font-black tracking-tight ${
                    isDarkMode ? 'text-white' : 'text-[#09234C]'
                  }`}
                >
                  Dụng cụ thí nghiệm · Tự thiết kế dụng cụ tích hợp AI
                </h1>
                <span
                  className={`text-[12.5px] font-bold ${
                    isDarkMode ? 'text-[#6EE7B7]' : 'text-[#059669]'
                  }`}
                >
                  · Quy trình 4 bước khép kín trực tiếp trên web
                </span>
              </div>
              <p
                className={`text-[13px] font-medium mt-0.5 ${
                  isDarkMode ? 'text-slate-300' : 'text-[#425B80]'
                }`}
              >
                Bước 1: Nhập thông số &amp; tải ảnh · Bước 2: AI chế tạo mã HTML/3D · Bước 3: Xem trước 3D trực quan · Bước 4: Xác nhận đưa thẳng vào bàn thí nghiệm 3D
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Chuyển đổi giữa Studio Thiết kế AI và Kho dụng cụ cá nhân */}
            <div
              className={`flex items-center gap-1 p-1 rounded-[10px] border ${
                isDarkMode
                  ? 'bg-[#091528] border-[#264B82]'
                  : 'bg-[#F0F6FF] border-[#C5DCFA]'
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveSubTab('ai-studio')}
                className={`px-3 py-1.5 rounded-[7px] text-[12.5px] font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeSubTab === 'ai-studio'
                    ? 'bg-[#059669] text-white shadow-2xs'
                    : isDarkMode
                      ? 'text-slate-300 hover:text-white'
                      : 'text-[#334E73] hover:text-[#09234C]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tự thiết kế với AI</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('saved-library')}
                className={`px-3 py-1.5 rounded-[7px] text-[12.5px] font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeSubTab === 'saved-library'
                    ? 'bg-[#1E6BFF] text-white shadow-2xs'
                    : isDarkMode
                      ? 'text-slate-300 hover:text-white'
                      : 'text-[#334E73] hover:text-[#09234C]'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>Kho dụng cụ ({assets.length})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenProjectManager}
              className={`px-3.5 py-2 rounded-[10px] border text-[13px] font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDarkMode
                  ? 'bg-[#152A4A] hover:bg-[#1E3B68] border-[#2C528C] text-slate-100'
                  : 'bg-[#F2F7FF] hover:bg-[#E1EDFF] border-[#C5DCFA] text-[#12346B]'
              }`}
            >
              <FolderOpen className="w-4 h-4 text-[#1E6BFF]" />
              <span>Quản lý dự án 3D</span>
            </button>

            <button
              type="button"
              onClick={onOpen3DWorkbench}
              className="px-3.5 py-2 rounded-[10px] bg-[#1E6BFF] hover:bg-[#1557D6] text-white text-[13px] font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Vào Bàn thí nghiệm 3D</span>
            </button>
          </div>
        </header>

        {statusBanner && (
          <div
            className={`rounded-[12px] px-4 py-2.5 border text-[13.5px] font-bold flex items-center justify-between gap-3 ${
              isDarkMode
                ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{statusBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusBanner(null)}
              className="text-xs font-extrabold underline cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}

        {activeSubTab === 'ai-studio' ? (
          /* =================================================================
             KHÔNG GIAN CHÍNH: BƯỚC 1 & 2 (TRÁI) + BƯỚC 3 & 4 (PHẢI)
             ================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* CỘT TRÁI (5/12): BƯỚC 1 (NHẬP THÔNG TIN & HÌNH ẢNH) + BƯỚC 2 (NÚT AI CHẾ TẠO) */}
            <section
              aria-label="Bước 1 và Bước 2: Nhập thông số và nhờ AI chế tạo"
              className={`lg:col-span-5 rounded-[18px] border p-5 space-y-5 ${
                isDarkMode
                  ? 'bg-[#0F1E36] border-[#264B82]'
                  : 'bg-white border-[#C5DCFA] shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2 border-b pb-3 border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-[12px] font-extrabold uppercase tracking-wider text-[#059669] dark:text-[#34D399]">
                    Bước 1 &amp; Bước 2
                  </span>
                  <h2
                    className={`text-lg font-black ${
                      isDarkMode ? 'text-white' : 'text-[#09234C]'
                    }`}
                  >
                    Nhập thông tin, Hình ảnh &amp; Chế tạo bằng AI
                  </h2>
                </div>
              </div>

              {/* KHUNG TẢI LÊN HÌNH ẢNH THỰC TẾ / BẢN VẼ PHÁC THẢO */}
              <div className="space-y-2">
                <label
                  className={`block text-[13px] font-extrabold ${
                    isDarkMode ? 'text-slate-200' : 'text-[#09234C]'
                  }`}
                >
                  1. Hình ảnh thực tế / Bản vẽ phác thảo của dụng cụ:
                </label>

                {/* Khung bấm chọn tải lên nhiều ảnh cùng lúc */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full rounded-[14px] border-2 border-dashed p-3.5 flex flex-col items-center justify-center gap-1.5 text-center transition-colors cursor-pointer ${
                    isDarkMode
                      ? 'bg-[#091528]/80 hover:bg-[#132644] border-[#38BDF8]/60 text-slate-200'
                      : 'bg-[#F7FAFF] hover:bg-[#EAF3FF] border-[#1E6BFF]/60 text-[#09234C]'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-[#1E6BFF]/15 text-[#1E6BFF] dark:text-[#38BDF8] flex items-center justify-center">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[13.5px] font-extrabold text-[#1E6BFF] dark:text-[#38BDF8]">
                      {uploadedImages.length > 0
                        ? `[+ Chọn thêm hình ảnh từ các góc chụp khác (${uploadedImages.length} ảnh đã chọn)]`
                        : '[Tải lên hình ảnh thực tế / bản vẽ phác thảo (Hỗ trợ chọn nhiều ảnh)]'}
                    </span>
                    <span
                      className={`block text-[11.5px] font-medium mt-0.5 ${
                        isDarkMode ? 'text-slate-400' : 'text-[#506789]'
                      }`}
                    >
                      Có thể chọn đồng thời nhiều ảnh (mặt trước, mặt nghiêng, mặt trên...) để AI phân tích đa chiều
                    </span>
                  </div>
                </button>

                {/* Danh sách ảnh thu nhỏ (Thumbnail Preview) kèm tên file & nút xóa từng ảnh */}
                {uploadedImages.length > 0 && (
                  <div
                    className={`rounded-[14px] border-2 p-3 space-y-2.5 ${
                      isDarkMode
                        ? 'bg-[#091528] border-[#38BDF8]/60'
                        : 'bg-[#F3F8FF] border-[#9EC5F8]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[12px] font-extrabold ${
                          isDarkMode ? 'text-[#6EE7B7]' : 'text-[#059669]'
                        }`}
                      >
                        Đã chọn {uploadedImages.length} hình ảnh để AI phân tích đa chiều:
                      </span>
                      <button
                        type="button"
                        onClick={handleClearAllImages}
                        className="px-2 py-1 rounded-[7px] bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white text-[11.5px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa tất cả</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {uploadedImages.map((imgItem, idx) => (
                        <div
                          key={imgItem.id}
                          className={`rounded-[10px] border p-2 flex items-center justify-between gap-2.5 ${
                            isDarkMode
                              ? 'bg-[#10203A] border-[#264B82]'
                              : 'bg-white border-[#C5DCFA]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={imgItem.dataUrl}
                              alt={imgItem.name}
                              className="w-12 h-12 rounded-[8px] object-contain bg-slate-950/60 border border-slate-700 p-0.5 shrink-0"
                            />
                            <div className="min-w-0">
                              <p
                                className="text-[12px] font-extrabold truncate"
                                title={imgItem.name}
                              >
                                {imgItem.name}
                              </p>
                              <p
                                className={`text-[10.5px] font-bold ${
                                  isDarkMode ? 'text-sky-300' : 'text-[#1E6BFF]'
                                }`}
                              >
                                Góc chụp #{idx + 1}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveSingleImage(imgItem.id)}
                            className="p-1.5 rounded-[7px] bg-rose-600/15 hover:bg-rose-600 text-rose-500 hover:text-white shrink-0 cursor-pointer transition-colors"
                            title={`Xóa ảnh ${imgItem.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CÁC Ô NHẬP LIỆU ĐỂ TRỐNG HOÀN TOÀN (BLANK FIELDS) & CHO PHÉP NHẬP SỐ THẬP PHÂN */}
              <div className="space-y-3.5">
                {/* KHO TEMPLATE 3D MẪU CHUẨN + ĐIỀN THAM SỐ (PARAMETRIC TEMPLATES) */}
                <div
                  className={`p-3 rounded-[12px] border space-y-2.5 ${
                    isDarkMode
                      ? 'bg-[#091528] border-[#38BDF8]/50'
                      : 'bg-[#F0F7FF] border-[#9EC5F8]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="parametric-template-select"
                      className={`text-[12.5px] font-black ${
                        isDarkMode ? 'text-[#38BDF8]' : 'text-[#09234C]'
                      }`}
                    >
                      Kho Template 3D mẫu chuẩn (AI điền tham số lên mẫu chuẩn):
                    </label>
                    {selectedTemplateId && (
                      <button
                        type="button"
                        onClick={() => setSelectedTemplateId('')}
                        className="text-[11px] font-bold text-rose-400 hover:underline cursor-pointer"
                      >
                        Bỏ chọn
                      </button>
                    )}
                  </div>

                  {/* Các nút chọn nhanh Template 3D phổ biến */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {PARAMETRIC_3D_TEMPLATES.slice(0, 6).map((tpl) => {
                      const isSelected = selectedTemplateId === tpl.templateId;
                      return (
                        <button
                          key={tpl.templateId}
                          type="button"
                          onClick={() =>
                            setSelectedTemplateId(
                              isSelected ? '' : tpl.templateId,
                            )
                          }
                          className={`px-2.5 py-1.5 rounded-[8px] border text-left text-[11.5px] font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#1E6BFF] border-[#38BDF8] text-white shadow-xs'
                              : isDarkMode
                                ? 'bg-[#0F1E36] hover:bg-[#162B4D] border-[#264B82] text-slate-200'
                                : 'bg-white hover:bg-[#E1EDFF] border-[#C5DCFA] text-[#09234C]'
                          }`}
                        >
                          <span aria-hidden="true">{tpl.badgeIcon}</span>
                          <span className="truncate">{tpl.shortLabelVi}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Dropdown đầy đủ 10 Template 3D mẫu chuẩn */}
                  <select
                    id="parametric-template-select"
                    value={selectedTemplateId}
                    onChange={(e) =>
                      setSelectedTemplateId(
                        e.target.value as AiEquipmentShapeFamily | '',
                      )
                    }
                    className={`w-full px-3 py-2 rounded-[9px] border text-[12.5px] font-bold focus:outline-none ${
                      isDarkMode
                        ? 'bg-[#0F1E36] border-[#2C528C] text-white'
                        : 'bg-white border-[#9EC5F8] text-[#09234C]'
                    }`}
                  >
                    <option value="">
                      -- Tự động khớp Template từ Tên / Mô tả (hoặc chọn trực tiếp tại đây) --
                    </option>
                    {PARAMETRIC_3D_TEMPLATES.map((tpl) => (
                      <option key={tpl.templateId} value={tpl.templateId}>
                        {tpl.badgeIcon} {tpl.nameVi}
                      </option>
                    ))}
                  </select>

                  {selectedTemplateId && (
                    <div
                      className={`p-2.5 rounded-[8px] border text-[11.5px] leading-relaxed ${
                        isDarkMode
                          ? 'bg-[#0F1E36]/90 border-[#1E3B68] text-slate-200'
                          : 'bg-white border-[#C5DCFA] text-[#1E3A5F]'
                      }`}
                    >
                      <p className="font-extrabold text-[#38BDF8]">
                        ✔ Đã khóa {getParametricTemplateById(selectedTemplateId).nameVi}:
                      </p>
                      <p className="mt-0.5">
                        <strong>Cấu trúc 3D gốc:</strong>{' '}
                        {
                          getParametricTemplateById(selectedTemplateId)
                            .geometryStructureSummaryVi
                        }
                      </p>
                      <p className="mt-0.5 text-emerald-400 font-semibold">
                        <strong>AI Điền tham số:</strong>{' '}
                        {getParametricTemplateById(
                          selectedTemplateId,
                        ).mappedParametersVi.join(' · ')}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label
                    className={`block text-[13px] font-extrabold mb-1 ${
                      isDarkMode ? 'text-slate-200' : 'text-[#09234C]'
                    }`}
                  >
                    2. Tên dụng cụ thí nghiệm:
                  </label>
                  <input
                    type="text"
                    value={nameVi}
                    onChange={(e) => setNameVi(e.target.value)}
                    placeholder="Nhập tên dụng cụ..."
                    className={`w-full px-3.5 py-2 rounded-[10px] border text-[14px] font-bold focus:outline-none ${
                      isDarkMode
                        ? 'bg-[#091528] border-[#2C528C] focus:border-[#38BDF8] text-white placeholder:text-slate-500'
                        : 'bg-[#F7FAFF] border-[#9EC5F8] focus:border-[#1E6BFF] text-[#09234C] placeholder:text-slate-400'
                    }`}
                  />
                </div>

                {/* Nhóm dụng cụ & Chất liệu */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      className={`block text-[12.5px] font-extrabold mb-1 ${
                        isDarkMode ? 'text-slate-300' : 'text-[#334E73]'
                      }`}
                    >
                      Nhóm dụng cụ:
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={`w-full px-3 py-2 rounded-[10px] border text-[13px] font-bold focus:outline-none ${
                        isDarkMode
                          ? 'bg-[#091528] border-[#2C528C] text-white'
                          : 'bg-[#F7FAFF] border-[#9EC5F8] text-[#09234C]'
                      }`}
                    >
                      <option value="">-- Chọn nhóm dụng cụ --</option>
                      <option value="optical-equipment">
                        Quang học &amp; Ánh sáng
                      </option>
                      <option value="volume-measurement">
                        Đo thể tích &amp; Thủy tinh
                      </option>
                      <option value="force-measurement">
                        Đo lực &amp; Cơ học
                      </option>
                      <option value="mass-measurement">
                        Cân &amp; Đo khối lượng
                      </option>
                      <option value="electrical-equipment">
                        Điện &amp; Điện từ
                      </option>
                      <option value="thermal-equipment">
                        Nhiệt học &amp; Gia nhiệt
                      </option>
                      <option value="chemical-apparatus">
                        Hóa học &amp; Cảm biến
                      </option>
                      <option value="biology-microscopy">
                        Sinh học &amp; Hiển vi
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      className={`block text-[12.5px] font-extrabold mb-1 ${
                        isDarkMode ? 'text-slate-300' : 'text-[#334E73]'
                      }`}
                    >
                      Chất liệu chế tạo:
                    </label>
                    <input
                      type="text"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      placeholder="Nhập chất liệu..."
                      className={`w-full px-3 py-2 rounded-[10px] border text-[13px] font-bold focus:outline-none ${
                        isDarkMode
                          ? 'bg-[#091528] border-[#2C528C] text-white placeholder:text-slate-500'
                          : 'bg-[#F7FAFF] border-[#9EC5F8] text-[#09234C] placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Kích thước hình học (cm) — Tự động chuyển đổi theo Bộ từ khóa nhận diện hình học (Cylinder vs. Box) */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <label
                      className={`block text-[12.5px] font-extrabold ${
                        isDarkMode ? 'text-slate-300' : 'text-[#334E73]'
                      }`}
                    >
                      3. Kích thước hình học (cm):
                    </label>
                    <span
                      className={`px-2 py-0.5 rounded-[6px] border text-[11px] font-extrabold ${
                        liveShapeClassification.shapeType === 'Cylinder'
                          ? isDarkMode
                            ? 'bg-sky-500/20 border-sky-400/50 text-sky-300'
                            : 'bg-sky-50 border-sky-300 text-sky-800'
                          : isDarkMode
                            ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                            : 'bg-amber-50 border-amber-300 text-amber-900'
                      }`}
                    >
                      Hình học tự động: {liveShapeClassification.labelVi}
                      {liveShapeClassification.matchedKeywords.length > 0
                        ? ` (từ khóa: ${liveShapeClassification.matchedKeywords.join(', ')})`
                        : ''}
                    </span>
                  </div>

                  <div
                    className={`grid gap-2.5 ${
                      liveShapeClassification.hideDepthInput
                        ? 'grid-cols-2'
                        : 'grid-cols-3'
                    }`}
                  >
                    <div>
                      <span className="block text-[11px] font-bold opacity-80 mb-0.5">
                        Chiều cao (cm)
                      </span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        inputMode="decimal"
                        placeholder="0.0"
                        value={heightCm}
                        onChange={(e) => setHeightCm(e.target.value)}
                        className={`w-full px-3 py-1.5 rounded-[9px] border text-[13.5px] font-bold focus:outline-none ${
                          isDarkMode
                            ? 'bg-[#091528] border-[#2C528C] focus:border-[#38BDF8] text-white placeholder:text-slate-500'
                            : 'bg-[#F7FAFF] border-[#9EC5F8] focus:border-[#1E6BFF] text-[#09234C] placeholder:text-slate-400'
                        }`}
                      />
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold opacity-80 mb-0.5">
                        {liveShapeClassification.hideDepthInput
                          ? 'Đường kính (cm)'
                          : 'Chiều rộng (cm)'}
                      </span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        inputMode="decimal"
                        placeholder="0.0"
                        value={widthCm}
                        onChange={(e) => setWidthCm(e.target.value)}
                        className={`w-full px-3 py-1.5 rounded-[9px] border text-[13.5px] font-bold focus:outline-none ${
                          isDarkMode
                            ? 'bg-[#091528] border-[#2C528C] focus:border-[#38BDF8] text-white placeholder:text-slate-500'
                            : 'bg-[#F7FAFF] border-[#9EC5F8] focus:border-[#1E6BFF] text-[#09234C] placeholder:text-slate-400'
                        }`}
                      />
                    </div>
                    {!liveShapeClassification.hideDepthInput && (
                      <div>
                        <span className="block text-[11px] font-bold opacity-80 mb-0.5">
                          Chiều sâu (bề dày) (cm)
                        </span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          inputMode="decimal"
                          placeholder="0.0"
                          value={depthCm}
                          onChange={(e) => setDepthCm(e.target.value)}
                          className={`w-full px-3 py-1.5 rounded-[9px] border text-[13.5px] font-bold focus:outline-none ${
                            isDarkMode
                              ? 'bg-[#091528] border-[#2C528C] focus:border-[#38BDF8] text-white placeholder:text-slate-500'
                              : 'bg-[#F7FAFF] border-[#9EC5F8] focus:border-[#1E6BFF] text-[#09234C] placeholder:text-slate-400'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Thông số vật lý (Khối lượng, Tiêu cự, Dung tích) — Hỗ trợ nhập số thập phân (step="any") */}
                <div>
                  <label
                    className={`block text-[12.5px] font-extrabold mb-1 ${
                      isDarkMode ? 'text-slate-300' : 'text-[#334E73]'
                    }`}
                  >
                    4. Thông số vật lý chuẩn (Khối lượng, Tiêu cự, Dung tích):
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <span className="block text-[11px] font-bold opacity-80 mb-0.5">
                        Khối lượng m (g)
                      </span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        inputMode="decimal"
                        placeholder="0.0"
                        value={massG}
                        onChange={(e) => setMassG(e.target.value)}
                        className={`w-full px-3 py-1.5 rounded-[9px] border text-[13.5px] font-bold focus:outline-none ${
                          isDarkMode
                            ? 'bg-[#091528] border-[#2C528C] focus:border-[#38BDF8] text-white placeholder:text-slate-500'
                            : 'bg-[#F7FAFF] border-[#9EC5F8] focus:border-[#1E6BFF] text-[#09234C] placeholder:text-slate-400'
                        }`}
                      />
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold opacity-80 mb-0.5">
                        Tiêu cự f (cm)
                      </span>
                      <input
                        type="number"
                        step="any"
                        inputMode="decimal"
                        placeholder="0.0"
                        value={focalLengthCm}
                        onChange={(e) => setFocalLengthCm(e.target.value)}
                        className={`w-full px-3 py-1.5 rounded-[9px] border text-[13.5px] font-bold focus:outline-none ${
                          isDarkMode
                            ? 'bg-[#091528] border-[#2C528C] focus:border-[#38BDF8] text-white placeholder:text-slate-500'
                            : 'bg-[#F7FAFF] border-[#9EC5F8] focus:border-[#1E6BFF] text-[#09234C] placeholder:text-slate-400'
                        }`}
                      />
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold opacity-80 mb-0.5">
                        Dung tích V (ml)
                      </span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        inputMode="decimal"
                        placeholder="0.0"
                        value={capacityMl}
                        onChange={(e) => setCapacityMl(e.target.value)}
                        className={`w-full px-3 py-1.5 rounded-[9px] border text-[13.5px] font-bold focus:outline-none ${
                          isDarkMode
                            ? 'bg-[#091528] border-[#2C528C] focus:border-[#38BDF8] text-white placeholder:text-slate-500'
                            : 'bg-[#F7FAFF] border-[#9EC5F8] focus:border-[#1E6BFF] text-[#09234C] placeholder:text-slate-400'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Ô nhập liệu 1: "Mô tả ngoại hình chi tiết" (Prompt chi tiết để AI dựng 3D chính xác) */}
                <div>
                  <label
                    htmlFor="detailed-appearance-prompt"
                    className={`block text-[12.5px] font-extrabold mb-1 ${
                      isDarkMode ? 'text-slate-200' : 'text-[#09234C]'
                    }`}
                  >
                    Mô tả ngoại hình chi tiết (Hình dáng, cấu tạo, đặc điểm nhận dạng để AI dựng 3D chính xác):
                  </label>
                  <textarea
                    id="detailed-appearance-prompt"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Nhập các yêu cầu cụ thể về hình dáng, cấu tạo (Ví dụ: Thanh nam châm vĩnh cửu hình hộp chữ nhật chia 2 nửa Cực Bắc N màu đỏ và Cực Nam S màu xanh; hoặc Nam châm chữ U; hoặc Ampe kế kim chỉ)..."
                    className={`w-full px-3.5 py-2.5 rounded-[10px] border text-[13px] font-medium leading-relaxed focus:outline-none ${
                      isDarkMode
                        ? 'bg-[#091528] border-[#38BDF8]/60 focus:border-[#38BDF8] text-white placeholder:text-slate-500'
                        : 'bg-[#F7FAFF] border-[#9EC5F8] focus:border-[#1E6BFF] text-[#09234C] placeholder:text-slate-400'
                    }`}
                  />
                </div>

                {/* Ô nhập liệu 2: "Mô tả hoạt động / Nguyên lý vận hành" */}
                <div>
                  <label
                    htmlFor="detailed-operation-prompt"
                    className={`block text-[12.5px] font-extrabold mb-1 ${
                      isDarkMode ? 'text-slate-200' : 'text-[#09234C]'
                    }`}
                  >
                    Mô tả hoạt động / Nguyên lý vận hành (Cách dụng cụ tương tác và hoạt động trong thí nghiệm):
                  </label>
                  <textarea
                    id="detailed-operation-prompt"
                    rows={3}
                    value={operationPrompt}
                    onChange={(e) => setOperationPrompt(e.target.value)}
                    placeholder="Nhập cách thức hoạt động (Ví dụ: Tạo từ trường đều giữa 2 cực Bắc N và Nam S, hút các vật bằng sắt/thép hoặc làm lệch kim nam châm thử...)"
                    className={`w-full px-3.5 py-2.5 rounded-[10px] border text-[13px] font-medium leading-relaxed focus:outline-none ${
                      isDarkMode
                        ? 'bg-[#091528] border-[#34D399]/60 focus:border-[#34D399] text-white placeholder:text-slate-500'
                        : 'bg-[#F7FAFF] border-[#9EC5F8] focus:border-[#1E6BFF] text-[#09234C] placeholder:text-slate-400'
                    }`}
                  />
                </div>

                {/* Ô nhập liệu 3: "Đường dẫn tham khảo (Link tài liệu / bài viết / thông số kỹ thuật chi tiết)" */}
                <div>
                  <label
                    htmlFor="reference-url-input"
                    className={`block text-[12.5px] font-extrabold mb-1 ${
                      isDarkMode ? 'text-slate-200' : 'text-[#09234C]'
                    }`}
                  >
                    Đường dẫn tham khảo (Link tài liệu / bài viết / thông số kỹ thuật chi tiết):
                  </label>
                  <input
                    id="reference-url-input"
                    type="url"
                    value={referenceUrl}
                    onChange={(e) => setReferenceUrl(e.target.value)}
                    placeholder="Dán link trang web hoặc tài liệu hướng dẫn vào đây (Ví dụ: link mô tả cấu tạo ampe kế, sách giáo khoa...)..."
                    className={`w-full px-3.5 py-2.5 rounded-[10px] border text-[13px] font-medium focus:outline-none ${
                      isDarkMode
                        ? 'bg-[#091528] border-[#38BDF8]/60 focus:border-[#38BDF8] text-white placeholder:text-slate-500'
                        : 'bg-[#F7FAFF] border-[#9EC5F8] focus:border-[#1E6BFF] text-[#09234C] placeholder:text-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* BƯỚC 2: NÚT BẤM [🤖 Nhờ AI phân tích và chế tạo dụng cụ] */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => void handleRunAiBuild(false)}
                  disabled={isAiGenerating}
                  className="w-full py-3.5 px-5 rounded-[12px] bg-[#1E6BFF] hover:bg-[#1557D6] disabled:opacity-60 text-white text-[15px] font-black flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer"
                >
                  <span role="img" aria-hidden="true" className="text-lg">
                    🤖
                  </span>
                  <span>
                    {isAiGenerating
                      ? 'AI đang phân tích hình ảnh & chế tạo mô hình 3D...'
                      : 'Nhờ AI phân tích và chế tạo dụng cụ'}
                  </span>
                </button>
              </div>
            </section>

            {/* CỘT PHẢI (7/12): BƯỚC 3 (XEM TRƯỚC LIVE PREVIEW) + BƯỚC 4 (XÁC NHẬN ĐƯA VÀO DỰ ÁN / YÊU CẦU AI SỬA THÊM) */}
            <section
              aria-label="Bước 3 và Bước 4: Xem trước Live Preview và Xác nhận đưa vào dự án"
              className={`lg:col-span-7 rounded-[18px] border p-5 flex flex-col justify-between gap-4 ${
                isDarkMode
                  ? 'bg-[#0F1E36] border-[#264B82]'
                  : 'bg-white border-[#C5DCFA] shadow-xs'
              }`}
            >
              {/* Header khung Hỏi đáp làm rõ -> Phác thảo 2D -> Xem trước 3D */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-[12px] font-extrabold uppercase tracking-wider text-[#1E6BFF] dark:text-[#38BDF8]">
                    Quy trình an toàn 2 bước · Hỏi đáp làm rõ &amp; Duyệt Phác thảo 2D trước khi dựng 3D
                  </span>
                  <h2
                    className={`text-lg font-black ${
                      isDarkMode ? 'text-white' : 'text-[#09234C]'
                    }`}
                  >
                    {previewMode === 'clarification'
                      ? 'Bước Hỏi đáp làm rõ thông tin:'
                      : previewMode === 'sketch-2d'
                        ? 'Bản phác thảo cấu trúc 2D:'
                        : 'Khung Xem trước (Live Preview 3D):'}{' '}
                    <span className="text-[#1E6BFF] dark:text-[#7DD3FC]">
                      {generatedBlueprint?.nameVi ||
                        nameVi.trim() ||
                        'Chưa khởi tạo dụng cụ'}
                    </span>
                  </h2>
                </div>

                {/* Chuyển đổi chế độ xem theo quy trình: Hỏi đáp -> Phác thảo 2D -> Mô hình 3D -> Cấu tạo -> Mã HTML */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('clarification')}
                    className={`px-2.5 py-1.5 rounded-[8px] text-[12px] font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      previewMode === 'clarification'
                        ? 'bg-amber-500 text-slate-950'
                        : isDarkMode
                          ? 'bg-[#132644] text-amber-300 hover:text-white'
                          : 'bg-amber-50 text-amber-900 border border-amber-300'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>
                      1. Hỏi đáp AI
                      {clarificationMemory.length > 0
                        ? ` (${clarificationMemory.length})`
                        : ''}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewMode('sketch-2d')}
                    className={`px-2.5 py-1.5 rounded-[8px] text-[12px] font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      previewMode === 'sketch-2d'
                        ? 'bg-[#059669] text-white'
                        : isDarkMode
                          ? 'bg-[#132644] text-emerald-300 hover:text-white'
                          : 'bg-emerald-50 text-[#065F46] border border-emerald-300'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>2. Bản phác thảo cấu trúc 2D</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (is2DSketchApproved) {
                        setPreviewMode('3d');
                      } else {
                        setPreviewMode('sketch-2d');
                        setStatusBanner(
                          'Vui lòng kiểm tra "Bản phác thảo cấu trúc 2D" và bấm nút [✔ Phác thảo đã OK, Tiến hành dựng 3D] trước khi mở Mô hình 3D!',
                        );
                      }
                    }}
                    disabled={!generatedPackage}
                    title={
                      is2DSketchApproved
                        ? 'Xem mô hình 3D hoàn chỉnh'
                        : 'Cần xác nhận Bản phác thảo 2D trước khi dựng 3D'
                    }
                    className={`px-2.5 py-1.5 rounded-[8px] text-[12px] font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-45 transition-colors ${
                      previewMode === '3d'
                        ? 'bg-[#1E6BFF] text-white'
                        : is2DSketchApproved
                          ? isDarkMode
                            ? 'bg-[#132644] text-slate-300 hover:text-white'
                            : 'bg-[#F0F7FF] text-[#09234C]'
                          : 'bg-slate-800/60 text-slate-400 border border-dashed border-slate-600'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>
                      3. Mô hình 3D {is2DSketchApproved ? '✓' : '🔒'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewMode('specs')}
                    disabled={!generatedBlueprint}
                    className={`px-2.5 py-1.5 rounded-[8px] text-[12px] font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-45 transition-colors ${
                      previewMode === 'specs'
                        ? 'bg-[#1E6BFF] text-white'
                        : isDarkMode
                          ? 'bg-[#132644] text-slate-300 hover:text-white'
                          : 'bg-[#F0F7FF] text-[#09234C]'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Cấu tạo AI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewMode('code')}
                    disabled={!generatedHtmlSource}
                    className={`px-2.5 py-1.5 rounded-[8px] text-[12px] font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-45 transition-colors ${
                      previewMode === 'code'
                        ? 'bg-[#1E6BFF] text-white'
                        : isDarkMode
                          ? 'bg-[#132644] text-slate-300 hover:text-white'
                          : 'bg-[#F0F7FF] text-[#09234C]'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Mã HTML/3D</span>
                  </button>
                </div>
              </div>

              {/* ===============================================================
                  GIAI ĐOẠN 1: BƯỚC HỎI ĐÁP LÀM RÕ THÔNG TIN (CLARIFICATION STEP)
                  =============================================================== */}
              {previewMode === 'clarification' && (
                <div
                  className={`rounded-[14px] border-2 p-4 space-y-4 ${
                    isDarkMode
                      ? 'bg-[#091528] border-amber-400/70 text-slate-100'
                      : 'bg-amber-50/70 border-amber-400 text-[#09234C]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-lg">
                      🤖
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[12px] font-black uppercase tracking-wider text-amber-500 dark:text-amber-300">
                          Bước 1 An Toàn · AI Hỏi đáp làm rõ thông tin trước khi phác thảo
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-[11px] font-bold text-amber-300">
                          Chưa dựng 3D · Đang chờ làm rõ
                        </span>
                      </div>

                      {/* Thông báo câu hỏi chính thức từ AI theo đúng mẫu yêu cầu */}
                      <div
                        className={`p-3.5 rounded-[12px] border text-[14px] font-extrabold leading-relaxed ${
                          isDarkMode
                            ? 'bg-[#102341] border-amber-400/50 text-amber-200'
                            : 'bg-white border-amber-300 text-[#09234C]'
                        }`}
                      >
                        {clarificationCheck?.aiQuestionMessage ||
                          `AI chưa rõ chi tiết [${
                            !nameVi.trim()
                              ? 'tên dụng cụ và cấu tạo đặc trưng'
                              : 'tỷ lệ hình học chi tiết của từng bộ phận hoặc cơ cấu hoạt động'
                          }], bạn có thể bổ sung thêm giúp mình được không?`}
                      </div>
                    </div>
                  </div>

                  {/* Lịch sử Bộ nhớ tạm Hỏi đáp (Clarification Temporary Memory) */}
                  {clarificationMemory.length > 0 && (
                    <div
                      className={`p-3 rounded-[10px] border space-y-2 ${
                        isDarkMode
                          ? 'bg-[#0D1E38] border-[#264B82]'
                          : 'bg-white border-[#C5DCFA]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11.5px] font-extrabold text-emerald-400 uppercase">
                          🧠 Bộ nhớ tạm Hỏi đáp làm rõ đã lưu ({clarificationMemory.length} mục):
                        </span>
                        <button
                          type="button"
                          onClick={() => setClarificationMemory([])}
                          className="text-[11px] font-bold text-rose-400 hover:underline cursor-pointer"
                        >
                          Xóa bộ nhớ tạm
                        </button>
                      </div>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {clarificationMemory.map((item, idx) => (
                          <div
                            key={idx}
                            className="text-[12px] p-2 rounded-[8px] bg-slate-900/60 border border-slate-700/70 space-y-0.5"
                          >
                            <div className="text-amber-300/90 font-semibold">
                              🤖 AI: {item.question}
                            </div>
                            <div className="text-emerald-300 font-bold">
                              👤 Bạn trả lời ({item.timestamp}): {item.answer}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Các gợi ý trả lời nhanh để người dùng bấm chọn hoặc tự gõ */}
                  <div className="space-y-1.5">
                    <span className="block text-[12px] font-bold opacity-85">
                      Gợi ý trả lời nhanh (bấm để điền vào ô trả lời hoặc tự gõ chi tiết bên dưới):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(clarificationCheck?.suggestedQuickReplies &&
                      clarificationCheck.suggestedQuickReplies.length > 0
                        ? clarificationCheck.suggestedQuickReplies
                        : [
                            'Đây là Thanh nam châm vĩnh cửu hình hộp chữ nhật, chia 2 cực Bắc (N - màu đỏ) và Nam (S - màu xanh), dài 18 cm, cao 5 cm',
                            'Đây là Nam châm chữ U (móng ngựa) có 2 nhánh đứng sơn đỏ (N) và xanh (S), cao 14 cm, rộng 11 cm',
                            'Đây là Ampe kế vỏ hộp chữ nhật bo góc, mặt chia độ kim chỉ và chốt cắm (+/-), cao 15 cm, rộng 12 cm',
                            'Đây là Biến trở con chạy có cuộn dây hợp kim trên ống sứ và thanh trượt phía trên, cao 12 cm, rộng 22 cm',
                          ]
                      ).map((replyHint, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setClarificationInput((prev) =>
                              prev.trim()
                                ? `${prev.trim()}; ${replyHint}`
                                : replyHint,
                            );
                            clarificationInputRef.current?.focus();
                          }}
                          className={`px-2.5 py-1.5 rounded-[8px] border text-[11.5px] font-bold text-left cursor-pointer transition-colors ${
                            isDarkMode
                              ? 'bg-[#132644] hover:bg-[#1E6BFF] border-[#2C528C] text-slate-200'
                              : 'bg-white hover:bg-[#1E6BFF] hover:text-white border-amber-300 text-[#09234C]'
                          }`}
                        >
                          + {replyHint}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ô nhập câu trả lời của người dùng cập nhật thẳng vào bộ nhớ tạm */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                    <input
                      ref={clarificationInputRef}
                      type="text"
                      value={clarificationInput}
                      onChange={(e) => setClarificationInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && clarificationInput.trim()) {
                          e.preventDefault();
                          void handleSubmitClarificationAnswer();
                        }
                      }}
                      placeholder="Gõ câu trả lời bổ sung cho AI (VD: Thanh nam châm vĩnh cửu hình hộp dài có 2 cực Bắc N màu đỏ và Nam S màu xanh, dài 18cm, cao 5cm)..."
                      className={`flex-1 px-3.5 py-2.5 rounded-[10px] border text-[13.5px] font-bold focus:outline-none ${
                        isDarkMode
                          ? 'bg-[#0F1E36] border-amber-400/70 text-white placeholder:text-slate-400'
                          : 'bg-white border-amber-500 text-[#09234C] placeholder:text-slate-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => void handleSubmitClarificationAnswer()}
                      disabled={!clarificationInput.trim() || isAiGenerating}
                      className="px-4 py-2.5 rounded-[10px] bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-[13px] flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      <span>Gửi bổ sung &amp; Lập phác thảo 2D</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-amber-400/30 text-[12px]">
                    <span className="opacity-80 font-medium">
                      Thông tin bạn nhập sẽ được lưu trực tiếp vào bộ nhớ tạm để AI lập Bản phác thảo cấu trúc 2D.
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        void handleRunAiBuild(
                          false,
                          undefined,
                          clarificationMemory,
                          true,
                        )
                      }
                      className="font-extrabold text-sky-400 hover:underline cursor-pointer"
                    >
                      Bỏ qua hỏi đáp → Lập phác thảo 2D với dữ liệu hiện có
                    </button>
                  </div>
                </div>
              )}

              {/* ===============================================================
                  GIAI ĐOẠN 2: BƯỚC XÁC NHẬN "BẢN PHÁC THẢO CẤU TRÚC 2D" (2D SKETCH REVIEW)
                  =============================================================== */}
              {previewMode === 'sketch-2d' && (
                <div className="space-y-3.5">
                  {generatedBlueprint ? (
                    <div
                      className={`rounded-[14px] border-2 p-4 space-y-4 ${
                        isDarkMode
                          ? 'bg-[#071426] border-[#10B981]/70 text-slate-100'
                          : 'bg-[#F2FBF7] border-[#059669] text-[#09234C]'
                      }`}
                    >
                      {/* Tiêu đề Bản phác thảo cấu trúc 2D */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 border-emerald-500/30">
                        <div className="flex items-center gap-2">
                          <Compass className="w-5 h-5 text-emerald-400 shrink-0" />
                          <div>
                            <h3 className="text-[15px] font-black text-emerald-400">
                              Bản phác thảo cấu trúc 2D — {generatedBlueprint.nameVi}
                            </h3>
                            <p className="text-[11.5px] font-semibold opacity-85">
                              Sơ đồ khối, tỷ lệ các phần &amp; hình vẽ mặt cắt cấu tạo dự kiến trước khi chạy Three.js 3D
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-black border ${
                            is2DSketchApproved
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                              : 'bg-amber-500/20 border-amber-400 text-amber-300'
                          }`}
                        >
                          {is2DSketchApproved
                            ? '✔ Đã duyệt Phác thảo 2D'
                            : '⏳ Chờ bạn xác nhận Phác thảo 2D'}
                        </span>
                      </div>

                      {/* KHUNG TÓM TẮT BẮT BUỘC: [LOẠI HÌNH HỌC NHẬN DIỆN] + [CÁC THÔNG SỐ ÁP DỤNG] */}
                      <div
                        className={`p-3.5 rounded-[12px] border grid grid-cols-1 md:grid-cols-2 gap-3 ${
                          isDarkMode
                            ? 'bg-[#0D1E38] border-emerald-400/50 text-slate-100'
                            : 'bg-white border-emerald-300 text-[#09234C]'
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="block text-[11.5px] font-black uppercase tracking-wider text-emerald-400">
                            [Loại hình học nhận diện]:
                          </span>
                          <div className="text-[14px] font-black text-sky-300">
                            {generatedBlueprint.baseShapeType === 'Cylinder'
                              ? 'Cylinder (Hình trụ tròn — Chỉ dùng Chiều cao & Đường kính)'
                              : 'Box (Hình hộp chữ nhật — Dùng đủ Chiều cao, Chiều rộng, Chiều sâu)'}
                          </div>
                          <div className="text-[11.5px] opacity-85 font-semibold">
                            Template cấu trúc: {generatedBlueprint.templateNameVi}
                            {generatedBlueprint.matchedShapeKeywords &&
                            generatedBlueprint.matchedShapeKeywords.length > 0
                              ? ` · Từ khóa khớp: "${generatedBlueprint.matchedShapeKeywords.join('", "')}"`
                              : ''}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="block text-[11.5px] font-black uppercase tracking-wider text-amber-400">
                            [Các thông số áp dụng]:
                          </span>
                          <ul className="text-[12px] font-bold space-y-0.5">
                            {(generatedBlueprint.appliedParametersSummaryVi &&
                            generatedBlueprint.appliedParametersSummaryVi.length >
                              0
                              ? generatedBlueprint.appliedParametersSummaryVi
                              : generatedBlueprint.baseShapeType === 'Cylinder'
                                ? [
                                    `Chiều cao (H): ${generatedPackage?.asset.geometry.dimensions.height.value ?? 20} cm`,
                                    `Đường kính (Ø): ${generatedPackage?.asset.geometry.dimensions.widthOrDiameter.value ?? 12} cm`,
                                  ]
                                : [
                                    `Chiều cao (H): ${generatedPackage?.asset.geometry.dimensions.height.value ?? 20} cm`,
                                    `Chiều rộng (W): ${generatedPackage?.asset.geometry.dimensions.widthOrDiameter.value ?? 12} cm`,
                                    `Chiều sâu / bề dày (D): ${generatedPackage?.asset.geometry.dimensions.depth?.value ?? 10} cm`,
                                  ]
                            ).map((paramLine, pIdx) => (
                              <li key={pIdx} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                <span>{paramLine}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Lưới hiển thị: Bên trái là Bản phác thảo 2D tương tác trực quan (Drag, Resize & Callout Labels), Bên phải là Trình chỉnh sửa chi tiết bộ phận */}
                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
                        {/* Hình vẽ phác thảo cấu tạo dự kiến 2D (Interactive SVG Technical Blueprint) */}
                        <div className="xl:col-span-7 rounded-[12px] border border-sky-400/40 bg-[#06152D] p-3 flex flex-col justify-between relative overflow-hidden">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-sky-300/90 mb-1.5">
                            <span className="font-bold text-emerald-300">
                              🖱 KÉO THẢ KHỐI ĐỂ DỊCH CHUYỂN · KÉO NÚT VUÔNG ĐỂ GIÃN KÍCH THƯỚC (CM)
                            </span>
                            <span className="px-2 py-0.5 rounded bg-sky-500/20 border border-sky-400/40 text-sky-200 font-bold">
                              {generatedBlueprint.baseShapeType === 'Cylinder'
                                ? `CAO ${heightCm || generatedPackage?.asset.geometry.dimensions.height.value || 20}cm × Đ.KÍNH Ø ${widthCm || generatedPackage?.asset.geometry.dimensions.widthOrDiameter.value || 12}cm`
                                : `CAO ${heightCm || generatedPackage?.asset.geometry.dimensions.height.value || 20}cm × RỘNG ${widthCm || generatedPackage?.asset.geometry.dimensions.widthOrDiameter.value || 12}cm × SÂU ${depthCm || generatedPackage?.asset.geometry.dimensions.depth?.value || 10}cm`}
                            </span>
                          </div>

                          {(() => {
                            const activeHCm = Math.max(
                              2,
                              Number(heightCm) ||
                                generatedPackage?.asset.geometry.dimensions
                                  .height.value ||
                                20,
                            );
                            const activeWCm = Math.max(
                              1.5,
                              Number(widthCm) ||
                                generatedPackage?.asset.geometry.dimensions
                                  .widthOrDiameter.value ||
                                12,
                            );
                            const activeDCm = Math.max(
                              1.5,
                              Number(depthCm) ||
                                generatedPackage?.asset.geometry.dimensions
                                  .depth?.value ||
                                activeWCm,
                            );
                            const activeParts: AiGeneratedPartSpec[] =
                              getActive2DParts(generatedBlueprint);

                            // Sắp xếp vị trí Y của nhãn chú thích (Callout Labels) từ trên xuống dưới theo độ cao thực tế của từng bộ phận
                            const totalDrawH = 230;
                            const totalDrawW = 170;
                            const groundY = 292;
                            const originX = 175;

                            const sortedForCallout = activeParts
                              .map((p, idx) => ({
                                idx,
                                centerY:
                                  groundY -
                                  Math.max(
                                    0.04,
                                    Math.min(0.96, p.relativePos[1] || 0.3),
                                  ) *
                                    totalDrawH,
                              }))
                              .sort((a, b) => a.centerY - b.centerY);

                            const calloutSlotYMap: Record<number, number> = {};
                            sortedForCallout.forEach((item, rank) => {
                              const slotSpacing = Math.min(
                                46,
                                Math.floor(245 / Math.max(1, activeParts.length)),
                              );
                              calloutSlotYMap[item.idx] =
                                38 + rank * slotSpacing;
                            });

                            const startPartDrag = (
                              e: React.PointerEvent,
                              partIndex: number,
                              mode:
                                | 'move'
                                | 'resize-top'
                                | 'resize-bottom'
                                | 'resize-left'
                                | 'resize-right'
                                | 'resize-corner',
                            ) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setSelected2DPartIndex(partIndex);
                              const targetPart = activeParts[partIndex];
                              if (!targetPart) return;
                              setDrag2DState({
                                partIndex,
                                mode,
                                startClientX: e.clientX,
                                startClientY: e.clientY,
                                initialPart: {
                                  ...targetPart,
                                  relativePos: [...targetPart.relativePos] as [
                                    number,
                                    number,
                                    number,
                                  ],
                                  relativeScale: [
                                    ...targetPart.relativeScale,
                                  ] as [number, number, number],
                                },
                                initialHeightCm: activeHCm,
                                initialWidthCm: activeWCm,
                                initialDepthCm: activeDCm,
                              });
                            };

                            return (
                              <svg
                                ref={svg2DRef}
                                viewBox="0 0 600 350"
                                className="w-full h-[315px] rounded-[8px] bg-[#040E20] border border-sky-500/30 select-none touch-none"
                              >
                                <defs>
                                  <pattern
                                    id="blueprint-grid-2d"
                                    width="20"
                                    height="20"
                                    patternUnits="userSpaceOnUse"
                                  >
                                    <path
                                      d="M 20 0 L 0 0 0 20"
                                      fill="none"
                                      stroke="#1E3A5F"
                                      strokeWidth="0.7"
                                    />
                                  </pattern>
                                </defs>
                                <rect
                                  width="600"
                                  height="350"
                                  fill="url(#blueprint-grid-2d)"
                                />

                                {/* Trục đối xứng tâm thiết bị X = 0 */}
                                <line
                                  x1={originX}
                                  y1="20"
                                  x2={originX}
                                  y2={groundY + 10}
                                  stroke="#38BDF8"
                                  strokeOpacity="0.28"
                                  strokeWidth="1"
                                  strokeDasharray="4 4"
                                />

                                {/* Đường mặt bàn chuẩn Y = 0 */}
                                <line
                                  x1="44"
                                  y1={groundY}
                                  x2="315"
                                  y2={groundY}
                                  stroke="#38BDF8"
                                  strokeWidth="1.8"
                                  strokeDasharray="6 3"
                                />
                                <text
                                  x="48"
                                  y={groundY + 18}
                                  fill="#7DD3FC"
                                  fontSize="10.5"
                                  fontWeight="bold"
                                  fontFamily="monospace"
                                >
                                  {generatedBlueprint.baseShapeType ===
                                  'Cylinder'
                                    ? `Mặt bàn Y = 0.0 · Đường kính Ø = ${activeWCm} cm`
                                    : `Mặt bàn Y = 0.0 · Rộng ${activeWCm} cm × Sâu ${activeDCm} cm`}
                                </text>

                                {/* Đường gióng kích thước Chiều rộng / Đường kính ở đáy */}
                                <line
                                  x1={originX - 75}
                                  y1={groundY + 34}
                                  x2={originX + 75}
                                  y2={groundY + 34}
                                  stroke="#FBBF24"
                                  strokeWidth="1.4"
                                />
                                <line
                                  x1={originX - 75}
                                  y1={groundY + 28}
                                  x2={originX - 75}
                                  y2={groundY + 40}
                                  stroke="#FBBF24"
                                  strokeWidth="1.4"
                                />
                                <line
                                  x1={originX + 75}
                                  y1={groundY + 28}
                                  x2={originX + 75}
                                  y2={groundY + 40}
                                  stroke="#FBBF24"
                                  strokeWidth="1.4"
                                />
                                <text
                                  x={originX}
                                  y={groundY + 47}
                                  fill="#FDE047"
                                  fontSize="10"
                                  fontWeight="bold"
                                  fontFamily="monospace"
                                  textAnchor="middle"
                                >
                                  {generatedBlueprint.baseShapeType ===
                                  'Cylinder'
                                    ? `ĐƯỜNG KÍNH Ø ${activeWCm} CM`
                                    : `CHIỀU RỘNG ${activeWCm} CM`}
                                </text>

                                {/* Đường gióng kích thước Chiều cao tổng thể bên trái */}
                                <line
                                  x1="28"
                                  y1={groundY - totalDrawH}
                                  x2="28"
                                  y2={groundY}
                                  stroke="#34D399"
                                  strokeWidth="1.5"
                                />
                                <line
                                  x1="22"
                                  y1={groundY - totalDrawH}
                                  x2="34"
                                  y2={groundY - totalDrawH}
                                  stroke="#34D399"
                                  strokeWidth="1.5"
                                />
                                <line
                                  x1="22"
                                  y1={groundY}
                                  x2="34"
                                  y2={groundY}
                                  stroke="#34D399"
                                  strokeWidth="1.5"
                                />
                                <text
                                  x="15"
                                  y={groundY - totalDrawH / 2}
                                  fill="#34D399"
                                  fontSize="11"
                                  fontWeight="bold"
                                  fontFamily="monospace"
                                  transform={`rotate(-90 15,${groundY - totalDrawH / 2})`}
                                  textAnchor="middle"
                                >
                                  CAO {activeHCm} CM
                                </text>

                                {activeParts.length === 0 && (
                                  <text
                                    x="300"
                                    y="165"
                                    fill="#94A3B8"
                                    fontSize="12"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                  >
                                    Đã xóa hết các khối bộ phận. Bấm [+ Thêm chú thích / bộ phận] để thêm mới.
                                  </text>
                                )}

                                {/* Đường sức từ (N -> S) trực quan trên bản phác thảo 2D khi đối tượng là Nam châm */}
                                {generatedBlueprint.shapeFamily ===
                                  'permanent-magnet' && (
                                  <g pointerEvents="none" opacity="0.72">
                                    <path
                                      d={`M ${originX - 42} ${groundY - totalDrawH * 0.42} C ${originX - 28} ${groundY - totalDrawH * 0.85}, ${originX + 28} ${groundY - totalDrawH * 0.85}, ${originX + 42} ${groundY - totalDrawH * 0.42}`}
                                      fill="none"
                                      stroke="#38BDF8"
                                      strokeWidth="1.4"
                                      strokeDasharray="4 3"
                                    />
                                    <path
                                      d={`M ${originX - 48} ${groundY - totalDrawH * 0.30} C ${originX - 30} ${groundY - totalDrawH * 0.04}, ${originX + 30} ${groundY - totalDrawH * 0.04}, ${originX + 48} ${groundY - totalDrawH * 0.30}`}
                                      fill="none"
                                      stroke="#38BDF8"
                                      strokeWidth="1.2"
                                      strokeDasharray="4 3"
                                    />
                                    <text
                                      x={originX}
                                      y={groundY - totalDrawH * 0.78}
                                      fill="#7DD3FC"
                                      fontSize="9.5"
                                      fontWeight="bold"
                                      fontFamily="monospace"
                                      textAnchor="middle"
                                    >
                                      Đường sức từ B (N → S)
                                    </text>
                                  </g>
                                )}

                                {/* Vẽ từng khối bộ phận 2D kèm Callout Annotations & Tay nắm Kéo/Giãn (Handles) */}
                                {activeParts.map((part, idx) => {
                                  const isSelected =
                                    selected2DPartIndex === idx;
                                  const centerX =
                                    originX +
                                    (part.relativePos[0] || 0) * totalDrawW;
                                  const partW = Math.max(
                                    14,
                                    Math.min(
                                      220,
                                      (part.relativeScale[0] || 0.5) *
                                        totalDrawW,
                                    ),
                                  );
                                  const partH = Math.max(
                                    12,
                                    Math.min(
                                      220,
                                      (part.relativeScale[1] || 0.25) *
                                        totalDrawH,
                                    ),
                                  );
                                  const centerY =
                                    groundY -
                                    Math.max(
                                      0.04,
                                      Math.min(
                                        0.96,
                                        part.relativePos[1] || 0.3,
                                      ),
                                    ) *
                                      totalDrawH;
                                  const topY = centerY - partH / 2;
                                  const leftX = centerX - partW / 2;
                                  const rightX = centerX + partW / 2;
                                  const bottomY = centerY + partH / 2;

                                  const partNameLow = (
                                    part.partName || ''
                                  ).toLowerCase();
                                  const detectedPoleSymbol =
                                    part.poleLabel === 'N' ||
                                    part.poleLabel === 'S'
                                      ? part.poleLabel
                                      : partNameLow.includes('cực từ bắc') ||
                                          partNameLow.includes('cực bắc') ||
                                          partNameLow.includes('(n)') ||
                                          partNameLow.includes('ký hiệu n')
                                        ? 'N'
                                        : partNameLow.includes('cực từ nam') ||
                                            partNameLow.includes('cực nam') ||
                                            partNameLow.includes('(s)') ||
                                            partNameLow.includes('ký hiệu s')
                                          ? 'S'
                                          : null;

                                  const partRealHCm = (
                                    (part.relativeScale[1] || 0.2) * activeHCm
                                  ).toFixed(1);
                                  const partRealWCm = (
                                    (part.relativeScale[0] || 0.5) * activeWCm
                                  ).toFixed(1);

                                  const calloutY =
                                    calloutSlotYMap[idx] ?? 40 + idx * 44;
                                  const anchorX = rightX;
                                  const anchorY = centerY;
                                  const elbowX = Math.max(
                                    anchorX + 14,
                                    316,
                                  );
                                  const labelBoxX = 334;
                                  const resolvedFillOpacity = Math.max(
                                    0.14,
                                    Math.min(0.92, part.opacity ?? 0.85),
                                  );

                                  return (
                                    <g key={idx}>
                                      {/* Đường dẫn chú thích (Callout Leader Line) cập nhật thời gian thực */}
                                      <polyline
                                        points={`${anchorX},${anchorY} ${elbowX},${calloutY} ${labelBoxX},${calloutY}`}
                                        fill="none"
                                        stroke={
                                          isSelected ? '#34D399' : '#38BDF8'
                                        }
                                        strokeWidth={isSelected ? '1.8' : '1.2'}
                                        strokeDasharray={
                                          isSelected ? 'none' : '3 2'
                                        }
                                      />
                                      <circle
                                        cx={anchorX}
                                        cy={anchorY}
                                        r={isSelected ? '4' : '3'}
                                        fill={
                                          isSelected ? '#34D399' : '#38BDF8'
                                        }
                                        stroke="#040E20"
                                        strokeWidth="1.2"
                                      />

                                      {/* Hộp nhãn chú thích bộ phận (Callout Badge) bên phải */}
                                      <g
                                        onClick={() =>
                                          setSelected2DPartIndex(idx)
                                        }
                                        className="cursor-pointer"
                                      >
                                        <rect
                                          x={labelBoxX}
                                          y={calloutY - 16}
                                          width="258"
                                          height="34"
                                          rx="6"
                                          fill={
                                            isSelected ? '#0B2B4C' : '#081B36'
                                          }
                                          stroke={
                                            isSelected ? '#34D399' : '#1E40AF'
                                          }
                                          strokeWidth={
                                            isSelected ? '1.6' : '1'
                                          }
                                        />
                                        <text
                                          x={labelBoxX + 8}
                                          y={calloutY - 2}
                                          fill={
                                            isSelected ? '#6EE7B7' : '#F8FAFC'
                                          }
                                          fontSize="11"
                                          fontWeight="bold"
                                        >
                                          {idx + 1}.{' '}
                                          {part.partName.slice(0, 24)}
                                        </text>
                                        <text
                                          x={labelBoxX + 8}
                                          y={calloutY + 11}
                                          fill="#93C5FD"
                                          fontSize="9.5"
                                          fontFamily="monospace"
                                        >
                                          Cao {partRealHCm}cm ×{' '}
                                          {generatedBlueprint.baseShapeType ===
                                          'Cylinder'
                                            ? `Ø ${partRealWCm}cm`
                                            : `Rộng ${partRealWCm}cm`}{' '}
                                          · Y:{Math.round((part.relativePos[1] || 0.3) * 100)}%
                                        </text>

                                        {/* Nút xóa nhanh [×] ngay trên hộp chú thích SVG */}
                                        <g
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete2DPartBlock(idx);
                                          }}
                                          className="cursor-pointer"
                                        >
                                          <rect
                                            x={labelBoxX + 234}
                                            y={calloutY - 11}
                                            width="18"
                                            height="18"
                                            rx="4"
                                            fill="#4C0519"
                                            stroke="#F43F5E"
                                            strokeWidth="1"
                                          />
                                          <text
                                            x={labelBoxX + 243}
                                            y={calloutY + 2}
                                            fill="#FDA4AF"
                                            fontSize="11"
                                            fontWeight="bold"
                                            textAnchor="middle"
                                          >
                                            ×
                                          </text>
                                          <title>
                                            Xóa khối {idx + 1}: {part.partName}
                                          </title>
                                        </g>
                                      </g>

                                      {/* Khối hình học 2D của bộ phận (Kéo thả để di chuyển vị trí) */}
                                      <g
                                        onPointerDown={(e) =>
                                          startPartDrag(e, idx, 'move')
                                        }
                                        className="cursor-move"
                                      >
                                        {part.shape === 'sphere' ||
                                        part.shape === 'lathe-glass' ? (
                                          <ellipse
                                            cx={centerX}
                                            cy={centerY}
                                            rx={partW / 2}
                                            ry={partH / 2}
                                            fill={part.colorHex || '#38BDF8'}
                                            fillOpacity={resolvedFillOpacity}
                                            stroke={
                                              isSelected ? '#34D399' : '#7DD3FC'
                                            }
                                            strokeWidth={
                                              isSelected ? '2.5' : '1.6'
                                            }
                                          />
                                        ) : part.shape === 'cone' ? (
                                          <polygon
                                            points={`${centerX},${topY} ${rightX},${bottomY} ${leftX},${bottomY}`}
                                            fill={part.colorHex || '#F59E0B'}
                                            fillOpacity={resolvedFillOpacity}
                                            stroke={
                                              isSelected ? '#34D399' : '#FDE047'
                                            }
                                            strokeWidth={
                                              isSelected ? '2.5' : '1.6'
                                            }
                                          />
                                        ) : (
                                          <rect
                                            x={leftX}
                                            y={topY}
                                            width={partW}
                                            height={partH}
                                            rx={
                                              part.shape === 'cylinder' ||
                                              part.shape === 'tube'
                                                ? 8
                                                : 4
                                            }
                                            fill={part.colorHex || '#334155'}
                                            fillOpacity={resolvedFillOpacity}
                                            stroke={
                                              isSelected ? '#34D399' : '#38BDF8'
                                            }
                                            strokeWidth={
                                              isSelected ? '2.5' : '1.6'
                                            }
                                          />
                                        )}

                                        {/* Nếu là cực Nam châm (N / S), hiển thị nhãn cực từ N / S nổi bật ngay trên khối 2D */}
                                        {detectedPoleSymbol ? (
                                          <g pointerEvents="none">
                                            <rect
                                              x={centerX - 13}
                                              y={centerY - 12}
                                              width="26"
                                              height="24"
                                              rx="5"
                                              fill={
                                                detectedPoleSymbol === 'N'
                                                  ? '#991B1B'
                                                  : '#1E3A8A'
                                              }
                                              stroke="#FFFFFF"
                                              strokeWidth="1.5"
                                            />
                                            <text
                                              x={centerX}
                                              y={centerY + 5}
                                              fill="#FFFFFF"
                                              fontSize="14"
                                              fontWeight="900"
                                              textAnchor="middle"
                                            >
                                              {detectedPoleSymbol}
                                            </text>
                                            <circle
                                              cx={leftX + 10}
                                              cy={topY + 10}
                                              r="6.5"
                                              fill="#040E20"
                                              fillOpacity="0.88"
                                              stroke={
                                                isSelected
                                                  ? '#34D399'
                                                  : '#38BDF8'
                                              }
                                              strokeWidth="1"
                                            />
                                            <text
                                              x={leftX + 10}
                                              y={topY + 13}
                                              fill="#FFFFFF"
                                              fontSize="8.5"
                                              fontWeight="bold"
                                              textAnchor="middle"
                                            >
                                              {idx + 1}
                                            </text>
                                          </g>
                                        ) : (
                                          <>
                                            {/* Số thứ tự hiển thị ngay chính giữa khối */}
                                            <circle
                                              cx={centerX}
                                              cy={centerY}
                                              r="8.5"
                                              fill="#040E20"
                                              fillOpacity="0.82"
                                              stroke={
                                                isSelected
                                                  ? '#34D399'
                                                  : '#38BDF8'
                                              }
                                              strokeWidth="1.2"
                                            />
                                            <text
                                              x={centerX}
                                              y={centerY + 3.5}
                                              fill="#FFFFFF"
                                              fontSize="10"
                                              fontWeight="bold"
                                              textAnchor="middle"
                                            >
                                              {idx + 1}
                                            </text>
                                          </>
                                        )}
                                      </g>

                                      {/* Các điểm neo Kéo giãn kích thước (Resize Handles: Top, Bottom, Left, Right, Corner) */}
                                      {/* Handle Đỉnh (Kéo thay đổi Chiều cao) */}
                                      <rect
                                        x={centerX - 5}
                                        y={topY - 4}
                                        width="10"
                                        height="8"
                                        rx="2"
                                        fill={
                                          isSelected ? '#10B981' : '#38BDF8'
                                        }
                                        stroke="#040E20"
                                        strokeWidth="1.2"
                                        className="cursor-ns-resize"
                                        onPointerDown={(e) =>
                                          startPartDrag(e, idx, 'resize-top')
                                        }
                                      >
                                        <title>
                                          Kéo lên/xuống để chỉnh Chiều cao Khối{' '}
                                          {idx + 1} ({part.partName})
                                        </title>
                                      </rect>

                                      {/* Handle Đáy (Kéo thay đổi Chiều cao) */}
                                      <rect
                                        x={centerX - 5}
                                        y={bottomY - 4}
                                        width="10"
                                        height="8"
                                        rx="2"
                                        fill={
                                          isSelected ? '#10B981' : '#38BDF8'
                                        }
                                        stroke="#040E20"
                                        strokeWidth="1.2"
                                        className="cursor-ns-resize"
                                        onPointerDown={(e) =>
                                          startPartDrag(e, idx, 'resize-bottom')
                                        }
                                      >
                                        <title>
                                          Kéo lên/xuống để chỉnh Chiều cao Khối{' '}
                                          {idx + 1} ({part.partName})
                                        </title>
                                      </rect>

                                      {/* Handle Trái (Kéo thay đổi Đường kính / Chiều rộng) */}
                                      <rect
                                        x={leftX - 4}
                                        y={centerY - 5}
                                        width="8"
                                        height="10"
                                        rx="2"
                                        fill={
                                          isSelected ? '#F59E0B' : '#38BDF8'
                                        }
                                        stroke="#040E20"
                                        strokeWidth="1.2"
                                        className="cursor-ew-resize"
                                        onPointerDown={(e) =>
                                          startPartDrag(e, idx, 'resize-left')
                                        }
                                      >
                                        <title>
                                          Kéo sang hai bên để chỉnh Đường
                                          kính/Chiều rộng Khối {idx + 1} (
                                          {part.partName})
                                        </title>
                                      </rect>

                                      {/* Handle Phải (Kéo thay đổi Đường kính / Chiều rộng) */}
                                      <rect
                                        x={rightX - 4}
                                        y={centerY - 5}
                                        width="8"
                                        height="10"
                                        rx="2"
                                        fill={
                                          isSelected ? '#F59E0B' : '#38BDF8'
                                        }
                                        stroke="#040E20"
                                        strokeWidth="1.2"
                                        className="cursor-ew-resize"
                                        onPointerDown={(e) =>
                                          startPartDrag(e, idx, 'resize-right')
                                        }
                                      >
                                        <title>
                                          Kéo sang hai bên để chỉnh Đường
                                          kính/Chiều rộng Khối {idx + 1} (
                                          {part.partName})
                                        </title>
                                      </rect>

                                      {/* Handle Góc trên phải (Kéo đồng thời Rộng & Cao) */}
                                      <circle
                                        cx={rightX}
                                        cy={topY}
                                        r="4.5"
                                        fill="#F43F5E"
                                        stroke="#FFFFFF"
                                        strokeWidth="1.2"
                                        className="cursor-nesw-resize"
                                        onPointerDown={(e) =>
                                          startPartDrag(e, idx, 'resize-corner')
                                        }
                                      >
                                        <title>
                                          Kéo góc để chỉnh đồng thời Chiều cao
                                          &amp; Đường kính Khối {idx + 1}
                                        </title>
                                      </circle>
                                    </g>
                                  );
                                })}
                              </svg>
                            );
                          })()}

                          {/* Đối chiếu ảnh gốc ngay trên khung phác thảo 2D nếu có */}
                          {uploadedImages.length > 0 && (
                            <div className="mt-2 flex items-center justify-between gap-2 pt-2 border-t border-sky-500/20 text-[11px] text-sky-200">
                              <div className="flex items-center gap-1.5">
                                {uploadedImages.slice(0, 3).map((im, i) => (
                                  <img
                                    key={im.id}
                                    src={im.dataUrl}
                                    alt={`Ảnh mẫu ${i + 1}`}
                                    className="w-9 h-9 rounded object-contain bg-black border border-sky-400/50"
                                  />
                                ))}
                                <span className="font-bold">
                                  Đã đối chiếu tỷ lệ từ {uploadedImages.length} ảnh tải lên
                                </span>
                              </div>
                              <span className="font-mono text-emerald-300 font-bold">
                                Template: {generatedBlueprint.shapeFamily}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Sơ đồ khối cấu trúc & Bảng chỉnh tay trực tiếp từng bộ phận (Interactive Part Inspector) */}
                        <div className="xl:col-span-5 flex flex-col justify-between space-y-2.5">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-[12.5px] font-black uppercase tracking-wider text-sky-400">
                                Chú thích &amp; Tinh chỉnh bộ phận 2D → 3D:
                              </h4>
                              <button
                                type="button"
                                onClick={() => {
                                  const curParts = [
                                    ...getActive2DParts(generatedBlueprint),
                                  ];
                                  const newIdx = curParts.length;
                                  const nextParts = realignPartsYPositions([
                                    ...curParts,
                                    {
                                      partName: `Bộ phận bổ sung ${newIdx + 1}`,
                                      shape: 'cylinder',
                                      colorHex:
                                        generatedBlueprint.accentColorHex ||
                                        '#38BDF8',
                                      metalness: 0.5,
                                      roughness: 0.3,
                                      opacity: 1,
                                      relativeScale: [0.32, 0.14, 0.32],
                                      relativePos: [0, 0.88, 0],
                                    },
                                  ]);
                                  setSelected2DPartIndex(nextParts.length - 1);
                                  sync2DBlueprintAndRecompile3D(nextParts);
                                }}
                                className="px-2 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 text-[11px] font-bold cursor-pointer transition-colors"
                              >
                                + Thêm chú thích / bộ phận
                              </button>
                            </div>

                            <div className="space-y-1.5 max-h-[210px] overflow-y-auto pr-1">
                              {getActive2DParts(generatedBlueprint).length ===
                                0 && (
                                <div className="p-3 rounded-[9px] border border-dashed border-sky-500/30 text-center text-[11.5px] text-slate-300">
                                  Chưa có khối bộ phận nào trong danh sách. Hãy bấm{' '}
                                  <strong className="text-emerald-300">
                                    [+ Thêm chú thích / bộ phận]
                                  </strong>{' '}
                                  để thêm khối mới.
                                </div>
                              )}
                              {getActive2DParts(generatedBlueprint).map(
                                (part, idx) => {
                                  const isSel = selected2DPartIndex === idx;
                                  const curHCm = Math.max(
                                    2,
                                    Number(heightCm) ||
                                      generatedPackage?.asset.geometry.dimensions
                                        .height.value ||
                                      20,
                                  );
                                  const curWCm = Math.max(
                                    1.5,
                                    Number(widthCm) ||
                                      generatedPackage?.asset.geometry.dimensions
                                        .widthOrDiameter.value ||
                                      12,
                                  );
                                  const partHCmVal = Number(
                                    (part.relativeScale[1] * curHCm).toFixed(1),
                                  );
                                  const partWCmVal = Number(
                                    (part.relativeScale[0] * curWCm).toFixed(1),
                                  );

                                  return (
                                    <div
                                      key={idx}
                                      onClick={() => setSelected2DPartIndex(idx)}
                                      className={`p-2 rounded-[9px] border text-[11.5px] cursor-pointer transition-all space-y-1.5 ${
                                        isSel
                                          ? isDarkMode
                                            ? 'bg-[#0F294A] border-emerald-400 shadow-sm'
                                            : 'bg-emerald-50/90 border-emerald-500 shadow-sm'
                                          : isDarkMode
                                            ? 'bg-[#0D1E38] border-[#264B82] hover:border-sky-400/60'
                                            : 'bg-white border-[#C5DCFA] hover:border-sky-400'
                                      }`}
                                    >
                                      <div className="flex items-center gap-1.5">
                                        <input
                                          type="color"
                                          value={part.colorHex || '#38BDF8'}
                                          onChange={(e) => {
                                            const nextParts = [
                                              ...getActive2DParts(
                                                generatedBlueprint,
                                              ),
                                            ];
                                            nextParts[idx] = {
                                              ...part,
                                              colorHex: e.target.value,
                                            };
                                            sync2DBlueprintAndRecompile3D(
                                              nextParts,
                                            );
                                          }}
                                          className="w-5 h-5 rounded cursor-pointer border border-white/40 shrink-0 bg-transparent"
                                          title="Đổi màu sắc bộ phận"
                                        />
                                        <span className="font-black text-emerald-400 shrink-0">
                                          {idx + 1}.
                                        </span>
                                        <input
                                          type="text"
                                          value={part.partName}
                                          onChange={(e) => {
                                            const nextParts = [
                                              ...getActive2DParts(
                                                generatedBlueprint,
                                              ),
                                            ];
                                            nextParts[idx] = {
                                              ...part,
                                              partName: e.target.value,
                                            };
                                            sync2DBlueprintAndRecompile3D(
                                              nextParts,
                                            );
                                          }}
                                          className={`flex-1 min-w-0 px-1.5 py-0.5 rounded border text-[11.5px] font-extrabold ${
                                            isDarkMode
                                              ? 'bg-[#071426] border-sky-500/40 text-white'
                                              : 'bg-slate-50 border-slate-300 text-slate-900'
                                          }`}
                                          placeholder="Tên nhãn chú thích bộ phận..."
                                        />
                                        <select
                                          value={part.shape}
                                          onChange={(e) => {
                                            const nextParts = [
                                              ...getActive2DParts(
                                                generatedBlueprint,
                                              ),
                                            ];
                                            nextParts[idx] = {
                                              ...part,
                                              shape: e.target
                                                .value as AiGeneratedPartSpec['shape'],
                                            };
                                            sync2DBlueprintAndRecompile3D(
                                              nextParts,
                                            );
                                          }}
                                          className={`px-1 py-0.5 rounded border text-[10.5px] font-mono ${
                                            isDarkMode
                                              ? 'bg-[#071426] border-sky-500/40 text-sky-300'
                                              : 'bg-slate-50 border-slate-300 text-slate-800'
                                          }`}
                                        >
                                          <option value="cylinder">Hình trụ</option>
                                          <option value="sphere">Bầu cầu</option>
                                          <option value="cone">Hình nón</option>
                                          <option value="beveled-box">Hình hộp</option>
                                          <option value="torus">Vành khuyên</option>
                                          <option value="dial-face">Bảng mặt</option>
                                        </select>

                                        {/* NÚT XÓA KHỐI BỘ PHẬN (DELETE BLOCK BUTTON) */}
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete2DPartBlock(idx);
                                          }}
                                          title={`Xóa khối ${idx + 1}: ${part.partName} (Các khối còn lại sẽ tự động căn chỉnh lại vị trí Y)`}
                                          aria-label={`Xóa khối ${idx + 1}: ${part.partName}`}
                                          className="px-1.5 py-1 rounded border border-rose-500/50 bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white text-[10.5px] font-black flex items-center justify-center gap-0.5 shrink-0 cursor-pointer transition-colors"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>

                                      {/* Dòng chỉnh trực tiếp Chiều cao (cm), Đường kính/Rộng (cm) & Độ cao Y của từng khối */}
                                      <div className="grid grid-cols-3 gap-1.5 pt-0.5 text-[10.5px] font-mono">
                                        <label className="flex items-center justify-between gap-1 bg-black/20 px-1.5 py-0.5 rounded border border-sky-500/20">
                                          <span className="text-emerald-300">
                                            Cao(cm):
                                          </span>
                                          <input
                                            type="number"
                                            step="0.2"
                                            min="0.4"
                                            max="80"
                                            value={partHCmVal}
                                            onChange={(e) => {
                                              const newPartHCm = Math.max(
                                                0.4,
                                                Number(e.target.value) || 1,
                                              );
                                              const deltaCm =
                                                newPartHCm - partHCmVal;
                                              const nextTotalHCm = Math.max(
                                                3,
                                                Number(
                                                  (
                                                    curHCm +
                                                    deltaCm * 0.65
                                                  ).toFixed(1),
                                                ),
                                              );
                                              const nextRelH = Math.max(
                                                0.05,
                                                Math.min(
                                                  0.95,
                                                  Number(
                                                    (
                                                      newPartHCm / nextTotalHCm
                                                    ).toFixed(3),
                                                  ),
                                                ),
                                              );
                                              const nextParts = [
                                                ...getActive2DParts(
                                                  generatedBlueprint,
                                                ),
                                              ];
                                              nextParts[idx] = {
                                                ...part,
                                                relativeScale: [
                                                  part.relativeScale[0],
                                                  nextRelH,
                                                  part.relativeScale[2],
                                                ],
                                              };
                                              sync2DBlueprintAndRecompile3D(
                                                nextParts,
                                                nextTotalHCm,
                                                curWCm,
                                              );
                                            }}
                                            className="w-12 text-right font-bold text-white bg-transparent outline-none"
                                          />
                                        </label>

                                        <label className="flex items-center justify-between gap-1 bg-black/20 px-1.5 py-0.5 rounded border border-sky-500/20">
                                          <span className="text-amber-300">
                                            {generatedBlueprint.baseShapeType ===
                                            'Cylinder'
                                              ? 'Ø(cm):'
                                              : 'Rộng:'}
                                          </span>
                                          <input
                                            type="number"
                                            step="0.2"
                                            min="0.4"
                                            max="60"
                                            value={partWCmVal}
                                            onChange={(e) => {
                                              const newPartWCm = Math.max(
                                                0.4,
                                                Number(e.target.value) || 1,
                                              );
                                              const deltaWCm =
                                                newPartWCm - partWCmVal;
                                              const nextTotalWCm = Math.max(
                                                2,
                                                Number(
                                                  (
                                                    curWCm +
                                                    deltaWCm * 0.65
                                                  ).toFixed(1),
                                                ),
                                              );
                                              const nextRelW = Math.max(
                                                0.08,
                                                Math.min(
                                                  1.35,
                                                  Number(
                                                    (
                                                      newPartWCm / nextTotalWCm
                                                    ).toFixed(3),
                                                  ),
                                                ),
                                              );
                                              const nextParts = [
                                                ...getActive2DParts(
                                                  generatedBlueprint,
                                                ),
                                              ];
                                              nextParts[idx] = {
                                                ...part,
                                                relativeScale: [
                                                  nextRelW,
                                                  part.relativeScale[1],
                                                  nextRelW,
                                                ],
                                              };
                                              sync2DBlueprintAndRecompile3D(
                                                nextParts,
                                                curHCm,
                                                nextTotalWCm,
                                              );
                                            }}
                                            className="w-12 text-right font-bold text-white bg-transparent outline-none"
                                          />
                                        </label>

                                        <label className="flex items-center justify-between gap-1 bg-black/20 px-1.5 py-0.5 rounded border border-sky-500/20">
                                          <span className="text-sky-300">
                                            Vị trí Y:
                                          </span>
                                          <input
                                            type="number"
                                            step="1"
                                            min="4"
                                            max="95"
                                            value={Math.round(
                                              (part.relativePos[1] || 0.3) * 100,
                                            )}
                                            onChange={(e) => {
                                              const nextY = Math.max(
                                                0.04,
                                                Math.min(
                                                  0.95,
                                                  (Number(e.target.value) || 30) /
                                                    100,
                                                ),
                                              );
                                              const nextParts = [
                                                ...getActive2DParts(
                                                  generatedBlueprint,
                                                ),
                                              ];
                                              nextParts[idx] = {
                                                ...part,
                                                relativePos: [
                                                  part.relativePos[0],
                                                  nextY,
                                                  part.relativePos[2],
                                                ],
                                              };
                                              sync2DBlueprintAndRecompile3D(
                                                nextParts,
                                              );
                                            }}
                                            className="w-10 text-right font-bold text-white bg-transparent outline-none"
                                          />
                                          <span>%</span>
                                        </label>
                                      </div>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          </div>

                          {/* Hiển thị bộ nhớ tạm hỏi đáp nếu có */}
                          {clarificationMemory.length > 0 && (
                            <div className="p-2.5 rounded-[9px] bg-amber-500/10 border border-amber-400/40 text-[11.5px] space-y-1">
                              <div className="font-extrabold text-amber-300">
                                🧠 Đã áp dụng {clarificationMemory.length} bổ sung từ Hỏi đáp AI:
                              </div>
                              <div className="truncate opacity-90">
                                “{clarificationMemory[clarificationMemory.length - 1].answer}”
                              </div>
                            </div>
                          )}

                          <div className="p-2.5 rounded-[9px] bg-[#0D1E38] border border-sky-500/30 text-[11.5px] text-slate-200 space-y-0.5">
                            <div className="font-extrabold text-sky-300">
                              Đồng bộ trực tiếp 2D → 3D (Real-time CAD Sync):
                            </div>
                            <div className="line-clamp-2 opacity-90">
                              Mọi thao tác kéo thả vị trí, kéo giãn chiều cao/đường kính hoặc đổi nhãn chú thích trên bản phác thảo 2D đều tự động cập nhật thông số (cm) phía trên và truyền 100% sang mô hình Three.js 3D.
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* HAI NÚT BẤM BẮT BUỘC CỦA BƯỚC XÁC NHẬN PHÁC THẢO 2D */}
                      <div className="pt-3 border-t border-emerald-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowRefinementBox(true);
                            setTimeout(() => {
                              refinementInputRef.current?.focus();
                            }, 30);
                          }}
                          className={`py-3 px-4 rounded-[11px] border-2 text-[13.5px] font-black flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                            isDarkMode
                              ? 'bg-[#152A4A] hover:bg-[#1E3B68] border-amber-400 text-amber-300'
                              : 'bg-amber-50 hover:bg-amber-100 border-amber-500 text-amber-900'
                          }`}
                        >
                          <Pencil className="w-4 h-4" />
                          <span>[✏ Sửa lại]</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleApprove2DSketchAndRender3D}
                          className="flex-1 py-3 px-5 rounded-[11px] bg-[#059669] hover:bg-[#047857] text-white text-[14px] font-black flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                        >
                          <Check className="w-5 h-5 stroke-[3]" />
                          <span>[✔ Phác thảo OK, Tiến hành dựng 3D]</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[380px] rounded-[14px] border-2 border-dashed border-[#264B82] bg-[#071224] flex flex-col items-center justify-center text-center p-6 text-slate-300 space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-400 flex items-center justify-center">
                        <Compass className="w-7 h-7" />
                      </div>
                      <div className="max-w-md space-y-1.5">
                        <p className="text-[15px] font-black text-white">
                          Bản phác thảo cấu trúc 2D đang chờ dữ liệu từ Bước 1
                        </p>
                        <p className="text-[12.5px] font-medium text-slate-300 leading-relaxed">
                          Khi bạn bấm nút{' '}
                          <strong className="text-[#38BDF8]">
                            [🤖 Nhờ AI phân tích và chế tạo dụng cụ]
                          </strong>
                          , AI sẽ kiểm tra các chi tiết chưa rõ để hỏi lại bạn (nếu cần), sau đó lập{' '}
                          <strong className="text-emerald-300">
                            Bản phác thảo cấu trúc 2D
                          </strong>{' '}
                          tại đây để bạn duyệt trước khi chạy Three.js dựng mô hình 3D.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ===============================================================
                  GIAI ĐOẠN 3: KHUNG XEM TRƯỚC MÔ HÌNH 3D (CHỈ CHẠY SAU KHI DUYỆT 2D)
                  =============================================================== */}
              {previewMode === '3d' && is2DSketchApproved && (
                <div className="space-y-3">
                  <div className="relative w-full h-[380px] rounded-[14px] overflow-hidden border-2 border-[#264B82] bg-[#071224]">
                    {generatedPackage ? (
                      <>
                        <div ref={previewMountRef} className="w-full h-full" />

                        {/* Huy hiệu góc trên bên trái của Live Preview */}
                        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-[9px] bg-slate-950/85 border border-sky-400/40 text-white text-[12px] font-bold flex flex-wrap items-center gap-2 pointer-events-none">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                          <span>
                            Live Preview PBR 3D · Kéo để xoay 360°
                          </span>
                          {generatedBlueprint && (
                            <span className="px-2 py-0.5 rounded bg-sky-500/20 border border-sky-400/40 text-sky-300 font-mono text-[11px]">
                              Cao {generatedPackage.asset.geometry.dimensions.height.value}cm × Rộng {generatedPackage.asset.geometry.dimensions.widthOrDiameter.value}cm · Kính α={generatedBlueprint.glassOpacity}
                            </span>
                          )}
                        </div>

                        {/* Nút bật/tắt tự xoay */}
                        <button
                          type="button"
                          onClick={() => setAutoRotate3D((v) => !v)}
                          className="absolute top-3 right-3 px-3 py-1.5 rounded-[9px] bg-slate-900/85 hover:bg-[#1E6BFF] border border-sky-400/50 text-white text-[12px] font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>
                            {autoRotate3D ? 'Đang tự xoay 360°' : 'Bật tự xoay'}
                          </span>
                        </button>

                        {/* Lớp phủ trạng thái khi AI đang cập nhật lại mô hình 3D */}
                        {isRefiningModel && (
                          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center gap-2.5 z-20">
                            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                            <span className="text-[14px] font-black text-amber-300 tracking-wide">
                              AI đang cập nhật lại mô hình...
                            </span>
                            <span className="text-[12px] font-semibold text-slate-300">
                              Đang tính toán lại thông số hình học, màu sắc PBR &amp; độ trong suốt thủy tinh
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-slate-300 space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-[#1E6BFF]/20 border border-[#38BDF8]/50 text-[#38BDF8] flex items-center justify-center">
                          <Box className="w-7 h-7" />
                        </div>
                        <div className="max-w-md space-y-1">
                          <p className="text-[15px] font-black text-white">
                            Khung Xem trước (Live Preview) đang chờ dữ liệu
                          </p>
                          <p className="text-[13px] font-medium text-slate-300">
                            Hãy tải ảnh hoặc nhập thông số ở Bước 1, sau đó bấm nút{' '}
                            <strong className="text-[#38BDF8]">
                              [🤖 Nhờ AI phân tích và chế tạo dụng cụ]
                            </strong>{' '}
                            để AI sinh mô hình 3D/HTML trực tiếp tại đây.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Góc dưới bên trái: đối chiếu danh sách ảnh tải lên nếu có */}
                    {uploadedImages.length > 0 && (
                      <div className="absolute bottom-3 left-3 p-1.5 rounded-[10px] bg-slate-950/85 border border-sky-400/50 flex items-center gap-2 max-w-[90%] overflow-x-auto">
                        <div className="flex items-center gap-1.5 shrink-0">
                          {uploadedImages.slice(0, 4).map((imgItem, idx) => (
                            <img
                              key={imgItem.id}
                              src={imgItem.dataUrl}
                              alt={`Ảnh gốc ${idx + 1}`}
                              title={imgItem.name}
                              className="w-11 h-11 rounded-[6px] object-contain bg-black border border-slate-700"
                            />
                          ))}
                        </div>
                        <div className="pr-2 text-[11px] text-slate-200 font-bold shrink-0">
                          <span className="block text-sky-300">
                            {uploadedImages.length} ảnh gốc đã tải
                          </span>
                          <span>Đối chiếu đa chiều 1:1</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* BẢN THẢO THIẾT KẾ 3D TỪ DỮ LIỆU & HÌNH ẢNH (AI BLUEPRINT SUMMARY) */}
                  {generatedBlueprint && (
                    <div
                      className={`rounded-[12px] p-3.5 border space-y-2 ${
                        isDarkMode
                          ? 'bg-[#091528] border-[#10B981]/50'
                          : 'bg-[#F0FDF4] border-[#86EFAC]'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#059669] dark:text-[#34D399] shrink-0" />
                          <span className="text-[13px] font-black text-[#065F46] dark:text-[#6EE7B7]">
                            Bản thảo thiết kế 3D từ dữ liệu &amp; ảnh gốc:{' '}
                            <span className="underline">
                              {generatedBlueprint.templateNameVi}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold">
                          <span
                            className="w-3.5 h-3.5 rounded-sm border border-white/40"
                            style={{
                              backgroundColor: generatedBlueprint.primaryColorHex,
                            }}
                            title={`Màu thân chính: ${generatedBlueprint.primaryColorHex}`}
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-sm border border-white/40"
                            style={{
                              backgroundColor:
                                generatedBlueprint.secondaryColorHex,
                            }}
                            title={`Màu phụ/đế: ${generatedBlueprint.secondaryColorHex}`}
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-sm border border-white/40"
                            style={{
                              backgroundColor: generatedBlueprint.accentColorHex,
                            }}
                            title={`Màu chi tiết nhấn: ${generatedBlueprint.accentColorHex}`}
                          />
                          <span className="font-mono opacity-80">
                            {generatedBlueprint.primaryColorHex}
                          </span>
                        </div>
                      </div>

                      <p
                        className={`text-[12px] font-medium leading-relaxed ${
                          isDarkMode ? 'text-slate-200' : 'text-[#1E3A5F]'
                        }`}
                      >
                        {generatedBlueprint.aiAnalysisSummary}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {generatedBlueprint.structuralComponents
                          .slice(0, 5)
                          .map((comp, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 rounded-[6px] border text-[11px] font-bold ${
                                isDarkMode
                                  ? 'bg-[#102341] border-[#264B82] text-sky-200'
                                  : 'bg-white border-[#BBF7D0] text-[#065F46]'
                              }`}
                            >
                              ✓ {comp}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Thanh trượt thử nghiệm đo lường & tương tác vật lý trực tiếp trên mô hình 3D */}
                  {generatedBlueprint && (
                    <div
                      className={`rounded-[12px] p-3.5 border space-y-2.5 ${
                        isDarkMode
                          ? 'bg-[#091528] border-[#264B82]'
                          : 'bg-[#F3F8FF] border-[#C5DCFA]'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-[#1E6BFF] shrink-0" />
                          <span className="text-[13px] font-extrabold">
                            Thử đo lường trực tiếp ({generatedBlueprint.controlLabel}):
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {generatedBlueprint.shapeFamily ===
                            'alcohol-burner' && (
                            <button
                              type="button"
                              onClick={() => {
                                const grp = liveEquipmentGroupRef.current;
                                const tubeObj = grp?.getObjectByName(
                                  'heated_test_tube_group',
                                );
                                if (tubeObj) {
                                  tubeObj.visible = !tubeObj.visible;
                                  setShowHeatedTubeDemo(tubeObj.visible);
                                }
                              }}
                              className={`px-2.5 py-1 rounded-[7px] text-[11.5px] font-extrabold border transition-colors cursor-pointer ${
                                showHeatedTubeDemo
                                  ? 'bg-[#0284C7] border-[#38BDF8] text-white'
                                  : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200'
                              }`}
                            >
                              {showHeatedTubeDemo
                                ? '🧪 Đang đặt ống nghiệm phía trên (Bấm để bỏ ra)'
                                : '🧪 Đặt ống nghiệm lên trên ngọn lửa để đun thử'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const isOff =
                                Math.abs(
                                  liveControlValue - generatedBlueprint.controlMin,
                                ) < 0.02;
                              setLiveControlValue(
                                isOff
                                  ? generatedBlueprint.controlDefault ||
                                      generatedBlueprint.controlMax
                                  : generatedBlueprint.controlMin,
                              );
                            }}
                            className={`px-3 py-1 rounded-[7px] text-[12px] font-extrabold border transition-colors cursor-pointer ${
                              Math.abs(
                                liveControlValue - generatedBlueprint.controlMin,
                              ) > 0.02
                                ? 'bg-[#EA580C] hover:bg-[#C2410C] border-[#FB923C] text-white'
                                : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200'
                            }`}
                          >
                            {generatedBlueprint.shapeFamily === 'alcohol-burner'
                              ? Math.abs(
                                  liveControlValue - generatedBlueprint.controlMin,
                                ) > 0.02
                                ? '🔥 Đang cháy (Bấm để Đậy nắp / Tắt lửa)'
                                : '🔥 Đang tắt (Bấm để Châm lửa đốt)'
                              : Math.abs(
                                    liveControlValue - generatedBlueprint.controlMin,
                                  ) > 0.02
                                ? '⚡ Đang kích hoạt (Bấm đưa về 0)'
                                : '⚡ Kích hoạt trạng thái mẫu'}
                          </button>
                          <span className="px-2.5 py-1 rounded-[7px] bg-[#06281E] border border-[#10B981] font-mono text-[14px] font-black text-[#34D399]">
                            {Number(liveControlValue).toFixed(
                              generatedBlueprint.controlStep < 0.1
                                ? 2
                                : generatedBlueprint.controlStep < 1
                                  ? 1
                                  : 1,
                            )}{' '}
                            {generatedBlueprint.controlUnit}
                          </span>
                        </div>
                      </div>

                      {generatedBlueprint.operationSummary && (
                        <p
                          className={`text-[12px] font-semibold leading-relaxed ${
                            isDarkMode ? 'text-emerald-300/90' : 'text-[#065F46]'
                          }`}
                        >
                          ⚙️ Nguyên lý vận hành 3D:{' '}
                          <span className="font-medium">
                            {generatedBlueprint.operationSummary}
                          </span>
                        </p>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <input
                          type="range"
                          min={generatedBlueprint.controlMin}
                          max={generatedBlueprint.controlMax}
                          step={generatedBlueprint.controlStep}
                          value={liveControlValue}
                          onChange={(e) =>
                            setLiveControlValue(parseFloat(e.target.value))
                          }
                          className="flex-1 accent-[#1E6BFF] cursor-pointer"
                        />

                        {/* Các nút mốc đo nhanh để kiểm tra kim đồng hồ / con chạy / mực chất lỏng */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                            const val = Number(
                              (
                                generatedBlueprint.controlMin +
                                ratio *
                                  (generatedBlueprint.controlMax -
                                    generatedBlueprint.controlMin)
                              ).toFixed(2),
                            );
                            return (
                              <button
                                key={ratio}
                                type="button"
                                onClick={() => setLiveControlValue(val)}
                                className={`px-2 py-1 rounded-[6px] border font-mono text-[11px] font-extrabold cursor-pointer transition-colors ${
                                  Math.abs(liveControlValue - val) < 0.02
                                    ? 'bg-[#1E6BFF] border-[#1E6BFF] text-white'
                                    : isDarkMode
                                      ? 'bg-[#132644] hover:bg-[#1E3B68] border-[#2C528C] text-slate-200'
                                      : 'bg-white hover:bg-[#E1EDFF] border-[#9EC5F8] text-[#09234C]'
                                }`}
                              >
                                {val} {generatedBlueprint.controlUnit}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {previewMode === 'specs' && generatedBlueprint && (
                <div
                  className={`h-[435px] overflow-y-auto rounded-[14px] border p-4 space-y-4 ${
                    isDarkMode
                      ? 'bg-[#091528] border-[#264B82]'
                      : 'bg-[#F7FAFF] border-[#C5DCFA]'
                  }`}
                >
                  <div className="space-y-1.5">
                    <h3 className="text-[15px] font-black text-[#1E6BFF] dark:text-[#38BDF8]">
                      Nhận định &amp; Phân tích cấu tạo của AI:
                    </h3>
                    <p className="text-[13.5px] font-medium leading-relaxed">
                      {generatedBlueprint.aiAnalysisSummary}
                    </p>
                    {generatedBlueprint.referenceUrl && (
                      <p className="text-[12px] font-bold text-sky-400 break-all pt-1">
                        🔗 Nguồn đường dẫn tham khảo đã đối chiếu:{' '}
                        <span className="underline">
                          {generatedBlueprint.referenceUrl}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[14px] font-extrabold">
                      Các bộ phận hình học 3D đã được lắp ghép:
                    </h4>
                    <ul className="space-y-1.5 text-[13px] font-semibold">
                      {generatedBlueprint.structuralComponents.map((comp, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{comp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {generatedBlueprint.customParts &&
                    generatedBlueprint.customParts.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[14px] font-extrabold text-emerald-500 dark:text-emerald-400">
                          Bản thảo phân rã chi tiết 3D (Multi-Part Blueprint từ Ảnh &amp; Mô tả):
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {generatedBlueprint.customParts.map((part, idx) => (
                            <div
                              key={idx}
                              className={`p-2.5 rounded-[10px] border text-[12px] flex items-center gap-2.5 ${
                                isDarkMode
                                  ? 'bg-[#102341] border-[#264B82]'
                                  : 'bg-white border-[#C5DCFA]'
                              }`}
                            >
                              <span
                                className="w-5 h-5 rounded-md border border-white/30 shrink-0"
                                style={{ backgroundColor: part.colorHex }}
                                title={`Màu PBR: ${part.colorHex}`}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="font-extrabold truncate">
                                  {idx + 1}. {part.partName}
                                </div>
                                <div className="text-[11px] opacity-75 font-mono">
                                  Khối: {part.shape} · Tỉ lệ:{' '}
                                  {part.relativeScale
                                    .map((n) => Math.round(n * 100) + '%')
                                    .join('×')}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className="p-3.5 rounded-[12px] bg-[#102341] text-white space-y-1">
                    <span className="text-[11.5px] font-bold text-sky-300 uppercase">
                      Công thức khoa học chuẩn SGK (Unicode):
                    </span>
                    <p className="text-[16px] font-black text-amber-300">
                      {generatedBlueprint.physicsFormulaUnicode}
                    </p>
                  </div>
                </div>
              )}

              {previewMode === 'code' && (
                <div className="h-[435px] rounded-[14px] overflow-hidden border border-slate-700 bg-[#050D1A] flex flex-col">
                  <div className="px-3.5 py-2 bg-[#0D1E38] border-b border-slate-700 flex items-center justify-between text-[12px] font-mono text-sky-300">
                    <span>
                      {generatedBlueprint?.slug || 'custom-equipment'}.html (Chuẩn OL3D-HTML-MODULE)
                    </span>
                    <span>{generatedHtmlSource.length} bytes</span>
                  </div>
                  <pre className="flex-1 p-3.5 text-[11.5px] font-mono text-emerald-300 overflow-auto leading-relaxed">
                    {generatedHtmlSource}
                  </pre>
                </div>
              )}

              {/* KHUNG GÓP Ý CHỈNH SỬA AI (HIỆN RA KHI BẤM [✏ Yêu cầu AI chỉnh sửa thêm]) */}
              {showRefinementBox && (
                <div
                  className={`rounded-[14px] p-4 border-2 space-y-3 ${
                    isDarkMode
                      ? 'bg-[#091528] border-amber-400/70'
                      : 'bg-amber-50/70 border-amber-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-extrabold text-amber-600 dark:text-amber-300 flex items-center gap-1.5">
                      <Pencil className="w-4 h-4" />
                      <span>
                        Nhập yêu cầu để AI chỉnh sửa (tự động cập nhật Phác thảo 2D, thông số cm &amp; mô hình 3D):
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowRefinementBox(false)}
                      className="text-xs font-bold underline cursor-pointer"
                    >
                      Ẩn khung sửa
                    </button>
                  </div>

                  {/* Gợi ý sửa nhanh (Chips): Bấm vào sẽ tự động điền hoặc cộng dồn vào ô input */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Tăng chiều cao dụng cụ thêm 5 cm',
                      'Giảm đường kính đi 2 cm',
                      'Làm vật liệu thủy tinh trong suốt hơn',
                      'Đổi màu thân dụng cụ sang xanh biển khoa học',
                      'Đổi màu chi tiết nhấn sang màu đỏ nổi bật',
                      'Xóa bộ phận Bảng mặt trước',
                    ].map((hint) => {
                      const isChipSelected = refinementInput
                        .toLowerCase()
                        .includes(hint.toLowerCase());
                      return (
                        <button
                          key={hint}
                          type="button"
                          onClick={() => handleSelectRefinementChip(hint)}
                          className={`px-2.5 py-1 rounded-[7px] border text-[11.5px] font-bold cursor-pointer transition-colors ${
                            isChipSelected
                              ? 'bg-[#1E6BFF] border-[#38BDF8] text-white'
                              : isDarkMode
                                ? 'bg-[#132644] hover:bg-[#1E6BFF] border-[#2C528C] text-slate-200'
                                : 'bg-white hover:bg-[#1E6BFF] hover:text-white border-amber-300 text-[#09234C]'
                          }`}
                        >
                          + {hint}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      ref={refinementInputRef}
                      type="text"
                      value={refinementInput}
                      disabled={isRefiningModel}
                      onChange={(e) => setRefinementInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (
                          e.key === 'Enter' &&
                          refinementInput.trim() &&
                          !isAiGenerating
                        ) {
                          e.preventDefault();
                          void handleRunAiBuild(true);
                        }
                      }}
                      placeholder="VD: Tăng chiều cao thêm 5 cm, giảm đường kính 2 cm, đổi màu bầu thân sang xanh lá, xóa bộ phận 5..."
                      className={`flex-1 px-3.5 py-2 rounded-[10px] border text-[13.5px] font-bold focus:outline-none disabled:opacity-60 ${
                        isDarkMode
                          ? 'bg-[#0F1E36] border-[#2C528C] text-white'
                          : 'bg-white border-amber-400 text-[#09234C]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => void handleRunAiBuild(true)}
                      disabled={isAiGenerating || !refinementInput.trim()}
                      className="px-4 py-2 rounded-[10px] bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-[13px] flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                    >
                      {isRefiningModel ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang cập nhật...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Cập nhật lại</span>
                        </>
                      )}
                    </button>
                  </div>

                  {isRefiningModel && (
                    <div className="text-[12px] font-extrabold text-amber-500 dark:text-amber-300 flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                      <span>
                        Đang phân tích câu lệnh, cập nhật thông số &amp; vẽ lại Bản phác thảo 2D / Mô hình 3D...
                      </span>
                    </div>
                  )}

                  {refinementHistory.length > 0 && (
                    <div className="text-[11.5px] font-medium opacity-80">
                      Đã chỉnh sửa gần nhất: {refinementHistory.join(' · ')}
                    </div>
                  )}
                </div>
              )}

              {/* BƯỚC 4: NÚT XÁC NHẬN LƯU VÀO KHO CHUNG (`openlab_global_equipment`) & ĐƯA VÀO BÀN 3D */}
              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2.5">
                <span className="block text-[12px] font-extrabold uppercase tracking-wider text-[#059669] dark:text-[#34D399]">
                  Bước 4 · Lưu vào Kho Thiết Bị Dùng Chung (openlab_global_equipment) &amp; Đưa vào dự án
                </span>

                {savedToGlobalNotice && (
                  <div
                    className={`p-3 rounded-[11px] border flex items-start justify-between gap-2 text-[12.5px] font-bold ${
                      isDarkMode
                        ? 'bg-emerald-950/60 border-emerald-400/70 text-emerald-200'
                        : 'bg-emerald-50 border-emerald-400 text-emerald-900'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{savedToGlobalNotice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={onOpen3DWorkbench}
                      className="px-2.5 py-1 rounded-[7px] bg-[#059669] hover:bg-[#047857] text-white text-[11.5px] font-extrabold shrink-0 cursor-pointer"
                    >
                      Sang Bàn 3D →
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
                  {/* NÚT 1: [✔ Xác nhận (Lưu vào kho & Đưa vào bàn 3D)] */}
                  <button
                    type="button"
                    onClick={handleConfirmAndSaveEquipment}
                    disabled={
                      !generatedPackage ||
                      !is2DSketchApproved ||
                      isAiGenerating
                    }
                    title={
                      is2DSketchApproved
                        ? 'Lưu vào Kho Thiết Bị Chung (openlab_global_equipment) và tự động đặt Mô hình 3D + Bảng điều khiển lên bàn thí nghiệm'
                        : 'Cần xác nhận [✔ Phác thảo đã OK, Tiến hành dựng 3D] ở bước Phác thảo 2D trước khi lưu'
                    }
                    className="py-3.5 px-4 rounded-[12px] bg-[#059669] hover:bg-[#047857] disabled:opacity-50 text-white text-[13.5px] font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Check className="w-5 h-5 stroke-[3] shrink-0" />
                    <span>✔ Xác nhận (Lưu vào kho &amp; Đưa vào bàn 3D)</span>
                  </button>

                  {/* NÚT 2: [💾 Xác nhận lưu vào kho chung] */}
                  <button
                    type="button"
                    onClick={handleSaveOnlyToGlobalLibrary}
                    disabled={
                      !generatedPackage ||
                      !is2DSketchApproved ||
                      isAiGenerating
                    }
                    title="Lưu dụng cụ tự thiết kế vào biến toàn cục openlab_global_equipment để bất kỳ dự án nào cũng gọi tới được"
                    className={`py-3.5 px-4 rounded-[12px] border-2 text-[13.5px] font-black flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 ${
                      isDarkMode
                        ? 'bg-[#0F294D] hover:bg-[#173A6B] border-[#38BDF8] text-[#7DD3FC]'
                        : 'bg-[#EFF6FF] hover:bg-[#DBEAFE] border-[#1E6BFF] text-[#0D3B8C]'
                    }`}
                  >
                    <FolderOpen className="w-4 h-4 shrink-0" />
                    <span>💾 Xác nhận lưu vào Kho chung</span>
                  </button>

                  {/* NÚT 3: [✏ Yêu cầu AI chỉnh sửa thêm] */}
                  <button
                    type="button"
                    onClick={() => setShowRefinementBox((v) => !v)}
                    className={`py-3.5 px-4 rounded-[12px] border-2 text-[13.5px] font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      showRefinementBox
                        ? 'bg-amber-500 border-amber-400 text-slate-950'
                        : isDarkMode
                          ? 'bg-[#152A4A] hover:bg-[#1E3B68] border-amber-400/80 text-amber-300'
                          : 'bg-amber-50 hover:bg-amber-100 border-amber-500 text-amber-900'
                    }`}
                  >
                    <Pencil className="w-4 h-4 shrink-0" />
                    <span>✏ Yêu cầu AI chỉnh sửa thêm</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* =================================================================
             TAB PHỤ: KHO DỤNG CỤ CÁ NHÂN & THƯ VIỆN 3D HIỆN CÓ
             ================================================================= */
          <section
            aria-label="Kho dụng cụ cá nhân và thư viện 3D"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {assets.map((asset) => {
              const customPhoto =
                htmlEquipmentModuleRegistry.getUploadedRealPhoto(asset.assetId);
              return (
                <article
                  key={asset.assetId}
                  data-equipment-id={asset.assetId}
                  className={`rounded-[16px] border p-4 flex flex-col justify-between gap-3 transition-all relative ${
                    isDarkMode
                      ? 'bg-[#0F1E36] border-[#264B82] hover:border-[#38BDF8]'
                      : 'bg-white border-[#C5DCFA] hover:border-[#1E6BFF] shadow-2xs'
                  }`}
                >
                  {onDeleteExistingAsset && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteExistingAsset(asset);
                      }}
                      title={`Xóa vĩnh viễn dụng cụ "${asset.name.vi}" khỏi kho`}
                      aria-label={`Xóa ${asset.name.vi}`}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-[9px] border flex items-center justify-center transition-colors cursor-pointer ${
                        isDarkMode
                          ? 'bg-rose-950/75 text-rose-300 border-rose-500/50 hover:bg-rose-600 hover:text-white hover:border-rose-400'
                          : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-600 hover:text-white hover:border-rose-600'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <div className="flex items-start gap-3 pr-9">
                    <div
                      className={`w-16 h-16 rounded-[12px] border flex items-center justify-center shrink-0 overflow-hidden ${
                        isDarkMode
                          ? 'bg-[#091528] border-[#264B82]'
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
                          archetype={asset.geometry.proceduralArchetype}
                          className="w-12 h-12"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[15px] font-black leading-snug truncate">
                        {asset.name.vi}
                      </h3>
                      <p
                        className={`text-[12px] font-mono font-bold mt-0.5 ${
                          isDarkMode ? 'text-[#7DD3FC]' : 'text-[#1E6BFF]'
                        }`}
                      >
                        Cao {asset.geometry.dimensions.height.value}{' '}
                        {asset.geometry.dimensions.height.unit} × Rộng{' '}
                        {asset.geometry.dimensions.widthOrDiameter.value}{' '}
                        {asset.geometry.dimensions.widthOrDiameter.unit}
                      </p>
                      <p
                        className={`text-[12px] mt-1 line-clamp-2 ${
                          isDarkMode ? 'text-slate-300' : 'text-[#425B80]'
                        }`}
                      >
                        {asset.summary}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onInspectExistingAsset(asset)}
                      className={`flex-1 py-2 px-2.5 rounded-[9px] border text-[12px] font-extrabold cursor-pointer transition-colors ${
                        isDarkMode
                          ? 'bg-[#152A4A] hover:bg-[#1E3B68] border-[#2C528C] text-white'
                          : 'bg-[#F2F7FF] hover:bg-[#E1EDFF] border-[#C5DCFA] text-[#09234C]'
                      }`}
                    >
                      Chi tiết / Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddExistingAssetToLab(asset.assetId)}
                      className="flex-1 py-2 px-2.5 rounded-[9px] bg-[#059669] hover:bg-[#047857] text-white text-[12px] font-extrabold cursor-pointer transition-colors"
                    >
                      + Đặt lên bàn 3D
                    </button>
                    {onDeleteExistingAsset && (
                      <button
                        type="button"
                        onClick={() => onDeleteExistingAsset(asset)}
                        className={`py-2 px-2.5 rounded-[9px] border text-[12px] font-extrabold flex items-center gap-1 cursor-pointer transition-colors ${
                          isDarkMode
                            ? 'bg-rose-950/75 hover:bg-rose-600 border-rose-500/50 text-rose-200 hover:text-white'
                            : 'bg-rose-50 hover:bg-rose-600 border-rose-300 text-rose-700 hover:text-white'
                        }`}
                        title={`Xóa vĩnh viễn dụng cụ "${asset.name.vi}"`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
};
