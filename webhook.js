import Stripe from "stripe";

/* ─────────────────────────────────────────────────────────────
   Riceve la notifica da Stripe quando un pagamento va a buon fine
   e manda l'ordine al chiosco via WhatsApp (Twilio).

   Sicurezza: non ci fidiamo del contenuto ricevuto. Prendiamo
   solo l'ID dell'evento e ri-scarichiamo l'evento ufficiale da
   Stripe con la nostra chiave segreta. Così i dati su cui
   agiamo sono autentici, senza dover gestire la firma del webhook.
   ───────────────────────────────────────────────────────────── */

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: "Stripe non configurato" });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const eventId = req.body && req.body.id;
  if (!eventId) return res.status(400).json({ error: "Evento non valido" });

  let event;
  try {
    event = await stripe.events.retrieve(eventId); // ufficiale, da Stripe
  } catch (e) {
    console.error("Evento non recuperabile:", e.message);
    return res.status(400).json({ error: "Evento non valido" });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    if (s.payment_status === "paid") {
      const m = s.metadata || {};
      const totale = ((s.amount_total || 0) / 100).toFixed(2).replace(".", ",");
      const msg =
        "🌊 NUOVO ORDINE — Playa Colorada\n\n" +
        `Cliente: ${m.nome || "-"}\n` +
        `Ombrellone: ${m.ombrellone || "-"}\n` +
        `Orario: ${m.ora || "-"}\n\n` +
        `${m.ordine || ""}` +
        (m.note ? `\n\nNote: ${m.note}` : "") +
        `\n\nTotale pagato: € ${totale}`;
      try {
        await sendWhatsApp(msg);
      } catch (e) {
        console.error("WhatsApp non inviato:", e.message);
        // Rispondiamo comunque 200: il pagamento è andato a buon fine.
      }
    }
  }

  return res.status(200).json({ received: true });
}

async function sendWhatsApp(body) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM; // es. whatsapp:+14155238886
  const to = process.env.KIOSK_WHATSAPP_TO;      // es. whatsapp:+393331234567
  if (!sid || !token || !from || !to) {
    console.warn("Twilio non configurato: salto l'invio WhatsApp.");
    return;
  }
  const params = new URLSearchParams({ From: from, To: to, Body: body });
  const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  if (!r.ok) throw new Error(`Twilio ${r.status}: ${await r.text()}`);
}
