import { dbConnect } from '@/lib/mongodb';
import Recipe from '@/models/Recipe';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const where = q ? { $or: [
    { title: { $regex: q, $options: 'i' } },
    { ingredients: { $elemMatch: { $regex: q, $options: 'i' } } },
    { requirements: { $elemMatch: { $regex: q, $options: 'i' } } },
  ] } : {};
  const list = await Recipe.find(where).sort({ createdAt: -1 }).lean();
  return new Response(JSON.stringify(list), { headers: { 'Content-Type': 'application/json' } });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any);
  if (!session) return new Response('Unauthorized', { status: 401 });
  const uid = (session.user as any)?.id;
  const body = await req.json();
  await dbConnect();
  const created = await Recipe.create({ ...body, ownerId: uid });
  return new Response(JSON.stringify(created), { headers: { 'Content-Type': 'application/json' }, status: 201 });
}
