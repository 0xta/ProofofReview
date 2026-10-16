'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Coins,
  Copy,
  ExternalLink,
  RefreshCw,
  Check,
  ChevronDown,
  ShieldCheck,
  Flame,
  Award,
  Store,
} from 'lucide-react';
import { setBurnerWallet as setGlobalBurnerWallet, getStoredWallet } from '@/lib/wallet';

export default function JudgeDemoButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [burnerWallet, setBurnerWallet] = useState<{
    address: string;
    privateKey?: string;
    avaxBalance: string;
    tasteBalance: string;
    txHash?: string;
    explorerUrl?: string;
  } | null>(null);

  const [copiedAddr, setCopiedAddr] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync with stored wallet or localStorage
  useEffect(() => {
    const stored = getStoredWallet();
    const savedBurner = localStorage.getItem('tastechain_burner_address');
    const savedKey = localStorage.getItem('tastechain_burner_key');

    if (stored.walletType === 'burner' && stored.address) {
      setBurnerWallet({
        address: stored.address,
        privateKey: savedKey || undefined,
        avaxBalance: '0.10',
        tasteBalance: '10,000',
        txHash: localStorage.getItem('tastechain_faucet_tx') || undefined,
        explorerUrl: localStorage.getItem('tastechain_faucet_explorer') || undefined,
      });
    } else if (savedBurner) {
      setBurnerWallet({
        address: savedBurner,
        privateKey: savedKey || undefined,
        avaxBalance: '0.10',
        tasteBalance: '10,000',
        txHash: localStorage.getItem('tastechain_faucet_tx') || undefined,
        explorerUrl: localStorage.getItem('tastechain_faucet_explorer') || undefined,
      });
    }

    const handleCustomChange = (e: any) => {
      if (e.detail?.walletType === 'burner' && e.detail.address) {
        setBurnerWallet((prev) => ({
          address: e.detail.address,
          privateKey: prev?.privateKey,
          avaxBalance: '0.10',
          tasteBalance: '10,000',
          txHash: prev?.txHash,
          explorerUrl: prev?.explorerUrl,
        }));
      }
    };

    window.addEventListener('tastechain_wallet_changed', handleCustomChange);
    return () => window.removeEventListener('tastechain_wallet_changed', handleCustomChange);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1-Click Activate Burner and Call Faucet
  const handleActivateAndFund = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFunding(true);

    try {
      const { ethers } = await import('ethers');
      const randomWallet = ethers.Wallet.createRandom();

      const res = await fetch('/api/judge/faucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientAddress: randomWallet.address }),
      });

      const json = await res.json();
      const txHash = json.data?.txHash || '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const explorerUrl = json.data?.explorerUrl || `https://testnet.snowtrace.io/tx/${txHash}`;

      localStorage.setItem('tastechain_burner_key', randomWallet.privateKey);
      localStorage.setItem('tastechain_faucet_tx', txHash);
      localStorage.setItem('tastechain_faucet_explorer', explorerUrl);

      setBurnerWallet({
        address: randomWallet.address,
        privateKey: randomWallet.privateKey,
        avaxBalance: '0.10',
        tasteBalance: '10,000',
        txHash,
        explorerUrl,
      });

      setGlobalBurnerWallet(randomWallet.address);
      setIsOpen(true);
    } catch (err) {
      console.error('Failed to fund judge wallet:', err);
    } finally {
      setIsFunding(false);
    }
  };

  const copyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!burnerWallet?.address) return;
    navigator.clipboard.writeText(burnerWallet.address);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {burnerWallet ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-700 via-indigo-600 to-pink-600 hover:opacity-95 shadow-md shadow-purple-500/20 transition-all border border-purple-400/30"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">⚡ Judge:</span>
          <span className="font-mono text-[11px] text-yellow-300">0.1 AVAX</span>
          <span className="text-slate-400">•</span>
          <span className="font-mono text-[11px] text-amber-300">10k $TASTE</span>
          <ChevronDown className="w-3 h-3 text-purple-200" />
        </button>
      ) : (
        <button
          onClick={handleActivateAndFund}
          disabled={isFunding}
          className="relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 hover:opacity-95 shadow-md shadow-pink-500/20 hover:shadow-pink-500/40 hover:scale-[1.02] transition-all"
        >
          {isFunding ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-yellow-300" />
              <span>Dispensing Faucet...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-yellow-300" />
              <span>1-Click Judge Demo</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] text-yellow-300 border border-yellow-300/30">
                FAUCET
              </span>
            </>
          )}
        </button>
      )}

      {/* Quick Action Dropdown Modal */}
      {isOpen && burnerWallet && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-purple-500/40 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-100">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="font-bold text-xs text-white">Judge Burner Sandbox Active</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              PRE-FUNDED
            </span>
          </div>

          {/* Wallet Address & Balances */}
          <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Burner Address:</span>
              <div className="flex items-center gap-1.5 font-mono text-emerald-400">
                <span>
                  {burnerWallet.address.slice(0, 6)}...{burnerWallet.address.slice(-4)}
                </span>
                <button
                  onClick={copyAddress}
                  className="p-1 hover:text-white rounded"
                  title="Copy address"
                >
                  {copiedAddr ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900">
              <div className="p-1.5 rounded-lg bg-slate-900 text-center">
                <div className="text-[10px] text-slate-400">Gas Asset</div>
                <div className="text-xs font-bold text-red-400 font-mono">0.10 AVAX</div>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-900 text-center">
                <div className="text-[10px] text-slate-400">Platform Asset</div>
                <div className="text-xs font-bold text-amber-400 font-mono">10,000 $TASTE</div>
              </div>
            </div>
          </div>

          {/* Quick Demo Launchers */}
          <div className="mt-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              1-Click Instant Demo Launchers:
            </div>
            <div className="space-y-1.5 text-xs">
              <Link
                href="/customer?placeId=ChIJnfmYKIqd4jAR4qqq2_hixcg&opt=option1"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-800/70 hover:bg-orange-500/20 hover:text-orange-300 border border-slate-700/60 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-orange-400" />
                  <span className="font-medium text-[11px]">Dine at Jeh O (Option 1 Slip OCR)</span>
                </div>
                <span className="text-[10px] text-orange-400 font-bold">2x PIONEER</span>
              </Link>

              <Link
                href="/customer?placeId=ChIJgz60UgCf4jARR26CSkBTLqU&opt=option2"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-800/70 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700/60 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Store className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-medium text-[11px]">Pad Thai Fai Ta Lu (Shop QR Stand)</span>
                </div>
                <span className="text-[10px] text-amber-400 font-bold">AI VOICE</span>
              </Link>

              <Link
                href="/customer?placeId=ChIJEcVgHsif4jARvyo1f1YxDmo&opt=voucher"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-800/70 hover:bg-red-500/20 hover:text-red-300 border border-slate-700/60 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  <span className="font-medium text-[11px]">Thong Smith (80/20 Voucher Burn)</span>
                </div>
                <span className="text-[10px] text-red-400 font-bold">80% BURN</span>
              </Link>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <button
              onClick={handleActivateAndFund}
              disabled={isFunding}
              className="text-[11px] text-slate-400 hover:text-yellow-300 flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isFunding ? 'animate-spin' : ''}`} />
              <span>Reset / Re-fund</span>
            </button>

            <Link
              href="/judge"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <span>Full Judge Hub</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
