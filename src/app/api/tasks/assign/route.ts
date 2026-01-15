import { Prisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Ye must be logged in to board this ship, sailor!" }, { status: 401 });
    }

    const { userId, taskId } = await req.json();

    if (!userId || !taskId) {
      return NextResponse.json({ error: "Ahoy! We need both the crew member and mission details, Captain!" }, { status: 400 });
    }

    // Check permissions: Global admin or project admin of the task's project
    const isGlobalAdmin = session.user.role === "ADMIN";

    // Get task with project info
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: { 
            admins: true,
            members: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "This mission doesn't exist in the logbook, Captain!" }, { status: 404 });
    }

    let isProjectAdmin = false;
    if (task.project) {
      isProjectAdmin = task.project.admins.some((admin) => admin.userId === session.user.id);
    }

    if (!isGlobalAdmin && !isProjectAdmin) {
      return NextResponse.json(
        { error: "Only the Captain can assign missions to the crew, ye scallywag!" },
        { status: 403 }
      );
    }

    // Check if task belongs to a project
    if (task.projectId) {
      // Verify if the user to be assigned is a member or admin of the project
      const isUserProjectMember = task.project!.members.some((member) => member.userId === userId);
      const isUserProjectAdmin = task.project!.admins.some((admin) => admin.userId === userId);

      if (!isUserProjectMember && !isUserProjectAdmin) {
        return NextResponse.json(
          { error: "This mate doesn't belong to this ship! They must be part of the crew first!" },
          { status: 400 }
        );
      }
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
          { error: "This crew member is already assigned to this mission, Captain!" },
          { status: 409 }
        );
      }
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Something went wrong on the ship, Captain! Check the logs!" }, { status: 500 });
  }
}
