import { useNavigate } from 'react-router-dom';
import { Shield, Eye, Building2, ArrowRight, Sparkles } from 'lucide-react';

const personas = [
    {
        id: 'public',
        icon: Shield,
        label: 'Public Shield',
        subtitle: 'For Citizens',
        description: 'Scan rental agreements, employment contracts, and everyday legal documents for unfair clauses — in plain language.',
        tags: ['Tenant Rights', 'Employment', 'Freelancer'],
        gradient: 'from-blue-500 to-cyan-400',
        glow: 'glow-blue',
        border: 'border-blue-500/30 hover:border-blue-400/60',
        badge: 'bg-blue-500/10 text-blue-400',
        path: '/public',
    },
    {
        id: 'govt',
        icon: Eye,
        label: 'Govt Watchdog',
        subtitle: 'For Officials',
        description: 'Audit procurement bids, detect collusion patterns, and compare bulk government documents with precision.',
        tags: ['Procurement', 'Compliance', 'Auditing'],
        gradient: 'from-violet-500 to-purple-400',
        glow: 'glow-purple',
        border: 'border-violet-500/30 hover:border-violet-400/60',
        badge: 'bg-violet-500/10 text-violet-400',
        path: '/govt',
    },
    {
        id: 'enterprise',
        icon: Building2,
        label: 'Enterprise Engine',
        subtitle: 'For Organizations',
        description: 'Bulk-process contracts at scale. Custom rulebooks, risk analytics, and searchable compliance dashboards.',
        tags: ['Bulk Upload', 'Custom Rules', 'Analytics'],
        gradient: 'from-emerald-500 to-teal-400',
        glow: 'glow-emerald',
        border: 'border-emerald-500/30 hover:border-emerald-400/60',
        badge: 'bg-emerald-500/10 text-emerald-400',
        path: '/enterprise',
    },
];

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0a0f1e] dot-grid flex flex-col">
            {/* Ambient glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px]" />
            </div>

            {/* Nav removed for global Navbar */}

            {/* Hero */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-16">
                <div className="text-center mb-16 animate-fade-up">
                    <div className="inline-flex items-center gap-2 text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI-Powered Legal Protection
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-5">
                        <span className="text-white">The Universal</span>
                        <br />
                        <span className="gradient-text">Legal Shield</span>
                    </h1>
                    <p className="text-white/50 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
                        Upload any legal document. Get instant AI-powered analysis, risk scores, and plain-language explanations.
                    </p>
                </div>

                {/* Persona Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl">
                    {personas.map((p, i) => (
                        <button
                            key={p.id}
                            onClick={() => navigate(p.path)}
                            className={`
                glass glass-hover rounded-2xl p-7 text-left cursor-pointer
                border ${p.border} ${p.glow}
                animate-fade-up animate-delay-${(i + 1) * 100}
                group relative overflow-hidden
              `}
                        >
                            {/* top gradient line */}
                            <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${p.gradient} opacity-60`} />

                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.gradient} flex items-center justify-center mb-5 shadow-lg`}>
                                <p.icon className="w-6 h-6 text-white" strokeWidth={2} />
                            </div>

                            {/* Labels */}
                            <div className="mb-1">
                                <span className={`text-[10px] font-semibold uppercase tracking-widest ${p.badge} px-2 py-0.5 rounded-full`}>
                                    {p.subtitle}
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-white mt-2 mb-3">{p.label}</h2>
                            <p className="text-white/50 text-sm leading-relaxed mb-5">{p.description}</p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {p.tags.map(tag => (
                                    <span key={tag} className="text-[11px] font-medium text-white/40 border border-white/10 rounded-full px-2.5 py-0.5">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* CTA */}
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-white/70 group-hover:text-white transition-colors">
                                Get Started
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>
                    ))}
                </div>

                {/* Footer note */}
                <p className="mt-12 text-white/25 text-xs animate-fade-up animate-delay-400">
                    Powered by LegalBERT + SaulLM · Built for India
                </p>
            </main>
        </div>
    );
}
