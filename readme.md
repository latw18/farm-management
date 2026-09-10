# SMART HYDROPONIC FARM MANAGEMENT SYSTEM
## Tài liệu tổng quan đầy đủ để bắt đầu dự án

> **Tên đề tài đề xuất:**  
> **Phần mềm Quản lý Trang trại Thủy canh Thông minh tích hợp Big Data và AI dự báo năng suất**  
> **English:** *Smart Hydroponic Farm Management System with Big Data Analytics and AI-based Yield Prediction*

---

## ⚡ HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY (QUICK START)

### 1. Yêu cầu môi trường (Prerequisites)
- **Node.js**: Phiên bản `>= 18.0.0` (khuyến nghị Node 20 LTS hoặc 22)
- **Trình quản lý gói**: `npm` (mặc định theo Node) hoặc `pnpm` / `yarn`
- **Trình duyệt**: Google Chrome, Edge, Safari hoặc Firefox phiên bản hiện đại.

### 2. Các bước cài đặt & Khởi chạy ứng dụng

#### Bước 1: Di chuyển vào thư mục Frontend
Mở terminal tại thư mục gốc của dự án và chạy:
```bash
cd frontend
```

#### Bước 2: Cài đặt các thư viện phụ thuộc (Dependencies)
```bash
npm install
```

#### Bước 3: Khởi chạy máy chủ phát triển (Dev Server)
```bash
npm run dev
```
Sau khi chạy, terminal sẽ hiển thị địa chỉ truy cập:
```text
  VITE v8.x.x  ready in ~250 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```
👉 Mở trình duyệt và truy cập: **[http://localhost:5173](http://localhost:5173)**

#### Bước 4: Đóng gói bản Production (Tùy chọn)
```bash
# Kiểm tra kiểu dữ liệu TypeScript và build bundle tối ưu
npm run build

# Chạy thử bản production vừa đóng gói
npm run preview
```

---

### 3. Danh sách các màn hình và đường dẫn (Routes)

| Đường dẫn (URL) | Chức năng chính | Nội dung chi tiết |
|---|---|---|
| **`/dashboard`** | **Bảng điều khiển trung tâm** | Giám sát tổng thể các bồn tuần hoàn NFT, lô cây đang trồng, sự cố khẩn cấp và biểu đồ tăng trưởng. |
| **`/reservoirs`** | **Quản lý Bể & Dinh dưỡng** | Giám sát pH, EC, DO, nhiệt độ Bể Tuần Hoàn 01 & 02; công cụ tính toán châm phân mẹ Stock A/B và công thức pha 10L mẹ ở kho. |
| **`/batches`** | **Theo dõi Lô Cây trồng** | Quản lý vòng đời (Gieo hạt → Cây con → NFT Sinh trưởng → Thu hoạch), ghi nhận nhật ký đo đạc sinh trắc học và tạo lô mới. |
| **`/forecast`** | **AI Dự báo Năng suất** | Dự đoán trọng lượng (g/cây) và sản lượng (kg/lô), phân tích mức độ tác động của các yếu tố (EC, pH, lá thật), chế độ thử nghiệm What-If. |
| **`/alerts`** | **Trung tâm Cảnh báo** | Giám sát các sự cố nồng độ EC tụt, pH lệch ngưỡng, thiếu oxy rễ (DO) kèm quy trình xử lý từng bước. |
| **`/harvest`** | **Nhật ký & So sánh Thu hoạch** | Thống kê sản lượng thực tế, đối chiếu sai số với dự báo AI và theo dõi tỷ lệ rau đạt tiêu chuẩn loại 1. |

---

# 1. Đề tài làm gì?

Xây dựng một **phần mềm quản lý trang trại thủy canh** giúp người quản lý và kỹ sư nông nghiệp theo dõi toàn bộ quá trình:

**Cây trồng → Hệ thống thủy canh → Nước → Dinh dưỡng → Môi trường → Sinh trưởng → Thu hoạch → AI dự báo**

Hệ thống **không bắt buộc xử lý IoT real-time**. Dữ liệu có thể được:

- nhập thủ công;
- import Excel/CSV;
- lấy từ dataset lịch sử;
- hoặc mở rộng kết nối cảm biến sau này.

Phần Big Data sử dụng dữ liệu lịch sử để làm sạch, phân tích và huấn luyện Machine Learning. Model sau đó được đóng gói thành API để Web/Mobile sử dụng.

### Cây AI thí điểm

Nên chọn:

**Xà lách thủy canh (*Lactuca sativa*)**

Lý do:

- rất phổ biến trong NFT/DWC;
- chu kỳ trồng tương đối ngắn;
- có nhiều nghiên cứu và dataset;
- năng suất dễ định nghĩa bằng `g/cây`, `kg/lô`, `kg/m²`.

> Phần mềm có thể quản lý nhiều loại cây, nhưng AI ban đầu chỉ nên train cho một cây/nhóm dữ liệu đồng nhất.

---

# 2. Hai hệ thống thủy canh chính

## 2.1. NFT – Nutrient Film Technique

Dung dịch dinh dưỡng được bơm từ bể chứa qua các máng trồng thành một lớp dung dịch mỏng rồi quay trở lại bể.

Hệ thống cần quản lý:

- Reservoir – bể dung dịch
- Pump – máy bơm
- Channel – máng trồng
- Flow/tuần hoàn dung dịch
- Số vị trí trồng
- Lô cây nằm trên từng máng
- pH, EC, nhiệt độ dung dịch
- Lịch vệ sinh/bảo trì

NFT rất phù hợp với xà lách và rau ăn lá.

## 2.2. DWC – Deep Water Culture

Rễ cây tiếp xúc trực tiếp với một thể tích dung dịch dinh dưỡng lớn; thường sử dụng raft/bè nổi.

Hệ thống cần quản lý:

- Bể DWC
- Thể tích/mực nước
- Raft
- Air pump / hệ thống sục khí
- DO – oxy hòa tan
- pH
- EC
- Nhiệt độ dung dịch
- Lô cây

> Với DWC, **DO đặc biệt quan trọng** vì rễ nằm trực tiếp trong dung dịch.

---

# 3. Chất dinh dưỡng phải biết

Thực vật có **17 nguyên tố dinh dưỡng thiết yếu**.

C, H, O chủ yếu đến từ không khí và nước. Trong hệ thống thủy canh cần đặc biệt quan tâm các nguyên tố khoáng sau:

## 3.1. Đa lượng

| Ký hiệu | Tên | Vai trò tổng quát |
|---|---|---|
| N | Nitrogen | Sinh trưởng, protein, diệp lục |
| P | Phosphorus | Chuyển hóa năng lượng, ATP |
| K | Potassium | Điều hòa nước, hoạt hóa enzyme |
| Ca | Calcium | Thành tế bào, mô non |
| Mg | Magnesium | Thành phần của chlorophyll |
| S | Sulfur | Amino acid và protein |

## 3.2. Vi lượng

| Ký hiệu | Tên |
|---|---|
| Fe | Iron |
| Mn | Manganese |
| Zn | Zinc |
| B | Boron |
| Cu | Copper |
| Mo | Molybdenum |
| Cl | Chloride |
| Ni | Nickel |

### Nitrogen có thể tồn tại ở nhiều dạng

Nếu làm sâu hơn có thể lưu:

- `NO3-N` – nitrate nitrogen
- `NH4-N` – ammonium nitrogen
- `Total N`

### Lưu ý cực kỳ quan trọng

**Không được coi thủy canh chỉ có N-P-K.**

Ca, Mg, S và vi lượng cũng rất quan trọng.

---

# 4. Dung dịch dinh dưỡng

Phần mềm nên quản lý **công thức dung dịch**, không chỉ lưu một con số N-P-K.

Ví dụ các nguồn phân thường gặp:

- Calcium nitrate
- Potassium nitrate
- Monopotassium phosphate (MKP)
- Magnesium sulfate
- Potassium sulfate
- Iron chelate
- Micronutrient mix

## 4.1. Nutrient Formula

Một công thức nên có:

- tên công thức;
- cây áp dụng;
- giai đoạn áp dụng;
- thành phần;
- nồng độ/mức mục tiêu;
- ghi chú.

## 4.2. Stock A / Stock B

Dung dịch đậm đặc thường được chia thành nhiều stock để tránh các chất không tương thích kết tủa khi để ở nồng độ cao.

Phần mềm nên hỗ trợ:

- Stock A
- Stock B
- thành phần mỗi stock
- nồng độ
- ngày pha
- hạn sử dụng
- lượng đã sử dụng

> Không hard-code một công thức A/B duy nhất vì công thức phụ thuộc sản phẩm và quy trình thực tế.

---

# 5. Các chỉ số nước và dung dịch quan trọng

## 5.1. pH

pH ảnh hưởng đến khả năng hòa tan và hấp thu dinh dưỡng.

Cần lưu:

- pH hiện tại
- target min/max
- thời điểm đo
- người/thiết bị đo
- lịch sử pH

Với nhiều loại rau ăn lá trong NFT/DWC, tài liệu Virginia Tech đưa ra vùng tham khảo khoảng:

**pH 5.5 – 6.2**

Đây chỉ là **giá trị tham khảo**, không được hard-code cho mọi cây.

---

## 5.2. EC – Electrical Conductivity

Đơn vị thường dùng:

**mS/cm** hoặc **dS/m**

EC cho biết khả năng dẫn điện của dung dịch và được dùng như chỉ báo cho **tổng lượng ion hòa tan**.

Cần lưu:

- EC hiện tại
- target min/max
- thời điểm đo
- lịch sử EC

Rau ăn lá thường có thể hoạt động tốt quanh:

**EC 1.2 – 2.0 mS/cm**

theo tài liệu Virginia Tech.

### Cực kỳ quan trọng

**EC không cho biết riêng N, P, K, Ca hay Mg.**

Sai:

> EC thấp → chắc chắn thiếu Nitrogen.

Đúng:

> EC thấp → tổng nồng độ ion/dinh dưỡng hòa tan đang thấp hơn mức mục tiêu → cần kiểm tra dung dịch.

Muốn biết từng nguyên tố phải dựa vào công thức pha, lịch bổ sung, phân tích dung dịch hoặc thiết bị đo ion riêng.

---

## 5.3. DO – Dissolved Oxygen

Đơn vị:

**mg/L hoặc ppm**

DO thể hiện lượng oxy hòa tan trong nước.

Cần lưu:

- DO hiện tại
- mức cảnh báo
- thời gian đo
- lịch sử DO

Missouri Extension đưa ra **> 6 ppm** như một mức tốt để đánh giá nguồn nước/hệ thủy canh.

---

## 5.4. Nhiệt độ dung dịch

Lưu:

- water temperature
- min/max/target
- timestamp

Nhiệt độ ảnh hưởng đến:

- hệ rễ;
- khả năng giữ oxy của nước;
- hấp thu dinh dưỡng;
- điều kiện sinh học vùng rễ.

---

# 6. Chất lượng nguồn nước

Trước khi pha dinh dưỡng phải biết chất lượng nước đầu vào.

Tối thiểu nên quản lý:

- pH
- EC
- **Alkalinity**
- Ca
- Mg
- Na
- Chloride
- Sulfate
- Boron
- Fe
- Mn

Có thể lưu theo dạng **Water Test / Laboratory Analysis**, không cần nhập mỗi ngày.

## Alkalinity

Đơn vị thường dùng:

**mg/L CaCO3**

Alkalinity là khả năng nước trung hòa acid và ảnh hưởng mạnh đến việc điều chỉnh pH.

> **Alkalinity không phải pH.**

Hai nguồn nước có cùng pH vẫn có thể cần lượng acid điều chỉnh rất khác nếu alkalinity khác nhau.

---

# 7. Môi trường không khí

Các thông số chính:

## Bắt buộc

- Air Temperature – °C
- Relative Humidity – %

## Nên có

- CO₂ – ppm
- PPFD – µmol/m²/s
- DLI – mol/m²/day
- Photoperiod – giờ chiếu sáng/ngày

## Có thể tính

### VPD – Vapor Pressure Deficit

VPD có thể tính từ:

**Nhiệt độ + Độ ẩm tương đối**

Không nhất thiết cần cảm biến VPD riêng.

### Ánh sáng

Ưu tiên **PPFD/DLI** hơn Lux nếu muốn mô tả ánh sáng phục vụ quang hợp.

Virginia Tech đưa ra DLI khoảng **17 mol/m²/day** như một giá trị tham khảo cho lettuce, nhưng vẫn phải xem giống và điều kiện cụ thể.

---

# 8. Cây trồng và giống

Không nên chỉ có:

`Crop = Lettuce`

Nên lưu:

- Crop
- Scientific name
- Cultivar / Variety
- Crop category
- Thời gian sinh trưởng dự kiến
- Khối lượng thu hoạch mục tiêu
- Điều kiện khuyến nghị

Ví dụ:

```text
Crop: Lettuce
Scientific name: Lactuca sativa
Cultivar: Green Oak
```

**Cultivar quan trọng** vì các giống cùng loài vẫn có tốc độ và đặc tính sinh trưởng khác nhau.

---

# 9. Giai đoạn sinh trưởng

Có thể chia đơn giản:

1. Seed
2. Germination
3. Seedling
4. Transplant
5. Vegetative/Growing
6. Pre-harvest
7. Harvest

Mỗi giai đoạn có thể có yêu cầu riêng:

- pH
- EC
- nhiệt độ
- độ ẩm
- ánh sáng
- công thức dinh dưỡng

Do đó nên thiết kế:

`Crop → Cultivar → Growth Stage → Requirements`

---

# 10. Crop Batch – Lô trồng

**Lô trồng là entity trung tâm của hệ thống.**

Ví dụ:

```text
Batch: LET-2026-001
Crop: Lettuce
Cultivar: Green Oak
System: NFT
Plant quantity: 500
Seed date: 01/09/2026
Expected harvest: 05/10/2026
Status: Growing
```

Cần lưu:

- mã lô
- cây
- giống
- ngày gieo
- ngày chuyển cây
- ngày dự kiến thu hoạch
- ngày thu hoạch thực tế
- số cây
- diện tích/mật độ
- hệ thống
- reservoir
- growth stage
- trạng thái

> MVP nên quản lý theo **batch/lô**, không cần quản lý từng cây riêng lẻ.

---

# 11. Reservoir – Bể dung dịch

Nên là entity riêng.

Thông tin:

- Reservoir ID
- system
- capacity
- current volume
- nutrient formula
- current pH
- current EC
- current DO
- water temperature
- last replacement date

Các sự kiện liên quan:

- Mixing
- Nutrient dosing
- Water top-up
- pH adjustment
- Drain
- Refill
- Solution replacement
- Sampling
- Laboratory analysis

---

# 12. Lịch sử pha và bổ sung dung dịch

Mỗi lần pha cần lưu:

- nước bao nhiêu L;
- nguồn nước;
- formula;
- Stock A bao nhiêu;
- Stock B bao nhiêu;
- phân/chất bổ sung khác;
- pH trước/sau;
- EC trước/sau;
- người thực hiện;
- thời gian.

Mỗi lần bổ sung cũng nên tạo event riêng.

Đây là dữ liệu rất quan trọng nếu sau này muốn giải thích sự khác biệt năng suất giữa các lô.

---

# 13. Theo dõi sinh trưởng

Kỹ sư có thể lấy mẫu định kỳ.

Tối thiểu:

- Plant age
- Plant height
- Leaf count
- Sample fresh weight

Có thể mở rộng:

- canopy diameter
- leaf area
- root length
- dry weight
- chlorophyll/SPAD
- ảnh cây

---

# 14. Theo dõi sức khỏe cây

Có thể ghi nhận:

- Leaf color
- Root color
- Root condition
- Wilting
- Chlorosis
- Necrosis
- Tipburn
- Stunted growth
- Abnormal leaves
- Notes
- Photo

Với xà lách, **tipburn** là một rối loạn sinh lý đáng theo dõi.

---

# 15. Sâu bệnh

Module ghi nhận:

- Pest/Disease
- Ngày phát hiện
- Severity
- Số cây bị ảnh hưởng
- % bị ảnh hưởng
- Diagnosis
- Treatment
- Outcome
- Photo

Ví dụ:

- Pythium/root rot
- Aphids
- Thrips
- Downy mildew

> Chỉ được gọi là **AI Disease Prediction** khi dataset thực sự có nhãn bệnh.  
> Nếu chưa có, chỉ nên làm **Environmental/Condition Risk Warning**.

---

# 16. Vệ sinh và bảo trì

Nên có:

## Sanitation

- vệ sinh reservoir;
- vệ sinh channel;
- vệ sinh DWC tank;
- khử trùng hệ thống;
- vệ sinh dụng cụ;
- vệ sinh/filter cleaning.

## Maintenance

- pump;
- air pump;
- filter;
- lights;
- fan;
- chiller;
- sensor/meter.

Lưu:

- ngày thực hiện;
- người thực hiện;
- thiết bị/khu vực;
- nội dung;
- trạng thái;
- lần bảo trì tiếp theo.

---

# 17. Thiết bị và calibration

Các thiết bị có thể quản lý:

- pH meter
- EC meter
- DO meter
- Temperature sensor
- Humidity sensor
- Light meter
- Pump
- Air pump
- Lighting
- Fan
- Filter
- Chiller

## Calibration

Đặc biệt với pH/EC/DO meter cần lưu:

- device;
- calibration date;
- calibration standard;
- result;
- operator;
- next calibration.

Dữ liệu từ thiết bị không được hiệu chuẩn có thể khiến toàn bộ lịch sử đo thiếu tin cậy.

---

# 18. Thu hoạch

Bắt buộc lưu vì đây là **ground truth cho AI**.

- Harvest date
- Number of plants harvested
- Total fresh weight
- Average fresh weight/plant
- Marketable weight
- Rejected weight
- Loss %
- Grade

Các KPI:

- `g/plant`
- `kg/batch`
- `kg/m²`

Ví dụ:

```text
Batch: LET-2026-001
Harvested plants: 480
Average weight: 190 g/plant
Total harvest: 91.2 kg
```

---

# 19. AI của đề tài

## AI 1 – Yield Prediction (AI chính)

### Mục tiêu

Dự báo:

**Fresh weight tại thu hoạch (g/cây)**

Sau đó hệ thống tính:

**Estimated Batch Yield = Predicted Weight × Expected Harvestable Plants**

### Feature có thể sử dụng

Tùy dataset thực tế:

- crop/cultivar
- age
- growth stage
- pH
- EC
- DO
- water temperature
- air temperature
- humidity
- PPFD/DLI
- water consumption
- nutrient information
- plant density
- leaf count
- plant height
- sample weight

### Output

Ví dụ:

```text
Predicted fresh weight: 190 g/plant
Expected harvestable plants: 480
Estimated batch yield: 91.2 kg
```

### Model có thể thử

- Linear Regression – baseline
- Random Forest
- XGBoost
- SVR
- Neural Network

Đánh giá bằng:

- MAE
- RMSE
- R²

Không chọn model chỉ vì “xịn hơn”; chọn model có kết quả validation/test tốt và giải thích được.

---

# 20. AI 2 – Anomaly Detection / Condition Warning

Có thể dùng:

- pH
- EC
- DO
- water temperature
- air temperature
- humidity
- light
- age/growth stage

Output:

- Normal
- Warning
- High Risk
- anomaly score

Ví dụ:

```text
WARNING

- EC above target
- Water temperature high
- DO low
```

---

# 21. Rule Engine và AI phải tách nhau

Không nên ép mọi cảnh báo thành Machine Learning.

## Rule Engine

Ví dụ:

```text
IF pH < crop_stage.min_pH
→ LOW PH WARNING

IF EC > crop_stage.max_EC
→ HIGH EC WARNING

IF DO < configured_min_DO
→ LOW DO WARNING
```

## AI

Dùng cho:

- Yield Prediction
- Anomaly Detection
- các pattern phức tạp trong dữ liệu

Cách này dễ giải thích và đúng với hệ thống hỗ trợ quyết định.

---

# 22. Dataset đề xuất

## 22.1. Hydroponic Farming Data – Mendeley Data (2025)

Batavia lettuce được theo dõi theo:

- water temperature;
- EC;
- pH;
- ảnh cây.

Dataset có **hơn 390.000 ảnh**, phù hợp:

- Big Data;
- growth prediction;
- anomaly detection;
- computer vision nếu muốn mở rộng.

Link:

https://data.mendeley.com/datasets/g6cm3v3wdp/1

---

## 22.2. Hydroponic Cultivation of Bibb Lettuce in NPK-Limited Conditions – USDA Ag Data Commons (2025)

Bibb lettuce được trồng trong điều kiện giới hạn:

- Nitrogen
- Phosphorus
- Potassium

Dataset có:

- dữ liệu time-series;
- elemental analysis;
- dữ liệu vòng đời cây.

Phù hợp:

- nghiên cứu N/P/K;
- growth/nutrient analysis;
- Data Science.

Link:

https://agdatacommons.nal.usda.gov/articles/dataset/Hydroponic_Cultivation_of_Bibb_Lettuce_in_Nitrogen_Phosphorus_Potassium_NPK_-Limited_Conditions/28801286

---

## 22.3. Multi-Sensor Hydroponic Lettuce Dataset – Zenodo (2026)

Dataset xà lách thủy canh:

- 2 cultivars;
- 3 mức Nitrogen;
- nhiều mức fertigation;
- dữ liệu theo thời gian từ transplant đến harvest;
- ảnh/multisensor/phenotyping.

Dung lượng khoảng **39.1 GB**.

Phù hợp nếu muốn thể hiện rõ yếu tố **Big Data**.

Link:

https://zenodo.org/records/20759414

---

# 23. Bài báo AI tham khảo chính

## Using Machine Learning Models to Predict Hydroponically Grown Lettuce Yield

Frontiers in Plant Science, 2022.

Nghiên cứu thử:

- SVR
- XGBoost
- Random Forest
- Deep Neural Network

Target:

**Fresh lettuce yield / fresh head weight**

Các feature trong nghiên cứu bao gồm:

- leaf number;
- water consumption;
- dry weight;
- stem length;
- stem diameter.

Đây là bằng chứng khoa học trực tiếp cho chức năng AI Yield Prediction của đề tài.

Link:

https://www.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2022.706042/full

---

# 24. Các module phần mềm

## Core – bắt buộc

1. Authentication
2. User & Role Management
3. Farm Management
4. Zone Management
5. Hydroponic System Management
6. Reservoir Management
7. Crop & Cultivar Management
8. Crop Batch Management
9. Nutrient Formula Management
10. Nutrient Mixing/Dosing History
11. Water & Environment Records
12. Crop Observation
13. Harvest Management
14. Alerts
15. AI Prediction
16. Dashboard
17. Reports

## Mở rộng

18. Equipment Management
19. Maintenance
20. Calibration
21. Sanitation
22. Pest/Disease
23. Task/Schedule
24. Cost Management
25. Traceability
26. Mobile App
27. QR Code

---

# 25. User Role

## Admin

- quản lý hệ thống;
- user;
- role/permission;
- cấu hình.

## Farm Manager

- quản lý farm;
- batch;
- kế hoạch;
- thu hoạch;
- báo cáo.

## Agricultural Engineer

- crop;
- nutrient formula;
- pH/EC/DO;
- môi trường;
- quan sát cây;
- cảnh báo;
- kỹ thuật xử lý.

## Worker

- xem task;
- nhập số liệu;
- ghi nhận công việc được giao.

---

# 26. Dashboard nên có

- Active batches
- Total plants
- Batches near harvest
- Current pH
- Current EC
- Current DO
- Water temperature
- Air temperature
- Humidity
- Alerts
- Water usage
- Nutrient usage
- Harvest history
- Yield trend
- AI predicted yield

---

# 27. Report

Xuất Excel/PDF:

- Crop Batch Report
- Nutrient Solution Report
- Water Quality Report
- Environment Report
- Growth Report
- Harvest Report
- Yield Report
- Alert Report
- Nutrient Usage Report
- Water Usage Report

---

# 28. Mobile + QR – phần mở rộng

Mỗi:

- Zone
- System
- Reservoir
- Crop Batch

có thể có QR Code.

Kỹ sư quét QR để xem nhanh:

- cây/giống;
- tuổi;
- growth stage;
- pH;
- EC;
- DO;
- nhiệt độ;
- nutrient formula;
- observation gần nhất;
- ngày thu hoạch;
- AI prediction.

Có thể nhập số liệu ngay trên mobile.

---

# 29. Đơn vị phải chuẩn hóa

| Dữ liệu | Đơn vị |
|---|---|
| Temperature | °C |
| pH | không đơn vị |
| EC | mS/cm |
| DO | mg/L |
| Nutrient concentration | mg/L hoặc ppm |
| Alkalinity | mg/L CaCO3 |
| Water volume | L |
| Flow rate | L/min |
| PPFD | µmol/m²/s |
| DLI | mol/m²/day |
| Humidity | % |
| CO₂ | ppm |
| Plant weight | g |
| Harvest weight | kg |
| Area | m² |
| Yield | kg/m² |

> Không lưu một con số mà không biết đơn vị.

---

# 30. Các entity database quan trọng

Có thể bắt đầu ERD từ các entity:

```text
User
Role
Permission

Farm
Zone

HydroponicSystem
Channel / Raft
Reservoir

Crop
Cultivar
GrowthStage
CropStageRequirement

CropBatch

Nutrient
Fertilizer
NutrientFormula
FormulaIngredient
StockSolution

NutrientMixingEvent
NutrientDosingEvent
WaterTopUpEvent
PHAdjustmentEvent
SolutionReplacementEvent

WaterSource
WaterAnalysis

EnvironmentRecord
WaterQualityRecord

CropObservation
PestDiseaseRecord

Harvest

Equipment
Maintenance
Calibration
Sanitation

Alert
AIPrediction
Report
```

Không nhất thiết phải implement tất cả ngay từ Sprint đầu.

---

# 31. Kiến trúc tổng thể

```text
                    BIG DATA
                       │
                       ▼
              Historical Dataset
                       │
                       ▼
               Data Cleaning / ETL
                       │
               Pandas / PySpark
                       │
                       ▼
                Machine Learning
                       │
                       ▼
                    AI API
                       │
                       ▼
┌──────────────────────────────────────────┐
│                BACKEND                   │
│                                          │
│ Farm / Crop / Batch / Nutrient / Water   │
│ Environment / Harvest / Alert / Report   │
│ AI Integration / Authentication          │
└───────────────────┬──────────────────────┘
                    │
              PostgreSQL/MySQL
                    │
            ┌───────┴───────┐
            ▼               ▼
           WEB            MOBILE
                         (optional)
```

---

# 32. Phân chia 6 thành viên

## 1 Big Data / Data Science

- dataset;
- cleaning;
- EDA;
- feature engineering;
- batch processing;
- train/test;
- model evaluation;
- AI API.

## 2 Backend

- database;
- authentication;
- authorization;
- business API;
- nutrient/environment/harvest;
- AI integration;
- report.

## 2 Frontend

- dashboard;
- CRUD screens;
- chart;
- alert UI;
- AI prediction UI;
- report UI.

## 1 thành viên còn lại

Ưu tiên:

- integration;
- testing;
- DevOps;
- documentation;

Sau khi core ổn mới làm:

- Mobile
- QR

---

# 33. MVP – những gì bắt buộc phải hoàn thành

Để tránh scope quá lớn, phiên bản chính nên ưu tiên:

### Management

- User/Role
- Farm/Zone
- NFT hoặc DWC
- Reservoir
- Crop/Cultivar
- Crop Batch

### Hydroponic Data

- pH
- EC
- DO
- Water Temperature
- Air Temperature
- Humidity
- Nutrient Formula

### Crop

- Growth Observation
- Harvest

### Intelligence

- Rule-based Alerts
- AI Yield Prediction

### Output

- Dashboard
- Chart
- Excel/PDF Report

---

# 34. Phần mở rộng nếu còn thời gian

- hỗ trợ cả NFT + DWC nếu MVP chỉ làm một loại;
- PPFD/DLI;
- CO₂/VPD;
- Water Laboratory Analysis;
- Detailed nutrient ions;
- Pest/Disease;
- AI anomaly detection;
- Equipment;
- Calibration;
- Sanitation;
- Maintenance;
- Cost;
- Traceability;
- Mobile;
- QR;
- IoT sensor integration.

---

# 35. 7 phần phải nhớ khi nói về đề tài

```text
[1] CÂY
Crop + Cultivar + Growth Stage
             ↓
[2] HỆ THỐNG
NFT / DWC + Reservoir
             ↓
[3] NƯỚC
pH + EC + DO + Water Temperature
             ↓
[4] DINH DƯỠNG
N P K Ca Mg S + Micronutrients
             ↓
[5] MÔI TRƯỜNG
Temperature + Humidity + Light
             ↓
[6] SINH TRƯỞNG & THU HOẠCH
Age + Leaf + Weight + kg/batch
             ↓
[7] AI
Yield Prediction + Warning/Anomaly
```

Nếu 7 phần này đúng thì lõi của đề tài đã đúng.

---

# 36. Những lỗi khoa học phải tránh

### Sai 1

> Thủy canh chỉ cần N-P-K.

**Sai.** Còn Ca, Mg, S và các vi lượng thiết yếu.

### Sai 2

> EC cho biết cây thiếu Nitrogen/Potassium bao nhiêu.

**Sai.** EC chỉ phản ánh tổng khả năng dẫn điện/tổng ion hòa tan.

### Sai 3

> Mọi cây dùng cùng pH và EC.

**Sai.** Target phải theo crop/cultivar/growth stage.

### Sai 4

> Có pH là đủ đánh giá nước.

**Sai.** Còn alkalinity, EC và thành phần ion nguồn nước.

### Sai 5

> AI có thể dự báo bệnh dù dataset không có nhãn bệnh.

**Sai.** Không có label bệnh thì chỉ nên cảnh báo điều kiện/rủi ro.

### Sai 6

> Model dùng feature mà dataset không có.

**Sai.** Dataset có dữ liệu gì thì model mới được sử dụng dữ liệu đó.

### Sai 7

> AI dự báo “năng suất tháng sau” cho xà lách.

Nên định nghĩa rõ hơn:

**Dự báo fresh weight tại thời điểm thu hoạch**.

---

# 37. Kết luận

Đề tài cuối cùng có thể mô tả ngắn gọn như sau:

> **Smart Hydroponic Farm Management System** là phần mềm số hóa hoạt động của trang trại thủy canh, quản lý cây trồng, hệ thống NFT/DWC, bể dung dịch, dinh dưỡng, pH, EC, DO, điều kiện môi trường, sinh trưởng và thu hoạch. Dữ liệu lịch sử được xử lý theo hướng Batch Processing và Machine Learning để xây dựng AI dự báo năng suất xà lách tại thời điểm thu hoạch và hỗ trợ phát hiện điều kiện bất thường. Hệ thống đóng vai trò Decision Support System cho người quản lý và kỹ sư nông nghiệp.

---

# 38. Nguồn tài liệu chính

## Kiến thức thủy canh và dinh dưỡng

### Penn State Extension – Essential Nutrients

https://extension.psu.edu/hydroponics-systems-and-principles-of-plant-nutrition-essential-nutrients-function-deficiency-and-excess

### Penn State Extension – Nutrient Solution Programs and Recipes

https://extension.psu.edu/hydroponics-systems-nutrient-solution-programs-and-recipes

### Missouri Extension – Hydroponic Nutrient Solutions

https://extension.missouri.edu/publications/g6984

### Virginia Tech – NFT Systems

https://www.pubs.ext.vt.edu/SPES/spes-463/spes-463.html

### Virginia Tech – DWC Systems

https://www.pubs.ext.vt.edu/SPES/spes-464/spes-464.html

### Virginia Tech – Hydroponic Management Basics

https://www.pubs.ext.vt.edu/SPES/spes-462/spes-462.html

---

## Dataset

### Hydroponic Farming Data – Mendeley

https://data.mendeley.com/datasets/g6cm3v3wdp/1

### USDA – Bibb Lettuce NPK-Limited Dataset

https://agdatacommons.nal.usda.gov/articles/dataset/Hydroponic_Cultivation_of_Bibb_Lettuce_in_Nitrogen_Phosphorus_Potassium_NPK_-Limited_Conditions/28801286

### Zenodo – Multi-Sensor Hydroponic Lettuce

https://zenodo.org/records/20759414

---

## AI / Machine Learning

### Frontiers – Using Machine Learning Models to Predict Hydroponically Grown Lettuce Yield

https://www.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2022.706042/full

---

# 39. Trạng thái tài liệu

Tài liệu này đủ để nhóm bắt đầu:

- hiểu domain thủy canh;
- chốt scope;
- phân tích requirement;
- thiết kế ERD/database;
- thiết kế API;
- thiết kế UI;
- chia task;
- lựa chọn dataset;
- xây pipeline Big Data;
- bắt đầu thử nghiệm model AI.

Khi bước vào implementation, nhóm vẫn cần chốt riêng:

1. **Chọn NFT hay DWC làm MVP.**
2. **Chọn cultivar xà lách cụ thể nếu dataset yêu cầu.**
3. **Dataset AI chính thức.**
4. **Feature thật sự có trong dataset.**
5. **Target AI.**
6. **Danh sách module bắt buộc của Sprint.**
7. **Tech stack cuối cùng.**
8. **ERD/API contract.**

Đó là bước thiết kế dự án, không phải phần kiến thức nền còn thiếu.
