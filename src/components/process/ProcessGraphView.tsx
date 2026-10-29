import React, { useState } from 'react';
import { ProcessStage, ProcessMapping } from '../../types/process.types';
import { processService } from '../../services/processService';

interface ProcessGraphViewProps {
  stages: ProcessStage[];
  mappings?: ProcessMapping[];
  onSelectStage?: (stageId: string) => void;
}

interface DAGNode {
  id: string;
  code: string;
  name: string;
  enTitle: string;
  x: number;
  y: number;
}

export const ProcessGraphView: React.FC<ProcessGraphViewProps> = ({
  stages,
  mappings,
  onSelectStage
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Kích thước của mỗi box công đoạn (Cạnh dài = 180px, Cạnh ngắn = 50px)
  const W = 180;
  const H = 50;
  const halfW = W / 2; // 90
  const halfH = H / 2; // 25

  // 4 Trục chuyền thẳng đứng (Columns):
  // Trục 1: X = 140 (Sơ chế chính & Hàng chiên)
  // Trục 2: X = 390 (Luộc tôm nõn PD)
  // Trục 3: X = 640 (Luộc tôm vỏ HLSO)
  // Trục 4: X = 890 (Thành phẩm cấp đông chín Cook IQF)
  const NODES: DAGNode[] = [
    // Tầng 1 -> 5: Trục sơ chế chính
    { id: 'CD001', code: 'CD-01', name: 'Tiếp nhận nguyên liệu', enTitle: 'Material Receiving', x: 140, y: 50 },
    { id: 'CD002', code: 'CD-02', name: 'Rửa 1 & Phân cỡ sơ bộ', enTitle: 'Grading & Sizing', x: 140, y: 135 },
    { id: 'CD003', code: 'CD-03', name: 'Xếp khuôn & Định lượng', enTitle: 'Stacking & Batching', x: 140, y: 220 },
    { id: 'CD004', code: 'CD-04', name: 'Sơ chế (Bóc vỏ & Rút chỉ)', enTitle: 'Peeling & Deveining', x: 140, y: 305 },
    { id: 'CD005', code: 'CD-05', name: 'Ngâm xử lý phụ gia', enTitle: 'Soaking Process', x: 140, y: 410 },

    // Tầng 6: Định hình Nobashi
    { id: 'CD006', code: 'CD-06', name: 'Định hình Nobashi / Xẻ bướm', enTitle: 'Nobashi & Butterfly', x: 140, y: 530 },

    // Tầng 7: Tẩm bột & 2 Nhánh Luộc chín
    { id: 'CD007', code: 'CD-07', name: 'Tẩm bột chiên xù', enTitle: 'Breading Process', x: 140, y: 630 },
    { id: 'CD009', code: 'CD-09', name: 'Luộc / Hấp tôm nõn (PD)', enTitle: 'PD Cooking', x: 390, y: 630 },
    { id: 'CD010', code: 'CD-10', name: 'Luộc / Hấp tôm vỏ (HLSO)', enTitle: 'HLSO Cooking', x: 640, y: 630 },

    // Tầng 8: Chiên & Tách vỏ sau luộc
    { id: 'CD008', code: 'CD-08', name: 'Chiên định hình dầu nóng', enTitle: 'Breaded Frying', x: 140, y: 730 },
    { id: 'CD011', code: 'CD-11', name: 'Tách vỏ sau luộc', enTitle: 'Peel After Cook', x: 640, y: 730 },

    // Tầng 9: 4 Đầu ra Cấp đông thành phẩm (Hàng đáy Y = 850)
    { id: 'CD012', code: 'CD-12', name: 'Cấp đông xoắn tôm tươi', enTitle: 'Raw Spiral Freezer', x: 140, y: 850 },
    { id: 'CD013', code: 'CD-13', name: 'Cấp đông xoắn tôm chiên', enTitle: 'Fried Spiral Freezer', x: 390, y: 850 },
    { id: 'CD014', code: 'CD-14', name: 'Cấp đông IQF tôm tươi', enTitle: 'Raw IQF Freezer', x: 640, y: 850 },
    { id: 'CD015', code: 'CD-15', name: 'Cấp đông IQF tôm chín', enTitle: 'Cooked IQF Freezer', x: 890, y: 850 }
  ];

  // Map tra cứu nhanh vị trí Node
  const nodeMap = new Map<string, DAGNode>();
  NODES.forEach(n => nodeMap.set(n.id, n));

  // Lấy danh sách mapping từ bảng phụ process_mapping (database/localStorage)
  const activeMappings: ProcessMapping[] = (mappings || processService.getProcessMappings()).filter(
    m => m.isActive !== false
  );

  // Đường đi SVG chuẩn cho các mapping đã được cân chỉnh trật tự
  const PREDEFINED_PATHS: Record<string, { path: string; isBypass?: boolean }> = {
    'CD001->CD002': { path: 'M 140 75 L 140 110' },
    'CD002->CD003': { path: 'M 140 160 L 140 195' },
    'CD003->CD004': { path: 'M 140 245 L 140 280' },
    'CD003->CD005': { path: 'M 50 220 L 25 220 L 25 360 L 140 360 L 140 385', isBypass: true },
    'CD004->CD005': { path: 'M 140 330 L 140 385' },
    'CD005->CD006': { path: 'M 140 435 L 140 505' },
    'CD005->CD009': { path: 'M 140 470 L 390 470 L 390 605' },
    'CD005->CD010': { path: 'M 140 470 L 640 470 L 640 605' },
    'CD005->CD014': { path: 'M 390 470 L 515 470 L 515 790 L 640 790 L 640 825' },
    'CD006->CD007': { path: 'M 140 555 L 140 605' },
    'CD007->CD008': { path: 'M 140 655 L 140 705' },
    'CD008->CD012': { path: 'M 140 755 L 140 825' },
    'CD008->CD013': { path: 'M 140 755 L 140 790 L 390 790 L 390 825' },
    'CD009->CD013': { path: 'M 390 655 L 390 825' },
    'CD010->CD011': { path: 'M 640 655 L 640 705' },
    'CD011->CD014': { path: 'M 640 755 L 640 825' },
    'CD011->CD015': { path: 'M 640 755 L 640 790 L 890 790 L 890 825' }
  };

  // Tính toán cạnh hiển thị động theo bảng process_mapping:
  // Luôn đảm bảo: Mọi mũi tên vuông góc, cắm thẳng vào chính giữa cạnh dài trên của Node đích
  const EDGES = activeMappings.map(mapping => {
    const key = `${mapping.fromProcessId}->${mapping.toProcessId}`;
    const predefined = PREDEFINED_PATHS[key];
    if (predefined) {
      return {
        id: mapping.id,
        from: mapping.fromProcessId,
        to: mapping.toProcessId,
        path: predefined.path,
        isBypass: predefined.isBypass,
        desc: mapping.description
      };
    }

    // Fallback định tuyến tự động vuông góc nếu có mapping mới trong DB
    const fromNode = nodeMap.get(mapping.fromProcessId);
    const toNode = nodeMap.get(mapping.toProcessId);
    if (!fromNode || !toNode) {
      return null;
    }

    let path = '';
    if (fromNode.x === toNode.x) {
      path = `M ${fromNode.x} ${fromNode.y + halfH} L ${toNode.x} ${toNode.y - halfH}`;
    } else {
      const midY = (fromNode.y + halfH + toNode.y - halfH) / 2;
      path = `M ${fromNode.x} ${fromNode.y + halfH} L ${fromNode.x} ${midY} L ${toNode.x} ${midY} L ${toNode.x} ${toNode.y - halfH}`;
    }

    return {
      id: mapping.id,
      from: mapping.fromProcessId,
      to: mapping.toProcessId,
      path,
      isBypass: mapping.transitionType === 'BYPASS',
      desc: mapping.description
    };
  }).filter(Boolean) as Array<{
    id: string;
    from: string;
    to: string;
    path: string;
    isBypass?: boolean;
    desc?: string;
  }>;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#DE4444]" />
          Sơ đồ quy trình
        </h2>
      </div>

      {/* Vùng vẽ đồ thị SVG với đường nối vuông góc chuẩn trật tự */}
      <div className="w-full overflow-x-auto bg-slate-50/60 rounded-xl border border-slate-200/80 p-4 flex justify-center">
        <svg
          viewBox="0 0 1020 920"
          className="w-full max-w-[1000px] h-auto select-none"
          style={{ minWidth: '820px' }}
        >
          <defs>
            {/* Đầu mũi tên mặc định: cắm thẳng đứng xuống cạnh dài trên của box */}
            <marker
              id="clean-arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94A3B8" />
            </marker>

            {/* Đầu mũi tên khi hover */}
            <marker
              id="clean-arrow-active"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#DE4444" />
            </marker>
          </defs>

          {/* CÁC ĐƯỜNG MŨI TÊN VUÔNG GÓC TRẬT TỰ (TRUNK & BUS ROUTING) */}
          <g strokeLinejoin="miter">
            {EDGES.map(edge => {
              const isHighlighted = hoveredNode === edge.from || hoveredNode === edge.to;
              return (
                <path
                  key={edge.id}
                  d={edge.path}
                  fill="none"
                  stroke={isHighlighted ? '#DE4444' : '#94A3B8'}
                  strokeWidth={isHighlighted ? 2.5 : 1.8}
                  strokeDasharray={edge.isBypass ? '4 3' : undefined}
                  markerEnd={isHighlighted ? 'url(#clean-arrow-active)' : 'url(#clean-arrow)'}
                  className="transition-colors duration-150"
                />
              );
            })}
          </g>

          {/* 15 BOX NODE CÔNG ĐOẠN (W = 180px, H = 50px) */}
          {NODES.map(node => {
            const isHovered = hoveredNode === node.id;

            return (
              <foreignObject
                key={node.id}
                x={node.x - halfW}
                y={node.y - halfH}
                width={W}
                height={H}
                className="overflow-visible"
              >
                <div
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => onSelectStage && onSelectStage(node.id)}
                  className={`w-[180px] h-[50px] bg-white rounded-xl border px-3 py-1.5 flex flex-col justify-between transition-all cursor-pointer shadow-xs group ${
                    isHovered
                      ? 'border-[#DE4444] shadow-md -translate-y-0.5 ring-2 ring-red-100'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  title={`${node.code}: ${node.name}`}
                >
                  {/* Dòng 1: Mã Node + Tiêu đề quốc tế */}
                  <div className="flex items-center justify-between gap-1 leading-none">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-[#DE4444] border border-red-200">
                      {node.code}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium truncate max-w-[105px]" title={node.enTitle}>
                      {node.enTitle}
                    </span>
                  </div>

                  {/* Dòng 2: Tên công đoạn chuẩn hoá */}
                  <div className="text-xs font-bold text-slate-900 group-hover:text-[#DE4444] truncate transition-colors leading-tight">
                    {node.name}
                  </div>
                </div>
              </foreignObject>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
