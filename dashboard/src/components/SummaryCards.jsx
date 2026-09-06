export default function SummaryCards({ summary }) {
  if (!summary) return null;

  const cards = [
    { label: 'Total Calls', value: summary.totalCalls },
    { label: 'Total Cost', value: `$${summary.totalCostUsd.toFixed(4)}` },
    { label: 'Failed Calls', value: summary.failCount },
    { label: 'Avg Latency', value: `${summary.avgLatencyMs} ms` },
  ];

  return (
    <div className="summary-cards">
      {cards.map((c) => (
        <div key={c.label} className="summary-card">
          <div className="label">{c.label}</div>
          <div className="value">{c.value}</div>
        </div>
      ))}
    </div>
  );
}
