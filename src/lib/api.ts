import ky, { HTTPError } from "ky";
import type { notes } from "@/db/schema";
import { BaseResponse, SessionUser } from "./types";

class ApiClient {
  private api = ky.create({
    prefixUrl: "/api",
  });

  private async _request<T>(promise: Promise<BaseResponse<T>>): Promise<BaseResponse<T>> {
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
  }

  async login(
    params: {
      body: {
        email: string;
        password: string;
      };
    },
    options?: {
      signal?: AbortSignal;
    },
  ): Promise<BaseResponse<string>> {
    return this._request(
      this.api
        .post("auth/login", { json: params.body, signal: options?.signal })
        .json()
    );
  }

  async logout(): Promise<BaseResponse<string>> {
    return this._request(this.api.post("auth/logout").json());
  }

  async getMe(): Promise<BaseResponse<SessionUser>> {
    return this._request(this.api.get("auth/me").json());
  }

  // Notes
  async getNotes(): Promise<BaseResponse<(typeof notes.$inferSelect)[]>> {
    return this._request(this.api.get("notes").json());
  }

  async createNote(json: { title: string; content?: string }): Promise<BaseResponse<string>> {
    return this._request(this.api.post("notes", { json }).json());
  }

  async deleteNote(id: number): Promise<BaseResponse<string>> {
    return this._request(this.api.delete(`notes/${id}`).json());
  }

  // Tenants
  async upgradeToPro(slug: string): Promise<BaseResponse<string>> {
    return this._request(this.api.post(`tenants/${slug}/upgrade`).json());
  }
}

export const api = new ApiClient();