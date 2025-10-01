import { dbConnect } from '@/lib/mongodb';
import RecipeModel from '@/models/Recipe';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import authOptions from '@/lib/authOptions';
import Link from 'next/link';
import { cxUrl } from '@/lib/cdn';

type Props = { params: { id: string } };

type Nutrition = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

type RecipeLean =
  | {
      _id: unknown;
      ownerId?: unknown;
      title: string;
      imageUrl?: string;
      requirements?: string[];
      ingredients?: string[];
      instructions?: string;
      prepTimeMinutes: number;
      tags?: string[];
      nutrition?: Nutrition;
    }
  | null;

export default async function RecipePage({ params }: Props) {
  await dbConnect();

  const r = (await RecipeModel.findById(params.id).lean()) as RecipeLean;
  if (!r) return <div className="container-narrow">Not found</div>;

  // Type session explicitly so TS knows about "user"
  const session = (await getServerSession(authOptions as any)) as Session | null;
  const uid = (session?.user as any)?.id as string | undefined;

  // Safe comparison (handles ObjectId|string on ownerId)
  const canEdit = !!uid && String(uid) === String(r.ownerId ?? '');

  return (
    <article className="container-narrow">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold mb-2">
          {r.title} <span className="badge">⏱ {r.prepTimeMinutes} min</span>
        </h1>

        {canEdit ? (
          <div className="flex gap-2">
            <Link className="btn btn-secondary" href={`/recipes/${String(r._id)}/edit`}>
              Edit
            </Link>
            <form action={`/recipes/${String(r._id)}/delete`} method="post">
              <button className="btn" type="submit">
                Delete
              </button>
            </form>
          </div>
        ) : null}
      </div>

      {Array.isArray(r.tags) && r.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {r.tags.map((t, i) => (
            <span key={i} className="badge">
              #{t}
            </span>
          ))}
        </div>
      )}

      {r.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cxUrl(r.imageUrl, { w: 1200, h: 600 })}
          alt={r.title}
          className="w-full max-h-[420px] object-cover rounded-2xl border border-slate-200 mt-3"
        />
      )}

      <section className="mt-4">
        <h3 className="text-xl font-semibold mb-1">Requirements</h3>
        <ul className="list-disc pl-5">
          {(r.requirements ?? []).map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      </section>

      <section className="mt-4">
        <h3 className="text-xl font-semibold mb-1">Ingredients</h3>
        <ul className="list-disc pl-5">
          {(r.ingredients ?? []).map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      </section>

      <section className="mt-4">
        <h3 className="text-xl font-semibold mb-1">Nutrition</h3>
        <p>
          {(r.nutrition?.calories ?? 0)} kcal • {(r.nutrition?.protein ?? 0)}g protein •{' '}
          {(r.nutrition?.carbs ?? 0)}g carbs • {(r.nutrition?.fats ?? 0)}g fats
        </p>
      </section>

      <section className="mt-4">
        <h3 className="text-xl font-semibold mb-1">Instructions</h3>
        <pre className="whitespace-pre-wrap leading-relaxed font-sans">
          {r.instructions ?? ''}
        </pre>
      </section>
    </article>
  );
}
