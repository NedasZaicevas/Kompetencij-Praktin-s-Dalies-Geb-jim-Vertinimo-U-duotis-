import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Route moduliai (atskirai logikai)
import categoriesRoutes from "./routes/categories.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import eventsRoutes from "./routes/events.js";

dotenv.config(); // užkrauna .env kintamuosius į process.env

const app = express();

/**
 * CORS:
 * - leidžiam frontui (Vite) pasiekti backendą
 * - jei fronto URL pasikeis (deploy), čia reikės atnaujint
 */
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
  credentials: true,
}));

/**
 * JSON body parser:
 * - kad req.body veiktų su JSON (Postman, front fetch, axios)
 */
app.use(express.json());

/**
 * Health check:
 * - greitas testas ar serveris gyvas
 * - naudojai naršyklėje / Postmane patikrint “API veikia”
 */
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "API veikia" });
});

/**
 * Route mountinimas:
 * - /api/auth -> login/register ir t.t.
 * - /api/categories -> viešas kategorijų gavimas (jei turi)
 * - /api/events -> vieši/naudotojo eventai
 * - /api/admin -> admin veiksmai (requireAdmin)
 */
app.use("/api/categories", categoriesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventsRoutes);

const port = process.env.PORT || 4000;

/**
 * "0.0.0.0" svarbu Docker’y:
 * - kad containerio viduje serveris klausytų visur
 */
app.listen(port, "0.0.0.0", () => console.log("API running on", port));