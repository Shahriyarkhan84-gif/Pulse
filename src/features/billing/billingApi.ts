import * as WebBrowser from "expo-web-browser";
import { endpoints } from "@/services/api/endpoints";

// Stripe Checkout is a hosted page — the safest way to collect card details
// without pulling PCI scope into this app. Open it in an in-app browser and
// let Stripe redirect back to the app's success/cancel URLs when done.
export async function subscribeToStreamer(streamerId: string) {
  const {
    data: { checkoutUrl },
  } = await endpoints.billing.subscribe(streamerId);
  await WebBrowser.openBrowserAsync(checkoutUrl);
}

export async function tipStreamer(streamerId: string, amountCents: number) {
  const {
    data: { checkoutUrl },
  } = await endpoints.billing.tip(streamerId, amountCents);
  await WebBrowser.openBrowserAsync(checkoutUrl);
}
