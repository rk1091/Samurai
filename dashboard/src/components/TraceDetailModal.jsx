import ChainTreeView from './ChainTreeView';

export default function TraceDetailModal({ trace, onClose, onNavigate }) {
  if (!trace) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#181818', border: '1px solid #333', borderRadius: 8,
          padding: '1.5rem', width: 620, maxHeight: '85vh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h3>Trace detail</h3>
          <button onClick={onClose}>Close</button>
        </div>

        <p><strong>Status:</strong> {trace.status}</p>
        <p><strong>Model:</strong> {trace.model}</p>
        <p><strong>Cost:</strong> ${trace.costUsd?.toFixed(4) ?? '0.0000'}</p>
        <p><strong>Latency:</strong> {trace.latencyMs} ms</p>
        <p><strong>Tokens:</strong> {trace.tokensIn ?? 0} in / {trace.tokensOut ?? 0} out</p>

        <h4>Prompt (full, untruncated)</h4>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#111', padding: 8, borderRadius: 4 }}>
          {trace.prompt}
        </pre>

        {trace.response && (
          <>
            <h4>Response (full, untruncated)</h4>
            <pre style={{ whiteSpace: 'pre-wrap', background: '#111', padding: 8, borderRadius: 4 }}>
              {trace.response}
            </pre>
          </>
        )}

        {trace.errorMessage && (
          <>
            <h4 style={{ color: '#ff6b6b' }}>Error</h4>
            <pre style={{ whiteSpace: 'pre-wrap', color: '#ff6b6b' }}>{trace.errorMessage}</pre>
          </>
        )}

        <ChainTreeView trace={trace} onSelectId={onNavigate} />
      </div>
    </div>
  );
}
