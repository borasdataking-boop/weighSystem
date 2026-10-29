import { Request, Response } from 'express';
import { iotScaleIngestService } from '../services/iotScaleIngestService';
import { diniArgeoProtocolParser } from '../services/diniArgeoProtocolParser';
import { STM32WeighPayload } from '../models/weighLogModel';

export const iotScaleController = {
  /**
   * API Tiếp nhận dữ liệu cân tự động từ chip STM32 (HTTP POST)
   * Endpoint: POST /api/v1/iot/scale-log
   */
  async handleIncomingWeighEvent(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;

      let payload: STM32WeighPayload;

      // Trường hợp 1: STM32 gửi chuỗi ASCII thô trực tiếp từ Dini Argeo
      // body = { station_id: "10244156", raw_string: "ST,GS,+  15.000,kg\r\n" }
      if (body.raw_string) {
        const parsed = diniArgeoProtocolParser.parse(body.raw_string);
        if (!parsed.isValid) {
          res.status(400).json({ success: false, error: parsed.error });
          return;
        }

        payload = {
          station_id: body.station_id || 'UNKNOWN_STATION',
          gross_weight: parsed.weight,
          tare_weight: parsed.tare,
          is_stable: parsed.isStable,
          unit: parsed.unit,
          batch_id: body.batch_id,
          product_id: body.product_id,
          employee_id: body.employee_id,
          raw_telegram: body.raw_string
        };
      } else {
        // Trường hợp 2: STM32 đã parse sẵn ra JSON
        // body = { station_id: "10244156", gross_weight: 15.0, tare_weight: 1.0, is_stable: true }
        payload = {
          station_id: body.station_id,
          gross_weight: Number(body.gross_weight) || 0,
          tare_weight: Number(body.tare_weight) || 0,
          is_stable: body.is_stable ?? true,
          unit: body.unit || 'kg',
          batch_id: body.batch_id,
          product_id: body.product_id,
          employee_id: body.employee_id
        };
      }

      if (!payload.station_id) {
        res.status(400).json({ success: false, error: 'Thiếu mã trạm cân (station_id).' });
        return;
      }

      const result = await iotScaleIngestService.ingestFromSTM32(payload);
      res.status(200).json(result);
    } catch (err: any) {
      console.error('[IOT API ERROR]', err);
      res.status(500).json({ success: false, error: err.message || 'Lỗi xử lý mẻ cân IoT.' });
    }
  },

  /**
   * API Heartbeat để STM32 kiểm tra kết nối và lấy thông tin cấu hình trạm cân
   * Endpoint: GET /api/v1/iot/scale-status/:stationId
   */
  async getScaleStatus(req: Request, res: Response): Promise<void> {
    const stationId = req.params.stationId;
    const processId = iotScaleIngestService.lookupStationProcess(stationId);
    const ioType = iotScaleIngestService.lookupStationIOType(stationId);
    const activeBatch = iotScaleIngestService.getActiveBatch();

    res.status(200).json({
      status: 'ONLINE',
      station_id: stationId,
      assigned_process: processId,
      io_type: ioType,
      active_batch: activeBatch,
      server_time: new Date().toISOString()
    });
  }
};
