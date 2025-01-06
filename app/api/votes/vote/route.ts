// app/api/votes/vote/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { z } from "zod";

const voteSchema = z.object({
  drawingId: z.number(),
  voteType: z.enum(["up", "down"]),
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
    const parsed = voteSchema.parse(body);
    const { drawingId, voteType } = parsed;
    try {
      const alreadyExisted = await prisma.votes.delete({
        where: {
          user_id_drawing_id: {
            user_id: decoded.userId,
            drawing_id: drawingId,
          },
        },
      });
      if (alreadyExisted.vote_type)
        if (voteType == alreadyExisted.vote_type)
          return NextResponse.json(
            { message: "Vote recorded" },
            { status: 200 }
          );
    } catch {}
    // Create vote record
    await prisma.votes.create({
      data: {
        user_id: decoded.userId,
        drawing_id: drawingId,
        vote_type: voteType,
      },
    });
    return NextResponse.json({ message: "Vote recorded" }, { status: 200 });
  } catch (error) {
    console.log(error.message);
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
