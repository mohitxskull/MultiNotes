import { db } from "@/db";
import { notes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import authService, { AuthenticatedApiHandler } from "@/lib/auth_service";
import { BaseResponse } from "@/lib/types";
import { zodErrorToFormError } from "@/lib/utils";

const updateNoteSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
});

const handler: AuthenticatedApiHandler = async (
  req: NextApiRequest, 
  res: NextApiResponse<BaseResponse<unknown>>,
  user
) => {
  const { id } = req.query;
  const noteId = parseInt(id as string, 10);

  if (req.method === "GET") {
    const note = await db.query.notes.findFirst({
      where: and(eq(notes.id, noteId), eq(notes.tenantId, user.tenantId)),
    });

    if (!note) {
      return res.status(404).json({ success: false, error: "Not Found" });
    }

    return res.status(200).json({ success: true, data: note });
  } else if (req.method === "PUT") {
    const parsedBody = updateNoteSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res
        .status(400)
        .json({ success: false, form: zodErrorToFormError(parsedBody.error) });
    }

    const note = await db.query.notes.findFirst({
      where: and(eq(notes.id, noteId), eq(notes.tenantId, user.tenantId)),
    });

    if (!note) {
      return res.status(404).json({ success: false, error: "Not Found" });
    }

    await db.update(notes).set(parsedBody.data).where(eq(notes.id, noteId));

    const updatedNote = await db.query.notes.findFirst({
      where: eq(notes.id, noteId),
    });

    return res.status(200).json({ success: true, data: updatedNote });
  } else if (req.method === "DELETE") {
    const note = await db.query.notes.findFirst({
      where: and(eq(notes.id, noteId), eq(notes.tenantId, user.tenantId)),
    });

    if (!note) {
      return res.status(404).json({ success: false, error: "Not Found" });
    }

    await db.delete(notes).where(eq(notes.id, noteId));

    return res.status(200).json({ success: true, data: "Note deleted" });
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default authService.withApiAuth(handler);
