'use client';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

export default function NavBar() {
  const { status } = useSession();
  const authed = status === 'authenticated';
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="container-narrow py-3 flex items-center justify-between">
        <Link href="/" className="font-extrabold text-xl flex items-center gap-2">
          <span className="inline-grid place-items-center w-7 h-7 rounded-md bg-brand text-white font-bold">🍳</span>
          Kippieboek
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-2">
          {authed && <Link href="/wishlist" className="btn btn-secondary">Favorieten</Link>}
          {authed && <Link href="/profile" className="btn btn-secondary">Profiel</Link>}
          {authed && <Link href="/recipes/new" className="btn btn-secondary">Recept toevoegen</Link>}
          {authed ? (
            <button className="btn" onClick={() => signOut()}>Logout</button>
          ) : (
            <button className="btn" onClick={() => signIn()}>Begin hier!</button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-controls="mobile-menu"
          aria-expanded={open}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
      />

      {/* Slide-in drawer */}
      <aside
        id="mobile-menu"
        className={`fixed top-0 right-0 h-full w-72 bg-white border-l border-slate-200 p-4 transition-transform md:hidden ${open ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="font-extrabold text-lg">Menu</span>
          <button className="inline-flex w-9 h-9 items-center justify-center rounded-lg border border-slate-200" onClick={() => setOpen(false)} aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <nav className="grid gap-2">
          <Link onClick={()=>setOpen(false)} className="btn btn-secondary" href="/">Home</Link>
          {authed && <Link onClick={()=>setOpen(false)} className="btn btn-secondary" href="/wishlist">Favorieten</Link>}
          {authed && <Link onClick={()=>setOpen(false)} className="btn btn-secondary" href="/profile">Profiel</Link>}
          {authed && <Link onClick={()=>setOpen(false)} className="btn btn-secondary" href="/recipes/new">Recept toevoegen</Link>}
          {authed ? (
            <button className="btn mt-2" onClick={() => { setOpen(false); signOut(); }}>Logout</button>
          ) : (
            <button className="btn mt-2" onClick={() => { setOpen(false); signIn(); }}>Begin hier!</button>
          )}
        </nav>
      </aside>
    </nav>
  );
}
