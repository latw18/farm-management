# Paper Summary - Farm Management Project

> Tóm tắt 4 bài báo liên quan đến dự án **Smart Hydroponic Farm Management System**

---

## 📚 Tổng Quan

Đã phân tích 4 bài báo khoa học về hệ thống thủy canh xà lách, được đánh giá theo độ liên quan với dự án:

| #   | Tiêu đề                                                                                | Năm  | Độ liên quan | File                                                                                     |
| --- | -------------------------------------------------------------------------------------- | ---- | ------------ | ---------------------------------------------------------------------------------------- |
| 1   | _(Trống - không có nội dung)_                                                          | -    | ⭐           | -                                                                                        |
| 2   | **Using Machine Learning Models to Predict Hydroponically Grown Lettuce Yield**        | 2022 | ⭐⭐⭐⭐⭐   | [paper-2-machine-learning-lettuce-yield.md](./paper-2-machine-learning-lettuce-yield.md) |
| 3   | **Smart Hydroponic Cultivation System for Lettuce (IoT-based)**                        | 2025 | ⭐⭐⭐⭐     | [paper-3-smart-iot-hydroponic-system.md](./paper-3-smart-iot-hydroponic-system.md)       |
| 4   | **Enhancing Growth, Yield and Physiological Response through NFT System Optimization** | 2025 | ⭐⭐⭐⭐     | [paper-4-nft-optimization-cultivars.md](./paper-4-nft-optimization-cultivars.md)         |

---

## 🎯 Bài Báo Quan Trọng Nhất

### 📊 Bài 2: Machine Learning for Yield Prediction

**Tại sao là core của dự án?**

- Đây là **nền tảng khoa học trực tiếp** cho AI Yield Prediction module
- Chứng minh ML có thể dự báo năng suất xà lách với độ chính xác cao
- Cung cấp roadmap cụ thể cho implementation

**Key findings:**

- 4 models tested: SVR, XGBoost, Random Forest, DNN
- **Best accuracy:** XGBoost (RMSE = 8.88g, R² = 0.94)
- **Recommended:** DNN với 3 features (leaf number, water consumption, dry weight)
- **All models:** Scatter Index < 0.1 = "Excellent"

**Ứng dụng trực tiếp:**

```python
# AI Model Input
features = {
    'leaf_number': 27,
    'water_consumption': 0.32,
    'dry_weight': 18.2
}

# Output
predicted_yield = 329.81  # g/plant
batch_yield = predicted_yield * 480  # kg
```

---

## 🔗 Ma Trận Liên Quan Với Dự Án

| Khía cạnh                 | Bài 2      | Bài 3      | Bài 4      |
| ------------------------- | ---------- | ---------- | ---------- |
| **AI Yield Prediction**   | ⭐⭐⭐⭐⭐ | -          | ⭐⭐⭐     |
| **IoT Architecture**      | -          | ⭐⭐⭐⭐⭐ | -          |
| **NFT System Design**     | ⭐⭐       | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ |
| **Cultivar Selection**    | -          | ⭐⭐       | ⭐⭐⭐⭐⭐ |
| **Database Design**       | ⭐⭐⭐     | ⭐⭐⭐     | ⭐⭐⭐⭐⭐ |
| **Monitoring Strategy**   | ⭐⭐⭐     | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   |
| **Environmental Control** | ⭐⭐       | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   |
| **Cost Analysis**         | -          | ⭐⭐⭐⭐   | -          |

---

## 💡 Key Insights Từ 3 Bài

### 1. AI & Machine Learning (Bài 2)

#### Models & Performance

```
XGBoost:     8.88g RMSE, R² = 0.94  ⭐ Best accuracy
DNN:        11.11g RMSE, R² = 0.93  ⭐ Recommended (fewer features)
SVR:         9.55g RMSE, R² = 0.92
Random Forest: 10.88g RMSE, R² = 0.91
```

#### Features (Scenario 2 - Optimal)

1. **Leaf number** - dễ đo, không phá hủy
2. **Water consumption** - có thể track tự động
3. **Dry weight** - cần sampling định kỳ

#### Implementation Roadmap

```
Phase 1: Linear Regression (baseline)
    ↓
Phase 2: Random Forest (production)
    ↓
Phase 3: XGBoost (optimization)
    ↓
Phase 4: DNN (if more data available)
```

---

### 2. IoT Architecture (Bài 3)

#### 5-Layer Architecture

```
[Physical Layer]
  ├─ Sensors (Temp, RH, CO₂, PPFD)
  ├─ Actuators (Pumps, LEDs, AC, Humidifiers)
  └─ MCU (ATmega2560 + MODBUS RS-485)
        ↓
[Network Layer]
  └─ Wi-Fi + HTTP (5min intervals)
        ↓
[Middleware Layer]
  └─ Data processing
        ↓
[Service Layer]
  └─ ThingSpeak (Cloud storage)
        ↓
[User Experience]
  └─ Web App + Mobile App
```

#### Case Study Results

- **Duration:** 26 days cultivation
- **Data points:** 29,980 entries per variable
- **Energy:** 13.65 kWh/day ($0.80/day)
- **Nutrient optimization:** T75 (75%) recommended

#### Environmental Targets (Validated)

- Temperature: 20±2°C
- Humidity: 60±10% RH
- PPFD: 200±20 µmol/m²/s
- Photoperiod: 14 hours/day

---

### 3. NFT Optimization (Bài 4)

#### System Performance Comparison

| System     | Layout     | Channels | Density | Best Cultivar | Yield              |
| ---------- | ---------- | -------- | ------- | ------------- | ------------------ |
| Module I   | Horizontal | 8        | 26.7/m² | Both          | 11 kg/m²           |
| Module II  | Pyramidal  | 13       | 43.3/m² | Tropicana     | **14.14 kg/m²** ⭐ |
| Module III | Pyramidal  | 10       | 33.3/m² | Tropicana     | **13.96 kg/m²**    |

#### Cultivar Differences (CRITICAL!)

```
Tropicana:
  - Phenotype: Shade avoidance
  - Stem biomass: 80% higher than Starfighter
  - Best yields: 13-14 kg/m²
  - Recommended: Module II or III

Starfighter:
  - Phenotype: Shade tolerance
  - More compact growth
  - Yields: 11-13 kg/m²
  - Performs well in all modules
```

#### Physiological Indicators

- **Total Chlorophyll:** Module II > I > III
- **NR Activity:** Highest in Tropicana + Module II
- **Correlation:** r = 0.548 (p < 0.01)
- **PPFD:** Module II has best light distribution (580 µmol/m²/s)

---

## 🎯 Ứng Dụng Cho Từng Module Dự Án

### 1. Database Design

#### Must-have Fields (từ Bài 4)

```sql
-- Crop table
CREATE TABLE crops (
    id SERIAL PRIMARY KEY,
    common_name VARCHAR(100),
    scientific_name VARCHAR(150),
    cultivar VARCHAR(100) NOT NULL,  -- ⭐ CRITICAL
    supplier VARCHAR(200),
    seed_batch VARCHAR(100),
    heat_tolerance BOOLEAN,
    shade_tolerance VARCHAR(50)
);

-- System table
CREATE TABLE hydroponic_systems (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    type VARCHAR(50),  -- 'NFT', 'DWC'
    layout VARCHAR(50),  -- 'Horizontal', 'Pyramidal'
    channel_count INTEGER,
    plant_capacity INTEGER,
    area DECIMAL(6,2),
    expected_density DECIMAL(5,2)
);
```

### 2. AI Model Features

#### Required Features (từ Bài 2)

```python
# Minimum (Scenario 1)
features_min = [
    'leaf_number',
    'water_consumption'
]

# Recommended (Scenario 2)
features_recommended = [
    'leaf_number',
    'water_consumption',
    'dry_weight'  # sampling needed
]

# Full (Scenario 3)
features_full = [
    'leaf_number',
    'water_consumption',
    'dry_weight',
    'stem_length',
    'stem_diameter'
]

# Extended (from Bài 4)
features_extended = [
    ...features_recommended,
    'cultivar',  # ⭐ Important!
    'system_layout',
    'plant_density',
    'ppfd_avg',
    'chlorophyll',
    'age_days'
]
```

### 3. Monitoring Module

#### Environmental (từ Bài 3)

```javascript
const monitoringFrequency = {
  environmental: "5-10 minutes", // Temp, RH, CO2, PPFD
  water_quality: "daily", // pH, EC, DO, temp
  growth: "every 3 days", // Height, leaves, SPAD
  harvest: "end of batch", // Weight, quality
};

const targets = {
  air_temp: { min: 18, max: 22, unit: "°C" },
  humidity: { min: 50, max: 70, unit: "%RH" },
  ppfd: { min: 180, max: 220, unit: "µmol/m²/s" },
  co2: { min: 350, max: 450, unit: "ppm" },
};
```

### 4. Dashboard KPIs

#### From All Papers

```jsx
<Dashboard>
  {/* Real-time (Bài 3) */}
  <EnvironmentalCard temperature={22} humidity={65} ppfd={210} />

  {/* Growth tracking (Bài 4) */}
  <GrowthMetrics leafCount={27} height={23} chlorophyll={38} />

  {/* AI Prediction (Bài 2) */}
  <YieldForecast
    predicted={329.81} // g/plant
    confidence={0.93} // R²
    batchTotal={158.3} // kg
  />

  {/* Performance (Bài 4) */}
  <SystemComparison>
    Module II: 14.14 kg/m² ⭐ Module III: 13.96 kg/m² Module I: 11.07 kg/m²
  </SystemComparison>
</Dashboard>
```

---

## 📊 Benchmarks & Targets

### Yield Targets (từ Bài 4)

```
Excellent:  12-14 kg/m²
Good:       10-12 kg/m²
Acceptable: 8-10 kg/m²
Poor:       < 8 kg/m²
```

### AI Performance Targets (từ Bài 2)

```
Excellent:  SI < 0.1, R² > 0.90
Good:       SI < 0.2, R² > 0.80
Acceptable: SI < 0.3, R² > 0.70
Poor:       SI > 0.3, R² < 0.70
```

### Environmental Ranges (từ Bài 3 & 4)

```
Temperature:  20-22°C (±2°C acceptable)
Humidity:     60-70% RH (±10% acceptable)
PPFD:         200-600 µmol/m²/s (400-600 optimal)
CO₂:          350-450 ppm (ambient)
pH:           5.5-6.2 (lettuce)
EC:           1.2-2.0 mS/cm (depends on cultivar)
```

---

## 🚀 Implementation Priority

### HIGH PRIORITY (MVP)

1. ✅ **Database:** Store cultivar + system configuration (Bài 4)
2. ✅ **AI Model:** Start with Random Forest, 3 features (Bài 2)
3. ✅ **Monitoring:** Manual input for environmental data (Bài 3)
4. ✅ **Dashboard:** Basic KPIs + AI prediction (All)

### MEDIUM PRIORITY (Phase 2)

5. ✅ **Model Optimization:** Try XGBoost (Bài 2)
6. ✅ **Extended Features:** Add cultivar, system to model (Bài 4)
7. ✅ **Analytics:** Cultivar comparison reports (Bài 4)
8. ✅ **Validation:** Track predicted vs actual (Bài 2)

### LOW PRIORITY (Future)

9. ⚡ **IoT Integration:** Real-time sensors (Bài 3)
10. ⚡ **Advanced Monitoring:** PPFD, chlorophyll meters (Bài 3 & 4)
11. ⚡ **DNN Model:** If sufficient data (Bài 2)
12. ⚡ **Energy Tracking:** Cost optimization (Bài 3)

---

## 📚 Scientific Validation

### Bài 2 - ML Feasibility ✅

> "The DNN model to predict fresh lettuce yield is promising, and it can be applied on a large scale as a rapid tool for decision-makers."

### Bài 3 - IoT Practicality ✅

> "The system was validated through a 26-day case study, recording 29,980 entries per variable, demonstrating stable environmental control."

### Bài 4 - Optimization Evidence ✅

> "Strategic integration of system configuration and cultivar selection can increase physiological efficiency, stabilize yields, and promote sustainability."

---

## ⚠️ Important Warnings

### 1. Cultivar Data is CRITICAL

```diff
- ❌ crop: "Lettuce"
+ ✅ crop: "Lettuce", cultivar: "Tropicana"
```

**Reason:** Same species, different performance (Bài 4)

### 2. System Configuration Matters

```diff
- ❌ Treat all NFT systems equally
+ ✅ Store layout, channel count, density
```

**Reason:** Yield varies 11-14 kg/m² (Bài 4)

### 3. Don't Over-engineer Features

```diff
- ❌ Use all 10+ features immediately
+ ✅ Start with 3 features (Scenario 2)
```

**Reason:** DNN with 3 features = 93% accuracy (Bài 2)

### 4. IoT is Optional for MVP

```diff
- ❌ Must have real-time sensors to start
+ ✅ Manual input works, add IoT later
```

**Reason:** Dataset + ML more important than IoT (All papers)

---

## 🎓 Lessons Learned

### From Paper 2 (ML)

1. Simple models can be very effective
2. Feature selection > Model complexity
3. 70/30 train/test split is standard
4. RMSE < 10g for ~330g average = excellent

### From Paper 3 (IoT)

1. 5-layer architecture is scalable
2. MODBUS RS-485 is reliable for industrial
3. Energy cost: ~$0.027/plant/day
4. T75 (75% nutrients) is cost-effective

### From Paper 4 (Optimization)

1. Cultivar selection is as important as system
2. Pyramidal layout > Horizontal
3. Chlorophyll & NR are yield indicators
4. NFT >> DFT for yield per area

---

## 📖 How to Use These Summaries

### For Backend Team:

- Read **Bài 2** → Understand AI requirements
- Read **Bài 4** → Database schema for cultivar/system
- Implement features from Scenario 2

### For Frontend Team:

- Read **Bài 3** → UI/UX for monitoring
- Read **all** → Understand KPIs to display
- Dashboard widgets from each paper

### For Data Science Team:

- **Start with Bài 2** → Model architecture
- Use Bài 4 → Extended features
- Validation metrics from Bài 2

### For Documentation:

- **Cite all 3 papers** in thesis
- Use figures/tables as references
- Quote key findings (provided in summaries)

---

## 🔗 Quick Links

- [Bài 2 (ML Core)](./paper-2-machine-learning-lettuce-yield.md) - ⭐⭐⭐⭐⭐ Must Read
- [Bài 3 (IoT Reference)](./paper-3-smart-iot-hydroponic-system.md) - ⭐⭐⭐⭐ Important
- [Bài 4 (NFT Optimization)](./paper-4-nft-optimization-cultivars.md) - ⭐⭐⭐⭐ Important

---

## 📅 Last Updated

**Date:** 2026-09-10  
**Status:** Complete analysis of 3/4 papers (Paper 1 was empty)  
**Next Steps:** Begin implementation using insights from these papers

---

**Tóm tắt cuối cùng:**  
Ba bài báo này cung cấp nền tảng khoa học hoàn chỉnh cho dự án: (1) Bài 2 chứng minh ML dự báo năng suất là khả thi với độ chính xác 90-94%, (2) Bài 3 cung cấp kiến trúc IoT 5 lớp đã được validation, và (3) Bài 4 chứng minh cultivar và system configuration ảnh hưởng lớn đến năng suất (11-14 kg/m²) - kết hợp 3 bài này sẽ tạo ra một Smart Hydroponic Farm Management System với AI khoa học và thực tế.
