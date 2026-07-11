import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import * as schema from "../src/lib/db/schema.js";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const db = drizzle(client, { schema });

async function main() {
  console.info("Seeding database...");

  // --- Admin ---
  const adminPassword = await bcrypt.hash("admin123", 10);
  await db
    .insert(schema.users)
    .values({
      id: randomUUID(),
      name: "Administrator",
      email: "admin@laundry.com",
      phone: "081200000000",
      passwordHash: adminPassword,
      role: "admin",
      loyaltyPoints: 0,
    })
    .onConflictDoNothing({ target: schema.users.email });
  console.info("  ✓ admin@laundry.com / admin123");

  // --- Demo customer ---
  const custPassword = await bcrypt.hash("customer123", 10);
  await db
    .insert(schema.users)
    .values({
      id: randomUUID(),
      name: "Budi Santoso",
      email: "customer@laundry.com",
      phone: "081211112222",
      passwordHash: custPassword,
      role: "customer",
      loyaltyPoints: 120,
    })
    .onConflictDoNothing({ target: schema.users.email });
  console.info("  ✓ customer@laundry.com / customer123");

  // --- Services ---
  const serviceRows = [
    {
      name: "Cuci Kering Lipat",
      description: "Cuci, kering, dan lipat rapi. Cocok untuk kebutuhan harian.",
      pricePerKg: 7000,
      minWeight: 2,
      estimatedHours: 24,
    },
    {
      name: "Express Cuci Lipat",
      description: "Layanan kilat selesai dalam 6 jam.",
      pricePerKg: 12000,
      minWeight: 2,
      estimatedHours: 6,
    },
    {
      name: "Setrika Only",
      description: "Hanya setrika untuk pakaian yang sudah bersih.",
      pricePerKg: 5000,
      minWeight: 2,
      estimatedHours: 12,
    },
    {
      name: "Dry Clean",
      description: "Perawatan khusus untuk bahan sensitif dan jas.",
      pricePerKg: 25000,
      minWeight: 1,
      estimatedHours: 48,
    },
    {
      name: "Cuci Sepatu",
      description: "Cuci sepatu per pasang hingga bersih maksimal.",
      pricePerKg: 35000,
      minWeight: 1,
      estimatedHours: 24,
    },
  ];

  for (const s of serviceRows) {
    await db
      .insert(schema.services)
      .values({ id: randomUUID(), isActive: 1, ...s });
  }
  console.info(`  ✓ ${serviceRows.length} services`);

  console.info("Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
