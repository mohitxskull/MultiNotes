import { NextApiResponse } from "next";
import authService, { AuthenticatedApiHandler } from "@/lib/auth_service";
import { BaseResponse, SessionUser } from "@/lib/types";

const handler: AuthenticatedApiHandler = async (
  _, 
  res: NextApiResponse<BaseResponse<SessionUser>>,
  user: SessionUser
) => {
  res.status(200).json({ success: true, data: user });
}

export default authService.withApiAuth(handler);
