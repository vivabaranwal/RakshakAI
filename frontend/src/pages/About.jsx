import { motion } from 'framer-motion';
import { Shield, BrainCircuit, Scale } from 'lucide-react';

const PORTFOLIO_URL = 'https://vivabaranwal.vercel.app/';

export default function About() {
    return (
        <div className="min-h-[100svh] bg-latte-bg dot-grid text-latte-text pt-20 sm:pt-24 pb-12 px-5 sm:px-6 font-sans">
            <div className="max-w-4xl mx-auto space-y-10 sm:space-y-16">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-medium uppercase tracking-[0.12em] sm:tracking-widest text-latte-ink">
                        About Rakshak AI
                    </h1>

                    <div className="w-20 sm:w-24 h-[1.5px] bg-latte-ink mx-auto" />

                    <p className="font-serif text-base sm:text-xl md:text-2xl italic text-latte-subtext max-w-2xl mx-auto leading-relaxed">
                        Empowering tenants and gig workers with AI-driven legal transparency. We believe everyone deserves to know what they are signing.
                    </p>
                </motion.div>

                {/* Grid */}
                <div className="grid md:grid-cols-3 gap-5 sm:gap-8">
                    {[
                        {
                            icon: <Shield className="w-6 h-6 text-latte-bg" strokeWidth={1.75} />,
                            title: "Protection First",
                            text: "Our core mission is to shield vulnerable individuals from predatory clauses hidden in dense legal jargon."
                        },
                        {
                            icon: <BrainCircuit className="w-6 h-6 text-latte-bg" strokeWidth={1.75} />,
                            title: "AI-Powered",
                            text: "Utilizing advanced LLMs to break down complex contracts into plain English, ensuring you fully understand your commitments."
                        },
                        {
                            icon: <Scale className="w-6 h-6 text-latte-bg" strokeWidth={1.75} />,
                            title: "Legal Equality",
                            text: "Leveling the playing field between large corporations and everyday citizens by democratizing access to contract analysis."
                        }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 + 0.2 }}
                            className="bg-latte-surface rounded-none p-7 border-l-4 border-l-latte-ink border-t border-r border-b border-latte-muted hover:bg-latte-bg hover:border-l-latte-accent transition-colors duration-200"
                        >
                            <div className="w-12 h-12 rounded-none border-2 border-latte-ink bg-latte-ink flex items-center justify-center mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="font-serif text-2xl font-medium uppercase tracking-wide text-latte-ink mb-3">{feature.title}</h3>
                            <p className="font-sans text-sm text-latte-subtext leading-relaxed">{feature.text}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Identity / Creator Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-latte-surface border-2 border-latte-ink rounded-none p-6 sm:p-8 md:p-12"
                >
                    <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-medium uppercase tracking-[0.12em] sm:tracking-widest text-latte-ink">Behind the Code</h2>

                    <div className="w-full h-[1.5px] bg-latte-ink my-6 sm:my-8" />

                    <div className="space-y-5 font-sans text-sm text-latte-text leading-relaxed">
                        <p>
                            Rakshak AI was developed by{' '}
                            <a
                                href={PORTFOLIO_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold uppercase tracking-[0.1em] text-latte-accent underline decoration-latte-muted underline-offset-4 transition-colors hover:text-latte-accentHover hover:decoration-latte-accent"
                            >
                                Viva Baranwal
                            </a>{' '}
                            to bridge the gap between complex legal documents and everyday people.
                        </p>
                        <p>
                            With a background in <strong className="font-semibold">Computer Science Engineering at SRMIST</strong>, Viva combines a deep understanding of artificial intelligence with a passion for building tools that create tangible, positive social impact. Rakshak AI represents the intersection of technology and justice — a step towards making legal transparency a fundamental right, not a luxury.
                        </p>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
