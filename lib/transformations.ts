type UnknownRecord = Record<string, unknown>;

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
