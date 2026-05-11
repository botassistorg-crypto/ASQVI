import { useState } from 'react';
import { Leaf, Lock, Loader2, ArrowLeft, CheckCircle2, WifiOff } from 'lucide-react';
import { isScriptConfigured } from '../../config';

interface AdminLoginProps {
  onLogin: (passcode: string) => Promise<boolean>;
  onBack: () => void;
}

export default function AdminLogin({ onLogin, onBack }: AdminLoginProps) {
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isOnline = isScriptConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await onLogin(passcode);
      if (!success) {
        if (isOnline) {
          setError('Invalid passcode. Check cell G2 in your Google Sheet.');
        } else {
          setError('Invalid passcode.');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection error. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-natural-white flex items-center justify-center p-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #4A5D4E 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="relative w-full max-w-md">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-muted hover:text-forest-green text-sm font-medium uppercase tracking-elegant mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </button>

        <div className="bg-soft-neutral rounded-3xl p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-forest-green flex items-center justify-center mx-auto mb-6">
              <Leaf className="w-8 h-8 text-natural-white" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-text-primary mb-2">Site Engine</h2>
            <p className="text-sm text-text-secondary">Enter your dynamic OTP to access</p>
          </div>

          {/* Connection Status */}
          <div className={`flex items-center gap-3 p-3 rounded-2xl mb-6 text-sm ${
            isOnline
              ? 'bg-forest-green/10 text-forest-green'
              : 'bg-warning/15 text-warning'
          }`}>
            {isOnline ? (
              <>
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-medium">Only for Admin </p>
                  <p className="text-xs opacity-70 mt-0.5"></p>
                </div>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-medium"></p>
                  <p className="text-xs opacity-70 mt-0.5"></p>
                </div>
              </>
            )}
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-elegant mb-2">
                Passcode
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="password"
                  value={passcode}
                  onChange={e => { setPasscode(e.target.value); setError(''); }}
                  required
                  placeholder={isOnline ? 'Enter passcode ' : 'Enter 123456'}
                  className="w-full pl-12 pr-4 py-4 rounded-full border border-warm-gray text-sm focus:outline-none focus:border-forest-green transition-colors bg-natural-white"
                  autoFocus
                />
              </div>
              {error && (
                <p className="mt-3 text-sm text-danger flex items-start gap-2 pl-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-danger shrink-0 mt-1.5" />
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !passcode}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-forest-green hover:bg-forest-green-dark disabled:bg-warm-gray disabled:text-text-muted text-natural-white text-sm font-medium uppercase tracking-elegant transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isOnline ? 'Verifying with Google Sheet...' : 'Verifying...'}
                </>
              ) : (
                'Access Site Engine'
              )}
            </button>
          </form>

          <div className="mt-8 p-4 rounded-2xl bg-natural-white border border-warm-gray">
            <p className="text-xs text-text-muted text-center leading-relaxed">
              🔐 Locked
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
