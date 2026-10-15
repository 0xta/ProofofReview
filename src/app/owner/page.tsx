'use client';

import React from 'react';
import Link from 'next/link';
import { Store, ShieldCheck, QrCode, Volume2, Coins, ArrowRight, Sparkles } from 'lucide-react';

export default function OwnerPreviewPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link href="/" className="hover:text-orange-400">Home</Link>
          <span>/</span>
          <span className="text-white font-medium">Merchant Hub</span>
        </div>

        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-amber-500/30">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-4">
            <Store className="w-3.5 h-3.5" />
            <span>Restaurant Merchant Hub (Phase 1 Preview)</span>
          </div>

          <h1 className="text-3xl font-black text-white">Merchant Ownership & Loyalty Hub</h1>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            Welcome to the Restaurant Portal. In Phase 3 and Phase 5, this portal enables registered business owners to submit KYC documents (DBD registration, storefront photo, utility bills), generate shop counter QR codes, fund AVAX visit bounties, and synthesize ElevenLabs Thai AI voices.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-amber-400 font-bold text-xs flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>1. KYC Business Verification</span>
              </div>
              <p className="text-xs text-slate-400">
                Upload Department of Business Development (DBD) papers, ID card, and utility bills for official ownership verification.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-amber-400 font-bold text-xs flex items-center gap-2 mb-1">
                <QrCode className="w-4 h-4" />
                <span>2. Dynamic Shop Counter QR</span>
              </div>
              <p className="text-xs text-slate-400">
                Generate cryptographic in-store QR codes for Option 2 diner check-ins and instant voice playback.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-amber-400 font-bold text-xs flex items-center gap-2 mb-1">
                <Volume2 className="w-4 h-4" />
                <span>3. ElevenLabs Thai Voice AI</span>
              </div>
              <p className="text-xs text-slate-400">
                Configure 3 distinct Thai voice personas (Welcoming, Energetic, Luxury) that thank diners upon check-in.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-amber-400 font-bold text-xs flex items-center gap-2 mb-1">
                <Coins className="w-4 h-4" />
                <span>4. AVAX Bounties & $TASTE Vouchers</span>
              </div>
              <p className="text-xs text-slate-400">
                Deposit AVAX into escrow to attract food reviewers, and issue discount vouchers accepting $TASTE tokens.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
            <Link
              href="/judge"
              className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Back to Judge Testing Hub</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
            >
              <span>Back to Home</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
