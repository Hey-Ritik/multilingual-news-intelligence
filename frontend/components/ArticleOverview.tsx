import React from 'react';
import { IngestedArticle, LanguageDetectionResult, SummaryResult, EventProfile } from '../types';
import { BookOpen, Calendar, MapPin, Users, Activity, FileText, CheckCircle2 } from 'lucide-react';

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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-sky-50 text-sky-800 text-xs font-bold rounded-full border border-sky-200 uppercase tracking-wider">
              {language.language_name} ({language.language_code.toUpperCase()})
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Script: <span className="font-semibold text-slate-700">{language.script}</span> ({Math.round(language.confidence * 100)}% conf)
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
            <span>{meta.word_count} words</span>
            <span>•</span>
            <span>{meta.sentence_count} sentences</span>
            <span>•</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
              {article.status} Extraction
            </span>
          </div>
        </div>

        <div className="mt-4">
          <h1 className="text-2xl font-bold text-slate-900 leading-snug">
            {meta.title || "Ingested News Article"}
          </h1>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span>Publisher: <strong className="text-slate-700">{meta.publisher || "Direct Input"}</strong></span>
            {meta.publish_date && (
              <>
                <span>•</span>
                <span>Published: {meta.publish_date}</span>
              </>
            )}
          </div>
        </div>

        {/* Faithful Summary */}
        <div className="mt-5 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            <BookOpen className="w-3.5 h-3.5 text-sky-600" /> Faithful Extractive Summary
          </div>
          <p className="text-sm text-slate-800 font-serif leading-relaxed">
            {summary.summary_text}
          </p>
          <div className="mt-2 text-[11px] text-slate-500 italic">
            {summary.limitations}
          </div>
        </div>
      </div>

      {/* Structured Event Profile */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <Activity className="w-4 h-4 text-sky-600" />
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
            Structured Event Intelligence Profile
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5 text-slate-600" /> Principal Actors &amp; Entities
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {eventProfile.principal_actors.concat(eventProfile.principal_organizations).map((actor, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-800 shadow-2xs">
                  {actor}
                </span>
              ))}
              {eventProfile.principal_actors.length === 0 && eventProfile.principal_organizations.length === 0 && (
                <span className="text-xs text-slate-400 italic">No principal actors identified</span>
              )}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Activity className="w-3.5 h-3.5 text-slate-600" /> Core Action / Development
            </div>
            <div className="font-semibold text-slate-900 mt-1 capitalize text-sm">
              {eventProfile.main_action}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              {eventProfile.event_description}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-slate-600" /> Geographical Location
            </div>
            <div className="font-medium text-slate-800 mt-1">
              {eventProfile.location || <span className="text-slate-400 italic">Not explicitly specified</span>}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-slate-600" /> Event Date / Temporal Period
            </div>
            <div className="font-medium text-slate-800 mt-1">
              {eventProfile.event_date || <span className="text-slate-400 italic">Not explicitly specified in lead text</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

