// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.parse(body);
    const { email, password } = parsed;

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials email" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      console.log(password);
      bcrypt.hash(password, 10).then((hash) => console.log(hash));
      console.log(user.password_hash);
      return NextResponse.json(
        { message: "Invalid credentials password" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json(
      { message: "Login successful" },
      { status: 200 }
    );
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
