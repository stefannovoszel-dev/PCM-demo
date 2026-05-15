import type { PackagingComponent } from "./types";
import { normaliseMaterial, normaliseSupplierName, type HarmonisedDataRow } from "./transformations";
import type { AiMatchCandidate } from "./types";

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

function candidateId(row: HarmonisedDataRow, index: number) {
  return `MATCH-${row.harmonised_row_id || index}`;
}

function componentCandidate(component: PackagingComponent) {
  return {
    component_id: component.component_id,
    component_name: component.canonical_component_name ?? component.component_name,
    material: component.material,
    supplier_id: component.supplier_id,
    supplier_name: component.supplier_name,
    weight_g: component.weight_g,
    dimensions: component.dimensions
  };
}

function harmonisedCandidate(row: HarmonisedDataRow) {
  return {
    harmonised_row_id: row.harmonised_row_id,
    ERP_record_id: row.ERP_record_id,
    PLM_record_id: row.PLM_record_id,
    SUP_REC_record_id: row.SUP_REC_record_id,
    component_name: row.component_name ?? "Unnamed harmonised row",
    material: row.material,
    supplier_id: row.supplier_id,
    weight_g: row.weight_g
  };
}

export function createAiMatchCandidatesFromHarmonisedRows(
  components: PackagingComponent[],
  harmonisedRows: HarmonisedDataRow[]
): AiMatchCandidate[] {
  const candidates: AiMatchCandidate[] = [];

  harmonisedRows.forEach((row, index) => {
    const candidateB = harmonisedCandidate(row);
    const best = components
      .map((component) => {
        const candidateA = componentCandidate(component);
        return {
          candidateA,
          result: calculateMatchConfidence(candidateA, candidateB)
        };
      })
      .sort((a, b) => b.result.confidence - a.result.confidence)[0];

    if (!best) return;

    candidates.push({
      id: candidateId(row, index),
      candidate_a: best.candidateA,
      candidate_b: candidateB,
      confidence: best.result.confidence,
      reason: best.result.reason,
      suggested_canonical_name: best.result.suggested_canonical_name,
      status: "Suggested",
      recommended_action: best.result.recommended_action
    });
  });

  return candidates;
}

export function applyCandidateANameToHarmonisedRows(
  harmonisedRows: HarmonisedDataRow[],
  candidate: AiMatchCandidate
) {
  const harmonisedRowId = candidate.candidate_b.harmonised_row_id;
  const candidateAName = candidate.candidate_a.component_name.trim();

  if (!harmonisedRowId || !candidateAName) return harmonisedRows;

  return harmonisedRows.map((row) =>
    row.harmonised_row_id === harmonisedRowId
      ? {
          ...row,
          component_name: candidateAName
        }
      : row
  );
}

export function applyAcceptedMatchNamesToHarmonisedRows(
  harmonisedRows: HarmonisedDataRow[],
  candidates: AiMatchCandidate[]
) {
  const acceptedNamesByRowId = new Map(
    candidates
      .filter((candidate) => candidate.status === "Accepted")
      .map((candidate) => [
        candidate.candidate_b.harmonised_row_id,
        candidate.candidate_a.component_name.trim()
      ])
      .filter((entry): entry is [string, string] => Boolean(entry[0] && entry[1]))
  );

  if (!acceptedNamesByRowId.size) return harmonisedRows;

  return harmonisedRows.map((row) => {
    const acceptedName = acceptedNamesByRowId.get(row.harmonised_row_id);
    return acceptedName
      ? {
          ...row,
          component_name: acceptedName
        }
      : row;
  });
}
