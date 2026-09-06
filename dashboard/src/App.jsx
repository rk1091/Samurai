import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import Traces from './pages/Traces';

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/traces" element={<Traces />} />
        </Routes>
      </div>
    </div>
  );
}
