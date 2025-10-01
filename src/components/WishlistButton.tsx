'use client';
import { useEffect, useState } from 'react';

export default function WishlistButton({ recipeId }: { recipeId: string }) {
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // fetch initial state
    fetch('/api/wishlist?recipeId=' + recipeId).then(r=>r.json()).then(d=>setActive(Boolean(d.inWishlist))).catch(()=>{});
  }, [recipeId]);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const res = await fetch('/api/wishlist', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ recipeId }) });
    setBusy(false);
    if (res.ok) {
      const d = await res.json();
      setActive(Boolean(d.inWishlist));
    } else if (res.status === 401) {
      alert('Please sign in to use wishlist.');
    }
  }

  return (
    <button className="like-btn" data-active={active} onClick={toggle} aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'} title="Wishlist">
      {active ? '💛' : '🤍'}
    </button>
  );
}
