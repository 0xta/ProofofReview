'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Utensils, Award, Store, ShieldCheck, Flame, Wallet, Sparkles, ExternalLink, LogOut, AlertTriangle } from 'lucide-react';
import {
  connectMetaMaskWallet,
  switchToAvalancheFuji,
  getStoredWallet,
  disconnectWallet,
  AVALANCHE_FUJI_PARAMS,
} from '@/lib/wallet';

export default function Navbar() {
  const pathname = usePathname();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string | null>(null);
  const [isFuji, setIsFuji] = useState<boolean>(true);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // 1. Check stored wallet
    const stored = getStoredWallet();
    if (stored.address) {
      setWalletAddress(stored.address);
      setWalletType(stored.walletType);
    }

    // 2. Check injected MetaMask
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;

      // Check current accounts
      ethereum
        .request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setWalletType('metamask');
            localStorage.setItem('tastechain_active_wallet', accounts[0]);
            localStorage.setItem('tastechain_wallet_type', 'metamask');
          }
        })
        .catch(() => {});

      // Check chain
      ethereum
        .request({ method: 'eth_chainId' })
        .then((chainId: string) => {
          setIsFuji(chainId?.toLowerCase() === AVALANCHE_FUJI_PARAMS.chainId.toLowerCase());
        })
        .catch(() => {});

      // Event listeners
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setWalletType('metamask');
          localStorage.setItem('tastechain_active_wallet', accounts[0]);
          localStorage.setItem('tastechain_wallet_type', 'metamask');
          window.dispatchEvent(
            new CustomEvent('tastechain_wallet_changed', {
              detail: { address: accounts[0], walletType: 'metamask', isFuji: true },
            })
          );
        } else {
          setWalletAddress(null);
          setWalletType(null);
          localStorage.removeItem('tastechain_active_wallet');
          localStorage.removeItem('tastechain_wallet_type');
          window.dispatchEvent(
            new CustomEvent('tastechain_wallet_changed', {
              detail: { address: null, walletType: null, isFuji: false },
            })
          );
        }
      };

      const handleChainChanged = (chainId: string) => {
        setIsFuji(chainId?.toLowerCase() === AVALANCHE_FUJI_PARAMS.chainId.toLowerCase());
      };

      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);

      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Listen to custom wallet change events across tabs/pages
  useEffect(() => {
    const handleCustomChange = (e: any) => {
      if (e.detail) {
        setWalletAddress(e.detail.address);
        setWalletType(e.detail.walletType);
        if (typeof e.detail.isFuji === 'boolean') {
          setIsFuji(e.detail.isFuji);
        }
      }
    };
    window.addEventListener('tastechain_wallet_changed', handleCustomChange);
    return () => window.removeEventListener('tastechain_wallet_changed', handleCustomChange);
  }, []);

  const handleConnectMetaMask = async () => {
    setIsConnecting(true);
    try {
      const result = await connectMetaMaskWallet();
      if (result) {
        setWalletAddress(result.address);
        setWalletType('metamask');
        setIsFuji(result.isFuji);
      }
    } catch (err: any) {
      alert(err.message || 'MetaMask connection failed.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSwitchToFuji = async () => {
    await switchToAvalancheFuji();
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setWalletAddress(null);
    setWalletType(null);
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

            {!isFuji && walletAddress && walletType === 'metamask' && (
              <button
                onClick={handleSwitchToFuji}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all animate-pulse"
                title="Click to switch MetaMask to Avalanche Fuji Testnet"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Switch to Fuji</span>
              </button>
            )}

            {walletAddress ? (
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-xl p-1 pr-2">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-950 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-[11px] text-emerald-300 font-semibold">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
                    {walletType || 'Web3'}
                  </span>
                </div>
                <button
                  onClick={handleDisconnect}
                  title="Disconnect Wallet"
                  className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectMetaMask}
                disabled={isConnecting}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white shadow-md shadow-orange-500/20 transition-all"
              >
                <Wallet className="w-3.5 h-3.5 text-white" />
                {isConnecting ? <span>Connecting...</span> : <span>Connect MetaMask</span>}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
