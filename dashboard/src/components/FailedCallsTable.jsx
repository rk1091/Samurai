export default function FailedCallsTable({ traces }) {
  const failed = traces.filter((t) => t.status === 'fail');

  return (
    <div>
      <h3>Failed calls ({failed.length})</h3>
      {failed.length === 0 ? (
        <p style={{ opacity: 0.6 }}>No failures recorded.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #333' }}>
              <th style={{ padding: 8 }}>Time</th>
              <th style={{ padding: 8 }}>Project</th>
              <th style={{ padding: 8 }}>Prompt</th>
              <th style={{ padding: 8 }}>Error</th>
            </tr>
          </thead>
          <tbody>
            {failed.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: 8 }}>
                  {new Date(t.timestamp).toLocaleString()}
                </td>
                <td style={{ padding: 8 }}>{t.projectTag}</td>
                <td style={{ padding: 8, maxWidth: 300 }}>
                  {t.prompt?.slice(0, 60)}
                  {t.prompt?.length > 60 ? '…' : ''}
                </td>
                <td style={{ padding: 8, color: '#ff6b6b' }}>
                  {t.errorMessage?.slice(0, 80)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
