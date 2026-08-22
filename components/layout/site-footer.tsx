import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <a className="brand brand--footer" href="#top" aria-label="Back to top">
        <Image src="/assets/tl-mabuhay-logo-exact.svg" alt="" width={58} height={58} />
        <span>
          <strong>TL MABUHAY</strong>
          <small>YOUR DEFENSIVE DRIVING ADVOCATE</small>
        </span>
      </a>
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
