# Bài báo 2: Using Machine Learning Models to Predict Hydroponically Grown Lettuce Yield

**Nguồn:** Frontiers in Plant Science, 2022  
**Link:** https://www.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2022.706042/full  
**Tác giả:** Mokhtar A., El-Ssawy W., et al.  
**Độ liên quan:** ⭐⭐⭐⭐⭐ (RẤT LIÊN QUAN - Core AI của dự án)

---

## 🎯 TẠI SAO BÀI NÀY QUAN TRỌNG NHẤT?

Bài báo này là **nền tảng khoa học trực tiếp** cho chức năng AI Yield Prediction của dự án. Đây là bằng chứng rõ ràng nhất về việc sử dụng Machine Learning để dự báo năng suất xà lách thủy canh.

---

## 📊 THÔNG TIN NGHIÊN CỨU

### Mục tiêu

Dự báo **fresh head weight (yield)** của xà lách thủy canh sử dụng 4 mô hình Machine Learning

### Hệ thống trồng

- 3 hệ thống thủy canh khác nhau:
  - Suspended NFT system
  - Pyramidal aeroponic system
  - Tower aeroponic system
- Tương tác với 3 mức độ từ trường khác nhau
- Môi trường greenhouse được kiểm soát
- Thời gian: 2018-2019

### Cultivar

- Lettuce cv. LimorHyb
- Thu hoạch sau 50 ngày

---

## 🤖 4 MÔ HÌNH MACHINE LEARNING

### 1. SVR - Support Vector Regressor

- Sử dụng kernel RBF và linear
- Regularization parameter C: 1-5

### 2. XGB - Extreme Gradient Boosting

- 400 trees
- Max depth: 10
- Learning rate: 0.1

### 3. RF - Random Forest

- 400 trees
- Max depth: 10

### 4. DNN - Deep Neural Network

- 4 hidden layers: 256, 128, 128, 64 neurons
- Activation: ReLU
- 500 epochs

---

## 📈 INPUT VARIABLES - 3 SCENARIOS

### Scenario 1 (Tối thiểu)

- Leaf number
- Water consumption

### Scenario 2 (Trung bình)

- Leaf number
- Water consumption
- Dry weight

### Scenario 3 (Đầy đủ)

- Leaf number
- Water consumption
- Dry weight
- Stem length
- Stem diameter

---

## 🏆 KẾT QUẢ CHÍNH

### Model Performance (RMSE - g)

| Model | Scenario 1 | Scenario 2  | Scenario 3    |
| ----- | ---------- | ----------- | ------------- |
| XGB   | Cao nhất   | 10.21 g     | **8.88 g** ✅ |
| SVR   | 11.52 g    | 10.55 g     | **9.55 g**    |
| DNN   | 12.21 g    | **11.11 g** | 11.55 g       |
| RF    | 12.89 g    | 11.54 g     | 10.88 g       |

### Best Models

1. **XGB với Scenario 3** - RMSE thấp nhất (8.88g), R² = 0.94
2. **DNN với Scenario 2** - Cần ít features hơn, RMSE = 11.11g, R² = 0.93

### Scatter Index (SI)

- **TẤT CẢ models < 0.1** → được đánh giá là "EXCELLENT"
- SI = RMSE / Average observed yield

---

## 🎓 KẾT LUẬN QUAN TRỌNG

### 1. Lựa chọn Model

- **XGB Scenario 3**: Chính xác nhất nhưng cần nhiều features
- **DNN Scenario 2**: **ĐƯỢC KHUYẾN NGHỊ** vì:
  - Chính xác tốt (R² = 0.93)
  - Cần ít features hơn (3 thay vì 5)
  - Thực tế hơn trong triển khai

### 2. Features quan trọng

Theo thứ tự ưu tiên:

1. **Leaf number** ✅
2. **Water consumption** ✅
3. **Dry weight** ✅
4. Stem length
5. Stem diameter

### 3. Độ chính xác

- Average observed yield: ~330g/plant
- RMSE tốt nhất: 8.88g (~2.7% error)
- MAE tốt nhất: 7.1g

---

## 💡 ỨNG DỤNG CHO DỰ ÁN

### 1. AI Yield Prediction Module

```
Input Features (Scenario 2 - Recommended):
- Leaf number
- Water consumption
- Dry weight

Output:
- Predicted fresh weight (g/plant)
- Estimated batch yield = Weight × Expected plants
```

### 2. Data Requirements

Dataset cần có:

- Đo định kỳ: leaf count, water consumption
- Lấy mẫu: dry weight (không cần nhiều)
- Target: fresh head weight tại thu hoạch

### 3. Model Selection

Khuyến nghị bắt đầu với:

1. **Linear Regression** - baseline
2. **Random Forest** - dễ implement
3. **XGBoost** - nếu muốn tối ưu
4. **DNN** - nếu có đủ data và compute

### 4. Evaluation Metrics

- **RMSE** (g/plant) - chính
- **MAE** (g/plant)
- **R²** - correlation
- **SI** (Scatter Index) - classification

---

## 📊 DATASET TRAINING DETAILS

### Sample Collection

- 3 plants/system
- 50 days after transplanting
- 2 years data (2018-2019)

### Data Split

- **Training: 70%**
- **Testing: 30%**

### Features Statistics

| Feature               | Mean       | Max        | Min        | SD        |
| --------------------- | ---------- | ---------- | ---------- | --------- |
| Stem diameter         | 22.05      | 28.20      | 17.00      | 2.84      |
| Leaf number           | 26.88      | 37.00      | 21.00      | 3.51      |
| Stem length           | 41.15      | 52.00      | 32.00      | 4.28      |
| Dry weight            | 18.20      | 27.90      | 13.10      | 3.17      |
| Water/area            | 0.32       | 0.42       | 0.25       | 0.05      |
| **Fresh head weight** | **329.81** | **416.20** | **275.20** | **36.48** |

---

## 🚀 IMPLEMENTATION ROADMAP

### Phase 1: Baseline

- Implement Linear Regression
- Use Scenario 1 (leaf + water)
- Establish RMSE baseline

### Phase 2: Advanced

- Implement Random Forest
- Add dry weight (Scenario 2)
- Compare performance

### Phase 3: Optimization

- Try XGBoost
- Hyperparameter tuning
- Cross-validation

### Phase 4: Deep Learning (Optional)

- Implement DNN
- Requires more data
- Higher computational cost

---

## 📚 KEY TAKEAWAYS CHO NHÓM

1. **Feasibility proof** ✅
   - ML dự báo yield xà lách thủy canh là khả thi
   - Đã có nghiên cứu peer-reviewed

2. **Practical approach** ✅
   - Không cần nhiều sensors phức tạp
   - 3 features cơ bản đã đủ (Scenario 2)

3. **Performance target** ✅
   - R² > 0.90 là tốt
   - RMSE < 10g/plant là excellent
   - SI < 0.1 là excellent

4. **Model choice** ✅
   - Bắt đầu đơn giản (Linear/RF)
   - XGBoost cho optimization
   - DNN nếu có nhiều data

5. **Feature engineering** ✅
   - Leaf number - dễ đo
   - Water consumption - có thể track
   - Dry weight - cần sampling

---

## 🎯 DIRECT QUOTES

> "The DNN model to predict fresh lettuce yield is promising, and it can be applied on a large scale as a rapid tool for decision-makers to manage crop yield."

> "All model scenarios having Scatter Index (SI) values less than 0.1 were classified as excellent in predicting fresh lettuce yield."

> "The two best models were SVR with scenario 3 and DNN with scenario 2. However, DNN with scenario 2 requiring less input variables is preferred."

---

## 🔗 LIÊN KẾT VỚI CÁC PHẦN KHÁC

### Backend Integration

- API endpoint: `/api/predictions/yield`
- Input: batch ID, current measurements
- Output: predicted yield + confidence

### Frontend Display

- Dashboard widget: "AI Yield Forecast"
- Batch detail page: prediction timeline
- Comparison: predicted vs actual

### Database

```sql
Table: ai_predictions
- batch_id
- prediction_date
- predicted_weight_per_plant
- estimated_total_yield
- model_used
- confidence_score
- features_used (JSON)
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Dataset dependency**
   - Model chỉ tốt nếu training data đại diện
   - Cần data từ cùng loại system (NFT/DWC)
   - Cùng cultivar hoặc tương tự

2. **Feature availability**
   - Đảm bảo có thể đo/thu thập features
   - Dry weight cần sampling (destructive)
   - Water consumption cần flow meter hoặc tracking

3. **Model maintenance**
   - Cần retrain khi có data mới
   - Monitor prediction accuracy
   - Update nếu performance giảm

4. **Validation**
   - Luôn so sánh predicted vs actual
   - Tính RMSE/MAE trên production data
   - Adjust model nếu cần

---

**Tóm tắt 1 câu:**  
Bài báo này chứng minh Machine Learning (đặc biệt XGBoost và DNN) có thể dự báo chính xác năng suất xà lách thủy canh với chỉ 3-5 features đơn giản, đạt R² > 0.90 và RMSE < 10g/plant, đây là nền tảng khoa học trực tiếp cho AI module của dự án.
