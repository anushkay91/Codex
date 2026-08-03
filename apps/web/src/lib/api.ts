const API_BASE = (import.meta as any).env?.VITE_API_URL ?? "/api/v1";

export type Dashboard = { revenue_paise: number; tax_collected_paise: number; outstanding_paise: number; low_stock_count: number };
export type AgentRun = { id: string; status: string; current_node: string | null; summary: string | null };
export type AgentEvent = { id: string; sequence: number; agent: string; status: string; tool?: string; payload: Record<string, unknown>; created_at: string };

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("agentkart_token");
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!response.ok) throw new Error((await response.json().catch(() => ({ detail: "Request failed" }))).detail);
  return response.json() as Promise<T>;
}

export const api = {
  dashboard: () => request<Dashboard>("/dashboard"),
  products: () => request<Array<{ id: string; name: string; sku: string; stock_quantity: number; reorder_point: number }>>("/products"),
  invoices: () => request<Array<{ id: string; invoice_number: string; total_paise: number; status: string; invoice_date: string; subtotal_paise: number; tax_paise: number }>>("/invoices"),
  confirmInvoice: (id: string) => request<unknown>(`/invoices/${id}/confirm`, { method: "POST" }),
  login: (email: string, password: string) => request<{ access_token: string }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (fullName: string, email: string, password: string, orgName: string) => request<{ access_token: string }>("/auth/register", { method: "POST", body: JSON.stringify({ full_name: fullName, email, password, organization_name: orgName }) }),
  upload: (file: File) => { const form = new FormData(); form.append("file", file); return request<{ id: string }>("/documents/upload", { method: "POST", body: form }); },
  run: (task: string, document_id?: string) => request<AgentRun>("/agent-runs", { method: "POST", body: JSON.stringify({ task, document_id }) }),
  events: (runId: string) => request<AgentEvent[]>(`/agent-runs/${runId}/events`),
  customers: () => request<Array<{ id: string; name: string; phone?: string; email?: string; gstin?: string }>>("/customers"),
  addCustomer: (name: string, phone?: string, email?: string, gstin?: string) => request<{ id: string }>("/customers", { method: "POST", body: JSON.stringify({ name, phone, email, gstin }) }),
  payments: () => request<Array<{ id: string; customer_id?: string; amount_paise: number; reference: string; received_on: string; status: string }>>("/payments"),
  addPayment: (amountPaise: number, reference: string, receivedOn: string, customerId?: string) => request<unknown>("/payments", { method: "POST", body: JSON.stringify({ amount_paise: amountPaise, reference, received_on: receivedOn, customer_id: customerId }) }),
  gstSummary: (period: string) => request<{ period: string; taxable_value_paise: number; tax_due_paise: number }>(`/gst/${period}`),
  analyticsTrends: () => request<{ trends: Array<{ month: string; revenue: number; profit: number; gst: number }>; recommendations: string[] }>("/analytics/trends")
};

export const inr = (paise: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise / 100);

