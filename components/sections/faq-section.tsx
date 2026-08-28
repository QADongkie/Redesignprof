"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { ArrowIcon } from "@/components/common/icons";
import { faqs } from "@/data/faqs";

const stepLabel = (index: number) => String(index + 1).padStart(2, "0");

export function FaqSection() {
  const totalSteps = faqs.length + 1;
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const activeStepRef = useRef(0);
  const [activeStep, setActiveStep] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const isContactStep = activeStep === faqs.length;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const desktop = window.matchMedia("(min-width: 901px)");
    let frame = 0;

    const update = () => {
      frame = 0;
      if (!desktop.matches) {
        section.style.setProperty("--faq-progress", "0");
        return;
      }

      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
      const nextStep = Math.min(totalSteps - 1, Math.floor(progress * totalSteps));

      section.style.setProperty("--faq-progress", progress.toFixed(4));
      if (nextStep !== activeStepRef.current) {
        activeStepRef.current = nextStep;
        setActiveStep(nextStep);
      }
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    desktop.addEventListener("change", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      desktop.removeEventListener("change", requestUpdate);
    };
  }, [totalSteps]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = content.querySelectorAll<HTMLElement>("[data-faq-motion]");
    animate(items, {
      opacity: [0, 1],
      y: [34, 0],
      duration: 720,
      delay: stagger(85),
      ease: "outExpo",
    });
  }, [activeStep]);

  const goToStep = useCallback(
    (index: number) => {
      const section = sectionRef.current;
      if (!section) return;

      const boundedIndex = Math.min(totalSteps - 1, Math.max(0, index));
      const sectionTop = window.scrollY + section.getBoundingClientRect().top;
      const scrollable = Math.max(1, section.offsetHeight - window.innerHeight);
      const targetProgress = boundedIndex === totalSteps - 1
        ? 1
        : (boundedIndex + 0.2) / totalSteps;

      window.scrollTo({
        top: sectionTop + scrollable * targetProgress,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    },
    [totalSteps]
  );

  const sectionStyle = {
    "--faq-steps": totalSteps,
    minHeight: `${100 + (totalSteps - 1) * 68}svh`,
  } as CSSProperties;

  return (
    <section
      ref={sectionRef}
      className={`faq-journey${isContactStep ? " is-contact-step" : ""}`}
      id="faq"
      aria-labelledby="faq-title"
      style={sectionStyle}
    >
      <h2 className="sr-only" id="faq-title">Frequently asked questions</h2>

      <div className="faq-journey__sticky">
        <div className="faq-journey__atmosphere" aria-hidden="true">
          <span className="faq-journey__watermark">FAQ</span>
          <svg viewBox="0 0 1440 900" preserveAspectRatio="none">
            <path
              className="faq-journey__route faq-journey__route--base"
              d="M-60 790 C170 660 112 460 370 432 C610 405 665 572 815 392 C950 229 1065 102 1510 168"
              pathLength="1"
            />
            <path
              className="faq-journey__route faq-journey__route--progress"
              d="M-60 790 C170 660 112 460 370 432 C610 405 665 572 815 392 C950 229 1065 102 1510 168"
              pathLength="1"
            />
          </svg>
        </div>

        <header className="faq-journey__topbar">
          <p>Questions before you take the wheel?</p>
          <span>{stepLabel(activeStep)} / {stepLabel(totalSteps - 1)}</span>
        </header>

        <div className="faq-journey__layout">
          <nav className="faq-journey__nav" aria-label="FAQ journey steps">
            {faqs.map((item, index) => (
              <button
                key={item.question}
                type="button"
                className={activeStep === index ? "is-active" : ""}
                aria-current={activeStep === index ? "step" : undefined}
                onClick={() => goToStep(index)}
              >
                <span>{stepLabel(index)}</span>
                <strong>{item.question}</strong>
              </button>
            ))}
            <button
              type="button"
              className={`faq-journey__contact-nav${isContactStep ? " is-active" : ""}`}
              aria-current={isContactStep ? "step" : undefined}
              onClick={() => goToStep(faqs.length)}
            >
              <span>{stepLabel(faqs.length)}</span>
              <strong>Talk to TL Mabuhay</strong>
            </button>
          </nav>

          <div
            ref={contentRef}
            className="faq-journey__content"
            aria-live="polite"
            aria-atomic="true"
          >
            {isContactStep ? (
              <div className="faq-journey__contact">
                <p data-faq-motion>Still have questions?</p>
                <h3 data-faq-motion>Talk to<br /><span>TL Mabuhay.</span></h3>
                <p data-faq-motion>
                  Speak with an academy team before you enroll. We will help you choose the right course, vehicle, and branch.
                </p>
                <div className="faq-journey__actions" data-faq-motion>
                  <a className="button button--gold" href="https://tlmabuhay.com/">
                    Talk to us <ArrowIcon />
                  </a>
                  <a className="button button--quiet" href="#branches">
                    Find your branch <ArrowIcon />
                  </a>
                </div>
              </div>
            ) : (
              <article className="faq-journey__answer">
                <p className="faq-journey__kicker" data-faq-motion>Before you begin</p>
                <span className="faq-journey__number" data-faq-motion>{stepLabel(activeStep)}</span>
                <h3 data-faq-motion>{faqs[activeStep].question}</h3>
                <p data-faq-motion>{faqs[activeStep].answer}</p>
                <button
                  type="button"
                  className="faq-journey__next"
                  onClick={() => goToStep(activeStep + 1)}
                  data-faq-motion
                >
                  {activeStep === faqs.length - 1 ? "Talk to our team" : "Next question"}
                  <ArrowIcon />
                </button>
              </article>
            )}
          </div>

        </div>
      </div>

      <div className="faq-journey__mobile">
        <div className="faq-mobile__heading">
          <p>Frequently asked</p>
          <h3>Questions before<br />you take the wheel?</h3>
          <span>Everything you need to begin your driving journey with confidence.</span>
        </div>

        <div className="faq-mobile__list">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <article className={isOpen ? "is-open" : ""} key={item.question}>
                <h4>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-mobile-answer-${index}`}
                    id={`faq-mobile-question-${index}`}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                  >
                    <span>{stepLabel(index)}</span>
                    <strong>{item.question}</strong>
                    <i aria-hidden="true">+</i>
                  </button>
                </h4>
                <div
                  className="faq-mobile__answer"
                  id={`faq-mobile-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-mobile-question-${index}`}
                >
                  <div><p>{item.answer}</p></div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="faq-mobile__cta">
          <p>Still have questions?</p>
          <h3>Talk to<br /><span>TL Mabuhay.</span></h3>
          <p>Speak with an academy team before you enroll.</p>
          <div className="faq-journey__actions">
            <a className="button button--gold" href="https://tlmabuhay.com/">
              Talk to us <ArrowIcon />
            </a>
            <a className="button button--quiet" href="#branches">
              Find your branch <ArrowIcon />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

