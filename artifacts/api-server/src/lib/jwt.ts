import jwt from "jsonwebtoken";

const SECRET = process.env.SESSION_SECRET ?? "brainbuddy-kids-dev-secret";
const EXPIRES_IN = "30d";

export interface JwtPayload {
  parentId: number;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
