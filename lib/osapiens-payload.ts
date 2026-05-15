import { z } from "zod";
import type { PackagingComponent, Product, ValidationResult } from "./types";
import { validateComponent } from "./validation";

export interface SimulatedOsapiensPayload {
  schema_notice: string;
  product_id: string;
  product_name: string;
  regulation: string;
  market_country: string;
  packaging_id: string;
  generated_at: string;
  validation_status: "valid" | "review_required";
  components: Array<{
    component_id: string;
    component_name: string;
    material: string;
    weight_g: number;
    supplier_id: string;
    supplier_name: string;
    recycled_content_percent: number | null;
    recyclability_grade: string | null;
    evidence_documents: Array<{
      certificate_id: string | null;
      certificate_status: string;
      evidence_url: string | null;
    }>;
  }>;
  materials: Array<{ material: string; component_count: number; total_weight_g: number }>;
  weights: { total_packaging_weight_g: number };
  suppliers: Array<{ supplier_id: string; supplier_name: string; component_count: number }>;
  recycled_content: Array<{ component_id: string; recycled_content_percent: number | null }>;
  recyclability_grade: Array<{ component_id: string; recyclability_grade: string | null }>;
  evidence_documents: Array<{
    component_id: string;
    certificate_id: string | null;
    certificate_status: string;
    evidence_url: string | null;
  }>;
}

function groupBy<T>(items: T[], keyFn: (item: T) => string) {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    const key = keyFn(item);
    groups[key] = groups[key] ? [...groups[key], item] : [item];
    return groups;
  }, {});
}

export function createOsapiensPayload(
  product: Product,
  components: PackagingComponent[]
): SimulatedOsapiensPayload {
  const materialGroups = groupBy(components, (component) => component.material);
  const supplierGroups = groupBy(components, (component) => component.supplier_id);
  const validationResults = components.map((component) => validateComponent(component));

  const evidence_documents = components.map((component) => ({
    component_id: component.component_id,
    certificate_id: component.certificate_id,
    certificate_status: component.certificate_status,
    evidence_url: component.evidence_url
  }));

  return {
    schema_notice:
      "simulated osapiens-ready payload; not an official osapiens schema and no real API integration is used",
    product_id: product.product_id,
    product_name: product.product_name,
    regulation: product.regulation,
    market_country: product.market_country,
    packaging_id: product.packaging_id,
    generated_at: "2026-05-06T12:30:00.000Z",
    validation_status: validationResults.every((result) => result.valid) ? "valid" : "review_required",
    components: components.map((component) => ({
      component_id: component.component_id,
      component_name: component.component_name,
      material: component.material,
      weight_g: component.weight_g,
      supplier_id: component.supplier_id,
      supplier_name: component.supplier_name,
      recycled_content_percent: component.recycled_content_percent,
      recyclability_grade: component.recyclability_grade,
      evidence_documents: [
        {
          certificate_id: component.certificate_id,
          certificate_status: component.certificate_status,
          evidence_url: component.evidence_url
        }
      ]
    })),
    materials: Object.entries(materialGroups).map(([material, groupedComponents]) => ({
      material,
      component_count: groupedComponents.length,
      total_weight_g: Number(
        groupedComponents.reduce((sum, component) => sum + component.weight_g, 0).toFixed(2)
      )
    })),
    weights: {
      total_packaging_weight_g: Number(
        components.reduce((sum, component) => sum + component.weight_g, 0).toFixed(2)
      )
    },
    suppliers: Object.entries(supplierGroups).map(([supplier_id, groupedComponents]) => ({
      supplier_id,
      supplier_name: groupedComponents[0]?.supplier_name ?? supplier_id,
      component_count: groupedComponents.length
    })),
    recycled_content: components.map((component) => ({
      component_id: component.component_id,
      recycled_content_percent: component.recycled_content_percent
    })),
    recyclability_grade: components.map((component) => ({
      component_id: component.component_id,
      recyclability_grade: component.recyclability_grade
    })),
    evidence_documents
  };
}

const payloadSchema = z.object({
  schema_notice: z.string().includes("simulated osapiens-ready payload"),
  product_id: z.string().min(1),
  product_name: z.string().min(1),
  regulation: z.string().min(1),
  market_country: z.string().regex(/^[A-Z]{2}$/),
  packaging_id: z.string().min(1),
  components: z.array(z.object({ component_id: z.string().min(1) })).min(1),
  materials: z.array(z.object({ material: z.string().min(1) })),
  weights: z.object({ total_packaging_weight_g: z.number().positive() }),
  suppliers: z.array(z.object({ supplier_id: z.string().min(1) })),
  recycled_content: z.array(
    z.object({
      component_id: z.string().min(1),
      recycled_content_percent: z.number().min(0).max(100).nullable()
    })
  ),
  recyclability_grade: z.array(z.object({ component_id: z.string().min(1) })),
  evidence_documents: z.array(z.object({ component_id: z.string().min(1) })),
  validation_status: z.enum(["valid", "review_required"])
});

export function validateOsapiensPayload(payload: unknown): ValidationResult {
  const result = payloadSchema.safeParse(payload);
  if (result.success) {
    return {
      valid: true,
      errors: [],
      warnings: [
        "This is a simulated osapiens-ready payload and not an official osapiens schema."
      ],
      recommended_actions: []
    };
  }

  return {
    valid: false,
    errors: result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
    warnings: [
      "This is a simulated osapiens-ready payload and not an official osapiens schema."
    ],
    recommended_actions: ["Resolve schema errors before simulated publish"]
  };
}
