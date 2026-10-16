'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, Play, Pause, Check, RefreshCw, Music, AlertCircle } from 'lucide-react';
import { ShopVoice, THAI_VOICE_PERSONAS } from '@/types/voice';

interface VoiceStudioProps {
  placeId: string;
  venueName: string;
}

export default function VoiceStudio({ placeId, venueName }: VoiceStudioProps) {
  const [voices, setVoices] = useState<ShopVoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlot, setActiveSlot] = useState<number>(1);
  const [playingSlot, setPlayingSlot] = useState<number | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  // Edit states for currently selected slot
  const [editScript, setEditScript] = useState<string>('');
  const [editTitle, setEditTitle] = useState<string>('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchVoices();
  }, [placeId]);

  const fetchVoices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/places/${placeId}/voices`);
      const data = await res.json();
      if (data.success && data.voices) {
        setVoices(data.voices);
        const slot1 = data.voices.find((v: ShopVoice) => v.slot_number === 1);
        if (slot1) {
          setEditScript(slot1.script_text);
          setEditTitle(slot1.title);
        }
      }
    } catch (err) {
      console.error('Failed to load shop voices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSlot = (slotNum: number) => {
    setActiveSlot(slotNum);
    const selected = voices.find((v) => v.slot_number === slotNum);
    const persona = THAI_VOICE_PERSONAS[slotNum];
    if (selected) {
      setEditScript(selected.script_text);
      setEditTitle(selected.title);
    } else if (persona) {
      setEditScript(persona.defaultScript(venueName));
      setEditTitle(persona.defaultTitle);
    }
  };

  const handlePlayVoice = (slotNum: number, audioUrl: string) => {
    if (playingSlot === slotNum && audioElement) {
      audioElement.pause();
      setPlayingSlot(null);
      return;
    }

    if (audioElement) {
      audioElement.pause();
    }

    const audio = new Audio(audioUrl);
    audio.play().catch((err) => {
      console.warn('Audio play prevented or file not found:', err);
    });

    audio.onended = () => {
      setPlayingSlot(null);
    };

    setAudioElement(audio);
    setPlayingSlot(slotNum);
  };

  const handleSynthesize = async () => {
    if (!editScript.trim()) return;
    setIsSynthesizing(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/places/${placeId}/voices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotNumber: activeSlot,
          title: editTitle,
          scriptText: editScript,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage(
          data.isMock
            ? 'Voice synthesized successfully (Mock mode for Hackathon sandbox)!'
            : 'Voice synthesized with ElevenLabs Multilingual V2!'
        );
        await fetchVoices();
      } else {
        setStatusMessage(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setStatusMessage(`Failed to synthesize: ${err.message}`);
    } finally {
      setIsSynthesizing(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const currentPersona = THAI_VOICE_PERSONAS[activeSlot];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 mb-2">
            <Volume2 className="w-3.5 h-3.5 text-purple-400" />
            <span>ElevenLabs Thai Voice Studio</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            Custom Thai Audio Personas for {venueName}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure 3 unique Thai voice personas. When customers scan your in-store Shop QR code, one of these voices plays instantly on their smartphone.
          </p>
        </div>

        <button
          onClick={fetchVoices}
          disabled={isLoading}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 3 Voice Slots Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((slotNum) => {
          const persona = THAI_VOICE_PERSONAS[slotNum];
          const voiceData = voices.find((v) => v.slot_number === slotNum);
          const isSelected = activeSlot === slotNum;
          const isPlaying = playingSlot === slotNum;

          return (
            <div
              key={slotNum}
              onClick={() => handleSelectSlot(slotNum)}
              className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-purple-950/30 border-purple-500 ring-1 ring-purple-500/40 shadow-lg shadow-purple-500/10'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Slot #{slotNum}
                </span>

                {voiceData?.audio_url && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayVoice(slotNum, voiceData.audio_url);
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isPlaying
                        ? 'bg-purple-600 text-white animate-pulse'
                        : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500 hover:text-white'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                )}
              </div>

              <h3 className="font-bold text-sm text-white">{voiceData?.title || persona.defaultTitle}</h3>
              <p className="text-[11px] text-amber-400 mt-0.5 font-medium">{persona.name}</p>
              <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                "{voiceData?.script_text || persona.defaultScript(venueName)}"
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Plays: {voiceData?.play_count || 0} times</span>
                <span className="text-emerald-400 font-mono">
                  {voiceData?.audio_url ? 'Ready to stream' : 'Default script'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Script Editor & Synthesizer Form */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Music className="w-4 h-4 text-purple-400" />
              <span>Customize Script for Slot #{activeSlot}: {currentPersona?.name}</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Style guide: {currentPersona?.style}
            </p>
          </div>

          <span className="text-[11px] font-mono text-slate-500">
            Voice ID: {currentPersona?.elevenLabsVoiceId}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Voice Title / Occasion
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="e.g. ยินดีต้อนรับสู่ร้าน, เมนูแนะนำประจำร้าน..."
              className="w-full px-4 py-2 rounded-xl text-xs bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Thai Script Text (ข้อความเสียงภาษาไทย)
              </label>
              <span className="text-[11px] text-slate-500">
                {editScript.length} characters
              </span>
            </div>
            <textarea
              rows={4}
              value={editScript}
              onChange={(e) => setEditScript(e.target.value)}
              placeholder="พิมพ์สคริปต์ภาษาไทยสำหรับให้ AI สังเคราะห์เสียงต้อนรับหรือขอบคุณลูกค้า..."
              className="w-full px-4 py-3 rounded-xl text-xs bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500 leading-relaxed resize-none"
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              onClick={() => {
                if (currentPersona) {
                  setEditScript(currentPersona.defaultScript(venueName));
                  setEditTitle(currentPersona.defaultTitle);
                }
              }}
              type="button"
              className="text-xs text-slate-400 hover:text-slate-200 underline"
            >
              Reset to Recommended Thai Script
            </button>

            <button
              onClick={handleSynthesize}
              disabled={isSynthesizing || !editScript.trim()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-semibold text-white bg-purple-700 hover:bg-purple-600 flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {isSynthesizing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-300" />
                  <span>Synthesizing with ElevenLabs...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-white" />
                  <span>Synthesize & Save to Slot #{activeSlot}</span>
                </>
              )}
            </button>
          </div>

          {/* Status Alert */}
          {statusMessage && (
            <div className="mt-3 p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
