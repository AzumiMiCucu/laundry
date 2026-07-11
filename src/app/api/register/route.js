import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, schema } from "@/lib/db";
import { registerSchema } from "@/lib/validations";
import { nowSeconds } from "@/lib/utils";

export const runtime = "nodejs";

/**
 * POST /api/register — create a customer account.
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }
  const { name, email, phone, password } = parsed.data;

  const existing = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  if (existing[0]) {
    return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(schema.users).values({
    id: randomUUID(),
    name,
    email,
    phone,
    passwordHash,
    role: "customer",
    loyaltyPoints: 0,
    createdAt: nowSeconds(),
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
