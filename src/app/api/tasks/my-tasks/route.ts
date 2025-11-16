import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const tasks = await prisma.task.findMany({
      where: {
        assignedUsers: {
          some: { userId },
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        assignedUsers: {
          include: { user: true }, 
        },
      },
    });

    return NextResponse.json({ tasks });
  } catch (error: unknown) {
    console.error("GET /my-tasks error:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
