import { ProcessStage, FlowConnection, ProcessMapping } from '../types/process.types';

const STAGES_STORAGE_KEY = 'pb_process_stages_db_cache_v1';
const MAPPINGS_STORAGE_KEY = 'pb_process_mappings_db_cache_v1';

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
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STAGES_STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
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
    const mappings = this.getProcessMappings().filter(m => m.isActive !== false);
    return mappings.map(m => ({
      from: m.fromProcessId,
      fromPort: 'bottom',
      to: m.toProcessId,
      toPort: 'top',
      type: m.transitionType === 'BYPASS' ? 'left-bypass' : m.transitionType === 'BRANCH' ? 'branch-top' : 'straight'
    }));
  },

  // ==========================================
  // QUẢN LÝ BẢNG PHỤ PROCESS MAPPING (Node -> Node)
  // ==========================================
  getProcessMappings(): ProcessMapping[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(MAPPINGS_STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
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
