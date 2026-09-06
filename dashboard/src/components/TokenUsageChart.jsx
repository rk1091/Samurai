import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function groupTokensByDay(traces) {
  const byDay = {};
  for (const t of traces) {
    const day = new Date(t.timestamp).toISOString().slice(0, 10);
    if (!byDay[day]) byDay[day] = { tokensIn: 0, tokensOut: 0 };
    byDay[day].tokensIn += t.tokensIn ?? 0;
    byDay[day].tokensOut += t.tokensOut ?? 0;
  }
  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, v]) => ({ day, ...v }));
}

export default function TokenUsageChart({ traces }) {
  const data = groupTokensByDay(traces);
  if (data.length === 0) return <p style={{ opacity: 0.6 }}>No data yet.</p>;

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3>Token usage over time</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="tokensIn" stackId="a" fill="#4f9eff" name="Input tokens" />
          <Bar dataKey="tokensOut" stackId="a" fill="#5fd77c" name="Output tokens" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
