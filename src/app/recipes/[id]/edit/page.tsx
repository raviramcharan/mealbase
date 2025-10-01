import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { dbConnect } from '@/lib/mongodb';
import Recipe from '@/models/Recipe';
import RecipeEditForm from '@/components/RecipeEditForm';

type Props = { params: { id: string } };

export default async function EditRecipePage({ params }: Props) {
  // Make session type explicit so TS knows "user" exists
  const session = (await getServerSession(authOptions as any)) as Session | null;
  if (!session?.user) redirect('/signin');

  const uid = (session.user as any).id as string | undefined;
  if (!uid) redirect('/signin');

  await dbConnect();

  // Fetch only what's needed for ownership check and narrow the type
  type OwnerOnly = { _id: unknown; ownerId?: unknown } | null;
  const doc = (await Recipe.findById(params.id)
    .select({ ownerId: 1, _id: 1 })
    .lean()) as OwnerOnly;

  if (!doc) return <div className="container-narrow">Not found</div>;
  if (String(doc.ownerId ?? '') !== String(uid)) {
    return <div className="container-narrow">Not authorized</div>;
  }

  return (
    <div className="container-narrow">
      <h1 className="text-3xl font-extrabold mb-4">Edit recipe</h1>
      <div className="card max-w-3xl mx-auto p-6">
        <RecipeEditForm id={String(doc._id)} />
      </div>
    </div>
  );
}
