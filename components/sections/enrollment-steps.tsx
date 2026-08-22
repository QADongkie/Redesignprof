import { ArrowIcon } from "@/components/common/icons";

export function EnrollmentStepsSection() {
  return (
    <section className="section enrollment-section">
      <div className="section-heading section-heading--compact" data-reveal>
        <p data-reveal-item>Enrollment</p>
        <h2 data-reveal-item>From interest to instruction.</h2>
      </div>
      <ol className="enrollment-steps" data-reveal>
        <li data-reveal-item>
          <span>01</span>
          <div>
            <h3>Choose a course</h3>
            <p>Start with TDC, PDC, or refresher training.</p>
          </div>
        </li>
        <li data-reveal-item>
          <span>02</span>
          <div>
            <h3>Select a branch</h3>
            <p>Confirm a convenient location, schedule, and vehicle.</p>
          </div>
        </li>
        <li data-reveal-item>
          <span>03</span>
          <div>
            <h3>Complete enrollment</h3>
            <p>Review the official requirements and secure your slot.</p>
          </div>
        </li>
        <li data-reveal-item>
          <span>04</span>
          <div>
            <h3>Begin your training</h3>
            <p>Learn with discipline and practice with purpose.</p>
          </div>
        </li>
      </ol>
      <a className="button button--gold enrollment-cta" href="https://tlmabuhay.com/enroll">
        Open official enrollment <ArrowIcon />
      </a>
    </section>
  );
}
