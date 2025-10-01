'use client';

import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

type Nutrition = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

type RecipeData = {
  _id: string;
  title: string;
  imageUrl?: string;
  requirements?: string[];
  ingredients?: string[];
  instructions?: string;
  prepTimeMinutes: number;
  tags?: string[];
  nutrition?: Nutrition;
};

export default function RecipeEditForm({ id }: { id: string }) {
  const router = useRouter();

  // existing recipe
  const [existing, setExisting] = useState<RecipeData | null>(null);
  const [loading, setLoading] = useState(true);

  // editable state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [prepTime, setPrepTime] = useState<string>('0');
  const [tags, setTags] = useState<string>('');

  const [requirements, setRequirements] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');

  const [nutrition, setNutrition] = useState<Nutrition>({
    calories: 0, protein: 0, carbs: 0, fats: 0,
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing recipe
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/recipes/${id}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(await res.text());
        const r: RecipeData = await res.json();
        if (cancelled) return;

        setExisting(r);
        setTitle(r.title || '');
        setPrepTime(String(r.prepTimeMinutes ?? 0));
        setTags((r.tags ?? []).join(', '));
        setRequirements((r.requirements ?? []).join('\n'));
        setIngredients((r.ingredients ?? []).join('\n'));
        setInstructions(r.instructions ?? '');
        setNutrition({
          calories: r.nutrition?.calories ?? 0,
          protein:  r.nutrition?.protein  ?? 0,
          carbs:    r.nutrition?.carbs    ?? 0,
          fats:     r.nutrition?.fats     ?? 0,
        });
        setPreview(r.imageUrl || null);
      } catch (e: any) {
        setError(e?.message || 'Failed to load recipe');
      } finally {
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    try {
      setPreview(f ? URL.createObjectURL(f) : existing?.imageUrl ?? null);
    } catch {
      setPreview(existing?.imageUrl ?? null);
    }
  }

  async function uploadDirectToCloudinary(f: File): Promise<string> {
    // 1) Ask our server for a short-lived signature
    const sigRes = await fetch('/api/cloudinary/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}), // server uses default folder from env
    });
    if (!sigRes.ok) throw new Error('Could not prepare image upload');

    const { timestamp, signature, apiKey, cloudName, folder } = await sigRes.json();

    // 2) Send the actual file straight to Cloudinary
    const fd = new FormData();
    fd.append('file', f);
    fd.append('api_key', apiKey);
    fd.append('timestamp', String(timestamp));
    fd.append('signature', signature);
    fd.append('folder', folder);

    const up = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: fd,
    });
    const data = await up.json();
    if (!up.ok || !data.secure_url) {
      throw new Error(data?.error?.message || 'Image upload failed');
    }
    return data.secure_url as string;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!existing) return;
    setBusy(true);
    setError(null);

    try {
      // Keep current image unless user selected a new one
      let imageUrl = existing.imageUrl;
      if (file) {
        imageUrl = await uploadDirectToCloudinary(file);
      }

      const payload = {
        title: title.trim(),
        prepTimeMinutes: Number(prepTime) || 0,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        requirements: requirements.split('\n').map(t => t.trim()).filter(Boolean),
        ingredients: ingredients.split('\n').map(t => t.trim()).filter(Boolean),
        instructions: instructions.trim(),
        nutrition: {
          calories: Number(nutrition.calories) || 0,
          protein:  Number(nutrition.protein)  || 0,
          carbs:    Number(nutrition.carbs)    || 0,
          fats:     Number(nutrition.fats)     || 0,
        },
        imageUrl,
      };

      if (!payload.title) throw new Error('Please enter a title');

      const res = await fetch(`/api/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());

      router.push(`/recipes/${id}`);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-slate-600">Loading…</div>;
  }

  return (
    <form className="grid gap-3 min-w-0" onSubmit={onSubmit}>
      {/* Image */}
      <div className="min-w-0">
        <label className="block text-sm font-medium mb-1">Image</label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onFileChange}
          className="block w-full max-w-full min-w-0 text-sm form-input
                     file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100
                     file:px-3 file:py-2 file:text-slate-700 truncate"
        />
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Preview"
            className="mt-2 w-full max-h-56 object-cover rounded-xl border border-slate-200"
          />
        ) : (
          <p className="text-xs text-slate-500 mt-1">Optional. Uploaded to Cloudinary.</p>
        )}
      </div>

      {/* Title */}
      <div className="min-w-0">
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          className="form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Chicken pasta bake"
          required
        />
      </div>

      {/* Time + Tags */}
      <div className="grid md:grid-cols-2 gap-3 min-w-0">
        <div className="min-w-0">
          <label className="block text-sm font-medium mb-1">Required time (minutes)</label>
          <input
            className="form-input"
            type="number"
            min={0}
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
            placeholder="e.g., 20"
          />
        </div>

        <div className="min-w-0">
          <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
          <input
            className="form-input"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="vegan, quick, low-carb"
          />
        </div>
      </div>

      {/* Requirements */}
      <div className="min-w-0">
        <label className="block text-sm font-medium mb-1">Requirements (one per line)</label>
        <textarea
          className="form-textarea h-28"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="Oven
Baking dish
Knife"
        />
      </div>

      {/* Ingredients */}
      <div className="min-w-0">
        <label className="block text-sm font-medium mb-1">Ingredients (one per line)</label>
        <textarea
          className="form-textarea h-32"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="200g pasta
2 tomatoes
Salt"
        />
      </div>

      {/* Nutrition */}
      <div className="grid md:grid-cols-4 gap-3 min-w-0">
        <div className="min-w-0">
          <label className="block text-sm font-medium mb-1">Calories</label>
          <input
            className="form-input"
            type="number"
            min={0}
            value={nutrition.calories}
            onChange={(e) => setNutrition({ ...nutrition, calories: Number(e.target.value) })}
          />
        </div>
        <div className="min-w-0">
          <label className="block text-sm font-medium mb-1">Protein (g)</label>
          <input
            className="form-input"
            type="number"
            min={0}
            value={nutrition.protein}
            onChange={(e) => setNutrition({ ...nutrition, pro
