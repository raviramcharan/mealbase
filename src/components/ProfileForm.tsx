'use client';
import { useEffect, useState } from 'react';

export default function ProfileForm({ email }: { email: string }) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/profile').then(r=>r.json()).then(d=>setName(d.name || ''));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch('/api/profile', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name }) });
    setBusy(false);
    if (!res.ok) alert('Failed to save profile');
  }

  return (
    <form className="grid gap-3" onSubmit={save} style={{maxWidth:480, margin:'12px 0 24px'}}>
      <div><label>Email</label><input className="form-input" value={email} disabled /></div>
      <div><label>Name</label><input className="form-input" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" /></div>
      <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
    </form>
  );
}
