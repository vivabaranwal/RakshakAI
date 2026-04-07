import { motion } from 'framer-motion';
import { Shield, BrainCircuit, Scale } from 'lucide-react';

export default function About() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 pt-24 pb-12 px-6 font-sans">
            <div className="max-w-4xl mx-auto space-y-16">
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <h1 className="text-4xl md:text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                        About Rakshak AI
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Empowering tenants and gig workers with AI-driven legal transparency. We believe everyone deserves to know what they are signing.
                    </p>
                </motion.div>

                {/* Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { 
                            icon: <Shield className="w-8 h-8 text-cyan-400" />, 
                            title: "Protection First", 
                            text: "Our core mission is to shield vulnerable individuals from predatory clauses hidden in dense legal jargon."
                        },
                        { 
                            icon: <BrainCircuit className="w-8 h-8 text-purple-400" />, 
                            title: "AI-Powered", 
                            text: "Utilizing advanced LLMs to break down complex contracts into plain English, ensuring you fully understand your commitments."
                        },
                        { 
                            icon: <Scale className="w-8 h-8 text-emerald-400" />, 
                            title: "Legal Equality", 
                            text: "Leveling the playing field between large corporations and everyday citizens by democratizing access to contract analysis."
                        }
                    ].map((feature, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 + 0.2 }}
                            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors"
                        >
                            <div className="w-14 h-14 rounded-xl bg-slate-800/80 flex items-center justify-center mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold font-mono text-slate-100 mb-3">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed">{feature.text}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Identity / Creator Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/20 rounded-3xl p-8 md:p-12 shadow-[0_0_30px_rgba(34,211,238,0.05)] relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
                    
                    <h2 className="text-2xl md:text-3xl font-bold font-mono text-slate-100 mb-6">Behind the Code</h2>
                    <div className="space-y-4 text-slate-300 leading-relaxed">
                        <p>
                            Rakshak AI was developed by <strong className="text-cyan-400">Viva Baranwal</strong> to bridge the gap between complex legal documents and everyday people.
                        </p>
                        <p>
                            With a background in <strong>Computer Science Engineering at SRMIST</strong>, Viva combines a deep understanding of artificial intelligence with a passion for building tools that create tangible, positive social impact. Rakshak AI represents the intersection of technology and justice — a step towards making legal transparency a fundamental right, not a luxury.
                        </p>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
