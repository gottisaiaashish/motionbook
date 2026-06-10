import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  adminLogin as apiLogin, adminLogout, isAdminAuthenticated,
  adminGetStats, adminGetUsers, adminToggleBlock, adminAssignPlan,
  adminGetOrders, adminApproveOrder, adminRejectOrder,
  adminGetPlans, adminUpdatePlan, adminGetReferrals,
} from "../api";
import {
  LayoutDashboard, Users, Package, ShoppingCart, GitBranch,
  LogOut, TrendingUp, Eye, EyeOff, Search, Check, X, Save,
  ChevronDown, RefreshCw, Shield, ShieldOff, Zap, Clock,
  BarChart3, PlayCircle, Settings
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => (n ?? 0).toLocaleString("en-IN");
const fmtGB = (b) => {
  if (!b) return "0 MB";
  if (b >= 1024 ** 4) return `${(b / 1024 ** 4).toFixed(1)} TB`;
  if (b >= 1024 ** 3) return `${(b / 1024 ** 3).toFixed(1)} GB`;
  return `${(b / 1024 ** 2).toFixed(0)} MB`;
};
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color = "orange" }) => {
  const colors = {
    orange: "from-orange-500/20 to-orange-900/5 border-orange-500/20",
    green: "from-green-500/20 to-green-900/5 border-green-500/20",
    blue: "from-blue-500/20 to-blue-900/5 border-blue-500/20",
    red: "from-red-500/20 to-red-900/5 border-red-500/20",
  };
  const iconColors = { orange: "text-orange-400", green: "text-green-400", blue: "text-blue-400", red: "text-red-400" };
  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-br border ${colors[color]}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3`} style={{ background: "rgba(255,255,255,0.06)" }}>
        <Icon className={`w-5 h-5 ${iconColors[color]}`} />
      </div>
      <div className="text-white text-2xl font-black">{value}</div>
      <div className="text-gray-400 text-sm mt-0.5">{label}</div>
      {sub && <div className="text-gray-600 text-xs mt-1">{sub}</div>}
    </div>
  );
};

// ── Revenue Bar Chart (CSS) ───────────────────────────────────────────────────
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const RevenueChart = ({ data = [] }) => {
  if (!data.length) return <div className="text-center text-gray-600 py-8 text-sm">No revenue data yet</div>;
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="flex items-end gap-2 h-32 mt-4">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="text-gray-500 text-xs">₹{(d.revenue / 1000).toFixed(0)}k</div>
          <div className="w-full rounded-t-lg transition-all duration-500"
            style={{ height: `${(d.revenue / max) * 80}px`, minHeight: "4px", background: "linear-gradient(to top, #ea580c, #f97316)" }} />
          <div className="text-gray-600 text-xs">{MONTH_NAMES[(d._id?.month || 1) - 1]}</div>
        </div>
      ))}
    </div>
  );
};

// ── LOGIN PAGE ────────────────────────────────────────────────────────────────
const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await apiLogin(email, password);
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm p-8 rounded-3xl"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <PlayCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-white font-black">Motionbook</div>
            <div className="text-orange-400 text-xs font-semibold">Admin Panel</div>
          </div>
        </div>
        <h2 className="text-white font-bold text-xl mb-6">Sign in as Admin</h2>
        <form onSubmit={handle} className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs mb-1.5 block">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none focus:border-orange-500/60 transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              placeholder="admin@motionbook.com" />
          </div>
          <div className="relative">
            <label className="text-gray-400 text-xs mb-1.5 block">Password</label>
            <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none focus:border-orange-500/60 transition-colors pr-10"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
            <button type="button" onClick={() => setShow(!show)}
              className="absolute right-3 top-8 text-gray-500 hover:text-gray-300">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {error && <div className="text-red-400 text-sm p-3 rounded-xl bg-red-500/10">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl transition-colors disabled:opacity-50 mt-2">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// ── OVERVIEW TAB ─────────────────────────────────────────────────────────────
const OverviewTab = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetStats().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!stats) return <div className="text-gray-500 text-center py-16">Failed to load stats</div>;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={fmt(stats.totalUsers)} sub={`+${fmt(stats.newUsersThisMonth)} this month`} color="blue" />
        <StatCard icon={Zap} label="Active Subscriptions" value={fmt(stats.activeSubscriptions)} color="orange" />
        <StatCard icon={TrendingUp} label="Total Revenue" value={`₹${fmt(stats.totalRevenue)}`} color="green" />
        <StatCard icon={ShoppingCart} label="Pending Orders" value={fmt(stats.pendingOrders)} color={stats.pendingOrders > 0 ? "red" : "orange"} />
      </div>

      {/* Revenue Chart */}
      <div className="p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="text-white font-bold mb-1">Monthly Revenue</div>
        <div className="text-gray-500 text-sm">Last 6 months</div>
        <RevenueChart data={stats.monthlyRevenue || []} />
      </div>

      {/* Plan Distribution */}
      <div className="p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="text-white font-bold mb-4">Active Plan Distribution</div>
        <div className="space-y-3">
          {(stats.planDistribution || []).map((p) => {
            const pct = stats.activeSubscriptions ? Math.round((p.count / stats.activeSubscriptions) * 100) : 0;
            return (
              <div key={p._id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{p.planName}</span>
                  <span className="text-gray-500">{p.count} users ({pct}%)</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #f97316, #ea580c)", transition: "width 0.5s" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── USERS TAB ─────────────────────────────────────────────────────────────────
const UsersTab = ({ plans }) => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null); // userId
  const [assignPlan, setAssignPlan] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    adminGetUsers({ search })
      .then((d) => { setUsers(d.users); setTotal(d.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const handleBlock = async (userId) => {
    await adminToggleBlock(userId).catch(() => {});
    load();
  };

  const handleAssign = async (userId) => {
    if (!assignPlan) return;
    await adminAssignPlan(userId, assignPlan).catch((e) => alert(e.message));
    setAssigning(null);
    setAssignPlan("");
    load();
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-white text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
        </div>
        <span className="text-gray-500 text-sm whitespace-nowrap">{fmt(total)} users</span>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                {["User", "Plan", "Storage", "Joined", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-gray-500 font-medium text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-600">Loading…</td></tr>
              ) : users.map((u) => {
                const sub = u.subscription;
                const plan = sub?.planId;
                const storageUsed = sub?.storageUsedBytes || 0;
                const storageMax = plan?.maxStorageBytes || 1;
                const storagePct = Math.min(100, Math.round((storageUsed / storageMax) * 100));
                return (
                  <tr key={u._id} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                    <td className="px-4 py-3">
                      <div className="text-white font-medium">{u.name}</div>
                      <div className="text-gray-500 text-xs">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      {plan ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-orange-400" style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)" }}>
                          {plan.icon} {plan.name}
                        </span>
                      ) : <span className="text-gray-600 text-xs">No plan</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-300 text-xs">{fmtGB(storageUsed)} / {fmtGB(storageMax)}</div>
                      <div className="h-1 w-16 rounded-full mt-1" style={{ background: "rgba(255,255,255,0.1)" }}>
                        <div className="h-full rounded-full" style={{ width: `${storagePct}%`, background: storagePct > 80 ? "#ef4444" : "#f97316" }} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.isBlocked ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
                        {u.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleBlock(u._id)} title={u.isBlocked ? "Unblock" : "Block"}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                          {u.isBlocked ? <Shield className="w-4 h-4 text-green-400" /> : <ShieldOff className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setAssigning(u._id)}
                          className="px-2 py-1 rounded-lg text-xs font-medium text-orange-400 hover:bg-orange-500/10 transition-colors border border-orange-500/20">
                          Assign Plan
                        </button>
                      </div>
                      {assigning === u._id && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <select value={assignPlan} onChange={(e) => setAssignPlan(e.target.value)}
                            className="text-xs px-2 py-1.5 rounded-lg text-white outline-none"
                            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                            <option value="">Select plan…</option>
                            {plans.filter((p) => p.type !== "demo").map((p) => (
                              <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                          </select>
                          <button onClick={() => handleAssign(u._id)} className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => { setAssigning(null); setAssignPlan(""); }} className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ── PLANS TAB ─────────────────────────────────────────────────────────────────
const PlansTab = () => {
  const [plans, setPlans] = useState([]);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminGetPlans().then(setPlans).catch(() => {});
  }, []);

  const startEdit = (plan) => { setEditing(plan._id); setDraft({ price: plan.price, maxPhotos: plan.maxPhotos, validityDays: plan.validityDays, maxStorageBytes: plan.maxStorageBytes, isActive: plan.isActive }); };
  const save = async (planId) => {
    setSaving(true);
    try {
      const updates = { ...draft, maxStorageBytes: Number(draft.maxStorageBytes) };
      await adminUpdatePlan(planId, updates);
      setPlans((prev) => prev.map((p) => p._id === planId ? { ...p, ...updates } : p));
      setEditing(null);
    } catch { alert("Failed to save"); }
    setSaving(false);
  };

  return (
    <div className="space-y-3">
      {plans.map((plan) => (
        <div key={plan._id} className="p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="text-2xl">{plan.icon}</div>
              <div>
                <div className="text-white font-bold">{plan.name}</div>
                <div className="text-gray-500 text-xs capitalize">{plan.type} plan</div>
              </div>
            </div>
            {editing !== plan._id ? (
              <button onClick={() => startEdit(plan)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-orange-400 border border-orange-500/20 hover:bg-orange-500/10 transition-colors flex items-center gap-1">
                <Settings className="w-3.5 h-3.5" /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => save(plan._id)} disabled={saving} className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-orange-500 hover:bg-orange-400 flex items-center gap-1 disabled:opacity-50">
                  <Save className="w-3.5 h-3.5" /> {saving ? "..." : "Save"}
                </button>
                <button onClick={() => setEditing(null)} className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white border border-white/10">Cancel</button>
              </div>
            )}
          </div>

          {editing === plan._id ? (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Price (₹)", key: "price", type: "number" },
                { label: "Max Photos", key: "maxPhotos", type: "number" },
                { label: "Validity (days)", key: "validityDays", type: "number" },
                { label: "Storage (bytes)", key: "maxStorageBytes", type: "number" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-gray-500 text-xs mb-1 block">{label}</label>
                  <input type={type} value={draft[key] ?? ""} onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-white text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <span className="text-gray-300">₹{fmt(plan.price)}</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-300">{fmt(plan.maxPhotos)} photos</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-300">{fmtGB(plan.maxStorageBytes)}</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-300">{plan.validityDays}d validity</span>
              <span className={`ml-auto px-2 py-0.5 rounded-full text-xs ${plan.isActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                {plan.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ── ORDERS TAB ────────────────────────────────────────────────────────────────
const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending_payment");
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    adminGetOrders({ status: statusFilter })
      .then((d) => setOrders(d.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(load, [load]);

  const approve = async (id) => {
    try {
      const r = await adminApproveOrder(id);
      setActionMsg(r.message);
      load();
    } catch (e) { setActionMsg("Error: " + e.message); }
  };
  const reject = async (id) => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;
    await adminRejectOrder(id, reason).catch(() => {});
    load();
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-white text-sm outline-none"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <option value="pending_payment">Pending Payment</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button onClick={load} className="p-2 rounded-xl text-gray-400 hover:text-white" style={{ background: "rgba(255,255,255,0.05)" }}>
          <RefreshCw className="w-4 h-4" />
        </button>
        {actionMsg && <span className="text-green-400 text-sm">{actionMsg}</span>}
      </div>

      <div className="space-y-3">
        {loading ? <div className="text-center py-8 text-gray-600">Loading…</div>
          : orders.length === 0 ? <div className="text-center py-12 text-gray-600">No {statusFilter.replace("_", " ")} orders</div>
          : orders.map((o) => (
          <div key={o._id} className="p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-white font-semibold">{o.userId?.name || "Unknown"}</div>
                <div className="text-gray-500 text-xs">{o.userId?.email}</div>
                <div className="text-orange-400 text-sm font-bold mt-1">{o.planId?.icon} {o.planId?.name} — ₹{fmt(o.amount)}</div>
                {o.paymentReference && (
                  <div className="text-gray-400 text-xs mt-1">UTR: <span className="text-white font-mono">{o.paymentReference}</span></div>
                )}
                <div className="text-gray-600 text-xs mt-1">{fmtDate(o.createdAt)}</div>
              </div>
              {o.status === "pending_payment" && (
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => approve(o._id)} className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button onClick={() => reject(o._id)} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              )}
              {o.status !== "pending_payment" && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${o.status === "approved" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                  {o.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── REFERRALS TAB ─────────────────────────────────────────────────────────────
const ReferralsTab = () => {
  const [data, setData] = useState(null);

  useEffect(() => { adminGetReferrals().then(setData).catch(() => {}); }, []);
  if (!data) return <div className="text-center py-16 text-gray-600">Loading…</div>;

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard icon={Users} label="Total Referrals" value={fmt(data.total)} />
        <StatCard icon={Check} label="Completed" value={fmt(data.totalCompleted)} color="green" />
        <StatCard icon={Zap} label="Rewards Given" value={fmt(data.rewardsGiven)} color="orange" />
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              {["Referrer", "Referee", "Code", "Status", "Date"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-gray-500 text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.referrals.map((r) => (
              <tr key={r._id} className="border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                <td className="px-4 py-3 text-gray-300 text-xs">{r.referrerId?.name}<br/><span className="text-gray-600">{r.referrerId?.email}</span></td>
                <td className="px-4 py-3 text-gray-300 text-xs">{r.referreeId?.name}<br/><span className="text-gray-600">{r.referreeId?.email}</span></td>
                <td className="px-4 py-3 font-mono text-orange-400 text-xs">{r.referralCode}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${r.status === "completed" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}>{r.status}</span></td>
                <td className="px-4 py-3 text-gray-600 text-xs">{fmtDate(r.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── MAIN ADMIN PANEL ──────────────────────────────────────────────────────────
const TABS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "users", label: "Users", icon: Users },
  { key: "plans", label: "Plans", icon: Package },
  { key: "orders", label: "Orders", icon: ShoppingCart },
  { key: "referrals", label: "Referrals", icon: GitBranch },
];

export default function AdminPanel() {
  const [authed, setAuthed] = useState(isAdminAuthenticated());
  const [activeTab, setActiveTab] = useState("overview");
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    if (authed) adminGetPlans().then(setPlans).catch(() => {});
  }, [authed]);

  if (!authed) return <LoginForm onLogin={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen flex" style={{ background: "#0a0a0a", fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col py-6 border-r border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
        {/* Logo */}
        <div className="px-5 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <PlayCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-black text-sm">Motionbook</div>
              <div className="text-orange-400 text-xs">Admin</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === key ? "bg-orange-500/15 text-orange-400 border border-orange-500/20" : "text-gray-500 hover:text-white hover:bg-white/5"}`}>
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 mt-4">
          <button onClick={() => { adminLogout(); setAuthed(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h1 className="text-white font-black text-2xl capitalize">{TABS.find((t) => t.key === activeTab)?.label}</h1>
          <p className="text-gray-500 text-sm">Motionbook Admin Dashboard</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "users" && <UsersTab plans={plans} />}
            {activeTab === "plans" && <PlansTab />}
            {activeTab === "orders" && <OrdersTab />}
            {activeTab === "referrals" && <ReferralsTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
