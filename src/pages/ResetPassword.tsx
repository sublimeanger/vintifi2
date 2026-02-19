import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  // If there's a recovery token in the URL hash, show the "set new password" form
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // Supabase puts type=recovery in the URL hash after clicking the email link
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }
  }, []);

  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? 'Could not send reset email');
    } else {
      setSent(true);
    }
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? 'Could not update password');
    } else {
      toast.success('Password updated — you\'re now signed in');
      navigate('/dashboard');
    }
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
        {isRecovery ? (
          <>
            <h1 className="text-xl font-bold text-foreground mb-1" style={{ fontFamily: "'Sora', sans-serif" }}>
              Set new password
            </h1>
            <p className="text-sm text-muted-foreground mb-6">Choose a new password for your account.</p>
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="password">
                  New password
                </label>
                <input
                  id="password"
                  type="password"
                  required
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
                className="w-full bg-primary text-primary-foreground font-semibold rounded-xl py-3 text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
              >
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </form>
          </>
        ) : sent ? (
          <>
            <h1 className="text-xl font-bold text-foreground mb-1" style={{ fontFamily: "'Sora', sans-serif" }}>
              Check your email
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              We've sent a password reset link to <strong>{email}</strong>. Click the link in the email to set a new password.
            </p>
            <Link
              to="/login"
              className="block text-center text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              ← Back to sign in
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-foreground mb-1" style={{ fontFamily: "'Sora', sans-serif" }}>
              Forgot password?
            </h1>
            <p className="text-sm text-muted-foreground mb-6">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleRequestReset} className="space-y-4">
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
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground font-semibold rounded-xl py-3 text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                ← Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
