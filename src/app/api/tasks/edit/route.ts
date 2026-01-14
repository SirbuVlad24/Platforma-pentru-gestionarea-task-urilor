import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { detectTaskPriority } from "../../../lib/ai-priority";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Ye must be logged in to board this ship, sailor!" }, { status: 401 });
    }

    if (!session.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only the Captain can edit the logbook, ye scallywag!" }, { status: 403 });
    }

    const { id, title, description, priority, status, completed, projectId, deadline } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "We need the mission ID to update the logbook, Captain!" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (completed !== undefined) updateData.completed = completed;
    if (projectId !== undefined) updateData.projectId = projectId;
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;

    // If description is updated and priority is not explicitly set, auto-detect priority
    if (description !== undefined && priority === undefined) {
      const detectedPriority = await detectTaskPriority(description);
      updateData.priority = detectedPriority;
    } else if (priority !== undefined) {
      updateData.priority = priority;
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignedUsers: true,
      },
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong on the ship, Captain! Check the logs!" },
      { status: 500 }
    );
  }
}
