/**
 * Dev-only preview that renders all 4 cards with mock data.
 * Usage: set VITE_DEV_PREVIEW=true in .env.local
 */
import { PlanPickerCard } from "./components/PlanPickerCard";
import { ConfirmRechargeCard } from "./components/ConfirmRechargeCard";
import { RechargeStatusCard } from "./components/RechargeStatusCard";
import { ReceiptCard } from "./components/ReceiptCard";
import type { Plan } from "./types";

const mockPlan: Plan = {
  id: "p1",
  name: "Vi Unlimited 84 Days",
  price: 299,
  validity: "84 days",
  data: "1.5 GB/day",
  description: "Unlimited calls + 1.5GB daily data + Vi Movies & TV",
  category: "Popular",
};

const mockPlans: Plan[] = [
  mockPlan,
  { id: "p2", name: "Vi Unlimited 28 Days", price: 199, validity: "28 days", data: "1.5 GB/day", description: "Unlimited calls + 1.5GB daily data", category: "Popular" },
  { id: "p3", name: "Vi Data Booster 2GB", price: 49, validity: "28 days", data: "2 GB", description: "Add-on data pack", category: "Data" },
  { id: "p4", name: "Vi Data Booster 6GB", price: 98, validity: "28 days", data: "6 GB", description: "Add-on data pack", category: "Data" },
  { id: "p5", name: "Vi Hero Unlimited", price: 599, validity: "84 days", data: "2 GB/day", description: "Truly unlimited + 2GB daily data + Vi Movies & TV + Weekend rollover", category: "Popular" },
  { id: "p6", name: "Vi Talktime ₹100", price: 100, validity: "Unlimited", data: "None", description: "₹81.75 talktime", category: "Talktime" },
  { id: "p7", name: "Vi Annual Plan", price: 2999, validity: "365 days", data: "2 GB/day", description: "Full year plan with Vi Movies & TV", category: "Annual" },
];

export function DevPreview() {
  return (
    <div className="max-w-lg mx-auto p-4 space-y-8" data-theme="light">
      <div className="text-center mb-4">
        <svg width="56" height="28" viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-2">
          <text x="0" y="32" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="36" fill="var(--vi-red)">V</text>
          <text x="26" y="32" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="36" fill="var(--vi-red)">i</text>
          <circle cx="35" cy="8" r="4" fill="var(--vi-yellow)" />
        </svg>
        <h1 className="text-base font-semibold text-[var(--color-text)]">Vi Recharge — Card Preview</h1>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Development preview of all UI components</p>
      </div>

      <section>
        <h2 className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">1. PlanPickerCard</h2>
        <PlanPickerCard
          msisdn_masked="98******42"
          operator="Vi"
          circle="Delhi"
          categories={["Popular", "Data", "Talktime", "Annual"]}
          selectedCategory="Popular"
          plans={mockPlans}
          searchQuery=""
        />
      </section>

      <section>
        <h2 className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">2. ConfirmRechargeCard</h2>
        <ConfirmRechargeCard
          msisdn_masked="98******42"
          operator="Vi"
          circle="Delhi"
          plan={mockPlan}
          amount={299}
          total={299}
        />
      </section>

      <section>
        <h2 className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">3. RechargeStatusCard (processing)</h2>
        <RechargeStatusCard
          order_id="ORD12345"
          payment_status="success"
          fulfillment_status="processing"
          last_updated="2026-02-19T10:30:00Z"
        />
      </section>

      <section>
        <h2 className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">4. ReceiptCard</h2>
        <ReceiptCard
          order_id="ORD12345"
          amount={299}
          timestamp="2026-02-19T10:31:00Z"
          operator_txn_id="OPRXYZ123"
          operator="Vi"
          msisdn_masked="98******42"
          plan_name="Vi Unlimited 84 Days"
        />
      </section>
    </div>
  );
}
