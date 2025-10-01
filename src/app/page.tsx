import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import Recipe from '@/models/Recipe';
import RecipeCard from '@/components/RecipeCard';

type WishlistLean = { wishlist?: string[] } | null;

export default async function WishlistPage() {
  // Make the session type explicit so TS knows about "user"
  const session = (await getServerSession(authOptions as any)) as Session | null;
  if (!session?.user?.email) redirect('/signin');

  await dbConnect();

  // Read just the wishlist and assert a lean type so TS knows it exists
  const me = (await User.findOne({ email: session.user.email })
    .select({ wishlist: 1, _id: 0 })
    .lean()) as WishlistLean;

  const ids = (me?.wishlist ?? []).map(String);

  const recipes = await Recipe.find({ _id: { $in: ids } }).lean();

  return (
    <div className="container-narrow">
      <h1 className="text-3xl font-extrabold mb-4">Wishlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
        {recipes.map((r: any) => (
          <RecipeCard
            key={String(r._id)}
            id={String(r._id)}
            title={r.title}
            imageUrl={r.imageUrl}
            prepTimeMinutes={r.prepTimeMinutes}
            tags={r.tags || []}
          />
        ))}
      </div>
    </div>
  );
}
