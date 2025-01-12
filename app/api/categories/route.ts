import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.categories.findMany();
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Invalid category name." },
        { status: 400 }
      );
    }

    // Check if the category already exists
    const existingCategory = await prisma.categories.findFirst({
      where: { name: name.trim() },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category already exists." },
        { status: 409 }
      );
    }

    const newCategory = await prisma.categories.create({
      data: { name: name.trim() },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category." },
      { status: 500 }
    );
  }
}
