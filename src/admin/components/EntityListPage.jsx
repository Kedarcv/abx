import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Loader2, Plus, Pencil, Trash2, X, Save, RefreshCw, ArrowUpRight } from 'lucide-react';
import { api } from '../../lib/api.js';
import PageHeader from './PageHeader.jsx';

/**
 * Generic CRUD page for ABX-Motion / storefront admin collections.
 * Renders a list, lets staff add/edit/delete docs, and uses a JSON editor
 * for the body. Each field definition gets a proper input.
 *
 * Props:
 *   endpoint   — e.g. '/api/admin/app/promos'
 *   idKey      — defaults to 'id'
 *   eyebrow, title, description
 *   columns    — [{ key, label, format?: (v, row) => string }]  shown in list
 *   fields     — [{ name, label, type: 'text'|'textarea'|'number'|'boolean'|'date'|'json'|'image-key', required? }]
 *   newDefaults — initial value for the create form
 */
export default function EntityListPage({
  endpoint, idKey = 'id',
  eyebrow = 'Admin', title, description,
  columns = [], fields = [], newDefaults = {},
  /** Optional: (row) => '/some/path/:id' — renders an open-detail action. */
  detailHref,
}) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null); // null | 'new' | row
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await api(endpoint);
      setItems(data.items ?? []);
    } catch (e) { setError(e.message); setItems([]); }
  }, [endpoint]);

  useEffect(() => { load(); }, [load]);

  const save = async (row) => {
    setBusy(true); setError(null);
    try {
      const isNew = editing === 'new' || editing?.__new === true;
      if (isNew) {
        // Don't send the synthetic flag to the server
        const { __new: _omit, ...payload } = row;
        await api(endpoint, { method: 'POST', body: payload });
      } else {
        const targetId = row[idKey] ?? editing[idKey];
        if (!targetId) throw new Error('Missing id for update');
        await api(`${endpoint}/${encodeURIComponent(targetId)}`, { method: 'PATCH', body: row });
      }
      setEditing(null);
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const del = async (row) => {
    if (!confirm(`Archive “${row.name ?? row.title ?? row[idKey]}”?`)) return;
    setBusy(true); setError(null);
    try {
      await api(`${endpoint}/${row[idKey]}`, { method: 'DELETE' });
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const startNew = () => setEditing({ __new: true, ...newDefaults });

  return (
    <div>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={
          <>
            <button onClick={load} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:text-white">
              <RefreshCw size={12} /> Refresh
            </button>
            <button onClick={startNew} className="inline-flex items-center gap-1.5 rounded-full bg-[#FF7A00] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black">
              <Plus size={14} /> New
            </button>
          </>
        }
      />

      {error && <p className="text-red-300 text-sm mb-4">{error}</p>}

      {items === null ? (
        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[#FF7A00]" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center text-white/45">
          No entries yet. Hit “New” to create your first one.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-white/[0.04] text-left text-white/55">
              <tr>
                {columns.map(c => <th key={c.key} className="px-4 py-3 font-medium">{c.label}</th>)}
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map(row => (
                <tr key={row[idKey]} className="hover:bg-white/[0.02]">
                  {columns.map(c => (
                    <td key={c.key} className="px-4 py-3 align-middle">
                      {c.format ? c.format(row[c.key], row) : String(row[c.key] ?? '—')}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {detailHref && (
                        <Link
                          to={detailHref(row)}
                          className="rounded-full border border-white/10 bg-white/5 p-1.5 hover:border-[#FF7A00]/40 hover:text-[#FF7A00]"
                          aria-label="Open"
                        >
                          <ArrowUpRight size={12} />
                        </Link>
                      )}
                      <button onClick={() => setEditing(row)} className="rounded-full border border-white/10 bg-white/5 p-1.5 hover:border-[#FF7A00]/40 hover:text-[#FF7A00]">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => del(row)} className="rounded-full border border-white/10 bg-white/5 p-1.5 hover:border-red-400/40 hover:text-red-300">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <EditDrawer
            initial={editing === 'new' ? { ...newDefaults } : editing}
            isNew={!!editing.__new}
            fields={fields}
            onSave={save}
            onClose={() => setEditing(null)}
            busy={busy}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function EditDrawer({ initial, isNew, fields, onSave, onClose, busy }) {
  const [draft, setDraft] = useState(() => {
    const d = { ...initial };
    delete d.__new;
    return d;
  });

  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));
  const fieldDefs = useMemo(() => fields.length ? fields : inferFields(initial), [fields, initial]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
      />
      <motion.aside
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 36 }}
        className="fixed right-0 top-0 z-[80] flex h-full w-full max-w-lg flex-col border-l border-white/10 bg-[#0a0a0a] text-white shadow-[0_0_60px_rgba(0,0,0,0.6)]"
      >
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <p className="text-sm uppercase tracking-[0.25em] text-white/55 font-orbitron">
            {isNew ? 'New entry' : 'Edit entry'}
          </p>
          <button onClick={onClose} className="p-1 text-white/55 hover:text-white"><X size={18} /></button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {fieldDefs.map(f => (
            <FieldInput key={f.name} field={f} value={draft[f.name]} onChange={(v) => set(f.name, v)} />
          ))}
        </div>

        <footer className="border-t border-white/10 p-4 flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/65 hover:text-white">
            Cancel
          </button>
          <button
            onClick={() => onSave(draft)}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#FF7A00] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-black disabled:opacity-60"
          >
            {busy ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            {isNew ? 'Create' : 'Save changes'}
          </button>
        </footer>
      </motion.aside>
    </>
  );
}

function FieldInput({ field, value, onChange }) {
  const cls = 'w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#FF7A00]/60';
  if (field.type === 'textarea') {
    return (
      <label className="block">
        <span className="mb-1 block text-xs text-white/55">{field.label}</span>
        <textarea rows={4} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={cls} />
      </label>
    );
  }
  if (field.type === 'boolean') {
    return (
      <label className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm cursor-pointer">
        <span className="text-white/75">{field.label}</span>
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="accent-[#FF7A00]" />
      </label>
    );
  }
  if (field.type === 'number') {
    return (
      <label className="block">
        <span className="mb-1 block text-xs text-white/55">{field.label}</span>
        <input
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          className={cls}
        />
      </label>
    );
  }
  if (field.type === 'date') {
    return (
      <label className="block">
        <span className="mb-1 block text-xs text-white/55">{field.label}</span>
        <input type="datetime-local" value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={cls} />
      </label>
    );
  }
  if (field.type === 'json') {
    return (
      <label className="block">
        <span className="mb-1 block text-xs text-white/55">{field.label} <span className="text-white/30">(JSON)</span></span>
        <textarea
          rows={6}
          value={typeof value === 'string' ? value : JSON.stringify(value ?? null, null, 2)}
          onChange={(e) => {
            try { onChange(JSON.parse(e.target.value)); }
            catch { onChange(e.target.value); }
          }}
          className={`${cls} font-mono text-xs`}
        />
      </label>
    );
  }
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-white/55">{field.label}</span>
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={cls}
        placeholder={field.placeholder}
      />
    </label>
  );
}

function inferFields(obj) {
  return Object.keys(obj || {})
    .filter(k => !['id','createdAt','updatedAt','createdBy','updatedBy','archivedAt'].includes(k))
    .map(k => {
      const v = obj[k];
      let type = 'text';
      if (typeof v === 'boolean') type = 'boolean';
      else if (typeof v === 'number') type = 'number';
      else if (typeof v === 'object' && v !== null) type = 'json';
      else if (typeof v === 'string' && v.length > 80) type = 'textarea';
      return { name: k, label: humanize(k), type };
    });
}

function humanize(k) {
  return k.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
}
