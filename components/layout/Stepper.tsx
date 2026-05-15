import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stepper({
  steps,
  activeIndex = steps.length - 1
}: {
  steps: string[];
  activeIndex?: number;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-5">
      {steps.map((step, index) => (
        <div
          key={step}
          className={cn(
            "flex min-h-20 items-center gap-3 rounded-lg border bg-white p-4",
            index <= activeIndex && "border-blue-200 bg-blue-50"
          )}
        >
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
              index <= activeIndex
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-300 bg-white text-slate-500"
            )}
          >
            {index < activeIndex ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
          </div>
          <span className="text-sm font-medium text-slate-800">{step}</span>
        </div>
      ))}
    </div>
  );
}
