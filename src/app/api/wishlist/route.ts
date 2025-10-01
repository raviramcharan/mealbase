import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const recipeId = searchParams.get('recipeId');

  const session = (await getServerSession(authOptions as any)) as Session | null;

  // Keep this safe for unauthenticated users — simply return false.
  if (!session?.user?.email || !recipeId) {
    return new Response(JSON.stringify({ inWishlist: false }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await dbConnect();
  const me = await User.findOne({ email: session.user.email }).lean();
  const inWishlist = Boolean(me?.wishlist?.includes(String(recipeId)));

  return new Response(JSON.stringify({ inWishlist }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as Session | null;
  if (!session?.user?.email) return new Response('Unauthorized', { status: 401 });

  const { recipeId } = (await req.json()) as { recipeId?: string };
  if (!recipeId) return new Response('Bad request', { status: 400 });

  await dbConnect();

  const me = await User.findOne({ email: session.user.email }).lean();
  const has = Boolean(me?.wishlist?.includes(String(recipeId)));

  if (has) {
    await User.updateOne(
      { email: session.user.email },
      { $pull: { wishlist: String(recipeId) } }
    );
  } else {
    await User.updateOne(
      { email: session.user.email },
      { $addToSet: { wishlist: String(recipeId) } },
      { upsert: true }
    );
  }

  return new Response(JSON.stringify({ inWishlist: !has }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
