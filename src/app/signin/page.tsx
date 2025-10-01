'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await signIn('credentials', { email, password, redirect: true, callbackUrl: '/' });
    setBusy(false);
  }

  return (
    <div className="container-narrow">
      <div className="card max-w-sm mx-auto p-6 mt-10">
        <h1 className="text-2xl font-extrabold mb-4">Sign in</h1>
        <form className="grid gap-3" onSubmit={onSubmit}>
        <div><label>Email</label><input className="form-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
        <div><label>Password</label><input className="form-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
        <button className="btn w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
        <p className="text-sm text-slate-600 mt-3">No account? <Link className="text-brand" href="/signup">Create one</Link></p>
      </div>
    </div>
  );
}
