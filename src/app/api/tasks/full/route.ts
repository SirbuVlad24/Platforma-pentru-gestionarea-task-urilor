import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id;
    const isGlobalAdmin = session.user.role === "ADMIN";

    // Get projects where user is admin (if not global admin)
    let projectIds: number[] = [];
    if (!isGlobalAdmin) {
      const userProjects = await prisma.projectsAdmins.findMany({
        where: { userId },
        select: { projectId: true },
      });
      projectIds = userProjects.map((p) => p.projectId);
    }

    // Build where clause: global admins see all, project admins see only their projects
    const whereClause = isGlobalAdmin
      ? {}
      : {
          OR: [
            { projectId: null }, // Tasks without project
            { projectId: { in: projectIds } }, // Tasks from user's projects
          ],
        };

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        assignedUsers: {
          include: {
            user: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            admins: {
              select: { userId: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
