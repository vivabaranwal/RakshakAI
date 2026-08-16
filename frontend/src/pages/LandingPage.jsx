import { useNavigate } from 'react-router-dom';
import { Shield, Eye, Building2, ArrowRight, Sparkles } from 'lucide-react';

const personas = [
    {
        id: 'personal',
        icon: Shield,
        label: 'Personal',
        subtitle: 'For Citizens',
        description: 'Check rental agreements, offer letters, and loan documents for unfair clauses — explained in plain language under Indian law.',
        tags: ['Rent Agreements', 'Employment', 'Consumer'],
        path: '/personal',
    },
    {
        id: 'enterprise',
        icon: Building2,
        label: 'Enterprise',
        subtitle: 'For Businesses',
        description: 'Review commercial contracts for lopsided indemnity, liability and IP terms — checked against the Contract Act, MSMED and DPDP Act.',
        tags: ['Indemnity', 'MSMED Act', 'DPDP Act'],
        path: '/enterprise',
    },
    {
        id: 'govt',
        icon: Eye,
        label: 'Govt',
        subtitle: 'For Officials',
        description: 'Audit tenders and procurement documents against GFR 2017, CVC guidelines and the Competition Act, 2002.',
        tags: ['Procurement', 'GFR 2017', 'Compliance'],
        path: '/govt',
    },
];

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-latte-bg dot-grid flex flex-col">
            {/* Ambient warmth */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-latte-muted/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-latte-accent/[0.06] rounded-full blur-[120px]" />
            </div>

            {/* Nav removed for global Navbar */}

            {/* Hero */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-16">
                <div className="text-center mb-16 animate-fade-up">
                    <div className="inline-flex items-center gap-2 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-latte-subtext border border-latte-ink rounded-none px-4 py-2 mb-8">
                        <Sparkles className="w-3 h-3" />
                        AI-Powered Legal Protection
                    </div>
                    <h1 className="font-serif text-5xl md:text-7xl font-medium uppercase tracking-widest leading-[1.05] mb-6 text-latte-ink">
                        The Universal
                        <br />
                        <span className="gradient-text">Legal Shield</span>
                    </h1>

                    <div className="w-24 h-[1.5px] bg-latte-ink mx-auto mb-6" />

                    <p className="font-serif text-xl md:text-2xl italic text-latte-subtext max-w-xl mx-auto leading-relaxed">
                        Upload any Indian legal document. Get instant risk scoring, clause-by-clause
                        analysis grounded in Indian statutes, and suggested fair replacements.
                    </p>
                </div>

                {/* Persona Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl">
                    {personas.map((p, i) => (
                        <button
                            key={p.id}
                            onClick={() => navigate(p.path)}
                            // Delay is inline rather than a `animate-delay-${n}` class:
                            // Tailwind purges dynamically-built class names, which left
                            // these cards stuck at opacity 0.
                            style={{ animationDelay: `${(i + 1) * 100}ms` }}
                            className="
                bg-latte-surface rounded-none p-7 text-left cursor-pointer
                border-l-4 border-l-latte-ink border-t border-r border-b border-latte-muted
                hover:bg-latte-bg hover:border-l-latte-accent
                transition-colors duration-200
                animate-fade-up
                group relative
              "
                        >
                            {/* Icon */}
                            <div className="w-11 h-11 rounded-none border-2 border-latte-ink bg-latte-ink flex items-center justify-center mb-5 transition-colors group-hover:bg-latte-accent group-hover:border-latte-accent">
                                <p.icon className="w-5 h-5 text-latte-bg" strokeWidth={1.75} />
                            </div>

                            {/* Labels */}
                            <div className="mb-2">
                                <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-latte-subtext">
                                    {p.subtitle}
                                </span>
                            </div>
                            <h2 className="font-serif text-3xl font-medium uppercase tracking-wide text-latte-ink mb-3">{p.label}</h2>
                            <p className="font-sans text-latte-subtext text-sm leading-relaxed mb-5">{p.description}</p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {p.tags.map(tag => (
                                    <span key={tag} className="font-sans text-[10px] font-semibold uppercase tracking-[0.15em] text-latte-subtext border border-latte-muted rounded-none px-2.5 py-1">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* CTA */}
                            <div className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-latte-ink group-hover:text-latte-accent transition-colors">
                                Get Started
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>
                    ))}
                </div>

                {/* Footer note */}
                <div className="mt-16 w-full max-w-5xl animate-fade-up animate-delay-400">
                    <div className="w-full h-[1.5px] bg-latte-ink mb-6" />
                    <p className="text-center font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-latte-subtext">
                        Indian Contract Act 1872 · Consumer Protection Act 2019 · DPDP Act 2023 · Built for India
                    </p>
                    <p className="mt-2 text-center font-serif text-sm italic text-latte-subtext/80">
                        Legal information, not legal advice.
                    </p>
                </div>
            </main>
        </div>
    );
}
