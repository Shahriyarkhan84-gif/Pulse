import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { streamsRouter } from "./routes/streams.routes";
import { uploadsRouter } from "./routes/uploads.routes";
import { billingRouter } from "./routes/billing.routes";
import { billingWebhookHandler } from "./routes/billingWebhook";
import { registerChatGateway } from "./sockets/chatGateway";

const app = express();
app.use(cors());

// Stripe needs the raw, unparsed body to verify the webhook signature, so
// this route is registered before the JSON body parser applies to everything else.
app.post("/billing/webhook", express.raw({ type: "application/json" }), billingWebhookHandler);

app.use(express.json());

app.use("/streams", streamsRouter);
app.use("/uploads", uploadsRouter);
app.use("/billing", billingRouter);

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
registerChatGateway(io);

const port = process.env.PORT ?? 4000;
httpServer.listen(port, () => {
  console.log(`Pulse server listening on :${port}`);
});
