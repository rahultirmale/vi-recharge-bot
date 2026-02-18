import { useState } from "react";
import type { RechargeStatusCardProps } from "../types";
import { callTool } from "../bridge";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "var(--warning-text)", bg: "var(--warning)" },
  processing: { label: "Processing", color: "var(--accent-secondary)", bg: "var(--vi-purple-light)" },
  success: { label: "Success", color: "var(--success)", bg: "var(--success-light)" },
  failed: { label: "Failed", color: "var(--danger)", bg: "var(--vi-red-light)" },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_LABELS[status] ?? STATUS_LABELS.pending;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  );
}

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
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step.done
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-2 border-[var(--border)]"
              }`}
            >
              {step.done ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <p className="text-[10px] mt-1 text-[var(--text-secondary)] font-medium">{step.label}</p>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-2 mb-4 rounded ${
                step.done ? "bg-[var(--accent)]" : "bg-[var(--border)]"
              }`}
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
    <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-card)] max-w-md mx-auto shadow-sm">
      {/* Vi branded header */}
      <div className="vi-gradient px-4 py-3">
        <h3 className="text-base font-bold text-white">Recharge Status</h3>
        <p className="text-xs text-white/70">Track your recharge progress</p>
      </div>

      <div className="p-4">
        {/* Progress steps */}
        <ProgressSteps paymentStatus={props.payment_status} fulfillmentStatus={props.fulfillment_status} />

        {/* Status details */}
        <div className="space-y-3 bg-[var(--bg-secondary)] rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--text-secondary)]">Order ID</span>
            <span className="text-sm font-mono font-semibold">{props.order_id}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--text-secondary)]">Payment</span>
            <StatusBadge status={props.payment_status} />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--text-secondary)]">Recharge</span>
            <StatusBadge status={props.fulfillment_status} />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--text-secondary)]">Updated</span>
            <span className="text-xs text-[var(--text-secondary)]">
              {new Date(props.last_updated).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Warning for payment success but recharge failed */}
        {canRetry && (
          <div className="mt-3 p-3 rounded-lg bg-[var(--vi-red-light)] border border-[var(--danger)]/30">
            <div className="flex gap-2 items-start">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="var(--danger)" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.27 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-xs text-[var(--danger)] font-medium">
                Payment received but recharge failed. You can retry or contact Vi support.
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex-1 px-3 py-2.5 rounded-lg border-2 border-[var(--accent-secondary)] text-[var(--accent-secondary)] text-sm font-semibold hover:bg-[var(--vi-purple-light)] transition-colors disabled:opacity-50"
          >
            {refreshing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Refreshing...
              </span>
            ) : (
              "Refresh Status"
            )}
          </button>
          {canRetry && (
            <button
              onClick={handleRetry}
              className="flex-1 px-3 py-2.5 rounded-lg bg-[var(--accent)] text-white text-sm font-bold hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
            >
              Retry Recharge
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
