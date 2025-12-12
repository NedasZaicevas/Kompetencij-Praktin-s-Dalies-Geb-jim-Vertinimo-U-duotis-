// server/src/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db.js";

const router = express.Router();

/**
 * POST /api/auth/register
 * Body: { email, password }
 * Sukuria vartotoją su užhashintu slaptažodžiu ir grąžina token + user.
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // paprasta validacija
    if (!email || !password) {
      return res.status(400).json({ error: "Trūksta email arba password" });
    }

    // ar toks email jau yra?
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ error: "Toks el. paštas jau registruotas" });
    }

    // hashinam slaptažodį (NEGALIMA laikyti plain text)
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "USER",
      },
      select: { id: true, email: true, role: true },
    });

    // JWT tokenas (svarbu kad būtų JWT_SECRET env)
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({ message: "Užregistruota", token, user });
  } catch (e) {
    console.error("REGISTER ERROR:", e);
    return res.status(500).json({ error: "Serverio klaida" });
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Patikrina slaptažodį ir grąžina token + user.
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Trūksta email arba password" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Blogi prisijungimo duomenys" });

    if (user.isBlocked) {
      return res.status(403).json({ error: "Vartotojas užblokuotas" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Blogi prisijungimo duomenys" });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Prisijungta",
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (e) {
    console.error("LOGIN ERROR:", e);
    return res.status(500).json({ error: "Serverio klaida" });
  }
});

// 👇 SVARBIAUSIA: default export router (kad sutaptų su import authRoutes from ...)
export default router;
