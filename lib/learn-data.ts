export type Example = {
  title: string;
  body: string;
};

export type Concept = {
  slug: string;
  title: string;
  tagline: string;
  level: 1 | 2 | 3;
  category: string;
  order: number; // global order for sequential learning
  what: string;
  why: string;
  how: string;
  keyInsight: string;
  examples: Example[];
  diagramType:
    | "none"
    | "neuron"
    | "nn-layers"
    | "backprop"
    | "attention"
    | "transformer"
    | "training-pipeline"
    | "lora"
    | "kv-cache"
    | "rag"
    | "agent"
    | "embedding"
    | "quantization"
    | "moe"
    | "rlhf";
  relatedSlugs: string[];
};

export const CONCEPTS: Concept[] = [
  // ─── CATEGORY: ML FOUNDATIONS ───────────────────────────────────────────────
  {
    slug: "ml-basics",
    title: "What is Machine Learning?",
    tagline: "Teach computers to learn from data instead of writing rules by hand.",
    level: 1,
    category: "ML Foundations",
    order: 1,
    what: `Machine Learning (ML) is a way to build software that **learns patterns from data** rather than following hand-coded rules. You show a model thousands of examples (e.g., cat photos vs. dog photos) and it figures out the rules itself.

There are three flavours:
- **Supervised learning** — you provide labeled examples (input → correct output). The model learns to map inputs to outputs.
- **Unsupervised learning** — no labels. The model finds hidden structure on its own (clustering, compression).
- **Reinforcement learning** — an agent takes actions in an environment and receives rewards. It learns to maximize cumulative reward.`,
    why: `Before ML, engineers had to write every rule explicitly. For spam detection, they listed every bad word. For image recognition, they hand-coded edge detectors. These rules broke the moment the real world deviated from the programmer's imagination.

ML flips the approach: **let data write the rules**. This is why Gmail, self-driving cars, and ChatGPT are possible — the complexity of these problems is too high for hand-coded logic.`,
    how: `1. Collect labeled data (thousands or millions of examples).
2. Choose a model architecture (linear regression, decision tree, neural network…).
3. Define a **loss function** — a number that measures how wrong the model is.
4. Run an **optimizer** that tweaks the model's parameters to reduce loss.
5. Evaluate on held-out data the model has never seen.
6. Deploy and monitor.`,
    keyInsight: "ML doesn't program computers — it programs computers to program themselves from data.",
    examples: [
      {
        title: "Email spam filter",
        body: "Supervised learning: labeled dataset of 1M emails (spam / not-spam). The model learns word patterns that predict spam. No one writes rules like \"if email contains 'Nigerian prince' → spam\".",
      },
      {
        title: "Netflix recommendations",
        body: "Unsupervised + collaborative filtering: no one tells Netflix what 'action lovers' are. The model finds clusters of users with similar watch histories and recommends what similar users liked.",
      },
      {
        title: "AlphaGo",
        body: "Reinforcement learning: the model played millions of games against itself, receiving +1 for a win and -1 for a loss. It discovered strategies humans had never seen in 2,500 years of Go.",
      },
    ],
    diagramType: "none",
    relatedSlugs: ["neural-networks", "training-dynamics", "loss-functions"],
  },
  {
    slug: "neural-networks",
    title: "Neural Networks",
    tagline: "Layers of simple math operations that, stacked together, can approximate any function.",
    level: 1,
    category: "ML Foundations",
    order: 2,
    what: `A neural network is a stack of **layers**. Each layer is a batch of **neurons**. Each neuron computes:

\`output = activation(weights · inputs + bias)\`

- **weights** — numbers the model learns. They say how much each input matters.
- **bias** — a constant offset.
- **activation function** — a non-linear squash (ReLU, sigmoid, tanh). Without it, stacking layers collapses into a single linear operation.

A network has:
- **Input layer** — raw data (pixels, token IDs…).
- **Hidden layers** — learned feature extractors.
- **Output layer** — final prediction (class probabilities, a number…).`,
    why: `Linear models can only draw straight-line decision boundaries. The real world is not linear. Stacking non-linear layers lets the network approximate **any** function, given enough neurons — this is the Universal Approximation Theorem.

Every modern AI system (image classifiers, LLMs, audio models) is a neural network.`,
    how: `**Forward pass:** Feed an input through every layer left-to-right. Each layer transforms the signal.

**Loss:** Compare the output to the correct answer using a loss function (e.g., cross-entropy for classification).

**Backward pass (backpropagation):** Compute the gradient of the loss with respect to every weight using the chain rule of calculus. This tells each weight "which direction should I move to reduce error?"

**Update:** Subtract a small fraction of the gradient from each weight (gradient descent).

Repeat millions of times.`,
    keyInsight: "A neural network is a mathematical function with millions of tunable knobs. Training finds the knob settings that make the function useful.",
    examples: [
      {
        title: "Image classifier",
        body: "Input: 28×28 pixel image (784 numbers). Hidden layers learn edges → shapes → object parts. Output: 10 numbers (probability it's each digit 0–9). Used in postal code recognition since the 1990s.",
      },
      {
        title: "Sentiment analysis",
        body: "Input: word embedding of a movie review. Hidden layers learn combinations of words that signal positive/negative sentiment. Output: 1 number between 0 and 1.",
      },
      {
        title: "GPT internals",
        body: "ChatGPT is a neural network with 96 layers and ~175B weights. The same forward-pass formula applies — it's just much wider and deeper, with attention layers instead of fully-connected ones.",
      },
    ],
    diagramType: "nn-layers",
    relatedSlugs: ["backpropagation", "training-dynamics", "activation-functions"],
  },
  {
    slug: "backpropagation",
    title: "Backpropagation",
    tagline: "The algorithm that tells every weight in the network how to improve.",
    level: 1,
    category: "ML Foundations",
    order: 3,
    what: `Backpropagation (backprop) is the algorithm for computing the **gradient** of the loss function with respect to every weight in the network.

It works by applying the **chain rule of calculus** from the output layer backwards to the input layer:

\`∂L/∂w₁ = (∂L/∂out) × (∂out/∂hidden) × (∂hidden/∂w₁)\`

Each layer passes a "blame signal" backwards, telling the previous layer how much it contributed to the error.`,
    why: `Without backprop we'd have no efficient way to know which of the millions of weights to adjust, or in which direction. Finite-difference approximations (nudging each weight by ε and measuring the change) would take O(N) forward passes for N weights — completely infeasible at scale.

Backprop computes gradients for ALL weights in a single backward pass — the same cost as one forward pass.`,
    how: `1. Run a forward pass, storing activations at each layer.
2. Compute loss at the output.
3. Compute ∂L/∂output.
4. Walk backwards: for each layer, compute its local gradient and multiply by the gradient flowing in from the right.
5. Accumulate gradients at each weight.
6. The optimizer uses these gradients to update weights.

Modern frameworks (PyTorch, JAX) do this automatically via **autograd** — you just call \`loss.backward()\`.`,
    keyInsight: "Backprop is just the chain rule applied recursively — the insight is that each layer only needs to know the gradient from the next layer, making it O(N) instead of O(N²).",
    examples: [
      {
        title: "Single neuron learning XOR",
        body: "Predict XOR(0,1)=1, XOR(1,1)=0. Without backprop you'd randomly guess new weights. With backprop: the output neuron passes blame to hidden neurons, which pass blame to input weights, each nudging toward the right answer.",
      },
      {
        title: "PyTorch in 3 lines",
        body: "loss = criterion(model(x), y)  →  loss.backward()  →  optimizer.step(). PyTorch tracks every operation in a compute graph and backprop is just one call.",
      },
      {
        title: "Vanishing gradients",
        body: "In deep networks, gradients multiplied through many sigmoid activations shrink toward zero. Layer 1 gets a gradient of 0.0000001 and barely learns. This is why ReLU and residual connections exist — they keep gradients healthy.",
      },
    ],
    diagramType: "backprop",
    relatedSlugs: ["training-dynamics", "neural-networks", "attention"],
  },
  {
    slug: "training-dynamics",
    title: "Training Dynamics",
    tagline: "Loss functions, optimizers, and learning rates — the engine of learning.",
    level: 1,
    category: "ML Foundations",
    order: 4,
    what: `**Loss function** — a single number measuring how wrong the model is. Lower = better. Common losses:
- Cross-entropy (classification)
- Mean squared error (regression)
- KL divergence (distribution matching)

**Optimizer** — an algorithm that uses the gradient to update weights. The gold standard is **Adam**: it adapts the learning rate per-weight and uses momentum to avoid oscillation.

**Learning rate (lr)** — how big a step to take each update. Too high → diverges. Too low → trains forever.

**Batch size** — how many examples to average before one weight update. Large batches are more stable; small batches are noisier but can generalize better.`,
    why: `These hyperparameters are the difference between a model that trains in 1 hour vs. 1 week, or one that reaches 95% accuracy vs. 60%. Understanding them lets you debug training runs and tune jobs efficiently.`,
    how: `**Learning rate schedule:** Start high (fast exploration), decay over time (fine-grained convergence). Cosine annealing and linear warmup are standard in LLM training.

**Gradient clipping:** Cap gradients above a threshold to prevent exploding gradients.

**Overfitting signals:** Training loss goes down but validation loss goes up. Fixes: more data, dropout, weight decay, early stopping.

**Underfitting signals:** Both losses are high. Fixes: bigger model, more training, lower regularization.`,
    keyInsight: "The loss landscape is a high-dimensional mountain range. The optimizer is a hiker trying to find the valley — learning rate is stride length, momentum is inertia.",
    examples: [
      {
        title: "Learning rate too high",
        body: "Imagine taking steps of 10m in a valley 1m wide. You overshoot every time and never settle. The loss bounces instead of decreasing. Fix: reduce lr by 10×.",
      },
      {
        title: "Adam optimizer",
        body: "Adam keeps a running average of past gradients (momentum) and past squared gradients (to normalize). Result: weights that rarely change get bigger updates; weights that oscillate get smaller ones. Almost always outperforms plain SGD.",
      },
      {
        title: "LLM warmup",
        body: "GPT-3 training used a 375M-token warmup where lr linearly increased from ~0 to 6×10⁻⁴. Without warmup, early large gradients can destroy initialization and the model never recovers.",
      },
    ],
    diagramType: "none",
    relatedSlugs: ["backpropagation", "attention", "lora"],
  },
  // ─── CATEGORY: ATTENTION & TRANSFORMERS ─────────────────────────────────────
  {
    slug: "attention",
    title: "Attention Mechanism",
    tagline: "The key invention that lets models focus on relevant parts of the input.",
    level: 1,
    category: "Attention & Transformers",
    order: 5,
    what: `Attention lets a model look at **all** positions of the input simultaneously and decide which are relevant to producing each output token.

For each position, compute three vectors:
- **Query (Q)** — "what am I looking for?"
- **Key (K)** — "what do I offer?"
- **Value (V)** — "what is my actual content?"

Attention score between position i and j: \`score = Q_i · K_j / √d_k\`

Apply softmax to get weights that sum to 1. Weighted sum of V vectors = the attended output.

**Multi-head attention** runs H independent attention operations in parallel, each learning to attend to different relationship types, then concatenates results.`,
    why: `Before attention, RNNs processed sequences one token at a time. Token 1's information had to survive through 1000 hidden-state updates to reach token 1001. It didn't — long-range dependencies were lost.

Attention gives every token a **direct path** to every other token regardless of distance. This is why transformers understand long documents and why "the animal didn't cross the street because it was too tired" → 'it' refers to 'animal' (not 'street') is correctly resolved.`,
    how: `1. Embed input tokens as vectors.
2. Project into Q, K, V spaces via learned weight matrices.
3. Compute attention scores: \`Attn = softmax(QKᵀ/√d) V\`
4. Each head learns a different "what to attend to."
5. Concatenate all heads, project back to model dimension.
6. Add & Norm (residual connection + layer norm).`,
    keyInsight: "Attention is a soft, differentiable lookup table: the query looks up the keys, and the retrieved value is a weighted blend of all values, not a hard single result.",
    examples: [
      {
        title: "Pronoun resolution",
        body: "'The trophy didn't fit in the suitcase because it was too big.' — Was 'it' the trophy or suitcase? Attention learns to put high weight between 'it' and 'trophy' (the larger object) based on semantic context.",
      },
      {
        title: "Translation",
        body: "Translating 'I ate the apple' → 'Ich aß den Apfel'. When generating 'Apfel', the model attends strongly to 'apple' in the English input. Attention makes the alignment explicit and learnable.",
      },
      {
        title: "Code completion",
        body: "When completing 'return x + ', the model attends to the variable declaration 'x = 42' lines above. Without attention this long-range reference would be lost in an RNN.",
      },
    ],
    diagramType: "attention",
    relatedSlugs: ["transformer", "kv-cache", "neural-networks"],
  },
  {
    slug: "transformer",
    title: "Transformer Architecture",
    tagline: "The full blueprint of every modern LLM — attention + feed-forward, repeated.",
    level: 1,
    category: "Attention & Transformers",
    order: 6,
    what: `A Transformer is a stack of **N identical blocks**. Each block has two sub-layers:

1. **Multi-Head Self-Attention** — each token attends to all other tokens.
2. **Feed-Forward Network (FFN)** — two linear layers with ReLU in between, applied independently per token. This is where most parameters live.

Crucially, each sub-layer uses a **residual connection** (output = input + sub-layer(input)) and **Layer Norm** to keep gradients healthy.

**Positional encoding** adds position information to token embeddings (sine waves or learned vectors) because attention itself is order-agnostic.

GPT-style (decoder-only): each token only attends to **past** tokens (causal masking). Used for generation.
BERT-style (encoder-only): tokens attend to both directions. Used for understanding tasks.`,
    why: `Before transformers (2017), NLP used RNNs/LSTMs that were slow to train (sequential), bad at long context, and hard to scale. The transformer fixed all three:
- **Parallelizable** — all attention scores computed simultaneously.
- **Long context** — direct O(1) path between any two tokens.
- **Scalable** — simply add more layers / wider FFNs.

Every modern LLM (GPT, Claude, Gemini, Llama) is a transformer.`,
    how: `Input tokens → embedding lookup → + positional encoding

For each of N layers:
  → Multi-Head Attention → Add & Norm
  → FFN (linear → ReLU → linear) → Add & Norm

Final layer norm → Linear projection to vocab → Softmax → Probabilities

During training: teacher-forcing (feed correct previous tokens).
During inference: autoregressive (feed own predictions back as input).`,
    keyInsight: "The transformer's power comes from the combination of global attention (see everything) and feed-forward layers (transform what you see) — and residual connections that let gradients flow freely through 100+ layers.",
    examples: [
      {
        title: "GPT-3 architecture",
        body: "96 transformer layers, 96 attention heads, hidden dim 12288, FFN dim 49152. ~175B parameters total. The same block blueprint repeated 96 times — just scale.",
      },
      {
        title: "Why FFN is 4× wider",
        body: "The FFN expands to 4d_model then contracts. Researchers hypothesize this intermediate space stores 'knowledge' as (key, value) pairs — recent work shows individual neurons in FFN correspond to factual associations like 'Paris → France'.",
      },
      {
        title: "Residual connection impact",
        body: "Without residual connections, a 50-layer network is harder to train than a 10-layer one because gradients vanish. With residuals, a 1000-layer network trains almost as easily as a 10-layer one. ResNets (vision) and transformers both rely on this.",
      },
    ],
    diagramType: "transformer",
    relatedSlugs: ["attention", "language-models", "kv-cache"],
  },
  // ─── CATEGORY: LANGUAGE MODELS ──────────────────────────────────────────────
  {
    slug: "language-models",
    title: "Language Models & Tokenization",
    tagline: "How text becomes numbers, and how LLMs predict the next token.",
    level: 1,
    category: "Language Models",
    order: 7,
    what: `A **language model** assigns probabilities to sequences of tokens. A modern LLM is trained to predict **P(next token | all previous tokens)**.

**Tokenization** converts raw text into a sequence of integer IDs using a vocabulary (typically 50k–150k tokens). The standard algorithm is **Byte Pair Encoding (BPE)**:
- Start with individual bytes.
- Repeatedly merge the most frequent adjacent pair into a new token.
- Repeat until vocabulary size is reached.

Common words become single tokens ("the" → 1 token). Rare words split ("cryptocurrency" → ["crypto", "currency"] → 2 tokens). Code symbols often have their own tokens.`,
    why: `Understanding tokenization explains many LLM quirks:
- Why "9.11 > 9.9" fails (numbers split oddly, lose numeric meaning).
- Why LLMs count letters incorrectly ("strawberry" → ["st", "raw", "berry"]).
- Why prompts in English are "cheaper" than some other languages (more tokens per word).
- Why code models need code-specific tokenizers.`,
    how: `**Autoregressive generation:**
1. Tokenize input prompt → sequence of IDs.
2. Feed through transformer → logits (one score per vocab token).
3. Apply softmax → probability distribution.
4. Sample a token (or take argmax for greedy decoding).
5. Append to context, repeat from step 2.

This continues until a special \`<EOS>\` (end-of-sequence) token is generated or max length is reached.

**Context window** = max number of tokens the model can "see" at once. GPT-4: 128k tokens. Claude 3.5: 200k tokens.`,
    keyInsight: "LLMs are text-compression machines: predicting the next token requires understanding grammar, facts, reasoning, and style. The model that compresses best, understands most.",
    examples: [
      {
        title: "Token counting",
        body: "'Hello, world!' = 4 tokens in GPT-4. '¡Hola, mundo!' = 8 tokens. Same semantic content, twice the cost. This is why multilingual prompts are more expensive and models can be weaker in low-resource languages.",
      },
      {
        title: "The 'strawberry' bug",
        body: "Ask any GPT-3.5 class model 'How many Rs in strawberry?' — it gets 2 instead of 3. Reason: 'strawberry' might tokenize as ['st', 'raw', 'berry']. The model reasons over tokens, not characters.",
      },
      {
        title: "Context window exhaustion",
        body: "Feeding a 300-page book into a 128k-token model fails (~100k tokens). Solution: chunking + RAG (retrieve only relevant sections). This is a fundamental architectural constraint, not a bug.",
      },
    ],
    diagramType: "none",
    relatedSlugs: ["transformer", "training-pipeline", "rag"],
  },
  // ─── CATEGORY: TRAINING ─────────────────────────────────────────────────────
  {
    slug: "training-pipeline",
    title: "LLM Training Pipeline",
    tagline: "Pretraining → Supervised Fine-Tuning → Alignment — how raw text becomes ChatGPT.",
    level: 1,
    category: "Training",
    order: 8,
    what: `Modern LLMs are trained in three stages:

**Stage 1 — Pretraining:**
Train on trillions of tokens of internet text (books, code, Wikipedia, web pages). The model learns language, facts, and reasoning by predicting the next token. This is 99% of the compute budget.

**Stage 2 — Supervised Fine-Tuning (SFT):**
Fine-tune on thousands of high-quality (prompt, ideal response) pairs written by human contractors. The model learns the format and style of helpful assistant responses.

**Stage 3 — Alignment (RLHF/DPO):**
Use human feedback to align the model to human preferences — helpful, honest, harmless. This is where the model learns to refuse harmful requests and be genuinely useful.`,
    why: `Pretraining alone produces a "document completer" that will happily complete "How do I make a bomb?" with actual instructions. SFT teaches the format of an assistant. Alignment teaches values.

Each stage solves a different problem:
- Pretraining: knowledge
- SFT: behavior format
- Alignment: values & safety`,
    how: `**Pretraining:** Next-token prediction on a massive corpus. Use distributed training across thousands of GPUs. Chinchilla scaling laws: for a given compute budget, split evenly between model size and training tokens (roughly).

**SFT:** Standard cross-entropy on the response tokens only. Prompt tokens are masked in the loss. Dataset size: 10k–100k examples is often enough.

**RLHF:** Train a reward model on human preference comparisons (A vs B). Use PPO (a RL algorithm) to optimize the LLM's outputs according to the reward model, with a KL penalty to prevent the model from drifting too far from the SFT checkpoint.

**DPO (Direct Preference Optimization):** Skips the reward model entirely. Directly optimizes preferences using a rearrangement of the RLHF objective. Simpler, more stable, increasingly preferred.`,
    keyInsight: "Each training stage is layered on top of the previous: pretraining builds the world model, SFT shapes the interface, alignment installs the values.",
    examples: [
      {
        title: "GPT-4 training cost",
        body: "Estimated $100M+ in compute just for pretraining. Thousands of A100 GPUs × months. SFT and RLHF are comparatively cheap — days, not months.",
      },
      {
        title: "SFT dataset quality over quantity",
        body: "Meta's Llama-2 SFT used only ~27k instruction examples — but they were high quality. OpenAI's InstructGPT used ~13k. The lesson: 1,000 perfect examples > 100,000 mediocre ones for SFT.",
      },
      {
        title: "DPO vs RLHF",
        body: "DPO treats alignment as a classification problem: given (prompt, chosen, rejected) triples, maximize the margin. No PPO loop, no reward model. Llama-3, Mistral, and most open-source models now use DPO. OpenAI still uses RLHF variants.",
      },
    ],
    diagramType: "training-pipeline",
    relatedSlugs: ["lora", "rlhf", "language-models"],
  },
  {
    slug: "lora",
    title: "LoRA & Parameter-Efficient Fine-Tuning",
    tagline: "Fine-tune a 70B model on a laptop GPU by only updating 0.1% of parameters.",
    level: 1,
    category: "Training",
    order: 9,
    what: `**LoRA (Low-Rank Adaptation)** is a technique to fine-tune large models efficiently. Instead of updating all weights W (billions of parameters), it freezes W and adds a small **low-rank update**:

\`W' = W + AB\`

where A ∈ ℝ^{d×r} and B ∈ ℝ^{r×k}, with rank r ≪ min(d,k) (typically r=8 or r=16).

You only train A and B — typically 0.1%–1% of the original parameters.

**QLoRA** combines LoRA with 4-bit quantization of the frozen weights, enabling fine-tuning of 70B models on a single 48GB GPU.`,
    why: `Full fine-tuning of a 7B model requires:
- 7B params × 4 bytes (fp32) = 28GB just for weights
- Plus optimizer states (Adam needs 2× more) = 84GB+ VRAM

That's 4× A100 GPUs minimum. Most teams can't afford that.

LoRA reduces trainable parameters from 7B to ~7M, cutting VRAM by 70%+ while achieving similar performance to full fine-tuning on most tasks.`,
    how: `1. Load pretrained model weights W (frozen — not updated).
2. Add LoRA matrices A, B at target layers (usually attention Q, K, V, and output projections).
3. Initialize A with random Gaussian, B with zeros (so AB=0 at start, preserving original model).
4. Train only A and B on your fine-tuning dataset.
5. At inference: merge W + AB into a single matrix (zero extra cost).

**r (rank):** Higher r = more capacity but more params. r=8 is a good default; r=64 for hard tasks.
**α (scaling):** LoRA scales AB by α/r. Usually set α = 2×r.`,
    keyInsight: "Weight updates during fine-tuning have low intrinsic dimensionality — the model doesn't need to change much to learn a new task. LoRA exploits this by constraining updates to a low-rank subspace.",
    examples: [
      {
        title: "Medical QA fine-tuning",
        body: "Take Llama-3-8B (pretrained on general internet). Apply LoRA with r=16 on ~50k medical Q&A pairs. Result: model answers clinical questions accurately. Training time: 4 hours on a single A100. Cost: ~$20.",
      },
      {
        title: "Style transfer",
        body: "Fine-tune GPT-2 with LoRA to write like Shakespeare using 50k lines of his plays. LoRA A and B matrices capture the style shift without forgetting GPT-2's general language ability.",
      },
      {
        title: "QLoRA on consumer hardware",
        body: "Fine-tune Llama-2-70B on a single RTX 4090 (24GB) using QLoRA: quantize frozen weights to 4-bit (saves ~4× VRAM), add LoRA adapters in fp16. Achieves 90%+ of full fine-tuning performance on benchmarks.",
      },
    ],
    diagramType: "lora",
    relatedSlugs: ["training-pipeline", "quantization", "training-dynamics"],
  },
  {
    slug: "rlhf",
    title: "RLHF & Alignment",
    tagline: "Teaching LLMs human values using feedback, not just next-token prediction.",
    level: 1,
    category: "Training",
    order: 10,
    what: `**RLHF (Reinforcement Learning from Human Feedback)** is a technique to align LLMs with human preferences.

Steps:
1. **Collect comparisons:** Show humans two LLM responses to the same prompt. They pick the better one.
2. **Train a reward model:** A separate neural network that predicts human preference scores given (prompt, response).
3. **RL fine-tuning:** Use PPO (Proximal Policy Optimization) to optimize the LLM's outputs to maximize reward, with a KL divergence penalty to prevent it from gaming the reward model.

**DPO** is a simpler alternative that skips the reward model and directly optimizes the preference objective.`,
    why: `SFT teaches the model to imitate examples, but it doesn't teach judgment. A model trained only on "ideal" examples might:
- Write confident-sounding but wrong answers.
- Be overly verbose or sycophantic.
- Refuse helpful but slightly sensitive requests.

RLHF/DPO teaches the model to judge quality, not just imitate format. It's why ChatGPT feels helpful and not just "text-y."`,
    how: `**Reward model training:**
- Dataset: (prompt, response_A, response_B, human_preference)
- Train to predict: P(A preferred | prompt, A, B) > P(B preferred)
- Architecture: same transformer, different output head (scalar score)

**PPO fine-tuning:**
- Score = reward_model(response) − β × KL(π_LLM || π_SFT)
- β controls how much the model can drift from the SFT checkpoint
- Run PPO for days on thousands of prompts

**DPO:**
- Loss = -log σ(β × (log π(chosen) - log π_ref(chosen)) - β × (log π(rejected) - log π_ref(rejected)))
- No RL loop. Just supervised training on preferences. Much simpler.`,
    keyInsight: "RLHF installs a learned human preference function into the model's optimization target — the model optimizes to produce outputs humans prefer, not just outputs that predict the next token.",
    examples: [
      {
        title: "Helpfulness alignment",
        body: "Prompt: 'Explain quantum entanglement.' Response A: accurate but full of jargon. Response B: accurate and uses an analogy. Humans prefer B. RLHF trains the model to write like B.",
      },
      {
        title: "Refusal calibration",
        body: "Prompt: 'How do I pick a lock?' Context: a locksmith asking about their own locks. RLHF teaches the model that context matters — the same question from different contexts warrants different responses.",
      },
      {
        title: "Sycophancy prevention",
        body: "Without alignment, LLMs often agree with the user even when wrong ('Yes, 2+2=5'). RLHF with honesty-focused raters reduces sycophancy — the model learns that honest disagreement is preferred over false agreement.",
      },
    ],
    diagramType: "rlhf",
    relatedSlugs: ["training-pipeline", "lora", "evaluation"],
  },
  // ─── CATEGORY: INFERENCE ────────────────────────────────────────────────────
  {
    slug: "inference-basics",
    title: "Inference & Sampling",
    tagline: "Temperature, top-p, and how to control what the model says.",
    level: 1,
    category: "Inference",
    order: 11,
    what: `After training, using the model to generate text is called **inference**.

The model outputs **logits** (raw scores per vocab token). To convert to a probability distribution and sample:

**Temperature (T):**
- Divide logits by T before softmax.
- T=1: original distribution. T→0: argmax (greedy). T→∞: uniform random.
- Lower T = more predictable, less creative. Higher T = more diverse, more "hallucinating."

**Top-p (nucleus sampling):**
- Sort tokens by probability. Keep the smallest set whose cumulative probability ≥ p. Sample from this set.
- Typical: p=0.9. Removes low-probability "weird" words while preserving diversity.

**Top-k:** Keep only the k most likely tokens. Simple but less principled than top-p.`,
    why: `You want control:
- A code generator should be greedy (T≈0.1) — correctness over creativity.
- A brainstorming assistant should be diverse (T≈0.8–1.0).
- A creative writing model: T≈1.0–1.2.

Without these controls, LLMs either produce robotic repetitive text (T=0) or nonsense (T=2).`,
    how: `**Greedy decoding:** Always pick the highest-probability token. Fast, deterministic, but repetitive.

**Beam search:** Maintain k candidate sequences at each step; keep the top k by joint probability. Good for translation, but generates generic/safe text for open-ended tasks.

**Sampling + top-p + temperature:** The standard approach for creative and conversational tasks.

**Repetition penalty:** Reduce the probability of tokens already generated. Prevents "the the the the..."`,
    keyInsight: "Temperature is a creativity dial: it makes the model's probability distribution more or less peaked, trading confidence for diversity.",
    examples: [
      {
        title: "Code generation at T=0",
        body: "def fibonacci(n): → at T=0 the model always picks the most likely next token, producing the canonical implementation every time. No surprises, no bugs from creativity.",
      },
      {
        title: "Story generation at T=1.2",
        body: "Same prompt generates different stories every run. Some are brilliant, some are bizarre. T>1 flattens probabilities, giving rare/surprising tokens a bigger chance.",
      },
      {
        title: "API defaults",
        body: "OpenAI's API defaults: temperature=1, top_p=1. Most production teams set temperature=0.2–0.7 and top_p=0.9 for reliable outputs. System prompts often include 'be precise and concise' to further reduce entropy.",
      },
    ],
    diagramType: "none",
    relatedSlugs: ["kv-cache", "quantization", "language-models"],
  },
  {
    slug: "kv-cache",
    title: "KV Cache",
    tagline: "The optimization that makes long-context inference 100× faster.",
    level: 1,
    category: "Inference",
    order: 12,
    what: `During autoregressive generation, the transformer must compute attention for every token in the context at every step. For a sequence of length N, that's O(N²) attention operations per new token — exponential slowdown.

**KV Cache** avoids recomputation: during the forward pass, the Key (K) and Value (V) matrices for each past token are **cached in GPU memory**. When generating the next token, only the new token's Q/K/V are computed, and attention is computed using the cached K,V from all previous positions.

Result: generating each new token costs O(N) instead of O(N²).`,
    why: `Without KV cache, generating a 1000-token response from a 100k-token context would require 100k × 1000 = 100M attention score computations per layer, per token, per step. With KV cache, it's 100k computations per step — same cost per step regardless of response length so far.

**Memory cost:** The cache grows linearly with context length. For a 100k token context with a 70B model, the KV cache can be 50–100GB — often larger than the model weights!`,
    how: `**Memory layout:** KV cache is stored as two tensors [layers × heads × seq_len × d_head] for K and V separately.

**Prefill phase:** The entire prompt is processed in parallel (fast, uses full GPU utilization).

**Decode phase:** One token at a time, using cached K,V. This is the slow phase — GPU is underutilized because batch size is effectively 1.

**Paged attention (vLLM):** Inspired by OS virtual memory — allocate KV cache in fixed-size pages instead of one big contiguous block. Enables more efficient memory use and higher GPU utilization across concurrent requests.`,
    keyInsight: "KV cache trades memory for speed: store intermediate computations so you never repeat them. It's the same insight as memoization in algorithms.",
    examples: [
      {
        title: "Prefill vs decode throughput",
        body: "Prefilling a 10k-token prompt: 200ms. Decoding 200 tokens: 2 seconds (10ms/token). The decode is slower per token despite doing less work because the GPU is underutilized. Batching multiple users' decode steps together helps.",
      },
      {
        title: "KV cache memory calculation",
        body: "Llama-3-70B: 80 layers, 8 KV heads, d_head=128, fp16. For 32k tokens: 80 × 8 × 32000 × 128 × 2 bytes × 2 (K+V) = ~42GB. The model weights themselves are ~140GB. KV cache is significant.",
      },
      {
        title: "Prompt caching (Claude/OpenAI)",
        body: "Claude and GPT-4 now offer prompt caching: if you send the same system prompt repeatedly (e.g., a long document), the KV cache for that prefix is reused across requests, reducing latency and cost by up to 90% for repeated prefixes.",
      },
    ],
    diagramType: "kv-cache",
    relatedSlugs: ["transformer", "quantization", "inference-basics"],
  },
  {
    slug: "quantization",
    title: "Quantization",
    tagline: "Compress model weights from 32-bit floats to 4-bit integers — 4× smaller, barely worse.",
    level: 2,
    category: "Inference",
    order: 13,
    what: `Neural network weights are stored as 32-bit floats by default. **Quantization** converts them to lower-precision formats:
- **FP16 / BF16** — 16-bit float. ~2× compression. Almost no quality loss.
- **INT8** — 8-bit integer. ~4× compression. Small quality degradation.
- **INT4 / NF4** — 4-bit. ~8× compression. Noticeable but often acceptable.
- **GPTQ, AWQ, GGUF** — popular quantization formats for inference.

The idea: most weight values cluster near zero. Instead of storing the exact float, store which of 16 (4-bit) or 256 (8-bit) discrete buckets the value falls in.`,
    why: `A 70B model in fp32 = 280GB VRAM. That's 3× A100 80GB cards minimum.
In INT4: ~35GB. Fits on a single A100, or a Mac Studio with 192GB unified memory.

Quantization is what makes local LLMs possible (llama.cpp, Ollama, LM Studio). Without it, open-source models would be inaccessible to anyone without a data center.`,
    how: `**Post-Training Quantization (PTQ):**
Take a trained model, run calibration data through it, determine the range of each weight tensor, quantize.

**GPTQ:** Quantizes weights layer by layer, compensating for quantization error using the Hessian (second-order information). One of the best PTQ methods for LLMs.

**AWQ (Activation-aware Weight Quantization):** Protects the most salient weights (those that cause large activation changes) from aggressive quantization. State of the art for INT4.

**GGUF / llama.cpp:** CPU-friendly format. Q4_K_M is the community standard — good quality/speed tradeoff on consumer hardware.`,
    keyInsight: "Quantization works because neural networks are robust to noise: weights perturbed by small amounts produce nearly the same outputs. The information is distributed, not fragile.",
    examples: [
      {
        title: "Running Llama-3-70B locally",
        body: "Llama-3-70B-Q4_K_M (GGUF): 42GB file. Runs on an M2 Max MacBook Pro (96GB RAM) at ~10 tokens/second. Comparable quality to GPT-3.5 for many tasks. No internet required.",
      },
      {
        title: "Quality degradation curve",
        body: "On MMLU benchmark: fp16=80%, INT8=79.8%, INT4=78%, INT3=73%. The 4-bit cliff is real but manageable. Going below 4-bit usually hurts too much for production use.",
      },
      {
        title: "Mixed precision inference",
        body: "Keep attention layers in fp16, quantize FFN to INT4. FFN has ~⅔ of parameters, so this gives most of the compression benefit while preserving attention precision where it matters most.",
      },
    ],
    diagramType: "quantization",
    relatedSlugs: ["kv-cache", "lora", "inference-basics"],
  },
  // ─── CATEGORY: RAG & AGENTS ─────────────────────────────────────────────────
  {
    slug: "rag",
    title: "RAG — Retrieval-Augmented Generation",
    tagline: "Give your LLM a searchable memory to answer questions it wasn't trained on.",
    level: 1,
    category: "RAG & Agents",
    order: 14,
    what: `**RAG** (Lewis et al., 2020) is a pattern that augments an LLM with a retrieval system:

1. **Embed** your documents into a vector database.
2. At query time, **embed** the user's question.
3. **Retrieve** the most similar document chunks (cosine similarity).
4. **Inject** the chunks into the LLM's context as grounding context.
5. **Generate** a response grounded in the retrieved facts.

The LLM's weights don't change — it uses in-context information instead.`,
    why: `LLMs have two fundamental limitations:
1. **Knowledge cutoff** — they don't know about events after training.
2. **Context limit** — you can't fit your entire company's docs into a 200k token window (and even if you could, it's expensive).

RAG solves both: retrieve only the relevant 3–5 chunks at query time, inject them into context. The LLM reasons over fresh, specific information rather than hallucinating from stale memory.`,
    how: `**Indexing (offline):**
1. Chunk documents (500–1000 tokens per chunk with overlap).
2. Embed each chunk with an embedding model (e.g., text-embedding-3-large).
3. Store embeddings in a vector database (Pinecone, Weaviate, pgvector, Chroma).

**Retrieval (online):**
1. Embed the query.
2. Approximate nearest-neighbor search (HNSW algorithm) → top-k chunks.
3. Optional reranking (CrossEncoder) to re-score retrieved chunks.

**Generation:**
Prompt = system prompt + retrieved chunks + user query.
LLM generates response citing retrieved content.

**Chunking strategies:** Fixed-size, sentence-based, semantic (split on topic shifts), hierarchical (summary + detail chunks).`,
    keyInsight: "RAG is the difference between a friend who reads before they answer vs. one who confidently makes things up. Retrieval grounds the LLM in evidence.",
    examples: [
      {
        title: "Customer support bot",
        body: "Company has 10,000 support docs. User asks 'How do I cancel my subscription?' RAG retrieves the 3 most relevant docs, injects them into context. LLM answers accurately citing the policy — no hallucination about a policy that doesn't exist.",
      },
      {
        title: "Legal document Q&A",
        body: "Upload a 500-page contract. User asks 'What are the termination clauses?' RAG retrieves the relevant sections (pages 234–237). LLM answers with specific clause numbers and language. Feeding all 500 pages would cost $5 per query; RAG costs $0.05.",
      },
      {
        title: "Hybrid search",
        body: "Pure semantic search misses exact keyword matches ('SOC 2 Type II certification'). Hybrid search combines dense (embedding) + sparse (BM25 keyword) retrieval, then RRF-merges results. Standard in production RAG systems.",
      },
    ],
    diagramType: "rag",
    relatedSlugs: ["embeddings", "agent", "language-models"],
  },
  {
    slug: "embeddings",
    title: "Embeddings & Vector Databases",
    tagline: "Turn text, images, and code into numbers so similarity becomes a distance calculation.",
    level: 2,
    category: "RAG & Agents",
    order: 15,
    what: `An **embedding** is a dense vector (e.g., 1536 numbers) that represents the **semantic meaning** of a piece of text, image, or code. Texts with similar meanings have embeddings with high cosine similarity.

An **embedding model** takes text → vector. Popular choices:
- OpenAI text-embedding-3-large (3072-dim)
- sentence-transformers/all-mpnet-base-v2 (768-dim, free)
- Cohere embed-english-v3

A **vector database** stores millions of embeddings and enables fast approximate-nearest-neighbor (ANN) search. Options: Pinecone, Weaviate, Qdrant, Milvus, pgvector (PostgreSQL extension).`,
    why: `Traditional keyword search is brittle: "cardiac arrest" ≠ "heart attack" to a keyword matcher. Semantic search understands they mean the same thing because their embeddings are close in vector space.

Vector databases enable similarity search at scale (millions of vectors in milliseconds using HNSW index) — a prerequisite for RAG, recommendation systems, deduplication, and anomaly detection.`,
    how: `**Embedding storage:** Each vector is just an array of floats. A 1536-dim float32 vector = 6KB. 1M documents = 6GB — fits in RAM.

**HNSW (Hierarchical Navigable Small World):** The standard ANN index. Builds a multi-layer graph where long-range edges skip across clusters. Query time: O(log N) with high recall.

**Cosine similarity vs. dot product:** Cosine normalizes for vector magnitude (length). Use cosine when you care about direction only. Most embedding models are trained with cosine in mind.

**Dimensionality reduction:** UMAP / t-SNE reduce high-dim embeddings to 2D for visualization — useful for inspecting clusters (are similar docs near each other?).`,
    keyInsight: "Embeddings are the Rosetta Stone of AI: they map heterogeneous data (text, images, audio) into a common space where 'similar' means 'close.' This is what makes cross-modal search possible.",
    examples: [
      {
        title: "Semantic search",
        body: "Query: 'How to reduce AWS costs?' Keyword search returns docs mentioning 'AWS costs.' Semantic search also returns docs about 'cloud optimization,' 'spot instances,' 'reserved capacity' — all relevant without using the exact words.",
      },
      {
        title: "Duplicate detection",
        body: "10M customer emails. Find duplicates (same complaint, different wording). Embed all emails, cluster embeddings with k-means. Each cluster = a complaint theme. Review cluster centroids instead of 10M emails.",
      },
      {
        title: "Code search",
        body: "Query: 'function that sorts a list in descending order.' Embedding search returns Python snippets, even if they use sorted(..., reverse=True) without the word 'descending.' Code embedding models are trained on code-comment pairs.",
      },
    ],
    diagramType: "embedding",
    relatedSlugs: ["rag", "agent", "training-pipeline"],
  },
  {
    slug: "agent",
    title: "LLM Agents & Tool Use",
    tagline: "LLMs that plan, use tools, and take multi-step actions in the real world.",
    level: 1,
    category: "RAG & Agents",
    order: 16,
    what: `An **LLM agent** is a system where the LLM decides what action to take next, executes it via tools, observes the result, and repeats until the task is done.

The core loop:
1. **Think:** LLM reasons about the task and decides what to do next.
2. **Act:** Call a tool (web search, code executor, database query, API call).
3. **Observe:** Receive tool output.
4. **Repeat** until task is complete or an answer can be given.

This is the **ReAct** pattern (Reasoning + Acting). Modern systems use **function calling** — the LLM outputs structured JSON specifying which tool to call with what arguments.`,
    why: `A plain LLM can only know what's in its weights + context. An agent can:
- Look up current stock prices (web search).
- Run code and inspect the result.
- Query your database for live data.
- Send emails or create calendar events.

This transforms LLMs from knowledge retrievers into **task executors**.`,
    how: `**Function calling:** The LLM is given a list of available tools with JSON schemas. It outputs either a response or a tool call (tool_name + arguments as JSON). The framework executes the call and feeds results back.

**Planning strategies:**
- **ReAct:** Think-Act-Observe interleaved in a single chain.
- **Plan-and-Execute:** First generate a full plan, then execute steps.
- **Tree-of-Thought:** Explore multiple reasoning branches.

**Memory:**
- **In-context:** All history in the prompt (bounded by context window).
- **External:** Summarize or embed past actions into a vector store.

**Multi-agent:** Orchestrator agent delegates sub-tasks to specialist agents (coding agent, search agent, writer agent).`,
    keyInsight: "An agent is just an LLM in a loop with tools. The intelligence isn't in the loop — it's in the LLM's ability to reason about what to do next given what it just observed.",
    examples: [
      {
        title: "Research agent",
        body: "Task: 'Summarize the latest papers on RAG from the last 6 months.' Agent: search arxiv → retrieve abstracts → filter by date → read top 5 papers → synthesize summary. Each step uses a tool, 4–6 iterations total.",
      },
      {
        title: "Coding agent",
        body: "Task: 'Fix the failing test in my Python repo.' Agent: read file → identify error → write fix → run tests → observe result → adjust if still failing. This is exactly how Claude Code works.",
      },
      {
        title: "Customer support agent",
        body: "User: 'Where is my order #12345?' Agent: call_api(get_order, id=12345) → observe status='shipped', tracking='UPS 1Z...' → call_api(get_tracking, id='1Z...') → observe 'In transit, arrives tomorrow' → respond to user with specific details.",
      },
    ],
    diagramType: "agent",
    relatedSlugs: ["rag", "embeddings", "inference-basics"],
  },
  // ─── CATEGORY: ADVANCED ─────────────────────────────────────────────────────
  {
    slug: "moe",
    title: "Mixture of Experts (MoE)",
    tagline: "Train a 1T-parameter model but activate only 20B parameters per token.",
    level: 3,
    category: "Advanced",
    order: 17,
    what: `**Mixture of Experts** replaces the single FFN layer in each transformer block with N parallel "expert" FFNs (e.g., 64 experts). A small **router network** decides which 2–4 experts to activate for each token.

\`output = Σ gate_i(token) × expert_i(token)\` (only top-k gates are non-zero)

**Sparse activation:** Each token sees only 2–4 experts out of 64. The total parameter count is huge, but the **activated** (and thus compute cost) parameter count is small.`,
    why: `Scaling laws say bigger models perform better. But compute scales linearly with activated parameters. MoE breaks this link: you can have 1T total parameters with only 20B activated per token — same inference cost as a 20B dense model, but the model has "seen" more during training.

GPT-4, Gemini 1.5, and Mixtral-8x7B are all MoE models. This is why GPT-4 is much smarter than GPT-3 without being proportionally slower.`,
    how: `**Router:** A small linear layer that takes the token embedding and outputs a score for each expert. Top-k experts are selected, their scores are softmax-normalized, and their outputs are weighted-summed.

**Load balancing loss:** Without it, the router always picks the same experts (they get more training signal, so they get better, so the router picks them more…). An auxiliary loss penalizes unequal expert utilization.

**Expert capacity:** Each expert can process at most C tokens per batch. Tokens assigned to a full expert are dropped (training) or routed to a fallback (inference).`,
    keyInsight: "MoE is conditional computation: different 'specialists' handle different kinds of tokens. The model learns to route syntax to one expert, math to another, code to another.",
    examples: [
      {
        title: "Mixtral-8x7B",
        body: "8 experts, each 7B parameters → 47B total. 2 experts activated per token → 13B activated. Inference cost ≈ 13B dense model. Performance ≈ 70B dense model. Open source and runs on 2× A100.",
      },
      {
        title: "GPT-4 (estimated)",
        body: "Estimated 16 experts, ~1.8T total parameters, ~220B activated per token. The '8 models in a trenchcoat' architecture explains why it's both very capable and reasonably fast.",
      },
      {
        title: "Expert specialization",
        body: "Analysis of Mixtral's routing shows clear patterns: certain experts specialize in Python, others in French, others in mathematical reasoning. The router learned to segment the problem space without being told how.",
      },
    ],
    diagramType: "moe",
    relatedSlugs: ["transformer", "training-pipeline", "quantization"],
  },
  {
    slug: "evaluation",
    title: "LLM Evaluation & Benchmarks",
    tagline: "How to measure whether your model is actually getting better.",
    level: 2,
    category: "Evaluation",
    order: 18,
    what: `Evaluating LLMs is hard because there's no single right answer. Methods:

**Automated benchmarks:**
- **MMLU** — 57 academic subjects (multiple choice). Tests knowledge breadth.
- **HumanEval / SWE-bench** — coding ability (pass@k).
- **MATH** — competition math, measures multi-step reasoning.
- **HellaSwag, TruthfulQA, BBH** — commonsense, honesty, complex reasoning.

**Model-as-judge (LLM eval):**
Use a strong model (GPT-4) to score responses on a rubric. Fast, scalable, correlates with human judgment. Prone to position bias and length bias.

**Human evaluation:**
Gold standard. Expensive. Used for final comparisons and annotation of new training data.`,
    why: `"Our model is 2% better on MMLU" is meaningless if MMLU doesn't reflect your use case. Choosing the wrong eval leads to:
- Benchmark gaming (training on benchmark data).
- Missing real-world failures (model is great at MMLU but hallucinates medical facts).
- Wrong product decisions (optimizing for a metric that doesn't move user satisfaction).`,
    how: `**Task-specific evals:** Always build evals for your specific use case. 100–200 manually verified examples are worth more than 10k generic benchmark points.

**RAGAS (RAG evaluation):**
- **Faithfulness** — does the answer only claim what's in the retrieved context?
- **Answer relevancy** — does the answer actually address the question?
- **Context recall** — did retrieval find the relevant chunks?

**Vibe evals:** Periodically read 50 random model outputs yourself. You'll notice failure modes that no metric captures.

**Regression testing:** Run evals before and after every fine-tuning run or prompt change. Catch regressions early.`,
    keyInsight: "Goodhart's Law applies to LLMs: any metric used as a target stops being a good metric. Always maintain held-out evals the model has never been optimized for.",
    examples: [
      {
        title: "SWE-bench",
        body: "2,294 real GitHub issues from Python repos. The model must write a code patch that passes the repo's test suite. Claude 3.5 Sonnet: 49% pass rate. GPT-4o: 33%. A much harder and more realistic coding eval than HumanEval.",
      },
      {
        title: "LLM-as-judge pitfalls",
        body: "Studies show GPT-4 as judge prefers longer answers even when shorter ones are better (length bias), and prefers the first option in A/B comparisons (position bias). Mitigation: swap A/B, normalize by length, calibrate against human labels.",
      },
      {
        title: "Production eval pipeline",
        body: "At deployment: 200 golden question-answer pairs (manually verified). Every model version runs against them. Threshold: must not regress more than 2% on any category. Prevents shipping model updates that fix one thing and break another.",
      },
    ],
    diagramType: "none",
    relatedSlugs: ["rlhf", "rag", "training-pipeline"],
  },
  {
    slug: "prompt-engineering",
    title: "Prompt Engineering",
    tagline: "The craft of writing instructions that reliably extract the model's best performance.",
    level: 2,
    category: "LLM Usage",
    order: 19,
    what: `**Prompt engineering** is the practice of designing inputs to LLMs to get reliable, high-quality outputs. It's not magic — it's applying knowledge of how LLMs work to guide their generation.

Core techniques:
- **Zero-shot** — just ask. Works for simple tasks.
- **Few-shot** — provide 3–5 examples of input→output before your actual request.
- **Chain of Thought (CoT)** — "Think step by step." Forces the model to reason before answering.
- **System prompt** — persistent instructions that define the model's role, format, and constraints.
- **Structured output** — "respond in JSON format: {field: value}." Reliable for downstream parsing.`,
    why: `The same model, same weights, can produce wildly different outputs depending on the prompt. A vague prompt gets a vague answer. A specific, well-structured prompt with examples gets a precise, consistent answer.

In production, prompt engineering is the cheapest way to improve output quality — no training cost, no latency change, results in minutes.`,
    how: `**Effective prompt structure:**
1. Role / persona ("You are an expert data engineer…")
2. Task description (what to do)
3. Context (relevant background)
4. Output format (how to respond)
5. Examples (few-shot)
6. Constraints (what not to do)

**CoT variants:**
- "Think step by step" — basic CoT.
- "Let's verify step by step" — self-consistency check.
- "First, break this into sub-problems" — decomposition.

**ReAct prompting:** Alternate Thought → Action → Observation in the prompt to guide agents.`,
    keyInsight: "LLMs are next-token predictors. A good prompt is one that, given how the model was trained, makes the correct answer the most likely completion.",
    examples: [
      {
        title: "CoT on math",
        body: "Without CoT: 'A bat and ball cost $1.10. The bat costs $1 more than the ball. How much is the ball?' → '$0.10' (wrong). With 'Think step by step': model writes algebra, gets $0.05 (correct).",
      },
      {
        title: "Few-shot classification",
        body: "Text: 'This is great!' → Sentiment: positive\nText: 'Terrible experience.' → Sentiment: negative\nText: 'It was okay I guess' → Sentiment: [model correctly outputs 'neutral' without being told what neutral means]",
      },
      {
        title: "Output format control",
        body: "Prompt: 'Extract entities. Respond ONLY as JSON: {\"people\": [], \"orgs\": [], \"dates\": []}.' — This eliminates the model wrapping its answer in prose ('Here are the entities I found: ...'). Downstream code can json.parse() reliably.",
      },
    ],
    diagramType: "none",
    relatedSlugs: ["agent", "evaluation", "inference-basics"],
  },
];

export function getConcept(slug: string): Concept | undefined {
  return CONCEPTS.find((c) => c.slug === slug);
}

export const CATEGORIES = [
  { id: "ML Foundations", icon: "🧱", desc: "The mathematical building blocks of all modern AI" },
  { id: "Attention & Transformers", icon: "🔍", desc: "The architecture powering GPT, Claude, and Gemini" },
  { id: "Language Models", icon: "📝", desc: "How LLMs tokenize, predict, and generate text" },
  { id: "Training", icon: "⚙️", desc: "Pretraining, SFT, RLHF, LoRA — how models are built" },
  { id: "Inference", icon: "⚡", desc: "KV cache, quantization, and making models fast" },
  { id: "RAG & Agents", icon: "🔗", desc: "Connect LLMs to real-world data and tools" },
  { id: "Evaluation", icon: "📊", desc: "Benchmarks, metrics, and knowing if it works" },
  { id: "LLM Usage", icon: "💬", desc: "Prompt engineering and applied LLM patterns" },
  { id: "Advanced", icon: "🚀", desc: "MoE, Constitutional AI, and frontier techniques" },
];

export const LEARNING_PATH: string[] = [
  "ml-basics",
  "neural-networks",
  "backpropagation",
  "training-dynamics",
  "attention",
  "transformer",
  "language-models",
  "training-pipeline",
  "lora",
  "rlhf",
  "inference-basics",
  "kv-cache",
  "rag",
  "embeddings",
  "agent",
  "quantization",
  "prompt-engineering",
  "evaluation",
  "moe",
];
