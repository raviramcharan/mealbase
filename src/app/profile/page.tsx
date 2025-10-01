import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { dbConnect } from '@/lib/mongodb';
import Recipe from '@/models/Recipe';
import RecipeCard from '@/components/RecipeCard';
import ProfileForm from '@/components/ProfileForm';

export default async function ProfilePage() {
  // Make the type explicit so TS knows "user" exists on the session
  const session = (await getServerSession(authOptions as any)) as Session | null;
  if (!session?.user) redirect('/signin');

  const uid = (session.user as any).id as string | undefined;
  if (!uid) redirect('/signin'); // safety guard if id isn't present

  const email = session.user.email ?? '';

  await dbConnect();
  const mine = await Recipe.find({ ownerId: uid }).sort({ createdAt: -1 }).lean();

  return (
    <div className="container-narrow">
      <h1 className="text-3xl font-extrabold mb-4">Profile</h1>

      <ProfileForm email={email} />

      <h3 className="text-xl font-semibold mt-6">My recipes</h3>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-3">
        {mine.map((r: any) => (
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
