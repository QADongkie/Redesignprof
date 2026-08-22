import Image from "next/image";
import { ArrowIcon } from "@/components/common/icons";

export function FinalCtaSection() {
  return (
    <section className="final-cta">
      <div data-reveal>
        <Image
          data-reveal-item
          src="/assets/tl-mabuhay-logo-exact.svg"
          alt="TL Mabuhay emblem"
          width={122}
          height={122}
        />
        <p data-reveal-item>Your road to confident driving starts here.</p>
        <h2 data-reveal-item>Ready when you are.</h2>
        <div data-reveal-item>
          <a className="button button--gold" href="https://tlmabuhay.com/enroll">
            Enroll now <ArrowIcon />
          </a>
          <a className="button button--quiet" href="#branches">
            Find your branch
          </a>
        </div>
      </div>
    </section>
  );
}
