import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { requireAuth } from "./middleware/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL!,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  }),
);

app.use("/api/auth/", toNodeHandler(auth));

app.use(express.json());

app.get("/api/me", requireAuth, async (req, res) => {
  const session = await auth.api.getSession({
    headers: new Headers({
      cookie: req.headers.cookie || "",
    }),
  });
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return res.json({ user: session.user });
});

app.get("/api/health", (_req, res) => {
  return res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
