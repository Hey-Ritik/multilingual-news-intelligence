import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import GlobalPerspectiveSection from '../components/landing/GlobalPerspectiveSection';
import CapabilitiesSection from '../components/landing/CapabilitiesSection';
import AnalyticalDimensionsSection from '../components/landing/AnalyticalDimensionsSection';
import MultilingualIntelligenceSection from '../components/landing/MultilingualIntelligenceSection';
import PlatformPreviewSection from '../components/landing/PlatformPreviewSection';

export default function LandingPage() {
  return (
    <div className="w-full flex flex-col">
      {/* Section 01 — Hero */}
      <HeroSection />

      {/* Section 02 — Global Perspective */}
      <GlobalPerspectiveSection />

      {/* Section 03 — Capabilities */}
      <CapabilitiesSection />

      {/* Section 04 — Analytical Dimensions */}
      <AnalyticalDimensionsSection />

      {/* Section 05 — Multilingual Intelligence */}
      <MultilingualIntelligenceSection />

      {/* Section 06 — Platform Preview */}
      <PlatformPreviewSection />
    </div>
  );
}
