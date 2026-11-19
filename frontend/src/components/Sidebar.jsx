import { useState } from 'react';
import { Activity, Box, ClipboardList, DollarSign, LayoutDashboard, Menu, Settings, Users, Wrench, X } from 'lucide-react';

const items = [['Visão geral', 'dashboard', LayoutDashboard], ['Ordens de serviço', 'orders', ClipboardList], ['Clientes', 'clients', Users], ['Estoque', 'stock', Box], ['Serviços', 'services', Wrench], ['Financeiro', 'finance', DollarSign]];

export default function Sidebar({ page = 'clients', onNavigate }) {
  const [open, setOpen] = useState(false);
  const go = target => { setOpen(false); onNavigate?.(target); };
  return <>
    <button onClick={() => setOpen(!open)} className="fixed left-4 top-4 z-50 rounded-xl border border-slate-200 bg-white p-2.5 lg:hidden">{open ? <X size={20} /> : <Menu size={20} />}</button>
    {open && <button className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" onClick={() => setOpen(false)} />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-[76px] items-center gap-3 border-b border-slate-100 px-6"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white"><Activity size={22} /></div><div><p className="text-lg font-extrabold">Fix<span className="text-indigo-600">Tech</span></p><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-slate-400">gestão técnica</p></div></div>
      <div className="px-4 pt-7"><p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Menu principal</p><nav className="space-y-1">{items.map(([label, target, Icon]) => { const active = page === target; return <button key={target} onClick={() => go(target)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}><Icon size={18} /><span className="flex-1">{label}</span>{active && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}</button>; })}</nav></div>
      <div className="mt-auto px-4 pb-5"><button onClick={() => go('settings')} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold ${page === 'settings' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}><Settings size={18} />Configurações</button></div>
    </aside>
  </>;
}
