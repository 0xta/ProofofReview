'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Users, Flame, RefreshCw, ArrowRight, Sparkles } from 'lucide-react';

export default function AdminPreviewPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link href="/" className="hover:text-orange-400">Home</Link>
          <span>/</span>
          <span className="text-white font-medium">Admin Governance</span>
        </div>

        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-purple-500/30">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-400/10 text-purple-400 border border-purple-400/20 mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Command Center (Phase 1 Preview)</span>
          </div>

          <h1 className="text-3xl font-black text-white">Platform Governance & Epoch Payouts</h1>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            Welcome to the Admin Console. In Phase 5, this command center provides platform statistics, audit logs for fraud detection, KYC approval actions for merchant claims, and a 1-click manual trigger for daily token epoch distributions on Avalanche Fuji.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-purple-400 font-bold text-xs flex items-center gap-2 mb-1">
                <Users className="w-4 h-4" />
                <span>1. Merchant KYC Approval Queue</span>
              </div>
              <p className="text-xs text-slate-400">
                Inspect DBD certificates, national ID photos, and storefront images. 1-click Approve or Reject with admin rationale.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-purple-400 font-bold text-xs flex items-center gap-2 mb-1">
                <RefreshCw className="w-4 h-4" />
                <span>2. 1-Click Manual Epoch Distribution</span>
              </div>
              <p className="text-xs text-slate-400">
                For hackathon judges: trigger the daily 10,000 $TASTE emission payout to review participants on demand.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-purple-400 font-bold text-xs flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4" />
                <span>3. Sybil & Fraud Audit Logs</span>
              </div>
              <p className="text-xs text-slate-400">
                Inspect anti-replay slip SHA-256 hashes, GPS distance anomalies, and perceptual image hash collisions.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-purple-400 font-bold text-xs flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>4. Escrow & Contract Telemetry</span>
              </div>
              <p className="text-xs text-slate-400">
                Live monitoring of Avalanche Fuji smart contracts, gas consumption, and accumulated $TASTE burn metrics.
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
