export default function SummaryCards({ summary }) {
  if (!summary) return null;

  const cards = [
    { label: 'Total Calls', value: summary.totalCalls },
    { label: 'Total Cost', value: `$${summary.totalCostUsd.toFixed(4)}` },
    { label: 'Failed Calls', value: summary.failCount },
    { label: 'Avg Latency', value: `${summary.avgLatencyMs} ms` },
  ];

  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
      {cards.map((c) => (
        <div
          key={c.label}
          style={{
            flex: 1,
            padding: '1rem',
            border: '1px solid #333',
            borderRadius: 8,
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.7 }}>{c.label}</div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}
