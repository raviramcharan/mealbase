import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';

// Narrow type for what we read from Mongo in this route.
type ProfileLean = { name?: string } | null;

export async function GET() {
  const session = (await getServerSession(authOptions as any)) as Session | null;
  if (!session?.user?.email) return new Response('Unauthorized', { status: 401 });

  await dbConnect();

  // Select only "name" so TS is crystal-clear about the shape.
  const u = (await User.findOne({ email: session.user.email })
    .select({ name: 1, _id: 0 })
    .lean()) as ProfileLean;

  return new Response(
    JSON.stringify({ name: u?.name ?? '' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}

export async function PUT(req: Request) {
  const session = (await getServerSession(authOptions as any)) as Session | null;
  if (!session?.user?.email) return new Response('Unauthorized', { status: 401 });

  const { name } = (await req.json()) as { name?: string };

  await dbConnect();
  await User.updateOne(
    { email: session.user.email },
    { $set: { name: name ?? '' } },
    { upsert: true }
  );

  return new Response(
    JSON.stringify({ ok: true }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}
