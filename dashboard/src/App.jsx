import { useEffect, useState } from 'react';
import { fetchTraces, fetchSummary } from './api';
import SummaryCards from './components/SummaryCards';
import CostChart from './components/CostChart';
import FailedCallsTable from './components/FailedCallsTable';

export default function App() {
  const [traces, setTraces] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const [t, s] = await Promise.all([fetchTraces(), fetchSummary()]);
      setTraces(t);
      setSummary(s);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div
      style={{
        fontFamily: 'system-ui, sans-serif',
        maxWidth: 900,
        margin: '2rem auto',
        padding: '0 1rem',
        color: '#eee',
        background: '#111',
        minHeight: '100vh',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Samurai</h1>
        <button onClick={load} style={{ padding: '0.5rem 1rem' }}>
          Refresh
        </button>
      </div>

      {loading && <p>Loading…</p>}
      {error && (
        <p style={{ color: '#ff6b6b' }}>
          Couldn't reach the API — is `npm run start:dev` running in the backend? ({error})
        </p>
      )}

      {!loading && !error && (
        <>
          <SummaryCards summary={summary} />
          <CostChart traces={traces} />
          <FailedCallsTable traces={traces} />
        </>
      )}
    </div>
  );
}
