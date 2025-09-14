import { getIronSession, IronSession, SessionOptions } from "iron-session";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import { SessionUser } from "./types";

type IronSessionData = {
  user?: SessionUser;
};

export type AuthenticatedApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  user: SessionUser,
  session: IronSession<IronSessionData>
) => unknown | Promise<unknown>;

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

  withApiAuth(handler: AuthenticatedApiHandler) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const session = await this.getSession(req, res);
      const { user } = session;

      if (!user) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      return handler(req, res, user, session);
    };
  }
}

const authService = new AuthService();

export default authService;
