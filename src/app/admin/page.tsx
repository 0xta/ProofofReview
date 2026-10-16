'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Users,
  Flame,
  RefreshCw,
  ArrowRight,
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Coins,
  Store,
  FileText,
  ExternalLink,
  Award,
  Calendar,
  Building,
  Eye,
  Check,
  X,
  MapPin,
  Clock,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdminStats {
  totalPlaces: number;
  bangkokPlaces: number;
  totalReviews: number;
  totalPioneers: number;
  activeBounties: number;
  totalBountyAvax: number;
  activePromotions: number;
  totalRedeemedVouchers: number;
  pendingKycCount: number;
  approvedKycCount: number;
  rejectedKycCount: number;
  todayEpochDate: string;
  isTodayEpochSettled: boolean;
  dailyEmissionRate: number;
}

interface OwnerVerificationItem {
  id: string;
  place_id: string;
  venue_name?: string;
  venue_address?: string;
  owner_address: string;
  applicant_name: string;
  contact_phone: string;
  contact_email: string | null;
  dbd_registered_name: string | null;
  dbd_company_id: string | null;
  id_card_photo_url: string;
  storefront_photo_url: string;
  utility_bill_url: string | null;
  dbd_document_url: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  admin_reviewer_address: string | null;
  admin_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
}

interface AuditLogItem {
  id: string;
  admin_address: string;
  action: string;
  target_type: string;
  target_id: string;
  details: any;
  created_at: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'epoch' | 'kyc' | 'logs'>('epoch');

  // Stats State
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Epoch Distribution State
  const [isDistributing, setIsDistributing] = useState(false);
  const [epochResult, setEpochResult] = useState<any | null>(null);
  const [epochError, setEpochError] = useState<string | null>(null);

  // KYC Verification Queue State
  const [verifications, setVerifications] = useState<OwnerVerificationItem[]>([]);
  const [kycFilter, setKycFilter] = useState<string>('PENDING');
  const [isLoadingKyc, setIsLoadingKyc] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [docModalUrl, setDocModalUrl] = useState<{ title: string; url: string } | null>(null);

  // Audit Logs State
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'kyc') {
      fetchVerifications(kycFilter);
    } else if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab, kycFilter]);

  async function fetchStats() {
    setIsLoadingStats(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingStats(false);
    }
  }

  async function fetchVerifications(status?: string) {
    setIsLoadingKyc(true);
    try {
      const query = status && status !== 'ALL' ? `?status=${status}` : '';
      const res = await fetch(`/api/admin/verifications${query}`);
      const data = await res.json();
      if (data.success) {
        setVerifications(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingKyc(false);
    }
  }

  async function fetchLogs() {
    setIsLoadingLogs(true);
    try {
      const res = await fetch('/api/admin/logs?limit=30');
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingLogs(false);
    }
  }

  async function handleDistributeEpoch() {
    setIsDistributing(true);
    setEpochError(null);
    setEpochResult(null);

    try {
      const res = await fetch('/api/admin/epoch/distribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to distribute daily epoch');
      }

      setEpochResult(data.data);
      try {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
        });
      } catch (e) {}

      // Refresh telemetry
      await fetchStats();
    } catch (err: any) {
      setEpochError(err.message);
    } finally {
      setIsDistributing(false);
    }
  }

  async function handleReviewKyc(verificationId: string, decision: 'APPROVE' | 'REJECT') {
    setReviewingId(verificationId);
    try {
      const res = await fetch('/api/admin/verifications/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId,
          adminAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          decision,
          adminNotes: reviewNotes || (decision === 'APPROVE' ? 'Verified official DBD registration and storefront photo.' : 'Insufficient documentation provided.'),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to review verification');
      }

      setReviewNotes('');
      // Refresh list
      await fetchVerifications(kycFilter);
      await fetchStats();

      if (decision === 'APPROVE') {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {}
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setReviewingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-orange-400">Home</Link>
            <span>/</span>
            <span className="text-white font-medium">Admin Governance Console</span>
          </div>

          <Link
            href="/judge"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Judge Faucet</span>
          </Link>
        </div>

        {/* Hero Header */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                <span>Governance & Protocol Administration (Phase 5)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Admin Command Center & Daily Mining Engine
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Oversee protocol telemetry, review merchant legal DBD KYC submissions, inspect immutable audit trails, and trigger <strong>1-Click Manual Daily Token Epoch Distributions</strong> for hackathon demonstrations.
              </p>
            </div>

            {/* Quick Metrics Badge */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-1.5 min-w-[240px]">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Protocol Status</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Avalanche Fuji Live
                </span>
              </div>
              <div className="text-xl font-black text-white">
                {stats ? stats.totalPlaces.toLocaleString() : '...'} <span className="text-xs font-medium text-slate-400">Bangkok Eateries</span>
              </div>
              <div className="text-xs text-purple-300 font-medium">
                {stats ? `${stats.dailyEmissionRate.toLocaleString()} $TASTE / Day` : '10,000 $TASTE / Day'}
              </div>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 mt-8 border-b border-slate-800/80 pb-2">
            <button
              onClick={() => setActiveTab('epoch')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'epoch'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>1. 1-Click Daily Epoch Mining</span>
            </button>

            <button
              onClick={() => setActiveTab('kyc')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'kyc'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>2. Merchant KYC Verification Queue</span>
              {stats && stats.pendingKycCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                  {stats.pendingKycCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'logs'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>3. Immutable Audit Trails</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: 1-CLICK DAILY EPOCH MINING DISTRIBUTION */}
        {/* ======================================================== */}
        {activeTab === 'epoch' && (
          <div className="space-y-8">
            {/* Live Telemetry Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Venues Indexed</span>
                <div className="text-xl sm:text-2xl font-black text-white mt-1">
                  {stats ? stats.bangkokPlaces.toLocaleString() : '...'}
                </div>
                <span className="text-[10px] text-emerald-400">100% Bangkok</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Verified Reviews</span>
                <div className="text-xl sm:text-2xl font-black text-orange-400 mt-1">
                  {stats ? stats.totalReviews : '...'}
                </div>
                <span className="text-[10px] text-slate-400">Proof-of-Review</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Pioneer Royalties</span>
                <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
                  {stats ? stats.totalPioneers : '...'}
                </div>
                <span className="text-[10px] text-slate-400">2x Multipliers</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Escrow Bounties</span>
                <div className="text-xl sm:text-2xl font-black text-red-400 mt-1">
                  {stats ? stats.activeBounties : '...'}
                </div>
                <span className="text-[10px] text-slate-400">{stats ? `${stats.totalBountyAvax} AVAX` : '0 AVAX'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase">80/20 Burn Promos</span>
                <div className="text-xl sm:text-2xl font-black text-pink-400 mt-1">
                  {stats ? stats.activePromotions : '...'}
                </div>
                <span className="text-[10px] text-slate-400">{stats ? `${stats.totalRedeemedVouchers} Redeemed` : '0'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Pending KYC</span>
                <div className="text-xl sm:text-2xl font-black text-purple-400 mt-1">
                  {stats ? stats.pendingKycCount : '0'}
                </div>
                <span className="text-[10px] text-slate-400">Awaiting Review</span>
              </div>
            </div>

            {/* 1-Click Manual Epoch Trigger Box (Built for Judges) */}
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 mb-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Daily Mining Settlement</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    1-Click Manual Daily Token Epoch Distribution
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                    In production, this distribution runs autonomously once every 24 hours at 00:00 UTC+7. For the hackathon demonstration, administrators and judges can click the button below to settle today&apos;s <strong>10,000 $TASTE mining pool</strong> across active review and check-in contributors!
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>Today&apos;s Epoch: <strong>{stats ? stats.todayEpochDate : '2026-10-16'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>Status: </span>
                      {stats?.isTodayEpochSettled ? (
                        <span className="text-emerald-400 font-bold">● SETTLED & DISTRIBUTED</span>
                      ) : (
                        <span className="text-amber-400 font-bold">● READY FOR 1-CLICK SETTLEMENT</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-center gap-2">
                  <button
                    onClick={handleDistributeEpoch}
                    disabled={isDistributing || stats?.isTodayEpochSettled}
                    className="px-6 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-2 shadow-sm"
                  >
                    {isDistributing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-300" />
                        <span>Settling 10,000 $TASTE Epoch...</span>
                      </>
                    ) : stats?.isTodayEpochSettled ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Epoch Already Settled Today</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-amber-300" />
                        <span>Distribute 10,000 $TASTE Epoch</span>
                      </>
                    )}
                  </button>
                  <span className="text-[11px] text-slate-500">Executes on Avalanche Fuji C-Chain</span>
                </div>
              </div>

              {/* Error Alert */}
              {epochError && (
                <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <span>{epochError}</span>
                </div>
              )}

              {/* Success Result */}
              {epochResult && (
                <div className="mt-6 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-emerald-300 text-base">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Epoch {epochResult.epochDate} Successfully Settled & Distributed!</span>
                    </div>
                    <a
                      href={epochResult.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-orange-400 hover:underline font-mono"
                    >
                      <span>Snowtrace ({epochResult.onchainTxHash.substring(0, 16)}...)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>Total Distributed: <strong>{epochResult.totalEmissionTokens} $TASTE</strong></div>
                    <div>Platform Points: <strong>{epochResult.totalPlatformPoints} Points</strong></div>
                    <div>Participants: <strong>{epochResult.totalParticipants} Diners</strong></div>
                    <div>Token Per Point: <strong>{epochResult.tokenPerPoint} $TASTE</strong></div>
                  </div>

                  {/* Distribution Table */}
                  <div className="pt-2">
                    <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Participant Reward Breakdown
                    </h5>
                    <div className="max-h-48 overflow-y-auto divide-y divide-slate-800 bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                      {epochResult.participants.map((p: any, idx: number) => (
                        <div key={idx} className="py-2 flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-300">{p.address}</span>
                          <span className="text-orange-400 font-bold">+{p.rewardTaste} $TASTE ({p.points} pts)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MERCHANT KYC VERIFICATION QUEUE */}
        {/* ======================================================== */}
        {activeTab === 'kyc' && (
          <div className="space-y-6">
            {/* Filter Row */}
            <div className="flex items-center justify-between">
              <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800">
                {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setKycFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      kycFilter === f
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <button
                onClick={() => fetchVerifications(kycFilter)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingKyc ? 'animate-spin' : ''}`} />
                <span>Refresh Queue</span>
              </button>
            </div>

            {/* Verifications List */}
            {isLoadingKyc ? (
              <div className="py-16 text-center text-xs text-slate-400">Loading merchant KYC requests...</div>
            ) : verifications.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
                No KYC verification applications found with filter &quot;{kycFilter}&quot;.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {verifications.map((v) => (
                  <div
                    key={v.id}
                    className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/30 transition-all space-y-4"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">{v.venue_name || 'Bangkok Eatery'}</h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              v.status === 'APPROVED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : v.status === 'REJECTED'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {v.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{v.venue_address || 'Bangkok, Thailand'}</p>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-slate-400">Owner Wallet:</div>
                        <code className="text-xs text-purple-300 font-mono font-semibold">
                          {v.owner_address ? `${v.owner_address.substring(0, 10)}...${v.owner_address.substring(34)}` : 'N/A'}
                        </code>
                      </div>
                    </div>

                    {/* Applicant & DBD Corporate Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Applicant Name:</span>
                        <strong className="text-white">{v.applicant_name}</strong>
                        <div className="text-slate-400 text-[11px] mt-0.5">{v.contact_phone}</div>
                        {v.contact_email && <div className="text-slate-400 text-[11px]">{v.contact_email}</div>}
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[11px]">DBD Registered Entity:</span>
                        <strong className="text-white">{v.dbd_registered_name || 'N/A'}</strong>
                        <div className="text-purple-300 font-mono text-[11px] mt-0.5">
                          Tax ID: {v.dbd_company_id || 'N/A'}
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[11px]">Submitted On:</span>
                        <span className="text-slate-300">{new Date(v.created_at).toLocaleString()}</span>
                        {v.admin_notes && (
                          <div className="mt-1 text-amber-300 text-[11px]">Note: {v.admin_notes}</div>
                        )}
                      </div>
                    </div>

                    {/* Documents Preview Grid */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Attached Legal Documents
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <button
                          type="button"
                          onClick={() => setDocModalUrl({ title: 'DBD Corporate Registration Document', url: v.dbd_document_url || v.id_card_photo_url })}
                          className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 text-left transition-all group"
                        >
                          <FileText className="w-4 h-4 text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
                          <div className="text-xs font-semibold text-white">DBD Certificate</div>
                          <div className="text-[10px] text-slate-500">View Document &rarr;</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDocModalUrl({ title: 'National ID Card Photo', url: v.id_card_photo_url })}
                          className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 text-left transition-all group"
                        >
                          <Users className="w-4 h-4 text-orange-400 mb-1 group-hover:scale-110 transition-transform" />
                          <div className="text-xs font-semibold text-white">National ID Card</div>
                          <div className="text-[10px] text-slate-500">View Photo &rarr;</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDocModalUrl({ title: 'Restaurant Storefront Photo', url: v.storefront_photo_url })}
                          className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 text-left transition-all group"
                        >
                          <Building className="w-4 h-4 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
                          <div className="text-xs font-semibold text-white">Storefront Photo</div>
                          <div className="text-[10px] text-slate-500">View Photo &rarr;</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDocModalUrl({ title: 'Utility / Electricity Bill', url: v.utility_bill_url || v.storefront_photo_url })}
                          className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 text-left transition-all group"
                        >
                          <FileText className="w-4 h-4 text-pink-400 mb-1 group-hover:scale-110 transition-transform" />
                          <div className="text-xs font-semibold text-white">Utility Bill</div>
                          <div className="text-[10px] text-slate-500">View Bill &rarr;</div>
                        </button>
                      </div>
                    </div>

                    {/* Action Controls (Only for PENDING) */}
                    {v.status === 'PENDING' && (
                      <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <input
                          type="text"
                          placeholder="Admin review rationale or internal notes..."
                          value={reviewingId === v.id ? reviewNotes : ''}
                          onChange={(e) => {
                            setReviewingId(v.id);
                            setReviewNotes(e.target.value);
                          }}
                          className="w-full sm:w-80 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                        />

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleReviewKyc(v.id, 'REJECT')}
                            disabled={reviewingId === v.id}
                            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold hover:bg-red-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>

                          <button
                            onClick={() => handleReviewKyc(v.id, 'APPROVE')}
                            disabled={reviewingId === v.id}
                            className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 disabled:opacity-50 flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve Merchant KYC</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: IMMUTABLE AUDIT TRAILS */}
        {/* ======================================================== */}
        {activeTab === 'logs' && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Governance & Security Audit Ledger</span>
              </h3>
              <button
                onClick={fetchLogs}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {isLoadingLogs ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading audit trail...</div>
            ) : logs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No audit logs recorded yet.</div>
            ) : (
              <div className="divide-y divide-slate-800">
                {logs.map((log) => (
                  <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white uppercase">{log.action}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-purple-300 font-mono">
                          {log.target_type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        By: <span className="font-mono text-slate-300">{log.admin_address}</span>
                      </div>
                      {log.details && (
                        <code className="text-[10px] text-slate-500 font-mono block mt-1 truncate max-w-xl">
                          {JSON.stringify(log.details)}
                        </code>
                      )}
                    </div>

                    <div className="text-right text-[11px] text-slate-500 shrink-0">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Document Preview Modal */}
        {docModalUrl && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-white">{docModalUrl.title}</h4>
                <button
                  onClick={() => setDocModalUrl(null)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="h-80 rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={docModalUrl.url}
                  alt={docModalUrl.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setDocModalUrl(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
