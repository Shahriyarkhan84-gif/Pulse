import type { Request, Response } from "express";
import Stripe from "stripe";
import { stripe } from "../services/billing/stripeClient";
import { supabaseAdmin } from "../services/supabase/adminClient";

const webhookSecret = requireEnv("STRIPE_WEBHOOK_SECRET");

export async function billingWebhookHandler(req: Request, res: Response) {
  const signature = req.headers["stripe-signature"];
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature!, webhookSecret);
  } catch (err) {
    res.status(400).send(`Webhook signature verification failed`);
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.mode === "subscription") {
      const { subscriberId, streamerId } = session.metadata as { subscriberId: string; streamerId: string };
      await supabaseAdmin.from("subscriptions").insert({
        subscriber_id: subscriberId,
        streamer_id: streamerId,
        stripe_subscription_id: session.subscription as string,
        status: "active",
      });
    }

    if (session.mode === "payment") {
      const { tipperId, streamerId, amountCents } = session.metadata as {
        tipperId: string;
        streamerId: string;
        amountCents: string;
      };
      await supabaseAdmin.from("tips").insert({
        tipper_id: tipperId,
        streamer_id: streamerId,
        amount_cents: Number(amountCents),
        stripe_payment_intent_id: session.payment_intent as string,
      });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    await supabaseAdmin
      .from("subscriptions")
      .update({ status: "canceled" })
      .eq("stripe_subscription_id", subscription.id);
  }

  res.json({ received: true });
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}
