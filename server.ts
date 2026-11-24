import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  generateSmartLocalAnswer,
  isQuestionExplicitlyOutOfScope,
  KHTN_678_DOCUMENT_TEXT,
  OFFICIAL_KHTN_678_ASSET_URI,
  OUT_OF_SCOPE_APOLOGY,
  sanitizeScientificText,
  type ChatContextPayload,
  type ReferenceSourceLink,
} from './src/services/khtnChatEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const MD_RELATIVE_URL = OFFICIAL_KHTN_678_ASSET_URI;
const MD_FILE_PATH = path.join(
  __dirname,
  'public',
  'assets',
  'aistudio',
  'gemini-code-1794824162503_bbfc567c.txt',
);

const OFFICIAL_MD_SOURCES: ReferenceSourceLink[] = [
  {
    title: 'Tổng hợp Kiến thức Khoa học Tự nhiên (Lớp 6, 7, 8)',
    uri: MD_RELATIVE_URL,
    domain: 'openlab3d.local',
  },
];

let rawMarkdownKnowledgeBase = KHTN_678_DOCUMENT_TEXT;
let markdownParagraphs: string[] = [];

function loadMarkdownKnowledgeBase() {
  try {
    if (fs.existsSync(MD_FILE_PATH)) {
      rawMarkdownKnowledgeBase = fs.readFileSync(MD_FILE_PATH, 'utf-8');
    } else {
      rawMarkdownKnowledgeBase = KHTN_678_DOCUMENT_TEXT;
    }
    markdownParagraphs = rawMarkdownKnowledgeBase
      .replace(/\r\n/g, '\n')
      .split(/\n\s*\n/)
      .map((p) =>
        sanitizeScientificText(
          p
            .replace(/^#+\s+.+$/gm, '')
            .replace(/^-\s+/gm, '')
            .replace(/\s+/g, ' ')
            .trim(),
        ),
      )
      .filter((p) => p.length >= 25 && !p.startsWith('|'));
  } catch (err) {
    console.error('Failed to load markdown knowledge base:', err);
  }
}

loadMarkdownKnowledgeBase();

function extractDomainFromUrl(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return 'google.com';
  }
}

async function fetchReferenceUrlSummary(rawUrl: string): Promise<string> {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  let urlSnippet = '';
  try {
    const parsedUrl = new URL(
      trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`,
    );
    const decodedPath = decodeURIComponent(
      `${parsedUrl.hostname} ${parsedUrl.pathname} ${parsedUrl.search}`,
    )
      .replace(/[-_/+=&?]+/g, ' ')
      .trim();
    urlSnippet = `URL: ${parsedUrl.href} (Từ khóa đường dẫn: ${decodedPath})`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);
    const response = await fetch(parsedUrl.href, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; OpenLab3D-SpecExtractor/2.4; +https://openlab3d.local)',
        Accept: 'text/html,application/xhtml+xml,text/plain,*/*;q=0.8',
      },
    });
    clearTimeout(timer);

    if (!response.ok) {
      return urlSnippet;
    }

    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const metaDescMatch = html.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
    );
    const cleanedBody = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3200);

    const parts = [
      urlSnippet,
      titleMatch?.[1] ? `Tiêu đề trang: ${titleMatch[1].replace(/\s+/g, ' ').trim()}` : '',
      metaDescMatch?.[1] ? `Mô tả trang: ${metaDescMatch[1].trim()}` : '',
      cleanedBody ? `Nội dung trích xuất từ đường dẫn: ${cleanedBody}` : '',
    ].filter(Boolean);

    return parts.join('\n');
  } catch {
    return urlSnippet || `Đường dẫn tham khảo: ${trimmed}`;
  }
}

const DELETED_ASSETS_SRC_PATH = path.join(
  __dirname,
  'src',
  'data',
  'permanentlyDeletedAssets.json',
);
const DELETED_ASSETS_ROOT_PATH = path.join(
  __dirname,
  '.openlab-deleted-assets.json',
);

function readPersistedDeletedAssetIds(): string[] {
  const merged = new Set<string>();
  for (const filePath of [DELETED_ASSETS_SRC_PATH, DELETED_ASSETS_ROOT_PATH]) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
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
      // Ignore parse errors
    }
  }
  return Array.from(merged);
}

function writePersistedDeletedAssetIds(ids: string[]): string[] {
  const unique = Array.from(
    new Set(ids.filter((id): id is string => typeof id === 'string' && id.trim() !== '')),
  );
  const payload = `${JSON.stringify(unique, null, 2)}\n`;
  for (const filePath of [DELETED_ASSETS_SRC_PATH, DELETED_ASSETS_ROOT_PATH]) {
    try {
      fs.writeFileSync(filePath, payload, 'utf-8');
    } catch (err) {
      console.error(`Failed to write deleted assets to ${filePath}:`, err);
    }
  }
  return unique;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/catalog/deleted-assets', (_req, res) => {
    res.json({ deletedAssetIds: readPersistedDeletedAssetIds() });
  });

  app.post('/api/catalog/deleted-assets', (req, res) => {
    const body = req.body || {};
    const current = readPersistedDeletedAssetIds();
    const toAdd: string[] = [];
    if (typeof body.assetId === 'string' && body.assetId.trim()) {
      toAdd.push(body.assetId.trim());
    }
    if (Array.isArray(body.assetIds)) {
      for (const id of body.assetIds) {
        if (typeof id === 'string' && id.trim()) {
          toAdd.push(id.trim());
        }
      }
    }
    const updated = writePersistedDeletedAssetIds([...current, ...toAdd]);
    res.json({ deletedAssetIds: updated });
  });

  // Endpoint AI phân tích hình ảnh, thông số vật lý & đường dẫn tham khảo (URL) để thiết kế dụng cụ thí nghiệm 3D/HTML
  app.post('/api/equipment/ai-design', async (req, res) => {
    const body = req.body || {};
    const spec = body.spec || {};
    const previousBlueprint = body.previousBlueprint || null;
    const apiKey = process.env.GEMINI_API_KEY;

    const rawRefUrl =
      typeof spec.referenceUrl === 'string' ? spec.referenceUrl.trim() : '';
    const extractedReferenceContent = rawRefUrl
      ? await fetchReferenceUrlSummary(rawRefUrl)
      : '';

    if (!apiKey) {
      res.json({
        aiOverrides: extractedReferenceContent
          ? { extractedReferenceContent }
          : {},
        source: 'smart-synthesizer',
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      const promptParts: Array<
        | { text: string }
        | { inlineData: { mimeType: string; data: string } }
      > = [];

      const rawImageList: string[] = Array.isArray(spec.imageDataUrls)
        ? spec.imageDataUrls.filter(
            (url: unknown): url is string =>
              typeof url === 'string' && url.startsWith('data:image/'),
          )
        : typeof spec.imageDataUrl === 'string' &&
            spec.imageDataUrl.startsWith('data:image/')
          ? [spec.imageDataUrl]
          : [];

      for (const imgDataUrl of rawImageList.slice(0, 8)) {
        const match = imgDataUrl.match(
          /^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/,
        );
        if (match) {
          promptParts.push({
            inlineData: {
              mimeType: match[1],
              data: match[2],
            },
          });
        }
      }

      const detailedAppearanceText =
        spec.appearancePrompt || spec.description || '';
      const detailedOperationText = spec.operationPrompt || '';
      const clarificationMemoryText = Array.isArray(spec.clarificationMemory)
        ? spec.clarificationMemory
            .map(
              (item: { question?: string; answer?: string }, idx: number) =>
                `  [Làm rõ #${idx + 1}] AI hỏi: "${item.question || ''}" -> Người dùng trả lời: "${item.answer || ''}"`,
            )
            .join('\n')
        : '';
      const lockedTemplateId =
        typeof spec.templateId === 'string' && spec.templateId.trim() !== ''
          ? spec.templateId.trim()
          : '';

      const designPrompt = `Bạn là Kiến Trúc Sư Dựng Hình 3D & Bộ Phân Tích Hình Ảnh Đa Thành Phần (True AI Vision Multi-Part Parser) của OpenLab 3D.
NHIỆM VỤ TỐI QUAN TRỌNG (ĐỌC KỸ DỮ LIỆU + QUAN SÁT TRỰC TIẾP HÌNH ẢNH THỰC TẾ -> LÊN BẢN PHÁC THẢO 2D & 3D CHÍNH XÁC 100%):
1. Bạn PHẢI quan sát kỹ ${rawImageList.length > 0 ? `toàn bộ ${rawImageList.length} hình ảnh thực tế người dùng đã tải lên` : 'mọi thông tin người dùng cung cấp'}, kết hợp đọc từng chữ trong:
   - Tên dụng cụ: "${spec.nameVi || ''}"
   - Mô tả ngoại hình chi tiết: "${detailedAppearanceText}"
   - Mô tả hoạt động / Nguyên lý vận hành: "${detailedOperationText}"
   ${spec.imageVisionTelemetry ? `- Số liệu phân tích thị giác trực tiếp từ ảnh tải lên (Image Vision Telemetry): ${JSON.stringify(spec.imageVisionTelemetry)}` : ''}
   ${clarificationMemoryText ? `- Bộ nhớ tạm Hỏi đáp làm rõ từ người dùng:\n${clarificationMemoryText}` : ''}
   ${rawRefUrl ? `- Đường dẫn tham khảo (URL): "${rawRefUrl}"\n   - Nội dung trích xuất từ URL:\n"""\n${extractedReferenceContent}\n"""` : ''}
   - Phân loại: "${spec.category || ''}"
   - Kích thước thực tế: Cao ${spec.heightCm || 20} cm × Rộng/Đường kính ${spec.widthCm || 12} cm × Bề dày trước-sau ${spec.depthCm || 10} cm
   - Khối lượng: ${spec.massG || 200} g | Dung tích: ${spec.capacityMl ?? 'không nhập'} ml | Tiêu cự: ${spec.focalLengthCm ?? 'không nhập'} cm
   - Chất liệu: "${spec.material || ''}"
   ${spec.refinementPrompt ? `- Yêu cầu chỉnh sửa / góp ý phác thảo: "${spec.refinementPrompt}"` : ''}
   ${previousBlueprint ? `- Bản thảo hiện tại trước khi sửa: ${JSON.stringify(previousBlueprint)}` : ''}

2. NGHIÊM CẤM GÁN NHẦM MẪU ĐÈN CỒN ('alcohol-burner') HOẶC KHUÔN MẪU CỨNG:
   - TUYỆT ĐỐI KHÔNG ĐƯỢC tự động gán shapeFamily = 'alcohol-burner' khi hình ảnh tải lên hoặc tên dụng cụ KHÔNG PHẢI là đèn cồn! Tuyệt đối không sinh các bộ phận 'Bầu thân chính chứa cồn', 'Cổ thắt phía trên', 'Nắp chụp / Đầu giữ kim' cho thiết bị không phải đèn cồn.
   - TUYỆT ĐỐI KHÔNG ĐƯỢC chọn 'optical-lens', 'optical-prism' hay 'laser-source' trừ khi hình ảnh tải lên HOẶC tên/mô tả ngoại hình ghi rõ ràng đó là Thấu kính, Kính lúp, Lăng kính hoặc Đèn Laser!
   - ${lockedTemplateId ? `Người dùng đã khóa cứng Template "${lockedTemplateId}", vì vậy trường shapeFamily BẮT BUỘC phải là "${lockedTemplateId}".` : `Hãy đối chiếu Hình ảnh thực tế + Tên + Mô tả ngoại hình để chọn đúng shapeFamily:
     + 'permanent-magnet': Nam châm vĩnh cửu (Thanh nam châm thẳng N–S, Nam châm chữ U / móng ngựa, Nam châm tròn/vành khuyên). BẮT BUỘC phân định rõ 2 cực: Cực từ Bắc (North - màu đỏ '#DC2626', poleLabel: 'N') và Cực từ Nam (South - màu xanh '#1D4ED8', poleLabel: 'S') đúng theo hình khối hộp dài (beveled-box) hoặc khối chữ U (đáy nối + 2 nhánh đứng N/S) hoặc vành khuyên (torus), tuyệt đối không vẽ thành bầu tròn hay cổ đèn cồn!
     + 'magnetic-compass': La bàn từ / Kim nam châm thử từ trường đặt trên trụ nhọn (có mặt chia độ Đông–Tây–Nam–Bắc và kim nam châm N đỏ – S xanh).
     + 'alcohol-burner': CHỈ DÙNG KHI người dùng yêu cầu rõ ràng Đèn cồn thí nghiệm / Đèn Bunsen.
     + 'analog-ammeter-voltmeter': Ampe kế / Vôn kế / Điện kế kim chỉ.
     + 'digital-multimeter': Đồng hồ vạn năng hiện số / Máy đo pH / Máy đo điện tử có màn hình LCD.
     + 'rheostat': Biến trở con chạy / Biến trở dây quấn.
     + 'graduated-glassware': Ống đong chia độ / Cốc thủy tinh có mỏ (Beaker).
     + 'conical-flask': Bình tam giác Erlenmeyer / Bình cầu đáy tròn.
     + 'test-tube': Ống nghiệm thủy tinh & Giá đỡ ống nghiệm.
     + 'spring-dynamometer': Lực kế lò xo.
     + 'electronic-balance': Cân điện tử hiện số / Cân đĩa kỹ thuật.
     + 'thermometer': Nhiệt kế phòng thí nghiệm.
     + 'microscope-biology': Kính hiển vi quang học.
     + 'optical-lens': Thấu kính hội tụ / phân kỳ / kính lúp gắn trên giá quang học.
     + 'optical-prism': Lăng kính tam giác quang học.
     + 'laser-source': Nguồn phát tia sáng Laser.
     + 'custom-apparatus': Mọi thiết bị, dụng cụ thí nghiệm khác (cuộn dây cảm ứng, nam châm điện, bộ thí nghiệm cơ–nhiệt–điện–quang đặc thù...) — BẮT BUỘC bóc tách chính xác các bộ phận từ ảnh thực tế thành mảng customParts!`}

3. LÊN BẢN PHÁC THẢO CẤU TẠO ĐA THÀNH PHẦN (customParts & structuralComponents):
   - Trích xuất đúng màu sắc thực tế từ ảnh tải lên vào primaryColorHex, secondaryColorHex, accentColorHex.
   - Luôn sinh kèm mảng customParts (4–7 bộ phận cấu thành dụng cụ theo đúng tọa độ thực tế relativePos [x, y, z] và kích thước relativeScale [w, h, d]):
     + Nếu là Thanh nam châm (Bar Magnet): tạo khối Cực Bắc (N) màu đỏ '#DC2626' (poleLabel: 'N', relativePos: [-0.24, 0.50, 0], relativeScale: [0.48, 0.42, 0.46]), khối Cực Nam (S) màu xanh '#1D4ED8' (poleLabel: 'S', relativePos: [0.24, 0.50, 0], relativeScale: [0.48, 0.42, 0.46]), và Vạch phân cực trung hòa ở tâm [0, 0.50, 0].
     + Nếu là Nam châm chữ U (Horseshoe / U-Magnet): tạo Đáy vòng cung nối từ ở dưới, Nhánh trái Cực Bắc (N) màu đỏ '#DC2626' (poleLabel: 'N', relativePos: [-0.29, 0.52, 0]), Nhánh phải Cực Nam (S) màu xanh '#1D4ED8' (poleLabel: 'S', relativePos: [0.29, 0.52, 0]), và 2 đầu cực mạ Niken sáng ở đỉnh.
   - Công thức vật lý (physicsFormulaUnicode) viết bằng ký tự Unicode chuẩn SGK (như F = B · I · l, Φ = B · S · cosα, I = U / R), tuyệt đối không dùng LaTeX hay dấu $.`;

      promptParts.push({ text: designPrompt });

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: promptParts,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              nameEn: { type: Type.STRING },
              shapeFamily: {
                type: Type.STRING,
                enum: [
                  'custom-apparatus',
                  'permanent-magnet',
                  'magnetic-compass',
                  'alcohol-burner',
                  'conical-flask',
                  'analog-ammeter-voltmeter',
                  'digital-multimeter',
                  'rheostat',
                  'test-tube',
                  'optical-lens',
                  'optical-prism',
                  'laser-source',
                  'graduated-glassware',
                  'spring-dynamometer',
                  'electronic-balance',
                  'thermometer',
                  'microscope-biology',
                ],
              },
              housingStyle: {
                type: Type.STRING,
                enum: ['stepped-benchtop', 'sloped-console', 'upright-classic'],
              },
              terminalCount: { type: Type.NUMBER },
              bevelRadiusMm: { type: Type.NUMBER },
              primaryColorHex: { type: Type.STRING },
              secondaryColorHex: { type: Type.STRING },
              accentColorHex: { type: Type.STRING },
              glassOpacity: { type: Type.NUMBER },
              controlLabel: { type: Type.STRING },
              controlUnit: { type: Type.STRING },
              controlMin: { type: Type.NUMBER },
              controlMax: { type: Type.NUMBER },
              controlStep: { type: Type.NUMBER },
              aiAnalysisSummary: { type: Type.STRING },
              operationSummary: { type: Type.STRING },
              structuralComponents: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              customParts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    partName: { type: Type.STRING },
                    shape: {
                      type: Type.STRING,
                      enum: [
                        'beveled-box',
                        'box',
                        'cylinder',
                        'tube',
                        'sphere',
                        'cone',
                        'torus',
                        'ring',
                        'lathe-glass',
                        'dial-face',
                        'binding-post',
                      ],
                    },
                    colorHex: { type: Type.STRING },
                    poleLabel: { type: Type.STRING },
                    metalness: { type: Type.NUMBER },
                    roughness: { type: Type.NUMBER },
                    opacity: { type: Type.NUMBER },
                    relativeScale: {
                      type: Type.ARRAY,
                      items: { type: Type.NUMBER },
                    },
                    relativePos: {
                      type: Type.ARRAY,
                      items: { type: Type.NUMBER },
                    },
                  },
                  required: [
                    'partName',
                    'shape',
                    'colorHex',
                    'relativeScale',
                    'relativePos',
                  ],
                },
              },
              physicsFormulaUnicode: { type: Type.STRING },
            },
            required: [
              'shapeFamily',
              'primaryColorHex',
              'secondaryColorHex',
              'accentColorHex',
              'aiAnalysisSummary',
              'operationSummary',
              'structuralComponents',
              'physicsFormulaUnicode',
            ],
          },
        },
      });

      const rawJson = response.text?.trim() || '{}';
      const parsed = JSON.parse(rawJson);
      if (lockedTemplateId) {
        parsed.shapeFamily = lockedTemplateId;
      }
      if (extractedReferenceContent) {
        parsed.extractedReferenceContent = extractedReferenceContent;
      }
      res.json({
        aiOverrides: parsed,
        source: 'gemini-ai',
      });
    } catch {
      res.json({
        aiOverrides: extractedReferenceContent
          ? { extractedReferenceContent }
          : {},
        source: 'smart-synthesizer',
      });
    }
  });

  app.post('/api/assistant/chat', async (req, res) => {
    const body = (req.body || {}) as ChatContextPayload;
    const question = (body.question || '').trim();
    if (!question) {
      res.status(400).json({ error: 'Missing question' });
      return;
    }

    if (isQuestionExplicitlyOutOfScope(question)) {
      res.json({
        answer: OUT_OF_SCOPE_APOLOGY,
        textbookRef: 'Ngoài phạm vi tài liệu KHTN lớp 6, 7, 8',
        sources: OFFICIAL_MD_SOURCES,
        source: 'khtn-strict-guard',
      });
      return;
    }

    const localSmartAnswer = generateSmartLocalAnswer(body, markdownParagraphs);
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.json({
        answer: localSmartAnswer.isOutOfScope
          ? OUT_OF_SCOPE_APOLOGY
          : sanitizeScientificText(localSmartAnswer.answer),
        textbookRef: localSmartAnswer.textbookRef,
        sources: OFFICIAL_MD_SOURCES,
        source: 'khtn-smart-engine',
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      const historyText = (body.history || [])
        .slice(-4)
        .map((m) => `${m.role === 'user' ? 'Học sinh' : 'Trợ lý'}: ${m.text}`)
        .join('\n');

      const strictSystemInstruction = `Bạn là Trợ lý AI Khoa học Tự nhiên lớp 6, 7, 8. Bạn PHẢI tuân thủ tuyệt đối 3 yêu cầu cốt lõi sau:
1. TUYỆT ĐỐI chỉ sử dụng kiến thức từ file tài liệu "TỔNG HỢP KIẾN THỨC KHOA HỌC TỰ NHIÊN (LỚP 6, 7, 8)" được cung cấp dưới đây để trả lời. Không tự bịa đặt thông tin (hallucination) và không sử dụng bất kỳ kiến thức nào ngoài tài liệu.
2. Nếu câu hỏi của học sinh nằm ngoài phạm vi tài liệu được cung cấp, hãy trả lời đúng nguyên văn câu sau (không thêm bất kỳ nội dung nào khác):
"${OUT_OF_SCOPE_APOLOGY}"
3. Văn phong thân thiện, sư phạm, dễ hiểu, trình bày mạch lạc: sử dụng gạch đầu dòng (•) và in đậm (**từ khoá**) các từ khoá quan trọng. Trình bày công thức bằng ký tự Unicode trực quan (không dùng dấu $ hay LaTeX thô).

=== TOÀN VĂN TÀI LIỆU ĐƯỢC CUNG CẤP ===
${rawMarkdownKnowledgeBase || KHTN_678_DOCUMENT_TEXT}
=== KẾT THÚC TÀI LIỆU ===`;

      const prompt = `${historyText ? `Lịch sử trao đổi gần đây:\n${historyText}\n\n` : ''}Câu hỏi của học sinh: "${question}"

Hãy kiểm tra xem câu hỏi của học sinh có nằm trong "TỔNG HỢP KIẾN THỨC KHOA HỌC TỰ NHIÊN (LỚP 6, 7, 8)" ở trên hay không:
- Nếu KHÔNG có trong tài liệu, bắt buộc trả lời chính xác: "${OUT_OF_SCOPE_APOLOGY}"
- Nếu CÓ trong tài liệu, hãy chỉ dùng kiến thức từ tài liệu để trả lời với văn phong thân thiện, sư phạm, dễ hiểu, trình bày mạch lạc bằng bullet point (•) và in đậm (**...**) các từ khoá quan trọng.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction: strictSystemInstruction,
        },
      });

      const rawText = (response.text || '').trim();
      const isApology =
        rawText.includes('Xin lỗi, thông tin này hiện không có trong tài liệu Khoa học Tự nhiên lớp 6, 7, 8') ||
        localSmartAnswer.isOutOfScope;

      const finalAnswer = isApology
        ? OUT_OF_SCOPE_APOLOGY
        : sanitizeScientificText(rawText || localSmartAnswer.answer);

      res.json({
        answer: finalAnswer,
        textbookRef: isApology
          ? 'Ngoài phạm vi tài liệu KHTN lớp 6, 7, 8'
          : localSmartAnswer.textbookRef,
        sources: OFFICIAL_MD_SOURCES,
        source: 'khtn-gemini',
      });
    } catch {
      res.json({
        answer: localSmartAnswer.isOutOfScope
          ? OUT_OF_SCOPE_APOLOGY
          : sanitizeScientificText(localSmartAnswer.answer),
        textbookRef: localSmartAnswer.textbookRef,
        sources: OFFICIAL_MD_SOURCES,
        source: 'khtn-smart-engine',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OpenLab 3D Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
