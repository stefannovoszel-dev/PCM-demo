"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function InventoryFilters({
  search,
  setSearch,
  domain,
  setDomain,
  status,
  setStatus,
  required,
  setRequired,
  dqBand,
  setDqBand
}: {
  search: string;
  setSearch: (value: string) => void;
  domain: string;
  setDomain: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  required: string;
  setRequired: (value: string) => void;
  dqBand: string;
  setDqBand: (value: string) => void;
}) {
  return (
    <div className="grid gap-3 border-b p-4 md:grid-cols-5">
      <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search inventory" />
      <Select value={domain} onChange={(event) => setDomain(event.target.value)}>
        <option value="All">All domains</option>
        <option>Evidence</option>
        <option>Material taxonomy</option>
        <option>Supplier evidence</option>
        <option>Recycled content</option>
        <option>Recyclability</option>
        <option>Market</option>
      </Select>
      <Select value={status} onChange={(event) => setStatus(event.target.value)}>
        <option value="All">All statuses</option>
        <option>Complete</option>
        <option>Review</option>
        <option>Missing</option>
        <option>Draft</option>
      </Select>
      <Select value={required} onChange={(event) => setRequired(event.target.value)}>
        <option value="All">Required: all</option>
        <option value="Yes">Required: yes</option>
        <option value="No">Required: no</option>
      </Select>
      <Select value={dqBand} onChange={(event) => setDqBand(event.target.value)}>
        <option value="All">DQ score: all</option>
        <option value="90+">90+</option>
        <option value="70-89">70-89</option>
        <option value="Below 70">Below 70</option>
      </Select>
    </div>
  );
}
