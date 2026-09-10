# HydroSmart Frontend - Hệ Thống Quản Lý Thủy Canh & Dự Báo AI

Ứng dụng web quản lý trang trại thủy canh NFT (*Nutrient Film Technique*) chuyên canh rau xà lách, tích hợp mô hình dự báo năng suất cây trồng bằng trí tuệ nhân tạo (AI).

---

## ⚡ Hướng Dẫn Cài Đặt & Khởi Chạy (Quick Start)

### 1. Yêu cầu môi trường
- **Node.js**: Phiên bản `>= 18.0.0`
- **npm**: `>= 9.0.0`

### 2. Cài đặt các gói thư viện
```bash
npm install
```

### 3. Khởi chạy máy chủ phát triển (Dev Server)
```bash
npm run dev
```
Truy cập giao diện tại: **[http://localhost:5173](http://localhost:5173)**

### 4. Kiểm tra mã nguồn (Linting)
```bash
npm run lint
```

### 5. Đóng gói cho môi trường Production (Build)
```bash
npm run build
```
Bản build tĩnh tối ưu sẽ được xuất ra thư mục `dist/`.

### 6. Chạy thử bản Build Production (Preview)
```bash
npm run preview
```

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler / Dev Server**: [Vite](https://vitejs.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/) (Hỗ trợ URL deep-link cho từng trang)
- **Biểu đồ dữ liệu**: [Recharts](https://recharts.org/)
- **Bộ Icon**: [Lucide React](https://lucide.dev/)
- **Thiết kế giao diện**: Vanilla CSS Design System (Clean SaaS Light Mode, chuẩn WCAG, tối ưu trên màn hình máy tính & tablet)

---

## 🧭 Cấu Trúc Mã Nguồn (Project Structure)

```text
frontend/
├── public/               # Static assets & icons
├── src/
│   ├── assets/          # Hình ảnh minh họa & logo
│   ├── components/      # Component dùng chung (Header, Sidebar)
│   ├── mock/            # Dữ liệu khởi tạo & LocalStorage Store (State management)
│   │   ├── initialData.ts
│   │   └── store.ts
│   ├── services/        # Logic AI dự báo năng suất & khuyến nghị nông học
│   │   └── aiPredictor.ts
│   ├── styles/          # Hệ thống CSS Design Tokens & Reset
│   │   ├── global.css
│   │   └── variables.css
│   ├── types/           # Định nghĩa kiểu dữ liệu TypeScript (Farm, Batch, Reservoir...)
│   │   └── farm.ts
│   ├── views/           # Các màn hình chức năng chính
│   │   ├── DashboardView.tsx    # /dashboard
│   │   ├── ReservoirsView.tsx   # /reservoirs
│   │   ├── BatchesView.tsx      # /batches
│   │   ├── AIPredictorView.tsx  # /forecast
│   │   ├── AlertsView.tsx       # /alerts
│   │   └── HarvestView.tsx      # /harvest
│   ├── App.tsx          # Router cấu hình & Điều hướng chính
│   ├── index.css        # Core styles & Layout
│   └── main.tsx         # Điểm khởi chạy React DOM
├── package.json
└── vite.config.ts
```

---

## 📋 Danh Sách Các Route Chính

- `/dashboard`: Bảng điều khiển trung tâm trang trại
- `/reservoirs`: Quản lý bồn tuần hoàn NFT 01, 02 & công cụ châm Stock A/B
- `/batches`: Quản lý danh sách lô xà lách & nhật ký sinh trưởng
- `/forecast`: Mô hình AI dự báo năng suất (Dữ liệu thực tế & Mô phỏng What-If)
- `/alerts`: Trung tâm theo dõi và khắc phục sự cố nồng độ dinh dưỡng / oxy rễ
- `/harvest`: Lịch sử thu hoạch và đánh giá độ chuẩn xác của mô hình
