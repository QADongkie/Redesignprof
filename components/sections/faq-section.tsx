"use client";

import { useState } from "react";
import { faqs } from "@/data/faqs";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="section faq-section" id="faq">
      {/* Left Column: Heading & Subtitle */}
      <div className="faq-intro" data-reveal>
        <div className="section-heading section-heading--compact">
          <p data-reveal-item>Frequently asked</p>
          <h2 data-reveal-item>Before you begin.</h2>
          <span data-reveal-item className="faq-subtitle">
            Essential information regarding curriculum, branches, rates, and vehicle selections before starting your driving journey.
          </span>
        </div>
      </div>

      {/* Right Column: Glassmorphic Accordion with Background Particle Visibility */}
      <div className="faq-list" data-reveal>
        {faqs.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={item.question}
              data-reveal-item
              className={`faq-card ${isOpen ? "is-open" : ""}`}
            >
              <button
                type="button"
                className="faq-summary-btn"
                onClick={() => handleToggle(index)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
                id={`faq-header-${index}`}
              >
                <span className="faq-index-pill">
                  0{index + 1}
                </span>
                <span className="faq-question-text">{item.question}</span>
                <span
                  className={`faq-toggle-btn ${isOpen ? "is-active" : ""}`}
                  aria-hidden="true"
                >
                  <i>+</i>
                </span>
              </button>

              <div
                id={`faq-answer-${index}`}
                role="region"
                aria-labelledby={`faq-header-${index}`}
                className={`faq-answer-collapse ${isOpen ? "is-expanded" : ""}`}
              >
                <div className="faq-content-pane">
                  <p className="faq-answer-text">{item.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
