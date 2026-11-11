import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { hashSessionToken, SESSION_COOKIE_NAME } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;
const DUMMY_PASSWORD_HASH = `${"0".repeat(32)}:${"0".repeat(128)}`;

type LoginPayload = {
  phone: string;
  password: string;
};

function isLoginPayload(value: unknown): value is LoginPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    "phone" in value &&
    typeof value.phone === "string" &&
    "password" in value &&
    typeof value.password === "string"
  );
}

function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  const [salt, storedKey] = passwordHash.split(":");
  if (
    !salt ||
    !storedKey ||
    !/^[a-f0-9]{32}$/i.test(salt) ||
    !/^[a-f0-9]{128}$/i.test(storedKey)
  ) {
    return Promise.resolve(false);
  }

  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (error, key) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(timingSafeEqual(key, Buffer.from(storedKey, "hex")));
    });
  });
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  if (!isLoginPayload(payload) || !payload.phone.trim() || !payload.password) {
    return Response.json(
      { error: "Nomor HP dan password wajib diisi." },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { phone: payload.phone.trim() },
      select: { id: true, passwordHash: true },
    });
    const passwordMatches = await verifyPassword(
      payload.password,
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );

    if (!user || !passwordMatches) {
      return Response.json(
        { error: "Nomor HP atau password salah." },
        { status: 401 },
      );
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(
      Date.now() + SESSION_DURATION_SECONDS * 1000,
    );

    await prisma.session.create({
      data: { tokenHash: hashSessionToken(token), expiresAt, userId: user.id },
    });

    (await cookies()).set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to log in.", error);
    return Response.json(
      { error: "Login gagal. Silakan coba lagi." },
      { status: 500 },
    );
  }
}
