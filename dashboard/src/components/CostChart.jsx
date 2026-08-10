import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Groups raw trace rows into per-day cost totals. Done client-side since
// at this scale (a few hundred rows) it's simpler than adding a dedicated
// backend aggregation endpoint — see samurai.service.ts costSummary() for
// the same tradeoff reasoning.
function groupByDay(traces) {
  const byDay = {};
  for (const t of traces) {
    const day = new Date(t.timestamp).toISOString().slice(0, 10);
    byDay[day] = (byDay[day] ?? 0) + (t.costUsd ?? 0);
  }
  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, cost]) => ({ day, cost: Number(cost.toFixed(4)) }));
}

export default function CostChart({ traces }) {
  const data = groupByDay(traces);

  if (data.length === 0) {
    return <p style={{ opacity: 0.6 }}>No trace data yet — run an example script.</p>;
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3>Cost over time</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip formatter={(v) => `$${v}`} />
          <Line type="monotone" dataKey="cost" stroke="#4f9eff" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
