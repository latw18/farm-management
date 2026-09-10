# Bài báo 3: Smart Hydroponic Cultivation System for Lettuce (IoT-based)

**Nguồn:** Applied System Innovation (MDPI), 2025  
**Tác giả:** Herrera-Arroyo R., Martínez-Nolasco J., et al.  
**Nước:** Mexico  
**Độ liên quan:** ⭐⭐⭐⭐ (LIÊN QUAN CAO - IoT Architecture & System Design)

---

## 🎯 TẠI SAO BÀI NÀY QUAN TRỌNG?

Bài báo này cung cấp **kiến trúc IoT hoàn chỉnh** cho hệ thống thủy canh thông minh, bao gồm:

- Hardware architecture
- Sensor integration
- Control mechanisms
- Data flow
- Web/Mobile applications
- Case study validation với lettuce

Đây là **reference architecture** tốt nếu dự án muốn mở rộng sang IoT real-time monitoring.

---

## 🏗️ KIẾN TRÚC HỆ THỐNG 5 LỚP

### Layer 1: Physical Layer

**Sensors & Equipment**

- Air temperature & RH sensor (JXBS-3001-TH-RS)
- CO₂ sensor (JXBS-3001-CO2-RS, 0-5000 ppm)
- PPF sensor (RS-GH-N01-AL, 0-2500 µmol/m²/s)
- All sensors: IP67 rated, MODBUS RS-485

**Control Mechanisms**

- 4× Ultrasonic humidifiers (2.5L each)
- Full-spectrum LED lamps (Barrina)
- Mini split air conditioner (Mirage X32)
- 12V DC pumps for NFT systems

**Microcontroller**

- ATmega2560 (Arduino-based)
- MODBUS RS-485 protocol
- 1-minute sampling interval
- ON/OFF control with hysteresis

### Layer 2: Network Layer

- IoT module with Wi-Fi
- HTTP protocol
- Data transmission every 5 minutes
- Email alerts for failures (>30 min offline)

### Layer 3: Middleware Layer

_(Not detailed in paper)_

### Layer 4: Service Layer

- **ThingSpeak platform** for data storage
- Real-time data visualization
- Historical data analysis

### Layer 5: User Experience Layer

- **Responsive web application**
- **Android mobile application**
- Real-time monitoring
- Setpoint modification
- Data export functionality

---

## 🌱 PLANT GROWTH CHAMBER

### Specifications

- **Dimensions:** 3m × 2m × 2.5m (L×W×H)
- **Wall treatment:** Latex paint (anti-fungal)
- **Extended surface:** 75cm depth for NFT systems

### Controlled Variables

- Air temperature: 20±2°C
- Relative humidity: 60±10% RH
- CO₂: ~400 ppm (lower due to photosynthesis)
- PPF: 200±20 µmol/m²/s
- Photoperiod: 14 hours/day

### Additional Features

- Video surveillance (Wi-Fi camera)
- Energy monitoring (PZEM-004T sensors)
- Remote access via mobile app

---

## 💧 NFT HYDROPONIC SYSTEM

### Design

- **2 channels** per system (trapezoidal PVC)
- **10 planting cavities** (5 per channel, 20cm spacing)
- **2% slope** for proper flow
- **3D printed** custom components
- **Dimensions:** 100cm × 50cm × 27cm

### Components

- 20L nutrient solution tank
- 12V DC diaphragm pump (3.5 L/min, 0.48 MPa)
- 10mm diameter hoses
- CPVC support frame
- Return pipe for recirculation

### Three Systems in Chamber

- **T100:** 100% nutrient concentration
- **T75:** 75% nutrient concentration
- **T50:** 50% nutrient concentration

---

## 🧪 CASE STUDY: LETTUCE CULTIVATION

### Experimental Design

- **Duration:** 26 days (3 June - 29 June 2024)
- **Cultivar:** Lactuca sativa 'Rodhenas'
- **Sample size:** 10 plants per treatment
- **Total:** 30 plants (3 treatments)

### Nutrient Solution

- **Base:** Steiner formulation (Soluponics)
- **pH:** Adjusted to 6.0 with HNO₃

| Treatment | Steiner A/B | EC (µS/cm) |
| --------- | ----------- | ---------- |
| T100      | 5 mL/L      | 1970       |
| T75       | 3.75 mL/L   | 1621       |
| T50       | 2.5 mL/L    | 1272       |

### Monitored Parameters

**Daily manual measurements:**

- pH
- EC
- TDS
- Water temperature

**Continuous monitoring:**

- Air temperature
- RH
- CO₂
- PPF

### Growth Measurements (Every 3 days)

- SPAD index (chlorophyll)
- Plant height
- Leaf count
- Root length
- Stem diameter

### Harvest Metrics (26 DAT)

- Fresh weight (total & components)
- Dry weight (70°C, 72h)
- Leaf water mass
- **7 plants harvested per treatment**

---

## 📊 RESULTS

### Phenotypic Variables

**NO significant differences** between treatments for:

- Plant height (21-23.5 cm)
- Root length (39-42.5 cm)
- Stem diameter (16.5-18.1 cm)
- Number of leaves (19.8-22.5)
- Fresh leaf mass (155-180g)
- Chlorophyll content (SPAD: 36.9-38.9)

**Significant differences** for:

- **Dry leaf mass:** T100 > T75 > T50
  - T100: 14.70g ✅
  - T75: 8.11g
  - T50: 9.89g
- Fresh root mass: T75 highest (25.00g)

### Biochemical Analysis (per 100g)

| Nutrient      | T50   | T75         | T100        | USDA Iceberg |
| ------------- | ----- | ----------- | ----------- | ------------ |
| Carbohydrates | 2.95  | 3.02        | **3.26**    | 3.37         |
| Proteins      | 0.59  | 0.86        | **1.29** ✅ | 0.74         |
| Fats          | 0.10  | 0.13        | 0.17        | 0.07         |
| Moisture      | 96.36 | 95.98       | 95.27       | 95.5         |
| Fiber         | 1.97  | **2.18** ✅ | 2.05        | 1.2          |

**Key findings:**

- T75 provides best balance (resource efficiency + quality)
- T100 highest dry mass & protein
- All treatments exceeded USDA benchmarks for fiber
- Higher moisture due to hydroponic method

---

## ⚡ ENERGY CONSUMPTION

### Daily Energy Usage (24h)

- **Total:** 13.65 kWh
- **Cost:** $0.80 USD/day (@$0.058/kWh)
- **Per plant:** $0.027 USD/day

### Breakdown

| Component        | kWh  | %   |
| ---------------- | ---- | --- |
| Air conditioning | 7.22 | 53% |
| LED lamps        | 3.82 | 28% |
| Pumps            | 1.78 | 13% |
| Humidifiers      | 0.83 | 6%  |

**Optimization notes:**

- AC is highest consumer (thermal regulation)
- LED on 14h photoperiod
- Consider off-peak electricity rates

---

## 💻 SOFTWARE IMPLEMENTATION

### Control Logic Example (Humidity)

```cpp
void control_humedad() {
    if (Humedad < hum_min) {
        digitalWrite(HUMID, LOW);  // Activate
    } else if (Humedad > hum_max) {
        digitalWrite(HUMID, HIGH); // Deactivate
    }
}
```

### Data Flow

1. **Sensors** → ATmega2560 (1 min interval)
2. **Microcontroller** → IoT module (5 min HTTP)
3. **ThingSpeak** → Cloud storage
4. **Web/Mobile App** → User interface

### Alert System

- Email notification if offline > 30 min
- Real-time alerts for out-of-range values
- Video monitoring via Tuya Smart app

---

## 🎯 ỨNG DỤNG CHO DỰ ÁN

### 1. IoT Architecture Reference

```
Phần mềm hiện tại (Manual input)
            ↓
     Có thể mở rộng
            ↓
IoT Integration (như bài báo)
```

**Nếu có budget:**

- Add sensor layer
- Real-time data ingestion
- Automated data collection
- Remote monitoring

### 2. Control Mechanisms

Dự án có thể implement rules:

```
IF temperature > max_temp
    → SEND ALERT

IF EC < min_EC
    → WARN "Check nutrient solution"

IF humidity < min_humidity
    → SUGGEST "Activate humidifiers"
```

### 3. Data Collection Design

**Frequency recommendations:**

- Environmental: Every 5-10 minutes
- Water quality: Daily manual or hourly auto
- Growth: Every 3 days
- Harvest: End of batch

### 4. Energy Monitoring

Track:

- Power consumption per system
- Cost per batch
- Efficiency metrics
- Optimization opportunities

---

## 📚 KEY INSIGHTS CHO NHÓM

### 1. System Design

✅ **Modular approach works**

- Separate systems for different treatments
- Independent control
- Easy to scale

✅ **MODBUS RS-485 is reliable**

- Industrial-grade communication
- Up to 32 devices on one bus
- 1200m range

### 2. Environmental Control

✅ **Critical parameters identified**

- Temperature: 20±2°C
- Humidity: 60±10% RH
- Light: 200 µmol/m²/s, 14h/day
- These targets can be used in dự án

### 3. Nutrient Management

✅ **T75 is optimal for resource efficiency**

- Similar growth to T100
- 25% less nutrients
- Lower cost
- Competitive quality

### 4. Data Architecture

✅ **5-layer IoT model is scalable**

- Start simple (manual input)
- Add layers as needed
- Clear separation of concerns

---

## 🚀 IMPLEMENTATION ROADMAP

### Phase 1: MVP (Current)

- Manual data entry
- Dashboard visualization
- Basic alerts (rule-based)

### Phase 2: Semi-automated

- Excel/CSV import
- Scheduled data sync
- Enhanced analytics

### Phase 3: IoT Integration (Future)

- Add sensor layer
- Real-time monitoring
- Automated control
- Mobile notifications

### Phase 4: Advanced (Optional)

- Computer vision (plant images)
- Predictive maintenance
- Advanced AI models
- Multi-farm deployment

---

## 📝 TECHNICAL SPECIFICATIONS

### Sensors Used (Reference)

| Type    | Model            | Range              | Interface |
| ------- | ---------------- | ------------------ | --------- |
| Temp/RH | JXBS-3001-TH-RS  | -40-80°C, 0-100%RH | RS-485    |
| CO₂     | JXBS-3001-CO2-RS | 0-5000 ppm         | RS-485    |
| Light   | RS-GH-N01-AL     | 0-2500 µmol/m²/s   | RS-485    |

### Control Equipment

| Type       | Model                  | Specs          |
| ---------- | ---------------------- | -------------- |
| AC         | Mirage X32             | Inverter-type  |
| LED        | Barrina INWT80421265Ec | Full-spectrum  |
| Pump       | TOPINCN                | 12V, 3.5 L/min |
| Humidifier | Bontill UH200          | 2.5L capacity  |

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Cost Considerations

- Initial IoT setup: High investment
- Sensors: $50-200 each
- Microcontroller: $20-50
- Cloud service: Recurring cost
- **ROI depends on scale**

### 2. Maintenance

- Sensor calibration required
- Equipment cleaning/replacement
- Software updates
- Network reliability

### 3. Data Privacy

- Cloud storage security
- User authentication
- Data ownership
- GDPR compliance (if applicable)

### 4. Scalability

- MODBUS limit: 32 devices/bus
- Wi-Fi range constraints
- Server load with multiple farms
- Database optimization needed

---

## 🔗 INTEGRATION WITH PROJECT

### Backend

```python
# IoT data ingestion endpoint
POST /api/iot/sensor-data
{
    "system_id": "NFT-001",
    "temperature": 22.5,
    "humidity": 65,
    "co2": 420,
    "ppfd": 210,
    "timestamp": "2025-06-15T10:30:00Z"
}
```

### Database Schema Addition

```sql
-- IF implementing IoT
CREATE TABLE sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    system_id INTEGER REFERENCES systems(id),
    temperature DECIMAL(4,2),
    humidity DECIMAL(4,2),
    co2 DECIMAL(6,2),
    ppfd DECIMAL(6,2),
    timestamp TIMESTAMP,
    sensor_id VARCHAR(50)
);

CREATE INDEX idx_sensor_time ON sensor_readings(system_id, timestamp);
```

### Dashboard Widget

```jsx
// Real-time sensor card
<SensorCard>
  <Temperature value={22.5} unit="°C" status="normal" />
  <Humidity value={65} unit="%" status="normal" />
  <CO2 value={420} unit="ppm" status="normal" />
  <Light value={210} unit="µmol/m²/s" status="normal" />
  <LastUpdate>{5} minutes ago</LastUpdate>
</SensorCard>
```

---

## 🎓 SCIENTIFIC CONTRIBUTIONS

1. **Validated IoT architecture** for controlled environment
2. **Energy efficiency analysis** of hydroponic systems
3. **Nutrient optimization study** (T75 recommended)
4. **Complete case study** from setup to harvest
5. **Open-source potential** (ATmega + MODBUS + ThingSpeak)

---

## 📖 CITATIONS FOR REPORT

> "The system's operation was verified through a 26-day case study. Data for environmental variables were recorded at 5 min synchronization intervals, resulting in 29,980 entries per variable."

> "The treatment with 75% nutrient concentration provides an appropriate balance between resource use and nutritional quality, without affecting the chlorophyll content."

> "The total energy expenditure for one day of system operation was 13.65 kWh, of which 53% (7.22 kWh) was attributed to air conditioning."

---

**Tóm tắt 1 câu:**  
Bài báo này trình bày kiến trúc IoT 5 lớp hoàn chỉnh cho hệ thống thủy canh thông minh, từ sensors đến web/mobile apps, đã được validation qua case study với 3 mức nồng độ dinh dưỡng (khuyến nghị 75% cho hiệu quả tối ưu), tiêu thụ 13.65 kWh/ngày và ghi nhận gần 30,000 data points - đây là reference architecture tốt nếu dự án muốn mở rộng sang IoT real-time.
