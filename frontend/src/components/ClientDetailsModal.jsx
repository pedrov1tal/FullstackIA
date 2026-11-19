import { X } from 'lucide-react';

export default function ClientDetailsModal({ client, onClose }) {
  if (!client) return null;
  const fields = [
    ['Telefone', client.phone], ['E-mail', client.email || 'Não informado'],
    ['CPF / documento', client.document || 'Não informado'],
    ['Cliente desde', client.createdAt ? new Date(client.createdAt).toLocaleDateString('pt-BR') : '—'],
  ];
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="client-details-title" className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-6"><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-600">Ficha do cliente</p><h2 id="client-details-title" className="mt-1 text-xl font-bold text-slate-900">{client.name}</h2></div><button onClick={onClose} aria-label="Fechar" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button></div>
        <div className="grid grid-cols-2 gap-3 p-6">{fields.map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-3.5"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1.5 break-words text-sm font-semibold text-slate-800">{value}</p></div>)}</div>
        <div className="flex justify-end border-t border-slate-100 px-6 py-4"><button onClick={onClose} className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200">Fechar</button></div>
      </section>
    </div>
  );
}
