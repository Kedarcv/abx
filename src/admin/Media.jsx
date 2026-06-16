import { useEffect, useRef, useState } from 'react';
import { Loader2, RefreshCw, Upload, Trash2 } from 'lucide-react';
import { api } from '../lib/api.js';
import { uploadImage } from '../lib/uploadImage.js';
import PageHeader from './components/PageHeader.jsx';

const KINDS = ['product', 'collection', 'site', 'lookbook'];

export default function Media() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [kind, setKind] = useState('product');
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const load = async () => {
    setError(null);
    try {
      const data = await api('/api/admin/media?limit=120');
      setItems(data.items ?? []);
    } catch (e) { setError(e.message); setItems([]); }
  };
  useEffect(() => { load(); }, []);

  const onPick = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true); setError(null);
    try {
      for (const file of files) {
        await uploadImage(file, { kind, alt: file.name });
      }
      await load();
    } catch (err) { setError(err.message); }
    finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const del = async (asset) => {
    if (!confirm('Delete this media asset?')) return;
    try {
      await api(`/api/admin/media/${asset.id}`, { method: 'DELETE' });
      await load();
    } catch (e) { setError(e.message); }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Storefront"
        title="Media library"
        description="Images uploaded here go to Cloudflare R2 via the shared Worker."
        actions={
          <>
            <select value={kind} onChange={(e) => setKind(e.target.value)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
              {KINDS.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={onPick} />
            <button onClick={() => inputRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-1.5 rounded-full bg-[#FF7A00] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black disabled:opacity-60">
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={14} />}
              Upload
            </button>
            <button onClick={load} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:text-white">
              <RefreshCw size={12} /> Refresh
            </button>
          </>
        }
      />

      {error && <p className="text-red-300 text-sm mb-4">{error}</p>}

      {items === null ? <Loader2 className="animate-spin text-[#FF7A00] mx-auto block my-12" /> :
        items.length === 0 ? <p className="text-center text-white/45 py-12">No media yet.</p> : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {items.map(a => (
              <li key={a.id} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                <div className="relative aspect-square bg-black/40">
                  <img src={a.url} alt={a.alt ?? ''} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                </div>
                <div className="p-2.5">
                  <p className="text-[11px] text-white/65 font-mono truncate" title={a.key}>{a.key.split('/').pop()}</p>
                  <p className="text-[10px] text-white/40 mt-0.5">{(a.sizeBytes/1024).toFixed(0)} KB · {a.mime}</p>
                </div>
                <button
                  onClick={() => del(a)}
                  className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
}
