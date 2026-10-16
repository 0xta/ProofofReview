'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Award, Store, ShieldCheck, Sparkles, Utensils } from 'lucide-react';

export default function RoleSwitcher() {
  const pathname = usePathname();

  const roles = [
    {
      id: 'customer',
      label: 'Diner Customer',
      icon: Award,
      href: '/customer',
      activeColor: 'from-orange-500 to-amber-500 text-white',
      badge: '2-Option Reviews & 80/20 Burn',
    },
    {
      id: 'owner',
      label: 'Merchant Hub',
      icon: Store,
      href: '/owner',
      activeColor: 'from-amber-600 to-orange-600 text-white',
      badge: 'ElevenLabs Voice & QR Stand',
    },
    {
      id: 'admin',
      label: 'Protocol Admin',
      icon: ShieldCheck,
      href: '/admin',
      activeColor: 'from-purple-600 to-indigo-600 text-white',
      badge: 'DBD KYC & 1-Click Mining',
    },
    {
      id: 'judge',
      label: '1-Click Judge',
      icon: Sparkles,
      href: '/judge',
      activeColor: 'from-pink-600 to-rose-600 text-white',
      badge: '0.1 AVAX + 10k TASTE Faucet',
    },
  ];

  return (
    <div className="w-full bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md px-3 py-1.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
          <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
            Flow Summit Hackathon Mode:
          </span>
          <span className="hidden sm:inline text-slate-400 text-[11px]">
            Switch roles instantly to inspect the complete protocol lifecycle
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {roles.map((r) => {
            const Icon = r.icon;
            const isActive = pathname === r.href;

            return (
              <Link
                key={r.id}
                href={r.href}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${r.activeColor} shadow-md shadow-orange-500/20 scale-[1.02]`
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/50'
                }`}
                title={r.badge}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{r.label}</span>
                {isActive && (
                  <span className="hidden md:inline text-[9px] bg-black/30 px-1.5 py-0.2 rounded-full text-white/90">
                    ACTIVE
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
