import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Eye, UploadCloud, AlertTriangle, CheckCircle2, FileText, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

function PageShell({ icon: Icon, gradient, title, subtitle, children }) {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-[#0a0f1e] dot-grid text-white">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-600/8 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-xl`}>
                        <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black">{title}</h1>
                        <p className="text-white/40 text-sm mt-0.5">{subtitle}</p>
                    </div>
                </div>

                {children}
            </div>
        </div>
    );
}

function UploadZone({ onResult, accentColor = 'violet' }) {
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');

    const accents = {
        violet: {
            border: 'border-violet-500/30 hover:border-violet-400/60',
            icon: 'bg-violet-500/10 text-violet-400',
            btn: 'bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400',
        },
        emerald: {
            border: 'border-emerald-500/30 hover:border-emerald-400/60',
            icon: 'bg-emerald-500/10 text-emerald-400',
            btn: 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400',
        },
    };
    const ac = accents[accentColor];

    const handleFile = (f) => {
        setError('');
        if (!f) return;
        if (!f.name.endsWith('.pdf')) { setError('Only PDF files are accepted.'); return; }
        if (f.size > 15 * 1024 * 1024) { setError('File must be under 15MB.'); return; }
        setFile(f);
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files[0]);
    }, []);

    const handleSubmit = async () => {
        if (!file) return;
        setUploading(true);
        setError('');
        const form = new FormData();
        form.append('file', file);
        form.append('mode', 'Public');
        try {
            const res = await axios.post(`${API_URL}/analyze`, form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const docId = res.data.doc_id;

            let isDone = false;
            while (!isDone) {
                await new Promise(r => setTimeout(r, 3000));
                const statusRes = await axios.get(`${API_URL}/status/${docId}`);
                const state = statusRes.data.status;
                if (state === 'COMPLETED') {
                    onResult(statusRes.data.data);
                    isDone = true;
                } else if (state === 'FAILED' || state === 'error') {
                    setError('Analysis failed on server.');
                    isDone = true;
                }
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Upload failed. Check that the backend is running.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => !file && document.getElementById('file-input').click()}
                className={`glass rounded-2xl border-2 border-dashed ${ac.border} p-12 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer ${file ? '' : 'hover:bg-white/[0.02]'}`}
            >
                <input id="file-input" type="file" accept=".pdf" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />

                {file ? (
                    <div className="flex flex-col items-center gap-3 text-center">
                        <div className={`w-14 h-14 rounded-xl ${ac.icon} flex items-center justify-center`}>
                            <FileText className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="font-semibold text-white">{file.name}</p>
                            <p className="text-white/40 text-sm">{(file.size / 1024).toFixed(1)} KB · PDF</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors mt-1">
                            <X className="w-3.5 h-3.5" /> Remove
                        </button>
                    </div>
                ) : (
                    <>
                        <div className={`w-14 h-14 rounded-xl ${ac.icon} flex items-center justify-center`}>
                            <UploadCloud className="w-7 h-7" />
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-white">Drop your PDF here</p>
                            <p className="text-white/40 text-sm mt-1">or click to browse · Max 15MB</p>
                        </div>
                    </>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl px-4 py-3">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={!file || uploading}
                className={`${ac.btn} text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-lg`}
            >
                {uploading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analysing with AI...
                    </>
                ) : 'Analyse Document'}
            </button>
        </div>
    );
}

function ResultCard({ result }) {
    const fair = 100 - result.risk_score;
    const riskColor = result.risk_score > 60 ? 'text-rose-400' : result.risk_score > 30 ? 'text-amber-400' : 'text-emerald-400';
    const barColor = result.risk_score > 60 ? 'bg-rose-500' : result.risk_score > 30 ? 'bg-amber-500' : 'bg-emerald-500';

    return (
        <div className="glass rounded-2xl border border-white/8 p-6 flex flex-col gap-6 animate-fade-up">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="font-semibold">Analysis Complete</span>
                </div>
                <span className={`text-2xl font-black ${riskColor}`}>{fair}/100 <span className="text-sm font-normal text-white/40">Fairness</span></span>
            </div>

            <div>
                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full transition-all duration-1000`} style={{ width: `${Math.max(3, fair)}%` }} />
                </div>
            </div>

            {result.clauses.length > 0 ? (
                <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Flagged Clauses ({result.clauses.length})</h3>
                    {result.clauses.map((c, i) => (
                        <div key={i} className="bg-rose-500/5 border border-rose-500/15 rounded-xl p-4 flex flex-col gap-1.5">
                            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">{c.type}</span>
                            <p className="text-sm text-white/80">{c.text.slice(0, 180)}{c.text.length > 180 ? '…' : ''}</p>
                            <p className="text-xs text-white/40 mt-1 italic">{c.explanation}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-6 text-white/30 text-sm">No critical clauses detected 🎉</div>
            )}
        </div>
    );
}

export { PageShell, UploadZone, ResultCard };
