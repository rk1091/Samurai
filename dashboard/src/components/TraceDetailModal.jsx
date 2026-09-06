import ChainTreeView from './ChainTreeView';
import { capitalize } from '../utils';

export default function TraceDetailModal({ trace, onClose, onNavigate }) {
  if (!trace) return null;

  return (
    <div onClick={onClose} className="modal-backdrop">
      <div onClick={(e) => e.stopPropagation()} className="modal-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Trace detail</h3>
          <button className="btn-ghost" onClick={onClose}>Close</button>
        </div>

        <div className="detail-grid">
          <div><span className="detail-label">Status</span> {capitalize(trace.status)}</div>
          <div><span className="detail-label">Model</span> {capitalize(trace.model)}</div>
          <div><span className="detail-label">Cost</span> ${trace.costUsd?.toFixed(4) ?? '0.0000'}</div>
          <div><span className="detail-label">Latency</span> {trace.latencyMs} ms</div>
          <div><span className="detail-label">Tokens</span> {trace.tokensIn ?? 0} in / {trace.tokensOut ?? 0} out</div>
        </div>

        <h4>Prompt (full, untruncated)</h4>
        <pre className="code-block">{trace.prompt}</pre>

        {trace.response && (
          <>
            <h4>Response (full, untruncated)</h4>
            <pre className="code-block">{trace.response}</pre>
          </>
        )}

        {trace.errorMessage && (
          <>
            <h4 style={{ color: '#ff6b6b' }}>Error</h4>
            <pre className="code-block" style={{ color: '#ff6b6b' }}>{trace.errorMessage}</pre>
          </>
        )}

        <ChainTreeView trace={trace} onSelectId={onNavigate} />
      </div>
    </div>
  );
}
