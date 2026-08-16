import { motion } from 'framer-motion';
import { Mail, MapPin } from 'lucide-react';

export default function Contact() {
    return (
        <div className="min-h-screen bg-latte-bg dot-grid text-latte-text pt-32 pb-12 px-6 font-sans flex flex-col items-center">

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="font-serif text-5xl md:text-6xl font-medium uppercase tracking-widest text-latte-ink mb-6">
                    Get in Touch
                </h1>

                <div className="w-24 h-[1.5px] bg-latte-ink mx-auto mb-6" />

                <p className="font-serif text-xl italic text-latte-subtext max-w-lg mx-auto leading-relaxed">
                    Have questions about Rakshak AI or want to collaborate? I'd love to hear from you.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-md bg-latte-surface border-2 border-latte-ink rounded-none p-8 animate-fadeIn"
            >
                <h2 className="font-serif text-4xl font-medium uppercase tracking-wide text-latte-ink mb-2">Viva Baranwal</h2>
                <p className="font-sans text-latte-subtext text-[10px] uppercase tracking-[0.2em] font-semibold">
                    Creator &amp; Lead Developer
                </p>

                <div className="w-full h-[1.5px] bg-latte-ink my-8" />

                <div className="space-y-6">
                    <a
                        href="mailto:baranwalviva@gmail.com"
                        className="flex items-center gap-4 text-latte-text hover:text-latte-accent transition-colors group"
                    >
                        <div className="w-10 h-10 rounded-none border-2 border-latte-ink bg-latte-bg flex items-center justify-center transition-colors group-hover:bg-latte-ink">
                            <Mail className="w-4 h-4 transition-colors group-hover:text-latte-bg" strokeWidth={1.75} />
                        </div>
                        <div>
                            <p className="font-sans text-[10px] text-latte-subtext uppercase tracking-[0.2em] font-semibold mb-1">Email</p>
                            <p className="font-sans text-sm font-medium">baranwalviva@gmail.com</p>
                        </div>
                    </a>

                    <div className="flex items-center gap-4 text-latte-text">
                        <div className="w-10 h-10 rounded-none border-2 border-latte-ink bg-latte-bg flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-latte-subtext" strokeWidth={1.75} />
                        </div>
                        <div>
                            <p className="font-sans text-[10px] text-latte-subtext uppercase tracking-[0.2em] font-semibold mb-1">Location / University</p>
                            <p className="font-sans text-sm font-medium">SRMIST, India</p>
                        </div>
                    </div>
                </div>
            </motion.div>

        </div>
    );
}
