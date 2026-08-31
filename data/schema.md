# Question Bank Schema

All question banks live in `/data/questions/*.json` and share this schema.

## Module file shape

```jsonc
{
  "module": "javascript-fundamentals",       // slug
  "title": "JavaScript Fundamentals",         // display name
  "description": "…",
  "platformCoverage": ["turing-mcq", "andela-hr", "toptal-live", "fde-loop"],
  "estimatedHours": 8,
  "questions": [ /* see below */ ]
}
```

## Question shape

```jsonc
{
  "id": "js-001",                             // unique across bank
  "type": "mcq-single",                       // mcq-single | mcq-multi | code-output | short-code | open-rubric
  "difficulty": "easy",                       // easy | medium | hard
  "topic": "closures",                        // free-form tag
  "prompt": "What does this print?",
  "code": "…optional code block…",
  "options": [                                // required for mcq-*
    { "id": "a", "text": "1" },
    { "id": "b", "text": "2" }
  ],
  "correct": ["a"],                           // array for both single & multi
  "explanation": "Why the correct answer is correct.",
  "rubric": [                                 // required for open-rubric
    { "criterion": "Clarifies requirements first", "weight": 2 }
  ],
  "modelAnswer": "…required for open-rubric…",
  "tags": ["closure", "lexical-scope"],
  "sourcePlatforms": ["turing-mcq", "andela-pair"]
}
```

## Types

- **mcq-single** — one correct answer. `correct` has 1 id.
- **mcq-multi** — 1+ correct answers. Turing-style. `correct` has 2+ ids.
- **code-output** — MCQ where prompt is "what does this print". `options` are outputs.
- **short-code** — user writes a function; app shows model solution + tests they can eyeball.
- **open-rubric** — user drafts an answer; app grades against `rubric` criteria (self-check).
