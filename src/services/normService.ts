/**
 * Service quản lý Định Mức Chuẩn (Target Norm) và Cảnh Báo Sản Xuất cho từng công đoạn
 * Hỗ trợ:
 * - Cài đặt định mức tự do theo từng công đoạn
 * - Cài đặt định mức riêng cho từng Lô sản xuất (Batch-specific) hoặc Toàn nhà máy (Global)
 * - Các bộ mẫu định mức có sẵn (Presets): Tôm thẻ chân trắng, Tôm sú, Tôm sinh thái, Hàng tẩm bột
 * - Tùy chỉnh các ngưỡng cảnh báo hụt định mức và nghẽn chuyền
 */

const STORAGE_KEY_GLOBAL = 'pb_stage_target_norms_v1';
const STORAGE_KEY_BATCH_PREFIX = 'pb_batch_stage_norms_';
const STORAGE_KEY_THRESHOLDS = 'pb_norm_thresholds_v1';

// 1. Định mức chuẩn nhà máy mặc định (%)
export const DEFAULT_STAGE_NORMS: Record<string, number> = {
  'CD001': 100.0, // Tiếp nhận nguyên liệu gốc
  'CD002': 99.0,  // Rửa 1
  'CD003': 98.0,  // Phân cỡ & Phân loại
  'CD004': 60.0,  // Sơ chế / Bóc vỏ / Rút chỉ (Hao hụt vỏ ~40%)
  'CD005': 105.0, // Ngâm quay phụ gia (Tăng trọng ngậm nước/muối +5%)
  'CD006': 99.0,  // Rửa 2
  'CD007': 120.0, // Tẩm bột gia vị (Tăng trọng bột áo +20%)
  'CD008': 100.0, // Tạo hình / Xếp khay
  'CD009': 88.0,  // Nấu / Luộc chín (Hao hụt nhiệt ~12%)
  'CD010': 98.0,  // Hạ nhiệt làm nguội
  'CD011': 70.0,  // Tách vỏ sau luộc
  'CD012': 97.0,  // Cấp đông IQF
  'CD013': 105.0, // Mạ băng bảo quản (Tăng trọng mạ băng +5%)
  'CD014': 100.0, // Đóng gói bao bì
  'CD015': 100.0  // Rà kim loại & Nhập kho thành phẩm
};

// 2. Các bộ mẫu định mức chuẩn ngành thủy sản (Preset Templates)
export interface NormPreset {
  id: string;
  name: string;
  description: string;
  badge: string;
  norms: Record<string, number>;
}

export const NORM_PRESETS: NormPreset[] = [
  {
    id: 'VANNAMEI_STANDARD',
    name: 'Tôm thẻ chân trắng (Chuẩn)',
    description: 'Quy cách tôm thẻ xuất khẩu thông dụng (Bóc vỏ 60%, Ngâm +5%, Tẩm bột +20%, Luộc 88%)',
    badge: 'Phổ biến nhất',
    norms: { ...DEFAULT_STAGE_NORMS }
  },
  {
    id: 'MONODON_PREMIUM',
    name: 'Tôm sú xuất khẩu (Black Tiger)',
    description: 'Tôm sú thịt chắc, tỷ lệ thu hồi cao hơn (Bóc vỏ 64%, Ngâm nhẹ +3%, Luộc 90%)',
    badge: 'Cao cấp',
    norms: {
      ...DEFAULT_STAGE_NORMS,
      'CD003': 98.5,
      'CD004': 64.0, // Tôm sú vỏ mỏng hơn tỷ lệ thịt cao hơn
      'CD005': 103.0, // Ngâm nhẹ
      'CD007': 118.0,
      'CD009': 90.0,
      'CD011': 72.0
    }
  },
  {
    id: 'NATURAL_ORGANIC',
    name: 'Tôm sinh thái / Tươi tự nhiên (Không phụ gia)',
    description: 'Không ngâm quay phụ gia, bảo toàn nguyên vị (Ngâm 100%, Luộc 86%)',
    badge: 'Organic / EU',
    norms: {
      ...DEFAULT_STAGE_NORMS,
      'CD004': 62.0,
      'CD005': 100.0, // Tuyệt đối không tăng trọng
      'CD007': 100.0,
      'CD009': 86.0,  // Co ngót nhiệt tự nhiên
      'CD013': 100.0  // Không mạ băng nặng
    }
  },
  {
    id: 'BREADED_VALUE_ADDED',
    name: 'Tôm tẩm bột giá trị gia tăng (Breaded Shrimp)',
    description: 'Chuyên dòng sản phẩm tẩm bột chiên xù cao cấp (Tẩm bột +25%, Ngâm +8%)',
    badge: 'Chế biến sâu',
    norms: {
      ...DEFAULT_STAGE_NORMS,
      'CD004': 59.0,
      'CD005': 108.0,
      'CD007': 125.0, // Lớp áo bột dày 25%
      'CD009': 89.0
    }
  }
];

// 3. Cấu hình ngưỡng cảnh báo
export interface NormThresholdSettings {
  criticalLossThreshold: number; // Hụt nghiêm trọng nếu < -X % (mặc định 5%)
  warningLossThreshold: number;  // Cận định mức nếu từ -Y % đến -X % (mặc định 2%)
  bottleneckWipKg: number;       // Báo nghẽn nếu WIP > Z kg (mặc định 40 kg)
}

export const DEFAULT_THRESHOLDS: NormThresholdSettings = {
  criticalLossThreshold: 5.0,
  warningLossThreshold: 2.0,
  bottleneckWipKg: 40.0
};

export type NormEvaluationStatus = 'CRITICAL_LOW' | 'WARNING_LOW' | 'ON_TARGET' | 'ABOVE_TARGET' | 'NOT_STARTED';
export type BottleneckSeverity = 'CRITICAL_BOTTLENECK' | 'BUFFERING' | 'SMOOTH' | 'IDLE';

export interface NormEvaluation {
  actualYield: number;       // Định mức thực tế (%) = (OUT / IN) * 100
  targetNorm: number;        // Định mức đã set sẵn (%)
  diff: number;              // Chênh lệch = Thực tế - Đã set (%)
  status: NormEvaluationStatus;
  label: string;
  badgeClass: string;
}

export interface BottleneckEvaluation {
  status: BottleneckSeverity;
  label: string;
  badgeClass: string;
  wipWeight: number;
  description: string;
}

export const normService = {
  /**
   * Lấy cấu hình ngưỡng cảnh báo
   */
  getThresholdSettings(): NormThresholdSettings {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THRESHOLDS);
      if (saved) {
        return { ...DEFAULT_THRESHOLDS, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return { ...DEFAULT_THRESHOLDS };
  },

  /**
   * Lưu cấu hình ngưỡng cảnh báo
   */
  saveThresholdSettings(settings: NormThresholdSettings): void {
    try {
      localStorage.setItem(STORAGE_KEY_THRESHOLDS, JSON.stringify(settings));
    } catch (e) {
      console.error('Lỗi khi lưu ngưỡng cảnh báo:', e);
    }
  },

  /**
   * Kiểm tra xem một Lô có cấu hình định mức riêng biệt không
   */
  hasBatchCustomNorms(batchId: string): boolean {
    if (!batchId || batchId === 'ALL') return false;
    return !!localStorage.getItem(`${STORAGE_KEY_BATCH_PREFIX}${batchId}`);
  },

  /**
   * Lấy toàn bộ định mức đã set sẵn.
   * Ưu tiên: Định mức riêng của Lô (nếu có) -> Định mức toàn xưởng -> Mặc định
   */
  getAllTargetNorms(batchId?: string): Record<string, number> {
    // 1. Kiểm tra định mức riêng của Lô
    if (batchId && batchId !== 'ALL') {
      try {
        const batchSaved = localStorage.getItem(`${STORAGE_KEY_BATCH_PREFIX}${batchId}`);
        if (batchSaved) {
          return { ...this.getGlobalTargetNorms(), ...JSON.parse(batchSaved) };
        }
      } catch {
        // Fallback
      }
    }

    // 2. Định mức toàn xưởng
    return this.getGlobalTargetNorms();
  },

  /**
   * Lấy định mức chuẩn toàn nhà máy (Global)
   */
  getGlobalTargetNorms(): Record<string, number> {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GLOBAL);
      if (saved) {
        return { ...DEFAULT_STAGE_NORMS, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return { ...DEFAULT_STAGE_NORMS };
  },

  /**
   * Lấy định mức cho một công đoạn cụ thể (có hỗ trợ xét theo Lô)
   */
  getTargetNorm(stageId: string, stageName?: string, batchId?: string): number {
    const all = this.getAllTargetNorms(batchId);
    const id = stageId.toUpperCase();
    if (all[id] !== undefined) {
      return all[id];
    }

    // Nhận diện theo tên công đoạn nếu mã tùy biến
    const name = (stageName || '').toLowerCase();
    if (name.includes('bóc vỏ') || name.includes('rút chỉ') || name.includes('peel')) return 60.0;
    if (name.includes('ngâm') || name.includes('phụ gia') || name.includes('soak')) return 105.0;
    if (name.includes('tẩm bột') || name.includes('bread')) return 120.0;
    if (name.includes('luộc') || name.includes('hấp') || name.includes('cook')) return 88.0;
    if (name.includes('tách vỏ')) return 70.0;
    if (name.includes('mạ băng') || name.includes('glaze')) return 105.0;
    return 100.0;
  },

  /**
   * Cập nhật định mức cho một công đoạn (toàn nhà máy hoặc cho riêng Lô)
   */
  setTargetNorm(stageId: string, newNorm: number, batchId?: string): void {
    const sId = stageId.toUpperCase();
    const val = Number(newNorm);

    if (batchId && batchId !== 'ALL') {
      // Lưu riêng cho Lô
      const cur = this.getAllTargetNorms(batchId);
      cur[sId] = val;
      try {
        localStorage.setItem(`${STORAGE_KEY_BATCH_PREFIX}${batchId}`, JSON.stringify(cur));
      } catch (e) {
        console.error('Không thể lưu định mức riêng cho lô:', e);
      }
    } else {
      // Lưu toàn nhà máy
      const cur = this.getGlobalTargetNorms();
      cur[sId] = val;
      try {
        localStorage.setItem(STORAGE_KEY_GLOBAL, JSON.stringify(cur));
      } catch (e) {
        console.error('Không thể lưu định mức toàn nhà máy:', e);
      }
    }
  },

  /**
   * Lưu hàng loạt toàn bộ định mức cho các công đoạn
   */
  saveAllTargetNorms(norms: Record<string, number>, batchId?: string): void {
    if (batchId && batchId !== 'ALL') {
      try {
        localStorage.setItem(`${STORAGE_KEY_BATCH_PREFIX}${batchId}`, JSON.stringify(norms));
      } catch (e) {
        console.error('Lỗi khi lưu định mức cho lô:', e);
      }
    } else {
      try {
        localStorage.setItem(STORAGE_KEY_GLOBAL, JSON.stringify(norms));
      } catch (e) {
        console.error('Lỗi khi lưu định mức toàn nhà máy:', e);
      }
    }
  },

  /**
   * Áp dụng một bộ mẫu Preset có sẵn
   */
  applyPreset(presetId: string, batchId?: string): Record<string, number> {
    const target = NORM_PRESETS.find(p => p.id === presetId) || NORM_PRESETS[0];
    this.saveAllTargetNorms(target.norms, batchId);
    return { ...target.norms };
  },

  /**
   * Xóa cấu hình riêng của Lô để quay lại dùng định mức toàn nhà máy
   */
  resetBatchToGlobal(batchId: string): void {
    if (batchId && batchId !== 'ALL') {
      try {
        localStorage.removeItem(`${STORAGE_KEY_BATCH_PREFIX}${batchId}`);
      } catch {
        // Ignore
      }
    }
  },

  /**
   * Khôi phục toàn bộ định mức nhà máy về giá trị mặc định gốc
   */
  resetTargetNorms(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_GLOBAL);
      localStorage.removeItem(STORAGE_KEY_THRESHOLDS);
    } catch {
      // Ignore
    }
  },

  /**
   * Đánh giá xem Định mức thực tế có bị thấp hơn định mức đã set quá nhiều hay không
   */
  evaluateNorm(
    inWeight: number,
    outWeight: number,
    targetNorm: number,
    thresholds?: NormThresholdSettings
  ): NormEvaluation {
    const th = thresholds || this.getThresholdSettings();

    if (inWeight <= 0 && outWeight <= 0) {
      return {
        actualYield: 0,
        targetNorm,
        diff: 0,
        status: 'NOT_STARTED',
        label: 'Chưa vận hành',
        badgeClass: 'bg-slate-100 text-slate-500 border-slate-200'
      };
    }

    if (inWeight > 0 && outWeight <= 0) {
      return {
        actualYield: 0,
        targetNorm,
        diff: -targetNorm,
        status: 'WARNING_LOW',
        label: 'Đang ngậm hàng (WIP)',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
      };
    }

    // Trường hợp chỉ phát sinh cân đầu ra (OUT) mà không có cân đầu vào (IN = 0)
    // (VD: Công đoạn xuất thành phẩm cuối CD015, hoặc mẻ tồn kho ca trước chuyển sang)
    if (inWeight <= 0 && outWeight > 0) {
      return {
        actualYield: 100,
        targetNorm,
        diff: 0,
        status: 'ON_TARGET',
        label: 'Chỉ có cân OUT (Xuất mẻ)',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 font-medium'
      };
    }

    const rawYield = (outWeight / inWeight) * 100;
    const actualYield = isFinite(rawYield) && !isNaN(rawYield) ? Number(rawYield.toFixed(1)) : 0;
    const rawDiff = actualYield - targetNorm;
    const diff = isFinite(rawDiff) && !isNaN(rawDiff) ? Number(rawDiff.toFixed(1)) : 0;

    if (diff < -th.criticalLossThreshold) {
      return {
        actualYield,
        targetNorm,
        diff,
        status: 'CRITICAL_LOW',
        label: `Hụt nghiêm trọng (${diff > 0 ? '+' : ''}${diff}%)`,
        badgeClass: 'bg-red-50 text-red-700 border-red-300 font-bold'
      };
    }

    if (diff < -th.warningLossThreshold) {
      return {
        actualYield,
        targetNorm,
        diff,
        status: 'WARNING_LOW',
        label: `Dưới định mức (${diff > 0 ? '+' : ''}${diff}%)`,
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 font-medium'
      };
    }

    if (diff > 5.0) {
      return {
        actualYield,
        targetNorm,
        diff,
        status: 'ABOVE_TARGET',
        label: `Vượt định mức (+${diff}%)`,
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 font-medium'
      };
    }

    return {
      actualYield,
      targetNorm,
      diff,
      status: 'ON_TARGET',
      label: `Đạt chuẩn (${diff >= 0 ? '+' : ''}${diff}%)`,
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium'
    };
  },

  /**
   * Đánh giá Năng suất và Tình trạng Nghẽn Chuyền (Bottleneck) của từng bước
   */
  evaluateBottleneck(
    inWeight: number,
    outWeight: number,
    wipWeight: number,
    inCount: number,
    outCount: number,
    thresholds?: NormThresholdSettings
  ): BottleneckEvaluation {
    const th = thresholds || this.getThresholdSettings();

    if (inWeight === 0 && outWeight === 0 && wipWeight === 0) {
      return {
        status: 'IDLE',
        label: 'Chưa vào hàng',
        badgeClass: 'bg-slate-100 text-slate-500 border-slate-200',
        wipWeight: 0,
        description: 'Chưa phát sinh mẻ cân tại bước này'
      };
    }

    // Nghẽn nặng: Hàng đọng vượt ngưỡng cài đặt (mặc định > 40kg) hoặc nạp nhiều nhưng chưa ra
    if (wipWeight > th.bottleneckWipKg || (inWeight > 30 && outWeight === 0 && inCount >= 2)) {
      return {
        status: 'CRITICAL_BOTTLENECK',
        label: 'Nghẽn chuyền (Đọng lớn)',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse',
        wipWeight,
        description: `Tồn đọng ${wipWeight.toFixed(1)} kg chưa giải phóng`
      };
    }

    // Tích lũy dở dang / Cần đẩy nhanh: Đọng 10kg đến ngưỡng nghẽn
    if (wipWeight > 10) {
      return {
        status: 'BUFFERING',
        label: 'Đang tích lũy (Chậm)',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold',
        wipWeight,
        description: `Đọng ${wipWeight.toFixed(1)} kg, tốc độ ra chưa kịp vào`
      };
    }

    // Lưu thông tốt: Hàng dở dang ít (<= 10kg) hoặc chuyền đã giải phóng hết
    return {
      status: 'SMOOTH',
      label: 'Thông suốt (Tốt)',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium',
      wipWeight,
      description: wipWeight === 0 ? 'Không tồn đọng' : `Tồn nhỏ (${wipWeight.toFixed(1)} kg)`
    };
  }
};
