import React, { useState, useEffect } from 'react';
import { PdfLoader, PdfHighlighter, Highlight, Popup } from 'react-pdf-highlighter';
import 'react-pdf-highlighter/dist/style.css';
import { useDocumentStore } from '../store/useDocumentStore';

export default function HighlightViewer() {
    // Force vite reload
    const { activeFileUrl, clauses, selectedClause, setSelectedClause, isProcessing } = useDocumentStore();
    const [scrollTo, setScrollToState] = useState(null);

    // Transform backend clauses into react-pdf-highlighter highlight format
    const highlights = clauses.map((c, i) => {
        // Handle bounding box conversions
        const box = Array.isArray(c.bbox) ? { x1: c.bbox[0], y1: c.bbox[1], x2: c.bbox[2], y2: c.bbox[3] } : (c.bbox || { x1: 0, y1: 0, x2: 0, y2: 0 });
        
        // Ensure bounds exist for scaling calculations (standard letter/A4 approximations if missing)
        const safeBox = { ...box, width: box.width || 595, height: box.height || 842 };

        return {
            id: String(i),
            content: { text: c.text },
            position: {
                boundingRect: safeBox,
                rects: [safeBox],
                pageNumber: c.page || 1,
            },
            comment: c.explanation,
            type: c.type
        };
    });

    useEffect(() => {
        if (scrollTo && selectedClause) {
            const index = clauses.findIndex(c => c.text === selectedClause.text);
            if (index !== -1) {
                // Issue scroll jump to exact bounding box mapped natively
                scrollTo(highlights[index]);
            }
        }
    }, [selectedClause, scrollTo, clauses, highlights]);

    if (!activeFileUrl) return null;

    return (
        <div className="h-full w-full overflow-hidden relative">
            {/* Matrices Scanning Loading State */}
            {isProcessing && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]">
                    <div className="flex flex-col items-center gap-4 text-cyan-400 bg-slate-950/80 p-6 rounded-2xl border border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                        <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin shadow-[0_0_15px_#22d3ee]" />
                        <span className="font-mono uppercase tracking-widest text-sm drop-shadow-[0_0_10px_#22d3ee]">Scanning Document Matrix...</span>
                    </div>
                </div>
            )}

            <PdfLoader
                url={activeFileUrl}
                workerSrc="https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs"
                beforeLoad={<div className="p-4 flex justify-center items-center h-full text-slate-500 font-mono text-sm uppercase">Loading PDF Viewer...</div>}
            >
                {(pdfDocument) => (
                    <PdfHighlighter
                        pdfDocument={pdfDocument}
                        enableAreaSelection={(event) => event.altKey}
                        onScrollChange={() => { }}
                        scrollRef={(scrollToFn) => { setScrollToState(() => scrollToFn); }}
                        onSelectionFinished={() => null}
                        highlightTransform={(highlight, index, setTip, hideTip, viewportToScaled, screenshot, isScrolledTo) => {
                            const isSelected = selectedClause && clauses.indexOf(selectedClause) === parseInt(highlight.id);
                            
                            // Let the component map backend bbox into screen-scale bounds
                            const scaledRects = highlight.position.rects.map(viewportToScaled);

                            return (
                                <Popup
                                    popupContent={<div className="bg-slate-950 text-slate-200 p-3 rounded border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] text-xs max-w-xs z-50 font-mono">{highlight.comment}</div>}
                                    onMouseOver={(popupContent) => setTip(highlight, highlight => popupContent)}
                                    onMouseOut={hideTip}
                                    key={index}
                                >
                                    {scaledRects.map((rect, idx) => (
                                        <div
                                            key={idx}
                                            className={`absolute cursor-pointer transition-all duration-300 ${isSelected ? 'z-40' : 'z-30 hover:z-40'}`}
                                            onClick={() => setSelectedClause(clauses[parseInt(highlight.id)])}
                                            style={{
                                                left: rect.left,
                                                top: rect.top,
                                                width: rect.width,
                                                height: rect.height,
                                                background: "rgba(255, 0, 0, 0.3)",
                                                border: "1px solid rgba(255, 0, 0, 0.8)",
                                                boxShadow: isSelected ? "0 0 15px rgba(255, 0, 0, 0.8)" : "0 0 5px rgba(255, 0, 0, 0.3)",
                                            }}
                                        />
                                    ))}
                                </Popup>
                            );
                        }}
                        highlights={highlights}
                    />
                )}
            </PdfLoader>
        </div>
    );
}
