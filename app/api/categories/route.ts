// app/api/categories/index/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.categories.findMany();
  return NextResponse.json(categories, { status: 200 });
}
