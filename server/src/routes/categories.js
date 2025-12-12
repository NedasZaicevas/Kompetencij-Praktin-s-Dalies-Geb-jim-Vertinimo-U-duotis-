import express from "express";
import { prisma } from "../db.js";

const router = express.Router();

/**
 * GET /api/categories
 */
router.get("/", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: "asc" },
    });
    return res.json({ categories });
  } catch (e) {
    console.error("GET CATEGORIES ERROR:", e);
    return res.status(500).json({ error: "Serverio klaida" });
  }
});

export default router;
