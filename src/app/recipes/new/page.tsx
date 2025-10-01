import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import RecipeForm from '@/components/RecipeForm';
import authOptions from '@/lib/authOptions';

export default async function NewRecipePage() {
  const session = await getServerSession(authOptions as any);
  if (!session) redirect('/signin');
  return (
    <div className="container-narrow">
      <h1 className="text-3xl font-extrabold mb-4">New recipe</h1>
      <div className="card max-w-3xl mx-auto p-6"><RecipeForm /></div>
    </div>
  );
}
