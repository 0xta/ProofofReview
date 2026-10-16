import React from 'react';
import Link from 'next/link';
import { Flame, ExternalLink, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  const sponsors = [
    {
      name: 'U-Topia',
      role: 'All-in-One Digital Asset & Cross-Chain Wallet',
      desc: 'U-Topia is built around you, bringing together digital assets, payments, and cross-chain access into one seamless, all-in-one wallet.',
      color: 'from-blue-500 to-indigo-600',
      tag: 'Ecosystem Partner',
    },
    {
      name: 'ElevenLabs',
      role: 'Generative AI Voice Synthesizer',
      desc: 'Powers dynamic multilingual AI audio greetings and automated thank-you messages for verified diners across 3 customizable merchant vocal personas.',
      color: 'from-purple-500 to-pink-500',
      tag: 'AI Voice Engine',
    },
    {
      name: 'Avalanche C-Chain',
      role: 'Sub-Second Finality Blockchain Infrastructure',
      desc: 'Provides lightning-fast execution, microscopic gas fees, and robust EVM compatibility on Avalanche Fuji (Chain ID 43113) for Proof-of-Review contracts.',
      color: 'from-red-500 to-rose-600',
      tag: 'L1 Blockchain',
    },
    {
      name: 'u.bot',
      role: 'AI Assistant for Vision, Code & Content Creation',
      desc: 'u.bot is an AI assistant that can read your photos, draw images, build apps and write documents you can download.',
      color: 'from-emerald-500 to-teal-600',
      tag: 'AI Assistant',
    },
    {
      name: 'Tokenomist',
      role: 'Token Unlocks & Supply Schedules Platform',
      desc: 'Tokenomist Free gives you access to the essential tools for exploring token unlocks and supply schedules. Track upcoming unlock events, view project pages, and stay informed on tokenomics fundamentals, all in one place.',
      color: 'from-amber-500 to-yellow-600',
      tag: 'Tokenomics Platform',
    },
  ];

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-300">
      {/* 5 Sponsors Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-3">
            <Flame className="w-3.5 h-3.5" />
            <span>Official Platform Sponsors & Strategic Partners</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Backed by Web3 & AI Visionaries
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            TasteChain BKK unites cutting-edge voice intelligence, blockchain scalability, and tokenomics engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sponsors.map((s) => (
            <div
              key={s.name}
              className="group p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all shadow-sm hover:shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {s.tag}
                </span>
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${s.color}`} />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">
                {s.name}
              </h3>
              <p className="text-xs font-medium text-amber-400/90 mt-0.5">
                {s.role}
              </p>
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}

          {/* Hackathon PoC Callout */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-950/40 via-slate-900 to-purple-950/40 border border-orange-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-orange-400 mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>U-Hackathon @ Flow Summit Bangkok 2026</span>
              </div>
              <h3 className="text-lg font-bold text-white">Flow Summit Bangkok 2026</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                U-Hackathon runs inside Flow Summit Bangkok 2026, a two-day summit on the future of finance and the future of community. You get a hall of your own, 24 hours on the clock, mentors on the floor. Get the best out of your allocated time. Then you demo on the stage.
              </p>
            </div>
            <Link
              href="/judge"
              className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-95 shadow-md shadow-orange-500/20"
            >
              <span>Open Judge Demo Hub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>TasteChain BKK © 2026</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Engineered with <Heart className="w-3 h-3 text-red-500 fill-current inline" /> for Bangkok Gastronomy
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/judge" className="hover:text-slate-300 transition-colors">Judge Guide</Link>
            <Link href="/owner" className="hover:text-slate-300 transition-colors">Merchant Portal</Link>
            <Link href="/admin" className="hover:text-slate-300 transition-colors">Admin Console</Link>
            <a
              href="https://github.com/0xta/ProofofReview"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 transition-colors flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
