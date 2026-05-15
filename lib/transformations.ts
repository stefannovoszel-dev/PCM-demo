type UnknownRecord = Record<string, unknown>;

export interface HarmonisedDataRow extends UnknownRecord {
  harmonised_row_id: string;
  ERP_record_id?: string;
  PLM_record_id?: string;
  SUP_REC_record_id?: string;
  component_name?: string;
  material?: string;
  weight_g?: number;
  supplier_id?: string;
  market_country?: string;
  recycled_content_percent?: number | null;
  recyclability_grade?: string | null;
  certificate_id?: string;
  certificate_status?: string;
}

const canonicalByKey: Record<string, string> = {
  pet: "PET",
  petclear: "PET",
  rpet: "Recycled PET",
  recycledpet: "Recycled PET",
  pehd: "HDPE",
  hdpe: "HDPE",
  hdpeplastic: "HDPE",
  highdensitypolyethylene: "HDPE",
  polyethylenehighdensity: "HDPE",
  ldpe: "LDPE",
  lowdensitypolyethylene: "LDPE",
  corrugatedboard: "Corrugated Board",
  cardboard: "Corrugated Board",
  corrugatedfiberboard: "Corrugated Board"
};

const countryRules: Record<string, string> = {
  deutschland: "DE",
  germany: "DE",
  de: "DE",
  austria: "AT",
  "österreich": "AT",
  osterreich: "AT",
  at: "AT",
  france: "FR",
  fr: "FR",
  netherlands: "NL",
  nederland: "NL",
  nl: "NL"
};

const supplierRules: Record<string, string> = {
  "acme gmbh": "SUP-00492",
  "acme closures gmbh": "SUP-00492",
  "rhine packaging ag": "SUP-00318",
  "labelhaus europe": "SUP-00211",
  "flexifilms benelux": "SUP-00577",
  "bavaria board gmbh": "SUP-00102"
};

function key(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function normaliseMaterial(value: unknown): string {
  if (value === null || value === undefined) return "";
  const raw = String(value).trim();
  if (!raw) return "";
  return canonicalByKey[key(raw)] ?? raw;
}

export function normaliseCountry(value: unknown): string {
  if (value === null || value === undefined) return "";
  const raw = String(value).trim();
  if (!raw) return "";
  return countryRules[raw.toLowerCase()] ?? raw.toUpperCase();
}

export function convertWeightToGrams(value: unknown): number {
  if (typeof value === "number") return value;
  if (value === null || value === undefined) return 0;

  const raw = String(value).trim().toLowerCase();
  const numeric = Number.parseFloat(raw.replace(",", "."));
  if (Number.isNaN(numeric)) return 0;

  if (/\b(kg|kilogram|kilograms)\b/.test(raw)) return numeric * 1000;
  if (/\b(tonne|tonnes|metric ton|metric tons)\b/.test(raw) || /\bt\b/.test(raw)) {
    return numeric * 1000000;
  }
  return numeric;
}

export function normaliseSupplierName(value: unknown): string {
  if (value === null || value === undefined) return "";
  const raw = String(value).trim();
  if (!raw) return "";
  return supplierRules[raw.toLowerCase()] ?? raw;
}

function extractPercent(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const numeric = Number.parseFloat(raw.replace(",", "."));
  return Number.isNaN(numeric) ? null : numeric;
}

export function applyTransformation<T extends UnknownRecord>(record: T) {
  const transformed: UnknownRecord = { ...record };

  const material = record.material ?? record.material_code;
  if (material !== undefined) transformed.material = normaliseMaterial(material);

  const country = record.market_country ?? record.country;
  if (country !== undefined) transformed.market_country = normaliseCountry(country);

  const weight = record.weight_g ?? record.weight;
  if (weight !== undefined) transformed.weight_g = convertWeightToGrams(weight);

  const supplier = record.supplier_id ?? record.supplier_name ?? record.supplier;
  if (supplier !== undefined) transformed.supplier_id = normaliseSupplierName(supplier);

  const recycledContent = record.recycled_content_percent ?? record.recycled_content;
  if (recycledContent !== undefined) {
    transformed.recycled_content_percent = extractPercent(recycledContent);
  }

  return transformed as T & {
    material?: string;
    market_country?: string;
    weight_g?: number;
    supplier_id?: string;
    recycled_content_percent?: number | null;
  };
}

function getRecordId(record: UnknownRecord) {
  return record.record_id === undefined || record.record_id === null ? undefined : String(record.record_id);
}

function getComponentName(record: UnknownRecord) {
  const value = record.component_name ?? record.component ?? record.part_name ?? record.canonical_component_name;
  return value === undefined || value === null ? "" : String(value);
}

function tokeniseName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/pe[\s-]?hd/g, "hdpe")
    .replace(/(\d+)([a-z]+)/g, "$1 $2")
    .replace(/([a-z]+)(\d+)/g, "$1 $2")
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1 && !["clear", "primary"].includes(token));
}

function nameOverlapScore(a: UnknownRecord, b: UnknownRecord) {
  const aTokens = new Set(tokeniseName(getComponentName(a)));
  const bTokens = new Set(tokeniseName(getComponentName(b)));
  if (!aTokens.size || !bTokens.size) return 0;

  const shared = Array.from(aTokens).filter((token) => bTokens.has(token)).length;
  return shared / Math.max(aTokens.size, bTokens.size);
}

function sourceMatchScore(a: UnknownRecord, b: UnknownRecord) {
  const transformedA = applyTransformation(a);
  const transformedB = applyTransformation(b);
  let score = 0;

  const overlap = nameOverlapScore(a, b);
  if (overlap >= 0.35) score += 3;
  else if (overlap >= 0.15) score += 1.5;

  if (transformedA.material && transformedA.material === transformedB.material) score += 2;

  if (transformedA.weight_g && transformedB.weight_g) {
    const difference = Math.abs(Number(transformedA.weight_g) - Number(transformedB.weight_g));
    if (difference <= Math.max(0.2, Number(transformedA.weight_g) * 0.05)) score += 2;
  }

  if (transformedA.supplier_id && transformedA.supplier_id === transformedB.supplier_id) score += 3;

  return score;
}

function findBestMatch(
  source: UnknownRecord,
  candidates: UnknownRecord[],
  usedIndexes: Set<number>,
  minimumScore: number
) {
  let bestIndex = -1;
  let bestScore = minimumScore;

  candidates.forEach((candidate, index) => {
    if (usedIndexes.has(index)) return;
    const score = sourceMatchScore(source, candidate);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return bestIndex >= 0 ? { record: candidates[bestIndex], index: bestIndex } : undefined;
}

function buildRow({
  erp,
  plm,
  supplier
}: {
  erp?: UnknownRecord;
  plm?: UnknownRecord;
  supplier?: UnknownRecord;
}): HarmonisedDataRow {
  const transformedErp = erp ? applyTransformation(erp) : undefined;
  const transformedPlm = plm ? applyTransformation(plm) : undefined;
  const transformedSupplier = supplier ? applyTransformation(supplier) : undefined;
  const merged = {
    ...transformedErp,
    ...transformedPlm,
    ...transformedSupplier
  };

  const ERP_record_id = erp ? getRecordId(erp) : undefined;
  const PLM_record_id = plm ? getRecordId(plm) : undefined;
  const SUP_REC_record_id = supplier ? getRecordId(supplier) : undefined;

  return {
    harmonised_row_id: [ERP_record_id, PLM_record_id, SUP_REC_record_id].filter(Boolean).join("__"),
    ERP_record_id,
    PLM_record_id,
    SUP_REC_record_id,
    component_name:
      (plm && getComponentName(plm)) ||
      (erp && getComponentName(erp)) ||
      (supplier && getComponentName(supplier)) ||
      undefined,
    material: merged.material as string | undefined,
    weight_g: merged.weight_g as number | undefined,
    supplier_id: merged.supplier_id as string | undefined,
    market_country: merged.market_country as string | undefined,
    recycled_content_percent: merged.recycled_content_percent as number | null | undefined,
    recyclability_grade: merged.recyclability_grade as string | null | undefined,
    certificate_id: merged.certificate_id as string | undefined,
    certificate_status: merged.certificate_status as string | undefined
  };
}

export function buildHarmonisedDataRows({
  erpRecords,
  plmRecords,
  supplierRecords
}: {
  erpRecords: UnknownRecord[];
  plmRecords: UnknownRecord[];
  supplierRecords: UnknownRecord[];
}) {
  const usedPlm = new Set<number>();
  const usedSupplier = new Set<number>();

  const rows = erpRecords.map((erp) => {
    const plmMatch = findBestMatch(erp, plmRecords, usedPlm, 3.5);
    if (plmMatch) usedPlm.add(plmMatch.index);

    const supplierMatch = findBestMatch(erp, supplierRecords, usedSupplier, 2);
    if (supplierMatch) usedSupplier.add(supplierMatch.index);

    return buildRow({ erp, plm: plmMatch?.record, supplier: supplierMatch?.record });
  });

  plmRecords.forEach((plm, index) => {
    if (usedPlm.has(index)) return;

    const supplierMatch = findBestMatch(plm, supplierRecords, usedSupplier, 1.5);
    if (supplierMatch) usedSupplier.add(supplierMatch.index);

    rows.push(buildRow({ plm, supplier: supplierMatch?.record }));
  });

  supplierRecords.forEach((supplier, index) => {
    if (!usedSupplier.has(index)) rows.push(buildRow({ supplier }));
  });

  return rows;
}
