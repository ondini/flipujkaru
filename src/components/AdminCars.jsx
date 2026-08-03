import { useEffect, useRef, useState } from 'react';
import { Car, Plus, Pencil, Trash2, Save, X, Upload, Loader2, ImageOff, Star } from 'lucide-react';
import { supabase } from '../lib/supabase.js';
import { optimizeImage } from '../lib/optimizeImage.js';
import { czk } from '../data/content.js';

const EMPTY = {
  brand: '', model: '', year: 2020, km: 0, price: 0, category: 'denni',
  engine: '', condition: 'A', vat: true, badge_text: '', badge_tone: '',
  image_url: '', images: [], status: 'published', sort: 0,
};

const CATEGORIES = [
  { v: 'denni', l: 'Denní ježdění' },
  { v: 'sportovni', l: 'Sportovní' },
  { v: 'investicni', l: 'Investiční' },
];
const BADGES = [
  { v: '', l: 'Bez štítku', tone: '' },
  { v: 'TOP STAV', l: 'TOP STAV', tone: 'accent' },
  { v: 'NOVINKA', l: 'NOVINKA', tone: 'new' },
  { v: 'INVESTICE', l: 'INVESTICE', tone: 'accent' },
  { v: 'PRODÁNO', l: 'PRODÁNO', tone: 'sold' },
];
const STATUSES = [
  { v: 'published', l: 'Zveřejněno' },
  { v: 'sold', l: 'Prodáno' },
  { v: 'draft', l: 'Koncept (skryté)' },
];

export default function AdminCars() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // objekt auta nebo null
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('cars').select('*').order('sort').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setList(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const remove = async (car) => {
    if (!window.confirm(`Smazat ${car.brand} ${car.model}?`)) return;
    const { error } = await supabase.from('cars').delete().eq('id', car.id);
    if (error) setError(error.message);
    else load();
  };

  if (editing) {
    return <CarForm car={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="inline-flex items-center gap-2 font-display text-2xl font-bold text-white"><Car className="h-5 w-5 text-accent" /> Správa aut</h1>
          <p className="mt-1 text-sm text-zinc-400">Přidávej, upravuj a maž inzeráty. Změny se hned projeví na webu.</p>
        </div>
        <button onClick={() => setEditing(EMPTY)} className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-ink-950 shadow-glow transition hover:brightness-110">
          <Plus className="h-4 w-4" /> Přidat auto
        </button>
      </div>

      {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-zinc-400"><Loader2 className="h-4 w-4 animate-spin" /> Načítám…</div>
      ) : list.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-ink-850 p-6 text-center text-zinc-400">Zatím žádná auta. Klikni na „Přidat auto".</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          {list.map((c, i) => (
            <div key={c.id} className={`flex items-center gap-4 bg-ink-850 px-4 py-3 ${i > 0 ? 'border-t border-white/5' : ''}`}>
              <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-800">
                {c.image_url ? <img src={c.image_url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-zinc-600"><ImageOff className="h-4 w-4" /></div>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">{c.brand} {c.model}</div>
                <div className="text-xs text-zinc-500">{c.year} · {czk(c.price)}</div>
              </div>
              <span className={`hidden rounded-md px-2 py-0.5 text-xs font-bold sm:inline ${c.status === 'published' ? 'bg-accent-soft text-accent' : c.status === 'sold' ? 'bg-red-500/15 text-red-400' : 'bg-white/10 text-zinc-400'}`}>
                {STATUSES.find((s) => s.v === c.status)?.l || c.status}
              </span>
              <button onClick={() => setEditing(c)} aria-label="Upravit" className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-zinc-400 transition hover:text-white"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => remove(c)} aria-label="Smazat" className="grid h-9 w-9 place-items-center rounded-lg border border-red-500/20 text-red-400 transition hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Formulář auta ---------- */
function CarForm({ car, onClose, onSaved }) {
  const initImages = car?.images?.length ? car.images : car?.image_url ? [car.image_url] : [];
  const [f, setF] = useState({ ...EMPTY, ...car, images: initImages });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  // Nahrání více fotek najednou
  const uploadPhotos = async (files) => {
    setUploading(true); setError('');
    try {
      const urls = [];
      for (const raw of files) {
        const file = await optimizeImage(raw); // zmenšení + WebP před uploadem
        const ext = file.name.split('.').pop();
        const path = `${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
        const { error: upErr } = await supabase.storage.from('car-photos').upload(path, file, { upsert: false, contentType: file.type });
        if (upErr) throw upErr;
        urls.push(supabase.storage.from('car-photos').getPublicUrl(path).data.publicUrl);
      }
      setF((p) => ({ ...p, images: [...p.images, ...urls] }));
    } catch (e) {
      setError('Nahrání fotky selhalo: ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (i) => setF((p) => ({ ...p, images: p.images.filter((_, j) => j !== i) }));
  const makeCover = (i) => setF((p) => { const arr = [...p.images]; const [x] = arr.splice(i, 1); return { ...p, images: [x, ...arr] }; });
  const addByUrl = (url) => { if (url.trim()) setF((p) => ({ ...p, images: [...p.images, url.trim()] })); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    // Doplň tón štítku podle vybraného textu
    const tone = BADGES.find((b) => b.v === f.badge_text)?.tone || null;
    const payload = {
      brand: f.brand, model: f.model, year: Number(f.year) || null, km: Number(f.km) || null,
      price: Number(f.price) || null, category: f.category, engine: f.engine || null,
      condition: f.condition || null, vat: !!f.vat, badge_text: f.badge_text || null,
      badge_tone: tone, images: f.images, image_url: f.images[0] || null, status: f.status, sort: Number(f.sort) || 0,
    };
    const q = car.id ? supabase.from('cars').update(payload).eq('id', car.id) : supabase.from('cars').insert(payload);
    const { error } = await q;
    if (error) { setError(error.message); setSaving(false); }
    else onSaved();
  };

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">{car.id ? 'Upravit auto' : 'Nové auto'}</h1>
        <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:text-white"><X className="h-4 w-4" /> Zpět</button>
      </div>

      {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}

      {/* Fotky vozu (galerie) */}
      <div className="rounded-2xl border border-white/10 bg-ink-850 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display font-bold text-white">Fotky vozu</h3>
          <span className="text-xs text-zinc-500">{f.images.length} fotek · první je hlavní</span>
        </div>

        {/* Mřížka náhledů */}
        {f.images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {f.images.map((url, i) => (
              <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-ink-800">
                <img src={url} alt="" className="h-full w-full object-cover" />
                {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-bold text-ink-950">HLAVNÍ</span>}
                <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-ink-950/90 to-transparent p-1.5 opacity-0 transition group-hover:opacity-100">
                  {i !== 0 && (
                    <button type="button" onClick={() => makeCover(i)} title="Nastavit jako hlavní" className="grid h-7 w-7 place-items-center rounded-md bg-ink-950/80 text-accent hover:bg-ink-950"><Star className="h-3.5 w-3.5" /></button>
                  )}
                  <button type="button" onClick={() => removeImage(i)} title="Smazat" className="grid h-7 w-7 place-items-center rounded-md bg-ink-950/80 text-red-400 hover:bg-ink-950"><X className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Nahrávání + odkaz */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files.length && uploadPhotos([...e.target.files])} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Nahrát fotky
            </button>
          </div>
          <UrlAdder onAdd={addByUrl} />
        </div>
        {f.images.length === 0 && <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-zinc-500"><ImageOff className="h-3.5 w-3.5" /> Zatím žádné fotky — přidej aspoň jednu.</p>}
      </div>

      {/* Pole */}
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-ink-850 p-5 sm:grid-cols-2">
        <Input label="Značka" value={f.brand} onChange={(v) => set('brand', v)} placeholder="BMW" required />
        <Input label="Model" value={f.model} onChange={(v) => set('model', v)} placeholder="M2 Competition" required />
        <Input label="Rok" type="number" value={f.year} onChange={(v) => set('year', v)} />
        <Input label="Najeto (km)" type="number" value={f.km} onChange={(v) => set('km', v)} />
        <Input label="Cena (Kč)" type="number" value={f.price} onChange={(v) => set('price', v)} />
        <Input label="Motorizace" value={f.engine} onChange={(v) => set('engine', v)} placeholder="3.0 R6 • 410 koní" />
        <Input label="Stav" value={f.condition} onChange={(v) => set('condition', v)} placeholder="A+" />
        <Select label="Kategorie" value={f.category} onChange={(v) => set('category', v)} options={CATEGORIES} />
        <Select label="Štítek" value={f.badge_text} onChange={(v) => set('badge_text', v)} options={BADGES.map((b) => ({ v: b.v, l: b.l }))} />
        <Select label="Stav inzerátu" value={f.status} onChange={(v) => set('status', v)} options={STATUSES} />
        <Input label="Pořadí (menší = výš)" type="number" value={f.sort} onChange={(v) => set('sort', v)} />
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-zinc-300">
          <input type="checkbox" checked={f.vat} onChange={(e) => set('vat', e.target.checked)} className="h-4 w-4 accent-accent" /> Možnost odpočtu DPH
        </label>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving || uploading} className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-ink-950 shadow-glow transition enabled:hover:brightness-110 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Uložit
        </button>
        <button type="button" onClick={onClose} className="rounded-xl border border-white/15 px-6 py-3 font-semibold text-white transition hover:bg-white/5">Zrušit</button>
      </div>
    </form>
  );
}

/** Přidání fotky odkazem */
function UrlAdder({ onAdd }) {
  const [url, setUrl] = useState('');
  return (
    <div className="flex flex-1 gap-2">
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="…nebo vlož odkaz na fotku (https://…)"
        className="flex-1 rounded-xl border border-white/10 bg-ink-950 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20" />
      <button type="button" onClick={() => { onAdd(url); setUrl(''); }} className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">Přidat</button>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-zinc-400">{label}</span>
      <input type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...props}
        className="w-full rounded-xl border border-white/10 bg-ink-950 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20" />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-zinc-400">{label}</span>
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-ink-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20">
        {options.map((o) => <option key={o.v} value={o.v} className="bg-ink-900">{o.l}</option>)}
      </select>
    </label>
  );
}
