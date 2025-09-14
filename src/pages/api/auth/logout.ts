import { NextApiRequest, NextApiResponse } from "next";
import authService from "@/lib/auth_service";
import { BaseResponse } from "@/lib/types";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BaseResponse<string>>
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const session = await authService.getSession(req, res);
  session.destroy();

  res.status(200).json({ success: true, data: "Logged out" });
}

export default handler;
