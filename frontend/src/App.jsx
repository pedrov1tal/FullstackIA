import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Plus, Users, UserRoundPlus, RefreshCw, Smartphone, TrendingUp } from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import PageHeader from './components/PageHeader.jsx';
import ClientsTable from './components/ClientsTable.jsx';
import ClientModal from './components/ClientModal.jsx';
import ClientDetailsModal from './components/ClientDetailsModal.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import { clientsApi, getApiErrorMessage } from './services/api.js';

function StatCard({ label, value, note, icon: Icon, tone }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/30 sm:p-5"><div className="flex items-start justify-between"><div><p className="text-[11px] font-semibold text-slate-400">{label}</p><p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{value}</p></div><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon size={19} /></div></div><p className="mt-3 flex items-center gap-1 text-[10px] text-slate-400"><TrendingUp size={12} className="text-emerald-500" />{note}</p></div>;
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(onClose, 4500);
    return () => window.clearTimeout(timer);
  }, [message, onClose]);
  if (!message) return null;
  return <div role="status" className={`fixed bottom-5 right-5 z-[80] max-w-sm rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>{message}<button onClick={onClose} className="ml-4 font-bold opacity-60" aria-label="Dispensar aviso">×</button></div>;
}

export default function App() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [editingClient, setEditingClient] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewingClient, setViewingClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const notify = useCallback((message, type = 'success') => setToast({ message, type }), []);

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      setClients(await clientsApi.list());
    } catch (error) {
      notify(getApiErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { loadClients(); }, [loadClients]);

  const thisMonthCount = useMemo(() => clients.filter((client) => {
    const created = new Date(client.createdAt);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length, [clients]);

  function openCreate() { setEditingClient(null); setModalOpen(true); }
  function openEdit(client) { setEditingClient(client); setModalOpen(true); }
  function closeForm() { if (!saving) setModalOpen(false); }

  async function saveClient(payload) {
    setSaving(true);
    try {
      if (editingClient) {
        const updated = await clientsApi.update(editingClient.id, payload);
        setClients((current) => current.map((client) => client.id === updated.id ? updated : client));
        notify('Dados do cliente atualizados.');
      } else {
        const created = await clientsApi.create(payload);
        setClients((current) => [created, ...current]);
        notify('Cliente cadastrado com sucesso.');
      }
      setModalOpen(false);
    } catch (error) {
      notify(getApiErrorMessage(error), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function removeClient() {
    if (!deletingClient) return;
    setDeleting(true);
    try {
      await clientsApi.remove(deletingClient.id);
      setClients((current) => current.filter((client) => client.id !== deletingClient.id));
      setDeletingClient(null);
      notify('Cliente excluído.');
    } catch (error) {
      notify(getApiErrorMessage(error), 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-800">
      <Sidebar />
      <div className="min-h-screen lg:pl-[260px]">
        <PageHeader />
        <main className="mx-auto max-w-[1440px] px-4 pb-10 pt-7 sm:px-7 sm:pt-9 lg:px-9">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-indigo-600"><span className="h-px w-5 bg-indigo-400" />Relacionamento</div><h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[30px]">Clientes</h1><p className="mt-1.5 max-w-lg text-xs leading-relaxed text-slate-500 sm:text-sm">Gerencie os clientes da sua assistência técnica em um só lugar.</p></div>
            <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700"><Plus size={17} strokeWidth={2.5} />Cadastrar cliente</button>
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Total de clientes" value={loading ? '—' : clients.length} note="Base cadastrada no sistema" icon={Users} tone="bg-indigo-50 text-indigo-600" />
            <StatCard label="Novos este mês" value={loading ? '—' : thisMonthCount} note="Cadastros no mês atual" icon={UserRoundPlus} tone="bg-emerald-50 text-emerald-600" />
            <div className="hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white shadow-sm xl:block"><div className="flex items-start justify-between"><div><p className="text-[11px] font-semibold text-indigo-100">Atendimento organizado</p><p className="mt-2 max-w-[190px] text-lg font-bold leading-snug">Conheça melhor cada cliente.</p></div><div className="rounded-xl bg-white/15 p-2.5"><Smartphone size={19} /></div></div><p className="mt-3 flex items-center gap-1 text-[10px] text-indigo-100">Acesse o histórico pela ficha do cliente <ArrowUpRight size={12} /></p></div>
          </div>

          <ClientsTable clients={clients} search={search} onSearchChange={setSearch} onView={setViewingClient} onEdit={openEdit} onDelete={setDeletingClient} loading={loading} />
          <div className="mt-4 flex justify-end"><button onClick={loadClients} disabled={loading} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-semibold text-slate-400 transition hover:bg-white hover:text-indigo-600 disabled:opacity-50"><RefreshCw size={13} className={loading ? 'animate-spin' : ''} />Atualizar lista</button></div>
        </main>
      </div>

      <ClientModal open={modalOpen} client={editingClient} onClose={closeForm} onSave={saveClient} saving={saving} />
      <ClientDetailsModal client={viewingClient} onClose={() => setViewingClient(null)} />
      <ConfirmDialog client={deletingClient} deleting={deleting} onCancel={() => { if (!deleting) setDeletingClient(null); }} onConfirm={removeClient} />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast((current) => ({ ...current, message: '' }))} />
    </div>
  );
}
