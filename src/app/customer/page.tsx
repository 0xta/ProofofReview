'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CURATED_JUDGE_VENUES } from '@/data/seed-venues';
import {
  Award,
  Receipt,
  QrCode,
  Coins,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Star,
  Camera,
  Upload,
  RefreshCw,
  ExternalLink,
  Flame,
  Volume2,
  Wallet,
  Copy,
  Check,
  Tag,
  ShieldCheck,
  ChevronRight,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  connectMetaMaskWallet,
  switchToAvalancheFuji,
  getStoredWallet,
  setBurnerWallet,
  disconnectWallet,
  AVALANCHE_FUJI_PARAMS,
  WalletType,
} from '@/lib/wallet';

interface Venue {
  place_id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  service_type: string | null;
}

interface RewardItem {
  id: string;
  placeId: string | null;
  venueName?: string;
  rewardType: string;
  amountTaste: number;
  amountAvax: number;
  status: 'UNCLAIMED' | 'CLAIMED';
  claimedTxHash: string | null;
  createdAt: string;
  claimedAt?: string | null;
}

interface Promotion {
  id: string;
  place_id: string;
  venue_name?: string;
  title: string;
  description: string;
  cost_in_taste: number;
  discount_percent: number;
  min_spend_thb: number;
}

function CustomerContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'review' | 'rewards' | 'vouchers'>('review');

  // Wallet State
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletType, setWalletType] = useState<WalletType>('burner');
  const [isFuji, setIsFuji] = useState(true);
  const [isConnectingMetaMask, setIsConnectingMetaMask] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Venues State
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Review Form State
  const [verificationTier, setVerificationTier] = useState<1 | 2>(1); // 1 = Slip, 2 = QR
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');
  const [simulateAtVenue, setSimulateAtVenue] = useState(true);
  const [foodPhoto, setFoodPhoto] = useState<string>('');
  const [receiptSlip, setReceiptSlip] = useState<string>('');
  const [customSlipRef, setCustomSlipRef] = useState<string>('');
  const [customAmountThb, setCustomAmountThb] = useState<string>('385.00');
  const [qrNonce, setQrNonce] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<any | null>(null);
  const [audioUrlToPlay, setAudioUrlToPlay] = useState<string | null>(null);

  // Rewards State
  const [rewardsSummary, setRewardsSummary] = useState<{
    unclaimedTaste: number;
    unclaimedAvax: number;
    claimedTaste: number;
    claimedAvax: number;
    unclaimedItems: RewardItem[];
    claimedItems: RewardItem[];
  } | null>(null);
  const [isLoadingRewards, setIsLoadingRewards] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState<any | null>(null);

  // Promotions State
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoadingPromos, setIsLoadingPromos] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState<string | null>(null);
  const [redeemedVoucher, setRedeemedVoucher] = useState<any | null>(null);

  // Initialize Wallet
  useEffect(() => {
    // 1. Check if MetaMask is already connected
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;

      ethereum
        .request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setWalletType('metamask');
            localStorage.setItem('tastechain_active_wallet', accounts[0]);
            localStorage.setItem('tastechain_wallet_type', 'metamask');
          } else {
            // Check stored wallet or fallback to burner
            initStoredOrBurner();
          }
        })
        .catch(() => initStoredOrBurner());

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
        } else {
          initStoredOrBurner();
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
    } else {
      initStoredOrBurner();
    }

    function initStoredOrBurner() {
      const stored = getStoredWallet();
      if (stored.address) {
        setWalletAddress(stored.address);
        setWalletType(stored.walletType || 'burner');
        return;
      }

      let saved = localStorage.getItem('tastechain_burner_address');
      if (!saved) {
        saved = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        localStorage.setItem('tastechain_burner_address', saved);
      }
      setWalletAddress(saved);
      setWalletType('burner');
      localStorage.setItem('tastechain_active_wallet', saved);
      localStorage.setItem('tastechain_wallet_type', 'burner');
    }
  }, []);

  // Listen to cross-component wallet change events
  useEffect(() => {
    const handleWalletChanged = (e: any) => {
      if (e.detail?.address) {
        setWalletAddress(e.detail.address);
        setWalletType(e.detail.walletType);
        if (typeof e.detail.isFuji === 'boolean') {
          setIsFuji(e.detail.isFuji);
        }
      }
    };
    window.addEventListener('tastechain_wallet_changed', handleWalletChanged);
    return () => window.removeEventListener('tastechain_wallet_changed', handleWalletChanged);
  }, []);

  async function handleConnectMetaMask() {
    setIsConnectingMetaMask(true);
    try {
      const res = await connectMetaMaskWallet();
      if (res) {
        setWalletAddress(res.address);
        setWalletType('metamask');
        setIsFuji(res.isFuji);
      }
    } catch (err: any) {
      alert(err.message || 'MetaMask connection failed. Please ensure MetaMask extension is installed and unlocked.');
    } finally {
      setIsConnectingMetaMask(false);
    }
  }

  async function handleSwitchToFuji() {
    await switchToAvalancheFuji();
  }

  function handleSwitchToBurner() {
    let burner = localStorage.getItem('tastechain_burner_address');
    if (!burner) {
      burner = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      localStorage.setItem('tastechain_burner_address', burner);
    }
    setBurnerWallet(burner);
    setWalletAddress(burner);
    setWalletType('burner');
    setIsFuji(true);
  }

  // Fetch initial venues
  useEffect(() => {
    async function fetchVenues() {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/places?limit=10${searchQuery ? `&query=${encodeURIComponent(searchQuery)}` : ''}`);
        const data = await res.json();
        if (data.places && data.places.length > 0) {
          setVenues(data.places);
          if (!selectedVenue) {
            setSelectedVenue(data.places[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load venues:', err);
      } finally {
        setIsSearching(false);
      }
    }
    const timeout = setTimeout(fetchVenues, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // When selected venue changes, fetch today's QR nonce for quick Option 2 testing
  useEffect(() => {
    if (selectedVenue) {
      fetch(`/api/places/${selectedVenue.place_id}/qr`)
        .then((r) => r.json())
        .then((d) => {
          if (d.data?.nonce) {
            setQrNonce(d.data.nonce);
          }
        })
        .catch(() => {});
    }
  }, [selectedVenue]);

  // Handle query params from Judge Hub / Quick Launchers (?placeId=...&opt=...)
  useEffect(() => {
    const paramPlaceId = searchParams.get('placeId');
    const paramOpt = searchParams.get('opt');

    if (paramPlaceId) {
      const curated = CURATED_JUDGE_VENUES.find((v) => v.id === paramPlaceId);
      if (curated) {
        setSelectedVenue({
          place_id: curated.id,
          name: curated.name,
          address: curated.area,
          latitude: curated.sampleQr.lat,
          longitude: curated.sampleQr.lng,
          rating: curated.rating,
          service_type: curated.category,
        });

        if (paramOpt === 'option1' || curated.recommendedOption === 'option1') {
          setVerificationTier(1);
          setCustomSlipRef(curated.sampleReceipt.refNumber);
          setCustomAmountThb(curated.sampleReceipt.amount.toString());
          setReceiptSlip(curated.sampleReceipt.slipUrl);
          setFoodPhoto(curated.sampleReceipt.foodPhotoUrl);
          setReviewText(`Signature ${curated.highlightDish} was absolutely incredible! Real authentic dining experience.`);
          setActiveTab('review');
        } else if (paramOpt === 'option2' || curated.recommendedOption === 'option2') {
          setVerificationTier(2);
          setFoodPhoto(curated.sampleReceipt.foodPhotoUrl);
          setReviewText(`In-store visit at ${curated.name} - sensational food and hospitality.`);
          setActiveTab('review');
        } else if (paramOpt === 'voucher' || curated.recommendedOption === 'voucher') {
          setActiveTab('vouchers');
        }
      }
    }
  }, [searchParams]);

  // Fetch rewards when entering rewards tab or wallet updates
  useEffect(() => {
    if (walletAddress && activeTab === 'rewards') {
      fetchRewards();
    }
  }, [walletAddress, activeTab]);

  // Fetch promotions when entering vouchers tab
  useEffect(() => {
    if (activeTab === 'vouchers') {
      fetchPromotions();
    }
  }, [activeTab]);

  async function fetchRewards() {
    if (!walletAddress) return;
    setIsLoadingRewards(true);
    try {
      const res = await fetch(`/api/rewards?address=${walletAddress}`);
      const data = await res.json();
      if (data.success) {
        setRewardsSummary(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingRewards(false);
    }
  }

  async function fetchPromotions() {
    setIsLoadingPromos(true);
    try {
      const res = await fetch('/api/promotions');
      const data = await res.json();
      if (data.success) {
        setPromotions(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingPromos(false);
    }
  }

  function handleCopyAddress() {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  function handleGenerateNewWallet() {
    const newAddr = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    localStorage.setItem('tastechain_burner_address', newAddr);
    setWalletAddress(newAddr);
    setRewardsSummary(null);
    setSubmitSuccess(null);
  }

  function loadSampleDishPhoto() {
    // 1x1 small mock image base64
    setFoodPhoto('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkWPjfDwAEeQHzcQ66HwAAAABJRU5ErkJggg==');
  }

  function loadSampleReceiptSlip() {
    const randomRef = 'RCP-' + Math.floor(100000 + Math.random() * 900000);
    setCustomSlipRef(randomRef);
    setCustomAmountThb('420.00');
    setReceiptSlip('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVenue) {
      setSubmitError('Please select a Bangkok restaurant.');
      return;
    }
    if (!walletAddress) {
      setSubmitError('Please connect or generate a Web3 wallet address.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    setAudioUrlToPlay(null);

    const userLat = simulateAtVenue
      ? Number(selectedVenue.latitude) || 13.7563
      : (Number(selectedVenue.latitude) || 13.7563) + 0.05; // 5km away if not simulated
    const userLng = simulateAtVenue
      ? Number(selectedVenue.longitude) || 100.5018
      : (Number(selectedVenue.longitude) || 100.5018) + 0.05;

    try {
      const payload: any = {
        placeId: selectedVenue.place_id,
        reviewerAddress: walletAddress,
        verificationTier,
        rating,
        reviewText: reviewText || 'Delicious Thai dining experience verified on TasteChain BKK.',
        userLatitude: userLat,
        userLongitude: userLng,
        foodPhoto: foodPhoto || 'sample_dish_photo',
      };

      if (verificationTier === 1) {
        payload.customSlipRef = customSlipRef || 'RCP-' + Date.now();
        payload.customAmountThb = parseFloat(customAmountThb) || 350.0;
        payload.receiptSlip = receiptSlip || 'mock_receipt_image';
      } else {
        payload.qrNonce = qrNonce;
      }

      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Review submission failed');
      }

      setSubmitSuccess(data.data);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {}

      // If Option 2 returned audio URL, play it
      if (data.data.voiceAudioUrl) {
        setAudioUrlToPlay(data.data.voiceAudioUrl);
        const audio = new Audio(data.data.voiceAudioUrl);
        audio.play().catch(() => {});
      }

      // Reset form
      setReviewText('');
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleBatchClaim() {
    if (!walletAddress) return;
    setIsClaiming(true);
    setClaimSuccess(null);

    try {
      const res = await fetch('/api/rewards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerAddress: walletAddress }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to claim rewards');
      }

      setClaimSuccess(data.data);
      try {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
        });
      } catch (e) {}

      // Refresh rewards summary
      await fetchRewards();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsClaiming(false);
    }
  }

  async function handleRedeemVoucher(promoId: string) {
    if (!walletAddress) {
      alert('Please connect your Web3 burner wallet first.');
      return;
    }
    setIsRedeeming(promoId);
    setRedeemedVoucher(null);

    try {
      const res = await fetch('/api/promotions/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promotionId: promoId,
          customerAddress: walletAddress,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to redeem voucher');
      }

      setRedeemedVoucher(data.data);
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch (e) {}
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsRedeeming(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-orange-400">Home</Link>
            <span>/</span>
            <span className="text-white font-medium">Customer Portal</span>
          </div>

          <Link
            href="/judge"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs font-semibold text-purple-300 hover:bg-purple-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Judge 1-Click Faucet</span>
          </Link>
        </div>

        {/* Header Hero */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-orange-950/20 border border-orange-500/30 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-orange-400/10 text-orange-400 border border-orange-400/20 mb-3">
                <Award className="w-3.5 h-3.5" />
                <span>Diner Gastronomy Portal (Phase 4 Verified)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Proof-of-Review & Instant Reward Hub
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Earn <strong className="text-orange-400">$TASTE</strong> and <strong className="text-red-400">AVAX bounties</strong> for authentic Bangkok restaurant reviews. Choose between <strong>Option 1 (Dining Receipt Slip)</strong> and <strong>Option 2 (Shop Counter QR)</strong>, accumulate earnings securely in the database, and batch-claim directly to your Web3 wallet!
              </p>
            </div>

            {/* Web3 / MetaMask Wallet Card */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2.5 min-w-[320px]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-orange-400" />
                  <span>
                    {walletType === 'metamask' ? '🦊 MetaMask Active' : '⚡ Demo Burner Active'}
                  </span>
                </span>
                
                {walletType === 'metamask' ? (
                  <button
                    onClick={handleSwitchToBurner}
                    className="text-[11px] text-slate-400 hover:text-orange-400 transition-colors"
                  >
                    Switch to Burner
                  </button>
                ) : (
                  <button
                    onClick={handleConnectMetaMask}
                    disabled={isConnectingMetaMask}
                    className="text-[11px] text-orange-400 hover:underline font-bold"
                  >
                    {isConnectingMetaMask ? 'Connecting...' : 'Connect MetaMask'}
                  </button>
                )}
              </div>

              {/* Wallet Address Display */}
              <div className="flex items-center justify-between bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
                <code className="text-xs text-orange-300 font-mono font-semibold">
                  {walletAddress ? `${walletAddress.substring(0, 10)}...${walletAddress.substring(34)}` : 'No wallet connected'}
                </code>
                <button
                  onClick={handleCopyAddress}
                  className="p-1 rounded text-slate-400 hover:text-white"
                  title="Copy Full Address"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Network Status & Actions */}
              <div className="flex items-center justify-between text-[11px]">
                {walletType === 'metamask' && !isFuji ? (
                  <button
                    onClick={handleSwitchToFuji}
                    className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 animate-pulse flex items-center gap-1"
                  >
                    <span>⚠️ Switch to Fuji</span>
                  </button>
                ) : (
                  <span className="text-slate-400">Avalanche Fuji C-Chain</span>
                )}

                <div className="flex items-center gap-2">
                  {walletType === 'burner' && (
                    <button
                      onClick={handleGenerateNewWallet}
                      className="text-[10px] text-slate-500 hover:text-slate-300"
                    >
                      New Burner
                    </button>
                  )}
                  <span className="text-emerald-400 font-medium">● Connected</span>
                </div>
              </div>

              {/* Quick Connect MetaMask Button if using Burner */}
              {walletType !== 'metamask' && (
                <button
                  onClick={handleConnectMetaMask}
                  disabled={isConnectingMetaMask}
                  className="w-full mt-1 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 text-orange-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Wallet className="w-3.5 h-3.5 text-orange-400" />
                  <span>{isConnectingMetaMask ? 'Connecting MetaMask...' : 'Use My MetaMask Wallet Instead'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mt-8 border-b border-slate-800/80 pb-2">
            <button
              onClick={() => setActiveTab('review')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'review'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>1. Submit Proof-of-Review</span>
            </button>

            <button
              onClick={() => setActiveTab('rewards')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'rewards'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>2. My Rewards & Claim</span>
            </button>

            <button
              onClick={() => setActiveTab('vouchers')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'vouchers'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>3. Redeem Vouchers (80/20 Burn)</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: SUBMIT PROOF-OF-REVIEW */}
        {/* ======================================================== */}
        {activeTab === 'review' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Venue Picker & Instructions */}
            <div className="lg:col-span-1 space-y-6">
              {/* Venue Search Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  <span>Select Bangkok Venue</span>
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Search across 43,649 verified eateries in Bangkok.
                </p>

                <div className="relative mb-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search venue name (e.g. Silom, Siam, Cafe)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                  {isSearching && (
                    <RefreshCw className="w-3.5 h-3.5 text-orange-400 animate-spin absolute right-3 top-2.5" />
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  {venues.map((v) => (
                    <button
                      key={v.place_id}
                      onClick={() => setSelectedVenue(v)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex flex-col gap-0.5 border ${
                        selectedVenue?.place_id === v.place_id
                          ? 'bg-orange-500/10 border-orange-500/40 text-orange-200'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="font-semibold text-white truncate">{v.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{v.address || 'Bangkok, Thailand'}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Venue Summary & Pioneer Multiplier Alert */}
              {selectedVenue && (
                <div className="p-5 rounded-2xl bg-slate-900 border border-orange-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
                      Selected Venue
                    </span>
                    <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{selectedVenue.rating || 4.5}</span>
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-white">{selectedVenue.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{selectedVenue.address || 'Bangkok, Thailand'}</p>

                  {/* Pioneer Slot Incentive Card */}
                  <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 flex items-start gap-2.5">
                    <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="font-bold text-amber-300">Pioneer 2x Multiplier Available!</div>
                      <p className="text-slate-300 text-[11px] mt-0.5 leading-snug">
                        The first 3 verified reviewers for this venue unlock <strong>2x Token Rewards</strong> and perpetual royalty rights.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Review Submission Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmitReview} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                {/* 1. Verification Tier Switcher */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Step 1: Choose Verification Proof Option
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option 1: Receipt Slip */}
                    <button
                      type="button"
                      onClick={() => setVerificationTier(1)}
                      className={`p-4 rounded-xl text-left border transition-all relative ${
                        verificationTier === 1
                          ? 'bg-orange-500/10 border-orange-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 font-bold text-xs text-orange-400">
                          <Receipt className="w-4 h-4" />
                          <span>Option 1: Dining Receipt Slip</span>
                        </div>
                        {verificationTier === 1 && <CheckCircle2 className="w-4 h-4 text-orange-400" />}
                      </div>
                      <p className="text-[11px] text-slate-300">
                        GPS &lt; 100m + Food Photo + <strong>Dining Receipt Slip</strong> (OpenAI Vision + SHA-256 Anti-Replay).
                      </p>
                      <div className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-orange-400/20 text-orange-300">
                        +10 $TASTE (20 if Pioneer)
                      </div>
                    </button>

                    {/* Option 2: Shop QR */}
                    <button
                      type="button"
                      onClick={() => setVerificationTier(2)}
                      className={`p-4 rounded-xl text-left border transition-all relative ${
                        verificationTier === 2
                          ? 'bg-orange-500/10 border-orange-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 font-bold text-xs text-orange-400">
                          <QrCode className="w-4 h-4" />
                          <span>Option 2: Shop Counter QR</span>
                        </div>
                        {verificationTier === 2 && <CheckCircle2 className="w-4 h-4 text-orange-400" />}
                      </div>
                      <p className="text-[11px] text-slate-300">
                        GPS &lt; 100m + Food Photo + Dynamic Shop QR Counter Stand + <strong>ElevenLabs Thai Voice</strong>.
                      </p>
                      <div className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-orange-400/20 text-orange-300">
                        +5 $TASTE (10 if Pioneer)
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. GPS Proximity Simulation */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold text-white">GPS Location Check (&le; 100m)</div>
                      <div className="text-[11px] text-slate-400">
                        {simulateAtVenue
                          ? 'Simulating presence at venue coordinates (0m distance)'
                          : 'Testing distant submission (> 100m)'}
                      </div>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-emerald-300">
                    <input
                      type="checkbox"
                      checked={simulateAtVenue}
                      onChange={(e) => setSimulateAtVenue(e.target.checked)}
                      className="checkbox checkbox-sm checkbox-warning"
                    />
                    <span>At Venue (Test Sim)</span>
                  </label>
                </div>

                {/* 3. Food Photo Upload */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Camera className="w-3.5 h-3.5 text-orange-400" />
                      <span>Step 2: Food Dish Photo (pHash Fingerprint)</span>
                    </label>
                    <button
                      type="button"
                      onClick={loadSampleDishPhoto}
                      className="text-[11px] text-orange-400 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>1-Click Load Sample Dish</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-dashed border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Upload className="w-4 h-4 text-slate-500" />
                      <span>{foodPhoto ? 'Food Photo Attached (pHash Ready)' : 'Attach dish photo for perceptual hashing'}</span>
                    </div>
                    {foodPhoto && (
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Attached
                      </span>
                    )}
                  </div>
                </div>

                {/* 4. Tier Specific Proof Fields */}
                {verificationTier === 1 ? (
                  // OPTION 1: Dining Receipt Slip
                  <div className="p-4 rounded-xl bg-slate-950 border border-orange-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-orange-300 flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Dining Receipt Slip OCR & Anti-Replay</span>
                      </div>
                      <button
                        type="button"
                        onClick={loadSampleReceiptSlip}
                        className="text-[11px] text-orange-400 hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>1-Click Sample Slip</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Receipt Reference No.</label>
                        <input
                          type="text"
                          value={customSlipRef}
                          onChange={(e) => setCustomSlipRef(e.target.value)}
                          placeholder="e.g. RCP-847291"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Amount Paid (THB)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={customAmountThb}
                          onChange={(e) => setCustomAmountThb(e.target.value)}
                          placeholder="e.g. 385.00"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      * SHA-256 slip hash is verified against the database to guarantee this dining receipt slip cannot be reused.
                    </p>
                  </div>
                ) : (
                  // OPTION 2: Shop Counter QR Nonce
                  <div className="p-4 rounded-xl bg-slate-950 border border-orange-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-orange-300 flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Counter Stand Dynamic QR Code (Daily Nonce)</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Scanned 16-Char Daily Nonce</label>
                      <input
                        type="text"
                        value={qrNonce}
                        onChange={(e) => setQrNonce(e.target.value)}
                        placeholder="e.g. 93851695276776dc"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-amber-300/90 bg-amber-400/10 p-2.5 rounded-lg border border-amber-400/20">
                      <Volume2 className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>
                        Submitting with Shop QR will trigger the venue&apos;s customized <strong>ElevenLabs Thai voice greeting</strong> audio in your browser!
                      </span>
                    </div>
                  </div>
                )}

                {/* 5. Rating & Review Text */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Step 3: Star Rating
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              rating >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Review Thoughts
                    </label>
                    <textarea
                      rows={3}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your culinary experience, signature dishes, flavor profile, and hospitality..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Error Banner */}
                {submitError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Success Banner */}
                {submitSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Review Verified & Rewards Awarded!</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-300 text-xs pt-1">
                      <div>
                        Tokens Earned: <strong className="text-orange-300">+{submitSuccess.rewards.totalTaste} $TASTE</strong>
                      </div>
                      {submitSuccess.rewards.bountyAvax > 0 && (
                        <div>
                          AVAX Bounty: <strong className="text-red-300">+{submitSuccess.rewards.bountyAvax} AVAX</strong>
                        </div>
                      )}
                      <div>
                        Pioneer Status: <strong>{submitSuccess.isPioneer ? `🔥 Pioneer Slot ${submitSuccess.pioneerSlot} (2x Bonus)` : 'Standard'}</strong>
                      </div>
                      <div>
                        GPS Proximity: <strong>{submitSuccess.gpsDistanceMeters}m (Verified)</strong>
                      </div>
                    </div>

                    {audioUrlToPlay && (
                      <div className="pt-2 flex items-center gap-2 text-amber-300">
                        <Volume2 className="w-4 h-4 animate-bounce" />
                        <span className="font-semibold">Playing ElevenLabs Thai voice greeting...</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold shadow-lg shadow-orange-500/20 hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Proof & Recording On-Chain...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span>Submit Verified Proof-of-Review</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MY REWARDS & WEB3 CLAIM */}
        {/* ======================================================== */}
        {activeTab === 'rewards' && (
          <div className="space-y-8">
            {/* Balance Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Claimable $TASTE */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-orange-950/30 border border-orange-500/40 relative overflow-hidden">
                <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">
                  Pending Claimable Rewards
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white mt-2">
                  {rewardsSummary ? rewardsSummary.unclaimedTaste : '0'} <span className="text-lg font-bold text-orange-400">$TASTE</span>
                </div>
                {rewardsSummary && rewardsSummary.unclaimedAvax > 0 && (
                  <div className="text-sm font-bold text-red-400 mt-1">
                    + {rewardsSummary.unclaimedAvax} AVAX (Visit Bounty)
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-2">
                  Accumulated asynchronously in PostgreSQL from check-ins & verified reviews.
                </p>
              </div>

              {/* Already Claimed */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Total Claimed to Web3 Wallet
                </div>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 mt-2">
                  {rewardsSummary ? rewardsSummary.claimedTaste : '0'} <span className="text-lg font-bold text-emerald-300">$TASTE</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Transferred directly to your Avalanche Fuji Burner Wallet.
                </p>
              </div>

              {/* Claim Action Card */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    <span>1-Click Payout Engine</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Mint and transfer all pending tokens into your wallet in a single transaction.
                  </p>
                </div>

                <button
                  onClick={handleBatchClaim}
                  disabled={isClaiming || !rewardsSummary || rewardsSummary.unclaimedTaste === 0}
                  className="mt-4 w-full py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-600 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {isClaiming ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Settling Payout On-Chain...</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="w-3.5 h-3.5" />
                      <span>Claim All to Web3 Wallet</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Claim Success Banner */}
            {claimSuccess && (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200">
                <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tokens Successfully Claimed to Web3 Wallet!</span>
                </div>
                <p className="text-xs text-slate-300">
                  Transferred <strong>{claimSuccess.claimedTaste} $TASTE</strong> across {claimSuccess.itemsClaimedCount} reward items.
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <a
                    href={claimSuccess.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-orange-400 hover:underline font-mono"
                  >
                    <span>View on Snowtrace ({claimSuccess.txHash.substring(0, 16)}...)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Itemized Rewards Ledger */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Coins className="w-4 h-4 text-orange-400" />
                  <span>Reward Accumulator Ledger</span>
                </h3>
                <button
                  onClick={fetchRewards}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingRewards ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {isLoadingRewards ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading reward ledger...</div>
              ) : !rewardsSummary || (rewardsSummary.unclaimedItems.length === 0 && rewardsSummary.claimedItems.length === 0) ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No rewards accumulated yet. Submit a verified review or scan a Shop QR counter to start earning!
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {rewardsSummary.unclaimedItems.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-white">{item.venueName}</div>
                        <div className="text-[11px] text-slate-400">
                          Type: <span className="text-orange-300">{item.rewardType}</span> • {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-orange-400">+{item.amountTaste} $TASTE</div>
                        {item.amountAvax > 0 && <div className="text-[11px] text-red-400">+{item.amountAvax} AVAX</div>}
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20">
                          UNCLAIMED
                        </span>
                      </div>
                    </div>
                  ))}

                  {rewardsSummary.claimedItems.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between text-xs opacity-75">
                      <div>
                        <div className="font-semibold text-white">{item.venueName}</div>
                        <div className="text-[11px] text-slate-400">
                          Type: {item.rewardType} • Claimed on {item.claimedAt ? new Date(item.claimedAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-400">+{item.amountTaste} $TASTE</div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-400/10 text-emerald-300 border border-emerald-400/20">
                          CLAIMED
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: REDEEM VOUCHERS (80/20 BURN MODEL) */}
        {/* ======================================================== */}
        {activeTab === 'vouchers' && (
          <div className="space-y-6">
            {/* Tokenomist Deflationary Explainer */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-950/40 via-slate-900 to-slate-900 border border-orange-500/30">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Tokenomist Free 80/20 Deflationary Token Model</span>
                  </h3>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                    Whenever a diner redeems a restaurant discount voucher on TasteChain BKK, <strong>80% of the $TASTE tokens are permanently burned on-chain</strong> (reducing total circulating supply), while <strong>20% is transferred to the restaurant merchant</strong> as revenue.
                  </p>
                </div>
              </div>
            </div>

            {/* Redeemed Voucher Success Banner */}
            {redeemedVoucher && (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200">
                <div className="flex items-center gap-2 font-bold text-emerald-300 text-base mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Voucher Successfully Redeemed!</span>
                </div>
                <p className="text-xs text-slate-300">
                  Present this redemption code to the waiter at <strong>{redeemedVoucher.venueName}</strong>:
                </p>

                <div className="my-4 p-4 rounded-xl bg-slate-950 border border-emerald-500/40 text-center">
                  <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Voucher Code</div>
                  <div className="text-2xl font-black font-mono text-emerald-400 tracking-wider">
                    {redeemedVoucher.redemptionCode}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div>🔥 Burned Deflationarily (80%): <strong>{redeemedVoucher.burnedTaste} $TASTE</strong></div>
                  <div>🏪 Paid to Merchant (20%): <strong>{redeemedVoucher.merchantReceivedTaste} $TASTE</strong></div>
                </div>
              </div>
            )}

            {/* Available Promotions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {isLoadingPromos ? (
                <div className="col-span-full py-12 text-center text-xs text-slate-400">Loading active merchant vouchers...</div>
              ) : promotions.length === 0 ? (
                <div className="col-span-full py-12 text-center text-xs text-slate-400">No active promotions available right now.</div>
              ) : (
                promotions.map((promo) => {
                  const burnAmount = Math.round(promo.cost_in_taste * 0.8 * 100) / 100;
                  const merchantAmount = Math.round((promo.cost_in_taste - burnAmount) * 100) / 100;

                  return (
                    <div
                      key={promo.id}
                      className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-orange-500/40 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider truncate max-w-[180px]">
                            {promo.venue_name || 'Bangkok Eatery'}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20">
                            {promo.discount_percent}% OFF
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white mb-1">{promo.title}</h4>
                        <p className="text-xs text-slate-400 mb-4">{promo.description}</p>

                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px] mb-4">
                          <div className="flex justify-between text-slate-300">
                            <span>Cost:</span>
                            <span className="font-bold text-white">{promo.cost_in_taste} $TASTE</span>
                          </div>
                          <div className="flex justify-between text-red-400">
                            <span>🔥 Burned (80%):</span>
                            <span>{burnAmount} $TASTE</span>
                          </div>
                          <div className="flex justify-between text-emerald-400">
                            <span>🏪 Merchant (20%):</span>
                            <span>{merchantAmount} $TASTE</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRedeemVoucher(promo.id)}
                        disabled={isRedeeming === promo.id}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        {isRedeeming === promo.id ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Burning Tokens...</span>
                          </>
                        ) : (
                          <>
                            <Tag className="w-3.5 h-3.5" />
                            <span>Redeem for {promo.cost_in_taste} $TASTE</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 p-12 text-center text-slate-400">
          Loading Diner Action Center...
        </div>
      }
    >
      <CustomerContent />
    </Suspense>
  );
}
