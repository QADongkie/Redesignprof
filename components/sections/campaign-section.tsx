import Image from "next/image";
import { ArrowIcon } from "@/components/common/icons";

export function CampaignSection() {
  return (
    <section className="campaign-section" id="why-tl">
      <div className="campaign-image" data-reveal>
        <Image
          src="/advocate-hero.png"
          alt="TL Mabuhay Road to Ready campaign showing a vehicle traveling safely toward its destination"
          width={1536}
          height={1024}
          sizes="(max-width: 900px) 100vw, 58vw"
          data-reveal-item
        />
      </div>
      <div className="campaign-copy" data-reveal>
        <p data-reveal-item>Why TL Mabuhay</p>
        <h2 data-reveal-item>Advocacy behind every lesson.</h2>
        <p data-reveal-item>
          We prepare drivers to do more than operate a vehicle. We teach awareness, discipline, and respect for every person sharing the road.
        </p>
        <blockquote data-reveal-item>“Your Defensive Driving Advocate.”</blockquote>
        <a data-reveal-item href="https://tlmabuhay.com/about">
          Learn about TL Mabuhay <ArrowIcon />
        </a>
      </div>
    </section>
  );
}
