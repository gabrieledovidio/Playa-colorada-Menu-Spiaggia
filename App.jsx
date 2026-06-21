import React, { useState, useMemo, useEffect } from "react";
import {
  ShoppingBag, Plus, Minus, X, Check, Umbrella, Clock,
  User, ArrowLeft, Waves, Lock, Trash2,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────
   PLAYA COLORADA — ordinazioni in riva al mare
   I prezzi mostrati qui sono SOLO per la vista cliente.
   Il calcolo reale del pagamento avviene sul server, in
   api/create-checkout-session.js, che usa lo stesso listino.
   Se cambi un prezzo, cambialo in TUTTI E DUE i file.
   ──────────────────────────────────────────────────────────── */

const euro = (n) => "€ " + n.toFixed(2).replace(".", ",");

const MENU = {
  panini: {
    label: "Panini",
    blurb: "Tutti su pane fresco, pronti da portare all’ombrellone.",
    groups: [
      { items: [
        { id: "p1", name: "Prosciutto cotto", price: 6 },
        { id: "p2", name: "Prosciutto cotto e mozzarella", price: 8 },
        { id: "p3", name: "Prosciutto crudo e mozzarella", price: 10 },
        { id: "p4", name: "Salame", price: 6 },
        { id: "p5", name: "Pomodoro e mozzarella", price: 8 },
        { id: "p6", name: "Tonno e pomodoro", price: 8 },
        { id: "p7", name: "Cotoletta e patatine fritte", price: 12 },
        { id: "p8", name: "Wurstel e patatine fritte", price: 10 },
        { id: "p9", name: "Aggiunta pomodoro e insalata", price: 1, note: "Da aggiungere a un panino" },
      ] },
    ],
  },
  piatto: {
    label: "Al piatto",
    blurb: "Primi, fritti e fresco di stagione.",
    groups: [
      { items: [
        { id: "a1", name: "Trofie al pesto", price: 8 },
        { id: "a2", name: "Pennette al pomodoro", price: 6 },
        { id: "a3", name: "Calamari fritti", price: 15 },
        { id: "a4", name: "Cotoletta e patatine", price: 12 },
        { id: "a5", name: "Hamburger e patatine", price: 12 },
        { id: "a6", name: "Insalata verde", price: 5 },
        { id: "a7", name: "Verdure grigliate", price: 6 },
        { id: "a8", name: "Insalata di pomodori", price: 6 },
        { id: "a9", name: "Patate al forno / fritte", price: 6 },
        { id: "a10", name: "Caprese", price: 10, note: "Pomodori, mozzarella, basilico, olive" },
        { id: "a11", name: "Prosciutto crudo e mozzarella", price: 10 },
        { id: "a12", name: "Melone e prosciutto", price: 8 },
        { id: "a13", name: "Tielle di verdure", options: [{ label: "Piccola", price: 6 }, { label: "Grande", price: 10 }] },
        { id: "a14", name: "Tielle di pesce", options: [{ label: "Piccola", price: 6.5 }, { label: "Grande", price: 12 }] },
      ] },
    ],
  },
  bevande: {
    label: "Bevande",
    blurb: "Calici, birre ghiacciate e dissetanti.",
    groups: [
      { label: "Vini", items: [
        { id: "v1", name: "Falanghina", price: 9, note: "Bottiglia" },
        { id: "v2", name: "Greco di Tufo", price: 9, note: "Bottiglia" },
      ] },
      { label: "Birre", items: [
        { id: "b1", name: "Corona", price: 4.5, note: "33 cl" },
        { id: "b2", name: "Ichnusa", price: 4, note: "33 cl" },
        { id: "b3", name: "Menabrea", price: 4, note: "33 cl" },
        { id: "b4", name: "Tennent’s", price: 4, note: "33 cl" },
        { id: "b5", name: "Peroni", price: 3, note: "33 cl" },
        { id: "b6", name: "Nastro Azzurro", price: 3.5, note: "33 cl" },
        { id: "b7", name: "Nastro Azzurro", price: 4.5, note: "66 cl" },
        { id: "b8", name: "Peroni", price: 4, note: "66 cl" },
        { id: "b9", name: "Heineken", price: 4.5, note: "66 cl" },
      ] },
      { label: "Analcolici", items: [
        { id: "n1", name: "Bibite in lattina", price: 3.5 },
        { id: "n2", name: "Estathé", price: 3.5 },
        { id: "n3", name: "Acqua liscia / frizzante", price: 2, note: "1 lt" },
        { id: "n4", name: "Acqua", price: 1, note: "0,5 lt" },
      ] },
    ],
  },
};

const TABS = [
  { key: "panini", label: "Panini" },
  { key: "piatto", label: "Al piatto" },
  { key: "bevande", label: "Bevande" },
];

function Ombrellone({ size = 150 }) {
  const cx = 100, cy = 100, r = 82;
  const cols = ["#E8593B", "#F4B53C", "#0F8F8F", "#E8593B", "#F4B53C", "#0F8F8F"];
  const angs = [0, 30, 60, 90, 120, 150, 180];
  const pt = (a) => [cx + r * Math.cos((a * Math.PI) / 180), cy - r * Math.sin((a * Math.PI) / 180)];
  const panels = [];
  for (let i = 0; i < 6; i++) {
    const [x1, y1] = pt(angs[i]);
    const [x2, y2] = pt(angs[i + 1]);
    panels.push(<polygon key={i} points={`${cx},${cy} ${x1},${y1} ${x2},${y2}`} fill={cols[i]} />);
  }
  return (
    <svg viewBox="0 0 200 190" width={size} height={(size * 190) / 200} aria-hidden="true" className="pc-omb">
      <g className="pc-omb-canopy">
        {panels}
        <path d={`M ${cx - r},${cy} A ${r} ${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke="#15302F" strokeWidth="3" />
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#15302F" strokeWidth="3" />
        <circle cx={cx} cy={cy - r} r="5" fill="#15302F" />
      </g>
      <line x1={cx} y1={cy} x2={cx} y2={178} stroke="#15302F" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function StripeRibbon() {
  const cols = ["#E8593B", "#F4B53C", "#0F8F8F", "#FFFDF7"];
  return (
    <div className="pc-ribbon" aria-hidden="true">
      {Array.from({ length: 40 }).map((_, i) => (
        <span key={i} style={{ background: cols[i % 4] }} />
      ))}
    </div>
  );
}

export default function App() {
  // Vista iniziale in base al ritorno da Stripe
  const params = new URLSearchParams(window.location.search);
  const initial = params.get("paid") ? "done" : params.get("canceled") ? "canceled" : "menu";

  const [tab, setTab] = useState("panini");
  const [cart, setCart] = useState({});
  const [sheet, setSheet] = useState(false);
  const [view, setView] = useState(initial);

  const items = useMemo(() => Object.entries(cart).map(([key, v]) => ({ key, ...v })), [cart]);
  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const total = useMemo(() => items.reduce((s, i) => s + i.qty * i.price, 0), [items]);

  // Ripulisci l'URL dai parametri di Stripe dopo aver letto la vista
  useEffect(() => {
    if (initial !== "menu") window.history.replaceState({}, "", window.location.pathname);
  }, []); // eslint-disable-line

  const add = (item, opt) => {
    const key = opt ? `${item.id}-${opt.label}` : item.id;
    const name = opt ? `${item.name} · ${opt.label}` : item.name;
    const price = opt ? opt.price : item.price;
    setCart((c) => ({ ...c, [key]: { name, price, qty: (c[key]?.qty || 0) + 1 } }));
  };
  const inc = (key) => setCart((c) => ({ ...c, [key]: { ...c[key], qty: c[key].qty + 1 } }));
  const dec = (key) => setCart((c) => {
    const q = (c[key]?.qty || 0) - 1; const n = { ...c };
    if (q <= 0) delete n[key]; else n[key] = { ...n[key], qty: q };
    return n;
  });
  const removeAll = (key) => setCart((c) => { const n = { ...c }; delete n[key]; return n; });
  const qtyOf = (key) => cart[key]?.qty || 0;

  const goMenu = () => { setView("menu"); window.scrollTo(0, 0); };

  if (view === "checkout")
    return (
      <Shell>
        <Checkout items={items} total={total} onBack={() => setView("menu")} />
      </Shell>
    );

  if (view === "done") return <Shell><Done /></Shell>;
  if (view === "canceled") return <Shell><Canceled onBack={goMenu} /></Shell>;

  return (
    <Shell count={count} total={total} onOpenCart={() => setSheet(true)} showCart>
      <main className="pc-main">
        <section className="pc-layout">
          <div className="pc-menu-col">
            <div className="pc-hero">
              <Ombrellone size={170} />
              <div className="pc-hero-text">
                <p className="pc-eyebrow">Lido · chiosco</p>
                <h1>Ordina il tuo menù</h1>
                <p className="pc-script">in riva al mare</p>
                <p className="pc-hero-sub">Scegli, paga dal telefono e te lo portiamo direttamente sotto l’ombrellone.</p>
              </div>
            </div>

            <nav className="pc-tabs" aria-label="Categorie">
              {TABS.map((t) => (
                <button key={t.key} className={"pc-tab" + (tab === t.key ? " is-active" : "")} onClick={() => setTab(t.key)}>
                  {t.label}
                </button>
              ))}
            </nav>

            <div className="pc-cat">
              <div className="pc-cat-head">
                <h2>{MENU[tab].label}</h2>
                <p>{MENU[tab].blurb}</p>
              </div>

              {MENU[tab].groups.map((g, gi) => (
                <div key={gi} className="pc-group">
                  {g.label && <h3 className="pc-group-label">{g.label}</h3>}
                  <ul className="pc-list">
                    {g.items.map((it) => (
                      <li key={it.id} className="pc-item">
                        <div className="pc-item-info">
                          <span className="pc-item-name">{it.name}</span>
                          {it.note && <span className="pc-item-note">{it.note}</span>}
                        </div>
                        <div className="pc-item-actions">
                          {it.options ? (
                            it.options.map((o) => {
                              const k = `${it.id}-${o.label}`;
                              const q = qtyOf(k);
                              return (
                                <button key={o.label} className={"pc-opt" + (q ? " has" : "")} onClick={() => add(it, o)}>
                                  <span className="pc-opt-l">{o.label}</span>
                                  <span className="pc-opt-p">{euro(o.price)}</span>
                                  {q > 0 ? <span className="pc-opt-q">{q}</span> : <Plus size={15} strokeWidth={2.6} />}
                                </button>
                              );
                            })
                          ) : (
                            <>
                              <span className="pc-price">{euro(it.price)}</span>
                              {qtyOf(it.id) > 0 ? (
                                <div className="pc-step">
                                  <button onClick={() => dec(it.id)} aria-label="Togli uno"><Minus size={15} strokeWidth={3} /></button>
                                  <span>{qtyOf(it.id)}</span>
                                  <button onClick={() => add(it)} aria-label="Aggiungi uno"><Plus size={15} strokeWidth={3} /></button>
                                </div>
                              ) : (
                                <button className="pc-add" onClick={() => add(it)} aria-label={"Aggiungi " + it.name}>
                                  <Plus size={17} strokeWidth={2.8} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p className="pc-foot-note">
              I prezzi sono in euro, servizio al tavolo/ombrellone incluso. Per allergeni e intolleranze chiedi al personale.
            </p>
          </div>

          <aside className="pc-cart-desk">
            <div className="pc-cart-card">
              <CartContents items={items} total={total} inc={inc} dec={dec} removeAll={removeAll}
                onCheckout={() => setView("checkout")} empty="Il tuo ordine è ancora vuoto. Aggiungi qualcosa dal menù." />
            </div>
          </aside>
        </section>

        {count > 0 && (
          <button className="pc-fab" onClick={() => setSheet(true)}>
            <span className="pc-fab-c">{count}</span>
            <span className="pc-fab-t">Vedi l’ordine</span>
            <span className="pc-fab-p">{euro(total)}</span>
          </button>
        )}

        {sheet && (
          <div className="pc-overlay" onClick={() => setSheet(false)}>
            <div className="pc-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="pc-sheet-grab" />
              <div className="pc-sheet-head">
                <h3>Il tuo ordine</h3>
                <button onClick={() => setSheet(false)} aria-label="Chiudi"><X size={20} /></button>
              </div>
              <CartContents items={items} total={total} inc={inc} dec={dec} removeAll={removeAll}
                onCheckout={() => { setSheet(false); setView("checkout"); }} empty="Ancora niente nel cestino." />
            </div>
          </div>
        )}
      </main>
    </Shell>
  );
}

function Shell({ children, count = 0, total = 0, onOpenCart, showCart }) {
  return (
    <div className="pc-root">
      <header className="pc-header">
        <div className="pc-header-in">
          <div className="pc-brand">
            <span className="pc-brand-mark"><Waves size={18} strokeWidth={2.4} /></span>
            <span className="pc-brand-name">Playa <em>Colorada</em></span>
          </div>
          {showCart && (
            <button className="pc-cart-btn" onClick={onOpenCart}>
              <ShoppingBag size={18} strokeWidth={2.2} />
              <span>{count > 0 ? euro(total) : "Ordine"}</span>
              {count > 0 && <span className="pc-badge">{count}</span>}
            </button>
          )}
        </div>
        <StripeRibbon />
      </header>
      {children}
    </div>
  );
}

function CartContents({ items, total, inc, dec, removeAll, onCheckout, empty }) {
  if (items.length === 0)
    return (
      <div className="pc-cart-empty">
        <Umbrella size={28} strokeWidth={1.7} />
        <p>{empty}</p>
      </div>
    );
  return (
    <>
      <ul className="pc-cart-list">
        {items.map((i) => (
          <li key={i.key}>
            <div className="pc-cart-l">
              <span className="pc-cart-name">{i.name}</span>
              <span className="pc-cart-unit">{euro(i.price)} cad.</span>
            </div>
            <div className="pc-step sm">
              <button onClick={() => (i.qty === 1 ? removeAll(i.key) : dec(i.key))} aria-label="Togli uno">
                {i.qty === 1 ? <Trash2 size={14} strokeWidth={2.4} /> : <Minus size={14} strokeWidth={3} />}
              </button>
              <span>{i.qty}</span>
              <button onClick={() => inc(i.key)} aria-label="Aggiungi uno"><Plus size={14} strokeWidth={3} /></button>
            </div>
            <span className="pc-cart-line">{euro(i.qty * i.price)}</span>
          </li>
        ))}
      </ul>
      <div className="pc-cart-total"><span>Totale</span><strong>{euro(total)}</strong></div>
      <button className="pc-pay-btn" onClick={onCheckout}>Vai al pagamento</button>
    </>
  );
}

const TIMES = ["Il prima possibile", "12:30", "13:00", "13:30", "14:00", "Tra 30 minuti", "Tra 1 ora"];

function Checkout({ items, total, onBack }) {
  const [nome, setNome] = useState("");
  const [omb, setOmb] = useState("");
  const [ora, setOra] = useState(TIMES[0]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");

  const ok = nome.trim() && omb.trim();

  const submit = async () => {
    setTouched(true);
    setError("");
    if (!ok) return;
    if (items.length === 0) { setError("Il carrello è vuoto."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ key: i.key, qty: i.qty })),
          customer: { nome, omb, ora, note },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Impossibile avviare il pagamento.");
      window.location.href = data.url; // → pagina sicura di Stripe
    } catch (e) {
      setError(e.message || "Errore di connessione. Riprova.");
      setBusy(false);
    }
  };

  return (
    <main className="pc-checkout">
      <button className="pc-back" onClick={onBack}><ArrowLeft size={18} /> Torna al menù</button>
      <div className="pc-checkout-grid">
        <div className="pc-form">
          <h2 className="pc-h2">Dove te lo portiamo?</h2>

          <label className="pc-field">
            <span><User size={15} /> Nome</span>
            <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Es. Marco" />
            {touched && !nome.trim() && <em className="pc-err">Inserisci il nome.</em>}
          </label>

          <label className="pc-field">
            <span><Umbrella size={15} /> Numero ombrellone</span>
            <input value={omb} onChange={(e) => setOmb(e.target.value)} placeholder="Es. 42" inputMode="numeric" />
            {touched && !omb.trim() && <em className="pc-err">Serve per consegnarti l’ordine.</em>}
          </label>

          <div className="pc-field">
            <span><Clock size={15} /> A che ora?</span>
            <div className="pc-chips">
              {TIMES.map((t) => (
                <button key={t} className={"pc-chip" + (ora === t ? " on" : "")} onClick={() => setOra(t)}>{t}</button>
              ))}
            </div>
          </div>

          <label className="pc-field">
            <span>Note (facoltative)</span>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Es. panino senza cipolla" />
          </label>

          <p className="pc-secure-note"><Lock size={14} /> Pagamento sicuro con carta, gestito da Stripe. I dati della carta non passano da questo sito.</p>
          {error && <div className="pc-error-box">{error}</div>}
        </div>

        <aside className="pc-summary">
          <div className="pc-summary-card">
            <h3>Riepilogo</h3>
            <ul>
              {items.map((i) => (
                <li key={i.key}><span>{i.qty}× {i.name}</span><span>{euro(i.qty * i.price)}</span></li>
              ))}
            </ul>
            <div className="pc-cart-total"><span>Totale</span><strong>{euro(total)}</strong></div>
            <button className="pc-pay-btn big" onClick={submit} disabled={busy}>
              {busy ? <span className="pc-spin" /> : <Lock size={16} strokeWidth={2.4} />}
              {busy ? "Avvio pagamento…" : `Paga ${euro(total)}`}
            </button>
            <p className="pc-secure"><Lock size={12} /> Pagamenti protetti · Stripe</p>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Done() {
  return (
    <main className="pc-done">
      <div className="pc-done-card">
        <div className="pc-done-check"><Check size={34} strokeWidth={3} /></div>
        <p className="pc-eyebrow center">Pagamento riuscito</p>
        <h1 className="pc-script big">Grazie!</h1>
        <p className="pc-done-sub">Il tuo ordine è confermato ed è stato inviato al chiosco. <strong>Te lo portiamo all’ombrellone.</strong></p>
        <button className="pc-pay-btn" onClick={() => (window.location.href = "/")}>Torna al menù</button>
      </div>
    </main>
  );
}

function Canceled({ onBack }) {
  return (
    <main className="pc-done">
      <div className="pc-done-card">
        <div className="pc-done-check warn"><X size={32} strokeWidth={3} /></div>
        <p className="pc-eyebrow center">Pagamento annullato</p>
        <h1 className="pc-script big">Nessun addebito</h1>
        <p className="pc-done-sub">Non è stato addebitato nulla. Puoi tornare al menù e riprovare quando vuoi.</p>
        <button className="pc-pay-btn" onClick={onBack}>Torna al menù</button>
      </div>
    </main>
  );
}
