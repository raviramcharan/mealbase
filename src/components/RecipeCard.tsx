'use client';

import Link from 'next/link';
import WishlistButton from '@/components/WishlistButton';
import { cxUrl } from '@/lib/cdn';

type Props = {
  id: string;
  title: string;
  imageUrl?: string;
  prepTimeMinutes: number;
  tags: string[];
};

export default function RecipeCard({
  id,
  title,
  imageUrl,
  prepTimeMinutes,
  tags,
}: Props) {
  return (
    <div className="card">
      <div className="flex items-center justify-between px-4 pt-3">
        <span className="badge">⏱ {prepTimeMinutes} min</span>
        <WishlistButton recipeId={id} />
      </div>

      <Link href={`/recipes/${id}`}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="w-full h-[180px] object-cover"
            src={cxUrl(imageUrl, { w: 600, h: 400 })}
            alt={title}
          />
        ) : (
          <div className="h-[180px] bg-slate-100 grid place-items-center text-slate-500">
            No image
          </div>
        )}
      </Link>

      <div className="px-4 py-3">
        <div className="font-bold text-[16px] mb-1 break-words">{title}</div>
        {tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 4).map((t, i) => (
              <span key={i} className="chip">
                #{t}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
