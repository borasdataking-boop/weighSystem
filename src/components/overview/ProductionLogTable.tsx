import React, { useState } from 'react';
import { ProductionWeightLog, WeightIOType } from '../../types/log.types';
import { ProcessStage } from '../../types/process.types';
import { StationWeigh } from '../../types/station.types';
import { ProductItem } from '../../types/product.types';

interface ProductionLogTableProps {
  logs: ProductionWeightLog[];
  stages: ProcessStage[];
  stations: StationWeigh[];
  products: ProductItem[];
  selectedBatch: string;
  onSelectBatch: (batchId: string) => void;
  onDeleteLog?: (logId: number) => void;
}

export const ProductionLogTable: React.FC<ProductionLogTableProps> = ({
  logs,
  stages,
  stations,
  products,
  selectedBatch,
  onSelectBatch,
  onDeleteLog
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedProcess, setSelectedProcess] = useState('ALL');
  const [selectedIO, setSelectedIO] = useState<'ALL' | WeightIOType>('ALL');

  // Tra cứu thông tin tên hiển thị
  const stageMap = new Map(stages.map(s => [s.processId || s.id, s.processName || s.name]));
  const stationMap = new Map(stations.map(s => [s.stationId || s.id, s.stationName || s.name]));
  const productMap = new Map(products.map(p => [p.id, p.name]));

  // Lọc logs
  const filteredLogs = logs.filter(log => {
    if (selectedBatch !== 'ALL' && log.batch_id !== selectedBatch) return false;
    if (selectedProcess !== 'ALL' && log.process_id !== selectedProcess) return false;
    if (selectedIO !== 'ALL' && log.type_weight !== selectedIO) return false;

    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      const match =
        String(log.log_id).includes(kw) ||
        log.batch_id.toLowerCase().includes(kw) ||
        log.station_id.toLowerCase().includes(kw) ||
        log.process_id.toLowerCase().includes(kw) ||
        log.product_id.toLowerCase().includes(kw) ||
        (log.employee_id || '').toLowerCase().includes(kw) ||
        (log.source_method || '').toLowerCase().includes(kw);
      if (!match) return false;
    }

    return true;
  });

  const uniqueBatches = Array.from(new Set(logs.map(l => l.batch_id))).filter(Boolean);

  const resetFilters = () => {
    setSearchKeyword('');
    setSelectedProcess('ALL');
    setSelectedIO('ALL');
    onSelectBatch('ALL');
  };

  const formatDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
      {/* Header bảng & Công cụ lọc */}
      <div className="p-4 border-b border-slate-200 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DE4444]" />
            <h3 className="text-sm font-bold text-slate-900">
              Nhật Ký Cân
            </h3>
          </div>
        </div>

        {/* Thanh tìm kiếm & Dropdown lọc */}
        <div className="flex items-center gap-2.5 flex-wrap pt-1">
          {/* Tìm kiếm từ khóa */}
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              placeholder="Tìm theo mã lô, trạm, mã SP, nhân viên..."
              className="w-full h-9 pl-9 pr-3 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#DE4444] bg-white"
            />
          </div>

          {/* Lọc theo Lô hàng (batch_id) */}
          <select
            value={selectedBatch}
            onChange={e => onSelectBatch(e.target.value)}
            className="h-9 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:border-[#DE4444] cursor-pointer"
          >
            <option value="ALL">Tất cả các Lô</option>
            {uniqueBatches.map(b => (
              <option key={b} value={b}>Lô: {b}</option>
            ))}
          </select>

          {/* Lọc theo Công đoạn (process_id) */}
          <select
            value={selectedProcess}
            onChange={e => setSelectedProcess(e.target.value)}
            className="h-9 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:border-[#DE4444] cursor-pointer"
          >
            <option value="ALL">Tất cả công đoạn</option>
            {stages.map(st => {
              const sId = st.processId || st.id || '';
              return (
                <option key={sId} value={sId}>[{sId}] {st.processName || st.name}</option>
              );
            })}
          </select>

          {/* Lọc theo loại cân IN / OUT */}
          <select
            value={selectedIO}
            onChange={e => setSelectedIO(e.target.value as any)}
            className="h-9 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:border-[#DE4444] cursor-pointer"
          >
            <option value="ALL">Tất cả IN / OUT</option>
            <option value="IN">Chỉ mẻ IN (Đầu vào)</option>
            <option value="OUT">Chỉ mẻ OUT (Đầu ra)</option>
          </select>

          {/* Nút đặt lại */}
          {(searchKeyword || selectedBatch !== 'ALL' || selectedProcess !== 'ALL' || selectedIO !== 'ALL') && (
            <button
              onClick={resetFilters}
              className="h-9 px-3 text-xs font-medium text-slate-500 hover:text-[#DE4444] border border-dashed border-slate-200 hover:border-red-300 hover:bg-red-50 rounded-lg inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Đặt lại
            </button>
          )}

          <div className="ml-auto text-xs font-semibold text-slate-500">
            Tổng cộng: <strong className="text-slate-900 font-mono text-sm">{filteredLogs.length}</strong> bản ghi
          </div>
        </div>
      </div>

      {/* Bảng dữ liệu chính */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-2.5 px-3 w-14">Mã</th>
              <th className="py-2.5 px-3 w-36">Thời gian</th>
              <th className="py-2.5 px-3 w-24">Lô</th>
              <th className="py-2.5 px-3">Công đoạn</th>
              <th className="py-2.5 px-3">Trạm cân</th>
              <th className="py-2.5 px-3">Sản phẩm</th>
              <th className="py-2.5 px-2 text-center w-20">Loại</th>
              <th className="py-2.5 px-3 text-right">Tổng (kg)</th>
              <th className="py-2.5 px-3 text-right">Bì (kg)</th>
              <th className="py-2.5 px-3 text-right">Tịnh (kg)</th>
              <th className="py-2.5 px-3">Nhân viên</th>
              <th className="py-2.5 px-3">Nguồn</th>
              {onDeleteLog && <th className="py-2.5 px-3 text-center w-14">Xoá</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={onDeleteLog ? 13 : 12} className="py-12 text-center text-slate-400 text-xs">
                  Không tìm thấy dữ liệu cân nào phù hợp bộ lọc.
                </td>
              </tr>
            ) : (
              filteredLogs.map(log => {
                const stageName = stageMap.get(log.process_id) || log.process_id;
                const stationName = stationMap.get(log.station_id) || log.station_id;
                const productName = productMap.get(log.product_id) || log.product_id;
                const netWeight = log.net_weight ?? (log.value_weight - log.tare_weight);
                const isOut = log.type_weight === 'OUT';

                return (
                  <tr key={log.log_id} className="hover:bg-slate-50/75 transition-colors">
                    {/* 1. log_id */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      #{log.log_id}
                    </td>

                    {/* 2. time_action */}
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                      {formatDateTime(log.time_action)}
                    </td>

                    {/* 3. batch_id */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {log.batch_id}
                      </span>
                    </td>

                    {/* 4. process_id */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-xs truncate max-w-[170px]" title={stageName}>
                        {stageName}
                      </div>
                      <div className="font-mono text-[10.5px] text-slate-400">
                        {log.process_id}
                      </div>
                    </td>

                    {/* 5. station_id */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 text-xs truncate max-w-[150px]" title={stationName}>
                        {stationName}
                      </div>
                      <div className="font-mono text-[10.5px] text-[#DE4444]">
                        {log.station_id}
                      </div>
                    </td>

                    {/* 6. product_id */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 text-xs truncate max-w-[160px]" title={productName}>
                        {productName}
                      </div>
                      <div className="font-mono text-[10.5px] text-slate-400">
                        {log.product_id}
                      </div>
                    </td>

                    {/* 7. type_weight (IN / OUT) */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${
                        isOut
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isOut ? 'bg-emerald-600' : 'bg-blue-600'}`} />
                        {log.type_weight}
                      </span>
                    </td>

                    {/* 8. value_weight (Gross) */}
                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-600">
                      {log.value_weight.toFixed(3)}
                    </td>

                    {/* 9. tare_weight (Tare) */}
                    <td className="py-3 px-3 text-right font-mono text-slate-400 text-[11px]">
                      {log.tare_weight.toFixed(3)}
                    </td>

                    {/* 10. net_weight (Net) */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-xs text-slate-900 whitespace-nowrap">
                      <span className={isOut ? 'text-emerald-700' : 'text-blue-700'}>
                        {netWeight.toFixed(3)}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">kg</span>
                    </td>

                    {/* 11. employee_id */}
                    <td className="py-3 px-4 font-mono text-slate-600 text-xs whitespace-nowrap">
                      {log.employee_id || <span className="text-slate-300 italic">null</span>}
                    </td>

                    {/* 12. source_method */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.source_method || <span className="text-slate-300 italic">[null]</span>}
                    </td>

                    {/* 13. Xoá (chỉ hiển thị nếu onDeleteLog được truyền) */}
                    {onDeleteLog && (
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onDeleteLog(log.log_id)}
                          className="w-7 h-7 rounded border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 inline-flex items-center justify-center transition-colors cursor-pointer"
                          title="Xoá bản ghi log này"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
