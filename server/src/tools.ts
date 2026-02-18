import type { ToolResponse, ValidateMsisdnResult } from "./types.js";
import * as store from "./store.js";

// ── Tool: validate_msisdn ──
export function validateMsisdn(msisdn: string): ToolResponse<ValidateMsisdnResult> {
  // Mock validation — in production, call operator HLR lookup
  const masked = msisdn.replace(/(\d{2})\d{6}(\d{2})/, "$1******$2");
  const circles = ["Delhi", "Mumbai", "Karnataka", "Tamil Nadu", "UP West"];
  const operator = "Vi";
  const circle = circles[Math.floor(Math.random() * circles.length)];

  const result: ValidateMsisdnResult = {
    msisdn_masked: masked,
    operator,
    circle,
    valid: /^\d{10}$/.test(msisdn),
  };

  return {
    data: result,
    _meta: {
      ui: {
        component: "PlanPickerCard",
        props: {
          msisdn_masked: result.msisdn_masked,
          operator: result.operator,
          circle: result.circle,
          categories: ["Popular", "Data", "Talktime", "Annual", "Roaming"],
          selectedCategory: "Popular",
          plans: store.getPlans(),
          searchQuery: "",
        },
      },
    },
  };
}

// ── Tool: get_plans ──
export function getPlans(msisdn: string): ToolResponse {
  const masked = msisdn.replace(/(\d{2})\d{6}(\d{2})/, "$1******$2");

  return {
    data: { plans: store.getPlans() },
    _meta: {
      ui: {
        component: "PlanPickerCard",
        props: {
          msisdn_masked: masked,
          operator: "Vi",
          circle: "Delhi",
          categories: ["Popular", "Data", "Talktime", "Annual", "Roaming"],
          selectedCategory: "All",
          plans: store.getPlans(),
          searchQuery: "",
        },
      },
    },
  };
}

// ── Tool: create_order ──
export function createOrder(planId: string, msisdn: string, idempotencyKey?: string): ToolResponse {
  const order = store.createOrder(planId, msisdn, idempotencyKey);
  const masked = msisdn.replace(/(\d{2})\d{6}(\d{2})/, "$1******$2");

  return {
    data: { order_id: order.order_id, status: order.payment_status },
    _meta: {
      ui: {
        component: "ConfirmRechargeCard",
        props: {
          order_id: order.order_id,
          msisdn_masked: masked,
          operator: "Vi",
          circle: "Delhi",
          plan: order.plan,
          amount: order.amount,
          total: order.amount,
        },
      },
    },
  };
}

// ── Tool: initiate_payment ──
export function initiatePayment(orderId: string): ToolResponse {
  const order = store.updateOrderPayment(orderId, "success");

  return {
    data: {
      order_id: order.order_id,
      payment_status: order.payment_status,
      fulfillment_status: order.fulfillment_status,
    },
    _meta: {
      ui: {
        component: "RechargeStatusCard",
        props: {
          order_id: order.order_id,
          payment_status: order.payment_status,
          fulfillment_status: order.fulfillment_status,
          last_updated: order.updated_at,
        },
      },
    },
  };
}

// ── Tool: get_order_status ──
export function getOrderStatus(orderId: string): ToolResponse {
  const order = store.getOrder(orderId);
  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  // If fully successful, render receipt
  if (
    order.payment_status === "success" &&
    order.fulfillment_status === "success"
  ) {
    return {
      data: {
        order_id: order.order_id,
        payment_status: order.payment_status,
        fulfillment_status: order.fulfillment_status,
      },
      _meta: {
        ui: {
          component: "ReceiptCard",
          props: {
            order_id: order.order_id,
            amount: order.amount,
            timestamp: order.updated_at,
            operator_txn_id: order.operator_txn_id || "",
            operator: "Vi",
            msisdn_masked: order.msisdn.replace(
              /(\d{2})\d{6}(\d{2})/,
              "$1******$2"
            ),
            plan_name: order.plan.name,
          },
        },
      },
    };
  }

  // Otherwise show status card
  return {
    data: {
      order_id: order.order_id,
      payment_status: order.payment_status,
      fulfillment_status: order.fulfillment_status,
    },
    _meta: {
      ui: {
        component: "RechargeStatusCard",
        props: {
          order_id: order.order_id,
          payment_status: order.payment_status,
          fulfillment_status: order.fulfillment_status,
          last_updated: order.updated_at,
        },
      },
    },
  };
}
