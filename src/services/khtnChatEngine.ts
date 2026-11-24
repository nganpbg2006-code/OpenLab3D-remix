export interface ReferenceSourceLink {
  title: string;
  uri: string;
  domain: string;
}

export interface ChatContextPayload {
  question: string;
  phenomenon?: {
    id?: string;
    title: string;
    category: string;
    observation: string;
    scientificExplanation: string;
    formula?: string;
    metrologyNote?: string;
  } | null;
  sceneContext?: string;
  history?: Array<{ role: 'user' | 'assistant'; text: string }>;
}

export interface KnowledgeQaEntry {
  id: string;
  topic: string;
  gradeInfo: string;
  keywords: string[];
  aliases?: string[];
  coreAnswer: string;
  mechanism?: string;
  formula?: string;
  exampleOrApplication?: string;
  practicalTip?: string;
  sources?: ReferenceSourceLink[];
}

export const OUT_OF_SCOPE_APOLOGY =
  'Xin lỗi, thông tin này hiện không có trong tài liệu Khoa học Tự nhiên lớp 6, 7, 8 mà tôi được cung cấp.';

export const OFFICIAL_KHTN_678_ASSET_URI =
  '/assets/aistudio/gemini-code-1794824162503_bbfc567c.txt';

export const DEFAULT_SOURCES: ReferenceSourceLink[] = [
  {
    title: 'Tổng hợp Kiến thức Khoa học Tự nhiên (Lớp 6, 7, 8)',
    uri: OFFICIAL_KHTN_678_ASSET_URI,
    domain: 'openlab3d.local',
  },
];

/**
 * Toàn văn tài liệu gốc được đính kèm:
 * # TỔNG HỢP KIẾN THỨC KHOA HỌC TỰ NHIÊN (LỚP 6, 7, 8)
 */
export const KHTN_678_DOCUMENT_TEXT = `# TỔNG HỢP KIẾN THỨC KHOA HỌC TỰ NHIÊN (LỚP 6, 7, 8)

Tài liệu này tổng hợp các kiến thức cốt lõi của môn Khoa học tự nhiên, bao gồm các phương pháp đo lường cơ bản và ba phân môn: Hoá học (Chất và sự biến đổi của chất), Vật lí (Năng lượng và sự biến đổi), Sinh học (Vật sống).

---

## PHẦN I. MỞ ĐẦU VỀ KHOA HỌC TỰ NHIÊN VÀ ĐO LƯỜNG

### 1. Khái quát về Khoa học tự nhiên (KHTN)
- **Khái niệm**: KHTN nghiên cứu các hiện tượng tự nhiên, tìm ra các tính chất, quy luật của chúng.
- **Vật sống và vật không sống**: Vật sống có khả năng trao đổi chất, lớn lên và sinh sản (Ví dụ: con người, cây cối). Vật không sống không có các đặc trưng này (Ví dụ: cái bàn, hòn đá).
- **Các lĩnh vực chính**: Sinh học (vật sống), Hoá học (chất và sự biến đổi), Vật lí học (chuyển động, lực, năng lượng), Khoa học Trái Đất, Thiên văn học.
- **Phương pháp tìm hiểu KHTN (5 bước)**: (1) Đề xuất vấn đề → (2) Đưa ra dự đoán khoa học → (3) Lập kế hoạch kiểm tra → (4) Thực hiện kế hoạch → (5) Viết báo cáo, thảo luận.
- **Kĩ năng tiến trình**: Quan sát, phân loại, liên kết, đo lường và dự báo.

### 2. Các phép đo lường cơ bản
- **Đo chiều dài**:
  - Đơn vị cơ bản: mét (m). Đơn vị khác: mm, cm, dm, km (1 km = 1000 m, 1 m = 1000 mm).
  - Dụng cụ: Thước thẳng, thước cuộn, thước dây, thước kẹp.
- **Đo khối lượng**:
  - Định nghĩa: Khối lượng là số đo lượng chất của vật.
  - Đơn vị cơ bản: kilôgam (kg). Đơn vị khác: mg, g, lạng, tạ, tấn (1 tấn = 1000 kg).
  - Dụng cụ: Cân (Rô-béc-van, đồng hồ, điện tử, cân y tế).
- **Đo thời gian**:
  - Đơn vị cơ bản: giây (s). Đơn vị khác: phút (min), giờ (h), ngày, tháng, năm.
  - Dụng cụ: Đồng hồ (bấm giây, điện tử, quả lắc). Trong phòng thí nghiệm dùng cổng quang điện và đồng hồ đo thời gian hiện số.
- **Đo nhiệt độ**:
  - Định nghĩa: Nhiệt độ là số đo mức độ nóng, lạnh của một vật.
  - Đơn vị: Độ C (°C) theo thang nhiệt độ Xen-xi-út (Celsius) hoặc độ F (°F) theo thang Fa-ren-hai (Fahrenheit).
    - Công thức quy đổi: t(°F) = (t(°C) × 1,8) + 32
    - Điểm đóng băng của nước là 0°C, điểm sôi là 100°C.
  - Dụng cụ: Nhiệt kế (dựa trên sự nở vì nhiệt của chất lỏng), nhiệt kế hồng ngoại, nhiệt kế điện tử.
- **Quy trình đo (5 bước chung)**: (1) Ước lượng đại lượng cần đo → (2) Chọn dụng cụ đo có Giới hạn đo (GHĐ) và Độ chia nhỏ nhất (ĐCNN) phù hợp → (3) Đặt/hiệu chỉnh dụng cụ đúng cách → (4) Đặt mắt nhìn đúng quy cách → (5) Đọc và ghi kết quả.

### 3. Thiết bị và An toàn phòng thực hành
- **Thiết bị đo điện**:
  - Ampe kế (đo cường độ dòng điện), Vôn kế (đo hiệu điện thế), Joulemeter (đo năng lượng điện, công suất). Thiết bị đo pH.
- **Quy tắc an toàn**: Không ăn uống, đùa nghịch; phải mặc đồ bảo hộ (kính, găng tay); đọc kĩ nhãn hoá chất; tuân thủ quy tắc lấy hoá chất (dùng panh/thìa cho chất rắn, ống hút nhỏ giọt cho chất lỏng).
- **Kí hiệu cảnh báo**: Chất độc, chất dễ cháy, nguồn điện nguy hiểm, chất ăn mòn, cảnh báo nguy hiểm sinh học.

---

## PHẦN II. CHẤT VÀ SỰ BIẾN ĐỔI CỦA CHẤT (HOÁ HỌC)

### 1. Chất quanh ta
- **Đa dạng của chất**: Chất tạo nên vật thể. Mỗi chất đều có tính chất vật lí (thể, màu, mùi, vị, nhiệt độ nóng chảy/sôi, tính dẫn điện/nhiệt) và tính chất hoá học (sự biến đổi tạo ra chất mới).
- **Ba thể của chất**:
  - **Thể rắn**: Hình dạng cố định, rất khó nén, các hạt dao động quanh vị trí cố định.
  - **Thể lỏng**: Hình dạng của vật chứa, khó nén, có thể chảy, các hạt trượt lên nhau.
  - **Thể khí**: Hình dạng vật chứa, dễ bị nén, lan toả theo mọi hướng, các hạt di chuyển tự do.
- **Sự chuyển thể**: Nóng chảy (Rắn → Lỏng), Đông đặc (Lỏng → Rắn), Hoá hơi/Sôi/Bay hơi (Lỏng → Khí), Ngưng tụ (Khí → Lỏng).

### 2. Oxygen và Không khí
- **Oxygen (O₂)**: Khí không màu, không mùi, ít tan trong nước, hoá lỏng ở -183°C (màu xanh nhạt). Cần thiết cho hô hấp và sự cháy.
- **Không khí**: Là hỗn hợp khí. Thành phần thể tích: 78% Nitrogen, 21% Oxygen, 1% Carbon dioxide, hơi nước và khí khác.
- **Ô nhiễm không khí**: Xảy ra do núi lửa, cháy rừng, rác thải, khí thải công nghiệp/giao thông. Gây hiệu ứng nhà kính, mưa acid, bệnh hô hấp.

### 3. Vật liệu, Nguyên liệu, Nhiên liệu, Lương thực - Thực phẩm
- **Vật liệu**: Kim loại (dẫn điện/nhiệt tốt, có ánh kim), Thuỷ tinh (trong suốt, giòn, cách điện), Nhựa (dẻo, nhẹ, cách điện), Cao su (đàn hồi, cách điện). Nguyên tắc 3R (Reduce - Giảm thiểu, Reuse - Tái sử dụng, Recycle - Tái chế).
- **Nguyên liệu**: Đất, đá, quặng (quặng sắt làm gang/thép, quặng bauxite làm nhôm), dầu mỏ. Là tài nguyên hữu hạn.
- **Nhiên liệu**: Các chất cháy toả nhiệt (than, gỗ, xăng, khí gas). Gồm thể rắn, lỏng, khí.
- **Lương thực - Thực phẩm**: Chứa các nhóm dinh dưỡng chính: Carbohydrate (cung cấp năng lượng), Protein (chất đạm cấu tạo cơ thể), Lipid (chất béo dự trữ năng lượng), Chất khoáng và Vitamin.

### 4. Hỗn hợp và Tách chất
- **Chất tinh khiết**: Chỉ có một chất duy nhất, tính chất xác định (VD: nước cất).
- **Hỗn hợp**: Gồm hai chất trở lên.
  - **Dung dịch**: Hỗn hợp đồng nhất giữa dung môi và chất tan.
  - **Huyền phù**: Hỗn hợp rắn-lỏng không đồng nhất (hạt rắn lơ lửng trong lỏng).
  - **Nhũ tương**: Hỗn hợp lỏng-lỏng không đồng nhất.
- **Phương pháp tách chất**: Lắng/gạn (chất rắn nặng chìm xuống), Lọc (tách chất rắn lơ lửng/không tan khỏi lỏng), Cô cạn (tách chất rắn tan ra khỏi dung môi bằng đun nóng), Chiết (tách hai chất lỏng không hoà tan vào nhau).

### 5. Nguyên tử và Bảng tuần hoàn
- **Cấu tạo Nguyên tử (Mô hình Rutherford - Bohr)**:
  - Vô cùng nhỏ bé, rỗng, trung hoà về điện.
  - **Hạt nhân**: Nằm ở tâm, mang điện tích dương, gồm Proton (p, +1) và Neutron (n, không mang điện).
  - **Vỏ**: Gồm các Electron (e, -1) chuyển động quanh hạt nhân xếp thành từng lớp (lớp 1 tối đa 2e, lớp 2 tối đa 8e). Số p = Số e.
  - **Khối lượng**: Tập trung ở hạt nhân, đơn vị là amu (1 p ≈ 1 n ≈ 1 amu).
- **Nguyên tố hoá học**: Tập hợp các nguyên tử có cùng số proton. Kí hiệu hoá học gồm 1 hoặc 2 chữ cái (IUPAC).
- **Bảng tuần hoàn**:
  - Sắp xếp theo chiều tăng dần điện tích hạt nhân (số proton / số hiệu nguyên tử).
  - **Ô nguyên tố**: Chứa kí hiệu, tên, số hiệu nguyên tử, khối lượng nguyên tử.
  - **Chu kì**: Hàng ngang. Cùng số lớp electron. Số thứ tự chu kì = số lớp e.
  - **Nhóm**: Cột dọc. Có tính chất gần giống nhau. Số thứ tự nhóm A = số e lớp ngoài cùng.
  - Phân loại: Kim loại (nhóm IA, IIA, IIIA...), Phi kim (nhóm VA, VIA, VIIA), Khí hiếm (nhóm VIIIA).

### 6. Phân tử, Liên kết hoá học và Hoá trị
- **Đơn chất**: Tạo nên từ 1 nguyên tố hoá học (VD: O₂, Cu).
- **Hợp chất**: Tạo nên từ 2 hay nhiều nguyên tố hoá học (VD: H₂O, CO₂).
- **Phân tử**: Hạt đại diện cho chất, gồm các nguyên tử liên kết với nhau. Tính khối lượng (amu) bằng tổng khối lượng các nguyên tử thành phần.
- **Liên kết hoá học**: Xu hướng đạt cấu hình e bền vững của khí hiếm (8e lớp ngoài cùng, hoặc 2e với He).
  - **Liên kết ion**: Lực hút tĩnh điện giữa các ion mang điện trái dấu (Kim loại nhường e tạo ion dương, phi kim nhận e tạo ion âm). Hợp chất ion thường ở thể rắn, khó nóng chảy, dẫn điện khi tan trong nước.
  - **Liên kết cộng hoá trị**: Dùng chung một hoặc nhiều cặp electron. Gặp ở các phi kim. Nhiệt độ nóng chảy, sôi thấp.
- **Hoá trị**: Biểu thị khả năng liên kết của nguyên tử. (Quy ước: H luôn có hoá trị I, O có hoá trị II).
- **Quy tắc hoá trị**: Trong hợp chất AₓBᵧ, ta có: x · a = y · b (với a, b là hoá trị của A, B).

### 7. Phản ứng hoá học và Tính toán hoá học
- **Phản ứng hoá học**: Quá trình biến đổi từ chất này thành chất khác. (Chất phản ứng → Sản phẩm).
- **Diễn biến**: Phá vỡ liên kết cũ, hình thành liên kết mới, số lượng nguyên tử mỗi nguyên tố được bảo toàn.
- **Năng lượng**:
  - *Phản ứng toả nhiệt*: Giải phóng năng lượng ra môi trường (đốt cháy nhiên liệu).
  - *Phản ứng thu nhiệt*: Nhận năng lượng từ môi trường (nung đá vôi).
- **Mol và Khối lượng mol**:
  - 1 mol chứa N₍A₎ ≈ 6.022 × 10²³ hạt vi mô.
  - Công thức: n = m / M (Trong đó n: số mol, m: khối lượng (g), M: khối lượng mol (g/mol)).
- **Thể tích mol chất khí**: Ở đkc (25°C, 1 bar), 1 mol khí chiếm 24,79 Lít. Công thức: V = n × 24.79.
- **Tỉ khối của chất khí**: d₍A/B₎ = M₍A₎ / M₍B₎. (So với không khí: d₍A/kk₎ = M₍A₎ / 29).
- **Dung dịch & Nồng độ**:
  - Độ tan: S = (m₍ct₎ / m₍dm₎) × 100.
  - Nồng độ phần trăm: C% = (m₍ct₎ / m₍dd₎) × 100%.
  - Nồng độ mol: C₍M₎ = n / V (mol/L hoặc M).
- **Định luật bảo toàn khối lượng**: Tổng khối lượng chất sản phẩm bằng tổng khối lượng chất tham gia.
- **Tốc độ phản ứng**: Đại lượng đặc trưng cho sự nhanh/chậm của phản ứng. Tăng khi tăng: nhiệt độ, nồng độ, diện tích tiếp xúc, hoặc dùng chất xúc tác.

### 8. Các hợp chất vô cơ thông dụng
- **Acid**: Hợp chất có nguyên tử hydrogen liên kết với gốc acid. Phân li ra H⁺. Làm quỳ tím hoá đỏ. Tác dụng kim loại sinh ra H₂. (VD: HCl, H₂SO₄, CH₃COOH).
- **Base**: Hợp chất có kim loại liên kết với nhóm hydroxide (OH). Phân li ra OH⁻. Làm quỳ tím hoá xanh, phenolphthalein hoá hồng. Base tan gọi là kiềm (NaOH, KOH, Ba(OH)₂).
- **Thang pH**: Đo độ acid/base. pH < 7: Acid; pH = 7: Trung tính; pH > 7: Base (Kiềm).
- **Oxide**: Hợp chất của 2 nguyên tố (1 là oxygen). Gồm 4 loại: Oxide acid (tác dụng kiềm → muối + nước), Oxide base (tác dụng acid → muối + nước), Oxide lưỡng tính (tác dụng cả acid và base), Oxide trung tính.
- **Muối**: Cation kim loại (hoặc NH₄⁺) liên kết anion gốc acid. Phản ứng trung hoà: Acid + Base → Muối + Nước.
- **Phân bón hoá học**: Cung cấp dinh dưỡng cho cây. Gồm đa lượng (N, P, K), trung lượng, vi lượng.

---

## PHẦN III. NĂNG LƯỢNG VÀ SỰ BIẾN ĐỔI (VẬT LÍ)

### 1. Khối lượng riêng và Áp suất
- **Khối lượng riêng**: Khối lượng của một đơn vị thể tích chất. Công thức: D = m / V (Đơn vị: kg/m³ hoặc g/cm³).
- **Áp lực**: Lực ép có phương vuông góc với mặt bị ép.
- **Áp suất**: Độ lớn của áp lực trên một đơn vị diện tích bị ép.
  - Công thức: p = F / S.
  - Đơn vị: Pascal (Pa) hoặc N/m² (1 Pa = 1 N/m²). Đơn vị khác: atm, mmHg, bar.
- **Áp suất chất lỏng**: Truyền đi nguyên vẹn theo mọi hướng (Ứng dụng: Máy nén thuỷ lực).
- **Áp suất khí quyển**: Áp suất do lớp không khí bao quanh Trái Đất tác dụng lên mọi vật.
- **Lực đẩy Archimedes**: Lực đẩy do chất lỏng tác dụng lên vật đặt trong nó, hướng thẳng đứng từ dưới lên.
  - Công thức: F₍A₎ = d · V (d: trọng lượng riêng chất lỏng, V: thể tích phần chất lỏng bị chiếm chỗ).
  - Điều kiện nổi/chìm: Vật chìm khi F₍A₎ < P (trọng lượng), nổi khi F₍A₎ > P.

### 2. Tác dụng làm quay của lực
- **Moment lực**: Đại lượng đặc trưng cho tác dụng làm quay của lực quanh một điểm hoặc một trục. Phụ thuộc vào độ lớn của lực và khoảng cách từ giá của lực tới trục quay (cánh tay đòn).
- **Đòn bẩy**: Thiết bị giúp thay đổi hướng tác dụng của lực, có trục quay cố định (điểm tựa O).
  - Đòn bẩy loại 1: Điểm tựa nằm giữa 2 lực (VD: Cái kéo).
  - Đòn bẩy loại 2: Điểm tựa nằm ngoài, lực cản/vật ở giữa (lợi về lực) (VD: Xe cút kít).
  - Đòn bẩy loại 3 (không lợi về lực): Lực tác dụng ở giữa (VD: Cầm đũa, câu cá).

### 3. Điện học
- **Sự nhiễm điện**: Cọ xát làm vật nhiễm điện (mất e → dương, nhận e → âm). Vật nhiễm điện cùng dấu đẩy nhau, trái dấu hút nhau.
- **Dòng điện & Nguồn điện**: Dòng điện là dòng chuyển dời có hướng của các hạt mang điện. Nguồn điện cung cấp năng lượng điện (Pin, acquy). Dòng điện một chiều có chiều quy ước từ cực dương qua dây nối tới cực âm.
- **Vật dẫn và Vật cách điện**: Vật dẫn cho dòng điện chạy qua (kim loại). Vật cách điện không cho dòng điện chạy qua (nhựa, cao su).
- **Tác dụng của dòng điện**: Nhiệt (bàn là), Phát sáng (bóng đèn LED, huỳnh quang), Hoá học (mạ điện), Sinh lí (gây co giật, dùng trong máy sốc tim).
- **Đại lượng điện**:
  - **Cường độ dòng điện (I)**: Đo mức độ mạnh yếu của dòng điện. Dụng cụ: Ampe kế (mắc nối tiếp). Đơn vị: Ampe (A), mA.
  - **Hiệu điện thế (U)**: Đo khả năng sinh ra dòng điện của nguồn. Dụng cụ: Vôn kế (mắc song song). Đơn vị: Vôn (V).
- **Thiết bị an toàn mạch điện**: Cầu chì, Rơle, Cầu dao tự động (Aptomat).

### 4. Tốc độ chuyển động
- **Tốc độ**: Đặc trưng cho sự nhanh hay chậm của chuyển động.
- **Công thức**: v = s / t (quãng đường chia thời gian).
- **Đơn vị**: m/s hoặc km/h. (1 m/s = 3,6 km/h).
- **Đồ thị quãng đường - thời gian**: Trục hoành (t), trục tung (s). Đường thẳng xiên góc biểu diễn chuyển động đều, đường thẳng nằm ngang (song song trục t) biểu diễn vật đứng yên.
- Ý nghĩa an toàn giao thông: Giữ khoảng cách an toàn, tuân thủ tốc độ giới hạn (tuỳ loại đường và thời tiết), tuân theo quy tắc "3 giây".

### 5. Âm thanh
- **Sóng âm**: Dao động lan truyền trong môi trường (rắn, lỏng, khí). KHÔNG truyền được trong chân không.
- **Đặc trưng của âm**:
  - **Tần số (Hz)**: Số dao động trong 1 giây. Tần số quyết định **độ cao** (tần số lớn → âm bổng/cao, tần số nhỏ → âm trầm/thấp). Tai người nghe được từ 20 Hz đến 20,000 Hz.
  - **Biên độ**: Độ lệch lớn nhất khỏi vị trí cân bằng. Biên độ quyết định **độ to** của âm.
- **Phản xạ âm**: Âm dội lại khi gặp mặt chắn. Mặt nhẵn, cứng phản xạ âm tốt; mặt sần sùi, xốp phản xạ âm kém. Tiếng vang xảy ra khi âm phản xạ đến tai chậm hơn âm trực tiếp tối thiểu 1/15 giây.
- **Tiếng ồn**: Âm thanh to, kéo dài ảnh hưởng sức khoẻ. Cách chống: hạn chế nguồn ồn, trồng cây xanh phân tán, dùng vật liệu cách âm.

### 6. Ánh sáng
- **Bản chất**: Ánh sáng là một dạng năng lượng.
- **Tia sáng, chùm sáng**: Tia sáng biểu diễn bằng đường thẳng có mũi tên. Chùm sáng gồm nhiều tia sáng (song song, hội tụ, phân kì).
- **Vùng tối**: Vùng sau vật cản không nhận được ánh sáng. Nguồn sáng hẹp tạo ra vùng tối rõ rệt; nguồn sáng rộng tạo ra vùng tối và vùng nửa tối (ứng dụng giải thích nhật thực).
- **Phản xạ ánh sáng**:
  - *Định luật*: Tia phản xạ nằm trong mặt phẳng tới. Góc phản xạ (i') bằng góc tới (i).
  - *Phản xạ gương*: Bề mặt nhẵn bóng, tia sáng truyền theo 1 hướng.
  - *Phản xạ khuếch tán*: Bề mặt sần sùi, tia sáng hắt ra nhiều hướng.
- **Gương phẳng**: Tạo ảnh ảo (không hứng được trên màn), độ lớn bằng vật, khoảng cách từ vật tới gương bằng khoảng cách từ ảnh tới gương (đối xứng).

### 7. Từ trường
- **Nam châm**: Hút được các vật có từ tính (sắt, thép, niken, coban). Luôn có 2 cực: Cực Bắc (N) và cực Nam (S). Cùng từ cực đẩy nhau, khác từ cực hút nhau.
- **Từ trường**: Vùng không gian xung quanh nam châm hoặc dòng điện, tác dụng lực từ lên vật liệu từ.
- **Từ phổ và Đường sức từ**: Hình ảnh mạt sắt sắp xếp quanh nam châm. Đường sức từ có chiều đi ra từ cực Bắc, đi vào cực Nam ("Ra Bắc, Vào Nam").
- **Từ trường Trái Đất**: Trái Đất là nam châm khổng lồ. Cực Bắc địa từ nằm ở gần cực Nam địa lí, và ngược lại. Trục từ và trục địa lí không trùng nhau. (Ứng dụng: La bàn).
- **Nam châm điện**: Gồm cuộn dây dẫn và lõi sắt non. Hoạt động nhờ dòng điện, từ trường thay đổi khi dòng điện thay đổi. (Ứng dụng: Cần cẩu, chuông điện).

---

## PHẦN IV. VẬT SỐNG (SINH HỌC)

### 1. Tế bào - Đơn vị cơ bản của sự sống
- **Định nghĩa**: Tế bào là đơn vị cấu trúc và chức năng cơ bản của mọi sinh vật sống. Thực hiện đầy đủ quá trình sống (sinh trưởng, hô hấp, sinh sản, bài tiết...).
- **Kích thước**: Đa số siêu nhỏ (micromet), phải nhìn qua kính hiển vi.
- **Cấu tạo chung**:
  - **Màng tế bào**: Bao bọc, kiểm soát trao đổi chất.
  - **Tế bào chất**: Nơi diễn ra các hoạt động sống.
  - **Nhân hoặc Vùng nhân**: Chứa vật chất di truyền, trung tâm điều khiển.
- **Phân loại tế bào**:
  - **Tế bào nhân sơ**: Chưa có màng nhân, không có hệ thống nội màng, ít bào quan (Vi khuẩn).
  - **Tế bào nhân thực**: Có màng nhân, hệ thống nội màng và nhiều bào quan có màng.
  - **Tế bào thực vật vs Động vật**: Tế bào thực vật có thêm thành tế bào (bảo vệ, quy định hình dạng), lục lạp (quang hợp) và không bào trung tâm lớn.
- **Sự lớn lên và Sinh sản**: Tế bào hấp thụ dinh dưỡng lớn lên, phân chia (từ 1 thành 2). Giúp cơ thể đa bào lớn lên và thay thế tế bào chết/tổn thương.

### 2. Tổ chức cơ thể sinh vật
- **Cơ thể đơn bào**: Cơ thể chỉ gồm 1 tế bào đảm nhiệm mọi chức năng (Vi khuẩn, trùng roi, trùng biến hình).
- **Cơ thể đa bào**: Gồm nhiều tế bào chuyên hoá.
- **Các cấp tổ chức**: Tế bào → Mô (nhóm tế bào cùng hình dạng/chức năng) → Cơ quan (nhóm mô cùng thực hiện chức năng - VD: dạ dày, lá cây) → Hệ cơ quan (nhóm cơ quan - VD: Hệ tiêu hoá, Hệ rễ) → Cơ thể.

### 3. Phân loại thế giới sống
- **Vai trò**: Dễ dàng tìm kiếm và nghiên cứu các loài trong tự nhiên.
- **Hệ thống phân loại (từ lớn đến nhỏ)**: Giới → Ngành → Lớp → Bộ → Họ → Chi (Giống) → Loài.
- **Danh pháp khoa học**: Tên kép (Tên chi viết hoa + Tên loài viết thường). VD: *Apis cerana* (Ong mật).
- **Hệ thống 5 giới**:
  1. Giới Khởi sinh (Vi khuẩn): Nhân sơ, đơn bào.
  2. Giới Nguyên sinh (Tảo, Động vật nguyên sinh): Nhân thực, đa số đơn bào.
  3. Giới Nấm: Nhân thực, đơn/đa bào, dị dưỡng.
  4. Giới Thực vật: Nhân thực, đa bào, tự dưỡng quang hợp.
  5. Giới Động vật: Nhân thực, đa bào, dị dưỡng.
- **Khoá lưỡng phân**: Dùng để phân loại dựa trên việc chia liên tục các tập hợp đối tượng thành 2 nhóm mang đặc điểm đối lập nhau.

### 4. Vi khuẩn và Virus
- **Vi khuẩn (Bacteria)**:
  - Sinh vật đơn bào, nhân sơ. Hình dạng: que (trực khuẩn), xoắn, cầu.
  - Cấu tạo: Vùng nhân, tế bào chất, màng tế bào, thành tế bào, roi, lông.
  - Vai trò: Phân giải xác sinh vật, cố định đạm, dùng trong lên men (sữa chua, muối dưa).
  - Tác hại: Gây bệnh (Tả, lao phổi, uốn ván), làm hỏng thực phẩm. Dùng kháng sinh để điều trị.
- **Virus**:
  - Dạng sống siêu nhỏ (chưa có cấu tạo tế bào), kích thước nanomet. Kí sinh nội bào bắt buộc.
  - Cấu tạo cơ bản: Lõi vật chất di truyền (DNA/RNA) và Vỏ protein. Một số có vỏ ngoài/gai.
  - Hình dạng: Khối, xoắn, hỗn hợp.
  - Tác hại: Gây bệnh nguy hiểm (Sốt xuất huyết, Cúm, HIV, COVID-19). Phòng bệnh bằng Vaccine.

### 5. Trao đổi chất và Chuyển hoá năng lượng
- **Trao đổi chất**: Quá trình sinh vật lấy các chất từ môi trường, biến đổi thành chất cần thiết cho cơ thể, tạo năng lượng và thải chất thải ra ngoài.
- **Chuyển hoá năng lượng**: Sự biến đổi từ dạng năng lượng này sang dạng năng lượng khác (Quang năng → Hoá năng trong quang hợp; Hoá năng → Cơ năng/Nhiệt năng trong hô hấp).
- **Vai trò**: Đảm bảo sự sống, sinh trưởng, phát triển, vận động, cảm ứng và sinh sản của cơ thể.`;

const SUBSCRIPT_CHAR_MAP: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
  '+': '₊',
  '-': '₋',
  '=': '₌',
  '(': '₍',
  ')': '₎',
  a: 'ₐ',
  e: 'ₑ',
  h: 'ₕ',
  i: 'ᵢ',
  j: 'ⱼ',
  k: 'ₖ',
  l: 'ₗ',
  m: 'ₘ',
  n: 'ₙ',
  o: 'ₒ',
  p: 'ₚ',
  r: 'ᵣ',
  s: 'ₛ',
  t: 'ₜ',
  u: 'ᵤ',
  v: 'ᵥ',
  x: 'ₓ',
};

const SUPERSCRIPT_CHAR_MAP: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '-': '⁻',
};

function toTextbookSubscript(rawSub: string): string {
  const clean = rawSub.replace(/^_+|_+$/g, '').replace(/_/g, ' ').trim();
  if (!clean) return '';

  const chars = clean.split('');
  const allHaveDirectUnicode = chars.every((ch) => SUBSCRIPT_CHAR_MAP[ch] !== undefined);
  if (allHaveDirectUnicode) {
    return chars.map((ch) => SUBSCRIPT_CHAR_MAP[ch]).join('');
  }
  return `₍${clean}₎`;
}

export function sanitizeScientificText(input: string): string {
  if (!input) return '';
  let text = input;

  text = text.replace(/```[a-zA-Z]*\n?([\s\S]*?)```/g, '$1');
  text = text.replace(/`([^`]+)`/g, '$1');

  text = text.replace(/\$\$([\s\S]*?)\$\$/g, '$1');
  text = text.replace(/\$([^$\n]+)\$/g, '$1');
  text = text.replace(/\\\$/g, '');

  for (let i = 0; i < 3; i++) {
    text = text.replace(
      /\\(?:d|t)?frac\{([^{}]+)\}\{([^{}]+)\}/g,
      (_m, num: string, den: string) => {
        const n = num.trim();
        const d = den.trim();
        const fmtN = /[+\-]/.test(n) ? `(${n})` : n;
        const fmtD = /[+\-·*×/]/.test(d) ? `(${d})` : d;
        return `${fmtN} / ${fmtD}`;
      },
    );
  }

  text = text.replace(/\\(?:text|mathrm|operatorname)\{([^{}]*)\}/g, '$1');
  text = text.replace(/\\(?:mathbf|textbf|boldsymbol)\{([^{}]*)\}/g, '**$1**');
  text = text.replace(/\\sqrt\{([^{}]+)\}/g, '√($1)');

  const latexReplacements: Array<[RegExp, string]> = [
    [/\\sin\b/g, 'sin'],
    [/\\cos\b/g, 'cos'],
    [/\\tan\b/g, 'tan'],
    [/\\cot\b/g, 'cot'],
    [/\\log\b/g, 'log'],
    [/\\ln\b/g, 'ln'],
    [/\\rho\b/g, 'ρ'],
    [/\\Delta\b/g, 'Δ'],
    [/\\delta\b/g, 'δ'],
    [/\\Phi\b/g, 'Φ'],
    [/\\phi\b/g, 'φ'],
    [/\\lambda\b/g, 'λ'],
    [/\\Omega\b/g, 'Ω'],
    [/\\omega\b/g, 'ω'],
    [/\\alpha\b/g, 'α'],
    [/\\beta\b/g, 'β'],
    [/\\gamma\b/g, 'γ'],
    [/\\pi\b/g, 'π'],
    [/\\mu\b/g, 'μ'],
    [/\\cdot\b/g, '·'],
    [/\\times\b/g, '×'],
    [/\\div\b/g, '÷'],
    [/\\pm\b/g, '±'],
    [/\\approx\b/g, '≈'],
    [/\\neq\b/g, '≠'],
    [/\\leq\b/g, '≤'],
    [/\\geq\b/g, '≥'],
    [/\\rightarrow\b|\\to\b/g, '→'],
    [/\\leftarrow\b/g, '←'],
    [/\\leftrightarrow\b|\\rightleftharpoons\b/g, '⇄'],
    [/\\Rightarrow\b/g, '⇒'],
    [/\\infty\b/g, '∞'],
    [/\^\\circ/g, '°'],
    [/\\circ/g, '°'],
    [/\\%/g, '%'],
    [/\\left\(/g, '('],
    [/\\right\)/g, ')'],
    [/\\left\[/g, '['],
    [/\\right\]/g, ']'],
    [/\\left\|/g, '|'],
    [/\\right\|/g, '|'],
  ];

  for (const [pattern, replacement] of latexReplacements) {
    text = text.replace(pattern, replacement);
  }

  text = text.replace(/\_\{([^{}]+)\}/g, (_m, sub: string) =>
    toTextbookSubscript(sub),
  );
  text = text.replace(/\_\(([^()]+)\)/g, (_m, sub: string) =>
    toTextbookSubscript(sub),
  );
  text = text.replace(
    /([a-zA-ZΔρΦλ])\s*\_([a-zA-Z0-9À-ỹ]+(?:\_[a-zA-Z0-9À-ỹ]+)*)/g,
    (_m, base: string, sub: string) => `${base}${toTextbookSubscript(sub)}`,
  );

  text = text.replace(/\^\{([^{}]+)\}/g, (_m, sup: string) => {
    const cleanSup = sup.trim();
    if (/^[0-9+\-]+$/.test(cleanSup)) {
      return cleanSup
        .split('')
        .map((ch) => SUPERSCRIPT_CHAR_MAP[ch] ?? ch)
        .join('');
    }
    return `^(${cleanSup})`;
  });

  text = text.replace(/\^([0-9])\b/g, (_m, digit: string) => {
    return SUPERSCRIPT_CHAR_MAP[digit] ?? `^${digit}`;
  });

  text = text.replace(/\\[a-zA-Z]+/g, '');
  text = text.replace(/\{([^{}]*)\}/g, '$1');
  text = text.replace(/\$/g, '');

  return text;
}

/**
 * NGÂN HÀNG KIẾN THỨC TRÍCH XUẤT CHÍNH XÁC 100% TỪ FILE TÀI LIỆU:
 * "TỔNG HỢP KIẾN THỨC KHOA HỌC TỰ NHIÊN (LỚP 6, 7, 8)"
 * Tuyệt đối không chứa bất kỳ thông tin nào ngoài phạm vi tài liệu đính kèm.
 */
export const KHTN_DEEP_QA_BANK: KnowledgeQaEntry[] = [
  // =========================================================================
  // PHẦN I. MỞ ĐẦU VỀ KHOA HỌC TỰ NHIÊN VÀ ĐO LƯỜNG
  // =========================================================================
  {
    id: 'p1-1-khai-quat-khtn',
    topic: 'Khái quát về Khoa học tự nhiên, Vật sống – Vật không sống và Phương pháp tìm hiểu KHTN',
    gradeInfo: 'Phần I · Mục 1 · KHTN 6, 7, 8',
    keywords: [
      'khoa học tự nhiên',
      'khtn là gì',
      'vật sống',
      'vật không sống',
      'lĩnh vực chính',
      'phương pháp tìm hiểu',
      '5 bước tìm hiểu',
      'kĩ năng tiến trình',
      'kỹ năng tiến trình',
      'thiên văn học',
      'khoa học trái đất',
    ],
    coreAnswer:
      '• **Khái niệm**: **Khoa học tự nhiên (KHTN)** nghiên cứu các hiện tượng tự nhiên, tìm ra các **tính chất** và **quy luật** của chúng.\n' +
      '• **Vật sống và vật không sống**: **Vật sống** có khả năng **trao đổi chất**, **lớn lên** và **sinh sản** (Ví dụ: con người, cây cối). **Vật không sống** không có các đặc trưng này (Ví dụ: cái bàn, hòn đá).\n' +
      '• **Các lĩnh vực chính**: **Sinh học** (vật sống), **Hoá học** (chất và sự biến đổi), **Vật lí học** (chuyển động, lực, năng lượng), **Khoa học Trái Đất**, **Thiên văn học**.',
    mechanism:
      '• **Phương pháp tìm hiểu KHTN (5 bước)**: (1) **Đề xuất vấn đề** → (2) **Đưa ra dự đoán khoa học** → (3) **Lập kế hoạch kiểm tra** → (4) **Thực hiện kế hoạch** → (5) **Viết báo cáo, thảo luận**.\n' +
      '• **Kĩ năng tiến trình**: **Quan sát**, **phân loại**, **liên kết**, **đo lường** và **dự báo**.',
  },
  {
    id: 'p1-2-phep-do-luong-co-ban',
    topic: 'Các phép đo lường cơ bản (Chiều dài, Khối lượng, Thời gian, Nhiệt độ) và Quy trình đo',
    gradeInfo: 'Phần I · Mục 2 · KHTN 6, 7, 8',
    keywords: [
      'đo chiều dài',
      'đo khối lượng',
      'đo thời gian',
      'đo nhiệt độ',
      'thước thẳng',
      'thước cuộn',
      'thước dây',
      'thước kẹp',
      'cân rô-béc-van',
      'cân điện tử',
      'cổng quang điện',
      'nhiệt kế',
      'xen-xi-út',
      'celsius',
      'fa-ren-hai',
      'fahrenheit',
      'quy trình đo',
      'giới hạn đo',
      'ghđ',
      'độ chia nhỏ nhất',
      'đcnn',
    ],
    coreAnswer:
      '• **Đo chiều dài**: Đơn vị cơ bản là **mét (m)** (đơn vị khác: mm, cm, dm, km với **1 km = 1000 m**, **1 m = 1000 mm**). Dụng cụ: **Thước thẳng**, **thước cuộn**, **thước dây**, **thước kẹp**.\n' +
      '• **Đo khối lượng**: **Khối lượng** là số đo lượng chất của vật. Đơn vị cơ bản là **kilôgam (kg)** (đơn vị khác: mg, g, lạng, tạ, tấn với **1 tấn = 1000 kg**). Dụng cụ: **Cân** (Rô-béc-van, đồng hồ, điện tử, cân y tế).\n' +
      '• **Đo thời gian**: Đơn vị cơ bản là **giây (s)** (đơn vị khác: phút (min), giờ (h), ngày, tháng, năm). Dụng cụ: **Đồng hồ** (bấm giây, điện tử, quả lắc); trong phòng thí nghiệm dùng **cổng quang điện** và **đồng hồ đo thời gian hiện số**.\n' +
      '• **Đo nhiệt độ**: **Nhiệt độ** là số đo mức độ nóng, lạnh của một vật. Đơn vị: **Độ C (°C)** (Celsius, nước đóng băng ở **0°C**, sôi ở **100°C**) hoặc **độ F (°F)** (Fahrenheit). Dụng cụ: **Nhiệt kế** (dựa trên sự nở vì nhiệt của chất lỏng), **nhiệt kế hồng ngoại**, **nhiệt kế điện tử**.',
    formula: 'Công thức quy đổi nhiệt độ: t(°F) = (t(°C) × 1,8) + 32',
    practicalTip:
      '**Quy trình đo (5 bước chung)**: (1) **Ước lượng** đại lượng cần đo → (2) Chọn dụng cụ đo có **Giới hạn đo (GHĐ)** và **Độ chia nhỏ nhất (ĐCNN)** phù hợp → (3) **Đặt/hiệu chỉnh** dụng cụ đúng cách → (4) **Đặt mắt nhìn** đúng quy cách → (5) **Đọc và ghi kết quả**.',
  },
  {
    id: 'p1-3-thiet-bi-an-toan-phong-thuc-hanh',
    topic: 'Thiết bị và An toàn phòng thực hành',
    gradeInfo: 'Phần I · Mục 3 · KHTN 6, 7, 8',
    keywords: [
      'an toàn phòng thực hành',
      'an toàn phòng thí nghiệm',
      'quy tắc an toàn',
      'kí hiệu cảnh báo',
      'ký hiệu cảnh báo',
      'joulemeter',
      'thiết bị đo ph',
      'thiết bị đo điện',
      'lấy hoá chất',
      'lấy hóa chất',
      'ống hút nhỏ giọt',
      'đồ bảo hộ',
    ],
    coreAnswer:
      '• **Thiết bị đo điện & đo pH**: **Ampe kế** (đo cường độ dòng điện), **Vôn kế** (đo hiệu điện thế), **Joulemeter** (đo năng lượng điện, công suất) và **thiết bị đo pH**.\n' +
      '• **Quy tắc an toàn**: Không ăn uống, đùa nghịch; phải mặc **đồ bảo hộ** (kính, găng tay); đọc kĩ nhãn hoá chất; tuân thủ quy tắc lấy hoá chất (dùng **panh/thìa** cho chất rắn, **ống hút nhỏ giọt** cho chất lỏng).\n' +
      '• **Kí hiệu cảnh báo**: **Chất độc**, **chất dễ cháy**, **nguồn điện nguy hiểm**, **chất ăn mòn**, **cảnh báo nguy hiểm sinh học**.',
  },

  // =========================================================================
  // PHẦN II. CHẤT VÀ SỰ BIẾN ĐỔI CỦA CHẤT (HOÁ HỌC)
  // =========================================================================
  {
    id: 'p2-1-chat-quanh-ta-chuyen-the',
    topic: 'Chất quanh ta, Ba thể của chất và Sự chuyển thể',
    gradeInfo: 'Phần II · Mục 1 · Hoá học 6, 7, 8',
    keywords: [
      'chất quanh ta',
      'tính chất vật lí',
      'tính chất hoá học',
      'tính chất hóa học',
      'ba thể của chất',
      'thể rắn',
      'thể lỏng',
      'thể khí',
      'sự chuyển thể',
      'nóng chảy',
      'đông đặc',
      'hoá hơi',
      'hóa hơi',
      'bay hơi',
      'ngưng tụ',
      'sự sôi',
    ],
    coreAnswer:
      '• **Đa dạng của chất**: Chất tạo nên **vật thể**. Mỗi chất đều có **tính chất vật lí** (thể, màu, mùi, vị, nhiệt độ nóng chảy/sôi, tính dẫn điện/nhiệt) và **tính chất hoá học** (sự biến đổi tạo ra chất mới).\n' +
      '• **Ba thể của chất**:\n' +
      '  - **Thể rắn**: Hình dạng cố định, rất khó nén, các hạt dao động quanh vị trí cố định.\n' +
      '  - **Thể lỏng**: Hình dạng của vật chứa, khó nén, có thể chảy, các hạt trượt lên nhau.\n' +
      '  - **Thể khí**: Hình dạng vật chứa, dễ bị nén, lan toả theo mọi hướng, các hạt di chuyển tự do.\n' +
      '• **Sự chuyển thể**: **Nóng chảy** (Rắn → Lỏng), **Đông đặc** (Lỏng → Rắn), **Hoá hơi/Sôi/Bay hơi** (Lỏng → Khí), **Ngưng tụ** (Khí → Lỏng).',
  },
  {
    id: 'p2-2-oxygen-khong-khi',
    topic: 'Oxygen và Không khí',
    gradeInfo: 'Phần II · Mục 2 · Hoá học 6, 7, 8',
    keywords: [
      'oxygen',
      'khí oxi',
      'không khí',
      'thành phần không khí',
      'nitrogen',
      'ô nhiễm không khí',
      'mưa acid',
      'hiệu ứng nhà kính',
      'sự cháy',
      '-183',
    ],
    coreAnswer:
      '• **Oxygen (O₂)**: Là chất khí **không màu**, **không mùi**, **ít tan trong nước**, hoá lỏng ở **-183°C** (màu xanh nhạt). Cần thiết cho **hô hấp** và **sự cháy**.\n' +
      '• **Không khí**: Là hỗn hợp khí có thành phần thể tích gồm **78% Nitrogen**, **21% Oxygen**, **1% Carbon dioxide**, hơi nước và các khí khác.\n' +
      '• **Ô nhiễm không khí**: Xảy ra do núi lửa, cháy rừng, rác thải, khí thải công nghiệp/giao thông; gây **hiệu ứng nhà kính**, **mưa acid** và các **bệnh hô hấp**.',
  },
  {
    id: 'p2-3-vat-lieu-nguyen-lieu-nhien-lieu-thuc-pham',
    topic: 'Vật liệu, Nguyên liệu, Nhiên liệu, Lương thực - Thực phẩm',
    gradeInfo: 'Phần II · Mục 3 · Hoá học 6, 7, 8',
    keywords: [
      'vật liệu',
      'nguyên liệu',
      'nhiên liệu',
      'lương thực',
      'thực phẩm',
      'nguyên tắc 3r',
      'reduce',
      'reuse',
      'recycle',
      'quặng',
      'bauxite',
      'carbohydrate',
      'protein',
      'lipid',
      'vitamin',
    ],
    coreAnswer:
      '• **Vật liệu**: **Kim loại** (dẫn điện/nhiệt tốt, có ánh kim), **Thuỷ tinh** (trong suốt, giòn, cách điện), **Nhựa** (dẻo, nhẹ, cách điện), **Cao su** (đàn hồi, cách điện). Sử dụng theo **Nguyên tắc 3R** (**Reduce** - Giảm thiểu, **Reuse** - Tái sử dụng, **Recycle** - Tái chế).\n' +
      '• **Nguyên liệu**: Đất, đá, quặng (**quặng sắt** làm gang/thép, **quặng bauxite** làm nhôm), dầu mỏ — là tài nguyên hữu hạn.\n' +
      '• **Nhiên liệu**: Các chất cháy toả nhiệt (than, gỗ, xăng, khí gas), gồm thể rắn, lỏng, khí.\n' +
      '• **Lương thực - Thực phẩm**: Chứa các nhóm dinh dưỡng chính gồm **Carbohydrate** (cung cấp năng lượng), **Protein** (chất đạm cấu tạo cơ thể), **Lipid** (chất béo dự trữ năng lượng), **Chất khoáng** và **Vitamin**.',
  },
  {
    id: 'p2-4-hon-hop-tach-chat',
    topic: 'Chất tinh khiết, Hỗn hợp (Dung dịch, Huyền phù, Nhũ tương) và Phương pháp tách chất',
    gradeInfo: 'Phần II · Mục 4 · Hoá học 6, 7, 8',
    keywords: [
      'chất tinh khiết',
      'hỗn hợp',
      'dung dịch',
      'dung môi',
      'chất tan',
      'huyền phù',
      'nhũ tương',
      'tách chất',
      'lắng',
      'gạn',
      'lọc',
      'cô cạn',
      'chiết',
    ],
    coreAnswer:
      '• **Chất tinh khiết**: Chỉ có một chất duy nhất, có tính chất xác định (Ví dụ: **nước cất**).\n' +
      '• **Hỗn hợp**: Gồm hai chất trở lên:\n' +
      '  - **Dung dịch**: Hỗn hợp **đồng nhất** giữa dung môi và chất tan.\n' +
      '  - **Huyền phù**: Hỗn hợp **rắn - lỏng không đồng nhất** (hạt rắn lơ lửng trong chất lỏng).\n' +
      '  - **Nhũ tương**: Hỗn hợp **lỏng - lỏng không đồng nhất**.\n' +
      '• **Phương pháp tách chất**: **Lắng/gạn** (chất rắn nặng chìm xuống), **Lọc** (tách chất rắn lơ lửng/không tan khỏi chất lỏng), **Cô cạn** (tách chất rắn tan ra khỏi dung môi bằng đun nóng), **Chiết** (tách hai chất lỏng không hoà tan vào nhau).',
  },
  {
    id: 'p2-5-nguyen-tu-bang-tuan-hoan',
    topic: 'Cấu tạo Nguyên tử, Nguyên tố hoá học và Bảng tuần hoàn',
    gradeInfo: 'Phần II · Mục 5 · Hoá học 7',
    keywords: [
      'nguyên tử',
      'rutherford',
      'bohr',
      'hạt nhân',
      'proton',
      'neutron',
      'electron',
      'amu',
      'nguyên tố hoá học',
      'nguyên tố hóa học',
      'bảng tuần hoàn',
      'ô nguyên tố',
      'chu kì',
      'chu kỳ',
      'nhóm',
      'khí hiếm',
      'phi kim',
    ],
    coreAnswer:
      '• **Cấu tạo Nguyên tử (Mô hình Rutherford - Bohr)**: Vô cùng nhỏ bé, rỗng, **trung hoà về điện**:\n' +
      '  - **Hạt nhân**: Nằm ở tâm, mang điện tích dương, gồm **Proton (p, +1)** và **Neutron (n, không mang điện)**.\n' +
      '  - **Vỏ**: Gồm các **Electron (e, -1)** chuyển động quanh hạt nhân xếp thành từng lớp (lớp 1 tối đa **2e**, lớp 2 tối đa **8e**). Luôn có **Số p = Số e**.\n' +
      '  - **Khối lượng**: Tập trung ở hạt nhân, đơn vị là **amu** (**1 p ≈ 1 n ≈ 1 amu**).\n' +
      '• **Nguyên tố hoá học**: Tập hợp các nguyên tử có **cùng số proton**. Kí hiệu hoá học gồm 1 hoặc 2 chữ cái (IUPAC).\n' +
      '• **Bảng tuần hoàn**: Sắp xếp theo chiều tăng dần **điện tích hạt nhân** (số proton / số hiệu nguyên tử):\n' +
      '  - **Ô nguyên tố**: Chứa kí hiệu, tên, số hiệu nguyên tử, khối lượng nguyên tử.\n' +
      '  - **Chu kì** (hàng ngang): Cùng số lớp electron (**Số thứ tự chu kì = số lớp e**).\n' +
      '  - **Nhóm** (cột dọc): Có tính chất gần giống nhau (**Số thứ tự nhóm A = số e lớp ngoài cùng**).\n' +
      '  - **Phân loại**: **Kim loại** (nhóm IA, IIA, IIIA...), **Phi kim** (nhóm VA, VIA, VIIA), **Khí hiếm** (nhóm VIIIA).',
  },
  {
    id: 'p2-6-phan-tu-lien-ket-hoa-tri',
    topic: 'Đơn chất, Hợp chất, Phân tử, Liên kết hoá học và Quy tắc hoá trị',
    gradeInfo: 'Phần II · Mục 6 · Hoá học 7',
    keywords: [
      'đơn chất',
      'hợp chất',
      'phân tử',
      'liên kết hoá học',
      'liên kết hóa học',
      'liên kết ion',
      'liên kết cộng hoá trị',
      'liên kết cộng hóa trị',
      'hoá trị',
      'hóa trị',
      'quy tắc hoá trị',
      'quy tắc hóa trị',
    ],
    coreAnswer:
      '• **Đơn chất và Hợp chất**: **Đơn chất** tạo nên từ 1 nguyên tố hoá học (VD: O₂, Cu). **Hợp chất** tạo nên từ 2 hay nhiều nguyên tố hoá học (VD: H₂O, CO₂).\n' +
      '• **Phân tử**: Hạt đại diện cho chất, gồm các nguyên tử liên kết với nhau. Khối lượng phân tử (amu) bằng tổng khối lượng các nguyên tử thành phần.\n' +
      '• **Liên kết hoá học**: Xu hướng đạt cấu hình electron bền vững của **khí hiếm** (**8e** lớp ngoài cùng, hoặc **2e** với He):\n' +
      '  - **Liên kết ion**: Lực hút tĩnh điện giữa các ion mang điện trái dấu (Kim loại nhường e tạo **ion dương**, phi kim nhận e tạo **ion âm**). Hợp chất ion thường ở thể rắn, khó nóng chảy, dẫn điện khi tan trong nước.\n' +
      '  - **Liên kết cộng hoá trị**: Hình thành do **dùng chung** một hoặc nhiều cặp electron (thường gặp ở các phi kim, nhiệt độ nóng chảy và sôi thấp).\n' +
      '• **Hoá trị**: Biểu thị khả năng liên kết của nguyên tử (Quy ước: **H luôn có hoá trị I**, **O có hoá trị II**).',
    formula: 'Quy tắc hoá trị (trong hợp chất AₓBᵧ): x · a = y · b (với a, b là hoá trị của A, B)',
  },
  {
    id: 'p2-7-phan-ung-tinh-toan-hoa-hoc',
    topic: 'Phản ứng hoá học, Mol, Tỉ khối, Nồng độ dung dịch, Bảo toàn khối lượng và Tốc độ phản ứng',
    gradeInfo: 'Phần II · Mục 7 · Hoá học 8',
    keywords: [
      'phản ứng hoá học',
      'phản ứng hóa học',
      'phản ứng toả nhiệt',
      'phản ứng tỏa nhiệt',
      'phản ứng thu nhiệt',
      'mol',
      'khối lượng mol',
      'thể tích mol',
      '24,79',
      '24.79',
      'tỉ khối',
      'độ tan',
      'nồng độ phần trăm',
      'nồng độ mol',
      'bảo toàn khối lượng',
      'tốc độ phản ứng',
      'chất xúc tác',
    ],
    coreAnswer:
      '• **Phản ứng hoá học**: Quá trình biến đổi từ chất này thành chất khác (**Chất phản ứng → Sản phẩm**). Diễn biến: phá vỡ liên kết cũ, hình thành liên kết mới, **số lượng nguyên tử mỗi nguyên tố được bảo toàn**.\n' +
      '• **Năng lượng trong phản ứng**: **Phản ứng toả nhiệt** giải phóng năng lượng ra môi trường (đốt cháy nhiên liệu); **Phản ứng thu nhiệt** nhận năng lượng từ môi trường (nung đá vôi).\n' +
      '• **Mol, Thể tích khí & Tỉ khối**: **1 mol** chứa **N₍A₎ ≈ 6,022 × 10²³** hạt vi mô. Ở đkc (**25°C, 1 bar**), 1 mol khí chiếm **24,79 Lít**.\n' +
      '• **Định luật bảo toàn khối lượng**: Tổng khối lượng các chất sản phẩm bằng tổng khối lượng các chất tham gia.\n' +
      '• **Tốc độ phản ứng**: Đặc trưng cho sự nhanh/chậm của phản ứng. Tăng khi tăng **nhiệt độ**, **nồng độ**, **diện tích tiếp xúc**, hoặc dùng **chất xúc tác**.',
    formula:
      'n = m / M  |  V = n × 24,79  |  d₍A/B₎ = M₍A₎ / M₍B₎ (d₍A/kk₎ = M₍A₎ / 29)  |  S = (m₍ct₎ / m₍dm₎) × 100  |  C% = (m₍ct₎ / m₍dd₎) × 100%  |  C₍M₎ = n / V',
  },
  {
    id: 'p2-8-hop-chat-vo-co',
    topic: 'Các hợp chất vô cơ thông dụng: Acid, Base, Thang pH, Oxide, Muối và Phân bón hoá học',
    gradeInfo: 'Phần II · Mục 8 · Hoá học 8',
    keywords: [
      'acid',
      'axit',
      'base',
      'bazơ',
      'kiềm',
      'thang ph',
      'quỳ tím',
      'phenolphthalein',
      'oxide',
      'oxit',
      'muối',
      'phản ứng trung hoà',
      'phản ứng trung hòa',
      'phân bón hoá học',
      'phân bón hóa học',
    ],
    coreAnswer:
      '• **Acid**: Hợp chất có nguyên tử **hydrogen** liên kết với **gốc acid**, phân li ra **H⁺**. Làm **quỳ tím hoá đỏ**, tác dụng với kim loại sinh ra khí **H₂** (VD: HCl, H₂SO₄, CH₃COOH).\n' +
      '• **Base**: Hợp chất có nguyên tử **kim loại** liên kết với nhóm **hydroxide (OH)**, phân li ra **OH⁻**. Làm **quỳ tím hoá xanh**, **phenolphthalein hoá hồng**. Base tan gọi là **kiềm** (NaOH, KOH, Ba(OH)₂).\n' +
      '• **Thang pH**: Đo độ acid/base: **pH < 7** là môi trường **Acid**; **pH = 7** là **Trung tính**; **pH > 7** là **Base (Kiềm)**.\n' +
      '• **Oxide**: Hợp chất của 2 nguyên tố (trong đó có 1 nguyên tố là **oxygen**), gồm 4 loại: **Oxide acid** (tác dụng kiềm → muối + nước), **Oxide base** (tác dụng acid → muối + nước), **Oxide lưỡng tính** (tác dụng cả acid và base), **Oxide trung tính**.\n' +
      '• **Muối**: Gồm cation kim loại (hoặc **NH₄⁺**) liên kết với anion gốc acid. **Phản ứng trung hoà**: **Acid + Base → Muối + Nước**.\n' +
      '• **Phân bón hoá học**: Cung cấp dinh dưỡng cho cây, gồm phân bón **đa lượng (N, P, K)**, **trung lượng** và **vi lượng**.',
  },

  // =========================================================================
  // PHẦN III. NĂNG LƯỢNG VÀ SỰ BIẾN ĐỔI (VẬT LÍ)
  // =========================================================================
  {
    id: 'p3-1-khoi-luong-rieng-ap-suat-archimedes',
    topic: 'Khối lượng riêng, Áp lực, Áp suất và Lực đẩy Archimedes',
    gradeInfo: 'Phần III · Mục 1 · Vật lí 8',
    keywords: [
      'khối lượng riêng',
      'áp lực',
      'áp suất',
      'pascal',
      'máy nén thuỷ lực',
      'máy nén thủy lực',
      'áp suất chất lỏng',
      'áp suất khí quyển',
      'archimedes',
      'ác-si-mét',
      'acsimet',
      'lực đẩy archimedes',
      'nổi',
      'chìm',
    ],
    coreAnswer:
      '• **Khối lượng riêng**: Khối lượng của một đơn vị thể tích chất. Công thức: **D = m / V** (Đơn vị: **kg/m³** hoặc **g/cm³**).\n' +
      '• **Áp lực và Áp suất**: **Áp lực** là lực ép có phương vuông góc với mặt bị ép. **Áp suất** là độ lớn của áp lực trên một đơn vị diện tích bị ép (**p = F / S**; đơn vị: **Pascal (Pa)** hoặc **N/m²**, với **1 Pa = 1 N/m²**; các đơn vị khác: atm, mmHg, bar).\n' +
      '• **Áp suất chất lỏng & Áp suất khí quyển**: Áp suất chất lỏng truyền đi nguyên vẹn theo mọi hướng (ứng dụng: **Máy nén thuỷ lực**). **Áp suất khí quyển** là áp suất do lớp không khí bao quanh Trái Đất tác dụng lên mọi vật.\n' +
      '• **Lực đẩy Archimedes**: Lực đẩy do chất lỏng tác dụng lên vật đặt trong nó, hướng thẳng đứng từ dưới lên (**F₍A₎ = d · V**, với d là trọng lượng riêng chất lỏng, V là thể tích phần chất lỏng bị chiếm chỗ). Vật **chìm** khi **F₍A₎ < P** (trọng lượng), **nổi** khi **F₍A₎ > P**.',
    formula: 'D = m / V   |   p = F / S (1 Pa = 1 N/m²)   |   F₍A₎ = d · V',
  },
  {
    id: 'p3-2-tac-dung-lam-quay-moment-don-bay',
    topic: 'Tác dụng làm quay của lực: Moment lực và Đòn bẩy',
    gradeInfo: 'Phần III · Mục 2 · Vật lí 8',
    keywords: [
      'moment lực',
      'mômen lực',
      'tác dụng làm quay',
      'cánh tay đòn',
      'đòn bẩy',
      'điểm tựa',
      'đòn bẩy loại 1',
      'đòn bẩy loại 2',
      'đòn bẩy loại 3',
      'xe cút kít',
    ],
    coreAnswer:
      '• **Moment lực**: Đại lượng đặc trưng cho **tác dụng làm quay** của lực quanh một điểm hoặc một trục. Phụ thuộc vào **độ lớn của lực** và khoảng cách từ giá của lực tới trục quay (**cánh tay đòn**).\n' +
      '• **Đòn bẩy**: Thiết bị giúp thay đổi hướng tác dụng của lực, có trục quay cố định (**điểm tựa O**), gồm 3 loại:\n' +
      '  - **Đòn bẩy loại 1**: Điểm tựa nằm giữa 2 lực (Ví dụ: **Cái kéo**).\n' +
      '  - **Đòn bẩy loại 2**: Điểm tựa nằm ngoài, lực cản/vật ở giữa, cho **lợi về lực** (Ví dụ: **Xe cút kít**).\n' +
      '  - **Đòn bẩy loại 3**: Lực tác dụng ở giữa, **không lợi về lực** (Ví dụ: **Cầm đũa**, **câu cá**).',
  },
  {
    id: 'p3-3-dien-hoc',
    topic: 'Điện học: Sự nhiễm điện, Dòng điện, Nguồn điện, Tác dụng của dòng điện và Đại lượng điện',
    gradeInfo: 'Phần III · Mục 3 · Vật lí 8',
    keywords: [
      'sự nhiễm điện',
      'nhiễm điện',
      'dòng điện',
      'nguồn điện',
      'vật dẫn điện',
      'vật cách điện',
      'tác dụng của dòng điện',
      'mạ điện',
      'cường độ dòng điện',
      'ampe kế',
      'hiệu điện thế',
      'vôn kế',
      'cầu chì',
      'rơle',
      'aptomat',
    ],
    coreAnswer:
      '• **Sự nhiễm điện**: Cọ xát làm vật nhiễm điện (**mất e → nhiễm điện dương**, **nhận e → nhiễm điện âm**). Vật nhiễm điện **cùng dấu đẩy nhau**, **trái dấu hút nhau**.\n' +
      '• **Dòng điện & Nguồn điện**: **Dòng điện** là dòng chuyển dời có hướng của các hạt mang điện. **Nguồn điện** cung cấp năng lượng điện (Pin, acquy). Chiều dòng điện một chiều quy ước đi **từ cực dương qua dây nối tới cực âm**.\n' +
      '• **Vật dẫn và Vật cách điện**: **Vật dẫn** cho dòng điện chạy qua (kim loại); **Vật cách điện** không cho dòng điện chạy qua (nhựa, cao su).\n' +
      '• **Tác dụng của dòng điện**: **Tác dụng nhiệt** (bàn là), **Tác dụng phát sáng** (bóng đèn LED, huỳnh quang), **Tác dụng hoá học** (mạ điện), **Tác dụng sinh lí** (gây co giật, dùng trong máy sốc tim).\n' +
      '• **Đại lượng điện & Thiết bị an toàn**:\n' +
      '  - **Cường độ dòng điện (I)**: Đo mức độ mạnh yếu của dòng điện bằng **Ampe kế** (mắc **nối tiếp**), đơn vị **Ampe (A), mA**.\n' +
      '  - **Hiệu điện thế (U)**: Đo khả năng sinh ra dòng điện của nguồn bằng **Vôn kế** (mắc **song song**), đơn vị **Vôn (V)**.\n' +
      '  - **Thiết bị an toàn mạch điện**: **Cầu chì**, **Rơle**, **Cầu dao tự động (Aptomat)**.',
  },
  {
    id: 'p3-4-toc-do-chuyen-dong',
    topic: 'Tốc độ chuyển động, Đồ thị quãng đường - thời gian và An toàn giao thông',
    gradeInfo: 'Phần III · Mục 4 · Vật lí 7',
    keywords: [
      'tốc độ',
      'chuyển động',
      'quãng đường',
      'đồ thị quãng đường',
      'an toàn giao thông',
      'quy tắc 3 giây',
      '3,6 km/h',
    ],
    coreAnswer:
      '• **Tốc độ**: Đặc trưng cho sự **nhanh hay chậm** của chuyển động. Đơn vị thường dùng là **m/s** hoặc **km/h** (**1 m/s = 3,6 km/h**).\n' +
      '• **Đồ thị quãng đường - thời gian**: Trục hoành biểu diễn **thời gian (t)**, trục tung biểu diễn **quãng đường (s)**. Đường thẳng **xiên góc** biểu diễn **chuyển động đều**, đường thẳng **nằm ngang** (song song trục t) biểu diễn **vật đứng yên**.\n' +
      '• **Ý nghĩa an toàn giao thông**: Giữ khoảng cách an toàn, tuân thủ tốc độ giới hạn (tuỳ loại đường và thời tiết) và tuân theo **quy tắc "3 giây"**.',
    formula: 'v = s / t   (1 m/s = 3,6 km/h)',
  },
  {
    id: 'p3-5-am-thanh',
    topic: 'Âm thanh: Sóng âm, Tần số (Độ cao), Biên độ (Độ to), Phản xạ âm và Chống tiếng ồn',
    gradeInfo: 'Phần III · Mục 5 · Vật lí 7',
    keywords: [
      'âm thanh',
      'sóng âm',
      'chân không',
      'tần số',
      'độ cao',
      'biên độ',
      'độ to',
      'phản xạ âm',
      'tiếng vang',
      '1/15 giây',
      'tiếng ồn',
    ],
    coreAnswer:
      '• **Sóng âm**: Là dao động lan truyền trong môi trường (**rắn, lỏng, khí**), **KHÔNG truyền được trong chân không**.\n' +
      '• **Đặc trưng của âm**:\n' +
      '  - **Tần số (Hz)**: Số dao động trong 1 giây, quyết định **độ cao** của âm (tần số lớn → **âm bổng/cao**, tần số nhỏ → **âm trầm/thấp**). Tai người nghe được âm từ **20 Hz đến 20.000 Hz**.\n' +
      '  - **Biên độ**: Độ lệch lớn nhất khỏi vị trí cân bằng, quyết định **độ to** của âm.\n' +
      '• **Phản xạ âm & Tiếng vang**: Âm dội lại khi gặp mặt chắn (mặt nhẵn, cứng phản xạ âm tốt; mặt sần sùi, xốp phản xạ âm kém). **Tiếng vang** xảy ra khi âm phản xạ đến tai chậm hơn âm trực tiếp tối thiểu **1/15 giây**.\n' +
      '• **Tiếng ồn**: Âm thanh to, kéo dài gây ảnh hưởng sức khoẻ. Cách chống: hạn chế nguồn ồn, trồng cây xanh phân tán, dùng vật liệu cách âm.',
  },
  {
    id: 'p3-6-anh-sang',
    topic: 'Ánh sáng: Tia sáng, Chùm sáng, Vùng tối, Phản xạ ánh sáng và Gương phẳng',
    gradeInfo: 'Phần III · Mục 6 · Vật lí 7',
    keywords: [
      'ánh sáng',
      'tia sáng',
      'chùm sáng',
      'vùng tối',
      'vùng nửa tối',
      'nhật thực',
      'phản xạ ánh sáng',
      'góc phản xạ',
      'góc tới',
      'phản xạ gương',
      'phản xạ khuếch tán',
      'gương phẳng',
    ],
    coreAnswer:
      '• **Bản chất, Tia sáng & Chùm sáng**: **Ánh sáng** là một dạng năng lượng. **Tia sáng** biểu diễn bằng đường thẳng có mũi tên. **Chùm sáng** gồm nhiều tia sáng (**song song**, **hội tụ**, **phân kì**).\n' +
      '• **Vùng tối**: Là vùng phía sau vật cản không nhận được ánh sáng. Nguồn sáng hẹp tạo ra **vùng tối** rõ rệt; nguồn sáng rộng tạo ra **vùng tối** và **vùng nửa tối** (ứng dụng giải thích hiện tượng **nhật thực**).\n' +
      '• **Phản xạ ánh sáng**:\n' +
      '  - **Định luật phản xạ ánh sáng**: Tia phản xạ nằm trong mặt phẳng tới; **góc phản xạ (i\') bằng góc tới (i)**.\n' +
      '  - **Phản xạ gương**: Xảy ra trên bề mặt nhẵn bóng, tia sáng truyền theo 1 hướng.\n' +
      '  - **Phản xạ khuếch tán**: Xảy ra trên bề mặt sần sùi, tia sáng hắt ra nhiều hướng.\n' +
      '• **Gương phẳng**: Tạo **ảnh ảo** (không hứng được trên màn), **độ lớn bằng vật**, khoảng cách từ vật tới gương bằng khoảng cách từ ảnh tới gương (**đối xứng**).',
  },
  {
    id: 'p3-7-tu-truong',
    topic: 'Từ trường: Nam châm, Đường sức từ, Từ trường Trái Đất và Nam châm điện',
    gradeInfo: 'Phần III · Mục 7 · Vật lí 7',
    keywords: [
      'từ trường',
      'nam châm',
      'từ tính',
      'cực bắc',
      'cực nam',
      'từ phổ',
      'đường sức từ',
      'ra bắc vào nam',
      'từ trường trái đất',
      'la bàn',
      'nam châm điện',
    ],
    coreAnswer:
      '• **Nam châm**: Hút được các vật có **từ tính** (**sắt, thép, niken, coban**). Luôn có 2 cực: **Cực Bắc (N)** và **Cực Nam (S)**; cùng từ cực thì **đẩy nhau**, khác từ cực thì **hút nhau**.\n' +
      '• **Từ trường, Từ phổ & Đường sức từ**: **Từ trường** là vùng không gian xung quanh nam châm hoặc dòng điện, tác dụng lực từ lên vật liệu từ. **Từ phổ** là hình ảnh mạt sắt sắp xếp quanh nam châm. **Đường sức từ** có chiều **đi ra từ cực Bắc, đi vào cực Nam ("Ra Bắc, Vào Nam")**.\n' +
      '• **Từ trường Trái Đất**: Trái Đất là một nam châm khổng lồ; **cực Bắc địa từ** nằm gần **cực Nam địa lí** và ngược lại (trục từ và trục địa lí không trùng nhau). Ứng dụng: **La bàn**.\n' +
      '• **Nam châm điện**: Gồm **cuộn dây dẫn** và **lõi sắt non**, hoạt động nhờ dòng điện, từ trường thay đổi khi dòng điện thay đổi (Ứng dụng: **Cần cẩu, chuông điện**).',
  },

  // =========================================================================
  // PHẦN IV. VẬT SỐNG (SINH HỌC)
  // =========================================================================
  {
    id: 'p4-1-te-bao',
    topic: 'Tế bào - Đơn vị cơ bản của sự sống',
    gradeInfo: 'Phần IV · Mục 1 · Sinh học 6',
    keywords: [
      'tế bào',
      'màng tế bào',
      'tế bào chất',
      'nhân tế bào',
      'vùng nhân',
      'tế bào nhân sơ',
      'tế bào nhân thực',
      'tế bào thực vật',
      'tế bào động vật',
      'thành tế bào',
      'lục lạp',
      'không bào',
      'sự lớn lên và sinh sản của tế bào',
    ],
    coreAnswer:
      '• **Định nghĩa & Kích thước**: **Tế bào** là đơn vị cấu trúc và chức năng cơ bản của mọi sinh vật sống, thực hiện đầy đủ các quá trình sống (sinh trưởng, hô hấp, sinh sản, bài tiết...). Đa số có kích thước siêu nhỏ (**micromet**), phải quan sát qua **kính hiển vi**.\n' +
      '• **Cấu tạo chung**:\n' +
      '  - **Màng tế bào**: Bao bọc, kiểm soát trao đổi chất.\n' +
      '  - **Tế bào chất**: Nơi diễn ra các hoạt động sống.\n' +
      '  - **Nhân hoặc Vùng nhân**: Chứa vật chất di truyền, là trung tâm điều khiển.\n' +
      '• **Phân loại tế bào**:\n' +
      '  - **Tế bào nhân sơ**: Chưa có màng nhân, không có hệ thống nội màng, ít bào quan (**Vi khuẩn**).\n' +
      '  - **Tế bào nhân thực**: Có màng nhân, hệ thống nội màng và nhiều bào quan có màng.\n' +
      '  - **Tế bào thực vật và Động vật**: Tế bào thực vật có thêm **thành tế bào** (bảo vệ, quy định hình dạng), **lục lạp** (quang hợp) và **không bào trung tâm lớn**.\n' +
      '• **Sự lớn lên và Sinh sản**: Tế bào hấp thụ dinh dưỡng để lớn lên rồi **phân chia (từ 1 thành 2)**, giúp cơ thể đa bào lớn lên và thay thế các tế bào chết/tổn thương.',
  },
  {
    id: 'p4-2-to-chuc-co-the-sinh-vat',
    topic: 'Tổ chức cơ thể sinh vật (Đơn bào, Đa bào và Các cấp tổ chức)',
    gradeInfo: 'Phần IV · Mục 2 · Sinh học 6',
    keywords: [
      'cơ thể đơn bào',
      'cơ thể đa bào',
      'đơn bào',
      'đa bào',
      'trùng roi',
      'trùng biến hình',
      'cấp tổ chức',
      'mô',
      'cơ quan',
      'hệ cơ quan',
    ],
    coreAnswer:
      '• **Cơ thể đơn bào**: Cơ thể chỉ gồm **1 tế bào** đảm nhiệm mọi chức năng sống (Ví dụ: **Vi khuẩn**, **trùng roi**, **trùng biến hình**).\n' +
      '• **Cơ thể đa bào**: Gồm nhiều tế bào chuyên hoá.\n' +
      '• **Các cấp tổ chức của cơ thể đa bào**: **Tế bào** → **Mô** (nhóm tế bào cùng hình dạng/chức năng) → **Cơ quan** (nhóm mô cùng thực hiện chức năng, VD: dạ dày, lá cây) → **Hệ cơ quan** (nhóm cơ quan, VD: Hệ tiêu hoá, Hệ rễ) → **Cơ thể**.',
  },
  {
    id: 'p4-3-phan-loai-the-gioi-song',
    topic: 'Phân loại thế giới sống, Hệ thống 5 giới và Khoá lưỡng phân',
    gradeInfo: 'Phần IV · Mục 3 · Sinh học 6',
    keywords: [
      'phân loại thế giới sống',
      'hệ thống phân loại',
      'danh pháp khoa học',
      'apis cerana',
      '5 giới',
      'năm giới',
      'giới khởi sinh',
      'giới nguyên sinh',
      'giới nấm',
      'giới thực vật',
      'giới động vật',
      'khoá lưỡng phân',
      'khóa lưỡng phân',
    ],
    coreAnswer:
      '• **Vai trò & Bậc phân loại**: Giúp dễ dàng tìm kiếm và nghiên cứu các loài trong tự nhiên. Thứ tự từ lớn đến nhỏ: **Giới → Ngành → Lớp → Bộ → Họ → Chi (Giống) → Loài**.\n' +
      '• **Danh pháp khoa học**: Sử dụng **tên kép** (**Tên chi** viết hoa + **Tên loài** viết thường, ví dụ: *Apis cerana* - Ong mật).\n' +
      '• **Hệ thống 5 giới sinh vật**:\n' +
      '  1. **Giới Khởi sinh** (Vi khuẩn): Nhân sơ, đơn bào.\n' +
      '  2. **Giới Nguyên sinh** (Tảo, Động vật nguyên sinh): Nhân thực, đa số đơn bào.\n' +
      '  3. **Giới Nấm**: Nhân thực, đơn/đa bào, dị dưỡng.\n' +
      '  4. **Giới Thực vật**: Nhân thực, đa bào, tự dưỡng quang hợp.\n' +
      '  5. **Giới Động vật**: Nhân thực, đa bào, dị dưỡng.\n' +
      '• **Khoá lưỡng phân**: Dùng để phân loại sinh vật dựa trên việc chia liên tục các tập hợp đối tượng thành **2 nhóm** mang đặc điểm đối lập nhau.',
  },
  {
    id: 'p4-4-vi-khuan-va-virus',
    topic: 'Vi khuẩn (Bacteria) và Virus',
    gradeInfo: 'Phần IV · Mục 4 · Sinh học 6',
    keywords: [
      'vi khuẩn',
      'bacteria',
      'trực khuẩn',
      'kháng sinh',
      'virus',
      'vi rút',
      'kí sinh nội bào',
      'ký sinh nội bào',
      'vaccine',
      'vắc xin',
      'covid-19',
      'sốt xuất huyết',
    ],
    coreAnswer:
      '• **Vi khuẩn (Bacteria)**:\n' +
      '  - **Đặc điểm & Cấu tạo**: Sinh vật **đơn bào, nhân sơ**; hình que (trực khuẩn), xoắn hoặc cầu. Gồm **vùng nhân**, **tế bào chất**, **màng tế bào**, **thành tế bào**, roi, lông.\n' +
      '  - **Vai trò & Tác hại**: Phân giải xác sinh vật, cố định đạm, ứng dụng lên men (sữa chua, muối dưa). Một số gây bệnh (Tả, lao phổi, uốn ván) và làm hỏng thực phẩm; dùng **kháng sinh** để điều trị.\n' +
      '• **Virus**:\n' +
      '  - **Đặc điểm & Cấu tạo**: Dạng sống siêu nhỏ (**chưa có cấu tạo tế bào**), kích thước nanomet, **kí sinh nội bào bắt buộc**. Gồm **lõi vật chất di truyền (DNA/RNA)** và **vỏ protein** (một số có vỏ ngoài/gai); hình khối, xoắn hoặc hỗn hợp.\n' +
      '  - **Tác hại & Phòng bệnh**: Gây các bệnh nguy hiểm (Sốt xuất huyết, Cúm, HIV, COVID-19). Phòng bệnh hiệu quả bằng **Vaccine**.',
  },
  {
    id: 'p4-5-trao-doi-chat-chuyen-hoa-nang-luong',
    topic: 'Trao đổi chất và Chuyển hoá năng lượng ở sinh vật',
    gradeInfo: 'Phần IV · Mục 5 · Sinh học 7',
    keywords: [
      'trao đổi chất',
      'chuyển hoá năng lượng',
      'chuyển hóa năng lượng',
      'quang hợp',
      'hô hấp',
      'quang năng',
      'hoá năng',
      'hóa năng',
    ],
    coreAnswer:
      '• **Trao đổi chất**: Là quá trình sinh vật lấy các chất từ môi trường, biến đổi thành chất cần thiết cho cơ thể, tạo năng lượng và thải chất thải ra ngoài.\n' +
      '• **Chuyển hoá năng lượng**: Là sự biến đổi từ dạng năng lượng này sang dạng năng lượng khác (Ví dụ: **Quang năng → Hoá năng** trong quang hợp; **Hoá năng → Cơ năng/Nhiệt năng** trong hô hấp).\n' +
      '• **Vai trò**: Đảm bảo sự sống, **sinh trưởng**, **phát triển**, **vận động**, **cảm ứng** và **sinh sản** của cơ thể.',
  },
];

/**
 * Danh sách các từ khoá nằm NGOÀI phạm vi tài liệu KHTN lớp 6, 7, 8 được cung cấp.
 * Khi học sinh hỏi các chủ đề này, hệ thống trả lời đúng câu xin lỗi quy định.
 */
const OUT_OF_DOCUMENT_PATTERNS: RegExp[] = [
  /khúc xạ ánh sáng|phản xạ toàn phần|thấu kính|kính lúp|tiêu cự|snell|cận thị|viễn thị|lăng kính|tán sắc/i,
  /cảm ứng điện từ|từ thông|faraday|lenz|máy biến áp|máy phát điện xoay chiều/i,
  /định luật ohm|điện trở|biến trở|công suất điện|định luật joule/i,
  /động năng|thế năng|cơ năng|công cơ học|công suất cơ học|dẫn nhiệt|đối lưu|bức xạ nhiệt/i,
  /nguyên phân|giảm phân|nhiễm sắc thể|mendel|di truyền|kiểu gene|kiểu hình|đột biến|chọn lọc tự nhiên|darwin|tiến hóa/i,
  /quần thể|quần xã|hệ sinh thái|chuỗi thức ăn|lưới thức ăn/i,
  /hydrocarbon|alkane|alkene|methane|ethylene|ethylic alcohol|rượu etylic|acetic acid|ester|tráng bạc|polymer|pe\b/i,
  /co nguyên sinh|ưu trương|nhược trương/i,
  /bóng đá|ca sĩ|diễn viên|tổng thống|thủ tướng|chứng khoán|bitcoin|tiền ảo|code python|lập trình|chiến tranh thế giới|văn học|lịch sử việt nam/i,
];

export function isQuestionExplicitlyOutOfScope(question: string): boolean {
  const q = question.trim();
  if (!q) return false;
  return OUT_OF_DOCUMENT_PATTERNS.some((pattern) => pattern.test(q));
}

function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function parseViNumber(raw: string): number {
  return parseFloat(raw.replace(',', '.'));
}

/**
 * BỘ GIẢI TOÁN TỰ ĐỘNG DỰA TRÊN CÁC CÔNG THỨC CÓ TRONG FILE TÀI LIỆU KHTN 6, 7, 8:
 * - Quy đổi nhiệt độ: t(°F) = (t(°C) × 1,8) + 32
 * - Số mol: n = m / M ; Thể tích khí đkc: V = n × 24,79 ; Tỉ khối: d₍A/B₎ = M₍A₎ / M₍B₎
 * - Độ tan: S = (m₍ct₎ / m₍dm₎) × 100 ; Nồng độ phần trăm: C% = (m₍ct₎ / m₍dd₎) × 100% ; Nồng độ mol: C₍M₎ = n / V
 * - Khối lượng riêng: D = m / V
 * - Áp suất: p = F / S
 * - Lực đẩy Archimedes: F₍A₎ = d · V
 * - Tốc độ: v = s / t (1 m/s = 3,6 km/h)
 */
function trySolveNumericalQuestion(question: string): {
  answer: string;
  topicTitle: string;
} | null {
  const q = question.toLowerCase();

  // 1. Bài toán quy đổi nhiệt độ °C sang °F theo công thức t(°F) = (t(°C) × 1,8) + 32
  if (/độ f|°f|fahrenheit/i.test(q) && /\d/.test(q)) {
    const cMatch = q.match(/(-?\d+(?:[.,]\d+)?)\s*(?:°c|độ c)\b/i);
    if (cMatch) {
      const tC = parseViNumber(cMatch[1]);
      const tF = tC * 1.8 + 32;
      return {
        topicTitle: 'Phần I · Mục 2: Đo nhiệt độ (KHTN 6, 7, 8)',
        answer:
          `• **Công thức trong tài liệu**: **t(°F) = (t(°C) × 1,8) + 32**.\n` +
          `• **Thay số tính toán**: Với **t(°C) = ${tC}°C**, ta có: **t(°F)** = (${tC} × 1,8) + 32 = **${tF.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}°F**.`,
      };
    }
  }

  // 2. Bài toán tính Khối lượng riêng (D = m / V) và xét nổi/chìm (F_A so với P)
  if (
    /khối lượng riêng|\bm\s*=|\bv\s*=/i.test(q) &&
    /\d/.test(q)
  ) {
    const mMatch = q.match(
      /(?:m\s*=\s*|khối lượng\s*(?:là\s*)?|nặng\s*)(\d+(?:[.,]\d+)?)\s*(kg|g)\b/i,
    );
    const vMatch = q.match(
      /(?:v\s*=\s*|thể tích\s*(?:là\s*)?)(\d+(?:[.,]\d+)?)\s*(m3|m³|cm3|cm³|ml|lít|l|dm3|dm³)\b/i,
    );

    if (mMatch && vMatch) {
      const mVal = parseViNumber(mMatch[1]);
      const mUnit = mMatch[2].toLowerCase();
      const vVal = parseViNumber(vMatch[1]);
      const vUnit = vMatch[2].toLowerCase();

      const mKg = mUnit === 'g' ? mVal / 1000 : mVal;
      const mGram = mUnit === 'kg' ? mVal * 1000 : mVal;

      let vM3 = vVal;
      if (vUnit === 'cm3' || vUnit === 'cm³' || vUnit === 'ml') {
        vM3 = vVal / 1_000_000;
      } else if (vUnit === 'lít' || vUnit === 'l' || vUnit === 'dm3' || vUnit === 'dm³') {
        vM3 = vVal / 1000;
      }
      const vCm3 = vM3 * 1_000_000;

      if (vM3 > 0) {
        const dKgM3 = mKg / vM3;
        const dGCm3 = mGram / vCm3;
        const dStr = dKgM3.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
        const dGStr = dGCm3.toLocaleString('vi-VN', { maximumFractionDigits: 2 });

        return {
          topicTitle: 'Phần III · Mục 1: Khối lượng riêng và Áp suất (KHTN 8)',
          answer:
            `• **Tóm tắt dữ kiện**: Khối lượng **m = ${mVal} ${mMatch[2]}** (${mKg} kg = ${mGram} g); Thể tích **V = ${vVal} ${vMatch[2]}** (${vM3} m³ = ${vCm3} cm³).\n` +
            `• **Áp dụng công thức Khối lượng riêng**: **D = m / V** = ${mKg} / ${vM3} = **${dStr} kg/m³** (tương đương **${dGStr} g/cm³**).\n` +
            `• **Điều kiện nổi/chìm (theo Lực đẩy Archimedes)**: Vật **chìm** khi **F₍A₎ < P** (trọng lượng) và vật **nổi** khi **F₍A₎ > P**.`,
        };
      }
    }
  }

  // 3. Bài toán tính Nồng độ phần trăm C% = (m_ct / m_dd) × 100%
  if (/nồng độ phần trăm|c%|hòa tan|hoà tan/i.test(q) && /\d/.test(q)) {
    const ctMatch = q.match(
      /(?:hòa tan\s*|hoà tan\s*|m_?ct\s*=\s*)(\d+(?:[.,]\d+)?)\s*g(?:am)?\b/i,
    );
    const waterMatch = q.match(
      /(?:vào\s*|trong\s*)(\d+(?:[.,]\d+)?)\s*g(?:am)?\s*(?:nước|h2o|dung môi)/i,
    );
    const ddMatch = q.match(
      /(\d+(?:[.,]\d+)?)\s*g(?:am)?\s*dung dịch/i,
    );

    if (ctMatch && (waterMatch || ddMatch)) {
      const mCt = parseViNumber(ctMatch[1]);
      const mDd = ddMatch
        ? parseViNumber(ddMatch[1])
        : mCt + parseViNumber(waterMatch![1]);
      if (mDd > 0) {
        const cPercent = (mCt / mDd) * 100;
        const cStr = cPercent.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
        return {
          topicTitle: 'Phần II · Mục 7: Dung dịch & Nồng độ (KHTN 8)',
          answer:
            `• **Khối lượng dung dịch**: ${ddMatch ? `**m₍dd₎ = ${mDd} g**` : `**m₍dd₎** = m₍ct₎ + m₍dm₎ = ${mCt} + ${parseViNumber(waterMatch![1])} = **${mDd} g**`}.\n` +
            `• **Áp dụng công thức Nồng độ phần trăm**: **C% = (m₍ct₎ / m₍dd₎) × 100%** = (${mCt} / ${mDd}) × 100% = **${cStr}%**.`,
        };
      }
    }
  }

  // 4. Bài toán tính Áp suất trên bề mặt p = F / S
  if (/áp suất|áp lực/i.test(q) && /\d/.test(q)) {
    const fMatch = q.match(/(?:f\s*=\s*|áp lực\s*(?:là\s*)?)(\d+(?:[.,]\d+)?)\s*n\b/i);
    const sMatch = q.match(/(?:s\s*=\s*|diện tích\s*(?:là\s*)?)(\d+(?:[.,]\d+)?)\s*(m2|m²|cm2|cm²)\b/i);
    if (fMatch && sMatch) {
      const F = parseViNumber(fMatch[1]);
      const sRaw = parseViNumber(sMatch[1]);
      const sM2 = sMatch[2].toLowerCase().startsWith('cm') ? sRaw / 10_000 : sRaw;
      if (sM2 > 0) {
        const p = F / sM2;
        return {
          topicTitle: 'Phần III · Mục 1: Khối lượng riêng và Áp suất (KHTN 8)',
          answer:
            `• **Dữ kiện**: Áp lực **F = ${F} N**; Diện tích bị ép **S = ${sM2} m²**.\n` +
            `• **Áp dụng công thức Áp suất**: **p = F / S** = ${F} / ${sM2} = **${p.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} Pa** (N/m²).`,
        };
      }
    }
  }

  // 5. Bài toán tính Tốc độ chuyển động (v = s / t)
  if (/tốc độ/i.test(q) && /\d+\s*(?:km|m)\b/i.test(q)) {
    const distMatches = [...q.matchAll(/(\d+(?:[.,]\d+)?)\s*(km|m)\b/gi)];
    const timeMatches = [...q.matchAll(/(\d+(?:[.,]\d+)?)\s*(phút|giờ|h|giây|s)\b/gi)];
    if (distMatches.length >= 1 && timeMatches.length >= 1) {
      let totalKm = 0;
      for (const dm of distMatches) {
        const val = parseViNumber(dm[1]);
        totalKm += dm[2].toLowerCase() === 'm' ? val / 1000 : val;
      }
      let totalHours = 0;
      for (const tm of timeMatches) {
        const val = parseViNumber(tm[1]);
        const u = tm[2].toLowerCase();
        if (u === 'phút') totalHours += val / 60;
        else if (u === 'giây' || u === 's') totalHours += val / 3600;
        else totalHours += val;
      }
      if (totalHours > 0) {
        const vKmh = totalKm / totalHours;
        const vMs = vKmh / 3.6;
        const sStr = totalKm.toLocaleString('vi-VN', { maximumFractionDigits: 3 });
        const tStr = totalHours.toLocaleString('vi-VN', { maximumFractionDigits: 3 });
        return {
          topicTitle: 'Phần III · Mục 4: Tốc độ chuyển động (KHTN 7)',
          answer:
            `• **Dữ kiện**: Quãng đường **s = ${sStr} km**; Thời gian **t = ${tStr} giờ**.\n` +
            `• **Áp dụng công thức Tốc độ**: **v = s / t** = ${sStr} / ${tStr} = **${vKmh.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} km/h** (tương đương **${vMs.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} m/s**, vì **1 m/s = 3,6 km/h**).`,
        };
      }
    }
  }

  return null;
}

/**
 * BỘ TRẢ LỜI DỰA TRÊN TÀI LIỆU KHOA HỌC TỰ NHIÊN (LỚP 6, 7, 8)
 * Tuân thủ tuyệt đối 3 yêu cầu cốt lõi:
 * 1. TUYỆT ĐỐI chỉ sử dụng kiến thức từ file tài liệu được đính kèm để trả lời. Không tự bịa đặt thông tin.
 * 2. Nếu câu hỏi của học sinh nằm ngoài phạm vi tài liệu, trả lời nguyên văn:
 *    "Xin lỗi, thông tin này hiện không có trong tài liệu Khoa học Tự nhiên lớp 6, 7, 8 mà tôi được cung cấp."
 * 3. Văn phong thân thiện, sư phạm, dễ hiểu, trình bày mạch lạc (dùng bullet point hoặc in đậm các từ khoá quan trọng).
 */
export function generateSmartLocalAnswer(
  payload: ChatContextPayload,
  markdownParagraphs: string[] = [],
): {
  answer: string;
  textbookRef: string;
  sources: ReferenceSourceLink[];
  isOutOfScope?: boolean;
} {
  const rawQ = (payload.question || '').trim();
  const qNorm = normalizeText(rawQ);

  // 0. Kiểm tra nếu câu hỏi thuộc các chủ đề nằm ngoài tài liệu KHTN 6, 7, 8
  if (isQuestionExplicitlyOutOfScope(rawQ)) {
    return {
      answer: OUT_OF_SCOPE_APOLOGY,
      textbookRef: 'Ngoài phạm vi tài liệu KHTN lớp 6, 7, 8',
      sources: DEFAULT_SOURCES,
      isOutOfScope: true,
    };
  }

  // 1. Xử lý câu chào hỏi thân thiện, sư phạm
  if (
    /^(xin chào|chào bạn|chào thầy|chào cô|hello|hi|ê|alo|bạn là ai|bạn tên gì|bạn làm được gì|giúp mình với)$/i.test(
      qNorm,
    )
  ) {
    return {
      answer:
        `Chào em! Mình là **Trợ lý Khoa học Tự nhiên (Lớp 6, 7, 8)**.\n` +
        `• **Phạm vi kiến thức**: Mình hỗ trợ giải đáp các kiến thức trong tài liệu **Khoa học Tự nhiên lớp 6, 7, 8** gồm 4 phần:\n` +
        `  - **Phần I**: Mở đầu về Khoa học tự nhiên và **Đo lường** (chiều dài, khối lượng, thời gian, nhiệt độ, an toàn phòng thực hành).\n` +
        `  - **Phần II**: **Hoá học** (Chất, Oxygen & không khí, tách chất, nguyên tử, bảng tuần hoàn, liên kết hoá học, mol, nồng độ, Acid - Base - pH - Oxide - Muối).\n` +
        `  - **Phần III**: **Vật lí** (Khối lượng riêng, áp suất, lực đẩy Archimedes, moment lực & đòn bẩy, điện học, tốc độ, âm thanh, ánh sáng, từ trường).\n` +
        `  - **Phần IV**: **Sinh học** (Tế bào, tổ chức cơ thể, phân loại 5 giới & khoá lưỡng phân, vi khuẩn & virus, trao đổi chất & chuyển hoá năng lượng).`,
      textbookRef: 'Tổng hợp Kiến thức Khoa học Tự nhiên (Lớp 6, 7, 8)',
      sources: DEFAULT_SOURCES,
      isOutOfScope: false,
    };
  }

  if (/^(cảm ơn|cám ơn|thank|thanks|ok cảm ơn|hay quá|tuyệt vời)$/i.test(qNorm)) {
    return {
      answer:
        `Không có gì đâu nhé! Nếu em cần tìm hiểu thêm mục nào trong **Tài liệu Khoa học Tự nhiên lớp 6, 7, 8** (Đo lường, **Hoá học**, **Vật lí**, **Sinh học**), em cứ đặt câu hỏi nhé!`,
      textbookRef: 'Tổng hợp Kiến thức Khoa học Tự nhiên (Lớp 6, 7, 8)',
      sources: DEFAULT_SOURCES,
      isOutOfScope: false,
    };
  }

  // 2. Giải bài toán định lượng nếu sử dụng đúng công thức trong tài liệu KHTN 6, 7, 8
  const solvedMath = trySolveNumericalQuestion(rawQ);
  if (solvedMath) {
    return {
      answer: sanitizeScientificText(solvedMath.answer),
      textbookRef: solvedMath.topicTitle,
      sources: DEFAULT_SOURCES,
      isOutOfScope: false,
    };
  }

  // 3. Tìm kiếm trên Ngân hàng kiến thức bám sát 100% tài liệu KHTN 6, 7, 8
  const STOP_WORDS = new Set([
    'là',
    'gì',
    'như',
    'thế',
    'nào',
    'tại',
    'sao',
    'vì',
    'có',
    'những',
    'các',
    'và',
    'của',
    'trong',
    'cho',
    'biết',
    'hãy',
    'trình',
    'bày',
    'giải',
    'thích',
    'nêu',
    'kể',
    'tên',
    'về',
    'được',
    'không',
    'khi',
    'với',
    'theo',
    'bằng',
    'một',
    'hai',
    'ba',
  ]);

  const queryWords = qNorm
    .split(/[^a-zA-Z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ%]+/)
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));

  const scoredEntries = KHTN_DEEP_QA_BANK.map((entry) => {
    let score = 0;
    let matchedKeyword = false;
    const topicNorm = normalizeText(entry.topic);
    const coreNorm = normalizeText(entry.coreAnswer);
    const mechNorm = normalizeText(entry.mechanism || '');

    for (const kw of entry.keywords) {
      const kwNorm = normalizeText(kw);
      if (qNorm.includes(kwNorm)) {
        score += kwNorm.includes(' ') ? 14 : 8;
        matchedKeyword = true;
      }
    }

    for (const w of queryWords) {
      if (w.length >= 3) {
        if (topicNorm.includes(w)) score += 3;
        if (coreNorm.includes(w)) score += 1.5;
        if (mechNorm.includes(w)) score += 1;
      }
    }

    return { entry, score, matchedKeyword };
  }).sort((a, b) => b.score - a.score);

  const bestMatch = scoredEntries[0];
  const secondMatch = scoredEntries[1];

  if (bestMatch && (bestMatch.matchedKeyword || bestMatch.score >= 8)) {
    const e = bestMatch.entry;
    const bullets: string[] = [e.coreAnswer];

    if (e.mechanism) {
      bullets.push(e.mechanism);
    }
    if (e.formula) {
      bullets.push(`• **Công thức cần nhớ**: **${e.formula}**`);
    }
    if (e.practicalTip) {
      bullets.push(`• ${e.practicalTip}`);
    }

    // Nếu câu hỏi gộp nhiều chủ đề trong tài liệu (ví dụ hỏi cả Phần I, II, III, IV)
    if (
      secondMatch &&
      secondMatch.entry.id !== e.id &&
      (secondMatch.matchedKeyword || secondMatch.score >= 10)
    ) {
      bullets.push(secondMatch.entry.coreAnswer);
      if (secondMatch.entry.formula) {
        bullets.push(`• **Công thức**: **${secondMatch.entry.formula}**`);
      }
    }

    return {
      answer: sanitizeScientificText(bullets.join('\n')),
      textbookRef: `${e.topic} (${e.gradeInfo})`,
      sources: e.sources || DEFAULT_SOURCES,
      isOutOfScope: false,
    };
  }

  // 4. Tìm kiếm trực tiếp trên các đoạn văn của tài liệu đính kèm
  const docParagraphs =
    markdownParagraphs.length > 0
      ? markdownParagraphs
      : KHTN_678_DOCUMENT_TEXT.split(/\n\s*\n/).map((p) => p.trim());

  const scoredParas = docParagraphs
    .map((para) => {
      const pNorm = normalizeText(para);
      let pScore = 0;
      for (const w of queryWords) {
        if (w.length >= 3 && pNorm.includes(w)) {
          pScore += w.length >= 5 ? 3 : 1.5;
        }
      }
      return { para, pScore };
    })
    .filter((item) => item.pScore >= 6)
    .sort((a, b) => b.pScore - a.pScore);

  if (scoredParas.length > 0) {
    const topParas = scoredParas
      .slice(0, 2)
      .map((p) => `• ${sanitizeScientificText(p.para)}`);
    return {
      answer: topParas.join('\n'),
      textbookRef: 'Tài liệu Khoa học Tự nhiên (Lớp 6, 7, 8)',
      sources: DEFAULT_SOURCES,
      isOutOfScope: false,
    };
  }

  // 5. Nếu nằm ngoài phạm vi tài liệu KHTN lớp 6, 7, 8 -> Trả lời đúng nguyên văn câu quy định
  return {
    answer: OUT_OF_SCOPE_APOLOGY,
    textbookRef: 'Ngoài phạm vi tài liệu KHTN lớp 6, 7, 8',
    sources: DEFAULT_SOURCES,
    isOutOfScope: true,
  };
}
