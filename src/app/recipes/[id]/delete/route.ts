import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/recipes/${params.id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, cache:'no-store' });
  if (!res.ok) return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/recipes/${params.id}`);
  return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/`);
}
