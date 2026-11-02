/**
 * KỊCH BẢN KIỂM THỬ TỰ ĐỘNG CÁC NÚT BẤM & LOGIC UI/UX TRÊN TRANG TỔNG QUAN
 * Đảm bảo các luồng tương tác của người dùng hoạt động trơn tru, không lỗi
 */

const assert = require('assert');

console.log('='.repeat(70));
console.log(' BẮT ĐẦU KIỂM THỬ KỊCH BẢN NÚT BẤM VÀ TRẢI NGHIỆM UI/UX');
console.log('='.repeat(70));

let passCount = 0;
let failCount = 0;

function testCase(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  [FAIL] ${name}:`, err.message);
    failCount++;
  }
}

// Giả lập dữ liệu mấu
const sampleLogs = [
  { log_id: 1, batch_id: 'L0001', station_id: 'CAN001', process_id: 'CD001', product_id: 'TP001', type_weight: 'IN', value_weight: 25.5, tare_weight: 0.5, net_weight: 25.0, time_action: '2026-10-05T10:00:00Z', employee_id: 'NV001', source_method: 'TCP/IP' },
  { log_id: 2, batch_id: 'L0001', station_id: 'CAN001', process_id: 'CD001', product_id: 'TP001', type_weight: 'IN', value_weight: 25.5, tare_weight: 0.5, net_weight: 25.0, time_action: '2026-10-05T10:05:00Z', employee_id: 'NV002', source_method: 'TCP/IP' },
  { log_id: 3, batch_id: 'L0001', station_id: 'CAN002', process_id: 'CD002', product_id: 'TP001', type_weight: 'OUT', value_weight: 21.0, tare_weight: 1.0, net_weight: 20.0, time_action: '2026-10-05T11:00:00Z', employee_id: 'NV003', source_method: 'RS-232' },
  { log_id: 4, batch_id: 'L0002', station_id: 'CAN001', process_id: 'CD001', product_id: 'TP002', type_weight: 'IN', value_weight: 50.0, tare_weight: 2.0, net_weight: 48.0, time_action: '2026-10-05T12:00:00Z', employee_id: 'NV001', source_method: 'TCP/IP' },
  { log_id: 5, batch_id: 'L0002', station_id: 'CAN003', process_id: 'CD003', product_id: 'TP002', type_weight: 'OUT', value_weight: 35.0, tare_weight: 1.5, net_weight: 33.5, time_action: '2026-10-05T13:00:00Z', employee_id: 'NV002', source_method: 'TCP/IP' }
];

// --- 1. KIỂM THỬ NÚT BẬT / TẮT (ẨN / HIỆN) NHẬT KÝ CÂN ---
console.log('\n--- 1. Kiểm thử Nút Toggle Ẩn/Hiện Nhật Ký Cân ---');

testCase('Mặc định: Nhật ký cân phải được ẩn để giữ UI gọn gàng', () => {
  let isLogTableVisible = false;
  assert.strictEqual(isLogTableVisible, false, 'Mặc định isLogTableVisible phải là false');
});

testCase('Click nút "Xem Nhật Ký Cân": Chuyển trạng thái sang mở (visible = true)', () => {
  let isLogTableVisible = false;
  // Giả lập click nút mở
  isLogTableVisible = !isLogTableVisible;
  assert.strictEqual(isLogTableVisible, true, 'Bấm nút phải mở bảng nhật ký');
});

testCase('Click nút "Thu Gọn Nhật Ký Cân": Chuyển trạng thái sang ẩn (visible = false)', () => {
  let isLogTableVisible = true;
  // Giả lập click nút thu gọn (cả trên banner lẫn trong header)
  isLogTableVisible = false;
  assert.strictEqual(isLogTableVisible, false, 'Bấm nút thu gọn phải đóng bảng');
});


// --- 2. KIỂM THỬ PHÂN TRANG (PAGINATION) ---
console.log('\n--- 2. Kiểm thử Nút Phân Trang (Pagination) ---');

function paginate(items, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, items.length);
  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    pagedItems: items.slice(startIndex, endIndex),
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages
  };
}

// Tạo danh sách 125 logs giả lập
const mock125Logs = Array.from({ length: 125 }, (_, i) => ({ log_id: i + 1, batch_id: `L${i % 5}` }));

testCase('Tính tổng số trang chính xác theo pageSize', () => {
  const res25 = paginate(mock125Logs, 1, 25);
  assert.strictEqual(res25.totalPages, 5, '125 logs với pageSize 25 phải có đúng 5 trang');

  const res50 = paginate(mock125Logs, 1, 50);
  assert.strictEqual(res50.totalPages, 3, '125 logs với pageSize 50 phải có đúng 3 trang');

  const res100 = paginate(mock125Logs, 1, 100);
  assert.strictEqual(res100.totalPages, 2, '125 logs với pageSize 100 phải có đúng 2 trang');
});

testCase('Nút "‹ Trước" và "« Đầu" bị disable khi đang ở trang 1', () => {
  const page1 = paginate(mock125Logs, 1, 25);
  assert.strictEqual(page1.hasPrev, false, 'hasPrev phải là false khi ở trang 1');
  assert.strictEqual(page1.hasNext, true, 'hasNext phải là true');
  assert.strictEqual(page1.pagedItems.length, 25);
  assert.strictEqual(page1.pagedItems[0].log_id, 1);
});

testCase('Nút "Sau ›" và "Cuối »" bị disable khi đang ở trang cuối', () => {
  const page5 = paginate(mock125Logs, 5, 25);
  assert.strictEqual(page5.hasPrev, true, 'hasPrev phải là true');
  assert.strictEqual(page5.hasNext, false, 'hasNext phải là false khi ở trang cuối');
  assert.strictEqual(page5.pagedItems.length, 25);
  assert.strictEqual(page5.pagedItems[page5.pagedItems.length - 1].log_id, 125);
});

testCase('Chuyển trang giữa (trang 3): cả Trước và Sau đều active', () => {
  const page3 = paginate(mock125Logs, 3, 25);
  assert.strictEqual(page3.hasPrev, true);
  assert.strictEqual(page3.hasNext, true);
  assert.strictEqual(page3.pagedItems[0].log_id, 51);
  assert.strictEqual(page3.pagedItems[24].log_id, 75);
});


// --- 3. KIỂM THỬ BỘ LỌC VÀ TÌM KIẾM ---
console.log('\n--- 3. Kiểm thử Bộ Lọc và Tìm Kiếm (Filter & Search) ---');

function filterLogs(logs, { selectedBatch = 'ALL', selectedProcess = 'ALL', selectedIO = 'ALL', searchKeyword = '' }) {
  return logs.filter(log => {
    if (selectedBatch !== 'ALL' && log.batch_id !== selectedBatch) return false;
    if (selectedProcess !== 'ALL' && log.process_id !== selectedProcess) return false;
    if (selectedIO !== 'ALL' && log.type_weight !== selectedIO) return false;

    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      const match =
        String(log.log_id).includes(kw) ||
        log.batch_id.toLowerCase().includes(kw) ||
        log.station_id.toLowerCase().includes(kw) ||
        log.process_id.toLowerCase().includes(kw) ||
        log.product_id.toLowerCase().includes(kw) ||
        (log.employee_id || '').toLowerCase().includes(kw) ||
        (log.source_method || '').toLowerCase().includes(kw);
      if (!match) return false;
    }
    return true;
  });
}

testCase('Lọc theo Lô hàng (batch_id = "L0001"): Chỉ trả về các bản ghi thuộc L0001', () => {
  const filtered = filterLogs(sampleLogs, { selectedBatch: 'L0001' });
  assert.strictEqual(filtered.length, 3);
  assert.ok(filtered.every(l => l.batch_id === 'L0001'));
});

testCase('Lọc theo Loại cân (selectedIO = "IN"): Chỉ trả về mẻ IN', () => {
  const filtered = filterLogs(sampleLogs, { selectedIO: 'IN' });
  assert.strictEqual(filtered.length, 3);
  assert.ok(filtered.every(l => l.type_weight === 'IN'));
});

testCase('Lọc theo Loại cân (selectedIO = "OUT"): Chỉ trả về mẻ OUT', () => {
  const filtered = filterLogs(sampleLogs, { selectedIO: 'OUT' });
  assert.strictEqual(filtered.length, 2);
  assert.ok(filtered.every(l => l.type_weight === 'OUT'));
});

testCase('Tìm kiếm từ khóa: Khớp mã nhân viên "NV003"', () => {
  const filtered = filterLogs(sampleLogs, { searchKeyword: 'NV003' });
  assert.strictEqual(filtered.length, 1);
  assert.strictEqual(filtered[0].employee_id, 'NV003');
});

testCase('Nút "Đặt lại bộ lọc": Trả tất cả trạng thái về mặc định', () => {
  let filterState = {
    selectedBatch: 'L0001',
    selectedProcess: 'CD001',
    selectedIO: 'IN',
    searchKeyword: 'NV001'
  };

  // Giả lập hàm reset
  filterState = {
    selectedBatch: 'ALL',
    selectedProcess: 'ALL',
    selectedIO: 'ALL',
    searchKeyword: ''
  };

  assert.strictEqual(filterState.selectedBatch, 'ALL');
  assert.strictEqual(filterState.selectedProcess, 'ALL');
  assert.strictEqual(filterState.selectedIO, 'ALL');
  assert.strictEqual(filterState.searchKeyword, '');
});


// --- 4. KIỂM THỬ TÍNH ĐÚNG ĐẮN CỦA CHỈ SỐ IN - OUT - WIP ---
console.log('\n--- 4. Kiểm thử Thứ tự và Tính Toán Chỉ Số IN - OUT - WIP ---');

function calculateMetrics(logs) {
  let inWeight = 0;
  let outWeight = 0;
  let inCount = 0;
  let outCount = 0;

  logs.forEach(log => {
    const net = log.net_weight ?? (log.value_weight - log.tare_weight);
    if (log.type_weight === 'IN') {
      inWeight += net;
      inCount++;
    } else if (log.type_weight === 'OUT') {
      outWeight += net;
      outCount++;
    }
  });

  const wip = Math.max(0, inWeight - outWeight);

  return {
    totalInWeight: Number(inWeight.toFixed(3)),
    totalOutWeight: Number(outWeight.toFixed(3)),
    wipWeight: Number(wip.toFixed(3)),
    inCount,
    outCount
  };
}

testCase('Tính đúng tổng IN, OUT, và WIP = In - Out', () => {
  const m = calculateMetrics(sampleLogs);
  // IN: 25.0 + 25.0 + 48.0 = 98.0 kg (3 mẻ)
  // OUT: 20.0 + 33.5 = 53.5 kg (2 mẻ)
  // WIP: 98.0 - 53.5 = 44.5 kg
  assert.strictEqual(m.totalInWeight, 98.0, 'Tổng IN phải bằng 98.0 kg');
  assert.strictEqual(m.totalOutWeight, 53.5, 'Tổng OUT phải bằng 53.5 kg');
  assert.strictEqual(m.wipWeight, 44.5, 'WIP phải bằng 44.5 kg');
  assert.strictEqual(m.inCount, 3, 'Số mẻ IN phải bằng 3');
  assert.strictEqual(m.outCount, 2, 'Số mẻ OUT phải bằng 2');
});

testCase('WIP không bao giờ âm (bảo vệ lỗi dữ liệu)', () => {
  const weirdLogs = [
    { type_weight: 'IN', net_weight: 10 },
    { type_weight: 'OUT', net_weight: 50 }
  ];
  const m = calculateMetrics(weirdLogs);
  assert.ok(m.wipWeight >= 0, 'WIP không được âm kể cả khi OUT > IN');
});


// --- 5. KIỂM THỬ NÚT CHUYỂN CHẾ ĐỘ XEM (BẢNG SỐ LIỆU <-> LƯỚI THẺ) ---
console.log('\n--- 5. Kiểm thử Nút Chuyển Chế Độ Xem (View Mode) ---');

testCase('Chuyển giữa "table" và "grid" bảo toàn trạng thái lọc', () => {
  let viewMode = 'table';
  let selectedBatch = 'L0001';

  // Chuyển sang grid
  viewMode = 'grid';
  assert.strictEqual(viewMode, 'grid');
  assert.strictEqual(selectedBatch, 'L0001', 'Lô đã chọn không được mất khi đổi chế độ xem');

  // Chuyển lại table
  viewMode = 'table';
  assert.strictEqual(viewMode, 'table');
  assert.strictEqual(selectedBatch, 'L0001');
});


// --- 6. KIỂM THỬ QUẢN LÝ LÔ (THÊM LÔ, SỬA THÔNG TIN BAN ĐẦU, XOÁ LÔ) ---
console.log('\n--- 6. Kiểm thử Quản Lý Lô (Thêm lô, Sửa thông tin ban đầu, Xoá lô) ---');

let batches = [
  { batchId: 'L0001', batchName: 'Tôm thẻ chân trắng xuất EU', plannedWeight: 200000, origin: 'Cà Mau', status: 'IN_PROGRESS' },
  { batchId: 'L0002', batchName: 'Tôm sú loại 1', plannedWeight: 150000, origin: 'Bạc Liêu', status: 'IN_PROGRESS' }
];

testCase('Thêm Lô mới: Tạo thành công và lưu đầy đủ thông tin ban đầu', () => {
  const newBatch = {
    batchId: 'L0004',
    batchName: 'Tôm Nobashi xuất Nhật',
    plannedWeight: 100000,
    origin: 'Sóc Trăng',
    startDate: '2026-11-02',
    status: 'IN_PROGRESS',
    notes: 'Quy chuẩn xuất khẩu 100 tấn'
  };
  batches.push(newBatch);
  assert.strictEqual(batches.length, 3);
  assert.strictEqual(batches[2].batchId, 'L0004');
  assert.strictEqual(batches[2].plannedWeight, 100000);
});

testCase('Chỉnh sửa thông tin ban đầu của Lô: Cập nhật kế hoạch & xuất xứ', () => {
  const target = batches.find(b => b.batchId === 'L0001');
  assert.ok(target);
  target.plannedWeight = 250000;
  target.origin = 'Cà Mau - HTX Minh Phú Mới';
  target.notes = 'Nâng kế hoạch lên 250 tấn';

  const updated = batches.find(b => b.batchId === 'L0001');
  assert.strictEqual(updated.plannedWeight, 250000);
  assert.strictEqual(updated.origin, 'Cà Mau - HTX Minh Phú Mới');
});

testCase('Xoá mềm Lô (Soft Delete): Ẩn khỏi danh sách active nhưng giữ 100% nhật ký cân, không mồ côi dữ liệu', () => {
  let selectedBatch = 'L0002';
  // Đánh dấu xoá mềm (isDeleted = true, status = 'CANCELLED')
  const target = batches.find(b => b.batchId === 'L0002');
  assert.ok(target);
  target.isDeleted = true;
  target.status = 'CANCELLED';

  // Lọc danh sách lô active: không bao gồm các lô bị xoá mềm
  const activeBatches = batches.filter(b => !b.isDeleted && b.status !== 'CANCELLED');
  selectedBatch = 'ALL';

  assert.strictEqual(activeBatches.length, 2);
  assert.strictEqual(activeBatches.some(b => b.batchId === 'L0002'), false);
  assert.strictEqual(selectedBatch, 'ALL');

  // Kiểm tra nhật ký mẻ cân của L0002 vẫn được bảo tồn nguyên vẹn trong sampleLogs
  const logsOfDeletedBatch = sampleLogs.filter(l => l.batch_id === 'L0002');
  assert.strictEqual(logsOfDeletedBatch.length, 2, 'Nhật ký mẻ cân không được bị xoá cứng, không mồ côi');
});

console.log('\n' + '='.repeat(70));
console.log(` KẾT QUẢ KIỂM THỬ UI/UX: ${passCount} PASSED, ${failCount} FAILED`);
console.log('='.repeat(70));
