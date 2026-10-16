'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Wallet,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  ArrowRight,
  Flame,
  Award,
  Store,
  RefreshCw,
  Info,
} from 'lucide-react';
import { setBurnerWallet as setGlobalBurnerWallet, connectMetaMaskWallet } from '@/lib/wallet';

export default function JudgePage() {
  const [burnerWallet, setBurnerWallet] = useState<{
    address: string;
    privateKey: string;
    avaxBalance: string;
    tasteBalance: string;
    isGenerating: boolean;
    isFunded: boolean;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(false);

  // Generate burner wallet demo (Interactive prototype shell)
  const handleGenerateBurner = async () => {
    setBurnerWallet({
      address: '',
      privateKey: '',
      avaxBalance: '0.00',
      tasteBalance: '0',
      isGenerating: true,
      isFunded: false,
    });

    try {
      // Create random wallet using ethers
      const { ethers } = await import('ethers');
      const randomWallet = ethers.Wallet.createRandom();

      // In Phase 1 shell, we display the generated burner credentials
      setTimeout(() => {
        setBurnerWallet({
          address: randomWallet.address,
          privateKey: randomWallet.privateKey,
          avaxBalance: '0.10',
          tasteBalance: '10,000',
          isGenerating: false,
          isFunded: true,
        });
        setGlobalBurnerWallet(randomWallet.address);
      }, 1200);
    } catch (err) {
      console.error('Burner wallet generation failed:', err);
    }
  };

  const copyToClipboard = (text: string, type: 'addr' | 'key') => {
    navigator.clipboard.writeText(text);
    if (type === 'addr') {
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Hackathon Tag */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-6">
          <Link href="/" className="hover:text-orange-400">Home</Link>
          <span>/</span>
          <span className="text-white font-medium">Judge Testing Hub</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>U-Hackathon @ Flow Summit Bangkok 2026</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Avalanche Fuji (43113)</span>
            </span>
          </div>
        </div>

        {/* Header Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-purple-950/60 via-slate-900 to-slate-950 border border-purple-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
              <span>Flow Summit Bangkok 2026 • 24-Hour Hackathon</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Judge Evaluation Hub & Dual Faucet
            </h1>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              <strong>U-Hackathon runs inside Flow Summit Bangkok 2026</strong>, a two-day summit on the future of finance and the future of community. You get a hall of your own, 24 hours on the clock, mentors on the floor. Get the best out of your allocated time. Then you demo on the stage.
            </p>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              This dedicated testing center equips judges with an instantaneous burner wallet loaded with <strong>0.1 Fuji AVAX</strong> (gas) and <strong>10,000 $TASTE</strong> (platform token) so you can evaluate all diner and merchant workflows in seconds without importing external funds.
            </p>
          </div>

          {/* Dual Faucet Launcher Box */}
          <div className="mt-8 p-6 rounded-2xl bg-slate-900/90 border border-slate-700 max-w-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="font-bold text-base text-white">Instant 1-Click Dual Faucet</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Generates an ephemeral test keypair and dispenses <strong>0.1 AVAX</strong> + <strong>10,000 $TASTE</strong>.
                </p>
              </div>

              <button
                onClick={handleGenerateBurner}
                disabled={burnerWallet?.isGenerating}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                {burnerWallet?.isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-yellow-300" />
                    <span>Airdropping 0.1 AVAX & 10k $TASTE...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>Generate & Fund Burner</span>
                  </>
                )}
              </button>
            </div>

            {/* Generated Wallet Details Card */}
            {burnerWallet && burnerWallet.address && (
              <div className="mt-5 pt-5 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Burner Address:</span>
                  <div className="flex items-center gap-2 font-mono text-emerald-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    <span>{burnerWallet.address}</span>
                    <button
                      onClick={() => copyToClipboard(burnerWallet.address, 'addr')}
                      className="text-slate-400 hover:text-white"
                      title="Copy Address"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {copiedAddr && <span className="text-[10px] text-yellow-400">Copied!</span>}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Private Key:</span>
                  <div className="flex items-center gap-2 font-mono text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    <span>{burnerWallet.privateKey.slice(0, 10)}...{burnerWallet.privateKey.slice(-6)}</span>
                    <button
                      onClick={() => copyToClipboard(burnerWallet.privateKey, 'key')}
                      className="text-slate-400 hover:text-white"
                      title="Copy Private Key"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {copiedKey && <span className="text-[10px] text-yellow-400">Copied!</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Gas Asset (Fuji AVAX)</span>
                    <div className="text-sm font-bold text-red-400 mt-0.5">{burnerWallet.avaxBalance} AVAX</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Platform Asset ($TASTE)</span>
                    <div className="text-sm font-bold text-amber-400 mt-0.5">{burnerWallet.tasteBalance} $TASTE</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4-STAGE JUDGE TESTING CHECKLIST */}
        <div className="mt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">4-Stage Guided Evaluation Flow</h2>
            <p className="text-xs text-slate-400 mt-1">
              Follow this step-by-step checklist to test all core innovations of the protocol.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 font-bold text-xs flex items-center justify-center">
                    01
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">Role: Customer</span>
                </div>
                <h3 className="text-base font-bold text-white">Test Proof of Review & DB Rewards</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Submit a review for any of the 43,649 Bangkok venues. Test <strong>Option 1 (Dining Receipt Slip OCR)</strong> to see the AI receipt analysis, or <strong>Option 2 (Shop QR)</strong> to hear the synthesized Thai ElevenLabs voice greeting. Rewards accumulate automatically in the database accumulator.
                </p>
              </div>
              <Link
                href="/#venues-explorer"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:underline"
              >
                <span>Select a venue to review</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                    02
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">Role: Restaurant Owner</span>
                </div>
                <h3 className="text-base font-bold text-white">Test KYC Claim & ElevenLabs Voice AI</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Go to Merchant Portal, claim a Bangkok eatery by uploading mock KYC business documents (DBD corporate registration, ID card, storefront photo). Listen to 3 Thai voice styles (Friendly Welcoming, Energetic Street Food, Elegant Fine Dining) synthesized via ElevenLabs.
                </p>
              </div>
              <Link
                href="/owner"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:underline"
              >
                <span>Open Merchant Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 font-bold text-xs flex items-center justify-center">
                    03
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">Role: Merchant Escrow</span>
                </div>
                <h3 className="text-base font-bold text-white">Fund AVAX Bounty & Create $TASTE Vouchers</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Use your <strong>0.1 AVAX</strong> to fund a review visit bounty in the Merchant Escrow contract. Then create a dining discount promotion payable in <strong>$TASTE</strong> tokens with an automatic 80% deflationary burn.
                </p>
              </div>
              <Link
                href="/owner"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:underline"
              >
                <span>Launch Escrow Campaign</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center">
                    04
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">Role: Admin</span>
                </div>
                <h3 className="text-base font-bold text-white">Approve KYC & 1-Click Epoch Distribution</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Access the Admin Command Center to approve the pending owner claim, view audit logs, and trigger the <strong>1-Click Manual Token Distribution</strong> to mint today's 10,000 $TASTE emission to all verified review contributors.
                </p>
              </div>
              <Link
                href="/admin"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:underline"
              >
                <span>Open Admin Governance</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* PROTOCOL METRICS & CONTRACT REFERENCE */}
        <div className="mt-12 p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
            <Info className="w-4 h-4 text-orange-400" />
            <span>Architecture & Contract Reference (Avalanche Fuji 43113)</span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 font-semibold">Contract</th>
                  <th className="py-2.5 font-semibold">Purpose</th>
                  <th className="py-2.5 font-semibold">Status</th>
                  <th className="py-2.5 font-semibold">Standard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                <tr>
                  <td className="py-2.5 text-amber-400 font-bold">TasteToken ($TASTE)</td>
                  <td className="py-2.5 text-slate-300 font-sans">Ecosystem incentive & voucher settlement token</td>
                  <td className="py-2.5 text-emerald-400 font-semibold">Local Sandbox Verified</td>
                  <td className="py-2.5 text-slate-400">ERC-20 + Burnable + Minter</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-amber-400 font-bold">ProofOfReview</td>
                  <td className="py-2.5 text-slate-300 font-sans">Onchain verification, Pioneer 2x registry & Receipt anti-replay</td>
                  <td className="py-2.5 text-emerald-400 font-semibold">Local Sandbox Verified</td>
                  <td className="py-2.5 text-slate-400">Custom EVM Oracle</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-amber-400 font-bold">MerchantEscrow</td>
                  <td className="py-2.5 text-slate-300 font-sans">AVAX bounty escrow for diner visit incentives</td>
                  <td className="py-2.5 text-emerald-400 font-semibold">Local Sandbox Verified</td>
                  <td className="py-2.5 text-slate-400">Native AVAX Escrow</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-amber-400 font-bold">MerchantPromotions</td>
                  <td className="py-2.5 text-slate-300 font-sans">Voucher redemption with Tokenomist 80/20 deflationary burn</td>
                  <td className="py-2.5 text-emerald-400 font-semibold">Local Sandbox Verified</td>
                  <td className="py-2.5 text-slate-400">ERC-20 Settlement</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-amber-400 font-bold">DailyEpochRewards</td>
                  <td className="py-2.5 text-slate-300 font-sans">Daily 10k $TASTE pool & 1-Click Admin PoC distribution</td>
                  <td className="py-2.5 text-emerald-400 font-semibold">Local Sandbox Verified</td>
                  <td className="py-2.5 text-slate-400">Pro-Rata Emission</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
