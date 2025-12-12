import express from "express";
import { prisma } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

/**
 * Slug generatorius:
 * - paverčia į mažąsias
 * - tarpus / underscore pakeičia į "-"
 * - išmeta visus simbolius, kurie nėra raidės/skaičiai/-
 * - sutvarko daug "-" į vieną
 *
 * Pvz: "Krepšinio varžybos!" -> "krepšinio-varžybos"
 */
function makeSlug(input) {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "") // palieka LT raides, skaičius ir "-"
    .replace(/-+/g, "-");
}

/**
 * POST /api/admin/categories
 * Tik ADMIN.
 *
 * Body:
 * - { name, slug? }
 * Jei slug nepaduotas -> sugeneruojam automatiškai iš name.
 *
 * Kodėl slug?
 * - patogu URL, filtravimui, unikalumui (pvz "sportas" vietoj "Sportas")
 */
router.post("/categories", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, slug } = req.body;

    // Validacija: name būtinas
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Trūksta name" });
    }

    const cleanName = name.trim();
    const cleanSlug = (slug && slug.trim()) ? makeSlug(slug) : makeSlug(cleanName);

    // Apsauga nuo dublikatų: tikrinam ar jau yra toks name ARBA toks slug
    const exists = await prisma.category.findFirst({
      where: {
        OR: [{ name: cleanName }, { slug: cleanSlug }],
      },
    });
    if (exists) {
      return res.status(409).json({ error: "Tokia kategorija jau yra" });
    }

    // Kuriam kategoriją
    const category = await prisma.category.create({
      data: { name: cleanName, slug: cleanSlug },
    });

    return res.status(201).json({ message: "Sukurta", category });
  } catch (e) {
    console.error("CREATE CATEGORY ERROR:", e);
    return res.status(500).json({ error: "Serverio klaida" });
  }
});

/**
 * GET /api/admin/categories
 * Tik ADMIN.
 * Grąžina visas kategorijas (patogu admin panelėje / pasirinkimui).
 */
router.get("/categories", requireAuth, requireAdmin, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { id: "asc" } });
    return res.json({ categories });
  } catch (e) {
    console.error("GET CATEGORIES ERROR:", e);
    return res.status(500).json({ error: "Serverio klaida" });
  }
});

/**
 * POST /api/admin/events
 * Tik ADMIN.
 *
 * Body:
 * - title, location, startsAt (arba date), categoryId, imageUrl?, status?
 *
 * Kodėl startsAt/date alias:
 * - kad Postmane galėtum siųst "date" ir vistiek veiktų
 *
 * createdById:
 * - pririšam, kas sukūrė eventą (admin vartotojo id)
 */
router.post("/events", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, location, categoryId, imageUrl, status } = req.body;
    const startsAtRaw = req.body.startsAt ?? req.body.date; // leidžiam "date" kaip alternatyvą

    // Būtini laukai
    if (!title || !location || !startsAtRaw || !categoryId) {
      return res.status(400).json({
        error: "Trūksta title, location, startsAt/date arba categoryId",
      });
    }

    // Konvertuojam į Date ir patikrinam formatą
    const startsAt = new Date(startsAtRaw);
    if (Number.isNaN(startsAt.getTime())) {
      return res.status(400).json({ error: "Blogas startsAt/date formatas" });
    }

    // Patikrinam ar kategorija egzistuoja (kad nekurt su blogu ID)
    const cat = await prisma.category.findUnique({
      where: { id: Number(categoryId) },
    });
    if (!cat) return res.status(404).json({ error: "Kategorija nerasta" });

    // Kuriam eventą
    const event = await prisma.event.create({
      data: {
        title: String(title).trim(),
        location: String(location).trim(),
        startsAt,
        imageUrl: imageUrl ? String(imageUrl).trim() : null,
        status: status ?? "APPROVED", // adminui default APPROVED
        categoryId: Number(categoryId),
        createdById: req.user.id, // req.user atsiranda iš requireAuth middleware
      },

      // include: kad grąžintų pilnesnį objektą (pvz admin panelėje patogiau)
      include: {
        category: true,
        createdBy: { select: { id: true, email: true, role: true } },
      },
    });

    return res.status(201).json({ message: "Sukurta", event });
  } catch (e) {
    console.error("CREATE EVENT ERROR:", e);
    return res.status(500).json({ error: "Serverio klaida" });
  }
});

/**
 * GET /api/admin/events
 * Tik ADMIN.
 * Grąžina visus eventus (tame tarpe PENDING ir APPROVED).
 */
router.get("/events", requireAuth, requireAdmin, async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { id: "asc" },
      include: {
        category: true,
        createdBy: { select: { id: true, email: true, role: true } },
      },
    });
    return res.json({ events });
  } catch (e) {
    console.error("GET EVENTS ERROR:", e);
    return res.status(500).json({ error: "Serverio klaida" });
  }
});

/**
 * PATCH /api/admin/events/:id/status
 * Tik ADMIN.
 * Keičia event statusą (pvz PENDING -> APPROVED).
 *
 * Body: { status: "APPROVED" | "PENDING" | "REJECTED" ... }
 */
router.patch("/events/:id/status", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!id) return res.status(400).json({ error: "Blogas id" });
    if (!status) return res.status(400).json({ error: "Trūksta status" });

    const exists = await prisma.event.findUnique({ where: { id } });
    if (!exists) return res.status(404).json({ error: "Event nerastas" });

    const event = await prisma.event.update({
      where: { id },
      data: { status },
    });

    return res.json({ message: "Atnaujinta", event });
  } catch (e) {
    console.error("UPDATE EVENT STATUS ERROR:", e);
    return res.status(500).json({ error: "Serverio klaida" });
  }
});

export default router;
