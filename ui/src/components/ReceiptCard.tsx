import type { ReceiptCardProps } from "../types";
import { callTool } from "../bridge";
import { Button } from "@openai/apps-sdk-ui/components/Button";
import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import { CheckCircleFilled, Mail, Regenerate } from "@openai/apps-sdk-ui/components/Icon";

export function ReceiptCard(props: ReceiptCardProps) {
  async function handleEmailReceipt() {
    await callTool("email_receipt", { order_id: props.order_id });
  }

  async function handleRechargeAgain() {
    await callTool("get_plans", { msisdn: props.msisdn_masked });
  }

  return (
    <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] max-w-md mx-auto">
      {/* Success header */}
      <div className="px-4 pt-5 pb-3 text-center">
        <div className="size-12 mx-auto mb-2 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--color-background-success-soft)" }}>
          <CheckCircleFilled className="size-6 text-[var(--color-text-success)]" />
        </div>
        <h3 className="text-sm font-semibold text-[var(--color-text)]">Recharge Successful</h3>
        <p className="text-2xl font-bold mt-1" style={{ color: "var(--vi-red)" }}>₹{props.amount}</p>
      </div>

      <div className="px-4 pb-4">
        {/* Details */}
        <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3 space-y-2 mb-4">
          <DetailRow label="Order ID" value={props.order_id} mono />
          <DetailRow label="Operator Txn" value={props.operator_txn_id} mono />
          <div className="border-t border-[var(--color-border-subtle)]" />
          <DetailRow label="Number" value={`${props.msisdn_masked} · ${props.operator}`} />
          <DetailRow label="Plan" value={props.plan_name} />
          <DetailRow label="Time" value={new Date(props.timestamp).toLocaleString()} />
        </div>

        {/* Actions — max 2 per ChatGPT inline card guideline */}
        <div className="flex gap-2">
          <Button
            color="secondary"
            variant="outline"
            size="md"
            block
            onClick={handleEmailReceipt}
          >
            <Mail className="size-4" />
            Email Receipt
          </Button>
          <Button
            color="primary"
            variant="solid"
            size="md"
            block
            onClick={handleRechargeAgain}
            style={{ backgroundColor: "var(--vi-red)", borderColor: "var(--vi-red)" }}
          >
            <Regenerate className="size-4" />
            Recharge Again
          </Button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>
      <span className={`text-xs font-medium text-[var(--color-text)] ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
