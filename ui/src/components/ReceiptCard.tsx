import type { ReceiptCardProps } from "../types";
import { callTool } from "../bridge";

export function ReceiptCard(props: ReceiptCardProps) {
  async function handleEmailReceipt() {
    await callTool("email_receipt", { order_id: props.order_id });
  }

  async function handleRechargeAgain() {
    await callTool("get_plans", { msisdn: props.msisdn_masked });
  }

  return (
    <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-card)] max-w-md mx-auto shadow-sm">
      {/* Success header with Vi gradient */}
      <div className="vi-gradient px-4 py-5 text-center">
        <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="white"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-white">Recharge Successful!</h3>
        <p className="text-3xl font-extrabold text-white mt-1">
          ₹{props.amount}
        </p>
      </div>

      <div className="p-4">
        {/* Details */}
        <div className="rounded-lg bg-[var(--bg-secondary)] p-3 space-y-2.5 mb-4">
          <DetailRow label="Order ID" value={props.order_id} mono />
          <DetailRow label="Operator Txn" value={props.operator_txn_id} mono />
          <div className="border-t border-[var(--border)]" />
          <DetailRow label="Number" value={`${props.msisdn_masked} · ${props.operator}`} />
          <DetailRow label="Plan" value={props.plan_name} />
          <DetailRow label="Time" value={new Date(props.timestamp).toLocaleString()} />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleEmailReceipt}
            className="flex-1 px-3 py-2.5 rounded-lg border-2 border-[var(--accent-secondary)] text-[var(--accent-secondary)] text-sm font-semibold hover:bg-[var(--vi-purple-light)] transition-colors"
          >
            <span className="flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Receipt
            </span>
          </button>
          <button
            onClick={handleRechargeAgain}
            className="flex-1 px-3 py-2.5 rounded-lg bg-[var(--accent)] text-white text-sm font-bold hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
          >
            <span className="flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Recharge Again
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-[var(--text-secondary)]">{label}</span>
      <span className={`text-xs font-medium ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
