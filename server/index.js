import cors from 'cors';
import express from 'express';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const catalogPath = join(__dirname, 'data', 'catalog.json');

function loadCatalog() {
  return JSON.parse(readFileSync(catalogPath, 'utf-8'));
}

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/catalog', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json(loadCatalog());
});

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`Bundle builder API listening on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.error('API failed to start:', err);
  process.exit(1);
});

if (!process.stdin.isTTY) {
  process.stdin.resume();
}
