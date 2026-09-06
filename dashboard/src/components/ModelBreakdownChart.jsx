import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ModelBreakdownChart({ data }) {
  if (!data || data.length === 0) {
    return <p style={{ opacity: 0.6 }}>No model data yet.</p>;
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3>Cost by model</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="model" />
          <YAxis />
          <Tooltip formatter={(v) => `$${v}`} />
          <Bar dataKey="costUsd" fill="#4f9eff" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
