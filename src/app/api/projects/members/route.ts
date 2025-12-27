import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Get members of projects where user is admin
 * GET /api/projects/members?projectId=123
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectIdParam = searchParams.get("projectId");
    const projectId = projectIdParam ? parseInt(projectIdParam) : null;

    const userId = session.user.id;
    const isGlobalAdmin = session.user.role === "ADMIN";

    if (projectId) {
      // Get members of specific project
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          members: {
            include: {
              user: { select: { id: true, email: true, name: true, role: true } },
            },
          },
          admins: {
            include: {
              user: { select: { id: true, email: true, name: true, role: true } },
            },
          },
        },
      });

      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }

      // Check if user is project admin or global admin
      const isProjectAdmin = project.admins.some((admin) => admin.userId === userId);

      if (!isGlobalAdmin && !isProjectAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Return all members (including admins)
      const allMembers = [
        ...project.members.map((m) => ({
          ...m.user,
          isProjectAdmin: project.admins.some((a) => a.userId === m.user.id),
        })),
      ];

      return NextResponse.json({ members: allMembers });
    } else {
      // Get all projects where user is admin and their members
      const userProjects = await prisma.projectsAdmins.findMany({
        where: { userId },
        include: {
          project: {
            include: {
              members: {
                include: {
                  user: { select: { id: true, email: true, name: true, role: true } },
                },
              },
              admins: {
                include: {
                  user: { select: { id: true, email: true, name: true, role: true } },
                },
              },
            },
          },
        },
      });

      // Collect all unique members from all projects
      const allMembersMap = new Map();
      userProjects.forEach((up) => {
        up.project.members.forEach((member) => {
          if (!allMembersMap.has(member.user.id)) {
            allMembersMap.set(member.user.id, {
              ...member.user,
              isProjectAdmin: up.project.admins.some((a) => a.userId === member.user.id),
            });
          }
        });
      });

      return NextResponse.json({ members: Array.from(allMembersMap.values()) });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

