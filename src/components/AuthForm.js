import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import '../styles/AuthForm.css';
export default function AuthForm() {
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [login, setLogin] = useState(true);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('');
  async function submit(event) {
    event.preventDefault(); if (busy) return; setBusy(true); setError(''); setMessage('');
    try {
      if (login) await signInWithEmailAndPassword(getAuth(), email.trim(), password);
      else await createUserWithEmailAndPassword(getAuth(), email.trim(), password);
    } catch (failure) {
      const errors = { 'auth/invalid-credential': 'Email or password is incorrect.', 'auth/email-already-in-use': 'An account already exists for this email. Try signing in.',
        'auth/weak-password': 'Use a password with at least six characters.', 'auth/too-many-requests': 'Too many attempts. Please try again later.', 'auth/network-request-failed': 'Check your connection and try again.' };
      setError(errors[failure.code] || 'Could not sign in. Check your details and try again.');
    } finally { setBusy(false); }
  }
  return <main className="auth-page"><section className="auth-card"><p className="eyebrow">What's in the Box</p><h1>Find it. Wherever home is.</h1>
    <p>Keep track of your boxes, their contents and where you put them.</p><h2>{login ? 'Welcome back' : 'Create your account'}</h2>
    <form onSubmit={submit}><fieldset disabled={busy}>
      <label>Email<input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label>Password<input type="password" required minLength={login ? undefined : 6} autoComplete={login ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} /></label>
    </fieldset><button disabled={busy}>{busy ? 'Please wait…' : login ? 'Sign in' : 'Create account'}</button></form>
    {error && <p role="alert" className="error-text">{error}</p>}{message && <p role="status">{message}</p>}
    <button className="text-button" disabled={busy} onClick={() => { setLogin(!login); setError(''); setPassword(''); }}>{login ? 'New here? Create an account' : 'Already have an account? Sign in'}</button>
    {login && <button className="text-button" disabled={busy || !email} onClick={async () => {
      setBusy(true); setError('');
      try { await sendPasswordResetEmail(getAuth(), email.trim()); setMessage('If an account exists for that email, a reset link has been sent.'); }
      catch { setError('Could not request a reset link. Check your email and connection.'); } finally { setBusy(false); }
    }}>Forgot password?</button>}
  </section></main>;
}
