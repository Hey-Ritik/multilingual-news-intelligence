'use client';

import React from 'react';
import { IngestedArticle, LanguageDetectionResult, SummaryResult, EventProfile } from '../types';
import { BookOpen, Calendar, MapPin, Users, Activity, CheckCircle2 } from 'lucide-react';

interface ArticleOverviewProps {
  article: IngestedArticle;
  language: LanguageDetectionResult;
  summary: SummaryResult;
  eventProfile: EventProfile;
}

export default function ArticleOverview({
  article,
  language,
  summary,
  eventProfile
}: ArticleOverviewProps) {
  const meta = article.metadata;

  return (
    <div className="space-y-6">
      {/* Masthead Card */}
      <div className="bg-pureWhite border border-lightGrey p-6 shadow-editorial-sm space-y-4">
        {/* Language & Extraction Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-lightGrey pb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-warmOffWhite text-almostBlack text-xs font-mono font-bold border border-lightGrey uppercase tracking-wider">
              {language.language_name} ({language.language_code.toUpperCase()})
            </span>
            <span className="text-xs font-mono text-editorialMuted">
              Script: <span className="font-bold text-almostBlack">{language.script}</span> ({Math.round(language.confidence * 100)}% conf)
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-editorialMuted">
            <span>{meta.word_count} words</span>
            <span>•</span>
            <span>{meta.sentence_count} sentences</span>
            <span>•</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 font-bold border border-emerald-200 uppercase">
              {article.status} Extraction
            </span>
          </div>
        </div>

        {/* Headline */}
        <div>
          <h1 className="font-editorial font-black text-2xl sm:text-3xl uppercase tracking-tight text-almostBlack leading-snug">
            {meta.title || 'Ingested News Article'}
          </h1>
          <div className="text-xs font-mono text-editorialMuted mt-1.5 flex flex-wrap items-center gap-2">
            <span>Publisher: <strong className="text-almostBlack">{meta.publisher || 'Direct Submission'}</strong></span>
            {meta.publish_date && (
              <>
                <span>•</span>
                <span>Published: {meta.publish_date}</span>
              </>
            )}
          </div>
        </div>

        {/* Faithful Extractive Summary */}
        <div className="p-4 bg-warmOffWhite border border-lightGrey space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-burntOrange uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Extractive Linguistic Summary</span>
          </div>
          <p className="text-xs text-almostBlack leading-relaxed">
            {summary.summary_text}
          </p>
          <div className="text-[10px] font-mono text-editorialMuted italic border-t border-lightGrey/60 pt-2 mt-2">
            <strong>Analytical Caveat:</strong> {summary.limitations}
          </div>
        </div>
      </div>

      {/* Structured Event Profile */}
      <div className="bg-pureWhite border border-lightGrey p-6 shadow-editorial-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-lightGrey pb-3">
          <Activity className="w-4 h-4 text-burntOrange" />
          <h2 className="font-editorial font-bold text-sm uppercase tracking-wider text-almostBlack">
            Structured Event Intelligence Profile
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Principal Actors */}
          <div className="p-3.5 bg-warmOffWhite border border-lightGrey space-y-2">
            <div className="font-mono text-[10px] font-bold text-editorialMuted uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-almostBlack" /> Principal Actors &amp; Organizations
            </div>
            <div className="flex flex-wrap gap-1.5">
              {eventProfile.principal_actors.concat(eventProfile.principal_organizations).map((actor, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-pureWhite border border-lightGrey font-mono text-[11px] font-semibold text-almostBlack"
                >
                  {actor}
                </span>
              ))}
              {eventProfile.principal_actors.length === 0 && eventProfile.principal_organizations.length === 0 && (
                <span className="text-xs text-editorialMuted italic">No principal actors identified</span>
              )}
            </div>
          </div>

          {/* Core Action */}
          <div className="p-3.5 bg-warmOffWhite border border-lightGrey space-y-1.5">
            <div className="font-mono text-[10px] font-bold text-editorialMuted uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-almostBlack" /> Core Action / Event Claim
            </div>
            <div className="font-bold text-almostBlack uppercase text-xs">
              {eventProfile.main_action}
            </div>
            <div className="text-xs text-editorialMuted leading-relaxed">
              {eventProfile.event_description}
            </div>
          </div>

          {/* Geographical Location */}
          <div className="p-3.5 bg-warmOffWhite border border-lightGrey space-y-1">
            <div className="font-mono text-[10px] font-bold text-editorialMuted uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-almostBlack" /> Geographical Location
            </div>
            <div className="font-semibold text-almostBlack">
              {eventProfile.location || <span className="text-editorialMuted italic">Not explicitly specified</span>}
            </div>
          </div>

          {/* Event Date */}
          <div className="p-3.5 bg-warmOffWhite border border-lightGrey space-y-1">
            <div className="font-mono text-[10px] font-bold text-editorialMuted uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-almostBlack" /> Event Date / Temporal Anchor
            </div>
            <div className="font-semibold text-almostBlack">
              {eventProfile.event_date || <span className="text-editorialMuted italic">Not explicitly specified in lead text</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
