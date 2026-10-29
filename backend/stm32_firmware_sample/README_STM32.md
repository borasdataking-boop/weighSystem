# HƯỚNG DẪN KẾT NỐI PHẦN CỨNG: LOADCELL -> ĐẦU CÂN DINI ARGEO -> CHIP STM32 -> BACKEND

Tài liệu này chuẩn bị sẵn kiến trúc kỹ thuật và sơ đồ đấu dây để khi lắp đặt cân thực tế tại xưởng chế biến, hệ thống sẽ kết nối tự động 100%.

---

### 1. SƠ ĐỒ KHỐI PHẦN CỨNG (HARDWARE ARCHITECTURE)

```
[ Bàn cân Loadcell 4 dây ]
         │ (Tín hiệu tương tự mV/V: E+, E-, S+, S-)
         ▼
[ Đầu Cân Dini Argeo DFWL / 3590E ]
         │
         │ (Chuỗi ASCII Telegram: "ST,GS,+  15.000,kg\r\n")
         │ Cổng RS232 (Tx/Rx/GND) hoặc RS485 (A/B)
         ▼
[ Module Chuyển đổi MAX3232 / MAX485 ]
         │ (Mức logic TTL 3.3V)
         ▼
[ Vi Điều Khiển STM32 (STM32F103 / STM32F407) ]
         │ (UART2 RX ngắt DMA)
         │ Xử lý lọc rung, kiểm tra cờ ổn định 'ST', đóng gói JSON
         ▼
[ Module Truyền Thông (W5500 Ethernet / ESP8266 / SIM 4G) ]
         │ (TCP Socket port 8000 hoặc HTTP POST)
         ▼
[ BACKEND API SERVER & DATABASE POSTGRESQL ]
         │ (Lưu vào bảng public.production_weight_logs)
         ▼
[ FRONTEND DASHBOARD (MÀN HÌNH TỔNG QUAN XƯỞNG) ]
```

---

### 2. SƠ ĐỒ ĐẤU DÂY CHI TIẾT

#### A. Loadcell vào Đầu cân Dini Argeo
* Chân `EXC+` (Dây Đỏ) $\rightarrow$ Cấp nguồn kích thích dương (+5V)
* Chân `EXC-` (Dây Đen) $\rightarrow$ Cấp nguồn kích thích âm (0V)
* Chân `SIG+` (Dây Xanh lá) $\rightarrow$ Tín hiệu vi sai dương
* Chân `SIG-` (Dây Trắng) $\rightarrow$ Tín hiệu vi sai âm
* Dây Chống nhiễu (Shield) $\rightarrow$ Nối vỏ tiếp địa (GND)

#### B. Đầu cân Dini Argeo vào Chip STM32
* Đầu cân Dini Argeo cổng COM1:
  - Chân `TX` (Dini) $\rightarrow$ Chân `RX` của IC MAX3232 / MAX485
  - Chân `GND` (Dini) $\rightarrow$ Chân `GND` chung
* Từ IC Chuyển đổi sang STM32:
  - Chân `RO` (Receiver Out) $\rightarrow$ Chân `PA3` (USART2_RX của STM32)
  - Nguồn cấp `VCC` $\rightarrow$ 3.3V hoặc 5V của STM32

---

### 3. CẤU HÌNH THÔNG SỐ TRÊN ĐẦU CÂN DINI ARGEO
Vào menu cài đặt (Setup) trên đầu cân Dini Argeo:
1. `SEtUP` $\rightarrow$ `Serial` $\rightarrow$ `PCSEL` $\rightarrow$ Chọn cổng COM kết nối.
2. `bAud` $\rightarrow$ Chọn `9600` baud.
3. `bit` $\rightarrow$ `n-8-1` (No parity, 8 data bits, 1 stop bit).
4. `ModE` $\rightarrow$ Chọn `ALL` hoặc `Cont. tr` (Truyền liên tục) hoặc `StAb. tr` (Chỉ truyền khi cân ổn định `ST`).

---

### 4. GIAO THỨC TRUYỀN TỪ STM32 LÊN BACKEND

#### Cách 1: Gửi qua HTTP POST (Khuyến nghị cho mạng nội bộ xưởng)
* **URL:** `http://<IP_MAY_CHU>:8000/api/v1/iot/scale-log`
* **Method:** `POST`
* **Content-Type:** `application/json`
* **Body:**
```json
{
  "station_id": "10244156",
  "gross_weight": 15.000,
  "tare_weight": 1.000,
  "net_weight": 14.000,
  "is_stable": true,
  "unit": "kg"
}
```

#### Cách 2: Gửi trực tiếp qua TCP Socket (Cực nhanh và nhẹ cho STM32)
* Mở kết nối TCP Socket tới `<IP_MAY_CHU>` cổng `8000`.
* Gửi chuỗi:
```text
STATION=10244156;DATA=ST,GS,+  015.000,kg\r\n
```
* Máy chủ backend sẽ tự động phân tích cú pháp, lọc trùng lặp và ghi thẳng vào PostgreSQL `production_weight_logs`.
