"use client";

import { useState } from "react";

const highwayTrackPath =
  "M-60 170 C 160 170, 240 75, 470 75 C 700 75, 760 175, 960 175 C 1070 175, 1150 95, 1260 80";

export function TimelineSection() {
  const [activeMilestone, setActiveMilestone] = useState<number | null>(null);

  return (
    <section className="section timeline-section timeline-section--night" id="journey">
      {/* Ambient Radial Night Glow */}
      <div className="timeline-ambient-glow" />

      <div className="section-heading section-heading--compact timeline-heading">
        <p>Our journey</p>
        <h2>Purpose, carried forward.</h2>
        <span>A growing academy with one consistent standard: safer drivers and safer roads.</span>
      </div>

      <div className="timeline-expressway">
        {/* Continuous Edge-to-Edge Animated Highway SVG */}
        <svg
          viewBox="0 0 1200 240"
          preserveAspectRatio="none"
          className="expressway-svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="expressway-gold-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f3b61f" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#f3b61f" stopOpacity="1" />
              <stop offset="100%" stopColor="#ffd868" stopOpacity="0.8" />
            </linearGradient>
            <filter id="gold-neon-glow" x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Wide Ambient Neon Halo Track */}
          <path
            className="expressway-track-ambient"
            d={highwayTrackPath}
            filter="url(#gold-neon-glow)"
          />

          {/* Solid Gold Highway Surface */}
          <path
            className="expressway-track-main"
            d={highwayTrackPath}
          />

          {/* Flowing White Dashed Center Lane */}
          <path
            className="expressway-track-dashes"
            d={highwayTrackPath}
          />
        </svg>

        {/* Milestone Card 1: 2017 */}
        <article
          className={`timeline-card timeline-card--one ${activeMilestone === 0 ? "is-hovered" : ""}`}
          onMouseEnter={() => setActiveMilestone(0)}
          onMouseLeave={() => setActiveMilestone(null)}
          onClick={() => setActiveMilestone(activeMilestone === 0 ? null : 0)}
        >
          <div className="milestone-badge-wrap">
            <span className="milestone-year-badge">2017</span>
            <span className="milestone-tag">LTO ACCREDITATION</span>
          </div>
          <h3>A clear purpose begins.</h3>
          <p>TL Mabuhay starts with a commitment to disciplined, responsible driver education.</p>
        </article>

        {/* Milestone Card 2: Today (147 Branches) */}
        <article
          className={`timeline-card timeline-card--two ${activeMilestone === 1 ? "is-hovered" : ""}`}
          onMouseEnter={() => setActiveMilestone(1)}
          onMouseLeave={() => setActiveMilestone(null)}
          onClick={() => setActiveMilestone(activeMilestone === 1 ? null : 1)}
        >
          <div className="milestone-badge-wrap">
            <span className="milestone-year-badge milestone-year-badge--today">TODAY</span>
            <span className="milestone-tag">NATIONWIDE NETWORK</span>
          </div>
          <h3>147 branches. 8 regions.</h3>
          <p>Accessible training continues to grow across communities in the Philippines.</p>
        </article>

        {/* Milestone Card 3: 160k+ Drivers */}
        <article
          className={`timeline-card timeline-card--three ${activeMilestone === 2 ? "is-hovered" : ""}`}
          onMouseEnter={() => setActiveMilestone(2)}
          onMouseLeave={() => setActiveMilestone(null)}
          onClick={() => setActiveMilestone(activeMilestone === 2 ? null : 2)}
        >
          <div className="milestone-badge-wrap">
            <span className="milestone-year-badge milestone-year-badge--stat">160,000+</span>
            <span className="milestone-tag">CERTIFIED DRIVERS</span>
          </div>
          <h3>Drivers trained.</h3>
          <p>Each lesson moves one more driver toward safer, more confident road behavior.</p>
        </article>
      </div>
    </section>
  );
}
