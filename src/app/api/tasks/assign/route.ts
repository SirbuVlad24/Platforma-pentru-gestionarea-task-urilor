import { Prisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { userId, taskId } = await req.json();

    if (!userId || !taskId) {
      return NextResponse.json({ error: "userId and taskId required" }, { status: 400 });
    }

    // Check permissions: Global admin or project admin of the task's project
    const isGlobalAdmin = session.user.role === "ADMIN";

    // Get task with project info
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: { admins: true },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    let isProjectAdmin = false;
    if (task.project) {
      isProjectAdmin = task.project.admins.some((admin) => admin.userId === session.user.id);
    }

    if (!isGlobalAdmin && !isProjectAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Only project admins or global admins can assign tasks" },
        { status: 403 }
      );
    }

    const assignment = await prisma.usersOnTasks.create({
      data: { userId, taskId },
    });

    return NextResponse.json(assignment);

  } catch (error: unknown) {

    // Prisma duplicate entry (user deja asignat)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "User already assigned to this task" },
          { status: 409 }
        );
      }
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
