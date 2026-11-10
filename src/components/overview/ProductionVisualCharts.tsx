import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ReferenceLine
} from 'recharts';
import {
  StageWiPSummary,
  ProductionMetrics,
  ProductionWeightLog,
  BatchSummary
} from '../../types/log.types';
import { StationWeigh } from '../../types/station.types';
import { ProductItem } from '../../types/product.types';
import { ProcessStage } from '../../types/process.types';

interface ProductionVisualChartsProps {
  stageWiPList: StageWiPSummary[];
  metrics: ProductionMetrics;
  logs: ProductionWeightLog[];
  selectedBatch: string;
  batchSummaries?: BatchSummary[];
  stations?: StationWeigh[];
  products?: ProductItem[];
  stages?: ProcessStage[];
}

const COLORS = [
  '#2563EB', // Blue
  '#059669', // Emerald
  '#D97706', // Amber
  '#7C3AED', // Violet
  '#DB2777', // Pink
  '#0891B2', // Cyan
  '#4F46E5', // Indigo
  '#EA580C', // Orange
  '#64748B'  // Slate
];

export const ProductionVisualCharts: React.FC<ProductionVisualChartsProps> = ({
  stageWiPList,
  metrics,
  logs,
  selectedBatch,
  batchSummaries = [],
  products = []
}) => {
  // Bộ lọc xem từng biểu đồ hoặc xem toàn bộ lưới
  const [activeFilter, setActiveFilter] = useState<'all' | 'stages' | 'pie' | 'timeline' | 'diff' | 'batches' | 'cluster' | 'rate' | 'products'>('all');

  const formatKg = (val: number) => {
    return val.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  // -------------------------------------------------------------
  // 1. BIỂU ĐỒ CỘT CÁC CÔNG ĐOẠN (IN / OUT / WIP)
  // -------------------------------------------------------------
  const barData = useMemo(() => {
    const active = stageWiPList.filter(s => s.inWeight > 0 || s.outWeight > 0 || s.wipWeight > 0);
    const list = active.length > 0 ? active : stageWiPList;

    return list.map(s => ({
      name: s.processId,
      fullName: s.processName,
      'Vào (IN)': Number(s.inWeight.toFixed(1)),
      'Ra (OUT)': Number(s.outWeight.toFixed(1)),
      'Đọng (WIP)': Number(s.wipWeight.toFixed(1))
    }));
  }, [stageWiPList]);

  // -------------------------------------------------------------
  // 2. BIỂU ĐỒ VÀNH KHUYÊN - CÂN BẰNG THÀNH PHẨM / TỒN / HAO HỤT
  // -------------------------------------------------------------
  const pieData = useMemo(() => {
    const totalIn = metrics.totalInWeight || 1;
    const out = metrics.totalOutWeight;
    const wip = metrics.wipWeight;
    const loss = Math.max(0, totalIn - out - wip);

    return [
      { name: 'Thành phẩm ra', value: Number(out.toFixed(1)), color: '#059669' },
      { name: 'Đang đọng (WIP)', value: Number(wip.toFixed(1)), color: '#D97706' },
      { name: 'Hao hụt sơ chế', value: Number(loss.toFixed(1)), color: '#94A3B8' }
    ].filter(d => d.value > 0);
  }, [metrics]);

  // -------------------------------------------------------------
  // 3. BIỂU ĐỒ VÙNG - SẢN LƯỢNG THEO KHUNG GIỜ
  // -------------------------------------------------------------
  const timelineData = useMemo(() => {
    const hourlyMap: { [hour: string]: { inWeight: number; outWeight: number } } = {
      '07:00': { inWeight: 0, outWeight: 0 },
      '09:00': { inWeight: 0, outWeight: 0 },
      '11:00': { inWeight: 0, outWeight: 0 },
      '13:00': { inWeight: 0, outWeight: 0 },
      '15:00': { inWeight: 0, outWeight: 0 },
      '17:00': { inWeight: 0, outWeight: 0 },
      '19:00': { inWeight: 0, outWeight: 0 }
    };

    logs.forEach(log => {
      const net = log.net_weight ?? (log.value_weight - log.tare_weight);
      if (!log.time_action) return;
      const date = new Date(log.time_action);
      const h = date.getHours();

      let slot = '07:00';
      if (h >= 19) slot = '19:00';
      else if (h >= 17) slot = '17:00';
      else if (h >= 15) slot = '15:00';
      else if (h >= 13) slot = '13:00';
      else if (h >= 11) slot = '11:00';
      else if (h >= 9) slot = '09:00';
      else slot = '07:00';

      if (log.type_weight === 'IN') {
        hourlyMap[slot].inWeight += net;
      } else {
        hourlyMap[slot].outWeight += net;
      }
    });

    return Object.keys(hourlyMap).map(k => ({
      hour: k,
      'Sản lượng vào': Number(hourlyMap[k].inWeight.toFixed(1)),
      'Sản lượng ra': Number(hourlyMap[k].outWeight.toFixed(1))
    }));
  }, [logs]);

  // -------------------------------------------------------------
  // 4. BIỂU ĐỒ BIẾN THIÊN: TĂNG TRỌNG (+) & HAO HỤT (-)
  // -------------------------------------------------------------
  const diffData = useMemo(() => {
    return stageWiPList
      .filter(s => s.inWeight > 0 || s.outWeight > 0)
      .map(s => {
        const delta = Number((s.outWeight - s.inWeight).toFixed(1));
        return {
          name: s.processId,
          fullName: s.processName,
          diff: delta,
          gain: delta > 0 ? delta : 0,
          loss: delta < 0 ? Math.abs(delta) : 0,
          isGain: delta >= 0
        };
      });
  }, [stageWiPList]);

  // -------------------------------------------------------------
  // 5. BIỂU ĐỒ TIẾN ĐỘ THEO LÔ HÀNG
  // -------------------------------------------------------------
  const batchData = useMemo(() => {
    if (!batchSummaries || batchSummaries.length === 0) {
      return [{
        name: selectedBatch !== 'ALL' ? selectedBatch : 'Toàn xưởng',
        'Thành phẩm (OUT)': Number(metrics.totalOutWeight.toFixed(1)),
        'Đang làm (WIP)': Number(metrics.wipWeight.toFixed(1)),
        'Còn lại': Number(Math.max(0, (metrics.plannedWeight || 0) - metrics.totalInWeight).toFixed(1))
      }];
    }

    return batchSummaries.slice(0, 8).map(b => ({
      name: b.batchId,
      fullName: b.batchName,
      'Thành phẩm (OUT)': Number(b.outWeight.toFixed(1)),
      'Đang làm (WIP)': Number(b.wipWeight.toFixed(1)),
      'Còn lại': Number((b.remainingWeight || 0).toFixed(1))
    }));
  }, [batchSummaries, metrics, selectedBatch]);

  // -------------------------------------------------------------
  // 6. BIỂU ĐỒ RADAR 4 CỤM NHÀ MÁY
  // -------------------------------------------------------------
  const clusterData = useMemo(() => {
    const list = stageWiPList;
    const n = list.length;
    if (n === 0) {
      return [
        { subject: 'Tiếp nhận', 'Tải trọng (kg)': 0, fullMark: 100 },
        { subject: 'Sơ chế & Xử lý', 'Tải trọng (kg)': 0, fullMark: 100 },
        { subject: 'Chế biến nhiệt', 'Tải trọng (kg)': 0, fullMark: 100 },
        { subject: 'Cấp đông đóng gói', 'Tải trọng (kg)': 0, fullMark: 100 }
      ];
    }

    const q1 = Math.max(1, Math.ceil(n / 4));
    const q2 = Math.max(q1 + 1, Math.ceil((n * 2) / 4));
    const q3 = Math.max(q2 + 1, Math.ceil((n * 3) / 4));

    const clusters = [
      { cluster: 'C1: Tiếp nhận', items: list.slice(0, q1), weight: 0 },
      { cluster: 'C2: Phụ gia & Xử lý', items: list.slice(q1, q2), weight: 0 },
      { cluster: 'C3: Chế biến nhiệt', items: list.slice(q2, q3), weight: 0 },
      { cluster: 'C4: Cấp đông & Xuất', items: list.slice(q3), weight: 0 }
    ];

    clusters.forEach(cl => {
      cl.weight = cl.items.reduce((acc, st) => acc + st.inWeight + st.outWeight, 0);
    });

    const maxWeight = Math.max(...clusters.map(x => x.weight), 50);

    return clusters.map(c => ({
      subject: c.cluster,
      'Tải trọng (kg)': Number(c.weight.toFixed(1)),
      fullMark: maxWeight * 1.2
    }));
  }, [stageWiPList]);

  // -------------------------------------------------------------
  // 7. BIỂU ĐỒ TẦN SUẤT & SẢN LƯỢNG MỖI MẺ
  // -------------------------------------------------------------
  const rateData = useMemo(() => {
    const slots: { [hour: string]: { count: number; totalKg: number } } = {
      '07:00': { count: 0, totalKg: 0 },
      '09:00': { count: 0, totalKg: 0 },
      '11:00': { count: 0, totalKg: 0 },
      '13:00': { count: 0, totalKg: 0 },
      '15:00': { count: 0, totalKg: 0 },
      '17:00': { count: 0, totalKg: 0 },
      '19:00': { count: 0, totalKg: 0 }
    };

    logs.forEach(log => {
      const net = log.net_weight ?? (log.value_weight - log.tare_weight);
      if (!log.time_action) return;
      const h = new Date(log.time_action).getHours();

      let slot = '07:00';
      if (h >= 19) slot = '19:00';
      else if (h >= 17) slot = '17:00';
      else if (h >= 15) slot = '15:00';
      else if (h >= 13) slot = '13:00';
      else if (h >= 11) slot = '11:00';
      else if (h >= 9) slot = '09:00';
      else slot = '07:00';

      slots[slot].count += 1;
      slots[slot].totalKg += net;
    });

    return Object.keys(slots).map(k => {
      const count = slots[k].count;
      const avg = count > 0 ? Number((slots[k].totalKg / count).toFixed(1)) : 0;
      return {
        hour: k,
        'Số mẻ cân': count,
        'Kg / mẻ': avg
      };
    });
  }, [logs]);

  // -------------------------------------------------------------
  // 8. BIỂU ĐỒ CƠ CẤU THÀNH PHẨM CUỐI (CHỈ LẤY SẢN PHẨM CUỐI XUẤT XƯỞNG)
  // -------------------------------------------------------------
  const productShareData = useMemo(() => {
    // 1. Xác định tập hợp công đoạn thành phẩm cuối động
    const endStageIds = new Set(
      stageWiPList
        .filter(s => s.isEndStage || s.stageType === 'END_PRODUCT')
        .map(s => s.processId)
    );
    if (endStageIds.size === 0) {
      ['CD012', 'CD013', 'CD014', 'CD015'].forEach(id => endStageIds.add(id));
    }

    // 2. Xác định các sản phẩm được phân loại là thành phẩm (FINISHED)
    const finishedProductIds = new Set(
      products.filter(p => p.type === 'FINISHED').map(p => p.id)
    );

    // 3. Chỉ lọc các mẻ cân thành phẩm cuối:
    // Ưu tiên mẻ OUT xuất xưởng tại các công đoạn kết thúc hoặc mẻ của sản phẩm thành phẩm FINISHED
    let endLogs = logs.filter(log => {
      const isEnd = endStageIds.has(log.process_id) || finishedProductIds.has(log.product_id);
      return isEnd && log.type_weight === 'OUT';
    });

    // Nếu chưa phát sinh mẻ OUT xuất xưởng, lấy mẻ cân nhập vào các công đoạn cuối
    if (endLogs.length === 0) {
      endLogs = logs.filter(log => endStageIds.has(log.process_id) || finishedProductIds.has(log.product_id));
    }

    const pMap: { [pId: string]: number } = {};
    endLogs.forEach(log => {
      const p = log.product_id || 'SP-THANH-PHAM';
      const net = log.net_weight ?? (log.value_weight - log.tare_weight);
      pMap[p] = (pMap[p] || 0) + net;
    });

    const entries = Object.keys(pMap)
      .map(pId => {
        const prod = products.find(x => x.id === pId);
        return {
          name: prod ? prod.name : pId,
          code: pId,
          value: Number(pMap[pId].toFixed(1))
        };
      })
      .filter(x => x.value > 0)
      .sort((a, b) => b.value - a.value);

    return entries.slice(0, 8);
  }, [logs, products, stageWiPList]);

  // Tooltip Style chuẩn công nghiệp
  const customTooltipStyle = {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    borderRadius: '6px',
    border: 'none',
    fontSize: '11px',
    padding: '7px 10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.18)'
  };

  const show = (chartId: string) => activeFilter === 'all' || activeFilter === chartId;

  return (
    <div className="space-y-3">
      {/* THANH ĐIỀU HƯỚNG LỌC BIỂU ĐỒ */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-1.5 border-b border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1">
            Bộ xem:
          </span>
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Tất cả (8)
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('stages')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
              activeFilter === 'stages'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Công đoạn
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('pie')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
              activeFilter === 'pie'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Cân bằng
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('timeline')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
              activeFilter === 'timeline'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Theo giờ
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('diff')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
              activeFilter === 'diff'
                ? 'bg-amber-600 text-white shadow-xs font-bold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Tăng / Hao
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('batches')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
              activeFilter === 'batches'
                ? 'bg-slate-700 text-white shadow-xs font-bold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Tiến độ Lô
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('cluster')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
              activeFilter === 'cluster'
                ? 'bg-violet-600 text-white shadow-xs font-bold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            4 Phân xưởng
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('rate')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
              activeFilter === 'rate'
                ? 'bg-cyan-600 text-white shadow-xs font-bold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Năng suất
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('products')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
              activeFilter === 'products'
                ? 'bg-pink-600 text-white shadow-xs font-bold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Sản phẩm
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          Đơn vị: kg
        </span>
      </div>

      {/* LƯỚI TẤT CẢ BIỂU ĐỒ - GỌN GÀNG, KHÔNG CHỮ THỪA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">

        {/* ---------------- 1. CÔNG ĐOẠN (BAR CHART) ---------------- */}
        {show('stages') && (
          <div className={`bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs ${activeFilter === 'stages' ? 'lg:col-span-2' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <h3 className="text-xs font-bold text-slate-800">1. Khối lượng công đoạn</h3>
              </div>
              <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                {barData.length} bước
              </span>
            </div>

            <div className="w-full h-[270px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={customTooltipStyle}
                    formatter={(v: any, n: any) => [`${formatKg(Number(v))} kg`, n]}
                    labelFormatter={(label: any) => {
                      const f = stageWiPList.find(s => s.processId === label);
                      return `${label} • ${f?.processName || ''}`;
                    }}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '6px' }} />
                  <Bar dataKey="Vào (IN)" fill="#2563EB" radius={[3, 3, 0, 0]} maxBarSize={18} />
                  <Bar dataKey="Ra (OUT)" fill="#059669" radius={[3, 3, 0, 0]} maxBarSize={18} />
                  <Bar dataKey="Đọng (WIP)" fill="#D97706" radius={[3, 3, 0, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ---------------- 2. CÂN BẰNG TỔNG THỂ (DONUT) ---------------- */}
        {show('pie') && (
          <div className={`bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs ${activeFilter === 'pie' ? 'lg:col-span-2' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <h3 className="text-xs font-bold text-slate-800">2. Cân bằng vật chất</h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                Thu hồi: {metrics.yieldRate}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-2 h-[270px]">
              <div className="w-full h-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={88}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={customTooltipStyle}
                      formatter={(v: any) => [`${formatKg(Number(v))} kg`, 'Khối lượng']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold font-mono text-slate-900">{metrics.yieldRate}%</span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Thu hồi</span>
                </div>
              </div>

              {/* Chú giải súc tích */}
              <div className="flex flex-col gap-2 justify-center pr-2">
                {pieData.map(item => {
                  const total = metrics.totalInWeight || 1;
                  const pct = ((item.value / total) * 100).toFixed(1);
                  return (
                    <div key={item.name} className="flex items-center justify-between text-xs p-2 rounded bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-700 font-medium truncate">{item.name}</span>
                      </div>
                      <span className="font-mono text-slate-900 font-bold ml-2">
                        {formatKg(item.value)} kg <span className="text-slate-400 font-normal">({pct}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 3. THEO KHUNG GIỜ (AREA) ---------------- */}
        {show('timeline') && (
          <div className={`bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs ${activeFilter === 'timeline' ? 'lg:col-span-2' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                <h3 className="text-xs font-bold text-slate-800">3. Sản lượng theo giờ</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">07:00 - 19:00</span>
            </div>

            <div className="w-full h-[270px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="areaOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="hour" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={customTooltipStyle} formatter={(v: any, n: any) => [`${formatKg(Number(v))} kg`, n]} />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '6px' }} />
                  <Area type="monotone" dataKey="Sản lượng vào" stroke="#2563EB" strokeWidth={2} fill="url(#areaIn)" />
                  <Area type="monotone" dataKey="Sản lượng ra" stroke="#059669" strokeWidth={2} fill="url(#areaOut)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ---------------- 4. BIẾN THIÊN: TĂNG TRỌNG & HAO HỤT (DIVERGING BAR) ---------------- */}
        {show('diff') && (
          <div className={`bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs ${activeFilter === 'diff' ? 'lg:col-span-2' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                <h3 className="text-xs font-bold text-slate-800">4. Tăng trọng (+) & Hao hụt (-)</h3>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono">
                <span className="text-emerald-700 font-semibold">+ Tăng</span>
                <span>/</span>
                <span className="text-rose-600 font-semibold">- Hao</span>
              </div>
            </div>

            <div className="w-full h-[270px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diffData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <ReferenceLine y={0} stroke="#475569" strokeWidth={1} />
                  <Tooltip
                    contentStyle={customTooltipStyle}
                    formatter={(v: any) => [`${formatKg(Number(v))} kg`, 'Chênh lệch (OUT - IN)']}
                    labelFormatter={(label: any) => {
                      const f = stageWiPList.find(s => s.processId === label);
                      return `${label} • ${f?.processName || ''}`;
                    }}
                  />
                  <Bar dataKey="diff" maxBarSize={22} radius={[3, 3, 3, 3]}>
                    {diffData.map((entry, index) => (
                      <Cell
                        key={`diff-cell-${index}`}
                        fill={entry.diff >= 0 ? '#10B981' : '#F43F5E'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ---------------- 5. TIẾN ĐỘ THEO LÔ (HORIZONTAL STACKED BAR) ---------------- */}
        {show('batches') && (
          <div className={`bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs ${activeFilter === 'batches' ? 'lg:col-span-2' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-700" />
                <h3 className="text-xs font-bold text-slate-800">5. Tiến độ từng lô</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Xếp chồng (kg)</span>
            </div>

            <div className="w-full h-[270px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={batchData}
                  layout="vertical"
                  margin={{ top: 8, right: 8, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="2 2" stroke="#F1F5F9" horizontal={false} />
                  <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} width={70} />
                  <Tooltip contentStyle={customTooltipStyle} formatter={(v: any, n: any) => [`${formatKg(Number(v))} kg`, n]} />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '6px' }} />
                  <Bar dataKey="Thành phẩm (OUT)" stackId="a" fill="#059669" maxBarSize={16} />
                  <Bar dataKey="Đang làm (WIP)" stackId="a" fill="#D97706" maxBarSize={16} />
                  <Bar dataKey="Còn lại" stackId="a" fill="#CBD5E1" maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ---------------- 6. TẢI TRỌNG 4 PHÂN XƯỞNG (RADAR) ---------------- */}
        {show('cluster') && (
          <div className={`bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs ${activeFilter === 'cluster' ? 'lg:col-span-2' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-600" />
                <h3 className="text-xs font-bold text-slate-800">6. Tải trọng 4 phân xưởng</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Radar</span>
            </div>

            <div className="w-full h-[270px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={85} data={clusterData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11 }} />
                  <PolarRadiusAxis stroke="#94A3B8" fontSize={9} />
                  <Tooltip contentStyle={customTooltipStyle} formatter={(v: any) => [`${formatKg(Number(v))} kg`, 'Tải trọng']} />
                  <Radar name="Khối lượng" dataKey="Tải trọng (kg)" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.35} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ---------------- 7. NĂNG SUẤT & TẦN SUẤT CÂN (COMPOSED CHART) ---------------- */}
        {show('rate') && (
          <div className={`bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs ${activeFilter === 'rate' ? 'lg:col-span-2' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-600" />
                <h3 className="text-xs font-bold text-slate-800">7. Tần suất & Năng suất cân</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Mẻ & kg/mẻ</span>
            </div>

            <div className="w-full h-[270px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={rateData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="hour" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={customTooltipStyle} />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '6px' }} />
                  <Bar yAxisId="left" dataKey="Số mẻ cân" fill="#0891B2" radius={[3, 3, 0, 0]} maxBarSize={20} />
                  <Line yAxisId="right" type="monotone" dataKey="Kg / mẻ" stroke="#EA580C" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ---------------- 8. CƠ CẤU THÀNH PHẨM CUỐI (PIE / DONUT) ---------------- */}
        {show('products') && (
          <div className={`bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs ${activeFilter === 'products' ? 'lg:col-span-2' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-600" />
                <h3 className="text-xs font-bold text-slate-800">8. Cơ cấu thành phẩm cuối</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                Thành phẩm ({productShareData.length})
              </span>
            </div>

            {productShareData.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-2 h-[270px]">
                <div className="w-full h-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productShareData}
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {productShareData.map((_, index) => (
                          <Cell key={`pcell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={customTooltipStyle} formatter={(v: any) => [`${formatKg(Number(v))} kg`, 'Sản lượng']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Chú giải sản phẩm */}
                <div className="flex flex-col gap-1.5 justify-center pr-2 max-h-[240px] overflow-y-auto">
                  {productShareData.map((item, idx) => (
                    <div key={item.code} className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-slate-800 truncate font-medium">{item.name}</span>
                      </div>
                      <span className="font-mono text-slate-900 font-bold ml-2 shrink-0">
                        {formatKg(item.value)} kg
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[270px] text-slate-400 text-xs">
                <span>Chưa phát sinh mẻ cân thành phẩm xuất xưởng</span>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductionVisualCharts;