// Build a Cloudinary delivery URL from a *full* secure_url by
// injecting transformations after `/upload/`.
// Example: https://res.cloudinary.com/<cloud>/image/upload/v123/abc.jpg
//   =>     https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto,c_fill,w_600,h_400/v123/abc.jpg

export function cxUrl(
  url?: string | null,
  opts?: { w?: number; h?: number; fit?: 'cover' | 'contain' }
) {
  if (!url) return '';

  const w = opts?.w;
  const h = opts?.h;
  const fit = opts?.fit ?? 'cover';

  // Only transform Cloudinary delivery URLs that contain /upload/
  if (!url.startsWith('http') || !url.includes('/upload/')) return url;

  const parts: string[] = ['f_auto', 'q_auto'];
  if (w || h) parts.push(`c_${fit === 'cover' ? 'fill' : 'fit'}`);
  if (w) parts.push(`w_${w}`);
  if (h) parts.push(`h_${h}`);

  // Insert transforms immediately after /upload/
  const withTransforms = url.replace('/upload/', `/upload/${parts.join(',')}/`);

  // Optional: strip .heic/.heif extension (purely cosmetic; Cloudinary serves the right format anyway)
  return withTransforms.replace(/\.(heic|heif)(\?.*)?$/i, (_m, _ext, query = '') => query);
}
