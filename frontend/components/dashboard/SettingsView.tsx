'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Shield, Globe, Cpu, RotateCcw, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';

interface SettingsViewProps {
  onResetAllState: () => void;
  selectedLanguages: string[];
  onToggleLanguage: (lang: string) => void;
}

export default function SettingsView({
  onResetAllState,
  selectedLanguages,
  onToggleLanguage,
}: SettingsViewProps) {
  const [healthStatus, setHealthStatus] = useState<{
    status: string;
    app_name?: string;
    supported_languages?: string[];
    providers_enabled?: { google_news_rss: boolean; gdelt: boolean };
  } | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [resetConfirmed, setResetConfirmed] = useState(false);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealthStatus(data);
      } else {
        setHealthStatus({ status: 'offline' });
      }
    } catch {
      setHealthStatus({ status: 'unreachable' });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const handleReset = () => {
    onResetAllState();
    setResetConfirmed(true);
    setTimeout(() => setResetConfirmed(false), 3000);
  };

  const languages = [
    { code: 'en', name: 'English', script: 'Latin' },
    { code: 'hi', name: 'Hindi', script: 'Devanagari (हिन्दी)' },
    { code: 'kn', name: 'Kannada', script: 'Kannada (ಕನ್ನಡ)' },
    { code: 'te', name: 'Telugu', script: 'Telugu (తెలుగు)' },
    { code: 'ta', name: 'Tamil', script: 'Tamil (தமிழ்)' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="p-6 bg-pureWhite border border-lightGrey shadow-editorial-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="editorial-eyebrow text-burntOrange">SYSTEM CONFIGURATION</span>
            <span className="font-mono text-[10px] text-editorialMuted">
              {'//'} ARCHITECTURE &amp; ENVIRONMENT
            </span>
          </div>
          <h2 className="font-editorial font-black text-2xl uppercase tracking-tight text-almostBlack mt-1">
            System Diagnostics, Model Specs &amp; Providers
          </h2>
          <p className="text-xs text-editorialMuted max-w-xl leading-relaxed">
            Verify connectivity to FastAPI endpoints, configure active target languages, and review
            algorithmic parameters.
          </p>
        </div>

        <Button
          onClick={checkHealth}
          disabled={isCheckingHealth}
          variant="outline"
          size="xs"
          className="font-mono uppercase text-xs"
        >
          {isCheckingHealth ? 'Pinging /health...' : 'Re-check Health'}
        </Button>
      </div>

      {/* Grid: Health Check + Session State Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Backend Connectivity Status */}
        <div className="p-6 bg-pureWhite border border-lightGrey shadow-editorial-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-lightGrey">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-burntOrange" />
              <span className="editorial-eyebrow text-burntOrange">BACKEND STATUS</span>
            </div>
            <span className="font-mono text-[10px] text-almostBlack font-bold">FASTAPI ENGINE</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-warmOffWhite border border-lightGrey text-xs">
              <span className="font-mono text-editorialMuted">API Endpoint:</span>
              <span className="font-mono font-bold text-almostBlack">
                {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-warmOffWhite border border-lightGrey text-xs">
              <span className="font-mono text-editorialMuted">Health Ping:</span>
              <span
                className={`font-mono font-bold uppercase flex items-center gap-1.5 ${
                  healthStatus?.status === 'healthy'
                    ? 'text-emerald-600'
                    : 'text-rose-600'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    healthStatus?.status === 'healthy' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
                {healthStatus?.status || 'Unknown'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-warmOffWhite border border-lightGrey text-xs">
              <span className="font-mono text-editorialMuted">Google News RSS:</span>
              <span className="font-mono font-bold text-emerald-600">ENABLED</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-warmOffWhite border border-lightGrey text-xs">
              <span className="font-mono text-editorialMuted">GDELT Global Index:</span>
              <span className="font-mono font-bold text-emerald-600">ENABLED</span>
            </div>
          </div>
        </div>

        {/* Transient Session Data & Cache Control */}
        <div className="p-6 bg-pureWhite border border-lightGrey shadow-editorial-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-lightGrey">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-burntOrange" />
                <span className="editorial-eyebrow text-burntOrange">TRANSIENT SESSION DATA</span>
              </div>
              <span className="font-mono text-[10px] text-almostBlack font-bold">LOCAL STATE</span>
            </div>

            <div className="pt-4 space-y-3">
              <p className="text-xs text-editorialMuted leading-relaxed">
                All uploaded documents, parsed entities, and cross-language comparisons reside purely in
                in-memory state for privacy. Clearing session state resets all pipelines without modifying
                backend records.
              </p>

              {resetConfirmed && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono">
                  ✓ Session state and active articles reset successfully.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-lightGrey">
            <Button
              onClick={handleReset}
              variant="outline"
              size="xs"
              className="w-full uppercase font-mono tracking-wider text-xs border-almostBlack/40 text-almostBlack hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700"
            >
              Reset Session State
            </Button>
          </div>
        </div>
      </div>

      {/* Target Languages Configuration */}
      <div className="p-6 bg-pureWhite border border-lightGrey shadow-editorial-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-lightGrey">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-burntOrange" />
            <span className="editorial-eyebrow text-burntOrange">
              ACTIVE INDIC LANGUAGE MODELS ({selectedLanguages.length}/5)
            </span>
          </div>
          <span className="font-mono text-[10px] text-almostBlack font-bold">UNICODE VERIFIED</span>
        </div>

        <p className="text-xs text-editorialMuted leading-relaxed">
          Toggle which language search queries are generated during cross-language discovery:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          {languages.map((lang) => {
            const isSelected = selectedLanguages.includes(lang.code);
            return (
              <label
                key={lang.code}
                onClick={() => onToggleLanguage(lang.code)}
                className={`p-3.5 border cursor-pointer select-none transition-all duration-150 flex flex-col justify-between ${
                  isSelected
                    ? 'border-burntOrange bg-burntOrange/5 text-almostBlack font-bold'
                    : 'border-lightGrey bg-warmOffWhite text-editorialMuted hover:border-almostBlack'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase">{lang.code}</span>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="accent-burntOrange"
                  />
                </div>
                <div className="mt-2">
                  <div className="font-editorial text-sm font-bold text-almostBlack">
                    {lang.name}
                  </div>
                  <div className="font-sans text-xs text-editorialMuted mt-0.5">{lang.script}</div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Academic Citation & Attribution */}
      <div className="p-6 bg-pureWhite border border-lightGrey shadow-editorial-sm space-y-3">
        <div className="editorial-eyebrow text-burntOrange">ACADEMIC &amp; INSTITUTIONAL ATTRIBUTION</div>
        <p className="text-xs text-editorialMuted leading-relaxed">
          <strong>Multilingual News Intelligence System</strong> was developed by{' '}
          <strong className="text-almostBlack">Ritik Singh</strong> at{' '}
          <strong className="text-almostBlack">RV University, Bengaluru</strong>. Designed for deterministic,
          explainable cross-language event framing verification.
        </p>
      </div>
    </div>
  );
}
