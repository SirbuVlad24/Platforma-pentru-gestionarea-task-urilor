import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, taskId } = await req.json();

    if (!userId || !taskId) {
      return NextResponse.json({ error: "userId and taskId required" }, { status: 400 });
    }

    await prisma.usersOnTasks.deleteMany({
      where: { userId, taskId },
    });

    return NextResponse.json({ message: "User removed from task" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
