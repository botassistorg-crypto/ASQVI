import { useState } from 'react';
import { Lock, Loader2, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (passcode: string) => Promise<boolean>;
  onBack: () => void;
}

export default function AdminLogin({ onLogin, onBack }: AdminLoginProps) {
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await onLogin(passcode);
      if (!success) {
        setError('Invalid passcode');
      }
    } catch {
      setError('Connection error');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-natural-white flex items-center justify-center p-6">
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #4A5D4E 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="relative w-full max-w-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-muted hover:text-forest-green text-sm font-medium uppercase tracking-elegant mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-soft-neutral rounded-3xl p-8 sm:p-10">
          <div className="text-center mb-8">
            <img
              src="https://i.ibb.co.com/h1K82LNT/file-00000000050471faaf07c29464158bf6.png"
              alt="ASQVI"
              className="h-12 w-auto mx-auto mb-5"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="password"
                  value={passcode}
                  onChange={e => { setPasscode(e.target.value); setError(''); }}
                  required
                  placeholder="Passcode"
                  className="w-full pl-12 pr-4 py-4 rounded-full border border-warm-gray text-sm focus:outline-none focus:border-forest-green transition-colors bg-natural-white"
                  autoFocus
                />
              </div>
              {error && (
                <p className="mt-3 text-sm text-danger text-center">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !passcode}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-forest-green hover:bg-forest-green-dark disabled:bg-warm-gray disabled:text-text-muted text-natural-white text-sm font-medium uppercase tracking-elegant transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
