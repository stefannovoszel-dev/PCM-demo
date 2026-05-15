import type { PackagingComponent } from "./types";
import { normaliseMaterial, normaliseSupplierName } from "./transformations";

type MatchPart = Partial<PackagingComponent> & {
  component_name?: string;
  name?: string;
};

const stopWords = new Set(["the", "and", "for", "with"]);

export function normalisePartName(name: string): string {
  return name
    .toLowerCase()
    .replace(/pe[-\s]?hd/g, "hdpe")
    .replace(/high density polyethylene/g, "hdpe")
    .replace(/pet clear/g, "pet clear")
    .replace(/transparent/g, "clear")
    .replace(/closure/g, "cap")
    .replace(/(\d+)\s*mm/g, "$1mm")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((token) => token && !stopWords.has(token))
    .join(" ");
}

function tokens(value: string) {
  return new Set(normalisePartName(value).split(" ").filter(Boolean));
}

export function tokenSimilarity(a: string, b: string): number {
  const aTokens = tokens(a);
  const bTokens = tokens(b);
  if (aTokens.size === 0 || bTokens.size === 0) return 0;

  const intersection = [...aTokens].filter((token) => bTokens.has(token)).length;
  const union = new Set([...aTokens, ...bTokens]).size;
  return intersection / union;
}

export function materialSimilarity(a: unknown, b: unknown): number {
  const left = normaliseMaterial(a);
  const right = normaliseMaterial(b);
  if (!left || !right) return 0;
  return left === right ? 1 : 0;
}

export function supplierSimilarity(a: unknown, b: unknown): number {
  const left = normaliseSupplierName(a).toLowerCase();
  const right = normaliseSupplierName(b).toLowerCase();
  if (!left || !right) return 0;
  return left === right ? 1 : 0;
}

export function weightToleranceScore(a: unknown, b: unknown): number {
  const left = typeof a === "number" ? a : Number(a);
  const right = typeof b === "number" ? b : Number(b);
  if (!Number.isFinite(left) || !Number.isFinite(right) || left <= 0 || right <= 0) return 0;

  const delta = Math.abs(left - right) / Math.max(left, right);
  if (delta <= 0.05) return 1;
  if (delta <= 0.1) return 0.5;
  return 0;
}

function extractDimension(part: MatchPart): number | null {
  if (part.dimensions?.diameter_mm) return part.dimensions.diameter_mm;
  const name = part.component_name ?? part.name ?? "";
  const match = normalisePartName(name).match(/\b(\d+)mm\b/);
  return match ? Number(match[1]) : null;
}

function dimensionMatch(a: MatchPart, b: MatchPart) {
  const left = extractDimension(a);
  const right = extractDimension(b);
  return left !== null && right !== null && Math.abs(left - right) <= 0.5;
}

function suggestedName(a: MatchPart, b: MatchPart) {
  const aName = a.canonical_component_name ?? a.component_name ?? a.name ?? "";
  const bName = b.canonical_component_name ?? b.component_name ?? b.name ?? "";
  return aName.length >= bName.length ? aName : bName;
}

export function calculateMatchConfidence(partA: MatchPart, partB: MatchPart) {
  const nameA = partA.component_name ?? partA.name ?? "";
  const nameB = partB.component_name ?? partB.name ?? "";
  const reasons: string[] = [];
  let score = 0;

  if (materialSimilarity(partA.material, partB.material) === 1) {
    score += 35;
    reasons.push("same canonical material");
  }

  const tokenScore = tokenSimilarity(nameA, nameB);
  if (tokenScore >= 0.45) {
    const points = Math.round(tokenScore * 20);
    score += points;
    reasons.push(tokenScore >= 0.75 ? "high token overlap" : "moderate token overlap");
  }

  const supplierA = partA.supplier_id ?? partA.supplier_name;
  const supplierB = partB.supplier_id ?? partB.supplier_name;
  if (supplierSimilarity(supplierA, supplierB) === 1) {
    score += 15;
    reasons.push("same supplier");
  }

  if (dimensionMatch(partA, partB)) {
    score += 15;
    reasons.push("dimension match");
  }

  const weightScore = weightToleranceScore(partA.weight_g, partB.weight_g);
  if (weightScore > 0) {
    score += Math.round(weightScore * 15);
    reasons.push(weightScore === 1 ? "weight within tolerance" : "weight near tolerance");
  }

  const confidence = Math.min(100, score);
  const recommended_action =
    confidence >= 90
      ? "Accept match"
      : confidence >= 65
        ? "Review before accepting"
        : confidence >= 55
          ? "Request supplier confirmation"
          : "Reject match";

  return {
    confidence,
    reason: reasons.length ? reasons.join(", ") : "insufficient overlap",
    suggested_canonical_name: suggestedName(partA, partB),
    recommended_action
  };
}
