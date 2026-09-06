import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Buckets latencies into fixed-width bins. Simple and readable at the
// data volumes this dashboard deals with — a proper percentile view
// (p50/p95/p99) would be the next step if trace volume grew large enough
// to make bucket edges misleading.
function bucketLatencies(traces) {
  if (traces.length === 0) return [];
  const bucketSize = 250; // ms
  const buckets = new Map();

  for (const t of traces) {
    const bucket = Math.floor(t.latencyMs / bucketSize) * bucketSize;
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a - b)
    .map(([bucket, count]) => ({ label: `${bucket}-${bucket + bucketSize}ms`, count }));
}

export default function LatencyHistogram({ traces }) {
  const data = bucketLatencies(traces);
  if (data.length === 0) return <p style={{ opacity: 0.6 }}>No data yet.</p>;

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3>Latency distribution</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="label" angle={-30} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#b28dff" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
