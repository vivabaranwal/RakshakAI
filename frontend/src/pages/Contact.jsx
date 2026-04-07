import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

export default function Contact() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 pt-32 pb-12 px-6 font-sans flex flex-col items-center">
            
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl md:text-5xl font-black font-mono text-cyan-400 mb-4">
                    Get in Touch
                </h1>
                <p className="text-slate-400 max-w-lg mx-auto">
                    Have questions about Rakshak AI or want to collaborate? I'd love to hear from you.
                </p>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-md bg-slate-900 border-2 border-cyan-500/50 rounded-2xl p-8 shadow-[0_0_15px_rgba(6,182,212,0.5)] relative overflow-hidden"
            >
                {/* Background glow */}
                <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none" />

                <div className="relative z-10">
                    <h2 className="text-3xl font-bold font-mono text-slate-100 mb-2">Viva Baranwal</h2>
                    <p className="text-cyan-400 font-mono text-sm uppercase tracking-widest mb-8 border-b border-cyan-500/20 pb-4">
                        Creator & Lead Developer
                    </p>

                    <div className="space-y-6">
                        <a 
                            href="mailto:baranwalviva@gmail.com" 
                            className="flex items-center gap-4 text-slate-300 hover:text-cyan-400 transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-cyan-500/10 border border-transparent group-hover:border-cyan-500/30 transition-all">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-0.5">Email</p>
                                <p className="font-mono">baranwalviva@gmail.com</p>
                            </div>
                        </a>

                        <a 
                            href="tel:+918303459955" 
                            className="flex items-center gap-4 text-slate-300 hover:text-cyan-400 transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-cyan-500/10 border border-transparent group-hover:border-cyan-500/30 transition-all">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-0.5">Phone</p>
                                <p className="font-mono">+91 83034 59955</p>
                            </div>
                        </a>

                        <div className="flex items-center gap-4 text-slate-300">
                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-0.5">Location / University</p>
                                <p className="font-mono">SRMIST, India</p>
                            </div>
                        </div>
                    </div>
                </div>

            </motion.div>
        
        </div>
    );
}
