import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = await auth.api.getSession({
      headers: new Headers({
        cookie: req.headers.cookie || "",
      }),
    });

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    (req as any).user = session.user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
