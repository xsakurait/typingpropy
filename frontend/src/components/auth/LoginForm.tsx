"use client";

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthContext';
import { Mail, Lock, Loader2, Rocket, ArrowRight } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a] p-4 text-slate-200 selection:bg-sky-500/30">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Glow behind card */}
        <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/10 to-indigo-500/10 rounded-3xl blur-2xl" />
        
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-xl transition-all hover:border-white/20">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 shadow-lg shadow-sky-500/20">
              <Rocket className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">TYPING PRO</h1>
            <p className="mt-3 text-slate-400">Master your code typing skills</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/5 bg-slate-800/50 py-3.5 pl-12 pr-4 text-white placeholder-slate-500 ring-offset-slate-900 transition-all focus:border-sky-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/5 bg-slate-800/50 py-3.5 pl-12 pr-4 text-white placeholder-slate-500 ring-offset-slate-900 transition-all focus:border-sky-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400 animate-in fade-in slide-in-from-top-1">
                <p className="font-semibold">Authentication Error</p>
                <p className="opacity-90">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-sky-500/25 transition-all hover:translate-y-[-1px] hover:shadow-sky-500/40 active:translate-y-[1px] disabled:opacity-70"
            >
              <div className="flex items-center justify-center gap-2">
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <button className="font-semibold text-sky-400 transition-colors hover:text-sky-300">
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
