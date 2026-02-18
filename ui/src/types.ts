// ── UI Contract Types ──

export interface Plan {
  id: string;
  name: string;
  price: number;
  validity: string;
  data: string;
  description: string;
  category: string;
}

export interface PlanPickerCardProps {
  msisdn_masked: string;
  operator: string;
  circle: string;
  categories: string[];
  selectedCategory: string;
  plans: Plan[];
  searchQuery: string;
}

export interface ConfirmRechargeCardProps {
  msisdn_masked: string;
  operator: string;
  circle: string;
  plan: Plan;
  amount: number;
  total: number;
}

export interface RechargeStatusCardProps {
  order_id: string;
  payment_status: "pending" | "success" | "failed";
  fulfillment_status: "pending" | "processing" | "success" | "failed";
  last_updated: string;
}

export interface ReceiptCardProps {
  order_id: string;
  amount: number;
  timestamp: string;
  operator_txn_id: string;
  operator: string;
  msisdn_masked: string;
  plan_name: string;
}

// ── Bridge Types ──

export type ComponentName =
  | "PlanPickerCard"
  | "ConfirmRechargeCard"
  | "RechargeStatusCard"
  | "ReceiptCard";

export type ComponentProps =
  | PlanPickerCardProps
  | ConfirmRechargeCardProps
  | RechargeStatusCardProps
  | ReceiptCardProps;

