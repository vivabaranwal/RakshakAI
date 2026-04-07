import { create } from 'zustand';

export const useDocumentStore = create((set) => ({
    docId: null,
    activeFileUrl: null,
    clauses: [],
    riskScore: 0,
    summary: '',
    selectedClause: null,
    isProcessing: false,
    scrollTo: null,

    setDocId: (id) => set({ docId: id }),
    setActiveFileUrl: (url) => set({ activeFileUrl: url }),
    setIsProcessing: (val) => set({ isProcessing: val }),
    setScrollTo: (fn) => set({ scrollTo: fn }),

    setDocumentData: (url, clauses, riskScore, summary = '', docId = null) => set((state) => ({
        activeFileUrl: url,
        clauses: clauses ?? [],
        riskScore: riskScore ?? 0,
        summary,
        selectedClause: null,
        isProcessing: false,
        docId: docId !== null ? docId : state.docId,
    })),

    setSelectedClause: (clause) => set({ selectedClause: clause }),

    reset: () => {
        localStorage.removeItem('rakshak_doc_id');
        set({
            docId: null,
            activeFileUrl: null,
            clauses: [],
            riskScore: 0,
            summary: '',
            selectedClause: null,
            isProcessing: false,
        });
    },
}));
