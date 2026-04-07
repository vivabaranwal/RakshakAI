import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import PublicDashboard from './pages/PublicDashboard';
import GovtDashboard from './pages/GovtDashboard';
import EnterpriseDashboard from './pages/EnterpriseDashboard';
import About from './pages/About';
import Contact from './pages/Contact';

function App() {
  return (
    <BrowserRouter>
      {/* Global Navbar */}
      <Navbar />
      
      {/* Page Content */}
      <div className="w-full min-h-screen">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/public" element={<PublicDashboard />} />
          <Route path="/govt" element={<GovtDashboard />} />
          <Route path="/enterprise" element={<EnterpriseDashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
