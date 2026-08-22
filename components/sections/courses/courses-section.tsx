import { ArrowIcon, CheckIcon } from "@/components/common/icons";
import { courses } from "@/data/courses";
import { CourseCardDiorama } from "@/components/sections/courses/course-card-diorama";

export function CoursesSection() {
  return (
    <section className="section section--light" id="courses">
      <div className="section-heading" data-reveal>
        <p data-reveal-item>Courses</p>
        <h2 data-reveal-item>Learn the road.<br />Own the drive.</h2>
        <span data-reveal-item>Focused training for first-time applicants and returning drivers.</span>
      </div>

      <div className="course-grid" data-reveal>
        {courses.map((course, index) => (
          <article className="course-card" key={course.id} data-reveal-item>
            <div className="course-card-header">
              <span>0{index + 1}</span>
              <small>{course.duration}</small>
            </div>

            {/* 3D Micro-Diorama on each course card */}
            <CourseCardDiorama courseId={course.id} />

            <p className="course-card-eyebrow">{course.eyebrow}</p>
            <h3>{course.title}</h3>
            <p className="course-card-desc">{course.description}</p>
            <ul>
              {course.outcomes.map((outcome) => (
                <li key={outcome}>
                  <CheckIcon />
                  {outcome}
                </li>
              ))}
            </ul>
            <a href="https://tlmabuhay.com/enroll">
              Enroll now <ArrowIcon />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
