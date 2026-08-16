import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Scale, Copy, Check, ChevronDown, FileWarning } from 'lucide-react';
import { severityOf } from '../lib/api';

function ScoreRing({ riskScore, isProcessing }) {
    const fairness = riskScore === null ? null : 100 - riskScore;
    const pct = fairness ?? 0;
    const tone =
        fairness === null ? 'text-latte-muted'
            : fairness >= 70 ? 'text-green-900'
                : fairness >= 45 ? 'text-amber-900'
                    : 'text-red-900';
    const stroke =
        fairness === null ? '#CDB99A'
            : fairness >= 70 ? '#14532d'
                : fairness >= 45 ? '#78350f'
                    : '#7f1d1d';

    const R = 34;
    const C = 2 * Math.PI * R;

    return (
        <div className="relative h-16 w-16 flex-none sm:h-24 sm:w-24">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r={R} fill="none" stroke="#CDB99A" strokeWidth="7" />
                <motion.circle
                    cx="40" cy="40" r={R} fill="none"
                    stroke={stroke} strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={C}
                    initial={{ strokeDashoffset: C }}
                    animate={{ strokeDashoffset: C - (C * pct) / 100 }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`font-serif text-xl font-medium leading-none sm:text-3xl ${tone}`}>
                    {isProcessing || fairness === null ? '—' : fairness}
                </span>
                <span className="mt-0.5 font-sans text-[7px] font-semibold uppercase tracking-[0.15em] text-latte-subtext sm:mt-1 sm:text-[8px] sm:tracking-[0.2em]">
                    Fairness
                </span>
            </div>
        </div>
    );
}

function SuggestedClause({ text }) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
        } catch {
            /* clipboard blocked — no action needed */
        }
    };

    return (
        <div className="mt-3 rounded-none border border-green-800 bg-green-100 p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.15em] text-green-900">
                    <ShieldCheck className="h-3.5 w-3.5" /> Suggested fair clause
                </span>
                <button
                    onClick={copy}
                    className="flex items-center gap-1 rounded-none px-1.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.15em] text-green-900/70 transition-colors hover:text-green-900"
                >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
            <p className="font-sans text-xs leading-relaxed text-latte-text">{text}</p>
        </div>
    );
}

function ClauseCard({ clause, isActive, onSelect }) {
    const s = severityOf(clause);

    return (
        <motion.div layout className="overflow-hidden">
            <div className={`rounded-none border-l-4 border-t border-r border-b border-t-latte-muted border-r-latte-muted border-b-latte-muted transition-colors duration-200 ${isActive ? s.cardActive : s.cardIdle}`}>
                <button
                    onClick={() => onSelect(isActive ? null : clause)}
                    className="w-full p-4 text-left"
                >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                        <span className={`rounded-none border px-2.5 py-1 font-sans text-[9px] font-semibold uppercase tracking-[0.12em] sm:px-3 sm:text-[10px] sm:tracking-[0.15em] ${s.chip}`}>
                            {s.label}
                        </span>
                        <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
                            <span className="truncate font-sans text-[9px] font-semibold uppercase tracking-[0.12em] text-latte-subtext sm:tracking-[0.15em]">{clause.type}</span>
                            <span className="flex-none font-serif text-sm font-medium text-latte-ink">
                                {clause.fairness_score}/100
                            </span>
                            <ChevronDown
                                className={`h-3.5 w-3.5 flex-none text-latte-subtext transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`}
                            />
                        </div>
                    </div>

                    <p className="font-sans text-sm leading-relaxed text-latte-text">{clause.explanation}</p>

                    {clause.legal_basis && (
                        <p className="mt-2.5 flex items-start gap-1.5 font-serif text-xs italic leading-snug text-latte-subtext">
                            <Scale className="mt-0.5 h-3 w-3 flex-none" />
                            {clause.legal_basis}
                        </p>
                    )}
                </button>

                <AnimatePresence initial={false}>
                    {isActive && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: 'easeOut' }}
                            className="overflow-hidden"
                        >
                            <div className="px-4 pb-4">
                                {clause.text && (
                                    <div className="rounded-none border border-latte-muted bg-latte-bg p-4">
                                        <p className="mb-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-latte-subtext">
                                            Original text
                                        </p>
                                        <p className="font-serif text-sm italic leading-relaxed text-latte-subtext">
                                            “{clause.text}”
                                        </p>
                                    </div>
                                )}
                                {clause.suggested_clause && (
                                    <SuggestedClause text={clause.suggested_clause} />
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

export default function RiskFeed({
    clauses, summary, riskScore, selected, onSelect, isProcessing, title,
}) {
    const counts = clauses.reduce((acc, c) => {
        const k = c.severity || 'CAUTION';
        acc[k] = (acc[k] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="flex h-full flex-col overflow-hidden bg-latte-bg">
            {/* Header */}
            <div className="flex-none border-b-2 border-latte-ink bg-latte-bg p-4 sm:p-6">
                <div className="flex items-start gap-3.5 sm:gap-5">
                    <ScoreRing riskScore={riskScore} isProcessing={isProcessing} />
                    <div className="min-w-0 flex-1">
                        <h2 className="truncate font-serif text-lg font-medium uppercase tracking-wide text-latte-ink sm:text-2xl" title={title}>
                            {title || 'Analysis'}
                        </h2>
                        <p className="mt-1 font-serif text-xs italic leading-relaxed text-latte-subtext sm:mt-1.5 sm:text-sm">
                            {isProcessing ? 'Reviewing clauses against Indian statutes…' : summary}
                        </p>
                        {!isProcessing && clauses.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {['FRAUD', 'ALERT', 'CAUTION'].map((k) =>
                                    counts[k] ? (
                                        <span
                                            key={k}
                                            className={`rounded-none border px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.15em] ${severityOf({ severity: k }).chip}`}
                                        >
                                            {counts[k]} {severityOf({ severity: k }).label}
                                        </span>
                                    ) : null,
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Clause list */}
            <div className="custom-scrollbar flex-1 overflow-y-auto p-5">
                {isProcessing ? (
                    <div className="flex flex-col gap-3">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="h-28 animate-pulse rounded-none border-l-4 border-l-latte-muted border-t border-r border-b border-latte-muted bg-latte-surface"
                                style={{ animationDelay: `${i * 140}ms` }}
                            />
                        ))}
                    </div>
                ) : clauses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-none border border-green-800 bg-green-100">
                            <ShieldCheck className="h-6 w-6 text-green-900" />
                        </div>
                        <p className="font-serif text-2xl font-medium uppercase tracking-wide text-latte-ink">No significant risks found</p>
                        <p className="max-w-[260px] font-serif text-sm italic leading-relaxed text-latte-subtext">
                            This document looks broadly fair under Indian law. Still read it in full
                            before signing.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <p className="flex items-center gap-2 px-1 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-latte-subtext">
                            <FileWarning className="h-3.5 w-3.5" />
                            {clauses.length} clause{clauses.length > 1 ? 's' : ''} flagged
                        </p>
                        {clauses.map((c) => (
                            <ClauseCard
                                key={c.id}
                                clause={c}
                                isActive={selected?.id === c.id}
                                onSelect={onSelect}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="flex-none border-t-2 border-latte-ink bg-latte-bg px-5 py-3">
                <p className="font-serif text-xs italic leading-relaxed text-latte-subtext">
                    Rakshak AI provides legal information, not legal advice. Consult a practising
                    advocate before acting.
                </p>
            </div>
        </div>
    );
}
