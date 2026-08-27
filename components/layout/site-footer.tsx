import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand-wrap">
        <a className="brand brand--footer" href="#top" aria-label="Back to top">
          <Image src="/assets/tl-mabuhay-logo-exact.svg" alt="" width={58} height={58} />
          <span>
            <strong>TL MABUHAY</strong>
            <small>YOUR DEFENSIVE DRIVING ADVOCATE</small>
          </span>
        </a>
        <div className="footer-lto-badge">
          <Image src="/Land_Transportation_Office.svg" alt="Land Transportation Office" width={40} height={40} />
          <span>
            <small>Official Accreditation</small>
            <strong>LTO Certified Driving School</strong>
          </span>
        </div>
      </div>
      <nav aria-label="Footer navigation">
        <a href="https://tlmabuhay.com/courses">Courses</a>
        <a href="https://tlmabuhay.com/#branches">Branches</a>
        <a href="https://tlmabuhay.com/enrollment-rules">Enrollment rules</a>
        <a href="https://tlmabuhay.com/enroll">Enroll</a>
      </nav>
      <p>© 2026 TL Mabuhay Driving Lesson Academy. Concept experience.</p>
    </footer>
  );
}
