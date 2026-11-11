import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  ComposedChart,
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
  onSelectBatch?: (batchId: string) => void;
}

// Bảng màu giao diện chuẩn phong cách cũ
const BATCH_COLORS = [
  '#2563EB', // Blue
  '#059669', // Emerald
  '#D97706', // Amber
  '#7C3AED', // Violet
  '#DB2777', // Pink
  '#0891B2', // Cyan
  '#EA580C', // Orange
  '#4F46E5', // Indigo
  '#64748B'  // Slate
];

const PRODUCT_COLORS = [
  '#0284C7', // Sky
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#94A3B8'  // Slate
];

// Nút biểu tượng Zoom ở góc phải từng biểu đồ
const ZoomIconButton: React.FC<{
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ isExpanded, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`p-1.5 rounded transition-all cursor-pointer ${
      isExpanded
        ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200'
        : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
    }`}
    title={isExpanded ? 'Thu nhỏ biểu đồ' : 'Phóng to biểu đồ'}
  >
    {isExpanded ? (
      /* Biểu tượng thu nhỏ (mũi tên hướng vào tâm) */
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
      </svg>
    ) : (
      /* Biểu tượng phóng to (mũi tên hướng ra 4 góc) */
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
      </svg>
    )}
  </button>
);

// Hàm lấy định mức chuẩn % theo từng công đoạn kỹ thuật chế biến tôm
const getStandardNormRate = (stageId: string, stageName?: string): number => {
  const id = stageId.toUpperCase();
  const name = (stageName || '').toLowerCase();
  if (id === 'CD004' || name.includes('bóc vỏ') || name.includes('rút chỉ') || name.includes('peel')) return 60; // Bóc vỏ hao hụt ~40%
  if (id === 'CD005' || name.includes('ngâm') || name.includes('phụ gia') || name.includes('soak')) return 105; // Ngâm quay tăng trọng +5%
  if (id === 'CD007' || name.includes('tẩm bột') || name.includes('bread')) return 120; // Tẩm bột tăng trọng +20%
  if (id === 'CD009' || id === 'CD010' || name.includes('luộc') || name.includes('hấp') || name.includes('cook')) return 88; // Luộc hao hụt nước ~12%
  if (id === 'CD011' || name.includes('tách vỏ')) return 70; // Tách vỏ sau luộc
  return 100; // Bảo toàn mặc định
};

type ChartKey = 'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6';

export const ProductionVisualCharts: React.FC<ProductionVisualChartsProps> = ({
  stageWiPList,
  metrics,
  logs,
  selectedBatch,
  batchSummaries = [],
  products = [],
  onSelectBatch
}) => {
  const isOverallMode = selectedBatch === 'ALL';

  // Trạng thái biểu đồ đang phóng to (null: hiển thị tất cả; 'c1'..'c6': đóng các biểu đồ khác lại và mở rộng riêng biểu đồ đó)
  const [focusedChart, setFocusedChart] = useState<ChartKey | null>(null);

  const formatKg = (val: number) => {
    return val.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  const customTooltipStyle = {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#F8FAFC',
    fontSize: '11px',
    padding: '7px 10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
  };

  // =============================================================
  // DỮ LIỆU BIỂU ĐỒ TỔNG QUÁT (5 & 6)
  // =============================================================
  const chart5Data = useMemo(() => {
    if (!batchSummaries || batchSummaries.length === 0) {
      return [{
        batchId: 'NONE',
        name: 'Chưa có lô',
        fullName: 'Chưa có dữ liệu lô',
        INPUT: metrics.totalInWeight,
        OUTPUT: metrics.totalOutWeight,
        WIP: metrics.wipWeight
      }];
    }

    return batchSummaries.map(b => ({
      batchId: b.batchId,
      name: b.batchId,
      fullName: b.batchName || `Lô ${b.batchId}`,
      INPUT: Number(b.inWeight.toFixed(1)),
      OUTPUT: Number(b.outWeight.toFixed(1)),
      WIP: Number(b.wipWeight.toFixed(1)),
      planned: b.plannedWeight
    }));
  }, [batchSummaries, metrics]);

  const chart6Data = useMemo(() => {
    if (!batchSummaries || batchSummaries.length === 0) {
      return [{
        name: 'Toàn xưởng',
        batchId: 'ALL',
        value: metrics.totalInWeight > 0 ? metrics.totalInWeight : 1
      }];
    }

    const items = batchSummaries
      .map(b => ({
        batchId: b.batchId,
        name: b.batchId,
        fullName: b.batchName || `Lô ${b.batchId}`,
        value: Number((b.inWeight > 0 ? b.inWeight : (b.outWeight > 0 ? b.outWeight : b.plannedWeight || 0)).toFixed(1))
      }))
      .filter(item => item.value > 0);

    return items.length > 0 ? items : [{ name: 'Chưa có mẻ', batchId: 'NONE', value: 1 }];
  }, [batchSummaries, metrics]);

  const totalBatchKg = useMemo(() => {
    return chart6Data.reduce((acc, cur) => acc + cur.value, 0);
  }, [chart6Data]);

  // =============================================================
  // DỮ LIỆU BIỂU ĐỒ CỦA TỪNG LÔ (1, 2, 3, 4)
  // =============================================================
  const chart1Data = useMemo(() => {
    const active = stageWiPList.filter(s => s.inWeight > 0 || s.outWeight > 0 || s.wipWeight > 0);
    const list = active.length > 0 ? active : stageWiPList;

    return list.map(s => ({
      name: s.processId,
      fullName: s.processName,
      Input: Number(s.inWeight.toFixed(1)),
      Output: Number(s.outWeight.toFixed(1)),
      WIP: Number(s.wipWeight.toFixed(1))
    }));
  }, [stageWiPList]);

  const chart2Data = useMemo(() => {
    const active = stageWiPList.filter(s => s.inWeight > 0 || s.outWeight > 0);
    const list = active.length > 0 ? active : stageWiPList;

    return list.map(s => {
      const actualYield = s.inWeight > 0 ? Number(((s.outWeight / s.inWeight) * 100).toFixed(1)) : 0;
      const standardRate = getStandardNormRate(s.processId, s.processName);

      return {
        name: s.processId,
        fullName: s.processName,
        'Thực tế (%)': actualYield,
        'Định mức chuẩn (%)': standardRate,
        inW: s.inWeight,
        outW: s.outWeight
      };
    });
  }, [stageWiPList]);

  const chart3Data = useMemo(() => {
    const outLogs = logs.filter(l => l.type_weight === 'OUT');
    const targetLogs = outLogs.length > 0 ? outLogs : logs;

    const pMap: { [pId: string]: number } = {};
    targetLogs.forEach(log => {
      const p = log.product_id || 'SP-KHAC';
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

    if (entries.length <= 4) {
      return entries;
    }

    const top4 = entries.slice(0, 4);
    const rest = entries.slice(4);
    const restTotal = Number(rest.reduce((acc, cur) => acc + cur.value, 0).toFixed(1));

    return [
      ...top4,
      {
        name: 'SP5 (Các SP còn lại)',
        code: 'SP-REST',
        value: restTotal
      }
    ];
  }, [logs, products]);

  const totalProductKg = useMemo(() => {
    return chart3Data.reduce((acc, cur) => acc + cur.value, 0);
  }, [chart3Data]);

  const chart4Data = useMemo(() => {
    const active = stageWiPList.filter(s => s.inWeight > 0 || s.outWeight > 0);
    const list = active.length > 0 ? active : stageWiPList;

    return list.map(s => {
      const goodKg = Number(s.outWeight.toFixed(1));
      const wasteKg = Number(Math.max(0, s.inWeight - s.outWeight).toFixed(1));

      return {
        name: s.processId,
        fullName: s.processName,
        'Hàng đạt': goodKg,
        'Hàng thải / Phế phẩm': wasteKg,
        total: Number((goodKg + wasteKg).toFixed(1))
      };
    });
  }, [stageWiPList]);

  // Kiểm tra một biểu đồ có được hiển thị không
  const isVisible = (key: ChartKey) => {
    return focusedChart === null || focusedChart === key;
  };

  // =============================================================
  // RENDER COMPONENT BIỂU ĐỒ 1: CỘT THEO CÔNG ĐOẠN
  // =============================================================
  const renderChart1Card = () => {
    const isExpanded = focusedChart === 'c1';

    return (
      <div className={`bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs transition-all ${
        isExpanded ? 'col-span-full' : ''
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <h3 className="text-xs font-bold text-slate-900">
              1) Biểu đồ cột (theo từng công đoạn)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400">
              X: Công đoạn • Y: kg
            </span>
            <ZoomIconButton
              isExpanded={isExpanded}
              onToggle={() => setFocusedChart(isExpanded ? null : 'c1')}
            />
          </div>
        </div>

        <div className={`w-full ${isExpanded ? 'h-[400px]' : 'h-[260px]'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart1Data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" stroke="#64748B" fontSize={isExpanded ? 12 : 11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={isExpanded ? 12 : 11} tickLine={false} />
              <Tooltip
                contentStyle={customTooltipStyle}
                formatter={(v: any, n: any) => [`${formatKg(Number(v))} kg`, n]}
                labelFormatter={(label: any) => {
                  const f = stageWiPList.find(s => s.processId === label);
                  return `${label} • ${f?.processName || ''}`;
                }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '6px' }} />
              <Bar dataKey="Input" fill="#2563EB" radius={[2, 2, 0, 0]} maxBarSize={isExpanded ? 32 : 16} />
              <Bar dataKey="Output" fill="#059669" radius={[2, 2, 0, 0]} maxBarSize={isExpanded ? 32 : 16} />
              <Bar dataKey="WIP" fill="#D97706" radius={[2, 2, 0, 0]} maxBarSize={isExpanded ? 32 : 16} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-slate-100 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="py-1">Mã CĐ</th>
                  <th className="py-1">Tên công đoạn</th>
                  <th className="py-1 text-right text-blue-600">Vào (Input)</th>
                  <th className="py-1 text-right text-emerald-600">Ra (Output)</th>
                  <th className="py-1 text-right text-amber-600">Tồn đọng (WIP)</th>
                </tr>
              </thead>
              <tbody>
                {chart1Data.map(item => (
                  <tr key={item.name} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-1.5 font-mono font-bold text-slate-800">{item.name}</td>
                    <td className="py-1.5 text-slate-600">{item.fullName}</td>
                    <td className="py-1.5 text-right font-mono font-medium text-blue-700">{formatKg(item.Input)} kg</td>
                    <td className="py-1.5 text-right font-mono font-medium text-emerald-700">{formatKg(item.Output)} kg</td>
                    <td className="py-1.5 text-right font-mono font-medium text-amber-700">{formatKg(item.WIP)} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // =============================================================
  // RENDER COMPONENT BIỂU ĐỒ 2: TỶ LỆ THÀNH PHẨM HAO HỤT
  // =============================================================
  const renderChart2Card = () => {
    const isExpanded = focusedChart === 'c2';

    return (
      <div className={`bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs transition-all ${
        isExpanded ? 'col-span-full' : ''
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            <h3 className="text-xs font-bold text-slate-900">
              2) Tỷ lệ thành phẩm hao hụt
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-[10px] font-mono mr-1">
              <span className="text-blue-600 font-semibold">■ Thực tế</span>
              <span className="text-rose-600 font-semibold">— Định mức</span>
            </div>
            <ZoomIconButton
              isExpanded={isExpanded}
              onToggle={() => setFocusedChart(isExpanded ? null : 'c2')}
            />
          </div>
        </div>

        <div className={`w-full ${isExpanded ? 'h-[400px]' : 'h-[260px]'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chart2Data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" stroke="#64748B" fontSize={isExpanded ? 12 : 11} tickLine={false} />
              <YAxis
                stroke="#64748B"
                fontSize={isExpanded ? 12 : 11}
                tickLine={false}
                domain={[0, 140]}
                ticks={[0, 40, 60, 80, 100, 120, 140]}
              />
              <ReferenceLine y={100} stroke="#94A3B8" strokeDasharray="3 3" />
              <Tooltip
                contentStyle={customTooltipStyle}
                formatter={(v: any, n: any) => [`${Number(v)}%`, n]}
                labelFormatter={(label: any) => {
                  const f = stageWiPList.find(s => s.processId === label);
                  return `${label} • ${f?.processName || ''}`;
                }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '6px' }} />
              <Bar dataKey="Thực tế (%)" fill="#3B82F6" radius={[3, 3, 0, 0]} maxBarSize={isExpanded ? 34 : 22} />
              <Line
                type="monotone"
                dataKey="Định mức chuẩn (%)"
                stroke="#E11D48"
                strokeWidth={isExpanded ? 3 : 2.5}
                dot={{ r: isExpanded ? 5 : 4, fill: '#E11D48', strokeWidth: 1, stroke: '#FFFFFF' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-slate-100 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="py-1">Công đoạn</th>
                  <th className="py-1 text-right">Khối lượng Vào</th>
                  <th className="py-1 text-right">Khối lượng Ra</th>
                  <th className="py-1 text-right text-blue-600 font-bold">Thực tế (%)</th>
                  <th className="py-1 text-right text-rose-600 font-bold">Định mức (%)</th>
                  <th className="py-1 text-right">Đánh giá chênh lệch</th>
                </tr>
              </thead>
              <tbody>
                {chart2Data.map(item => {
                  const diff = Number((item['Thực tế (%)'] - item['Định mức chuẩn (%)']).toFixed(1));
                  return (
                    <tr key={item.name} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-1.5 font-medium text-slate-800">{item.name} - {item.fullName}</td>
                      <td className="py-1.5 text-right font-mono text-slate-600">{formatKg(item.inW)} kg</td>
                      <td className="py-1.5 text-right font-mono text-slate-600">{formatKg(item.outW)} kg</td>
                      <td className="py-1.5 text-right font-mono font-bold text-blue-600">{item['Thực tế (%)']}%</td>
                      <td className="py-1.5 text-right font-mono font-bold text-rose-600">{item['Định mức chuẩn (%)']}%</td>
                      <td className="py-1.5 text-right font-mono font-semibold">
                        {diff >= 0 ? (
                          <span className="text-emerald-600">+{diff}% (Đạt chuẩn)</span>
                        ) : (
                          <span className="text-rose-600">{diff}% (Vượt hao hụt)</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // =============================================================
  // RENDER COMPONENT BIỂU ĐỒ 3: CƠ CẤU SẢN PHẨM ĐẦU RA (DONUT)
  // =============================================================
  const renderChart3Card = () => {
    const isExpanded = focusedChart === 'c3';

    return (
      <div className={`bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs transition-all ${
        isExpanded ? 'col-span-full' : ''
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900">
              3) Cơ cấu sản phẩm đầu ra (khối lượng)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
              Đầu ra Lô {selectedBatch}
            </span>
            <ZoomIconButton
              isExpanded={isExpanded}
              onToggle={() => setFocusedChart(isExpanded ? null : 'c3')}
            />
          </div>
        </div>

        <div className={`grid grid-cols-1 ${isExpanded ? 'md:grid-cols-2 h-[380px]' : 'sm:grid-cols-2 h-[260px]'} items-center gap-3`}>
          <div className="w-full h-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chart3Data}
                  cx="50%"
                  cy="50%"
                  innerRadius={isExpanded ? 75 : 55}
                  outerRadius={isExpanded ? 125 : 85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chart3Data.map((_, index) => (
                    <Cell key={`cell-p-${index}`} fill={PRODUCT_COLORS[index % PRODUCT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={customTooltipStyle}
                  formatter={(v: any) => [`${formatKg(Number(v))} kg`, 'Khối lượng']}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center px-1">
              <span className="text-[9px] text-slate-400 uppercase font-semibold tracking-wider">
                Tổng khối lượng SP
              </span>
              <span className={`${isExpanded ? 'text-xl' : 'text-base'} font-bold font-mono text-slate-900`}>
                {formatKg(totalProductKg)}
              </span>
              <span className="text-[9px] text-slate-400">kg</span>
            </div>
          </div>

          <div className={`flex flex-col gap-1.5 justify-center pr-2 ${isExpanded ? 'max-h-[340px]' : 'max-h-[250px]'} overflow-y-auto`}>
            {chart3Data.map((item, idx) => {
              const pct = totalProductKg > 0 ? ((item.value / totalProductKg) * 100).toFixed(1) : '0';
              return (
                <div key={item.code} className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: PRODUCT_COLORS[idx % PRODUCT_COLORS.length] }}
                    />
                    <span className="text-slate-800 font-medium truncate">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-mono text-slate-900 font-bold ml-2 shrink-0">
                    {formatKg(item.value)} kg <span className="text-slate-400 font-normal text-[10px]">({pct}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // =============================================================
  // RENDER COMPONENT BIỂU ĐỒ 4: BIỂU ĐỒ STACKED COLUMN
  // =============================================================
  const renderChart4Card = () => {
    const isExpanded = focusedChart === 'c4';

    return (
      <div className={`bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs transition-all ${
        isExpanded ? 'col-span-full' : ''
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
            <h3 className="text-xs font-bold text-slate-900">
              4) Biểu đồ stacked column (kg)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400">
              Đạt chuẩn vs Hàng thải / Phế phẩm
            </span>
            <ZoomIconButton
              isExpanded={isExpanded}
              onToggle={() => setFocusedChart(isExpanded ? null : 'c4')}
            />
          </div>
        </div>

        <div className={`w-full ${isExpanded ? 'h-[400px]' : 'h-[260px]'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart4Data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" stroke="#64748B" fontSize={isExpanded ? 12 : 11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={isExpanded ? 12 : 11} tickLine={false} />
              <Tooltip
                contentStyle={customTooltipStyle}
                formatter={(v: any, n: any) => [`${formatKg(Number(v))} kg`, n]}
                labelFormatter={(label: any) => {
                  const f = stageWiPList.find(s => s.processId === label);
                  return `${label} • ${f?.processName || ''}`;
                }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '6px' }} />
              <Bar dataKey="Hàng đạt" stackId="mass" fill="#059669" radius={[0, 0, 0, 0]} maxBarSize={isExpanded ? 34 : 22} />
              <Bar dataKey="Hàng thải / Phế phẩm" stackId="mass" fill="#94A3B8" radius={[3, 3, 0, 0]} maxBarSize={isExpanded ? 34 : 22} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-slate-100 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="py-1">Công đoạn</th>
                  <th className="py-1 text-right text-emerald-600">Hàng đạt chuẩn (kg)</th>
                  <th className="py-1 text-right text-slate-500">Phế phẩm / Hao hụt (kg)</th>
                  <th className="py-1 text-right text-slate-900 font-bold">Tổng (kg)</th>
                  <th className="py-1 text-right">Tỷ lệ đạt</th>
                </tr>
              </thead>
              <tbody>
                {chart4Data.map(item => {
                  const rate = item.total > 0 ? ((item['Hàng đạt'] / item.total) * 100).toFixed(1) : '0';
                  return (
                    <tr key={item.name} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-1.5 font-medium text-slate-800">{item.name} - {item.fullName}</td>
                      <td className="py-1.5 text-right font-mono font-medium text-emerald-700">{formatKg(item['Hàng đạt'])} kg</td>
                      <td className="py-1.5 text-right font-mono text-slate-500">{formatKg(item['Hàng thải / Phế phẩm'])} kg</td>
                      <td className="py-1.5 text-right font-mono font-bold text-slate-900">{formatKg(item.total)} kg</td>
                      <td className="py-1.5 text-right font-mono font-semibold text-emerald-600">{rate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // =============================================================
  // RENDER COMPONENT BIỂU ĐỒ 5: TIẾN ĐỘ TỪNG LÔ
  // =============================================================
  const renderChart5Card = () => {
    const isExpanded = focusedChart === 'c5';

    return (
      <div className={`bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs transition-all ${
        isExpanded ? 'col-span-full' : ''
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <h3 className="text-xs font-bold text-slate-900">
              5) Tiến độ từng lô
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400">
              X: Khối lượng (kg) • Y: Batch
            </span>
            <ZoomIconButton
              isExpanded={isExpanded}
              onToggle={() => setFocusedChart(isExpanded ? null : 'c5')}
            />
          </div>
        </div>

        <div className={`w-full ${isExpanded ? 'h-[400px]' : 'h-[280px]'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chart5Data}
              layout="vertical"
              margin={{ top: 8, right: 12, left: 15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="2 2" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" stroke="#64748B" fontSize={isExpanded ? 12 : 11} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#64748B"
                fontSize={isExpanded ? 12 : 11}
                tickLine={false}
                width={75}
              />
              <Tooltip
                contentStyle={customTooltipStyle}
                formatter={(v: any, n: any) => [`${formatKg(Number(v))} kg`, n]}
                labelFormatter={(label: any) => {
                  const item = chart5Data.find(x => x.name === label);
                  return `${label} • ${item?.fullName || ''}`;
                }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '6px' }} />
              <Bar dataKey="INPUT" stackId="batch" fill="#2563EB" maxBarSize={isExpanded ? 24 : 18} />
              <Bar dataKey="OUTPUT" stackId="batch" fill="#059669" maxBarSize={isExpanded ? 24 : 18} />
              <Bar dataKey="WIP" stackId="batch" fill="#D97706" maxBarSize={isExpanded ? 24 : 18} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Hướng dẫn chọn lô */}
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>💡 Bấm chọn lô để xem chi tiết 4 biểu đồ:</span>
          <div className="flex items-center gap-1">
            {chart5Data.filter(b => b.batchId !== 'NONE').slice(0, 5).map(b => (
              <button
                key={b.batchId}
                type="button"
                onClick={() => onSelectBatch && onSelectBatch(b.batchId)}
                className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-mono text-[10px] font-semibold cursor-pointer border border-blue-200/60"
              >
                {b.name} →
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // =============================================================
  // RENDER COMPONENT BIỂU ĐỒ 6: TỔNG QUAN CÁC BATCH (PIE)
  // =============================================================
  const renderChart6Card = () => {
    const isExpanded = focusedChart === 'c6';

    return (
      <div className={`bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs transition-all ${
        isExpanded ? 'col-span-full' : ''
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900">
              6) Tổng quan các batch
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
              {chart6Data.length} lô sản xuất
            </span>
            <ZoomIconButton
              isExpanded={isExpanded}
              onToggle={() => setFocusedChart(isExpanded ? null : 'c6')}
            />
          </div>
        </div>

        <div className={`grid grid-cols-1 ${isExpanded ? 'md:grid-cols-2 h-[380px]' : 'sm:grid-cols-2 h-[280px]'} items-center gap-2`}>
          <div className="w-full h-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chart6Data}
                  cx="50%"
                  cy="50%"
                  outerRadius={isExpanded ? 130 : 95}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {chart6Data.map((_, index) => (
                    <Cell key={`cell-b-${index}`} fill={BATCH_COLORS[index % BATCH_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={customTooltipStyle}
                  formatter={(v: any) => [`${formatKg(Number(v))} kg`, 'Sản lượng']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className={`flex flex-col gap-1.5 justify-center pr-2 ${isExpanded ? 'max-h-[340px]' : 'max-h-[270px]'} overflow-y-auto`}>
            {chart6Data.map((item, idx) => {
              const pct = totalBatchKg > 0 ? ((item.value / totalBatchKg) * 100).toFixed(1) : '0';
              return (
                <div
                  key={item.batchId}
                  onClick={() => onSelectBatch && item.batchId !== 'NONE' && item.batchId !== 'ALL' && onSelectBatch(item.batchId)}
                  className={`flex items-center justify-between text-xs p-1.5 rounded bg-slate-50 border border-slate-100 transition-colors ${
                    item.batchId !== 'NONE' && item.batchId !== 'ALL' ? 'hover:bg-blue-50 cursor-pointer' : ''
                  }`}
                  title="Bấm để xem 4 biểu đồ chi tiết của lô này"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: BATCH_COLORS[idx % BATCH_COLORS.length] }}
                    />
                    <span className="text-slate-800 font-semibold truncate font-mono">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right ml-2 shrink-0">
                    <span className="font-mono text-slate-900 font-bold">
                      {formatKg(item.value)} kg
                    </span>
                    <span className="text-slate-400 text-[10px] ml-1">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Tổng khối lượng toàn xưởng:</span>
          <strong className="text-slate-900">{formatKg(totalBatchKg)} kg</strong>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Nút thu nhỏ khi đang có biểu đồ phóng to */}
      {focusedChart !== null && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setFocusedChart(null)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer transition-colors"
          >
            <span>⤓ Thu nhỏ (Hiện tất cả biểu đồ)</span>
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* KHU VỰC 1: PHẦN TỔNG QUÁT (BIỂU ĐỒ 5 & 6)                */}
      {/* ========================================================= */}
      {isOverallMode && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {isVisible('c5') && renderChart5Card()}
          {isVisible('c6') && renderChart6Card()}
        </div>
      )}

      {/* ========================================================= */}
      {/* KHU VỰC 2: CỦA TỪNG LÔ (BIỂU ĐỒ 1, 2, 3, 4)               */}
      {/* ========================================================= */}
      {!isOverallMode && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {isVisible('c1') && renderChart1Card()}
          {isVisible('c2') && renderChart2Card()}
          {isVisible('c3') && renderChart3Card()}
          {isVisible('c4') && renderChart4Card()}
        </div>
      )}
    </div>
  );
};

export default ProductionVisualCharts;
