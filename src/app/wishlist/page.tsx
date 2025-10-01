import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import Recipe from '@/models/Recipe';
import RecipeCard from '@/components/RecipeCard';

export default async function WishlistPage() {
  const session = await getServerSession(authOptions as any);
  if (!session) redirect('/signin');
  await dbConnect();
  const me = await User.findOne({ email: session.user?.email }).lean();
  const ids = me?.wishlist || [];
  const recipes = await Recipe.find({ _id: { $in: ids } }).lean();
  return (
    <div>
      <h1 className="container-narrow text-3xl font-extrabold mb-4">Wishlist</h1>
      <div className="container-narrow grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
        {recipes.map((r:any)=>(
          <RecipeCard key={String(r._id)} id={String(r._id)} title={r.title} imageUrl={r.imageUrl} prepTimeMinutes={r.prepTimeMinutes} tags={r.tags || []} />
        ))}
      </div>
    </div>
  );
}
