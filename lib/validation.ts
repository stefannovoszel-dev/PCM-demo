import { z } from "zod";
import { CANONICAL_MATERIALS, PPWR_REQUIRED_DATAPOINTS } from "./constants";
import { normaliseMaterial } from "./transformations";
import type { PackagingComponent, Product, ValidationResult } from "./types";

const requiredComponentFields: Array<keyof PackagingComponent> = [
  "component_id",
  "packaging_id",
  "component_name",
  "material",
  "weight_g",
  "supplier_id",
  "supplier_name",
  "recycled_content_percent",
  "recyclability_grade",
  "certificate_status",
  "market_country"
];

function isEmpty(value: unknown) {
  return value === null || value === undefined || value === "";
}

export function validateComponent(
  component: PackagingComponent,
  requiredDatapoints = PPWR_REQUIRED_DATAPOINTS
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommended_actions: string[] = [];

  for (const field of requiredComponentFields) {
    if (isEmpty(component[field])) {
      errors.push(`${String(field)} must not be empty`);
      recommended_actions.push(`Populate ${String(field)} for ${component.component_id}`);
    }
  }

  if (component.weight_g <= 0) {
    errors.push("weight_g must be greater than 0");
    recommended_actions.push("Review component weight and source unit conversion");
  }

  if (
    component.recycled_content_percent !== null &&
    (component.recycled_content_percent < 0 || component.recycled_content_percent > 100)
  ) {
    errors.push("recycled_content_percent must be between 0 and 100");
    recommended_actions.push("Request corrected recycled content declaration");
  }

  if (
    component.recycled_content_percent !== null &&
    component.recycled_content_percent > 0 &&
    component.certificate_status !== "Valid"
  ) {
    warnings.push("certificate must be valid when recycled content claim exists");
    recommended_actions.push("Request or replace supplier certificate");
  }

  const canonicalMaterial = normaliseMaterial(component.material);
  if (!CANONICAL_MATERIALS.includes(component.material) || canonicalMaterial !== component.material) {
    errors.push("material must use canonical taxonomy");
    recommended_actions.push(`Map ${component.material} to ${canonicalMaterial || "a canonical material"}`);
  }

  if (!/^[A-Z]{2}$/.test(component.market_country)) {
    errors.push("market_country must be ISO-2");
    recommended_actions.push("Normalize market country to ISO-2");
  }

  for (const datapoint of requiredDatapoints) {
    const fieldName = datapoint === "supplier_confirmation" ? "supplier_confirmed" : datapoint;
    const present =
      datapoint === "supplier_confirmation"
        ? component.supplier_confirmed
        : component.available_datapoints.includes(datapoint) && !isEmpty(component[fieldName as keyof PackagingComponent]);

    if (!present) {
      const message = `required PPWR datapoint missing: ${datapoint}`;
      if (datapoint === "evidence_url" || datapoint === "supplier_confirmation") {
        warnings.push(message);
      } else {
        errors.push(message);
      }
      recommended_actions.push(`Resolve PPWR datapoint ${datapoint}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors: [...new Set(errors)],
    warnings: [...new Set(warnings)],
    recommended_actions: [...new Set(recommended_actions)]
  };
}

export function validateDataset(product: Product, components: PackagingComponent[]) {
  const componentResults = components.map((component) => ({
    component_id: component.component_id,
    component_name: component.component_name,
    ...validateComponent(component)
  }));

  const productSchema = z.object({
    product_id: z.string().min(1),
    product_name: z.string().min(1),
    regulation: z.literal("PPWR"),
    market_country: z.string().regex(/^[A-Z]{2}$/),
    packaging_id: z.string().min(1)
  });

  const productResult = productSchema.safeParse(product);
  const errors = productResult.success ? [] : productResult.error.issues.map((issue) => issue.message);
  const valid = errors.length === 0 && componentResults.every((result) => result.valid);

  return {
    valid,
    errors,
    componentResults
  };
}
