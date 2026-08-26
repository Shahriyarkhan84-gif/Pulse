import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { authRouter } from "./routes/auth.routes";
import { streamsRouter } from "./routes/streams.routes";
import { registerChatGateway } from "./sockets/chatGateway";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/streams", streamsRouter);

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
registerChatGateway(io);

const port = process.env.PORT ?? 4000;
httpServer.listen(port, () => {
  console.log(`Pulse server listening on :${port}`);
});
