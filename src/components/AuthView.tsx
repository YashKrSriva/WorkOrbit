import React, { useState, useEffect } from 'react';
import {
  Orbit,
  Lock,
  Mail,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Shield,
  ArrowRight,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { api } from '../api';
import { User, Workspace } from '../types';
import { useToast } from './Toast';

interface AuthViewProps {
  onAuthSuccess: (user: User, currentWorkspace: Workspace | null, workspaces: Workspace[]) => void;
}

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset' | 'invite';

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const { showToast } = useToast();
  const [mode, setMode] = useState<AuthMode>('login');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [invitationData, setInvitationData] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check for inviteToken in URL query params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('inviteToken');
    if (token) {
      setInviteToken(token);
      setMode('invite');
      verifyInviteToken(token);
    }
  }, []);

  const verifyInviteToken = async (token: string) => {
    try {
      const data = await api.validateInvitation(token);
      setInvitationData(data);
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await api.login(email.trim(), password);
      showToast(`Welcome back, ${res.user.name}`, 'success');
      onAuthSuccess(res.user, res.currentWorkspace, res.workspaces);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await api.signup({
        name: name.trim(),
        email: email.trim(),
        password,
        jobTitle: jobTitle.trim() || undefined
      });
      showToast(`Account created for ${res.user.name}`, 'success');
      onAuthSuccess(res.user, res.currentWorkspace, [res.currentWorkspace]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await api.forgotPassword(email.trim());
      setSuccessMessage(res.message);
      if (res.debugToken) {
        setResetToken(res.debugToken);
        setMode('reset');
      }
      showToast('Reset request submitted', 'info');
    } catch (err: any) {
      setErrorMessage(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword(resetToken, password);
      showToast(res.message, 'success');
      setMode('login');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteToken.trim()) return;

    setLoading(true);
    try {
      // If user is not logged in, they can sign in or sign up first with their credentials
      setMode('login');
      showToast('Please sign in or create an account to accept your invitation', 'info');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click test login
  const quickLoginAs = async (emailAddr: string) => {
    setEmail(emailAddr);
    setPassword('password123');
    setLoading(true);
    try {
      const res = await api.login(emailAddr, 'password123');
      showToast(`Logged in as ${res.user.name}`, 'success');
      onAuthSuccess(res.user, res.currentWorkspace, res.workspaces);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F3F6FC] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-[#4F8CFF]/10 via-[#8B5CF6]/10 to-transparent blur-[120px] pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 text-center relative z-10">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#4F8CFF] to-[#8B5CF6] flex items-center justify-center shadow-xl shadow-[#4F8CFF]/25 mx-auto mb-3">
          <Orbit className="w-7 h-7 text-white animate-spin-slow" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          WorkOrbit
        </h1>
        <p className="text-xs sm:text-sm text-[#9AA8BD] mt-1">
          Modern project management, sprint velocity, and team collaboration.
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md rounded-2xl bg-[#151C2C] border border-[#1E283D] shadow-2xl p-6 sm:p-8 relative z-10 text-xs">
        {/* Error / Success Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-[#F87171]/15 border border-[#F87171]/40 text-[#F87171] flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 rounded-lg bg-[#34D399]/15 border border-[#34D399]/40 text-[#34D399] flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab Toggle: Sign In vs Create Account */}
        {mode !== 'forgot' && mode !== 'reset' && mode !== 'invite' && (
          <div className="flex rounded-lg bg-[#0B0F19] p-1 border border-[#1E283D] mb-6">
            <button
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                mode === 'login' ? 'bg-[#1C2638] text-white shadow-sm' : 'text-[#9AA8BD] hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                mode === 'signup' ? 'bg-[#1C2638] text-white shadow-sm' : 'text-[#9AA8BD] hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9AA8BD] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="alex@workorbit.io"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white placeholder-[#6B7A94] focus:outline-none focus:border-[#4F8CFF]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[11px] text-[#4F8CFF] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9AA8BD] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white placeholder-[#6B7A94] focus:outline-none focus:border-[#4F8CFF]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#9AA8BD] hover:text-white absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 font-semibold text-white shadow-lg shadow-[#4F8CFF]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Signing in...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 2. SIGNUP FORM */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#9AA8BD] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Connor"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white placeholder-[#6B7A94] focus:outline-none focus:border-[#4F8CFF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1">
                Work Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9AA8BD] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="sarah@enterprise.io"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white placeholder-[#6B7A94] focus:outline-none focus:border-[#4F8CFF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1">
                Role / Discipline
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Software Engineer"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white placeholder-[#6B7A94] focus:outline-none focus:border-[#4F8CFF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 chars"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white placeholder-[#6B7A94] focus:outline-none focus:border-[#4F8CFF]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1">
                  Confirm *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Repeat"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white placeholder-[#6B7A94] focus:outline-none focus:border-[#4F8CFF]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 font-semibold text-white shadow-lg shadow-[#4F8CFF]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Creating Account...' : 'Create Account & Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="text-center mb-2">
              <KeyRound className="w-8 h-8 text-[#4F8CFF] mx-auto mb-2" />
              <h3 className="font-semibold text-white text-sm">Recover Password</h3>
              <p className="text-[11px] text-[#9AA8BD] mt-0.5">
                Enter your email address to receive a secure password reset token.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="alex@workorbit.io"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white focus:outline-none focus:border-[#4F8CFF]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 font-semibold text-white transition-colors"
            >
              {loading ? 'Generating Token...' : 'Generate Reset Token'}
            </button>

            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full py-1 text-center text-xs text-[#9AA8BD] hover:text-white"
            >
              Back to Sign In
            </button>
          </form>
        )}

        {/* 4. RESET PASSWORD */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="text-center mb-2">
              <KeyRound className="w-8 h-8 text-[#34D399] mx-auto mb-2" />
              <h3 className="font-semibold text-white text-sm">Set New Password</h3>
              <p className="text-[11px] text-[#9AA8BD]">Token verified. Enter your new password below.</p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1">
                Reset Token
              </label>
              <input
                type="text"
                required
                value={resetToken}
                onChange={e => setResetToken(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white font-mono text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white focus:outline-none focus:border-[#4F8CFF]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white focus:outline-none focus:border-[#4F8CFF]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#34D399] hover:bg-[#34D399]/90 text-black font-semibold transition-colors"
            >
              Update Password
            </button>
          </form>
        )}

        {/* 5. ACCEPT INVITATION */}
        {mode === 'invite' && (
          <div className="space-y-4">
            <div className="text-center">
              <Orbit className="w-10 h-10 text-[#4F8CFF] mx-auto mb-2" />
              <h3 className="font-semibold text-white text-sm">Workspace Invitation</h3>
              {invitationData ? (
                <p className="text-xs text-[#9AA8BD] mt-1">
                  You have been invited to join <strong className="text-white">{invitationData.workspace?.name}</strong> as a{' '}
                  <strong className="text-[#4F8CFF]">{invitationData.invitation?.role}</strong>.
                </p>
              ) : (
                <p className="text-xs text-[#9AA8BD] mt-1">Verifying invitation token...</p>
              )}
            </div>

            <button
              onClick={() => setMode('login')}
              className="w-full py-2.5 rounded-lg bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 font-semibold text-white transition-colors"
            >
              Sign In to Accept
            </button>
            <button
              onClick={() => setMode('signup')}
              className="w-full py-2 rounded-lg bg-[#1C2638] hover:bg-[#25334D] text-[#F3F6FC] transition-colors"
            >
              Create Account to Accept
            </button>
          </div>
        )}

        {/* Quick Demo Switcher Presets */}
        <div className="mt-8 pt-5 border-t border-[#1E283D] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#6B7A94]">
            <span>Quick 1-Click Demo Personas</span>
            <span className="text-[10px] text-[#4F8CFF] font-normal">Instant RBAC</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => quickLoginAs('alex@workorbit.io')}
              className="p-2 rounded-lg bg-[#0B0F19] hover:bg-[#1C2638] border border-[#1E283D] text-left transition-colors group"
            >
              <div className="font-semibold text-white group-hover:text-[#4F8CFF] truncate">Alex Mercer</div>
              <div className="text-[10px] text-[#8B5CF6]">Owner</div>
            </button>

            <button
              type="button"
              onClick={() => quickLoginAs('elena@workorbit.io')}
              className="p-2 rounded-lg bg-[#0B0F19] hover:bg-[#1C2638] border border-[#1E283D] text-left transition-colors group"
            >
              <div className="font-semibold text-white group-hover:text-[#4F8CFF] truncate">Elena Rostova</div>
              <div className="text-[10px] text-[#4F8CFF]">Admin</div>
            </button>

            <button
              type="button"
              onClick={() => quickLoginAs('jordan@workorbit.io')}
              className="p-2 rounded-lg bg-[#0B0F19] hover:bg-[#1C2638] border border-[#1E283D] text-left transition-colors group"
            >
              <div className="font-semibold text-white group-hover:text-[#4F8CFF] truncate">Jordan Chen</div>
              <div className="text-[10px] text-[#34D399]">Member</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
