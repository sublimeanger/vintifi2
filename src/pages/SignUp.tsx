import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, displayName);
    setLoading(false);
    if (error) {
      toast.error(error.message ?? 'Sign up failed');
    } else {
      // Check if email confirmation is required (session will be null)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      } else {
        setEmailSent(true);
      }
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <Link to="/" className="mb-8 text-2xl font-bold text-primary tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
          Vintifi
        </Link>
        <div className="w-full max-w-[420px] bg-surface border border-border rounded-2xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">📬</span>
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account and claim your 3 free credits.
          </p>
          <Link to="/login" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
            ← Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <Link
        to="/"
        className="mb-8 text-2xl font-bold text-primary tracking-tight"
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        Vintifi
      </Link>

      <div className="w-full max-w-[420px] bg-surface border border-border rounded-2xl p-8 shadow-sm">
        <h1
          className="text-xl font-bold text-foreground mb-1"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Start selling smarter — 3 free credits included
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="displayName">
              Your name
            </label>
            <input
              id="displayName"
              type="text"
              autoComplete="name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full bg-surface-sunken border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors"
              placeholder="Jamie"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-surface-sunken border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-surface-sunken border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-semibold rounded-xl py-3 text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px] shadow-[0_4px_14px_hsl(350_80%_58%/0.25)]"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}
