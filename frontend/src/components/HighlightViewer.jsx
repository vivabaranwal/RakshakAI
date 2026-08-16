import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { PdfLoader, PdfHighlighter, Highlight, Popup } from 'react-pdf-highlighter';
import 'react-pdf-highlighter/dist/style.css';
import { useDocumentStore } from '../store/useDocumentStore';
import { severityOf } from '../lib/api';

// Bundle the worker from the installed pdfjs-dist so its version always matches
// the library's pdf.js. A CDN pin drifts out of sync and breaks the viewer.
const workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

// Module-level constants: passing fresh inline arrows would give PdfHighlighter
// new props every render and remount the viewer.
const NOOP = () => { };
const NO_AREA_SELECTION = () => false;
const NO_SELECTION = () => null;

function ClauseTooltip({ clause }) {
    if (!clause) return null;
    const s = severityOf(clause);
    return (
        <div className="w-[min(20rem,calc(100vw-2rem))] rounded-none border-2 border-latte-ink bg-latte-surface p-3.5 sm:w-auto sm:max-w-sm sm:p-4">
            <div className="mb-2 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-none ${s.dot}`} />
                <span className={`font-sans text-[10px] font-semibold uppercase tracking-[0.15em] ${s.text}`}>
                    {s.label}
                </span>
                <span className="font-sans text-[9px] font-semibold uppercase tracking-[0.15em] text-latte-subtext">{clause.type}</span>
            </div>
            <p className="font-sans text-xs leading-relaxed text-latte-text">{clause.explanation}</p>
            {clause.legal_basis && (
                <p className="mt-2 border-t border-latte-muted pt-2 font-serif text-xs italic text-latte-subtext">
                    {clause.legal_basis}
                </p>
            )}
        </div>
    );
}

export default function HighlightViewer() {
    const { activeFileUrl, clauses, selectedClause, setSelectedClause, isProcessing } =
        useDocumentStore();

    // The library hands us its scrollTo through a callback ref on `pagesinit`.
    // Keep it in a ref, not state: storing it in state re-renders PdfHighlighter,
    // which remounts the viewer and drops the very function we just captured.
    const scrollToRef = useRef(null);
    // Used to tell whether this pane is actually laid out before scrolling.
    const containerRef = useRef(null);
    // Bumped when scrollTo arrives, so a clause selected before the PDF finished
    // loading still gets scrolled to once it's ready.
    const [scrollReady, setScrollReady] = useState(0);

    const handleScrollRef = useCallback((fn) => {
        scrollToRef.current = fn;
        setScrollReady((n) => n + 1);
    }, []);

    // react-pdf-highlighter 8.0.0-rc.0 calls viewer.setDocument() *before*
    // subscribing to "pagesinit", so its onDocumentReady — the only thing that
    // invokes scrollRef — can miss the event and never hand us scrollTo.
    // Grab the method straight off the component instance as a fallback.
    const highlighterRef = useCallback((inst) => {
        if (inst && typeof inst.scrollTo === 'function' && !scrollToRef.current) {
            scrollToRef.current = inst.scrollTo;
            setScrollReady((n) => n + 1);
        }
    }, []);

    // Map backend clauses onto react-pdf-highlighter's highlight shape.
    // The backend sends absolute PDF points plus the page size it measured, which
    // is exactly what `boundingRect` needs.
    const highlights = useMemo(() => (
        clauses
            .filter((c) => c.bbox)
            .map((c, i) => {
                const b = c.bbox;
                const rect = {
                    x1: b.x1, y1: b.y1, x2: b.x2, y2: b.y2,
                    width: b.width || 595,
                    height: b.height || 842,
                    pageNumber: c.page || 1,
                };
                return {
                    id: String(c.id ?? i),
                    content: { text: c.text },
                    position: { boundingRect: rect, rects: [rect], pageNumber: c.page || 1 },
                    comment: { text: c.explanation, emoji: '' },
                    clause: c,
                };
            })
    ), [clauses]);

    // Scroll the viewer when a clause is picked in the risk feed.
    useEffect(() => {
        if (!scrollToRef.current || !selectedClause) return undefined;
        const target = highlights.find((h) => h.id === String(selectedClause.id));
        if (!target) return undefined;

        // On phones the document pane is behind a tab, so a selection made from
        // the risk feed can fire while this pane is still display:none. pdf.js
        // cannot scroll a hidden element ("offsetParent is not set"), so wait
        // for it to be laid out before scrolling.
        let raf = 0;
        let attempts = 0;
        const scrollWhenVisible = () => {
            const el = containerRef.current;
            const visible = el && el.offsetParent !== null && el.clientHeight > 0;
            if (visible) {
                scrollToRef.current(target);
            } else if (attempts++ < 60) {
                raf = requestAnimationFrame(scrollWhenVisible);
            }
        };
        raf = requestAnimationFrame(scrollWhenVisible);
        return () => cancelAnimationFrame(raf);
    }, [selectedClause, scrollReady, highlights]);

    const renderHighlight = useCallback((
        highlight, index, setTip, hideTip, viewportToScaled, screenshot, isScrolledTo,
    ) => {
        const clause = highlight.clause;
        const s = severityOf(clause);
        const isSelected = String(selectedClause?.id) === highlight.id;
        const active = isSelected || isScrolledTo;

        return (
            <div
                key={highlight.id}
                className={`rakshak-highlight${active ? ' is-active' : ''}`}
                // The library's stylesheet hard-codes a yellow background on
                // .Highlight__part, so the colour is driven through a custom
                // property that our own rule in index.css consumes.
                style={{ '--hl': s.highlight, '--hl-active': s.highlightActive }}
                onMouseEnter={() => setTip(highlight, () => <ClauseTooltip clause={clause} />)}
                onMouseLeave={hideTip}
                onClick={() => setSelectedClause(isSelected ? null : clause)}
            >
                <Highlight
                    position={highlight.position}
                    comment={highlight.comment}
                    isScrolledTo={false}
                />
            </div>
        );
    }, [selectedClause, setSelectedClause]);

    if (!activeFileUrl) return null;

    return (
        <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-latte-muted">
            {isProcessing && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-latte-bg/75 backdrop-blur-[2px]">
                    <div className="flex flex-col items-center gap-4 rounded-none border-2 border-latte-ink bg-latte-surface px-9 py-7">
                        <div className="h-9 w-9 animate-spin rounded-full border-2 border-latte-muted border-t-latte-ink" />
                        <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-latte-ink">
                            Analysing under Indian law…
                        </span>
                    </div>
                </div>
            )}

            <PdfLoader
                url={activeFileUrl}
                workerSrc={workerSrc}
                beforeLoad={
                    <div className="flex h-full items-center justify-center font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-latte-subtext">
                        Loading document…
                    </div>
                }
                errorMessage={
                    <div className="flex h-full items-center justify-center p-6 text-center font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-red-900">
                        Could not display this PDF.
                    </div>
                }
            >
                {(pdfDocument) => (
                    <PdfHighlighter
                        ref={highlighterRef}
                        pdfDocument={pdfDocument}
                        // Fit the page to the pane so a phone shows the full
                        // width instead of a zoomed-in corner of the document.
                        pdfScaleValue="page-width"
                        enableAreaSelection={NO_AREA_SELECTION}
                        onScrollChange={NOOP}
                        scrollRef={handleScrollRef}
                        onSelectionFinished={NO_SELECTION}
                        highlightTransform={renderHighlight}
                        highlights={highlights}
                    />
                )}
            </PdfLoader>
        </div>
    );
}
