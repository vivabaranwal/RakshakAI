import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';

const LINKS = [
    { name: 'Home', path: '/' },
    { name: 'Personal', path: '/personal' },
    { name: 'Enterprise', path: '/enterprise' },
    { name: 'Govt', path: '/govt' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
    const { pathname } = useLocation();
    const [open, setOpen] = useState(false);

    // Don't let the page scroll behind an open full-screen drawer.
    useEffect(() => {
        if (!open) return undefined;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    return (
        <nav className="fixed left-0 top-0 z-50 h-16 w-full border-b-2 border-latte-ink bg-latte-bg">
            <div className="flex h-full items-center justify-between px-5 sm:px-8 lg:px-10">
                <Link to="/" onClick={() => setOpen(false)} className="group flex min-w-0 items-center gap-2.5 sm:gap-3">
                    <div className="flex h-8 w-8 flex-none items-center justify-center rounded-none border-2 border-latte-ink bg-latte-ink transition-colors group-hover:border-latte-accent group-hover:bg-latte-accent">
                        <Shield className="h-4 w-4 text-latte-bg" />
                    </div>
                    <span className="truncate font-serif text-lg font-medium uppercase tracking-[0.12em] text-latte-ink sm:text-2xl sm:tracking-[0.15em]">
                        Rakshak AI
                    </span>
                </Link>

                {/* Desktop links */}
                <div className="hidden items-center gap-5 md:flex lg:gap-7">
                    {LINKS.map((link) => {
                        const active = pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`font-sans text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                                    active
                                        ? 'text-latte-ink underline decoration-latte-accent decoration-2 underline-offset-[6px]'
                                        : 'text-latte-subtext hover:text-latte-ink'
                                }`}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Mobile menu toggle — 44px tap target */}
                <button
                    onClick={() => setOpen((v) => !v)}
                    aria-label={open ? 'Close menu' : 'Open menu'}
                    aria-expanded={open}
                    className="-mr-2 flex h-11 w-11 items-center justify-center text-latte-ink md:hidden"
                >
                    {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile drawer */}
            {open && (
                <div className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t-2 border-latte-ink bg-latte-bg md:hidden">
                    <div className="flex flex-col px-5 py-2">
                        {LINKS.map((link) => {
                            const active = pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setOpen(false)}
                                    className={`border-b border-latte-muted py-4 font-sans text-sm font-semibold uppercase tracking-[0.2em] transition-colors ${
                                        active ? 'text-latte-accent' : 'text-latte-subtext'
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </nav>
    );
}
