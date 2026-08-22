export function TimelineSection() {
  return (
    <section className="section timeline-section">
      <div className="section-heading section-heading--compact" data-reveal>
        <p data-reveal-item>Our journey</p>
        <h2 data-reveal-item>Purpose, carried forward.</h2>
        <span data-reveal-item>A growing academy with one consistent standard: safer drivers and safer roads.</span>
      </div>

      <div className="timeline" data-reveal>
        <svg viewBox="0 0 1200 230" preserveAspectRatio="none" aria-hidden="true">
          <path className="timeline-track" d="M35 145C240 145 262 75 455 75s230 105 410 78c111-17 149-80 300-80" />
          <path data-draw className="timeline-route" d="M35 145C240 145 262 75 455 75s230 105 410 78c111-17 149-80 300-80" />
        </svg>
        <article className="timeline-item timeline-item--one" data-reveal-item>
          <span>2017</span>
          <h3>A clear purpose begins.</h3>
          <p>TL Mabuhay starts with a commitment to disciplined, responsible driver education.</p>
        </article>
        <article className="timeline-item timeline-item--two" data-reveal-item>
          <span>Today</span>
          <h3>147 branches. 8 regions.</h3>
          <p>Accessible training continues to grow across communities in the Philippines.</p>
        </article>
        <article className="timeline-item timeline-item--three" data-reveal-item>
          <span>160,000+</span>
          <h3>Drivers trained.</h3>
          <p>Each lesson moves one more driver toward safer, more confident road behavior.</p>
        </article>
      </div>
    </section>
  );
}
