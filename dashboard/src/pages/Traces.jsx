import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchTraces, fetchTraceDetail } from '../api';
import TraceDetailModal from '../components/TraceDetailModal';
import TimeRangeSelect from '../components/TimeRangeSelect';
import { capitalize } from '../utils';

export default function Traces() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectFilter = searchParams.get('project') || '';

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
      project: projectFilter || undefined,
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

  useEffect(() => { load(); }, [page, statusFilter, modelFilter, search, range, projectFilter]);
  useEffect(() => { setPage(1); }, [projectFilter]);

  async function openDetail(id) {
    const detail = await fetchTraceDetail(id);
    setSelected(detail);
  }

  function clearProject() {
    searchParams.delete('project');
    setSearchParams(searchParams);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <h1>{projectFilter ? capitalize(projectFilter) : 'All Traces'}</h1>
        {projectFilter && <button className="btn-ghost" onClick={clearProject}>Clear project filter</button>}
      </div>

      <div className="filter-bar">
        <input
          placeholder="Search prompt text..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="success">Success</option>
          <option value="fail">Fail</option>
        </select>
        <input
          placeholder="Filter by model (partial ok)..."
          value={modelFilter}
          onChange={(e) => setModelFilter(e.target.value)}
        />
        <TimeRangeSelect value={range} onChange={setRange} />
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Project</th>
            <th>Model</th>
            <th>Status</th>
            <th>Cost</th>
            <th>Latency</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id}>
              <td>{new Date(t.timestamp).toLocaleString()}</td>
              <td>{capitalize(t.projectTag)}</td>
              <td>{capitalize(t.model)}</td>
              <td className={t.status === 'fail' ? 'status-fail' : 'status-success'}>
                {capitalize(t.status)}
              </td>
              <td>${t.costUsd?.toFixed(4) ?? '0.0000'}</td>
              <td>{t.latencyMs}ms</td>
              <td>
                <button className="btn-link" onClick={() => openDetail(t.id)}>View details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length === 0 && <p style={{ opacity: 0.6, marginTop: '1rem' }}>No traces match these filters.</p>}

      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
        <span style={{ fontSize: 13, opacity: 0.7 }}>Page {page} of {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>

      <TraceDetailModal trace={selected} onClose={() => setSelected(null)} onNavigate={openDetail} />
    </div>
  );
}
