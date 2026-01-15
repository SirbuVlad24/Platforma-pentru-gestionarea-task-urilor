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
      select: {
        id: true,
        title: true,
        description: true,
        completed: true,
        priority: true,
        status: true,
        createdAt: true,
        deadline: true,
        projectId: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedUsers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
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
