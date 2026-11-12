# HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG TRÊN PYTHONANYWHERE
*(Phan Bach Weigh Dashboard - IoT & Production Management System)*

Tài liệu này hướng dẫn chi tiết từng bước để triển khai toàn bộ hệ thống (Frontend React Vite + Backend Python Flask + Database) lên nền tảng **PythonAnywhere** một cách trơn tru và chuyên nghiệp nhất.

---

## 1. Cơ Chế Hoạt Động Trên PythonAnywhere Cần Biết

> [!IMPORTANT]
> **Điểm khác biệt cốt lõi:**
> 1. **PythonAnywhere không chạy Node.js web server** (như `npm run server` hoặc `node server.cjs`).
> 2. **PythonAnywhere không cho phép mở cổng tùy ý** (như cổng 5001 hay cổng TCP socket 8000). Mọi truy cập web đều đi qua reverse proxy của PythonAnywhere và chuyển tiếp tới ứng dụng Python thông qua chuẩn **WSGI**.
> 3. Do đó, mã nguồn đã được cấu trúc lại hoàn chỉnh với **Backend Python (Flask WSGI)** chuẩn hóa, đảm nhiệm 2 vai trò:
>    - Cung cấp toàn bộ **REST API (`/api/*`)** tương thích 100% với giao diện React.
>    - Tự động phục vụ giao diện tĩnh **Single Page App (SPA)** từ thư mục `dist/`.

---

## 2. Cấu Trúc Dự Án Sau Khi Tinh Gọn

```text
webDesignUI/
├── backend/
│   ├── app.py                     # Máy chủ Flask (REST API + Phục vụ SPA React)
│   ├── wsgi.py                    # Entry point chuẩn WSGI cho production
│   ├── pythonanywhere_wsgi.py     # File mẫu cấu hình WSGI trên PythonAnywhere
│   ├── config.py                  # Quản lý cấu hình & biến môi trường
│   ├── db.py                      # Tầng kết nối Database (PostgreSQL & SQLite)
│   ├── services.py                # Xử lý nghiệp vụ (Trạm cân, Quy trình, Lô, Sản phẩm)
│   ├── iot_service.py             # Tiếp nhận dữ liệu mẻ cân IoT & Chống trùng lặp
│   ├── protocol_parser.py         # Phân tích chuỗi ASCII đầu cân Dini Argeo
│   ├── requirements.txt           # Danh mục thư viện Python cần cài
│   ├── .env.example               # Mẫu cấu hình môi trường
│   ├── node/                      # Giữ lại Backend Node.js cũ để tham khảo/chạy local
│   └── stm32_firmware_sample/     # Mã nguồn mẫu firmware C cho STM32
│
├── database/
│   ├── init_db.sql                # Schema khởi tạo PostgreSQL
│   ├── init_sqlite.sql            # Schema khởi tạo SQLite (cho PythonAnywhere Free Tier)
│   ├── seed_data.py               # Script Python tự động nạp dữ liệu mẫu
│   └── seed_db.cjs                # Script seeder Node.js gốc
│
├── src/                           # Mã nguồn Frontend React 18 + TypeScript + Tailwind
├── public/                        # File ảnh tĩnh (logo.png, processflow.jpg)
├── dist/                          # Bản build hoàn chỉnh của Frontend
├── legacy/                        # Bản mẫu HTML cũ đã dọn dẹp
├── package.json                   # Cấu hình scripts NPM
├── vite.config.ts                 # Cấu hình Vite bundler
└── DEPLOYMENT_PYTHONANYWHERE.md   # Tài liệu hướng dẫn này
```

---

## 3. Các Bước Triển Khai Chi Tiết Lên PythonAnywhere

### Bước 1: Đưa mã nguồn lên PythonAnywhere

1. Đăng nhập vào [PythonAnywhere](https://www.pythonanywhere.com/).
2. Mở một **Bash Console** mới từ trang Dashboard.
3. Clone repository vào thư mục người dùng của bạn:
   ```bash
   cd /home/<username>
   git clone <url_repository_cua_ban> webDesignUI
   cd webDesignUI
   ```
   *(Thay `<username>` bằng tên tài khoản PythonAnywhere của bạn, ví dụ: `phanbach`)*.

---

### Bước 2: Tạo môi trường ảo (Virtualenv) & Cài đặt thư viện Python

Trong cửa sổ **Bash Console** của PythonAnywhere:
```bash
# 1. Tạo môi trường ảo Python 3.10
mkvirtualenv --python=/usr/bin/python3.10 weigh_env

# 2. Kích hoạt môi trường ảo (nếu chưa kích hoạt tự động)
workon weigh_env

# 3. Cài đặt các thư viện cần thiết
cd /home/<username>/webDesignUI
pip install -r backend/requirements.txt
```

---

### Bước 3: Khởi tạo Cơ sở Dữ liệu

Bạn có 2 lựa chọn cơ sở dữ liệu:

#### Lựa chọn A: SQLite (Khuyên dùng cho tài khoản Free Tier - Chạy ngay lập tức)
Tài khoản Free của PythonAnywhere không hỗ trợ PostgreSQL cục bộ. Hệ thống đã tích hợp sẵn SQLite:
```bash
python database/seed_data.py
```
> Lệnh này sẽ tự động tạo file `database/weigh_dashboard.db` với đầy đủ:
> - 15 Công đoạn chế biến chuẩn sơ đồ nhà máy
> - 17 Mũi tên liên kết luồng sản xuất
> - 27 Trạm cân vật lý (Dini Argeo, Mettler Toledo, Ohaus)
> - 20 Quy cách sản phẩm
> - 36 Mẻ cân mẫu lịch sử

#### Lựa chọn B: PostgreSQL Remote (Supabase, Neon, AWS RDS...)
Nếu bạn có một Database PostgreSQL trên mây:
```bash
export DATABASE_URL="postgresql://user:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
python database/seed_data.py
```

---

### Bước 4: Kiểm tra bản build Frontend (`dist/`)

Thư mục `dist/` đã được build sẵn trong repo. Nếu bạn cần build lại trực tiếp trên PythonAnywhere:
```bash
npm install
npm run build
```

---

### Bước 5: Cấu hình Web App trong thẻ "Web" của PythonAnywhere

1. Truy cập thẻ **Web** trên thanh menu PythonAnywhere.
2. Nhấn **"Add a new web app"** -> Chọn **"Manual configuration"** -> Chọn **Python 3.10**.
3. Tại phần **Code**:
   - **Source code**: `/home/<username>/webDesignUI`
   - **Working directory**: `/home/<username>/webDesignUI`
4. Tại phần **Virtualenv**:
   - Nhập đường dẫn: `/home/<username>/.virtualenvs/weigh_env`
5. Tại phần **Static files**:
   Thêm đường dẫn tĩnh để tối ưu tốc độ tải CSS/JS:
   | URL | Directory |
   | :--- | :--- |
   | `/assets/` | `/home/<username>/webDesignUI/dist/assets` |
   | `/logo.png` | `/home/<username>/webDesignUI/public/logo.png` |
   | `/processflow.jpg` | `/home/<username>/webDesignUI/public/processflow.jpg` |

---

### Bước 6: Cấu hình file WSGI (`..._wsgi.py`)

1. Trong thẻ **Web**, nhấp vào liên kết tại mục **WSGI configuration file**:  
   `/var/www/<username>_pythonanywhere_com_wsgi.py`.
2. Xóa toàn bộ nội dung mặc định và dán nội dung sau vào:

```python
import sys
import os

# 1. Tên username của bạn
USERNAME = '<username>'  # <-- Thay bằng username PythonAnywhere của bạn

# 2. Đường dẫn dự án
PROJECT_FOLDER = f'/home/{USERNAME}/webDesignUI'
if PROJECT_FOLDER not in sys.path:
    sys.path.insert(0, PROJECT_FOLDER)

# 3. Biến môi trường
# Mặc định dùng SQLite:
os.environ['DATABASE_URL'] = f'sqlite:///{PROJECT_FOLDER}/database/weigh_dashboard.db'

# Nếu dùng PostgreSQL remote (Supabase / Neon), mở dòng bên dưới:
# os.environ['DATABASE_URL'] = 'postgresql://user:password@your-db-host:5432/dbname'

os.environ['FLASK_ENV'] = 'production'

# 4. Import WSGI Application
from backend.app import app as application
```
3. Nhấn **Save** (Lưu file).

---

### Bước 7: Khởi động lại (Reload) & Kiểm tra ứng dụng

1. Quay lại thẻ **Web**.
2. Nhấn nút xanh lá cây to: **"Reload <username>.pythonanywhere.com"**.
3. Mở trình duyệt và truy cập:  
   **`https://<username>.pythonanywhere.com`**

Bạn sẽ thấy giao diện **Dashboard Hệ Thống Quản Lý Trạm Cân Phan Bách** hiển thị đầy đủ:
- Bảng nhật ký mẻ cân thời gian thực
- Sơ đồ trực quan dây chuyền sản xuất 4 cụm
- Các chỉ số KPI (IN, WiP, OUT, % Yield)
- Quản lý trạm cân & quy trình chế biến

---

## 4. Hướng Dẫn Cập Nhật Code Mới (Update Code)

Mỗi khi có mã nguồn mới được đẩy lên GitHub (ví dụ: cập nhật giao diện, sửa lỗi, cập nhật dữ liệu mẫu), bạn chỉ cần mở **Bash Console** trên PythonAnywhere và làm theo **1 trong 2 cách** sau:

### Cách 1: Dùng Script Tự Động 1 Dòng Lệnh (Khuyên dùng - Nhanh nhất)
Tại cửa sổ **Bash Console** của PythonAnywhere:
```bash
cd /home/<username>/webDesignUI
bash update.sh
```
*(Thay `<username>` bằng tên tài khoản của bạn, ví dụ: `cd /home/phanbach/webDesignUI`)*

> **Script `update.sh` đã được cài sẵn trong mã nguồn, tự động xử lý trọn gói 4 khâu:**
> 1. Kéo toàn bộ code và giao diện build mới nhất từ GitHub (`git fetch & reset --hard origin/main`).
> 2. Tự động kích hoạt môi trường ảo `weigh_env` và cập nhật các thư viện mới (nếu có).
> 3. Tự động kiểm tra và đảm bảo Database SQLite sẵn sàng.
> 4. Tự động khởi động lại Web App (thông qua lệnh `touch` file WSGI) mà **bạn không cần phải mở thẻ Web để bấm Reload thủ công**.

---

### Cách 2: Thực hiện thủ công từng lệnh
Nếu bạn muốn tự chạy từng lệnh trong Bash Console:
```bash
# 1. Di chuyển vào thư mục dự án
cd /home/<username>/webDesignUI

# 2. Kéo mã nguồn mới nhất từ nhánh main
git fetch origin main
git reset --hard origin/main

# 3. Kích hoạt môi trường ảo và cập nhật thư viện
workon weigh_env
pip install -r backend/requirements.txt --quiet

# 4. Tự động Reload Web App tức thì từ terminal
touch /var/www/<username>_pythonanywhere_com_wsgi.py
```
*(Sau đó mở lại trang web `https://<username>.pythonanywhere.com` để kiểm tra kết quả)*.

---

## 5. Chạy Thử Nghiệm Tại Môi Trường Cục Bộ (Local)

Nếu muốn chạy thử nghiệm trước trên máy tính cá nhân bằng Python Backend:

```bash
# 1. Cài đặt thư viện Python (chỉ chạy lần đầu)
pip install -r backend/requirements.txt

# 2. Nạp dữ liệu mẫu vào SQLite (nếu chưa có)
python database/seed_data.py

# 3. Khởi chạy máy chủ
python backend/app.py
```
Truy cập tại: **`http://localhost:5001`** (Máy chủ sẽ phục vụ cả API và toàn bộ giao diện React SPA).

---

## 6. Khắc Phục Lỗi Thường Gặp (Troubleshooting)

| Vấn đề | Nguyên nhân | Cách xử lý |
| :--- | :--- | :--- |
| **500 Internal Server Error** | Lỗi import hoặc sai đường dẫn file WSGI | Kiểm tra mục **Log files -> Error log** trong thẻ Web để đọc chi tiết dòng bị lỗi. Đảm bảo đã đặt đúng đường dẫn `PROJECT_FOLDER` và đã chọn đúng `virtualenv`. |
| **Lỗi trắng trang (White Screen)** | Chưa build Frontend hoặc thiếu `dist/index.html` | Chạy lệnh `npm run build` trong console để tạo thư mục `dist/`. |
| **Giao diện không có dữ liệu** | Chưa nạp database seed | Trong Bash Console, chạy: `python database/seed_data.py`. |
| **404 Not Found khi F5 lại trang con** | Route client-side không được phục vụ về index.html | Trong `backend/app.py`, hàm `serve_frontend` đã cấu hình fallback tự động về `index.html`. Đảm bảo file `app.py` mới nhất đang được sử dụng. |
