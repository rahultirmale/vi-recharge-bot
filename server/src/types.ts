export interface Plan {
  id: string;
  name: string;
  price: number;
  validity: string;
  data: string;
  description: string;
  category: string;
}

export interface Order {
  order_id: string;
  msisdn: string;
  plan_id: string;
  plan: Plan;
  amount: number;
  payment_status: "pending" | "success" | "failed";
  fulfillment_status: "pending" | "processing" | "success" | "failed";
  operator_txn_id: string | null;
  created_at: string;
  updated_at: string;
  idempotency_key: string;
}

export interface ValidateMsisdnResult {
  msisdn_masked: string;
  operator: string;
  circle: string;
  valid: boolean;
}

export interface ToolResponse<T = unknown> {
  data: T;
  _meta: {
    ui: {
      component: string;
      props: Record<string, unknown>;
    };
  };
}
