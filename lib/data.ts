import manifest from "@/data/manifest.json";
import m01 from "@/data/questions/01-javascript.json";
import m02 from "@/data/questions/02-typescript.json";
import m03 from "@/data/questions/03-react.json";
import m04 from "@/data/questions/04-nodejs.json";
import m05 from "@/data/questions/05-dsa-easy.json";
import m06 from "@/data/questions/06-dsa-medium.json";
import m07 from "@/data/questions/07-dsa-hard.json";
import m08 from "@/data/questions/08-sql.json";
import m09 from "@/data/questions/09-system-design.json";
import m10 from "@/data/questions/10-ai-llm.json";
import m11 from "@/data/questions/11-fde-decomposition.json";
import m12 from "@/data/questions/12-fde-client-sim.json";
import m13 from "@/data/questions/13-behavioral.json";
import m14 from "@/data/questions/14-web-protocols-security.json";
import m15 from "@/data/questions/15-distributed-systems.json";
import m16 from "@/data/questions/16-refactoring-debugging.json";
import type { Manifest, Module } from "./types";

const MODULES: Record<string, Module> = Object.fromEntries(
  [m01, m02, m03, m04, m05, m06, m07, m08, m09, m10, m11, m12, m13, m14, m15, m16].map(
    (m) => [m.module, m as unknown as Module]
  )
);

export const MANIFEST = manifest as unknown as Manifest;

export function getModule(id: string): Module | undefined {
  return MODULES[id];
}

export function allModules(): Module[] {
  return MANIFEST.modules
    .map((entry) => MODULES[entry.id])
    .filter((m): m is Module => Boolean(m));
}

export function getQuestion(moduleId: string, qid: string) {
  const mod = getModule(moduleId);
  if (!mod) return null;
  const idx = mod.questions.findIndex((q) => q.id === qid);
  if (idx < 0) return null;
  return { module: mod, question: mod.questions[idx], index: idx };
}
