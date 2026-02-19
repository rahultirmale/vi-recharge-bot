import { useState } from "react";
import type { ConfirmRechargeCardProps } from "../types";
import { callTool } from "../bridge";
import { Button } from "@openai/apps-sdk-ui/components/Button";
import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import { Phone } from "@openai/apps-sdk-ui/components/Icon";

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
    <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] max-w-md mx-auto">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">Confirm Recharge</h3>
      </div>

      <div className="px-4 pb-4">
        {/* Number info */}
        <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border-subtle)] mb-3">
          <div className="flex items-center justify-center size-8 rounded-full" style={{ backgroundColor: "var(--vi-red)" }}>
            <Phone className="size-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--color-text)]">{props.msisdn_masked}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {props.operator} · {props.circle}
            </p>
          </div>
        </div>

        {/* Plan summary */}
        <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3 mb-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">{props.plan.name}</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                {props.plan.data} · {props.plan.validity}
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                {props.plan.description}
              </p>
            </div>
            <Badge color="secondary" variant="soft" size="sm">
              {props.plan.category}
            </Badge>
          </div>
        </div>

        {/* Amount breakdown */}
        <div className="flex justify-between items-center py-2 border-b border-[var(--color-border-subtle)]">
          <span className="text-sm text-[var(--color-text-secondary)]">Plan Amount</span>
          <span className="text-sm text-[var(--color-text)]">₹{props.amount}</span>
        </div>
        <div className="flex justify-between items-center py-2 mb-4">
          <span className="text-sm font-semibold text-[var(--color-text)]">Total Payable</span>
          <span className="text-base font-bold" style={{ color: "var(--vi-red)" }}>₹{props.total}</span>
        </div>

        {/* Actions — max 2 per ChatGPT inline card guideline */}
        <div className="flex gap-2">
          <Button
            color="secondary"
            variant="outline"
            size="md"
            block
            onClick={handleChangePlan}
          >
            Change Plan
          </Button>
          <Button
            color="primary"
            variant="solid"
            size="md"
            block
            loading={loading}
            disabled={loading}
            onClick={handleConfirm}
            style={{ backgroundColor: "var(--vi-red)", borderColor: "var(--vi-red)" }}
          >
            Confirm & Pay
          </Button>
        </div>
      </div>
    </div>
  );
}
