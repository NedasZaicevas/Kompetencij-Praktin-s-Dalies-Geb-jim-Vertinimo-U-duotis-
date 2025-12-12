import jwt from "jsonwebtoken";
import { prisma } from "../db.js";

/**
 * requireAuth:
 * - Tikrina ar request turi Authorization: Bearer <token>
 * - Jei token validus, prideda req.user (vartotojo info)
 */
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;

    // Jei nėra headerio -> neprisijungęs
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Neprisijungęs (nėra token)" });
    }

    const token = header.split(" ")[1];

    // Patikrina token parašą
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Pasiimam vartotoją iš DB (kad žinotume role / blocked ir pan.)
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) return res.status(401).json({ error: "Vartotojas nerastas" });
    if (user.isBlocked) return res.status(403).json({ error: "Vartotojas užblokuotas" });

    // Pridedam vartotoją prie requesto, kad vėliau route’ai galėtų naudoti
    req.user = { id: user.id, email: user.email, role: user.role };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Blogas arba pasibaigęs token" });
  }
}

/**
 * requireAdmin:
 * - Turi būti kviečiamas PO requireAuth
 * - Tikrina role === ADMIN
 */
export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Neprisijungęs" });
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Reikia ADMIN teisių" });
  next();
}
