// /admin/app/restaurants/:id — view + manage a single restaurant's
// information and menu items.
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, Loader2, RefreshCw, Plus, Pencil, Trash2, X, Save,
  Star, ExternalLink,
} from 'lucide-react';
import { api } from '../../lib/api.js';
import PageHeader from '../components/PageHeader.jsx';

const CATEGORIES = [
  'mains', 'burgers', 'sides', 'bakery',
  'smoothies', 'supplements', 'drinks', 'other',
];

const TIMINGS = [
  'Anytime', 'Pre-Workout', 'Post-Workout', 'Morning',
  'Lunch', 'Recovery', 'Daily', 'Snack', 'Meal Replacement',
];

export default function RestaurantDetail() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null); // null | 'new' | row
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setError(null);
    try {
      const [r, m] = await Promise.all([
        api(`/api/admin/app/restaurants/${id}`),
        api(`/api/admin/app/restaurants/${id}/menu`),
      ]);
      setRestaurant(r.item);
      const items = (m.items ?? []).slice().sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      );
      setMenu(items);
    } catch (e) { setError(e.message); }
  };
  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveItem = async (row) => {
    setBusy(true); setError(null);
    try {
      const isNew = editing === 'new' || editing?.__new === true;
      // strip transient flag + recompute priceCents from dollars
      const { __new, price, ...rest } = row;
      const payload = {
        ...rest,
        priceCents: priceToCents(price ?? rest.priceCents),
        available: row.available ?? true,
        sortOrder: Number(row.sortOrder ?? 0),
        calories: row.calories ? Number(row.calories) : null,
        protein: row.protein ? Number(row.protein) : null,
        carbs: row.carbs ? Number(row.carbs) : null,
      };
      if (isNew) {
        await api(`/api/admin/app/restaurants/${id}/menu`, {
          method: 'POST', body: payload,
        });
      } else {
        const itemId = row.id ?? editing.id;
        await api(
          `/api/admin/app/restaurants/${id}/menu/${encodeURIComponent(itemId)}`,
          { method: 'PATCH', body: payload },
        );
      }
      setEditing(null);
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const deleteItem = async (row) => {
    if (!confirm(`Delete "${row.name}"?`)) return;
    setBusy(true); setError(null);
    try {
      await api(
        `/api/admin/app/restaurants/${id}/menu/${encodeURIComponent(row.id)}`,
        { method: 'DELETE' },
      );
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  if (!restaurant && !error) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="animate-spin text-[#FF7A00]" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow={(
          <Link to="/admin/app/restaurants" className="inline-flex items-center gap-1 text-white/55 hover:text-white">
            <ArrowLeft size={12} /> Restaurants
          </Link>
        )}
        title={restaurant?.name ?? 'Restaurant'}
        description={restaurant?.tagline}
        actions={(
          <>
            <button
              onClick={load}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:text-white"
            >
              <RefreshCw size={12} /> Refresh
            </button>
            <button
              onClick={() => setEditing({ __new: true, available: true, sortOrder: menu?.length ?? 0 })}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#FF7A00] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black"
            >
              <Plus size={14} /> Add menu item
            </button>
          </>
        )}
      />

      {error && <p className="text-red-300 text-sm mb-4">{error}</p>}

      {restaurant && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 mb-6">
          <div className="flex gap-6">
            {restaurant.bannerUrl && (
              <div className="hidden md:block w-32 h-32 rounded-2xl overflow-hidden bg-black/40 shrink-0">
                <img src={restaurant.bannerUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                {restaurant.logoUrl && (
                  <img src={restaurant.logoUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                )}
                <div>
                  <p className="text-lg font-semibold text-white">{restaurant.name}</p>
                  <p className="text-xs text-white/55">{restaurant.tagline}</p>
                </div>
                {restaurant.rating > 0 && (
                  <span className="ml-auto inline-flex items-center gap-1 text-amber-300 text-sm">
                    <Star size={14} fill="currentColor" /> {restaurant.rating}
                  </span>
                )}
              </div>
              {restaurant.address && (
                <p className="text-sm text-white/70">{restaurant.address}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-white/50">
                {restaurant.phone && <span>📞 {restaurant.phone}</span>}
                {restaurant.instagram && <span>📷 {restaurant.instagram}</span>}
                {restaurant.website && (
                  <a href={restaurant.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-white">
                    <ExternalLink size={10} /> {restaurant.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                <span className={restaurant.active ? 'text-emerald-300' : 'text-white/40'}>
                  {restaurant.active ? '● active' : '○ hidden'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
        <header className="border-b border-white/10 px-6 py-3 text-sm uppercase tracking-[0.2em] text-white/55 font-orbitron">
          Menu — {menu?.length ?? 0} item{menu?.length === 1 ? '' : 's'}
        </header>

        {menu === null ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[#FF7A00]" /></div>
        ) : menu.length === 0 ? (
          <div className="p-12 text-center text-white/45">
            No menu items yet. Hit "Add menu item" to start.
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {menu.map(item => (
              <li key={item.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-black/30 shrink-0">
                  {item.imageUrl && <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white truncate">{item.name}</p>
                    {!item.available && <span className="text-[10px] uppercase tracking-wider text-yellow-300">unavailable</span>}
                  </div>
                  <p className="text-xs text-white/55 truncate">{item.description}</p>
                  <div className="flex gap-3 mt-1 text-[10px] uppercase tracking-wider text-white/40">
                    {item.category && <span>{item.category}</span>}
                    {item.timing && <span>{item.timing}</span>}
                    {item.calories != null && <span>{item.calories} kcal</span>}
                    {item.protein != null && <span>{item.protein}g protein</span>}
                  </div>
                </div>
                <span className="text-white font-semibold tabular-nums">
                  {formatPrice(item.priceCents)}
                </span>
                <div className="inline-flex items-center gap-1.5">
                  <button
                    onClick={() => setEditing(item)}
                    className="rounded-full border border-white/10 bg-white/5 p-1.5 hover:border-[#FF7A00]/40 hover:text-[#FF7A00]"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => deleteItem(item)}
                    className="rounded-full border border-white/10 bg-white/5 p-1.5 hover:border-red-400/40 hover:text-red-300"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editing && (
        <MenuItemDrawer
          initial={editing === 'new' ? {} : editing}
          busy={busy}
          onCancel={() => setEditing(null)}
          onSave={saveItem}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────

function priceToCents(v) {
  if (v == null || v === '') return 0;
  const n = typeof v === 'number' ? v : parseFloat(v);
  if (Number.isNaN(n)) return 0;
  // Treat integers > 100 as already-cents (admin convenience);
  // treat values with a decimal as dollars.
  return Math.round(n * 100);
}

function formatPrice(cents) {
  const n = Number(cents ?? 0) / 100;
  return `$${n.toFixed(2)}`;
}

function MenuItemDrawer({ initial, busy, onCancel, onSave }) {
  const [draft, setDraft] = useState(() => ({
    name: '', description: '', category: 'mains', timing: 'Anytime',
    imageUrl: '', priceCents: 0, available: true, sortOrder: 0,
    calories: '', protein: '', carbs: '', athleteTip: '',
    ...initial,
    // Show dollar price in the form for editing comfort.
    price: initial.priceCents != null ? (initial.priceCents / 100).toFixed(2) : '',
  }));

  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md h-full overflow-y-auto bg-[#0a0a0a] border-l border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">{initial.id ? 'Edit menu item' : 'New menu item'}</h2>
          <button onClick={onCancel} className="text-white/55 hover:text-white"><X size={16} /></button>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); onSave(draft); }}
          className="space-y-4"
        >
          <Field label="Name" required>
            <input type="text" required value={draft.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Description">
            <textarea value={draft.description} onChange={(e) => set('description', e.target.value)} rows={3} className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price ($)">
              <input type="number" step="0.01" value={draft.price} onChange={(e) => set('price', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Sort order">
              <input type="number" value={draft.sortOrder ?? 0} onChange={(e) => set('sortOrder', Number(e.target.value))} className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select value={draft.category} onChange={(e) => set('category', e.target.value)} className={inputCls}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Timing">
              <select value={draft.timing ?? 'Anytime'} onChange={(e) => set('timing', e.target.value)} className={inputCls}>
                {TIMINGS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Image URL">
            <input type="url" value={draft.imageUrl} onChange={(e) => set('imageUrl', e.target.value)} className={inputCls} placeholder="https://…" />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Calories"><input type="number" value={draft.calories ?? ''} onChange={(e) => set('calories', e.target.value)} className={inputCls} /></Field>
            <Field label="Protein (g)"><input type="number" value={draft.protein ?? ''} onChange={(e) => set('protein', e.target.value)} className={inputCls} /></Field>
            <Field label="Carbs (g)"><input type="number" value={draft.carbs ?? ''} onChange={(e) => set('carbs', e.target.value)} className={inputCls} /></Field>
          </div>
          <Field label="Athlete tip">
            <textarea value={draft.athleteTip ?? ''} onChange={(e) => set('athleteTip', e.target.value)} rows={2} className={inputCls} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={draft.available !== false}
              onChange={(e) => set('available', e.target.checked)}
              className="accent-[#FF7A00]"
            />
            Available
          </label>

          <div className="pt-4 flex justify-end gap-2 sticky bottom-0 bg-[#0a0a0a]">
            <button type="button" onClick={onCancel} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#FF7A00] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black disabled:opacity-60"
            >
              {busy ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-[#FF7A00]/60";

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs text-white/55 mb-1">
        {label}{required && <span className="text-[#FF7A00]">*</span>}
      </label>
      {children}
    </div>
  );
}
