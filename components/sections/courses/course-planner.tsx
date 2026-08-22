"use client";

import { useState } from "react";
import { ArrowIcon, CheckIcon } from "@/components/common/icons";
import { courses, CourseId, Transmission } from "@/data/courses";

export function CoursePlannerSection() {
  const [courseId, setCourseId] = useState<CourseId>("tdc");
  const [transmission, setTransmission] = useState<Transmission>("Manual");
  const selected = courses.find((course) => course.id === courseId) ?? courses[0];

  return (
    <section className="section planner-section">
      <div className="section-heading section-heading--compact" data-reveal>
        <p data-reveal-item>Course planner</p>
        <h2 data-reveal-item>A clear next step.</h2>
        <span data-reveal-item>
          Choose a training path now, then confirm live availability and fees with the official enrollment system.
        </span>
      </div>

      <div className="planner" data-reveal>
        <div className="planner-options" data-reveal-item>
          <span className="field-label">1. Choose your course</span>
          <div className="segmented" role="group" aria-label="Choose a course">
            {courses.map((course) => (
              <button
                key={course.id}
                type="button"
                className={course.id === courseId ? "is-active" : ""}
                aria-pressed={course.id === courseId}
                onClick={() => setCourseId(course.id)}
              >
                {course.id.toUpperCase()}
              </button>
            ))}
          </div>

          <span className="field-label">2. Choose your preference</span>
          <div className="segmented" role="group" aria-label="Choose transmission">
            {(["Manual", "Automatic"] as Transmission[]).map((item) => (
              <button
                key={item}
                type="button"
                className={item === transmission ? "is-active" : ""}
                aria-pressed={item === transmission}
                onClick={() => setTransmission(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="planner-summary" data-reveal-item aria-live="polite">
          <span>Your plan</span>
          <h3>{selected.title}</h3>
          <p>{transmission} vehicle preference</p>
          <ul>
            {selected.outcomes.map((outcome) => (
              <li key={outcome}>
                <CheckIcon /> {outcome}
              </li>
            ))}
          </ul>
          <a className="button button--gold" href="https://tlmabuhay.com/enroll">
            Continue to official enrollment <ArrowIcon />
          </a>
          <small>Availability, schedules, and fees are confirmed by your selected branch.</small>
        </div>
      </div>
    </section>
  );
}
