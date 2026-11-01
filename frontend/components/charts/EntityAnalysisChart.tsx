'use client';

import React, { useState, useEffect } from 'react';
import { NamedEntity } from '../../types';
import { Tag, Info, CheckCircle2, Layers } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface EntityAnalysisChartProps {
  entities: NamedEntity[];
  compact?: boolean;
}

interface EntityClassBarItem {
  className: string;
  count: number;
  pctOfTotal: number;
  sampleItems: string[];
}

export default function EntityAnalysisChart({
  entities,
  compact = false,
}: EntityAnalysisChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalEntities = entities ? entities.length : 0;

  if (totalEntities === 0) {
    return (
      <div className="p-8 bg-warmOffWhite border border-lightGrey text-center space-y-2">
        <Tag className="w-8 h-8 text-lightGrey mx-auto stroke-[1.25]" />
        <div className="font-mono text-xs font-bold uppercase text-almostBlack">
          No Named Entities Extracted
        </div>
        <p className="text-xs text-editorialMuted max-w-sm mx-auto">
          The analyzed text did not contain recognized proper entities (persons, organizations, or locations) meeting confidence thresholds.
        </p>
      </div>
    );
  }

  // Group entities by classification label from actual backend response
  const classMap = new Map<string, { count: number; samples: Set<string> }>();

  entities.forEach((ent) => {
    const label = (ent.label || 'OTHER').toUpperCase();
    const existing = classMap.get(label) || { count: 0, samples: new Set<string>() };
    existing.count += 1;
    if (ent.text && existing.samples.size < 4) {
      existing.samples.add(ent.text.trim());
    }
    classMap.set(label, existing);
  });

  // Build sorted array of entity classes descending by frequency
  const chartData: EntityClassBarItem[] = Array.from(classMap.entries())
    .map(([className, data]) => ({
      className,
      count: data.count,
      pctOfTotal: Math.round((data.count / totalEntities) * 100),
      sampleItems: Array.from(data.samples),
    }))
    .sort((a, b) => b.count - a.count);

  const activeClassesCount = chartData.length;
  const isSingleClass = activeClassesCount === 1;
  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  // Controlled height so bars never become giant monoliths
  const chartHeight = Math.max(130, Math.min(240, chartData.length * 44 + 40));

  // Determine top entity class
  const dominantClass = chartData[0];

  return (
    <div className="space-y-4">
      {/* Chart Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-lightGrey">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-burntOrange" />
          <span className="editorial-eyebrow text-burntOrange">
            NAMED ENTITY CLASS DISTRIBUTION
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="px-2 py-0.5 bg-warmOffWhite border border-lightGrey text-almostBlack font-bold uppercase">
            {totalEntities} TOTAL {totalEntities === 1 ? 'ENTITY' : 'ENTITIES'}
          </span>
          <span className="px-2 py-0.5 bg-almostBlack text-pureWhite font-bold uppercase">
            {activeClassesCount} {activeClassesCount === 1 ? 'CLASS' : 'CLASSES'} DETECTED
          </span>
        </div>
      </div>

      {/* Main Bar Chart Container */}
      <div className="w-full">
        {isMounted ? (
          <div style={{ height: `${chartHeight}px` }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 8, right: 35, left: 20, bottom: 8 }}
                barSize={18}
                maxBarSize={20}
              >
                <XAxis
                  type="number"
                  domain={[0, Math.max(maxCount, 2)]}
                  allowDecimals={false}
                  tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#76726B' }}
                  axisLine={{ stroke: '#E5E3DE' }}
                  tickLine={{ stroke: '#E5E3DE' }}
                />
                <YAxis
                  dataKey="className"
                  type="category"
                  width={110}
                  tick={{
                    fontSize: 10,
                    fontFamily: 'JetBrains Mono',
                    fontWeight: 600,
                    fill: '#171717',
                  }}
                  axisLine={{ stroke: '#E5E3DE' }}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(23, 23, 23, 0.04)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as EntityClassBarItem;
                      return (
                        <div className="bg-almostBlack text-pureWhite border border-darkCharcoal p-3 shadow-editorial-md font-mono text-xs space-y-1.5 max-w-xs">
                          <div className="flex items-center justify-between gap-2 border-b border-darkCharcoal pb-1">
                            <span className="font-bold uppercase text-burntOrange">
                              {data.className}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-pureWhite/10 font-bold">
                              {data.count} ({data.pctOfTotal}%)
                            </span>
                          </div>
                          {data.sampleItems.length > 0 && (
                            <div className="space-y-0.5 text-[11px] text-warmOffWhite/80">
                              <span className="text-[10px] text-editorialMuted uppercase block">
                                Extracted Tokens:
                              </span>
                              <div className="italic">
                                {data.sampleItems.map((s, i) => (
                                  <div key={i} className="truncate">• &quot;{s}&quot;</div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="count"
                  background={{ fill: '#F7F5F0' }}
                  label={{
                    position: 'right',
                    formatter: (val: any) => `${val}`,
                    fontSize: 10,
                    fontFamily: 'JetBrains Mono',
                    fontWeight: 600,
                    fill: '#171717',
                  }}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.className}`}
                      fill={index === 0 ? '#E85D26' : '#171717'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div
            style={{ height: `${chartHeight}px` }}
            className="w-full bg-warmOffWhite animate-pulse border border-lightGrey"
          />
        )}
      </div>

      {/* Grounded Insight & Transparency Card */}
      <div className="p-3.5 bg-warmOffWhite border border-lightGrey space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-[10px] font-bold text-burntOrange uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> Entity Frequency Breakdown
          </span>
          <span className="font-mono text-[10px] text-editorialMuted">
            {totalEntities} Total / {activeClassesCount} Active {activeClassesCount === 1 ? 'Class' : 'Classes'}
          </span>
        </div>

        {/* Explain class distribution transparently */}
        {isSingleClass ? (
          <div className="space-y-1">
            <p className="text-xs text-almostBlack leading-relaxed">
              <strong>Single-Class Extraction:</strong> All <strong>{totalEntities}</strong> extracted entities belong to the <strong>{dominantClass.className}</strong> category.
            </p>
            <div className="text-[11px] text-editorialMuted flex items-start gap-1.5 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-burntOrange shrink-0 mt-0.5" />
              <span>
                No organizations, locations, dates, or events were extracted from this passage. The text focuses purely on actor mentions ({dominantClass.sampleItems.slice(0, 3).join(', ')}).
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-almostBlack leading-relaxed">
            Multi-class distribution: <strong>{dominantClass.className}</strong> represents the most frequent entity type ({dominantClass.count} entities, {dominantClass.pctOfTotal}% of total), followed by {chartData.slice(1).map((c) => `${c.className} (${c.count})`).join(', ')}.
          </p>
        )}

        {/* Breakdown Tags Row */}
        <div className="pt-2 border-t border-lightGrey/60 flex flex-wrap gap-1.5">
          {chartData.map((c) => (
            <span
              key={c.className}
              className="font-mono text-[10px] px-2 py-0.5 bg-pureWhite border border-lightGrey text-almostBlack flex items-center gap-1"
            >
              <strong className="text-burntOrange">{c.className}:</strong> {c.count} items ({c.pctOfTotal}%)
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
