import { db } from "@/db";
import { notes, tenants } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import authService, { AuthenticatedApiHandler } from "@/lib/auth_service";
import { BaseResponse } from "@/lib/types";
import { zodErrorToFormError } from "@/lib/utils";

const createNoteSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
});

const handler: AuthenticatedApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<BaseResponse<unknown>>,
  user
) => {
  if (req.method === "POST") {
    const parsedBody = createNoteSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res
        .status(400)
        .json({ success: false, form: zodErrorToFormError(parsedBody.error) });
    }

    const { title, content } = parsedBody.data;

    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, user.tenantId),
    });

    if (!tenant) {
      // This should ideally not happen if user session is valid
      return res.status(404).json({ success: false, error: "Tenant not found" });
    }

    if (tenant.plan === "free") {
      const notesCount = await db
        .select({ value: count() })
        .from(notes)
        .where(eq(notes.tenantId, user.tenantId));

      if (notesCount[0].value >= 3) {
        return res
          .status(403)
          .json({ success: false, error: "Free plan limit reached" });
      }
    }

    await db.insert(notes).values({
      title,
      content,
      tenantId: user.tenantId,
      authorId: user.id,
    });

    return res.status(201).json({ success: true, data: "Note created" });
  } else if (req.method === "GET") {
    const userNotes = await db.query.notes.findMany({
      where: eq(notes.tenantId, user.tenantId),
    });

    return res.status(200).json({ success: true, data: userNotes });
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default authService.withApiAuth(handler);
