import { StationWeigh, StationIOType } from '../types/station.types';
import { ProcessStage, FlowConnection, ProcessMapping } from '../types/process.types';
import { processService } from './processService';

const STORAGE_KEY = 'pb_weigh_stations_flow_v3';

// 26 Trạm cân khởi tạo chuẩn khớp 100% với PostgreSQL station_weigh (PMSL.sql)
export const DEFAULT_STATIONS: StationWeigh[] = [
  // --- CD001: Tiếp nhận nguyên liệu ---
  {
    stationId: '10244156',
    stationName: 'Trạm cân Tiếp nhận 01',
    id: '10244156',
    name: 'Trạm cân Tiếp nhận 01',
    processId: 'CD001',
    stageId: 'CD001',
    ioType: 'IN',
    typeWeight: 'IN',
    hubId: 'c2e8a159-2c70-4d8e-9d2a-89a1c12e5641',
    indicatorModel: 'DINI_ARGEO',
    model: 'DINI ARGEO DFWL',
    isActive: true,
    status: 'ONLINE',
    maxWeight: 150,
    division: 10,
    protocol: 'TCP/IP',
    address: '192.168.1.101:8000',
    location: 'Cửa nhập số 1 - Khu tiếp nhận tôm tươi',
    lastSeenAt: '2026-10-16T08:00:00.000Z',
    createdAt: '2026-10-04T14:07:42.505Z'
  },
  {
    stationId: 'CAN001',
    stationName: 'Trạm cân Tiếp nhận 01B',
    id: 'CAN001',
    name: 'Trạm cân Tiếp nhận 01B',
    processId: 'CD001',
    stageId: 'CD001',
    ioType: 'IN',
    typeWeight: 'IN',
    hubId: 'c2e8a159-2c70-4d8e-9d2a-89a1c12e5641',
    indicatorModel: 'DINI_ARGEO',
    model: 'DINI ARGEO DFWL',
    isActive: true,
    status: 'ONLINE',
    maxWeight: 150,
    division: 10,
    protocol: 'RS-232',
    address: 'COM2 (9600-8-N-1)',
    location: 'Cửa nhập số 2 - Khu tiếp nhận tôm tươi',
    lastSeenAt: '2026-10-16T08:00:00.000Z',
    createdAt: '2026-10-04T14:07:42.505Z'
  },
  {
    stationId: 'CAN002',
    stationName: 'Trạm cân Tiếp nhận 02',
    id: 'CAN002',
    name: 'Trạm cân Tiếp nhận 02',
    processId: 'CD001',
    stageId: 'CD001',
    ioType: 'IN',
    typeWeight: 'IN',
    hubId: 'c2e8a159-2c70-4d8e-9d2a-89a1c12e5641',
    indicatorModel: 'DINI_ARGEO',
    model: 'DINI ARGEO DFWL',
    isActive: true,
    status: 'ONLINE',
    maxWeight: 150,
    division: 10,
    protocol: 'RS-232',
    address: 'COM4 (9600-8-N-1)',
    location: 'Cửa nhập số 3 - Khu tiếp nhận tôm tươi',
    lastSeenAt: '2026-10-16T08:00:00.000Z',
    createdAt: '2026-10-04T14:07:42.505Z'
  },
  {
    stationId: '7779460',
    stationName: 'Trạm cân di động Tiếp nhận 03',
    id: '7779460',
    name: 'Trạm cân di động Tiếp nhận 03',
    processId: 'CD001',
    stageId: 'CD001',
    ioType: 'IN',
    typeWeight: 'IN',
    hubId: 'c2e8a159-2c70-4d8e-9d2a-89a1c12e5641',
    indicatorModel: 'METTLER_TOLEDO',
    model: 'METTLER TOLEDO IND231',
    isActive: true,
    status: 'ONLINE',
    maxWeight: 60,
    division: 5,
    protocol: 'WiFi',
    address: '192.168.1.150:8000',
    location: 'Xe đẩy di động khu bốc dỡ',
    lastSeenAt: '2026-10-16T08:00:00.000Z',
    createdAt: '2026-10-04T14:07:42.505Z'
  },

  // --- CD002: Rửa 1 & Phân cỡ sơ bộ ---
  {
    stationId: '10244157',
    stationName: 'Trạm cân Phân cỡ vào 02A',
    id: '10244157',
    name: 'Trạm cân Phân cỡ vào 02A',
    processId: 'CD002',
    stageId: 'CD002',
    ioType: 'IN',
    typeWeight: 'IN',
    hubId: 'c2e8a159-2c70-4d8e-9d2a-89a1c12e5641',
    indicatorModel: 'METTLER_TOLEDO',
    model: 'METTLER TOLEDO IND231',
    isActive: true,
    status: 'ONLINE',
    maxWeight: 60,
    division: 5,
    protocol: 'TCP/IP',
    address: '192.168.1.102:8000',
    location: 'Băng chuyền vào phân cỡ 1',
    lastSeenAt: '2026-10-16T08:30:00.000Z',
    createdAt: '2026-10-04T14:10:00.000Z'
  },
  {
    stationId: '10244173',
    stationName: 'Trạm cân Phân cỡ ra 02B',
    id: '10244173',
    name: 'Trạm cân Phân cỡ ra 02B',
    processId: 'CD002',
    stageId: 'CD002',
    ioType: 'OUT',
    typeWeight: 'OUT',
    hubId: 'c2e8a159-2c70-4d8e-9d2a-89a1c12e5641',
    indicatorModel: 'METTLER_TOLEDO',
    model: 'METTLER TOLEDO IND231',
    isActive: true,
    status: 'ONLINE',
    maxWeight: 60,
    division: 5,
    protocol: 'TCP/IP',
    address: '192.168.1.173:8000',
    location: 'Cửa ra băng chuyền phân cỡ 1',
    lastSeenAt: '2026-10-16T08:35:00.000Z',
    createdAt: '2026-10-04T14:10:00.000Z'
  },

  // --- CD003: Xếp khuôn & Chia mẻ ---
  {
    stationId: '10244158',
    stationName: 'Trạm cân Xếp khuôn vào 03A',
    id: '10244158',
    name: 'Trạm cân Xếp khuôn vào 03A',
    processId: 'CD003',
    stageId: 'CD003',
    ioType: 'IN',
    typeWeight: 'IN',
    hubId: 'c2e8a159-2c70-4d8e-9d2a-89a1c12e5641',
    indicatorModel: 'OHAUS_DEFENDER',
    model: 'OHAUS DEFENDER 3000',
    isActive: true,
    status: 'ONLINE',
    maxWeight: 30,
    division: 2,
    protocol: 'RS-232',
    address: 'COM3 (9600-8-N-1)',
    location: 'Bàn tiếp nhận xếp khuôn khu A',
    lastSeenAt: '2026-10-16T09:15:00.000Z',
    createdAt: '2026-10-04T14:15:00.000Z'
  },
  {
    stationId: '10244174',
    stationName: 'Trạm cân Xếp khuôn ra 03B',
    id: '10244174',
    name: 'Trạm cân Xếp khuôn ra 03B',
    processId: 'CD003',
    stageId: 'CD003',
    ioType: 'OUT',
    typeWeight: 'OUT',
    hubId: 'c2e8a159-2c70-4d8e-9d2a-89a1c12e5641',
    indicatorModel: 'OHAUS_DEFENDER',
    model: 'OHAUS DEFENDER 3000',
    isActive: true,
    status: 'ONLINE',
    maxWeight: 30,
    division: 2,
    protocol: 'RS-232',
    address: 'COM5 (9600-8-N-1)',
    location: 'Bàn chuyển mẻ xếp khuôn khu A',
    lastSeenAt: '2026-10-16T09:20:00.000Z',
    createdAt: '2026-10-04T14:15:00.000Z'
  },

  // --- CD004: Sơ chế (Bóc vỏ & Rút chỉ) ---
  {
    stationId: '10244159',
    stationName: 'Trạm cân Bóc vỏ vào 04A',
    id: '10244159',
    name: 'Trạm cân Bóc vỏ vào 04A',
    processId: 'CD004',
    stageId: 'CD004',
    ioType: 'IN',
    typeWeight: 'IN',
    hubId: 'c2e8a159-2c70-4d8e-9d2a-89a1c12e5641',
    indicatorModel: 'DINI_ARGEO',
    model: 'DINI ARGEO DFWL',
    isActive: true,
    status: 'ONLINE',
    maxWeight: 30,
    division: 2,
    protocol: 'TCP/IP',
    address: '192.168.1.104:8000',
    location: 'Đầu chuyền bóc vỏ số 2',
    lastSeenAt: '2026-10-16T09:45:00.000Z',
    createdAt: '2026-10-04T14:20:00.000Z'
  },
  {
    stationId: '10244175',
    stationName: 'Trạm cân Bóc vỏ ra 04B',
    id: '10244175',
    name: 'Trạm cân Bóc vỏ ra 04B',
    processId: 'CD004',
    stageId: 'CD004',
    ioType: 'OUT',
    typeWeight: 'OUT',
    hubId: 'c2e8a159-2c70-4d8e-9d2a-89a1c12e5641',
    indicatorModel: 'DINI_ARGEO',
    model: 'DINI ARGEO DFWL',
    isActive: true,
    status: 'ONLINE',
    maxWeight: 30,
    division: 2,
    protocol: 'TCP/IP',
    address: '192.168.1.175:8000',
    location: 'Cuối chuyền bóc vỏ số 2',
    lastSeenAt: '2026-10-16T09:48:00.000Z',
    createdAt: '2026-10-04T14:20:00.000Z'
  },

  // --- CD005: Ngâm xử lý phụ gia ---
  {
    stationId: '10244160',
    stationName: 'Trạm cân Bồn ngâm vào 05A',
    id: '10244160',
    name: 'Trạm cân Bồn ngâm vào 05A',
    processId: 'CD005',
    stageId: 'CD005',
    ioType: 'IN',
    typeWeight: 'IN',
    hubId: 'c2e8a159-2c70-4d8e-9d2a-89a1c12e5641',
    indicatorModel: 'DINI_ARGEO',
    model: 'DINI ARGEO DFWL',
    isActive: true,
    status: 'ONLINE',
    maxWeight: 300,
    division: 20,
    protocol: 'TCP/IP',
    address: '192.168.1.105:8000',
    location: 'Khu vực cấp liệu bồn ngâm số 3',
    lastSeenAt: '2026-10-16T09:50:00.000Z',
    createdAt: '2026-10-04T14:25:00.000Z'
  },
  {
    stationId: '10244176',
    stationName: 'Trạm cân Bồn ngâm ra 05B',
    id: '10244176',
    name: 'Trạm cân Bồn ngâm ra 05B',
    processId: 'CD005',
    stageId: 'CD005',
    ioType: 'OUT',
    typeWeight: 'OUT',
    hubId: 'c2e8a159-2c70-4d8e-9d2a-89a1c12e5641',
    indicatorModel: 'DINI_ARGEO',
    model: 'DINI ARGEO DFWL',
    isActive: true,
    status: 'ONLINE',
    maxWeight: 300,
    division: 20,
    protocol: 'TCP/IP',
    address: '192.168.1.176:8000',
    location: 'Cửa xả bán thành phẩm bồn ngâm số 3',
    lastSeenAt: '2026-10-16T09:52:00.000Z',
    createdAt: '2026-10-04T14:25:00.000Z'
  },

  // --- CD006: Định hình Nobashi / Xẻ bướm ---
  {
    stationId: '10244161',
    stationName: 'Trạm cân Định hình Nobashi 06',
    id: '10244161',
    name: 'Trạm cân Định hình Nobashi 06',
    processId: 'CD006',
    stageId: 'CD006',
    ioType: 'OUT',
    typeWeight: 'OUT',
    hubId: 'c2e8a159-2c70-4d8e-9d2a-89a1c12e5641',
    indicatorModel: 'OHAUS_DEFENDER',
    model: 'OHAUS DEFENDER 3000',
    isActive: true,
    status: 'ONLINE',
    maxWeight: 30,
    division: 2,
    protocol: 'TCP/IP',
    address: '192.168.1.106:8000',
    location: 'Bàn ép định hình khay 25 con',
    lastSeenAt: '2026-10-16T09:55:00.000Z',
    createdAt: '2026-10-04T14:30:00.000Z'
  },

  // --- CD007: Tẩm bột chiên xù ---
  {
    stationId: '10244162',
    stationName: 'Trạm cân Tẩm bột vào 07A',
    id: '10244162',
    name: 'Trạm cân Tẩm bột vào 07A',
    processId: 'CD007',
    stageId: 'CD007',
    ioType: 'IN',
    typeWeight: 'IN',
    hubId: 'c2e8a159-2c70-4d8e-9d2a-89a1c12e5641',
    indicatorModel: 'METTLER_TOLEDO',
    model: 'METTLER TOLEDO IND231',
    isActive: true,
    status: 'ONLINE',
    maxWeight: 60,
    division: 5,
    protocol: 'TCP/IP',
    address: '192.168.1.107:8000',
    location: 'Đầu chuyền tẩm bột xù Panko',
    lastSeenAt: '2026-10-16T10:00:00.000Z',
    createdAt: '2026-10-04T14:35:00.000Z'
  },
  {
    stationId: '10244177',
    stationName: 'Trạm cân Tẩm bột ra 07B',
    id: '10244177',
    name: 'Trạm cân Tẩm bột ra 07B',
    processId: 'CD007',
    stageId: 'CD007',
    ioType: 'OUT',
    typeWeight: 'OUT',
    hubId: 'c2e8a159-2c70-4d8e-9d2a-89a1c12e5641',
    indicatorModel: 'METTLER_TOLEDO',
    model: 'METTLER TOLEDO IND231',
    isActive: true,
    status: 'ONLINE',
    maxWeight: 60,
    division: 5,
    protocol: 'TCP/IP',
    address: '192.168.1.177:8000',
    location: 'Cuối chuyền tẩm bột xù Panko',
    lastSeenAt: '2026-10-16T10:03:00.000Z',
    createdAt: '2026-10-04T14:35:00.000Z'
  },

  // --- CD008: Chiên định hình dầu nóng ---
  {
    stationId: '10244163',
    stationName: 'Trạm cân Chiên chín 08',
    id: '10244163',
    name: 'Trạm cân Chiên chín 08',
    processId: 'CD008',
    stageId: 'CD008',
    ioType: 'OUT',
    typeWeight: 'OUT',
    hubId: 'c2e8a159-2c70-4d8e-9d2a-89a1c12e5641',
    indicatorModel: 'DINI_ARGEO',
    model: 'DINI ARGEO DFWL',
    isActive: true,
    status: 'ONLINE',
    maxWeight: 150,
    division: 10,
    protocol: 'TCP/IP',
    address: '192.168.1.108:8000',
    location: 'Cửa ra lò chiên liên tục',
    lastSeenAt: '2026-10-16T10:05:00.000Z',
    createdAt: '2026-10-04T14:40:00.000Z'
  },

  // --- CD009: Luộc / Hấp tôm nõn (PD) ---
  {
    stationId: '10244164',
    stationName: 'Trạm cân Nấu tôm PD vào 09A',
    id: '10244164',
    name: 'Trạm cân Nấu tôm PD vào 09A',
    processId: 'CD009',
    stageId: 'CD009',
    ioType: 'IN',
    typeWeight: 'IN',
    hubId: 'c2e8a159-2c70-4d8e-9d2a-89a1c12e5641',
    indicatorModel: 'DINI_ARGEO',
    model: 'DINI ARGEO DFWL',
    isActive: true,
    status: 'ONLINE',
    maxWeight: 150,
    division: 10,
    protocol: 'TCP/IP',
    address: '192.168.1.109:8000',
    location: 'Nồi luộc áp suất số 1 (Vào)',
    lastSeenAt: '2026-10-16T10:10:00.000Z',
    createdAt: '2026-10-04T14:45:00.000Z'
  },
  {
    stationId: '10244178',
    stationName: 'Trạm cân Nấu tôm PD ra 09B',
    id: '10244178',
    name: 'Trạm cân Nấu tôm PD ra 09B',
    processId: 'CD009',
    stageId: 'CD009',
    ioType: 'OUT',
    typeWeight: 'OUT',
    hubId: 'c2e8a159-2c70-4d8e-9d2a-89a1c12e5641',
    indicatorModel: 'DINI_ARGEO',
    model: 'DINI ARGEO DFWL',
    isActive: true,
    status: 'ONLINE',
    maxWeight: 150,
    division: 10,
    protocol: 'TCP/IP',
    address: '192.168.1.178:8000',
    location: 'Cửa ra rổ nõn luộc số 1',
    lastSeenAt: '2026-10-16T10:12:00.000Z',
    createdAt: '2026-10-04T14:45:00.000Z'
  },

  // --- CD010: Luộc / Hấp tôm vỏ (HLSO) ---
  {
    stationId: '10244165',
    stationName: 'Trạm cân Nấu tôm HLSO vào 10A',
    id: '10244165',
    name: 'Trạm cân Nấu tôm HLSO vào 10A',
    processId: 'CD010',
    stageId: 'CD010',
    ioType: 'IN',
    typeWeight: 'IN',
    hubId: 'c2e8a159-2c70-4d8e-9d2a-89a1c12e5641',
    indicatorModel: 'DINI_ARGEO',
    model: 'DINI ARGEO DFWL',
    isActive: true,
    status: 'ONLINE',
    maxWeight: 150,
    division: 10,
    protocol: 'TCP/IP',
    address: '192.168.1.110:8000',
    location: 'Nồi luộc nhiệt độ chuẩn 2 (Vào)',
    lastSeenAt: '2026-10-16T10:15:00.000Z',
    createdAt: '2026-10-04T14:50:00.000Z'
  },
  {
    stationId: '10244179',
    stationName: 'Trạm cân Nấu tôm HLSO ra 10B',
    id: '10244179',
    name: 'Trạm cân Nấu tôm HLSO ra 10B',
    processId: 'CD010',
    stageId: 'CD010',
    ioType: 'OUT',
    typeWeight: 'OUT',
    hubId: 'c2e8a159-2c70-4d8e-9d2a-89a1c12e5641',
    indicatorModel: 'DINI_ARGEO',
    model: 'DINI ARGEO DFWL',
    isActive: true,
    status: 'ONLINE',
    maxWeight: 150,
    division: 10,
    protocol: 'TCP/IP',
    address: '192.168.1.179:8000',
    location: 'Cửa làm nguội sau luộc HLSO 2',
    lastSeenAt: '2026-10-16T10:18:00.000Z',
    createdAt: '2026-10-04T14:50:00.000Z'
  },

  // --- CD011: Tách vỏ sau luộc ---
  {
    stationId: '10244166',
    stationName: 'Trạm cân Tách vỏ vào 11A',
    id: '10244166',
    name: 'Trạm cân Tách vỏ vào 11A',
    processId: 'CD011',
    stageId: 'CD011',
    ioType: 'IN',
    typeWeight: 'IN',
    hubId: 'c2e8a159-2c70-4d8e-9d2a-89a1c12e5641',
    indicatorModel: 'METTLER_TOLEDO',
    model: 'METTLER TOLEDO IND231',
    isActive: true,
    status: 'ONLINE',
    maxWeight: 60,
    division: 5,
    protocol: 'TCP/IP',
    address: '192.168.1.111:8000',
    location: 'Chuyền cấp tôm chín tách vỏ',
    lastSeenAt: '2026-10-16T10:20:00.000Z',
    createdAt: '2026-10-04T14:55:00.000Z'
  },
  {
    stationId: '10244180',
    stationName: 'Trạm cân Tách vỏ ra 11B',
    id: '10244180',
    name: 'Trạm cân Tách vỏ ra 11B',
    processId: 'CD011',
    stageId: 'CD011',
    ioType: 'OUT',
    typeWeight: 'OUT',
    hubId: 'c2e8a159-2c70-4d8e-9d2a-89a1c12e5641',
    indicatorModel: 'METTLER_TOLEDO',
    model: 'METTLER TOLEDO IND231',
    isActive: true,
    status: 'ONLINE',
    maxWeight: 60,
    division: 5,
    protocol: 'TCP/IP',
    address: '192.168.1.180:8000',
    location: 'Chuyền bóc nõn chín salad (Ra)',
    lastSeenAt: '2026-10-16T10:22:00.000Z',
    createdAt: '2026-10-04T14:55:00.000Z'
  },

  // --- CD012: Cấp đông xoắn tươi ---
  {
    stationId: '10244167',
    stationName: 'Trạm cân Cấp đông xoắn tươi 12',
    id: '10244167',
    name: 'Trạm cân Cấp đông xoắn tươi 12',
    processId: 'CD012',
    stageId: 'CD012',
    ioType: 'OUT',
    typeWeight: 'OUT',
    hubId: 'c2e8a159-2c70-4d8e-9d2a-89a1c12e5641',
    indicatorModel: 'DINI_ARGEO',
    model: 'DINI ARGEO DFWL',
    isActive: true,
    status: 'ONLINE',
    maxWeight: 300,
    division: 20,
    protocol: 'TCP/IP',
    address: '192.168.1.112:8000',
    location: 'Băng xoắn đông tươi số 1',
    lastSeenAt: '2026-10-16T10:25:00.000Z',
    createdAt: '2026-10-04T15:00:00.000Z'
  },

  // --- CD013: Cấp đông xoắn chiên ---
  {
    stationId: '10244168',
    stationName: 'Trạm cân Cấp đông xoắn chiên 13',
    id: '10244168',
    name: 'Trạm cân Cấp đông xoắn chiên 13',
    processId: 'CD013',
    stageId: 'CD013',
    ioType: 'OUT',
    typeWeight: 'OUT',
    hubId: 'c2e8a159-2c70-4d8e-9d2a-89a1c12e5641',
    indicatorModel: 'DINI_ARGEO',
    model: 'DINI ARGEO DFWL',
    isActive: true,
    status: 'ONLINE',
    maxWeight: 300,
    division: 20,
    protocol: 'TCP/IP',
    address: '192.168.1.113:8000',
    location: 'Băng xoắn đông chiên số 2',
    lastSeenAt: '2026-10-16T10:30:00.000Z',
    createdAt: '2026-10-04T15:05:00.000Z'
  },

  // --- CD014: Cấp đông IQF tươi ---
  {
    stationId: '10244169',
    stationName: 'Trạm cân Cấp đông IQF tươi vào 14A',
    id: '10244169',
    name: 'Trạm cân Cấp đông IQF tươi vào 14A',
    processId: 'CD014',
    stageId: 'CD014',
    ioType: 'IN',
    typeWeight: 'IN',
    hubId: 'c2e8a159-2c70-4d8e-9d2a-89a1c12e5641',
    indicatorModel: 'METTLER_TOLEDO',
    model: 'METTLER TOLEDO IND231',
    isActive: true,
    status: 'ONLINE',
    maxWeight: 150,
    division: 10,
    protocol: 'TCP/IP',
    address: '192.168.1.114:8000',
    location: 'Cửa nạp băng chuyền IQF tươi',
    lastSeenAt: '2026-10-16T10:32:00.000Z',
    createdAt: '2026-10-04T15:10:00.000Z'
  },
  {
    stationId: '10244181',
    stationName: 'Trạm cân Cấp đông IQF tươi ra 14B',
    id: '10244181',
    name: 'Trạm cân Cấp đông IQF tươi ra 14B',
    processId: 'CD014',
    stageId: 'CD014',
    ioType: 'OUT',
    typeWeight: 'OUT',
    hubId: 'c2e8a159-2c70-4d8e-9d2a-89a1c12e5641',
    indicatorModel: 'METTLER_TOLEDO',
    model: 'METTLER TOLEDO IND231',
    isActive: true,
    status: 'ONLINE',
    maxWeight: 150,
    division: 10,
    protocol: 'TCP/IP',
    address: '192.168.1.181:8000',
    location: 'Cửa ra mạ băng chuyền IQF tươi',
    lastSeenAt: '2026-10-16T10:35:00.000Z',
    createdAt: '2026-10-04T15:10:00.000Z'
  },

  // --- CD015: Cấp đông IQF chín ---
  {
    stationId: '10244170',
    stationName: 'Trạm cân Cấp đông IQF chín 15',
    id: '10244170',
    name: 'Trạm cân Cấp đông IQF chín 15',
    processId: 'CD015',
    stageId: 'CD015',
    ioType: 'OUT',
    typeWeight: 'OUT',
    hubId: 'c2e8a159-2c70-4d8e-9d2a-89a1c12e5641',
    indicatorModel: 'DINI_ARGEO',
    model: 'DINI ARGEO DFWL',
    isActive: true,
    status: 'ONLINE',
    maxWeight: 150,
    division: 10,
    protocol: 'TCP/IP',
    address: '192.168.1.115:8000',
    location: 'Cửa ra băng chuyền IQF chín',
    lastSeenAt: '2026-10-16T10:35:00.000Z',
    createdAt: '2026-10-04T15:15:00.000Z'
  },

  // --- Trạm cân dự phòng kỹ thuật ---
  {
    stationId: '10244171',
    stationName: 'Trạm cân Dự phòng kho kỹ thuật 01',
    id: '10244171',
    name: 'Trạm cân Dự phòng kho kỹ thuật 01',
    processId: 'UNASSIGNED',
    stageId: 'UNASSIGNED',
    ioType: 'IN',
    typeWeight: 'IN',
    hubId: null,
    indicatorModel: 'YAOHUA_A12E',
    model: 'YAOHUA A12E',
    isActive: false,
    status: 'CALIBRATING',
    maxWeight: 100,
    division: 10,
    protocol: 'RS-232',
    address: 'COM1',
    location: 'Kho bảo trì thiết bị tầng 1',
    lastSeenAt: '2026-10-10T12:00:00.000Z',
    createdAt: '2026-10-04T15:20:00.000Z'
  },
  {
    stationId: '10244172',
    stationName: 'Trạm cân Dự phòng kho kỹ thuật 02',
    id: '10244172',
    name: 'Trạm cân Dự phòng kho kỹ thuật 02',
    processId: 'UNASSIGNED',
    stageId: 'UNASSIGNED',
    ioType: 'OUT',
    typeWeight: 'OUT',
    hubId: null,
    indicatorModel: 'METTLER_TOLEDO',
    model: 'METTLER TOLEDO IND231',
    isActive: false,
    status: 'OFFLINE',
    maxWeight: 60,
    division: 5,
    protocol: 'WiFi',
    address: 'pmsl/backup/02',
    location: 'Kho dự trữ thiết bị chuyền phụ',
    lastSeenAt: '2026-10-12T09:00:00.000Z',
    createdAt: '2026-10-04T15:25:00.000Z'
  }
];

export const stationService = {
  // ==========================================
  // QUẢN LÝ TRẠM CÂN (BẢNG station_weigh TRONG DB)
  // ==========================================
  /**
   * Tải danh sách trạm cân trực tiếp từ PostgreSQL Database qua Backend API
   */
  async fetchStations(): Promise<StationWeigh[]> {
    try {
      const res = await fetch('/api/stations');
      if (res.ok) {
        const data: StationWeigh[] = await res.json();
        this.saveStations(data);
        return data;
      }
    } catch (err) {
      console.warn('[stationService] Không kết nối được API Backend, dùng cache:', err);
    }
    return this.getStations();
  },

  async addStationToDatabase(station: StationWeigh): Promise<StationWeigh[]> {
    try {
      const res = await fetch('/api/stations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(station)
      });
      if (res.ok) {
        const data = await res.json();
        this.saveStations(data);
        return data;
      }
    } catch (err) {
      console.error('[stationService] Lỗi lưu trạm cân vào DB:', err);
    }
    return this.addStation(station);
  },

  async updateStationInDatabase(station: StationWeigh): Promise<StationWeigh[]> {
    try {
      const sId = station.stationId || station.id;
      const res = await fetch(`/api/stations/${sId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(station)
      });
      if (res.ok) {
        const data = await res.json();
        this.saveStations(data);
        return data;
      }
    } catch (err) {
      console.error('[stationService] Lỗi cập nhật trạm cân trong DB:', err);
    }
    return this.updateStation(station);
  },

  async deleteStationFromDatabase(stationId: string): Promise<StationWeigh[]> {
    try {
      const res = await fetch(`/api/stations/${stationId}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        this.saveStations(data);
        return data;
      }
    } catch (err) {
      console.error('[stationService] Lỗi xoá trạm cân trong DB:', err);
    }
    return this.deleteStation(stationId);
  },

  getStations(): StationWeigh[] {
    if (typeof window === 'undefined') return DEFAULT_STATIONS;
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATIONS));
      return DEFAULT_STATIONS;
    }
    try {
      const parsed: StationWeigh[] = JSON.parse(data);
      const existingIds = new Set(parsed.map(s => s.stationId || s.id));
      const missing = DEFAULT_STATIONS.filter(d => !existingIds.has(d.stationId || d.id));
      let merged = parsed;
      if (missing.length > 0) {
        merged = [...parsed, ...missing];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      }
      return merged.map(s => {
        const defaultMatch = DEFAULT_STATIONS.find(d => (d.stationId || d.id) === (s.stationId || s.id));
        const ioType = defaultMatch ? defaultMatch.ioType : (s.ioType || 'IN');
        return {
          ...s,
          ioType,
          typeWeight: ioType
        };
      });
    } catch {
      return DEFAULT_STATIONS;
    }
  },

  saveStations(stations: StationWeigh[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stations));
    }
  },

  addStation(station: StationWeigh): StationWeigh[] {
    const list = this.getStations();
    const sId = station.stationId || station.id || `ST-${Date.now()}`;
    const sName = station.stationName || station.name || 'Trạm cân mới';
    const newStation: StationWeigh = {
      ...station,
      stationId: sId,
      stationName: sName,
      id: sId,
      name: sName,
      indicatorModel: station.indicatorModel || 'DINI_ARGEO',
      isActive: station.status === 'ONLINE',
      createdAt: new Date().toISOString()
    };
    const updated = [...list, newStation];
    this.saveStations(updated);
    return updated;
  },

  updateStation(updatedStation: StationWeigh): StationWeigh[] {
    const list = this.getStations();
    const targetId = updatedStation.stationId || updatedStation.id || '';
    const updated: StationWeigh[] = list.map(s => {
      const currentId = s.stationId || s.id;
      if (currentId === targetId) {
        return {
          ...s,
          ...updatedStation,
          stationId: targetId,
          stationName: updatedStation.stationName || updatedStation.name || s.stationName,
          id: targetId,
          name: updatedStation.stationName || updatedStation.name || s.name,
          isActive: updatedStation.status === 'ONLINE'
        };
      }
      return s;
    });
    this.saveStations(updated);
    return updated;
  },

  deleteStation(stationId: string): StationWeigh[] {
    const list = this.getStations();
    const updated = list.filter(s => (s.stationId || s.id) !== stationId);
    this.saveStations(updated);
    return updated;
  },

  assignToProcess(stationId: string, processId: string): StationWeigh[] {
    const validation = this.validateStationAssignment(stationId, processId);
    if (!validation.isValid) {
      console.warn(`[StationService] Cảnh báo gán công đoạn: ${validation.error}`);
      return this.getStations();
    }
    const list = this.getStations();
    const updated = list.map(s => {
      if ((s.stationId || s.id) === stationId) {
        return { ...s, processId, stageId: processId };
      }
      return s;
    });
    this.saveStations(updated);
    return updated;
  },

  /**
   * Thu hồi các cân gắn tại một công đoạn về kho UNASSIGNED (Dùng khi xoá hoặc tạm ngưng khâu)
   */
  unassignFromProcess(stageId: string): StationWeigh[] {
    const list = this.getStations();
    const updated = list.map(s => (s.processId === stageId || s.stageId === stageId ? { ...s, processId: 'UNASSIGNED', stageId: 'UNASSIGNED' } : s));
    this.saveStations(updated);
    return updated;
  },

  validateStationAssignment(stationId: string, processId: string): { isValid: boolean; error?: string } {
    if (!stationId) {
      return { isValid: false, error: 'Mã trạm cân không được để trống.' };
    }
    if (processId && processId !== 'UNASSIGNED') {
      const stages = processService.getProcesses();
      const stageExists = stages.some(s => (s.processId || s.id) === processId);
      if (!stageExists) {
        return { isValid: false, error: `Công đoạn [${processId}] không tồn tại trong hệ thống quy trình.` };
      }
    }
    return { isValid: true };
  },

  // ==========================================
  // HÀM HỖ TRỢ TƯƠNG THÍCH NGƯỢC (BACKWARD COMPATIBILITY)
  // Các cuộc gọi liên quan đến process/mapping sẽ ủy thác sang processService
  // ==========================================
  getProcesses(): ProcessStage[] {
    return processService.getProcesses();
  },

  saveProcesses(stages: ProcessStage[]): void {
    processService.saveProcesses(stages);
  },

  addProcess(stage: ProcessStage): ProcessStage[] {
    return processService.addProcess(stage);
  },

  updateProcess(stage: ProcessStage, oldStageId?: string): ProcessStage[] {
    return processService.updateProcess(stage, oldStageId);
  },

  deleteProcess(stageId: string): ProcessStage[] {
    return processService.deleteProcess(stageId, (sId) => {
      this.unassignFromProcess(sId);
    });
  },

  getConnections(): FlowConnection[] {
    return processService.getConnections();
  },

  getProcessMappings(): ProcessMapping[] {
    return processService.getProcessMappings();
  },

  saveProcessMappings(mappings: ProcessMapping[]): void {
    processService.saveProcessMappings(mappings);
  },

  getMappingsForStage(processId: string): { outgoing: ProcessMapping[]; incoming: ProcessMapping[] } {
    return processService.getMappingsForStage(processId);
  }
};
