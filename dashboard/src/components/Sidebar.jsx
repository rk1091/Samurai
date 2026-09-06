import { useEffect, useState } from 'react';
import { NavLink, useSearchParams, useLocation } from 'react-router-dom';
import { fetchProjects } from '../api';
import { capitalize } from '../utils';

const linkStyle = ({ isActive }) => ({
  display: 'block',
  padding: '0.55rem 0.9rem',
  borderRadius: 6,
  textDecoration: 'none',
  color: isActive ? '#fff' : '#9a9a9a',
  background: isActive ? '#242424' : 'transparent',
  marginBottom: 3,
  fontSize: 14,
});

export default function Sidebar() {
  const [projects, setProjects] = useState([]);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const activeProject = searchParams.get('project');

  useEffect(() => {
    fetchProjects().then(setProjects).catch(() => setProjects([]));
  }, []);

  return (
    <div style={{ width: 200, padding: '1.5rem 0.75rem', borderRight: '1px solid #222' }}>
      <h2 style={{ padding: '0 0.6rem', marginBottom: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
        Samurai
      </h2>

      <NavLink to="/" end style={linkStyle}>Overview</NavLink>
      <NavLink to="/traces" style={linkStyle}>All Traces</NavLink>

      <div style={{ marginTop: '1.5rem', padding: '0 0.6rem', fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Projects
      </div>
      <div style={{ marginTop: '0.5rem' }}>
        {projects.length === 0 && (
          <p style={{ padding: '0 0.6rem', fontSize: 12, color: '#666' }}>No traces yet</p>
        )}
        {projects.map((p) => {
          const isActive = location.pathname === '/traces' && activeProject === p.project;
          return (
            <NavLink
              key={p.project}
              to={`/traces?project=${encodeURIComponent(p.project)}`}
              style={() => linkStyle({ isActive })}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{capitalize(p.project)}</span>
                <span style={{ opacity: 0.5, fontSize: 12 }}>{p.traceCount}</span>
              </div>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
