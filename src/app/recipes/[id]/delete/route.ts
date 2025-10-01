export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import Recipe from '@/models/Recipe';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = (await getServerSession(authOptions as any)) as Session | null;
  if (!session?.user) return new Response('Unauthorized', { status: 401 });

  const uid = (session.user as any).id as string | undefined;
  if (!uid) return new Response('Unauthorized', { status: 401 });

  await dbConnect();

  // Only fetch what's needed to verify ownership
  type OwnerOnly = { ownerId?: unknown } | null;
  const existing = (await Recipe.findById(params.id).select({ ownerId: 1 }).lean()) as OwnerOnly;

  if (!existing) return new Response('Not found', { status: 404 });
  if (String(existing.ownerId ?? '') !== String(uid)) {
    return new Response('Forbidden', { status: 403 });
  }

  await Recipe.deleteOne({ _id: params.id });

  // Redirect back to home after delete (303 so POST doesn't re-submit)
  const url = new URL('/', req.url);
  return NextResponse.redirect(url, 303);
}
