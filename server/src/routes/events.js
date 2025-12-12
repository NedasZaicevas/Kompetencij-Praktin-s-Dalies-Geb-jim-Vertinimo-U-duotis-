import express from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/events
 * Viešas endpointas.
 *
 * Logika:
 * - grąžinam tik APPROVED eventus
 * - include category -> kad frontui nereiktų papildomai fetchint kategorijos
 */
router.get("/", async (req, res) => {
  const events = await prisma.event.findMany({
    where: { status: "APPROVED" },
    include: { category: true },
    orderBy: { startsAt: "asc" },
  });

  res.json(events);
});

/**
 * POST /api/events
 * Tik prisijungus (requireAuth).
 *
 * Logika:
 * - paprastas vartotojas sukuria eventą, bet jis iškart būna PENDING
 * - adminas vėliau patvirtina per /api/admin/events/:id/status
 */
router.post("/", requireAuth, async (req, res) => {
  const { title, location, startsAt, categoryId, imageUrl } = req.body;

  // Validacija
  if (!title || !location || !startsAt || !categoryId) {
    return res.status(400).json({ error: "Trūksta title/location/startsAt/categoryId" });
  }

  // Prisma create
  const event = await prisma.event.create({
    data: {
      title,
      location,
      startsAt: new Date(startsAt),
      imageUrl: imageUrl || null,
      categoryId: Number(categoryId),
      createdById: req.user.id, // kas sukūrė (iš JWT)
      status: "PENDING",
    },
  });

  res.status(201).json(event);
});

export default router;
