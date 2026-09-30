import { aiAgentsLessonDetails } from './ai-core-content-agents'
import { aiMlLessonDetails } from './ai-core-content-ml'
import { aiModelsLessonDetails } from './ai-core-content-models'
import { aiOperationsLessonDetails } from './ai-core-content-operations'
import { aiRetrievalLessonDetails } from './ai-core-content-retrieval'
import type { AiLessonDetails } from './ai-core-lesson-types'
import {
  defineLearningPath,
  type LearningChapterSeed,
} from './learning-model'

const aiLessonDetailsByChapter: Readonly<
  Record<string, Readonly<Record<string, AiLessonDetails>>>
> = {
  'ml-fundamentals': aiMlLessonDetails,
  'ml-algorithms': aiMlLessonDetails,
  'ml-evaluation': aiMlLessonDetails,
  'deep-learning': aiModelsLessonDetails,
  transformers: aiModelsLessonDetails,
  'llm-engineering': aiModelsLessonDetails,
  rag: aiRetrievalLessonDetails,
  'rag-evaluation': aiRetrievalLessonDetails,
  'vector-search': aiRetrievalLessonDetails,
  agents: aiAgentsLessonDetails,
  'agent-memory': aiAgentsLessonDetails,
  'agent-frameworks': aiAgentsLessonDetails,
  'ai-evaluation-observability': aiOperationsLessonDetails,
  'ai-security': aiOperationsLessonDetails,
  'llmops-ai-system-design': aiOperationsLessonDetails,
}

function addAiLessonDetails(
  chapters: readonly LearningChapterSeed[],
): readonly LearningChapterSeed[] {
  return chapters.map((chapter) => ({
    ...chapter,
    examples: chapter.examples.map((example) => {
      if ('title' in example) {
        return example
      }

      const [title, principle] = example
      const details = aiLessonDetailsByChapter[chapter.id]?.[title]

      return details ? { title, principle, ...details } : example
    }),
  }))
}

export const aiCoreLearningPath = defineLearningPath({
  id: 'ai-engineering-core',
  title: 'AI Engineering Core',
  shortTitle: 'AI Engineering Core',
  description: 'Learn the model, retrieval, agent, evaluation, safety, and operational foundations behind production AI systems.',
  accent: '#27865a',
  audience: 'AI Engineers and AI FDEs preparing for fundamentals, design, implementation, and customer rounds.',
  recommendedFor: ['ai-engineer', 'ai-forward-deployed-engineer'],
  platforms: ['Turing', 'Andela', 'Toptal'],
  chapters: addAiLessonDetails([
    {
      id: 'ml-fundamentals',
      title: 'ML Fundamentals',
      summary: 'Frame learnable problems, separate evidence correctly, and recognize when a model will generalize.',
      outcomes: ['Frame ML tasks', 'Prevent leakage', 'Diagnose bias and variance'],
      platformFocus: 'Fundamentals screens commonly use short diagnosis questions followed by requests to justify the answer.',
      examples: [
        ['Supervised learning', 'Supervised learning estimates a mapping from labeled examples.', 'Predict ticket priority from previously resolved tickets with verified priority labels.'],
        ['Train, validation, and test', 'Use training to fit, validation to choose, and test once for final evidence.', 'Tune a classifier on validation data without repeatedly inspecting the held-out test set.'],
        ['Bias and variance', 'Underfitting reflects excessive bias; a large train-test gap signals variance.', 'A model scoring 98% on ten training examples and 45% on new data is overfitting.'],
        ['Feature representation', 'Representations should expose useful signal available at prediction time.', 'Encode ticket age and product area without using the future resolution code.'],
        ['Data leakage', 'Leakage lets training access information unavailable during real inference.', 'Remove final refund status from features used to predict whether a refund will occur.'],
        ['Regularization', 'Regularization limits effective complexity to improve generalization.', 'Add weight decay when a high-capacity model memorizes a small training set.'],
        ['Class imbalance', 'Accuracy can hide failure on rare but important classes.', 'Evaluate fraud detection with recall, precision, and cost rather than 99% accuracy.'],
      ],
    },
    {
      id: 'ml-algorithms',
      title: 'ML Algorithms',
      summary: 'Understand the assumptions, strengths, and failure modes of common predictive and unsupervised methods.',
      outcomes: ['Select baseline algorithms', 'Explain model behavior', 'Compare accuracy and operational cost'],
      platformFocus: 'Interviewers usually care more about choosing and defending a model than deriving every equation.',
      examples: [
        ['Linear regression', 'Linear regression models a continuous outcome as a weighted sum of features.', 'Estimate delivery time while checking whether residuals reveal a missing nonlinear pattern.'],
        ['Logistic regression', 'Logistic regression produces a class probability from a linear decision boundary.', 'Build an interpretable churn baseline before trying boosted trees.'],
        ['Decision trees', 'Trees split feature space into readable rules but can overfit deeply.', 'Limit depth when a ticket-routing tree memorizes rare categories.'],
        ['Random forests', 'Bagged trees reduce variance by averaging diverse fitted trees.', 'Use a random forest for robust tabular performance with limited tuning.'],
        ['Gradient boosting', 'Boosting fits successive learners to remaining errors and often excels on tabular data.', 'Compare a boosted model against the logistic baseline for credit risk.'],
        ['Clustering', 'Clustering discovers groups, but usefulness depends on representation and interpretation.', 'Cluster support issues by embeddings, then have domain experts name and validate segments.'],
        ['Nearest neighbors', 'Nearest-neighbor methods predict from local similarity and depend strongly on distance scale.', 'Standardize numeric features before using k-nearest neighbors for incident classification.'],
      ],
    },
    {
      id: 'ml-evaluation',
      title: 'ML Evaluation',
      summary: 'Choose metrics and validation methods that reflect error costs, uncertainty, and deployment conditions.',
      outcomes: ['Interpret classification metrics', 'Validate generalization', 'Tie model scores to business value'],
      platformFocus: 'Evaluation questions test whether you can challenge a misleading headline metric.',
      examples: [
        ['Confusion matrix', 'Count true and false positives and negatives before compressing behavior into one score.', 'Inspect how many fraud cases were missed and legitimate purchases blocked.'],
        ['Precision and recall', 'Precision controls false alarms; recall controls missed positives.', 'Prioritize recall in safety-event detection while setting a reviewable precision floor.'],
        ['F1 score', 'F1 balances precision and recall through their harmonic mean.', 'Use F1 only when both error types matter similarly and class balance is understood.'],
        ['ROC and PR curves', 'Precision-recall curves are often clearer for rare positive classes.', 'Compare fraud models by area under the PR curve rather than ROC alone.'],
        ['Calibration', 'A calibrated 0.8 prediction should be correct about 80% of the time.', 'Calibrate risk probabilities before they drive approval thresholds.'],
        ['Cross-validation', 'Cross-validation estimates variation across splits when data is limited.', 'Use time-aware folds for demand forecasting instead of random future-to-past leakage.'],
        ['Business evaluation', 'Select thresholds by downstream cost, capacity, and benefit.', 'Choose a review threshold that catches valuable fraud within the investigation team’s daily capacity.'],
      ],
    },
    {
      id: 'deep-learning',
      title: 'Deep Learning',
      summary: 'Reason about neural networks as differentiable compositions trained through optimization.',
      outcomes: ['Trace a training step', 'Diagnose optimization', 'Control overfitting and resource use'],
      platformFocus: 'Deep-learning screens commonly connect conceptual components to training symptoms.',
      examples: [
        ['Tensors and shapes', 'Tensor dimensions encode batch, sequence, feature, and output structure.', 'Verify that token embeddings shaped batch by sequence by hidden match the attention layer.'],
        ['Forward computation', 'Layers transform inputs through learned parameters and nonlinearities.', 'Trace an image batch through convolution, activation, pooling, and classifier output.'],
        ['Backpropagation', 'Backpropagation applies the chain rule to calculate parameter gradients.', 'Explain how loss at the output changes an earlier layer’s weights.'],
        ['Activation functions', 'Nonlinear activations let stacked layers represent nonlinear relationships.', 'Use ReLU-like activations while monitoring dead units in a deep network.'],
        ['Optimization', 'Learning rate and optimizer dynamics determine whether training converges.', 'Lower an unstable learning rate when loss oscillates instead of steadily decreasing.'],
        ['Regularization', 'Dropout, weight decay, augmentation, and early stopping can improve generalization.', 'Stop at the checkpoint where validation loss begins rising while training loss falls.'],
        ['Batching', 'Batch size trades gradient noise, memory, throughput, and convergence behavior.', 'Use gradient accumulation when the desired effective batch does not fit GPU memory.'],
      ],
    },
    {
      id: 'transformers',
      title: 'Transformers',
      summary: 'Understand how token representations, attention, feed-forward layers, and caching produce language-model behavior.',
      outcomes: ['Explain a transformer block', 'Reason about attention cost', 'Describe autoregressive inference'],
      platformFocus: 'AI technical screens often ask for an end-to-end explanation from tokenization to generated output.',
      examples: [
        ['Tokenization', 'A tokenizer maps text into subword IDs governed by its vocabulary.', 'Explain why an unusual identifier may consume many tokens and increase context cost.'],
        ['Embeddings', 'Embedding tables map token IDs into learned continuous vectors.', 'Look up each token vector before adding positional information.'],
        ['Self-attention', 'Attention mixes token information using query-key similarity and value vectors.', 'Let a pronoun representation attend strongly to the earlier noun it references.'],
        ['Multi-head attention', 'Multiple heads can learn different relation patterns in parallel.', 'One head can track syntax while another emphasizes long-range entity references.'],
        ['Position information', 'Transformers need explicit position signals because attention alone is order-agnostic.', 'Apply rotary position encoding before comparing queries and keys.'],
        ['Decoder block', 'A decoder block combines causal attention, feed-forward transformation, residual paths, and normalization.', 'Trace one token representation through masked attention and the MLP.'],
        ['KV cache', 'Caching prior keys and values avoids recomputing the full prefix for every generated token.', 'Reuse cached prompt states during decoding while accounting for growing memory.'],
      ],
    },
    {
      id: 'llm-engineering',
      title: 'LLM Engineering',
      summary: 'Turn language models into predictable product components with explicit contracts and failure handling.',
      outcomes: ['Design robust prompts and outputs', 'Use tools safely', 'Balance quality, latency, and cost'],
      platformFocus: 'Practical interviews focus on reliability and product constraints rather than clever prompt wording alone.',
      examples: [
        ['Instruction hierarchy', 'Separate system policy, application context, user input, and untrusted content.', 'Keep authorization rules in system instructions and delimit retrieved customer text.'],
        ['Few-shot prompting', 'Examples clarify format and edge behavior when prose instructions are insufficient.', 'Provide two correctly labeled tickets before asking the model to classify a third.'],
        ['Structured outputs', 'Constrained schemas make model responses easier to validate and integrate.', 'Require a JSON object with category, confidence, and rationale fields.'],
        ['Tool calling', 'The application validates tool arguments and executes tools; the model only proposes calls.', 'Check account ownership before running the model-requested refund lookup.'],
        ['Context management', 'Select and order only context that helps the current task.', 'Summarize old turns and retain the latest constraints inside the context budget.'],
        ['Inference controls', 'Temperature, token limits, stop rules, and model choice affect behavior and cost.', 'Use low temperature and a strict schema for deterministic extraction.'],
        ['Failure handling', 'Validate outputs and define retry, fallback, abstention, and escalation behavior.', 'Escalate a low-confidence legal answer instead of inventing a response.'],
      ],
    },
    {
      id: 'rag',
      title: 'RAG',
      summary: 'Build retrieval-augmented generation from trustworthy ingestion through cited, context-grounded answers.',
      outcomes: ['Design ingestion and retrieval', 'Improve context quality', 'Handle freshness and citations'],
      platformFocus: 'RAG is commonly assessed as an end-to-end system with customer data, scale, and quality constraints.',
      examples: [
        ['Ingestion pipeline', 'Parse, normalize, enrich, authorize, and version source documents before indexing.', 'Extract headings and access groups from a policy PDF during ingestion.'],
        ['Chunking', 'Chunk by semantic structure while retaining enough context to answer complete questions.', 'Split a handbook by section and attach document and heading metadata.'],
        ['Embeddings', 'Use an embedding model suited to language, domain, and query-document behavior.', 'Evaluate a multilingual model before indexing global support articles.'],
        ['Retrieval', 'Retrieve a broad candidate set using the user query and relevant filters.', 'Search only documents the current employee is authorized to access.'],
        ['Reranking', 'A reranker spends more compute to reorder a smaller candidate set precisely.', 'Retrieve fifty chunks cheaply, then rerank the best five for generation.'],
        ['Grounded generation', 'Tell the model to answer from supplied evidence and cite the supporting chunks.', 'Return “insufficient evidence” when no retrieved policy supports the answer.'],
        ['Freshness', 'Track source versions and update or delete indexed content predictably.', 'Re-index a changed policy and remove chunks from its prior version.'],
      ],
    },
    {
      id: 'rag-evaluation',
      title: 'RAG Evaluation',
      summary: 'Measure retrieval and answer quality separately so failures lead to the right fix.',
      outcomes: ['Build representative eval data', 'Diagnose retrieval versus generation', 'Prevent regressions'],
      platformFocus: 'Strong candidates propose measurable evaluation before tuning prompts or changing models.',
      examples: [
        ['Golden dataset', 'Create representative questions with expected evidence, answer criteria, and slices.', 'Include common, rare, ambiguous, and access-restricted policy questions.'],
        ['Context recall', 'Context recall asks whether retrieval found the evidence needed for the answer.', 'Investigate chunking or query expansion when relevant policy sections are consistently absent.'],
        ['Context precision', 'Context precision checks whether retrieved material is relevant rather than distracting.', 'Add metadata filters when obsolete product versions dominate results.'],
        ['Faithfulness', 'Faithfulness measures whether claims are supported by retrieved context.', 'Flag an answer that sounds correct but introduces a benefit absent from the documents.'],
        ['Answer relevance', 'An answer can be grounded yet fail to address the user’s actual question.', 'Penalize a cited policy summary that never states the requested deadline.'],
        ['End-to-end success', 'Combine quality with latency, cost, abstention, and task completion.', 'Require accurate cited answers under two seconds within the per-request budget.'],
        ['Regression suite', 'Run stable evaluations on every retrieval, prompt, model, or index change.', 'Block release when the benefits-policy slice drops below its agreed threshold.'],
      ],
    },
    {
      id: 'vector-search',
      title: 'Vector Search',
      summary: 'Understand representation, similarity, indexing, filtering, and tenancy in semantic retrieval.',
      outcomes: ['Choose similarity and indexes', 'Combine lexical and semantic search', 'Design secure multi-tenant retrieval'],
      platformFocus: 'Vector-search questions test both the mathematical idea and production retrieval tradeoffs.',
      examples: [
        ['Vector representations', 'Nearby vectors represent inputs the embedding model considers semantically related.', 'Embed a query and document chunks in the same model space.'],
        ['Similarity measures', 'Cosine similarity compares direction; dot product also reflects magnitude.', 'Use the metric the embedding model was trained and normalized for.'],
        ['Approximate nearest neighbors', 'ANN sacrifices exactness for much faster search at large scale.', 'Tune recall and latency rather than scanning fifty million vectors exactly.'],
        ['Index selection', 'HNSW favors low-latency recall with memory cost; compressed indexes reduce footprint.', 'Choose HNSW for an interactive corpus that fits available memory.'],
        ['Metadata filtering', 'Structured filters narrow semantic candidates by known constraints.', 'Filter by tenant, region, language, and active document version.'],
        ['Hybrid search', 'Lexical retrieval preserves exact terms while vectors capture semantic similarity.', 'Combine BM25 for error codes with embeddings for natural-language descriptions.'],
        ['Tenant isolation', 'Enforce authorization before or during retrieval, never only after generation.', 'Use tenant-scoped filters and test that cross-tenant vectors cannot appear.'],
      ],
    },
    {
      id: 'agents',
      title: 'Agents',
      summary: 'Design bounded model-driven workflows that select tools, maintain state, and recover safely.',
      outcomes: ['Model an agent loop', 'Constrain tools and state', 'Add human control and recovery'],
      platformFocus: 'Agent-design cases should include deterministic control points, not merely a model plus many tools.',
      examples: [
        ['Agent loop', 'An agent observes state, chooses an action, receives a result, and repeats toward a stop condition.', 'Classify a ticket, fetch account data, draft a reply, then stop for approval.'],
        ['Tool design', 'Tools need narrow purpose, typed inputs, explicit permissions, and useful errors.', 'Expose refund eligibility separately from issue_refund.'],
        ['Planning', 'Use planning only when tasks genuinely require dynamic decomposition.', 'Let a research agent select sources while keeping the final publication workflow fixed.'],
        ['State', 'Store durable workflow facts outside the model’s prose context.', 'Track ticket ID, verified customer, tool results, and approval status in typed state.'],
        ['Human in the loop', 'Require review where risk, uncertainty, or policy demands accountable judgment.', 'Pause for approval before a refund above $100.'],
        ['Guardrails', 'Constrain inputs, actions, outputs, budgets, and stopping behavior in code.', 'Allow only read tools until identity verification succeeds.'],
        ['Recovery', 'Persist checkpoints and make tool effects idempotent so workflows can resume.', 'Restart after a timeout without issuing the same refund twice.'],
      ],
    },
    {
      id: 'agent-memory',
      title: 'Agent Memory',
      summary: 'Choose what an agent remembers, how it retrieves it, and when information expires or must be deleted.',
      outcomes: ['Separate memory types', 'Control memory quality', 'Protect user data'],
      platformFocus: 'Memory discussions should address relevance, staleness, privacy, and cost instead of promising unlimited recall.',
      examples: [
        ['Working memory', 'Working memory contains state needed for the current task.', 'Keep the current troubleshooting steps and latest tool result in active state.'],
        ['Conversation memory', 'Conversation memory preserves useful dialogue context across turns.', 'Retain the user’s product and error while dropping unrelated greetings.'],
        ['Episodic memory', 'Episodic memory records specific past interactions or outcomes.', 'Recall that the customer previously rejected a proposed maintenance window.'],
        ['Semantic memory', 'Semantic memory stores durable facts abstracted from individual events.', 'Remember the customer’s approved deployment region as a profile fact.'],
        ['Summarization', 'Summaries compress history but can lose detail or introduce distortion.', 'Regenerate a structured summary while preserving unresolved decisions verbatim.'],
        ['Memory retrieval', 'Retrieve memories by relevance, recency, importance, and authorization.', 'Surface the latest approved preference rather than every historical mention.'],
        ['Privacy and deletion', 'Users need consent, visibility, retention, correction, and deletion controls.', 'Delete vectorized profile memories when a customer requests account erasure.'],
      ],
    },
    {
      id: 'agent-frameworks',
      title: 'Agent Frameworks',
      summary: 'Use orchestration frameworks where they clarify workflow state, durability, tooling, and inspection.',
      outcomes: ['Model graph workflows', 'Use durable execution', 'Choose frameworks by requirements'],
      platformFocus: 'Framework questions are strongest when you can explain the underlying pattern without depending on one library.',
      examples: [
        ['Graph orchestration', 'A graph makes allowed workflow states and transitions explicit.', 'Route a classified request to billing, technical support, or human triage nodes.'],
        ['Typed state', 'A shared state schema prevents nodes from exchanging unstructured hidden assumptions.', 'Define ticket, account, evidence, draft, and approval as typed fields.'],
        ['Nodes and edges', 'Nodes perform bounded work; edges encode deterministic or conditional routing.', 'Send high-value refunds to an approval node based on a code-level condition.'],
        ['Checkpointing', 'Checkpoints make long workflows resumable and inspectable.', 'Persist state after each tool call so a process restart resumes safely.'],
        ['Tool adapters', 'Adapters normalize authentication, schemas, errors, and telemetry around external tools.', 'Wrap a CRM SDK in a narrow get_customer tool.'],
        ['MCP interoperability', 'A standard tool protocol can separate tool providers from agent hosts.', 'Connect an approved document-search MCP server without embedding its SDK in every agent.'],
        ['Framework selection', 'Choose the smallest framework that satisfies control, durability, and team constraints.', 'Use direct model calls for one extraction step and a graph for a recoverable approval workflow.'],
      ],
    },
    {
      id: 'ai-evaluation-observability',
      title: 'AI Evaluation & Observability',
      summary: 'Combine offline evidence and production telemetry to understand quality, safety, latency, and cost.',
      outcomes: ['Trace AI workflows', 'Design offline and online evaluation', 'Detect quality regressions'],
      platformFocus: 'Production AI interviews expect an evaluation system, not “we will monitor user feedback.”',
      examples: [
        ['AI traces', 'Trace prompts, retrieval, model calls, tools, outputs, timing, and token use with privacy controls.', 'Inspect why a slow support answer made three unnecessary tool calls.'],
        ['Evaluation datasets', 'Version representative cases, references, criteria, and slices with the application.', 'Maintain separate policy, billing, multilingual, and adversarial slices.'],
        ['Offline evaluation', 'Run repeatable checks before release to compare candidate configurations.', 'Compare two prompts on groundedness, task success, latency, and cost.'],
        ['Online evaluation', 'Monitor sampled production behavior and user outcomes after release.', 'Track accepted drafts, escalations, corrections, and abandonment by use case.'],
        ['LLM as judge', 'Model judges need calibrated rubrics, randomized order, and human validation.', 'Swap answer order to detect position bias and audit disagreements with reviewers.'],
        ['Operational telemetry', 'Measure token use, latency, errors, tool outcomes, and cost by tenant and feature.', 'Alert when one agent release doubles tool calls per completed ticket.'],
        ['Feedback and drift', 'Connect feedback to examples and watch input, retrieval, and outcome distributions change.', 'Add corrected failures to the regression set after a policy update.'],
      ],
    },
    {
      id: 'ai-security',
      title: 'AI Security',
      summary: 'Treat models and retrieved content as untrusted components inside conventional security boundaries.',
      outcomes: ['Defend against prompt attacks', 'Constrain model actions', 'Protect sensitive data'],
      platformFocus: 'Security cases test whether controls live in enforceable code rather than prompts alone.',
      examples: [
        ['Prompt injection', 'Untrusted content may instruct the model to ignore policy or misuse tools.', 'Label retrieved web text as data and keep tool authorization outside the prompt.'],
        ['Data exfiltration', 'Limit what context and tools can reveal even when the model is manipulated.', 'Return only fields allowed for the authenticated user’s tenant.'],
        ['Tool authorization', 'Authorize every proposed action against user, resource, and workflow state.', 'Reject a model-requested refund when the user lacks billing permission.'],
        ['Output validation', 'Parse, validate, encode, and constrain model output before downstream use.', 'Validate generated SQL against an allowlisted read-only query plan.'],
        ['Sensitive data', 'Classify, minimize, redact, encrypt, and govern retention of model inputs and traces.', 'Remove payment details before sending a ticket to an external model.'],
        ['Supply-chain security', 'Evaluate model, dataset, package, and tool provenance and integrity.', 'Pin model and dependency versions and verify artifact hashes before deployment.'],
        ['Adversarial testing', 'Continuously test misuse cases, boundary escapes, and unsafe combinations.', 'Run a suite of indirect prompt injections against every RAG release.'],
      ],
    },
    {
      id: 'llmops-ai-system-design',
      title: 'LLMOps / AI System Design',
      summary: 'Operate AI systems as versioned, evaluated, scalable products with fallbacks and controlled change.',
      outcomes: ['Version the full AI behavior', 'Deploy with quality gates', 'Design scalable resilient inference'],
      platformFocus: 'Senior and client-facing rounds connect model behavior to architecture, reliability, and delivery tradeoffs.',
      examples: [
        ['Version everything', 'Track model, prompt, retrieval config, tools, data, and evaluator versions together.', 'Reconstruct which exact stack produced a disputed customer answer.'],
        ['Evaluation gates', 'Require slice-level quality, safety, latency, and cost thresholds before promotion.', 'Block a model upgrade that improves averages but harms multilingual support.'],
        ['Progressive deployment', 'Expose a candidate configuration gradually and compare against a control.', 'Shadow one percent of traffic before enabling responses for users.'],
        ['Model gateway', 'Centralize routing, policy, budgets, credentials, telemetry, and provider fallback.', 'Route low-risk summaries to a smaller model and complex cases to a stronger one.'],
        ['Scaling inference', 'Plan concurrency, batching, token throughput, quotas, and backpressure.', 'Queue long document jobs separately so they cannot starve interactive chat.'],
        ['Caching and reuse', 'Cache only safe deterministic work with tenant-aware keys and invalidation.', 'Reuse document embeddings while invalidating them when source content changes.'],
        ['Fallback design', 'Define degraded behavior for model, retrieval, and tool failures.', 'Return search results with citations when generation is unavailable.'],
      ],
    },
  ]),
})