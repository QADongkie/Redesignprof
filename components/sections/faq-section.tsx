import { faqs } from "@/data/faqs";

export function FaqSection() {
  return (
    <section className="section faq-section" id="faq">
      <div className="section-heading section-heading--compact" data-reveal>
        <p data-reveal-item>Frequently asked</p>
        <h2 data-reveal-item>Before you begin.</h2>
      </div>
      <div className="faq-list" data-reveal>
        {faqs.map((item, index) => (
          <details key={item.question} data-reveal-item open={index === 0}>
            <summary>
              <span>0{index + 1}</span>
              {item.question}
              <i>+</i>
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
