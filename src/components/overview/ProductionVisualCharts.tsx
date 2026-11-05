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
  Area
} from 'recharts';
import { StageWiPSummary, ProductionMetrics, ProductionWeightLog } from '../../types/log.types';

interface ProductionVisualChartsProps {
  stageWiPList: StageWiPSummary[];
  metrics: ProductionMetrics;
  logs: ProductionWeightLog[];
  selectedBatch: string;
}

export const ProductionVisualCharts: React.FC<ProductionVisualChartsProps> = ({
  stageWiPList,
  metrics,
  logs,
  selectedBatch
}) => {
  const [activeChart, setActiveChart] = useState<'stages' | 'pie' | 'timeline'>('stages');

  const formatKg = (val: number) => {
    return val.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  // 1. Dữ liệu Biểu đồ Cột theo từng công đoạn (chỉ lọc các công đoạn có phát sinh số liệu để biểu đồ thoáng đẹp)
  const barData = useMemo(() => {
    const active = stageWiPList.filter(s => s.inWeight > 0 || s.outWeight > 0 || s.wipWeight > 0);
    const list = active.length > 0 ? active : stageWiPList.slice(0, 8);

    return list.map(s => ({
      name: s.processId,
      fullName: s.processName,
      'Vào (IN)': Number(s.inWeight.toFixed(1)),
      'Ra (OUT)': Number(s.outWeight.toFixed(1)),
      'Đang đọng (WIP)': Number(s.wipWeight.toFixed(1))
    }));
  }, [stageWiPList]);

  // 2. Dữ liệu Biểu đồ Tròn (Donut Chart) - Phân bổ thành phẩm, đọng và hao hụt
  const pieData = useMemo(() => {
    const totalIn = metrics.totalInWeight || 1;
    const out = metrics.totalOutWeight;
    const wip = metrics.wipWeight;
    const loss = Math.max(0, totalIn - out - wip);

    return [
      { name: 'Thành phẩm ra', value: Number(out.toFixed(1)), color: '#0F172A' },      // Đen than slate-900
      { name: 'Đang đọng trên máy', value: Number(wip.toFixed(1)), color: '#F59E0B' },  // Vàng hổ phách amber-500
      { name: 'Hao hụt sơ chế vỏ', value: Number(loss.toFixed(1)), color: '#94A3B8' }  // Xám slate-400
    ].filter(d => d.value > 0);
  }, [metrics]);

  // 3. Dữ liệu Biểu đồ Vùng (Timeline Area Chart) - Sản lượng theo khung giờ trong ngày
  const timelineData = useMemo(() => {
    const hourlyMap: { [hour: string]: { inWeight: number; outWeight: number } } = {
      '07:00': { inWeight: 0, outWeight: 0 },
      '09:00': { inWeight: 0, outWeight: 0 },
      '11:00': { inWeight: 0, outWeight: 0 },
      '13:00': { inWeight: 0, outWeight: 0 },
      '15:00': { inWeight: 0, outWeight: 0 },
      '17:00': { inWeight: 0, outWeight: 0 }
    };

    logs.forEach(log => {
      const net = log.net_weight ?? (log.value_weight - log.tare_weight);
      if (!log.time_action) return;
      const date = new Date(log.time_action);
      const h = date.getHours();

      let slot = '07:00';
      if (h >= 17) slot = '17:00';
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

  return (
    <div className="bg-white border border-slate-200/90 rounded-lg p-4 shadow-2xs mb-5">
      {/* THANH ĐIỀU KHIỂN CHUYỂN ĐỔI CÁC LOẠI BIỂU ĐỒ */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C53030]" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Biểu Đồ Trực Quan Dữ Liệu {selectedBatch !== 'ALL' ? `(Lô ${selectedBatch})` : '(Toàn Xưởng)'}
          </h2>
        </div>

        {/* Segmented Control chọn dạng biểu đồ */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveChart('stages')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeChart === 'stages'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📊 Biểu đồ cột công đoạn
          </button>
          <button
            type="button"
            onClick={() => setActiveChart('pie')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeChart === 'pie'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🍩 Biểu đồ tròn phân bổ
          </button>
          <button
            type="button"
            onClick={() => setActiveChart('timeline')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeChart === 'timeline'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📈 Xu hướng theo giờ
          </button>
        </div>
      </div>

      {/* 1. BIỂU ĐỒ HÌNH CỘT (BAR CHART) - SO SÁNH VÀO / RA / ĐỌNG THEO CÔNG ĐOẠN */}
      {activeChart === 'stages' && (
        <div>
          <div className="text-xs text-slate-500 mb-2 flex items-center justify-between">
            <span>So sánh trực quan khối lượng <strong>Vào (IN)</strong>, <strong>Ra (OUT)</strong> và <strong>Đọng (WIP)</strong> tại từng công đoạn:</span>
            <span className="font-mono text-slate-400 text-[11px]">Đơn vị: kg</span>
          </div>

          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(value: any, name: any) => [`${formatKg(Number(value))} kg`, name]}
                  labelFormatter={(label: any) => {
                    const found = stageWiPList.find(s => s.processId === label);
                    return `${label} - ${found?.processName || ''}`;
                  }}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                />
                <Bar dataKey="Vào (IN)" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="Ra (OUT)" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="Đang đọng (WIP)" fill="#D97706" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 2. BIỂU ĐỒ TRÒN (DONUT CHART) - TỶ LỆ PHÂN BỔ THÀNH PHẨM, TỒN & HAO HỤT */}
      {activeChart === 'pie' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="w-full h-[280px] relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${formatKg(Number(value))} kg`, 'Khối lượng']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Số % trung tâm */}
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Tỷ lệ thu hồi</span>
              <span className="text-2xl font-bold font-mono text-slate-900">{metrics.yieldRate}%</span>
              <span className="text-[10px] text-slate-500 font-mono">Thành phẩm</span>
            </div>
          </div>

          {/* Bảng chú giải số liệu tròn */}
          <div className="flex flex-col gap-3 pr-4">
            <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-1.5">
              Phân bổ 100% Nguyên Liệu Vào Xưởng:
            </h4>

            <div className="flex flex-col gap-2">
              {pieData.map(item => {
                const total = metrics.totalInWeight || 1;
                const percent = ((item.value / total) * 100).toFixed(1);

                return (
                  <div key={item.name} className="flex items-center justify-between text-xs p-2 rounded-md bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-700 font-medium">{item.name}</span>
                    </div>
                    <div className="font-mono text-right">
                      <strong className="text-slate-900">{formatKg(item.value)} kg</strong>
                      <span className="text-slate-400 text-[11px] ml-1.5">({percent}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. BIỂU ĐỒ VÙNG (AREA CHART) - SẢN LƯỢNG THEO KHUNG GIỜ */}
      {activeChart === 'timeline' && (
        <div>
          <div className="text-xs text-slate-500 mb-2 flex items-center justify-between">
            <span>Nhịp độ cân sản xuất thực tế theo các khung giờ làm việc trong ngày:</span>
            <span className="font-mono text-slate-400 text-[11px]">Đơn vị: kg</span>
          </div>

          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(value: any, name: any) => [`${formatKg(Number(value))} kg`, name]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                />
                <Area
                  type="monotone"
                  dataKey="Sản lượng vào"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIn)"
                />
                <Area
                  type="monotone"
                  dataKey="Sản lượng ra"
                  stroke="#059669"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorOut)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionVisualCharts;
