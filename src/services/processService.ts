import { ProcessStage, FlowConnection, ProcessMapping } from '../types/process.types';

const STAGES_STORAGE_KEY = 'pb_process_stages_v3';
const MAPPINGS_STORAGE_KEY = 'pb_process_mappings_v1';

// 15 Công đoạn chuẩn hoá 100% khớp sơ đồ processflow.jpg và PMSL.sql
export const DEFAULT_PROCESS_STAGES: ProcessStage[] = [
  {
    processId: 'CD001',
    id: 'CD001',
    processName: 'Tiếp nhận nguyên liệu',
    name: 'Tiếp nhận nguyên liệu',
    flowTitle: 'Material Receiving',
    col: 1,
    row: 1,
    desc: 'Kiểm tra chất lượng và tiếp nhận tôm nguyên liệu đầu vào',
    color: { bg: '#FFEEDB', border: '#DCA365', text: '#4A2800' }
  },
  {
    processId: 'CD002',
    id: 'CD002',
    processName: 'Rửa 1 & Phân cỡ sơ bộ',
    name: 'Rửa 1 & Phân cỡ sơ bộ',
    flowTitle: 'Grading & Sizing',
    col: 1,
    row: 2,
    desc: 'Rửa sạch tạp chất và phân loại tôm theo kích cỡ tiêu chuẩn',
    color: { bg: '#FCE2E6', border: '#DF8F9B', text: '#4A0814' }
  },
  {
    processId: 'CD003',
    id: 'CD003',
    processName: 'Xếp khuôn & Định lượng',
    name: 'Xếp khuôn & Định lượng',
    flowTitle: 'Stacking & Batching',
    col: 1,
    row: 3,
    desc: 'Xếp khuôn định hình và cân định lượng theo mẻ',
    color: { bg: '#F0E8F7', border: '#BFA0D8', text: '#3B0D59' }
  },
  {
    processId: 'CD004',
    id: 'CD004',
    processName: 'Sơ chế (Bóc vỏ & Rút chỉ)',
    name: 'Sơ chế (Bóc vỏ & Rút chỉ)',
    flowTitle: 'Peeling & Deveining',
    col: 1,
    row: 4,
    desc: 'Bóc vỏ, vặt đầu hoặc rút chỉ lưng theo quy cách sản phẩm',
    color: { bg: '#E3F7E3', border: '#8EC68E', text: '#0E440E' }
  },
  {
    processId: 'CD005',
    id: 'CD005',
    processName: 'Ngâm xử lý phụ gia',
    name: 'Ngâm xử lý phụ gia',
    flowTitle: 'Soaking Process',
    col: 1,
    row: 5,
    desc: 'Ngâm xử lý phụ gia theo quy chuẩn an toàn vệ sinh thực phẩm',
    color: { bg: '#FCE3DF', border: '#E89184', text: '#5C140A' }
  },
  {
    processId: 'CD006',
    id: 'CD006',
    processName: 'Định hình Nobashi / Xẻ bướm',
    name: 'Định hình Nobashi / Xẻ bướm',
    flowTitle: 'Nobashi & Butterfly',
    col: 1,
    row: 6,
    desc: 'Định hình tôm duỗi thẳng Nobashi hoặc xẻ bướm xuất khẩu',
    color: { bg: '#E9F1FC', border: '#9BBCE8', text: '#0B2F5C' }
  },
  {
    processId: 'CD007',
    id: 'CD007',
    processName: 'Tẩm bột chiên xù',
    name: 'Tẩm bột chiên xù',
    flowTitle: 'Breading Process',
    col: 1,
    row: 7,
    desc: 'Tẩm bột Panko hoặc bột tẩm gia vị tiêu chuẩn',
    color: { bg: '#E4E8EF', border: '#8E9BB0', text: '#1A2634' }
  },
  {
    processId: 'CD008',
    id: 'CD008',
    processName: 'Chiên định hình dầu nóng',
    name: 'Chiên định hình dầu nóng',
    flowTitle: 'Breaded Frying',
    col: 1,
    row: 8,
    desc: 'Chiên định hình qua dầu nhiệt độ cao tạo độ giòn vàng',
    color: { bg: '#DCF7F7', border: '#78D1D1', text: '#073B3B' }
  },
  {
    processId: 'CD009',
    id: 'CD009',
    processName: 'Luộc / Hấp tôm nõn (PD)',
    name: 'Luộc / Hấp tôm nõn (PD)',
    flowTitle: 'PD Cooking',
    col: 2,
    row: 8,
    desc: 'Gia nhiệt hấp hoặc luộc chín đối với tôm thịt PD',
    color: { bg: '#BDF0F0', border: '#5ECACA', text: '#073B3B' }
  },
  {
    processId: 'CD010',
    id: 'CD010',
    processName: 'Luộc / Hấp tôm vỏ (HLSO)',
    name: 'Luộc / Hấp tôm vỏ (HLSO)',
    flowTitle: 'HLSO Cooking',
    col: 3,
    row: 8,
    desc: 'Gia nhiệt hấp hoặc luộc chín đối với tôm còn vỏ HLSO',
    color: { bg: '#BDF0F0', border: '#5ECACA', text: '#073B3B' }
  },
  {
    processId: 'CD011',
    id: 'CD011',
    processName: 'Tách vỏ sau luộc',
    name: 'Tách vỏ sau luộc',
    flowTitle: 'Peel After Cook',
    col: 3,
    row: 9,
    desc: 'Bóc vỏ tôm sau khi luộc chín phục vụ chế biến salad',
    color: { bg: '#FDF8C7', border: '#DAC448', text: '#4D4004' }
  },
  {
    processId: 'CD012',
    id: 'CD012',
    processName: 'Cấp đông xoắn tôm tươi',
    name: 'Cấp đông xoắn tôm tươi',
    flowTitle: 'Raw Spiral Freezer',
    col: 1,
    row: 10,
    desc: 'Cấp đông bằng băng chuyền xoắn đối với sản phẩm tôm tươi',
    color: { bg: '#FFEEDB', border: '#DCA365', text: '#4A2800' }
  },
  {
    processId: 'CD013',
    id: 'CD013',
    processName: 'Cấp đông xoắn tôm chiên',
    name: 'Cấp đông xoắn tôm chiên',
    flowTitle: 'Fried Spiral Freezer',
    col: 2,
    row: 10,
    desc: 'Cấp đông bằng băng chuyền xoắn đối với sản phẩm tôm chiên',
    color: { bg: '#FFEEDB', border: '#DCA365', text: '#4A2800' }
  },
  {
    processId: 'CD014',
    id: 'CD014',
    processName: 'Cấp đông IQF tôm tươi',
    name: 'Cấp đông IQF tôm tươi',
    flowTitle: 'Raw IQF Freezer',
    col: 3,
    row: 10,
    desc: 'Cấp đông siêu tốc rời IQF và mạ băng tôm tươi',
    color: { bg: '#FFEEDB', border: '#DCA365', text: '#4A2800' }
  },
  {
    processId: 'CD015',
    id: 'CD015',
    processName: 'Cấp đông IQF tôm chín',
    name: 'Cấp đông IQF tôm chín',
    flowTitle: 'Cooked IQF Freezer',
    col: 4,
    row: 10,
    desc: 'Cấp đông siêu tốc rời IQF đối với sản phẩm tôm đã làm chín',
    color: { bg: '#FFEEDB', border: '#DCA365', text: '#4A2800' }
  }
];

// 17 Mũi tên liên kết giữa các công đoạn chuẩn processflow.jpg
export const DEFAULT_FLOW_CONNECTIONS: FlowConnection[] = [
  { from: 'CD001', fromPort: 'bottom', to: 'CD002', toPort: 'top', type: 'straight' },
  { from: 'CD002', fromPort: 'bottom', to: 'CD003', toPort: 'top', type: 'straight' },
  { from: 'CD003', fromPort: 'bottom', to: 'CD004', toPort: 'top', type: 'straight' },
  { from: 'CD003', fromPort: 'left', to: 'CD005', toPort: 'left', type: 'left-bypass' },
  { from: 'CD004', fromPort: 'bottom', to: 'CD005', toPort: 'top', type: 'straight' },
  { from: 'CD005', fromPort: 'bottom', to: 'CD006', toPort: 'top', type: 'straight' },
  { from: 'CD005', fromPort: 'right', to: 'CD009', toPort: 'top', type: 'branch-top' },
  { from: 'CD005', fromPort: 'right', to: 'CD010', toPort: 'top', type: 'branch-top' },
  { from: 'CD005', fromPort: 'right', to: 'CD014', toPort: 'left', type: 'long-to-col3' },
  { from: 'CD006', fromPort: 'bottom', to: 'CD007', toPort: 'top', type: 'straight' },
  { from: 'CD006', fromPort: 'right', to: 'CD015', toPort: 'top', type: 'long-to-col4' },
  { from: 'CD007', fromPort: 'bottom', to: 'CD008', toPort: 'top', type: 'straight' },
  { from: 'CD007', fromPort: 'right', to: 'CD012', toPort: 'top', type: 'bypass-col1' },
  { from: 'CD008', fromPort: 'bottom', to: 'CD013', toPort: 'left', type: 'bottom-to-left' },
  { from: 'CD009', fromPort: 'bottom', to: 'CD013', toPort: 'top', type: 'straight' },
  { from: 'CD010', fromPort: 'bottom', to: 'CD011', toPort: 'top', type: 'straight' },
  { from: 'CD011', fromPort: 'bottom', to: 'CD015', toPort: 'top', type: 'bottom-to-top-right' }
];

// 17 Bản ghi mapping quy trình (Bảng phụ tự liên kết Node -> Node trong PostgreSQL)
export const DEFAULT_PROCESS_MAPPINGS: ProcessMapping[] = [
  { id: 'MAP001', fromProcessId: 'CD001', toProcessId: 'CD002', transitionType: 'DIRECT', description: 'Tiếp nhận nguyên liệu -> Rửa 1 & Phân cỡ sơ bộ', orderIndex: 1, isActive: true },
  { id: 'MAP002', fromProcessId: 'CD002', toProcessId: 'CD003', transitionType: 'DIRECT', description: 'Rửa 1 & Phân cỡ sơ bộ -> Xếp khuôn & Định lượng', orderIndex: 2, isActive: true },
  { id: 'MAP003', fromProcessId: 'CD003', toProcessId: 'CD004', transitionType: 'DIRECT', description: 'Xếp khuôn & Định lượng -> Sơ chế (Bóc vỏ & Rút chỉ)', orderIndex: 3, isActive: true },
  { id: 'MAP004', fromProcessId: 'CD003', toProcessId: 'CD005', transitionType: 'BYPASS', description: 'Xếp khuôn & Định lượng -> Ngâm xử lý (Vượt cấp sơ chế)', orderIndex: 4, isActive: true },
  { id: 'MAP005', fromProcessId: 'CD004', toProcessId: 'CD005', transitionType: 'DIRECT', description: 'Sơ chế (Bóc vỏ & Rút chỉ) -> Ngâm xử lý phụ gia', orderIndex: 5, isActive: true },
  { id: 'MAP006', fromProcessId: 'CD005', toProcessId: 'CD006', transitionType: 'DIRECT', description: 'Ngâm xử lý phụ gia -> Định hình Nobashi / Xẻ bướm', orderIndex: 6, isActive: true },
  { id: 'MAP007', fromProcessId: 'CD005', toProcessId: 'CD009', transitionType: 'BRANCH', description: 'Ngâm xử lý phụ gia -> Luộc / Hấp tôm nõn (PD)', orderIndex: 7, isActive: true },
  { id: 'MAP008', fromProcessId: 'CD005', toProcessId: 'CD010', transitionType: 'BRANCH', description: 'Ngâm xử lý phụ gia -> Luộc / Hấp tôm vỏ (HLSO)', orderIndex: 8, isActive: true },
  { id: 'MAP009', fromProcessId: 'CD005', toProcessId: 'CD014', transitionType: 'BRANCH', description: 'Ngâm xử lý phụ gia -> Cấp đông IQF tôm tươi', orderIndex: 9, isActive: true },
  { id: 'MAP010', fromProcessId: 'CD006', toProcessId: 'CD007', transitionType: 'DIRECT', description: 'Định hình Nobashi / Xẻ bướm -> Tẩm bột chiên xù', orderIndex: 10, isActive: true },
  { id: 'MAP011', fromProcessId: 'CD007', toProcessId: 'CD008', transitionType: 'DIRECT', description: 'Tẩm bột chiên xù -> Chiên định hình dầu nóng', orderIndex: 11, isActive: true },
  { id: 'MAP012', fromProcessId: 'CD008', toProcessId: 'CD012', transitionType: 'DIRECT', description: 'Chiên định hình dầu nóng -> Cấp đông xoắn tôm tươi', orderIndex: 12, isActive: true },
  { id: 'MAP013', fromProcessId: 'CD008', toProcessId: 'CD013', transitionType: 'BRANCH', description: 'Chiên định hình dầu nóng -> Cấp đông xoắn tôm chiên', orderIndex: 13, isActive: true },
  { id: 'MAP014', fromProcessId: 'CD009', toProcessId: 'CD013', transitionType: 'DIRECT', description: 'Luộc / Hấp tôm nõn (PD) -> Cấp đông xoắn tôm chiên', orderIndex: 14, isActive: true },
  { id: 'MAP015', fromProcessId: 'CD010', toProcessId: 'CD011', transitionType: 'DIRECT', description: 'Luộc / Hấp tôm vỏ (HLSO) -> Tách vỏ sau luộc', orderIndex: 15, isActive: true },
  { id: 'MAP016', fromProcessId: 'CD011', toProcessId: 'CD014', transitionType: 'DIRECT', description: 'Tách vỏ sau luộc -> Cấp đông IQF tôm tươi', orderIndex: 16, isActive: true },
  { id: 'MAP017', fromProcessId: 'CD011', toProcessId: 'CD015', transitionType: 'BRANCH', description: 'Tách vỏ sau luộc -> Cấp đông IQF tôm chín', orderIndex: 17, isActive: true }
];

export const processService = {
  // ==========================================
  // QUẢN LÝ CÔNG ĐOẠN (BẢNG process TRONG DB)
  // ==========================================
  /**
   * Tải danh mục công đoạn và luồng quy trình trực tiếp từ PostgreSQL Database qua Backend API
   */
  async fetchProcesses(): Promise<{ stages: ProcessStage[]; mappings: ProcessMapping[] }> {
    try {
      const res = await fetch('/api/processes');
      if (res.ok) {
        const data = await res.json();
        if (data.stages) this.saveProcesses(data.stages);
        if (data.mappings) this.saveProcessMappings(data.mappings);
        return data;
      }
    } catch (err) {
      console.warn('[processService] Không kết nối được API Backend, dùng cache:', err);
    }
    return { stages: this.getProcesses(), mappings: this.getProcessMappings() };
  },

  async addProcessToDatabase(stage: ProcessStage): Promise<ProcessStage[]> {
    try {
      const res = await fetch('/api/processes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stage)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.stages) this.saveProcesses(data.stages);
        return data.stages || this.getProcesses();
      }
    } catch (err) {
      console.error('[processService] Lỗi khi thêm công đoạn vào DB:', err);
    }
    return this.addProcess(stage);
  },

  async deleteProcessFromDatabase(stageId: string): Promise<ProcessStage[]> {
    try {
      const res = await fetch(`/api/processes/${stageId}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        if (data.stages) this.saveProcesses(data.stages);
        return data.stages || this.getProcesses();
      }
    } catch (err) {
      console.error('[processService] Lỗi khi xoá công đoạn trong DB:', err);
    }
    return this.deleteProcess(stageId);
  },

  getProcesses(): ProcessStage[] {
    if (typeof window === 'undefined') return DEFAULT_PROCESS_STAGES;
    const data = localStorage.getItem(STAGES_STORAGE_KEY);
    if (!data) {
      this.saveProcesses(DEFAULT_PROCESS_STAGES);
      return DEFAULT_PROCESS_STAGES;
    }
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_PROCESS_STAGES;
    }
  },

  saveProcesses(stages: ProcessStage[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STAGES_STORAGE_KEY, JSON.stringify(stages));
    }
  },

  addProcess(stage: ProcessStage): ProcessStage[] {
    const list = this.getProcesses();
    const updated = [...list, stage];
    this.saveProcesses(updated);
    return updated;
  },

  updateProcess(stage: ProcessStage, oldStageId?: string): ProcessStage[] {
    const list = this.getProcesses();
    const targetId = oldStageId || stage.processId || stage.id;
    const newId = stage.processId || stage.id;
    const updated = list.map(s => ((s.processId || s.id) === targetId ? { ...s, ...stage } : s));
    this.saveProcesses(updated);

    // Tự động đồng bộ sang bảng process_mapping khi đổi mã công đoạn (Soft Cascade)
    if (targetId && newId && targetId !== newId) {
      const mappings = this.getProcessMappings().map(m => ({
        ...m,
        fromProcessId: m.fromProcessId === targetId ? newId : m.fromProcessId,
        toProcessId: m.toProcessId === targetId ? newId : m.toProcessId,
        updatedAt: new Date().toISOString()
      }));
      this.saveProcessMappings(mappings);
    }

    return updated;
  },

  deleteProcess(stageId: string, onCascadeDeleteStation?: (stageId: string) => void): ProcessStage[] {
    const list = this.getProcesses();
    const updated = list.filter(s => (s.processId || s.id) !== stageId);
    this.saveProcesses(updated);

    // Xử lý mềm: Dọn dẹp liên kết mồ côi liên quan đến node vừa xoá
    const mappings = this.getProcessMappings();
    const cleanedMappings = mappings.filter(m => m.fromProcessId !== stageId && m.toProcessId !== stageId);
    this.saveProcessMappings(cleanedMappings);

    // Kích hoạt callback thu hồi cân nếu có
    if (onCascadeDeleteStation) {
      onCascadeDeleteStation(stageId);
    }

    return updated;
  },

  getConnections(): FlowConnection[] {
    return DEFAULT_FLOW_CONNECTIONS;
  },

  // ==========================================
  // QUẢN LÝ BẢNG PHỤ PROCESS MAPPING (Node -> Node)
  // ==========================================
  getProcessMappings(): ProcessMapping[] {
    if (typeof window === 'undefined') return DEFAULT_PROCESS_MAPPINGS;
    const data = localStorage.getItem(MAPPINGS_STORAGE_KEY);
    if (!data) {
      this.saveProcessMappings(DEFAULT_PROCESS_MAPPINGS);
      return DEFAULT_PROCESS_MAPPINGS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_PROCESS_MAPPINGS;
    }
  },

  saveProcessMappings(mappings: ProcessMapping[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(MAPPINGS_STORAGE_KEY, JSON.stringify(mappings));
    }
  },

  /**
   * Function Soft Validation ở tầng Service thay thế Foreign Key:
   * 1. Kiểm tra trường bắt buộc
   * 2. Chặn vòng lặp tự thân (Self-loop)
   * 3. Kiểm tra công đoạn có tồn tại
   * 4. Chặn trùng lặp quan hệ có hướng
   * 5. Cycle Detection (Thuật toán BFS kiểm tra DAG)
   */
  validateProcessMapping(
    mapping: Partial<ProcessMapping>,
    existingMappings?: ProcessMapping[]
  ): { isValid: boolean; error?: string } {
    const fromId = mapping.fromProcessId?.trim();
    const toId = mapping.toProcessId?.trim();

    if (!fromId) {
      return { isValid: false, error: 'Mã công đoạn nguồn (from_process_id) không được để trống.' };
    }
    if (!toId) {
      return { isValid: false, error: 'Mã công đoạn đích (to_process_id) không được để trống.' };
    }

    // 1. Chặn vòng lặp tự thân
    if (fromId === toId) {
      return { isValid: false, error: `Công đoạn [${fromId}] không thể tự trỏ vào chính nó.` };
    }

    // 2. Kiểm tra tồn tại mềm ở bảng process
    const stages = this.getProcesses();
    const fromExists = stages.some(s => (s.processId || s.id) === fromId);
    const toExists = stages.some(s => (s.processId || s.id) === toId);

    if (!fromExists) {
      return { isValid: false, error: `Công đoạn nguồn [${fromId}] không tồn tại trong danh mục process.` };
    }
    if (!toExists) {
      return { isValid: false, error: `Công đoạn đích [${toId}] không tồn tại trong danh mục process.` };
    }

    // 3. Chặn trùng lặp cạnh có hướng
    const list = existingMappings || this.getProcessMappings();
    const isDuplicate = list.some(
      m => m.id !== mapping.id && m.fromProcessId === fromId && m.toProcessId === toId
    );
    if (isDuplicate) {
      return { isValid: false, error: `Liên kết luồng từ [${fromId}] đến [${toId}] đã tồn tại trong quy trình.` };
    }

    // 4. CHẶN VÒNG LẶP VÔ TẬN (Cycle Detection trong DAG bằng BFS):
    const otherMappings = list.filter(m => m.id !== mapping.id && m.isActive !== false);
    if (this.hasPath(toId, fromId, otherMappings)) {
      return {
        isValid: false,
        error: `Không thể tạo liên kết từ [${fromId}] đến [${toId}] vì sẽ tạo thành vòng lặp vô tận (Cycle loop). Quy trình bắt buộc phải là đồ thị có hướng không chu trình (DAG).`
      };
    }

    return { isValid: true };
  },

  /**
   * Thuật toán BFS kiểm tra xem có đường đi từ startStageId đến targetStageId hay không
   */
  hasPath(startStageId: string, targetStageId: string, customMappings?: ProcessMapping[]): boolean {
    if (startStageId === targetStageId) return true;
    const mappings = (customMappings || this.getProcessMappings()).filter(m => m.isActive !== false);

    const visited = new Set<string>();
    const queue: string[] = [startStageId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === targetStageId) return true;

      if (!visited.has(current)) {
        visited.add(current);
        const nextNodes = mappings
          .filter(m => m.fromProcessId === current)
          .map(m => m.toProcessId);

        for (const next of nextNodes) {
          if (!visited.has(next)) {
            queue.push(next);
          }
        }
      }
    }

    return false;
  },

  /**
   * KIỂM ĐỊNH SỨC KHỎE ĐỒ THỊ QUY TRÌNH (Graph Health Check):
   * Phát hiện Node cô lập hoặc Điểm nghẽn không lối ra
   */
  validateGraphHealth(): {
    isValid: boolean;
    warnings: string[];
    isolatedNodes: string[];
    deadEndNodes: string[];
  } {
    const stages = this.getProcesses();
    const mappings = this.getProcessMappings().filter(m => m.isActive !== false);
    const warnings: string[] = [];

    const entryStages = new Set(['CD001']);
    const exitStages = new Set(['CD012', 'CD013', 'CD014', 'CD015']);

    const isolatedNodes: string[] = [];
    const deadEndNodes: string[] = [];

    stages.forEach(st => {
      const sId = st.processId || st.id || '';
      const hasIn = mappings.some(m => m.toProcessId === sId);
      const hasOut = mappings.some(m => m.fromProcessId === sId);

      if (!hasIn && !entryStages.has(sId)) {
        isolatedNodes.push(sId);
        warnings.push(`Công đoạn [${sId} - ${st.processName || st.name}] đang bị cô lập (chưa có công đoạn nào chuyển nguyên liệu đến).`);
      }

      if (!hasOut && !exitStages.has(sId)) {
        deadEndNodes.push(sId);
        warnings.push(`Công đoạn [${sId} - ${st.processName || st.name}] là điểm nghẽn (chưa có luồng chuyển tiếp nguyên liệu đi tiếp).`);
      }
    });

    return {
      isValid: warnings.length === 0,
      warnings,
      isolatedNodes,
      deadEndNodes
    };
  },

  /**
   * Kiểm tra xem 2 công đoạn có được phép chuyển giao mẻ hàng cho nhau hay không
   */
  validateProductionTransition(fromStageId: string, toStageId: string): { isValid: boolean; error?: string } {
    if (fromStageId === toStageId) return { isValid: true };
    const pathExists = this.hasPath(fromStageId, toStageId);
    if (!pathExists) {
      return {
        isValid: false,
        error: `Luồng chuyển giao bất thường: Không có đường đi hợp lệ từ công đoạn [${fromStageId}] đến [${toStageId}] trong sơ đồ quy trình.`
      };
    }
    return { isValid: true };
  },

  /**
   * Quét và làm sạch các liên kết mồ côi (Orphan mappings)
   */
  cleanOrphanMappings(): { removedCount: number; updated: ProcessMapping[] } {
    const stages = this.getProcesses();
    const stageIds = new Set(stages.map(s => s.processId || s.id));
    const list = this.getProcessMappings();

    const validMappings = list.filter(m => stageIds.has(m.fromProcessId) && stageIds.has(m.toProcessId));
    const removedCount = list.length - validMappings.length;

    if (removedCount > 0) {
      this.saveProcessMappings(validMappings);
    }

    return { removedCount, updated: validMappings };
  },

  addProcessMapping(mapping: Omit<ProcessMapping, 'id'> & { id?: string }): { success: boolean; data: ProcessMapping[]; error?: string } {
    const validation = this.validateProcessMapping(mapping);
    const list = this.getProcessMappings();

    if (!validation.isValid) {
      return { success: false, data: list, error: validation.error };
    }

    const id = mapping.id || `MAP${String(list.length + 1).padStart(3, '0')}`;
    const newMapping: ProcessMapping = {
      ...mapping,
      id,
      isActive: mapping.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [...list, newMapping];
    this.saveProcessMappings(updated);
    return { success: true, data: updated };
  },

  updateProcessMapping(mapping: ProcessMapping): { success: boolean; data: ProcessMapping[]; error?: string } {
    const validation = this.validateProcessMapping(mapping);
    const list = this.getProcessMappings();

    if (!validation.isValid) {
      return { success: false, data: list, error: validation.error };
    }

    const updated = list.map(m => m.id === mapping.id ? { ...m, ...mapping, updatedAt: new Date().toISOString() } : m);
    this.saveProcessMappings(updated);
    return { success: true, data: updated };
  },

  deleteProcessMapping(mappingId: string): ProcessMapping[] {
    const list = this.getProcessMappings();
    const updated = list.filter(m => m.id !== mappingId);
    this.saveProcessMappings(updated);
    return updated;
  },

  getMappingsForStage(processId: string): { outgoing: ProcessMapping[]; incoming: ProcessMapping[] } {
    const mappings = this.getProcessMappings().filter(m => m.isActive !== false);
    return {
      outgoing: mappings.filter(m => m.fromProcessId === processId),
      incoming: mappings.filter(m => m.toProcessId === processId)
    };
  }
};
