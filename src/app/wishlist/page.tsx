// src/app/wishlist/page.tsx
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import Recipe from '@/models/Recipe';
import RecipeCard from '@/components/RecipeCard';

// Narrow lean type so TS knows "wishlist" exists when selected
type WishlistLean = { wishlist?: string[] } | null;

export default async function WishlistPage() {
  // 👇 Important: cast so TS knows session has "user"
  const session = (await getServerSession(authOptions as any)) as Session | null;
  if (!session?.user?.email) redirect('/signin');

  await dbConnect();

  const email = session.user.email!;
  const me = (await User.findOne({ email })
    .select({ wishlist: 1, _id: 0 })
    .lean()) as WishlistLean;

  const ids = (me?.wishlist ?? []).map(String);
  const recipes = await Recipe.find({ _id: { $in: ids } }).lean();

  return (
    <div className="container-narrow">
      <h1 className="text-3xl font-extrabold mb-4">Wishlist</h1>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
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
