import { v4 as uuidv4 } from "uuid";
import type { Order, Plan } from "./types.js";

// ── In-memory mock data store ──

const PLANS: Plan[] = [
  { id: "p1", name: "Vi Unlimited 84 Days", price: 299, validity: "84 days", data: "1.5 GB/day", description: "Unlimited calls + 1.5GB daily data + Vi Movies & TV", category: "Popular" },
  { id: "p2", name: "Vi Unlimited 28 Days", price: 199, validity: "28 days", data: "1.5 GB/day", description: "Unlimited calls + 1.5GB daily data", category: "Popular" },
  { id: "p3", name: "Vi Data Booster 2GB", price: 49, validity: "28 days", data: "2 GB", description: "Add-on data pack", category: "Data" },
  { id: "p4", name: "Vi Data Booster 6GB", price: 98, validity: "28 days", data: "6 GB", description: "Add-on data pack", category: "Data" },
  { id: "p5", name: "Vi Hero Unlimited", price: 599, validity: "84 days", data: "2 GB/day", description: "Truly unlimited + 2GB daily data + Vi Movies & TV + Weekend rollover", category: "Popular" },
  { id: "p6", name: "Vi Talktime ₹100", price: 100, validity: "Unlimited", data: "None", description: "₹81.75 talktime", category: "Talktime" },
  { id: "p7", name: "Vi Talktime ₹200", price: 200, validity: "Unlimited", data: "None", description: "₹163.50 talktime", category: "Talktime" },
  { id: "p8", name: "Vi Annual Plan", price: 2999, validity: "365 days", data: "2 GB/day", description: "Unlimited calls + 2GB daily data for 1 year + Vi Movies & TV", category: "Annual" },
  { id: "p9", name: "Vi Weekend Data", price: 79, validity: "7 days", data: "5 GB", description: "Weekend data booster", category: "Data" },
  { id: "p10", name: "Vi International Roaming", price: 575, validity: "30 days", data: "500 MB", description: "IR pack with calls and data", category: "Roaming" },
];

const orders = new Map<string, Order>();

// Track idempotency keys to prevent double charges
const idempotencyKeys = new Map<string, string>(); // key -> order_id

export function getPlans(): Plan[] {
  return PLANS;
}

export function getPlanById(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function createOrder(planId: string, msisdn: string, idempotencyKey?: string): Order {
  // Idempotency check: if same key was used, return existing order
  if (idempotencyKey && idempotencyKeys.has(idempotencyKey)) {
    const existingId = idempotencyKeys.get(idempotencyKey)!;
    return orders.get(existingId)!;
  }

  const plan = getPlanById(planId);
  if (!plan) throw new Error(`Plan ${planId} not found`);

  const order: Order = {
    order_id: uuidv4().slice(0, 8).toUpperCase(),
    msisdn,
    plan_id: planId,
    plan,
    amount: plan.price,
    payment_status: "pending",
    fulfillment_status: "pending",
    operator_txn_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    idempotency_key: idempotencyKey || uuidv4(),
  };

  orders.set(order.order_id, order);
  idempotencyKeys.set(order.idempotency_key, order.order_id);
  return order;
}

export function getOrder(orderId: string): Order | undefined {
  return orders.get(orderId);
}

export function updateOrderPayment(orderId: string, status: "success" | "failed"): Order {
  const order = orders.get(orderId);
  if (!order) throw new Error(`Order ${orderId} not found`);

  // Idempotency: don't process payment twice
  if (order.payment_status !== "pending") {
    return order;
  }

  order.payment_status = status;
  order.updated_at = new Date().toISOString();

  if (status === "success") {
    // Simulate recharge fulfillment
    order.fulfillment_status = "processing";
    order.updated_at = new Date().toISOString();

    // Simulate async fulfillment (success after short delay)
    setTimeout(() => {
      order.fulfillment_status = "success";
      order.operator_txn_id = "OPR" + uuidv4().slice(0, 10).toUpperCase();
      order.updated_at = new Date().toISOString();
    }, 2000);
  }

  return order;
}
