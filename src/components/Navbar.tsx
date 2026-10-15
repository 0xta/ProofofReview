'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Utensils, Award, Store, ShieldCheck, Flame, Wallet, Sparkles } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Check if ethereum is injected
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum
        .request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        })
        .catch(() => {});
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window === 'undefined') return;
    if (!(window as any).ethereum) {
      alert('MetaMask or Web3 wallet is not detected. You can use the 1-Click Judge Demo on /judge to generate an instant burner wallet with 0.1 AVAX & 10,000 $TASTE!');
      return;
    }
    try {
      setIsConnecting(true);
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
    } catch (err: any) {
      console.error('Wallet connection failed:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const navLinks = [
    { label: 'Explore Venues', href: '/', icon: Utensils },
    { label: 'Customer', href: '/#customer-flow', icon: Award },
    { label: 'Merchant Hub', href: '/owner', icon: Store },
    { label: 'Admin', href: '/admin', icon: ShieldCheck },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
                  TasteChain <span className="text-white text-xs font-semibold px-1.5 py-0.5 rounded bg-red-600/30 border border-red-500/40">BKK</span>
                </span>
                <span className="text-[10px] text-slate-400 tracking-wider font-mono">
                  AVALANCHE FUJI (43113)
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-orange-400 bg-orange-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Action CTAs: Judge Demo & Wallet */}
          <div className="flex items-center gap-3">
            <Link
              href="/judge"
              className="relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 hover:opacity-95 shadow-md shadow-pink-500/20 hover:shadow-pink-500/40 hover:scale-[1.02] transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-yellow-300" />
              <span>1-Click Judge Demo</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] text-yellow-300 border border-yellow-300/30">
                FAUCET
              </span>
            </Link>

            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Wallet className="w-3.5 h-3.5 text-orange-400" />
              {walletAddress ? (
                <span className="font-mono text-[11px] text-emerald-400">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              ) : isConnecting ? (
                <span>Connecting...</span>
              ) : (
                <span>Connect Wallet</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
