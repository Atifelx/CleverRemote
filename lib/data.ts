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
import m14 from "@/data/questions/14-web-protocols-security.json";
import m15 from "@/data/questions/15-distributed-systems.json";
import m16 from "@/data/questions/16-refactoring-debugging.json";
import m00 from "@/data/questions/00-programming-fundamentals.json";
import m01dsa from "@/data/questions/01-dsa.json";
import m17 from "@/data/questions/17-async-concurrency.json";
import m18 from "@/data/questions/18-redis-caching.json";
import m19 from "@/data/questions/19-cloud-deployment.json";
import m20 from "@/data/questions/20-docker-k8s.json";
import m23 from "@/data/questions/23-enterprise-integrations.json";
import m24 from "@/data/questions/24-fde-customer-engineering.json";
import m25 from "@/data/questions/25-behavioral.json";
import m27 from "@/data/questions/27-live-coding-take-home.json";
import m21 from "@/data/questions/21-llm-app-arch.json";
import m22 from "@/data/questions/22-testing-debugging.json";
import m26 from "@/data/questions/26-project-deep-dive.json";
import m28 from "@/data/questions/28-software-engineering.json";
import m29 from "@/data/questions/29-python.json";
import m30 from "@/data/questions/30-codility-patterns.json";
import m31 from "@/data/questions/31-oop-design-patterns.json";
import m32 from "@/data/questions/32-git-advanced.json";
import m33 from "@/data/questions/33-financial-data-engineering.json";
import m34 from "@/data/questions/34-pr-review-andela.json";
import m35 from "@/data/questions/35-rag-andela-deep.json";
import type { Manifest, Module } from "./types";

const MODULES: Record<string, Module> = Object.fromEntries(
  [m00, m01dsa, m01, m02, m03, m04, m05, m06, m07, m08, m09, m10, m11, m12, m14, m15, m16, m17, m18, m19, m20, m21, m22, m23, m24, m25, m26, m27, m28, m29, m30, m31, m32, m33, m34, m35].map(
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
