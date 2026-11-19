import { useMemo } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, Pencil, Search, Trash2, Users } from 'lucide-react';

function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?';
}

export default function ClientsTable({ clients, search, onSearchChange, onView, onEdit, onDelete, loading }) {
  const visibleClients = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    if (!term) return clients;
    return clients.filter((client) => [client.name, client.email, client.phone, client.document].filter(Boolean).some((value) => value.toLocaleLowerCase('pt-BR').includes(term)));
  }, [clients, search]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div><h2 className="text-sm font-bold text-slate-800">Todos os clientes <span className="ml-1.5 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">{clients.length}</span></h2><p className="mt-1 text-xs text-slate-400">Consulte e gerencie sua base de clientes.</p></div>
        <label className="relative block w-full sm:w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Buscar cliente..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50" aria-label="Pesquisar clientes" /></label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead><tr className="bg-slate-50/70 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400"><th className="px-6 py-3.5">Cliente <ArrowDown className="ml-1 inline" size={12} /></th><th className="px-5 py-3.5">Telefone</th><th className="px-5 py-3.5">E-mail</th><th className="px-5 py-3.5">Documento</th><th className="px-5 py-3.5">Cadastro</th><th className="px-6 py-3.5 text-right">Ações</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? <tr><td colSpan="6" className="px-6 py-16 text-center"><span className="mx-auto block h-7 w-7 animate-spin rounded-full border-2 border-indigo-100 border-t-indigo-600" /><span className="mt-3 block text-xs text-slate-500">Carregando clientes...</span></td></tr>
              : visibleClients.length === 0 ? <tr><td colSpan="6" className="px-6 py-16 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Users size={22} /></div><p className="mt-3 text-sm font-semibold text-slate-700">{search ? 'Nenhum resultado encontrado' : 'Sua lista está vazia'}</p><p className="mt-1 text-xs text-slate-400">{search ? 'Tente buscar por outro nome, e-mail ou telefone.' : 'Cadastre seu primeiro cliente para começar.'}</p></td></tr>
                : visibleClients.map((client, index) => <tr key={client.id} className="transition hover:bg-slate-50/70"><td className="px-6 py-3.5"><div className="flex items-center gap-3"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold ${['bg-violet-100 text-violet-700', 'bg-sky-100 text-sky-700', 'bg-amber-100 text-amber-700', 'bg-emerald-100 text-emerald-700'][index % 4]}`}>{initials(client.name)}</div><span className="text-xs font-bold text-slate-800">{client.name}</span></div></td><td className="px-5 py-3.5 text-xs text-slate-600">{client.phone}</td><td className="px-5 py-3.5 text-xs text-slate-500">{client.email || <span className="text-slate-300">—</span>}</td><td className="px-5 py-3.5 text-xs text-slate-500">{client.document || <span className="text-slate-300">—</span>}</td><td className="px-5 py-3.5 text-xs text-slate-500">{client.createdAt ? new Date(client.createdAt).toLocaleDateString('pt-BR') : '—'}</td><td className="px-6 py-3.5"><div className="flex justify-end gap-1"><button aria-label={`Visualizar ${client.name}`} title="Visualizar" onClick={() => onView(client)} className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"><Eye size={16} /></button><button aria-label={`Editar ${client.name}`} title="Editar" onClick={() => onEdit(client)} className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600"><Pencil size={15} /></button><button aria-label={`Excluir ${client.name}`} title="Excluir" onClick={() => onDelete(client)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></button></div></td></tr>)}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5 text-[11px] text-slate-400 sm:px-6"><span>Exibindo <strong className="text-slate-600">{visibleClients.length}</strong> de <strong className="text-slate-600">{clients.length}</strong> clientes</span><button disabled className="flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-slate-300"><ArrowUpDown size={13} /> Ordenar</button></div>
    </section>
  );
}
