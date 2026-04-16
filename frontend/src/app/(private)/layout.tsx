"use client";

import React from 'react';
import { AuthProvider, useAuth } from '@/providers/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { LogOut, LayoutDashboard, Settings, User as UserIcon } from 'lucide-react';

const PrivateContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a]">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-sky-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-sky-500 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!session) {
    return <LoginForm />;
  }

  return (
    <div className="relative min-h-screen bg-[#0f172a] text-slate-200">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Modern Horizontal Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-900/60 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter text-white">TYPING PRO</span>
            </div>
            
            <div className="hidden items-center gap-6 md:flex">
              <button className="text-sm font-medium text-slate-400 transition-colors hover:text-white">Lessons</button>
              <button className="text-sm font-medium text-slate-400 transition-colors hover:text-white">Practice</button>
              <button className="text-sm font-medium text-slate-400 transition-colors hover:text-white">Global Ranking</button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-white/5 bg-slate-800/40 p-1 pl-3 pr-4 pr-1">
              <div className="h-7 w-7 rounded-full bg-slate-700 flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-slate-300" />
              </div>
              <span className="hidden text-xs font-semibold text-slate-300 lg:inline-block">
                {user?.getUsername()?.split('@')[0]}
              </span>
              <button 
                onClick={signOut}
                className="ml-2 rounded-full p-2 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400 group"
              >
                <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="relative pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-6">
          {children}
        </div>
      </main>

      {/* Decorative Gradient Line */}
      <div className="fixed top-16 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent opacity-30" />
    </div>
  );
};

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <PrivateContent>{children}</PrivateContent>
    </AuthProvider>
  );
}
