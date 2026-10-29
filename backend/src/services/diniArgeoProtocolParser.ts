/**
 * BỘ PHÂN TÍCH GIAO THỨC CHUỖI ASCII ĐẦU CÂN DINI ARGEO (DFWL, 3590E, DGT)
 * Giao tiếp qua cổng RS232 / RS485 chuyển tiếp về vi điều khiển STM32
 */

export interface DiniParsedResult {
  isValid: boolean;
  isStable: boolean;          // true nếu là 'ST' (Stable), false nếu là 'US' (Unstable)
  isOverload: boolean;        // true nếu là 'OL' (Overload)
  typeWeight: 'GS' | 'NT';    // GS = Gross (Tổng), NT = Net (Tịnh)
  weight: number;             // Giá trị cân (kg)
  tare: number;               // Giá trị bì (kg)
  unit: string;               // 'kg', 'g', 'lb'
  error?: string;
  rawString: string;
}

export const diniArgeoProtocolParser = {
  /**
   * Phân tích chuỗi Telegram ASCII từ Dini Argeo
   * Ví dụ:
   * 1. 'ST,GS,+  15.000,kg\r\n'  (Cân ổn định, tổng 15kg)
   * 2. 'ST,NT,+  14.000,kg\r\n'  (Cân ổn định, tịnh 14kg)
   * 3. 'US,GS,+  12.350,kg\r\n'  (Cân đang dao động, chưa ổn định)
   * 4. 'ST,NT,+  14.000,kg,TR,+  01.000,kg\r\n' (Đầy đủ cả Net và Tare)
   */
  parse(rawInput: string): DiniParsedResult {
    const raw = rawInput.trim();
    if (!raw) {
      return {
        isValid: false,
        isStable: false,
        isOverload: false,
        typeWeight: 'GS',
        weight: 0,
        tare: 0,
        unit: 'kg',
        error: 'Chuỗi dữ liệu rỗng',
        rawString: rawInput
      };
    }

    // Tách các trường bằng dấu phẩy
    const parts = raw.split(',').map(p => p.trim());

    // Kiểm tra định dạng cơ bản
    if (parts.length < 3) {
      return {
        isValid: false,
        isStable: false,
        isOverload: false,
        typeWeight: 'GS',
        weight: 0,
        tare: 0,
        unit: 'kg',
        error: `Định dạng Dini Argeo không hợp lệ: ${raw}`,
        rawString: rawInput
      };
    }

    const statusCode = parts[0].toUpperCase(); // 'ST', 'US', 'OL'
    const typeCode = parts[1].toUpperCase() === 'NT' ? 'NT' : 'GS'; // 'GS' hoặc 'NT'
    const weightStr = parts[2].replace(/\s+/g, ''); // loại bỏ khoảng trắng thừa "+015.000"
    const unit = (parts[3] || 'kg').toLowerCase();

    const isStable = statusCode === 'ST';
    const isOverload = statusCode === 'OL';
    const weight = parseFloat(weightStr);

    let tare = 0;
    // Nếu có trường Tare mở rộng (TR)
    const tareIdx = parts.findIndex(p => p.toUpperCase() === 'TR');
    if (tareIdx !== -1 && parts[tareIdx + 1]) {
      tare = parseFloat(parts[tareIdx + 1].replace(/\s+/g, '')) || 0;
    }

    if (isNaN(weight)) {
      return {
        isValid: false,
        isStable,
        isOverload,
        typeWeight: typeCode,
        weight: 0,
        tare,
        unit,
        error: `Không thể đọc giá trị số từ chuỗi: "${weightStr}"`,
        rawString: rawInput
      };
    }

    return {
      isValid: true,
      isStable,
      isOverload,
      typeWeight: typeCode,
      weight: Number(weight.toFixed(3)),
      tare: Number(tare.toFixed(3)),
      unit,
      rawString: rawInput
    };
  }
};
