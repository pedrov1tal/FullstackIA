import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({ client, deleting, onCancel, onConfirm }) {
  if (!client) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget && !deleting) onCancel(); }}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="delete-title" className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><AlertTriangle size={21} /></div><button onClick={onCancel} disabled={deleting} aria-label="Fechar" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button></div>
        <h2 id="delete-title" className="mt-4 text-lg font-bold text-slate-900">Excluir cliente?</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">O cadastro de <strong className="text-slate-700">{client.name}</strong> será removido. Clientes vinculados a aparelhos ou ordens não podem ser excluídos.</p>
        <div className="mt-6 flex justify-end gap-2"><button onClick={onCancel} disabled={deleting} className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancelar</button><button onClick={onConfirm} disabled={deleting} className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60">{deleting ? 'Excluindo...' : 'Excluir cliente'}</button></div>
      </section>
    </div>
  );
}
