// Each entry = one real test/interview round in Turing or Andela's hiring funnel.
// `id` matches the `testStages` values in syllabus.ts so topics auto-group here.

export type Platform = "turing" | "andela";
export type StageType = "automated" | "human";

export type TestStage = {
  id: string;
  platform: Platform;
  order: number;           // 1-based position in the hiring funnel
  totalStages: number;     // total rounds on this platform
  tag: string;             // "T1", "A2" etc.
  title: string;
  type: StageType;         // automated = no human; human = real interviewer
  duration: string;
  format: string;
  passMark: string;        // what it takes to advance
  whatToExpect: string[];  // 3-4 bullet points — exactly what happens in the room
  keyTip: string;
  color: string;
};

// ─── TURING ──────────────────────────────────────────────────────────────────

const TURING_TOTAL = 5;

export const TURING_STAGES: TestStage[] = [
  {
    id: "turing-t1-mcq",
    platform: "turing",
    order: 1,
    totalStages: TURING_TOTAL,
    tag: "T1",
    title: "Automated MCQ Tech Screen",
    type: "automated",
    duration: "~90 minutes",
    format: "60–80 multiple-choice questions",
    passMark: "~70% correct · Scores below threshold auto-reject",
    whatToExpect: [
      "Fully automated — no human involved at any point.",
      "Questions cover your declared stack: JS/TS, React, Node.js, SQL, APIs, Security, Python basics.",
      "~60–75 seconds per question. No going back once submitted.",
      "Immediate pass/fail notification. 3-month retake lock if you fail.",
    ],
    keyTip: "Speed is part of the test. Drill until you can answer in under 45 seconds — slow correct answers still hurt your score.",
    color: "#2563eb",
  },
  {
    id: "turing-t2-oa",
    platform: "turing",
    order: 2,
    totalStages: TURING_TOTAL,
    tag: "T2",
    title: "Coding Challenge (Online Assessment)",
    type: "automated",
    duration: "~90 minutes",
    format: "2–3 DSA problems on HackerRank or Turing's platform",
    passMark: "~60–70% test cases passing across all problems",
    whatToExpect: [
      "Automated — no interviewer. Typically 1 easy + 1–2 medium/hard problems.",
      "Scored on: test cases passed, time complexity, and sometimes code style.",
      "You can use any language — most candidates use Python or JavaScript.",
      "Partial credit: passing some test cases on a hard problem is better than skipping it.",
    ],
    keyTip: "If stuck, brute-force first to pass easy test cases, then optimise. A slow O(n²) that passes is better than an unsubmitted optimal solution.",
    color: "#ea580c",
  },
  {
    id: "turing-t3-live",
    platform: "turing",
    order: 3,
    totalStages: TURING_TOTAL,
    tag: "T3",
    title: "Live Coding Interview",
    type: "human",
    duration: "60–90 minutes",
    format: "Real-time coding in a shared editor with a Turing engineer",
    passMark: "Interviewer rating: code quality + communication + reasoning",
    whatToExpect: [
      "A Turing senior engineer watches you code live. You share a screen or editor (CoderPad).",
      "May include: implement a function, debug a broken snippet, explain a design choice, light system design.",
      "Communication is scored equally to code — you must narrate your thinking aloud.",
      "Interviewer may give hints or steer you — accepting help gracefully is a positive signal.",
    ],
    keyTip: "Never go silent. Say 'I'm thinking about edge cases' or 'Let me start with the brute force.' A clear thinker who codes slower outscores a silent coder who codes fast.",
    color: "#16a34a",
  },
  {
    id: "turing-t4-fde",
    platform: "turing",
    order: 4,
    totalStages: TURING_TOTAL,
    tag: "T4",
    title: "FDE Technical Deep Dive",
    type: "human",
    duration: "2–3 hours",
    format: "System design + AI/LLM + client scenario role-play",
    passMark: "Senior Turing engineer panel rating across multiple dimensions",
    whatToExpect: [
      "The hardest and most important round. Tests everything: system design, cloud/infra, AI/LLM application knowledge.",
      "Client decomposition: given a vague business problem, you must break it down and propose a technical solution in real time.",
      "Interviewers will challenge your answers — 'Why not X instead?' is expected.",
      "You may be asked to design a specific system (rate limiter, RAG pipeline, webhook engine) end-to-end.",
    ],
    keyTip: "Never jump to a solution. Always: Clarify scope → Sketch a diagram → Define data model → Address scale → State trade-offs. This framework is what separates FDE candidates.",
    color: "#dc2626",
  },
  {
    id: "turing-t1-hm",
    platform: "turing",
    order: 5,
    totalStages: TURING_TOTAL,
    tag: "T5",
    title: "Behavioral / Hiring Manager Screen",
    type: "human",
    duration: "30–45 minutes",
    format: "Video or async — project ownership + communication",
    passMark: "Communication quality, remote-work mindset, project ownership",
    whatToExpect: [
      "Covers your résumé in depth — every bullet point is fair game.",
      "Expects STAR-format answers: Situation → Task → Action → Result.",
      "Remote-work signals matter: autonomy, async communication, 'I not we' ownership.",
      "May be async (pre-recorded video responses) or a live call with a Turing recruiter.",
    ],
    keyTip: "Prepare 6 STAR stories: ownership, failure, disagreement, no-authority situation, tight deadline, and customer impact. Use 'I' not 'we' — they're hiring you, not your team.",
    color: "#7c3aed",
  },
];

// ─── ANDELA ──────────────────────────────────────────────────────────────────

const ANDELA_TOTAL = 5;

export const ANDELA_STAGES: TestStage[] = [
  {
    id: "andela-a1-hackerrank",
    platform: "andela",
    order: 1,
    totalStages: ANDELA_TOTAL,
    tag: "A1",
    title: "HackerRank Algorithm Challenge",
    type: "automated",
    duration: "~90 minutes",
    format: "3 algorithm problems — HackerRank platform",
    passMark: "~60–70% test cases across all problems",
    whatToExpect: [
      "Automated — no human involved. Proctored via webcam.",
      "3 problems: typically 1 easy + 1 medium + 1 hard. All must be attempted.",
      "Scored purely on test cases passed. Any language allowed.",
      "30-day retake lock if failed.",
    ],
    keyTip: "Read all 3 problems first. Solve easy fully, medium partially, hard at least brute-force. Empty submissions hurt your total score.",
    color: "#d97706",
  },
  {
    id: "andela-a2-qualified",
    platform: "andela",
    order: 2,
    totalStages: ANDELA_TOTAL,
    tag: "A2",
    title: "Qualified Technical Assessment",
    type: "automated",
    duration: "~90 minutes",
    format: "JS/TS coding tasks + MCQ — Andela's Qualified platform",
    passMark: "Passing score varies by role; includes code quality evaluation",
    whatToExpect: [
      "Proctored — webcam required. No human interviewer.",
      "Mix of: implement a function to pass a given test suite, fix a bug, and MCQs on JS/TS fundamentals.",
      "The given test suite IS the specification — read it before writing a single line.",
      "Code quality (naming, structure) is evaluated alongside test results.",
    ],
    keyTip: "Read the failing tests first, not the problem description. Tests tell you exactly what the function must do. Write the minimum code to pass each test.",
    color: "#0d9488",
  },
  {
    id: "andela-a3-screen",
    platform: "andela",
    order: 3,
    totalStages: ANDELA_TOTAL,
    tag: "A3",
    title: "Technical Screening Interview",
    type: "human",
    duration: "30–45 minutes",
    format: "Video call — Andela technical recruiter or engineer",
    passMark: "Technical fluency + communication + project depth",
    whatToExpect: [
      "A real person — usually a technical recruiter or junior engineer.",
      "Covers: résumé deep-dive, specific past projects, Node.js/backend concepts, SQL basics.",
      "Expect: 'Walk me through what you built at X' and 'What was the hardest technical problem you solved?'",
      "Communication and English fluency are explicitly evaluated here.",
    ],
    keyTip: "Know your own résumé cold. Every project you list must have: the problem, your specific role, the outcome, and numbers. 'We built a REST API' is not enough.",
    color: "#4f46e5",
  },
  {
    id: "andela-a4-pair",
    platform: "andela",
    order: 4,
    totalStages: ANDELA_TOTAL,
    tag: "A4",
    title: "Pair Programming Session",
    type: "human",
    duration: "60 minutes",
    format: "Collaborative coding with an Andela senior engineer",
    passMark: "Collaboration quality, code quality, communication, receptivity to feedback",
    whatToExpect: [
      "This is Andela's most important round — more weight than any automated test.",
      "You and the interviewer solve a problem TOGETHER. It's collaborative, not competitive.",
      "Interviewer will offer hints, push back, and suggest alternatives — this is deliberate.",
      "Evaluated on: how you communicate, receive feedback, debug out loud, and write clean code.",
    ],
    keyTip: "Treat the interviewer as a colleague, not an examiner. Say 'Does this approach make sense to you?' and 'I see another way — what do you think?' Receptivity to feedback is a core signal.",
    color: "#16a34a",
  },
  {
    id: "andela-a5-epic",
    platform: "andela",
    order: 5,
    totalStages: ANDELA_TOTAL,
    tag: "A5",
    title: "EPIC Values Interview",
    type: "human",
    duration: "45 minutes",
    format: "Structured behavioral interview — Andela values panel",
    passMark: "Demonstrated alignment with Excellence, Passion, Integrity, Collaboration",
    whatToExpect: [
      "Tests Andela's EPIC values: Excellence, Passion, Integrity, Collaboration.",
      "Pure behavioral — STAR stories. No coding.",
      "Questions like: 'Tell me about a time you disagreed with a teammate' and 'How do you handle a missed deadline?'",
      "Remote-work mindset, async communication, and cross-cultural collaboration are evaluated.",
    ],
    keyTip: "Map each STAR story to an EPIC value before the interview. Every answer should end with the impact on the team or customer — not just what you did.",
    color: "#db2777",
  },
];

// ─── Combined ─────────────────────────────────────────────────────────────────

export const TEST_STAGES = [...TURING_STAGES, ...ANDELA_STAGES];

export function getStagesForPlatform(platform: Platform): TestStage[] {
  return TEST_STAGES.filter((s) => s.platform === platform).sort(
    (a, b) => a.order - b.order
  );
}
