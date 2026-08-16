import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UploadCloud, AlertTriangle, X, FileText, RotateCcw, ArrowLeft } from 'lucide-react';

import { api, errorMessage, fileUrl } from '../lib/api';
import { useDocumentStore } from '../store/useDocumentStore';
import HighlightViewer from '../components/HighlightViewer';
import LegalAssistant from '../components/LegalAssistant';
import RiskFeed from '../components/RiskFeed';

const POLL_MS = 2500;
const POLL_TIMEOUT_MS = 3 * 60 * 1000;

const MODE_COPY = {
    Personal: {
        heading: 'Personal Shield',
        blurb: 'Upload a rental agreement, offer letter, loan document, or any contract you have been asked to sign. Rakshak AI checks it against Indian law and explains the risks in plain language.',
        accent: 'blue',
    },
    Enterprise: {
        heading: 'Enterprise Engine',
        blurb: 'Review commercial contracts for lopsided indemnity, liability, IP and payment terms — benchmarked against the Indian Contract Act, MSMED Act and DPDP Act.',
        accent: 'emerald',
    },
    Govt: {
        heading: 'Govt Watchdog',
        blurb: 'Audit tenders and procurement documents against GFR 2017, CVC guidelines and the Competition Act, 2002 for irregularities and collusion indicators.',
        accent: 'violet',
    },
};

// All three personas share the latte accent; the mode is named in the header
// rather than colour-coded, so the palette stays coherent.
const LATTE_ACCENT = {
    ring: 'border-latte-accent',
    btn: 'bg-latte-ink border-latte-ink hover:bg-latte-accent hover:border-latte-accent',
    text: 'text-latte-accent',
};
const ACCENT = {
    blue: LATTE_ACCENT,
    emerald: LATTE_ACCENT,
    violet: LATTE_ACCENT,
};

export default function Workspace({ mode }) {
    const navigate = useNavigate();
    const {
        docId, activeFileUrl, clauses, riskScore, summary, title, isProcessing, error,
        setDocumentData, selectedClause, setSelectedClause, reset,
        setActiveFileUrl, setIsProcessing, setDocId, setMode, setError,
    } = useDocumentStore();

    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const cancelled = useRef(false);

    const copy = MODE_COPY[mode] ?? MODE_COPY.Personal;
    const accent = ACCENT[copy.accent];

    useEffect(() => { setMode(mode); }, [mode, setMode]);

    // Cancel any in-flight polling when leaving the page.
    useEffect(() => {
        cancelled.current = false;
        return () => { cancelled.current = true; };
    }, []);

    const poll = useCallback(async (id, url) => {
        const started = Date.now();
        while (!cancelled.current) {
            if (Date.now() - started > POLL_TIMEOUT_MS) {
                setError('Analysis is taking longer than expected. Please try again.');
                return;
            }
            await new Promise((r) => setTimeout(r, POLL_MS));
            if (cancelled.current) return;
            try {
                const { data } = await api.get(`/status/${id}`);
                if (data.status === 'COMPLETED') {
                    setDocumentData({
                        url,
                        clauses: data.data.clauses,
                        riskScore: data.data.risk_score,
                        summary: data.data.analysis_summary,
                        title: data.data.title,
                        docId: id,
                    });
                    return;
                }
                if (data.status === 'FAILED') {
                    setError(data.error || 'Analysis failed.');
                    return;
                }
            } catch (err) {
                setError(errorMessage(err, 'Lost connection while checking analysis status.'));
                return;
            }
        }
    }, [setDocumentData, setError]);

    // Restore a previous session on refresh.
    useEffect(() => {
        if (!docId || activeFileUrl) return;
        const url = fileUrl(docId);
        setActiveFileUrl(url);
        setIsProcessing(true);

        api.get(`/status/${docId}`)
            .then(({ data }) => {
                if (data.status === 'COMPLETED') {
                    setDocumentData({
                        url,
                        clauses: data.data.clauses,
                        riskScore: data.data.risk_score,
                        summary: data.data.analysis_summary,
                        title: data.data.title,
                        docId,
                    });
                } else if (data.status === 'PROCESSING' || data.status === 'PENDING') {
                    poll(docId, url);
                } else {
                    reset();
                }
            })
            .catch(() => reset());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const pickFile = (f) => {
        setError('');
        if (!f) return;
        if (!f.name.toLowerCase().endsWith('.pdf')) {
            setError('Only PDF files are supported.');
            return;
        }
        if (f.size > 15 * 1024 * 1024) {
            setError('That file is larger than 15 MB.');
            return;
        }
        setFile(f);
    };

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        pickFile(e.dataTransfer.files[0]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const upload = async () => {
        if (!file) return;
        setUploading(true);
        setError('');
        setIsProcessing(true);

        const form = new FormData();
        form.append('file', file);
        form.append('mode', mode);

        try {
            const { data } = await api.post('/analyze', form);
            const id = data.doc_id;
            setDocId(id);
            const url = fileUrl(id);
            setActiveFileUrl(url);
            await poll(id, url);
        } catch (err) {
            setError(errorMessage(err, 'Could not start the analysis.'));
        } finally {
            setUploading(false);
        }
    };

    const startOver = () => { reset(); setFile(null); };

    // ---------- Upload view ----------
    if (!activeFileUrl) {
        return (
            <div className="min-h-screen bg-latte-bg dot-grid pt-16">
                <div className="mx-auto flex max-w-xl flex-col px-6 py-14 animate-fadeIn">
                    <button
                        onClick={() => navigate('/')}
                        className="mb-8 flex w-fit items-center gap-2 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-latte-subtext transition-colors hover:text-latte-ink"
                    >
                        <ArrowLeft className="h-3 w-3" /> All modes
                    </button>

                    <h1 className="font-serif text-5xl font-medium uppercase tracking-widest text-latte-ink">{copy.heading}</h1>

                    <div className="w-full h-[1.5px] bg-latte-ink my-6" />

                    <p className="font-serif text-lg italic leading-relaxed text-latte-subtext">{copy.blurb}</p>

                    <div
                        onDrop={onDrop}
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onClick={() => !file && document.getElementById('rakshak-file')?.click()}
                        className={`mt-8 flex cursor-pointer flex-col items-center gap-4 rounded-none border-2 border-dashed p-14 transition-colors duration-200
                            ${dragging || file ? `${accent.ring} bg-latte-surface` : 'border-latte-muted bg-latte-surface hover:border-latte-ink'}`}
                    >
                        <input
                            id="rakshak-file" type="file" accept="application/pdf,.pdf"
                            className="hidden"
                            onChange={(e) => pickFile(e.target.files[0])}
                        />
                        {file ? (
                            <>
                                <FileText className="h-8 w-8 text-latte-ink" strokeWidth={1.5} />
                                <div className="text-center">
                                    <p className="max-w-[280px] truncate font-sans text-sm font-medium text-latte-ink">{file.name}</p>
                                    <p className="mt-1 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-latte-subtext">
                                        {file.size < 1024 * 1024
                                            ? `${Math.max(1, Math.round(file.size / 1024))} KB`
                                            : `${(file.size / 1024 / 1024).toFixed(2)} MB`}
                                    </p>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                        className="mx-auto mt-3 flex items-center gap-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-latte-subtext transition-colors hover:text-red-900"
                                    >
                                        <X className="h-3 w-3" /> Remove
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <UploadCloud className="h-8 w-8 text-latte-muted" strokeWidth={1.5} />
                                <div className="text-center">
                                    <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-latte-ink">
                                        Drop your PDF here
                                    </p>
                                    <p className="mt-2 font-serif text-sm italic text-latte-subtext">or click to browse · max 15 MB</p>
                                </div>
                            </>
                        )}
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                            className="mt-4 flex items-start gap-2 rounded-none border border-red-800 bg-red-100 p-3 font-sans text-xs text-red-900"
                        >
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    <button
                        onClick={upload}
                        disabled={!file || uploading}
                        className={`mt-8 flex items-center justify-center gap-2.5 rounded-none border-2 px-8 py-3.5
                            font-sans text-xs font-semibold uppercase tracking-[0.2em] text-latte-bg
                            transition-colors duration-200
                            ${accent.btn} disabled:cursor-not-allowed disabled:border-latte-muted
                            disabled:bg-latte-muted disabled:text-latte-subtext`}
                    >
                        {uploading && (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-latte-bg/30 border-t-latte-bg" />
                        )}
                        {uploading ? 'Analysing…' : 'Analyse document'}
                    </button>
                </div>
            </div>
        );
    }

    // ---------- Split workspace ----------
    return (
        <div className="flex h-screen flex-col overflow-hidden bg-latte-bg pt-16">
            <div className="flex flex-none items-center justify-between border-b-2 border-latte-ink bg-latte-bg px-6 py-3">
                <span className="font-serif text-xl font-medium uppercase tracking-[0.15em] text-latte-ink">{copy.heading}</span>
                <button
                    onClick={startOver}
                    className="flex items-center gap-2 rounded-none border-2 border-latte-ink bg-transparent px-5 py-2 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-latte-ink transition-colors duration-200 hover:bg-latte-ink hover:text-latte-bg"
                >
                    <RotateCcw className="h-3 w-3" /> New document
                </button>
            </div>

            <main className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-5">
                <div className="order-2 h-full overflow-hidden border-latte-ink lg:order-1 lg:col-span-2 lg:border-r-2">
                    <RiskFeed
                        clauses={clauses}
                        summary={summary}
                        riskScore={riskScore}
                        selected={selectedClause}
                        onSelect={setSelectedClause}
                        isProcessing={isProcessing}
                        title={title}
                    />
                </div>
                <div className="order-1 h-full overflow-hidden lg:order-2 lg:col-span-3">
                    <HighlightViewer />
                </div>
            </main>

            {error && (
                <div className="flex-none border-t-2 border-red-800 bg-red-100 px-5 py-2 font-sans text-xs text-red-900">
                    {error}
                </div>
            )}

            <LegalAssistant />
        </div>
    );
}
