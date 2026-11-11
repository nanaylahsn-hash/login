import { randomBytes, scrypt } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/src/lib/prisma";

type RegistrationPayload = {
  name: string;
  phone: string;
  password: string;
  passwordConfirmation: string;
};

function isRegistrationPayload(value: unknown): value is RegistrationPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return (
    typeof payload.name === "string" &&
    typeof payload.phone === "string" &&
    typeof payload.password === "string" &&
    typeof payload.passwordConfirmation === "string"
  );
}

function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");

  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (error, key) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(`${salt}:${key.toString("hex")}`);
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

  if (!isRegistrationPayload(payload)) {
    return Response.json(
      { error: "Data pendaftaran tidak lengkap." },
      { status: 400 },
    );
  }

  const name = payload.name.trim();
  const phone = payload.phone.trim();

  if (!name || !phone || !payload.password) {
    return Response.json(
      { error: "Nama, nomor HP, dan password wajib diisi." },
      { status: 400 },
    );
  }

  if (payload.password.length < 8) {
    return Response.json(
      { error: "Password harus terdiri dari minimal 8 karakter." },
      { status: 400 },
    );
  }

  if (payload.password !== payload.passwordConfirmation) {
    return Response.json(
      { error: "Password dan konfirmasi password tidak sama." },
      { status: 400 },
    );
  }

  try {
    const passwordHash = await hashPassword(payload.password);
    const user = await prisma.user.create({
      data: { name, phone, passwordHash },
      select: { name: true, phone: true },
    });

    return Response.json({ registration: user }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json(
        { error: "Nomor HP sudah terdaftar." },
        { status: 409 },
      );
    }

    console.error("Failed to save registration.", error);
    return Response.json(
      { error: "Pendaftaran gagal disimpan. Silakan coba lagi." },
      { status: 500 },
    );
  }
}
