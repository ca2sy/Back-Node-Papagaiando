import cors from "cors";
import express from "express";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/errorHandler.middleware";
import routes from "./routes";

const app = express();

// CORS_ORIGINS=http://localhost:5173,https://meusite.com (vazio = libera todos)
const origens = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors(origens.length > 0 ? { origin: origens } : {}));
app.use(express.json());

// Usado por plataformas de deploy para saber se o servidor está no ar
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(routes);

app.use(notFoundHandler);
app.use(errorHandler); // sempre por último

export default app;