'use client';

import React from 'react';
import Link from 'next/link';
import { Award, Receipt, QrCode, Coins, ArrowRight, Sparkles } from 'lucide-react';

export default function CustomerPreviewPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link href="/" className="hover:text-orange-400">Home</Link>
          <span>/</span>
          <span className="text-white font-medium">Customer Hub</span>
        </div>

        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-orange-500/30">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-orange-400/10 text-orange-400 border border-orange-400/20 mb-4">
            <Award className="w-3.5 h-3.5" />
            <span>Customer Hub (Phase 1 Preview)</span>
          </div>

          <h1 className="text-3xl font-black text-white">Diner Proof-of-Review & Reward Hub</h1>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            Welcome, Diner! In Phase 4, you can submit verified restaurant reviews using either <strong>Option 1 (Dining Receipt Slip OCR)</strong> or <strong>Option 2 (Shop QR Check-in)</strong>. All earned tokens accumulate securely in our database so you can batch-claim them to your wallet at any time.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-orange-400 font-bold text-xs flex items-center gap-2 mb-1">
                <Receipt className="w-4 h-4" />
                <span>Option 1: Dining Receipt Slip OCR</span>
              </div>
              <p className="text-xs text-slate-400">
                GPS within 100m, food photo perceptual hash, and dining receipt slip verification via OpenAI Vision.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-orange-400 font-bold text-xs flex items-center gap-2 mb-1">
                <QrCode className="w-4 h-4" />
                <span>Option 2: Counter Shop QR</span>
              </div>
              <p className="text-xs text-slate-400">
                GPS check, dish photo, and scan daily merchant counter QR with instant ElevenLabs Thai voice greeting.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-orange-400 font-bold text-xs flex items-center gap-2 mb-1">
                <Coins className="w-4 h-4" />
                <span>Asynchronous Reward Storage</span>
              </div>
              <p className="text-xs text-slate-400">
                Earnings accumulate automatically in PostgreSQL until you decide to claim to your Web3 wallet.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-orange-400 font-bold text-xs flex items-center gap-2 mb-1">
                <Award className="w-4 h-4" />
                <span>Voucher Redemptions</span>
              </div>
              <p className="text-xs text-slate-400">
                Redeem merchant discount vouchers using $TASTE tokens with an automatic 80% deflationary burn.
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
              href="/#venues-explorer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
            >
              <span>Explore Bangkok Venues</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
