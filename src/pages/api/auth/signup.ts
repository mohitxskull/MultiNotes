import { db } from "@/db";
import { tenants, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import argon2 from "argon2";
import authService from "@/lib/auth_service";
import { BaseResponse } from "@/lib/types";
import { zodErrorToFormError } from "@/lib/utils";

const signupSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  tenantName: z.string().min(3, "Tenant name must be at least 3 characters"),
});

function createSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BaseResponse<string>>
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const parsedBody = signupSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res
      .status(400)
      .json({ success: false, form: zodErrorToFormError(parsedBody.error) });
  }

  const { email, password, tenantName } = parsedBody.data;

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return res
      .status(409)
      .json({ success: false, error: "User with this email already exists" });
  }

  const tenantSlug = createSlug(tenantName);
  const existingTenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, tenantSlug),
  });

  if (existingTenant) {
    return res
      .status(409)
      .json({ success: false, error: "A tenant with this name already exists" });
  }

  const hashedPassword = await argon2.hash(password);

  // Note: In a real-world scenario, you'd want a transaction here.
  const newTenant = await db.insert(tenants).values({
    name: tenantName,
    slug: tenantSlug,
  });

  const tenantId = newTenant[0].insertId;

  const newUser = await db.insert(users).values({
    email,
    password: hashedPassword,
    role: "admin",
    tenantId: tenantId,
  });

  const session = await authService.getSession(req, res);
  session.user = {
    id: newUser[0].insertId,
    email,
    role: "admin",
    tenantId: tenantId,
    tenantSlug: tenantSlug,
    plan: "free",
  };
  await session.save();

  res.status(201).json({ success: true, data: "Signup successful" });
}

export default handler;
