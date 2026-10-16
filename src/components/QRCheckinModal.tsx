'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  Play,
  Pause,
  Award,
  CheckCircle2,
  MapPin,
  Sparkles,
  RefreshCw,
  Coins,
} from 'lucide-react';

interface QRCheckinModalProps {
  placeId: string;
  venueName: string;
  nonce: string;
  customerAddress?: string;
  onClose: () => void;
}

export default function QRCheckinModal({
  placeId,
  venueName,
  nonce,
  customerAddress = '0x1234567890123456789012345678901234567890',
  onClose,
}: QRCheckinModalProps) {
  const [isCheckingIn, setIsCheckingIn] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    executeCheckin();
  }, [placeId, nonce]);

  const executeCheckin = async () => {
    setIsCheckingIn(true);
    try {
      const res = await fetch('/api/checkin/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          place_id: placeId,
          customer_address: customerAddress,
          nonce,
          skip_gps_check: true, // Bypass strict GPS check for simulator mode
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data);
        if (data.voice?.audioUrl) {
          const newAudio = new Audio(data.voice.audioUrl);
          newAudio.play().catch(() => {});
          newAudio.onplay = () => setIsPlaying(true);
          newAudio.onpause = () => setIsPlaying(false);
          newAudio.onended = () => setIsPlaying(false);
          setAudio(newAudio);
        }
      } else {
        setResult({ error: data.error });
      }
    } catch (err: any) {
      setResult({ error: err.message });
    } finally {
      setIsCheckingIn(false);
    }
  };

  const toggleAudio = () => {
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative">
        {/* Top Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white">In-Store Check-in Simulator</span>
          </div>
          <button
            onClick={() => {
              if (audio) audio.pause();
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {isCheckingIn ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
              <div className="text-sm font-bold text-white">Verifying Counter QR Nonce...</div>
              <div className="text-xs text-slate-400">Authenticating physical presence in Bangkok</div>
            </div>
          ) : result?.error ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto font-bold text-lg">
                ✕
              </div>
              <div className="text-sm font-bold text-white">Check-in Failed</div>
              <div className="text-xs text-red-400 max-w-xs mx-auto">{result.error}</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Success Badge */}
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-white">Check-in Verified!</h3>
                <p className="text-xs text-slate-400 mt-0.5">{venueName}</p>
              </div>

              {/* Reward Points Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono">REWARD ACCUMULATED</span>
                    <div className="text-sm font-bold text-amber-400">+3.0 $TASTE Points</div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  Stored in DB
                </span>
              </div>

              {/* ElevenLabs Voice AI Player Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-950 to-slate-950 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white">
                      ElevenLabs Thai Voice Greeting
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    Slot #{result.voice?.slotNumber || 1}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 italic leading-relaxed">
                  "{result.voice?.scriptText}"
                </div>

                <button
                  onClick={toggleAudio}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2 transition-colors"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pause Audio</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Play Thai Greeting Again</span>
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={() => {
                  if (audio) audio.pause();
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Close Simulator
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
