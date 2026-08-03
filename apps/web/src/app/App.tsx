import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  Boxes,
  FileUp,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  Settings,
  ShieldCheck,
  Users,
  Plus,
  Search,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Play,
  Check,
  FileText,
  Send
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { api, inr } from "../lib/api";

const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/upload", label: "Upload Invoice", icon: FileUp },
  { to: "/inventory", label: "Inventory", icon: Boxes },
  { to: "/payments", label: "Payments", icon: IndianRupee },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/gst", label: "GST", icon: ReceiptText },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/activity", label: "Agent Activity", icon: Activity },
  { to: "/settings", label: "Settings", icon: Settings },
];

function Shell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("agentkart_token");
  
  // Custom payload parser for JWT
  const getUserEmail = () => {
    if (!token) return "owner@msme.in";
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      return JSON.parse(jsonPayload).sub || "owner@msme.in";
    } catch {
      return "owner@msme.in";
    }
  };

  return (
    <div className="shell">
      <aside>
        <NavLink to="/" className="brand">
          <span className="brand-mark"><Bot size={21} /></span>
          <span>AgentKart<em> AI</em></span>
        </NavLink>
        <p className="eyebrow">AUTONOMOUS BACK OFFICE</p>
        <nav>
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="secure">
            <ShieldCheck size={16} />
            <span>Data protected</span>
          </div>
          <div className="user-email-badge" style={{ fontSize: "11px", color: "#a3acab", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {getUserEmail()}
          </div>
          <button onClick={() => { localStorage.removeItem("agentkart_token"); navigate("/login"); }}>
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>
      <main>
        <header>
          <div>
            <p className="eyebrow">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</p>
            <h1>Good morning, Owner.</h1>
          </div>
          <button className="icon-button" aria-label="Notifications" onClick={() => navigate("/activity")}>
            <Bell size={19} />
            <i />
          </button>
        </header>
        {children}
      </main>
    </div>
  );
}

function Overview() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: api.dashboard });
  const { data: invoices = [], refetch: refetchInvoices } = useQuery({ queryKey: ["invoices"], queryFn: api.invoices });
  const [taskInput, setTaskInput] = useState("");
  
  const confirmMutation = useMutation({
    mutationFn: api.confirmInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      refetchInvoices();
    }
  });

  const runMutation = useMutation({
    mutationFn: (task: string) => api.run(task),
    onSuccess: (run) => navigate(`/activity?run=${run.id}`)
  });

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    runMutation.mutate(taskInput);
  };

  const cards = [
    { label: "Verified Revenue", value: inr(data?.revenue_paise ?? 0), accent: "cyan" },
    { label: "Outstanding Dues", value: inr(data?.outstanding_paise ?? 0), accent: "violet" },
    { label: "GST Collected", value: inr(data?.tax_collected_paise ?? 0), accent: "amber" },
    { label: "Low-stock Items", value: data?.low_stock_count ?? 0, accent: "rose" },
  ];

  return (
    <>
      <section className="hero">
        <div>
          <span className="live-dot" />
          AI Team Online & Monitoring
          <h2>
            Your business is moving.<br />
            <strong>We&apos;re keeping it organized.</strong>
          </h2>
        </div>
        <NavLink to="/upload" className="primary">
          Process a document
          <FileUp size={17} />
        </NavLink>
      </section>
      
      <section className="metric-grid">
        {cards.map((card, index) => (
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            key={card.label}
            className={`metric ${card.accent}`}
          >
            <p>{card.label}</p>
            <strong>{isLoading ? "—" : card.value}</strong>
            <span>Confirmed business data</span>
          </motion.article>
        ))}
      </section>

      {/* Dynamic Supervisor Instruction Widget */}
      <section className="panel" style={{ marginBottom: "22px" }}>
        <div className="panel-title">
          <div>
            <p className="eyebrow">COMMAND CENTRAL</p>
            <h3>Direct your Supervisor Agent</h3>
          </div>
          <Bot size={20} style={{ color: "#7ff4cf" }} />
        </div>
        <form onSubmit={handleTaskSubmit} style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
          <input
            style={{
              flex: 1,
              background: "#111415",
              color: "#ecf3f1",
              border: "1px solid #343c3c",
              borderRadius: "8px",
              padding: "12px 16px"
            }}
            placeholder="Type a task, e.g., 'Summarize GSTR-1, analyze inventory levels and check outstanding customer dues.'"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
          />
          <button className="primary" type="submit" disabled={runMutation.isPending}>
            {runMutation.isPending ? <RefreshCw className="animate-spin" size={16} /> : <Send size={16} />}
            <span>{runMutation.isPending ? "Delegating..." : "Instruct"}</span>
          </button>
        </form>
      </section>

      <section className="grid-two">
        <article className="panel chart">
          <div className="panel-title">
            <div>
              <p className="eyebrow">BUSINESS PULSE</p>
              <h3>Confirmed Sales</h3>
            </div>
            <BarChart3 size={19} />
          </div>
          <div style={{ marginTop: "15px" }}>
            {invoices.length === 0 ? (
              <div className="empty" style={{ minHeight: "150px" }}>
                <BarChart3 size={24} />
                <p>No confirmed invoice data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={invoices.map((item, idx) => ({ name: item.invoice_number || `#${idx + 1}`, amount: item.total_paise / 100 }))}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={(value) => `₹${value}`} cursor={{ fill: "rgba(255,255,255,.04)" }} />
                  <Bar dataKey="amount" fill="#7ff4cf" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="panel">
          <div className="panel-title">
            <div>
              <p className="eyebrow">INVOICE DESK</p>
              <h3>Recent Invoices</h3>
            </div>
            <FileText size={19} style={{ color: "#7ff4cf" }} />
          </div>
          <div style={{ display: "grid", gap: "10px", marginTop: "15px" }}>
            {invoices.length === 0 ? (
              <div className="empty" style={{ minHeight: "150px" }}>
                <Bot size={24} />
                <p>No invoice drafts</p>
              </div>
            ) : (
              invoices.slice(0, 4).map((inv) => (
                <div key={inv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div>
                    <strong style={{ fontSize: "14px", display: "block" }}>{inv.invoice_number}</strong>
                    <span style={{ fontSize: "11px", color: "#8d9996" }}>{inv.invoice_date}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "700" }}>{inr(inv.total_paise)}</span>
                    {inv.status === "draft" ? (
                      <button
                        onClick={() => confirmMutation.mutate(inv.id)}
                        disabled={confirmMutation.isPending}
                        style={{ background: "#7ff4cf", color: "#06100e", border: "0", borderRadius: "6px", fontSize: "11px", fontWeight: "700", padding: "4px 8px" }}
                      >
                        Confirm
                      </button>
                    ) : (
                      <span style={{ color: "#7ff4cf", fontSize: "11px", fontWeight: "700", background: "rgba(127,244,207,0.1)", padding: "4px 8px", borderRadius: "6px" }}>Confirmed</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </>
  );
}

function Upload() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<{ file: FileList; task: string }>({
    defaultValues: { task: "Extract invoice details, check stock levels, match any pending payments, and calculate GST dues." },
  });
  const mutation = useMutation({
    mutationFn: async ({ file, task }: { file: File; task: string }) => {
      const doc = await api.upload(file);
      return api.run(task, doc.id);
    },
    onSuccess: (run) => navigate(`/activity?run=${run.id}`),
  });

  return (
    <section className="content narrow">
      <p className="eyebrow">INTAKE DESK</p>
      <h2>Hand it to your AI team.</h2>
      <p className="lede">Upload a PDF invoice, receipt image, or UPI screenshot. The Supervisor Agent will route the task, extract parameters, and update the ledger once you confirm.</p>
      <form className="upload-card" onSubmit={handleSubmit(values => mutation.mutate({ file: values.file?.[0], task: values.task }))}>
        <label className="drop">
          <FileUp size={30} />
          <strong>Drop a business document</strong>
          <span>PDF, PNG, JPEG, or CSV · maximum 10 MB</span>
          <input type="file" accept=".pdf,.png,.jpg,.jpeg,.csv" {...register("file", { required: "Choose a document first" })} />
        </label>
        {errors.file && <p className="error">{errors.file.message}</p>}
        <label>
          Task brief / instructions
          <textarea {...register("task", { required: true })} />
        </label>
        {mutation.error && <p className="error">{mutation.error.message}</p>}
        <button className="primary" disabled={mutation.isPending}>
          {mutation.isPending ? "Delegating..." : "Start AI workflow"}
          <Bot size={17} />
        </button>
      </form>
    </section>
  );
}

function Inventory() {
  const queryClient = useQueryClient();
  const { data = [], refetch } = useQuery({ queryKey: ["products"], queryFn: api.products });
  const [showAddForm, setShowAddForm] = useState(false);
  const { register, handleSubmit, reset } = useForm<{ sku: string; name: string; hsn_code: string; reorder_point: number }>();

  const createMutation = useMutation({
    mutationFn: (payload: { sku: string; name: string; hsn_code: string; reorder_point: number }) => {
      return fetch(`http://localhost:8000/api/v1/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("agentkart_token")}`
        },
        body: JSON.stringify(payload)
      }).then(res => {
        if (!res.ok) throw new Error("Failed to add product");
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      refetch();
      reset();
      setShowAddForm(false);
    }
  });

  return (
    <section className="content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p className="eyebrow">STOCK INTELLIGENCE</p>
          <h2>Inventory management.</h2>
        </div>
        <button className="primary" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={16} />
          Add Product
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="panel" style={{ marginTop: "15px", padding: "20px" }}>
            <h3>Create Product Card</h3>
            <form onSubmit={handleSubmit(v => createMutation.mutate(v))} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "10px" }}>
              <input placeholder="SKU (e.g. SKU-STEEL-10)" {...register("sku", { required: true })} style={{ background: "#111415", border: "1px solid #343c3c", borderRadius: "6px", padding: "8px", color: "#fff" }} />
              <input placeholder="Product Name" {...register("name", { required: true })} style={{ background: "#111415", border: "1px solid #343c3c", borderRadius: "6px", padding: "8px", color: "#fff" }} />
              <input placeholder="HSN Code (optional)" {...register("hsn_code")} style={{ background: "#111415", border: "1px solid #343c3c", borderRadius: "6px", padding: "8px", color: "#fff" }} />
              <input type="number" placeholder="Reorder Point" {...register("reorder_point", { required: true, valueAsNumber: true })} style={{ background: "#111415", border: "1px solid #343c3c", borderRadius: "6px", padding: "8px", color: "#fff" }} />
              <div style={{ gridColumn: "span 3", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowAddForm(false)} style={{ background: "rgba(255,255,255,0.05)", border: "0", color: "#fff", padding: "8px 16px", borderRadius: "6px" }}>Cancel</button>
                <button type="submit" className="primary" style={{ padding: "8px 16px" }}>Save Product</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="table panel" style={{ marginTop: "20px" }}>
        <div className="row head">
          <span>Product Name</span>
          <span>SKU</span>
          <span>Stock Quantity</span>
          <span>Reorder Threshold</span>
        </div>
        {data.length ? data.map(item => (
          <div className="row" key={item.id}>
            <strong>{item.name}</strong>
            <span>{item.sku}</span>
            <span className={item.stock_quantity <= item.reorder_point ? "danger" : ""} style={{ fontWeight: "bold" }}>
              {item.stock_quantity} {item.stock_quantity <= item.reorder_point && "⚠️ (Low)"}
            </span>
            <span>{item.reorder_point}</span>
          </div>
        )) : (
          <div className="empty">
            <Boxes size={27} />
            <p>No products yet</p>
            <span>Products will automatically import from processed invoices or manually add above.</span>
          </div>
        )}
      </div>
    </section>
  );
}

function Payments() {
  const queryClient = useQueryClient();
  const { data: payments = [], refetch } = useQuery({ queryKey: ["payments"], queryFn: api.payments });
  const [showAddForm, setShowAddForm] = useState(false);
  const { register, handleSubmit, reset } = useForm<{ amount_paise: number; reference: string; received_on: string }>();

  const createMutation = useMutation({
    mutationFn: (v: { amount_paise: number; reference: string; received_on: string }) => api.addPayment(v.amount_paise * 100, v.reference, v.received_on),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      refetch();
      reset();
      setShowAddForm(false);
    }
  });

  return (
    <section className="content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p className="eyebrow">RECONCILIATION LEDGER</p>
          <h2>Payments tracking.</h2>
        </div>
        <button className="primary" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={16} />
          Record UPI Reference
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="panel" style={{ marginTop: "15px", padding: "20px" }}>
            <h3>Record Payment</h3>
            <form onSubmit={handleSubmit(v => createMutation.mutate(v))} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "10px" }}>
              <input type="number" placeholder="Amount (INR)" {...register("amount_paise", { required: true, valueAsNumber: true })} style={{ background: "#111415", border: "1px solid #343c3c", borderRadius: "6px", padding: "8px", color: "#fff" }} />
              <input placeholder="UPI Reference (UTR)" {...register("reference", { required: true })} style={{ background: "#111415", border: "1px solid #343c3c", borderRadius: "6px", padding: "8px", color: "#fff" }} />
              <input type="date" {...register("received_on", { required: true })} style={{ background: "#111415", border: "1px solid #343c3c", borderRadius: "6px", padding: "8px", color: "#fff" }} />
              <div style={{ gridColumn: "span 3", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowAddForm(false)} style={{ background: "rgba(255,255,255,0.05)", border: "0", color: "#fff", padding: "8px 16px", borderRadius: "6px" }}>Cancel</button>
                <button type="submit" className="primary" style={{ padding: "8px 16px" }}>Save Payment</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="table panel" style={{ marginTop: "20px" }}>
        <div className="row head" style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1.2fr" }}>
          <span>Payment Reference (UTR)</span>
          <span>Received Date</span>
          <span>Amount</span>
          <span>Status</span>
        </div>
        {payments.length ? payments.map(item => (
          <div className="row" key={item.id} style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1.2fr" }}>
            <strong>{item.reference}</strong>
            <span>{item.received_on}</span>
            <span style={{ fontWeight: "700" }}>{inr(item.amount_paise)}</span>
            <span>
              <span style={{
                fontSize: "11px",
                fontWeight: "700",
                padding: "4px 8px",
                borderRadius: "6px",
                background: item.status === "unallocated" ? "rgba(244,207,130,0.1)" : "rgba(127,244,207,0.1)",
                color: item.status === "unallocated" ? "#f4cf82" : "#7ff4cf"
              }}>
                {item.status.toUpperCase()}
              </span>
            </span>
          </div>
        )) : (
          <div className="empty">
            <IndianRupee size={27} />
            <p>No recorded payments</p>
            <span>UPI receipts processed by the Intake Desk will automatically map details here.</span>
          </div>
        )}
      </div>
    </section>
  );
}

function Customers() {
  const queryClient = useQueryClient();
  const { data: customers = [], refetch } = useQuery({ queryKey: ["customers"], queryFn: api.customers });
  const [showAddForm, setShowAddForm] = useState(false);
  const { register, handleSubmit, reset } = useForm<{ name: string; phone: string; email: string; gstin: string }>();

  const createMutation = useMutation({
    mutationFn: (v: { name: string; phone: string; email: string; gstin: string }) => api.addCustomer(v.name, v.phone, v.email, v.gstin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      refetch();
      reset();
      setShowAddForm(false);
    }
  });

  return (
    <section className="content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p className="eyebrow">CUSTOMER LEDGER</p>
          <h2>Customer Directory</h2>
        </div>
        <button className="primary" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={16} />
          Create Customer Profile
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="panel" style={{ marginTop: "15px", padding: "20px" }}>
            <h3>Create Customer Profile</h3>
            <form onSubmit={handleSubmit(v => createMutation.mutate(v))} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "10px" }}>
              <input placeholder="Company Name" {...register("name", { required: true })} style={{ background: "#111415", border: "1px solid #343c3c", borderRadius: "6px", padding: "8px", color: "#fff" }} />
              <input placeholder="Phone No" {...register("phone")} style={{ background: "#111415", border: "1px solid #343c3c", borderRadius: "6px", padding: "8px", color: "#fff" }} />
              <input placeholder="Email Address" {...register("email")} style={{ background: "#111415", border: "1px solid #343c3c", borderRadius: "6px", padding: "8px", color: "#fff" }} />
              <input placeholder="GSTIN (e.g. 27AAAAA1111A1Z1)" {...register("gstin")} style={{ background: "#111415", border: "1px solid #343c3c", borderRadius: "6px", padding: "8px", color: "#fff", gridColumn: "span 3" }} />
              <div style={{ gridColumn: "span 3", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowAddForm(false)} style={{ background: "rgba(255,255,255,0.05)", border: "0", color: "#fff", padding: "8px 16px", borderRadius: "6px" }}>Cancel</button>
                <button type="submit" className="primary" style={{ padding: "8px 16px" }}>Save Profile</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="table panel" style={{ marginTop: "20px" }}>
        <div className="row head" style={{ gridTemplateColumns: "2fr 1fr 1fr 1.5fr" }}>
          <span>Customer/Company Name</span>
          <span>Phone</span>
          <span>Email</span>
          <span>GSTIN</span>
        </div>
        {customers.length ? customers.map(item => (
          <div className="row" key={item.id} style={{ gridTemplateColumns: "2fr 1fr 1fr 1.5fr" }}>
            <strong>{item.name}</strong>
            <span>{item.phone || "—"}</span>
            <span>{item.email || "—"}</span>
            <span style={{ fontFamily: "monospace" }}>{item.gstin || "—"}</span>
          </div>
        )) : (
          <div className="empty">
            <Users size={27} />
            <p>No customers recorded</p>
            <span>Save customer information above or process files to auto-extract details.</span>
          </div>
        )}
      </div>
    </section>
  );
}

function GstPage() {
  const currentPeriod = new Date().toISOString().slice(0, 7); // e.g. "2026-08"
  const { data, isLoading } = useQuery({
    queryKey: ["gst", currentPeriod],
    queryFn: () => api.gstSummary(currentPeriod)
  });

  return (
    <section className="content">
      <p className="eyebrow">COMPLIANCE PORTAL</p>
      <h2>GST Filings & Liability</h2>
      
      <div className="metric-grid" style={{ marginTop: "20px" }}>
        <article className="metric cyan">
          <p>Taxable Value ({currentPeriod})</p>
          <strong>{isLoading ? "—" : inr(data?.taxable_value_paise ?? 0)}</strong>
          <span>Accumulated output supply</span>
        </article>
        <article className="metric amber">
          <p>Estimated GST Due</p>
          <strong>{isLoading ? "—" : inr(data?.tax_due_paise ?? 0)}</strong>
          <span>Payable CGST/SGST/IGST</span>
        </article>
        <article className="metric violet">
          <p>GSTR-1 Due Date</p>
          <strong>11th Next Month</strong>
          <span>Output invoice upload</span>
        </article>
        <article className="metric rose">
          <p>GSTR-3B Due Date</p>
          <strong>20th Next Month</strong>
          <span>Self-assessment summary</span>
        </article>
      </div>

      <div className="panel" style={{ marginTop: "22px" }}>
        <div className="panel-title">
          <div>
            <p className="eyebrow">COMPLIANCE STATE</p>
            <h3>Monthly GST Summary Logs</h3>
          </div>
          <ReceiptText size={20} style={{ color: "#7ff4cf" }} />
        </div>
        <div style={{ marginTop: "15px", display: "grid", gap: "10px" }}>
          <div style={{ padding: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
            <span><strong>Period:</strong> {currentPeriod}</span>
            <span><strong>Status:</strong> <span style={{ color: "#f4cf82", fontWeight: "bold" }}>Draft</span></span>
          </div>
          <div style={{ padding: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
            <span><strong>Period:</strong> 2026-07</span>
            <span><strong>Status:</strong> <span style={{ color: "#7ff4cf", fontWeight: "bold" }}>Filing Ready</span></span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Analytics() {
  const { data, isLoading } = useQuery({ queryKey: ["analyticsTrends"], queryFn: api.analyticsTrends });

  return (
    <section className="content">
      <p className="eyebrow">VERIFIED INSIGHTS</p>
      <h2>Business Intelligence</h2>

      <div className="grid-two" style={{ marginTop: "20px" }}>
        <article className="panel chart" style={{ height: "350px" }}>
          <div className="panel-title">
            <div>
              <p className="eyebrow">FINANCIAL PERFORMANCE</p>
              <h3>Revenue vs Profit Trends (INR)</h3>
            </div>
            <BarChart3 size={19} />
          </div>
          <div style={{ marginTop: "20px" }}>
            {isLoading ? (
              <p>Loading analytics graphs...</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data?.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#7ff4cf" activeDot={{ r: 8 }} strokeWidth={2} name="Sales" />
                  <Line type="monotone" dataKey="profit" stroke="#b8a7ff" strokeWidth={2} name="Estimated Profit" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="panel">
          <div className="panel-title">
            <div>
              <p className="eyebrow">AI STRATEGIST</p>
              <h3>Recommendations</h3>
            </div>
            <Bot size={20} style={{ color: "#7ff4cf" }} />
          </div>
          <div style={{ marginTop: "20px", display: "grid", gap: "12px" }}>
            {isLoading ? (
              <p>Retrieving recommendations...</p>
            ) : (
              data?.recommendations.map((rec, idx) => (
                <div key={idx} style={{ display: "flex", gap: "10px", padding: "12px", background: "rgba(127,244,207,0.05)", border: "1px solid rgba(127,244,207,0.1)", borderRadius: "8px" }}>
                  <AlertCircle size={18} style={{ color: "#7ff4cf", flexShrink: 0 }} />
                  <p style={{ fontSize: "13px", margin: 0, color: "#e7efed" }}>{rec}</p>
                </div>
              ))
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

function ActivityPage() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const id = new URLSearchParams(location.search).get("run");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const { data = [], isLoading, refetch } = useQuery({
    queryKey: ["events", id],
    queryFn: () => api.events(id!),
    enabled: Boolean(id),
    refetchInterval: 3000
  });

  const toggleExpand = (sequence: number) => {
    setExpandedItems(prev => ({ ...prev, [sequence]: !prev[sequence] }));
  };

  return (
    <section className="content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p className="eyebrow">EXECUTION TRACE</p>
          <h2>Agent Activity Timeline</h2>
          <p className="lede">A live, step-by-step audit logs record of autonomous planning, routing, delegation, and execution details.</p>
        </div>
        {id && (
          <button className="primary" onClick={() => { queryClient.invalidateQueries({ queryKey: ["events", id] }); refetch(); }} style={{ padding: "8px 12px" }}>
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {!id ? (
        <div className="empty panel" style={{ marginTop: "20px" }}>
          <Activity size={30} />
          <p>No active workflow selected</p>
          <span>Select a timeline from the Overview dashboard or upload a document to begin.</span>
        </div>
      ) : (
        <div className="timeline panel" style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
          {isLoading && <p>Connecting to Agent orchestration channels...</p>}
          {data.length === 0 ? (
            <p>Awaiting Supervisor Dispatch...</p>
          ) : (
            data.map((event) => {
              const isExpanded = !!expandedItems[event.sequence];
              return (
                <div key={event.id} style={{ display: "flex", gap: "15px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "15px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div className={`status-dot ${event.status}`} style={{ margin: "4px 0" }} />
                    <div style={{ flex: 1, width: "1px", background: "rgba(255,255,255,0.1)" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", cursor: "pointer" }} onClick={() => toggleExpand(event.sequence)}>
                      <div>
                        <strong style={{ fontSize: "14px", color: "#edf5f2" }}>{event.agent}</strong>
                        <span style={{ fontSize: "11px", color: "#8d9996", display: "block" }}>
                          Tool: <code style={{ color: "#7ff4cf" }}>{event.tool || "None"}</code> · {new Date(event.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className="event-status" style={{ fontSize: "10px", color: event.status === "completed" ? "#7ff4cf" : "#f4cf82" }}>
                          {event.status.replaceAll("_", " ").toUpperCase()}
                        </span>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginTop: "10px" }}>
                          <pre style={{
                            background: "#08090a",
                            color: "#85cdb9",
                            padding: "12px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            overflowX: "auto",
                            border: "1px solid rgba(255,255,255,0.05)"
                          }}>
                            {JSON.stringify(event.payload, null, 2)}
                          </pre>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );
}

function SettingsPage() {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      orgName: "MSME Enterprises India",
      gstin: "27AAAAA1111A1Z1",
      stateCode: "27",
      autopilot: true
    }
  });

  return (
    <section className="content narrow">
      <p className="eyebrow">ORGANIZATION PROFILE</p>
      <h2>Settings</h2>
      
      <form className="panel" style={{ marginTop: "20px", padding: "24px", display: "grid", gap: "15px" }} onSubmit={handleSubmit(() => alert("Settings saved!"))}>
        <label style={{ display: "grid", gap: "6px" }}>
          Company Name
          <input {...register("orgName")} style={{ background: "#111415", border: "1px solid #343c3c", borderRadius: "6px", padding: "10px", color: "#fff" }} />
        </label>
        <label style={{ display: "grid", gap: "6px" }}>
          GSTIN Registration
          <input {...register("gstin")} style={{ background: "#111415", border: "1px solid #343c3c", borderRadius: "6px", padding: "10px", color: "#fff" }} />
        </label>
        <label style={{ display: "grid", gap: "6px" }}>
          State Code
          <input {...register("stateCode")} style={{ background: "#111415", border: "1px solid #343c3c", borderRadius: "6px", padding: "10px", color: "#fff" }} />
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
          <input type="checkbox" id="autopilot" {...register("autopilot")} />
          <label htmlFor="autopilot">Enable Autopilot Mode (automatically reconcile high-confidence transactions)</label>
        </div>
        <button className="primary" style={{ justifySelf: "start", marginTop: "15px" }}>Save Settings</button>
      </form>
    </section>
  );
}

function Login() {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const { register, handleSubmit, reset } = useForm<any>();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: any) => api.login(email, password),
    onSuccess: (data) => {
      localStorage.setItem("agentkart_token", data.access_token);
      navigate("/");
    }
  });

  const registerMutation = useMutation({
    mutationFn: ({ fullName, email, password, orgName }: any) => api.register(fullName, email, password, orgName),
    onSuccess: (data) => {
      localStorage.setItem("agentkart_token", data.access_token);
      navigate("/");
    }
  });

  const onSubmit = (data: any) => {
    if (isRegistering) {
      registerMutation.mutate(data);
    } else {
      loginMutation.mutate(data);
    }
  };

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="brand">
          <span className="brand-mark"><Bot size={21} /></span>
          AgentKart<em> AI</em>
        </div>
        <h1 style={{ marginTop: "20px" }}>{isRegistering ? "Register Org" : "Welcome Back"}</h1>
        <p>{isRegistering ? "Create your autonomous back office account." : "Your AI back office is ready."}</p>
        <form onSubmit={handleSubmit(onSubmit)}>
          {isRegistering && (
            <>
              <input placeholder="Full Name" {...register("fullName", { required: isRegistering })} style={{ background: "#111415", color: "#ecf3f1", border: "1px solid #343c3c", borderRadius: "8px", padding: "10px" }} />
              <input placeholder="Organization/Company Name" {...register("orgName", { required: isRegistering })} style={{ background: "#111415", color: "#ecf3f1", border: "1px solid #343c3c", borderRadius: "8px", padding: "10px" }} />
            </>
          )}
          <input placeholder="Work Email" type="email" {...register("email", { required: true })} style={{ background: "#111415", color: "#ecf3f1", border: "1px solid #343c3c", borderRadius: "8px", padding: "10px" }} />
          <input placeholder="Password" type="password" {...register("password", { required: true })} style={{ background: "#111415", color: "#ecf3f1", border: "1px solid #343c3c", borderRadius: "8px", padding: "10px" }} />
          {isRegistering && <span style={{ fontSize: "11px", color: "#8d9996", marginTop: "-5px", marginBottom: "5px", display: "block" }}>Password must be at least 10 characters long.</span>}
          {loginMutation.error && <p className="error">{loginMutation.error.message}</p>}
          {registerMutation.error && <p className="error">{registerMutation.error.message}</p>}
          <button className="primary" type="submit" disabled={loginMutation.isPending || registerMutation.isPending}>
            {isRegistering ? "Create Account" : "Sign In"}
          </button>
        </form>
        <div style={{ marginTop: "15px", textAlign: "center" }}>
          <button onClick={() => { setIsRegistering(!isRegistering); reset(); }} style={{ background: "none", border: "0", color: "#7ff4cf", fontSize: "12px", textDecoration: "underline", cursor: "pointer" }}>
            {isRegistering ? "Already have an account? Sign in" : "Register a new business"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function App() {
  const authenticated = Boolean(localStorage.getItem("agentkart_token"));
  return (
    <Routes>
      <Route path="/login" element={authenticated ? <Navigate to="/" /> : <Login />} />
      <Route
        path="*"
        element={
          authenticated ? (
            <Shell>
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/gst" element={<GstPage />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/activity" element={<ActivityPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Shell>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}
