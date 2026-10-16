'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Coffee, Moon } from 'lucide-react';

export type AppTheme = 'white' | 'warm' | 'dark';

export default function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState<AppTheme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = (localStorage.getItem('tastechain_theme') as AppTheme) || 'dark';
    setCurrentTheme(saved);
    applyTheme(saved);
  }, []);

  const applyTheme = (theme: AppTheme) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('tastechain_theme', theme);
      window.dispatchEvent(
        new CustomEvent('tastechain_theme_changed', { detail: { theme } })
      );
    }
  };

  const handleSelectTheme = (theme: AppTheme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
  };

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
        <div className="w-6 h-6 rounded-lg bg-slate-800 animate-pulse" />
      </div>
    );
  }

  const themes: { id: AppTheme; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'white', label: 'White', icon: Sun },
    { id: 'warm', label: 'Warm', icon: Coffee },
    { id: 'dark', label: 'Dark', icon: Moon },
  ];

  return (
    <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-900 border border-slate-700/80 shadow-inner">
      {themes.map((t) => {
        const Icon = t.icon;
        const isActive = currentTheme === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => handleSelectTheme(t.id)}
            title={`${t.label} Theme`}
            aria-label={`${t.label} Theme`}
            className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
              isActive
                ? t.id === 'white'
                  ? 'bg-amber-100 text-amber-900 shadow-sm ring-1 ring-amber-400'
                  : t.id === 'warm'
                  ? 'bg-amber-600 text-amber-50 shadow-sm shadow-amber-600/30 ring-1 ring-amber-400'
                  : 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}
