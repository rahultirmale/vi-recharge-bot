import { useState } from "react";
import type { ConfirmRechargeCardProps } from "../types";
import { callTool } from "../bridge";

export function ConfirmRechargeCard(props: ConfirmRechargeCardProps) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (loading) return;
    setLoading(true);
    try {
      await callTool("initiate_payment", { order_id: (props as any).order_id ?? "" });
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePlan() {
    await callTool("get_plans", { msisdn: props.msisdn_masked });
  }

  return (
    <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-card)] max-w-md mx-auto shadow-sm">
      {/* Vi branded header */}
      <div className="vi-gradient px-4 py-3">
        <h3 className="text-base font-bold text-white">Confirm Recharge</h3>
        <p className="text-xs text-white/70">Review your order before payment</p>
      </div>

      <div className="p-4">
        {/* Number info */}
        <div className="rounded-lg border border-[var(--border)] p-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--vi-purple-light)] flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="var(--vi-purple)" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold">{props.msisdn_masked}</p>
              <p className="text-xs text-[var(--text-secondary)]">
                {props.operator} · {props.circle}
              </p>
            </div>
          </div>
        </div>

        {/* Plan summary */}
        <div className="rounded-lg bg-[var(--bg-secondary)] p-3 mb-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold">{props.plan.name}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {props.plan.data} · {props.plan.validity}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {props.plan.description}
              </p>
            </div>
            <div className="bg-[var(--tag-bg)] text-[var(--tag-text)] px-2 py-0.5 rounded text-xs font-semibold">
              {props.plan.category}
            </div>
          </div>
        </div>

        {/* Amount breakdown */}
        <div className="space-y-0">
          <div className="flex justify-between items-center py-2.5 border-b border-[var(--border)]">
            <span className="text-sm text-[var(--text-secondary)]">Plan Amount</span>
            <span className="text-sm">₹{props.amount}</span>
          </div>
          <div className="flex justify-between items-center py-2.5 mb-4">
            <span className="text-sm font-bold">Total Payable</span>
            <span className="text-lg font-bold vi-gradient-text">
              ₹{props.total}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleChangePlan}
            className="flex-1 px-3 py-2.5 rounded-lg border-2 border-[var(--accent)] text-[var(--accent)] text-sm font-semibold hover:bg-[var(--vi-red-light)] transition-colors"
          >
            Change Plan
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-3 py-2.5 rounded-lg bg-[var(--accent)] text-white text-sm font-bold hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : (
              "Confirm & Pay"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
