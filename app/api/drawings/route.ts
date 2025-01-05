import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const drawings = await prisma.$queryRaw<
    Array<{
      id: number;
      name: string;
      user: string;
      image_url: string;
      created_at: Date;
      upvoteCount: number;
      downvoteCount: number;
    }>
  >`
    SELECT 
      d.id, 
      d.name,
      u.username AS user, 
      d.image_url, 
      d.created_at,
      COUNT(CASE WHEN v.vote_type = 'up' THEN 1 END) AS upvoteCount,
      COUNT(CASE WHEN v.vote_type = 'down' THEN 1 END) AS downvoteCount
    FROM drawings d
    INNER JOIN users u ON d.user_id = u.id
    LEFT JOIN votes v ON d.id = v.drawing_id
    GROUP BY d.id, d.name, u.username, d.image_url, d.created_at
    ORDER BY (COUNT(CASE WHEN v.vote_type = 'up' THEN 1 END) - COUNT(CASE WHEN v.vote_type = 'down' THEN 1 END)) DESC
  `;

  return NextResponse.json(
    JSON.parse(
      JSON.stringify(drawings, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    ),
    { status: 200 }
  );
}
