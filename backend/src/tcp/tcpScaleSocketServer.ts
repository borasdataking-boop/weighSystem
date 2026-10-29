import * as net from 'net';
import { diniArgeoProtocolParser } from '../services/diniArgeoProtocolParser';
import { iotScaleIngestService } from '../services/iotScaleIngestService';

/**
 * MÁY CHỦ TCP SOCKET TIẾP NHẬN BẢN TIN TRỰC TIẾP TỪ STM32 QUA ETHERNET / WIFI (CỔNG 8000)
 */
export function startTcpScaleServer(port: number = 8000): net.Server {
  const server = net.createServer((socket) => {
    const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`[TCP CÂN IoT] Trạm cân đã kết nối từ: ${clientAddress}`);

    let buffer = '';

    socket.on('data', async (chunk) => {
      buffer += chunk.toString('ascii');

      // Các bản tin Dini Argeo luôn kết thúc bằng \r\n hoặc \n
      if (buffer.includes('\n')) {
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || ''; // giữ lại phần chưa hoàn chỉnh

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          console.log(`[TCP RX] Nhận bản tin: "${trimmed}"`);

          // Hỗ trợ định dạng: "STATION=10244156;DATA=ST,GS,+  15.000,kg"
          // Hoặc chuỗi thuần Dini: "ST,GS,+  15.000,kg"
          let stationId = '10244156'; // Mặc định hoặc bóc tách từ tiền tố
          let rawDiniString = trimmed;

          if (trimmed.includes('STATION=')) {
            const parts = trimmed.split(';');
            const stationPart = parts.find(p => p.startsWith('STATION='));
            const dataPart = parts.find(p => p.startsWith('DATA='));
            if (stationPart) stationId = stationPart.replace('STATION=', '').trim();
            if (dataPart) rawDiniString = dataPart.replace('DATA=', '').trim();
          }

          // Parse giao thức Dini Argeo
          const parsed = diniArgeoProtocolParser.parse(rawDiniString);
          if (parsed.isValid && parsed.isStable) {
            const ingestResult = await iotScaleIngestService.ingestFromSTM32({
              station_id: stationId,
              gross_weight: parsed.weight,
              tare_weight: parsed.tare,
              is_stable: parsed.isStable,
              unit: parsed.unit,
              raw_telegram: rawDiniString
            });

            // Phản hồi ACK về cho STM32
            if (ingestResult.success && !ingestResult.skipped) {
              socket.write(`ACK;STATION=${stationId};NET=${parsed.weight - parsed.tare}\r\n`);
            }
          }
        }
      }
    });

    socket.on('close', () => {
      console.log(`[TCP CÂN IoT] Trạm cân ngắt kết nối: ${clientAddress}`);
    });

    socket.on('error', (err) => {
      console.error(`[TCP ERROR] Lỗi socket trạm cân: ${err.message}`);
    });
  });

  server.listen(port, () => {
    console.log(`[TCP SERVER] Máy chủ TCP lắng nghe dữ liệu cân STM32 trên cổng: ${port}`);
  });

  return server;
}
