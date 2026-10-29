import { ProductItem } from '../types/product.types';

const STORAGE_KEY = 'pms_products_data_v3';

// Danh mục mặt hàng sản phẩm chuẩn quy cách theo từng công đoạn chế biến tôm xuất khẩu
export const DEFAULT_PRODUCTS: ProductItem[] = [
  // CD001: Tiếp nhận nguyên liệu (Khớp 100% với các mã trong mẻ cân: TOM001, TP001, TP002, TP003)
  {
    id: 'TOM001',
    name: 'Tôm nguyên liệu tươi sống',
    stageId: 'CD001',
    type: 'SEMI',
    unit: 'kg',
    spec: 'Tôm thẻ chân trắng tươi sống nhập từ đầm nuôi'
  },
  {
    id: 'TP001',
    name: 'Tôm nguyên liệu loại 1',
    stageId: 'CD001',
    type: 'SEMI',
    unit: 'kg',
    spec: 'Tôm đạt chuẩn kích cỡ và độ tươi loại 1'
  },
  {
    id: 'TP002',
    name: 'Tôm nguyên liệu loại 2',
    stageId: 'CD001',
    type: 'SEMI',
    unit: 'kg',
    spec: 'Tôm đạt chuẩn loại 2 chuyển phân cỡ'
  },
  {
    id: 'TP003',
    name: 'Tôm dập gãy phân loại',
    stageId: 'CD001',
    type: 'BYPRODUCT',
    unit: 'kg',
    spec: 'Tôm dập gãy, đứt đầu chuyển phụ phẩm'
  },
  {
    id: 'SP-TN-01',
    name: 'Tôm nguyên liệu đạt chuẩn',
    stageId: 'CD001',
    type: 'SEMI',
    unit: 'kg',
    spec: 'Tôm tươi sống, nguyên con, ướp đá tỷ lệ 1:1'
  },
  {
    id: 'SP-TN-02',
    name: 'Tôm thứ phẩm / Dập nát',
    stageId: 'CD001',
    type: 'BYPRODUCT',
    unit: 'kg',
    spec: 'Tôm dập gãy, đứt đầu, chuyển phân loại phụ phẩm'
  },
  {
    id: 'SP-TN-03',
    name: 'Tôm sống chuyển xử lý nhanh',
    stageId: 'CD001',
    type: 'SEMI',
    unit: 'kg',
    spec: 'Tôm kích thước đồng đều, chuyển trực tiếp cấp đông hoặc ngâm phụ gia'
  },

  // CD002: Rửa 1 & Phân cỡ sơ bộ
  {
    id: 'SP-PC-01',
    name: 'Tôm thẻ phân cỡ lớn (size 20-25)',
    stageId: 'CD002',
    type: 'SEMI',
    unit: 'kg',
    spec: 'Kích cỡ 20-25 con/kg, tôm loại 1'
  },
  {
    id: 'SP-PC-02',
    name: 'Tôm thẻ phân cỡ vừa (size 30-40)',
    stageId: 'CD002',
    type: 'SEMI',
    unit: 'kg',
    spec: 'Kích cỡ 30-40 con/kg, tôm loại 2'
  },
  {
    id: 'SP-PC-03',
    name: 'Tôm dạt gãy thân',
    stageId: 'CD002',
    type: 'BYPRODUCT',
    unit: 'kg',
    spec: 'Tôm lỗi cơ học trong quá trình máy quay phân cỡ'
  },
  {
    id: 'SP-PC-04',
    name: 'Tôm thẻ cỡ nhỏ (size 50-60)',
    stageId: 'CD002',
    type: 'SEMI',
    unit: 'kg',
    spec: 'Kích cỡ 50-60 con/kg, chuyển bóc vỏ tẩm bột'
  },

  // CD003: Xếp khuôn & Định lượng
  {
    id: 'SP-XK-01',
    name: 'Block tôm xếp khuôn 2kg',
    stageId: 'CD003',
    type: 'SEMI',
    unit: 'khay',
    spec: 'Khuôn inox tiêu chuẩn, trọng lượng tịnh 2.0kg ± 10g'
  },
  {
    id: 'SP-XK-02',
    name: 'Mẻ tôm rổ chuyển bóc vỏ',
    stageId: 'CD003',
    type: 'SEMI',
    unit: 'rổ',
    spec: 'Rổ nhựa chuyên dụng xưởng 5kg/rổ'
  },
  {
    id: 'SP-XK-03',
    name: 'Block tôm xếp khuôn 1.8kg xuất khẩu',
    stageId: 'CD003',
    type: 'SEMI',
    unit: 'khay',
    spec: 'Khuôn định hình 1.8kg tịnh xuất khẩu thị trường Châu Á'
  },

  // CD004: Sơ chế (Bóc vỏ & Rút chỉ)
  {
    id: 'SP-BV-01',
    name: 'Tôm thịt PTO rút chỉ',
    stageId: 'CD004',
    type: 'SEMI',
    unit: 'kg',
    spec: 'Lột vỏ chừa đuôi (Peeled Tail On), rút sạch chỉ lưng'
  },
  {
    id: 'SP-BV-02',
    name: 'Tôm thịt PUD lột sạch',
    stageId: 'CD004',
    type: 'SEMI',
    unit: 'kg',
    spec: 'Lột sạch hoàn toàn vỏ và đuôi (Peeled Undeveined)'
  },
  {
    id: 'SP-BV-03',
    name: 'Vỏ và đầu tôm thu hồi',
    stageId: 'CD004',
    type: 'BYPRODUCT',
    unit: 'kg',
    spec: 'Thu gom làm nguyên liệu sản xuất Chitin / Thức ăn chăn nuôi'
  },

  // CD005: Ngâm xử lý phụ gia
  {
    id: 'SP-PG-01',
    name: 'Tôm ngâm Non-Phosphate đạt trọng',
    stageId: 'CD005',
    type: 'SEMI',
    unit: 'kg',
    spec: 'Xử lý dung dịch muối khoáng tăng trọng tự nhiên 5-8%'
  },
  {
    id: 'SP-PG-02',
    name: 'Tôm ngâm STPP đạt chuẩn',
    stageId: 'CD005',
    type: 'SEMI',
    unit: 'kg',
    spec: 'Ngâm Sodium Tripolyphosphate đạt tiêu chuẩn dư lượng US/EU'
  },

  // CD006: Định hình Nobashi / Xẻ bướm
  {
    id: 'SP-DH-01',
    name: 'Tôm duỗi Nobashi khay',
    stageId: 'CD006',
    type: 'SEMI',
    unit: 'khay',
    spec: 'Duỗi thẳng thân tôm, khay 20 con / 25 con xuất Nhật'
  },
  {
    id: 'SP-DH-02',
    name: 'Tôm xẻ bướm Butterfly',
    stageId: 'CD006',
    type: 'SEMI',
    unit: 'khay',
    spec: 'Xẻ dọc lưng tôm tạo hình bướm, trải khay định hình'
  },

  // CD007: Tẩm bột chiên xù
  {
    id: 'SP-TB-01',
    name: 'Tôm tẩm bột xù Panko trắng',
    stageId: 'CD007',
    type: 'SEMI',
    unit: 'khay',
    spec: 'Tỷ lệ bột áo 40%, bột xù Panko hạt nhỏ trắng'
  },
  {
    id: 'SP-TB-02',
    name: 'Bột tẩm dư thu hồi',
    stageId: 'CD007',
    type: 'BYPRODUCT',
    unit: 'kg',
    spec: 'Bột vụn rơi rớt qua sàng lọc chuyền'
  },

  // CD008: Chiên định hình dầu nóng
  {
    id: 'SP-CN-01',
    name: 'Tôm sơ chiên giòn định hình',
    stageId: 'CD008',
    type: 'SEMI',
    unit: 'kg',
    spec: 'Chiên ngập dầu ở 175°C trong 45 giây, định hình lớp bột'
  },

  // CD009: Luộc / Hấp tôm nõn (PD)
  {
    id: 'SP-PD-01',
    name: 'Tôm thịt nõn hấp chín PD',
    stageId: 'CD009',
    type: 'SEMI',
    unit: 'kg',
    spec: 'Hấp nhiệt độ tâm > 74°C, làm lạnh tức thì bằng nước đá'
  },

  // CD010: Luộc / Hấp tôm vỏ (HLSO)
  {
    id: 'SP-HL-01',
    name: 'Tôm vỏ vặt đầu hấp chín HLSO',
    stageId: 'CD010',
    type: 'SEMI',
    unit: 'kg',
    spec: 'Tôm bỏ đầu giữ vỏ (Headless Shell On), màu đỏ cam đồng đều'
  },

  // CD011: Tách vỏ sau luộc
  {
    id: 'SP-TV-01',
    name: 'Tôm nõn chín bóc sạch vỏ',
    stageId: 'CD011',
    type: 'SEMI',
    unit: 'kg',
    spec: 'Bóc vỏ chín dùng làm topping sushi / salad đóng gói'
  },
  {
    id: 'SP-TV-02',
    name: 'Vỏ tôm chín thu hồi',
    stageId: 'CD011',
    type: 'BYPRODUCT',
    unit: 'kg',
    spec: 'Vỏ chín qua gia nhiệt, xuất bán cho nhà máy chiết xuất hương tôm'
  },

  // CD012: Cấp đông xoắn tôm tươi
  {
    id: 'SP-CX-01',
    name: 'Tôm tươi đông băng xoắn Spiral',
    stageId: 'CD012',
    type: 'FINISHED',
    unit: 'thùng',
    spec: 'Nhiệt độ tâm -18°C, đóng gói hút chân không thùng 10kg'
  },
  {
    id: 'SP-CX-02',
    name: 'Tôm tươi đông xoắn Spiral khay 500g',
    stageId: 'CD012',
    type: 'FINISHED',
    unit: 'khay',
    spec: 'Khay xốp bọc màng co PE, nhiệt độ tâm đạt -18°C'
  },
  {
    id: 'SP-CX-03',
    name: 'Tôm tươi đông xoắn bulk pack thùng 12kg',
    stageId: 'CD012',
    type: 'FINISHED',
    unit: 'thùng',
    spec: 'Đóng thùng carton 12kg chuẩn xuất khẩu công nghiệp'
  },

  // CD013: Cấp đông xoắn tôm chiên
  {
    id: 'SP-CC-01',
    name: 'Tôm chiên đông băng xoắn Tempura',
    stageId: 'CD013',
    type: 'FINISHED',
    unit: 'thùng',
    spec: 'Thành phẩm tôm tempura đông lạnh cấp đông sâu -35°C'
  },
  {
    id: 'SP-CC-02',
    name: 'Tôm chiên Tempura đông xoắn hộp 1kg',
    stageId: 'CD013',
    type: 'FINISHED',
    unit: 'hộp',
    spec: 'Hộp giấy tráng PE 1kg, 10 hộp/thùng carton'
  },

  // CD014: Cấp đông IQF tôm tươi
  {
    id: 'SP-IQ-01',
    name: 'Tôm tươi đông rời IQF mạ băng 10%',
    stageId: 'CD014',
    type: 'FINISHED',
    unit: 'thùng',
    spec: 'Đông rời từng cá thể, mạ băng bảo quản glazing 10%'
  },
  {
    id: 'SP-IQ-02',
    name: 'Tôm tươi đông rời IQF mạ băng 20%',
    stageId: 'CD014',
    type: 'FINISHED',
    unit: 'thùng',
    spec: 'Đông rời từng cá thể, mạ băng bảo quản glazing 20%'
  },

  // CD015: Cấp đông IQF tôm chín
  {
    id: 'SP-IC-01',
    name: 'Tôm chín đông rời IQF xuất khẩu Mỹ',
    stageId: 'CD015',
    type: 'FINISHED',
    unit: 'thùng',
    spec: 'Túi zipper 1kg x 10 túi / thùng carton 10kg'
  },
  {
    id: 'SP-IC-02',
    name: 'Pallet tôm đông xuất khẩu EU',
    stageId: 'CD015',
    type: 'FINISHED',
    unit: 'pallet',
    spec: '60 thùng/pallet, quấn màng co đạt tiêu chuẩn lưu kho -25°C'
  },
  {
    id: 'SP-IC-03',
    name: 'Tôm chín đông rời IQF hấp xuất khẩu Nhật',
    stageId: 'CD015',
    type: 'FINISHED',
    unit: 'túi',
    spec: 'Túi hút chân không 500g tiêu chuẩn khắt khe thị trường Nhật Bản'
  }
];

export const productService = {
  /**
   * Tải danh mục sản phẩm trực tiếp từ PostgreSQL Database qua Backend API
   */
  async fetchProducts(): Promise<ProductItem[]> {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data: ProductItem[] = await res.json();
        this.saveProducts(data);
        return data;
      }
    } catch (err) {
      console.warn('[productService] Không kết nối được API Backend, dùng cache:', err);
    }
    return this.getProducts();
  },

  async addProductToDatabase(product: ProductItem): Promise<ProductItem[]> {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (res.ok) {
        const data = await res.json();
        this.saveProducts(data);
        return data;
      }
    } catch (err) {
      console.error('[productService] Lỗi khi lưu sản phẩm vào DB:', err);
    }
    return this.addProduct(product);
  },

  async deleteProductFromDatabase(id: string): Promise<ProductItem[]> {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        this.saveProducts(data);
        return data;
      }
    } catch (err) {
      console.error('[productService] Lỗi khi xoá sản phẩm trong DB:', err);
    }
    return this.deleteProduct(id);
  },

  getProducts(): ProductItem[] {
    if (typeof window === 'undefined') return DEFAULT_PRODUCTS;
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      this.saveProducts(DEFAULT_PRODUCTS);
      return DEFAULT_PRODUCTS;
    }
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Tự động bổ sung các mã sản phẩm mặc định còn thiếu (vd: TOM001, TP001) vào storage hiện tại
        const existingIds = new Set(parsed.map((p: ProductItem) => p.id.toUpperCase()));
        const missingDefaults = DEFAULT_PRODUCTS.filter(dp => !existingIds.has(dp.id.toUpperCase()));
        if (missingDefaults.length > 0) {
          const merged = [...parsed, ...missingDefaults];
          this.saveProducts(merged);
          return merged;
        }
        return parsed;
      }
      return DEFAULT_PRODUCTS;
    } catch {
      return DEFAULT_PRODUCTS;
    }
  },

  saveProducts(products: ProductItem[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }
  },

  addProduct(product: ProductItem): ProductItem[] {
    const list = this.getProducts();
    const newProduct: ProductItem = {
      ...product,
      id: product.id.trim().toUpperCase(),
      name: product.name.trim(),
      stageId: product.stageId || 'CD001',
      type: product.type || 'SEMI',
      unit: product.unit || 'kg',
      spec: product.spec?.trim() || ''
    };
    const updated = [newProduct, ...list];
    this.saveProducts(updated);
    return updated;
  },

  updateProduct(product: ProductItem): ProductItem[] {
    const list = this.getProducts();
    const targetId = product.id.trim().toUpperCase();
    const updated = list.map(p => (p.id.toUpperCase() === targetId ? { ...p, ...product } : p));
    this.saveProducts(updated);
    return updated;
  },

  deleteProduct(productId: string): ProductItem[] {
    const list = this.getProducts();
    const targetId = productId.trim().toUpperCase();
    const updated = list.filter(p => p.id.toUpperCase() !== targetId);
    this.saveProducts(updated);
    return updated;
  },

  getProductsByStage(stageId: string): ProductItem[] {
    const list = this.getProducts();
    return list.filter(p => p.stageId === stageId);
  },

  generateNextId(stageId: string = 'CD001'): string {
    const list = this.getProducts();
    const prefix = `SP-${stageId.replace('CD', '')}`;
    const stageProds = list.filter(p => p.stageId === stageId);
    const nextNum = stageProds.length + 1;
    return `${prefix}-${String(nextNum).padStart(2, '0')}`;
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
    semiCount: number;
    finishedCount: number;
    byproductCount: number;
  } {
    const list = this.getProducts();
    const stagesWithProducts = new Set(list.map(p => p.stageId));

    return {
      total: list.length,
      coveredStagesCount: stagesWithProducts.size,
      semiCount: list.filter(p => p.type === 'SEMI').length,
      finishedCount: list.filter(p => p.type === 'FINISHED').length,
      byproductCount: list.filter(p => p.type === 'BYPRODUCT').length
    };
  }
};
