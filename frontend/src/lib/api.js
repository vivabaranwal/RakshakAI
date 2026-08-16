import axios from 'axios';

// Normalise whatever VITE_API_URL is set to into a clean `/api/v1` base.
const envUrl = import.meta.env.VITE_API_URL;
const base = envUrl ? envUrl.replace(/\/+$/, '') : 'http://localhost:8000';

export const API_URL = base.endsWith('/api/v1') ? base : `${base}/api/v1`;

export const api = axios.create({ baseURL: API_URL, timeout: 60000 });

/** Pull a readable message out of an axios error. */
export function errorMessage(err, fallback = 'Something went wrong. Please try again.') {
    const detail = err?.response?.data?.detail ?? err?.response?.data?.error;
    if (typeof detail === 'string' && detail) return detail;
    if (err?.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
    if (err?.message === 'Network Error') {
        return 'Cannot reach the server. Check that the backend is running.';
    }
    return fallback;
}

export const fileUrl = (docId) => `${API_URL}/file/${docId}`;

/**
 * Severity → shared Tailwind colour tokens, so every surface matches.
 *
 * Chips follow the Latte Legal badge spec (light tint, matching border).
 * The `highlight` values stay red/amber/blue: they paint onto the white PDF
 * page and carry the fraud/alert/caution meaning, which a brown scale could
 * not keep distinguishable.
 */
export const SEVERITY = {
    FRAUD: {
        label: 'Fraud Risk',
        chip: 'bg-red-100 text-red-900 border-red-800',
        dot: 'bg-red-900',
        cardActive: 'bg-latte-bg border-l-latte-accent',
        cardIdle: 'bg-latte-surface border-l-latte-border hover:bg-latte-bg',
        text: 'text-red-900',
        highlight: 'rgba(248, 113, 113, 0.28)',   // light red on the PDF
        highlightActive: 'rgba(248, 113, 113, 0.45)',
    },
    ALERT: {
        label: 'Alert',
        chip: 'bg-amber-100 text-amber-900 border-amber-800',
        dot: 'bg-amber-900',
        cardActive: 'bg-latte-bg border-l-latte-accent',
        cardIdle: 'bg-latte-surface border-l-latte-border hover:bg-latte-bg',
        text: 'text-amber-900',
        highlight: 'rgba(251, 191, 36, 0.25)',
        highlightActive: 'rgba(251, 191, 36, 0.42)',
    },
    CAUTION: {
        label: 'Caution',
        chip: 'bg-green-100 text-green-900 border-green-800',
        dot: 'bg-green-900',
        cardActive: 'bg-latte-bg border-l-latte-accent',
        cardIdle: 'bg-latte-surface border-l-latte-border hover:bg-latte-bg',
        text: 'text-green-900',
        highlight: 'rgba(56, 189, 248, 0.22)',
        highlightActive: 'rgba(56, 189, 248, 0.4)',
    },
};

export const severityOf = (c) => SEVERITY[c?.severity] ?? SEVERITY.CAUTION;

export const MODES = {
    Personal: { label: 'Personal', path: '/personal' },
    Enterprise: { label: 'Enterprise', path: '/enterprise' },
    Govt: { label: 'Govt', path: '/govt' },
};
