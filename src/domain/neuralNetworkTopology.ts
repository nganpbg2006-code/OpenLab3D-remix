/**
 * OPENLAB 3D - NEURAL DEVICE TOPOLOGY DOMAIN DATA (BẢN TỐI ƯU SƯ PHẠM KHTN THCS)
 * Hệ tri thức topo Mạng Nơ-ron Thần kinh mô phỏng liên kết 36 thiết bị thí nghiệm
 * Bổ sung: Phân lớp THCS (Lớp 6, 7, 8, 9), Diễn giải ngôn ngữ học sinh, 
 * Tiến trình thực hành từng bước (Step-by-Step Guided Flows), Biểu tượng Vector & Mẹo an toàn.
 */

export type ThcsGrade = 'grade6' | 'grade7' | 'grade8' | 'grade9';

export interface NeuralDeviceNode {
  id: string;              // Slug archetype (ví dụ: 'electronic-balance')
  assetId: string;         // Mã chuẩn 'OL3D-EQP-BAL-0001'
  nameVi: string;          // Tên tiếng Việt chính quy
  nameStudent: string;     // Tên gọi thân mật, dễ nhớ cho học sinh
  shortKeyword: string;    // Từ khóa ngắn gọn (6-14 ký tự) hiển thị trên bản đồ không bị che chữ
  nameEn: string;          // Tên tiếng Anh
  category: DeviceCategory;
  subject: 'physics' | 'chemistry' | 'biology' | 'general';
  grades: ThcsGrade[];     // Thuộc chương trình lớp nào (6, 7, 8, 9)
  ports: string[];         // Các cổng connector sở hữu
  studentPorts: string[];  // Tên cổng thuần Việt thân thiện (ví dụ: "Đĩa cân", "Vòi xả")
  description: string;     // Vai trò sư phạm & nguyên lý hoạt động
  studentTip: string;      // Mẹo an toàn & hướng dẫn thao tác đúng
  mathFormula?: string;    // Công thức vật lý chuẩn quốc tế / giáo viên
  sgkFormula?: string;     // Công thức rút gọn quen thuộc trong SGK THCS
  glyphIcon: string;       // Biểu tượng cảm xúc / hình đại diện
}

export type DeviceCategory = 
  | 'G01_DIMENSION'     // Đo kích thước, chiều dài, góc
  | 'G02_MASS_FORCE'    // Cân, khối lượng, lực
  | 'G03_TIME_TEMP'     // Thời gian, nhiệt độ, điện môi trường
  | 'G04_VOLUMETRIC'    // Chứa & đo thể tích chất lỏng
  | 'G05_CHEM_HEATING'  // Hóa học, gia nhiệt, biến đổi
  | 'G06_OPTICS'        // Quang học, nguồn sáng, thấu kính
  | 'G07_ELECTRICITY'   // Mạch điện, nguồn điện, cảm ứng
  | 'G08_MECHANICS'     // Cơ học, đòn bẩy, bình thông nhau
  | 'G09_BIOLOGY'       // Sinh học, kính hiển vi, di truyền
  | 'G10_FLUID_SUPPLY'; // Cung cấp lưu chất

export type SynapseKind = 
  | 'mechanical_support'       // Đỡ cơ học (đĩa cân, đợt kệ)
  | 'mechanical_clamp'         // Ngàm kẹp ôm khít (thước cặp)
  | 'mechanical_hook'          // Treo đàn hồi (lực kế lò xo)
  | 'mechanical_rail'          // Ray trượt định hướng 1D (ray quang học)
  | 'optical_carrier'          // Con trượt đế mang linh kiện quang
  | 'optical_alignment'        // Đồng trục truyền tia sáng và tạo ảnh
  | 'optical_refraction'       // Khúc xạ / tán sắc / phản xạ toàn phần
  | 'electrical_terminal'      // Cọc cắm đầu bắp chuối Ø4mm
  | 'electrical_interlock'     // Khóa liên động mạch kín có điều kiện
  | 'fluid_spout'              // Mỏ rót / vòi xả chất lỏng
  | 'fluid_receptacle'         // Miệng hứng / lỗ nhận vật mẫu
  | 'submersion'               // Thả chìm chiếm chỗ đo thể tích
  | 'buoyancy_force'           // Lực đẩy Archimedes ngược chiều trọng lực
  | 'electromagnetic_induction'// Cảm ứng điện từ biến thiên từ thông
  | 'thermal_exchange'         // Truyền nhiệt đối lưu và dẫn nhiệt
  | 'microscopy_dock';         // Gá mẫu soi vi thể trên bàn sa trượt

export interface NeuralSynapseEdge {
  id: string;
  source: string;        // ID node phát tín hiệu / tác nhân
  target: string;        // ID node nhận tín hiệu / đối tượng
  type: SynapseKind;
  connectorId?: string;  // Khớp với RWSS Connector Registry
  weight: number;        // Trọng số nơ-ron (độ bền vững / cường độ tương tác: 0.1 - 1.0)
  signalSpeed: number;   // Tốc độ truyền xung thần kinh mô phỏng
  causalRule: string;    // Quy tắc nhân quả chi phối (chuyên gia)
  studentCausal: string; // Giải thích nhân quả tự nhiên cho học sinh
  experimentContext: string; // Bài thí nghiệm tiêu biểu SGK
}

export interface ExperimentStep {
  stepNumber: number;
  title: string;
  instruction: string;
  activeDeviceIds: string[];
  activeSynapseIds: string[];
  focusNote: string;
}

export interface ExperimentMacroCluster {
  id: string;
  title: string;
  subject: string;
  grade: 'KHTN 6' | 'KHTN 7' | 'KHTN 8' | 'KHTN 9';
  gradeCode: ThcsGrade;
  deviceIds: string[];
  description: string;
  studentGoal: string;   // Mục tiêu bài học dạng hỏi - đáp dễ nhớ
  coreEquation: string;
  sgkFormula: string;
  steps: ExperimentStep[]; // Các bước thực hành theo SGK
}

// -------------------------------------------------------------
// 1. DANH MỤC 36 THIẾT BỊ NƠ-RON TỐI ƯU CHO HỌC SINH THCS
// -------------------------------------------------------------
export const NEURAL_DEVICE_NODES: NeuralDeviceNode[] = [
  // G01 - Chiều dài & Kích thước
  {
    id: 'vernier-caliper',
    assetId: 'OL3D-EQP-CAL-0001',
    nameVi: 'Thước cặp du xích 150 mm',
    nameStudent: 'Thước kẹp đo chính xác',
    shortKeyword: 'Thước kẹp',
    nameEn: 'Vernier Caliper 150mm',
    category: 'G01_DIMENSION',
    subject: 'physics',
    grades: ['grade6', 'grade8'],
    ports: ['CONN_VERNIER_CALIPER_JAWS'],
    studentPorts: ['Ngàm kẹp ngoài', 'Ngàm đo trong'],
    description: 'Đo đường kính ngoài, đường kính trong và độ sâu với độ chính xác 0.02 mm.',
    studentTip: 'Nhẹ nhàng trượt ngàm kẹp ôm vừa khít vật thể, không siết quá mạnh làm xước dụng cụ!',
    mathFormula: 'd = M + \\frac{V}{n} \\cdot \\Delta x',
    sgkFormula: 'Độ chính xác: 0.02 mm (1/50 mm)',
    glyphIcon: '📏'
  },
  {
    id: 'ruler-30',
    assetId: 'OL3D-EQP-RUL-0001',
    nameVi: 'Thước thẳng chia vạch 30 cm',
    nameStudent: 'Thước kẻ đo chiều dài',
    shortKeyword: 'Thước kẻ',
    nameEn: 'Graduated Ruler 30cm',
    category: 'G01_DIMENSION',
    subject: 'general',
    grades: ['grade6', 'grade7', 'grade8', 'grade9'],
    ports: [],
    studentPorts: ['Thân chia vạch milimet'],
    description: 'Đo kích thước hình học tổng thể, khoảng cách bố trí trên bàn.',
    studentTip: 'Đặt mắt nhìn vuông góc với vạch chia để tránh sai số đo nhé!',
    mathFormula: 'L = x_2 - x_1 \\pm 0.5\\,\\text{mm}',
    sgkFormula: 'ĐCNN = 1 mm',
    glyphIcon: '📐'
  },

  // G02 - Cân, khối lượng, lực
  {
    id: 'electronic-balance',
    assetId: 'OL3D-EQP-BAL-0001',
    nameVi: 'Cân điện tử hiện số 500 g',
    nameStudent: 'Cân điện tử hiện số',
    shortKeyword: 'Cân điện tử',
    nameEn: 'Precision Electronic Balance 500g',
    category: 'G02_MASS_FORCE',
    subject: 'physics',
    grades: ['grade6', 'grade8'],
    ports: ['CONN_BALANCE_PAN'],
    studentPorts: ['Đĩa cân inox', 'Nút trừ bì TARE'],
    description: 'Đo khối lượng tịnh với độ phân giải 0.01 g, tích hợp nút trừ bì TARE.',
    studentTip: 'Nhớ bấm nút TARE để đưa màn hình về 0.00g khi đã đặt cốc lên đĩa cân trước khi rót nước!',
    mathFormula: 'm_{\\text{net}} = \\max(0, m_{\\text{gross}} - m_{\\text{tare}})',
    sgkFormula: 'Khối lượng = Số chỉ trên màn hình (gam)',
    glyphIcon: '⚖️'
  },
  {
    id: 'calibration-weight',
    assetId: 'OL3D-EQP-WGT-0001',
    nameVi: 'Bộ quả cân chuẩn bằng đồng 50 g',
    nameStudent: 'Quả cân chuẩn 50g',
    shortKeyword: 'Quả cân 50g',
    nameEn: '50g Brass Calibration Weight',
    category: 'G02_MASS_FORCE',
    subject: 'physics',
    grades: ['grade6', 'grade8'],
    ports: [],
    studentPorts: ['Khuyên móc đỉnh', 'Đáy phẳng tiếp xúc'],
    description: 'Chuẩn khối lượng đối chứng, dùng kiểm định cân và tạo tải trọng.',
    studentTip: 'Cầm quả cân ở phần núm trên đỉnh, tránh chạm tay vào thân để không dính mồ hôi làm sai số!',
    mathFormula: 'm_{\\text{ref}} = 50.00 \\pm 0.005\\,\\text{g}',
    sgkFormula: 'Khối lượng chuẩn: m = 50 gam',
    glyphIcon: '🥉'
  },
  {
    id: 'solid-cylinder',
    assetId: 'OL3D-EQP-SLD-0001',
    nameVi: 'Khối trụ đặc hợp kim nhôm',
    nameStudent: 'Khối nhôm hình trụ',
    shortKeyword: 'Khối nhôm',
    nameEn: 'Solid Aluminum Cylinder Specimen',
    category: 'G02_MASS_FORCE',
    subject: 'physics',
    grades: ['grade6', 'grade8'],
    ports: [],
    studentPorts: ['Thân trụ kim loại', 'Quai móc treo'],
    description: 'Mẫu vật khảo sát khối lượng riêng và thể tích chiếm chỗ.',
    studentTip: 'Khối nhôm nhẹ hơn đồng thau, chìm trong nước nhưng chịu lực đẩy Ác-si-mét nâng lên.',
    mathFormula: 'D = \\frac{m}{V} \\approx 2.70\\,\\text{g/cm}^3',
    sgkFormula: 'Khối lượng riêng: D = m / V',
    glyphIcon: '🔩'
  },
  {
    id: 'solid-sphere',
    assetId: 'OL3D-EQP-SPH-0001',
    nameVi: 'Khối bi cầu thép không gỉ',
    nameStudent: 'Viên bi thép tròn',
    shortKeyword: 'Bi thép',
    nameEn: 'Stainless Steel Sphere Specimen',
    category: 'G02_MASS_FORCE',
    subject: 'physics',
    grades: ['grade6', 'grade8'],
    ports: [],
    studentPorts: ['Bề mặt cầu trơn'],
    description: 'Mẫu vật đo thể tích qua đường kính d = 2R và thí nghiệm thả chìm.',
    studentTip: 'Thả nhẹ tay vào ống đong nghiêng để bi trượt xuống từ từ, không làm vỡ đáy thủy tinh!',
    mathFormula: 'V = \\frac{4}{3}\\pi R^3',
    sgkFormula: 'Thể tích: V = 4/3 · 3.14 · R³',
    glyphIcon: '⚪'
  },
  {
    id: 'solid-block',
    assetId: 'OL3D-EQP-BLK-0001',
    nameVi: 'Khối hộp chữ nhật đồng thau',
    nameEn: 'Rectangular Brass Block Specimen',
    nameStudent: 'Khối đồng hình hộp',
    shortKeyword: 'Khối đồng',
    category: 'G02_MASS_FORCE',
    subject: 'physics',
    grades: ['grade6', 'grade8'],
    ports: [],
    studentPorts: ['6 mặt phẳng đồng thau'],
    description: 'Mẫu vật khối lượng riêng lớn, kích thước lớn hơn miệng ống đong.',
    studentTip: 'Khối này to hơn miệng ống đong (chiều ngang 30mm > 28mm), các em phải dùng Bình tràn Eureka nhé!',
    mathFormula: 'V = a \\cdot b \\cdot c',
    sgkFormula: 'V = Dài × Rộng × Cao',
    glyphIcon: '📦'
  },
  {
    id: 'hollow-cylinder',
    assetId: 'OL3D-EQP-HLW-0001',
    nameVi: 'Ống trụ kim loại rỗng khoang kín',
    nameStudent: 'Ống kim loại rỗng ruột',
    shortKeyword: 'Ống rỗng',
    nameEn: 'Hollow Metallic Cylinder',
    category: 'G02_MASS_FORCE',
    subject: 'physics',
    grades: ['grade8'],
    ports: [],
    studentPorts: ['Khoang rỗng bên trong'],
    description: 'Mẫu vật khảo sát vật nổi/chìm và lực đẩy Archimedes.',
    studentTip: 'Mặc dù làm bằng kim loại nhưng có ruột rỗng chứa không khí nên vật có thể nổi trên mặt nước!',
    mathFormula: 'F_A = \\rho_{\\text{nước}} \\cdot g \\cdot V_{\\text{chìm}}',
    sgkFormula: 'Lực đẩy Ac-si-met: F_A = d · V_chìm',
    glyphIcon: '🕳️'
  },
  {
    id: 'spring-dynamometer',
    assetId: 'OL3D-EQP-DYN-0001',
    nameVi: 'Lực kế lò xo ống trụ 5 N',
    nameStudent: 'Lực kế đo độ lớn lực',
    shortKeyword: 'Lực kế 5N',
    nameEn: '5N Tubular Spring Dynamometer',
    category: 'G02_MASS_FORCE',
    subject: 'physics',
    grades: ['grade6', 'grade8'],
    ports: ['CONN_SPRING_DYNO_HOOK'],
    studentPorts: ['Móc treo dưới', 'Vòng cầm trên'],
    description: 'Đo lực kéo đàn hồi và trọng lượng vật treo theo định luật Hooke.',
    studentTip: 'Giữ lực kế thẳng đứng và chỉnh kim về đúng vạch 0 trước khi móc vật nặng.',
    mathFormula: 'F = k \\cdot \\Delta l = m \\cdot g',
    sgkFormula: 'Trọng lượng: P = 10 · m (Newton)',
    glyphIcon: '🪝'
  },

  // G03 - Thời gian, nhiệt độ
  {
    id: 'thermometer',
    assetId: 'OL3D-EQP-THM-0001',
    nameVi: 'Nhiệt kế rượu chia độ -10..110°C',
    nameStudent: 'Nhiệt kế đo nhiệt độ',
    shortKeyword: 'Nhiệt kế',
    nameEn: 'Alcohol Thermometer -10..110°C',
    category: 'G03_TIME_TEMP',
    subject: 'general',
    grades: ['grade6', 'grade7', 'grade8'],
    ports: [],
    studentPorts: ['Bầu cảm ứng nhiệt', 'Ống mao dẫn đỏ'],
    description: 'Cảm ứng nhiệt độ chất lỏng và môi trường phòng lab theo dãn nở nhiệt.',
    studentTip: 'Không để bầu nhiệt kế chạm đáy cốc đang đun để tránh đo sai nhiệt độ của ngọn lửa!',
    mathFormula: '\\Delta V = V_0 \\cdot \\beta \\cdot \\Delta T',
    sgkFormula: 'Nhiệt độ đọc theo mực đỏ (°C)',
    glyphIcon: '🌡️'
  },
  {
    id: 'stopwatch',
    assetId: 'OL3D-EQP-STW-0001',
    nameVi: 'Đồng hồ bấm giây hiện số 0.01 s',
    nameStudent: 'Đồng hồ bấm giây',
    shortKeyword: 'Đồng hồ bấm giây',
    nameEn: 'Digital Precision Stopwatch',
    category: 'G03_TIME_TEMP',
    subject: 'general',
    grades: ['grade6', 'grade7'],
    ports: [],
    studentPorts: ['Nút Start/Stop', 'Nút Reset về 0'],
    description: 'Đo chu kỳ dao động, thời gian rơi tự do và tốc độ phản ứng.',
    studentTip: 'Bấm Start ngay khi bắt đầu hiện tượng và bấm Stop ngay khi kết thúc.',
    mathFormula: 't = t_{\\text{stop}} - t_{\\text{start}}',
    sgkFormula: 'Thời gian: giây (s)',
    glyphIcon: '⏱️'
  },

  // G04 - Thể tích & Dụng cụ thủy tinh
  {
    id: 'graduated-cylinder',
    assetId: 'OL3D-EQP-CYL-0001',
    nameVi: 'Ống đong thủy tinh 100 ml',
    nameStudent: 'Ống đong đo thể tích',
    shortKeyword: 'Ống đong',
    nameEn: '100ml Graduated Cylinder',
    category: 'G04_VOLUMETRIC',
    subject: 'physics',
    grades: ['grade6', 'grade8'],
    ports: ['CONN_CYLINDER_APERTURE'],
    studentPorts: ['Miệng rót trên', 'Vạch chia mililit'],
    description: 'Đo thể tích chất lỏng và vật chìm với đường kính miệng trong 28 mm.',
    studentTip: 'Đọc thể tích tại đáy của mặt khum chất lỏng cong lõm nhé các em!',
    mathFormula: 'V = V_2 - V_1',
    sgkFormula: 'Thể tích vật = Nước dâng lên (V2 - V1)',
    glyphIcon: '🧪'
  },
  {
    id: 'beaker-250',
    assetId: 'OL3D-EQP-BKR-0001',
    nameVi: 'Cốc thủy tinh chịu nhiệt 250 ml',
    nameStudent: 'Cốc thủy tinh 250ml',
    shortKeyword: 'Cốc 250ml',
    nameEn: '250ml Low-Form Beaker',
    category: 'G04_VOLUMETRIC',
    subject: 'general',
    grades: ['grade6', 'grade7', 'grade8', 'grade9'],
    ports: ['CONN_BEAKER_RIM'],
    studentPorts: ['Miệng vòi rót', 'Đáy chịu nhiệt'],
    description: 'Cốc hứng nước, pha hóa chất và thực hiện đun nóng đối lưu.',
    studentTip: 'Cốc thủy tinh khi đun phải đặt trên lưới tản nhiệt amiăng để không bị nứt vỡ.',
    mathFormula: 'V \\approx 250\\,\\text{ml}',
    sgkFormula: 'Dung tích chứa: 250 mL',
    glyphIcon: '🥛'
  },
  {
    id: 'overflow-can',
    assetId: 'OL3D-EQP-OVF-0001',
    nameVi: 'Bình tràn Eureka 250 ml',
    nameStudent: 'Bình tràn Eureka có vòi',
    shortKeyword: 'Bình tràn',
    nameEn: 'Eureka Overflow Can 250ml',
    category: 'G04_VOLUMETRIC',
    subject: 'physics',
    grades: ['grade6', 'grade8'],
    ports: ['CONN_OVERFLOW_CAN_APERTURE', 'CONN_OVERFLOW_CAN_SPOUT'],
    studentPorts: ['Miệng bình thả vật', 'Vòi xả tràn nghiêng'],
    description: 'Đo thể tích các vật không lọt ống đong qua vòi xả tràn nghiêng 30°.',
    studentTip: 'Chờ nước chảy hết qua vòi tràn trước khi thả vật vào, để chỉ hứng đúng lượng nước bị chiếm chỗ!',
    mathFormula: 'V_{\\text{vật}} = V_{\\text{nước tràn}}',
    sgkFormula: 'Vật chìm đẩy nước tràn ra cốc hứng',
    glyphIcon: '🫗'
  },
  {
    id: 'erlenmeyer-flask',
    assetId: 'OL3D-EQP-FLK-0001',
    nameVi: 'Bình tam giác Erlenmeyer 250 ml',
    nameStudent: 'Bình tam giác',
    shortKeyword: 'Bình tam giác',
    nameEn: '250ml Erlenmeyer Flask',
    category: 'G04_VOLUMETRIC',
    subject: 'chemistry',
    grades: ['grade8', 'grade9'],
    ports: [],
    studentPorts: ['Cổ bình thon', 'Đáy rộng'],
    description: 'Bình lắc phản ứng hóa học, chuẩn độ và chứa dung dịch.',
    studentTip: 'Cổ thon giúp các em lắc tròn dung dịch mà không bị bắn hóa chất ra ngoài.',
    mathFormula: 'C_1 V_1 = C_2 V_2',
    sgkFormula: 'Bình pha chế & lắc dung dịch',
    glyphIcon: '⚗️'
  },

  // G05 - Hóa học & Gia nhiệt
  {
    id: 'test-tube',
    assetId: 'OL3D-EQP-TUB-0001',
    nameVi: 'Ống nghiệm thủy tinh chịu nhiệt 150 mm',
    nameStudent: 'Ống nghiệm nhỏ',
    shortKeyword: 'Ống nghiệm',
    nameEn: 'Glass Test Tube 150mm',
    category: 'G05_CHEM_HEATING',
    subject: 'chemistry',
    grades: ['grade7', 'grade8', 'grade9'],
    ports: [],
    studentPorts: ['Miệng ống', 'Đáy tròn chịu nhiệt'],
    description: 'Thực hiện phản ứng định tính hóa học với lượng nhỏ hóa chất.',
    studentTip: 'Khi đun ống nghiệm, luôn hướng miệng ống về nơi không có người!',
    mathFormula: 'v = k[A]^a [B]^b',
    sgkFormula: 'Dụng cụ phản ứng lượng nhỏ',
    glyphIcon: '🧪'
  },
  {
    id: 'alcohol-lamp',
    assetId: 'OL3D-EQP-ALC-0001',
    nameVi: 'Đèn cồn thí nghiệm',
    nameStudent: 'Đèn cồn đốt nóng',
    shortKeyword: 'Đèn cồn',
    nameEn: 'Glass Spirit Alcohol Lamp',
    category: 'G05_CHEM_HEATING',
    subject: 'chemistry',
    grades: ['grade6', 'grade8', 'grade9'],
    ports: [],
    studentPorts: ['Tim bấc đèn', 'Nắp đậy dập lửa'],
    description: 'Nguồn gia nhiệt bằng cồn 90°, nhiệt độ ngọn lửa 600 - 800°C.',
    studentTip: 'Tuyệt đối không thổi bằng miệng! Hãy đậy nắp đèn cồn lại để dập tắt ngọn lửa an toàn.',
    mathFormula: 'Q = m_{\\text{cồn}} \\cdot q_{\\text{cháy}}',
    sgkFormula: 'Nguồn nhiệt đun sôi dung dịch',
    glyphIcon: '🔥'
  },
  {
    id: 'porcelain-dish',
    assetId: 'OL3D-EQP-DSH-0001',
    nameVi: 'Bát sứ chịu nhiệt cô cạn',
    nameStudent: 'Bát sứ cô cạn muối',
    shortKeyword: 'Bát sứ',
    nameEn: 'Porcelain Evaporating Dish',
    category: 'G05_CHEM_HEATING',
    subject: 'chemistry',
    grades: ['grade8'],
    ports: [],
    studentPorts: ['Lòng bát chịu lửa', 'Mỏ rót nhỏ'],
    description: 'Cô đặc dung dịch muối và nung chất rắn ở nhiệt độ cao.',
    studentTip: 'Dùng kẹp gắp bát sứ nóng, không dùng tay trần chạm vào bát sứ vừa đun!',
    mathFormula: 'm_{\\text{muối}} = m_{\\text{sau}} - m_{\\text{bát}}',
    sgkFormula: 'Đun cạn nước thu muối ăn kết tinh',
    glyphIcon: '🥣'
  },
  {
    id: 'separatory-funnel',
    assetId: 'OL3D-EQP-SEP-0001',
    nameVi: 'Phễu chiết quả lê có khóa',
    nameStudent: 'Phễu chiết tách chất lỏng',
    shortKeyword: 'Phễu chiết',
    nameEn: 'Pear-shaped Separatory Funnel',
    category: 'G05_CHEM_HEATING',
    subject: 'chemistry',
    grades: ['grade8'],
    ports: [],
    studentPorts: ['Khóa xả đáy', 'Miệng nạp có nút'],
    description: 'Tách hai chất lỏng không hòa tan có khối lượng riêng khác nhau.',
    studentTip: 'Vặn khóa từ từ để chất lỏng nặng ở dưới chảy hết xuống cốc thì khóa ngay lại!',
    mathFormula: '\\rho_{\\text{dưới}} > \\rho_{\\text{trên}}',
    sgkFormula: 'Tách dầu ăn và nước',
    glyphIcon: '⏳'
  },
  {
    id: 'distillation-flask',
    assetId: 'OL3D-EQP-DST-0001',
    nameVi: 'Bình cầu có nhánh chưng cất 250 ml',
    nameStudent: 'Bình cầu chưng cất',
    shortKeyword: 'Bình cầu',
    nameEn: 'Side-Arm Distillation Flask 250ml',
    category: 'G05_CHEM_HEATING',
    subject: 'chemistry',
    grades: ['grade8', 'grade9'],
    ports: [],
    studentPorts: ['Nhánh dẫn hơi', 'Miệng cắm nhiệt kế'],
    description: 'Chưng cất phân đoạn tách các chất có nhiệt độ sôi khác nhau.',
    studentTip: 'Hơi rượu bay lên nhánh nghiêng gặp lạnh sẽ ngưng tụ thành giọt lỏng chảy ra.',
    mathFormula: 'T_{\\text{boil, 1}} < T_{\\text{boil, 2}}',
    sgkFormula: 'Tách rượu ra khỏi nước bằng nhiệt độ sôi',
    glyphIcon: '🍶'
  },

  // G06 - Quang học & Ánh sáng
  {
    id: 'optical-lamp',
    assetId: 'OL3D-EQP-OLP-0001',
    nameVi: 'Đèn chiếu sáng Halogen quang học',
    nameStudent: 'Đèn chiếu tia sáng',
    shortKeyword: 'Đèn chiếu',
    nameEn: 'Halogen Optical Lamp with Apertures',
    category: 'G06_OPTICS',
    subject: 'physics',
    grades: ['grade7', 'grade9'],
    ports: ['CONN_LAMP_DC_IN_POS', 'CONN_LAMP_DC_IN_NEG', 'CONN_OPTICAL_LAMP_CARRIAGE'],
    studentPorts: ['Cọc cắm dây điện đỏ (+)', 'Cọc cắm dây đen (-)', 'Chân gá ray trượt'],
    description: 'Nguồn phát chùm tia 1, 2, 3 tia song song hoặc phân kỳ, liên động nguồn điện.',
    studentTip: 'Đèn này không có pin bên trong! Bắt buộc phải cắm 2 dây vào Hộp Nguồn và bật công tắc thì đèn mới sáng.',
    mathFormula: 'I(V) = I_0 \\left(\\frac{V}{12}\\right)^{3.5}',
    sgkFormula: 'Nguồn phát 1, 2, 3 tia sáng thẳng',
    glyphIcon: '💡'
  },
  {
    id: 'optical-power-supply',
    assetId: 'OL3D-EQP-PSU-0001',
    nameVi: 'Nguồn điện hạ áp thí nghiệm 3V–12V',
    nameStudent: 'Bộ nguồn điện thí nghiệm',
    shortKeyword: 'Nguồn điện DC',
    nameEn: 'Low-Voltage Lab Power Supply',
    category: 'G06_OPTICS',
    subject: 'physics',
    grades: ['grade8', 'grade9'],
    ports: ['CONN_PSU_DC_OUT_POS', 'CONN_PSU_DC_OUT_NEG'],
    studentPorts: ['Cực dương đỏ (+)', 'Cực âm đen (-)'],
    description: 'Cấp điện áp điều chỉnh an toàn cho đèn halogen qua cáp 4mm.',
    studentTip: 'Vặn núm chọn điện áp về 6V hoặc 12V trước khi bật công tắc nguồn.',
    mathFormula: 'P = U \\cdot I',
    sgkFormula: 'Cung cấp dòng điện an toàn 3V - 12V',
    glyphIcon: '🔋'
  },
  {
    id: 'optical-bench',
    assetId: 'OL3D-EQP-OBN-0001',
    nameVi: 'Giá quang học 90 cm chia vạch mm',
    nameStudent: 'Thanh ray quang học 90cm',
    shortKeyword: 'Ray quang học',
    nameEn: '90cm Graduated Optical Bench Rail',
    category: 'G06_OPTICS',
    subject: 'physics',
    grades: ['grade7', 'grade9'],
    ports: ['CONN_OPTICAL_BENCH_RAIL'],
    studentPorts: ['Rãnh trượt dẫn hướng', 'Thước đo milimet hai bên'],
    description: 'Ray trượt nhôm định hướng đồng trục cho đèn, vật F, thấu kính và màn hứng.',
    studentTip: 'Các thiết bị gắn lên thanh ray này sẽ tự động thẳng hàng cùng độ cao với nhau.',
    mathFormula: 'x \\in [-45, +45]\\,\\text{cm}',
    sgkFormula: 'Thanh ray giữ dụng cụ thẳng hàng',
    glyphIcon: '🛤️'
  },
  {
    id: 'frosted-f-object',
    assetId: 'OL3D-EQP-FOB-0001',
    nameVi: 'Vật sáng kính mờ hình chữ F',
    nameStudent: 'Tấm kính chữ F phát sáng',
    shortKeyword: 'Vật chữ F',
    nameEn: 'Frosted Glass Letter-F Luminous Object',
    category: 'G06_OPTICS',
    subject: 'physics',
    grades: ['grade9'],
    ports: [],
    studentPorts: ['Mặt kính chữ F', 'Đế trượt gắn ray'],
    description: 'Vật phát sáng không đối xứng giúp nhận biết chiều ảnh thật/ảo.',
    studentTip: 'Chữ F có nét trên nét dưới không đối xứng, giúp các em dễ dàng thấy ảnh bị lộn ngược!',
    mathFormula: 'h = 20.0\\,\\text{mm}',
    sgkFormula: 'Vật sáng tạo ảnh (Cao 2 cm)',
    glyphIcon: '🅰️'
  },
  {
    id: 'optical-lens',
    assetId: 'OL3D-EQP-OPT-0001',
    nameVi: 'Thấu kính hội tụ/phân kỳ trên đế trượt',
    nameStudent: 'Thấu kính tạo ảnh',
    shortKeyword: 'Thấu kính',
    nameEn: 'Optical Lens on Rider Saddle',
    category: 'G06_OPTICS',
    subject: 'physics',
    grades: ['grade9'],
    ports: ['CONN_LENS_HOLDER_SOCKET'],
    studentPorts: ['Vành giữ kính tròn', 'Đế trượt khóa ốc'],
    description: 'Tạo ảnh thực và ảo theo phương trình thấu kính Gauss.',
    studentTip: 'Thấu kính hội tụ có rìa mỏng, thấu kính phân kỳ có rìa dày hơn phần giữa.',
    mathFormula: '\\frac{1}{f} = \\frac{1}{d} + \\frac{1}{d\'}',
    sgkFormula: '1/f = 1/d + 1/d\' (Tiêu cự f = 10 cm)',
    glyphIcon: '🔍'
  },
  {
    id: 'optical-lens-box',
    assetId: 'OL3D-EQP-LBX-0001',
    nameVi: 'Hộp bộ 6 thấu kính tiêu chuẩn',
    nameStudent: 'Hộp chứa các thấu kính',
    shortKeyword: 'Hộp thấu kính',
    nameEn: 'Storage Box of 6 Standard Lenses',
    category: 'G06_OPTICS',
    subject: 'physics',
    grades: ['grade9'],
    ports: [],
    studentPorts: ['6 ngăn chứa lót nhung'],
    description: 'Chứa các thấu kính f = +5, +10, +15, -10, -20 cm và bản mặt song song.',
    studentTip: 'Cầm mép vành nhựa thấu kính, không chạm tay vào mặt thủy tinh trong suốt.',
    mathFormula: 'D = \\frac{1}{f}',
    sgkFormula: 'Gồm các thấu kính +5cm, +10cm, -10cm',
    glyphIcon: '🧰'
  },
  {
    id: 'optical-screen',
    assetId: 'OL3D-EQP-SCR-0001',
    nameVi: 'Màn chắn hứng ảnh trắng mờ',
    nameStudent: 'Màn hứng ảnh trắng',
    shortKeyword: 'Màn hứng ảnh',
    nameEn: 'Matte White Optical Projection Screen',
    category: 'G06_OPTICS',
    subject: 'physics',
    grades: ['grade9'],
    ports: [],
    studentPorts: ['Mặt phẳng màu trắng mờ', 'Đế trượt trên ray'],
    description: 'Hứng ảnh thật của vật sáng F qua thấu kính hội tụ.',
    studentTip: 'Dịch chuyển màn hứng chậm rãi trên ray cho đến khi thấy chữ F hiện lên nét nhất.',
    mathFormula: 'k = -\\frac{d\'}{d}',
    sgkFormula: 'Màn hứng ảnh thật ngược chiều',
    glyphIcon: '🖥️'
  },
  {
    id: 'laser-source',
    assetId: 'OL3D-EQP-LSR-0001',
    nameVi: 'Nguồn sáng Laser 3 tia song song',
    nameStudent: 'Hộp đèn Laser 3 tia',
    shortKeyword: 'Đèn Laser 3 tia',
    nameEn: '3-Beam Optical Laser Ray Box',
    category: 'G06_OPTICS',
    subject: 'physics',
    grades: ['grade7', 'grade9'],
    ports: [],
    studentPorts: ['3 khe phát tia laser đỏ', 'Công tắc gạt'],
    description: 'Chiếu 3 tia laser hẹp kiểm chứng định luật truyền thẳng và khúc xạ.',
    studentTip: 'Tuyệt đối không nhìn thẳng vào lỗ phát laser hoặc chiếu vào mắt bạn bè!',
    mathFormula: '\\lambda = 650\\,\\text{nm}',
    sgkFormula: 'Phát 3 tia sáng laser song song màu đỏ',
    glyphIcon: '🔴'
  },
  {
    id: 'semicircular-slab',
    assetId: 'OL3D-EQP-SLB-0001',
    nameVi: 'Bản bán trụ thủy tinh & Đĩa chia độ 360°',
    nameStudent: 'Khối bán trụ thủy tinh',
    shortKeyword: 'Bán trụ kính',
    nameEn: 'Semicircular Glass Block & Protractor',
    category: 'G06_OPTICS',
    subject: 'physics',
    grades: ['grade9'],
    ports: [],
    studentPorts: ['Mặt phẳng kính', 'Mặt cong bán nguyệt'],
    description: 'Khảo sát định luật khúc xạ ánh sáng và góc tới hạn phản xạ toàn phần.',
    studentTip: 'Chiếu tia laser vào đúng tâm O của đĩa tròn để quan sát góc khúc xạ r bị gãy khúc!',
    mathFormula: 'n_1 \\sin i = n_2 \\sin r',
    sgkFormula: 'Tia sáng bị gãy khúc khi qua thủy tinh',
    glyphIcon: '🌓'
  },
  {
    id: 'prism',
    assetId: 'OL3D-EQP-PRM-0001',
    nameVi: 'Lăng kính tam giác đều tán sắc',
    nameStudent: 'Lăng kính 7 sắc cầu vồng',
    shortKeyword: 'Lăng kính',
    nameEn: 'Equilateral Glass Dispersion Prism',
    category: 'G06_OPTICS',
    subject: 'physics',
    grades: ['grade9'],
    ports: [],
    studentPorts: ['3 mặt kính tam giác đều', 'Trục xoay giá đỡ'],
    description: 'Tán sắc chùm ánh sáng trắng thành dải 7 màu biến thiên liên tục.',
    studentTip: 'Ánh sáng trắng bị lăng kính tách thành dải màu Cầu Vồng: Đỏ, Cam, Vàng, Lục, Lam, Chàm, Tím.',
    mathFormula: 'n_{\\text{tím}} > n_{\\text{đỏ}}',
    sgkFormula: 'Tách ánh sáng trắng thành 7 màu cầu vồng',
    glyphIcon: '🌈'
  },
  {
    id: 'magnifying-glass',
    assetId: 'OL3D-EQP-MAG-0001',
    nameVi: 'Kính lúp cầm tay độ bội giác 5x',
    nameStudent: 'Kính lúp cầm tay',
    shortKeyword: 'Kính lúp',
    nameEn: '5x Handheld Magnifying Glass',
    category: 'G06_OPTICS',
    subject: 'general',
    grades: ['grade6', 'grade7'],
    ports: [],
    studentPorts: ['Tròng kính lồi', 'Tay cầm nhựa'],
    description: 'Quan sát mặt khum chất lỏng, vạch chia nhỏ và tiêu bản sinh học.',
    studentTip: 'Đưa kính lúp gần sát mắt rồi dịch chuyển vật mẫu từ từ để nhìn thấy phóng to rõ nhất.',
    mathFormula: 'G = 5\\times',
    sgkFormula: 'Phóng đại hình ảnh gấp 5 lần',
    glyphIcon: '🔎'
  },

  // G07 - Mạch điện & Cảm ứng
  {
    id: 'galvanometer',
    assetId: 'OL3D-EQP-GLV-0001',
    nameVi: 'Điện kế nhạy vạch 0 ở giữa',
    nameStudent: 'Điện kế nhạy (Kim ở giữa)',
    shortKeyword: 'Điện kế nhạy',
    nameEn: 'Center-Zero Sensitive Galvanometer',
    category: 'G07_ELECTRICITY',
    subject: 'physics',
    grades: ['grade9'],
    ports: [],
    studentPorts: ['Cọc nối dây bên trái', 'Cọc nối dây bên phải'],
    description: 'Phát hiện dòng điện cảm ứng siêu nhỏ và xác định chiều dòng điện.',
    studentTip: 'Khi có dòng điện chạy qua, kim sẽ lệch sang trái hoặc sang phải báo hiệu chiều dòng điện.',
    mathFormula: 'I \\propto \\theta',
    sgkFormula: 'Phát hiện dòng điện cảm ứng siêu nhỏ',
    glyphIcon: '🧭'
  },
  {
    id: 'digital-multimeter',
    assetId: 'OL3D-EQP-DMM-0001',
    nameVi: 'Đồng hồ vạn năng hiện số AC/DC',
    nameStudent: 'Đồng hồ đo điện hiện số',
    shortKeyword: 'Đồng hồ DMM',
    nameEn: 'Digital Multimeter (AC/DC)',
    category: 'G07_ELECTRICITY',
    subject: 'physics',
    grades: ['grade8', 'grade9'],
    ports: [],
    studentPorts: ['Que đo đỏ (+)', 'Que đo đen (COM)'],
    description: 'Đo điện áp, dòng điện và điện trở linh kiện chính xác.',
    studentTip: 'Chọn đúng nấc đo V (Vôn) khi đo nguồn điện, không để nhầm nấc đo điện trở Ω kẻo chập!',
    mathFormula: 'U = I \\cdot R',
    sgkFormula: 'Đo Vôn (V), Ampe (A), Ôm (Ω)',
    glyphIcon: '📟'
  },
  {
    id: 'induction-coil',
    assetId: 'OL3D-EQP-COIL-0001',
    nameVi: 'Cuộn dây dẫn kín kèm 2 LED & Nam châm',
    nameStudent: 'Cuộn dây cảm ứng & Nam châm',
    shortKeyword: 'Cuộn dây & Nam châm',
    nameEn: 'Closed Induction Coil with LEDs & Magnet',
    category: 'G07_ELECTRICITY',
    subject: 'physics',
    grades: ['grade9'],
    ports: [],
    studentPorts: ['Lòng ống cuộn dây', '2 đèn LED đỏ & xanh'],
    description: 'Thực nghiệm cảm ứng điện từ Faraday: nam châm dịch chuyển kích hoạt 2 LED.',
    studentTip: 'Đẩy nam châm vào thì đèn đỏ sáng, rút nam châm ra thì đèn xanh sáng! Nam châm đứng yên thì đèn tắt.',
    mathFormula: '\\mathcal{E} = -N \\frac{\\Delta \\Phi}{\\Delta t}',
    sgkFormula: 'Di chuyển nam châm sinh ra dòng điện',
    glyphIcon: '🧲'
  },

  // G08 - Cơ học
  {
    id: 'lever-balance',
    assetId: 'OL3D-EQP-LEV-0001',
    nameVi: 'Bộ đòn bẩy thăng bằng chia vạch đối xứng',
    nameStudent: 'Thước đòn bẩy thăng bằng',
    shortKeyword: 'Đòn bẩy',
    nameEn: 'Calibrated Lever Balance with Stand',
    category: 'G08_MECHANICS',
    subject: 'physics',
    grades: ['grade8'],
    ports: [],
    studentPorts: ['Trục quay ở giữa', 'Các lỗ treo quả nặng 2 bên'],
    description: 'Khảo sát điều kiện cân bằng đòn bẩy theo quy tắc mômen lực.',
    studentTip: 'Treo quả nặng ở xa trục quay thì cần ít lực hơn để bập bênh thăng bằng!',
    mathFormula: 'F_1 \\cdot d_1 = F_2 \\cdot d_2',
    sgkFormula: 'Quy tắc đòn bẩy: Lực × Khoảng cách = Nhau',
    glyphIcon: '⚖️'
  },
  {
    id: 'communicating-vessels',
    assetId: 'OL3D-EQP-HYD-0001',
    nameVi: 'Bình thông nhau 3 nhánh dị hình',
    nameStudent: 'Bình nước thông nhau 3 nhánh',
    shortKeyword: 'Bình thông nhau',
    nameEn: 'Communicating Vessels 3 Branches',
    category: 'G08_MECHANICS',
    subject: 'physics',
    grades: ['grade8'],
    ports: [],
    studentPorts: ['Ống thẳng', 'Ống phình', 'Ống ngoằn ngoèo'],
    description: 'Chứng minh mặt thoáng chất lỏng cùng độ cao bất kể hình dáng nhánh chứa.',
    studentTip: 'Dù ống có hình dáng to, nhỏ hay cong queo thì khi đứng yên, mực nước ở 3 ống luôn cao bằng nhau!',
    mathFormula: 'p = \\rho \\cdot g \\cdot h',
    sgkFormula: 'Mực nước ở các nhánh luôn cao bằng nhau',
    glyphIcon: '🧪'
  },

  // G09 - Sinh học
  {
    id: 'microscope',
    assetId: 'OL3D-EQP-MIC-0001',
    nameVi: 'Kính hiển vi quang học 3 vật kính DIN',
    nameStudent: 'Kính hiển vi quang học',
    shortKeyword: 'Kính hiển vi',
    nameEn: 'Compound Optical Microscope',
    category: 'G09_BIOLOGY',
    subject: 'biology',
    grades: ['grade6', 'grade9'],
    ports: [],
    studentPorts: ['Ống thị kính nhìn', 'Mâm 3 vật kính 10x, 40x', 'Ốc sơ cấp & vi cấp'],
    description: 'Phóng đại 40x..400x quan sát tế bào sinh học, điều khiển vi cấp & sơ cấp.',
    studentTip: 'Dùng ốc to (sơ cấp) để tìm thấy hình mẫu mờ mờ, sau đó vặn ốc nhỏ (vi cấp) thật khẽ để hình ảnh nét căng!',
    mathFormula: 'M = M_{\\text{thị}} \\times M_{\\text{vật}}',
    sgkFormula: 'Độ phóng đại = Thị kính × Vật kính (Ví dụ: 10 × 40 = 400 lần)',
    glyphIcon: '🔬'
  },
  {
    id: 'dna-model',
    assetId: 'OL3D-EQP-DNA-0001',
    nameVi: 'Mô hình cấu trúc phân tử DNA xoắn kép',
    nameStudent: 'Mô hình xoắn kép DNA',
    shortKeyword: 'Mô hình DNA',
    nameEn: 'Watson-Crick DNA Double Helix Model',
    category: 'G09_BIOLOGY',
    subject: 'biology',
    grades: ['grade9'],
    ports: [],
    studentPorts: ['Trục xoắn 3D', 'Các cặp bazơ A-T, G-X'],
    description: 'Mô hình 3D trực quan hóa nguyên tắc bổ sung A-T, G-X.',
    studentTip: 'Ghi nhớ nguyên tắc bổ sung: Nu loại A luôn ghép đôi với T, Nu loại G luôn ghép đôi với X.',
    mathFormula: 'A + G = T + C',
    sgkFormula: 'Nguyên tắc bổ sung: A nối với T, G nối với X',
    glyphIcon: '🧬'
  },

  // G10 - Nguồn cấp lưu chất
  {
    id: 'water-dispenser',
    assetId: 'OL3D-EQP-WDP-1000',
    nameVi: 'Bình chứa nước có van xả định lượng 1000 ml',
    nameStudent: 'Bình cấp nước sạch có van',
    shortKeyword: 'Bình cấp nước',
    nameEn: 'Water Dispenser Carboy 1000ml',
    category: 'G10_FLUID_SUPPLY',
    subject: 'physics',
    grades: ['grade6', 'grade8'],
    ports: ['CONN_WATER_DISPENSER_SPOUT'],
    studentPorts: ['Vòi xả nước có van vặn'],
    description: 'Cấp nước định lượng vào các bình chứa với lưu lượng 15 ml/s.',
    studentTip: 'Mở van vừa phải để nước không bắn tung tóe ra ngoài mặt bàn thí nghiệm.',
    mathFormula: 'Q = 15.0\\,\\text{ml/s}',
    sgkFormula: 'Bình cung cấp nước làm thí nghiệm',
    glyphIcon: '🚰'
  },
  {
    id: 'retort-stand',
    assetId: 'OL3D-EQP-STD-0001',
    nameVi: 'Giá đỡ thí nghiệm kèm khớp nối & kẹp',
    nameStudent: 'Giá sắt đỡ thí nghiệm',
    shortKeyword: 'Giá thí nghiệm',
    nameEn: 'Laboratory Retort Stand & Clamp',
    category: 'G08_MECHANICS',
    subject: 'general',
    grades: ['grade8', 'grade9'],
    ports: [],
    studentPorts: ['Chân đế gang nặng', 'Cột sắt', 'Tay kẹp có ốc siết'],
    description: 'Giá đỡ giữ cố định phễu chiết, bình cầu, nhiệt kế ở các cao độ khác nhau.',
    studentTip: 'Siết chặt ốc giữ ngàm kẹp để dụng cụ thủy tinh không bị trượt rơi vỡ.',
    mathFormula: 'H \\in [0.1, 0.6]\\,\\text{m}',
    sgkFormula: 'Giữ cố định các dụng cụ trên cao',
    glyphIcon: '📐'
  },
  // --- CÁC THIẾT BỊ MỚI BỔ SUNG (CỐC ĐONG BOMEX 100ML, HÓA CHẤT NaOH/AgNO3/Cu, NHIỆT HỌC, PASCAL, MẠCH ĐIỆN DC) ---
  {
    id: 'beaker-bomex-100',
    assetId: 'OL3D-EQP-BKR-100',
    nameVi: 'Cốc đong thí nghiệm thủy tinh 100ml (BOMEX Low-Form)',
    nameStudent: 'Cốc đong thủy tinh 100ml BOMEX',
    shortKeyword: 'Cốc đong 100ml',
    nameEn: '100ml Low-Form Borosilicate Glass Beaker (BOMEX)',
    category: 'G04_VOLUMETRIC',
    subject: 'chemistry',
    grades: ['grade6', 'grade7', 'grade8', 'grade9'],
    ports: ['CONN_BEAKER_100_APERTURE', 'CONN_BEAKER_100_SPOUT'],
    studentPorts: ['Miệng cốc hứng dung dịch (Chốt bắt dính)', 'Mỏ rót chữ V', 'Thang vạch 20-40-60-80ml APPROX.'],
    description: 'Cốc thủy tinh borosilicate 100ml trong suốt có mỏ rót chữ V và chốt bắt dính từ tính giúp nhận chất lỏng chính xác theo thể tích (ml) hoặc khối lượng (g).',
    studentTip: 'Kéo các lọ hóa chất hoặc cốc chứa chất lỏng lại gần miệng cốc 100ml để chốt bắt dính tự hút vào và nhập số ml hoặc gam muốn rót.',
    mathFormula: 'V \\in [0, 100]\\,\\text{ml}, \\quad m = \\rho \\cdot V',
    sgkFormula: 'Đong và pha chế dung dịch hóa học từ 0 đến 100 ml',
    glyphIcon: '🥛'
  },
  {
    id: 'reagent-bottle-naoh-400',
    assetId: 'OL3D-EQP-NAOH-0001',
    nameVi: 'Lọ hóa chất NaOH 0,1M 400ml (Schott Duran)',
    nameStudent: 'Lọ dung dịch kiềm NaOH 0,1M',
    shortKeyword: 'Lọ NaOH 0,1M',
    nameEn: 'Schott Duran 400ml NaOH 0.1M Reagent Bottle',
    category: 'G05_CHEM_HEATING',
    subject: 'chemistry',
    grades: ['grade8', 'grade9'],
    ports: ['CONN_NAOH_POUR_LIP'],
    studentPorts: ['Cổ rót dung dịch NaOH (Chốt bắt dính)', 'Nắp vặn PP xanh dương GL45'],
    description: 'Lọ thủy tinh borosilicate 400ml chứa dung dịch Sodium Hydroxide (NaOH 0,1M, pH = 13.0) dùng cho thí nghiệm tính chất hóa học của bazơ và chuẩn độ.',
    studentTip: 'Kéo lọ NaOH lại gần Cốc đong 100ml cho chốt bắt dính khớp vào, sau đó nhập thể tích (ml) hoặc khối lượng (g) muốn lấy ra.',
    mathFormula: 'C_M = 0.1\\,\\text{M}, \\quad \\text{pH} = 13.0',
    sgkFormula: 'Dung dịch kiềm NaOH làm quỳ tím hóa xanh, phenolphthalein hóa hồng',
    glyphIcon: '🧴'
  },
  {
    id: 'reagent-bottle-agno3-400',
    assetId: 'OL3D-EQP-AGNO3-0001',
    nameVi: 'Lọ hóa chất AgNO₃ 0,1M 400ml (Thủy tinh nâu tránh sáng)',
    nameStudent: 'Lọ dung dịch Bạc Nitrat AgNO₃ 0,1M',
    shortKeyword: 'Lọ AgNO₃ 0,1M',
    nameEn: 'Amber Glass 400ml AgNO3 0.1M Reagent Bottle',
    category: 'G05_CHEM_HEATING',
    subject: 'chemistry',
    grades: ['grade8', 'grade9'],
    ports: ['CONN_AGNO3_POUR_LIP'],
    studentPorts: ['Miệng rót dung dịch AgNO₃ (Chốt bắt dính)', 'Vỏ thủy tinh nâu cản quang'],
    description: 'Lọ thủy tinh màu hổ phách bảo vệ dung dịch Bạc Nitrat (AgNO₃ 0,1M) khỏi bị phân hủy bởi ánh sáng, dùng cho phản ứng trao đổi và thế kim loại.',
    studentTip: 'Rót dung dịch AgNO₃ vào cốc đong 100ml rồi thả vòng dây đồng Cu vào để quan sát tinh thể bạc kết tủa bám trên mặt đồng.',
    mathFormula: '\\text{Cu} + 2\\text{AgNO}_3 \\rightarrow \\text{Cu(NO}_3)_2 + 2\\text{Ag}\\downarrow',
    sgkFormula: 'Kim loại Đồng đẩy Bạc ra khỏi dung dịch muối AgNO3',
    glyphIcon: '🍾'
  },
  {
    id: 'copper-wire-ring-3g',
    assetId: 'OL3D-EQP-CU-RING-0001',
    nameVi: 'Mẫu vòng dây đồng nguyên chất Cu (m = 3,00g, M = 64)',
    nameStudent: 'Vòng dây đồng đỏ Cu 3g (M=64)',
    shortKeyword: 'Vòng đồng Cu',
    nameEn: 'Pure Copper Wire Coil Sample 3.00g (M=64)',
    category: 'G05_CHEM_HEATING',
    subject: 'chemistry',
    grades: ['grade7', 'grade8', 'grade9'],
    ports: ['CONN_CU_RING_HOOK'],
    studentPorts: ['Thân vòng dây đồng xoắn lò xo', 'Đầu móc treo nhúng dung dịch'],
    description: 'Mẫu kim loại đồng nguyên chất 99,9% uốn dạng vòng xoắn lò xo nặng 3,00g (khối lượng mol M = 64 g/mol), dẫn điện, dẫn nhiệt và phản ứng thế với muối bạc.',
    studentTip: 'Có thể đặt vòng dây đồng lên cân điện tử (3.00g) hoặc thả vào cốc đong 100ml chứa dung dịch AgNO₃ 0,1M.',
    mathFormula: 'M_{\\text{Cu}} = 64\\,\\text{g/mol}, \\quad m = 3.00\\,\\text{g}',
    sgkFormula: 'Đồng (Cu) có M = 64, màu đỏ gạch ánh kim, tác dụng với dung dịch AgNO3',
    glyphIcon: '➰'
  },
  {
    id: 'thermal-heating-vessel',
    assetId: 'OL3D-EQP-THV-0001',
    nameVi: 'Bình thủy tinh chịu nhiệt 250ml (Khảo sát плав/sôi nước đá)',
    nameStudent: 'Bình đun nước đá chịu nhiệt 250ml',
    shortKeyword: 'Bình chịu nhiệt',
    nameEn: '250ml Borosilicate Thermal Heating Vessel',
    category: 'G03_TIME_TEMP',
    subject: 'physics',
    grades: ['grade6', 'grade8'],
    ports: ['CONN_THERMAL_VESSEL_TOP', 'CONN_THERMAL_VESSEL_SPOUT'],
    studentPorts: ['Miệng bình nhận nước đá & cắm nhiệt kế', 'Đáy bình đặt lên lưới amiăng'],
    description: 'Bình thủy tinh chịu nhiệt chuyên dụng đặt trên kiềng sắt đun bằng đèn cồn để khảo sát sự nóng chảy của nước đá (0°C) và sự sôi của nước (100°C).',
    studentTip: 'Cho nước đá từ khay vào bình, cắm nhiệt kế và bật đèn cồn để theo dõi đường biểu diễn nhiệt độ theo thời gian.',
    mathFormula: 'Q = m \\cdot c \\cdot \\Delta t + m \\cdot \\lambda',
    sgkFormula: 'Nước đá nóng chảy ở 0°C và nước sôi ở 100°C',
    glyphIcon: '🍲'
  },
  {
    id: 'ice-cubes-tray',
    assetId: 'OL3D-EQP-ICE-0001',
    nameVi: 'Khay Nước đá viên thí nghiệm (-5°C .. 0°C)',
    nameStudent: 'Khay nước đá viên tinh khiết',
    shortKeyword: 'Khay nước đá',
    nameEn: 'Laboratory Pure Ice Cubes Tray',
    category: 'G03_TIME_TEMP',
    subject: 'physics',
    grades: ['grade6', 'grade8'],
    ports: ['CONN_ICE_TRAY_OUT'],
    studentPorts: ['Các viên đá tinh khiết -5°C'],
    description: 'Khay cung cấp các viên nước đá tinh khiết ở trạng thái rắn (-5°C đến 0°C) phục vụ bài thực hành sự chuyển thể (nóng chảy) trong KHTN 6.',
    studentTip: 'Kéo thả nước đá vào bình thủy tinh chịu nhiệt hoặc cốc đong 100ml để làm lạnh và theo dõi quá trình tan chảy.',
    mathFormula: '\\lambda_{\\text{đá}} = 3.34 \\times 10^5\\,\\text{J/kg}',
    sgkFormula: 'Trong suốt thời gian nước đá đang tan, nhiệt độ giữ nguyên ở 0°C',
    glyphIcon: '🧊'
  },
  {
    id: 'tripod-wire-gauze',
    assetId: 'OL3D-EQP-TRP-0001',
    nameVi: 'Kiềng sắt 3 chân & Lưới tản nhiệt Amiăng',
    nameStudent: 'Kiềng đun 3 chân & Lưới tản nhiệt',
    shortKeyword: 'Kiềng & Lưới đun',
    nameEn: 'Laboratory Tripod Stand with Wire Gauze',
    category: 'G05_CHEM_HEATING',
    subject: 'general',
    grades: ['grade6', 'grade7', 'grade8', 'grade9'],
    ports: ['CONN_TRIPOD_TOP_GAUZE', 'CONN_TRIPOD_UNDER_LAMP'],
    studentPorts: ['Mặt lưới tản nhiệt đỡ cốc/bình đun', 'Khoảng gầm đặt đèn cồn'],
    description: 'Kiềng sắt 3 chân kèm tấm lưới thép tản nhiệt giúp phân bố đều nhiệt lượng từ ngọn lửa đèn cồn lên đáy cốc thủy tinh mà không làm nứt vỡ kính.',
    studentTip: 'Luôn đặt đèn cồn ngay dưới tâm lưới tản nhiệt và đặt cốc thủy tinh hoặc bát sứ lên trên mặt lưới.',
    mathFormula: '\\Phi_q = \\frac{Q}{A \\cdot \\Delta t}',
    sgkFormula: 'Lưới tản nhiệt giúp đáy cốc thủy tinh nóng đều, tránh nứt vỡ',
    glyphIcon: '🔥'
  },
  {
    id: 'pascal-hydraulic-press',
    assetId: 'OL3D-EQP-PAS-0001',
    nameVi: 'Bình thông nhau & Máy nén thủy lực Pascal (S₁ = 2·S₂)',
    nameStudent: 'Máy nén thủy lực Pascal 2 nhánh',
    shortKeyword: 'Máy nén Pascal',
    nameEn: 'Pascal Hydraulic Press & Communicating Pistons',
    category: 'G08_MECHANICS',
    subject: 'physics',
    grades: ['grade8'],
    ports: ['CONN_PASCAL_PISTON_LARGE', 'CONN_PASCAL_PISTON_SMALL'],
    studentPorts: ['Đĩa pít-tông lớn S₁', 'Đĩa pít-tông nhỏ S₂', 'Van xả cân bằng'],
    description: 'Mô hình hai nhánh thông nhau có pít-tông tiết diện S₁ = 2·S₂ chứa chất lỏng, minh họa nguyên lý truyền áp suất Pascal trong chất lỏng.',
    studentTip: 'Đặt 1 quả nặng 100g lên nhánh nhỏ S₂ sẽ cân bằng với 2 quả nặng 100g đặt trên nhánh lớn S₁!',
    mathFormula: '\\frac{F_1}{F_2} = \\frac{S_1}{S_2} = 2',
    sgkFormula: 'Áp suất truyền nguyên vẹn theo mọi hướng: F1 / S1 = F2 / S2',
    glyphIcon: '🗜️'
  },
  {
    id: 'pascal-weight-100g',
    assetId: 'OL3D-EQP-PWT-0001',
    nameVi: 'Quả nặng chuẩn Pascal 100g (P = 1,0 N)',
    nameStudent: 'Quả nặng đồng 100g (1 Newton)',
    shortKeyword: 'Quả nặng 100g',
    nameEn: '100g Brass Calibration Slotted Weight (1.0 N)',
    category: 'G02_MASS_FORCE',
    subject: 'physics',
    grades: ['grade6', 'grade8'],
    ports: ['CONN_PASCAL_WEIGHT_BASE'],
    studentPorts: ['Đế đặt lên đĩa pít-tông hoặc đĩa cân', 'Móc treo lực kế'],
    description: 'Quả nặng chuẩn bằng đồng mạ bóng khối lượng 100g (trọng lượng P ≈ 1,0 N) dùng để đặt lên pít-tông máy nén thủy lực Pascal hoặc cân điện tử.',
    studentTip: 'Kéo thả quả nặng 100g lên nhánh trái hoặc nhánh phải của máy nén Pascal để quan sát độ chênh lệch pít-tông.',
    mathFormula: 'm = 100\\,\\text{g}, \\quad P = m \\cdot g \\approx 1.0\\,\\text{N}',
    sgkFormula: 'Quả nặng 100g gây ra áp lực P = 1 Newton',
    glyphIcon: '🏋️'
  },
  {
    id: 'dc-battery-holder',
    assetId: 'OL3D-EQP-DC-HOLDER-0001',
    nameVi: 'Giá đỡ 2 Pin đại nối tiếp (Nguồn DC 3,0V)',
    nameStudent: 'Đế lắp 2 pin đại nối tiếp (3V)',
    shortKeyword: 'Đế 2 Pin 3V',
    nameEn: 'Dual D-Cell Series Battery Holder (3.0V DC)',
    category: 'G07_ELECTRICITY',
    subject: 'physics',
    grades: ['grade8', 'grade9'],
    ports: ['CONN_DC_HOLDER_POS', 'CONN_DC_HOLDER_NEG'],
    studentPorts: ['Cọc dương (+) màu đỏ', 'Cọc âm (-) màu đen', 'Khay lắp 2 viên pin Con Ó'],
    description: 'Hộp đế nhựa ABS chứa 2 khay lắp pin đại nối tiếp nhau tạo thành bộ nguồn điện một chiều U = 3,0V cung cấp cho mạch điện thực hành KHTN 8.',
    studentTip: 'Lắp đủ 2 viên pin đại Con Ó 1,5V vào khay trước khi nối dây tới cầu dao và bóng đèn.',
    mathFormula: 'U_{\\text{nguồn}} = E_1 + E_2 = 1.5 + 1.5 = 3.0\\,\\text{V}',
    sgkFormula: 'Hai pin 1,5V mắc nối tiếp tạo thành bộ nguồn 3,0V',
    glyphIcon: '🔋'
  },
  {
    id: 'dc-con-o-battery',
    assetId: 'OL3D-EQP-DC-BAT-0001',
    nameVi: 'Viên Pin đại Con Ó 1,5V (Pin khô R20/UM-1)',
    nameStudent: 'Pin đại Con Ó 1,5V',
    shortKeyword: 'Pin Con Ó 1.5V',
    nameEn: '1.5V D-Size Dry Cell Battery (Con O)',
    category: 'G07_ELECTRICITY',
    subject: 'physics',
    grades: ['grade8'],
    ports: ['CONN_BATTERY_POS_CAP', 'CONN_BATTERY_NEG_BASE'],
    studentPorts: ['Đầu núm đồng cực Dương (+)', 'Đáy kẽm phẳng cực Âm (-)'],
    description: 'Viên pin khô R20 1,5V truyền thống vỏ vàng đỏ thương hiệu Con Ó, chuyển hóa năng lượng hóa học thành điện năng một chiều an toàn.',
    studentTip: 'Kéo thả viên pin vào đúng chiều (+) và (-) trên giá đỡ pin để tạo thành nguồn điện.',
    mathFormula: '\\mathcal{E} = 1.5\\,\\text{V}',
    sgkFormula: 'Mỗi viên pin cung cấp hiệu điện thế 1,5 Vôn',
    glyphIcon: '🪫'
  },
  {
    id: 'dc-knife-switch',
    assetId: 'OL3D-EQP-DC-SWITCH-0001',
    nameVi: 'Cầu dao đơn đóng ngắt mạch điện (Công tắc K)',
    nameStudent: 'Công tắc cầu dao K đóng/ngắt mạch',
    shortKeyword: 'Cầu dao K',
    nameEn: 'Single-Pole Knife Switch (Switch K)',
    category: 'G07_ELECTRICITY',
    subject: 'physics',
    grades: ['grade8', 'grade9'],
    ports: ['CONN_SWITCH_IN', 'CONN_SWITCH_OUT'],
    studentPorts: ['Cọc đấu điện vào', 'Lưỡi dao đồng đóng/mở', 'Cọc đấu điện ra'],
    description: 'Công tắc cầu dao lưỡi đồng lộ thiên giúp học sinh quan sát trực quan trạng thái mạch hở (K mở, I = 0) và mạch kín (K đóng, có dòng điện chạy qua).',
    studentTip: 'Luôn mở công tắc K khi đang lắp mạch điện, chỉ đóng cầu dao K sau khi đã kiểm tra đúng sơ đồ mạch.',
    mathFormula: 'K_{\\text{đóng}} \\Rightarrow I = \\frac{U}{R_{\\text{tđ}}}, \\quad K_{\\text{mở}} \\Rightarrow I = 0',
    sgkFormula: 'Đóng công tắc K để mạch điện kín, bóng đèn mới sáng',
    glyphIcon: '🕹️'
  },
  {
    id: 'dc-rheostat-20',
    assetId: 'OL3D-EQP-DC-RHEO-0001',
    nameVi: 'Biến trở con chạy 20Ω - 2A',
    nameStudent: 'Biến trở con chạy điều chỉnh độ sáng đèn',
    shortKeyword: 'Biến trở 20Ω',
    nameEn: '20 Ohm Sliding Coil Rheostat (2A)',
    category: 'G07_ELECTRICITY',
    subject: 'physics',
    grades: ['grade8', 'grade9'],
    ports: ['CONN_RHEOSTAT_A', 'CONN_RHEOSTAT_SLIDER'],
    studentPorts: ['Cọc cố định đầu cuộn dây', 'Con chạy trượt thay đổi chiều dài dây dẫn'],
    description: 'Biến trở dây quấn có con chạy trượt dọc thanh dẫn, dùng để thay đổi điện trở R từ 0Ω đến 20Ω nhằm điều chỉnh cường độ dòng điện trong mạch.',
    studentTip: 'Kéo con chạy sang phải làm tăng điện trở R khiến dòng điện giảm và bóng đèn tối dần.',
    mathFormula: 'R_b = \\rho \\frac{l}{S} \\in [0, 20]\\,\\Omega',
    sgkFormula: 'Dịch chuyển con chạy để thay đổi điện trở và điều chỉnh cường độ dòng điện',
    glyphIcon: '🎚️'
  },
  {
    id: 'dc-light-bulb-126',
    assetId: 'OL3D-EQP-DC-BULB-0001',
    nameVi: 'Bóng đèn dây tóc 2,5V - 3V trên đế nhựa',
    nameStudent: 'Bóng đèn dây tóc thí nghiệm trên đế',
    shortKeyword: 'Bóng đèn dây tóc',
    nameEn: 'Mounted Miniature Incandescent Light Bulb (3V)',
    category: 'G07_ELECTRICITY',
    subject: 'physics',
    grades: ['grade8', 'grade9'],
    ports: ['CONN_BULB_LEFT', 'CONN_BULB_RIGHT'],
    studentPorts: ['2 cọc nối dây dẫn', 'Dây tóc vonfram phát sáng'],
    description: 'Bóng đèn dây tóc gắn trên đế có 2 cọc đấu dây, phát sáng rực rỡ khi có dòng điện chạy qua theo tác dụng nhiệt và tác dụng phát sáng của dòng điện.',
    studentTip: 'Quan sát độ sáng của dây tóc bóng đèn khi thay đổi vị trí con chạy biến trở hoặc khi đóng/ngắt cầu dao K.',
    mathFormula: 'P = U \\cdot I = I^2 \\cdot R_{\\text{đèn}}',
    sgkFormula: 'Dòng điện càng mạnh thì bóng đèn dây tóc càng sáng rõ',
    glyphIcon: '💡'
  },
  {
    id: 'dc-ammeter',
    assetId: 'OL3D-EQP-DC-AMM-0001',
    nameVi: 'Ampe kế một chiều DC (Thang đo 0,6A / 3A)',
    nameStudent: 'Ampe kế đo cường độ dòng điện (A)',
    shortKeyword: 'Ampe kế DC',
    nameEn: 'DC Analog Ammeter (0.6A / 3A Dual Range)',
    category: 'G07_ELECTRICITY',
    subject: 'physics',
    grades: ['grade8', 'grade9'],
    ports: ['CONN_AMMETER_NEG', 'CONN_AMMETER_06A', 'CONN_AMMETER_3A'],
    studentPorts: ['Cọc âm (-)', 'Cọc dương (+) thang 0,6A', 'Cọc dương (+) thang 3A'],
    description: 'Đồng hồ Ampe kế chỉ thị kim dùng để đo cường độ dòng điện một chiều I (đơn vị Ampe - A), luôn được mắc nối tiếp với dụng cụ cần đo.',
    studentTip: 'Luôn mắc Ampe kế NỐI TIẾP trong mạch điện, chốt (+) nối về phía cực dương của nguồn пин. Tuyệt đối không mắc trực tiếp vào 2 cực nguồn!',
    mathFormula: 'I = \\frac{U}{R}\\,\\text{(A)}',
    sgkFormula: 'Ampe kế dùng để đo cường độ dòng điện, mắc nối tiếp vào mạch',
    glyphIcon: '🧭'
  },
  {
    id: 'dc-voltmeter',
    assetId: 'OL3D-EQP-DC-VOLT-0001',
    nameVi: 'Vôn kế một chiều DC (Thang đo 6V / 12V)',
    nameStudent: 'Vôn kế đo hiệu điện thế (V)',
    shortKeyword: 'Vôn kế DC',
    nameEn: 'DC Analog Voltmeter (6V / 12V Dual Range)',
    category: 'G07_ELECTRICITY',
    subject: 'physics',
    grades: ['grade8', 'grade9'],
    ports: ['CONN_VOLTMETER_NEG', 'CONN_VOLTMETER_6V', 'CONN_VOLTMETER_12V'],
    studentPorts: ['Cọc âm (-)', 'Cọc dương (+) thang 6V', 'Cọc dương (+) thang 12V'],
    description: 'Đồng hồ Vôn kế chỉ thị kim dùng để đo hiệu điện thế U (đơn vị Vôn - V) giữa hai đầu bóng đèn hoặc hai cực của nguồn điện.',
    studentTip: 'Luôn mắc Vôn kế SONG SONG với hai đầu bóng đèn hoặc dụng cụ cần đo hiệu điện thế.',
    mathFormula: 'U = I \\cdot R\\,\\text{(V)}',
    sgkFormula: 'Vôn kế dùng để đo hiệu điện thế, mắc song song với bóng đèn',
    glyphIcon: '⏲️'
  }
];

// -------------------------------------------------------------
// 2. KHỚP NỐI NƠ-RON (SYNAPSE EDGES) CÓ DIỄN GIẢI HỌC SINH
// -------------------------------------------------------------
export const NEURAL_SYNAPSE_EDGES: NeuralSynapseEdge[] = [
  // Cân điện tử
  {
    id: 'SYN-WGT-BAL',
    source: 'calibration-weight',
    target: 'electronic-balance',
    type: 'mechanical_support',
    connectorId: 'CONN_BALANCE_PAN',
    weight: 0.95,
    signalSpeed: 1.2,
    causalRule: 'Đặt vật lên đĩa cân làm lún mâm cảm biến loadcell, chốt số đo tịnh m_gross',
    studentCausal: 'Đặt quả cân lên đĩa → Màn hình cân hiện đúng số gam 50.00g',
    experimentContext: 'Đo khối lượng chính xác & hiệu chuẩn cân'
  },
  {
    id: 'SYN-CYL-BAL',
    source: 'solid-cylinder',
    target: 'electronic-balance',
    type: 'mechanical_support',
    connectorId: 'CONN_BALANCE_PAN',
    weight: 0.90,
    signalSpeed: 1.2,
    causalRule: 'Truyền khối lượng vật m_Al lên đĩa cân phục vụ xác định khối lượng riêng',
    studentCausal: 'Cân khối nhôm → Biết khối lượng m để tính D = m / V',
    experimentContext: 'Xác định khối lượng riêng của nhôm'
  },
  {
    id: 'SYN-SPH-BAL',
    source: 'solid-sphere',
    target: 'electronic-balance',
    type: 'mechanical_support',
    connectorId: 'CONN_BALANCE_PAN',
    weight: 0.90,
    signalSpeed: 1.2,
    causalRule: 'Truyền khối lượng vật m_thep lên đĩa cân',
    studentCausal: 'Cân viên bi thép → Biết khối lượng vật đặc',
    experimentContext: 'Đo khối lượng mẫu vật hình cầu'
  },
  {
    id: 'SYN-BLK-BAL',
    source: 'solid-block',
    target: 'electronic-balance',
    type: 'mechanical_support',
    connectorId: 'CONN_BALANCE_PAN',
    weight: 0.90,
    signalSpeed: 1.2,
    causalRule: 'Truyền khối lượng đồng thau lên đĩa cân',
    studentCausal: 'Cân khối đồng thau → Hiện khối lượng m',
    experimentContext: 'Đo khối lượng vật hình hộp chữ nhật'
  },
  {
    id: 'SYN-BKR-BAL',
    source: 'beaker-250',
    target: 'electronic-balance',
    type: 'mechanical_support',
    connectorId: 'CONN_BALANCE_PAN',
    weight: 0.85,
    signalSpeed: 1.0,
    causalRule: 'Đặt cốc lên đĩa cân, kích hoạt phím TARE để trừ bì khối lượng vỏ thủy tinh',
    studentCausal: 'Đặt cốc lên rồi bấm nút TARE → Cân về 0.00g để chỉ cân nước bên trong',
    experimentContext: 'Đo khối lượng chất lỏng bằng cách trừ bì'
  },
  {
    id: 'SYN-GCY-BAL',
    source: 'graduated-cylinder',
    target: 'electronic-balance',
    type: 'mechanical_support',
    connectorId: 'CONN_BALANCE_PAN',
    weight: 0.85,
    signalSpeed: 1.0,
    causalRule: 'Cân trực tiếp ống đong chứa nước để xác minh tỷ trọng ρ = 1.0 g/ml',
    studentCausal: 'Cân ống đong có nước → Thấy 1 ml nước nặng đúng 1 gam',
    experimentContext: 'Kiểm chứng khối lượng riêng của nước'
  },
  {
    id: 'SYN-DSH-BAL',
    source: 'porcelain-dish',
    target: 'electronic-balance',
    type: 'mechanical_support',
    connectorId: 'CONN_BALANCE_PAN',
    weight: 0.80,
    signalSpeed: 1.0,
    causalRule: 'Cân bát sứ trước và sau khi cô cạn để tính lượng muối kết tinh',
    studentCausal: 'Cân bát sứ trước và sau khi đun → Biết khối lượng muối thu được',
    experimentContext: 'Xác định khối lượng muối sau khi cô cạn'
  },

  // Ống đong thể tích
  {
    id: 'SYN-CYL-GCY',
    source: 'solid-cylinder',
    target: 'graduated-cylinder',
    type: 'submersion',
    connectorId: 'CONN_CYLINDER_APERTURE',
    weight: 0.95,
    signalSpeed: 1.5,
    causalRule: 'Vật lọt khẩu độ Ø28mm chìm xuống làm dâng cột chất lỏng đúng thể tích V_vật',
    studentCausal: 'Thả khối nhôm chìm vào nước → Cột nước dâng lên đúng bằng thể tích của nhôm',
    experimentContext: 'Đo thể tích vật rắn bằng ống đong'
  },
  {
    id: 'SYN-SPH-GCY',
    source: 'solid-sphere',
    target: 'graduated-cylinder',
    type: 'submersion',
    connectorId: 'CONN_CYLINDER_APERTURE',
    weight: 0.95,
    signalSpeed: 1.5,
    causalRule: 'Bi cầu thép chìm xuống nước đẩy dâng thể tích ΔV',
    studentCausal: 'Thả bi thép vào ống đong → Nước dâng lên để đọc thể tích',
    experimentContext: 'Đo thể tích viên bi hình cầu'
  },

  // Bình tràn Eureka
  {
    id: 'SYN-BLK-OVF',
    source: 'solid-block',
    target: 'overflow-can',
    type: 'submersion',
    connectorId: 'CONN_OVERFLOW_CAN_APERTURE',
    weight: 0.95,
    signalSpeed: 1.6,
    causalRule: 'Vật kích thước > 28mm thả vào bình tràn kích hoạt xả nước qua vòi tràn',
    studentCausal: 'Khối đồng to không vừa ống đong → Thả vào bình tràn làm nước trào qua vòi',
    experimentContext: 'Đo thể tích vật không bỏ lọt ống đong'
  },
  {
    id: 'SYN-OVF-BKR',
    source: 'overflow-can',
    target: 'beaker-250',
    type: 'fluid_spout',
    connectorId: 'CONN_OVERFLOW_CAN_SPOUT',
    weight: 0.90,
    signalSpeed: 1.4,
    causalRule: 'Nước tràn từ vòi bình Eureka chảy vào cốc hứng',
    studentCausal: 'Nước chảy từ vòi bình tràn → Hứng vào cốc thủy tinh',
    experimentContext: 'Hứng nước tràn'
  },
  {
    id: 'SYN-OVF-GCY',
    source: 'overflow-can',
    target: 'graduated-cylinder',
    type: 'fluid_spout',
    connectorId: 'CONN_OVERFLOW_CAN_SPOUT',
    weight: 0.92,
    signalSpeed: 1.4,
    causalRule: 'Nước tràn chảy trực tiếp vào ống đong để đọc chính xác thể tích nước tràn',
    studentCausal: 'Nước tràn chảy thẳng vào ống đong → Đọc ngay thể tích chất lỏng bị chiếm chỗ',
    experimentContext: 'Kiểm chứng định luật Ác-si-mét'
  },

  // Bình cấp nước
  {
    id: 'SYN-WDP-GCY',
    source: 'water-dispenser',
    target: 'graduated-cylinder',
    type: 'fluid_spout',
    connectorId: 'CONN_WATER_DISPENSER_SPOUT',
    weight: 0.90,
    signalSpeed: 1.3,
    causalRule: 'Van xả cấp nước 15 ml/s làm dâng mực nước ống đong',
    studentCausal: 'Vặn van xả nước → Rót nước vào ống đong chuẩn bị thí nghiệm',
    experimentContext: 'Chuẩn bị nước trong ống đong'
  },
  {
    id: 'SYN-WDP-BKR',
    source: 'water-dispenser',
    target: 'beaker-250',
    type: 'fluid_spout',
    connectorId: 'CONN_WATER_DISPENSER_SPOUT',
    weight: 0.90,
    signalSpeed: 1.3,
    causalRule: 'Cấp nước đầy cốc 250ml phục vụ khảo sát lực đẩy Archimedes',
    studentCausal: 'Rót nước sạch vào cốc thủy tinh',
    experimentContext: 'Chuẩn bị cốc nước'
  },
  {
    id: 'SYN-WDP-OVF',
    source: 'water-dispenser',
    target: 'overflow-can',
    type: 'fluid_spout',
    connectorId: 'CONN_WATER_DISPENSER_SPOUT',
    weight: 0.95,
    signalSpeed: 1.3,
    causalRule: 'Nạp nước chạm vòi bình tràn Eureka đạt trạng thái sẵn sàng thí nghiệm',
    studentCausal: 'Đổ nước vào bình tràn cho tới khi nước vừa chớm mấp mé vòi tràn',
    experimentContext: 'Nạp nước đầy bình tràn Eureka'
  },
  {
    id: 'SYN-WDP-HYD',
    source: 'water-dispenser',
    target: 'communicating-vessels',
    type: 'fluid_spout',
    connectorId: 'CONN_WATER_DISPENSER_SPOUT',
    weight: 0.85,
    signalSpeed: 1.1,
    causalRule: 'Rót nước vào bình thông nhau, áp suất phân phối làm mực nước 3 nhánh dâng ngang nhau',
    studentCausal: 'Rót nước vào một ống → Nước tự tràn qua đáy làm 3 ống dâng cao bằng nhau',
    experimentContext: 'Thí nghiệm bình thông nhau'
  },

  // Lực kế lò xo
  {
    id: 'SYN-WGT-DYN',
    source: 'calibration-weight',
    target: 'spring-dynamometer',
    type: 'mechanical_hook',
    connectorId: 'CONN_SPRING_DYNO_HOOK',
    weight: 0.95,
    signalSpeed: 1.4,
    causalRule: 'Trọng lượng vật kéo lò xo giãn đoạn Δl = P / k, hiển thị lực F = 0.5 N',
    studentCausal: 'Móc quả cân 50g vào móc treo → Lò xo giãn ra chỉ đúng 0.5 Newton',
    experimentContext: 'Đo trọng lượng quả cân'
  },
  {
    id: 'SYN-CYL-DYN',
    source: 'solid-cylinder',
    target: 'spring-dynamometer',
    type: 'mechanical_hook',
    connectorId: 'CONN_SPRING_DYNO_HOOK',
    weight: 0.92,
    signalSpeed: 1.4,
    causalRule: 'Treo mẫu trụ nhôm đo trọng lượng trong không khí P_1',
    studentCausal: 'Treo khối nhôm vào lực kế ngoài không khí → Đọc trọng lượng P1',
    experimentContext: 'Bước 1: Đo trọng lượng vật ngoài không khí'
  },
  {
    id: 'SYN-DYN-BKR',
    source: 'spring-dynamometer',
    target: 'beaker-250',
    type: 'buoyancy_force',
    weight: 0.98,
    signalSpeed: 1.7,
    causalRule: 'Nhúng vật đang treo vào nước, lực đẩy F_A làm giảm số chỉ lực kế còn P_2 = P_1 - F_A',
    studentCausal: 'Nhúng vật đang treo vào cốc nước → Lực đẩy Ác-si-mét nâng lên làm lực kế giảm số chỉ P2',
    experimentContext: 'Bước 2: Đo độ lớn lực đẩy Ác-si-mét'
  },

  // Thước cặp
  {
    id: 'SYN-CYL-CAL',
    source: 'solid-cylinder',
    target: 'vernier-caliper',
    type: 'mechanical_clamp',
    connectorId: 'CONN_VERNIER_CALIPER_JAWS',
    weight: 0.90,
    signalSpeed: 1.1,
    causalRule: 'Ngàm kẹp ôm khít mặt ngoài trụ, cố định khoảng cách và hiển thị đường kính d',
    studentCausal: 'Kẹp 2 ngàm vào thân khối nhôm → Đọc đường kính ngoài chính xác đến 0.02mm',
    experimentContext: 'Đo đường kính hình trụ'
  },
  {
    id: 'SYN-SPH-CAL',
    source: 'solid-sphere',
    target: 'vernier-caliper',
    type: 'mechanical_clamp',
    connectorId: 'CONN_VERNIER_CALIPER_JAWS',
    weight: 0.90,
    signalSpeed: 1.1,
    causalRule: 'Kẹp đo đường kính bi cầu để tính thể tích hình cầu lý thuyết',
    studentCausal: 'Kẹp đo đường kính viên bi tròn → Tính thể tích theo hình học',
    experimentContext: 'Đo đường kính viên bi'
  },

  // Hệ quang học
  {
    id: 'SYN-PSU-OLP',
    source: 'optical-power-supply',
    target: 'optical-lamp',
    type: 'electrical_interlock',
    connectorId: 'CONN_PSU_DC_OUT_POS',
    weight: 1.0,
    signalSpeed: 2.0,
    causalRule: 'Khóa liên động điện: Cáp nối 4mm + bật công tắc PSU + bật đèn → tim halogen phát sáng',
    studentCausal: 'Cắm 2 dây điện từ bộ nguồn sang đèn và bật công tắc → Đèn mới sáng được!',
    experimentContext: 'Cấp nguồn thắp sáng đèn thí nghiệm quang học'
  },
  {
    id: 'SYN-OLP-OBN',
    source: 'optical-lamp',
    target: 'optical-bench',
    type: 'mechanical_rail',
    connectorId: 'CONN_OPTICAL_BENCH_RAIL',
    weight: 0.95,
    signalSpeed: 1.2,
    causalRule: 'Đế trượt khóa cao độ quang trục y = 0.125m, cho phép trượt 1D định vị tại -35cm',
    studentCausal: 'Gắn đèn vào thanh ray quang học tại vạch -35 cm',
    experimentContext: 'Gắn đèn lên giá quang học'
  },
  {
    id: 'SYN-FOB-OBN',
    source: 'frosted-f-object',
    target: 'optical-bench',
    type: 'mechanical_rail',
    connectorId: 'CONN_OPTICAL_BENCH_RAIL',
    weight: 0.95,
    signalSpeed: 1.2,
    causalRule: 'Đế mang vật F định vị đồng trục tại -20cm trên ray',
    studentCausal: 'Gắn tấm kính chữ F vào thanh ray tại vạch -20 cm',
    experimentContext: 'Gắn vật sáng F lên giá quang học'
  },
  {
    id: 'SYN-OPT-OBN',
    source: 'optical-lens',
    target: 'optical-bench',
    type: 'mechanical_rail',
    connectorId: 'CONN_OPTICAL_BENCH_RAIL',
    weight: 0.95,
    signalSpeed: 1.2,
    causalRule: 'Đế mang thấu kính định vị tại mốc 0cm của giá quang học',
    studentCausal: 'Gắn thấu kính vào mốc số 0 ở giữa thanh ray',
    experimentContext: 'Cố định thấu kính tại mốc 0'
  },
  {
    id: 'SYN-SCR-OBN',
    source: 'optical-screen',
    target: 'optical-bench',
    type: 'mechanical_rail',
    connectorId: 'CONN_OPTICAL_BENCH_RAIL',
    weight: 0.95,
    signalSpeed: 1.2,
    causalRule: 'Màn hứng ảnh trượt định vị tại +30cm tìm mặt phẳng hứng ảnh rõ nét',
    studentCausal: 'Gắn màn hứng màu trắng vào ray và trượt để tìm ảnh rõ nét',
    experimentContext: 'Tìm ảnh trên màn hứng'
  },
  {
    id: 'SYN-OLP-FOB',
    source: 'optical-lamp',
    target: 'frosted-f-object',
    type: 'optical_alignment',
    weight: 0.98,
    signalSpeed: 1.9,
    causalRule: 'Chùm tia rọi từ đèn xuyên qua kính mờ tạo vật sáng chữ F truyền theo trục quang',
    studentCausal: 'Đèn chiếu sáng rọi qua tấm kính mờ → Tạo thành chữ F phát sáng rực rỡ',
    experimentContext: 'Tạo vật sáng chữ F'
  },
  {
    id: 'SYN-FOB-OPT',
    source: 'frosted-f-object',
    target: 'optical-lens',
    type: 'optical_alignment',
    weight: 0.98,
    signalSpeed: 1.9,
    causalRule: 'Các tia sáng xuất phát từ vật F tới bề mặt thấu kính, bị khúc xạ hội tụ về tiêu diện',
    studentCausal: 'Ánh sáng từ chữ F bay tới thấu kính → Bị bẻ cong hội tụ lại',
    experimentContext: 'Khúc xạ qua thấu kính'
  },
  {
    id: 'SYN-OPT-SCR',
    source: 'optical-lens',
    target: 'optical-screen',
    type: 'optical_alignment',
    weight: 0.98,
    signalSpeed: 1.9,
    causalRule: 'Tia hội tụ giao cắt tạo ảnh thật ngược chiều chữ F trên màn khi d > f',
    studentCausal: 'Các tia sáng hội tụ gặp màn hứng → Tạo ảnh thật lộn ngược chiều của chữ F!',
    experimentContext: 'Thu được ảnh thật trên màn hứng'
  },

  // Khúc xạ & Tán sắc
  {
    id: 'SYN-LSR-SLB',
    source: 'laser-source',
    target: 'semicircular-slab',
    type: 'optical_refraction',
    weight: 0.96,
    signalSpeed: 1.8,
    causalRule: 'Chiếu tia laser vào mặt cong truyền thẳng vào tâm O, khúc xạ tại mặt phẳng theo Snell',
    studentCausal: 'Chiếu tia laser vào khối thủy tinh → Tia sáng bị bẻ gãy góc khi đi ra không khí',
    experimentContext: 'Thí nghiệm khúc xạ ánh sáng'
  },
  {
    id: 'SYN-OLP-PRM',
    source: 'optical-lamp',
    target: 'prism',
    type: 'optical_refraction',
    weight: 0.94,
    signalSpeed: 1.7,
    causalRule: 'Chiếu chùm ánh sáng trắng qua lăng kính bị lệch về phía đáy và tách thành 7 dải màu',
    studentCausal: 'Chiếu chùm ánh sáng trắng qua lăng kính → Tách thành dải màu Cầu Vồng rực rỡ',
    experimentContext: 'Tán sắc ánh sáng qua lăng kính'
  },

  // Điện từ học
  {
    id: 'SYN-COIL-GLV',
    source: 'induction-coil',
    target: 'galvanometer',
    type: 'electromagnetic_induction',
    weight: 0.98,
    signalSpeed: 2.0,
    causalRule: 'Đẩy nam châm vào/rút ra khỏi cuộn dây kín tạo biến thiên từ thông dΦ/dt làm lệch kim điện kế',
    studentCausal: 'Đẩy nhanh nam châm vào cuộn dây → Kim điện kế lập tức lệch sang một bên!',
    experimentContext: 'Hiện tượng cảm ứng điện từ'
  },
  {
    id: 'SYN-PSU-DMM',
    source: 'optical-power-supply',
    target: 'digital-multimeter',
    type: 'electrical_terminal',
    weight: 0.95,
    signalSpeed: 1.5,
    causalRule: 'Cặp que đo VOM đo điện áp thực tế đầu ra của bộ nguồn hạ áp',
    studentCausal: 'Chạm 2 que đo vào cọc nguồn → Màn hình hiện đúng số Vôn (V)',
    experimentContext: 'Đo điện áp nguồn điện'
  },

  // Nhiệt học & Hóa học
  {
    id: 'SYN-ALC-DSH',
    source: 'alcohol-lamp',
    target: 'porcelain-dish',
    type: 'thermal_exchange',
    weight: 0.92,
    signalSpeed: 1.3,
    causalRule: 'Ngọn lửa đèn cồn truyền nhiệt lượng Q vào bát sứ làm bay hơi nước, cô cạn muối',
    studentCausal: 'Ngọn lửa đèn cồn đun sôi bát nước muối → Nước bay hơi hết, để lại hạt muối trắng',
    experimentContext: 'Thực hành cô cạn dung dịch muối ăn'
  },
  {
    id: 'SYN-ALC-DST',
    source: 'alcohol-lamp',
    target: 'distillation-flask',
    type: 'thermal_exchange',
    weight: 0.92,
    signalSpeed: 1.3,
    causalRule: 'Gia nhiệt bình cầu cất đến nhiệt độ sôi của cấu tử nhẹ để thu hồi cất',
    studentCausal: 'Đun nóng bình cầu cất → Rượu sôi trước ở 78°C bay hơi qua ống sinh hàn ngưng tụ',
    experimentContext: 'Chưng cất rượu'
  },
  {
    id: 'SYN-THM-BKR',
    source: 'thermometer',
    target: 'beaker-250',
    type: 'thermal_exchange',
    weight: 0.88,
    signalSpeed: 0.9,
    causalRule: 'Theo dõi sự tăng nhiệt độ chất lỏng trong cốc trong suốt quá trình đun',
    studentCausal: 'Cắm nhiệt kế vào cốc nước đun → Cột màu đỏ dâng dần lên đến 100°C khi nước sôi',
    experimentContext: 'Theo dõi nhiệt độ khi nước sôi'
  },

  // Cơ học & Sinh học
  {
    id: 'SYN-WGT-LEV',
    source: 'calibration-weight',
    target: 'lever-balance',
    type: 'mechanical_support',
    weight: 0.92,
    signalSpeed: 1.2,
    causalRule: 'Treo các quả cân vào các lỗ chia vạch đối xứng khảo sát điều kiện F1.d1 = F2.d2',
    studentCausal: 'Treo quả cân 2 bên trục quay → Điều chỉnh khoảng cách để đòn bẩy nằm ngang thăng bằng',
    experimentContext: 'Quy tắc đòn bẩy thăng bằng'
  },
  {
    id: 'SYN-MIC-DNA',
    source: 'microscope',
    target: 'dna-model',
    type: 'microscopy_dock',
    weight: 0.85,
    signalSpeed: 1.0,
    causalRule: 'Liên kết nhận thức từ quan sát tiêu bản NST hiển vi đến mô hình phân tử DNA 3D',
    studentCausal: 'Soi tế bào dưới kính hiển vi → Nhìn sâu vào nhân thấy nhiễm sắc thể và phân tử DNA',
    experimentContext: 'Tìm hiểu tế bào và DNA di truyền'
  },

  // --- CÁC KHỚP NỐI NƠ-RON MỚI: CỐC ĐONG 100ML BOMEX & HÓA CHẤT (NaOH, AgNO3, Cu) ---
  {
    id: 'SYN-NAOH-BKR100',
    source: 'reagent-bottle-naoh-400',
    target: 'beaker-bomex-100',
    type: 'fluid_spout',
    connectorId: 'CONN_BEAKER_100_APERTURE',
    weight: 0.98,
    signalSpeed: 1.6,
    causalRule: 'Chốt bắt dính từ tính khớp cổ lọ NaOH 0,1M với miệng cốc đong 100ml, mở khung nhập thể tích (ml) hoặc khối lượng (g) để rót chính xác',
    studentCausal: 'Kéo lọ NaOH 0,1M bắt dính vào cốc đong 100ml → Nhập số ml hoặc gam rồi nhấn OK để rót dung dịch kiềm vào cốc',
    experimentContext: 'Đong thể tích & khối lượng dung dịch NaOH 0,1M'
  },
  {
    id: 'SYN-AGNO3-BKR100',
    source: 'reagent-bottle-agno3-400',
    target: 'beaker-bomex-100',
    type: 'fluid_spout',
    connectorId: 'CONN_BEAKER_100_APERTURE',
    weight: 0.98,
    signalSpeed: 1.6,
    causalRule: 'Chốt bắt dính từ tính khớp cổ lọ AgNO₃ 0,1M với cốc đong 100ml, hiển thị khung nhập thể tích/khối lượng dung dịch muốn rót',
    studentCausal: 'Kéo lọ AgNO₃ 0,1M bắt dính vào cốc đong 100ml → Nhập lượng ml/g muốn lấy và nhấn OK để rót vào cốc',
    experimentContext: 'Chuẩn bị dung dịch AgNO₃ 0,1M trong cốc đong 100ml'
  },
  {
    id: 'SYN-WDP-BKR100',
    source: 'water-dispenser',
    target: 'beaker-bomex-100',
    type: 'fluid_spout',
    connectorId: 'CONN_WATER_DISPENSER_SPOUT',
    weight: 0.94,
    signalSpeed: 1.4,
    causalRule: 'Xả nước cất từ bình cấp nước vào cốc đong 100ml theo vạch chia 20-40-60-80ml',
    studentCausal: 'Rót nước cất từ vòi bình cấp nước vào cốc đong 100ml',
    experimentContext: 'Lấy nước cất pha loãng dung dịch trong cốc 100ml'
  },
  {
    id: 'SYN-BKR250-BKR100',
    source: 'beaker-250',
    target: 'beaker-bomex-100',
    type: 'fluid_spout',
    connectorId: 'CONN_BEAKER_100_APERTURE',
    weight: 0.95,
    signalSpeed: 1.5,
    causalRule: 'Chốt bắt dính mỏ rót cốc 250ml vào miệng cốc đong 100ml, nhập thể tích (ml) hoặc khối lượng (g) cần san chiết',
    studentCausal: 'Kéo cốc 250ml bắt dính vào cốc đong 100ml → Nhập số ml/g chất lỏng muốn rót sang',
    experimentContext: 'San chiết chất lỏng chính xác sang cốc đong 100ml'
  },
  {
    id: 'SYN-GCY-BKR100',
    source: 'graduated-cylinder',
    target: 'beaker-bomex-100',
    type: 'fluid_spout',
    connectorId: 'CONN_BEAKER_100_APERTURE',
    weight: 0.94,
    signalSpeed: 1.5,
    causalRule: 'Rót chất lỏng từ ống đong 100ml sang cốc đong thủy tinh 100ml BOMEX qua chốt bắt dính',
    studentCausal: 'Kéo ống đong bắt dính vào miệng cốc 100ml → Nhập lượng nước muốn rót vào cốc',
    experimentContext: 'Chuyển chất lỏng từ ống đong sang cốc 100ml'
  },
  {
    id: 'SYN-BKR100-BAL',
    source: 'beaker-bomex-100',
    target: 'electronic-balance',
    type: 'mechanical_support',
    connectorId: 'CONN_BALANCE_PAN',
    weight: 0.96,
    signalSpeed: 1.3,
    causalRule: 'Cân khối lượng tịnh của cốc đong 100ml (vỏ cốc 55g + khối lượng dung dịch đã rót vào)',
    studentCausal: 'Đặt cốc đong 100ml lên đĩa cân điện tử → Kiểm tra khối lượng dung dịch vừa rót vào',
    experimentContext: 'Kiểm chứng khối lượng dung dịch trong cốc 100ml'
  },
  {
    id: 'SYN-BKR100-ERL',
    source: 'beaker-bomex-100',
    target: 'erlenmeyer-flask',
    type: 'fluid_spout',
    weight: 0.92,
    signalSpeed: 1.4,
    causalRule: 'Rót dung dịch đã đong từ cốc 100ml sang bình tam giác Erlenmeyer để lắc phản ứng chuẩn độ',
    studentCausal: 'Rót dung dịch từ cốc đong 100ml vào bình tam giác cổ hẹp để lắc đều',
    experimentContext: 'Pha chế và chuẩn độ dung dịch hóa học'
  },
  {
    id: 'SYN-CU-BKR100',
    source: 'copper-wire-ring-3g',
    target: 'beaker-bomex-100',
    type: 'submersion',
    connectorId: 'CONN_BEAKER_100_APERTURE',
    weight: 0.97,
    signalSpeed: 1.6,
    causalRule: 'Thả vòng dây đồng Cu (M=64, 3g) vào cốc đong 100ml chứa dung dịch AgNO₃ làm kết tủa bạc trắng xám và dung dịch hóa xanh lam Cu(NO₃)₂',
    studentCausal: 'Thả vòng dây đồng Cu vào cốc 100ml đựng AgNO₃ → Tinh thể bạc bám trắng quanh dây đồng, nước chuyển màu xanh!',
    experimentContext: 'Phản ứng của Đồng (Cu) với dung dịch Bạc Nitrat (AgNO₃)'
  },
  {
    id: 'SYN-CU-AGNO3',
    source: 'copper-wire-ring-3g',
    target: 'reagent-bottle-agno3-400',
    type: 'submersion',
    weight: 0.95,
    signalSpeed: 1.5,
    causalRule: 'Tương tác hóa học đặc trưng: Cu + 2AgNO₃ → Cu(NO₃)₂ + 2Ag↓ (Kim loại mạnh đẩy kim loại yếu ra khỏi muối)',
    studentCausal: 'Đồng (M=64) tác dụng với dung dịch AgNO₃ 0,1M tạo muối đồng(II) nitrat màu xanh và kim loại bạc',
    experimentContext: 'Tính chất hóa học của kim loại Đồng (Cu)'
  },
  {
    id: 'SYN-CU-BAL',
    source: 'copper-wire-ring-3g',
    target: 'electronic-balance',
    type: 'mechanical_support',
    connectorId: 'CONN_BALANCE_PAN',
    weight: 0.93,
    signalSpeed: 1.2,
    causalRule: 'Đặt mẫu vòng dây đồng nguyên chất lên đĩa cân hiển thị chính xác m = 3,00g (M = 64 g/mol)',
    studentCausal: 'Đặt vòng dây đồng lên cân điện tử → Màn hình hiện đúng 3.00g',
    experimentContext: 'Cân khối lượng mẫu kim loại đồng trước và sau phản ứng'
  },
  {
    id: 'SYN-NAOH-BKR250',
    source: 'reagent-bottle-naoh-400',
    target: 'beaker-250',
    type: 'fluid_spout',
    weight: 0.92,
    signalSpeed: 1.4,
    causalRule: 'Rót dung dịch NaOH 0,1M vào cốc 250ml qua chốt bắt dính và nhập thể tích/khối lượng mong muốn',
    studentCausal: 'Kéo lọ NaOH bắt dính vào cốc 250ml → Nhập lượng ml/g muốn rót',
    experimentContext: 'Lấy dung dịch kiềm NaOH vào cốc thủy tinh'
  },
  {
    id: 'SYN-AGNO3-BKR250',
    source: 'reagent-bottle-agno3-400',
    target: 'beaker-250',
    type: 'fluid_spout',
    weight: 0.92,
    signalSpeed: 1.4,
    causalRule: 'Rót dung dịch AgNO₃ 0,1M vào cốc 250ml qua chốt bắt dính từ tính',
    studentCausal: 'Kéo lọ AgNO₃ bắt dính vào cốc 250ml → Nhập lượng ml/g muốn rót',
    experimentContext: 'Lấy dung dịch muối bạc vào cốc thủy tinh'
  },

  // --- CÁC KHỚP NỐI NƠ-RON MỚI: NHIỆT HỌC (ĐUN NƯỚC ĐÁ, KIỀNG SẮT, NHIỆT KẾ) ---
  {
    id: 'SYN-ICE-THV',
    source: 'ice-cubes-tray',
    target: 'thermal-heating-vessel',
    type: 'submersion',
    weight: 0.96,
    signalSpeed: 1.4,
    causalRule: 'Đổ các viên nước đá tinh khiết (-5°C) từ khay vào bình thủy tinh chịu nhiệt để chuẩn bị khảo sát sự nóng chảy',
    studentCausal: 'Bỏ các viên nước đá vào bình thủy tinh chịu nhiệt → Nhiệt độ ban đầu hạ xuống dưới 0°C',
    experimentContext: 'Sự nóng chảy và sự sôi của nước đá (KHTN 6)'
  },
  {
    id: 'SYN-THV-TRP',
    source: 'thermal-heating-vessel',
    target: 'tripod-wire-gauze',
    type: 'mechanical_support',
    weight: 0.95,
    signalSpeed: 1.2,
    causalRule: 'Đặt bình thủy tinh chịu nhiệt lên mặt lưới amiăng của kiềng sắt 3 chân để truyền nhiệt đều',
    studentCausal: 'Đặt bình đựng nước đá lên trên lưới tản nhiệt của kiềng sắt 3 chân',
    experimentContext: 'Lắp bộ dụng cụ đun nước đá'
  },
  {
    id: 'SYN-BKR100-TRP',
    source: 'beaker-bomex-100',
    target: 'tripod-wire-gauze',
    type: 'mechanical_support',
    weight: 0.92,
    signalSpeed: 1.2,
    causalRule: 'Đặt cốc đong borosilicate 100ml lên lưới tản nhiệt của kiềng sắt để đun nóng dung dịch hóa học',
    studentCausal: 'Đặt cốc đong 100ml lên kiềng sắt có lưới tản nhiệt để đun nóng an toàn',
    experimentContext: 'Đun nóng dung dịch trong cốc đong 100ml'
  },
  {
    id: 'SYN-ALC-TRP',
    source: 'alcohol-lamp',
    target: 'tripod-wire-gauze',
    type: 'thermal_exchange',
    weight: 0.97,
    signalSpeed: 1.5,
    causalRule: 'Ngọn lửa đèn cồn đặt dưới gầm kiềng sắt truyền nhiệt qua lưới amiăng lên đáy bình đun',
    studentCausal: 'Đặt đèn cồn đang cháy dưới kiềng sắt → Lưới tản nhiệt nóng đỏ truyền nhiệt đều lên bình',
    experimentContext: 'Cung cấp nhiệt lượng đun nóng chảy và đun sôi'
  },
  {
    id: 'SYN-THM-THV',
    source: 'thermometer',
    target: 'thermal-heating-vessel',
    type: 'thermal_exchange',
    weight: 0.96,
    signalSpeed: 1.3,
    causalRule: 'Bầu nhiệt kế nhúng trong bình đun ghi nhận nhiệt độ dừng ở 0°C khi đá đang tan và dừng ở 100°C khi nước đang sôi',
    studentCausal: 'Cắm nhiệt kế vào bình nước đá đang đun → Thấy nhiệt kế dừng ở 0°C khi đá tan và 100°C khi nước sôi!',
    experimentContext: 'Theo dõi nhiệt độ nóng chảy (0°C) và nhiệt độ sôi (100°C)'
  },
  {
    id: 'SYN-THM-BKR100',
    source: 'thermometer',
    target: 'beaker-bomex-100',
    type: 'thermal_exchange',
    weight: 0.90,
    signalSpeed: 1.2,
    causalRule: 'Đo nhiệt độ dung dịch phản ứng trong cốc đong 100ml',
    studentCausal: 'Nhúng nhiệt kế vào cốc đong 100ml → Đọc nhiệt độ của dung dịch',
    experimentContext: 'Khảo sát biến thiên nhiệt độ trong phản ứng hóa học'
  },

  // --- CÁC KHỚP NỐI NƠ-RON MỚI: MÁY NÉN THỦY LỰC PASCAL ---
  {
    id: 'SYN-PWT-PAS',
    source: 'pascal-weight-100g',
    target: 'pascal-hydraulic-press',
    type: 'mechanical_support',
    weight: 0.98,
    signalSpeed: 1.6,
    causalRule: 'Đặt quả nặng 100g (1N) lên pít-tông tạo áp suất p = F/S truyền nguyên vẹn qua chất lỏng sang nhánh kia theo nguyên lý Pascal',
    studentCausal: 'Đặt quả nặng 100g lên nhánh nhỏ S2 → Đẩy pít-tông nhánh lớn S1 nâng được vật nặng gấp đôi (200g)!',
    experimentContext: 'Nguyên lý Pascal và Máy nén thủy lực'
  },
  {
    id: 'SYN-PWT-BAL',
    source: 'pascal-weight-100g',
    target: 'electronic-balance',
    type: 'mechanical_support',
    connectorId: 'CONN_BALANCE_PAN',
    weight: 0.90,
    signalSpeed: 1.2,
    causalRule: 'Kiểm tra khối lượng chuẩn m = 100,00g của quả nặng Pascal trên cân điện tử',
    studentCausal: 'Đặt quả nặng Pascal lên cân điện tử → Hiện đúng 100.00g',
    experimentContext: 'Kiểm tra khối lượng quả nặng chuẩn'
  },

  // --- CÁC KHỚP NỐI NƠ-RON MỚI: MẠCH ĐIỆN MỘT CHIỀU DC (KHTN 8 & 9) ---
  {
    id: 'SYN-BAT-HLD',
    source: 'dc-con-o-battery',
    target: 'dc-battery-holder',
    type: 'electrical_interlock',
    weight: 0.99,
    signalSpeed: 1.8,
    causalRule: 'Lắp 2 viên pin đại Con Ó 1,5V nối tiếp vào khay tạo suất điện động tổng E_b = 3,0V tại hai cọc (+/-) của đế pin',
    studentCausal: 'Lắp 2 viên pin Con Ó 1,5V vào đế pin → Tạo thành nguồn điện 3,0V sẵn sàng cấp điện',
    experimentContext: 'Lắp bộ nguồn pin nối tiếp 3V'
  },
  {
    id: 'SYN-HLD-SWK',
    source: 'dc-battery-holder',
    target: 'dc-knife-switch',
    type: 'electrical_terminal',
    weight: 0.96,
    signalSpeed: 1.9,
    causalRule: 'Dây dẫn nối cực dương (+) của đế pin tới cọc vào của cầu dao K để điều khiển đóng/ngắt toàn mạch',
    studentCausal: 'Nối dây điện từ cực (+) của đế pin sang cầu dao K',
    experimentContext: 'Mắc công tắc điều khiển mạch điện một chiều'
  },
  {
    id: 'SYN-SWK-RHEO',
    source: 'dc-knife-switch',
    target: 'dc-rheostat-20',
    type: 'electrical_terminal',
    weight: 0.95,
    signalSpeed: 1.9,
    causalRule: 'Khi đóng cầu dao K, dòng điện đi qua biến trở con chạy R_b để điều chỉnh cường độ dòng điện trong mạch',
    studentCausal: 'Đóng cầu dao K → Dòng điện truyền qua biến trở con chạy 20Ω',
    experimentContext: 'Điều chỉnh cường độ dòng điện bằng biến trở'
  },
  {
    id: 'SYN-RHEO-AMM',
    source: 'dc-rheostat-20',
    target: 'dc-ammeter',
    type: 'electrical_terminal',
    weight: 0.96,
    signalSpeed: 1.9,
    causalRule: 'Ampe kế mắc nối tiếp sau biến trở đo trực tiếp cường độ dòng điện I = U / (R_đèn + R_b)',
    studentCausal: 'Dịch chuyển con chạy biến trở → Kim Ampe kế lập tức thay đổi số chỉ cường độ dòng điện I (A)',
    experimentContext: 'Đo cường độ dòng điện bằng Ampe kế mắc nối tiếp'
  },
  {
    id: 'SYN-AMM-BLB',
    source: 'dc-ammeter',
    target: 'dc-light-bulb-126',
    type: 'electrical_terminal',
    weight: 0.97,
    signalSpeed: 2.0,
    causalRule: 'Dòng điện I từ Ampe kế chạy qua dây tóc bóng đèn làm dây tóc nóng sáng tương ứng với giá trị chỉ trên Ampe kế',
    studentCausal: 'Dòng điện đi qua Ampe kế tới bóng đèn → Kim Ampe kế chỉ càng cao thì bóng đèn càng sáng rực!',
    experimentContext: 'Khảo sát độ sáng bóng đèn và số chỉ Ampe kế'
  },
  {
    id: 'SYN-BLB-VLT',
    source: 'dc-light-bulb-126',
    target: 'dc-voltmeter',
    type: 'electrical_terminal',
    weight: 0.96,
    signalSpeed: 1.9,
    causalRule: 'Vôn kế mắc song song hai đầu bóng đèn đo độ sụt áp U_đèn = I · R_đèn trên bóng đèn',
    studentCausal: 'Mắc Vôn kế song song hai đầu bóng đèn → Kim Vôn kế chỉ đúng hiệu điện thế U (V) đặt vào đèn',
    experimentContext: 'Đo hiệu điện thế hai đầu bóng đèn bằng Vôn kế'
  },
  {
    id: 'SYN-HLD-BLB',
    source: 'dc-battery-holder',
    target: 'dc-light-bulb-126',
    type: 'electrical_interlock',
    weight: 0.95,
    signalSpeed: 2.0,
    causalRule: 'Khép kín mạch điện từ nguồn 2 pin 3V qua cầu dao K làm bóng đèn dây tóc phát sáng',
    studentCausal: 'Nối khép kín mạch về cực âm (-) của đế pin → Mạch kín làm bóng đèn sáng lên!',
    experimentContext: 'Lắp mạch điện đơn giản thắp sáng bóng đèn'
  }
];

// -------------------------------------------------------------
// 3. BÀI THỰC HÀNH CÓ TIẾN TRÌNH TỪNG BƯỚC (STEP-BY-STEP FLOWS)
// -------------------------------------------------------------
export const EXPERIMENT_MACRO_CLUSTERS: ExperimentMacroCluster[] = [
  {
    id: 'EXP-OPTICS-812',
    title: 'Tạo ảnh qua Thấu kính hội tụ (Bài 8.12)',
    subject: 'Quang học',
    grade: 'KHTN 9',
    gradeCode: 'grade9',
    deviceIds: ['optical-power-supply', 'optical-lamp', 'frosted-f-object', 'optical-lens', 'optical-screen', 'optical-bench'],
    description: 'Bố trí các dụng cụ đồng trục trên giá quang học 90cm. Khi d > f, thu được ảnh thật ngược chiều chữ F rõ nét trên màn hứng ảnh.',
    studentGoal: 'Tìm xem ảnh của chữ F khi đi qua kính lồi (thấu kính hội tụ) có đặc điểm gì?',
    coreEquation: '\\frac{1}{f} = \\frac{1}{d} + \\frac{1}{d\'}',
    sgkFormula: 'Ảnh thật, ngược chiều với vật khi để vật xa hơn tiêu cự f',
    steps: [
      {
        stepNumber: 1,
        title: 'Bước 1: Lắp thanh ray và cố định thấu kính',
        instruction: 'Đặt thanh ray quang học 90cm lên bàn và gá thấu kính hội tụ (f = 10cm) tại đúng mốc số 0 ở giữa.',
        activeDeviceIds: ['optical-bench', 'optical-lens'],
        activeSynapseIds: ['SYN-OPT-OBN'],
        focusNote: 'Thấu kính nằm chính giữa mốc 0 làm gốc đo khoảng cách.'
      },
      {
        stepNumber: 2,
        title: 'Bước 2: Cấp điện thắp sáng đèn Halogen',
        instruction: 'Gá đèn tại mốc -35cm, cắm 2 dây điện đỏ/đen vào bộ nguồn 12V và bật công tắc nguồn.',
        activeDeviceIds: ['optical-power-supply', 'optical-lamp', 'optical-bench'],
        activeSynapseIds: ['SYN-PSU-OLP', 'SYN-OLP-OBN'],
        focusNote: 'Nhớ kiểm tra cả 2 công tắc: công tắc nguồn và công tắc đèn!'
      },
      {
        stepNumber: 3,
        title: 'Bước 3: Đặt vật sáng chữ F trước thấu kính',
        instruction: 'Gá tấm kính chữ F tại mốc -20cm (cách thấu kính d = 20cm, lớn hơn tiêu cự f = 10cm).',
        activeDeviceIds: ['optical-lamp', 'frosted-f-object', 'optical-lens'],
        activeSynapseIds: ['SYN-OLP-FOB', 'SYN-FOB-OPT'],
        focusNote: 'Khoảng cách d = 20cm > f nên chắc chắn sẽ tạo ra ảnh thật.'
      },
      {
        stepNumber: 4,
        title: 'Bước 4: Trượt màn hứng tìm ảnh rõ nét',
        instruction: 'Gá màn hứng màu trắng phía sau thấu kính và trượt chậm xung quanh mốc +20cm đến +30cm cho đến khi ảnh chữ F nét căng.',
        activeDeviceIds: ['optical-lens', 'optical-screen', 'optical-bench'],
        activeSynapseIds: ['SYN-OPT-SCR', 'SYN-SCR-OBN'],
        focusNote: 'Quan sát thấy ảnh chữ F bị lộn ngược đầu so với vật chữ F ban đầu!'
      }
    ]
  },
  {
    id: 'EXP-ARCHIMEDES',
    title: 'Nghiệm chứng Lực đẩy Ác-si-mét',
    subject: 'Cơ học',
    grade: 'KHTN 8',
    gradeCode: 'grade8',
    deviceIds: ['electronic-balance', 'graduated-cylinder', 'overflow-can', 'spring-dynamometer', 'solid-cylinder', 'beaker-250', 'water-dispenser'],
    description: 'Đo trọng lượng vật trong không khí và khi nhúng chìm trong nước. Chứng minh độ lớn lực đẩy Ác-si-mét đúng bằng trọng lượng phần nước bị vật chiếm chỗ.',
    studentGoal: 'Tại sao khi nhúng một vật vào nước ta lại cảm thấy vật nhẹ hơn?',
    coreEquation: 'F_A = P_{\\text{khí}} - P_{\\text{nước}} = \\rho \\cdot g \\cdot V',
    sgkFormula: 'Độ giảm trọng lượng = Trọng lượng nước tràn ra (F_A = P1 - P2)',
    steps: [
      {
        stepNumber: 1,
        title: 'Bước 1: Đo trọng lượng vật ngoài không khí (P1)',
        instruction: 'Dùng lực kế lò xo móc vào mẫu vật hình trụ nhôm và đọc số chỉ P1 ngoài không khí.',
        activeDeviceIds: ['solid-cylinder', 'spring-dynamometer'],
        activeSynapseIds: ['SYN-CYL-DYN'],
        focusNote: 'Ví dụ số chỉ P1 = 2.0 Newton.'
      },
      {
        stepNumber: 2,
        title: 'Bước 2: Nạp nước đầy bình tràn Eureka',
        instruction: 'Mở van bình cấp nước rót vào bình tràn cho tới khi nước vừa chớm tràn qua vòi xả nghiêng.',
        activeDeviceIds: ['water-dispenser', 'overflow-can'],
        activeSynapseIds: ['SYN-WDP-OVF'],
        focusNote: 'Chờ cho giọt nước cuối cùng ngừng chảy thì đặt cốc hứng dưới miệng vòi.'
      },
      {
        stepNumber: 3,
        title: 'Bước 3: Nhúng vật chìm vào nước và hứng nước tràn',
        instruction: 'Nhúng từ từ vật đang treo trên lực kế vào bình tràn. Đọc số chỉ P2 trên lực kế và hứng toàn bộ nước tràn vào cốc.',
        activeDeviceIds: ['spring-dynamometer', 'solid-cylinder', 'overflow-can', 'beaker-250'],
        activeSynapseIds: ['SYN-DYN-BKR', 'SYN-OVF-BKR'],
        focusNote: 'Số chỉ lực kế giảm xuống còn P2 = 1.3 N (Nhẹ hơn 0.7 N!).'
      },
      {
        stepNumber: 4,
        title: 'Bước 4: Cân lượng nước tràn để đối chiếu',
        instruction: 'Đem cốc nước tràn đặt lên cân điện tử. Khối lượng nước tràn ra có trọng lượng đúng bằng 0.7 N!',
        activeDeviceIds: ['beaker-250', 'electronic-balance'],
        activeSynapseIds: ['SYN-BKR-BAL'],
        focusNote: 'Kết luận: Lực đẩy Ác-si-mét đúng bằng trọng lượng nước bị chiếm chỗ!'
      }
    ]
  },
  {
    id: 'EXP-CHEM-POUR-CU-AGNO3',
    title: 'Đong rót Hóa chất vào Cốc 100ml & Phản ứng Cu + AgNO₃',
    subject: 'Hóa học',
    grade: 'KHTN 8',
    gradeCode: 'grade8',
    deviceIds: ['beaker-bomex-100', 'reagent-bottle-agno3-400', 'reagent-bottle-naoh-400', 'copper-wire-ring-3g', 'electronic-balance'],
    description: 'Sử dụng cốc đong thủy tinh 100ml BOMEX rỗng, kéo các lọ hóa chất (AgNO₃ 0,1M hoặc NaOH 0,1M) vào chốt bắt dính để nhập chính xác thể tích (ml) hoặc khối lượng (g) muốn rót, sau đó khảo sát phản ứng của vòng dây đồng Cu (M=64).',
    studentGoal: 'Làm thế nào để lấy chính xác một lượng dung dịch hóa chất (theo ml hoặc gam) vào cốc đong 100ml và quan sát phản ứng của đồng với muối bạc?',
    coreEquation: '\\text{Cu} + 2\\text{AgNO}_3 \\rightarrow \\text{Cu(NO}_3)_2 + 2\\text{Ag}\\downarrow',
    sgkFormula: 'Rót dung dịch theo thể tích (ml) / khối lượng (g) và nhúng vòng đồng Cu (M=64)',
    steps: [
      {
        stepNumber: 1,
        title: 'Bước 1: Chuẩn bị Cốc đong thủy tinh 100ml rỗng (0 ml)',
        instruction: 'Đặt Cốc đong thí nghiệm thủy tinh 100ml (BOMEX) lên bàn thí nghiệm. Ban đầu cốc hoàn toàn rỗng (0 ml).',
        activeDeviceIds: ['beaker-bomex-100', 'electronic-balance'],
        activeSynapseIds: ['SYN-BKR100-BAL'],
        focusNote: 'Có thể đặt cốc 100ml rỗng lên cân điện tử và nhấn TARE để trừ bì vỏ cốc.'
      },
      {
        stepNumber: 2,
        title: 'Bước 2: Kéo lọ hóa chất vào Chốt bắt dính & Nhập lượng rót',
        instruction: 'Kéo lọ AgNO₃ 0,1M (hoặc NaOH 0,1M) lại gần miệng cốc 100ml cho đến khi chốt bắt dính hút vào rồi thả chuột. Nhập thể tích (ví dụ 40 ml) hoặc khối lượng (40 g) vào khung và nhấn OK.',
        activeDeviceIds: ['reagent-bottle-agno3-400', 'reagent-bottle-naoh-400', 'beaker-bomex-100'],
        activeSynapseIds: ['SYN-AGNO3-BKR100', 'SYN-NAOH-BKR100'],
        focusNote: 'Dòng dung dịch sẽ tự động rót mượt mà vào cốc 100ml đúng số ml/g bạn đã nhập!'
      },
      {
        stepNumber: 3,
        title: 'Bước 3: Cân mẫu vòng dây đồng nguyên chất Cu (M=64)',
        instruction: 'Đặt mẫu vòng dây đồng Cu lên cân điện tử để xác nhận khối lượng ban đầu m = 3,00g (khối lượng mol M = 64).',
        activeDeviceIds: ['copper-wire-ring-3g', 'electronic-balance'],
        activeSynapseIds: ['SYN-CU-BAL'],
        focusNote: 'Vòng dây đồng có màu đỏ gạch ánh kim đặc trưng và đường kính gọn dễ lọt lòng cốc 100ml.'
      },
      {
        stepNumber: 4,
        title: 'Bước 4: Thả vòng dây đồng Cu vào cốc đong 100ml chứa AgNO₃',
        instruction: 'Kéo thả vòng dây đồng Cu vào lòng cốc đong 100ml vừa rót dung dịch AgNO₃ 0,1M và quan sát sự đổi màu.',
        activeDeviceIds: ['copper-wire-ring-3g', 'beaker-bomex-100', 'reagent-bottle-agno3-400'],
        activeSynapseIds: ['SYN-CU-BKR100', 'SYN-CU-AGNO3'],
        focusNote: 'Kim loại Bạc (Ag) kết tủa bám trắng xám lên vòng đồng và dung dịch dần chuyển màu xanh lam!'
      }
    ]
  },
  {
    id: 'EXP-THERMAL-ICE-BOILING',
    title: 'Sự nóng chảy và Sự sôi của Nước đá',
    subject: 'Nhiệt học',
    grade: 'KHTN 6',
    gradeCode: 'grade6',
    deviceIds: ['ice-cubes-tray', 'thermal-heating-vessel', 'tripod-wire-gauze', 'alcohol-lamp', 'thermometer'],
    description: 'Đun nóng các viên nước đá tinh khiết trong bình thủy tinh chịu nhiệt đặt trên kiềng sắt và lưới tản nhiệt, theo dõi nhiệt độ ở 0°C và 100°C.',
    studentGoal: 'Trong suốt thời gian nước đá đang nóng chảy và khi nước đang sôi, nhiệt độ của nước có thay đổi không?',
    coreEquation: 't_{\\text{nc}} = 0^\\circ\\text{C}, \\quad t_{\\text{sôi}} = 100^\\circ\\text{C}',
    sgkFormula: 'Nước đá tan ở 0°C và nước sôi ở 100°C (nhiệt độ giữ không đổi khi đang chuyển thể)',
    steps: [
      {
        stepNumber: 1,
        title: 'Bước 1: Cho nước đá viên vào bình đun chịu nhiệt',
        instruction: 'Lấy các viên nước đá từ khay (-5°C) bỏ vào bình thủy tinh chịu nhiệt 250ml và cắm nhiệt kế vào bình.',
        activeDeviceIds: ['ice-cubes-tray', 'thermal-heating-vessel', 'thermometer'],
        activeSynapseIds: ['SYN-ICE-THV', 'SYN-THM-THV'],
        focusNote: 'Đầu bầu nhiệt kế phải ngập trong phần nước đá.'
      },
      {
        stepNumber: 2,
        title: 'Bước 2: Đặt bình lên kiềng sắt và châm lửa đèn cồn',
        instruction: 'Đặt bình lên lưới tản nhiệt của kiềng 3 chân, đặt đèn cồn bên dưới và bật lửa đun nóng.',
        activeDeviceIds: ['thermal-heating-vessel', 'tripod-wire-gauze', 'alcohol-lamp'],
        activeSynapseIds: ['SYN-THV-TRP', 'SYN-ALC-TRP'],
        focusNote: 'Quan sát ở 0°C: Nước đá bắt đầu tan và nhiệt độ giữ nguyên ở 0°C cho tới khi tan hết!'
      },
      {
        stepNumber: 3,
        title: 'Bước 3: Theo dõi nước nóng lên và sôi ở 100°C',
        instruction: 'Sau khi đá tan hết thành nước lỏng, tiếp tục đun cho tới khi bọt khí nổi lên ồ ạt trên mặt thoáng.',
        activeDeviceIds: ['thermal-heating-vessel', 'thermometer', 'alcohol-lamp'],
        activeSynapseIds: ['SYN-THM-THV', 'SYN-ALC-TRP'],
        focusNote: 'Khi nước đang sôi mạnh, vạch nhiệt kế dừng lại ở đúng 100°C!'
      }
    ]
  },
  {
    id: 'EXP-PASCAL-HYDRAULIC',
    title: 'Nguyên lý Pascal & Máy nén thủy lực',
    subject: 'Cơ học',
    grade: 'KHTN 8',
    gradeCode: 'grade8',
    deviceIds: ['pascal-hydraulic-press', 'pascal-weight-100g', 'electronic-balance'],
    description: 'Khảo sát sự truyền áp suất trong chất lỏng bằng bình thông nhau có 2 pít-tông tiết diện S₁ = 2·S₂ và các quả nặng chuẩn 100g.',
    studentGoal: 'Vì sao dùng tay ấn nhẹ vào pít-tông nhỏ của kích thủy lực lại nâng được cả chiếc ô tô nặng hàng tấn?',
    coreEquation: 'p_1 = p_2 \\Leftrightarrow \\frac{F_1}{S_1} = \\frac{F_2}{S_2}',
    sgkFormula: 'Nhánh lớn có diện tích gấp mấy lần nhánh nhỏ thì lực nâng lớn gấp bấy nhiêu lần',
    steps: [
      {
        stepNumber: 1,
        title: 'Bước 1: Đặt quả nặng 100g lên pít-tông nhỏ S₂',
        instruction: 'Kéo thả 1 quả nặng chuẩn 100g (1N) đặt lên đĩa pít-tông nhỏ S₂ bên phải của máy nén Pascal.',
        activeDeviceIds: ['pascal-weight-100g', 'pascal-hydraulic-press'],
        activeSynapseIds: ['SYN-PWT-PAS'],
        focusNote: 'Áp suất truyền qua chất lỏng đẩy pít-tông lớn S₁ bên trái dâng cao lên.'
      },
      {
        stepNumber: 2,
        title: 'Bước 2: Đặt 2 quả nặng 100g lên pít-tông lớn S₁ để cân bằng',
        instruction: 'Đặt tiếp 2 quả nặng 100g (tổng 200g = 2N) lên đĩa pít-tông lớn S₁ (có diện tích gấp đôi S₂).',
        activeDeviceIds: ['pascal-weight-100g', 'pascal-hydraulic-press'],
        activeSynapseIds: ['SYN-PWT-PAS'],
        focusNote: 'Hai pít-tông trở lại vị trí cân bằng ngang nhau vì F₁/S₁ = 2N / 2S₂ = 1N / S₂!'
      }
    ]
  },
  {
    id: 'EXP-DC-CIRCUIT-OHM',
    title: 'Mạch điện một chiều, Ampe kế, Vôn kế & Biến trở',
    subject: 'Điện từ học',
    grade: 'KHTN 8',
    gradeCode: 'grade8',
    deviceIds: ['dc-battery-holder', 'dc-con-o-battery', 'dc-knife-switch', 'dc-rheostat-20', 'dc-ammeter', 'dc-light-bulb-126', 'dc-voltmeter'],
    description: 'Lắp mạch điện một chiều gồm nguồn 2 pin Con Ó 3V, cầu dao K, biến trở con chạy 20Ω, bóng đèn dây tóc, Ampe kế mắc nối tiếp và Vôn kế mắc song song.',
    studentGoal: 'Làm thế nào để đo cường độ dòng điện, hiệu điện thế và điều chỉnh độ sáng của bóng đèn trong mạch điện?',
    coreEquation: 'I = \\frac{U}{R_{\\text{đèn}} + R_b}',
    sgkFormula: 'Ampe kế mắc nối tiếp đo dòng điện (A), Vôn kế mắc song song đo hiệu điện thế (V)',
    steps: [
      {
        stepNumber: 1,
        title: 'Bước 1: Lắp 2 viên Pin đại Con Ó 1,5V vào đế pin',
        instruction: 'Kéo 2 viên pin đại Con Ó 1,5V lắp vào khay của giá đỡ pin để tạo nguồn điện một chiều 3,0V.',
        activeDeviceIds: ['dc-con-o-battery', 'dc-battery-holder'],
        activeSynapseIds: ['SYN-BAT-HLD'],
        focusNote: 'Hai pin mắc nối tiếp cho hiệu điện thế tổng cộng U = 1,5V + 1,5V = 3,0V.'
      },
      {
        stepNumber: 2,
        title: 'Bước 2: Mắc nối tiếp Cầu dao K, Biến trở, Ampe kế và Bóng đèn',
        instruction: 'Mắc nối tiếp nguồn pin với cầu dao K (đang mở), biến trở con chạy 20Ω, Ampe kế và bóng đèn dây tóc.',
        activeDeviceIds: ['dc-battery-holder', 'dc-knife-switch', 'dc-rheostat-20', 'dc-ammeter', 'dc-light-bulb-126'],
        activeSynapseIds: ['SYN-HLD-SWK', 'SYN-SWK-RHEO', 'SYN-RHEO-AMM', 'SYN-AMM-BLB'],
        focusNote: 'Ampe kế phải mắc nối tiếp sao cho dòng điện đi vào chốt (+) và đi ra chốt (-).'
      },
      {
        stepNumber: 3,
        title: 'Bước 3: Mắc song song Vôn kế và đóng Cầu dao K',
        instruction: 'Mắc Vôn kế song song với hai đầu bóng đèn, sau đó đóng cầu dao K và kéo con chạy biến trở để quan sát.',
        activeDeviceIds: ['dc-knife-switch', 'dc-rheostat-20', 'dc-ammeter', 'dc-light-bulb-126', 'dc-voltmeter'],
        activeSynapseIds: ['SYN-BLB-VLT', 'SYN-HLD-BLB'],
        focusNote: 'Khi giảm điện trở biến trở, kim Ampe kế và Vôn kế đều tăng lên và bóng đèn sáng rực!'
      }
    ]
  },
  {
    id: 'EXP-FARADAY-INDUCTION',
    title: 'Hiện tượng Cảm ứng Điện từ',
    subject: 'Điện từ học',
    grade: 'KHTN 9',
    gradeCode: 'grade9',
    deviceIds: ['induction-coil', 'galvanometer', 'digital-multimeter'],
    description: 'Chuyển động tương đối giữa thanh nam châm và cuộn dây dẫn kín làm biến thiên từ thông, sinh ra dòng điện cảm ứng làm sáng 2 đèn LED đổi màu.',
    studentGoal: 'Làm thế nào để tạo ra dòng điện mà không cần đến pin hay ắc-quy?',
    coreEquation: '\\mathcal{E}_c = -N \\frac{\\Delta \\Phi}{\\Delta t}',
    sgkFormula: 'Di chuyển nam châm gần hoặc xa cuộn dây làm kim điện kế lệch',
    steps: [
      {
        stepNumber: 1,
        title: 'Bước 1: Nối cuộn dây với điện kế nhạy',
        instruction: 'Cắm 2 đầu dây của cuộn cảm vào 2 cọc đo của điện kế vạch 0 ở giữa.',
        activeDeviceIds: ['induction-coil', 'galvanometer'],
        activeSynapseIds: ['SYN-COIL-GLV'],
        focusNote: 'Khi nam châm đứng yên, kim điện kế chỉ số 0 (không có dòng điện).'
      },
      {
        stepNumber: 2,
        title: 'Bước 2: Đẩy nhanh cực Bắc nam châm vào lòng cuộn dây',
        instruction: 'Cầm thanh nam châm đưa nhanh vào trong lòng cuộn dây.',
        activeDeviceIds: ['induction-coil', 'galvanometer'],
        activeSynapseIds: ['SYN-COIL-GLV'],
        focusNote: 'Kim điện kế lập tức lệch sang phải và đèn LED đỏ lóe sáng!'
      },
      {
        stepNumber: 3,
        title: 'Bước 3: Rút thanh nam châm ra khỏi cuộn dây',
        instruction: 'Rút nhanh thanh nam châm ra khỏi cuộn dây theo chiều ngược lại.',
        activeDeviceIds: ['induction-coil', 'galvanometer'],
        activeSynapseIds: ['SYN-COIL-GLV'],
        focusNote: 'Kim điện kế đổi chiều lệch sang trái và đèn LED xanh lóe sáng!'
      }
    ]
  },
  {
    id: 'EXP-CELL-MICROSCOPY',
    title: 'Quan sát Tế bào Kính hiển vi 3D',
    subject: 'Sinh học',
    grade: 'KHTN 6',
    gradeCode: 'grade6',
    deviceIds: ['microscope', 'dna-model', 'magnifying-glass'],
    description: 'Điều chỉnh ốc sơ cấp và vi cấp để hội tụ trường nhìn vào lớp tế bào biểu bì hoặc nhiễm sắc thể, liên hệ cấu trúc vi thể với mô hình DNA.',
    studentGoal: 'Tế bào sinh vật có hình dạng như thế nào dưới độ phóng đại hàng trăm lần?',
    coreEquation: 'M_{\\text{tổng}} = M_{\\text{thị}} \\times M_{\\text{vật}}',
    sgkFormula: 'Độ phóng đại = Thị kính 10x × Vật kính 40x = 400 lần',
    steps: [
      {
        stepNumber: 1,
        title: 'Bước 1: Đặt lam kính tiêu bản lên bàn sa trượt',
        instruction: 'Kẹp lam kính tiêu bản tế bào vào giữa ngàm giữ trên bàn kính hiển vi.',
        activeDeviceIds: ['microscope'],
        activeSynapseIds: [],
        focusNote: 'Căn cho mẫu vật nằm ngay tâm lỗ tròn chiếu sáng bên dưới.'
      },
      {
        stepNumber: 2,
        title: 'Bước 2: Chỉnh ốc sơ cấp (ốc to) lấy nét sơ bộ',
        instruction: 'Vặn ốc sơ cấp từ từ nâng bàn kính lên cho đến khi nhìn thấy hình dạng tế bào mờ mờ.',
        activeDeviceIds: ['microscope'],
        activeSynapseIds: [],
        focusNote: 'Quan sát từ bên ngoài để vật kính không chạm vào vỡ lam kính!'
      },
      {
        stepNumber: 3,
        title: 'Bước 3: Chỉnh ốc vi cấp (ốc nhỏ) làm sắc nét tế bào',
        instruction: 'Vặn nhẹ ốc vi cấp tinh chỉnh để thấy rõ màng tế bào, tế bào chất và nhân tế bào.',
        activeDeviceIds: ['microscope', 'dna-model'],
        activeSynapseIds: ['SYN-MIC-DNA'],
        focusNote: 'Bên trong nhân tế bào chứa nhiễm sắc thể và các chuỗi xoắn kép DNA di truyền!'
      }
    ]
  }
];

