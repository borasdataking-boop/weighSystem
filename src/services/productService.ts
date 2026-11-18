import { ProductItem, ProductIOType, ProductStageAssignment } from '../types/product.types';

const STORAGE_KEY = 'pms_products_data_v4';

// Danh mục mặt hàng sản phẩm chuẩn quy cách theo từng công đoạn chế biến tôm xuất khẩu
export const DEFAULT_PRODUCTS: ProductItem[] = [
  // CD001: Tiếp nhận nguyên liệu (Khớp 100% với các mã trong mẻ cân: TOM001, TP001, TP002, TP003)
  {
    id: 'TOM001',
    name: 'Tôm nguyên liệu tươi sống',
    stageId: 'CD001',
    ioType: 'IN',
    assignments: [{ stageId: 'CD001', ioType: 'IN' }],
    type: 'SEMI',
    unit: 'kg',
    spec: 'Tôm thẻ chân trắng tươi sống nhập từ đầm nuôi'
  },
  {
    id: 'TP001',
    name: 'Tôm nguyên liệu loại 1',
    stageId: 'CD001',
    ioType: 'OUT',
    assignments: [
      { stageId: 'CD001', ioType: 'OUT' },
      { stageId: 'CD002', ioType: 'IN' }
    ],
    type: 'SEMI',
    unit: 'kg',
    spec: 'Tôm đạt chuẩn kích cỡ và độ tươi loại 1'
  },
  {
    id: 'TP002',
    name: 'Tôm nguyên liệu loại 2',
    stageId: 'CD001',
    ioType: 'OUT',
    assignments: [
      { stageId: 'CD001', ioType: 'OUT' },
      { stageId: 'CD002', ioType: 'IN' }
    ],
    type: 'SEMI',
    unit: 'kg',
    spec: 'Tôm đạt chuẩn loại 2 chuyển phân cỡ'
  },
  {
    id: 'TP003',
    name: 'Tôm dập gãy phân loại',
    stageId: 'CD001',
    ioType: 'OUT',
    assignments: [{ stageId: 'CD001', ioType: 'OUT' }],
    type: 'BYPRODUCT',
    unit: 'kg',
    spec: 'Tôm dập gãy, đứt đầu chuyển phụ phẩm'
  },
  {
    id: 'SP-TN-01',
    name: 'Tôm nguyên liệu đạt chuẩn',
    stageId: 'CD001',
    ioType: 'IN',
    assignments: [
      { stageId: 'CD001', ioType: 'IN' },
      { stageId: 'CD001', ioType: 'OUT' }
    ],
    type: 'SEMI',
    unit: 'kg',
    spec: 'Tôm tươi sống, nguyên con, ướp đá tỷ lệ 1:1'
  },
  {
    id: 'SP-TN-02',
    name: 'Tôm thứ phẩm / Dập nát',
    stageId: 'CD001',
    ioType: 'OUT',
    assignments: [{ stageId: 'CD001', ioType: 'OUT' }],
    type: 'BYPRODUCT',
    unit: 'kg',
    spec: 'Tôm dập gãy, đứt đầu, chuyển phân loại phụ phẩm'
  },
  {
    id: 'SP-TN-03',
    name: 'Tôm sống chuyển xử lý nhanh',
    stageId: 'CD001',
    ioType: 'OUT',
    assignments: [{ stageId: 'CD001', ioType: 'OUT' }],
    type: 'SEMI',
    unit: 'kg',
    spec: 'Tôm kích thước đồng đều, chuyển trực tiếp cấp đông hoặc ngâm phụ gia'
  },

  // CD002: Rửa 1 & Phân cỡ sơ bộ
  {
    id: 'SP-PC-01',
    name: 'Tôm thẻ phân cỡ lớn (size 20-25)',
    stageId: 'CD002',
    ioType: 'OUT',
    assignments: [
      { stageId: 'CD002', ioType: 'OUT' },
      { stageId: 'CD003', ioType: 'IN' }
    ],
    type: 'SEMI',
    unit: 'kg',
    spec: 'Kích cỡ 20-25 con/kg, tôm loại 1'
  },
  {
    id: 'SP-PC-02',
    name: 'Tôm thẻ phân cỡ vừa (size 30-40)',
    stageId: 'CD002',
    ioType: 'OUT',
    assignments: [
      { stageId: 'CD002', ioType: 'OUT' },
      { stageId: 'CD003', ioType: 'IN' }
    ],
    type: 'SEMI',
    unit: 'kg',
    spec: 'Kích cỡ 30-40 con/kg, tôm loại 2'
  },
  {
    id: 'SP-PC-03',
    name: 'Tôm dạt gãy thân',
    stageId: 'CD002',
    ioType: 'OUT',
    assignments: [{ stageId: 'CD002', ioType: 'OUT' }],
    type: 'BYPRODUCT',
    unit: 'kg',
    spec: 'Tôm lỗi cơ học trong quá trình máy quay phân cỡ'
  },
  {
    id: 'SP-PC-04',
    name: 'Tôm thẻ cỡ nhỏ (size 50-60)',
    stageId: 'CD002',
    ioType: 'OUT',
    assignments: [
      { stageId: 'CD002', ioType: 'OUT' },
      { stageId: 'CD004', ioType: 'IN' }
    ],
    type: 'SEMI',
    unit: 'kg',
    spec: 'Kích cỡ 50-60 con/kg, chuyển bóc vỏ tẩm bột'
  },

  // CD003: Xếp khuôn & Định lượng
  {
    id: 'SP-XK-01',
    name: 'Block tôm xếp khuôn 2kg',
    stageId: 'CD003',
    ioType: 'OUT',
    assignments: [
      { stageId: 'CD003', ioType: 'OUT' },
      { stageId: 'CD004', ioType: 'IN' }
    ],
    type: 'SEMI',
    unit: 'khay',
    spec: 'Khuôn inox tiêu chuẩn, trọng lượng tịnh 2.0kg ± 10g'
  },
  {
    id: 'SP-XK-02',
    name: 'Mẻ tôm rổ chuyển bóc vỏ',
    stageId: 'CD003',
    ioType: 'OUT',
    assignments: [
      { stageId: 'CD003', ioType: 'OUT' },
      { stageId: 'CD004', ioType: 'IN' }
    ],
    type: 'SEMI',
    unit: 'rổ',
    spec: 'Rổ nhựa chuyên dụng xưởng 5kg/rổ'
  },
  {
    id: 'SP-XK-03',
    name: 'Block tôm xếp khuôn 1.8kg xuất khẩu',
    stageId: 'CD003',
    ioType: 'OUT',
    assignments: [
      { stageId: 'CD003', ioType: 'OUT' },
      { stageId: 'CD005', ioType: 'IN' }
    ],
    type: 'SEMI',
    unit: 'khay',
    spec: 'Khuôn định hình 1.8kg tịnh xuất khẩu thị trường Châu Á'
  },

  // CD004: Sơ chế (Bóc vỏ & Rút chỉ)
  {
    id: 'SP-BV-01',
    name: 'Tôm thịt PTO rút chỉ',
    stageId: 'CD004',
    ioType: 'OUT',
    assignments: [
      { stageId: 'CD004', ioType: 'OUT' },
      { stageId: 'CD005', ioType: 'IN' }
    ],
    type: 'SEMI',
    unit: 'kg',
    spec: 'Lột vỏ chừa đuôi (Peeled Tail On), rút sạch chỉ lưng'
  },
  {
    id: 'SP-BV-02',
    name: 'Tôm thịt PUD lột sạch',
    stageId: 'CD004',
    ioType: 'OUT',
    assignments: [
      { stageId: 'CD004', ioType: 'OUT' },
      { stageId: 'CD005', ioType: 'IN' }
    ],
    type: 'SEMI',
    unit: 'kg',
    spec: 'Lột sạch hoàn toàn vỏ và đuôi (Peeled Undeveined)'
  },
  {
    id: 'SP-BV-03',
    name: 'Vỏ và đầu tôm thu hồi',
    stageId: 'CD004',
    ioType: 'OUT',
    assignments: [{ stageId: 'CD004', ioType: 'OUT' }],
    type: 'BYPRODUCT',
    unit: 'kg',
    spec: 'Thu gom làm nguyên liệu sản xuất Chitin / Thức ăn chăn nuôi'
  },

  // CD005: Ngâm xử lý phụ gia
  {
    id: 'SP-PG-01',
    name: 'Tôm ngâm Non-Phosphate đạt trọng',
    stageId: 'CD005',
    ioType: 'OUT',
    assignments: [
      { stageId: 'CD005', ioType: 'OUT' },
      { stageId: 'CD006', ioType: 'IN' },
      { stageId: 'CD009', ioType: 'IN' }
    ],
    type: 'SEMI',
    unit: 'kg',
    spec: 'Xử lý dung dịch muối khoáng tăng trọng tự nhiên 5-8%'
  },
  {
    id: 'SP-PG-02',
    name: 'Tôm ngâm STPP đạt chuẩn',
    stageId: 'CD005',
    ioType: 'OUT',
    assignments: [
      { stageId: 'CD005', ioType: 'OUT' },
      { stageId: 'CD010', ioType: 'IN' },
      { stageId: 'CD014', ioType: 'IN' }
    ],
    type: 'SEMI',
    unit: 'kg',
    spec: 'Ngâm Sodium Tripolyphosphate đạt tiêu chuẩn dư lượng US/EU'
  },

  // CD006: Định hình Nobashi / Xẻ bướm
  {
    id: 'SP-DH-01',
    name: 'Tôm duỗi Nobashi khay',
    stageId: 'CD006',
    ioType: 'OUT',
    assignments: [
      { stageId: 'CD006', ioType: 'OUT' },
      { stageId: 'CD007', ioType: 'IN' }
    ],
    type: 'SEMI',
    unit: 'khay',
    spec: 'Duỗi thẳng thân tôm, khay 20 con / 25 con xuất Nhật'
  },
  {
    id: 'SP-DH-02',
    name: 'Tôm xẻ bướm Butterfly',
    stageId: 'CD006',
    ioType: 'OUT',
    assignments: [
      { stageId: 'CD006', ioType: 'OUT' },
      { stageId: 'CD007', ioType: 'IN' }
    ],
    type: 'SEMI',
    unit: 'khay',
    spec: 'Xẻ dọc lưng tôm tạo hình bướm, trải khay định hình'
  },

  // CD007: Tẩm bột chiên xù
  {
    id: 'SP-TB-01',
    name: 'Tôm tẩm bột xù Panko trắng',
    stageId: 'CD007',
    ioType: 'OUT',
    assignments: [
      { stageId: 'CD007', ioType: 'OUT' },
      { stageId: 'CD008', ioType: 'IN' }
    ],
    type: 'SEMI',
    unit: 'khay',
    spec: 'Tỷ lệ bột áo 40%, bột xù Panko hạt nhỏ trắng'
  },
  {
    id: 'SP-TB-02',
    name: 'Bột tẩm dư thu hồi',
    stageId: 'CD007',
    ioType: 'OUT',
    assignments: [{ stageId: 'CD007', ioType: 'OUT' }],
    type: 'BYPRODUCT',
    unit: 'kg',
    spec: 'Bột vụn rơi rớt qua sàng lọc chuyền'
  },

  // CD008: Chiên định hình dầu nóng
  {
    id: 'SP-CN-01',
    name: 'Tôm sơ chiên giòn định hình',
    stageId: 'CD008',
    ioType: 'OUT',
    assignments: [
      { stageId: 'CD008', ioType: 'OUT' },
      { stageId: 'CD012', ioType: 'IN' },
      { stageId: 'CD013', ioType: 'IN' }
    ],
    type: 'SEMI',
    unit: 'kg',
    spec: 'Chiên ngập dầu ở 175°C trong 45 giây, định hình lớp bột'
  },

  // CD009: Luộc / Hấp tôm nõn (PD)
  {
    id: 'SP-PD-01',
    name: 'Tôm thịt nõn hấp chín PD',
    stageId: 'CD009',
    ioType: 'OUT',
    assignments: [
      { stageId: 'CD009', ioType: 'OUT' },
      { stageId: 'CD013', ioType: 'IN' }
    ],
    type: 'SEMI',
    unit: 'kg',
    spec: 'Hấp nhiệt độ tâm > 74°C, làm lạnh tức thì bằng nước đá'
  },

  // CD010: Luộc / Hấp tôm vỏ (HLSO)
  {
    id: 'SP-HL-01',
    name: 'Tôm vỏ vặt đầu hấp chín HLSO',
    stageId: 'CD010',
    ioType: 'OUT',
    assignments: [
      { stageId: 'CD010', ioType: 'OUT' },
      { stageId: 'CD011', ioType: 'IN' }
    ],
    type: 'SEMI',
    unit: 'kg',
    spec: 'Tôm bỏ đầu giữ vỏ (Headless Shell On), màu đỏ cam đồng đều'
  },

  // CD011: Tách vỏ sau luộc
  {
    id: 'SP-TV-01',
    name: 'Tôm nõn chín bóc sạch vỏ',
    stageId: 'CD011',
    ioType: 'OUT',
    assignments: [
      { stageId: 'CD011', ioType: 'OUT' },
      { stageId: 'CD014', ioType: 'IN' },
      { stageId: 'CD015', ioType: 'IN' }
    ],
    type: 'SEMI',
    unit: 'kg',
    spec: 'Bóc vỏ chín dùng làm topping sushi / salad đóng gói'
  },
  {
    id: 'SP-TV-02',
    name: 'Vỏ tôm chín thu hồi',
    stageId: 'CD011',
    ioType: 'OUT',
    assignments: [{ stageId: 'CD011', ioType: 'OUT' }],
    type: 'BYPRODUCT',
    unit: 'kg',
    spec: 'Vỏ chín qua gia nhiệt, xuất bán cho nhà máy chiết xuất hương tôm'
  },

  // CD012: Cấp đông xoắn tôm tươi
  {
    id: 'SP-CX-01',
    name: 'Tôm tươi đông băng xoắn Spiral',
    stageId: 'CD012',
    ioType: 'OUT',
    assignments: [{ stageId: 'CD012', ioType: 'OUT' }],
    type: 'FINISHED',
    unit: 'thùng',
    spec: 'Nhiệt độ tâm -18°C, đóng gói hút chân không thùng 10kg',
    isEnd: true
  },
  {
    id: 'SP-CX-02',
    name: 'Tôm tươi đông xoắn Spiral khay 500g',
    stageId: 'CD012',
    ioType: 'OUT',
    assignments: [{ stageId: 'CD012', ioType: 'OUT' }],
    type: 'FINISHED',
    unit: 'khay',
    spec: 'Khay xốp bọc màng co PE, nhiệt độ tâm đạt -18°C',
    isEnd: true
  },
  {
    id: 'SP-CX-03',
    name: 'Tôm tươi đông xoắn bulk pack thùng 12kg',
    stageId: 'CD012',
    ioType: 'OUT',
    assignments: [{ stageId: 'CD012', ioType: 'OUT' }],
    type: 'FINISHED',
    unit: 'thùng',
    spec: 'Đóng thùng carton 12kg chuẩn xuất khẩu công nghiệp',
    isEnd: true
  },

  // CD013: Cấp đông xoắn tôm chiên
  {
    id: 'SP-CC-01',
    name: 'Tôm chiên đông băng xoắn Tempura',
    stageId: 'CD013',
    ioType: 'OUT',
    assignments: [{ stageId: 'CD013', ioType: 'OUT' }],
    type: 'FINISHED',
    unit: 'thùng',
    spec: 'Thành phẩm tôm tempura đông lạnh cấp đông sâu -35°C',
    isEnd: true
  },
  {
    id: 'SP-CC-02',
    name: 'Tôm chiên Tempura đông xoắn hộp 1kg',
    stageId: 'CD013',
    ioType: 'OUT',
    assignments: [{ stageId: 'CD013', ioType: 'OUT' }],
    type: 'FINISHED',
    unit: 'hộp',
    spec: 'Hộp giấy tráng PE 1kg, 10 hộp/thùng carton',
    isEnd: true
  },

  // CD014: Cấp đông IQF tôm tươi
  {
    id: 'SP-IQ-01',
    name: 'Tôm tươi đông rời IQF mạ băng 10%',
    stageId: 'CD014',
    ioType: 'OUT',
    assignments: [{ stageId: 'CD014', ioType: 'OUT' }],
    type: 'FINISHED',
    unit: 'thùng',
    spec: 'Đông rời từng cá thể, mạ băng bảo quản glazing 10%',
    isEnd: true
  },
  {
    id: 'SP-IQ-02',
    name: 'Tôm tươi đông rời IQF mạ băng 20%',
    stageId: 'CD014',
    ioType: 'OUT',
    assignments: [{ stageId: 'CD014', ioType: 'OUT' }],
    type: 'FINISHED',
    unit: 'thùng',
    spec: 'Đông rời từng cá thể, mạ băng bảo quản glazing 20%',
    isEnd: true
  },

  // CD015: Cấp đông IQF tôm chín
  {
    id: 'SP-IC-01',
    name: 'Tôm chín đông rời IQF xuất khẩu Mỹ',
    stageId: 'CD015',
    ioType: 'OUT',
    assignments: [{ stageId: 'CD015', ioType: 'OUT' }],
    type: 'FINISHED',
    unit: 'thùng',
    spec: 'Túi zipper 1kg x 10 túi / thùng carton 10kg',
    isEnd: true
  },
  {
    id: 'SP-IC-02',
    name: 'Pallet tôm đông xuất khẩu EU',
    stageId: 'CD015',
    ioType: 'OUT',
    assignments: [{ stageId: 'CD015', ioType: 'OUT' }],
    type: 'FINISHED',
    unit: 'pallet',
    spec: '60 thùng/pallet, quấn màng co đạt tiêu chuẩn lưu kho -25°C',
    isEnd: true
  },
  {
    id: 'SP-IC-03',
    name: 'Tôm chín đông rời IQF hấp xuất khẩu Nhật',
    stageId: 'CD015',
    ioType: 'OUT',
    assignments: [{ stageId: 'CD015', ioType: 'OUT' }],
    type: 'FINISHED',
    unit: 'túi',
    spec: 'Túi hút chân không 500g tiêu chuẩn khắt khe thị trường Nhật Bản',
    isEnd: true
  }
];

function deduplicateAssignments(assignments: ProductStageAssignment[]): ProductStageAssignment[] {
  const seen = new Set<string>();
  const result: ProductStageAssignment[] = [];
  for (const a of assignments) {
    if (!a || !a.stageId || a.stageId === 'UNASSIGNED') continue;
    const io: ProductIOType = a.ioType === 'IN' ? 'IN' : 'OUT';
    const key = `${a.stageId}__${io}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push({ stageId: a.stageId, ioType: io });
    }
  }
  return result;
}

export const productService = {
  /**
   * Chuẩn hóa dữ liệu sản phẩm để luôn đảm bảo tương thích ngược với stageId, ioType và assignments[]
   */
  normalizeProduct(p: ProductItem): ProductItem {
    const defaultMatch = DEFAULT_PRODUCTS.find(d => d.id.toUpperCase() === (p.id || '').toUpperCase());
    let assignments: ProductStageAssignment[];

    if (Array.isArray(p.assignments)) {
      assignments = deduplicateAssignments(p.assignments);
    } else if (defaultMatch?.assignments && (!p.stageId || p.stageId === defaultMatch.stageId) && !p.ioType) {
      assignments = deduplicateAssignments(defaultMatch.assignments);
    } else if (p.stageId && p.stageId !== 'UNASSIGNED') {
      const fallbackIo: ProductIOType =
        p.ioType ||
        defaultMatch?.ioType ||
        (p.stageId === 'CD001' && (p.id === 'TOM001' || p.id === 'SP-TN-01') ? 'IN' : 'OUT');
      assignments = [{ stageId: p.stageId, ioType: fallbackIo }];
    } else {
      assignments = [];
    }

    const primaryStageId = assignments[0]?.stageId || (Array.isArray(p.assignments) ? 'UNASSIGNED' : p.stageId || 'CD001');
    const primaryIoType: ProductIOType =
      assignments[0]?.ioType || p.ioType || defaultMatch?.ioType || 'OUT';

    return {
      ...p,
      id: (p.id || '').trim().toUpperCase(),
      name: (p.name || '').trim(),
      stageId: primaryStageId,
      ioType: primaryIoType,
      assignments,
      type: p.type || defaultMatch?.type || 'SEMI',
      unit: p.unit || defaultMatch?.unit || 'kg',
      spec: p.spec ?? defaultMatch?.spec ?? ''
    };
  },

  /**
   * Lấy danh sách các phân bổ (Công đoạn + IN/OUT) của một sản phẩm
   */
  getProductAssignments(product: ProductItem): ProductStageAssignment[] {
    const normalized = this.normalizeProduct(product);
    return normalized.assignments || [];
  },

  /**
   * Kiểm tra sản phẩm có được gán vào stageId (và tuỳ chọn ioType) hay không
   */
  isProductAssignedTo(product: ProductItem, stageId: string, ioType?: ProductIOType): boolean {
    const assignments = this.getProductAssignments(product);
    if (stageId === 'UNASSIGNED') {
      return assignments.length === 0;
    }
    return assignments.some(a => a.stageId === stageId && (!ioType || a.ioType === ioType));
  },

  /**
   * Tải danh mục sản phẩm trực tiếp từ Database qua Backend API
   */
  async fetchProducts(): Promise<ProductItem[]> {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const rawData: ProductItem[] = await res.json();
        const localMap = new Map(this.getProducts().map(lp => [lp.id.toUpperCase(), lp]));
        const normalized = rawData.map(item => {
          const localItem = localMap.get((item.id || '').toUpperCase());
          // Nếu DB chưa lưu assignments chi tiết mà local cache có hoặc DEFAULT_PRODUCTS có, ưu tiên giữ đầy đủ
          const hasCustomAssignmentsInDb = Array.isArray(item.assignments) && item.assignments.length > 1;
          const mergedItem: ProductItem = {
            ...item,
            ioType: item.ioType || localItem?.ioType,
            assignments: hasCustomAssignmentsInDb
              ? item.assignments
              : localItem?.assignments || item.assignments
          };
          return this.normalizeProduct(mergedItem);
        });
        this.saveProducts(normalized);
        return normalized;
      }
    } catch (err) {
      console.warn('[productService] Không kết nối được API Backend, dùng cache:', err);
    }
    return this.getProducts();
  },

  async addProductToDatabase(product: ProductItem): Promise<ProductItem[]> {
    const normalized = this.normalizeProduct(product);
    // Cập nhật local trước để đảm bảo phản hồi tức thì và giữ nguyên assignments
    const localUpdated = this.upsertProduct(normalized);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalized)
      });
      if (res.ok) {
        const dbData: ProductItem[] = await res.json();
        const localMap = new Map(localUpdated.map(lp => [lp.id.toUpperCase(), lp]));
        const merged = dbData.map(d => {
          const loc = localMap.get((d.id || '').toUpperCase());
          return this.normalizeProduct({
            ...d,
            ioType: loc?.ioType || d.ioType,
            assignments: loc?.assignments ?? d.assignments
          });
        });
        this.saveProducts(merged);
        return merged;
      }
    } catch (err) {
      console.error('[productService] Lỗi khi lưu sản phẩm vào DB:', err);
    }
    return localUpdated;
  },

  async deleteProductFromDatabase(id: string): Promise<ProductItem[]> {
    const localUpdated = this.deleteProduct(id);
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        const dbData: ProductItem[] = await res.json();
        const localMap = new Map(localUpdated.map(lp => [lp.id.toUpperCase(), lp]));
        const merged = dbData
          .filter(d => d.id.toUpperCase() !== id.trim().toUpperCase())
          .map(d => {
            const loc = localMap.get((d.id || '').toUpperCase());
            return this.normalizeProduct({
              ...d,
              ioType: loc?.ioType || d.ioType,
              assignments: loc?.assignments ?? d.assignments
            });
          });
        this.saveProducts(merged);
        return merged;
      }
    } catch (err) {
      console.error('[productService] Lỗi khi xoá sản phẩm trong DB:', err);
    }
    return localUpdated;
  },

  getProducts(): ProductItem[] {
    if (typeof window === 'undefined') return DEFAULT_PRODUCTS.map(p => this.normalizeProduct(p));
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      const defaults = DEFAULT_PRODUCTS.map(p => this.normalizeProduct(p));
      this.saveProducts(defaults);
      return defaults;
    }
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map((p: ProductItem) => (p.id || '').toUpperCase()));
        const missingDefaults = DEFAULT_PRODUCTS.filter(dp => !existingIds.has(dp.id.toUpperCase()));
        const combined = missingDefaults.length > 0 ? [...parsed, ...missingDefaults] : parsed;
        const normalized = combined.map((p: ProductItem) => this.normalizeProduct(p));
        if (missingDefaults.length > 0) {
          this.saveProducts(normalized);
        }
        return normalized;
      }
      return DEFAULT_PRODUCTS.map(p => this.normalizeProduct(p));
    } catch {
      return DEFAULT_PRODUCTS.map(p => this.normalizeProduct(p));
    }
  },

  saveProducts(products: ProductItem[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }
  },

  upsertProduct(product: ProductItem): ProductItem[] {
    const list = this.getProducts();
    const normalized = this.normalizeProduct(product);
    const targetId = normalized.id.toUpperCase();
    const exists = list.some(p => p.id.toUpperCase() === targetId);
    const updated = exists
      ? list.map(p => (p.id.toUpperCase() === targetId ? { ...p, ...normalized } : p))
      : [normalized, ...list];
    this.saveProducts(updated);
    return updated;
  },

  addProduct(product: ProductItem): ProductItem[] {
    return this.upsertProduct(product);
  },

  updateProduct(product: ProductItem): ProductItem[] {
    return this.upsertProduct(product);
  },

  /**
   * Gán thêm 1 cặp (Công đoạn + Đầu vào / Đầu ra) cho sản phẩm
   */
  async assignProductToStage(
    productId: string,
    stageId: string,
    ioType: ProductIOType
  ): Promise<ProductItem[]> {
    const list = this.getProducts();
    const target = list.find(p => p.id.toUpperCase() === productId.trim().toUpperCase());
    if (!target) return list;

    const currentAssignments = this.getProductAssignments(target);
    const nextAssignments = deduplicateAssignments([
      ...currentAssignments,
      { stageId, ioType }
    ]);

    return this.addProductToDatabase({
      ...target,
      stageId: nextAssignments[0]?.stageId || stageId,
      ioType: nextAssignments[0]?.ioType || ioType,
      assignments: nextAssignments
    });
  },

  /**
   * Gỡ 1 cặp (Công đoạn + Đầu vào / Đầu ra) khỏi sản phẩm
   */
  async removeProductAssignment(
    productId: string,
    stageId: string,
    ioType: ProductIOType
  ): Promise<ProductItem[]> {
    const list = this.getProducts();
    const target = list.find(p => p.id.toUpperCase() === productId.trim().toUpperCase());
    if (!target) return list;

    const currentAssignments = this.getProductAssignments(target);
    const nextAssignments = currentAssignments.filter(
      a => !(a.stageId === stageId && a.ioType === ioType)
    );

    return this.addProductToDatabase({
      ...target,
      stageId: nextAssignments[0]?.stageId || 'UNASSIGNED',
      ioType: nextAssignments[0]?.ioType || target.ioType || 'OUT',
      assignments: nextAssignments
    });
  },

  /**
   * Đổi nhanh Đầu vào (IN) <-> Đầu ra (OUT) của sản phẩm tại một công đoạn
   */
  async toggleProductAssignmentIO(
    productId: string,
    stageId: string,
    currentIoType: ProductIOType
  ): Promise<ProductItem[]> {
    const list = this.getProducts();
    const target = list.find(p => p.id.toUpperCase() === productId.trim().toUpperCase());
    if (!target) return list;

    const newIoType: ProductIOType = currentIoType === 'IN' ? 'OUT' : 'IN';
    const currentAssignments = this.getProductAssignments(target);
    const nextAssignments = deduplicateAssignments(
      currentAssignments.map(a =>
        a.stageId === stageId && a.ioType === currentIoType
          ? { stageId, ioType: newIoType }
          : a
      )
    );

    return this.addProductToDatabase({
      ...target,
      stageId: nextAssignments[0]?.stageId || target.stageId,
      ioType: nextAssignments[0]?.ioType || newIoType,
      assignments: nextAssignments
    });
  },

  deleteProduct(productId: string): ProductItem[] {
    const list = this.getProducts();
    const targetId = productId.trim().toUpperCase();
    const updated = list.filter(p => p.id.toUpperCase() !== targetId);
    this.saveProducts(updated);
    return updated;
  },

  getProductsByStage(stageId: string, ioType?: ProductIOType): ProductItem[] {
    const list = this.getProducts();
    return list.filter(p => this.isProductAssignedTo(p, stageId, ioType));
  },

  generateNextId(stageId: string = 'CD001'): string {
    const list = this.getProducts();
    const cleanStage = stageId && stageId !== 'UNASSIGNED' ? stageId.replace('CD', '') : 'MOI';
    const prefix = `SP-${cleanStage}`;
    const existingIds = new Set(list.map(p => p.id.toUpperCase()));
    let nextNum = list.filter(p => this.isProductAssignedTo(p, stageId)).length + 1;
    let candidate = `${prefix}-${String(nextNum).padStart(2, '0')}`;
    while (existingIds.has(candidate.toUpperCase())) {
      nextNum++;
      candidate = `${prefix}-${String(nextNum).padStart(2, '0')}`;
    }
    return candidate;
  },

  validateProduct(product: Partial<ProductItem>, isEditing: boolean = false): { isValid: boolean; error?: string } {
    if (!product.id?.trim()) {
      return { isValid: false, error: 'Mã sản phẩm không được để trống.' };
    }
    if (!product.name?.trim()) {
      return { isValid: false, error: 'Tên sản phẩm không được để trống.' };
    }

    if (!isEditing) {
      const list = this.getProducts();
      const exists = list.some(p => p.id.toUpperCase() === product.id?.trim().toUpperCase());
      if (exists) {
        return { isValid: false, error: `Mã sản phẩm "${product.id}" đã tồn tại trên hệ thống.` };
      }
    }

    return { isValid: true };
  },

  getProductStats(totalStagesCount: number = 15): {
    total: number;
    coveredStagesCount: number;
    inAssignmentsCount: number;
    outAssignmentsCount: number;
    semiCount: number;
    finishedCount: number;
    byproductCount: number;
  } {
    const list = this.getProducts();
    const stagesWithProducts = new Set<string>();
    let inAssignmentsCount = 0;
    let outAssignmentsCount = 0;

    list.forEach(p => {
      const assigns = this.getProductAssignments(p);
      assigns.forEach(a => {
        if (a.stageId && a.stageId !== 'UNASSIGNED') {
          stagesWithProducts.add(a.stageId);
        }
        if (a.ioType === 'IN') inAssignmentsCount++;
        if (a.ioType === 'OUT') outAssignmentsCount++;
      });
    });

    return {
      total: list.length,
      coveredStagesCount: stagesWithProducts.size,
      inAssignmentsCount,
      outAssignmentsCount,
      semiCount: list.filter(p => p.type === 'SEMI').length,
      finishedCount: list.filter(p => p.type === 'FINISHED').length,
      byproductCount: list.filter(p => p.type === 'BYPRODUCT').length
    };
  }
};
