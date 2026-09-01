// Defines each real interview round for Turing and Andela.
// The `id` matches the `testStages` array values in syllabus.ts entries.
// Syllabus entries are filtered by these ids to show which topics belong to each round.

export type Platform = "turing" | "andela";

export type TestStage = {
  id: string;
  platform: Platform;
  order: number;
  tag: string;           // e.g. "T1", "T2", "A1"
  title: string;         // e.g. "MCQ Tech Screen"
  duration: string;
  format: string;
  description: string;
  passTip: string;       // single most important tip for this round
  color: string;         // tailwind ring color token (used for accent)
};

export const TEST_STAGES: TestStage[] = [
  // ─── TURING ───────────────────────────────────────────────────────────────
  {
    id: "turing-t1-mcq",
    platform: "turing",
    order: 1,
    tag: "T1",
    title: "MCQ Tech Stack Screen",
    duration: "~90 min",
    format: "60–80 automated multiple-choice questions",
    description:
      "Fully automated. Tests JS/TS, React, Node, SQL, Security, APIs, and Python fundamentals. Strict time limit — ~60–75 seconds per question. No partial credit.",
    passTip: "Speed matters. Drill flashcard mode for each topic until you can answer in under 45 seconds.",
    color: "blue",
  },
  {
    id: "turing-t1-hm",
    platform: "turing",
    order: 2,
    tag: "T1·HM",
    title: "Behavioral / Project Screen",
    duration: "~30 min",
    format: "Video or async — behavioral and project-history questions",
    description:
      "Happens alongside or after the MCQ screen. Tests communication quality, project ownership, and cultural fit. STAR-format answers expected. Resume deep-dive.",
    passTip: "Prepare 6 STAR stories covering: ownership, failure, disagreement, deadline, 'I not we', and customer impact.",
    color: "purple",
  },
  {
    id: "turing-t2-oa",
    platform: "turing",
    order: 3,
    tag: "T2",
    title: "Coding Challenge (OA)",
    duration: "~90 min",
    format: "2–3 DSA problems on HackerRank / custom platform",
    description:
      "Algorithm and data structure problems — typically 1 easy + 1–2 medium/hard. Scored on correctness and efficiency. Partial scores possible on some platforms.",
    passTip: "Aim for at least 70% test-case pass rate on all problems — a clean O(n log n) solution beats a brute force O(n²).",
    color: "orange",
  },
  {
    id: "turing-t3-live",
    platform: "turing",
    order: 4,
    tag: "T3",
    title: "Live Coding Interview",
    duration: "60–90 min",
    format: "Human interviewer + shared code editor",
    description:
      "Real-time problem solving. Interviewer watches you think aloud. May cover DSA, JS/TS, debugging a broken snippet, or a small feature implementation. Communication is scored as much as code.",
    passTip: "Think aloud constantly. Say what you're considering before you type it. A clean explanation of a slow solution scores better than silent perfect code.",
    color: "green",
  },
  {
    id: "turing-t4-fde",
    platform: "turing",
    order: 5,
    tag: "T4",
    title: "FDE Deep Dive",
    duration: "2–3 hours",
    format: "System design + AI/LLM + client scenario role-play",
    description:
      "Forward Deployed Engineer interview. Covers production system design, cloud infrastructure, LLM application architecture, RAG, agents, and client-facing problem decomposition. Turing's highest bar.",
    passTip: "Decompose every scenario with: Clarify scope → Diagram → Data model → Scale → Trade-offs. Never jump to a solution.",
    color: "red",
  },

  // ─── ANDELA ───────────────────────────────────────────────────────────────
  {
    id: "andela-a1-hackerrank",
    platform: "andela",
    order: 1,
    tag: "A1",
    title: "HackerRank Challenge",
    duration: "~90 min",
    format: "Algorithm coding challenge (automated)",
    description:
      "First filter. Typically 3 DSA problems: 1 easy + 1 medium + 1 hard. Scored by test cases passed. Strong Python and JS fluency is expected.",
    passTip: "Read constraints first. An O(n²) solution will TLE on n=10⁵. Plan the approach before coding.",
    color: "yellow",
  },
  {
    id: "andela-a2-qualified",
    platform: "andela",
    order: 2,
    tag: "A2",
    title: "Qualified Assessment",
    duration: "~90 min",
    format: "JS/TS coding tasks + MCQ — proctored",
    description:
      "Andela's own platform. Tests practical coding skills: implementing functions, fixing bugs, writing tests. May include MCQs on fundamentals. Proctored.",
    passTip: "Read the given test suite before writing code — the failing tests are the specification.",
    color: "teal",
  },
  {
    id: "andela-a3-screen",
    platform: "andela",
    order: 3,
    tag: "A3",
    title: "Screening Interview",
    duration: "30–45 min",
    format: "Video call — technical + project discussion",
    description:
      "A technical recruiter or engineer verifies your background. Covers project deep-dive, backend/Node experience, SQL, and communication. Questions about specific past projects.",
    passTip: "Prepare 2–3 project stories. Know your own résumé in detail — be able to explain every line.",
    color: "indigo",
  },
  {
    id: "andela-a4-pair",
    platform: "andela",
    order: 4,
    tag: "A4",
    title: "Pair Programming",
    duration: "60 min",
    format: "Collaborative live coding with an Andela engineer",
    description:
      "Andela's most important round. You and the interviewer solve a real problem together. They evaluate: communication, ability to receive feedback, debugging process, and code quality.",
    passTip: "Treat the interviewer as a colleague. Ask clarifying questions. Propose ideas, invite feedback: 'Does this approach make sense to you?'",
    color: "green",
  },
  {
    id: "andela-a5-epic",
    platform: "andela",
    order: 5,
    tag: "A5",
    title: "EPIC Values Interview",
    duration: "45 min",
    format: "Structured behavioral interview",
    description:
      "Tests alignment with Andela's EPIC values: Excellence, Passion, Integrity, Collaboration. STAR-format behavioral questions. Communication and remote-work mindset are key.",
    passTip: "Map each of your STAR stories to an EPIC value. Every answer should tie back to remote team impact.",
    color: "pink",
  },
];

export function getStagesForPlatform(platform: Platform): TestStage[] {
  return TEST_STAGES.filter((s) => s.platform === platform).sort(
    (a, b) => a.order - b.order
  );
}
