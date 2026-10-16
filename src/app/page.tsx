'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Flame,
  Search,
  Sparkles,
  MapPin,
  Star,
  ShieldCheck,
  Award,
  Store,
  ChevronRight,
  Receipt,
  QrCode,
  Volume2,
  Coins,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Users,
  Compass,
} from 'lucide-react';

interface Place {
  id: string;
  place_id: string;
  name: string;
  address: string | null;
  city: string | null;
  service_type: string | null;
  rating: number | null;
  total_reviews: number | null;
  google_map_url: string | null;
  has_owner?: boolean;
  active_bounties_count?: number;
  promotions_count?: number;
}

interface StatsData {
  totalPlaces: number;
  bkkPlaces: number;
  totalReviews: number;
  totalPioneers: number;
  activeBounties: number;
  totalBountyAvax: number;
  activePromotions: number;
  totalRedeemed: number;
  verifiedOwners: number;
  dailyEmissionRate: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<StatsData>({
    totalPlaces: 91530,
    bkkPlaces: 43649,
    totalReviews: 0,
    totalPioneers: 0,
    activeBounties: 0,
    totalBountyAvax: 0,
    activePromotions: 0,
    totalRedeemed: 0,
    verifiedOwners: 0,
    dailyEmissionRate: 10000,
  });

  const [places, setPlaces] = useState<Place[]>([]);
  const [totalPlaces, setTotalPlaces] = useState(0);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeRoleTab, setActiveRoleTab] = useState<'customer' | 'owner' | 'admin'>('customer');

  const categories = [
    { label: 'All Venues', value: 'ALL' },
    { label: 'Café & Bakery', value: 'cafe' },
    { label: 'Authentic Thai', value: 'thai' },
    { label: 'Street Food', value: 'street' },
    { label: 'Bar & Bistro', value: 'bar' },
    { label: 'Japanese & Asian', value: 'japanese' },
  ];

  // Fetch Stats
  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setStats(json.data);
        }
      })
      .catch((err) => console.error('Failed to load stats:', err));
  }, []);

  // Fetch Places
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPlaces();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const fetchPlaces = async () => {
    setIsLoadingPlaces(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (selectedCategory !== 'ALL') params.set('serviceType', selectedCategory);
      params.set('limit', '6');

      const res = await fetch(`/api/places?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setPlaces(json.data);
        setTotalPlaces(json.pagination.total);
      }
    } catch (err) {
      console.error('Failed to load places:', err);
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* 1. HERO BANNER */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-800">
        <div className="absolute inset-0 bg-radial-gradient from-orange-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Top Pill */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>U-Hackathon @ Flow Summit Bangkok 2026</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ElevenLabs Voice AI Synthesizer</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>43,649 Real Bangkok Venues</span>
            </span>
          </div>

          {/* Headline */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight sm:leading-none">
              The AI-Powered & Trustless{' '}
              <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Gastronomy Protocol
              </span>
            </h1>
            <p className="mt-5 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Verifiable restaurant reviews on Avalanche Fuji. Dual Proof-of-Review with Dining Receipt Slip OCR and Dynamic Shop QR check-ins, powered by ElevenLabs Thai Voice AI and 10,000 $TASTE daily mining emission.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/judge"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 hover:opacity-95 shadow-xl shadow-pink-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
              >
                <Sparkles className="w-4 h-4 text-yellow-300 group-hover:rotate-12 transition-transform" />
                <span>1-Click Judge Demo Mode</span>
                <span className="px-2 py-0.5 rounded bg-black/40 text-[10px] text-yellow-300 border border-yellow-300/40">
                  0.1 AVAX + 10k $TASTE
                </span>
              </Link>

              <a
                href="#venues-explorer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4 text-orange-400" />
                <span>Explore 43K+ Bangkok Venues</span>
              </a>

              <Link
                href="/owner"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <Store className="w-4 h-4 text-amber-400" />
                <span>Merchant Hub</span>
              </Link>
            </div>
          </div>

          {/* 2. LIVE METRICS CARDS */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Bangkok Venues</span>
                <MapPin className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {stats.bkkPlaces.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <span>43,649 mapped in DB</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Daily Mining Pool</span>
                <Coins className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">
                10,000 <span className="text-sm font-normal text-slate-400">$TASTE/day</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Asynchronous DB Claim Engine
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Verified Reviews</span>
                <Award className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {stats.totalReviews.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                2x Pioneer Bonus Slots Active
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Merchant Escrow</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                {stats.totalBountyAvax.toFixed(2)}{' '}
                <span className="text-sm font-normal text-slate-400">AVAX</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {stats.activeBounties} Active Visit Bounties
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROOF OF REVIEW: 2 OPTIONS EXPLAINED */}
      <section className="py-16 border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
              Sybil-Resistant Architecture
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-1">
              Two Options for Proof-of-Review
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Diners prove genuine physical presence and dining experience through either digital receipt verification or merchant in-store QR interaction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Option 1: Slip OCR */}
            <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-orange-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    Option 1: Receipt Slip Verification
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">Dining Receipt Slip OCR Proof</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Best for full verification with exact spend validation. Analyzes dining receipt slips against venue details.
                </p>

                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    <span><strong>GPS Coordinates Verification:</strong> Within 100 meters of the venue latitude/longitude.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    <span><strong>Food Photo Verification:</strong> Perceptual hashing (pHash) prevents photo reuse.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    <span><strong>AI Receipt Slip OCR Extraction:</strong> OpenAI Vision extracts date, amount (THB), and venue name.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    <span><strong>SHA-256 Anti-Replay:</strong> Cryptographic receipt slip hash prevents duplicate claims.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Reward: 10 Epoch Points + Bounty Eligibility</span>
                <span className="text-orange-400 font-semibold font-mono">100% On-chain Verifiable</span>
              </div>
            </div>

            {/* Option 2: Shop QR */}
            <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    Option 2: Merchant QR Check-in
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">In-Store Shop QR & Voice AI</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Fast check-in flow at the restaurant counter. Triggers custom ElevenLabs Thai AI voice greeting on customer smartphone.
                </p>

                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>GPS Coordinates Verification:</strong> Within 100 meters of restaurant location.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>Food Photo Verification:</strong> Fresh dish photo verified via pHash algorithm.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>Cryptographic Shop QR:</strong> Scan merchant's signed daily QR nonce to authenticate physical presence.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>ElevenLabs Thai Voice Greeting:</strong> Instant playback of merchant's synthetic thank-you message.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Reward: 3 Epoch Points + Voice Audio Play</span>
                <span className="text-purple-400 font-semibold font-mono">Instant Dine-In Experience</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE 3 USER ROLE FLOWS */}
      <section id="role-flows" className="py-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              3 Dedicated Platform Roles
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-1">
              Tailored Portals for Every Ecosystem Participant
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Explore the distinct workflows engineered for Diners, Restaurant Owners, and Platform Administrators.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="flex justify-center mb-8">
            <div className="p-1 rounded-2xl bg-slate-900 border border-slate-800 inline-flex gap-2">
              <button
                onClick={() => setActiveRoleTab('customer')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeRoleTab === 'customer'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Customer (Diner)</span>
              </button>
              <button
                onClick={() => setActiveRoleTab('owner')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeRoleTab === 'owner'
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Restaurant Owner</span>
              </button>
              <button
                onClick={() => setActiveRoleTab('admin')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeRoleTab === 'admin'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Governance</span>
              </button>
            </div>
          </div>

          {/* Tab Content: Customer */}
          {activeRoleTab === 'customer' && (
            <div className="p-8 rounded-3xl bg-slate-900/70 border border-orange-500/30">
              <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 mb-3">
                    <Users className="w-3.5 h-3.5" />
                    <span>Customer Experience Flow</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Dine, Verify & Accumulate Rewards</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Customers search 43,000+ Bangkok venues, submit verified reviews using either Option 1 or Option 2, and collect rewards automatically stored in the database until they are ready to claim.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-orange-400 font-bold text-xs mb-1">1. Find & Dine</div>
                      <div className="text-[11px] text-slate-400">Discover eateries with active visit bounties and 2x pioneer slots.</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-orange-400 font-bold text-xs mb-1">2. Submit Proof</div>
                      <div className="text-[11px] text-slate-400">Option 1 (Receipt Slip OCR) or Option 2 (Shop QR + Voice Greeting).</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-orange-400 font-bold text-xs mb-1">3. Asynchronous Claim</div>
                      <div className="text-[11px] text-slate-400">Rewards accumulate safely in DB. Claim to Web3 wallet whenever convenient.</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-orange-400 font-bold text-xs mb-1">4. Redeem Promotions</div>
                      <div className="text-[11px] text-slate-400">Burn $TASTE for dining vouchers (80% burned, 20% to merchant).</div>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-80 p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between shrink-0">
                  <div>
                    <span className="text-[10px] font-mono text-orange-400 uppercase tracking-wider">Try Diner Action</span>
                    <h4 className="text-base font-bold text-white mt-1">Diner Action Center</h4>
                    <p className="text-xs text-slate-400 mt-2">
                      Test review submission or browse venues below to claim pioneer badges.
                    </p>
                  </div>
                  <a
                    href="#venues-explorer"
                    className="mt-6 w-full py-2.5 rounded-xl text-xs font-bold text-center text-white bg-orange-500 hover:bg-orange-600 transition-colors"
                  >
                    Browse Bangkok Places
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Owner */}
          {activeRoleTab === 'owner' && (
            <div className="p-8 rounded-3xl bg-slate-900/70 border border-amber-500/30">
              <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 mb-3">
                    <Store className="w-3.5 h-3.5" />
                    <span>Restaurant Merchant Hub</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Claim Venue, Fund Bounties & Synthesize AI Voice</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Restaurant owners submit KYC verification documents (DBD registration, ID card, storefront photo, bills), customize store information, create dynamic QR check-ins, fund visit bounties with AVAX, and synthesize ElevenLabs Thai AI voices.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-amber-400 font-bold text-xs mb-1">1. KYC Ownership Claim</div>
                      <div className="text-[11px] text-slate-400">Upload DBD registration, merchant ID, storefront photo & utility bills.</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-amber-400 font-bold text-xs mb-1">2. Dynamic Shop QR Code</div>
                      <div className="text-[11px] text-slate-400">Generate printable shop counter QR with cryptographic daily nonce.</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-amber-400 font-bold text-xs mb-1">3. AVAX Bounty Escrow</div>
                      <div className="text-[11px] text-slate-400">Deposit AVAX rewards to incentivize verified reviews from genuine diners.</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-amber-400 font-bold text-xs mb-1">4. ElevenLabs Voice AI</div>
                      <div className="text-[11px] text-slate-400">Synthesize 3 Thai greeting/thank-you voice styles for shop check-in audio.</div>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-80 p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between shrink-0">
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Merchant Portal</span>
                    <h4 className="text-base font-bold text-white mt-1">Manage Your Restaurant</h4>
                    <p className="text-xs text-slate-400 mt-2">
                      Submit ownership verification or test owner features via the dedicated portal.
                    </p>
                  </div>
                  <Link
                    href="/owner"
                    className="mt-6 w-full py-2.5 rounded-xl text-xs font-bold text-center text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors"
                  >
                    Open Merchant Portal
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Admin */}
          {activeRoleTab === 'admin' && (
            <div className="p-8 rounded-3xl bg-slate-900/70 border border-purple-500/30">
              <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 mb-3">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin Command Center</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Protocol Governance & Epoch Distribution</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Platform administrators oversee ecosystem health, review and approve merchant KYC documents, inspect fraud audit logs, and trigger 1-click manual daily token epoch distribution for hackathon PoC evaluation.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-purple-400 font-bold text-xs mb-1">1. KYC Verification Queue</div>
                      <div className="text-[11px] text-slate-400">Review DBD business documents and approve or reject merchant claims.</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-purple-400 font-bold text-xs mb-1">2. 1-Click Manual Epoch</div>
                      <div className="text-[11px] text-slate-400">Trigger daily 10,000 $TASTE token distribution on Avalanche Fuji on-demand.</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-purple-400 font-bold text-xs mb-1">3. Sybil & Fraud Audit Logs</div>
                      <div className="text-[11px] text-slate-400">Real-time inspection of duplicate slip hashes and GPS anomalies.</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-purple-400 font-bold text-xs mb-1">4. Contract Escrow Health</div>
                      <div className="text-[11px] text-slate-400">Track total AVAX escrow balances and cumulative $TASTE burn rates.</div>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-80 p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between shrink-0">
                  <div>
                    <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">Governance Console</span>
                    <h4 className="text-base font-bold text-white mt-1">Admin Command Center</h4>
                    <p className="text-xs text-slate-400 mt-2">
                      Access approval queue, audit logs, and trigger manual epoch distribution.
                    </p>
                  </div>
                  <Link
                    href="/admin"
                    className="mt-6 w-full py-2.5 rounded-xl text-xs font-bold text-center text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                  >
                    Open Admin Console
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. BANGKOK VENUE EXPLORER (LIVE DB) */}
      <section id="venues-explorer" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                Live Bangkok Gastronomy Directory
              </span>
              <h2 className="text-3xl font-extrabold text-white mt-1">
                Explore Bangkok Venues ({totalPlaces.toLocaleString()} Total)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Verified dining locations across Bangkok with GPS coordinates ready for Proof-of-Review.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search venue name or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Venue Cards Grid */}
          {isLoadingPlaces ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse h-48" />
              ))}
            </div>
          ) : places.length === 0 ? (
            <div className="text-center py-16 p-8 rounded-2xl bg-slate-900/40 border border-slate-800">
              <MapPin className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <div className="text-sm font-bold text-white">No venues found</div>
              <div className="text-xs text-slate-400 mt-1">Try adjusting your search terms or category filter.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place) => (
                <div
                  key={place.id}
                  className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm hover:shadow-lg"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {place.service_type || 'Restaurant'}
                      </span>
                      {place.rating ? (
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{place.rating}</span>
                          <span className="text-slate-500 font-normal text-[10px]">
                            ({place.total_reviews || 0})
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                      {place.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {place.address || 'Bangkok, Thailand'}
                    </p>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {place.has_owner ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Verified Owner
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400">
                          Unclaimed Venue
                        </span>
                      )}

                      {place.active_bounties_count && place.active_bounties_count > 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                          Active Bounty
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                    {place.google_map_url ? (
                      <a
                        href={place.google_map_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3 text-orange-400" />
                        <span>Maps</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono">Bangkok</span>
                    )}

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/owner?place_id=${place.place_id}`}
                        className="text-[11px] text-amber-400 hover:underline"
                      >
                        Claim
                      </Link>
                      <Link
                        href={`/customer?place_id=${place.place_id}`}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
