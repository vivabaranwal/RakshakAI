import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Workspace from './pages/Workspace';
import About from './pages/About';
import Contact from './pages/Contact';

export default function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <div className="min-h-screen w-full bg-latte-bg">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/personal" element={<Workspace mode="Personal" />} />
                    <Route path="/enterprise" element={<Workspace mode="Enterprise" />} />
                    <Route path="/govt" element={<Workspace mode="Govt" />} />
                    {/* Legacy path from the earlier build */}
                    <Route path="/public" element={<Navigate to="/personal" replace />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}
