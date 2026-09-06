import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function groupErrorRateByDay(traces) {
  const byDay = {};
  for (const t of traces) {
    const day = new Date(t.timestamp).toISOString().slice(0, 10);
    if (!byDay[day]) byDay[day] = { total: 0, failed: 0 };
    byDay[day].total += 1;
    if (t.status === 'fail') byDay[day].failed += 1;
  }
  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, { total, failed }]) => ({
      day,
      errorRate: Number(((failed / total) * 100).toFixed(1)),
    }));
}

export default function ErrorRateChart({ traces }) {
  const data = groupErrorRateByDay(traces);
  if (data.length === 0) return <p style={{ opacity: 0.6 }}>No data yet.</p>;

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3>Error rate over time</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="day" />
          <YAxis unit="%" />
          <Tooltip formatter={(v) => `${v}%`} />
          <Line type="monotone" dataKey="errorRate" stroke="#ff6b6b" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
