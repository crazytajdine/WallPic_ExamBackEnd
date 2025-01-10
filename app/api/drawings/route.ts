import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    console.log("Received GET request for /api/drawings");

    const token = req.cookies.get("token")?.value || "";
    console.log("Token:", token);

    if (!token) {
      console.log("No token found, redirecting to /login");
      return NextResponse.redirect("/login");
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables.");
      return NextResponse.json(
        {
          error: "Internal Server Error",
          details: "JWT_SECRET is not configured.",
        },
        { status: 500 }
      );
    }

    // Verify JWT token
    let userId: number;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = (decoded as { userId: number }).userId;
      console.log("Authenticated user ID:", userId);
    } catch (err) {
      console.error("JWT Verification Error:", err);
      return NextResponse.redirect("/login");
    }

    const { searchParams } = new URL(req.url);
    const categoryIdParam = searchParams.get("categoryId");

    // Build the where clause
    const where: any = {};
    if (categoryIdParam) {
      const categoryId = Number(categoryIdParam);
      if (!isNaN(categoryId)) {
        where.category_id = categoryId;
      }
    }

    console.log("Prisma where clause:", where);

    // Fetch drawings with aggregations
    const drawings = await prisma.drawings.findMany({
      where,
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
      orderBy: { created_at: "desc" }, // Initial ordering by creation date
    });

    console.log("Fetched drawings:", drawings);

    // Process drawings to include upvoteCount, downvoteCount, and voted
    const processedDrawings = drawings.map((drawing) => {
      const upvoteCount =
        drawing.votes?.filter((v) => v.vote_type === "up").length || 0;
      const downvoteCount =
        drawing.votes?.filter((v) => v.vote_type === "down").length || 0;
      const voted =
        drawing.votes?.find((v) => v.user_id === userId)?.vote_type || null;

      return {
        id: drawing.id,
        name: drawing.name,
        user: drawing.user?.username || "Unknown",
        image_url: drawing.image_url,
        created_at: drawing.created_at,
        upvoteCount,
        downvoteCount,
        netVotes: upvoteCount - downvoteCount, // Calculate net votes
        voted,
      };
    });

    console.log("Processed drawings:", processedDrawings);

    // Sort the drawings by netVotes in descending order
    processedDrawings.sort((a, b) => b.netVotes - a.netVotes);

    // Optionally, remove the netVotes field if not needed in the response
    const finalDrawings = processedDrawings.map(
      ({ netVotes, ...rest }) => rest
    );

    console.log("Final drawings to return:", finalDrawings);

    return NextResponse.json(finalDrawings, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/drawings Error:", error);

    // Safely extract error message
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    // Ensure the payload is always an object
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}
