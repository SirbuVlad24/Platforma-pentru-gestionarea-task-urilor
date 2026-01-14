import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { detectTaskPriority } from "../../../lib/ai-priority";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Ye must be logged in to board this ship, sailor!" }, { status: 401 });
    }

    const { title, description, priority, projectId, deadline } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "Every mission needs a name, Captain! What shall we call it?" },
        { status: 400 }
      );
    }

    // Check permissions: Global admin or project admin (if projectId is provided)
    const isGlobalAdmin = session.user.role === "ADMIN";
    let isProjectAdmin = false;

    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { admins: true },
      });

      if (!project) {
        return NextResponse.json({ error: "This ship doesn't exist in the fleet, Captain!" }, { status: 404 });
      }

      isProjectAdmin = project.admins.some((admin) => admin.userId === session.user.id);
    }

    if (!isGlobalAdmin && !isProjectAdmin && projectId) {
      return NextResponse.json(
        { error: "Only the Captain can log missions for this ship, ye scallywag!" },
        { status: 403 }
      );
    }

    // Auto-detect priority from description using AI when description is provided
    // Priority from form is used only if description is empty
    let finalPriority = priority;
    if (description && description.trim().length > 0) {
      // Always use AI when description exists, ignore manual priority selection
      const aiPriority = await detectTaskPriority(description);
      finalPriority = aiPriority;
    } else if (!finalPriority) {
      finalPriority = "MEDIUM";
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        priority: finalPriority,
        projectId: projectId || null,
        deadline: deadline ? new Date(deadline) : null,
      },
      include: {
        assignedUsers: true,
      },
    });

    return NextResponse.json({ task });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong on the ship, Captain! Check the logs!" },
      { status: 500 }
    );
  }
}
