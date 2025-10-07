import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("sessionToken");

    return NextResponse.json(
      {
        message: "Logout",
        success: true,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Logout API error:", error);

    return NextResponse.json(
      {
        message: "ServerError",
        success: false,
      },
      { status: 500 }
    );
  }
}
