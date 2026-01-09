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
          include: { admins: true },
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
        { error: "Only the Captain can unassign missions from the crew, ye scallywag!" },
        { status: 403 }
      );
    }

    await prisma.usersOnTasks.deleteMany({
      where: { userId, taskId },
    });

    return NextResponse.json({ message: "Crew member removed from mission successfully!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong on the ship, Captain! Check the logs!" }, { status: 500 });
  }
}
