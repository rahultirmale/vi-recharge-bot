import { useState } from "react";
import type { RechargeStatusCardProps } from "../types";
import { callTool } from "../bridge";
import { Button } from "@openai/apps-sdk-ui/components/Button";
import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import { CheckCircleFilled, Warning } from "@openai/apps-sdk-ui/components/Icon";

const BADGE_COLORS: Record<string, "warning" | "discovery" | "success" | "danger"> = {
  pending: "warning",
  processing: "discovery",
  success: "success",
  failed: "danger",
};

const BADGE_LABELS: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  success: "Success",
  failed: "Failed",
};

function ProgressSteps({ paymentStatus, fulfillmentStatus }: { paymentStatus: string; fulfillmentStatus: string }) {
  const steps = [
    { label: "Order", done: true },
    { label: "Payment", done: paymentStatus === "success" },
    { label: "Recharge", done: fulfillmentStatus === "success" },
  ];

  return (
    <div className="flex items-center justify-between mb-4">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className={`size-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                step.done
                  ? "text-white"
                  : "bg-[var(--color-surface-secondary)] text-[var(--color-text-tertiary)] border border-[var(--color-border)]"
              }`}
              style={step.done ? { backgroundColor: "var(--vi-red)" } : undefined}
            >
              {step.done ? (
                <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <p className="text-[10px] mt-1 text-[var(--color-text-secondary)] font-medium">{step.label}</p>
          </div>
          {i < steps.length - 1 && (
            <div
              className="flex-1 h-px mx-2 mb-4"
              style={{ backgroundColor: step.done ? "var(--vi-red)" : "var(--color-border)" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function RechargeStatusCard(props: RechargeStatusCardProps) {
  const [refreshing, setRefreshing] = useState(false);

  const canRetry =
    props.payment_status === "success" &&
    props.fulfillment_status === "failed";

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await callTool("get_order_status", { order_id: props.order_id });
    } finally {
      setRefreshing(false);
    }
  }

  async function handleRetry() {
    await callTool("initiate_payment", { order_id: props.order_id });
  }

  return (
    <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] max-w-md mx-auto">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">Recharge Status</h3>
      </div>

      <div className="px-4 pb-4">
        <ProgressSteps paymentStatus={props.payment_status} fulfillmentStatus={props.fulfillment_status} />

        {/* Status details */}
        <div className="space-y-2.5 rounded-lg bg-[var(--color-surface-secondary)] p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--color-text-secondary)]">Order ID</span>
            <span className="text-sm font-mono font-medium text-[var(--color-text)]">{props.order_id}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--color-text-secondary)]">Payment</span>
            <Badge color={BADGE_COLORS[props.payment_status] ?? "warning"} variant="soft" size="sm" pill>
              {BADGE_LABELS[props.payment_status] ?? "Unknown"}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--color-text-secondary)]">Recharge</span>
            <Badge color={BADGE_COLORS[props.fulfillment_status] ?? "warning"} variant="soft" size="sm" pill>
              {BADGE_LABELS[props.fulfillment_status] ?? "Unknown"}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--color-text-secondary)]">Updated</span>
            <span className="text-xs text-[var(--color-text-tertiary)]">
              {new Date(props.last_updated).toLocaleString()}
            </span>
          </div>
        </div>

        {canRetry && (
          <div className="mt-3 p-3 rounded-lg bg-[var(--color-background-danger-soft)] border border-[var(--color-border-danger)]">
            <div className="flex gap-2 items-start">
              <Warning className="size-4 mt-0.5 flex-shrink-0 text-[var(--color-text-danger)]" />
              <p className="text-xs text-[var(--color-text-danger)] font-medium">
                Payment received but recharge failed. You can retry or contact Vi support.
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button
            color="secondary"
            variant="outline"
            size="md"
            block
            loading={refreshing}
            disabled={refreshing}
            onClick={handleRefresh}
          >
            Refresh Status
          </Button>
          {canRetry && (
            <Button
              color="danger"
              variant="solid"
              size="md"
              block
              onClick={handleRetry}
            >
              Retry Recharge
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
