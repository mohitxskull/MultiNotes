import "dotenv/config";
import { db } from "@/db";
import { tenants, users } from "@/db/schema";
import argon2 from "argon2";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Seeding database...");

  const password = await argon2.hash("password");

  await db.insert(tenants).values([
    { name: "Acme", slug: "acme" },
    { name: "Globex", slug: "globex" },
  ]);

  const acme = await db.query.tenants.findFirst({
    where: eq(tenants.slug, "acme"),
  });

  const globex = await db.query.tenants.findFirst({
    where: eq(tenants.slug, "globex"),
  });

  if (!acme || !globex) {
    throw new Error("Could not find tenants");
  }

  await db.insert(users).values([
    {
      email: "admin@acme.test",
      password,
      role: "admin",
      tenantId: acme.id,
    },
    {
      email: "user@acme.test",
      password,
      role: "member",
      tenantId: acme.id,
    },
    {
      email: "admin@globex.test",
      password,
      role: "admin",
      tenantId: globex.id,
    },
    {
      email: "user@globex.test",
      password,
      role: "member",
      tenantId: globex.id,
    },
  ]);

  console.log("Database seeded successfully!");

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});