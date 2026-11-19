import { useEffect, useState } from 'react';
import { Mail, Phone, UserRound, X } from 'lucide-react';

const emptyForm = { name: '', phone: '', email: '', document: '' };

export default function ClientModal({ open, client, onClose, onSave, saving }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(client ? {
        name: client.name || '', phone: client.phone || '', email: client.email || '', document: client.document || '',
      } : emptyForm);
      setErrors({});
    }
  }, [open, client]);

  useEffect(() => {
    if (!open) return undefined;
    function handleKeyDown(event) { if (event.key === 'Escape' && !saving) onClose(); }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, saving]);

  if (!open) return null;

  function change(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setErrors((current) => ({ ...current, [event.target.name]: '' }));
  }

  async function submit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Informe o nome do cliente.';
    if (!form.phone.trim()) nextErrors.phone = 'Informe o telefone.';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Informe um e-mail válido.';
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    await onSave({
      name: form.name.trim(), phone: form.phone.trim(),
      email: form.email.trim() || null, document: form.document.trim() || null,
    });
  }

  const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50';
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="client-modal-title" className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-950/20">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-600">Cadastro de clientes</p><h2 id="client-modal-title" className="mt-1 text-xl font-bold text-slate-900">{client ? 'Editar cliente' : 'Novo cliente'}</h2><p className="mt-1 text-xs text-slate-500">Preencha os dados de contato do cliente.</p></div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Fechar" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4 px-6 py-5">
          <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">Nome completo <span className="text-rose-500">*</span></span><span className="relative block"><UserRound className="absolute left-3.5 top-3.5 text-slate-400" size={17} /><input className={`${fieldClass} pl-10`} name="name" value={form.name} onChange={change} placeholder="Ex.: Ana Souza" autoFocus maxLength={150} aria-invalid={!!errors.name} /></span>{errors.name && <span className="mt-1 block text-xs text-rose-600">{errors.name}</span>}</label>
          <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">Telefone <span className="text-rose-500">*</span></span><span className="relative block"><Phone className="absolute left-3.5 top-3.5 text-slate-400" size={17} /><input className={`${fieldClass} pl-10`} name="phone" value={form.phone} onChange={change} placeholder="(11) 99999-9999" maxLength={30} aria-invalid={!!errors.phone} /></span>{errors.phone && <span className="mt-1 block text-xs text-rose-600">{errors.phone}</span>}</label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">E-mail</span><span className="relative block"><Mail className="absolute left-3.5 top-3.5 text-slate-400" size={17} /><input className={`${fieldClass} pl-10`} type="email" name="email" value={form.email} onChange={change} placeholder="cliente@email.com" maxLength={255} aria-invalid={!!errors.email} /></span>{errors.email && <span className="mt-1 block text-xs text-rose-600">{errors.email}</span>}</label>
            <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">CPF / documento</span><input className={fieldClass} name="document" value={form.document} onChange={change} placeholder="000.000.000-00" maxLength={30} /></label>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} disabled={saving} className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60">{saving ? 'Salvando...' : client ? 'Salvar alterações' : 'Cadastrar cliente'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
