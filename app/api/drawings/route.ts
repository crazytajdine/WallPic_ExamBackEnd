// app/api/drawings/index/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const drawings = await prisma.drawings.findMany();
  return NextResponse.json(drawings, { status: 200 });
}
