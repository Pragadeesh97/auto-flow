import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export function AuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization as unknown as string;

  if (!token) {
    return res.sendStatus(401);
  }
  try {
    console.log("token is", token);
    console.log("SECRET", process.env.JWT_SECRET);
    const user = jwt.verify(token, process.env.JWT_SECRET || "hello world");
    //@ts-ignore
    req.id = user?.id;
    next();
  } catch (e) {
    console.log("Middleware: Error while verifying jwt", e);
    return res.status(401);
  }
}
