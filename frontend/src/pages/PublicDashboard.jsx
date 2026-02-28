import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, Shield, UploadCloud, AlertTriangle, CheckCircle2,
    FileText, X, ChevronDown, Volume2
} from 'lucide-react';
import { useDocumentStore } from '../store/useDocumentStore';
import HighlightViewer from '../components/HighlightViewer';

function RiskBar({ score }) {
    const fair = 100 - score;
    const color = score > 60 ? 'bg-rose-500' : score > 30 ? 'bg-amber-500' : 'bg-emerald-500';
    const label = score > 60 ? 'text-rose-400' : score > 30 ? 'text-amber-400' : 'text-emerald-400';
    return (
        <div className="glass border border-white/8 rounded-2xl p-6">
            <div className="flex justify-between items-baseline mb-3">
                <span className="text-sm font-semibold text-white/50 uppercase tracking-wider">Fairness Score</span>
                <span className={`text-4xl font-black ${label}`}>{fair}<span className="text-base font-normal text-white/30">/100</span></span>
            </div>
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${Math.max(3, fair)}%` }} />
            </div>
            <p className="text-xs text-white/30 mt-2">
                {score > 60 ? '⚠️ High Risk — review carefully before signing.' : score > 30 ? '⚡ Moderate Risk — some clauses need attention.' : '✅ Low Risk — document appears fair.'}
            </p>
        </div>
    );
}

function ClauseList({ clauses, onSelect, selected }) {
    return (
        <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">
                Red Flags ({clauses.length})
            </h3>
            {clauses.length === 0 && (
                <div className="text-center py-8 text-white/25 text-sm">No critical clauses found.</div>
            )}
            {clauses.map((c, i) => (
                <button
                    key={i}
                    onClick={() => onSelect(selected?.text === c.text ? null : c)}
                    className={`w-full text-left rounded-xl border px-4 py-3 transition-all ${selected?.text === c.text
                        ? 'border-rose-500/50 bg-rose-500/10'
                        : 'border-white/8 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/15'
                        }`}
                >
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-rose-400 uppercase tracking-widest">{c.type}</span>
                        <span className="text-[10px] text-white/20">Pg {c.page}</span>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed line-clamp-2">{c.text}</p>
                </button>
            ))}
        </div>
    );
}

function ExplanationModal({ clause, onClose }) {
    if (!clause) return null;
    const speak = () => {
        const u = new SpeechSynthesisUtterance(clause.explanation);
        window.speechSynthesis.speak(u);
    };
    return (
        <div className="animate-fade-up glass border border-rose-500/20 rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">{clause.type}</span>
                <button onClick={onClose} className="text-white/20 hover:text-white/60 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">{clause.explanation}</p>
            <button onClick={speak} className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors w-fit">
                <Volume2 className="w-3.5 h-3.5" /> Read aloud
            </button>
        </div>
    );
}

export default function PublicDashboard() {
    const navigate = useNavigate();
    const { activeFileUrl, clauses, riskScore, setDocumentData, selectedClause, setSelectedClause } = useDocumentStore();
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');

    const handleFile = (f) => {
        setError('');
        if (!f) return;
        if (!f.name.endsWith('.pdf')) { setError('Only PDF files are accepted.'); return; }
        if (f.size > 15 * 1024 * 1024) { setError('File must be under 15 MB.'); return; }
        setFile(f);
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault(); handleFile(e.dataTransfer.files[0]);
    }, []);

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true); setError('');
        const form = new FormData();
        form.append('file', file);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/upload`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setDocumentData(URL.createObjectURL(file), res.data.clauses, res.data.risk_score);
        } catch (err) {
            setError(err.response?.data?.detail || 'Upload failed. Is the backend running?');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0f1e] dot-grid text-white flex flex-col">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-15%] right-[-5%] w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[100px]" />
            </div>

            {/* Nav */}
            <header className="relative z-10 px-6 py-5 flex items-center gap-4 max-w-7xl mx-auto w-full">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Home
                </button>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="font-bold">Public Shield</span>
                </div>
            </header>

            <main className="relative z-10 flex-1 flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full px-6 pb-8">

                {/* Left Sidebar */}
                <div className="w-full lg:w-[360px] flex-shrink-0 flex flex-col gap-4">
                    {!activeFileUrl ? (
                        <div className="glass rounded-2xl border border-white/8 p-6 flex flex-col gap-5">
                            <h1 className="text-xl font-bold">Scan Your Document</h1>
                            <p className="text-white/40 text-sm leading-relaxed">Upload a rental agreement, freelance contract, or any legal document to detect unfair terms instantly.</p>

                            <div
                                onDrop={handleDrop}
                                onDragOver={e => e.preventDefault()}
                                onClick={() => !file && document.getElementById('pub-file').click()}
                                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-all cursor-pointer
                  ${file ? 'border-blue-500/40 bg-blue-500/5' : 'border-white/10 hover:border-white/25 hover:bg-white/[0.02]'}`}
                            >
                                <input id="pub-file" type="file" accept=".pdf" className="hidden" onChange={e => handleFile(e.target.files[0])} />
                                {file ? (
                                    <>
                                        <FileText className="w-8 h-8 text-blue-400" />
                                        <p className="text-sm font-semibold text-white">{file.name}</p>
                                        <button onClick={e => { e.stopPropagation(); setFile(null); }} className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1 transition-colors">
                                            <X className="w-3 h-3" /> Remove
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="w-8 h-8 text-white/20" />
                                        <p className="text-sm text-white/40 text-center">Drop PDF here<br /><span className="text-xs">or click to browse · Max 15MB</span></p>
                                    </>
                                )}
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl px-3 py-2.5">
                                    <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
                                </div>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                            >
                                {uploading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scanning…</> : 'Analyse Document'}
                            </button>
                        </div>
                    ) : (
                        <>
                            <RiskBar score={riskScore} />
                            <div className="glass border border-white/8 rounded-2xl p-5 flex-1 overflow-y-auto">
                                <ClauseList clauses={clauses} onSelect={setSelectedClause} selected={selectedClause} />
                            </div>
                            {selectedClause && <ExplanationModal clause={selectedClause} onClose={() => setSelectedClause(null)} />}
                            <button onClick={() => { setDocumentData(null, [], 0); setFile(null); }} className="text-xs text-white/25 hover:text-white/50 transition-colors mx-auto mt-1">
                                ← Scan another document
                            </button>
                        </>
                    )}
                </div>

                {/* Right: PDF Viewer */}
                <div className="flex-1 glass border border-white/8 rounded-2xl overflow-hidden min-h-[500px] flex items-center justify-center">
                    {!activeFileUrl ? (
                        <div className="text-center text-white/20 flex flex-col items-center gap-4 p-12">
                            <Shield className="w-16 h-16 opacity-30" />
                            <p>Your analysed document will appear here with<br />red highlights over risky clauses.</p>
                        </div>
                    ) : (
                        <HighlightViewer />
                    )}
                </div>
            </main>
        </div>
    );
}
