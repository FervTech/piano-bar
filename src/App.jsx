/**
 * THE PIANO BAR — Digital Ordering System
 * npm install @supabase/supabase-js bcryptjs @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons @fortawesome/fontawesome-svg-core
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlassMartiniAlt, faBeer, faWineBottle, faChampagneGlasses, faBurger,
  faLock, faLocationDot, faCircleCheck, faRocket, faRotateRight,
  faRightFromBracket, faCircle, faClockRotateLeft, faPlus, faMinus,
  faXmark, faArrowRight, faPaperPlane, faSpinner, faSlidersH, faNoteSticky,
  faChevronDown, faChevronUp, faFilter, faCalendarDays, faTimesCircle,
  faReceipt, faChevronRight, faListUl, faHourglassHalf, faCog, faCheckDouble,
} from "@fortawesome/free-solid-svg-icons";
import logo from "./assets/logo.svg";

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

/* ─────────────────────────── MENU DATA ─────────────────────────── */
const MENU = [
  { category: "Cocktails", icon: faGlassMartiniAlt, items: [
      { id: "c1", name: "Mojito",      price: 45, description: "Rum, mint, lime, soda",       customizable: true,  options: ["Extra mint","Extra lime","Less sugar","Virgin"] },
      { id: "c2", name: "Margarita",   price: 50, description: "Tequila, triple sec, lime",   customizable: true,  options: ["Salt rim","No salt","Frozen","Virgin"] },
      { id: "c3", name: "Piña Colada", price: 48, description: "Rum, coconut, pineapple",     customizable: true,  options: ["Extra coconut","Frozen","Virgin"] },
      { id: "c4", name: "Negroni",     price: 55, description: "Gin, vermouth, Campari",      customizable: false, options: [] },
    ]},
  { category: "Beers", icon: faBeer, items: [
      { id: "b1", name: "Heineken 330ml", price: 35, description: "Premium lager",         customizable: false, options: [] },
      { id: "b2", name: "Club Beer Large",price: 25, description: "Local favourite",       customizable: false, options: [] },
      { id: "b3", name: "Guinness",       price: 38, description: "Irish dry stout",       customizable: false, options: [] },
      { id: "b4", name: "Savanna Dry",    price: 35, description: "South African cider",   customizable: false, options: [] },
    ]},
  { category: "Spirits", icon: faWineBottle, items: [
      { id: "s1", name: "Johnnie Walker Red",  price: 130, description: "Blended Scotch 20cl", customizable: true, options: ["Neat","On the rocks","With water","With soda"] },
      { id: "s2", name: "Johnnie Walker Black", price: 180, description: "12-year blend 20cl", customizable: true, options: ["Neat","On the rocks","With water","With soda"] },
      { id: "s3", name: "Hennessy VS",         price: 200, description: "Cognac 20cl",          customizable: true, options: ["Neat","On the rocks","With ginger ale"] },
    ]},
  { category: "Champagne", icon: faChampagneGlasses, items: [
      { id: "ch1", name: "House Champagne",       price: 140, description: "Brut, chilled",             customizable: false, options: [] },
      { id: "ch2", name: "Non-Alcoholic Bubbly",  price: 80,  description: "Sparkling grape, chilled",  customizable: false, options: [] },
    ]},
  { category: "Bites", icon: faBurger, items: [
      { id: "f1", name: "Chicken Wings",  price: 65, description: "6 pcs, choice of sauce",     customizable: true,  options: ["BBQ","Hot sauce","Lemon pepper","Peri-peri"] },
      { id: "f2", name: "Loaded Fries",   price: 55, description: "Cheese, bacon, jalapeño",     customizable: true,  options: ["Extra cheese","No jalapeño","Add fried egg"] },
      { id: "f3", name: "Spring Rolls",   price: 45, description: "4 pcs, sweet chili dip",      customizable: false, options: [] },
      { id: "f4", name: "Cheese Platter", price: 85, description: "3 cheeses, crackers, fruit",  customizable: false, options: [] },
    ]},
];

/* ─────────────────────────── STATUS CONFIG ──────────────────────── */
const STATUS_COLOR   = { Pending:"#b45309", Preparing:"#1d4ed8", Ready:"#15803d", Delivered:"#6b7280" };
const STATUS_BG      = { Pending:"#fef3c7", Preparing:"#dbeafe", Ready:"#dcfce7", Delivered:"#f3f4f6" };
const STATUS_DARK_BG = { Pending:"#451a03", Preparing:"#1e3a5f", Ready:"#14532d", Delivered:"#1f2937" };
const STATUS_NEXT    = { Pending:"Preparing", Preparing:"Ready", Ready:"Delivered" };
const STATUS_LABEL   = { Pending:"Start preparing", Preparing:"Mark ready", Ready:"Mark delivered" };
const STATUS_ICON    = { Pending:faHourglassHalf, Preparing:faCog, Ready:faCheckDouble };
const STATUSES       = ["Pending","Preparing","Ready","Delivered"];

/* ─────────────────────────── STAT CARD CONFIG ───────────────────── */
// Each card filters the live list; "All" has no status filter
const STAT_CARDS = [
  { label:"All",       color:"#c9a84c", status: null },
  { label:"Pending",   color:"#f59e0b", status:"Pending" },
  { label:"Preparing", color:"#60a5fa", status:"Preparing" },
  { label:"Ready",     color:"#4ade80", status:"Ready" },
];

/* ─────────────────────────── HELPERS ───────────────────────────── */
const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

function isDeliveredVisible(order) {
  // Hide Delivered orders until 1 hour has passed since they were last updated
  if (order.status !== "Delivered") return true;
  const updatedAt = new Date(order.updated_at || order.created_at);
  return Date.now() - updatedAt.getTime() < THREE_HOURS_MS;
}

/* ─────────────────────────── TOAST HOOK ────────────────────────── */
let _tid = 0;
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const add = (msg, type = "success") => {
    const id = ++_tid;
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };
  return { toasts, add };
}

/* ─────────────────────── ORDER DETAIL MODAL ────────────────────── */
function OrderDetailModal({ order, onClose, onUpdateStatus }) {
  if (!order) return null;
  const currentIdx = STATUSES.indexOf(order.status);
  return (
      <div onClick={e => e.target === e.currentTarget && onClose()}
           style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:700,
             display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
        <div style={{ background:"#1a1625", border:"1px solid #3a2a5e", borderRadius:20,
          width:"100%", maxWidth:460, maxHeight:"92vh", overflowY:"auto" }}>

          {/* Header */}
          <div style={{ padding:"18px 18px 0", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <FontAwesomeIcon icon={faReceipt} style={{ color:"#c9a84c", fontSize:15 }} />
                <span style={{ fontWeight:700, fontSize:16, color:"#f5f0e8" }}>Order #{String(order.id).slice(-5).toUpperCase()}</span>
              </div>
              <div style={{ color:"#7a6a90", fontSize:12, lineHeight:1.6 }}>
                Table <strong style={{ color:"#c9a84c" }}>{order.table_no}</strong>
                {" · "}{order.guest_name}
                <br />
                {new Date(order.created_at).toLocaleString([], { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" })}
              </div>
            </div>
            <button onClick={onClose}
                    style={{ background:"#2e2050", border:"none", color:"#a78bfa", borderRadius:8,
                      padding:"8px 11px", cursor:"pointer", fontSize:15, flexShrink:0 }}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>

          {/* Status pill */}
          <div style={{ padding:"10px 18px 0" }}>
          <span style={{ padding:"5px 14px", borderRadius:20, fontSize:13, fontWeight:700,
            color:STATUS_COLOR[order.status], background:STATUS_BG[order.status] }}>
            {order.status}
          </span>
          </div>

          {/* Progress timeline */}
          <div style={{ padding:"16px 18px 0" }}>
            <div style={{ fontSize:10, color:"#6b6080", letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Progress</div>
            <div style={{ display:"flex", alignItems:"center" }}>
              {STATUSES.map((s, i) => {
                const done   = i <= currentIdx;
                const active = i === currentIdx;
                return (
                    <div key={s} style={{ display:"flex", alignItems:"center", flex: i < STATUSES.length-1 ? 1 : "none" }}>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                        <div style={{
                          width:28, height:28, borderRadius:"50%",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          background: active ? STATUS_BG[s] : done ? STATUS_DARK_BG[s] : "#1a1020",
                          border:`2px solid ${active ? STATUS_COLOR[s] : done ? STATUS_COLOR[s]+"80" : "#2e2050"}`,
                          boxShadow: active ? `0 0 0 3px ${STATUS_COLOR[s]}30` : "none",
                        }}>
                          {done
                              ? <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize:12, color:STATUS_COLOR[s] }} />
                              : <span style={{ fontSize:10, color:"#4a3a60", fontWeight:700 }}>{i+1}</span>}
                        </div>
                        <span style={{ fontSize:8, color: done ? "#f5f0e8" : "#4a3a60", whiteSpace:"nowrap" }}>{s}</span>
                      </div>
                      {i < STATUSES.length-1 && (
                          <div style={{ flex:1, height:2, marginBottom:14, marginLeft:3, marginRight:3,
                            background: i < currentIdx ? "linear-gradient(90deg,#7c3aed,#5b21b6)" : "#2e2050" }} />
                      )}
                    </div>
                );
              })}
            </div>
          </div>

          {/* Items */}
          <div style={{ margin:"16px 18px 0", background:"#13111e", borderRadius:14, padding:14 }}>
            <div style={{ fontSize:10, color:"#6b6080", letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Items ordered</div>
            {order.items.map((item, i) => (
                <div key={i} style={{ marginBottom:10, paddingBottom:10,
                  borderBottom: i < order.items.length-1 ? "1px solid #2e2050" : "none" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:14, fontWeight:600, gap:8 }}>
                    <span style={{ minWidth:0, overflow:"hidden", textOverflow:"ellipsis" }}>{item.name} × {item.qty}</span>
                    <span style={{ color:"#c9a84c", flexShrink:0 }}>GHC {item.price * item.qty}</span>
                  </div>
                  {item.opts?.length > 0 && (
                      <div style={{ fontSize:12, color:"#a78bfa", marginTop:3, display:"flex", alignItems:"center", gap:4 }}>
                        <FontAwesomeIcon icon={faSlidersH} style={{ fontSize:9 }} /> {item.opts.join(", ")}
                      </div>
                  )}
                  {item.note && (
                      <div style={{ fontSize:12, color:"#7a6a90", marginTop:2, display:"flex", alignItems:"center", gap:4 }}>
                        <FontAwesomeIcon icon={faNoteSticky} style={{ fontSize:9 }} /> {item.note}
                      </div>
                  )}
                </div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", fontWeight:700, fontSize:16,
              paddingTop:10, borderTop:"1px solid #2e2050" }}>
              <span style={{ color:"#7a6a90" }}>Total</span>
              <span style={{ color:"#c9a84c" }}>GHC {order.total}</span>
            </div>
          </div>

          {/* Action */}
          <div style={{ padding:"14px 18px" }}>
            {STATUS_NEXT[order.status] ? (
                <button onClick={() => { onUpdateStatus(order.id, STATUS_NEXT[order.status]); onClose(); }}
                        style={{ width:"100%", padding:14, borderRadius:12, border:"none", cursor:"pointer",
                          fontSize:14, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                          color:STATUS_COLOR[STATUS_NEXT[order.status]],
                          background:STATUS_BG[STATUS_NEXT[order.status]] }}>
                  <FontAwesomeIcon icon={STATUS_ICON[order.status]} />
                  {STATUS_LABEL[order.status]}
                </button>
            ) : (
                <div style={{ textAlign:"center", color:"#4a3a60", fontSize:13, padding:"4px 0" }}>
                  <FontAwesomeIcon icon={faCircleCheck} style={{ marginRight:6, color:"#15803d" }} />
                  Order completed
                </div>
            )}
          </div>
        </div>
      </div>
  );
}

/* ─────────────────────── CUSTOMER ORDERS PAGE ───────────────────── */
function CustomerOrdersPage({ tableNo }) {
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [now, setNow] = useState(Date.now());

  // Tick every minute so Delivered cards disappear after 1 hr without a reload
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const load = useCallback(async () => {
    if (!tableNo.trim()) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
        .from("orders").select("*")
        .eq("table_no", tableNo.trim())
        .order("created_at", { ascending: false })
        .limit(30);
    if (!error && data) setMyOrders(data);
    setLoading(false);
  }, [tableNo]);

  useEffect(() => {
    load();
    if (!tableNo.trim()) return;
    const channel = supabase.channel("my-orders-live")
        .on("postgres_changes", { event:"UPDATE", schema:"public", table:"orders" }, p => {
          if (p.new.table_no === tableNo.trim())
            setMyOrders(prev => prev.map(o => o.id === p.new.id ? p.new : o));
        })
        .on("postgres_changes", { event:"INSERT", schema:"public", table:"orders" }, p => {
          if (p.new.table_no === tableNo.trim())
            setMyOrders(prev => [p.new, ...prev]);
        })
        .subscribe();
    return () => supabase.removeChannel(channel);
  }, [load, tableNo]);

  if (!tableNo.trim()) return (
      <div style={{ maxWidth:520, margin:"0 auto", padding:"60px 20px", textAlign:"center" }}>
        <FontAwesomeIcon icon={faListUl} style={{ fontSize:44, color:"#2e2050", marginBottom:16 }} />
        <p style={{ color:"#4a3a60", fontSize:15 }}>Enter your table number on the Menu tab to track your orders.</p>
      </div>
  );

  if (loading) return (
      <div style={{ textAlign:"center", padding:60, color:"#4a3a60" }}>
        <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize:28, display:"block", margin:"0 auto 12px" }} />
        Loading your orders…
      </div>
  );

  // Filter: hide Delivered until 1 hr has passed
  const visible = myOrders.filter(o => {
    if (o.status !== "Delivered") return true;
    const updated = new Date(o.updated_at || o.created_at);
    return (now - updated.getTime()) < THREE_HOURS_MS;
  });

  if (!visible.length) return (
      <div style={{ maxWidth:520, margin:"0 auto", padding:"60px 20px", textAlign:"center" }}>
        <FontAwesomeIcon icon={faReceipt} style={{ fontSize:44, color:"#2e2050", marginBottom:16 }} />
        <p style={{ color:"#4a3a60", fontSize:15 }}>No current orders for Table {tableNo}.</p>
        <p style={{ color:"#3a2a5e", fontSize:13 }}>Head to the Menu tab and place an order.</p>
      </div>
  );

  return (
      <div style={{ maxWidth:520, margin:"0 auto", padding:"16px 12px 60px" }}>
        {/* Header row */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16, flexWrap:"wrap" }}>
          <FontAwesomeIcon icon={faLocationDot} style={{ color:"#7c3aed" }} />
          <span style={{ color:"#a78bfa", fontSize:14 }}>
          Table <strong style={{ color:"#c9a84c" }}>{tableNo}</strong>
            {" · "}{visible.length} order{visible.length !== 1 ? "s" : ""}
        </span>
          <button onClick={load}
                  style={{ marginLeft:"auto", background:"transparent", border:"1px solid #2e2050",
                    color:"#7a6a90", borderRadius:20, padding:"5px 12px", cursor:"pointer",
                    fontSize:12, display:"flex", alignItems:"center", gap:5 }}>
            <FontAwesomeIcon icon={faRotateRight} /> Refresh
          </button>
        </div>

        {visible.map(order => {
          const expanded   = expandedId === order.id;
          const currentIdx = STATUSES.indexOf(order.status);
          const isReady    = order.status === "Ready";
          return (
              <div key={order.id} style={{
                background:"#1a1625",
                border:`1px solid ${isReady ? "#15803d80" : "#2e2050"}`,
                borderRadius:16, marginBottom:12, overflow:"hidden",
                boxShadow: isReady ? "0 0 0 1px #15803d30, 0 4px 20px #15803d18" : "none",
              }}>
                {/* Ready banner */}
                {isReady && (
                    <div style={{ background:"#14532d", padding:"9px 14px",
                      display:"flex", alignItems:"center", gap:8,
                      fontSize:13, fontWeight:600, color:"#4ade80" }}>
                      <FontAwesomeIcon icon={faCircleCheck} /> Your order is ready — come collect it!
                    </div>
                )}

                {/* Tap-to-expand header */}
                <div onClick={() => setExpandedId(expanded ? null : order.id)}
                     style={{ padding:"14px 14px 10px", cursor:"pointer",
                       display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:12, color:"#7a6a90", marginBottom:4 }}>
                      {new Date(order.created_at).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}
                      {" · "}{order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </div>
                    <div style={{ fontWeight:700, color:"#c9a84c", fontSize:17 }}>GHC {order.total}</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                <span style={{ padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:700,
                  color:STATUS_COLOR[order.status], background:STATUS_BG[order.status] }}>
                  {order.status}
                </span>
                    <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} style={{ color:"#4a3a60", fontSize:11 }} />
                  </div>
                </div>

                {/* Progress dots */}
                <div style={{ padding:"0 14px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center" }}>
                    {STATUSES.map((s, i) => {
                      const done   = i <= currentIdx;
                      const active = i === currentIdx;
                      return (
                          <div key={s} style={{ display:"flex", alignItems:"center", flex: i < STATUSES.length-1 ? 1 : "none" }}>
                            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                              <div style={{
                                width: active ? 24 : 18, height: active ? 24 : 18, borderRadius:"50%",
                                background: active ? STATUS_BG[s] : done ? STATUS_DARK_BG[s] : "#1a1020",
                                border:`2px solid ${active ? STATUS_COLOR[s] : done ? STATUS_COLOR[s]+"80" : "#2e2050"}`,
                                display:"flex", alignItems:"center", justifyContent:"center",
                                transition:"all 0.25s",
                                boxShadow: active ? `0 0 0 3px ${STATUS_COLOR[s]}25` : "none",
                              }}>
                                {done && <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: active ? 11 : 8, color:STATUS_COLOR[s] }} />}
                              </div>
                              <span style={{ fontSize:8, color: done ? "#a09abf" : "#3a2a5e", whiteSpace:"nowrap" }}>{s}</span>
                            </div>
                            {i < STATUSES.length-1 && (
                                <div style={{ flex:1, height:2, marginBottom:14, marginLeft:3, marginRight:3,
                                  background: i < currentIdx
                                      ? `linear-gradient(90deg,${STATUS_COLOR[STATUSES[i]]},${STATUS_COLOR[STATUSES[i+1]]})`
                                      : "#2e2050",
                                  transition:"background 0.3s" }} />
                            )}
                          </div>
                      );
                    })}
                  </div>
                </div>

                {/* Expanded items */}
                {expanded && (
                    <div style={{ borderTop:"1px solid #2e2050", padding:"12px 14px" }}>
                      {order.items.map((item, i) => (
                          <div key={i} style={{ marginBottom:10 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", fontSize:14, fontWeight:600, gap:8 }}>
                              <span style={{ minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name} × {item.qty}</span>
                              <span style={{ color:"#c9a84c", flexShrink:0 }}>GHC {item.price * item.qty}</span>
                            </div>
                            {item.opts?.length > 0 && (
                                <div style={{ fontSize:12, color:"#a78bfa", marginTop:2, display:"flex", alignItems:"center", gap:4 }}>
                                  <FontAwesomeIcon icon={faSlidersH} style={{ fontSize:9 }} /> {item.opts.join(", ")}
                                </div>
                            )}
                            {item.note && (
                                <div style={{ fontSize:12, color:"#7a6a90", marginTop:1, display:"flex", alignItems:"center", gap:4 }}>
                                  <FontAwesomeIcon icon={faNoteSticky} style={{ fontSize:9 }} /> {item.note}
                                </div>
                            )}
                          </div>
                      ))}
                    </div>
                )}
              </div>
          );
        })}
      </div>
  );
}

/* ═══════════════════════════ MAIN APP ══════════════════════════════ */
export default function App() {
  const [scene, setScene]     = useState("customer");
  const [cart, setCart]       = useState([]);
  const [orders, setOrders]   = useState([]);
  const [tableNo, setTableNo] = useState(() => {
    try { return new URLSearchParams(window.location.search).get("table") || ""; }
    catch { return ""; }
  });
  const [guestName, setGuestName]   = useState("");
  const [activeCategory, setActiveCategory] = useState(MENU[0].category);
  const [customizeItem, setCustomizeItem]   = useState(null);
  const [chosenOpts, setChosenOpts] = useState([]);
  const [itemNote, setItemNote]     = useState("");
  const [pin, setPin]         = useState("");
  const [pinErr, setPinErr]   = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const [staffUser, setStaffUser]   = useState(null);
  const [bartenderTab, setBartenderTab]     = useState("live");
  const [statusFilter, setStatusFilter]     = useState(null); // null = show all
  const [submitting, setSubmitting]         = useState(false);
  const [loadingOrders, setLoadingOrders]   = useState(false);
  const [selectedOrder, setSelectedOrder]   = useState(null);
  const [historyDateFrom, setHistoryDateFrom] = useState("");
  const [historyDateTo,   setHistoryDateTo]   = useState("");
  const [showFilters, setShowFilters]         = useState(false);
  const { toasts, add: addToast } = useToasts();

  /* ── fetch & realtime ── */
  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending:false });
    if (!error && data) setOrders(data);
    setLoadingOrders(false);
  }, []);

  useEffect(() => {
    if (scene !== "bartender") return;
    let cancelled = false;
    (async () => {
      setLoadingOrders(true);
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending:false });
      if (!cancelled && !error && data) setOrders(data);
      if (!cancelled) setLoadingOrders(false);
    })();
    const ch = supabase.channel("orders-live")
        .on("postgres_changes", { event:"INSERT", schema:"public", table:"orders" },
            p => setOrders(prev => [p.new, ...prev]))
        .on("postgres_changes", { event:"UPDATE", schema:"public", table:"orders" },
            p => {
              setOrders(prev => prev.map(o => o.id === p.new.id ? p.new : o));
              setSelectedOrder(sel => sel?.id === p.new.id ? p.new : sel);
            })
        .on("postgres_changes", { event:"DELETE", schema:"public", table:"orders" },
            p => setOrders(prev => prev.filter(o => o.id !== p.old.id)))
        .subscribe(s => console.log("Realtime:", s));
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [scene]);

  /* ── cart ── */
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const addToCart = (item, opts = [], note = "") => {
    setCart(prev => {
      const key = item.id + opts.join(",");
      const ex  = prev.find(c => c._key === key);
      if (ex) return prev.map(c => c._key === key ? { ...c, qty: c.qty+1 } : c);
      return [...prev, { ...item, qty:1, opts, note, _key:key }];
    });
  };

  const changeQty = (key, delta) =>
      setCart(prev =>
          prev.map(c => c._key === key ? { ...c, qty: c.qty+delta } : c).filter(c => c.qty > 0)
      );

  /* ── submit order ── */
  const submitOrder = async () => {
    if (!tableNo.trim()) { addToast("Please enter your table number.", "error"); return; }
    if (!cart.length)    { addToast("Your cart is empty.", "error"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("orders").insert({
      table_no:   tableNo.trim(),
      guest_name: guestName.trim() || "Guest",
      items: cart.map(({ id, name, price, qty, opts, note }) => ({ id, name, price, qty, opts, note })),
      total: cartTotal, status:"Pending",
    });
    if (error) { addToast("Failed to send order. Try again.", "error"); }
    else { setCart([]); setGuestName(""); addToast("Order sent! We'll get right on it."); setScene("orders"); }
    setSubmitting(false);
  };

  /* ── PIN login ── */
  const tryPin = async () => {
    if (!pin.trim()) return;
    setPinLoading(true); setPinErr("");
    const { data: staffList, error } = await supabase
        .from("staff").select("id, name, role, pin_hash").eq("active", true);
    if (error || !staffList?.length) { setPinErr("Could not reach server."); setPinLoading(false); return; }
    let matched = null;
    for (const s of staffList) { if (await bcrypt.compare(pin, s.pin_hash)) { matched = s; break; } }
    if (matched) { setStaffUser(matched); setScene("bartender"); setPin(""); }
    else setPinErr("Wrong PIN. Please try again.");
    setPinLoading(false);
  };

  /* ── update status ── */
  const updateStatus = async (id, status) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) addToast("Failed to update status.", "error");
  };

  /* ── derived lists ── */
  const liveOrders = orders.filter(o => o.status !== "Delivered");

  // Live orders further filtered by the clicked stat card
  const filteredLive = statusFilter
      ? liveOrders.filter(o => o.status === statusFilter)
      : liveOrders;

  const historyOrders = orders.filter(o => {
    if (o.status !== "Delivered") return false;
    const d = new Date(o.created_at);
    if (historyDateFrom) { const f = new Date(historyDateFrom); f.setHours(0,0,0,0); if (d < f) return false; }
    if (historyDateTo)   { const t = new Date(historyDateTo);   t.setHours(23,59,59,999); if (d > t) return false; }
    return true;
  });
  const historyTotal = historyOrders.reduce((s, o) => s + Number(o.total), 0);
  const pendingCount = orders.filter(o => o.status === "Pending").length;
  const hasDateFilter = historyDateFrom || historyDateTo;

  const displayList = bartenderTab === "live" ? filteredLive : historyOrders;

  /* ════════════════════════════ RENDER ══════════════════════════════ */
  return (
      <div style={{ fontFamily:"system-ui,-apple-system,sans-serif", background:"#0c0c10", minHeight:"100vh", color:"#f5f0e8" }}>
        <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin:0; padding:0; overscroll-behavior:none; -webkit-tap-highlight-color:transparent; }
        input, textarea {
          background:#1a1625 !important; border:1px solid #2e2050 !important;
          color:#f5f0e8 !important; border-radius:10px !important; outline:none !important;
          font-size:16px !important; font-family:inherit !important;
          -webkit-appearance:none; appearance:none;
        }
        input:focus, textarea:focus { border-color:#7c3aed !important; }
        input::placeholder, textarea::placeholder { color:#6b6080 !important; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter:invert(0.5); cursor:pointer; }
        ::-webkit-scrollbar { display:none; }
        button { -webkit-tap-highlight-color:transparent; touch-action:manipulation; font-family:inherit; }
        .ocard { transition:border-color 0.15s, transform 0.1s; cursor:pointer; }
        .ocard:active { transform:scale(0.985); }
        .stat-card { transition:border-color 0.15s, transform 0.1s, box-shadow 0.15s; cursor:pointer; }
        .stat-card:active { transform:scale(0.96); }
      `}</style>

        {/* ── Toasts ── */}
        <div style={{ position:"fixed", top:16, left:"50%", transform:"translateX(-50%)",
          zIndex:9999, display:"flex", flexDirection:"column", gap:8,
          alignItems:"center", pointerEvents:"none",
          width:"calc(100vw - 32px)", maxWidth:400 }}>
          {toasts.map(t => (
              <div key={t.id} style={{
                background: t.type === "error" ? "#450a0a" : "#052e16",
                border:`1px solid ${t.type === "error" ? "#dc2626" : "#16a34a"}`,
                color: t.type === "error" ? "#fca5a5" : "#86efac",
                padding:"12px 20px", borderRadius:12, fontSize:14,
                boxShadow:"0 4px 24px rgba(0,0,0,0.7)", pointerEvents:"auto",
                textAlign:"center", width:"100%",
              }}>{t.msg}</div>
          ))}
        </div>

        {/* ── Bartender detail modal ── */}
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdateStatus={updateStatus} />

        {/* ════════ NAV ════════ */}
        <nav style={{
          background:"#13111e", borderBottom:"1px solid #1e1a35",
          padding:"10px 14px", display:"flex", alignItems:"center",
          justifyContent:"space-between", position:"sticky", top:0, zIndex:200,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0, flex:1 }}>
            <img src={logo} alt="Logo"
                 style={{ height:38, width:38, objectFit:"contain", borderRadius:8, flexShrink:0 }} />
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#c9a84c", letterSpacing:1,
                whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                THE PIANO BAR
              </div>
              <div style={{ fontSize:9, color:"#6b5a90", letterSpacing:2, marginTop:1 }}>SCAN · ORDER · RELAX</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:5, flexShrink:0, marginLeft:8 }}>
            <NavBtn label="Menu"   active={scene==="customer"}  onClick={() => setScene("customer")} />
            <NavBtn label="Orders" active={scene==="orders"}    onClick={() => setScene("orders")} />
            <NavBtn
                label={staffUser ? staffUser.name.split(" ")[0] : "Staff"}
                active={scene==="bartender"}
                badge={pendingCount}
                onClick={() => scene==="bartender" ? setScene("customer") : setScene("pin")}
            />
          </div>
        </nav>

        {/* ════════ PIN ════════ */}
        {scene === "pin" && (
            <div style={{ display:"flex", justifyContent:"center", alignItems:"center",
              minHeight:"calc(100vh - 62px)", padding:20 }}>
              <div style={{ background:"#1a1625", border:"1px solid #2e2050", borderRadius:20,
                padding:"36px 24px", width:"100%", maxWidth:340, textAlign:"center" }}>
                <FontAwesomeIcon icon={faLock} style={{ fontSize:36, color:"#c9a84c", marginBottom:14 }} />
                <h2 style={{ color:"#c9a84c", marginBottom:6, fontWeight:600, fontSize:20, margin:"0 0 6px" }}>Staff access</h2>
                <p style={{ color:"#7a6a90", fontSize:13, marginBottom:22 }}>Enter your PIN to continue</p>
                <input type="password" value={pin} inputMode="numeric"
                       onChange={e => { setPin(e.target.value); setPinErr(""); }}
                       onKeyDown={e => e.key==="Enter" && tryPin()}
                       placeholder="••••"
                       style={{ width:"100%", padding:"14px 0", textAlign:"center", letterSpacing:12, marginBottom:8 }} />
                {pinErr && <p style={{ color:"#f87171", fontSize:13, marginBottom:8 }}>{pinErr}</p>}
                <p style={{ color:"#4a3a60", fontSize:11, marginBottom:18 }}>Each staff member has their own PIN</p>
                <button onClick={tryPin} disabled={pinLoading}
                        style={{ width:"100%", padding:14, borderRadius:12,
                          background: pinLoading ? "#2e2050" : "linear-gradient(135deg,#7c3aed,#5b21b6)",
                          color: pinLoading ? "#7a6a90" : "#fff", border:"none",
                          cursor: pinLoading ? "wait" : "pointer",
                          fontSize:15, fontWeight:600,
                          display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  {pinLoading
                      ? <><FontAwesomeIcon icon={faSpinner} spin /> Verifying…</>
                      : <><FontAwesomeIcon icon={faArrowRight} /> Enter dashboard</>}
                </button>
              </div>
            </div>
        )}

        {/* ════════ CUSTOMER MENU ════════ */}
        {scene === "customer" && (
            <div style={{ maxWidth:580, margin:"0 auto", padding:"16px 12px 200px" }}>

              {/* Name + table */}
              {/* Responsive input row — stacked on mobile, side-by-side on tablet/desktop */}
              <style>{`
            .input-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px; }
            @media (max-width: 520px) { .input-row { grid-template-columns:1fr; } }
          `}</style>
              <div className="input-row">
                <input type="text" placeholder="Your name (optional)" value={guestName}
                       onChange={e => setGuestName(e.target.value)} style={{ padding:"12px", width:"100%" }} />
                <input type="text" placeholder="Table number *" value={tableNo}
                       inputMode="numeric" onChange={e => setTableNo(e.target.value)} style={{ padding:"12px", width:"100%" }} />
              </div>

              {tableNo && (
                  <div style={{ background:"#1a1a2e", border:"1px solid #7c3aed40", borderRadius:10,
                    padding:"9px 14px", marginBottom:14, fontSize:13, color:"#a78bfa",
                    display:"flex", alignItems:"center", gap:8 }}>
                    <FontAwesomeIcon icon={faLocationDot} style={{ color:"#7c3aed", flexShrink:0 }} />
                    Ordering for <strong style={{ color:"#c9a84c" }}>Table {tableNo}</strong>
                  </div>
              )}

              {/* Category tabs */}
              <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:6,
                marginBottom:16, WebkitOverflowScrolling:"touch" }}>
                {MENU.map(s => (
                    <button key={s.category} onClick={() => setActiveCategory(s.category)}
                            style={{ padding:"8px 14px", borderRadius:20, border:"1px solid", whiteSpace:"nowrap",
                              cursor:"pointer", fontSize:13, display:"flex", alignItems:"center", gap:6, flexShrink:0,
                              borderColor: activeCategory===s.category ? "#c9a84c" : "#2e2050",
                              background:  activeCategory===s.category ? "#c9a84c18" : "transparent",
                              color:       activeCategory===s.category ? "#c9a84c" : "#7a6a90" }}>
                      <FontAwesomeIcon icon={s.icon} /><span>{s.category}</span>
                    </button>
                ))}
              </div>

              {/* Menu items */}
              {MENU.filter(s => s.category === activeCategory).map(section =>
                  section.items.map(item => {
                    const inCart = cart.find(c => c.id === item.id);
                    return (
                        <div key={item.id}
                             style={{ background:"#1a1625", border:"1px solid #2e2050", borderRadius:14,
                               padding:"14px", marginBottom:10, display:"flex", alignItems:"center", gap:12 }}>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontWeight:600, fontSize:15, marginBottom:2,
                              whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize:12, color:"#7a6a90", marginBottom:6,
                              whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                              {item.description}
                            </div>
                            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                              <span style={{ color:"#c9a84c", fontWeight:600, fontSize:15 }}>GHC {item.price}</span>
                              {item.customizable && (
                                  <span style={{ fontSize:10, background:"#2e2050", color:"#a78bfa",
                                    padding:"2px 8px", borderRadius:10,
                                    display:"inline-flex", alignItems:"center", gap:4 }}>
                          <FontAwesomeIcon icon={faSlidersH} style={{ fontSize:9 }} /> custom
                        </span>
                              )}
                            </div>
                          </div>
                          <div style={{ flexShrink:0 }}>
                            {item.customizable ? (
                                <button onClick={() => { setCustomizeItem(item); setChosenOpts([]); setItemNote(""); }}
                                        style={{ padding:"9px 14px", borderRadius:10,
                                          background:"linear-gradient(135deg,#7c3aed,#5b21b6)",
                                          color:"#fff", border:"none", cursor:"pointer",
                                          fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:5 }}>
                                  <FontAwesomeIcon icon={faPlus} /> Add
                                </button>
                            ) : inCart ? (
                                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                  <QtyBtn onClick={() => changeQty(inCart._key, -1)}><FontAwesomeIcon icon={faMinus} /></QtyBtn>
                                  <span style={{ color:"#c9a84c", fontWeight:700, minWidth:22, textAlign:"center", fontSize:15 }}>{inCart.qty}</span>
                                  <QtyBtn accent onClick={() => addToCart(item)}><FontAwesomeIcon icon={faPlus} /></QtyBtn>
                                </div>
                            ) : (
                                <button onClick={() => addToCart(item)}
                                        style={{ padding:"9px 14px", borderRadius:10,
                                          background:"linear-gradient(135deg,#7c3aed,#5b21b6)",
                                          color:"#fff", border:"none", cursor:"pointer",
                                          fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:5 }}>
                                  <FontAwesomeIcon icon={faPlus} /> Add
                                </button>
                            )}
                          </div>
                        </div>
                    );
                  })
              )}

              {/* View orders CTA */}
              {tableNo && (
                  <button onClick={() => setScene("orders")}
                          style={{ width:"100%", marginTop:8, padding:"13px", borderRadius:14,
                            background:"transparent", border:"1px solid #2e2050", color:"#7a6a90",
                            cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                    <FontAwesomeIcon icon={faListUl} /> View my orders
                    <FontAwesomeIcon icon={faChevronRight} style={{ fontSize:11 }} />
                  </button>
              )}
            </div>
        )}

        {/* ════════ FLOATING CART BAR ════════ */}
        {scene === "customer" && cartCount > 0 && (
            <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"#13111e",
              borderTop:"1px solid #2e2050", padding:"10px 14px", zIndex:150,
              paddingBottom:"max(10px, env(safe-area-inset-bottom))" }}>
              <div style={{ maxWidth:580, margin:"0 auto" }}>
                <div style={{ marginBottom:8, maxHeight:90, overflowY:"auto" }}>
                  {cart.map(item => (
                      <div key={item._key}
                           style={{ display:"flex", justifyContent:"space-between", fontSize:13,
                             color:"#a09abf", marginBottom:4, alignItems:"center", gap:8 }}>
                  <span style={{ flex:1, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {item.name}{item.opts?.length ? ` (${item.opts.join(", ")})` : ""} × {item.qty}
                  </span>
                        <div style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
                          <span style={{ color:"#c9a84c", fontSize:13 }}>GHC {item.price * item.qty}</span>
                          <QtyBtn small onClick={() => changeQty(item._key, -1)}><FontAwesomeIcon icon={faMinus} /></QtyBtn>
                          <QtyBtn small accent onClick={() => changeQty(item._key, 1)}><FontAwesomeIcon icon={faPlus} /></QtyBtn>
                        </div>
                      </div>
                  ))}
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
                  <div>
                    <span style={{ color:"#7a6a90", fontSize:12 }}>{cartCount} item{cartCount!==1?"s":""} · </span>
                    <span style={{ color:"#c9a84c", fontWeight:700, fontSize:16 }}>GHC {cartTotal}</span>
                  </div>
                  <button onClick={submitOrder} disabled={submitting}
                          style={{ padding:"12px 20px", borderRadius:12,
                            background: submitting ? "#2e2050" : "linear-gradient(135deg,#7c3aed,#5b21b6)",
                            color: submitting ? "#7a6a90" : "#fff", border:"none",
                            cursor: submitting ? "wait" : "pointer",
                            fontSize:14, fontWeight:700,
                            display:"flex", alignItems:"center", gap:7, flexShrink:0, whiteSpace:"nowrap" }}>
                    {submitting
                        ? <><FontAwesomeIcon icon={faSpinner} spin /> Sending…</>
                        : <><FontAwesomeIcon icon={faPaperPlane} /> Send order</>}
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* ════════ CUSTOMIZE MODAL ════════ */}
        {customizeItem && (
            <div onClick={e => e.target===e.currentTarget && setCustomizeItem(null)}
                 style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", zIndex:500,
                   display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
              <div style={{ background:"#1a1625", border:"1px solid #2e2050",
                borderRadius:"20px 20px 0 0", padding:"20px 16px",
                width:"100%", maxWidth:580, maxHeight:"88vh", overflowY:"auto",
                paddingBottom:"max(20px, env(safe-area-inset-bottom))" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:17 }}>{customizeItem.name}</div>
                    <div style={{ color:"#c9a84c", fontWeight:600, marginTop:2, fontSize:15 }}>GHC {customizeItem.price}</div>
                  </div>
                  <button onClick={() => setCustomizeItem(null)}
                          style={{ background:"#2e2050", border:"none", color:"#a78bfa",
                            borderRadius:8, padding:"8px 12px", cursor:"pointer", fontSize:16 }}>
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
                <p style={{ color:"#7a6a90", fontSize:13, marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>
                  <FontAwesomeIcon icon={faSlidersH} /> Choose your preferences
                </p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 }}>
                  {customizeItem.options.map(opt => {
                    const sel = chosenOpts.includes(opt);
                    return (
                        <button key={opt}
                                onClick={() => setChosenOpts(p => sel ? p.filter(o => o!==opt) : [...p, opt])}
                                style={{ padding:"9px 14px", borderRadius:20, border:"1px solid", cursor:"pointer",
                                  fontSize:13, display:"inline-flex", alignItems:"center", gap:6,
                                  borderColor: sel ? "#c9a84c" : "#2e2050",
                                  background:  sel ? "#c9a84c20" : "transparent",
                                  color:       sel ? "#c9a84c" : "#a09abf" }}>
                          {sel && <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize:11 }} />}{opt}
                        </button>
                    );
                  })}
                </div>
                <div style={{ position:"relative", marginBottom:14 }}>
                  <FontAwesomeIcon icon={faNoteSticky}
                                   style={{ position:"absolute", top:13, left:12, color:"#4a3a60", fontSize:13, pointerEvents:"none" }} />
                  <textarea value={itemNote} onChange={e => setItemNote(e.target.value)}
                            placeholder="Special instructions? (optional)"
                            style={{ width:"100%", padding:"11px 12px 11px 32px", borderRadius:10, resize:"none", height:70 }} />
                </div>
                <button onClick={() => { addToCart(customizeItem, chosenOpts, itemNote); setCustomizeItem(null); addToast(`${customizeItem.name} added`); }}
                        style={{ width:"100%", padding:14, borderRadius:12,
                          background:"linear-gradient(135deg,#7c3aed,#5b21b6)",
                          color:"#fff", border:"none", cursor:"pointer",
                          fontSize:15, fontWeight:700,
                          display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <FontAwesomeIcon icon={faPlus} /> Add to order
                </button>
              </div>
            </div>
        )}

        {/* ════════ CUSTOMER ORDERS ════════ */}
        {scene === "orders" && <CustomerOrdersPage tableNo={tableNo} />}

        {/* ════════ BARTENDER DASHBOARD ════════ */}
        {scene === "bartender" && (
            <div style={{ maxWidth:860, margin:"0 auto", padding:"16px 12px 48px" }}>

              {/* Dashboard header */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                marginBottom:16, flexWrap:"wrap", gap:10 }}>
                <div>
                  <h2 style={{ margin:0, color:"#c9a84c", fontSize:20 }}>Live Dashboard</h2>
                  {staffUser && (
                      <p style={{ margin:"3px 0 0", color:"#7a6a90", fontSize:12 }}>
                        Logged in as <strong style={{ color:"#a78bfa" }}>{staffUser.name}</strong> · {staffUser.role}
                      </p>
                  )}
                </div>
                <button onClick={() => { setStaffUser(null); setScene("customer"); }}
                        style={{ padding:"8px 14px", borderRadius:20, border:"1px solid #2e2050",
                          background:"transparent", color:"#7a6a90", cursor:"pointer",
                          fontSize:13, display:"flex", alignItems:"center", gap:6 }}>
                  <FontAwesomeIcon icon={faRightFromBracket} /> Log out
                </button>
              </div>

              {/* ── Stat cards — clicking filters the live list ── */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:16 }}>
                {STAT_CARDS.map(sc => {
                  const count = sc.status
                      ? orders.filter(o => o.status === sc.status).length
                      : liveOrders.length;
                  const isActive = bartenderTab === "live" && statusFilter === sc.status;
                  return (
                      <div key={sc.label}
                           className="stat-card"
                           onClick={() => {
                             setBartenderTab("live");
                             setStatusFilter(prev => (prev === sc.status && sc.status !== null) ? null : sc.status);
                           }}
                           style={{
                             background: isActive ? "#1e1030" : "#1a1625",
                             border:`1px solid ${isActive ? sc.color : "#2e2050"}`,
                             borderRadius:12, padding:"12px 6px", textAlign:"center",
                             boxShadow: isActive ? `0 0 0 2px ${sc.color}30` : "none",
                           }}>
                        <div style={{ fontSize:22, fontWeight:700, color:sc.color }}>{count}</div>
                        <div style={{ fontSize:10, color:"#6b6080", marginTop:2 }}>{sc.label}</div>
                        {isActive && (
                            <div style={{ fontSize:9, color:sc.color, marginTop:3, letterSpacing:0.5 }}>▲ filtered</div>
                        )}
                      </div>
                  );
                })}
              </div>

              {/* ── Tabs ── */}
              <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
                {[
                  { key:"live",    label:"Live",    icon:faCircle,        count:liveOrders.length },
                  { key:"history", label:"History", icon:faClockRotateLeft, count:historyOrders.length },
                ].map(t => (
                    <button key={t.key}
                            onClick={() => { setBartenderTab(t.key); if (t.key === "history") setStatusFilter(null); }}
                            style={{ padding:"8px 16px", borderRadius:20, border:"1px solid", cursor:"pointer",
                              fontSize:13, display:"flex", alignItems:"center", gap:6,
                              borderColor: bartenderTab===t.key ? "#c9a84c" : "#2e2050",
                              background:  bartenderTab===t.key ? "#c9a84c18" : "transparent",
                              color:       bartenderTab===t.key ? "#c9a84c" : "#7a6a90" }}>
                      <FontAwesomeIcon icon={t.icon}
                                       style={{ fontSize: t.key==="live" ? 8 : 12,
                                         color: t.key==="live" ? "#ef4444" : undefined }} />
                      {t.label} ({t.count})
                    </button>
                ))}

                {/* Active filter chip */}
                {bartenderTab === "live" && statusFilter && (
                    <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px",
                      borderRadius:20, background:STATUS_BG[statusFilter],
                      color:STATUS_COLOR[statusFilter], fontSize:12, fontWeight:600 }}>
                      Showing: {statusFilter}
                      <button onClick={() => setStatusFilter(null)}
                              style={{ background:"transparent", border:"none", cursor:"pointer",
                                color:STATUS_COLOR[statusFilter], fontSize:13, padding:0, lineHeight:1 }}>
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    </div>
                )}

                <button onClick={() => void fetchOrders()}
                        style={{ marginLeft:"auto", padding:"8px 14px", borderRadius:20,
                          border:"1px solid #2e2050", background:"transparent",
                          color:"#7a6a90", cursor:"pointer", fontSize:13,
                          display:"flex", alignItems:"center", gap:6 }}>
                  <FontAwesomeIcon icon={faRotateRight} /> Refresh
                </button>
              </div>

              {/* ── History date filter ── */}
              {bartenderTab === "history" && (
                  <div style={{ marginBottom:16 }}>
                    <button onClick={() => setShowFilters(!showFilters)}
                            style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 16px",
                              borderRadius:12, cursor:"pointer", fontSize:13,
                              border:`1px solid ${hasDateFilter ? "#c9a84c" : "#2e2050"}`,
                              background: hasDateFilter ? "#c9a84c18" : "transparent",
                              color: hasDateFilter ? "#c9a84c" : "#7a6a90",
                              fontWeight: hasDateFilter ? 600 : 400 }}>
                      <FontAwesomeIcon icon={faFilter} />
                      Filter by date
                      {hasDateFilter && (
                          <span style={{ background:"#c9a84c", color:"#1a0f2e",
                            borderRadius:10, padding:"1px 8px", fontSize:11, fontWeight:700 }}>ON</span>
                      )}
                      <FontAwesomeIcon icon={showFilters ? faChevronUp : faChevronDown} style={{ fontSize:11 }} />
                    </button>

                    {showFilters && (
                        <div style={{ marginTop:10, background:"#1a1625", border:"1px solid #2e2050",
                          borderRadius:14, padding:"16px 14px" }}>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
                            {[
                              { label:"From", value:historyDateFrom, setter:setHistoryDateFrom },
                              { label:"To",   value:historyDateTo,   setter:setHistoryDateTo },
                            ].map(f => (
                                <div key={f.label}>
                                  <div style={{ fontSize:10, color:"#6b6080", letterSpacing:1,
                                    textTransform:"uppercase", marginBottom:6,
                                    display:"flex", alignItems:"center", gap:5 }}>
                                    <FontAwesomeIcon icon={faCalendarDays} /> {f.label}
                                  </div>
                                  <input type="date" value={f.value}
                                         onChange={e => f.setter(e.target.value)}
                                         style={{ width:"100%", padding:"10px 12px" }} />
                                </div>
                            ))}
                          </div>
                          {hasDateFilter && (
                              <button onClick={() => { setHistoryDateFrom(""); setHistoryDateTo(""); }}
                                      style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px",
                                        borderRadius:10, border:"1px solid #3a2a5e",
                                        background:"transparent", color:"#f87171", cursor:"pointer", fontSize:13 }}>
                                <FontAwesomeIcon icon={faTimesCircle} /> Clear filter
                              </button>
                          )}
                        </div>
                    )}

                    {historyOrders.length > 0 && (
                        <div style={{ marginTop:10, display:"flex", gap:10, flexWrap:"wrap" }}>
                          <Chip label="Orders" value={historyOrders.length} />
                          <Chip label="Revenue" value={`GHC ${historyTotal.toFixed(2)}`} gold />
                        </div>
                    )}
                  </div>
              )}

              {/* ── Order cards ── */}
              {loadingOrders ? (
                  <div style={{ textAlign:"center", color:"#4a3a60", padding:48 }}>
                    <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize:28, display:"block", margin:"0 auto 12px" }} />
                    Loading orders…
                  </div>
              ) : displayList.length === 0 ? (
                  <div style={{ background:"#1a1625", border:"1px solid #2e2050", borderRadius:16,
                    padding:40, textAlign:"center", color:"#4a3a60" }}>
                    {bartenderTab === "live"
                        ? statusFilter
                            ? `No ${statusFilter.toLowerCase()} orders right now.`
                            : "No active orders. Waiting for customers…"
                        : hasDateFilter
                            ? "No orders match this date range."
                            : "No completed orders yet."}
                  </div>
              ) : (
                  <div style={{ display:"grid", gap:10 }}>
                    {displayList.map(order => (
                        <div key={order.id}
                             className="ocard"
                             onClick={() => setSelectedOrder(order)}
                             style={{ background:"#1a1625", border:"1px solid #2e2050",
                               borderRadius:16, padding:14,
                               opacity: order.status==="Delivered" ? 0.72 : 1 }}>

                          {/* Card header */}
                          <div style={{ display:"flex", justifyContent:"space-between",
                            alignItems:"flex-start", marginBottom:10, gap:8 }}>
                            <div style={{ minWidth:0 }}>
                              <div style={{ fontWeight:700, fontSize:15,
                                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                {order.guest_name}
                              </div>
                              <div style={{ color:"#7a6a90", fontSize:12, marginTop:2 }}>
                                Table <strong style={{ color:"#c9a84c" }}>{order.table_no}</strong>
                                {" · "}{new Date(order.created_at).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}
                                {bartenderTab === "history" && (
                                    <span style={{ color:"#4a3a60" }}>
                            {" · "}{new Date(order.created_at).toLocaleDateString([], { day:"numeric", month:"short" })}
                          </span>
                                )}
                              </div>
                            </div>
                            <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                      <span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600,
                        color:STATUS_COLOR[order.status], background:STATUS_BG[order.status] }}>
                        {order.status}
                      </span>
                              <FontAwesomeIcon icon={faChevronRight} style={{ color:"#3a2a5e", fontSize:11 }} />
                            </div>
                          </div>

                          {/* Items preview */}
                          <div style={{ borderTop:"1px solid #2e2050", paddingTop:8, marginBottom:10 }}>
                            {order.items.slice(0, 2).map((item, i) => (
                                <div key={i} style={{ display:"flex", justifyContent:"space-between",
                                  fontSize:13, gap:8, marginBottom:3 }}>
                        <span style={{ color:"#a09abf", overflow:"hidden",
                          textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {item.name} × {item.qty}
                        </span>
                                  <span style={{ color:"#c9a84c", flexShrink:0 }}>GHC {item.price * item.qty}</span>
                                </div>
                            ))}
                            {order.items.length > 2 && (
                                <div style={{ fontSize:11, color:"#4a3a60", marginTop:2 }}>
                                  +{order.items.length-2} more — tap to view all
                                </div>
                            )}
                          </div>

                          {/* Footer */}
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                            borderTop:"1px solid #2e2050", paddingTop:10, gap:8, flexWrap:"wrap" }}>
                            <span style={{ fontWeight:700, color:"#c9a84c", fontSize:15 }}>GHC {order.total}</span>
                            {STATUS_NEXT[order.status] && (
                                <button onClick={e => { e.stopPropagation(); updateStatus(order.id, STATUS_NEXT[order.status]); }}
                                        style={{ padding:"7px 14px", borderRadius:10, border:"none", cursor:"pointer",
                                          fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:5,
                                          color:STATUS_COLOR[STATUS_NEXT[order.status]],
                                          background:STATUS_BG[STATUS_NEXT[order.status]] }}>
                                  <FontAwesomeIcon icon={STATUS_ICON[order.status]} />
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
        {/* ── Footer copyright ── */}
        <footer style={{
          textAlign:"center", padding:"20px 16px",
          borderTop:"1px solid #1e1a35",
          marginTop:8,
        }}>
          <p style={{ margin:0, fontSize:11, color:"#3a2a5e", letterSpacing:1 }}>
            &copy; {new Date().getFullYear()} <span style={{ color:"#5a4a7e", fontWeight:600 }}>FervTech</span>. All rights reserved.
          </p>
        </footer>
      </div>
  );
}

/* ─────────────────────────── SHARED COMPONENTS ─────────────────── */
function NavBtn({ label, active, badge, onClick }) {
  return (
      <button onClick={onClick}
              style={{ padding:"7px 13px", borderRadius:20, border:"1px solid", cursor:"pointer",
                fontSize:12, position:"relative", flexShrink:0,
                borderColor: active ? "#c9a84c" : "#2e2050",
                background:  active ? "#c9a84c18" : "transparent",
                color:       active ? "#c9a84c" : "#7a6a90" }}>
        {label}
        {badge > 0 && (
            <span style={{ position:"absolute", top:-6, right:-6,
              background:"#dc2626", color:"#fff", borderRadius:"50%",
              width:17, height:17, display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:9, fontWeight:700 }}>
          {badge}
        </span>
        )}
      </button>
  );
}

function QtyBtn({ children, onClick, accent, small }) {
  return (
      <button onClick={onClick}
              style={{ width: small ? 26 : 32, height: small ? 26 : 32, borderRadius:8, border:"none",
                background: accent ? "#7c3aed" : "#2e2050", color:"#fff", cursor:"pointer",
                fontSize: small ? 10 : 12, display:"flex", alignItems:"center",
                justifyContent:"center", flexShrink:0 }}>
        {children}
      </button>
  );
}

function Chip({ label, value, gold }) {
  return (
      <div style={{ background:"#1a1625", border:"1px solid #2e2050",
        borderRadius:10, padding:"8px 14px", fontSize:13 }}>
        <span style={{ color:"#6b6080" }}>{label}: </span>
        <strong style={{ color: gold ? "#c9a84c" : "#f5f0e8" }}>{value}</strong>
      </div>
  );
}