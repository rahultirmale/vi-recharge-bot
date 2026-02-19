import { useState } from "react";
import type { PlanPickerCardProps, Plan } from "../types";
import { callTool } from "../bridge";
import { Button } from "@openai/apps-sdk-ui/components/Button";
import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import { Phone, MagnifyingGlassSearch } from "@openai/apps-sdk-ui/components/Icon";

const MAX_VISIBLE_PLANS = 6;

function ViLogo() {
  return (
    <svg width="36" height="18" viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="32" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="36" fill="var(--vi-red)">V</text>
      <text x="26" y="32" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="36" fill="var(--vi-red)">i</text>
      <circle cx="35" cy="8" r="4" fill="var(--vi-yellow)" />
    </svg>
  );
}

export function PlanPickerCard(props: PlanPickerCardProps) {
  const [selectedCategory, setSelectedCategory] = useState(props.selectedCategory);
  const [searchQuery, setSearchQuery] = useState(props.searchQuery);

  const filtered = props.plans
    .filter(
      (p) =>
        (selectedCategory === "All" || p.category === selectedCategory) &&
        (searchQuery === "" ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .slice(0, MAX_VISIBLE_PLANS);

  async function handleSelect(plan: Plan) {
    await callTool("create_order", { plan_id: plan.id, msisdn: props.msisdn_masked });
  }

  return (
    <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-8 rounded-full" style={{ backgroundColor: "var(--vi-red)" }}>
            <Phone className="size-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">{props.msisdn_masked}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {props.operator} · {props.circle}
            </p>
          </div>
        </div>
        <ViLogo />
      </div>

      <div className="px-4 pb-4">
        {/* Search */}
        <div className="relative mt-2 mb-3">
          <MagnifyingGlassSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-text-tertiary)]" />
          <input
            type="text"
            placeholder="Search plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-border-strong)] transition-colors"
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
          {["All", ...props.categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "text-white"
                  : "bg-[var(--color-background-secondary-soft)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary-outline)]"
              }`}
              style={selectedCategory === cat ? { backgroundColor: "var(--vi-red)" } : undefined}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Plan list */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <p className="text-sm text-[var(--color-text-secondary)] text-center py-6">
              No plans found
            </p>
          )}
          {filtered.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-border-subtle)] hover:border-[var(--color-border)] transition-colors"
            >
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-sm font-medium text-[var(--color-text)] truncate">{plan.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-[var(--color-text-secondary)]">{plan.data}</span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">·</span>
                  <span className="text-xs text-[var(--color-text-secondary)]">{plan.validity}</span>
                </div>
              </div>
              <Button
                color="primary"
                variant="solid"
                size="sm"
                onClick={() => handleSelect(plan)}
                className="flex-shrink-0"
                style={{ backgroundColor: "var(--vi-red)", borderColor: "var(--vi-red)" }}
              >
                ₹{plan.price}
              </Button>
            </div>
          ))}
        </div>

        {props.plans.length > MAX_VISIBLE_PLANS && (
          <p className="text-xs text-[var(--color-text-tertiary)] text-center mt-3">
            Showing {filtered.length} of {props.plans.length} plans
          </p>
        )}
      </div>
    </div>
  );
}
