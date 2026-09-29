export type RoleId = 'forward-deployed-engineer' | 'ai-engineer' | 'ai-forward-deployed-engineer'
export type CompanyId = 'turing' | 'andela' | 'toptal'

export type AssessmentStage = {
  id: string
  title: string
  type: string
  duration: string
  weight: number
  summary: string
  outcomes: string[]
}

export type AssessmentPath = {
  roleId: RoleId
  companyId: CompanyId
  confidence: 'High' | 'Medium'
  lastReviewed: string
  stages: AssessmentStage[]
}

export const roles = [
  {
    id: 'forward-deployed-engineer' as const,
    eyebrow: 'Customer + systems',
    title: 'Forward Deployed Engineer',
    shortTitle: 'FDE',
    description: 'Translate ambiguous customer problems into reliable production systems.',
    skills: ['Discovery', 'System design', 'APIs', 'Delivery'],
  },
  {
    id: 'ai-engineer' as const,
    eyebrow: 'Models + production',
    title: 'AI Engineer',
    shortTitle: 'AI',
    description: 'Build, evaluate, and operate machine-learning and LLM applications.',
    skills: ['ML theory', 'LLMs', 'Evaluation', 'MLOps'],
  },
  {
    id: 'ai-forward-deployed-engineer' as const,
    eyebrow: 'AI + customer delivery',
    title: 'AI Forward Deployed Engineer',
    shortTitle: 'AI FDE',
    description: 'Own AI solutions from customer discovery through production adoption.',
    skills: ['AI architecture', 'Prototyping', 'Consulting', 'Rollout'],
  },
]

export const companies = [
  {
    id: 'turing' as const,
    name: 'Turing',
    monogram: 'TU',
    accent: '#f36f45',
    description: 'Automated screening followed by technical vetting and matching.',
  },
  {
    id: 'andela' as const,
    name: 'Andela',
    monogram: 'AN',
    accent: '#173c36',
    description: 'Profile review, skills assessment, expert interview, then client matching.',
  },
  {
    id: 'toptal' as const,
    name: 'Toptal',
    monogram: 'TO',
    accent: '#204ecf',
    description: 'Multi-stage screening with live interviews and a practical project.',
  },
]

export const assessmentPaths: AssessmentPath[] = [
  {
    roleId: 'forward-deployed-engineer',
    companyId: 'turing',
    confidence: 'Medium',
    lastReviewed: 'September 2026',
    stages: [
      {
        id: 'profile-signal',
        title: 'Profile and seniority assessment',
        type: 'Screening',
        duration: '20–30 min',
        weight: 10,
        summary: 'Complete Turing’s profile and seniority qualification with clear evidence of delivery scope, communication, and customer-facing ownership.',
        outcomes: ['FDE-focused profile', 'Seniority evidence', 'Three quantified delivery stories'],
      },
      {
        id: 'problem-solving',
        title: 'Tech-stack test and live coding challenge',
        type: 'Timed assessment',
        duration: '60–90 min',
        weight: 20,
        summary: 'Prepare for Turing’s role-aligned tech-stack test and live coding challenge, including programming fundamentals, practical implementation, debugging, and representative DSA.',
        outcomes: ['Core stack refresh', 'DSA and complexity practice', 'Readable tested solution'],
      },
      {
        id: 'technical-vetting',
        title: 'Client-specific technical preparation',
        type: 'Live technical',
        duration: 'Varies by client',
        weight: 25,
        summary: 'Prepare to explain integration and system-design tradeoffs if a matched client adds technical evaluation; Turing does not publish one fixed FDE interview sequence after qualification.',
        outcomes: ['Requirement questions', 'Architecture narrative', 'Failure-mode analysis'],
      },
      {
        id: 'delivery-simulation',
        title: 'Client-specific delivery case preparation',
        type: 'Case study',
        duration: 'Varies by client',
        weight: 25,
        summary: 'Practice turning a customer brief into a scoped rollout plan, technical design, and measurable success criteria for client processes that include a case or delivery discussion.',
        outcomes: ['Discovery framework', 'Phased delivery plan', 'Executive-ready explanation'],
      },
      {
        id: 'matching',
        title: 'Talent Cloud matching and client evaluation',
        type: 'Matching',
        duration: 'Varies by engagement',
        weight: 20,
        summary: 'After platform qualification, align skills and availability to suitable jobs; any subsequent client interview format depends on the engagement.',
        outcomes: ['Client-specific pitch', 'Engagement questions', 'First-30-days plan'],
      },
    ],
  },
  {
    roleId: 'forward-deployed-engineer',
    companyId: 'andela',
    confidence: 'Medium',
    lastReviewed: 'September 2026',
    stages: [
      {
        id: 'profile-review',
        title: 'Talent profile review',
        type: 'Screening',
        duration: '1–3 days',
        weight: 10,
        summary: 'Demonstrate seniority, long-term remote delivery, and ownership across technical and stakeholder work.',
        outcomes: ['Outcome-led résumé', 'Remote collaboration examples', 'Verified work history'],
      },
      {
        id: 'english-screen',
        title: 'English and communication screen',
        type: 'Communication',
        duration: '30–45 min',
        weight: 15,
        summary: 'Show that you can clarify ambiguity, facilitate decisions, and communicate risk without jargon.',
        outcomes: ['Concise introduction', 'Structured discovery questions', 'Conflict-resolution story'],
      },
      {
        id: 'skills-assessment',
        title: 'Role-aligned skills assessment',
        type: 'Technical assessment',
        duration: '60–120 min',
        weight: 25,
        summary: 'Complete an applied backend, integration, cloud, or debugging assessment aligned to the opening.',
        outcomes: ['Core stack refresh', 'Integration exercise', 'Testing and observability plan'],
      },
      {
        id: 'expert-interview',
        title: 'Live technical interview',
        type: 'Live technical',
        duration: 'Approximately 60 min',
        weight: 25,
        summary: 'Work through a practical, discussion-based interview aligned to your specialty, with a hands-on exercise when applicable.',
        outcomes: ['Practical technical discussion', 'Tradeoff vocabulary', 'Conditional hands-on exercise'],
      },
      {
        id: 'client-interview',
        title: 'Client fit and delivery interview',
        type: 'Client round',
        duration: '45–60 min',
        weight: 25,
        summary: 'Adapt your experience to the client domain and align on working style, scope, and expected impact.',
        outcomes: ['Client research', 'Relevant case study', '90-day delivery outline'],
      },
    ],
  },
  {
    roleId: 'forward-deployed-engineer',
    companyId: 'toptal',
    confidence: 'Medium',
    lastReviewed: 'September 2026',
    stages: [
      {
        id: 'language-personality',
        title: 'Language and personality interview',
        type: 'Screening',
        duration: '20–30 min',
        weight: 10,
        summary: 'Communicate clearly under pressure and show the judgment expected in direct client work.',
        outcomes: ['Two-minute career story', 'Client communication examples', 'Availability narrative'],
      },
      {
        id: 'technical-screen',
        title: 'In-depth skill review',
        type: 'Live technical',
        duration: '60 min',
        weight: 20,
        summary: 'Review engineering fundamentals, production decisions, architecture, and your strongest delivery work.',
        outcomes: ['Fundamentals refresh', 'Architecture deep dive', 'Project evidence'],
      },
      {
        id: 'live-screening',
        title: 'Live Screening',
        type: 'Live coding',
        duration: '60–90 min',
        weight: 25,
        summary: 'Solve and test a practical engineering problem while narrating assumptions and tradeoffs.',
        outcomes: ['Think-aloud practice', 'Test-first workflow', 'Complexity explanation'],
      },
      {
        id: 'test-project',
        title: 'Test Project',
        type: 'Take-home project',
        duration: '1–3 weeks',
        weight: 30,
        summary: 'Deliver a production-quality solution from an intentionally incomplete brief, including documentation.',
        outcomes: ['Scoped MVP', 'Production-quality repository', 'Handoff and demo'],
      },
      {
        id: 'excellence-review',
        title: 'Continued Excellence',
        type: 'Ongoing quality',
        duration: 'Ongoing',
        weight: 15,
        summary: 'Maintain Toptal’s network standards through dependable client delivery, clear communication, and consistently high-quality work after admission.',
        outcomes: ['Reliable client delivery', 'Proactive communication', 'Continuous quality improvement'],
      },
    ],
  },
  {
    roleId: 'ai-engineer',
    companyId: 'turing',
    confidence: 'Medium',
    lastReviewed: 'September 2026',
    stages: [
      {
        id: 'profile-signal',
        title: 'AI profile and experience screen',
        type: 'Screening',
        duration: '20–30 min',
        weight: 10,
        summary: 'Make shipped AI systems, evaluation results, data scale, and model ownership easy to verify.',
        outcomes: ['AI-focused profile', 'Metric-backed project stories', 'Model and stack inventory'],
      },
      {
        id: 'ai-fundamentals',
        title: 'AI and ML knowledge assessment',
        type: 'Timed assessment',
        duration: '60–90 min',
        weight: 25,
        summary: 'Prioritize ML theory, model evaluation, statistics, Python, and practical LLM concepts over heavy DSA.',
        outcomes: ['Bias-variance mastery', 'Metric selection practice', 'LLM fundamentals review'],
      },
      {
        id: 'practical-coding',
        title: 'Applied Python and data task',
        type: 'Coding round',
        duration: '60–90 min',
        weight: 20,
        summary: 'Implement a clean data, inference, or evaluation pipeline and explain correctness and edge cases.',
        outcomes: ['Python fluency', 'Data validation', 'Reproducible evaluation'],
      },
      {
        id: 'ai-system-design',
        title: 'AI system design interview',
        type: 'Live technical',
        duration: '45–60 min',
        weight: 25,
        summary: 'Design an AI service across data, model choice, retrieval, evaluation, monitoring, latency, and cost.',
        outcomes: ['End-to-end architecture', 'Evaluation strategy', 'Cost and latency tradeoffs'],
      },
      {
        id: 'matching',
        title: 'AI project matching interview',
        type: 'Matching',
        duration: '30–45 min',
        weight: 20,
        summary: 'Map your AI domain experience to a specific customer project and its delivery constraints.',
        outcomes: ['Domain-specific pitch', 'Risk questions', 'First milestone proposal'],
      },
    ],
  },
  {
    roleId: 'ai-engineer',
    companyId: 'andela',
    confidence: 'Medium',
    lastReviewed: 'September 2026',
    stages: [
      {
        id: 'profile-review',
        title: 'AI talent profile review',
        type: 'Screening',
        duration: '1–3 days',
        weight: 10,
        summary: 'Show production AI depth, business outcomes, collaboration, and durable remote experience.',
        outcomes: ['Outcome-led résumé', 'AI portfolio evidence', 'Remote delivery proof'],
      },
      {
        id: 'communication-screen',
        title: 'Communication and collaboration screen',
        type: 'Communication',
        duration: '30–45 min',
        weight: 15,
        summary: 'Explain model behavior and uncertainty to both technical and non-technical stakeholders.',
        outcomes: ['Plain-language model explanation', 'Stakeholder scenario', 'Ambiguity questions'],
      },
      {
        id: 'ml-assessment',
        title: 'Machine-learning skills assessment',
        type: 'Technical assessment',
        duration: '60–120 min',
        weight: 25,
        summary: 'Cover Python, data preparation, modeling choices, evaluation, and role-specific LLM knowledge.',
        outcomes: ['Python and SQL refresh', 'Model evaluation drill', 'LLM application patterns'],
      },
      {
        id: 'expert-interview',
        title: 'AI expert interview',
        type: 'Live technical',
        duration: '60 min',
        weight: 25,
        summary: 'Deep-dive into model decisions, data quality, experimentation, deployment, and monitoring.',
        outcomes: ['Project deep dive', 'Failure analysis', 'MLOps architecture'],
      },
      {
        id: 'client-interview',
        title: 'Client AI use-case interview',
        type: 'Client round',
        duration: '45–60 min',
        weight: 25,
        summary: 'Shape an ambiguous AI opportunity into a feasible experiment with measurable acceptance criteria.',
        outcomes: ['Use-case framing', 'Experiment plan', 'Risk and ethics review'],
      },
    ],
  },
  {
    roleId: 'ai-engineer',
    companyId: 'toptal',
    confidence: 'Medium',
    lastReviewed: 'September 2026',
    stages: [
      {
        id: 'language-personality',
        title: 'Language and personality interview',
        type: 'Screening',
        duration: '20–30 min',
        weight: 10,
        summary: 'Establish clear communication, professionalism, and the ability to work directly with clients.',
        outcomes: ['Career narrative', 'AI project summary', 'Client-ready communication'],
      },
      {
        id: 'ai-skill-review',
        title: 'In-depth AI skill review',
        type: 'Live technical',
        duration: '60 min',
        weight: 20,
        summary: 'Expect ML fundamentals, experimentation, model evaluation, and architecture questions grounded in your work.',
        outcomes: ['ML theory refresh', 'Metric tradeoffs', 'Production architecture story'],
      },
      {
        id: 'live-problem-solving',
        title: 'Live Python and ML problem solving',
        type: 'Live coding',
        duration: '60–90 min',
        weight: 25,
        summary: 'Work through data handling, modeling, or evaluation code while explaining assumptions and tests.',
        outcomes: ['Python fluency', 'Data edge cases', 'Evaluation implementation'],
      },
      {
        id: 'test-project',
        title: 'Production AI test project',
        type: 'Take-home project',
        duration: '1–2 weeks',
        weight: 30,
        summary: 'Build an end-to-end AI feature with measurable quality, deployment instructions, and observability.',
        outcomes: ['Reproducible pipeline', 'Evaluation report', 'Deployment-ready service'],
      },
      {
        id: 'excellence-review',
        title: 'Project excellence review',
        type: 'Final review',
        duration: '45–60 min',
        weight: 15,
        summary: 'Defend data, model, quality, and production tradeoffs and respond to follow-up constraints.',
        outcomes: ['Technical presentation', 'Tradeoff defense', 'Iteration proposal'],
      },
    ],
  },
  {
    roleId: 'ai-forward-deployed-engineer',
    companyId: 'turing',
    confidence: 'Medium',
    lastReviewed: 'September 2026',
    stages: [
      {
        id: 'profile-signal',
        title: 'AI delivery profile screen',
        type: 'Screening',
        duration: '20–30 min',
        weight: 10,
        summary: 'Connect AI depth to customer outcomes, adoption, and measurable production delivery.',
        outcomes: ['AI FDE positioning', 'Customer outcome stories', 'Delivery metrics'],
      },
      {
        id: 'ai-readiness',
        title: 'Applied AI readiness assessment',
        type: 'Timed assessment',
        duration: '60–90 min',
        weight: 20,
        summary: 'Combine practical Python, AI concepts, evaluation reasoning, and integration decisions.',
        outcomes: ['Python practice', 'AI evaluation drill', 'Integration patterns'],
      },
      {
        id: 'solution-interview',
        title: 'AI solution architecture interview',
        type: 'Live technical',
        duration: '60 min',
        weight: 25,
        summary: 'Design a secure, observable AI workflow from customer data through model output and feedback.',
        outcomes: ['AI architecture', 'Security boundaries', 'Monitoring plan'],
      },
      {
        id: 'customer-case',
        title: 'Customer discovery and prototype case',
        type: 'Case study',
        duration: '60–90 min',
        weight: 25,
        summary: 'Clarify an ambiguous use case, identify the riskiest assumption, and propose a fast proof of value.',
        outcomes: ['Discovery script', 'Prototype scope', 'Success scorecard'],
      },
      {
        id: 'matching',
        title: 'Customer project matching',
        type: 'Matching',
        duration: '30–45 min',
        weight: 20,
        summary: 'Demonstrate domain fit, executive communication, and readiness to lead a customer AI rollout.',
        outcomes: ['Domain pitch', 'Adoption plan', 'First-30-days outline'],
      },
    ],
  },
  {
    roleId: 'ai-forward-deployed-engineer',
    companyId: 'andela',
    confidence: 'Medium',
    lastReviewed: 'September 2026',
    stages: [
      {
        id: 'profile-review',
        title: 'AI delivery profile review',
        type: 'Screening',
        duration: '1–3 days',
        weight: 10,
        summary: 'Show a credible blend of AI implementation, consulting judgment, and distributed delivery.',
        outcomes: ['Hybrid résumé', 'Consulting case studies', 'Production AI evidence'],
      },
      {
        id: 'communication-screen',
        title: 'Stakeholder communication screen',
        type: 'Communication',
        duration: '30–45 min',
        weight: 15,
        summary: 'Translate AI constraints into decisions and handle expectation-setting with clarity.',
        outcomes: ['Executive explanation', 'Expectation-setting scenario', 'Discovery questions'],
      },
      {
        id: 'applied-assessment',
        title: 'Applied AI and engineering assessment',
        type: 'Technical assessment',
        duration: '90–120 min',
        weight: 25,
        summary: 'Demonstrate AI fundamentals, Python, integration, evaluation, and production reasoning.',
        outcomes: ['AI fundamentals', 'API implementation', 'Evaluation harness'],
      },
      {
        id: 'expert-interview',
        title: 'AI architecture and delivery interview',
        type: 'Live technical',
        duration: '60 min',
        weight: 25,
        summary: 'Walk an expert through discovery, architecture, iteration, launch, and model monitoring.',
        outcomes: ['End-to-end case study', 'Architecture tradeoffs', 'Rollout retrospective'],
      },
      {
        id: 'client-interview',
        title: 'Client solution workshop',
        type: 'Client round',
        duration: '60 min',
        weight: 25,
        summary: 'Lead a structured conversation that turns a client goal into an AI delivery roadmap.',
        outcomes: ['Workshop agenda', 'Prioritized roadmap', 'Adoption and risk plan'],
      },
    ],
  },
  {
    roleId: 'ai-forward-deployed-engineer',
    companyId: 'toptal',
    confidence: 'Medium',
    lastReviewed: 'September 2026',
    stages: [
      {
        id: 'language-personality',
        title: 'Language and personality interview',
        type: 'Screening',
        duration: '20–30 min',
        weight: 10,
        summary: 'Show the communication maturity required to advise clients on uncertain AI initiatives.',
        outcomes: ['Career narrative', 'Stakeholder examples', 'Clear AI explanations'],
      },
      {
        id: 'hybrid-review',
        title: 'AI and delivery skill review',
        type: 'Live technical',
        duration: '60 min',
        weight: 20,
        summary: 'Cover AI fundamentals, production engineering, system design, and customer delivery decisions.',
        outcomes: ['AI theory refresh', 'System-design narrative', 'Consulting examples'],
      },
      {
        id: 'live-case',
        title: 'Live AI solution case',
        type: 'Working session',
        duration: '60–90 min',
        weight: 25,
        summary: 'Clarify a client brief and sketch a testable, secure, and commercially sensible AI solution.',
        outcomes: ['Discovery flow', 'Architecture sketch', 'Success criteria'],
      },
      {
        id: 'test-project',
        title: 'Client-ready AI test project',
        type: 'Take-home project',
        duration: '1–2 weeks',
        weight: 30,
        summary: 'Ship a production-minded AI prototype plus a client-facing walkthrough and rollout plan.',
        outcomes: ['Working prototype', 'Evaluation evidence', 'Client handoff'],
      },
      {
        id: 'excellence-review',
        title: 'Delivery excellence review',
        type: 'Final review',
        duration: '45–60 min',
        weight: 15,
        summary: 'Present technical choices and business impact, then adapt the plan to new constraints.',
        outcomes: ['Executive demo', 'Technical defense', 'Revised delivery plan'],
      },
    ],
  },
]

export function getAssessmentPath(roleId: RoleId, companyId: CompanyId) {
  return assessmentPaths.find((path) => path.roleId === roleId && path.companyId === companyId)
}

export function isRoleId(value: string): value is RoleId {
  return roles.some((role) => role.id === value)
}

export function isCompanyId(value: string): value is CompanyId {
  return companies.some((company) => company.id === value)
}

export function getRole(roleId: RoleId) {
  return roles.find((role) => role.id === roleId)
}

export function getCompany(companyId: CompanyId) {
  return companies.find((company) => company.id === companyId)
}

export function getAssessmentPathsForRole(roleId: RoleId) {
  return assessmentPaths.filter((path) => path.roleId === roleId)
}