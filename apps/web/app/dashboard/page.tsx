'use client';

import { useState } from 'react';
import useSWR from 'swr';

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const fetcher = (url: string, token: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());

export default function DashboardPage() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);

  const analytics = useSWR(token ? [`${apiBase}/analytics`, token] : null, ([url, t]) =>
    fetcher(url, t)
  );

  const requestCode = async () => {
    const res = await fetch(`${apiBase}/auth/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    setCode(json.code || '');
  };

  const verify = async () => {
    const res = await fetch(`${apiBase}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const json = await res.json();
    setToken(json.token);
  };

  const upload = async () => {
    if (!file || !token) return;
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${apiBase}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const json = await res.json();
    setUploadResult(json);
  };

  return (
    <main className="space-y-6">
      <div className="card space-y-3">
        <h2 className="text-2xl font-semibold">Login</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <input
            className="border rounded px-3 py-2"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="px-4 py-2 bg-primary text-white rounded" onClick={requestCode}>
            Request code
          </button>
          <input
            className="border rounded px-3 py-2"
            placeholder="Enter code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button className="px-4 py-2 bg-slate-900 text-white rounded" onClick={verify}>
            Verify
          </button>
        </div>
        {token && <p className="text-sm text-green-700">Authenticated</p>}
      </div>

      <div className="card space-y-3">
        <h2 className="text-2xl font-semibold">Upload payroll</h2>
        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button className="px-4 py-2 bg-primary text-white rounded" onClick={upload}>
          Upload and validate
        </button>
        {uploadResult && (
          <div className="bg-slate-100 p-3 rounded">
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(uploadResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="card space-y-3">
        <h2 className="text-xl font-semibold">Activity (demo)</h2>
        {analytics.data ? (
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(analytics.data, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-slate-600">Authenticate to view analytics.</p>
        )}
      </div>
    </main>
  );
}
