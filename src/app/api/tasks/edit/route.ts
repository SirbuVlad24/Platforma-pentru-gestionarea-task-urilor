import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function PUT(req: Request) {
  try {
    const { id, title, priority, completed } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title,
        priority,
        completed,
      },
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
