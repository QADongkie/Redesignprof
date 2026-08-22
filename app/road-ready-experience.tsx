"use client";

import { useCallback, useState } from "react";
import { useBusinessMotion } from "@/hooks/use-business-motion";
import { LogoIntro } from "@/components/common/logo-intro";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSection } from "@/components/sections/hero/hero-section";
import { TrustStrip } from "@/components/sections/trust-strip";
import { CoursesSection } from "@/components/sections/courses/courses-section";
import { CoursePlannerSection } from "@/components/sections/courses/course-planner";
import { CampaignSection } from "@/components/sections/campaign-section";
import { TimelineSection } from "@/components/sections/timeline-section";
import { BranchLocatorSection } from "@/components/sections/locator/branch-locator-section";
import { EnrollmentStepsSection } from "@/components/sections/enrollment-steps";
import { FaqSection } from "@/components/sections/faq-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";

export default function RoadReadyExperience() {
  const [sceneReady, setSceneReady] = useState(false);
  const handleSceneReady = useCallback((ready: boolean) => setSceneReady(ready), []);

  useBusinessMotion();

  return (
    <div className="page-shell">
      <LogoIntro sceneReady={sceneReady} />
      <noscript>
        <style>{".brand-intro{display:none!important}html{overflow:auto!important}"}</style>
      </noscript>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <SiteHeader />

      <main id="main-content">
        <HeroSection onSceneReady={handleSceneReady} />
        <TrustStrip />
        <CoursesSection />
        <CoursePlannerSection />
        <CampaignSection />
        <TimelineSection />
        <BranchLocatorSection />
        <EnrollmentStepsSection />
        <FaqSection />
        <FinalCtaSection />
      </main>

      <SiteFooter />
    </div>
  );
}
