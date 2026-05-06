import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AuthScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode]         = useState('signin'); // 'signin' | 'signup'
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fn = mode === 'signin'
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password });
    const { error: err } = await fn;
    if (err) setError(err.message);
    setLoading(false);
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h1 style={styles.logo}>paisa</h1>
        <p style={styles.sub}>your money, clearly.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="email"
            placeholder="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? '...' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          style={styles.toggle}
          onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError(''); }}
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: '100vh',
    background: 'var(--bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    background: 'var(--brown-900)',
    borderRadius: 'var(--radius-xl)',
    padding: '40px 32px',
    width: '100%',
    maxWidth: '360px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontSize: '40px',
    fontWeight: '700',
    color: 'var(--brown-300)',
    letterSpacing: '-1px',
  },
  sub: {
    fontSize: '14px',
    color: 'var(--brown-500)',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    background: '#5A3010',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: '14px 16px',
    fontSize: '15px',
    color: 'var(--brown-100)',
    outline: 'none',
  },
  error: {
    fontSize: '13px',
    color: '#F09595',
  },
  btn: {
    background: 'var(--brown-300)',
    color: 'var(--brown-900)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: '14px',
    fontSize: '15px',
    fontWeight: '500',
    fontFamily: 'var(--font-display)',
    marginTop: '4px',
    cursor: 'pointer',
  },
  toggle: {
    background: 'none',
    border: 'none',
    color: 'var(--brown-500)',
    fontSize: '13px',
    cursor: 'pointer',
    marginTop: '8px',
    textAlign: 'center',
  },
};