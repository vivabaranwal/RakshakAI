import { create } from 'zustand';

export const useDocumentStore = create((set) => ({
    docId: localStorage.getItem('rakshak_doc_id') ? parseInt(localStorage.getItem('rakshak_doc_id')) : null,
    activeFileUrl: null,
    clauses: [],
    riskScore: null,
    summary: '',
    selectedClause: null,
    isProcessing: false,
    scrollTo: null,

    setDocId: (id) => {
        if (id === null || id === undefined) return;
        const numericId = typeof id === 'string' ? parseInt(id) : id;
        localStorage.setItem('rakshak_doc_id', String(numericId));
        set({ docId: numericId });
    },
    setActiveFileUrl: (url) => set({ activeFileUrl: url }),
    setIsProcessing: (val) => set({ isProcessing: val }),
    setScrollTo: (fn) => set({ scrollTo: fn }),

    setDocumentData: (url, clauses, riskScore, summary = '', docId = null) => set((state) => {
        const finalDocId = docId !== null ? (typeof docId === 'string' ? parseInt(docId) : docId) : state.docId;

        if (finalDocId) {
            localStorage.setItem('rakshak_doc_id', String(finalDocId));
        }
        return {
            activeFileUrl: url,
            clauses: clauses ?? [],
            riskScore: riskScore ?? null,
            summary,
            selectedClause: null,
            isProcessing: false,
            docId: finalDocId,
        };
    }),

    setSelectedClause: (clause) => set({ selectedClause: clause }),

    reset: () => {
        localStorage.removeItem('rakshak_doc_id');
        set({
            docId: null,
            activeFileUrl: null,
            clauses: [],
            riskScore: null,
            summary: '',
            selectedClause: null,
            isProcessing: false,
        });
    },
}));
