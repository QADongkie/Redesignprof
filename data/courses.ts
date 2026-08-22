export type CourseId = "tdc" | "pdc" | "refresher";
export type Transmission = "Manual" | "Automatic";

export interface Course {
  id: CourseId;
  eyebrow: string;
  title: string;
  duration: string;
  description: string;
  outcomes: string[];
}

export const courses: Course[] = [
  {
    id: "tdc",
    eyebrow: "Start with the road",
    title: "Theoretical Driving Course",
    duration: "15 hours",
    description:
      "Build the judgment behind every safe decision—from signs and road rules to responsible driving behavior.",
    outcomes: ["Road rules", "Hazard awareness", "Driver responsibility"],
  },
  {
    id: "pdc",
    eyebrow: "Put knowledge in motion",
    title: "Practical Driving Course",
    duration: "Hands-on training",
    description:
      "Develop vehicle control and road confidence with guided practice from an accredited driving school.",
    outcomes: ["Vehicle control", "Road positioning", "Defensive habits"],
  },
  {
    id: "refresher",
    eyebrow: "Return with confidence",
    title: "Refresher Training",
    duration: "Schedule by branch",
    description:
      "A focused return to safe driving for licensed drivers who want calmer, more confident road habits.",
    outcomes: ["Skill refresh", "Confidence building", "Safer decisions"],
  },
];
