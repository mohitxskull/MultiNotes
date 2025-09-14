import { db } from "@/db";
import { tenants } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";
import authService, { AuthenticatedApiHandler } from "@/lib/auth_service";
import { BaseResponse } from "@/lib/types";

const handler: AuthenticatedApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<BaseResponse<string>>,
  user,
  session
) => {
  if (user.role !== "admin") {
    return res.status(403).json({ success: false, error: "Forbidden" });
  }

  const { slug } = req.query;

  const tenant = await db.query.tenants.findFirst({
    where: and(
      eq(tenants.slug, slug as string),
      eq(tenants.id, user.tenantId)
    ),
  });

  if (!tenant) {
    return res.status(404).json({ success: false, error: "Not Found" });
  }

  await db
    .update(tenants)
    .set({ plan: "pro" })
    .where(eq(tenants.id, tenant.id));

  // The user object is guaranteed to be present by the withApiAuth middleware
  session.user!.plan = "pro";
  await session.save();

  res.status(200).json({ success: true, data: "Upgraded to Pro" });
}

export default authService.withApiAuth(handler);
