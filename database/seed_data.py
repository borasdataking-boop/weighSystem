#!/usr/bin/env python3
"""
Python Database Seeder for Weigh Dashboard (PostgreSQL & SQLite)
Hỗ trợ seed dữ liệu mẫu chuẩn khớp 100% với PostgreSQL PMSL.sql
Dùng được cả khi chạy local và trên PythonAnywhere
"""

import os
import sys
import sqlite3
from pathlib import Path

# Thêm thư mục gốc vào path để import config và db
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

PROCESSES = [
    ('CD001', 'Tiếp nhận nguyên liệu', 'Material Receiving', 1, 1, 'Kiểm tra chất lượng và tiếp nhận tôm nguyên liệu đầu vào', '#FFEEDB', '#DCA365', '#4A2800'),
    ('CD002', 'Rửa 1 & Phân cỡ sơ bộ', 'Grading & Sizing', 1, 2, 'Rửa sạch tạp chất và phân loại tôm theo kích cỡ tiêu chuẩn', '#FCE2E6', '#DF8F9B', '#4A0814'),
    ('CD003', 'Xếp khuôn & Định lượng', 'Stacking & Batching', 1, 3, 'Xếp khuôn định hình và cân định lượng theo mẻ', '#F0E8F7', '#BFA0D8', '#3B0D59'),
    ('CD004', 'Sơ chế (Bóc vỏ & Rút chỉ)', 'Peeling & Deveining', 1, 4, 'Bóc vỏ, vặt đầu hoặc rút chỉ lưng theo quy cách', '#E3F7E3', '#8EC68E', '#0E440E'),
    ('CD005', 'Ngâm xử lý phụ gia', 'Soaking Process', 1, 5, 'Ngâm xử lý phụ gia theo quy chuẩn an toàn thực phẩm', '#FCE3DF', '#E89184', '#5C140A'),
    ('CD006', 'Định hình Nobashi / Xẻ bướm', 'Nobashi & Butterfly', 1, 6, 'Định hình tôm duỗi thẳng Nobashi hoặc xẻ bướm', '#E9F1FC', '#9BBCE8', '#0B2F5C'),
    ('CD007', 'Tẩm bột chiên xù', 'Breading Process', 1, 7, 'Tẩm bột Panko hoặc bột tẩm gia vị tiêu chuẩn', '#E4E8EF', '#8E9BB0', '#1A2634'),
    ('CD008', 'Chiên định hình dầu nóng', 'Breaded Frying', 1, 8, 'Chiên định hình qua dầu nhiệt độ cao tạo độ giòn', '#DCF7F7', '#78D1D1', '#073B3B'),
    ('CD009', 'Luộc / Hấp tôm nõn (PD)', 'PD Cooking', 2, 8, 'Gia nhiệt hấp hoặc luộc chín đối với tôm thịt PD', '#BDF0F0', '#5ECACA', '#073B3B'),
    ('CD010', 'Luộc / Hấp tôm vỏ (HLSO)', 'HLSO Cooking', 3, 8, 'Gia nhiệt hấp hoặc luộc chín đối với tôm còn vỏ HLSO', '#BDF0F0', '#5ECACA', '#073B3B'),
    ('CD011', 'Tách vỏ sau luộc', 'Peel After Cook', 3, 9, 'Bóc vỏ tôm sau khi luộc chín phục vụ chế biến salad', '#FDF8C7', '#DAC448', '#4D4004'),
    ('CD012', 'Cấp đông xoắn tôm tươi', 'Raw Spiral Freezer', 1, 10, 'Cấp đông bằng băng chuyền xoắn sản phẩm tôm tươi', '#FFEEDB', '#DCA365', '#4A2800'),
    ('CD013', 'Cấp đông xoắn tôm chiên', 'Fried Spiral Freezer', 2, 10, 'Cấp đông bằng băng chuyền xoắn sản phẩm tôm chiên', '#FFEEDB', '#DCA365', '#4A2800'),
    ('CD014', 'Cấp đông IQF tôm tươi', 'Raw IQF Freezer', 3, 10, 'Cấp đông siêu tốc rời IQF và mạ băng tôm tươi', '#FFEEDB', '#DCA365', '#4A2800'),
    ('CD015', 'Cấp đông IQF tôm chín', 'Cooked IQF Freezer', 4, 10, 'Cấp đông siêu tốc rời IQF đối với sản phẩm tôm chín', '#FFEEDB', '#DCA365', '#4A2800')
]

PROCESS_MAPPINGS = [
    ('MAP001', 'CD001', 'CD002', 'DIRECT', 'Tiếp nhận nguyên liệu -> Rửa 1 & Phân cỡ sơ bộ', 1, True),
    ('MAP002', 'CD002', 'CD003', 'DIRECT', 'Rửa 1 & Phân cỡ sơ bộ -> Xếp khuôn & Định lượng', 2, True),
    ('MAP003', 'CD003', 'CD004', 'DIRECT', 'Xếp khuôn & Định lượng -> Sơ chế (Bóc vỏ & Rút chỉ)', 3, True),
    ('MAP004', 'CD003', 'CD005', 'BYPASS', 'Xếp khuôn & Định lượng -> Ngâm xử lý (Vượt cấp sơ chế)', 4, True),
    ('MAP005', 'CD004', 'CD005', 'DIRECT', 'Sơ chế (Bóc vỏ & Rút chỉ) -> Ngâm xử lý phụ gia', 5, True),
    ('MAP006', 'CD005', 'CD006', 'DIRECT', 'Ngâm xử lý phụ gia -> Định hình Nobashi / Xẻ bướm', 6, True),
    ('MAP007', 'CD005', 'CD009', 'BRANCH', 'Ngâm xử lý phụ gia -> Luộc / Hấp tôm nõn (PD)', 7, True),
    ('MAP008', 'CD005', 'CD010', 'BRANCH', 'Ngâm xử lý phụ gia -> Luộc / Hấp tôm vỏ (HLSO)', 8, True),
    ('MAP009', 'CD005', 'CD014', 'BRANCH', 'Ngâm xử lý phụ gia -> Cấp đông IQF tôm tươi', 9, True),
    ('MAP010', 'CD006', 'CD007', 'DIRECT', 'Định hình Nobashi / Xẻ bướm -> Tẩm bột chiên xù', 10, True),
    ('MAP011', 'CD007', 'CD008', 'DIRECT', 'Tẩm bột chiên xù -> Chiên định hình dầu nóng', 11, True),
    ('MAP012', 'CD008', 'CD012', 'DIRECT', 'Chiên định hình dầu nóng -> Cấp đông xoắn tôm tươi', 12, True),
    ('MAP013', 'CD008', 'CD013', 'BRANCH', 'Chiên định hình dầu nóng -> Cấp đông xoắn tôm chiên', 13, True),
    ('MAP014', 'CD009', 'CD013', 'DIRECT', 'Luộc / Hấp tôm nõn (PD) -> Cấp đông xoắn tôm chiên', 14, True),
    ('MAP015', 'CD010', 'CD011', 'DIRECT', 'Luộc / Hấp tôm vỏ (HLSO) -> Tách vỏ sau luộc', 15, True),
    ('MAP016', 'CD011', 'CD014', 'DIRECT', 'Tách vỏ sau luộc -> Cấp đông IQF tôm tươi', 16, True),
    ('MAP017', 'CD011', 'CD015', 'BRANCH', 'Tách vỏ sau luộc -> Cấp đông IQF tôm chín', 17, True)
]

BATCHES = [
    ('L0001', 'Lô tôm thẻ xuất khẩu Nhật Bản L0001', 'IN_PROGRESS'),
    ('L0002', 'Lô tôm chiên xù EU L0002', 'IN_PROGRESS'),
    ('L0003', 'Lô tôm luộc salad US L0003', 'IN_PROGRESS'),
    ('test', 'Lô kiểm định chất lượng', 'COMPLETED'),
    ('loconc', 'Lô tôm sú hữu cơ', 'COMPLETED')
]

PRODUCTS = [
    ('TOM001', 'Tôm nguyên liệu tươi sống', 'CD001', 'SEMI', 'kg', 'Tôm thẻ chân trắng tươi sống nhập từ đầm nuôi', False),
    ('TP001', 'Tôm nguyên liệu loại 1', 'CD001', 'SEMI', 'kg', 'Tôm đạt chuẩn kích cỡ và độ tươi loại 1', False),
    ('TP002', 'Tôm nguyên liệu loại 2', 'CD001', 'SEMI', 'kg', 'Tôm đạt chuẩn loại 2 chuyển phân cỡ', False),
    ('TP003', 'Tôm dập gãy phân loại', 'CD001', 'BYPRODUCT', 'kg', 'Tôm dập gãy, đứt đầu chuyển phụ phẩm', False),
    ('SP-TN-01', 'Tôm nguyên liệu đạt chuẩn', 'CD001', 'SEMI', 'kg', 'Tôm tươi sống, nguyên con, ướp đá tỷ lệ 1:1', False),
    ('SP-PC-01', 'Tôm thẻ phân cỡ lớn (size 20-25)', 'CD002', 'SEMI', 'kg', 'Kích cỡ 20-25 con/kg, tôm loại 1', False),
    ('SP-PC-02', 'Tôm thẻ phân cỡ vừa (size 30-40)', 'CD002', 'SEMI', 'kg', 'Kích cỡ 30-40 con/kg, tôm loại 2', False),
    ('SP-XK-01', 'Mẻ tôm xếp khuôn 1.8kg', 'CD003', 'SEMI', 'kg', 'Khuôn inox tiêu chuẩn block 1.8kg net', False),
    ('SP-BV-01', 'Tôm bóc nõn rút chỉ (PD)', 'CD004', 'SEMI', 'kg', 'Bóc sạch vỏ, giữ lại đốt đuôi hoặc bóc nõn hoàn toàn', False),
    ('SP-PG-01', 'Bán thành phẩm sau ngâm phụ gia', 'CD005', 'SEMI', 'kg', 'Tăng trọng định mức 8-12%, thịt giòn ngọt tự nhiên', False),
    ('SP-DH-01', 'Tôm Nobashi kéo dài 13-14cm', 'CD006', 'SEMI', 'kg', 'Cắt gân bụng, ép duỗi thẳng', False),
    ('SP-TB-01', 'Tôm lăn bột xù trắng Panko', 'CD007', 'SEMI', 'kg', 'Bột ướt batter mix bám đều, áo bột xù', False),
    ('SP-CN-01', 'Tôm chiên chín sơ bộ', 'CD008', 'SEMI', 'kg', 'Chiên ngập dầu đậu nành 180 độ C trong 45 giây', False),
    ('SP-PD-01', 'Tôm thịt luộc chín PD', 'CD009', 'SEMI', 'kg', 'Luộc hấp nhiệt độ tâm sản phẩm đạt 85 độ C', False),
    ('SP-HL-01', 'Tôm vỏ luộc chín HLSO', 'CD010', 'SEMI', 'kg', 'Tôm bỏ đầu còn vỏ luộc chín giữ màu đỏ tươi', False),
    ('SP-TV-01', 'Tôm chín bóc vỏ Salad', 'CD011', 'SEMI', 'kg', 'Bóc vỏ tôm sau luộc làm salad ăn liền', False),
    ('SP-CX-01', 'Tôm đông xoắn tươi khay', 'CD012', 'FINISHED', 'kg', 'Đông nhiệt độ -40 độ C, đóng thùng carton xuất khẩu', True),
    ('SP-CC-01', 'Tôm chiên đông xoắn', 'CD013', 'FINISHED', 'kg', 'Cấp đông xoắn giữ độ giòn xốp bột chiên', True),
    ('SP-IQ-01', 'Tôm thẻ tươi IQF', 'CD014', 'FINISHED', 'kg', 'Cấp đông siêu tốc mạ băng 5% bảo vệ vỏ', True),
    ('SP-IC-01', 'Tôm chín đông IQF', 'CD015', 'FINISHED', 'kg', 'Đông rời từng con, tiện lợi rã đông sử dụng', True)
]

STATIONS = [
    ('10244156', 'Trạm cân Tiếp nhận 01', 'CD001', 'IN', 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', True, 150, 10, 'TCP/IP', '192.168.1.101:8000', 'Cửa nhập số 1 - Khu tiếp nhận tôm tươi'),
    ('CAN001', 'Trạm cân Tiếp nhận 01B', 'CD001', 'IN', 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', True, 150, 10, 'RS-232', 'COM2', 'Cửa nhập số 2 - Khu tiếp nhận tôm tươi'),
    ('CAN002', 'Trạm cân Tiếp nhận 02', 'CD001', 'IN', 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', True, 150, 10, 'RS-232', 'COM4', 'Cửa nhập số 3 - Khu tiếp nhận tôm tươi'),
    ('7779460', 'Trạm cân di động Tiếp nhận 03', 'CD001', 'IN', 'METTLER_TOLEDO', 'METTLER TOLEDO IND231', 'ONLINE', True, 60, 5, 'WiFi', '192.168.1.150:8000', 'Xe đẩy di động khu bốc dỡ'),
    ('10244157', 'Trạm cân Phân cỡ vào 02A', 'CD002', 'IN', 'METTLER_TOLEDO', 'METTLER TOLEDO IND231', 'ONLINE', True, 60, 5, 'TCP/IP', '192.168.1.102:8000', 'Băng chuyền vào phân cỡ 1'),
    ('10244173', 'Trạm cân Phân cỡ ra 02B', 'CD002', 'OUT', 'METTLER_TOLEDO', 'METTLER TOLEDO IND231', 'ONLINE', True, 60, 5, 'TCP/IP', '192.168.1.173:8000', 'Cửa ra băng chuyền phân cỡ 1'),
    ('10244158', 'Trạm cân Xếp khuôn vào 03A', 'CD003', 'IN', 'OHAUS_DEFENDER', 'OHAUS DEFENDER 3000', 'ONLINE', True, 30, 2, 'RS-232', 'COM3', 'Bàn tiếp nhận xếp khuôn khu A'),
    ('10244174', 'Trạm cân Xếp khuôn ra 03B', 'CD003', 'OUT', 'OHAUS_DEFENDER', 'OHAUS DEFENDER 3000', 'ONLINE', True, 30, 2, 'RS-232', 'COM5', 'Bàn chuyển mẻ xếp khuôn khu A'),
    ('10244159', 'Trạm cân Bóc vỏ vào 04A', 'CD004', 'IN', 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', True, 30, 2, 'TCP/IP', '192.168.1.104:8000', 'Đầu chuyền bóc vỏ số 2'),
    ('10244175', 'Trạm cân Bóc vỏ ra 04B', 'CD004', 'OUT', 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', True, 30, 2, 'TCP/IP', '192.168.1.175:8000', 'Cuối chuyền bóc vỏ số 2'),
    ('10244160', 'Trạm cân Bồn ngâm vào 05A', 'CD005', 'IN', 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', True, 300, 20, 'TCP/IP', '192.168.1.105:8000', 'Khu vực cấp liệu bồn ngâm số 3'),
    ('10244176', 'Trạm cân Bồn ngâm ra 05B', 'CD005', 'OUT', 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', True, 300, 20, 'TCP/IP', '192.168.1.176:8000', 'Cửa xả bán thành phẩm bồn ngâm số 3'),
    ('10244161', 'Trạm cân Định hình Nobashi 06', 'CD006', 'OUT', 'OHAUS_DEFENDER', 'OHAUS DEFENDER 3000', 'ONLINE', True, 30, 2, 'TCP/IP', '192.168.1.106:8000', 'Bàn ép định hình khay 25 con'),
    ('10244162', 'Trạm cân Tẩm bột vào 07A', 'CD007', 'IN', 'METTLER_TOLEDO', 'METTLER TOLEDO IND231', 'ONLINE', True, 60, 5, 'TCP/IP', '192.168.1.107:8000', 'Đầu chuyền tẩm bột xù Panko'),
    ('10244177', 'Trạm cân Tẩm bột ra 07B', 'CD007', 'OUT', 'METTLER_TOLEDO', 'METTLER TOLEDO IND231', 'ONLINE', True, 60, 5, 'TCP/IP', '192.168.1.177:8000', 'Cuối chuyền tẩm bột xù Panko'),
    ('10244163', 'Trạm cân Chiên chín 08', 'CD008', 'OUT', 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', True, 150, 10, 'TCP/IP', '192.168.1.108:8000', 'Cửa ra lò chiên liên tục'),
    ('10244164', 'Trạm cân Nấu tôm PD vào 09A', 'CD009', 'IN', 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', True, 150, 10, 'TCP/IP', '192.168.1.109:8000', 'Nồi luộc áp suất số 1 (Vào)'),
    ('10244178', 'Trạm cân Nấu tôm PD ra 09B', 'CD009', 'OUT', 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', True, 150, 10, 'TCP/IP', '192.168.1.178:8000', 'Cửa ra rổ nõn luộc số 1'),
    ('10244165', 'Trạm cân Nấu tôm HLSO vào 10A', 'CD010', 'IN', 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', True, 150, 10, 'TCP/IP', '192.168.1.110:8000', 'Nồi luộc nhiệt độ chuẩn 2 (Vào)'),
    ('10244179', 'Trạm cân Nấu tôm HLSO ra 10B', 'CD010', 'OUT', 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', True, 150, 10, 'TCP/IP', '192.168.1.179:8000', 'Cửa làm nguội sau luộc HLSO 2'),
    ('10244166', 'Trạm cân Tách vỏ vào 11A', 'CD011', 'IN', 'METTLER_TOLEDO', 'METTLER TOLEDO IND231', 'ONLINE', True, 60, 5, 'TCP/IP', '192.168.1.111:8000', 'Chuyền cấp tôm chín tách vỏ'),
    ('10244180', 'Trạm cân Tách vỏ ra 11B', 'CD011', 'OUT', 'METTLER_TOLEDO', 'METTLER TOLEDO IND231', 'ONLINE', True, 60, 5, 'TCP/IP', '192.168.1.180:8000', 'Chuyền bóc nõn chín salad (Ra)'),
    ('10244167', 'Trạm cân Cấp đông xoắn tươi 12', 'CD012', 'OUT', 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', True, 300, 20, 'TCP/IP', '192.168.1.112:8000', 'Băng xoắn đông tươi số 1'),
    ('10244168', 'Trạm cân Cấp đông xoắn chiên 13', 'CD013', 'OUT', 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', True, 300, 20, 'TCP/IP', '192.168.1.113:8000', 'Băng xoắn đông chiên số 2'),
    ('10244169', 'Trạm cân Cấp đông IQF tươi vào 14A', 'CD014', 'IN', 'METTLER_TOLEDO', 'METTLER TOLEDO IND231', 'ONLINE', True, 150, 10, 'TCP/IP', '192.168.1.114:8000', 'Cửa nạp băng chuyền IQF tươi'),
    ('10244181', 'Trạm cân Cấp đông IQF tươi ra 14B', 'CD014', 'OUT', 'METTLER_TOLEDO', 'METTLER TOLEDO IND231', 'ONLINE', True, 150, 10, 'TCP/IP', '192.168.1.181:8000', 'Cửa ra mạ băng chuyền IQF tươi'),
    ('10244170', 'Trạm cân Cấp đông IQF chín 15', 'CD015', 'OUT', 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', True, 150, 10, 'TCP/IP', '192.168.1.115:8000', 'Cửa ra băng chuyền IQF chín')
]

LOGS = [
    ('test', '10244156', 'CD001', 'TOM001', 'IN', 15.000, 1.000, 14.000, '2026-10-03T07:52:20.369Z', 'NV001', 'TCP/IP'),
    ('test', '10244156', 'CD001', 'TOM001', 'IN', 15.000, 1.000, 14.000, '2026-10-03T07:52:33.253Z', 'NV001', 'TCP/IP'),
    ('test', '10244156', 'CD001', 'TOM001', 'IN', 15.000, 1.000, 14.000, '2026-10-03T07:52:41.285Z', 'NV001', 'TCP/IP'),
    ('loconc', '10244156', 'CD001', 'TOM001', 'IN', 19.195, 1.120, 18.075, '2026-10-05T02:57:34.753Z', '123441', 'SIM_f7422'),
    ('L0001', 'CAN001', 'CD001', 'TP001', 'IN', 25.500, 0.500, 25.000, '2026-10-05T10:20:30.000Z', 'NV001', 'TEST-PC-01'),
    ('L0001', 'CAN001', 'CD001', 'TP001', 'IN', 25.500, 0.500, 25.000, '2026-10-05T10:20:30.000Z', 'NV003', 'TEST-PC-01'),
    ('L0001', 'CAN002', 'CD001', 'TP001', 'IN', 25.500, 0.500, 25.000, '2026-10-05T10:20:30.000Z', 'NV003', 'TEST-PC-01'),
    ('L0003', '7779460', 'CD001', 'TP002', 'IN', 6.013, 0.735, 5.278, '2026-10-05T12:05:03.000Z', 'NV003', '7779460-2'),
    ('L0002', '7779460', 'CD001', 'TP002', 'IN', 32.374, 0.457, 31.917, '2026-10-05T12:05:09.000Z', 'NV003', '7779460-2'),
    ('L0003', '7779460', 'CD001', 'TP002', 'IN', 31.244, 0.366, 30.878, '2026-10-05T12:05:12.000Z', 'NV002', '7779460-2'),
    ('L0002', '7779460', 'CD001', 'TP002', 'IN', 30.496, 0.864, 29.632, '2026-10-05T12:05:16.000Z', 'NV002', '7779460-2'),
    ('L0002', '7779460', 'CD001', 'TP003', 'IN', 49.966, 0.786, 49.180, '2026-10-05T12:05:27.000Z', 'NV002', '7779460-2'),
    ('L0001', '10244161', 'CD006', 'SP-DH-01', 'OUT', 22.800, 0.800, 22.000, '2026-10-05T13:40:00.000Z', 'NV001', 'TCP/IP'),
    ('L0001', '10244167', 'CD012', 'SP-CX-01', 'OUT', 34.200, 1.200, 33.000, '2026-10-05T15:10:00.000Z', 'NV002', 'TCP/IP'),
    ('L0002', '10244163', 'CD008', 'SP-CN-01', 'OUT', 42.500, 1.500, 41.000, '2026-10-05T16:00:00.000Z', 'NV003', 'TCP/IP'),
    ('L0002', '10244168', 'CD013', 'SP-CC-01', 'OUT', 38.600, 1.200, 37.400, '2026-10-05T17:30:00.000Z', 'NV002', 'TCP/IP'),
    ('L0003', '10244170', 'CD015', 'SP-IC-01', 'OUT', 27.200, 1.000, 26.200, '2026-10-05T18:15:00.000Z', 'NV001', 'TCP/IP'),
    ('test', '10244167', 'CD012', 'SP-CX-01', 'OUT', 31.500, 1.500, 30.000, '2026-10-03T11:20:00.000Z', 'NV001', 'SIM_f7422'),
    ('L0001', '10244157', 'CD002', 'SP-PC-01', 'IN', 48.500, 1.500, 47.000, '2026-10-05T11:00:00.000Z', 'NV002', 'TCP/IP'),
    ('L0001', '10244173', 'CD002', 'SP-PC-01', 'OUT', 46.200, 1.200, 45.000, '2026-10-05T11:30:00.000Z', 'NV002', 'TCP/IP'),
    ('L0001', '10244158', 'CD003', 'SP-XK-01', 'IN', 45.000, 1.000, 44.000, '2026-10-05T11:45:00.000Z', 'NV003', 'RS-232'),
    ('L0001', '10244174', 'CD003', 'SP-XK-01', 'OUT', 44.000, 1.000, 43.000, '2026-10-05T12:15:00.000Z', 'NV003', 'RS-232'),
    ('L0001', '10244159', 'CD004', 'SP-BV-01', 'IN', 43.000, 1.000, 42.000, '2026-10-05T12:30:00.000Z', 'NV001', 'TCP/IP'),
    ('L0001', '10244175', 'CD004', 'SP-BV-01', 'OUT', 34.500, 1.000, 33.500, '2026-10-05T13:15:00.000Z', 'NV001', 'TCP/IP'),
    ('L0001', '10244160', 'CD005', 'SP-PG-01', 'IN', 34.500, 1.500, 33.000, '2026-10-05T13:30:00.000Z', 'NV002', 'TCP/IP'),
    ('L0001', '10244176', 'CD005', 'SP-PG-01', 'OUT', 37.000, 1.500, 35.500, '2026-10-05T14:15:00.000Z', 'NV002', 'TCP/IP'),
    ('L0002', '10244162', 'CD007', 'SP-TB-01', 'IN', 31.000, 1.000, 30.000, '2026-10-05T14:45:00.000Z', 'NV003', 'TCP/IP'),
    ('L0002', '10244177', 'CD007', 'SP-TB-01', 'OUT', 43.500, 1.500, 42.000, '2026-10-05T15:30:00.000Z', 'NV003', 'TCP/IP'),
    ('L0003', '10244164', 'CD009', 'SP-PD-01', 'IN', 26.000, 1.000, 25.000, '2026-10-05T15:00:00.000Z', 'NV001', 'TCP/IP'),
    ('L0003', '10244178', 'CD009', 'SP-PD-01', 'OUT', 23.000, 1.000, 22.000, '2026-10-05T15:40:00.000Z', 'NV001', 'TCP/IP'),
    ('L0003', '10244165', 'CD010', 'SP-HL-01', 'IN', 29.000, 1.000, 28.000, '2026-10-05T16:00:00.000Z', 'NV002', 'TCP/IP'),
    ('L0003', '10244179', 'CD010', 'SP-HL-01', 'OUT', 27.200, 1.000, 26.200, '2026-10-05T16:45:00.000Z', 'NV002', 'TCP/IP'),
    ('L0003', '10244166', 'CD011', 'SP-TV-01', 'IN', 27.000, 1.000, 26.000, '2026-10-05T17:00:00.000Z', 'NV003', 'TCP/IP'),
    ('L0003', '10244180', 'CD011', 'SP-TV-01', 'OUT', 21.800, 1.000, 20.800, '2026-10-05T17:45:00.000Z', 'NV003', 'TCP/IP'),
    ('L0002', '10244169', 'CD014', 'SP-IQ-01', 'IN', 31.000, 1.000, 30.000, '2026-10-05T18:00:00.000Z', 'NV001', 'TCP/IP'),
    ('L0002', '10244181', 'CD014', 'SP-IQ-01', 'OUT', 30.600, 1.200, 29.400, '2026-10-05T18:40:00.000Z', 'NV001', 'TCP/IP')
]

def seed_sqlite(db_file: Path):
    """Seed data vào SQLite database"""
    print(f"📦 [SQLite] Đang khởi tạo và nạp dữ liệu vào: {db_file}")
    db_file.parent.mkdir(parents=True, exist_ok=True)
    
    conn = sqlite3.connect(db_file)
    cur = conn.cursor()
    
    # 1. Chạy schema init
    init_sql_path = BASE_DIR / 'database' / 'init_sqlite.sql'
    if init_sql_path.exists():
        with open(init_sql_path, 'r', encoding='utf-8') as f:
            cur.executescript(f.read())
    
    # 2. Seed Process
    for p in PROCESSES:
        cur.execute("""
            INSERT OR REPLACE INTO process 
            (process_id, process_name, flow_title, col_index, row_index, description, color_bg, color_border, color_text)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, p)
    print(f"  ✅ Seeded {len(PROCESSES)} processes")

    # 3. Seed Process Mapping
    for m in PROCESS_MAPPINGS:
        cur.execute("""
            INSERT OR REPLACE INTO process_mapping 
            (mapping_id, from_process_id, to_process_id, transition_type, description, order_index, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (m[0], m[1], m[2], m[3], m[4], m[5], 1 if m[6] else 0))
    print(f"  ✅ Seeded {len(PROCESS_MAPPINGS)} process mappings")

    # 4. Seed Batches
    for b in BATCHES:
        cur.execute("INSERT OR IGNORE INTO batch (batch_id, batch_name, status) VALUES (?, ?, ?)", b)
    print(f"  ✅ Seeded {len(BATCHES)} batches")

    # 5. Seed Products
    for pr in PRODUCTS:
        cur.execute("""
            INSERT OR REPLACE INTO product 
            (product_id, product_name, stage_id, type, unit, spec, is_end)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (pr[0], pr[1], pr[2], pr[3], pr[4], pr[5], 1 if pr[6] else 0))
    print(f"  ✅ Seeded {len(PRODUCTS)} products")

    # 6. Seed Stations
    for s in STATIONS:
        cur.execute("""
            INSERT OR REPLACE INTO station_weigh 
            (station_id, station_name, process_id, io_type, indicator_model, model, status, is_active, max_weight, division, protocol, address, location)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (s[0], s[1], s[2], s[3], s[4], s[5], s[6], 1 if s[7] else 0, s[8], s[9], s[10], s[11], s[12]))
    print(f"  ✅ Seeded {len(STATIONS)} weigh stations")

    # 7. Seed Logs
    cur.execute("DELETE FROM production_weight_logs")
    for l in LOGS:
        cur.execute("""
            INSERT INTO production_weight_logs 
            (batch_id, station_id, process_id, product_id, type_weight, value_weight, tare_weight, net_weight, time_action, employee_id, source_method)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, l)
    print(f"  ✅ Seeded {len(LOGS)} production weight logs")

    conn.commit()
    conn.close()
    print("🎉 [SQLite] HOÀN TẤT NẠP DỮ LIỆU THÀNH CÔNG!\n")


def seed_postgres(database_url: str):
    """Seed data vào PostgreSQL database"""
    try:
        import psycopg2
    except ImportError:
        print("⚠️ Chưa cài đặt 'psycopg2' hoặc 'psycopg2-binary'. Hãy chạy: pip install psycopg2-binary")
        return

    print(f"🐘 [PostgreSQL] Đang kết nối và nạp dữ liệu...")
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()

    # 1. Chạy schema init
    init_sql_path = BASE_DIR / 'database' / 'init_db.sql'
    if init_sql_path.exists():
        with open(init_sql_path, 'r', encoding='utf-8') as f:
            cur.execute(f.read())

    # 2. Seed Process
    for p in PROCESSES:
        cur.execute("""
            INSERT INTO process (process_id, process_name, flow_title, col_index, row_index, description, color_bg, color_border, color_text)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (process_id) DO UPDATE SET
              process_name = EXCLUDED.process_name,
              flow_title = EXCLUDED.flow_title,
              col_index = EXCLUDED.col_index,
              row_index = EXCLUDED.row_index,
              description = EXCLUDED.description
        """, p)

    # 3. Seed Mappings
    for m in PROCESS_MAPPINGS:
        cur.execute("""
            INSERT INTO process_mapping (mapping_id, from_process_id, to_process_id, transition_type, description, order_index, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (mapping_id) DO UPDATE SET
              from_process_id = EXCLUDED.from_process_id,
              to_process_id = EXCLUDED.to_process_id,
              transition_type = EXCLUDED.transition_type,
              description = EXCLUDED.description
        """, m)

    # 4. Seed Batches
    for b in BATCHES:
        cur.execute("""
            INSERT INTO batch (batch_id, batch_name, status)
            VALUES (%s, %s, %s)
            ON CONFLICT (batch_id) DO NOTHING
        """, b)

    # 5. Seed Products
    for pr in PRODUCTS:
        cur.execute("""
            INSERT INTO product (product_id, product_name, stage_id, type, unit, spec, is_end)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (product_id) DO UPDATE SET
              product_name = EXCLUDED.product_name,
              stage_id = EXCLUDED.stage_id,
              spec = EXCLUDED.spec
        """, pr)

    # 6. Seed Stations
    for s in STATIONS:
        cur.execute("""
            INSERT INTO station_weigh (station_id, station_name, process_id, io_type, indicator_model, model, status, is_active, max_weight, division, protocol, address, location)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (station_id) DO UPDATE SET
              station_name = EXCLUDED.station_name,
              process_id = EXCLUDED.process_id,
              io_type = EXCLUDED.io_type,
              address = EXCLUDED.address,
              location = EXCLUDED.location
        """, s)

    # 7. Seed Logs
    cur.execute("TRUNCATE TABLE production_weight_logs RESTART IDENTITY;")
    for l in LOGS:
        cur.execute("""
            INSERT INTO production_weight_logs (batch_id, station_id, process_id, product_id, type_weight, value_weight, tare_weight, net_weight, time_action, employee_id, source_method)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, l)

    conn.commit()
    conn.close()
    print("🎉 [PostgreSQL] HOÀN TẤT NẠP DỮ LIỆU THÀNH CÔNG!\n")


def main():
    db_url = os.getenv('DATABASE_URL', '')
    if db_url.startswith('postgres://') or db_url.startswith('postgresql://'):
        seed_postgres(db_url)
    else:
        # Mặc định dùng SQLite
        db_path = BASE_DIR / 'database' / 'weigh_dashboard.db'
        seed_sqlite(db_path)

if __name__ == '__main__':
    main()
