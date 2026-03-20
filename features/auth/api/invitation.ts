"use client";

import { requestJson } from "@/lib/api/client";

export async function acceptInvitation(payload: {
  token: string;
  password: string;
}) {
  return requestJson<{ success: boolean; message: string }>(
    `/users/invites/${payload.token}/accept`,
    {
      method: "POST",
      auth: false,
      body: {
        password: payload.password,
      },
      allowRefresh: false,
    },
  );
}
