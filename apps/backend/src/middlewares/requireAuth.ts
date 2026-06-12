import { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../models/client";
import { users } from "../models/schema/users";
import { verifyAccessToken } from "../utils/jwt";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth = req.headers.authorization;

  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const token = auth.split(" ")[1];
    const decoded = await verifyAccessToken(token); // ✅ await here

    if (!decoded || typeof decoded !== 'object') {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    const user = await db
      .select({
        passwordChangedAt: users.passwordChangedAt,
      })
      .from(users)
      .where(eq(users.id, decoded.sub))
      .limit(1)

    if (!user[0]) {
      return res.status(401).json({ error: "User not found" });
    }

    const passwordChangedAt = user[0].passwordChangedAt
    if (passwordChangedAt) {
      const tokenIssuedAtMs = (decoded as any).iat ? Number((decoded as any).iat) * 1000 : 0
      if (tokenIssuedAtMs && tokenIssuedAtMs < new Date(passwordChangedAt).getTime()) {
        return res.status(401).json({ error: "Session expired" });
      }
    }

    // Attach decoded token to request
    (req as any).user = decoded;
    // Also expose userId for controllers that expect req.userId (for consistency with requireApiKey)
    (req as any).userId = (decoded as any).sub;

    next();
  } catch (err: any) {
    // Don't log TokenExpiredError as error - it's expected behavior
    if (err?.name === 'TokenExpiredError') {
      // Return 401 so frontend can attempt refresh
      return res.status(401).json({ 
        error: "Token expired",
        code: "TOKEN_EXPIRED" 
      });
    }
    // Log other errors
    if (err?.name !== 'TokenExpiredError') {
      console.error("Token verification error:", err?.name || err?.message || err);
    }
    return res.status(401).json({ 
      error: "Token invalid or expired",
      code: err?.name || "TOKEN_INVALID"
    });
  }
};
