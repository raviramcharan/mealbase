import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { dbConnect } from '@/lib/mongodb';
import Recipe from '@/models/Recipe';
import RecipeEditForm from '@/components/RecipeEditForm';

export default async function EditRecipePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions as any);
  if (!session) redirect('/signin');
  await dbConnect();
  const r = await Recipe.findById(params.id).lean();
  if (!r) return <div>Not found</div>;
  const uid = (session.user as any).id;
  if (String(r.ownerId) !== String(uid)) return <div>Not authorized</div>;
  return <div><h1>Edit recipe</h1><RecipeEditForm id={String(r._id)} /></div>;
}
