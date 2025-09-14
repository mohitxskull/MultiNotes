export type TanStackFormError = {
  form?: string;
  fields?: Record<string, string>;
};

export type BaseResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error?: string;
      form?: TanStackFormError;
    };

export type SessionUser = {
  id: number;
  email: string;
  role: "admin" | "member";
  tenantId: number;
  tenantSlug: string;
  plan: "free" | "pro";
};


