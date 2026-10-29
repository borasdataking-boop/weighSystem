# TÀI LIỆU CẤU TRÚC THƯ MỤC HỆ THỐNG QUẢN LÝ TRẠM CÂN (PHAN BACH MANAGEMENT SYSTEM)

Tài liệu này giải thích cấu trúc mã nguồn được phân rã từ file mẫu HTML sang hệ thống linh kiện React/TypeScript (`.tsx`) chuẩn doanh nghiệp.

---

## 1. Cấu Trúc Tổng Quan

```
webDesignUI/
├── weighStation.html                  # Bản HTML tĩnh Quản lý Trạm Cân (chạy độc lập)
├── process.html                       # Bản HTML tĩnh Quản lý Quy Trình (chạy độc lập, tab thứ 2)
├── logo.png                           # File logo gốc
├── processflow.jpg                    # Sơ đồ quy trình công nghệ chuẩn nhà máy
├── skill.md                           # Quy chuẩn tư duy UX/UI & 5 câu hỏi cốt lõi
│
└── src/                               # CẤU TRÚC MODULE HOÁ CHUẨN (REACT / TYPESCRIPT .TSX)
    │
    ├── types/                         # Định nghĩa kiểu dữ liệu (Data Models / DTOs)
    │   ├── station.types.ts           # Kiểu dữ liệu trạm cân (StationWeigh, Status, Protocol...)
    │   ├── process.types.ts           # Kiểu dữ liệu công đoạn chế biến (ProcessStage, Step...)
    │   ├── product.types.ts           # Kiểu dữ liệu danh mục sản phẩm (ProductItem, ProductType...)
    │   └── log.types.ts               # Kiểu dữ liệu nhật ký cân (production_weight_logs, IN/OUT/WiP/Yield)
    │
    ├── services/                      # Tầng giao tiếp dữ liệu (API / Storage Abstraction)
    │   ├── stationService.ts          # CRUD trạm cân, cấu hình IoT, gán/thu hồi cân
    │   ├── processService.ts          # CRUD công đoạn, đồ thị DAG, thuật toán BFS kiểm tra vòng lặp
    │   ├── productService.ts          # CRUD danh mục 34 sản phẩm, lọc theo khâu, sinh mã tự động
    │   └── logService.ts              # Quản lý mẻ cân, tính toán IN/OUT, WiP & % Yield toàn chuyền
    │
    ├── components/                    # Các linh kiện giao diện tái sử dụng (.tsx)
    │   ├── layout/
    │   │   └── Header.tsx             # Thanh tiêu đề đỏ chuẩn ảnh chụp (Logo + Nav + User)
    │   ├── common/
    │   │   ├── StatusBadge.tsx        # Huy hiệu trạng thái kết nối (Online / Offline / Hiệu chuẩn)
    │   │   └── Toast.tsx              # Hộp thông báo nổi trực quan (không emoji, dùng SVG)
    │   ├── overview/                  # Module Tổng Quan Dây Chuyền Sản Xuất
    │   │   ├── ProductionKPICards.tsx # 4 thẻ chỉ số IN, WiP, OUT & % Yield
    │   │   ├── VisualPipelineFlow.tsx # Sơ đồ trực quan dòng chảy 4 cụm & Yield theo lô
    │   │   ├── ProductionLogTable.tsx # Bảng log chuẩn 100% pgAdmin 4 (production_weight_logs)
    │   │   └── AddLogModal.tsx        # Modal ghi nhận / giả lập mẻ cân mới
    │   ├── stations/                  # Module Quản lý Trạm Cân
    │   │   ├── KPICards.tsx           # 4 thẻ chỉ số nhanh
    │   │   ├── FilterToolbar.tsx      # Thanh công cụ: đổi view, tìm kiếm, lọc
    │   │   ├── StationTable.tsx       # Bảng danh sách trạm cân chi tiết
    │   │   ├── StationCard.tsx        # Thẻ cân trong sơ đồ công đoạn
    │   │   ├── StationPipeline.tsx    # Sơ đồ sắp xếp cân theo công đoạn
    │   │   ├── AddScaleModal.tsx      # Modal thêm mới và chỉnh sửa thông số trạm cân
    │   │   └── DeleteScaleModal.tsx   # Modal xác nhận xoá trạm cân an toàn
    │   └── process/                   # Module Quản lý Quy Trình Chế Biến
    │       ├── ProcessKPICards.tsx    # 4 thẻ chỉ số quy trình
    │       ├── ProcessFlowDiagram.tsx # Sơ đồ luồng chuyền 10 bước x 15 công đoạn
    │       ├── ProcessTable.tsx       # Bảng danh sách 15 công đoạn chi tiết
    │       ├── AddProcessModal.tsx    # Modal thêm / sửa công đoạn
    │       ├── ProcessDetailModal.tsx # Modal chi tiết khâu & điều phối trạm cân
    │       └── ProcessImageModal.tsx  # Lightbox xem sơ đồ gốc processflow.jpg
    │
    └── pages/
        ├── OverviewPage.tsx           # Màn hình Tổng quan dây chuyền & Bảng log mẻ cân
        ├── WeighStationPage.tsx       # Màn hình Quản lý Trạm Cân
        ├── ProcessPage.tsx            # Màn hình Quản lý Quy Trình Chế Biến
        └── ProductPage.tsx            # Màn hình Quản lý Danh Mục Sản Phẩm
```

---

## 2. Ý Nghĩa Của Từng Thư Mục

| Thư mục | Vai trò trong hệ thống |
| :--- | :--- |
| **`types/`** | Định nghĩa cấu trúc dữ liệu theo đúng chuẩn Database PostgreSQL (`PMSL.sql`), giúp bắt lỗi sai tên thuộc tính ngay khi viết code. |
| **`services/`** | Nơi xử lý dữ liệu. Hiện tại đang lưu vào `localStorage`, khi kết nối với Backend chỉ cần đổi sang gọi `fetch('/api/stations')` mà không phải sửa lại giao diện. |
| **`components/layout/`** | Thanh Header màu đỏ dùng chung cho tất cả các trang (*Tổng quan, Trạm cân, Quy trình, Sản phẩm, Nhân sự, Báo cáo*). |
| **`components/stations/`** | Các khối linh kiện độc lập của trang Quản lý Trạm Cân (Bảng, Thẻ, Modal, Pipeline). |
| **`pages/`** | Màn hình hoàn chỉnh điều phối các linh kiện và trạng thái ứng dụng.

---

## 3. Hướng Dẫn Khởi Chạy Hệ Thống

Dự án là một hệ thống Full-stack khép kín hoàn chỉnh nằm trọn trong thư mục `webDesignUI`:

### Bước 1: Khởi động cơ sở dữ liệu (PostgreSQL)
Đảm bảo dịch vụ PostgreSQL đang chạy:
```bash
brew services start postgresql@18
# Khởi tạo DB & nạp dữ liệu mẫu (chỉ cần chạy lần đầu):
npm run db:init
npm run db:seed
```

### Bước 2: Chạy Backend API & TCP Socket
```bash
# Build & chạy server API (cổng 5001) và TCP IoT (cổng 8000):
npm run server:build
npm run server
```

### Bước 3: Chạy Frontend Dashboard
```bash
# Khởi chạy giao diện React Vite (cổng 3000):
npm run dev
```
Truy cập giao diện tại: **`http://localhost:3000`**
