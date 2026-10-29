# HƯỚNG DẪN CƠ SỞ DỮ LIỆU POSTGRESQL (PMSL WEIGH DASHBOARD)

## 1. File Database Mẫu Đã Có Sẵn
Thư mục `database/` đã được chuẩn bị đầy đủ các file kịch bản SQL chuẩn để triển khai:

1. **[`database/pmsl_weigh_sample_universal.sql`](./pmsl_weigh_sample_universal.sql) (Khuyên dùng - All-In-One):**
   - File SQL mẫu hoàn chỉnh nhất (tự động DROP và CREATE lại bảng, nạp toàn bộ 100% dữ liệu mẫu thực tế).
   - Tương thích với **mọi công cụ quản trị**: pgAdmin 4, DBeaver, Navicat, psql, Supabase, Docker Compose.
   - **Dữ liệu mẫu đã nạp sẵn:**
     - `process`: 15 công đoạn chế biến tiêu chuẩn (CD001 - CD015).
     - `process_mapping`: 17 luồng điều phối chuyển tiếp Node -> Node.
     - `station_weigh`: 27 trạm cân thực tế (cân vào IN, cân ra OUT, trạm xe đẩy di động).
     - `product`: 20 mặt hàng bán thành phẩm, phụ phẩm, thành phẩm xuất khẩu.
     - `batch`: 5 lô hàng mẫu (`L0001`, `L0002`, `L0003`, `test`, `loconc`).
     - `production_weight_logs`: 36 mẻ cân thực tế khớp ảnh chụp pgAdmin 4.
     - 6 Chỉ mục (Indexes) tối ưu hóa tốc độ truy vấn thời gian thực.

2. **[`database/init_db.sql`](./init_db.sql):**
   - File khởi tạo cấu trúc bảng trắng (Schema Only - Không có dữ liệu mẫu).

3. **[`database/seed_db.cjs`](./seed_db.cjs):**
   - File kịch bản Node.js dùng để Reset / Nạp lại dữ liệu mẫu vào PostgreSQL.

---

## 2. Cách Nhập (Import) Dữ Liệu Lên Server Hoặc pgAdmin 4

### Cách 1: Sử dụng giao diện pgAdmin 4 (Dễ nhất)
1. Mở **pgAdmin 4** -> Kết nối vào PostgreSQL Server của bạn.
2. Tạo mới một Database (hoặc chọn database hiện có, ví dụ `weigh_dashboard`).
3. Chuột phải vào database -> Chọn **Query Tool**.
4. Mở file [`database/pmsl_weigh_sample_universal.sql`](./pmsl_weigh_sample_universal.sql) (bấm biểu tượng Open folder hoặc kéo thả vào).
5. Bấm nút **Execute** (hoặc phím **F5**). Toàn bộ bảng và số liệu sẽ được nạp hoàn chỉnh.

### Cách 2: Sử dụng dòng lệnh Terminal (Cho Server Linux / Docker)
```bash
# 1. Tạo database
psql -U postgres -c "CREATE DATABASE weigh_dashboard;"

# 2. Nạp file mẫu vào database
psql -U postgres -d weigh_dashboard -f database/pmsl_weigh_sample_universal.sql
```

### Cách 3: Sử dụng lệnh có sẵn trong dự án (NPM Script)
```bash
# Khởi tạo bảng trắng
npm run db:init

# Nạp dữ liệu mẫu
npm run db:seed
```
