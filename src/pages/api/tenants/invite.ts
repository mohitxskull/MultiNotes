import { db } from "@/db";
import { users } from "@/db/schema";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import argon2 from "argon2";
import authService, { AuthenticatedApiHandler } from "@/lib/auth_service";
import { BaseResponse } from "@/lib/types";
import { zodErrorToFormError } from "@/lib/utils";
import { eq } from "drizzle-orm";

const inviteUserSchema = z.object({
  email: z.email(),
});

const handler: AuthenticatedApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<BaseResponse<string>>,
  user
) => {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  if (user.role !== "admin") {
    return res.status(403).json({ success: false, error: "Forbidden" });
  }

  const parsedBody = inviteUserSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res
      .status(400)
      .json({ success: false, form: zodErrorToFormError(parsedBody.error) });
  }

  const { email } = parsedBody.data;

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return res
      .status(409)
      .json({ success: false, error: "User with this email already exists" });
  }

  const password = await argon2.hash("password");

  await db.insert(users).values({
    email,
    password,
    role: "member",
    tenantId: user.tenantId,
  });

  res.status(201).json({ success: true, data: "User invited successfully" });
}

export default authService.withApiAuth(handler);
