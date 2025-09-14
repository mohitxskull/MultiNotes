import ky, { HTTPError } from "ky";
import type { notes } from "@/db/schema";
import { BaseResponse, SessionUser } from "./types";

class ApiClient {
  private api = ky.create({
    prefixUrl: "/api",
  });

  private _request = async <T>(
    promise: Promise<BaseResponse<T>>
  ): Promise<BaseResponse<T>> => {
    try {
      return await promise;
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        if (error.name === "HTTPError" && error instanceof HTTPError) {
          try {
            const errorJson = await error.response.json();
            return errorJson;
          } catch {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: error.message };
      }

      return { success: false, error: "Unknown error" };
    }
  };

  login = async (
    params: {
      body: {
        email: string;
        password: string;
      };
    },
    options?: {
      signal?: AbortSignal;
    }
  ): Promise<BaseResponse<string>> => {
    return this._request(
      this.api
        .post("auth/login", { json: params.body, signal: options?.signal })
        .json()
    );
  };

  signup = async (
    params: {
      body: {
        email: string;
        password: string;
        tenantName: string;
      };
    },
    options?: {
      signal?: AbortSignal;
    }
  ): Promise<BaseResponse<string>> => {
    return this._request(
      this.api
        .post("auth/signup", { json: params.body, signal: options?.signal })
        .json()
    );
  };

  logout = async (): Promise<BaseResponse<string>> => {
    return this._request(this.api.post("auth/logout").json());
  };

  getMe = async (): Promise<BaseResponse<SessionUser>> => {
    return this._request(this.api.get("auth/me").json());
  };

  // Notes
  getNotes = async (): Promise<BaseResponse<(typeof notes.$inferSelect)[]>> => {
    return this._request(this.api.get("notes").json());
  };

  createNote = async (json: { title: string; content?: string }): Promise<BaseResponse<string>> => {
    return this._request(this.api.post("notes", { json }).json());
  };

  deleteNote = async (id: number): Promise<BaseResponse<string>> => {
    return this._request(this.api.delete(`notes/${id}`).json());
  };

  // Tenants
  upgradeToPro = async (slug: string): Promise<BaseResponse<string>> => {
    return this._request(this.api.post(`tenants/${slug}/upgrade`).json());
  };

  inviteUser = async (email: string): Promise<BaseResponse<string>> => {
    return this._request(this.api.post("tenants/invite", { json: { email } }).json());
  };
}

export const api = new ApiClient();