import fs from 'fs';
import path from 'path';

const auditLogPath = path.join(process.cwd(), 'logs');
if (!fs.existsSync(auditLogPath)) fs.mkdirSync(auditLogPath, { recursive: true });

export function audit(event: string, payload: Record<string, unknown>) {
  const safePayload = Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [key, typeof value === 'string' ? '[redacted]' : value])
  );
  const line = `${new Date().toISOString()} ${event} ${JSON.stringify(safePayload)}\n`;
  fs.appendFileSync(path.join(auditLogPath, 'audit.log'), line);
}
