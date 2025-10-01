export const runtime = 'nodejs';
import crypto from 'crypto';

export async function POST(req: Request) {
  const { folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'mealbook' } =
    (await req.json().catch(() => ({}))) as { folder?: string };

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  if (!cloudName || !apiKey || !apiSecret) {
    return new Response('Cloudinary env vars missing', { status: 500 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(toSign).digest('hex');

  return Response.json({ timestamp, signature, apiKey, cloudName, folder });
}
