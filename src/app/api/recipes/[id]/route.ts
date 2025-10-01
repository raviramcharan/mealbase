import { dbConnect } from '@/lib/mongodb';
import Recipe from '@/models/Recipe';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import authOptions from '@/lib/authOptions';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const item = await Recipe.findById(params.id).lean();
  if (!item) return new Response('Not found', { status: 404 });
  return new Response(JSON.stringify(item), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = (await getServerSession(authOptions as any)) as Session | null;
  if (!session?.user) return new Response('Unauthorized', { status: 401 });
  const uid = (session.user as any).id as string | undefined;
  if (!uid) return new Response('Unauthorized', { status: 401 });

  await dbConnect();
  const existing = await Recipe.findById(params.id).lean();
  if (!existing) return new Response('Not found', { status: 404 });
  if (String(existing.ownerId) !== String(uid)) {
    return new Response('Forbidden', { status: 403 });
  }

  const body = await req.json();
  await Recipe.updateOne({ _id: params.id }, { $set: body });

  const updated = await Recipe.findById(params.id).lean();
  return new Response(JSON.stringify(updated), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = (await getServerSession(authOptions as any)) as Session | null;
  if (!session?.user) return new Response('Unauthorized', { status: 401 });
  const uid = (session.user as any).id as string | undefined;
  if (!uid) return new Response('Unauthorized', { status: 401 });

  await dbConnect();
  const existing = await Recipe.findById(params.id).lean();
  if (!existing) return new Response('Not found', { status: 404 });
  if (String(existing.ownerId) !== String(uid)) {
    return new Response('Forbidden', { status: 403 });
  }

  await Recipe.deleteOne({ _id: params.id });
  return new Response('ok');
}
