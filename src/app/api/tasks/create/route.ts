import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { detectTaskPriority } from "../../../lib/ai-priority";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { title, description, priority, projectId } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
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
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }

      isProjectAdmin = project.admins.some((admin) => admin.userId === session.user.id);
    }

    if (!isGlobalAdmin && !isProjectAdmin && projectId) {
      return NextResponse.json(
        { error: "Forbidden - Only project admins or global admins can create tasks for projects" },
        { status: 403 }
      );
    }

    // Auto-detect priority from description using AI when description is provided
    // Priority from form is used only if description is empty
    let finalPriority = priority;
    if (description && description.trim().length > 0) {
      // Always use AI when description exists, ignore manual priority selection
      console.log("🔍 Detecting priority from description using AI...");
      const aiPriority = await detectTaskPriority(description);
      finalPriority = aiPriority;
      console.log(`✅ AI detected priority: ${aiPriority} for description: "${description.substring(0, 50)}..."`);
    } else if (!finalPriority) {
      finalPriority = "MEDIUM";
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        priority: finalPriority,
        projectId: projectId || null,
      },
    });

    return NextResponse.json({ task });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
