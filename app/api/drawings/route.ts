import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { votes_vote_type } from "@prisma/client";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value || "";

  if (!token) return NextResponse.redirect("/login");

  const { userId } = jwt.verify(token, process.env.JWT_SECRET!) as {
    userId: number;
  };
  const drawings = await prisma.$queryRaw<
    Array<{
      id: number;
      name: string;
      user: string;
      image_url: string;
      created_at: Date;
      upvoteCount: number;
      downvoteCount: number;
      voted: votes_vote_type | null;
    }>
  >`
      SELECT 
      d.id, 
      d.name,
      u.username AS user, 
      d.image_url, 
      d.created_at,
      
      COUNT(CASE WHEN v.vote_type = 'up' THEN 1 END) AS upvoteCount,
      COUNT(CASE WHEN v.vote_type = 'down' THEN 1 END) AS downvoteCount,

      (SELECT v.vote_type 
      FROM votes v 
     WHERE v.drawing_id = d.id AND v.user_id = ${userId}  
     LIMIT 1) AS voted
     
     FROM drawings d
  INNER JOIN users u ON d.user_id = u.id
  LEFT JOIN votes v ON d.id = v.drawing_id
  GROUP BY d.id, d.name, u.username, d.image_url, d.created_at
  ORDER BY (COUNT(CASE WHEN v.vote_type = 'up' THEN 1 END) - COUNT(CASE WHEN v.vote_type = 'down' THEN 1 END)) DESC, d.created_at DESC;
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
