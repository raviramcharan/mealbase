import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { NextRequest } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions as any);
  if (!session) return new Response('Unauthorized', { status: 401 });
  const formData = await req.formData();
  const file = formData.get('file') as unknown as File | null;
  if (!file) return new Response('No file', { status: 400 });
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'mealbook';
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
    // @ts-ignore
    stream.end(buffer);
  }) as any;

  return new Response(JSON.stringify({ url: result.secure_url }), { headers: { 'Content-Type': 'application/json' } });
}
