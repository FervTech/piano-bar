/**
 * THE PIANO BAR — Digital Ordering System
 * Backend: Supabase (PostgreSQL + Realtime)
 * Auth: Per-staff PIN verified against bcrypt hash in DB
 *
 * SETUP:
 * 1. Run supabase_schema.sql in your Supabase SQL editor
 * 2. npm install @supabase/supabase-js bcryptjs
 * 3. cp .env.example .env  → fill in VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
 * 4. npm run dev
 */

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

// ── Supabase client ──────────────────────────────────────────
const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ── Menu data ────────────────────────────────────────────────
const MENU = [
  {
    category: "Cocktails", icon: "🍸",
    items: [
      { id: "c1", name: "Mojito", price: 45, description: "Rum, mint, lime, soda", customizable: true, options: ["Extra mint", "Extra lime", "Less sugar", "Virgin"] },
      { id: "c2", name: "Margarita", price: 50, description: "Tequila, triple sec, lime", customizable: true, options: ["Salt rim", "No salt", "Frozen", "Virgin"] },
      { id: "c3", name: "Piña Colada", price: 48, description: "Rum, coconut, pineapple", customizable: true, options: ["Extra coconut", "Frozen", "Virgin"] },
      { id: "c4", name: "Negroni", price: 55, description: "Gin, vermouth, Campari", customizable: false, options: [] },
    ],
  },
  {
    category: "Beers", icon: "🍺",
    items: [
      { id: "b1", name: "Heineken 330ml", price: 35, description: "Premium lager", customizable: false, options: [] },
      { id: "b2", name: "Club Beer Large", price: 25, description: "Local favourite", customizable: false, options: [] },
      { id: "b3", name: "Guinness", price: 38, description: "Irish dry stout", customizable: false, options: [] },
      { id: "b4", name: "Savanna Dry", price: 35, description: "South African cider", customizable: false, options: [] },
    ],
  },
  {
    category: "Spirits", icon: "🥃",
    items: [
      { id: "s1", name: "Johnnie Walker Red", price: 130, description: "Blended Scotch 20cl", customizable: true, options: ["Neat", "On the rocks", "With water", "With soda"] },
      { id: "s2", name: "Johnnie Walker Black", price: 180, description: "12-year blend 20cl", customizable: true, options: ["Neat", "On the rocks", "With water", "With soda"] },
      { id: "s3", name: "Hennessy VS", price: 200, description: "Cognac 20cl", customizable: true, options: ["Neat", "On the rocks", "With ginger ale"] },
    ],
  },
  {
    category: "Champagne", icon: "🥂",
    items: [
      { id: "ch1", name: "House Champagne", price: 140, description: "Brut, chilled", customizable: false, options: [] },
      { id: "ch2", name: "Non-Alcoholic Bubbly", price: 80, description: "Sparkling grape, chilled", customizable: false, options: [] },
    ],
  },
  {
    category: "Bites", icon: "🍟",
    items: [
      { id: "f1", name: "Chicken Wings", price: 65, description: "6 pcs, choice of sauce", customizable: true, options: ["BBQ", "Hot sauce", "Lemon pepper", "Peri-peri"] },
      { id: "f2", name: "Loaded Fries", price: 55, description: "Cheese, bacon, jalapeño", customizable: true, options: ["Extra cheese", "No jalapeño", "Add fried egg"] },
      { id: "f3", name: "Spring Rolls", price: 45, description: "4 pcs, sweet chili dip", customizable: false, options: [] },
      { id: "f4", name: "Cheese Platter", price: 85, description: "3 cheeses, crackers, fruit", customizable: false, options: [] },
    ],
  },
];

// ── Status config ────────────────────────────────────────────
const STATUS_COLOR = { Pending: "#b45309", Preparing: "#1d4ed8", Ready: "#15803d", Delivered: "#6b7280" };
const STATUS_BG    = { Pending: "#fef3c7", Preparing: "#dbeafe", Ready: "#dcfce7", Delivered: "#f3f4f6" };
const STATUS_NEXT  = { Pending: "Preparing", Preparing: "Ready", Ready: "Delivered" };
const STATUS_LABEL = { Pending: "🍹 Start preparing", Preparing: "✓ Mark ready", Ready: "🚀 Delivered" };

// ── Toast hook ───────────────────────────────────────────────
let _tid = 0;
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const add = (msg, type = "success") => {
    const id = ++_tid;
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };
  return { toasts, add };
}

// ════════════════════════════════════════════════════════════
export default function App() {
  const [scene, setScene]           = useState("customer");
  const [cart, setCart]             = useState([]);
  const [orders, setOrders]         = useState([]);
  const [tableNo, setTableNo]       = useState(() => {
    try { return new URLSearchParams(window.location.search).get("table") || ""; }
    catch { return ""; }
  });
  const [guestName, setGuestName]   = useState("");
  const [activeCategory, setActiveCategory] = useState(MENU[0].category);
  const [customizeItem, setCustomizeItem]   = useState(null);
  const [chosenOpts, setChosenOpts] = useState([]);
  const [itemNote, setItemNote]     = useState("");
  const [pin, setPin]               = useState("");
  const [pinErr, setPinErr]         = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const [staffUser, setStaffUser]   = useState(null);
  const [bartenderTab, setBartenderTab] = useState("live");
  const [submitting, setSubmitting] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const { toasts, add: addToast }   = useToasts();

  // ── Fetch orders ─────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
    if (!error && data) setOrders(data);
    setLoadingOrders(false);
  }, []);

  // ── Realtime subscription (bartender only) ───────────────
  useEffect(() => {
    if (scene !== "bartender") return;

    let cancelled = false;

    const loadOrders = async () => {
      setLoadingOrders(true);
      const { data, error } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });
      if (!cancelled && !error && data) setOrders(data);
      if (!cancelled) setLoadingOrders(false);
    };

    loadOrders();

    const channel = supabase
        .channel("orders-live")
        .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
          if (payload.eventType === "INSERT") {
            setOrders((prev) => [payload.new, ...prev]);
          }
          if (payload.eventType === "UPDATE") {
            setOrders((prev) => prev.map((o) => o.id === payload.new.id ? payload.new : o));
          }
          if (payload.eventType === "DELETE") {
            setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
          }
        })
        .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [scene]);
  // ── Cart helpers ─────────────────────────────────────────
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const addToCart = (item, opts = [], note = "") => {
    setCart((prev) => {
      const key = item.id + opts.join(",");
      const ex  = prev.find((c) => c._key === key);
      if (ex) return prev.map((c) => c._key === key ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1, opts, note, _key: key }];
    });
  };

  const changeQty = (key, delta) =>
      setCart((prev) =>
          prev.map((c) => c._key === key ? { ...c, qty: c.qty + delta } : c).filter((c) => c.qty > 0)
      );

  // ── Submit order to Supabase ─────────────────────────────
  const submitOrder = async () => {
    if (!tableNo.trim()) { addToast("Please enter your table number.", "error"); return; }
    if (!cart.length)    { addToast("Your cart is empty.", "error"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("orders").insert({
      table_no:   tableNo.trim(),
      guest_name: guestName.trim() || "Guest",
      items: cart.map(({ id, name, price, qty, opts, note }) => ({ id, name, price, qty, opts, note })),
      total:  cartTotal,
      status: "Pending",
    });
    if (error) {
      addToast("Failed to send order. Please try again.", "error");
    } else {
      setCart([]);
      setGuestName("");
      addToast("Order sent! We'll get right on it. 🍹");
    }
    setSubmitting(false);
  };

  // ── Staff PIN login — bcrypt compare against DB hash ─────
  const tryPin = async () => {
    if (!pin.trim()) return;
    setPinLoading(true);
    setPinErr("");
    const { data: staffList, error } = await supabase
        .from("staff")
        .select("id, name, role, pin_hash")
        .eq("active", true);
    if (error || !staffList?.length) {
      setPinErr("Could not reach server. Try again.");
      setPinLoading(false);
      return;
    }
    let matched = null;
    for (const s of staffList) {
      if (await bcrypt.compare(pin, s.pin_hash)) { matched = s; break; }
    }
    if (matched) {
      setStaffUser(matched);
      setScene("bartender");
      setPin("");
    } else {
      setPinErr("Wrong PIN. Please try again.");
    }
    setPinLoading(false);
  };

  // ── Update order status ──────────────────────────────────
  const updateStatus = async (id, status) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) addToast("Failed to update status.", "error");
    // Realtime updates local state automatically
  };

  const liveOrders    = orders.filter((o) => o.status !== "Delivered");
  const historyOrders = orders.filter((o) => o.status === "Delivered");
  const pendingCount  = orders.filter((o) => o.status === "Pending").length;

  // ════════════════════════════════════════════════════════
  return (
      <div style={{ fontFamily: "system-ui, sans-serif", background: "#0c0c10", minHeight: "100vh", color: "#f5f0e8" }}>

        {/* Toasts */}
        <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, alignItems: "center", pointerEvents: "none", width: "90vw", maxWidth: 400 }}>
          {toasts.map((t) => (
              <div key={t.id} style={{ background: t.type === "error" ? "#450a0a" : "#052e16", border: `1px solid ${t.type === "error" ? "#dc2626" : "#16a34a"}`, color: t.type === "error" ? "#fca5a5" : "#86efac", padding: "10px 20px", borderRadius: 10, fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.6)", pointerEvents: "auto" }}>{t.msg}</div>
          ))}
        </div>

        <style>{`input,textarea{background:#1a1625!important;border:1px solid #2e2050!important;color:#f5f0e8!important;border-radius:10px!important;outline:none!important}input:focus,textarea:focus{border-color:#7c3aed!important}input::placeholder,textarea::placeholder{color:#6b6080!important}`}</style>

        {/* NAV */}
        <nav style={{ background: "#13111e", borderBottom: "1px solid #1e1a35", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#c9a84c", letterSpacing: 1.5 }}>🎹 THE PIANO BAR</div>
            <div style={{ fontSize: 10, color: "#6b5a90", letterSpacing: 3, marginTop: 1 }}>SCAN · ORDER · RELAX</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <NavBtn label="Menu" active={scene === "customer"} onClick={() => setScene("customer")} />
            <NavBtn label={staffUser ? staffUser.name.split(" ")[0] : "Staff"} active={scene === "bartender"} badge={pendingCount} onClick={() => scene === "bartender" ? setScene("customer") : setScene("pin")} />
          </div>
        </nav>

        {/* ── PIN SCREEN ── */}
        {scene === "pin" && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", padding: 24 }}>
              <div style={{ background: "#1a1625", border: "1px solid #2e2050", borderRadius: 20, padding: 40, width: "100%", maxWidth: 340, textAlign: "center" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>🔒</div>
                <h2 style={{ color: "#c9a84c", marginBottom: 6, fontWeight: 600 }}>Staff access</h2>
                <p style={{ color: "#7a6a90", fontSize: 13, marginBottom: 24 }}>PIN verified securely against Supabase</p>
                <input type="password" value={pin} onChange={(e) => { setPin(e.target.value); setPinErr(""); }} onKeyDown={(e) => e.key === "Enter" && tryPin()} placeholder="••••" style={{ width: "100%", padding: "14px 0", textAlign: "center", fontSize: 28, letterSpacing: 12, marginBottom: 8, boxSizing: "border-box" }} />
                {pinErr && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 8 }}>{pinErr}</p>}
                <p style={{ color: "#4a3a60", fontSize: 11, marginBottom: 20 }}>Each staff member has their own PIN stored in the DB</p>
                <button onClick={tryPin} disabled={pinLoading} style={{ width: "100%", padding: 14, borderRadius: 12, background: pinLoading ? "#2e2050" : "linear-gradient(135deg,#7c3aed,#5b21b6)", color: pinLoading ? "#7a6a90" : "#fff", border: "none", cursor: pinLoading ? "wait" : "pointer", fontSize: 15, fontWeight: 600 }}>
                  {pinLoading ? "Verifying with Supabase…" : "Enter dashboard →"}
                </button>
              </div>
            </div>
        )}

        {/* ── CUSTOMER VIEW ── */}
        {scene === "customer" && (
            <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px 160px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <input type="text" placeholder="Your name (optional)" value={guestName} onChange={(e) => setGuestName(e.target.value)} style={{ padding: "11px 14px", fontSize: 14 }} />
                <input type="text" placeholder="Table number *" value={tableNo} onChange={(e) => setTableNo(e.target.value)} style={{ padding: "11px 14px", fontSize: 14 }} />
              </div>
              {tableNo && (
                  <div style={{ background: "#1a1a2e", border: "1px solid #7c3aed40", borderRadius: 10, padding: "8px 14px", marginBottom: 16, fontSize: 13, color: "#a78bfa" }}>
                    📍 Ordering for <strong style={{ color: "#c9a84c" }}>Table {tableNo}</strong>
                  </div>
              )}

              {/* Category tabs */}
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 20, scrollbarWidth: "none" }}>
                {MENU.map((s) => (
                    <button key={s.category} onClick={() => setActiveCategory(s.category)} style={{ padding: "7px 14px", borderRadius: 20, border: "1px solid", whiteSpace: "nowrap", cursor: "pointer", fontSize: 13, borderColor: activeCategory === s.category ? "#c9a84c" : "#2e2050", background: activeCategory === s.category ? "#c9a84c18" : "transparent", color: activeCategory === s.category ? "#c9a84c" : "#7a6a90" }}>
                      {s.icon} {s.category}
                    </button>
                ))}
              </div>

              {/* Menu items */}
              {MENU.filter((s) => s.category === activeCategory).map((section) =>
                  section.items.map((item) => {
                    const inCart = cart.find((c) => c.id === item.id);
                    return (
                        <div key={item.id} style={{ background: "#1a1625", border: "1px solid #2e2050", borderRadius: 14, padding: "16px 18px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ flex: 1, marginRight: 12 }}>
                            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>{item.name}</div>
                            <div style={{ fontSize: 12, color: "#7a6a90", marginBottom: 6 }}>{item.description}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ color: "#c9a84c", fontWeight: 600, fontSize: 15 }}>GHS {item.price}</span>
                              {item.customizable && <span style={{ fontSize: 10, background: "#2e2050", color: "#a78bfa", padding: "2px 8px", borderRadius: 10 }}>customizable</span>}
                            </div>
                          </div>
                          {item.customizable ? (
                              <button onClick={() => { setCustomizeItem(item); setChosenOpts([]); setItemNote(""); }} style={{ padding: "8px 16px", borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Add +</button>
                          ) : inCart ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <QtyBtn onClick={() => changeQty(inCart._key, -1)}>−</QtyBtn>
                                <span style={{ color: "#c9a84c", fontWeight: 600, minWidth: 20, textAlign: "center" }}>{inCart.qty}</span>
                                <QtyBtn accent onClick={() => addToCart(item)}>+</QtyBtn>
                              </div>
                          ) : (
                              <button onClick={() => addToCart(item)} style={{ padding: "8px 16px", borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Add +</button>
                          )}
                        </div>
                    );
                  })
              )}
            </div>
        )}

        {/* ── FLOATING CART BAR ── */}
        {scene === "customer" && cartCount > 0 && (
            <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#13111e", borderTop: "1px solid #2e2050", padding: "12px 16px", zIndex: 200 }}>
              <div style={{ maxWidth: 520, margin: "0 auto" }}>
                <div style={{ marginBottom: 10, maxHeight: 110, overflowY: "auto" }}>
                  {cart.map((item) => (
                      <div key={item._key} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#a09abf", marginBottom: 4, alignItems: "center" }}>
                        <span style={{ flex: 1 }}>{item.name}{item.opts?.length ? ` (${item.opts.join(", ")})` : ""} × {item.qty}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ color: "#c9a84c" }}>GHS {item.price * item.qty}</span>
                          <QtyBtn small onClick={() => changeQty(item._key, -1)}>−</QtyBtn>
                          <QtyBtn small accent onClick={() => changeQty(item._key, 1)}>+</QtyBtn>
                        </div>
                      </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ color: "#7a6a90", fontSize: 13 }}>{cartCount} item{cartCount !== 1 ? "s" : ""} · </span>
                    <span style={{ color: "#c9a84c", fontWeight: 700, fontSize: 16 }}>GHS {cartTotal}</span>
                  </div>
                  <button onClick={submitOrder} disabled={submitting} style={{ padding: "12px 24px", borderRadius: 12, background: submitting ? "#2e2050" : "linear-gradient(135deg,#7c3aed,#5b21b6)", color: submitting ? "#7a6a90" : "#fff", border: "none", cursor: submitting ? "wait" : "pointer", fontSize: 14, fontWeight: 700 }}>
                    {submitting ? "Sending…" : "Send order →"}
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* ── CUSTOMIZE MODAL ── */}
        {customizeItem && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <div style={{ background: "#1a1625", border: "1px solid #2e2050", borderRadius: "20px 20px 0 0", padding: 24, width: "100%", maxWidth: 520 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 17 }}>{customizeItem.name}</div>
                    <div style={{ color: "#c9a84c", fontWeight: 600, marginTop: 2 }}>GHS {customizeItem.price}</div>
                  </div>
                  <button onClick={() => setCustomizeItem(null)} style={{ background: "#2e2050", border: "none", color: "#a78bfa", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 14 }}>✕</button>
                </div>
                <p style={{ color: "#7a6a90", fontSize: 13, marginBottom: 12 }}>Choose your preferences:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                  {customizeItem.options.map((opt) => {
                    const sel = chosenOpts.includes(opt);
                    return (
                        <button key={opt} onClick={() => setChosenOpts((p) => sel ? p.filter((o) => o !== opt) : [...p, opt])} style={{ padding: "7px 14px", borderRadius: 20, border: "1px solid", cursor: "pointer", fontSize: 13, borderColor: sel ? "#c9a84c" : "#2e2050", background: sel ? "#c9a84c20" : "transparent", color: sel ? "#c9a84c" : "#a09abf" }}>
                          {sel ? "✓ " : ""}{opt}
                        </button>
                    );
                  })}
                </div>
                <textarea value={itemNote} onChange={(e) => setItemNote(e.target.value)} placeholder="Any special instructions? (optional)" style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px", fontSize: 13, borderRadius: 10, resize: "none", height: 70, marginBottom: 16 }} />
                <button onClick={() => { addToCart(customizeItem, chosenOpts, itemNote); setCustomizeItem(null); addToast(`${customizeItem.name} added`); }} style={{ width: "100%", padding: 14, borderRadius: 12, background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 700 }}>Add to order</button>
              </div>
            </div>
        )}

        {/* ── BARTENDER DASHBOARD ── */}
        {scene === "bartender" && (
            <div style={{ maxWidth: 860, margin: "0 auto", padding: "20px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h2 style={{ margin: 0, color: "#c9a84c" }}>Live Dashboard</h2>
                  {staffUser && <p style={{ margin: "4px 0 0", color: "#7a6a90", fontSize: 13 }}>Logged in as <strong style={{ color: "#a78bfa" }}>{staffUser.name}</strong> · {staffUser.role}</p>}
                </div>
                <button onClick={() => { setStaffUser(null); setScene("customer"); }} style={{ padding: "7px 14px", borderRadius: 20, border: "1px solid #2e2050", background: "transparent", color: "#7a6a90", cursor: "pointer", fontSize: 13 }}>Log out</button>
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
                {[
                  { label: "Total", value: orders.length, color: "#c9a84c" },
                  { label: "Pending", value: orders.filter(o => o.status === "Pending").length, color: "#f59e0b" },
                  { label: "Preparing", value: orders.filter(o => o.status === "Preparing").length, color: "#60a5fa" },
                  { label: "Ready", value: orders.filter(o => o.status === "Ready").length, color: "#4ade80" },
                ].map((s) => (
                    <div key={s.label} style={{ background: "#1a1625", border: "1px solid #2e2050", borderRadius: 12, padding: "14px 12px", textAlign: "center" }}>
                      <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: "#6b6080", marginTop: 3 }}>{s.label}</div>
                    </div>
                ))}
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {["live", "history"].map((t) => (
                    <button key={t} onClick={() => setBartenderTab(t)} style={{ padding: "8px 18px", borderRadius: 20, border: "1px solid", cursor: "pointer", fontSize: 13, borderColor: bartenderTab === t ? "#c9a84c" : "#2e2050", background: bartenderTab === t ? "#c9a84c18" : "transparent", color: bartenderTab === t ? "#c9a84c" : "#7a6a90" }}>
                      {t === "live" ? `🔴 Live (${liveOrders.length})` : `📋 History (${historyOrders.length})`}
                    </button>
                ))}
                <button onClick={fetchOrders} style={{ marginLeft: "auto", padding: "8px 14px", borderRadius: 20, border: "1px solid #2e2050", background: "transparent", color: "#7a6a90", cursor: "pointer", fontSize: 13 }}>↻ Refresh</button>
              </div>

              {loadingOrders ? (
                  <div style={{ textAlign: "center", color: "#4a3a60", padding: 48 }}>Loading orders from Supabase…</div>
              ) : (bartenderTab === "live" ? liveOrders : historyOrders).length === 0 ? (
                  <div style={{ background: "#1a1625", border: "1px solid #2e2050", borderRadius: 16, padding: 48, textAlign: "center", color: "#4a3a60" }}>
                    {bartenderTab === "live" ? "No active orders. Waiting for customers…" : "No completed orders yet."}
                  </div>
              ) : (
                  <div style={{ display: "grid", gap: 14 }}>
                    {(bartenderTab === "live" ? liveOrders : historyOrders).map((order) => (
                        <div key={order.id} style={{ background: "#1a1625", border: "1px solid #2e2050", borderRadius: 16, padding: 20, opacity: order.status === "Delivered" ? 0.65 : 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 16 }}>{order.guest_name}</div>
                              <div style={{ color: "#7a6a90", fontSize: 13, marginTop: 2 }}>
                                Table <strong style={{ color: "#c9a84c" }}>{order.table_no}</strong> · {new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                            <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, color: STATUS_COLOR[order.status], background: STATUS_BG[order.status] }}>{order.status}</span>
                          </div>
                          <div style={{ borderTop: "1px solid #2e2050", paddingTop: 12, marginBottom: 14 }}>
                            {order.items.map((item, i) => (
                                <div key={i} style={{ marginBottom: 8 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                                    <span>{item.name} × {item.qty}</span>
                                    <span style={{ color: "#c9a84c" }}>GHS {item.price * item.qty}</span>
                                  </div>
                                  {item.opts?.length > 0 && <div style={{ fontSize: 12, color: "#a78bfa", marginTop: 2 }}>↳ {item.opts.join(", ")}</div>}
                                  {item.note && <div style={{ fontSize: 12, color: "#7a6a90", marginTop: 1 }}>📝 {item.note}</div>}
                                </div>
                            ))}
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #2e2050", paddingTop: 12 }}>
                            <span style={{ fontWeight: 700, color: "#c9a84c", fontSize: 16 }}>GHS {order.total}</span>
                            {STATUS_NEXT[order.status] && (
                                <button onClick={() => updateStatus(order.id, STATUS_NEXT[order.status])} style={{ padding: "9px 18px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: STATUS_COLOR[STATUS_NEXT[order.status]], background: STATUS_BG[STATUS_NEXT[order.status]] }}>
                                  {STATUS_LABEL[order.status]}
                                </button>
                            )}
                          </div>
                        </div>
                    ))}
                  </div>
              )}
            </div>
        )}
      </div>
  );
}

function NavBtn({ label, active, badge, onClick }) {
  return (
      <button onClick={onClick} style={{ padding: "7px 16px", borderRadius: 20, border: "1px solid", cursor: "pointer", fontSize: 13, position: "relative", borderColor: active ? "#c9a84c" : "#2e2050", background: active ? "#c9a84c18" : "transparent", color: active ? "#c9a84c" : "#7a6a90" }}>
        {label}
        {badge > 0 && <span style={{ position: "absolute", top: -6, right: -6, background: "#dc2626", color: "#fff", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{badge}</span>}
      </button>
  );
}

function QtyBtn({ children, onClick, accent, small }) {
  return (
      <button onClick={onClick} style={{ width: small ? 24 : 30, height: small ? 24 : 30, borderRadius: 7, border: "none", background: accent ? "#7c3aed" : "#2e2050", color: "#fff", cursor: "pointer", fontSize: small ? 14 : 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </button>
  );
}