import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, Shield, UploadCloud, AlertTriangle, X, FileText
} from 'lucide-react';
import { useDocumentStore } from '../store/useDocumentStore';
import HighlightViewer from '../components/HighlightViewer';

function RiskFeed({ clauses, summary, riskScore, selected, onSelect }) {
    const avgFairness = 100 - riskScore;
    const textColor = riskScore > 60 ? 'text-red-400' : riskScore > 30 ? 'text-amber-400' : 'text-emerald-400';

    const shadowColor = riskScore > 60 ? 'rgba(239,68,68,0.6)' : riskScore > 30 ? 'rgba(251,191,36,0.6)' : 'rgba(52,211,153,0.6)';

    return (
        <div className="flex flex-col h-full bg-slate-950/50 border-r border-red-500/10 p-6 overflow-y-auto w-full custom-scrollbar">
            <div className="mb-6 pb-6 border-b border-red-500/10">
                <h2 className="text-xl font-bold font-mono text-slate-100 mb-2">Analysis Results</h2>
                <div className="flex items-center gap-3">
                    <span className={`text-3xl font-black ${textColor}`} style={{ filter: `drop-shadow(0 0 12px ${shadowColor})` }}>{avgFairness}</span>
                    <span className="text-xs text-slate-400 uppercase tracking-widest">/100 Fairness</span>
                </div>
                {summary && <p className="text-sm text-slate-400 mt-3 border-l-2 border-cyan-500/50 pl-3 lowercase font-mono">{summary}</p>}
            </div>

            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 font-mono">
                Identified Red Flags ({clauses.length})
            </h3>

            <div className="flex flex-col gap-3">
                {clauses.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm font-mono">No critical risks detected.</div>
                ) : (
                    clauses.map((c, i) => (
                        <button
                            key={i}
                            onClick={() => onSelect(selected?.text === c.text ? null : c)}
                            className={`w-full text-left rounded-lg p-4 border transition-all ${selected?.text === c.text
                                    ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                                    : 'bg-slate-900 border-red-500/10 hover:border-red-500/20'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${c.fairness_score < 40 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                                    }`}>
                                    {c.type}
                                </span>
                                <span className="text-xs font-mono text-slate-500">Score: {c.fairness_score}/100</span>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed mb-2">{c.explanation}</p>
                            <div className="bg-slate-950 p-2 rounded border border-slate-800 border-dashed">
                                <p className="text-[10px] text-slate-500 italic line-clamp-2 leading-tight">
                                    "{c.text}"
                                </p>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}

export default function PublicDashboard() {
    const navigate = useNavigate();
    const { activeFileUrl, clauses, riskScore, summary, setDocumentData, selectedClause, setSelectedClause, reset, setActiveFileUrl, setIsProcessing } = useDocumentStore();
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');

    const handleFile = (f) => {
        setError('');
        if (!f) return;
        if (!f.name.endsWith('.pdf')) { setError('Only PDF files are accepted.'); return; }
        setFile(f);
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault(); handleFile(e.dataTransfer.files[0]);
    }, []);

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true); setError('');
        
        // Show PDF early while processing
        setActiveFileUrl(URL.createObjectURL(file));
        setIsProcessing(true);

        const form = new FormData();
        form.append('file', file);
        form.append('mode', 'Public');
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/analyze`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const docId = res.data.doc_id;
            
            // Polling mechanism
            let isDone = false;
            while (!isDone) {
                await new Promise(r => setTimeout(r, 3000));
                const statusRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/status/${docId}`);
                const state = statusRes.data.status;
                
                if (state === 'COMPLETED') {
                    setDocumentData(URL.createObjectURL(file), statusRes.data.data.clauses, statusRes.data.data.risk_score, statusRes.data.data.analysis_summary);
                    isDone = true;
                } else if (state === 'FAILED' || state === 'error') {
                    setError('Analysis failed on server.');
                    setIsProcessing(false);
                    isDone = true;
                }
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Analysis request failed.');
            setIsProcessing(false);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="h-screen w-full bg-slate-950 text-slate-200 flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <header className="flex-none h-16 border-b border-red-500/10 bg-slate-950/80 px-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => { reset(); navigate('/'); }} className="flex items-center justify-center w-8 h-8 rounded hover:bg-slate-900 text-slate-400 hover:text-cyan-400 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-px h-6 bg-slate-800" />
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-cyan-500" />
                        <span className="font-bold tracking-wide text-slate-100 uppercase text-sm font-mono">Rakshak / Public Shield</span>
                    </div>
                </div>
                {activeFileUrl && (
                    <button onClick={() => { reset(); setFile(null); }} className="text-xs text-slate-400 hover:text-cyan-400 transition-colors uppercase tracking-wider font-mono">
                        [ New Scan ]
                    </button>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden">
                {!activeFileUrl ? (
                    // Upload State
                    <div className="w-full h-full flex items-center justify-center p-6 relative">
                        {/* Background flare */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />

                        <div className="w-full max-w-lg bg-slate-900/50 border border-red-500/20 p-8 rounded-xl backdrop-blur-sm z-10 shadow-2xl">
                            <h1 className="text-2xl font-bold text-slate-100 mb-2 font-mono">Initialize Scan</h1>
                            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                                Upload a legal document to detect unfair terms, hidden penalties, and predatory clauses using our Cyber-Legal AI matrix.
                            </p>

                            <div
                                onDrop={handleDrop}
                                onDragOver={e => e.preventDefault()}
                                onClick={() => !file && document.getElementById('pub-file').click()}
                                className={`border border-dashed rounded-lg p-10 flex flex-col items-center gap-4 transition-all cursor-pointer bg-slate-950/50
                                  ${file ? 'border-cyan-500/40 text-cyan-400' : 'border-red-500/20 hover:border-red-500/40 text-slate-500 hover:text-slate-300'}`}
                            >
                                <input id="pub-file" type="file" accept=".pdf" className="hidden" onChange={e => handleFile(e.target.files[0])} />
                                {file ? (
                                    <>
                                        <FileText className="w-10 h-10" />
                                        <div className="text-center">
                                            <p className="text-sm font-mono text-cyan-400 mb-1">{file.name}</p>
                                            <button onClick={e => { e.stopPropagation(); setFile(null); }} className="text-[10px] text-slate-500 hover:text-red-400 uppercase tracking-widest transition-colors flex items-center justify-center gap-1 mx-auto mt-2">
                                                <X className="w-3 h-3" /> Remove File
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="w-10 h-10 opacity-50" />
                                        <p className="text-sm text-center font-mono uppercase tracking-wider">
                                            Drop PDF here <br />
                                            <span className="text-[10px] text-slate-600 mt-2 block normal-case">or click to browse filesystem</span>
                                        </p>
                                    </>
                                )}
                            </div>

                            {error && (
                                <div className="mt-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded p-3 font-mono">
                                    <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
                                </div>
                            )}

                            {uploading && (
                                <div className="mt-6 w-full h-1 bg-cyan-950 rounded overflow-hidden relative">
                                    <div className="absolute top-0 left-0 h-full bg-cyan-400 shadow-[0_0_15px_#22d3ee] w-1/4 animate-[laserScan_2s_linear_infinite]" />
                                </div>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                className="w-full mt-6 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-400 font-mono text-sm uppercase tracking-widest py-4 rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                            >
                                {uploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                                        Laser Scanning...
                                    </>
                                ) : 'Execute Analysis'}
                            </button>
                        </div>
                    </div>
                ) : (
                    // Split-Screen State
                    <div className="w-full h-full grid grid-cols-5 bg-slate-900">
                        {/* Left Column: Risk Feed (40%) */}
                        <div className="col-span-2 relative z-10 shadow-[5px_0_25px_rgba(0,0,0,0.5)] h-[calc(100vh-64px)] overflow-hidden">
                            <RiskFeed
                                clauses={clauses}
                                summary={summary}
                                riskScore={riskScore}
                                selected={selectedClause}
                                onSelect={setSelectedClause}
                            />
                        </div>

                        {/* Right Column: PDF Viewer (60%) */}
                        <div className="col-span-3 h-[calc(100vh-64px)] relative bg-slate-800">
                            <HighlightViewer />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
