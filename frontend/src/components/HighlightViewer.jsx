import React, { useState } from 'react';
import { PdfLoader, PdfHighlighter, Highlight, Popup } from 'react-pdf-highlighter';
import { useDocumentStore } from '../store/useDocumentStore';

export default function HighlightViewer() {
    const { activeFileUrl, clauses, setSelectedClause } = useDocumentStore();

    if (!activeFileUrl) return null;

    // Transform backend clauses into react-pdf-highlighter highlight format
    const highlights = clauses.map((c, i) => ({
        id: String(i),
        content: { text: c.text },
        position: {
            boundingRect: c.bbox,
            rects: [c.bbox],
            pageNumber: c.page,
        },
        comment: c.explanation,
        type: c.type
    }));

    return (
        <div className="h-[800px] border border-slate-300 rounded-lg overflow-hidden relative">
            <PdfLoader
                url={activeFileUrl}
                workerSrc="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js"
                beforeLoad={<div className="p-4 flex justify-center items-center h-full">Loading PDF...</div>}
            >
                {(pdfDocument) => (
                    <PdfHighlighter
                        pdfDocument={pdfDocument}
                        enableAreaSelection={(event) => event.altKey}
                        onScrollChange={() => { }}
                        scrollRef={(scrollTo) => { }}
                        onSelectionFinished={(position, content, hideTipAndSelection, transformSelection) => {
                            // Usually allows manual highlighting. We disable it for read-only.
                            return null;
                        }}
                        highlightTransform={(highlight, index, setTip, hideTip, viewportToScaled, screenshot, isScrolledTo) => {
                            return (
                                <Popup
                                    popupContent={<div className="bg-slate-900 text-white p-2 rounded text-xs max-w-xs">{highlight.comment}</div>}
                                    onMouseOver={(popupContent) => setTip(highlight, highlight => popupContent)}
                                    onMouseOut={hideTip}
                                    key={index}
                                >
                                    <div
                                        className="absolute bg-rose-500/30 border-2 border-rose-500 cursor-pointer transition-colors hover:bg-rose-500/50"
                                        onClick={() => setSelectedClause(clauses[parseInt(highlight.id)])}
                                        style={{
                                            left: highlight.position.boundingRect.x1,
                                            top: highlight.position.boundingRect.y1,
                                            width: highlight.position.boundingRect.x2 - highlight.position.boundingRect.x1,
                                            height: highlight.position.boundingRect.y2 - highlight.position.boundingRect.y1,
                                        }}
                                    />
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
