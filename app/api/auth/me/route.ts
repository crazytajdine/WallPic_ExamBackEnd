// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value || "";

  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  try {
    // Verify the token and extract payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload & {
      userId: number;
      email: string;
    };

    // Fetch user from the database
    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, email: true },
    });
    console.log(user);
    // If user doesn't exist, treat as unauthenticated
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    // Handle specific JWT errors
    if (error instanceof TokenExpiredError) {
      // Token has expired; clear the cookie
      const response = NextResponse.json({ user: null }, { status: 200 });
      response.cookies.set("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: new Date(0), // Expire the cookie immediately
        path: "/",
      });
      return response;
    }

    // For other errors (e.g., invalid token), also clear the cookie
    const response = NextResponse.json({ user: null }, { status: 200 });
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
      path: "/",
    });
    return response;
  }
}
