import Image from "next/image";

export function TrustStrip() {
  return (
    <section className="trust-strip" aria-label="TL Mabuhay credentials">
      <div className="trust-strip-item--lto">
        <Image
          src="/Land_Transportation_Office.svg"
          alt="Land Transportation Office Philippines"
          width={44}
          height={44}
          className="trust-strip-lto-badge"
        />
        <div className="trust-strip-item__content">
          <span>Accredited</span>
          <strong>LTO Driving School</strong>
        </div>
      </div>
      <div className="trust-strip-item">
        <span>Established</span>
        <strong>Since 2017</strong>
      </div>
      <div className="trust-strip-item">
        <span>Reach</span>
        <strong>147 branches • 8 regions</strong>
      </div>
      <div className="trust-strip-item">
        <span>Impact</span>
        <strong>160,000+ drivers trained</strong>
      </div>
    </section>
  );
}
