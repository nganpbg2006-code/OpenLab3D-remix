import {
  AssetDefinition,
  EquipmentKit,
  ExperimentDefinition,
  LabEnvironment,
  LabScene,
} from '../domain/types';

export const MOCK_EQUIPMENT_ASSETS: AssetDefinition[] = [
  {
    assetId: 'OL3D-EQP-BAL-0001',
    slug: 'can-dien-tu-hien-so-500g',
    name: {
      vi: 'Cân điện tử hiện số 500 g',
      en: 'Precision Electronic Balance 500 g',
    },
    kind: 'equipment',
    subject: 'physics',
    category: 'mass-measurement',
    categoryIds: ['mass-measurement', 'electrical-equipment'],
    tags: ['can-dien-tu', 'khoi-luong', 'khtn-8', 'do-luong', 'thiet-bi-dien'],
    summary: 'Cân điện tử phòng thí nghiệm độ phân giải 0.01 g có đĩa cân thép không gỉ, lồng chắn gió thấp và màn hình LCD ngược sáng.',
    assetVersion: '1.2.0',
    manifestSchemaVersion: '1.0.0',
    moduleApiVersion: '1.0.0',
    geometry: {
      modelFormat: 'GLB',
      modelUri: 'models/OL3D-EQP-BAL-0001/v1.2.0/model.glb',
      modelFileVersion: '1.2.0',
      proceduralArchetype: 'electronic-balance',
      upAxis: 'Y',
      anchor: 'base-center',
      boundingBoxM: { width: 0.20, height: 0.085, depth: 0.24 },
      dimensions: {
        height: { value: 85, unit: 'mm', status: 'measured', methodRef: 'Thước cặp điện tử Mitutoyo', measuredAt: '2026-09-12' },
        widthOrDiameter: { value: 200, unit: 'mm', status: 'measured', methodRef: 'Thước cặp điện tử Mitutoyo' },
        depth: { value: 240, unit: 'mm', status: 'measured' },
      },
      triangleCount: 4820,
      materialCount: 5,
      namedNodes: [
        { nodeName: 'root', role: 'root', description: 'Gốc tọa độ tâm đáy chân đế cân' },
        { nodeName: 'body', role: 'body', description: 'Thân vỏ nhựa ABS kỹ thuật và khung chắn gió' },
        { nodeName: 'scale_display', role: 'scale_display', description: 'Màn hình LCD hiển thị số đo khối lượng (g)' },
        { nodeName: 'measurement_anchor', role: 'measurement_anchor', description: 'Tâm mặt đĩa cân inox đường kính 120 mm' },
      ],
      scaleValidation: 'verified',
    },
    scientificProperties: {
      material: { value: 'Thép không gỉ SUS304 & Nhựa ABS chống hóa chất', status: 'verified' },
      referenceMass: { value: 1450, unit: 'g', uncertainty: 5, uncertaintyUnit: 'g', status: 'reported' },
    },
    measurementMetadata: {
      isMeasuringInstrument: true,
      measuredQuantity: 'mass',
      rangeMin: { value: 0.0, unit: 'g', status: 'verified' },
      rangeMax: { value: 500.0, unit: 'g', status: 'verified' },
      leastCount: { value: 0.01, unit: 'g', status: 'verified' },
      zeroOffsetSupported: true,
      calibrationMethod: 'Hiệu chuẩn ngoại bằng quả cân chuẩn cấp F2 200 g',
      referenceStandard: 'OIML R76-1',
      lastMeasuredDate: '2026-09-12',
    },
    capabilities: [
      { id: 'selectable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'translatable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'rotatable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'showDimensions', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'weighObject', state: 'ui-demo', behaviorModuleId: 'bhv-electronic-balance', config: { maxCapacityG: 500, leastCountG: 0.01 } },
      { id: 'readScale', state: 'ui-demo', behaviorModuleId: 'bhv-electronic-balance' },
    ],
    behaviorIds: ['bhv-core-spatial', 'bhv-electronic-balance'],
    validation: {
      assetReviewStatus: 'published',
      geometryStatus: 'verified',
      metrologyStatus: 'partially-verified',
      behaviorStatus: 'ui-demo',
      safetyStatus: 'reviewed',
      reviewerNotes: 'Kích thước hình học và đĩa cân đã đối chiếu thiết bị thực tế; mô-đun cân tự động đang ở chế độ UI Demo.',
    },
    provenance: {
      createdBy: 'Nhóm Thiết bị Đo lường KHTN',
      authorRole: 'Giáo viên Vật lí & Kỹ thuật viên Lab',
      organization: 'OpenLab Vietnam',
      sourceType: 'school-lab-scan',
      createdAt: '2026-08-15',
      updatedAt: '2026-10-02',
      license: 'CC BY-NC-SA 4.0',
      redistributionAllowed: true,
    },
  },
  {
    assetId: 'OL3D-EQP-CYL-0001',
    slug: 'ong-dong-thuy-tinh-100ml',
    name: {
      vi: 'Ống đong thủy tinh 100 ml',
      en: '100 ml Graduated Cylinder',
    },
    kind: 'equipment',
    subject: 'physics',
    category: 'volume-measurement',
    categoryIds: ['volume-measurement', 'laboratory-glassware'],
    tags: ['ong-dong', 'the-tich', 'thuy-tinh', 'khtn-8'],
    summary: 'Ống đong thủy tinh Borosilicate 3.3 dung tích 100 ml, chân đế lục giác chống lăn, vạch chia 1 ml dùng để đo thể tích chất lỏng và dời chỗ.',
    assetVersion: '1.1.0',
    manifestSchemaVersion: '1.0.0',
    moduleApiVersion: '1.0.0',
    geometry: {
      modelFormat: 'GLB',
      modelUri: 'models/OL3D-EQP-CYL-0001/v1.1.0/model.glb',
      modelFileVersion: '1.1.0',
      proceduralArchetype: 'graduated-cylinder',
      upAxis: 'Y',
      anchor: 'base-center',
      boundingBoxM: { width: 0.065, height: 0.255, depth: 0.065 },
      dimensions: {
        height: { value: 255, unit: 'mm', status: 'verified', methodRef: 'Thước cặp 300 mm' },
        widthOrDiameter: { value: 32, unit: 'mm', status: 'verified', notes: 'Đường kính ngoài thân ống; chân đế rộng 65 mm' },
      },
      triangleCount: 3640,
      materialCount: 3,
      namedNodes: [
        { nodeName: 'root', role: 'root', description: 'Tâm đáy chân lục giác' },
        { nodeName: 'body', role: 'body', description: 'Thân ống thủy tinh Borosilicate trong suốt' },
        { nodeName: 'scale_marks', role: 'scale_marks', description: 'Hệ vạch chia từ 10 ml đến 100 ml' },
        { nodeName: 'liquid_surface', role: 'liquid_surface', description: 'Mặt khum chất lỏng (meniscus) điều chỉnh được' },
      ],
      scaleValidation: 'verified',
    },
    scientificProperties: {
      material: { value: 'Thủy tinh Borosilicate 3.3', status: 'verified' },
      capacity: { value: 100, unit: 'ml', uncertainty: 0.5, uncertaintyUnit: 'ml', status: 'verified' },
      referenceMass: { value: 138.5, unit: 'g', status: 'reported' },
    },
    measurementMetadata: {
      isMeasuringInstrument: true,
      measuredQuantity: 'volume',
      rangeMin: { value: 10, unit: 'ml', status: 'verified' },
      rangeMax: { value: 100, unit: 'ml', status: 'verified' },
      leastCount: { value: 1.0, unit: 'ml', status: 'verified' },
      zeroOffsetSupported: false,
      calibrationMethod: 'Chuẩn In (Ex/TD) ở 20°C theo ISO 4788',
      referenceStandard: 'ISO 4788 Class B',
      lastMeasuredDate: '2026-09-20',
    },
    capabilities: [
      { id: 'selectable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'translatable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'rotatable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'showDimensions', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'readScale', state: 'ui-demo', behaviorModuleId: 'bhv-graduated-cylinder', config: { capacityMl: 100, leastCountMl: 1 } },
      { id: 'displacementVolume', state: 'ui-demo', behaviorModuleId: 'bhv-graduated-cylinder' },
    ],
    behaviorIds: ['bhv-core-spatial', 'bhv-graduated-cylinder'],
    validation: {
      assetReviewStatus: 'published',
      geometryStatus: 'verified',
      metrologyStatus: 'verified',
      behaviorStatus: 'ui-demo',
      safetyStatus: 'reviewed',
      reviewerNotes: 'Tỷ lệ vạch chia và chiều cao cột nước khớp chuẩn ISO 4788; hiệu ứng dời chỗ đang ở mức minh họa từng bước.',
    },
    provenance: {
      createdBy: 'Tổ Hóa - Sinh & Vật lí ứng dụng',
      authorRole: 'Nhóm phát triển học liệu chuẩn',
      organization: 'OpenLab Vietnam',
      sourceType: 'manufacturer-spec',
      createdAt: '2026-08-10',
      updatedAt: '2026-10-05',
      license: 'CC BY-NC-SA 4.0',
      redistributionAllowed: true,
    },
  },
  {
    assetId: 'OL3D-EQP-BKR-0001',
    slug: 'coc-thuy-tinh-250ml',
    name: {
      vi: 'Cốc thủy tinh chia độ 250 ml',
      en: '250 ml Low-Form Glass Beaker',
    },
    kind: 'equipment',
    subject: 'chemistry',
    category: 'laboratory-glassware',
    categoryIds: ['laboratory-glassware', 'volume-measurement'],
    tags: ['coc-thuy-tinh', 'beaker', '250ml', 'dung-cu-thuy-tinh'],
    summary: 'Cốc thủy tinh thành thấp có mỏ rót, vạch chia ước lượng từ 50 ml đến 250 ml, dùng chứa chất lỏng hoặc hứng nước từ bình tràn.',
    assetVersion: '1.0.2',
    manifestSchemaVersion: '1.0.0',
    moduleApiVersion: '1.0.0',
    geometry: {
      modelFormat: 'GLB',
      modelUri: 'models/OL3D-EQP-BKR-0001/v1.0.2/model.glb',
      modelFileVersion: '1.0.1',
      proceduralArchetype: 'beaker-250',
      upAxis: 'Y',
      anchor: 'base-center',
      boundingBoxM: { width: 0.075, height: 0.098, depth: 0.075 },
      dimensions: {
        height: { value: 98, unit: 'mm', status: 'verified', methodRef: 'ISO 3819' },
        widthOrDiameter: { value: 70, unit: 'mm', status: 'verified' },
      },
      triangleCount: 2890,
      materialCount: 3,
      namedNodes: [
        { nodeName: 'root', role: 'root', description: 'Tâm đáy cốc thủy tinh' },
        { nodeName: 'body', role: 'body', description: 'Thân cốc thủy tinh có mỏ rót' },
        { nodeName: 'scale_marks', role: 'scale_marks', description: 'Vạch chia ước lượng 50 - 250 ml (±5%)' },
        { nodeName: 'liquid_surface', role: 'liquid_surface', description: 'Lớp chất lỏng chứa bên trong' },
      ],
      scaleValidation: 'verified',
    },
    scientificProperties: {
      material: { value: 'Thủy tinh chịu nhiệt Borosilicate 3.3', status: 'verified' },
      capacity: { value: 250, unit: 'ml', uncertainty: 12.5, uncertaintyUnit: 'ml', status: 'reported' },
      referenceMass: { value: 96, unit: 'g', status: 'illustrative' },
      temperatureRating: { value: 400, unit: '°C', status: 'reported' },
    },
    measurementMetadata: {
      isMeasuringInstrument: false,
      measuredQuantity: 'volume',
      rangeMin: { value: 50, unit: 'ml', status: 'illustrative' },
      rangeMax: { value: 250, unit: 'ml', status: 'illustrative' },
      leastCount: { value: 25, unit: 'ml', status: 'illustrative' },
      calibrationMethod: 'Vạch chia trên cốc chỉ dùng để ước lượng, không dùng để đo chính xác thể tích.',
    },
    capabilities: [
      { id: 'selectable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'translatable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'rotatable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'showDimensions', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'readScale', state: 'ui-demo', behaviorModuleId: 'bhv-graduated-cylinder' },
    ],
    behaviorIds: ['bhv-core-spatial', 'bhv-graduated-cylinder'],
    validation: {
      assetReviewStatus: 'published',
      geometryStatus: 'verified',
      metrologyStatus: 'not-verified',
      behaviorStatus: 'ui-demo',
      safetyStatus: 'reviewed',
      reviewerNotes: 'Lưu ý rõ trong hồ sơ: Cốc thủy tinh có sai số vạch ±5%, không dùng thay ống đong khi đo thể tích chính xác.',
    },
    provenance: {
      createdBy: 'Tổ Hóa học Phổ thông',
      authorRole: 'Giáo viên Hóa học',
      organization: 'OpenLab Vietnam',
      sourceType: 'manufacturer-spec',
      createdAt: '2026-08-18',
      updatedAt: '2026-09-30',
      license: 'CC BY-NC-SA 4.0',
      redistributionAllowed: true,
    },
  },
  {
    assetId: 'OL3D-EQP-OVF-0001',
    slug: 'binh-tran-eureka-250ml',
    name: {
      vi: 'Bình tràn Eureka 250 ml',
      en: 'Eureka Overflow Can 250 ml',
    },
    kind: 'equipment',
    subject: 'physics',
    category: 'volume-measurement',
    categoryIds: ['volume-measurement', 'laboratory-glassware'],
    tags: ['binh-tran', 'eureka', 'doi-cho', 'archimedes', 'khtn-8'],
    summary: 'Bình tràn có vòi dẫn nghiêng bên hông dùng xác định thể tích vật rắn không thấm nước và có kích thước lớn không bỏ vừa ống đong.',
    assetVersion: '1.0.0',
    manifestSchemaVersion: '1.0.0',
    moduleApiVersion: '1.0.0',
    geometry: {
      modelFormat: 'GLB',
      modelUri: 'models/OL3D-EQP-OVF-0001/v1.0.0/model.glb',
      modelFileVersion: '1.0.0',
      proceduralArchetype: 'overflow-can',
      upAxis: 'Y',
      anchor: 'base-center',
      boundingBoxM: { width: 0.115, height: 0.135, depth: 0.080 },
      dimensions: {
        height: { value: 135, unit: 'mm', status: 'reported', methodRef: 'Đo mẫu thiết bị trường THPT' },
        widthOrDiameter: { value: 78, unit: 'mm', status: 'reported', notes: 'Chiều rộng tính cả vòi tràn là 115 mm' },
      },
      triangleCount: 3420,
      materialCount: 3,
      namedNodes: [
        { nodeName: 'root', role: 'root', description: 'Tâm đáy bình tràn' },
        { nodeName: 'body', role: 'body', description: 'Thân bình trụ và ống vòi thoát nước nghiêng 35°' },
        { nodeName: 'liquid_surface', role: 'liquid_surface', description: 'Mực nước ngang miệng vòi tràn (102 mm)' },
        { nodeName: 'measurement_anchor', role: 'measurement_anchor', description: 'Đầu mút vòi tràn để đặt cốc/ống đong hứng nước' },
      ],
      scaleValidation: 'partially-verified',
    },
    scientificProperties: {
      material: { value: 'Thủy tinh Borosilicate / Nhôm anod hóa', status: 'reported' },
      capacity: { value: 250, unit: 'ml', status: 'illustrative' },
      referenceMass: { value: 112, unit: 'g', status: 'illustrative' },
    },
    measurementMetadata: {
      isMeasuringInstrument: false,
      measuredQuantity: 'volume',
      calibrationMethod: 'Đổ nước ngập tới miệng vòi tràn, chờ nước ngừng nhỏ giọt trước khi thả vật rắn.',
    },
    capabilities: [
      { id: 'selectable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'translatable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'rotatable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'showDimensions', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'displacementVolume', state: 'ui-demo', behaviorModuleId: 'bhv-overflow-displacement', config: { spoutHeightMm: 102 } },
    ],
    behaviorIds: ['bhv-core-spatial', 'bhv-overflow-displacement'],
    validation: {
      assetReviewStatus: 'published',
      geometryStatus: 'partially-verified',
      metrologyStatus: 'not-verified',
      behaviorStatus: 'ui-demo',
      safetyStatus: 'reviewed',
    },
    provenance: {
      createdBy: 'CLB KHKT Him Lam',
      authorRole: 'Nhóm mô hình hóa 3D',
      organization: 'OpenLab Studio Contribution',
      sourceType: 'school-lab-scan',
      createdAt: '2026-09-01',
      updatedAt: '2026-10-10',
      license: 'CC BY-NC-SA 4.0',
      redistributionAllowed: true,
    },
  },
  {
    assetId: 'OL3D-EQP-DYN-0001',
    slug: 'luc-ke-lo-xo-5n',
    name: {
      vi: 'Lực kế lò xo ống trụ 5 N',
      en: '5 N Tubular Spring Dynamometer',
    },
    kind: 'equipment',
    subject: 'physics',
    category: 'force-measurement',
    categoryIds: ['force-measurement'],
    tags: ['luc-ke', 'trong-luong', 'luc-day-archimedes', '5n'],
    summary: 'Lực kế lò xo vỏ ống acrylic trong suốt có khuyên treo trên, móc treo vật phía dưới và thang chia Newton (N) song song gam lực.',
    assetVersion: '1.0.0',
    manifestSchemaVersion: '1.0.0',
    moduleApiVersion: '1.0.0',
    geometry: {
      modelFormat: 'GLB',
      modelUri: 'models/OL3D-EQP-DYN-0001/v1.0.0/model.glb',
      modelFileVersion: '1.0.0',
      proceduralArchetype: 'spring-dynamometer',
      upAxis: 'Y',
      anchor: 'base-center',
      boundingBoxM: { width: 0.036, height: 0.230, depth: 0.036 },
      dimensions: {
        height: { value: 230, unit: 'mm', status: 'reported' },
        widthOrDiameter: { value: 28, unit: 'mm', status: 'reported' },
      },
      triangleCount: 4120,
      materialCount: 4,
      namedNodes: [
        { nodeName: 'root', role: 'root', description: 'Điểm gốc lực kế' },
        { nodeName: 'body', role: 'body', description: 'Ống trụ trong suốt và thang chia 0 - 5 N' },
        { nodeName: 'plunger', role: 'plunger', description: 'Trục lò xo và đĩa chỉ thị vạch lực' },
        { nodeName: 'measurement_anchor', role: 'measurement_anchor', description: 'Móc thép dưới để treo quả cân hoặc vật mẫu' },
      ],
      scaleValidation: 'partially-verified',
    },
    scientificProperties: {
      material: { value: 'Ống Acrylic PMMA, Lò xo thép đàn hồi & Móc mạ crôm', status: 'reported' },
      referenceMass: { value: 65, unit: 'g', status: 'illustrative' },
    },
    measurementMetadata: {
      isMeasuringInstrument: true,
      measuredQuantity: 'force',
      rangeMin: { value: 0.0, unit: 'N', status: 'verified' },
      rangeMax: { value: 5.0, unit: 'N', status: 'verified' },
      leastCount: { value: 0.1, unit: 'N', status: 'verified' },
      zeroOffsetSupported: true,
      calibrationMethod: 'Chỉnh ốc vặn đỉnh ống để vạch chỉ thị trùng đúng vạch 0 khi treo thẳng đứng không tải.',
    },
    capabilities: [
      { id: 'selectable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'translatable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'rotatable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'showDimensions', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'measureForce', state: 'ui-demo', behaviorModuleId: 'bhv-spring-dynamometer', config: { maxForceN: 5.0, leastCountN: 0.1 } },
      { id: 'readScale', state: 'ui-demo', behaviorModuleId: 'bhv-spring-dynamometer' },
    ],
    behaviorIds: ['bhv-core-spatial', 'bhv-spring-dynamometer'],
    validation: {
      assetReviewStatus: 'published',
      geometryStatus: 'partially-verified',
      metrologyStatus: 'not-verified',
      behaviorStatus: 'ui-demo',
      safetyStatus: 'reviewed',
    },
    provenance: {
      createdBy: 'Nhóm Thiết bị Đo lường KHTN',
      authorRole: 'Giáo viên Vật lí',
      organization: 'OpenLab Vietnam',
      sourceType: 'sample-data',
      createdAt: '2026-08-25',
      updatedAt: '2026-10-08',
      license: 'CC BY-NC-SA 4.0',
      redistributionAllowed: true,
    },
  },
  {
    assetId: 'OL3D-EQP-CAL-0001',
    slug: 'thuoc-cap-du-xich-150mm',
    name: {
      vi: 'Thước cặp du xích 150 mm (0.02 mm)',
      en: 'Vernier Caliper 150 mm x 0.02 mm',
    },
    kind: 'equipment',
    subject: 'physics',
    category: 'length-measurement',
    categoryIds: ['length-measurement'],
    tags: ['thuoc-cap', 'du-xich', 'kich-thuoc', 'duong-kinh'],
    summary: 'Thước cặp cơ khí bằng thép không gỉ tôi cứng, đo kích thước ngoài, kích thước trong và chiều sâu vật rắn với độ chính xác 0.02 mm.',
    assetVersion: '1.1.0',
    manifestSchemaVersion: '1.0.0',
    moduleApiVersion: '1.0.0',
    geometry: {
      modelFormat: 'GLB',
      modelUri: 'models/OL3D-EQP-CAL-0001/v1.1.0/model.glb',
      modelFileVersion: '1.1.0',
      proceduralArchetype: 'vernier-caliper',
      upAxis: 'Y',
      anchor: 'base-center',
      boundingBoxM: { width: 0.235, height: 0.016, depth: 0.078 },
      dimensions: {
        height: { value: 16, unit: 'mm', status: 'verified' },
        widthOrDiameter: { value: 235, unit: 'mm', status: 'verified' },
        depth: { value: 78, unit: 'mm', status: 'verified' },
      },
      triangleCount: 3980,
      materialCount: 3,
      namedNodes: [
        { nodeName: 'root', role: 'root', description: 'Tâm thước cặp đặt trên mặt phẳng bàn' },
        { nodeName: 'body', role: 'body', description: 'Thân thước chính khắc vạch milimét' },
        { nodeName: 'plunger', role: 'plunger', description: 'Khung trượt du xích (Vernier scale) và vít hãm' },
        { nodeName: 'scale_marks', role: 'scale_marks', description: 'Thang du xích 50 khoảng chia (0.02 mm)' },
      ],
      scaleValidation: 'verified',
    },
    scientificProperties: {
      material: { value: 'Thép không gỉ mạ Satin Chrome chống chói', status: 'verified' },
      referenceMass: { value: 162, unit: 'g', status: 'measured' },
    },
    measurementMetadata: {
      isMeasuringInstrument: true,
      measuredQuantity: 'length',
      rangeMin: { value: 0, unit: 'mm', status: 'verified' },
      rangeMax: { value: 150, unit: 'mm', status: 'verified' },
      leastCount: { value: 0.02, unit: 'mm', status: 'verified' },
      zeroOffsetSupported: false,
      calibrationMethod: 'Kiểm tra độ khít hai mỏ đo ngoài và sự trùng khít vạch 0 du xích với vạch 0 thân thước.',
      referenceStandard: 'DIN 862 / ISO 13385-1',
      lastMeasuredDate: '2026-09-18',
    },
    capabilities: [
      { id: 'selectable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'translatable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'rotatable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'showDimensions', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'caliperMeasure', state: 'ui-demo', behaviorModuleId: 'bhv-vernier-caliper', config: { maxRangeMm: 150, vernierPrecisionMm: 0.02 } },
      { id: 'readScale', state: 'ui-demo', behaviorModuleId: 'bhv-vernier-caliper' },
    ],
    behaviorIds: ['bhv-core-spatial', 'bhv-vernier-caliper'],
    validation: {
      assetReviewStatus: 'published',
      geometryStatus: 'verified',
      metrologyStatus: 'verified',
      behaviorStatus: 'ui-demo',
      safetyStatus: 'reviewed',
    },
    provenance: {
      createdBy: 'Phòng Đo lường Cơ khí',
      authorRole: 'Kỹ sư Cơ điện tử',
      organization: 'OpenLab Vietnam',
      sourceType: 'manufacturer-spec',
      createdAt: '2026-08-22',
      updatedAt: '2026-10-04',
      license: 'CC BY-NC-SA 4.0',
      redistributionAllowed: true,
    },
  },
  {
    assetId: 'OL3D-EQP-WGT-0001',
    slug: 'qua-can-chuan-50g',
    name: {
      vi: 'Quả cân chuẩn bằng đồng 50 g',
      en: '50 g Brass Calibration Weight',
    },
    kind: 'equipment',
    subject: 'physics',
    category: 'mass-measurement',
    categoryIds: ['mass-measurement', 'solid-specimens'],
    tags: ['qua-can', '50g', 'hieu-chuan', 'dong-thau'],
    summary: 'Quả cân chuẩn hình trụ có núm cầm trên đỉnh, dùng để kiểm tra độ nhạy của cân điện tử hoặc làm tải chuẩn cho lực kế.',
    assetVersion: '1.0.0',
    manifestSchemaVersion: '1.0.0',
    moduleApiVersion: '1.0.0',
    geometry: {
      modelFormat: 'GLB',
      modelUri: 'models/OL3D-EQP-WGT-0001/v1.0.0/model.glb',
      modelFileVersion: '1.0.0',
      proceduralArchetype: 'calibration-weight',
      upAxis: 'Y',
      anchor: 'base-center',
      boundingBoxM: { width: 0.022, height: 0.034, depth: 0.022 },
      dimensions: {
        height: { value: 34, unit: 'mm', status: 'verified' },
        widthOrDiameter: { value: 22, unit: 'mm', status: 'verified' },
      },
      triangleCount: 2140,
      materialCount: 1,
      namedNodes: [
        { nodeName: 'root', role: 'root', description: 'Tâm đáy quả cân' },
        { nodeName: 'body', role: 'body', description: 'Thân trụ đồng thau đánh bóng' },
        { nodeName: 'handle', role: 'handle', description: 'Cổ thắt và núm kẹp nhíp gắp' },
      ],
      scaleValidation: 'verified',
    },
    scientificProperties: {
      material: { value: 'Đồng thau mạ Niken-Crôm', status: 'verified' },
      referenceMass: { value: 50.0, unit: 'g', uncertainty: 0.02, uncertaintyUnit: 'g', status: 'verified', methodRef: 'Chuẩn cấp M1' },
      referenceVolume: { value: 5.95, unit: 'cm³', status: 'illustrative' },
      referenceDensity: { value: 8.40, unit: 'g/cm³', status: 'reported' },
    },
    measurementMetadata: {
      isMeasuringInstrument: false,
      measuredQuantity: 'mass',
      referenceStandard: 'OIML R111 Class M1',
    },
    capabilities: [
      { id: 'selectable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'translatable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'rotatable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'showDimensions', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
    ],
    behaviorIds: ['bhv-core-spatial'],
    validation: {
      assetReviewStatus: 'published',
      geometryStatus: 'verified',
      metrologyStatus: 'verified',
      behaviorStatus: 'implemented',
      safetyStatus: 'reviewed',
    },
    provenance: {
      createdBy: 'Nhóm Thiết bị Đo lường KHTN',
      authorRole: 'Giáo viên Vật lí',
      organization: 'OpenLab Vietnam',
      sourceType: 'manufacturer-spec',
      createdAt: '2026-08-19',
      updatedAt: '2026-09-25',
      license: 'CC BY-NC-SA 4.0',
      redistributionAllowed: true,
    },
  },
  {
    assetId: 'OL3D-EQP-SLD-0001',
    slug: 'vat-ran-hinh-tru-nhom',
    name: {
      vi: 'Vật rắn hình trụ hợp kim nhôm',
      en: 'Solid Aluminum Cylinder Specimen',
    },
    kind: 'specimen',
    subject: 'physics',
    category: 'solid-specimens',
    categoryIds: ['solid-specimens'],
    tags: ['vat-mau', 'hinh-tru', 'nhom', 'khoi-luong-rieng', 'khtn-8'],
    summary: 'Mẫu vật rắn đặc hình trụ đều bằng hợp kim nhôm 6061 có móc treo nhỏ, dùng trong bài thực hành xác định khối lượng riêng.',
    assetVersion: '1.0.0',
    manifestSchemaVersion: '1.0.0',
    moduleApiVersion: '1.0.0',
    geometry: {
      modelFormat: 'GLB',
      modelUri: 'models/OL3D-EQP-SLD-0001/v1.0.0/model.glb',
      modelFileVersion: '1.0.0',
      proceduralArchetype: 'solid-cylinder',
      upAxis: 'Y',
      anchor: 'base-center',
      boundingBoxM: { width: 0.025, height: 0.050, depth: 0.025 },
      dimensions: {
        height: { value: 50.0, unit: 'mm', uncertainty: 0.1, uncertaintyUnit: 'mm', status: 'illustrative' },
        widthOrDiameter: { value: 25.0, unit: 'mm', uncertainty: 0.1, uncertaintyUnit: 'mm', status: 'illustrative' },
      },
      triangleCount: 1840,
      materialCount: 2,
      namedNodes: [
        { nodeName: 'root', role: 'root', description: 'Tâm đáy hình trụ' },
        { nodeName: 'body', role: 'body', description: 'Khối trụ hợp kim nhôm đặc' },
        { nodeName: 'handle', role: 'handle', description: 'Khuyên nhỏ buộc chỉ hoặc móc lực kế' },
      ],
      scaleValidation: 'verified',
    },
    scientificProperties: {
      material: { value: 'Hợp kim nhôm Al-6061 (Đặc, không rỗng)', status: 'illustrative' },
      referenceMass: { value: 66.25, unit: 'g', status: 'illustrative', notes: 'Dữ liệu minh họa dùng cho bảng mẫu ρ = m / V' },
      referenceVolume: { value: 24.54, unit: 'cm³', status: 'illustrative', notes: 'V = π × r² × h ≈ 24.54 cm³' },
      referenceDensity: { value: 2.70, unit: 'g/cm³', status: 'illustrative' },
      internalCavity: { isHollow: false },
    },
    measurementMetadata: {
      isMeasuringInstrument: false,
      measuredQuantity: 'none',
    },
    capabilities: [
      { id: 'selectable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'translatable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'rotatable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'showDimensions', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
    ],
    behaviorIds: ['bhv-core-spatial'],
    validation: {
      assetReviewStatus: 'published',
      geometryStatus: 'verified',
      metrologyStatus: 'not-verified',
      behaviorStatus: 'implemented',
      safetyStatus: 'reviewed',
      reviewerNotes: 'Số liệu m = 66.25 g và V = 24.54 cm³ là dữ liệu mẫu minh họa (illustrative) để học sinh đối chiếu công thức.',
    },
    provenance: {
      createdBy: 'CLB KHKT Him Lam',
      authorRole: 'Học sinh & Giáo viên hướng dẫn',
      organization: 'OpenLab Studio Contribution',
      sourceType: 'sample-data',
      createdAt: '2026-09-02',
      updatedAt: '2026-10-12',
      license: 'CC BY-NC-SA 4.0',
      redistributionAllowed: true,
    },
  },
  {
    assetId: 'OL3D-EQP-SPH-0001',
    slug: 'vat-ran-hinh-cau-thep',
    name: {
      vi: 'Vật rắn hình cầu thép không gỉ',
      en: 'Stainless Steel Sphere Specimen',
    },
    kind: 'specimen',
    subject: 'physics',
    category: 'solid-specimens',
    categoryIds: ['solid-specimens'],
    tags: ['vat-mau', 'hinh-cau', 'thep', 'khoi-luong-rieng'],
    summary: 'Viên bi cầu đặc bằng thép không gỉ đường kính 28 mm đặt trên vòng đế cao su mỏng chống lăn trên mặt bàn.',
    assetVersion: '1.0.0',
    manifestSchemaVersion: '1.0.0',
    moduleApiVersion: '1.0.0',
    geometry: {
      modelFormat: 'GLB',
      modelUri: 'models/OL3D-EQP-SPH-0001/v1.0.0/model.glb',
      modelFileVersion: '1.0.0',
      proceduralArchetype: 'solid-sphere',
      upAxis: 'Y',
      anchor: 'base-center',
      boundingBoxM: { width: 0.028, height: 0.028, depth: 0.028 },
      dimensions: {
        height: { value: 28.0, unit: 'mm', status: 'illustrative' },
        widthOrDiameter: { value: 28.0, unit: 'mm', status: 'illustrative' },
      },
      triangleCount: 2560,
      materialCount: 2,
      namedNodes: [
        { nodeName: 'root', role: 'root', description: 'Điểm tiếp xúc mặt bàn' },
        { nodeName: 'body', role: 'body', description: 'Khối cầu thép đánh bóng gương' },
      ],
      scaleValidation: 'verified',
    },
    scientificProperties: {
      material: { value: 'Thép không gỉ AISI 304 (Đặc)', status: 'illustrative' },
      referenceMass: { value: 90.5, unit: 'g', status: 'illustrative' },
      referenceVolume: { value: 11.49, unit: 'cm³', status: 'illustrative' },
      referenceDensity: { value: 7.88, unit: 'g/cm³', status: 'illustrative' },
      internalCavity: { isHollow: false },
    },
    measurementMetadata: {
      isMeasuringInstrument: false,
      measuredQuantity: 'none',
    },
    capabilities: [
      { id: 'selectable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'translatable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'rotatable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'showDimensions', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
    ],
    behaviorIds: ['bhv-core-spatial'],
    validation: {
      assetReviewStatus: 'published',
      geometryStatus: 'verified',
      metrologyStatus: 'not-verified',
      behaviorStatus: 'implemented',
      safetyStatus: 'reviewed',
    },
    provenance: {
      createdBy: 'Nhóm Thiết bị Đo lường KHTN',
      authorRole: 'Giáo viên Vật lí',
      organization: 'OpenLab Vietnam',
      sourceType: 'sample-data',
      createdAt: '2026-09-05',
      updatedAt: '2026-10-01',
      license: 'CC BY-NC-SA 4.0',
      redistributionAllowed: true,
    },
  },
  {
    assetId: 'OL3D-EQP-BLK-0001',
    slug: 'vat-ran-hinh-hop-dong-thau',
    name: {
      vi: 'Vật rắn hình hộp chữ nhật đồng thau',
      en: 'Rectangular Brass Block Specimen',
    },
    kind: 'specimen',
    subject: 'physics',
    category: 'solid-specimens',
    categoryIds: ['solid-specimens'],
    tags: ['vat-mau', 'hinh-hop', 'dong-thau', 'thuoc-cap'],
    summary: 'Khối hộp chữ nhật đồng thau gia công phẳng 40 × 25 × 15 mm dùng thực hành đo kích thước bằng thước cặp và đo khối lượng riêng.',
    assetVersion: '1.0.0',
    manifestSchemaVersion: '1.0.0',
    moduleApiVersion: '1.0.0',
    geometry: {
      modelFormat: 'GLB',
      modelUri: 'models/OL3D-EQP-BLK-0001/v1.0.0/model.glb',
      modelFileVersion: '1.0.0',
      proceduralArchetype: 'solid-block',
      upAxis: 'Y',
      anchor: 'base-center',
      boundingBoxM: { width: 0.040, height: 0.015, depth: 0.025 },
      dimensions: {
        height: { value: 15.0, unit: 'mm', status: 'illustrative' },
        widthOrDiameter: { value: 40.0, unit: 'mm', status: 'illustrative' },
        depth: { value: 25.0, unit: 'mm', status: 'illustrative' },
      },
      triangleCount: 960,
      materialCount: 1,
      namedNodes: [
        { nodeName: 'root', role: 'root', description: 'Tâm mặt đáy khối hộp' },
        { nodeName: 'body', role: 'body', description: 'Khối đồng thau C36000 vát mép nhẹ 0.5 mm' },
      ],
      scaleValidation: 'verified',
    },
    scientificProperties: {
      material: { value: 'Đồng thau C36000 (Đặc)', status: 'illustrative' },
      referenceMass: { value: 127.5, unit: 'g', status: 'illustrative' },
      referenceVolume: { value: 15.0, unit: 'cm³', status: 'illustrative' },
      referenceDensity: { value: 8.50, unit: 'g/cm³', status: 'illustrative' },
      internalCavity: { isHollow: false },
    },
    measurementMetadata: {
      isMeasuringInstrument: false,
      measuredQuantity: 'none',
    },
    capabilities: [
      { id: 'selectable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'translatable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'rotatable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'showDimensions', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
    ],
    behaviorIds: ['bhv-core-spatial'],
    validation: {
      assetReviewStatus: 'published',
      geometryStatus: 'verified',
      metrologyStatus: 'not-verified',
      behaviorStatus: 'implemented',
      safetyStatus: 'reviewed',
    },
    provenance: {
      createdBy: 'Phòng Đo lường Cơ khí',
      authorRole: 'Kỹ thuật viên',
      organization: 'OpenLab Vietnam',
      sourceType: 'sample-data',
      createdAt: '2026-09-06',
      updatedAt: '2026-10-01',
      license: 'CC BY-NC-SA 4.0',
      redistributionAllowed: true,
    },
  },
  {
    assetId: 'OL3D-EQP-HLW-0001',
    slug: 'vat-ran-rong-co-khoang-ben-trong',
    name: {
      vi: 'Ống trụ kim loại rỗng có khoang kín',
      en: 'Hollow Metallic Cylinder with Internal Cavity',
    },
    kind: 'specimen',
    subject: 'physics',
    category: 'hollow-specimens',
    categoryIds: ['hollow-specimens', 'solid-specimens'],
    tags: ['vat-rong', 'khoang-ben-trong', 'khoi-luong-rieng-bieu-kien', 'canh-bao-khoa-hoc'],
    summary: 'Mẫu vật hình trụ có khoang rỗng bên trong dùng để minh họa sự khác biệt giữa khối lượng riêng của chất tạo vật và khối lượng riêng trung bình của vật rỗng.',
    assetVersion: '1.0.0',
    manifestSchemaVersion: '1.0.0',
    moduleApiVersion: '1.0.0',
    geometry: {
      modelFormat: 'PROCEDURAL_PBR',
      modelUri: 'models/OL3D-EQP-HLW-0001/v1.0.0/model.glb',
      modelFileVersion: '1.0.0',
      proceduralArchetype: 'hollow-cylinder',
      upAxis: 'Y',
      anchor: 'base-center',
      boundingBoxM: { width: 0.036, height: 0.055, depth: 0.036 },
      dimensions: {
        height: { value: 55.0, unit: 'mm', status: 'illustrative' },
        widthOrDiameter: { value: 36.0, unit: 'mm', status: 'illustrative', notes: 'Đường kính lòng rỗng trong: 22.0 mm' },
      },
      triangleCount: 2880,
      materialCount: 2,
      namedNodes: [
        { nodeName: 'root', role: 'root', description: 'Tâm đáy ống trụ rỗng' },
        { nodeName: 'body', role: 'body', description: 'Thành ống hợp kim đồng và khoang rỗng bên trong' },
      ],
      scaleValidation: 'partially-verified',
    },
    scientificProperties: {
      material: { value: 'Hợp kim đồng có khoang rỗng khí bên trong', status: 'illustrative' },
      referenceMass: { value: 148.0, unit: 'g', status: 'illustrative' },
      referenceVolume: { value: 55.98, unit: 'cm³', status: 'illustrative', notes: 'Thể tích bao ngoài khi bịt kín khoang' },
      referenceDensity: { value: 2.64, unit: 'g/cm³', status: 'illustrative', notes: 'Khối lượng riêng biểu kiến (nhỏ hơn đồng đặc 8.5 g/cm³)' },
      internalCavity: {
        isHollow: true,
        cavityVolume: { value: 20.9, unit: 'cm³', status: 'illustrative' },
        wallThickness: { value: 7.0, unit: 'mm', status: 'illustrative' },
      },
    },
    measurementMetadata: {
      isMeasuringInstrument: false,
      measuredQuantity: 'none',
    },
    capabilities: [
      { id: 'selectable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'translatable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'rotatable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'showDimensions', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
    ],
    behaviorIds: ['bhv-core-spatial'],
    validation: {
      assetReviewStatus: 'in-review',
      geometryStatus: 'partially-verified',
      metrologyStatus: 'not-verified',
      behaviorStatus: 'implemented',
      safetyStatus: 'reviewed',
      reviewerNotes: 'Cảnh báo khoa học: Không suy ra khối lượng riêng vật liệu chỉ từ kích thước bao ngoài nếu chưa kiểm tra khoang rỗng.',
    },
    provenance: {
      createdBy: 'CLB KHKT Him Lam',
      authorRole: 'Nhóm nghiên cứu',
      organization: 'OpenLab Studio Contribution',
      sourceType: 'sample-data',
      createdAt: '2026-09-14',
      updatedAt: '2026-10-15',
      license: 'CC BY-NC-SA 4.0',
      redistributionAllowed: true,
    },
  },
  {
    assetId: 'OL3D-EQP-FLK-0001',
    slug: 'binh-tam-giac-erlenmeyer-250ml',
    name: {
      vi: 'Bình tam giác Erlenmeyer 250 ml',
      en: '250 ml Erlenmeyer Conical Flask',
    },
    kind: 'equipment',
    subject: 'chemistry',
    category: 'laboratory-glassware',
    categoryIds: ['laboratory-glassware'],
    tags: ['binh-tam-giac', 'erlenmeyer', 'hoa-hoc', 'chuan-do'],
    summary: 'Bình nón cổ hẹp thủy tinh Borosilicate 250 ml giúp lắc trộn dung dịch không bị sánh ra ngoài, có vạch chia ước lượng.',
    assetVersion: '1.0.1',
    manifestSchemaVersion: '1.0.0',
    moduleApiVersion: '1.0.0',
    geometry: {
      modelFormat: 'GLB',
      modelUri: 'models/OL3D-EQP-FLK-0001/v1.0.1/model.glb',
      modelFileVersion: '1.0.1',
      proceduralArchetype: 'erlenmeyer-flask',
      upAxis: 'Y',
      anchor: 'base-center',
      boundingBoxM: { width: 0.085, height: 0.140, depth: 0.085 },
      dimensions: {
        height: { value: 140, unit: 'mm', status: 'verified', methodRef: 'ISO 1773' },
        widthOrDiameter: { value: 85, unit: 'mm', status: 'verified', notes: 'Đường kính cổ bình 34 mm' },
      },
      triangleCount: 3120,
      materialCount: 3,
      namedNodes: [
        { nodeName: 'root', role: 'root', description: 'Tâm đáy bình tam giác' },
        { nodeName: 'body', role: 'body', description: 'Thân nón thủy tinh Borosilicate' },
        { nodeName: 'liquid_surface', role: 'liquid_surface', description: 'Dung dịch chứa trong bình' },
      ],
      scaleValidation: 'verified',
    },
    scientificProperties: {
      material: { value: 'Thủy tinh Borosilicate 3.3', status: 'verified' },
      capacity: { value: 250, unit: 'ml', status: 'verified' },
      referenceMass: { value: 105, unit: 'g', status: 'reported' },
    },
    measurementMetadata: {
      isMeasuringInstrument: false,
      measuredQuantity: 'volume',
      rangeMin: { value: 50, unit: 'ml', status: 'illustrative' },
      rangeMax: { value: 250, unit: 'ml', status: 'illustrative' },
      leastCount: { value: 50, unit: 'ml', status: 'illustrative' },
    },
    capabilities: [
      { id: 'selectable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'translatable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'rotatable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'showDimensions', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
    ],
    behaviorIds: ['bhv-core-spatial'],
    validation: {
      assetReviewStatus: 'published',
      geometryStatus: 'verified',
      metrologyStatus: 'not-verified',
      behaviorStatus: 'implemented',
      safetyStatus: 'reviewed',
    },
    provenance: {
      createdBy: 'Tổ Hóa học Phổ thông',
      authorRole: 'Giáo viên Hóa học',
      organization: 'OpenLab Vietnam',
      sourceType: 'manufacturer-spec',
      createdAt: '2026-08-28',
      updatedAt: '2026-09-29',
      license: 'CC BY-NC-SA 4.0',
      redistributionAllowed: true,
    },
  },
  {
    assetId: 'OL3D-EQP-STD-0001',
    slug: 'gia-do-thi-nghiem-da-nang',
    name: {
      vi: 'Giá đỡ thí nghiệm kèm khớp nối & tay kẹp',
      en: 'Laboratory Retort Stand with Bosshead & Clamp',
    },
    kind: 'equipment',
    subject: 'physics',
    category: 'support-hardware',
    categoryIds: ['support-hardware'],
    tags: ['gia-do', 'kep-ong-nghiem', 'treo-luc-ke', 'dung-cu-co-dinh'],
    summary: 'Chân đế gang đúc sơn tĩnh điện nặng vững chắc kèm trụ thép thẳng đứng cao 500 mm và khớp kẹp dùng treo lực kế hoặc cố định ống nghiệm.',
    assetVersion: '1.1.0',
    manifestSchemaVersion: '1.0.0',
    moduleApiVersion: '1.0.0',
    geometry: {
      modelFormat: 'GLB',
      modelUri: 'models/OL3D-EQP-STD-0001/v1.1.0/model.glb',
      modelFileVersion: '1.1.0',
      proceduralArchetype: 'retort-stand',
      upAxis: 'Y',
      anchor: 'base-center',
      boundingBoxM: { width: 0.140, height: 0.460, depth: 0.210 },
      dimensions: {
        height: { value: 460, unit: 'mm', status: 'verified' },
        widthOrDiameter: { value: 140, unit: 'mm', status: 'verified' },
        depth: { value: 210, unit: 'mm', status: 'verified' },
      },
      triangleCount: 3760,
      materialCount: 3,
      namedNodes: [
        { nodeName: 'root', role: 'root', description: 'Tâm đáy đế gang' },
        { nodeName: 'body', role: 'body', description: 'Đế gang chữ nhật và trụ thép đứng Ø10 mm' },
        { nodeName: 'handle', role: 'handle', description: 'Khớp chữ thập và thanh ngang treo lực kế' },
        { nodeName: 'measurement_anchor', role: 'measurement_anchor', description: 'Móc treo lực kế ở độ cao 380 mm' },
      ],
      scaleValidation: 'verified',
    },
    scientificProperties: {
      material: { value: 'Đế gang đúc sơn tĩnh điện & Trụ thép mạ crôm', status: 'verified' },
      referenceMass: { value: 1850, unit: 'g', status: 'reported' },
    },
    measurementMetadata: {
      isMeasuringInstrument: false,
      measuredQuantity: 'none',
    },
    capabilities: [
      { id: 'selectable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'translatable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'rotatable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'showDimensions', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
    ],
    behaviorIds: ['bhv-core-spatial'],
    validation: {
      assetReviewStatus: 'published',
      geometryStatus: 'verified',
      metrologyStatus: 'not-verified',
      behaviorStatus: 'implemented',
      safetyStatus: 'reviewed',
    },
    provenance: {
      createdBy: 'Nhóm Thiết bị Đo lường KHTN',
      authorRole: 'Kỹ thuật viên Lab',
      organization: 'OpenLab Vietnam',
      sourceType: 'school-lab-scan',
      createdAt: '2026-08-12',
      updatedAt: '2026-09-22',
      license: 'CC BY-NC-SA 4.0',
      redistributionAllowed: true,
    },
  },
  {
    assetId: 'OL3D-EQP-THM-0001',
    slug: 'nhiet-ke-phong-thi-nghiem-110c',
    name: {
      vi: 'Nhiệt kế chất lỏng -10°C đến 110°C',
      en: 'Laboratory Alcohol Thermometer -10°C to 110°C',
    },
    kind: 'equipment',
    subject: 'chemistry',
    category: 'thermal-equipment',
    categoryIds: ['thermal-equipment', 'laboratory-glassware'],
    tags: ['nhiet-ke', 'nhiet-do', 'nhiet-hoc', 'an-toan-khong-thuy-ngan'],
    summary: 'Nhiệt kế thủy tinh bầu rượu nhuộm đỏ an toàn (không chứa thủy ngân), thang đo từ -10°C đến 110°C, độ chia nhỏ nhất 1°C.',
    assetVersion: '1.0.0',
    manifestSchemaVersion: '1.0.0',
    moduleApiVersion: '1.0.0',
    geometry: {
      modelFormat: 'PROCEDURAL_PBR',
      modelUri: 'models/OL3D-EQP-THM-0001/v1.0.0/model.glb',
      modelFileVersion: '1.0.0',
      proceduralArchetype: 'thermometer',
      upAxis: 'Y',
      anchor: 'base-center',
      boundingBoxM: { width: 0.025, height: 0.220, depth: 0.025 },
      dimensions: {
        height: { value: 220, unit: 'mm', status: 'illustrative' },
        widthOrDiameter: { value: 7, unit: 'mm', status: 'illustrative' },
      },
      triangleCount: 1920,
      materialCount: 3,
      namedNodes: [
        { nodeName: 'root', role: 'root', description: 'Đầu bầu cảm biến nhiệt' },
        { nodeName: 'body', role: 'body', description: 'Thân ống mao dẫn thủy tinh và vạch chia độ C' },
        { nodeName: 'scale_marks', role: 'scale_marks', description: 'Thang đo -10°C đến 110°C' },
      ],
      scaleValidation: 'partially-verified',
    },
    scientificProperties: {
      material: { value: 'Thủy tinh mao dẫn & Cồn hữu cơ nhuộm đỏ', status: 'reported' },
      referenceMass: { value: 28, unit: 'g', status: 'illustrative' },
      temperatureRating: { value: 110, unit: '°C', status: 'verified' },
    },
    measurementMetadata: {
      isMeasuringInstrument: true,
      measuredQuantity: 'temperature',
      rangeMin: { value: -10, unit: '°C', status: 'verified' },
      rangeMax: { value: 110, unit: '°C', status: 'verified' },
      leastCount: { value: 1.0, unit: '°C', status: 'verified' },
      calibrationMethod: 'Kiểm tra điểm 0°C trong hỗn hợp nước đá đang tan và 100°C trong hơi nước sôi ở 1 atm.',
    },
    capabilities: [
      { id: 'selectable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'translatable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'rotatable', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'showDimensions', state: 'implemented', behaviorModuleId: 'bhv-core-spatial' },
      { id: 'readScale', state: 'ui-demo', behaviorModuleId: 'bhv-graduated-cylinder' },
    ],
    behaviorIds: ['bhv-core-spatial', 'bhv-graduated-cylinder'],
    validation: {
      assetReviewStatus: 'published',
      geometryStatus: 'partially-verified',
      metrologyStatus: 'not-verified',
      behaviorStatus: 'ui-demo',
      safetyStatus: 'reviewed',
    },
    provenance: {
      createdBy: 'Tổ Hóa - Sinh & Vật lí ứng dụng',
      authorRole: 'Giáo viên KHTN',
      organization: 'OpenLab Vietnam',
      sourceType: 'sample-data',
      createdAt: '2026-09-12',
      updatedAt: '2026-10-09',
      license: 'CC BY-NC-SA 4.0',
      redistributionAllowed: true,
    },
  },
  // =========================================================================
  // BỔ SUNG HỆ THỐNG DỤNG CỤ THÍ NGHIỆM CHUẨN SGK KHOA HỌC TỰ NHIÊN 9 (KNTT)
  // =========================================================================
  {
    assetId: 'OL3D-EQP-SLB-0001',
    slug: 'semicircular-glass-slab-protractor',
    name: {
      vi: 'Bản bán trụ thuỷ tinh & Bảng chia độ 360° (SGK KHTN 9)',
      en: 'Semicircular Glass Block & 360° Protractor Disc',
    },
    kind: 'equipment',
    subject: 'physics',
    category: 'optical-equipment',
    categoryIds: ['optical-equipment'],
    tags: ['bản bán trụ', 'bảng chia độ', 'khúc xạ ánh sáng', 'phản xạ toàn phần', 'góc tới hạn', 'bài 1', 'bài 5', 'bài 6'],
    summary:
      'Khối thuỷ tinh bán trụ trong suốt (chiết suất n = 1,50) gắn đồng tâm trên bảng tròn chia độ 0°–90°. Dùng để đo góc tới i, góc khúc xạ r và khảo sát hiện tượng phản xạ toàn phần.',
    textbookRef: {
      bookTitle: 'SGK Khoa học tự nhiên 9 (Kết nối tri thức)',
      chapter: 'Chương II: Ánh sáng',
      lesson: 'Bài 1 (trang 6), Bài 5 Khúc xạ ánh sáng (trang 25–28), Bài 6 Phản xạ toàn phần (trang 30–32)',
      figureRef: 'Hình 1.2, Hình 5.1, Hình 5.2, Hình 6.1',
      standardFunction:
        'Đọc chính xác giá trị góc tới i, góc khúc xạ r và góc phản xạ i\' để nghiệm lại định luật khúc xạ ánh sáng (sin i / sin r = hằng số) và xác định góc tới hạn phản xạ toàn phần (i_th ≈ 41,8°).',
      usageGuidelines:
        'Chiếu tia sáng hẹp đi qua tâm I của bản bán trụ. Thay đổi góc tới i từ 0° đến 80° và đọc góc khúc xạ r tương ứng trên vòng chia độ.',
      safetyNote: 'Tránh làm rơi vỡ khối thuỷ tinh quang học hoặc làm xước mặt phẳng tâm I.',
    },
    assetVersion: '1.1.0',
    manifestSchemaVersion: '1.0.0',
    moduleApiVersion: '1.0.0',
    geometry: {
      modelFormat: 'PROCEDURAL_PBR',
      modelUri: 'procedural://openlab3d/semicircular-slab@1.1.0',
      modelFileVersion: '1.1.0',
      proceduralArchetype: 'semicircular-slab',
      upAxis: 'Y',
      anchor: 'base-center',
      boundingBoxM: { width: 0.19, height: 0.032, depth: 0.19 },
      dimensions: {
        height: { value: 32, unit: 'mm', status: 'verified' },
        widthOrDiameter: { value: 190, unit: 'mm', status: 'verified' },
      },
      triangleCount: 2480,
      materialCount: 5,
      namedNodes: [
        { nodeName: 'root', role: 'root', description: 'Tâm bảng chia độ quang học' },
        { nodeName: 'body', role: 'body', description: 'Đĩa chia độ 360° và bản bán trụ thuỷ tinh BK7' },
        { nodeName: 'ray_paths', role: 'scale_marks', description: 'Hệ tia tới SI, tia khúc xạ IK và tia phản xạ' },
      ],
      scaleValidation: 'verified',
    },
    scientificProperties: {
      material: { value: 'Thuỷ tinh quang học BK7 (n = 1,50) & Nhựa in vòng chia độ', status: 'verified' },
      referenceMass: { value: 320, unit: 'g', status: 'verified' },
    },
    measurementMetadata: {
      isMeasuringInstrument: true,
      measuredQuantity: 'refraction-angle',
      rangeMin: { value: 0, unit: 'độ (°)', status: 'verified' },
      rangeMax: { value: 90, unit: 'độ (°)', status: 'verified' },
      leastCount: { value: 1, unit: 'độ (°)', status: 'verified' },
    },
    capabilities: [
      { id: 'selectable', state: 'implemented' },
      { id: 'translatable', state: 'implemented' },
      { id: 'rotatable', state: 'implemented' },
      { id: 'readScale', state: 'implemented' },
      { id: 'opticalFocus', state: 'implemented' },
    ],
    behaviorIds: ['bhv-core-spatial'],
    validation: {
      assetReviewStatus: 'published',
      geometryStatus: 'verified',
      metrologyStatus: 'verified',
      behaviorStatus: 'implemented',
      safetyStatus: 'reviewed',
    },
    provenance: {
      createdBy: 'Tổ Vật lí & Quang học THCS',
      authorRole: 'Giáo viên KHTN 9',
      organization: 'OpenLab Vietnam',
      sourceType: 'manufacturer-spec',
      createdAt: '2026-10-01',
      updatedAt: '2026-10-28',
      license: 'CC BY-NC-SA 4.0',
      redistributionAllowed: true,
    },
  },
  {
    assetId: 'OL3D-EQP-MAG-0001',
    slug: 'handheld-magnifying-glass-5x',
    name: {
      vi: 'Kính lúp cầm tay độ bội giác 5x (SGK KHTN 9)',
      en: '5x Handheld Magnifying Glass (f = 5 cm)',
    },
    kind: 'equipment',
    subject: 'physics',
    category: 'optical-equipment',
    categoryIds: ['optical-equipment', 'biology-microscopy'],
    tags: ['kính lúp', 'bội giác', 'thấu kính hội tụ', 'quan sát vật nhỏ', 'bài 10'],
    summary:
      'Thấu kính hội tụ có tiêu cự ngắn (f = 5 cm, số bội giác G = 25/f = 5x) được bảo vệ bởi khung kim loại có tay cầm. Dùng bổ trợ cho mắt để quan sát các vật nhỏ.',
    textbookRef: {
      bookTitle: 'SGK Khoa học tự nhiên 9 (Kết nối tri thức)',
      chapter: 'Chương II: Ánh sáng',
      lesson: 'Bài 10: Kính lúp. Bài tập thấu kính (trang 50–52)',
      figureRef: 'Hình 10.1, Hình 10.3, Hình 10.4',
      standardFunction:
        'Tạo ảnh ảo cùng chiều, lớn hơn vật khi đặt vật nhỏ trong khoảng từ quang tâm O đến tiêu điểm chính F (d < f), giúp tăng góc trông ảnh của vật.',
      usageGuidelines:
        'Đặt kính lúp sát mặt vật mẫu rồi từ từ dịch chuyển kính ra xa (trong khoảng d ≤ 5 cm) cho tới khi nhìn thấy ảnh ảo rõ nét nhất.',
    },
    assetVersion: '1.0.0',
    manifestSchemaVersion: '1.0.0',
    moduleApiVersion: '1.0.0',
    geometry: {
      modelFormat: 'PROCEDURAL_PBR',
      modelUri: 'procedural://openlab3d/magnifying-glass@1.0.0',
      modelFileVersion: '1.0.0',
      proceduralArchetype: 'magnifying-glass',
      upAxis: 'Y',
      anchor: 'base-center',
      boundingBoxM: { width: 0.085, height: 0.165, depth: 0.072 },
      dimensions: {
        height: { value: 165, unit: 'mm', status: 'verified' },
        widthOrDiameter: { value: 80, unit: 'mm', status: 'verified' },
      },
      triangleCount: 1580,
      materialCount: 4,
      namedNodes: [
        { nodeName: 'root', role: 'root', description: 'Tâm chân đế kính lúp' },
        { nodeName: 'body', role: 'body', description: 'Tay cầm và vành khung bảo vệ 5x' },
        { nodeName: 'lens_element', role: 'lens_element', description: 'Thấu kính hội tụ hai mặt lồi f = 50 mm' },
      ],
      scaleValidation: 'verified',
    },
    scientificProperties: {
      material: { value: 'Thuỷ tinh quang học Crown & Vành hợp kim sơn tĩnh điện', status: 'verified' },
      focalLength: { value: 50, unit: 'mm', status: 'verified' },
      referenceMass: { value: 145, unit: 'g', status: 'verified' },
    },
    measurementMetadata: {
      isMeasuringInstrument: true,
      measuredQuantity: 'magnification',
      rangeMin: { value: 5, unit: 'x (Bội giác G)', status: 'verified' },
      rangeMax: { value: 5, unit: 'x (Bội giác G)', status: 'verified' },
    },
    capabilities: [
      { id: 'selectable', state: 'implemented' },
      { id: 'translatable', state: 'implemented' },
      { id: 'rotatable', state: 'implemented' },
      { id: 'opticalFocus', state: 'implemented' },
    ],
    behaviorIds: ['bhv-core-spatial'],
    validation: {
      assetReviewStatus: 'published',
      geometryStatus: 'verified',
      metrologyStatus: 'verified',
      behaviorStatus: 'implemented',
      safetyStatus: 'reviewed',
    },
    provenance: {
      createdBy: 'Tổ Vật lí & Sinh học THCS',
      authorRole: 'Giáo viên KHTN 9',
      organization: 'OpenLab Vietnam',
      sourceType: 'manufacturer-spec',
      createdAt: '2026-10-03',
      updatedAt: '2026-10-28',
      license: 'CC BY-NC-SA 4.0',
      redistributionAllowed: true,
    },
  },
  {
    assetId: 'OL3D-EQP-GLV-0001',
    slug: 'center-zero-galvanometer',
    name: {
      vi: 'Điện kế nhạy vạch 0 ở giữa — Galvanometer (SGK KHTN 9)',
      en: 'Center-Zero Sensitive Galvanometer (G)',
    },
    kind: 'equipment',
    subject: 'physics',
    category: 'electrical-equipment',
    categoryIds: ['electrical-equipment'],
    tags: ['điện kế', 'cảm ứng điện từ', 'vạch 0 ở giữa', 'dòng điện cảm ứng', 'bài 1', 'bài 14'],
    summary:
      'Điện kế từ điện có vạch số 0 nằm ở chính giữa thang đo (-50 đến +50 μA) và 3 chốt cắm (-), (G0), (G1). Dùng để phát hiện sự xuất hiện và chiều của dòng điện cảm ứng.',
    textbookRef: {
      bookTitle: 'SGK Khoa học tự nhiên 9 (Kết nối tri thức)',
      chapter: 'Mở đầu & Chương IV: Điện từ',
      lesson: 'Bài 1 (trang 7) & Bài 14: Cảm ứng điện từ (trang 67–69)',
      figureRef: 'Hình 1.4 (Điện kế), Hình 14.1, Hình 14.3',
      standardFunction:
        'Phát hiện dòng điện cảm ứng nhỏ và xác định chiều dòng điện: Khi dòng điện đi vào chốt G0 (hoặc G1) và đi ra từ chốt âm (-) thì kim lệch sang phải; khi đi vào chốt âm (-) và đi ra từ chốt G0 thì kim lệch sang trái.',
      usageGuidelines:
        'Nối hai đầu cuộn dây dẫn kín vào chốt (-) và chốt (G0) của điện kế. Quan sát độ lệch của kim khi đưa thanh nam châm lại gần hoặc ra xa cuộn dây.',
    },
    assetVersion: '1.1.0',
    manifestSchemaVersion: '1.0.0',
    moduleApiVersion: '1.0.0',
    geometry: {
      modelFormat: 'PROCEDURAL_PBR',
      modelUri: 'procedural://openlab3d/galvanometer@1.1.0',
      modelFileVersion: '1.1.0',
      proceduralArchetype: 'galvanometer',
      upAxis: 'Y',
      anchor: 'base-center',
      boundingBoxM: { width: 0.11, height: 0.145, depth: 0.095 },
      dimensions: {
        height: { value: 145, unit: 'mm', status: 'verified' },
        widthOrDiameter: { value: 110, unit: 'mm', status: 'verified' },
        depth: { value: 95, unit: 'mm', status: 'verified' },
      },
      triangleCount: 1920,
      materialCount: 5,
      namedNodes: [
        { nodeName: 'root', role: 'root', description: 'Tâm chân đế điện kế' },
        { nodeName: 'body', role: 'body', description: 'Vỏ đồng hồ và 3 chốt nối (-, G0, G1)' },
        { nodeName: 'scale_marks', role: 'scale_marks', description: 'Mặt chia độ vạch 0 ở giữa (-50..0..+50)' },
        { nodeName: 'plunger', role: 'plunger', description: 'Kim chỉ thị lệch trái/phải theo chiều dòng cảm ứng' },
      ],
      scaleValidation: 'verified',
    },
    scientificProperties: {
      material: { value: 'Nhựa kỹ thuật ABS, Khung dây từ điện & Mặt kính Acrylic', status: 'verified' },
      referenceMass: { value: 290, unit: 'g', status: 'verified' },
    },
    measurementMetadata: {
      isMeasuringInstrument: true,
      measuredQuantity: 'electric-current',
      rangeMin: { value: -50, unit: 'μA', status: 'verified' },
      rangeMax: { value: 50, unit: 'μA', status: 'verified' },
      leastCount: { value: 5, unit: 'μA', status: 'verified' },
      zeroOffsetSupported: true,
    },
    capabilities: [
      { id: 'selectable', state: 'implemented' },
      { id: 'translatable', state: 'implemented' },
      { id: 'rotatable', state: 'implemented' },
      { id: 'readScale', state: 'implemented' },
    ],
    behaviorIds: ['bhv-core-spatial'],
    validation: {
      assetReviewStatus: 'published',
      geometryStatus: 'verified',
      metrologyStatus: 'verified',
      behaviorStatus: 'implemented',
      safetyStatus: 'reviewed',
    },
    provenance: {
      createdBy: 'Tổ Vật lí & Điện từ THCS',
      authorRole: 'Giáo viên KHTN 9',
      organization: 'OpenLab Vietnam',
      sourceType: 'manufacturer-spec',
      createdAt: '2026-10-03',
      updatedAt: '2026-10-28',
      license: 'CC BY-NC-SA 4.0',
      redistributionAllowed: true,
    },
  },
  {
    assetId: 'OL3D-EQP-COIL-0001',
    slug: 'induction-coil-2led-magnet',
    name: {
      vi: 'Cuộn dây dẫn kín có 2 đèn LED & Thanh nam châm (SGK KHTN 9)',
      en: 'Closed Induction Coil with 2 Anti-Parallel LEDs & Bar Magnet',
    },
    kind: 'equipment',
    subject: 'physics',
    category: 'electrical-equipment',
    categoryIds: ['electrical-equipment'],
    tags: ['cuộn dây dẫn', 'hai đèn led', 'nam châm vĩnh cửu', 'cảm ứng điện từ', 'xoay chiều', 'bài 1', 'bài 14'],
    summary:
      'Cuộn dây dẫn cảm ứng nối với 2 đèn LED đỏ và vàng/xanh mắc song song ngược cực, đặt cùng thanh nam châm vĩnh cửu (N–S). Dùng để phát hiện dòng điện cảm ứng và sự luân phiên đổi chiều dòng điện.',
    textbookRef: {
      bookTitle: 'SGK Khoa học tự nhiên 9 (Kết nối tri thức)',
      chapter: 'Mở đầu & Chương IV: Điện từ',
      lesson: 'Bài 1 (trang 7) & Bài 14: Cảm ứng điện từ. Nguyên tắc tạo ra dòng điện xoay chiều (trang 69–71)',
      figureRef: 'Hình 1.6 (Cuộn dây dẫn kín có hai đèn LED), Hình 14.4, Hình 14.5',
      standardFunction:
        'Phát hiện dòng điện cảm ứng và chiều dòng điện: Khi số đường sức từ xuyên qua tiết diện cuộn dây tăng thì đèn LED 1 sáng; khi số đường sức từ giảm thì dòng điện cảm ứng đổi chiều làm đèn LED 2 sáng.',
      usageGuidelines:
        'Dịch chuyển cực Bắc (N) của thanh nam châm lại gần hoặc ra xa cuộn dây (hoặc quay thanh nam châm) và quan sát hai đèn LED luân phiên phát sáng.',
    },
    assetVersion: '1.1.0',
    manifestSchemaVersion: '1.0.0',
    moduleApiVersion: '1.0.0',
    geometry: {
      modelFormat: 'PROCEDURAL_PBR',
      modelUri: 'procedural://openlab3d/induction-coil-led@1.1.0',
      modelFileVersion: '1.1.0',
      proceduralArchetype: 'induction-coil-led',
      upAxis: 'Y',
      anchor: 'base-center',
      boundingBoxM: { width: 0.18, height: 0.095, depth: 0.11 },
      dimensions: {
        height: { value: 95, unit: 'mm', status: 'verified' },
        widthOrDiameter: { value: 180, unit: 'mm', status: 'verified' },
        depth: { value: 110, unit: 'mm', status: 'verified' },
      },
      triangleCount: 2240,
      materialCount: 6,
      namedNodes: [
        { nodeName: 'root', role: 'root', description: 'Tâm đế gỗ bộ thí nghiệm cảm ứng điện từ' },
        { nodeName: 'body', role: 'body', description: 'Cuộn dây đồng cảm ứng trên khung nhựa trong suốt' },
        { nodeName: 'plunger', role: 'plunger', description: 'Thanh nam châm vĩnh cửu hai cực N (đỏ) – S (xanh)' },
      ],
      scaleValidation: 'verified',
    },
    scientificProperties: {
      material: { value: 'Dây đồng tráng men, Nam châm AlNiCo & Đế gỗ tự nhiên', status: 'verified' },
      referenceMass: { value: 420, unit: 'g', status: 'verified' },
    },
    measurementMetadata: {
      isMeasuringInstrument: false,
      measuredQuantity: 'electric-current',
    },
    capabilities: [
      { id: 'selectable', state: 'implemented' },
      { id: 'translatable', state: 'implemented' },
      { id: 'rotatable', state: 'implemented' },
      { id: 'readScale', state: 'implemented' },
    ],
    behaviorIds: ['bhv-core-spatial'],
    validation: {
      assetReviewStatus: 'published',
      geometryStatus: 'verified',
      metrologyStatus: 'verified',
      behaviorStatus: 'implemented',
      safetyStatus: 'reviewed',
    },
    provenance: {
      createdBy: 'Tổ Vật lí & Điện từ THCS',
      authorRole: 'Giáo viên KHTN 9',
      organization: 'OpenLab Vietnam',
      sourceType: 'manufacturer-spec',
      createdAt: '2026-10-04',
      updatedAt: '2026-10-28',
      license: 'CC BY-NC-SA 4.0',
      redistributionAllowed: true,
    },
  },
  {
    assetId: 'OL3D-EQP-SEP-0001',
    slug: 'separatory-funnel-stand',
    name: {
      vi: 'Phễu chiết có khoá & Phễu lọc trên giá đỡ (SGK KHTN 9)',
      en: 'Glass Separatory Funnel on Ring Stand',
    },
    kind: 'equipment',
    subject: 'chemistry',
    category: 'chemical-apparatus',
    categoryIds: ['chemical-apparatus', 'laboratory-glassware'],
    tags: ['phễu chiết', 'phễu lọc', 'tách chất', 'hấp phụ than gỗ', 'ester', 'bài 1', 'bài 21', 'bài 27'],
    summary:
      'Phễu chiết thuỷ tinh Borosilicate có khoá vòi gắn trên giá sắt dùng để tách các chất lỏng không tan vào nhau (phương pháp chiết) hoặc lọc dung dịch qua lớp bột than hoạt tính.',
    textbookRef: {
      bookTitle: 'SGK Khoa học tự nhiên 9 (Kết nối tri thức)',
      chapter: 'Mở đầu, Chương VI & Chương VIII',
      lesson: 'Bài 1 (trang 8), Bài 21 (Hình 21.1 - Hấp phụ màu bằng than gỗ), Bài 27 (Phản ứng ester hoá)',
      figureRef: 'Hình 1.8a (Phễu lọc), Hình 1.8b (Phễu chiết), Hình 21.1',
      standardFunction:
        'Phễu thường dùng để rót chất lỏng hoặc lọc/hấp phụ chất màu qua lớp bông và bột than gỗ; Phễu chiết dùng để tách hai chất lỏng phân lớp không hoà tan vào nhau theo phương pháp chiết.',
      usageGuidelines:
        'Để yên hỗn hợp trong phễu chiết cho đến khi phân thành hai lớp rõ rệt, sau đó mở nhẹ khoá vòi để xả riêng lớp chất lỏng phía dưới vào cốc.',
    },
    assetVersion: '1.0.0',
    manifestSchemaVersion: '1.0.0',
    moduleApiVersion: '1.0.0',
    geometry: {
      modelFormat: 'PROCEDURAL_PBR',
      modelUri: 'procedural://openlab3d/separatory-funnel@1.0.0',
      modelFileVersion: '1.0.0',
      proceduralArchetype: 'separatory-funnel',
      upAxis: 'Y',
      anchor: 'base-center',
      boundingBoxM: { width: 0.11, height: 0.27, depth: 0.13 },
      dimensions: {
        height: { value: 270, unit: 'mm', status: 'verified' },
        widthOrDiameter: { value: 110, unit: 'mm', status: 'verified' },
      },
      triangleCount: 2320,
      materialCount: 5,
      namedNodes: [
        { nodeName: 'root', role: 'root', description: 'Tâm chân đế giá đỡ phễu chiết' },
        { nodeName: 'body', role: 'body', description: 'Giá đỡ vòng kiềng và bầu phễu chiết thuỷ tinh' },
        { nodeName: 'handle', role: 'handle', description: 'Khoá vòi PTFE điều chỉnh dòng chảy' },
        { nodeName: 'liquid_surface', role: 'liquid_surface', description: 'Hai tầng chất lỏng phân lớp (ester/dầu và nước)' },
      ],
      scaleValidation: 'verified',
    },
    scientificProperties: {
      material: { value: 'Thuỷ tinh Borosilicate 3.3, Khoá PTFE & Giá thép sơn tĩnh điện', status: 'verified' },
      capacity: { value: 125, unit: 'ml', status: 'verified' },
      referenceMass: { value: 490, unit: 'g', status: 'verified' },
    },
    measurementMetadata: {
      isMeasuringInstrument: false,
      measuredQuantity: 'volume',
    },
    capabilities: [
      { id: 'selectable', state: 'implemented' },
      { id: 'translatable', state: 'implemented' },
      { id: 'rotatable', state: 'implemented' },
      { id: 'readScale', state: 'implemented' },
    ],
    behaviorIds: ['bhv-core-spatial'],
    validation: {
      assetReviewStatus: 'published',
      geometryStatus: 'verified',
      metrologyStatus: 'verified',
      behaviorStatus: 'implemented',
      safetyStatus: 'reviewed',
    },
    provenance: {
      createdBy: 'Tổ Hóa học & KHTN 9',
      authorRole: 'Giáo viên KHTN 9',
      organization: 'OpenLab Vietnam',
      sourceType: 'manufacturer-spec',
      createdAt: '2026-10-04',
      updatedAt: '2026-10-28',
      license: 'CC BY-NC-SA 4.0',
      redistributionAllowed: true,
    },
  },
  {
    assetId: 'OL3D-EQP-MIC-0001',
    slug: 'optical-microscope-chromosome-slide',
    name: {
      vi: 'Kính hiển vi quang học (10x, 40x, 100x) & Tiêu bản NST (SGK KHTN 9)',
      en: 'Compound Optical Microscope & Fixed Chromosome Slide',
    },
    kind: 'equipment',
    subject: 'biology',
    category: 'biology-microscopy',
    categoryIds: ['biology-microscopy', 'optical-equipment'],
    tags: ['kính hiển vi', 'tiêu bản cố định nst', 'nhiễm sắc thể', 'dầu soi kính hiển vi', 'bài 1', 'bài 42'],
    summary:
      'Kính hiển vi quang học có 3 vật kính (10x, 40x, 100x nhúng dầu) kèm tiêu bản cố định Nhiễm sắc thể (NST) đặt trên bàn kính. Dùng trong Bài 42: Thực hành quan sát tiêu bản nhiễm sắc thể.',
    textbookRef: {
      bookTitle: 'SGK Khoa học tự nhiên 9 (Kết nối tri thức)',
      chapter: 'Mở đầu & Chương XII: Di truyền Nhiễm sắc thể',
      lesson: 'Bài 1 (trang 8: Hình 1.11) & Bài 42: Nhiễm sắc thể và bộ nhiễm sắc thể (trang 184–185: Hình 42.6)',
      figureRef: 'Hình 1.11 (Hộp tiêu bản cố định NST), Hình 42.6 (Các bước quan sát tiêu bản NST dưới kính hiển vi)',
      standardFunction:
        'Quan sát hình dạng (hình que, chữ V, chữ X, hạt) và đếm số lượng nhiễm sắc thể ở kì giữa phân bào trên tiêu bản cố định tế bào.',
      usageGuidelines:
        'Bước 1: Chọn vật kính 10x tìm vùng tế bào phân chia. Bước 2: Chuyển sang vật kính 40x. Bước 3: Nhỏ 1 giọt dầu soi kính hiển vi và xoay sang vật kính 100x để quan sát rõ NST.',
      safetyNote: 'Sau khi dùng vật kính 100x phải lau sạch dầu soi bằng giấy mềm thấm cồn 70°.',
    },
    assetVersion: '1.1.0',
    manifestSchemaVersion: '1.0.0',
    moduleApiVersion: '1.0.0',
    geometry: {
      modelFormat: 'PROCEDURAL_PBR',
      modelUri: 'procedural://openlab3d/optical-microscope@1.1.0',
      modelFileVersion: '1.1.0',
      proceduralArchetype: 'optical-microscope',
      upAxis: 'Y',
      anchor: 'base-center',
      boundingBoxM: { width: 0.11, height: 0.245, depth: 0.145 },
      dimensions: {
        height: { value: 245, unit: 'mm', status: 'verified' },
        widthOrDiameter: { value: 110, unit: 'mm', status: 'verified' },
        depth: { value: 145, unit: 'mm', status: 'verified' },
      },
      triangleCount: 2860,
      materialCount: 6,
      namedNodes: [
        { nodeName: 'root', role: 'root', description: 'Tâm chân đế kính hiển vi' },
        { nodeName: 'body', role: 'body', description: 'Thân kính, bàn kính kẹp tiêu bản NST và thị kính' },
        { nodeName: 'plunger', role: 'plunger', description: 'Mâm xoay 3 vật kính 10x, 40x, 100x' },
      ],
      scaleValidation: 'verified',
    },
    scientificProperties: {
      material: { value: 'Hợp kim nhôm đúc sơn tĩnh điện & Hệ thấu kính tiêu sắc', status: 'verified' },
      referenceMass: { value: 1450, unit: 'g', status: 'verified' },
    },
    measurementMetadata: {
      isMeasuringInstrument: true,
      measuredQuantity: 'magnification',
      rangeMin: { value: 100, unit: 'x (Độ phóng đại)', status: 'verified' },
      rangeMax: { value: 1000, unit: 'x (Độ phóng đại)', status: 'verified' },
    },
    capabilities: [
      { id: 'selectable', state: 'implemented' },
      { id: 'translatable', state: 'implemented' },
      { id: 'rotatable', state: 'implemented' },
      { id: 'opticalFocus', state: 'implemented' },
    ],
    behaviorIds: ['bhv-core-spatial'],
    validation: {
      assetReviewStatus: 'published',
      geometryStatus: 'verified',
      metrologyStatus: 'verified',
      behaviorStatus: 'implemented',
      safetyStatus: 'reviewed',
    },
    provenance: {
      createdBy: 'Tổ Sinh học & Di truyền THCS',
      authorRole: 'Giáo viên KHTN 9',
      organization: 'OpenLab Vietnam',
      sourceType: 'manufacturer-spec',
      createdAt: '2026-10-05',
      updatedAt: '2026-10-28',
      license: 'CC BY-NC-SA 4.0',
      redistributionAllowed: true,
    },
  },
  {
    assetId: 'OL3D-EQP-DNA-0001',
    slug: 'dna-double-helix-model',
    name: {
      vi: 'Mô hình cấu trúc phân tử DNA xoắn kép (SGK KHTN 9)',
      en: 'Watson-Crick DNA Double Helix Structural Model',
    },
    kind: 'equipment',
    subject: 'biology',
    category: 'biology-microscopy',
    categoryIds: ['biology-microscopy'],
    tags: ['dna', 'nucleic acid', 'gene', 'xoắn kép', 'ntbs', 'bài 38'],
    summary:
      'Mô hình không gian phân tử DNA xoắn kép gồm hai mạch polynucleotide song song ngược chiều, liên kết bổ sung A–T và G–C (đường kính 20 Å, chu kì xoắn 34 Å).',
    textbookRef: {
      bookTitle: 'SGK Khoa học tự nhiên 9 (Kết nối tri thức)',
      chapter: 'Chương XI: Di truyền học Mendel. Cơ sở phân tử của hiện tượng di truyền',
      lesson: 'Bài 38: Nucleic acid và gene (trang 166–167)',
      figureRef: 'Hình 38.1 (Mô hình cấu trúc một đoạn phân tử DNA)',
      standardFunction:
        'Trực quan hoá cấu trúc xoắn kép của phân tử DNA và nguyên tắc bổ sung giữa các nucleotide (A liên kết với T bằng 2 liên kết hydrogen; G liên kết với C bằng 3 liên kết hydrogen).',
      usageGuidelines:
        'Xoay mô hình 3D để quan sát chiều xoắn từ trái sang phải (xoắn phải), đếm 10 cặp nucleotide trong một chu kì xoắn (34 Å).',
    },
    assetVersion: '1.0.0',
    manifestSchemaVersion: '1.0.0',
    moduleApiVersion: '1.0.0',
    geometry: {
      modelFormat: 'PROCEDURAL_PBR',
      modelUri: 'procedural://openlab3d/dna-double-helix@1.0.0',
      modelFileVersion: '1.0.0',
      proceduralArchetype: 'dna-double-helix',
      upAxis: 'Y',
      anchor: 'base-center',
      boundingBoxM: { width: 0.105, height: 0.25, depth: 0.105 },
      dimensions: {
        height: { value: 250, unit: 'mm', status: 'verified' },
        widthOrDiameter: { value: 105, unit: 'mm', status: 'verified' },
      },
      triangleCount: 3120,
      materialCount: 7,
      namedNodes: [
        { nodeName: 'root', role: 'root', description: 'Tâm chân đế mô hình DNA' },
        { nodeName: 'body', role: 'body', description: 'Đế tròn và trục tâm mô hình' },
        { nodeName: 'handle', role: 'handle', description: 'Hai mạch xoắn kép và các cặp base A-T, G-C' },
      ],
      scaleValidation: 'verified',
    },
    scientificProperties: {
      material: { value: 'Nhựa ABS màu chuẩn hóa các gốc Base (A, T, G, C)', status: 'verified' },
      referenceMass: { value: 260, unit: 'g', status: 'verified' },
    },
    measurementMetadata: {
      isMeasuringInstrument: false,
      measuredQuantity: 'none',
    },
    capabilities: [
      { id: 'selectable', state: 'implemented' },
      { id: 'translatable', state: 'implemented' },
      { id: 'rotatable', state: 'implemented' },
      { id: 'showDimensions', state: 'implemented' },
    ],
    behaviorIds: ['bhv-core-spatial'],
    validation: {
      assetReviewStatus: 'published',
      geometryStatus: 'verified',
      metrologyStatus: 'verified',
      behaviorStatus: 'implemented',
      safetyStatus: 'reviewed',
    },
    provenance: {
      createdBy: 'Tổ Sinh học & Di truyền THCS',
      authorRole: 'Giáo viên KHTN 9',
      organization: 'OpenLab Vietnam',
      sourceType: 'manufacturer-spec',
      createdAt: '2026-10-05',
      updatedAt: '2026-10-28',
      license: 'CC BY-NC-SA 4.0',
      redistributionAllowed: true,
    },
  },
  {
    assetId: 'OL3D-EQP-WDP-1000',
    slug: 'volumetric-water-dispenser-1000ml',
    name: {
      vi: 'Bình chứa nước có van xả định lượng 1000 ml',
      en: 'Volumetric Water Dispenser Carboy with Metering Valve (1000 ml)',
    },
    kind: 'equipment',
    subject: 'general-science',
    category: 'volume-measurement',
    categoryIds: ['volume-measurement', 'laboratory-glassware'],
    tags: ['bình chứa nước', 'van lấy nước', 'định lượng ml', 'nước cất', 'water dispenser'],
    summary:
      'Bình chứa nước cất Borosilicate 1000 ml đặt trên giá đỡ 3 chân có van khóa định lượng và màn hình LCD hiển thị thể tích, cho phép nhập chính xác số ml cần mở van xả vào ống đong, cốc thủy tinh hoặc bình tràn.',
    textbookRef: {
      bookTitle: 'SGK Khoa học tự nhiên 8 & 9 (Kết nối tri thức)',
      chapter: 'Mở đầu: Dụng cụ đo thể tích và cấp chất lỏng phòng thí nghiệm',
      lesson: 'Bài 1: Nhận biết một số dụng cụ, hoá chất. Thuyết trình một vấn đề khoa học',
      figureRef: 'Bình cấp nước cất định lượng có van khóa PTFE',
      standardFunction:
        'Chứa nước cất và mở van xả chính xác theo thể tích ml yêu cầu (nhập trực tiếp số ml trên bảng điều khiển van) vào ống đong, cốc chia độ hoặc bình tràn.',
      usageGuidelines:
        'Kéo Ống đong, Cốc thủy tinh hoặc Bình tràn đặt vào khay hứng dưới vòi Bình cấp nước (hoặc chọn dụng cụ trong bảng van) để mở van lấy nước chính xác theo ml.',
    },
    assetVersion: '1.1.0',
    manifestSchemaVersion: '1.0.0',
    moduleApiVersion: '1.0.0',
    geometry: {
      modelFormat: 'PROCEDURAL_PBR',
      modelUri: 'procedural://openlab3d/water-dispenser@1.1.0',
      modelFileVersion: '1.1.0',
      proceduralArchetype: 'water-dispenser',
      upAxis: 'Y',
      anchor: 'base-center',
      boundingBoxM: { width: 0.155, height: 0.435, depth: 0.125 },
      dimensions: {
        height: { value: 435, unit: 'mm', status: 'verified' },
        widthOrDiameter: { value: 116, unit: 'mm', status: 'verified' },
      },
      triangleCount: 2480,
      materialCount: 6,
      namedNodes: [
        { nodeName: 'root', role: 'root', description: 'Tâm chân đế bình chứa nước' },
        { nodeName: 'body', role: 'body', description: 'Thân bình thủy tinh 1000 ml và chân đế inox' },
        { nodeName: 'scale_display', role: 'scale_display', description: 'Màn hình LCD hiển thị thể tích nước còn lại (ml)' },
        { nodeName: 'scale_marks', role: 'scale_marks', description: 'Vạch chia thể tích 100 – 1000 ml' },
        { nodeName: 'liquid_surface', role: 'liquid_surface', description: 'Cột nước cất bên trong bình chứa' },
        { nodeName: 'plunger', role: 'plunger', description: 'Tay vặn van khóa định lượng nước' },
        { nodeName: 'measurement_anchor', role: 'measurement_anchor', description: 'Đầu vòi xả nước định lượng' },
      ],
      scaleValidation: 'verified',
    },
    scientificProperties: {
      material: { value: 'Thủy tinh Borosilicate 3.3 & Chân đế thép không gỉ, van PTFE', status: 'verified' },
      referenceMass: { value: 520, unit: 'g', status: 'verified' },
      capacity: { value: 1000, unit: 'ml', uncertainty: 2.0, uncertaintyUnit: 'ml', status: 'verified' },
    },
    measurementMetadata: {
      isMeasuringInstrument: true,
      measuredQuantity: 'volume',
      rangeMin: { value: 0.5, unit: 'ml', status: 'verified' },
      rangeMax: { value: 1000, unit: 'ml', status: 'verified' },
      leastCount: { value: 0.5, unit: 'ml', status: 'verified' },
      referenceStandard: 'ISO 4796 · TCVN 7153 (Bình cấp nước cất có vòi định lượng)',
    },
    capabilities: [
      { id: 'selectable', state: 'implemented' },
      { id: 'translatable', state: 'implemented' },
      { id: 'rotatable', state: 'implemented' },
      { id: 'readScale', state: 'implemented' },
      { id: 'displacementVolume', state: 'implemented' },
    ],
    behaviorIds: ['bhv-core-spatial', 'bhv-volume-displacement'],
    validation: {
      assetReviewStatus: 'published',
      geometryStatus: 'verified',
      metrologyStatus: 'verified',
      behaviorStatus: 'implemented',
      safetyStatus: 'reviewed',
    },
    provenance: {
      createdBy: 'Tổ Thiết bị Thí nghiệm KHTN',
      authorRole: 'Kỹ sư Thiết bị Trường học',
      organization: 'OpenLab Vietnam',
      sourceType: 'manufacturer-spec',
      createdAt: '2026-10-12',
      updatedAt: '2026-10-28',
      license: 'CC BY-NC-SA 4.0',
      redistributionAllowed: true,
    },
  },
  {
    "assetId": "OL3D-EQP-OPT-0001",
    "slug": "thau-kinh-hoi-tu-f100mm",
    "name": {
      "vi": "(3) Thấu kính trên đế trượt quang học (f = +10 cm)",
      "en": "(3) Optical Lens on Bench Rider Saddle (f = +10 cm)"
    },
    "kind": "equipment",
    "subject": "physics",
    "category": "optical-equipment",
    "categoryIds": [
      "optical-equipment"
    ],
    "tags": [
      "thau-kinh-hoi-tu",
      "thau-kinh-phan-ki",
      "quang-hoc",
      "tieu-cu",
      "gia-quang-hoc",
      "hinh-8.12",
      "khtn-9"
    ],
    "summary": "Chi tiết (3) trong Hình 8.12 SGK KHTN 9: Thấu kính quang học gắn trên con trượt chữ U có kim chỉ vạch đỏ và vít hãm, đặt tại gốc O = 0 cm trên Giá quang học (5). Có thể thay đổi 6 tiêu cự (+5, +10, +15, -10, -20 cm, ∞) từ Hộp thấu kính.",
    "textbookRef": {
      "bookTitle": "SGK Khoa học tự nhiên 9 (Kết nối tri thức)",
      "chapter": "Chương II: Ánh sáng",
      "lesson": "Bài 8: Thấu kính (trang 40–45) & Bài 9: Thực hành đo tiêu cự của thấu kính hội tụ (trang 46–49)",
      "figureRef": "Hình 8.12 — Chi tiết (3): Thấu kính có giá đỡ trượt trên giá quang học",
      "standardFunction": "Khúc xạ chùm tia sáng từ vật sáng hình chữ F (2) để tạo ảnh thật ngược chiều trên màn chắn (4) khi d > f, hoặc tạo ảnh ảo cùng chiều khi d < f / thấu kính phân kì.",
      "usageGuidelines": "Kéo thả thấu kính (3) lắp lên thanh ray Giá quang học (5) tại vạch số 0 cm. Nhấp chọn để đổi tiêu cự (+5 cm, +10 cm, +15 cm, -10 cm, -20 cm, ∞)."
    },
    "assetVersion": "1.2.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/optical-lens@1.2.0",
      "modelFileVersion": "1.2.0",
      "proceduralArchetype": "optical-lens",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": {
        "width": 0.045,
        "height": 0.145,
        "depth": 0.08
      },
      "dimensions": {
        "height": {
          "value": 145,
          "unit": "mm",
          "status": "verified"
        },
        "widthOrDiameter": {
          "value": 70,
          "unit": "mm",
          "status": "verified",
          "notes": "Đường kính thông quang 70 mm, tâm quang học cao 95 mm"
        }
      },
      "triangleCount": 2940,
      "materialCount": 4,
      "namedNodes": [
        {
          "nodeName": "root",
          "role": "root",
          "description": "Tâm đế trượt chữ U trên giá quang học"
        },
        {
          "nodeName": "body",
          "role": "body",
          "description": "Đế trượt kim chỉ vạch, trụ đỡ và vành giữ thấu kính"
        },
        {
          "nodeName": "lens_element",
          "role": "lens_element",
          "description": "Thấu kính quang học N-BK7 (hội tụ / phân kì)"
        },
        {
          "nodeName": "scale_display",
          "role": "scale_marks",
          "description": "Nhãn thông số tiêu cự trên đỉnh vành (+10 cm, -10 cm...)"
        }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": {
        "value": "Thủy tinh quang học N-BK7 (n = 1.5168) & Đế trượt nhôm Anodized",
        "status": "verified"
      },
      "focalLength": {
        "value": 100,
        "unit": "mm",
        "uncertainty": 1,
        "uncertaintyUnit": "mm",
        "status": "verified"
      },
      "referenceMass": {
        "value": 135,
        "unit": "g",
        "status": "verified"
      }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": true,
      "measuredQuantity": "focal-length",
      "rangeMin": {
        "value": -200,
        "unit": "mm",
        "status": "verified"
      },
      "rangeMax": {
        "value": 150,
        "unit": "mm",
        "status": "verified"
      },
      "leastCount": {
        "value": 1,
        "unit": "mm",
        "status": "verified"
      },
      "calibrationMethod": "Phương pháp đối xứng d = d' = 2f trên Giá quang học (Bài 9 SGK KHTN 9): f = (d + d') / 4."
    },
    "capabilities": [
      {
        "id": "selectable",
        "state": "implemented",
        "behaviorModuleId": "bhv-core-spatial"
      },
      {
        "id": "translatable",
        "state": "implemented",
        "behaviorModuleId": "bhv-core-spatial"
      },
      {
        "id": "rotatable",
        "state": "implemented",
        "behaviorModuleId": "bhv-core-spatial"
      },
      {
        "id": "showDimensions",
        "state": "implemented",
        "behaviorModuleId": "bhv-core-spatial"
      },
      {
        "id": "opticalFocus",
        "state": "implemented",
        "behaviorModuleId": "bhv-optical-focal"
      }
    ],
    "behaviorIds": [
      "bhv-core-spatial",
      "bhv-optical-focal"
    ],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Vật lí Quang học",
      "authorRole": "Giáo viên Vật lí",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-09-10",
      "updatedAt": "2026-10-30",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-OBN-0001",
    "slug": "gia-quang-hoc-thuoc-chia-do-90cm",
    "name": {
      "vi": "(5) Giá quang học 90 cm có thước chia độ (-45 .. 0 .. +45 cm)",
      "en": "(5) 90 cm Graduated Aluminum Optical Bench Rail"
    },
    "kind": "equipment",
    "subject": "physics",
    "category": "optical-equipment",
    "categoryIds": [
      "optical-equipment",
      "length-measurement",
      "support-hardware"
    ],
    "tags": [
      "gia-quang-hoc",
      "bang-quang-hoc",
      "thuoc-chia-do",
      "thau-kinh",
      "hinh-8.12",
      "bai-8",
      "bai-9",
      "khtn-9"
    ],
    "summary": "Chi tiết (5) trong Hình 8.12 SGK KHTN 9: Thanh ray hợp kim nhôm dài 90 cm có sống trượt định tâm và thước chia milimét từ -45 cm qua vạch 0 cm (ở chính giữa) đến +45 cm dùng để lắp đồng trục Đèn (1), Vật sáng F (2), Thấu kính (3) và Màn chắn (4).",
    "textbookRef": {
      "bookTitle": "SGK Khoa học tự nhiên 9 (Kết nối tri thức)",
      "chapter": "Chương II: Ánh sáng",
      "lesson": "Bài 8: Thấu kính & Bài 9: Thực hành đo tiêu cự của thấu kính hội tụ",
      "figureRef": "Hình 8.12 — Chi tiết (5): Giá quang học đồng trục có thước đo cm/mm",
      "standardFunction": "Giữ cho tâm Đèn chiếu (1), Vật sáng chữ F (2), Quang tâm Thấu kính (3) và tâm Màn chắn (4) luôn thẳng hàng trên trục chính quang học (y = 9,5 cm) và đo trực tiếp khoảng cách vật d, khoảng cách ảnh d'.",
      "usageGuidelines": "Đặt Giá quang học (5) nằm ngang giữa bàn thí nghiệm, sau đó kéo từng chi tiết (1), (2), (3), (4) thả vào rãnh trượt."
    },
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/optical-bench@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "optical-bench",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": {
        "width": 0.9,
        "height": 0.036,
        "depth": 0.072
      },
      "dimensions": {
        "height": {
          "value": 36,
          "unit": "mm",
          "status": "verified"
        },
        "widthOrDiameter": {
          "value": 900,
          "unit": "mm",
          "status": "verified"
        },
        "depth": {
          "value": 72,
          "unit": "mm",
          "status": "verified"
        }
      },
      "triangleCount": 1680,
      "materialCount": 4,
      "namedNodes": [
        {
          "nodeName": "root",
          "role": "root",
          "description": "Tâm đáy giá quang học tại vạch O = 0 cm"
        },
        {
          "nodeName": "body",
          "role": "body",
          "description": "Thanh ray nhôm 90 cm, thước chia -45..+45 cm và 4 chân chỉnh thăng bằng"
        }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": {
        "value": "Hợp kim nhôm định hình Anodized & Chân đồng thau cân bằng",
        "status": "verified"
      },
      "referenceMass": {
        "value": 920,
        "unit": "g",
        "status": "verified"
      }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": true,
      "measuredQuantity": "length",
      "rangeMin": {
        "value": -450,
        "unit": "mm",
        "status": "verified"
      },
      "rangeMax": {
        "value": 450,
        "unit": "mm",
        "status": "verified"
      },
      "leastCount": {
        "value": 1,
        "unit": "mm",
        "status": "verified"
      }
    },
    "capabilities": [
      {
        "id": "selectable",
        "state": "implemented"
      },
      {
        "id": "translatable",
        "state": "implemented"
      },
      {
        "id": "rotatable",
        "state": "implemented"
      },
      {
        "id": "readScale",
        "state": "implemented"
      }
    ],
    "behaviorIds": [
      "bhv-core-spatial"
    ],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Vật lí & Quang học THCS",
      "authorRole": "Giáo viên KHTN 9",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-10-30",
      "updatedAt": "2026-10-30",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-OLP-0001",
    "slug": "den-chieu-sang-halogen-khe-sang",
    "name": {
      "vi": "(1) Đèn chiếu sáng Halogen kèm Đầu chắn khe sáng",
      "en": "(1) Halogen Optical Lamp with Slit Aperture on Rider"
    },
    "kind": "equipment",
    "subject": "physics",
    "category": "optical-equipment",
    "categoryIds": [
      "optical-equipment"
    ],
    "tags": [
      "den-chieu-sang",
      "nguon-sang",
      "khe-sang",
      "gia-quang-hoc",
      "hinh-8.12",
      "bai-8",
      "bai-9",
      "khtn-9"
    ],
    "summary": "Chi tiết (1) trong Hình 8.12 SGK KHTN 9: Đèn chiếu sáng Halogen 6V–12V có tụ quang và khe chắn sáng (chùm sáng rộng rọi vật F, khe 3 tia song song, hoặc khe 1 tia) gắn trên con trượt Giá quang học.",
    "textbookRef": {
      "bookTitle": "SGK Khoa học tự nhiên 9 (Kết nối tri thức)",
      "chapter": "Chương II: Ánh sáng",
      "lesson": "Bài 8: Thấu kính & Bài 9: Thực hành đo tiêu cự của thấu kính hội tụ",
      "figureRef": "Hình 8.12 — Chi tiết (1): Đèn chiếu sáng trên giá quang học",
      "standardFunction": "Cung cấp chùm sáng song song cường độ cao chiếu sáng đều Vật sáng kính mờ hình chữ F (2) hoặc tạo 3 tia sáng song song khảo sát tiêu điểm thấu kính.",
      "usageGuidelines": "Lắp Đèn (1) ở đầu bên trái Giá quang học (x ≈ -32 cm), nối với Nguồn điện (6) để phát sáng."
    },
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/optical-lamp@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "optical-lamp",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": {
        "width": 0.098,
        "height": 0.125,
        "depth": 0.056
      },
      "dimensions": {
        "height": {
          "value": 125,
          "unit": "mm",
          "status": "verified"
        },
        "widthOrDiameter": {
          "value": 98,
          "unit": "mm",
          "status": "verified"
        }
      },
      "triangleCount": 2120,
      "materialCount": 5,
      "namedNodes": [
        {
          "nodeName": "root",
          "role": "root",
          "description": "Tâm đế trượt đèn chiếu sáng"
        },
        {
          "nodeName": "body",
          "role": "body",
          "description": "Vỏ đèn tản nhiệt, ống tụ quang và khe chắn sáng"
        },
        {
          "nodeName": "scale_display",
          "role": "scale_marks",
          "description": "Mặt khe phát sáng (Chùm rộng / 3 tia / 1 tia)"
        }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": {
        "value": "Hợp kim nhôm sơn tĩnh điện chịu nhiệt & Thấu kính tụ quang",
        "status": "verified"
      },
      "referenceMass": {
        "value": 240,
        "unit": "g",
        "status": "verified"
      }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": false,
      "measuredQuantity": "none"
    },
    "capabilities": [
      {
        "id": "selectable",
        "state": "implemented"
      },
      {
        "id": "translatable",
        "state": "implemented"
      },
      {
        "id": "rotatable",
        "state": "implemented"
      },
      {
        "id": "opticalFocus",
        "state": "implemented"
      }
    ],
    "behaviorIds": [
      "bhv-core-spatial"
    ],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Vật lí & Quang học THCS",
      "authorRole": "Giáo viên KHTN 9",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-10-30",
      "updatedAt": "2026-10-30",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-FOB-0001",
    "slug": "vat-sang-kinh-mo-chu-f",
    "name": {
      "vi": "(2) Vật sáng bằng kính mờ hình chữ F",
      "en": "(2) Frosted Glass Letter-F Luminous Object on Rider"
    },
    "kind": "equipment",
    "subject": "physics",
    "category": "optical-equipment",
    "categoryIds": [
      "optical-equipment"
    ],
    "tags": [
      "vat-sang",
      "chu-f",
      "kinh-mo",
      "gia-quang-hoc",
      "hinh-8.12",
      "bai-8",
      "bai-9",
      "khtn-9"
    ],
    "summary": "Chi tiết (2) trong Hình 8.12 SGK KHTN 9: Bản chắn sáng có khoét khe chữ F bằng kính mờ bán trong suốt gắn trên con trượt có kim chỉ vạch. Khi được Đèn (1) rọi từ phía sau sẽ trở thành vật sáng phẳng AB đặt vuông góc với trục chính.",
    "textbookRef": {
      "bookTitle": "SGK Khoa học tự nhiên 9 (Kết nối tri thức)",
      "chapter": "Chương II: Ánh sáng",
      "lesson": "Bài 8: Thấu kính & Bài 9: Thực hành đo tiêu cự của thấu kính hội tụ",
      "figureRef": "Hình 8.12 — Chi tiết (2): Vật sáng bằng kính mờ hình chữ F",
      "standardFunction": "Đóng vai trò vật sáng phẳng AB có hình dạng bất đối xứng (chữ F) để học sinh dễ dàng so sánh chiều cao, độ rõ nét và tính cùng chiều / ngược chiều của ảnh trên màn chắn (4).",
      "usageGuidelines": "Lắp Vật sáng chữ F (2) trên Giá quang học giữa Đèn (1) và Thấu kính (3). Đọc khoảng cách vật d từ vạch kim chỉ tới gốc O = 0 cm."
    },
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/frosted-f-object@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "frosted-f-object",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": {
        "width": 0.042,
        "height": 0.135,
        "depth": 0.078
      },
      "dimensions": {
        "height": {
          "value": 135,
          "unit": "mm",
          "status": "verified"
        },
        "widthOrDiameter": {
          "value": 76,
          "unit": "mm",
          "status": "verified"
        }
      },
      "triangleCount": 1540,
      "materialCount": 4,
      "namedNodes": [
        {
          "nodeName": "root",
          "role": "root",
          "description": "Tâm đế trượt vật sáng chữ F"
        },
        {
          "nodeName": "body",
          "role": "body",
          "description": "Khung kim loại đen và đế trượt có kim chỉ vạch"
        },
        {
          "nodeName": "scale_display",
          "role": "scale_marks",
          "description": "Đĩa kính mờ khắc chữ F phát sáng"
        }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": {
        "value": "Kính mờ tán xạ ánh sáng & Khung nhôm sơn tĩnh điện đen",
        "status": "verified"
      },
      "referenceMass": {
        "value": 110,
        "unit": "g",
        "status": "verified"
      }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": false,
      "measuredQuantity": "length"
    },
    "capabilities": [
      {
        "id": "selectable",
        "state": "implemented"
      },
      {
        "id": "translatable",
        "state": "implemented"
      },
      {
        "id": "rotatable",
        "state": "implemented"
      },
      {
        "id": "opticalFocus",
        "state": "implemented"
      }
    ],
    "behaviorIds": [
      "bhv-core-spatial"
    ],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Vật lí & Quang học THCS",
      "authorRole": "Giáo viên KHTN 9",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-10-30",
      "updatedAt": "2026-10-30",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-SCR-0001",
    "slug": "man-chan-hung-anh-quang-hoc",
    "name": {
      "vi": "(4) Màn chắn hứng ảnh trên Giá quang học",
      "en": "(4) Matte White Optical Projection Screen on Rider"
    },
    "kind": "equipment",
    "subject": "physics",
    "category": "optical-equipment",
    "categoryIds": [
      "optical-equipment"
    ],
    "tags": [
      "man-chan",
      "man-hung-anh",
      "anh-that",
      "gia-quang-hoc",
      "hinh-8.12",
      "bai-8",
      "bai-9",
      "khtn-9"
    ],
    "summary": "Chi tiết (4) trong Hình 8.12 SGK KHTN 9: Màn chắn phẳng sơn trắng mờ có kẻ lưới milimét gắn trên con trượt Giá quang học. Dùng để dịch chuyển dọc theo thanh ray tìm vị trí ảnh thật chữ F hiện lên rõ nét nhất (đo d').",
    "textbookRef": {
      "bookTitle": "SGK Khoa học tự nhiên 9 (Kết nối tri thức)",
      "chapter": "Chương II: Ánh sáng",
      "lesson": "Bài 8: Thấu kính & Bài 9: Thực hành đo tiêu cự của thấu kính hội tụ",
      "figureRef": "Hình 8.12 — Chi tiết (4): Màn chắn hứng ảnh trên giá quang học",
      "standardFunction": "Hứng ảnh thật của Vật sáng chữ F (2) tạo bởi Thấu kính hội tụ (3). Khi màn chắn đặt đúng vị trí d', ảnh chữ F ngược chiều hiện lên sắc nét; khi lệch khỏi d', ảnh sẽ bị nhòe mờ.",
      "usageGuidelines": "Kéo trượt Màn chắn (4) ở phía bên phải Thấu kính (x > 0) cho tới khi hình chữ F ngược chiều đạt độ nét cao nhất, rồi đọc khoảng cách d' trên thước."
    },
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/optical-screen@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "optical-screen",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": {
        "width": 0.042,
        "height": 0.148,
        "depth": 0.106
      },
      "dimensions": {
        "height": {
          "value": 148,
          "unit": "mm",
          "status": "verified"
        },
        "widthOrDiameter": {
          "value": 106,
          "unit": "mm",
          "status": "verified"
        }
      },
      "triangleCount": 1580,
      "materialCount": 4,
      "namedNodes": [
        {
          "nodeName": "root",
          "role": "root",
          "description": "Tâm đế trượt màn chắn"
        },
        {
          "nodeName": "body",
          "role": "body",
          "description": "Tấm nền nhôm đen và đế trượt có kim chỉ vạch"
        },
        {
          "nodeName": "scale_display",
          "role": "scale_marks",
          "description": "Bề mặt màn chắn trắng mờ hiển thị ảnh thật chữ F theo thời gian thực"
        }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": {
        "value": "Nhôm phẳng phủ sơn trắng mờ khuếch tán (Matte White Diffuser)",
        "status": "verified"
      },
      "referenceMass": {
        "value": 125,
        "unit": "g",
        "status": "verified"
      }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": true,
      "measuredQuantity": "length",
      "rangeMin": {
        "value": 0,
        "unit": "mm",
        "status": "verified"
      },
      "rangeMax": {
        "value": 450,
        "unit": "mm",
        "status": "verified"
      },
      "leastCount": {
        "value": 1,
        "unit": "mm",
        "status": "verified"
      }
    },
    "capabilities": [
      {
        "id": "selectable",
        "state": "implemented"
      },
      {
        "id": "translatable",
        "state": "implemented"
      },
      {
        "id": "rotatable",
        "state": "implemented"
      },
      {
        "id": "opticalFocus",
        "state": "implemented"
      }
    ],
    "behaviorIds": [
      "bhv-core-spatial"
    ],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Vật lí & Quang học THCS",
      "authorRole": "Giáo viên KHTN 9",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-10-30",
      "updatedAt": "2026-10-30",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-PSU-0001",
    "slug": "nguon-dien-ha-ap-thi-nghiem-12v",
    "name": {
      "vi": "(6) Nguồn điện hạ áp thí nghiệm 3V–12V",
      "en": "(6) Low-Voltage Lab Power Supply (DC 3V–12V)"
    },
    "kind": "equipment",
    "subject": "physics",
    "category": "optical-equipment",
    "categoryIds": [
      "optical-equipment",
      "electrical-equipment"
    ],
    "tags": [
      "nguon-dien",
      "bien-ap-ha-the",
      "cap-dien-den",
      "hinh-8.12",
      "bai-8",
      "bai-9",
      "khtn-9"
    ],
    "summary": "Chi tiết (6) trong Hình 8.12 SGK KHTN 9: Biến áp nguồn hạ áp một chiều (DC 3V–12V) có công tắc BẬT/TẮT phát sáng trên nóc, núm xoay chọn điện áp và cặp chốt cắm Đỏ (+) / Xanh (-) cấp điện cho Đèn chiếu sáng (1).",
    "textbookRef": {
      "bookTitle": "SGK Khoa học tự nhiên 9 (Kết nối tri thức)",
      "chapter": "Chương II: Ánh sáng",
      "lesson": "Bài 8: Thấu kính & Bài 9: Thực hành đo tiêu cự của thấu kính hội tụ",
      "figureRef": "Hình 8.12 — Chi tiết (6): Nguồn điện cấp cho đèn chiếu sáng",
      "standardFunction": "Cung cấp điện áp một chiều an toàn (6V–12V) cho Đèn chiếu sáng Halogen (1) hoạt động ổn định.",
      "usageGuidelines": "Đặt Nguồn điện (6) cạnh đầu trái của Giá quang học (5). Nhấn công tắc trên nóc nguồn điện để bật/tắt Đèn chiếu sáng (1).",
      "safetyNote": "Sử dụng điện áp định mức 6V–12V phù hợp với bóng đèn chiếu sáng thí nghiệm."
    },
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/optical-power-supply@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "optical-power-supply",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": {
        "width": 0.135,
        "height": 0.088,
        "depth": 0.115
      },
      "dimensions": {
        "height": {
          "value": 88,
          "unit": "mm",
          "status": "verified"
        },
        "widthOrDiameter": {
          "value": 135,
          "unit": "mm",
          "status": "verified"
        },
        "depth": {
          "value": 115,
          "unit": "mm",
          "status": "verified"
        }
      },
      "triangleCount": 1740,
      "materialCount": 6,
      "namedNodes": [
        {
          "nodeName": "root",
          "role": "root",
          "description": "Tâm đáy hộp nguồn điện"
        },
        {
          "nodeName": "body",
          "role": "body",
          "description": "Vỏ thép sơn tĩnh điện và 2 chốt cắm Đỏ (+), Xanh (-)"
        },
        {
          "nodeName": "plunger",
          "role": "plunger",
          "description": "Công tắc nguồn BẬT/TẮT phát sáng trên mặt nóc"
        },
        {
          "nodeName": "handle",
          "role": "handle",
          "description": "Núm xoay chỉnh điện áp 3V–12V"
        },
        {
          "nodeName": "scale_display",
          "role": "scale_marks",
          "description": "Mặt điều khiển và đồng hồ LED hiển thị điện áp"
        }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": {
        "value": "Vỏ thép sơn tĩnh điện cách điện & Biến áp hạ thế an toàn",
        "status": "verified"
      },
      "referenceMass": {
        "value": 680,
        "unit": "g",
        "status": "verified"
      }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": false,
      "measuredQuantity": "voltage-resistance",
      "rangeMin": {
        "value": 3,
        "unit": "V",
        "status": "verified"
      },
      "rangeMax": {
        "value": 12,
        "unit": "V",
        "status": "verified"
      }
    },
    "capabilities": [
      {
        "id": "selectable",
        "state": "implemented"
      },
      {
        "id": "translatable",
        "state": "implemented"
      },
      {
        "id": "rotatable",
        "state": "implemented"
      }
    ],
    "behaviorIds": [
      "bhv-core-spatial"
    ],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Vật lí & Quang học THCS",
      "authorRole": "Giáo viên KHTN 9",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-10-30",
      "updatedAt": "2026-10-30",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-LBX-0001",
    "slug": "hop-bo-6-thau-kinh-quang-hoc",
    "name": {
      "vi": "Hộp bộ 6 Thấu kính tiêu chuẩn (+5, +10, +15, -10, -20, ∞)",
      "en": "Wooden Storage Box of 6 Standard Optical Lenses"
    },
    "kind": "equipment",
    "subject": "physics",
    "category": "optical-equipment",
    "categoryIds": [
      "optical-equipment"
    ],
    "tags": [
      "hop-thau-kinh",
      "bo-thau-kinh",
      "thau-kinh-hoi-tu",
      "thau-kinh-phan-ki",
      "bai-8",
      "bai-9",
      "khtn-9"
    ],
    "summary": "Hộp gỗ lót nhung bảo quản bộ 6 thấu kính thí nghiệm có gắn thẻ tiêu cự trên đỉnh vành: 3 thấu kính hội tụ (+5 cm, +10 cm, +15 cm), 2 thấu kính phân kì (-10 cm, -20 cm) và 1 bản mặt song song (∞).",
    "textbookRef": {
      "bookTitle": "SGK Khoa học tự nhiên 9 (Kết nối tri thức)",
      "chapter": "Chương II: Ánh sáng",
      "lesson": "Bài 8: Thấu kính & Bài 9: Thực hành đo tiêu cự của thấu kính hội tụ",
      "figureRef": "Hình 8.2, Hình 8.3 & Hình 8.12",
      "standardFunction": "Cung cấp đầy đủ các thấu kính hội tụ (rìa mỏng) và thấu kính phân kì (rìa dày) với tiêu cự khác nhau để học sinh thay thế nhanh vào Giá đỡ thấu kính (3) trên Giá quang học.",
      "usageGuidelines": "Nhấp chọn Hộp thấu kính hoặc Thấu kính (3) để lấy/đổi thấu kính (+5 cm, +10 cm, +15 cm, -10 cm, -20 cm, ∞) lắp lên Giá quang học."
    },
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/optical-lens-box@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "optical-lens-box",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": {
        "width": 0.24,
        "height": 0.082,
        "depth": 0.088
      },
      "dimensions": {
        "height": {
          "value": 82,
          "unit": "mm",
          "status": "verified"
        },
        "widthOrDiameter": {
          "value": 240,
          "unit": "mm",
          "status": "verified"
        },
        "depth": {
          "value": 88,
          "unit": "mm",
          "status": "verified"
        }
      },
      "triangleCount": 3640,
      "materialCount": 6,
      "namedNodes": [
        {
          "nodeName": "root",
          "role": "root",
          "description": "Tâm đáy hộp gỗ đựng thấu kính"
        },
        {
          "nodeName": "body",
          "role": "body",
          "description": "Khay gỗ lót nhung 6 khe cắm thấu kính kèm nhãn tiêu cự"
        }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": {
        "value": "Hộp gỗ tự nhiên lót nhung chống xước & 6 Thấu kính thủy tinh N-BK7",
        "status": "verified"
      },
      "referenceMass": {
        "value": 540,
        "unit": "g",
        "status": "verified"
      }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": false,
      "measuredQuantity": "focal-length"
    },
    "capabilities": [
      {
        "id": "selectable",
        "state": "implemented"
      },
      {
        "id": "translatable",
        "state": "implemented"
      },
      {
        "id": "rotatable",
        "state": "implemented"
      },
      {
        "id": "opticalFocus",
        "state": "implemented"
      }
    ],
    "behaviorIds": [
      "bhv-core-spatial"
    ],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Vật lí & Quang học THCS",
      "authorRole": "Giáo viên KHTN 9",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-10-30",
      "updatedAt": "2026-10-30",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-LSR-0001",
    "slug": "laser-ray-box-3beam",
    "name": {
      "vi": "Nguồn sáng Đèn Laser 3 tia song song (SGK KHTN 9)",
      "en": "3-Beam Optical Laser Ray Box"
    },
    "kind": "equipment",
    "subject": "physics",
    "category": "optical-equipment",
    "categoryIds": [
      "optical-equipment"
    ],
    "tags": [
      "đèn laser",
      "nguồn sáng",
      "chùm sáng hẹp",
      "khúc xạ",
      "thấu kính",
      "bài 1",
      "bài 5",
      "bài 8"
    ],
    "summary": "Nguồn phát 1 đến 3 tia laser đỏ song song có công tắc điều khiển độc lập từng tia. Dùng để biểu diễn đường truyền của tia sáng qua bản bán trụ, lăng kính và thấu kính hội tụ/phân kì.",
    "textbookRef": {
      "bookTitle": "SGK Khoa học tự nhiên 9 (Kết nối tri thức)",
      "chapter": "Mở đầu & Chương II: Ánh sáng",
      "lesson": "Bài 1 (trang 6), Bài 5, Bài 6, Bài 8, Bài 9",
      "figureRef": "Hình 1.1b (Đèn laser) & Hình 8.3",
      "standardFunction": "Tạo ra chùm sáng hẹp hoặc 3 tia sáng song song đi là là trên mặt bảng để quan sát trực quan đường truyền tia tới, tia khúc xạ, tia phản xạ và tiêu điểm thấu kính.",
      "usageGuidelines": "Bật từng công tắc trên thân đèn để chọn 1 tia (khúc xạ, phản xạ toàn phần) hoặc 3 tia song song (khảo sát tiêu điểm thấu kính).",
      "safetyNote": "Tuyệt đối không để tia laser chiếu trực tiếp vào mắt."
    },
    "assetVersion": "1.1.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/laser-source@1.1.0",
      "modelFileVersion": "1.1.0",
      "proceduralArchetype": "laser-source",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": {
        "width": 0.11,
        "height": 0.04,
        "depth": 0.085
      },
      "dimensions": {
        "height": {
          "value": 40,
          "unit": "mm",
          "status": "verified"
        },
        "widthOrDiameter": {
          "value": 110,
          "unit": "mm",
          "status": "verified"
        },
        "depth": {
          "value": 85,
          "unit": "mm",
          "status": "verified"
        }
      },
      "triangleCount": 1640,
      "materialCount": 4,
      "namedNodes": [
        {
          "nodeName": "root",
          "role": "root",
          "description": "Gốc tọa độ đáy hộp đèn laser"
        },
        {
          "nodeName": "body",
          "role": "body",
          "description": "Thân hộp đèn và 3 công tắc độc lập"
        },
        {
          "nodeName": "laser_beams",
          "role": "scale_marks",
          "description": "Chùm 3 tia laser đỏ song song 650nm"
        }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": {
        "value": "Vỏ nhựa ABS cách điện & Diode Laser bán dẫn 650 nm",
        "status": "verified"
      },
      "referenceMass": {
        "value": 210,
        "unit": "g",
        "status": "reported"
      }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": false,
      "measuredQuantity": "none"
    },
    "capabilities": [
      {
        "id": "selectable",
        "state": "implemented"
      },
      {
        "id": "translatable",
        "state": "implemented"
      },
      {
        "id": "rotatable",
        "state": "implemented"
      },
      {
        "id": "opticalFocus",
        "state": "implemented"
      }
    ],
    "behaviorIds": [
      "bhv-core-spatial"
    ],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Vật lí & Quang học THCS",
      "authorRole": "Giáo viên KHTN 9",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-10-01",
      "updatedAt": "2026-10-28",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-PRM-0001",
    "slug": "equilateral-optical-prism-stand",
    "name": {
      "vi": "Lăng kính tam giác trên giá đỡ — Tán sắc ánh sáng (SGK KHTN 9)",
      "en": "Equilateral Glass Prism on Stand (Dispersion)"
    },
    "kind": "equipment",
    "subject": "physics",
    "category": "optical-equipment",
    "categoryIds": [
      "optical-equipment"
    ],
    "tags": [
      "lăng kính",
      "tán sắc ánh sáng",
      "quang phổ",
      "góc chiết quang",
      "bài 7"
    ],
    "summary": "Khối thuỷ tinh trong suốt hình lăng trụ tam giác đều (góc chiết quang A = 60°) đặt trên bàn xoay có chân đế. Dùng để tách chùm ánh sáng trắng thành dải 7 màu quang phổ từ đỏ đến tím.",
    "textbookRef": {
      "bookTitle": "SGK Khoa học tự nhiên 9 (Kết nối tri thức)",
      "chapter": "Chương II: Ánh sáng",
      "lesson": "Bài 7: Lăng kính (trang 34–38)",
      "figureRef": "Hình 7.1, Hình 7.4, Hình 7.5",
      "standardFunction": "Tạo quang phổ của ánh sáng trắng (tán sắc ánh sáng: đỏ, da cam, vàng, lục, lam, chàm, tím) và khảo sát sự lệch của tia sáng về phía đáy lăng kính.",
      "usageGuidelines": "Chiếu chùm ánh sáng trắng hẹp vào mặt bên AB của lăng kính, xoay nhẹ giá đỡ và hứng dải màu quang phổ trên màn chắn phía sau."
    },
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/optical-prism@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "optical-prism",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": {
        "width": 0.11,
        "height": 0.14,
        "depth": 0.11
      },
      "dimensions": {
        "height": {
          "value": 140,
          "unit": "mm",
          "status": "verified"
        },
        "widthOrDiameter": {
          "value": 92,
          "unit": "mm",
          "status": "verified"
        }
      },
      "triangleCount": 1890,
      "materialCount": 9,
      "namedNodes": [
        {
          "nodeName": "root",
          "role": "root",
          "description": "Tâm chân đế lăng kính"
        },
        {
          "nodeName": "body",
          "role": "body",
          "description": "Giá đỡ và khối lăng kính tam giác đều"
        },
        {
          "nodeName": "dispersion_spectrum",
          "role": "scale_marks",
          "description": "Chùm sáng trắng và 7 dải màu tán sắc"
        }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": {
        "value": "Thuỷ tinh Flint quang học (n = 1,52, góc chiết quang A = 60°)",
        "status": "verified"
      },
      "referenceMass": {
        "value": 280,
        "unit": "g",
        "status": "reported"
      }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": false,
      "measuredQuantity": "none"
    },
    "capabilities": [
      {
        "id": "selectable",
        "state": "implemented"
      },
      {
        "id": "translatable",
        "state": "implemented"
      },
      {
        "id": "rotatable",
        "state": "implemented"
      },
      {
        "id": "opticalFocus",
        "state": "implemented"
      }
    ],
    "behaviorIds": [
      "bhv-core-spatial"
    ],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Vật lí & Quang học THCS",
      "authorRole": "Giáo viên KHTN 9",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-10-02",
      "updatedAt": "2026-10-28",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-DMM-0001",
    "slug": "digital-multimeter-ac-dc",
    "name": {
      "vi": "Đồng hồ đo điện đa năng hiện số (SGK KHTN 9)",
      "en": "Digital Multimeter (AC/DC V, A, Ω)"
    },
    "kind": "equipment",
    "subject": "physics",
    "category": "electrical-equipment",
    "categoryIds": [
      "electrical-equipment"
    ],
    "tags": [
      "đồng hồ đo điện đa năng",
      "vôn kế",
      "ampe kế",
      "điện trở",
      "định luật ohm",
      "bài 1",
      "bài 11",
      "bài 12"
    ],
    "summary": "Đồng hồ đo điện đa năng hiện số LCD cho phép đo cường độ dòng điện (A, mA), hiệu điện thế (V) và điện trở (Ω) trong cả mạch điện một chiều (DC) và xoay chiều (AC).",
    "textbookRef": {
      "bookTitle": "SGK Khoa học tự nhiên 9 (Kết nối tri thức)",
      "chapter": "Mở đầu & Chương III: Điện",
      "lesson": "Bài 1 (trang 7), Bài 11: Điện trở. Định luật Ohm, Bài 12: Đoạn mạch nối tiếp, song song",
      "figureRef": "Hình 1.5 (Đồng hồ đo điện đa năng)",
      "standardFunction": "Đo các đại lượng điện khác nhau như cường độ dòng điện I (A), hiệu điện thế U (V), điện trở R (Ω) trong mạch điện một chiều cũng như mạch điện xoay chiều.",
      "usageGuidelines": "Xoay núm chọn thang đo phù hợp (DCV, DCA hoặc Ω) trước khi cắm que đo vào mạch. Khi đo cường độ dòng điện phải mắc nối tiếp, khi đo hiệu điện thế mắc song song.",
      "safetyNote": "Không để thang đo điện trở (Ω) hoặc cường độ dòng điện (A) mà đo trực tiếp vào hai cực nguồn điện."
    },
    "assetVersion": "1.1.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/digital-multimeter@1.1.0",
      "modelFileVersion": "1.1.0",
      "proceduralArchetype": "digital-multimeter",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": {
        "width": 0.092,
        "height": 0.068,
        "depth": 0.155
      },
      "dimensions": {
        "height": {
          "value": 68,
          "unit": "mm",
          "status": "verified"
        },
        "widthOrDiameter": {
          "value": 92,
          "unit": "mm",
          "status": "verified"
        },
        "depth": {
          "value": 155,
          "unit": "mm",
          "status": "verified"
        }
      },
      "triangleCount": 2150,
      "materialCount": 5,
      "namedNodes": [
        {
          "nodeName": "root",
          "role": "root",
          "description": "Tâm đáy đồng hồ vạn năng"
        },
        {
          "nodeName": "body",
          "role": "body",
          "description": "Vỏ cao su chống sốc màu vàng và 3 giắc cắm que đo"
        },
        {
          "nodeName": "scale_display",
          "role": "scale_display",
          "description": "Màn hình LCD hiển thị U (V), I (A), R (Ω)"
        },
        {
          "nodeName": "handle",
          "role": "handle",
          "description": "Núm xoay chọn thang đo điện"
        }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": {
        "value": "Nhựa ABS bọc cao su chống sốc & Mạch đo ADC số",
        "status": "verified"
      },
      "referenceMass": {
        "value": 310,
        "unit": "g",
        "status": "verified"
      }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": true,
      "measuredQuantity": "voltage-resistance",
      "rangeMin": {
        "value": 0,
        "unit": "V / A / Ω",
        "status": "verified"
      },
      "rangeMax": {
        "value": 600,
        "unit": "V",
        "status": "verified"
      },
      "leastCount": {
        "value": 0.01,
        "unit": "V / A",
        "status": "verified"
      }
    },
    "capabilities": [
      {
        "id": "selectable",
        "state": "implemented"
      },
      {
        "id": "translatable",
        "state": "implemented"
      },
      {
        "id": "rotatable",
        "state": "implemented"
      },
      {
        "id": "readScale",
        "state": "implemented"
      }
    ],
    "behaviorIds": [
      "bhv-core-spatial"
    ],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Vật lí & Điện học THCS",
      "authorRole": "Giáo viên KHTN 9",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-10-03",
      "updatedAt": "2026-10-28",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-DSH-0001",
    "slug": "porcelain-evaporating-dish",
    "name": {
      "vi": "Bát sứ chịu nhiệt — Cô đặc & Đốt cháy cồn (SGK KHTN 9)",
      "en": "Porcelain Evaporating Dish (High-Heat)"
    },
    "kind": "equipment",
    "subject": "chemistry",
    "category": "chemical-apparatus",
    "categoryIds": [
      "chemical-apparatus",
      "laboratory-glassware",
      "thermal-equipment"
    ],
    "tags": [
      "bát sứ",
      "cô đặc",
      "đốt cháy ethylic alcohol",
      "phản ứng toả nhiệt",
      "bài 1",
      "bài 26"
    ],
    "summary": "Bát sứ tráng men chịu nhiệt cao dùng để trộn hoặc đun nóng chảy chất rắn, cô đặc dung dịch và thực hiện phản ứng toả nhiệt mạnh (như đốt cháy ethylic alcohol C2H5OH).",
    "textbookRef": {
      "bookTitle": "SGK Khoa học tự nhiên 9 (Kết nối tri thức)",
      "chapter": "Mở đầu & Chương VIII: Ethylic Alcohol và Acetic Acid",
      "lesson": "Bài 1 (trang 8) & Bài 26: Ethylic alcohol (trang 119)",
      "figureRef": "Hình 1.7 (Bát sứ)",
      "standardFunction": "Trộn hoặc đun nóng chảy các chất rắn, cô đặc dung dịch; thực hiện một số phản ứng toả nhiệt mạnh như đốt cháy 1 mL ethylic alcohol bằng que đóm dài.",
      "usageGuidelines": "Lấy khoảng 1 mL ethylic alcohol (cồn 96°) cho vào bát sứ và dùng que đóm dài để đốt cháy. Quan sát màu sắc ngọn lửa và nhiệt toả ra.",
      "safetyNote": "Chỉ lấy lượng nhỏ (~1 mL) ethylic alcohol; không dùng diêm hay bật lửa đốt trực tiếp sát miệng bát để tránh bỏng."
    },
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/porcelain-dish@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "porcelain-dish",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": {
        "width": 0.095,
        "height": 0.052,
        "depth": 0.095
      },
      "dimensions": {
        "height": {
          "value": 48,
          "unit": "mm",
          "status": "verified"
        },
        "widthOrDiameter": {
          "value": 95,
          "unit": "mm",
          "status": "verified"
        }
      },
      "triangleCount": 1620,
      "materialCount": 4,
      "namedNodes": [
        {
          "nodeName": "root",
          "role": "root",
          "description": "Tâm đáy bát sứ"
        },
        {
          "nodeName": "body",
          "role": "body",
          "description": "Thân bát sứ tráng men trắng chịu nhiệt"
        },
        {
          "nodeName": "liquid_surface",
          "role": "liquid_surface",
          "description": "Lớp cồn ethylic alcohol trong lòng bát"
        }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": {
        "value": "Sứ kỹ thuật tráng men chịu nhiệt 1100 °C",
        "status": "verified"
      },
      "capacity": {
        "value": 60,
        "unit": "ml",
        "status": "verified"
      },
      "referenceMass": {
        "value": 85,
        "unit": "g",
        "status": "verified"
      }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": false,
      "measuredQuantity": "none"
    },
    "capabilities": [
      {
        "id": "selectable",
        "state": "implemented"
      },
      {
        "id": "translatable",
        "state": "implemented"
      },
      {
        "id": "rotatable",
        "state": "implemented"
      },
      {
        "id": "weighObject",
        "state": "implemented"
      }
    ],
    "behaviorIds": [
      "bhv-core-spatial"
    ],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Hóa học & KHTN 9",
      "authorRole": "Giáo viên KHTN 9",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-10-04",
      "updatedAt": "2026-10-28",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-DST-0001",
    "slug": "distillation-flask-250ml-standalone",
    "name": {
      "vi": "Bình cầu có nhánh 250 mL chịu nhiệt (Độc lập)",
      "en": "250 mL Side-Arm Distillation Flask (Standalone)"
    },
    "kind": "equipment",
    "subject": "chemistry",
    "category": "laboratory-glassware",
    "categoryIds": [
      "chemical-apparatus",
      "laboratory-glassware",
      "thermal-equipment"
    ],
    "tags": [
      "bình cầu",
      "bình cầu có nhánh",
      "đun nóng",
      "chưng cất",
      "nước đá",
      "bài 1",
      "bài 24"
    ],
    "summary": "Bình cầu có nhánh 250 mL bằng thuỷ tinh Borosilicate 3.3 chịu nhiệt độc lập. Có thể chứa nước đá hoặc dung dịch chất lỏng, đặt lên Kiềng 3 chân & Lưới tản nhiệt để đun bằng Đèn cồn và cắm Nhiệt kế đo nhiệt độ.",
    "textbookRef": {
      "bookTitle": "SGK Khoa học tự nhiên (Kết nối tri thức)",
      "chapter": "Nhiệt học & Hoá học",
      "lesson": "Sự chuyển thể của chất (Nóng chảy - Sôi) & Chưng cất dung dịch",
      "figureRef": "Hình 1.9",
      "standardFunction": "Đựng nước đá hoặc chất lỏng để đun nóng trên lưới tản nhiệt và đèn cồn, khảo sát sự nóng chảy ở 0°C và sự sôi ở 100°C.",
      "usageGuidelines": "Đặt bình lên Kiềng 3 chân có Lưới tản nhiệt, đặt Đèn cồn bên dưới, cho Nước đá viên vào bình và cắm Nhiệt kế để theo dõi nhiệt độ.",
      "safetyNote": "Luôn dùng lưới tản nhiệt khi đun bằng đèn cồn để tránh nứt vỡ đáy thuỷ tinh."
    },
    "assetVersion": "1.2.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/distillation-flask@1.1.0",
      "modelFileVersion": "1.1.0",
      "proceduralArchetype": "distillation-flask",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": {
        "width": 0.11,
        "height": 0.23,
        "depth": 0.11
      },
      "dimensions": {
        "height": {
          "value": 230,
          "unit": "mm",
          "status": "verified"
        },
        "widthOrDiameter": {
          "value": 105,
          "unit": "mm",
          "status": "verified"
        }
      },
      "triangleCount": 2540,
      "materialCount": 6,
      "namedNodes": [
        {
          "nodeName": "root",
          "role": "root",
          "description": "Tâm chân kiềng đun"
        },
        {
          "nodeName": "body",
          "role": "body",
          "description": "Bình cầu có nhánh 250 mL, lưới tản nhiệt và đèn cồn"
        },
        {
          "nodeName": "liquid_surface",
          "role": "liquid_surface",
          "description": "Dung dịch phản ứng trong bầu bình cầu"
        }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": {
        "value": "Thuỷ tinh chịu nhiệt Borosilicate 3.3, Lưới thép phủ sứ & Kiềng thép",
        "status": "verified"
      },
      "capacity": {
        "value": 250,
        "unit": "ml",
        "status": "verified"
      },
      "temperatureRating": {
        "value": 500,
        "unit": "°C",
        "status": "verified"
      },
      "referenceMass": {
        "value": 380,
        "unit": "g",
        "status": "verified"
      }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": false,
      "measuredQuantity": "volume"
    },
    "capabilities": [
      {
        "id": "selectable",
        "state": "implemented"
      },
      {
        "id": "translatable",
        "state": "implemented"
      },
      {
        "id": "rotatable",
        "state": "implemented"
      },
      {
        "id": "readScale",
        "state": "implemented"
      }
    ],
    "behaviorIds": [
      "bhv-core-spatial"
    ],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Hóa học & KHTN 9",
      "authorRole": "Giáo viên KHTN 9",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-10-04",
      "updatedAt": "2026-10-28",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-LEV-0001",
    "slug": "thanh-don-bay-thang-bang",
    "name": {
      "vi": "Bộ đòn bẩy thăng bằng chia vạch đối xứng kèm giá đỡ",
      "en": "Calibrated Symmetrical Lever Balance with Stand"
    },
    "kind": "equipment",
    "subject": "physics",
    "category": "force-measurement",
    "categoryIds": [
      "force-measurement",
      "measuring-instrument"
    ],
    "tags": [
      "don-bay",
      "momen-luc",
      "thang-bang",
      "khtn-8",
      "co-hoc-8"
    ],
    "summary": "Bộ đòn bẩy chia vạch đối xứng 18 lỗ treo kèm giá đỡ trục quay ma sát thấp và ốc vi chỉnh đối trọng, dùng khảo sát quy tắc mômen lực trong chương trình KHTN 8.",
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "2.4.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://lever-balance-apparatus",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "lever-balance-apparatus",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": {
        "width": 0.4,
        "height": 0.36,
        "depth": 0.12
      },
      "dimensions": {
        "widthOrDiameter": {
          "value": 400,
          "unit": "mm",
          "status": "verified"
        },
        "height": {
          "value": 360,
          "unit": "mm",
          "status": "verified"
        },
        "depth": {
          "value": 120,
          "unit": "mm",
          "status": "verified"
        }
      },
      "triangleCount": 2480,
      "materialCount": 6,
      "namedNodes": [
        {
          "nodeName": "body",
          "role": "body",
          "description": "Chân đế gang đúc nặng bọc cao su và cột trụ Inox đứng"
        },
        {
          "nodeName": "scale_display",
          "role": "scale_display",
          "description": "Mặt đĩa chia độ góc nghiêng và vạch cân bằng 0°"
        },
        {
          "nodeName": "scale_display_rear",
          "role": "scale_display",
          "description": "Mặt đĩa đọc góc nghiêng đồng bộ 360° phía sau"
        },
        {
          "nodeName": "plunger",
          "role": "plunger",
          "description": "Thanh đòn bẩy quay quanh trục Z kèm ốc vi chỉnh và quả cân"
        }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "referenceMass": {
        "value": 680,
        "unit": "g",
        "status": "verified"
      },
      "material": {
        "value": "Hợp kim nhôm Anode & Thép không gỉ",
        "status": "verified"
      }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": true,
      "measuredQuantity": "force",
      "rangeMin": {
        "value": -30,
        "unit": "deg",
        "status": "verified"
      },
      "rangeMax": {
        "value": 30,
        "unit": "deg",
        "status": "verified"
      },
      "leastCount": {
        "value": 1,
        "unit": "deg",
        "status": "verified"
      },
      "zeroOffsetSupported": true,
      "referenceStandard": "Thông tư 38/2021/TT-BGDĐT"
    },
    "capabilities": [
      {
        "id": "selectable",
        "state": "implemented",
        "behaviorModuleId": "bhv-core-spatial"
      },
      {
        "id": "translatable",
        "state": "implemented",
        "behaviorModuleId": "bhv-core-spatial"
      },
      {
        "id": "rotatable",
        "state": "implemented",
        "behaviorModuleId": "bhv-core-spatial"
      },
      {
        "id": "showDimensions",
        "state": "implemented",
        "behaviorModuleId": "bhv-core-spatial"
      }
    ],
    "behaviorIds": [
      "bhv-core-spatial"
    ],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Nhóm Mô phỏng Thiết bị KHTN 8",
      "authorRole": "Giáo viên Vật lí & Kỹ sư 3D OpenLab",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-11-03",
      "updatedAt": "2026-11-03",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-HYD-0001",
    "slug": "binh-thong-nhau-3-nhanh",
    "name": {
      "vi": "Bình thông nhau 3 nhánh dị hình trên đế",
      "en": "Communicating Vessels 3-Shape Branch on Stand"
    },
    "kind": "equipment",
    "subject": "physics",
    "category": "volume-measurement",
    "categoryIds": [
      "volume-measurement",
      "laboratory-glassware"
    ],
    "tags": [
      "binh-thong-nhau",
      "ap-suat-chat-long",
      "thuy-tinh",
      "khtn-8",
      "vat-li-8"
    ],
    "summary": "Bộ dụng cụ bình thông nhau 3 nhánh thủy tinh Borosilicate dị hình (thẳng, lượn sóng, phình quả trám) gắn trên đế vững chắc, minh chứng mặt thoáng chất lỏng đứng yên luôn cùng độ cao nằm ngang.",
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "2.4.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://communicating-vessels-3branch",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "communicating-vessels-3way",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": {
        "width": 0.16,
        "height": 0.18,
        "depth": 0.055
      },
      "dimensions": {
        "widthOrDiameter": {
          "value": 160,
          "unit": "mm",
          "status": "verified"
        },
        "height": {
          "value": 180,
          "unit": "mm",
          "status": "verified"
        },
        "depth": {
          "value": 55,
          "unit": "mm",
          "status": "verified"
        }
      },
      "triangleCount": 3840,
      "materialCount": 5,
      "namedNodes": [
        {
          "nodeName": "body",
          "role": "body",
          "description": "Khối thủy tinh 3 nhánh liền khối và đế nhựa chống lật"
        },
        {
          "nodeName": "liquid_surface",
          "role": "liquid_surface",
          "description": "Cột chất lỏng tự cân bằng đồng mức ở cả 3 nhánh"
        }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "referenceMass": {
        "value": 165,
        "unit": "g",
        "status": "verified"
      },
      "referenceVolume": {
        "value": 150,
        "unit": "ml",
        "status": "verified"
      },
      "capacity": {
        "value": 150,
        "unit": "ml",
        "status": "verified"
      },
      "material": {
        "value": "Thủy tinh Borosilicate 3.3 & Nhựa Polypropylene nguyên sinh",
        "status": "verified"
      }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": true,
      "measuredQuantity": "volume",
      "rangeMin": {
        "value": 0,
        "unit": "ml",
        "status": "verified"
      },
      "rangeMax": {
        "value": 150,
        "unit": "ml",
        "status": "verified"
      },
      "leastCount": {
        "value": 5,
        "unit": "ml",
        "status": "verified"
      },
      "zeroOffsetSupported": true,
      "referenceStandard": "Thông tư 38/2021/TT-BGDĐT"
    },
    "capabilities": [
      {
        "id": "selectable",
        "state": "implemented",
        "behaviorModuleId": "bhv-core-spatial"
      },
      {
        "id": "translatable",
        "state": "implemented",
        "behaviorModuleId": "bhv-core-spatial"
      },
      {
        "id": "rotatable",
        "state": "implemented",
        "behaviorModuleId": "bhv-core-spatial"
      },
      {
        "id": "showDimensions",
        "state": "implemented",
        "behaviorModuleId": "bhv-core-spatial"
      },
      {
        "id": "displacementVolume",
        "state": "implemented",
        "behaviorModuleId": "bhv-liquid-container"
      },
      {
        "id": "weighObject",
        "state": "implemented",
        "behaviorModuleId": "bhv-liquid-container"
      }
    ],
    "behaviorIds": [
      "bhv-core-spatial",
      "bhv-liquid-container"
    ],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Nhóm Mô phỏng Thiết bị KHTN 8",
      "authorRole": "Giáo viên Vật lí & Kỹ sư 3D OpenLab",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-11-03",
      "updatedAt": "2026-11-03",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-RUL-0001",
    "slug": "thuoc-thang-chia-vach-30cm",
    "name": {
      "vi": "Thước thẳng chia vạch 30 cm (ĐCNN 1 mm)",
      "en": "30 cm Graduated Stainless Steel Ruler"
    },
    "kind": "equipment",
    "subject": "physics",
    "category": "length-measurement",
    "categoryIds": [
      "length-measurement"
    ],
    "equipmentGroupG": "G01",
    "physicsFidelityLevel": "L2",
    "tags": [
      "thuoc-thang",
      "30cm",
      "chieu-dai",
      "khtn-6",
      "do-luong"
    ],
    "summary": "Thước thẳng bằng thép không gỉ chiều dài 300 mm (30 cm), khắc vạch milimét sắc nét (ĐCNN 1 mm), dùng đo chiều dài, kích thước hình học và khoảng cách trên bàn thí nghiệm.",
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/ruler-30@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "ruler-30",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": {
        "width": 0.31,
        "height": 0.004,
        "depth": 0.032
      },
      "dimensions": {
        "height": {
          "value": 4,
          "unit": "mm",
          "status": "verified"
        },
        "widthOrDiameter": {
          "value": 310,
          "unit": "mm",
          "status": "verified"
        },
        "depth": {
          "value": 32,
          "unit": "mm",
          "status": "verified"
        }
      },
      "triangleCount": 640,
      "materialCount": 2,
      "namedNodes": [
        {
          "nodeName": "root",
          "role": "root",
          "description": "Tâm đáy thước thẳng 30 cm"
        },
        {
          "nodeName": "body",
          "role": "body",
          "description": "Thân thước thép không gỉ khắc vạch 0 - 30 cm"
        },
        {
          "nodeName": "scale_marks",
          "role": "scale_marks",
          "description": "Hệ vạch chia mm và cm"
        }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": {
        "value": "Thép không gỉ SUS304 chống chói",
        "status": "verified"
      },
      "referenceMass": {
        "value": 45,
        "unit": "g",
        "status": "verified"
      }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": true,
      "measuredQuantity": "length",
      "rangeMin": {
        "value": 0,
        "unit": "mm",
        "status": "verified"
      },
      "rangeMax": {
        "value": 300,
        "unit": "mm",
        "status": "verified"
      },
      "leastCount": {
        "value": 1,
        "unit": "mm",
        "status": "verified"
      }
    },
    "capabilities": [
      {
        "id": "selectable",
        "state": "implemented"
      },
      {
        "id": "translatable",
        "state": "implemented"
      },
      {
        "id": "rotatable",
        "state": "implemented"
      },
      {
        "id": "showDimensions",
        "state": "implemented"
      },
      {
        "id": "readScale",
        "state": "implemented"
      }
    ],
    "behaviorIds": [
      "bhv-core-spatial"
    ],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Nhóm Thiết bị Đo lường KHTN",
      "authorRole": "Giáo viên Vật lí",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-10-01",
      "updatedAt": "2026-10-28",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-STW-0001",
    "slug": "dong-ho-bam-giay-hien-so",
    "name": {
      "vi": "Đồng hồ bấm giây hiện số 0.01 s",
      "en": "Digital Precision Laboratory Stopwatch (0.01 s)"
    },
    "kind": "equipment",
    "subject": "physics",
    "category": "measuring-instrument",
    "categoryIds": [
      "measuring-instrument",
      "electrical-equipment"
    ],
    "equipmentGroupG": "G03",
    "physicsFidelityLevel": "L2",
    "tags": [
      "dong-ho-bam-giay",
      "thoi-gian",
      "stopwatch",
      "khtn-6",
      "khtn-7"
    ],
    "summary": "Đồng hồ bấm giây điện tử hiện số độ phân giải 0.01 giây, có 3 phím chức năng Start/Stop, Split/Reset và Mode, dùng đo thời gian chuyển động và tốc độ phản ứng.",
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/stopwatch@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "stopwatch",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": {
        "width": 0.068,
        "height": 0.022,
        "depth": 0.084
      },
      "dimensions": {
        "height": {
          "value": 22,
          "unit": "mm",
          "status": "verified"
        },
        "widthOrDiameter": {
          "value": 68,
          "unit": "mm",
          "status": "verified"
        },
        "depth": {
          "value": 84,
          "unit": "mm",
          "status": "verified"
        }
      },
      "triangleCount": 1280,
      "materialCount": 4,
      "namedNodes": [
        {
          "nodeName": "root",
          "role": "root",
          "description": "Tâm đáy đồng hồ bấm giây"
        },
        {
          "nodeName": "body",
          "role": "body",
          "description": "Vỏ nhựa ABS chống sốc và 3 nút bấm"
        },
        {
          "nodeName": "scale_display",
          "role": "scale_display",
          "description": "Màn hình LCD hiển thị phút:giây.1/100s"
        }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": {
        "value": "Nhựa kỹ thuật ABS & Màn hình tinh thể lỏng LCD",
        "status": "verified"
      },
      "referenceMass": {
        "value": 62,
        "unit": "g",
        "status": "verified"
      }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": true,
      "measuredQuantity": "none",
      "rangeMin": {
        "value": 0,
        "unit": "s",
        "status": "verified"
      },
      "rangeMax": {
        "value": 3600,
        "unit": "s",
        "status": "verified"
      },
      "leastCount": {
        "value": 0.01,
        "unit": "s",
        "status": "verified"
      }
    },
    "capabilities": [
      {
        "id": "selectable",
        "state": "implemented"
      },
      {
        "id": "translatable",
        "state": "implemented"
      },
      {
        "id": "rotatable",
        "state": "implemented"
      },
      {
        "id": "readScale",
        "state": "implemented"
      }
    ],
    "behaviorIds": [
      "bhv-core-spatial"
    ],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Nhóm Thiết bị Đo lường KHTN",
      "authorRole": "Giáo viên Vật lí",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-10-01",
      "updatedAt": "2026-10-28",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-TUB-0001",
    "slug": "ong-nghiem-thuy-tinh-kem-gia-do",
    "name": {
      "vi": "Ống nghiệm thủy tinh chịu nhiệt 150 mm trên giá đỡ",
      "en": "Borosilicate Glass Test TubeRack & 150 mm Test Tubes"
    },
    "kind": "equipment",
    "subject": "chemistry",
    "category": "laboratory-glassware",
    "categoryIds": [
      "laboratory-glassware",
      "chemical-apparatus"
    ],
    "equipmentGroupG": "G05",
    "physicsFidelityLevel": "L2",
    "tags": [
      "ong-nghiem",
      "gia-do-ong-nghiem",
      "hoa-hoc",
      "khtn-7",
      "khtn-8",
      "khtn-9"
    ],
    "summary": "Bộ ống nghiệm thủy tinh Borosilicate 3.3 chịu nhiệt (Ø 16 × 150 mm) đặt trên giá đỡ ống nghiệm 6 lỗ, dùng thực hiện các phản ứng hóa học định tính với lượng nhỏ dung dịch.",
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/test-tube-rack@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "test-tube-rack",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": {
        "width": 0.16,
        "height": 0.165,
        "depth": 0.065
      },
      "dimensions": {
        "height": {
          "value": 165,
          "unit": "mm",
          "status": "verified"
        },
        "widthOrDiameter": {
          "value": 160,
          "unit": "mm",
          "status": "verified"
        },
        "depth": {
          "value": 65,
          "unit": "mm",
          "status": "verified"
        }
      },
      "triangleCount": 2460,
      "materialCount": 4,
      "namedNodes": [
        {
          "nodeName": "root",
          "role": "root",
          "description": "Tâm đáy giá đỡ ống nghiệm"
        },
        {
          "nodeName": "body",
          "role": "body",
          "description": "Giá đỡ và dãy ống nghiệm thủy tinh Borosilicate"
        },
        {
          "nodeName": "liquid_surface",
          "role": "liquid_surface",
          "description": "Dung dịch thuốc thử trong ống nghiệm"
        }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": {
        "value": "Thủy tinh Borosilicate 3.3 & Giá đỡ gỗ/nhựa kỹ thuật",
        "status": "verified"
      },
      "capacity": {
        "value": 25,
        "unit": "ml",
        "status": "verified"
      },
      "referenceMass": {
        "value": 185,
        "unit": "g",
        "status": "verified"
      }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": false,
      "measuredQuantity": "volume"
    },
    "capabilities": [
      {
        "id": "selectable",
        "state": "implemented"
      },
      {
        "id": "translatable",
        "state": "implemented"
      },
      {
        "id": "rotatable",
        "state": "implemented"
      },
      {
        "id": "readScale",
        "state": "implemented"
      }
    ],
    "behaviorIds": [
      "bhv-core-spatial"
    ],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Hóa học & KHTN",
      "authorRole": "Giáo viên Hóa học",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-10-01",
      "updatedAt": "2026-10-28",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-ALC-0001",
    "slug": "den-con-thuy-tinh-thi-nghiem-150ml",
    "name": {
      "vi": "Đèn cồn thủy tinh thí nghiệm 150 ml kèm nắp chụp",
      "en": "150 ml Laboratory Glass Spirit Alcohol Burner"
    },
    "kind": "equipment",
    "subject": "chemistry",
    "category": "thermal-equipment",
    "categoryIds": [
      "thermal-equipment",
      "chemical-apparatus",
      "laboratory-glassware"
    ],
    "equipmentGroupG": "G05",
    "physicsFidelityLevel": "L2",
    "tags": [
      "den-con",
      "gia-nhiet",
      "ngon-lua",
      "hoa-hoc",
      "khtn-6",
      "khtn-8",
      "khtn-9"
    ],
    "summary": "Đèn cồn thủy tinh dày chịu nhiệt dung tích 150 ml có bấc sợi cotton, ống giữ bấc bằng sứ/kim loại và chụp tắt lửa an toàn, dùng đun nóng ống nghiệm, cốc đốt và bát sứ.",
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/alcohol-burner@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "alcohol-burner",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": {
        "width": 0.082,
        "height": 0.115,
        "depth": 0.082
      },
      "dimensions": {
        "height": {
          "value": 115,
          "unit": "mm",
          "status": "verified"
        },
        "widthOrDiameter": {
          "value": 82,
          "unit": "mm",
          "status": "verified"
        }
      },
      "triangleCount": 1980,
      "materialCount": 5,
      "namedNodes": [
        {
          "nodeName": "root",
          "role": "root",
          "description": "Tâm đáy bầu đèn cồn"
        },
        {
          "nodeName": "body",
          "role": "body",
          "description": "Bầu thủy tinh đa diện chứa cồn và bấc đèn"
        },
        {
          "nodeName": "liquid_surface",
          "role": "liquid_surface",
          "description": "Mực cồn 90° bên trong bầu đèn"
        }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": {
        "value": "Thủy tinh dày chịu nhiệt, Bấc cotton & Chụp dập lửa",
        "status": "verified"
      },
      "capacity": {
        "value": 150,
        "unit": "ml",
        "status": "verified"
      },
      "referenceMass": {
        "value": 210,
        "unit": "g",
        "status": "verified"
      },
      "temperatureRating": {
        "value": 100,
        "unit": "°C",
        "status": "verified"
      }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": false,
      "measuredQuantity": "temperature"
    },
    "capabilities": [
      {
        "id": "selectable",
        "state": "implemented"
      },
      {
        "id": "translatable",
        "state": "implemented"
      },
      {
        "id": "rotatable",
        "state": "implemented"
      }
    ],
    "behaviorIds": [
      "bhv-core-spatial"
    ],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Hóa học & KHTN",
      "authorRole": "Giáo viên Hóa học",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-10-01",
      "updatedAt": "2026-10-28",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-DC-HOLDER-0001",
    "slug": "gia-do-pin-2-khay-4-coc",
    "name": {
      "vi": "Giá đỡ 2 Pin đại (SLOT_1, SLOT_2 & 4 cọc cắm)",
      "en": "Dual D-Cell Battery Holder (4 Banana Terminals)"
    },
    "kind": "equipment",
    "subject": "physics",
    "category": "electrical-equipment",
    "categoryIds": ["electrical-equipment"],
    "equipmentGroupG": "G07",
    "physicsFidelityLevel": "L3",
    "tags": ["gia-do-pin", "nguon-dien", "pin-con-o", "mach-dien", "khtn-8", "khtn-9"],
    "summary": "Giá đỡ pin gồm 2 khay (SLOT_1, SLOT_2) và 4 cọc cắm bắp chuối ở 4 góc: Khay 1 (BAT1_POS Đỏ trái-trên, BAT1_NEG Đen trái-dưới), Khay 2 (BAT2_NEG Đen phải-trên, BAT2_POS Đỏ phải-dưới). Để có nguồn 3.0V phải nối dây cầu từ BAT1_NEG sang BAT2_POS.",
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/dc-battery-holder@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "dc-battery-holder",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": { "width": 0.11, "height": 0.048, "depth": 0.088 },
      "dimensions": {
        "height": { "value": 48, "unit": "mm", "status": "verified" },
        "widthOrDiameter": { "value": 110, "unit": "mm", "status": "verified" },
        "depth": { "value": 88, "unit": "mm", "status": "verified" }
      },
      "triangleCount": 2400,
      "materialCount": 6,
      "namedNodes": [
        { "nodeName": "root", "role": "root", "description": "Tâm đáy giá đỡ pin" },
        { "nodeName": "body", "role": "body", "description": "Khay nhựa ABS 2 ngăn SLOT_1, SLOT_2 và 4 cọc cắm" }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": { "value": "Nhựa ABS cách điện & Lá đồng đàn hồi dẫn điện", "status": "verified" },
      "referenceMass": { "value": 240, "unit": "g", "status": "verified" }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": false,
      "measuredQuantity": "voltage-resistance",
      "rangeMin": { "value": 0, "unit": "V", "status": "verified" },
      "rangeMax": { "value": 3.0, "unit": "V", "status": "verified" }
    },
    "capabilities": [
      { "id": "selectable", "state": "implemented" },
      { "id": "translatable", "state": "implemented" },
      { "id": "rotatable", "state": "implemented" }
    ],
    "behaviorIds": ["bhv-core-spatial"],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Vật lí & Điện học",
      "authorRole": "Giáo viên Vật lí",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-11-01",
      "updatedAt": "2026-11-11",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-DC-BAT-0001",
    "slug": "vien-pin-dai-con-o-1-5v",
    "name": {
      "vi": "Viên Pin đại Con Ó 1.5V (Pin R20 / D-Cell)",
      "en": "Con O 1.5V D-Size Dry Cell Battery"
    },
    "kind": "equipment",
    "subject": "physics",
    "category": "electrical-equipment",
    "categoryIds": ["electrical-equipment"],
    "equipmentGroupG": "G07",
    "physicsFidelityLevel": "L3",
    "tags": ["pin-con-o", "pin-1.5v", "nguon-dien", "mach-dien"],
    "summary": "Viên pin đại 1.5V (R20) dùng để lắp vào SLOT_1 hoặc SLOT_2 của Giá đỡ pin. Có thể kéo thả vào giá đỡ pin hoặc đảo chiều cực (+/-).",
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/dc-con-o-battery@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "dc-con-o-battery",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": { "width": 0.034, "height": 0.034, "depth": 0.062 },
      "dimensions": {
        "height": { "value": 34, "unit": "mm", "status": "verified" },
        "widthOrDiameter": { "value": 34, "unit": "mm", "status": "verified" },
        "depth": { "value": 62, "unit": "mm", "status": "verified" }
      },
      "triangleCount": 960,
      "materialCount": 4,
      "namedNodes": [
        { "nodeName": "root", "role": "root", "description": "Tâm đáy viên pin" },
        { "nodeName": "body", "role": "body", "description": "Thân pin 1.5V Con Ó và núm cực dương" }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": { "value": "Vỏ kẽm - Mangan đioxit - Than chì", "status": "verified" },
      "referenceMass": { "value": 95, "unit": "g", "status": "verified" }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": false,
      "measuredQuantity": "none"
    },
    "capabilities": [
      { "id": "selectable", "state": "implemented" },
      { "id": "translatable", "state": "implemented" },
      { "id": "rotatable", "state": "implemented" }
    ],
    "behaviorIds": ["bhv-core-spatial"],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Vật lí & Điện học",
      "authorRole": "Giáo viên Vật lí",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-11-01",
      "updatedAt": "2026-11-11",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-DC-SWITCH-0001",
    "slug": "cau-dao-don-cong-tac-k",
    "name": {
      "vi": "Cầu dao đơn (Công tắc K - 2 cọc SW_RED & SW_GREEN)",
      "en": "Single-Pole Knife Switch K (SW_RED & SW_GREEN)"
    },
    "kind": "equipment",
    "subject": "physics",
    "category": "electrical-equipment",
    "categoryIds": ["electrical-equipment"],
    "equipmentGroupG": "G07",
    "physicsFidelityLevel": "L3",
    "tags": ["cau-dao", "cong-tac-k", "mach-dien", "khtn-8", "khtn-9"],
    "summary": "Công tắc cầu dao K đế nhựa đen gồm 2 cọc cắm: SW_RED (Đỏ) và SW_GREEN (Xanh lá). Chỉ dẫn điện qua cầu dao khi lưỡi dao đóng (isClosed = true).",
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/dc-knife-switch@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "dc-knife-switch",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": { "width": 0.092, "height": 0.048, "depth": 0.046 },
      "dimensions": {
        "height": { "value": 48, "unit": "mm", "status": "verified" },
        "widthOrDiameter": { "value": 92, "unit": "mm", "status": "verified" },
        "depth": { "value": 46, "unit": "mm", "status": "verified" }
      },
      "triangleCount": 1450,
      "materialCount": 5,
      "namedNodes": [
        { "nodeName": "root", "role": "root", "description": "Tâm đáy cầu dao" },
        { "nodeName": "body", "role": "body", "description": "Đế nhựa và 2 cọc SW_RED, SW_GREEN" },
        { "nodeName": "handle", "role": "handle", "description": "Lưỡi dao đồng và tay nắm đóng/ngắt" }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": { "value": "Đế Bakelite đen & Lưỡi tiếp điểm đồng thau", "status": "verified" },
      "referenceMass": { "value": 85, "unit": "g", "status": "verified" }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": false,
      "measuredQuantity": "none"
    },
    "capabilities": [
      { "id": "selectable", "state": "implemented" },
      { "id": "translatable", "state": "implemented" },
      { "id": "rotatable", "state": "implemented" }
    ],
    "behaviorIds": ["bhv-core-spatial"],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Vật lí & Điện học",
      "authorRole": "Giáo viên Vật lí",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-11-01",
      "updatedAt": "2026-11-11",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-DC-BULB-0001",
    "slug": "bong-den-day-toc-126-tren-de",
    "name": {
      "vi": "Bóng đèn dây tóc 126 trên đế (R = 8.5Ω, BULB_NEG & BULB_POS)",
      "en": "Mounted Incandescent Bulb 126 (8.5 Ohm, BULB_NEG & BULB_POS)"
    },
    "kind": "equipment",
    "subject": "physics",
    "category": "electrical-equipment",
    "categoryIds": ["electrical-equipment"],
    "equipmentGroupG": "G07",
    "physicsFidelityLevel": "L3",
    "tags": ["bong-den", "den-day-toc", "mach-dien", "khtn-8", "khtn-9"],
    "summary": "Bóng đèn dây tóc 3V (R_bulb = 8.5Ω) gắn trên đế nhựa số 126 với 2 cọc cắm BULB_NEG (Đen, trái) và BULB_POS (Đỏ, phải). Phát sáng theo công suất thực P = I² * R_bulb.",
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/dc-light-bulb-126@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "dc-light-bulb-126",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": { "width": 0.092, "height": 0.062, "depth": 0.048 },
      "dimensions": {
        "height": { "value": 62, "unit": "mm", "status": "verified" },
        "widthOrDiameter": { "value": 92, "unit": "mm", "status": "verified" },
        "depth": { "value": 48, "unit": "mm", "status": "verified" }
      },
      "triangleCount": 1820,
      "materialCount": 6,
      "namedNodes": [
        { "nodeName": "root", "role": "root", "description": "Tâm đế bóng đèn 126" },
        { "nodeName": "body", "role": "body", "description": "Đế nhựa trắng 126, đui đồng và bầu thủy tinh" }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": { "value": "Bầu thủy tinh Borosilicate, Dây tóc Vonfram & Đui đồng", "status": "verified" },
      "referenceMass": { "value": 75, "unit": "g", "status": "verified" }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": false,
      "measuredQuantity": "none"
    },
    "capabilities": [
      { "id": "selectable", "state": "implemented" },
      { "id": "translatable", "state": "implemented" },
      { "id": "rotatable", "state": "implemented" }
    ],
    "behaviorIds": ["bhv-core-spatial"],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Vật lí & Điện học",
      "authorRole": "Giáo viên Vật lí",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-11-01",
      "updatedAt": "2026-11-11",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-DC-RHEO-0001",
    "slug": "bien-tro-con-chay-20-ohm",
    "name": {
      "vi": "Biến trở con chạy 20Ω - 2A (3 cọc RHEO_IN, RHEO_COIL_END, RHEO_WIPER)",
      "en": "20 Ohm Sliding Rheostat (3 Terminals: IN, COIL_END, WIPER)"
    },
    "kind": "equipment",
    "subject": "physics",
    "category": "electrical-equipment",
    "categoryIds": ["electrical-equipment"],
    "equipmentGroupG": "G07",
    "physicsFidelityLevel": "L3",
    "tags": ["bien-tro", "bien-tro-con-chay", "dinh-luat-ohm", "mach-dien", "khtn-9"],
    "summary": "Biến trở con chạy 20Ω gồm 3 cọc: RHEO_IN (Đỏ - đầu cuộn dây), RHEO_COIL_END (Xanh giữa - cuối cuộn dây) và RHEO_WIPER (Xanh phải - thanh con chạy). Nối RHEO_IN và RHEO_WIPER để điều chỉnh điện trở từ 0..20Ω khi kéo con chạy.",
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/dc-rheostat-20@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "dc-rheostat-20",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": { "width": 0.165, "height": 0.075, "depth": 0.056 },
      "dimensions": {
        "height": { "value": 75, "unit": "mm", "status": "verified" },
        "widthOrDiameter": { "value": 165, "unit": "mm", "status": "verified" },
        "depth": { "value": 56, "unit": "mm", "status": "verified" }
      },
      "triangleCount": 2680,
      "materialCount": 6,
      "namedNodes": [
        { "nodeName": "root", "role": "root", "description": "Tâm đáy biến trở" },
        { "nodeName": "body", "role": "body", "description": "Ống sứ quấn dây hợp kim Constantan và 3 cọc cắm" },
        { "nodeName": "plunger", "role": "plunger", "description": "Con chạy trượt dọc thanh dẫn" }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": { "value": "Ống sứ cách nhiệt, Dây hợp kim Constantan & Thanh trượt đồng", "status": "verified" },
      "referenceMass": { "value": 280, "unit": "g", "status": "verified" }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": false,
      "measuredQuantity": "voltage-resistance",
      "rangeMin": { "value": 0, "unit": "Ω", "status": "verified" },
      "rangeMax": { "value": 20, "unit": "Ω", "status": "verified" }
    },
    "capabilities": [
      { "id": "selectable", "state": "implemented" },
      { "id": "translatable", "state": "implemented" },
      { "id": "rotatable", "state": "implemented" },
      { "id": "readScale", "state": "implemented" }
    ],
    "behaviorIds": ["bhv-core-spatial"],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Vật lí & Điện học",
      "authorRole": "Giáo viên Vật lí",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-11-01",
      "updatedAt": "2026-11-11",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-DC-AMM-0001",
    "slug": "ampe-ke-dc-2-thang-do-0-6a-3a",
    "name": {
      "vi": "Ampe kế DC 2 thang đo (AM_NEG '-', AM_06A '0.6A', AM_3A '3A')",
      "en": "DC Analog Ammeter (0.6A / 3A Dual Range)"
    },
    "kind": "equipment",
    "subject": "physics",
    "category": "electrical-equipment",
    "categoryIds": ["electrical-equipment", "measuring-instrument"],
    "equipmentGroupG": "G03",
    "physicsFidelityLevel": "L3",
    "tags": ["ampe-ke", "do-cuong-do-dong-dien", "mach-dien", "khtn-8", "khtn-9"],
    "summary": "Ampe kế một chiều (DC) điện trở trong R_A = 0.05Ω, có 3 cọc trên dải xanh lá: AM_NEG (Đen '-'), AM_06A (Đỏ 0.6A) và AM_3A (Đỏ 3A). Phải mắc nối tiếp vào mạch điện, chốt (+) về phía cực dương nguồn.",
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/dc-ammeter@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "dc-ammeter",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": { "width": 0.115, "height": 0.105, "depth": 0.125 },
      "dimensions": {
        "height": { "value": 105, "unit": "mm", "status": "verified" },
        "widthOrDiameter": { "value": 115, "unit": "mm", "status": "verified" },
        "depth": { "value": 125, "unit": "mm", "status": "verified" }
      },
      "triangleCount": 2240,
      "materialCount": 6,
      "namedNodes": [
        { "nodeName": "root", "role": "root", "description": "Tâm đáy Ampe kế" },
        { "nodeName": "body", "role": "body", "description": "Thân đồng hồ nghiêng và 3 cọc AM_NEG, AM_06A, AM_3A" },
        { "nodeName": "plunger", "role": "plunger", "description": "Kim chỉ thị Ampe kế" }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": { "value": "Vỏ nhựa ABS trắng, Cơ cấu từ điện & Mặt kính Acrylic", "status": "verified" },
      "referenceMass": { "value": 210, "unit": "g", "status": "verified" }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": true,
      "measuredQuantity": "electric-current",
      "rangeMin": { "value": 0, "unit": "A", "status": "verified" },
      "rangeMax": { "value": 3.0, "unit": "A", "status": "verified" },
      "leastCount": { "value": 0.02, "unit": "A", "status": "verified" }
    },
    "capabilities": [
      { "id": "selectable", "state": "implemented" },
      { "id": "translatable", "state": "implemented" },
      { "id": "rotatable", "state": "implemented" },
      { "id": "readScale", "state": "implemented" }
    ],
    "behaviorIds": ["bhv-core-spatial"],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Vật lí & Điện học",
      "authorRole": "Giáo viên Vật lí",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-11-01",
      "updatedAt": "2026-11-11",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-DC-VOLT-0001",
    "slug": "von-ke-dc-2-thang-do-6v-12v",
    "name": {
      "vi": "Vôn kế DC 2 thang đo (VM_NEG '-', VM_6V '6V', VM_12V '12V')",
      "en": "DC Analog Voltmeter (6V / 12V Dual Range)"
    },
    "kind": "equipment",
    "subject": "physics",
    "category": "electrical-equipment",
    "categoryIds": ["electrical-equipment", "measuring-instrument"],
    "equipmentGroupG": "G03",
    "physicsFidelityLevel": "L3",
    "tags": ["von-ke", "do-hieu-dien-the", "mach-dien", "khtn-8", "khtn-9"],
    "summary": "Vôn kế một chiều (DC) điện trở trong rất lớn R_V = 10000Ω, có 3 cọc trên dải xanh dương: VM_NEG (Đen '-'), VM_6V (Đỏ 6V) và VM_12V (Đỏ 12V). Bắt buộc mắc song song với bóng đèn hoặc hai cực nguồn.",
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/dc-voltmeter@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "dc-voltmeter",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": { "width": 0.115, "height": 0.105, "depth": 0.125 },
      "dimensions": {
        "height": { "value": 105, "unit": "mm", "status": "verified" },
        "widthOrDiameter": { "value": 115, "unit": "mm", "status": "verified" },
        "depth": { "value": 125, "unit": "mm", "status": "verified" }
      },
      "triangleCount": 2240,
      "materialCount": 6,
      "namedNodes": [
        { "nodeName": "root", "role": "root", "description": "Tâm đáy Vôn kế" },
        { "nodeName": "body", "role": "body", "description": "Thân đồng hồ nghiêng và 3 cọc VM_NEG, VM_6V, VM_12V" },
        { "nodeName": "plunger", "role": "plunger", "description": "Kim chỉ thị Vôn kế" }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": { "value": "Vỏ nhựa ABS trắng, Cơ cấu từ điện & Mặt kính Acrylic", "status": "verified" },
      "referenceMass": { "value": 210, "unit": "g", "status": "verified" }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": true,
      "measuredQuantity": "voltage-resistance",
      "rangeMin": { "value": 0, "unit": "V", "status": "verified" },
      "rangeMax": { "value": 12.0, "unit": "V", "status": "verified" },
      "leastCount": { "value": 0.2, "unit": "V", "status": "verified" }
    },
    "capabilities": [
      { "id": "selectable", "state": "implemented" },
      { "id": "translatable", "state": "implemented" },
      { "id": "rotatable", "state": "implemented" },
      { "id": "readScale", "state": "implemented" }
    ],
    "behaviorIds": ["bhv-core-spatial"],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Vật lí & Điện học",
      "authorRole": "Giáo viên Vật lí",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-11-01",
      "updatedAt": "2026-11-11",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-THV-0001",
    "slug": "binh-thuy-tinh-chiu-nhiet-dung-nuoc-da-250ml",
    "name": {
      "vi": "Bình thủy tinh chịu nhiệt đựng nước đá & đun sôi 250 ml",
      "en": "250 ml Borosilicate Thermal Heating Vessel (Ice & Boiling)"
    },
    "kind": "equipment",
    "subject": "physics",
    "category": "thermal-equipment",
    "categoryIds": ["thermal-equipment", "laboratory-glassware", "volume-measurement"],
    "equipmentGroupG": "G05",
    "physicsFidelityLevel": "L3",
    "tags": ["binh-dung", "nuoc-da", "dun-soi", "nong-chay", "nhiet-hoc", "den-con"],
    "summary": "Bình thủy tinh Borosilicate 3.3 chịu nhiệt cao dung tích 250 ml (dụng cụ độc lập) dùng để đựng nước đá viên hoặc nước lỏng, đặt lên Kiềng 3 chân & Lưới tản nhiệt để đun bằng Đèn cồn, quan sát trực tiếp quá trình đá tan ở 0°C và nước sôi sùng sục ở 100°C.",
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/thermal-heating-vessel@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "thermal-heating-vessel",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": { "width": 0.082, "height": 0.115, "depth": 0.082 },
      "dimensions": {
        "height": { "value": 115, "unit": "mm", "status": "verified" },
        "widthOrDiameter": { "value": 78, "unit": "mm", "status": "verified" }
      },
      "triangleCount": 3120,
      "materialCount": 5,
      "namedNodes": [
        { "nodeName": "root", "role": "root", "description": "Tâm đáy bình thủy tinh chịu nhiệt" },
        { "nodeName": "body", "role": "body", "description": "Thân bình thủy tinh chịu nhiệt có vạch chia 50 - 250 ml" },
        { "nodeName": "liquid_surface", "role": "liquid_surface", "description": "Mực nước lỏng và các viên nước đá đang tan bên trong" }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": { "value": "Thủy tinh chịu nhiệt Borosilicate 3.3", "status": "verified" },
      "capacity": { "value": 250, "unit": "ml", "status": "verified" },
      "referenceMass": { "value": 105, "unit": "g", "status": "verified" },
      "temperatureRating": { "value": 500, "unit": "°C", "status": "verified" }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": true,
      "measuredQuantity": "temperature",
      "rangeMin": { "value": -10, "unit": "°C", "status": "verified" },
      "rangeMax": { "value": 100, "unit": "°C", "status": "verified" },
      "leastCount": { "value": 0.5, "unit": "°C", "status": "verified" }
    },
    "capabilities": [
      { "id": "selectable", "state": "implemented" },
      { "id": "translatable", "state": "implemented" },
      { "id": "rotatable", "state": "implemented" },
      { "id": "readScale", "state": "implemented" },
      { "id": "weighObject", "state": "implemented" }
    ],
    "behaviorIds": ["bhv-core-spatial"],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Vật lí & Nhiệt học",
      "authorRole": "Giáo viên KHTN",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-11-12",
      "updatedAt": "2026-11-14",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-ICE-0001",
    "slug": "khay-nuoc-da-vien-thi-nghiem-0c",
    "name": {
      "vi": "Nước đá viên thí nghiệm (-10°C → 0°C, 100 g)",
      "en": "Laboratory Ice Cubes Specimen (-10°C to 0°C, 100 g)"
    },
    "kind": "specimen",
    "subject": "physics",
    "category": "thermal-equipment",
    "categoryIds": ["thermal-equipment", "solid-specimens"],
    "equipmentGroupG": "G05",
    "physicsFidelityLevel": "L3",
    "tags": ["nuoc-da", "da-vien", "nong-chay", "nhiet-hoc", "0-do-c"],
    "summary": "Các viên nước đá tinh thể trong suốt ở nhiệt độ dưới 0°C (-10°C → 0°C, khối lượng 100 g, nhiệt nóng chảy riêng λ = 334 J/g). Kéo thả trực tiếp vào Bình đựng / Cốc thủy tinh để thực hiện thí nghiệm đun nóng chảy và đun sôi nước đá.",
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/ice-cubes-tray@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "ice-cubes-tray",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": { "width": 0.086, "height": 0.054, "depth": 0.086 },
      "dimensions": {
        "height": { "value": 54, "unit": "mm", "status": "verified" },
        "widthOrDiameter": { "value": 86, "unit": "mm", "status": "verified" }
      },
      "triangleCount": 1840,
      "materialCount": 3,
      "namedNodes": [
        { "nodeName": "root", "role": "root", "description": "Tâm đáy khay chứa nước đá" },
        { "nodeName": "body", "role": "body", "description": "Khay thủy tinh và các viên nước đá trong suốt" }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": { "value": "Tinh thể Nước đá tinh khiết H₂O(rắn), ρ = 0.917 g/cm³", "status": "verified" },
      "referenceMass": { "value": 100, "unit": "g", "status": "verified" },
      "referenceVolume": { "value": 109, "unit": "cm³", "status": "verified" }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": false,
      "measuredQuantity": "temperature",
      "rangeMin": { "value": -10, "unit": "°C", "status": "verified" },
      "rangeMax": { "value": 0, "unit": "°C", "status": "verified" }
    },
    "capabilities": [
      { "id": "selectable", "state": "implemented" },
      { "id": "translatable", "state": "implemented" },
      { "id": "rotatable", "state": "implemented" },
      { "id": "weighObject", "state": "implemented" }
    ],
    "behaviorIds": ["bhv-core-spatial"],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Vật lí & Nhiệt học",
      "authorRole": "Giáo viên KHTN",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-11-12",
      "updatedAt": "2026-11-14",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-TRP-0001",
    "slug": "kieng-sat-3-chan-kem-luoi-tan-nhiet-amiang",
    "name": {
      "vi": "Kiềng sắt 3 chân & Lưới tản nhiệt Amiăng (Độc lập)",
      "en": "Laboratory Tripod Stand & Ceramic Wire Gauze (Standalone)"
    },
    "kind": "equipment",
    "subject": "physics",
    "category": "thermal-equipment",
    "categoryIds": ["thermal-equipment", "support-hardware"],
    "equipmentGroupG": "G05",
    "physicsFidelityLevel": "L2",
    "tags": ["kieng-3-chan", "luoi-tan-nhiet", "amiang", "dun-nong", "den-con"],
    "summary": "Kiềng đun 3 chân bằng thép chịu nhiệt kèm tấm lưới thép phủ tâm sứ tản nhiệt đều (dụng cụ độc lập, chiều cao 125 mm). Đặt Đèn cồn ở dưới gầm kiềng và đặt Bình đựng nước đá / Cốc thủy tinh lên mặt lưới phía trên.",
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/tripod-wire-gauze@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "tripod-wire-gauze",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": { "width": 0.115, "height": 0.128, "depth": 0.115 },
      "dimensions": {
        "height": { "value": 128, "unit": "mm", "status": "verified" },
        "widthOrDiameter": { "value": 115, "unit": "mm", "status": "verified" }
      },
      "triangleCount": 1920,
      "materialCount": 3,
      "namedNodes": [
        { "nodeName": "root", "role": "root", "description": "Tâm đáy kiềng 3 chân" },
        { "nodeName": "body", "role": "body", "description": "Vòng kiềng thép 3 chân và lưới tản nhiệt tâm sứ" }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": { "value": "Thép sơn tĩnh điện chịu nhiệt & Lưới thép tâm gốm Ceramic", "status": "verified" },
      "referenceMass": { "value": 320, "unit": "g", "status": "verified" },
      "temperatureRating": { "value": 900, "unit": "°C", "status": "verified" }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": false,
      "measuredQuantity": "none"
    },
    "capabilities": [
      { "id": "selectable", "state": "implemented" },
      { "id": "translatable", "state": "implemented" },
      { "id": "rotatable", "state": "implemented" }
    ],
    "behaviorIds": ["bhv-core-spatial"],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Vật lí & Hóa học",
      "authorRole": "Giáo viên KHTN",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-11-12",
      "updatedAt": "2026-11-14",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-PAS-0001",
    "slug": "binh-thong-nhau-pittong-thuy-luc-pascal-hinh-16-3",
    "name": {
      "vi": "Bình thông nhau & Pit-tông thủy lực Pascal (S₁ = 2·S₂ — Hình 16.3)",
      "en": "Pascal Hydraulic Press & Communicating Cylinders (S₁ = 2·S₂ — Fig 16.3)"
    },
    "kind": "equipment",
    "subject": "physics",
    "category": "force-measurement",
    "categoryIds": ["force-measurement", "measuring-instrument", "laboratory-glassware"],
    "equipmentGroupG": "G08",
    "physicsFidelityLevel": "L3",
    "tags": ["ap-suat-chat-long", "dinh-luat-pascal", "may-nen-thuy-luc", "pittong", "hinh-16-3"],
    "summary": "Thiết bị thí nghiệm Sự truyền áp suất chất lỏng (Hình 16.3 SGK KHTN): gồm 2 nhánh bình thông nhau trong suốt có tiết diện S₁ = 2·S₂ (S₁ = 20 cm², S₂ = 10 cm²), thước chia vạch cm (-5..h₀..+5 cm), vòng chuẩn cân bằng h₀, 2 pit-tông kín khít có gioăng cao su O-ring, véc-tơ truyền áp suất Pascal mọi phương và bộ 8 quả nặng chuẩn P₀ = 1.0 N (100 g).",
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/pascal-hydraulic-press@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "pascal-hydraulic-press",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": { "width": 0.29, "height": 0.25, "depth": 0.19 },
      "dimensions": {
        "height": { "value": 250, "unit": "mm", "status": "verified" },
        "widthOrDiameter": { "value": 290, "unit": "mm", "status": "verified" },
        "depth": { "value": 190, "unit": "mm", "status": "verified" }
      },
      "triangleCount": 6840,
      "materialCount": 8,
      "namedNodes": [
        { "nodeName": "root", "role": "root", "description": "Tâm chân đế thiết bị thủy lực Pascal" },
        { "nodeName": "body", "role": "body", "description": "2 nhánh xi-lanh thủy tinh S₁ = 2·S₂, ống nối đáy và bệ đỡ" },
        { "nodeName": "liquid_surface", "role": "liquid_surface", "description": "Cột chất lỏng thủy lực và véc-tơ truyền áp suất Pascal" },
        { "nodeName": "plunger", "role": "plunger", "description": "Pit-tông 1 (S₁) và Pit-tông 2 (S₂) dịch chuyển theo chênh lệch áp suất" },
        { "nodeName": "scale_display", "role": "scale_display", "description": "Bảng thông số áp suất p₁, p₂ và độ dịch chuyển Δh₁, Δh₂" }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": { "value": "Thủy tinh quang học Borosilicate, Thép CNC, Đồng thau & Gioăng Nitrile", "status": "verified" },
      "referenceMass": { "value": 1450, "unit": "g", "status": "verified" },
      "capacity": { "value": 300, "unit": "ml", "status": "verified" }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": true,
      "measuredQuantity": "pressure",
      "rangeMin": { "value": -5, "unit": "cm", "status": "verified" },
      "rangeMax": { "value": 5, "unit": "cm", "status": "verified" },
      "leastCount": { "value": 0.2, "unit": "cm", "status": "verified" },
      "zeroOffsetSupported": true
    },
    "capabilities": [
      { "id": "selectable", "state": "implemented" },
      { "id": "translatable", "state": "implemented" },
      { "id": "rotatable", "state": "implemented" },
      { "id": "readScale", "state": "implemented" },
      { "id": "measureForce", "state": "implemented" }
    ],
    "behaviorIds": ["bhv-core-spatial", "bhv-scale-reading"],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Vật lí & KHTN",
      "authorRole": "Giáo viên KHTN",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-11-14",
      "updatedAt": "2026-11-14",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-PWT-0001",
    "slug": "qua-nang-chuan-pascal-100g-1n",
    "name": {
      "vi": "Quả nặng chuẩn Pascal 100 g (P₀ = 1.0 N — Hình 16.3)",
      "en": "Pascal Standard Slotted Weight 100 g (P₀ = 1.0 N)"
    },
    "kind": "specimen",
    "subject": "physics",
    "category": "solid-specimens",
    "categoryIds": ["solid-specimens", "mass-measurement", "force-measurement"],
    "equipmentGroupG": "G02",
    "physicsFidelityLevel": "L3",
    "tags": ["qua-nang", "100g", "1n", "pascal", "pittong", "hinh-16-3"],
    "summary": "Quả nặng chuẩn bằng thép mạ đồng 100 g (trọng lượng P₀ = 1.0 N) có núm cầm phía trên và khắc chỉ số 100g · 1.0N. Dùng để kéo đặt trực tiếp lên đĩa Pit-tông (1) hoặc Pit-tông (2) của Bình thông nhau thủy lực Pascal (Hình 16.3 SGK KHTN), hoặc đặt lên Cân điện tử.",
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/pascal-weight-100g@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "pascal-weight-100g",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": { "width": 0.036, "height": 0.032, "depth": 0.036 },
      "dimensions": {
        "height": { "value": 32, "unit": "mm", "status": "verified" },
        "widthOrDiameter": { "value": 36, "unit": "mm", "status": "verified" }
      },
      "triangleCount": 960,
      "materialCount": 3,
      "namedNodes": [
        { "nodeName": "root", "role": "root", "description": "Tâm đáy quả nặng 100 g" },
        { "nodeName": "body", "role": "body", "description": "Thân trụ quả nặng thép mạ đồng khắc 100g · 1.0N và núm cầm" }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": { "value": "Thép hợp kim mạ đồng chuẩn đo lường (P₀ = 1.0 N)", "status": "verified" },
      "referenceMass": { "value": 100, "unit": "g", "status": "verified" },
      "referenceVolume": { "value": 12.8, "unit": "cm³", "status": "verified" },
      "density": { "value": 7.81, "unit": "g/cm³", "status": "verified" }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": false,
      "measuredQuantity": "mass"
    },
    "capabilities": [
      { "id": "selectable", "state": "implemented" },
      { "id": "translatable", "state": "implemented" },
      { "id": "rotatable", "state": "implemented" },
      { "id": "weighObject", "state": "implemented" },
      { "id": "displacementVolume", "state": "implemented" },
      { "id": "measureForce", "state": "implemented" }
    ],
    "behaviorIds": ["bhv-core-spatial", "bhv-mass-weighing", "bhv-archimedes-displacement"],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Vật lí & KHTN",
      "authorRole": "Giáo viên KHTN",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-11-14",
      "updatedAt": "2026-11-14",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-NAOH-0001",
    "slug": "lo-dung-dich-naoh-01m-400ml",
    "name": {
      "vi": "Lọ Thủy Tinh Trong Suốt Schott Duran 400 ml — Dung dịch NaOH 0,1M (300 ml)",
      "en": "Schott Duran 400 ml Clear Reagent Bottle — 0.1 M NaOH Solution (300 ml)"
    },
    "kind": "equipment",
    "subject": "chemistry",
    "category": "chemical-apparatus",
    "categoryIds": ["chemical-apparatus", "laboratory-glassware", "volume-measurement"],
    "equipmentGroupG": "G05",
    "physicsFidelityLevel": "L3",
    "materialCategory": "borosilicate-glass",
    "tags": ["naoh", "natri-hidroxit", "schott-duran", "400ml", "300ml", "0.1m", "bazo-manh", "kiem"],
    "summary": "Lọ thủy tinh Borosilicate 3.3 trong suốt Schott Duran 400 ml có nắp vặn nhựa xanh dương GL45 chống kẹt, vạch chia 50–400 ml, chứa 300 ml dung dịch Natri Hiđroxit (NaOH 0,1M • pH = 13,0 • n = 0,03 mol • m = 1,20 g) kèm cốc thử 3D mô phỏng 6 tính chất hóa học của bazơ mạnh.",
    "textbookRef": {
      "bookTitle": "Khoa học tự nhiên 8 & 9 — Kết nối tri thức với cuộc sống",
      "chapter": "Chương II — Hợp chất vô cơ (Base & Muối)",
      "lesson": "Bài 9: Base — Thang pH & Tính chất hóa học của NaOH",
      "standardFunction": "Lưu trữ dung dịch kiềm chuẩn NaOH 0,1M (tránh CO₂ không khí) và khảo sát 6 tính chất hóa học của bazơ kiềm mạnh.",
      "usageGuidelines": "Điều chỉnh thể tích (0–400 ml, chuẩn 300 ml), đóng/mở nắp xanh GL45, nghiêng lọ hoặc chọn từng phản ứng hóa học (Phenolphtalein, Quỳ tím, HCl/H₂SO₄, CO₂/SO₂, Cu(NO₃)₂, Cl₂, Al, Al(OH)₃) để quan sát hiện tượng 3D.",
      "safetyNote": "Dung dịch NaOH ăn mòn da; đậy kín nắp nhựa PP GL45 để tránh hấp thụ CO₂ tạo Na₂CO₃."
    },
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/reagent-bottle-naoh-400@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "reagent-bottle-naoh-400",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": { "width": 0.086, "height": 0.18, "depth": 0.086 },
      "dimensions": {
        "height": { "value": 180, "unit": "mm", "status": "verified" },
        "widthOrDiameter": { "value": 86, "unit": "mm", "status": "verified" },
        "depth": { "value": 86, "unit": "mm", "status": "verified" }
      },
      "triangleCount": 8420,
      "materialCount": 7,
      "namedNodes": [
        { "nodeName": "root", "role": "root", "description": "Tâm đáy lọ thủy tinh Schott Duran 400 ml" },
        { "nodeName": "body", "role": "body", "description": "Thân lọ thủy tinh Borosilicate 3.3 trong suốt hai lớp thành" },
        { "nodeName": "scale_marks", "role": "scale_marks", "description": "Nhãn NaOH 0,1M, logo Schott Duran và vạch chia 50–400 ml (chuẩn 300 ml)" },
        { "nodeName": "liquid_surface", "role": "liquid_surface", "description": "Cột dung dịch NaOH 0,1M không màu kèm mặt khum meniscus và vành chỉ thị" },
        { "nodeName": "handle", "role": "handle", "description": "Nắp vặn nhựa xanh dương Polypropylene GL45 có 44 gờ khía dọc" }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": { "value": "Thủy tinh Borosilicate 3.3 trong suốt & Nắp nhựa PP GL45 chứa dd NaOH 0,1M", "status": "verified" },
      "referenceMass": { "value": 485, "unit": "g", "status": "verified" },
      "capacity": { "value": 400, "unit": "ml", "status": "verified" }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": true,
      "measuredQuantity": "volume",
      "rangeMin": { "value": 50, "unit": "ml", "status": "verified" },
      "rangeMax": { "value": 400, "unit": "ml", "status": "verified" },
      "leastCount": { "value": 25, "unit": "ml", "status": "verified" },
      "zeroOffsetSupported": false,
      "referenceStandard": "ISO 4796-1 · Schott Duran GL45"
    },
    "capabilities": [
      { "id": "selectable", "state": "implemented" },
      { "id": "translatable", "state": "implemented" },
      { "id": "rotatable", "state": "implemented" },
      { "id": "readScale", "state": "implemented" },
      { "id": "weighObject", "state": "implemented" }
    ],
    "behaviorIds": ["bhv-core-spatial", "bhv-scale-reading", "bhv-mass-weighing"],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Hóa học & KHTN",
      "authorRole": "Giáo viên KHTN",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-11-15",
      "updatedAt": "2026-11-15",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-CU-RING-0001",
    "slug": "vong-day-dong-cu-3g",
    "name": {
      "vi": "Mẫu Vòng Dây Đồng (Cu) Nguyên Chất (m = 3,00 g • 0,0469 mol)",
      "en": "Pure Copper Wire Ring Specimen (Cu — 3.00 g, 0.0469 mol)"
    },
    "kind": "specimen",
    "subject": "chemistry",
    "category": "solid-specimens",
    "categoryIds": ["solid-specimens", "chemical-apparatus", "mass-measurement"],
    "equipmentGroupG": "G05",
    "physicsFidelityLevel": "L3",
    "tags": ["dong", "cu", "vong-day-dong", "3g", "kim-loai", "agno3", "hno3", "cuo"],
    "summary": "Mẫu vòng dây đồng nguyên chất (Cu, M = 64) nặng chuẩn m = 3,00 g (n = 0,046875 mol, V = 0,335 cm³, D = 8,96 g/cm³), uốn tròn có mối xoắn gài ở đỉnh. Hỗ trợ mô phỏng 3D đầy đủ các tính chất hóa học: đốt nóng trong O₂ tạo CuO đen (3,75g), Cl₂/S, HCl+O₂, HNO₃ đặc/loãng và nhúng vào 300ml dd AgNO₃ 0,1M tạo tinh thể Bạc Ag↓ (5,28g).",
    "textbookRef": {
      "bookTitle": "Khoa học tự nhiên 9 — Kết nối tri thức với cuộc sống",
      "chapter": "Chương VI — Kim loại & Dãy hoạt động hóa học",
      "lesson": "Bài 18 & 19: Tính chất chung của Kim loại & Dãy hoạt động hóa học (Cu + AgNO₃)",
      "standardFunction": "Mẫu vật kim loại đồng (Cu, M = 64) dùng khảo sát tính khử của kim loại đứng sau H và bài toán định lượng Cu tác dụng với 300 ml dd AgNO₃ 0,1M.",
      "usageGuidelines": "Có thể đặt lên Cân điện tử (3,00 g), hoặc bấm chọn từng phản ứng (O₂, Cl₂/S, HCl+O₂, HNO₃ đặc, HNO₃ loãng, AgNO₃ 0,1M) và kéo thanh tiến trình 0–100% để quan sát sự biến đổi bề mặt và khối lượng.",
      "safetyNote": "Phản ứng giữa Cu và HNO₃ sinh ra khí NO₂ màu nâu đỏ độc hại, cần thực hiện trong tủ hút."
    },
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/copper-wire-ring-3g@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "copper-wire-ring-3g",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": { "width": 0.044, "height": 0.012, "depth": 0.044 },
      "dimensions": {
        "height": { "value": 6, "unit": "mm", "status": "verified" },
        "widthOrDiameter": { "value": 44, "unit": "mm", "status": "verified" },
        "depth": { "value": 44, "unit": "mm", "status": "verified" }
      },
      "triangleCount": 9640,
      "materialCount": 6,
      "namedNodes": [
        { "nodeName": "root", "role": "root", "description": "Tâm đáy mẫu vòng dây đồng 3,00 g" },
        { "nodeName": "body", "role": "body", "description": "Vòng dây đồng đỏ hồng ánh kim kèm mối xoắn gài hai đầu" },
        { "nodeName": "scale_display", "role": "scale_display", "description": "Màn hình LCD cân điện tử tích hợp hiển thị khối lượng chất rắn theo tiến trình phản ứng" }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": { "value": "Đồng nguyên chất điện phân (Cu 99.9% · M = 64)", "status": "verified" },
      "referenceMass": { "value": 3.0, "unit": "g", "status": "verified" },
      "referenceVolume": { "value": 0.335, "unit": "cm³", "status": "verified" },
      "density": { "value": 8.96, "unit": "g/cm³", "status": "verified" }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": false,
      "measuredQuantity": "mass"
    },
    "capabilities": [
      { "id": "selectable", "state": "implemented" },
      { "id": "translatable", "state": "implemented" },
      { "id": "rotatable", "state": "implemented" },
      { "id": "weighObject", "state": "implemented" },
      { "id": "displacementVolume", "state": "implemented" }
    ],
    "behaviorIds": ["bhv-core-spatial", "bhv-mass-weighing", "bhv-archimedes-displacement"],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Hóa học & KHTN",
      "authorRole": "Giáo viên KHTN",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-11-15",
      "updatedAt": "2026-11-15",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-AGNO3-0001",
    "slug": "lo-dung-dich-agno3-01m-400ml",
    "name": {
      "vi": "Lọ Thủy Tinh Nâu Schott Duran 400 ml — Dung dịch AgNO₃ 0,1M (300 ml)",
      "en": "Schott Duran 400 ml Amber Glass Bottle — 0.1 M AgNO₃ Solution (300 ml)"
    },
    "kind": "equipment",
    "subject": "chemistry",
    "category": "chemical-apparatus",
    "categoryIds": ["chemical-apparatus", "laboratory-glassware", "volume-measurement"],
    "equipmentGroupG": "G05",
    "physicsFidelityLevel": "L3",
    "materialCategory": "borosilicate-glass",
    "tags": ["agno3", "bac-nitrat", "lo-thuy-tinh-nau", "schott-duran", "400ml", "300ml", "0.1m", "halide"],
    "summary": "Lọ thủy tinh màu nâu hổ phách (Amber Glass ISO 4796) Schott Duran 400 ml ngăn tia UV phân hủy muối bạc, nắp nhựa xanh GL45, chứa 300 ml dung dịch Bạc Nitrat (AgNO₃ 0,1M • n = 0,03 mol • m ≈ 5,10 g). Hỗ trợ chế độ nhìn xuyên X-Ray và thử tương tác 6 phản ứng hóa học đặc trưng (NaCl, NaBr, NaI, dây đồng Cu, NaOH, chiếu tia UV).",
    "textbookRef": {
      "bookTitle": "Khoa học tự nhiên 9 — Kết nối tri thức với cuộc sống",
      "chapter": "Chương II & Chương VI — Muối & Kim loại",
      "lesson": "Bài 10 & Bài 19: Muối Bạc Nitrat (AgNO₃) & Nhận biết ion Halide",
      "standardFunction": "Bảo quản dung dịch AgNO₃ 0,1M tránh ánh sáng và thực hiện phản ứng nhận biết Cl⁻, Br⁻, I⁻ hoặc phản ứng thế với kim loại Cu.",
      "usageGuidelines": "Điều chỉnh thể tích (0–400 ml, chuẩn 300 ml), bật chế độ X-Ray hoặc kéo thanh độ trong suốt thành lọ nâu, mở/đóng nắp xanh và thử 6 phản ứng hóa học trực quan.",
      "safetyNote": "Bảo quản trong lọ tối màu tránh ánh sáng (2AgNO₃ → 2Ag↓ + 2NO₂↑ + O₂↑); tránh dính vào da vì tạo vết bạc đen."
    },
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/reagent-bottle-agno3-400@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "reagent-bottle-agno3-400",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": { "width": 0.086, "height": 0.18, "depth": 0.086 },
      "dimensions": {
        "height": { "value": 180, "unit": "mm", "status": "verified" },
        "widthOrDiameter": { "value": 86, "unit": "mm", "status": "verified" },
        "depth": { "value": 86, "unit": "mm", "status": "verified" }
      },
      "triangleCount": 8540,
      "materialCount": 7,
      "namedNodes": [
        { "nodeName": "root", "role": "root", "description": "Tâm đáy lọ thủy tinh nâu Schott Duran 400 ml" },
        { "nodeName": "body", "role": "body", "description": "Thân lọ thủy tinh màu nâu hổ phách (Amber Glass) chắn tia UV" },
        { "nodeName": "scale_marks", "role": "scale_marks", "description": "Nhãn AgNO₃ 0,1M, logo Schott Duran men sứ trắng và vạch chia 50–400 ml (chuẩn 300 ml)" },
        { "nodeName": "liquid_surface", "role": "liquid_surface", "description": "Cột dung dịch AgNO₃ 0,1M không màu kèm mặt khum meniscus sáng rõ" },
        { "nodeName": "handle", "role": "handle", "description": "Nắp vặn nhựa xanh dương Polypropylene GL45 có 44 gờ khía dọc" }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": { "value": "Thủy tinh nâu hổ phách Borosilicate 3.3 (ISO 4796) & Nắp nhựa PP GL45 chứa dd AgNO₃ 0,1M", "status": "verified" },
      "referenceMass": { "value": 490, "unit": "g", "status": "verified" },
      "capacity": { "value": 400, "unit": "ml", "status": "verified" }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": true,
      "measuredQuantity": "volume",
      "rangeMin": { "value": 50, "unit": "ml", "status": "verified" },
      "rangeMax": { "value": 400, "unit": "ml", "status": "verified" },
      "leastCount": { "value": 25, "unit": "ml", "status": "verified" },
      "zeroOffsetSupported": false,
      "referenceStandard": "ISO 4796-1 · Schott Duran Amber GL45"
    },
    "capabilities": [
      { "id": "selectable", "state": "implemented" },
      { "id": "translatable", "state": "implemented" },
      { "id": "rotatable", "state": "implemented" },
      { "id": "readScale", "state": "implemented" },
      { "id": "weighObject", "state": "implemented" }
    ],
    "behaviorIds": ["bhv-core-spatial", "bhv-scale-reading", "bhv-mass-weighing"],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed"
    },
    "provenance": {
      "createdBy": "Tổ Hóa học & KHTN",
      "authorRole": "Giáo viên KHTN",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-11-15",
      "updatedAt": "2026-11-15",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-BKR-100",
    "slug": "coc-dong-thuy-tinh-100ml-bomex",
    "name": {
      "vi": "Cốc đong thí nghiệm thủy tinh 100ml (BOMEX Low-Form Glass Beaker)",
      "en": "100ml Low-Form Glass Beaker (BOMEX Borosilicate)"
    },
    "kind": "equipment",
    "subject": "chemistry",
    "category": "laboratory-glassware",
    "categoryIds": ["laboratory-glassware", "chemical-apparatus", "volume-measurement"],
    "equipmentGroupG": "G03",
    "physicsFidelityLevel": "L3",
    "materialCategory": "borosilicate-glass",
    "tags": ["coc-thuy-tinh", "coc-dong-100ml", "bomex", "100ml", "beaker", "borosilicate", "approx"],
    "summary": "Cốc đong thí nghiệm thủy tinh Borosilicate 3.3 trong suốt dáng thấp (Griffin low-form) dung tích 100 ml hiệu BOMEX: đáy phẳng, thành kính dày 1.8 mm (IOR 1.48, Transmission 1.0), vành miệng uốn cong (rolled rim) kèm mỏ rót hình chữ V (V-shaped pouring spout). Mặt trước in mực men trắng nổi nhẹ gồm logo tròn 2 giọt nước cách điệu, chữ 'BOMEX', '100 ml' in đậm, ô viết nhãn chữ nhật nhám mờ (Frosted Patch) ngay dưới '100 ml' và thang chia 20, 40, 60, 80 ml kèm chữ 'APPROX.' dưới '80 ml'.",
    "textbookRef": {
      "bookTitle": "Khoa học tự nhiên 8 & 9 — Kết nối tri thức với cuộc sống",
      "chapter": "Chương I — Dụng cụ thí nghiệm Hóa học & Đo thể tích chất lỏng",
      "lesson": "Bài 1: Giới thiệu một số dụng cụ và hóa chất — Cốc thủy tinh chia độ 100 ml",
      "standardFunction": "Chứa, pha chế, đun nóng hoặc ước lượng thể tích chất lỏng từ 20 ml đến 80 ml (dung tích danh định 100 ml).",
      "usageGuidelines": "Có thể rót chất lỏng qua mỏ rót hình chữ V, hứng nước từ vòi cấp, đặt lên cân điện tử (m = 48 g khi rỗng), nhúng mẫu vật hoặc đun nóng trên kiềng lưới.",
      "safetyNote": "Vạch chia 20–80 ml (APPROX.) dùng để ước lượng thể tích; thủy tinh Borosilicate chịu nhiệt tốt nhưng tránh sốc nhiệt đột ngột."
    },
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/beaker-bomex-100@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "beaker-bomex-100",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": { "width": 0.054, "height": 0.07, "depth": 0.052 },
      "dimensions": {
        "height": { "value": 70, "unit": "mm", "status": "verified", "methodRef": "ISO 3819 / Griffin Low-Form" },
        "widthOrDiameter": { "value": 50, "unit": "mm", "status": "verified", "methodRef": "ISO 3819 (Thành dày 1.8 mm)" },
        "depth": { "value": 50, "unit": "mm", "status": "verified" }
      },
      "triangleCount": 3640,
      "materialCount": 4,
      "namedNodes": [
        { "nodeName": "root", "role": "root", "description": "Tâm đáy phẳng cốc đong thủy tinh 100ml BOMEX" },
        { "nodeName": "body", "role": "body", "description": "Thân trụ thủy tinh Borosilicate dày 1.8mm, vành miệng uốn cong (rolled rim) và mỏ rót chữ V" },
        { "nodeName": "scale_marks", "role": "scale_marks", "description": "Mực in trắng nổi: Logo tròn 2 giọt nước, BOMEX, 100 ml, ô nhám mờ (Frosted Patch) và thang đo 20, 40, 60, 80 ml APPROX." },
        { "nodeName": "liquid_surface", "role": "liquid_surface", "description": "Cột chất lỏng bên trong kèm mặt khum lõm meniscus" }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": { "value": "Thủy tinh Borosilicate 3.3 trong suốt (IOR 1.48 · Transmission 1.0 · Thành dày 1.8 mm)", "status": "verified" },
      "capacity": { "value": 100, "unit": "ml", "uncertainty": 5, "uncertaintyUnit": "ml", "status": "verified" },
      "referenceMass": { "value": 48, "unit": "g", "status": "verified" },
      "temperatureRating": { "value": 400, "unit": "°C", "status": "reported" }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": true,
      "measuredQuantity": "volume",
      "rangeMin": { "value": 20, "unit": "ml", "status": "verified" },
      "rangeMax": { "value": 80, "unit": "ml", "status": "verified" },
      "leastCount": { "value": 10, "unit": "ml", "status": "verified" },
      "zeroOffsetSupported": false,
      "referenceStandard": "ISO 3819 · BOMEX 100 ml APPROX.",
      "calibrationMethod": "Thang chia vạch 20, 40, 60, 80 ml (APPROX.) in men trắng chịu hóa chất."
    },
    "capabilities": [
      { "id": "selectable", "state": "implemented", "behaviorModuleId": "bhv-core-spatial" },
      { "id": "translatable", "state": "implemented", "behaviorModuleId": "bhv-core-spatial" },
      { "id": "rotatable", "state": "implemented", "behaviorModuleId": "bhv-core-spatial" },
      { "id": "showDimensions", "state": "implemented", "behaviorModuleId": "bhv-core-spatial" },
      { "id": "readScale", "state": "implemented", "behaviorModuleId": "bhv-scale-reading" },
      { "id": "weighObject", "state": "implemented", "behaviorModuleId": "bhv-mass-weighing" }
    ],
    "behaviorIds": ["bhv-core-spatial", "bhv-scale-reading", "bhv-mass-weighing"],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed",
      "reviewerNotes": "Đạt chuẩn hình học Quad Smooth-Shaded, thành kính dày 1.8mm, IOR 1.48, đầy đủ logo BOMEX 2 giọt nước, 100 ml, ô viết nhãn nhám mờ và thang đo 20–80 ml APPROX."
    },
    "provenance": {
      "createdBy": "Tổ Hóa học & KHTN",
      "authorRole": "Giáo viên KHTN",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-11-16",
      "updatedAt": "2026-11-16",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-CFD-0001",
    "slug": "loc-mau-va-tan-sac-anh-sang-3d",
    "name": {
      "vi": "Bộ Thí Nghiệm Lọc Màu & Tán Sắc Ánh Sáng 3D",
      "en": "3D Color Filter & Light Dispersion Optical Bench"
    },
    "kind": "equipment",
    "subject": "physics",
    "category": "optical-equipment",
    "categoryIds": ["optical-equipment", "measuring-instrument"],
    "equipmentGroupG": "G06",
    "physicsFidelityLevel": "L3",
    "tags": [
      "loc-mau",
      "tan-sac-anh-sang",
      "lang-kinh",
      "quang-pho",
      "anh-sang-trang",
      "anh-sang-don-sac",
      "khtn-9"
    ],
    "summary": "Bộ thí nghiệm quang học 3D hoàn chỉnh trên giá quang học chia độ cm: Nguồn sáng trắng khe hẹp, Lăng kính thủy tinh quang học (n ≈ 1,65) xoay góc tới 25°–65°, Khung trượt 7 tấm lọc màu quang học (Không lọc, Đỏ, Lục, Lam, Vàng, Xanh lơ, Hồng tím) dịch chuyển linh hoạt TRƯỚC hoặc SAU lăng kính và Màn hứng quang phổ 360° hiển thị dải bước sóng 400–700 nm.",
    "textbookRef": {
      "bookTitle": "SGK Khoa học tự nhiên 9 — Kết nối tri thức với cuộc sống",
      "chapter": "Chương II: Ánh sáng",
      "lesson": "Bài 6 & Bài 7: Khúc xạ ánh sáng — Tán sắc ánh sáng qua lăng kính — Màu sắc của vật",
      "standardFunction": "Tán sắc chùm ánh sáng trắng qua lăng kính thành dải 7 màu liên tục từ Đỏ đến Tím và khảo sát sự truyền qua / hấp thụ ánh sáng của các tấm lọc màu (đặt trước hoặc sau lăng kính).",
      "usageGuidelines": "Bật nguồn sáng trắng, xoay góc tới lăng kính (25°–65°), chọn lần lượt các tấm lọc Đỏ/Lục/Lam/Vàng/Lơ/Hồng tím và đổi vị trí Trước/Sau lăng kính để kiểm chứng ánh sáng đơn sắc không bị tán sắc.",
      "safetyNote": "Không nhìn trực diện vào khe phát sáng cường độ cao của đèn chiếu quang học."
    },
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/color-filter-dispersion@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "color-filter-dispersion",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": { "width": 0.38, "height": 0.175, "depth": 0.165 },
      "dimensions": {
        "height": { "value": 175, "unit": "mm", "status": "verified" },
        "widthOrDiameter": { "value": 380, "unit": "mm", "status": "verified" },
        "depth": { "value": 165, "unit": "mm", "status": "verified" }
      },
      "triangleCount": 5420,
      "materialCount": 9,
      "namedNodes": [
        { "nodeName": "root", "role": "root", "description": "Tâm đáy giá quang học Lọc màu & Tán sắc" },
        { "nodeName": "body", "role": "body", "description": "Đế quang học chia độ cm, nguồn đèn khe hẹp và khung trượt tấm lọc" },
        { "nodeName": "lens_element", "role": "lens_element", "description": "Lăng kính thủy tinh quang học SF11 trên bàn xoay chia độ" },
        { "nodeName": "scale_display", "role": "scale_display", "description": "Màn hứng quang phổ 380–760 nm hiển thị 2 mặt 360°" }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": { "value": "Nhôm Anodized, Đồng thau CNC, Thủy tinh quang học Flint SF11 (n ≈ 1,65) & Kính lọc màu quang học", "status": "verified" },
      "referenceMass": { "value": 1280, "unit": "g", "status": "verified" }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": true,
      "measuredQuantity": "refraction-angle",
      "rangeMin": { "value": 25, "unit": "°", "status": "verified" },
      "rangeMax": { "value": 65, "unit": "°", "status": "verified" },
      "leastCount": { "value": 1, "unit": "°", "status": "verified" },
      "zeroOffsetSupported": false
    },
    "capabilities": [
      { "id": "selectable", "state": "implemented", "behaviorModuleId": "bhv-core-spatial" },
      { "id": "translatable", "state": "implemented", "behaviorModuleId": "bhv-core-spatial" },
      { "id": "rotatable", "state": "implemented", "behaviorModuleId": "bhv-core-spatial" },
      { "id": "showDimensions", "state": "implemented", "behaviorModuleId": "bhv-core-spatial" },
      { "id": "opticalFocus", "state": "implemented", "behaviorModuleId": "bhv-optical-focal" }
    ],
    "behaviorIds": ["bhv-core-spatial", "bhv-optical-focal"],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed",
      "reviewerNotes": "Đạt chuẩn quang học KHTN 9: đầy đủ 7 dải quang phổ liên tục (400–680 nm), 7 chế độ tấm lọc (Trắng/R/G/B/Y/C/M), trượt mượt vị trí trước/sau lăng kính và màn hứng quang phổ 360°."
    },
    "provenance": {
      "createdBy": "Tổ Vật lí & Quang học",
      "authorRole": "Giáo viên KHTN",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-11-20",
      "updatedAt": "2026-11-20",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  },
  {
    "assetId": "OL3D-EQP-OXY-0001",
    "slug": "thanh-phan-the-tich-oxygen-trong-khong-khi-3d",
    "name": {
      "vi": "Bộ Thí Nghiệm Thành Phần Thể Tích Oxygen Trong Không Khí 3D",
      "en": "3D Oxygen Volume Fraction in Air Experiment Apparatus"
    },
    "kind": "equipment",
    "subject": "chemistry",
    "category": "chemical-apparatus",
    "categoryIds": ["chemical-apparatus", "laboratory-glassware", "volume-measurement"],
    "equipmentGroupG": "G05",
    "physicsFidelityLevel": "L3",
    "tags": [
      "oxygen",
      "khong-khi",
      "thanh-phan-the-tich",
      "21-phan-tram",
      "nen-chay",
      "phot-pho-do",
      "ong-chia-5-vach",
      "khtn-6"
    ],
    "summary": "Bộ thí nghiệm 3D xác định thành phần phần trăm thể tích khí Oxygen (~21% ≈ 1/5) trong không khí chuẩn SGK KHTN 6: Chậu thủy tinh chứa nước chỉ thị (Xanh lam / Đỏ), Đế sứ đốt Nến Parafin hoặc Phốt pho đỏ (4P + 5O₂ → 2P₂O₅), Ống thủy tinh chia 5 vạch bằng nhau (0–5) trượt mượt trên giá dẫn hướng, mô phỏng ngọn lửa tắt dần, khói trắng, bọt khí, mực nước kèm mặt khum dâng lên vạch 1, chế độ X-Ray phân tử O₂/N₂ và màn hình LCD đọc trực tiếp theo thời gian thực.",
    "textbookRef": {
      "bookTitle": "SGK Khoa học tự nhiên 6 — Kết nối tri thức với cuộc sống",
      "chapter": "Chương III: Oxygen và không khí",
      "lesson": "Bài 10: Không khí và bảo vệ môi trường không khí",
      "standardFunction": "Chứng minh không khí là hỗn hợp khí trong đó khí Oxygen chiếm khoảng 1/5 (≈ 21%) thể tích, phần còn lại chủ yếu là khí Nitrogen (≈ 78%) và các khí khác (≈ 1%).",
      "usageGuidelines": "Bước 1: Châm lửa đốt nến (hoặc chuyển sang chế độ Phốt pho đỏ). Bước 2: Bấm 'Úp ống chia vạch' để ống thủy tinh hạ xuống bịt kín cột khí trên mặt nước. Quan sát ngọn lửa yếu dần rồi tắt hẳn, nước dâng lên khoảng vạch số 1 (1/5 cột khí) và bật chế độ Phân tử O₂/N₂ để giải thích nguyên nhân.",
      "safetyNote": "Trong phòng thí nghiệm thực tế, luôn cẩn thận với ngọn lửa nến/phốt pho đỏ và không chạm tay vào thành ống thủy tinh khi đang nóng."
    },
    "assetVersion": "1.0.0",
    "manifestSchemaVersion": "1.0.0",
    "moduleApiVersion": "1.0.0",
    "geometry": {
      "modelFormat": "PROCEDURAL_PBR",
      "modelUri": "procedural://openlab3d/oxygen-air-volume@1.0.0",
      "modelFileVersion": "1.0.0",
      "proceduralArchetype": "oxygen-air-volume",
      "upAxis": "Y",
      "anchor": "base-center",
      "boundingBoxM": { "width": 0.285, "height": 0.39, "depth": 0.22 },
      "dimensions": {
        "height": { "value": 390, "unit": "mm", "status": "verified" },
        "widthOrDiameter": { "value": 285, "unit": "mm", "status": "verified" },
        "depth": { "value": 220, "unit": "mm", "status": "verified" }
      },
      "triangleCount": 6180,
      "materialCount": 11,
      "namedNodes": [
        { "nodeName": "root", "role": "root", "description": "Tâm đáy đế thí nghiệm đo thể tích Oxygen trong không khí" },
        { "nodeName": "body", "role": "body", "description": "Đế thí nghiệm kim loại, chậu thủy tinh nước chỉ thị, giá dẫn hướng và bệ nến/bát sứ P đỏ" },
        { "nodeName": "scale_marks", "role": "scale_marks", "description": "Ống thủy tinh Borosilicate chia 5 phần thể tích bằng nhau (vạch 0 đến 5)" },
        { "nodeName": "liquid_surface", "role": "liquid_surface", "description": "Cột nước chỉ thị kèm mặt khum lõm dâng lên vạch 1 (≈ 21%)" },
        { "nodeName": "scale_display", "role": "scale_display", "description": "Bảng LCD kỹ thuật số hiển thị %O₂, %N₂, vạch nước và tiến trình phản ứng" }
      ],
      "scaleValidation": "verified"
    },
    "scientificProperties": {
      "material": { "value": "Thủy tinh Borosilicate 3.3, Sứ thí nghiệm, Parafin / Phốt pho đỏ, Thép không gỉ & Nhôm Anodized", "status": "verified" },
      "referenceMass": { "value": 980, "unit": "g", "status": "verified" },
      "capacity": { "value": 500, "unit": "ml", "status": "verified" }
    },
    "measurementMetadata": {
      "isMeasuringInstrument": true,
      "measuredQuantity": "volume",
      "rangeMin": { "value": 0, "unit": "vạch (0%)", "status": "verified" },
      "rangeMax": { "value": 5, "unit": "vạch (100%)", "status": "verified" },
      "leastCount": { "value": 0.2, "unit": "vạch (4%)", "status": "verified" },
      "zeroOffsetSupported": false
    },
    "capabilities": [
      { "id": "selectable", "state": "implemented", "behaviorModuleId": "bhv-core-spatial" },
      { "id": "translatable", "state": "implemented", "behaviorModuleId": "bhv-core-spatial" },
      { "id": "rotatable", "state": "implemented", "behaviorModuleId": "bhv-core-spatial" },
      { "id": "showDimensions", "state": "implemented", "behaviorModuleId": "bhv-core-spatial" },
      { "id": "readScale", "state": "implemented", "behaviorModuleId": "bhv-core-spatial" }
    ],
    "behaviorIds": ["bhv-core-spatial"],
    "validation": {
      "assetReviewStatus": "published",
      "geometryStatus": "verified",
      "metrologyStatus": "verified",
      "behaviorStatus": "implemented",
      "safetyStatus": "reviewed",
      "reviewerNotes": "Đạt chuẩn SGK KHTN 6: đầy đủ 2 chế độ Nến Parafin & Phốt pho đỏ, ống chia 5 phần rõ nét 360°, ngọn lửa tắt dần khi cạn O₂, khói P₂O₅, cột nước kèm mặt khum dâng lên vạch 1 (~21%), mô phỏng phân tử O₂/N₂ 3D và màn hình LCD thời gian thực."
    },
    "provenance": {
      "createdBy": "Tổ Hóa học & KHTN THCS",
      "authorRole": "Giáo viên KHTN",
      "organization": "OpenLab Vietnam",
      "sourceType": "manufacturer-spec",
      "createdAt": "2026-11-21",
      "updatedAt": "2026-11-21",
      "license": "CC BY-NC-SA 4.0",
      "redistributionAllowed": true
    }
  }
];

export const MOCK_EQUIPMENT_KITS: EquipmentKit[] = [
  {
    "kitId": "OL3D-KIT-CHEM-CU-AGNO3-NAOH",
    "kitVersion": "1.0.0",
    "name": {
      "vi": "Bộ Hóa chất & Dụng cụ 3D: Cốc đong 100ml BOMEX, Lọ NaOH 0,1M, Lọ AgNO₃ 0,1M & Vòng Dây Đồng Cu (3,00g)",
      "en": "3D Chemistry Set: 100ml BOMEX Beaker, NaOH 0.1M, Amber AgNO₃ 0.1M & Pure Copper Wire Ring (3.00g)"
    },
    "subject": "chemistry",
    "purpose": "Khảo sát trực quan 3D cốc đong thí nghiệm thủy tinh 100ml BOMEX, cấu tạo lọ hóa chất Schott Duran 400ml (chứa chuẩn 300ml dung dịch NaOH 0,1M và AgNO₃ 0,1M), mẫu vòng dây đồng Cu nặng 3,00g (0,0469 mol) và thực hành các phản ứng hóa học đặc trưng.",
    "categoryIds": ["chemical-apparatus", "laboratory-glassware", "solid-specimens", "volume-measurement"],
    "publicationStatus": "published",
    "verificationStatus": "verified",
    "items": [
      { "assetId": "OL3D-EQP-BKR-100", "assetVersion": "1.0.0", "quantity": 1, "role": "Cốc đong thí nghiệm thủy tinh 100 ml (BOMEX Low-Form Glass Beaker)", "optional": false },
      { "assetId": "OL3D-EQP-NAOH-0001", "assetVersion": "1.0.0", "quantity": 1, "role": "Lọ thủy tinh trong suốt Schott Duran 400 ml chứa 300 ml dd NaOH 0,1M (pH = 13,0)", "optional": false },
      { "assetId": "OL3D-EQP-CU-RING-0001", "assetVersion": "1.0.0", "quantity": 1, "role": "Mẫu vòng dây đồng nguyên chất Cu (m = 3,00 g • n = 0,0469 mol)", "optional": false },
      { "assetId": "OL3D-EQP-AGNO3-0001", "assetVersion": "1.0.0", "quantity": 1, "role": "Lọ thủy tinh nâu Schott Duran 400 ml chứa 300 ml dd AgNO₃ 0,1M", "optional": false }
    ]
  },
  {
    "kitId": "OL3D-KIT-PASCAL-0001",
    "kitVersion": "1.0.0",
    "name": {
      "vi": "Bộ thí nghiệm Sự truyền áp suất chất lỏng & Máy nén thủy lực Pascal (Hình 16.3 SGK KHTN)",
      "en": "Pascal's Law & Hydraulic Press Experiment Kit (Fig 16.3)"
    },
    "subject": "physics",
    "purpose": "Khảo sát nguyên lý truyền áp suất trong lòng chất lỏng theo mọi phương (Định luật Pascal) và điều kiện cân bằng của máy nén thủy lực S₁ = 2·S₂: F₂ / F₁ = S₂ / S₁ = 1 / 2 (khi đặt 4 quả nặng bên nhánh S₁ thì cần 2 quả nặng bên nhánh S₂ để hai mặt chất lỏng trở về cùng vạch chuẩn h₀).",
    "categoryIds": ["force-measurement", "measuring-instrument", "solid-specimens"],
    "publicationStatus": "published",
    "verificationStatus": "verified",
    "items": [
      { "assetId": "OL3D-EQP-PAS-0001", "assetVersion": "1.0.0", "quantity": 1, "role": "Bình thông nhau 2 nhánh S₁ = 2·S₂ kèm 2 Pit-tông thủy lực và 8 quả nặng trên khay", "optional": false },
      { "assetId": "OL3D-EQP-PWT-0001", "assetVersion": "1.0.0", "quantity": 4, "role": "Quả nặng chuẩn 100 g (P₀ = 1.0 N) rời để kéo thả lên đĩa Pit-tông (1) hoặc Pit-tông (2)", "optional": false }
    ]
  },
  {
    "kitId": "OL3D-KIT-THERMAL-ICE-0001",
    "kitVersion": "1.0.0",
    "name": {
      "vi": "Bộ thí nghiệm Đun nóng chảy & Đun sôi Nước đá (Từng dụng cụ rời: Đèn cồn, Bình đựng, Nước đá, Kiềng lưới, Nhiệt kế, Đồng hồ)",
      "en": "Ice Melting & Boiling Phase-Change Modular Kit (Burner, Vessel, Ice Cubes, Tripod, Thermometer, Stopwatch)"
    },
    "subject": "physics",
    "purpose": "Khảo sát sự chuyển thể của nước đá từ rắn sang lỏng (nóng chảy ở 0°C) và từ lỏng sang hơi (sôi ở 100°C) bằng từng dụng cụ độc lập: cho Nước đá vào Bình đựng, đặt lên Kiềng 3 chân & Lưới tản nhiệt, đốt Đèn cồn bên dưới và cắm Nhiệt kế theo dõi.",
    "categoryIds": ["thermal-equipment", "laboratory-glassware", "measuring-instrument"],
    "publicationStatus": "published",
    "verificationStatus": "verified",
    "items": [
      { "assetId": "OL3D-EQP-ALC-0001", "assetVersion": "1.0.0", "quantity": 1, "role": "Đèn cồn thủy tinh 150 ml (bật/tắt ngọn lửa đun nóng)", "optional": false },
      { "assetId": "OL3D-EQP-TRP-0001", "assetVersion": "1.0.0", "quantity": 1, "role": "Kiềng sắt 3 chân & Lưới tản nhiệt đặt trên đèn cồn", "optional": false },
      { "assetId": "OL3D-EQP-THV-0001", "assetVersion": "1.0.0", "quantity": 1, "role": "Bình thủy tinh chịu nhiệt 250 ml đựng nước đá và nước đun sôi", "optional": false },
      { "assetId": "OL3D-EQP-ICE-0001", "assetVersion": "1.0.0", "quantity": 1, "role": "Khay Nước đá viên (-10°C → 0°C) để kéo thả vào bình đựng", "optional": false },
      { "assetId": "OL3D-EQP-THM-0001", "assetVersion": "1.1.0", "quantity": 1, "role": "Nhiệt kế phòng thí nghiệm (-10°C → 110°C) cắm vào bình đo nhiệt độ", "optional": false },
      { "assetId": "OL3D-EQP-STW-0001", "assetVersion": "1.0.0", "quantity": 1, "role": "Đồng hồ bấm giây theo dõi thời gian nóng chảy và sôi", "optional": true }
    ]
  },
  {
    "kitId": "OL3D-KIT-DC-CIRCUIT-0001",
    "kitVersion": "1.0.0",
    "name": {
      "vi": "Bộ dụng cụ Mạch điện một chiều nối tiếp 3D (Pin, Cầu dao K, Biến trở 20Ω, Đèn 126, Ampe kế & Vôn kế)",
      "en": "3D DC Series Circuit Lab Kit (Battery Holder, Switch K, 20Ω Rheostat, Bulb 126, Ammeter & Voltmeter)"
    },
    "subject": "physics",
    "purpose": "Thực hành lắp mạch điện một chiều, nối dây qua đúng từng cọc cắm (terminals), đo cường độ dòng điện bằng Ampe kế, đo hiệu điện thế bằng Vôn kế và kiểm chứng Định luật Ohm.",
    "categoryIds": ["electrical-equipment", "measuring-instrument"],
    "publicationStatus": "published",
    "verificationStatus": "verified",
    "items": [
      { "assetId": "OL3D-EQP-DC-HOLDER-0001", "assetVersion": "1.0.0", "quantity": 1, "role": "Giá đỡ 2 Pin đại (4 cọc BAT1_POS, BAT1_NEG, BAT2_NEG, BAT2_POS)", "optional": false },
      { "assetId": "OL3D-EQP-DC-BAT-0001", "assetVersion": "1.0.0", "quantity": 2, "role": "Viên Pin đại Con Ó 1.5V lắp vào 2 khay", "optional": false },
      { "assetId": "OL3D-EQP-DC-SWITCH-0001", "assetVersion": "1.0.0", "quantity": 1, "role": "Cầu dao đơn K (SW_RED, SW_GREEN)", "optional": false },
      { "assetId": "OL3D-EQP-DC-RHEO-0001", "assetVersion": "1.0.0", "quantity": 1, "role": "Biến trở con chạy 20Ω (RHEO_IN, RHEO_COIL_END, RHEO_WIPER)", "optional": false },
      { "assetId": "OL3D-EQP-DC-AMM-0001", "assetVersion": "1.0.0", "quantity": 1, "role": "Ampe kế DC (AM_NEG, AM_06A, AM_3A)", "optional": false },
      { "assetId": "OL3D-EQP-DC-BULB-0001", "assetVersion": "1.0.0", "quantity": 1, "role": "Bóng đèn dây tóc 126 (R = 8.5Ω)", "optional": false },
      { "assetId": "OL3D-EQP-DC-VOLT-0001", "assetVersion": "1.0.0", "quantity": 1, "role": "Vôn kế DC (VM_NEG, VM_6V, VM_12V)", "optional": false }
    ]
  },
  {
    "kitId": "OL3D-KIT-DENSITY-0001",
    "kitVersion": "1.1.0",
    "name": {
      "vi": "Bộ thí nghiệm đo khối lượng riêng của vật rắn",
      "en": "Solid Density Measurement Kit"
    },
    "subject": "physics",
    "purpose": "Xác định khối lượng riêng ρ = m / V của vật rắn hình học đều và không đều bằng cân điện tử, ống đong, bình tràn và thước cặp.",
    "categoryIds": [
      "mass-measurement",
      "volume-measurement",
      "solid-specimens",
      "length-measurement"
    ],
    "publicationStatus": "published",
    "verificationStatus": "partially-verified",
    "items": [
      {
        "assetId": "OL3D-EQP-BAL-0001",
        "assetVersion": "1.2.0",
        "quantity": 1,
        "role": "Đo khối lượng mẫu vật m (g)",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-CYL-0001",
        "assetVersion": "1.1.0",
        "quantity": 1,
        "role": "Đo thể tích nước dời chỗ V (ml = cm³)",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-OVF-0001",
        "assetVersion": "1.0.0",
        "quantity": 1,
        "role": "Bình tràn cho mẫu vật lớn hơn miệng ống đong",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-BKR-0001",
        "assetVersion": "1.0.2",
        "quantity": 1,
        "role": "Chứa nước tiếp thêm hoặc hứng nước tràn",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-SLD-0001",
        "assetVersion": "1.0.0",
        "quantity": 1,
        "role": "Mẫu vật rắn hình trụ nhôm",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-BLK-0001",
        "assetVersion": "1.0.0",
        "quantity": 1,
        "role": "Mẫu vật rắn hình hộp đồng thau",
        "optional": true
      },
      {
        "assetId": "OL3D-EQP-CAL-0001",
        "assetVersion": "1.1.0",
        "quantity": 1,
        "role": "Đo kích thước hình học kiểm chứng thể tích",
        "optional": true
      }
    ]
  },
  {
    "kitId": "OL3D-KIT-OPTICS-KHTN9",
    "kitVersion": "1.1.0",
    "name": {
      "vi": "Bộ thí nghiệm Quang học KHTN 9 (Khúc xạ, Phản xạ toàn phần, Lăng kính & Thấu kính)",
      "en": "Grade 9 Optics Complete Kit (Refraction, Prism, Lens & Magnifier)"
    },
    "subject": "physics",
    "purpose": "Thực hiện đầy đủ các thí nghiệm Chương II SGK KHTN 9 (Bài 5 đến Bài 10): Khúc xạ ánh sáng, Phản xạ toàn phần, Tán sắc qua lăng kính, Đo tiêu cự thấu kính hội tụ và Kính lúp.",
    "categoryIds": [
      "optical-equipment",
      "length-measurement"
    ],
    "publicationStatus": "published",
    "verificationStatus": "verified",
    "items": [
      {
        "assetId": "OL3D-EQP-LSR-0001",
        "assetVersion": "1.1.0",
        "quantity": 1,
        "role": "Nguồn phát chùm tia sáng hẹp / 3 tia laser (Hình 1.1)",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-SLB-0001",
        "assetVersion": "1.1.0",
        "quantity": 1,
        "role": "Bản bán trụ thuỷ tinh và bảng chia độ 360° (Hình 1.2, Bài 5, 6)",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-PRM-0001",
        "assetVersion": "1.0.0",
        "quantity": 1,
        "role": "Lăng kính tam giác tạo quang phổ ánh sáng trắng (Bài 7)",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-OPT-0001",
        "assetVersion": "0.9.0",
        "quantity": 1,
        "role": "Thấu kính hội tụ f = 100 mm đo tiêu cự (Bài 8, 9)",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-MAG-0001",
        "assetVersion": "1.0.0",
        "quantity": 1,
        "role": "Kính lúp cầm tay 5x quan sát vật nhỏ (Bài 10)",
        "optional": true
      }
    ]
  },
  {
    "kitId": "OL3D-KIT-ELECTROMAG-KHTN9",
    "kitVersion": "1.1.0",
    "name": {
      "vi": "Bộ thí nghiệm Điện & Cảm ứng điện từ KHTN 9 (Bài 11, 12, 14)",
      "en": "Grade 9 Electricity & Electromagnetic Induction Kit"
    },
    "subject": "physics",
    "purpose": "Khảo sát Định luật Ohm, mạch điện nối tiếp/song song bằng Đồng hồ đo điện đa năng và thực hành Cảm ứng điện từ với Điện kế nhạy, Cuộn dây 2 đèn LED (Chương III & IV SGK KHTN 9).",
    "categoryIds": [
      "electrical-equipment"
    ],
    "publicationStatus": "published",
    "verificationStatus": "verified",
    "items": [
      {
        "assetId": "OL3D-EQP-GLV-0001",
        "assetVersion": "1.1.0",
        "quantity": 1,
        "role": "Điện kế vạch 0 ở giữa phát hiện dòng cảm ứng (Hình 1.4, Bài 14)",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-COIL-0001",
        "assetVersion": "1.1.0",
        "quantity": 1,
        "role": "Cuộn dây dẫn kín có 2 đèn LED & Nam châm (Hình 1.6, Bài 14)",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-DMM-0001",
        "assetVersion": "1.1.0",
        "quantity": 1,
        "role": "Đồng hồ đo điện đa năng đo U, I, R (Hình 1.5, Bài 11, 12)",
        "optional": false
      }
    ]
  },
  {
    "kitId": "OL3D-KIT-CHEM-KHTN9",
    "kitVersion": "1.1.0",
    "name": {
      "vi": "Bộ dụng cụ Hoá học KHTN 9 (Chất & Sự biến đổi chất: Bát sứ, Phễu chiết, Bình cầu)",
      "en": "Grade 9 Chemistry Synthesis, Extraction & Combustion Kit"
    },
    "subject": "chemistry",
    "purpose": "Thực hành các thí nghiệm Hoá học trong SGK KHTN 9 (Bài 1, Bài 21, Bài 24, Bài 26, Bài 27): Đun nóng bình cầu trên lưới tản nhiệt điều chế ethylene, tách chất bằng phễu chiết, và đốt cháy ethylic alcohol trong bát sứ.",
    "categoryIds": [
      "chemical-apparatus",
      "laboratory-glassware",
      "thermal-equipment"
    ],
    "publicationStatus": "published",
    "verificationStatus": "verified",
    "items": [
      {
        "assetId": "OL3D-EQP-DSH-0001",
        "assetVersion": "1.0.0",
        "quantity": 1,
        "role": "Bát sứ cô đặc và đốt cháy ethylic alcohol (Hình 1.7, Bài 26)",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-SEP-0001",
        "assetVersion": "1.0.0",
        "quantity": 1,
        "role": "Phễu chiết tách chất lỏng & Phễu lọc than gỗ (Hình 1.8, Bài 21, 27)",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-DST-0001",
        "assetVersion": "1.1.0",
        "quantity": 1,
        "role": "Bình cầu có nhánh 250 mL, Lưới tản nhiệt & Đèn cồn (Hình 1.9, 1.10, Bài 24)",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-BKR-0001",
        "assetVersion": "1.0.2",
        "quantity": 1,
        "role": "Cốc thuỷ tinh 250 mL hứng dung dịch",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-FLK-0001",
        "assetVersion": "1.0.1",
        "quantity": 1,
        "role": "Bình tam giác 250 mL lắc phản ứng",
        "optional": true
      }
    ]
  },
  {
    "kitId": "OL3D-KIT-BIOLOGY-KHTN9",
    "kitVersion": "1.1.0",
    "name": {
      "vi": "Bộ dụng cụ Sinh học & Di truyền KHTN 9 (Kính hiển vi NST & Mô hình DNA)",
      "en": "Grade 9 Genetics & Chromosome Microscopy Kit"
    },
    "subject": "biology",
    "purpose": "Thực hành quan sát tiêu bản cố định Nhiễm sắc thể dưới kính hiển vi quang học (10x, 40x, 100x) và tìm hiểu cấu trúc không gian của phân tử DNA xoắn kép (Chương XI & XII SGK KHTN 9).",
    "categoryIds": [
      "biology-microscopy",
      "optical-equipment"
    ],
    "publicationStatus": "published",
    "verificationStatus": "verified",
    "items": [
      {
        "assetId": "OL3D-EQP-MIC-0001",
        "assetVersion": "1.1.0",
        "quantity": 1,
        "role": "Kính hiển vi quang học & Tiêu bản cố định NST (Hình 1.11, Bài 42)",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-DNA-0001",
        "assetVersion": "1.0.0",
        "quantity": 1,
        "role": "Mô hình cấu trúc phân tử DNA xoắn kép (Hình 38.1, Bài 38)",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-MAG-0001",
        "assetVersion": "1.0.0",
        "quantity": 1,
        "role": "Kính lúp cầm tay hỗ trợ quan sát mẫu sinh vật",
        "optional": true
      }
    ]
  },
  {
    "kitId": "OL3D-KIT-VOLUME-0001",
    "kitVersion": "1.0.0",
    "name": {
      "vi": "Bộ dụng cụ đo thể tích chất lỏng & dụng cụ thủy tinh",
      "en": "Liquid Volume & Glassware Kit"
    },
    "subject": "chemistry",
    "purpose": "Làm quen với độ chia nhỏ nhất, giới hạn đo và quy tắc đọc mặt khum chất lỏng (meniscus) trong ống đong, cốc chia độ và bình tam giác.",
    "categoryIds": [
      "volume-measurement",
      "laboratory-glassware"
    ],
    "publicationStatus": "published",
    "verificationStatus": "verified",
    "items": [
      {
        "assetId": "OL3D-EQP-CYL-0001",
        "assetVersion": "1.1.0",
        "quantity": 1,
        "role": "Dụng cụ đo thể tích chính xác",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-BKR-0001",
        "assetVersion": "1.0.2",
        "quantity": 1,
        "role": "Dụng cụ chứa và rót chất lỏng",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-FLK-0001",
        "assetVersion": "1.0.1",
        "quantity": 1,
        "role": "Bình tam giác lắc dung dịch",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-OVF-0001",
        "assetVersion": "1.0.0",
        "quantity": 1,
        "role": "Bình tràn thực hành dời chỗ",
        "optional": true
      }
    ]
  },
  {
    "kitId": "OL3D-KIT-FORCE-0001",
    "kitVersion": "1.0.0",
    "name": {
      "vi": "Bộ thí nghiệm đo lực & lực đẩy Archimedes cơ bản",
      "en": "Force & Archimedes Buoyancy Kit"
    },
    "subject": "physics",
    "purpose": "Khảo sát trọng lượng P của vật trong không khí và hợp lực khi nhúng chìm vật rắn trong chất lỏng bằng lực kế lò xo trên giá đỡ.",
    "categoryIds": [
      "force-measurement",
      "support-hardware",
      "solid-specimens"
    ],
    "publicationStatus": "published",
    "verificationStatus": "partially-verified",
    "items": [
      {
        "assetId": "OL3D-EQP-STD-0001",
        "assetVersion": "1.1.0",
        "quantity": 1,
        "role": "Giá đỡ treo lực kế thẳng đứng",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-DYN-0001",
        "assetVersion": "1.0.0",
        "quantity": 1,
        "role": "Lực kế lò xo 5 N",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-WGT-0001",
        "assetVersion": "1.0.0",
        "quantity": 1,
        "role": "Quả cân chuẩn 50 g (P ≈ 0.49 N)",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-SLD-0001",
        "assetVersion": "1.0.0",
        "quantity": 1,
        "role": "Vật rắn nhúng trong chất lỏng",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-BKR-0001",
        "assetVersion": "1.0.2",
        "quantity": 1,
        "role": "Cốc chứa nước nhúng vật",
        "optional": false
      }
    ]
  },
  {
    "kitId": "OL3D-KIT-OPTICS-0001",
    "kitVersion": "1.2.0",
    "name": {
      "vi": "Bộ thí nghiệm Thấu kính trên Giá quang học — Hình 8.12 SGK KHTN 9",
      "en": "Modular Optical Bench & Lens Experiment Kit (Fig 8.12 Grade 9)"
    },
    "subject": "physics",
    "purpose": "Phân rã đầy đủ 7 chi tiết của Bộ thí nghiệm Thấu kính (Hình 8.12 SGK KHTN 9 — Bài 8 & Bài 9) để học sinh tự lắp ráp từ kệ trưng bày lên Giá quang học: (1) Đèn chiếu sáng, (2) Vật sáng chữ F, (3) Thấu kính trên đế trượt, (4) Màn chắn hứng ảnh, (5) Giá quang học 90 cm, (6) Nguồn điện 3V–12V và Hộp bộ 6 thấu kính.",
    "categoryIds": [
      "optical-equipment",
      "length-measurement",
      "electrical-equipment"
    ],
    "publicationStatus": "published",
    "verificationStatus": "verified",
    "items": [
      {
        "assetId": "OL3D-EQP-OBN-0001",
        "assetVersion": "1.0.0",
        "quantity": 1,
        "role": "(5) Giá quang học 90 cm có thước chia độ (-45 .. 0 .. +45 cm)",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-OLP-0001",
        "assetVersion": "1.0.0",
        "quantity": 1,
        "role": "(1) Đèn chiếu sáng Halogen kèm Đầu chắn khe sáng",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-FOB-0001",
        "assetVersion": "1.0.0",
        "quantity": 1,
        "role": "(2) Vật sáng bằng kính mờ hình chữ F",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-OPT-0001",
        "assetVersion": "1.2.0",
        "quantity": 1,
        "role": "(3) Thấu kính trên đế trượt quang học (f = +10 cm)",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-SCR-0001",
        "assetVersion": "1.0.0",
        "quantity": 1,
        "role": "(4) Màn chắn hứng ảnh trên Giá quang học",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-PSU-0001",
        "assetVersion": "1.0.0",
        "quantity": 1,
        "role": "(6) Nguồn điện hạ áp 3V–12V cấp điện cho đèn",
        "optional": false
      },
      {
        "assetId": "OL3D-EQP-LBX-0001",
        "assetVersion": "1.0.0",
        "quantity": 1,
        "role": "Hộp bộ 6 Thấu kính tiêu chuẩn (+5, +10, +15, -10, -20, ∞)",
        "optional": false
      }
    ]
  }
];

export const MOCK_LAB_ENVIRONMENTS: LabEnvironment[] = [
  {
    environmentId: 'OL3D-ENV-PHYSICS-0001',
    environmentVersion: '1.1.0',
    name: {
      vi: 'Phòng thí nghiệm Vật lí & Đo lường',
      en: 'Physics & Metrology Laboratory',
    },
    subject: 'physics',
    description: 'Bàn thí nghiệm mặt đá Phenolic chống rung, lưới tọa độ chuẩn hóa mét (m) và hệ thống chiếu sáng Studio PBR độ tương phản cao giúp đọc rõ vạch chia.',
    publicationStatus: 'published',
    visualPreset: {
      skyColorHex: '#DCEBFA',
      fogColorHex: '#E5F0FA',
      benchTopColorHex: '#E2E8F0',
      benchFrameColorHex: '#94A3B8',
      floorColorHex: '#CBD5E1',
      keyLightColorHex: '#FFFDF7',
      keyLightIntensity: 2.2,
      hemisphereSkyHex: '#FFFFFF',
      hemisphereGroundHex: '#CBD5E1',
      accentColorHex: '#00BCEB',
    },
    benchDimensionsM: { width: 1.4, depth: 0.75, surfaceHeight: 0.0 },
    anchors: [
      { anchorId: 'zone-scale', label: 'Vùng đặt Cân điện tử', positionM: [-0.36, 0, 0.02] },
      { anchorId: 'zone-glassware', label: 'Vùng Dụng cụ thể tích', positionM: [0.05, 0, 0.02] },
      { anchorId: 'zone-specimens', label: 'Khay Vật mẫu & Thước cặp', positionM: [0.36, 0, 0.14] },
    ],
  },
  {
    environmentId: 'OL3D-ENV-CHEM-0001',
    environmentVersion: '1.0.0',
    name: {
      vi: 'Phòng thí nghiệm Hóa học Phân tích',
      en: 'Analytical Chemistry Wet Lab',
    },
    subject: 'chemistry',
    description: 'Mặt bàn sứ kỹ thuật kháng axit màu xám sáng, ánh sáng trắng lạnh tiêu chuẩn 5500K giúp quan sát rõ màu dung dịch và mặt khum chất lỏng.',
    publicationStatus: 'published',
    visualPreset: {
      skyColorHex: '#0D1520',
      fogColorHex: '#0D1520',
      benchTopColorHex: '#273549',
      benchFrameColorHex: '#0F172A',
      floorColorHex: '#0A0F18',
      keyLightColorHex: '#F0F9FF',
      keyLightIntensity: 2.5,
      hemisphereSkyHex: '#67E8F9',
      hemisphereGroundHex: '#1E293B',
      accentColorHex: '#14B8A6',
    },
    benchDimensionsM: { width: 1.4, depth: 0.75, surfaceHeight: 0.0 },
    anchors: [
      { anchorId: 'zone-titration', label: 'Vùng Chuẩn độ & Bình tam giác', positionM: [-0.25, 0, 0] },
      { anchorId: 'zone-measuring', label: 'Vùng Ống đong & Cốc thủy tinh', positionM: [0.22, 0, 0] },
    ],
  },
  {
    environmentId: 'OL3D-ENV-BIO-0001',
    environmentVersion: '1.0.0',
    name: {
      vi: 'Phòng thí nghiệm Sinh học & Khoa học Sự sống',
      en: 'Biology & Life Science Lab',
    },
    subject: 'biology',
    description: 'Không gian bàn thực hành sinh học với ánh sáng ấm tự nhiên kết hợp mặt bàn composite xanh đá trầm.',
    publicationStatus: 'published',
    visualPreset: {
      skyColorHex: '#0C1618',
      fogColorHex: '#0C1618',
      benchTopColorHex: '#1F3135',
      benchFrameColorHex: '#111C1E',
      floorColorHex: '#081012',
      keyLightColorHex: '#FEF3C7',
      keyLightIntensity: 2.2,
      hemisphereSkyHex: '#6EE7B7',
      hemisphereGroundHex: '#132A2E',
      accentColorHex: '#10B981',
    },
    benchDimensionsM: { width: 1.4, depth: 0.75, surfaceHeight: 0.0 },
    anchors: [
      { anchorId: 'zone-main', label: 'Tâm bàn thực hành Sinh học', positionM: [0, 0, 0] },
    ],
  },
  {
    environmentId: 'OL3D-ENV-BENCH-0001',
    environmentVersion: '1.0.0',
    name: {
      vi: 'Bàn kiểm định hình học 3D tiêu chuẩn',
      en: 'Minimalist Metrology Inspection Stage',
    },
    subject: 'general-science',
    description: 'Bàn chuẩn tối giản độ tương phản cao dành cho việc kiểm duyệt kích thước bao (bounding box), tâm gốc (anchor) và vật liệu PBR của tài sản mới.',
    publicationStatus: 'published',
    visualPreset: {
      skyColorHex: '#090B10',
      fogColorHex: '#090B10',
      benchTopColorHex: '#181C26',
      benchFrameColorHex: '#0D1017',
      floorColorHex: '#07080C',
      keyLightColorHex: '#FFFFFF',
      keyLightIntensity: 2.4,
      hemisphereSkyHex: '#CBD5E1',
      hemisphereGroundHex: '#1E293B',
      accentColorHex: '#38BDF8',
    },
    benchDimensionsM: { width: 1.4, depth: 0.75, surfaceHeight: 0.0 },
    anchors: [
      { anchorId: 'zone-origin', label: 'Tâm gốc kiểm chuẩn (0, 0, 0)', positionM: [0, 0, 0] },
    ],
  },
  {
    environmentId: 'OL3D-ENV-STEM-0001',
    environmentVersion: '1.0.0',
    name: {
      vi: 'Không gian Xưởng thực hành STEM',
      en: 'STEM Maker & Engineering Studio',
    },
    subject: 'stem',
    description: 'Bàn gỗ kỹ thuật ghép thanh của phòng học STEM dùng lắp ráp bộ thí nghiệm, đo kích thước cơ khí bằng thước cặp và thử nghiệm nguyên mẫu.',
    publicationStatus: 'published',
    visualPreset: {
      skyColorHex: '#121016',
      fogColorHex: '#121016',
      benchTopColorHex: '#3B2F26',
      benchFrameColorHex: '#1C1917',
      floorColorHex: '#0C0A0E',
      keyLightColorHex: '#FDE68A',
      keyLightIntensity: 2.3,
      hemisphereSkyHex: '#FDBA74',
      hemisphereGroundHex: '#292524',
      accentColorHex: '#F59E0B',
    },
    benchDimensionsM: { width: 1.4, depth: 0.75, surfaceHeight: 0.0 },
    anchors: [
      { anchorId: 'zone-stem-center', label: 'Vùng lắp ráp STEM', positionM: [0, 0, 0] },
    ],
  },
  {
    environmentId: 'OL3D-ENV-OUTDOOR-0001',
    environmentVersion: '0.9.0',
    name: {
      vi: 'Môi trường khảo sát thực địa ngoài trời',
      en: 'Outdoor Field Survey Station',
    },
    subject: 'general-science',
    description: 'Bàn dã ngoại dưới ánh sáng bầu trời tự nhiên dùng kiểm tra độ hiển thị của mô hình 3D dưới điều kiện chiếu sáng ngoài trời.',
    publicationStatus: 'approved',
    visualPreset: {
      skyColorHex: '#0F1E2E',
      fogColorHex: '#0F1E2E',
      benchTopColorHex: '#2E3A34',
      benchFrameColorHex: '#1A221E',
      floorColorHex: '#0D1714',
      keyLightColorHex: '#FFFBEB',
      keyLightIntensity: 2.7,
      hemisphereSkyHex: '#7DD3FC',
      hemisphereGroundHex: '#334155',
      accentColorHex: '#38BDF8',
    },
    benchDimensionsM: { width: 1.4, depth: 0.75, surfaceHeight: 0.0 },
    anchors: [
      { anchorId: 'zone-field', label: 'Bàn đo thực địa', positionM: [0, 0, 0] },
    ],
  },
];

export const MOCK_EXPERIMENTS: ExperimentDefinition[] = [
  {
    "experimentId": "OL3D-EXP-PASCAL-0001",
    "experimentVersion": "1.0.0",
    "title": "Thí nghiệm Bình thông nhau & Máy nén thủy lực Pascal — Hình 16.3 (KHTN 8)",
    "subject": "physics",
    "gradeLevel": "Lớp 8 — Khoa học Tự nhiên (Bài 16: Áp suất chất lỏng)",
    "objective": "Kéo thả từng quả nặng 100g (1.0N) từ khay chứa đặt lên đĩa Pit-tông nhánh lớn S₁ = 20 cm² và nhánh nhỏ S₂ = 10 cm², quan sát sự thay đổi độ cao cột nước h₁, h₂ và nghiệm lại nguyên lí truyền áp suất Pascal F₂ / F₁ = S₂ / S₁.",
    "recommendedKitId": "OL3D-KIT-PASCAL-0001",
    "recommendedEnvironmentId": "OL3D-ENV-PHYSICS-0001",
    "simulationFidelity": "validated",
    "safetyNotes": [
      "Kéo thả từng quả nặng 100g (1.0N) đặt nhẹ nhàng lên đĩa Pit-tông (1) hoặc Pit-tông (2).",
      "Quan sát vạch chia độ cao mực nước (cm) và vòng chỉ thị mực nước trên cả hai nhánh thông nhau.",
      "Do tiết diện S₁ = 2 · S₂ nên theo định luật bảo toàn thể tích chất lỏng không nén được: Δh₂ = -2 · Δh₁."
    ],
    "formulas": [
      {
        "expression": "p₁ = F₁ / S₁ ; p₂ = F₂ / S₂",
        "description": "Áp suất ngoài tác dụng lên mặt thoáng chất lỏng ở mỗi nhánh (N/cm²)."
      },
      {
        "expression": "F₂ / F₁ = S₂ / S₁ = 1 / 2",
        "description": "Điều kiện cân bằng thủy tĩnh (Δh₁ = Δh₂ = 0 cm) khi số quả nặng thỏa mãn n₁ = 2 · n₂."
      },
      {
        "expression": "S₁ · Δh₁ + S₂ · Δh₂ = 0 ⇒ Δh₂ = -2 · Δh₁",
        "description": "Độ dâng/hạ mực nước ở hai nhánh tỉ lệ nghịch với tiết diện ống."
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "id": "step-pascal-init",
        "title": "Quan sát trạng thái cân bằng ban đầu (n₁ = 0, n₂ = 0)",
        "description": "Kiểm tra mực nước ở hai nhánh ống lớn S₁ = 20 cm² và ống nhỏ S₂ = 10 cm² cùng nằm ngang tại vạch chuẩn h₀ = 0 cm.",
        "instructionDetail": "8 quả nặng chuẩn 100g (1.0N) nằm sẵn trên khay phía trước bộ bình thông nhau. Bạn có thể nắm kéo trực tiếp từng quả nặng 3D.",
        "requiredAssetIds": [
          "OL3D-EQP-PAS-0001"
        ],
        "highlightCapability": "selectable"
      },
      {
        "stepNumber": 2,
        "id": "step-pascal-imbalance",
        "title": "Kéo thả quả nặng lên Nhánh lớn (1) S₁ = 20 cm²",
        "description": "Kéo từng quả nặng từ khay đặt lên đĩa Pit-tông (1) và quan sát cột nước nhánh (1) hạ xuống, cột nước nhánh (2) dâng cao gấp đôi.",
        "instructionDetail": "Khi đặt 4 quả nặng (F₁ = 4.0N) lên nhánh lớn S₁, mực nước nhánh (1) hạ xuống Δh₁ = -2.0 cm và mực nước nhánh (2) dâng lên Δh₂ = +4.0 cm.",
        "requiredAssetIds": [
          "OL3D-EQP-PAS-0001"
        ],
        "highlightCapability": "selectable"
      },
      {
        "stepNumber": 3,
        "id": "step-pascal-balance",
        "title": "Kéo thả quả nặng lên Nhánh nhỏ (2) S₂ = 10 cm² để cân bằng",
        "description": "Kéo 2 quả nặng (F₂ = 2.0N) đặt lên đĩa Pit-tông (2) để khôi phục trạng thái cân bằng thủy tĩnh h₁ = h₂ = h₀.",
        "instructionDetail": "Khi n₁ = 4 quả (F₁ = 4.0N) và n₂ = 2 quả (F₂ = 2.0N), áp suất hai nhánh bằng nhau p₁ = p₂ = 0.20 N/cm², mực nước hai nhánh trở về ngang bằng tại vạch 0 cm.",
        "requiredAssetIds": [
          "OL3D-EQP-PAS-0001"
        ],
        "highlightCapability": "selectable"
      }
    ],
    "sampleResults": [
      {
        "id": "row-pas-1",
        "quantityName": "Trường hợp 1 (n₁ = 4, n₂ = 2)",
        "symbol": "p₁ = p₂",
        "value": 0.2,
        "unit": "N/cm²",
        "formulaNote": "F₁ = 4N, F₂ = 2N → Cân bằng thủy tĩnh Δh₁ = 0 cm, Δh₂ = 0 cm",
        "status": "illustrative"
      },
      {
        "id": "row-pas-2",
        "quantityName": "Trường hợp 2 (n₁ = 2, n₂ = 1)",
        "symbol": "p₁ = p₂",
        "value": 0.1,
        "unit": "N/cm²",
        "formulaNote": "F₁ = 2N, F₂ = 1N → Cân bằng thủy tĩnh Δh₁ = 0 cm, Δh₂ = 0 cm",
        "status": "illustrative"
      }
    ]
  },
  {
    "experimentId": "OL3D-EXP-DENSITY-SOLID-0001",
    "experimentVersion": "1.1.0",
    "title": "Xác định khối lượng riêng của vật rắn không thấm nước (KHTN 8)",
    "subject": "physics",
    "gradeLevel": "Lớp 8 — Khoa học Tự nhiên",
    "objective": "Bố trí dụng cụ thí nghiệm trên bàn 3D, đo khối lượng m bằng cân điện tử, xác định thể tích V bằng ống đong hoặc bình tràn, từ đó tính khối lượng riêng ρ = m / V.",
    "recommendedKitId": "OL3D-KIT-DENSITY-0001",
    "recommendedEnvironmentId": "OL3D-ENV-PHYSICS-0001",
    "simulationFidelity": "interactive-demo",
    "safetyNotes": [
      "Đặt cân điện tử trên mặt bàn phẳng, nhấn nút Tare (0.00 g) trước khi đặt vật mẫu lên đĩa cân.",
      "Khi đọc thể tích trên ống đong, đặt mắt ngang với đáy mặt khum chất lỏng (meniscus).",
      "Thả vật rắn từ từ vào ống đong hoặc bình tràn để tránh làm văng nước hoặc vỡ đáy thủy tinh."
    ],
    "formulas": [
      {
        "expression": "V = V₂ - V₁",
        "description": "Thể tích vật rắn bằng hiệu mực nước sau và trước khi thả vật vào ống đong (cm³ = ml)."
      },
      {
        "expression": "ρ = m / V",
        "description": "Khối lượng riêng ρ (g/cm³ hoặc kg/m³) bằng thương số giữa khối lượng m và thể tích V."
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "id": "step-prepare",
        "title": "Chuẩn bị dụng cụ và kiểm tra giới hạn đo",
        "description": "Kiểm tra sự có mặt của cân điện tử, ống đong 100 ml, bình tràn, cốc thủy tinh và vật rắn hình trụ nhôm trên bàn thí nghiệm.",
        "instructionDetail": "Chọn từng thiết bị trong Viewport 3D hoặc cây đối tượng (Scene Hierarchy) để kiểm tra Giới hạn đo (GHĐ) và Độ chia nhỏ nhất (ĐCNN) trong bảng Inspector bên phải.",
        "requiredAssetIds": [
          "OL3D-EQP-BAL-0001",
          "OL3D-EQP-CYL-0001",
          "OL3D-EQP-SLD-0001"
        ],
        "highlightCapability": "selectable"
      },
      {
        "stepNumber": 2,
        "id": "step-weigh",
        "title": "Đo khối lượng vật rắn trên cân điện tử (m)",
        "description": "Hiệu chỉnh cân về số 0 (Tare) và xác định khối lượng mẫu vật rắn hình trụ nhôm.",
        "instructionDetail": "Chọn Cân điện tử 500 g trong cảnh 3D, mở tab \"Hành vi tương tác\" ở Inspector để kiểm tra trạng thái đọc số cân (giá trị mẫu minh họa m = 66.25 g).",
        "requiredAssetIds": [
          "OL3D-EQP-BAL-0001",
          "OL3D-EQP-SLD-0001"
        ],
        "highlightCapability": "weighObject"
      },
      {
        "stepNumber": 3,
        "id": "step-volume",
        "title": "Đo thể tích vật rắn bằng ống đong dời chỗ (V = V₂ - V₁)",
        "description": "Ghi nhận mực nước ban đầu V₁ = 50.0 ml và mực nước sau khi thả ngập vật rắn V₂ = 74.5 ml.",
        "instructionDetail": "Chọn Ống đong thủy tinh 100 ml, quan sát vạch chia và điều chỉnh mực chất lỏng minh họa trong tab Hành vi tương tác để thấy độ dâng thể tích ΔV = 24.5 ml.",
        "requiredAssetIds": [
          "OL3D-EQP-CYL-0001",
          "OL3D-EQP-OVF-0001",
          "OL3D-EQP-BKR-0001"
        ],
        "highlightCapability": "displacementVolume"
      },
      {
        "stepNumber": 4,
        "id": "step-calculate",
        "title": "Tính toán khối lượng riêng (ρ = m / V)",
        "description": "Thay các giá trị đo minh họa vào công thức ρ = m / (V₂ - V₁) và đối chiếu bảng hằng số vật liệu.",
        "instructionDetail": "Mở tab \"Kết quả minh họa\" ở khay dưới để kiểm tra tính nhất quán đơn vị: m = 66.25 g, V = 24.54 cm³ → ρ ≈ 2.70 g/cm³ (hợp kim nhôm đặc).",
        "requiredAssetIds": [
          "OL3D-EQP-SLD-0001",
          "OL3D-EQP-CAL-0001"
        ],
        "highlightCapability": "showDimensions"
      },
      {
        "stepNumber": 5,
        "id": "step-review",
        "title": "Nhận xét sai số và phân biệt vật đặc / vật rỗng",
        "description": "So sánh kết quả với trường hợp vật rắn có khoang rỗng bên trong (OL3D-EQP-HLW-0001).",
        "instructionDetail": "Thử thêm \"Ống trụ kim loại rỗng có khoang kín\" từ Asset Explorer vào cảnh để thấy vì sao không được kết luận chất làm vật chỉ qua hình dáng bề ngoài.",
        "requiredAssetIds": [
          "OL3D-EQP-HLW-0001"
        ],
        "highlightCapability": "selectable"
      }
    ],
    "sampleResults": [
      {
        "id": "row-m",
        "quantityName": "Khối lượng vật rắn hình trụ nhôm",
        "symbol": "m",
        "value": 66.25,
        "unit": "g",
        "formulaNote": "Đọc từ màn hình cân điện tử (ĐCNN 0.01 g)",
        "status": "illustrative"
      },
      {
        "id": "row-v1",
        "quantityName": "Thể tích nước ban đầu trong ống đong",
        "symbol": "V₁",
        "value": 50,
        "unit": "cm³ (ml)",
        "formulaNote": "Mực đáy mặt khum trước khi thả vật (ĐCNN 1 ml)",
        "status": "illustrative"
      },
      {
        "id": "row-v2",
        "quantityName": "Thể tích nước + vật rắn sau khi nhúng chìm",
        "symbol": "V₂",
        "value": 74.54,
        "unit": "cm³ (ml)",
        "formulaNote": "Kết hợp đối chiếu kích thước thước cặp (24.54 cm³)",
        "status": "illustrative"
      },
      {
        "id": "row-v",
        "quantityName": "Thể tích vật rắn chiếm chỗ",
        "symbol": "V = V₂ - V₁",
        "value": 24.54,
        "unit": "cm³",
        "formulaNote": "74.54 - 50.00 = 24.54 cm³",
        "status": "illustrative"
      },
      {
        "id": "row-rho",
        "quantityName": "Khối lượng riêng của mẫu nhôm",
        "symbol": "ρ = m / V",
        "value": 2.7,
        "unit": "g/cm³",
        "formulaNote": "66.25 / 24.54 ≈ 2.70 g/cm³ (2700 kg/m³)",
        "status": "illustrative"
      }
    ]
  },
  {
    "experimentId": "OL3D-EXP-DISPLACEMENT-0001",
    "experimentVersion": "1.0.0",
    "title": "Đo thể tích vật rắn bằng Bình tràn Eureka và Lực đẩy Archimedes",
    "subject": "physics",
    "gradeLevel": "Lớp 8 — Khoa học Tự nhiên",
    "objective": "Sử dụng bình tràn kết hợp cốc hứng và ống đong để đo thể tích vật rắn lớn, đồng thời kiểm tra độ giảm số chỉ lực kế khi nhúng vật vào nước.",
    "recommendedKitId": "OL3D-KIT-FORCE-0001",
    "recommendedEnvironmentId": "OL3D-ENV-PHYSICS-0001",
    "simulationFidelity": "illustrative",
    "safetyNotes": [
      "Đảm bảo chân đế giá đỡ thí nghiệm đặt vững trên mặt bàn trước khi treo lực kế và vật nặng.",
      "Đặt mỏ bình tràn hướng thẳng vào miệng cốc thủy tinh hứng nước."
    ],
    "formulas": [
      {
        "expression": "F_A = P - F",
        "description": "Lực đẩy Archimedes bằng hiệu trọng lượng vật ngoài không khí P và số chỉ lực kế khi vật chìm trong nước F."
      },
      {
        "expression": "F_A = d × V",
        "description": "Độ lớn lực đẩy Archimedes bằng trọng lượng riêng chất lỏng d nhân với thể tích phần chất lỏng bị vật chiếm chỗ V."
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "id": "disp-1",
        "title": "Lắp đặt giá đỡ và treo lực kế 5 N",
        "description": "Bố trí giá đỡ thí nghiệm và lực kế lò xo thẳng đứng cạnh bình tràn Eureka.",
        "instructionDetail": "Sử dụng công cụ Di chuyển (Translate Gizmo) trong Viewport 3D để căn chỉnh vị trí Bình tràn ngay dưới móc treo của Lực kế.",
        "requiredAssetIds": [
          "OL3D-EQP-STD-0001",
          "OL3D-EQP-DYN-0001",
          "OL3D-EQP-OVF-0001"
        ],
        "highlightCapability": "translatable"
      },
      {
        "stepNumber": 2,
        "id": "disp-2",
        "title": "Đo trọng lượng P của vật ngoài không khí",
        "description": "Treo vật rắn vào móc lực kế và đọc giá trị P (N).",
        "instructionDetail": "Chọn Lực kế 5 N để xem thông số thang đo (0.1 N) và giá trị trọng lượng minh họa P = 0.65 N.",
        "requiredAssetIds": [
          "OL3D-EQP-DYN-0001",
          "OL3D-EQP-SLD-0001"
        ],
        "highlightCapability": "measureForce"
      },
      {
        "stepNumber": 3,
        "id": "disp-3",
        "title": "Hứng nước tràn và đo thể tích V trên ống đong",
        "description": "Hạ vật ngập trong bình tràn, hứng toàn bộ nước chảy ra vào cốc rồi đổ sang ống đong 100 ml.",
        "instructionDetail": "Kiểm tra thể tích nước thu được trong ống đong (V ≈ 24.5 ml) và đối chiếu với lực đẩy F_A = P - F.",
        "requiredAssetIds": [
          "OL3D-EQP-OVF-0001",
          "OL3D-EQP-BKR-0001",
          "OL3D-EQP-CYL-0001"
        ],
        "highlightCapability": "displacementVolume"
      }
    ],
    "sampleResults": [
      {
        "id": "arch-p",
        "quantityName": "Trọng lượng vật ngoài không khí",
        "symbol": "P",
        "value": 0.65,
        "unit": "N",
        "formulaNote": "Đọc trên lực kế 5 N (ĐCNN 0.1 N)",
        "status": "illustrative"
      },
      {
        "id": "arch-f",
        "quantityName": "Hợp lực chỉ trên lực kế khi vật ngập trong nước",
        "symbol": "F",
        "value": 0.41,
        "unit": "N",
        "formulaNote": "Số chỉ lực kế giảm do lực đẩy Archimedes",
        "status": "illustrative"
      },
      {
        "id": "arch-fa",
        "quantityName": "Độ lớn lực đẩy Archimedes",
        "symbol": "F_A = P - F",
        "value": 0.24,
        "unit": "N",
        "formulaNote": "0.65 - 0.41 = 0.24 N (Tương ứng ~24.5 cm³ nước)",
        "status": "illustrative"
      }
    ]
  },
  {
    "experimentId": "OL3D-EXP-OPTICS-LENS-0001",
    "experimentVersion": "1.2.0",
    "title": "Lắp ráp & Khảo sát Thấu kính trên Giá quang học — Hình 8.12 (SGK KHTN 9)",
    "subject": "physics",
    "gradeLevel": "Lớp 9 — Khoa học Tự nhiên (Bài 8 & Bài 9)",
    "objective": "Lắp ráp 7 chi tiết rời trên kệ trưng bày thành Bộ thí nghiệm Thấu kính hoàn chỉnh trên Giá quang học (Hình 8.12 SGK KHTN 9), khảo sát đường truyền tia sáng, hứng ảnh thật của vật sáng chữ F trên màn chắn và đo tiêu cự thấu kính hội tụ theo phương pháp đối xứng d = d' = 2f.",
    "recommendedKitId": "OL3D-KIT-OPTICS-0001",
    "recommendedEnvironmentId": "OL3D-ENV-PHYSICS-0001",
    "simulationFidelity": "interactive-demo",
    "safetyNotes": [
      "Đặt Giá quang học (5) nằm ngang ở giữa bàn trước, sau đó kéo thả Đèn (1), Vật sáng chữ F (2), Thấu kính (3) và Màn chắn (4) trượt vào đúng rãnh đồng trục.",
      "Cầm thấu kính ở vành khung bảo vệ hoặc thẻ tiêu cự, không chạm tay trực tiếp vào mặt kính quang học.",
      "Bật công tắc Nguồn điện (6) để cấp điện 6V–12V cho Đèn chiếu sáng (1) trước khi dịch chuyển Màn chắn (4) tìm ảnh rõ nét."
    ],
    "formulas": [
      {
        "expression": "f = (d + d') / 4",
        "description": "Công thức đo tiêu cự thực hành Bài 9 SGK KHTN 9 khi dịch chuyển vật và màn để thu được ảnh thật rõ nét cao bằng vật (d = d' = 2f)."
      },
      {
        "expression": "1/f = 1/d + 1/d'",
        "description": "Công thức thấu kính mỏng liên hệ tiêu cự f, khoảng cách từ vật tới thấu kính d và khoảng cách từ thấu kính tới ảnh d'."
      },
      {
        "expression": "k = -d' / d",
        "description": "Số phóng đại ảnh k (k < 0: ảnh thật ngược chiều với vật; k > 0: ảnh ảo cùng chiều với vật)."
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "id": "opt-1",
        "title": "Bước 1: Đặt (5) Giá quang học và (6) Nguồn điện xuống bàn",
        "description": "Kéo (5) Giá quang học 90 cm từ kệ trưng bày xuống giữa bàn thí nghiệm và đặt (6) Nguồn điện hạ áp ở phía bên trái.",
        "instructionDetail": "Bạn có thể kéo từng thiết bị từ Kệ trưng bày xuống bàn hoặc nhấn nút \"⚡ Lắp nhanh bộ Thấu kính (Hình 8.12)\" để tự động căn chỉnh đồng trục.",
        "requiredAssetIds": [
          "OL3D-EQP-OBN-0001",
          "OL3D-EQP-PSU-0001",
          "OL3D-EQP-LBX-0001"
        ],
        "highlightCapability": "translatable"
      },
      {
        "stepNumber": 2,
        "id": "opt-2",
        "title": "Bước 2: Lắp (3) Thấu kính tại vạch O = 0 cm và (2) Vật sáng chữ F, (1) Đèn chiếu",
        "description": "Kéo (3) Thấu kính hội tụ f = +10 cm lắp vào vạch 0 cm trên Giá quang học, lắp (2) Vật sáng chữ F ở vạch -20 cm (d = 2f = 20 cm) và (1) Đèn chiếu sáng ở vạch -32 cm.",
        "instructionDetail": "Khi kéo lại gần Giá quang học (5), đế trượt chữ U của các chi tiết (1), (2), (3), (4) sẽ tự động bắt dính vào sống trượt đồng trục và hiển thị tọa độ thước đo.",
        "requiredAssetIds": [
          "OL3D-EQP-OPT-0001",
          "OL3D-EQP-FOB-0001",
          "OL3D-EQP-OLP-0001"
        ],
        "highlightCapability": "opticalFocus"
      },
      {
        "stepNumber": 3,
        "id": "opt-3",
        "title": "Bước 3: Trượt (4) Màn chắn hứng ảnh thật chữ F rõ nét (d' = 20 cm)",
        "description": "Lắp (4) Màn chắn vào nhánh phải của Giá quang học và trượt tới vạch +20 cm để hứng ảnh thật chữ F ngược chiều rõ nét nhất.",
        "instructionDetail": "Quan sát trực tiếp trên bề mặt Màn chắn (4): khi màn chắn lệch khỏi d' = 20 cm, chữ F bị mờ nhòe; khi đúng d' = 20 cm, màn hiện \"★ ẢNH THẬT RÕ NÉT (d' = 20.0 cm, k = 1.00x)\".",
        "requiredAssetIds": [
          "OL3D-EQP-SCR-0001",
          "OL3D-EQP-OPT-0001",
          "OL3D-EQP-FOB-0001"
        ],
        "highlightCapability": "opticalFocus"
      },
      {
        "stepNumber": 4,
        "id": "opt-4",
        "title": "Bước 4: Đổi thấu kính trong Hộp 6 thấu kính & khảo sát Ảnh ảo / Phân kì",
        "description": "Thử kéo Vật sáng chữ F vào trong khoảng tiêu cự (d = 6 cm < f) hoặc chọn thấu kính phân kì (-10 cm) từ Hộp thấu kính.",
        "instructionDetail": "Quan sát đường truyền 3 tia sáng đặc trưng và ảnh ảo chữ F màu xanh dương xuất hiện cùng chiều ở phía vật sáng (không hứng được trên màn chắn).",
        "requiredAssetIds": [
          "OL3D-EQP-LBX-0001",
          "OL3D-EQP-OPT-0001",
          "OL3D-EQP-SCR-0001"
        ],
        "highlightCapability": "opticalFocus"
      }
    ],
    "sampleResults": [
      {
        "id": "opt-d",
        "quantityName": "Khoảng cách từ Vật sáng chữ F (2) đến Thấu kính (3)",
        "symbol": "d = 2f",
        "value": 20,
        "unit": "cm (200 mm)",
        "formulaNote": "Đọc tại kim chỉ vạch của đế trượt Vật sáng F trên Giá quang học",
        "status": "verified"
      },
      {
        "id": "opt-dprime",
        "quantityName": "Khoảng cách từ Thấu kính (3) đến Màn chắn (4) khi ảnh nét nhất",
        "symbol": "d'",
        "value": 20,
        "unit": "cm (200 mm)",
        "formulaNote": "Ảnh thật chữ F ngược chiều, cao bằng vật (|k| = 1.00x)",
        "status": "verified"
      },
      {
        "id": "opt-f",
        "quantityName": "Tiêu cự thấu kính hội tụ đo được theo phương pháp đối xứng",
        "symbol": "f = (d + d') / 4",
        "value": 10,
        "unit": "cm (100 mm)",
        "formulaNote": "(20.0 + 20.0) / 4 = 10.0 cm (Khớp tiêu cự danh định +10 cm)",
        "status": "verified"
      }
    ]
  }
];

export const INITIAL_DEMO_SCENE: LabScene = {
  sceneId: 'OL3D-SCN-DEMO-0001',
  sceneRevision: 1,
  name: 'Đo khối lượng riêng của vật rắn',
  environmentId: 'OL3D-ENV-PHYSICS-0001',
  experimentId: 'OL3D-EXP-DENSITY-SOLID-0001',
  cameraPreset: {
    position: [0.0, 0.42, 0.82],
    target: [0.0, 0.09, 0.0],
  },
  updatedAt: '2026-10-28T09:00:00Z',
  instances: [
    {
      instanceId: 'inst-balance-01',
      assetId: 'OL3D-EQP-BAL-0001',
      assetVersion: '1.2.0',
      customLabel: 'Cân điện tử',
      parentZone: 'bench-scale',
      transform: {
        positionM: [-0.33, 0, 0.04],
        rotationRad: [0, 0.14, 0],
        displayScale: [1, 1, 1],
      },
      visible: true,
      locked: false,
      labelVisible: true,
      instanceState: {
        tareOffsetG: 0,
        measuredMassG: 0,
      },
    },
    {
      instanceId: 'inst-specimen-cyl-01',
      assetId: 'OL3D-EQP-SLD-0001',
      assetVersion: '1.0.0',
      customLabel: 'Vật rắn kim loại',
      parentZone: 'bench-main',
      transform: {
        positionM: [-0.14, 0, 0.15],
        rotationRad: [0, 0, 0],
        displayScale: [1, 1, 1],
      },
      visible: true,
      locked: false,
      labelVisible: true,
      instanceState: {
        attachmentSlot: 'bench',
      },
    },
    {
      instanceId: 'inst-cylinder-01',
      assetId: 'OL3D-EQP-CYL-0001',
      assetVersion: '1.1.0',
      customLabel: 'Ống đong 100 ml',
      parentZone: 'bench-glassware',
      transform: {
        positionM: [0.01, 0, -0.02],
        rotationRad: [0, 0, 0],
        displayScale: [1, 1, 1],
      },
      visible: true,
      locked: false,
      labelVisible: true,
      instanceState: {
        baseLiquidLevelMl: 50,
        liquidLevelMl: 50,
      },
    },
    {
      instanceId: 'inst-overflow-01',
      assetId: 'OL3D-EQP-OVF-0001',
      assetVersion: '1.0.0',
      customLabel: 'Bình tràn',
      parentZone: 'bench-glassware',
      transform: {
        positionM: [0.19, 0, 0.02],
        rotationRad: [0, 0, 0],
        displayScale: [1, 1, 1],
      },
      visible: true,
      locked: false,
      labelVisible: true,
      instanceState: {
        baseLiquidLevelMl: 210,
        liquidLevelMl: 210,
      },
    },
    {
      instanceId: 'inst-beaker-01',
      assetId: 'OL3D-EQP-BKR-0001',
      assetVersion: '1.0.2',
      customLabel: 'Cốc thủy tinh',
      parentZone: 'bench-glassware',
      transform: {
        positionM: [0.33, 0, 0.02],
        rotationRad: [0, -0.2, 0],
        displayScale: [1, 1, 1],
      },
      visible: true,
      locked: false,
      labelVisible: true,
      instanceState: {
        baseLiquidLevelMl: 40,
        liquidLevelMl: 40,
      },
    },
    {
      instanceId: 'inst-dispenser-01',
      assetId: 'OL3D-EQP-WDP-1000',
      assetVersion: '1.1.0',
      customLabel: 'Bình cấp nước (Van ml)',
      parentZone: 'bench-glassware',
      transform: {
        positionM: [0.48, 0, -0.04],
        rotationRad: [0, 0, 0],
        displayScale: [1, 1, 1],
      },
      visible: true,
      locked: false,
      labelVisible: true,
      instanceState: {
        baseLiquidLevelMl: 850,
        liquidLevelMl: 850,
        isValveOpen: false,
      },
    },
    {
      instanceId: 'inst-bomex-beaker-100',
      assetId: 'OL3D-EQP-BKR-100',
      assetVersion: '1.0.0',
      customLabel: 'Cốc đong 100ml (BOMEX)',
      parentZone: 'bench-glassware',
      transform: {
        positionM: [0.06, 0, 0.21],
        rotationRad: [0, 0, 0],
        displayScale: [1, 1, 1],
      },
      visible: true,
      locked: false,
      labelVisible: true,
      instanceState: {
        baseLiquidLevelMl: 0,
        liquidLevelMl: 0,
      },
    },
  ],
};
