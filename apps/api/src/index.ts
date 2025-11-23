import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { audit } from './audit';
import { track } from './analytics';
import { APP_PORT, CORS_ORIGIN } from './config';
import { detectParser } from './parser';
import { toPayrollRecord } from './pseudonymise';
import { requestMagicLink, verifyMagicLink, verifyToken } from './auth';
import { generatePdf } from './report';
import { summarizeRecord } from './validation';
import { createBillingPortalSession, createCheckoutSession } from './billing';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const app = express();
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/auth/request', (req, res) => {
  const { email, organisationId } = req.body;
  const result = requestMagicLink({ email, organisationId });
  audit('magic_link_requested', { email });
  track({ name: 'account_created', organisationId: organisationId || 'demo-org' });
  res.json({ message: 'Code issued', code: result.code, expiresAt: result.expiresAt });
});

app.post('/auth/verify', (req, res) => {
  const { email, code } = req.body;
  try {
    const token = verifyMagicLink(email, code);
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    const payload = verifyToken(token);
    (req as any).auth = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorised' });
  }
}

app.post('/billing/checkout', authMiddleware, async (req, res) => {
  try {
    const { tierId, successUrl, cancelUrl } = req.body;
    const session = await createCheckoutSession(tierId, successUrl, cancelUrl);
    res.json(session);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

app.post('/billing/portal', authMiddleware, async (req, res) => {
  try {
    const { customerId, returnUrl } = req.body;
    const session = await createBillingPortalSession(customerId, returnUrl);
    res.json(session);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

app.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'Missing file' });
  try {
    const parseFn = detectParser(file.originalname);
    const records = parseFn(file.buffer).map(toPayrollRecord);
    const summaries = records.map((record) => summarizeRecord(record));
    track({ name: 'file_uploaded', organisationId: (req as any).auth.organisationId });
    audit('file_validated', { organisation: (req as any).auth.organisationId, count: records.length });
    res.json({ summaries });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

app.post('/report', authMiddleware, upload.none(), async (req, res) => {
  const summary = req.body.summary as any;
  if (!summary) return res.status(400).json({ error: 'Missing summary' });
  const pdf = generatePdf(summary, (req as any).auth.organisationId);
  res.setHeader('Content-Type', 'application/pdf');
  const streamPipeline = promisify(pipeline);
  await streamPipeline(pdf, res);
  track({ name: 'report_downloaded', organisationId: (req as any).auth.organisationId });
});

app.get('/analytics', authMiddleware, (_req, res) => {
  res.json({ message: 'Analytics endpoint is restricted in demo mode.' });
});

app.listen(APP_PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API running on :${APP_PORT}`);
});
