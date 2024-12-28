// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value || "";

  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      email: string;
    };
    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, email: true },
    });
    return NextResponse.json({ user }, { status: 200 });
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
