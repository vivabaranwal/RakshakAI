import { useState } from 'react';
import { Eye } from 'lucide-react';
import { PageShell, UploadZone, ResultCard } from '../components/SharedUI';

export default function GovtDashboard() {
    const [result, setResult] = useState(null);

    return (
        <PageShell
            icon={Eye}
            gradient="from-violet-500 to-purple-400"
            title="Govt Watchdog"
            subtitle="Procurement Audit & Compliance Scanner"
        >
            <div className="flex flex-col gap-8 max-w-2xl">
                {!result ? (
                    <>
                        <div className="glass rounded-2xl border border-white/8 p-6">
                            <h2 className="font-semibold text-white mb-1">Upload Government Document</h2>
                            <p className="text-white/40 text-sm mb-6">
                                Upload procurement bids, tenders, or compliance documents. The AI will scan for collusion indicators, irregularities, and high-risk clauses.
                            </p>
                            <UploadZone onResult={setResult} accentColor="violet" />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: 'Documents Scanned', value: '1,248' },
                                { label: 'Flags Raised', value: '83' },
                                { label: 'Avg Risk Score', value: '34%' },
                            ].map(stat => (
                                <div key={stat.label} className="glass border border-white/8 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-black text-violet-400">{stat.value}</p>
                                    <p className="text-xs text-white/40 mt-1">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <ResultCard result={result} />
                        <button
                            onClick={() => setResult(null)}
                            className="text-sm text-white/30 hover:text-white/60 transition-colors mx-auto"
                        >
                            ← Scan another document
                        </button>
                    </>
                )}
            </div>
        </PageShell>
    );
}
