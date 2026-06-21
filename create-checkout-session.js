import Stripe from "stripe";

/* ─────────────────────────────────────────────────────────────
   LISTINO UFFICIALE (lato server) — è QUESTO che decide quanto
   paga il cliente. Le chiavi devono combaciare con quelle del
   carrello in src/App.jsx (id, oppure id-Taglia per le tielle).
   Se cambi un prezzo, cambialo anche in src/App.jsx.
   ───────────────────────────────────────────────────────────── */
const CATALOG = {
  // Panini
  p1: { name: "Prosciutto cotto", price: 6 },
  p2: { name: "Prosciutto cotto e mozzarella", price: 8 },
  p3: { name: "Prosciutto crudo e mozzarella (panino)", price: 10 },
  p4: { name: "Salame", price: 6 },
  p5: { name: "Pomodoro e mozzarella", price: 8 },
  p6: { name: "Tonno e pomodoro", price: 8 },
  p7: { name: "Cotoletta e patatine fritte (panino)", price: 12 },
  p8: { name: "Wurstel e patatine fritte", price: 10 },
  p9: { name: "Aggiunta pomodoro e insalata", price: 1 },
  // Al piatto
  a1: { name: "Trofie al pesto", price: 8 },
  a2: { name: "Pennette al pomodoro", price: 6 },
  a3: { name: "Calamari fritti", price: 15 },
  a4: { name: "Cotoletta e patatine", price: 12 },
  a5: { name: "Hamburger e patatine", price: 12 },
  a6: { name: "Insalata verde", price: 5 },
  a7: { name: "Verdure grigliate", price: 6 },
  a8: { name: "Insalata di pomodori", price: 6 },
  a9: { name: "Patate al forno / fritte", price: 6 },
  a10: { name: "Caprese", price: 10 },
  a11: { name: "Prosciutto crudo e mozzarella", price: 10 },
  a12: { name: "Melone e prosciutto", price: 8 },
  "a13-Piccola": { name: "Tielle di verdure · Piccola", price: 6 },
  "a13-Grande": { name: "Tielle di verdure · Grande", price: 10 },
  "a14-Piccola": { name: "Tielle di pesce · Piccola", price: 6.5 },
  "a14-Grande": { name: "Tielle di pesce · Grande", price: 12 },
  // Vini
  v1: { name: "Falanghina (bottiglia)", price: 9 },
  v2: { name: "Greco di Tufo (bottiglia)", price: 9 },
  // Birre
  b1: { name: "Corona 33 cl", price: 4.5 },
  b2: { name: "Ichnusa 33 cl", price: 4 },
  b3: { name: "Menabrea 33 cl", price: 4 },
  b4: { name: "Tennent’s 33 cl", price: 4 },
  b5: { name: "Peroni 33 cl", price: 3 },
  b6: { name: "Nastro Azzurro 33 cl", price: 3.5 },
  b7: { name: "Nastro Azzurro 66 cl", price: 4.5 },
  b8: { name: "Peroni 66 cl", price: 4 },
  b9: { name: "Heineken 66 cl", price: 4.5 },
  // Analcolici
  n1: { name: "Bibite in lattina", price: 3.5 },
  n2: { name: "Estathé", price: 3.5 },
  n3: { name: "Acqua liscia / frizzante 1 lt", price: 2 },
  n4: { name: "Acqua 0,5 lt", price: 1 },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Metodo non consentito" });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "Pagamenti non configurati (manca STRIPE_SECRET_KEY)." });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { items = [], customer = {} } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Il carrello è vuoto." });
    }

    const line_items = [];
    const summary = [];
    for (const it of items) {
      const entry = CATALOG[it.key];
      if (!entry) continue;
      const qty = Math.max(1, Math.min(50, parseInt(it.qty, 10) || 0));
      line_items.push({
        quantity: qty,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(entry.price * 100),
          product_data: { name: entry.name },
        },
      });
      summary.push(`${qty}x ${entry.name}`);
    }
    if (line_items.length === 0) {
      return res.status(400).json({ error: "Nessun articolo valido nel carrello." });
    }

    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const origin = process.env.SITE_URL || `${proto}://${host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      locale: "it",
      success_url: `${origin}/?paid=1`,
      cancel_url: `${origin}/?canceled=1`,
      metadata: {
        nome: String(customer.nome || "").slice(0, 100),
        ombrellone: String(customer.omb || "").slice(0, 40),
        ora: String(customer.ora || "").slice(0, 40),
        note: String(customer.note || "").slice(0, 200),
        ordine: summary.join(", ").slice(0, 480),
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("create-checkout-session:", err);
    return res.status(500).json({ error: "Errore nel server di pagamento." });
  }
}
