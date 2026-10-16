'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Store,
  Volume2,
  QrCode,
  ShieldCheck,
  Search,
  MapPin,
  Star,
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import VoiceStudio from '@/components/VoiceStudio';
import ShopQRStand from '@/components/ShopQRStand';
import QRCheckinModal from '@/components/QRCheckinModal';

interface Place {
  id: string;
  place_id: string;
  name: string;
  address: string | null;
  city: string | null;
  rating: number | null;
  service_type: string | null;
}

function OwnerContent() {
  const searchParams = useSearchParams();
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('ChIJgz60UgCf4jARR26CSkBTLqU'); // Default: Baobao.. Bar Sathorn
  const [venue, setVenue] = useState<Place | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [activeTab, setActiveTab] = useState<'voice' | 'qr' | 'kyc'>('voice');
  const [simulatingNonce, setSimulatingNonce] = useState<string | null>(null);

  // Sync placeId from query params if passed
  useEffect(() => {
    const paramPlaceId = searchParams.get('placeId');
    if (paramPlaceId) {
      setSelectedPlaceId(paramPlaceId);
    }
  }, [searchParams]);

  // Fetch venue details
  useEffect(() => {
    fetchVenue(selectedPlaceId);
  }, [selectedPlaceId]);

  const fetchVenue = async (id: string) => {
    try {
      const res = await fetch(`/api/places?search=&limit=1`);
      // Or query place directly
      const placeRes = await fetch(`/api/places/${id}/voices`);
      const placeData = await placeRes.json();
      if (placeData.success) {
        setVenue({
          id,
          place_id: id,
          name: placeData.venueName || 'Baobao.. Bar Sathorn',
          address: 'Sathorn, Bangkok, Thailand',
          city: 'กรุงเทพมหานคร',
          rating: 5.0,
          service_type: 'Bar & Bistro',
        });
      }
    } catch (err) {
      console.error('Failed to load venue:', err);
    }
  };

  const handleSearchVenues = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/places?search=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data);
      }
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-orange-400">Home</Link>
            <span>/</span>
            <span className="text-white font-medium">Merchant Hub</span>
            <span>/</span>
            <span className="text-amber-400 font-medium">{venue?.name || 'Selected Restaurant'}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/judge"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 shadow-md shadow-purple-500/20"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Judge Testing Hub</span>
            </Link>
          </div>
        </div>

        {/* Venue Selector Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <Store className="w-4 h-4" />
              <span>Managing Restaurant</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400">Bangkok Verified</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {venue?.name || 'Loading Venue...'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Place ID: <span className="font-mono text-slate-300">{selectedPlaceId}</span>
            </p>
          </div>

          {/* Search to Switch Venue */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Switch venue (search 43k+ places)..."
              value={searchQuery}
              onChange={(e) => handleSearchVenues(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />

            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-20 divide-y divide-slate-800">
                {searchResults.map((p) => (
                  <button
                    key={p.place_id}
                    onClick={() => {
                      setSelectedPlaceId(p.place_id);
                      setVenue(p);
                      setSearchResults([]);
                      setSearchQuery('');
                    }}
                    className="w-full p-2.5 text-left hover:bg-slate-800 text-xs flex flex-col transition-colors"
                  >
                    <span className="font-bold text-white">{p.name}</span>
                    <span className="text-[11px] text-slate-400 line-clamp-1">{p.address}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 mb-8 border-b border-slate-800 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'voice'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>ElevenLabs Voice Studio (3 Thai Styles)</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'qr'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Counter In-Store QR Stand</span>
          </button>

          <button
            onClick={() => setActiveTab('kyc')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'kyc'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>KYC Ownership Documents</span>
          </button>
        </div>

        {/* Tab 1: ElevenLabs Voice AI Studio */}
        {activeTab === 'voice' && (
          <VoiceStudio
            placeId={selectedPlaceId}
            venueName={venue?.name || 'Restaurant'}
          />
        )}

        {/* Tab 2: In-Store Shop Counter QR Stand */}
        {activeTab === 'qr' && (
          <ShopQRStand
            placeId={selectedPlaceId}
            venueName={venue?.name || 'Restaurant'}
            address={venue?.address || 'Bangkok, Thailand'}
            onSimulateCheckin={(nonce) => setSimulatingNonce(nonce)}
          />
        )}

        {/* Tab 3: KYC Ownership Submission Form */}
        {activeTab === 'kyc' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <div className="max-w-2xl">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Official Merchant Verification
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                Submit Ownership Documents (DBD & KYC)
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                To prevent fraudulent claims, restaurant owners submit official business documents reviewed by the platform administrator before receiving the Verified Owner badge and withdrawal capabilities.
              </p>

              <div className="space-y-4 mt-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    DBD Registered Business Name (ชื่อนิติบุคคล / ทะเบียนพาณิชย์)
                  </label>
                  <input
                    type="text"
                    defaultValue="บริษัท เปาเปา บาร์ จำกัด"
                    className="w-full px-4 py-2 rounded-xl text-xs bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Applicant Full Name (ชื่อ-นามสกุล ผู้ยื่นคำขอ)
                    </label>
                    <input
                      type="text"
                      defaultValue="สมชาย ใจดี"
                      className="w-full px-4 py-2 rounded-xl text-xs bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Contact Phone (เบอร์โทรศัพท์ติดต่อ)
                    </label>
                    <input
                      type="text"
                      defaultValue="081-234-5678"
                      className="w-full px-4 py-2 rounded-xl text-xs bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-300">Required Document Uploads:</div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>DBD Company Registration Certificate (หนังสือรับรอง DBD)</span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>National ID Card Photo (รูปถ่ายบัตรประชาชนผู้มีอำนาจลงนาม)</span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Storefront Photo with Signage (รูปถ่ายหน้าร้านพร้อมป้ายชื่อร้าน)</span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Recent Electricity/Water Utility Bill (บิลค่าน้ำ/ค่าไฟสถานที่ตั้ง)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert('KYC Verification request submitted! The platform administrator can review and approve this claim in the Admin Console.')}
                  className="w-full py-3 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-lg shadow-amber-400/20"
                >
                  Submit Ownership Verification Documents
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Simulator Modal */}
      {simulatingNonce && (
        <QRCheckinModal
          placeId={selectedPlaceId}
          venueName={venue?.name || 'Restaurant'}
          nonce={simulatingNonce}
          onClose={() => setSimulatingNonce(null)}
        />
      )}
    </div>
  );
}

export default function OwnerPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 p-12 text-center text-slate-400">
          Loading Merchant Hub...
        </div>
      }
    >
      <OwnerContent />
    </Suspense>
  );
}
