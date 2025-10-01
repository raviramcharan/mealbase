'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch('/api/signup', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
    setBusy(false);
    setDone(res.ok);
    if (!res.ok) alert(await res.text());
  }

  if (done) {
    return <div className="container-narrow"><div className="card max-w-sm mx-auto p-6 mt-10"><h1 className="text-2xl font-extrabold mb-2">Account created</h1><p>You can now <Link className="text-brand" href="/signin">sign in</Link>.</p></div></div>;
  }

  return (
    <div className="container-narrow">
      <div className="card max-w-sm mx-auto p-6 mt-10">
        <h1 className="text-2xl font-extrabold mb-4">Sign up</h1>
        <form className="grid gap-3" onSubmit={onSubmit}>
        <div><label>Email</label><input className="form-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
        <div><label>Password</label><input className="form-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
        <button className="btn w-full" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      </form>
        <p className="text-sm text-slate-600 mt-3">Already registered? <Link className="text-brand" href="/signin">Sign in</Link></p>
      </div>
    </div>
  );
}
