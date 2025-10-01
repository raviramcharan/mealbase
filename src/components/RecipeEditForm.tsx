'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RecipeEditForm({ id }: { id: string }) {
  const [title, setTitle] = useState('');
  const [requirements, setReqs] = useState<string>('');
  const [ingredients, setIngr] = useState<string>('');
  const [instructions, setInstr] = useState('');
  const [calories, setCalories] = useState<number | ''>('');
  const [protein, setProtein] = useState<number | ''>('');
  const [carbs, setCarbs] = useState<number | ''>('');
  const [fats, setFats] = useState<number | ''>('');
  const [prepTime, setPrepTime] = useState<number | ''>('');
  const [tags, setTags] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/recipes/' + id).then(r=>r.json()).then((r)=>{
      setTitle(r.title||''); setReqs((r.requirements||[]).join('\n')); setIngr((r.ingredients||[]).join('\n')); setInstr(r.instructions||'');
      setCalories(r.nutrition?.calories||''); setProtein(r.nutrition?.protein||''); setCarbs(r.nutrition?.carbs||''); setFats(r.nutrition?.fats||'');
      setPrepTime(r.prepTimeMinutes||''); setTags((r.tags||[]).join(', '));
    });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const payload = {
      title,
      requirements: requirements.split('\n').map(s=>s.trim()).filter(Boolean),
      ingredients: ingredients.split('\n').map(s=>s.trim()).filter(Boolean),
      instructions,
      prepTimeMinutes: Number(prepTime),
      tags: tags.split(',').map(s=>s.trim()).filter(Boolean),
      nutrition: { calories:Number(calories), protein:Number(protein), carbs:Number(carbs), fats:Number(fats) }
    };
    const res = await fetch('/api/recipes/' + id, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    setBusy(false);
    if (!res.ok) { alert('Failed to save'); return; }
    router.push('/recipes/' + id);
    router.refresh();
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <div><label>Title</label><input className="form-input" value={title} onChange={e=>setTitle(e.target.value)} required /></div>
      <div><label>Required time (minutes)</label><input className="form-input" type="number" value={prepTime} onChange={e=>setPrepTime(e.target.value ? Number(e.target.value) : '')} required /></div>
      <div className="grid md:grid-cols-2 gap-3">
        <div><label>Requirements</label><textarea className="form-textarea" rows={6} value={requirements} onChange={e=>setReqs(e.target.value)} /></div>
        <div><label>Ingredients</label><textarea className="form-textarea" rows={6} value={ingredients} onChange={e=>setIngr(e.target.value)} /></div>
      </div>
      <div><label>Instructions</label><textarea className="form-textarea" rows={8} value={instructions} onChange={e=>setInstr(e.target.value)} /></div>
      <div><label>Tags (comma separated)</label><input className="form-input" value={tags} onChange={e=>setTags(e.target.value)} /></div>
      <div className="grid md:grid-cols-2 gap-3">
        <div><label>Calories</label><input className="form-input" type="number" value={calories} onChange={e=>setCalories(e.target.value ? Number(e.target.value) : '')} required /></div>
        <div><label>Protein (g)</label><input className="form-input" type="number" value={protein} onChange={e=>setProtein(e.target.value ? Number(e.target.value) : '')} required /></div>
        <div><label>Carbs (g)</label><input className="form-input" type="number" value={carbs} onChange={e=>setCarbs(e.target.value ? Number(e.target.value) : '')} required /></div>
        <div><label>Fats (g)</label><input className="form-input" type="number" value={fats} onChange={e=>setFats(e.target.value ? Number(e.target.value) : '')} required /></div>
      </div>
      <div><button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button></div>
    </form>
  );
}
