# DANH SÁCH CÁC PHẦN CẦN SỬA ĐỔI & LÝ DO THỰC HIỆN
**Dự án**: HydroSmart — Smart Hydroponic Farm Management System with AI Yield Prediction  
**Tài liệu đối chiếu**: `docs/FRS.md` (Phiên bản v1.0)  
**Đối tượng rà soát**: Toàn bộ mã nguồn ứng dụng Web Client (`farm-management/frontend/src/`)  
**Ngày lập báo cáo**: 15/09/2026  
**Trạng thái**: Đã rà soát — Chờ phê duyệt triển khai  

---

## MỤC LỤC
1. [Tổng Quan & Ma Trận Mức Độ Ưu Tiên](#1-tổng-quan--ma-trận-mức-độ-ưu-tiên)
2. [Chi Tiết Các Hạng Mục Cần Sửa & Lý Do Từng Phần](#2-chi-tiết-các-hạng-mục-cần-sửa--lý-do-từng-phần)
   - [Phân hệ 1: Bảng Điều Khiển Trung Tâm (Dashboard - FR-DASH)](#phân-hệ-1-bảng-điều-khiển-trung-tâm-dashboard---fr-dash)
   - [Phân hệ 2: Bể Tuần Hoàn NFT & Dinh Dưỡng A/B (FR-RES)](#phân-hệ-2-bể-tuần-hoàn-nft--dinh-dưỡng-ab-fr-res)
   - [Phân hệ 3: Lô Cây Trồng & Sinh Trắc Học (FR-BAT)](#phân-hệ-3-lô-cây-trồng--sinh-trắc-học-fr-bat)
   - [Phân hệ 4: AI Dự Báo Năng Suất Sinh Khối (FR-AI)](#phân-hệ-4-ai-dự-báo-năng-suất-sinh-khối-fr-ai)
   - [Phân hệ 5: Trung Tâm Cảnh Báo & Rule Engine (FR-ALT)](#phân-hệ-5-trung-tâm-cảnh-báo--rule-engine-fr-alt)
   - [Phân hệ 6: Nhật Ký Thu Hoạch & Đối Chiếu Ground Truth (FR-HAR)](#phân-hệ-6-nhật-ký-thu-hoạch--đối-chiếu-ground-truth-fr-har)
3. [Đính Chính Sai Lệch Toán Học Trong Tài Liệu FRS](#3-đính-chính-sai-lệch-toán-học-trong-tài-liệu-frs)
4. [Lộ Trình Triển Khai Khuyến Nghị](#4-lộ-trình-triển-khai-khuyến-nghị)

---

## 1. TỔNG QUAN & MA TRẬN MỨC ĐỘ ƯU TIÊN

Qua đối chiếu chi tiết giữa tài liệu FRS và mã nguồn thực tế, hệ thống đã hoàn thiện khung giao diện và luồng xử lý cơ bản, tuy nhiên có **14 điểm sai lệch và thiếu sót** cần hiệu chỉnh. Các điểm này được phân cấp theo 3 mức độ:

| Mức độ | Ý nghĩa | Số lượng | Các hạng mục |
|---|---|:---:|---|
| **P0 — Khẩn cấp** | Nguy cơ rủi ro nông học chết cây, sai lệch logic Rule Engine hoặc vi phạm nguyên tắc AI cốt lõi | **4** | • Ngưỡng Rule Engine lệch (pH, EC, Nhiệt độ nước > 24.5°C là Critical)<br>• Thiếu $R^2$ Score & Risk Score trên UI AI Predictor<br>• Bồn không tăng thể tích khi châm phân<br>• Mâu thuẫn số học Dosing Calculator trong FRS |
| **P1 — Cao** | Sai lệch trực tiếp so với yêu cầu bắt buộc (Must) trong FRS | **6** | • Thẻ KPI thứ 4 Dashboard sai chỉ số (EC/pH TB vs Sản lượng AI)<br>• Dashboard fix cứng bồn 1, không hỗ trợ đa bồn<br>• Bảng lô thiếu tên bồn cấp & số ngày còn lại<br>• Thẻ lô thiếu bồn liên kết, ngày chuyển máng, tỷ lệ sống<br>• Bộ chọn giai đoạn lô thiếu stage `harvest`<br>• Thiếu bộ lọc cảnh báo theo Metric |
| **P2 — Trung bình** | Thiếu tính năng khuyến nghị (Should/Could) hoặc hạn chế trải nghiệm người dùng | **4** | • Thiếu biểu đồ sinh khối theo ngày tuổi trên Dashboard (`FR-DASH-004`)<br>• Dải thanh trượt What-If bị thu hẹp & thiếu số cây thu hoạch<br>• Modal đo sinh thái thiếu chọn ngày đo<br>• Thiếu KPI Tỷ lệ rau loại 1 (Grade A %) ở màn hình Thu hoạch |

---

## 2. CHI TIẾT CÁC HẠNG MỤC CẦN SỬA & LÝ DO TỪNG PHẦN

### Phân hệ 1: Bảng Điều Khiển Trung Tâm (Dashboard - FR-DASH)

#### Hạng mục 1.1: Thẻ KPI vận hành thứ 4 hiển thị sai chỉ số
- **Mã yêu cầu**: `FR-DASH-001`
- **File liên quan**: `frontend/src/views/DashboardView.tsx` (dòng 110–121)
- **Hiện trạng trong code**: Thẻ thứ 4 đang hiển thị *"Sản lượng dự kiến (~380 kg)"* tính từ hàm mô phỏng AI.
- **Yêu cầu FRS**: Thẻ thứ 4 phải hiển thị **"Nồng độ EC & pH trung bình của các bồn đang vận hành"**.
- **Lý do cần sửa**:
  1. *Giá trị quản trị*: Dashboard là màn hình điều hành tổng quan nơi người quản lý chỉ liếc nhìn trong 30 giây để nắm bắt sức khỏe hệ thống. Nồng độ EC và pH trung bình của toàn trang trại phản ánh trực tiếp chất lượng nguồn nước dinh dưỡng hiện tại.
  2. *Tránh trùng lặp*: Chỉ số sản lượng dự kiến đã được phân tích rất chuyên sâu tại màn hình AI Predictor (`/forecast`), việc đưa lên Dashboard gây dư thừa và làm mất đi góc nhìn hóa lý tổng thể.

#### Hạng mục 1.2: Thẻ trạng thái bồn tuần hoàn bị fix cứng 1 bồn duy nhất
- **Mã yêu cầu**: `FR-DASH-002`
- **File liên quan**: `frontend/src/views/DashboardView.tsx` (dòng 210–294)
- **Hiện trạng trong code**: Chỉ hiển thị cố định bồn đầu tiên `reservoirs[0]` với tiêu đề fix cứng: *"Thông số Bể nước A (NFT)"*.
- **Yêu cầu FRS**: Hiển thị danh sách tất cả các bồn NFT đang hoạt động kèm giá trị đo pH, EC, Nhiệt độ nước; tự động gắn badge cảnh báo đỏ/vàng khi chỉ số vượt ngưỡng; liên kết nhanh sang chi tiết từng bồn.
- **Lý do cần sửa**:
  1. *Khả năng mở rộng trang trại*: Trang trại thực tế luôn có từ 2 bồn trở lên (trong mock data đã có Bể 01 và Bể 02 phục vụ các tầng giàn khác nhau). Việc fix cứng bồn 1 khiến người vận hành bị "mù thông tin" về Bể 02 ngay trên trang chủ.
  2. *An toàn vận hành*: Nếu Bể 02 bị tụt EC hoặc quá nhiệt, Dashboard hoàn toàn không phản ánh, dẫn đến nguy cơ bỏ sót sự cố.

#### Hạng mục 1.3: Bảng danh sách lô trên Dashboard thiếu thông tin bồn cấp và ngày thu hoạch
- **Mã yêu cầu**: `FR-DASH-003`
- **File liên quan**: `frontend/src/views/DashboardView.tsx` (dòng 358–399)
- **Hiện trạng trong code**: Cột thứ 3 hiển thị chữ `"NFT"` từ `batch.systemType` thay vì tên bồn cấp dinh dưỡng; cột ngày tuổi chỉ có thanh progress bar compact, không hiển thị rõ số ngày còn lại đến khi thu hoạch.
- **Yêu cầu FRS**: Liệt kê các lô đang trồng kèm: Mã lô, Giống xà lách, Bồn cấp dinh dưỡng liên kết, Ngày tuổi hiện tại và Số ngày còn lại đến kỳ thu hoạch dự kiến.
- **Lý do cần sửa**: Giúp người quản trị biết ngay lô cây đang ăn dinh dưỡng từ bồn nào và còn bao nhiêu ngày nữa cần chuẩn bị nhân công cắt bán mà không cần bấm chuyển trang.

#### Hạng mục 1.4: Thiếu Biểu đồ vận tốc sinh trưởng sinh khối (`FR-DASH-004`)
- **Mã yêu cầu**: `FR-DASH-004` (Should)
- **File liên quan**: `frontend/src/views/DashboardView.tsx` (dòng 127–208)
- **Hiện trạng trong code**: Đang hiển thị "Biểu đồ theo dõi pH & EC gần đây" (biểu đồ chuỗi thời gian của cảm biến).
- **Yêu cầu FRS**: Trực quan hóa đường cong tích lũy khối lượng kỳ vọng theo ngày tuổi so với các mốc đo đạc thực tế của các lô cây trồng thông qua biểu đồ Recharts.
- **Lý do cần sửa**: Đây là công cụ trực quan hóa cốt lõi của nông nghiệp chính xác: so sánh đường cong sinh trưởng chuẩn (Sigmoid benchmark) với các mốc cân nặng mẫu thực tế để biết lô cây nào đang lớn nhanh vượt chuẩn, lô nào đang bị chững sinh khối để can thiệp kịp thời.

---

### Phân hệ 2: Bể Tuần Hoàn NFT & Dinh Dưỡng A/B (FR-RES)

#### Hạng mục 2.1: Bỏ sót hiển thị trạng thái sục khí oxy rễ (`aerationStatus`)
- **Mã yêu cầu**: `FR-RES-001`
- **File liên quan**: `frontend/src/views/ReservoirsView.tsx` (dòng 328–350)
- **Hiện trạng trong code**: Giao diện chỉ hiển thị trạng thái bơm tuần hoàn (`pumpStatus`), không hiển thị trạng thái máy sục khí oxy rễ (`aerationStatus`).
- **Yêu cầu FRS**: Hiển thị trạng thái của bơm tuần hoàn (`running` / `idle` / `warning`) VÀ sục khí oxy rễ (`aerationStatus: 'active' | 'inactive'`).
- **Lý do cần sửa**: Trong hệ thống NFT, màng nước mỏng chỉ cung cấp một lượng oxy hòa tan hạn chế. Khi thời tiết nắng nóng, nếu máy sục khí ở bồn ngừng hoạt động, rễ cây xà lách sẽ bị ngạt thở (hypoxia) và thối rễ cực nhanh. Người vận hành bắt buộc phải thấy được trạng thái máy sục khí.

#### Hạng mục 2.2: Không tăng thể tích bồn và không đóng cảnh báo khi xác nhận châm phân
- **Mã yêu cầu**: `FR-RES-004`, `FR-RES-005`
- **File liên quan**: `frontend/src/mock/store.ts` (dòng 72–78), `frontend/src/App.tsx` (dòng 78–83)
- **Hiện trạng trong code**: Hàm `applyDosing` chỉ cập nhật `currentEc: targetEc` và `lastTopUpDate`, không tăng thể tích nước trong bồn (`currentVolumeLiters`) và không tự động đóng cảnh báo EC thấp liên quan.
- **Yêu cầu FRS**: Khi bấm "Xác nhận đã châm phân", hệ thống tự động cập nhật nồng độ EC lên mức mục tiêu, tăng thể tích bồn tương ứng với lượng dung dịch đổ vào và tự động đánh dấu giải quyết (`resolveAlert`) cảnh báo EC thấp đang mở của bồn đó (theo Sequence Diagram dòng 341–342 trong FRS).
- **Lý do cần sửa**:
  1. *Tính chính xác thể tích*: Khi châm hàng trăm ml dung dịch mẹ pha loãng, thể tích bồn có tăng lên. Bỏ qua việc này làm sai lệch tỷ lệ nồng độ ở các lần tính toán bù phân hoặc bù nước tiếp theo.
  2. *Trải nghiệm người dùng (UX)*: Kỹ sư vừa hoàn thành việc châm phân bù EC theo đề xuất của hệ thống, nhưng quay lại màn hình cảnh báo vẫn thấy cảnh báo "EC quá loãng" ở trạng thái chưa xử lý, gây ức chế và nhầm lẫn rằng thao tác chưa có tác dụng.

#### Hạng mục 2.3: Modal ghi nhận số đo thiếu trường "Người thực hiện"
- **Mã yêu cầu**: `FR-RES-007`
- **File liên quan**: `frontend/src/views/ReservoirsView.tsx` (dòng 790–835)
- **Hiện trạng trong code**: Form modal chỉ có 3 trường: pH, EC, Nhiệt độ nước.
- **Yêu cầu FRS**: Bản ghi đo thủ công phải lưu trữ: Thời điểm đo, pH, EC, Nhiệt độ nước, **Người thực hiện** (`recordedBy` theo schema TypeScript `WaterQualityRecord`).
- **Lý do cần sửa**: Theo tiêu chuẩn thực hành nông nghiệp tốt (VietGAP / GlobalGAP), mọi số đo kiểm tra bồn nước phải gắn với định danh kỹ sư lấy mẫu để phục vụ truy xuất trách nhiệm khi có sự cố ngộ độc dinh dưỡng hoặc cháy rễ.

---

### Phân hệ 3: Lô Cây Trồng & Sinh Trắc Học (FR-BAT)

#### Hạng mục 3.1: Thẻ lô cây trồng thiếu thông tin bồn cấp, ngày chuyển máng và tỷ lệ sống
- **Mã yêu cầu**: `FR-BAT-001`
- **File liên quan**: `frontend/src/views/BatchesView.tsx` (dòng 201–274)
- **Hiện trạng trong code**:
  - Không hiển thị tên bồn dinh dưỡng liên kết (`reservoirName`).
  - Không hiển thị ngày chuyển lên máng NFT (`transplantDate`).
  - Chỉ hiển thị số cây hiện tại (`currentQuantity`), không hiển thị số cây gieo ban đầu (`plantQuantity`).
- **Yêu cầu FRS**: Thẻ lô phải hiển thị đầy đủ: Mã lô, Giống xà lách, Bồn cấp dinh dưỡng liên kết, Số lượng cây ban đầu và hiện tại, Mật độ trồng, Ngày gieo hạt, Ngày chuyển máng NFT, Ngày dự kiến thu hoạch.
- **Lý do cần sửa**:
  1. *Liên kết bồn - lô*: Khi phát hiện bồn nước A bị lệch pH, kỹ sư nhìn vào danh mục lô phải nhận diện ngay những lô nào đang dùng nước bồn A để ưu tiên đi kiểm tra.
  2. *Đánh giá tỷ lệ sống*: Hiển thị dạng `492 / 500 cây` giúp kỹ sư nhận biết tỷ lệ hao hụt cây con sau khi chuyển giàn máng.
  3. *Mốc chuyển máng*: Ngày chuyển máng đánh dấu sự chuyển đổi môi trường từ giá thể ươm sang dòng chảy NFT, là căn cứ nông học cốt lõi để theo dõi rễ phát triển.

#### Hạng mục 3.2: Thiếu trạng thái `failed` trong bộ lọc lô
- **Mã yêu cầu**: `FR-BAT-002`
- **File liên quan**: `frontend/src/views/BatchesView.tsx` (dòng 137–163)
- **Hiện trạng trong code**: Tab lọc chỉ có: Tất cả, Đang trồng, Cây non, Sinh dưỡng, Sắp thu hoạch, Đã thu hoạch.
- **Yêu cầu FRS**: Bộ lọc trạng thái canh tác phải có: Tất cả, Đang trồng (`active`), Đã thu hoạch (`harvested`), **Thất bại (`failed`)**.
- **Lý do cần sửa**: Trong sản xuất nông nghiệp, việc một lô bị hư hỏng (do nấm bệnh, cúp điện cháy bơm, sâu hại) là hoàn toàn có thể xảy ra. Cần có trạng thái và bộ lọc `failed` để lưu trữ dữ liệu lô hỏng phục vụ phân tích nguyên nhân và hạch toán chi phí.

#### Hạng mục 3.3: Bộ chọn giai đoạn phát triển nhanh thiếu giai đoạn `harvest`
- **Mã yêu cầu**: `FR-BAT-003`, `FR-BAT-004`
- **File liên quan**: `frontend/src/views/BatchesView.tsx` (dòng 224–235)
- **Hiện trạng trong code**: Dropdown chuyển nhanh giai đoạn chỉ có 3 lựa chọn: `seedling`, `vegetative`, `pre_harvest`.
- **Yêu cầu FRS**: Cho phép kỹ sư chuyển tiếp qua 4 giai đoạn chuẩn: Gieo hạt (`seedling`) → Cây con (`vegetative`) → Tích lũy sinh khối (`pre_harvest`) → **Sẵn sàng thu hoạch (`harvest`)**.
- **Lý do cần sửa**: Đứt gãy vòng đời sinh thái. Khi lô cây bước vào ngày thứ 35 sẵn sàng thu hoạch, kỹ sư không thể cập nhật lô sang giai đoạn `harvest` trên giao diện lô trồng, tạo ra sự không đồng nhất giữa màn hình Lô và màn hình Thu hoạch.

#### Hạng mục 3.4: Modal ghi nhận đo đạc sinh trắc học không cho chọn ngày đo
- **Mã yêu cầu**: `FR-BAT-005`
- **File liên quan**: `frontend/src/views/BatchesView.tsx` (dòng 383–436), `frontend/src/mock/store.ts` (dòng 177–188)
- **Hiện trạng trong code**: Không có ô chọn ngày đo đạc (`date`). Mã nguồn tự động gán ngày hiện tại (`today`).
- **Yêu cầu FRS**: Cho phép nhập ngày đo đạc (`date`), số lá, chiều cao, cân nặng mẫu.
- **Lý do cần sửa**: Kỹ sư đi thực địa lấy mẫu ngoài nhà màng ghi chép vào sổ, thường cuối ngày hoặc ngày hôm sau mới nhập liệu vào hệ thống. Việc ép cứng ngày hôm nay sẽ làm sai lệch mốc chuỗi thời gian sinh trưởng của cây, làm hỏng độ chính xác của tập dữ liệu huấn luyện AI.

---

### Phân hệ 4: AI Dự Báo Năng Suất Sinh Khối (FR-AI)

#### Hạng mục 4.1: Thiếu hiển thị chỉ số $R^2$ Score và Mức độ rủi ro (Risk Score) trên UI
- **Mã yêu cầu**: `FR-AI-004`
- **File liên quan**: `frontend/src/views/AIPredictorView.tsx` (dòng 300–352), `frontend/src/services/aiPredictor.ts` (dòng 210)
- **Hiện trạng trong code**:
  - Service `aiPredictor.ts` đang gán cứng `confidenceR2: 0.895` (thấp hơn ngưỡng $\ge 0.92$ trong FRS).
  - Giao diện `AIPredictorView.tsx` hoàn toàn **không hiển thị $R^2$ Score và Risk Score** trên bất kỳ thẻ KPI hay vùng thông tin nào (dù hàm tính toán có trả về).
- **Yêu cầu FRS**: Đánh giá chỉ số độ tin cậy mô hình ($R^2 \ge 0.92$) và mức độ rủi ro (`low`, `moderate`, `high`) hiển thị trực quan cho người dùng.
- **Lý do cần sửa**:
  1. *Nguyên tắc Explainable AI trong `AGENTS.md`*: HydroSmart là Hệ Thống Hỗ Trợ Quyết Định (DSS). Người quản lý không thể mạo hiểm tin tưởng vào một con số sản lượng dự báo (ví dụ 192g/cây) nếu không biết mô hình đang tự tin ở mức nào ($R^2$) và rủi ro sinh trưởng của lô là Thấp, Trung bình hay Cao.
  2. *Tính minh bạch khoa học*: Ẩn $R^2$ và Risk Score biến AI thành một "hộp đen" khó hiểu, làm giảm giá trị ứng dụng thực tiễn của phần mềm.

#### Hạng mục 4.2: Dải thanh trượt What-If bị thu hẹp và thiếu điều chỉnh số cây thu hoạch
- **Mã yêu cầu**: `FR-AI-006`
- **File liên quan**: `frontend/src/views/AIPredictorView.tsx` (dòng 397–531)
- **Hiện trạng trong code**:
  - Các slider bị giới hạn dải hẹp: Tuổi cây chỉ cho kéo 10–42 (FRS: 1–45); Lá chỉ 4–28 (FRS: 2–30); Cao chỉ 5–26 (FRS: 3–30); EC chỉ 0.8–2.6 (FRS: 0.8–3.0); pH chỉ 4.8–7.2 (FRS: 4.5–7.5); Nước chỉ 18–30 (FRS: 16–32).
  - Không có slider/ô nhập cho "Số cây thu hoạch kỳ vọng".
- **Yêu cầu FRS**: Bộ thử nghiệm What-If đa biến phải hỗ trợ đầy đủ các dải tham số nông học từ giai đoạn gieo mầm đến thu hoạch và cho phép giả lập thay đổi số cây thu hoạch kỳ vọng.
- **Lý do cần sửa**:
  1. *Giả lập tình huống thời tiết cực đoan*: Mùa đông nhiệt độ nước bồn có thể giảm xuống 16°C, mùa hè nắng nóng có thể vọt lên 32°C; dải slider bị chặn khiến kỹ sư không thể giả lập tác động của các đợt sốc nhiệt thực tế.
  2. *Dự báo sản lượng cả lô*: Một lô gieo 600 cây nhưng tỷ lệ sống chỉ 520 cây; nếu không cho chỉnh số cây thì dự báo tổng sản lượng lô (kg) sẽ bị sai lệch nghiêm trọng.

---

### Phân hệ 5: Trung Tâm Cảnh Báo & Rule Engine (FR-ALT)

#### Hạng mục 5.1: Ngưỡng lý hóa và cấp độ nghiêm trọng của Rule Engine bị sai lệch
- **Mã yêu cầu**: `FR-ALT-001`, `FR-ALT-003`
- **File liên quan**: `frontend/src/mock/store.ts` (dòng 105–145)
- **Hiện trạng trong code**:
  - pH: Code dùng điều kiện `ph < 5.4 || ph > 6.4` (FRS quy định: `pH < 5.5` và `pH > 6.5`).
  - EC High: Code dùng `ec > 2.1` (FRS quy định: `EC > 2.0`).
  - Nhiệt độ nước cao: Code gán mức `warning` khi nhiệt độ từ 24.5°C đến 26.0°C, chỉ gán `critical` khi `> 26.0°C`. Trong khi FRS quy định **Nhiệt độ nước > 24.5°C lập tức kích hoạt cấp độ `CRITICAL`**.
- **Yêu cầu FRS**: Tuân thủ chính xác 5 luật định chuẩn:
  1. `RULE-EC-LOW`: EC < 1.3 mS/cm → `WARNING`
  2. `RULE-EC-HIGH`: EC > 2.0 mS/cm → `WARNING`
  3. `RULE-PH-LOW`: pH < 5.5 → `WARNING`
  4. `RULE-PH-HIGH`: pH > 6.5 → `WARNING`
  5. `RULE-TEMP-HIGH`: Nhiệt độ nước > 24.5°C → `CRITICAL`
- **Lý do cần sửa**:
  1. *Nguy cơ bùng phát nấm rễ Pythium*: Trong thủy canh NFT rau xà lách, khi nhiệt độ nước vượt 24.5°C, lượng oxy hòa tan tụt dốc thảm hại, tạo điều kiện cho nấm rễ *Pythium* bùng phát chỉ trong 24–48h làm thối rễ toàn bộ giàn máng. Nếu chỉ báo `warning` (vàng) thay vì `CRITICAL` (đỏ), kỹ sư sẽ không bật quạt làm mát hay sục khí khẩn cấp.
  2. *Sốc thẩm thấu cháy chóp lá*: Khi EC > 2.0 mS/cm, rễ cây bắt đầu bị sốc thẩm thấu, cháy mép lá non (*tipburn*). Chờ đến 2.1 mS/cm mới cảnh báo là phản xạ quá muộn.
  3. *Hấp thu vi lượng Sắt*: pH > 6.5 làm kết tủa Sắt chelate, cây bị úa vàng ngọn lá (*chlorosis*). Sai số 0.1 đơn vị pH trong dung dịch là chênh lệch rất lớn về nồng độ ion $H^+$.

#### Hạng mục 5.2: Thiếu bộ lọc cảnh báo theo chỉ số vi phạm (Metric)
- **Mã yêu cầu**: `FR-ALT-006` (Should)
- **File liên quan**: `frontend/src/views/AlertsView.tsx` (dòng 88–117)
- **Hiện trạng trong code**: Chỉ có bộ lọc theo mức độ nghiêm trọng (`Critical`, `Warning`, `Info`) và trạng thái (`open`, `acknowledged`, `resolved`). Hoàn toàn không có bộ lọc theo Metric.
- **Yêu cầu FRS**: Cho phép lọc theo chỉ số vi phạm (`pH`, `EC`, `Temp`, `Nutrient`, `System`).
- **Lý do cần sửa**: Kỹ sư phụ trách điều chế phân bón cần lọc riêng các cảnh báo về `EC` và `Nutrient` để pha phân; kỹ sư phụ trách thiết bị cần lọc riêng các cảnh báo về `Temp` hoặc `System` để kiểm tra máy bơm quạt gió. Thiếu bộ lọc này gây khó khăn khi số lượng thông báo tăng lên.

---

### Phân hệ 6: Nhật Ký Thu Hoạch & Đối Chiếu Ground Truth (FR-HAR)

#### Hạng mục 6.1: Thiếu thẻ KPI "Tỷ lệ rau đạt tiêu chuẩn loại 1 (Grade A %)"
- **Mã yêu cầu**: `FR-HAR-004` (Should)
- **File liên quan**: `frontend/src/views/HarvestView.tsx` (dòng 141–168)
- **Hiện trạng trong code**: 3 thẻ KPI hiện tại gồm: (1) Tổng sản lượng đã thu (kg), (2) Độ lệch trung bình so với dự báo (±%), (3) Số đợt thu hoạch. Thiếu thẻ tỷ lệ rau loại 1.
- **Yêu cầu FRS**: Thống kê tổng sản lượng xuất bán tích lũy (kg) và **tỷ lệ rau đạt tiêu chuẩn loại 1 trung bình toàn trang trại**.
- **Lý do cần sửa**: Bài toán kinh tế của trang trại nông nghiệp công nghệ cao không chỉ là thu được bao nhiêu kg rau, mà nằm ở tỷ lệ rau đạt chuẩn Loại 1 (Grade A) để xuất bán cho các hệ thống siêu thị với giá cao. Đây là chỉ số đánh giá tay nghề kỹ thuật và hiệu quả phân bón mà chủ trang trại bắt buộc phải theo dõi.

---

## 3. ĐÍNH CHÍNH SAI LỆCH TOÁN HỌC TRONG TÀI LIỆU FRS

Trong quá trình rà soát, phát hiện một **mâu thuẫn số học ngay trong chính văn bản tài liệu FRS** tại mục `AC-03` và User Flow 1:

- **Văn bản FRS dòng 683 (`AC-03`) và dòng 338**:
  $$\text{Dose} = [(1.65 - 1.2) \times 450 / 0.1] \times 10 = 382.5\text{ ml}$$
- **Phân tích toán học & nông học thực tế**:
  - Độ hụt EC cần bù: $\Delta EC = 1.65 - 1.2 = 0.45\text{ mS/cm}$.
  - Nguyên tắc chuẩn: Châm $10\text{ ml}$ Can A + $10\text{ ml}$ Can B vào $100\text{ L}$ nước làm tăng $0.1\text{ mS/cm}$ (tức $1\text{ L}$ nước cần $1\text{ ml}$ dung dịch mẹ mỗi loại để tăng $1.0\text{ mS/cm}$).
  - Với thể tích bồn $450\text{ L}$, lượng dung dịch mẹ cần châm đúng chuẩn phải là:
    $$\text{Dose} = 450\text{ L} \times 0.45\text{ mS/cm} = 202.5\text{ ml (mỗi can)}$$
  - Con số **$382.5\text{ ml}$** trong tài liệu FRS thực chất ứng với $\Delta EC = 0.85\text{ mS/cm}$ ($450 \times 0.85 = 382.5\text{ ml}$, ví dụ đưa EC từ $0.8$ lên $1.65$).
- **Lý do cần ghi nhận**:
  Mã nguồn hiện tại tính ra $\approx 203\text{ ml}$ là **hoàn toàn chính xác theo công thức khoa học**. Tài liệu FRS bị lỗi gõ nhầm số liệu ví dụ ở mục nghiệm thu. Cần ghi nhận rõ điểm này để tránh việc kiểm thử viên dựa vào số $382.5\text{ ml}$ trong FRS rồi đánh giá sai rằng phần mềm bị lỗi.

---

## 4. LỘ TRÌNH TRIỂN KHAI KHUYẾN NGHỊ

Khi được cấp phép can thiệp mã nguồn, đề xuất thực hiện theo 3 giai đoạn tinh gọn, không làm ảnh hưởng đến cấu trúc hiện có:

```text
GIAI ĐOẠN 1: AN TOÀN NÔNG HỌC & RULE ENGINE (Ưu tiên P0)
├── Cập nhật 5 ngưỡng Rule Engine trong store.ts chuẩn xác theo FRS
├── Bổ sung tăng thể tích bồn và đóng cảnh báo khi xác nhận châm phân
└── Hiển thị R² Score (≥ 0.92) & Risk Score trên giao diện AIPredictorView

GIAI ĐOẠN 2: CHUẨN HÓA DASHBOARD & QUẢN LÝ LÔ (Ưu tiên P1)
├── Đổi thẻ KPI thứ 4 Dashboard sang EC & pH trung bình
├── Render danh sách tất cả các bồn trên Dashboard thay vì fix cứng bồn 1
├── Bổ sung tên bồn cấp dinh dưỡng & ngày chuyển máng trên thẻ lô BatchesView
├── Thêm giai đoạn 'harvest' vào bộ chọn tiến trình lô
└── Thêm bộ lọc cảnh báo theo Metric trên AlertsView

GIAI ĐOẠN 3: HOÀN THIỆN TRẢI NGHIỆM & BÁO CÁO (Ưu tiên P2)
├── Thêm biểu đồ vận tốc sinh trưởng sinh khối FR-DASH-004
├── Mở rộng dải thanh trượt What-If theo FRS & thêm ô chỉnh số cây
├── Thêm ô chọn ngày đo trong modal sinh trắc học
├── Bổ sung KPI Tỷ lệ rau loại 1 (Grade A %) trên HarvestView
└── Đính chính lỗi số liệu 382.5 ml thành 202.5 ml trong tài liệu FRS.md
```
