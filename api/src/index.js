import express from 'express';
import { pool } from './db.js';
import siteRouter from './routes/site.js';
import adminRouter from './routes/admin.js';

const app = express();

app.set('trust proxy', true);
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ ok: true });
});

app.use('/api', siteRouter);
app.use('/api/admin', adminRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'مسیر مورد نظر پیدا نشد.' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'خطایی در سرور رخ داد.' });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, '0.0.0.0', () => {
  console.log(`API listening on http://0.0.0.0:${port}`);
});
