import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { stripe } from "../services/billing/stripeClient";

export const billingRouter = Router();

const successUrl = process.env.CHECKOUT_SUCCESS_URL ?? "pulse://checkout/success";
const cancelUrl = process.env.CHECKOUT_CANCEL_URL ?? "pulse://checkout/cancel";

billingRouter.post("/subscribe", requireAuth, async (req, res) => {
  const { streamerId } = req.body as { streamerId: string };
  const subscriberId = req.user!.id;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_SUBSCRIPTION_PRICE_ID, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { subscriberId, streamerId },
    subscription_data: { metadata: { subscriberId, streamerId } },
  });

  res.json({ checkoutUrl: session.url });
});

billingRouter.post("/tip", requireAuth, async (req, res) => {
  const { streamerId, amountCents } = req.body as { streamerId: string; amountCents: number };
  const tipperId = req.user!.id;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: "Tip" },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { tipperId, streamerId, amountCents: String(amountCents) },
    payment_intent_data: { metadata: { tipperId, streamerId } },
  });

  res.json({ checkoutUrl: session.url });
});
