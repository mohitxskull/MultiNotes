import { getIronSession, IronSession, SessionOptions } from "iron-session";
import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import { NextRequest, NextResponse } from "next/server";
import { SessionUser } from "./types";

type IronSessionData = {
  user?: SessionUser;
};

export const sessionOptions: SessionOptions = {
  password: process.env.AUTH_SECRET as string,
  cookieName: "multinotes-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

class AuthService {
  async getSession(
    req: NextApiRequest,
    res: NextApiResponse,
  ): Promise<IronSession<IronSessionData>> {
    return getIronSession(req, res, sessionOptions);
  }

  // For Middleware (Node.js runtime)
  async getMiddlewareSession(
    req: NextRequest,
    res: NextResponse,
  ): Promise<IronSession<IronSessionData>> {
    return getIronSession(req, res, sessionOptions);
  }

  withApiAuth(handler: NextApiHandler): NextApiHandler {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const session = await this.getSession(req, res);
      if (!session.user) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }
      return handler(req, res);
    };
  }
}

const authService = new AuthService();

export default authService;
