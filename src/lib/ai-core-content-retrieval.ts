import type { AiLessonDetails } from './ai-core-lesson-types'

export const aiRetrievalLessonDetails = {
  'Ingestion pipeline': {
    explanation: [
      'An ingestion pipeline turns source material into retrieval-ready records by extracting text, normalizing structure, attaching source and authorization metadata, splitting content, computing embeddings, and writing each version to an index. Stable document and chunk identifiers make retries idempotent and let updates replace old content instead of creating duplicate evidence.',
      'Use batch ingestion for bounded collections and event-driven ingestion when changes must become searchable quickly. Higher parallelism improves throughput but can overload parsers or embedding APIs, while weak validation can silently index truncated text, stale versions, missing access controls, or partially processed documents; quarantine failures and publish a version only after all required stages succeed.',
    ],
    whyItMatters: 'Retrieval cannot recover information that was lost, corrupted, duplicated, or mislabeled before indexing. A traceable ingestion pipeline makes freshness, deletion, authorization, and reprocessing observable rather than leaving the index as an unexplained copy of source data.',
    useCases: [
      'Indexing product manuals from object storage whenever a new approved version is published',
      'Synchronizing changed help-center articles from a content-management webhook',
      'Backfilling millions of support tickets while preserving account and retention metadata',
    ],
    workedExample: {
      scenario: 'A support assistant must search 12,000 product manuals, and revised manuals must replace prior versions without exposing draft content.',
      steps: [
        'Read only approved manual versions, extract headings and body text, and assign each source a stable product ID and version ID.',
        'Validate that product, locale, approval state, and access metadata are present before splitting the manual into retrieval chunks.',
        'Embed the chunks and write them to a staging index under deterministic chunk IDs, retrying failed embedding batches without duplicating successful records.',
        'Run count and sample-query checks, atomically promote the staged version, and delete chunks belonging to superseded versions.',
      ],
      result: 'All 12,000 approved manuals become searchable, a retried batch creates no duplicates, and publishing version 4 removes version 3 chunks from results within five minutes.',
    },
    interview: {
      prompt: 'How would you make a document ingestion pipeline safe to retry?',
      answer: 'I would derive stable source, version, and chunk IDs; make writes upserts; record stage status; and commit a document version only after parsing, metadata validation, chunking, and embedding succeed. Deletions need tombstones or version reconciliation as well. Then a retry repeats incomplete work without duplicating records or exposing a partial version.',
    },
  },
  Chunking: {
    explanation: [
      'Chunking divides source content into units that can be embedded, retrieved, and placed in a model context. Good chunkers preserve semantic boundaries such as headings, paragraphs, tables, or code blocks, attach parent context and location metadata, and use measured overlap only when an idea would otherwise be split across adjacent chunks.',
      'Chunks should be small enough to retrieve a focused fact but large enough to carry the conditions that make the fact correct. Fixed token windows are simple and fast, while structure-aware or query-aware methods cost more; chunks that are too large dilute similarity and consume context, while tiny or heavily overlapping chunks lose meaning, duplicate evidence, and crowd out diverse results.',
    ],
    whyItMatters: 'Chunk boundaries define the evidence granularity available to the retriever and generator. They directly affect recall, ranking clarity, citation usefulness, context cost, and whether a returned sentence includes the qualifications needed for a faithful answer.',
    useCases: [
      'Splitting policy documents by section while keeping exceptions with their governing rule',
      'Indexing API documentation so each endpoint description retains its parameters and error codes',
      'Separating long meeting transcripts by speaker turn and topic boundary',
    ],
    workedExample: {
      scenario: 'A benefits guide contains a parental-leave rule followed by eligibility exceptions that fixed 200-token windows separate.',
      steps: [
        'Parse the guide into its heading hierarchy and identify the leave section, eligibility subsection, and exception list.',
        'Create chunks of at most 450 tokens that end on paragraph or list boundaries and prepend the section heading to each chunk.',
        'Add a 50-token overlap only where the eligibility paragraph continues into the exception list, then retain page and section metadata.',
        'Evaluate leave-related questions against 200-token fixed chunks and the structure-aware chunks.',
      ],
      result: 'The structure-aware version retrieves the rule with its exception for 18 of 20 test questions, compared with 12 of 20 for the fixed-window version, while using fewer duplicate chunks.',
    },
    interview: {
      prompt: 'Why is increasing chunk size not a guaranteed way to improve retrieval recall?',
      answer: 'A larger chunk contains more facts, but its embedding represents a broader mixture of topics, so a specific query can rank it lower. It also consumes more context and may bury the relevant sentence. I would choose boundaries and size with a labeled query set, then measure recall, precision, context cost, and boundary failures rather than optimizing size alone.',
    },
  },
  Embeddings: {
    explanation: [
      'In retrieval, an embedding model encodes queries and document chunks as dense vectors whose geometry approximates semantic relatedness. Unlike a transformer embedding table that maps token IDs inside a model, retrieval embeddings are persisted in an index and compared across independently encoded queries and documents, often with separate query and document instructions.',
      'Embeddings are useful when users and documents express the same idea with different words, but model choice must match language, domain, vector dimension, and supported similarity measure. Domain mismatch, truncation, inconsistent normalization, or changing the model for only one side can destroy ranking quality; a model upgrade normally requires evaluation and re-embedding the corpus.',
    ],
    whyItMatters: 'The embedding space determines which chunks can become candidates before any reranker or generator sees them. A semantically strong model improves paraphrase retrieval, while a poorly matched or inconsistently applied model creates an invisible ceiling on recall.',
    useCases: [
      'Matching a query for resetting credentials to an article titled Recover account access',
      'Finding semantically similar incident reports across different product teams',
      'Retrieving multilingual support content with a model evaluated on the supported languages',
    ],
    workedExample: {
      scenario: 'An English and Spanish support portal must retrieve the same password-recovery policy for equivalent questions in either language.',
      steps: [
        'Build 200 labeled bilingual queries and identify the relevant policy chunks for each query.',
        'Encode every chunk with a multilingual retrieval model using its document instruction, then encode queries with its query instruction.',
        'Normalize vectors as required by the model and compare cosine similarity using the same preprocessing for both languages.',
        'Measure recall at 10 by language and re-index the corpus only after the candidate model exceeds the current model on both sets.',
      ],
      code: {
        language: 'Text',
        code: `document vector = embed_document("Account recovery requires...")
query vector = embed_query("Como recupero mi cuenta?")
score = cosine(query vector, document vector)`,
      },
      result: 'The evaluated model raises Spanish recall at 10 from 0.68 to 0.89 without reducing English recall, so both query languages reliably surface the same approved policy.',
    },
    interview: {
      prompt: 'Can you change the query embedding model without rebuilding document embeddings?',
      answer: 'Usually no. Similarity is meaningful only when both vectors inhabit the compatible space and use the expected instructions and normalization. I would version the embedding configuration, evaluate the replacement, re-embed documents into a parallel index, and switch traffic only after query and document vectors are produced consistently.',
    },
  },
  Retrieval: {
    explanation: [
      'Retrieval converts a user request into a search query, applies mandatory scope filters, and returns a ranked candidate set from lexical, vector, or hybrid indexes. The retriever may rewrite the query, search several fields, merge candidates, and choose a top-k budget, but it should preserve scores, source IDs, and filter decisions for diagnosis.',
      'Use retrieval when the answer depends on private, changing, or corpus-specific facts that model parameters cannot reliably supply. Larger candidate sets can improve recall but add latency, reranking cost, and irrelevant context; retrieval quality must be measured against relevant evidence separately from generation quality, because a correct chunk can be retrieved even when the model writes a poor answer.',
    ],
    whyItMatters: 'Retrieval defines the evidence available to downstream generation. Separating its candidate and ranking metrics from answer metrics reveals whether a failure came from missing evidence, poor ordering, or incorrect use of good evidence.',
    useCases: [
      'Finding current refund-policy passages before answering a customer question',
      'Retrieving code examples and API constraints for an internal developer assistant',
      'Locating prior incident resolutions for an operations triage workflow',
    ],
    workedExample: {
      scenario: 'A travel assistant must answer whether a basic fare can be changed using the latest fare rules for the requested market.',
      steps: [
        'Extract the market, fare class, and travel date from the request and enforce them as structured filters.',
        'Run hybrid retrieval for change rules and collect the top 30 candidates with scores and source versions.',
        'Rerank the candidates and pass the top five eligible passages to generation with their rule IDs.',
        'Log whether the labeled rule was retrieved independently from whether the final answer was correct.',
      ],
      result: 'The relevant current rule appears at rank two and retrieval recall succeeds; a later wrong answer is therefore classified as a generation failure rather than a search failure.',
    },
    interview: {
      prompt: 'A RAG answer is wrong even though the correct passage appears in the prompt. What does that tell you?',
      answer: 'It tells me candidate retrieval and context recall succeeded for that case, but it does not prove the complete retrieval stage is ideal. I would inspect ranking and conflicting context, then evaluate generation for instruction following, claim support, and answer relevance. Keeping those measurements separate prevents tuning the index to fix a generation defect.',
    },
  },
  Reranking: {
    explanation: [
      'Reranking applies a more accurate scoring model to a manageable candidate set produced by first-stage retrieval. Cross-encoders jointly read the query and each chunk, while late-interaction or learned rankers trade some accuracy for throughput; the new scores reorder candidates before the final context budget is selected.',
      'Use reranking when inexpensive lexical or vector search has acceptable recall but weak ordering, especially for subtle constraints or near-duplicate chunks. It adds per-query latency and cost, and it cannot recover a relevant document absent from the candidate set; an undersized candidate pool, domain-mismatched ranker, or truncated chunk can make reranking look ineffective.',
    ],
    whyItMatters: 'Generation usually sees only a few passages, so moving the most relevant and constraint-compatible evidence to the top can improve context precision without sacrificing broad first-stage recall.',
    useCases: [
      'Prioritizing a policy exception over several broadly similar policy summaries',
      'Ordering code-search candidates by compatibility with a named framework version',
      'Reranking product results that satisfy nuanced natural-language requirements',
    ],
    workedExample: {
      scenario: 'Vector search for cancellation during a trial returns many cancellation pages, but the exact enterprise-trial exception ranks ninth.',
      steps: [
        'Retrieve 40 candidates with vector and lexical search so the exception remains in the candidate pool.',
        'Score each query-chunk pair with a cross-encoder trained for passage relevance.',
        'Keep the top four reranked passages that fit the context budget and record both original and reranked positions.',
        'Compare precision at four and latency against the no-reranker baseline on the policy golden set.',
      ],
      result: 'The enterprise-trial exception moves from rank nine to rank one, precision at four rises from 0.55 to 0.82, and p95 retrieval latency increases by 38 ms.',
    },
    interview: {
      prompt: 'Why should a reranker receive more candidates than the generator receives?',
      answer: 'The first-stage pool should be broad enough to preserve recall, while the generator context should be narrow enough to reduce noise and cost. A reranker can evaluate the larger pool with a stronger query-document interaction and select the few best passages. If the relevant passage never enters that pool, reranking cannot restore it.',
    },
  },
  'Grounded generation': {
    explanation: [
      'Grounded generation instructs a model to answer from supplied evidence, distinguish quoted facts from inference, cite source identifiers, and abstain when the context is insufficient. The prompt should delimit untrusted retrieved text from system instructions and preserve enough source metadata to connect each material claim to evidence.',
      'Use it when answers must reflect controlled or current sources, but grounding is not guaranteed merely because context is present. Conflicting passages, prompt injection inside documents, context overload, and model prior knowledge can produce unsupported claims; generation quality should be measured through faithfulness and answer relevance separately from retrieval recall and precision.',
    ],
    whyItMatters: 'Grounding turns retrieved passages into auditable answer constraints instead of optional inspiration. It reduces unsupported claims and gives users a way to inspect the source, while explicit abstention prevents missing evidence from being disguised as certainty.',
    useCases: [
      'Answering employee policy questions with section-level citations',
      'Summarizing a customer contract without inventing absent obligations',
      'Producing a support response from approved troubleshooting procedures only',
    ],
    workedExample: {
      scenario: 'A payroll assistant is asked whether unused leave is paid out, but the retrieved context contains rules for only two of three countries.',
      steps: [
        'Provide the top passages with country, policy version, and source ID in a clearly delimited evidence block.',
        'Instruct the model to answer each country only from matching evidence, cite every conclusion, and state when evidence is missing.',
        'Reject instructions embedded in retrieved documents and validate that returned citation IDs exist in the supplied context.',
        'Score the answer for claim support and relevance independently from the retrieval labels.',
      ],
      result: 'The response answers the two covered countries with valid citations and explicitly reports insufficient evidence for the third instead of generalizing a rule.',
    },
    interview: {
      prompt: 'What is the difference between retrieving relevant context and generating a grounded answer?',
      answer: 'Retrieval succeeds when the needed evidence is selected and ranked. Grounded generation succeeds when the answer uses that evidence correctly, avoids unsupported claims, resolves or exposes conflicts, and cites or abstains as required. Either stage can fail independently, so I would evaluate context metrics and answer metrics separately.',
    },
  },
  Freshness: {
    explanation: [
      'Freshness is the delay and consistency boundary between a source change and the searchable index. A robust design propagates creates, updates, and deletions with source versions or timestamps, rejects out-of-order events, and exposes index lag so retrieval can prefer the latest valid record or decline to answer during uncertainty.',
      'Streaming updates reduce staleness but add operational complexity, while scheduled rebuilds are simpler and can provide consistent snapshots at the cost of longer lag. Cache layers, failed deletion events, clock assumptions, and duplicate versions commonly return obsolete facts; define freshness targets by source and test tombstones as carefully as additions.',
    ],
    whyItMatters: 'A semantically relevant passage can still be wrong because it is obsolete. Freshness controls whether a RAG system reflects current prices, policies, inventory, or permissions and gives operators a measurable way to detect stale evidence.',
    useCases: [
      'Removing a recalled product notice from recommendations immediately after publication',
      'Updating incident runbooks within minutes of an approved edit',
      'Rebuilding a research index nightly when daily freshness is sufficient',
    ],
    workedExample: {
      scenario: 'A bank changes a transfer limit at noon and requires customer answers to reflect approved policies within ten minutes.',
      steps: [
        'Emit a change event containing the policy ID, monotonically increasing version, approval state, and source update time.',
        'Process the event idempotently, replace all chunks for the prior version, and invalidate query and answer caches referencing that policy.',
        'Record source-to-index lag and alert when the newest indexed version is more than ten minutes behind.',
        'Issue a canary query for the transfer limit and verify the returned chunk ID belongs to the new version.',
      ],
      result: 'Version 18 becomes searchable in four minutes, version 17 no longer appears, and the canary answer cites the new approved limit before the ten-minute objective expires.',
    },
    interview: {
      prompt: 'Why is polling for new documents insufficient for retrieval freshness?',
      answer: 'Freshness also includes updates, deletions, ordering, cache invalidation, and proving which source version is active. Polling can work, but it needs a watermark or reconciliation process, idempotent versioned writes, tombstone handling, lag monitoring, and tests that stale records disappear rather than merely adding new records.',
    },
  },
  'Golden dataset': {
    explanation: [
      'A retrieval golden dataset is a versioned set of representative queries with judged relevant documents or chunks, expected answer facts, and metadata such as tenant, locale, time, and difficulty. Judgments can be binary or graded and should include paraphrases, ambiguous requests, no-answer cases, and hard negatives that share vocabulary but not intent.',
      'Use the dataset to compare chunking, embeddings, indexes, filters, and prompts before release, while keeping a held-out portion to limit overfitting. Sparse or convenience-sampled labels can hide important traffic segments, and incomplete relevance judgments can falsely penalize useful results; review disagreements and refresh examples as content and user behavior change.',
    ],
    whyItMatters: 'A stable evidence set turns retrieval tuning into a measurable comparison instead of a collection of persuasive demos. It also supports stage-specific diagnosis by labeling relevant context separately from expected answer behavior.',
    useCases: [
      'Comparing two embedding models on real support-question paraphrases',
      'Testing that locale and product filters preserve relevant results',
      'Adding every confirmed production retrieval miss to a regression corpus',
    ],
    workedExample: {
      scenario: 'A developer assistant is being moved from fixed chunking to section-aware chunking, and the team needs evidence that the change helps across languages.',
      steps: [
        'Sample 600 consented queries across language, product, task, and frequency bands, then remove duplicates and sensitive text.',
        'Have domain reviewers label relevant chunks, expected facts, acceptable alternatives, and no-answer cases with adjudication for disagreements.',
        'Freeze 450 queries for tuning and 150 as a held-out set, versioning labels with the indexed documentation snapshot.',
        'Compare context recall, context precision, latency, and end-to-end success by segment before approving the change.',
      ],
      result: 'Section-aware chunking improves held-out recall at 10 from 0.76 to 0.84, with no language segment losing more than one percentage point and no filter violations.',
    },
    interview: {
      prompt: 'What makes a retrieval golden dataset more useful than a list of expected answers?',
      answer: 'It labels the evidence that should be retrieved as well as the answer outcome, so missing context can be separated from poor generation. It also captures query segments, authorization scope, source version, graded alternatives, hard negatives, and no-answer cases. That structure supports diagnosis and prevents aggregate gains from hiding regressions.',
    },
  },
  'Context recall': {
    explanation: [
      'Context recall measures how much of the relevant evidence for a query appears in the retrieved context. With complete document judgments it can be computed as relevant items retrieved divided by all relevant items, while claim-based evaluation asks whether the retrieved passages contain the facts required for the expected answer.',
      'Use recall to diagnose missing evidence before generation, especially when one answer requires several independent facts. Increasing top-k often raises recall but also latency and noise, and the metric depends on label completeness; high recall does not mean the ranking is concise, authorized, current, or used faithfully by the generator.',
    ],
    whyItMatters: 'A generator cannot cite a required fact that retrieval omitted. Context recall provides a direct retrieval-quality signal and prevents unsupported answers from being blamed on the model when the necessary evidence never reached it.',
    useCases: [
      'Checking that a comparison query retrieves specifications for both products',
      'Measuring whether all clauses needed for a compliance answer reach the prompt',
      'Choosing candidate depth before reranking a multi-hop research query',
    ],
    workedExample: {
      scenario: 'An onboarding question requires the identity-verification rule, the allowed-document list, and the processing-time rule from three labeled chunks.',
      steps: [
        'Run the query and collect the five chunks that will be supplied to generation.',
        'Match retrieved chunk IDs against the three relevant IDs in the golden dataset.',
        'Count two relevant chunks retrieved and one omitted, then calculate recall as two divided by three.',
        'Inspect the missing processing-time chunk and test a query rewrite and larger candidate pool.',
      ],
      code: {
        language: 'Text',
        code: `context recall = relevant retrieved / all relevant
               = 2 / 3
               = 0.67`,
      },
      result: 'The baseline recall is 0.67; adding the product name during query rewriting retrieves the missing chunk and raises recall to 1.00 for this case.',
    },
    interview: {
      prompt: 'Can a system have context recall of 1.0 and still produce a bad answer?',
      answer: 'Yes. All required evidence may be present but surrounded by irrelevant or conflicting passages, ranked poorly, stale, or ignored by the model. Recall evaluates evidence coverage, not precision, authorization, faithfulness, or answer relevance. I would inspect those metrics before deciding which stage to change.',
    },
  },
  'Context precision': {
    explanation: [
      'Context precision measures how much retrieved context is relevant and, in ranking-aware forms, rewards placing relevant evidence before irrelevant evidence. A simple calculation divides relevant retrieved items by all retrieved items, while average-precision-style measures capture the positions at which useful chunks occur.',
      'Use precision to control distraction, token cost, and the chance that generation follows a plausible but unrelated passage. Reducing top-k or tightening filters can improve precision while losing recall, and incomplete judgments can label valid alternatives as noise; evaluate precision with recall and inspect results by rank rather than optimizing one aggregate number.',
    ],
    whyItMatters: 'Focused context makes it easier for a model to identify the governing evidence and leaves room for diverse required facts. Precision is a retrieval metric, so it reveals context noise without confusing that noise with unsupported generation.',
    useCases: [
      'Comparing vector-only and reranked results within a fixed five-chunk context budget',
      'Detecting duplicate chunks that crowd out distinct supporting evidence',
      'Tuning metadata filters for a product-specific troubleshooting assistant',
    ],
    workedExample: {
      scenario: 'A billing query retrieves five chunks, but only the first and fourth chunks address prorated annual-plan refunds.',
      steps: [
        'Label each retrieved chunk against the golden relevance judgments for the query.',
        'Calculate simple precision as two relevant chunks divided by five retrieved chunks.',
        'Apply a reranker to the same 30-candidate pool and select a new top five.',
        'Compare precision and verify that the required refund chunk remains present so recall does not regress.',
      ],
      code: {
        language: 'Text',
        code: `context precision = relevant retrieved / retrieved
                  = 2 / 5
                  = 0.40`,
      },
      result: 'Reranking places three relevant chunks in the top five, increasing precision from 0.40 to 0.60 while preserving recall of the required refund rule.',
    },
    interview: {
      prompt: 'Why not maximize context precision by returning only one chunk?',
      answer: 'One highly relevant chunk can give excellent precision while omitting other facts required for the answer. The correct context budget balances precision and recall for the task. I would evaluate both against labeled evidence, use reranking or deduplication to remove noise, and verify end-to-end results rather than minimizing top-k blindly.',
    },
  },
  Faithfulness: {
    explanation: [
      'Faithfulness measures whether each factual claim in a generated answer is supported by the supplied context, without rewarding claims merely because they happen to be true elsewhere. Evaluation typically extracts answer claims, matches each claim to evidence, and treats unsupported additions, contradictions, and overstated certainty as failures.',
      'Use faithfulness to evaluate generation after retrieval has produced a fixed context. It does not measure whether the context contains all needed facts or whether the answer addresses the question, and automated judges can miss subtle qualifiers; combine calibrated model-based scoring with citation validation and human review for high-risk domains.',
    ],
    whyItMatters: 'A RAG system earns trust by limiting claims to auditable evidence. Faithfulness isolates generation behavior so a team can fix prompting, context conflicts, or abstention without masking a separate retrieval-recall problem.',
    useCases: [
      'Checking that a benefits answer does not invent an eligibility exception',
      'Verifying that a contract summary preserves dates and monetary limits',
      'Evaluating whether support responses follow only approved troubleshooting steps',
    ],
    workedExample: {
      scenario: 'Retrieved policy text states that refunds take five to seven business days, but the answer promises completion within five days.',
      steps: [
        'Split the answer into the claims that a refund is available and that completion occurs within five days.',
        'Map each claim to the retrieved policy and retain the qualifiers business days and five to seven.',
        'Mark the availability claim supported and the timing promise unsupported because it narrows the documented range.',
        'Revise the generation instruction to preserve ranges and rerun the same fixed-context test.',
      ],
      result: 'The revised answer states five to seven business days and cites the policy, raising supported claims from one of two to two of two without changing retrieval.',
    },
    interview: {
      prompt: 'If an answer contains a true fact that is absent from the retrieved context, is it faithful?',
      answer: 'Not under a context-grounded faithfulness definition. The claim may be factually correct, but the system cannot attribute it to the supplied evidence. I would mark it unsupported, then decide whether the product permits model knowledge, should retrieve additional evidence, or should omit the claim.',
    },
  },
  'Answer relevance': {
    explanation: [
      'Answer relevance measures how directly and completely a response addresses the user request, including requested scope, format, and level of detail. It can be judged against intent labels, expected facts, or question-answer similarity, but should penalize evasive, tangential, repetitive, or incomplete responses even when every statement is supported.',
      'Use it as a generation-quality measure alongside faithfulness: an answer can be fully supported yet discuss the wrong policy, or directly answer while inventing facts. Vague prompts and subjective verbosity preferences make scoring noisy, so define task-specific rubrics, evaluate key user segments, and avoid using lexical overlap as the only signal.',
    ],
    whyItMatters: 'Grounded text still fails users when it does not resolve the requested task. Answer relevance keeps evaluation tied to user intent while remaining distinct from evidence retrieval and claim support.',
    useCases: [
      'Checking that a comparison answer covers every product named by the user',
      'Penalizing a support response that repeats documentation without giving the requested next action',
      'Verifying that a concise-answer request does not produce a long background essay',
    ],
    workedExample: {
      scenario: 'A user asks how to cancel an annual plan and whether a refund is available, but the response explains cancellation only.',
      steps: [
        'Represent the request as two required intents: cancellation procedure and refund eligibility.',
        'Check the answer against both intents and score the first covered and the second missing.',
        'Confirm that the retrieved context contains both the procedure and refund rule, isolating the omission to generation.',
        'Add an instruction to enumerate and answer each user question, then rerun the fixed example.',
      ],
      result: 'The revised response gives the cancellation steps and the conditional refund rule in two short sections, covering both required intents with the same faithful evidence.',
    },
    interview: {
      prompt: 'How can an answer be faithful but irrelevant?',
      answer: 'Every claim can be supported by context while the response addresses a neighboring topic, omits part of a multi-part question, or gives unusable detail. Faithfulness tests support; relevance tests alignment with user intent. I would score both and diagnose retrieval separately so one metric cannot hide another failure.',
    },
  },
  'End-to-end success': {
    explanation: [
      'End-to-end success measures whether the complete RAG workflow produces the required user or business outcome under realistic conditions. A rubric may combine correct scope, current and authorized evidence, factual support, task completion, latency, citation validity, and appropriate abstention, with hard failure rules for security or harmful actions.',
      'Use it as the release-level metric, then retain stage metrics to explain movement: retrieval recall and precision describe evidence selection, while faithfulness and answer relevance describe generation. Aggregate scores alone can hide rare security failures or segment regressions, and offline success may not predict user behavior, so slice results and confirm them with controlled online outcomes.',
    ],
    whyItMatters: 'Users experience one system rather than separate retrievers and generators. End-to-end measurement catches interactions between stages while stage-level measures preserve the ability to identify and fix the responsible component.',
    useCases: [
      'Measuring whether a support assistant resolves cases without an agent handoff',
      'Validating a policy assistant before a new corpus and prompt are released together',
      'Comparing RAG configurations under correctness, latency, cost, and authorization constraints',
    ],
    workedExample: {
      scenario: 'A returns assistant must identify eligibility, provide the correct action, cite the active policy, and respond within two seconds.',
      steps: [
        'Run 500 held-out requests with fixed source snapshots and authenticated tenant and region metadata.',
        'Score retrieval evidence, answer faithfulness, intent coverage, citation validity, p95 latency, and any authorization violation.',
        'Define success as all required answer checks passing within latency, with any cross-tenant result counted as an automatic failure.',
        'Slice failures by region and inspect stage metrics to assign each miss to ingestion, retrieval, or generation.',
      ],
      result: 'The candidate reaches 91 percent end-to-end success and 1.6-second p95 latency, but a region-specific retrieval recall drop blocks release until its missing policy mapping is fixed.',
    },
    interview: {
      prompt: 'Why keep component metrics if end-to-end success is the product goal?',
      answer: 'The end-to-end metric tells me whether users succeed, but not why they fail. Context recall can expose missing evidence, precision can expose noise, and faithfulness can expose unsupported generation. I would use end-to-end success as the gate and component metrics for diagnosis, while treating security violations as hard failures rather than averaging them away.',
    },
  },
  'Regression suite': {
    explanation: [
      'A RAG regression suite repeatedly runs versioned queries against controlled source snapshots and records retrieval, generation, security, latency, and cost outcomes. It should include common traffic, prior production failures, boundary cases, no-answer requests, deletion and freshness cases, and adversarial attempts to bypass filters or follow instructions from retrieved text.',
      'Run deterministic retrieval checks in continuous integration and schedule model-based or stochastic generation evaluations with repeated samples and bounded thresholds. Exact answer matching is brittle, while permissive semantic judges can miss changed numbers or qualifiers; version prompts, models, indexes, judges, and datasets so a failure can be reproduced and attributed.',
    ],
    whyItMatters: 'RAG behavior can regress when any of several independently changing components moves. A layered suite catches known failures before release and shows whether a change affects retrieval evidence, generated answers, security, or operating limits.',
    useCases: [
      'Blocking an embedding-model upgrade that lowers recall for one language',
      'Replaying production hallucinations after a grounding-prompt change',
      'Testing that deleted and cross-tenant documents never appear in results',
    ],
    workedExample: {
      scenario: 'A team wants to upgrade its embedding model and prompt in one release without losing policy accuracy or tenant isolation.',
      steps: [
        'Pin the corpus snapshot and run deterministic assertions for relevant chunk IDs, forbidden tenant IDs, and deleted versions.',
        'Generate three answer samples per query and score faithfulness, relevance, citation validity, latency, and token use.',
        'Compare results by language and task against the approved baseline, failing on hard security checks or threshold regressions.',
        'Store configuration hashes and failing traces so each changed stage can be replayed independently.',
      ],
      code: {
        language: 'Text',
        code: `gate:
  context_recall_at_10 >= baseline - 0.01
  faithfulness >= 0.95
  cross_tenant_results == 0
  p95_latency_ms <= 1800`,
      },
      result: 'The suite blocks the release because Japanese recall drops by six points, while proving that faithfulness, latency, and all 2,000 tenant-isolation assertions remain within bounds.',
    },
    interview: {
      prompt: 'What would you include in a RAG regression suite beyond final answer correctness?',
      answer: 'I would assert ingestion versions and deletions, relevant and forbidden retrieved IDs, recall and precision, filter enforcement, faithfulness, relevance, citation validity, abstention, latency, and cost. I would segment results, replay known incidents, pin every changing component, and use hard gates for authorization rather than relying on averages.',
    },
  },
  'Vector representations': {
    explanation: [
      'A vector representation expresses an item as numeric features that a search system can compare. Dense vectors distribute semantic information across learned dimensions, sparse vectors retain explicit weighted terms, and multi-vector representations preserve several token- or section-level signals instead of compressing an entire item into one point.',
      'Choose a representation according to query behavior, corpus language, memory limits, and the need for exact terms or semantic paraphrases. Dense vectors can miss identifiers and rare names, sparse vectors can miss synonymy, and large or multi-vector encodings increase storage and search cost; dimension reduction and quantization save space but can reduce neighbor quality.',
    ],
    whyItMatters: 'The representation decides which distinctions the index can preserve and which similarities it can expose. Understanding its information and storage tradeoffs is necessary before tuning the search algorithm around it.',
    useCases: [
      'Using dense vectors for natural-language paraphrase search over support articles',
      'Using sparse term weights for error codes and exact product identifiers',
      'Using multi-vector document representations for fine-grained legal passage matching',
    ],
    workedExample: {
      scenario: 'A parts catalog receives descriptive queries such as quiet cooling fan and exact queries such as SKU AX-4412.',
      steps: [
        'Create a dense vector from each product description and a sparse representation from names, SKUs, and technical terms.',
        'Normalize the fields according to their scoring methods and store both representations under the same product ID.',
        'Run labeled semantic and exact-identifier queries against dense-only, sparse-only, and combined candidates.',
        'Select the combined representation only if the recall gain justifies its additional index memory and query cost.',
      ],
      result: 'Dense search retrieves paraphrased product descriptions, sparse search returns AX-4412 at rank one, and the combined setup reaches 0.94 recall at 10 across both query classes versus 0.78 for dense-only search.',
    },
    interview: {
      prompt: 'Why can two embeddings with the same number of dimensions be incompatible?',
      answer: 'Dimension count describes shape, not meaning. Different models learn different coordinate spaces, training objectives, instructions, and normalization assumptions. Their coordinates cannot normally be compared directly. I would keep representation metadata with the index and ensure queries and documents use a compatible versioned encoder.',
    },
  },
  'Similarity measures': {
    explanation: [
      'A similarity measure converts a query vector and candidate vector into a ranking score. Cosine similarity compares direction, dot product includes direction and magnitude, and Euclidean distance measures geometric separation; for unit-normalized vectors these rankings are closely related, but otherwise magnitude can materially change the order.',
      'Use the metric recommended by the embedding model and configure index construction and querying consistently. Normalizing only one side, treating distance as similarity, or changing metrics after indexing can invert or degrade rankings, while score values are not generally calibrated probabilities and should not be compared across models without evaluation.',
    ],
    whyItMatters: 'Even strong embeddings fail when the search engine compares them with incompatible geometry. The chosen measure also affects threshold behavior, index support, and how engineers interpret scores during tuning.',
    useCases: [
      'Using cosine similarity for a model trained and evaluated on normalized semantic direction',
      'Using dot product when vector magnitude intentionally carries relevance information',
      'Setting an abstention threshold from labeled score distributions rather than intuition',
    ],
    workedExample: {
      scenario: 'A document search migration changes from cosine similarity to raw dot product and suddenly favors long, high-norm document vectors.',
      steps: [
        'Inspect the embedding-model guidance and confirm that evaluation assumed unit-normalized vectors with cosine similarity.',
        'Normalize both query and document vectors and rebuild the index using the matching metric.',
        'Replay the golden dataset and compare rank order, recall, and score distributions before and after the correction.',
        'Derive any acceptance threshold from labeled positives and hard negatives under the corrected configuration.',
      ],
      code: {
        language: 'Text',
        code: `cosine(q, d) = dot(q, d) / (norm(q) * norm(d))
distance ranking: smaller is better
similarity ranking: larger is better`,
      },
      result: 'The corrected cosine index restores recall at 10 from 0.71 to 0.87 and removes the systematic preference for unrelated high-norm chunks.',
    },
    interview: {
      prompt: 'When do cosine similarity and dot product produce the same ranking?',
      answer: 'They produce the same ranking when all compared query and document vectors are normalized to the same norm, commonly unit length. Without that condition, dot product also reflects magnitude. I would follow the model contract and verify the full indexing and query path rather than assuming the metrics are interchangeable.',
    },
  },
  'Approximate nearest neighbors': {
    explanation: [
      'Approximate nearest-neighbor search avoids comparing a query with every vector by exploring a restricted candidate structure. Graph indexes such as HNSW traverse connected neighbors, while inverted-file methods search selected clusters and may compress vectors; build and query parameters trade memory, indexing time, latency, and recall.',
      'Use ANN when exact search cannot meet corpus-scale latency or cost targets. Low exploration settings can miss the true neighbors, aggressive compression can distort distances, and incremental updates may degrade layout or create tombstone overhead; measure ANN recall against exact neighbors on representative queries and include filter selectivity in the test.',
    ],
    whyItMatters: 'ANN makes millisecond vector retrieval practical at large scale, but its speed comes from accepting a controlled probability of missed candidates. That approximation must be treated as a measurable retrieval tradeoff rather than an invisible implementation detail.',
    useCases: [
      'Searching tens of millions of support chunks under an interactive latency target',
      'Tuning HNSW exploration for a high-recall legal discovery workflow',
      'Using vector compression for a catalog that cannot fit full vectors in memory',
    ],
    workedExample: {
      scenario: 'Exact search over 25 million chunks takes 1.8 seconds, while the assistant requires retrieval under 120 ms.',
      steps: [
        'Select 5,000 representative queries and record their exact top-10 neighbors as the evaluation reference.',
        'Build an HNSW index and sweep the query exploration parameter across latency and ANN recall at 10.',
        'Repeat the sweep with realistic metadata filters and concurrent load rather than isolated unfiltered queries.',
        'Choose the lowest setting that meets both the recall floor and p95 latency objective, then monitor drift after updates.',
      ],
      result: 'An exploration setting of 96 achieves 0.97 ANN recall at 10 with 84 ms p95 latency, while the faster setting of 32 misses the 0.95 recall requirement.',
    },
    interview: {
      prompt: 'How would you evaluate an approximate nearest-neighbor index?',
      answer: 'I would compare its returned neighbors with exact search on representative vectors, reporting ANN recall at k alongside p50 and p95 latency, throughput, memory, build time, and update behavior. I would also test real filter selectivity and concurrency because settings that work on unfiltered samples may fail in production.',
    },
  },
  'Index selection': {
    explanation: [
      'Index selection matches a search structure to corpus size, update pattern, filter behavior, latency, memory, and recall requirements. Exact flat indexes favor correctness at smaller scale, graph indexes favor low-latency high-recall search with substantial memory, and inverted-file or quantized indexes favor large compressed collections with tunable probing.',
      'Choose from measured workload evidence rather than corpus size alone: frequent deletes, restrictive filters, multi-region replication, and rebuild windows can dominate theoretical search speed. A highly tuned index may fail operationally through long builds, memory exhaustion, poor filtered recall, or update degradation, so benchmark lifecycle operations as well as steady-state queries.',
    ],
    whyItMatters: 'The index determines whether the chosen vector representation can be searched within real reliability and cost limits. A good algorithm on paper is a poor production choice if it cannot satisfy updates, filtering, recovery, or capacity constraints.',
    useCases: [
      'Keeping exact search for a small high-value corpus that changes every minute',
      'Selecting HNSW for a read-heavy corpus with enough memory for graph overhead',
      'Selecting a compressed inverted-file index for hundreds of millions of mostly stable vectors',
    ],
    workedExample: {
      scenario: 'A knowledge base will grow from 800,000 to 15 million chunks, receives hourly updates, and must support region and product filters.',
      steps: [
        'Define recall at 10, 100 ms p95 latency, update visibility, memory, and recovery-time targets using production filter distributions.',
        'Benchmark flat, HNSW, and compressed inverted-file indexes on the current corpus and a synthetic 15-million-vector projection.',
        'Measure filtered query recall, concurrent throughput, incremental writes, deletion cleanup, build duration, and replica recovery.',
        'Select the configuration that meets all hard targets at projected scale and document the threshold that triggers reevaluation.',
      ],
      result: 'HNSW meets 0.96 recall and 72 ms p95 at projected scale within the memory budget, while the compressed index saves memory but misses the filtered-recall floor for rare products.',
    },
    interview: {
      prompt: 'What information would you gather before choosing a vector index?',
      answer: 'I would gather corpus size and growth, dimensions, metric, query rate, latency and recall targets, update and delete frequency, filter selectivity, memory and storage limits, build and recovery windows, and concurrency. Then I would benchmark candidate indexes on representative data because those constraints interact in implementation-specific ways.',
    },
  },
  'Metadata filtering': {
    explanation: [
      'Metadata filtering restricts retrieval candidates using structured fields such as tenant, document state, region, product, language, effective date, or access group. Security predicates must be derived from trusted server-side identity and enforced inside or before retrieval; user-provided filters may narrow authorized scope but must never widen it.',
      'Pre-filtering is secure and efficient when the index can search well inside a selective subset, while post-filtering may return too few results and is unsafe if forbidden records leave the trusted boundary. Missing fields, type mismatches, stale permissions, and fail-open query builders are common failures; validate schemas, default to deny, and test both result IDs and counts under restrictive filters.',
    ],
    whyItMatters: 'Semantic similarity does not understand authorization or business eligibility. Correct filtering prevents plausible but forbidden or obsolete vectors from becoming candidates and makes retrieval both safer and more precise.',
    useCases: [
      'Restricting policy retrieval to the authenticated user region and employment type',
      'Searching only published product documentation effective on the request date',
      'Applying account access groups before retrieving private project notes',
    ],
    workedExample: {
      scenario: 'A healthcare assistant searches clinical guidance shared across facilities, but each user may access only assigned facilities and currently approved documents.',
      steps: [
        'Resolve facility IDs from the authenticated session on the server and ignore any client request to add a facility.',
        'Build a mandatory pre-filter requiring an allowed facility, approved status, and an effective date covering today.',
        'Run vector search only within that filtered scope and reject records with missing authorization metadata during ingestion.',
        'Test allowed, denied, empty-scope, and stale-permission cases while asserting that no forbidden document ID is returned.',
      ],
      code: {
        language: 'SQL',
        code: `WHERE facility_id = ANY(:authorized_facility_ids)
  AND status = 'approved'
  AND effective_from <= :today
  AND (effective_to IS NULL OR effective_to > :today)`,
      },
      result: 'An authorized clinician retrieves the active guidance for two assigned facilities, while requests with an empty or forged facility scope return zero candidates rather than falling back to global search.',
    },
    interview: {
      prompt: 'Why is filtering retrieved results after vector search risky for authorization?',
      answer: 'Forbidden records may already have influenced ranking, logs, caches, rerankers, or model context, and post-filtering can leave too few authorized results. I would derive a mandatory filter from trusted identity and enforce it at the earliest supported retrieval boundary, default to deny on missing metadata, and test that forbidden IDs never leave that boundary.',
    },
  },
  'Hybrid search': {
    explanation: [
      'Hybrid search combines lexical retrieval, which is strong for exact terms and rare identifiers, with vector retrieval, which is strong for semantic paraphrases. Candidate lists can be merged with reciprocal rank fusion, normalized weighted scores, or a learned ranker, followed by deduplication and optional reranking.',
      'Use hybrid search when traffic mixes natural-language intent with names, codes, citations, or version strings. Fusion adds latency and tuning surface, score scales from different retrievers are not directly comparable, and a dominant branch can suppress useful candidates; evaluate query classes separately and prefer rank-based fusion when score calibration is unstable.',
    ],
    whyItMatters: 'Real queries often contain both meaning and exact anchors. Hybrid search gives the system two complementary ways to find evidence and reduces the chance that one representation creates a blind spot.',
    useCases: [
      'Finding an error code together with semantically related troubleshooting guidance',
      'Searching legal clauses by citation number or plain-language description',
      'Retrieving products from both exact model numbers and descriptive requirements',
    ],
    workedExample: {
      scenario: 'A developer asks why SDK error AUTH-104 occurs after token renewal, and dense search retrieves general authentication articles but misses the exact error page.',
      steps: [
        'Run lexical search for AUTH-104 and token renewal while vector search encodes the complete natural-language query.',
        'Collect the top 30 candidates from each branch and merge them with reciprocal rank fusion.',
        'Deduplicate by canonical document and rerank the top 20 against the full query.',
        'Compare exact-code and paraphrase query segments with each single retriever and the hybrid pipeline.',
      ],
      code: {
        language: 'Text',
        code: `RRF(document) = sum(1 / (60 + rank_in_list))`,
      },
      result: 'The AUTH-104 page moves to rank one while a semantically relevant token-renewal guide remains at rank two, raising recall at five for mixed queries from 0.74 to 0.91.',
    },
    interview: {
      prompt: 'Why not simply add lexical and vector similarity scores together?',
      answer: 'The scores can have different ranges, distributions, and meanings, so direct addition lets one retriever dominate arbitrarily. I would calibrate scores on labeled data or use rank-based fusion such as reciprocal rank fusion, then evaluate exact-term and semantic query segments before adding a reranker.',
    },
  },
  'Tenant isolation': {
    explanation: [
      'In a RAG system, tenant isolation ensures that vector candidates, metadata, caches, reranking inputs, context, citations, and logs remain within the authenticated tenant boundary. Enforce tenant scope from trusted identity through a mandatory pre-filter or physically separate index, and bind every chunk to a validated tenant ID during ingestion.',
      'Shared indexes reduce operational cost, while per-tenant indexes offer a stronger boundary at the cost of many deployments and uneven capacity. Vector similarity is never an authorization check: missing metadata, namespace fallbacks, stale cache keys, and post-filtering can leak data; default to no results, partition cache keys, and run adversarial cross-tenant tests on every retrieval path.',
    ],
    whyItMatters: 'A single cross-tenant chunk is a security incident even when the final prose hides it. Isolation must therefore be a hard retrieval invariant, not an average quality metric or a prompt instruction.',
    useCases: [
      'Serving a multi-tenant support assistant from a shared vector index with mandatory tenant filters',
      'Giving a regulated tenant a dedicated index and encryption boundary',
      'Preventing cached retrieval results from being reused across organization sessions',
    ],
    workedExample: {
      scenario: 'Two accounting firms use the same RAG service, and both have documents titled Q4 tax strategy with highly similar content.',
      steps: [
        'Resolve the tenant ID from the verified access token and attach it to the server-side retrieval request, cache key, and trace.',
        'Query a shared index with a mandatory tenant pre-filter, rejecting any indexed chunk that lacks a tenant ID.',
        'Verify returned tenant IDs before reranking and again before constructing model context, failing closed on any mismatch.',
        'Run paired adversarial tests using identical queries and forged client tenant parameters for both firms.',
      ],
      code: {
        language: 'Text',
        code: `authorized_tenant = verified_token.tenant_id
filter = tenant_id == authorized_tenant
cache_key = authorized_tenant + ":" + normalized_query`,
      },
      result: 'Each firm retrieves only its own Q4 strategy, forged tenant parameters are ignored, empty scopes return no candidates, and 10,000 cross-tenant assertions produce zero leaked chunk IDs.',
    },
    interview: {
      prompt: 'Is adding a tenant ID filter to the vector query sufficient for tenant isolation?',
      answer: 'It is necessary in a shared index but not sufficient alone. The tenant must come from trusted identity, ingestion must require correct metadata, the query must fail closed, and caches, rerankers, context, citations, and logs must preserve the same scope. I would validate returned IDs and continuously test forged, missing, stale, and cross-tenant cases.',
    },
  },
  'Query transformation': {
    explanation: [
      'Query transformation turns a conversational request into one or more retrieval queries that better match the corpus. Rewriting removes conversational noise and resolves references, controlled expansion adds synonyms, acronyms, and exact terminology, decomposition separates independent or multi-hop information needs, and multi-query retrieval searches complementary formulations before merging their candidates.',
      'Every transformation must preserve the original intent, entities, negation, dates, exact identifiers, and mandatory scope filters. Authorization and business filters should remain trusted structured predicates attached to every branch rather than text the model may rewrite; cap query fan-out, trace each variant to its source intent, and treat generated terms as search hints rather than new facts.',
    ],
    whyItMatters: 'User wording rarely matches every useful source, but unconstrained rewriting can silently answer a neighboring question or search an unauthorized scope. Disciplined transformation improves recall while keeping the retrieval operation faithful, testable, and bounded.',
    useCases: [
      'Expanding password reset into account recovery while retaining an exact product and locale filter',
      'Decomposing a comparison request into one specification query per named product',
      'Issuing lexical and semantic variants for an error code plus its natural-language symptom',
    ],
    workedExample: {
      scenario: 'An Acme employee asks whether an EU Enterprise subscription can move from annual to monthly billing at renewal without a fee.',
      steps: [
        'Extract the two answer intents, billing-cadence eligibility and change fees, while deriving tenant, EU region, Enterprise plan, and effective date from trusted request data.',
        'Rewrite the conversational request as change annual billing to monthly at renewal and expand it with controlled corpus terms such as billing frequency and renewal cadence.',
        'Decompose the request into an eligibility query and a fee query, then issue exact-term and semantic variants with the identical immutable filter envelope.',
        'Fuse the candidate lists, deduplicate canonical policy versions, and retain query-to-result lineage so gains and intent drift can be evaluated.',
      ],
      code: {
        language: 'Text',
        code: `filters = tenant:"acme" AND region:"EU" AND plan:"enterprise"
q1 = "change annual billing to monthly at renewal"
q2 = "enterprise renewal billing cadence eligibility"
q3 = "fees for changing billing frequency at renewal"`,
      },
      result: 'The original query retrieves only a generic billing page, while the transformed set retrieves the current EU cadence rule and its no-fee exception in the top five without searching outside Acme or Enterprise content.',
    },
    interview: {
      prompt: 'How can multi-query retrieval improve recall without changing the meaning or scope of the request?',
      answer: 'I would first freeze trusted filters and a structured statement of intent, then generate a small set of variants that cover known vocabulary or subquestions. Every variant receives the same filters, candidates are fused and deduplicated, and traces preserve which variant found each result. I would test recall gains alongside intent-drift, forbidden-result, latency, and duplicate-rate checks.',
    },
  },
  'Context construction': {
    explanation: [
      'Context construction converts retrieved candidates into the bounded evidence package supplied to generation. It selects passages for relevance and coverage, removes exact and near duplicates, preserves source and version boundaries, and orders evidence so governing rules, exceptions, and supporting details remain easy to associate with the right source.',
      'The builder must budget tokens across instructions, the user request, evidence, and the expected answer instead of filling the entire window with top-ranked chunks. Selection should favor distinct required facts over repeated high scores, truncate only at semantic boundaries, label every passage independently, and avoid merging text from different documents in ways that obscure provenance or let untrusted source text look like instructions.',
    ],
    whyItMatters: 'Retrieval can find the right evidence and still fail if context assembly drops it, repeats one source, separates an exception from its rule, or exhausts the token budget. Deliberate construction improves evidence coverage, citation integrity, and the model ability to distinguish sources and instructions.',
    useCases: [
      'Packing policy rules and regional exceptions into a fixed prompt budget without duplicate versions',
      'Building a comparison context that reserves evidence space for every product named by the user',
      'Separating untrusted retrieved documents into labeled source blocks for grounded generation',
    ],
    workedExample: {
      scenario: 'A compliance assistant must explain a general retention rule and an EU exception from 18 reranked chunks inside an 8,000-token context window.',
      steps: [
        'Reserve 700 tokens for system instructions and the request plus 1,500 for the answer, leaving at most 5,800 tokens for evidence.',
        'Select the active governing policy, the EU exception, and the definition each relies on, then remove repeated excerpts and superseded versions by canonical source and semantic similarity.',
        'Order the definition first, the governing rule second, and the linked exception immediately after it rather than blindly preserving score order.',
        'Emit each passage as a separate block with source ID, section, version, and effective date, trimming at paragraph boundaries if the evidence exceeds its budget.',
      ],
      code: {
        language: 'Text',
        code: `[source=policy-17 section=definitions version=4]
...
[source=policy-17 section=retention-rule version=4]
...
[source=eu-addendum-3 section=exception version=2]
...`,
      },
      result: 'The final evidence uses 4,920 tokens, removes seven duplicate or obsolete chunks, keeps the exception adjacent to its governing rule, and preserves unambiguous citation boundaries for all three selected sources.',
    },
    interview: {
      prompt: 'Why is taking the highest-scoring chunks until the token window is full a weak context-construction strategy?',
      answer: 'Scores do not account for duplicate passages, coverage of separate answer requirements, source conflicts, or the space needed for instructions and output. I would reserve a budget first, select for relevance plus marginal coverage, deduplicate by canonical source and meaning, keep related rules and exceptions together, and preserve labeled source boundaries so citations and trust rules remain enforceable.',
    },
  },
  'Ranking metrics': {
    explanation: [
      'Precision at k is the fraction of the first k results that are relevant, while recall at k is the fraction of all judged relevant items found in those k results. Mean reciprocal rank averages the reciprocal rank of the first relevant result across queries, so it emphasizes finding one answer early; normalized discounted cumulative gain uses graded relevance, discounts lower ranks, and divides by the ideal ordering for a score between zero and one.',
      'Choose metrics that match the product task and report them at an explicit k. Precision and recall need reliable relevance judgments, MRR fits lookup tasks but ignores later relevant results, and nDCG captures ordering among several graded results; incomplete labels, averages across unlike query classes, and changing candidate pools can make apparently precise comparisons misleading.',
    ],
    whyItMatters: 'Ranking metrics distinguish evidence coverage from ordering quality. They show whether a retriever needs broader candidates, cleaner top results, or better ordering, which prevents a team from increasing context size when the real problem is that useful evidence ranks too low.',
    useCases: [
      'Comparing candidate retrievers with recall at 20 before applying a reranker',
      'Measuring whether an FAQ search places one definitive answer first with MRR',
      'Evaluating graded legal-search results with nDCG when primary authority should outrank commentary',
    ],
    workedExample: {
      scenario: 'A search evaluation has four judged relevant documents with grades 3, 2, 1, and 1, while the returned top-five grades are 0, 3, 0, 2, and 1.',
      steps: [
        'Treat every positive grade as relevant: three of five returned documents are relevant, so precision at 5 is 3 divided by 5, or 0.60, and recall at 5 is 3 divided by 4, or 0.75.',
        'The first relevant result is at rank two, so this query contributes a reciprocal rank of 1 divided by 2, or 0.50, to MRR.',
        'Using gain 2 to the power of relevance minus 1 and logarithmic rank discount, calculate DCG at 5 as 6.10 for the returned order.',
        'Sort the judgments as 3, 2, 1, 1, and 0 to get an ideal DCG of 9.82, then divide 6.10 by 9.82 for nDCG at 5 of 0.62.',
      ],
      code: {
        language: 'Text',
        code: `P@5 = 3 / 5 = 0.60
R@5 = 3 / 4 = 0.75
RR = 1 / 2 = 0.50
DCG@5 = 7/log2(3) + 3/log2(5) + 1/log2(6) = 6.10
IDCG@5 = 7 + 3/log2(3) + 1/log2(4) + 1/log2(5) = 9.82
nDCG@5 = 6.10 / 9.82 = 0.62`,
      },
      result: 'The retriever finds three quarters of the relevant set, but MRR of 0.50 and nDCG at 5 of 0.62 expose weak ordering; reranking is a more targeted next experiment than simply increasing k.',
    },
    interview: {
      prompt: 'When would you choose recall at k, MRR, or nDCG to evaluate a retriever?',
      answer: 'I would use recall at k when a downstream stage needs every relevant candidate, MRR when success depends mainly on the first correct result, and nDCG when several results have different usefulness and their order matters. I would pair them with precision, state k and the relevance definition, segment by query type, and inspect label completeness before attributing a metric change to the system.',
    },
  },
  'Evaluation diagnosis': {
    explanation: [
      'Evaluation diagnosis traces a failed request through explicit stage artifacts. A retrieval failure means required evidence never enters the candidate set; a context-construction failure means candidates contain it but the final prompt omits, truncates, duplicates, or misorders it; a generation failure means sufficient final context is present but the answer is unsupported, incomplete, or contrary to it.',
      'End-to-end failure is the user-visible outcome and can remain even when those component checks pass because citations, tool actions, authorization, latency, formatting, or workflow state are wrong. Capture source versions, transformed queries, filters, candidate ranks, final context, model output, and product outcome, then change the earliest failing stage and replay the same case before broad retuning.',
    ],
    whyItMatters: 'The same wrong answer can come from very different causes, and changing the wrong component wastes effort or creates regressions. Stage-specific evidence turns evaluation into a corrective decision: expand retrieval, repair context assembly, constrain generation, or fix the surrounding workflow according to where the first failure occurs.',
    useCases: [
      'Determining whether a missing policy exception requires query changes or context-budget changes',
      'Separating unsupported generation from a retriever that never supplied the required fact',
      'Finding citation, latency, or tool-execution defects after answer-quality checks pass',
    ],
    workedExample: {
      scenario: 'A returns assistant incorrectly denies a valid EU refund even though the active exception exists in the indexed corpus.',
      steps: [
        'Verify the active source and inspect the filtered top-30 candidates: the EU exception appears at rank 14, so ingestion and candidate retrieval succeeded for this request.',
        'Inspect the five passages sent to the model: four duplicate global-policy summaries consume the budget and the exception is absent, identifying context construction as the first failing stage.',
        'Replace score-only packing with canonical deduplication and coverage-aware selection, then confirm the exception reaches the final context; if the model still denies the refund, classify that new result as a generation failure and adjust conflict-resolution or grounding instructions.',
        'Replay the complete workflow and verify answer correctness, citation target, authorization, latency, and refund-action payload; any remaining failure there is end-to-end or integration work rather than another retrieval change.',
      ],
      code: {
        language: 'Text',
        code: `required evidence absent from candidates -> fix retrieval
required evidence present only before final context -> fix context construction
required evidence present but answer wrong -> fix generation
answer checks pass but user outcome fails -> fix end-to-end workflow`,
      },
      result: 'Deduplication promotes the EU exception into the final context and the unchanged model produces the correct cited answer, proving the original defect was context construction; the team avoids an unnecessary embedding change and adds the trace as a regression case.',
    },
    interview: {
      prompt: 'How would you diagnose a failed RAG answer before deciding what to tune?',
      answer: 'I would find the earliest broken artifact: confirm the correct source version, check whether required evidence entered the filtered candidate set, check whether it survived reranking and context construction, and then compare answer claims with the final context. If those pass, I would inspect citations, tools, authorization, latency, and the business outcome. The corrective action belongs to that first failing stage, followed by a same-case replay and regression test.',
    },
  },
} satisfies Record<string, AiLessonDetails>