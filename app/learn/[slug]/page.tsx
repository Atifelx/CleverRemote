import { notFound } from "next/navigation";
import Link from "next/link";
import { CONCEPTS, LEARNING_PATH, getConcept } from "@/lib/learn-data";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return CONCEPTS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const concept = getConcept(slug);
  if (!concept) return {};
  return { title: `${concept.title} — Learn ML | CleverRemote` };
}

// ── Inline SVG Diagrams ──────────────────────────────────────────────────────

function NeuronDiagram() {
  return (
    <svg viewBox="0 0 500 200" className="w-full max-w-lg mx-auto" aria-label="Single neuron diagram">
      {/* Inputs */}
      {[60, 100, 140].map((y, i) => (
        <g key={i}>
          <circle cx={80} cy={y} r={18} fill="none" stroke="rgb(var(--accent))" strokeWidth="1.5" />
          <text x={80} y={y + 5} textAnchor="middle" fontSize="11" fill="rgb(var(--fg-soft))">x{i + 1}</text>
          <line x1={98} y1={y} x2={220} y2={100} stroke="rgb(var(--border-strong))" strokeWidth="1" markerEnd="url(#arr)" />
          <text x={155} y={y - 4} fontSize="9" fill="rgb(var(--muted))">w{i + 1}</text>
        </g>
      ))}
      {/* Neuron */}
      <circle cx={250} cy={100} r={32} fill="rgb(var(--accent))/10" stroke="rgb(var(--accent))" strokeWidth="2" />
      <text x={250} y={94} textAnchor="middle" fontSize="9" fill="rgb(var(--fg-soft))">Σ(wᵢxᵢ+b)</text>
      <text x={250} y={110} textAnchor="middle" fontSize="9" fill="rgb(var(--fg-soft))">→ activation</text>
      {/* Output */}
      <line x1={282} y1={100} x2={390} y2={100} stroke="rgb(var(--border-strong))" strokeWidth="1.5" markerEnd="url(#arr)" />
      <circle cx={410} cy={100} r={18} fill="none" stroke="rgb(var(--medium))" strokeWidth="1.5" />
      <text x={410} y={105} textAnchor="middle" fontSize="11" fill="rgb(var(--fg-soft))">y</text>
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="rgb(var(--border-strong))" />
        </marker>
      </defs>
    </svg>
  );
}

function NNLayersDiagram() {
  const layers = [
    { label: "Input", nodes: 4, x: 60 },
    { label: "Hidden 1", nodes: 5, x: 200 },
    { label: "Hidden 2", nodes: 4, x: 340 },
    { label: "Output", nodes: 2, x: 480 },
  ];
  const H = 200;
  const nodeR = 14;
  const colors = ["rgb(var(--accent))", "#60a5fa", "#a78bfa", "rgb(var(--medium))"];

  return (
    <svg viewBox="0 0 560 220" className="w-full max-w-2xl mx-auto" aria-label="Neural network layers">
      {/* Connections */}
      {layers.slice(0, -1).map((layer, li) => {
        const nextLayer = layers[li + 1];
        const ys = (n: number) =>
          Array.from({ length: n }, (_, i) => H / 2 - ((n - 1) * 30) / 2 + i * 30);
        return ys(layer.nodes).flatMap((y1, i) =>
          ys(nextLayer.nodes).map((y2, j) => (
            <line
              key={`${li}-${i}-${j}`}
              x1={layer.x}
              y1={y1 + 10}
              x2={nextLayer.x}
              y2={y2 + 10}
              stroke="rgb(var(--border))"
              strokeWidth="0.8"
            />
          ))
        );
      })}
      {/* Nodes */}
      {layers.map((layer, li) => {
        const ys = Array.from(
          { length: layer.nodes },
          (_, i) => H / 2 - ((layer.nodes - 1) * 30) / 2 + i * 30
        );
        return (
          <g key={li}>
            {ys.map((y, ni) => (
              <circle key={ni} cx={layer.x} cy={y + 10} r={nodeR} fill={colors[li] + "33"} stroke={colors[li]} strokeWidth="1.5" />
            ))}
            <text x={layer.x} y={H / 2 + (layer.nodes * 30) / 2 + 22} textAnchor="middle" fontSize="10" fill="rgb(var(--muted))">
              {layer.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function AttentionDiagram() {
  return (
    <svg viewBox="0 0 560 260" className="w-full max-w-2xl mx-auto" aria-label="Attention mechanism">
      {/* Tokens */}
      {["The", "cat", "sat", "mat"].map((tok, i) => (
        <g key={i}>
          <rect x={30 + i * 110} y={200} width={80} height={30} rx="6" fill="rgb(var(--panel-2))" stroke="rgb(var(--border))" strokeWidth="1" />
          <text x={70 + i * 110} y={220} textAnchor="middle" fontSize="12" fill="rgb(var(--fg-soft))">{tok}</text>
        </g>
      ))}
      {/* Q K V labels */}
      {["Q", "K", "V"].map((label, i) => (
        <text key={label} x={68} y={160 - i * 30} fontSize="11" fill="rgb(var(--muted))" textAnchor="middle">{label}</text>
      ))}
      {/* Attention scores (highlight "cat" attending to "cat") */}
      <rect x={140} y={80} width={80} height={30} rx="6" fill="rgb(var(--accent))/20" stroke="rgb(var(--accent))" strokeWidth="1.5" />
      <text x={180} y={100} textAnchor="middle" fontSize="11" fill="rgb(var(--accent))">0.72</text>
      <rect x={30} y={80} width={80} height={30} rx="6" fill="rgb(var(--panel-2))" stroke="rgb(var(--border))" strokeWidth="1" />
      <text x={70} y={100} textAnchor="middle" fontSize="11" fill="rgb(var(--muted))">0.08</text>
      <rect x={250} y={80} width={80} height={30} rx="6" fill="rgb(var(--panel-2))" stroke="rgb(var(--border))" strokeWidth="1" />
      <text x={290} y={100} textAnchor="middle" fontSize="11" fill="rgb(var(--muted))">0.12</text>
      <rect x={360} y={80} width={80} height={30} rx="6" fill="rgb(var(--panel-2))" stroke="rgb(var(--border))" strokeWidth="1" />
      <text x={400} y={100} textAnchor="middle" fontSize="11" fill="rgb(var(--muted))">0.08</text>
      <text x={280} y={60} textAnchor="middle" fontSize="11" fill="rgb(var(--muted))">Attention weights when generating "cat" output</text>
      {/* Arrow from "cat" input upward */}
      <line x1={180} y1={200} x2={180} y2={112} stroke="rgb(var(--accent))" strokeWidth="1.5" strokeDasharray="4" />
      <text x={280} y={30} textAnchor="middle" fontSize="10" fill="rgb(var(--muted))">softmax(Q·Kᵀ/√d) → weights → weighted sum of V</text>
    </svg>
  );
}

function TransformerDiagram() {
  return (
    <svg viewBox="0 0 400 380" className="w-full max-w-sm mx-auto" aria-label="Transformer block">
      {/* Output */}
      <rect x={120} y={20} width={160} height={36} rx="8" fill="rgb(var(--medium))/15" stroke="rgb(var(--medium))" strokeWidth="1.5" />
      <text x={200} y={43} textAnchor="middle" fontSize="12" fill="rgb(var(--medium))">Output Probabilities</text>
      {/* Linear */}
      <rect x={130} y={76} width={140} height={30} rx="6" fill="rgb(var(--panel-2))" stroke="rgb(var(--border))" strokeWidth="1" />
      <text x={200} y={96} textAnchor="middle" fontSize="11" fill="rgb(var(--fg-soft))">Linear + Softmax</text>
      {/* Block × N */}
      <rect x={80} y={126} width={240} height={160} rx="10" fill="rgb(var(--accent))/5" stroke="rgb(var(--accent))/40" strokeWidth="1.5" strokeDasharray="6" />
      <text x={330} y={150} fontSize="10" fill="rgb(var(--accent))/60">× N</text>
      {/* FFN */}
      <rect x={110} y={140} width={180} height={34} rx="6" fill="rgb(var(--panel-2))" stroke="rgb(var(--border))" strokeWidth="1" />
      <text x={200} y={162} textAnchor="middle" fontSize="11" fill="rgb(var(--fg-soft))">Feed-Forward (FFN)</text>
      {/* Add & Norm */}
      <rect x={140} y={186} width={120} height={24} rx="5" fill="rgb(var(--panel))" stroke="rgb(var(--border-strong))" strokeWidth="1" />
      <text x={200} y={203} textAnchor="middle" fontSize="10" fill="rgb(var(--muted))">Add & LayerNorm</text>
      {/* Attention */}
      <rect x={110} y={222} width={180} height={34} rx="6" fill="rgb(var(--accent))/15" stroke="rgb(var(--accent))" strokeWidth="1.5" />
      <text x={200} y={244} textAnchor="middle" fontSize="11" fill="rgb(var(--accent))">Multi-Head Attention</text>
      {/* Add & Norm 2 */}
      <rect x={140} y={268} width={120} height={24} rx="5" fill="rgb(var(--panel))" stroke="rgb(var(--border-strong))" strokeWidth="1" />
      <text x={200} y={285} textAnchor="middle" fontSize="10" fill="rgb(var(--muted))">Add & LayerNorm</text>
      {/* Input embedding */}
      <rect x={120} y={314} width={160} height={34} rx="6" fill="rgb(var(--panel-2))" stroke="rgb(var(--border))" strokeWidth="1" />
      <text x={200} y={326} textAnchor="middle" fontSize="10" fill="rgb(var(--fg-soft))">Token Embedding</text>
      <text x={200} y={340} textAnchor="middle" fontSize="10" fill="rgb(var(--muted))">+ Positional Encoding</text>
      {/* Arrows */}
      {[[200,106,200,126],[200,200,200,222],[200,292,200,314]].map(([x1,y1,x2,y2],i)=>(
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgb(var(--border-strong))" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

function TrainingPipelineDiagram() {
  const stages = [
    { label: "Pretraining", sub: "Trillions of tokens\nNext-token prediction", color: "rgb(var(--accent))" },
    { label: "SFT", sub: "10k–100k examples\nPrompt → ideal response", color: "#60a5fa" },
    { label: "Alignment", sub: "RLHF or DPO\nHuman preferences", color: "#a78bfa" },
    { label: "ChatGPT / Claude", sub: "Helpful, harmless,\nhonest assistant", color: "rgb(var(--medium))" },
  ];
  return (
    <svg viewBox="0 0 560 140" className="w-full max-w-2xl mx-auto" aria-label="LLM training pipeline">
      {stages.map((s, i) => (
        <g key={i}>
          <rect x={10 + i * 138} y={30} width={120} height={70} rx="10" fill={s.color + "22"} stroke={s.color} strokeWidth="1.5" />
          <text x={70 + i * 138} y={55} textAnchor="middle" fontSize="12" fontWeight="600" fill={s.color}>{s.label}</text>
          {s.sub.split("\n").map((line, li) => (
            <text key={li} x={70 + i * 138} y={72 + li * 14} textAnchor="middle" fontSize="9" fill="rgb(var(--muted))">{line}</text>
          ))}
          {i < stages.length - 1 && (
            <path d={`M${132 + i * 138},65 L${146 + i * 138},65`} stroke="rgb(var(--border-strong))" strokeWidth="2" markerEnd="url(#arr2)" />
          )}
        </g>
      ))}
      <defs>
        <marker id="arr2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="rgb(var(--border-strong))" />
        </marker>
      </defs>
    </svg>
  );
}

function LoraDiagram() {
  return (
    <svg viewBox="0 0 460 200" className="w-full max-w-xl mx-auto" aria-label="LoRA diagram">
      {/* Frozen W */}
      <rect x={30} y={50} width={140} height={100} rx="10" fill="rgb(var(--panel-2))" stroke="rgb(var(--border))" strokeWidth="2" />
      <text x={100} y={95} textAnchor="middle" fontSize="14" fontWeight="700" fill="rgb(var(--fg-soft))">W</text>
      <text x={100} y={112} textAnchor="middle" fontSize="10" fill="rgb(var(--muted))">Frozen (billions)</text>
      <text x={100} y={126} textAnchor="middle" fontSize="9" fill="rgb(var(--muted))">(not updated)</text>
      {/* Plus */}
      <text x={195} y={110} textAnchor="middle" fontSize="22" fill="rgb(var(--fg-soft))">+</text>
      {/* LoRA AB */}
      <rect x={215} y={50} width={60} height={45} rx="8" fill="rgb(var(--accent))/15" stroke="rgb(var(--accent))" strokeWidth="1.5" />
      <text x={245} y={75} textAnchor="middle" fontSize="13" fontWeight="700" fill="rgb(var(--accent))">A</text>
      <text x={245} y={88} textAnchor="middle" fontSize="9" fill="rgb(var(--accent))/70">d×r</text>
      <rect x={215} y={105} width={60} height={45} rx="8" fill="rgb(var(--accent))/15" stroke="rgb(var(--accent))" strokeWidth="1.5" />
      <text x={245} y={130} textAnchor="middle" fontSize="13" fontWeight="700" fill="rgb(var(--accent))">B</text>
      <text x={245} y={143} textAnchor="middle" fontSize="9" fill="rgb(var(--accent))/70">r×k</text>
      <text x={245} y={170} textAnchor="middle" fontSize="9" fill="rgb(var(--accent))">Trainable! (tiny)</text>
      {/* = W' */}
      <text x={300} y={110} textAnchor="middle" fontSize="22" fill="rgb(var(--fg-soft)">=</text>
      <rect x={315} y={50} width={120} height={100} rx="10" fill="rgb(var(--medium))/15" stroke="rgb(var(--medium))" strokeWidth="1.5" />
      <text x={375} y={95} textAnchor="middle" fontSize="14" fontWeight="700" fill="rgb(var(--medium))">W + AB</text>
      <text x={375} y={112} textAnchor="middle" fontSize="10" fill="rgb(var(--muted))">Merged at inference</text>
      <text x={375} y={126} textAnchor="middle" fontSize="9" fill="rgb(var(--muted))">zero extra cost</text>
    </svg>
  );
}

function KVCacheDiagram() {
  return (
    <svg viewBox="0 0 520 220" className="w-full max-w-xl mx-auto" aria-label="KV cache diagram">
      <text x={260} y={22} textAnchor="middle" fontSize="12" fill="rgb(var(--muted))">Generating token #5 — cache holds K,V for tokens 1-4</text>
      {/* Cached tokens */}
      {["T1", "T2", "T3", "T4"].map((t, i) => (
        <g key={i}>
          <rect x={20 + i * 100} y={40} width={80} height={50} rx="8" fill="rgb(var(--panel-2))" stroke="rgb(var(--border))" strokeWidth="1" />
          <text x={60 + i * 100} y={60} textAnchor="middle" fontSize="11" fill="rgb(var(--fg-soft))">{t}</text>
          <text x={60 + i * 100} y={76} textAnchor="middle" fontSize="9" fill="rgb(var(--accent))">K✓ V✓</text>
          <text x={60 + i * 100} y={89} textAnchor="middle" fontSize="8" fill="rgb(var(--muted))">cached</text>
        </g>
      ))}
      {/* New token */}
      <rect x={420} y={40} width={80} height={50} rx="8" fill="rgb(var(--medium))/15" stroke="rgb(var(--medium))" strokeWidth="2" />
      <text x={460} y={60} textAnchor="middle" fontSize="11" fill="rgb(var(--medium))">T5 (new)</text>
      <text x={460} y={76} textAnchor="middle" fontSize="9" fill="rgb(var(--medium))">compute Q</text>
      <text x={460} y={89} textAnchor="middle" fontSize="8" fill="rgb(var(--medium))">K, V only</text>
      {/* Arrow to attention */}
      <text x={260} y={130} textAnchor="middle" fontSize="11" fill="rgb(var(--fg-soft))">Attention = softmax(Q₅ · [K₁,K₂,K₃,K₄,K₅]ᵀ/√d) · [V₁…V₅]</text>
      <text x={260} y={150} textAnchor="middle" fontSize="10" fill="rgb(var(--accent))">No recomputation of K₁–K₄! Saved 80% of attention work.</text>
      <rect x={60} y={165} width={400} height={36} rx="8" fill="rgb(var(--accent))/8" stroke="rgb(var(--accent))/30" strokeWidth="1" />
      <text x={260} y={180} textAnchor="middle" fontSize="10" fill="rgb(var(--muted))">KV Cache in GPU memory grows by 1 row per new token.</text>
      <text x={260} y={194} textAnchor="middle" fontSize="10" fill="rgb(var(--muted))">Cost per step: O(N) not O(N²).</text>
    </svg>
  );
}

function RAGDiagram() {
  return (
    <svg viewBox="0 0 560 280" className="w-full max-w-2xl mx-auto" aria-label="RAG architecture">
      {/* Query */}
      <rect x={20} y={20} width={120} height={36} rx="8" fill="rgb(var(--panel-2))" stroke="rgb(var(--border))" strokeWidth="1" />
      <text x={80} y={43} textAnchor="middle" fontSize="11" fill="rgb(var(--fg-soft))">User Query</text>
      {/* Embed */}
      <rect x={20} y={80} width={120} height={36} rx="8" fill="rgb(var(--accent))/10" stroke="rgb(var(--accent))" strokeWidth="1.5" />
      <text x={80} y={103} textAnchor="middle" fontSize="11" fill="rgb(var(--accent))">Embed Query</text>
      {/* Vector DB */}
      <rect x={200} y={80} width={140} height={80} rx="10" fill="rgb(var(--medium))/10" stroke="rgb(var(--medium))" strokeWidth="1.5" />
      <text x={270} y={108} textAnchor="middle" fontSize="12" fontWeight="600" fill="rgb(var(--medium))">Vector DB</text>
      <text x={270} y={124} textAnchor="middle" fontSize="9" fill="rgb(var(--muted))">millions of embeddings</text>
      <text x={270} y={138} textAnchor="middle" fontSize="9" fill="rgb(var(--muted))">ANN search → top-k chunks</text>
      <text x={270} y={152} textAnchor="middle" fontSize="9" fill="rgb(var(--medium))">cosine similarity</text>
      {/* Retrieved chunks */}
      <rect x={200} y={190} width={140} height={36} rx="8" fill="rgb(var(--panel-2))" stroke="rgb(var(--border))" strokeWidth="1" />
      <text x={270} y={213} textAnchor="middle" fontSize="11" fill="rgb(var(--fg-soft))">Retrieved Chunks (3-5)</text>
      {/* LLM */}
      <rect x={390} y={130} width={140} height={80} rx="10" fill="rgb(var(--accent))/10" stroke="rgb(var(--accent))" strokeWidth="2" />
      <text x={460} y={158} textAnchor="middle" fontSize="12" fontWeight="600" fill="rgb(var(--accent))">LLM</text>
      <text x={460} y={174} textAnchor="middle" fontSize="9" fill="rgb(var(--muted))">System + Chunks</text>
      <text x={460} y={188} textAnchor="middle" fontSize="9" fill="rgb(var(--muted))">+ Query → Answer</text>
      {/* Answer */}
      <rect x={390} y={240} width={140} height={36} rx="8" fill="rgb(var(--medium))/15" stroke="rgb(var(--medium))" strokeWidth="1.5" />
      <text x={460} y={263} textAnchor="middle" fontSize="11" fill="rgb(var(--medium))">Grounded Answer</text>
      {/* Arrows */}
      <line x1={80} y1={56} x2={80} y2={80} stroke="rgb(var(--border-strong))" strokeWidth="1.5" />
      <line x1={140} y1={98} x2={200} y2={118} stroke="rgb(var(--border-strong))" strokeWidth="1.5" />
      <line x1={270} y1={160} x2={270} y2={190} stroke="rgb(var(--border-strong))" strokeWidth="1.5" />
      <line x1={340} y1={208} x2={390} y2={190} stroke="rgb(var(--border-strong))" strokeWidth="1.5" />
      <line x1={460} y1={210} x2={460} y2={240} stroke="rgb(var(--border-strong))" strokeWidth="1.5" />
    </svg>
  );
}

function AgentDiagram() {
  return (
    <svg viewBox="0 0 500 300" className="w-full max-w-xl mx-auto" aria-label="Agent loop diagram">
      {/* LLM center */}
      <circle cx={250} cy={150} r={52} fill="rgb(var(--accent))/10" stroke="rgb(var(--accent))" strokeWidth="2" />
      <text x={250} y={144} textAnchor="middle" fontSize="13" fontWeight="700" fill="rgb(var(--accent))">LLM</text>
      <text x={250} y={160} textAnchor="middle" fontSize="10" fill="rgb(var(--accent))/70">Thinks & Plans</text>
      {/* Tools around it */}
      {[
        { label: "Web Search", x: 60, y: 50 },
        { label: "Code Runner", x: 380, y: 50 },
        { label: "Database", x: 60, y: 240 },
        { label: "API Call", x: 380, y: 240 },
      ].map((tool) => (
        <g key={tool.label}>
          <rect x={tool.x - 45} y={tool.y - 18} width={90} height={36} rx="8" fill="rgb(var(--panel-2))" stroke="rgb(var(--border))" strokeWidth="1" />
          <text x={tool.x} y={tool.y + 5} textAnchor="middle" fontSize="10" fill="rgb(var(--fg-soft))">{tool.label}</text>
          <line x1={tool.x} y1={tool.y + (tool.y < 150 ? 18 : -18)} x2={250} y2={150} stroke="rgb(var(--border))" strokeWidth="1" strokeDasharray="4" />
        </g>
      ))}
      {/* Loop label */}
      <text x={250} y={290} textAnchor="middle" fontSize="11" fill="rgb(var(--muted))">Think → Act → Observe → Repeat until done</text>
    </svg>
  );
}

function QuantizationDiagram() {
  const formats = [
    { label: "FP32", bits: 32, quality: 100, size: "4 bytes", color: "#ef4444" },
    { label: "FP16", bits: 16, quality: 99.9, size: "2 bytes", color: "#f97316" },
    { label: "INT8", bits: 8, quality: 99.5, size: "1 byte", color: "#eab308" },
    { label: "INT4", bits: 4, quality: 97, size: "0.5 bytes", color: "#22c55e" },
  ];
  return (
    <svg viewBox="0 0 500 200" className="w-full max-w-xl mx-auto" aria-label="Quantization formats">
      {formats.map((f, i) => (
        <g key={f.label}>
          <text x={20} y={40 + i * 44} fontSize="12" fontWeight="600" fill="rgb(var(--fg-soft))">{f.label}</text>
          <rect x={80} y={24 + i * 44} width={f.quality * 3} height={26} rx="5" fill={f.color + "33"} stroke={f.color} strokeWidth="1.5" />
          <text x={80 + f.quality * 3 + 6} y={42 + i * 44} fontSize="10" fill="rgb(var(--muted))">{f.size}/weight · {f.quality}% quality</text>
        </g>
      ))}
      <text x={250} y={188} textAnchor="middle" fontSize="10" fill="rgb(var(--muted))">Smaller = less VRAM, faster inference, slight quality cost</text>
    </svg>
  );
}

function MoEDiagram() {
  return (
    <svg viewBox="0 0 500 240" className="w-full max-w-xl mx-auto" aria-label="Mixture of Experts">
      {/* Token */}
      <rect x={20} y={100} width={80} height={40} rx="8" fill="rgb(var(--panel-2))" stroke="rgb(var(--border))" strokeWidth="1" />
      <text x={60} y={125} textAnchor="middle" fontSize="12" fill="rgb(var(--fg-soft))">Token</text>
      {/* Router */}
      <rect x={150} y={100} width={80} height={40} rx="8" fill="rgb(var(--accent))/15" stroke="rgb(var(--accent))" strokeWidth="1.5" />
      <text x={190} y={118} textAnchor="middle" fontSize="11" fill="rgb(var(--accent))">Router</text>
      <text x={190} y={133} textAnchor="middle" fontSize="9" fill="rgb(var(--accent))/70">picks top-2</text>
      {/* Experts */}
      {[0, 1, 2, 3].map((i) => {
        const y = 30 + i * 55;
        const active = i === 1 || i === 2;
        return (
          <g key={i}>
            <rect x={300} y={y} width={100} height={40} rx="8"
              fill={active ? "rgb(var(--medium))/15" : "rgb(var(--panel))"}
              stroke={active ? "rgb(var(--medium))" : "rgb(var(--border))"} strokeWidth={active ? 2 : 1} />
            <text x={350} y={y + 18} textAnchor="middle" fontSize="11"
              fill={active ? "rgb(var(--medium))" : "rgb(var(--muted))"}>{`Expert ${i + 1}`}</text>
            <text x={350} y={y + 32} textAnchor="middle" fontSize="9"
              fill={active ? "rgb(var(--medium))" : "rgb(var(--muted))"}>{active ? "activated ✓" : "skipped"}</text>
            <line x1={230} y1={120} x2={300} y2={y + 20} stroke={active ? "rgb(var(--medium))" : "rgb(var(--border))"}
              strokeWidth={active ? 2 : 0.8} strokeDasharray={active ? "0" : "3"} />
          </g>
        );
      })}
      <line x1={100} y1={120} x2={150} y2={120} stroke="rgb(var(--border-strong))" strokeWidth="1.5" />
      <text x={250} y={225} textAnchor="middle" fontSize="10" fill="rgb(var(--muted))">1T total params · only 2 experts active per token · inference cost = 2 expert FFNs</text>
    </svg>
  );
}

function RLHFDiagram() {
  return (
    <svg viewBox="0 0 520 220" className="w-full max-w-xl mx-auto" aria-label="RLHF pipeline">
      {[
        { label: "Human Raters", sub: "Compare A vs B", color: "#60a5fa", x: 20 },
        { label: "Reward Model", sub: "Learns preference score", color: "#a78bfa", x: 160 },
        { label: "PPO / DPO", sub: "RL optimization", color: "rgb(var(--accent))", x: 300 },
        { label: "Aligned LLM", sub: "Helpful + Harmless", color: "rgb(var(--medium))", x: 400 },
      ].map((s, i) => (
        <g key={i}>
          <rect x={s.x} y={70} width={130} height={60} rx="10" fill={s.color + "22"} stroke={s.color} strokeWidth="1.5" />
          <text x={s.x + 65} y={97} textAnchor="middle" fontSize="11" fontWeight="600" fill={s.color}>{s.label}</text>
          <text x={s.x + 65} y={114} textAnchor="middle" fontSize="9" fill="rgb(var(--muted))">{s.sub}</text>
          {i < 2 && (
            <path d={`M${s.x + 130},100 L${s.x + 155},100`} stroke="rgb(var(--border-strong))" strokeWidth="1.5" markerEnd="url(#a3)" />
          )}
        </g>
      ))}
      <defs>
        <marker id="a3" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="rgb(var(--border-strong))" />
        </marker>
      </defs>
      <text x={260} y={30} textAnchor="middle" fontSize="11" fill="rgb(var(--muted))">RLHF: Human feedback → Reward model → RL loop → Aligned model</text>
    </svg>
  );
}

function RegressionDiagram() {
  // Scatter plot with regression line
  const points = [[1,2],[2,3.2],[3,2.8],[4,4.5],[5,4.2],[6,5.8],[7,6.1],[8,7.5]];
  const scaleX = (x: number) => 60 + x * 52;
  const scaleY = (y: number) => 200 - y * 22;
  return (
    <svg viewBox="0 0 500 240" className="w-full max-w-xl mx-auto" aria-label="Linear regression diagram">
      {/* Axes */}
      <line x1={60} y1={20} x2={60} y2={205} stroke="rgb(var(--border-strong))" strokeWidth="1.5"/>
      <line x1={55} y1={200} x2={490} y2={200} stroke="rgb(var(--border-strong))" strokeWidth="1.5"/>
      <text x={270} y={230} textAnchor="middle" fontSize="11" fill="rgb(var(--muted))">Feature (e.g. house size m²)</text>
      <text x={20} y={110} fontSize="11" fill="rgb(var(--muted))" transform="rotate(-90,20,110)">Price ($k)</text>
      {/* Regression line y = 0.85x + 1.2 */}
      <line x1={scaleX(0.5)} y1={scaleY(1.6)} x2={scaleX(8.5)} y2={scaleY(8.4)} stroke="rgb(var(--accent))" strokeWidth="2"/>
      {/* Residual lines */}
      {points.map(([x, y], i) => {
        const predY = 0.85 * x + 1.2;
        return <line key={i} x1={scaleX(x)} y1={scaleY(y)} x2={scaleX(x)} y2={scaleY(predY)} stroke="rgb(var(--medium))" strokeWidth="1" strokeDasharray="3" opacity="0.6"/>;
      })}
      {/* Data points */}
      {points.map(([x, y], i) => (
        <circle key={i} cx={scaleX(x)} cy={scaleY(y)} r={5} fill="rgb(var(--fg-soft))" stroke="rgb(var(--panel))" strokeWidth="1.5"/>
      ))}
      <text x={400} y={70} fontSize="10" fill="rgb(var(--accent))">ŷ = w₁x + b</text>
      <text x={400} y={84} fontSize="9" fill="rgb(var(--muted))">minimises MSE</text>
      <text x={240} y={120} fontSize="9" fill="rgb(var(--medium))">residual error</text>
    </svg>
  );
}

function DecisionTreeDiagram() {
  return (
    <svg viewBox="0 0 520 280" className="w-full max-w-xl mx-auto" aria-label="Decision tree diagram">
      {/* Root */}
      <rect x={190} y={20} width={140} height={40} rx="8" fill="rgb(var(--accent))/15" stroke="rgb(var(--accent))" strokeWidth="1.5"/>
      <text x={260} y={37} textAnchor="middle" fontSize="11" fontWeight="600" fill="rgb(var(--accent))">Income &gt; $50k?</text>
      <text x={260} y={52} textAnchor="middle" fontSize="9" fill="rgb(var(--muted))">feature split</text>
      {/* Yes branch */}
      <line x1={240} y1={60} x2={140} y2={110} stroke="rgb(var(--border-strong))" strokeWidth="1.5"/>
      <text x={175} y={92} fontSize="10" fill="rgb(var(--muted))">Yes</text>
      <rect x={70} y={110} width={140} height={40} rx="8" fill="rgb(var(--panel-2))" stroke="rgb(var(--border))" strokeWidth="1"/>
      <text x={140} y={127} textAnchor="middle" fontSize="11" fill="rgb(var(--fg-soft))">Age &gt; 30?</text>
      <text x={140} y={142} textAnchor="middle" fontSize="9" fill="rgb(var(--muted))">next split</text>
      {/* No branch */}
      <line x1={280} y1={60} x2={380} y2={110} stroke="rgb(var(--border-strong))" strokeWidth="1.5"/>
      <text x={342} y={92} fontSize="10" fill="rgb(var(--muted))">No</text>
      <rect x={310} y={110} width={140} height={40} rx="8" fill="rgb(var(--panel-2))" stroke="rgb(var(--border))" strokeWidth="1"/>
      <text x={380} y={134} textAnchor="middle" fontSize="11" fill="rgb(var(--fg-soft))">Low Risk</text>
      {/* Age Yes */}
      <line x1={120} y1={150} x2={80} y2={200} stroke="rgb(var(--border-strong))" strokeWidth="1.5"/>
      <text x={90} y={183} fontSize="10" fill="rgb(var(--muted))">Yes</text>
      <rect x={20} y={200} width={120} height={36} rx="8" fill="rgb(var(--medium))/15" stroke="rgb(var(--medium))" strokeWidth="1.5"/>
      <text x={80} y={223} textAnchor="middle" fontSize="11" fontWeight="600" fill="rgb(var(--medium))">High Risk ✓</text>
      {/* Age No */}
      <line x1={160} y1={150} x2={200} y2={200} stroke="rgb(var(--border-strong))" strokeWidth="1.5"/>
      <text x={185} y={183} fontSize="10" fill="rgb(var(--muted))">No</text>
      <rect x={150} y={200} width={120} height={36} rx="8" fill="rgb(var(--easy))/15" stroke="rgb(var(--easy))" strokeWidth="1.5"/>
      <text x={210} y={223} textAnchor="middle" fontSize="11" fontWeight="600" fill="rgb(var(--easy))">Medium Risk</text>
      <text x={260} y={265} textAnchor="middle" fontSize="10" fill="rgb(var(--muted))">Each node splits on the feature that best separates classes (Gini / Information Gain)</text>
    </svg>
  );
}

function ClusteringDiagram() {
  const clusters = [
    { cx: 120, cy: 100, color: "rgb(var(--accent))", pts: [[95,80],[110,115],[140,90],[100,130],[130,75]] },
    { cx: 300, cy: 140, color: "rgb(var(--medium))", pts: [[275,120],[315,155],[285,165],[320,125],[295,100]] },
    { cx: 200, cy: 200, color: "#a78bfa", pts: [[175,185],[215,215],[195,230],[225,185],[180,210]] },
  ];
  return (
    <svg viewBox="0 0 440 280" className="w-full max-w-xl mx-auto" aria-label="K-Means clustering">
      <text x={220} y={20} textAnchor="middle" fontSize="12" fill="rgb(var(--muted))">K-Means: K=3 clusters</text>
      {clusters.map((cl, ci) => (
        <g key={ci}>
          {/* Points */}
          {cl.pts.map(([x, y], pi) => (
            <circle key={pi} cx={x} cy={y} r={6} fill={cl.color + "60"} stroke={cl.color} strokeWidth="1.5"/>
          ))}
          {/* Centroid */}
          <circle cx={cl.cx} cy={cl.cy} r={10} fill={cl.color} stroke="rgb(var(--panel))" strokeWidth="2"/>
          <text x={cl.cx} y={cl.cy + 4} textAnchor="middle" fontSize="9" fontWeight="700" fill="white">μ</text>
          {/* Lines to centroid */}
          {cl.pts.map(([x, y], pi) => (
            <line key={pi} x1={x} y1={y} x2={cl.cx} y2={cl.cy} stroke={cl.color} strokeWidth="0.8" opacity="0.4"/>
          ))}
        </g>
      ))}
      <text x={220} y={260} textAnchor="middle" fontSize="10" fill="rgb(var(--muted))">μ = centroid (mean of cluster). Assign → Recompute → Repeat.</text>
    </svg>
  );
}

const DIAGRAM_MAP: Record<string, React.FC> = {
  "nn-layers": NNLayersDiagram,
  "neuron": NeuronDiagram,
  "backprop": () => <NNLayersDiagram />, // simplified stand-in
  "attention": AttentionDiagram,
  "transformer": TransformerDiagram,
  "training-pipeline": TrainingPipelineDiagram,
  "lora": LoraDiagram,
  "kv-cache": KVCacheDiagram,
  "rag": RAGDiagram,
  "agent": AgentDiagram,
  "quantization": QuantizationDiagram,
  "moe": MoEDiagram,
  "rlhf": RLHFDiagram,
  "regression": RegressionDiagram,
  "decision-tree": DecisionTreeDiagram,
  "clustering": ClusteringDiagram,
};

export default async function ConceptPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const concept = getConcept(slug);
  if (!concept) notFound();

  const pathIdx = LEARNING_PATH.indexOf(slug);
  const prevSlug = pathIdx > 0 ? LEARNING_PATH[pathIdx - 1] : null;
  const nextSlug = pathIdx < LEARNING_PATH.length - 1 ? LEARNING_PATH[pathIdx + 1] : null;
  const prevConcept = prevSlug ? getConcept(prevSlug) : null;
  const nextConcept = nextSlug ? getConcept(nextSlug) : null;

  const relatedConcepts = concept.relatedSlugs
    .map((s) => getConcept(s))
    .filter(Boolean) as (typeof CONCEPTS)[0][];

  const DiagramComponent = DIAGRAM_MAP[concept.diagramType];

  const levelColors: Record<number, string> = {
    1: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    2: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
    3: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
  };

  return (
    <div className="max-w-[860px] mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="text-[12px] text-[rgb(var(--muted))] flex items-center gap-2 flex-wrap">
        <Link href="/learn" className="hover:text-[rgb(var(--fg))]">Learn ML</Link>
        <span>/</span>
        <span className="text-[rgb(var(--fg-soft))]">{concept.category}</span>
        <span>/</span>
        <span className="text-[rgb(var(--fg-soft))]">{concept.title}</span>
        {pathIdx >= 0 && (
          <>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-[rgb(var(--panel-2))] text-[rgb(var(--muted))] text-[10px]">
              Step {pathIdx + 1} of {LEARNING_PATH.length}
            </span>
          </>
        )}
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${levelColors[concept.level]}`}>
            Level {concept.level}
          </span>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-[rgb(var(--panel-2))] text-[rgb(var(--muted))] border border-[rgb(var(--border))]">
            {concept.category}
          </span>
        </div>
        <h1 className="text-[30px] font-bold tracking-tight text-[rgb(var(--fg))] leading-tight">
          {concept.title}
        </h1>
        <p className="text-[17px] text-[rgb(var(--fg-soft))] mt-2 leading-relaxed">
          {concept.tagline}
        </p>
      </div>

      {/* Visual diagram */}
      {DiagramComponent && (
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))] mb-4">
            Visual Diagram
          </div>
          <DiagramComponent />
        </div>
      )}

      {/* Key insight callout */}
      <div className="rounded-xl border border-[rgb(var(--accent))]/30 bg-[rgb(var(--accent))]/5 px-5 py-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--accent))] mb-1.5">
          Key Insight
        </div>
        <p className="text-[14px] text-[rgb(var(--fg-soft))] leading-relaxed italic">
          &ldquo;{concept.keyInsight}&rdquo;
        </p>
      </div>

      {/* What / Why / How */}
      {[
        { label: "What is it?", content: concept.what },
        { label: "Why does it matter?", content: concept.why },
        { label: "How does it work?", content: concept.how },
      ].map(({ label, content }) => (
        <div key={label} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6">
          <h2 className="text-[16px] font-semibold text-[rgb(var(--fg))] mb-4">{label}</h2>
          <div className="prose-custom text-[14px] text-[rgb(var(--fg-soft))] leading-relaxed space-y-2">
            {content.split("\n").map((line, i) => {
              if (!line.trim()) return null;
              // Bold formatting
              const parts = line.split(/(\*\*[^*]+\*\*)/g);
              return (
                <p key={i} className={line.startsWith("- ") ? "flex gap-2" : ""}>
                  {line.startsWith("- ") ? (
                    <>
                      <span className="text-[rgb(var(--accent))] flex-shrink-0 mt-0.5">•</span>
                      <span>
                        {parts.map((p, j) =>
                          p.startsWith("**") ? (
                            <strong key={j} className="text-[rgb(var(--fg))] font-semibold">
                              {p.slice(2, -2)}
                            </strong>
                          ) : p.replace(/^- /, "")
                        )}
                      </span>
                    </>
                  ) : (
                    parts.map((p, j) =>
                      p.startsWith("**") ? (
                        <strong key={j} className="text-[rgb(var(--fg))] font-semibold">
                          {p.slice(2, -2)}
                        </strong>
                      ) : p
                    )
                  )}
                </p>
              );
            })}
          </div>
        </div>
      ))}

      {/* Examples */}
      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6">
        <h2 className="text-[16px] font-semibold text-[rgb(var(--fg))] mb-5">
          Real-World Examples
        </h2>
        <div className="space-y-4">
          {concept.examples.map((ex, i) => (
            <div key={i} className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel-2))] p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-[rgb(var(--accent))]/15 text-[rgb(var(--accent))] text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <h3 className="text-[13px] font-semibold text-[rgb(var(--fg))]">{ex.title}</h3>
              </div>
              <p className="text-[13px] text-[rgb(var(--fg-soft))] leading-relaxed pl-8">{ex.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related concepts */}
      {relatedConcepts.length > 0 && (
        <div>
          <h2 className="text-[15px] font-semibold text-[rgb(var(--fg))] mb-3">Related Concepts</h2>
          <div className="flex flex-wrap gap-2">
            {relatedConcepts.map((rc) => (
              <Link
                key={rc.slug}
                href={`/learn/${rc.slug}`}
                className="px-3 py-1.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] text-[13px] text-[rgb(var(--fg-soft))] hover:border-[rgb(var(--accent))]/50 hover:text-[rgb(var(--accent))] transition"
              >
                {rc.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Practice questions link */}
      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[14px] font-medium text-[rgb(var(--fg))]">Test your understanding</p>
          <p className="text-[12px] text-[rgb(var(--muted))] mt-0.5">Practice interview questions on this and related topics.</p>
        </div>
        <Link
          href="/module/ai-engineering-deep"
          className="px-4 py-2 rounded-lg border border-[rgb(var(--accent))] text-[rgb(var(--accent))] text-[13px] font-medium hover:bg-[rgb(var(--accent))]/10 transition flex-shrink-0"
        >
          AI Practice Questions →
        </Link>
      </div>

      {/* Prev / Next navigation */}
      <div className="grid grid-cols-2 gap-3">
        {prevConcept ? (
          <Link
            href={`/learn/${prevConcept.slug}`}
            className="group flex items-center gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 hover:border-[rgb(var(--border-strong))] transition col-start-1"
          >
            <svg className="w-4 h-4 text-[rgb(var(--muted))] group-hover:text-[rgb(var(--accent))] transition flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <div className="min-w-0">
              <div className="text-[10px] text-[rgb(var(--muted))] uppercase tracking-wider">Previous</div>
              <div className="text-[13px] font-medium text-[rgb(var(--fg))] group-hover:text-[rgb(var(--accent))] transition truncate">{prevConcept.title}</div>
            </div>
          </Link>
        ) : <div />}
        {nextConcept && (
          <Link
            href={`/learn/${nextConcept.slug}`}
            className="group flex items-center justify-end gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 hover:border-[rgb(var(--accent))]/50 hover:bg-[rgb(var(--accent))]/5 transition text-right col-start-2"
          >
            <div className="min-w-0">
              <div className="text-[10px] text-[rgb(var(--muted))] uppercase tracking-wider">Next</div>
              <div className="text-[13px] font-medium text-[rgb(var(--fg))] group-hover:text-[rgb(var(--accent))] transition truncate">{nextConcept.title}</div>
            </div>
            <svg className="w-4 h-4 text-[rgb(var(--muted))] group-hover:text-[rgb(var(--accent))] transition flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}
