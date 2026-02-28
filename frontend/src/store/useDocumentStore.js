import { create } from 'zustand';

export const useDocumentStore = create((set) => ({
    activeFileUrl: null,
    clauses: [],
    riskScore: 0,
    selectedClause: null,

    setDocumentData: (url, clauses, riskScore) => set({
        activeFileUrl: url,
        clauses: clauses,
        riskScore: riskScore,
        selectedClause: null
    }),

    setSelectedClause: (clause) => set({ selectedClause: clause })
}));
