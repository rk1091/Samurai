import { useEffect, useState } from 'react';
import { fetchSummary, fetchModelBreakdown, fetchChartData } from '../api';
import SummaryCards from '../components/SummaryCards';
import CostChart from '../components/CostChart';
import ModelBreakdownChart from '../components/ModelBreakdownChart';
import LatencyHistogram from '../components/LatencyHistogram';
import ErrorRateChart from '../components/ErrorRateChart';
import TokenUsageChart from '../components/TokenUsageChart';
import TimeRangeSelect from '../components/TimeRangeSelect';

export default function Overview() {
  const [summary, setSummary] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [chartTraces, setChartTraces] = useState([]);
  const [range, setRange] = useState('');
  const [error, setError] = useState(null);

  async function load() {
    try {
      const [s, b, t] = await Promise.all([
        fetchSummary(),
        fetchModelBreakdown(),
        fetchChartData({ range }),
      ]);
      setSummary(s);
      setBreakdown(b);
      setChartTraces(t);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, [range]);

  if (error) return <p style={{ color: '#ff6b6b' }}>{error}</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Overview</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <TimeRangeSelect value={range} onChange={setRange} />
          <button onClick={load}>Refresh</button>
        </div>
      </div>
      <SummaryCards summary={summary} />
      <CostChart traces={chartTraces} />
      <ModelBreakdownChart data={breakdown} />
      <LatencyHistogram traces={chartTraces} />
      <ErrorRateChart traces={chartTraces} />
      <TokenUsageChart traces={chartTraces} />
    </div>
  );
}
