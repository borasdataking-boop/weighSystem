import { ProductItem, ProductIOType, ProductStageAssignment } from '../types/product.types';

const STORAGE_KEY = 'pms_products_db_cache_v1';

// Danh mục mặt hàng sản phẩm chuẩn quy cách theo từng công đoạn chế biến tôm xuất khẩu
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
    let assignments: ProductStageAssignment[];

    if (Array.isArray(p.assignments)) {
      assignments = deduplicateAssignments(p.assignments);
    } else if (p.stageId && p.stageId !== 'UNASSIGNED') {
      const fallbackIo: ProductIOType = p.ioType === 'IN' ? 'IN' : 'OUT';
      assignments = [{ stageId: p.stageId, ioType: fallbackIo }];
    } else {
      assignments = [];
    }

    const primaryStageId = assignments[0]?.stageId || 'UNASSIGNED';
    const primaryIoType: ProductIOType =
      assignments[0]?.ioType || (p.ioType === 'IN' ? 'IN' : 'OUT');

    return {
      ...p,
      id: (p.id || '').trim().toUpperCase(),
      name: (p.name || '').trim(),
      stageId: primaryStageId,
      ioType: primaryIoType,
      assignments,
      type: p.type || 'SEMI',
      unit: p.unit || 'kg',
      spec: p.spec ?? ''
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
        const normalized = rawData.map(item => this.normalizeProduct(item));
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
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalized)
      });
      if (res.ok) {
        const dbData: ProductItem[] = await res.json();
        const merged = dbData.map(d => this.normalizeProduct(d));
        this.saveProducts(merged);
        return merged;
      }
    } catch (err) {
      console.error('[productService] Lỗi khi lưu sản phẩm vào DB:', err);
    }
    return this.upsertProduct(normalized);
  },

  async deleteProductFromDatabase(id: string): Promise<ProductItem[]> {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        const dbData: ProductItem[] = await res.json();
        const merged = dbData.map(d => this.normalizeProduct(d));
        this.saveProducts(merged);
        return merged;
      }
    } catch (err) {
      console.error('[productService] Lỗi khi xoá sản phẩm trong DB:', err);
    }
    return this.deleteProduct(id);
  },

  getProducts(): ProductItem[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.map((p: ProductItem) => this.normalizeProduct(p));
      }
      return [];
    } catch {
      return [];
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
