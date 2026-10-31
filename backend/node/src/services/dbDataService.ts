import { pool } from '../db';

export interface DBProcess {
  process_id: string;
  process_name: string;
  flow_title?: string;
  col_index: number;
  row_index: number;
  description?: string;
  color_bg?: string;
  color_border?: string;
  color_text?: string;
  is_active: boolean;
}

export interface DBProcessMapping {
  mapping_id: string;
  from_process_id: string;
  to_process_id: string;
  transition_type: string;
  description?: string;
  order_index: number;
  is_active: boolean;
}

export interface DBStation {
  station_id: string;
  station_name: string;
  process_id: string;
  io_type: 'IN' | 'OUT';
  hub_id?: string | null;
  indicator_model: string;
  model?: string;
  status: string;
  is_active: boolean;
  max_weight: number;
  division: number;
  protocol: string;
  address: string;
  location?: string;
  last_seen_at?: string;
  created_at?: string;
}

export interface DBProduct {
  product_id: string;
  product_name: string;
  stage_id: string;
  type: string;
  unit: string;
  spec?: string;
  is_end: boolean;
}

export interface DBLog {
  log_id: number;
  batch_id: string;
  station_id: string;
  process_id: string;
  product_id: string;
  type_weight: 'IN' | 'OUT';
  value_weight: number;
  tare_weight: number;
  net_weight: number;
  time_action: string;
  employee_id?: string | null;
  source_method?: string | null;
}

export const dbDataService = {
  // ==========================================
  // 1. QUY TRÌNH & MAPPING (process, process_mapping)
  // ==========================================
  async getProcesses(): Promise<{ stages: any[]; mappings: any[] }> {
    const stageRes = await pool.query(
      `SELECT * FROM process WHERE is_active = TRUE ORDER BY row_index ASC, col_index ASC, process_id ASC`
    );
    const mappingRes = await pool.query(
      `SELECT * FROM process_mapping WHERE is_active = TRUE ORDER BY order_index ASC`
    );

    const stages = stageRes.rows.map(r => ({
      processId: r.process_id,
      processName: r.process_name,
      id: r.process_id,
      name: r.process_name,
      flowTitle: r.flow_title,
      colIndex: r.col_index,
      rowIndex: r.row_index,
      description: r.description,
      colorBg: r.color_bg,
      colorBorder: r.color_border,
      colorText: r.color_text,
      isActive: r.is_active
    }));

    const mappings = mappingRes.rows.map(m => ({
      mappingId: m.mapping_id,
      fromProcessId: m.from_process_id,
      toProcessId: m.to_process_id,
      transitionType: m.transition_type,
      description: m.description,
      orderIndex: m.order_index,
      isActive: m.is_active
    }));

    return { stages, mappings };
  },

  async addProcess(p: any): Promise<void> {
    await pool.query(
      `INSERT INTO process (process_id, process_name, flow_title, col_index, row_index, description, color_bg, color_border, color_text, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (process_id) DO UPDATE SET
         process_name = EXCLUDED.process_name,
         flow_title = EXCLUDED.flow_title,
         col_index = EXCLUDED.col_index,
         row_index = EXCLUDED.row_index,
         description = EXCLUDED.description`,
      [
        p.processId || p.id,
        p.processName || p.name,
        p.flowTitle || null,
        p.colIndex || 1,
        p.rowIndex || 1,
        p.description || null,
        p.colorBg || '#FFFFFF',
        p.colorBorder || '#CBD5E1',
        p.colorText || '#1E293B',
        p.isActive ?? true
      ]
    );
  },

  async deleteProcess(processId: string): Promise<void> {
    await pool.query(`DELETE FROM process WHERE process_id = $1`, [processId]);
    await pool.query(`DELETE FROM process_mapping WHERE from_process_id = $1 OR to_process_id = $1`, [processId]);
  },

  // ==========================================
  // 2. TRẠM CÂN (station_weigh)
  // ==========================================
  async getStations(): Promise<any[]> {
    const res = await pool.query(
      `SELECT * FROM station_weigh ORDER BY station_id ASC`
    );
    return res.rows.map(r => ({
      stationId: r.station_id,
      stationName: r.station_name,
      id: r.station_id,
      name: r.station_name,
      processId: r.process_id,
      stageId: r.process_id,
      ioType: r.io_type,
      typeWeight: r.io_type,
      hubId: r.hub_id,
      indicatorModel: r.indicator_model,
      model: r.model,
      status: r.status,
      isActive: r.is_active,
      maxWeight: Number(r.max_weight),
      division: Number(r.division),
      protocol: r.protocol,
      address: r.address,
      location: r.location,
      lastSeenAt: r.last_seen_at ? r.last_seen_at.toISOString() : null,
      createdAt: r.created_at ? r.created_at.toISOString() : null
    }));
  },

  async addStation(s: any): Promise<void> {
    const sId = s.stationId || s.id;
    const sName = s.stationName || s.name;
    const pId = s.processId || s.stageId || 'CD001';
    const io = s.ioType || s.typeWeight || 'IN';

    await pool.query(
      `INSERT INTO station_weigh (station_id, station_name, process_id, io_type, indicator_model, model, status, is_active, max_weight, division, protocol, address, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (station_id) DO UPDATE SET
         station_name = EXCLUDED.station_name,
         process_id = EXCLUDED.process_id,
         io_type = EXCLUDED.io_type,
         status = EXCLUDED.status,
         is_active = EXCLUDED.is_active,
         protocol = EXCLUDED.protocol,
         address = EXCLUDED.address,
         location = EXCLUDED.location`,
      [
        sId,
        sName,
        pId,
        io,
        s.indicatorModel || 'DINI_ARGEO',
        s.model || 'DINI ARGEO DFWL',
        s.status || 'ONLINE',
        s.isActive ?? true,
        s.maxWeight || 150,
        s.division || 10,
        s.protocol || 'TCP/IP',
        s.address || '192.168.1.100:8000',
        s.location || ''
      ]
    );
  },

  async updateStation(s: any): Promise<void> {
    await this.addStation(s);
  },

  async deleteStation(stationId: string): Promise<void> {
    await pool.query(`DELETE FROM station_weigh WHERE station_id = $1`, [stationId]);
  },

  // ==========================================
  // 3. SẢN PHẨM (product)
  // ==========================================
  async getProducts(): Promise<any[]> {
    const res = await pool.query(
      `SELECT * FROM product ORDER BY stage_id ASC, product_id ASC`
    );
    return res.rows.map(r => ({
      id: r.product_id,
      name: r.product_name,
      stageId: r.stage_id,
      type: r.type,
      unit: r.unit,
      spec: r.spec,
      isEnd: r.is_end
    }));
  },

  async addProduct(p: any): Promise<void> {
    await pool.query(
      `INSERT INTO product (product_id, product_name, stage_id, type, unit, spec, is_end)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (product_id) DO UPDATE SET
         product_name = EXCLUDED.product_name,
         stage_id = EXCLUDED.stage_id,
         type = EXCLUDED.type,
         unit = EXCLUDED.unit,
         spec = EXCLUDED.spec,
         is_end = EXCLUDED.is_end`,
      [p.id, p.name, p.stageId, p.type || 'SEMI', p.unit || 'kg', p.spec || '', p.isEnd ?? false]
    );
  },

  async deleteProduct(id: string): Promise<void> {
    await pool.query(`DELETE FROM product WHERE product_id = $1`, [id]);
  },

  // ==========================================
  // 4. NHẬT KÝ MẺ CÂN (production_weight_logs)
  // ==========================================
  async getLogs(batchId?: string): Promise<any[]> {
    let query = `SELECT * FROM production_weight_logs`;
    const params: any[] = [];
    if (batchId && batchId !== 'ALL') {
      query += ` WHERE batch_id = $1`;
      params.push(batchId);
    }
    query += ` ORDER BY time_action DESC, log_id DESC`;

    const res = await pool.query(query, params);
    return res.rows.map(r => ({
      log_id: Number(r.log_id),
      batch_id: r.batch_id,
      station_id: r.station_id,
      process_id: r.process_id,
      product_id: r.product_id,
      type_weight: r.type_weight,
      value_weight: Number(r.value_weight),
      tare_weight: Number(r.tare_weight),
      net_weight: Number(r.net_weight),
      time_action: r.time_action ? r.time_action.toISOString() : new Date().toISOString(),
      employee_id: r.employee_id,
      source_method: r.source_method
    }));
  },

  /**
   * Ghi nhận log mới trực tiếp vào PostgreSQL
   * NGUYÊN TẮC: Tự động tra cứu metadata từ station_weigh và product
   * Chỉ nhận { station_id, value_weight, tare_weight } từ cân
   */
  async createLog(input: {
    station_id: string;
    value_weight: number;
    tare_weight: number;
    batch_id?: string;
    product_id?: string;
    employee_id?: string | null;
    source_method?: string | null;
  }): Promise<any> {
    const val = Number(input.value_weight) || 0;
    const tare = Number(input.tare_weight) || 0;
    const net = Number((val - tare).toFixed(3));

    // 1. Soft Lookup từ station_weigh
    const stnRes = await pool.query(`SELECT * FROM station_weigh WHERE station_id = $1`, [input.station_id]);
    let processId = 'CD001';
    let typeWeight = 'IN';
    let protocol = 'TCP/IP';
    if (stnRes.rows.length > 0) {
      processId = stnRes.rows[0].process_id;
      typeWeight = stnRes.rows[0].io_type;
      protocol = stnRes.rows[0].protocol;
    }

    // 2. Soft Lookup từ product
    let productId = input.product_id;
    if (!productId) {
      const prodRes = await pool.query(`SELECT product_id FROM product WHERE stage_id = $1 LIMIT 1`, [processId]);
      productId = prodRes.rows.length > 0 ? prodRes.rows[0].product_id : 'TOM001';
    }

    // 3. Batch
    const batchId = input.batch_id || 'L0001';

    const insertRes = await pool.query(
      `INSERT INTO production_weight_logs (batch_id, station_id, process_id, product_id, type_weight, value_weight, tare_weight, net_weight, time_action, employee_id, source_method)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, $9, $10)
       RETURNING *`,
      [
        batchId,
        input.station_id,
        processId,
        productId,
        typeWeight,
        val,
        tare,
        net,
        input.employee_id || null,
        input.source_method || protocol
      ]
    );

    const r = insertRes.rows[0];
    return {
      log_id: Number(r.log_id),
      batch_id: r.batch_id,
      station_id: r.station_id,
      process_id: r.process_id,
      product_id: r.product_id,
      type_weight: r.type_weight,
      value_weight: Number(r.value_weight),
      tare_weight: Number(r.tare_weight),
      net_weight: Number(r.net_weight),
      time_action: r.time_action ? r.time_action.toISOString() : new Date().toISOString(),
      employee_id: r.employee_id,
      source_method: r.source_method
    };
  },

  async deleteLog(logId: number): Promise<void> {
    await pool.query(`DELETE FROM production_weight_logs WHERE log_id = $1`, [logId]);
  },

  // ==========================================
  // 5. CHỈ SỐ SẢN XUẤT TÍNH TỪ DATABASE
  // ==========================================
  async getMetrics(batchId?: string): Promise<any> {
    const logs = await this.getLogs(batchId);
    let inWeight = 0;
    let outWeight = 0;
    let inCount = 0;
    let outCount = 0;

    logs.forEach(l => {
      if (l.type_weight === 'IN') {
        inWeight += l.net_weight;
        inCount++;
      } else {
        outWeight += l.net_weight;
        outCount++;
      }
    });

    const wip = Math.max(0, inWeight - outWeight);
    const yieldRate = inWeight > 0 ? (outWeight / inWeight) * 100 : 0;
    const uniqueBatches = new Set(logs.map(l => l.batch_id));

    return {
      totalInWeight: Number(inWeight.toFixed(3)),
      totalOutWeight: Number(outWeight.toFixed(3)),
      wipWeight: Number(wip.toFixed(3)),
      yieldRate: Number(yieldRate.toFixed(1)),
      inCount,
      outCount,
      activeBatchesCount: uniqueBatches.size
    };
  },

  async getBatches(): Promise<string[]> {
    const res = await pool.query(`
      SELECT DISTINCT batch_id FROM (
        SELECT batch_id FROM batch
        UNION
        SELECT batch_id FROM production_weight_logs
      ) sub ORDER BY batch_id ASC
    `);
    return res.rows.map(r => r.batch_id);
  }
};
