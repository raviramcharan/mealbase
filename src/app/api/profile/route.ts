import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  const session = (await getServerSession(authOptions as any)) as Session | null;
  if (!session?.user?.email) return new Response('Unauthorized', { status: 401 });

  await dbConnect();
  const u = await User.findOne({ email: session.user.email }).lean();
  return new Response(JSON.stringify({ name: u?.name || '' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function PUT(req: Request) {
  const session = (await getServerSession(authOptions as any)) as Session | null;
  if (!session?.user?.email) return new Response('Unauthorized', { status: 401 });

  const { name } = await req.json();
  await dbConnect();
  await User.updateOne({ email: session.user.email }, { $set: { name: name || '' } });
  return new Response('ok');
}
