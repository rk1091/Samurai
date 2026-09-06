const nodeStyle = (highlight) => ({
  padding: '0.5rem 0.75rem',
  border: `1px solid ${highlight ? '#4f9eff' : '#333'}`,
  borderRadius: 6,
  marginBottom: 6,
  background: highlight ? '#1a2536' : '#181818',
  fontSize: 13,
});

export default function ChainTreeView({ trace, onSelectId }) {
  if (!trace.parent && (!trace.children || trace.children.length === 0)) {
    return <p style={{ opacity: 0.6, fontSize: 13 }}>Not part of a multi-step chain.</p>;
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <h4>Chain</h4>
      {trace.parent && (
        <div onClick={() => onSelectId(trace.parent.id)} style={{ ...nodeStyle(false), cursor: 'pointer' }}>
          ↑ Parent — {trace.parent.model} ({trace.parent.status})
        </div>
      )}
      <div style={nodeStyle(true)}>
        ● This trace — {trace.model} ({trace.status})
      </div>
      {trace.children?.map((c) => (
        <div
          key={c.id}
          onClick={() => onSelectId(c.id)}
          style={{ ...nodeStyle(false), marginLeft: '1.5rem', cursor: 'pointer' }}
        >
          ↓ Child — {c.model} ({c.status})
        </div>
      ))}
    </div>
  );
}
