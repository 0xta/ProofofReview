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
    <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-inner">
      {themes.map((t) => {
        const Icon = t.icon;
        const isActive = currentTheme === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => handleSelectTheme(t.id)}
            title={`Switch to ${t.label} theme`}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              isActive
                ? t.id === 'white'
                  ? 'bg-white text-slate-900 shadow-md'
                  : t.id === 'warm'
                  ? 'bg-amber-600 text-amber-50 shadow-md shadow-amber-600/30'
                  : 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
