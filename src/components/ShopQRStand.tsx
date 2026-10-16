'use client';

import React, { useState, useEffect } from 'react';
import { QrCode, Download, ShieldCheck, Printer, RefreshCw, Smartphone, Volume2, CheckCircle2 } from 'lucide-react';

interface ShopQRStandProps {
  placeId: string;
  venueName: string;
  address?: string;
  onSimulateCheckin?: (nonce: string) => void;
}

export default function ShopQRStand({
  placeId,
  venueName,
  address,
  onSimulateCheckin,
}: ShopQRStandProps) {
  const [qrData, setQrData] = useState<{
    qrDataUrl: string;
    nonce: string;
    epochDate: string;
    payload: any;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchQR();
  }, [placeId]);

  const fetchQR = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/places/${placeId}/qr`);
      const data = await res.json();
      if (data.success) {
        setQrData({
          qrDataUrl: data.qrDataUrl,
          nonce: data.nonce,
          epochDate: data.epochDate,
          payload: data.payload,
        });
      }
    } catch (err) {
      console.error('Failed to load shop QR:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!qrData?.qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrData.qrDataUrl;
    a.download = `TasteChain_Counter_QR_${placeId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-2">
            <QrCode className="w-3.5 h-3.5" />
            <span>Counter In-Store QR Stand</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            Proof-of-Review Shop Counter Stand
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Display this QR stand at your cashier or dining tables. Diners scan this code for Option 2 verification to earn 3 epoch points and listen to your synthetic ElevenLabs Thai greeting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchQR}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Nonce</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
        {/* Printable Stand Preview Card */}
        <div className="w-full max-w-sm bg-white text-slate-900 rounded-3xl p-8 shadow-2xl border-4 border-orange-500 text-center relative overflow-hidden">
          {/* Top Branding Banner */}
          <div className="mb-4">
            <span className="text-[10px] font-mono tracking-widest uppercase font-black text-orange-600 block">
              TasteChain BKK • Avalanche C-Chain
            </span>
            <h3 className="text-xl font-black tracking-tight text-slate-900 mt-0.5 line-clamp-1">
              {venueName}
            </h3>
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
              {address || 'Bangkok, Thailand'}
            </p>
          </div>

          {/* QR Code Frame */}
          <div className="my-5 p-3 rounded-2xl bg-slate-50 border-2 border-slate-200 inline-block shadow-inner">
            {isLoading ? (
              <div className="w-64 h-64 bg-slate-200 animate-pulse rounded-xl" />
            ) : qrData ? (
              <img
                src={qrData.qrDataUrl}
                alt="Shop Counter QR Code"
                className="w-64 h-64 object-contain rounded-xl"
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center text-xs text-slate-400">
                Failed to load QR
              </div>
            )}
          </div>

          {/* Call to Action Badge */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
              <Volume2 className="w-3.5 h-3.5 text-orange-600" />
              <span>Scan to Review & Hear Greeting</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Earn 3 $TASTE Epoch Points + Instant Thai Audio
            </p>
          </div>

          {/* Nonce Security Watermark */}
          {qrData && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Security Nonce: {qrData.nonce}</span>
              <span>{qrData.epochDate}</span>
            </div>
          )}
        </div>

        {/* Action Controls & Simulator */}
        <div className="w-full lg:w-96 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
            <h4 className="font-bold text-sm text-white flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Cryptographic Daily Anti-Fraud Nonce</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              To prevent customers from taking photos of the QR code and scanning it from home, each QR includes a daily signed nonce valid only within 24 hours and verified alongside diner GPS proximity (&le; 100m).
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Current Nonce:</span>
                <span className="text-emerald-400 font-bold">{qrData?.nonce || 'Generating...'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Date Window:</span>
                <span className="text-amber-400">{qrData?.epochDate || 'Today'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleDownload}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-orange-400" />
              <span>Download Printable Stand Image (.png)</span>
            </button>

            {onSimulateCheckin && qrData && (
              <button
                onClick={() => onSimulateCheckin(qrData.nonce)}
                className="w-full py-3 px-4 rounded-lg text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Smartphone className="w-4 h-4" />
                <span>Simulate In-Store Phone Check-in</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
