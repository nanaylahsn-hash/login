import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";

export const SESSION_COOKIE_NAME = "login_session";

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function getAuthenticatedUser() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    select: {
      expiresAt: true,
      user: { select: { name: true, phone: true } },
    },
  });

  if (!session || session.expiresAt <= new Date()) {
    return null;
  }

  return session.user;
}
