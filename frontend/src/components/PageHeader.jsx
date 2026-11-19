import { Bell, ChevronRight, Search } from 'lucide-react';

export default function PageHeader() {
  return (
    <header className="flex h-[76px] items-center justify-between border-b border-slate-200 bg-white px-5 pl-[76px] sm:px-8 sm:pl-[84px] lg:pl-8">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="hidden sm:inline">Painel</span><ChevronRight className="hidden sm:block" size={14} />
        <span className="font-semibold text-slate-700">Clientes</span>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <button aria-label="Pesquisar" className="rounded-xl p-2.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"><Search size={19} /></button>
        <button aria-label="Notificações" className="relative rounded-xl p-2.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"><Bell size={19} /><span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-rose-500" /></button>
        <span className="hidden h-8 w-px bg-slate-200 sm:block" />
        <div className="flex items-center gap-2.5">
          <div className="hidden text-right sm:block"><p className="text-xs font-bold text-slate-800">Marcos Costa</p><p className="text-[10px] text-slate-400">Administrador</p></div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700 ring-2 ring-white">MC</div>
        </div>
      </div>
    </header>
  );
}
