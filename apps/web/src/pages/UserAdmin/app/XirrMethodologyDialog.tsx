import { useEffect, useId, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPortfolioMethodology } from '@/api/recommendations-apis';
import { methodologyBlocks } from './methodology-content';

export default function XirrMethodologyDialog() {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const { data, isPending, isError, isFetching, refetch } = useQuery({
    queryKey: ['portfolio-xirr-methodology'], queryFn: getPortfolioMethodology,
    enabled: open, staleTime: 60000, retry: 1,
  });
  useEffect(() => {
    if (!open) return;
    dialog.current?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);
  return <>
    <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className="rounded-lg border border-white/20 px-3 py-2 text-xs text-slate-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">View methodology</button>
    <dialog ref={dialog} aria-labelledby={titleId} onClose={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/70">
      <div className="flex max-h-[90dvh] flex-col">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-6">
          <h2 id={titleId} className="text-lg font-semibold">XIRR methodology</h2>
          <button type="button" autoFocus onClick={() => dialog.current?.close()} className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" aria-label="Close XIRR methodology">Close</button>
        </div>
        <div className="min-h-0 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
          {isPending && <p role="status" className="py-8 text-center text-sm text-slate-600">Loading methodology…</p>}
          {isError && <div role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            <p>{data ? 'Could not refresh. Showing the last available methodology.' : 'The methodology could not be loaded. Please try again.'}</p>
            <button type="button" onClick={() => refetch()} disabled={isFetching} className="mt-3 rounded border border-rose-300 px-3 py-1.5 font-medium disabled:opacity-50">Retry</button>
          </div>}
          {data && <div className="space-y-5 text-sm leading-7">
            {methodologyBlocks(data.rows).map((block, index) => block.kind === 'text'
              ? <div key={index} className="whitespace-pre-wrap break-words">{block.cells.map((cell, cellIndex) => index === 0 && cellIndex === 0
                ? <h3 key={cellIndex} className="text-lg font-semibold leading-7">{cell}</h3>
                : <p key={cellIndex} className={cell === 'Executive Summary' ? 'font-semibold' : ''}>{cell}</p>)}</div>
              : <section key={index} aria-label={block.headers[0]} className="overflow-hidden rounded-xl border border-slate-200">
                <h3 className="bg-slate-100 px-4 py-3 font-semibold">{block.headers[0]}</h3>
                <div className="divide-y divide-slate-200">{block.rows.map((row, rowIndex) => <div key={rowIndex} className="space-y-2 p-4">
                  <h4 className="font-semibold">{row[0]}</h4>
                  {row.slice(1).map((cell, cellIndex) => <div key={cellIndex} className="whitespace-pre-wrap break-words">
                    <p className="text-xs font-semibold text-slate-500">{block.headers[cellIndex + 1] || 'Details'}</p><p>{cell}</p>
                  </div>)}
                </div>)}</div>
              </section>)}
          </div>}
        </div>
      </div>
    </dialog>
  </>;
}
