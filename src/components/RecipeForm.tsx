'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

type NutritionForm = {
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
};

export default function RecipeForm() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [title, setTitle] = useState<string>('');
  const [prepTime, setPrepTime] = useState<string>('');     // empty
  const [tags, setTags] = useState<string>('');             // empty

  const [requirements, setRequirements] = useState<string>(''); // empty
  const [ingredients, setIngredients] = useState<string>('');   // empty
  const [instructions, setInstructions] = useState<string>(''); // empty

  // keep as strings so inputs can be empty; convert to numbers on submit
  const [nutrition, setNutrition] = useState<NutritionForm>({
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) {
      try {
        setPreview(URL.createObjectURL(f));
      } catch {
        setPreview(null);
      }
    } else {
      setPreview(null);
    }
  }

  async function uploadDirectToCloudinary(f: File): Promise<string> {
    // 1) ask server for signature
    const sigRes = await fetch('/api/cloudinary/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!sigRes.ok) throw new Error('Could not prepare image upload');

    const { timestamp, signature, apiKey, cloudName, folder } = await sigRes.json();

    // 2) direct upload to Cloudinary
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
    setBusy(true);
    setError(null);

    try {
      let imageUrl: string | undefined;
      if (file) {
        imageUrl = await uploadDirectToCloudinary(file);
      }

      const payload = {
        title: title.trim(),
        prepTimeMinutes: Number(prepTime) || 0,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        requirements: requirements
          .split('\n')
          .map((t) => t.trim())
          .filter(Boolean),
        ingredients: ingredients
          .split('\n')
          .map((t) => t.trim())
          .filter(Boolean),
        instructions: instructions.trim(),
        nutrition: {
          calories: Number(nutrition.calories) || 0,
          protein: Number(nutrition.protein) || 0,
          carbs: Number(nutrition.carbs) || 0,
          fats: Number(nutrition.fats) || 0,
        },
        imageUrl,
      };

      if (!payload.title) throw new Error('Please enter a title');

      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.text()) || 'Failed to create recipe');

      const created = await res.json();
      const id = String(created?._id || '');
      router.push(id ? `/recipes/${id}` : '/');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="grid gap-3 min-w-0" onSubmit={onSubmit}>
      {/* Image */}
      <div className="min-w-0">
        <label className="block text-sm font-medium mb-1">Image</label>
        <input
          type="file"
          accept="image/*"
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
            onChange={(e) => setNutrition({ ...nutrition, calories: e.target.value })}
            placeholder="500"
          />
        </div>
        <div className="min-w-0">
          <label className="block text-sm font-medium mb-1">Protein (g)</label>
          <input
            className="form-input"
            type="number"
            min={0}
            value={nutrition.protein}
            onChange={(e) => setNutrition({ ...nutrition, protein: e.target.value })}
            placeholder="30"
          />
        </div>
        <div className="min-w-0">
          <label className="block text-sm font-medium mb-1">Carbs (g)</label>
          <input
            className="form-input"
            type="number"
            min={0}
            value={nutrition.carbs}
            onChange={(e) => setNutrition({ ...nutrition, carbs: e.target.value })}
            placeholder="40"
          />
        </div>
        <div className="min-w-0">
          <label className="block text-sm font-medium mb-1">Fats (g)</label>
          <input
            className="form-input"
            type="number"
            min={0}
            value={nutrition.fats}
            onChange={(e) => setNutrition({ ...nutrition, fats: e.target.value })}
            placeholder="20"
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="min-w-0">
        <label className="block text-sm font-medium mb-1">Instructions</label>
        <textarea
          className="form-textarea h-40"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder={`1) Preheat oven to 180°C
2) Mix everything
3) Bake 20 minutes`}
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex items-center justify-end gap-2">
        <button className="btn btn-secondary" type="button" onClick={() => router.back()} disabled={busy}>
          Cancel
        </button>
        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save recipe'}
        </button>
      </div>
    </form>
  );
}
