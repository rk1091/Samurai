import { useEffect, useState } from 'react';
import { fetchTraces, fetchTraceDetail } from '../api';
import TraceDetailModal from '../components/TraceDetailModal';
import TimeRangeSelect from '../components/TimeRangeSelect';

export default function Traces() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [search, setSearch] = useState('');
  const [range, setRange] = useState('');
  const [selected, setSelected] = useState(null);
  const pageSize = 15;

  async function load() {
    const data = await fetchTraces({
      status: statusFilter || undefined,
      model: modelFilter || undefined,
      search: search || undefined,
      range: range || undefined,
      page,
      pageSize,
    });
    setRows(data.rows);
    setTotal(data.total);
  }

  useEffect(() => { load(); }, [page, statusFilter, modelFilter, search, range]);

  async function openDetail(id) {
    const detail = await fetchTraceDetail(id);
    setSelected(detail);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <h1>Traces</h1>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          placeholder="Search prompt text..."
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          style={{ minWidth: 200 }}
        />
        <select value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}>
          <option value="">All statuses</option>
          <option value="success">Success</option>
          <option value="fail">Fail</option>
        </select>
        <input
          placeholder="Filter by model..."
          value={modelFilter}
          onChange={(e) => { setPage(1); setModelFilter(e.target.value); }}
        />
        <TimeRangeSelect value={range} onChange={(v) => { setPage(1); setRange(v); }} />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #333' }}>
            <th style={{ padding: 8 }}>Time</th>
            <th style={{ padding: 8 }}>Project</th>
            <th style={{ padding: 8 }}>Model</th>
            <th style={{ padding: 8 }}>Status</th>
            <th style={{ padding: 8 }}>Cost</th>
            <th style={{ padding: 8 }}>Latency</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id} onClick={() => openDetail(t.id)} style={{ borderBottom: '1px solid #222', cursor: 'pointer' }}>
              <td style={{ padding: 8 }}>{new Date(t.timestamp).toLocaleString()}</td>
              <td style={{ padding: 8 }}>{t.projectTag}</td>
              <td style={{ padding: 8 }}>{t.model}</td>
              <td style={{ padding: 8, color: t.status === 'fail' ? '#ff6b6b' : '#5fd77c' }}>{t.status}</td>
              <td style={{ padding: 8 }}>${t.costUsd?.toFixed(4) ?? '0.0000'}</td>
              <td style={{ padding: 8 }}>{t.latencyMs}ms</td>
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length === 0 && <p style={{ opacity: 0.6, marginTop: '1rem' }}>No traces match these filters.</p>}

      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>

      <TraceDetailModal
        trace={selected}
        onClose={() => setSelected(null)}
        onNavigate={openDetail}
      />
    </div>
  );
}
