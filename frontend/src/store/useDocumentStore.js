import { create } from 'zustand';

const KEY_DOC = 'rakshak_doc_id';
const KEY_MODE = 'rakshak_mode';

const readStoredId = () => {
    const raw = localStorage.getItem(KEY_DOC);
    const n = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(n) ? n : null;
};

export const useDocumentStore = create((set) => ({
    docId: readStoredId(),
    mode: localStorage.getItem(KEY_MODE) || 'Personal',
    activeFileUrl: null,
    clauses: [],
    riskScore: null,
    summary: '',
    title: '',
    selectedClause: null,
    isProcessing: false,
    error: '',

    setMode: (mode) => {
        localStorage.setItem(KEY_MODE, mode);
        set({ mode });
    },

    setDocId: (id) => {
        const n = typeof id === 'string' ? parseInt(id, 10) : id;
        if (!Number.isFinite(n)) return;
        localStorage.setItem(KEY_DOC, String(n));
        set({ docId: n });
    },

    setActiveFileUrl: (activeFileUrl) => set({ activeFileUrl }),
    setIsProcessing: (isProcessing) => set({ isProcessing }),
    setError: (error) => set({ error, isProcessing: false }),
    setSelectedClause: (selectedClause) => set({ selectedClause }),

    setDocumentData: ({ url, clauses, riskScore, summary = '', docId = null, title = '' }) =>
        set((state) => {
            const finalId = docId ?? state.docId;
            if (Number.isFinite(finalId)) localStorage.setItem(KEY_DOC, String(finalId));
            return {
                activeFileUrl: url ?? state.activeFileUrl,
                clauses: clauses ?? [],
                riskScore: riskScore ?? null,
                summary,
                title,
                docId: finalId,
                selectedClause: null,
                isProcessing: false,
                error: '',
            };
        }),

    reset: () => {
        localStorage.removeItem(KEY_DOC);
        set({
            docId: null,
            activeFileUrl: null,
            clauses: [],
            riskScore: null,
            summary: '',
            title: '',
            selectedClause: null,
            isProcessing: false,
            error: '',
        });
    },
}));
