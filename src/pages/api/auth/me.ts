import { NextApiRequest, NextApiResponse } from "next";
import authService from "@/lib/auth_service";
import { BaseResponse, SessionUser } from "@/lib/types";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BaseResponse<SessionUser>>
) {
  const session = await authService.getSession(req, res);

  // withApiAuth guarantees user is present
  res.status(200).json({ success: true, data: session.user! });
}

export default authService.withApiAuth(handler);
