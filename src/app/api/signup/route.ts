import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) return new Response('Missing fields', { status: 400 });
  await dbConnect();
  const existing = await User.findOne({ email });
  if (existing) return new Response('Email already registered', { status: 409 });
  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ email, passwordHash });
  return new Response('ok', { status: 201 });
}
