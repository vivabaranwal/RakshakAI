import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PublicDashboard from './pages/PublicDashboard';
import GovtDashboard from './pages/GovtDashboard';
import EnterpriseDashboard from './pages/EnterpriseDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/public" element={<PublicDashboard />} />
        <Route path="/govt" element={<GovtDashboard />} />
        <Route path="/enterprise" element={<EnterpriseDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
