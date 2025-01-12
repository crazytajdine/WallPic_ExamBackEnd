import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("imageId");

    if (!imageId) {
      return NextResponse.json(
        { error: "Missing imageId parameter" },
        { status: 400 }
      );
    }

    const comments = await prisma.comments.findMany({
      include: { user: { select: { username: true } } },
      where: { image_id: parseInt(imageId, 10) },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(comments, { status: 200 });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { image_id, comment } = await request.json();
    const token = request.cookies.get("token")?.value || "";

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = (await jwt.verify(token, process.env.JWT_SECRET!)) as {
      userId: number;
    };

    if (
      typeof image_id !== "number" ||
      typeof comment !== "string" ||
      !comment.trim()
    ) {
      return NextResponse.json(
        { error: "Invalid request data." },
        { status: 400 }
      );
    }

    const newComment = await prisma.comments.create({
      include: { user: { select: { username: true } } },
      data: {
        user_id: userId,
        image_id,
        comment,
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment." },
      { status: 500 }
    );
  }
}
