import { useState } from 'react';
import {
  Activity, Box, ChevronLeft, ChevronRight, ClipboardList, LayoutDashboard,
  Menu, Settings, Users, Wrench, X,
} from 'lucide-react';

const navigation = [
  { label: 'Visão geral', icon: LayoutDashboard },
  { label: 'Ordens de serviço', icon: ClipboardList, badge: '12' },
  { label: 'Clientes', icon: Users, active: true },
  { label: 'Estoque', icon: Box },
  { label: 'Serviços', icon: Wrench },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        onClick={() => setOpen(!open)}
        className="fixed left-4 top-4 z-50 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm lg:hidden"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      {open && <button className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" onClick={() => setOpen(false)} aria-label="Fechar menu" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-[76px] items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200"><Activity size={22} strokeWidth={2.5} /></div>
          <div>
            <p className="text-lg font-extrabold tracking-tight text-slate-900">Fix<span className="text-indigo-600">Tech</span></p>
            <p className="-mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">gestão técnica</p>
          </div>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Menu principal</p>
          <nav className="space-y-1" aria-label="Navegação principal">
            {navigation.map(({ label, icon: Icon, active, badge }) => (
              <a
                key={label}
                href="#"
                onClick={(event) => { event.preventDefault(); setOpen(false); }}
                aria-current={active ? 'page' : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
              >
                <Icon size={18} strokeWidth={active ? 2.3 : 1.9} />
                <span className="flex-1">{label}</span>
                {badge && <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{badge}</span>}
                {active && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-auto px-4 pb-5">
          <div className="mb-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white">
            <p className="text-xs font-bold">Precisa de ajuda?</p>
            <p className="mt-1 text-[11px] leading-relaxed text-indigo-100">Acesse nossa central de suporte FixTech.</p>
            <button className="mt-3 rounded-lg bg-white/15 px-3 py-1.5 text-[11px] font-semibold hover:bg-white/25">Central de ajuda</button>
          </div>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800"><Settings size={18} /> Configurações</button>
          <div className="mt-4 flex items-center gap-3 border-t border-slate-100 px-2 pt-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">MC</div>
            <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-800">Marcos Costa</p><p className="text-[10px] text-slate-400">Administrador</p></div>
            <button aria-label="Alternar largura do menu" className="hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:block"><ChevronLeft size={16} /></button>
          </div>
        </div>
      </aside>
    </>
  );
}
