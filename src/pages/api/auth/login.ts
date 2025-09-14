import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import argon2 from "argon2";
import authService from "@/lib/auth_service";
import { BaseResponse } from "@/lib/types";
import { zodErrorToFormError } from "@/lib/utils";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(3).max(100),
});

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BaseResponse<string>>,
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const parsedBody = loginSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res
      .status(400)
      .json({ success: false, form: zodErrorToFormError(parsedBody.error) });
  }

  const { email, password } = parsedBody.data;

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return res
      .status(401)
      .json({ success: false, error: "Invalid credentials" });
  }

  const isPasswordValid = await argon2.verify(user.password, password);

  if (!isPasswordValid) {
    return res
      .status(401)
      .json({ success: false, error: "Invalid credentials" });
  }

  const session = await authService.getSession(req, res);

  session.user = {
    id: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
  };

  await session.save();

  res.status(200).json({ success: true, data: "Logged in" });
}

export default handler;
