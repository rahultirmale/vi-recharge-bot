import { useState } from "react";
import type { PlanPickerCardProps, Plan } from "../types";
import { callTool } from "../bridge";

const MAX_VISIBLE_PLANS = 6;

function ViLogo() {
  return (
    <svg width="40" height="20" viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="32" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="36" fill="#E60000">V</text>
      <text x="26" y="32" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="36" fill="#E60000">i</text>
      <circle cx="35" cy="8" r="4" fill="#FECB00" />
    </svg>
  );
}

export function PlanPickerCard(props: PlanPickerCardProps) {
  const [selectedCategory, setSelectedCategory] = useState(
    props.selectedCategory
  );
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
    <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-card)] max-w-md mx-auto shadow-sm">
      {/* Vi branded header */}
      <div className="vi-gradient px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/80">
              {props.operator} · {props.circle}
            </p>
            <p className="text-base font-bold text-white">{props.msisdn_masked}</p>
          </div>
          <ViLogo />
        </div>
      </div>

      <div className="p-4">
        {/* Search */}
        <div className="relative mb-3">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all"
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
          {["All", ...props.categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "bg-[var(--tag-bg)] text-[var(--tag-text)] hover:bg-[var(--border)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Plan list */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <p className="text-sm text-[var(--text-secondary)] text-center py-6">
              No plans found
            </p>
          )}
          {filtered.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] hover:border-[var(--accent-secondary)] hover:shadow-sm transition-all group"
            >
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-sm font-semibold truncate group-hover:text-[var(--accent-secondary)]">
                  {plan.name}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {plan.data} · {plan.validity}
                </p>
              </div>
              <button
                onClick={() => handleSelect(plan)}
                className="flex-shrink-0 px-4 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-bold hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
              >
                ₹{plan.price}
              </button>
            </div>
          ))}
        </div>

        {props.plans.length > MAX_VISIBLE_PLANS && (
          <p className="text-xs text-[var(--text-secondary)] text-center mt-3">
            Showing {filtered.length} of {props.plans.length} plans. Use search to
            find more.
          </p>
        )}
      </div>
    </div>
  );
}
