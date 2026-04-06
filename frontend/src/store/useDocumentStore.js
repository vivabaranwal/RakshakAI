import { create } from 'zustand';

export const useDocumentStore = create((set) => ({
    activeFileUrl: null,
    clauses: [],
    riskScore: 0,
    summary: '',
    selectedClause: null,
    isProcessing: false,
    scrollTo: null,

    setActiveFileUrl: (url) => set({ activeFileUrl: url }),
    setIsProcessing: (val) => set({ isProcessing: val }),
    setScrollTo: (fn) => set({ scrollTo: fn }),

    setDocumentData: (url, clauses, riskScore, summary = '') => set({
        activeFileUrl: url,
        clauses: clauses ?? [],
        riskScore: riskScore ?? 0,
        summary,
        selectedClause: null,
        isProcessing: false,
    }),

    setSelectedClause: (clause) => set((state) => {
        if (state.scrollTo && clause) {
            // Find the highlight format associated with this clause
            const index = state.clauses.findIndex(c => c.text === clause.text);
            if (index !== -1) {
                // Mock a highlight object to satisfy react-pdf-highlighter's scrollTo
                state.scrollTo({ id: String(index), position: { pageNumber: clause.page || 1 } });
            }
        }
        return { selectedClause: clause };
    }),

    reset: () => set({
        activeFileUrl: null,
        clauses: [],
        riskScore: 0,
        summary: '',
        selectedClause: null,
        isProcessing: false,
    }),
}));
