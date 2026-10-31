# TÀI LIỆU CẤU TRÚC HỆ THỐNG QUẢN LÝ TRẠM CÂN (PHAN BACH WEIGH DASHBOARD)

Hệ thống quản lý sản xuất, trạm cân công nghiệp và giám sát mẻ cân IoT thời gian thực cho nhà máy chế biến thủy sản Phan Bách. Hệ thống được module hóa chuẩn mực, hỗ trợ chạy linh hoạt trên **PythonAnywhere (WSGI)**, môi trường **Python cục bộ**, hoặc **Node.js / PostgreSQL**.

---

## 1. Cấu Trúc Thư Mục Chuẩn Hóa

```text
webDesignUI/
├── backend/                           # TẦNG MÁY CHỦ DỊCH VỤ (BACKEND)
│   ├── app.py                         # Máy chủ Flask (REST API + Phục vụ SPA React)
│   ├── wsgi.py                        # Entry point chuẩn WSGI cho production
│   ├── pythonanywhere_wsgi.py         # Mẫu cấu hình WSGI dán trực tiếp trên PythonAnywhere
│   ├── config.py                      # Quản lý cấu hình & biến môi trường
│   ├── db.py                          # Kết nối Database thống nhất (PostgreSQL & SQLite)
│   ├── services.py                    # Nghiệp vụ: Quy trình, Trạm cân, Sản phẩm, Mẻ cân, KPI
│   ├── iot_service.py                 # Ingestion dữ liệu mẻ cân từ STM32/Dini Argeo (Debounce)
│   ├── protocol_parser.py             # Bộ giải mã chuỗi ASCII đầu cân Dini Argeo
│   ├── requirements.txt               # Thư viện Python cần thiết (Flask, CORS, psycopg2,...)
│   ├── .env.example                   # Mẫu cấu hình môi trường
│   ├── node/                          # Máy chủ Node.js / TypeScript gốc (kèm TCP socket)
│   │   ├── src/                       # Mã nguồn TypeScript server
│   │   └── dist/                      # Bản build server.cjs
│   └── stm32_firmware_sample/         # Mã nguồn mẫu firmware C cho vi điều khiển STM32
│
├── database/                          # TẦNG CƠ SỞ DỮ LIỆU
│   ├── init_db.sql                    # Schema PostgreSQL chuẩn (bảng, chỉ mục)
│   ├── init_sqlite.sql                # Schema SQLite tối ưu cho PythonAnywhere Free Tier
│   ├── seed_data.py                   # Script Python nạp dữ liệu mẫu cho cả PostgreSQL & SQLite
│   ├── seed_db.cjs                    # Script nạp dữ liệu mẫu gốc (Node.js)
│   └── pmsl_weigh_sample.sql          # Bản xuất dữ liệu mẫu
│
├── src/                               # TẦNG GIAO DIỆN NGƯỜI DÙNG (REACT 18 + TYPESCRIPT)
│   ├── types/                         # Định nghĩa kiểu dữ liệu (station, process, product, log)
│   ├── services/                      # Tầng gọi API kết nối máy chủ (/api/*)
│   ├── components/                    # Linh kiện giao diện tái sử dụng
│   │   ├── layout/                    # Header thanh điều hướng chuẩn nhận diện Phan Bách
│   │   ├── common/                    # StatusBadge, Toast thông báo
│   │   ├── overview/                  # KPI Cards, Sơ đồ dòng chảy 4 cụm, Bảng nhật ký mẻ cân
│   │   ├── stations/                  # Quản lý 27 trạm cân, Sơ đồ Pipeline trạm cân
│   │   └── process/                   # Quản lý 15 công đoạn chế biến & Đồ thị liên kết
│   └── pages/                         # Các màn hình chính (Overview, WeighStation, Process, Product)
│
├── public/                            # TÀI NGUYÊN TĨNH
│   ├── logo.png                       # Logo thương hiệu Phan Bách
│   └── processflow.jpg                # Sơ đồ quy trình công nghệ chuẩn nhà máy
│
├── dist/                              # BẢN BUILD SẴN SÀNG TRIỂN KHAI CỦA FRONTEND
├── legacy/                            # BẢN MẪU TĨNH GỐC ĐÃ ĐƯỢC DỌN DẸP
│   ├── weighStation.html              # Bản HTML mẫu cũ
│   ├── process.html                   # Bản HTML mẫu cũ
│   └── product.html                   # Bản HTML mẫu cũ
│
├── package.json                       # Danh mục scripts và thư viện NPM
├── vite.config.ts                     # Cấu hình Vite bundler & reverse proxy /api
├── tailwind.config.js                 # Cấu hình Tailwind CSS
├── DEPLOYMENT_PYTHONANYWHERE.md       # Hướng dẫn chi tiết từng bước chạy trên PythonAnywhere
└── README.md                          # Tài liệu tổng quan hệ thống
```

---

## 2. Hướng Dẫn Triển Khai & Khởi Chạy

### Cách 1: Triển khai trên PythonAnywhere
Xem toàn bộ hướng dẫn từng bước chi tiết tại:  
👉 **[DEPLOYMENT_PYTHONANYWHERE.md](file:///Users/phanbach/Desktop/TheBaoUser/PhanBachWork/website/weigh_dashboard/webDesignUI/DEPLOYMENT_PYTHONANYWHERE.md)**

Tóm tắt các bước chính:
1. Git clone mã nguồn vào tài khoản PythonAnywhere.
2. Tạo virtualenv và cài đặt: `pip install -r backend/requirements.txt`.
3. Nạp database mẫu: `python3 database/seed_data.py` (tạo ngay file SQLite không cần cài thêm DB).
4. Cấu hình thẻ **Web** với file WSGI theo mẫu `backend/pythonanywhere_wsgi.py`.
5. Nhấn **Reload** và truy cập tên miền `https://<username>.pythonanywhere.com`.

---

### Cách 2: Khởi chạy nhanh cục bộ với Python Backend (Khuyên dùng)
Máy chủ Python Flask tự động phục vụ cả REST API và giao diện tĩnh Vite React:

```bash
# 1. Cài đặt thư viện Python (nếu chưa cài):
pip install -r backend/requirements.txt

# 2. Khởi tạo & nạp dữ liệu mẫu vào SQLite:
python3 database/seed_data.py

# 3. Chạy máy chủ:
python3 backend/app.py
```
Truy cập hệ thống tại: **`http://localhost:5001`**

---

### Cách 3: Chế độ Lập trình viên Frontend (Hot Reload React)
Khi cần chỉnh sửa giao diện giao diện React với Hot Reload tức thì:

```bash
# Terminal 1: Chạy máy chủ Backend API (cổng 5001)
npm run server

# Terminal 2: Chạy Vite Development Server (cổng 3000)
npm run dev
```
Truy cập giao diện tại: **`http://localhost:3000`** (Vite tự động chuyển tiếp các yêu cầu `/api/*` sang cổng 5001).

---

### Cách 4: Chạy với Node.js Backend & PostgreSQL (Tùy chọn)
Nếu bạn muốn sử dụng Node.js backend và mở cổng TCP socket cho trạm cân thực tế:

```bash
# 1. Khởi tạo cơ sở dữ liệu PostgreSQL
npm run db:init
npm run db:seed

# 2. Build và khởi chạy Node.js Server
npm run server:node:build
npm run server:node
```

---

## 3. Danh Mục Các Điểm Cuối REST API

| Phương thức | Đường dẫn | Chức năng |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Kiểm tra tình trạng kết nối DB & số lô hoạt động |
| `GET` | `/api/processes` | Lấy danh sách 15 công đoạn & 17 liên kết luồng |
| `POST` | `/api/processes` | Thêm mới / cập nhật công đoạn |
| `DELETE` | `/api/processes/:id` | Xóa công đoạn |
| `GET` | `/api/stations` | Lấy danh sách 27 trạm cân công nghiệp |
| `POST` | `/api/stations` | Thêm mới trạm cân |
| `PUT` | `/api/stations/:id` | Cập nhật thông số trạm cân |
| `DELETE` | `/api/stations/:id` | Xóa trạm cân |
| `GET` | `/api/products` | Lấy danh mục quy cách sản phẩm theo khâu |
| `GET` | `/api/logs` | Lấy lịch sử mẻ cân (lọc theo `batch_id`) |
| `POST` | `/api/logs` | Ghi nhận mẻ cân thủ công từ giao diện |
| `DELETE` | `/api/logs/:id` | Xóa bản ghi mẻ cân |
| `GET` | `/api/metrics` | Lấy 4 chỉ số KPI chính (IN, WiP, OUT, Yield %) |
| `GET` | `/api/batches` | Lấy danh sách mã lô sản xuất |
| `POST` | `/api/iot/weigh` | Tiếp nhận mẻ cân tự động từ chip STM32 / Loadcell |
