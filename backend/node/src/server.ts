import express, { Request, Response } from 'express';
import cors from 'cors';
import { dbDataService } from './services/dbDataService';
import { iotScaleIngestService } from './services/iotScaleIngestService';
import { startTcpScaleServer } from './tcp/tcpScaleSocketServer';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// 1. Health check
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const batches = await dbDataService.getBatches();
    res.json({ status: 'ok', database: 'connected', batchesCount: batches.length });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 2. Processes & Mappings
app.get('/api/processes', async (_req: Request, res: Response) => {
  try {
    const data = await dbDataService.getProcesses();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/processes', async (req: Request, res: Response) => {
  try {
    await dbDataService.addProcess(req.body);
    const data = await dbDataService.getProcesses();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/processes/:id', async (req: Request, res: Response) => {
  try {
    await dbDataService.deleteProcess(req.params.id);
    const data = await dbDataService.getProcesses();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Stations (Trạm cân)
app.get('/api/stations', async (_req: Request, res: Response) => {
  try {
    const stations = await dbDataService.getStations();
    res.json(stations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/stations', async (req: Request, res: Response) => {
  try {
    await dbDataService.addStation(req.body);
    const stations = await dbDataService.getStations();
    res.json(stations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/stations/:id', async (req: Request, res: Response) => {
  try {
    await dbDataService.updateStation({ ...req.body, stationId: req.params.id });
    const stations = await dbDataService.getStations();
    res.json(stations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/stations/:id', async (req: Request, res: Response) => {
  try {
    await dbDataService.deleteStation(req.params.id);
    const stations = await dbDataService.getStations();
    res.json(stations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Products (Sản phẩm)
app.get('/api/products', async (_req: Request, res: Response) => {
  try {
    const products = await dbDataService.getProducts();
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req: Request, res: Response) => {
  try {
    await dbDataService.addProduct(req.body);
    const products = await dbDataService.getProducts();
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req: Request, res: Response) => {
  try {
    await dbDataService.deleteProduct(req.params.id);
    const products = await dbDataService.getProducts();
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Weight Logs (Nhật ký mẻ cân)
app.get('/api/logs', async (req: Request, res: Response) => {
  try {
    const batchId = req.query.batch_id as string;
    const logs = await dbDataService.getLogs(batchId);
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/logs', async (req: Request, res: Response) => {
  try {
    const newLog = await dbDataService.createLog(req.body);
    res.json(newLog);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/logs/:id', async (req: Request, res: Response) => {
  try {
    await dbDataService.deleteLog(Number(req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Metrics & Batches
app.get('/api/metrics', async (req: Request, res: Response) => {
  try {
    const batchId = req.query.batch_id as string;
    const metrics = await dbDataService.getMetrics(batchId);
    res.json(metrics);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/batches', async (_req: Request, res: Response) => {
  try {
    const batches = await dbDataService.getBatches();
    res.json(batches);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. IoT Ingestion endpoint (từ STM32)
app.post('/api/iot/weigh', async (req: Request, res: Response) => {
  try {
    const result = await iotScaleIngestService.ingestFromSTM32(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Start HTTP Server
const server = app.listen(PORT, () => {
  console.log(`🚀 [BACKEND API] Running at http://localhost:${PORT}`);
  console.log(`📊 [DATABASE] Connected to PostgreSQL (weigh_dashboard)`);
});

// Start TCP Server for Scales on Port 8000
try {
  startTcpScaleServer(8000);
} catch (e) {
  console.warn('TCP server notice:', e);
}

export default server;
