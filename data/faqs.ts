export interface FaqItem {
  question: string;
  answer: string;
}

export const faqs: FaqItem[] = [
  {
    question: "Which course should a first-time applicant take?",
    answer:
      "Most first-time applicants begin with the 15-hour Theoretical Driving Course, then continue to practical training. Confirm the correct sequence with your chosen branch and the latest LTO requirements.",
  },
  {
    question: "Are course fees the same at every branch?",
    answer:
      "Fees and schedules can vary by branch, date, vehicle, transmission, and availability. Use this page to choose a course, then confirm the live offer during official enrollment.",
  },
  {
    question: "Can I choose manual or automatic training?",
    answer:
      "Yes, subject to vehicle availability at your selected branch. Choose your preference in the course planner and confirm it with the branch before your session.",
  },
  {
    question: "Where can I see all TL Mabuhay locations?",
    answer:
      "The locator below highlights selected verified branches. Use the official branch directory for the complete, most current list and contact details.",
  },
];
