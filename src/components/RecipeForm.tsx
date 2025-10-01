'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RecipeForm() {
  const [title, setTitle] = useState('');
  const [requirements, setReqs] = useState<string>('');
  const [ingredients, setIngr] = useState<string>('');
  const [instructions, setInstr] = useState('');
  const [calories, setCalories] = useState<number | ''>('');
  const [protein, setProtein] = useState<number | ''>('');
  const [carbs, setCarbs] = useState<number | ''>('');
  const [fats, setFats] = useState<number | ''>('');
  const [prepTime, setPrepTime] = useState<number | ''>('');
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    let imageUrl: string | undefined = undefined;

    if (file) {
      const fd = new FormData();
      fd.append('file', file);
      const up = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || ''}/api/upload`, { method: 'POST', body: fd });
      if (!up.ok) { alert('Image upload failed'); setBusy(false); return; }
      const data = await up.json();
      imageUrl = data.url;
    }

    const payload = {
      title,
      imageUrl,
      requirements: requirements.split('\n').map(s => s.trim()).filter(Boolean),
      ingredients: ingredients.split('\n').map(s => s.trim()).filter(Boolean),
      instructions,
      prepTimeMinutes: Number(prepTime),
      tags: tags.split(',').map(s=>s.trim()).filter(Boolean),
      nutrition: {
        calories: Number(calories),
        protein: Number(protein),
        carbs: Number(carbs),
        fats: Number(fats),
      }
    };

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || ''}/api/recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) { const t = await res.text(); alert('Failed to save: ' + t); setBusy(false); return; }
    router.push('/');
    router.refresh();
  }

  return (
    <form className="grid gap-3 min-w-0" onSubmit={handleSubmit}>
      <div className="min-w-0">
        <label>Image</label>
        <input type="file" className="block w-full max-w-full min-w-0" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <div className="help">Optional. Uploaded to Cloudinary.</div>
      </div>
      <div className="min-w-0">
        <label>Title</label>
        <input className="form-input block w-full max-w-full min-w-0" value={title} onChange={e=>setTitle(e.target.value)} required />
      </div>
      <div className="min-w-0">
        <label>Required time (minutes)</label>
        <input className="form-input block w-full max-w-full min-w-0" type="number" value={prepTime} onChange={e=>setPrepTime(e.target.value ? Number(e.target.value) : '')} />
      </div>
      <div className="min-w-0">
        <label>Tags (comma separated)</label>
        <input className="form-input block w-full max-w-full min-w-0" placeholder="vegan, quick, low-carb" value={tags} onChange={e=>setTags(e.target.value)} />
      </div>
      <div className="grid md:grid-cols-2 gap-3 min-w-0">
        <div className="min-w-0">
          <label>Requirements (one per line)</label>
          <textarea className="form-textarea block w-full max-w-full min-w-0" rows={6} value={requirements} onChange={e=>setReqs(e.target.value)} />
        </div>
        <div className="min-w-0">
          <label>Ingredients (one per line)</label>
          <textarea className="form-textarea block w-full max-w-full min-w-0" rows={6} value={ingredients} onChange={e=>setIngr(e.target.value)} />
        </div>
      </div>
      <div className="min-w-0">
        <label>Instructions</label>
        <textarea className="form-textarea block w-full max-w-full min-w-0" rows={8} value={instructions} onChange={e=>setInstr(e.target.value)} />
      </div>
      <div className="grid md:grid-cols-2 gap-3 min-w-0">
        <div className="min-w-0">
          <label>Calories</label>
          <input className="form-input block w-full max-w-full min-w-0" type="number" value={calories} onChange={e=>setCalories(e.target.value ? Number(e.target.value) : '')} />
        </div>
        <div className="min-w-0">
          <label>Protein (g)</label>
          <input className="form-input block w-full max-w-full min-w-0" type="number" value={protein} onChange={e=>setProtein(e.target.value ? Number(e.target.value) : '')} />
        </div>
        <div className="min-w-0">
          <label>Carbs (g)</label>
          <input className="form-input block w-full max-w-full min-w-0" type="number" value={carbs} onChange={e=>setCarbs(e.target.value ? Number(e.target.value) : '')} />
        </div>
        <div className="min-w-0">
          <label>Fats (g)</label>
          <input className="form-input block w-full max-w-full min-w-0" type="number" value={fats} onChange={e=>setFats(e.target.value ? Number(e.target.value) : '')} />
        </div>
      </div>
      <div className="min-w-0">
        <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save recipe'}</button>
      </div>
    </form>
  );
}
