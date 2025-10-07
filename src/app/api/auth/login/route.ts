import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

import authApiRequest from "@/lib/apis/auth";
import { HttpError } from "@/lib/http";
import { LoginBodyType } from "@/models";

export async function POST(request: Request) {
  const body = (await request.json()) as LoginBodyType;
  const cookieStore = await cookies();
  try {
    const { payload } = await authApiRequest.sLogin(body);
    const sessionToken = payload.data;
    const decodedSessionToken = jwt.decode(sessionToken) as { exp: number };
    cookieStore.set("sessionToken", sessionToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      expires: decodedSessionToken.exp * 1000,
    });
    return Response.json(payload);
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json(error.payload, {
        status: error.status,
      });
    } else {
      return Response.json(
        {
          message: "Có lỗi xảy ra",
        },
        {
          status: 500,
        }
      );
    }
  }
}
