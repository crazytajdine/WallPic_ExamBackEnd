// import necessary modules
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

// Define the shape of your request body
interface CreateDrawingBody {
  name: string;
  image_url: string;
  category_id: number;
}

export async function POST(req: NextRequest) {
  try {
    // Extract the token from cookies
    const token = req.cookies.get("token")?.value || "";

    if (!token) {
      return NextResponse.redirect("/login");
    }

    // Verify JWT token
    let userId: number;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      userId = (decoded as { userId: number }).userId;
    } catch (err) {
      console.error("JWT Verification Error:", err);
      return NextResponse.redirect("/login");
    }

    // Parse the request body
    const body: CreateDrawingBody = await req.json();

    const { name, image_url, category_id } = body;

    // Validate input (you can add more validations as needed)
    if (!name || !image_url || !category_id) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Create the new drawing
    const newDrawing = await prisma.drawings.create({
      data: {
        name,
        image_url,
        category_id,
        user_id: userId, // assuming you have a user_id field
      },
      select: {
        id: true,
        name: true,
        image_url: true,
        created_at: true,
        user: {
          select: {
            username: true,
          },
        },
        votes: {
          select: {
            vote_type: true,
            user_id: true,
          },
        },
      },
    });

    // Since it's a new drawing, votes should be empty
    // Therefore, upvoteCount and downvoteCount are 0
    const processedDrawing = {
      id: newDrawing.id,
      name: newDrawing.name,
      user: newDrawing.user.username,
      image_url: newDrawing.image_url,
      created_at: newDrawing.created_at,
      upvoteCount: 0,
      downvoteCount: 0,
      voted: null, // No votes yet
    };

    return NextResponse.json(processedDrawing, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/drawings Error:", error);

    // Safely extract error message
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}
