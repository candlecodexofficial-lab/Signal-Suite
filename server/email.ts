import sgMail from "@sendgrid/mail";
import type { Order, OrderItem, User, Indicator } from "@shared/schema";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || "no-reply@tradevault.app";
const FROM_NAME = process.env.EMAIL_FROM_NAME || "TradeVault";

let configured = false;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  configured = true;
} else {
  console.warn(
    "[email] SENDGRID_API_KEY is not set. Order status emails will be skipped."
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildItemsList(items: Array<OrderItem & { indicator?: Indicator }>): {
  html: string;
  text: string;
} {
  if (!items.length) {
    return { html: "<li>(no items)</li>", text: "(no items)" };
  }
  const lines = items.map((item) => {
    const name = item.indicator?.name || `Indicator #${item.indicatorId}`;
    const duration = item.duration
      ? `${item.duration} ${item.duration === 1 ? "month" : "months"}`
      : "";
    const trial = item.isTrial ? " (trial)" : "";
    return { name, duration, trial };
  });
  const html = lines
    .map(
      (l) =>
        `<li>${escapeHtml(l.name)} — ${escapeHtml(l.duration)}${escapeHtml(l.trial)}</li>`
    )
    .join("");
  const text = lines.map((l) => `- ${l.name} — ${l.duration}${l.trial}`).join("\n");
  return { html: `<ul>${html}</ul>`, text };
}

interface SendStatusEmailArgs {
  buyer: User;
  order: Order;
  items: Array<OrderItem & { indicator?: Indicator }>;
}

export async function sendOrderApprovedEmail(
  args: SendStatusEmailArgs
): Promise<void> {
  if (!configured) return;
  const { buyer, order, items } = args;
  const buyerName =
    [buyer.firstName, buyer.lastName].filter(Boolean).join(" ") || "there";
  const tvUsername = buyer.tradingViewUsername;
  const list = buildItemsList(items);

  const nextStepsHtml = tvUsername
    ? `<p>We've granted access to your TradingView account <strong>${escapeHtml(
        tvUsername
      )}</strong>. To use your indicators:</p>
       <ol>
         <li>Open TradingView and sign in with the username above.</li>
         <li>Open any chart and click the <em>Indicators</em> button.</li>
         <li>Go to the <em>Invite-only scripts</em> tab — your new indicators will be listed there.</li>
         <li>Click an indicator to add it to your chart.</li>
       </ol>
       <p>If you don't see the indicators within a few minutes, please refresh TradingView or sign out and back in.</p>`
    : `<p>We've approved your order. To finish granting access, please add your TradingView username to your TradeVault profile so we can invite you to the indicators.</p>`;

  const nextStepsText = tvUsername
    ? `We've granted access to your TradingView account ${tvUsername}. To use your indicators:
1. Open TradingView and sign in with the username above.
2. Open any chart and click the Indicators button.
3. Go to the "Invite-only scripts" tab — your new indicators will be listed there.
4. Click an indicator to add it to your chart.

If you don't see the indicators within a few minutes, please refresh TradingView or sign out and back in.`
    : `We've approved your order. To finish granting access, please add your TradingView username to your TradeVault profile so we can invite you to the indicators.`;

  const subject = `Your TradeVault order #${order.id} is approved`;
  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;line-height:1.5;color:#111;">
    <h2>Your access is live, ${escapeHtml(buyerName)}!</h2>
    <p>Order <strong>#${order.id}</strong> has been approved.</p>
    <h3>Items</h3>
    ${list.html}
    <h3>Next steps</h3>
    ${nextStepsHtml}
    <p>Happy trading,<br/>The TradeVault team</p>
  </body></html>`;
  const text = `Your access is live, ${buyerName}!

Order #${order.id} has been approved.

Items:
${list.text}

Next steps:
${nextStepsText}

Happy trading,
The TradeVault team`;

  try {
    await sgMail.send({
      to: buyer.email,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject,
      text,
      html,
    });
  } catch (err: any) {
    console.error(
      "[email] Failed to send approval email:",
      err?.response?.body || err?.message || err
    );
  }
}

export async function sendOrderRejectedEmail(
  args: SendStatusEmailArgs
): Promise<void> {
  if (!configured) return;
  const { buyer, order, items } = args;
  const buyerName =
    [buyer.firstName, buyer.lastName].filter(Boolean).join(" ") || "there";
  const list = buildItemsList(items);

  const subject = `Update on your TradeVault order #${order.id}`;
  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;line-height:1.5;color:#111;">
    <h2>Hi ${escapeHtml(buyerName)},</h2>
    <p>Thank you for your interest in TradeVault. Unfortunately, we weren't able to approve your order <strong>#${order.id}</strong> at this time.</p>
    <h3>Items in this order</h3>
    ${list.html}
    <p>If you believe this was a mistake or you'd like more information, please reply to this email and our team will be happy to help. If a payment was charged, it will be refunded according to our standard policy.</p>
    <p>We appreciate your understanding.</p>
    <p>— The TradeVault team</p>
  </body></html>`;
  const text = `Hi ${buyerName},

Thank you for your interest in TradeVault. Unfortunately, we weren't able to approve your order #${order.id} at this time.

Items in this order:
${list.text}

If you believe this was a mistake or you'd like more information, please reply to this email and our team will be happy to help. If a payment was charged, it will be refunded according to our standard policy.

We appreciate your understanding.

— The TradeVault team`;

  try {
    await sgMail.send({
      to: buyer.email,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject,
      text,
      html,
    });
  } catch (err: any) {
    console.error(
      "[email] Failed to send rejection email:",
      err?.response?.body || err?.message || err
    );
  }
}
