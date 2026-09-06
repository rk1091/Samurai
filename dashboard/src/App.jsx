import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import Traces from './pages/Traces';

export default function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#111', color: '#eee', fontFamily: 'system-ui, sans-serif' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '1.5rem 2rem', maxWidth: 1000 }}>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/traces" element={<Traces />} />
        </Routes>
      </div>
    </div>
  );
}
