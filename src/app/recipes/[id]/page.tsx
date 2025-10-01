import { dbConnect } from '@/lib/mongodb';
import RecipeModel from '@/models/Recipe';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import authOptions from '@/lib/authOptions';
import Link from 'next/link';

type Props = { params: { id: string } };

export default async function RecipePage({ params }: Props) {
  await dbConnect();
  const r = await RecipeModel.findById(params.id).lean();
  if (!r) return <div className="container-narrow">Not found</div>;

  // Make session type explicit so TS knows "user" exists when present
  const session = (await getServerSession(authOptions as any)) as Session | null;
  const uid = (session?.user as any)?.id as string | undefined;

  // Compare safely (ObjectId|string); avoid Mongoose lean() union typing
  const canEdit = !!uid && String(uid) === String((r as any).ownerId);

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
              <button className="btn" type="submit">Delete</button>
            </form>
          </div>
        ) : null}
      </div>

      {Array.isArray((r as any).tags) && (r as any).tags.length ? (
        <div className="flex flex-wrap gap-2 mb-3">
          {(r as any).tags.map((t: string, i: number) => (
            <span key={i} className="badge">#{t}</span>
          ))}
        </div>
      ) : null}

      {(r as any).imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={(r as any).imageUrl}
          alt={r.title}
          className="w-full max-h-[420px] object-cover rounded-2xl border border-slate-200 mt-3"
        />
      )}

      <section className="mt-4">
        <h3 className="text-xl font-semibold mb-1">Requirements</h3>
        <ul className="list-disc pl-5">
          {(r as any).requirements?.map((x: string, i: number) => <li key={i}>{x}</li>)}
        </ul>
      </section>

      <section className="mt-4">
        <h3 className="text-xl font-semibold mb-1">Ingredients</h3>
        <ul className="list-disc pl-5">
          {(r as any).ingredients?.map((x: string, i: number) => <li key={i}>{x}</li>)}
        </ul>
      </section>

      <section className="mt-4">
        <h3 className="text-xl font-semibold mb-1">Nutrition</h3>
        <p>
          {(r as any).nutrition?.calories} kcal • {(r as any).nutrition?.protein}g protein • {(r as any).nutrition?.carbs}g carbs • {(r as any).nutrition?.fats}g fats
        </p>
      </section>

      <section className="mt-4">
        <h3 className="text-xl font-semibold mb-1">Instructions</h3>
        <pre className="whitespace-pre-wrap leading-relaxed font-sans">
          {(r as any).instructions}
        </pre>
      </section>
    </article>
  );
}
