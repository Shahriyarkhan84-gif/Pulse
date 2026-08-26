import Stripe from "stripe";

export const stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"));

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}
