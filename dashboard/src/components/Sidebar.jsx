import { NavLink } from 'react-router-dom';

const linkStyle = ({ isActive }) => ({
  display: 'block',
  padding: '0.6rem 1rem',
  borderRadius: 6,
  textDecoration: 'none',
  color: isActive ? '#fff' : '#aaa',
  background: isActive ? '#2a2a2a' : 'transparent',
  marginBottom: 4,
});

export default function Sidebar() {
  return (
    <div style={{ width: 180, padding: '1.5rem 0.75rem', borderRight: '1px solid #222' }}>
      <h2 style={{ padding: '0 0.5rem', marginBottom: '1.5rem' }}>Samurai</h2>
      <NavLink to="/" end style={linkStyle}>Overview</NavLink>
      <NavLink to="/traces" style={linkStyle}>Traces</NavLink>
    </div>
  );
}
