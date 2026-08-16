import { Link, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';

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

    return (
        <nav className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b-2 border-latte-ink bg-latte-bg px-10">
            <Link to="/" className="group flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-none border-2 border-latte-ink bg-latte-ink transition-colors group-hover:bg-latte-accent group-hover:border-latte-accent">
                    <Shield className="h-4 w-4 text-latte-bg" />
                </div>
                <span className="font-serif text-2xl font-medium uppercase tracking-[0.15em] text-latte-ink">
                    Rakshak AI
                </span>
            </Link>

            <div className="hidden items-center gap-7 md:flex">
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
        </nav>
    );
}
