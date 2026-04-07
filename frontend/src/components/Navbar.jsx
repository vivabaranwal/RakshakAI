import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Plus } from 'lucide-react';
import { useDocumentStore } from '../store/useDocumentStore';

export default function Navbar() {
    const location = useLocation();
    const { activeFileUrl, reset } = useDocumentStore();

    const handleNewScan = () => {
        reset();
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Public Shield', path: '/public' },
        { name: 'About', path: '/about' },
        { name: 'Contact Us', path: '/contact' },
    ];

    return (
        <nav className="fixed top-0 left-0 w-full h-16 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all">
                    <Shield className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="font-bold tracking-wide text-slate-100 uppercase text-sm font-mono group-hover:text-cyan-400 transition-colors">
                    Rakshak AI
                </span>
            </Link>

            {/* Links */}
            <div className="flex items-center gap-6">
                {navLinks.map((link) => (
                    <motion.div
                        key={link.name}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link
                            to={link.path}
                            className={`text-sm font-mono tracking-wide transition-all ${
                                location.pathname === link.path
                                    ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            {link.name}
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Right Side / New Scan */}
            <div className="flex items-center">
                {location.pathname === '/public' && activeFileUrl && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleNewScan}
                        className="flex items-center gap-2 bg-slate-800/80 hover:bg-cyan-900/40 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 transition-all px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-widest shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
                    >
                        <Plus className="w-3.5 h-3.5" /> New Scan
                    </motion.button>
                )}
            </div>
        </nav>
    );
}
