// app/api/drawings/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { z } from "zod";

const createDrawingSchema = z.object({
  name: z.string().min(1),
  categoryId: z.number(),
  drawingUrl: z.string().url(),
});

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value || "";

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      email: string;
    };

    const body = await request.json();
    const parsed = createDrawingSchema.parse(body);
    const { name, categoryId, drawingUrl } = parsed;

    const drawing = await prisma.drawings.create({
      data: {
        name,
        category_id: categoryId,
        image_url: drawingUrl,
        user_id: decoded.userId,
      },
    });

    return NextResponse.json(drawing, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data", errors: error.errors },
        { status: 400 }
      );
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
