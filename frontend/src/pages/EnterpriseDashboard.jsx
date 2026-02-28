import { useState } from 'react';
import { Building2, FileText } from 'lucide-react';
import { PageShell, UploadZone, ResultCard } from '../components/SharedUI';

export default function EnterpriseDashboard() {
    const [results, setResults] = useState([]);

    const handleResult = (data) => {
        setResults(prev => [{ ...data, id: Date.now() }, ...prev]);
    };

    return (
        <PageShell
            icon={Building2}
            gradient="from-emerald-500 to-teal-400"
            title="Enterprise Engine"
            subtitle="Bulk Contract Analysis at Scale"
        >
            <div className="flex flex-col gap-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upload panel */}
                    <div className="glass rounded-2xl border border-white/8 p-6">
                        <h2 className="font-semibold text-white mb-1">Upload Contract</h2>
                        <p className="text-white/40 text-sm mb-6">
                            Analyse individual contracts or build a library of processed documents with full risk scoring.
                        </p>
                        <UploadZone onResult={handleResult} accentColor="emerald" />
                    </div>

                    {/* Stats panel */}
                    <div className="flex flex-col gap-4">
                        <div className="glass border border-white/8 rounded-2xl p-6">
                            <h2 className="font-semibold text-white mb-4">Session Summary</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Uploaded', value: results.length },
                                    { label: 'Flagged', value: results.filter(r => r.risk_score > 20).length },
                                    { label: 'Avg Risk', value: results.length ? `${Math.round(results.reduce((a, r) => a + r.risk_score, 0) / results.length)}%` : '—' },
                                    { label: 'Clean', value: results.filter(r => r.risk_score === 0).length },
                                ].map(s => (
                                    <div key={s.label} className="bg-white/3 border border-white/5 rounded-xl p-4 text-center">
                                        <p className="text-2xl font-black text-emerald-400">{s.value}</p>
                                        <p className="text-xs text-white/40 mt-1">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass border border-white/8 rounded-2xl p-6">
                            <h2 className="font-semibold text-white mb-4">Risk Rulebook</h2>
                            <div className="space-y-2">
                                {['Liability caps', 'Auto-renewal clauses', 'Indemnification', 'Non-compete terms'].map((rule) => (
                                    <div key={rule} className="flex items-center justify-between text-sm">
                                        <span className="text-white/50">{rule}</span>
                                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Active</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Log */}
                {results.length > 0 && (
                    <div className="flex flex-col gap-3">
                        <h2 className="font-semibold text-white/60 text-sm uppercase tracking-wider">Analysis Log</h2>
                        {results.map((r) => (
                            <div key={r.id} className="glass border border-white/8 rounded-xl px-5 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-4.5 h-4.5 text-white/30" />
                                    <div>
                                        <p className="text-sm font-medium text-white">{r.filename}</p>
                                        <p className="text-xs text-white/30">{r.clauses.length} clause(s) flagged</p>
                                    </div>
                                </div>
                                <span className={`text-lg font-black ${r.risk_score > 60 ? 'text-rose-400' : r.risk_score > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                    {100 - r.risk_score}<span className="text-xs font-normal text-white/30">/100</span>
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </PageShell>
    );
}
